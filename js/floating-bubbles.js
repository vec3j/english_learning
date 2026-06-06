/*
 * FLOATING BUBBLES — English phrase bubbles drifting across the screen
 * Depends on: getAllPatterns() from data.js
 * Self-initializing. Chinese hidden by default, double-click to reveal.
 */

var FloatingBubbles = (function () {
  "use strict";

  var MAX_BUBBLES = 7;
  var SPAWN_INTERVAL = 3500; // ms between spawn attempts
  var spawnTimer = null;
  var layer = null;
  var phrases = [];
  var bubbleCount = 0;
  var paused = false;

  /* ===== Collect phrases from the pattern database ===== */
  function collectPhrases() {
    var patterns = [];
    try {
      patterns = getAllPatterns();
    } catch (e) {
      patterns = typeof PATTERNS !== "undefined" ? PATTERNS : [];
    }
    var result = [];
    for (var i = 0; i < patterns.length; i++) {
      var exs = patterns[i].examples || [];
      for (var j = 0; j < exs.length; j++) {
        var en = (exs[j].en || "").trim();
        var zh = (exs[j].zh || "").trim();
        // Only short-to-medium phrases work as bubbles
        if (en && en.length < 100) {
          result.push({ en: en, zh: zh });
        }
      }
    }
    return result;
  }

  function randomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /* ===== Spawn a single bubble ===== */
  function spawnBubble() {
    if (paused) return;
    if (bubbleCount >= MAX_BUBBLES) return;
    if (phrases.length === 0) return;

    var phrase = randomItem(phrases);
    var el = document.createElement("div");
    el.className = "floating-bubble";

    // English text
    var enSpan = document.createElement("span");
    enSpan.className = "bubble-en";
    enSpan.textContent = phrase.en;
    el.appendChild(enSpan);

    // Chinese text (hidden by default, same rule as cards)
    if (phrase.zh) {
      var zhSpan = document.createElement("span");
      zhSpan.className = "bubble-zh";
      zhSpan.textContent = phrase.zh;
      el.appendChild(zhSpan);
    }

    // Double-click to toggle Chinese visibility
    el.addEventListener("dblclick", function (e) {
      e.stopPropagation();
      el.classList.toggle("zh-visible");
    });

    // --- Compute random drift parameters ---
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    // Start from a random edge
    var side = Math.floor(Math.random() * 4);
    var startX, startY, driftX, driftY;
    var duration = 22 + Math.random() * 22; // 22-44 seconds

    switch (side) {
      case 0: // bottom → top
        startX = 20 + Math.random() * (vw - 200);
        startY = vh + 20;
        driftX = (Math.random() - 0.5) * 300;
        driftY = -(vh + 140 + Math.random() * 100);
        break;
      case 1: // left → right (with slight rise)
        startX = -20;
        startY = 60 + Math.random() * (vh - 200);
        driftX = vw + 160 + Math.random() * 100;
        driftY = (Math.random() - 0.6) * 200;
        break;
      case 2: // right → left (with slight rise)
        startX = vw + 20;
        startY = 60 + Math.random() * (vh - 200);
        driftX = -(vw + 160 + Math.random() * 100);
        driftY = (Math.random() - 0.6) * 200;
        break;
      default: // random lower area → upward
        startX = 20 + Math.random() * (vw - 200);
        startY = vh * 0.4 + Math.random() * vh * 0.6;
        driftX = (Math.random() - 0.5) * 400;
        driftY = -(vh + 60 + Math.random() * 200);
        break;
    }

    var rotation = (Math.random() - 0.5) * 25; // ±12.5 degrees

    // Apply as CSS custom properties for the keyframe animation
    el.style.setProperty("--drift-x", driftX + "px");
    el.style.setProperty("--drift-y", driftY + "px");
    el.style.setProperty("--drift-rotate", rotation + "deg");
    el.style.setProperty("--drift-dur", duration + "s");
    el.style.left = startX + "px";
    el.style.top = startY + "px";

    layer.appendChild(el);
    bubbleCount++;

    // Clean up when animation finishes
    el.addEventListener("animationend", function () {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
        bubbleCount--;
      }
    });

    // Pause animation on hover so user can read
    el.addEventListener("mouseenter", function () {
      el.style.animationPlayState = "paused";
    });
    el.addEventListener("mouseleave", function () {
      el.style.animationPlayState = "running";
    });
  }

  /* ===== Start / Stop ===== */
  function start() {
    phrases = collectPhrases();
    if (phrases.length === 0) return;

    layer = document.getElementById("bubbles-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.id = "bubbles-layer";
      document.body.appendChild(layer);
    }
    bubbleCount = 0;
    paused = false;

    // Spawn initial batch with staggered delays
    var initial = Math.min(3, phrases.length);
    for (var i = 0; i < initial; i++) {
      (function (delay) {
        setTimeout(function () {
          spawnBubble();
        }, delay);
      })(i * 700);
    }

    // Keep spawning periodically
    spawnTimer = setInterval(function () {
      if (!paused && bubbleCount < MAX_BUBBLES) {
        spawnBubble();
      }
    }, SPAWN_INTERVAL);
  }

  function stop() {
    paused = true;
    if (spawnTimer) {
      clearInterval(spawnTimer);
      spawnTimer = null;
    }
    if (layer) {
      layer.innerHTML = "";
      bubbleCount = 0;
    }
  }

  /* ===== Self-init when DOM is ready ===== */
  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", start);
    } else {
      start();
    }
  }

  return {
    start: start,
    stop: stop,
    init: init,
  };
})();

FloatingBubbles.init();
