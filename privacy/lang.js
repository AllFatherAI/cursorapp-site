// Язык страницы: ?lang=ru|en, иначе язык браузера. Без внешних запросов (CSP default-src 'self').
(function () {
  "use strict";
  var asked = new URLSearchParams(location.search).get("lang");
  var lang = asked === "ru" || asked === "en" ? asked
    : ((navigator.language || "en").toLowerCase().indexOf("ru") === 0 ? "ru" : "en");
  document.documentElement.lang = lang;
  ["ru", "en"].forEach(function (code) {
    var link = document.getElementById("to-" + code);
    if (!link) return;
    if (code === lang) link.setAttribute("aria-current", "true"); else link.removeAttribute("aria-current");
  });
})();
