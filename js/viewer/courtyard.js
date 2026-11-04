// Procedural model of a 1960s two-storey courtyard apartment property,
// matched to Palm Shadows, 1815 E Speedway Blvd, Tucson (listing photo of
// the pool courtyard + satellite imagery):
//   - a front building on Speedway and a rear building, each a ring of
//     two-storey wings around a courtyard, separated by the parking lot
//   - tan stucco, teal fascia band on the roof edge and on the edge of the
//     upper walkway, teal doors, sliding windows with white curtains,
//     black picket railings along the open-air upper walkways
//   - flat white roofs covered with small packaged HVAC units
//   - rear courtyard: pool with terracotta coping, concrete deck, black pool
//     fence, white loungers; front courtyard: gravel, palms, laundry room
// Model frame = the whole parcel (42 x 112 m): +z = south onto Speedway,
// +x = east (toward Campbell Ave). Rectangles below are traced from the
// satellite (roof outlines; walls are set back under the walkway roofs).
import * as THREE from 'three';
import { textTexture, rand } from './textures.js';
import { V, piece, createKit } from './kit.js';

const COL = {
  stucco: '#d6b27a',
  soffit: '#d9bf90',
  teal: '#1d6b69',
  tealBand: '#2e8b85',
  door: '#22605e',
  frame: '#4a443c',
  curtain: '#ecebe4',
  roof: '#e4e2dc',
  slab: '#cfc7b6',
  deck: '#cdc6b6',
  coping: '#b9643d',
  gravel: '#bfa47c',
};

const FH = 2.9; // floor to floor
const EAVE = 5.65; // underside of the roof slab
const ROOF = 6.1; // top of the roof slab / fascia
const WALK = 1.8; // depth of the open-air walkways

