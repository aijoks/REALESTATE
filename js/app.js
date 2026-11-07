import { company, notableTenants } from './data/properties.js';
import {
  properties, soldProperties, STATE_NAMES, stateOf, cityOf, cardHTML, soldCardHTML, markets, esc, coverOf, placeOf, propertyHref,
} from './catalog.js';

document.querySelectorAll('[data-company]').forEach((el) => (el.textContent = company.name));
document.querySelectorAll('[data-phone]').forEach((el) => (el.textContent = company.phone));
document.querySelectorAll('[data-email]').forEach((el) => (el.textContent = company.email));

const phone = matchMedia('(max-width: 700px)').matches;

// ---------------------------------------------------------------------------
// Notable-tenant logo belt: the list is rendered twice so the CSS animation
// can slide by exactly one set and loop seamlessly.
const track = document.querySelector('[data-tenant-track]');
if (track) {
  // Phones get pre-whitened logos (no CSS filter), which iOS Safari paints
  // reliably inside the moving strip.
  const src = (t) => (phone ? t.logo.replace('assets/tenants/', 'assets/tenants/white/') : t.logo);
  const set = notableTenants.map((t) => `<img src="${src(t)}" alt="${t.name}" title="${t.name}"${t.size ? ` style="--s:${t.size}"` : ''} />`).join('');
  track.innerHTML = `<div class="tenant-set">${set}</div><div class="tenant-set" aria-hidden="true">${set}</div>`;
  // On a first visit iOS Safari can start the sliding strip before the logo
  // files arrive and then never repaint it. On phones the strip only starts
  // once every logo has loaded and decoded.
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

// ---------------------------------------------------------------------------
// Home page.
const M = markets();

document.querySelectorAll('[data-count-properties]').forEach((el) => (el.textContent = properties.length));
document.querySelectorAll('[data-count-states]').forEach((el) => (el.textContent = M.states.length));

function marketOptions(select, { cities = true } = {}) {
  const st = M.states.map((s) => `<option value="${s.code}">${s.name} (${s.count})</option>`).join('');
  const ct = M.cities.map((c) => `<option value="city:${esc(c.name)}">${esc(c.name)} (${c.count})</option>`).join('');
  select.insertAdjacentHTML('beforeend', cities ? `<optgroup label="States">${st}</optgroup><optgroup label="Cities">${ct}</optgroup>` : st);
}

const finder = document.querySelector('[data-finder]');
if (finder) {
  const propSel = finder.querySelector('[data-finder-property]');
  propSel.insertAdjacentHTML('beforeend', properties.map((p) => `<option value="${p.id}">${esc(p.address)} — ${esc(cityOf(p))}</option>`).join(''));
  marketOptions(finder.querySelector('[data-finder-market]'), { cities: false });
  // Choosing a property goes straight to its page.
  propSel.addEventListener('change', () => { if (propSel.value) location.href = `property.html#${encodeURIComponent(propSel.value)}`; });
  finder.addEventListener('submit', (e) => {
    e.preventDefault();
    if (propSel.value) { location.href = `property.html#${encodeURIComponent(propSel.value)}`; return; }
    const q = new URLSearchParams();
    const use = finder.querySelector('[data-finder-use]').value;
    const market = finder.querySelector('[data-finder-market]').value;
    if (use) q.set('use', use);
    if (market) q.set('market', market);
    location.href = `portfolio.html${q.toString() ? `?${q}` : ''}`;
  });
}

const featured = document.querySelector('[data-featured]');
if (featured) {
  const ids = featured.dataset.featured.split(',');
  ids.map((id) => properties.find((p) => p.id === id)).filter(Boolean).forEach((p) => {
    const el = document.createElement('article');
    el.className = 'pcard linked';
    el.innerHTML = cardHTML(p, { actions: true });
    featured.appendChild(el);
  });
  // Phones: the cards swipe sideways; dots show which one is in view.
  const dots = document.querySelector('[data-featured-dots]');
  if (dots) {
    dots.innerHTML = [...featured.children].map((_, i) => `<i${i ? '' : ' class="on"'}></i>`).join('');
    featured.addEventListener('scroll', () => {
      const i = Math.round(featured.scrollLeft / (featured.firstElementChild?.offsetWidth + 14 || 1));
      [...dots.children].forEach((d, j) => d.classList.toggle('on', j === i));
    }, { passive: true });
  }
}

const marketList = document.querySelector('[data-markets]');
if (marketList) {
  marketList.innerHTML = M.states.map((s) => `
    <li><a href="portfolio.html?market=${s.code}"><b>${s.name}</b><em>${s.count}</em><span>${[...s.cities].join(' · ')}</span></a></li>`).join('');
}

// ---------------------------------------------------------------------------
// Portfolio page.
const grid = document.querySelector('[data-grid]');
if (grid) initPortfolio();

function initPortfolio() {
  const params = new URLSearchParams(location.search);
  const USES = [...document.querySelectorAll('[data-filters] button')].map((b) => b.dataset.use);
  const marketSel = document.querySelector('[data-market]');
  marketOptions(marketSel);
  const validMarket = (m) => m === 'all' || [...marketSel.options].some((o) => o.value === m);
  const state = {
    use: USES.find((u) => u.toLowerCase() === (params.get('use') || '').toLowerCase()) || 'all',
    market: validMarket(params.get('market') || '') ? params.get('market') : 'all',
  };

  const explore = document.querySelector('[data-explore]');
  explore.innerHTML = M.cities.map((c) => `<li><button type="button" data-city="${esc(c.name)}"><span>${esc(c.name)}</span><b>${c.count}</b></button></li>`).join('');

  const matchUse = (p) => state.use === 'all' || p.uses.includes(state.use);
  const matchMarket = (p) => {
    if (state.market === 'all') return true;
    if (state.market.startsWith('city:')) return cityOf(p) === state.market.slice(5);
    return stateOf(p) === state.market;
  };
  const match = (p) => matchUse(p) && matchMarket(p);
  const marketName = () => {
    if (state.market === 'all') return '';
    return state.market.startsWith('city:') ? state.market.slice(5) : STATE_NAMES[state.market] || state.market;
  };

  let map = null;

  function render() {
    // Controls reflect the state.
    document.querySelectorAll('[data-filters] button').forEach((b) => b.classList.toggle('active', b.dataset.use === state.use));
    marketSel.value = state.market;
    explore.querySelectorAll('button').forEach((b) => b.classList.toggle('active', state.market === `city:${b.dataset.city}`));

    const list = properties.filter(match);
    const sold = soldProperties.filter(match);
    grid.innerHTML = '';
    list.forEach((p) => {
      const el = document.createElement('article');
      el.className = 'pcard linked reveal';
      el.dataset.id = p.id;
      el.innerHTML = cardHTML(p);
      grid.appendChild(el);
    });
    sold.forEach((p) => {
      const el = document.createElement('article');
      el.className = 'pcard sold reveal';
      el.setAttribute('aria-label', `${p.address} (sold)`);
      el.innerHTML = soldCardHTML(p);
      grid.appendChild(el);
    });
    if (!list.length && !sold.length) grid.innerHTML = '<p class="pgrid-empty">No properties match these filters. <button type="button" class="clear-link" data-clear>Clear all</button></p>';

    document.querySelector('[data-results-title]').textContent = `${list.length} ${list.length === 1 ? 'Property' : 'Properties'}`;
    const what = state.use === 'all' ? 'All asset types' : state.use;
    const where = marketName() ? `in ${marketName()}` : 'in all markets';
    document.querySelector('[data-results-note]').textContent = `${what} ${where}${sold.length ? ` · ${sold.length} sold` : ''}`;

    const q = new URLSearchParams();
    if (state.use !== 'all') q.set('use', state.use);
    if (state.market !== 'all') q.set('market', state.market);
    history.replaceState(null, '', `${location.pathname}${q.toString() ? `?${q}` : ''}`);

    observeReveals();
    map?.update(list);
  }

  document.querySelector('[data-filters]').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-use]');
    if (!b) return;
    state.use = b.dataset.use;
    render();
  });
  marketSel.addEventListener('change', () => { state.market = marketSel.value; render(); });
  explore.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-city]');
    if (!b) return;
    const v = `city:${b.dataset.city}`;
    state.market = state.market === v ? 'all' : v;
    render();
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-clear]')) return;
    state.use = 'all'; state.market = 'all';
    render();
  });

  render();
  initPortfolioMap().then((m) => { map = m; map.update(properties.filter(match)); }).catch(() => {
    document.getElementById('pmap').hidden = true;
  });
}

