// Low-poly furniture and fixtures for the furnished floor-plan cut-aways.
//
// Every item is built from a handful of boxes / cylinders / low-poly blobs,
// then ALL items of a floor are merged into one mesh per material (so a fully
// furnished floor is ~25 draw calls, whatever the number of chairs).
//
// Local frame of an item (metres): x = width, z = depth, y up from the floor.
// An item's "front" (where a person sits / faces it from) is +z. In the plan
// data an item's rotation `r` is in degrees CLOCKWISE in the drawing, with
// r = 0 meaning its front faces DOWN the drawing.
//
//   buildFurniture(items, place) → { group, shadows, dispose }
//     items : [{ t: type, x, y, r, ...params }] (x, y already in world X/Z;
//             r already a world Y rotation in radians) — see floorplan3d.js
//     shadows: [{ x, z, ry, w, d, round, a }] soft contact-shadow footprints
//             in world X/Z, painted into the floor texture by floorplan3d.js
import * as THREE from 'three';

// Neutral modern palette: warm whites, light oak / walnut, charcoal / navy
// upholstery, soft greys and a little green.
const MATS = {
  oak: { color: '#c9a274', roughness: 0.62 },
  oakLight: { color: '#dcc29b', roughness: 0.65 },
  walnut: { color: '#6f4b33', roughness: 0.55 },
  white: { color: '#f4f2ed', roughness: 0.7 },
  offWhite: { color: '#e6e1d6', roughness: 0.8 },
  charcoal: { color: '#3d4148', roughness: 0.95 },
  navy: { color: '#2f3d57', roughness: 0.95 },
  greyFab: { color: '#9a9ea3', roughness: 0.95 },
  sand: { color: '#cdbfa8', roughness: 0.95 },
  mustard: { color: '#c79a45', roughness: 0.9 },
  cognac: { color: '#99633f', roughness: 0.6 },
  sage: { color: '#8a9a88', roughness: 0.9 },
  black: { color: '#26282b', roughness: 0.5, metalness: 0.3 },
  chrome: { color: '#c9cdd1', roughness: 0.25, metalness: 0.85 },
  steel: { color: '#b7bcc0', roughness: 0.35, metalness: 0.7 },
  stone: { color: '#eeece7', roughness: 0.35 },
  marble: { color: '#e9e6e1', roughness: 0.25 },
  porcelain: { color: '#fbfbf9', roughness: 0.2 },
  screen: { color: '#14171b', roughness: 0.2, metalness: 0.4 },
  glass: { color: '#d7ebf0', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.28, depthWrite: false },
  leaf: { color: '#5e8f50', roughness: 0.85, flatShading: true },
  leafDark: { color: '#3f6d40', roughness: 0.85, flatShading: true },
  potLight: { color: '#e8e3da', roughness: 0.8 },
  potDark: { color: '#55524d', roughness: 0.8 },
  felt: { color: '#5f6d6b', roughness: 1 },
  rugSand: { color: '#cfc5b3', roughness: 1 },
  rugSandIn: { color: '#ddd5c6', roughness: 1 },
  rugGrey: { color: '#9aa0a6', roughness: 1 },
  rugGreyIn: { color: '#b1b6bb', roughness: 1 },
  rugNavy: { color: '#46536b', roughness: 1 },
  rugNavyIn: { color: '#5a6780', roughness: 1 },
  concrete: { color: '#d6d3cd', roughness: 0.9 },
  bookA: { color: '#8c3b2f', roughness: 0.9 },
  bookB: { color: '#2f4f6b', roughness: 0.9 },
  bookC: { color: '#d8cfba', roughness: 0.9 },
  bookD: { color: '#4b6b4a', roughness: 0.9 },
  light: { color: '#fff6e0', emissive: '#ffe7b0', emissiveIntensity: 0.6, roughness: 0.5 },
  // Korean-barbecue restaurant (YOON, 8 W 36th St), colours sampled from the
  // restaurant's gallery: butcher-block grill tables, brown leather
  // banquettes, walnut veneer, mauve felt panels, dark marble and granite,
  // reclaimed-wood bar fins, rust-metal lattice, brass rails.
  butcher: { color: '#a8693f', roughness: 0.55 },
  leather: { color: '#4d3127', roughness: 0.5 },
  walnutPanel: { color: '#93603f', roughness: 0.5 },
  walnutDark: { color: '#3e2a20', roughness: 0.6 },
  mauve: { color: '#73606b', roughness: 1 },
  brass: { color: '#b08d55', roughness: 0.3, metalness: 0.8 },
  marbleDark: { color: '#3a3a3f', roughness: 0.3 },
  granite: { color: '#252427', roughness: 0.25, metalness: 0.1 },
  reclaimed: { color: '#76624f', roughness: 0.9 },
  reclaimedB: { color: '#8d7a66', roughness: 0.9 },
  reclaimedC: { color: '#5a4639', roughness: 0.9 },
  rust: { color: '#7a4630', roughness: 0.6, metalness: 0.4 },
  stack: { color: '#4b4b50', roughness: 0.95 },
  stackB: { color: '#66666b', roughness: 0.95 },
  chevronTile: { color: '#dcdcde', roughness: 0.35 },
  seigaiha: { color: '#b3b0aa', roughness: 0.6 },
  seigaihaInk: { color: '#4a4846', roughness: 0.6 },
  grill: { color: '#5d5e63', roughness: 0.45, metalness: 0.45 },
  bottleA: { color: '#3d5a3a', roughness: 0.2, metalness: 0.1 },
  bottleB: { color: '#8a5a2b', roughness: 0.2, metalness: 0.1 },
  bottleC: { color: '#d9dcd4', roughness: 0.15, metalness: 0.1 },
  led: { color: '#ffe2b0', emissive: '#ffcf85', emissiveIntensity: 1.0, roughness: 0.5 },
  linen: { color: '#f3ead8', emissive: '#ffe0a8', emissiveIntensity: 0.55, roughness: 0.8 },
  // Dental / medical suites (Gentle Dental at Mona Lisa Plaza).
  vinylTeal: { color: '#3f8f93', roughness: 0.45 },
  vinylSlate: { color: '#5d6a78', roughness: 0.5 },
  wallCap: { color: '#27313d', roughness: 0.6 },
};

const _m = new THREE.Matrix4(), _l = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3();

// Accumulates transformed, non-indexed primitives per material.
class Kit {
  constructor() {
    this.buckets = new Map();
    this.shadows = [];
    this.item = new THREE.Matrix4();
    this.ix = 0; this.iz = 0; this.iry = 0;
  }
  begin(x, z, ry) {
    this.ix = x; this.iz = z; this.iry = ry;
    this.item.makeRotationY(ry).setPosition(x, 0, z);
  }
  // geo is consumed. Position = centre of the primitive's own bounds unless noted.
  add(mat, geo, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0, sx = 1, sy = 1, sz = 1) {
    _l.compose(_p.set(x, y, z), _q.setFromEuler(_e.set(rx, ry, rz, 'YXZ')), _s.set(sx, sy, sz));
    _m.multiplyMatrices(this.item, _l);
    const g = geo.index ? geo.toNonIndexed() : geo;
    if (g !== geo) geo.dispose();
    g.applyMatrix4(_m);
    if (!this.buckets.has(mat)) this.buckets.set(mat, []);
    this.buckets.get(mat).push(g);
  }
  // Box with its BOTTOM at y.
  box(mat, w, h, d, x, y, z, ry = 0) { this.add(mat, new THREE.BoxGeometry(w, h, d), x, y + h / 2, z, ry); }
  // Vertical cylinder with its bottom at y (rt = top radius, rb = bottom).
  cyl(mat, rt, rb, h, x, y, z, seg = 14, sx = 1, sz = 1) { this.add(mat, new THREE.CylinderGeometry(rt, rb, h, seg), x, y + h / 2, z, 0, 0, 0, sx, 1, sz); }
  // Horizontal rod between two points (thin legs, rails, mic arms).
  rod(mat, r, a, b, seg = 6) {
    const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
    const len = va.distanceTo(vb);
    const g = new THREE.CylinderGeometry(r, r, len, seg);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
    const mid = va.add(vb).multiplyScalar(0.5);
    _l.compose(mid, q, _s.set(1, 1, 1));
    _m.multiplyMatrices(this.item, _l);
    const n = g.toNonIndexed(); g.dispose();
    n.applyMatrix4(_m);
    if (!this.buckets.has(mat)) this.buckets.set(mat, []);
    this.buckets.get(mat).push(n);
  }
  blob(mat, r, x, y, z, sy = 1, detail = 0) { this.add(mat, new THREE.IcosahedronGeometry(r, detail), x, y, z, (x * 7 + z * 3) % 3, 0, 0, 1, sy, 1); }
  // Soft contact shadow under a footprint (local centre, size); a = strength.
  shadow(x, z, w, d, { round = false, a = 0.2, ry = 0 } = {}) {
    const c = Math.cos(this.iry), s = Math.sin(this.iry);
    this.shadows.push({ x: this.ix + x * c + z * s, z: this.iz - x * s + z * c, ry: this.iry + ry, w, d, round, a });
  }
  build() {
    const group = new THREE.Group();
    const mats = [];
    for (const [key, list] of this.buckets) {
      const geo = mergeList(list);
      const mat = new THREE.MeshStandardMaterial({ envMapIntensity: 0.55, ...MATS[key] });
      mats.push(mat);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      mesh.matrixAutoUpdate = false;
      if (key === 'glass') mesh.renderOrder = 4;
      group.add(mesh);
    }
    return { group, mats };
  }
}

