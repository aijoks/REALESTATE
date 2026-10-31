import { company, properties } from './data/properties.js';

document.querySelectorAll('[data-company]').forEach((el) => (el.textContent = company.name));
document.querySelectorAll('[data-phone]').forEach((el) => (el.textContent = company.phone));
document.querySelectorAll('[data-email]').forEach((el) => (el.textContent = company.email));

const grid = document.querySelector('[data-grid]');

function card(p) {
  const a = document.createElement('a');
  a.className = 'card reveal';
  a.href = `property.html?id=${encodeURIComponent(p.id)}`;
  a.innerHTML = `
    <div class="media">
      <img src="${p.cover}" alt="${p.address}" loading="lazy" />
      <span class="badge">${p.status}</span>
      <span class="badge tour">360° 3D tour</span>
    </div>
    <div class="body">
      <h3>${p.address}</h3>
      <div class="sub">${p.neighborhood} · ${p.crossStreets}</div>
      <div class="chips">${p.uses.map((u) => `<span class="chip">${u}</span>`).join('')}</div>
      <div class="stats">
        ${p.stats.slice(0, 3).map((s) => `<div><b>${s.value}</b>${s.label}</div>`).join('')}
      </div>
    </div>`;
  return a;
}

function render(use = 'all') {
  grid.innerHTML = '';
  properties
    .filter((p) => use === 'all' || p.uses.includes(use))
    .forEach((p) => grid.appendChild(card(p)));
  observeReveals();
}

document.querySelector('[data-filters]').addEventListener('click', (e) => {
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

render();
