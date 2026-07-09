/* ==========================================================================
   Creator Toolkit — Shared Inner-Page Nav (V2)
   Handles the settings bottom sheet on every non-home page.
   Bottom-nav Home/AI Tools/Favorites are plain links on inner pages,
   so no tab-switch JS is needed here — only the settings sheet.
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    var overlay = document.getElementById("sheetOverlay");
    var sheet = document.getElementById("settingsSheet");
    if (!overlay || !sheet) return;

    var openBtns = [
      document.getElementById("avatarBtn"),
      document.querySelector('.nav-item[data-tab="settings"]')
    ];

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
  });
})();
