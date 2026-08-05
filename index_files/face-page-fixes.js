/**
 * Fixes for the exported Tilda face_page:
 * 1) FAQ accordion lives inside Zero Block (.vaccord / #rec1227326281),
 *    but t585_init was still pointed at the emptied #rec1227326286.
 * 2) When embedded in the LMS iframe, external links need _blank/_parent
 *    (Telegram/Notion refuse framing).
 * 3) Grow the FAQ artboard when items expand (overflow:hidden otherwise clips).
 */
(function () {
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
    var accord = document.querySelector(".vaccord");
    if (!accord || accord.getAttribute("data-face-height") === "1") return;
    var artboard = accord.closest(".t396__artboard");
    if (!artboard) return;
    accord.setAttribute("data-face-height", "1");

    var initialAccordHeight = accord.getBoundingClientRect().height;
    var initialArtboardHeight = artboard.clientHeight;

    function adjust() {
      var current = accord.getBoundingClientRect().height;
      var diff = current - initialAccordHeight;
      artboard.style.setProperty(
        "height",
        initialArtboardHeight + diff + "px",
        "important",
      );
    }

    if (typeof ResizeObserver !== "undefined") {
      new ResizeObserver(function () {
        requestAnimationFrame(adjust);
      }).observe(accord);
    }

    accord.addEventListener("click", function () {
      setTimeout(adjust, 50);
      setTimeout(adjust, 350);
    });
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
    setupAccordHeight();

    var tries = 0;
    (function tick() {
      if (initFaqAccordion() || ++tries > 60) return;
      setTimeout(tick, 100);
    })();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
