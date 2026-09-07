/**
 * Fixes for the exported Tilda face_page:
 * 1) FAQ accordion lives in Zero Block #rec1227326281 (t585_init was pointed at empty #rec1227326286).
 * 2) Embed link targets for LMS iframe.
 * 3) Grow FAQ artboard + white frame shape + html card when accordion expands; shrink on close.
 * 4) Close mobile burger after in-page nav clicks.
 */
(function () {
  var FAQ_PAD = 28;
  var FAQ_REC = "1227326281";
  var FAQ_FRAME_ID = "1753704801096"; // white/dark rounded card background
  var FAQ_HTML_ID = "1753709413509"; // vaccord html container

  function initFaqAccordion() {
    if (typeof window.t585_init !== "function") return false;
    var root = document.getElementById("rec" + FAQ_REC);
    if (!root) return false;
    if (root.getAttribute("data-face-faq-inited") === "1") return true;
    if (!root.querySelector(".t585__header")) return false;
    window.t585_init(FAQ_REC);
    root.setAttribute("data-face-faq-inited", "1");

    // Ensure closed panels are actually hidden (t585 leave display:block + maxHeight:0).
    root.querySelectorAll(".t585__header").forEach(function (header) {
      if (!header.classList.contains("t585__opened")) {
        var content = header.nextElementSibling;
        if (content && content.classList.contains("t585__content")) {
          content.style.display = "none";
          content.style.maxHeight = "";
          content.setAttribute("hidden", "");
        }
      }
    });
    return true;
  }

  function setupAccordHeight() {
    var root = document.getElementById("rec" + FAQ_REC);
    if (!root) return;
    var accord = root.querySelector(".vaccord");
    if (!accord || accord.getAttribute("data-face-height") === "1") return;
    var artboard = accord.closest(".t396__artboard");
    if (!artboard) return;
    accord.setAttribute("data-face-height", "1");

    var frame = root.querySelector('.tn-elem[data-elem-id="' + FAQ_FRAME_ID + '"]');
    var htmlCard = root.querySelector('.tn-elem[data-elem-id="' + FAQ_HTML_ID + '"]');

    var baseAccord = 0;
    var baseArtboard = 0;
    var baseFrame = 0;
    var baseHtml = 0;
    var baselinesReady = false;

    function captureBaselines() {
      baseAccord = Math.round(accord.getBoundingClientRect().height);
      baseArtboard = artboard.clientHeight;
      baseFrame = frame ? Math.round(frame.getBoundingClientRect().height) : 0;
      baseHtml = htmlCard ? Math.round(htmlCard.getBoundingClientRect().height) : 0;
      baselinesReady = baseAccord > 0 && baseArtboard > 0;
    }

    function setHeight(el, px) {
      if (!el) return;
      el.style.setProperty("height", px + "px", "important");
    }

    function restore() {
      setHeight(artboard, baseArtboard);
      artboard.style.removeProperty("min-height");
      if (baseFrame) setHeight(frame, baseFrame);
      if (baseHtml) setHeight(htmlCard, baseHtml);
    }

    function expand(diff) {
      setHeight(artboard, baseArtboard + diff + FAQ_PAD);
      artboard.style.setProperty(
        "min-height",
        baseArtboard + diff + FAQ_PAD + "px",
        "important",
      );
      if (baseFrame) setHeight(frame, baseFrame + diff + FAQ_PAD);
      if (baseHtml) setHeight(htmlCard, baseHtml + diff + FAQ_PAD);
    }

    function syncClosedPanels() {
      root.querySelectorAll(".t585__header").forEach(function (header) {
        var content = header.nextElementSibling;
        if (!content || !content.classList.contains("t585__content")) return;
        if (header.classList.contains("t585__opened")) {
          content.style.display = "block";
          content.removeAttribute("hidden");
        } else {
          content.style.display = "none";
          content.style.maxHeight = "";
          content.setAttribute("hidden", "");
        }
      });
    }

    function adjust() {
      if (!baselinesReady) return;
      syncClosedPanels();
      var current = Math.round(accord.getBoundingClientRect().height);
      var diff = current - baseAccord;
      if (diff < 4) {
        restore();
      } else {
        expand(diff);
      }
    }

    captureBaselines();

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(function () {
        requestAnimationFrame(adjust);
      }).observe(accord);
    }

    root.addEventListener(
      "click",
      function (event) {
        if (!event.target.closest(".t585__header, .t585__trigger-button")) return;
        setTimeout(adjust, 40);
        setTimeout(adjust, 320);
        setTimeout(adjust, 650);
      },
      true,
    );

    setTimeout(function () {
      var current = Math.round(accord.getBoundingClientRect().height);
      if (!baselinesReady || current <= baseAccord + 2) {
        captureBaselines();
      }
      adjust();
    }, 500);
  }

  function closeMobileMenu() {
    var menuRec = document.getElementById("rec1227326181");
    if (!menuRec) return;
    var menu = menuRec.querySelector(".t450");
    var overlay = menuRec.querySelector(".t450__overlay");
    if (typeof window.t450_closeMenu === "function") {
      window.t450_closeMenu(menu, overlay);
      return;
    }
    document.body.classList.remove("t450__body_menushowed");
    if (menu) menu.classList.remove("t450__menu_show");
    if (overlay) overlay.classList.remove("t450__menu_show");
  }

  function setupMenuCloseOnNav() {
    var menuRec = document.getElementById("rec1227326181");
    if (!menuRec || menuRec.getAttribute("data-face-menu-close") === "1") return;
    menuRec.setAttribute("data-face-menu-close", "1");
    menuRec.addEventListener(
      "click",
      function (event) {
        var link = event.target && event.target.closest
          ? event.target.closest("a.t-menu__link-item, a[href]")
          : null;
        if (!link) return;
        var href = link.getAttribute("href") || "";
        if (!href || href === "#") return;
        setTimeout(closeMobileMenu, 0);
        setTimeout(closeMobileMenu, 50);
      },
      true,
    );
  }

  function rememberPrivacyReturnFromEmbed(href) {
    if (href !== "/privacy" && href.indexOf("/privacy?") !== 0) return;
    try {
      var topWin = window.top || window;
      var path = topWin.location.pathname + topWin.location.search;
      if (!path || path === "/privacy" || path.indexOf("/privacy?") === 0) {
        path = "/";
      }
      sessionStorage.setItem("lms_privacy_return_to", path);
    } catch (e) {
      try {
        sessionStorage.setItem("lms_privacy_return_to", "/");
      } catch (e2) {
        /* ignore */
      }
    }
  }

  function fixLinksForEmbed() {
    if (window.self === window.top) return;
    document.querySelectorAll("a[href]").forEach(function (a) {
      if (a.getAttribute("data-face-link-fixed") === "1") return;
      var href = a.getAttribute("href") || "";
      if (!href || href.charAt(0) === "#" || href.indexOf("javascript:") === 0) {
        return;
      }
      if (a.target && a.target !== "_self") {
        if (a.target === "_parent" || a.target === "_top") {
          a.addEventListener("click", function () {
            rememberPrivacyReturnFromEmbed(href);
          });
        }
        a.setAttribute("data-face-link-fixed", "1");
        return;
      }
      if (/^https?:\/\//i.test(href) || href.indexOf("//") === 0) {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      } else if (href.charAt(0) === "/") {
        a.setAttribute("target", "_parent");
        a.addEventListener("click", function () {
          rememberPrivacyReturnFromEmbed(href);
        });
      }
      a.setAttribute("data-face-link-fixed", "1");
    });
  }

  function run() {
    fixLinksForEmbed();
    setupMenuCloseOnNav();

    var tries = 0;
    (function tick() {
      var ready = initFaqAccordion();
      if (ready) {
        setupAccordHeight();
        return;
      }
      if (++tries > 60) {
        setupAccordHeight();
        return;
      }
      setTimeout(tick, 100);
    })();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
