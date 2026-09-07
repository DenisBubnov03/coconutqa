/**
 * Fixes for the exported Tilda face_page:
 * 1) FAQ accordion lives inside Zero Block (.vaccord / #rec1227326281),
 *    but t585_init was still pointed at the emptied #rec1227326286.
 * 2) When embedded in the LMS iframe, external links need _blank/_parent
 *    (Telegram/Notion refuse framing).
 * 3) Grow the FAQ artboard + white card when items expand (overflow:hidden otherwise clips).
 * 4) Close mobile burger after in-page nav clicks.
 */
(function () {
  var FAQ_PAD = 24;

  function initFaqAccordion() {
    if (typeof window.t585_init !== "function") return false;
    var root = document.getElementById("rec1227326281");
    if (!root) return false;
    if (root.getAttribute("data-face-faq-inited") === "1") return true;
    if (!root.querySelector(".t585__header")) return false;
    window.t585_init("1227326281");
    root.setAttribute("data-face-faq-inited", "1");
    return true;
  }

  function setupAccordHeight() {
    var accord = document.querySelector("#rec1227326281 .vaccord, .vaccord");
    if (!accord || accord.getAttribute("data-face-height") === "1") return;
    var artboard = accord.closest(".t396__artboard");
    if (!artboard) return;
    accord.setAttribute("data-face-height", "1");

    var whiteCard = document.querySelector(
      '#rec1227326281 .tn-elem[data-elem-id="1753709413509"]',
    );
    var whiteAtom = whiteCard ? whiteCard.querySelector(".tn-atom") : null;

    var initialAccordHeight = accord.getBoundingClientRect().height;
    var initialArtboardHeight = artboard.clientHeight;
    var initialCardHeight = whiteCard
      ? whiteCard.getBoundingClientRect().height
      : 0;

    function adjust() {
      var current = accord.getBoundingClientRect().height;
      var diff = Math.max(0, current - initialAccordHeight);
      var nextArtboard = initialArtboardHeight + diff + FAQ_PAD;
      artboard.style.setProperty("height", nextArtboard + "px", "important");
      artboard.style.setProperty("min-height", nextArtboard + "px", "important");

      if (whiteCard && initialCardHeight) {
        var nextCard = initialCardHeight + diff + FAQ_PAD;
        whiteCard.style.setProperty("height", nextCard + "px", "important");
        if (whiteAtom) {
          whiteAtom.style.setProperty("height", "100%", "important");
        }
      }
    }

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(function () {
        requestAnimationFrame(adjust);
      }).observe(accord);
    }

    accord.addEventListener("click", function () {
      setTimeout(adjust, 50);
      setTimeout(adjust, 350);
      setTimeout(adjust, 700);
    });

    // Recapture baselines after accordion widgets finish opening/layout.
    setTimeout(function () {
      initialAccordHeight = accord.getBoundingClientRect().height;
      initialArtboardHeight = artboard.clientHeight;
      if (whiteCard) {
        initialCardHeight = whiteCard.getBoundingClientRect().height;
      }
      adjust();
    }, 400);
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
