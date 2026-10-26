// Язык и кнопка загрузки. Без внешних запросов: только latest.json с этого же адреса (CSP default-src 'self').
(function () {
  "use strict";
  var params = new URLSearchParams(location.search);
  var asked = params.get("lang");
  var lang = asked === "ru" || asked === "en" ? asked
    : ((navigator.language || "en").toLowerCase().indexOf("ru") === 0 ? "ru" : "en");
  document.documentElement.lang = lang;
  ["ru", "en"].forEach(function (code) {
    var link = document.getElementById("to-" + code);
    if (!link) return;
    if (code === lang) link.setAttribute("aria-current", "true"); else link.removeAttribute("aria-current");
  });

  var text = {
    ru: { soon: "Скоро", get: "Скачать", size: "МБ", version: "Версия", mac: function (v) { return "macOS " + v + " или новее"; } },
    en: { soon: "Coming soon", get: "Download", size: "MB", version: "Version", mac: function (v) { return "macOS " + v + " or later"; } }
  }[lang];

  var button = document.getElementById("download");
  var meta = document.getElementById("meta");
  var shaBox = document.getElementById("sha-box");
  var sha = document.getElementById("sha");

  function setLabel(value) {
    // Подписи кнопки уже в разметке на обоих языках; меняем только видимую ветку
    var spans = button.querySelectorAll("[data-label]");
    for (var i = 0; i < spans.length; i++) if (spans[i].lang === lang) spans[i].textContent = value;
  }

  fetch("latest.json", { cache: "no-cache" })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (info) {
      if (!info || info.version === "0.0.0" || !info.url) return;   // до первого выпуска — «Скоро», кнопка выключена
      button.href = info.url;
      button.removeAttribute("aria-disabled");
      button.setAttribute("download", "");
      setLabel(text.get + " " + info.version);
      var mb = info.size ? (info.size / 1048576).toFixed(1) + " " + text.size + " · " : "";
      // minimumSystemVersion — из Info.plist выпуска (release-helper.sh): «14.0» → «14»
      var minimum = String(info.minimumSystemVersion || "14").replace(/\.0$/, "");
      meta.textContent = text.version + " " + info.version + " · " + mb + text.mac(minimum);
      if (info.sha256) { sha.textContent = info.sha256; shaBox.hidden = false; }
    })
    .catch(function () { /* страница остаётся в состоянии «Скоро» */ });
})();
