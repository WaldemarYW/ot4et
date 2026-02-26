// Default API config (optional). If you put your API key here,
// it will be visible to users who inspect the extension.
const DEFAULT_API_URLS = [
  "https://ot4et.pp.ua/api/count",
];
const DEFAULT_API_URL = DEFAULT_API_URLS[0];
const DEFAULT_TG_COUNT_URL = "https://ot4et.pp.ua/api/tg/count";
const LEGACY_API_URLS = new Set([
  "http://185.250.207.189:8080/api/count",
  "https://185.250.207.189:8080/api/count",
  "https://ai.185.250.207.189.sslip.io/api/count",
  "http://ai.185.250.207.189.sslip.io/api/count",
]);
function normalizeApiUrl(url) {
  return String(url || "").trim().replace(/\/+$/, "");
}
function normalizePreferredApiUrl(url) {
  const raw = normalizeApiUrl(url);
  if (!raw) return DEFAULT_API_URL;
  if (/185\.250\.207\.189|sslip\.io/i.test(raw)) {
    return DEFAULT_API_URL;
  }
  return raw;
}

function deriveTgCountUrl(url) {
  const normalized = normalizeApiUrl(url || "");
  if (!normalized) return DEFAULT_TG_COUNT_URL;
  try {
    const parsed = new URL(normalized);
    const path = parsed.pathname.replace(/\/+$/, "");
    if (path.endsWith("/api/count")) {
      parsed.pathname = path.slice(0, -"/count".length) + "/tg/count";
    } else if (path.endsWith("/api")) {
      parsed.pathname = `${path}/tg/count`;
    } else if (path.endsWith("/api/tg/count")) {
      parsed.pathname = path;
    } else {
      parsed.pathname = `${path}/api/tg/count`;
    }
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    if (normalized.endsWith("/api/count")) {
      return `${normalized.slice(0, -"/count".length)}/tg/count`;
    }
    if (normalized.endsWith("/api")) return `${normalized}/tg/count`;
    if (normalized.endsWith("/api/tg/count")) return normalized;
    return `${normalized}/api/tg/count`;
  }
}
const NORMALIZED_DEFAULT_API_URLS = new Set(
  DEFAULT_API_URLS.map((url) => normalizeApiUrl(url)).filter(Boolean)
);
const DEFAULT_API_KEY = "super-secret-key-123"; // e.g. "super-secret-key-123"

const MONITOR_STORAGE_KEY = "OT4ET_MONITOR_COUNTERS";
const KYIV_TIME_ZONE = "Europe/Kiev";
const MONITOR_RESET_HOUR = 2; // local Kyiv hour when counters roll over
const KYIV_STANDARD_OFFSET_MINUTES = 120;
const KYIV_SUMMER_OFFSET_MINUTES = 180;
let monitorCounts = {
  date: null,
  chat: 0,
  mail: 0,
  hourStart: null,
  hourTotal: 0,
  hourChat: 0,
  hourMail: 0,
  hourHistory: [],
  hourRecord: 50,
  profileStats: {},
};
let monitorReadyPromise = null;
let kyivDateFormatter = null;

function getLastSundayUtcDay(year, monthIndex) {
  try {
    const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0));
    const weekday = lastDay.getUTCDay();
    return lastDay.getUTCDate() - weekday;
  } catch {
    return 31;
  }
}

function getKyivDstBoundsUtc(year) {
  const marchSunday = getLastSundayUtcDay(year, 2);
  const octoberSunday = getLastSundayUtcDay(year, 9);
  const start = Date.UTC(year, 2, marchSunday, 1, 0, 0, 0);
  const end = Date.UTC(year, 9, octoberSunday, 1, 0, 0, 0);
  return { start, end };
}

function getKyivFallbackOffsetMinutes(date = new Date()) {
  try {
    const year = date.getUTCFullYear();
    const bounds = getKyivDstBoundsUtc(year);
    const ts = date.getTime();
    if (ts >= bounds.start && ts < bounds.end) {
      return KYIV_SUMMER_OFFSET_MINUTES;
    }
  } catch {}
  return KYIV_STANDARD_OFFSET_MINUTES;
}

