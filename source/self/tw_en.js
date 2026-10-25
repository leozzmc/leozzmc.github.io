// Custom zh <-> en language toggle for the Butterfly rightside "translate" button.
// The theme's own tw_cn.js (Traditional<->Simplified converter) also claims
// window.translateFn and loads in a way that overwrites ours, so instead of
// fighting over that global we intercept the button click directly in the capture
// phase and bypass the theme handler. From a Chinese page we first HEAD-check the
// English URL and show a notice instead of navigating to a 404 when it is missing.
(function () {
  "use strict";

  var CFG = (window.GLOBAL_CONFIG && GLOBAL_CONFIG.translate) || {};
  var MSG_EN = "EN";
  var MSG_ZH = CFG.msgToTraditionalChinese || "繁";

  function onEnSite() {
    var p = window.location.pathname;
    return p === "/en" || p.indexOf("/en/") === 0;
  }
  function zhUrl() {
    var p = window.location.pathname.replace(/^\/en(\/|$)/, "/");
    return window.location.origin + p + window.location.search + window.location.hash;
  }
  function enUrl() {
    return window.location.origin + "/en" + window.location.pathname +
      window.location.search + window.location.hash;
  }

  function toast(text) {
    try {
      var box = document.createElement("div");
      box.textContent = text;
      box.style.cssText =
        "position:fixed;left:50%;bottom:48px;transform:translateX(-50%);" +
        "z-index:99999;max-width:88vw;padding:10px 18px;border-radius:8px;" +
        "background:var(--btn-bg,#49b1f5);color:var(--btn-color,#fff);" +
        "font-size:14px;line-height:1.5;box-shadow:0 4px 16px rgba(0,0,0,.2);" +
        "opacity:0;transition:opacity .25s ease;";
      document.body.appendChild(box);
      requestAnimationFrame(function () { box.style.opacity = "1"; });
      setTimeout(function () {
        box.style.opacity = "0";
        setTimeout(function () { box.remove(); }, 300);
      }, 2800);
    } catch (e) { alert(text); }
  }

  function go() {
    var btn = document.getElementById("translateLink");
    if (onEnSite()) {
      window.location.href = zhUrl();   // Chinese original always exists
      return;
    }
    var target = enUrl();
    if (btn) btn.textContent = "…";
    fetch(target, { method: "HEAD" })
      .then(function (res) {
        if (res && res.ok) {
          window.location.href = target;
        } else {
          if (btn) btn.textContent = MSG_EN;
          toast("🚧 English version not available yet");
        }
      })
      .catch(function () { window.location.href = target; });
  }

  function onClick(e) {
    e.preventDefault();
    e.stopImmediatePropagation(); // keep the theme's rightside handler from firing
    go();
  }

  function bind() {
    var btn = document.getElementById("translateLink");
    if (!btn) return;
    btn.textContent = onEnSite() ? MSG_ZH : MSG_EN;
    if (btn.dataset.twEnBound) return;
    btn.dataset.twEnBound = "1";
    btn.addEventListener("click", onClick, true); // capture phase -> runs first
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bind);
  } else {
    bind();
  }
  window.addEventListener("load", bind);
  document.addEventListener("pjax:complete", bind);
})();
