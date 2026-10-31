import { company, getProperty, properties } from './data/properties.js';
import { BuildingViewer } from './viewer/viewer.js';

const id = new URLSearchParams(location.search).get('id') || properties[0].id;
const p = getProperty(id);
if (!p) location.replace('index.html');

document.title = `${p.address} — ${company.name}`;
const fill = (sel, v) => document.querySelectorAll(sel).forEach((el) => (el.textContent = v));
fill('[data-company]', company.name);
fill('[data-phone]', company.phone);
fill('[data-address]', p.address);
fill('[data-location]', `${p.city} · ${p.neighborhood} · ${p.crossStreets}`);
fill('[data-status]', p.status);
fill('[data-headline]', p.headline);
fill('[data-description]', p.description);

document.querySelector('[data-stats]').innerHTML = p.stats
  .map((s) => `<div class="stat"><small>${s.label}</small><b>${s.value}</b></div>`).join('');
document.querySelector('[data-highlights]').innerHTML = p.highlights.map((h) => `<li>${h}</li>`).join('');
document.querySelector('[data-tenants]').innerHTML = p.tenants
  .map((t) => `<div class="tenant"><b>${t.name}</b><span>${t.floor} · ${t.kind}</span></div>`).join('');
document.querySelector('[data-gallery]').innerHTML = p.photos
  .map((ph) => `<figure><img src="${ph.src}" alt="${ph.caption}" /><figcaption>${ph.caption}</figcaption></figure>`).join('');

const tbody = document.querySelector('[data-availability]');
tbody.innerHTML = p.availability
  .map((a) => `<tr data-floor="${a.floor}"><td>${a.floor}</td><td>${a.suite}</td><td>${a.sf.toLocaleString()} SF</td><td>${a.use}</td><td>${a.rent}</td></tr>`)
  .join('');

// ---------- 3D viewer ----------
const el = document.getElementById('viewer');
const chapterName = document.getElementById('chapter-name');
const progress = document.getElementById('progress');
const chaptersEl = document.getElementById('chapters');
const playBtn = document.getElementById('btn-play');
const stateEl = document.getElementById('tour-state');
const tooltip = document.getElementById('tooltip');
const hint = document.getElementById('hint');
let activeHotspot = null;
let chapterButtons = [];

const viewer = new BuildingViewer(el, p, {
  onChapter(ch, i) {
    chapterName.textContent = ch.label;
    if (!chapterButtons.length) buildChapterButtons();
    chapterButtons.forEach((b, j) => b.classList.toggle('active', j === i));
    document.getElementById('loading').classList.add('hide');
  },
  onProgress(f) { progress.style.width = `${f * 100}%`; },
  onHotspot(h, obj) {
    activeHotspot = obj;
    tooltip.querySelector('b').textContent = h.label;
    tooltip.querySelector('span').textContent = h.text;
    tooltip.hidden = false;
    syncState();
  },
});

function buildChapterButtons() {
  const spacer = chaptersEl.querySelector('.spacer');
  viewer.chapters.forEach((ch, i) => {
    const b = document.createElement('button');
    b.textContent = ch.label;
    b.addEventListener('click', () => { viewer.goToChapter(i); syncState(); });
    chaptersEl.insertBefore(b, spacer);
    chapterButtons.push(b);
  });
}

function syncState() {
  const playing = viewer.tour.playing;
  playBtn.textContent = playing ? '❚❚ Pause' : '▶ Play tour';
  stateEl.textContent = playing ? 'Guided tour' : 'Free look';
}
playBtn.addEventListener('click', () => { viewer.toggle(); syncState(); });
document.getElementById('btn-next').addEventListener('click', () => { viewer.next(); syncState(); });
document.getElementById('btn-prev').addEventListener('click', () => { viewer.prev(); syncState(); });
el.addEventListener('pointerdown', () => { syncState(); hint.style.display = 'none'; }, { once: false });
document.getElementById('tooltip-close').addEventListener('click', () => { tooltip.hidden = true; activeHotspot = null; });

// Keep the tooltip pinned to its 3D marker while the camera moves.
(function trackTooltip() {
  if (activeHotspot && !tooltip.hidden) {
    const s = viewer.project(activeHotspot);
    tooltip.style.left = `${s.x}px`;
    tooltip.style.top = `${s.y}px`;
    tooltip.style.opacity = s.visible ? 1 : 0;
  }
  requestAnimationFrame(trackTooltip);
})();

// Floor table → highlight + fly.
tbody.addEventListener('click', (e) => {
  const tr = e.target.closest('tr[data-floor]');
  if (!tr) return;
  const n = Number(tr.dataset.floor);
  const already = tr.classList.contains('active');
  tbody.querySelectorAll('tr').forEach((r) => r.classList.remove('active'));
  if (already) { viewer.clearFloor(); return; }
  tr.classList.add('active');
  viewer.focusFloor(n);
  syncState();
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

// Keyboard: space = play/pause, arrows = chapters.
window.addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea')) return;
  if (e.code === 'Space') { e.preventDefault(); viewer.toggle(); syncState(); }
  if (e.code === 'ArrowRight') { viewer.next(); syncState(); }
  if (e.code === 'ArrowLeft') { viewer.prev(); syncState(); }
});

// Contact form (no backend yet) — opens a pre-filled email.
document.getElementById('contact-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const body = `Name: ${f.get('name')}\nEmail: ${f.get('email')}\nCompany: ${f.get('company')}\n\n${f.get('message')}`;
  location.href = `mailto:${company.email}?subject=${encodeURIComponent('Showing request — ' + p.address)}&body=${encodeURIComponent(body)}`;
  document.getElementById('contact-note').textContent = 'Opening your email client…';
});