function mergeList(list) {
  let n = 0;
  for (const g of list) n += g.attributes.position.count;
  const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3);
  let o = 0;
  for (const g of list) {
    pos.set(g.attributes.position.array, o * 3);
    nor.set(g.attributes.normal.array, o * 3);
    o += g.attributes.position.count;
    g.dispose();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  geo.computeBoundingSphere();
  return geo;
}

// ---------------------------------------------------------------- seating
// Office task chair, facing +z, centred on its seat.
function taskChair(k, x, z, ry, fab = 'charcoal') {
  const c = Math.cos(ry), s = Math.sin(ry);
  const L = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  k.cyl('black', 0.3, 0.3, 0.035, x, 0.04, z, 5);
  k.cyl('chrome', 0.025, 0.025, 0.36, x, 0.07, z, 6);
  k.add(fab, new THREE.BoxGeometry(0.48, 0.08, 0.46), x, 0.47, z, ry);
  const [bx, bz] = L(0, -0.24);
  k.add(fab, new THREE.BoxGeometry(0.44, 0.48, 0.07), bx, 0.8, bz, ry, -0.12);
  for (const sx of [-0.26, 0.26]) { const [ax, az] = L(sx, -0.02); k.add('black', new THREE.BoxGeometry(0.04, 0.04, 0.3), ax, 0.66, az, ry); }
  k.shadow(x, z, 0.55, 0.55, { round: true, a: 0.16 });
}
// Upholstered boardroom chair on a chrome base, facing +z.
function boardChair(k, x, z, ry, fab = 'charcoal') {
  const c = Math.cos(ry), s = Math.sin(ry);
  const L = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  k.cyl('chrome', 0.28, 0.28, 0.025, x, 0.035, z, 5);
  k.cyl('chrome', 0.025, 0.025, 0.38, x, 0.06, z, 6);
  k.add(fab, new THREE.BoxGeometry(0.52, 0.1, 0.5), x, 0.48, z, ry);
  const [bx, bz] = L(0, -0.25);
  k.add(fab, new THREE.BoxGeometry(0.5, 0.52, 0.08), bx, 0.83, bz, ry, -0.1);
  for (const sx of [-0.27, 0.27]) { const [ax, az] = L(sx, -0.03); k.add('chrome', new THREE.BoxGeometry(0.03, 0.03, 0.36), ax, 0.68, az, ry); }
  k.shadow(x, z, 0.58, 0.58, { round: true, a: 0.16 });
}
// Moulded shell chair on four wood legs (café / kitchen), facing +z.
function shellChair(k, x, z, ry, fab = 'white') {
  const c = Math.cos(ry), s = Math.sin(ry);
  const L = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  for (const [lx, lz] of [[-0.18, -0.17], [0.18, -0.17], [-0.18, 0.17], [0.18, 0.17]]) {
    const [a, b] = L(lx, lz), [a2, b2] = L(lx * 0.75, lz * 0.75);
    k.rod('oak', 0.014, [a, 0, b], [a2, 0.44, b2]);
  }
  k.add(fab, new THREE.BoxGeometry(0.44, 0.05, 0.42), x, 0.47, z, ry);
  const [bx, bz] = L(0, -0.21);
  k.add(fab, new THREE.BoxGeometry(0.44, 0.32, 0.05), bx, 0.66, bz, ry, -0.18);
  k.shadow(x, z, 0.48, 0.48, { round: true, a: 0.12 });
}
// Bar stool (round seat on a black pedestal).
function stool(k, x, z, h = 0.76, seat = 'oak') {
  k.cyl('black', 0.2, 0.2, 0.02, x, 0, z, 12);
  k.cyl('black', 0.025, 0.025, h - 0.05, x, 0.02, z, 6);
  k.cyl('black', 0.16, 0.16, 0.015, x, h * 0.4, z, 12);
  k.cyl(seat, 0.18, 0.17, 0.05, x, h - 0.05, z, 14);
  k.shadow(x, z, 0.42, 0.42, { round: true, a: 0.12 });
}

const sofa = (k, p) => {
  const n = p.seats ?? 3, fab = p.fab ?? 'charcoal';
  const sw = p.seatW ?? 0.68, arm = 0.16, d = p.d ?? 0.9;
  const w = p.w ?? n * sw + arm * 2;
  const iw = w - arm * 2, cw = iw / n;
  k.box('black', w - 0.1, 0.08, d - 0.1, 0, 0, 0);
  k.box(fab, w, 0.24, d, 0, 0.08, 0);
  for (let i = 0; i < n; i++) {
    const cx = -iw / 2 + cw * (i + 0.5);
    k.box(fab, cw - 0.03, 0.13, d - 0.27, cx, 0.32, 0.1);
    k.add(fab, new THREE.BoxGeometry(cw - 0.04, 0.42, 0.2), cx, 0.6, -d / 2 + 0.2, 0, -0.16);
  }
  k.box(fab, w, 0.5, 0.16, 0, 0.32, -d / 2 + 0.08);
  for (const s of [-1, 1]) k.box(fab, arm, 0.36, d, s * (w / 2 - arm / 2), 0.32, 0);
  // Two accent cushions.
  if (p.pillows !== false) for (const s of [-1, 1]) k.add(p.pillow ?? 'sand', new THREE.BoxGeometry(0.4, 0.36, 0.12), s * (iw / 2 - 0.3), 0.62, -d / 2 + 0.36, s * 0.2, -0.25);
  k.shadow(0, 0, w + 0.1, d + 0.1, { a: 0.26 });
};
// L-shaped sectional: a sofa of `w` plus a chaise of depth `l` on side `side` (-1 left, +1 right).
const sofaL = (k, p) => {
  const w = p.w ?? 2.6, l = p.l ?? 1.7, side = p.side ?? 1, fab = p.fab ?? 'charcoal', d = 0.9;
  sofa(k, { seats: 3, w, fab, pillows: true, pillow: p.pillow });
  const cx = side * (w / 2 - d / 2);
  k.box(fab, d, 0.32, l - d, cx, 0, d / 2 + (l - d) / 2);
  k.box(fab, d - 0.18, 0.13, l - d - 0.08, cx - side * 0.07, 0.32, d / 2 + (l - d) / 2 - 0.04);
  k.box(fab, 0.16, 0.36, l - d, side * (w / 2 - 0.08), 0.32, d / 2 + (l - d) / 2);
  k.shadow(cx, d / 2 + (l - d) / 2, d, l - d, { a: 0.24 });
};
const armchair = (k, p) => {
  const fab = p.fab ?? 'cognac';
  k.box('black', 0.62, 0.1, 0.62, 0, 0, 0);
  k.box(fab, 0.78, 0.3, 0.8, 0, 0.1, 0);
  k.box(fab, 0.5, 0.12, 0.56, 0, 0.4, 0.08);
  k.add(fab, new THREE.BoxGeometry(0.74, 0.48, 0.16), 0, 0.62, -0.32, 0, -0.14);
  for (const s of [-1, 1]) k.box(fab, 0.13, 0.3, 0.74, s * 0.32, 0.4, 0.02);
  k.shadow(0, 0, 0.86, 0.86, { a: 0.24 });
};
const pouf = (k, p) => { k.cyl(p.fab ?? 'mustard', 0.24, 0.26, 0.42, 0, 0, 0, 16); k.shadow(0, 0, 0.55, 0.55, { round: true, a: 0.2 }); };