function getKyivPartsFallback(date = new Date()) {
  const offsetMinutes = getKyivFallbackOffsetMinutes(date);
  const kyivDate = new Date(date.getTime() + offsetMinutes * 60 * 1000);
  return {
    year: String(kyivDate.getUTCFullYear()),
    month: String(kyivDate.getUTCMonth() + 1).padStart(2, "0"),
    day: String(kyivDate.getUTCDate()).padStart(2, "0"),
    hour: String(kyivDate.getUTCHours()).padStart(2, "0"),
    minute: String(kyivDate.getUTCMinutes()).padStart(2, "0"),
    second: String(kyivDate.getUTCSeconds()).padStart(2, "0"),
  };
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function addDaysUtc(y, m, d, delta) {
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return {
    y: dt.getUTCFullYear(),
    m: dt.getUTCMonth() + 1,
    d: dt.getUTCDate(),
  };
}

function getMonitorDayParts(date = new Date()) {
  const parts = getKyivParts(date);
  const fallback = new Date(date.getTime());
  let y = Number(parts.year) || fallback.getUTCFullYear();
  let m = Number(parts.month) || fallback.getUTCMonth() + 1;
  let d = Number(parts.day) || fallback.getUTCDate();
  const hh = Number(parts.hour);
  if (Number.isFinite(hh) && hh < MONITOR_RESET_HOUR) {
    const prev = addDaysUtc(y, m, d, -1);
    y = prev.y;
    m = prev.m;
    d = prev.d;
  }
  return { y, m, d };
}

function getTodayKey() {
  const { y, m, d } = getMonitorDayParts();
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function getKyivFormatter() {
  if (kyivDateFormatter) return kyivDateFormatter;
  try {
    kyivDateFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: KYIV_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    kyivDateFormatter = null;
  }
  return kyivDateFormatter;
}

function getKyivParts(date = new Date()) {
  const formatter = getKyivFormatter();
  if (formatter && typeof formatter.formatToParts === "function") {
    const out = Object.create(null);
    try {
      for (const part of formatter.formatToParts(date)) {
        if (part.type === "literal") continue;
        out[part.type] = part.value;
      }
      return out;
    } catch {
      // fall through to manual fallback
    }
  }
  return getKyivPartsFallback(date);
}

function storageGet(key) {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.get(key, (data) => {
        resolve(data ? data[key] : null);
      });
    } catch {
      resolve(null);
    }
  });
}

function storageSet(key, value) {
  return new Promise((resolve) => {
    try {
      chrome.storage.local.set({ [key]: value }, () => resolve());
    } catch {
      resolve();
    }
  });
}

function sanitizeMonitorCounts(raw) {
  const today = getTodayKey();
  if (!raw || typeof raw !== "object") {
    return {
      date: today,
      chat: 0,
      mail: 0,
      hourStart: getCurrentHourStartMs(),
      hourTotal: 0,
      hourChat: 0,
      hourMail: 0,
      hourHistory: [],
      hourRecord: 50,
      profileStats: {},
    };
  }
  const date =
    typeof raw.date === "string" && raw.date.trim()
      ? raw.date.trim()
      : today;
  const chat = Number.isFinite(Number(raw.chat)) ? Number(raw.chat) : 0;
  const mail = Number.isFinite(Number(raw.mail)) ? Number(raw.mail) : 0;
  const storedHourStart = Number(raw.hourStart);
  const hourStart = Number.isFinite(storedHourStart)
    ? storedHourStart
    : getCurrentHourStartMs();
  const hourTotal = Number.isFinite(Number(raw.hourTotal))
    ? Number(raw.hourTotal)
    : 0;
  const hourChat = Number.isFinite(Number(raw.hourChat))
    ? Number(raw.hourChat)
    : 0;
  const hourMail = Number.isFinite(Number(raw.hourMail))
    ? Number(raw.hourMail)
    : 0;
  const hourHistory = Array.isArray(raw.hourHistory)
    ? raw.hourHistory
        .map((entry) => ({
          start: Number(entry?.start) || null,
          end: Number(entry?.end) || null,
          total: Number(entry?.total) || 0,
          chat: Number(entry?.chat) || 0,
          mail: Number(entry?.mail) || 0,
        }))
        .filter((entry) => Number.isFinite(entry.start))
    : [];
  const hourRecord = Number.isFinite(Number(raw.hourRecord))
    ? Math.max(50, Number(raw.hourRecord))
    : 50;
  const profileStats = Object.create(null);
  if (raw.profileStats && typeof raw.profileStats === "object") {
    Object.entries(raw.profileStats).forEach(([key, value]) => {
      if (!key) return;
      const chatCount = Number.isFinite(Number(value?.chat))
        ? Number(value.chat)
        : 0;
      const mailCount = Number.isFinite(Number(value?.mail))
        ? Number(value.mail)
        : 0;
      profileStats[String(key)] = { chat: chatCount, mail: mailCount };
    });
  }
  return {
    date,
    chat,
    mail,
    hourStart,
    hourTotal,
    hourChat,
    hourMail,
    hourHistory,
    hourRecord,
    profileStats,
  };
}

