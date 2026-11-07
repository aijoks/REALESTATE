import { company, properties, soldProperties, notableTenants } from './data/properties.js';

document.querySelectorAll('[data-company]').forEach((el) => (el.textContent = company.name));
document.querySelectorAll('[data-phone]').forEach((el) => (el.textContent = company.phone));
document.querySelectorAll('[data-email]').forEach((el) => (el.textContent = company.email));

// Notable-tenant logo band: the list is rendered twice so the CSS animation
// can slide by exactly one set and loop seamlessly.
const track = document.querySelector('[data-tenant-track]');
if (track) {
  // Phones get pre-whitened logos (no CSS filter), which iOS Safari paints
  // reliably inside the moving strip.
  const phone = matchMedia('(max-width: 600px)').matches;
  const src = (t) => (phone ? t.logo.replace('assets/tenants/', 'assets/tenants/white/') : t.logo);
  const set = notableTenants.map((t) => `<img src="${src(t)}" alt="${t.name}" title="${t.name}"${t.size ? ` style="--s:${t.size}"` : ''} />`).join('');
  track.innerHTML = `<div class="tenant-set">${set}</div><div class="tenant-set" aria-hidden="true">${set}</div>`;
  // On a first visit iOS Safari can start the sliding strip before the logo
  // files arrive and then never repaint it. On phones the strip only starts
  // once every logo has loaded and decoded (it is shown again on a return
  // visit because the files are cached by then).
  if (phone) {
    const imgs = [...track.querySelectorAll('img')];
    const loaded = (img) => (img.complete && img.naturalWidth ? Promise.resolve()
      : new Promise((ok) => { img.addEventListener('load', ok, { once: true }); img.addEventListener('error', ok, { once: true }); }));
    const ready = (img) => loaded(img).then(() => (img.decode ? img.decode() : null)).catch(() => {});
    const start = () => requestAnimationFrame(() => track.classList.add('go'));
    Promise.all(imgs.map(ready)).then(start);
    setTimeout(start, 4000); // never leave the belt empty if a logo fails
  }
}

// Header height for phone layouts that size the hero to the screen.
const hdr = document.querySelector('.site-header');
const setHdr = () => hdr && document.documentElement.style.setProperty('--hdr', `${hdr.offsetHeight}px`);
setHdr(); addEventListener('resize', setHdr);

// Phones: how much of the full screen height Safari's bars cover right now.
// The home hero keeps its headline and logo belt above that, and drops them
// to the very bottom when the bars shrink while scrolling.
if (document.body.classList.contains('home') && matchMedia('(max-width: 600px)').matches) {
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100lvh;visibility:hidden;pointer-events:none';
  document.body.appendChild(probe);
  const setBar = () => {
    const visible = window.visualViewport ? visualViewport.height : innerHeight;
    const bar = Math.max(0, Math.round(probe.offsetHeight - visible));
    document.documentElement.style.setProperty('--bar-js', `${bar}px`);
    // Once the page is scrolled (Safari's bar shrinks), seat the belt on the
    // very bottom edge; on first load it keeps its original position.
    if (first === null) first = bar;
    document.documentElement.classList.toggle('bar-small', scrollY > 2 || bar < first - 20);
  };
  let first = null;
  setBar();
  addEventListener('resize', setBar);
  addEventListener('scroll', setBar, { passive: true });
  window.visualViewport?.addEventListener('resize', setBar);
}

const grid = document.querySelector('[data-grid]');

// Portfolio tile: full-bleed photo with the street address along the bottom.
function card(p) {
  const a = document.createElement('a');
  a.className = 'tile reveal';
  a.href = `property.html#${encodeURIComponent(p.id)}`;
  const ph = p.photos.find((x) => x.src === p.cover) ?? p.photos[0];
  a.innerHTML = `
    <img src="${ph.src}" alt="${p.address}" ${ph.focus ? `style="object-position:${ph.focus}"` : ''} loading="lazy" />
    <span class="tile-label">${p.address}</span>`;
  return a;
}

// Sold tile: same layout, greyed out, not a link.
function soldCard(p) {
  const d = document.createElement('div');
  d.className = 'tile tile-sold reveal';
  d.setAttribute('aria-label', `${p.address} (sold)`);
  d.innerHTML = `
    <img src="${p.photo}" alt="${p.address}" loading="lazy" />
    <span class="tile-label">${p.address}<small class="tile-sold-tag">Sold</small></span>`;
  return d;
}

function render(use = 'all') {
  grid.innerHTML = '';
  const match = (p) => use === 'all' || p.uses.includes(use);
  properties.filter(match).forEach((p) => grid.appendChild(card(p)));
  soldProperties.filter(match).forEach((p) => grid.appendChild(soldCard(p)));
  observeReveals();
}

document.querySelector('[data-filters]')?.addEventListener('click', (e) => {
  const b = e.target.closest('button[data-use]');
  if (!b) return;
  document.querySelectorAll('[data-filters] button').forEach((x) => x.classList.toggle('active', x === b));
  render(b.dataset.use);
});

function observeReveals() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
}

if (grid) render();
else observeReveals();
