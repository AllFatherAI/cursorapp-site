// Localized page content and the immutable, signed GitHub release download.
(function () {
  "use strict";
  var locales = window.CursorAppLocales;
  if (!locales || !locales.en) return;
  var url = new URL(location.href);
  var picker = document.getElementById("language");
  var buttons = document.querySelectorAll("[data-download]");
  var labels = document.querySelectorAll(".download-label");
  var metas = document.querySelectorAll(".release-meta");
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
  function each(list, body) { Array.prototype.forEach.call(list, body); }
  function renderRelease() {
    var text = locales[language];
    var ready = phase === "ready";
    var label = ready || phase === "local" ? text.download : phase === "soon" ? text.soon : phase === "error" ? text.unavailable : text.checking;
    each(labels, function (element) { element.textContent = label; });
    var meta = "";
    if (ready) {
      var size = new Intl.NumberFormat(language, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(release.size / 1048576);
      meta = text.version.replace("{version}", release.version).replace("{size}", size);
    } else if (phase === "soon") {
      meta = text.soonDetail;
    } else if (phase === "error") {
      meta = text.retry;
    }
    each(metas, function (element) {
      element.textContent = ready && "statusOnly" in element.dataset ? "" : meta;
    });
    each(document.querySelectorAll(".download-fallback"), function (element) {
      element.hidden = phase !== "error" && phase !== "soon";
    });
  }
  function applyLanguage() {
    var text = locales[language];
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.title = text.title;
    document.querySelector('meta[name="description"]').content = text.description;
    picker.value = language;
    each(document.querySelectorAll("[data-i18n]"), function (element) {
      element.textContent = text[element.dataset.i18n];
    });
    each(document.querySelectorAll("[data-i18n-label]"), function (element) {
      element.setAttribute("aria-label", text[element.dataset.i18nLabel]);
    });
    each(document.querySelectorAll("[data-i18n-alt]"), function (element) {
      element.alt = text[element.dataset.i18nAlt];
    });
    each(document.querySelectorAll("[data-localized-link]"), function (link) {
      var next = new URL(link.getAttribute("href"), location.href);
      next.searchParams.set("lang", language);
      link.href = next.href;
    });
    var privacy = new URL("../privacy/", location.href);
    privacy.searchParams.set("lang", language === "ru" ? "ru" : "en");
    each(document.querySelectorAll(".privacy-link"), function (link) { link.href = privacy.href; });
    // Native captures exist in Russian and English; every other language shows English.
    var suffix = language === "ru" ? "ru" : "en";
    each(document.querySelectorAll("img[data-shot]"), function (image) {
      var source = "assets/" + image.dataset.shot + "-" + suffix + ".webp";
      if (image.getAttribute("src") !== source) image.setAttribute("src", source);
    });
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
  each(buttons, function (button) {
    button.removeAttribute("href");
    button.setAttribute("aria-disabled", "true");
  });
  applyLanguage();
  function unavailable() {
    phase = "error";
    each(buttons, function (button) { button.dataset.state = "unavailable"; });
    renderRelease();
  }
  fetch("latest.json", { cache: "no-cache" })
    .then(function (response) { if (!response.ok) throw new Error("manifest"); return response.json(); })
    .then(function (info) {
      if (info && info.version === "0.0.0" && !info.url) {
        phase = "soon";
        each(buttons, function (button) { button.dataset.state = "unavailable"; });
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
      each(buttons, function (button) {
        button.href = expected;
        button.removeAttribute("aria-disabled");
        button.setAttribute("download", "");
      });
      document.getElementById("sha").textContent = info.sha256;
      document.getElementById("sha-box").hidden = false;
      renderRelease();
    })
    .catch(unavailable);
})();

// Motion and the trackpad demo. The page reads complete without any of it.
(function () {
  "use strict";
  document.documentElement.classList.add("reveal-ready");

  var reveals = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10% 0px" });
    reveals.forEach(function (element) { observer.observe(element); });
  } else {
    reveals.forEach(function (element) { element.classList.add("is-in"); });
  }

  // A pointer on a Mac-sized screen, driven by the real trackpad picture.
  var pad = document.getElementById("pad");
  var screen = document.getElementById("mac-screen");
  var pointer = document.getElementById("mac-pointer");
  if (!pad || !screen || !pointer) return;
  var readPointer = document.getElementById("read-pointer");
  var readClicks = document.getElementById("read-clicks");
  var macWidth = 1512, macHeight = 982; // ponytail: a 14-inch MacBook Pro's default resolution, for the readout only
  var x = 0.5, y = 0.5, clicks = 0, last = null, start = null;
  screen.classList.add("live");
  function draw() {
    pointer.style.transform = "translate(" + x * screen.clientWidth + "px," + y * screen.clientHeight + "px)";
    readPointer.textContent = Math.round(x * macWidth) + ", " + Math.round(y * macHeight);
  }
  function move(dx, dy) {
    // Faster strokes travel further, like pointer acceleration on a Mac.
    var gain = 0.9 + Math.min(Math.hypot(dx, dy) / 16, 1.1);
    x = Math.max(0, Math.min(1, x + dx * gain / pad.clientWidth));
    y = Math.max(0, Math.min(1, y + dy * gain / pad.clientHeight));
    draw();
  }
  function click() {
    clicks += 1;
    readClicks.textContent = clicks.toLocaleString(document.documentElement.lang);
    var ring = document.createElement("span");
    ring.className = "ripple";
    ring.style.transform = pointer.style.transform;
    ring.addEventListener("animationend", function () { ring.remove(); });
    screen.appendChild(ring);
  }
  pad.addEventListener("pointerdown", function (event) {
    pad.setPointerCapture(event.pointerId);
    last = { x: event.clientX, y: event.clientY };
    start = { time: event.timeStamp, travel: 0 };
  });
  pad.addEventListener("pointermove", function (event) {
    if (!last) return;
    var dx = event.clientX - last.x, dy = event.clientY - last.y;
    last = { x: event.clientX, y: event.clientY };
    start.travel += Math.abs(dx) + Math.abs(dy);
    move(dx, dy);
  });
  pad.addEventListener("pointerup", function (event) {
    if (start && start.travel < 8 && event.timeStamp - start.time < 300) click();
    last = start = null;
  });
  pad.addEventListener("pointercancel", function () { last = start = null; });
  pad.addEventListener("keydown", function (event) {
    var step = 12;
    var keys = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    if (keys[event.key]) move(keys[event.key][0], keys[event.key][1]);
    else if (event.key === "Enter" || event.key === " ") click();
    else return;
    event.preventDefault();
  });
  addEventListener("resize", draw);
  draw();
})();
