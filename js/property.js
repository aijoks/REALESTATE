import { company, getProperty, properties } from './data/properties.js';
import { BuildingViewer } from './viewer/viewer.js';
import { initPlans } from './plans.js?v=20261113a';

// Property id from #hash (preferred) or ?id= (older links).
const id = decodeURIComponent(location.hash.slice(1)) || new URLSearchParams(location.search).get('id') || properties[0].id;
const p = getProperty(id);
if (!p) location.replace('index.html');
window.addEventListener('hashchange', () => location.reload());

document.title = `${p.address} — ${company.name}`;
const fill = (sel, v) => document.querySelectorAll(sel).forEach((el) => (el.textContent = v));
fill('[data-company]', company.name);
fill('[data-phone]', company.phone);
fill('[data-email]', company.email);
fill('[data-address]', p.address);
fill('[data-city]', p.city);
fill('[data-neighborhood]', p.neighborhood || p.city);
fill('[data-uses]', p.uses.join(' · '));
fill('[data-headline]', p.headline);
document.querySelectorAll('[data-headline]').forEach((el) => (el.hidden = !p.headline));
fill('[data-description]', p.description);

// Hero band: the property's cover photo.
{
  const cover = p.photos.find((x) => x.src === p.cover) ?? p.photos[0];
  const img = document.querySelector('[data-hero-img]');
  // Enhanced 2560 px banner version of the cover (assets/properties/<id>/hero.jpg).
  img.src = `assets/properties/${p.id}/hero.jpg`;
  img.onerror = () => { img.onerror = null; img.src = cover.src; };
  img.alt = cover.caption || p.address;
  if (cover.focus) img.style.objectPosition = cover.focus;
}

// Property overview: the property's own facts, each with a small line icon.
const ICONS = {
  building: '<path d="M5 21V4h10v17M15 9h4v12M3 21h18M8 7.5h1.5M11 7.5h1.5M8 11h1.5M11 11h1.5M8 14.5h1.5M11 14.5h1.5"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="1"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  area: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
  layers: '<path d="m12 4 9 4.5-9 4.5-9-4.5z"/><path d="m3 12.5 9 4.5 9-4.5M3 16.5l9 4.5 9-4.5"/>',
  pen: '<path d="M4 20l4.5-1 10-10-3.5-3.5-10 10z"/><path d="M13.5 7.5 17 11"/>',
  people: '<circle cx="9" cy="8" r="3"/><path d="M3.5 19c.5-3.3 2.6-5 5.5-5s5 1.7 5.5 5"/><circle cx="17" cy="9" r="2.4"/><path d="M15.8 14.2c2.4 0 4.2 1.5 4.7 4.3"/>',
  tag: '<path d="M3.5 12.5V4h8.5l8.5 8.5-8 8z"/><circle cx="8" cy="8.5" r="1.4"/>',
  pin: '<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.3"/>',
  height: '<path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4"/>',
};
const iconFor = (label) => {
  const l = label.toLowerCase();
  if (/stor|floor|building$|buildings/.test(l)) return 'building';
  if (/built|renovat/.test(l)) return 'calendar';
  if (/typical/.test(l)) return 'layers';
  if (/size|lot|tract|frontage|acre/.test(l)) return 'area';
  if (/architect|style/.test(l)) return 'pen';
  if (/tenant|anchor|apartment/.test(l)) return 'people';
  if (/height/.test(l)) return 'height';
  if (/market|location|submarket/.test(l)) return 'pin';
  return 'tag';
};
const row = (icon, label, value) => `<div><dt><svg class="ico" viewBox="0 0 24 24" aria-hidden="true">${ICONS[icon]}</svg><span>${label}</span></dt><dd>${value}</dd></div>`;
document.querySelector('[data-stats]').innerHTML =
  row('tag', 'Asset type', p.uses.join(' / '))
  + p.stats.map((s) => row(iconFor(s.label), s.label, s.value)).join('')
  + (p.neighborhood ? row('pin', 'Location', p.neighborhood) : '');

const galleryEl = document.querySelector('[data-gallery]');
galleryEl.classList.add(`n${Math.min(p.photos.length, 6)}`);
galleryEl.innerHTML = p.photos
  .map((ph, i) => `<figure><button type="button" class="ph" data-i="${i}" aria-label="View larger: ${ph.caption}"><img src="${ph.src}" alt="${ph.caption}" loading="lazy" ${ph.focus ? `style="object-position:${ph.focus}"` : ''} /></button></figure>`).join('');

// On-page tabs (3D tour · Photos · Location) scroll to their section.
document.querySelectorAll('.view-tabs a').forEach((a) => a.addEventListener('click', (e) => {
  const t = document.querySelector(a.getAttribute('href'));
  if (!t) return;
  e.preventDefault();
  document.querySelectorAll('.view-tabs a').forEach((x) => x.classList.toggle('on', x === a));
  const y = t.getBoundingClientRect().top + scrollY - (document.querySelector('.site-header')?.offsetHeight || 0) - 14;
  scrollTo({ top: y, behavior: 'smooth' });
}));

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

// ---------- Floor plans (published plans per floor, linked to the 3D floor highlight) ----------
initPlans(p, viewer);

// "Request a showing" opens the Contact Us page with this property filled in.
document.querySelectorAll('[data-showing]').forEach((a) => { a.href = `contact.html?property=${encodeURIComponent(p.id)}`; });

