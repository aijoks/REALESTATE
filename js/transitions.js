// Page-to-page slide in the direction of the menu: pages further right in the
// menu (Home · Portfolio · Services · About Us) slide in from the right, pages
// to the left slide in from the left. The current page slides out the other
// way. Property pages sit just after Portfolio.
//
// Browsers with cross-document View Transitions (Chrome/Edge 126+, Safari
// 18.2+) animate natively from the CSS in styles.css; this script picks the
// direction. Other browsers get a script fallback with the same directions.
(function () {
  var ORDER = { '': 0, 'index.html': 0, 'portfolio.html': 1, 'property.html': 1.5, 'services.html': 2, 'about.html': 3 };
  function rank(href) {
    try {
      var p = new URL(href, location.href).pathname.split('/').pop();
      return p in ORDER ? ORDER[p] : null;
    } catch (e) { return null; }
  }
  // 'back' = the new page is to the left of the old one.
  function direction(fromHref, toHref) {
    var a = rank(fromHref), b = rank(toHref);
    return a !== null && b !== null && b < a ? 'back' : 'forward';
  }

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;

  if ('PageRevealEvent' in window) {
    window.addEventListener('pagereveal', function (e) {
      if (!e.viewTransition) return;
      var act = window.navigation && navigation.activation;
      var from = act && act.from && act.from.url;
      if (!from) return;
      if (direction(from, location.href) === 'back') e.viewTransition.types.add('back');
    });
    return;
  }
  if (reduce) return;

  // Fallback: incoming page slides in from the stored direction.
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
    var d = direction(location.href, url.href);
    try { sessionStorage.setItem('fp-slide', d); } catch (err) {}
    root.classList.add(d === 'back' ? 'fp-leave-back' : 'fp-leave');
    setTimeout(function () { location.href = url.href; }, 380);
  });

  // Coming back from the back/forward cache: undo the leaving state.
  window.addEventListener('pageshow', function (e) {
    if (e.persisted) root.classList.remove('fp-leave', 'fp-leave-back', 'fp-enter', 'fp-enter-back');
  });
})();
