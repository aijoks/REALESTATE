// Raw land: a wooded parcel with its surveyed boundary (no building).
// Params (model.procedural):
//   boundary  flat [x, z, ...] parcel outline in model metres (+x east, +z south)
//   setbacks  per-edge distance (m) kept clear of trees (edge i = vertex i -> i+1):
//             mowed verges along road frontage, default 1.5
//   tones     optional canopy colour grid sampled from satellite imagery:
//             { x0, z0, cell, cols, data } with 3 hex digits (r g b, 4 bit) per cell
//   gaps      [[x, z, r], ...] small natural clearings (no trees)
//   spacing   mean tree spacing (m), default 5.4
//   height    nominal canopy height (m), default 16
// The woodland mixes live oaks / laurel oaks (broad lumpy crowns), slash pines,
// sabal palms and a palmetto / wax-myrtle shrub layer, densest along the
// edges, all as a handful of instanced meshes.
import * as THREE from 'three';
import { rand } from './textures.js';

const pairs = (f) => { const p = []; for (let i = 0; i < f.length; i += 2) p.push([f[i], f[i + 1]]); return p; };

function inside([x, z], poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i], [xj, zj] = poly[j];
    if ((zi > z) !== (zj > z) && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) c = !c;
  }
  return c;
}
function segDist(px, pz, [ax, az], [bx, bz]) {
  const dx = bx - ax, dz = bz - az;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(px - ax - t * dx, pz - az - t * dz);
}

// Lumpy crown: an icosphere with its vertices pushed in and out.
function crownGeo(seed, detail = 1, amp = 0.16) {
  const r = rand(seed);
  const g = new THREE.IcosahedronGeometry(1, detail);
  const pos = g.attributes.position;
  const key = (x, y, z) => `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`;
  const k = new Map();
  for (let i = 0; i < pos.count; i++) {
    const id = key(pos.getX(i), pos.getY(i), pos.getZ(i));
    if (!k.has(id)) k.set(id, 1 - amp + r() * amp * 2);
    const s = k.get(id);
    pos.setXYZ(i, pos.getX(i) * s, pos.getY(i) * s, pos.getZ(i) * s);
  }
  g.computeVertexNormals();
  return g;
}

