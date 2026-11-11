// Turns a published floor plan image into a 3D cut-away floor:
//   - the drawing itself, laid on a floor slab at the storey's level, and
//   - its walls and columns raised to waist height, read straight from the
//     drawing: thick inked features (walls, columns, cores) are kept, thin ones
//     (text, dimensions, door swings, furniture) stay flat on the floor.
//
// model3d (per plan, in js/data/floorplans.js):
//   rot : quarter-turns counter-clockwise that put the street side at the
//         bottom of the image (0 when it already is; 1 when the street is on
//         the left edge).
//   box : the building's footprint in the ORIGINAL image, as fractions
//         [x0, y0, x1, y1] (exterior wall lines; may run past the image when
//         the drawing only shows part of the lot). It is stretched onto the
//         model's width × depth, front (street) at +z.
//
// Furnished plans (js/data/furnishings.js, keyed by the plan's src) go further:
// the floor becomes a finished interior — room-by-room floor finishes (oak,
// carpet tile, stone, tile) painted under the drawing's ink, labels and flat
// furniture symbols painted out, soft contact shadows under furniture and
// along walls — with low-poly 3D furniture (js/viewer/furniture.js) standing
// where the drawing puts it.
import * as THREE from 'three';
import { buildFurniture } from './furniture.js';
import { furnishingFor } from '../data/furnishings.js';

const cache = new Map();
const loadImage = (src) => {
  if (!cache.has(src)) {
    cache.set(src, new Promise((res, rej) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = src;
    }));
  }
  return cache.get(src);
};

// Rotate the image `rot` quarter-turns counter-clockwise onto a canvas.
function rotated(img, rot) {
  const r = ((rot % 4) + 4) % 4;
  const c = document.createElement('canvas');
  c.width = r % 2 ? img.naturalHeight : img.naturalWidth;
  c.height = r % 2 ? img.naturalWidth : img.naturalHeight;
  const x = c.getContext('2d');
  x.translate(c.width / 2, c.height / 2);
  x.rotate((-r * Math.PI) / 2);
  x.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  return c;
}
// The footprint box after the same rotation.
function rotBox([x0, y0, x1, y1], rot) {
  let b = [x0, y0, x1, y1];
  for (let i = 0; i < (((rot % 4) + 4) % 4); i++) b = [b[1], 1 - b[2], b[3], 1 - b[0]]; // one CCW turn
  return b;
}

// Square min / max filters (separable) on a 0/1 grid.
function morph(src, w, h, r, max) {
  const tmp = new Uint8Array(w * h), out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = max ? 0 : 1;
    for (let k = -r; k <= r; k++) { const xx = x + k; const s = xx < 0 || xx >= w ? 0 : src[y * w + xx]; v = max ? v | s : v & s; }
    tmp[y * w + x] = v;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = max ? 0 : 1;
    for (let k = -r; k <= r; k++) { const yy = y + k; const s = yy < 0 || yy >= h ? 0 : tmp[yy * w + x]; v = max ? v | s : v & s; }
    out[y * w + x] = v;
  }
  return out;
}

// Greedy rectangles over a 0/1 grid: horizontal runs, grown downwards while
// the next row has the identical run.
function rectangles(m, w, h) {
  const used = new Uint8Array(w * h);
  const rects = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      if (!m[y * w + x] || used[y * w + x]) { x++; continue; }
      let x1 = x;
      while (x1 + 1 < w && m[y * w + x1 + 1] && !used[y * w + x1 + 1]) x1++;
      let y1 = y;
      grow: while (y1 + 1 < h) {
        for (let k = x; k <= x1; k++) if (!m[(y1 + 1) * w + k] || used[(y1 + 1) * w + k]) break grow;
        y1++;
      }
      for (let yy = y; yy <= y1; yy++) for (let k = x; k <= x1; k++) used[yy * w + k] = 1;
      rects.push([x, y, x1 + 1, y1 + 1]);
      x = x1 + 1;
    }
  }
  return rects;
}

