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
const EXTENSION_VERSION = (() => {
  try {
    return String(chrome?.runtime?.getManifest?.()?.version || "").trim();
  } catch {
    return "";
  }
})();
const SERVER_AUTH_PASS_KEY = "OT4ET_SERVER_AUTH_PASS";
const SERVER_AUTH_ALLOWED_KEY = "OT4ET_SERVER_AUTH_ALLOWED";
const SERVER_AUTH_CHECKED_KEY = "OT4ET_SERVER_AUTH_CHECKED_AT";
const EXTENSION_UNLOCKED_KEY = "OT4ET_EXTENSION_UNLOCKED";
const EXTENSION_UNLOCKED_AT_KEY = "OT4ET_EXTENSION_UNLOCKED_AT";
const EXTENSION_AUTH_CHECKED_AT_KEY = "OT4ET_EXTENSION_AUTH_CHECKED_AT";

const MONITOR_STORAGE_KEY = "OT4ET_MONITOR_COUNTERS";
const KYIV_TIME_ZONE = "Europe/Kiev";
const MONITOR_RESET_HOUR = 2; // local Kyiv hour when counters roll over
const KYIV_STANDARD_OFFSET_MINUTES = 120;
const KYIV_SUMMER_OFFSET_MINUTES = 180;
let monitorCounts = {
  date: null,
  hourRecord: 50,
  buckets: Object.create(null),
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

function withExtensionVersionHeader(headers = {}) {
  const next = { ...(headers || {}) };
  if (EXTENSION_VERSION) {
    next["X-Extension-Version"] = EXTENSION_VERSION;
  }
  return next;
}

function sanitizeMonitorCounts(raw) {
  const today = getTodayKey();
  const fallbackRecord = Number.isFinite(Number(raw?.hourRecord))
    ? Math.max(50, Number(raw.hourRecord))
    : 50;
  if (!raw || typeof raw !== "object" || !raw.buckets || typeof raw.buckets !== "object") {
    return {
      date: today,
      hourRecord: fallbackRecord,
      buckets: Object.create(null),
    };
  }
  const date =
    typeof raw.date === "string" && raw.date.trim()
      ? raw.date.trim()
      : today;
  const buckets = Object.create(null);
  Object.entries(raw.buckets).forEach(([operatorId, value]) => {
    const normalizedOperatorId = normalizeMonitorOperatorId(operatorId);
    if (!normalizedOperatorId) return;
    buckets[normalizedOperatorId] = sanitizeMonitorBucket(value);
  });
  return {
    date,
    hourRecord: fallbackRecord,
    buckets,
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

function normalizeMonitorOperatorId(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  const normalized = digits || raw;
  const num = Number(normalized);
  if (!Number.isFinite(num) || num <= 0) return "";
  return String(Math.trunc(num));
}

function createEmptyMonitorBucket() {
  return {
    chat: 0,
    mail: 0,
    hourStart: getCurrentHourStartMs(),
    hourTotal: 0,
    hourChat: 0,
    hourMail: 0,
    hourHistory: [],
    profileStats: Object.create(null),
  };
}

function sanitizeMonitorBucket(raw) {
  const bucket = createEmptyMonitorBucket();
  if (!raw || typeof raw !== "object") {
    return bucket;
  }
  const chat = Number(raw.chat);
  const mail = Number(raw.mail);
  const hourStart = Number(raw.hourStart);
  const hourTotal = Number(raw.hourTotal);
  const hourChat = Number(raw.hourChat);
  const hourMail = Number(raw.hourMail);
  bucket.chat = Number.isFinite(chat) ? chat : 0;
  bucket.mail = Number.isFinite(mail) ? mail : 0;
  bucket.hourStart = Number.isFinite(hourStart) ? hourStart : getCurrentHourStartMs();
  bucket.hourTotal = Number.isFinite(hourTotal) ? hourTotal : 0;
  bucket.hourChat = Number.isFinite(hourChat) ? hourChat : 0;
  bucket.hourMail = Number.isFinite(hourMail) ? hourMail : 0;
  bucket.hourHistory = Array.isArray(raw.hourHistory)
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
  if (raw.profileStats && typeof raw.profileStats === "object") {
    Object.entries(raw.profileStats).forEach(([key, value]) => {
      if (!key) return;
      const chatCount = Number.isFinite(Number(value?.chat))
        ? Number(value.chat)
        : 0;
      const mailCount = Number.isFinite(Number(value?.mail))
        ? Number(value.mail)
        : 0;
      bucket.profileStats[String(key)] = { chat: chatCount, mail: mailCount };
    });
  }
  return bucket;
}

function getMonitorBuckets() {
  if (!monitorCounts.buckets || typeof monitorCounts.buckets !== "object") {
    monitorCounts.buckets = Object.create(null);
  }
  return monitorCounts.buckets;
}

function getMonitorBucket(operatorId, createIfMissing = true) {
  const normalizedOperatorId = normalizeMonitorOperatorId(operatorId);
  if (!normalizedOperatorId) return null;
  const buckets = getMonitorBuckets();
  if (!buckets[normalizedOperatorId] && createIfMissing) {
    buckets[normalizedOperatorId] = createEmptyMonitorBucket();
  }
  return buckets[normalizedOperatorId] || null;
}

function buildMonitorCountsPayload(operatorId) {
  const bucket = getMonitorBucket(operatorId, false) || createEmptyMonitorBucket();
  return {
    operatorId: normalizeMonitorOperatorId(operatorId),
    chat: Number(bucket.chat) || 0,
    mail: Number(bucket.mail) || 0,
    hourStart: Number(bucket.hourStart) || getCurrentHourStartMs(),
    hourTotal: Number(bucket.hourTotal) || 0,
    hourChat: Number(bucket.hourChat) || 0,
    hourMail: Number(bucket.hourMail) || 0,
    hourHistory: Array.isArray(bucket.hourHistory) ? bucket.hourHistory.slice() : [],
    hourRecord: Number(monitorCounts.hourRecord) || 50,
    profileStats:
      bucket.profileStats && typeof bucket.profileStats === "object"
        ? { ...bucket.profileStats }
        : {},
  };
}

function getProfileStatsMap(operatorId) {
  const bucket = getMonitorBucket(operatorId);
  if (!bucket) return null;
  if (!bucket.profileStats || typeof bucket.profileStats !== "object") {
    bucket.profileStats = Object.create(null);
  }
  return bucket.profileStats;
}

function incrementProfileStats(operatorId, kind, profileId, count = 1) {
  const delta =
    Number.isFinite(Number(count)) && Number(count) > 0
      ? Math.round(Number(count))
      : 1;
  const key =
    kind === "chat" || kind === "mail"
      ? normalizeProfileStatKey(profileId)
      : "unknown";
  const map = getProfileStatsMap(operatorId);
  if (!map) return;
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
    monitorCounts = {
      date: today,
      hourRecord: Number(monitorCounts.hourRecord) || 50,
      buckets: Object.create(null),
    };
    await persistMonitorCounts();
  }
  return monitorCounts;
}

async function ensureMonitorDate() {
  const today = getTodayKey();
  if (monitorCounts.date === today) return;
  monitorCounts = {
    date: today,
    hourRecord: Number(monitorCounts.hourRecord) || 50,
    buckets: Object.create(null),
  };
  await persistMonitorCounts();
}

async function resetMonitorCountsManual() {
  const today = getTodayKey();
  monitorCounts = {
    date: today,
    hourRecord: Number(monitorCounts.hourRecord) || 50,
    buckets: Object.create(null),
  };
  await persistMonitorCounts();
}

async function ensureMonitorHour(operatorId) {
  const bucket = getMonitorBucket(operatorId);
  if (!bucket) return;
  const currentStart = getCurrentHourStartMs();
  if (!Number.isFinite(Number(bucket.hourStart))) {
    bucket.hourStart = currentStart;
    bucket.hourTotal = Number.isFinite(Number(bucket.hourTotal))
      ? Number(bucket.hourTotal)
      : 0;
    bucket.hourChat = Number.isFinite(Number(bucket.hourChat))
      ? Number(bucket.hourChat)
      : 0;
    bucket.hourMail = Number.isFinite(Number(bucket.hourMail))
      ? Number(bucket.hourMail)
      : 0;
    if (!Array.isArray(bucket.hourHistory)) {
      bucket.hourHistory = [];
    }
    await persistMonitorCounts();
    return;
  }
  if (bucket.hourStart === currentStart) return;
  pushHourlyHistoryEntry(operatorId, bucket.hourStart);
  bucket.hourStart = currentStart;
  bucket.hourTotal = 0;
  bucket.hourChat = 0;
  bucket.hourMail = 0;
  await persistMonitorCounts();
}

function pushHourlyHistoryEntry(operatorId, startMs) {
  const bucket = getMonitorBucket(operatorId);
  if (!bucket) return;
  if (!Number.isFinite(startMs)) return;
  const total = Number(bucket.hourTotal) || 0;
  const chat = Number(bucket.hourChat) || 0;
  const mail = Number(bucket.hourMail) || 0;
  if (!total && !chat && !mail) return;
  if (!Array.isArray(bucket.hourHistory)) {
    bucket.hourHistory = [];
  }
  const HOUR_MS = 60 * 60 * 1000;
  bucket.hourHistory.push({
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

function notifyMonitorUpdate(operatorId) {
  const payload = {
    type: "monitor:update",
    operatorId: normalizeMonitorOperatorId(operatorId),
    counts: buildMonitorCountsPayload(operatorId),
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

async function incrementMonitorCounter(kind, operatorId, profileId, count = 1) {
  if (!monitorReadyPromise) {
    monitorReadyPromise = loadMonitorCounts();
  }
  await monitorReadyPromise;
  await ensureMonitorDate();
  const normalizedOperatorId = normalizeMonitorOperatorId(operatorId);
  if (!normalizedOperatorId) return false;
  await ensureMonitorHour(normalizedOperatorId);
  const bucket = getMonitorBucket(normalizedOperatorId);
  if (!bucket) return false;
  const delta =
    Number.isFinite(Number(count)) && Number(count) > 0
      ? Math.round(Number(count))
      : 1;
  if (kind === "chat") {
    bucket.chat += delta;
    bucket.hourChat = (bucket.hourChat || 0) + delta;
  } else if (kind === "mail") {
    bucket.mail += delta;
    bucket.hourMail = (bucket.hourMail || 0) + delta;
  } else {
    return false;
  }
  bucket.hourTotal += delta;
  incrementProfileStats(normalizedOperatorId, kind, profileId, delta);
  await persistMonitorCounts();
  notifyMonitorUpdate(normalizedOperatorId);
  return true;
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
            const res = await fetch(url, {
              method: "GET",
              headers: withExtensionVersionHeader(headers),
            });
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
            const res = await fetch(url, {
              method: "GET",
              headers: withExtensionVersionHeader(headers),
            });
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
        const operatorId = normalizeMonitorOperatorId(msg.operatorId);
        const rawCount = Number(msg.count);
        const count =
          Number.isFinite(rawCount) && rawCount > 0 ? Math.round(rawCount) : 1;
        const profileId =
          typeof msg.profileId === "string" && msg.profileId.trim()
            ? msg.profileId.trim()
            : "";
        if (!operatorId) {
          sendResponse({ ok: true, skipped: true });
          return;
        }
        await incrementMonitorCounter(kind, operatorId, profileId, count);
        sendResponse({ ok: true, counts: buildMonitorCountsPayload(operatorId), operatorId });
        return;
      }
      if (msg.type === "monitor:getCounts") {
        if (!monitorReadyPromise) {
          monitorReadyPromise = loadMonitorCounts();
        }
        await monitorReadyPromise;
        await ensureMonitorDate();
        const operatorId = normalizeMonitorOperatorId(msg.operatorId);
        if (!operatorId) {
          sendResponse({ ok: true, counts: buildMonitorCountsPayload(""), operatorId: "" });
          return;
        }
        await ensureMonitorHour(operatorId);
        sendResponse({ ok: true, counts: buildMonitorCountsPayload(operatorId), operatorId });
        return;
      }
      if (msg.type === "monitor:resetDay") {
        if (!monitorReadyPromise) {
          monitorReadyPromise = loadMonitorCounts();
        }
        await monitorReadyPromise;
        const operatorId = normalizeMonitorOperatorId(msg.operatorId);
        await resetMonitorCountsManual();
        if (operatorId) {
          notifyMonitorUpdate(operatorId);
        }
        sendResponse({ ok: true, counts: buildMonitorCountsPayload(operatorId), operatorId });
        return;
      }
      if (msg.type === "monitor:clear") {
        if (!monitorReadyPromise) {
          monitorReadyPromise = loadMonitorCounts();
        }
        await monitorReadyPromise;
        await resetMonitorCountsManual();
        const operatorId = normalizeMonitorOperatorId(msg.operatorId);
        if (operatorId) {
          notifyMonitorUpdate(operatorId);
        }
        sendResponse({ ok: true, counts: buildMonitorCountsPayload(operatorId), operatorId });
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
      chrome.contextMenus.create({
        id: "ot4et-replace-image",
        title: "ОТ4ЕТ: Заменить фото",
        contexts: ["image"],
        documentUrlPatterns: ["https://alpha.date/*"],
      });
      chrome.contextMenus.create({
        id: "ot4et-normalize-message-time",
        title: "ОТ4ЕТ: Нормализировать время",
        contexts: ["page"],
        documentUrlPatterns: ["https://alpha.date/*"],
      });
    });
  } catch {}
}

async function resetExtensionAuthStateForUpdate() {
  try {
    await chrome.storage.local.set({
      [EXTENSION_UNLOCKED_KEY]: false,
      [EXTENSION_UNLOCKED_AT_KEY]: 0,
      [EXTENSION_AUTH_CHECKED_AT_KEY]: 0,
      [SERVER_AUTH_PASS_KEY]: "",
      [SERVER_AUTH_ALLOWED_KEY]: false,
      [SERVER_AUTH_CHECKED_KEY]: 0,
    });
  } catch {}
}

chrome.runtime.onInstalled.addListener((details) => {
  setupContextMenu();
  if (details?.reason === "update") {
    resetExtensionAuthStateForUpdate().catch(() => {});
  }
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  try {
    const action = info.menuItemId;
    if (!tab?.id) return;
    if (
      action !== "ot4et-censor-selected-text" &&
      action !== "ot4et-delete-selected-text" &&
      action !== "ot4et-replace-image" &&
      action !== "ot4et-normalize-message-time"
    ) {
      return;
    }
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: async (actionType, oldSrc, newSrc) => {
        if (actionType === "ot4et-normalize-message-time") {
          const root = document.documentElement;
          const FLAG_KEY = "ot4etMessageDateNormalized";
          const DATE_SEL = '[data-testid="message-date"]';
          const nodes = Array.from(document.querySelectorAll(DATE_SEL));
          if (!nodes.length) return;

          const pad2 = (n) => String(Math.max(0, Number(n) || 0)).padStart(2, "0");
          const floorDay = (d) =>
            new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
          const formatNormalizedDateTime = (date, todayDayMs) => {
            if (!date || Number.isNaN(date.getTime())) return "";
            const hhmm = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
            const sameDay =
              Number.isFinite(Number(todayDayMs)) &&
              floorDay(date).getTime() === Number(todayDayMs);
            return sameDay
              ? hhmm
              : `${pad2(date.getDate())}/${pad2(date.getMonth() + 1)} ${hhmm}`;
          };
          const normalizeHourOffset = (deltaHours) => {
            let value = Number(deltaHours) || 0;
            while (value > 12) value -= 24;
            while (value < -12) value += 24;
            return value;
          };
          const buildNearestDate = (dd, mo, hh, mm, aroundDate = new Date()) => {
            const ref = aroundDate instanceof Date ? aroundDate : new Date();
            const years = [ref.getFullYear() - 1, ref.getFullYear(), ref.getFullYear() + 1];
            let best = null;
            for (const y of years) {
              const candidate = new Date(
                y,
                Number(mo) - 1,
                Number(dd),
                Number(hh),
                Number(mm),
                0,
                0
              );
              if (Number.isNaN(candidate.getTime())) continue;
              if (
                !best ||
                Math.abs(candidate.getTime() - ref.getTime()) <
                  Math.abs(best.getTime() - ref.getTime())
              ) {
                best = candidate;
              }
            }
            return best;
          };
          const getChatUidFromLocation = () => {
            try {
              const path = String(window.location.pathname || "");
              const match = path.match(/^\/(?:chat|letter)\/([^/?#]+)/i);
              return match && match[1] ? decodeURIComponent(match[1]) : "";
            } catch {
              return "";
            }
          };
          const parseWomanLocaltimeLabel = (raw) => {
            const text = String(raw || "").trim();
            const m = text.match(/(\d{2}):(\d{2})\s*\((\d{2})\/(\d{2})\)/);
            if (!m) return null;
            const hh = Number(m[1]);
            const mm = Number(m[2]);
            const dd = Number(m[3]);
            const mo = Number(m[4]);
            if (
              !Number.isFinite(hh) ||
              !Number.isFinite(mm) ||
              !Number.isFinite(dd) ||
              !Number.isFinite(mo)
            ) {
              return null;
            }
            return { hh, mm, dd, mo };
          };
          const parseMessageDateText = (raw) => {
            const text = String(raw || "").trim();
            if (!text) return null;
            const parseHourMinuteWithAmPm = (hhRaw, mmRaw, apRaw) => {
              let hh = Number(hhRaw);
              const mm = Number(mmRaw);
              if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
              const ap = String(apRaw || "").toLowerCase();
              if (ap) {
                hh = hh % 12;
                if (ap === "p") hh += 12;
              }
              return { hh, mm };
            };
            let m = text.match(/^(\d{2}):(\d{2})$/);
            if (m) return { kind: "time24", hh: Number(m[1]), mm: Number(m[2]) };
            m = text.match(/^(\d{1,2}):(\d{2})\s*([ap])(?:\.?m\.?)$/i);
            if (m) {
              const parsedTime = parseHourMinuteWithAmPm(m[1], m[2], m[3]);
              if (!parsedTime) return null;
              return { kind: "time12", hh: parsedTime.hh, mm: parsedTime.mm };
            }
            m = text.match(/^(\d{2})\/(\d{2})\s+(\d{2}):(\d{2})$/);
            if (m) {
              return {
                kind: "ddmm_slash",
                dd: Number(m[1]),
                mo: Number(m[2]),
                hh: Number(m[3]),
                mm: Number(m[4]),
              };
            }
            m = text.match(/^(\d{2})\.(\d{2})\s+(\d{2}):(\d{2})$/);
            if (m) {
              return {
                kind: "ddmm_dot",
                dd: Number(m[1]),
                mo: Number(m[2]),
                hh: Number(m[3]),
                mm: Number(m[4]),
              };
            }
            m = text.match(
              /^(\d{2})\/(\d{2})\s*\((\d{1,2}):(\d{2})(?:\s*([ap])(?:\.?m\.?))?\)$/i
            );
            if (m) {
              const parsedTime = parseHourMinuteWithAmPm(m[3], m[4], m[5]);
              if (!parsedTime) return null;
              return {
                kind: "ddmm_slash",
                dd: Number(m[1]),
                mo: Number(m[2]),
                hh: parsedTime.hh,
                mm: parsedTime.mm,
              };
            }
            m = text.match(
              /^(\d{2})\.(\d{2})\s*\((\d{1,2}):(\d{2})(?:\s*([ap])(?:\.?m\.?))?\)$/i
            );
            if (m) {
              const parsedTime = parseHourMinuteWithAmPm(m[3], m[4], m[5]);
              if (!parsedTime) return null;
              return {
                kind: "ddmm_dot",
                dd: Number(m[1]),
                mo: Number(m[2]),
                hh: parsedTime.hh,
                mm: parsedTime.mm,
              };
            }
            m = text.match(
              /^(\d{2})\/(\d{2})\s+(\d{1,2}):(\d{2})(?:\s*([ap])(?:\.?m\.?))?$/i
            );
            if (m) {
              const parsedTime = parseHourMinuteWithAmPm(m[3], m[4], m[5]);
              if (!parsedTime) return null;
              return {
                kind: "ddmm_slash",
                dd: Number(m[1]),
                mo: Number(m[2]),
                hh: parsedTime.hh,
                mm: parsedTime.mm,
              };
            }
            m = text.match(
              /^(\d{2})\.(\d{2})\s+(\d{1,2}):(\d{2})(?:\s*([ap])(?:\.?m\.?))?$/i
            );
            if (m) {
              const parsedTime = parseHourMinuteWithAmPm(m[3], m[4], m[5]);
              if (!parsedTime) return null;
              return {
                kind: "ddmm_dot",
                dd: Number(m[1]),
                mo: Number(m[2]),
                hh: parsedTime.hh,
                mm: parsedTime.mm,
              };
            }
            m = text.match(
              /^(today|today,|сегодня|сегодня,)\s+(\d{1,2}):(\d{2})(?:\s*([ap])(?:\.?m\.?))?$/i
            );
            if (m) {
              const parsedTime = parseHourMinuteWithAmPm(m[2], m[3], m[4]);
              if (!parsedTime) return null;
              return { kind: "word_day", hh: parsedTime.hh, mm: parsedTime.mm, dayOffset: 0 };
            }
            m = text.match(
              /^(yesterday|yesterday,|вчера|вчера,)\s+(\d{1,2}):(\d{2})(?:\s*([ap])(?:\.?m\.?))?$/i
            );
            if (m) {
              const parsedTime = parseHourMinuteWithAmPm(m[2], m[3], m[4]);
              if (!parsedTime) return null;
              return { kind: "word_day", hh: parsedTime.hh, mm: parsedTime.mm, dayOffset: -1 };
            }
            return null;
          };
          const resolveDateFromParts = (parsed, womanDate) => {
            if (!parsed) return null;
            if (parsed.kind === "ddmm_slash" || parsed.kind === "ddmm_dot") {
              return buildNearestDate(parsed.dd, parsed.mo, parsed.hh, parsed.mm, womanDate);
            }
            if (parsed.kind === "word_day" && Number.isFinite(parsed.dayOffset)) {
              const base = new Date(
                womanDate.getFullYear(),
                womanDate.getMonth(),
                womanDate.getDate(),
                parsed.hh,
                parsed.mm,
                0,
                0
              );
              base.setDate(base.getDate() + parsed.dayOffset);
              return base;
            }
            return new Date(
              womanDate.getFullYear(),
              womanDate.getMonth(),
              womanDate.getDate(),
              parsed.hh,
              parsed.mm,
              0,
              0
            );
          };
          const fetchChatHistoryDates = async (chatUid) => {
            const normalizedChatUid = String(chatUid || "").trim();
            if (!normalizedChatUid) return [];
            try {
              const token = String(window?.localStorage?.getItem?.("token") || "").trim();
              const headers = {
                accept: "application/json, text/plain, */*",
                "content-type": "application/json",
              };
              if (token) headers.authorization = `Bearer ${token}`;
              const response = await fetch("https://alpha.date/api/chatList/chatHistory", {
                method: "POST",
                credentials: "include",
                headers,
                body: JSON.stringify({ chat_id: normalizedChatUid, page: 1 }),
              });
              if (!response.ok) return [];
              const payload = await response.json().catch(() => null);
              const list = Array.isArray(payload?.response) ? payload.response : [];
              return list
                .map((row) => {
                  const iso = String(row?.date_created || row?.created_at || "").trim();
                  if (!iso) return null;
                  const parsed = new Date(iso);
                  return Number.isNaN(parsed.getTime()) ? null : parsed;
                })
                .filter(Boolean);
            } catch {
              return [];
            }
          };

          if (root?.dataset?.[FLAG_KEY] === "1") {
            let restored = 0;
            nodes.forEach((el) => {
              const original = el?.dataset?.ot4etOriginalDate;
              if (typeof original === "string" && original.length) {
                el.textContent = original;
                restored += 1;
              }
            });
            try {
              delete root.dataset[FLAG_KEY];
            } catch {
              root.dataset[FLAG_KEY] = "";
            }
            if (restored > 0) {
              return;
            }
            // Если флаг остался от старого DOM, но оригиналов уже нет,
            // сразу выполняем нормализацию в этот же клик.
          }

          const womanLabel = document.querySelector(".ot4et-woman-localtime");
          const womanTime = parseWomanLocaltimeLabel(womanLabel?.textContent || "");
          if (!womanTime) return;
          const now = new Date();
          const womanDate = buildNearestDate(
            womanTime.dd,
            womanTime.mo,
            womanTime.hh,
            womanTime.mm,
            now
          );
          if (!womanDate) return;
          const chatUid = getChatUidFromLocation();
          const historyDates = await fetchChatHistoryDates(chatUid);
          const parsedNodes = [];
          nodes.forEach((el) => {
            const currentText = String(el?.textContent || "").trim();
            if (!currentText) return;
            const source = el.dataset.ot4etOriginalDate || currentText;
            const parsed = parseMessageDateText(source);
            if (!parsed) return;
            parsedNodes.push({ el, currentText, parsed });
          });
          if (!parsedNodes.length) return;
          const localHour = now.getHours();
          const hourOffset = normalizeHourOffset(womanTime.hh - localHour);
          const womanDay = floorDay(womanDate).getTime();
          let changed = false;
          parsedNodes.forEach(({ el, currentText, parsed }, index) => {
            if (!el.dataset.ot4etOriginalDate) {
              el.dataset.ot4etOriginalDate = currentText;
            }
            const reverseIndex = parsedNodes.length - 1 - index;
            const historyDate =
              reverseIndex >= 0 && reverseIndex < historyDates.length
                ? historyDates[historyDates.length - 1 - reverseIndex]
                : null;
            const baseDate =
              historyDate && !Number.isNaN(historyDate.getTime())
                ? new Date(historyDate.getTime())
                : resolveDateFromParts(parsed, womanDate);
            if (!baseDate || Number.isNaN(baseDate.getTime())) return;
            const shifted = new Date(baseDate.getTime());
            shifted.setHours(shifted.getHours() + hourOffset);
            const formatted = formatNormalizedDateTime(shifted, womanDay);
            if (!formatted) return;
            el.textContent = formatted;
            changed = true;
          });
          if (changed) {
            root.dataset[FLAG_KEY] = "1";
          }
          return;
        }
        if (actionType === "ot4et-replace-image") {
          if (!oldSrc || !newSrc) return;
          const images = document.getElementsByTagName("img");
          for (const img of images) {
            if (img && img.src === oldSrc) {
              img.src = newSrc;
              img.srcset = "";
              img.style.objectFit = "cover";
            }
          }
          return;
        }
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
      args: [action, info?.srcUrl || "", chrome.runtime.getURL("icons/placeholder.png")],
    });
  } catch {}
});
