(() => {
  try {
    if (window.__OT4ET_WS_EARLY_INJECTED__) return;
    window.__OT4ET_WS_EARLY_INJECTED__ = true;
    const script = document.createElement("script");
    script.src = chrome.runtime.getURL("monitorHooks.js");
    script.type = "text/javascript";
    script.onload = () => {
      try {
        script.remove();
      } catch {}
    };
    script.onerror = () => {
      try {
        script.remove();
      } catch {}
    };
    (document.documentElement || document.head || document.body)?.appendChild(script);
  } catch {}
})();
