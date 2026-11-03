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

function card(p) {
  const a = document.createElement('a');
  a.className = 'card reveal';
  a.href = `property.html#${encodeURIComponent(p.id)}`;
  a.innerHTML = `
    <div class="media" data-carousel>
      <div class="slides">
        ${p.photos.map((ph, i) => `<img src="${ph.src}" alt="${ph.caption}" ${ph.focus ? `style="object-position:${ph.focus}"` : ''} ${i ? 'loading="lazy"' : ''} />`).join('')}
      </div>
      ${p.photos.length > 1 ? `
      <button class="nav prev" type="button" aria-label="Previous photo">‹</button>
      <button class="nav next" type="button" aria-label="Next photo">›</button>
      <div class="dots">${p.photos.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}
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

// Photo carousel inside each card: arrows flick through the property's
// photos without following the card's link.
function initCarousel(media) {
  const slides = media.querySelector('.slides');
  const dots = [...media.querySelectorAll('.dots i')];
  const n = slides.children.length;
  let i = 0;
  const show = (k) => {
    i = (k + n) % n;
    slides.style.transform = `translateX(${-i * 100}%)`;
    dots.forEach((d, j) => d.classList.toggle('on', j === i));
  };
  media.querySelectorAll('.nav').forEach((b) => b.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    show(i + (b.classList.contains('next') ? 1 : -1));
  }));
}

function render(use = 'all') {
  grid.innerHTML = '';
  properties
    .filter((p) => use === 'all' || p.uses.includes(use))
    .forEach((p) => {
      const c = card(p);
      grid.appendChild(c);
      const media = c.querySelector('[data-carousel]');
      if (media.querySelector('.nav')) initCarousel(media);
    });
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