// Sabal palm head: drooping fan fronds around a short boot.
function palmHeadGeo() {
  const parts = [];
  const n = 11;
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2;
    const up = k % 3 === 0;
    const f = new THREE.PlaneGeometry(1.5, 2.4, 1, 2);
    const p = f.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const y = p.getY(i) + 1.2; // 0 at the base .. 2.4 at the tip
      p.setY(i, y);
      p.setZ(i, -0.18 * y * y); // droop
      p.setX(i, p.getX(i) * (0.35 + 0.65 * Math.sin((y / 2.4) * Math.PI * 0.8 + 0.3)));
    }
    f.rotateX(-Math.PI / 2 + (up ? 0.9 : 0.35));
    f.rotateY(-a);
    parts.push(f);
  }
  const g = mergeAll(parts);
  g.computeVertexNormals();
  return g;
}
function mergeAll(geos) {
  let n = 0, ni = 0;
  for (const g of geos) { n += g.attributes.position.count; ni += g.index.count; }
  const pos = new Float32Array(n * 3), idx = [];
  let o = 0;
  for (const g of geos) {
    pos.set(g.attributes.position.array, o * 3);
    for (let i = 0; i < g.index.count; i++) idx.push(g.index.getX(i) + o);
    o += g.attributes.position.count;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

export function buildLand(p) {
  const g = new THREE.Group();
  const r = rand(p.seed ?? 1802);
  const B = pairs(p.boundary);
  const n = B.length;
  const setbacks = p.setbacks ?? [];
  const sb = (i) => setbacks[i] ?? 1.5;
  const xs = B.map((q) => q[0]), zs = B.map((q) => q[1]);
  const [x0, x1, z0, z1] = [Math.min(...xs), Math.max(...xs), Math.min(...zs), Math.max(...zs)];
  const H = p.height ?? 16;

  // ---- ground: mown verge colour; the woods' leaf litter sits inside the setbacks ----
  const shape = new THREE.Shape(B.map(([x, z]) => new THREE.Vector2(x, -z)));
  const ground = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshStandardMaterial({ color: '#5e5a3f', roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0.03;
  ground.receiveShadow = true;
  g.add(ground);

  // Mown grass verges along the edges with a wide setback (road frontage).
  const vergeM = new THREE.MeshStandardMaterial({ color: '#7d8c4b', roughness: 1 });
  for (let i = 0; i < n; i++) {
    const w = sb(i);
    if (w < 2.5) continue;
    const [ax, az] = B[i], [bx, bz] = B[(i + 1) % n];
    const len = Math.hypot(bx - ax, bz - az);
    let nx = -(bz - az) / len, nz = (bx - ax) / len;
    if (!inside([(ax + bx) / 2 + nx * 2, (az + bz) / 2 + nz * 2], B)) { nx = -nx; nz = -nz; }
    const v = new THREE.Mesh(new THREE.PlaneGeometry(len + w, w + 1.5), vergeM);
    v.rotation.set(-Math.PI / 2, 0, Math.atan2(-(bz - az), bx - ax));
    v.position.set((ax + bx) / 2 + nx * (w + 1.5) / 2, 0.035, (az + bz) / 2 + nz * (w + 1.5) / 2);
    v.receiveShadow = true;
    g.add(v);
  }

  // Distance from a point to the nearest edge, less that edge's setback.
  const clear = (x, z) => {
    let m = Infinity;
    for (let i = 0; i < n; i++) m = Math.min(m, segDist(x, z, B[i], B[(i + 1) % n]) - sb(i));
    return m;
  };
  const gaps = p.gaps ?? [];
  const inGap = (x, z, pad = 0) => gaps.some(([gx, gz, gr]) => Math.hypot(x - gx, z - gz) < gr + pad);

  // Leaf-litter floor under the woods (inset polygon approximated by a dark
  // overlay drawn only where the setback is small is unnecessary: the canopy
  // hides it). Small clearings get a sandy floor.
  const sandM = new THREE.MeshStandardMaterial({ color: '#b8a77e', roughness: 1 });
  for (const [gx, gz, gr] of gaps) {
    const c = new THREE.Mesh(new THREE.CircleGeometry(gr * 0.9, 18), sandM);
    c.rotation.x = -Math.PI / 2;
    c.position.set(gx, 0.04, gz);
    c.receiveShadow = true;
    g.add(c);
  }

  // ---- canopy colour from the satellite tone grid ----
  const T = p.tones;
  const tone = (x, z, out) => {
    if (!T) return out.set('#4f5e34');
    const fx = Math.min(T.cols - 1, Math.max(0, (x - T.x0) / T.cell - 0.5));
    const fz = Math.max(0, (z - T.z0) / T.cell - 0.5);
    const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
    const rows = T.data.length / 3 / T.cols;
    const at = (ii, jj, k) => {
      ii = Math.min(T.cols - 1, ii); jj = Math.min(rows - 1, jj);
      return parseInt(T.data[(jj * T.cols + ii) * 3 + k], 16) / 15;
    };
    const c = [0, 1, 2].map((k) => (at(i, j, k) * (1 - u) + at(i + 1, j, k) * u) * (1 - v) + (at(i, j + 1, k) * (1 - u) + at(i + 1, j + 1, k) * u) * v);
    return out.setRGB(c[0], c[1], c[2], THREE.SRGBColorSpace);
  };

  // ---- instanced vegetation ----
  const lists = { crown0: [], crown1: [], crown2: [], edgeCrown: [], pine: [], trunk: [], palmTrunk: [], palmHead: [], shrub: [] };
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3(), E = new THREE.Euler();
  const col = new THREE.Color(), tmp = new THREE.Color();
  const push = (list, x, y, z, sx, sy, sz, color, ry = r() * 6.28, tilt = 0) => {
    E.set(tilt * (r() - 0.5), ry, tilt * (r() - 0.5));
    Q.setFromEuler(E);
    list.push([M.compose(P.set(x, y, z), Q, S.set(sx, sy, sz)).clone(), color.clone()]);
  };
  const jitter = (c, amt = 0.12) => {
    const k = 1 + (r() - 0.5) * amt * 2;
    return c.setRGB(c.r * k * (1 + (r() - 0.5) * 0.06), c.g * k, c.b * k * (1 + (r() - 0.5) * 0.08));
  };
  const leafGreens = ['#4c5f2f', '#5a6b36', '#46562c', '#66753d', '#55663a'];
  const oak = (x, z, s, edge) => {
    tone(x, z, col);
    // The satellite colour already contains canopy shading; brighten its
    // shadowed tones a little and keep it leafy.
    tmp.set(leafGreens[Math.floor(r() * leafGreens.length)]);
    col.lerp(tmp, edge ? 0.55 : 0.3);
    const th = (2.2 + r() * 1.5) * s;
    push(lists.trunk, x, th / 2, z, 0.32 * s, th, 0.32 * s, tmp.set('#5d5145'), 0, 0.25);
    const top = (9 + r() * 6) * s;
    const nb = edge ? 3 : 2;
    for (let k = 0; k < nb; k++) {
      const rad = (2.6 + r() * 1.8) * s;
      const a = r() * 6.28, d = k ? (1.2 + r() * 1.6) * s : 0;
      push(lists[edge ? 'edgeCrown' : `crown${Math.floor(r() * 3)}`], x + Math.cos(a) * d, Math.max(rad * 0.7, top - rad * 0.4 - (k ? r() * 3 : 0)), z + Math.sin(a) * d,
        rad, rad * (0.65 + r() * 0.25), rad * (0.9 + r() * 0.2), jitter(col.clone()));
    }
    if (edge) {
      // Low branches / understory filling the woods' edge.
      const rad = (1.8 + r() * 1.2) * s;
      push(lists.edgeCrown, x + (r() - 0.5) * 2, rad * 0.8, z + (r() - 0.5) * 2, rad, rad * 0.9, rad, jitter(col.clone().lerp(tmp.set('#6c8a3a'), 0.4)));
    }
  };
  const pine = (x, z, s) => {
    const h = (14 + r() * 6) * s;
    push(lists.trunk, x, h / 2, z, 0.26, h, 0.26, tmp.set('#6a5644'), 0, 0.1);
    tone(x, z, col).lerp(tmp.set('#3f5530'), 0.5);
    push(lists.pine, x, h - 1.2, z, 2.4 * s, 1.5 * s, 2.4 * s, jitter(col.clone()));
  };
  const palm = (x, z, s) => {
    const h = (5 + r() * 6) * s;
    const lean = (r() - 0.5) * 0.12;
    push(lists.palmTrunk, x, h / 2, z, 1, h, 1, tmp.set('#7e7262'), r() * 6.28, lean);
    push(lists.palmHead, x, h, z, 1.1 * s, 1.1 * s, 1.1 * s, jitter(tmp.set(r() < 0.5 ? '#5e7d3a' : '#6d8a44')));
  };
  const shrub = (x, z, s) => {
    tmp.set(['#5f7a35', '#6e8a3c', '#56702f', '#7d9447', '#4d6630'][Math.floor(r() * 5)]);
    push(lists.shrub, x, 0.7 * s, z, (1.5 + r() * 0.8) * s, (1.2 + r() * 0.6) * s, (1.5 + r() * 0.8) * s, jitter(tmp.clone()));
  };

  const sp = p.spacing ?? 5.4;
  for (let z = z0; z <= z1; z += sp) {
    for (let x = x0; x <= x1; x += sp) {
      const tx = x + (r() - 0.5) * sp * 0.9, tz = z + (r() - 0.5) * sp * 0.9;
      if (!inside([tx, tz], B)) continue;
      const c = clear(tx, tz);
      if (c < 0 || inGap(tx, tz, 2)) continue;
      const edge = c < 7;
      const q = r();
      const s = 0.8 + r() * 0.45;
      if (q < 0.1) pine(tx, tz, s);
      else if (q < (edge ? 0.3 : 0.18)) palm(tx, tz, s);
      else oak(tx, tz, s * (edge ? 0.85 : 1), edge);
      // Palmetto / young-oak understory between the trunks.
      if (!edge && r() < 0.45) shrub(tx + (r() - 0.5) * sp * 0.6, tz + (r() - 0.5) * sp * 0.6, 0.7 + r() * 0.6);
    }
  }
  // Dense shrub band (saw palmetto, wax myrtle, young oaks) along every edge.
  for (let i = 0; i < n; i++) {
    const [ax, az] = B[i], [bx, bz] = B[(i + 1) % n];
    const len = Math.hypot(bx - ax, bz - az);
    const ux = (bx - ax) / len, uz = (bz - az) / len;
    // Inward normal (polygon is clockwise in x-east / z-south => try both sides).
    let nx = -uz, nz = ux;
    if (!inside([(ax + bx) / 2 + nx * 3, (az + bz) / 2 + nz * 3], B)) { nx = -nx; nz = -nz; }
    for (let t = 1; t < len - 1; t += 2.2) {
      const d = sb(i) + 0.4 + r() * 3.2;
      const x = ax + ux * t + nx * d, z = az + uz * t + nz * d;
      if (!inside([x, z], B) || clear(x, z) < 0) continue;
      shrub(x, z, 0.8 + r() * 0.6);
      if (r() < 0.12) palm(x + nx * 2, z + nz * 2, 0.8 + r() * 0.3);
    }
  }
  // Clearing rims: shrubs around each gap.
  for (const [gx, gz, gr] of gaps) {
    for (let a = 0; a < 6.28; a += 0.5) if (Math.cos(a - (p.gapView ?? 0)) < 0.5) shrub(gx + Math.cos(a) * (gr + 0.6 + r()), gz + Math.sin(a) * (gr + 0.6 + r()), 0.8 + r() * 0.5);
  }

  // ---- build instanced meshes ----
  const leafMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.95 });
  const barkMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 });
  const frondMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, side: THREE.DoubleSide });
  const geos = {
    crown0: crownGeo(11), crown1: crownGeo(23), crown2: crownGeo(37, 1, 0.22), edgeCrown: crownGeo(61, 2, 0.13),
    pine: crownGeo(41, 1, 0.25),
    trunk: new THREE.CylinderGeometry(0.42, 0.6, 1, 5, 1, true),
    palmTrunk: new THREE.CylinderGeometry(0.2, 0.26, 1, 6, 1, true),
    palmHead: palmHeadGeo(),
    shrub: crownGeo(53, 1, 0.18),
  };
  const mats = { trunk: barkMat, palmTrunk: barkMat, palmHead: frondMat };
  let count = 0;
  for (const [k, items] of Object.entries(lists)) {
    if (!items.length) continue;
    const mesh = new THREE.InstancedMesh(geos[k], mats[k] ?? leafMat, items.length);
    items.forEach(([m, c], i) => { mesh.setMatrixAt(i, m); mesh.setColorAt(i, c); });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
    mesh.castShadow = true;
    mesh.receiveShadow = k !== 'trunk' && k !== 'palmTrunk';
    mesh.computeBoundingSphere();
    g.add(mesh);
    count += items.length;
  }
  g.userData.instances = count;
  g.userData.counts = Object.fromEntries(Object.entries(lists).map(([k, v]) => [k, v.length]));

  // ---- boundary: a pale survey line on the ground, stakes and corner monuments ----
  const lineM = new THREE.MeshBasicMaterial({ color: p.lineColor ?? '#f1e3a0' });
  const stakeM = new THREE.MeshStandardMaterial({ color: '#b48a5a', roughness: 1 });
  const flagM = new THREE.MeshBasicMaterial({ color: '#ff4fa0', side: THREE.DoubleSide });
  const monM = new THREE.MeshStandardMaterial({ color: '#d8d4cb', roughness: 0.9 });
  const capM = new THREE.MeshStandardMaterial({ color: '#e0662a', roughness: 0.6 });
  const stakeGeo = new THREE.BoxGeometry(0.06, 1.2, 0.06);
  const flagGeo = new THREE.PlaneGeometry(0.08, 0.45);
  for (let i = 0; i < n; i++) {
    const [ax, az] = B[i], [bx, bz] = B[(i + 1) % n];
    const len = Math.hypot(bx - ax, bz - az);
    const strip = new THREE.Mesh(new THREE.PlaneGeometry(len + 0.6, p.lineWidth ?? 1.2), lineM);
    strip.rotation.set(-Math.PI / 2, 0, Math.atan2(-(bz - az), bx - ax));
    strip.position.set((ax + bx) / 2, 0.07, (az + bz) / 2);
    g.add(strip);
    for (let t = 20; t < len - 6; t += 25) {
      const x = ax + ((bx - ax) * t) / len, z = az + ((bz - az) * t) / len;
      const s = new THREE.Mesh(stakeGeo, stakeM);
      s.position.set(x, 0.6, z);
      g.add(s);
      const f = new THREE.Mesh(flagGeo, flagM);
      f.position.set(x + 0.05, 1.05, z);
      f.rotation.set(0, r() * 3, -0.35);
      g.add(f);
    }
    // Corner monument where the outline turns by more than 25 degrees.
    const [px, pz] = B[(i - 1 + n) % n];
    const a1 = Math.atan2(az - pz, ax - px), a2 = Math.atan2(bz - az, bx - ax);
    let da = Math.abs(a2 - a1); if (da > Math.PI) da = 2 * Math.PI - da;
    if (da > 0.44) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.7, 0.3), monM);
      m.position.set(ax, 0.35, az);
      m.castShadow = true;
      g.add(m);
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.06, 10), capM);
      c.position.set(ax, 0.73, az);
      g.add(c);
    }
  }

  const floorRange = () => [0, H];
  const hotspotPosition = (at) => new THREE.Vector3(at[0], at[1], at[2]);
  return { group: g, width: x1 - x0, depth: z1 - z0, height: H, floorRange, hotspotPosition };
}
