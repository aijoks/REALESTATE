import { company, properties, notableTenants } from './data/properties.js';

document.querySelectorAll('[data-company]').forEach((el) => (el.textContent = company.name));
document.querySelectorAll('[data-phone]').forEach((el) => (el.textContent = company.phone));
document.querySelectorAll('[data-email]').forEach((el) => (el.textContent = company.email));

// Notable-tenant logo band: the list is rendered twice so the CSS animation
// can slide by exactly one set and loop seamlessly.
const track = document.querySelector('[data-tenant-track]');
if (track) {
  const set = notableTenants.map((t) => `<img src="${t.logo}" alt="${t.name}" title="${t.name}"${t.size ? ` style="--s:${t.size}"` : ''} />`).join('');
  track.innerHTML = `<div class="tenant-set">${set}</div><div class="tenant-set" aria-hidden="true">${set}</div>`;
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

function render(use = 'all') {
  grid.innerHTML = '';
  properties
    .filter((p) => use === 'all' || p.uses.includes(use))
    .forEach((p) => grid.appendChild(card(p)));
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
