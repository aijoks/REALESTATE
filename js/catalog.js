// Helpers shared by the home, portfolio and property pages. Everything shown
// is derived from js/data/properties.js — no figures are made up here.
import { properties, soldProperties } from './data/properties.js';

export const STATE_NAMES = { NY: 'New York', NJ: 'New Jersey', CT: 'Connecticut', FL: 'Florida', AZ: 'Arizona', CA: 'California', TX: 'Texas' };

// "New York, NY 10022" -> "NY"; "Tucson, AZ" -> "AZ".
export const stateOf = (p) => (p.city.match(/,\s*([A-Z]{2})\b/) || [])[1] || '';
// "New York, NY 10022" -> "New York, NY".
export const cityOf = (p) => `${p.city.split(',')[0].trim()}, ${stateOf(p)}`;

// Short location for cards: the neighborhood inside New York City, the
// city elsewhere.
export function placeOf(p) {
  if (/^New York,/.test(p.city) && p.neighborhood) return p.neighborhood.split(' · ')[0];
  return cityOf(p);
}

export function coverOf(p) {
  if (p.photo) return { src: p.photo };
  return p.photos.find((x) => x.src === p.cover) ?? p.photos[0];
}

// Up to three short facts for a card, taken from the property's own stats.
export function cardStats(p) {
  // The market is already in the card's subtitle.
  const all = (p.stats || []).filter((s) => !/market/i.test(s.label));
  // Prefer short values so three fit side by side on a card.
  const fit = all.filter((s) => String(s.value).length <= 12);
  return fit.length >= 2 ? fit.slice(0, 3) : all.filter((s) => String(s.value).length <= 18).slice(0, 2);
}

export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const propertyHref = (p) => `property.html#${encodeURIComponent(p.id)}`;

// Property card. The title link stretches over the whole card, so the card
// can also hold its own buttons (featured cards on phones).
export function cardHTML(p, { actions = false, lazy = true } = {}) {
  const ph = coverOf(p);
  const stats = cardStats(p).map((s) => `<div><b>${esc(s.value)}</b><small>${esc(s.label)}</small></div>`).join('');
  const sub = `${p.uses.join(' / ')} · ${placeOf(p)}`;
  return `
    <div class="pcard-media"><img src="${ph.src}" alt="${esc(p.address)}" ${ph.focus ? `style="object-position:${ph.focus}"` : ''} ${lazy ? 'loading="lazy"' : ''} /></div>
    <div class="pcard-body">
      <h3 class="pcard-title"><a class="stretch" href="${propertyHref(p)}">${esc(p.address)}</a></h3>
      <p class="pcard-sub">${esc(sub)}</p>
      <span class="pcard-go arrow" aria-hidden="true"></span>
    </div>
    ${stats ? `<div class="pcard-stats">${stats}</div>` : ''}
    ${actions ? `<div class="pcard-actions">
      <a class="btn btn-orange arrow" href="${propertyHref(p)}">View property</a>
      <a class="btn btn-outline" href="contact.html?property=${encodeURIComponent(p.id)}">Request a showing</a>
    </div>` : ''}`;
}

export function soldCardHTML(p) {
  return `
    <div class="pcard-media"><img src="${p.photo}" alt="${esc(p.address)}" loading="lazy" /><span class="sold-tag">Sold</span></div>
    <div class="pcard-body">
      <h3 class="pcard-title">${esc(p.address)}</h3>
      <p class="pcard-sub">${esc(`${p.uses.join(' / ')} · ${cityOf(p)}`)}</p>
    </div>`;
}

// Markets: states and cities with property counts (current portfolio only).
export function markets() {
  const states = new Map();
  const cities = new Map();
  properties.forEach((p) => {
    const st = stateOf(p);
    const c = cityOf(p);
    if (!states.has(st)) states.set(st, { code: st, name: STATE_NAMES[st] || st, count: 0, cities: new Set() });
    const s = states.get(st);
    s.count += 1; s.cities.add(p.city.split(',')[0].trim());
    cities.set(c, (cities.get(c) || 0) + 1);
  });
  return {
    states: [...states.values()].sort((a, b) => b.count - a.count),
    cities: [...cities.entries()].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)),
  };
}

export { properties, soldProperties };