export function buildCourtyard(params = {}) {
  const { width: W = 42, depth: D = 112, seed = 1815 } = params;
  const r = rand(seed);
  const g = new THREE.Group();
  g.name = 'building';
  const { I, add, finish } = createKit(g, r);
  const mats = new Map();
  const M = (color, o = {}) => {
    const k = color + JSON.stringify(o);
    if (!mats.has(k)) mats.set(k, new THREE.MeshStandardMaterial({ color, roughness: 0.92, ...o }));
    return mats.get(k);
  };
  const box = (mat, w, h, d, x, y, z, ry = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.castShadow = m.receiveShadow = true;
    return add(m);
  };
  const flat = (mat, x0, x1, z0, z1, y = 0.06) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
    m.receiveShadow = true;
    return add(m);
  };
  const ID = new THREE.Matrix4();
  const T = (F, x, y, z, sx, sy, sz, c, q) => I.trim.add(piece(F, x, y, z, sx, sy, sz, q), c);
  const S = (F, x, y, z, sx, sy, sz, q) => I.steel.add(piece(F, x, y, z, sx, sy, sz, q));

  const stucco = M(COL.stucco);
  const roofTop = M(COL.roof, { roughness: 0.95 });
  const fascia = M(COL.teal, { roughness: 0.7 });
  const soffit = M(COL.soffit);
  const roofMat = [fascia, fascia, roofTop, soffit, fascia, fascia];

  // ---- massing ----
  // body: [x0, x1, z0, z1] wall volume; roofs: [x0, x1, z0, z1] roof slab
  // (incl. walkway roofs and eaves) as seen from above.
  const bodies = [];
  const roofs = [];
  const wing = (b, rf) => { bodies.push(b); roofs.push(rf); };
  // Front building (on Speedway): ring around a 13 x 13 m courtyard.
  wing([-20.0, 7.6, 17.1, 24.3], [-20.3, 7.6, 15.3, 26.1]); // north bar
  wing([7.6, 11.3, 19.7, 24.3], [7.6, 9.5, 19.7, 26.1]); // beside the stair notch
  wing([11.3, 20.0, 17.1, 53.6], [9.5, 20.3, 15.3, 53.9]); // east wing
  wing([-14.2, -5.4, 28.6, 53.6], [-14.5, -3.6, 28.6, 53.9]); // west wing
  wing([-5.4, 11.3, 41.2, 53.6], [-3.6, 9.5, 39.4, 53.9]); // south bar on Speedway
  // Rear building: ring around the pool courtyard, open at its SE corner.
  wing([-14.2, 19.9, -48.7, -37.8], [-14.5, 20.2, -49.0, -36.0]); // north bar
  wing([-14.2, -5.5, -37.8, -16.2], [-14.5, -3.7, -36.0, -16.2]); // west wing
  wing([-19.4, 5.0, -12.4, -4.9], [-19.7, 5.0, -14.2, -3.1]); // south bar (parking side)
  wing([11.2, 19.9, -37.8, -7.4], [9.4, 20.2, -36.0, -5.6]); // east wing
  for (const [x0, x1, z0, z1] of bodies) box(stucco, x1 - x0, EAVE, z1 - z0, (x0 + x1) / 2, EAVE / 2, (z0 + z1) / 2);
  for (const [x0, x1, z0, z1] of roofs) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, ROOF - EAVE, z1 - z0), roofMat);
    m.position.set((x0 + x1) / 2, (EAVE + ROOF) / 2, (z0 + z1) / 2);
    m.castShadow = m.receiveShadow = true;
    add(m);
  }
  // Short stucco walls closing the breezeways / stair wells at roof level.
  box(stucco, 0.3, EAVE, 2.5, -14.05, EAVE / 2, 27.35);
  box(stucco, 0.3, EAVE, 2.0, -14.05, EAVE / 2, -15.2);

  // ---- facades ----
  // run(axis, c, s0, s1, n, type): wall line at x = c ('z' runs) or z = c
  // ('x' runs) from s0 to s1, outward normal sign n. type 'walk' = open
  // walkway with doors + windows; 'win' = windows only. gaps: [s0, s1] kept
  // clear (stairs, breezeways).
  const run = (axis, c, s0, s1, n, type, { gaps = [], rail = true, apron = true } = {}) => {
    const len = s1 - s0;
    const mid = (s0 + s1) / 2;
    const ry = axis === 'x' ? (n > 0 ? 0 : Math.PI) : (n > 0 ? Math.PI / 2 : -Math.PI / 2);
    const F = new THREE.Matrix4().makeRotationY(ry).setPosition(axis === 'x' ? mid : c, 0, axis === 'x' ? c : mid);
    // world coordinate along the run for a local x
    const ux = axis === 'x' ? Math.cos(ry) : -Math.sin(ry);
    const toS = (lx) => mid + lx * ux;
    const inGap = (lx, half) => gaps.some(([a, b]) => { const s = toS(lx); return s + half > Math.min(a, b) && s - half < Math.max(a, b); });
    const bays = Math.max(1, Math.floor(len / 3.6));
    const bw = len / bays;
    for (let f = 0; f < 2; f++) {
      const y0 = f * FH + (f ? 0.12 : 0.05);
      for (let k = 0; k < bays; k++) {
        const cx = -len / 2 + bw * (k + 0.5);
        const m = k % 2 ? 1 : -1;
        const win = (lx, w = 1.75, h = 1.2) => {
          if (inGap(lx, w / 2 + 0.1)) return;
          T(F, lx, y0 + 1.55, 0.02, w + 0.1, h + 0.1, 0.05, COL.frame);
          const tone = r() < 0.75 ? COL.curtain : r() < 0.5 ? '#d9d3c4' : '#8c8478';
          T(F, lx - w / 4, y0 + 1.55, 0.05, w / 2 - 0.06, h - 0.06, 0.02, tone);
          T(F, lx + w / 4, y0 + 1.55, 0.05, w / 2 - 0.06, h - 0.06, 0.02, r() < 0.7 ? tone : '#3a3e42');
          T(F, lx, y0 + 0.92, 0.07, w + 0.16, 0.06, 0.1, COL.soffit); // sill
        };
        if (type === 'walk') {
          const dx = cx + m * 0.95;
          if (!inGap(dx, 0.6)) {
            T(F, dx, y0 + 1.05, 0.03, 0.95, 2.1, 0.06, COL.door);
            T(F, dx, y0 + 1.05, 0.015, 1.07, 2.18, 0.03, COL.frame);
            T(F, dx + 0.32 * -m, y0 + 1.0, 0.07, 0.06, 0.06, 0.04, '#c8b27a'); // knob
            T(F, dx - m * 0.85, y0 + 2.35, 0.08, 0.14, 0.2, 0.1, '#2b2b2b'); // porch light
          }
          win(cx - m * 0.85, 1.75);
        } else {
          win(cx, 1.75);
        }
      }
    }
    if (type !== 'walk') return;
    // Upper walkway: slab, teal edge band, black picket railing.
    T(F, 0, FH - 0.1, WALK / 2, len, 0.2, WALK, COL.slab);
    T(F, 0, FH - 0.13, WALK + 0.02, len, 0.32, 0.06, COL.tealBand);
    if (apron) T(F, 0, 0.04, WALK / 2, len, 0.08, WALK + 0.2, '#c9c1b0');
    if (!rail) return;
    const z = WALK - 0.06;
    S(F, 0, FH + 1.02, z, len, 0.06, 0.06);
    S(F, 0, FH + 0.12, z, len, 0.04, 0.04);
    for (let lx = -len / 2 + 0.06; lx <= len / 2; lx += 0.13) S(F, lx, FH + 0.57, z, 0.022, 0.9, 0.022);
    for (let lx = -len / 2 + 0.05; lx <= len / 2; lx += 3.6) S(F, lx, FH + 0.55, z, 0.06, 1.0, 0.06);
  };
  // Front building
  run('x', 17.1, -20.0, 7.6, -1, 'walk'); // north face onto the parking lot
  run('x', 17.1, 11.3, 20.0, -1, 'walk');
  run('z', -20.0, 17.1, 24.3, -1, 'win');
  run('z', 20.0, 17.1, 53.6, 1, 'win'); // east side
  run('z', -14.2, 28.6, 53.6, -1, 'win'); // west side (drive aisle)
  run('x', 53.6, -14.2, 20.0, 1, 'win'); // Speedway facade
  run('x', 24.3, -14.2, 11.3, 1, 'walk', { gaps: [[-14.4, -5.4]] }); // courtyard: south face of north bar
  run('x', 41.2, -5.4, 11.3, -1, 'walk'); // courtyard: north face of south bar
  run('z', -5.4, 28.6, 41.2, 1, 'walk'); // courtyard: east face of west wing
  run('z', 11.3, 24.3, 41.2, -1, 'walk'); // courtyard: west face of east wing
  run('x', 28.6, -14.2, -5.4, -1, 'walk', { rail: true, apron: false }); // breezeway side
  // Rear building
  run('x', -48.7, -14.2, 19.9, -1, 'win'); // north side (toward Helen St)
  run('z', -14.2, -48.7, -16.2, -1, 'win'); // west side (drive aisle)
  run('z', 19.9, -48.7, -7.4, 1, 'win'); // east side
  run('x', -4.9, -19.4, 5.0, 1, 'walk'); // south face onto the parking lot
  run('x', -7.4, 11.2, 19.9, 1, 'walk');
  run('z', -19.4, -12.4, -4.9, -1, 'win');
  run('x', -12.4, -19.4, 5.0, -1, 'walk', { gaps: [[-19.6, -14.2]] }); // pool side of the south bar
  run('x', -37.8, -5.5, 11.2, 1, 'walk', { gaps: [[1.0, 3.8]] }); // pool courtyard: north
  run('z', -5.5, -37.8, -16.2, 1, 'walk'); // pool courtyard: west
  run('z', 11.2, -37.8, -7.4, -1, 'walk'); // pool courtyard: east

  // ---- stairs (concrete treads on black steel stringers) ----
  const stair = (x, z, ry, { L = 5.0, w = 1.1, h = FH, rails = true } = {}) => {
    const F = new THREE.Matrix4().makeRotationY(ry).setPosition(x, 0, z); // rises toward local +z
    const n = 16;
    const ang = Math.atan2(h, L);
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), -ang);
    for (let k = 0; k < n; k++) T(F, 0, ((k + 1) * h) / n - 0.03, ((k + 0.5) * L) / n, w, 0.06, L / n + 0.04, COL.slab);
    const slen = Math.hypot(h, L);
    for (const sx of [-w / 2 - 0.04, w / 2 + 0.04]) {
      S(F, sx, h / 2 - 0.08, L / 2, 0.08, 0.25, slen, q);
      if (rails) {
        S(F, sx, h / 2 + 0.9, L / 2, 0.05, 0.05, slen, q);
        for (let t = 0.3; t < L; t += 0.9) S(F, sx, (t / L) * h + 0.45, t, 0.03, 0.9, 0.03);
      }
    }
    S(F, 0, h / 2, L + 0.05, 0.1, h, 0.1); // post under the landing
  };
  stair(-12.8, 26.9, Math.PI / 2, { L: 5.4, w: 1.3 }); // front breezeway, up eastward
  stair(8.55, 14.9, 0, { L: 4.6, w: 1.1 }); // front: stair notch off the parking lot
  stair(-12.8, -15.2, Math.PI / 2, { L: 5.4, w: 1.3 }); // rear breezeway
  stair(7.2, -5.4, Math.PI, { L: 5.4, w: 1.2 }); // rear: courtyard entry, up toward the pool
  T(ID, 7.2, FH - 0.1, -11.5, 4.4, 0.2, 2.0, COL.slab); // landing joining the walkways
  stair(2.4, -30.4, Math.PI, { L: 5.2, w: 1.3 }); // pool courtyard north stair
  T(ID, 2.4, FH - 0.1, -36.6, 2.0, 0.2, 2.6, COL.slab); // its landing

  // ---- rear courtyard: pool ----
  {
    const cx0 = -5.5, cx1 = 11.2, cz0 = -36.0, cz1 = -12.4;
    flat(M(COL.deck), cx0, cx1, cz0, cz1, 0.07);
    flat(M('#a98d6c', { roughness: 1 }), cx0 + 0.2, cx1 - 0.2, -37.6, -34.4, 0.08); // gravel bed at the north stair
    const px0 = -0.4, px1 = 5.6, pz0 = -27.7, pz1 = -16.4;
    const waterTex = textTexture({
      width: 256, height: 512, bg: '#33bfe0',
      draw(c, w, h) {
        const rr = rand(31);
        c.strokeStyle = 'rgba(210,250,255,0.55)';
        for (let i = 0; i < 140; i++) {
          c.lineWidth = 1 + rr() * 2.5;
          c.beginPath();
          const x = rr() * w, y = rr() * h;
          c.moveTo(x, y);
          c.bezierCurveTo(x + 10, y - 6, x + 20, y + 6, x + 30 + rr() * 20, y);
          c.stroke();
        }
        const gr = c.createLinearGradient(0, 0, w, 0);
        gr.addColorStop(0, 'rgba(0,70,130,0.18)');
        gr.addColorStop(1, 'rgba(0,70,130,0)');
        c.fillStyle = gr;
        c.fillRect(0, 0, w, h);
      },
    });
    const water = new THREE.Mesh(new THREE.PlaneGeometry(px1 - px0, pz1 - pz0), new THREE.MeshStandardMaterial({ map: waterTex, roughness: 0.08, metalness: 0.1, emissive: '#0d6f86', emissiveIntensity: 0.35 }));
    water.rotation.x = -Math.PI / 2;
    water.position.set((px0 + px1) / 2, 0.1, (pz0 + pz1) / 2);
    add(water);
    const cop = M(COL.coping);
    box(cop, px1 - px0 + 0.7, 0.1, 0.35, (px0 + px1) / 2, 0.1, pz0 - 0.175);
    box(cop, px1 - px0 + 0.7, 0.1, 0.35, (px0 + px1) / 2, 0.1, pz1 + 0.175);
    box(cop, 0.35, 0.1, pz1 - pz0, px0 - 0.175, 0.1, (pz0 + pz1) / 2);
    box(cop, 0.35, 0.1, pz1 - pz0, px1 + 0.175, 0.1, (pz0 + pz1) / 2);
    // Ladder rails at the shallow (south-east) end.
    const lq = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), Math.PI / 2);
    for (const dx of [-0.25, 0.25]) {
      S(ID, px1 - 1.2 + dx, 0.5, pz1 - 0.15, 0.05, 0.9, 0.05);
      S(ID, px1 - 1.2 + dx, 0.95, pz1 - 0.05, 0.05, 0.05, 0.25, lq);
    }
    // Black steel pool fence, with a gate on the east side.
    const fence = (ax, az, bx, bz) => {
      const len = Math.hypot(bx - ax, bz - az);
      const ry = -Math.atan2(bz - az, bx - ax);
      const F = new THREE.Matrix4().makeRotationY(ry).setPosition(ax, 0, az);
      S(F, len / 2, 1.42, 0, len, 0.05, 0.05);
      S(F, len / 2, 0.12, 0, len, 0.04, 0.04);
      for (let s = 0.05; s <= len; s += 0.13) S(F, s, 0.76, 0, 0.022, 1.3, 0.022);
      for (let s = 0; s <= len + 0.01; s += len / Math.max(1, Math.round(len / 2.6))) S(F, s, 0.8, 0, 0.07, 1.6, 0.07);
    };
    const fx0 = -3.2, fx1 = 8.8, fz0 = -33.6, fz1 = -14.4;
    fence(fx0, fz0, fx1, fz0);
    fence(fx0, fz1, fx1, fz1);
    fence(fx0, fz0, fx0, fz1);
    fence(fx1, fz0, fx1, -22.6);
    fence(fx1, -21.2, fx1, fz1);
    // Life ring on the west fence.
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.08, 8, 20), M('#f4f2ee', { roughness: 0.6 }));
    ring.position.set(fx0 + 0.06, 1.15, -24);
    ring.rotation.y = Math.PI / 2;
    add(ring);
    // White resin loungers along the west side of the pool, facing it.
    const lounger = (x, z, ry) => {
      const G = new THREE.Matrix4().makeRotationY(ry).setPosition(x, 0, z);
      T(G, 0, 0.36, 0.25, 0.7, 0.07, 1.45, '#f3f3ef');
      T(G, 0, 0.18, 0.85, 0.66, 0.34, 0.06, '#e6e6e2');
      T(G, 0, 0.18, -0.4, 0.66, 0.34, 0.06, '#e6e6e2');
      const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.95);
      T(G, 0, 0.68, -0.68, 0.7, 0.07, 0.75, '#f3f3ef', q);
    };
    for (const [z, rr] of [[-25.6, 0.1], [-21.8, -0.15], [-18.4, 0.05]]) lounger(-1.9, z, Math.PI / 2 + Math.PI + rr);
    lounger(7.3, -26.5, Math.PI / 2 + 0.1);
    lounger(2.0, -31.2, 0.05);
    // Palms and a few desert shrubs in the courtyard corners.
    palm(-2.6, -33.5, 11);
    palm(7.4, -34.0, 13);
    palm(-4.2, -13.6, 9.5);
    for (const [x, z] of [[-4.6, -30], [-4.4, -20], [10.3, -30], [10.0, -18]]) shrub(x, z, 0.6);
  }

  // ---- front courtyard: gravel, palms, laundry room ----
  {
    flat(M(COL.gravel, { roughness: 1 }), -5.4, 11.3, 26.1, 41.2, 0.07);
    for (const [x0, x1, z0, z1] of [[-5.4, -3.6, 26.1, 41.2], [9.5, 11.3, 26.1, 41.2], [-5.4, 11.3, 24.3, 26.1], [-5.4, 11.3, 39.4, 41.2]]) flat(M('#c9c1b0'), x0, x1, z0, z1, 0.08);
    box(M('#e2d2b0'), 3.4, 2.7, 4.2, 5.8, 1.35, 32.6);
    box(M('#f0eeea'), 3.8, 0.2, 4.6, 5.8, 2.8, 32.6);
    T(ID, 4.08, 1.05, 32.6, 0.05, 2.0, 0.9, COL.door);
    palm(1.4, 35.6, 11);
    palm(-0.8, 29.6, 8.5);
    for (const [x, z] of [[-3, 37], [8.5, 28], [2, 39.5], [-2.5, 33]]) shrub(x, z, 0.7);
  }

  // ---- roofs: packaged HVAC units, patches ----
  {
    const inBody = (x, z) => bodies.some(([x0, x1, z0, z1]) => x > x0 + 0.6 && x < x1 - 0.6 && z > z0 + 0.6 && z < z1 - 0.6);
    for (const [x0, x1, z0, z1] of roofs) {
      const along = x1 - x0 > z1 - z0;
      const L = along ? x1 - x0 : z1 - z0;
      const Wd = along ? z1 - z0 : x1 - x0;
      for (let s = 1.5; s < L - 1; s += 2.6) {
        for (const off of [2.0, Wd - 2.0, Wd / 2]) {
          if (r() > (off === Wd / 2 ? 0.25 : 0.62)) continue;
          const js = s + (r() - 0.5) * 1.0, jo = off + (r() - 0.5) * 1.4;
          const x = along ? x0 + js : x0 + jo, z = along ? z0 + jo : z0 + js;
          if (!inBody(x, z)) continue;
          const rot = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), (r() < 0.5 ? 0 : Math.PI / 2) + (r() - 0.5) * 0.6);
          const F = new THREE.Matrix4().compose(V(x, ROOF, z), rot, V(1, 1, 1));
          T(F, 0, 0.42, 0, 1.15, 0.8, 0.95, r() < 0.7 ? '#cfd2d3' : '#b8bcbf');
          T(F, 0.2, 0.83, 0, 0.55, 0.04, 0.55, '#4d5256');
          T(F, -0.45, 0.06, 0.8, 0.2, 0.12, 0.8, '#9a9ea1'); // duct curb
        }
      }
      // Weathered patches on the white roof.
      for (let k = 0; k < Math.floor(L / 6); k++) {
        const s = r() * L, o = r() * Wd;
        const x = along ? x0 + s : x0 + o, z = along ? z0 + o : z0 + s;
        if (!inBody(x, z)) continue;
        T(ID, x, ROOF + 0.005, z, 0.8 + r() * 1.6, 0.01, 0.8 + r() * 1.6, r() < 0.5 ? '#d6d1c6' : '#cbc3b4');
      }
    }
  }

  // ---- Speedway frontage: gravel strip, palms, shrubs ----
  flat(M('#a77a5a', { roughness: 1 }), -20.3, 21, 53.9, 55.6, 0.065);
  for (const [x, h] of [[-13.4, 12], [-9.3, 13.5], [-1.4, 11], [16.3, 12.5]]) palm(x, 54.7, h);
  for (const x of [-17, -6, 3, 7, 11, 19.5]) shrub(x, 54.8, 0.7);
  // Gravel strip along the east property line with shrubs.
  flat(M('#a77a5a', { roughness: 1 }), 20.0, 21.6, -49, 53.9, 0.065);
  for (let z = -45; z < 52; z += 9) shrub(20.9, z + r() * 3, 0.6 + r() * 0.3);

  function palm(x, z, h = 11) {
    const trunk = M('#7b6a55', { roughness: 1 });
    const frond = M('#4f7a33', { roughness: 1, side: THREE.DoubleSide });
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, h, 6), trunk);
    t.position.set(x, h / 2, z);
    t.castShadow = true;
    add(t);
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2 + r() * 0.4;
      const f = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 3.0), frond);
      f.rotation.order = 'YXZ';
      f.rotation.set(Math.PI / 2 - 0.45 - r() * 0.35, -a + Math.PI / 2, 0);
      f.position.set(x + Math.cos(a) * 1.3, h - 0.35, z + Math.sin(a) * 1.3);
      f.castShadow = true;
      add(f);
    }
  }
  function shrub(x, z, sc = 1) {
    const m = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), M(r() < 0.5 ? '#6f7f45' : '#7d8a52', { roughness: 1 }));
    m.scale.set(0.9 * sc, 0.6 * sc, 0.9 * sc);
    m.position.set(x, 0.45 * sc, z);
    m.castShadow = true;
    add(m);
  }

  finish();
  const H = ROOF;
  const floorRange = (n) => [(n - 1) * FH, n * FH];
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * H;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, 55.2);
      case 'pool': return V(2.6, 2.2, -22);
      case 'courtyard': return V(2.6, 3, 32.6);
      case 'parking': return V((u - 0.5) * W, 2, 6);
      case 'rear': return V((u - 0.5) * W, y, -50);
      case 'roof': return V((u - 0.5) * W, H + 1.5, v);
      default: return V(0, y, 0);
    }
  };
  return { group: g, width: W, depth: D, height: H, floorRange, hotspotPosition };
}
