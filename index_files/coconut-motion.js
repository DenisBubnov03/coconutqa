/* Progressive enhancement: content and links remain usable without JavaScript. */
(function () {
  'use strict';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  var visual = document.querySelector('.cq-visual');
  if (visual) {
    visual.addEventListener('pointermove', function (event) {
      if (reduced.matches || !fine.matches) return;
      var box = visual.getBoundingClientRect();
      var x = (event.clientX - box.left) / box.width - 0.5;
      var y = (event.clientY - box.top) / box.height - 0.5;
      visual.style.setProperty('--cq-x', (x * 5) + 'deg');
      visual.style.setProperty('--cq-y', (-y * 4) + 'deg');
      visual.style.setProperty('--cq-mx', (x * 15) + 'px');
      visual.style.setProperty('--cq-my', (y * 12) + 'px');
    });
    visual.addEventListener('pointerleave', function () {
      ['--cq-x', '--cq-y', '--cq-mx', '--cq-my'].forEach(function (key) { visual.style.removeProperty(key); });
    });
  }
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        if (!reduced.matches) entry.target.classList.add('cq-reveal');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('#allrecords > .r[data-record-type="396"]').forEach(function (section) {
      // Popup content and positioning wrappers are never transformed.
      if (section.id !== 'rec1227326171') observer.observe(section);
    });
  }
  var progress = document.createElement('div');
  progress.className = 'cq-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);
  var queued = false;
  function updateProgress() {
    var distance = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0) + ')';
    queued = false;
  }
  window.addEventListener('scroll', function () {
    if (!queued) { queued = true; window.requestAnimationFrame(updateProgress); }
  }, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();
})();