// ---------------------------------------------------------------- tables
const legs4 = (k, mat, w, d, h, inset = 0.06, t = 0.045) => {
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.box(mat, t, h, t, sx * (w / 2 - inset), 0, sz * (d / 2 - inset));
};
const coffeeTable = (k, p) => {
  const w = p.w ?? 1.1, d = p.d ?? 0.6, top = p.top ?? 'walnut';
  if (p.round) {
    k.cyl(top, w / 2, w / 2, 0.04, 0, 0.36, 0, 24, 1, d / w);
    k.cyl('black', 0.05, 0.05, 0.36, 0, 0, 0, 8);
    k.cyl('black', w * 0.25, w * 0.25, 0.02, 0, 0, 0, 16, 1, d / w);
  } else {
    k.box(top, w, 0.04, d, 0, 0.36, 0);
    k.box(top, w - 0.1, 0.03, d - 0.1, 0, 0.1, 0);
    legs4(k, 'black', w, d, 0.36, 0.04, 0.035);
  }
  k.shadow(0, 0, w, d, { round: !!p.round, a: 0.22 });
};
const sideTable = (k, p) => {
  k.cyl(p.top ?? 'marble', 0.24, 0.24, 0.03, 0, 0.52, 0, 18);
  k.cyl('black', 0.025, 0.025, 0.52, 0, 0, 0, 6);
  k.cyl('black', 0.16, 0.16, 0.02, 0, 0, 0, 14);
  if (p.lamp) { k.cyl('chrome', 0.012, 0.012, 0.3, 0, 0.55, 0, 6); k.cyl('light', 0.08, 0.13, 0.17, 0, 0.82, 0, 14); }
  k.shadow(0, 0, 0.5, 0.5, { round: true, a: 0.15 });
};
const rug = (k, p) => {
  const w = p.w ?? 2.4, d = p.d ?? 1.7, c = p.color ?? 'Sand';
  if (p.round) { k.cyl('rug' + c, w / 2, w / 2, 0.012, 0, 0, 0, 32, 1, d / w); k.cyl('rug' + c + 'In', w / 2 - 0.12, w / 2 - 0.12, 0.02, 0, 0, 0, 32, 1, (d - 0.24) / (w - 0.24)); return; }
  k.box('rug' + c, w, 0.012, d, 0, 0, 0);
  k.box('rug' + c + 'In', w - 0.24, 0.02, d - 0.24, 0, 0, 0);
};

// Meeting table with chairs around it. shape 'rect' | 'oval' | 'round'.
const confTable = (k, p) => {
  const shape = p.shape ?? 'rect';
  const w = p.w ?? 2.4, d = p.d ?? 1.1, top = p.top ?? 'walnut', seats = p.seats ?? 6, fab = p.fab ?? 'charcoal';
  const chair = p.chair === 'task' ? taskChair : p.chair === 'shell' ? shellChair : boardChair;
  if (shape === 'rect') {
    k.box(top, w, 0.045, d, 0, 0.71, 0);
    const pw = Math.min(0.7, w * 0.2);
    for (const s of w > 1.8 ? [-1, 1] : [0]) k.box('black', 0.06, 0.71, d * 0.6, s * (w / 2 - pw), 0, 0);
    if (w > 1.8) k.box('black', w - pw * 2, 0.06, 0.06, 0, 0.62, 0);
    k.shadow(0, 0, w, d, { a: 0.24 });
    const ends = p.ends ?? (seats >= 6 && w / d > 1.6 ? 2 : 0);
    const side = seats - ends;
    const top2 = Math.ceil(side / 2), bot = side - top2;
    const row = (n, z, ry) => { for (let i = 0; i < n; i++) chair(k, -w / 2 + (w / n) * (i + 0.5), z, ry, fab); };
    row(top2, -d / 2 - 0.28, 0);
    row(bot, d / 2 + 0.28, Math.PI);
    if (ends >= 1) chair(k, -w / 2 - 0.3, 0, Math.PI / 2, fab);
    if (ends >= 2) chair(k, w / 2 + 0.3, 0, -Math.PI / 2, fab);
  } else {
    // Oval / racetrack or round: a scaled cylinder on a central pedestal.
    k.cyl(top, w / 2, w / 2, 0.045, 0, 0.71, 0, 40, 1, d / w);
    k.cyl('black', 0.12, 0.12, 0.71, -w * 0.18, 0, 0, 10);
    if (shape !== 'round') k.cyl('black', 0.12, 0.12, 0.71, w * 0.18, 0, 0, 10);
    k.cyl('black', w * 0.18, w * 0.18, 0.02, 0, 0, 0, 20, 1, 0.5);
    k.shadow(0, 0, w, d, { round: true, a: 0.24 });
    const a0 = p.a0 ?? 0;
    for (let i = 0; i < seats; i++) {
      const a = a0 + (i / seats) * Math.PI * 2;
      const cx = Math.cos(a) * (w / 2 + 0.3), cz = Math.sin(a) * (d / 2 + 0.3);
      // Face the table centre.
      chair(k, cx, cz, Math.atan2(-cx, -cz), fab);
    }
  }
};
const highTable = (k, p) => {
  const w = p.w ?? 1.8, d = p.d ?? 0.8, n = p.stools ?? 3;
  k.box(p.top ?? 'oak', w, 0.05, d, 0, 1.0, 0);
  for (const s of [-1, 1]) { k.box('black', 0.06, 1.0, 0.06, s * (w / 2 - 0.15), 0, 0); k.box('black', 0.06, 0.04, d - 0.15, s * (w / 2 - 0.15), 0, 0); }
  k.box('black', w - 0.3, 0.04, 0.04, 0, 0.3, 0);
  k.shadow(0, 0, w, d, { a: 0.2 });
  for (const sz of p.oneSide ? [1] : [-1, 1]) for (let i = 0; i < n; i++) stool(k, -w / 2 + (w / n) * (i + 0.5), sz * (d / 2 + 0.22));
};
const cafeTable = (k, p) => {
  const r = p.r ?? 0.42, n = p.chairs ?? 4;
  k.cyl(p.top ?? 'marble', r, r, 0.035, 0, 0.72, 0, 24);
  k.cyl('black', 0.035, 0.035, 0.72, 0, 0, 0, 8);
  k.cyl('black', 0.22, 0.22, 0.02, 0, 0, 0, 14);
  k.shadow(0, 0, r * 2, r * 2, { round: true, a: 0.2 });
  const a0 = p.a0 ?? Math.PI / 4;
  for (let i = 0; i < n; i++) {
    const a = a0 + (i / n) * Math.PI * 2;
    const cx = Math.cos(a) * (r + 0.26), cz = Math.sin(a) * (r + 0.26);
    shellChair(k, cx, cz, Math.atan2(-cx, -cz), p.fab ?? 'white');
  }
};

