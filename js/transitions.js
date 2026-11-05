// Page-to-page slide: the current page slides out to the left while the
// clicked page slides in from the right (reversed for Back).
//
// Browsers with cross-document View Transitions (Chrome/Edge 126+, Safari
// 18.2+) do this natively from the CSS in styles.css; this script only adds
// the "back" direction there. Other browsers get a script fallback: slide the
// page out, navigate, then slide the new page in.
(function () {
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var native = 'PageRevealEvent' in window;
  var root = document.documentElement;

  if (native) {
    // Going back through history slides the other way.
    window.addEventListener('pagereveal', function (e) {
      if (!e.viewTransition || !window.navigation || !navigation.activation) return;
      var a = navigation.activation;
      if (a.navigationType === 'traverse' && a.from && a.entry && a.entry.index < a.from.index) {
        e.viewTransition.types.add('back');
      }
    });
    return;
  }
  if (reduce) return;

  // Fallback: incoming page slides in from the right.
  var dir = null;
  try { dir = sessionStorage.getItem('fp-slide'); sessionStorage.removeItem('fp-slide'); } catch (err) {}
  if (dir) {
    root.classList.add(dir === 'back' ? 'fp-enter-back' : 'fp-enter');
    setTimeout(function () { root.classList.remove('fp-enter', 'fp-enter-back'); }, 700);
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // same page / anchor
    e.preventDefault();
    try { sessionStorage.setItem('fp-slide', 'forward'); } catch (err) {}
    root.classList.add('fp-leave');
    setTimeout(function () { location.href = url.href; }, 380);
  });

  // Coming back from the back/forward cache: undo the leaving state.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) root.classList.remove('fp-leave', 'fp-enter', 'fp-enter-back');
  });
})();
