// === helpers ===
const LOG = {
  enabled: false,
  _p: "[OT4ET]",
  log(...args) {
    if (!LOG.enabled) return;
    try {
      console.log(LOG._p, ...args);
    } catch {}
  },
  warn(...args) {
    if (!LOG.enabled) return;
    try {
      console.warn(LOG._p, ...args);
    } catch {}
  },
  error(...args) {
    try {
      console.error(LOG._p, ...args);
    } catch {}
  },
};
try {
  const dbg = window?.localStorage?.getItem?.("OT4ET_DEBUG");
  if (dbg && /^(1|true|yes|on)$/i.test(dbg.trim())) {
    LOG.enabled = true;
  }
} catch {}
const IS_SVG_DOCUMENT = (() => {
  try {
    if (document?.contentType === "image/svg+xml") return true;
    const tag = document?.documentElement?.tagName || "";
    return String(tag).toLowerCase() === "svg";
  } catch {
    return false;
  }
})();
// Default API config (optional). If you put your API key here,
// it will be visible to users who inspect the extension.
const DEFAULT_API_URLS = [
  "https://ot4et.pp.ua/api/count",
];
const DEFAULT_API_URL = DEFAULT_API_URLS[0];
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
function resolveApiBase(url) {
  const normalized = normalizeApiUrl(url || "");
  if (!normalized) return "";
  try {
    const parsed = new URL(normalized);
    const path = parsed.pathname.replace(/\/+$/, "");
    if (path.endsWith("/api/count")) {
      parsed.pathname = path.slice(0, -"/count".length);
    } else if (path.endsWith("/api")) {
      parsed.pathname = path;
    } else {
      parsed.pathname = `${path}/api`;
    }
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    if (normalized.endsWith("/api/count")) {
      return normalized.slice(0, -"/count".length);
    }
    if (normalized.endsWith("/api")) return normalized;
    return `${normalized}/api`;
  }
}
const DEFAULT_API_KEY = "super-secret-key-123"; // e.g. "super-secret-key-123" (leave empty to use storage only)
const PANEL_BG = "#f8f9fc";
const PANEL_ELEVATED_BG = "#ffffff";
const PANEL_BORDER = "#d1d5e5";
const PANEL_RADIUS = "3px";
const MIN_DRAWER_HEIGHT = 250;
const DRAWER_HEIGHT_STORAGE_KEY = "drawerHeightPx";
const PROFILE_SHIFT_DELTA_STORAGE_KEY = "OT4ET_PROFILE_SHIFT_DELTA";
const PROFILE_SHIFT_STATS_CACHE_KEY = "OT4ET_PROFILE_SHIFT_STATS";
const PROFILE_SHIFT_DELTA_QUEUE_KEY = "OT4ET_PROFILE_SHIFT_DELTA_QUEUE";
const PROFILE_SHIFT_DELTA_QUEUE_LIMIT = 500;
const OPERATOR_SHIFT_SUMMARY_CACHE_KEY = "OT4ET_OPERATOR_SHIFT_SUMMARY_CACHE";
const OPERATOR_SHIFT_SNAPSHOT_QUEUE_KEY = "OT4ET_OPERATOR_SHIFT_SNAPSHOT_QUEUE";
const OPERATOR_NAMES_CACHE_KEY = "OT4ET_OPERATOR_NAMES_CACHE";
const SERVER_AUTH_PASS_KEY = "OT4ET_SERVER_AUTH_PASS";
const SERVER_AUTH_ALLOWED_KEY = "OT4ET_SERVER_AUTH_ALLOWED";
const SERVER_AUTH_CHECKED_KEY = "OT4ET_SERVER_AUTH_CHECKED_AT";
const EXTENSION_UNLOCKED_KEY = "OT4ET_EXTENSION_UNLOCKED";
const EXTENSION_UNLOCKED_AT_KEY = "OT4ET_EXTENSION_UNLOCKED_AT";
const EXTENSION_AUTH_CHECKED_AT_KEY = "OT4ET_EXTENSION_AUTH_CHECKED_AT";
const EXTENSION_INSTALL_ID_KEY = "OT4ET_INSTALL_ID";

const LANG = {
  ru: {
    title: "О Т 4 Е Т",
    man: "Мужчина",
    girl: "Девушка",
    id: "ID",
    city: "Город",
    save: "Сохранить",
    download: "Скачать TXT",
    history: "История",
    clearHistory: "Очистить историю",
    emptyHistory: "История пуста",
    clearOne: "Очистить текущего",
    clearAll: "Очистить всё",
    checkTG: "Проверить в ТГ",
    pinned: "Закрепить",
    unpinned: "Открепить",
    settings: "Настройки API",
    apiUrl: "API URL",
    apiKey: "API ключ (если есть)",
    lang: "Язык",
    ua: "Українська",
    ru: "Русский",
    emptyId: "Не вижу ID мужчины на странице",
    saved: "Сохранено",
    removed: "Удалено",
    cleared: "Очищено",
    count: (n) => `Отчётов: ${n}`,
    none: "Отчётов нету",
    more: "Дополнительно",
    hourlyCount: "За час",
    totalSent: "За смену",
    chatsCount: "Чаты",
    mailsCount: "Письма",
    profilesTitle: "Анкеты",
    profilesAll: "Все анкеты",
    profilesRefresh: "Обновить",
    profilesUnknown: "Неизвестная анкета",
    profilesLoading: "Загрузка...",
    profilesEmpty: "Нажмите «Обновить», чтобы загрузить",
    profilesError: "Не удалось загрузить анкеты",
    operatorName: "Имя",
    operatorNamePlaceholder: "Введите имя",
    operatorNameSave: "Сохранить",
    operatorId: "ID",
    chartGeneral: "Общий баланс",
    chartEmpty: "Нет начислений",
    chartFilterGeneral: "Общий",
    chartFilterMail: "Письма",
    chartFilterChat: "Чаты",
    chartFilterActive: "Актив",
    chartLegendPaid: "Платных действий",
    ratingTitleBalance: "Балансы",
    ratingTitleActions: "Действия",
    ratingMainShiftBalance: "Баланс за смену",
    ratingMainShiftActions: "Действия за смену",
    ratingTabShift: "За смену",
    ratingTabAllTime: "За всё время",
    ratingColRank: "#",
    ratingColName: "Имя",
    ratingColValue: "Баланс",
    ratingColChat: "Чаты",
    ratingColMail: "Письма",
    ratingColTotal: "Всего",
    ratingLoading: "Загрузка рейтинга...",
    ratingEmpty: "Нет данных",
    ratingError: "Не удалось загрузить рейтинг",
    ratingUpdatedAt: "Обновлено",
    foundCount: (n) => `Найдено отчётов: ${n}`,
    confirmDownloadYesterday: "Вы скачиваете отчёт за вчера. Продолжить?",
    newFolderPlaceholder: "Название новой папки",
    newTemplatePlaceholder: "Текст шаблона",
    cancel: "Отмена",
    folderNameRequired: "Введите название папки",
    templateContentRequired: "Введите текст шаблона",
    moveTitle: (name) => `Переместить «${name || "элемент"}»`,
    moveSelectLabel: "В папку",
    moveSelectPlaceholder: "Выберите папку",
    moveTargetRequired: "Выберите папку",
    moveSameFolderError: "Этот элемент уже находится в выбранной папке",
    moveDescendantError: "Нельзя переместить папку внутрь самой себя",
    moveNoTargets: "Нет других папок для перемещения",
    moveFailed: "Не удалось переместить элемент",
  },
  uk: {
    title: "О Т 4 Е Т",
    man: "Чоловік",
    girl: "Дівчина",
    id: "ID",
    city: "Місто",
    save: "Зберегти",
    download: "Завантажити TXT",
    history: "Історія",
    clearHistory: "Очистити історію",
    emptyHistory: "Історія порожня",
    clearOne: "Очистити поточного",
    clearAll: "Очистити все",
    checkTG: "Перевірити в TG",
    pinned: "Закріпити",
    unpinned: "Відкріпити",
    settings: "Налаштування API",
    apiUrl: "API URL",
    apiKey: "API ключ (якщо є)",
    lang: "Мова",
    ua: "Українська",
    ru: "Російська",
    emptyId: "Не бачу ID чоловіка на сторінці",
    saved: "Збережено",
    removed: "Видалено",
    cleared: "Очищено",
    count: (n) => `Звітів: ${n}`,
    none: "Звітів немає",
    more: "Додатково",
    hourlyCount: "За годину",
    totalSent: "За зміну",
    chatsCount: "Чати",
    mailsCount: "Листи",
    profilesTitle: "Анкети",
    profilesAll: "Усі анкети",
    profilesRefresh: "Оновити",
    profilesUnknown: "Невідома анкета",
    profilesLoading: "Завантаження...",
    profilesEmpty: "Натисніть «Оновити», щоб завантажити",
    profilesError: "Не вдалося завантажити анкети",
    operatorName: "Ім'я",
    operatorNamePlaceholder: "Введіть ім'я",
    operatorNameSave: "Зберегти",
    operatorId: "ID",
    chartGeneral: "Загальний баланс",
    chartEmpty: "Немає нарахувань",
    chartFilterGeneral: "Загальний",
    chartFilterMail: "Листи",
    chartFilterChat: "Чати",
    chartFilterActive: "Актив",
    chartLegendPaid: "Платних дій",
    ratingTitleBalance: "Баланси",
    ratingTitleActions: "Дії",
    ratingMainShiftBalance: "Баланс за зміну",
    ratingMainShiftActions: "Дії за зміну",
    ratingTabShift: "За зміну",
    ratingTabAllTime: "За весь час",
    ratingColRank: "#",
    ratingColName: "Ім'я",
    ratingColValue: "Баланс",
    ratingColChat: "Чати",
    ratingColMail: "Листи",
    ratingColTotal: "Всього",
    ratingLoading: "Завантаження рейтингу...",
    ratingEmpty: "Немає даних",
    ratingError: "Не вдалося завантажити рейтинг",
    ratingUpdatedAt: "Оновлено",
    foundCount: (n) => `Знайдено звітів: ${n}`,
    confirmDownloadYesterday: "Ви завантажуєте звіт за вчора. Продовжити?",
    newFolderPlaceholder: "Назва нової папки",
    newTemplatePlaceholder: "Текст шаблону",
    cancel: "Скасувати",
    folderNameRequired: "Введіть назву папки",
    templateContentRequired: "Введіть текст шаблону",
    moveTitle: (name) => `Перемістити «${name || "елемент"}»`,
    moveSelectLabel: "До папки",
    moveSelectPlaceholder: "Оберіть папку",
    moveTargetRequired: "Оберіть папку",
    moveSameFolderError: "Цей елемент уже в обраній папці",
    moveDescendantError: "Не можна перемістити папку всередину самої себе",
    moveNoTargets: "Немає інших папок для переміщення",
    moveFailed: "Не вдалося перемістити елемент",
  },
};
function isExtCtxInvalid(err) {
  try {
    const msg = String(err && (err.message || err) || "");
    return /Extension context invalidated/i.test(msg) || msg === "ext_ctx_invalid";
  } catch {
    return false;
  }
}
const S = {
  manName: '[data-testid="man-name"]',
  manId: '[data-testid="man-external_id"]',
  manPlace: '[data-testid="man-place"]',
  womanName: '[data-testid="woman-name"]',
  womanId: '[data-testid="woman-external_id"]',
  womanPlace: '[data-testid="woman-place"]',
};
const WOMAN_TIME_CLASS = "ot4et-woman-localtime";
const MAN_TIME_CLASS = "ot4et-man-localtime";
const MAN_SPEND_CLASS = "ot4et-man-spend-balance";
const MAN_ID_BALANCE_WRAP_CLASS = "ot4et-man-id-balance-wrap";
const MAN_PROFILE_ID_SELECTOR_PRIMARY =
  '[class*="styles_clmn_3_chat_head_profile_id__"]';
const MAN_PROFILE_ID_SELECTOR_FALLBACK = '[class*="chat_head_profile_id__"]';
const LOCAL_TIME_STYLE_ID = "ot4et-localtime-style";
const PROFILE_INFO_BUTTON_CLASS = "ot4et-profile-info-button";
const PROFILE_INFO_BLOCK_CLASS = "ot4et-profile-info-block";
const PROFILE_INFO_STYLE_ID = "ot4et-profile-info-style";
let COUNTRY_TZ_DEFAULTS = new Map();
let COUNTRY_TZ_CAPITALS = new Map();
let CITY_TZ_OVERRIDES = new Map();
const CITY_TZ_CACHE = new Map();
const CITY_TIME_FORMATTERS = new Map();
let CYRILLIC_TO_LATIN = {};
let tzDataPromise = null;
let tzDataLoaded = false;

const ICONS = {
  download: chrome.runtime.getURL("icons/icon-download.svg"),
  downloadYesterday: chrome.runtime.getURL("icons/icon-download-yesterdat.svg"),
  history: chrome.runtime.getURL("icons/icon-evil-eye.svg"),
  search: chrome.runtime.getURL("icons/icon-search.svg"),
  check: chrome.runtime.getURL("icons/icon-check.svg"),
  checkUnread: chrome.runtime.getURL("icons/icon-check-noreed.svg"),
  openBot: chrome.runtime.getURL("icons/icon-robot.svg"),
  templates: chrome.runtime.getURL("icons/icon-templates.svg"),
  copyId: chrome.runtime.getURL("icons/icon-id.svg"),
  restore: chrome.runtime.getURL("icons/icon-reply.svg"),
  close: chrome.runtime.getURL("icons/icon-cross.svg"),
  delete: chrome.runtime.getURL("icons/icon-cross.svg"),
  woman: chrome.runtime.getURL("icons/icon-woman.svg"),
  pencil: chrome.runtime.getURL("icons/icon-pencil.svg"),
  save: chrome.runtime.getURL("icons/icon-save.svg"),
  saveActive: chrome.runtime.getURL("icons/icon-save-active.svg"),
  pin: chrome.runtime.getURL("icons/icon-pin.svg"),
  pinActive: chrome.runtime.getURL("icons/icon-pin-active.svg"),
  launcher: chrome.runtime.getURL("icons/chatbot-bubble.svg"),
  settings: chrome.runtime.getURL("icons/icon-settings.svg"),
  userInfo: chrome.runtime.getURL("icons/icon-male-bust.svg"),
  templatesNewFolder: chrome.runtime.getURL("icons/icon-new-folder.svg"),
  templatesNewTemplate: chrome.runtime.getURL("icons/icon-new-template-inside.svg"),
  sent: chrome.runtime.getURL("icons/icon-sent.svg"),
  profileSwitch: chrome.runtime.getURL("icons/icon-power-on.svg"),
  stopwatch: chrome.runtime.getURL("icons/icon-stopwatch-24-pretty.svg"),
  hourStopwatch: chrome.runtime.getURL("icons/icon-stopwatch-1h-pretty.svg"),
  arrow: chrome.runtime.getURL("icons/icon-arrow.svg"),
  chatIcon: chrome.runtime.getURL("icons/icon-chat.svg"),
  mailIcon: chrome.runtime.getURL("icons/icon-mail.svg"),
  money: chrome.runtime.getURL("icons/icon-coin-dollar.svg"),
};

const MONITOR_ENDPOINTS = Object.freeze({
  chat: "https://alpha.date/api/chat/message",
  mail: "https://alpha.date/api/mailbox/mail",
  senderList: "https://alpha.date/api/sender/senderList",
});
const CONFIG_TYPE_CHECK_ENDPOINT = "https://alpha.date/api/config/type/check";
const CONFIG_TYPE_CACHE_TTL_MS = 60 * 1000;
const CHAT_HISTORY_ENDPOINT = "https://alpha.date/api/chatList/chatHistory";
const WS_CHAT_HISTORY_SPEND_CACHE_TTL_MS = 60 * 1000;
const CHAT_SPEND_UPSERT_ENDPOINT = "/chat/spend/upsert";
const CHAT_SPEND_GET_ENDPOINT = "/chat/spend/max";
const CHAT_SPEND_SERVER_SYNC_TTL_MS = 60 * 1000;
const OPERATOR_RATING_ENDPOINT = "/operators/rating";
const OPERATOR_RATING_LIMIT = 50;
const OPERATOR_RATING_CACHE_TTL_MS = 5 * 60 * 1000;

function notifyMonitorRecord(kind, profileId, count) {
  try {
    const payload = { type: "monitor:record", kind };
    if (profileId) payload.profileId = profileId;
    if (Number.isFinite(Number(count)) && Number(count) > 0) {
      payload.count = Math.max(1, Math.round(Number(count)));
    }
    chrome.runtime.sendMessage(payload, () => {
      try {
        // Prevent noisy "Unchecked runtime.lastError: No SW" when background SW is restarting.
        void chrome.runtime.lastError;
      } catch {}
    });
  } catch {}
}

let monitorBridgeInitialized = false;
let senderListBridgeInitialized = false;
let wsEventBridgeInitialized = false;
let chatHistorySpendBridgeInitialized = false;
let wsEventQueue = [];
let chatHistorySpendQueue = [];
let wsEventsDisabled = (() => {
  try {
    const raw = String(window?.localStorage?.getItem?.("ot4et_ws_events_disabled") || "")
      .trim()
      .toLowerCase();
    return raw === "1" || raw === "true";
  } catch {
    return false;
  }
})();
const wsConfigTypeCache = new Map();
const wsConfigTypeInFlight = new Map();
const wsChatHistorySpendCache = new Map();
const wsChatHistorySpendInFlight = new Map();
const manSpendByChatUid = new Map();
const manSpendByChatId = new Map();
const manSpendByPairKey = new Map();
const chatSpendServerSyncCache = new Map();
const chatSpendServerInFlight = new Map();
const headerChatHistorySpendInFlight = new Map();
const HEADER_CHAT_HISTORY_SPEND_REFRESH_TTL_MS = 60 * 1000;
let activeChatUidCache = "";

function handleMonitorBridgeMessage(event) {
  try {
    if (!event) return;
    const data = event.data;
    if (!data || data.type !== "OT4ET_MONITOR_RECORD") return;
    const kind = data.kind;
    if (kind !== "chat" && kind !== "mail") return;
    const rawCount = Number(data.count);
    const count =
      Number.isFinite(rawCount) && rawCount > 0 ? Math.round(rawCount) : 1;
    const profileId =
      typeof data.profileId === "string" && data.profileId.trim()
        ? data.profileId.trim()
        : "";
    notifyMonitorRecord(kind, profileId, count);
    recordProfileHourlyActionEvent(profileId || "unknown", kind, Date.now(), count);
  } catch {}
}

function setupMonitorMessageBridge() {
  if (monitorBridgeInitialized) return;
  monitorBridgeInitialized = true;
  try {
    window.addEventListener("message", handleMonitorBridgeMessage);
  } catch {}
}

function handleSenderListBridgeMessage(event) {
  try {
    if (!event || event.source !== window) return;
    const data = event.data;
    if (!data || data.type !== "OT4ET_SENDER_LIST") return;
    applySenderListPayload(data.payload);
  } catch {}
}

function findChatUidInPayload(payload) {
  if (!payload) return "";
  if (typeof payload === "string") return payload.trim();
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const found = findChatUidInPayload(item);
      if (found) return found;
    }
    return "";
  }
  if (typeof payload !== "object") return "";
  const direct =
    payload.chat_uid ||
    payload.chatUid ||
    payload.uid ||
    payload.chatUID ||
    "";
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  return findChatUidInPayload(payload.response || payload.data || null);
}

function normalizeExternalId(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  return raw.replace(/\D/g, "");
}

function getManSpendPairKey(manExternalId, womanExternalId) {
  const man = normalizeExternalId(manExternalId);
  const woman = normalizeExternalId(womanExternalId);
  if (!man || !woman) return "";
  return `${man}::${woman}`;
}

function getChatSpendSyncOperatorMeta() {
  try {
    const operatorId = String(operatorInfoState?.operatorId || "").trim();
    const operatorName = String(operatorInfoState?.operatorName || "").trim();
    return {
      operator_id: operatorId || "",
      operator_name: operatorName || "",
    };
  } catch {
    return {
      operator_id: "",
      operator_name: "",
    };
  }
}

async function syncChatSpendMaxToServer(entry) {
  try {
    if (!entry || typeof entry !== "object") return false;
    const maleId = normalizeExternalId(entry.man_external_id);
    const femaleId = normalizeExternalId(entry.woman_external_id);
    const maxSpend = Number(entry.max_spend_all_credits);
    if (!maleId || !femaleId || !Number.isFinite(maxSpend) || maxSpend <= 0) {
      return false;
    }
    const pairKey = getManSpendPairKey(maleId, femaleId);
    if (!pairKey) return false;
    const now = Date.now();
    const cached = chatSpendServerSyncCache.get(pairKey);
    if (
      cached &&
      Number(cached.ts) + CHAT_SPEND_SERVER_SYNC_TTL_MS > now &&
      Number(cached.max) >= maxSpend
    ) {
      return true;
    }
    const inFlight = chatSpendServerInFlight.get(pairKey);
    if (inFlight) {
      try {
        const inFlightMax = Number(inFlight.max);
        if (Number.isFinite(inFlightMax) && inFlightMax >= maxSpend) {
          return await inFlight.promise;
        }
      } catch {}
    }
    const requestPromise = (async () => {
      const base = await getProfileStatsApiBase();
      if (!base) return false;
      const store = await getStore(["apiKey"]).catch(() => ({}));
      const effectiveKey =
        (store?.apiKey && String(store.apiKey).trim()) || DEFAULT_API_KEY;
      const headers = { "Content-Type": "application/json" };
      if (effectiveKey) {
        headers.Authorization = `Bearer ${effectiveKey}`;
      }
      const { operator_id, operator_name } = getChatSpendSyncOperatorMeta();
      const payload = {
        male_id: maleId,
        female_id: femaleId,
        max_spend_all_credits: maxSpend,
        chat_uid: String(entry.chat_uid || "").trim() || "",
        operator_id,
        operator_name,
        updated_at: Number(entry.updated_at || Date.now()) || Date.now(),
      };
      const res = await fetch(`${base}${CHAT_SPEND_UPSERT_ENDPOINT}`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) return false;
      const data = await res.json().catch(() => ({}));
      if (!data || data.ok !== true) return false;
      const storedMax = Number(
        data.stored_max_spend_all_credits ?? data.max_spend_all_credits
      );
      const acceptedMax =
        Number.isFinite(storedMax) && storedMax >= 0
          ? storedMax
          : maxSpend;
      chatSpendServerSyncCache.set(pairKey, {
        max: acceptedMax,
        ts: Date.now(),
      });
      return true;
    })();
    chatSpendServerInFlight.set(pairKey, {
      promise: requestPromise,
      max: maxSpend,
    });
    try {
      return await requestPromise;
    } finally {
      const latest = chatSpendServerInFlight.get(pairKey);
      if (latest && latest.promise === requestPromise) {
        chatSpendServerInFlight.delete(pairKey);
      }
    }
  } catch {
    return false;
  }
}

function upsertManSpendEntry(entry) {
  if (!entry || typeof entry !== "object") return;
  const updatedAt = Number(entry.updated_at || 0) || Date.now();
  const chatUid = String(entry.chat_uid || "").trim();
  const chatId = String(entry.chat_id || "").trim();
  const maxSpendRaw = Number(entry.max_spend_all_credits);
  const maxSpend = Number.isFinite(maxSpendRaw) && maxSpendRaw >= 0 ? maxSpendRaw : 0;
  const manExternalId = normalizeExternalId(entry.man_external_id);
  const womanExternalId = normalizeExternalId(entry.woman_external_id);
  const normalized = {
    chat_uid: chatUid,
    chat_id: chatId,
    max_spend_all_credits: maxSpend,
    man_external_id: manExternalId,
    woman_external_id: womanExternalId,
    updated_at: updatedAt,
  };
  if (chatUid) {
    const prev = manSpendByChatUid.get(chatUid);
    if (!prev || Number(prev.updated_at || 0) <= updatedAt) {
      manSpendByChatUid.set(chatUid, normalized);
      activeChatUidCache = chatUid;
    }
  }
  if (chatId) {
    const prev = manSpendByChatId.get(chatId);
    if (!prev || Number(prev.updated_at || 0) <= updatedAt) {
      manSpendByChatId.set(chatId, normalized);
    }
  }
  const pairKey = getManSpendPairKey(manExternalId, womanExternalId);
  if (pairKey) {
    const prev = manSpendByPairKey.get(pairKey);
    if (!prev || Number(prev.updated_at || 0) <= updatedAt) {
      manSpendByPairKey.set(pairKey, normalized);
    }
  }
  if (manExternalId && womanExternalId && maxSpend > 0) {
    void syncChatSpendMaxToServer(normalized);
  }
}

function handleChatHistorySpendBridgeMessage(event) {
  try {
    if (!event || event.source !== window) return;
    const data = event.data;
    if (!data || data.type !== "OT4ET_CHAT_HISTORY_STATS") return;
    const payload = data.payload;
    if (!payload || typeof payload !== "object") return;
    upsertManSpendEntry(payload);
    if (ui?.drawer || ui?.head || ui?.launcher) {
      updateManSpendInHeader();
      return;
    }
    chatHistorySpendQueue.push(payload);
    if (chatHistorySpendQueue.length > 200) {
      chatHistorySpendQueue = chatHistorySpendQueue.slice(-200);
    }
  } catch {}
}

function consumeQueuedChatHistorySpendEvents() {
  try {
    if (!chatHistorySpendQueue.length) return;
    const queued = chatHistorySpendQueue.slice();
    chatHistorySpendQueue = [];
    queued.forEach((item) => upsertManSpendEntry(item));
    updateManSpendInHeader();
  } catch {}
}

function setupChatHistorySpendMessageBridge() {
  if (chatHistorySpendBridgeInitialized) return;
  chatHistorySpendBridgeInitialized = true;
  try {
    window.addEventListener("message", handleChatHistorySpendBridgeMessage);
  } catch {}
}

function getConfigTypeCacheKey(manExternalID, womanExternalID) {
  const man = normalizeExternalId(manExternalID);
  const woman = normalizeExternalId(womanExternalID);
  if (!man || !woman) return "";
  return `${man}::${woman}`;
}

async function getAuthTokenForConfigCheck() {
  try {
    const module = await loadUserInfoModule();
    const token =
      module && typeof module.getAuthToken === "function" ? module.getAuthToken() : "";
    const normalized = String(token || "").trim();
    if (normalized) return normalized;
  } catch {}
  try {
    const fallback = String(getAuthTokenFromStorage() || "").trim();
    if (fallback) return fallback;
  } catch {}
  try {
    return String(window?.localStorage?.getItem?.("token") || "").trim();
  } catch {
    return "";
  }
}

async function fetchConfigTypeCheck({ token, manExternalID, womanExternalID }) {
  const man = normalizeExternalId(manExternalID);
  const woman = normalizeExternalId(womanExternalID);
  if (!token || !man || !woman) return null;
  try {
    const response = await fetch(CONFIG_TYPE_CHECK_ENDPOINT, {
      method: "POST",
      credentials: "include",
      headers: {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        manExternalID: man,
        womanExternalID: woman,
      }),
    });
    if (!response.ok) return null;
    const payload = await response.json().catch(() => null);
    if (!payload || payload.status !== true) return null;
    const type = Number(payload?.result?.type);
    if (type !== 1 && type !== 2 && type !== 3) return null;
    return {
      type,
      isAlert: !!payload?.result?.isAlert,
    };
  } catch {
    return null;
  }
}

async function resolveEventConfigType(eventItem) {
  const manExternalID = normalizeExternalId(eventItem?.manExternalID);
  const womanExternalID = normalizeExternalId(eventItem?.womanExternalID);
  const cacheKey = getConfigTypeCacheKey(manExternalID, womanExternalID);
  if (!cacheKey) return null;
  const now = Date.now();
  const cached = wsConfigTypeCache.get(cacheKey);
  if (cached && Number(cached.expiresAt) > now) {
    const cachedType = Number(cached.type);
    return cachedType === 1 || cachedType === 2 || cachedType === 3 ? cachedType : null;
  }
  const inFlight = wsConfigTypeInFlight.get(cacheKey);
  if (inFlight) {
    return inFlight.catch(() => null);
  }
  const requestPromise = (async () => {
    const token = await getAuthTokenForConfigCheck();
    if (!token) return null;
    const result = await fetchConfigTypeCheck({
      token,
      manExternalID,
      womanExternalID,
    });
    const type = Number(result?.type);
    if (type === 1 || type === 2 || type === 3) {
      wsConfigTypeCache.set(cacheKey, {
        type,
        expiresAt: now + CONFIG_TYPE_CACHE_TTL_MS,
      });
      return type;
    }
    wsConfigTypeCache.set(cacheKey, {
      type: null,
      expiresAt: now + CONFIG_TYPE_CACHE_TTL_MS,
    });
    return null;
  })();
  wsConfigTypeInFlight.set(cacheKey, requestPromise);
  try {
    return await requestPromise;
  } catch {
    return null;
  } finally {
    wsConfigTypeInFlight.delete(cacheKey);
  }
}

function normalizeWsChatUid(value) {
  return String(value || "").trim();
}

function normalizeWsMessagePrice(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return {
    raw: num,
    rounded: Math.round(num),
  };
}

async function fetchWsChatHistoryPageOne({ token, chatUid }) {
  const normalizedToken = String(token || "").trim();
  const normalizedChatUid = normalizeWsChatUid(chatUid);
  if (!normalizedToken || !normalizedChatUid) return null;
  try {
    const response = await fetch(CHAT_HISTORY_ENDPOINT, {
      method: "POST",
      credentials: "include",
      headers: {
        accept: "application/json, text/plain, */*",
        "content-type": "application/json",
        authorization: `Bearer ${normalizedToken}`,
      },
      body: JSON.stringify({
        chat_id: normalizedChatUid,
        page: 1,
      }),
    });
    if (!response.ok) return null;
    return await response.json().catch(() => null);
  } catch {
    return null;
  }
}

function extractMaxSpendAllCreditsFromChatHistory(payload) {
  if (!payload || typeof payload !== "object") return 0;
  const list = Array.isArray(payload?.response) ? payload.response : [];
  if (!list.length) return 0;
  let maxSpend = 0;
  for (const row of list) {
    const spend = Number(row?.spend_all_credits);
    if (!Number.isFinite(spend) || spend < 0) continue;
    if (spend > maxSpend) maxSpend = spend;
  }
  return maxSpend;
}

async function resolveWsEventHasSpendByChatUid(chatUid) {
  const normalizedChatUid = normalizeWsChatUid(chatUid);
  if (!normalizedChatUid) return null;
  const now = Date.now();
  const cached = wsChatHistorySpendCache.get(normalizedChatUid);
  if (cached && Number(cached.expiresAt) > now) {
    return {
      hasSpend: !!cached.hasSpend,
      maxSpend: Number.isFinite(Number(cached.maxSpend)) ? Number(cached.maxSpend) : 0,
    };
  }
  const inFlight = wsChatHistorySpendInFlight.get(normalizedChatUid);
  if (inFlight) return inFlight.catch(() => null);
  const requestPromise = (async () => {
    const token = await getAuthTokenForConfigCheck();
    if (!token) return null;
    const payload = await fetchWsChatHistoryPageOne({
      token,
      chatUid: normalizedChatUid,
    });
    const maxSpend = extractMaxSpendAllCreditsFromChatHistory(payload);
    const result = {
      hasSpend: maxSpend > 0,
      maxSpend,
    };
    wsChatHistorySpendCache.set(normalizedChatUid, {
      ...result,
      expiresAt: Date.now() + WS_CHAT_HISTORY_SPEND_CACHE_TTL_MS,
    });
    return result;
  })();
  wsChatHistorySpendInFlight.set(normalizedChatUid, requestPromise);
  try {
    return await requestPromise;
  } catch {
    return null;
  } finally {
    wsChatHistorySpendInFlight.delete(normalizedChatUid);
  }
}

async function enrichWsEventWithChatSpend(item) {
  if (!item || typeof item !== "object") return item;
  const normalized = {
    ...item,
    chatHasSpend: !!item.chatHasSpend,
    chatMaxSpendAllCredits: Number(item.chatMaxSpendAllCredits) || 0,
    chatSpendChecked: !!item.chatSpendChecked,
  };
  const chatUid = normalizeWsChatUid(item.chat_uid);
  if (!chatUid) {
    normalized.chatSpendChecked = true;
    return normalized;
  }
  const spendInfo = await resolveWsEventHasSpendByChatUid(chatUid);
  if (!spendInfo) return normalized;
  normalized.chatHasSpend = !!spendInfo.hasSpend;
  normalized.chatMaxSpendAllCredits = Number(spendInfo.maxSpend) || 0;
  normalized.chatSpendChecked = true;
  return normalized;
}

function getEventRowClassByType(type) {
  const normalized = Number(type);
  if (normalized === 1) return "adb-row-type-1";
  if (normalized === 2) return "adb-row-type-2";
  if (normalized === 3) return "adb-row-type-3";
  return "";
}

async function enrichWsEventWithConfigType(item) {
  if (!item || typeof item !== "object") return item;
  const normalized = {
    ...item,
    manExternalID: normalizeExternalId(item.manExternalID),
    womanExternalID: normalizeExternalId(item.womanExternalID),
    configType: null,
  };
  const type = await resolveEventConfigType(normalized);
  if (type === 1 || type === 2 || type === 3) {
    normalized.configType = type;
  }
  return normalized;
}

async function resolveMailChatUidFromSocket(payload) {
  const femaleId = String(payload?.female_id || "").replace(/\D/g, "");
  const maleExternalId = String(payload?.male_external_id || "").replace(/\D/g, "");
  if (!femaleId || !maleExternalId) return "";
  const token = getAuthTokenFromStorage();
  if (!token) return "";
  try {
    const response = await profileSwitchRequest({
      url: CHAT_UID_LOOKUP_URL,
      method: "POST",
      token,
      body: {
        user_external_id: Number(maleExternalId),
        woman_external_id: Number(femaleId),
      },
    });
    return findChatUidInPayload(response);
  } catch {
    return "";
  }
}

function handleWsEventBridgeMessage(event) {
  try {
    if (wsEventsDisabled) return;
    if (!event || event.source !== window) return;
    const data = event.data;
    if (!data || data.type !== "OT4ET_WS_EVENT") return;
    const payload = data.payload;
    if (!payload || typeof payload !== "object") return;
    const socketAction = String(payload.action || "").toLowerCase();
    if (
      (socketAction === "mail" ||
        socketAction === "read_mail" ||
        socketAction === "reaction_limits") &&
      payload.female_id &&
      payload.male_external_id
    ) {
      resolveMailChatUidFromSocket(payload)
        .then(async (chatUid) => {
          if (!chatUid) return;
          const itemBase = {
            message_type:
              socketAction === "read_mail"
                ? "READ_MAIL"
                : socketAction === "reaction_limits"
                ? "READ_MAIL_CONTENT"
                : "SENT_MAIL",
            created_at: payload.created_at || new Date().toISOString(),
            chat_uid: chatUid,
            manExternalID: normalizeExternalId(payload.male_external_id),
            womanExternalID: normalizeExternalId(payload.female_id),
          };
          const withConfigType = await enrichWsEventWithConfigType(itemBase);
          const item = await enrichWsEventWithChatSpend(withConfigType);
          const monitor = ui?.balanceMonitor;
          if (monitor && typeof monitor.addWsEvent === "function") {
            monitor.addWsEvent(item);
            return;
          }
          wsEventQueue.push(item);
        })
        .catch(() => {});
      return;
    }
    const baseItem = {
      ...payload,
      manExternalID:
        normalizeExternalId(payload.manExternalID) ||
        normalizeExternalId(payload.sender_external_id) ||
        normalizeExternalId(payload.senderExternalId),
      womanExternalID:
        normalizeExternalId(payload.womanExternalID) ||
        normalizeExternalId(payload.recipient_external_id) ||
        normalizeExternalId(payload.recipientExternalId),
      message_price: payload.message_price ?? payload.messagePrice ?? null,
    };
    enrichWsEventWithConfigType(baseItem)
      .then((withConfigType) => enrichWsEventWithChatSpend(withConfigType))
      .then((item) => {
        const monitor = ui?.balanceMonitor;
        if (monitor && typeof monitor.addWsEvent === "function") {
          monitor.addWsEvent(item);
          return;
        }
        wsEventQueue.push(item);
      })
      .catch(() => {
        const monitor = ui?.balanceMonitor;
        if (monitor && typeof monitor.addWsEvent === "function") {
          monitor.addWsEvent(baseItem);
          return;
        }
        wsEventQueue.push(baseItem);
      });
  } catch {}
}

function setupSenderListMessageBridge() {
  if (senderListBridgeInitialized) return;
  senderListBridgeInitialized = true;
  try {
    window.addEventListener("message", handleSenderListBridgeMessage);
  } catch {}
}

function setupWsEventMessageBridge() {
  if (wsEventBridgeInitialized) return;
  wsEventBridgeInitialized = true;
  try {
    window.addEventListener("message", handleWsEventBridgeMessage);
  } catch {}
}

function applySenderListPayload(payload) {
  try {
    let parsed = payload;
    if (typeof parsed === "string") {
      try {
        parsed = JSON.parse(parsed);
      } catch {}
    }
    const operatorId = extractOperatorIdFromSenderListPayload(parsed);
    if (!operatorId) return;
    setOperatorInfoId(operatorId);
  } catch {}
}

function hydrateSenderListFromStorage() {
  try {
    const raw = window?.localStorage?.getItem?.("__ot4et_sender_list__");
    if (!raw) return;
    applySenderListPayload(raw);
  } catch {}
}

let monitorInjectionDone = false;

function injectMonitorNetworkHooks() {
  if (monitorInjectionDone) return;
  monitorInjectionDone = true;
  try {
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("monitorHooks.js");
    script.type = "text/javascript";
    script.dataset.endpoints = JSON.stringify(MONITOR_ENDPOINTS);
    script.onload = () => {
      try {
        script.remove();
      } catch {}
    };
    script.onerror = () => {
      monitorInjectionDone = false;
      try {
        script.remove();
      } catch {}
    };
    (document.documentElement || document.head || document.body)?.appendChild(script);
  } catch (err) {
    monitorInjectionDone = false;
    if (!isExtCtxInvalid(err)) LOG.warn("injectMonitorNetworkHooks error", err);
  }
}

injectMonitorNetworkHooks();
setupMonitorMessageBridge();
setupSenderListMessageBridge();
setupWsEventMessageBridge();
setupChatHistorySpendMessageBridge();
hydrateSenderListFromStorage();


function applyButtonIcon(btn, iconUrl, options = {}) {
  try {
    if (!btn || !iconUrl) return;
    const { iconOnly = false, size = 18 } = options;
    btn.classList.add("icon-btn");
    if (iconOnly) btn.classList.add("icon-only");
    else btn.classList.remove("icon-only");
    btn.style.setProperty("--icon-url", `url("${iconUrl}")`);
    btn.style.setProperty("--icon-size", `${Number(size) || 18}px`);
  } catch {}
}

function createInlineIcon(iconUrl, size = 16) {
  const span = document.createElement("span");
  span.className = "icon-inline";
  try {
    if (iconUrl) {
      span.style.setProperty("--icon-url", `url("${iconUrl}")`);
    }
    span.style.setProperty("--icon-inline-size", `${Number(size) || 16}px`);
  } catch {}
  return span;
}

const ACTION_LABELS = {
  SENT_TEXT: "Message",
  SENT_STICKER: "Sticker",
  SENT_MAIL: "Mail Sent",
  SENT_MAIL_FIRST: "Mail Sent",
  SENT_MAIL_SECOND: "Mail Sent",
  SENT_IMAGE: "Chat Pic Sent",
  SENT_IMAGE_MAIL: "Mail Pic Sent",
  SENT_VIDEO: "Chat Video Sent",
  SENT_VIDEO_MAIL: "Mail Video Sent",
  SENT_AUDIO: "Chat Voice Sent",
  GET_VIDEO_MAIL: "Mail Video",
  GET_VIDEO_MAIL_NEW: "Mail Video",
  GET_VIDEO: "Chat Video",
  GET_VIDEO_NEW: "Chat Video",
  GET_IMAGE_MAIL: "Mail Pic",
  GET_AUDIO_NEW: "Mail Voice",
  GET_CONTACT_APPROVE: "Get Contact",
  READ_MAIL: "Mail Read",
  SENT_VIRTUAL_GIFT: "Gift",
};
const MAIL_ACTION_OVERRIDES = new Set(["GET_AUDIO_NEW"]);

function createBalanceMonitorWidget() {
  const POLL_INTERVAL_SEC = 30;
  const ROWS_LIMIT = 0;
  const FILTER_NO_MSG = false;
  const FILTER_NO_STK = false;
  let pollTimer = null;
  let lastRenderedMaxTs = 0;
  let pollingInFlight = false;
  let fullDayRows = [];
  let fullDayTotal = 0;
  let lastBalanceDate = "";
  let wsEvents = [];
  let wsEventsDayKey = "";
  let wsSpendHydrationScheduled = false;
  let webhooksPaidFilterEnabled = false;
  let wsEventsFeatureDisabled = false;

  const widget = document.createElement("div");
  widget.id = "adb-panel";
  widget.innerHTML = `
    <div id="adb-header">
      <button id="adb-toggle" type="button" title="Баланс">
        <span id="adb-total">0.00</span>
        <span id="adb-chevron">▾</span>
      </button>
    </div>
    <div id="adb-details" aria-hidden="true" inert>
      <div class="adb-tools"></div>
      <div class="adb-tabs" role="tablist" aria-label="ADB details tabs">
        <button
          id="adb-tab-webhooks"
          class="adb-tab active"
          type="button"
          role="tab"
          aria-selected="true"
          aria-controls="adb-panel-webhooks"
        >События</button>
        <button
          id="adb-tab-balance"
          class="adb-tab"
          type="button"
          role="tab"
          aria-selected="false"
          aria-controls="adb-panel-balance"
        >Баланс</button>
      </div>
      <div
        id="adb-panel-balance"
        class="adb-tab-panel"
        role="tabpanel"
        aria-labelledby="adb-tab-balance"
      >
        <div id="adb-list"></div>
      </div>
      <div
        id="adb-panel-webhooks"
        class="adb-tab-panel"
        role="tabpanel"
        aria-labelledby="adb-tab-webhooks"
        hidden
      >
        <div id="adb-webhook-list"></div>
      </div>
    </div>
  `;

  const elements = {
    header: widget.querySelector("#adb-header"),
    toggle: widget.querySelector("#adb-toggle"),
    chevron: widget.querySelector("#adb-chevron"),
    details: widget.querySelector("#adb-details"),
    total: widget.querySelector("#adb-total"),
    list: widget.querySelector("#adb-list"),
    webhooksList: widget.querySelector("#adb-webhook-list"),
    tabBalance: widget.querySelector("#adb-tab-balance"),
    tabWebhooks: widget.querySelector("#adb-tab-webhooks"),
    panelBalance: widget.querySelector("#adb-panel-balance"),
    panelWebhooks: widget.querySelector("#adb-panel-webhooks"),
    tools: widget.querySelector(".adb-tools"),
  };

  let detailsOpen = false;
  let activeTab = "balance";
  let listHeightPx = null;
  let listHeightLimitPx = null;
  let maxContainerHeightPx = null;
  let detailsBounds = { left: null, width: null };
  let pointerOffsetPx = null;
  let latestSeenTimestamp = 0;
  let balanceFresh = false;
  let wsEventsFresh = false;
  let wsFreshTimerId = null;
  let renderedKeysAtMaxTs = new Set();
  let seenKeysAtLatestTs = new Set();

  function loadWebhooksFilterState() {
    try {
      const raw = String(window?.localStorage?.getItem?.(WS_WEBHOOK_FILTER_STORAGE_KEY) || "")
        .trim()
        .toLowerCase();
      webhooksPaidFilterEnabled = raw === "1" || raw === "true";
    } catch {
      webhooksPaidFilterEnabled = false;
    }
  }

  function persistWebhooksFilterState() {
    try {
      window?.localStorage?.setItem?.(
        WS_WEBHOOK_FILTER_STORAGE_KEY,
        webhooksPaidFilterEnabled ? "1" : "0"
      );
    } catch {}
  }

  function setWebhooksPaidFilterEnabled(next, options = {}) {
    const { persist = true, render = true } = options || {};
    webhooksPaidFilterEnabled = !!next;
    if (persist) {
      persistWebhooksFilterState();
    }
    if (render) {
      renderWsEvents();
    }
  }

  function applyWsEventsFeatureState() {
    try {
      if (elements.tabWebhooks) {
        elements.tabWebhooks.hidden = wsEventsFeatureDisabled;
      }
      if (elements.panelWebhooks) {
        elements.panelWebhooks.hidden =
          wsEventsFeatureDisabled || activeTab !== "webhooks";
      }
      if (elements.tabBalance) {
        elements.tabBalance.style.flex = "1 1 0";
      }
    } catch {}
  }

  function setWsEventsFeatureDisabled(next, options = {}) {
    const { persist = true, clearList = true } = options || {};
    wsEventsFeatureDisabled = !!next;
    if (persist) {
      try {
        window?.localStorage?.setItem?.(
          WS_EVENTS_DISABLED_STORAGE_KEY,
          wsEventsFeatureDisabled ? "1" : "0"
        );
      } catch {}
    }
    if (wsEventsFeatureDisabled) {
      wsEventsFresh = false;
      applyWsFreshState();
      if (clearList) {
        ensureWsEventsDayKey();
        wsEvents = [];
        renderWsEvents();
        persistWsEventsCache();
      }
      if (activeTab === "webhooks") {
        switchTab("balance");
      }
    } else {
      renderWsEvents();
    }
    applyWsEventsFeatureState();
  }

  function isWebhookRowPaidCandidate(item) {
    if (!item || typeof item !== "object") return false;
    const hasSpendIcon = !!item.chatHasSpend;
    const roundedPrice = Number(item.messagePriceRounded);
    const hasPrice = Number.isFinite(roundedPrice) && roundedPrice > 0;
    return hasSpendIcon || hasPrice;
  }

  function syncLogoWhiteSquareBalanceFromWidget() {
    try {
      const text = elements.total?.textContent || "";
      setLogoWhiteSquareBalanceValue(text);
    } catch {}
  }


  function applyListHeight() {
    try {
      if (!elements?.list && !elements?.webhooksList) return;
      let target = null;
      if (Number.isFinite(listHeightPx) && listHeightPx > 0) {
        target = listHeightPx;
      }
      if (Number.isFinite(listHeightLimitPx) && listHeightLimitPx > 0) {
        target =
          target === null ? listHeightLimitPx : Math.min(target, listHeightLimitPx);
      }
      if (Number.isFinite(target) && target > 0) {
        const clamp = Math.max(1, Math.round(target));
        if (elements.list) {
          elements.list.style.height = `${clamp}px`;
          elements.list.style.maxHeight = `${clamp}px`;
          elements.list.style.minHeight = `${clamp}px`;
        }
        if (elements.webhooksList) {
          elements.webhooksList.style.height = `${clamp}px`;
          elements.webhooksList.style.maxHeight = `${clamp}px`;
          elements.webhooksList.style.minHeight = `${clamp}px`;
        }
      } else {
        if (elements.list) {
          elements.list.style.height = "";
          elements.list.style.maxHeight = "";
          elements.list.style.minHeight = "";
        }
        if (elements.webhooksList) {
          elements.webhooksList.style.height = "";
          elements.webhooksList.style.maxHeight = "";
          elements.webhooksList.style.minHeight = "";
        }
      }
    } catch {}
  }

  function setListHeight(px) {
    try {
      const num = Number(px);
      listHeightPx = Number.isFinite(num) && num > 0 ? num : null;
      applyListHeight();
    } catch {}
  }

  function setListHeightLimit(px) {
    try {
      const num = Number(px);
      listHeightLimitPx = Number.isFinite(num) && num > 0 ? num : null;
      applyListHeight();
    } catch {}
  }

  function applyDetailsBounds() {
    try {
      if (!elements?.details) return;
      if (Number.isFinite(detailsBounds.left)) {
        elements.details.style.left = `${Math.round(detailsBounds.left)}px`;
      } else {
        elements.details.style.left = "";
      }
      elements.details.style.right = "";
      if (Number.isFinite(detailsBounds.width) && detailsBounds.width > 0) {
        const clamp = Math.max(1, Math.round(detailsBounds.width));
        elements.details.style.width = `${clamp}px`;
        elements.details.style.maxWidth = `${clamp}px`;
        elements.details.style.minWidth = `${clamp}px`;
      } else {
        elements.details.style.width = "";
        elements.details.style.maxWidth = "";
        elements.details.style.minWidth = "";
      }
    } catch {}
  }

  function setDetailsBounds(leftPx, widthPx) {
    try {
      const left = Number(leftPx);
      const width = Number(widthPx);
      detailsBounds = {
        left: Number.isFinite(left) ? left : null,
        width: Number.isFinite(width) && width > 0 ? width : null,
      };
      applyDetailsBounds();
    } catch {}
  }

  function applyPointerOffset() {
    try {
      if (!elements?.details) return;
      if (Number.isFinite(pointerOffsetPx) && pointerOffsetPx >= 0) {
        elements.details.style.setProperty(
          "--adb-pointer-left",
          `${Math.round(pointerOffsetPx)}px`
        );
      } else {
        elements.details.style.removeProperty("--adb-pointer-left");
      }
    } catch {}
  }

  function setPointerOffset(px) {
    try {
      const num = Number(px);
      pointerOffsetPx = Number.isFinite(num) && num >= 0 ? num : null;
      applyPointerOffset();
    } catch {}
  }

  function applyMaxContainerHeight() {
    try {
      if (!elements?.details) return;
      if (Number.isFinite(maxContainerHeightPx) && maxContainerHeightPx > 0) {
        const clamp = Math.max(1, Math.round(maxContainerHeightPx));
        elements.details.style.maxHeight = `${clamp}px`;
      } else {
        elements.details.style.maxHeight = "";
      }
    } catch {}
  }

  function setMaxContainerHeight(px) {
    try {
      const num = Number(px);
      maxContainerHeightPx = Number.isFinite(num) && num > 0 ? num : null;
      applyMaxContainerHeight();
    } catch {}
  }

  function switchTab(tabKey) {
    const requested = tabKey === "webhooks" ? "webhooks" : "balance";
    const next =
      wsEventsFeatureDisabled && requested === "webhooks" ? "balance" : requested;
    activeTab = next;
    const balanceActive = next === "balance";
    if (elements.tabBalance) {
      elements.tabBalance.classList.toggle("active", balanceActive);
      elements.tabBalance.setAttribute("aria-selected", balanceActive ? "true" : "false");
    }
    if (elements.tabWebhooks) {
      elements.tabWebhooks.classList.toggle("active", !balanceActive);
      elements.tabWebhooks.setAttribute("aria-selected", !balanceActive ? "true" : "false");
    }
    if (elements.panelBalance) {
      elements.panelBalance.hidden = !balanceActive;
    }
    if (elements.panelWebhooks) {
      elements.panelWebhooks.hidden = balanceActive || wsEventsFeatureDisabled;
    }
    if (!balanceActive && detailsOpen) {
      markWsEventsSeen();
    }
    applyListHeight();
    applyWsEventsFeatureState();
  }

  function setDetailsOpen(open) {
    const nextOpen = !!open;
    if (nextOpen) {
      closeUserInfoMenu();
    }
    const wasOpen = detailsOpen;
    detailsOpen = nextOpen;
    if (elements.details) {
      elements.details.classList.toggle("open", detailsOpen);
      elements.details.setAttribute("aria-hidden", detailsOpen ? "false" : "true");
      try {
        if (detailsOpen) elements.details.removeAttribute("inert");
        else elements.details.setAttribute("inert", "");
      } catch {}
    }
    if (elements.header) {
      if (detailsOpen) elements.header.classList.add("open");
      else elements.header.classList.remove("open");
    }
    if (elements.toggle) {
      elements.toggle.setAttribute("aria-expanded", detailsOpen ? "true" : "false");
      elements.toggle.title = detailsOpen ? "Скрыть детали" : "Показать детали";
    }
    if (detailsOpen) {
      if (wsFreshTimerId) {
        clearTimeout(wsFreshTimerId);
        wsFreshTimerId = null;
      }
      applyListHeight();
      applyDetailsBounds();
      applyPointerOffset();
      applyMaxContainerHeight();
      const raf = typeof requestAnimationFrame === "function"
        ? requestAnimationFrame
        : (cb) => setTimeout(cb, 0);
      raf(() => {
        try {
          updateLabelScrolling();
        } catch (e) {
          LOG.warn("Balance monitor: updateLabelScrolling failed", e);
        }
      });
      markAllSeen({ clearRows: false });
      wsFreshTimerId = setTimeout(() => {
        wsFreshTimerId = null;
        wsEventsFresh = false;
        applyWsFreshState();
        markWsEventsSeen();
      }, 10000);
    } else if (wasOpen) {
      markAllSeen({ clearRows: true });
    }
  }

  elements.toggle?.setAttribute("aria-controls", "adb-details");

  elements.toggle?.addEventListener("click", () => {
    setDetailsOpen(!detailsOpen);
  });
  loadWebhooksFilterState();
  elements.tabBalance?.addEventListener("click", () => switchTab("balance"));
  elements.tabWebhooks?.addEventListener("click", () => switchTab("webhooks"));

  function renderGroupedRows(items) {
    if (!elements.list) return 0;
    if (!items?.length) {
      elements.list.innerHTML = "";
      renderedKeysAtMaxTs = new Set();
      return 0;
    }
    const normalized = items
      .map((item) => {
        const val = Number.parseFloat(item?.operator_price || 0);
        return {
          action_type: item?.action_type,
          operator_price: Number.isFinite(val) ? val : 0,
        };
      })
      .filter((item) => Number.isFinite(item.operator_price) && item.operator_price > 0);
    if (!normalized.length) {
      elements.list.innerHTML = "";
      renderedKeysAtMaxTs = new Set();
      return 0;
    }
    const totalValue = normalized.reduce((sum, item) => sum + item.operator_price, 0);
    const colorMap = new Map();
    normalized
      .slice()
      .sort((a, b) => {
        const la = getActionLabel(a?.action_type) || a?.action_type || "";
        const lb = getActionLabel(b?.action_type) || b?.action_type || "";
        return String(la).localeCompare(String(lb));
      })
      .forEach((item, index) => {
        const hue = (index * 137.508) % 360;
        colorMap.set(item?.action_type, `hsl(${hue.toFixed(1)} 62% 52%)`);
      });
    const colorForKey = (key) => colorMap.get(key) || "hsl(200 60% 50%)";
    const rows = normalized
      .slice()
      .sort((a, b) => {
        if (b.operator_price !== a.operator_price) {
          return b.operator_price - a.operator_price;
        }
        const la = getActionLabel(a?.action_type) || a?.action_type || "";
        const lb = getActionLabel(b?.action_type) || b?.action_type || "";
        return String(la).localeCompare(String(lb));
      })
      .map((item) => {
        try {
          const price = item.operator_price.toFixed(2);
          const label = getActionLabel(item?.action_type) || item?.action_type || "";
          const color = colorForKey(item?.action_type);
          const rowInner = `
            <span class="adb-legend-swatch" style="background:${color}"></span>
            <span class="adb-label" style="color:${color}">
              <span class="adb-label-inner">${label}</span>
            </span>
            <span class="adb-price" style="color:${color}">${price}</span>
          `.trim();
          return `<div class="adb-legend-row" data-key="${item?.action_type || ""}" title="${label}: ${price}">${rowInner}</div>`;
        } catch (err) {
          LOG.warn("Balance monitor: failed to render grouped row", err);
          return "";
        }
      })
      .filter(Boolean)
      .join("");
    const cx = 50;
    const cy = 50;
    const r = 45;
    const toPoint = (angleDeg) => {
      const rad = (angleDeg * Math.PI) / 180;
      return {
        x: (cx + r * Math.cos(rad)).toFixed(2),
        y: (cy + r * Math.sin(rad)).toFixed(2),
      };
    };
    let currentAngle = -90;
    const pieSlices = normalized
      .slice()
      .sort((a, b) => b.operator_price - a.operator_price)
      .map((item) => {
        const value = item.operator_price;
        const sliceAngle = totalValue > 0 ? (value / totalValue) * 360 : 0;
        const color = colorForKey(item?.action_type);
        if (sliceAngle >= 360 || totalValue === value) {
          return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"></circle>`;
        }
        const start = toPoint(currentAngle);
        const end = toPoint(currentAngle + sliceAngle);
        const largeArc = sliceAngle > 180 ? 1 : 0;
        const path = [
          `M ${cx} ${cy}`,
          `L ${start.x} ${start.y}`,
          `A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`,
          "Z",
        ].join(" ");
        currentAngle += sliceAngle;
        return `<path d="${path}" fill="${color}"></path>`;
      })
      .join("");
    const pie = `
      <div class="adb-pie-wrap">
        <div class="adb-legend">${rows}</div>
        <svg class="adb-pie" viewBox="0 0 100 100" role="img" aria-hidden="true">
          ${pieSlices}
        </svg>
      </div>
    `.trim();
    elements.list.innerHTML = pie;
    renderedKeysAtMaxTs = new Set();
    updateLabelScrolling();
    return 0;
  }

  function formatWsTime(value, messageType = "") {
    if (!value) return "";
    const raw = String(value || "").trim();
    const type = String(messageType || "").toUpperCase();
    // Mail-like socket timestamps often come as "YYYY-MM-DD HH:mm:ss" without TZ.
    // Server can send these as UTC; parse explicitly as UTC and render in local TZ.
    if (raw && type.includes("MAIL")) {
      const match = raw.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})(?::\d{2})?$/);
      if (match) {
        const datePart = match[1].split("-").map(Number);
        const hour = Number(match[2]);
        const minute = Number(match[3]);
        if (
          datePart.length === 3 &&
          Number.isFinite(datePart[0]) &&
          Number.isFinite(datePart[1]) &&
          Number.isFinite(datePart[2]) &&
          Number.isFinite(hour) &&
          Number.isFinite(minute)
        ) {
          const utcDate = new Date(
            Date.UTC(datePart[0], datePart[1] - 1, datePart[2], hour, minute, 0)
          );
          if (!Number.isNaN(utcDate.getTime())) {
            try {
              return utcDate.toLocaleTimeString(undefined, {
                hour: "2-digit",
                minute: "2-digit",
              });
            } catch {
              return utcDate.toTimeString().slice(0, 5);
            }
          }
        }
      }
    }
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    try {
      return date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return date.toTimeString().slice(0, 5);
    }
  }

  function buildWsLink(messageType, chatUid) {
    if (!chatUid) return "";
    const type = String(messageType || "").toLowerCase();
    const base = type.includes("mail")
      ? "https://alpha.date/letter/"
      : "https://alpha.date/chat/";
    return `${base}${encodeURIComponent(chatUid)}`;
  }

  function renderWsEvents() {
    if (!elements.webhooksList) return;
    if (wsEventsFeatureDisabled) {
      elements.webhooksList.innerHTML = "";
      return;
    }
    const sourceEvents = webhooksPaidFilterEnabled
      ? wsEvents.filter((item) => isWebhookRowPaidCandidate(item))
      : wsEvents;
    if (!sourceEvents.length) {
      elements.webhooksList.innerHTML =
        webhooksPaidFilterEnabled
          ? '<div class="adb-empty">Нет событий с иконкой или ценой</div>'
          : '<div class="adb-empty">Нет webhook-событий</div>';
      return;
    }
    const rows = sourceEvents
      .map((item) => {
        const messageType = String(item?.message_type || "").trim();
        const createdAt = item?.created_at || "";
        const chatUid = String(item?.chat_uid || "").trim();
        if (!messageType || !chatUid) return "";
        const timeLabel = formatWsTime(createdAt, messageType);
        const safeType = escapeHtml(messageType);
        const safeTime = escapeHtml(timeLabel || "");
        const link = buildWsLink(messageType, chatUid);
        const safeHref = escapeHtml(link);
        const typeClass = getEventRowClassByType(item?.configType);
        const spendTitle = "Платник";
        const spendIcon = item?.chatHasSpend
          ? `<span class="adb-spend-flag" title="${escapeHtml(spendTitle)}"></span>`
          : "";
        const roundedPrice = Number(item?.messagePriceRounded);
        const priceBadge = Number.isFinite(roundedPrice) && roundedPrice > 0
          ? `<span class="adb-price-badge" title="Цена сообщения">${escapeHtml(
              String(Math.round(roundedPrice))
            )}</span>`
          : "";
        const rowClass = [item?.seen ? "adb-row" : "adb-row new", typeClass]
          .filter(Boolean)
          .join(" ");
        return `
          <a class="${rowClass}" href="${safeHref}" target="_blank" rel="noopener" title="${safeType}">
            <span class="adb-time">${safeTime}</span>
            <span class="adb-label"><span class="adb-label-inner">${safeType}</span></span>${priceBadge}${spendIcon}
          </a>
        `.trim();
      })
      .filter(Boolean)
      .join("");
    elements.webhooksList.innerHTML = rows || '<div class="adb-empty">Нет webhook-событий</div>';
    updateLabelScrolling();
    scheduleWsSpendHydration();
  }

  function scheduleWsSpendHydration() {
    if (wsSpendHydrationScheduled) return;
    wsSpendHydrationScheduled = true;
    setTimeout(async () => {
      wsSpendHydrationScheduled = false;
      try {
        if (!Array.isArray(wsEvents) || !wsEvents.length) return;
        let changed = false;
        let unresolvedLeft = false;
        const maxToProcess = 20;
        let processed = 0;
        for (let i = 0; i < wsEvents.length; i += 1) {
          const item = wsEvents[i];
          if (!item || item.chatSpendChecked) continue;
          unresolvedLeft = true;
          if (processed >= maxToProcess) continue;
          processed += 1;
          const chatUid = normalizeWsChatUid(item.chat_uid);
          if (!chatUid) {
            wsEvents[i] = { ...item, chatSpendChecked: true };
            changed = true;
            continue;
          }
          const spendInfo = await resolveWsEventHasSpendByChatUid(chatUid);
          if (!spendInfo) continue;
          wsEvents[i] = {
            ...item,
            chatHasSpend: !!spendInfo.hasSpend,
            chatMaxSpendAllCredits: Number(spendInfo.maxSpend) || 0,
            chatSpendChecked: true,
          };
          changed = true;
        }
        if (changed) {
          renderWsEvents();
          persistWsEventsCache();
        } else if (unresolvedLeft) {
          // Retry later for temporary auth/network misses.
          setTimeout(() => {
            scheduleWsSpendHydration();
          }, 1500);
        }
      } catch {}
    }, 0);
  }

  function persistWsEventsCache() {
    try {
      const payload = {
        dayKey: wsEventsDayKey || getKyivDayKey(),
        items: wsEvents,
      };
      setStore({
        [WS_EVENTS_STORAGE_KEY]: payload,
      });
      try {
        window?.localStorage?.setItem?.(
          WS_EVENTS_FALLBACK_STORAGE_KEY,
          JSON.stringify(payload)
        );
      } catch {}
    } catch {}
  }

  function ensureWsEventsDayKey() {
    const currentKey = getKyivDayKey();
    if (!wsEventsDayKey) {
      wsEventsDayKey = currentKey;
      return;
    }
    if (wsEventsDayKey !== currentKey) {
      wsEventsDayKey = currentKey;
      wsEvents = [];
      renderWsEvents();
      persistWsEventsCache();
    }
  }

  async function loadWsEventsCache() {
    try {
      if (wsEventsFeatureDisabled) {
        wsEventsDayKey = getKyivDayKey();
        wsEvents = [];
        renderWsEvents();
        return;
      }
      const store = await getStore([WS_EVENTS_STORAGE_KEY]);
      let cached = store[WS_EVENTS_STORAGE_KEY];
      if (!cached || typeof cached !== "object") {
        try {
          const raw = window?.localStorage?.getItem?.(WS_EVENTS_FALLBACK_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === "object") {
              cached = parsed;
            }
          }
        } catch {}
      }
      const todayKey = getKyivDayKey();
      if (cached && typeof cached === "object" && cached.dayKey === todayKey) {
        wsEventsDayKey = cached.dayKey;
        wsEvents = Array.isArray(cached.items) ? cached.items : [];
        renderWsEvents();
        return;
      }
      wsEventsDayKey = todayKey;
      wsEvents = [];
      renderWsEvents();
      persistWsEventsCache();
    } catch {
      renderWsEvents();
    }
  }

  function updateLabelScrolling() {
    try {
      if (!elements.details) return;
      const apply = () => {
        elements.details.querySelectorAll(".adb-label").forEach((label) => {
          const inner = label.querySelector(".adb-label-inner");
          if (!inner) return;
          delete label.dataset.scrollable;
          try {
            inner.style.removeProperty("--adb-marquee-distance");
            inner.style.removeProperty("--adb-marquee-duration");
            inner.style.removeProperty("transform");
          } catch {}
          const available = label.clientWidth || 0;
          const full = inner.scrollWidth || 0;
          const overflow = full - available;
          if (available > 0 && overflow > 4) {
            label.dataset.scrollable = "1";
            const distance = -(overflow + 12);
            const duration = Math.min(12, Math.max(4, overflow / 18));
            inner.style.setProperty("--adb-marquee-distance", `${distance}px`);
            inner.style.setProperty(
              "--adb-marquee-duration",
              `${duration.toFixed(2)}s`
            );
          }
        });
      };
      const raf = typeof requestAnimationFrame === "function"
        ? requestAnimationFrame
        : (cb) => setTimeout(cb, 0);
      if (elements.details && elements.details.offsetWidth) {
        apply();
      } else {
        raf(apply);
      }
    } catch {}
  }

  function stopPolling() {
    if (pollTimer) {
      clearTimeout(pollTimer);
      pollTimer = null;
    }
  }

  function scheduleNextPoll(delayMs) {
    const intervalMs = Math.max(5, Number(POLL_INTERVAL_SEC) || 30) * 1000;
    const wait = typeof delayMs === "number" && delayMs >= 0 ? delayMs : intervalMs;
    pollTimer = setTimeout(async () => {
      await poll();
      scheduleNextPoll();
    }, wait);
  }

  async function poll() {
    if (pollingInFlight) return;
    pollingInFlight = true;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        elements.total.textContent = "0.00";
        syncLogoWhiteSquareBalanceFromWidget();
        elements.list.innerHTML = "";
        // No hourly stats for grouped response.
        fullDayRows = [];
        fullDayTotal = 0;
        lastBalanceDate = "";
        updateBalanceHourlyHistoryFromRows([]);
        balanceFresh = false;
        applyBalanceFreshState();
        return;
      }
      if (firstBalancePollPending) {
        firstBalancePollPending = false;
        try {
          await refreshLogoWhiteSquareProfiles();
        } catch {}
      } else {
        await ensureProfilesRefreshedBeforeStats({ forceIfEmpty: true });
      }
      const today = new Date().toISOString().slice(0, 10);
      const url = `https://alpha.date/api/statistic/profileActionGrouped?date_from=${today}&date_to=${today}`;
      const resp = await fetch(url, {
        credentials: "include",
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) {
        LOG.warn("Balance monitor: stats fetch failed", resp.status, resp.statusText);
        return;
      }
      const data = await resp.json();
      if (data?.status === false) return;
      let grouped = null;
      if (Array.isArray(data.response) && data.response.length) {
        grouped = data.response.find(
          (item) => item && typeof item === "object" && !Array.isArray(item)
        );
      } else if (data.response && typeof data.response === "object") {
        grouped = data.response;
      } else if (data && typeof data === "object") {
        grouped = data;
      }
      if (!grouped || typeof grouped !== "object") {
        elements.total.textContent = "0.00";
        syncLogoWhiteSquareBalanceFromWidget();
        elements.list.innerHTML = "";
        // No hourly stats for grouped response.
        lastRenderedMaxTs = 0;
        fullDayRows = [];
        fullDayTotal = 0;
        lastBalanceDate = today;
        updateBalanceHourlyHistoryFromRows([]);
        balanceFresh = false;
        applyBalanceFreshState();
        return;
      }
      const entries = Object.keys(grouped)
        .filter((key) => key !== "date" && key !== "total")
        .map((key) => ({
          action_type: key,
          operator_price: grouped[key],
        }))
        .filter((item) => {
          const val = Number.parseFloat(item?.operator_price || 0);
          return Number.isFinite(val) && val > 0;
        });
      const totalRaw = Number.parseFloat(grouped?.total || 0);
      const total = Number.isFinite(totalRaw)
        ? totalRaw
        : entries.reduce((sum, item) => {
            const val = Number.parseFloat(item?.operator_price || 0);
            return sum + (Number.isFinite(val) ? val : 0);
          }, 0);
      elements.total.textContent = total.toFixed(2);
      syncLogoWhiteSquareBalanceFromWidget();
      const filtered = entries.filter((item) => {
        const type = item?.action_type;
        if (FILTER_NO_MSG && type === "SENT_TEXT") return false;
        if (FILTER_NO_STK && type === "SENT_STICKER") return false;
        return true;
      });
      fullDayRows = entries.slice();
      fullDayTotal = total;
      lastBalanceDate =
        grouped?.date && grouped.date !== "Total" ? grouped.date : today;
      updateBalanceHourlyHistoryFromRows([]);
      // No hourly stats for grouped response.
      const rowsCount = Math.max(0, Number(ROWS_LIMIT) || 0);
      const rows = rowsCount > 0 ? filtered.slice(0, rowsCount) : filtered;
      renderGroupedRows(rows);
      lastRenderedMaxTs = 0;
      balanceFresh = false;
      applyBalanceFreshState();
      try {
        const ids = getProfileIdsFromItems(logoWhiteSquareProfilesState.items);
        await sendProfileShiftDeltas(ids);
      } catch {}
      try {
        await sendOperatorShiftSnapshot(total);
      } catch {}
    } catch (err) {
      LOG.warn("Balance monitor: stats poll failed", err);
    } finally {
      pollingInFlight = false;
    }
  }

  function startPolling(delayMs) {
    stopPolling();
    scheduleNextPoll(
      typeof delayMs === "number" && delayMs >= 0 ? delayMs : 0
    );
  }

  function applyBalanceFreshState() {
    try {
      if (!elements.total) return;
      if (balanceFresh) elements.total.classList.add("fresh");
      else elements.total.classList.remove("fresh");
    } catch {}
  }

  function applyWsFreshState() {
    try {
      if (!elements.total) return;
      if (wsEventsFresh) elements.total.classList.add("ws-fresh");
      else elements.total.classList.remove("ws-fresh");
    } catch {}
  }

  function markWsEventsSeen() {
    let changed = false;
    wsEvents = wsEvents.map((item) => {
      if (!item || item.seen) return item;
      changed = true;
      return { ...item, seen: true };
    });
    if (changed) {
      renderWsEvents();
      persistWsEventsCache();
    }
  }

  function clearWsEventsForNewDay() {
    try {
      wsEventsDayKey = getKyivDayKey();
      wsEvents = [];
      wsEventsFresh = false;
      if (wsFreshTimerId) {
        clearTimeout(wsFreshTimerId);
        wsFreshTimerId = null;
      }
      renderWsEvents();
      applyWsFreshState();
      persistWsEventsCache();
    } catch {}
  }


  function hasUnseenRows(newestTs) {
    if (!newestTs || latestSeenTimestamp === 0) return false;
    if (newestTs > latestSeenTimestamp) return true;
    if (newestTs === latestSeenTimestamp) {
      for (const key of renderedKeysAtMaxTs) {
        if (!seenKeysAtLatestTs.has(key)) return true;
      }
    }
    return false;
  }

  function markAllSeen(options = {}) {
    const { clearRows = false } = options;
    latestSeenTimestamp = Math.max(latestSeenTimestamp, lastRenderedMaxTs || 0);
    if (latestSeenTimestamp > 0 && latestSeenTimestamp === lastRenderedMaxTs) {
      seenKeysAtLatestTs = new Set(renderedKeysAtMaxTs);
    } else if (latestSeenTimestamp === 0) {
      seenKeysAtLatestTs = new Set();
    }
    balanceFresh = false;
    applyBalanceFreshState();
    if (clearRows) {
      try {
        elements.list
          ?.querySelectorAll(".adb-row.new")
          ?.forEach((node) => node.classList.remove("new"));
      } catch {}
    }
  }
  setDetailsOpen(false);
  switchTab("webhooks");
  setWsEventsFeatureDisabled(wsEventsDisabled, { persist: false, clearList: wsEventsDisabled });
  applyBalanceFreshState();
  applyWsFreshState();
  syncLogoWhiteSquareBalanceFromWidget();
  void loadWsEventsCache();
  startPolling();

  return {
    element: widget,
    destroy() {
      stopPolling();
      if (wsFreshTimerId) {
        clearTimeout(wsFreshTimerId);
        wsFreshTimerId = null;
      }
    },
    setListHeight,
    setListHeightLimit,
    setDetailsBounds,
    setPointerOffset,
    setMaxContainerHeight,
    closeDetails: () => setDetailsOpen(false),
    switchTab,
    getWebhooksPaidFilterEnabled: () => webhooksPaidFilterEnabled,
    setWebhooksPaidFilterEnabled,
    refreshWsEventsFilter: () => renderWsEvents(),
    getWsEventsFeatureDisabled: () => wsEventsFeatureDisabled,
    setWsEventsFeatureDisabled,
    clearWsEventsForNewDay,
    addWsEvent(eventPayload) {
      try {
        if (wsEventsFeatureDisabled) return;
        if (!eventPayload || typeof eventPayload !== "object") return;
        const messageType = String(eventPayload.message_type || "").trim();
        const createdAt = eventPayload.created_at || "";
        const chatUid = String(eventPayload.chat_uid || "").trim();
        if (!messageType || !chatUid) return;
        const manExternalID = normalizeExternalId(eventPayload.manExternalID);
        const womanExternalID = normalizeExternalId(eventPayload.womanExternalID);
        const configTypeRaw = Number(eventPayload.configType);
        const configType =
          configTypeRaw === 1 || configTypeRaw === 2 || configTypeRaw === 3
            ? configTypeRaw
            : null;
        const priceInfo = normalizeWsMessagePrice(eventPayload.message_price);
        ensureWsEventsDayKey();
        wsEvents.unshift({
          message_type: messageType,
          created_at: createdAt,
          chat_uid: chatUid,
          manExternalID,
          womanExternalID,
          configType,
          chatHasSpend: !!eventPayload.chatHasSpend,
          chatMaxSpendAllCredits: Number(eventPayload.chatMaxSpendAllCredits) || 0,
          chatSpendChecked:
            typeof eventPayload.chatSpendChecked === "boolean"
              ? eventPayload.chatSpendChecked
              : !!eventPayload.chatHasSpend,
          messagePriceRaw: priceInfo?.raw ?? null,
          messagePriceRounded: priceInfo?.rounded ?? null,
          seen: false,
        });
        if (wsEvents.length > 200) {
          wsEvents = wsEvents.slice(0, 200);
        }
        renderWsEvents();
        wsEventsFresh = true;
        applyWsFreshState();
        persistWsEventsCache();
      } catch {}
    },
  };
}

const TEMPLATE_STORAGE_KEY = "templatesTree";
const TEMPLATE_ROOT_ID = "templates-root";
const TEMPLATE_LAST_FOLDER_KEY = "templatesLastFolder";
const TEMPLATE_TYPE_FOLDER = "folder";
const TEMPLATE_TYPE_TEMPLATE = "template";
const TEMPLATE_DEFAULT_FOLDERS = [
  { key: "favorites", name: "Избранное" },
  { key: "messages", name: "Сообщения" },
  { key: "letters", name: "Письма" },
];

const CHAT_SELECTORS = [
  ".styles_clmn_3_chat_textarea_inner__DZxvk",
  ".styles_clmn_3_chat_textarea_inner__R5NmP",
  "textarea.chat-input",
  "[data-testid='chat-input']",
];

const LETTER_SELECTORS = [
  ".styles_clmn_3_chat_textarea_inner__R5NmP",
  ".styles_clmn_3_chat_textarea_inner__DZxvk",
  "textarea.letter-input",
  "[data-testid='letter-input']",
];

// Silently ignore unhandled rejections caused by extension reloads
try {
  window.addEventListener(
    "unhandledrejection",
    (ev) => {
      try {
        if (isExtCtxInvalid(ev?.reason)) {
          ev.preventDefault();
        }
      } catch {}
    },
    { capture: true }
  );
} catch {}
// История: селекторы контейнера/сообщений (с запасными вариантами)
const MSG_LIST_SEL = ".styles_clmn_3_chat_list__c6Bey"; // основной контейнер (fallback ниже в getMsgContainer)
const MSG_ITEM_CLASS = "styles_clmn_3_chat_message__"; // используем префикс (хэш может меняться)
const MSG_LEFT_CLASS = "styles_left__"; // используем префикс (хэш может меняться)
const DRAWER_ANCHOR_SELECTORS = [
  '[class*="Notification_clmn_4__"]',
  ".styles_clmn_4__UKvqP",
  '[class*="styles_clmn_4__"]',
  '[class*="clmn_4__"]',
  '[data-testid="chat-layout-right"]',
  '[data-testid="chat-layout"] [class*="clmn_4__"]',
];
const LETTERS_NAV_SELECTOR =
  '[class*="styles_clmn_3_chat_head_nav_btn__"][class*="styles_letters__"]';
const LETTERS_NEW_WINDOW_STORAGE_KEY = "lettersOpenInNewWindow";
const LETTERS_OPEN_HOTKEY_STORAGE_KEY = "lettersOpenHotkey";
const LETTERS_OPEN_HOTKEY_DEFAULT = "ctrl+l";
const PROFILE_PHOTO_HOTKEY_STORAGE_KEY = "profilePhotoHotkey";
const PROFILE_PHOTO_HOTKEY_DEFAULT = "ctrl+p";
const TRANSLATE_SEND_HOTKEY_STORAGE_KEY = "translateSendHotkey";
const TRANSLATE_SEND_HOTKEY_DEFAULT = "ctrl+g";
const OPERATOR_WAIT_SQUARE_MESSAGE = "Включите сендер";
const OPERATOR_WAIT_MODAL_MESSAGE =
  "Для начала работы с расширением OT4ET включите сендер";
const CHAT_UID_LOOKUP_URL =
  "https://alpha.date/api/chatList/chatUidByProfileAndUserIds";

function getMsgContainer() {
  try {
    return (
      document.querySelector('[data-testid="chat-body"]') ||
      document.querySelector(".styles_clmn_3_chat_list__c6Bey") ||
      document.querySelector('[class*="styles_clmn_3_chat_list__"]') ||
      document.querySelector('[class*="styles_clmn_3_chat_list_wrap__"]') ||
      null
    );
  } catch {
    return null;
  }
}
const qs = (s, r = document) => r.querySelector(s);
function isVisible(el) {
  if (!el) return false;
  const r = el.getBoundingClientRect();
  const style = window.getComputedStyle(el);
  return (
    !!(r.width || r.height) &&
    style.visibility !== "hidden" &&
    style.display !== "none"
  );
}

function getDrawerAnchorElement() {
  let fallback = null;
  let bestVisible = null;
  let bestScore = -Infinity;
  try {
    for (const selector of DRAWER_ANCHOR_SELECTORS) {
      if (!selector) continue;
      const nodes = document.querySelectorAll(selector);
      if (!nodes || !nodes.length) continue;
      for (const el of nodes) {
        if (!fallback) fallback = el;
        if (!isVisible(el)) continue;
        const rect = el.getBoundingClientRect();
        const width = Math.max(0, Number(rect?.width) || 0);
        const height = Math.max(0, Number(rect?.height) || 0);
        const left = Number(rect?.left) || 0;
        // Prefer large, visible anchors located on the right side.
        const score = width * height + left * 1000;
        if (score > bestScore) {
          bestScore = score;
          bestVisible = el;
        }
      }
    }
  } catch {}
  return bestVisible || fallback;
}

function canRenderDrawerInCurrentContext() {
  const anchor = getDrawerAnchorElement();
  return !!(anchor && isVisible(anchor));
}
const text = (el) => (el?.textContent || "").trim();
const onlyDigits = (s) => (s || "").replace(/\D/g, "");
function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function updateSettingsMenuPosition() {
  if (!settingsMenuOpen || !ui?.settingsMenu || !ui?.settingsBtn) return;
  try {
    const buttonRect = ui.settingsBtn.getBoundingClientRect();
    const parentRect = ui.settingsMenu.offsetParent?.getBoundingClientRect?.() || null;
    if (parentRect) {
      const topOffset = Math.max(0, buttonRect.bottom - parentRect.top + 8);
      ui.settingsMenu.style.setProperty("--user-info-menu-top", `${topOffset}px`);
    }
  } catch {}
}

function ensureSettingsMenuListeners() {
  if (settingsMenuCleanup) return;
  const handler = () => updateSettingsMenuPosition();
  window.addEventListener("resize", handler, { passive: true });
  window.addEventListener("scroll", handler, { passive: true });
  const onDocClick = (event) => {
    if (!settingsMenuOpen) return;
    const path = event?.composedPath?.() || [];
    if (path.includes(ui.settingsMenu) || path.includes(ui.settingsBtn)) return;
    toggleSettingsMenu(false);
  };
  document.addEventListener("click", onDocClick, true);
  settingsMenuCleanup = () => {
    window.removeEventListener("resize", handler);
    window.removeEventListener("scroll", handler);
    document.removeEventListener("click", onDocClick, true);
    settingsMenuCleanup = null;
  };
}

function toggleSettingsMenu(forceOpen) {
  if (isExtensionLocked()) return;
  if (!ui?.settingsMenu || !ui?.settingsBtn) return;
  const next = typeof forceOpen === "boolean" ? forceOpen : !settingsMenuOpen;
  settingsMenuOpen = next;
  ui.settingsMenu.hidden = !next;
  ui.settingsBtn.classList.toggle("active", next);
  if (next) {
    ensureSettingsMenuListeners();
    updateSettingsMenuPosition();
  } else if (settingsMenuCleanup) {
    settingsMenuCleanup();
  }
}

function setLettersNewWindowEnabled(next, options = {}) {
  const { persist = true } = options || {};
  lettersOpenInNewWindow = !!next;
  if (ui?.lettersNewWindowToggle) {
    ui.lettersNewWindowToggle.checked = lettersOpenInNewWindow;
  }
  if (persist) {
    setStore({ [LETTERS_NEW_WINDOW_STORAGE_KEY]: lettersOpenInNewWindow });
  }
}

function getWebhooksPaidEventsFilterEnabled() {
  try {
    if (ui?.balanceMonitor && typeof ui.balanceMonitor.getWebhooksPaidFilterEnabled === "function") {
      return !!ui.balanceMonitor.getWebhooksPaidFilterEnabled();
    }
  } catch {}
  try {
    const raw = String(window?.localStorage?.getItem?.(WS_WEBHOOK_FILTER_STORAGE_KEY) || "")
      .trim()
      .toLowerCase();
    return raw === "1" || raw === "true";
  } catch {
    return false;
  }
}

function setWebhooksPaidFilterControlDisabled(disabled) {
  const next = !!disabled;
  try {
    if (ui?.webhooksPaidFilterToggle) {
      ui.webhooksPaidFilterToggle.disabled = next;
      const row = ui.webhooksPaidFilterToggle.closest?.(".settings-row");
      if (row) row.classList.toggle("is-disabled", next);
    }
  } catch {}
}

function getWsEventsDisabledSetting() {
  try {
    const raw = String(
      window?.localStorage?.getItem?.(WS_EVENTS_DISABLED_STORAGE_KEY) || ""
    )
      .trim()
      .toLowerCase();
    if (!raw) return !!WS_EVENTS_DISABLED_DEFAULT;
    return raw === "1" || raw === "true";
  } catch {
    return !!WS_EVENTS_DISABLED_DEFAULT;
  }
}

function setWsEventsDisabledSetting(next, options = {}) {
  const { persist = true } = options || {};
  wsEventsDisabled = !!next;
  if (ui?.wsEventsDisabledToggle) {
    ui.wsEventsDisabledToggle.checked = !wsEventsDisabled;
  }
  if (persist) {
    try {
      window?.localStorage?.setItem?.(
        WS_EVENTS_DISABLED_STORAGE_KEY,
        wsEventsDisabled ? "1" : "0"
      );
    } catch {}
  }
  try {
    if (ui?.balanceMonitor && typeof ui.balanceMonitor.setWsEventsFeatureDisabled === "function") {
      ui.balanceMonitor.setWsEventsFeatureDisabled(wsEventsDisabled, {
        persist: false,
        clearList: wsEventsDisabled,
      });
    }
  } catch {}
  if (wsEventsDisabled) {
    wsEventQueue = [];
  }
  setWebhooksPaidFilterControlDisabled(wsEventsDisabled);
}

function setWebhooksPaidEventsFilterEnabled(next, options = {}) {
  const { persist = true } = options || {};
  const enabled = !!next;
  if (ui?.webhooksPaidFilterToggle) {
    ui.webhooksPaidFilterToggle.checked = enabled;
  }
  try {
    if (ui?.balanceMonitor && typeof ui.balanceMonitor.setWebhooksPaidFilterEnabled === "function") {
      ui.balanceMonitor.setWebhooksPaidFilterEnabled(enabled, { persist, render: true });
      return;
    }
  } catch {}
  if (persist) {
    try {
      window?.localStorage?.setItem?.(WS_WEBHOOK_FILTER_STORAGE_KEY, enabled ? "1" : "0");
    } catch {}
  }
}

function normalizeLettersOpenHotkeyInput(value) {
  const raw = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
  if (!raw) return "";
  const parts = raw.split("+").filter(Boolean);
  if (!parts.length) return "";
  const normalized = parts.map((part) => {
    if (part === "command" || part === "meta") return "cmd";
    if (part === "control") return "ctrl";
    if (part === "option") return "alt";
    return part;
  });
  return normalized.join("+");
}

function parseLettersOpenHotkey(value) {
  const normalized = normalizeLettersOpenHotkeyInput(value);
  if (!normalized) return null;
  const parts = normalized.split("+");
  const parsed = { ctrl: false, cmd: false, shift: false, alt: false, key: "" };
  for (const part of parts) {
    if (part === "ctrl") parsed.ctrl = true;
    else if (part === "cmd") parsed.cmd = true;
    else if (part === "shift") parsed.shift = true;
    else if (part === "alt") parsed.alt = true;
    else parsed.key = part;
  }
  if (!parsed.key) return null;
  return parsed;
}

function setLettersOpenHotkey(next, options = {}) {
  const { persist = true } = options || {};
  const normalized = normalizeLettersOpenHotkeyInput(next);
  lettersOpenHotkey = normalized || LETTERS_OPEN_HOTKEY_DEFAULT;
  lettersOpenHotkeyParsed = parseLettersOpenHotkey(lettersOpenHotkey);
  if (!lettersOpenHotkeyParsed) {
    lettersOpenHotkey = LETTERS_OPEN_HOTKEY_DEFAULT;
    lettersOpenHotkeyParsed = parseLettersOpenHotkey(lettersOpenHotkey);
  }
  if (ui?.lettersOpenHotkeyInput) {
    ui.lettersOpenHotkeyInput.value = lettersOpenHotkey;
  }
  if (persist) {
    setStore({ [LETTERS_OPEN_HOTKEY_STORAGE_KEY]: lettersOpenHotkey });
  }
}

function setProfilePhotoHotkey(next, options = {}) {
  const { persist = true } = options || {};
  const normalized = normalizeLettersOpenHotkeyInput(next);
  profilePhotoHotkey = normalized || PROFILE_PHOTO_HOTKEY_DEFAULT;
  profilePhotoHotkeyParsed = parseLettersOpenHotkey(profilePhotoHotkey);
  if (!profilePhotoHotkeyParsed) {
    profilePhotoHotkey = PROFILE_PHOTO_HOTKEY_DEFAULT;
    profilePhotoHotkeyParsed = parseLettersOpenHotkey(profilePhotoHotkey);
  }
  if (ui?.profilePhotoHotkeyInput) {
    ui.profilePhotoHotkeyInput.value = profilePhotoHotkey;
  }
  if (persist) {
    setStore({ [PROFILE_PHOTO_HOTKEY_STORAGE_KEY]: profilePhotoHotkey });
  }
}

function setTranslateSendHotkey(next, options = {}) {
  const { persist = true } = options || {};
  const normalized = normalizeLettersOpenHotkeyInput(next);
  translateSendHotkey = normalized || TRANSLATE_SEND_HOTKEY_DEFAULT;
  translateSendHotkeyParsed = parseLettersOpenHotkey(translateSendHotkey);
  if (!translateSendHotkeyParsed) {
    translateSendHotkey = TRANSLATE_SEND_HOTKEY_DEFAULT;
    translateSendHotkeyParsed = parseLettersOpenHotkey(translateSendHotkey);
  }
  if (ui?.translateSendHotkeyInput) {
    ui.translateSendHotkeyInput.value = translateSendHotkey;
  }
  if (persist) {
    setStore({ [TRANSLATE_SEND_HOTKEY_STORAGE_KEY]: translateSendHotkey });
  }
}

function normalizeEventKeyForHotkey(event) {
  const key = String(event?.key || "").toLowerCase();
  if (!key) return "";
  if (key === " ") return "space";
  if (key === "escape") return "esc";
  return key;
}

function normalizeEventCodeForHotkey(event) {
  const code = String(event?.code || "");
  if (!code) return "";
  if (code.startsWith("Key") && code.length === 4) return code.slice(3).toLowerCase();
  if (code.startsWith("Digit") && code.length === 6) return code.slice(5);
  if (code === "Space") return "space";
  if (code === "Escape") return "esc";
  return "";
}

function isHotkeyPressed(event, parsed) {
  if (!event || event.repeat || event.defaultPrevented) return false;
  if (!parsed) return false;
  const key = normalizeEventCodeForHotkey(event) || normalizeEventKeyForHotkey(event);
  if (!key || key !== parsed.key) return false;
  if (!!event.ctrlKey !== !!parsed.ctrl) return false;
  if (!!event.metaKey !== !!parsed.cmd) return false;
  if (!!event.shiftKey !== !!parsed.shift) return false;
  if (!!event.altKey !== !!parsed.alt) return false;
  return true;
}

function isLettersHotkeyPressed(event) {
  return isHotkeyPressed(event, lettersOpenHotkeyParsed);
}

function handleLettersBindHotkey(event) {
  try {
    if (!isLettersHotkeyPressed(event)) return;
    event.preventDefault();
    event.stopPropagation();
    const openChatBtn = document.querySelector('[data-testid="open-chat-btn"]');
    if (openChatBtn) {
      openChatBtn.click();
      return;
    }
    if (lettersOpenInNewWindow) {
      resolveLetterUrlFromContext()
        .then((url) => {
          if (!url) return;
          window.open(url, "_blank", "noopener");
        })
        .catch(() => {});
      return;
    }
    const btn =
      document.querySelector('[data-testid="send-letter-btn"]') ||
      document.querySelector(LETTERS_NAV_SELECTOR);
    if (!btn) return;
    btn.click();
    return;
  } catch {}
}

function isProfilePhotoHotkeyPressed(event) {
  return isHotkeyPressed(event, profilePhotoHotkeyParsed);
}

function handleProfilePhotoBindHotkey(event) {
  try {
    if (!isProfilePhotoHotkeyPressed(event)) return;
    const target =
      document.querySelector('[class*="styles_clmn_3_chat_head_profile_photo__"]') ||
      document.querySelector(".styles_clmn_3_chat_head_profile_photo__ZOnF4");
    if (!target || typeof target.click !== "function") return;
    event.preventDefault();
    event.stopPropagation();
    target.click();
  } catch {}
}

function isTranslateSendHotkeyPressed(event) {
  return isHotkeyPressed(event, translateSendHotkeyParsed);
}

function findTranslateButton() {
  const direct =
    document.querySelector('[data-testid="translate-btn"]') ||
    document.querySelector(".translate-btn") ||
    document.querySelector("button.translate-btn");
  if (direct) return direct;
  const arrowIcon = document.querySelector(
    'svg[data-testid="ArrowForwardIcon"], [data-testid="ArrowForwardIcon"]'
  );
  if (!arrowIcon) return null;
  return (
    arrowIcon.closest('[data-testid="translate-btn"]') ||
    arrowIcon.closest("button") ||
    arrowIcon.closest('[class*="translate_arrow__"]') ||
    arrowIcon.parentElement
  );
}

function getLetterComposerTextareas() {
  try {
    const wrap = document.querySelector('[data-testid="letter-actions"]');
    if (!wrap) return [];
    const nodes = Array.from(
      wrap.querySelectorAll(
        'textarea[class*="chat_textarea_inner__"], textarea.FormLetters_clmn_3_chat_textarea_inner__l5OUR'
      )
    ).filter(Boolean);
    return nodes;
  } catch {
    return [];
  }
}

function getLetterTranslatedTextarea() {
  const textareas = getLetterComposerTextareas();
  return textareas.length >= 2 ? textareas[1] : null;
}

function getLetterTranslatedBlock() {
  const textarea = getLetterTranslatedTextarea();
  return textarea?.closest?.('[class*="chat_textarea_wrap__"]') || null;
}

function findSendButton() {
  return (
    document.querySelector('[data-testid="send-btn"]') ||
    document.querySelector(".send-btn") ||
    document.querySelector("button.send-btn")
  );
}

function triggerUiClick(target, options = {}) {
  const { synthetic = true } = options || {};
  if (!target) return false;
  if (synthetic) {
    dispatchSyntheticMouseSequence(target);
  }
  try {
    if (typeof target.click === "function") {
      target.click();
      return true;
    }
  } catch {}
  return false;
}

function getTranslatedTextBlockTextarea() {
  return (
    document.querySelector(
      '[data-testid="translated-text-block"] textarea[data-testid="text"]'
    ) ||
    document.querySelector(
      '[data-testid="translated-text-block"] .styles_clmn_3_chat_textarea_inner__DZxvk'
    ) ||
    getLetterTranslatedTextarea()
  );
}

function dispatchSyntheticMouseSequence(target) {
  if (!target || typeof target.dispatchEvent !== "function") return;
  const base = { bubbles: true, cancelable: true, view: window };
  const types = ["pointerdown", "mousedown", "pointerup", "mouseup"];
  for (const type of types) {
    try {
      const Ctor =
        type.startsWith("pointer") && typeof PointerEvent === "function"
          ? PointerEvent
          : MouseEvent;
      target.dispatchEvent(new Ctor(type, base));
    } catch {}
  }
}

function isTranslatedInputActive() {
  const target = getTranslatedTextBlockTextarea();
  if (!target) return false;
  const active = document.activeElement;
  if (!active) return false;
  if (active === target) return true;
  const letterTranslated = getLetterTranslatedTextarea();
  if (letterTranslated && (active === letterTranslated || letterTranslated.contains?.(active))) {
    return true;
  }
  const letterBlock = getLetterTranslatedBlock();
  if (letterBlock && (active === letterBlock || letterBlock.contains?.(active))) {
    return true;
  }
  return !!(
    active.closest?.('[data-testid="translated-text-block"]')
  );
}

function isChatComposerFocused() {
  const active = document.activeElement;
  if (!active) return false;
  if (
    active.matches?.(CHAT_INPUT_SELECTORS.join(",")) ||
    active.matches?.('textarea,[contenteditable="true"],[contenteditable=""]')
  ) {
    return true;
  }
  return !!active.closest?.(
    '[class*="styles_clmn_3_chat_textarea__"],[class*="chat_textarea"],[data-testid="chat-input-area"]'
  );
}

async function clickSendAfterTranslate() {
  await new Promise((resolve) => setTimeout(resolve, 260));
  const maxAttempts = 30;
  for (let index = 0; index < maxAttempts; index += 1) {
    activateTranslatedInputBeforeSend();
    const sendBtn = findSendButton();
    if (
      sendBtn &&
      !sendBtn.disabled &&
      String(sendBtn.getAttribute("aria-disabled") || "").toLowerCase() !== "true" &&
      isTranslatedInputActive()
    ) {
      triggerUiClick(sendBtn, { synthetic: false });
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 80));
  }
  return false;
}

function activateChatInputBeforeSend() {
  const selectors = [
    ".styles_clmn_3_chat_textarea_inner__DZxvk",
    '[class*="styles_clmn_3_chat_textarea_inner__"]',
    "textarea.letter-input",
    "[data-testid='letter-input']",
    '[contenteditable="true"]',
  ];
  for (const selector of selectors) {
    const target = document.querySelector(selector);
    if (!target) continue;
    try {
      if (typeof target.focus === "function") {
        target.focus({ preventScroll: true });
      }
    } catch {}
    try {
      if (typeof target.click === "function") {
        target.click();
      }
    } catch {}
    return true;
  }
  return false;
}

function activateTranslatedInputBeforeSend() {
  const block =
    document.querySelector('[data-testid="translated-text-block"]') ||
    document.querySelector('[class*="chat_textarea_wrap"][data-testid*="translated"]') ||
    getLetterTranslatedBlock();
  const target =
    getTranslatedTextBlockTextarea() ||
    block?.querySelector?.("textarea,[contenteditable='true'],[contenteditable='']");
  if (!block && !target) return false;
  if (block) {
    dispatchSyntheticMouseSequence(block);
  }
  if (target) {
    dispatchSyntheticMouseSequence(target);
  }
  try {
    if (typeof target.focus === "function") {
      target.focus({ preventScroll: true });
    }
  } catch {}
  try {
    if (typeof target.click === "function") {
      target.click();
    }
  } catch {}
  try {
    if (target instanceof HTMLTextAreaElement) {
      const length = String(target.value || "").length;
      target.setSelectionRange(length, length);
    }
  } catch {}
  return true;
}

function handleTranslateSendBindHotkey(event) {
  try {
    if (!isTranslateSendHotkeyPressed(event)) return;
    if (translateSendHotkeyInFlight) return;
    const hasChatBlocks = !!document.querySelector(
      '[data-testid="real-text-block"],[data-testid="translated-text-block"],[data-testid="letter-actions"]'
    );
    if (!hasChatBlocks && !isChatComposerFocused()) return;
    const translateBtn = findTranslateButton();
    const sendBtn = findSendButton();
    if (!translateBtn && !sendBtn) return;
    event.preventDefault();
    event.stopPropagation();
    translateSendHotkeyInFlight = true;
    if (translateBtn) triggerUiClick(translateBtn);
    setTimeout(() => {
      if (!activateTranslatedInputBeforeSend()) {
        activateChatInputBeforeSend();
      }
    }, 120);
    clickSendAfterTranslate()
      .catch(() => {})
      .finally(() => {
        setTimeout(() => {
          translateSendHotkeyInFlight = false;
        }, 200);
      });
  } catch {}
}

async function resolveLetterUrlFromContext() {
  try {
    const module = await loadUserInfoModule();
    const getParticipants = module?.getChatParticipants;
    const resolveChatId = module?.resolveChatId;
    if (typeof getParticipants !== "function" || typeof resolveChatId !== "function") {
      return "";
    }
    const participants = getParticipants();
    const chatId = resolveChatId(participants);
    if (!chatId) return "";
    return `https://alpha.date/letter/${encodeURIComponent(chatId)}`;
  } catch {
    return "";
  }
}

async function handleLettersNavClick(event) {
  try {
    const target = event?.target;
    if (!target) return;
    const btn = target.closest?.(LETTERS_NAV_SELECTOR);
    if (!btn) return;
    if (!lettersOpenInNewWindow) return;
    const url = await resolveLetterUrlFromContext();
    if (!url) return;
    event.preventDefault();
    event.stopPropagation();
    window.open(url, "_blank", "noopener");
  } catch {}
}

//

async function getStore(keys) {
  try {
    // If extension context is gone (reloaded/updated), guard against throws
    if (!chrome?.storage?.local) throw new Error("ext_ctx_invalid");
    const data = await chrome.storage.local.get(keys);
    LOG.log("getStore", keys, "=>", data);
    return data || {};
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("getStore error", e?.message || e);
    // Return empty object so callers can apply their own fallbacks
    return {};
  }
}
async function setStore(obj) {
  try {
    LOG.log("setStore", obj);
    if (!chrome?.storage?.local) throw new Error("ext_ctx_invalid");
    await chrome.storage.local.set(obj);
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("setStore error", e?.message || e);
    // Swallow errors to avoid uncaught promise rejections when context is invalidated
  }
}

function isExtensionLocked() {
  return !!extensionLocked;
}

async function ensureInstallId() {
  if (extensionInstallId) return extensionInstallId;
  try {
    const store = await getStore([EXTENSION_INSTALL_ID_KEY]);
    const stored = String(store?.[EXTENSION_INSTALL_ID_KEY] || "").trim();
    if (stored) {
      extensionInstallId = stored;
      return extensionInstallId;
    }
  } catch {}
  try {
    const generated =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
    extensionInstallId = String(generated || "").trim();
    if (extensionInstallId) {
      await setStore({ [EXTENSION_INSTALL_ID_KEY]: extensionInstallId });
    }
  } catch {}
  return extensionInstallId;
}

async function persistExtensionUnlockState(unlocked) {
  const isUnlocked = !!unlocked;
  extensionLocked = !isUnlocked;
  try {
    await setStore({
      [EXTENSION_UNLOCKED_KEY]: isUnlocked,
      [EXTENSION_UNLOCKED_AT_KEY]: isUnlocked ? Date.now() : 0,
      [EXTENSION_AUTH_CHECKED_AT_KEY]: Date.now(),
    });
  } catch {}
  try {
    scheduleLogoWhiteSquarePlacement();
  } catch {}
}

async function loadExtensionLockState() {
  try {
    const store = await getStore([EXTENSION_UNLOCKED_KEY]);
    const unlocked = !!store?.[EXTENSION_UNLOCKED_KEY];
    extensionLocked = !unlocked;
    if (unlocked) {
      serverAuthAllowed = true;
    }
  } catch {
    extensionLocked = true;
  }
  try {
    scheduleLogoWhiteSquarePlacement();
  } catch {}
}

function updateAuthModalError(message) {
  try {
    if (!ui?.authModalError) return;
    const text = String(message || "").trim();
    ui.authModalError.textContent = text;
    ui.authModalError.hidden = !text;
  } catch {}
}

function closeAuthModal() {
  try {
    if (!ui?.authModal) return;
    ui.authModal.hidden = true;
    ui.authModal.classList.remove("open");
    updateAuthModalError("");
    if (ui.authModalInput) ui.authModalInput.value = "";
  } catch {}
}

function closeOperatorWaitModal() {
  try {
    if (!ui?.operatorWaitModal) return;
    ui.operatorWaitModal.hidden = true;
    ui.operatorWaitModal.classList.remove("open");
  } catch {}
}

function openOperatorWaitModal() {
  try {
    if (!ui?.operatorWaitModal) return;
    ui.operatorWaitModal.hidden = false;
    ui.operatorWaitModal.classList.add("open");
  } catch {}
}

function openAuthModal() {
  try {
    if (!ui?.authModal) return;
    updateAuthModalError("");
    ui.authModal.hidden = false;
    ui.authModal.classList.add("open");
    if (ui.authModalInput) {
      ui.authModalInput.value = "";
      ui.authModalInput.readOnly = true;
      setTimeout(() => {
        try {
          ui.authModalInput.readOnly = false;
          ui.authModalInput.focus();
        } catch {}
      }, 0);
    }
  } catch {}
}

async function submitAuthModal() {
  if (extensionUnlockInFlight) return false;
  const pwd = String(ui?.authModalInput?.value || "").trim();
  if (!pwd) {
    updateAuthModalError("Введите пароль");
    return false;
  }
  if (extensionUnlockPromise) return extensionUnlockPromise;
  extensionUnlockInFlight = true;
  updateAuthModalError("");
  try {
    if (ui?.authModalSubmit) ui.authModalSubmit.disabled = true;
    if (ui?.authModalClose) ui.authModalClose.disabled = true;
  } catch {}
  extensionUnlockPromise = (async () => {
    try {
      const ok = await verifyServerAccessPassword(pwd);
      if (!ok) {
        await persistExtensionUnlockState(false);
        updateAuthModalError("Неверный пароль или сервер недоступен");
        return false;
      }
      await persistExtensionUnlockState(true);
      extensionLocked = false;
      setOperatorIdAvailability(hasValidOperatorId(), "submitAuthModal");
      closeAuthModal();
      try {
        if (!isAlphaLanding() && !isUiBlockedByMissingOperatorId()) {
          ui?.drawer?.classList?.add("open");
          drawerManuallyClosed = false;
          fillHeader();
          loadTextForCurrent(true);
        }
      } catch {}
      updateLauncherVisibility();
      return true;
    } catch {
      await persistExtensionUnlockState(false);
      updateAuthModalError("Сервер недоступен");
      return false;
    } finally {
      extensionUnlockInFlight = false;
      try {
        if (ui?.authModalSubmit) ui.authModalSubmit.disabled = false;
        if (ui?.authModalClose) ui.authModalClose.disabled = false;
      } catch {}
      extensionUnlockPromise = null;
    }
  })();
  return extensionUnlockPromise;
}

function requireExtensionUnlock() {
  if (!isExtensionLocked()) {
    return requireOperatorIdReady();
  }
  try {
    ui?.drawer?.classList?.remove("open");
    ui?.moreBox?.classList?.remove("open");
    closeOperatorWaitModal();
    drawerManuallyClosed = true;
  } catch {}
  openAuthModal();
  updateLauncherVisibility();
  return true;
}

function hasValidOperatorId() {
  const value = Number(operatorInfoState?.operatorId);
  return Number.isFinite(value) && value > 0;
}

function isUiBlockedByMissingOperatorId() {
  return !isExtensionLocked() && !operatorIdReady;
}

function updateLogoSquareOperatorWaitState() {
  const waitMode = isUiBlockedByMissingOperatorId();
  forEachLogoWhiteSquareCounterNode("counter", (node) => {
    node.classList.toggle("operator-wait", waitMode);
    if (waitMode) {
      node.title = OPERATOR_WAIT_MODAL_MESSAGE;
    } else {
      node.removeAttribute("title");
    }
  });
  forEachLogoWhiteSquareCounterNode("total", (node) => {
    if (waitMode) {
      node.textContent = OPERATOR_WAIT_SQUARE_MESSAGE;
      node.title = OPERATOR_WAIT_MODAL_MESSAGE;
    } else {
      node.removeAttribute("title");
    }
  });
  forEachLogoWhiteSquareCounterNode("hourValue", (node) => {
    if (waitMode) {
      node.textContent = "";
      node.removeAttribute("title");
    }
  });
}

function setOperatorIdAvailability(nextReady, source = "") {
  const ready = !!nextReady;
  const wasWaitMode = operatorIdWaitMode;
  operatorIdReady = ready;
  operatorIdWaitMode = !ready;
  updateLogoSquareOperatorWaitState();
  if (isExtensionLocked()) {
    updateLauncherVisibility();
    return;
  }
  if (operatorIdWaitMode) {
    try {
      ui?.drawer?.classList?.remove("open");
      ui?.moreBox?.classList?.remove("open");
      if (ui?.checkControls) ui.checkControls.hidden = true;
      if (ui?.openBot) ui.openBot.hidden = true;
      if (ui?.copyId) ui.copyId.hidden = true;
      if (ui?.checkOut) ui.checkOut.hidden = true;
      closeBalanceDetails();
      closeUserInfoMenu();
      closeLogoWhiteSquareExpandedPanel();
      drawerManuallyClosed = true;
    } catch {}
    updateLauncherVisibility();
    return;
  }
  closeOperatorWaitModal();
  try {
    updateMonitorCounterUI();
  } catch {}
  try {
    scheduleContextRefresh({ immediate: true, force: true });
  } catch {}
  if (wasWaitMode && pinned && !isAlphaLanding() && canRenderDrawerInCurrentContext()) {
    try {
      ui?.drawer?.classList?.add("open");
      drawerManuallyClosed = false;
    } catch {}
  }
  updateLauncherVisibility();
}

function requireOperatorIdReady(options = {}) {
  if (!isUiBlockedByMissingOperatorId()) return false;
  const { silent = false } = options || {};
  try {
    ui?.drawer?.classList?.remove("open");
    ui?.moreBox?.classList?.remove("open");
    closeUserInfoMenu();
    closeBalanceDetails();
    closeLogoWhiteSquareExpandedPanel();
    drawerManuallyClosed = true;
  } catch {}
  if (!silent) {
    try {
      toast(OPERATOR_WAIT_MODAL_MESSAGE);
    } catch {}
  }
  updateLauncherVisibility();
  return true;
}

function isServerAccessLocked() {
  if (!serverAuthStateLoaded) return false;
  return !serverAuthAllowed;
}

function updateServerAccessUI() {
  forEachLogoWhiteSquareCounterNode("operatorInfoTitle", (node) => {
    node.textContent = "Оператор";
  });
}

function pulseServerAccessUI() {
  updateServerAccessUI();
  setTimeout(updateServerAccessUI, 100);
  setTimeout(updateServerAccessUI, 500);
  setTimeout(updateServerAccessUI, 1200);
}

async function persistServerAuthState() {
  try {
    await setStore({
      [SERVER_AUTH_PASS_KEY]: serverAuthPassword || "",
      [SERVER_AUTH_ALLOWED_KEY]: !!serverAuthAllowed,
      [SERVER_AUTH_CHECKED_KEY]: serverAuthCheckedAt || 0,
    });
  } catch {}
}

async function loadServerAuthState() {
  try {
    const store = await getStore([
      SERVER_AUTH_PASS_KEY,
      SERVER_AUTH_ALLOWED_KEY,
      SERVER_AUTH_CHECKED_KEY,
    ]);
    serverAuthPassword = String(store[SERVER_AUTH_PASS_KEY] || "");
    const cachedChecked = Number(store[SERVER_AUTH_CHECKED_KEY] || 0) || 0;
    serverAuthCheckedAt = cachedChecked;
    // Keep server access in sync with global extension lock state.
    serverAuthAllowed = !isExtensionLocked();
    serverAuthChecking = !!serverAuthPassword;
    if (!serverAuthPassword) {
      serverAuthChecking = false;
    }
  } catch {}
  serverAuthStateLoaded = true;
  updateServerAccessUI();
}

async function getProfileStatsApiBaseRaw() {
  const store = await getStore(["apiUrl"]);
  const raw = normalizePreferredApiUrl(store?.apiUrl || DEFAULT_API_URL);
  if (raw !== store?.apiUrl) {
    setStore({ apiUrl: raw }).catch(() => {});
  }
  return resolveApiBase(raw);
}

async function verifyServerAccessPassword(password, opts = {}) {
  const base = await getProfileStatsApiBaseRaw();
  if (!base) return false;
  serverAuthStateLoaded = true;
  try {
    const includeUsage = opts?.trackUsage !== false;
    const installId = includeUsage ? await ensureInstallId() : "";
    const res = await fetch(`${base}/auth/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password,
        install_id: installId || undefined,
      }),
    });
    if (!res.ok) {
      serverAuthLastFailureKind = "soft";
      serverAuthChecking = false;
      serverAuthCheckedAt = Date.now();
      if (!isExtensionLocked()) {
        serverAuthAllowed = true;
      }
      await persistServerAuthState();
      pulseServerAccessUI();
      return false;
    }
    const data = await res.json().catch(() => ({}));
    const ok = !!data?.ok;
    serverAuthAllowed = ok;
    serverAuthChecking = false;
    serverAuthCheckedAt = Date.now();
    serverAuthLastFailureKind = ok ? "" : "hard";
    if (!ok && !isExtensionLocked()) {
      await persistExtensionUnlockState(false);
      try {
        ui?.drawer?.classList?.remove("open");
        ui?.moreBox?.classList?.remove("open");
      } catch {}
    }
    if (ok && !opts.skipPersist) {
      serverAuthPassword = password;
    }
    if (ok) {
      await persistExtensionUnlockState(true);
    }
    await persistServerAuthState();
    pulseServerAccessUI();
    if (ok) {
      try {
        const items = Array.isArray(logoWhiteSquareProfilesState.items)
          ? logoWhiteSquareProfilesState.items
          : [];
        const ids = items
          .map((item) => normalizeProfileExternalId(item.externalId))
          .filter(Boolean);
        if (ids.length) {
          await fetchProfileShiftStatsBatch(ids);
        }
      } catch {}
      try {
        await fetchOperatorShiftSummary();
      } catch {}
    }
    return ok;
  } catch {
    serverAuthLastFailureKind = "soft";
    serverAuthAllowed = !isExtensionLocked();
    serverAuthChecking = false;
    serverAuthCheckedAt = Date.now();
    await persistServerAuthState();
    pulseServerAccessUI();
    return false;
  }
}

async function ensureServerAccess(opts = {}) {
  if (serverAuthCheckPromise) return serverAuthCheckPromise;
  serverAuthCheckPromise = (async () => {
    const force = !!opts.force;
    if (!force && serverAuthAllowed) {
      return true;
    }
    serverAuthChecking = !!serverAuthPassword;
    serverAuthAllowed = false;
    serverAuthCheckedAt = Date.now();
    updateServerAccessUI();
    await persistServerAuthState();
    if (serverAuthPassword) {
      const ok = await verifyServerAccessPassword(serverAuthPassword, {
        skipPersist: true,
        trackUsage: false,
      });
      return ok;
    }
    serverAuthChecking = false;
    return false;
  })();
  try {
    return await serverAuthCheckPromise;
  } finally {
    pulseServerAccessUI();
    serverAuthCheckPromise = null;
  }
}

async function getProfileStatsApiBase() {
  const base = await getProfileStatsApiBaseRaw();
  if (!base) return null;
  if (!serverAuthAllowed) return null;
  return base;
}

function getRatingDayKeyKyiv() {
  return getKyivDayKey(Date.now());
}

function normalizeRatingScope(value) {
  return value === "all_time" ? "all_time" : "shift";
}

function normalizeRatingMetric(value) {
  return value === "actions" ? "actions" : "balance";
}

function normalizeRatingMainTab(value) {
  return value === "shift_actions" || value === "all_time" ? value : "shift_balance";
}

function normalizeRatingAllTimeSubTab(value) {
  return value === "actions" ? "actions" : "balance";
}

function getRatingQueryByView(mainTab, allTimeSubTab) {
  const normalizedMain = normalizeRatingMainTab(mainTab);
  const normalizedSubTab = normalizeRatingAllTimeSubTab(allTimeSubTab);
  if (normalizedMain === "shift_actions") {
    return { metric: "actions", scope: "shift" };
  }
  if (normalizedMain === "all_time") {
    return { metric: normalizedSubTab, scope: "all_time" };
  }
  return { metric: "balance", scope: "shift" };
}

function getOperatorRatingCacheKey({ metric, scope, dayKey }) {
  const m = normalizeRatingMetric(metric);
  const s = normalizeRatingScope(scope);
  return `rating:${m}:${s}:${s === "shift" ? dayKey || getRatingDayKeyKyiv() : "all"}`;
}

function normalizeOperatorIdString(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  return digits || raw;
}

function sortRatingItems(items, metric) {
  const normalizedMetric = normalizeRatingMetric(metric);
  const arr = Array.isArray(items) ? items.slice() : [];
  arr.sort((a, b) => {
    const valueA = Number(a?.value) || 0;
    const valueB = Number(b?.value) || 0;
    if (valueB !== valueA) return valueB - valueA;
    if (normalizedMetric === "actions") {
      const totalA = Number(a?.actions_total) || 0;
      const totalB = Number(b?.actions_total) || 0;
      if (totalB !== totalA) return totalB - totalA;
    } else {
      const balA = Number(a?.balance_total ?? a?.value) || 0;
      const balB = Number(b?.balance_total ?? b?.value) || 0;
      if (balB !== balA) return balB - balA;
    }
    const idA = Number(normalizeOperatorIdString(a?.operator_id)) || 0;
    const idB = Number(normalizeOperatorIdString(b?.operator_id)) || 0;
    return idA - idB;
  });
  return arr;
}

async function fetchOperatorsRating({ metric, scope, limit = OPERATOR_RATING_LIMIT }) {
  const normalizedMetric = normalizeRatingMetric(metric);
  const normalizedScope = normalizeRatingScope(scope);
  const base = await getProfileStatsApiBase();
  if (!base) {
    throw new Error("Сервер недоступен");
  }
  const params = new URLSearchParams();
  params.set("metric", normalizedMetric);
  params.set("scope", normalizedScope);
  params.set("limit", String(Math.max(1, Number(limit) || OPERATOR_RATING_LIMIT)));
  const dayKey = getRatingDayKeyKyiv();
  if (normalizedScope === "shift") {
    params.set("day_key", dayKey);
  }
  const url = `${base}${OPERATOR_RATING_ENDPOINT}?${params.toString()}`;
  let response;
  try {
    response = await fetch(url, { method: "GET" });
  } catch {
    throw new Error("Сервер недоступен");
  }
  if (!response?.ok) {
    throw new Error(`HTTP ${response?.status || 0}`);
  }
  const payload = await response.json().catch(() => null);
  if (!payload || payload.ok !== true) {
    throw new Error("invalid_payload");
  }
  const items = sortRatingItems(payload.items, normalizedMetric).slice(0, OPERATOR_RATING_LIMIT);
  return {
    metric: normalizedMetric,
    scope: normalizedScope,
    dayKey: normalizedScope === "shift" ? dayKey : "all",
    updatedAt: Number(payload.updated_at) || Date.now(),
    items,
  };
}

async function getOperatorsRatingCached({ metric, scope, force = false }) {
  const normalizedMetric = normalizeRatingMetric(metric);
  const normalizedScope = normalizeRatingScope(scope);
  const dayKey = normalizedScope === "shift" ? getRatingDayKeyKyiv() : "all";
  const key = getOperatorRatingCacheKey({
    metric: normalizedMetric,
    scope: normalizedScope,
    dayKey,
  });
  const now = Date.now();
  const cached = operatorRatingState.cache.get(key);
  if (!force && cached && Number(cached.expiresAt) > now) {
    return cached;
  }
  const inFlight = operatorRatingState.inFlight.get(key);
  if (inFlight) {
    return inFlight;
  }
  const requestPromise = (async () => {
    const next = await fetchOperatorsRating({
      metric: normalizedMetric,
      scope: normalizedScope,
      limit: OPERATOR_RATING_LIMIT,
    });
    const entry = {
      ...next,
      expiresAt: Date.now() + OPERATOR_RATING_CACHE_TTL_MS,
    };
    operatorRatingState.cache.set(key, entry);
    return entry;
  })();
  operatorRatingState.inFlight.set(key, requestPromise);
  try {
    return await requestPromise;
  } finally {
    operatorRatingState.inFlight.delete(key);
  }
}

function formatRatingUpdatedAt(ts) {
  const value = Number(ts);
  if (!Number.isFinite(value) || value <= 0) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  try {
    return date.toLocaleTimeString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return date.toTimeString().slice(0, 5);
  }
}

function getOperatorRatingCurrentOperatorId() {
  return normalizeOperatorIdString(operatorInfoState?.operatorId);
}

function createOperatorRatingPanelDom() {
  const root = document.createElement("div");
  root.className = "rating-panel";
  const mainTabs = document.createElement("div");
  mainTabs.className = "rating-main-tabs";
  const tabShiftBalance = document.createElement("button");
  tabShiftBalance.type = "button";
  tabShiftBalance.className = "rating-main-tab";
  tabShiftBalance.dataset.mainTab = "shift_balance";
  const tabShiftActions = document.createElement("button");
  tabShiftActions.type = "button";
  tabShiftActions.className = "rating-main-tab";
  tabShiftActions.dataset.mainTab = "shift_actions";
  const tabAllTime = document.createElement("button");
  tabAllTime.type = "button";
  tabAllTime.className = "rating-main-tab";
  tabAllTime.dataset.mainTab = "all_time";
  mainTabs.appendChild(tabShiftBalance);
  mainTabs.appendChild(tabShiftActions);
  mainTabs.appendChild(tabAllTime);
  const subTabs = document.createElement("div");
  subTabs.className = "rating-sub-tabs";
  const subBalance = document.createElement("button");
  subBalance.type = "button";
  subBalance.className = "rating-sub-tab";
  subBalance.dataset.subTab = "balance";
  const subActions = document.createElement("button");
  subActions.type = "button";
  subActions.className = "rating-sub-tab";
  subActions.dataset.subTab = "actions";
  subTabs.appendChild(subBalance);
  subTabs.appendChild(subActions);
  const tableWrap = document.createElement("div");
  tableWrap.className = "rating-table-wrap";
  const updated = document.createElement("div");
  updated.className = "rating-updated-at";
  root.appendChild(mainTabs);
  root.appendChild(subTabs);
  root.appendChild(tableWrap);
  root.appendChild(updated);
  return {
    root,
    mainTabs: {
      shiftBalance: tabShiftBalance,
      shiftActions: tabShiftActions,
      allTime: tabAllTime,
    },
    subTabs: {
      balance: subBalance,
      actions: subActions,
    },
    tableWrap,
    updated,
  };
}

function updateOperatorRatingPanelTexts(panelDom) {
  if (!panelDom) return;
  panelDom.mainTabs.shiftBalance.textContent =
    t("ratingMainShiftBalance") || "Баланс за смену";
  panelDom.mainTabs.shiftActions.textContent =
    t("ratingMainShiftActions") || "Действия за смену";
  panelDom.mainTabs.allTime.textContent = t("ratingTabAllTime") || "За всё время";
  panelDom.subTabs.balance.textContent = t("ratingTitleBalance") || "Балансы";
  panelDom.subTabs.actions.textContent = t("ratingTitleActions") || "Действия";
}

function getMsUntilNextKyivHourBoundary() {
  try {
    const parts = kyivParts(Date.now());
    const hour = Number(parts?.hh) || 0;
    const minute = Number(parts?.mm) || 0;
    const second = Number(parts?.ss) || 0;
    const currentSeconds = hour * 3600 + minute * 60 + second;
    const nextSeconds = (hour + 1) * 3600;
    const diff = nextSeconds - currentSeconds;
    return Math.max(1000, diff * 1000);
  } catch {
    return 60 * 60 * 1000;
  }
}

function clearOperatorRatingHourlyRefresh() {
  if (operatorRatingHourlyTimerId) {
    clearTimeout(operatorRatingHourlyTimerId);
    operatorRatingHourlyTimerId = null;
  }
}

function scheduleOperatorRatingHourlyRefresh() {
  clearOperatorRatingHourlyRefresh();
  const delay = getMsUntilNextKyivHourBoundary();
  operatorRatingHourlyTimerId = setTimeout(() => {
    operatorRatingHourlyTimerId = null;
    renderOperatorRatingTables({ force: true }).catch(() => {});
    scheduleOperatorRatingHourlyRefresh();
  }, delay);
}

function switchOperatorRatingMainTab(nextMainTab) {
  operatorRatingState.activeMainTab = normalizeRatingMainTab(nextMainTab);
  renderOperatorRatingTables({ force: false }).catch(() => {});
}

function switchOperatorRatingAllTimeSubTab(nextSubTab) {
  operatorRatingState.activeAllTimeSubTab = normalizeRatingAllTimeSubTab(nextSubTab);
  renderOperatorRatingTables({ force: false }).catch(() => {});
}

function buildRatingTableRows({ metric, scope, items }) {
  const normalizedMetric = normalizeRatingMetric(metric);
  const normalizedScope = normalizeRatingScope(scope);
  const isBalance = normalizedMetric === "balance";
  const showActionColumns = !isBalance;
  const rows = [];
  const currentOperatorId = getOperatorRatingCurrentOperatorId();
  const header = document.createElement("div");
  header.className = `rating-row rating-row-header ${isBalance ? "rating-row-balance" : "rating-row-actions"}`;
  header.innerHTML = isBalance
    ? `
    <span>${escapeHtml(t("ratingColRank") || "#")}</span>
    <span>${escapeHtml(t("ratingColName") || "Имя")}</span>
    <span>${escapeHtml(t("ratingColValue") || "Баланс")}</span>
  `.trim()
    : `
    <span>${escapeHtml(t("ratingColRank") || "#")}</span>
    <span>${escapeHtml(t("ratingColName") || "Имя")}</span>
    <span>${escapeHtml(t("ratingColChat") || "Чаты")}</span>
    <span>${escapeHtml(t("ratingColMail") || "Письма")}</span>
    <span>${escapeHtml(t("ratingColTotal") || "Всего")}</span>
  `.trim();
  rows.push(header);
  items.forEach((item, index) => {
    const operatorId = normalizeOperatorIdString(item?.operator_id);
    const operatorName = String(item?.operator_name || "").trim() || `ID ${operatorId || "—"}`;
    const valueRaw = Number(item?.value) || 0;
    const value = valueRaw.toFixed(2);
    const chat = String(Math.max(0, Number(item?.chat_count) || 0));
    const mail = String(Math.max(0, Number(item?.mail_count) || 0));
    const total = String(
      Math.max(
        0,
        Number(item?.actions_total) || (Number(item?.chat_count) || 0) + (Number(item?.mail_count) || 0)
      )
    );
    const row = document.createElement("div");
    row.className = `rating-row ${isBalance ? "rating-row-balance" : "rating-row-actions"}`;
    if (currentOperatorId && operatorId && currentOperatorId === operatorId) {
      row.classList.add("is-current");
    }
    if (isBalance) {
      row.innerHTML = `
        <span>${index + 1}</span>
        <span title="${escapeHtml(operatorName)}">${escapeHtml(operatorName)}</span>
        <span>${escapeHtml(value)}</span>
      `.trim();
    } else {
      row.innerHTML = `
        <span>${index + 1}</span>
        <span title="${escapeHtml(operatorName)}">${escapeHtml(operatorName)}</span>
        <span>${escapeHtml(chat)}</span>
        <span>${escapeHtml(mail)}</span>
        <span>${escapeHtml(total)}</span>
      `.trim();
    }
    if (showActionColumns && normalizedScope === "all_time") {
      row.dataset.scope = "all_time";
    }
    rows.push(row);
  });
  return rows;
}

function renderOperatorRatingPanelState({ panelDom, loading, error, payload, metric, scope }) {
  if (!panelDom) return;
  const activeMainTab = normalizeRatingMainTab(operatorRatingState.activeMainTab);
  const activeSubTab = normalizeRatingAllTimeSubTab(operatorRatingState.activeAllTimeSubTab);
  updateOperatorRatingPanelTexts(panelDom);
  panelDom.mainTabs.shiftBalance.classList.toggle("active", activeMainTab === "shift_balance");
  panelDom.mainTabs.shiftActions.classList.toggle("active", activeMainTab === "shift_actions");
  panelDom.mainTabs.allTime.classList.toggle("active", activeMainTab === "all_time");
  const showSubTabs = activeMainTab === "all_time";
  panelDom.subTabs.balance.classList.toggle("active", activeSubTab === "balance");
  panelDom.subTabs.actions.classList.toggle("active", activeSubTab === "actions");
  panelDom.root.classList.toggle("show-all-time-subtabs", showSubTabs);
  panelDom.tableWrap.innerHTML = "";
  if (loading) {
    const node = document.createElement("div");
    node.className = "rating-loading";
    node.textContent = t("ratingLoading") || "Загрузка рейтинга...";
    panelDom.tableWrap.appendChild(node);
    panelDom.updated.textContent = "";
    return;
  }
  if (error) {
    const node = document.createElement("div");
    node.className = "rating-error";
    node.textContent = t("ratingError") || "Не удалось загрузить рейтинг";
    panelDom.tableWrap.appendChild(node);
    panelDom.updated.textContent = "";
    return;
  }
  const items = Array.isArray(payload?.items) ? payload.items : [];
  if (!items.length) {
    const node = document.createElement("div");
    node.className = "rating-empty";
    node.textContent = t("ratingEmpty") || "Нет данных";
    panelDom.tableWrap.appendChild(node);
    panelDom.updated.textContent = "";
    return;
  }
  const rows = buildRatingTableRows({ metric, scope, items });
  rows.forEach((row) => panelDom.tableWrap.appendChild(row));
  const updatedAt = formatRatingUpdatedAt(payload?.updatedAt);
  panelDom.updated.textContent = updatedAt
    ? `${t("ratingUpdatedAt") || "Обновлено"}: ${updatedAt}`
    : "";
}

async function renderOperatorRatingPanel({ force = false }) {
  if (!operatorRatingPanelDom) return;
  const query = getRatingQueryByView(
    operatorRatingState.activeMainTab,
    operatorRatingState.activeAllTimeSubTab
  );
  renderOperatorRatingPanelState({
    panelDom: operatorRatingPanelDom,
    loading: true,
    error: false,
    payload: null,
    metric: query.metric,
    scope: query.scope,
  });
  try {
    const payload = await getOperatorsRatingCached({
      metric: query.metric,
      scope: query.scope,
      force,
    });
    renderOperatorRatingPanelState({
      panelDom: operatorRatingPanelDom,
      loading: false,
      error: false,
      payload,
      metric: query.metric,
      scope: query.scope,
    });
  } catch {
    renderOperatorRatingPanelState({
      panelDom: operatorRatingPanelDom,
      loading: false,
      error: true,
      payload: null,
      metric: query.metric,
      scope: query.scope,
    });
  }
}

async function renderOperatorRatingTables({ force = false } = {}) {
  if (!operatorRatingPanelRoot) return;
  await renderOperatorRatingPanel({ force });
  operatorRatingState.lastRenderAt = Date.now();
}

function initOperatorRatingPanel(chartCol) {
  if (!chartCol) return;
  chartCol.innerHTML = "";
  const root = document.createElement("div");
  root.className = "rating-panels";
  const panelDom = createOperatorRatingPanelDom();
  root.appendChild(panelDom.root);
  chartCol.appendChild(root);
  operatorRatingPanelRoot = root;
  operatorRatingPanelDom = panelDom;
  panelDom.mainTabs.shiftBalance.addEventListener("click", () => {
    switchOperatorRatingMainTab("shift_balance");
  });
  panelDom.mainTabs.shiftActions.addEventListener("click", () => {
    switchOperatorRatingMainTab("shift_actions");
  });
  panelDom.mainTabs.allTime.addEventListener("click", () => {
    switchOperatorRatingMainTab("all_time");
  });
  panelDom.subTabs.balance.addEventListener("click", () => {
    switchOperatorRatingAllTimeSubTab("balance");
  });
  panelDom.subTabs.actions.addEventListener("click", () => {
    switchOperatorRatingAllTimeSubTab("actions");
  });
  renderOperatorRatingTables({ force: false }).catch(() => {});
}

function parseNameAge(str) {
  const raw0 = (str || "").trim();
  if (!raw0) return { name: "", age: "" };
  // Normalize spaces (including NBSP) and separators
  const raw = raw0.replace(/\u00A0/g, " ").replace(/\s+/g, " ");
  // Priority: pattern "Name, 75" (age after comma). Keep only 14-99.
  const commaRe = /^(.*?),\s*(1[4-9]|[2-9]\d)(?:\D|$)/;
  let m = raw.match(commaRe);
  let age = "";
  let name = raw;
  if (m) {
    name = (m[1] || "").trim();
    age = m[2] || "";
  } else {
    // Fallback: find plausible age anywhere after name, tolerate (), commas, dashes, middots, colons
    const ageRe = /(?:^|[\s,()\-—·:]+)(1[4-9]|[2-9]\d)(?=\D|$)/;
    const mm = raw.match(ageRe);
    if (mm) {
      age = mm[1];
      name = raw.slice(0, mm.index).trim();
    }
  }
  // Remove common trailing labels and separators from name
  name = name
    .replace(/[ ,|·\-—:]+$/, "") // trailing separators
    .replace(/[,;]\s*(возраст|age|вік)\s*$/i, "") // trailing labels like ", возраст/age/вік"
    .replace(/\((возраст|age|вік)\)$/i, "") // trailing labels inside parentheses
    .trim();
  return { name, age };
}

function loadTimezoneData() {
  try {
    if (tzDataLoaded || tzDataPromise) return;
    tzDataPromise = import(chrome.runtime.getURL("timezones.js"))
      .then((mod) => {
        if (!mod) return;
        if (mod.CITY_TZ_OVERRIDES instanceof Map) {
          CITY_TZ_OVERRIDES = mod.CITY_TZ_OVERRIDES;
        } else if (Array.isArray(mod.CITY_TZ_OVERRIDES)) {
          CITY_TZ_OVERRIDES = new Map(mod.CITY_TZ_OVERRIDES);
        }
        if (mod.COUNTRY_TZ_DEFAULTS instanceof Map) {
          COUNTRY_TZ_DEFAULTS = mod.COUNTRY_TZ_DEFAULTS;
        } else if (Array.isArray(mod.COUNTRY_TZ_DEFAULTS)) {
          COUNTRY_TZ_DEFAULTS = new Map(mod.COUNTRY_TZ_DEFAULTS);
        }
        if (mod.COUNTRY_TZ_CAPITALS instanceof Map) {
          COUNTRY_TZ_CAPITALS = mod.COUNTRY_TZ_CAPITALS;
        } else if (Array.isArray(mod.COUNTRY_TZ_CAPITALS)) {
          COUNTRY_TZ_CAPITALS = new Map(mod.COUNTRY_TZ_CAPITALS);
        }
        if (mod.CYRILLIC_TO_LATIN && typeof mod.CYRILLIC_TO_LATIN === "object") {
          CYRILLIC_TO_LATIN = mod.CYRILLIC_TO_LATIN;
        }
        tzDataLoaded = true;
        updateWomanLocalTimeInHeader();
        updateManLocalTimeInHeader();
      })
      .catch(() => {});
  } catch {}
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
  loadTimezoneData();
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
      const tz = String(city || "").trim();
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
  loadTimezoneData();
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
    formatter = new Intl.DateTimeFormat("en-GB", {
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

function formatHeaderDateTime(timeZone, date = new Date()) {
  const formatter = getCityTimeFormatter(timeZone);
  if (!formatter) return "";
  if (typeof formatter.formatToParts === "function") {
    try {
      const parts = formatter.formatToParts(date);
      const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
      const timePart = `${map.hour}:${map.minute}`;
      const datePart = `${map.day}/${map.month}`;
      return `${timePart} (${datePart})`;
    } catch {}
  }
  return formatter.format(date).replace(",", "");
}

function parseCountryCodeFromImage(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const match = raw.match(/\/([a-z]{2})(?:\.\w+)?$/i);
  return match ? match[1].toUpperCase() : "";
}

function ensureLocalTimeStyles() {
  try {
    if (document.getElementById(LOCAL_TIME_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = LOCAL_TIME_STYLE_ID;
    style.textContent = `
.${WOMAN_TIME_CLASS}, .${MAN_TIME_CLASS}{
  display:inline-flex;
  align-items:center;
  font-size:11px;
  letter-spacing:-0.03em;
  color:hsla(0, 0%, 100%, .9);
}
.${MAN_ID_BALANCE_WRAP_CLASS}{
  display:inline-flex;
  align-items:center;
  gap:6px;
  min-width:0;
  max-width:100%;
}
.${MAN_SPEND_CLASS}{
  display:inline-flex;
  align-items:center;
  gap:4px;
  font-size:11px;
  letter-spacing:-0.02em;
  color:hsla(0, 0%, 100%, .9);
  white-space:nowrap;
}
.${MAN_SPEND_CLASS}::before{
  content:"";
  display:inline-block;
  width:12px;
  height:12px;
  background-image:url("${ICONS.money}");
  background-repeat:no-repeat;
  background-position:center;
  background-size:contain;
  opacity:.95;
}
[data-testid="chat-header"] [class*="styles_clmn_3_chat_head_profile_info__"],
[data-testid="chat-header"] [class*="chat_head_profile_info__"]{
  flex-wrap:wrap;
  max-width:100%;
  min-width:0;
}
[data-testid="chat-header"] [data-testid="man-name"],
[data-testid="chat-header"] [data-testid="woman-name"]{
  min-width:0;
  max-width:100%;
  white-space:normal;
  word-break:break-word;
}`;
    (document.head || document.documentElement || document.body)?.appendChild(style);
  } catch {}
}

function ensureProfileInfoStyles() {
  try {
    if (document.getElementById(PROFILE_INFO_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = PROFILE_INFO_STYLE_ID;
    style.textContent = `
.${PROFILE_INFO_BUTTON_CLASS} {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-left: 4px;
  padding: 0;
  border: none;
  background: transparent;
  color: hsla(0, 0%, 100%, 0.7);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  border-radius: 2px;
  transition: color 0.2s, background 0.2s;
}
.${PROFILE_INFO_BUTTON_CLASS}:hover {
  color: hsla(0, 0%, 100%, 0.9);
  background: hsla(0, 0%, 100%, 0.1);
}
.${PROFILE_INFO_BUTTON_CLASS}.active {
  color: hsla(0, 0%, 100%, 1);
  background: hsla(0, 0%, 100%, 0.2);
}
.${PROFILE_INFO_BLOCK_CLASS} {
  display: none;
  margin-top: 8px;
  padding: 8px;
  background: hsla(0, 0%, 0%, 0.3);
  border-radius: 4px;
  font-size: 12px;
  line-height: 1.4;
  color: hsla(0, 0%, 100%, 0.9);
  white-space: pre-wrap;
  word-break: break-word;
}
.${PROFILE_INFO_BLOCK_CLASS}.open {
  display: block;
}
.${PROFILE_INFO_BLOCK_CLASS} .section {
  margin-bottom: 8px;
}
.${PROFILE_INFO_BLOCK_CLASS} .section:last-child {
  margin-bottom: 0;
}
.${PROFILE_INFO_BLOCK_CLASS} .label {
  font-weight: 600;
  color: hsla(0, 0%, 100%, 0.7);
  margin-bottom: 2px;
}
.${PROFILE_INFO_BLOCK_CLASS} .content {
  color: hsla(0, 0%, 100%, 0.9);
}
.ot4et-profile-popover {
  position: fixed;
  z-index: 10000;
  min-width: 280px;
  max-width: 400px;
  background: rgba(0, 0, 0, 0.9);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: hsla(0, 0%, 100%, 0.9);
  font-size: 13px;
  line-height: 1.4;
  backdrop-filter: blur(8px);
}
.ot4et-profile-popover::before {
  content: '';
  position: absolute;
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-bottom: 6px solid rgba(0, 0, 0, 0.9);
}
.ot4et-profile-popover-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
.ot4et-profile-popover-title {
  font-weight: 600;
  font-size: 14px;
  color: white;
}
.ot4et-profile-popover-close {
  width: 20px;
  height: 20px;
  padding: 0;
  border: none;
  background: transparent;
  color: hsla(0, 0%, 100%, 0.7);
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
}
.ot4et-profile-popover-close:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}
.ot4et-profile-popover-content {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 4px;
}
.ot4et-profile-popover-section {
  margin-bottom: 12px;
}
.ot4et-profile-popover-section:last-child {
  margin-bottom: 0;
}
.ot4et-profile-popover-label {
  font-weight: 600;
  color: hsla(0, 0%, 100%, 0.7);
  margin-bottom: 4px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.ot4et-profile-popover-text {
  color: hsla(0, 0%, 100%, 0.9);
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 13px;
  line-height: 1.5;
}
.ot4et-profile-popover-loading,
.ot4et-profile-popover-empty,
.ot4et-profile-popover-error {
  padding: 16px;
  text-align: center;
  color: hsla(0, 0%, 100%, 0.7);
  font-size: 13px;
}`;
    (document.head || document.documentElement || document.body)?.appendChild(style);
  } catch {}
}

let currentProfilePopover = null;
let currentProfilePopoverButton = null;
let currentProfilePopoverPositionHandler = null;

function closeProfileInfoPopover() {
  if (currentProfilePopover) {
    try {
      currentProfilePopover.remove();
    } catch {}
    currentProfilePopover = null;
  }
  if (currentProfilePopoverButton) {
    currentProfilePopoverButton.classList.remove("active");
    currentProfilePopoverButton = null;
  }
  document.removeEventListener("click", handleOutsideClick);
  document.removeEventListener("keydown", handleEscapeKey);
  if (currentProfilePopoverPositionHandler) {
    window.removeEventListener("resize", currentProfilePopoverPositionHandler);
    window.removeEventListener("scroll", currentProfilePopoverPositionHandler);
    currentProfilePopoverPositionHandler = null;
  }
}

function handleOutsideClick(event) {
  if (!currentProfilePopover || !currentProfilePopoverButton) return;
  const popover = currentProfilePopover;
  const button = currentProfilePopoverButton;
  const target = event.target;
  if (!popover.contains(target) && target !== button && !button.contains(target)) {
    closeProfileInfoPopover();
  }
}

function handleEscapeKey(event) {
  if (event.key === "Escape") {
    closeProfileInfoPopover();
  }
}

function updateProfileInfoPopoverPosition() {
  if (!currentProfilePopover || !currentProfilePopoverButton) return;
  positionProfileInfoPopover(currentProfilePopover, currentProfilePopoverButton);
}

function createProfileInfoPopover(role = "") {
  ensureProfileInfoStyles();
  const popover = document.createElement("div");
  popover.className = "ot4et-profile-popover";
  const title =
    role === "woman"
      ? "Информация о девушке"
      : role === "man"
      ? "Информация о мужчине"
      : "Информация о профиле";
  popover.innerHTML = `
    <div class="ot4et-profile-popover-header">
      <div class="ot4et-profile-popover-title">${title}</div>
      <button class="ot4et-profile-popover-close" aria-label="Закрыть">×</button>
    </div>
    <div class="ot4et-profile-popover-content">
      <div class="ot4et-profile-popover-loading">Загрузка...</div>
    </div>
  `;

  const closeBtn = popover.querySelector(".ot4et-profile-popover-close");
  closeBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    closeProfileInfoPopover();
  });

  return popover;
}

function positionProfileInfoPopover(popover, button) {
  const buttonRect = button.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const popoverWidth = 300;
  const popoverHeight = 200;

  let top = buttonRect.bottom + 8;
  let left = buttonRect.left + buttonRect.width / 2 - popoverWidth / 2;

  if (left < 12) left = 12;
  if (left + popoverWidth > viewportWidth - 12) {
    left = viewportWidth - popoverWidth - 12;
  }
  if (top + popoverHeight > viewportHeight - 12) {
    top = buttonRect.top - popoverHeight - 8;
    if (top < 12) top = 12;
  }

  popover.style.left = `${Math.round(left)}px`;
  popover.style.top = `${Math.round(top)}px`;
}

async function loadProfileInfoData(role) {
  const header = document.querySelector('[data-testid="chat-header"]');
  if (!header) throw new Error("Не найден заголовок чата");

  const userIdEl = header.querySelector(role === "woman" ? S.womanId : S.manId);
  if (!userIdEl) throw new Error("Не найден ID пользователя");

  const userId = (userIdEl.textContent || "").trim().replace(/\D/g, "");
  if (!userId) throw new Error("Не удалось извлечь ID");

  const token = window.localStorage?.getItem?.("token") || "";
  if (!token) throw new Error("Токен не найден");

  const module = await loadUserInfoModule();
  return await module.fetchFullProfileDetails({
    userId,
    role,
    token,
    signal: null,
  });
}

function updateProfileInfoPopoverContent(popover, data) {
  const content = popover.querySelector(".ot4et-profile-popover-content");
  if (!content) return;

  let html = "";

  if (data.about) {
    html += `
      <div class="ot4et-profile-popover-section">
        <div class="ot4et-profile-popover-label">Обо мне</div>
        <div class="ot4et-profile-popover-text">${escapeHtml(data.about)}</div>
      </div>
    `;
  }

  if (data.seeking) {
    html += `
      <div class="ot4et-profile-popover-section">
        <div class="ot4et-profile-popover-label">Ищу</div>
        <div class="ot4et-profile-popover-text">${escapeHtml(data.seeking)}</div>
      </div>
    `;
  }

  if (!data.about && !data.seeking) {
    html = '<div class="ot4et-profile-popover-empty">Нет информации</div>';
  }

  content.innerHTML = html;
}

function showProfileInfoPopover(button, role) {
  if (currentProfilePopoverButton === button && currentProfilePopover) {
    closeProfileInfoPopover();
    return;
  }
  closeProfileInfoPopover();

  const popover = createProfileInfoPopover(role);
  document.body.appendChild(popover);
  positionProfileInfoPopover(popover, button);

  currentProfilePopover = popover;
  currentProfilePopoverButton = button;
  button.classList.add("active");

  currentProfilePopoverPositionHandler = updateProfileInfoPopoverPosition;
  window.addEventListener("resize", currentProfilePopoverPositionHandler, {
    passive: true,
  });
  window.addEventListener("scroll", currentProfilePopoverPositionHandler, {
    passive: true,
  });

  loadProfileInfoData(role)
    .then((data) => {
      if (currentProfilePopover === popover) {
        updateProfileInfoPopoverContent(popover, data || {});
      }
    })
    .catch((err) => {
      if (currentProfilePopover === popover) {
        const content = popover.querySelector(".ot4et-profile-popover-content");
        if (content) {
          content.innerHTML = `<div class="ot4et-profile-popover-error">${escapeHtml(
            err?.message || "Ошибка загрузки"
          )}</div>`;
        }
      }
    });

  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);
  }, 0);
}

function addProfileInfoButton(nameElement, role) {
  if (!nameElement) return null;
  const parent = nameElement.parentElement;
  if (!parent) return null;
  const existing = parent.querySelector(
    `.${PROFILE_INFO_BUTTON_CLASS}[data-role="${role}"]`
  );
  if (existing) return existing;
  ensureProfileInfoStyles();
  const button = document.createElement("button");
  button.type = "button";
  button.className = PROFILE_INFO_BUTTON_CLASS;
  button.setAttribute("data-role", role);
  button.textContent = "ℹ️";
  button.title = role === "woman" ? "Информация о девушке" : "Информация о мужчине";
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    showProfileInfoPopover(button, role);
  });
  nameElement.appendChild(button);
  return button;
}

function ensureProfileInfoButtons() {
  const header = document.querySelector('[data-testid="chat-header"]');
  if (!header) return;
  const womanName = header.querySelector(S.womanName);
  const manName = header.querySelector(S.manName);
  addProfileInfoButton(womanName, "woman");
  addProfileInfoButton(manName, "man");
}

function getWomanPlaceInfo() {
  const header = document.querySelector('[data-testid="chat-header"]');
  if (!header) return null;
  const placeEl = header.querySelector(S.womanPlace);
  if (!placeEl) return null;
  const container =
    header.querySelector('[class*="styles_clmn_3_chat_head_profile_info__"]') ||
    header.querySelector('[class*="chat_head_profile_info__"]') ||
    placeEl.parentElement ||
    placeEl;
  const city = text(qs("span", placeEl)) || text(placeEl);
  const img = placeEl.querySelector("img");
  const src = img?.getAttribute?.("src") || img?.src || "";
  const countryCode = parseCountryCodeFromImage(src);
  return { container, placeEl, city, countryCode };
}

function getManPlaceInfo() {
  const header = document.querySelector('[data-testid="chat-header"]');
  if (!header) return null;
  const placeEl = header.querySelector(S.manPlace);
  if (!placeEl) return null;
  const container =
    header.querySelector('[class*="styles_clmn_3_chat_head_profile_info__"]') ||
    header.querySelector('[class*="chat_head_profile_info__"]') ||
    placeEl.parentElement ||
    placeEl;
  const city = text(qs("span", placeEl)) || text(placeEl);
  const img = placeEl.querySelector("img");
  const src = img?.getAttribute?.("src") || img?.src || "";
  const countryCode = parseCountryCodeFromImage(src);
  return { container, placeEl, city, countryCode };
}

function buildWomanTimeLabel(city, countryCode) {
  let timeZone = "";
  if (city) timeZone = getTimeZoneByCity(city);
  if (!timeZone) timeZone = getTimeZoneByCountry(countryCode);
  if (!timeZone) return "";
  return formatHeaderDateTime(timeZone);
}

function buildManTimeLabel(city, countryCode) {
  return buildWomanTimeLabel(city, countryCode);
}

function getActiveChatUidForSpend() {
  try {
    const path = String(window.location.pathname || "");
    const match = path.match(/^\/(?:chat|letter)\/([^/?#]+)/i);
    if (match && match[1]) return decodeURIComponent(match[1]);
  } catch {}
  return String(activeChatUidCache || "").trim();
}

function getActiveChatIdForSpend() {
  try {
    const href = String(window.location.href || "");
    const match = href.match(/[?&]chat_id=(\d+)/i);
    if (match && match[1]) return match[1];
  } catch {}
  return "";
}

async function ensureManSpendDataForActiveChat() {
  const chatUid = getActiveChatUidForSpend();
  if (!chatUid) return false;
  const now = Date.now();
  const existingEntry = manSpendByChatUid.get(chatUid);
  if (
    existingEntry &&
    Number.isFinite(Number(existingEntry.updated_at)) &&
    now - Number(existingEntry.updated_at) < HEADER_CHAT_HISTORY_SPEND_REFRESH_TTL_MS
  ) {
    return true;
  }
  const cached = wsChatHistorySpendCache.get(chatUid);
  if (cached && Number(cached.expiresAt) > now) {
    if (!existingEntry) {
      upsertManSpendEntry({
        chat_uid: chatUid,
        chat_id: String(getActiveChatIdForSpend() || "").trim(),
        max_spend_all_credits: Number(cached.maxSpend) || 0,
        man_external_id: "",
        woman_external_id: "",
        updated_at: now,
      });
    }
    return true;
  }
  const inFlight = headerChatHistorySpendInFlight.get(chatUid);
  if (inFlight) {
    try {
      return await inFlight;
    } catch {
      return false;
    }
  }
  const requestPromise = (async () => {
    const token = (await getAuthTokenForConfigCheck()) || getAuthTokenFromStorage();
    if (!token) return false;
    const payload = await fetchWsChatHistoryPageOne({
      token,
      chatUid,
    });
    if (!payload || typeof payload !== "object") return false;
    const maxSpend = extractMaxSpendAllCreditsFromChatHistory(payload);
    const list = Array.isArray(payload?.response) ? payload.response : [];
    const firstRow = list.find((row) => row && typeof row === "object") || null;
    const maleRow =
      list.find(
        (row) =>
          row &&
          typeof row === "object" &&
          Number(row?.is_male) === 1 &&
          normalizeExternalId(row?.sender_external_id) &&
          normalizeExternalId(row?.recipient_external_id)
      ) || null;
    let manExternalId = normalizeExternalId(maleRow?.sender_external_id);
    let womanExternalId = normalizeExternalId(maleRow?.recipient_external_id);
    if (!manExternalId || !womanExternalId) {
      try {
        const ctx = readContext();
        if (!manExternalId) manExternalId = normalizeExternalId(ctx?.man?.id);
        if (!womanExternalId) womanExternalId = normalizeExternalId(ctx?.woman?.id);
      } catch {}
    }
    if ((!manExternalId || !womanExternalId) && firstRow) {
      const firstIsMale = Number(firstRow?.is_male) === 1;
      if (firstIsMale) {
        if (!manExternalId) manExternalId = normalizeExternalId(firstRow?.sender_external_id);
        if (!womanExternalId)
          womanExternalId = normalizeExternalId(firstRow?.recipient_external_id);
      } else {
        if (!manExternalId) manExternalId = normalizeExternalId(firstRow?.recipient_external_id);
        if (!womanExternalId)
          womanExternalId = normalizeExternalId(firstRow?.sender_external_id);
      }
    }
    const chatId =
      String(firstRow?.chat_id || "").trim() || String(getActiveChatIdForSpend() || "").trim();
    const updatedAt = Date.now();
    upsertManSpendEntry({
      chat_uid: chatUid,
      chat_id: chatId,
      max_spend_all_credits: maxSpend,
      man_external_id: manExternalId,
      woman_external_id: womanExternalId,
      updated_at: updatedAt,
    });
    wsChatHistorySpendCache.set(chatUid, {
      hasSpend: maxSpend > 0,
      maxSpend,
      expiresAt: updatedAt + HEADER_CHAT_HISTORY_SPEND_REFRESH_TTL_MS,
    });
    return true;
  })();
  headerChatHistorySpendInFlight.set(chatUid, requestPromise);
  try {
    return await requestPromise;
  } catch {
    return false;
  } finally {
    headerChatHistorySpendInFlight.delete(chatUid);
  }
}

function ensureManIdBalanceContainer() {
  try {
    const header = document.querySelector('[data-testid="chat-header"]');
    if (!header) return null;
    const profileIdEl =
      header.querySelector(MAN_PROFILE_ID_SELECTOR_PRIMARY) ||
      header.querySelector(MAN_PROFILE_ID_SELECTOR_FALLBACK);
    if (!profileIdEl) return null;
    let wrap = profileIdEl.parentElement;
    if (!wrap || !wrap.classList?.contains(MAN_ID_BALANCE_WRAP_CLASS)) {
      wrap = document.createElement("span");
      wrap.className = MAN_ID_BALANCE_WRAP_CLASS;
      profileIdEl.insertAdjacentElement("beforebegin", wrap);
      wrap.appendChild(profileIdEl);
    }
    let spendEl = wrap.querySelector(`.${MAN_SPEND_CLASS}`);
    if (!spendEl) {
      spendEl = document.createElement("span");
      spendEl.className = MAN_SPEND_CLASS;
      wrap.appendChild(spendEl);
    }
    return { wrap, spendEl };
  } catch {
    return null;
  }
}

function renderManSpendValue(value) {
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return "—";
  const normalized = Number.isInteger(num) ? String(num) : String(num.toFixed(2)).replace(/\.?0+$/, "");
  return normalized;
}

function updateManSpendInHeader() {
  try {
    const uiNodes = ensureManIdBalanceContainer();
    if (!uiNodes?.spendEl) return;
    ensureLocalTimeStyles();
    const chatUid = getActiveChatUidForSpend();
    let entry = chatUid ? manSpendByChatUid.get(chatUid) : null;
    if (!entry) {
      const chatId = getActiveChatIdForSpend();
      if (chatId) entry = manSpendByChatId.get(chatId) || null;
    }
    if (!entry) {
      const { man, woman } = readContext();
      const pairKey = getManSpendPairKey(man?.id, woman?.id);
      if (pairKey) {
        entry = manSpendByPairKey.get(pairKey) || null;
      }
    }
    uiNodes.spendEl.textContent = renderManSpendValue(entry?.max_spend_all_credits);
    uiNodes.spendEl.title = "Потрачено кредитов в этом чате";
    if (!entry) {
      const startedForChatUid = chatUid;
      void ensureManSpendDataForActiveChat()
        .then((loaded) => {
          if (!loaded) return;
          const currentChatUid = getActiveChatUidForSpend();
          if (startedForChatUid && currentChatUid !== startedForChatUid) return;
          updateManSpendInHeader();
        })
        .catch(() => {});
    }
  } catch {}
}

function updateWomanLocalTimeInHeader() {
  try {
    const info = getWomanPlaceInfo();
    const container = info?.container || null;
    const placeEl = info?.placeEl || null;
    const label = info ? buildWomanTimeLabel(info.city, info.countryCode) : "";
    const parent = placeEl?.parentElement || container || null;
    const existingList = parent
      ? Array.from(parent.querySelectorAll(`.${WOMAN_TIME_CLASS}`))
      : [];
    const existing = existingList[0] || null;
    if (!info || !label) {
      for (const node of existingList) node.remove();
      return;
    }
    ensureLocalTimeStyles();
    if (!existing) {
      const node = document.createElement("span");
      node.className = WOMAN_TIME_CLASS;
      if (placeEl) {
        placeEl.insertAdjacentElement("afterend", node);
      } else if (parent) {
        parent.appendChild(node);
      }
      node.textContent = label;
      node.title = "Локальное время пользователя";
    } else {
      existing.textContent = label;
      existing.title = "Локальное время пользователя";
    }
    if (existingList.length > 1) {
      for (const node of existingList.slice(1)) node.remove();
    }
  } catch {}
}

function updateManLocalTimeInHeader() {
  try {
    const info = getManPlaceInfo();
    const container = info?.container || null;
    const placeEl = info?.placeEl || null;
    const label = info ? buildManTimeLabel(info.city, info.countryCode) : "";
    const parent = placeEl?.parentElement || container || null;
    const existingList = parent
      ? Array.from(parent.querySelectorAll(`.${MAN_TIME_CLASS}`))
      : [];
    const existing = existingList[0] || null;
    if (!info || !label) {
      for (const node of existingList) node.remove();
      return;
    }
    ensureLocalTimeStyles();
    if (!existing) {
      const node = document.createElement("span");
      node.className = MAN_TIME_CLASS;
      if (placeEl) {
        placeEl.insertAdjacentElement("afterend", node);
      } else if (parent) {
        parent.appendChild(node);
      }
      node.textContent = label;
      node.title = "Локальное время пользователя";
    } else {
      existing.textContent = label;
      existing.title = "Локальное время пользователя";
    }
    if (existingList.length > 1) {
      for (const node of existingList.slice(1)) node.remove();
    }
  } catch {}
}

function startLocalTimeUpdates() {
  loadTimezoneData();
  updateWomanLocalTimeInHeader();
  updateManLocalTimeInHeader();
  updateManSpendInHeader();
}
function readContext() {
  LOG.log("readContext: reading DOM...");
  const scope = qs('[data-testid="chat-header"]') || document;
  const man = {
    ...parseNameAge(text(qs(S.manName, scope))),
    id: onlyDigits(text(qs(S.manId, scope))),
    city: text(qs(S.manPlace, scope)),
  };
  const woman = {
    ...parseNameAge(text(qs(S.womanName, scope))),
    id: onlyDigits(text(qs(S.womanId, scope))),
    city: text(qs(S.womanPlace, scope)),
  };
  const ctx = { man, woman };
  LOG.log("readContext result:", ctx);
  return ctx;
}

function isAlphaLanding() {
  try {
    const href = String(window.location.href || "");
    const base = href.split("#")[0]?.split("?")[0] || href;
    return /^https?:\/\/alpha\.date\/?$/.test(base);
  } catch {
    return false;
  }
}

// === UI ===
let root, shadow, ui, textarea, pinBtn, langSel;
let userInfoController = null;
let userInfoModulePromise = null;
const MONITOR_GOAL_INCREMENT = 100;
const MONITOR_GOAL_DEFAULT = 900;
const MONITOR_GOAL_STORAGE_KEY = "monitorGoalTarget";
const HOURLY_GOAL_MIN = 100;
const MONITOR_COUNTER_RESET_HOUR = 2; // 02:00 Kyiv time
const REPORTS_SHIFT_RESET_HOUR = 23; // 23:00 Kyiv time (reports only)
const WS_EVENTS_STORAGE_KEY = "ot4et_ws_events";
const WS_EVENTS_FALLBACK_STORAGE_KEY = "__ot4et_ws_events__";
const WS_WEBHOOK_FILTER_STORAGE_KEY = "ot4et_ws_webhook_paid_filter";
const WS_EVENTS_DISABLED_STORAGE_KEY = "ot4et_ws_events_disabled";
const WS_EVENTS_DISABLED_DEFAULT = false;
const ADMIN_READONLY_LATCH_STORAGE_KEY = "__ot4et_admin_readonly_latch__";
const LOGO_WHITE_SQUARE_PROFILES_STORAGE_KEY = "logoProfilesCache";
const LOGO_WHITE_SQUARE_BALANCE_STORAGE_KEY = "logoBalanceCache";
const monitorCounterState = {
  counts: {
    chat: 0,
    mail: 0,
    hourTotal: 0,
    hourStart: null,
    hourChat: 0,
    hourMail: 0,
    hourHistory: [],
    hourRecord: HOURLY_GOAL_MIN,
    profileStats: {},
  },
  goal: MONITOR_GOAL_DEFAULT,
  hourGoal: HOURLY_GOAL_MIN,
  initialized: false,
};

// Helpers for Kyiv time and day buckets (day changes at 23:00 Europe/Kyiv)
const KYIV_TZ = "Europe/Kiev";
const KYIV_STANDARD_OFFSET_MINUTES = 120;
const KYIV_SUMMER_OFFSET_MINUTES = 180;
let kyivDtf = null;
function getKyivFormatter() {
  if (kyivDtf !== null) return kyivDtf;
  try {
    kyivDtf = new Intl.DateTimeFormat("en-CA", {
      timeZone: KYIV_TZ,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    kyivDtf = null;
  }
  return kyivDtf;
}
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
function kyivParts(ms) {
  const date = new Date(ms);
  const formatter = getKyivFormatter();
  if (formatter && typeof formatter.formatToParts === "function") {
    try {
      const parts = formatter.formatToParts(date);
      const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
      return {
        y: Number(map.year),
        m: Number(map.month),
        d: Number(map.day),
        hh: Number(map.hour),
        mm: Number(map.minute),
        ss: Number(map.second),
      };
    } catch {
      // fallback below
    }
  }
  const offsetMinutes = getKyivFallbackOffsetMinutes(date);
  const shifted = new Date(date.getTime() + offsetMinutes * 60 * 1000);
  return {
    y: shifted.getUTCFullYear(),
    m: shifted.getUTCMonth() + 1,
    d: shifted.getUTCDate(),
    hh: shifted.getUTCHours(),
    mm: shifted.getUTCMinutes(),
    ss: shifted.getUTCSeconds(),
  };
}

const logoWhiteSquareProfilesState = {
  loading: false,
  error: "",
  items: [],
};
let logoWhiteSquareProfilesCacheLoaded = false;
let monitorHourlyTimerId = null;
let logoWhiteSquareBalancePersistTimer = null;
let lettersOpenInNewWindow = false;
let lettersOpenHotkey = LETTERS_OPEN_HOTKEY_DEFAULT;
let lettersOpenHotkeyParsed = null;
let profilePhotoHotkey = PROFILE_PHOTO_HOTKEY_DEFAULT;
let profilePhotoHotkeyParsed = null;
let translateSendHotkey = TRANSLATE_SEND_HOTKEY_DEFAULT;
let translateSendHotkeyParsed = null;
let translateSendHotkeyInFlight = false;
let settingsMenuOpen = false;
let settingsMenuCleanup = null;
let adminReadOnlyLatched = false;
try {
  adminReadOnlyLatched =
    window?.sessionStorage?.getItem?.(ADMIN_READONLY_LATCH_STORAGE_KEY) === "1";
} catch {}

async function loadUserInfoModule() {
  if (!userInfoModulePromise) {
    userInfoModulePromise = import(chrome.runtime.getURL("userInfoMenu.js")).catch(
      (err) => {
        userInfoModulePromise = null;
        throw err;
      }
    );
  }
  return userInfoModulePromise;
}

const PROFILE_SWITCH_ENDPOINTS = {
  profiles: "https://alpha.date/api/operator/profiles",
  setOnline: "https://alpha.date/api/operator/setProfileOnline",
  inviteList: "https://alpha.date/api/sender/inviteList",
  senderList: "https://alpha.date/api/sender/senderList",
  sender: "https://alpha.date/api/sender/create",
};
const PROFILE_SWITCH_COOLDOWN_MS = 5 * 60 * 1000;

const profileSwitchMemory = {
  profilesPayload: null,
  invitePayloads: new Map(),
  senderResponses: [],
};
const profileSwitchState = {
  busy: false,
  lockUntil: 0,
  lockTimer: null,
};
const AUTO_PROFILES_REFRESH_MS = 5 * 60 * 1000;
let lastProfilesRefreshAt = 0;
const operatorInfoState = {
  operatorId: null,
  operatorName: "",
  operatorNameUpdatedAt: 0,
  error: "",
};
let serverAuthAllowed = false;
let serverAuthChecking = false;
let serverAuthCheckedAt = 0;
let serverAuthPassword = "";
let serverAuthCheckPromise = null;
let serverAuthLastFailureKind = "";
let serverAuthStateLoaded = false;
let extensionLocked = true;
let operatorIdReady = false;
let operatorIdWaitMode = true;
let extensionUnlockInFlight = false;
let extensionUnlockPromise = null;
let extensionInstallId = "";
const PROFILE_SWITCH_INLINE_CONTAINER_SELECTORS = [
  ".ProfilesList_clmn_1_mm_chat_offline_girls__J4Tx3",
  '[class*="ProfilesList_clmn_1_mm_chat_offline_girls__"]',
  '[class*="mm_chat_offline_girls__"]',
  ".styles_clmn_1_mm_chat_offline_girls__D45SG",
  '[class*="styles_clmn_1_mm_chat_offline_girls__"]',
];
const PROFILES_BLOCK_SELECTOR = '[data-testid="profiles-block"]';
const PROFILES_LIST_SELECTOR = '[data-testid="profiles-list"]';
const PROFILE_SWITCH_INLINE_TARGET_SELECTORS = [
  '[class*="ProfilesList_clmn_1_mm_chat_list_item_right__"]',
  '[class*="mm_chat_list_item_right__"]',
  ".styles_clmn_1_mm_chat_list_item_right__1lnCE",
  '[class*="styles_clmn_1_mm_chat_list_item_right__"]',
];
const PROFILE_SWITCH_INLINE_STYLE_ID = "ot4et-profile-switch-inline-style";
let profileSwitchInlineButtonEl = null;
let profileSwitchPlacementObserver = null;
let profileSwitchPlacementInitialized = false;
let profileSwitchPlacementPending = false;
let profilesViewportLayoutScheduled = false;
let firstBalancePollPending = true;
const LOGO_WHITE_SQUARE_SELECTORS = [
  ".SideMenu_clmn_1_logo__IPgoP",
  '[class*="SideMenu_clmn_1_logo__"]',
  ".styles_clmn_1_logo__0s6Kb",
  '[class*="styles_clmn_1_logo__"]',
];
const LOGO_WHITE_SQUARE_STYLE_ID = "ot4et-logo-square-style";
const LOGO_WHITE_SQUARE_HOST_CLASS = "ot4et-logo-square-host";
const LOGO_WHITE_SQUARE_CLASS = "ot4et-logo-square";
const LOGO_WHITE_SQUARE_MENU_CLASS = "ot4et-logo-square-menu";
const LOGO_WHITE_SQUARE_MODAL_CLASS = "ot4et-logo-square-modal";
const LOGO_WHITE_SQUARE_EXPANDED_CLASS = "ot4et-logo-square-expanded";
const LOGO_WHITE_SQUARE_EXPANDED_CONTENT_CLASS =
  "ot4et-logo-square-expanded-content";
const LOGO_WHITE_SQUARE_EXPANDED_HIDDEN_CLASS =
  "ot4et-logo-square-expanded-hidden";
const LOGO_WHITE_SQUARE_EXPANDED_WRAPPER_CLASS =
  "ot4et-logo-square-expanded-wrapper";
const LOGO_WHITE_SQUARE_EXPANDED_WRAPPER_PADDING = {
  top: 10,
  right: 5,
  bottom: 10,
  left: 5,
};
const LOGO_WHITE_SQUARE_LEFT_COLUMN_SELECTORS = [
  '[class*="SideMenu_clmn_1__"]',
  '[class*="Notification_clmn_1__"]',
  ".styles_clmn_1__0z1aU.clmn_1",
  ".styles_clmn_1__0z1aU",
  ".clmn_1",
];
const LOGO_WHITE_SQUARE_RIGHT_COLUMN_SELECTORS = [
  '[class*="Notification_clmn_4__"]',
  '[class*="SideMenu_clmn_4__"]',
  ".styles_clmn_4__UKvqP",
  '[class*="styles_clmn_4__"]',
  '[class*="clmn_4__"]',
];
let balanceHourlyHistory = new Map();
let balanceHourlyStartMap = new Map();
let balanceProfileEarnings = Object.create(null);
const PROFILE_TOTALS_CACHE_TTL_MS = 60 * 1000;
const PROFILE_TOTALS_REQUEST_GAP_MS = 60 * 1000;
const PROFILE_TOTALS_CONCURRENCY = 1;
let profileTotalsCache = new Map();
let profileTotalsInFlight = new Map();
let profileTotalsDayKey = "";
let profileTotalsQueue = [];
let profileTotalsQueued = new Set();
let profileTotalsPumpTimer = null;
let profileTotalsLastStartTs = 0;
let profileTotalsInFlightCount = 0;
let allowedProfileTotalsIds = null;
let profilesRequireRefresh = true;
let profileShiftDeltaState = { dayKey: "", operatorId: "", profiles: {} };
let profileShiftStatsCache = Object.create(null);
let profileShiftDeltaQueue = [];
let operatorShiftSummaryCache = null;
let operatorShiftSnapshotState = {
  dayKey: "",
  operatorId: "",
  operator_name: "",
  balance_total: 0,
  actions_total: 0,
  chat_count: 0,
  mail_count: 0,
  hour_actions_total: 0,
  hour_chat_count: 0,
  hour_mail_count: 0,
  hour_start: 0,
};
let operatorShiftSnapshotQueue = [];
let operatorNamesCache = Object.create(null);
let operatorHourlyBalanceMap = new Map();
let operatorHourlyBalanceStartMap = new Map();
let operatorHourlyActionsMap = new Map();
let profileHourlyHistory = new Map();
let profileHourlyHistoryDayKey = "";
let profileTypeEarnings = Object.create(null);
let totalTypeEarnings = { chat: 0, mail: 0 };
let profileTypeBreakdown = Object.create(null);
let totalTypeBreakdown = Object.create(null);
let globalHourlyTypeBreakdown = new Map();
let totalPaidActionCounts = { chat: 0, mail: 0 };
let profilePaidActionCounts = Object.create(null);
let profileHourlyPaidActionCounts = new Map();
let globalHourlyPaidActionCounts = new Map();
let balanceEarningsDayKey = "";
let balanceEarningsCacheLoaded = false;
let logoWhiteSquareEl = null;
let logoWhiteSquareHostEl = null;
let logoWhiteSquareCounterEls = null;
let logoWhiteSquareBalanceCachedValue = null;
let logoWhiteSquareMenuEl = null;
let logoWhiteSquareObserver = null;
let logoWhiteSquareInitialized = false;
let logoWhiteSquarePlacementPending = false;
let logoWhiteSquareModalState = false;
let logoWhiteSquareExpandedEl = null;
let logoWhiteSquareExpandedWrapperEl = null;
let logoWhiteSquareExpandedOpen = false;
let logoWhiteSquareExpandedDocHandler = null;
let logoWhiteSquareExpandedKeyHandler = null;
let logoWhiteSquareExpandedParent = null;
let logoWhiteSquareExpandedHiddenNodes = null;
let operatorRatingPanelRoot = null;
let operatorRatingHourlyTimerId = null;
let operatorRatingPanelDom = null;
const operatorRatingState = {
  activeMainTab: "shift_balance",
  activeAllTimeSubTab: "balance",
  cache: new Map(),
  inFlight: new Map(),
  lastRenderAt: 0,
};

function injectProfileSwitchInlineStyles() {
  try {
    if (document.getElementById(PROFILE_SWITCH_INLINE_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = PROFILE_SWITCH_INLINE_STYLE_ID;
    style.textContent = `
.ot4et-profile-switch-inline-btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  width:28px;
  height:28px;
  padding:0;
  margin-right:8px;
  border-radius:3px;
  border:0;
  background:transparent;
  cursor:pointer;
  transition:background-color .15s ease, border-color .15s ease, opacity .15s ease;
  box-sizing:border-box;
}
.ot4et-profile-switch-inline-btn::before{
  content:"";
  width:18px;
  height:18px;
  display:block;
  background:url("${ICONS.profileSwitch}") no-repeat center/contain;
}
.ot4et-profile-switch-inline-btn:hover:not([disabled]){background:rgba(31,79,116,0.08);}
.ot4et-profile-switch-inline-btn[disabled]{
  opacity:0.55;
  cursor:default;
}
.ot4et-profile-switch-inline-btn.loading::before{
  border-radius:50%;
  border:2px solid rgba(31,79,116,0.3);
  border-top-color:rgba(31,79,116,0.85);
  background:transparent;
  animation:ot4et-inline-spin .8s linear infinite;
}
@keyframes ot4et-inline-spin{
  from{transform:rotate(0deg);}
  to{transform:rotate(360deg);}
}`;
    (document.head || document.documentElement || document.body)?.appendChild(style);
  } catch {}
}

function findElementBySelectors(selectors, root = document) {
  if (!selectors || !selectors.length) return null;
  let firstFound = null;
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const nodes = root.querySelectorAll(sel);
      if (!nodes || !nodes.length) continue;
      for (const el of nodes) {
        if (!firstFound) firstFound = el;
        try {
          if (isVisible(el)) return el;
        } catch {}
      }
    } catch {}
  }
  return firstFound;
}

function getNumericStyleValue(el, prop) {
  if (!el || !prop || typeof window === "undefined") return 0;
  try {
    const styles = window.getComputedStyle(el);
    if (!styles) return 0;
    const raw = styles.getPropertyValue(prop) || styles[prop] || "";
    const value = parseFloat(raw);
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function findCommonParent(a, b) {
  if (!a || !b) return null;
  const ancestors = new Set();
  let current = a;
  while (current) {
    ancestors.add(current);
    current = current.parentElement;
  }
  current = b;
  while (current) {
    if (ancestors.has(current)) return current;
    current = current.parentElement;
  }
  return null;
}

function findAncestorChild(parent, node) {
  if (!parent || !node) return null;
  let current = node;
  while (current && current.parentElement !== parent) {
    current = current.parentElement;
  }
  return current && current.parentElement === parent ? current : null;
}

function getLogoWhiteSquareExpandedPlacement() {
  const leftColumn = findElementBySelectors(LOGO_WHITE_SQUARE_LEFT_COLUMN_SELECTORS);
  if (!leftColumn) return null;
  const rightColumn = findElementBySelectors(LOGO_WHITE_SQUARE_RIGHT_COLUMN_SELECTORS);
  let parent = null;
  if (rightColumn) {
    parent = findCommonParent(leftColumn, rightColumn);
  }
  if (!parent) {
    parent = leftColumn.parentElement || rightColumn?.parentElement || null;
  }
  if (!parent) return null;
  const leftChild = findAncestorChild(parent, leftColumn);
  if (!leftChild) return null;
  const rightChild = rightColumn
    ? findAncestorChild(parent, rightColumn) ||
      (rightColumn.parentElement === parent ? rightColumn : null)
    : null;
  return {
    parent,
    leftChild,
    rightChild,
  };
}

function hideLogoWhiteSquareBetweenNodes(parent, leftChild, rightChild) {
  if (!parent || !leftChild) return [];
  const hidden = [];
  let node = leftChild.nextSibling;
  while (node && node !== rightChild) {
    const next = node.nextSibling;
    if (node.nodeType === 1) {
      node.classList.add(LOGO_WHITE_SQUARE_EXPANDED_HIDDEN_CLASS);
      hidden.push(node);
    }
    node = next;
  }
  return hidden;
}

function getLogoWhiteSquareExpandedAreaSize(parent, leftChild, rightChild) {
  if (!parent || !leftChild || typeof window === "undefined") return null;
  const leftRect = leftChild.getBoundingClientRect();
  const parentRect = parent.getBoundingClientRect();
  const leftGap = getNumericStyleValue(leftChild, "margin-right");
  const parentPaddingRight = getNumericStyleValue(parent, "padding-right");
  let start = leftRect.right + leftGap;
  let end = parentRect.right - parentPaddingRight;
  if (rightChild) {
    const rightRect = rightChild.getBoundingClientRect();
    const rightGap = getNumericStyleValue(rightChild, "margin-left");
    end = rightRect.left - rightGap;
  }
  const width = Math.max(0, end - start);
  const rightRect = rightChild?.getBoundingClientRect();
  const top = Math.min(leftRect.top, rightRect?.top ?? leftRect.top);
  const bottom = Math.max(leftRect.bottom, rightRect?.bottom ?? leftRect.bottom);
  const height = Math.max(0, bottom - top);
  return { width, height };
}

function ensureLogoWhiteSquareCounterStore() {
  if (!logoWhiteSquareCounterEls) {
    logoWhiteSquareCounterEls = {};
  }
  return logoWhiteSquareCounterEls;
}

function registerLogoWhiteSquareCounterRefs(refs = {}) {
  const store = ensureLogoWhiteSquareCounterStore();
  if (!refs || typeof refs !== "object") return store;
  Object.keys(refs).forEach((key) => {
    const node = refs[key];
    if (!node) return;
    if (!store[key]) {
      store[key] = new Set();
    }
    store[key].add(node);
  });
  return store;
}

function getLogoWhiteSquareCounterNodes(key) {
  const store = logoWhiteSquareCounterEls;
  if (!store || !key || !store[key]) return [];
  const target = store[key];
  if (target instanceof Set) return Array.from(target).filter(Boolean);
  if (Array.isArray(target)) return target.filter(Boolean);
  return target ? [target] : [];
}

function forEachLogoWhiteSquareCounterNode(key, cb) {
  if (typeof cb !== "function") return;
  const nodes = getLogoWhiteSquareCounterNodes(key);
  nodes.forEach((node) => {
    try {
      cb(node);
    } catch {}
  });
}

function setLogoWhiteSquareBalanceValue(value) {
  let text = "";
  if (typeof value === "string") {
    text = value.trim();
  } else if (value !== null && value !== undefined) {
    const num = Number(value);
    if (Number.isFinite(num)) {
      text = num.toFixed(2);
    }
  }
  if (!text) {
    text = "0.00";
  }
  logoWhiteSquareBalanceCachedValue = text;
  forEachLogoWhiteSquareCounterNode("balanceSummaryValue", (node) => {
    node.textContent = text;
  });
}

function applyLogoWhiteSquareCachedBalanceValue() {
  try {
    if (operatorShiftSummaryCache && operatorShiftSummaryCache.balance_total != null) {
      const num = Number(operatorShiftSummaryCache.balance_total);
      if (Number.isFinite(num)) {
        setLogoWhiteSquareBalanceValue(num);
        return;
      }
    }
  } catch {}
  if (logoWhiteSquareBalanceCachedValue === null) {
    try {
      const fallback = ui?.balanceMonitor?.element
        ?.querySelector?.("#adb-total")?.textContent;
      const normalized = (fallback || "").trim();
      if (normalized) {
        logoWhiteSquareBalanceCachedValue = normalized;
      }
    } catch {}
  }
  if (logoWhiteSquareBalanceCachedValue !== null) {
    setLogoWhiteSquareBalanceValue(logoWhiteSquareBalanceCachedValue);
  }
}

function getCurrentOperatorBalanceTotal() {
  try {
    if (
      operatorShiftSummaryCache &&
      operatorShiftSummaryCache.balance_total != null
    ) {
      const num = Number(operatorShiftSummaryCache.balance_total);
      if (Number.isFinite(num)) return num;
    }
  } catch {}
  try {
    if (logoWhiteSquareBalanceCachedValue != null) {
      const num = Number(String(logoWhiteSquareBalanceCachedValue).replace(",", "."));
      if (Number.isFinite(num)) return num;
    }
  } catch {}
  try {
    const fallback = ui?.balanceMonitor?.element
      ?.querySelector?.("#adb-total")?.textContent;
    const num = Number(String(fallback || "").replace(",", "."));
    if (Number.isFinite(num)) return num;
  } catch {}
  return 0;
}

function getKyivHourKey(ms) {
  if (!Number.isFinite(ms)) return null;
  const parts = kyivParts(ms);
  if (!parts || !Number.isFinite(parts.y) || !Number.isFinite(parts.m)) {
    return null;
  }
  const pad = (n) => String(n).padStart(2, "0");
  return `${parts.y}-${pad(parts.m)}-${pad(parts.d)}-${pad(parts.hh)}`;
}

function getKyivDayKey(ms = Date.now()) {
  if (!Number.isFinite(ms)) return "";
  const parts = kyivParts(ms);
  if (!parts || !Number.isFinite(parts.y) || !Number.isFinite(parts.m)) return "";
  let y = Number(parts.y) || 0;
  let m = Number(parts.m) || 1;
  let d = Number(parts.d) || 1;
  const hh = Number(parts.hh);
  if (Number.isFinite(hh) && hh < MONITOR_COUNTER_RESET_HOUR) {
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() - 1);
    y = date.getUTCFullYear();
    m = date.getUTCMonth() + 1;
    d = date.getUTCDate();
  }
  const pad = (n) => String(n).padStart(2, "0");
  return `${y}-${pad(m)}-${pad(d)}`;
}

function getKyivReportDayKey(ms = Date.now()) {
  if (!Number.isFinite(ms)) return "";
  const parts = kyivParts(ms);
  if (!parts || !Number.isFinite(parts.y) || !Number.isFinite(parts.m)) return "";
  let y = Number(parts.y) || 0;
  let m = Number(parts.m) || 1;
  let d = Number(parts.d) || 1;
  const hh = Number(parts.hh);
  if (Number.isFinite(hh) && hh >= REPORTS_SHIFT_RESET_HOUR) {
    const date = new Date(Date.UTC(y, m - 1, d));
    date.setUTCDate(date.getUTCDate() + 1);
    y = date.getUTCFullYear();
    m = date.getUTCMonth() + 1;
    d = date.getUTCDate();
  }
  const pad = (n) => String(n).padStart(2, "0");
  return `${y}-${pad(m)}-${pad(d)}`;
}

function getKyivHourStartTimestamp(ms) {
  if (!Number.isFinite(ms)) return null;
  const parts = kyivParts(ms);
  if (!parts) return null;
  const minutes = Number(parts.mm);
  const seconds = Number(parts.ss);
  const minutesValue = Number.isFinite(minutes) ? minutes : 0;
  const secondsValue = Number.isFinite(seconds) ? seconds : 0;
  const remainderMs = (minutesValue * 60 + secondsValue) * 1000;
  const millisPart = new Date(ms).getMilliseconds();
  return ms - remainderMs - millisPart;
}

function getActionKindFromType(actionType) {
  const raw = String(actionType || "").toUpperCase();
  if (!raw) return "chat";
  if (MAIL_ACTION_OVERRIDES.has(raw)) return "mail";
  if (raw.includes("MAIL")) return "mail";
  return "chat";
}

function getActionLabel(actionType) {
  const key = String(actionType || "");
  if (!key) return "";
  return ACTION_LABELS?.[key] || key;
}

function getProfileTotalsDayKey() {
  try {
    return new Date().toISOString().slice(0, 10);
  } catch {
    return "";
  }
}

function ensureProfileTotalsDayKey() {
  const dayKey = getProfileTotalsDayKey();
  if (!dayKey) return "";
  if (profileTotalsDayKey && profileTotalsDayKey === dayKey) return dayKey;
  profileTotalsDayKey = dayKey;
  profileTotalsCache = new Map();
  profileTotalsInFlight = new Map();
  profileTotalsQueue = [];
  profileTotalsQueued = new Set();
  profileTotalsInFlightCount = 0;
  profileTotalsLastStartTs = 0;
  if (profileTotalsPumpTimer) {
    clearTimeout(profileTotalsPumpTimer);
    profileTotalsPumpTimer = null;
  }
  balanceProfileEarnings = Object.create(null);
  try {
    scheduleLogoWhiteSquareBalancePersist(0);
  } catch {}
  return dayKey;
}

function getAuthTokenFromStorage() {
  try {
    const raw = window?.localStorage?.getItem?.("token");
    return typeof raw === "string" ? raw.trim() : "";
  } catch {
    return "";
  }
}

function extractGroupedPayload(data) {
  let grouped = null;
  if (Array.isArray(data?.response) && data.response.length) {
    grouped = data.response.find(
      (item) => item && typeof item === "object" && !Array.isArray(item)
    );
  } else if (data?.response && typeof data.response === "object") {
    grouped = data.response;
  } else if (data && typeof data === "object") {
    grouped = data;
  }
  return grouped && typeof grouped === "object" ? grouped : null;
}

function getGroupedTotalValue(grouped) {
  if (!grouped || typeof grouped !== "object") return 0;
  const totalRaw = Number.parseFloat(grouped?.total || 0);
  if (Number.isFinite(totalRaw)) return totalRaw;
  return Object.keys(grouped)
    .filter((key) => key !== "date" && key !== "total")
    .reduce((sum, key) => {
      const val = Number.parseFloat(grouped[key] || 0);
      return sum + (Number.isFinite(val) ? val : 0);
    }, 0);
}

function getCachedProfileTotal(profileId, dayKey) {
  const entry = profileTotalsCache.get(profileId);
  if (!entry || entry.dayKey !== dayKey) return null;
  if (Date.now() - (entry.ts || 0) > PROFILE_TOTALS_CACHE_TTL_MS) return null;
  return Number.isFinite(Number(entry.total)) ? Number(entry.total) : 0;
}

function setCachedProfileTotal(profileId, total, dayKey) {
  const normalizedTotal = Number.isFinite(Number(total)) ? Number(total) : 0;
  profileTotalsCache.set(profileId, {
    total: normalizedTotal,
    ts: Date.now(),
    dayKey,
  });
  const prev = Number(balanceProfileEarnings?.[profileId]);
  balanceProfileEarnings[profileId] = normalizedTotal;
  if (!Number.isFinite(prev) || prev !== normalizedTotal) {
    renderLogoWhiteSquareProfilesList();
  }
  scheduleLogoWhiteSquareBalancePersist();
  try {
    sendProfileShiftDeltas([profileId]);
  } catch {}
}

async function loadProfileShiftDeltaState() {
  try {
    const store = await getStore([PROFILE_SHIFT_DELTA_STORAGE_KEY]);
    const cached = store[PROFILE_SHIFT_DELTA_STORAGE_KEY];
    if (cached && typeof cached === "object") {
      profileShiftDeltaState = {
        dayKey: cached.dayKey || "",
        operatorId: cached.operatorId || "",
        profiles: cached.profiles || {},
      };
    }
  } catch {}
}

function persistProfileShiftDeltaState() {
  try {
    setStore({
      [PROFILE_SHIFT_DELTA_STORAGE_KEY]: {
        dayKey: profileShiftDeltaState.dayKey,
        operatorId: profileShiftDeltaState.operatorId,
        profiles: profileShiftDeltaState.profiles,
      },
    });
  } catch {}
}

async function loadProfileShiftDeltaQueue() {
  try {
    const store = await getStore([PROFILE_SHIFT_DELTA_QUEUE_KEY]);
    const cached = store[PROFILE_SHIFT_DELTA_QUEUE_KEY];
    if (Array.isArray(cached)) {
      profileShiftDeltaQueue = cached.filter(Boolean);
    }
  } catch {}
}

function persistProfileShiftDeltaQueue() {
  try {
    setStore({ [PROFILE_SHIFT_DELTA_QUEUE_KEY]: profileShiftDeltaQueue });
  } catch {}
}

function enqueueProfileShiftDelta(entries) {
  const merged = new Map();
  profileShiftDeltaQueue.forEach((entry) => {
    if (!entry) return;
    const key = `${entry.day_key}::${entry.operator_id}::${entry.profile_id}`;
    merged.set(key, { ...entry });
  });
  entries.forEach((entry) => {
    if (!entry) return;
    const key = `${entry.day_key}::${entry.operator_id}::${entry.profile_id}`;
    const current = merged.get(key);
    if (!current) {
      merged.set(key, { ...entry });
      return;
    }
    if (Number(entry.updated_at || 0) >= Number(current.updated_at || 0)) {
      merged.set(key, { ...entry });
    }
  });
  profileShiftDeltaQueue = Array.from(merged.values());
  if (profileShiftDeltaQueue.length > PROFILE_SHIFT_DELTA_QUEUE_LIMIT) {
    profileShiftDeltaQueue = profileShiftDeltaQueue.slice(
      profileShiftDeltaQueue.length - PROFILE_SHIFT_DELTA_QUEUE_LIMIT
    );
  }
  persistProfileShiftDeltaQueue();
}

async function flushProfileShiftDeltaQueue() {
  if (isAdminUniversalProfileContainerPresent()) return;
  if (!profileShiftDeltaQueue.length) return;
  const base = await getProfileStatsApiBase();
  if (!base) return;
  const groups = new Map();
  profileShiftDeltaQueue.forEach((entry) => {
    if (!entry) return;
    const key = `${entry.day_key}::${entry.operator_id}`;
    if (!groups.has(key)) {
      groups.set(key, { day_key: entry.day_key, profiles: [] });
    }
    groups.get(key).profiles.push({
      profile_id: entry.profile_id,
      operator_id: entry.operator_id,
      operator_name: entry.operator_name,
      actions_total: entry.actions_total,
      chat_count: entry.chat_count,
      mail_count: entry.mail_count,
      balance_earned: entry.balance_earned,
      updated_at: entry.updated_at,
    });
  });
  for (const group of groups.values()) {
    try {
      const res = await fetch(`${base}/profiles/shift/delta`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          day_key: group.day_key,
          profiles: group.profiles,
        }),
      });
      if (!res.ok) return;
      const data = await res.json().catch(() => ({}));
      if (!data || data.ok !== true) return;
      const sentKeys = new Set(
        group.profiles.map(
          (entry) => `${group.day_key}::${entry.operator_id}::${entry.profile_id}`
        )
      );
      profileShiftDeltaQueue = profileShiftDeltaQueue.filter((entry) => {
        const key = `${entry.day_key}::${entry.operator_id}::${entry.profile_id}`;
        return !sentKeys.has(key);
      });
      persistProfileShiftDeltaQueue();
    } catch {
      return;
    }
  }
}

function resetProfileShiftDeltaState(dayKey, operatorId) {
  profileShiftDeltaState = { dayKey, operatorId, profiles: {} };
  persistProfileShiftDeltaState();
}

async function loadProfileShiftStatsCache() {
  try {
    const store = await getStore([PROFILE_SHIFT_STATS_CACHE_KEY]);
    const cached = store[PROFILE_SHIFT_STATS_CACHE_KEY];
    if (cached && typeof cached === "object") {
      profileShiftStatsCache = cached || Object.create(null);
      renderLogoWhiteSquareProfilesList();
    }
  } catch {}
}

async function loadOperatorShiftSummaryCache() {
  try {
    const store = await getStore([OPERATOR_SHIFT_SUMMARY_CACHE_KEY]);
    const cached = store[OPERATOR_SHIFT_SUMMARY_CACHE_KEY];
    if (cached && typeof cached === "object") {
      operatorShiftSummaryCache = cached;
      try {
        operatorHourlyBalanceMap = new Map();
        operatorHourlyBalanceStartMap = new Map();
        operatorHourlyActionsMap = new Map();
        const list = Array.isArray(cached.hourly_balance)
          ? cached.hourly_balance
          : [];
        list.forEach((entry) => {
          const start = Number(entry?.hour_start) || 0;
          if (!start) return;
          const key = getKyivHourKey(start) || `ts-${start}`;
          const amount = Number(entry?.balance_amount) || 0;
          operatorHourlyBalanceMap.set(key, amount);
          operatorHourlyBalanceStartMap.set(key, start);
        });
        const actions = Array.isArray(cached.hourly_actions)
          ? cached.hourly_actions
          : [];
        actions.forEach((entry) => {
          const start = Number(entry?.hour_start) || 0;
          if (!start) return;
          const key = getKyivHourKey(start) || `ts-${start}`;
          operatorHourlyActionsMap.set(key, {
            start,
            chat: Number(entry?.chat_count) || 0,
            mail: Number(entry?.mail_count) || 0,
            total:
              Number(entry?.actions_total) ||
              (Number(entry?.chat_count) || 0) + (Number(entry?.mail_count) || 0),
          });
        });
      } catch {
        operatorHourlyBalanceMap = new Map();
        operatorHourlyBalanceStartMap = new Map();
        operatorHourlyActionsMap = new Map();
      }
      try {
        const opId = String(
          cached.operator_id || cached.operatorId || ""
        ).trim();
        const opName = String(
          cached.operator_name || cached.operatorName || ""
        ).trim();
        if (opId && opName) {
          setOperatorNameEntry({
            operator_id: opId,
            operator_name: opName,
            updated_at: Number(cached.updated_at || 0) || Date.now(),
          });
        }
      } catch {}
      updateMonitorCounterUI();
      applyLogoWhiteSquareCachedBalanceValue();
    }
  } catch {}
}

function persistOperatorShiftSummaryCache() {
  try {
    setStore({ [OPERATOR_SHIFT_SUMMARY_CACHE_KEY]: operatorShiftSummaryCache });
  } catch {}
}

async function loadOperatorShiftSnapshotQueue() {
  try {
    const store = await getStore([OPERATOR_SHIFT_SNAPSHOT_QUEUE_KEY]);
    const cached = store[OPERATOR_SHIFT_SNAPSHOT_QUEUE_KEY];
    if (Array.isArray(cached)) {
      operatorShiftSnapshotQueue = cached.filter(Boolean);
    }
  } catch {}
}

function persistOperatorShiftSnapshotQueue() {
  try {
    setStore({ [OPERATOR_SHIFT_SNAPSHOT_QUEUE_KEY]: operatorShiftSnapshotQueue });
  } catch {}
}

async function loadOperatorNamesCache() {
  try {
    const store = await getStore([OPERATOR_NAMES_CACHE_KEY]);
    const cached = store[OPERATOR_NAMES_CACHE_KEY];
    if (cached && typeof cached === "object") {
      operatorNamesCache = cached || Object.create(null);
      updateOperatorNameUI();
      renderLogoWhiteSquareProfilesList();
    }
  } catch {}
}

function persistOperatorNamesCache() {
  try {
    setStore({ [OPERATOR_NAMES_CACHE_KEY]: operatorNamesCache });
  } catch {}
}

function getOperatorNameEntry(operatorId) {
  const key = String(operatorId || "").trim();
  if (!key) return null;
  const entry = operatorNamesCache?.[key];
  return entry && typeof entry === "object" ? entry : null;
}

function mergeOperatorNamesCache(entries) {
  if (!Array.isArray(entries) || !entries.length) return false;
  let changed = false;
  entries.forEach((entry) => {
    const opId = String(entry?.operator_id || entry?.operatorId || "").trim();
    if (!opId) return;
    const updatedAt = Number(entry?.updated_at || entry?.updatedAt || 0) || 0;
    const current = getOperatorNameEntry(opId);
    const currentUpdated = Number(current?.updated_at || 0) || 0;
    if (!current || updatedAt >= currentUpdated) {
      operatorNamesCache[opId] = {
        operator_id: opId,
        operator_name: String(entry?.operator_name || entry?.operatorName || "").trim(),
        updated_at: updatedAt || Date.now(),
      };
      changed = true;
    }
  });
  if (changed) {
    persistOperatorNamesCache();
    updateOperatorNameUI();
    renderLogoWhiteSquareProfilesList();
  }
  return changed;
}

function setOperatorNameEntry(entry) {
  if (!entry || typeof entry !== "object") return false;
  return mergeOperatorNamesCache([entry]);
}

function mergeOperatorNamesFromProfileEntries(profiles) {
  if (!profiles || typeof profiles !== "object") return false;
  const collected = [];
  Object.values(profiles).forEach((entries) => {
    if (!Array.isArray(entries)) return;
    entries.forEach((entry) => {
      const opId = String(entry?.operator_id || entry?.operatorId || "").trim();
      const opName = String(entry?.operator_name || entry?.operatorName || "").trim();
      const updatedAt = Number(entry?.updated_at || entry?.updatedAt || 0) || 0;
      if (opId && opName) {
        collected.push({
          operator_id: opId,
          operator_name: opName,
          updated_at: updatedAt || Date.now(),
        });
      }
    });
  });
  if (!collected.length) return false;
  return mergeOperatorNamesCache(collected);
}

function resolveOperatorDisplayName(opId) {
  const id = String(opId || "").trim();
  if (!id) return { label: "—", title: "" };
  const entry = getOperatorNameEntry(id);
  const name = String(entry?.operator_name || "").trim();
  if (name) {
    return { label: name, title: `ID: ${id}` };
  }
  return { label: id, title: `ID: ${id}` };
}


function updateOperatorNameUI() {
  const operatorId = operatorInfoState.operatorId;
  const entry = operatorId ? getOperatorNameEntry(String(operatorId)) : null;
  if (entry) {
    operatorInfoState.operatorName = String(entry.operator_name || "").trim();
    operatorInfoState.operatorNameUpdatedAt = Number(entry.updated_at || 0) || 0;
  } else if (
    operatorShiftSummaryCache &&
    String(operatorShiftSummaryCache.operator_id || "") === String(operatorId || "")
  ) {
    const cachedName = String(
      operatorShiftSummaryCache.operator_name || ""
    ).trim();
    if (cachedName) {
      operatorInfoState.operatorName = cachedName;
      operatorInfoState.operatorNameUpdatedAt =
        Number(operatorShiftSummaryCache.updated_at || 0) || 0;
      setOperatorNameEntry({
        operator_id: String(operatorId),
        operator_name: cachedName,
        updated_at: operatorInfoState.operatorNameUpdatedAt || Date.now(),
      });
    }
  }
  const name = operatorInfoState.operatorName || "";
  forEachLogoWhiteSquareCounterNode("operatorNameInput", (node) => {
    if (!node || node === document.activeElement) return;
    node.value = name;
    node.title = name;
  });
  forEachLogoWhiteSquareCounterNode("operatorNameSave", (node) => {
    if (!node) return;
    const input = node
      ?.closest(".menu-operator-name-control")
      ?.querySelector(".menu-operator-name-input");
    const currentVal = String(input?.value || "").trim();
    node.disabled = currentVal === name.trim();
  });
}

function enqueueOperatorShiftSnapshot(entry) {
  if (!entry) return;
  const key = `${entry.day_key}::${entry.operator_id}`;
  const merged = new Map();
  operatorShiftSnapshotQueue.forEach((item) => {
    if (!item) return;
    const itemKey = `${item.day_key}::${item.operator_id}`;
    merged.set(itemKey, item);
  });
  const current = merged.get(key);
  if (!current || Number(entry.updated_at || 0) >= Number(current.updated_at || 0)) {
    merged.set(key, entry);
  }
  operatorShiftSnapshotQueue = Array.from(merged.values());
  persistOperatorShiftSnapshotQueue();
}

async function flushOperatorShiftSnapshotQueue() {
  if (isUiBlockedByMissingOperatorId()) return;
  if (isAdminUniversalProfileContainerPresent()) return;
  if (!operatorShiftSnapshotQueue.length) return;
  const base = await getProfileStatsApiBase();
  if (!base) return;
  const entry = operatorShiftSnapshotQueue[0];
  try {
    const res = await fetch(`${base}/operators/shift/snapshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });
    if (!res.ok) return;
    const data = await res.json().catch(() => ({}));
    if (!data || data.ok !== true) return;
    operatorShiftSnapshotQueue.shift();
    persistOperatorShiftSnapshotQueue();
  } catch {}
}

async function fetchOperatorShiftSummary() {
  if (isUiBlockedByMissingOperatorId()) return;
  const operatorId = operatorInfoState.operatorId;
  if (!operatorId) return;
  const base = await getProfileStatsApiBase();
  if (!base) return;
  const dayKey = getKyivDayKey();
  try {
    const res = await fetch(
      `${base}/operators/shift?operator_id=${encodeURIComponent(
        operatorId
      )}&day_key=${encodeURIComponent(dayKey)}`,
      { method: "GET" }
    );
    if (!res.ok) return;
    const data = await res.json().catch(() => ({}));
    if (!data || data.ok !== true) return;
    operatorShiftSummaryCache = data.summary || null;
    try {
      operatorHourlyBalanceMap = new Map();
      operatorHourlyBalanceStartMap = new Map();
      operatorHourlyActionsMap = new Map();
      const list = Array.isArray(data?.summary?.hourly_balance)
        ? data.summary.hourly_balance
        : [];
      list.forEach((entry) => {
        const start = Number(entry?.hour_start) || 0;
        if (!start) return;
        const key = getKyivHourKey(start) || `ts-${start}`;
        const amount = Number(entry?.balance_amount) || 0;
        operatorHourlyBalanceMap.set(key, amount);
        operatorHourlyBalanceStartMap.set(key, start);
      });
      const actions = Array.isArray(data?.summary?.hourly_actions)
        ? data.summary.hourly_actions
        : [];
      actions.forEach((entry) => {
        const start = Number(entry?.hour_start) || 0;
        if (!start) return;
        const key = getKyivHourKey(start) || `ts-${start}`;
        operatorHourlyActionsMap.set(key, {
          start,
          chat: Number(entry?.chat_count) || 0,
          mail: Number(entry?.mail_count) || 0,
          total:
            Number(entry?.actions_total) ||
            (Number(entry?.chat_count) || 0) + (Number(entry?.mail_count) || 0),
        });
      });
    } catch {
      operatorHourlyBalanceMap = new Map();
      operatorHourlyBalanceStartMap = new Map();
      operatorHourlyActionsMap = new Map();
    }
    if (operatorShiftSummaryCache) {
      const opId = String(
        operatorShiftSummaryCache.operator_id ||
          operatorShiftSummaryCache.operatorId ||
          ""
      ).trim();
      const opName = String(
        operatorShiftSummaryCache.operator_name ||
          operatorShiftSummaryCache.operatorName ||
          ""
      ).trim();
      if (opId && opName) {
        setOperatorNameEntry({
          operator_id: opId,
          operator_name: opName,
          updated_at: Number(operatorShiftSummaryCache.updated_at || 0) || Date.now(),
        });
      }
    }
    persistOperatorShiftSummaryCache();
    updateMonitorCounterUI();
    applyLogoWhiteSquareCachedBalanceValue();
  } catch {}
}

async function sendOperatorShiftSnapshot(balanceTotal) {
  if (isUiBlockedByMissingOperatorId()) return;
  if (isAdminUniversalProfileContainerPresent()) return;
  const operatorId = operatorInfoState.operatorId;
  if (!operatorId) return;
  const operatorName = String(operatorInfoState.operatorName || "").trim();
  const dayKey = getKyivDayKey();
  if (!dayKey) return;
  const chat = Number(monitorCounterState.counts.chat) || 0;
  const mail = Number(monitorCounterState.counts.mail) || 0;
  const actionsTotal = chat + mail;
  const balance = Number(balanceTotal) || 0;
  const hourChat = Number(monitorCounterState.counts.hourChat) || 0;
  const hourMail = Number(monitorCounterState.counts.hourMail) || 0;
  const hourActionsTotal = Number(monitorCounterState.counts.hourTotal) || 0;
  const hourStart = Number(monitorCounterState.counts.hourStart) || 0;
  if (
    operatorShiftSnapshotState.dayKey === dayKey &&
    operatorShiftSnapshotState.operatorId === String(operatorId) &&
    String(operatorShiftSnapshotState.operator_name || "") === operatorName &&
    operatorShiftSnapshotState.balance_total === balance &&
    operatorShiftSnapshotState.actions_total === actionsTotal &&
    operatorShiftSnapshotState.chat_count === chat &&
    operatorShiftSnapshotState.mail_count === mail &&
    operatorShiftSnapshotState.hour_actions_total === hourActionsTotal &&
    operatorShiftSnapshotState.hour_chat_count === hourChat &&
    operatorShiftSnapshotState.hour_mail_count === hourMail &&
    operatorShiftSnapshotState.hour_start === hourStart
  ) {
    return;
  }
  const payload = {
    day_key: dayKey,
    operator_id: String(operatorId),
    operator_name: operatorName,
    balance_total: balance,
    actions_total: actionsTotal,
    chat_count: chat,
    mail_count: mail,
    hour_actions_total: hourActionsTotal,
    hour_chat_count: hourChat,
    hour_mail_count: hourMail,
    hour_start: hourStart || null,
    updated_at: Date.now(),
  };
  const base = await getProfileStatsApiBase();
  if (!base) {
    if (!isServerAccessLocked()) {
      enqueueOperatorShiftSnapshot(payload);
      operatorShiftSnapshotState = {
        dayKey,
        operatorId: String(operatorId),
        operator_name: operatorName,
        balance_total: balance,
        actions_total: actionsTotal,
        chat_count: chat,
        mail_count: mail,
        hour_actions_total: hourActionsTotal,
        hour_chat_count: hourChat,
        hour_mail_count: hourMail,
        hour_start: hourStart,
      };
    }
    return;
  }
  try {
    await flushOperatorShiftSnapshotQueue();
    const res = await fetch(`${base}/operators/shift/snapshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      enqueueOperatorShiftSnapshot(payload);
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!data || data.ok !== true) {
      enqueueOperatorShiftSnapshot(payload);
      return;
    }
    operatorShiftSnapshotState = {
      dayKey,
      operatorId: String(operatorId),
      operator_name: operatorName,
      balance_total: balance,
      actions_total: actionsTotal,
      chat_count: chat,
      mail_count: mail,
      hour_actions_total: hourActionsTotal,
      hour_chat_count: hourChat,
      hour_mail_count: hourMail,
      hour_start: hourStart,
    };
  } catch {
    enqueueOperatorShiftSnapshot(payload);
  }
}

function persistProfileShiftStatsCache() {
  try {
    setStore({ [PROFILE_SHIFT_STATS_CACHE_KEY]: profileShiftStatsCache });
  } catch {}
}

async function fetchProfileShiftStatsBatch(profileIds) {
  const ids = Array.isArray(profileIds) ? profileIds.filter(Boolean) : [];
  if (!ids.length) return;
  const base = await getProfileStatsApiBase();
  if (!base) return;
  const dayKey = getKyivDayKey();
  try {
    const res = await fetch(`${base}/profiles/shift/batch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day_key: dayKey, profile_ids: ids }),
    });
    if (!res.ok) return;
    const data = await res.json().catch(() => ({}));
    if (!data || data.ok !== true) {
      return;
    }
    if (data.profiles && typeof data.profiles === "object") {
      profileShiftStatsCache = data.profiles;
      persistProfileShiftStatsCache();
      mergeOperatorNamesFromProfileEntries(data.profiles);
      renderLogoWhiteSquareProfilesList();
    }
  } catch {}
}

async function sendProfileShiftDeltas(profileIds) {
  if (isUiBlockedByMissingOperatorId()) return;
  if (isAdminUniversalProfileContainerPresent()) return;
  const operatorId = operatorInfoState.operatorId;
  if (!operatorId) return;
  const operatorName = String(operatorInfoState.operatorName || "").trim();
  const dayKey = getKyivDayKey();
  if (!dayKey) return;
  if (
    profileShiftDeltaState.dayKey !== dayKey ||
    profileShiftDeltaState.operatorId !== String(operatorId)
  ) {
    resetProfileShiftDeltaState(dayKey, String(operatorId));
  }
  const ids = Array.isArray(profileIds) ? profileIds.filter(Boolean) : [];
  if (!ids.length) return;
  const statsMap =
    (monitorCounterState.counts &&
      monitorCounterState.counts.profileStats &&
      typeof monitorCounterState.counts.profileStats === "object"
      ? monitorCounterState.counts.profileStats
      : {}) || {};
  const payload = [];
  ids.forEach((profileId) => {
    const key = normalizeProfileExternalId(profileId);
    if (!key) return;
    const stats = statsMap[key] || {};
    const chat = Number(stats.chat) || 0;
    const mail = Number(stats.mail) || 0;
    const actionsTotal = chat + mail;
    const balance = Number(balanceProfileEarnings?.[key]) || 0;
    const prev = profileShiftDeltaState.profiles[key] || null;
    if (
      prev &&
      Number(prev.actions_total) === actionsTotal &&
      Number(prev.chat_count) === chat &&
      Number(prev.mail_count) === mail &&
      Number(prev.balance_earned) === balance
    ) {
      return;
    }
    if (actionsTotal || chat || mail || balance || prev === null) {
      payload.push({
        profile_id: key,
        operator_id: String(operatorId),
        operator_name: operatorName,
        actions_total: Math.max(0, Math.round(actionsTotal)),
        chat_count: Math.max(0, Math.round(chat)),
        mail_count: Math.max(0, Math.round(mail)),
        balance_earned: Number(balance) || 0,
        updated_at: Date.now(),
      });
    }
  });
  if (!payload.length) return;
  const applyLocalState = () => {
    payload.forEach((entry) => {
      const key = entry.profile_id;
      profileShiftDeltaState.profiles[key] = {
        actions_total: Number(entry.actions_total || 0),
        chat_count: Number(entry.chat_count || 0),
        mail_count: Number(entry.mail_count || 0),
        balance_earned: Number(entry.balance_earned || 0),
      };
    });
    persistProfileShiftDeltaState();
  };
  const base = await getProfileStatsApiBase();
  if (!base) {
    if (!isServerAccessLocked()) {
      enqueueProfileShiftDelta(
        payload.map((entry) => ({ ...entry, day_key: dayKey }))
      );
      applyLocalState();
    }
    return;
  }
  try {
    await flushProfileShiftDeltaQueue();
    const res = await fetch(`${base}/profiles/shift/delta`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day_key: dayKey, profiles: payload }),
    });
    if (!res.ok) {
      enqueueProfileShiftDelta(
        payload.map((entry) => ({ ...entry, day_key: dayKey }))
      );
      applyLocalState();
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!data || data.ok !== true) {
      enqueueProfileShiftDelta(
        payload.map((entry) => ({ ...entry, day_key: dayKey }))
      );
      applyLocalState();
      return;
    }
    applyLocalState();
  } catch {
    try {
      enqueueProfileShiftDelta(
        payload.map((entry) => ({ ...entry, day_key: dayKey }))
      );
      applyLocalState();
    } catch {}
  }
}

function scheduleProfileTotalsPump(delayMs) {
  if (profileTotalsPumpTimer) return;
  const delay = Math.max(0, Number(delayMs) || 0);
  profileTotalsPumpTimer = setTimeout(() => {
    profileTotalsPumpTimer = null;
    pumpProfileTotalsQueue();
  }, delay);
}

function pumpProfileTotalsQueue() {
  const dayKey = ensureProfileTotalsDayKey();
  if (!dayKey) return;
  while (
    profileTotalsInFlightCount < PROFILE_TOTALS_CONCURRENCY &&
    profileTotalsQueue.length > 0
  ) {
    const now = Date.now();
    const waitMs = PROFILE_TOTALS_REQUEST_GAP_MS - (now - profileTotalsLastStartTs);
    if (profileTotalsLastStartTs && waitMs > 0) {
      scheduleProfileTotalsPump(waitMs);
      return;
    }
    const profileId = profileTotalsQueue.shift();
    profileTotalsQueued.delete(profileId);
    if (allowedProfileTotalsIds && !allowedProfileTotalsIds.has(profileId)) {
      continue;
    }
    profileTotalsLastStartTs = now;
    profileTotalsInFlightCount += 1;
    requestProfileTotalImmediate(profileId, dayKey)
      .catch(() => {})
      .finally(() => {
        profileTotalsInFlightCount = Math.max(0, profileTotalsInFlightCount - 1);
        scheduleProfileTotalsPump(0);
      });
  }
}

function enqueueProfileTotal(profileId) {
  const normalized = normalizeProfileExternalId(profileId);
  if (!normalized) return;
  if (profilesRequireRefresh) return;
  if (allowedProfileTotalsIds && !allowedProfileTotalsIds.has(normalized)) return;
  const dayKey = ensureProfileTotalsDayKey();
  if (!dayKey) return;
  if (getCachedProfileTotal(normalized, dayKey) !== null) return;
  if (profileTotalsQueued.has(normalized)) return;
  if (profileTotalsInFlight.has(normalized)) return;
  profileTotalsQueued.add(normalized);
  profileTotalsQueue.push(normalized);
  scheduleProfileTotalsPump(0);
}

async function requestProfileTotalImmediate(profileId, dayKey) {
  const normalized = normalizeProfileExternalId(profileId);
  if (!normalized) return;
  if (profilesRequireRefresh) return;
  if (allowedProfileTotalsIds && !allowedProfileTotalsIds.has(normalized)) return;
  const cached = getCachedProfileTotal(normalized, dayKey);
  if (cached !== null) return;
  if (profileTotalsInFlight.has(normalized)) return;
  const task = (async () => {
    const token = getAuthTokenFromStorage();
    if (!token) return;
    await ensureProfilesRefreshedBeforeStats({ forceIfEmpty: true });
    const url = `https://alpha.date/api/statistic/profileActionGrouped?date_from=${dayKey}&date_to=${dayKey}&profile_external_id=${encodeURIComponent(
      normalized
    )}`;
    try {
      const resp = await fetch(url, {
        credentials: "include",
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
        },
      });
      if (!resp.ok) return;
      const data = await resp.json();
      if (data?.status === false) return;
      const grouped = extractGroupedPayload(data);
      const total = getGroupedTotalValue(grouped);
      if (dayKey === profileTotalsDayKey) {
        setCachedProfileTotal(normalized, total, dayKey);
      }
    } catch {}
  })();
  profileTotalsInFlight.set(normalized, task);
  try {
    await task;
  } finally {
    profileTotalsInFlight.delete(normalized);
  }
}

function ensureProfileHourlyHistoryDayKey(ms = Date.now()) {
  const dayKey = getKyivDayKey(ms);
  if (!profileHourlyHistoryDayKey) {
    profileHourlyHistoryDayKey = dayKey;
    return dayKey;
  }
  if (profileHourlyHistoryDayKey !== dayKey) {
    profileHourlyHistory = new Map();
    profileHourlyHistoryDayKey = dayKey;
  }
  return dayKey;
}

function resolveProfileHistoryId(value) {
  const normalized = normalizeProfileExternalId(value);
  if (normalized) return normalized;
  const raw = String(value ?? "").trim();
  if (!raw) return "unknown";
  return raw;
}

function getProfileHourEntry(profileId, hourKey, hourStartMs) {
  const profileKey = resolveProfileHistoryId(profileId);
  let hoursMap = profileHourlyHistory.get(profileKey);
  if (!hoursMap) {
    hoursMap = new Map();
    profileHourlyHistory.set(profileKey, hoursMap);
  }
  let normalizedHourKey = hourKey;
  if (!normalizedHourKey) {
    if (Number.isFinite(hourStartMs)) {
      normalizedHourKey = getKyivHourKey(hourStartMs);
    }
    if (!normalizedHourKey) {
      normalizedHourKey = getKyivHourKey(Date.now());
    }
  }
  if (!normalizedHourKey) return null;
  let entry = hoursMap.get(normalizedHourKey);
  if (!entry) {
    let startValue = null;
    if (Number.isFinite(hourStartMs)) startValue = hourStartMs;
    else {
      const computed = getKyivHourStartTimestamp(Date.now());
      if (Number.isFinite(computed)) startValue = computed;
    }
    entry = {
      start: startValue,
      total: 0,
      chat: 0,
      mail: 0,
      earnings: 0,
      typeBreakdown: Object.create(null),
    };
    hoursMap.set(normalizedHourKey, entry);
  } else if (!Number.isFinite(entry.start) && Number.isFinite(hourStartMs)) {
    entry.start = hourStartMs;
  }
  return entry;
}

function resetProfileHourlyEarnings() {
  profileHourlyHistory.forEach((hoursMap) => {
    hoursMap.forEach((entry) => {
      entry.earnings = 0;
      if (entry && typeof entry === "object") {
        entry.typeBreakdown = Object.create(null);
      }
    });
  });
}

function recordProfileHourlyActionEvent(
  profileId,
  kind,
  timestamp = Date.now(),
  count = 1
) {
  ensureProfileHourlyHistoryDayKey(timestamp);
  const hourKey = getKyivHourKey(timestamp);
  const hourStart = getKyivHourStartTimestamp(timestamp);
  if (!hourKey) return;
  const entry = getProfileHourEntry(profileId || "unknown", hourKey, hourStart);
  if (!entry) return;
  const delta =
    Number.isFinite(Number(count)) && Number(count) > 0
      ? Math.round(Number(count))
      : 1;
  entry.total = (Number(entry.total) || 0) + delta;
  if (kind === "mail") {
    entry.mail = (Number(entry.mail) || 0) + delta;
  } else {
    entry.chat = (Number(entry.chat) || 0) + delta;
  }
  scheduleLogoWhiteSquareBalancePersist();
}

function updateBalanceHourlyHistoryFromRows(rows) {
  const todayKey = getKyivDayKey();
  const dayChanged = !balanceEarningsDayKey || balanceEarningsDayKey !== todayKey;
  if (dayChanged) {
    balanceEarningsDayKey = todayKey;
    profileHourlyHistoryDayKey = todayKey;
    balanceHourlyHistory = new Map();
    balanceHourlyStartMap = new Map();
    balanceProfileEarnings = Object.create(null);
    profileHourlyHistory = new Map();
    profileTypeEarnings = Object.create(null);
    totalTypeEarnings = { chat: 0, mail: 0 };
    totalPaidActionCounts = { chat: 0, mail: 0 };
    profilePaidActionCounts = Object.create(null);
    profileHourlyPaidActionCounts = new Map();
    globalHourlyPaidActionCounts = new Map();
  } else {
    if (!profileHourlyHistoryDayKey) {
      profileHourlyHistoryDayKey = todayKey;
    }
    resetProfileHourlyEarnings();
  }
  const map = new Map();
  const startMap = new Map();
  const typeTotals = { chat: 0, mail: 0, breakdown: Object.create(null) };
  const typeProfiles = Object.create(null);
  const typeBreakdownTotals = Object.create(null);
  const hourlyBreakdownMap = new Map();
  const paidTotals = { chat: 0, mail: 0 };
  const paidProfiles = Object.create(null);
  const paidProfileHourlyMap = new Map();
  const paidHourlyMap = new Map();
  if (Array.isArray(rows)) {
    rows.forEach((item) => {
      const ts = new Date(item?.created_at || item?.createdAt || 0).getTime();
      if (!ts) return;
      const key = getKyivHourKey(ts);
      if (!key) return;
      const val = Number.parseFloat(item?.operator_price || 0);
      if (!Number.isFinite(val)) return;
      map.set(key, (map.get(key) || 0) + val);
      let hourStart = startMap.get(key);
      if (!Number.isFinite(hourStart)) {
        const computed = getKyivHourStartTimestamp(ts);
        if (Number.isFinite(computed)) {
          hourStart = computed;
          startMap.set(key, hourStart);
        }
      }
      const rawProfileId =
        item?.profile_external_id ||
        item?.profileExternalId ||
        item?.profile?.external_id ||
        item?.profile?.externalId ||
        item?.woman_external_id ||
        item?.womanExternalId;
      const profileId =
        normalizeProfileExternalId(rawProfileId) || "unknown";
      const kind = getActionKindFromType(item?.action_type || item?.actionType);
      typeTotals[kind] = (typeTotals[kind] || 0) + val;
      paidTotals[kind] = (paidTotals[kind] || 0) + 1;
      if (!paidProfiles[profileId]) {
        paidProfiles[profileId] = { chat: 0, mail: 0 };
      }
      paidProfiles[profileId][kind] = (paidProfiles[profileId][kind] || 0) + 1;
      if (!typeProfiles[profileId]) {
        typeProfiles[profileId] = { chat: 0, mail: 0, breakdown: Object.create(null) };
      }
      typeProfiles[profileId][kind] += val;
      const actionType = String(item?.action_type || item?.actionType || "").trim();
      const entry = getProfileHourEntry(profileId, key, hourStart);
      if (actionType) {
        typeBreakdownTotals[actionType] = (typeBreakdownTotals[actionType] || 0) + val;
        const profileBreakdown = typeProfiles[profileId].breakdown;
        profileBreakdown[actionType] = (profileBreakdown[actionType] || 0) + val;
        if (entry) {
          if (!entry.typeBreakdown || typeof entry.typeBreakdown !== "object") {
            entry.typeBreakdown = Object.create(null);
          }
          entry.typeBreakdown[actionType] =
            (entry.typeBreakdown[actionType] || 0) + val;
        }
        let hourBucket = hourlyBreakdownMap.get(key);
        if (!hourBucket) {
          hourBucket = {
            start: Number.isFinite(hourStart) ? hourStart : null,
            breakdown: Object.create(null),
          };
          hourlyBreakdownMap.set(key, hourBucket);
        } else if (!Number.isFinite(hourBucket.start) && Number.isFinite(hourStart)) {
          hourBucket.start = hourStart;
        }
        hourBucket.breakdown[actionType] =
          (hourBucket.breakdown[actionType] || 0) + val;
      }
      let profileHourlyPaid = paidProfileHourlyMap.get(profileId);
      if (!profileHourlyPaid) {
        profileHourlyPaid = new Map();
        paidProfileHourlyMap.set(profileId, profileHourlyPaid);
      }
      let paidEntry = profileHourlyPaid.get(key);
      if (!paidEntry) {
        paidEntry = {
          chat: 0,
          mail: 0,
          start: Number.isFinite(hourStart) ? hourStart : null,
        };
        profileHourlyPaid.set(key, paidEntry);
      } else if (!Number.isFinite(paidEntry.start) && Number.isFinite(hourStart)) {
        paidEntry.start = hourStart;
      }
      paidEntry[kind] = (paidEntry[kind] || 0) + 1;
      let globalPaidEntry = paidHourlyMap.get(key);
      if (!globalPaidEntry) {
        globalPaidEntry = {
          chat: 0,
          mail: 0,
          start: Number.isFinite(hourStart) ? hourStart : null,
        };
        paidHourlyMap.set(key, globalPaidEntry);
      } else if (!Number.isFinite(globalPaidEntry.start) && Number.isFinite(hourStart)) {
        globalPaidEntry.start = hourStart;
      }
      globalPaidEntry[kind] = (globalPaidEntry[kind] || 0) + 1;
      if (entry) {
        entry.earnings = (Number(entry.earnings) || 0) + val;
      }
    });
  }
  balanceHourlyHistory = map;
  balanceHourlyStartMap = startMap;
  profileTypeEarnings = Object.create(null);
  profileTypeBreakdown = Object.create(null);
  Object.entries(typeProfiles).forEach(([profileId, info]) => {
    if (!info) return;
    profileTypeEarnings[profileId] = {
      chat: Number(info.chat) || 0,
      mail: Number(info.mail) || 0,
    };
    const breakdown = info.breakdown;
    if (breakdown && typeof breakdown === "object") {
      const normalized = Object.create(null);
      Object.entries(breakdown).forEach(([typeKey, amount]) => {
        const num = Number(amount) || 0;
        if (!num) return;
        normalized[typeKey] = num;
      });
      if (Object.keys(normalized).length) {
        profileTypeBreakdown[profileId] = normalized;
      }
    }
  });
  totalTypeEarnings = {
    chat: Number(typeTotals.chat) || 0,
    mail: Number(typeTotals.mail) || 0,
  };
  totalTypeBreakdown = Object.create(null);
  Object.entries(typeBreakdownTotals).forEach(([typeKey, amount]) => {
    const num = Number(amount) || 0;
    if (!num) return;
    totalTypeBreakdown[typeKey] = num;
  });
  totalPaidActionCounts = {
    chat: Number(paidTotals.chat) || 0,
    mail: Number(paidTotals.mail) || 0,
  };
  profilePaidActionCounts = Object.create(null);
  Object.entries(paidProfiles).forEach(([profileId, counts]) => {
    if (!profileId || !counts) return;
    const chatCount = Number(counts.chat) || 0;
    const mailCount = Number(counts.mail) || 0;
    if (!chatCount && !mailCount) return;
    profilePaidActionCounts[profileId] = { chat: chatCount, mail: mailCount };
  });
  profileHourlyPaidActionCounts = paidProfileHourlyMap;
  globalHourlyPaidActionCounts = paidHourlyMap;
  globalHourlyTypeBreakdown = hourlyBreakdownMap;
  try {
    renderLogoWhiteSquareHistory();
    renderLogoWhiteSquareProfilesList();
  } catch {}
  persistLogoWhiteSquareBalanceCache();
}

function getBalanceHourlyAmount(startMs) {
  const key = getKyivHourKey(startMs);
  if (!key) return null;
  const serverVal = operatorHourlyBalanceMap.get(key);
  if (Number.isFinite(serverVal)) return serverVal;
  const val = balanceHourlyHistory.get(key);
  return Number.isFinite(val) ? val : null;
}

function getProfileSwitchInlineButton() {
  if (profileSwitchInlineButtonEl) return profileSwitchInlineButtonEl;
  injectProfileSwitchInlineStyles();
  const btn = document.createElement("button");
  btn.id = "profileSwitch";
  btn.type = "button";
  btn.className = "ot4et-profile-switch-inline-btn";
  btn.setAttribute("aria-label", "Переключатель профилей");
  btn.title = "Переключить профили";
  btn.addEventListener("click", onProfileSwitchClick);
  profileSwitchInlineButtonEl = btn;
  return profileSwitchInlineButtonEl;
}

function ensureProfileSwitchInlinePlacement() {
  profileSwitchPlacementPending = false;
  const container = findElementBySelectors(PROFILE_SWITCH_INLINE_CONTAINER_SELECTORS);
  if (!container) return false;
  const reference = findElementBySelectors(PROFILE_SWITCH_INLINE_TARGET_SELECTORS, container);
  const button = getProfileSwitchInlineButton();
  if (!button) return false;
  const parent = reference?.parentElement && container.contains(reference) ? reference.parentElement : container;
  if (reference) {
    if (reference.previousElementSibling !== button) {
      parent.insertBefore(button, reference);
    }
  } else if (button.parentElement !== parent) {
    parent.insertBefore(button, parent.firstChild || null);
  }
  if (ui) {
    ui.profileSwitch = button;
    updateProfileSwitchButtonState();
  }
  return true;
}

function scheduleProfileSwitchPlacement() {
  if (profileSwitchPlacementPending) return;
  profileSwitchPlacementPending = true;
  const raf =
    (typeof window !== "undefined" && window.requestAnimationFrame) ||
    ((cb) => setTimeout(cb, 0));
  raf(() => ensureProfileSwitchInlinePlacement());
}

function applyProfilesViewportLayout() {
  profilesViewportLayoutScheduled = false;
  try {
    const blocks = document.querySelectorAll(PROFILES_BLOCK_SELECTOR);
    if (!blocks?.length) return;
    const viewportHeight =
      Number(window.innerHeight) ||
      Number(document.documentElement?.clientHeight) ||
      0;
    if (!viewportHeight) return;
    blocks.forEach((block) => {
      if (!block) return;
      const list = block.querySelector(PROFILES_LIST_SELECTOR);
      if (!list) return;
      const resetStyles = () => {
        try {
          block.style.removeProperty("max-height");
          block.style.removeProperty("min-height");
          block.style.removeProperty("display");
          block.style.removeProperty("flex-direction");
          list.style.removeProperty("height");
          list.style.removeProperty("max-height");
          list.style.removeProperty("overflow-y");
          list.style.removeProperty("min-height");
        } catch {}
      };
      if (!isNodeVisible(block)) {
        resetStyles();
        return;
      }
      const rect = block.getBoundingClientRect();
      const top = Number(rect?.top) || 0;
      const bottomGap = 10;
      const available = Math.floor(viewportHeight - top - bottomGap);
      if (available < 120) {
        resetStyles();
        return;
      }
      const reservedHeight = (() => {
        try {
          let sum = 0;
          const children = Array.from(block.children || []);
          for (const child of children) {
            if (!child || child === list) continue;
            const childRect = child.getBoundingClientRect?.();
            const childHeight = Math.max(0, Number(childRect?.height) || 0);
            if (!childHeight) continue;
            sum += childHeight;
          }
          return sum;
        } catch {
          return 0;
        }
      })();
      const listMax = Math.max(120, Math.floor(available - reservedHeight - 8));
      block.style.maxHeight = `${available}px`;
      list.style.height = "auto";
      list.style.maxHeight = `${listMax}px`;
      list.style.overflowY = "auto";
      list.style.minHeight = "0";
    });
  } catch {}
}

function scheduleProfilesViewportLayout() {
  if (profilesViewportLayoutScheduled) return;
  profilesViewportLayoutScheduled = true;
  const raf =
    (typeof window !== "undefined" && window.requestAnimationFrame) ||
    ((cb) => setTimeout(cb, 0));
  raf(() => applyProfilesViewportLayout());
}

function startProfileSwitchMutationObserver() {
  if (profileSwitchPlacementObserver || !document.body) return false;
  profileSwitchPlacementObserver = new MutationObserver(() => {
    scheduleProfileSwitchPlacement();
    scheduleProfilesViewportLayout();
  });
  profileSwitchPlacementObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
  return true;
}

function initProfileSwitchInlineButton() {
  if (profileSwitchPlacementInitialized) {
    scheduleProfileSwitchPlacement();
    return;
  }
  profileSwitchPlacementInitialized = true;
  scheduleProfileSwitchPlacement();
  scheduleProfilesViewportLayout();
  try {
    if (!startProfileSwitchMutationObserver()) {
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          startProfileSwitchMutationObserver();
          scheduleProfileSwitchPlacement();
          scheduleProfilesViewportLayout();
        },
        { once: true }
      );
    }
  } catch {}
  try {
    window.addEventListener("resize", scheduleProfilesViewportLayout, {
      passive: true,
    });
    window.addEventListener("scroll", scheduleProfilesViewportLayout, {
      passive: true,
    });
  } catch {}
}

const CONNECT_COUNTRY_CONTENT_SELECTOR = '[class*="Connect_country_content__"]';
const CONNECT_CHOOSE_MAN_ITEM_SELECTOR = '[class*="Connect_choose_man_item__"]';
const CONNECT_BUTTONS_SELECTOR = '[class*="Connect_buttons__"]';
const CONNECT_PERSONAL_LONG_NAME_SELECTOR = '[class*="Personal_personal_long_name__"]';
const CONNECT_MAN_ACTIONS_CONTAINER_CLASS = "ot4et-connect-man-actions-container";
const CONNECT_MAN_INFO_BUTTON_CLASS = "ot4et-connect-man-info-btn";
const CONNECT_MAN_INFO_CONTAINER_CLASS = "ot4et-connect-man-info-container";
const CONNECT_MAN_TG_BUTTON_CLASS = "ot4et-connect-man-tg-btn";
const CONNECT_MAN_TG_CONTAINER_CLASS = "ot4et-connect-man-tg-container";
const CONNECT_MAN_SPEND_BUTTON_CLASS = "ot4et-connect-man-spend-btn";
const CONNECT_MAN_SPEND_CONTAINER_CLASS = "ot4et-connect-man-spend-container";
const CONNECT_PERSONAL_INVITES_LIST_ENDPOINT =
  "https://alpha.date/api/personal-invites/personal-invites-list";
const CONNECT_MY_PROFILE_ENDPOINT = "https://alpha.date/api/operator/myProfile";
const CHAT_SPEND_TOTAL_BY_MALE_ENDPOINT = "/chat/spend/total-by-male";
const CONNECT_INVITES_CACHE_TTL_MS = 45 * 1000;
const CONNECT_PROFILE_CACHE_TTL_MS = 4 * 60 * 1000;
const CONNECT_TG_COUNT_CACHE_TTL_MS = 60 * 1000;
const CONNECT_MAN_SPEND_TOTAL_CACHE_TTL_MS = 60 * 1000;
let connectInvitesCache = { expiresAt: 0, data: null };
let connectInvitesInFlight = null;
const connectProfileCache = new Map();
const connectProfileInFlight = new Map();
const connectTgCountCache = new Map();
const connectTgCountInFlight = new Map();
const connectManSpendTotalCache = new Map();
const connectManSpendTotalInFlight = new Map();

function extractConnectInvitesList(payload) {
  if (Array.isArray(payload?.newList)) return payload.newList;
  if (Array.isArray(payload?.list)) return payload.list;
  return [];
}

function isValidConnectProfilePayload(payload) {
  if (!payload || typeof payload !== "object") return false;
  const userInfo = payload?.user_info;
  if (!userInfo || typeof userInfo !== "object") return false;
  const detail = userInfo?.user_detail;
  const reference = userInfo?.user_reference;
  if (detail && typeof detail === "object") {
    const hasAnyDetail =
      String(detail?.external_id || "").trim() ||
      String(detail?.name || "").trim() ||
      Number.isFinite(Number(detail?.age));
    if (hasAnyDetail) return true;
  }
  if (reference && typeof reference === "object") {
    const hasAnyReference =
      String(reference?.summary || "").trim() ||
      String(reference?.looking || "").trim() ||
      String(reference?.city_name || "").trim();
    if (hasAnyReference) return true;
  }
  return false;
}

function parseConnectCardNameAge(itemEl) {
  if (!itemEl) throw new Error("Карточка не найдена");
  const nameNode = itemEl.querySelector(CONNECT_PERSONAL_LONG_NAME_SELECTOR);
  if (!nameNode) throw new Error("Не удалось определить имя/возраст");
  const parsed = parseNameAge(String(nameNode.textContent || "").trim());
  const name = String(parsed?.name || "").trim();
  const age = Number(parsed?.age);
  if (!name || !Number.isFinite(age) || age <= 0) {
    throw new Error("Не удалось определить имя/возраст");
  }
  return { name, age };
}

async function getAuthTokenForConnectInfo() {
  let token = "";
  try {
    const module = await loadUserInfoModule();
    token = String(module?.getAuthToken?.() || "").trim();
  } catch {}
  if (!token) {
    try {
      token = String(window?.localStorage?.getItem?.("token") || "").trim();
    } catch {}
  }
  return token;
}

function getCurrentOperatorIdForConnectInfo(token) {
  const fromState = toNumber(operatorInfoState?.operatorId);
  if (Number.isFinite(fromState)) return fromState;
  const payload = decodeJwt(token);
  const fromToken = toNumber(payload?.operator_id) || toNumber(payload?.id);
  if (Number.isFinite(fromToken)) return fromToken;
  return null;
}

async function fetchPersonalInvitesList(token) {
  const now = Date.now();
  if (connectInvitesCache.data && connectInvitesCache.expiresAt > now) {
    return connectInvitesCache.data;
  }
  if (connectInvitesInFlight) return connectInvitesInFlight;
  connectInvitesInFlight = (async () => {
    const requestOnce = async () =>
      await profileSwitchRequest({
        url: CONNECT_PERSONAL_INVITES_LIST_ENDPOINT,
        token,
      });
    let data = await requestOnce();
    let list = extractConnectInvitesList(data);
    // API иногда отдаёт временно пустой список; делаем повтор.
    if (!list.length) {
      await new Promise((resolve) => setTimeout(resolve, 250));
      data = await requestOnce();
      list = extractConnectInvitesList(data);
    }
    if (list.length) {
      connectInvitesCache = {
        expiresAt: Date.now() + CONNECT_INVITES_CACHE_TTL_MS,
        data: data || {},
      };
      return connectInvitesCache.data;
    }
    connectInvitesCache = { expiresAt: 0, data: null };
    return data || {};
  })();
  try {
    return await connectInvitesInFlight;
  } finally {
    connectInvitesInFlight = null;
  }
}

function findInviteMatch({ invitesPayload, operatorId, name, age }) {
  const list = extractConnectInvitesList(invitesPayload);
  if (!list.length) throw new Error("Список инвайтов пуст");
  const targetName = String(name || "").trim().toLowerCase();
  const targetAge = Number(age);
  const candidates = list.filter((invite) => {
    const inviteOperatorId =
      toNumber(invite?.operator_id) || toNumber(invite?.operatorId);
    if (!Number.isFinite(inviteOperatorId) || inviteOperatorId !== operatorId) {
      return false;
    }
    const aliasName = String(invite?.userProfileAlias?.name || "")
      .trim()
      .toLowerCase();
    const aliasAge = Number(invite?.userProfileAlias?.age);
    return aliasName === targetName && aliasAge === targetAge;
  });
  if (!candidates.length) throw new Error("Совпадение не найдено");
  candidates.sort((a, b) => {
    const timeA = new Date(a?.created_at || 0).getTime() || 0;
    const timeB = new Date(b?.created_at || 0).getTime() || 0;
    if (timeA !== timeB) return timeB - timeA;
    const idA = toNumber(a?.id) || 0;
    const idB = toNumber(b?.id) || 0;
    return idB - idA;
  });
  return candidates[0] || null;
}

async function fetchMyProfileByUserId({ token, userId }) {
  const key = String(userId || "").trim();
  if (!key) throw new Error("Не найден man_external_id");
  const cached = connectProfileCache.get(key);
  const now = Date.now();
  if (cached && cached.expiresAt > now && isValidConnectProfilePayload(cached.data)) {
    return cached.data;
  }
  if (connectProfileInFlight.has(key)) {
    return connectProfileInFlight.get(key);
  }
  const requestPromise = (async () => {
    const requestOnce = async () => {
      const url = new URL(CONNECT_MY_PROFILE_ENDPOINT);
      url.searchParams.set("user_id", key);
      url.searchParams.set("activeProfile", "false");
      return await profileSwitchRequest({
        url: url.toString(),
        token,
      });
    };
    let data = await requestOnce();
    if (!isValidConnectProfilePayload(data)) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      data = await requestOnce();
    }
    if (isValidConnectProfilePayload(data)) {
      connectProfileCache.set(key, {
        expiresAt: Date.now() + CONNECT_PROFILE_CACHE_TTL_MS,
        data,
      });
      return data;
    }
    if (cached && isValidConnectProfilePayload(cached.data)) {
      return cached.data;
    }
    throw new Error("Не удалось получить данные профиля");
  })();
  connectProfileInFlight.set(key, requestPromise);
  try {
    return await requestPromise;
  } finally {
    connectProfileInFlight.delete(key);
  }
}

async function resolveConnectManExternalId({ itemEl, token = "", operatorId = null }) {
  const parsed = parseConnectCardNameAge(itemEl);
  const effectiveToken = String(token || "").trim() || (await getAuthTokenForConnectInfo());
  if (!effectiveToken) throw new Error("Токен не найден");
  const effectiveOperatorId = Number.isFinite(operatorId)
    ? operatorId
    : getCurrentOperatorIdForConnectInfo(effectiveToken);
  if (!Number.isFinite(effectiveOperatorId)) throw new Error("Не найден operator_id");
  const invitesPayload = await fetchPersonalInvitesList(effectiveToken);
  const inviteMatch = findInviteMatch({
    invitesPayload,
    operatorId: effectiveOperatorId,
    name: parsed.name,
    age: parsed.age,
  });
  const manExternalId = String(
    inviteMatch?.man_external_id || inviteMatch?.manExternalId || ""
  ).trim();
  if (!manExternalId) throw new Error("Не найден man_external_id");
  return {
    parsed,
    token: effectiveToken,
    operatorId: effectiveOperatorId,
    manExternalId,
  };
}

function setConnectTgButtonState(button, state, count = null, message = "") {
  if (!button) return;
  const mode = String(state || "idle").trim();
  if (mode === "loading") {
    button.textContent = "🤖…";
    button.disabled = true;
    button.style.opacity = "0.6";
    button.setAttribute("aria-busy", "true");
    button.title = "Проверка отчётов в Telegram...";
    return;
  }
  button.disabled = false;
  button.style.opacity = "";
  button.removeAttribute("aria-busy");
  if (mode === "success") {
    button.textContent = `🤖 ${Number.isFinite(count) ? count : "—"}`;
    button.title = Number.isFinite(count)
      ? `Отчётов в Telegram: ${count}`
      : "Отчёты в Telegram: —";
    return;
  }
  if (mode === "error") {
    button.textContent = "🤖 !";
    button.title = String(message || "Не удалось получить TG отчёты");
    return;
  }
  button.textContent = "🤖";
  button.title = "Проверить отчёты в Telegram";
}

function setConnectManSpendButtonState(button, state, total = null, message = "") {
  if (!button) return;
  const mode = String(state || "idle").trim();
  if (mode === "loading") {
    button.textContent = "💰 …";
    button.disabled = true;
    button.style.opacity = "0.6";
    button.setAttribute("aria-busy", "true");
    button.title = "Считаю сумму кредитов...";
    return;
  }
  button.disabled = false;
  button.style.opacity = "";
  button.removeAttribute("aria-busy");
  if (mode === "success") {
    const rounded = Number.isFinite(Number(total)) ? Math.round(Number(total)) : 0;
    button.textContent = `💰 ${rounded}`;
    button.title = `Сумма кредитов мужчины: ${rounded}`;
    return;
  }
  if (mode === "error") {
    button.textContent = "💰 !";
    button.title = String(message || "Не удалось получить сумму");
    return;
  }
  button.textContent = "💰 —";
  button.title = "Сумма кредитов мужчины (все женщины)";
}

async function fetchChatSpendTotalByMaleId(maleId) {
  const normalizedMaleId = String(maleId || "").trim();
  if (!/^\d{10}$/.test(normalizedMaleId)) return null;
  const base = await getProfileStatsApiBase();
  if (!base) return null;
  const store = await getStore(["apiKey"]).catch(() => ({}));
  const effectiveKey =
    (store?.apiKey && String(store.apiKey).trim()) || DEFAULT_API_KEY;
  const headers = { Accept: "application/json, text/plain, */*" };
  if (effectiveKey) {
    headers.Authorization = `Bearer ${effectiveKey}`;
  }
  const url = `${base}${CHAT_SPEND_TOTAL_BY_MALE_ENDPOINT}?male_id=${encodeURIComponent(
    normalizedMaleId
  )}`;
  const res = await fetch(url, { method: "GET", headers });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  if (!data || data.ok !== true) return null;
  const total = Number(data.total_spend_all_credits);
  if (!Number.isFinite(total) || total < 0) return null;
  return total;
}

async function resolveConnectManSpendTotalByMaleId(maleId) {
  const normalizedMaleId = String(maleId || "").trim();
  if (!/^\d{10}$/.test(normalizedMaleId)) return null;
  const now = Date.now();
  const cached = connectManSpendTotalCache.get(normalizedMaleId);
  if (cached && Number(cached.expiresAt) > now) {
    return Number.isFinite(Number(cached.total)) ? Number(cached.total) : null;
  }
  if (connectManSpendTotalInFlight.has(normalizedMaleId)) {
    return connectManSpendTotalInFlight.get(normalizedMaleId);
  }
  const promise = (async () => {
    const total = await fetchChatSpendTotalByMaleId(normalizedMaleId);
    if (Number.isFinite(Number(total)) && Number(total) >= 0) {
      connectManSpendTotalCache.set(normalizedMaleId, {
        total: Number(total),
        expiresAt: Date.now() + CONNECT_MAN_SPEND_TOTAL_CACHE_TTL_MS,
      });
      return Number(total);
    }
    return null;
  })();
  connectManSpendTotalInFlight.set(normalizedMaleId, promise);
  try {
    return await promise;
  } finally {
    connectManSpendTotalInFlight.delete(normalizedMaleId);
  }
}

async function fetchTgReportsCountByMaleId(maleId) {
  const normalizedMaleId = String(maleId || "").trim();
  if (!normalizedMaleId) return null;
  const now = Date.now();
  const cached = connectTgCountCache.get(normalizedMaleId);
  if (cached && cached.expiresAt > now) {
    return Number.isFinite(cached.count) ? cached.count : null;
  }
  if (connectTgCountInFlight.has(normalizedMaleId)) {
    return connectTgCountInFlight.get(normalizedMaleId);
  }
  const promise = (async () => {
    const count = await fetchLegacyReportsCountByMaleId(normalizedMaleId);
    if (Number.isFinite(count)) {
      connectTgCountCache.set(normalizedMaleId, {
        count,
        expiresAt: Date.now() + CONNECT_TG_COUNT_CACHE_TTL_MS,
      });
      return count;
    }
    return null;
  })();
  connectTgCountInFlight.set(normalizedMaleId, promise);
  try {
    return await promise;
  } finally {
    connectTgCountInFlight.delete(normalizedMaleId);
  }
}

function formatConnectLastOnline(value) {
  const ts = Number(value);
  if (!Number.isFinite(ts) || ts <= 0) return "";
  const ms = ts < 1e12 ? ts * 1000 : ts;
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ru-RU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function openConnectInfoPopover(button, title) {
  const popover = createProfileInfoPopover("man");
  const titleNode = popover.querySelector(".ot4et-profile-popover-title");
  if (titleNode) {
    titleNode.textContent = String(title || "").trim() || "Информация о мужчине";
  }
  document.body.appendChild(popover);
  positionProfileInfoPopover(popover, button);
  currentProfilePopover = popover;
  currentProfilePopoverButton = button;
  button.classList.add("active");
  currentProfilePopoverPositionHandler = updateProfileInfoPopoverPosition;
  window.addEventListener("resize", currentProfilePopoverPositionHandler, {
    passive: true,
  });
  window.addEventListener("scroll", currentProfilePopoverPositionHandler, {
    passive: true,
  });
  setTimeout(() => {
    document.addEventListener("click", handleOutsideClick);
    document.addEventListener("keydown", handleEscapeKey);
  }, 0);
  return popover;
}

function renderConnectInfoPopoverError(popover, message) {
  const content = popover?.querySelector(".ot4et-profile-popover-content");
  if (!content) return;
  content.innerHTML = `<div class="ot4et-profile-popover-error">${escapeHtml(
    String(message || "Ошибка загрузки")
  )}</div>`;
}

function renderConnectInfoPopover({
  popover,
  cardName,
  cardAge,
  manExternalId,
  profileData,
}) {
  const content = popover?.querySelector(".ot4et-profile-popover-content");
  if (!content) return;
  const userInfo = profileData?.user_info || {};
  const detail = userInfo?.user_detail || {};
  const reference = userInfo?.user_reference || {};
  const shortFields = [
    ["ID", manExternalId],
    ["Имя", detail?.name || cardName],
    ["Возраст", detail?.age || cardAge],
    ["Страна", detail?.country_name],
    ["Город", reference?.city_name],
    ["Онлайн", Number(detail?.online) === 1 ? "Да" : Number(detail?.online) === 0 ? "Нет" : ""],
    ["Был онлайн", formatConnectLastOnline(detail?.last_online)],
    ["Знак зодиака", reference?.zodiac],
    ["Семейное положение", reference?.marital],
    ["Дети", reference?.children],
  ].filter((entry) => String(entry[1] ?? "").trim());
  const summary = String(reference?.summary || "").trim();
  const looking = String(reference?.looking || "").trim();
  let html = "";
  if (shortFields.length) {
    html += `
      <div class="ot4et-profile-popover-section">
        <div class="ot4et-profile-popover-label">Кратко</div>
        <div class="ot4et-profile-popover-text">${shortFields
          .map(
            ([label, value]) =>
              `<div><strong>${escapeHtml(label)}:</strong> ${escapeHtml(String(value))}</div>`
          )
          .join("")}</div>
      </div>
    `;
  }
  if (summary) {
    html += `
      <div class="ot4et-profile-popover-section">
        <div class="ot4et-profile-popover-label">Обо мне</div>
        <div class="ot4et-profile-popover-text">${escapeHtml(summary)}</div>
      </div>
    `;
  }
  if (looking) {
    html += `
      <div class="ot4et-profile-popover-section">
        <div class="ot4et-profile-popover-label">Ищу</div>
        <div class="ot4et-profile-popover-text">${escapeHtml(looking)}</div>
      </div>
    `;
  }
  if (!html) {
    html = '<div class="ot4et-profile-popover-empty">Нет информации</div>';
  }
  content.innerHTML = html;
}

async function handleConnectInfoButtonClick(event) {
  event.preventDefault();
  event.stopPropagation();
  const button = event.currentTarget;
  if (!button) return;
  if (currentProfilePopoverButton === button && currentProfilePopover) {
    closeProfileInfoPopover();
    return;
  }
  const item = button.closest(CONNECT_CHOOSE_MAN_ITEM_SELECTOR);
  let resolved = null;
  try {
    resolved = await resolveConnectManExternalId({ itemEl: item });
  } catch (err) {
    closeProfileInfoPopover();
    const fallbackPopover = openConnectInfoPopover(button, "Информация о мужчине");
    renderConnectInfoPopoverError(
      fallbackPopover,
      err?.message || "Не удалось определить имя/возраст"
    );
    return;
  }
  closeProfileInfoPopover();
  const popover = openConnectInfoPopover(
    button,
    `${resolved.parsed.name} ${resolved.parsed.age}`
  );
  button.disabled = true;
  button.style.opacity = "0.6";
  button.setAttribute("aria-busy", "true");
  try {
    const profileData = await fetchMyProfileByUserId({
      token: resolved.token,
      userId: resolved.manExternalId,
    });
    if (currentProfilePopover !== popover || currentProfilePopoverButton !== button) return;
    renderConnectInfoPopover({
      popover,
      cardName: resolved.parsed.name,
      cardAge: resolved.parsed.age,
      manExternalId: resolved.manExternalId,
      profileData,
    });
  } catch (err) {
    if (currentProfilePopover !== popover || currentProfilePopoverButton !== button) return;
    const rawMessage = String(err?.message || "").trim();
    const message = /^HTTP\s+(\d+)/i.test(rawMessage)
      ? `Ошибка ${rawMessage.match(/^HTTP\s+(\d+)/i)?.[1] || ""}`.trim()
      : rawMessage || "Сервер недоступен";
    renderConnectInfoPopoverError(popover, message);
  } finally {
    button.disabled = false;
    button.style.opacity = "";
    button.removeAttribute("aria-busy");
  }
}

async function handleConnectTgButtonClick(event) {
  event.preventDefault();
  event.stopPropagation();
  const button = event.currentTarget;
  if (!button || button.disabled) return;
  const item = button.closest(CONNECT_CHOOSE_MAN_ITEM_SELECTOR);
  setConnectTgButtonState(button, "loading");
  try {
    const resolved = await resolveConnectManExternalId({ itemEl: item });
    const count = await fetchTgReportsCountByMaleId(resolved.manExternalId);
    if (!Number.isFinite(count)) {
      setConnectTgButtonState(button, "error", null, "Не удалось получить TG отчёты");
      return;
    }
    setConnectTgButtonState(button, "success", count);
  } catch (err) {
    setConnectTgButtonState(
      button,
      "error",
      null,
      String(err?.message || "Не удалось получить TG отчёты")
    );
  }
}

async function handleConnectManSpendButtonClick(event) {
  event.preventDefault();
  event.stopPropagation();
  const button = event.currentTarget;
  if (!button || button.disabled) return;
  const item = button.closest(CONNECT_CHOOSE_MAN_ITEM_SELECTOR);
  setConnectManSpendButtonState(button, "loading");
  try {
    const resolved = await resolveConnectManExternalId({ itemEl: item });
    const total = await resolveConnectManSpendTotalByMaleId(resolved.manExternalId);
    if (!Number.isFinite(Number(total))) {
      setConnectManSpendButtonState(
        button,
        "error",
        null,
        "Не удалось получить сумму"
      );
      return;
    }
    setConnectManSpendButtonState(button, "success", Number(total));
  } catch (err) {
    setConnectManSpendButtonState(
      button,
      "error",
      null,
      String(err?.message || "Не удалось получить сумму")
    );
  }
}

function createConnectManInfoButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = CONNECT_MAN_INFO_BUTTON_CLASS;
  button.textContent = "ℹ️";
  button.title = "Информация";
  button.setAttribute("aria-label", "Информация");
  button.style.width = "28px";
  button.style.height = "28px";
  button.style.padding = "0";
  button.style.margin = "0";
  button.style.border = "1px solid rgba(31,79,116,0.28)";
  button.style.borderRadius = "50%";
  button.style.background = "rgba(255,255,255,0.96)";
  button.style.cursor = "pointer";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.fontSize = "14px";
  button.style.lineHeight = "1";
  button.addEventListener("click", handleConnectInfoButtonClick);
  return button;
}

function createConnectManTgButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = CONNECT_MAN_TG_BUTTON_CLASS;
  button.style.height = "28px";
  button.style.minWidth = "56px";
  button.style.padding = "0 8px";
  button.style.margin = "0";
  button.style.border = "1px solid rgba(31,79,116,0.28)";
  button.style.borderRadius = "14px";
  button.style.background = "rgba(255,255,255,0.96)";
  button.style.cursor = "pointer";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.fontSize = "12px";
  button.style.fontWeight = "700";
  button.style.lineHeight = "1";
  button.style.color = "#1f4f74";
  setConnectTgButtonState(button, "idle");
  button.addEventListener("click", handleConnectTgButtonClick);
  return button;
}

function createConnectManSpendButton() {
  const button = document.createElement("button");
  button.type = "button";
  button.className = CONNECT_MAN_SPEND_BUTTON_CLASS;
  button.style.height = "28px";
  button.style.minWidth = "68px";
  button.style.padding = "0 8px";
  button.style.margin = "0";
  button.style.border = "1px solid rgba(31,79,116,0.28)";
  button.style.borderRadius = "14px";
  button.style.background = "rgba(255,255,255,0.96)";
  button.style.cursor = "pointer";
  button.style.display = "inline-flex";
  button.style.alignItems = "center";
  button.style.justifyContent = "center";
  button.style.fontSize = "12px";
  button.style.fontWeight = "700";
  button.style.lineHeight = "1";
  button.style.color = "#1f4f74";
  setConnectManSpendButtonState(button, "idle");
  button.setAttribute("aria-label", "Сумма кредитов мужчины (все женщины)");
  button.addEventListener("click", handleConnectManSpendButtonClick);
  return button;
}

function ensureConnectManInfoButtons() {
  try {
    const containers = document.querySelectorAll(CONNECT_COUNTRY_CONTENT_SELECTOR);
    if (!containers?.length) return;
    containers.forEach((container) => {
      const items = container.querySelectorAll(CONNECT_CHOOSE_MAN_ITEM_SELECTOR);
      items.forEach((item) => {
        if (!item || item.querySelector(`.${CONNECT_MAN_ACTIONS_CONTAINER_CLASS}`)) return;
        const buttonsWrap = item.querySelector(CONNECT_BUTTONS_SELECTOR);
        if (!buttonsWrap || !buttonsWrap.parentElement) return;
        const actionsWrap = document.createElement("div");
        actionsWrap.className = CONNECT_MAN_ACTIONS_CONTAINER_CLASS;
        actionsWrap.style.display = "inline-flex";
        actionsWrap.style.alignItems = "center";
        actionsWrap.style.gap = "6px";
        actionsWrap.style.marginRight = "8px";
        const spendWrap = document.createElement("div");
        spendWrap.className = CONNECT_MAN_SPEND_CONTAINER_CLASS;
        spendWrap.style.display = "inline-flex";
        spendWrap.style.alignItems = "center";
        spendWrap.style.justifyContent = "center";
        spendWrap.appendChild(createConnectManSpendButton());
        const tgWrap = document.createElement("div");
        tgWrap.className = CONNECT_MAN_TG_CONTAINER_CLASS;
        tgWrap.style.display = "inline-flex";
        tgWrap.style.alignItems = "center";
        tgWrap.style.justifyContent = "center";
        tgWrap.appendChild(createConnectManTgButton());
        const infoWrap = document.createElement("div");
        infoWrap.className = CONNECT_MAN_INFO_CONTAINER_CLASS;
        infoWrap.style.display = "inline-flex";
        infoWrap.style.alignItems = "center";
        infoWrap.style.justifyContent = "center";
        infoWrap.appendChild(createConnectManInfoButton());
        actionsWrap.appendChild(spendWrap);
        actionsWrap.appendChild(tgWrap);
        actionsWrap.appendChild(infoWrap);
        buttonsWrap.parentElement.insertBefore(actionsWrap, buttonsWrap);
      });
    });
  } catch {}
}

function injectLogoWhiteSquareStyles() {
  try {
    if (document.getElementById(LOGO_WHITE_SQUARE_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = LOGO_WHITE_SQUARE_STYLE_ID;
    style.textContent = `
      .${LOGO_WHITE_SQUARE_HOST_CLASS}{position:relative!important;overflow:visible!important;z-index:2147483643;}
      .${LOGO_WHITE_SQUARE_HOST_CLASS}.${LOGO_WHITE_SQUARE_MODAL_CLASS}{z-index:10!important;}
      .${LOGO_WHITE_SQUARE_CLASS}{
        font-size:14px;
        background:#fff;
        border-radius:3px;
        box-shadow:0 3px 3px rgba(0,0,0,0.05);
        display:flex;
        align-items:center;
        justify-content:center;
        position:absolute;
        top:10px;
        right:0;
        bottom:10px;
        left:0;
        pointer-events:auto;
        cursor:pointer;
        z-index:2147483643;
        transition:transform .12s ease, box-shadow .12s ease;
      }
      .${LOGO_WHITE_SQUARE_CLASS}.expanded{
        width:241px;
        left:0;
        right:auto;
      }
      .${LOGO_WHITE_SQUARE_HOST_CLASS}.${LOGO_WHITE_SQUARE_MODAL_CLASS} .${LOGO_WHITE_SQUARE_CLASS}{z-index:11;}
      .${LOGO_WHITE_SQUARE_CLASS}:hover{box-shadow:0 6px 18px rgba(18,57,99,0.16);}
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter{
        width:100%;
        height:100%;
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        gap:6px;
        text-align:center;
        color:#1f4f74;
        padding:10px;
        box-sizing:border-box
      }
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-arrow{position:absolute;right:5px;bottom:5px;width:18px;height:18px;background:url("${ICONS.arrow}") no-repeat center/contain;transition:transform .2s ease;}
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-arrow.rotated{transform:rotate(180deg);}
      .${LOGO_WHITE_SQUARE_CLASS}.expanded .logo-counter-arrow{transform:rotate(180deg);}
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-caption{font-size:11px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.6;margin-bottom:4px;}
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-icon{
        width:32px;
        height:32px;
        background:url("${ICONS.stopwatch}") no-repeat center/contain;
      }
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-total-row{
        display:flex;
        align-items:center;
        gap:8px;
      }
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-title{font-size:16px;letter-spacing:0.15em}
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-total{font-size:20px;font-weight:700;line-height:1}
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-hour{display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;color:#0f2d4a}
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-hour-icon{
        width:32px;
        height:32px;
        background:url("${ICONS.hourStopwatch}") no-repeat center/contain;
        flex-shrink:0;
      }
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-hour-value{font-size:20px;line-height:1}
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-details{display:flex;gap:12px;font-size:12px;flex-wrap:wrap;justify-content:center;width:100%}
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-details-hourly{margin-top:2px}
      .logo-counter.operator-wait .logo-counter-total-row{justify-content:center}
      .logo-counter.operator-wait .logo-counter-caption,
      .logo-counter.operator-wait .logo-counter-arrow,
      .logo-counter.operator-wait .logo-counter-bot,
      .logo-counter.operator-wait .logo-counter-icon,
      .logo-counter.operator-wait .logo-counter-hour{display:none}
      .logo-counter.operator-wait .logo-counter-total{
        font-size:16px;
        line-height:1.25;
        text-align:center;
      }
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-bot{
        position:absolute;
        left:5px;
        bottom:5px;
        width:24px;
        height:24px;
        border:none;
        background:transparent;
        cursor:pointer;
        padding:0;
      }
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-bot::before{
        content:"";
        display:block;
        width:18px;
        height:18px;
        background:url("${ICONS.openBot}") no-repeat center/contain;
        animation:ot4et-bot-cycle 12s ease-in-out infinite;
        transform-origin:center;
      }
      @keyframes ot4et-bot-cycle{
        0%{transform:translateY(0) rotate(0deg)}
        12%{transform:translateY(0) rotate(360deg)}
        20%{transform:translateY(0) rotate(0deg)}
        28%{transform:translateY(-6px) rotate(0deg)}
        36%{transform:translateY(0) rotate(0deg)}
        42%{transform:translateY(-4px) rotate(0deg)}
        48%{transform:translateY(0) rotate(0deg)}
        52%{transform:translateY(-2px) rotate(0deg)}
        56%{transform:translateY(0) rotate(0deg)}
        100%{transform:translateY(0) rotate(0deg)}
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS}{
        position:absolute;
        top:calc(100% - 1px);
        right:0;
        width:100%;
        min-width:0;
        background:#fff;
        border-radius:0 0 3px 3px;
        padding:16px 18px 20px;
        box-shadow:0 16px 32px rgba(17,45,78,0.25);
        font-size:14px;
        color:#1f4f74;
        display:none;
        flex-direction:column;
        gap:14px;
        z-index:2147483644;
      }
      .${LOGO_WHITE_SQUARE_HOST_CLASS}.${LOGO_WHITE_SQUARE_MODAL_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS}{z-index:12;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS}.open{display:flex;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-section{display:flex;flex-direction:column;gap:8px;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-section-inline{
        flex-direction:row;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        background:#fff;
        padding:16px;
        border-radius:8px;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-section-inline .menu-title{margin:0;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-section-profiles{
        background:#fff;
        border-radius:8px;
        padding:16px;
        flex:1 1 auto;
        display:flex;
        flex-direction:column;
        min-height:0;
        overflow:hidden;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-profiles-refresh-btn{
        padding:8px 16px;
        border-radius:6px;
        border:1px solid rgba(31,79,116,0.2);
        background:#f4f7fb;
        color:#0f2d4a;
        font-weight:600;
        font-size:14px;
        cursor:pointer;
        transition:background .15s ease,border-color .15s ease,opacity .15s ease;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-profiles-refresh-btn{
        display:none!important;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-profiles-refresh-btn:hover:not([disabled]){
        background:#e8eff7;
        border-color:rgba(31,79,116,0.35);
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-profiles-refresh-btn:disabled{
        opacity:0.6;
        cursor:not-allowed;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-profiles-list-wrap{
        margin-top:12px;
        flex:1 1 auto;
        min-height:0;
        height:100%;
        overflow:auto;
        display:flex;
        flex-direction:column;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-history.menu-profiles-list{
        margin-top:0;
        display:flex;
        flex-direction:column;
        gap:6px;
        width:100%;
        flex:0 0 auto;
        min-height:0;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-profiles-item{justify-content:space-between;align-items:center;gap:10px;cursor:pointer;transition:background .15s ease,border-color .15s ease;width:100%;flex:0 0 auto;border:1px solid rgba(31,79,116,0.14);}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-history-item.menu-profiles-item{background:#eaf0f7;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-history-item.menu-profiles-item{
        height:auto;
        min-height:0;
        align-items:stretch;
        flex-wrap:wrap;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-profile-operator-stats{
        display:flex;
        flex-direction:column;
        gap:6px;
        align-items:flex-end;
        width:100%;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-profile-operator-block{
        display:flex;
        flex-direction:column;
        gap:4px;
        padding:6px 8px;
        border:1px solid rgba(31,79,116,0.1);
        border-radius:4px;
        background:#f9fbff;
        width:100%;
        box-sizing:border-box;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-profile-operator-id{
        font-size:11px;
        letter-spacing:0.06em;
        text-transform:uppercase;
        color:#6a7f91;
        font-weight:700;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-profile-operator-metrics{
        display:flex;
        gap:10px;
        flex-wrap:wrap;
        font-size:12px;
        font-weight:600;
        color:#163656;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-profile-name{font-weight:600;margin-right:8px;white-space:nowrap;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-balance-summary{
        width:100%;
        padding-bottom:10px;
        margin:0 0 14px;
        background:#fff;
        border-radius:8px;
        padding:16px;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-balance-summary-label{
        font-size:12px;
        letter-spacing:0.08em;
        text-transform:uppercase;
        color:#6a7f91;
        font-weight:700;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-balance-summary-amount{
        font-size:32px;
        line-height:1.1;
        font-weight:700;
        color:#e55252;
        margin-bottom:8px;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-balance-summary-total{
        font-size:32px;
        line-height:1.1;
        font-weight:700;
        color:#173a5c;
        margin:0;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-balance-summary-total-row{
        display:flex;
        align-items:center;
        gap:18px;
        width:100%;
        min-width:0;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-balance-summary-total-row .menu-balance-summary-total{
        flex:0 0 auto;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-balance-summary-total-row .menu-balance-summary-details{
        flex:1 1 auto;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-balance-summary-details{
        display:inline-flex;
        align-items:center;
        margin-top:0;
        gap:16px;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-balance-summary-details .menu-info-row{
        display:inline-flex;
        align-items:center;
        font-size:14px;
        font-weight:600;
        gap:8px;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-operator-info{
        width:100%;
        background:#fff;
        border-radius:8px;
        padding:14px 16px;
        margin:0 0 12px;
        box-shadow:0 1px 0 rgba(15,45,74,0.05);
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-operator-name-row{
        align-items:center;
        gap:10px;
        margin:6px 0 8px;
        width:100%;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-operator-name-control{
        display:flex;
        align-items:center;
        gap:8px;
        flex:1 1 auto;
        min-width:0;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-operator-name-input{
        flex:1 1 auto;
        min-width:0;
        padding:6px 8px;
        border:1px solid #d1d5e5;
        border-radius:6px;
        font-size:12px;
        font-weight:600;
        color:#0f2d4a;
        background:#fff;
        white-space:nowrap;
        overflow:auto;
        text-overflow:clip;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-operator-name-save{
        flex:0 0 auto;
        padding:6px 10px;
        border-radius:6px;
        border:none;
        background:#0f2d4a;
        color:#fff;
        font-size:11px;
        font-weight:700;
        cursor:pointer;
        display:inline-flex;
        align-items:center;
        justify-content:center;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-operator-name-save-icon::before{
        content:"";
        width:16px;
        height:16px;
        display:block;
        background:url("${ICONS.save}") no-repeat center/contain;
        filter:brightness(0) invert(1);
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-operator-name-save:disabled{
        opacity:0.5;
        cursor:default;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-operator-name-save.saved{
        background:#1f7a3d;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-operator-info .menu-info-row{
        width:100%;
        justify-content:space-between;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-title{font-size:12px;letter-spacing:0.08em;text-transform:uppercase;opacity:0.8;font-weight:700;color:#0f2d4a;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-info-list{display:flex;gap:16px;flex-wrap:wrap;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-info-list.menu-balance-summary-details{
        flex-wrap:nowrap;
        align-items:center;
        gap:18px;
        white-space:nowrap;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-section-inline .menu-info-list{justify-content:flex-end;flex:1;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-info-row{display:inline-flex;align-items:center;font-size:14px;font-weight:600;color:#163656;gap:6px;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-info-label{width:16px;height:16px;display:inline-block;background-size:contain;background-repeat:no-repeat;opacity:0.7;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-info-label[data-icon="chat"]{background-image:url("${ICONS.chatIcon}");}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-info-label[data-icon="mail"]{background-image:url("${ICONS.mailIcon}");}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-info-value{font-size:15px;color:#0f2d4a;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-row{display:flex;justify-content:space-between;font-size:13px;font-weight:600;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-history{display:flex;flex-direction:column;gap:8px;max-height:150px;overflow:auto;width:100%;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-history-item{border:1px solid rgba(31,79,116,0.12);border-radius:3px;padding:6px 10px;background:#f9fbff;font-size:11px;font-weight:600;color:#143852;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:flex;align-items:center;gap:8px;height:30px;min-height:30px;cursor:pointer;transition:background .12s ease,border-color .12s ease;justify-content:space-between;width:100%;}
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-history-item{flex-wrap:wrap;height:auto;min-height:30px;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .history-item-col{display:inline-flex;align-items:center;gap:6px;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .history-item-stats{flex:1 1 auto;justify-content:center;white-space:nowrap;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .history-item-time{flex:0 1 auto;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .history-item-money{flex:0 0 auto;justify-content:flex-end;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-profile-info{display:inline-flex;align-items:center;gap:8px;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .history-time{margin-right:4px;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .history-icon{display:inline-block;width:14px;height:14px;vertical-align:middle;filter:grayscale(0.2);}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .history-icon[data-icon="chat"]{background:url("${ICONS.chatIcon}") no-repeat center/contain;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .history-icon[data-icon="mail"]{background:url("${ICONS.mailIcon}") no-repeat center/contain;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .history-icon[data-icon="hour"]{background:url("${ICONS.hourStopwatch}") no-repeat center/contain;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .history-icon[data-icon="money"]{background:url("${ICONS.money}") no-repeat center/contain;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .history-icon[data-icon="profile"]{background:url("${ICONS.userInfo}") no-repeat center/contain;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .history-money{display:inline-flex;align-items:center;gap:4px;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .history-money-value{color:#e55252;font-weight:600;}
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-history-empty{font-size:12px;opacity:0.6;padding:6px 0;}
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-row{display:flex;flex-direction:column;gap:2px;min-width:60px}
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-label{opacity:0.6;font-size:11px;text-transform:uppercase;letter-spacing:0.05em}
      .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-value{font-size:15px;font-weight:600;color:#0f2d4a}
      .MuiAutocomplete-inputRoot,.MuiAutocomplete-popper{
        z-index:2147483646!important;
      }
      .MuiAutocomplete-inputRoot{
        position:relative;
      }
      @media (max-width: 1400px){
        .${LOGO_WHITE_SQUARE_CLASS} .logo-counter{
          padding:6px;
          gap:4px;
        }
        .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-total{font-size:20px}
        .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-total-row{gap:6px;flex-wrap:wrap;justify-content:center}
        .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-hour{font-size:12px;gap:4px;flex-wrap:wrap;justify-content:center}
        .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-hour-icon,
        .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-icon{
          width:18px;
          height:18px;
        }
        .${LOGO_WHITE_SQUARE_CLASS} .logo-counter-value{font-size:13px}
        .${LOGO_WHITE_SQUARE_MENU_CLASS}{
          min-width:200px;
          padding:14px;
        }
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS}{
        display:none;
        flex-direction:column;
        gap:16px;
        background:#f1f3f9;
        border-radius:10px;
        box-shadow:none;
        padding:0;
        width:100%;
        box-sizing:border-box;
        min-height:0;
        flex:1 1 auto;
        height:100%;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS}.open{display:flex;}
      .${LOGO_WHITE_SQUARE_EXPANDED_WRAPPER_CLASS}{
        width:100%;
        box-sizing:border-box;
        padding:10px 5px 10px 5px;
        display:flex;
        flex-direction:column;
        align-items:stretch;
        min-height:0;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CONTENT_CLASS}{
        position:static!important;
        background:transparent;
        box-shadow:none;
        border-radius:0;
        width:100%!important;
        padding:0;
        display:flex!important;
        flex-direction:column;
        gap:16px;
        color:#1f4f74;
        flex:1 1 auto;
        min-height:0;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS}{
        width:100%!important;
        max-height:none;
        padding:0;
        display:flex;
        flex:1 1 auto;
        min-height:0;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-columns{
        display:flex;
        width:100%;
        height:100%;
        align-items:stretch;
        flex:1 1 auto;
        min-height:0;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-column{
        flex:1 1 0;
        display:flex;
        flex-direction:column;
        gap:12px;
        border-right:1px solid rgba(31,79,116,0.1);
        padding:16px;
        background:#fff;
        border-radius:8px;
        margin-right:10px;
        min-height:0;
        height:100%;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-column.menu-column-left{
        border-right-color:transparent;
        background:#f1f3f9;
        padding:0;
        gap:0;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-column.menu-column-chart{
        border-right:none;
        background:#f1f3f9;
        padding:0;
        margin-right:0;
        position:relative;
        overflow:hidden;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-column.menu-column-chart::before{
        content:none;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-column.menu-column-chart::after{
        content:none;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-panels{
        display:flex;
        flex-direction:column;
        width:100%;
        height:100%;
        min-height:0;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-panel{
        display:flex;
        flex-direction:column;
        gap:8px;
        background:#fff;
        border:1px solid rgba(31,79,116,0.12);
        border-radius:8px;
        padding:10px;
        min-height:0;
        flex:1 1 auto;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-main-tabs,
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-sub-tabs{
        display:flex;
        gap:6px;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-sub-tabs{
        display:none;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-panel.show-all-time-subtabs .rating-sub-tabs{
        display:flex;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-main-tab,
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-sub-tab{
        flex:1 1 0;
        border:1px solid rgba(31,79,116,0.18);
        background:#f4f7fb;
        color:#163656;
        border-radius:4px;
        padding:4px 6px;
        font-size:12px;
        font-weight:600;
        cursor:pointer;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-main-tab.active,
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-sub-tab.active{
        background:#1f4f74;
        color:#fff;
        border-color:#1f4f74;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-table-wrap{
        display:flex;
        flex-direction:column;
        gap:4px;
        overflow:auto;
        min-height:0;
        flex:1 1 auto;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-row{
        display:grid;
        align-items:center;
        gap:8px;
        padding:4px 6px;
        border-radius:4px;
        font-size:11px;
        font-weight:600;
        color:#143852;
        background:#f9fbff;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-row.rating-row-balance{
        grid-template-columns: 34px minmax(120px,1fr) 110px;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-row.rating-row-actions{
        grid-template-columns: 34px minmax(120px,1fr) 74px 74px 74px;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-row span{
        overflow:hidden;
        text-overflow:ellipsis;
        white-space:nowrap;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-row.rating-row-header{
        align-items:center;
        background:#eef3f9;
        color:#5f7285;
        text-transform:uppercase;
        letter-spacing:0.04em;
        font-weight:700;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-row.is-current{
        border:1px solid rgba(31,79,116,0.38);
        background:#e8f0fb;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-loading,
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-empty,
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-error{
        font-size:12px;
        color:#5f7285;
        padding:6px 4px;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-error{
        color:#b03a2e;
      }
      .${LOGO_WHITE_SQUARE_MENU_CLASS} .rating-updated-at{
        font-size:11px;
        color:#6a7f91;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-column:last-child{margin-right:0;}
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-column:last-child{
        border-right:none;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-column-center{
        border-left:1px solid rgba(31,79,116,0.1);
        padding-left:16px;
        padding-right:16px;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-section,
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-section-inline{
        width:100%;
        flex-direction:column;
        align-items:flex-start;
        gap:10px;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-section-history{
        width:100%;
        align-items:stretch;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-section-history > *{
        width:100%;
        align-self:stretch;
        box-sizing:border-box;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-section-history .menu-history,
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-section-history .menu-history-item{
        width:100%;
        box-sizing:border-box;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-info-list{
        width:100%;
        justify-content:flex-start;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-info-row{
        justify-content:flex-start;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_CLASS} .${LOGO_WHITE_SQUARE_MENU_CLASS} .menu-history{
        max-height:none;
        overflow:visible;
      }
      .${LOGO_WHITE_SQUARE_EXPANDED_HIDDEN_CLASS}{
        display:none!important;
      }
    `;
    (document.head || document.documentElement || document.body || document)
      .appendChild(style);
  } catch {}
}

function createLogoWhiteSquareMenuSections() {
  const createInfoRow = () => {
    const row = document.createElement("div");
    row.className = "menu-info-row";
    const label = document.createElement("span");
    label.className = "menu-info-label";
    const value = document.createElement("span");
    value.className = "menu-info-value";
    value.textContent = "0";
    row.appendChild(label);
    row.appendChild(value);
    return { row, label, value };
  };
  const operatorSection = document.createElement("div");
  operatorSection.className = "menu-section menu-operator-info";
  const operatorTitle = document.createElement("div");
  operatorTitle.className = "menu-title";
  const operatorNameRow = document.createElement("div");
  operatorNameRow.className = "menu-row menu-operator-name-row";
  operatorNameRow.dataset.serverOnly = "1";
  const operatorNameLabel = document.createElement("span");
  operatorNameLabel.className = "menu-operator-name-label";
  const operatorNameControl = document.createElement("div");
  operatorNameControl.className = "menu-operator-name-control";
  const operatorNameInput = document.createElement("input");
  operatorNameInput.type = "text";
  operatorNameInput.className = "menu-operator-name-input";
  operatorNameInput.placeholder = "Имя";
  operatorNameInput.autocomplete = "off";
  operatorNameInput.spellcheck = false;
  try {
    const fallbackName = String(
      operatorInfoState.operatorName ||
        (operatorShiftSummaryCache &&
        String(operatorShiftSummaryCache.operator_id || "") ===
          String(operatorInfoState.operatorId || "")
          ? operatorShiftSummaryCache.operator_name || ""
          : "")
    ).trim();
    if (fallbackName) operatorNameInput.value = fallbackName;
  } catch {}
  const operatorNameSave = document.createElement("button");
  operatorNameSave.type = "button";
  operatorNameSave.className = "menu-operator-name-save menu-operator-name-save-icon";
  operatorNameSave.textContent = "";
  operatorNameSave.title = "Сохранить";
  operatorNameSave.setAttribute("aria-label", "Сохранить");
  operatorNameSave.disabled = true;
  operatorNameControl.appendChild(operatorNameInput);
  operatorNameControl.appendChild(operatorNameSave);
  operatorNameRow.appendChild(operatorNameLabel);
  operatorNameLabel.hidden = true;
  operatorNameRow.appendChild(operatorNameControl);
  const operatorRow = document.createElement("div");
  operatorRow.className = "menu-row";
  const operatorLabel = document.createElement("span");
  const operatorValue = document.createElement("span");
  operatorValue.textContent = Number.isFinite(operatorInfoState.operatorId)
    ? String(operatorInfoState.operatorId)
    : "—";
  operatorRow.appendChild(operatorLabel);
  operatorRow.appendChild(operatorValue);
  operatorSection.appendChild(operatorTitle);
  operatorSection.appendChild(operatorNameRow);
  operatorSection.appendChild(operatorRow);
  const updateNameSaveState = () => {
    const current = String(operatorInfoState.operatorName || "").trim();
    const next = String(operatorNameInput.value || "").trim();
    operatorNameSave.disabled = next === current;
  };
  const commitOperatorName = async () => {
    if (!operatorInfoState.operatorId) return;
    const normalized = String(operatorNameInput.value || "").trim();
    operatorInfoState.operatorName = normalized;
    setOperatorNameEntry({
      operator_id: String(operatorInfoState.operatorId),
      operator_name: normalized,
      updated_at: Date.now(),
    });
    updateOperatorNameUI();
    await sendOperatorShiftSnapshot(getCurrentOperatorBalanceTotal());
    updateNameSaveState();
    operatorNameSave.classList.add("saved");
    setTimeout(() => {
      operatorNameSave.classList.remove("saved");
    }, 800);
  };
  operatorNameInput.addEventListener("input", updateNameSaveState);
  operatorNameInput.addEventListener("blur", () => {
    const current = String(operatorInfoState.operatorName || "").trim();
    const next = String(operatorNameInput.value || "").trim();
    if (next !== current) {
      commitOperatorName();
    }
  });
  operatorNameInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitOperatorName();
    }
  });
  operatorNameSave.addEventListener("click", () => {
    commitOperatorName();
  });
  const totalDetails = document.createElement("div");
  totalDetails.className = "menu-info-list";
  const totalChatRow = createInfoRow();
  totalChatRow.label.dataset.icon = "chat";
  const totalMailRow = createInfoRow();
  totalMailRow.label.dataset.icon = "mail";
  totalDetails.appendChild(totalChatRow.row);
  totalDetails.appendChild(totalMailRow.row);
  const hourlyDetails = document.createElement("div");
  hourlyDetails.className = "menu-info-list";
  const hourlyChatRow = createInfoRow();
  hourlyChatRow.label.dataset.icon = "chat";
  const hourlyMailRow = createInfoRow();
  hourlyMailRow.label.dataset.icon = "mail";
  hourlyDetails.appendChild(hourlyChatRow.row);
  hourlyDetails.appendChild(hourlyMailRow.row);
  const totalSection = document.createElement("div");
  totalSection.className = "menu-section menu-section-inline";
  const totalTitle = document.createElement("div");
  totalTitle.className = "menu-title";
  totalSection.appendChild(totalTitle);
  totalSection.appendChild(totalDetails);
  const hourSection = document.createElement("div");
  hourSection.className = "menu-section menu-section-inline";
  const hourSectionTitle = document.createElement("div");
  hourSectionTitle.className = "menu-title";
  hourSection.appendChild(hourSectionTitle);
  hourSection.appendChild(hourlyDetails);
  const historySection = document.createElement("div");
  historySection.className = "menu-section menu-section-history";
  const historyTitle = document.createElement("div");
  historyTitle.className = "menu-title";
  const historyList = document.createElement("div");
  historyList.className = "menu-history";
  historySection.appendChild(historyTitle);
  historySection.appendChild(historyList);
  const summarySection = document.createElement("div");
  summarySection.className = "menu-section menu-balance-summary";
  const balanceLabel = document.createElement("div");
  balanceLabel.className = "menu-balance-summary-label";
  balanceLabel.textContent = "Баланс:";
  const balanceValue = document.createElement("div");
  balanceValue.className = "menu-balance-summary-amount";
  balanceValue.textContent = "0.00";
  const shiftLabel = document.createElement("div");
  shiftLabel.className = "menu-balance-summary-label";
  shiftLabel.textContent = "Сгенерированные действия:";
  const shiftDetails = document.createElement("div");
  shiftDetails.className = "menu-info-list menu-balance-summary-details";
  const shiftChatRow = createInfoRow();
  shiftChatRow.label.dataset.icon = "chat";
  const shiftMailRow = createInfoRow();
  shiftMailRow.label.dataset.icon = "mail";
  shiftDetails.appendChild(shiftChatRow.row);
  shiftDetails.appendChild(shiftMailRow.row);
  const shiftValue = document.createElement("div");
  shiftValue.className = "menu-balance-summary-total";
  shiftValue.textContent = "0";
  const shiftRow = document.createElement("div");
  shiftRow.className = "menu-balance-summary-total-row";
  shiftRow.appendChild(shiftValue);
  shiftRow.appendChild(shiftDetails);
  summarySection.appendChild(balanceLabel);
  summarySection.appendChild(balanceValue);
  summarySection.appendChild(shiftLabel);
  summarySection.appendChild(shiftRow);
  return {
    sections: {
      operatorInfo: operatorSection,
      balanceSummary: summarySection,
      totalSection,
      hourSection,
      historySection,
    },
    refs: {
      operatorInfoTitle: operatorTitle,
      operatorInfoLabel: operatorLabel,
      operatorInfoValue: operatorValue,
      operatorNameLabel,
      operatorNameInput,
      operatorNameSave,
      balanceSummaryValue: balanceValue,
      shiftTotalValue: shiftValue,
      shiftChatsValue: shiftChatRow.value,
      shiftMailsValue: shiftMailRow.value,
      shiftDetailsList: shiftDetails,
      shiftRow,
      chatsLabel: totalChatRow.label,
      chatsValue: totalChatRow.value,
      mailsLabel: totalMailRow.label,
      mailsValue: totalMailRow.value,
      totalDetailsList: totalDetails,
      hourChatsLabel: hourlyChatRow.label,
      hourChatsValue: hourlyChatRow.value,
      hourMailsLabel: hourlyMailRow.label,
      hourMailsValue: hourlyMailRow.value,
      totalSectionTitle: totalTitle,
      hourSectionTitle,
      historySectionTitle: historyTitle,
      historyList,
    },
  };
}

function createLogoWhiteSquareProfilesSection() {
  const section = document.createElement("div");
  section.className = "menu-section menu-section-profiles";
  const title = document.createElement("div");
  title.className = "menu-title";
  section.appendChild(title);
  const list = document.createElement("div");
  list.className = "menu-history menu-profiles-list";
  const listWrap = document.createElement("div");
  listWrap.className = "menu-profiles-list-wrap";
  listWrap.appendChild(list);
  section.appendChild(listWrap);
  return {
    section,
    refs: {
      profilesSectionTitle: title,
      profilesList: list,
    },
  };
}

function getProfileDisplayName(profileId) {
  if (!profileId) return "";
  const normalized = normalizeProfileExternalId(profileId) || profileId;
  const items = Array.isArray(logoWhiteSquareProfilesState.items)
    ? logoWhiteSquareProfilesState.items
    : [];
  const found = items.find(
    (item) => normalizeProfileExternalId(item.externalId) === normalized
  );
  if (found) {
    return found.name || normalized;
  }
  return normalized;
}

function normalizeProfileSelectionKey(value) {
  if (value === null) return null;
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (raw.toLowerCase() === "unknown") return "unknown";
  const normalized = normalizeProfileExternalId(raw);
  return normalized || null;
}

function setLogoWhiteSquareProfilesLoading(loading) {
  logoWhiteSquareProfilesState.loading = !!loading;
  const buttons = getLogoWhiteSquareCounterNodes("profilesRefreshButton");
  buttons.forEach((btn) => {
    if (!btn) return;
    btn.disabled = !!loading;
    if (loading) btn.setAttribute("aria-busy", "true");
    else btn.removeAttribute("aria-busy");
  });
  renderLogoWhiteSquareProfilesList();
}

function renderLogoWhiteSquareProfilesList() {
  const lists = getLogoWhiteSquareCounterNodes("profilesList");
  if (!lists.length) return;
  const { loading, error, items } = logoWhiteSquareProfilesState;
  const statsMap =
    (monitorCounterState.counts &&
      monitorCounterState.counts.profileStats &&
      typeof monitorCounterState.counts.profileStats === "object"
      ? monitorCounterState.counts.profileStats
      : {}) || {};
  const earningsMap = balanceProfileEarnings || {};
  const loadingText = t("profilesLoading") || "Загрузка...";
  const emptyText = t("profilesEmpty") || "Анкеты не найдены";
  const errorText = error || t("profilesError") || "Не удалось загрузить анкеты";
  const unknownLabel = t("profilesUnknown") || "Неизвестная анкета";
  const rows = [];
  const usedKeys = new Set();
  const activeProfileIds = new Set();
  const renderRow = ({ name, age, externalId }) => {
    const safeName = escapeHtml(name || unknownLabel);
    const ageLabel =
      typeof age === "number" && Number.isFinite(age)
        ? `, ${escapeHtml(String(age))}`
        : "";
    const profileKey =
      typeof externalId === "string" && externalId.trim()
        ? externalId.trim()
        : "unknown";
    const titleAttr =
      profileKey && profileKey !== "unknown"
        ? ` title="ID: ${escapeHtml(profileKey)}"`
        : "";
    const serverEntries = Array.isArray(profileShiftStatsCache?.[profileKey])
      ? profileShiftStatsCache[profileKey]
      : [];
    const operatorBlocks = serverEntries.length
      ? serverEntries.map((entry) => {
          const opId = entry?.operator_id ?? entry?.operatorId ?? "";
          const rawName = String(
            entry?.operator_name || entry?.operatorName || ""
          ).trim();
          const opLabel = rawName ? { label: rawName, title: `ID: ${opId}` } : resolveOperatorDisplayName(opId);
          const opTitle = opLabel.title
            ? ` title="${escapeHtml(opLabel.title)}"`
            : "";
          const actionsTotal = Number(entry?.actions_total) || 0;
          const chatCount = Number(entry?.chat_count) || 0;
          const mailCount = Number(entry?.mail_count) || 0;
          const balanceValue = Number(entry?.balance_earned) || 0;
          return `
        <div class="menu-profile-operator-block">
          <div class="menu-profile-operator-id"${opTitle}>${escapeHtml(
            String(opLabel.label || "—")
          )}</div>
          <div class="menu-profile-operator-metrics">
            <span class="history-icon" data-icon="hour"></span> ${actionsTotal}
            <span class="history-icon" data-icon="chat"></span> ${chatCount}
            <span class="history-icon" data-icon="mail"></span> ${mailCount}
            <span class="history-icon" data-icon="money"></span>
            <span>${balanceValue.toFixed(2)}</span>
          </div>
        </div>`;
        })
      : [
          `
        <div class="menu-profile-operator-block">
          <div class="menu-profile-operator-id">—</div>
          <div class="menu-profile-operator-metrics">—</div>
        </div>`,
        ];
  const dataAttr = ` data-profile-id="${escapeHtml(profileKey)}"`;
  return `
      <div class="menu-history-item menu-profiles-item"${dataAttr}>
        <div class="history-item-col history-item-time menu-profile-info">
          <span class="history-icon" data-icon="profile"></span>
          <span class="menu-profile-name"${titleAttr}>${safeName}${ageLabel}</span>
        </div>
        <div class="history-item-col history-item-stats history-item-money menu-profile-operator-stats">
          ${operatorBlocks.join("")}
        </div>
      </div>`;
  };
  const normalizedItems = Array.isArray(items) ? items : [];
  const rowsHtml = (() => {
    if (loading) {
      return `<div class="menu-history-empty">${escapeHtml(loadingText)}</div>`;
    }
    if (error) {
      return `<div class="menu-history-empty">${escapeHtml(errorText)}</div>`;
    }
    ensureProfileTotalsDayKey();
    normalizedItems.forEach((item) => {
      const profileId = normalizeProfileExternalId(item.externalId) || "";
      const key = profileId || "unknown";
      if (profileId) {
        activeProfileIds.add(profileId);
        enqueueProfileTotal(profileId);
      }
      usedKeys.add(key);
      rows.push(
        renderRow({
          name: item.name || profileId || unknownLabel,
          age: item.age,
          externalId: profileId,
        })
      );
    });
    Object.keys(statsMap).forEach((key) => {
      const normalizedKey = key && key.trim() ? key : "unknown";
      if (
        normalizedKey !== "unknown" &&
        !activeProfileIds.has(normalizedKey)
      ) {
        return;
      }
      if (usedKeys.has(normalizedKey)) return;
      if (normalizedKey !== "unknown") {
        enqueueProfileTotal(normalizedKey);
      }
      const stats = statsMap[key] || {};
      const hasActivity =
        (Number.isFinite(Number(stats.chat)) && stats.chat) ||
        (Number.isFinite(Number(stats.mail)) && stats.mail);
      const earnings = earningsMap[normalizedKey] || 0;
      if (!hasActivity && !earnings) return;
      usedKeys.add(normalizedKey);
      rows.push(
        renderRow({
          name: normalizedKey === "unknown" ? unknownLabel : normalizedKey,
          age: null,
          externalId: normalizedKey === "unknown" ? "" : normalizedKey,
        })
      );
    });
    if (!rows.length) {
      return `<div class="menu-history-empty">${escapeHtml(emptyText)}</div>`;
    }
    return rows.join("");
  })();
  lists.forEach((list) => {
    try {
      list.innerHTML = rowsHtml;
    } catch {
      list.textContent = "";
    }
  });
}

async function refreshLogoWhiteSquareProfiles() {
  if (logoWhiteSquareProfilesState.loading) return;
  logoWhiteSquareProfilesState.error = "";
  setLogoWhiteSquareProfilesLoading(true);
  allowedProfileTotalsIds = new Set();
  try {
    const token = getAuthTokenFromStorage();
    if (!token) throw new Error("Не найден токен");
    const payload = await profileSwitchRequest({
      url: PROFILE_SWITCH_ENDPOINTS.profiles,
      token,
    });
    const nextItems = mapLogoWhiteSquareProfilesPayload(payload);
    try {
      await sendSenderListForProfiles(token, nextItems);
    } catch {}
    try {
      const ids = nextItems
        .map((item) => normalizeProfileExternalId(item.externalId))
        .filter(Boolean);
      await fetchProfileShiftStatsBatch(ids);
    } catch {}
    const nextIds = new Set(
      (Array.isArray(nextItems) ? nextItems : [])
        .map((item) => normalizeProfileExternalId(item.externalId))
        .filter(Boolean)
    );
    allowedProfileTotalsIds = nextIds;
    profilesRequireRefresh = false;
    // Drop cached totals for profiles no longer present.
    if (profileTotalsCache?.size) {
      for (const key of profileTotalsCache.keys()) {
        if (!nextIds.has(key)) {
          profileTotalsCache.delete(key);
        }
      }
    }
    if (profileTotalsQueued?.size) {
      for (const key of profileTotalsQueued) {
        if (!nextIds.has(key)) {
          profileTotalsQueued.delete(key);
        }
      }
    }
    if (profileTotalsInFlight?.size) {
      for (const key of profileTotalsInFlight.keys()) {
        if (!nextIds.has(key)) {
          profileTotalsInFlight.delete(key);
        }
      }
    }
    if (Array.isArray(profileTotalsQueue) && profileTotalsQueue.length) {
      profileTotalsQueue = profileTotalsQueue.filter((key) => nextIds.has(key));
    }
    if (balanceProfileEarnings && typeof balanceProfileEarnings === "object") {
      Object.keys(balanceProfileEarnings).forEach((key) => {
        if (!nextIds.has(key)) {
          delete balanceProfileEarnings[key];
        }
      });
    }
    logoWhiteSquareProfilesState.items = nextItems;
    logoWhiteSquareProfilesState.error = "";
    persistLogoWhiteSquareProfilesCache();
    try {
      const ids = (Array.isArray(nextItems) ? nextItems : [])
        .map((item) => normalizeProfileExternalId(item?.externalId))
        .filter(Boolean);
      window?.localStorage?.setItem?.(
        "__ot4et_profile_ids__",
        JSON.stringify(ids)
      );
    } catch {}
  } catch (err) {
    logoWhiteSquareProfilesState.items = logoWhiteSquareProfilesState.items || [];
    logoWhiteSquareProfilesState.error =
      err?.message || t("profilesError") || "Не удалось загрузить анкеты";
  } finally {
    lastProfilesRefreshAt = Date.now();
    setLogoWhiteSquareProfilesLoading(false);
  }
}

async function loadLogoWhiteSquareProfilesCache() {
  if (logoWhiteSquareProfilesCacheLoaded) return;
  logoWhiteSquareProfilesCacheLoaded = true;
  try {
    const store = await getStore([LOGO_WHITE_SQUARE_PROFILES_STORAGE_KEY]);
    const cached = store[LOGO_WHITE_SQUARE_PROFILES_STORAGE_KEY];
    if (cached && Array.isArray(cached.items)) {
      logoWhiteSquareProfilesState.items = cached.items;
      logoWhiteSquareProfilesState.error = "";
      try {
        const ids = cached.items
          .map((item) => normalizeProfileExternalId(item?.externalId))
          .filter(Boolean);
        window?.localStorage?.setItem?.(
          "__ot4et_profile_ids__",
          JSON.stringify(ids)
        );
      } catch {}
      if (cached.ts) lastProfilesRefreshAt = Number(cached.ts) || lastProfilesRefreshAt;
      const cachedIds = new Set(
        cached.items
          .map((item) => normalizeProfileExternalId(item.externalId))
          .filter(Boolean)
      );
      allowedProfileTotalsIds = cachedIds;
      try {
        const ids = Array.from(cachedIds);
        fetchProfileShiftStatsBatch(ids);
      } catch {}
      renderLogoWhiteSquareProfilesList();
    }
  } catch {}
}

function persistLogoWhiteSquareProfilesCache() {
  try {
    const items = Array.isArray(logoWhiteSquareProfilesState.items)
      ? logoWhiteSquareProfilesState.items
      : [];
    setStore({
      [LOGO_WHITE_SQUARE_PROFILES_STORAGE_KEY]: {
        items,
        ts: Date.now(),
      },
    });
  } catch {}
}

async function ensureProfilesRefreshedBeforeStats({ forceIfEmpty = false } = {}) {
  if (logoWhiteSquareProfilesState.loading) return;
  const items = logoWhiteSquareProfilesState.items;
  const hasItems = Array.isArray(items) && items.length > 0;
  if (forceIfEmpty && !hasItems) {
    try {
      await refreshLogoWhiteSquareProfiles();
    } catch {}
    return;
  }
  const now = Date.now();
  const last = Number(lastProfilesRefreshAt) || 0;
  if (last && now - last < AUTO_PROFILES_REFRESH_MS) return;
  try {
    await refreshLogoWhiteSquareProfiles();
  } catch {}
}

loadLogoWhiteSquareProfilesCache();
loadProfileShiftDeltaState();
loadProfileShiftStatsCache();
loadProfileShiftDeltaQueue();
loadOperatorShiftSummaryCache();
loadOperatorShiftSnapshotQueue();
loadOperatorNamesCache();

async function loadLogoWhiteSquareBalanceCache() {
  if (balanceEarningsCacheLoaded) return;
  balanceEarningsCacheLoaded = true;
  const todayKey = getKyivDayKey();
  try {
    const store = await getStore([LOGO_WHITE_SQUARE_BALANCE_STORAGE_KEY]);
    const cached = store[LOGO_WHITE_SQUARE_BALANCE_STORAGE_KEY];
    if (cached && cached.dayKey === todayKey) {
      balanceEarningsDayKey = cached.dayKey;
      balanceHourlyHistory = new Map();
      Object.entries(cached.hourly || {}).forEach(([key, value]) => {
        const num = Number(value);
        if (Number.isFinite(num)) {
          balanceHourlyHistory.set(key, num);
        }
      });
      balanceHourlyStartMap = new Map();
      Object.entries(cached.hourlyStart || {}).forEach(([key, value]) => {
        const num = Number(value);
        if (Number.isFinite(num)) {
          balanceHourlyStartMap.set(key, num);
        }
      });
      balanceProfileEarnings = Object.create(null);
      Object.entries(cached.profiles || {}).forEach(([key, value]) => {
        if (!key) return;
        const num = Number(value);
        if (Number.isFinite(num)) {
          balanceProfileEarnings[key] = num;
        }
      });
      profileHourlyHistoryDayKey = cached.dayKey || todayKey;
      profileHourlyHistory = new Map();
      const profileHourlyRaw = cached.profileHourly;
      if (profileHourlyRaw && typeof profileHourlyRaw === "object") {
        Object.entries(profileHourlyRaw).forEach(([profileId, hours]) => {
          if (!profileId || !hours || typeof hours !== "object") return;
          const hourMap = new Map();
          Object.entries(hours).forEach(([hourKey, entry]) => {
            if (!hourKey || !entry || typeof entry !== "object") return;
            const total = Number(entry.total) || 0;
            const chat = Number(entry.chat) || 0;
            const mail = Number(entry.mail) || 0;
            const earnings = Number(entry.earnings) || 0;
            const start = Number(entry.start);
            const breakdown =
              entry.breakdown && typeof entry.breakdown === "object"
                ? entry.breakdown
                : null;
            hourMap.set(hourKey, {
              start: Number.isFinite(start) ? start : null,
              total,
              chat,
              mail,
              earnings,
              typeBreakdown: breakdown ? { ...breakdown } : Object.create(null),
            });
          });
          if (hourMap.size) {
            profileHourlyHistory.set(profileId, hourMap);
          }
        });
      }
      const hourlyBreakdownRaw = cached.hourlyBreakdown;
      globalHourlyTypeBreakdown = new Map();
      if (hourlyBreakdownRaw && typeof hourlyBreakdownRaw === "object") {
        Object.entries(hourlyBreakdownRaw).forEach(([hourKey, entry]) => {
          if (!hourKey || !entry || typeof entry !== "object") return;
          const start = Number(entry.start);
          const breakdown =
            entry.breakdown && typeof entry.breakdown === "object"
              ? entry.breakdown
              : null;
          globalHourlyTypeBreakdown.set(hourKey, {
            start: Number.isFinite(start) ? start : null,
            breakdown: breakdown ? { ...breakdown } : Object.create(null),
          });
        });
      }
      totalPaidActionCounts = {
        chat: Number(cached?.paidTotals?.chat) || 0,
        mail: Number(cached?.paidTotals?.mail) || 0,
      };
      const paidProfilesRaw = cached.paidProfiles;
      profilePaidActionCounts = Object.create(null);
      if (paidProfilesRaw && typeof paidProfilesRaw === "object") {
        Object.entries(paidProfilesRaw).forEach(([profileId, counts]) => {
          if (!profileId || !counts || typeof counts !== "object") return;
          const chat = Number(counts.chat) || 0;
          const mail = Number(counts.mail) || 0;
          if (!chat && !mail) return;
          profilePaidActionCounts[profileId] = { chat, mail };
        });
      }
      const paidProfileHourlyRaw = cached.paidProfileHourly;
      profileHourlyPaidActionCounts = new Map();
      if (paidProfileHourlyRaw && typeof paidProfileHourlyRaw === "object") {
        Object.entries(paidProfileHourlyRaw).forEach(([profileId, hours]) => {
          if (!profileId || !hours || typeof hours !== "object") return;
          const hourMap = new Map();
          Object.entries(hours).forEach(([hourKey, entry]) => {
            if (!hourKey || !entry || typeof entry !== "object") return;
            const chat = Number(entry.chat) || 0;
            const mail = Number(entry.mail) || 0;
            if (!chat && !mail) return;
            const start = Number(entry.start);
            hourMap.set(hourKey, {
              chat,
              mail,
              start: Number.isFinite(start) ? start : null,
            });
          });
          if (hourMap.size) {
            profileHourlyPaidActionCounts.set(profileId, hourMap);
          }
        });
      }
      const paidHourlyRaw = cached.paidHourly;
      globalHourlyPaidActionCounts = new Map();
      if (paidHourlyRaw && typeof paidHourlyRaw === "object") {
        Object.entries(paidHourlyRaw).forEach(([hourKey, entry]) => {
          if (!hourKey || !entry || typeof entry !== "object") return;
          const chat = Number(entry.chat) || 0;
          const mail = Number(entry.mail) || 0;
          if (!chat && !mail) return;
          const start = Number(entry.start);
          globalHourlyPaidActionCounts.set(hourKey, {
            chat,
            mail,
            start: Number.isFinite(start) ? start : null,
          });
        });
      }
      const typeProfilesRaw = cached.typeProfiles;
      profileTypeEarnings = Object.create(null);
      profileTypeBreakdown = Object.create(null);
      if (typeProfilesRaw && typeof typeProfilesRaw === "object") {
        Object.entries(typeProfilesRaw).forEach(([key, value]) => {
          if (!key || !value || typeof value !== "object") return;
          const chat = Number(value.chat) || 0;
          const mail = Number(value.mail) || 0;
          if (!chat && !mail) return;
          profileTypeEarnings[key] = { chat, mail };
          if (value.breakdown && typeof value.breakdown === "object") {
            const breakdown = Object.create(null);
            Object.entries(value.breakdown).forEach(([typeKey, amount]) => {
              const num = Number(amount) || 0;
              if (!num) return;
              breakdown[typeKey] = num;
            });
            if (Object.keys(breakdown).length) {
              profileTypeBreakdown[key] = breakdown;
            }
          }
        });
      }
      const totalsRaw = cached.typeTotals;
      totalTypeEarnings = { chat: 0, mail: 0 };
      totalTypeBreakdown = Object.create(null);
      if (
        totalsRaw &&
        typeof totalsRaw === "object" &&
        (Number.isFinite(Number(totalsRaw.chat)) ||
          Number.isFinite(Number(totalsRaw.mail)))
      ) {
        totalTypeEarnings = {
          chat: Number(totalsRaw.chat) || 0,
          mail: Number(totalsRaw.mail) || 0,
        };
        if (totalsRaw.breakdown && typeof totalsRaw.breakdown === "object") {
          Object.entries(totalsRaw.breakdown).forEach(([typeKey, amount]) => {
            const num = Number(amount) || 0;
            if (!num) return;
            totalTypeBreakdown[typeKey] = num;
          });
        }
      }
    } else {
      balanceEarningsDayKey = todayKey;
      balanceHourlyHistory = new Map();
      balanceHourlyStartMap = new Map();
      balanceProfileEarnings = Object.create(null);
      profileHourlyHistory = new Map();
      profileHourlyHistoryDayKey = todayKey;
      profileTypeEarnings = Object.create(null);
      totalTypeEarnings = { chat: 0, mail: 0 };
      profileTypeBreakdown = Object.create(null);
      totalTypeBreakdown = Object.create(null);
      globalHourlyTypeBreakdown = new Map();
      totalPaidActionCounts = { chat: 0, mail: 0 };
      profilePaidActionCounts = Object.create(null);
      profileHourlyPaidActionCounts = new Map();
      globalHourlyPaidActionCounts = new Map();
    }
  } catch {
    balanceEarningsDayKey = todayKey;
    balanceHourlyHistory = new Map();
    balanceHourlyStartMap = new Map();
    balanceProfileEarnings = Object.create(null);
    profileHourlyHistory = new Map();
    profileHourlyHistoryDayKey = todayKey;
    profileTypeEarnings = Object.create(null);
    totalTypeEarnings = { chat: 0, mail: 0 };
    profileTypeBreakdown = Object.create(null);
    totalTypeBreakdown = Object.create(null);
    globalHourlyTypeBreakdown = new Map();
    totalPaidActionCounts = { chat: 0, mail: 0 };
    profilePaidActionCounts = Object.create(null);
    profileHourlyPaidActionCounts = new Map();
    globalHourlyPaidActionCounts = new Map();
  }
  try {
    renderLogoWhiteSquareHistory();
    renderLogoWhiteSquareProfilesList();
  } catch {}
}

function persistLogoWhiteSquareBalanceCache() {
  try {
    if (logoWhiteSquareBalancePersistTimer) {
      clearTimeout(logoWhiteSquareBalancePersistTimer);
      logoWhiteSquareBalancePersistTimer = null;
    }
    if (!balanceEarningsDayKey) {
      balanceEarningsDayKey = getKyivDayKey();
    }
    const hourly = Object.create(null);
    balanceHourlyHistory.forEach((value, key) => {
      if (!Number.isFinite(value)) return;
      if (value === 0) return;
      hourly[key] = Number(value);
    });
    const hourlyStart = Object.create(null);
    balanceHourlyStartMap.forEach((value, key) => {
      if (!Number.isFinite(value)) return;
      hourlyStart[key] = Number(value);
    });
    const profiles = Object.create(null);
    Object.entries(balanceProfileEarnings || {}).forEach(([key, value]) => {
      if (!key) return;
      const num = Number(value);
      if (!Number.isFinite(num) || num === 0) return;
      profiles[key] = num;
    });
    const profileHourly = Object.create(null);
    profileHourlyHistory.forEach((hoursMap, profileId) => {
      if (!profileId || !hoursMap || typeof hoursMap.forEach !== "function") {
        return;
      }
      const hoursObj = Object.create(null);
      hoursMap.forEach((entry, hourKey) => {
        if (!hourKey || !entry) return;
        const total = Number(entry.total) || 0;
        const chat = Number(entry.chat) || 0;
        const mail = Number(entry.mail) || 0;
        const earnings = Number(entry.earnings) || 0;
        const breakdownPayload =
          entry.typeBreakdown && typeof entry.typeBreakdown === "object"
            ? entry.typeBreakdown
            : null;
        if (!total && !chat && !mail && !earnings && !breakdownPayload) return;
        const payload = {
          total,
          chat,
          mail,
          earnings,
        };
        const start = Number(entry.start);
        if (Number.isFinite(start)) payload.start = start;
        if (breakdownPayload) {
          const normalized = Object.create(null);
          Object.entries(breakdownPayload).forEach(([typeKey, amount]) => {
            const num = Number(amount) || 0;
            if (!num) return;
            normalized[typeKey] = num;
          });
          if (Object.keys(normalized).length) {
            payload.breakdown = normalized;
          }
        }
        hoursObj[hourKey] = payload;
      });
      if (Object.keys(hoursObj).length) {
        profileHourly[profileId] = hoursObj;
      }
    });
    const typeProfiles = Object.create(null);
    Object.entries(profileTypeEarnings || {}).forEach(([key, value]) => {
      if (!key || !value || typeof value !== "object") return;
      const chat = Number(value.chat) || 0;
      const mail = Number(value.mail) || 0;
      if (!chat && !mail) return;
      const payload = { chat, mail };
      const breakdown = profileTypeBreakdown?.[key];
      if (breakdown && typeof breakdown === "object") {
        const map = Object.create(null);
        Object.entries(breakdown).forEach(([typeKey, amount]) => {
          const num = Number(amount) || 0;
          if (!num) return;
          map[typeKey] = num;
        });
        if (Object.keys(map).length) {
          payload.breakdown = map;
        }
      }
      typeProfiles[key] = payload;
    });
    const typeTotals = {
      chat: Number(totalTypeEarnings?.chat) || 0,
      mail: Number(totalTypeEarnings?.mail) || 0,
      breakdown: Object.create(null),
    };
    Object.entries(totalTypeBreakdown || {}).forEach(([typeKey, amount]) => {
      const num = Number(amount) || 0;
      if (!num) return;
      typeTotals.breakdown[typeKey] = num;
    });
    const hourlyBreakdown = Object.create(null);
    globalHourlyTypeBreakdown.forEach((entry, hourKey) => {
      if (!hourKey || !entry || typeof entry !== "object") return;
      const breakdown = entry.breakdown;
      if (!breakdown || typeof breakdown !== "object") return;
      const normalized = Object.create(null);
      Object.entries(breakdown).forEach(([typeKey, amount]) => {
        const num = Number(amount) || 0;
        if (!num) return;
        normalized[typeKey] = num;
      });
      if (!Object.keys(normalized).length) return;
      const payload = { breakdown: normalized };
      if (Number.isFinite(entry.start)) payload.start = entry.start;
      hourlyBreakdown[hourKey] = payload;
    });
    const paidProfiles = Object.create(null);
    Object.entries(profilePaidActionCounts || {}).forEach(([profileId, counts]) => {
      if (!profileId || !counts || typeof counts !== "object") return;
      const chat = Number(counts.chat) || 0;
      const mail = Number(counts.mail) || 0;
      if (!chat && !mail) return;
      paidProfiles[profileId] = { chat, mail };
    });
    const paidProfileHourly = Object.create(null);
    profileHourlyPaidActionCounts.forEach((hoursMap, profileId) => {
      if (!profileId || !hoursMap || typeof hoursMap.forEach !== "function") {
        return;
      }
      const hoursObj = Object.create(null);
      hoursMap.forEach((entry, hourKey) => {
        if (!hourKey || !entry) return;
        const chat = Number(entry.chat) || 0;
        const mail = Number(entry.mail) || 0;
        if (!chat && !mail) return;
        const payload = { chat, mail };
        if (Number.isFinite(entry.start)) payload.start = entry.start;
        hoursObj[hourKey] = payload;
      });
      if (Object.keys(hoursObj).length) {
        paidProfileHourly[profileId] = hoursObj;
      }
    });
    const paidHourly = Object.create(null);
    globalHourlyPaidActionCounts.forEach((entry, hourKey) => {
      if (!hourKey || !entry) return;
      const chat = Number(entry.chat) || 0;
      const mail = Number(entry.mail) || 0;
      if (!chat && !mail) return;
      const payload = { chat, mail };
      if (Number.isFinite(entry.start)) payload.start = entry.start;
      paidHourly[hourKey] = payload;
    });
    setStore({
      [LOGO_WHITE_SQUARE_BALANCE_STORAGE_KEY]: {
        dayKey: balanceEarningsDayKey,
        hourly,
        hourlyStart,
        profiles,
        profileHourly,
        hourlyBreakdown,
        typeProfiles,
        typeTotals,
        paidTotals: {
          chat: Number(totalPaidActionCounts?.chat) || 0,
          mail: Number(totalPaidActionCounts?.mail) || 0,
        },
        paidProfiles,
        paidProfileHourly,
        paidHourly,
        ts: Date.now(),
      },
    });
  } catch {}
}

function scheduleLogoWhiteSquareBalancePersist(delay = 1000) {
  if (logoWhiteSquareBalancePersistTimer) return;
  logoWhiteSquareBalancePersistTimer = setTimeout(() => {
    logoWhiteSquareBalancePersistTimer = null;
    try {
      persistLogoWhiteSquareBalanceCache();
    } catch {}
  }, Math.max(0, Number(delay) || 0));
}

loadLogoWhiteSquareBalanceCache();

function mapLogoWhiteSquareProfilesPayload(payload) {
  const entries = extractFirstArrayCandidate(payload);
  return entries
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const externalId =
        normalizeProfileExternalId(entry.external_id) ||
        normalizeProfileExternalId(entry.externalId) ||
        normalizeProfileExternalId(entry.id);
      const name =
        typeof entry.name === "string" && entry.name.trim()
          ? entry.name.trim()
          : "";
      const age =
        toNumber(entry.age) ||
        toNumber(entry.woman_age) ||
        toNumber(entry.womanAge) ||
        toNumber(entry.client_age) ||
        toNumber(entry.clientAge);
      if (!externalId && !name) return null;
      return { externalId: externalId || "", name, age };
    })
    .filter(Boolean);
}

function getProfileIdsFromItems(items) {
  return (Array.isArray(items) ? items : [])
    .map((item) => normalizeProfileExternalId(item?.externalId))
    .filter(Boolean);
}

async function sendSenderListForProfiles(token, items) {
  if (!token) return;
  const ids = (Array.isArray(items) ? items : [])
    .map((item) => normalizeProfileExternalId(item?.externalId))
    .filter(Boolean);
  if (!ids.length) return;
  const uniqueIds = Array.from(new Set(ids));
  const body = { external_id: uniqueIds };
  const payload = await profileSwitchRequest({
    url: PROFILE_SWITCH_ENDPOINTS.senderList,
    method: "POST",
    token,
    body,
  });
  try {
    const operatorId = extractOperatorIdFromSenderListPayload(payload);
    if (operatorId) {
      setOperatorInfoId(operatorId);
    }
  } catch {}
}

function relocateExpandedMenuInfoList(sections, refs) {
  try {
    if (!sections || !refs) return;
    const totalSection = sections.totalSection;
    const shiftRow = refs.shiftRow;
    const shiftDetails = refs.shiftDetailsList;
    const totalDetails = refs.totalDetailsList;
    if (!totalSection || !shiftRow || !shiftDetails || !totalDetails) return;
    if (!shiftRow.contains(shiftDetails)) return;
    shiftDetails.remove();
    if (totalDetails.parentElement) {
      totalDetails.parentElement.removeChild(totalDetails);
    }
    shiftRow.appendChild(totalDetails);
    sections.totalSection = null;
    if (refs.shiftDetailsList === shiftDetails) {
      refs.shiftDetailsList = null;
    }
    if (refs.shiftChatsValue && shiftDetails.contains(refs.shiftChatsValue)) {
      refs.shiftChatsValue = null;
    }
    if (refs.shiftMailsValue && shiftDetails.contains(refs.shiftMailsValue)) {
      refs.shiftMailsValue = null;
    }
  } catch {}
}

function suppressExpandedHourSection(sections, refs) {
  try {
    if (!sections) return;
    const hourSection = sections.hourSection;
    if (!hourSection) return;
    sections.hourSection = null;
  } catch {}
}

function getLogoWhiteSquareElement() {
  if (logoWhiteSquareEl) return logoWhiteSquareEl;
  injectLogoWhiteSquareStyles();
  const box = document.createElement("div");
  box.className = LOGO_WHITE_SQUARE_CLASS;
  box.setAttribute("aria-hidden", "true");
  box.setAttribute("role", "presentation");
  const counter = document.createElement("div");
  counter.className = "logo-counter";
  const caption = document.createElement("div");
  caption.className = "logo-counter-caption";
  caption.textContent = "Сгенерированные действия";
  const total = document.createElement("div");
  total.className = "logo-counter-total";
  total.textContent = "0";
  const icon = document.createElement("div");
  icon.className = "logo-counter-icon";
  const totalRow = document.createElement("div");
  totalRow.className = "logo-counter-total-row";
  totalRow.appendChild(icon);
  totalRow.appendChild(total);
  const hourBlock = document.createElement("div");
  hourBlock.className = "logo-counter-hour";
  const hourIcon = document.createElement("div");
  hourIcon.className = "logo-counter-hour-icon";
  const hourValue = document.createElement("div");
  hourValue.className = "logo-counter-hour-value";
  hourValue.textContent = "0";
  hourBlock.appendChild(hourIcon);
  hourBlock.appendChild(hourValue);
  const arrow = document.createElement("div");
  arrow.className = "logo-counter-arrow";
  arrow.setAttribute("aria-hidden", "true");
  const bot = document.createElement("button");
  bot.className = "logo-counter-bot";
  bot.type = "button";
  bot.title = "Группа расширения";
  bot.addEventListener("click", (event) => {
    try {
      event.preventDefault();
      event.stopPropagation();
    } catch {}
    window.open("https://t.me/+Ribzkm0dh8wxOWQ6", "_blank", "noopener");
  });
  counter.appendChild(arrow);
  counter.appendChild(caption);
  counter.appendChild(totalRow);
  counter.appendChild(hourBlock);
  counter.appendChild(bot);
  box.appendChild(counter);
  const menu = document.createElement("div");
  menu.className = LOGO_WHITE_SQUARE_MENU_CLASS;
  menu.setAttribute("role", "region");
  menu.setAttribute("aria-hidden", "true");
  const menuStructure = createLogoWhiteSquareMenuSections();
  const profilesSectionData = createLogoWhiteSquareProfilesSection();
  if (menuStructure?.sections) {
    const columnsWrap = document.createElement("div");
    columnsWrap.className = "menu-columns";
    const { operatorInfo, balanceSummary, hourSection, totalSection, historySection } =
      menuStructure.sections;
    if (operatorInfo || hourSection || balanceSummary || profilesSectionData?.section) {
      const col = document.createElement("div");
      col.className = "menu-column menu-column-left";
      if (operatorInfo) {
        col.appendChild(operatorInfo);
      }
      if (balanceSummary) {
        col.appendChild(balanceSummary);
      }
      if (profilesSectionData?.section) {
        col.appendChild(profilesSectionData.section);
      }
      if (hourSection) {
        col.appendChild(hourSection);
      }
      columnsWrap.appendChild(col);
    }
    if (historySection) {
      const col = document.createElement("div");
      col.className = "menu-column menu-column-center";
      col.appendChild(historySection);
      columnsWrap.appendChild(col);
    }
    if (totalSection) {
      const col = document.createElement("div");
      col.className = "menu-column menu-column-right";
      col.appendChild(totalSection);
      columnsWrap.appendChild(col);
    }
    menu.appendChild(columnsWrap);
  }
  box.appendChild(menu);
  registerLogoWhiteSquareCounterRefs({
    counter,
    icon,
    total,
    totalRow,
    hourBlock,
    hourValue,
    arrow,
    ...(menuStructure?.refs || {}),
    ...(profilesSectionData?.refs || {}),
  });
  updateServerAccessUI();
  applyLogoWhiteSquareCachedBalanceValue();
  updateLogoWhiteSquareTexts();
  logoWhiteSquareEl = box;
  logoWhiteSquareMenuEl = menu;
  updateMonitorCounterUI();
  updateLogoSquareOperatorWaitState();
  return logoWhiteSquareEl;
}

function updateLogoWhiteSquareTexts() {
  if (!logoWhiteSquareCounterEls) return;
  const setText = (key, text) => {
    forEachLogoWhiteSquareCounterNode(key, (node) => {
      node.textContent = text;
    });
  };
  try {
    setText("chatsLabel", "");
    setText("mailsLabel", "");
    setText("hourChatsLabel", "");
    setText("hourMailsLabel", "");
    setText("totalSectionTitle", "За смену");
    setText("hourSectionTitle", t("hourlyCount") || "За час");
    setText("profilesSectionTitle", t("profilesTitle") || "Анкеты");
    setText("operatorInfoTitle", "Оператор");
    setText("operatorInfoLabel", t("operatorId") || "ID");
    const namePlaceholder = t("operatorNamePlaceholder") || "Имя";
    const nameSaveText = t("operatorNameSave") || "Сохранить";
    forEachLogoWhiteSquareCounterNode("operatorNameInput", (node) => {
      node.placeholder = namePlaceholder;
    });
    forEachLogoWhiteSquareCounterNode("operatorNameSave", (node) => {
      node.textContent = "";
      node.title = nameSaveText;
      node.setAttribute("aria-label", nameSaveText);
    });
  } catch {}
  renderLogoWhiteSquareProfilesList();
  if (operatorRatingPanelDom) {
    updateOperatorRatingPanelTexts(operatorRatingPanelDom);
  }
  if (operatorRatingPanelRoot) {
    renderOperatorRatingTables({ force: false }).catch(() => {});
  }
}

function setLogoWhiteSquareArrowExpanded(expanded) {
  const flag = !!expanded;
  forEachLogoWhiteSquareCounterNode("arrow", (node) => {
    if (!node?.classList) return;
    node.classList.toggle("rotated", flag);
  });
}


function ensureLogoWhiteSquarePlacement() {
  logoWhiteSquarePlacementPending = false;
  const target = findElementBySelectors(LOGO_WHITE_SQUARE_SELECTORS);
  if (isExtensionLocked()) {
    if (logoWhiteSquareHostEl) {
      logoWhiteSquareHostEl.classList.remove(LOGO_WHITE_SQUARE_HOST_CLASS);
      logoWhiteSquareHostEl = null;
    }
    if (logoWhiteSquareEl?.parentElement) {
      logoWhiteSquareEl.parentElement.removeChild(logoWhiteSquareEl);
    }
    closeLogoWhiteSquareExpandedPanel();
    return false;
  }
  if (!target) {
    if (logoWhiteSquareHostEl) {
      logoWhiteSquareHostEl.classList.remove(LOGO_WHITE_SQUARE_HOST_CLASS);
      logoWhiteSquareHostEl = null;
    }
    if (logoWhiteSquareEl?.parentElement) {
      logoWhiteSquareEl.parentElement.removeChild(logoWhiteSquareEl);
    }
    closeLogoWhiteSquareExpandedPanel();
    return false;
  }
  if (logoWhiteSquareHostEl && logoWhiteSquareHostEl !== target) {
    logoWhiteSquareHostEl.classList.remove(LOGO_WHITE_SQUARE_HOST_CLASS);
    if (logoWhiteSquareEl?.parentElement === logoWhiteSquareHostEl) {
      logoWhiteSquareHostEl.removeChild(logoWhiteSquareEl);
    }
  }
  const overlay = getLogoWhiteSquareElement();
  if (!overlay) return false;
  target.classList.add(LOGO_WHITE_SQUARE_HOST_CLASS);
  logoWhiteSquareHostEl = target;
  applyLogoWhiteSquareModalClass();
  if (overlay.parentElement !== target) {
    target.insertBefore(overlay, target.firstChild || null);
  }
  attachLogoWhiteSquareMenuHandlers();
  return true;
}

function attachLogoWhiteSquareMenuHandlers() {
  if (!logoWhiteSquareEl || logoWhiteSquareEl.dataset.menuInit === "1") return;
  logoWhiteSquareEl.dataset.menuInit = "1";
  logoWhiteSquareEl.addEventListener("click", (ev) => {
    if (isExtensionLocked()) {
      ev.preventDefault();
      ev.stopPropagation();
      requireExtensionUnlock();
      return;
    }
    if (isUiBlockedByMissingOperatorId()) {
      ev.preventDefault();
      ev.stopPropagation();
      openOperatorWaitModal();
      return;
    }
    const menuClicked =
      logoWhiteSquareMenuEl &&
      (logoWhiteSquareMenuEl === ev.target ||
        logoWhiteSquareMenuEl.contains(ev.target));
    if (menuClicked && !logoWhiteSquareExpandedOpen) return;
    ev.preventDefault();
    ev.stopPropagation();
    toggleLogoWhiteSquareExpandedPanel();
  });
}

function applyLogoWhiteSquareModalClass() {
  if (!logoWhiteSquareHostEl) return;
  logoWhiteSquareHostEl.classList.toggle(
    LOGO_WHITE_SQUARE_MODAL_CLASS,
    !!logoWhiteSquareModalState
  );
}

function setLogoWhiteSquareModalState(active) {
  const normalized = !!active;
  if (logoWhiteSquareModalState === normalized) {
    if (normalized) applyLogoWhiteSquareModalClass();
    return;
  }
  logoWhiteSquareModalState = normalized;
  applyLogoWhiteSquareModalClass();
  if (normalized) closeLogoWhiteSquareExpandedPanel();
}

function toggleLogoWhiteSquareExpandedPanel(forceOpen) {
  if (isExtensionLocked()) {
    requireExtensionUnlock();
    return;
  }
  if (requireOperatorIdReady({ silent: true })) return;
  const nextOpen =
    typeof forceOpen === "boolean" ? forceOpen : !logoWhiteSquareExpandedOpen;
  if (nextOpen) {
    openLogoWhiteSquareExpandedPanel();
  } else {
    closeLogoWhiteSquareExpandedPanel();
  }
}

function getLogoWhiteSquareExpandedElement() {
  if (logoWhiteSquareExpandedEl) return logoWhiteSquareExpandedEl;
  if (!document || !document.body) return null;
  const panel = document.createElement("div");
  panel.className = LOGO_WHITE_SQUARE_EXPANDED_CLASS;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-hidden", "true");
  const content = document.createElement("div");
  content.className = `${LOGO_WHITE_SQUARE_MENU_CLASS} open ${LOGO_WHITE_SQUARE_EXPANDED_CONTENT_CLASS}`;
  const menuStructure = createLogoWhiteSquareMenuSections();
  const expandedSections = menuStructure?.sections;
  const profilesSectionData = createLogoWhiteSquareProfilesSection();
  if (expandedSections) {
    relocateExpandedMenuInfoList(expandedSections, menuStructure?.refs);
    suppressExpandedHourSection(expandedSections, menuStructure?.refs);
    const columnsWrap = document.createElement("div");
    columnsWrap.className = "menu-columns";
    const { operatorInfo, balanceSummary, hourSection, totalSection, historySection } =
      expandedSections;
    if (operatorInfo || balanceSummary || hourSection || profilesSectionData?.section) {
      const col = document.createElement("div");
      col.className = "menu-column menu-column-left";
      if (operatorInfo) {
        col.appendChild(operatorInfo);
      }
      if (balanceSummary) {
        col.appendChild(balanceSummary);
      }
      if (profilesSectionData?.section) {
        col.appendChild(profilesSectionData.section);
      }
      if (hourSection) {
        col.appendChild(hourSection);
      }
      columnsWrap.appendChild(col);
    }
    if (historySection) {
      const col = document.createElement("div");
      col.className = "menu-column menu-column-center";
      col.appendChild(historySection);
      columnsWrap.appendChild(col);
    }
    if (totalSection) {
      const col = document.createElement("div");
      col.className = "menu-column menu-column-right";
      col.appendChild(totalSection);
      columnsWrap.appendChild(col);
    }
    const chartCol = document.createElement("div");
    chartCol.className = "menu-column menu-column-chart";
    initOperatorRatingPanel(chartCol);
    columnsWrap.appendChild(chartCol);
    content.appendChild(columnsWrap);
  }
  const combinedRefs = {
    ...(menuStructure?.refs || {}),
    ...(profilesSectionData?.refs || {}),
  };
  registerLogoWhiteSquareCounterRefs(combinedRefs);
  updateServerAccessUI();
  renderLogoWhiteSquareProfilesList();
  applyLogoWhiteSquareCachedBalanceValue();
  panel.appendChild(content);
  logoWhiteSquareExpandedEl = panel;
  updateLogoWhiteSquareTexts();
  updateMonitorCounterUI();
  return panel;
}

function getLogoWhiteSquareExpandedWrapper() {
  if (logoWhiteSquareExpandedWrapperEl) return logoWhiteSquareExpandedWrapperEl;
  if (!document || !document.body) return null;
  const wrapper = document.createElement("div");
  wrapper.className = LOGO_WHITE_SQUARE_EXPANDED_WRAPPER_CLASS;
  logoWhiteSquareExpandedWrapperEl = wrapper;
  return wrapper;
}

function openLogoWhiteSquareExpandedPanel() {
  if (isExtensionLocked()) {
    requireExtensionUnlock();
    return;
  }
  if (requireOperatorIdReady({ silent: true })) return;
  const panel = getLogoWhiteSquareExpandedElement();
  const wrapper = getLogoWhiteSquareExpandedWrapper();
  if (!panel) return;
  if (!wrapper) return;
  if (panel.parentElement !== wrapper) {
    while (wrapper.firstChild) {
      wrapper.removeChild(wrapper.firstChild);
    }
    wrapper.appendChild(panel);
  }
  const placement = getLogoWhiteSquareExpandedPlacement();
  if (!placement?.parent || !placement.leftChild) return;
  const { parent, leftChild, rightChild } = placement;
  const areaSize = getLogoWhiteSquareExpandedAreaSize(
    parent,
    leftChild,
    rightChild
  );
  const hiddenNodes = rightChild
    ? hideLogoWhiteSquareBetweenNodes(parent, leftChild, rightChild)
    : [];
  logoWhiteSquareExpandedHiddenNodes = hiddenNodes;
  logoWhiteSquareExpandedParent = parent;
  if (areaSize?.width) {
    const width = Math.max(320, areaSize.width);
    const widthPx = `${width}px`;
    wrapper.style.flex = "0 0 auto";
    wrapper.style.width = widthPx;
    wrapper.style.minWidth = widthPx;
  } else {
    wrapper.style.flex = "0 0 auto";
    wrapper.style.width = "";
    wrapper.style.minWidth = "";
  }
  if (areaSize?.height) {
    const height = Math.max(320, areaSize.height);
    const heightPx = `${height}px`;
    wrapper.style.minHeight = heightPx;
    wrapper.style.height = heightPx;
    panel.style.minHeight = "100%";
    panel.style.height = "100%";
  } else {
    wrapper.style.minHeight = "";
    wrapper.style.height = "";
    panel.style.minHeight = "";
    panel.style.height = "";
  }
  if (rightChild) {
    parent.insertBefore(wrapper, rightChild);
  } else {
    parent.appendChild(wrapper);
  }
  logoWhiteSquareExpandedOpen = true;
  logoWhiteSquareMenuEl?.setAttribute("aria-hidden", "true");
  setLogoWhiteSquareArrowExpanded(true);
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  updateServerAccessUI();
  attachLogoWhiteSquareExpandedHandlers();
  renderOperatorRatingTables({ force: false }).catch(() => {});
  scheduleOperatorRatingHourlyRefresh();
  try {
    (async () => {
      try {
        const items = Array.isArray(logoWhiteSquareProfilesState.items)
          ? logoWhiteSquareProfilesState.items
          : [];
        const ids = items
          .map((item) => normalizeProfileExternalId(item.externalId))
          .filter(Boolean);
        if (ids.length) {
          await fetchProfileShiftStatsBatch(ids);
        }
      } catch {}
      try {
        await fetchOperatorShiftSummary();
        updateOperatorNameUI();
      } catch {}
    })();
  } catch {}
}

function closeLogoWhiteSquareExpandedPanel() {
  if (!logoWhiteSquareExpandedEl || !logoWhiteSquareExpandedOpen) return;
  clearOperatorRatingHourlyRefresh();
  logoWhiteSquareExpandedOpen = false;
  setLogoWhiteSquareArrowExpanded(false);
  logoWhiteSquareExpandedEl.classList.remove("open");
  logoWhiteSquareExpandedEl.setAttribute("aria-hidden", "true");
  if (
    logoWhiteSquareExpandedParent &&
    logoWhiteSquareExpandedWrapperEl?.parentElement === logoWhiteSquareExpandedParent
  ) {
    logoWhiteSquareExpandedParent.removeChild(logoWhiteSquareExpandedWrapperEl);
  }
  if (logoWhiteSquareExpandedWrapperEl) {
    logoWhiteSquareExpandedWrapperEl.style.flex = "";
    logoWhiteSquareExpandedWrapperEl.style.width = "";
    logoWhiteSquareExpandedWrapperEl.style.minWidth = "";
    logoWhiteSquareExpandedWrapperEl.style.minHeight = "";
    logoWhiteSquareExpandedWrapperEl.style.height = "";
  }
  if (logoWhiteSquareExpandedEl) {
    logoWhiteSquareExpandedEl.style.minHeight = "";
    logoWhiteSquareExpandedEl.style.height = "";
  }
  if (Array.isArray(logoWhiteSquareExpandedHiddenNodes)) {
    logoWhiteSquareExpandedHiddenNodes.forEach((node) => {
      try {
        node.classList.remove(LOGO_WHITE_SQUARE_EXPANDED_HIDDEN_CLASS);
      } catch {}
    });
  }
  logoWhiteSquareExpandedHiddenNodes = null;
  logoWhiteSquareExpandedParent = null;
  detachLogoWhiteSquareExpandedHandlers();
}

function attachLogoWhiteSquareExpandedHandlers() {
  if (!logoWhiteSquareExpandedDocHandler) {
    logoWhiteSquareExpandedDocHandler = (ev) => {
      if (!logoWhiteSquareExpandedEl || !logoWhiteSquareExpandedOpen) return;
      const container =
        logoWhiteSquareExpandedWrapperEl || logoWhiteSquareExpandedEl;
      const baseTrigger = logoWhiteSquareEl;
      const insideExpanded =
        container?.contains(ev.target) || logoWhiteSquareExpandedEl.contains(ev.target);
      const insideTrigger = baseTrigger?.contains(ev.target);
      const drawer = ui?.drawer;
      let insideDrawer = false;
      if (drawer) {
        const path = typeof ev.composedPath === "function" ? ev.composedPath() : null;
        insideDrawer = path ? path.includes(drawer) : drawer.contains(ev.target);
      }
      if (!insideExpanded && !insideTrigger && !insideDrawer) {
        closeLogoWhiteSquareExpandedPanel();
      }
    };
    document.addEventListener("click", logoWhiteSquareExpandedDocHandler, true);
  }
  if (!logoWhiteSquareExpandedKeyHandler) {
    logoWhiteSquareExpandedKeyHandler = (ev) => {
      if (ev?.key === "Escape") {
        closeLogoWhiteSquareExpandedPanel();
      }
    };
    document.addEventListener("keydown", logoWhiteSquareExpandedKeyHandler, true);
  }
}

function detachLogoWhiteSquareExpandedHandlers() {
  if (logoWhiteSquareExpandedDocHandler) {
    document.removeEventListener("click", logoWhiteSquareExpandedDocHandler, true);
    logoWhiteSquareExpandedDocHandler = null;
  }
  if (logoWhiteSquareExpandedKeyHandler) {
    document.removeEventListener("keydown", logoWhiteSquareExpandedKeyHandler, true);
    logoWhiteSquareExpandedKeyHandler = null;
  }
}


function scheduleLogoWhiteSquarePlacement() {
  if (logoWhiteSquarePlacementPending) return;
  logoWhiteSquarePlacementPending = true;
  const raf =
    (typeof window !== "undefined" && window.requestAnimationFrame) ||
    ((cb) => setTimeout(cb, 0));
  raf(() => ensureLogoWhiteSquarePlacement());
}

function startLogoWhiteSquareObserver() {
  if (logoWhiteSquareObserver || !document.body) return false;
  logoWhiteSquareObserver = new MutationObserver(() => {
    scheduleLogoWhiteSquarePlacement();
  });
  logoWhiteSquareObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
  return true;
}

function initLogoWhiteSquare() {
  if (logoWhiteSquareInitialized) {
    scheduleLogoWhiteSquarePlacement();
    return;
  }
  logoWhiteSquareInitialized = true;
  scheduleLogoWhiteSquarePlacement();
  try {
    if (!startLogoWhiteSquareObserver()) {
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          startLogoWhiteSquareObserver();
          scheduleLogoWhiteSquarePlacement();
        },
        { once: true }
      );
    }
  } catch {}
  updateOperatorInfoUI();
}

function normalizeProfileExternalId(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  return digits || raw;
}

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function decodeJwt(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

function extractFirstArrayCandidate(payload) {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  const candidates = [
    payload.items,
    payload.list,
    payload.data,
    payload.response?.items,
    payload.response?.data,
    payload.response,
    payload.profiles,
    payload.entries,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate) && candidate.length) return candidate;
  }
  return Array.isArray(payload) ? payload : [];
}

function buildProfileEntry(raw) {
  if (!raw || typeof raw !== "object") return null;
  const externalId =
    normalizeProfileExternalId(
      raw.external_id ||
        raw.externalId ||
        raw.woman_external_id ||
        raw.womanExternalId ||
        raw.user_external_id
    ) || "";
  if (!externalId) return null;
  return {
    externalId,
    operatorId:
      toNumber(raw.operator_id) ||
      toNumber(raw.operatorId) ||
      toNumber(raw.operator?.id) ||
      toNumber(raw.operator?.operator_id),
    agencyId:
      toNumber(raw.agency_id) ||
      toNumber(raw.agencyId) ||
      toNumber(raw.agency?.id),
    womanId:
      toNumber(raw.id) ||
      toNumber(raw.woman_id) ||
      toNumber(raw.womanId) ||
      toNumber(raw.client_id) ||
      toNumber(raw.user_id),
    operatorProfileId:
      toNumber(raw.operator_external_id) ||
      toNumber(raw.operatorExternalId) ||
      toNumber(raw.operator_profile_id) ||
      toNumber(raw.operatorProfileId),
    raw,
  };
}

function extractProfilesList(payload) {
  const items = extractFirstArrayCandidate(payload);
  return items
    .map((entry) => buildProfileEntry(entry))
    .filter(Boolean);
}

function selectInviteMetas(payload) {
  const entries = extractFirstArrayCandidate(payload);
  if (!entries.length) return [];
  return entries
    .map((invite) => {
      if (!invite || typeof invite !== "object") return null;
      const messageContent =
        typeof invite.message_content === "string"
          ? invite.message_content.trim()
          : "";
      const letterAttachmentLink =
        typeof invite.link === "string" ? invite.link.trim() : "";
      return {
        inviteId: toNumber(invite.invite_id) || toNumber(invite.id),
        operatorId:
          toNumber(invite.operator_id) ||
          toNumber(invite.operatorId) ||
          toNumber(invite.operator?.id),
        agencyId:
          toNumber(invite.agency_id) ||
          toNumber(invite.agencyId) ||
          toNumber(invite.agency?.id),
        womanId:
          toNumber(invite.woman_id) ||
          toNumber(invite.womanId) ||
          toNumber(invite.user_id),
        attachments: normalizeAttachments(invite.attachments),
        messageContent,
        letterAttachmentLink,
        raw: invite,
      };
    })
    .filter(Boolean);
}

function normalizeAttachments(raw) {
  if (!raw) return [];
  const source = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object"
    ? Object.values(raw)
    : [];
  return source
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const link = String(
        item.link ||
          item.url ||
          item.attachment_link ||
          item.attachmentLink ||
          item.href ||
          ""
      ).trim();
      if (!link) return null;
      const type =
        item.attachment_type ||
        item.attachmentType ||
        item.type ||
        "SENT_IMAGE";
      return {
        link,
        attachment_type: type,
      };
    })
    .filter(Boolean);
}

function storeInvitePayload(externalId, mailType, payload) {
  try {
    const key = `${externalId}:${mailType}`;
    profileSwitchMemory.invitePayloads.set(key, payload);
  } catch {}
}

function rememberSenderResponse(externalId, senderType, response) {
  try {
    profileSwitchMemory.senderResponses.push({
      ts: Date.now(),
      externalId,
      senderType,
      response,
    });
  } catch {}
}

function updateProfileSwitchButtonState() {
  if (!ui?.profileSwitch) return;
  if (profileSwitchState.busy) {
    ui.profileSwitch.disabled = true;
    return;
  }
  const now = Date.now();
  const locked = profileSwitchState.lockUntil > now;
  ui.profileSwitch.disabled = locked;
  if (locked) {
    const remaining = Math.max(0, profileSwitchState.lockUntil - now);
    const minutes = Math.ceil(remaining / 60000);
    ui.profileSwitch.title = `Переключатель недоступен ~${minutes} мин`;
    if (profileSwitchState.lockTimer) clearTimeout(profileSwitchState.lockTimer);
    profileSwitchState.lockTimer = setTimeout(() => {
      profileSwitchState.lockTimer = null;
      updateProfileSwitchButtonState();
    }, remaining + 50);
  } else {
    ui.profileSwitch.title = "Переключить профили";
    if (profileSwitchState.lockTimer) {
      clearTimeout(profileSwitchState.lockTimer);
      profileSwitchState.lockTimer = null;
    }
  }
}

function setProfileSwitchLoading(loading) {
  if (!ui?.profileSwitch) return;
  ui.profileSwitch.classList.toggle("loading", !!loading);
  if (loading) {
    ui.profileSwitch.setAttribute("aria-busy", "true");
    ui.profileSwitch.disabled = true;
  } else {
    ui.profileSwitch.removeAttribute("aria-busy");
    updateProfileSwitchButtonState();
  }
}

function lockProfileSwitchTemporarily() {
  profileSwitchState.lockUntil = Date.now() + PROFILE_SWITCH_COOLDOWN_MS;
  updateProfileSwitchButtonState();
}

async function profileSwitchRequest({ url, method = "GET", token, body }) {
  if (!token) throw new Error("Не найден токен для запроса");
  const headers = {
    accept: "application/json, text/plain, */*",
    Authorization: `Bearer ${token}`,
  };
  const options = {
    method,
    headers,
    credentials: "include",
  };
  if (method !== "GET") {
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    if (isFormData) {
      delete headers["Content-Type"];
      options.body = body;
    } else if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      options.body = typeof body === "string" ? body : JSON.stringify(body);
    } else {
      headers["Content-Type"] = "application/json";
    }
  }
  let response;
  try {
    response = await fetch(url, options);
  } catch (err) {
    throw new Error(err?.message || "Ошибка сети");
  }
  if (!response?.ok) {
    throw new Error(`HTTP ${response?.status} для ${url}`);
  }
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function requestProfilesPayload(token) {
  const payload = await profileSwitchRequest({
    url: PROFILE_SWITCH_ENDPOINTS.profiles,
    token,
  });
  profileSwitchMemory.profilesPayload = payload;
  return payload;
}

function deriveOperatorId(profiles, token) {
  const firstWithId = profiles.find((p) => Number.isFinite(p.operatorId));
  if (firstWithId) return firstWithId.operatorId;
  const payload = decodeJwt(token);
  const fromToken =
    toNumber(payload?.operator_id) ||
    toNumber(payload?.id) ||
    toNumber(payload?.operatorId);
  if (Number.isFinite(fromToken)) return fromToken;
  const fallback = profiles.find(
    (p) => Number.isFinite(p.raw?.operator_id) || Number.isFinite(p.raw?.operatorId)
  );
  return (
    toNumber(fallback?.raw?.operator_id) ||
    toNumber(fallback?.raw?.operatorId) ||
    null
  );
}

function deriveSetOnlineExternalId() {
  return -1;
}

async function requestProfileOnline(token, profiles) {
  const operatorId = deriveOperatorId(profiles, token);
  if (!operatorId) {
    throw new Error("Не удалось определить operator_id");
  }
  const externalId = deriveSetOnlineExternalId(profiles);
  const body = {
    external_id: Number.isFinite(externalId) ? externalId : -1,
    operator_id: operatorId,
    status: 1,
  };
  await profileSwitchRequest({
    url: PROFILE_SWITCH_ENDPOINTS.setOnline,
    method: "POST",
    token,
    body,
  });
  return operatorId;
}

async function requestInviteList({ token, externalId, mailType }) {
  const url = `${PROFILE_SWITCH_ENDPOINTS.inviteList}?external_id=${encodeURIComponent(
    externalId
  )}&mail_type=${encodeURIComponent(mailType)}`;
  const payload = await profileSwitchRequest({ url, token });
  storeInvitePayload(externalId, mailType, payload);
  return payload;
}

function normalizeOperatorId(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  if (num <= 0) return null;
  return Math.trunc(num);
}

function findOperatorIdInValue(value, depth = 0) {
  if (depth > 4) return null;
  if (value === null || value === undefined) return null;
  if (typeof value === "number" || typeof value === "string") {
    return normalizeOperatorId(value);
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findOperatorIdInValue(item, depth + 1);
      if (found) return found;
    }
    return null;
  }
  if (typeof value === "object") {
    const direct =
      normalizeOperatorId(value.operator_id) ||
      normalizeOperatorId(value.operatorId);
    if (direct) return direct;
    const keys = Object.keys(value);
    for (const key of keys) {
      const found = findOperatorIdInValue(value[key], depth + 1);
      if (found) return found;
    }
  }
  return null;
}

function extractOperatorIdFromSenderListPayload(payload) {
  if (!payload) return null;
  if (payload.response !== undefined) {
    const found = findOperatorIdInValue(payload.response, 0);
    if (found) return found;
  }
  if (payload.data !== undefined) {
    const found = findOperatorIdInValue(payload.data, 0);
    if (found) return found;
  }
  return findOperatorIdInValue(payload, 0);
}

function updateOperatorInfoUI() {
  const operatorId = operatorInfoState.operatorId;
  const text = Number.isFinite(operatorId) ? String(operatorId) : "—";
  forEachLogoWhiteSquareCounterNode("operatorInfoValue", (node) => {
    node.textContent = text;
  });
  updateOperatorNameUI();
}

function activateAdminReadOnlyMode() {
  if (adminReadOnlyLatched) return;
  adminReadOnlyLatched = true;
  try {
    window?.sessionStorage?.setItem?.(ADMIN_READONLY_LATCH_STORAGE_KEY, "1");
  } catch {}
  try {
    profileShiftDeltaQueue = [];
    persistProfileShiftDeltaQueue();
  } catch {}
  try {
    operatorShiftSnapshotQueue = [];
    persistOperatorShiftSnapshotQueue();
  } catch {}
}

function detectSuperAdminMenuPresence() {
  try {
    const hasSuperRoot = !!document.querySelector(
      [
        '[class*="SuperOperatorsSelect_options_selectors_container__"]',
        '[class*="SuperOperatorsSelect_options_list__"]',
        '[class*="SuperOperatorsSelect_shift_filter_options__"]',
      ].join(",")
    );
    if (!hasSuperRoot) return false;
    const hasMainComboInput = !!document.querySelector("input#combo-box[role=\"combobox\"]");
    const hasSearchOperatorLabel = Array.from(
      document.querySelectorAll("label[for=\"combo-box\"]")
    ).some((node) =>
      /search\s*operator\s*id/i.test(String(node?.textContent || "").trim())
    );
    return hasMainComboInput || hasSearchOperatorLabel;
  } catch {
    return false;
  }
}

function isAdminUniversalProfileContainerPresent() {
  if (adminReadOnlyLatched) return true;
  try {
    const hasSuperAdminMenu = detectSuperAdminMenuPresence();
    const hasLegacyAdminContainer = !!document.querySelector(
      '[class*="styles_options_selectors_container__"]'
    );
    const hasGenericSelectorsContainer = !!document.querySelector(
      '[class*="options_selectors_container__"]'
    );
    const isAdmin =
      hasSuperAdminMenu || hasLegacyAdminContainer || hasGenericSelectorsContainer;
    if (isAdmin) {
      activateAdminReadOnlyMode();
      return true;
    }
    return false;
  } catch {
    return adminReadOnlyLatched;
  }
}

function setOperatorInfoId(operatorId) {
  operatorInfoState.operatorId = normalizeOperatorId(operatorId);
  operatorInfoState.operatorName = "";
  operatorInfoState.operatorNameUpdatedAt = 0;
  operatorHourlyBalanceMap = new Map();
  operatorHourlyBalanceStartMap = new Map();
  operatorHourlyActionsMap = new Map();
  operatorInfoState.error = "";
  updateOperatorInfoUI();
  try {
    setTimeout(updateOperatorInfoUI, 0);
  } catch {}
  setOperatorIdAvailability(hasValidOperatorId(), "setOperatorInfoId");
  try {
    fetchOperatorShiftSummary();
  } catch {}
}

async function sendSenderPayload({ token, body, externalId, senderType }) {
  const payloadBody =
    senderType === "Chat" ? createSenderFormData(body) : body;
  const response = await profileSwitchRequest({
    url: PROFILE_SWITCH_ENDPOINTS.sender,
    method: "POST",
    token,
    body: payloadBody,
  });
  rememberSenderResponse(externalId, senderType, response);
  return response;
}

function buildSenderPayload({
  profile,
  inviteMeta,
  token,
  senderType,
  message,
  attachments,
}) {
  const normalizedMessage = typeof message === "string" ? message.trim() : "";
  const normalizedAttachments = Array.isArray(attachments) ? [...attachments] : [];
  const operatorId =
    toNumber(inviteMeta?.operatorId) ||
    toNumber(profile?.operatorId) ||
    toNumber(profile?.raw?.operator_id);
  const agencyId =
    toNumber(inviteMeta?.agencyId) ||
    toNumber(profile?.agencyId) ||
    toNumber(profile?.raw?.agency_id);
  const womanId = toNumber(profile?.womanId) || toNumber(profile?.raw?.woman_id);
  const inviteId = toNumber(inviteMeta?.inviteId);
  if (!operatorId) throw new Error(`Не найден operator_id для ${profile.externalId}`);
  if (!agencyId) throw new Error(`Не найден agency_id для ${profile.externalId}`);
  if (!womanId) throw new Error(`Не найден woman_id для ${profile.externalId}`);
  if (!inviteId) throw new Error(`Не найден invite_id для ${profile.externalId}`);
  if (!normalizedMessage) {
    throw new Error(`Не найден текст сообщения для ${profile.externalId}`);
  }
  const payload = {
    operator_id: operatorId,
    bearer: token,
    agency_id: agencyId,
    woman_id: womanId,
    woman_external_id: profile.externalId,
    sender_type: senderType,
    message_type: "SENT_TEXT",
    message_content: normalizedMessage,
    audience: "online",
    exclude_audience: null,
    invite_id: inviteId,
  };
  if (
    senderType === "Letter" &&
    !normalizedAttachments.length &&
    typeof inviteMeta?.letterAttachmentLink === "string" &&
    inviteMeta.letterAttachmentLink
  ) {
    normalizedAttachments.push({
      link: inviteMeta.letterAttachmentLink,
      attachment_type: "SENT_IMAGE",
    });
  }
  if (normalizedAttachments.length || senderType === "Letter") {
    payload.attachments_content = normalizedAttachments;
  }
  return payload;
}

function createSenderFormData(payload) {
  const form = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value === undefined) return;
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined) return;
        const normalized =
          item === null || typeof item !== "object"
            ? item
            : JSON.stringify(item);
        form.append(
          key,
          normalized === null ? "null" : String(normalized)
        );
      });
      return;
    }
    if (value && typeof value === "object") {
      form.append(key, JSON.stringify(value));
      return;
    }
    const normalized = value === null ? "null" : String(value);
    form.append(key, normalized);
  });
  return form;
}

async function processProfileEntry({ profile, token }) {
  const externalId = profile.externalId;
  const chatInvitePayload = await requestInviteList({
    token,
    externalId,
    mailType: "Chat",
  });
  const letterInvitePayloadPromise = requestInviteList({
    token,
    externalId,
    mailType: "Letter",
  });
  const chatMetas = selectInviteMetas(chatInvitePayload);
  if (!chatMetas.length) {
    LOG.warn(`Profile ${externalId}: нет приглашений Chat, пропускаем профиль`);
    return;
  }
  const letterInvitePayload = await letterInvitePayloadPromise;
  const letterMetas = selectInviteMetas(letterInvitePayload);
  if (!letterMetas.length) {
    LOG.warn(`Profile ${externalId}: нет приглашений Letter, пропускаем профиль`);
    return;
  }
  const rounds = Math.max(chatMetas.length, letterMetas.length);
  for (let round = 0; round < rounds; round++) {
    const chatMeta = chatMetas[round];
    if (chatMeta) {
      if (!chatMeta.messageContent) {
        throw new Error(`Нет текста сообщения Chat для ${externalId}`);
      }
      const chatPayload = buildSenderPayload({
        profile,
        inviteMeta: chatMeta,
        token,
        senderType: "Chat",
        message: chatMeta.messageContent,
      });
      await sendSenderPayload({
        token,
        body: chatPayload,
        externalId,
        senderType: "Chat",
      });
    }

    const letterMeta = letterMetas[round];
    if (letterMeta) {
      if (!letterMeta.messageContent) {
        throw new Error(`Нет текста сообщения Letter для ${externalId}`);
      }
      const letterPayload = buildSenderPayload({
        profile,
        inviteMeta: letterMeta,
        token,
        senderType: "Letter",
        message: letterMeta.messageContent,
        attachments: letterMeta.attachments,
      });
      await sendSenderPayload({
        token,
        body: letterPayload,
        externalId,
        senderType: "Letter",
      });
    }
  }
}

async function runProfileSwitchFlow() {
  const module = await loadUserInfoModule();
  const getToken = module?.getAuthToken;
  const token = typeof getToken === "function" ? getToken() : "";
  if (!token) throw new Error("Не найден токен");
  const profilesPayload = await requestProfilesPayload(token);
  const profiles = extractProfilesList(profilesPayload);
  if (!profiles.length) {
    throw new Error("Профили не найдены");
  }
  const operatorId = await requestProfileOnline(token, profiles);
  profiles.forEach((entry) => {
    if (!Number.isFinite(entry.operatorId)) {
      entry.operatorId = operatorId;
    }
  });
  LOG.log("Profile switch started", {
    profileCount: profiles.length,
    operatorId,
  });
  for (const profile of profiles) {
    await processProfileEntry({ profile, token });
  }
}

async function onProfileSwitchClick() {
  if (profileSwitchState.busy) return;
  if (ui?.profileSwitch && ui.profileSwitch.disabled && !ui.profileSwitch.classList.contains("loading")) {
    return;
  }
  profileSwitchState.busy = true;
  setProfileSwitchLoading(true);
  try {
    await runProfileSwitchFlow();
    lockProfileSwitchTemporarily();
  } catch (err) {
    LOG.error("Profile switch failed", err);
    alert(err?.message || "Не удалось выполнить переключение");
  } finally {
    profileSwitchState.busy = false;
    setProfileSwitchLoading(false);
  }
}

function normalizeMonitorCountsPayload(raw) {
  if (!raw || typeof raw !== "object") {
    return {
      chat: 0,
      mail: 0,
      hourStart: null,
      hourTotal: 0,
      hourChat: 0,
      hourMail: 0,
      hourHistory: [],
    };
  }
  const chat = Number.isFinite(Number(raw.chat)) ? Number(raw.chat) : 0;
  const mail = Number.isFinite(Number(raw.mail)) ? Number(raw.mail) : 0;
  const hourStartRaw = Number(raw.hourStart);
  const hourStart = Number.isFinite(hourStartRaw) ? hourStartRaw : null;
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
    chat,
    mail,
    hourStart,
    hourTotal,
    hourChat,
    hourMail,
    hourHistory,
    profileStats,
  };
}

function clearMonitorHourlyRefresh() {
  if (!monitorHourlyTimerId) return;
  clearTimeout(monitorHourlyTimerId);
  monitorHourlyTimerId = null;
}

function scheduleMonitorHourlyRefresh() {
  clearMonitorHourlyRefresh();
  const start = Number(monitorCounterState.counts.hourStart);
  if (!Number.isFinite(start) || start <= 0) return;
  const intervalMs = 60 * 60 * 1000;
  const next = start + intervalMs;
  const now = Date.now();
  let delay = next - now;
  if (!Number.isFinite(delay)) return;
  if (delay < 0) delay = 0;
  monitorHourlyTimerId = setTimeout(() => {
    monitorHourlyTimerId = null;
    requestMonitorCounts();
  }, delay + 50);
}

async function resetMonitorCountersForNewDay() {
  try {
    const resp = await chrome.runtime.sendMessage({ type: "monitor:resetDay" });
    if (resp?.ok && resp.counts) {
      setMonitorCounterCounts(resp.counts);
      return;
    }
  } catch (err) {
    if (!isExtCtxInvalid(err)) {
      LOG.warn("resetMonitorCountersForNewDay failed", err);
    }
  }
  try {
    setMonitorCounterCounts({
      chat: 0,
      mail: 0,
      hourStart: Date.now(),
      hourTotal: 0,
      hourChat: 0,
      hourMail: 0,
      hourHistory: [],
      hourRecord: HOURLY_GOAL_MIN,
    });
  } catch {}
}

function normalizeMonitorGoalTarget(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < MONITOR_GOAL_INCREMENT) {
    return MONITOR_GOAL_INCREMENT;
  }
  const steps = Math.ceil(parsed / MONITOR_GOAL_INCREMENT);
  return steps * MONITOR_GOAL_INCREMENT;
}

function setMonitorGoalTarget(goalValue, options = {}) {
  const { skipPersist = false } = options;
  const next = normalizeMonitorGoalTarget(goalValue);
  if (monitorCounterState.goal === next) return next;
  monitorCounterState.goal = next;
  updateMonitorCounterUI();
  if (!skipPersist) {
    setStore({ [MONITOR_GOAL_STORAGE_KEY]: next });
  }
  return next;
}

function maybeAdvanceMonitorGoal(total) {
  const value = Number(total);
  if (!Number.isFinite(value) || value < 0) return;
  const step = MONITOR_GOAL_INCREMENT;
  let goal = monitorCounterState.goal || MONITOR_GOAL_DEFAULT;
  let changed = false;
  while (value >= goal) {
    goal += step;
    changed = true;
  }
  if (changed) {
    setMonitorGoalTarget(goal);
  }
}

async function loadMonitorGoalTarget() {
  try {
    const store = await getStore([MONITOR_GOAL_STORAGE_KEY]);
    if (
      store &&
      Object.prototype.hasOwnProperty.call(store, MONITOR_GOAL_STORAGE_KEY)
    ) {
      setMonitorGoalTarget(store[MONITOR_GOAL_STORAGE_KEY], {
        skipPersist: true,
      });
      return;
    }
  } catch {}
  setMonitorGoalTarget(monitorCounterState.goal || MONITOR_GOAL_DEFAULT, {
    skipPersist: true,
  });
}

function formatHourWindow(startMs) {
  if (!Number.isFinite(startMs) || startMs <= 0) return "";
  const INTERVAL = 60 * 60 * 1000;
  const start = new Date(startMs);
  const end = new Date(startMs + INTERVAL);
  return `${formatHourTime(start)} – ${formatHourTime(end)}`;
}

function formatHourTime(date) {
  if (!(date instanceof Date)) return "";
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function updateMonitorCounterUI() {
  if (isUiBlockedByMissingOperatorId()) {
    updateLogoSquareOperatorWaitState();
    return;
  }
  const localChat = monitorCounterState.counts.chat || 0;
  const localMail = monitorCounterState.counts.mail || 0;
  const localTotal = localChat + localMail;
  const serverSummary = operatorShiftSummaryCache;
  const serverOk =
    serverSummary &&
    String(serverSummary.operator_id || serverSummary.operatorId || "") ===
      String(operatorInfoState.operatorId || "") &&
    String(serverSummary.day_key || serverSummary.dayKey || "") === getKyivDayKey();
  const serverChat = serverOk ? Number(serverSummary.chat_count) || 0 : 0;
  const serverMail = serverOk ? Number(serverSummary.mail_count) || 0 : 0;
  const serverTotal = serverOk
    ? Number(serverSummary.actions_total) || serverChat + serverMail
    : 0;
  const chat = serverOk ? Math.max(serverChat, localChat) : localChat;
  const mail = serverOk ? Math.max(serverMail, localMail) : localMail;
  const total = serverOk ? Math.max(serverTotal, localTotal) : localTotal;
  const goal = monitorCounterState.goal || MONITOR_GOAL_DEFAULT;
  const hourGoal = monitorCounterState.counts.hourRecord || HOURLY_GOAL_MIN;
  const localHourChat = Number(monitorCounterState.counts.hourChat) || 0;
  const localHourMail = Number(monitorCounterState.counts.hourMail) || 0;
  const serverHourChat = serverOk ? Number(serverSummary.hour_chat_count) || 0 : 0;
  const serverHourMail = serverOk ? Number(serverSummary.hour_mail_count) || 0 : 0;
  const hourChat = serverOk ? Math.max(serverHourChat, localHourChat) : localHourChat;
  const hourMail = serverOk ? Math.max(serverHourMail, localHourMail) : localHourMail;
  const totalLabel = `${total} / ${goal}`;
  forEachLogoWhiteSquareCounterNode("total", (node) => {
    node.textContent = totalLabel;
    node.title = `${t("totalSent") || "Всего отправлено"}: ${totalLabel}`;
  });
  forEachLogoWhiteSquareCounterNode("chatsValue", (node) => {
    node.textContent = String(chat);
  });
  forEachLogoWhiteSquareCounterNode("mailsValue", (node) => {
    node.textContent = String(mail);
  });
  forEachLogoWhiteSquareCounterNode("shiftChatsValue", (node) => {
    node.textContent = String(chat);
  });
  forEachLogoWhiteSquareCounterNode("shiftMailsValue", (node) => {
    node.textContent = String(mail);
  });
  forEachLogoWhiteSquareCounterNode("shiftTotalValue", (node) => {
    node.textContent = String(total);
  });
  forEachLogoWhiteSquareCounterNode("hourChatsValue", (node) => {
    node.textContent = String(hourChat);
  });
  forEachLogoWhiteSquareCounterNode("hourMailsValue", (node) => {
    node.textContent = String(hourMail);
  });
  const localHourTotal = Number(monitorCounterState.counts.hourTotal) || 0;
  const serverHourTotal = serverOk
    ? Number(serverSummary.hour_actions_total) || 0
    : 0;
  const hourTotal = serverOk ? Math.max(serverHourTotal, localHourTotal) : localHourTotal;
  const hourLabel = `${hourTotal} / ${Math.max(
    hourGoal,
    hourTotal,
    HOURLY_GOAL_MIN
  )}`;
  forEachLogoWhiteSquareCounterNode("hourValue", (node) => {
    node.textContent = hourLabel;
    node.title = `${t("hourlyCount") || "За час"}: ${hourLabel}`;
  });
  renderLogoWhiteSquareHistory();
  renderLogoWhiteSquareProfilesList();
}

function renderLogoWhiteSquareHistoryRow({
  timeLabel,
  total,
  chats,
  mails,
  earnings,
  hourKey,
  profileId,
}) {
  const safeTimeLabel = timeLabel || "";
  const totalValue = Number.isFinite(Number(total)) ? Number(total) : 0;
  const chatsValue = Number.isFinite(Number(chats)) ? Number(chats) : 0;
  const mailsValue = Number.isFinite(Number(mails)) ? Number(mails) : 0;
  const earningsNumber = Number(earnings);
  const earningsHtml = Number.isFinite(earningsNumber)
    ? `<span class="history-money"><span class="history-icon" data-icon="money"></span><span class="history-money-value">${earningsNumber.toFixed(
        2
      )}</span></span>`
    : "";
  const normalizedProfile = normalizeProfileSelectionKey(profileId) || "";
  const keyAttr = hourKey ? ` data-hour-key="${escapeHtml(hourKey)}"` : "";
  const profileAttr = normalizedProfile
    ? ` data-profile-id="${escapeHtml(normalizedProfile)}"`
    : "";
  const labelAttr = safeTimeLabel
    ? ` data-history-label="${escapeHtml(safeTimeLabel)}"`
    : "";
  const statsHtml = `
        <span class="history-icon" data-icon="hour"></span> ${totalValue}
        <span class="history-icon" data-icon="chat"></span> ${chatsValue}
        <span class="history-icon" data-icon="mail"></span> ${mailsValue}`;
  return `
    <div class="menu-history-item"${keyAttr}${profileAttr}${labelAttr}>
      <div class="history-item-col history-item-time">
        <span class="history-time">${safeTimeLabel}</span>
      </div>
      <div class="history-item-col history-item-stats">
        ${statsHtml}
      </div>
      <div class="history-item-col history-item-money">
        ${earningsHtml}
      </div>
    </div>`;
}

function renderLogoWhiteSquareHistory() {
  const listNodes = getLogoWhiteSquareCounterNodes("historyList");
  if (!listNodes.length) return;
  const titleNodes = getLogoWhiteSquareCounterNodes("historySectionTitle");
  const baseHistoryLabel = t("history") || "История";
  const historyTitleText = baseHistoryLabel;
  titleNodes.forEach((node) => {
    node.textContent = historyTitleText;
  });
  const history = Array.from(operatorHourlyActionsMap.values());
  history.sort((a, b) => (b.start || 0) - (a.start || 0));
  const currentHourStart = Number(monitorCounterState.counts.hourStart);
  const currentHourKey = getKyivHourKey(
    Number.isFinite(currentHourStart) ? currentHourStart : Date.now()
  );
  const currentEntry = currentHourKey
    ? operatorHourlyActionsMap.get(currentHourKey)
    : null;
  const currentHourTotal = Number(currentEntry?.total) || 0;
  const currentHourChats = Number(currentEntry?.chat) || 0;
  const currentHourMails = Number(currentEntry?.mail) || 0;
  const currentHourEarningsRaw = getBalanceHourlyAmount(
    Number(monitorCounterState.counts.hourStart)
  );
  const currentHourEarnings = Number.isFinite(currentHourEarningsRaw)
    ? currentHourEarningsRaw
    : 0;
  const currentRow = renderLogoWhiteSquareHistoryRow({
    timeLabel: t("current") || "Текущий",
    total: currentHourTotal,
    chats: currentHourChats,
    mails: currentHourMails,
    earnings:
      typeof currentHourEarnings === "number" ? currentHourEarnings : null,
    hourKey: currentHourKey,
  });
  const historyMap = new Map();
  history.forEach((entry) => {
    const start = Number(entry.start) || 0;
    if (!start) return;
    const key = getKyivHourKey(start) || `ts-${start}`;
    historyMap.set(key, {
      start,
      total: Number(entry.total) || 0,
      chat: Number(entry.chat) || 0,
      mail: Number(entry.mail) || 0,
    });
  });
  operatorHourlyBalanceMap.forEach((amount, key) => {
    if (!Number.isFinite(amount)) return;
    if (historyMap.has(key)) return;
    const start = operatorHourlyBalanceStartMap.get(key);
    if (!Number.isFinite(start)) return;
    historyMap.set(key, {
      start,
      total: 0,
      chat: 0,
      mail: 0,
      synthetic: true,
    });
  });
  const combinedRows = Array.from(historyMap.entries()).sort((a, b) => {
    const startA = Number(a?.[1]?.start) || 0;
    const startB = Number(b?.[1]?.start) || 0;
    return startB - startA;
  });
  const historyItemsHtml = combinedRows
    .filter(([entryHourKey]) => entryHourKey !== currentHourKey)
    .map(([entryHourKey, entry]) => {
      const start = Number(entry.start) || 0;
      const total = Number(entry.total) || 0;
      const chats = Number(entry.chat) || 0;
      const mails = Number(entry.mail) || 0;
      const timeLabel = start ? formatHourTime(new Date(start)) || "" : "";
      const earningsRaw = getBalanceHourlyAmount(start);
      const earnings = Number.isFinite(earningsRaw) ? earningsRaw : 0;
      return renderLogoWhiteSquareHistoryRow({
        timeLabel,
        total,
        chats,
        mails,
        earnings,
        hourKey: entryHourKey || getKyivHourKey(start) || "",
      });
    })
    .join("");
  const items = [currentRow, historyItemsHtml].join("");
  listNodes.forEach((node) => {
    node.innerHTML = items;
  });
}


function setMonitorCounterCounts(counts) {
  const prevHourStart = Number(monitorCounterState.counts?.hourStart);
  monitorCounterState.counts = normalizeMonitorCountsPayload(counts);
  const total =
    (monitorCounterState.counts.chat || 0) +
    (monitorCounterState.counts.mail || 0);
  const hourTotal = Number(monitorCounterState.counts.hourTotal) || 0;
  const nextHourStart = Number(monitorCounterState.counts.hourStart);
  if (!Number.isFinite(prevHourStart) || prevHourStart !== nextHourStart) {
    monitorCounterState.hourGoal = HOURLY_GOAL_MIN;
  }
  const desiredHourGoal = Math.max(
    HOURLY_GOAL_MIN,
    monitorCounterState.counts.hourRecord || HOURLY_GOAL_MIN
  );
  monitorCounterState.hourGoal = desiredHourGoal;
  maybeAdvanceMonitorGoal(total);
  updateMonitorCounterUI();
  scheduleMonitorHourlyRefresh();
}

function handleMonitorRuntimeMessage(msg) {
  try {
    if (msg?.type === "monitor:update" && msg.counts) {
      setMonitorCounterCounts(msg.counts);
    }
  } catch {}
}

function requestMonitorCounts() {
  try {
    chrome.runtime.sendMessage({ type: "monitor:getCounts" }, (resp) => {
      const err = chrome.runtime.lastError;
      if (err) return;
      if (resp?.ok && resp.counts) {
        setMonitorCounterCounts(resp.counts);
      }
    });
  } catch {}
}

function initMonitorCounterSync() {
  if (monitorCounterState.initialized) return;
  monitorCounterState.initialized = true;
  updateMonitorCounterUI();
  loadMonitorGoalTarget();
  try {
    chrome.runtime.onMessage.addListener(handleMonitorRuntimeMessage);
  } catch {}
  requestMonitorCounts();
}

function closeUserInfoMenu() {
  try {
    userInfoController?.close?.();
  } catch {}
}
function closeBalanceDetails(options = {}) {
  const { preserveUserInfo = false } = options;
  try {
    const detailsEl =
      ui?.balanceMonitor?.element?.querySelector?.("#adb-details") || null;
    if (detailsEl) {
      LOG.warn("closeBalanceDetails()", {
        wasOpen: detailsEl.classList?.contains("open"),
        stack: new Error().stack,
      });
    } else {
      LOG.warn("closeBalanceDetails()", {
        wasOpen: null,
        stack: new Error().stack,
      });
    }
  } catch {}
  try {
    ui?.balanceMonitor?.closeDetails?.();
  } catch {}
  if (!preserveUserInfo) {
    closeUserInfoMenu();
  }
}
try {
  window.closeBalanceDetails = closeBalanceDetails;
} catch {}
let debugMoreBoxElement = null;
let classListDebugPatched = false;

function setupDebugTracing() {
  try {
    if (!ui?.moreBox) return;
    debugMoreBoxElement = ui.moreBox;
    patchDomTokenListDebug();
  } catch (err) {
    try {
      LOG.warn("setupDebugTracing error", {
        error: err?.message || err,
        stack: new Error().stack,
      });
    } catch {}
  }
}

function patchDomTokenListDebug() {
  try {
    if (classListDebugPatched) return;
    const proto = window.DOMTokenList && window.DOMTokenList.prototype;
    if (!proto || typeof proto.remove !== "function") return;
    const originalRemove = proto.remove;
    const originalAdd =
      typeof proto.add === "function"
        ? proto.add
        : function () {};
    const patchedRemove = function (...tokens) {
      if (
        debugMoreBoxElement &&
        this === debugMoreBoxElement.classList &&
        tokens.includes("open")
      ) {
        try {
          LOG.warn("moreBox.classList.remove", {
            tokens,
            stack: new Error().stack,
          });
        } catch {}
      }
      return originalRemove.apply(this, tokens);
    };
    const patchedAdd = function (...tokens) {
      if (
        debugMoreBoxElement &&
        this === debugMoreBoxElement.classList &&
        tokens.includes("open")
      ) {
        try {
          LOG.warn("moreBox.classList.add", {
            tokens,
            stack: new Error().stack,
          });
        } catch {}
      }
      return originalAdd.apply(this, tokens);
    };
    proto.remove = patchedRemove;
    proto.add = patchedAdd;
    if (proto.remove !== patchedRemove || proto.add !== patchedAdd) {
      try {
        LOG.warn("patchDomTokenListDebug ineffective", {
          stack: new Error().stack,
        });
      } catch {}
      proto.remove = originalRemove;
      proto.add = originalAdd;
      return;
    }
    classListDebugPatched = true;
  } catch (err) {
    try {
      LOG.warn("patchDomTokenListDebug error", {
        error: err?.message || err,
        stack: new Error().stack,
      });
    } catch {}
  }
}

let currentLang = "ru";
let currentSavedText = "";
let currentManId = "";
let currentReportKey = ""; // man.id + '_' + woman.id
let forceEmptyOnce = false; // очистить textarea вместо автозагрузки при следующем заполнении
let templatesTree = null;
let templatesIndex = new Map();
let currentTemplateFolderId = TEMPLATE_ROOT_ID;
let openTemplatesMenu = null;
let templatesMenuCloserBound = false;
let activeTemplatesForm = null;
function positionTemplatesMenu(menu, button) {
  try {
    if (!menu || !button) return;
    const row = button.closest(".templates-item");
    const btnRect = button.getBoundingClientRect();
    const rowRect = row?.getBoundingClientRect();
    if (!row || !rowRect) return;
    const top = btnRect.bottom - rowRect.top + 4;
    let left = btnRect.left - rowRect.left;
    // Shift menu left so it stays within container
    const menuWidth = menu.offsetWidth || 160;
    left = left - (menuWidth - btnRect.width);
    if (left < 0) left = 0;
    menu.style.top = `${Math.max(0, top)}px`;
    menu.style.left = `${Math.max(0, left)}px`;
    menu.style.right = "auto";
  } catch {}
}

function t(k, ...args) {
  const v = LANG[currentLang][k];
  return typeof v === "function" ? v(...args) : v;
}

// === Templates ===
function generateTemplateId(prefix = "tpl") {
  const base = String(prefix || "tpl");
  try {
    if (crypto?.randomUUID) return `${base}-${crypto.randomUUID()}`;
  } catch {}
  const rand = Math.random().toString(36).slice(2, 8);
  const stamp = Date.now().toString(36);
  return `${base}-${stamp}-${rand}`;
}

function createFolderNode(name, forcedId, meta = {}) {
  const folder = {
    id: forcedId || generateTemplateId("folder"),
    type: TEMPLATE_TYPE_FOLDER,
    name: String(name || "Папка"),
    children: [],
    createdAt: Date.now(),
  };
  if (meta && typeof meta === "object") folder.meta = { ...meta };
  return folder;
}

function deriveTemplateName(content) {
  try {
    const text = String(content || "").trim();
    if (!text) return "Шаблон";
    const firstLine = text.split(/\r?\n/, 1)[0] || text;
    const maxLen = 60;
    const trimmed =
      firstLine.length > maxLen
        ? `${firstLine.slice(0, maxLen).trim()}…`
        : firstLine.trim();
    return trimmed || "Шаблон";
  } catch {
    return "Шаблон";
  }
}

function createTemplateNode(name, content) {
  const now = Date.now();
  const contentStr = String(content || "");
  let title = String(name || "").trim();
  if (!title) title = deriveTemplateName(contentStr);
  return {
    id: generateTemplateId("template"),
    type: TEMPLATE_TYPE_TEMPLATE,
    name: title,
    content: contentStr,
    createdAt: now,
    updatedAt: now,
  };
}

function ensureDefaultRootFolders(root) {
  try {
    if (!root || root.type !== TEMPLATE_TYPE_FOLDER) return;
    if (!Array.isArray(root.children)) root.children = [];
    for (const { key, name } of TEMPLATE_DEFAULT_FOLDERS) {
      const exists = root.children.some((child) => {
        if (!child || child.type !== TEMPLATE_TYPE_FOLDER) return false;
        if (child.meta && child.meta.defaultKey === key) return true;
        return child.name === name;
      });
      if (!exists) {
        const folder = createFolderNode(name, `folder-${key}`, {
          defaultKey: key,
        });
        root.children.push(folder);
      }
    }
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("ensureDefaultRootFolders error", e);
  }
}

function normalizeTemplatesTree(raw) {
  let root = null;
  try {
    if (raw && typeof raw === "object" && raw.type === TEMPLATE_TYPE_FOLDER) {
      root = raw;
    }
  } catch {}
  if (!root) root = createFolderNode("Главная", TEMPLATE_ROOT_ID);
  root.id = TEMPLATE_ROOT_ID;
  root.type = TEMPLATE_TYPE_FOLDER;
  if (!Array.isArray(root.children)) root.children = [];
  root.name = root.name || "Главная";
  ensureDefaultRootFolders(root);
  return root;
}

function rebuildTemplatesIndex(root) {
  templatesIndex = new Map();
  const walk = (node, parentId) => {
    if (!node || !node.id) return;
    if (node.type === TEMPLATE_TYPE_FOLDER && !Array.isArray(node.children)) {
      node.children = [];
    }
    templatesIndex.set(node.id, { node, parentId: parentId || null });
    if (node.type === TEMPLATE_TYPE_FOLDER) {
      for (const child of node.children) {
        walk(child, node.id);
      }
    }
  };
  walk(root, null);
}

function getTemplateEntry(id) {
  if (!id) return null;
  return templatesIndex.get(id) || null;
}

function getTemplateParentId(id) {
  const entry = getTemplateEntry(id);
  return entry ? entry.parentId || null : null;
}

function closeTemplatesMenu() {
  try {
    if (openTemplatesMenu?.menu) {
      openTemplatesMenu.menu.hidden = true;
      openTemplatesMenu.menu.style.display = "none";
    }
  } catch {}
  try {
    if (openTemplatesMenu?.button) {
      openTemplatesMenu.button.classList.remove("active");
      openTemplatesMenu.button.removeAttribute("data-menu-open");
    }
  } catch {}
  openTemplatesMenu = null;
}

function setTemplatesFormError(message, errorEl) {
  if (!errorEl) return;
  if (message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  } else {
    errorEl.textContent = "";
    errorEl.hidden = true;
  }
}

function closeTemplatesInlineForm() {
  try {
    const host = ui?.templatesForm;
    if (host) {
      host.innerHTML = "";
      host.hidden = true;
    }
  } catch {}
  activeTemplatesForm = null;
}

function showTemplatesInlineForm(mode, options = {}) {
  try {
    const host = ui?.templatesForm;
    if (!host) return;
    if (mode !== "move" && activeTemplatesForm?.type === mode) {
      try {
        activeTemplatesForm.field?.focus?.();
        if (mode === "folder") activeTemplatesForm.field?.select?.();
      } catch {}
      return;
    }
    if (
      mode === "move" &&
      activeTemplatesForm?.type === "move" &&
      activeTemplatesForm?.data?.nodeId === options?.nodeId
    ) {
      try {
        activeTemplatesForm.field?.focus?.();
      } catch {}
      return;
    }
    closeTemplatesInlineForm();
    const entry = getTemplateEntry(currentTemplateFolderId);
    if (!entry || entry.node.type !== TEMPLATE_TYPE_FOLDER) return;
    const form = document.createElement("form");
    form.className = `templates-form templates-form-${mode}`;
    const fieldWrap = document.createElement("div");
    fieldWrap.className = "templates-form-field";
    let field;
    let errorMessageOnInit = "";
    let formData = {};
    if (mode === "folder") {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = t("newFolderPlaceholder") || "Название новой папки";
      field = input;
    } else if (mode === "template") {
      const textareaEl = document.createElement("textarea");
      textareaEl.placeholder = t("newTemplatePlaceholder") || "Текст шаблона";
      textareaEl.rows = 6;
      textareaEl.addEventListener("keydown", (ev) => {
        if (ev.key === "Escape") {
          ev.preventDefault();
          closeTemplatesInlineForm();
          return;
        }
        if (
          ev.key === "Enter" &&
          !ev.shiftKey &&
          !ev.ctrlKey &&
          !ev.altKey &&
          !ev.metaKey
        ) {
          ev.preventDefault();
          form.requestSubmit();
        }
      });
      field = textareaEl;
    } else if (mode === "move") {
      const nodeId = options?.nodeId;
      if (!nodeId) return;
      const nodeEntry = getTemplateEntry(nodeId);
      if (!nodeEntry) return;
      const node = nodeEntry.node;
      const parentId = nodeEntry.parentId || null;
      const isFolder = node.type === TEMPLATE_TYPE_FOLDER;
      const title = document.createElement("div");
      title.className = "templates-form-title";
      const moveTitle = t("moveTitle");
      title.textContent =
        typeof moveTitle === "function"
          ? moveTitle(node.name || (isFolder ? "Папка" : "Шаблон"))
          : `Переместить «${node.name || (isFolder ? "Папка" : "Шаблон")}»`;
      form.appendChild(title);
      const select = document.createElement("select");
      select.dataset.nodeId = nodeId;
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent =
        t("moveSelectPlaceholder") || "Выберите папку";
      placeholder.disabled = true;
      placeholder.selected = true;
      select.appendChild(placeholder);
      const folders = [];
      templatesIndex.forEach((value, id) => {
        if (!value || value.node.type !== TEMPLATE_TYPE_FOLDER) return;
        if (id === nodeId) return;
        if (parentId && id === parentId) return;
        if (isFolder && isFolderDescendant(id, nodeId)) return;
        folders.push({
          id,
          path: buildTemplatePath(id),
        });
      });
      const locale = currentLang === "uk" ? "uk" : "ru";
      folders.sort((a, b) => a.path.localeCompare(b.path, locale));
      for (const folder of folders) {
        const opt = document.createElement("option");
        opt.value = folder.id;
        opt.textContent = folder.path;
        select.appendChild(opt);
      }
      const label = document.createElement("label");
      label.textContent = t("moveSelectLabel") || "В папку";
      label.appendChild(select);
      fieldWrap.appendChild(label);
      field = select;
      formData = { nodeId };
      if (!folders.length) {
        select.disabled = true;
        errorMessageOnInit = t("moveNoTargets") || "Нет других папок для перемещения";
      }
    } else {
      return;
    }
    field.classList.add("templates-form-input");
    if (mode !== "move") {
      fieldWrap.appendChild(field);
    }
    form.appendChild(fieldWrap);

    const errorEl = document.createElement("div");
    errorEl.className = "templates-form-error";
    errorEl.hidden = true;
    errorEl.setAttribute("role", "alert");
    form.appendChild(errorEl);

    const actions = document.createElement("div");
    actions.className = "templates-form-actions";
    const saveBtn = document.createElement("button");
    saveBtn.type = "submit";
    saveBtn.className = "btn";
    saveBtn.textContent = t("save") || "Сохранить";
    if (mode === "move" && errorMessageOnInit) {
      saveBtn.disabled = true;
    }
    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn";
    cancelBtn.textContent = t("cancel") || "Отмена";
    cancelBtn.onclick = (ev) => {
      try {
        ev.preventDefault();
      } catch {}
      closeTemplatesInlineForm();
    };
    actions.appendChild(saveBtn);
    actions.appendChild(cancelBtn);
    form.appendChild(actions);

    form.addEventListener("submit", (ev) => {
      try {
        ev.preventDefault();
      } catch {}
      setTemplatesFormError("", errorEl);
      if (mode === "folder") {
        handleTemplatesFolderSubmit(field, errorEl);
      } else if (mode === "template") {
        handleTemplatesTemplateSubmit(field, errorEl);
      } else if (mode === "move") {
        handleTemplatesMoveSubmit(field, errorEl);
      }
    });

    field.addEventListener("keydown", (ev) => {
      if (ev.key === "Escape") {
        try {
          ev.preventDefault();
        } catch {}
        closeTemplatesInlineForm();
      }
      if (mode === "folder" && ev.key === "Enter") {
        // default submit behaviour handles saving; nothing custom needed
      }
    });

    host.appendChild(form);
    host.hidden = false;
    activeTemplatesForm = { type: mode, field, errorEl, data: formData };
    requestAnimationFrame(() => {
      try {
        if (!(mode === "move" && field.disabled)) {
          field.focus();
          if (mode === "folder") field.select();
        } else {
          cancelBtn.focus();
        }
        if (errorMessageOnInit) {
          setTemplatesFormError(errorMessageOnInit, errorEl);
        }
      } catch {}
    });
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("showTemplatesInlineForm error", e);
  }
}

function handleTemplatesFolderSubmit(field, errorEl) {
  try {
    const entry = getTemplateEntry(currentTemplateFolderId);
    if (!entry || entry.node.type !== TEMPLATE_TYPE_FOLDER) return;
    const raw = String(field?.value || "");
    const name = raw.trim();
    if (!name) {
      setTemplatesFormError(
        t("folderNameRequired") || "Введите название папки",
        errorEl
      );
      try {
        field?.focus();
      } catch {}
      return;
    }
    const folder = createFolderNode(name);
    entry.node.children.push(folder);
    rebuildTemplatesIndex(templatesTree);
    renderTemplatesList();
    persistTemplates().catch(() => {});
    closeTemplatesInlineForm();
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("handleTemplatesFolderSubmit error", e);
  }
}

function handleTemplatesTemplateSubmit(field, errorEl) {
  try {
    const entry = getTemplateEntry(currentTemplateFolderId);
    if (!entry || entry.node.type !== TEMPLATE_TYPE_FOLDER) return;
    const content = String(field?.value || "");
    if (!content.trim()) {
      setTemplatesFormError(
        t("templateContentRequired") || "Введите текст шаблона",
        errorEl
      );
      try {
        field?.focus();
      } catch {}
      return;
    }
    const template = createTemplateNode("", content);
    entry.node.children.push(template);
    rebuildTemplatesIndex(templatesTree);
    renderTemplatesList();
    persistTemplates().catch(() => {});
    closeTemplatesInlineForm();
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("handleTemplatesTemplateSubmit error", e);
  }
}

function handleTemplatesMoveSubmit(field, errorEl) {
  try {
    const state = activeTemplatesForm;
    const nodeId = state?.data?.nodeId;
    if (!nodeId) return;
    const targetId = String(field?.value || "");
    if (!targetId) {
      setTemplatesFormError(
        t("moveTargetRequired") || "Выберите папку",
        errorEl
      );
      try {
        field?.focus();
      } catch {}
      return;
    }
    const entry = getTemplateEntry(nodeId);
    if (!entry) {
      closeTemplatesInlineForm();
      return;
    }
    const parentId = entry.parentId || null;
    if (targetId === parentId) {
      setTemplatesFormError(
        t("moveSameFolderError") || "Этот элемент уже находится в выбранной папке",
        errorEl
      );
      try {
        field?.focus();
      } catch {}
      return;
    }
    if (
      entry.node.type === TEMPLATE_TYPE_FOLDER &&
      isFolderDescendant(targetId, nodeId)
    ) {
      setTemplatesFormError(
        t("moveDescendantError") || "Нельзя переместить папку внутрь самой себя",
        errorEl
      );
      try {
        field?.focus();
      } catch {}
      return;
    }
    const moved = moveTemplateNode(nodeId, targetId);
    if (!moved) {
      setTemplatesFormError(
        t("moveFailed") || "Не удалось переместить элемент",
        errorEl
      );
      try {
        field?.focus();
      } catch {}
      return;
    }
    closeTemplatesInlineForm();
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("handleTemplatesMoveSubmit error", e);
  }
}

function ensureTemplatesMenuCloser() {
  if (templatesMenuCloserBound) return;
  templatesMenuCloserBound = true;
  document.addEventListener(
    "click",
    (ev) => {
      try {
        if (!openTemplatesMenu) return;
        const menu = openTemplatesMenu.menu;
        const btn = openTemplatesMenu.button;
        if (menu?.contains(ev.target) || btn?.contains(ev.target)) return;
      } catch {}
      closeTemplatesMenu();
    },
    { capture: true }
  );
}

function buildTemplatePath(id) {
  const parts = [];
  let guard = 0;
  let cursor = id;
  while (cursor && guard < 512) {
    guard += 1;
    const entry = getTemplateEntry(cursor);
    if (!entry) break;
    const node = entry.node;
    parts.push(
      node.id === TEMPLATE_ROOT_ID
        ? "Главная"
        : node.name || (node.type === TEMPLATE_TYPE_FOLDER ? "Папка" : "Шаблон")
    );
    cursor = entry.parentId || null;
  }
  if (!parts.length) return "Главная";
  return parts.reverse().join(" / ");
}

function isFolderDescendant(targetId, ancestorId) {
  if (!targetId || !ancestorId) return false;
  if (targetId === ancestorId) return true;
  const ancestor = getTemplateEntry(ancestorId);
  if (!ancestor || ancestor.node.type !== TEMPLATE_TYPE_FOLDER) return false;
  const stack = Array.isArray(ancestor.node.children)
    ? [...ancestor.node.children]
    : [];
  let guard = 0;
  while (stack.length && guard < 2048) {
    guard += 1;
    const current = stack.pop();
    if (!current || !current.id) continue;
    if (current.id === targetId) return true;
    if (current.type === TEMPLATE_TYPE_FOLDER && Array.isArray(current.children)) {
      stack.push(...current.children);
    }
  }
  return false;
}

async function persistTemplates() {
  try {
    await setStore({ [TEMPLATE_STORAGE_KEY]: templatesTree });
    persistTemplateFolder(currentTemplateFolderId);
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("persistTemplates error", e);
  }
}

function persistTemplateFolder(folderId) {
  try {
    const value = typeof folderId === "string" ? folderId : String(folderId || "");
    void setStore({ [TEMPLATE_LAST_FOLDER_KEY]: value }).catch((err) => {
      if (!isExtCtxInvalid(err)) LOG.warn("persistTemplateFolder error", err);
    });
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("persistTemplateFolder error", e);
  }
}

function renderTemplatesBreadcrumb(folderId) {
  try {
    if (!ui?.templatesPath) return;
    const pathEl = ui.templatesPath;
    pathEl.innerHTML = "";
    const crumbs = [];
    let guard = 0;
    let cursor = folderId;
    while (cursor && guard < 512) {
      guard += 1;
      const entry = getTemplateEntry(cursor);
      if (!entry) break;
      crumbs.push(entry.node);
      cursor = entry.parentId || null;
      if (!cursor) break;
    }
    if (!crumbs.length && templatesTree) {
      crumbs.push(templatesTree);
    }
    if (!crumbs.length) {
      const base = document.createElement("span");
      base.className = "crumb disabled";
      base.textContent = "Главная";
      pathEl.appendChild(base);
      return;
    }
    crumbs.reverse();
    crumbs.forEach((node, idx) => {
      const isLast = idx === crumbs.length - 1;
      const el = document.createElement("span");
      el.className = "crumb";
      el.textContent =
        node.id === TEMPLATE_ROOT_ID
          ? "Главная"
          : node.name || (node.type === TEMPLATE_TYPE_FOLDER ? "Папка" : "Шаблон");
      if (isLast) {
        el.classList.add("disabled");
      } else {
        el.onclick = () => {
          openTemplatesFolder(node.id);
        };
      }
      pathEl.appendChild(el);
      if (!isLast) {
        const sep = document.createElement("span");
        sep.className = "crumb-sep";
        sep.textContent = "›";
        pathEl.appendChild(sep);
      }
    });
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("renderTemplatesBreadcrumb error", e);
  }
}

function renderTemplatesList() {
  try {
    if (!ui?.templatesList) return;
    const list = ui.templatesList;
    closeTemplatesMenu();
    if (!templatesTree) {
      list.innerHTML = `<div class="templates-empty">Загрузка…</div>`;
      renderTemplatesBreadcrumb(TEMPLATE_ROOT_ID);
      return;
    }
    if (!templatesIndex.has(templatesTree.id)) {
      rebuildTemplatesIndex(templatesTree);
    }
    let entry = getTemplateEntry(currentTemplateFolderId);
    if (!entry || entry.node.type !== TEMPLATE_TYPE_FOLDER) {
      currentTemplateFolderId = TEMPLATE_ROOT_ID;
      persistTemplateFolder(currentTemplateFolderId);
      entry = getTemplateEntry(currentTemplateFolderId);
    }
    if (!entry) return;
    const folder = entry.node;
    if (!Array.isArray(folder.children)) folder.children = [];
    list.innerHTML = "";
    ensureTemplatesMenuCloser();
    const sorted = folder.children
      .filter((child) => child && child.id && child.type)
      .slice()
      .sort((a, b) => {
        const orderA = a.type === TEMPLATE_TYPE_FOLDER ? 0 : 1;
        const orderB = b.type === TEMPLATE_TYPE_FOLDER ? 0 : 1;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name || "").localeCompare(b.name || "", "ru");
      });
    if (!sorted.length) {
      const empty = document.createElement("div");
      empty.className = "templates-empty";
      empty.textContent = "Пусто. Создайте папку или шаблон.";
      list.appendChild(empty);
    } else {
      for (const node of sorted) {
        const isFolder = node.type === TEMPLATE_TYPE_FOLDER;
        const isDefaultFolder = isFolder && node.meta && node.meta.defaultKey;
        const row = document.createElement("div");
        row.className = `templates-item templates-${node.type}`;
        row.classList.add("clickable");

        if (isFolder) {
          const textWrap = document.createElement("div");
          textWrap.className = "templates-text-folder";
          const nameEl = document.createElement("div");
          nameEl.className = "name";
          nameEl.textContent = node.name || "Папка";
          textWrap.appendChild(nameEl);
          const metaEl = document.createElement("div");
          metaEl.className = "meta";
          const childCount = Array.isArray(node.children) ? node.children.length : 0;
          metaEl.textContent = `Папка · ${childCount}`;
          textWrap.appendChild(metaEl);
          const openFolder = () => {
            closeTemplatesMenu();
            openTemplatesFolder(node.id);
          };
          textWrap.onclick = (ev) => {
            try {
              ev.preventDefault();
              ev.stopPropagation();
            } catch {}
            openFolder();
          };
          row.onclick = (ev) => {
            if (ev.defaultPrevented) return;
            if (ev.target.closest(".templates-menu") || ev.target.closest(".templates-more"))
              return;
            openFolder();
          };
          row.appendChild(textWrap);
        } else {
          const body = document.createElement("div");
          body.className = "templates-text";
          body.textContent = node.content || "";
          const apply = () => {
            closeTemplatesMenu();
            applyTemplateNode(node);
          };
          body.onclick = (ev) => {
            try {
              ev.preventDefault();
              ev.stopPropagation();
            } catch {}
            apply();
          };
          row.onclick = (ev) => {
            if (ev.defaultPrevented) return;
            if (ev.target.closest(".templates-menu") || ev.target.closest(".templates-more"))
              return;
            apply();
          };
          row.appendChild(body);
        }

        const canAlter = node.id !== TEMPLATE_ROOT_ID && !isDefaultFolder;
        if (canAlter) {
          const menu = document.createElement("div");
          menu.className = "templates-menu";
          menu.hidden = true;
          menu.style.display = "none";
          const makeMenuAction = (fn) => (ev) => {
            try {
              ev.preventDefault();
              ev.stopPropagation();
            } catch {}
            closeTemplatesMenu();
            fn();
          };
          const moveBtn = document.createElement("button");
          moveBtn.type = "button";
          moveBtn.textContent = "Переместить";
          moveBtn.onclick = makeMenuAction(() => promptMoveTemplateNode(node.id));
          const delBtn = document.createElement("button");
          delBtn.type = "button";
          delBtn.textContent = "Удалить";
          delBtn.onclick = makeMenuAction(() => promptDeleteTemplateNode(node.id));
          menu.appendChild(moveBtn);
          menu.appendChild(delBtn);

          const menuBtn = document.createElement("button");
          menuBtn.type = "button";
          menuBtn.className = "templates-more";
          menuBtn.setAttribute("aria-label", "Действия");
          menuBtn.textContent = "⋮";
          menuBtn.onclick = (ev) => {
            try {
              ev.preventDefault();
              ev.stopPropagation();
            } catch {}
            if (!menu.hidden) {
              menu.hidden = true;
              menu.style.display = "none";
              menuBtn.classList.remove("active");
              menuBtn.removeAttribute("data-menu-open");
              if (
                openTemplatesMenu &&
                openTemplatesMenu.menu === menu &&
                openTemplatesMenu.button === menuBtn
              ) {
                openTemplatesMenu = null;
              }
              return;
            }
            closeTemplatesMenu();
            positionTemplatesMenu(menu, menuBtn);
            menu.hidden = false;
            menu.style.display = "flex";
            menuBtn.classList.add("active");
            menuBtn.dataset.menuOpen = "1";
            openTemplatesMenu = { menu, button: menuBtn };
          };

          row.appendChild(menuBtn);
          row.appendChild(menu);
        }

        list.appendChild(row);
      }
    }
    renderTemplatesBreadcrumb(entry.node.id);
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("renderTemplatesList error", e);
  }
}

function openTemplatesFolder(folderId) {
  const entry = getTemplateEntry(folderId);
  if (!entry || entry.node.type !== TEMPLATE_TYPE_FOLDER) return;
  currentTemplateFolderId = folderId;
  persistTemplateFolder(currentTemplateFolderId);
  closeTemplatesInlineForm();
  renderTemplatesList();
}

function applyTemplateNode(node) {
  try {
    if (!node || node.type !== TEMPLATE_TYPE_TEMPLATE) return;
    const text = String(node.content || "");
    let hostApplied = false;
    try {
      hostApplied = applyTemplateToHost(text);
    } catch {}
    if (!hostApplied) {
      LOG.warn("applyTemplateNode: no textarea to insert template");
    }
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("applyTemplateNode error", e);
  }
}

function isEditableElement(el) {
  try {
    if (!(el instanceof Element)) return false;
    if (root && root.contains(el)) return false;
    const tag = (el.tagName || "").toLowerCase();
    if (tag === "textarea") return true;
    if (tag === "input") {
      const type = (el.getAttribute("type") || "").toLowerCase();
      return (
        type === "" ||
        type === "text" ||
        type === "search" ||
        type === "email" ||
        type === "tel" ||
        type === "url" ||
        type === "number"
      );
    }
    return !!el.isContentEditable;
  } catch {
    return false;
  }
}

function resolveEditableElement(rootEl) {
  try {
    if (!rootEl) return null;
    const queue = [rootEl];
    const seen = new Set();
    while (queue.length) {
      const el = queue.shift();
      if (!el || seen.has(el)) continue;
      seen.add(el);
      if (!(el instanceof Element)) continue;
      if (root && root.contains(el)) continue;
      if (isEditableElement(el)) return el;
      const shadowChildren =
        el.shadowRoot && el.shadowRoot.children
          ? Array.from(el.shadowRoot.children)
          : [];
      const childElements = el.children ? Array.from(el.children) : [];
      queue.push(...shadowChildren, ...childElements);
    }
    return null;
  } catch {
    return null;
  }
}

function findTargetInput(kind = "message") {
  const selectors = kind === "letter" ? LETTER_SELECTORS : CHAT_SELECTORS;
  for (const sel of selectors) {
    let candidates = [];
    try {
      candidates = Array.from(document.querySelectorAll(sel));
    } catch {
      candidates = [];
    }
    for (const candidate of candidates) {
      const resolved = resolveEditableElement(candidate);
      if (resolved) return resolved;
    }
  }
  return null;
}

function dispatchInputEvent(target, text) {
  try {
    target.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        cancelable: false,
        data: text,
        inputType: "insertText",
      })
    );
  } catch {
    try {
      const evt = document.createEvent("Event");
      evt.initEvent("input", true, false);
      target.dispatchEvent(evt);
    } catch {}
  }
  try {
    target.dispatchEvent(new Event("change", { bubbles: true }));
  } catch {}
}

function setControlValue(target, value) {
  try {
    const tag = (target.tagName || "").toLowerCase();
    let setter = null;
    if (tag === "textarea") {
      setter = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        "value"
      )?.set;
    } else if (tag === "input") {
      setter = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        "value"
      )?.set;
    }
    if (setter) setter.call(target, value);
    else target.value = value;
    try {
      target.setSelectionRange(value.length, value.length);
    } catch {}
    return true;
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("setControlValue error", e);
    return false;
  }
}

function insertTextIntoTarget(text, kind = "message") {
  try {
    const target = findTargetInput(kind);
    if (!target) return false;
    const value = String(text ?? "");
    try {
      target.focus({ preventScroll: true });
    } catch {
      try {
        target.focus();
      } catch {}
    }
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      const ok = setControlValue(target, value);
      dispatchInputEvent(target, value);
      return ok;
    }
    if (target && typeof target.isContentEditable === "boolean" && target.isContentEditable) {
      const doc = target.ownerDocument || document;
      target.innerHTML = "";
      target.appendChild(doc.createTextNode(value));
      try {
        const sel = doc.getSelection();
        if (sel) {
          const range = doc.createRange();
          range.selectNodeContents(target);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      } catch {}
      dispatchInputEvent(target, value);
      return true;
    }
    target.textContent = value;
    dispatchInputEvent(target, value);
    return true;
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("insertTextIntoTarget error", e);
    return false;
  }
}

function applyTemplateToHost(text) {
  try {
    if (!text) return false;
    return insertTextIntoTarget(text, "message");
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("applyTemplateToHost error", e);
    return false;
  }
}

function promptMoveTemplateNode(nodeId) {
  try {
    if (!nodeId || nodeId === TEMPLATE_ROOT_ID) return;
    const entry = getTemplateEntry(nodeId);
    if (!entry) return;
    showTemplatesInlineForm("move", { nodeId });
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("promptMoveTemplateNode error", e);
  }
}

function promptDeleteTemplateNode(nodeId) {
  try {
    if (!nodeId || nodeId === TEMPLATE_ROOT_ID) return;
    const entry = getTemplateEntry(nodeId);
    if (!entry) return;
    const node = entry.node;
    if (node.meta && node.meta.defaultKey) {
      alert("Эту папку нельзя удалить");
      return;
    }
    const parentId = entry.parentId;
    if (!parentId) return;
    const parent = getTemplateEntry(parentId);
    if (!parent || parent.node.type !== TEMPLATE_TYPE_FOLDER) return;
    const typeLabel = node.type === TEMPLATE_TYPE_FOLDER ? "папку" : "шаблон";
    const name = node.name || (node.type === TEMPLATE_TYPE_FOLDER ? "Папку" : "Шаблон");
    const ok = confirm(`Удалить ${typeLabel} "${name}"?`);
    if (!ok) return;
    parent.node.children = (parent.node.children || []).filter(
      (child) => child && child.id !== nodeId
    );
    if (currentTemplateFolderId === nodeId) {
      currentTemplateFolderId = parentId;
      persistTemplateFolder(currentTemplateFolderId);
    }
    rebuildTemplatesIndex(templatesTree);
    renderTemplatesList();
    persistTemplates().catch(() => {});
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("promptDeleteTemplateNode error", e);
  }
}

function moveTemplateNode(nodeId, targetFolderId) {
  try {
    if (!nodeId || nodeId === TEMPLATE_ROOT_ID) return false;
    const entry = getTemplateEntry(nodeId);
    const target = getTemplateEntry(targetFolderId);
    if (!entry || !target || target.node.type !== TEMPLATE_TYPE_FOLDER) return false;
    const parentId = entry.parentId;
    if (!parentId) return false;
    if (parentId === targetFolderId) return false;
    if (entry.node.type === TEMPLATE_TYPE_FOLDER && isFolderDescendant(targetFolderId, nodeId)) {
      alert("Нельзя переместить папку в саму себя или её дочернюю папку");
      return false;
    }
    const parent = getTemplateEntry(parentId);
    if (!parent || parent.node.type !== TEMPLATE_TYPE_FOLDER) return false;
    parent.node.children = (parent.node.children || []).filter(
      (child) => child && child.id !== nodeId
    );
    if (!Array.isArray(target.node.children)) target.node.children = [];
    target.node.children.push(entry.node);
    rebuildTemplatesIndex(templatesTree);
    renderTemplatesList();
    persistTemplates().catch(() => {});
    return true;
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("moveTemplateNode error", e);
    return false;
  }
}

function onTemplatesCreateFolder() {
  try {
    const entry = getTemplateEntry(currentTemplateFolderId);
    if (!entry || entry.node.type !== TEMPLATE_TYPE_FOLDER) return;
    showTemplatesInlineForm("folder");
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("onTemplatesCreateFolder error", e);
  }
}

function onTemplatesCreateTemplate() {
  try {
    const entry = getTemplateEntry(currentTemplateFolderId);
    if (!entry || entry.node.type !== TEMPLATE_TYPE_FOLDER) return;
    showTemplatesInlineForm("template");
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("onTemplatesCreateTemplate error", e);
  }
}

function initializeTemplates(rawTree, storedFolderId = "") {
  templatesTree = normalizeTemplatesTree(rawTree);
  rebuildTemplatesIndex(templatesTree);
  const candidateFolderId = String(storedFolderId || currentTemplateFolderId || "").trim();
  if (candidateFolderId && templatesIndex.has(candidateFolderId)) {
    const entry = getTemplateEntry(candidateFolderId);
    if (entry?.node?.type === TEMPLATE_TYPE_FOLDER) {
      currentTemplateFolderId = candidateFolderId;
    }
  }
  if (!templatesIndex.has(currentTemplateFolderId)) {
    currentTemplateFolderId = TEMPLATE_ROOT_ID;
  }
  persistTemplateFolder(currentTemplateFolderId);
  renderTemplatesList();
}

// Убрана плавающая кнопка «Отчёты» — панель открывается иконкой расширения или если закреплена

function buildPanel() {
  root = document.createElement("div");
  shadow = root.attachShadow({ mode: "open" });
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <style>
      .drawer{position:fixed;top:0;right:0;left:0;width:100%;height:100vh;
        background:transparent;color:var(--ar-fg, #000);border:none;border-radius:var(--ar-radius, ${PANEL_RADIUS});box-sizing:border-box;overflow:auto;
        padding:7px 9px 9px 5px;
        transform:translateY(110%);transform-origin:bottom right;transition:transform .2s ease, opacity .2s ease; z-index:2147483646;
        display:flex;flex-direction:column;opacity:0;visibility:hidden;pointer-events:none;
        font: var(--ar-font-size, 14px)/1.35 var(--ar-font, system-ui, sans-serif)}
      .drawer-inner{display:flex;flex-direction:column;flex:1 1 auto;min-height:0;box-sizing:border-box;
        background:#fff;border-radius:inherit}
      .drawer-grip{display:flex;justify-content:center;align-items:center;
        height:20px;padding:0;z-index:4;background:transparent;cursor:ns-resize;transition:box-shadow .15s ease}
      .drawer-grip::before{content:"";display:block;width:60px;height:6px;border-radius:999px;
        background:#8f96a3;opacity:0;transform:scaleX(0.6);transition:opacity .15s ease, transform .15s ease}
      .drawer-grip:hover::before,
      .drawer.dragging .drawer-grip::before{opacity:1;transform:scaleX(1)}
      .open{transform:translateY(0);opacity:1;visibility:visible;pointer-events:auto}
      .drawer.dragging{cursor:ns-resize}
      .drawer.dragging textarea{user-select:none;cursor:ns-resize}
      .head{display:flex;align-items:center;justify-content:space-between;
        padding:0px 12px 2px 12px;border-bottom:none;position:sticky;
        top:var(--ar-grip-height, 0);z-index:3;background:#fff}
      .balance-host{flex:1 1 auto;min-width:0;display:flex;align-items:flex-end;padding:4px 0;position:relative}
      .balance-host:empty{min-height:32px}
      .balance-host #adb-panel{margin-bottom:0;width:100%}
      #adb-panel{position:relative;display:flex;flex-direction:column;align-items:flex-start;background:transparent;color:inherit;font-family:Consolas, monospace;padding:0;border-radius:3px;margin-bottom:0;min-width:120px}
      #adb-header{display:flex;align-items:center;gap:6px}
      #adb-toggle{all:unset;cursor:pointer;display:flex;align-items:flex-end;gap:6px;padding:2px 6px;border-radius:3px}
      #adb-toggle:hover{background:rgba(95,168,255,0.1)}
      #adb-header.open #adb-toggle{background:rgba(95,168,255,0.12)}
      #adb-toggle:focus-visible{outline:2px solid rgba(95,168,255,0.6)}
      #adb-total{font-size:28px;color:#2b7a78;line-height:1}
      #adb-chevron{font-size:16px;color:inherit;transition:transform .2s ease}
      #adb-header.open #adb-chevron{transform:rotate(180deg)}
      #adb-details{position:absolute;top:calc(100% + 8px);left:0;z-index:6;display:flex;flex-direction:column;gap:4px;padding:8px;border-radius:3px;border:1px solid rgba(31,79,116,0.15);background:var(--ar-elevated-bg, ${PANEL_ELEVATED_BG});box-shadow:0 10px 28px rgba(31,79,116,0.18);opacity:0;transform:translateY(-6px);pointer-events:none;transition:opacity .12s ease, transform .12s ease;box-sizing:border-box;overflow:hidden}
      #adb-details::before{content:"";position:absolute;top:-6px;left:var(--adb-pointer-left, 30px);width:12px;height:12px;background:inherit;border-left:1px solid rgba(31,79,116,0.15);border-top:1px solid rgba(31,79,116,0.15);transform:rotate(45deg);pointer-events:none}
      #adb-details.open{opacity:1;transform:translateY(0);pointer-events:auto}
      #adb-details .adb-tools{display:none}
      #adb-details .adb-tabs{display:flex;align-items:center;gap:6px;margin:2px 0 4px;width:100%}
      #adb-details .adb-tab{appearance:none;border:1px solid rgba(31,79,116,0.18);background:rgba(95,168,255,0.08);color:inherit;border-radius:3px;padding:2px 8px;font:12px/1.3 Consolas, monospace;cursor:pointer;flex:1 1 0;min-width:0;text-align:center}
      #adb-details .adb-tab:hover{background:rgba(95,168,255,0.14)}
      #adb-details .adb-tab.active{background:rgba(95,168,255,0.2);border-color:rgba(31,79,116,0.28)}
      #adb-details .adb-tab:focus-visible{outline:2px solid rgba(95,168,255,0.55);outline-offset:1px}
      #adb-details .adb-tab-panel{display:block}
      #adb-details .adb-tab-panel[hidden]{display:none !important}
      #adb-details .adb-actions{display:flex;align-items:center;gap:8px}
      #adb-list{margin:0;line-height:17px;tab-size:4;color:inherit;font:14px/18px Consolas, monospace;max-height:360px;overflow:auto;flex:1 1 auto}
      #adb-webhook-list{margin:0;line-height:17px;tab-size:4;color:inherit;font:14px/18px Consolas, monospace;max-height:360px;overflow:auto;flex:1 1 auto}
      #adb-webhook-list .adb-empty{opacity:0.7;padding:6px 2px}
      .adb-pie-wrap{display:flex;flex-direction:column;gap:10px;align-items:center}
      .adb-pie{width:120px;height:120px;flex:0 0 auto}
      .adb-legend{display:flex;flex-direction:column;gap:6px;min-width:0;width:100%}
      .adb-legend-row{display:flex;align-items:center;gap:8px}
      .adb-legend-swatch{width:10px;height:10px;border-radius:50%;flex:0 0 10px}
      .adb-row{display:flex;min-width:100%;text-decoration:none;color:inherit}
      .adb-row.adb-row-type-1{background:rgba(214,59,59,0.18)}
      .adb-row.adb-row-type-2{background:rgba(46,115,216,0.18)}
      .adb-row.adb-row-type-3{background:rgba(47,155,75,0.2)}
      .adb-row:hover{opacity:.85}
      .adb-price{flex:0 0 5ch;width:7ch;text-align:right;margin-right:2ch}
      .adb-label{flex:1 1 auto;overflow:hidden;position:relative}
      .adb-label-inner{display:inline-block;white-space:nowrap;will-change:transform}
      .adb-label[data-scrollable="1"]::after{content:"";position:absolute;top:0;left:0;right:0;bottom:0;background:linear-gradient(90deg,rgba(255,255,255,0) 65%,var(--ar-elevated-bg, ${PANEL_ELEVATED_BG}));pointer-events:none;opacity:0;transition:opacity .12s ease}
      .adb-label[data-scrollable="1"]:hover::after{opacity:1}
      .adb-label[data-scrollable="1"]:hover .adb-label-inner{animation:adb-marquee var(--adb-marquee-duration,6s) linear infinite}
      @keyframes adb-marquee{
        0%{transform:translateX(0)}
        100%{transform:translateX(var(--adb-marquee-distance, -40%))}
      }
      .adb-time{flex:0 0 6ch;width:6ch;text-align:right;margin-left:1ch;margin-right:1ch}
      .adb-spend-flag{
        margin-left:6px;
        flex:0 0 auto;
        width:14px;
        height:14px;
        display:inline-block;
        background:url("${ICONS.money}") no-repeat center/contain;
        filter:grayscale(0.2);
      }
      .adb-price-badge{
        margin-left:6px;
        flex:0 0 auto;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        min-width:18px;
        height:14px;
        padding:0 4px;
        border-radius:3px;
        background:rgba(31,79,116,0.12);
        color:#12395e;
        font-size:11px;
        font-weight:700;
        line-height:1;
      }
      .drawer-strip{height:20px;background:#f1f3f9;width:100%;display:block;margin:0;}
      .adb-tools{margin-left:auto;display:flex;gap:4px}
      .adb-tools button{background:none;border:none;cursor:pointer;font-size:20px;line-height:1;color:inherit;padding:0 2px;align-self:flex-start}
      .adb-tools button:hover{opacity:.7}
      .row{position:sticky;top:var(--ar-head-height, 0px);z-index:2;
        display:flex;flex-wrap:wrap;padding:4px 12px;background:var(--ar-bg, ${PANEL_BG});
        column-gap:8px;row-gap:4px;margin:0}
      .tag{background:#fff;color:var(--ar-fg, #000);padding:6px 8px;border-radius:var(--ar-radius, 3px);border:1px solid var(--ar-border, ${PANEL_BORDER})}
      .lab{opacity:.7;margin-right:4px}
      #ta{margin:4px 12px 6px;border:1px solid var(--ar-border, ${PANEL_BORDER});border-radius:3px;
        background:#fff;color:var(--ar-fg, #000);min-height:calc(4 * 1.35em + 20px);resize:none;overflow:auto;
        flex:1 1 auto;height:auto}
      .btns{position:relative;display:flex;justify-content:space-between;align-items:center;margin:4px 12px 6px;gap:12px;
        margin-top:auto}
      .btns > *{flex:1 1 0;display:flex;justify-content:center}
      .btns > *:first-child{flex:1 1 0}
      .has-tooltip[data-tooltip]{position:relative}
      .has-tooltip[data-tooltip]::after{
        content:attr(data-tooltip);
        position:absolute;
        bottom:calc(100% + 8px);
        left:50%;
        transform:translate(-50%, 4px);
        background:rgba(23,55,84,0.95);
        color:#fff;
        padding:4px 8px;
        border-radius:3px;
        font-size:12px;
        line-height:1.3;
        white-space:nowrap;
        pointer-events:none;
        opacity:0;
        transition:opacity .06s ease, transform .06s ease;
        z-index:9999;
      }
      .has-tooltip[data-tooltip]::before{
        content:"";
        position:absolute;
        bottom:calc(100% + 2px);
        left:50%;
        transform:translateX(-50%);
        border:6px solid transparent;
        border-top-color:rgba(23,55,84,0.95);
        opacity:0;
        transition:opacity .06s ease;
        pointer-events:none;
        z-index:9999;
      }
      .has-tooltip[data-tooltip]:hover::after,
      .has-tooltip[data-tooltip]:hover::before{
        opacity:1;
      }
      .has-tooltip[data-tooltip]:hover::after{
        transform:translate(-50%, 0);
      }
      /* Slide-up overlay above the buttons that covers the textarea area */
      .more{position:absolute;left:0;right:0;bottom:calc(100% + 6px);
        display:block;padding:6px;border:1px solid var(--ar-border, ${PANEL_BORDER});border-radius:3px;
        background:var(--ar-elevated-bg, ${PANEL_ELEVATED_BG});color:var(--ar-fg, #000);
        transform:translateY(8px);opacity:0;pointer-events:none;
        transition:transform .08s ease, opacity .08s ease; z-index:10;max-height:var(--ar-more-max-height, 280px);
        overflow:auto}
      .more.open{transform:translateY(0);opacity:1;pointer-events:auto}
      .more .out{flex-basis:100%;max-height:220px;overflow:auto;margin-top:6px;padding:8px;border:1px dashed var(--ar-border, ${PANEL_BORDER});border-radius:3px;white-space:pre-wrap}
      .more .history-list{display:flex;flex-direction:column;gap:4px;margin-top:6px}
      /* Align history item content to the left inside buttons */
      .more .history-list .btn.history-open{display:flex;align-items:center;justify-content:flex-start;text-align:left;flex:1;gap:8px;padding-right:16px;position:relative}
      .more .history-list .btn.history-del{width:20px !important;height:20px !important;padding:0;border:none;background:transparent;box-shadow:none}
      .more .history-list .btn.history-del::before{width:14px;height:14px;margin-right:0}
      /* Restore button sits to the right of History label */
      /* No absolute positioning — align via flex in history mode */
      /* Active state for menu buttons (same style as pinned) */
      .btn.active{background:#1f4f74;border-color:#1f4f74;color:#fff}
      .btn{padding:4px 6px;border-radius:var(--ar-radius, 3px);border:1px solid var(--ar-border, ${PANEL_BORDER});background:#fff;
        color:var(--ar-fg, #000);cursor:pointer;font-size:12px;line-height:1.2}
      .icon-btn{display:inline-flex;align-items:center;justify-content:center;padding:0;-webkit-appearance:none;appearance:none;
        outline:none;border:0;box-shadow:none;background:transparent}
      .icon-btn:focus,
      .icon-btn:focus-visible{outline:none;box-shadow:none}
      .icon-btn::before{
        content:"";display:inline-block;width:24px;height:24px;
        background-image:var(--icon-url);background-repeat:no-repeat;background-position:center;background-size:contain;
        margin-right:0
      }
      .icon-btn:not(.icon-only)::before{margin-right:6px}
      .icon-btn.icon-only{width:30px;height:30px;border-radius:999px;background:transparent;border:0;padding:0;margin:0}
      .icon-inline{display:inline-flex;align-items:center;justify-content:center}
      .icon-inline::before{
        content:"";display:inline-block;width:var(--icon-inline-size, 16px);height:var(--icon-inline-size, 16px);
        background-image:var(--icon-url);background-repeat:no-repeat;background-position:center;background-size:contain
      }
      .color-dot{width:10px;height:10px;border-radius:50%;display:inline-block;flex:0 0 auto}
      #search{order:3}
      .btn.primary{background:#fff}
      /* Align diskette button to the right, before search */
      #more.btn{order:1;margin-left:auto;padding:0}
      #history.btn{order:2;margin:0;padding:0}
      #close.btn{padding:6px}
      /* Pin button styles (filled when pinned) */
      #pin.btn{transition:background-color .15s ease, color .15s ease, border-color .15s ease;padding:0;width:24px;height:24px}
      #pin.btn::before{width:18px;height:18px}
      #pin.btn.pinned{background:transparent;border-color:transparent;color:inherit}
      #pin.btn.pinned::before{filter:none}
      /* Состояние сохранения: без круглой окантовки, только иконка */
      #save.btn.saved{background:transparent;border:0;border-radius:3px;color:inherit}
      #save.btn.saved::before{filter:none}
      #copyId.btn.saved{background:#1f4f74;border-color:#1f4f74;color:#fff}
      #copyId.btn.saved::before{filter:brightness(0) invert(1)}
      /* Unified large button size for primary actions */
      #save.btn, #check.btn, #copyId.btn, #openBot.btn{padding:0;border-radius:3px;font-size:14px;line-height:1.35}
      #save.btn.toast-active{position:relative;background:transparent;border:0;border-radius:3px}
      #save.btn.toast-active::before{filter:none}
      #save.btn.toast-active::after{
        content:attr(data-toast);
        position:absolute;
        inset:0;
        display:flex;
        align-items:center;
        justify-content:center;
        padding:0 6px;
        font-size:12px;
        line-height:1.2;
        color:#fff;
        background:rgba(31,79,116,0.92);
        border-radius:inherit;
        pointer-events:none;
        text-align:center;
      }
      #save.btn, #more.btn.icon-only, #templates.btn.icon-only, #history.btn.icon-only, #search.btn.icon-only{
        border:0;
        background:transparent;
        box-shadow:none;
        padding:0;
        margin:0;
      }
      #save.btn::before, #more.btn.icon-only::before, #templates.btn.icon-only::before, #history.btn.icon-only::before, #search.btn.icon-only::before{filter:none;margin-right:0}
      #search.has-server-report,
      #search.has-legacy-report{position:relative}
      #search.has-legacy-report{
        background-image: radial-gradient(circle, #007aff 0 60%, #fff 61% 100%);
        background-repeat:no-repeat;
        background-size:12px 12px;
        background-position:right 3px top 3px;
      }
      #search.has-server-report::after{
        content:"";
        position:absolute;
        right:3px;
        top:15px;
        width:8px;
        height:8px;
        border-radius:50%;
        background:#ff3b30;
        box-shadow:0 0 0 2px #fff;
      }
      .muted{opacity:.6}
      .foot{margin:0 12px 12px;display:flex;gap:8px;align-items:center}
      input[type="text"]{width:100%;padding:6px 8px;border-radius:var(--ar-radius, 3px);border:1px solid var(--ar-border, ${PANEL_BORDER});background:#fff;color:var(--ar-fg, #000)}
      select{padding:6px 8px;border-radius:var(--ar-radius, 3px);background:transparent;color:var(--ar-fg, #000);border:1px solid var(--ar-border, ${PANEL_BORDER})}
      .small{font-size:12px;opacity:.7}
      /* Launcher button offset from viewport corner */
      #launcher.btn{position:fixed;z-index:2147483645;right:10px;bottom:10px;
        width:286.997px;
        padding:8px 14px;border-radius:3px;font-size:16px;line-height:1.4;
        border:1px solid #1f4f74;color:#1f4f74;
        display:flex;align-items:center;justify-content:space-between;font-weight:600;letter-spacing:0.5px;
        box-shadow:none;background:#eaf0f7}
      #launcher.btn .launcher-content{display:flex;align-items:center;justify-content:space-between;width:100%;gap:12px}
      #launcher.btn .label{display:inline-flex;align-items:center;justify-content:flex-start}
      #launcher.btn .logo-icon{display:inline-block;width:22px;height:22px;background:url('${ICONS.launcher}') no-repeat center/contain;
        opacity:0.85}
      /* Check mode: показываем панель кнопок поиска */
      .more .check-controls{display:none;align-items:center;gap:8px;margin-top:6px}
      .more .check-controls .out{flex:1;max-height:none;overflow:visible;margin:0;padding:0;border:none;text-align:left}
      .more .check-controls .actions{display:flex;gap:4px;align-items:center}
      .more[data-mode="check"] .check-controls{display:flex}
      .more[data-mode="check"] #copyId{margin-left:4px}
      /* Menu descriptions: default download; switch per mode */
      .more .desc{flex-basis:100%;font-size:16px;opacity:.75}
      .more #historyDesc{display:none}
      .more #templatesBox{display:none}
      .more[data-mode="check"] #historyDesc{display:none}
      .more[data-mode="history"]{display:flex;flex-direction:column}
      .more[data-mode="history"] .history-header{display:flex;align-items:center;gap:8px;flex:0 0 auto}
      .more[data-mode="history"] #historyDesc{display:block;flex:1 1 auto;margin-right:0}
      .more[data-mode="history"] #reportsMeta{display:none}
      .more[data-mode="history"] #restoreHistory{margin-left:auto;flex:0 0 auto}
      .more[data-mode="history"] #historyList{flex:1 1 auto;overflow:auto}
      .more[data-mode="reports"]{display:flex;flex-direction:column}
      .more[data-mode="reports"] .history-header{display:flex;align-items:center;gap:8px;flex:0 0 auto}
      .more[data-mode="reports"] #historyDesc{display:none}
      .more[data-mode="reports"] #reportsMeta{display:flex}
      .more[data-mode="reports"] #downloadYesterday,
      .more[data-mode="reports"] #more{display:none}
      .more[data-mode="reports"] #historyList{flex:1 1 auto;overflow:auto}
      .reports-meta{display:none;flex:1 1 auto;align-items:center;gap:8px;min-width:0}
      .reports-meta .reports-box{
        display:flex;align-items:center;height:28px;padding:0 10px;
        border:1px solid var(--ar-border, ${PANEL_BORDER});
        border-radius:var(--ar-radius, 3px);
        background:var(--ar-elevated-bg, ${PANEL_ELEVATED_BG});
        font-size:13px;line-height:1.2;white-space:nowrap
      }
      .reports-meta #reportsTgStatBtn{
        height:28px;padding:0 10px;font-size:13px;line-height:1.2;
        border:1px solid var(--ar-border, ${PANEL_BORDER});
        border-radius:var(--ar-radius, 3px);
        background:#dff1ff;
        color:#0b4f82
      }
      .more[data-mode="templates"]{display:flex;flex-direction:column;height:var(--ar-more-max-height, 280px);max-height:var(--ar-more-max-height, 280px);overflow:hidden}
      .more[data-mode="templates"] #historyDesc,
      .more[data-mode="templates"] #reportsMeta,
      .more[data-mode="templates"] .history-header,
      .more[data-mode="templates"] #historyList,
      .more[data-mode="templates"] .check-controls{display:none}
      .more[data-mode="templates"] #templatesBox{display:flex}
      .templates-box{flex:1 1 auto;display:flex;flex-direction:column;gap:8px;min-height:0}
      .templates-toolbar{display:flex;flex-direction:column;gap:12px;align-items:flex-start}
      .templates-toolbar .path{width:100%;font-weight:600;display:flex;align-items:center;gap:4px;flex-wrap:wrap}
      .templates-toolbar .path .crumb{cursor:pointer;display:inline-flex;align-items:center;gap:4px}
      .templates-toolbar .path .crumb.disabled{cursor:default;opacity:.7}
      .templates-toolbar .path .crumb-sep{opacity:.4;padding:0 3px}
      .templates-toolbar .actions{display:flex;gap:6px;flex:0 0 auto;align-self:flex-start}
      #templatesBack.btn{padding-bottom:5px}
      .templates-list{flex:1 1 auto;overflow:auto;display:flex;flex-direction:column;gap:4px;padding-right:2px}
      .templates-empty{font-size:13px;opacity:.65}
      .templates-item{position:relative;display:flex;flex-direction:column;gap:4px;padding:6px 36px 6px 8px;border:1px solid var(--ar-border, ${PANEL_BORDER});border-radius:var(--ar-radius, 3px);background:var(--ar-elevated-bg, ${PANEL_ELEVATED_BG});transition:background-color .15s ease;border-left-width:3px}
      .templates-item.templates-folder{border-left-color:#1f4f74}
      .templates-item.templates-template{border-left-color:#4c6f96}
      .templates-item.clickable{cursor:pointer}
      .templates-item.clickable:hover{background:rgba(31,79,116,0.05)}
      .templates-text{white-space:pre-wrap;word-break:break-word;font-size:13px;line-height:1.4}
      .templates-text-folder{display:flex;flex-direction:column;gap:2px}
      .templates-text-folder .name{font-weight:600;white-space:normal;word-break:break-word}
      .templates-text-folder .meta{font-size:12px;opacity:.6}
      .templates-more{position:absolute;top:4px;right:4px;width:24px;height:24px;display:flex;align-items:center;justify-content:center;border:none;background:transparent;border-radius:3px;cursor:pointer;color:inherit}
      .templates-more:hover{background:rgba(31,79,116,0.08)}
      .templates-menu{position:absolute;top:calc(100% + 4px);right:4px;display:flex;flex-direction:column;gap:4px;padding:6px;border:1px solid var(--ar-border, ${PANEL_BORDER});border-radius:3px;background:var(--ar-elevated-bg, ${PANEL_ELEVATED_BG});box-shadow:0 6px 18px rgba(31,79,116,0.18);z-index:5;min-width:140px}
      .templates-menu[hidden]{display:none}
      .templates-menu button{width:100%;text-align:left;padding:6px 8px;border:none;background:transparent;border-radius:3px;cursor:pointer;font-size:13px}
      .templates-menu button:hover{background:rgba(31,79,116,0.08)}
      .favorite-toggle.btn{width:20px;height:20px;padding:0;margin-left:6px;border:none;background:transparent;box-shadow:none;opacity:0.75;transition:opacity .12s ease}
      .favorite-toggle.btn::before{filter:none;margin:0}
      .favorite-toggle.btn:hover{opacity:1}
      .favorite-toggle.btn.active::before{filter:invert(76%) sepia(85%) saturate(640%) hue-rotate(360deg) brightness(104%) contrast(104%)}
      .templates-inline-form{margin:4px 0;display:flex;flex-direction:column;gap:6px}
      .templates-inline-form[hidden]{display:none}
      .templates-inline-form form{display:flex;flex-direction:column;gap:8px;padding:8px;border:1px solid var(--ar-border, ${PANEL_BORDER});border-radius:3px;background:var(--ar-elevated-bg, ${PANEL_ELEVATED_BG})}
      .templates-inline-form .templates-form-field{display:flex;flex-direction:column;gap:4px}
      .templates-inline-form input,
      .templates-inline-form textarea{width:100%;padding:6px 8px;border:1px solid var(--ar-border, ${PANEL_BORDER});border-radius:3px;font:inherit;color:inherit;background:var(--ar-bg, ${PANEL_BG});box-sizing:border-box}
      .templates-inline-form select{width:100%;padding:6px 8px;border:1px solid var(--ar-border, ${PANEL_BORDER});border-radius:3px;font:inherit;color:inherit;background:var(--ar-bg, ${PANEL_BG});box-sizing:border-box}
      .templates-inline-form textarea{resize:vertical;min-height:96px}
      .templates-inline-form .templates-form-actions{display:flex;gap:8px;justify-content:flex-end}
      .templates-inline-form .templates-form-actions .btn{flex:0 0 auto}
      .templates-inline-form .templates-form-error{font-size:12px;color:#c0392b}
      .templates-inline-form .templates-form-title{font-weight:600;font-size:13px}
      .head-actions{display:flex;gap:8px;align-items:center}
      .user-info-wrap{position:relative;display:flex;align-items:center;gap:6px}
      .settings-wrap{position:relative;display:flex;align-items:center;gap:6px}
      #settingsBtn.btn{transition:background-color .15s ease, color .15s ease, border-color .15s ease;padding:0;width:24px;height:24px}
      #settingsBtn.btn::before{width:18px;height:18px}
      #settingsBtn.btn.active{background:rgba(31,79,116,0.08);border-color:transparent}
      .settings-row{display:flex;align-items:center;gap:8px;font-size:13px;cursor:pointer}
      .settings-row input{width:16px;height:16px;cursor:pointer}
      .settings-row.is-disabled{opacity:0.55}
      .settings-select{width:100%;max-width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid var(--ar-border, ${PANEL_BORDER});border-radius:3px;background:var(--ar-bg, ${PANEL_BG});font:inherit;color:inherit}
      .settings-search-row{display:flex;gap:8px;align-items:center;margin-top:6px}
      .settings-search-row .settings-select{flex:1 1 auto}
      .settings-search-btn{flex:0 0 auto;padding:6px 10px;border:1px solid #1f4f74;border-radius:3px;background:#1f4f74;color:#fff;font:inherit;font-size:12px;cursor:pointer}
      .settings-search-btn:disabled{opacity:.6;cursor:default}
      .settings-status{font-size:12px;line-height:1.3;min-height:16px}
      .settings-status.muted{opacity:.7}
      .settings-status.error{color:#c0392b}
      .settings-status.success{color:#2d8a34}
      .user-info-menu{position:absolute;left:12px;right:12px;top:var(--user-info-menu-top, 60px);min-width:0;display:flex;flex-direction:column;gap:8px;padding:12px;border-radius:var(--ar-radius, 3px);border:1px solid var(--ar-border, ${PANEL_BORDER});background:var(--ar-elevated-bg, ${PANEL_ELEVATED_BG});box-shadow:0 10px 28px rgba(31,79,116,0.18);z-index:6}
      .user-info-menu::before{content:none}
      .user-info-menu[hidden]{display:none}
      .user-info-details{display:flex;flex-direction:column;gap:6px;font-size:13px;line-height:1.4}
      .user-info-row{font-size:13px;line-height:1.4}
      .user-info-message{font-size:13px;line-height:1.4}
      .user-info-message.muted{opacity:0.7}
      .user-info-message.error{color:#c0392b}
      .user-info-message.success{color:#2d8a34}
      .user-info-download{display:flex;flex-direction:column;gap:8px;font-size:13px}
      .user-info-download-select{width:100%;padding:6px 8px;border:1px solid var(--ar-border, ${PANEL_BORDER});border-radius:3px;background:var(--ar-bg, ${PANEL_BG});font:inherit;color:inherit}
      .user-info-download-row{display:flex;gap:8px;align-items:center}
      .user-info-download-buttons{display:flex;gap:8px}
      .user-info-download-btn{width:34px;height:34px;border-radius:3px;border:1px solid transparent;background:transparent;cursor:pointer;transition:background-color .12s ease,border-color .12s ease,opacity .12s ease}
      .user-info-download-btn:hover:not([disabled]){background:rgba(31,79,116,0.08);border-color:rgba(31,79,116,0.18)}
      .user-info-download-btn[disabled]{opacity:0.4;cursor:default}
      .user-info-download-btn.loading{position:relative;background:rgba(0,0,0,0.02)}
      #userInfo.btn{transition:background-color .15s ease, color .15s ease, border-color .15s ease;padding:0;width:24px;height:24px}
      #userInfo.btn::before{width:18px;height:18px}
      #userInfo.btn.active{background:rgba(31,79,116,0.08);border-color:transparent}
      .auth-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;
        background:rgba(14,24,38,0.55);z-index:2147483647;padding:16px;box-sizing:border-box}
      .auth-modal.open{display:flex}
      .auth-modal[hidden]{display:none}
      .auth-modal-dialog{width:min(420px, 100%);display:flex;flex-direction:column;gap:10px;
        background:#fff;border:1px solid var(--ar-border, ${PANEL_BORDER});border-radius:var(--ar-radius, 3px);
        box-shadow:0 18px 38px rgba(14,24,38,0.28);padding:14px}
      .auth-modal-title{font-size:16px;font-weight:700;line-height:1.2}
      .auth-modal-desc{font-size:13px;opacity:.8;line-height:1.3}
      .auth-modal-input{width:100%;box-sizing:border-box;padding:8px 10px;font-size:14px;line-height:1.2;
        border:1px solid var(--ar-border, ${PANEL_BORDER});border-radius:var(--ar-radius, 3px);background:#fff;color:#000}
      .auth-modal-input:focus,.auth-modal-btn:focus{outline:2px solid rgba(31,79,116,.35);outline-offset:1px}
      .auth-modal-error{font-size:12px;color:#c0392b;line-height:1.2}
      .auth-modal-actions{display:flex;justify-content:flex-end;gap:8px}
      .auth-modal-btn{padding:7px 10px;font-size:13px;line-height:1.2;border:1px solid var(--ar-border, ${PANEL_BORDER});
        border-radius:var(--ar-radius, 3px);background:#fff;color:#000;cursor:pointer}
      .auth-modal-btn.primary{background:#1f4f74;border-color:#1f4f74;color:#fff}
      .auth-modal-btn:disabled{opacity:.6;cursor:default}
      .operator-wait-modal{position:fixed;inset:0;display:none;align-items:center;justify-content:center;
        background:rgba(14,24,38,0.55);z-index:2147483647;padding:16px;box-sizing:border-box}
      .operator-wait-modal.open{display:flex}
      .operator-wait-modal[hidden]{display:none}
      .operator-wait-modal-dialog{width:min(360px, 100%);display:flex;flex-direction:column;gap:12px;
        background:#fff;border:1px solid var(--ar-border, ${PANEL_BORDER});border-radius:var(--ar-radius, 3px);
        box-shadow:0 18px 38px rgba(14,24,38,0.28);padding:14px}
      .operator-wait-modal-text{font-size:14px;line-height:1.35;color:#0f2d4a;text-align:center}
      .operator-wait-modal-actions{display:flex;justify-content:flex-end}
      .operator-wait-modal-btn{padding:7px 14px;font-size:13px;line-height:1.2;border:1px solid #1f4f74;
        border-radius:var(--ar-radius, 3px);background:#1f4f74;color:#fff;cursor:pointer}
    </style>
    <div class="auth-modal" id="authModal" hidden>
      <div class="auth-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
        <div class="auth-modal-title" id="authModalTitle">Доступ к расширению</div>
        <div class="auth-modal-desc">Введите пароль, чтобы продолжить работу.</div>
        <input id="authModalInput" class="auth-modal-input" type="password" name="ot4et_unlock_password" autocomplete="new-password" autocapitalize="off" autocorrect="off" spellcheck="false" aria-autocomplete="none" data-form-type="other" data-lpignore="true" data-1p-ignore="true" data-bwignore="true" placeholder="Пароль">
        <div id="authModalError" class="auth-modal-error" hidden></div>
        <div class="auth-modal-actions">
          <button type="button" id="authModalClose" class="auth-modal-btn">Закрыть</button>
          <button type="button" id="authModalSubmit" class="auth-modal-btn primary">Войти</button>
        </div>
      </div>
    </div>
    <div class="operator-wait-modal" id="operatorWaitModal" hidden>
      <div class="operator-wait-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="operatorWaitModalText">
        <div id="operatorWaitModalText" class="operator-wait-modal-text">${escapeHtml(
          OPERATOR_WAIT_MODAL_MESSAGE
        )}</div>
        <div class="operator-wait-modal-actions">
          <button type="button" id="operatorWaitModalOk" class="operator-wait-modal-btn">ОК</button>
        </div>
      </div>
    </div>
    <div class="drawer" id="drawer">
      <div class="drawer-strip"></div>
      <div class="drawer-inner">
        <div class="drawer-grip" id="drawerGrip" data-label="Потяните вверх/вниз"></div>
        <div class="head" id="head">
          <div class="balance-host" id="balanceHost"></div>
          <div class="head-actions">
            <div class="settings-wrap">
              <button class="btn icon-only" id="settingsBtn" aria-label="Настройки"></button>
            </div>
            <div class="user-info-wrap">
              <button class="btn icon-only" id="userInfo" aria-label="Информация о пользователе"></button>
            </div>
            <button class="btn" id="pin"></button>
            <button class="btn icon-only" id="close" aria-label="Закрыть"></button>
          </div>
        </div>
        <div class="user-info-menu" id="userInfoMenu" hidden></div>
        <div class="user-info-menu" id="settingsMenu" hidden>
          <div class="user-info-details">
            <label class="settings-row">
              <input type="checkbox" id="lettersNewWindowToggle">
              <span>Открывать письма в новом окне</span>
            </label>
            <label class="settings-row">
              <input type="checkbox" id="wsEventsDisabledToggle">
              <span>Вебхук События</span>
            </label>
            <label class="settings-row">
              <input type="checkbox" id="webhooksPaidFilterToggle">
              <span>Только платные события</span>
            </label>
            <label class="settings-row" for="lettersOpenHotkeyInput">
              <span>Горячая клавиша открытия письма</span>
            </label>
            <input class="settings-select" id="lettersOpenHotkeyInput" type="text" placeholder="Горячая клавиша (например cmd+l)">
            <label class="settings-row" for="profilePhotoHotkeyInput">
              <span>Горячая клавиша открытия профиля</span>
            </label>
            <input class="settings-select" id="profilePhotoHotkeyInput" type="text" placeholder="Горячая клавиша (например ctrl+p)">
            <label class="settings-row" for="translateSendHotkeyInput">
              <span>Горячая клавиша Перевести + Отправить</span>
            </label>
            <input class="settings-select" id="translateSendHotkeyInput" type="text" placeholder="Горячая клавиша (например ctrl+g)">
          </div>
        </div>
        <div class="row" id="row" style="display:none">
          <div class="tag"><span id="manLine"></span></div>
          <div class="tag"><span id="womanLine"></span></div>
        </div>
        <textarea id="ta"></textarea>
        <div class="btns" id="btns">
          <button class="btn icon-only" id="save" aria-label="Сохранить"></button>
          <button class="btn icon-only" id="templates" aria-label="Шаблоны"></button>
          <button class="btn icon-only" id="history" aria-label="История"></button>
          <button class="btn icon-only" id="search" aria-label="Проверить отчёты"></button>
          <div class="more" id="moreBox">
            <div class="history-header" hidden>
              <div class="desc" id="historyDesc">История:</div>
              <div class="reports-meta" id="reportsMeta">
                <div class="reports-box" id="reportsServerStat">Отчёты: —</div>
                <button class="btn" id="reportsTgStatBtn" type="button">В Телеграме: —</button>
              </div>
              <button class="btn icon-only" id="downloadYesterday" hidden aria-label="Скачать вчера" style="display:flex;padding-right:10px"></button>
              <button class="btn icon-only" id="more" aria-label="Скачать отчёт"></button>
              <button class="btn icon-only" id="restoreHistory" hidden aria-label="Восстановить" style="display:none"></button>
            </div>
            <div class="check-controls" id="checkControls" hidden>
              <div class="out" id="checkOut" hidden></div>
              <div class="actions">
                <button class="btn icon-only" id="openBot" aria-label="Открыть бота"></button>
                <button class="btn icon-only" id="copyId" aria-label="Скопировать ID"></button>
              </div>
            </div>
            <div class="templates-box" id="templatesBox" hidden>
              <div class="templates-toolbar">
                <div class="path" id="templatesPath"></div>
                <div class="actions">
                  <button class="btn icon-only" id="templatesBack" aria-label="Назад"></button>
                  <button class="btn icon-only" id="templatesNewFolder" aria-label="Новая папка"></button>
                  <button class="btn icon-only" id="templatesNewTemplate" aria-label="Новый шаблон"></button>
                </div>
              </div>
              <div class="templates-inline-form" id="templatesForm" hidden></div>
              <div class="templates-list" id="templatesList"></div>
            </div>
            <div class="history-list" id="historyList" hidden></div>
          </div>
        </div>
      </div>
    </div>
    <button class="btn" id="launcher"></button>
  `;
  shadow.appendChild(wrap);
  document.documentElement.appendChild(root);

  ui = {
    drawer: shadow.getElementById("drawer"),
    drawerGrip: shadow.getElementById("drawerGrip"),
    head: shadow.getElementById("head"),
    balanceHost: shadow.getElementById("balanceHost"),
    row: shadow.getElementById("row"),
    manLine: shadow.getElementById("manLine"),
    womanLine: shadow.getElementById("womanLine"),
    ta: shadow.getElementById("ta"),
    save: shadow.getElementById("save"),
    more: shadow.getElementById("more"),
    moreBox: shadow.getElementById("moreBox"),
    btns: shadow.getElementById("btns"),
    templates: shadow.getElementById("templates"),
    search: shadow.getElementById("search"),
    history: shadow.getElementById("history"),
    historyHeader: shadow.querySelector(".history-header"),
    historyDesc: shadow.getElementById("historyDesc"),
    reportsMeta: shadow.getElementById("reportsMeta"),
    reportsServerStat: shadow.getElementById("reportsServerStat"),
    reportsTgStatBtn: shadow.getElementById("reportsTgStatBtn"),
    restoreHistory: shadow.getElementById("restoreHistory"),
    downloadYesterday: shadow.getElementById("downloadYesterday"),
    checkControls: shadow.getElementById("checkControls"),
    openBot: shadow.getElementById("openBot"),
    copyId: shadow.getElementById("copyId"),
    historyList: shadow.getElementById("historyList"),
    checkOut: shadow.getElementById("checkOut"),
    templatesBox: shadow.getElementById("templatesBox"),
    templatesPath: shadow.getElementById("templatesPath"),
    templatesList: shadow.getElementById("templatesList"),
    templatesForm: shadow.getElementById("templatesForm"),
    templatesNewFolder: shadow.getElementById("templatesNewFolder"),
    templatesNewTemplate: shadow.getElementById("templatesNewTemplate"),
    templatesBack: shadow.getElementById("templatesBack"),
    userInfoMenu: shadow.getElementById("userInfoMenu"),
    userInfo: shadow.getElementById("userInfo"),
    settingsMenu: shadow.getElementById("settingsMenu"),
    settingsBtn: shadow.getElementById("settingsBtn"),
    authModal: shadow.getElementById("authModal"),
    authModalInput: shadow.getElementById("authModalInput"),
    authModalSubmit: shadow.getElementById("authModalSubmit"),
    authModalClose: shadow.getElementById("authModalClose"),
    authModalError: shadow.getElementById("authModalError"),
    operatorWaitModal: shadow.getElementById("operatorWaitModal"),
    operatorWaitModalOk: shadow.getElementById("operatorWaitModalOk"),
    lettersNewWindowToggle: shadow.getElementById("lettersNewWindowToggle"),
    wsEventsDisabledToggle: shadow.getElementById("wsEventsDisabledToggle"),
    webhooksPaidFilterToggle: shadow.getElementById("webhooksPaidFilterToggle"),
    lettersOpenHotkeyInput: shadow.getElementById("lettersOpenHotkeyInput"),
    profilePhotoHotkeyInput: shadow.getElementById("profilePhotoHotkeyInput"),
    translateSendHotkeyInput: shadow.getElementById("translateSendHotkeyInput"),
    profileSwitch: null,
    pin: shadow.getElementById("pin"),
    close: shadow.getElementById("close"),
    launcher: shadow.getElementById("launcher"),
  };

  setupDebugTracing();

  try {
    const balanceMonitor = createBalanceMonitorWidget();
    if (balanceMonitor?.element && ui.balanceHost) {
      ui.balanceHost.appendChild(balanceMonitor.element);
      ui.balanceMonitor = balanceMonitor;
      setWsEventsDisabledSetting(getWsEventsDisabledSetting(), { persist: false });
      syncBalancePanelLayout();
      if (
        !wsEventsDisabled &&
        wsEventQueue.length &&
        typeof balanceMonitor.addWsEvent === "function"
      ) {
        const queued = wsEventQueue.slice();
        wsEventQueue = [];
        queued.forEach((item) => {
          try {
            balanceMonitor.addWsEvent(item);
          } catch {}
        });
      }
      if (wsEventsDisabled) {
        wsEventQueue = [];
      }
    }
  } catch (err) {
    LOG.error("Balance monitor init failed", err);
  }
  applyButtonIcon(ui.close, ICONS.close, { iconOnly: true });
  applyButtonIcon(ui.save, ICONS.save, { iconOnly: true, size: 30 });
  applyButtonIcon(ui.more, ICONS.download, { iconOnly: true });
  applyButtonIcon(ui.templates, ICONS.templates, { iconOnly: true });
  applyButtonIcon(ui.history, ICONS.history, { iconOnly: true });
  applyButtonIcon(ui.search, ICONS.search);
  applyButtonIcon(ui.restoreHistory, ICONS.restore, { iconOnly: true });
  applyButtonIcon(ui.downloadYesterday, ICONS.downloadYesterday, { iconOnly: true, size: 22 });
  applyButtonIcon(ui.openBot, ICONS.openBot, { iconOnly: true });
  applyButtonIcon(ui.copyId, ICONS.copyId, { iconOnly: true });
  applyButtonIcon(ui.userInfo, ICONS.userInfo, { iconOnly: true });
  applyButtonIcon(ui.settingsBtn, ICONS.settings, { iconOnly: true });
  applyButtonIcon(ui.templatesBack, ICONS.restore, { iconOnly: true });
  applyButtonIcon(ui.templatesNewFolder, ICONS.templatesNewFolder, {
    iconOnly: true,
  });
  applyButtonIcon(ui.templatesNewTemplate, ICONS.templatesNewTemplate, {
    iconOnly: true,
  });
  applyButtonIcon(ui.pin, ICONS.pin, { iconOnly: true });
  // Set hover titles/tooltips
  if (ui.more) ui.more.title = "Скачать отчет";
  if (ui.close) ui.close.title = "Закрыть панель";
  if (ui.search) ui.search.title = "Проверить отчёты";
  if (ui.restoreHistory) ui.restoreHistory.title = "Восстановить удалённые";
  if (ui.downloadYesterday) ui.downloadYesterday.title = "Скачать отчёт за вчера";
  if (ui.openBot) ui.openBot.title = "Открыть Telegram бота";
  if (ui.copyId) ui.copyId.title = "Скопировать ID";
  if (ui.reportsTgStatBtn) ui.reportsTgStatBtn.title = "Открыть Telegram бота";
  if (ui.history) ui.history.title = "История";
  if (ui.templates) ui.templates.title = "Шаблоны";
  if (ui.templatesBack) ui.templatesBack.title = "Назад";
  if (ui.settingsBtn) ui.settingsBtn.title = "Настройки";
  if (ui.templatesNewFolder) ui.templatesNewFolder.title = "Новая папка";
  if (ui.templatesNewTemplate) ui.templatesNewTemplate.title = "Новый шаблон";
  if (ui.userInfo) {
    ui.userInfo.title = "Информация о пользователе";
    ui.userInfo.setAttribute("aria-expanded", "false");
    ui.userInfo.setAttribute("aria-controls", "userInfoMenu");
  }
  if (ui.authModalClose) {
    ui.authModalClose.onclick = () => {
      closeAuthModal();
      updateLauncherVisibility();
    };
  }
  if (ui.authModalSubmit) {
    ui.authModalSubmit.onclick = () => {
      submitAuthModal();
    };
  }
  if (ui.authModalInput) {
    ui.authModalInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        submitAuthModal();
      } else if (event.key === "Escape") {
        event.preventDefault();
        closeAuthModal();
      }
    });
  }
  if (ui.authModal) {
    ui.authModal.addEventListener("click", (event) => {
      if (event.target === ui.authModal) {
        closeAuthModal();
      }
    });
  }
  if (ui.operatorWaitModalOk) {
    ui.operatorWaitModalOk.onclick = () => {
      closeOperatorWaitModal();
    };
  }
  if (ui.operatorWaitModal) {
    ui.operatorWaitModal.addEventListener("click", (event) => {
      if (event.target === ui.operatorWaitModal) {
        closeOperatorWaitModal();
      }
    });
  }
  initMonitorCounterSync();
  (async () => {
    if (!ui.userInfo || !ui.userInfoMenu) return;
    try {
      const module = await loadUserInfoModule();
      if (module?.initUserInfoMenu) {
        userInfoController = module.initUserInfoMenu({
          button: ui.userInfo,
          menu: ui.userInfoMenu,
        });
      }
    } catch (err) {
      LOG.error("User info menu init failed", err);
    }
  })();
  // default mode for the contextual panel is download-only
  ui.moreBox.dataset.mode = "download";
  if (ui.checkOut) ui.checkOut.hidden = true;
  if (ui.checkControls) ui.checkControls.hidden = true;
  if (ui.openBot) ui.openBot.hidden = true;
  if (ui.copyId) ui.copyId.hidden = true;
  if (ui.restoreHistory) ui.restoreHistory.hidden = true;
  if (ui.downloadYesterday) ui.downloadYesterday.hidden = true;
  if (ui.historyList) ui.historyList.hidden = true;
  if (ui.templatesBox) ui.templatesBox.hidden = true;
  updateReportsHeaderStats(null, null);

  setupDrawerHeightResize();
  loadDrawerHeightPreference();
  try {
    if (ui.ta) {
      ui.taResizeObserver = new ResizeObserver(() => {
        positionDrawer();
        syncBalancePanelLayout();
      });
      ui.taResizeObserver.observe(ui.ta);
    }
  } catch {}

  ui.close.onclick = () => {
    ui.drawer.classList.remove("open");
    drawerManuallyClosed = true;
    ui.moreBox.classList.remove("open");
    try {
      ui.more.classList.remove("active");
      ui.history.classList.remove("active");
      ui.search.classList.remove("active");
      ui.templates.classList.remove("active");
    } catch {}
    if (ui.checkControls) ui.checkControls.hidden = true;
    if (ui.openBot) ui.openBot.hidden = true;
    if (ui.copyId) ui.copyId.hidden = true;
    if (ui.checkOut) ui.checkOut.hidden = true;
    if (ui.templatesBox) ui.templatesBox.hidden = true;
    closeTemplatesMenu();
    closeBalanceDetails();
    closeTemplatesInlineForm();
    closeUserInfoMenu();
    updateLauncherVisibility();
  };
  ui.save.onclick = () => {
    if (requireExtensionUnlock()) return;
    onSave();
  };
  ui.pin.onclick = () => {
    if (requireExtensionUnlock()) return;
    togglePinned();
  };
  initProfileSwitchInlineButton();
  initLogoWhiteSquare();
  // Download today's report directly from the main button
  ui.more.onclick = () => {
    if (requireExtensionUnlock()) return;
    try {
      closeUserInfoMenu();
      ui.moreBox.classList.remove("open");
      if (ui.historyHeader) ui.historyHeader.hidden = true;
      if (ui.checkControls) ui.checkControls.hidden = true;
      if (ui.openBot) ui.openBot.hidden = true;
      if (ui.copyId) ui.copyId.hidden = true;
      if (ui.downloadYesterday) ui.downloadYesterday.hidden = true;
      if (ui.restoreHistory) ui.restoreHistory.hidden = true;
      if (ui.historyList) {
        ui.historyList.hidden = true;
        ui.historyList.innerHTML = "";
      }
      if (ui.checkOut) ui.checkOut.hidden = true;
      if (ui.templatesBox) ui.templatesBox.hidden = true;
      closeTemplatesMenu();
      closeTemplatesInlineForm();
      ui.more.classList.remove("active");
      ui.history?.classList?.remove("active");
      ui.search?.classList?.remove("active");
      ui.templates?.classList?.remove("active");
    } catch {}
    onDownloadDay("today");
  };
  if (ui.templates)
    ui.templates.onclick = () => {
      if (requireExtensionUnlock()) return;
      closeUserInfoMenu();
      const isOpen = ui.moreBox.classList.contains("open");
      const mode = ui.moreBox.dataset.mode;
      if (isOpen && mode === "templates") {
        ui.moreBox.classList.remove("open");
        try {
          ui.more.classList.remove("active");
          ui.history.classList.remove("active");
          ui.search.classList.remove("active");
          ui.templates.classList.remove("active");
        } catch {}
        if (ui.historyHeader) ui.historyHeader.hidden = true;
        if (ui.checkControls) ui.checkControls.hidden = true;
        if (ui.openBot) ui.openBot.hidden = true;
        if (ui.copyId) ui.copyId.hidden = true;
        if (ui.checkOut) ui.checkOut.hidden = true;
        if (ui.downloadYesterday) ui.downloadYesterday.hidden = true;
        if (ui.restoreHistory) ui.restoreHistory.hidden = true;
        if (ui.historyList) {
          ui.historyList.hidden = true;
          ui.historyList.innerHTML = "";
        }
        if (ui.templatesBox) ui.templatesBox.hidden = true;
        closeTemplatesMenu();
        closeTemplatesInlineForm();
      } else {
        ui.moreBox.dataset.mode = "templates";
        if (ui.historyHeader) ui.historyHeader.hidden = true;
        if (ui.historyList) {
          ui.historyList.hidden = true;
          ui.historyList.innerHTML = "";
        }
        if (ui.checkControls) ui.checkControls.hidden = true;
        if (ui.openBot) ui.openBot.hidden = true;
        if (ui.copyId) ui.copyId.hidden = true;
        if (ui.downloadYesterday) ui.downloadYesterday.hidden = true;
        if (ui.restoreHistory) ui.restoreHistory.hidden = true;
        if (ui.checkOut) ui.checkOut.hidden = true;
        if (ui.templatesBox) {
          ui.templatesBox.hidden = false;
          closeTemplatesInlineForm();
          renderTemplatesList();
        }
        ui.moreBox.classList.add("open");
        try {
          ui.more.classList.remove("active");
          ui.history.classList.remove("active");
          ui.search.classList.remove("active");
          ui.templates.classList.add("active");
        } catch {}
      }
    };
  // History menu
  if (ui.history)
    ui.history.onclick = () => {
      if (requireExtensionUnlock()) return;
      closeUserInfoMenu();
      const isOpen = ui.moreBox.classList.contains("open");
      const mode = ui.moreBox.dataset.mode;
      if (isOpen && mode === "history") {
        ui.moreBox.classList.remove("open");
        try {
          ui.more.classList.remove("active");
          ui.history.classList.remove("active");
          ui.search.classList.remove("active");
          ui.templates.classList.remove("active");
        } catch {}
        if (ui.historyHeader) ui.historyHeader.hidden = true;
        if (ui.checkControls) ui.checkControls.hidden = true;
        if (ui.openBot) ui.openBot.hidden = true;
        if (ui.copyId) ui.copyId.hidden = true;
        if (ui.checkOut) ui.checkOut.hidden = true;
        if (ui.templatesBox) ui.templatesBox.hidden = true;
        closeTemplatesMenu();
        closeTemplatesInlineForm();
      } else {
        ui.moreBox.dataset.mode = "history";
        if (ui.checkControls) ui.checkControls.hidden = true;
        if (ui.openBot) ui.openBot.hidden = true;
        if (ui.copyId) ui.copyId.hidden = true;
        if (ui.downloadYesterday) {
          ui.downloadYesterday.hidden = false;
          ui.downloadYesterday.style.display = "";
        }
        if (ui.restoreHistory) ui.restoreHistory.hidden = false;
        if (ui.checkOut) ui.checkOut.hidden = true;
        if (ui.templatesBox) ui.templatesBox.hidden = true;
        closeTemplatesMenu();
        closeTemplatesInlineForm();
        if (ui.historyList) ui.historyList.hidden = false;
        if (ui.historyHeader) ui.historyHeader.hidden = false;
        if (ui.historyDesc) {
          ui.historyDesc.textContent = t("history") || "История";
        }
        (async () => {
          try {
            const { historyItems: hist } = await getStore(["historyItems"]);
            historyItems = Array.isArray(hist) ? hist : [];
          } catch {}
          await renderHistoryList();
        })();
        ui.moreBox.classList.add("open");
        try {
          ui.more.classList.remove("active");
          ui.search.classList.remove("active");
          ui.templates.classList.remove("active");
          ui.history.classList.add("active");
        } catch {}
      }
    };
  ui.search.onclick = () => {
    if (requireExtensionUnlock()) return;
    closeUserInfoMenu();
    const isOpen = ui.moreBox.classList.contains("open");
    const mode = ui.moreBox.dataset.mode;
    if (isOpen && mode === "reports") {
      ui.moreBox.classList.remove("open");
      try {
        ui.more.classList.remove("active");
        ui.history.classList.remove("active");
        ui.search.classList.remove("active");
        ui.templates.classList.remove("active");
      } catch {}
      if (ui.historyHeader) ui.historyHeader.hidden = true;
      if (ui.checkControls) ui.checkControls.hidden = true;
      if (ui.openBot) ui.openBot.hidden = true;
      if (ui.copyId) ui.copyId.hidden = true;
      if (ui.checkOut) ui.checkOut.hidden = true;
      if (ui.templatesBox) ui.templatesBox.hidden = true;
      closeTemplatesMenu();
      closeTemplatesInlineForm();
    } else {
      ui.moreBox.dataset.mode = "reports";
      if (ui.checkControls) ui.checkControls.hidden = true;
      if (ui.openBot) ui.openBot.hidden = true;
      if (ui.copyId) ui.copyId.hidden = true;
      if (ui.downloadYesterday) {
        ui.downloadYesterday.hidden = true;
        ui.downloadYesterday.style.display = "none";
      }
      if (ui.restoreHistory) ui.restoreHistory.hidden = true;
      if (ui.historyList) {
        ui.historyList.hidden = false;
        ui.historyList.innerHTML = "";
      }
      if (ui.templatesBox) ui.templatesBox.hidden = true;
      closeTemplatesMenu();
      closeTemplatesInlineForm();
      if (ui.checkOut) {
        ui.checkOut.hidden = true;
      }
      if (ui.historyHeader) ui.historyHeader.hidden = false;
      updateReportsHeaderStats(null, null);
      ui.moreBox.classList.add("open");
      renderServerReportsList();
      try {
        ui.more.classList.remove("active");
        ui.history.classList.remove("active");
        ui.templates.classList.remove("active");
      } catch {}
    }
  };
  if (ui.copyId) ui.copyId.onclick = onCopyId;
  if (ui.openBot)
    ui.openBot.onclick = () => {
      if (requireExtensionUnlock()) return;
      try {
        window.open("https://t.me/B0TCHET_bot", "_blank");
      } catch (e) {
        LOG.warn("openBot click error", e);
      }
    };
  if (ui.reportsTgStatBtn)
    ui.reportsTgStatBtn.onclick = () => {
      if (requireExtensionUnlock()) return;
      try {
        window.open("https://t.me/B0TCHET_bot", "_blank");
      } catch (e) {
        LOG.warn("reportsTgStatBtn click error", e);
      }
    };
  if (ui.downloadYesterday)
    ui.downloadYesterday.onclick = () => {
      if (requireExtensionUnlock()) return;
      const warningRaw = t("confirmDownloadYesterday");
      const warning =
        typeof warningRaw === "string" && warningRaw.trim()
          ? warningRaw
          : "Вы скачиваете отчёт за вчера. Продолжить?";
      if (!confirm(warning)) return;
      onDownloadDay("yesterday");
    };
  if (ui.restoreHistory)
    ui.restoreHistory.onclick = async () => {
      if (requireExtensionUnlock()) return;
      try {
        const today = dayKey(Date.now());
        const { historyItems: current = [], historyTrash: trashRaw = [] } =
          await getStore(["historyItems", "historyTrash"]);
        const trash = Array.isArray(trashRaw) ? trashRaw : [];
        // candidates for restore: only those deleted today
        const candidates = trash.filter((it) => {
          try {
            return dayKey(it.deletedAt || it.ts || 0) === today;
          } catch {
            return false;
          }
        });
        if (!candidates.length) {
          // nothing to restore today; silently exit
          return;
        }
        // pick the most recently deleted
        const one = candidates.sort(
          (a, b) => (b.deletedAt || b.ts || 0) - (a.deletedAt || a.ts || 0)
        )[0];
        const byKey = new Map(
          (current || []).map((x) => [
            x.key || normalizeChatUrl(x.link || x.id),
            x,
          ])
        );
        const k = one.key || normalizeChatUrl(one.link || one.id);
        if (!byKey.has(k)) byKey.set(k, one);
        historyItems = Array.from(byKey.values()).sort((a, b) => b.ts - a.ts);
        const nextTrash = trash.filter(
          (it) => (it.key || normalizeChatUrl(it.link || it.id)) !== k
        );
        await setStore({ historyItems, historyTrash: nextTrash });
        await renderHistoryList();
        // restored silently (no toast)
      } catch (e) {
        LOG.warn("restoreHistory error", e);
      }
    };
  if (ui.templatesNewFolder)
    ui.templatesNewFolder.onclick = (ev) => {
      try {
        ev.preventDefault();
      } catch {}
      onTemplatesCreateFolder();
    };
  if (ui.templatesNewTemplate)
    ui.templatesNewTemplate.onclick = (ev) => {
      try {
        ev.preventDefault();
      } catch {}
      onTemplatesCreateTemplate();
    };
  if (ui.templatesBack)
    ui.templatesBack.onclick = (ev) => {
      try {
        ev.preventDefault();
      } catch {}
      const entry = getTemplateEntry(currentTemplateFolderId);
      const parentId = entry?.parentId;
      if (parentId) {
        currentTemplateFolderId = parentId;
        persistTemplateFolder(currentTemplateFolderId);
        renderTemplatesList();
      }
    };
  ui.launcher.onclick = () => {
    if (isUiBlockedByMissingOperatorId()) {
      openOperatorWaitModal();
      return;
    }
    togglePanel();
  };
  ui.ta.addEventListener("input", onTextChanged, { passive: true });
  LOG.log("buildPanel: UI wired");
  try { updateButtonsCompact(); } catch {}
  try { syncBalancePanelLayout(); } catch {}
}

// Derive styles (text color, background, shapes) from page classes
function applyThemeFromPage() {
  try {
    const sel = ".styles_clmn_4_block_paid_item__8cxOZ.styles_write__LNP7H";
    const ref =
      document.querySelector(sel) ||
      document.querySelector(".styles_clmn_4_block_paid_item__8cxOZ") ||
      document.querySelector(".styles_write__LNP7H") ||
      document.body;
    const cs = getComputedStyle(ref);
    const fg = cs.color || "#000";
    const borderColor =
      cs.borderColor && cs.borderColor !== "rgba(0, 0, 0, 0)"
        ? cs.borderColor
        : PANEL_BORDER;
    const radius =
      cs.borderRadius && cs.borderRadius !== "0px" ? cs.borderRadius : PANEL_RADIUS;
    const font = cs.fontFamily || "system-ui, sans-serif";
    const fontSize = cs.fontSize || "14px";
    const bg = PANEL_BG;
    const elevatedBg = PANEL_ELEVATED_BG;
    // Apply as CSS variables on the drawer
    if (ui?.drawer) {
      const st = ui.drawer.style;
      st.setProperty("--ar-fg", fg);
      // Match host background (fallback to brand panel color)
      st.setProperty("--ar-bg", bg);
      st.setProperty("--ar-elevated-bg", elevatedBg);
      st.setProperty("--ar-border", borderColor || PANEL_BORDER);
      st.setProperty("--ar-radius", radius);
      st.setProperty("--ar-font", font);
      st.setProperty("--ar-font-size", fontSize);
    }
  } catch (e) {
    LOG.warn("applyThemeFromPage error", e);
  }
}

function repaintTexts() {
  if (ui.more) ui.more.textContent = "";
  if (ui.pin) {
    const pinLabel = pinned ? t("unpinned") : t("pinned");
    ui.pin.textContent = "";
    ui.pin.classList.toggle("pinned", !!pinned);
    applyButtonIcon(ui.pin, pinned ? ICONS.pinActive : ICONS.pin, {
      iconOnly: true,
    });
    try {
      ui.pin.title = pinLabel;
      ui.pin.setAttribute("aria-label", pinLabel);
    } catch {}
  }
  if (ui.launcher) {
    const label = document.createElement("span");
    label.className = "label";
    label.textContent = t("title");
    const logo = document.createElement("span");
    logo.className = "logo-icon";
    const content = document.createElement("span");
    content.className = "launcher-content";
    content.appendChild(label);
    content.appendChild(logo);
    ui.launcher.innerHTML = "";
    ui.launcher.appendChild(content);
  }
  updateLogoWhiteSquareTexts();
  updateSaveVisual();
}

function updateButtonsCompact() {
  try {
    if (!ui?.btns) return;
    // Reset to normal, measure overflow, then enable compact if needed
    ui.btns.classList.remove("compact");
    const needsCompact = ui.btns.scrollWidth > ui.btns.clientWidth + 1; // tolerate 1px rounding
    if (needsCompact) ui.btns.classList.add("compact");
    try {
      syncBalancePanelLayout();
    } catch {}
  } catch {}
}

function syncBalancePanelLayout() {
  try {
    if (!ui?.balanceMonitor || !ui?.ta || !ui?.head) return;
    const bm = ui.balanceMonitor;
    let taHeight = 0;
    try {
      taHeight = ui.ta.getBoundingClientRect().height;
    } catch {}
    if (!taHeight) {
      try {
        taHeight = parseFloat(getComputedStyle(ui.ta).height) || 0;
      } catch {}
    }
    if (taHeight && bm.setListHeight) {
      bm.setListHeight(taHeight);
    }

    const headRect = ui.head.getBoundingClientRect();
    const taRect = ui.ta.getBoundingClientRect();
    const btnRect = ui.btns?.getBoundingClientRect?.();
    if (!headRect || !taRect) return;

    let leftOffset = taRect.left - headRect.left;
    if (!Number.isFinite(leftOffset)) leftOffset = 0;
    try {
      const headStyles = getComputedStyle(ui.head);
      const padLeft = parseFloat(headStyles.paddingLeft || "0") || 0;
      leftOffset -= padLeft;
    } catch {}
    leftOffset = Math.max(0, leftOffset);
    if (bm.setDetailsBounds) {
      bm.setDetailsBounds(leftOffset, taRect.width);
    }

    if (bm.setPointerOffset) {
      let toggle =
        ui.balanceMonitorToggle ||
        bm.element?.querySelector?.("#adb-toggle") ||
        null;
      if (toggle && !ui.balanceMonitorToggle) {
        ui.balanceMonitorToggle = toggle;
      }
      let pointer = null;
      if (toggle) {
        const toggleRect = toggle.getBoundingClientRect();
        if (toggleRect && toggleRect.width > 0) {
          pointer =
            toggleRect.left -
            headRect.left -
            leftOffset +
            toggleRect.width / 2;
        }
      }
      const width = taRect.width;
      if (!Number.isFinite(pointer) && width > 0) {
        const maxPointer = Math.max(12, width - 18);
        pointer = Math.max(12, Math.min(maxPointer, width / 2));
      } else if (Number.isFinite(pointer) && width > 0) {
        const maxPointer = Math.max(12, width - 18);
        pointer = Math.max(12, Math.min(maxPointer, pointer));
      }
      if (Number.isFinite(pointer) && pointer >= 0) {
        bm.setPointerOffset(pointer);
      } else if (bm.setPointerOffset) {
        bm.setPointerOffset(null);
      }
    }

    if (bm.setMaxContainerHeight) {
      if (btnRect) {
        const available = btnRect.top - headRect.bottom - 12;
        bm.setMaxContainerHeight(
          Number.isFinite(available) && available > 0 ? available : null
        );
      } else {
        bm.setMaxContainerHeight(null);
      }
    }
    if (bm.setListHeightLimit) bm.setListHeightLimit(null);
  } catch (err) {
    LOG.warn("syncBalancePanelLayout error", err);
  }
}

function applyTextareaHeight(px) {
  try {
    if (!ui?.ta) return;
    const minH = parseFloat(getComputedStyle(ui.ta).minHeight) || 0;
    let h = Number(px) || 0;
    if (h < minH) h = minH;
    ui.ta.style.height = `${Math.round(h)}px`;
    syncBalancePanelLayout();
  } catch {}
}

function rememberTextareaHeight(px) {
  try {
    const h = Math.max(0, Math.round(Number(px) || 0));
    if (!h) return;
    setStore({ taHeight: h }).catch(() => {});
  } catch {}
}

function getDrawerHeightLimits(rect) {
  const minHeight = MIN_DRAWER_HEIGHT;
  let maxHeight = Math.max(minHeight, Math.floor(window.innerHeight || minHeight));
  if (rect && Number.isFinite(rect.height)) {
    const rectHeight = Math.floor(rect.height);
    if (rectHeight > 0) {
      maxHeight = Math.max(minHeight, rectHeight);
    }
  }
  return { minHeight, maxHeight };
}

function getCurrentDrawerHeight() {
  try {
    const rect = ui.drawer?.getBoundingClientRect?.();
    if (rect && rect.height) {
      return Math.round(rect.height);
    }
  } catch {}
  return 0;
}

function clampDrawerHeightValue(px) {
  let val = Math.round(Number(px) || 0);
  if (!Number.isFinite(val) || val <= 0) return 0;
  if (val < MIN_DRAWER_HEIGHT) val = MIN_DRAWER_HEIGHT;
  return val;
}

function persistDrawerHeightPreference(px) {
  try {
    const val = clampDrawerHeightValue(px);
    if (!val) return;
    drawerHeightOverride = val;
    setStore({ [DRAWER_HEIGHT_STORAGE_KEY]: val }).catch(() => {});
  } catch {}
}

function loadDrawerHeightPreference() {
  getStore([DRAWER_HEIGHT_STORAGE_KEY])
    .then((data = {}) => {
      const raw = data[DRAWER_HEIGHT_STORAGE_KEY];
      const val = clampDrawerHeightValue(raw);
      if (!val) return;
      drawerHeightOverride = val;
      positionDrawer();
    })
    .catch(() => {});
}

function setupDrawerHeightResize() {
  try {
    if (!ui?.drawer || !ui?.drawerGrip) return;
    if (ui.drawerGrip.dataset.resizeInit === "1") return;
    ui.drawerGrip.dataset.resizeInit = "1";

    let pointerId = null;
    let startY = 0;
    let startHeight = 0;

    const cleanup = (ev) => {
      if (pointerId === null || (ev && ev.pointerId !== pointerId)) return;
      const id = pointerId;
      pointerId = null;
      try {
        ui.drawerGrip.releasePointerCapture(ev ? ev.pointerId : id);
      } catch {}
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", cleanup);
      window.removeEventListener("pointercancel", cleanup);
      ui.drawer.classList.remove("dragging");
      const finalHeight =
        Number.isFinite(drawerHeightOverride) && drawerHeightOverride
          ? drawerHeightOverride
          : getCurrentDrawerHeight();
      if (finalHeight) persistDrawerHeightPreference(finalHeight);
    };

    const onPointerMove = (ev) => {
      if (pointerId === null || ev.pointerId !== pointerId) return;
      ev.preventDefault();
      const anchor = getDrawerAnchorElement();
      if (!anchor || !isVisible(anchor)) return;
      const rect = anchor.getBoundingClientRect();
      const { minHeight, maxHeight } = getDrawerHeightLimits(rect);
      const delta = startY - ev.clientY;
      let next = startHeight + delta;
      if (!Number.isFinite(next)) next = minHeight;
      next = Math.max(minHeight, Math.min(maxHeight, Math.round(next)));
      drawerHeightOverride = next;
      positionDrawer();
    };

    ui.drawerGrip.addEventListener("pointerdown", (ev) => {
      try {
        if (!ui.drawer.classList.contains("open")) return;
        if (ev.button !== undefined && ev.button !== 0) return;
        const anchor = getDrawerAnchorElement();
        if (!anchor || !isVisible(anchor)) return;
        const rect = anchor.getBoundingClientRect();
        pointerId = ev.pointerId;
        startY = ev.clientY;
        startHeight = getCurrentDrawerHeight();
        if (!Number.isFinite(startHeight) || startHeight <= 0) {
          startHeight = Math.max(
            MIN_DRAWER_HEIGHT,
            Math.floor(rect.height / 2)
          );
        }
        try {
          ui.drawerGrip.setPointerCapture(pointerId);
        } catch {}
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", cleanup);
        window.addEventListener("pointercancel", cleanup);
        ui.drawer.classList.add("dragging");
        ev.preventDefault();
      } catch {}
    });
  } catch {}
}

function positionDrawer() {
  if (!ui?.drawer) return;
  const anchor = getDrawerAnchorElement();
  if (anchor && isVisible(anchor)) {
    const rect = anchor.getBoundingClientRect();
    const leftPx = Math.max(0, Math.floor(rect.left));
    const widthPx = Math.max(0, Math.floor(rect.width));
    ui.drawer.style.height = "auto";
    const contentHeight = Math.ceil(ui.drawer.scrollHeight);
    const { minHeight, maxHeight } = getDrawerHeightLimits(rect);
    const defaultCap = Math.max(minHeight, Math.min(maxHeight, MIN_DRAWER_HEIGHT));
    let heightPx = Math.max(minHeight, Math.min(defaultCap, contentHeight));
    if (Number.isFinite(drawerHeightOverride)) {
      heightPx = Math.max(minHeight, Math.min(maxHeight, drawerHeightOverride));
    }
    const topPx = Math.max(0, Math.floor(rect.bottom - heightPx));
    ui.drawer.style.top = `${topPx}px`;
    ui.drawer.style.bottom = "";
    ui.drawer.style.left = `${leftPx}px`;
    ui.drawer.style.right = "";
    ui.drawer.style.width = `${widthPx}px`;
    ui.drawer.style.height = `${heightPx}px`;
  } else {
    // No chat layout anchor detected: keep compact fallback instead of full-screen.
    ui.drawer.style.top = "";
    ui.drawer.style.right = "10px";
    ui.drawer.style.left = "";
    ui.drawer.style.bottom = "56px";
    ui.drawer.style.width = "286.997px";
    ui.drawer.style.height = "420px";
  }
  try {
    const btnRect = ui.btns?.getBoundingClientRect?.();
    const drawerRect = ui.drawer?.getBoundingClientRect?.();
    const headRect = ui.head?.getBoundingClientRect?.();
    const gripRect = ui.drawerGrip?.getBoundingClientRect?.();
    const rowRect = ui.row?.getBoundingClientRect?.();
    const gripHeight = gripRect?.height ? Math.ceil(gripRect.height) : 0;
    ui.drawer.style.setProperty(
      "--ar-grip-height",
      `${gripHeight || 0}px`
    );
    const headHeight = headRect?.height ? Math.ceil(headRect.height) : 0;
    ui.drawer.style.setProperty(
      "--ar-head-height",
      `${headHeight + gripHeight}px`
    );
    const rowBottom = rowRect && rowRect.height > 0 ? rowRect.bottom : null;
    const safeTop =
      rowBottom ??
      (headRect && headRect.bottom ? headRect.bottom : drawerRect?.top || 0);
    let gap = 6;
    try {
      const mb = ui.moreBox;
      if (mb) {
        const bw = parseFloat(getComputedStyle(mb).borderTopWidth || "0") || 0;
        gap += Math.max(4, bw + 2);
      } else {
        gap += 4;
      }
    } catch {
      gap += 4;
    }
    gap = Math.max(gap, 20);
    let avail = 320;
    if (btnRect && safeTop) {
      const maybe = Math.floor(btnRect.top - safeTop - gap);
      if (!Number.isNaN(maybe)) avail = Math.max(0, maybe);
    }
    ui.drawer.style.setProperty("--ar-more-max-height", `${avail}px`);
  } catch {}
  if (ui.launcher) {
    ui.launcher.style.top = "";
    ui.launcher.style.bottom = "10px";
    ui.launcher.style.right = "10px";
    ui.launcher.style.width = "286.997px";
  }
  try { updateButtonsCompact(); } catch {}
}

function fillHeader() {
  const { man, woman } = readContext();
  const manLine = `${man.name || "?"}${man.age ? ` (${man.age})` : ""} | ${t(
    "id"
  )}: ${man.id || "?"}`;
  const womanLine = `${woman.name || "?"}${
    woman.age ? ` (${woman.age})` : ""
  } | ${t("id")}: ${woman.id || "?"}`;
  ui.manLine.textContent = manLine;
  ui.womanLine.textContent = womanLine;
}

  async function togglePanel() {
    if (!ui?.drawer) return;
    if (requireExtensionUnlock()) return;
    const wasOpen = ui.drawer.classList.contains("open");
    if (!wasOpen && serverAuthPassword) {
      const accessAllowed = await ensureServerAccess({ force: true });
      if (!accessAllowed) {
        if (serverAuthLastFailureKind === "hard") {
          await persistExtensionUnlockState(false);
          ui.drawer.classList.remove("open");
          ui.moreBox.classList.remove("open");
          openAuthModal();
          updateLauncherVisibility();
          return;
        }
      }
    }
    if (!wasOpen && isAlphaLanding()) {
      updateLauncherVisibility();
      return;
    }
    ui.drawer.classList.toggle("open");
    if (!ui.drawer.classList.contains("open")) {
      drawerManuallyClosed = true;
      ui.moreBox.classList.remove("open");
      if (ui.checkControls) ui.checkControls.hidden = true;
      if (ui.openBot) ui.openBot.hidden = true;
      if (ui.copyId) ui.copyId.hidden = true;
      if (ui.checkOut) ui.checkOut.hidden = true;
      closeBalanceDetails();
      closeUserInfoMenu();
      positionDrawer();
    } else {
      drawerManuallyClosed = false;
      if (isAlphaLanding()) {
        ui.drawer.classList.remove("open");
        updateLauncherVisibility();
        return;
      }
      LOG.log("togglePanel: opened");
      positionDrawer();
      applyThemeFromPage();
      fillHeader();
      // Initialize textarea for current context on open
      loadTextForCurrent(true);
    }
    updateLauncherVisibility();
  }
let pinned = false;
let drawerManuallyClosed = false;
let drawerHeightOverride = null;
// Track external modal visibility to auto-close/open the drawer
const MODAL_SELECTORS = [
  ".ReactModal__Content.ReactModal__Content--after-open",
  ".media-content-block",
  ".media-content-block.open",
];
const MODAL_POLL_INTERVAL = 400;
const MODAL_DEBOUNCE_MS = 400;
let modalPollTimer = null;
let wasModalOpen = false;
let modalDebounceTimer = null;
let pendingModalInfo = null;

const MEDIA_SENT_ICON_ATTR = "data-ot4et-sent-icon";
let mediaSentLinks = new Map();
const mediaDocListeners = new WeakSet();
const MEDIA_BUTTON_SELECTOR =
  ".add-image-btn, .add-video-btn, [data-testid=\"add-image-btn\"], [data-testid=\"add-video-btn\"], [data-action=\"add-image\"], [data-action=\"add-video\"], [data-type=\"add-image\"], [data-type=\"add-video\"]";
const MEDIA_DELETE_URL = "https://alpha.date/api/files/deleteMedia";
const MEDIA_DELETE_BUTTON_CLASS = "ot4et-media-delete-btn";
const MEDIA_DELETE_STYLE_ID = "ot4et-media-delete-style";
const MEDIA_DELETE_MODAL_ID = "ot4et-media-delete-modal";
const MEDIA_CHAT_STORAGE_KEY = "OT4ET_MEDIA_CHATIDS";
const MEDIA_PIN_STORAGE_KEY = "OT4ET_MEDIA_PINNED_IDS";
const MEDIA_PIN_BUTTON_ATTR = "data-ot4et-media-pin-btn";
const MEDIA_PINNED_ATTR = "data-ot4et-pinned";
const mediaChatIdMap = new Map();
let mediaChatMapLoaded = false;
const mediaPinnedIds = new Set();
let mediaPinnedLoaded = false;

function normalizeMediaLink(link) {
  return String(link || "").trim();
}

function collectMediaDocuments() {
  const documents = [document];
  ensureMediaDocumentListeners(document);
  try {
    const frames = document.querySelectorAll("iframe");
    for (const frame of frames) {
      try {
        if (frame && !frame.hasAttribute("data-ot4et-sent-watch")) {
          frame.setAttribute("data-ot4et-sent-watch", "1");
          frame.addEventListener("load", () => {
            try {
              const doc = frame?.contentDocument;
              if (doc) ensureMediaDocumentListeners(doc);
              syncMediaBottomIcons();
            } catch {}
          });
        }
        const doc = frame?.contentDocument;
        if (doc && !documents.includes(doc)) {
          documents.push(doc);
          ensureMediaDocumentListeners(doc);
        }
      } catch {}
    }
  } catch {}
  return documents;
}

function ensureMediaDocumentListeners(doc) {
  try {
    if (!doc || mediaDocListeners.has(doc)) return;
    doc.addEventListener("click", handleMediaAddButtonClick, true);
    doc.addEventListener("change", handleMediaSelectionChange, true);
    mediaDocListeners.add(doc);
  } catch (err) {
    if (!isExtCtxInvalid(err)) LOG.warn("ensureMediaDocumentListeners error", err);
  }
}

function normalizeManId(value) {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const digits = raw.replace(/\D/g, "");
  return digits || raw;
}

function ensureMediaDeleteStyles(doc) {
  try {
    if (!doc || doc.getElementById?.(MEDIA_DELETE_STYLE_ID)) return;
    const style = doc.createElement("style");
    style.id = MEDIA_DELETE_STYLE_ID;
    style.textContent = `
.${MEDIA_DELETE_BUTTON_CLASS}{
  /* layout handled by attach_new_popup_folder_btn */
  color:#eb5757;
}
.ot4et-media-pin-btn{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  margin-left:8px;
  flex:0 0 auto;
  width:20px;
  height:20px;
  cursor:pointer;
  opacity:.72;
  transition:opacity .12s ease, transform .12s ease;
}
.ot4et-media-pin-btn:hover{
  opacity:1;
}
.ot4et-media-pin-btn[data-pinned="1"]{
  opacity:1;
  transform:translateY(-1px);
}
.upload_popup_tabs_content_item[${MEDIA_PINNED_ATTR}="1"]{
  outline:1px solid rgba(31,79,116,.28);
  outline-offset:-1px;
}
`;
    (doc.head || doc.documentElement || doc.body)?.appendChild(style);
  } catch {}
}

function loadMediaPinnedIds() {
  if (mediaPinnedLoaded) return;
  mediaPinnedLoaded = true;
  try {
    const raw = window.localStorage?.getItem?.(MEDIA_PIN_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;
    parsed.forEach((id) => {
      const normalized = String(id || "").trim();
      if (normalized) mediaPinnedIds.add(normalized);
    });
  } catch {}
}

function persistMediaPinnedIds() {
  try {
    const payload = Array.from(mediaPinnedIds.values());
    window.localStorage?.setItem?.(MEDIA_PIN_STORAGE_KEY, JSON.stringify(payload));
  } catch {}
}

function getMediaItemId(item) {
  return String(item?.dataset?.id || item?.getAttribute?.("data-id") || "").trim();
}

function isMediaItemPinnedById(id) {
  loadMediaPinnedIds();
  const normalized = String(id || "").trim();
  if (!normalized) return false;
  return mediaPinnedIds.has(normalized);
}

function setMediaItemPinned(item, pinned) {
  const id = getMediaItemId(item);
  if (!id) return;
  loadMediaPinnedIds();
  if (pinned) mediaPinnedIds.add(id);
  else mediaPinnedIds.delete(id);
  persistMediaPinnedIds();
}

function getMediaUserId() {
  const context = readContext();
  return normalizeManId(context?.woman?.id || "");
}

function getSelectedMediaItems(doc) {
  if (!doc) return [];
  const items = Array.from(
    doc.querySelectorAll(".upload_popup_tabs_content_item")
  );
  const selected = [];
  for (const item of items) {
    if (!item || !item.dataset) continue;
    const input = item.querySelector?.('input[type="checkbox"]');
    const isSelected =
      item.classList?.contains("selected") || !!input?.checked;
    if (!isSelected) continue;
    const id = String(item.dataset.id || item.getAttribute?.("data-id") || "").trim();
    if (!id) continue;
    selected.push({ item, id });
  }
  return selected;
}

function updateMediaDeleteButtonState(doc) {
  try {
    if (!doc) return;
    const btn = doc.querySelector?.(`.${MEDIA_DELETE_BUTTON_CLASS}`);
    if (!btn) return;
    const selected = getSelectedMediaItems(doc);
    btn.setAttribute("aria-disabled", selected.length === 0 ? "true" : "false");
  } catch {}
}

function showMediaDeleteConfirm(doc) {
  return new Promise((resolve) => {
    try {
      if (!doc) return resolve(false);
      const existing = doc.getElementById?.(MEDIA_DELETE_MODAL_ID);
      if (existing) existing.remove();
      const overlay = doc.createElement("div");
      overlay.id = MEDIA_DELETE_MODAL_ID;
      overlay.className = "ReactModal__Overlay ReactModal__Overlay--after-open";
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.background = "rgba(0, 0, 0, 0.35)";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.zIndex = "2147483646";

      const content = doc.createElement("div");
      content.className = "ReactModal__Content ReactModal__Content--after-open";
      content.setAttribute("tabindex", "-1");
      content.setAttribute("role", "dialog");
      content.setAttribute("aria-modal", "true");
      content.style.position = "relative";
      content.style.inset = "0";
      content.style.border = "1px solid rgb(204, 204, 204)";
      content.style.background = "rgb(255, 255, 255)";
      content.style.overflow = "auto";
      content.style.borderRadius = "8px";
      content.style.outline = "none";
      content.style.padding = "20px";
      content.style.width = "430px";
      content.style.maxWidth = "100%";
      content.style.height = "264px";
      content.style.display = "flex";
      content.style.alignItems = "center";
      content.style.boxShadow = "rgba(0, 0, 0, 0.05) 0px 3px 3px";
      content.style.textAlign = "center";

      const wrap = doc.createElement("div");
      wrap.className = "popup_error_wrap";
      wrap.dataset.testid = "alertMain-modal";

      const popup = doc.createElement("div");
      popup.className = "popup_error";

      const title = doc.createElement("div");
      title.className = "popup_error_title";
      title.textContent = "Are you sure you want to delete this file?";

      const btnWrap = doc.createElement("div");
      btnWrap.className = "popup_error_btn_wrap";

      const noBtn = doc.createElement("div");
      noBtn.className = "popup_error_btn transparent";
      noBtn.dataset.testid = "no-btn";
      const noSpan = doc.createElement("span");
      noSpan.textContent = "No";
      noBtn.appendChild(noSpan);

      const yesBtn = doc.createElement("div");
      yesBtn.className = "popup_error_btn";
      yesBtn.dataset.testid = "yes-btn";
      const yesImg = doc.createElement("img");
      yesImg.src =
        "/static/media/check-circle-white.124ddca999970fca5d9268651cd3f7cf.svg";
      yesImg.alt = "";
      const yesSpan = doc.createElement("span");
      yesSpan.textContent = "Yes";
      yesBtn.appendChild(yesImg);
      yesBtn.appendChild(yesSpan);

      btnWrap.appendChild(noBtn);
      btnWrap.appendChild(yesBtn);
      popup.appendChild(title);
      popup.appendChild(btnWrap);

      const close = doc.createElement("div");
      close.className = "popup_error_close";
      close.dataset.testid = "close-btn";
      const closeImg = doc.createElement("img");
      closeImg.src =
        "/static/media/popup-gift-close.aa170043103d9dff7d998550ed242568.svg";
      closeImg.alt = "";
      close.appendChild(closeImg);

      wrap.appendChild(popup);
      wrap.appendChild(close);
      content.appendChild(wrap);
      overlay.appendChild(content);

      const cleanup = (result) => {
        try {
          overlay.remove();
        } catch {}
        resolve(result);
      };

      noBtn.addEventListener("click", () => cleanup(false));
      close.addEventListener("click", () => cleanup(false));
      yesBtn.addEventListener("click", () => cleanup(true));
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) cleanup(false);
      });

      (doc.body || doc.documentElement)?.appendChild(overlay);
    } catch {
      resolve(false);
    }
  });
}

async function deleteSelectedMedia(doc) {
  const token = getAuthTokenFromStorage();
  const userId = getMediaUserId();
  if (!token || !userId) return;
  const selected = getSelectedMediaItems(doc);
  if (!selected.length) return;
  const confirmed = await showMediaDeleteConfirm(doc);
  if (!confirmed) return;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
  for (const entry of selected) {
    try {
      const body = JSON.stringify({ id: Number(entry.id), user_id: Number(userId) });
      const res = await fetch(MEDIA_DELETE_URL, {
        method: "POST",
        headers,
        body,
        credentials: "include",
      });
      if (!res?.ok) {
        throw new Error(`deleteMedia HTTP ${res?.status}`);
      }
      if (entry?.id) {
        loadMediaPinnedIds();
        mediaPinnedIds.delete(String(entry.id));
      }
      entry.item?.remove?.();
    } catch (err) {
      if (!isExtCtxInvalid(err)) LOG.warn("deleteSelectedMedia error", err);
    }
  }
  persistMediaPinnedIds();
  updateMediaDeleteButtonState(doc);
}

function ensureMediaDeleteButton(doc) {
  try {
    if (!doc) return;
    const container =
      doc.querySelector?.('[class*="attach_new_popup_folder_btn_wrap"]') ||
      doc.querySelector?.('[class*="attach_new_popup_tab_content_bottom"]');
    if (!container) return;
    let btn = container.querySelector(`.${MEDIA_DELETE_BUTTON_CLASS}`);
    if (!btn) {
      ensureMediaDeleteStyles(doc);
      btn = doc.createElement("button");
      btn.type = "button";
      btn.className = `attach_new_popup_folder_btn ${MEDIA_DELETE_BUTTON_CLASS}`;
      btn.textContent = "Удалить выбранные";
      btn.addEventListener("click", () => {
        deleteSelectedMedia(doc);
      });
      container.appendChild(btn);
    }
    updateMediaDeleteButtonState(doc);
  } catch {}
}

function handleMediaSelectionChange(event) {
  try {
    const target = event?.target;
    if (!target) return;
    if (
      target.matches?.('.upload_popup_tabs_content_item input[type="checkbox"]')
    ) {
      updateMediaDeleteButtonState(target.ownerDocument || document);
    }
  } catch (err) {
    if (!isExtCtxInvalid(err)) LOG.warn("handleMediaSelectionChange error", err);
  }
}

function loadMediaChatIdMap() {
  if (mediaChatMapLoaded) return;
  mediaChatMapLoaded = true;
  try {
    const raw = window.sessionStorage?.getItem?.(MEDIA_CHAT_STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data || typeof data !== "object") return;
    for (const [manId, chatId] of Object.entries(data)) {
      const mid = normalizeManId(manId);
      const cid = String(chatId || "").trim();
      if (!mid || !cid) continue;
      mediaChatIdMap.set(mid, cid);
    }
  } catch {}
}

function persistMediaChatIdMap() {
  try {
    if (!mediaChatMapLoaded) return;
    const payload = {};
    for (const [manId, chatId] of mediaChatIdMap.entries()) {
      payload[manId] = chatId;
    }
    window.sessionStorage?.setItem?.(
      MEDIA_CHAT_STORAGE_KEY,
      JSON.stringify(payload)
    );
  } catch {}
}

function saveMediaChatIdForMan(manId, chatId) {
  const mid = normalizeManId(manId);
  const cid = String(chatId || "").trim();
  if (!mid || !cid) return;
  loadMediaChatIdMap();
  mediaChatIdMap.set(mid, cid);
  persistMediaChatIdMap();
}

function getMediaChatIdForMan(manId) {
  const mid = normalizeManId(manId);
  if (!mid) return "";
  loadMediaChatIdMap();
  return mediaChatIdMap.get(mid) || "";
}

function ensureMediaIcon(doc, bottom, iconUrl, options = {}) {
  if (!doc || !bottom) return;
  const { title = "", kind = "" } = options || {};
  let iconHost = bottom.querySelector(`[${MEDIA_SENT_ICON_ATTR}]`);
  if (!iconHost) {
    iconHost = doc.createElement("div");
    iconHost.setAttribute(MEDIA_SENT_ICON_ATTR, "1");
    iconHost.className = "ot4et-upload-sent-icon";
    iconHost.style.display = "inline-flex";
    iconHost.style.alignItems = "center";
    iconHost.style.justifyContent = "center";
    iconHost.style.marginLeft = "8px";
    iconHost.style.flex = "0 0 auto";
    const icon = doc.createElement("img");
    icon.decoding = "async";
    icon.loading = "lazy";
    icon.alt = "";
    icon.width = 16;
    icon.height = 16;
    icon.setAttribute("aria-hidden", "true");
    icon.style.display = "block";
    icon.src = iconUrl;
    iconHost.appendChild(icon);
  } else {
    const img = iconHost.querySelector("img");
    if (img) {
      if (img.src !== iconUrl) {
        img.src = iconUrl;
      }
    } else {
      const icon = doc.createElement("img");
      icon.decoding = "async";
      icon.loading = "lazy";
      icon.alt = "";
      icon.width = 16;
      icon.height = 16;
      icon.setAttribute("aria-hidden", "true");
      icon.style.display = "block";
      icon.src = iconUrl;
      iconHost.appendChild(icon);
    }
  }
  if (kind) {
    iconHost.dataset.mediaIconKind = kind;
  } else {
    delete iconHost.dataset.mediaIconKind;
  }
  if (title) {
    iconHost.title = title;
    iconHost.setAttribute("aria-label", title);
  } else {
    iconHost.removeAttribute("title");
    iconHost.removeAttribute("aria-label");
  }
  const secondChild = bottom.children[1];
  if (secondChild && secondChild !== iconHost) {
    bottom.insertBefore(iconHost, secondChild);
  } else if (!secondChild) {
    bottom.appendChild(iconHost);
  } else if (secondChild === iconHost) {
    // already in correct position
  } else if (iconHost !== bottom.firstElementChild) {
    bottom.insertBefore(iconHost, secondChild);
  }
}

function removeMediaIcon(bottom) {
  if (!bottom) return;
  const iconHost = bottom.querySelector(`[${MEDIA_SENT_ICON_ATTR}]`);
  if (iconHost) {
    iconHost.remove();
  }
}

function ensureMediaPinIcon(doc, item, bottom) {
  if (!doc || !item || !bottom) return;
  const id = getMediaItemId(item);
  if (!id) return;
  let host = bottom.querySelector(`[${MEDIA_PIN_BUTTON_ATTR}]`);
  if (!host) {
    host = doc.createElement("div");
    host.setAttribute(MEDIA_PIN_BUTTON_ATTR, "1");
    host.className = "ot4et-media-pin-btn";
    host.addEventListener("click", (event) => {
      try {
        event.preventDefault();
        event.stopPropagation();
      } catch {}
      const currentPinned = host?.dataset?.pinned === "1";
      const nextPinned = !currentPinned;
      setMediaItemPinned(item, nextPinned);
      syncMediaBottomIcons();
    });
    const img = doc.createElement("img");
    img.decoding = "async";
    img.loading = "lazy";
    img.alt = "";
    img.width = 16;
    img.height = 16;
    img.setAttribute("aria-hidden", "true");
    img.style.display = "block";
    host.appendChild(img);
  }
  const pinned = isMediaItemPinnedById(id);
  host.dataset.pinned = pinned ? "1" : "0";
  host.title = pinned ? "Открепить" : "Закрепить в начале";
  host.setAttribute("aria-label", host.title);
  const img = host.querySelector("img");
  if (img) {
    img.src = pinned ? ICONS.pinActive : ICONS.pin;
  }
  item.setAttribute(MEDIA_PINNED_ATTR, pinned ? "1" : "0");
  const trash = bottom.querySelector(".popup_trash");
  if (trash && host !== trash.previousElementSibling) {
    bottom.insertBefore(host, trash);
  } else if (!trash && !host.parentElement) {
    bottom.appendChild(host);
  } else if (!host.parentElement) {
    bottom.appendChild(host);
  }
}

function ensureMediaPinnedOrder(doc) {
  if (!doc) return;
  const container =
    doc.querySelector?.('[data-testid="file-list"]') ||
    doc.querySelector?.("#uptcmp") ||
    doc.querySelector?.(".upload_popup_tabs_content_middle.photo");
  if (!container) return;
  const items = Array.from(
    container.querySelectorAll?.(".upload_popup_tabs_content_item") || []
  );
  if (!items.length) return;
  const pinned = [];
  const regular = [];
  for (const item of items) {
    const id = getMediaItemId(item);
    if (id && isMediaItemPinnedById(id)) pinned.push(item);
    else regular.push(item);
  }
  const nextOrder = [...pinned, ...regular];
  let alreadyOrdered = true;
  for (let index = 0; index < items.length; index += 1) {
    if (items[index] !== nextOrder[index]) {
      alreadyOrdered = false;
      break;
    }
  }
  if (alreadyOrdered) return;
  const frag = doc.createDocumentFragment();
  nextOrder.forEach((node) => frag.appendChild(node));
  container.appendChild(frag);
}

function syncMediaBottomIcons() {
  try {
    const iconSentUrl = ICONS.sent;
    const iconUnreadUrl = ICONS.checkUnread || ICONS.sent;
    if (!iconSentUrl && !iconUnreadUrl) return;
    const documents = collectMediaDocuments();
    for (const doc of documents) {
      if (!doc) continue;
      ensureMediaDeleteButton(doc);
      const bottoms = doc.querySelectorAll(".upload_popup_tabs_content_item_bottom");
      if (!bottoms?.length) continue;
      for (const bottom of bottoms) {
        const item = bottom?.closest?.(".upload_popup_tabs_content_item");
        if (item) ensureMediaPinIcon(doc, item, bottom);
        const linkRaw = extractMediaItemLink(item);
        const normalizedLink = normalizeMediaLink(linkRaw);
        if (!normalizedLink || !mediaSentLinks.has(normalizedLink)) {
          removeMediaIcon(bottom);
          continue;
        }
        const meta = mediaSentLinks.get(normalizedLink);
        const readKind =
          meta?.payed === 1
            ? "payed"
            : meta?.readStatus === 1
            ? "read"
            : "unread";
        const iconKind = readKind === "payed" ? "sent" : "unread";
        const url =
          iconKind === "sent"
            ? iconSentUrl
            : iconUnreadUrl || iconSentUrl || "";
        const tooltip =
          readKind === "payed"
            ? "Отправлено и оплачено"
            : readKind === "read"
            ? "Отправлено и прочитано"
            : "Отправлено не прочитано";
        if (url) {
          ensureMediaIcon(doc, bottom, url, {
            title: tooltip,
            kind: iconKind,
          });
        } else {
          removeMediaIcon(bottom);
        }
      }
      ensureMediaPinnedOrder(doc);
    }
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("syncMediaBottomIcons error", e);
  }
}

function applyMediaSentLinks(links = []) {
  try {
    const next = new Map();
    for (const entry of links) {
      if (!entry) continue;
      const normalized = normalizeMediaLink(
        typeof entry === "string" ? entry : entry?.url || entry?.link
      );
      if (!normalized) continue;
      if (typeof entry === "string") {
        const meta =
          next.get(normalized) || { read: 0, payed: 0, readStatus: 0 };
        meta.payed = 1;
        meta.readStatus = 1;
        meta.read = 1;
        next.set(normalized, meta);
        continue;
      }
      const readFlag =
        entry?.read === 1 ||
        entry?.read === "1" ||
        entry?.read_status === 1 ||
        entry?.read_status === "1" ||
        entry?.readStatus === 1 ||
        entry?.readStatus === "1"
          ? 1
          : 0;
      const payedFlag =
        entry?.payed === 1 ||
        entry?.payed === "1" ||
        entry?.payed === true ||
        entry?.payed === "true" ||
        entry?.paid === 1 ||
        entry?.paid === "1" ||
        entry?.paid === true ||
        entry?.paid === "true"
          ? 1
          : 0;
      const meta =
        next.get(normalized) || { read: 0, payed: 0, readStatus: 0 };
      if (readFlag === 1) meta.readStatus = 1;
      if (payedFlag === 1) meta.payed = 1;
      meta.read = meta.payed === 1 ? 1 : 0;
      next.set(normalized, meta);
    }
    mediaSentLinks = next;
    syncMediaBottomIcons();
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("applyMediaSentLinks error", e);
  }
}

const OPERATOR_MEDIA_URL = "https://alpha.date/api/chatList/operatorMedia";
const OPERATOR_MEDIA_LETTERS_URL =
  "https://alpha.date/api/chatList/operatorMediaLetters";
let operatorMediaFetchController = null;

async function resolveMediaChatContext() {
  try {
    const module = await loadUserInfoModule();
    if (!module) return null;
    const getParticipants = module?.getChatParticipants;
    const resolveChatId = module?.resolveChatId;
    const getToken = module?.getAuthToken;
    if (typeof getParticipants !== "function" || typeof resolveChatId !== "function") {
      return null;
    }
    const participants = getParticipants();
    const context = readContext();
    const explicitManId =
      participants?.man?.id ||
      participants?.headerMeta?.senderExternalId ||
      participants?.headerMeta?.recipientExternalId ||
      context?.man?.id;
    const manId = normalizeManId(explicitManId);
    let chatId = resolveChatId(participants);
    if (!chatId && manId) {
      const cached = getMediaChatIdForMan(manId);
      if (cached) chatId = cached;
    }
    if (manId && chatId) {
      saveMediaChatIdForMan(manId, chatId);
    }
    const token = typeof getToken === "function" ? getToken() : "";
    return {
      manId,
      chatId: chatId || "",
      token: String(token || "").trim(),
    };
  } catch (err) {
    if (!isExtCtxInvalid(err)) LOG.warn("resolveMediaChatContext error", err);
    return null;
  }
}

function extractMediaItemLink(item) {
  if (!item || typeof item !== "object") return "";
  const direct =
    item.dataset?.link ||
    item.getAttribute?.("data-link") ||
    item.dataset?.Link ||
    item.getAttribute?.("data-Link");
  if (direct) return direct;
  try {
    const top = item.querySelector?.(".upload_popup_tabs_content_item_top");
    if (top) {
      const holder = top.matches("[data-link]")
        ? top
        : top.querySelector?.("[data-link]");
      if (holder) {
        const topLink =
          holder.dataset?.link ||
          holder.getAttribute?.("data-link") ||
          holder.dataset?.Link ||
          holder.getAttribute?.("data-Link");
        if (topLink) return topLink;
      }
    }
  } catch {}
  return "";
}
async function fetchOperatorMediaLinks({
  signal,
  endpoint = OPERATOR_MEDIA_URL,
  chatContext = null,
} = {}) {
  try {
    const contextInfo = chatContext || (await resolveMediaChatContext());
    if (!contextInfo) return null;
    const { chatId, token } = contextInfo;
    if (!chatId || !token) return null;
    try {
      LOG.warn("operatorMedia: requesting", { chatId, endpoint });
    } catch {}
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    const body = JSON.stringify({ chat_id: chatId });
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body,
      signal,
      credentials: "include",
    });
    if (!response?.ok) {
      throw new Error(`operatorMedia ${endpoint} HTTP ${response?.status}`);
    }
    let data = null;
    try {
      data = await response.json();
    } catch {
      throw new Error("operatorMedia invalid JSON");
    }
    const entries = Array.isArray(data?.response)
      ? data.response
      : Array.isArray(data?.data)
      ? data.data
      : [];
    if (!Array.isArray(entries)) return [];
    const links = [];
    for (const entry of entries) {
      if (!entry || typeof entry !== "object") continue;
      const raw =
        entry.message_content ??
        entry.messageContent ??
        entry.link ??
        entry.url ??
        "";
      const normalized = normalizeMediaLink(raw);
      if (!normalized) continue;
      const readStatus =
        entry.read_status ?? entry.readStatus ?? entry.read ?? entry.is_read;
      const numericRead =
        readStatus === 1 ||
        readStatus === "1" ||
        readStatus === true ||
        readStatus === "true";
      const payedRaw =
        entry.payed ?? entry.paid ?? entry.payed_status ?? entry.paid_status;
      const isPayed =
        payedRaw === 1 || payedRaw === "1" || payedRaw === true || payedRaw === "true";
      links.push({
        url: normalized,
        read: numericRead ? 1 : 0,
        payed: isPayed ? 1 : 0,
      });
    }
    return links;
  } catch (err) {
    if (signal?.aborted) return null;
    if (!isExtCtxInvalid(err)) LOG.warn("fetchOperatorMediaLinks error", { err, endpoint });
    return null;
  }
}

async function refreshOperatorMediaLinks() {
  if (operatorMediaFetchController) {
    try {
      operatorMediaFetchController.abort();
    } catch {}
  }
  const controller = new AbortController();
  operatorMediaFetchController = controller;
  try {
    const chatContext = await resolveMediaChatContext();
    if (!chatContext || !chatContext.chatId || !chatContext.token) {
      return false;
    }
    const [mediaLinks, letterLinks] = await Promise.all([
      fetchOperatorMediaLinks({
        signal: controller.signal,
        endpoint: OPERATOR_MEDIA_URL,
        chatContext,
      }),
      fetchOperatorMediaLinks({
        signal: controller.signal,
        endpoint: OPERATOR_MEDIA_LETTERS_URL,
        chatContext,
      }),
    ]);
    if (controller.signal.aborted) return false;
    const combined = [];
    if (Array.isArray(mediaLinks)) combined.push(...mediaLinks);
    if (Array.isArray(letterLinks)) combined.push(...letterLinks);
    applyMediaSentLinks(combined);
    return true;
  } catch (err) {
    if (!controller.signal.aborted && !isExtCtxInvalid(err)) {
      LOG.warn("refreshOperatorMediaLinks error", err);
    }
    return false;
  } finally {
    if (operatorMediaFetchController === controller) {
      operatorMediaFetchController = null;
    }
  }
}

function handleMediaAddButtonClick(event) {
  try {
    const target = event?.target;
    if (!target) return;
    const btn = target.closest?.(MEDIA_BUTTON_SELECTOR);
    if (!btn) return;
    refreshOperatorMediaLinks();
  } catch (err) {
    if (!isExtCtxInvalid(err)) LOG.warn("handleMediaAddButtonClick error", err);
  }
}

function isNodeVisible(node) {
  try {
    if (!node) return false;
    if (node.hasAttribute && node.hasAttribute("aria-hidden") && node.getAttribute("aria-hidden") === "true") {
      return false;
    }
    const rect = node.getBoundingClientRect ? node.getBoundingClientRect() : null;
    if (rect && rect.width > 0 && rect.height > 0) return true;
    const style = window.getComputedStyle ? window.getComputedStyle(node) : null;
    if (!style) return true;
    if (style.display === "none") return false;
    if (style.visibility === "hidden" || style.visibility === "collapse") return false;
    if (Number(style.opacity) === 0) return false;
    return true;
  } catch {
    return true;
  }
}

function getModalState() {
  let total = 0;
  let visible = false;
  try {
    for (const selector of MODAL_SELECTORS) {
      if (!selector) continue;
      const nodes = document.querySelectorAll(selector);
      if (!nodes || !nodes.length) continue;
      total += nodes.length;
      if (visible) continue;
      for (const node of nodes) {
        if (isNodeVisible(node)) {
          visible = true;
          break;
        }
      }
    }
  } catch {}
  return { hasModal: visible, total };
}

function applyModalState({ hasModal, total }, meta = {}) {
  const source = meta?.source || "";
  setLogoWhiteSquareModalState(hasModal);
  if (hasModal) {
    if (source === "mutation" && !wasModalOpen) {
      pendingModalInfo = { total, meta };
      return;
    }
    if (wasModalOpen) return;
    pendingModalInfo = { total, meta };
    if (modalDebounceTimer) return;
    modalDebounceTimer = setTimeout(() => {
      modalDebounceTimer = null;
      commitModalState(true, pendingModalInfo);
      pendingModalInfo = null;
    }, MODAL_DEBOUNCE_MS);
    return;
  }
  if (modalDebounceTimer) {
    clearTimeout(modalDebounceTimer);
    modalDebounceTimer = null;
    pendingModalInfo = null;
  }
  if (!wasModalOpen) return;
  commitModalState(false, { total, meta });
}

function commitModalState(nextState, info = {}) {
  if (nextState === wasModalOpen) return;
  wasModalOpen = nextState;
  const { total, meta = {} } = info || {};
  try {
    LOG.warn("modal-state-change", {
      hasModal: nextState,
      count: total,
      ...meta,
    });
  } catch {}
  if (nextState) {
    ui?.drawer?.classList?.remove("open");
    ui?.moreBox?.classList?.remove("open");
    closeUserInfoMenu();
  } else if (!isExtensionLocked() && pinned && !drawerManuallyClosed) {
    if (!isAlphaLanding() && canRenderDrawerInCurrentContext()) {
      ui?.drawer?.classList?.add("open");
      if (ui?.drawer?.classList?.contains("open")) {
        drawerManuallyClosed = false;
      }
      scheduleContextRefresh({ immediate: true, force: true });
    }
  }
  updateLauncherVisibility();
}

async function togglePinned() {
  if (isExtensionLocked()) return;
  closeUserInfoMenu();
  pinned = !pinned;
  await setStore({ pinned });
  repaintTexts();
  if (pinned) {
    if (!isAlphaLanding() && canRenderDrawerInCurrentContext()) {
      ui.drawer.classList.add("open");
    }
    else updateLauncherVisibility();
    if (ui.drawer.classList.contains("open")) drawerManuallyClosed = false;
  }
}

function toast(msg) {
  try {
    if (!ui?.save) return;
    ui.save.dataset.toast = msg;
    ui.save.classList.add("toast-active");
    ui.save.title = msg;
    ui.save.setAttribute("aria-label", msg);
    updateSaveVisual();
    setTimeout(() => {
      try {
        if (!ui?.save) return;
        delete ui.save.dataset.toast;
        ui.save.classList.remove("toast-active");
        updateSaveVisual();
      } catch {}
    }, 900);
  } catch {}
}

const REPORTS_INDICATOR_DEBOUNCE_MS = 400;
let reportsIndicatorTimer = null;
let lastReportsIndicatorKey = "";

function setSearchReportsIndicatorNew(on) {
  try {
    if (!ui?.search?.classList) return;
    ui.search.classList.toggle("has-server-report", !!on);
  } catch {}
}

function setSearchReportsIndicatorLegacy(on) {
  try {
    if (!ui?.search?.classList) return;
    ui.search.classList.toggle("has-legacy-report", !!on);
  } catch {}
}

function scheduleReportsIndicatorCheck() {
  if (reportsIndicatorTimer) clearTimeout(reportsIndicatorTimer);
  reportsIndicatorTimer = setTimeout(() => {
    reportsIndicatorTimer = null;
    checkReportsIndicator();
  }, REPORTS_INDICATOR_DEBOUNCE_MS);
}

async function checkReportsIndicator() {
  if (isExtensionLocked()) {
    setSearchReportsIndicatorNew(false);
    setSearchReportsIndicatorLegacy(false);
    return;
  }
  const { man, woman } = readContext();
  const maleId = String(man?.id || "").trim();
  const femaleId = String(woman?.id || "").trim();
  if (!maleId || !femaleId) {
    setSearchReportsIndicatorNew(false);
    setSearchReportsIndicatorLegacy(false);
    return;
  }
  const key = `${maleId}_${femaleId}`;
  if (key === lastReportsIndicatorKey) return;
  lastReportsIndicatorKey = key;
  const base = await getProfileStatsApiBase();
  try {
    if (!base) {
      setSearchReportsIndicatorNew(false);
    } else {
      const res = await fetch(
        `${base}/reports/shift/exists?male_id=${encodeURIComponent(
          maleId
        )}&female_id=${encodeURIComponent(femaleId)}`
      );
      if (!res.ok) {
        setSearchReportsIndicatorNew(false);
      } else {
        const data = await res.json().catch(() => ({}));
        if (!data || data.ok !== true) {
          setSearchReportsIndicatorNew(false);
        } else {
          setSearchReportsIndicatorNew(!!data.exists);
        }
      }
    }
  } catch {
    setSearchReportsIndicatorNew(false);
  }

  const legacyCount = await fetchLegacyReportsCountByMaleId(maleId);
  setSearchReportsIndicatorLegacy(
    Number.isFinite(legacyCount) && Number(legacyCount) > 0
  );
}

async function sendReportShiftSnapshot(man, woman, text) {
  if (isExtensionLocked()) return;
  if (isAdminUniversalProfileContainerPresent()) {
    toast("Отчет не отправлен: админ-профиль");
    return;
  }
  const maleId = String(man?.id || "").trim();
  const femaleId = String(woman?.id || "").trim();
  if (!maleId || !femaleId) return;
  const operatorId = String(operatorInfoState.operatorId || "").trim();
  if (!operatorId) {
    toast("Не найден operator_id");
    return;
  }
  const base = await getProfileStatsApiBase();
  if (!base) {
    toast(isServerAccessLocked() ? "Нужен пароль" : "Сервер недоступен");
    return;
  }
  const payload = {
    male_id: maleId,
    female_id: femaleId,
    operator_id: operatorId,
    operator_name: String(operatorInfoState.operatorName || "").trim(),
    shift_key: getKyivReportDayKey(),
    text: String(text || ""),
    updated_at: Date.now(),
  };
  try {
    const res = await fetch(`${base}/reports/shift/snapshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      toast("Сервер недоступен");
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!data || data.ok !== true) {
      toast("Сервер недоступен");
      return;
    }
    lastReportsIndicatorKey = "";
    scheduleReportsIndicatorCheck();
  } catch {
    toast("Сервер недоступен");
  }
}

function formatReportDate(ts) {
  try {
    const date = new Date(Number(ts) || 0);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString();
  } catch {
    return "";
  }
}

async function fetchReportShiftList(man, woman) {
  if (isExtensionLocked()) return [];
  const maleId = String(man?.id || "").trim();
  const femaleId = String(woman?.id || "").trim();
  if (!maleId || !femaleId) return [];
  const base = await getProfileStatsApiBase();
  if (!base) {
    toast("Сервер недоступен");
    return [];
  }
  try {
    const res = await fetch(
      `${base}/reports/shift?male_id=${encodeURIComponent(
        maleId
      )}&female_id=${encodeURIComponent(femaleId)}`
    );
    if (!res.ok) {
      toast("Сервер недоступен");
      return [];
    }
    const data = await res.json().catch(() => ({}));
    if (!data || data.ok !== true) {
      toast("Сервер недоступен");
      return [];
    }
    return Array.isArray(data.items) ? data.items : [];
  } catch {
    toast("Сервер недоступен");
    return [];
  }
}

async function fetchLegacyReportsCountByMaleId(maleId) {
  if (isExtensionLocked()) return null;
  const normalizedMaleId = String(maleId || "").trim();
  if (!normalizedMaleId || !/^\d{10}$/.test(normalizedMaleId)) return null;
  try {
    const { apiUrl, apiKey } = await getStore(["apiUrl", "apiKey"]);
    const rawApiUrl =
      (apiUrl && typeof apiUrl === "string" && apiUrl.trim()) || "";
    const normalizedApiUrl = normalizeApiUrl(rawApiUrl);
    const isLegacyApi = normalizedApiUrl && LEGACY_API_URLS.has(normalizedApiUrl);
    const urlBase =
      normalizedApiUrl && !isLegacyApi
        ? normalizePreferredApiUrl(rawApiUrl)
        : DEFAULT_API_URL;
    if (!normalizedApiUrl || isLegacyApi) {
      setStore({ apiUrl: DEFAULT_API_URL }).catch(() => {});
    }
    const effectiveKey = (apiKey && String(apiKey).trim()) || DEFAULT_API_KEY;
    const resp = await chrome.runtime.sendMessage({
      // Telegram bot reports count (backed by tg-id-bot DB via /api/tg/count)
      type: "api:tg_count",
      maleId: normalizedMaleId,
      apiUrl: urlBase,
      apiKey: effectiveKey,
    });
    if (!resp || resp.ok !== true) return null;
    const count = Number(resp?.data?.count);
    if (!Number.isFinite(count)) return null;
    return Math.max(0, Math.round(count));
  } catch {
    return null;
  }
}

function updateReportsHeaderStats(serverCount, tgCount) {
  try {
    if (ui?.reportsServerStat) {
      const serverText =
        Number.isFinite(serverCount) && serverCount >= 0 ? String(serverCount) : "—";
      ui.reportsServerStat.textContent = `Отчёты: ${serverText}`;
    }
    if (ui?.reportsTgStatBtn) {
      const tgText = Number.isFinite(tgCount) && tgCount >= 0 ? String(tgCount) : "—";
      ui.reportsTgStatBtn.textContent = `В Телеграме: ${tgText}`;
    }
  } catch {}
}

async function renderServerReportsList() {
  if (isExtensionLocked()) {
    updateReportsHeaderStats(null, null);
    if (ui?.historyList) {
      ui.historyList.hidden = false;
      ui.historyList.innerHTML = `<div class="small muted">Введите пароль</div>`;
    }
    return;
  }
  try {
    if (!ui?.historyList) return;
    const { man, woman } = readContext();
    ui.historyList.hidden = false;
    ui.historyList.innerHTML = `<div class="small muted">Загрузка...</div>`;
    updateReportsHeaderStats(null, null);
    const maleId = String(man?.id || "").trim();
    const [items, tgCount] = await Promise.all([
      fetchReportShiftList(man, woman),
      fetchLegacyReportsCountByMaleId(maleId),
    ]);
    const serverCount = Array.isArray(items) ? items.length : 0;
    updateReportsHeaderStats(serverCount, tgCount);
    ui.historyList.innerHTML = "";
    if (!items.length) {
      ui.historyList.innerHTML = `<div class="small muted">Отчётов нет</div>`;
      return;
    }
    items.forEach((item) => {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.flexDirection = "column";
      row.style.gap = "6px";
      row.style.padding = "8px 10px";
      row.style.border = `1px solid ${PANEL_BORDER}`;
      row.style.borderRadius = PANEL_RADIUS;
      row.style.background = PANEL_ELEVATED_BG;
      const meta = document.createElement("div");
      meta.style.display = "flex";
      meta.style.alignItems = "center";
      meta.style.gap = "8px";
      meta.style.fontSize = "12px";
      meta.style.fontWeight = "600";
      meta.style.opacity = "0.8";
      const opName = String(item.operator_name || "").trim();
      const opId = String(item.operator_id || "").trim();
      const who = document.createElement("span");
      who.textContent = opName ? opName : `ID: ${opId}`;
      const when = document.createElement("span");
      when.textContent = formatReportDate(item.updated_at);
      meta.appendChild(who);
      meta.appendChild(when);
      const text = document.createElement("div");
      text.style.whiteSpace = "pre-wrap";
      text.style.fontSize = "13px";
      text.textContent = String(item.text || "");
      row.appendChild(meta);
      row.appendChild(text);
      ui.historyList.appendChild(row);
    });
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("renderServerReportsList error", e);
  }
}

async function onSave() {
  if (isExtensionLocked()) return;
  const { man, woman } = readContext();
  if (!man.id) {
    alert(t("emptyId"));
    return;
  }
  const { reports = {} } = await getStore(["reports"]);
  const key = reportKey(man, woman);
  reports[key] = {
    man,
    woman,
    text: ui.ta.value || "",
    updatedAt: Date.now(),
  };
  await setStore({ reports });
  currentManId = man.id;
  currentReportKey = key;
  currentSavedText = ui.ta.value || "";
  updateSaveVisual();
  LOG.log("onSave: saved report for", key);
  try {
    await sendReportShiftSnapshot(man, woman, ui.ta.value || "");
  } catch {}
  try {
    if (
      ui.moreBox?.classList?.contains("open") &&
      ui.moreBox?.dataset?.mode === "reports"
    ) {
      await renderServerReportsList();
    }
  } catch {}
  try {
    if (
      ui.moreBox?.classList?.contains("open") &&
      ui.moreBox?.dataset?.mode === "history"
    ) {
      await renderHistoryList();
    }
  } catch {}
}

async function onClearOne() {
  if (isExtensionLocked()) return;
  const { man, woman } = readContext();
  if (!man.id) return;
  const data = await getStore(["reports"]);
  const key = reportKey(man, woman);
  if (data.reports && data.reports[key]) {
    delete data.reports[key];
    await setStore({ reports: data.reports });
    ui.ta.value = "";
    toast(t("removed"));
    LOG.log("onClearOne: removed report for", key);
    if (currentReportKey === key) {
      currentSavedText = "";
      updateSaveVisual();
    }
  }
}

async function onClearAll() {
  if (isExtensionLocked()) return;
  if (!confirm("Очистить ВСЁ?")) return;
  await setStore({ reports: {} });
  toast(t("cleared"));
  LOG.warn("onClearAll: cleared all reports");
}

function reportKey(man, woman) {
  const mid = String(man?.id || "").trim();
  const wid = String(woman?.id || "unknown").trim() || "unknown";
  return `${mid}_${wid}`;
}

async function loadTextForCurrent(force = false) {
  if (isExtensionLocked()) {
    try {
      if (ui?.ta) ui.ta.value = "";
      setSearchReportsIndicatorNew(false);
      setSearchReportsIndicatorLegacy(false);
      updateReportsHeaderStats(null, null);
    } catch {}
    return;
  }
  const { man, woman } = readContext();
  const normalizedManId = String(man?.id || "").trim();
  const {
    reports = {},
    lang,
    pinned: p,
    lastDayKey,
  } = await getStore(["reports", "lang", "pinned", "lastDayKey"]);
  currentLang = lang || currentLang;
  pinned = !!p;
  repaintTexts();
  if (!normalizedManId) {
    if (LOG.enabled) {
      try {
        LOG.warn("loadTextForCurrent: missing man.id", {
          force,
          prevKey: currentReportKey,
          womanId: String(woman?.id || ""),
          stack: new Error().stack,
        });
      } catch {}
    }
    currentManId = "";
    currentReportKey = "";
    currentSavedText = "";
    forceEmptyOnce = false;
    try {
      ui.ta.value = "";
    } catch {}
    try {
      setSearchReportsIndicatorNew(false);
      setSearchReportsIndicatorLegacy(false);
    } catch {}
    updateSaveVisual();
    return;
  }
  const normalizedMan = { ...man, id: normalizedManId };
  const key = reportKey(normalizedMan, woman);
  let nextSaved = "";
  try {
    const r = reports[key];
    const todayKey = dayKey(Date.now());
    if (r && r.updatedAt && dayKey(r.updatedAt) === todayKey) {
      nextSaved = r.text || "";
    } else {
      nextSaved = ""; // не подставляем отчёт с прошлого дня
    }
  } catch {
    nextSaved = "";
  }
  const isSameContext = currentReportKey === key;
  const wasDirty = (ui.ta.value ?? "") !== (currentSavedText ?? "");
  currentManId = normalizedManId;
  currentReportKey = key;
  currentSavedText = nextSaved;
  // Only override the textarea when forced (e.g., on open or context switch)
  // or when there are no unsaved edits.
  if (force || !wasDirty) {
    if (forceEmptyOnce) {
      ui.ta.value = "";
      forceEmptyOnce = false;
    } else {
      ui.ta.value = currentSavedText;
    }
  }
  updateSaveVisual();
  // Clear previous check output on force refresh (open/context switch)
  try {
    if (force && ui.checkOut) ui.checkOut.textContent = "";
  } catch {}
  try {
    scheduleReportsIndicatorCheck();
  } catch {}
  LOG.log("loadTextForCurrent: loaded report text length", ui.ta.value.length);
  try {
    positionDrawer();
  } catch {}
}

function addDaysUTC(y, m, d, delta) {
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return {
    y: dt.getUTCFullYear(),
    m: dt.getUTCMonth() + 1,
    d: dt.getUTCDate(),
  };
}
function dayKey(ms) {
  return dayKeyWithShift(ms, 1); // shift by +1 hour so day flips at 23:00
}
function prevDayKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  const p = addDaysUTC(y, m, d, -1);
  const pad = (n) => String(n).padStart(2, "0");
  return `${p.y}-${pad(p.m)}-${pad(p.d)}`;
}

function dayKeyWithShift(ms, shiftHours) {
  const pad = (n) => String(n).padStart(2, "0");
  const shift = Number(shiftHours) || 0;
  const shifted = ms + shift * 60 * 60 * 1000;
  const { y, m, d } = kyivParts(shifted);
  return `${y}-${pad(m)}-${pad(d)}`;
}

function computeMsUntilNextKyivBoundary(targetHour) {
  try {
    const { hh, mm, ss } = kyivParts(Date.now());
    const hour = Number.isFinite(hh) ? hh : 0;
    const minute = Number.isFinite(mm) ? mm : 0;
    const second = Number.isFinite(ss) ? ss : 0;
    const curSeconds = hour * 3600 + minute * 60 + second;
    let boundarySeconds = (Number(targetHour) || 0) * 3600;
    if (curSeconds >= boundarySeconds) boundarySeconds += 24 * 3600;
    const diffSeconds = boundarySeconds - curSeconds;
    return Math.max(0, diffSeconds * 1000);
  } catch {
    return 60 * 60 * 1000;
  }
}

function msUntilNextBoundary() {
  return computeMsUntilNextKyivBoundary(23);
}

function msUntilNextMonitorBoundary() {
  return computeMsUntilNextKyivBoundary(MONITOR_COUNTER_RESET_HOUR);
}

async function onDownloadDay(which) {
  if (isExtensionLocked()) return;
  const targetKey =
    which === "today" ? dayKey(Date.now()) : prevDayKey(dayKey(Date.now()));
  const { reports = {} } = await getStore(["reports"]);
  // Filter by target day key (based on updatedAt)
  const filtered = [];
  for (const key of Object.keys(reports)) {
    const r = reports[key];
    if (!r || !r.updatedAt) continue;
    if (!r.text || !String(r.text).trim()) continue;
  if (dayKey(r.updatedAt) === targetKey) filtered.push(r);
  }
  if (filtered.length === 0) {
    alert("Отчётов за выбранный день нет");
    return;
  }
  // группировка по девушке
  const byGirl = {};
  for (const r of filtered) {
    const wKey = r.woman?.id || "unknown";
    (byGirl[wKey] ||= []).push(r);
  }
  let out = "";
  const girls = Object.keys(byGirl).sort();
  for (const g of girls) {
    const sample = byGirl[g][0]?.woman || {};
    const girlTitle = `${sample.name || "?"}${
      sample.age ? ` (${sample.age})` : ""
    } | ID: ${sample.id || "?"}`;
    const reportsForGirl = byGirl[g]
      .filter((item) => String(item.text || "").trim())
      .sort((a, b) => (a.man.name || "").localeCompare(b.man.name || ""));
    if (!reportsForGirl.length) continue;
    out += `##########\n##### ${girlTitle}\n##########\n\n`;
    for (const r of reportsForGirl.sort((a, b) =>
      (a.man.name || "").localeCompare(b.man.name || "")
    )) {
      const manTitle = `${r.man.name || "?"}${
        r.man.age ? ` (${r.man.age})` : ""
      } | ID: ${r.man.id || "?"}`;
      out += [manTitle, "Отчёт:", r.text || "", ""].join("\n") + "\n";
    }
  }
  const blob = new Blob([out.trimStart()], {
    type: "text/plain;charset=utf-8",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  const suffix = which === "today" ? "today" : "yesterday";
  a.download = `reports_${targetKey}_${suffix}.txt`;
  a.click();
  URL.revokeObjectURL(a.href);
  LOG.log(
    "onDownloadDay: file generated",
    a.download,
    "items:",
    filtered.length
  );
}

async function onCheck() {
  if (isExtensionLocked()) return;
  let restore = () => {};
  try {
    const { man, woman } = readContext();
    LOG.log("onCheck: context", { man, woman });
    if (!man.id) {
      alert(t("emptyId"));
      return;
    }
    // UI feedback while requesting
    const prevDisabled = ui.search.disabled;
    ui.search.disabled = true;
    if (ui.checkOut) {
      ui.checkOut.hidden = false;
      ui.checkOut.textContent = "Проверка…";
    }
    restore = () => {
      ui.search.disabled = prevDisabled;
    };

    // Load settings with fallbacks
    const { apiUrl, apiKey } = await getStore(["apiUrl", "apiKey"]);
    const rawApiUrl =
      (apiUrl && typeof apiUrl === "string" && apiUrl.trim()) || "";
    const normalizedApiUrl = normalizeApiUrl(rawApiUrl);
    const isLegacyApi = normalizedApiUrl && LEGACY_API_URLS.has(normalizedApiUrl);
    const urlBase =
      normalizedApiUrl && !isLegacyApi
        ? normalizePreferredApiUrl(rawApiUrl)
        : DEFAULT_API_URL;
    if (!normalizedApiUrl || isLegacyApi) {
      setStore({ apiUrl: DEFAULT_API_URL }).catch(() => {});
    }
    // Use background service worker to avoid mixed content/CORS
    const effectiveKey = (apiKey && String(apiKey).trim()) || DEFAULT_API_KEY;
    const resp = await chrome.runtime.sendMessage({
      type: "api:count",
      maleId: man.id,
      apiUrl: urlBase,
      apiKey: effectiveKey,
    });
    if (!resp || resp.ok !== true) {
      throw new Error((resp && (resp.error || resp.status)) || "bg_failed");
    }
    const data = resp.data || {};
    const n = typeof data.count === "number" ? data.count : NaN;
    if (ui.checkOut) {
      if (!Number.isNaN(n)) {
        ui.checkOut.textContent = t("foundCount", n);
      } else {
        ui.checkOut.textContent = "";
      }
    }
    // Do not duplicate result in the Save button; show only in checkOut
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("onCheck error", e);
    // Do not use toast here to avoid altering the Save button caption
    if (ui.checkOut && !isExtCtxInvalid(e))
      ui.checkOut.textContent = `Ошибка: ${e?.message || e}`;
  } finally {
    try {
      restore();
    } catch {}
    // keep the panel open so the user can read results
  }
}

async function onCopyId() {
  if (isExtensionLocked()) return;
  try {
    if (!ui?.copyId) return;
    const { man } = readContext();
    const id = String(man?.id || "").trim();
    if (!id) {
      alert(t("emptyId"));
      return;
    }
    ui.copyId.classList.add("saved");
    ui.copyId.disabled = true;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(id);
      } else {
        const ta = document.createElement("textarea");
        ta.value = id;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
    } finally {
      setTimeout(() => {
        ui.copyId.classList.remove("saved");
        ui.copyId.disabled = false;
      }, 800);
    }
  } catch (e) {
    LOG.warn("onCopyId error", e);
  }
}

function updateSaveVisual() {
  try {
    if (!ui?.save) return;
    const val = ui?.ta?.value ?? "";
    const same = val === (currentSavedText ?? "");
    const hasSavedText = same && val.trim() !== "";
    const label = hasSavedText ? t("saved") : t("save");
    const toastActive = ui.save.classList.contains("toast-active");
    ui.save.textContent = "";
    ui.save.classList.toggle("saved", hasSavedText);
    const isSaveActive = toastActive || hasSavedText;
    applyButtonIcon(ui.save, isSaveActive ? ICONS.saveActive : ICONS.save, {
      iconOnly: true,
      size: 30,
    });
    if (!toastActive) {
      try {
        ui.save.title = label;
        ui.save.setAttribute("aria-label", label);
      } catch {}
    }
    try { updateButtonsCompact(); } catch {}
  } catch (e) {
    /* no-op */
  }
}

function onTextChanged() {
  updateSaveVisual();
}

// === История: добавляем чат в список, если последнее сообщение — левое ===
let historyItems = [];

function isLastMessageLeft() {
  try {
    const list = getMsgContainer();
    if (!list) return false;
    const allItems = Array.from(
      list.querySelectorAll(`[class*="${MSG_ITEM_CLASS}"]`)
    );
    if (!allItems.length) return false;
    const last = allItems[allItems.length - 1];
    const isLeft =
      last.matches(`[class*="${MSG_LEFT_CLASS}"]`) ||
      !!last.querySelector(`[class*="${MSG_LEFT_CLASS}"]`);
    // Если последнее левое сообщение — это лайк, пропускаем (ждём текста)
    const likeSelector =
      '[class*="styles_like__"], [class*="like__"], [class*="Like"]';
    const hasLike =
      last.matches(likeSelector) || !!last.querySelector(likeSelector);
    // Если в последнем левом сообщении есть смайлик ;)
    const raw = (last.innerText || last.textContent || "").trim();
    const hasWink = raw.includes("😉");
    if (!isLeft) {
      LOG.debug("History check: last message is not left");
    }
    if (hasLike) {
      LOG.debug("History check: last left message is a like — skip");
    }
    if (hasWink) {
      LOG.debug("History check: last left message has wink emoji — skip");
    }
    return isLeft && !hasLike && !hasWink;
  } catch (e) {
    LOG.debug("isLastMessageLeft error", e);
    return false;
  }
}

function getCurrentChatIdAndName() {
  try {
    const { man } = readContext();
    let id = String(man?.id || "").trim();
    let name = man?.name || "";
    if (!/^\d{10}$/.test(id)) {
      const m = String(location.href).match(/(\d{10})(?!\d)/);
      if (m) id = m[1];
    }
    if (!id) return null;
    return { id, name: name || id };
  } catch {
    return null;
  }
}

function normalizeChatUrl(url) {
  try {
    const u = new URL(String(url || location.href), location.href);
    u.hash = "";
    if (u.search) {
      const sp = new URLSearchParams(u.search);
      const entries = Array.from(sp.entries()).sort(([a], [b]) =>
        a.localeCompare(b)
      );
      const sp2 = new URLSearchParams(entries);
      u.search = String(sp2) ? `?${String(sp2)}` : "";
    }
    return u.origin + u.pathname + u.search;
  } catch {
    return String(url || location.href || "");
  }
}

function getHistoryKey() {
  try {
    // Предпочитаем стабильный ключ по паре (man.id + woman.id)
    const { man, woman } = readContext();
    const mid = String(man?.id || "").trim();
    const wid = String(woman?.id || "").trim();
    if (/^\d{10}$/.test(mid) && wid) return `${mid}_${wid}`;
    // Фолбэк: нормализованный URL, если пара недоступна
    return normalizeChatUrl(location.href);
  } catch {
    return String(location.href || "");
  }
}

async function addChatToHistoryIfNeeded() {
  try {
    if (!isLastMessageLeft()) return;
    const meta = getCurrentChatIdAndName();
    if (!meta) return;
    const { id, name } = meta;
    const link = normalizeChatUrl(location.href);
    const ts = Date.now();
    const red = isManRed();
    const green = isManGreen();
    const ctx = readContext();
    const woman = ctx?.woman || {};
    const man = ctx?.man || {};
    let adminName = String(woman?.name || "").trim();
    let adminId = String(woman?.id || "").trim();
    const age = String(man?.age || "").trim();
    const key = getHistoryKey();
    // Fallback: если adminId пуст — попробуем извлечь из ключа пары mid_wid
    if (!adminId && /^\d{10}_.+/.test(key)) {
      adminId = key.split("_").slice(1).join("_");
    }
    const color = green ? "green" : red ? "red" : "blue";
    LOG.log("History: add/update", {
      id,
      name,
      link,
      color,
      adminId,
      adminName,
    });
    const byKey = new Map(
      historyItems.map((x) => [x.key || normalizeChatUrl(x.link || x.id), x])
    );
    const prev = byKey.get(key) || {};
    byKey.set(key, {
      key,
      id,
      name,
      link,
      ts,
      color: color || prev.color || "blue",
      adminName: adminName || prev.adminName || "",
      adminId: adminId || prev.adminId || "",
      age: age || prev.age || "",
    });
    historyItems = Array.from(byKey.values()).sort((a, b) => b.ts - a.ts);
    await setStore({ historyItems });
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("addChatToHistoryIfNeeded error", e);
  }
}

// --- Борьба с фантомами: добавляем только после стабилизации DOM ---
let historyCheckTimer = null;
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function addChatToHistoryIfStable() {
  try {
    const key1 = getHistoryKey();
    const info1 = getStableLastMessageInfo();
    if (!key1 || !info1.ok) return;
    await sleep(180);
    const key2 = getHistoryKey();
    const info2 = getStableLastMessageInfo();
    if (!key2 || !info2.ok) return;
    // Требуем совпадения ключа чата и текста последнего левого сообщения без лайка
    if (key1 !== key2) return;
    if (info1.text !== info2.text) return;
    await addChatToHistoryIfNeeded();
  } catch {}
}

function scheduleHistoryCheck() {
  try {
    if (historyCheckTimer) clearTimeout(historyCheckTimer);
    historyCheckTimer = setTimeout(() => {
      addChatToHistoryIfStable();
    }, 800); // ждём тишину DOM ~0.8с (учитываем задержки переводчика)
  } catch {}
}

function prefetchMediaChatContext() {
  try {
    const promise = resolveMediaChatContext();
    if (promise && typeof promise.catch === "function") {
      promise.catch((err) => {
        if (!isExtCtxInvalid(err)) LOG.warn("prefetchMediaChatContext error", err);
      });
    }
  } catch (err) {
    if (!isExtCtxInvalid(err)) LOG.warn("prefetchMediaChatContext outer error", err);
  }
}

function getStableLastMessageInfo() {
  try {
    const list = getMsgContainer();
    if (!list) return { ok: false };
    const all = list.querySelectorAll(`[class*="${MSG_ITEM_CLASS}"]`);
    if (!all || !all.length) return { ok: false };
    const last = all[all.length - 1];
    const isLeft =
      last.matches(`[class*="${MSG_LEFT_CLASS}"]`) ||
      !!last.querySelector(`[class*="${MSG_LEFT_CLASS}"]`);
    const LIKE_PART = "styles_like__";
    const hasLike =
      (last.className || "").includes(LIKE_PART) ||
      !!last.querySelector(`[class*="${LIKE_PART}"]`);
    const raw = (last.innerText || last.textContent || "")
      .trim()
      .replace(/\s+/g, " ");
    const hasWink = raw.includes("😉");
    return { ok: isLeft && !hasLike && !hasWink, text: raw };
  } catch {
    return { ok: false };
  }
}

// Определение "красных" пользователей по хедеру
function isManRed() {
  try {
    const header = document.querySelector('[data-testid="chat-header"]');
    if (!header) return false;
    const RED_PART = "chat_head_red__";
    if ((header.className || "").includes(RED_PART)) return true;
    return !!header.querySelector(`[class*="${RED_PART}"]`);
  } catch {
    return false;
  }
}

// Определение "зелёных" пользователей по хедеру
function isManGreen() {
  try {
    const header = document.querySelector('[data-testid="chat-header"]');
    if (!header) return false;
    const GREEN_PART = "chat_head_green__";
    if ((header.className || "").includes(GREEN_PART)) return true;
    return !!header.querySelector(`[class*="${GREEN_PART}"]`);
  } catch {
    return false;
  }
}

async function renderHistoryList() {
  if (isExtensionLocked()) return;
  try {
    if (!ui?.historyList) return;
    const list = historyItems || [];
    ui.historyList.innerHTML = "";
    if (!list.length) {
      ui.historyList.innerHTML = `<div class="small muted">${
        t("emptyHistory") || "История пуста"
      }</div>`;
      return;
    }
    const { reports = {} } = await getStore(["reports"]);
    for (const item of list) {
      const row = document.createElement("div");
      row.style.display = "flex";
      row.style.alignItems = "center";
      row.style.gap = "6px";
      row.style.width = "100%";
      row.style.paddingRight = "24px";

      const openBtn = document.createElement("button");
      openBtn.className = "btn history-open";
      openBtn.style.flex = "1";
      // Build left-side profile icon with admin tooltip
      openBtn.textContent = "";
      const icon = createInlineIcon(ICONS.woman, 18);
      {
        const an = (item.adminName || "").trim();
        const aid = (item.adminId || "").trim();
        const tip =
          an || aid
            ? `${an}${an && aid ? " | " : ""}${aid ? "ID: " + aid : ""}`
            : "Нет данных";
        icon.title = tip;
      }
      // Color dot (red/green/blue) — tooltip shows man name + ID
      const dot = document.createElement("span");
      const color = item.color || (item.red ? "red" : "blue");
      dot.className = "color-dot";
      try {
        dot.style.backgroundColor =
          color === "red"
            ? "#ff4f4f"
            : color === "green"
            ? "#34a853"
            : "#4b7bec";
      } catch {}
      {
        const mn = (item.name || "").trim();
        const mid = (item.id || "").trim();
        dot.title = `${mn}${mn && mid ? " | " : ""}${
          mid ? "ID: " + mid : ""
        }`.trim();
      }
      // Pencil indicator if there is a saved report for this man+admin
      let pencilIcon = null;
      try {
        const mid = (item.id || "").trim();
        const aid = (item.adminId || "").trim();
        const rKey = mid && aid ? `${mid}_${aid}` : "";
        const todayKey = dayKey(Date.now());
        const rec = rKey && reports ? reports[rKey] : null;
        const hasReport =
          !!rec &&
          !!rec.updatedAt &&
          dayKey(rec.updatedAt) === todayKey &&
          String(rec.text || "").trim().length > 0;
        if (hasReport) {
          pencilIcon = createInlineIcon(ICONS.pencil, 16);
          pencilIcon.title = "Есть сохранённый отчёт";
        }
      } catch {}
      const label = document.createElement("span");
      const nm = item.name || item.id || "";
      const ag = (item.age || "").trim();
      label.textContent = `${nm}${ag ? " (" + ag + ")" : ""}`;
      openBtn.appendChild(icon);
      openBtn.appendChild(dot);
      if (pencilIcon) openBtn.appendChild(pencilIcon);
      const labelWrap = document.createElement("span");
      labelWrap.style.flex = "1";
      labelWrap.style.display = "flex";
      labelWrap.style.alignItems = "center";
      labelWrap.style.gap = "8px";
      labelWrap.appendChild(label);
      openBtn.appendChild(labelWrap);

      // Кнопку удаления временно скрываем
      // Не используем title на всей кнопке, чтобы не перекрывать всплывающие подсказки на иконках
      openBtn.onclick = () => {
        try {
          window.location.href = item.link;
        } catch {}
        ui.moreBox.classList.remove("open");
        closeUserInfoMenu();
      };
      row.appendChild(openBtn);
      ui.historyList.appendChild(row);
    }
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("renderHistoryList error", e);
  }
}

// следим за сменой собеседника и обновляем шапку/текст
const CONTEXT_REFRESH_DEBOUNCE_MS = 120;
let drawerRefreshTimer = null;

function refreshDrawerState(options = {}) {
  const { force = false } = options;
  drawerRefreshTimer = null;
  try {
    if (isExtensionLocked()) {
      ui?.drawer?.classList?.remove("open");
      ui?.moreBox?.classList?.remove("open");
      updateLauncherVisibility();
      return;
    }
    if (isUiBlockedByMissingOperatorId()) {
      ui?.drawer?.classList?.remove("open");
      ui?.moreBox?.classList?.remove("open");
      closeUserInfoMenu();
      updateLauncherVisibility();
      return;
    }
    if (wasModalOpen && !force) {
      ui?.drawer?.classList?.remove("open");
      ui?.moreBox?.classList?.remove("open");
      closeUserInfoMenu();
      return;
    }
    const onLanding = isAlphaLanding();
    if (onLanding) {
      const drawerIsOpen = ui?.drawer?.classList?.contains("open");
      if (drawerIsOpen) {
        if (!pinned) {
          try {
            ui.close?.onclick?.();
          } catch {}
        }
      } else {
        try {
          ui.moreBox?.classList?.remove("open");
        } catch {}
        if (ui.checkControls) ui.checkControls.hidden = true;
        if (ui.openBot) ui.openBot.hidden = true;
        if (ui.copyId) ui.copyId.hidden = true;
        if (ui.checkOut) ui.checkOut.hidden = true;
        closeUserInfoMenu();
      }
      loadTextForCurrent(true);
      updateLauncherVisibility();
      return;
    }
    if (
      !wasModalOpen &&
      pinned &&
      !drawerManuallyClosed &&
      canRenderDrawerInCurrentContext() &&
      ui?.drawer &&
      !ui.drawer.classList.contains("open")
    ) {
      ui.drawer.classList.add("open");
      drawerManuallyClosed = false;
    }
    if (!ui?.drawer?.classList?.contains("open")) return;
    positionDrawer();
    applyThemeFromPage();
    const { man, woman } = readContext();
    const normalizedManId = String(man?.id || "").trim();
    const nextKey = normalizedManId ? reportKey({ ...man, id: normalizedManId }, woman) : "";
    const contextChanged =
      (!!normalizedManId && nextKey && nextKey !== currentReportKey) ||
      (!normalizedManId && currentReportKey);
    if (force || contextChanged) {
      fillHeader();
      loadTextForCurrent(true);
      if (contextChanged) {
        scheduleHistoryCheck();
        try {
          if (ui.checkOut) ui.checkOut.textContent = "";
          ui?.moreBox?.classList?.remove("open");
          closeUserInfoMenu();
          try {
            ui.more.classList.remove("active");
            ui.history.classList.remove("active");
            ui.search.classList.remove("active");
            ui.templates.classList.remove("active");
          } catch {}
          try {
            renderTemplatesList();
          } catch {}
        } catch {}
      }
    }
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("refreshDrawerState error", e);
  }
}

function scheduleContextRefresh(options = {}) {
  try {
    const { immediate = false, force = false } = options;
    if (wasModalOpen && !force) return;
    if (immediate) {
      if (drawerRefreshTimer) {
        clearTimeout(drawerRefreshTimer);
        drawerRefreshTimer = null;
      }
      refreshDrawerState({ force });
      return;
    }
    if (drawerRefreshTimer) return;
    drawerRefreshTimer = setTimeout(() => {
      refreshDrawerState({ force });
    }, CONTEXT_REFRESH_DEBOUNCE_MS);
  } catch (e) {
    if (!isExtCtxInvalid(e)) LOG.warn("scheduleContextRefresh error", e);
  }
}

const obs = new MutationObserver(() => {
  if (IS_SVG_DOCUMENT) return;
  applyModalState(getModalState(), { source: "mutation" });
  syncMediaBottomIcons();
  scheduleProfilesViewportLayout();
  ensureConnectManInfoButtons();
  if (!ui?.drawer?.classList?.contains("open")) return;
  scheduleContextRefresh();
});
if (!IS_SVG_DOCUMENT) {
  obs.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["class", "style", "aria-hidden"],
  });
}

function startModalPoller() {
  if (modalPollTimer) return;
  modalPollTimer = setInterval(() => {
    applyModalState(getModalState(), { source: "poll" });
  }, MODAL_POLL_INTERVAL);
}
if (!IS_SVG_DOCUMENT) startModalPoller();

window.addEventListener("unload", () => {
  try {
    if (modalPollTimer) {
      clearInterval(modalPollTimer);
      modalPollTimer = null;
    }
    clearOperatorRatingHourlyRefresh();
    clearMonitorHourlyRefresh();
  } catch {}
});

// запуск
(async function init() {
  if (IS_SVG_DOCUMENT) return;
  LOG.log("init: starting");
  try {
    document.addEventListener("click", handleLettersNavClick, true);
    document.addEventListener("keydown", handleLettersBindHotkey, true);
    document.addEventListener("keydown", handleProfilePhotoBindHotkey, true);
    document.addEventListener("keydown", handleTranslateSendBindHotkey, true);
  } catch {}
  await loadExtensionLockState();
  buildPanel();
  setOperatorIdAvailability(hasValidOperatorId(), "init");
  syncMediaBottomIcons();
  scheduleProfilesViewportLayout();
  ensureConnectManInfoButtons();
  applyModalState(getModalState(), { source: "init" });
  const {
    lang,
    pinned: p,
    lastDayKey,
    historyItems: hist,
    taHeight: storedTaHeight,
    templatesTree: storedTemplates,
    templatesLastFolder: lastTemplateFolder,
    [LETTERS_NEW_WINDOW_STORAGE_KEY]: lettersNewWindowStored,
    [LETTERS_OPEN_HOTKEY_STORAGE_KEY]: lettersOpenHotkeyStored,
    [PROFILE_PHOTO_HOTKEY_STORAGE_KEY]: profilePhotoHotkeyStored,
    [TRANSLATE_SEND_HOTKEY_STORAGE_KEY]: translateSendHotkeyStored,
  } = await getStore([
    "lang",
    "pinned",
    "lastDayKey",
    "historyItems",
    "taHeight",
    TEMPLATE_STORAGE_KEY,
    TEMPLATE_LAST_FOLDER_KEY,
    LETTERS_NEW_WINDOW_STORAGE_KEY,
    LETTERS_OPEN_HOTKEY_STORAGE_KEY,
    PROFILE_PHOTO_HOTKEY_STORAGE_KEY,
    TRANSLATE_SEND_HOTKEY_STORAGE_KEY,
  ]);
  currentLang = lang || "ru";
  pinned = !!p;
  if (typeof lettersNewWindowStored === "boolean") {
    lettersOpenInNewWindow = lettersNewWindowStored;
  }
  setLettersOpenHotkey(lettersOpenHotkeyStored, { persist: false });
  setProfilePhotoHotkey(profilePhotoHotkeyStored, { persist: false });
  setTranslateSendHotkey(translateSendHotkeyStored, { persist: false });
  historyItems = Array.isArray(hist) ? hist : [];
  if (storedTaHeight) applyTextareaHeight(storedTaHeight);
  // Если день сменился с прошлого запуска — начинаем с пустого поля (без автозагрузки)
  try {
    const todayKey = dayKey(Date.now());
    if (lastDayKey !== todayKey) {
      forceEmptyOnce = true;
      historyItems = [];
      await setStore({ lastDayKey: todayKey, historyItems });
    }
  } catch {}
  initializeTemplates(storedTemplates, lastTemplateFolder);
  repaintTexts();
  if (pinned) {
    if (
      !isAlphaLanding() &&
      !isExtensionLocked() &&
      !isUiBlockedByMissingOperatorId() &&
      canRenderDrawerInCurrentContext()
    ) {
      ui.drawer.classList.add("open");
      if (ui.drawer.classList.contains("open")) drawerManuallyClosed = false;
    }
  }
  updateLauncherVisibility();
  startLocalTimeUpdates();
  consumeQueuedChatHistorySpendEvents();
  ensureProfileInfoButtons();
  await loadServerAuthState();
  try {
    if (serverAuthPassword) {
      setTimeout(() => {
        ensureServerAccess({ force: true })
          .catch(() => {})
          .finally(() => {
            updateServerAccessUI();
          });
      }, 1500);
    }
  } catch {}
  try {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName !== "local") return;
      if (
        changes[EXTENSION_UNLOCKED_KEY] ||
        changes[EXTENSION_UNLOCKED_AT_KEY] ||
        changes[EXTENSION_AUTH_CHECKED_AT_KEY]
      ) {
        const nextUnlocked = changes[EXTENSION_UNLOCKED_KEY]
          ? !!changes[EXTENSION_UNLOCKED_KEY]?.newValue
          : !extensionLocked;
        extensionLocked = !nextUnlocked;
        if (extensionLocked) {
          try {
            ui?.drawer?.classList?.remove("open");
            ui?.moreBox?.classList?.remove("open");
            closeLogoWhiteSquareExpandedPanel();
            closeAuthModal();
          } catch {}
        }
        setOperatorIdAvailability(hasValidOperatorId(), "storage:onChanged");
        try {
          scheduleLogoWhiteSquarePlacement();
        } catch {}
        updateLauncherVisibility();
      }
      if (
        changes[SERVER_AUTH_ALLOWED_KEY] ||
        changes[SERVER_AUTH_CHECKED_KEY] ||
        changes[SERVER_AUTH_PASS_KEY]
      ) {
        const nextAllowed = changes[SERVER_AUTH_ALLOWED_KEY]?.newValue;
        const nextChecked = changes[SERVER_AUTH_CHECKED_KEY]?.newValue;
        const nextPass = changes[SERVER_AUTH_PASS_KEY]?.newValue;
        if (typeof nextPass === "string") {
          serverAuthPassword = nextPass;
        }
        if (typeof nextAllowed === "boolean") {
          serverAuthAllowed = nextAllowed;
          serverAuthChecking = false;
        }
        if (typeof nextChecked === "number") {
          serverAuthCheckedAt = nextChecked;
        }
        updateServerAccessUI();
      }
    });
  } catch {}
  if (ui?.lettersNewWindowToggle) {
    setLettersNewWindowEnabled(lettersOpenInNewWindow, { persist: false });
    ui.lettersNewWindowToggle.addEventListener("change", (event) => {
      const checked = !!event?.target?.checked;
      setLettersNewWindowEnabled(checked);
    });
  }
  if (ui?.wsEventsDisabledToggle) {
    setWsEventsDisabledSetting(getWsEventsDisabledSetting(), { persist: false });
    ui.wsEventsDisabledToggle.addEventListener("change", (event) => {
      const checked = !!event?.target?.checked;
      setWsEventsDisabledSetting(!checked, { persist: true });
    });
  } else {
    setWebhooksPaidFilterControlDisabled(wsEventsDisabled);
  }
  if (ui?.webhooksPaidFilterToggle) {
    setWebhooksPaidEventsFilterEnabled(getWebhooksPaidEventsFilterEnabled(), {
      persist: false,
    });
    ui.webhooksPaidFilterToggle.addEventListener("change", (event) => {
      const checked = !!event?.target?.checked;
      setWebhooksPaidEventsFilterEnabled(checked, { persist: true });
    });
  }
  if (ui?.lettersOpenHotkeyInput) {
    setLettersOpenHotkey(lettersOpenHotkey, { persist: false });
    ui.lettersOpenHotkeyInput.addEventListener("change", (event) => {
      setLettersOpenHotkey(event?.target?.value);
    });
    ui.lettersOpenHotkeyInput.addEventListener("blur", (event) => {
      setLettersOpenHotkey(event?.target?.value);
    });
  }
  if (ui?.profilePhotoHotkeyInput) {
    setProfilePhotoHotkey(profilePhotoHotkey, { persist: false });
    ui.profilePhotoHotkeyInput.addEventListener("change", (event) => {
      setProfilePhotoHotkey(event?.target?.value);
    });
    ui.profilePhotoHotkeyInput.addEventListener("blur", (event) => {
      setProfilePhotoHotkey(event?.target?.value);
    });
  }
  if (ui?.translateSendHotkeyInput) {
    setTranslateSendHotkey(translateSendHotkey, { persist: false });
    ui.translateSendHotkeyInput.addEventListener("change", (event) => {
      setTranslateSendHotkey(event?.target?.value);
    });
    ui.translateSendHotkeyInput.addEventListener("blur", (event) => {
      setTranslateSendHotkey(event?.target?.value);
    });
  }
  if (ui?.settingsBtn) {
    ui.settingsBtn.addEventListener("click", (event) => {
      try {
        event.preventDefault();
      } catch {}
      if (requireExtensionUnlock()) return;
      toggleSettingsMenu();
    });
  }
  // Align initially and on layout changes
  positionDrawer();
  applyThemeFromPage();
  // Автоочистка счётчиков действий в 02:00 по Киеву
  try {
    const msUntilMonitorReset = msUntilNextMonitorBoundary();
    setTimeout(function onMonitorBoundary() {
      resetMonitorCountersForNewDay();
      try {
        ui?.balanceMonitor?.clearWsEventsForNewDay?.();
      } catch {}
      setTimeout(onMonitorBoundary, msUntilNextMonitorBoundary());
    }, msUntilMonitorReset);
  } catch {}
  // Умное расписание очистки на следующую границу дня (23:00 Киева)
  try {
    const msUntilNext = msUntilNextBoundary();
    setTimeout(function onBoundary() {
      try {
        // Очистить текст отчёта
        ui.ta.value = "";
        currentSavedText = "";
        updateSaveVisual();
        // Сбросить историю общения
        historyItems = [];
        try {
          if (ui.historyList) {
            // Если меню истории открыто — обновим визуально
            ui.historyList.innerHTML = `<div class=\"small muted\">${
              t("emptyHistory") || "История пуста"
            }</div>`;
          }
        } catch {}
        // Зафиксировать новый ключ дня и пустую историю
        setStore({ lastDayKey: dayKey(Date.now()), historyItems });
      } catch {}
      // Перепланировать следующую границу (23:00 Киева)
      setTimeout(onBoundary, msUntilNextBoundary());
    }, msUntilNext);
  } catch {}
  window.addEventListener("resize", positionDrawer, { passive: true });
  window.addEventListener("scroll", positionDrawer, {
    passive: true,
    capture: true,
  });
  try {
    const roBtns = new ResizeObserver(() => updateButtonsCompact());
    if (ui.btns) roBtns.observe(ui.btns);
  } catch {}
  try {
    const roAnchor = new ResizeObserver(() => positionDrawer());
    const anchor = getDrawerAnchorElement();
    if (anchor) roAnchor.observe(anchor);
  } catch {}
  LOG.log("init: done");
})();

// Всегда включённый лёгкий наблюдатель для Истории: добавляет чат при смене собеседника,
// даже когда панель закрыта
try {
  let lastHistoryCheckedKey = "";
  const onMaybeChatChange = () => {
    try {
      const key = getHistoryKey();
      if (!key) return;
      if (key === lastHistoryCheckedKey) return;
      lastHistoryCheckedKey = key;
      // При смене чата дожидаемся стабилизации DOM
      scheduleHistoryCheck();
      prefetchMediaChatContext();
      updateWomanLocalTimeInHeader();
      updateManLocalTimeInHeader();
      updateManSpendInHeader();
      ensureProfileInfoButtons();
    } catch {}
  };
  const moLight = new MutationObserver(onMaybeChatChange);
  moLight.observe(document.documentElement, { childList: true, subtree: true });
  onMaybeChatChange();
} catch {}

// Поддержка клика на иконку расширения: сообщение от service worker
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.type === "toggle") {
    LOG.log("message: toggle");
    togglePanel();
  }
});

function updateLauncherVisibility() {
  try {
    if (!ui?.launcher) return;
    const open = ui?.drawer?.classList?.contains("open");
    ui.launcher.style.display = open ? "none" : "block";
  } catch (e) {
    /* ignore */
  }
}
