import {
  CITY_TZ_OVERRIDES,
  COUNTRY_TZ_CAPITALS,
  COUNTRY_TZ_DEFAULTS,
  CYRILLIC_TO_LATIN,
} from "./timezones.js";

const API_URL = "https://alpha.date/api/chatList/userDetail";
const CHAT_HISTORY_URL = "https://alpha.date/api/chatList/chatHistory";
const PROFILE_URL = "https://alpha.date/api/operator/myProfile";
const WOMAN_PROFILE_URL = "https://alpha.date/api/operator/profile";
const MAN_PROFILE_URL = "https://alpha.date/api/operator/myProfile";
const MAX_CHAT_HISTORY_PAGES = 50;
const DEFAULT_TIMEFRAME = "24h";
const TIMEFRAME_OPTIONS = [
  {
    value: "24h",
    label: "За 24 часа",
    fileLabel: "24 часа",
    durationMs: 24 * 60 * 60 * 1000,
  },
  {
    value: "7d",
    label: "За неделю",
    fileLabel: "неделю",
    durationMs: 7 * 24 * 60 * 60 * 1000,
  },
  {
    value: "30d",
    label: "За месяц",
    fileLabel: "месяц",
    durationMs: 30 * 24 * 60 * 60 * 1000,
  },
  {
    value: "all",
    label: "За весь чат",
    fileLabel: "весь чат",
    durationMs: null,
  },
];
const ID_SANITIZE_RE = /\D/g;
const MAILBOX_URL = "https://alpha.date/api/mailbox/mails";
const CHAT_ID_CACHE_KEY = "OT4ET_CHAT_ID_CACHE";
const CHAT_ID_CACHE_TTL_MS = 30 * 60 * 1000;
const CITY_TZ_CACHE = new Map();
const CITY_TIME_FORMATTERS = new Map();
const PROFILE_DETAILS_CACHE = new Map();

const chatIdCache = new Map();
let chatIdCacheLoaded = false;

