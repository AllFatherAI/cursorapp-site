// Accept only a complete manifest for this repository's immutable release asset.
(function () {
  "use strict";
  var lang = document.documentElement.lang;
  var text = {
    ru: { get: "Скачать для Mac", size: "МБ", version: "Версия", unavailable: "Загрузка недоступна", retry: "Открой страницу выпусков ниже." },
    en: { get: "Download for Mac", size: "MB", version: "Version", unavailable: "Download unavailable", retry: "Open the releases page below." }
  }[lang];
  var button = document.getElementById("download");
  var meta = document.getElementById("meta");
  function setLabel(value) {
    button.querySelectorAll("[data-label]").forEach(function (span) {
      if (span.lang === lang) span.textContent = value;
    });
  }
  fetch("latest.json", { cache: "no-cache" })
    .then(function (response) { if (!response.ok) throw new Error("manifest"); return response.json(); })
    .then(function (info) {
      if (!info || !/^\d+\.\d+(?:\.\d+)?$/.test(info.version) || info.version === "0.0.0"
        || !Number.isSafeInteger(info.build) || info.build <= 0
        || !Number.isSafeInteger(info.size) || info.size <= 0
        || !/^[a-f0-9]{64}$/i.test(info.sha256)
        || !/^\d+(?:\.\d+){0,2}$/.test(info.minimumSystemVersion)) throw new Error("manifest");
      var expected = "https://github.com/AllFatherAI/cursorapp-site/releases/download/helper-" + info.version
        + "/CursorApp-Helper-" + info.version + ".dmg";
      if (info.url !== expected) throw new Error("asset");
      button.href = expected;
      button.removeAttribute("aria-disabled");
      button.setAttribute("download", "");
      setLabel(text.get);
      meta.textContent = text.version + " " + info.version + " · " + (info.size / 1048576).toFixed(1) + " " + text.size;
      document.getElementById("sha").textContent = info.sha256;
      document.getElementById("sha-box").hidden = false;
    })
    .catch(function () { setLabel(text.unavailable); meta.textContent = text.retry; });
})();
