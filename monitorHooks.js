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
      if (Number.isFinite(Number(count)) && Number(count) > 0) {
        payload.count = Math.max(1, Math.round(Number(count)));
      }
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

    function extractMailCount(data) {
      if (!data || typeof data !== "object") return 1;
      const ids = data.message_id ?? data.messageId ?? data.message_ids;
      if (Array.isArray(ids)) return ids.length || 1;
      if (ids !== undefined && ids !== null) return 1;
      return 1;
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
        const count = kind === "mail" ? extractMailCount(data) : 1;
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

    hookFetch();
    hookXhr();
  } catch {}
})();