// ---------------------------------------------------------------- work
const monitor = (k, x, z, ry = 0, w = 0.6) => {
  k.add('screen', new THREE.BoxGeometry(w, w * 0.56, 0.025), x, 1.05, z, ry);
  k.add('black', new THREE.BoxGeometry(0.05, 0.25, 0.04), x - Math.sin(ry) * 0.04, 0.85, z - Math.cos(ry) * 0.04, ry);
  k.add('black', new THREE.BoxGeometry(0.22, 0.015, 0.18), x - Math.sin(ry) * 0.04, 0.758, z - Math.cos(ry) * 0.04, ry); // foot on the desk top (0.75)
};
// A desk (front = +z, where the chair is). w/d in metres.
function deskAt(k, x, z, ry, p = {}) {
  const w = p.w ?? 1.4, d = p.d ?? 0.7, top = p.top ?? 'oakLight';
  const c = Math.cos(ry), s = Math.sin(ry);
  const L = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  k.add(top, new THREE.BoxGeometry(w, 0.03, d), x, 0.735, z, ry);
  for (const sx of [-1, 1]) { const [lx, lz] = L(sx * (w / 2 - 0.05), 0); k.add('white', new THREE.BoxGeometry(0.04, 0.72, d - 0.08), lx, 0.36, lz, ry); }
  const [mx, mz] = L(0, -d / 2 + 0.06); k.add('white', new THREE.BoxGeometry(w - 0.14, 0.3, 0.02), mx, 0.56, mz, ry);
  if (p.monitor !== false) { const [sx2, sz2] = L(p.mx ?? 0, -d / 2 + 0.16); monitor(k, sx2, sz2, ry, Math.min(0.6, w * 0.42)); }
  if (p.ped !== false && w >= 1.2) { const [px, pz] = L(w / 2 - 0.28, -0.02); k.add('white', new THREE.BoxGeometry(0.4, 0.58, 0.5), px, 0.29, pz, ry); }
  k.shadow(x, z, w, d, { a: 0.2, ry });
  if (p.chair !== false) { const [cx, cz] = L(-0.05, d / 2 + 0.28); taskChair(k, cx, cz, ry + Math.PI, p.fab ?? 'charcoal'); }
}
const desk = (k, p) => deskAt(k, 0, 0, 0, p);
// A row of n desks side by side; `double` = benching, two rows back to back
// with a low screen between (chairs on both sides).
const desks = (k, p) => {
  const n = p.n ?? 2, w = p.w ?? 1.4, d = p.d ?? 0.7;
  for (let i = 0; i < n; i++) {
    const x = -((n - 1) * w) / 2 + i * w;
    if (p.double) {
      deskAt(k, x, d / 2, 0, { ...p, w, d });
      deskAt(k, x, -d / 2, Math.PI, { ...p, w, d });
    } else deskAt(k, x, 0, 0, { ...p, w, d });
  }
  if (p.double) k.box('felt', n * w - 0.05, 0.38, 0.03, 0, 0.75, 0);
  if (p.double) for (const s of [-1, 1]) k.box('white', 0.05, 0.036, d * 2 - 0.04, s * (n * w / 2 - 0.03), 0.72, 0); // end caps stand 6 mm proud of the desk tops (no z-fight)
};
// Reception / podcast desk on an arc. Centre of the arc at local origin,
// desk spans `span` radians centred on +z (customer side = outside).
const arcDesk = (k, p, { podcast = false } = {}) => {
  const R = p.R ?? 1.2, span = p.span ?? 1.6, deep = p.deep ?? 0.6, n = Math.max(6, Math.round(span * 7));
  const h = p.h ?? (podcast ? 0.74 : 1.05);
  for (let i = 0; i < n; i++) {
    const a = -span / 2 + (span * (i + 0.5)) / n;
    const seg = (span / n) * R * 1.04;
    const cx = Math.sin(a) * R, cz = Math.cos(a) * R;
    // outer panel and worktop segment
    k.add(podcast ? 'walnut' : 'white', new THREE.BoxGeometry(seg + 0.01, h, 0.05), cx, h / 2, cz, a);
    const ti = R - deep / 2;
    k.add(podcast ? 'walnut' : 'oak', new THREE.BoxGeometry((span / n) * (R - deep / 2) * 1.08, 0.04, deep), Math.sin(a) * ti, (podcast ? h : 0.74), Math.cos(a) * ti, a);
    if (!podcast) k.add('oak', new THREE.BoxGeometry(seg + 0.02, 0.035, 0.3), Math.sin(a) * (R + 0.08), h, Math.cos(a) * (R + 0.08), a);
  }
  k.shadow(0, R - deep / 2, R * span, deep + 0.2, { a: 0.2 });
  if (podcast) {
    // Mics on boom arms, and a monitor.
    for (const a of [-span * 0.3, span * 0.3]) {
      const mx = Math.sin(a) * (R - 0.2), mz = Math.cos(a) * (R - 0.2);
      k.cyl('black', 0.06, 0.06, 0.02, Math.sin(a) * (R - 0.08), h + 0.02, Math.cos(a) * (R - 0.08), 10);
      k.rod('black', 0.01, [Math.sin(a) * (R - 0.08), h + 0.03, Math.cos(a) * (R - 0.08)], [Math.sin(a) * (R - 0.08), h + 0.32, Math.cos(a) * (R - 0.08)]);
      k.rod('black', 0.01, [Math.sin(a) * (R - 0.08), h + 0.32, Math.cos(a) * (R - 0.08)], [mx, h + 0.25, mz]);
      k.cyl('black', 0.03, 0.03, 0.13, mx, h + 0.15, mz, 10);
    }
    monitor(k, 0, R - 0.12, Math.PI, 0.5);
  } else monitor(k, Math.sin(0.25) * (R - 0.2), Math.cos(0.25) * (R - 0.2), Math.PI + 0.25, 0.5);
  taskChair(k, 0, R - deep - 0.35, 0, p.fab ?? 'charcoal');
  if (podcast) for (const a of p.guests ?? []) boardChair(k, Math.sin(a) * (R + 0.45), Math.cos(a) * (R + 0.45), a + Math.PI, 'navy');
};
const reception = (k, p) => arcDesk(k, p);
const podcast = (k, p) => arcDesk(k, p, { podcast: true });

// Glass-fronted phone booth / focus pod (front = +z glass door).
const booth = (k, p) => {
  const w = p.w ?? 1.1, d = p.d ?? 1.1, h = p.h ?? 1.55, t = 0.06;
  // (base, glass and the front frame are inset a few mm so no faces are coplanar)
  k.box('concrete', w - 0.012, 0.05, d - 0.012, 0, 0, 0);
  k.box('white', t, h, d, -w / 2 + t / 2, 0, 0);
  k.box('white', t, h, d, w / 2 - t / 2, 0, 0);
  k.box('white', w, h, t, 0, 0, -d / 2 + t / 2);
  // acoustic felt lining on the inside of the back and side walls
  k.box('felt', w - 2 * t, h - 0.2, 0.02, 0, 0.12, -d / 2 + t + 0.01);
  k.box('felt', 0.02, h - 0.2, d - 2 * t, -w / 2 + t + 0.01, 0.12, 0);
  k.box('felt', 0.02, h - 0.2, d - 2 * t, w / 2 - t - 0.01, 0.12, 0);
  k.box('glass', w - 2 * t - 0.012, h - 0.09, 0.016, 0, 0.05, d / 2 - 0.02);
  k.box('black', w - 2 * t, 0.04, 0.05, 0, h - 0.04, d / 2 - 0.025);
  k.box('black', 0.03, h, 0.05, -w / 2 + t + 0.015, 0, d / 2 - 0.025);
  k.box('black', 0.03, h, 0.05, w / 2 - t - 0.015, 0, d / 2 - 0.025);
  k.box('oak', w - 2 * t - 0.04, 0.035, 0.35, 0, 0.98, -d / 2 + t + 0.18);
  stool(k, 0, 0.12, 0.7, 'navy');
  k.shadow(0, 0, w + 0.08, d + 0.08, { a: 0.3 });
};

// ---------------------------------------------------------------- storage / AV
const credenza = (k, p) => {
  const w = p.w ?? 1.6, d = p.d ?? 0.45, h = p.h ?? 0.7, top = p.top ?? 'walnut';
  k.box(top, w, h - 0.12, d, 0, 0.12, 0);
  legs4(k, 'black', w, d, 0.12, 0.05, 0.03);
  for (let i = 1; i < Math.round(w / 0.45); i++) k.box('black', 0.008, h - 0.18, 0.005, -w / 2 + (w / Math.round(w / 0.45)) * i, 0.15, d / 2 + 0.002);
  k.shadow(0, 0, w, d, { a: 0.2 });
};
const shelf = (k, p) => {
  const w = p.w ?? 1.6, d = p.d ?? 0.38, h = p.h ?? 1.2, n = p.levels ?? 4, top = p.top ?? 'oak';
  for (const s of [-1, 1]) k.box(top, 0.03, h, d, s * (w / 2 - 0.015), 0, 0);
  k.box(top, w, 0.02, 0.02, 0, 0, -d / 2 + 0.01);
  k.box(top, w - 0.06, h - 0.02, 0.012, 0, 0.01, -d / 2 + 0.006);
  const books = ['bookA', 'bookB', 'bookC', 'bookD', 'offWhite'];
  for (let i = 0; i < n; i++) {
    const y = (h / n) * i;
    k.box(top, w - 0.06, 0.025, d, 0, y, 0);
    // a few books / boxes on each shelf
    let x = -w / 2 + 0.06 + ((i * 0.37) % 0.3);
    let j = i;
    while (x < w / 2 - 0.25) {
      const bw = 0.03 + ((j * 13) % 5) * 0.012, run = 4 + (j % 5);
      for (let b = 0; b < run && x < w / 2 - 0.08; b++) {
        const bh = Math.min(h / n - 0.06, 0.2 + ((j * 7 + b * 3) % 6) * 0.025);
        k.box(books[(j + b) % books.length], bw, bh, d * 0.7, x, y + 0.025, 0.01);
        x += bw + 0.004;
      }
      x += 0.18 + ((j * 11) % 4) * 0.08;
      j++;
    }
  }
  k.shadow(0, 0, w, d, { a: 0.2 });
};
// Wall screen on a low media console (front = +z).
const tv = (k, p) => {
  const w = p.w ?? 1.4;
  const y = p.console !== false ? 0.62 : 0.42;
  if (p.console !== false) credenza(k, { w: w + 0.3, d: 0.42, h: 0.5, top: p.top ?? 'walnut' });
  k.box('screen', w, w * 0.56, 0.04, 0, y, -0.14);
  k.box('black', w + 0.02, 0.02, 0.05, 0, y - 0.01, -0.14);
};
const whiteboard = (k, p) => {
  const w = p.w ?? 1.6;
  k.box('porcelain', w, 0.9, 0.03, 0, 0.45, 0);
  k.box('steel', w + 0.04, 0.02, 0.06, 0, 0.44, 0.02);
};

