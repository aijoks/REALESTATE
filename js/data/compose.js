// Helpers for composite cut-away layouts (see `compose` in
// js/viewer/floorplan3d.js): one published drawing laid into another — e.g.
// a suite test fit dropped into the floor it is on — and furnishing measured
// on that drawing carried over into the base drawing's grid.

// Linear map from a drawing's own px to the base grid: scale (sx, sy) and one
// pair of matching points (a in the drawing ↔ b in the base).
export const lin = (sx, sy, [ax, ay], [bx, by]) => ({ sx, sy, ox: bx - sx * ax, oy: by - sy * ay });
export const at = (m, x, y) => [m.ox + m.sx * x, m.oy + m.sy * y];
export const atRect = (m, [x0, y0, x1, y1]) => [...at(m, x0, y0), ...at(m, x1, y1)];

// A drawing laid into the base: `crop` (its px) lands where the map puts it,
// after `clear` (base grid; defaults to the landing rectangle) is removed.
export const layer = (src, m, crop, clear) => ({ src, crop, at: atRect(m, crop), clear: [clear ?? atRect(m, crop)] });

// Furnishing measured on a drawing (rooms / erase / items / tags, in its px)
// → the base grid. Sizes stay in metres; rotations are unchanged (same
// orientation).
export function placed(m, f) {
  return {
    rooms: (f.rooms ?? []).map((r) => (Array.isArray(r) ? [r[0], ...atRect(m, r.slice(1, 5)), ...r.slice(5)] : { ...r, poly: r.poly.map(([x, y]) => at(m, x, y)) })),
    erase: (f.erase ?? []).map((r) => atRect(m, r)),
    items: (f.items ?? []).map((it) => {
      if (it.box) return { ...it, box: atRect(m, it.box) };
      const [x, y] = at(m, it.x, it.y);
      return { ...it, x, y };
    }),
    tags: (f.tags ?? []).map(([t, x, y, s]) => [t, ...at(m, x, y), s]),
  };
}

// Merge furnishing parts: arrays concatenate (in order), `compose` merges
// field by field, anything else is taken from the last part that sets it.
export function merge(...parts) {
  const out = {};
  for (const p of parts) {
    if (!p) continue;
    for (const [k, v] of Object.entries(p)) {
      if (k === 'compose') out.compose = merge(out.compose ?? {}, v);
      else if (Array.isArray(v) && k !== 'grid') out[k] = [...(out[k] ?? []), ...v];
      else out[k] = v;
    }
  }
  return out;
}