function observeReveals() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal:not(.in)').forEach((el) => io.observe(el));
}

// ---------------------------------------------------------------------------
// Portfolio map: Leaflet with the same light-grey Esri basemap as the
// property pages. One pin per property; pins that sit on top of each other
// at the current zoom are merged into a numbered marker that zooms in when
// clicked. Clicking a pin shows a small card linking to the property.
async function initPortfolioMap() {
  const { loadLeaflet } = await import('./map.js');
  const L = await loadLeaflet();
  const el = document.getElementById('pmap');
  const touch = matchMedia('(pointer: coarse)').matches;
  const map = L.map(el, {
    center: [37, -95], zoom: 4, minZoom: 3, maxZoom: 18,
    scrollWheelZoom: false, zoomControl: false, dragging: !touch, tap: false,
  });
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  map.attributionControl.setPrefix('');
  const esri = (svc, opts = {}) => L.tileLayer(`https://server.arcgisonline.com/ArcGIS/rest/services/${svc}/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 18, maxNativeZoom: 16, ...opts });
  esri('Canvas/World_Light_Gray_Base', { attribution: 'Map &copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors' }).addTo(map);
  esri('Canvas/World_Light_Gray_Reference').addTo(map);

  // Scroll-zoom / one-finger drag only after the map is clicked or tapped.
  const enable = () => { map.scrollWheelZoom.enable(); map.dragging.enable(); };
  map.on('click', enable); map.on('focus', enable);
  el.addEventListener('mouseleave', () => map.scrollWheelZoom.disable());

  const PIN = '<svg viewBox="0 0 26 34" aria-hidden="true"><path d="M13 1C6.4 1 1.5 5.9 1.5 12.2 1.5 20.5 13 33 13 33s11.5-12.5 11.5-20.8C24.5 5.9 19.6 1 13 1z"/><circle cx="13" cy="12.2" r="4.3"/></svg>';
  const pinIcon = L.divIcon({ className: 'pin', html: PIN, iconSize: [26, 34], iconAnchor: [13, 34], popupAnchor: [0, -32] });
  const clusterIcon = (n) => L.divIcon({ className: 'pin-cluster', html: `<span>${n}</span>`, iconSize: [34, 34], iconAnchor: [17, 17] });
  const popup = (p) => {
    const ph = coverOf(p);
    return `<a class="ppop-card" href="${propertyHref(p)}"><img src="${ph.src}" alt="" ${ph.focus ? `style="object-position:${ph.focus}"` : ''} /><span><b>${esc(p.address)}</b><span>${esc(p.uses.join(' / '))} · ${esc(placeOf(p))}</span></span><i class="arrow" aria-hidden="true"></i></a>`;
  };

  const layer = L.layerGroup().addTo(map);
  let shown = [];
  function draw() {
    layer.clearLayers();
    const groups = [];
    shown.forEach((p) => {
      const pt = map.latLngToLayerPoint(p.coords);
      const g = groups.find((x) => x.pt.distanceTo(pt) < 26);
      if (g) g.items.push(p); else groups.push({ pt, items: [p] });
    });
    groups.forEach((g) => {
      if (g.items.length === 1) {
        const p = g.items[0];
        L.marker(p.coords, { icon: pinIcon, title: p.address, riseOnHover: true })
          .bindPopup(popup(p), { className: 'ppop', closeButton: false, offset: [0, 0], autoPanPadding: [20, 20] })
          .addTo(layer);
      } else {
        const b = L.latLngBounds(g.items.map((p) => p.coords));
        L.marker(b.getCenter(), { icon: clusterIcon(g.items.length), title: `${g.items.length} properties — click to zoom in`, riseOnHover: true })
          .on('click', () => map.fitBounds(b.pad(0.4), { maxZoom: 16 }))
          .addTo(layer);
      }
    });
  }
  map.on('zoomend', draw);

  return {
    update(list) {
      shown = list.filter((p) => p.coords);
      map.closePopup();
      if (shown.length) {
        const b = L.latLngBounds(shown.map((p) => p.coords));
        if (shown.length === 1) map.setView(shown[0].coords, 14, { animate: false });
        else map.fitBounds(b, { padding: [40, 40], maxZoom: 13, animate: false });
      }
      draw();
      setTimeout(() => map.invalidateSize(), 0);
    },
  };
}