// ---------------------------------------------------------------- kitchen / wet
// Run of base cabinets with a stone counter (front = +z). sink: offset along w
// (or null), fridge: 'left' | 'right' | null, coffee machine on the counter.
const kitchen = (k, p) => {
  const w = p.w ?? 3, d = p.d ?? 0.62, fr = p.fridge ? 0.75 : 0;
  const x0 = p.fridge === 'left' ? -w / 2 + fr : -w / 2, x1 = p.fridge === 'right' ? w / 2 - fr : w / 2;
  const cw = x1 - x0, cx = (x0 + x1) / 2;
  k.box('black', cw - 0.02, 0.1, d - 0.08, cx, 0, -0.04);
  k.box(p.cab ?? 'white', cw, 0.76, d - 0.04, cx, 0.1, -0.02);
  k.box('stone', cw + 0.02, 0.04, d + 0.02, cx, 0.86, 0);
  const n = Math.max(1, Math.round(cw / 0.6));
  for (let i = 0; i < n; i++) {
    const x = x0 + (cw / n) * (i + 0.5);
    k.box('chrome', 0.18, 0.015, 0.02, x, 0.78, d / 2 - 0.01);
    if (i) k.box('black', 0.006, 0.7, 0.006, x0 + (cw / n) * i, 0.12, d / 2 - 0.02);
  }
  if (p.sink !== null) {
    const sx = cx + (p.sink ?? 0);
    k.box('steel', 0.6, 0.012, 0.42, sx, 0.9, 0.02);
    k.box('screen', 0.5, 0.01, 0.34, sx, 0.905, 0.02);
    k.rod('chrome', 0.014, [sx, 0.9, -d / 2 + 0.08], [sx, 1.2, -d / 2 + 0.08]);
    k.rod('chrome', 0.012, [sx, 1.2, -d / 2 + 0.08], [sx, 1.17, -d / 2 + 0.26]);
  }
  if (p.coffee !== false) {
    const xx = p.sink != null && p.sink > 0 ? x0 + 0.35 : x1 - 0.35;
    k.box('black', 0.3, 0.38, 0.38, xx, 0.9, -0.06);
    k.box('steel', 0.22, 0.04, 0.12, xx, 1.2, 0.1);
  }
  if (p.fridge) {
    const fx = p.fridge === 'left' ? -w / 2 + fr / 2 : w / 2 - fr / 2;
    k.box('steel', fr - 0.03, 1.72, d, fx, 0, 0);
    k.box('black', 0.02, 0.6, 0.03, fx + (p.fridge === 'left' ? fr / 2 - 0.1 : -fr / 2 + 0.1), 0.9, d / 2 + 0.01);
  }
  k.shadow(0, 0, w, d, { a: 0.25 });
};
const island = (k, p) => {
  const w = p.w ?? 2.2, d = p.d ?? 0.9;
  k.box('black', w - 0.1, 0.1, d - 0.3, 0, 0, -0.1);
  k.box(p.cab ?? 'sage', w - 0.05, 0.8, d - 0.25, 0, 0.1, -0.1);
  k.box('stone', w + 0.05, 0.05, d + 0.05, 0, 0.9, 0);
  k.shadow(0, 0, w, d, { a: 0.25 });
  for (let i = 0; i < (p.stools ?? 3); i++) stool(k, -w / 2 + (w / (p.stools ?? 3)) * (i + 0.5), d / 2 + 0.25, 0.72);
};
const toilet = (k) => {
  k.box('porcelain', 0.38, 0.38, 0.17, 0, 0.4, -0.25);
  k.cyl('porcelain', 0.17, 0.13, 0.38, 0, 0, 0.05, 14, 1, 1.25);
  k.cyl('white', 0.18, 0.18, 0.03, 0, 0.38, 0.06, 14, 1, 1.25);
  k.shadow(0, -0.05, 0.42, 0.65, { round: true, a: 0.18 });
};
const vanity = (k, p) => {
  const w = p.w ?? 0.6, n = p.sinks ?? 1;
  k.box('stone', w, 0.05, 0.5, 0, 0.8, 0);
  k.box(p.cab ?? 'walnut', w - 0.04, 0.4, 0.46, 0, 0.4, -0.01);
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (w / n) * (i + 0.5);
    k.cyl('porcelain', 0.17, 0.15, 0.06, x, 0.85, 0.02, 16);
    k.rod('chrome', 0.012, [x, 0.85, -0.2], [x, 1.03, -0.2]);
    k.rod('chrome', 0.01, [x, 1.03, -0.2], [x, 1.0, -0.08]);
  }
  k.shadow(0, 0, w, 0.5, { a: 0.18 });
};

// ---------------------------------------------------------------- plants
const plant = (k, p) => {
  const size = p.size ?? 'tall';
  if (size === 'small') {
    k.cyl(p.pot ?? 'potLight', 0.13, 0.1, 0.24, 0, 0, 0, 12);
    k.blob('leaf', 0.18, 0, 0.36, 0, 0.9);
    k.blob('leafDark', 0.13, 0.08, 0.45, -0.05, 1);
    k.shadow(0, 0, 0.36, 0.36, { round: true, a: 0.2 });
    return;
  }
  if (size === 'bush') {
    k.cyl(p.pot ?? 'potDark', 0.24, 0.2, 0.4, 0, 0, 0, 14);
    k.blob('leafDark', 0.36, 0, 0.62, 0, 0.8);
    k.blob('leaf', 0.27, 0.16, 0.8, 0.1, 1);
    k.blob('leaf', 0.24, -0.18, 0.74, -0.08, 1);
    k.blob('leafDark', 0.2, 0.02, 0.92, -0.18, 1);
    k.shadow(0, 0, 0.75, 0.75, { round: true, a: 0.22 });
    return;
  }
  // tall: fiddle-leaf / olive style
  k.cyl(p.pot ?? 'potLight', 0.21, 0.17, 0.42, 0, 0, 0, 14);
  k.cyl('concrete', 0.19, 0.19, 0.018, 0, 0.41, 0, 14); // soil 8 mm above the rim, not flush with the pot top
  k.rod('walnut', 0.025, [0, 0.42, 0], [0.04, 1.0, 0.02]);
  k.blob('leaf', 0.3, 0.02, 1.08, 0, 1.1);
  k.blob('leafDark', 0.24, 0.17, 1.28, 0.08, 1.1);
  k.blob('leaf', 0.22, -0.14, 1.35, -0.1, 1.1);
  k.blob('leafDark', 0.18, 0.06, 1.5, -0.04, 1.1);
  k.blob('leafDark', 0.2, -0.12, 0.92, 0.14, 1);
  k.shadow(0, 0, 0.7, 0.7, { round: true, a: 0.2 });
};
const planter = (k, p) => {
  const w = p.w ?? 1.6, d = p.d ?? 0.4;
  k.box('potDark', w, 0.55, d, 0, 0, 0);
  const n = Math.max(2, Math.round(w / 0.4));
  for (let i = 0; i < n; i++) k.blob(i % 2 ? 'leaf' : 'leafDark', 0.24, -w / 2 + (w / n) * (i + 0.5), 0.7 + (i % 2) * 0.08, 0, 0.8);
  k.shadow(0, 0, w, d, { a: 0.22 });
};

