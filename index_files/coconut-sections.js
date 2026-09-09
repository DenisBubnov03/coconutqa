/* Lower-page interactions. Does not modify the approved hero or its effects. */
(function () {
  'use strict';
  var root = document.querySelector('.cr-page');
  if (!root) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window) {
    var reveal = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (!reduced.matches) entry.target.classList.add('cr-in');
        reveal.unobserve(entry.target);
      });
    }, { threshold: 0.06 });
    root.querySelectorAll('[data-cr-reveal]').forEach(function (el) { reveal.observe(el); });
  }
  var gallery = root.querySelector('.cr-reviews');
  root.querySelectorAll('[data-cr-slide]').forEach(function (button) {
    button.addEventListener('click', function () {
      var card = gallery.querySelector('.cr-review-image');
      var distance = card ? card.getBoundingClientRect().width + 18 : gallery.clientWidth;
      gallery.scrollBy({ left: Number(button.dataset.crSlide) * distance, behavior: reduced.matches ? 'instant' : 'smooth' });
    });
  });
  var payment = root.querySelector('#cr-payment');
  var imageDialog = root.querySelector('#cr-image');
  var opener = null;
  function open(dialog, trigger) {
    opener = trigger;
    dialog.showModal();
    dialog.querySelector('[data-cr-close]').focus();
  }
  root.querySelectorAll('[data-cr-bank]').forEach(function (button) {
    button.addEventListener('click', function () {
      root.querySelector('#cr-payment-plan').textContent = button.dataset.crPlan;
      root.querySelector('#cr-bank-link').href = button.dataset.crBank;
      open(payment, button);
    });
  });
  root.querySelectorAll('[data-cr-image]').forEach(function (link) {
    link.addEventListener('click', function (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      var image = imageDialog.querySelector('img');
      image.src = link.href;
      image.alt = link.getAttribute('aria-label') || link.textContent.trim();
      root.querySelector('#cr-image-original').href = link.href;
      open(imageDialog, link);
    });
  });
  // Tilda also listens for Escape globally. Close our native dialogs first.
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    var active = root.querySelector('dialog[open]');
    if (!active) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    active.close();
  }, true);
  root.querySelectorAll('dialog').forEach(function (dialog) {
    dialog.querySelector('[data-cr-close]').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (event) {
      var box = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom)) dialog.close();
    });
    dialog.addEventListener('close', function () {
      if (dialog === imageDialog) dialog.querySelector('img').removeAttribute('src');
      if (opener) opener.focus({ preventScroll: true });
    });
  });
})();