function getCurrentHourStartMs() {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  return now.getTime();
}

function normalizeProfileStatKey(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "unknown";
  const digits = raw.replace(/\D/g, "");
  return digits || raw || "unknown";
}

function getProfileStatsMap() {
  if (!monitorCounts.profileStats || typeof monitorCounts.profileStats !== "object") {
    monitorCounts.profileStats = {};
  }
  return monitorCounts.profileStats;
}

function incrementProfileStats(kind, profileId, count = 1) {
  const delta =
    Number.isFinite(Number(count)) && Number(count) > 0
      ? Math.round(Number(count))
      : 1;
  const key =
    kind === "chat" || kind === "mail"
      ? normalizeProfileStatKey(profileId)
      : "unknown";
  const map = getProfileStatsMap();
  if (!map[key]) {
    map[key] = { chat: 0, mail: 0 };
  }
  if (kind === "chat") map[key].chat += delta;
  else if (kind === "mail") map[key].mail += delta;
}

async function persistMonitorCounts() {
  await storageSet(MONITOR_STORAGE_KEY, monitorCounts);
}

async function loadMonitorCounts() {
  const stored = await storageGet(MONITOR_STORAGE_KEY);
  monitorCounts = sanitizeMonitorCounts(stored);
  const today = getTodayKey();
  if (monitorCounts.date !== today) {
    const prevRecord = Number(monitorCounts.hourRecord) || 50;
    monitorCounts = {
      date: today,
      chat: 0,
      mail: 0,
      hourStart: getCurrentHourStartMs(),
      hourTotal: 0,
      hourChat: 0,
      hourMail: 0,
      hourHistory: [],
      hourRecord: prevRecord,
      profileStats: {},
    };
    await persistMonitorCounts();
  }
  return monitorCounts;
}

async function ensureMonitorDate() {
  const today = getTodayKey();
  if (monitorCounts.date === today) return;
  const prevRecord = Number(monitorCounts.hourRecord) || 50;
  monitorCounts = {
    date: today,
    chat: 0,
    mail: 0,
    hourStart: getCurrentHourStartMs(),
    hourTotal: 0,
    hourChat: 0,
    hourMail: 0,
    hourHistory: [],
    hourRecord: prevRecord,
    profileStats: {},
  };
  await persistMonitorCounts();
}

async function resetMonitorCountsManual() {
  const today = getTodayKey();
  const prevRecord = Number(monitorCounts.hourRecord) || 50;
  monitorCounts = {
    date: today,
    chat: 0,
    mail: 0,
    hourStart: getCurrentHourStartMs(),
    hourTotal: 0,
    hourChat: 0,
    hourMail: 0,
    hourHistory: [],
    hourRecord: prevRecord,
    profileStats: {},
  };
  await persistMonitorCounts();
}