// ---------------------------------------------------------------- building
// Elevator doors set in the core wall (front = corridor side, +z).
const elevator = (k, p) => {
  const w = p.w ?? 1.1, h = p.h ?? 1.32;
  k.box('steel', w + 0.3, h, 0.06, 0, 0, 0);
  k.box('chrome', w / 2 - 0.01, h - 0.08, 0.03, -w / 4, 0, 0.04);
  k.box('chrome', w / 2 - 0.01, h - 0.08, 0.03, w / 4, 0, 0.04);
  k.box('black', 0.01, h - 0.09, 0.035, 0, 0, 0.045); // a hair lower than the leaves (no shared top face)
  k.box('screen', 0.06, 0.12, 0.02, w / 2 + 0.22, 1.0, 0.04);
  k.box('steel', w + 0.4, 0.01, 0.4, 0, 0, 0.22);
};
// A stair: `n` steps rising along -z within w × d (two flights side by side
// when `flights` = 2, with a landing at the far end). Capped at `top`.
const stair = (k, p) => {
  const w = p.w ?? 1.2, d = p.d ?? 3, flights = p.flights ?? 1, top = p.top ?? 1.25;
  const fw = flights === 2 ? w / 2 - 0.05 : w;
  const n = p.steps ?? Math.max(5, Math.round((d - (flights === 2 ? 1.1 : 0)) / 0.28));
  const run = (d - (flights === 2 ? 1.0 : 0)) / n;
  const rise = top / n;
  const fx = flights === 2 ? [-w / 4, w / 4] : [0];
  fx.forEach((x, f) => {
    for (let i = 0; i < n; i++) {
      // both flights climb away from the near end (-z) to the landing.
      const hh = rise * (i + 1);
      k.box('concrete', fw, hh, run + 0.005, x, 0, d / 2 - run * (i + 0.5));
      k.box('black', fw, 0.012, 0.03, x, hh, d / 2 - run * i - 0.015);
    }
  });
  if (flights === 2) {
    k.box('concrete', w, top, 0.95, 0, 0, -d / 2 + 0.475);
    k.box('white', 0.06, top + 0.05, d - 0.96, 0, 0, 0.47); // ends 1 cm short of the first riser
    k.rod('black', 0.02, [0, top + 0.12, d / 2], [0, top + 0.12, -d / 2 + 0.95]);
  }
  k.shadow(0, 0, w, d, { a: 0.12 });
};
// Door leaf (hinge at local origin, leaf along +x, opened `open` degrees towards +z).
const door = (k, p) => {
  const w = p.w ?? 0.9, a = THREE.MathUtils.degToRad(p.open ?? 90) * (p.flip ? -1 : 1);
  k.add(p.mat ?? 'oakLight', new THREE.BoxGeometry(w, p.h ?? 1.32, 0.04), Math.cos(a) * w / 2, (p.h ?? 1.32) / 2, Math.sin(a) * w / 2, -a);
};
// Freestanding partition / glass wall segment along x.
const glassWall = (k, p) => {
  const w = p.w ?? 3, h = p.h ?? 1.32;
  // (glass a few mm inside the frame, so no faces are shared)
  k.box('glass', w - 0.012, h - 0.036, 0.02, 0, 0.03, 0);
  k.box('black', w, 0.03, 0.05, 0, h - 0.03, 0);
  k.box('black', w, 0.03, 0.05, 0, 0, 0);
  const n = Math.max(1, Math.round(w / 1.2));
  for (let i = 0; i <= n; i++) k.box('black', 0.03, h, 0.05, -w / 2 + (w / n) * i, 0, 0);
};
const lockers = (k, p) => {
  const w = p.w ?? 1.8, n = Math.round(w / 0.4);
  k.box('offWhite', w, 1.2, 0.5, 0, 0, 0);
  for (let i = 1; i < n; i++) k.box('black', 0.006, 1.16, 0.006, -w / 2 + (w / n) * i, 0.02, 0.252);
  k.shadow(0, 0, w, 0.5, { a: 0.2 });
};
const printer = (k) => { k.box('offWhite', 0.6, 0.9, 0.55, 0, 0, 0); k.box('screen', 0.5, 0.02, 0.4, 0, 0.9, 0); k.shadow(0, 0, 0.6, 0.55, { a: 0.2 }); };

// Podcast mic on a desk stand (on a table top at height h) with headphones.
const mic = (k, p) => {
  const h = p.h ?? 0.755;
  k.cyl('black', 0.07, 0.07, 0.015, 0, h, 0, 12);
  k.rod('black', 0.01, [0, h, 0], [0, h + 0.2, 0]);
  k.rod('black', 0.01, [0, h + 0.2, 0], [0, h + 0.24, 0.14]);
  k.add('black', new THREE.CylinderGeometry(0.03, 0.03, 0.14, 10), 0, h + 0.24, 0.17, 0, Math.PI / 2 - 0.4);
  k.box('charcoal', 0.16, 0.05, 0.12, 0.2, h, 0.02);
};
// Acoustic felt panels on a wall (front = +z).
const panels = (k, p) => {
  const w = p.w ?? 2, n = p.n ?? Math.max(2, Math.round(w / 0.6));
  for (let i = 0; i < n; i++) k.box(i % 2 ? 'felt' : 'sage', w / n - 0.04, 0.9, 0.05, -w / 2 + (w / n) * (i + 0.5), 0.35, 0);
};

