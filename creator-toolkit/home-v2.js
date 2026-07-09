/* ==========================================================================
   Creator Toolkit — Home Dashboard V2 interactions
   Pure vanilla JS. No business logic touched — this only affects the
   home dashboard's presentation layer (search filter, favorites,
   "continue working" memory, tips, and the bottom sheet).
   ========================================================================== */

const creatorQuotes = [
"🚀 Let's build something legendary today!",
"💥 Ready to create your next viral masterpiece?",
"🎯 Every upload brings you closer to success.",
"🔥 Great creators don't wait. They create.",
"✨ Today is another chance to grow your audience.",
"📈 Make today count.",
"🎬 One video can change everything.",
"⚡ Consistency beats talent every time.",
"🌟 Let's make the algorithm notice you.",
"💡 Create. Publish. Repeat.",
"🚀 Let's blast today!",
"🔥 Time to dominate YouTube!",
"💪 Ready to break your own records?",
"🎯 Let's make something impossible today.",
"🌍 Your next viral video starts now.",
"📹 Don't scroll. Create.",
"💥 Hit publish and shock the algorithm.",
"🍳 Let's cook some viral content!",
"👀 The internet is waiting for your idea.",
"🚀 Today's the day your channel grows."
];
(function () {
  "use strict";

  var LS_LAST_TOOL = "ct_last_tool";
  var LS_FAVORITES = "ct_favorites";

  var TIPS = [
    "Titles under 60 characters usually perform better.",
    "The first 3 words of your title matter most on mobile.",
    "Use 3-5 hashtags — too many can look like spam.",
    "Descriptions with your main keyword in the first line rank better.",
    "Custom thumbnails get up to 30% more clicks than auto-generated ones.",
    "Hooks that ask a question keep viewers watching longer."
  ];

  document.addEventListener("DOMContentLoaded", function () {
    setGreeting();
    setRandomTip();
    initSearch();
    initFavorites();
    initContinueCard();
    initToolClickTracking();
    initCategoryFilter();
    initFaq();
    initBottomSheet();
    initBottomNav();
  });

 function setGreeting() {
    var el = document.getElementById("greetingText");
    if (!el) return;

    var hour = new Date().getHours();
    var greeting = "";

    if (hour >= 5 && hour < 12) {
        greeting = "🌅 Good Morning!";
    } else if (hour >= 12 && hour < 17) {
        greeting = "☀️ Good Afternoon!";
    } else if (hour >= 17 && hour < 21) {
        greeting = "🌇 Good Evening!";
    } else {
        greeting = "🌙 Still Creating?";
    }

    var quote =
        creatorQuotes[Math.floor(Math.random() * creatorQuotes.length)];

    el.innerHTML = `
        ${greeting}<br>
        <span style="font-size:18px;font-weight:500;opacity:.9">
            ${quote}
        </span>
    `;
}

  function setRandomTip() {
    var el = document.getElementById("tipText");
    if (!el) return;
    el.textContent = TIPS[Math.floor(Math.random() * TIPS.length)];
  }

  function initSearch() {
    var input = document.getElementById("toolSearch");
    var cards = document.querySelectorAll(".tool-card-v2");
    var grid = document.getElementById("toolsGrid");
    var empty = document.getElementById("toolsEmpty");
    if (!input || !cards.length) return;

    input.addEventListener("input", function () {
      var q = input.value.trim().toLowerCase();
      var visibleCount = 0;
      cards.forEach(function (card) {
        var name = (card.getAttribute("data-name") || "").toLowerCase();
        var match = name.indexOf(q) !== -1;
        card.classList.toggle("is-hidden", !match);
        if (match) visibleCount++;
      });
      if (empty) empty.style.display = visibleCount === 0 ? "block" : "none";
    });
  }

  function initCategoryFilter() {
    var chips = document.querySelectorAll(".category-card");
    var input = document.getElementById("toolSearch");
    var toolsSection = document.getElementById("toolsGrid");
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var cat = chip.getAttribute("data-filter") || "";
        if (input) {
          input.value = cat;
          input.dispatchEvent(new Event("input"));
        }
        if (toolsSection) {
          toolsSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  function initFavorites() {
    var favs = readFavorites();
    document.querySelectorAll(".fav-btn").forEach(function (btn) {
      var id = btn.getAttribute("data-tool-id");
      if (favs.indexOf(id) !== -1) btn.classList.add("is-fav");

      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var list = readFavorites();
        var idx = list.indexOf(id);
        if (idx === -1) {
          list.push(id);
          btn.classList.add("is-fav");
        } else {
          list.splice(idx, 1);
          btn.classList.remove("is-fav");
        }
        writeFavorites(list);
      });
    });
  }

  function readFavorites() {
    try {
      return JSON.parse(localStorage.getItem(LS_FAVORITES) || "[]");
    } catch (e) {
      return [];
    }
  }
  function writeFavorites(list) {
    try {
      localStorage.setItem(LS_FAVORITES, JSON.stringify(list));
    } catch (e) {}
  }

  function initToolClickTracking() {
    document.querySelectorAll("[data-tool-id]").forEach(function (el) {
      if (el.classList.contains("fav-btn")) return;
      el.addEventListener("click", function () {
        var id = el.getAttribute("data-tool-id");
        var name = el.getAttribute("data-tool-title") || "";
        var href = el.getAttribute("href") || "";
        if (!id) return;
        try {
          localStorage.setItem(
            LS_LAST_TOOL,
            JSON.stringify({ id: id, name: name, href: href, t: Date.now() })
          );
        } catch (e) {}
      });
    });
  }

  function initContinueCard() {
    var section = document.getElementById("continueSection");
    var titleEl = document.getElementById("continueTool");
    var link = document.getElementById("continueCard");
    if (!section || !titleEl || !link) return;

    var raw;
    try {
      raw = JSON.parse(localStorage.getItem(LS_LAST_TOOL) || "null");
    } catch (e) {
      raw = null;
    }

    if (raw && raw.href && raw.name) {
      titleEl.textContent = raw.name;
      link.setAttribute("href", raw.href);
      section.hidden = false;
    } else {
      section.hidden = true;
    }
  }

  function initFaq() {
    document.querySelectorAll(".faq-item-v2").forEach(function (item) {
      var q = item.querySelector(".faq-q");
      if (!q) return;
      q.addEventListener("click", function () {
        var wasOpen = item.classList.contains("open");
        document
          .querySelectorAll(".faq-item-v2.open")
          .forEach(function (o) {
            o.classList.remove("open");
          });
        if (!wasOpen) item.classList.add("open");
      });
    });
  }

  function initBottomSheet() {
    var overlay = document.getElementById("sheetOverlay");
    var sheet = document.getElementById("settingsSheet");
    var openBtns = [
      document.getElementById("avatarBtn"),
      document.querySelector('.nav-item[data-tab="settings"]')
    ];
    if (!overlay || !sheet) return;

    function open() {
      overlay.classList.add("visible");
      sheet.classList.add("visible");
    }
    function close() {
      overlay.classList.remove("visible");
      sheet.classList.remove("visible");
    }

    openBtns.forEach(function (btn) {
      if (btn) btn.addEventListener("click", open);
    });
    overlay.addEventListener("click", close);

    var notifBtn = document.getElementById("notifBtn");
    if (notifBtn) {
      notifBtn.addEventListener("click", function () {
        setRandomTip();
        var tipCard = document.querySelector(".tip-card");
        if (tipCard) {
          tipCard.scrollIntoView({ behavior: "smooth", block: "center" });
          tipCard.style.borderColor = "rgba(0,212,255,0.6)";
          setTimeout(function () {
            tipCard.style.borderColor = "";
          }, 900);
        }
      });
    }
  }

  function initBottomNav() {
    var items = document.querySelectorAll(".nav-item");
    items.forEach(function (item) {
      item.addEventListener("click", function () {
        var tab = item.getAttribute("data-tab");
        if (tab === "settings") return; // handled by bottom sheet
        items.forEach(function (i) {
          i.classList.remove("active");
        });
        item.classList.add("active");

        if (tab === "home") {
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else if (tab === "tools") {
          var grid = document.getElementById("toolsGrid");
          if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (tab === "favorites") {
          showFavoritesOnly();
        }
      });
    });
  }

  function showFavoritesOnly() {
    var favs = readFavorites();
    var cards = document.querySelectorAll(".tool-card-v2");
    var empty = document.getElementById("toolsEmpty");
    var grid = document.getElementById("toolsGrid");
    var visible = 0;
    cards.forEach(function (card) {
      var id = card.getAttribute("data-tool-id");
      var match = favs.indexOf(id) !== -1;
      card.classList.toggle("is-hidden", !match);
      if (match) visible++;
    });
    if (empty) {
      empty.style.display = visible === 0 ? "block" : "none";
      empty.querySelector(".empty-text") &&
        (empty.querySelector(".empty-text").textContent =
          "No favorites yet — tap the heart on any tool to save it here.");
    }
    if (grid) grid.scrollIntoView({ behavior: "smooth", block: "start" });
  }
})();
const greeting = document.getElementById("greetingText");

if (greeting) {

    const randomQuote =
        creatorQuotes[Math.floor(Math.random() * creatorQuotes.length)];

    greeting.textContent = randomQuote;

}
