// Phone menu: the hamburger opens the full menu (Home · Portfolio · Services ·
// About Us · Contact Us) below the header. Closes on a link, Esc, or a tap
// outside it.
(function () {
  var header = document.querySelector('.site-header');
  var btn = header && header.querySelector('.nav-toggle');
  if (!btn) return;
  function set(open) {
    header.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  btn.addEventListener('click', function () { set(!header.classList.contains('open')); });
  header.querySelectorAll('.main-nav a').forEach(function (a) { a.addEventListener('click', function () { set(false); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') set(false); });
  document.addEventListener('click', function (e) { if (!header.contains(e.target)) set(false); });
  window.addEventListener('pageshow', function () { set(false); });
})();