// ---------------------------------------------------------------- restaurant (Korean barbecue)
// Dining chair: black steel frame, walnut seat and back panel, facing +z.
function diningChair(k, x, z, ry) {
  const c = Math.cos(ry), s = Math.sin(ry);
  const L = (lx, lz) => [x + lx * c + lz * s, z - lx * s + lz * c];
  for (const [lx, lz] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) {
    const [a, b] = L(lx, lz);
    k.add('black', new THREE.BoxGeometry(0.025, 0.45, 0.025), a, 0.225, b, ry);
  }
  for (const lx of [-0.19, 0.19]) { const [a, b] = L(lx, -0.19); k.add('black', new THREE.BoxGeometry(0.025, 0.46, 0.025), a, 0.68, b, ry, -0.06); }
  k.add('walnutPanel', new THREE.BoxGeometry(0.43, 0.035, 0.41), x, 0.465, z, ry);
  const [bx, bz] = L(0, -0.205);
  k.add('walnutPanel', new THREE.BoxGeometry(0.42, 0.24, 0.025), bx, 0.78, bz, ry, -0.06);
  k.shadow(x, z, 0.46, 0.46, { a: 0.14, ry: 0 });
}
// Grill table: butcher-block top with an inset round charcoal/gas grill and
// the black down-draft extraction cabinet beneath (no overhead hood — the
// photos show none). seats = { front, back, left, right } chairs per side.
const grillTable = (k, p) => {
  const w = p.w ?? 1.25, d = p.d ?? 0.8, h = 0.74, gx = p.gx ?? 0;
  const s = { front: 2, back: 2, left: 0, right: 0, ...(p.seats ?? {}) };
  k.box('butcher', w, 0.05, d, 0, h - 0.05, 0);
  k.box('black', w - 0.1, 0.06, d - 0.1, 0, h - 0.11, 0);
  k.box('black', Math.min(0.6, w - 0.3), h - 0.17, Math.min(0.55, d - 0.2), 0, 0.02, 0);
  k.box('steel', Math.min(0.4, w - 0.5), 0.12, 0.01, 0, 0.12, Math.min(0.55, d - 0.2) / 2 + 0.003);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) k.box('black', 0.035, h - 0.11, 0.035, sx * (w / 2 - 0.08), 0, sz * (d / 2 - 0.08));
  // grill: steel ring proud of the top, dark domed grate inside it
  k.cyl('steel', 0.215, 0.215, 0.014, gx, h, 0, 28);
  k.cyl('grill', 0.12, 0.185, 0.022, gx, h - 0.002, 0, 28);
  k.shadow(0, 0, w, d, { a: 0.26 });
  const row = (n, len, fn) => { for (let i = 0; i < n; i++) fn(-len / 2 + (len * (i + 0.5)) / n); };
  row(s.front, w, (o) => diningChair(k, o, d / 2 + 0.3, Math.PI));
  row(s.back, w, (o) => diningChair(k, o, -d / 2 - 0.3, 0));
  row(s.left, d, (o) => diningChair(k, -w / 2 - 0.3, o, Math.PI / 2));
  row(s.right, d, (o) => diningChair(k, w / 2 + 0.3, o, -Math.PI / 2));
};
// Built-in leather banquette (seat faces +z), on a recessed plinth lit by an
// LED strip, cushions split every ~0.9 m.
const banquette = (k, p) => {
  const w = p.w ?? 3, d = p.d ?? 0.62;
  k.box('walnutDark', w, 0.28, d - 0.14, 0, 0, -0.07);
  k.box('led', w - 0.04, 0.012, 0.015, 0, 0.02, d / 2 - 0.135);
  const n = Math.max(1, Math.round(w / 0.9)), cw = w / n;
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + cw * (i + 0.5);
    k.box('leather', cw - 0.02, 0.16, d - 0.14, x, 0.28, 0.03);
    k.add('leather', new THREE.BoxGeometry(cw - 0.034, 0.5, 0.13), x, 0.73, -d / 2 + 0.085, 0, -0.08);
  }
  k.box('walnutDark', w - 0.006, 0.46, 0.06, 0, 0.0, -d / 2 + 0.032);
  k.shadow(0, 0.02, w, d, { a: 0.3 });
};
// Wall cladding, a thin layer in front of a wall (front = +z, room side).
//   style: walnut (veneer panels, optional stacked-stone strips every `strip`
//   m or at `stripAt` offsets) | mauve (felt panels + brass rail) | marble
//   (dark slabs) | stack (stacked dark stone) | strips (reclaimed-wood
//   strips) | chevron (white/grey marble chevron) | seigaiha (wave tile).
const wallPanel = (k, p) => {
  const w = p.w ?? 2, h = p.h ?? 1.56, t = 0.024, st = p.style ?? 'walnut';
  const joint = (x, y, jw, jh) => k.box('walnutDark', jw, jh, 0.004, x, y, t / 2 + 0.002);
  const stackStrip = (x, sw) => {
    for (let y = 0, i = 0; y < h - 0.01; y += 0.055, i++) {
      const lh = Math.min(0.05, h - y);
      k.box(i % 3 === 1 ? 'stackB' : 'stack', sw - ((i * 7) % 3) * 0.012, lh, 0.05 + ((i * 5) % 3) * 0.01, x + (((i * 3) % 3) - 1) * 0.006, y, 0.012);
    }
  };
  if (st === 'walnut') {
    k.box('walnutPanel', w, h, t, 0, 0, 0);
    const n = Math.max(1, Math.round(w / 0.6));
    for (let i = 1; i < n; i++) joint(-w / 2 + (w * i) / n, 0, 0.006, h);
    joint(0, 0.9, w, 0.006);
    const strips = p.stripAt ?? (p.strip ? Array.from({ length: Math.floor(w / p.strip) + 1 }, (_, i) => -w / 2 + (p.off ?? 0) + i * p.strip).filter((x) => x > -w / 2 + 0.1 && x < w / 2 - 0.1) : []);
    for (const x of strips) stackStrip(x, 0.24);
  } else if (st === 'mauve') {
    k.box('mauve', w, h, t, 0, 0, 0);
    const n = Math.max(1, Math.round(w / 0.9));
    for (let i = 1; i < n; i++) joint(-w / 2 + (w * i) / n, 0, 0.006, h);
    for (const y of [0.45, 1.35]) joint(0, y, w, 0.006);
    k.box('brass', w, 0.035, 0.03, 0, 0.88, t / 2 + 0.012);
  } else if (st === 'marble') {
    k.box('marbleDark', w, h, t, 0, 0, 0);
    const n = Math.max(1, Math.round(w / 0.6));
    for (let i = 1; i < n; i++) k.box('granite', 0.005, h, 0.004, -w / 2 + (w * i) / n, 0, t / 2 + 0.002);
    for (const y of [0.3, 0.6, 0.9, 1.2]) k.box('granite', w, 0.005, 0.004, 0, y, t / 2 + 0.002);
  } else if (st === 'stack') {
    stackStrip(0, w);
  } else if (st === 'strips') {
    k.box('walnutDark', w, h, t, 0, 0, 0);
    const mats = ['reclaimed', 'reclaimedB', 'reclaimedC', 'butcher'];
    for (let y = 0.5, i = 0; y < h - 0.02; y += 0.05, i++) {
      let x = -w / 2 + ((i * 0.23) % 0.4) - 0.2;
      let j = i;
      while (x < w / 2) {
        const len = 0.3 + ((j * 7) % 5) * 0.12;
        const x0 = Math.max(-w / 2, x), x1 = Math.min(w / 2, x + len - 0.01);
        if (x1 > x0) k.box(mats[(j * 3 + i) % 4], x1 - x0, 0.045, 0.02 + ((j * 5) % 3) * 0.008, (x0 + x1) / 2, y, t / 2 + 0.01);
        x += len; j++;
      }
    }
  } else {
    const mat = st === 'chevron' ? 'chevronTile' : 'seigaiha';
    k.box(mat, w, h, t, 0, 0, 0);
    if (st === 'chevron') for (let y = 0.1; y < h; y += 0.1) k.box('stackB', w, 0.004, 0.003, 0, y, t / 2 + 0.0015);
    // seigaiha: rows of overlapping wave scallops, as arcs of thin dark ribs
    if (st === 'seigaiha') {
      const R = 0.075, n = Math.max(1, Math.round(w / (2 * R)));
      for (let y = 0.06, row = 0; y < h - 0.02; y += R * 0.62, row++) {
        for (let i = 0; i < n; i++) {
          const cx = -w / 2 + (w * (i + (row % 2 ? 0 : 0.5))) / n;
          for (let a = 0.25; a < Math.PI - 0.2; a += 0.45) {
            const x = cx + Math.cos(a) * R, yy = y + Math.sin(a) * R * 0.8;
            if (Math.abs(x) < w / 2 - 0.01 && yy < h - 0.01) k.add('seigaihaInk', new THREE.BoxGeometry(0.035, 0.008, 0.003), x, yy, t / 2 + 0.0015, 0, 0, a + Math.PI / 2);
          }
        }
      }
    }
  }
};
// Bar: dark granite top over a front of vertical reclaimed-wood fins, lit from
// under the top, with timber-seat stools on the customer side (+z).
const barCounter = (k, p) => {
  const w = p.w ?? 5, d = 0.56, h = 1.04, n = p.stools ?? Math.floor(w / 0.75);
  k.box('black', w, h - 0.05, d - 0.12, 0, 0, -0.06);
  const fins = Math.round(w / 0.11), fw = w / fins, mats = ['reclaimed', 'reclaimedB', 'reclaimedC'];
  for (let i = 0; i < fins; i++) k.box(mats[(i * 7) % 3], fw - 0.012, h - 0.09, 0.05 + ((i * 5) % 3) * 0.015, -w / 2 + fw * (i + 0.5), 0.02, d / 2 - 0.06);
  k.box('granite', w + 0.04, 0.045, d + 0.1, 0, h - 0.05, 0.03);
  k.box('led', w - 0.06, 0.008, 0.012, 0, h - 0.06, d / 2 + 0.05);
  k.box('steel', w - 0.1, 0.03, 0.36, 0, 0.84, -d / 2 - 0.15);
  k.shadow(0, 0, w, d, { a: 0.3 });
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (w * (i + 0.5)) / n, z = d / 2 + 0.42;
    for (const [lx, lz] of [[-0.14, -0.13], [0.14, -0.13], [-0.14, 0.13], [0.14, 0.13]]) k.rod('black', 0.012, [x + lx * 1.15, 0, z + lz * 1.15], [x + lx * 0.8, 0.74, z + lz * 0.8], 5);
    k.box('black', 0.3, 0.015, 0.015, x, 0.28, z + 0.15);
    k.box('walnutPanel', 0.38, 0.05, 0.34, x, 0.74, z);
    k.shadow(x, z, 0.42, 0.4, { a: 0.12 });
  }
};
// Back bar against a wall (front = +z): walnut cabinets, granite top, two
// shelves of bottles in front of the wall cladding.
const backBar = (k, p) => {
  const w = p.w ?? 4, d = 0.5;
  k.box('walnutDark', w, 0.86, d, 0, 0, 0);
  k.box('granite', w + 0.02, 0.04, d + 0.03, 0, 0.86, 0.01);
  const bottles = ['bottleA', 'bottleB', 'bottleC', 'bottleA', 'bottleC'];
  for (const y of [1.02, 1.3]) {
    k.box('walnutPanel', w - 0.2, 0.03, 0.24, 0, y, -d / 2 + 0.12);
    for (let x = -w / 2 + 0.2, i = 0; x < w / 2 - 0.2; x += 0.13, i++) {
      if (i % 9 === 8) continue;
      const m = bottles[(i * 3 + (y > 1.2 ? 1 : 0)) % bottles.length];
      k.cyl(m, 0.034, 0.034, 0.2, x, y + 0.03, -d / 2 + 0.12, 8);
      k.cyl(m, 0.012, 0.03, 0.08, x, y + 0.23, -d / 2 + 0.12, 6);
    }
  }
  k.shadow(0, 0, w, d, { a: 0.3 });
};
// Host stand: reclaimed-wood podium.
const hostStand = (k) => {
  const mats = ['reclaimedB', 'reclaimed', 'reclaimedC', 'reclaimedB'];
  for (let i = 0; i < 4; i++) k.box(mats[i], 0.115, 1.08, 0.42, -0.18 + i * 0.12, 0, 0);
  k.box('granite', 0.5, 0.03, 0.44, 0, 1.08, 0);
  k.shadow(0, 0, 0.5, 0.44, { a: 0.3 });
};
// Waiting bench: dark timber slab on black legs.
const bench = (k, p) => {
  const w = p.w ?? 1.4;
  k.box('walnutDark', w, 0.06, 0.4, 0, 0.4, 0);
  for (const s of [-1, 1]) k.box('black', 0.05, 0.4, 0.34, s * (w / 2 - 0.1), 0, 0);
  k.shadow(0, 0, w, 0.4, { a: 0.2 });
};
// Rust-finished metal lattice screen with a few shelves.
const lattice = (k, p) => {
  const w = p.w ?? 2.4, h = p.h ?? 1.85, c = 0.33, dd = 0.3;
  const nx = Math.max(1, Math.round(w / c)), ny = Math.max(1, Math.round(h / c));
  for (let i = 0; i <= nx; i++) for (const z of [-dd / 2, dd / 2]) k.box('rust', 0.03, h, 0.03, -w / 2 + (w * i) / nx, 0, z);
  for (let j = 1; j <= ny; j++) {
    const y = (h * j) / ny - 0.03;
    for (const z of [-dd / 2, dd / 2]) k.box('rust', w, 0.03, 0.03, 0, y, z);
    for (let i = 0; i <= nx; i++) k.box('rust', 0.03, 0.03, dd, -w / 2 + (w * i) / nx, y, 0);
  }
  k.shadow(0, 0, w, dd + 0.05, { a: 0.18 });
};
// Linen cylinder pendant over a table; the cord stops just under the cut.
const pendant = (k, p) => {
  const y0 = p.h0 ?? 1.5, top = p.top ?? 1.9;
  k.cyl('linen', 0.1, 0.1, 0.3, 0, y0, 0, 16);
  k.rod('black', 0.006, [0, y0 + 0.3, 0], [0, top, 0], 4);
};
// Stair balustrade: glass panels following the stair pitch (stair rising along
// local +x from -w/2 to +w/2, reaching `top`), black handrail.
const stairGlass = (k, p) => {
  const w = p.w ?? 5, top = p.top ?? 1.9, n = Math.max(2, Math.round(w / 1.1)), seg = w / n, gh = 0.95;
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + seg * (i + 0.5);
    const y = (top * (i + 0.5)) / n;
    k.box('glass', seg - 0.03, Math.min(gh, top + 0.05 - y), 0.02, x, y, 0);
  }
  const ry = (x) => Math.min(top + 0.02, gh + 0.04 + (top * (x + w / 2)) / w);
  for (let i = 0; i < n; i++) {
    const xa = -w / 2 + seg * i, xb = xa + seg;
    k.rod('black', 0.02, [xa, ry(xa), 0], [xb, ry(xb), 0], 6);
  }
};
// Kitchen: stainless cook line on the back wall with a canopy hood (front +z).
const cookLine = (k, p) => {
  const w = p.w ?? 4, d = 0.84;
  k.box('steel', w, 0.86, d, 0, 0, 0);
  k.box('chrome', w, 0.04, d, 0, 0.86, 0);
  const n = Math.max(1, Math.floor((w - 0.4) / 0.5));
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + 0.45 + i * 0.5;
    k.cyl('black', 0.15, 0.15, 0.02, x, 0.9, 0.05, 12);
  }
  k.box('steel', w, 0.5, 0.04, 0, 0.9, -d / 2 + 0.02);
  k.box('steel', w + 0.1, 0.4, 1.05, 0, 1.45, -d / 2 + 0.525);
  k.box('black', w, 0.01, 0.95, 0, 1.445, -d / 2 + 0.525);
  k.shadow(0, 0, w, d, { a: 0.3 });
};
const prepTable = (k, p) => {
  const w = p.w ?? 1.8, d = p.d ?? 0.75;
  k.box('chrome', w, 0.04, d, 0, 0.86, 0);
  k.box('steel', w - 0.08, 0.025, d - 0.08, 0, 0.22, 0);
  legs4(k, 'steel', w, d, 0.86, 0.05, 0.04);
  k.shadow(0, 0, w, d, { a: 0.22 });
};
const reachIn = (k, p) => {
  const w = p.w ?? 1.4, d = 0.8;
  k.box('steel', w, 1.85, d, 0, 0, 0);
  const n = Math.max(1, Math.round(w / 0.7));
  for (let i = 0; i < n; i++) {
    const x = -w / 2 + (w * (i + 0.5)) / n;
    k.box('chrome', w / n - 0.04, 1.6, 0.012, x, 0.15, d / 2 + 0.006);
    k.box('black', 0.025, 0.4, 0.03, x + (i % 2 ? -1 : 1) * (w / n / 2 - 0.08), 0.95, d / 2 + 0.02);
  }
  k.shadow(0, 0, w, d, { a: 0.3 });
};
const dishSink = (k, p) => {
  const w = p.w ?? 2.4, d = 0.7;
  k.box('steel', w, 0.86, d, 0, 0, 0);
  k.box('chrome', w, 0.04, d, 0, 0.86, 0);
  for (let i = 0; i < 3; i++) k.box('screen', 0.5, 0.008, 0.5, -0.6 + i * 0.6, 0.9, 0.02);
  k.box('chrome', w, 0.3, 0.04, 0, 0.9, -d / 2 + 0.02);
  k.shadow(0, 0, w, d, { a: 0.25 });
};

