// Real surroundings for site 'nova-bigtree' (1802 S Nova Rd, South Daytona, FL):
// the wooded tract on the south-west corner of S Nova Rd (SR 5A) and Big Tree Rd.
// Called by buildSuburban (site.bare). ctx: { THREE, scene, add, flat, box, W, D, front, site, r, mats }
// Model frame: origin = centroid of the tract, +x = east, +z = south, metres.
// Everything comes from nova-bigtree-data.js (OpenStreetMap roads, sidewalks,
// building footprints and ponds; roof colours and street trees sampled from
// satellite imagery):
//   - S Nova Rd: divided, two/three lanes each way with bike lanes, a wide
//     median with a drainage canal; signalised at Big Tree Rd (mast arms)
//   - Big Tree Rd: two lanes + bike lanes, widening to turn lanes at Nova;
//     Old Big Tree Rd branches off to the west near the tract's north tip
//   - south: South Daytona Storage & Offices (Space Dr) self-storage rows
//   - north-east corner across Big Tree Rd: Circle K with its fuel canopy
//   - Downey Ave houses to the north, mobile-home communities (Green Acres
//     Cir) to the south and west, ponds and homes east of Nova
import { desertKit } from './tucson-snyder.js';
import { ROADS, FOOTWAYS, BLDGS, WATER, WETLAND, TREES } from './nova-bigtree-data.js';

const pairs = (f) => { const p = []; for (let i = 0; i < f.length; i += 2) p.push([f[i], f[i + 1]]); return p; };

