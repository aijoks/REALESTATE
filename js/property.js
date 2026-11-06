import { company, getProperty, properties } from './data/properties.js';
import { BuildingViewer } from './viewer/viewer.js';

// Property id from #hash (preferred) or ?id= (older links).
const id = decodeURIComponent(location.hash.slice(1)) || new URLSearchParams(location.search).get('id') || properties[0].id;
const p = getProperty(id);
if (!p) location.replace('index.html');
window.addEventListener('hashchange', () => location.reload());

document.title = `${p.address} — ${company.name}`;
const fill = (sel, v) => document.querySelectorAll(sel).forEach((el) => (el.textContent = v));
fill('[data-company]', company.name);
fill('[data-phone]', company.phone);
fill('[data-address]', p.address);
fill('[data-city]', p.city);
fill('[data-headline]', p.headline);
document.querySelectorAll('[data-headline]').forEach((el) => (el.hidden = !p.headline));
fill('[data-description]', p.description);

document.querySelector('[data-stats]').innerHTML = p.stats
  .map((s) => `<div class="stat"><small>${s.label}</small><b>${s.value}</b></div>`).join('');
document.querySelector('[data-gallery]').innerHTML = p.photos
  .map((ph, i) => `<figure><button type="button" class="ph" data-i="${i}" aria-label="View larger: ${ph.caption}"><img src="${ph.src}" alt="${ph.caption}" loading="lazy" ${ph.focus ? `style="object-position:${ph.focus}"` : ''} /></button></figure>`).join('');

// Photo viewer: click a photo to see it larger; arrows / Esc / click outside.
{
  const lb = document.getElementById('lightbox');
  const img = lb.querySelector('img');
  let at = 0;
  const show = (i) => {
    at = (i + p.photos.length) % p.photos.length;
    img.src = p.photos[at].src; img.alt = p.photos[at].caption;
    lb.querySelectorAll('.lb-nav').forEach((b) => (b.hidden = p.photos.length < 2));
  };
  const open = (i) => { show(i); lb.hidden = false; document.body.classList.add('lb-open'); lb.querySelector('.lb-close').focus(); };
  const close = () => { lb.hidden = true; document.body.classList.remove('lb-open'); };
  document.querySelector('[data-gallery]').addEventListener('click', (e) => {
    const b = e.target.closest('.ph'); if (b) open(Number(b.dataset.i));
  });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', () => show(at - 1));
  lb.querySelector('.lb-next').addEventListener('click', () => show(at + 1));
  lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
  window.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') show(at + 1);
    if (e.key === 'ArrowLeft') show(at - 1);
    e.stopImmediatePropagation();
  }, true);
}

// ---------- Location map (Leaflet, loaded on demand) ----------
import('./map.js').then((m) => m.initMap(p)).catch(() => { document.getElementById('location').hidden = true; });

// ---------- 3D viewer ----------
const el = document.getElementById('viewer');
const progress = document.getElementById('progress');
const chaptersEl = document.getElementById('chapters');
const playBtn = document.getElementById('btn-play');
const tooltip = document.getElementById('tooltip');
const hint = document.getElementById('hint');
let activeHotspot = null;
let chapterButtons = [];

const viewer = new BuildingViewer(el, p, {
  onChapter(ch, i) {
    if (!chapterButtons.length) buildChapterButtons();
    chapterButtons.forEach((b, j) => {
      b.classList.toggle('active', j === i);
      b.setAttribute('aria-selected', j === i);
    });
    // Keep the active stop visible in the one-line strip.
    const active = chapterButtons[i];
    chaptersEl.scrollTo({ left: active.offsetLeft - chaptersEl.clientWidth / 2 + active.offsetWidth / 2, behavior: 'smooth' });
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
  viewer.chapters.forEach((ch, i) => {
    const b = document.createElement('button');
    b.textContent = ch.label;
    b.setAttribute('role', 'tab');
    b.addEventListener('click', () => { viewer.goToChapter(i); syncState(); });
    chaptersEl.appendChild(b);
    chapterButtons.push(b);
  });
}

function syncState() {
  const playing = viewer.tour.playing;
  playBtn.textContent = playing ? '❚❚' : '▶';
  playBtn.title = playing ? 'Pause tour' : 'Play tour';
  playBtn.setAttribute('aria-label', playBtn.title);
}
playBtn.addEventListener('click', () => { viewer.toggle(); syncState(); });
document.getElementById('btn-next').addEventListener('click', () => { viewer.next(); syncState(); });
document.getElementById('btn-prev').addEventListener('click', () => { viewer.prev(); syncState(); });
el.addEventListener('pointerdown', () => { syncState(); hint.classList.add('gone'); });

// Interaction hint: device-appropriate, and re-shown briefly when someone
// scrolls over the view without the zoom modifier.
const touch = matchMedia('(pointer: coarse)').matches;
const zoomKey = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl';
hint.textContent = touch
  ? 'Two fingers to rotate & zoom · Tap a marker for details'
  : `Drag to orbit · ${zoomKey} + scroll to zoom · Click a marker for details`;
let hintTimer;
viewer.onScrollHint = () => {
  hint.textContent = `Hold ${zoomKey} and scroll to zoom the 3D view`;
  hint.classList.remove('gone');
  hint.classList.add('flash');
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => { hint.classList.remove('flash'); hint.classList.add('gone'); }, 1400);
};
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

// Keyboard: space = play/pause, arrows = chapters.
window.addEventListener('keydown', (e) => {
  if (e.target.matches('input, textarea')) return;
  if (e.code === 'Space') { e.preventDefault(); viewer.toggle(); syncState(); }
  if (e.code === 'ArrowRight') { viewer.next(); syncState(); }
  if (e.code === 'ArrowLeft') { viewer.prev(); syncState(); }
});

// "Request a showing" opens the Contact Us page with this property filled in.
document.querySelectorAll('[data-showing]').forEach((a) => { a.href = `contact.html?property=${encodeURIComponent(p.id)}`; });