// ---------------------------------------------------------------- medical
// Dental operatory chair (patient's feet toward +z, headrest at -z): pedestal,
// reclined upholstered seat / back / headrest, the doctor's delivery tray on
// an arm, the operatory light on a post (kept under the cut), doctor's and
// assistant's stools either side of the head.
const dentalChair = (k, p) => {
  const fab = p.fab ?? 'vinylTeal';
  k.box('white', 0.62, 0.08, 1.1, 0, 0, 0.05); // floor plate
  k.box('white', 0.34, 0.36, 0.42, 0, 0.08, 0.05);
  k.box('offWhite', 0.6, 0.06, 1.0, 0, 0.44, 0.2);
  k.add(fab, new THREE.BoxGeometry(0.58, 0.12, 0.62), 0, 0.56, 0.32, 0, -0.12); // seat + legs rest
  k.add(fab, new THREE.BoxGeometry(0.56, 0.12, 0.66), 0, 0.68, -0.33, 0, 0.42); // reclined back
  k.add(fab, new THREE.BoxGeometry(0.3, 0.1, 0.24), 0, 0.84, -0.7, 0, 0.3); // headrest
  for (const sx of [-1, 1]) k.box('white', 0.06, 0.05, 0.42, sx * 0.33, 0.66, 0.0); // arm rests
  // delivery unit on the patient's right, light post at the foot
  k.rod('steel', 0.025, [0.42, 0.44, 0.2], [0.5, 0.92, 0.1]);
  k.box('white', 0.42, 0.05, 0.32, 0.6, 0.92, 0.0);
  k.box('steel', 0.36, 0.01, 0.26, 0.6, 0.97, 0.0);
  k.cyl('white', 0.04, 0.04, 1.32, -0.5, 0, 0.45, 10);
  k.rod('white', 0.025, [-0.5, 1.3, 0.45], [-0.15, 1.28, -0.2]);
  k.add('white', new THREE.BoxGeometry(0.34, 0.1, 0.16), -0.12, 1.24, -0.24, 0.5);
  k.add('light', new THREE.BoxGeometry(0.26, 0.02, 0.1), -0.12, 1.185, -0.24, 0.5);
  k.shadow(0, 0.05, 0.8, 1.6, { a: 0.24 });
  if (p.stools !== false) {
    for (const [x, z, f] of [[-0.62, -0.75, 'vinylSlate'], [0.62, -0.62, 'vinylSlate']]) {
      k.cyl('black', 0.25, 0.25, 0.04, x, 0, z, 10);
      k.cyl('chrome', 0.025, 0.025, 0.42, x, 0.04, z, 8);
      k.cyl(f, 0.22, 0.22, 0.08, x, 0.46, z, 16);
      k.shadow(x, z, 0.5, 0.5, { round: true, a: 0.14 });
    }
  }
};
// Low solid partition along x (h ≤ the raised walls), with a dark cap like them.
const partition = (k, p) => {
  const w = p.w ?? 2, h = p.h ?? 1.25, t = p.th ?? 0.1;
  k.box('white', w, h, t, 0, 0, 0);
  k.box('wallCap', w + 0.004, 0.012, t + 0.004, 0, h, 0);
  k.shadow(0, 0, w, t + 0.12, { a: 0.18 });
};
// Exam / treatment table (long axis along x).
const examTable = (k, p) => {
  const w = p.w ?? 1.9;
  k.box('white', w - 0.3, 0.6, 0.5, 0, 0, 0);
  k.box(p.fab ?? 'vinylSlate', w, 0.12, 0.66, 0, 0.6, 0);
  k.add(p.fab ?? 'vinylSlate', new THREE.BoxGeometry(0.5, 0.1, 0.64), -w / 2 + 0.3, 0.86, 0, 0, 0, -0.5);
  k.shadow(0, 0, w, 0.7, { a: 0.22 });
};

const TYPES = {
  dentalChair, partition, examTable,
  grillTable, banquette, wallPanel, barCounter, backBar, hostStand, bench, lattice, pendant, stairGlass,
  cookLine, prepTable, reachIn, dishSink,
  mic, panels,
  desk, desks, taskChair: (k, p) => taskChair(k, 0, 0, 0, p.fab), boardChair: (k, p) => boardChair(k, 0, 0, 0, p.fab),
  shellChair: (k, p) => shellChair(k, 0, 0, 0, p.fab), stool: (k) => stool(k, 0, 0),
  sofa, sofaL, armchair, pouf, coffeeTable, sideTable, rug, confTable, highTable, cafeTable,
  reception, podcast, booth, credenza, shelf, tv, whiteboard, kitchen, island, toilet, vanity,
  plant, planter, elevator, stair, door, glassWall, lockers, printer,
};
export const FURNITURE_TYPES = Object.keys(TYPES);

export function buildFurniture(items) {
  const k = new Kit();
  for (const it of items) {
    const fn = TYPES[it.t];
    if (!fn) { console.warn('Unknown furniture type', it.t); continue; }
    k.begin(it.x, it.z, it.ry);
    fn(k, it);
  }
  const { group, mats } = k.build();
  return {
    group,
    shadows: k.shadows,
    dispose() { group.traverse((o) => o.geometry?.dispose()); mats.forEach((m) => m.dispose()); },
  };
}
