// Custom zh <-> en language toggle for the Butterfly rightside "translate" button.
// Hijacks #translateLink: instead of 繁/簡 conversion it switches the URL between
// the Chinese site ( / ) and the English site ( /en/ ). From a Chinese page it first
// checks whether the English version exists, and if not it shows a notice instead of
// navigating to a 404.
(function () {
  "use strict";

  var CFG = (window.GLOBAL_CONFIG && GLOBAL_CONFIG.translate) || {};
  var msgToEnglish = "EN";
  var msgToChinese = CFG.msgToTraditionalChinese || "繁";

  function onEnSite() {
    var p = window.location.pathname;
    return p === "/en" || p.indexOf("/en/") === 0;
  }

  function zhUrl() {
    // /en/posts/x.html -> /posts/x.html ; /en/ -> / ; /en -> /
    var p = window.location.pathname.replace(/^\/en(\/|$)/, "/");
    return window.location.origin + p + window.location.search + window.location.hash;
  }

  function enUrl() {
    // /posts/x.html -> /en/posts/x.html ; / -> /en/
    var p = "/en" + window.location.pathname;
    return window.location.origin + p + window.location.search + window.location.hash;
  }

  function toast(text) {
    try {
      var box = document.createElement("div");
      box.textContent = text;
      box.style.cssText =
        "position:fixed;left:50%;bottom:48px;transform:translateX(-50%);" +
        "z-index:9999;max-width:88vw;padding:10px 18px;border-radius:8px;" +
        "background:var(--btn-bg,#49b1f5);color:var(--btn-color,#fff);" +
        "font-size:14px;line-height:1.5;box-shadow:0 4px 16px rgba(0,0,0,.2);" +
        "opacity:0;transition:opacity .25s ease;";
      document.body.appendChild(box);
      requestAnimationFrame(function () { box.style.opacity = "1"; });
      setTimeout(function () {
        box.style.opacity = "0";
        setTimeout(function () { box.remove(); }, 300);
      }, 2800);
    } catch (e) {
      alert(text);
    }
  }

  function translatePage() {
    if (onEnSite()) {
      // The Chinese original always exists, so just go.
      window.location.href = zhUrl();
      return;
    }
    // On a Chinese page: confirm the English version exists before jumping.
    var target = enUrl();
    var btn = document.getElementById("translateLink");
    if (btn) btn.textContent = "…";
    fetch(target, { method: "HEAD" })
      .then(function (res) {
        if (res && res.ok) {
          window.location.href = target;
        } else {
          if (btn) btn.textContent = msgToEnglish;
          toast("🚧 English version not available yet");
        }
      })
      .catch(function () {
        // Network/CDN hiccup: don't block the user, try navigating.
        window.location.href = target;
      });
  }

  function translateInitialization() {
    var btn = document.getElementById("translateLink");
    if (!btn) return;
    btn.textContent = onEnSite() ? msgToChinese : msgToEnglish;
  }

  // Expose the full interface Butterfly's main.js expects.
  window.translateFn = {
    translatePage: translatePage,
    translateInitialization: translateInitialization,
    Traditionalized: function (t) { return t; },
    Simplized: function (t) { return t; }
  };

  function boot() { translateInitialization(); }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  document.addEventListener("pjax:complete", translateInitialization);
})();
