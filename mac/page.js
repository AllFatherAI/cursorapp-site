// Localized page content and the immutable, signed GitHub release download.
(function () {
  "use strict";
  var locales = window.CursorAppLocales;
  if (!locales || !locales.en) return;
  var url = new URL(location.href);
  var picker = document.getElementById("language");
  var button = document.getElementById("download");
  var label = document.getElementById("download-label");
  var meta = document.getElementById("meta");
  var phase = "loading";
  var release = null;
  function supported(value) {
    if (!value) return null;
    var lower = value.toLowerCase();
    var exact = Object.keys(locales).find(function (key) { return key.toLowerCase() === lower; });
    if (exact) return exact;
    if (/^zh(?:-(?:hans|cn|sg))?(?:-|$)/.test(lower) && !/^zh-(?:hant|tw|hk|mo)/.test(lower)) return "zh-Hans";
    if (/^pt(?:-|$)/.test(lower)) return "pt-BR";
    var base = lower.split("-")[0];
    return locales[base] ? base : null;
  }
  var language = supported(url.searchParams.get("lang"));
  if (!language) {
    (navigator.languages || [navigator.language]).some(function (candidate) {
      language = supported(candidate);
      return !!language;
    });
  }
  language = language || "en";
  function renderRelease() {
    var text = locales[language];
    var ready = phase === "ready";
    label.textContent = ready || phase === "local" ? text.download : phase === "soon" ? text.soon : phase === "error" ? text.unavailable : text.checking;
    if (ready) {
      var size = new Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(release.size / 1048576);
      meta.textContent = text.version.replace("{version}", release.version).replace("{size}", size);
    } else {
      meta.textContent = phase === "soon" ? text.soonDetail : phase === "error" ? text.retry : "";
    }
    document.getElementById("download-fallback").hidden = phase !== "error" && phase !== "soon";
  }
  function applyLanguage() {
    var text = locales[language];
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.title = text.title;
    document.querySelector('meta[name="description"]').content = text.description;
    picker.value = language;
    document.querySelectorAll("[data-i18n]").forEach(function (element) {
      element.textContent = text[element.dataset.i18n];
    });
    document.querySelectorAll("[data-i18n-label]").forEach(function (element) {
      element.setAttribute("aria-label", text[element.dataset.i18nLabel]);
    });
    document.querySelectorAll("[data-localized-link]").forEach(function (link) {
      var next = new URL(link.getAttribute("href"), location.href);
      next.searchParams.set("lang", language);
      link.href = next.href;
    });
    var privacy = new URL("../privacy/", location.href);
    privacy.searchParams.set("lang", language === "ru" ? "ru" : "en");
    document.getElementById("privacy-link").href = privacy.href;
    var image = document.getElementById("product-screen");
    var source = "assets/mac-shortcuts-" + (language === "ru" ? "ru" : "en") + ".webp";
    if (image.getAttribute("src") !== source) image.setAttribute("src", source);
    renderRelease();
  }
  picker.addEventListener("change", function () {
    if (!locales[picker.value]) return;
    language = picker.value;
    var next = new URL(location.href);
    next.searchParams.set("lang", language);
    try { history.replaceState(null, "", next.href); } catch (_) { /* Some local-file viewers restrict history. */ }
    applyLanguage();
  });
  if (location.protocol === "file:") {
    phase = "local";
    applyLanguage();
    return;
  }
  button.removeAttribute("href");
  button.setAttribute("aria-disabled", "true");
  applyLanguage();
  fetch("latest.json", { cache: "no-cache" })
    .then(function (response) { if (!response.ok) throw new Error("manifest"); return response.json(); })
    .then(function (info) {
      if (info && info.version === "0.0.0" && !info.url) {
        phase = "soon";
        button.dataset.state = "unavailable";
        renderRelease();
        return;
      }
      if (!info || !/^\d+\.\d+(?:\.\d+)?$/.test(info.version)
        || !Number.isSafeInteger(info.build) || info.build <= 0
        || !Number.isSafeInteger(info.size) || info.size <= 0
        || !/^[a-f0-9]{64}$/i.test(info.sha256)
        || !/^\d+(?:\.\d+){0,2}$/.test(info.minimumSystemVersion)) throw new Error("manifest");
      var expected = "https://github.com/AllFatherAI/cursorapp-site/releases/download/helper-" + info.version
        + "/CursorApp-Helper-" + info.version + ".dmg";
      if (info.url !== expected) throw new Error("asset");
      release = info;
      phase = "ready";
      button.href = expected;
      button.removeAttribute("aria-disabled");
      button.setAttribute("download", "");
      document.getElementById("sha").textContent = info.sha256;
      document.getElementById("sha-box").hidden = false;
      renderRelease();
    })
    .catch(function () {
      phase = "error";
      button.dataset.state = "unavailable";
      renderRelease();
    });
})();