// One indexed geometry for all wall blocks: group 0 = sides, group 1 = cut tops.
// Blocks are kept `inset` inside the footprint [±hx, ±hz]: the drawing's
// exterior walls would otherwise sit on (or a few mm outside) the model's own
// facade faces and z-fight with them / paint a band over the brick.
function wallGeometry(rects, toX, toZ, H, hx = Infinity, hz = Infinity, inset = 0.03) {
  const pos = [], nor = [], side = [], top = [];
  let v = 0;
  const quad = (a, b, c, d, n, into) => {
    pos.push(...a, ...b, ...c, ...d);
    for (let i = 0; i < 4; i++) nor.push(...n);
    into.push(v, v + 1, v + 2, v, v + 2, v + 3);
    v += 4;
  };
  const cx = (x) => Math.min(hx - inset, Math.max(-hx + inset, x)), cz = (z) => Math.min(hz - inset, Math.max(-hz + inset, z));
  for (const [gx0, gy0, gx1, gy1] of rects) {
    const x0 = cx(toX(gx0)), x1 = cx(toX(gx1)), z0 = cz(toZ(gy0)), z1 = cz(toZ(gy1));
    if (x1 - x0 < 0.005 || z1 - z0 < 0.005) continue;
    quad([x0, H, z1], [x1, H, z1], [x1, H, z0], [x0, H, z0], [0, 1, 0], top);
    quad([x0, 0, z1], [x1, 0, z1], [x1, H, z1], [x0, H, z1], [0, 0, 1], side);
    quad([x1, 0, z0], [x0, 0, z0], [x0, H, z0], [x1, H, z0], [0, 0, -1], side);
    quad([x1, 0, z1], [x1, 0, z0], [x1, H, z0], [x1, H, z1], [1, 0, 0], side);
    quad([x0, 0, z0], [x0, 0, z1], [x0, H, z1], [x0, H, z0], [-1, 0, 0], side);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex([...side, ...top]);
  g.addGroup(0, side.length, 0);
  g.addGroup(side.length, top.length, 1);
  return g;
}

// ---------------------------------------------------------------- floor finishes
const rng = (seed) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
let noiseTile = null;
function noise() {
  if (noiseTile) return noiseTile;
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  const im = x.createImageData(128, 128);
  const r = rng(7);
  for (let i = 0; i < 128 * 128; i++) { const v = r() * 255; im.data.set([v, v, v, 255], i * 4); }
  x.putImageData(im, 0, 0);
  return (noiseTile = c);
}
const FINISH = {
  oak: { base: '#e2cba8', plank: [0.19, 1.3, 2.3], tones: ['#e5cfac', '#dec5a0', '#e8d4b3', '#dbc19b'], seam: 'rgba(120,85,50,0.22)' },
  oakDark: { base: '#c9a57d', plank: [0.19, 1.2, 2.1], tones: ['#cba882', '#c29d74', '#d0ae89', '#bf9a70'], seam: 'rgba(90,60,35,0.28)' },
  carpet: { base: '#bfc1c0', tile: 0.6, tones: ['#c2c4c3', '#bbbdbd'], seam: 'rgba(0,0,0,0.035)', grain: 0.09 },
  carpetBlue: { base: '#aeb5bd', tile: 0.6, tones: ['#b1b8c0', '#aab1b9'], seam: 'rgba(0,0,0,0.035)', grain: 0.09 },
  tile: { base: '#eceae5', tile: 0.6, tones: ['#eeece7', '#e9e7e2'], seam: 'rgba(120,115,105,0.35)' },
  stone: { base: '#e2ddd3', tile: [0.9, 0.45], tones: ['#e5e0d6', '#ddd7cc', '#e8e3da'], seam: 'rgba(110,100,85,0.3)' },
  concrete: { base: '#d8d5cf', grain: 0.16 },
  terrace: { base: '#cbc6bc', tile: 0.6, tones: ['#cdc8be', '#c6c1b6'], seam: 'rgba(90,85,75,0.35)' },
  shaft: { base: '#7b8087', grain: 0.12 },
  stair: { base: '#cfccc6', grain: 0.1 },
  // Large-format grey stone (restaurant floors, e.g. YOON at 8 W 36th St).
  slate: { base: '#85868d', tile: [1.2, 0.6], tones: ['#87888f', '#808189', '#8b8c93', '#7d7e86'], seam: 'rgba(40,40,48,0.35)', grain: 0.12 },
  slateLight: { base: '#b4b4b8', tile: [1.2, 0.6], tones: ['#b6b6ba', '#afafb4', '#bbbbbf'], seam: 'rgba(60,60,70,0.3)', grain: 0.1 },
};
// Paint one finish over rect [x0, y0, x1, y1] (canvas px); k = px per metre.
// `along` = 'x' | 'y': plank direction on the canvas.
function paintFinish(ctx, name, [x0, y0, x1, y1], k, along = 'y', seed = 1) {
  const f = FINISH[name] ?? FINISH.oak;
  const r = rng(seed * 7919 + 13);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, y0, x1 - x0, y1 - y0);
  ctx.clip();
  ctx.fillStyle = f.base;
  ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  if (f.plank) {
    const [pw, l0, l1] = f.plank.map((v) => v * k);
    const vert = along === 'y';
    const [a0, a1, b0, b1] = vert ? [x0, x1, y0, y1] : [y0, y1, x0, x1];
    for (let a = a0; a < a1; a += pw) {
      let b = b0 - r() * l1;
      while (b < b1) {
        const len = l0 + r() * (l1 - l0);
        ctx.fillStyle = f.tones[Math.floor(r() * f.tones.length)];
        if (vert) ctx.fillRect(a, b, pw, len); else ctx.fillRect(b, a, len, pw);
        ctx.fillStyle = f.seam;
        if (vert) { ctx.fillRect(a, b, Math.max(1, k * 0.006), len); ctx.fillRect(a, b, pw, Math.max(1, k * 0.008)); } else { ctx.fillRect(b, a, len, Math.max(1, k * 0.006)); ctx.fillRect(b, a, Math.max(1, k * 0.008), pw); }
        b += len;
      }
    }
  } else if (f.tile) {
    const [tw, th] = (Array.isArray(f.tile) ? f.tile : [f.tile, f.tile]).map((v) => v * k);
    let row = 0;
    for (let y = y0; y < y1; y += th, row++) {
      const off = Array.isArray(f.tile) && row % 2 ? tw / 2 : 0;
      for (let x = x0 - off; x < x1; x += tw) {
        ctx.fillStyle = f.tones[Math.floor(r() * f.tones.length)];
        ctx.fillRect(x, y, tw, th);
        ctx.fillStyle = f.seam;
        ctx.fillRect(x, y, Math.max(1, k * 0.008), th);
        ctx.fillRect(x, y, tw, Math.max(1, k * 0.008));
      }
    }
  }
  if (f.grain) {
    ctx.globalAlpha = f.grain;
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = ctx.createPattern(noise(), 'repeat');
    ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
  }
  ctx.restore();
}

