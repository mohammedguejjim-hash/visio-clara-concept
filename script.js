/* ============ VISIO CLARA — interactions ============ */
(function () {
  "use strict";

  /* ---------- Preloader ---------- */
  var preloader = document.getElementById("preloader");

  // Build tick marks for the preloader iris
  (function buildPreloaderTicks() {
    var g = document.getElementById("preloader-ticks");
    if (!g) return;
    var NS = "http://www.w3.org/2000/svg";
    for (var i = 0; i < 48; i++) {
      var a = (i / 48) * Math.PI * 2;
      var long = i % 4 === 0;
      var r1 = long ? 74 : 78, r2 = 84;
      var l = document.createElementNS(NS, "line");
      l.setAttribute("x1", 100 + r1 * Math.cos(a));
      l.setAttribute("y1", 100 + r1 * Math.sin(a));
      l.setAttribute("x2", 100 + r2 * Math.cos(a));
      l.setAttribute("y2", 100 + r2 * Math.sin(a));
      l.setAttribute("class", "iris-tick");
      g.appendChild(l);
    }
  })();

  function hidePreloader() {
    preloader.classList.add("opening");
    setTimeout(function () { preloader.classList.add("done"); }, 1150);
  }
  // Give the hero video a head start, then open the iris
  window.addEventListener("load", function () {
    setTimeout(hidePreloader, 1400);
  });
  // Failsafe: never trap the user behind the preloader
  setTimeout(function () {
    preloader.classList.add("opening");
    preloader.classList.add("done");
  }, 6000);

  /* ---------- Nav scroll state ---------- */
  var nav = document.getElementById("nav");
  function onScrollNav() {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScrollNav, { passive: true });
  onScrollNav();

  /* ---------- HUD tick marks ---------- */
  (function buildHudTicks() {
    var g = document.getElementById("hud-ticks");
    if (!g) return;
    var NS = "http://www.w3.org/2000/svg";
    for (var i = 0; i < 72; i++) {
      var a = (i / 72) * Math.PI * 2;
      var long = i % 6 === 0;
      var r1 = long ? 352 : 364, r2 = 380;
      var l = document.createElementNS(NS, "line");
      l.setAttribute("x1", 500 + r1 * Math.cos(a));
      l.setAttribute("y1", 500 + r1 * Math.sin(a));
      l.setAttribute("x2", 500 + r2 * Math.cos(a));
      l.setAttribute("y2", 500 + r2 * Math.sin(a));
      l.setAttribute("class", "hud-tick");
      g.appendChild(l);
    }
  })();

  /* ---------- Pinned journey sequence ---------- */
  var journey = document.querySelector(".journey");
  var layers = Array.prototype.slice.call(document.querySelectorAll(".j-layer"));
  var words = Array.prototype.slice.call(document.querySelectorAll(".j-word"));
  var bar = document.querySelector(".journey-bar");
  var journeyTicking = false;

  function smoothstep(a, b, x) {
    var t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  function updateJourney() {
    journeyTicking = false;
    if (!journey) return;
    var rect = journey.getBoundingClientRect();
    var total = rect.height - window.innerHeight;
    var p = Math.min(1, Math.max(0, -rect.top / total)); // 0..1

    if (bar) bar.style.width = (p * 100).toFixed(2) + "%";

    // Three stages: [0, .38], [.31, .69], [.62, 1] with overlap for crossfade
    var stages = [
      [0.0, 0.38],
      [0.31, 0.69],
      [0.62, 1.0]
    ];
    for (var i = 0; i < 3; i++) {
      var s = stages[i];
      var fadeIn = smoothstep(s[0], s[0] + 0.09, p);
      var fadeOut = 1 - smoothstep(s[1] - 0.09, s[1], p);
      var o = Math.min(fadeIn, fadeOut);
      if (layers[i]) {
        layers[i].style.opacity = o.toFixed(3);
        layers[i].style.transform = "scale(" + (1.12 - 0.12 * o).toFixed(3) + ")";
      }
      if (words[i]) {
        words[i].style.opacity = o.toFixed(3);
        var y = (1 - o) * 60;
        words[i].style.transform = "translateY(calc(-50% + " + y.toFixed(1) + "px))";
      }
    }
  }

  function requestJourneyTick() {
    if (!journeyTicking) {
      journeyTicking = true;
      requestAnimationFrame(updateJourney);
    }
  }
  window.addEventListener("scroll", requestJourneyTick, { passive: true });
  window.addEventListener("resize", requestJourneyTick);
  updateJourney();

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Animated stat counters ---------- */
  function animateStat(el) {
    var target = parseFloat(el.getAttribute("data-target"));
    var suffix = el.getAttribute("data-suffix") || "";
    var prefix = el.getAttribute("data-prefix") || "";
    var dur = 1400, start = null;
    function frame(t) {
      if (!start) start = t;
      var k = Math.min(1, (t - start) / dur);
      var eased = 1 - Math.pow(1 - k, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (k < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var statEls = document.querySelectorAll(".stat-num");
  if ("IntersectionObserver" in window) {
    var statIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateStat(e.target);
          statIO.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });
    statEls.forEach(function (el) { statIO.observe(el); });
  } else {
    statEls.forEach(animateStat);
  }

  /* ---------- Keep background videos playing ---------- */
  document.querySelectorAll("video").forEach(function (v) {
    var tryPlay = function () {
      var pr = v.play();
      if (pr && pr.catch) pr.catch(function () { /* poster fallback covers it */ });
    };
    v.addEventListener("canplay", tryPlay, { once: true });
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden) tryPlay();
    });
  });
})();