export function site_nova_bigtree(ctx) {
  const K = desertKit(ctx, { seed: 1802 });
  const { THREE, add } = ctx;
  const { M, mat, poly, box, car, sign, canopy } = K;
  const r = K.r;
  ctx.mats.grass.color.set('#7f8f4e');
  // Wide ground beyond the scene (fades into the haze from the aerial views).
  const far = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000), M('#7b8a50', { roughness: 1 }));
  far.rotation.x = -Math.PI / 2;
  far.position.y = -0.05;
  add(far);

  const roadM = M('#4b4d50', { roughness: 0.95 });
  const walkM = M('#c9c6be', { roughness: 0.95 });
  const sandM = M('#b9ab86', { roughness: 1 });
  const lawnM = M('#86964f', { roughness: 1 });

  // ---------- polyline helpers ----------
  // Offset a polyline sideways by o (left of travel = +o) with mitred joints.
  const offset = (pts, o) => pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1;
    let nx = dz / l, nz = -dx / l; // left normal (x east, z south)
    if (i > 0 && i < pts.length - 1) {
      const d1 = [p[0] - a[0], p[1] - a[1]], l1 = Math.hypot(...d1) || 1;
      const n1 = [d1[1] / l1, -d1[0] / l1];
      const k = 1 / Math.max(0.5, n1[0] * nx + n1[1] * nz);
      nx *= k; nz *= k;
    }
    return [p[0] + nx * o, p[1] + nz * o];
  });
  // Flat ribbon of width w along a polyline.
  const ribbon = (pts, w, y, m) => {
    if (pts.length < 2) return null;
    const L = offset(pts, w / 2), R = offset(pts, -w / 2);
    const pos = [], idx = [];
    for (let i = 0; i < pts.length; i++) pos.push(L[i][0], y, L[i][1], R[i][0], y, R[i][1]);
    for (let i = 0; i < pts.length - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(pos.map((_, i) => (i % 3 === 1 ? 1 : 0)), 3));
    g.setIndex(idx);
    const mesh = new THREE.Mesh(g, m);
    mesh.receiveShadow = true;
    return add(mesh);
  };
  const lengthOf = (pts) => { let s = 0; for (let i = 1; i < pts.length; i++) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return s; };
  // Point and direction at distance t along a polyline.
  const at = (pts, t) => {
    for (let i = 1; i < pts.length; i++) {
      const [ax, az] = pts[i - 1], [bx, bz] = pts[i];
      const l = Math.hypot(bx - ax, bz - az);
      if (t <= l || i === pts.length - 1) { const u = Math.min(1, t / (l || 1)); return [ax + (bx - ax) * u, az + (bz - az) * u, (bx - ax) / (l || 1), (bz - az) / (l || 1)]; }
      t -= l;
    }
    return [...pts[pts.length - 1], 1, 0];
  };
  const dashed = (pts, w, y, m, dash = 3, gap = 9) => {
    const len = lengthOf(pts);
    for (let t = 1; t + dash < len; t += dash + gap) {
      const [ax, az] = at(pts, t), [bx, bz] = at(pts, t + dash);
      ribbon([[ax, az], [bx, bz]], w, y, m);
    }
  };
  const clip = (pts, t0, t1) => {
    const out = [at(pts, t0).slice(0, 2)];
    let s = 0;
    for (let i = 1; i < pts.length; i++) {
      s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      if (s > t0 && s < t1) out.push(pts[i]);
    }
    out.push(at(pts, t1).slice(0, 2));
    return out;
  };

  // ---------- water, wetland ----------
  const waterM = M('#3f4d3e', { roughness: 0.18, metalness: 0.15 });
  for (const [kind, f] of WATER) {
    const p = pairs(f);
    poly(lawnM, p, 0.015); // mown bank (the water sits inside it)
    poly(waterM, p.map(([x, z]) => [x, z]), 0.03);
  }
  for (const f of WETLAND) poly(M('#6e7c45', { roughness: 1 }), pairs(f), 0.012);

  // ---------- roads ----------
  const width = ([hw, , lanes, oneway, service]) => {
    if (hw === 'primary') return (lanes || 2) * 3.6 + 2.2;
    if (hw === 'tertiary') return lanes >= 4 ? 14 : 10.6;
    if (hw === 'service') return service === 'driveway' ? 3.6 : service === 'parking_aisle' ? 6.5 : 6.2;
    return 6.6;
  };
  const lanesW = [], yellow = mat.yellow, white = mat.white;
  // Paving first (service, residential, then arterials on top).
  const order = { service: 0, residential: 1, unclassified: 1, tertiary: 2, primary: 3 };
  const sorted = [...ROADS].sort((a, b) => order[a[0]] - order[b[0]]);
  for (const rd of sorted) {
    const pts = pairs(rd[5]);
    ribbon(pts, width(rd), 0.04 + order[rd[0]] * 0.002, rd[0] === 'service' ? M('#55575a', { roughness: 0.95 }) : roadM);
    if (rd[0] === 'primary' || rd[0] === 'tertiary') lanesW.push(rd);
  }
  // Joint patches at the Nova / Big Tree intersection.
  poly(roadM, [[183, -362], [212, -378], [262, -372], [282, -350], [272, -318], [238, -306], [200, -310], [176, -330]], 0.047);
  // Markings on the arterials (skip the intersection box).
  const IC = [229, -340];
  const awayFromIC = (pts, rad) => {
    const len = lengthOf(pts);
    let t0 = 0, t1 = len;
    const d = (t) => { const [x, z] = at(pts, t); return Math.hypot(x - IC[0], z - IC[1]); };
    while (t0 < len && d(t0) < rad) t0 += 1;
    while (t1 > 0 && d(t1) < rad) t1 -= 1;
    return t1 - t0 > 4 ? clip(pts, t0, t1) : null;
  };
  for (const rd of lanesW) {
    const [hw, , lanes, oneway] = rd;
    const pts = awayFromIC(pairs(rd[5]), 30);
    if (!pts) continue;
    const w = width(rd), y = 0.056;
    if (oneway) {
      // Divided carriageway: yellow left edge, bike lane on the right.
      ribbon(offset(pts, w / 2 - 0.35), 0.13, y, yellow);
      ribbon(offset(pts, -w / 2 + 0.35), 0.13, y, white);
      ribbon(offset(pts, -w / 2 + 2.0), 0.15, y, white);
      const lw = (w - 2.4) / (lanes || 2);
      for (let k = 1; k < (lanes || 2); k++) dashed(offset(pts, w / 2 - 0.4 - k * lw), 0.13, y, white);
    } else {
      for (const o of [-0.13, 0.13]) ribbon(offset(pts, o), 0.11, y, yellow);
      for (const sd of [-1, 1]) {
        ribbon(offset(pts, sd * (w / 2 - 0.3)), 0.12, y, white);
        ribbon(offset(pts, sd * (w / 2 - 1.9)), 0.15, y, white);
      }
      if (lanes > 2) for (const sd of [-1, 1]) dashed(offset(pts, sd * 3.6), 0.13, y, white, 3, 6);
    }
  }

  // ---------- sidewalks and crosswalks ----------
  for (const [kind, f] of FOOTWAYS) {
    const pts = pairs(f);
    if (kind === 'sidewalk') { ribbon(pts, 1.8, 0.09, walkM); continue; }
    // Continental crosswalk: bars parallel to traffic across the walking path.
    const len = lengthOf(pts);
    for (let t = 0.6; t < len - 0.4; t += 1.1) {
      const [x, z, ux, uz] = at(pts, t);
      ribbon([[x - ux * 0.3, z - uz * 0.3], [x + ux * 0.3, z + uz * 0.3]], 3.2, 0.06, white);
    }
  }
  // Stop bars on the four approaches.
  for (const [ax, az, bx, bz] of [[200, -330, 203, -318], [218, -371, 236, -374], [254, -352, 252, -362], [246, -318, 262, -322]]) ribbon([[ax, az], [bx, bz]], 0.5, 0.06, white);

  // ---------- mast-arm signals (galvanised, as in the street view) ----------
  const steel = M('#9da2a4', { roughness: 0.45, metalness: 0.6 });
  const headM = M('#1f2224', { roughness: 0.6 });
  const lens = [M('#c0392b', { emissive: '#ff2a1a', emissiveIntensity: 0.5 }), M('#3a3a2a'), M('#2a3a2a')];
  const mast = (x, z, dx, dz, len, heads, face = 1) => {
    box(M('#bdb8ae'), 1.0, 0.4, 1.0, x, 0.2, z, 0, false);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.26, 7.6, 10), steel);
    pole.position.set(x, 3.8, z);
    pole.castShadow = true;
    add(pole);
    const l = Math.hypot(dx, dz); const ux = dx / l, uz = dz / l;
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.17, len, 8), steel);
    arm.rotation.order = 'YXZ';
    arm.rotation.set(Math.PI / 2 - 0.03, Math.atan2(ux, uz), 0);
    arm.position.set(x + ux * len / 2, 7.3, z + uz * len / 2);
    arm.castShadow = true;
    add(arm);
    // Signal heads hang from the arm, facing the approach (+normal side).
    for (let k = 0; k < heads; k++) {
      const t = len - 1.2 - k * 3.4;
      const hx = x + ux * t, hz = z + uz * t;
      const ry = Math.atan2(ux, uz) - face * Math.PI / 2;
      box(headM, 0.45, 1.25, 0.35, hx, 6.6, hz, ry);
      box(M('#2b2d2f'), 0.75, 1.55, 0.05, hx - Math.cos(ry) * 0.0, 6.6, hz, ry);
      for (let i = 0; i < 3; i++) {
        const lm = new THREE.Mesh(new THREE.CircleGeometry(0.12, 10), lens[i]);
        lm.position.set(hx + Math.sin(ry) * 0.19, 7.0 - i * 0.38, hz + Math.cos(ry) * 0.19);
        lm.rotation.y = ry;
        add(lm);
      }
    }
    // Street-name blade and a luminaire on top.
    const lum = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.18, 0.4), steel);
    lum.position.set(x + ux * 0.7, 9.0, z + uz * 0.7);
    add(lum);
    const ext = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.6, 6), steel);
    ext.position.set(x, 8.3, z);
    add(ext);
  };
  // NW corner: arm south over eastbound Big Tree Rd; SE: north over westbound;
  // NE: west over southbound Nova; SE median/east side: west over northbound Nova.
  mast(190, -354, 0.33, 0.94, 15, 3);
  mast(266, -322, -0.36, -0.93, 13, 3);
  mast(252, -382, -0.94, 0.33, 16, 3);
  mast(284, -326, -1, 0.05, 15, 3, -1);

  // ---------- utility poles and wires along Big Tree Rd (north side) ----------
  const woodM = M('#6f5d48', { roughness: 1 });
  const wireM = M('#222222', { roughness: 0.8 });
  const btNorth = ROADS.find((rd) => rd[1] === 'Big Tree Road' && rd[5].length > 12);
  if (btNorth) {
    const pts = offset(pairs(btNorth[5]), 9.5);
    const len = lengthOf(pts);
    let prev = null;
    for (let t = 12; t < len - 30; t += 46) {
      const [x, z, ux, uz] = at(pts, t);
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.18, 11, 6), woodM);
      p.position.set(x, 5.5, z);
      p.castShadow = true;
      add(p);
      box(woodM, 2.4, 0.14, 0.14, x, 10.2, z, -Math.atan2(uz, ux) + Math.PI / 2, false);
      if (prev) {
        for (const o of [-1.0, 0, 1.0]) {
          const ax = prev[0] - uz * o, az = prev[1] + ux * o, bx = x - uz * o, bz = z + ux * o;
          const l = Math.hypot(bx - ax, bz - az);
          const w = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, l, 3), wireM);
          w.rotation.set(Math.PI / 2, Math.atan2(bx - ax, bz - az), 0);
          w.position.set((ax + bx) / 2, 10.25 - (o === 0 ? 0.6 : 0), (az + bz) / 2);
          add(w);
        }
      }
      prev = [x, z];
    }
  }
  // Cobra-head street lights along the Nova frontage (west side).
  const novaSB = ROADS.filter((rd) => rd[1] === 'South Nova Road' && rd[3] && rd[5].length > 8);
  for (const rd of novaSB) {
    const pts = pairs(rd[5]);
    const len = lengthOf(pts);
    for (let t = 30; t < len - 20; t += 55) {
      const [x, z, ux, uz] = at(pts, t);
      // Right-hand side of the direction of travel.
      const rx = -uz, rz = ux, o = width(rd) / 2 + 2.2;
      const px = x + rx * o, pz = z + rz * o;
      if (Math.hypot(px - IC[0], pz - IC[1]) < 40) continue;
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 10, 6), steel);
      pole.position.set(px, 5, pz);
      add(pole);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 3), steel);
      arm.position.set(px - rx * 1.5, 9.9, pz - rz * 1.5);
      arm.rotation.y = Math.atan2(rx, rz);
      add(arm);
      box(M('#cfd2d4', { emissive: '#fff6e0', emissiveIntensity: 0.1 }), 0.5, 0.2, 0.9, px - rx * 3, 9.8, pz - rz * 3, Math.atan2(rx, rz), false);
    }
  }

  // ---------- buildings (OSM footprints, satellite roof colours) ----------
  const wallMat = M('#ffffff', { vertexColors: true, roughness: 0.9 });
  const roofMat = M('#ffffff', { vertexColors: true, roughness: 0.85 });
  const c3 = new THREE.Color();
  const colorize = (g, wallC, roofC) => {
    const n = g.attributes.position.count;
    const cols = new Float32Array(n * 3);
    const capsEnd = g.groups?.length ? g.groups[0].count : 0;
    for (let i = 0; i < n; i++) {
      c3.set(i < capsEnd ? roofC : wallC);
      cols.set([c3.r, c3.g, c3.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    return g;
  };
  // Satellite roof colours include shading; lift them a little.
  const lift = (hex, k = 1.12) => { c3.set(hex); c3.r = Math.min(1, c3.r * k); c3.g = Math.min(1, c3.g * k); c3.b = Math.min(1, c3.b * k); return '#' + c3.getHexString(); };
  const extrude = (pts, h, wallC, roofC) => {
    const sh = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
    const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    g.deleteAttribute('uv');
    colorize(g, wallC, roofC);
    const m = new THREE.Mesh(g, wallMat);
    m.castShadow = m.receiveShadow = true;
    return add(m);
  };
  // Oriented bounding rectangle (min area over edge directions).
  const obb = (pts) => {
    let best = null;
    for (let i = 0; i < pts.length; i++) {
      const [ax, az] = pts[i], [bx, bz] = pts[(i + 1) % pts.length];
      const a = Math.atan2(bz - az, bx - ax), c = Math.cos(a), s = Math.sin(a);
      let u0 = Infinity, u1 = -Infinity, v0 = Infinity, v1 = -Infinity;
      for (const [x, z] of pts) { const u = x * c + z * s, v = -x * s + z * c; u0 = Math.min(u0, u); u1 = Math.max(u1, u); v0 = Math.min(v0, v); v1 = Math.max(v1, v); }
      const ar = (u1 - u0) * (v1 - v0);
      if (!best || ar < best.ar) best = { ar, a, c, s, u: (u0 + u1) / 2, v: (v0 + v1) / 2, L: u1 - u0, Wd: v1 - v0 };
    }
    best.x = best.u * best.c - best.v * best.s; best.z = best.u * best.s + best.v * best.c;
    return best;
  };
  // Hip roof over an oriented rectangle (ridge along the long side).
  const hipRoof = (o, y, rise, eave, color) => {
    let L = o.L + eave * 2, Wd = o.Wd + eave * 2, a = o.a;
    if (Wd > L) { [L, Wd] = [Wd, L]; a += Math.PI / 2; }
    const rl = Math.max(0, L - Wd) / 2;
    const P = [[-L / 2, -Wd / 2], [L / 2, -Wd / 2], [L / 2, Wd / 2], [-L / 2, Wd / 2]];
    const r0 = [-rl, rise], r1 = [rl, rise];
    const v = [];
    const tri = (A, Bp, Cp) => v.push(...A, ...Bp, ...Cp);
    const b = (i) => [P[i][0], 0, P[i][1]];
    const R0 = [r0[0], rise, 0], R1 = [r1[0], rise, 0];
    tri(b(0), R0, b(1)); tri(b(1), R0, R1); // north slope
    tri(b(2), R1, b(3)); tri(b(3), R1, R0); // south slope
    tri(b(1), R1, b(2)); tri(b(3), R0, b(0)); // hips
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
    g.computeVertexNormals();
    // Make sure every face points up.
    const nrm = g.attributes.normal;
    let flip = false;
    for (let i = 0; i < nrm.count; i += 3) if (nrm.getY(i) < 0) { flip = true; break; }
    if (flip) {
      const p = g.attributes.position.array;
      for (let i = 0; i < p.length; i += 9) for (let k = 0; k < 3; k++) { const t = p[i + 3 + k]; p[i + 3 + k] = p[i + 6 + k]; p[i + 6 + k] = t; }
      g.computeVertexNormals();
    }
    g.rotateY(-a);
    g.translate(o.x, y, o.z);
    const cols = new Float32Array(g.attributes.position.count * 3);
    c3.set(color);
    for (let i = 0; i < g.attributes.position.count; i++) cols.set([c3.r, c3.g, c3.b], i * 3);
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    const m = new THREE.Mesh(g, roofMat);
    m.castShadow = m.receiveShadow = true;
    return add(m);
  };
  const mhWalls = ['#eceae3', '#e6e1d4', '#dfe3e2', '#efe9da', '#d9dcd6', '#e8e2cf'];
  const houseWalls = ['#e2d6bf', '#d9cdb5', '#e8dfcc', '#cfc6b3', '#e3dccd', '#d6c9ae', '#c9c2b0'];
  for (const [kind, area, roofC, name, f] of BLDGS) {
    const pts = pairs(f);
    if (kind === 'canopy') continue; // fuel canopy drawn below
    if (kind === 'house') {
      const o = obb(pts);
      const h = 3.0;
      extrude(pts, h, houseWalls[Math.floor(r() * houseWalls.length)], roofC);
      hipRoof(o, h, Math.min(o.L, o.Wd) * 0.22, 0.45, lift(roofC, 1.05));
    } else if (kind === 'mh') {
      extrude(pts, 3.1, mhWalls[Math.floor(r() * mhWalls.length)], lift(roofC));
    } else if (kind === 'storage') {
      extrude(pts, 3.0, '#d8d3c7', lift(roofC, 1.08));
    } else if (kind === 'circlek') {
      extrude(pts, 5.0, '#ece8e0', '#d9d9d6');
    } else {
      extrude(pts, area > 1000 ? 6.5 : 4.6, '#d6d1c6', lift(roofC, 1.06));
    }
  }

  // Circle K (OSM): store sign + fuel canopy (red fascia, as seen down Big Tree Rd).
  const ck = BLDGS.find((b) => b[0] === 'circlek');
  if (ck) {
    const o = obb(pairs(ck[4]));
    // Red band across the storefront facing the pumps (south-east).
    const ry = -o.a;
    const nx = Math.sin(ry), nz = Math.cos(ry);
    const side = (nz * (229 - o.x) + nx * (-340 - o.z)) > 0 ? 1 : -1;
    const d = (o.Wd / 2 + 0.05) * side;
    box(M('#d4202a'), o.L, 0.9, 0.2, o.x + nx * d, 4.4, o.z + nz * d, ry, false);
    sign('CIRCLE K', o.x + nx * (d + 0.12 * side), 4.4, o.z + nz * (d + 0.12 * side), ry + (side < 0 ? Math.PI : 0), { w: 5.5, h: 0.8, color: '#ffffff', glow: 0.3 });
  }
  const cn = BLDGS.find((b) => b[0] === 'canopy');
  if (cn) {
    const o = obb(pairs(cn[4]));
    canopy(o.x, o.z, o.L, o.Wd, -o.a, { h: 5.0, fascia: '#d4202a', band: '#ffffff' });
  }

  // ---------- trees outside the tract (satellite canopy) ----------
  const ico = new THREE.IcosahedronGeometry(1, 1);
  const leaf = M('#ffffff', { roughness: 0.95 });
  const bark = M('#5d5145', { roughness: 1 });
  const nT = TREES.length / 3;
  const crowns = new THREE.InstancedMesh(ico, leaf, nT * 2);
  const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.35, 0.5, 1, 5, 1, true), bark, nT);
  const mm = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new THREE.Vector3(), ps = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
  const greens = ['#4f6232', '#5b6d38', '#47592d', '#66773f', '#596a3a', '#6c7a45'];
  let ci = 0;
  // Tour cameras that stand outside the tract (no tree may swallow them).
  const cams = [[150, -299], [250, 120], [-338, 130], [175, 125]];
  for (let i = 0; i < nT; i++) {
    const x = TREES[i * 3], z = TREES[i * 3 + 1], s = TREES[i * 3 + 2];
    if (cams.some(([cx, cz]) => Math.hypot(x - cx, z - cz) < 12)) continue;
    const th = 2.6 * s;
    trunks.setMatrixAt(i, mm.compose(ps.set(x, th / 2, z), q.identity(), sc.set(s, th, s)));
    const top = (6.5 + r() * 5) * s;
    const g = greens[Math.floor(r() * greens.length)];
    for (let k = 0; k < 2; k++) {
      const rad = (2.4 + r() * 1.3) * s;
      const a = r() * 6.28, d = k ? 1.4 * s : 0;
      crowns.setMatrixAt(ci, mm.compose(ps.set(x + Math.cos(a) * d, Math.max(rad * 0.75, top - rad * 0.4 - k * 1.2), z + Math.sin(a) * d), q.setFromAxisAngle(UP, r() * 6), sc.set(rad, rad * 0.72, rad)));
      crowns.setColorAt(ci++, c3.set(g).multiplyScalar(0.92 + r() * 0.16));
    }
  }
  crowns.count = ci;
  for (const m of [crowns, trunks]) { m.castShadow = true; m.receiveShadow = m === crowns; m.instanceMatrix.needsUpdate = true; m.computeBoundingSphere(); add(m); }
  crowns.instanceColor.needsUpdate = true;
  // A few sabal palms along the frontages across the roads (street view).
  for (const [x, z] of [[176, -300], [168, -292], [205, -392], [289, -300], [292, -270], [252, -398], [-14, -214], [41, -253]]) K.palm(x, z, 7 + r() * 4);

  // ---------- traffic ----------
  const onRoad = (rd, t, lane, ry0 = 0) => {
    const pts = pairs(rd[5]);
    const [x, z, ux, uz] = at(pts, t);
    const rx = -uz, rz = ux; // right of travel
    // Keep the lanes in front of the street-level tour cameras clear.
    if ([[150, -299], [250, 120], [-338, 130]].some(([cx, cz]) => Math.hypot(x - cx, z - cz) < 45)) return;
    car(x + rx * lane, z + rz * lane, Math.atan2(-uz, ux) + ry0);
  };
  for (const rd of ROADS) {
    if (rd[0] !== 'primary' && rd[0] !== 'tertiary') continue;
    const len = lengthOf(pairs(rd[5]));
    const lanes = rd[2] || 2;
    for (let t = 8 + r() * 30; t < len - 6; t += 30 + r() * 60) {
      if (rd[3]) onRoad(rd, t, width(rd) / 2 - 2.6 - Math.floor(r() * lanes) * 3.6);
      else if (r() < 0.5) onRoad(rd, t, 2.4);
      else onRoad(rd, t, -2.4, Math.PI);
    }
  }
}
