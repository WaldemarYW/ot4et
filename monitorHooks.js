(() => {
  try {
    if (window.__OT4ET_MONITOR_HOOKED__) return;
    window.__OT4ET_MONITOR_HOOKED__ = true;
    const script = document.currentScript;
    let endpoints = null;
    try {
      endpoints = script?.dataset?.endpoints
        ? JSON.parse(script.dataset.endpoints)
        : null;
    } catch {
      endpoints = null;
    }
    const CHAT_ENDPOINT =
      endpoints?.chat || "https://alpha.date/api/chat/message";
    const MAIL_ENDPOINT =
      endpoints?.mail || "https://alpha.date/api/mailbox/mail";
    const SENDER_LIST_ENDPOINT =
      endpoints?.senderList || endpoints?.sender_list || "https://alpha.date/api/sender/senderList";
    const XHR_SYMBOL = "__ot4etMonitorKind__";
    const XHR_PROFILE_SYMBOL = "__ot4etMonitorProfileId__";
    const XHR_SENDER_LIST_SYMBOL = "__ot4etSenderList__";
    const MAIL_ID_KEYS = [
      "user_id",
      "userid",
      "userId",
      "woman_id",
      "womanId",
      "client_id",
      "clientId",
      "recipient_id",
      "recipientId",
      "profile_id",
      "profileId",
    ];
    const CHAT_ID_KEYS = [
      "sender_external_id",
      "senderExternalId",
      "sender_id",
      "senderId",
      "user_id",
      "userId",
    ];

    function resolveUrl(input) {
      try {
        if (!input) return "";
        if (typeof input === "string") {
          return new URL(input, window.location.href).href;
        }
        if (typeof Request !== "undefined" && input instanceof Request) {
          return new URL(input.url, window.location.href).href;
        }
        if (input && typeof input.url === "string") {
          return new URL(input.url, window.location.href).href;
        }
      } catch {}
      try {
        return String(input || "");
      } catch {
        return "";
      }
    }

    function matchesEndpoint(url, prefix) {
      if (!url || !prefix) return false;
      if (!url.startsWith(prefix)) return false;
      const next = url.charAt(prefix.length);
      return !next || next === "?" || next === "#" || next === "&" || next === "/";
    }

    function getKindFromInput(input) {
      const normalized = resolveUrl(input);
      if (!normalized) return "";
      if (matchesEndpoint(normalized, CHAT_ENDPOINT)) return "chat";
      if (matchesEndpoint(normalized, MAIL_ENDPOINT)) return "mail";
      return "";
    }

    function isSenderListInput(input) {
      const normalized = resolveUrl(input);
      if (!normalized) return false;
      if (matchesEndpoint(normalized, SENDER_LIST_ENDPOINT)) return true;
      try {
        const url = new URL(normalized, window.location.href);
        return url.pathname.startsWith("/api/sender/senderList");
      } catch {}
      return normalized.indexOf("/api/sender/senderList") !== -1;
    }

    function hasErrorFlag(data) {
      if (!data || typeof data !== "object") return false;
      if (Object.prototype.hasOwnProperty.call(data, "error")) {
        const value = data.error;
        if (value == null) return false;
        if (typeof value === "boolean") return value;
        if (typeof value === "number") return value !== 0;
        const str = String(value).trim();
        if (!str || str === "0" || str.toLowerCase() === "false") return false;
        return true;
      }
      if (Object.prototype.hasOwnProperty.call(data, "errors")) {
        const value = data.errors;
        if (value == null) return false;
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "object") return Object.keys(value).length > 0;
        if (typeof value === "string") return value.trim().length > 0;
        if (typeof value === "number") return value !== 0;
        if (typeof value === "boolean") return value;
      }
      return false;
    }

    function normalizeProfileId(value) {
      const raw = String(value ?? "").trim();
      if (!raw) return "";
      const digits = raw.replace(/\D/g, "");
      return digits || raw;
    }

    function pickProfileIdFromObject(obj, keys) {
      for (const key of keys) {
        if (
          Object.prototype.hasOwnProperty.call(obj, key) &&
          obj[key] != null &&
          obj[key] !== ""
        ) {
          const normalized = normalizeProfileId(obj[key]);
          if (normalized) return normalized;
        }
      }
      return "";
    }

    function extractProfileIdFromData(data, kind, seen = new WeakSet()) {
      if (!data || typeof data !== "object") return "";
      if (seen.has(data)) return "";
      seen.add(data);
      if (Array.isArray(data)) {
        for (const item of data) {
          const found = extractProfileIdFromData(item, kind, seen);
          if (found) return found;
        }
        return "";
      }
      const keys = kind === "mail" ? MAIL_ID_KEYS : CHAT_ID_KEYS;
      const direct = pickProfileIdFromObject(data, keys);
      if (direct) return direct;
      const candidates = [
        data.data,
        data.response,
        data.result,
        data.payload,
        data.item,
        data.items,
        data.message,
        data.mail,
        data.chat,
        data.entry,
      ];
      for (const candidate of candidates) {
        const found = extractProfileIdFromData(candidate, kind, seen);
        if (found) return found;
      }
      return "";
    }

    function convertFormDataToObject(formData) {
      const out = Object.create(null);
      try {
        for (const [key, value] of formData.entries()) {
          if (out[key] !== undefined) continue;
          out[key] = value;
        }
      } catch {}
      return out;
    }

    function parseQueryString(str) {
      const out = Object.create(null);
      try {
        const query = new URLSearchParams(str);
        for (const [key, value] of query.entries()) {
          if (out[key] !== undefined) continue;
          out[key] = value;
        }
      } catch {}
      return out;
    }

    function extractProfileIdFromBody(kind, body) {
      if (!body) return "";
      let data = null;
      if (typeof body === "string") {
        const trimmed = body.trim();
        if (!trimmed) return "";
        try {
          data = JSON.parse(trimmed);
        } catch {
          data = parseQueryString(trimmed);
        }
      } else if (
        typeof FormData !== "undefined" &&
        body instanceof FormData
      ) {
        data = convertFormDataToObject(body);
      } else if (
        typeof URLSearchParams !== "undefined" &&
        body instanceof URLSearchParams
      ) {
        data = Object.fromEntries(body.entries());
      } else if (typeof body === "object") {
        data = body;
      }
      if (!data) return "";
      return extractProfileIdFromData(data, kind);
    }

    function extractProfileIdFromFetchArgs(kind, args) {
      if (!kind || !Array.isArray(args) || !args.length) return "";
      const init = args[1];
      if (init && init.body) {
        const fromBody = extractProfileIdFromBody(kind, init.body);
        if (fromBody) return fromBody;
      }
      return "";
    }

    function notify(kind, profileId, count) {
      if (!kind) return;
      const payload = { type: "OT4ET_MONITOR_RECORD", kind };
      if (profileId) payload.profileId = profileId;
      const normalizedCount = Number.isFinite(Number(count))
        ? Math.max(1, Math.floor(Number(count)))
        : 1;
      if (normalizedCount > 1) payload.count = normalizedCount;
      window.postMessage(payload, "*");
    }

    function notifySenderList(payload) {
      try {
        const raw =
          typeof payload === "string" ? payload : JSON.stringify(payload);
        window.localStorage.setItem("__ot4et_sender_list__", raw || "");
        window.localStorage.setItem(
          "__ot4et_sender_list_ts__",
          String(Date.now())
        );
      } catch {}
      window.postMessage({ type: "OT4ET_SENDER_LIST", payload }, "*");
    }

    function postWsEvent(payload) {
      try {
        window.postMessage({ type: "OT4ET_WS_EVENT", payload }, "*");
      } catch {}
    }

    function getKnownProfileIds() {
      try {
        const raw = window?.localStorage?.getItem?.("__ot4et_profile_ids__");
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed.map((val) => String(val || "").trim()).filter(Boolean);
        }
      } catch {}
      return [];
    }

    function extractFirstValue(data, keys, seen = new WeakSet()) {
      if (!data || typeof data !== "object") return null;
      if (seen.has(data)) return null;
      seen.add(data);
      if (Array.isArray(data)) {
        for (const item of data) {
          const found = extractFirstValue(item, keys, seen);
          if (found != null) return found;
        }
        return null;
      }
      for (const key of keys) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const val = data[key];
          if (val !== undefined) return val;
        }
      }
      for (const value of Object.values(data)) {
        const found = extractFirstValue(value, keys, seen);
        if (found != null) return found;
      }
      return null;
    }

    const wsSeenMessages = new Map();
    function makeWsDedupKey(source, channelText) {
      if (!source || typeof source !== "object") return "";
      const msgId = source.id ?? source.message_id ?? source.notification_id;
      const createdAt = source.created_at || source.date_created || "";
      const chatUid = source.chat_uid || "";
      const type = source.message_type || "";
      if (msgId || createdAt || chatUid) {
        return `${channelText}::${msgId || ""}::${chatUid || ""}::${createdAt || ""}::${type || ""}`;
      }
      return "";
    }

    function shouldEmitWsEvent(source, channelText) {
      const key = makeWsDedupKey(source, channelText);
      if (!key) return true;
      const now = Date.now();
      const last = wsSeenMessages.get(key);
      if (last && now - last < 5000) return false;
      wsSeenMessages.set(key, now);
      if (wsSeenMessages.size > 5000) {
        const cutoff = now - 300000;
        for (const [k, ts] of wsSeenMessages.entries()) {
          if (ts < cutoff) wsSeenMessages.delete(k);
        }
      }
      return true;
    }

    function handleSocketPayload(message) {
      if (!message || typeof message !== "object") return;
      const channel = Array.isArray(message) ? message[0] : "";
      const payload =
        Array.isArray(message) && message.length > 1 ? message[1] : message;
      if (!payload || typeof payload !== "object") return;
      const channelText = String(channel || "");
      const source =
        payload.message_object && typeof payload.message_object === "object"
          ? payload.message_object
          : payload;
      const action = String(extractFirstValue(payload, ["action"]) || "").toLowerCase();
      // Special mail socket shape: action=mail/read_mail with IDs only.
      if (action === "mail" || action === "read_mail") {
        const femaleIdRaw = extractFirstValue(payload, ["female_id", "femaleId"]);
        const maleExternalRaw = extractFirstValue(payload, [
          "male_external_id",
          "maleExternalId",
        ]);
        const femaleId = String(femaleIdRaw || "").replace(/\D/g, "");
        const maleExternalId = String(maleExternalRaw || "").replace(/\D/g, "");
        if (femaleId && maleExternalId) {
          postWsEvent({
            action,
            female_id: femaleId,
            male_external_id: maleExternalId,
            created_at:
              extractFirstValue(payload, ["updated_limit_at", "updatedAt"]) ||
              new Date().toISOString(),
          });
        }
        return;
      }
      const payedVal = extractFirstValue(source, ["payed", "paid"]);
      const payed = Number(payedVal);
      if (!Number.isFinite(payed) || payed <= 0) return;
      const messageType = extractFirstValue(source, [
        "message_type",
        "messageType",
      ]);
      const createdAt = extractFirstValue(source, [
        "created_at",
        "date_created",
        "createdAt",
      ]);
      const chatUid = extractFirstValue(source, ["chat_uid", "chatUid"]);
      if (!messageType || !createdAt || !chatUid) return;
      if (!shouldEmitWsEvent(source, channelText)) return;
      postWsEvent({
        message_type: messageType,
        created_at: createdAt,
        chat_uid: chatUid,
      });
    }

    function parseSocketIoMessage(text) {
      if (typeof text !== "string") return null;
      const trimmed = text.trim();
      if (!trimmed.startsWith("42")) return null;
      const json = trimmed.slice(2);
      if (!json) return null;
      try {
        return JSON.parse(json);
      } catch {
        return null;
      }
    }

    function handleSocketData(data) {
      try {
        if (typeof data === "string") {
          const parsed = parseSocketIoMessage(data);
          if (Array.isArray(parsed) && parsed.length >= 2) {
            handleSocketPayload(parsed);
          }
          return;
        }
        if (typeof ArrayBuffer !== "undefined" && data instanceof ArrayBuffer) {
          try {
            const text = new TextDecoder("utf-8").decode(new Uint8Array(data));
            const parsed = parseSocketIoMessage(text);
            if (Array.isArray(parsed) && parsed.length >= 2) {
              handleSocketPayload(parsed);
            }
          } catch {}
          return;
        }
        if (typeof Blob !== "undefined" && data instanceof Blob) {
          if (typeof data.text === "function") {
            data
              .text()
              .then((text) => {
                const parsed = parseSocketIoMessage(text);
                if (Array.isArray(parsed) && parsed.length >= 2) {
                  handleSocketPayload(parsed);
                }
              })
              .catch(() => {});
          }
        }
      } catch {}
    }

    function extractMessageIdCount(data, seen = new WeakSet()) {
      if (!data || typeof data !== "object") return 0;
      if (seen.has(data)) return 0;
      seen.add(data);
      if (Array.isArray(data)) {
        for (const item of data) {
          const found = extractMessageIdCount(item, seen);
          if (found) return found;
        }
        return 0;
      }
      const directKeys = ["message_id", "message_ids", "messageId", "messageIds"];
      for (const key of directKeys) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
          const value = data[key];
          if (Array.isArray(value)) return value.length;
          if (value == null || value === "") return 0;
          return 1;
        }
      }
      for (const value of Object.values(data)) {
        const found = extractMessageIdCount(value, seen);
        if (found) return found;
      }
      return 0;
    }

    function evaluatePayload(payload, kind, profileHint) {
      if (!kind) return;
      let data = payload;
      if (typeof payload === "string") {
        const text = payload.trim();
        if (text) {
          try {
            data = JSON.parse(text);
          } catch {
            data = null;
          }
        } else {
          data = null;
        }
      }
      if (!hasErrorFlag(data)) {
        const profileFromPayload =
          data && typeof data === "object"
            ? extractProfileIdFromData(data, kind)
            : "";
        const profileId = profileFromPayload || profileHint || "";
        let count = 1;
        if (kind === "mail" && data && typeof data === "object") {
          const msgCount = extractMessageIdCount(data);
          count = msgCount > 0 ? msgCount : 1;
        }
        notify(kind, profileId, count);
      }
    }

    function hookFetch() {
      if (typeof window.fetch !== "function") return;
      const originalFetch = window.fetch;
      window.fetch = function patchedFetch(...args) {
        let kind = "";
        let senderList = false;
        try {
          kind = getKindFromInput(args[0]);
          senderList = isSenderListInput(args[0]);
        } catch {
          kind = "";
          senderList = false;
        }
        const profileHint = extractProfileIdFromFetchArgs(kind, args);
        const result = originalFetch.apply(this, args);
        if ((!kind && !senderList) || !result || typeof result.then !== "function") {
          return result;
        }
        return result.then((response) => {
          try {
            if (response && typeof response.clone === "function" && response.ok) {
              response
                .clone()
                .text()
                .then((text) => {
                  if (kind) evaluatePayload(text, kind, profileHint);
                  if (senderList && text) notifySenderList(text);
                })
                .catch(() => {});
            }
          } catch {}
          return response;
        });
      };
    }

    function hookXhr() {
      const ctor = window.XMLHttpRequest;
      if (!ctor || !ctor.prototype) return;
      const proto = ctor.prototype;
      const originalOpen = proto.open;
      const originalSend = proto.send;
      if (typeof originalOpen !== "function" || typeof originalSend !== "function")
        return;
      proto.open = function patchedOpen(method, url, ...rest) {
        try {
          this[XHR_SYMBOL] = getKindFromInput(url);
          this[XHR_SENDER_LIST_SYMBOL] = isSenderListInput(url);
        } catch {
          this[XHR_SYMBOL] = "";
          this[XHR_SENDER_LIST_SYMBOL] = false;
        }
        return originalOpen.call(this, method, url, ...rest);
      };
      proto.send = function patchedSend(...args) {
        const kind = this[XHR_SYMBOL];
        const senderList = this[XHR_SENDER_LIST_SYMBOL];
        if (kind) {
          const body = args[0];
          try {
            this[XHR_PROFILE_SYMBOL] = extractProfileIdFromBody(kind, body);
          } catch {
            this[XHR_PROFILE_SYMBOL] = "";
          }
        } else {
          this[XHR_PROFILE_SYMBOL] = "";
        }
        if (kind || senderList) {
          this.addEventListener(
            "loadend",
            () => {
              const currentKind = this[XHR_SYMBOL];
              const profileHint = this[XHR_PROFILE_SYMBOL];
              const isSenderList = this[XHR_SENDER_LIST_SYMBOL];
              this[XHR_SYMBOL] = "";
              this[XHR_PROFILE_SYMBOL] = "";
              this[XHR_SENDER_LIST_SYMBOL] = false;
              if (!currentKind && !isSenderList) return;
              try {
                if (this.status >= 200 && this.status < 300) {
                  let payload = null;
                  if (
                    !this.responseType ||
                    this.responseType === "" ||
                    this.responseType === "text"
                  ) {
                    payload = this.responseText || "";
                  } else if (this.responseType === "json") {
                    payload = this.response;
                  }
                  if (payload !== null) {
                    if (currentKind) {
                      evaluatePayload(payload, currentKind, profileHint);
                    }
                    if (isSenderList) {
                      notifySenderList(payload);
                    }
                  }
                }
              } catch {}
            },
            { once: true }
          );
        }
        return originalSend.apply(this, args);
      };
    }

    function hookWebSocket() {
      if (typeof window.WebSocket !== "function") return;
      const OriginalWebSocket = window.WebSocket;
      if (!OriginalWebSocket.__ot4et_onmessage_patched) {
        try {
          const desc = Object.getOwnPropertyDescriptor(
            OriginalWebSocket.prototype,
            "onmessage"
          );
          if (desc && typeof desc.set === "function" && typeof desc.get === "function") {
            Object.defineProperty(OriginalWebSocket.prototype, "onmessage", {
              configurable: true,
              enumerable: true,
              get() {
                return this.__ot4et_onmessage_handler || null;
              },
              set(handler) {
                this.__ot4et_onmessage_handler = handler;
                const wrapped = typeof handler === "function"
                  ? function wrappedOnMessage(ev) {
                      try {
                        handleSocketData(ev?.data);
                      } catch {}
                      return handler.call(this, ev);
                    }
                  : null;
                try {
                  return desc.set.call(this, wrapped);
                } catch {
                  return desc.set.call(this, handler);
                }
              },
            });
            OriginalWebSocket.__ot4et_onmessage_patched = true;
          }
        } catch {}
      }
      if (!OriginalWebSocket.__ot4et_dispatch_patched) {
        try {
          const originalDispatch = OriginalWebSocket.prototype.dispatchEvent;
          OriginalWebSocket.prototype.dispatchEvent = function patchedDispatch(event) {
            try {
              if (event?.type === "message") {
                handleSocketData(event?.data);
              }
            } catch {}
            return originalDispatch.call(this, event);
          };
          OriginalWebSocket.__ot4et_dispatch_patched = true;
        } catch {}
      }
      window.WebSocket = function PatchedWebSocket(url, protocols) {
        const ws =
          protocols !== undefined
            ? new OriginalWebSocket(url, protocols)
            : new OriginalWebSocket(url);
        return ws;
      };
      window.WebSocket.prototype = OriginalWebSocket.prototype;
      window.WebSocket.OPEN = OriginalWebSocket.OPEN;
      window.WebSocket.CLOSED = OriginalWebSocket.CLOSED;
      window.WebSocket.CLOSING = OriginalWebSocket.CLOSING;
      window.WebSocket.CONNECTING = OriginalWebSocket.CONNECTING;
    }

    hookFetch();
    hookXhr();
    hookWebSocket();
  } catch {}
})();