async function ensureMonitorHour() {
  const currentStart = getCurrentHourStartMs();
  if (!Number.isFinite(Number(monitorCounts.hourStart))) {
    monitorCounts.hourStart = currentStart;
    monitorCounts.hourTotal = Number.isFinite(Number(monitorCounts.hourTotal))
      ? Number(monitorCounts.hourTotal)
      : 0;
    monitorCounts.hourChat = Number.isFinite(Number(monitorCounts.hourChat))
      ? Number(monitorCounts.hourChat)
      : 0;
    monitorCounts.hourMail = Number.isFinite(Number(monitorCounts.hourMail))
      ? Number(monitorCounts.hourMail)
      : 0;
    if (!Array.isArray(monitorCounts.hourHistory)) {
      monitorCounts.hourHistory = [];
    }
    await persistMonitorCounts();
    return;
  }
  if (monitorCounts.hourStart === currentStart) return;
  pushHourlyHistoryEntry(monitorCounts.hourStart);
  monitorCounts.hourStart = currentStart;
  monitorCounts.hourTotal = 0;
  monitorCounts.hourChat = 0;
  monitorCounts.hourMail = 0;
  await persistMonitorCounts();
}

function pushHourlyHistoryEntry(startMs) {
  if (!Number.isFinite(startMs)) return;
  const total = Number(monitorCounts.hourTotal) || 0;
  const chat = Number(monitorCounts.hourChat) || 0;
  const mail = Number(monitorCounts.hourMail) || 0;
  if (!total && !chat && !mail) return;
  if (!Array.isArray(monitorCounts.hourHistory)) {
    monitorCounts.hourHistory = [];
  }
  const HOUR_MS = 60 * 60 * 1000;
  monitorCounts.hourHistory.push({
    start: startMs,
    end: startMs + HOUR_MS,
    total,
    chat,
    mail,
  });
  if (total > (monitorCounts.hourRecord || 50)) {
    monitorCounts.hourRecord = total;
  }
}

function notifyMonitorUpdate() {
  const payload = {
    type: "monitor:update",
    counts: monitorCounts,
  };
  try {
    chrome.runtime.sendMessage(payload, () => {
      void chrome.runtime.lastError;
    });
  } catch {
    // ignore
  }
  try {
    chrome.tabs.query({ url: "https://alpha.date/*" }, (tabs) => {
      const lastErr = chrome.runtime.lastError;
      if (lastErr || !Array.isArray(tabs)) return;
      tabs.forEach((tab) => {
        if (!tab?.id) return;
        try {
          chrome.tabs.sendMessage(tab.id, payload, () => {
            void chrome.runtime.lastError;
          });
        } catch {
          // ignore delivery errors per tab
        }
      });
    });
  } catch {
    // ignore
  }
}

async function incrementMonitorCounter(kind, profileId, count = 1) {
  if (!monitorReadyPromise) {
    monitorReadyPromise = loadMonitorCounts();
  }
  await monitorReadyPromise;
  await ensureMonitorHour();
  await ensureMonitorDate();
  const delta =
    Number.isFinite(Number(count)) && Number(count) > 0
      ? Math.round(Number(count))
      : 1;
  if (kind === "chat") {
    monitorCounts.chat += delta;
    monitorCounts.hourChat = (monitorCounts.hourChat || 0) + delta;
  } else if (kind === "mail") {
    monitorCounts.mail += delta;
    monitorCounts.hourMail = (monitorCounts.hourMail || 0) + delta;
  } else {
    return;
  }
  monitorCounts.hourTotal += delta;
  incrementProfileStats(kind, profileId, delta);
  await persistMonitorCounts();
  notifyMonitorUpdate();
}

monitorReadyPromise = loadMonitorCounts();

// Toggle panel on extension icon click
chrome.action.onClicked.addListener((tab) => {
  try {
    if (!tab || !tab.id) return;
    const url = String(tab.url || "");
    // Only attempt to message tabs that match our content script scope
    if (!/^https?:\/\/alpha\.date\//i.test(url)) {
      return;
    }
    chrome.tabs.sendMessage(tab.id, { type: "toggle" }, () => {
      // Swallow "no receiver" errors on unrelated pages
      void chrome.runtime.lastError;
    });
  } catch (e) {
    // no-op
  }
});