// An office given only as a room box and a desk count (`office` items in the
// furnishing data) → desks against a wall (`wall`: top | bottom | left | right
// of the drawing), or a back-to-back bench for 4+ desks. Grid units in/out.
function expandOffice(o, mx, my) {
  const [x0, y0, x1, y1] = o.box;
  const n = o.desks ?? 2, d = o.d ?? 0.7, gap = 0.06;
  const Wm = (x1 - x0) * mx, Hm = (y1 - y0) * my;
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  const out = [];
  const opposite = { top: 'bottom', bottom: 'top', left: 'right', right: 'left' };
  const row = (side, k, w, shift = 0) => {
    const r = { top: 0, bottom: 180, left: 270, right: 90 }[side];
    for (let i = 0; i < k; i++) {
      const t = -((k - 1) * w) / 2 + i * w + shift;
      const off = d / 2 + gap;
      const [x, y] = side === 'top' ? [cx + t / mx, y0 + off / my] : side === 'bottom' ? [cx + t / mx, y1 - off / my]
        : side === 'left' ? [x0 + off / mx, cy + t / my] : [x1 - off / mx, cy + t / my];
      out.push({ t: 'desk', x, y, r, w: w - 0.04, d, fab: o.fab, top: o.top });
    }
  };
  const layout = o.layout ?? (n >= 4 ? 'bench' : 'wall');
  if (layout === 'bench') {
    const k = Math.ceil(n / 2);
    const horiz = o.axis ? o.axis === 'x' : Wm >= Hm;
    const len = horiz ? Wm : Hm, across = horiz ? Hm : Wm;
    const w = Math.min(1.4, (len - (o.margin ?? 0.5)) / k);
    const dd = Math.max(0.6, Math.min(d, (across - 1.5) / 2));
    out.push({ t: 'desks', x: cx + (o.dx ?? 0) / mx, y: cy + (o.dy ?? 0) / my, r: horiz ? 0 : 90, n: k, w, d: dd, double: true, fab: o.fab });
  } else {
    const side = o.wall ?? 'top';
    const len = side === 'top' || side === 'bottom' ? Wm : Hm;
    const per = Math.min(n, Math.max(1, Math.floor((len - 0.15) / 1.05)));
    const w = Math.min(o.w ?? 1.4, (len - 0.15) / per);
    row(side, per, w, o.shift ?? 0);
    if (n > per) row(opposite[side], n - per, Math.min(1.4, (len - 0.15) / (n - per)), o.shift ?? 0);
  }
  return out;
}

