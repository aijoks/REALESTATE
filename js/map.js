// Property location map: Leaflet with a clean street basemap
// (Esri light grey canvas) and a satellite option (Esri World Imagery + labels), a brand-diamond pin,
// scroll-zoom that only switches on after the map is clicked, and buttons to
// recenter, open in Google Maps and get directions.
const LEAFLET = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = LEAFLET;
    s.onload = () => resolve(window.L);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export async function initMap(p) {
  const panel = document.getElementById('location');
  if (!p.coords) { panel.hidden = true; return; }
  const [lat, lon] = p.coords;
  const query = encodeURIComponent(`${p.address}, ${p.city}`);
  document.getElementById('map-open').href = `https://www.google.com/maps/search/?api=1&query=${query}`;
  document.getElementById('map-directions').href = `https://www.google.com/maps/dir/?api=1&destination=${query}`;

  // Build the map only when the section is about to scroll into view.
  await new Promise((resolve) => {
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { io.disconnect(); resolve(); }
    }, { rootMargin: '400px' });
    io.observe(panel);
  });
  const L = await loadLeaflet();

  const el = document.getElementById('map');
  const touch = matchMedia('(pointer: coarse)').matches;
  const map = L.map(el, {
    center: [lat, lon], zoom: 16, minZoom: 3, maxZoom: 19,
    scrollWheelZoom: false, zoomControl: false, attributionControl: true,
    dragging: !touch, tap: false,
  });
  L.control.zoom({ position: 'bottomright' }).addTo(map);
  map.attributionControl.setPrefix('');

  const esri = (svc, opts = {}) => L.tileLayer(`https://server.arcgisonline.com/ArcGIS/rest/services/${svc}/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 19, ...opts });
  // Soft grey canvas with labels: calm and on-brand, the pin stands out.
  const street = L.layerGroup([
    esri('Canvas/World_Light_Gray_Base', { maxNativeZoom: 16, attribution: 'Map &copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors' }),
    esri('Canvas/World_Light_Gray_Reference', { maxNativeZoom: 16 }),
  ]);
  const sat = L.layerGroup([
    esri('World_Imagery', { attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics' }),
    esri('Reference/World_Transportation', { opacity: 0.85 }),
    esri('Reference/World_Boundaries_and_Places'),
  ]);
  street.addTo(map);

  const icon = L.divIcon({
    className: 'fp-pin',
    html: '<span class="fp-pin-pulse"></span><span class="fp-pin-diamond"></span>',
    iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -18],
  });
  const marker = L.marker([lat, lon], { icon, keyboard: true, title: p.address }).addTo(map);
  marker.bindPopup(`<div class="fp-pop"><b>${p.address}</b><span>${p.city}</span></div>`, { closeButton: false, offset: [0, -2] });
  marker.bindTooltip(p.address, { direction: 'top', offset: [0, -20], className: 'fp-label', permanent: !touch });

  // Map / Satellite switch.
  document.querySelectorAll('.map-switch button').forEach((b) => b.addEventListener('click', () => {
    document.querySelectorAll('.map-switch button').forEach((x) => x.classList.toggle('active', x === b));
    const toSat = b.dataset.layer === 'satellite';
    map.removeLayer(toSat ? street : sat);
    (toSat ? sat : street).addTo(map);
    el.classList.toggle('is-sat', toSat);
  }));

  // Scroll-zoom only after the map is clicked; one-finger drag on phones
  // keeps scrolling the page until the map is tapped.
  const hint = document.getElementById('map-hint');
  hint.textContent = touch ? 'Tap the map to move it' : 'Click the map to zoom with scroll';
  const enable = () => {
    map.scrollWheelZoom.enable();
    map.dragging.enable();
    hint.classList.add('gone');
  };
  map.on('click', enable);
  map.on('focus', enable);
  el.addEventListener('mouseleave', () => { map.scrollWheelZoom.disable(); hint.classList.remove('gone'); });

  document.getElementById('map-recenter').addEventListener('click', () => map.flyTo([lat, lon], 16, { duration: 0.8 }));
  setTimeout(() => map.invalidateSize(), 0);
}