function loadChatIdCache() {
  if (chatIdCacheLoaded) return;
  chatIdCacheLoaded = true;
  try {
    const raw = window.sessionStorage?.getItem?.(CHAT_ID_CACHE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return;
    const now = Date.now();
    for (const [manId, entry] of Object.entries(data)) {
      if (!entry || typeof entry !== "object") continue;
      const chatId = String(entry.chatId || "").trim();
      const ts = Number(entry.ts) || 0;
      if (!chatId) continue;
      if (ts && now - ts > CHAT_ID_CACHE_TTL_MS) continue;
      chatIdCache.set(String(manId), { chatId, ts });
    }
  } catch {}
}

function persistChatIdCache() {
  try {
    const payload = {};
    for (const [manId, entry] of chatIdCache.entries()) {
      payload[manId] = entry;
    }
    window.sessionStorage?.setItem?.(CHAT_ID_CACHE_KEY, JSON.stringify(payload));
  } catch {}
}

function saveChatIdForMan(manId, chatId) {
  const normalizedManId = sanitizeId(manId);
  const normalizedChatId = String(chatId || "").trim();
  if (!normalizedManId || !normalizedChatId) return;
  loadChatIdCache();
  chatIdCache.set(normalizedManId, { chatId: normalizedChatId, ts: Date.now() });
  persistChatIdCache();
}

function getChatIdForMan(manId) {
  const normalizedManId = sanitizeId(manId);
  if (!normalizedManId) return "";
  loadChatIdCache();
  const entry = chatIdCache.get(normalizedManId);
  if (!entry || !entry.chatId) return "";
  if (entry.ts && Date.now() - entry.ts > CHAT_ID_CACHE_TTL_MS) {
    chatIdCache.delete(normalizedManId);
    persistChatIdCache();
    return "";
  }
  return String(entry.chatId).trim();
}

function getManCacheKey(participants) {
  return (
    sanitizeId(participants?.man?.id) ||
    sanitizeId(participants?.headerMeta?.senderExternalId) ||
    sanitizeId(participants?.headerMeta?.recipientExternalId) ||
    ""
  );
}

function getUidFromLocation() {
  try {
    const href = String(window.location.href || "");
    const noHash = href.split("#")[0] || href;
    const noQuery = noHash.split("?")[0] || noHash;
    const match = noQuery.match(/\/([^/]+)\/?$/);
    if (match && match[1]) return match[1];
  } catch {
    return "";
  }
  return "";
}

function getAuthToken() {
  try {
    const raw = window.localStorage?.getItem?.("token");
    return typeof raw === "string" ? raw.trim() : "";
  } catch {
    return "";
  }
}

function clearMenu(menu) {
  while (menu.firstChild) {
    menu.removeChild(menu.firstChild);
  }
}

function renderMessage(menu, text, variant = "muted") {
  clearMenu(menu);
  const message = document.createElement("div");
  message.className = `user-info-message ${variant}`;
  message.textContent = text;
  menu.appendChild(message);
}

function normalizeCityName(value) {
  const raw = String(value ?? "").trim().toLowerCase();
  if (!raw) return "";
  return raw
    .replace(/ё/g, "е")
    .replace(/[.,/\\]+/g, " ")
    .replace(/[-–—]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function transliterateCyrillic(value) {
  let out = "";
  for (const char of String(value ?? "")) {
    const lower = char.toLowerCase();
    if (CYRILLIC_TO_LATIN[lower] === undefined) {
      out += char;
    } else {
      out += CYRILLIC_TO_LATIN[lower];
    }
  }
  return out;
}

function getTimeZoneByCity(city) {
  const normalized = normalizeCityName(city);
  if (!normalized) return "";
  if (CITY_TZ_CACHE.has(normalized)) {
    return CITY_TZ_CACHE.get(normalized) || "";
  }
  if (CITY_TZ_OVERRIDES.has(normalized)) {
    const tz = CITY_TZ_OVERRIDES.get(normalized);
    CITY_TZ_CACHE.set(normalized, tz);
    return tz || "";
  }
  if (normalized.includes("/")) {
    try {
      const tz = city.trim();
      Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
      CITY_TZ_CACHE.set(normalized, tz);
      return tz;
    } catch {}
  }

  const transliterated = normalizeCityName(transliterateCyrillic(normalized));
  const tokens = new Set([normalized, transliterated].filter(Boolean));
  if (typeof Intl === "undefined" || typeof Intl.supportedValuesOf !== "function") {
    CITY_TZ_CACHE.set(normalized, "");
    return "";
  }

  try {
    const zones = Intl.supportedValuesOf("timeZone");
    for (const zone of zones) {
      const last = zone.split("/").pop() || zone;
      const normalizedLast = normalizeCityName(last.replace(/_/g, " "));
      if (tokens.has(normalizedLast)) {
        CITY_TZ_CACHE.set(normalized, zone);
        return zone;
      }
    }
  } catch {}

  CITY_TZ_CACHE.set(normalized, "");
  return "";
}

function getTimeZoneByCountry(code) {
  const key = String(code ?? "").trim().toUpperCase();
  if (!key) return "";
  return COUNTRY_TZ_CAPITALS.get(key) || COUNTRY_TZ_DEFAULTS.get(key) || "";
}

function getCityTimeFormatter(timeZone) {
  if (CITY_TIME_FORMATTERS.has(timeZone)) {
    return CITY_TIME_FORMATTERS.get(timeZone) || null;
  }
  let formatter = null;
  try {
    formatter = new Intl.DateTimeFormat("ru-RU", {
      timeZone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    formatter = null;
  }
  CITY_TIME_FORMATTERS.set(timeZone, formatter);
  return formatter;
}

function formatCityDateTime(timeZone, date = new Date()) {
  const formatter = getCityTimeFormatter(timeZone);
  if (!formatter) return "";
  if (typeof formatter.formatToParts === "function") {
    try {
      const parts = formatter.formatToParts(date);
      const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
      const datePart = `${map.day}.${map.month}.${map.year}`;
      const timePart = `${map.hour}:${map.minute}`;
      return `${datePart} ${timePart}`;
    } catch {}
  }
  return formatter.format(date).replace(",", "");
}

function getLocationDateTimeLabel(city, countryCode) {
  const normalizedCity = String(city ?? "").trim();
  let timeZone = "";
  let label = "";
  if (normalizedCity) {
    timeZone = getTimeZoneByCity(normalizedCity);
    if (timeZone) {
      label = normalizedCity;
    }
  }
  if (!timeZone) {
    const code = String(countryCode ?? "").trim().toUpperCase();
    timeZone = getTimeZoneByCountry(code);
    if (timeZone) {
      label = code || "Страна";
    }
  }
  if (!timeZone) return "";
  const now = formatCityDateTime(timeZone);
  if (!now) return "";
  return `Время (${label}): ${now}`;
}

function parseCountryCodeFromImage(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const match = raw.match(/\/([a-z]{2})(?:\.\w+)?$/i);
  return match ? match[1].toUpperCase() : "";
}

function getTimeframeOption(value) {
  return (
    TIMEFRAME_OPTIONS.find((option) => option.value === value) ||
    TIMEFRAME_OPTIONS[0]
  );
}

function sanitizeId(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(ID_SANITIZE_RE, "");
  return digits || raw;
}

function isLikelyChatId(value) {
  const val = String(value || "").trim();
  if (!val) return false;
  if (/^[a-z0-9-]{8,}$/i.test(val) && val.includes("-")) return true;
  if (/^\d{6,}$/i.test(val)) return true;
  return false;
}

function resolveChatId(participants) {
  const manId = getManCacheKey(participants);
  const fromHeader = String(participants?.headerMeta?.headerId || "").trim();
  if (isLikelyChatId(fromHeader)) {
    if (manId) saveChatIdForMan(manId, fromHeader);
    return fromHeader;
  }
  const fromUrl = getUidFromLocation();
  if (isLikelyChatId(fromUrl)) {
    if (manId) saveChatIdForMan(manId, fromUrl);
    return fromUrl;
  }
  if (manId) {
    const cached = getChatIdForMan(manId);
    if (cached) {
      saveChatIdForMan(manId, cached);
      return cached;
    }
  }
  return "";
}

function getMailAttachment(message) {
  if (!message || typeof message !== "object") return null;
  if (message.mail && typeof message.mail === "object") {
    return { mail: message.mail, attachment: message };
  }
  const raw =
    message.attachments ??
    message.attachment ??
    message.mail_attachments ??
    message.mailAttachments ??
    message.mail_attachment ??
    message.mailAttachment ??
    null;
  const attachments = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
    ? Object.values(raw)
    : [];
  for (const item of attachments) {
    if (!item || typeof item !== "object") continue;
    const mail =
      item.mail ||
      item.data?.mail ||
      item.payload?.mail ||
      item.mail_attachment ||
      item.mailAttachment;
    if (mail && typeof mail === "object") {
      return { mail, attachment: item };
    }
  }
  return null;
}

function parseNameAge(str) {
  const raw0 = String(str || "").trim();
  if (!raw0) return { name: "", age: "" };
  const raw = raw0.replace(/\u00A0/g, " ").replace(/\s+/g, " ");
  const commaRe = /^(.*?),\s*(1[4-9]|[2-9]\d)(?:\D|$)/;
  const match = raw.match(commaRe);
  let age = "";
  let name = raw;
  if (match) {
    name = (match[1] || "").trim();
    age = match[2] || "";
  } else {
    const ageRe = /(?:^|[\s,()\-—·:]+)(1[4-9]|[2-9]\d)(?=\D|$)/;
    const mm = raw.match(ageRe);
    if (mm) {
      age = mm[1];
      name = raw.slice(0, mm.index).trim();
    }
  }
  name = name
    .replace(/[ ,|·\-—:]+$/, "")
    .replace(/[,;]\s*(возраст|age|вік)\s*$/i, "")
    .replace(/\((возраст|age|вік)\)$/i, "")
    .trim();
  return { name, age };
}

function readHeaderAttr(header, attr) {
  if (!header) return "";
  const camel = attr.replace(/_([a-z])/g, (_, chr) => chr.toUpperCase());
  const dash = `data-${attr.replace(/_/g, "-")}`;
  const candidates = [
    header.getAttribute(attr),
    header.getAttribute(dash),
    header?.dataset?.[camel],
  ];
  for (const value of candidates) {
    const sanitized = sanitizeId(value);
    if (sanitized) return sanitized;
  }
  return "";
}

function getChatParticipants() {
  const header = document.querySelector('[data-testid="chat-header"]');
  const scope = header || document;
  const manRaw = scope
    ?.querySelector?.('[data-testid="man-name"]')
    ?.textContent?.trim();
  const womanRaw = scope
    ?.querySelector?.('[data-testid="woman-name"]')
    ?.textContent?.trim();
  const manIdRaw = scope
    ?.querySelector?.('[data-testid="man-external_id"]')
    ?.textContent;
  const womanIdRaw = scope
    ?.querySelector?.('[data-testid="woman-external_id"]')
    ?.textContent;

  const manBase = parseNameAge(manRaw);
  const womanBase = parseNameAge(womanRaw);

  const man = {
    name: manBase.name || "Мужчина",
    age: manBase.age || "",
    id: sanitizeId(manIdRaw),
    extraIds: [],
  };
  const woman = {
    name: womanBase.name || "Девушка",
    age: womanBase.age || "",
    id: sanitizeId(womanIdRaw),
    extraIds: [],
  };

  const senderExternalId = readHeaderAttr(header, "sender_external_id");
  const recipientExternalId = readHeaderAttr(header, "recipient_external_id");
  const siteAttr =
    readHeaderAttr(header, "site_id") ||
    readHeaderAttr(header, "siteId") ||
    readHeaderAttr(header, "site_code") ||
    readHeaderAttr(header, "siteCode") ||
    readHeaderAttr(header, "site");

  if (senderExternalId) {
    const sanitized = senderExternalId;
    if (sanitized === man.id) {
      man.extraIds.push(sanitized);
    } else if (sanitized === woman.id) {
      woman.extraIds.push(sanitized);
    }
  }

  if (recipientExternalId) {
    const sanitized = recipientExternalId;
    if (sanitized === man.id) {
      man.extraIds.push(sanitized);
    } else if (sanitized === woman.id) {
      woman.extraIds.push(sanitized);
    }
  }

  const headerId =
    readHeaderAttr(header, "chat_id") ||
    readHeaderAttr(header, "chat_uid") ||
    readHeaderAttr(header, "id");

  const participants = {
    man,
    woman,
    siteId: siteAttr,
    headerMeta: {
      senderExternalId,
      recipientExternalId,
      headerId,
      senderIdRaw: senderExternalId,
      recipientIdRaw: recipientExternalId,
      headerElement: header,
    },
  };

  const manKey = getManCacheKey(participants);
  if (isLikelyChatId(headerId) && manKey) {
    saveChatIdForMan(manKey, headerId);
  }

  return participants;
}

function parseMessageTimestamp(message) {
  if (!message || typeof message !== "object") return null;
  const candidates = [
    message.created_at,
    message.createdAt,
    message.created_on,
    message.createdOn,
    message.date_created,
    message.dateCreated,
    message.message_time,
    message.created_at_timestamp,
    message.timestamp,
    message.time,
  ];
  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null || candidate === "") {
      continue;
    }
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      const ms = candidate < 1e12 ? candidate * 1000 : candidate;
      if (Number.isFinite(ms)) return ms;
      continue;
    }
    const str = String(candidate).trim();
    if (!str) continue;
    const ms = new Date(str).getTime();
    if (!Number.isNaN(ms)) return ms;
  }
  const mailAttachment = getMailAttachment(message);
  if (mailAttachment?.mail) {
    const mail = mailAttachment.mail;
    const mailCandidates = [
      mail.date_created,
      mail.dateCreated,
      mail.created_at,
      mail.createdAt,
      mail.sent_at,
      mail.sentAt,
      mail.timestamp,
    ];
    for (const candidate of mailCandidates) {
      if (candidate === undefined || candidate === null || candidate === "") {
        continue;
      }
      if (typeof candidate === "number" && Number.isFinite(candidate)) {
        const ms = candidate < 1e12 ? candidate * 1000 : candidate;
        if (Number.isFinite(ms)) return ms;
        continue;
      }
      const str = String(candidate).trim();
      if (!str) continue;
      const ms = new Date(str).getTime();
      if (!Number.isNaN(ms)) return ms;
    }
  }
  return null;
}

function normalizeHtmlText(raw) {
  if (raw === undefined || raw === null) return "";
  const str = String(raw);
  if (!str) return "";
  const replaced = str
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<li>/gi, "\n• ")
    .replace(/<\/(div|li|ul|ol)>/gi, "\n");
  const temp = document.createElement("div");
  temp.innerHTML = replaced;
  const text = temp.textContent || temp.innerText || "";
  temp.remove();
  return text.replace(/\r?\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function buildParticipantIndex(participants) {
  const index = new Map();
  const register = (id, role, name) => {
    const sanitized = sanitizeId(id);
    if (!sanitized || index.has(sanitized)) return;
    index.set(sanitized, { role, name });
  };
  if (participants?.man) {
    register(participants.man.id, "man", participants.man.name || "Мужчина");
    if (Array.isArray(participants.man.extraIds)) {
      for (const id of participants.man.extraIds) {
        register(id, "man", participants.man.name || "Мужчина");
      }
    }
  }
  if (participants?.woman) {
    register(
      participants.woman.id,
      "woman",
      participants.woman.name || "Девушка"
    );
    if (Array.isArray(participants.woman.extraIds)) {
      for (const id of participants.woman.extraIds) {
        register(id, "woman", participants.woman.name || "Девушка");
      }
    }
  }
  return index;
}

function resolveMessageAuthor(message, participantIndex) {
  const tryIds = (candidates) => {
    for (const candidate of candidates) {
      const sanitized = sanitizeId(candidate);
      if (!sanitized) continue;
      if (participantIndex.has(sanitized)) {
        return participantIndex.get(sanitized);
      }
    }
    return null;
  };

  const senderCandidates = [
    message?.sender_external_id,
    message?.senderExternalId,
    message?.sender_id,
    message?.senderId,
    message?.from_external_id,
    message?.fromExternalId,
  ];
  const recipientCandidates = [
    message?.recipient_external_id,
    message?.recipientExternalId,
    message?.recipient_id,
    message?.recipientId,
    message?.to_external_id,
    message?.toExternalId,
  ];

  const mailAttachment = getMailAttachment(message);
  if (mailAttachment?.mail && typeof mailAttachment.mail === "object") {
    const mail = mailAttachment.mail;
    senderCandidates.push(
      mail.sender_external_id,
      mail.senderExternalId,
      mail.sender_id,
      mail.senderId,
      mail.female_id,
      mail.femaleId,
      mail.from_external_id,
      mail.fromExternalId,
      mail.sender_internal_id,
      mail.senderInternalId
    );
    recipientCandidates.push(
      mail.recipient_external_id,
      mail.recipientExternalId,
      mail.recipient_id,
      mail.recipientId,
      mail.male_id,
      mail.maleId,
      mail.to_external_id,
      mail.toExternalId,
      mail.recipient_internal_id,
      mail.recipientInternalId
    );
  }

  const senderMatch = tryIds(senderCandidates);
  if (senderMatch) return senderMatch;

  const recipientMatch = tryIds(recipientCandidates);
  if (recipientMatch) return recipientMatch;

  const fallbackId =
    sanitizeId(senderCandidates[0]) || sanitizeId(recipientCandidates[0]);
  return {
    role: "unknown",
    name: fallbackId ? `ID ${fallbackId}` : "Неизвестно",
  };
}

function formatDateTime(ms) {
  if (!Number.isFinite(ms)) return "-";
  const date = new Date(ms);
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatRegistrationDate(value) {
  if (value === undefined || value === null || value === "") return "";
  if (typeof value === "number" && Number.isFinite(value)) {
    const ms = value < 1e12 ? value * 1000 : value;
    const d = new Date(ms);
    if (Number.isNaN(d.getTime())) return "";
    return `${String(d.getDate()).padStart(2, "0")}.${String(
      d.getMonth() + 1
    ).padStart(2, "0")}.${d.getFullYear()}`;
  }
  const str = String(value).trim();
  if (!str) return "";
  const num = Number(str);
  if (Number.isFinite(num)) return formatRegistrationDate(num);
  const date = new Date(str);
  if (Number.isNaN(date.getTime())) return str;
  return `${String(date.getDate()).padStart(2, "0")}.${String(
    date.getMonth() + 1
  ).padStart(2, "0")}.${date.getFullYear()}`;
}

export async function fetchFullProfileDetails({ userId, role, token, signal }) {
  const cacheKey = `${role}:${userId}`;
  const cached = PROFILE_DETAILS_CACHE.get(cacheKey);
  if (cached) {
    const { data, timestamp } = cached;
    if (Date.now() - timestamp < 60 * 60 * 1000) {
      return data;
    }
    PROFILE_DETAILS_CACHE.delete(cacheKey);
  }

  const url =
    role === "woman"
      ? `${WOMAN_PROFILE_URL}?user_id=${encodeURIComponent(userId)}`
      : `${MAN_PROFILE_URL}?user_id=${encodeURIComponent(
          userId
        )}&activeProfile=false`;

  const headers = {
    Authorization: `Bearer ${token}`,
    accept: "application/json, text/plain, */*",
  };

  let response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers,
      signal,
      credentials: "include",
    });
  } catch {
    throw new Error("Не удалось выполнить запрос профиля");
  }

  if (!response.ok) {
    throw new Error(`Ошибка ${response.status}`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Не удалось прочитать ответ сервера");
  }

  let about = "";
  let seeking = "";

  if (role === "woman") {
    about = data?.result?.profile?.about || data?.profile?.about || data?.about || "";
    seeking =
      data?.result?.profile?.seeking ||
      data?.profile?.seeking ||
      data?.seeking ||
      "";
  } else {
    about =
      data?.user_reference?.summary ||
      data?.user_info?.user_reference?.summary ||
      data?.response?.user_reference?.summary ||
      data?.response?.user_info?.user_reference?.summary ||
      data?.summary ||
      data?.profile?.summary ||
      "";
    seeking =
      data?.user_reference?.looking ||
      data?.user_info?.user_reference?.looking ||
      data?.response?.user_reference?.looking ||
      data?.response?.user_info?.user_reference?.looking ||
      data?.looking ||
      data?.profile?.looking ||
      "";
  }

  const result = {
    about: String(about || "").trim(),
    seeking: String(seeking || "").trim(),
  };

  PROFILE_DETAILS_CACHE.set(cacheKey, {
    data: result,
    timestamp: Date.now(),
  });

  return result;
}

function findCreatedAtDeep(input, maxDepth = 6) {
  const queue = [{ value: input, depth: 0 }];
  while (queue.length) {
    const { value, depth } = queue.shift();
    if (!value || depth > maxDepth) continue;
    if (Array.isArray(value)) {
      for (const item of value) queue.push({ value: item, depth: depth + 1 });
      continue;
    }
    if (typeof value !== "object") continue;
    if ("created_at" in value || "createdAt" in value) {
      const raw = value.created_at ?? value.createdAt;
      if (raw !== undefined && raw !== null && raw !== "") return raw;
    }
    for (const next of Object.values(value)) {
      if (next && typeof next === "object") {
        queue.push({ value: next, depth: depth + 1 });
      }
    }
  }
  return "";
}


function buildFileName({ participants, periodLabel, type = "chat" }) {
  const manName = String(participants?.man?.name || "Мужчина");
  const womanName = String(participants?.woman?.name || "Девушка");
  const prefix = type === "mail" ? "Письма" : "Чат";
  const safe = (value) =>
    String(value || "")
      .replace(/[<>:"/\\|?*\u0000-\u001F]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  const base = `${prefix} между ${safe(manName)} и ${safe(womanName)} за ${safe(
    periodLabel || "период"
  )}`.replace(/\s+/g, " ");
  return `${base}.txt`;
}

function buildTranscript({
  participants,
  messages,
  periodLabel,
  from,
  to,
  participantIndex,
}) {
  const manName = participants?.man?.name || "Мужчина";
  const womanName = participants?.woman?.name || "Девушка";
  const headerLines = [
    `Чат между ${manName} и ${womanName}`,
    `Период: ${periodLabel || "не указан"}`,
  ];
  if (Number.isFinite(from) && Number.isFinite(to)) {
    headerLines.push(
      `Диапазон: ${formatDateTime(from)} — ${formatDateTime(to)}`
    );
  }
  const lines = [...headerLines, ""];
  for (const message of messages) {
    const ts = parseMessageTimestamp(message);
    const author = resolveMessageAuthor(message, participantIndex);
    const body =
      normalizeHtmlText(
        message?.message_content ??
          message?.content ??
          message?.text ??
          message?.message
      ) || "";
    const renderedBody = body || "(без текста)";
    lines.push(
      `[${formatDateTime(ts)}] ${author?.name || "Неизвестно"}: ${renderedBody}`
    );
  }
  return lines.join("\n");
}

function buildMailTranscript({
  participants,
  messages,
  periodLabel,
  from,
  to,
  participantIndex,
}) {
  const manName = participants?.man?.name || "Мужчина";
  const womanName = participants?.woman?.name || "Девушка";
  const headerLines = [
    `Письма между ${manName} и ${womanName}`,
    `Период: ${periodLabel || "не указан"}`,
  ];
  if (Number.isFinite(from) && Number.isFinite(to)) {
    headerLines.push(
      `Диапазон: ${formatDateTime(from)} — ${formatDateTime(to)}`
    );
  }
  const lines = [...headerLines, ""];
  for (const message of messages) {
    const ts = parseMessageTimestamp(message);
    const author = resolveMessageAuthor(message, participantIndex);
    const mailAttachment = getMailAttachment(message);
    const mail = mailAttachment?.mail || {};
    const title =
      normalizeHtmlText(
        mail.title ??
          mail.subject ??
          message?.title ??
          message?.subject ??
          message?.mail_title ??
          message?.mailTitle
      ) || "";
    const body =
      normalizeHtmlText(
        mail.message_content ??
          mail.body ??
          mail.content ??
          message?.body ??
          message?.content ??
          message?.message_content ??
          message?.message
      ) || "";
    const renderedTitle = title ? `Тема: ${title}\n` : "";
    const renderedBody = body || "(без текста)";
    lines.push(
      `[${formatDateTime(ts)}] ${author?.name || "Неизвестно"}\n${renderedTitle}${renderedBody}`
    );
    lines.push("");
  }
  return lines.join("\n").trim();
}

function downloadTextFile({ filename, content }) {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function requestChatHistoryPage({ chatId, token, page, signal }) {
  const headers = {
    accept: "application/json, text/plain, */*",
    "content-type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const payload = { chat_id: chatId, page };
  let response;
  try {
    response = await fetch(CHAT_HISTORY_URL, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new Error("Не удалось выполнить запрос истории чата");
  }
  if (!response.ok) {
    throw new Error(`Ошибка ${response.status}`);
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Не удалось прочитать историю чата");
  }
  const messages = Array.isArray(data?.response)
    ? data.response
    : Array.isArray(data?.data)
    ? data.data
    : [];
  return { messages, meta: data };
}

function extractPagination(meta) {
  if (!meta || typeof meta !== "object") return null;
  if (meta.pagination && typeof meta.pagination === "object") {
    return meta.pagination;
  }
  if (meta.meta && typeof meta.meta === "object") {
    return meta.meta;
  }
  return meta;
}

function analyzePagination(pagination, currentPage) {
  const result = {
    stop: false,
    nextPage: null,
    hasInfo: false,
  };
  if (!pagination || typeof pagination !== "object") {
    return result;
  }
  const toNumber = (value) => {
    if (value === undefined || value === null || value === "") return null;
    const num = Number.parseInt(value, 10);
    return Number.isFinite(num) ? num : null;
  };

  const nextCandidates = [
    pagination.next_page,
    pagination.nextPage,
    pagination.next,
    pagination.next_index,
    pagination.nextIndex,
    pagination.next_page_number,
    pagination.nextPageNumber,
  ];
  for (const candidate of nextCandidates) {
    if (candidate === undefined) continue;
    result.hasInfo = true;
    if (candidate === null) {
      result.stop = true;
      return result;
    }
    const next = toNumber(candidate);
    if (Number.isFinite(next)) {
      if (next <= currentPage) {
        result.stop = true;
        return result;
      }
      result.nextPage = next;
      return result;
    }
  }

  const nextUrlCandidates = [
    pagination.next_page_url,
    pagination.nextPageUrl,
    pagination.next_url,
    pagination.nextUrl,
    pagination.next_page_link,
    pagination.nextPageLink,
  ];
  for (const candidate of nextUrlCandidates) {
    if (candidate === undefined) continue;
    result.hasInfo = true;
    if (candidate === null) {
      result.stop = true;
      return result;
    }
    if (String(candidate).trim()) {
      result.nextPage = currentPage + 1;
      return result;
    }
  }

  const flagCandidates = [
    pagination.has_next,
    pagination.hasNext,
    pagination.more,
    pagination.has_more,
    pagination.hasMore,
  ];
  for (const candidate of flagCandidates) {
    if (candidate === undefined) continue;
    result.hasInfo = true;
    if (candidate === false) {
      result.stop = true;
      return result;
    }
    if (candidate === true) {
      result.nextPage = currentPage + 1;
      return result;
    }
  }

  const totalCandidates = [
    pagination.total_pages,
    pagination.totalPages,
    pagination.last_page,
    pagination.lastPage,
    pagination.max_page,
    pagination.maxPage,
    pagination.page_count,
    pagination.pageCount,
  ];
  for (const candidate of totalCandidates) {
    if (candidate === undefined) continue;
    const total = toNumber(candidate);
    if (!Number.isFinite(total)) continue;
    result.hasInfo = true;
    const current =
      toNumber(pagination.current_page) ??
      toNumber(pagination.currentPage) ??
      toNumber(pagination.page) ??
      toNumber(pagination.page_number) ??
      toNumber(pagination.pageNumber) ??
      currentPage;
    if ((current || currentPage) >= total) {
      result.stop = true;
      return result;
    }
    result.nextPage = currentPage + 1;
    return result;
  }

  return result;
}

function reachedTimeframeBoundary(messages, sinceTs) {
  if (!Array.isArray(messages) || !messages.length) return false;
  if (!Number.isFinite(sinceTs)) return false;
  let minTs = Infinity;
  for (const message of messages) {
    const ts = parseMessageTimestamp(message);
    if (Number.isFinite(ts) && ts < minTs) {
      minTs = ts;
    }
  }
  if (!Number.isFinite(minTs)) return false;
  return minTs <= sinceTs;
}

async function fetchChatMessages({ chatId, token, since, signal }) {
  const collected = [];
  let page = 1;
  while (page <= MAX_CHAT_HISTORY_PAGES) {
    const { messages, meta } = await requestChatHistoryPage({
      chatId,
      token,
      page,
      signal,
    });
    if (Array.isArray(messages) && messages.length) {
      collected.push(...messages);
    }
    const boundaryReached =
      Number.isFinite(since) && reachedTimeframeBoundary(messages, since);
    const pagination = extractPagination(meta);
    const paginationInfo = analyzePagination(pagination, page);
    const hasMessages = Array.isArray(messages) && messages.length > 0;
    const shouldStop =
      !hasMessages ||
      boundaryReached ||
      (paginationInfo.hasInfo && paginationInfo.stop);
    if (shouldStop) {
      break;
    }
    const nextPage =
      paginationInfo.nextPage && paginationInfo.nextPage > page
        ? paginationInfo.nextPage
        : page + 1;
    if (nextPage <= page) {
      break;
    }
    page = nextPage;
  }
  return collected;
}

async function requestMailboxPage({ userId, manId, token, page, signal }) {
  const headers = {
    accept: "application/json, text/plain, */*",
    "content-type": "application/json",
    Authorization: `Bearer ${token}`,
  };
  const payload = {
    user_id: userId,
    folder: "dialog",
    man_id: manId,
    page,
  };
  let response;
  try {
    response = await fetch(MAILBOX_URL, {
      method: "POST",
      credentials: "include",
      headers,
      body: JSON.stringify(payload),
      signal,
    });
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new Error("Не удалось выполнить запрос писем");
  }
  if (!response.ok) {
    throw new Error(`Ошибка ${response.status}`);
  }
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Не удалось прочитать письма");
  }
  const candidates = [
    data?.response?.mails,
    data?.response?.items,
    data?.response?.data,
    data?.response,
    data?.mails,
    data?.data,
  ];
  let messages = [];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      messages = candidate;
      break;
    }
  }
  if (!Array.isArray(messages)) {
    messages = [];
  }
  return { messages, meta: data };
}

async function fetchMailboxMessages({
  userId,
  manId,
  token,
  since,
  signal,
}) {
  const collected = [];
  let page = 1;
  while (page <= MAX_CHAT_HISTORY_PAGES) {
    const { messages, meta } = await requestMailboxPage({
      userId,
      manId,
      token,
      page,
      signal,
    });
    if (Array.isArray(messages) && messages.length) {
      collected.push(...messages);
    }
    const boundaryReached =
      Number.isFinite(since) && reachedTimeframeBoundary(messages, since);
    const pagination = extractPagination(meta);
    const paginationInfo = analyzePagination(pagination, page);
    const hasMessages = Array.isArray(messages) && messages.length > 0;
    const shouldStop =
      !hasMessages ||
      boundaryReached ||
      (paginationInfo.hasInfo && paginationInfo.stop);
    if (shouldStop) {
      break;
    }
    const nextPage =
      paginationInfo.nextPage && paginationInfo.nextPage > page
        ? paginationInfo.nextPage
        : page + 1;
    if (nextPage <= page) {
      break;
    }
    page = nextPage;
  }
  return collected;
}

function filterMessagesBySince(messages, sinceTs) {
  if (!Number.isFinite(sinceTs)) return messages.slice();
  return messages.filter((message) => {
    const ts = parseMessageTimestamp(message);
    if (!Number.isFinite(ts)) return true;
    return ts >= sinceTs;
  });
}

const SITE_LABELS = {
  "1": "SofiaDate.com",
  "2": "MySpecialDate.com",
  "5": "LoveforHeart.com",
  "6": "AmourMeet.com",
  "7": "OKamour.com",
  "8": "Avodate.com",
  "9": "Datempire.com",
  "10": "FeelFlame.com",
  "11": "LatiDate.com",
  "12": "SakuraDate.com",
  "13": "Latidreams.com",
  "14": "NaomiDate.com",
  "15": "Amorpulse.com",
  "16": "NikaDate.com",
};

function normalizeSiteLabel(siteId) {
  try {
    if (siteId === undefined || siteId === null) return null;
    const key = String(siteId).trim();
    if (!key) return null;
    if (Object.prototype.hasOwnProperty.call(SITE_LABELS, key)) {
      return SITE_LABELS[key];
    }
    return key;
  } catch {
    return null;
  }
}

function getIconUrl(name) {
  try {
    const base = typeof name === "string" ? name.trim() : "";
    if (!base) return "";
    return chrome?.runtime?.getURL?.(`icons/${base}`) || "";
  } catch {
    return "";
  }
}

function createDownloadSection(options = {}) {
  const { onDownload, schedulePositionUpdate } = options;
  if (
    !onDownload ||
    typeof onDownload.downloadChat !== "function" ||
    typeof onDownload.downloadMail !== "function"
  ) {
    return null;
  }

  const section = document.createElement("div");
  section.className = "user-info-download";

  const select = document.createElement("select");
  select.className = "user-info-download-select";
  for (const option of TIMEFRAME_OPTIONS) {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    select.appendChild(opt);
  }
  select.value = DEFAULT_TIMEFRAME;

  const controls = document.createElement("div");
  controls.className = "user-info-download-row";
  const buttonWrap = document.createElement("div");
  buttonWrap.className = "user-info-download-buttons";

  const chatButton = document.createElement("button");
  chatButton.type = "button";
  chatButton.className = "user-info-download-btn icon-btn icon-only";
  chatButton.title = "Скачать чат";
  chatButton.setAttribute("aria-label", "Скачать чат");
  {
    const iconUrl = getIconUrl("icon-download-chat.svg");
    if (iconUrl) {
      chatButton.style.setProperty("--icon-url", `url("${iconUrl}")`);
    }
  }

  const mailButton = document.createElement("button");
  mailButton.type = "button";
  mailButton.className = "user-info-download-btn icon-btn icon-only";
  mailButton.title = "Скачать письма";
  mailButton.setAttribute("aria-label", "Скачать письма");
  {
    const iconUrl = getIconUrl("icon-download-letter.svg");
    if (iconUrl) {
      mailButton.style.setProperty("--icon-url", `url("${iconUrl}")`);
    }
  }

  buttonWrap.appendChild(chatButton);
  buttonWrap.appendChild(mailButton);

  controls.appendChild(select);
  controls.appendChild(buttonWrap);
  section.appendChild(controls);

  const status = document.createElement("div");
  status.className = "user-info-message muted";
  status.hidden = true;
  section.appendChild(status);

  const updateStatus = (text, variant = "muted") => {
    const content = String(text || "").trim();
    if (!content) {
      status.hidden = true;
      status.textContent = "";
      status.className = "user-info-message muted";
    } else {
      status.hidden = false;
      status.textContent = content;
      status.className = `user-info-message ${variant}`;
    }
    if (typeof schedulePositionUpdate === "function") {
      schedulePositionUpdate();
    }
  };

  const setLoading = (loading) => {
    const busy = !!loading;
    chatButton.disabled = busy;
    mailButton.disabled = busy;
    select.disabled = busy;
    chatButton.classList.toggle("loading", busy);
    mailButton.classList.toggle("loading", busy);
  };

  const handle = (handler) => {
    if (typeof handler !== "function") return;
    if (chatButton.disabled || mailButton.disabled) return;
    try {
      const maybePromise = handler({
        range: select.value || DEFAULT_TIMEFRAME,
        setStatus: updateStatus,
        setLoading,
        getCurrentOption: () => getTimeframeOption(select.value || DEFAULT_TIMEFRAME),
      });
      if (maybePromise && typeof maybePromise.then === "function") {
        maybePromise.catch((err) => {
          setLoading(false);
          updateStatus(
            (err && err.message) || "Ошибка при скачивании чата",
            "error"
          );
        });
      }
    } catch (err) {
      setLoading(false);
      updateStatus(
        (err && err.message) || "Ошибка при скачивании чата",
        "error"
      );
    }
  };

  chatButton.addEventListener("click", () => handle(onDownload.downloadChat));
  mailButton.addEventListener("click", () => handle(onDownload.downloadMail));

  return section;
}

function renderDetails(menu, details, options = {}) {
  const { onDownload, schedulePositionUpdate } = options;
  clearMenu(menu);
  const wrap = document.createElement("div");
  wrap.className = "user-info-details";
  const nameRow = document.createElement("div");
  nameRow.className = "user-info-row";
  const name = details.name ? String(details.name) : "—";
  const hasAge =
    details.age !== undefined && details.age !== null && details.age !== "";
  const age = hasAge ? String(details.age) : "";
  const siteIdKey =
    details.siteId === undefined || details.siteId === null
      ? ""
      : String(details.siteId).trim();
  const siteLabel = normalizeSiteLabel(siteIdKey);
  if (siteLabel && Object.prototype.hasOwnProperty.call(SITE_LABELS, siteIdKey)) {
    nameRow.textContent = hasAge ? `${name}, ${age}` : `${name}`;
  } else {
    nameRow.textContent = hasAge ? `Имя: ${name}, ${age}` : `Имя: ${name}`;
  }

  const siteRow = document.createElement("div");
  siteRow.className = "user-info-row";
  siteRow.textContent = `Зеркало: ${
    siteLabel && siteLabel !== "" ? siteLabel : "—"
  }`;

  wrap.appendChild(nameRow);
  wrap.appendChild(siteRow);
  if (details.createdAt !== undefined) {
    const regRow = document.createElement("div");
    regRow.className = "user-info-row";
    regRow.textContent = `Дата регистрации: ${details.createdAt || "—"}`;
    wrap.appendChild(regRow);
  }
  const locationLabel = getLocationDateTimeLabel(details.city, details.countryCode);
  if (locationLabel) {
    const cityRow = document.createElement("div");
    cityRow.className = "user-info-row";
    cityRow.textContent = locationLabel;
    wrap.appendChild(cityRow);
  }
  menu.appendChild(wrap);

  const downloadSection = createDownloadSection({
    onDownload,
    schedulePositionUpdate,
  });
  if (downloadSection) {
    menu.appendChild(downloadSection);
  }
}

async function requestUserDetails({ token, uid, signal }) {
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  const body = JSON.stringify({ chat_uid: [uid] });
  let response;
  try {
    response = await fetch(API_URL, {
      method: "POST",
      headers,
      body,
      signal,
    });
  } catch (err) {
    throw new Error("Не удалось выполнить запрос");
  }

  if (!response.ok) {
    throw new Error(`Ошибка ${response.status}`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Не удалось прочитать ответ сервера");
  }

  const entry =
    (Array.isArray(data?.data) ? data.data[0] : null) ||
    (Array.isArray(data?.response) ? data.response[0] : null) ||
    data?.user_info?.user_detail ||
    data?.userInfo?.userDetail ||
    data?.response?.user_info?.user_detail ||
    data?.response?.userInfo?.userDetail ||
    data?.data?.user_info?.user_detail ||
    data?.data?.userInfo?.userDetail ||
    data?.user_detail ||
    data?.userDetail ||
    data?.user_info ||
    data?.userInfo ||
    null;
  if (!entry) {
    return null;
  }

  return {
    name: entry.name ?? "",
    age: entry.age ?? "",
    siteId: entry.site_id ?? "",
    createdAt: formatRegistrationDate(
      entry.created_at ??
        entry.createdAt ??
        entry.user_detail?.created_at ??
        entry.user_detail?.createdAt ??
        entry.userDetail?.created_at ??
        entry.userDetail?.createdAt ??
        entry.profile?.created_at ??
        entry.profile?.createdAt ??
        entry.user?.created_at ??
        entry.user?.createdAt ??
        findCreatedAtDeep(data) ??
        ""
    ),
    city:
      entry.city ??
      entry.city_name ??
      entry.cityName ??
      entry.profile?.city ??
      entry.user?.city ??
      entry.location?.city ??
      "",
    countryCode: parseCountryCodeFromImage(
      entry.country_image ??
        entry.countryImage ??
        entry.country?.image ??
        entry.profile?.country_image ??
        entry.user?.country_image ??
        entry.location?.country_image ??
        ""
    ),
  };
}

async function requestProfileCreatedAt({ token, userId, signal }) {
  const headers = {
    Authorization: `Bearer ${token}`,
  };
  const url = `${PROFILE_URL}?user_id=${encodeURIComponent(
    userId
  )}&activeProfile=false`;
  let response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers,
      signal,
      credentials: "include",
    });
  } catch {
    return "";
  }
  if (!response.ok) return "";
  let data;
  try {
    data = await response.json();
  } catch {
    return "";
  }
  const raw =
    data?.user_info?.user_detail?.created_at ??
    data?.user_info?.user_detail?.createdAt ??
    data?.userInfo?.userDetail?.created_at ??
    data?.userInfo?.userDetail?.createdAt ??
    data?.response?.user_info?.user_detail?.created_at ??
    data?.response?.user_info?.user_detail?.createdAt ??
    data?.data?.user_info?.user_detail?.created_at ??
    data?.data?.user_info?.user_detail?.createdAt ??
    data?.created_at ??
    data?.createdAt ??
    findCreatedAtDeep(data) ??
    "";
  return formatRegistrationDate(raw);
}

export function initUserInfoMenu({ button, menu, onOpen, onClose } = {}) {
  if (!button || !menu) {
    return {
      close() {},
      isOpen() {
        return false;
      },
      refresh() {},
    };
  }

  let open = false;
  let pendingController = null;
  let pointerCleanup = null;
  let downloadController = null;

  function updateMenuPosition() {
    if (!open) return;
    try {
      const buttonRect = button.getBoundingClientRect();
      if (!buttonRect) return;
      const parentRect = menu.offsetParent?.getBoundingClientRect?.() || null;
      if (parentRect) {
        const topOffset = Math.max(
          0,
          buttonRect.bottom - parentRect.top + 8
        );
        menu.style.setProperty("--user-info-menu-top", `${topOffset}px`);
      }
      const menuRect = menu.getBoundingClientRect();
      if (!menuRect || !menuRect.width) return;
      const pointerOffset =
        buttonRect.left + buttonRect.width / 2 - menuRect.left;
      const clamped = Math.max(12, Math.min(menuRect.width - 12, pointerOffset));
      menu.style.setProperty("--user-info-pointer", `${clamped}px`);
    } catch {}
  }

  function ensurePointerListeners() {
    if (pointerCleanup) return;
    const handler = () => updateMenuPosition();
    window.addEventListener("resize", handler, { passive: true });
    window.addEventListener("scroll", handler, { passive: true });
    pointerCleanup = () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler);
      pointerCleanup = null;
    };
  }

  function schedulePositionUpdate() {
    if (!open) return;
    const raf =
      typeof window.requestAnimationFrame === "function"
        ? window.requestAnimationFrame.bind(window)
        : (cb) => setTimeout(cb, 0);
    raf(updateMenuPosition);
  }

  async function handleDownloadRequest({
    range,
    setStatus,
    setLoading,
    getCurrentOption,
    variant = "chat",
  } = {}) {
    const option =
      (typeof getCurrentOption === "function" && getCurrentOption()) ||
      getTimeframeOption(range || DEFAULT_TIMEFRAME);
    const since =
      typeof option?.durationMs === "number"
        ? Date.now() - option.durationMs
        : null;
    const participants = getChatParticipants();
    const chatId = resolveChatId(participants);
    if (!chatId) {
      if (typeof setLoading === "function") setLoading(false);
      if (typeof setStatus === "function") {
        setStatus("Не удалось определить чат", "error");
      }
      return;
    }
    const token = getAuthToken();
    if (!token) {
      if (typeof setLoading === "function") setLoading(false);
      if (typeof setStatus === "function") {
        setStatus("Токен не найден", "error");
      }
      return;
    }
    if (downloadController) {
      try {
        downloadController.abort();
      } catch {}
    }
    const controller = new AbortController();
    downloadController = controller;

    if (typeof setLoading === "function") setLoading(true);
    if (typeof setStatus === "function") setStatus("Загрузка...", "muted");

    try {
      if (variant === "mail") {
        const womanId = participants?.woman?.id;
        const manId = participants?.man?.id;
        if (!womanId || !manId) {
          if (typeof setStatus === "function") {
            setStatus("Не найдены ID для писем", "error");
          }
          return;
        }
        const allMessages = await fetchMailboxMessages({
          userId: womanId,
          manId,
          token,
          since,
          signal: controller.signal,
        });
        const filtered = filterMessagesBySince(allMessages, since);
        if (!filtered.length) {
          if (typeof setStatus === "function") {
            setStatus("Нет писем за выбранный период", "muted");
          }
          return;
        }
        const sorted = filtered
          .slice()
          .sort((a, b) => {
            const aTs = parseMessageTimestamp(a);
            const bTs = parseMessageTimestamp(b);
            const aVal = Number.isFinite(aTs) ? aTs : 0;
            const bVal = Number.isFinite(bTs) ? bTs : 0;
            return aVal - bVal;
          });

        let fromTs = null;
        let toTs = null;
        for (const message of sorted) {
          const ts = parseMessageTimestamp(message);
          if (!Number.isFinite(ts)) continue;
          if (fromTs === null || ts < fromTs) fromTs = ts;
          if (toTs === null || ts > toTs) toTs = ts;
        }

        const participantIndex = buildParticipantIndex(participants);
        const transcript = buildMailTranscript({
          participants,
          messages: sorted,
          periodLabel: option?.label,
          from: fromTs,
          to: toTs,
          participantIndex,
        });
        const filePeriodLabel = option?.fileLabel || option?.label || "период";
        const filename = buildFileName({
          participants,
          periodLabel: filePeriodLabel,
          type: "mail",
        });
        downloadTextFile({ filename, content: transcript });
      } else {
        const allMessages = await fetchChatMessages({
          chatId,
          token,
          since,
          signal: controller.signal,
        });
        const filtered = filterMessagesBySince(allMessages, since);
        if (!filtered.length) {
          if (typeof setStatus === "function") {
            setStatus("Нет сообщений за выбранный период", "muted");
          }
          return;
        }
        const sorted = filtered
          .slice()
          .sort((a, b) => {
            const aTs = parseMessageTimestamp(a);
            const bTs = parseMessageTimestamp(b);
            const aVal = Number.isFinite(aTs) ? aTs : 0;
            const bVal = Number.isFinite(bTs) ? bTs : 0;
            return aVal - bVal;
          });

        let fromTs = null;
        let toTs = null;
        for (const message of sorted) {
          const ts = parseMessageTimestamp(message);
          if (!Number.isFinite(ts)) continue;
          if (fromTs === null || ts < fromTs) fromTs = ts;
          if (toTs === null || ts > toTs) toTs = ts;
        }

        const participantIndex = buildParticipantIndex(participants);
        const transcript = buildTranscript({
          participants,
          messages: sorted,
          periodLabel: option?.label,
          from: fromTs,
          to: toTs,
          participantIndex,
        });
        const filePeriodLabel = option?.fileLabel || option?.label || "период";
        const filename = buildFileName({
          participants,
          periodLabel: filePeriodLabel,
        });
        downloadTextFile({ filename, content: transcript });
      }
      if (typeof setStatus === "function") {
        setStatus("Файл сохранён", "success");
      }
    } catch (err) {
      if (err?.name === "AbortError") {
        if (typeof setStatus === "function") setStatus("Загрузка отменена", "muted");
      } else if (typeof setStatus === "function") {
        setStatus(
          err?.message || "Не удалось скачать чат",
          "error"
        );
      }
    } finally {
      if (downloadController === controller) {
        downloadController = null;
      }
      if (typeof setLoading === "function") setLoading(false);
    }
  }

  function setOpen(next) {
    open = !!next;
    button.classList.toggle("active", open);
    button.setAttribute("aria-expanded", open ? "true" : "false");
    menu.hidden = !open;
  }

  function close() {
    if (!open) return;
    if (pendingController) {
      try {
        pendingController.abort();
      } catch {}
      pendingController = null;
    }
    if (downloadController) {
      try {
        downloadController.abort();
      } catch {}
      downloadController = null;
    }
    setOpen(false);
    if (pointerCleanup) {
      try {
        pointerCleanup();
      } catch {}
      pointerCleanup = null;
    }
    try {
      menu.style.removeProperty("--user-info-pointer");
      menu.style.removeProperty("--user-info-menu-top");
    } catch {}
    if (typeof onClose === "function") {
      try {
        onClose();
      } catch {}
    }
  }

  async function loadDetails() {
    const participants = getChatParticipants();
    const uid = resolveChatId(participants);
    if (!uid) {
      renderMessage(menu, "Не удалось определить UID", "error");
      schedulePositionUpdate();
      return;
    }
    const token = getAuthToken();
    if (!token) {
      renderMessage(menu, "Токен не найден", "error");
      schedulePositionUpdate();
      return;
    }
    const manId = getManCacheKey(participants);

    const controller = new AbortController();
    pendingController = controller;
    try {
      const [detailsResult, createdAtResult] = await Promise.all([
        requestUserDetails({
          token,
          uid,
          signal: controller.signal,
        }),
        manId
          ? requestProfileCreatedAt({
              token,
              userId: manId,
              signal: controller.signal,
            })
          : Promise.resolve(""),
      ]);
      if (pendingController !== controller) return;
      if (!detailsResult) {
        renderMessage(menu, "Данные пользователя не найдены", "error");
        schedulePositionUpdate();
        return;
      }
      const details = {
        ...detailsResult,
        createdAt: detailsResult?.createdAt || createdAtResult || "",
      };
      renderDetails(menu, details, {
        onDownload: {
          downloadChat: (opts) =>
            handleDownloadRequest({
              ...opts,
              variant: "chat",
            }),
          downloadMail: (opts) =>
            handleDownloadRequest({
              ...opts,
              variant: "mail",
            }),
        },
        schedulePositionUpdate,
      });
      schedulePositionUpdate();
    } catch (err) {
      if (pendingController !== controller) return;
      renderMessage(
        menu,
        err?.message || "Не удалось получить данные пользователя",
        "error"
      );
      schedulePositionUpdate();
    } finally {
      if (pendingController === controller) {
        pendingController = null;
      }
    }
  }

  button.addEventListener("click", (event) => {
    try {
      event.preventDefault();
    } catch {}
    if (open) {
      close();
      return;
    }
    if (typeof onOpen === "function") {
      try {
        onOpen();
      } catch {}
    }
    setOpen(true);
    ensurePointerListeners();
    renderMessage(menu, "Загрузка...", "muted");
    schedulePositionUpdate();
    loadDetails();
  });

  setOpen(false);
  clearMenu(menu);

  return {
    close,
    isOpen() {
      return open;
    },
    refresh() {
      if (!open) return;
      renderMessage(menu, "Загрузка...", "muted");
      ensurePointerListeners();
      schedulePositionUpdate();
      loadDetails();
    },
  };
}

export { getChatParticipants, resolveChatId, getAuthToken };