// Soft shadows: shapes are filled into a low-resolution mask (`res` metres per
// pixel), blurred by repeated down/up-sampling, then laid over the floor.
// (Canvas shadowBlur misplaces very large paths in some browsers.)
function softLayer(ctx, kpx, res, passes, fill) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const s = 1 / (kpx * res);
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.round(W * s)); c.height = Math.max(1, Math.round(H * s));
  const x = c.getContext('2d');
  x.scale(c.width / W, c.height / H);
  fill(x);
  const t = document.createElement('canvas');
  t.width = Math.max(1, c.width >> 1); t.height = Math.max(1, c.height >> 1);
  const tx = t.getContext('2d');
  for (let i = 0; i < passes; i++) {
    tx.clearRect(0, 0, t.width, t.height);
    tx.imageSmoothingQuality = 'high';
    tx.drawImage(c, 0, 0, t.width, t.height);
    x.save(); x.setTransform(1, 0, 0, 1, 0, 0); x.clearRect(0, 0, c.width, c.height);
    x.imageSmoothingQuality = 'high';
    x.drawImage(t, 0, 0, c.width, c.height); x.restore();
  }
  ctx.save();
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(c, 0, 0, W, H);
  ctx.restore();
}

export async function buildPlanFloor({ src, model3d, W, D, maxAniso = 8 }) {
  const img = await loadImage(src);
  const rot = model3d.rot ?? 0;
  const canvas = rotated(img, rot);
  const [bx0, by0, bx1, by1] = rotBox(model3d.box, rot);
  const furnish = furnishingFor(src);

  // The whole image plane, scaled so the footprint box lands on W × D.
  const PW = W / (bx1 - bx0), PD = D / (by1 - by0);
  const cx = -W / 2 + (0.5 - bx0) * PW;
  const cz = -D / 2 + (0.5 - by0) * PD;
  const group = new THREE.Group();
  const cw = canvas.width, ch = canvas.height;
  // Original-image fraction → rotated fraction → canvas px / world.
  const rf = (u, v) => { for (let i = 0; i < (((rot % 4) + 4) % 4); i++) [u, v] = [v, 1 - u]; return [u, v]; };
  const toWorld = (u, v) => { const [a, b] = rf(u, v); return [cx - PW / 2 + a * PW, cz - PD / 2 + b * PD]; };
  const worldToCanvas = (X, Z) => [((X - (cx - PW / 2)) / PW) * cw, ((Z - (cz - PD / 2)) / PD) * ch];
  const kpx = cw / PW; // canvas px per metre along x (y may differ slightly)
  const kpm = (cw / PW + ch / PD) / 2;

  // Floor slab (pale oak) just inside the facade, then the drawing on top.
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.25, 0.12, D - 0.25),
    new THREE.MeshBasicMaterial({ color: '#efe5d3' }),
  );
  slab.position.y = -0.06;
  slab.receiveShadow = true;
  group.add(slab);

  // Wall mask at ~3.5 cm per cell, inside the footprint (plus a little margin).
  const cell = Math.max(0.035, Math.max(PW, PD) / 1400);
  const gw = Math.round(PW / cell), gh = Math.round(PD / cell);
  const sm = document.createElement('canvas');
  sm.width = gw; sm.height = gh;
  const sx = sm.getContext('2d', { willReadFrequently: true });
  sx.imageSmoothingQuality = 'high';
  sx.drawImage(canvas, 0, 0, gw, gh);
  const px = sx.getImageData(0, 0, gw, gh).data;
  const m = new Uint8Array(gw * gh);
  const gx0 = Math.floor(bx0 * gw) - 6, gx1 = Math.ceil(bx1 * gw) + 6, gy0 = Math.floor(by0 * gh) - 6, gy1 = Math.ceil(by1 * gh) + 6;
  for (let y = Math.max(0, gy0); y < Math.min(gh, gy1); y++) {
    for (let x = Math.max(0, gx0); x < Math.min(gw, gx1); x++) {
      const k = (y * gw + x) * 4;
      // Ink = opaque + dark (works for transparent line work and white-backed scans).
      const lum = px[k] * 0.3 + px[k + 1] * 0.59 + px[k + 2] * 0.11;
      m[y * gw + x] = px[k + 3] > 140 && lum < 120 ? 1 : 0;
    }
  }
  // Symbols the furniture replaces (e.g. solid-filled plants) are not walls.
  const [GW, GH] = furnish?.grid ?? [1, 1];
  const gridToWorld = (x, y) => toWorld(x / GW, y / GH);
  const gridRect = ([x0, y0, x1, y1]) => {
    const [ax, ay] = worldToCanvas(...gridToWorld(x0, y0));
    const [bx, by] = worldToCanvas(...gridToWorld(x1, y1));
    return [Math.min(ax, bx), Math.min(ay, by), Math.max(ax, bx), Math.max(ay, by)];
  };
  for (const e of furnish?.erase ?? []) {
    const [a, b, c, d] = gridRect(e).map((v, i) => Math.round(v * (i % 2 ? gh / ch : gw / cw)));
    for (let y = Math.max(0, b); y < Math.min(gh, d); y++) m.fill(0, y * gw + Math.max(0, a), y * gw + Math.min(gw, c));
  }
  // Opening: drop features thinner than ~3 cells (text, dimension and door lines).
  const r = model3d.thin ?? 1;
  const walls = morph(morph(m, gw, gh, r, false), gw, gh, r, true);
  const rects = rectangles(walls, gw, gh);
  const toX = (g) => cx - PW / 2 + (g / gw) * PW;
  const toZ = (g) => cz - PD / 2 + (g / gh) * PD;

  let texCanvas = canvas;
  let furniture = null;
  if (furnish) {
    // Metres per grid unit along the ORIGINAL drawing's x and y.
    const mx = (rot % 2 ? PD : PW) / GW, my = (rot % 2 ? PW : PD) / GH;
    // Furniture: drawing rotation (deg clockwise, 0 = front faces down the
    // drawing) → world Y rotation, plus the drawing's own quarter-turns.
    const items = (furnish.items ?? []).flatMap((it) => (it.t === 'office' ? expandOffice(it, mx, my) : [it])).map((it) => {
      const [X, Z] = gridToWorld(it.x, it.y);
      return { ...it, x: X, z: Z, ry: -THREE.MathUtils.degToRad(it.r ?? 0) + (rot * Math.PI) / 2 };
    });
    furniture = buildFurniture(items);
    furniture.group.position.y = 0.014;
    group.add(furniture.group);

    // Finished floor: base finish over the footprint, then rooms.
    const out = document.createElement('canvas');
    out.width = cw; out.height = ch;
    const ctx = out.getContext('2d');
    const fx0 = bx0 * cw, fy0 = by0 * ch, fx1 = bx1 * cw, fy1 = by1 * ch;
    paintFinish(ctx, furnish.base ?? 'oak', [fx0, fy0, fx1, fy1], kpx, 'y', 1);
    (furnish.rooms ?? []).forEach(([name, ...rc], i) => paintFinish(ctx, name, gridRect(rc), kpx, rc[4] ?? 'y', i + 2));

    // Ambient occlusion along walls, then contact shadows under furniture.
    const skx = cw / gw, sky = ch / gh;
    softLayer(ctx, kpx, 0.07, 2, (x) => {
      x.fillStyle = 'rgba(60,45,30,0.42)';
      x.beginPath();
      for (const [a, b, c, d] of rects) x.rect(a * skx, b * sky, (c - a) * skx, (d - b) * sky);
      x.fill();
    });
    softLayer(ctx, kpx, 0.035, 1, (x) => {
      for (const s of furniture.shadows) {
        const [px0, py0] = worldToCanvas(s.x, s.z);
        const hw = (s.w / 2) * kpm, hd = (s.d / 2) * kpm;
        // world ry turns local x toward -z: on the canvas (z down) that is CCW.
        const c = Math.cos(s.ry), sn = Math.sin(s.ry);
        x.fillStyle = `rgba(45,35,25,${Math.min(0.9, s.a * 2.3)})`;
        x.beginPath();
        if (s.round) x.ellipse(px0, py0, hw, hd, -s.ry, 0, Math.PI * 2);
        else {
          const pt = (lx, lz) => [px0 + lx * c + lz * sn, py0 - lx * sn + lz * c];
          x.moveTo(...pt(-hw, -hd)); x.lineTo(...pt(hw, -hd)); x.lineTo(...pt(hw, hd)); x.lineTo(...pt(-hw, hd)); x.closePath();
        }
        x.fill();
      }
    });

    // The drawing's ink only (light fills dropped), minus what the 3D replaces.
    const ink = document.createElement('canvas');
    ink.width = cw; ink.height = ch;
    const ix = ink.getContext('2d', { willReadFrequently: true });
    ix.drawImage(canvas, 0, 0);
    const im = ix.getImageData(0, 0, cw, ch);
    const d = im.data;
    for (let i = 0; i < d.length; i += 4) {
      if (!d[i + 3]) continue;
      const lum = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
      const sat = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]);
      const k = Math.min(1, Math.max(0, (200 - lum) / 90, (sat - 45) / 60));
      d[i + 3] = d[i + 3] * k;
    }
    ix.putImageData(im, 0, 0);
    for (const e of furnish.erase ?? []) { const [a, b, c, dd] = gridRect(e); ix.clearRect(a, b, c - a, dd - b); }
    ctx.globalAlpha = 0.85;
    ctx.drawImage(ink, 0, 0);
    ctx.globalAlpha = 1;

    // Small room-number tags, upright for the street-side camera.
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const [text, x, y, size] of furnish.tags ?? []) {
      const [tx, ty] = worldToCanvas(...gridToWorld(x, y));
      ctx.font = `600 ${(size ?? 0.26) * kpx}px "Helvetica Neue", Helvetica, Arial, sans-serif`;
      ctx.fillStyle = 'rgba(39,49,61,0.78)';
      ctx.fillText(text, tx, ty);
    }
    texCanvas = out;
  }

  const tex = new THREE.CanvasTexture(texCanvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  tex.generateMipmaps = true;
  const drawing = new THREE.Mesh(
    new THREE.PlaneGeometry(PW, PD),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, color: '#ffffff' }),
  );
  drawing.rotation.x = -Math.PI / 2;
  drawing.position.set(cx, 0.012, cz);
  drawing.renderOrder = 2;
  // Keep the drawing to the footprint (labels and dimensions outside it are dropped).
  drawing.material.clippingPlanes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), W / 2), new THREE.Plane(new THREE.Vector3(-1, 0, 0), W / 2),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), D / 2), new THREE.Plane(new THREE.Vector3(0, 0, -1), D / 2),
  ];
  group.add(drawing);

  const wallH = model3d.wallH ?? (furnish ? furnish.wallH ?? 1.35 : 1.15);
  const wallMesh = new THREE.Mesh(wallGeometry(rects, toX, toZ, wallH, W / 2, D / 2), [
    // Pushed back a hair in depth: where a raised wall happens to share a plane with
    // the model's own window reveals or a piece of furniture, those win cleanly
    // instead of flickering.
    new THREE.MeshStandardMaterial({ color: '#f8f6f1', roughness: 0.95, envMapIntensity: 0.4, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 2 }),
    new THREE.MeshStandardMaterial({ color: '#27313d', roughness: 0.6 }),
  ]);
  // Lit by sun and sky but not shadowed by the (hidden) floors above.
  wallMesh.castShadow = false;
  wallMesh.receiveShadow = false;
  group.add(wallMesh);

  group.userData = {
    wallH, rects: rects.length, furnished: !!furnish, camera: furnish?.camera,
    dispose() {
      tex.dispose();
      furniture?.dispose();
      group.traverse((o) => { o.geometry?.dispose(); [].concat(o.material ?? []).forEach((mm) => mm.dispose()); });
    },
  };
  return group;
}