// Proxy API requests to avoid page CORS/mixed-content restrictions
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    try {
      if (!msg || !msg.type) return;
      if (msg.type === "api:count") {
        const maleId = String(msg.maleId || "").trim();
        const rawApiUrl = normalizePreferredApiUrl(String(msg.apiUrl || "").trim());
        const normalizedApiUrl = normalizeApiUrl(rawApiUrl);
        const isDefaultApi =
          normalizedApiUrl && NORMALIZED_DEFAULT_API_URLS.has(normalizedApiUrl);
        const useDefaultChain =
          !normalizedApiUrl ||
          LEGACY_API_URLS.has(normalizedApiUrl) ||
          isDefaultApi;
        const candidateBases = useDefaultChain ? [DEFAULT_API_URL] : [rawApiUrl];
        const apiKey = String(msg.apiKey || DEFAULT_API_KEY).trim();
        if (!maleId || !/^\d{10}$/.test(maleId)) {
          sendResponse({ ok: false, error: "bad_id" });
          return;
        }
        const headers = {};
        if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
        let lastNetworkError = null;
        for (const base of candidateBases) {
          const trimmedBase = normalizeApiUrl(base);
          if (!trimmedBase) continue;
          const url = trimmedBase.includes("?")
            ? `${trimmedBase}&male_id=${encodeURIComponent(maleId)}`
            : `${trimmedBase}?male_id=${encodeURIComponent(maleId)}`;
          try {
            const res = await fetch(url, { method: "GET", headers });
            if (!res.ok) {
              const text = await res.text().catch(() => "");
              sendResponse({
                ok: false,
                status: res.status,
                error: text || "http_error",
              });
              return;
            }
            const data = await res.json().catch(() => ({}));
            const normalizedData =
              data && typeof data === "object" ? data : {};
            const parsedCount = Number(normalizedData.count);
            const safeCount = Number.isFinite(parsedCount) ? parsedCount : 0;
            sendResponse({
              ok: true,
              data: { ...normalizedData, count: safeCount },
            });
            return;
          } catch (err) {
            lastNetworkError = err;
            if (!useDefaultChain) break;
            // otherwise try next fallback
          }
        }
        const errorMsg =
          (lastNetworkError &&
            typeof lastNetworkError.message === "string" &&
            lastNetworkError.message.trim()) ||
          "fetch_failed";
        sendResponse({ ok: false, error: errorMsg });
        return;
      }
      if (msg.type === "api:tg_count") {
        const maleId = String(msg.maleId || "").trim();
        const rawApiUrl = normalizePreferredApiUrl(String(msg.apiUrl || "").trim());
        const normalizedApiUrl = normalizeApiUrl(rawApiUrl);
        const isDefaultApi =
          normalizedApiUrl && NORMALIZED_DEFAULT_API_URLS.has(normalizedApiUrl);
        const useDefaultChain =
          !normalizedApiUrl ||
          LEGACY_API_URLS.has(normalizedApiUrl) ||
          isDefaultApi;
        const derivedUrl = deriveTgCountUrl(rawApiUrl);
        const candidateBases = useDefaultChain
          ? [DEFAULT_TG_COUNT_URL, derivedUrl]
          : [derivedUrl];
        const apiKey = String(msg.apiKey || DEFAULT_API_KEY).trim();
        if (!maleId || !/^\d{10}$/.test(maleId)) {
          sendResponse({ ok: false, error: "bad_id" });
          return;
        }
        const headers = {};
        if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;
        let lastNetworkError = null;
        for (const base of candidateBases) {
          const trimmedBase = normalizeApiUrl(base);
          if (!trimmedBase) continue;
          const url = trimmedBase.includes("?")
            ? `${trimmedBase}&male_id=${encodeURIComponent(maleId)}`
            : `${trimmedBase}?male_id=${encodeURIComponent(maleId)}`;
          try {
            const res = await fetch(url, { method: "GET", headers });
            if (!res.ok) {
              const text = await res.text().catch(() => "");
              sendResponse({
                ok: false,
                status: res.status,
                error: text || "http_error",
              });
              return;
            }
            const data = await res.json().catch(() => ({}));
            const normalizedData =
              data && typeof data === "object" ? data : {};
            const parsedCount = Number(normalizedData.count);
            const safeCount = Number.isFinite(parsedCount) ? parsedCount : 0;
            sendResponse({
              ok: true,
              data: { ...normalizedData, count: safeCount },
            });
            return;
          } catch (err) {
            lastNetworkError = err;
            if (!useDefaultChain) break;
          }
        }
        const errorMsg =
          (lastNetworkError &&
            typeof lastNetworkError.message === "string" &&
            lastNetworkError.message.trim()) ||
          "fetch_failed";
        sendResponse({ ok: false, error: errorMsg });
        return;
      }
      if (msg.type === "monitor:record") {
        const kind = msg.kind === "chat" || msg.kind === "mail" ? msg.kind : null;
        if (!kind) {
          sendResponse({ ok: false, error: "bad_kind" });
          return;
        }
        const rawCount = Number(msg.count);
        const count =
          Number.isFinite(rawCount) && rawCount > 0 ? Math.round(rawCount) : 1;
        const profileId =
          typeof msg.profileId === "string" && msg.profileId.trim()
            ? msg.profileId.trim()
            : "";
        await incrementMonitorCounter(kind, profileId, count);
        sendResponse({ ok: true });
        return;
      }
      if (msg.type === "monitor:getCounts") {
        if (!monitorReadyPromise) {
          monitorReadyPromise = loadMonitorCounts();
        }
        await monitorReadyPromise;
        await ensureMonitorDate();
        await ensureMonitorHour();
        sendResponse({ ok: true, counts: monitorCounts });
        return;
      }
      if (msg.type === "monitor:resetDay") {
        if (!monitorReadyPromise) {
          monitorReadyPromise = loadMonitorCounts();
        }
        await monitorReadyPromise;
        await ensureMonitorDate();
        notifyMonitorUpdate();
        sendResponse({ ok: true, counts: monitorCounts });
        return;
      }
      if (msg.type === "monitor:clear") {
        if (!monitorReadyPromise) {
          monitorReadyPromise = loadMonitorCounts();
        }
        await monitorReadyPromise;
        await resetMonitorCountsManual();
        notifyMonitorUpdate();
        sendResponse({ ok: true, counts: monitorCounts });
        return;
      }
      sendResponse({ ok: false, error: "unsupported_request" });
    } catch (e) {
      sendResponse({ ok: false, error: String((e && e.message) || e) });
    }
  })();
  return true; // keep the channel open for async sendResponse
});

function setupContextMenu() {
  try {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: "ot4et-censor-selected-text",
        title: "ОТ4ЕТ: Заменить на *",
        contexts: ["selection"],
      });
      chrome.contextMenus.create({
        id: "ot4et-delete-selected-text",
        title: "ОТ4ЕТ: Удалить выделенное",
        contexts: ["selection"],
      });
    });
  } catch {}
}

chrome.runtime.onInstalled.addListener(() => setupContextMenu());

chrome.contextMenus.onClicked.addListener((info, tab) => {
  try {
    const action = info.menuItemId;
    if (!tab?.id) return;
    if (
      action !== "ot4et-censor-selected-text" &&
      action !== "ot4et-delete-selected-text"
    ) {
      return;
    }
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (actionType) => {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount || selection.isCollapsed) return;
        const range = selection.getRangeAt(0);
        if (actionType === "ot4et-censor-selected-text") {
          const stars = "*".repeat(selection.toString().length);
          range.deleteContents();
          range.insertNode(document.createTextNode(stars));
        } else if (actionType === "ot4et-delete-selected-text") {
          range.deleteContents();
        }
      },
      args: [action],
    });
  } catch {}
});
