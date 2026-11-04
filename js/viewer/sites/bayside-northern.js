// Real surroundings for site 'bayside-northern' (213-04 Northern Blvd,
// Bayside, Queens), traced from satellite imagery and OpenStreetMap.
// Called by buildSuburban (site.bare). ctx: { THREE, scene, add, flat, box, W, D, front, site, r, mats }
// Model axes: building centred at origin, +z = north (Northern Blvd), +x = west,
// metres. The model frame is turned 17° from true north so the strip is square
// to it (Northern Blvd runs ENE here).
//
//   - Northern Blvd: 24 m kerb to kerb (z 44..68), three lanes each way,
//     4 m sidewalks with young street trees on the south side
//   - Bell Blvd crosses at x ≈ -72 (skewed ~4°), wide west sidewalk with trees
//   - 45th Road behind the strip (z -25..-33), two-storey attached houses beyond
//   - the lot: walk along the shops, angled double row, perpendicular stalls
//     along 212-14's wall and in front of the teal 45-18 Bell Blvd building
//   - west: 212-14 Northern Blvd, a four-storey beige-brick office/medical
//     building (2016, 50 ft) with a low charcoal rear wing and steel stair;
//     the Con Ed Bayside substation; north side: Northern Bell Plaza (213-01,
//     15.8 m), White Castle, the car dealership; east of Bell: Capital One, the library
//   - every other building: OSM footprint + NYC survey height (BAYSIDE_BLDGS)
//   - trees: positions sampled from the satellite canopy
import { desertKit } from './tucson-snyder.js';
import { textTexture, BRICK } from '../textures.js';
import { boxGeo } from '../kit.js';

export function site_bayside_northern(ctx) {
  const K = desertKit(ctx, { seed: 21304 });
  const { THREE, add } = ctx;
  const { M, B, mat, flat, strip, poly, box, kerb, dashes, car, sign } = K;
  const r = K.r;
  const { W, D } = ctx;
  const zA = D / 2; // CVS front
  const zB = D / 2 - 0.6; // in-line shop fronts
  const xE = -W / 2; // CVS east face
  mat.concrete.color.set('#c8c5bf');
  ctx.mats.grass.color.set('#7a8d5c'); // muted yards / lawns
  const walkM = M('#cbc8c1');
  const roadM = M('#4a4c4f', { roughness: 0.95 });
  const lotM = M('#3f4144', { roughness: 0.95 });

  // Bell Blvd centre line (x at a given z): skewed ~4° to the model grid.
  const bellX = (z) => -72.4 + 0.07 * (z - 56);
  const N0 = 44.0, N1 = 68.3, NC = (N0 + N1) / 2; // Northern Blvd kerbs / centre
  const B2 = 7.0; // Bell Blvd half width

  // ---------- helpers ----------
  const seg = (m, ax, az, bx, bz, w, y) => strip(m, ax, az, bx, bz, w, y);
  // Zebra crosswalk along the walking path P->Q (bars parallel to traffic).
  const zebra = (px, pz, qx, qz, w = 3.2) => {
    const len = Math.hypot(qx - px, qz - pz);
    const ux = (qx - px) / len, uz = (qz - pz) / len;
    for (let t = 0.4; t < len - 0.2; t += 1.0) {
      const cx = px + ux * t, cz = pz + uz * t;
      seg(mat.white, cx - (-uz) * w / 2, cz - ux * w / 2, cx + (-uz) * w / 2, cz + ux * w / 2, 0.5, 0.075);
    }
  };
  // Road with kerbs and optional sidewalks (both sides).
  const road = (ax, az, bx, bz, w, { lanes = [], centre = 'double', walk = 0, y = 0.045 } = {}) => {
    const len = Math.hypot(bx - ax, bz - az);
    const ux = (bx - ax) / len, uz = (bz - az) / len, nx = -uz, nz = ux;
    seg(roadM, ax, az, bx, bz, w, y);
    const off = (o) => [ax + nx * o, az + nz * o, bx + nx * o, bz + nz * o];
    if (centre === 'double') for (const o of [-0.13, 0.13]) seg(mat.yellow, ...off(o), 0.1, y + 0.03);
    for (const o of lanes) dashes(mat.white, ...off(o), 3, 9, 0.12, y + 0.03);
    for (const sd of [-1, 1]) {
      kerb(...off(sd * (w / 2 + 0.15)));
      if (walk) seg(walkM, ...off(sd * (w / 2 + 0.3 + walk / 2)), walk, 0.12);
    }
  };

  // ================= ROADS =================
  // Northern Blvd west of Bell (straight) and its bend east of Bell (~7°).
  {
    const xb = bellX(NC);
    seg(roadM, 260, NC, xb, NC, N1 - N0, 0.045);
    for (const o of [-0.13, 0.13]) seg(mat.yellow, 260, NC + o, xb + B2 + 1, NC + o, 0.1, 0.075);
    for (const z of [N0 + 3.4, N0 + 7.6, N1 - 3.4, N1 - 7.6]) dashes(mat.white, 255, z, xb + B2 + 3, z, 3, 9, 0.12, 0.075);
    // Painted median hatch west of the 213th St turn bay (satellite).
    for (let x = 50; x > 14; x -= 3) seg(mat.yellow, x, NC - 1.0, x - 1.6, NC + 1.0, 0.18, 0.074);
    for (const o of [-1.1, 1.1]) seg(mat.yellow, 52, NC + o, 12, NC + o, 0.12, 0.074);
    // Kerbs (gaps for side streets and the lot entrance).
    const kN = (a, b, z) => kerb(a, z, b, z);
    kN(260, 151, N0 - 0.15); kN(139, 27.5, N0 - 0.15); kN(19.5, xb + B2 + 0.3, N0 - 0.15);
    kN(260, 170.5, N1 + 0.15); kN(162, 95, N1 + 0.15); kN(86, 18, N1 + 0.15); kN(9, xb + B2 + 1.5, N1 + 0.15);
    // Sidewalks.
    flat(walkM, 151, 260, N0 - 4.3, N0, 0.12);
    flat(walkM, xb + B2 + 0.3, 139, N0 - 4.3, N0, 0.12);
    flat(walkM, 170.5, 260, N1, N1 + 4.4, 0.12);
    flat(walkM, 95, 162, N1, N1 + 4.4, 0.12);
    flat(walkM, 18, 86, N1, N1 + 4.4, 0.12);
    flat(walkM, xb + B2 + 1.5, 9, N1, N1 + 4.4, 0.12);
    // East of Bell: the road bends south-east (OSM sidewalks).
    const ex = xb - B2, k = 0.13;
    road(ex, NC, -270, NC - k * (270 + ex), N1 - N0, { lanes: [-8.1, -4, 4, 8.1], walk: 4.2 });
    flat(roadM, xb - B2 - 1, xb + B2 + 1, N0 - 0.4, N1 + 0.4, 0.044); // intersection box
  }
  // Bell Blvd (two-way, parking both sides).
  road(bellX(275), 275, bellX(N1 + 0.5), N1 + 0.5, 2 * B2, { lanes: [], walk: 4.2 });
  road(bellX(N0 - 0.5), N0 - 0.5, bellX(-270), -270, 2 * B2, { lanes: [], walk: 0 });
  // Bell Blvd sidewalks south of Northern: wide west walk (to the teal wall / lot), east walk.
  {
    const zs = [N0 - 0.5, -24.6, -33.4, -103.6, -112.4, -270];
    for (let i = 0; i < zs.length - 1; i += 2) {
      const a = zs[i], b = zs[i + 1];
      poly(walkM, [[bellX(a) + B2 + 0.3, a], [bellX(a) + B2 + 6.6, a], [bellX(b) + B2 + 6.6, b], [bellX(b) + B2 + 0.3, b]], 0.12);
      poly(walkM, [[bellX(a) - B2 - 0.3, a], [bellX(a) - B2 - 4.5, a], [bellX(b) - B2 - 4.5, b], [bellX(b) - B2 - 0.3, b]], 0.12);
    }
  }
  // 45th Road behind the strip, 45th Drive, and the side streets north of Northern.
  road(bellX(-29) + B2 + 0.3, -29, 152, -29, 8.4, { centre: 'none', walk: 0 });
  flat(walkM, bellX(-24) + B2 + 6.6, 152, -24.6, -18.2, 0.12); // north walk (strip's rear)
  flat(walkM, bellX(-37) + B2 + 6.6, 152, -37.6, -33.4, 0.12);
  road(bellX(-29) - B2 - 0.3, -29, -112, -29, 8.4, { centre: 'none', walk: 3.8 });
  road(bellX(-108) + B2 + 0.3, -108, 152, -108, 8.4, { centre: 'none', walk: 3.8 });
  road(bellX(-108) - B2 - 0.3, -108, -205, -108, 8.4, { centre: 'none', walk: 3.8 });
  road(12.8, N1 + 0.3, 17.2, 275, 9, { centre: 'none', walk: 3.8 }); // 213th St
  road(90.5, N1 + 0.3, 95.5, 275, 9, { centre: 'none', walk: 3.8 }); // 212th St
  road(166.3, N1 + 0.3, 172, 275, 9, { centre: 'none', walk: 3.8 }); // 211th St (north)
  road(145, N0 - 0.3, 137, -270, 9, { centre: 'none', walk: 3.8 }); // 211th St (south)
  road(-147, 47, -158, 275, 9, { centre: 'none', walk: 3.8 }); // 214th Pl
  road(190, 192, -200, 192, 10, { centre: 'double', walk: 3.8 }); // 43rd Ave
  // Crosswalks at Northern & Bell, 213th St and 45th Rd.
  zebra(bellX(N0) + B2 + 2.5, N0 - 0.2, bellX(N1) + B2 + 2.5, N1 + 0.2, 3.6);
  zebra(bellX(N0) - B2 - 2.5, N0 - 0.2, bellX(N1) - B2 - 2.5, N1 + 0.2, 3.6);
  zebra(bellX(N0 - 3) + B2, N0 - 3, bellX(N0 - 3) - B2, N0 - 3, 3.2);
  zebra(bellX(N1 + 3) + B2, N1 + 3, bellX(N1 + 3) - B2, N1 + 3, 3.2);
  zebra(17.6, N1 + 2.2, 8.0, N1 + 2.2, 3.0);
  zebra(bellX(-29) + B2, -22.6, bellX(-29) - B2, -22.6, 3.0);
  // Stop bars.
  seg(mat.white, bellX(N0) + B2 + 4.8, N0 + 0.3, bellX(N0) + B2 + 4.8, NC - 0.3, 0.45, 0.076);
  seg(mat.white, bellX(N1) - B2 - 4.8, NC + 0.3, bellX(N1) - B2 - 4.8, N1 - 0.3, 0.45, 0.076);

  // Other parking lots (OSM): White Castle, Rite Aid, east of 214th Pl...
  for (const arr of LOTS) { const p = []; for (let i = 0; i < arr.length; i += 2) p.push([arr[i], arr[i + 1]]); poly(lotM, p, 0.04); }

  // ================= THE LOT =================
  const lotEdge = (z) => bellX(z) + B2 + 6.6;
  poly(lotM, [[31.7, zB], [31.7, N0 - 4.3], [lotEdge(N0 - 4.3), N0 - 4.3], [lotEdge(12.0), 12.0], [-31.4, 12.0], [-31.4, zB]], 0.05);
  // Driveway aprons: Northern Blvd (west end) and Bell Blvd.
  flat(lotM, 19.5, 27.5, N0 - 4.3, N0 + 0.05, 0.125);
  poly(lotM, [[lotEdge(21) + 0.2, 21], [lotEdge(30) + 0.2, 30], [bellX(30) + B2 + 0.4, 30], [bellX(21) + B2 + 0.4, 21]], 0.125);
  // Walk along the shops (raised) and the ramp landing along the CVS east face.
  box(mat.concrete, W + 0.6, 0.15, 20.0 - zB, 0.3, 0.075, (zB + 20.0) / 2, 0, false);
  box(mat.concrete, 2.6, 0.15, 20.0 - 12.0, xE - 1.3, 0.075, 16.0, 0, false);
  kerb(31.6, 20.1, xE - 2.6, 20.1, 0.2);
  kerb(xE - 2.7, 12.0, xE - 2.7, 20.1, 0.2);
  // Stall striping and cars (satellite): angled double row in the middle.
  const angled = (xa, xb, z0, z1, lean, fill) => {
    const dz = z1 - z0, dx = lean * Math.abs(dz) * 0.47, pitch = 2.95;
    for (let x = xa; x >= xb; x -= pitch) seg(mat.white, x, z0, x + dx, z1, 0.12, 0.075);
    for (let x = xa - pitch / 2; x > xb; x -= pitch) {
      if (r() < fill) car(x + dx / 2, (z0 + z1) / 2, Math.atan2(-dz, dx) + (r() - 0.5) * 0.05);
    }
  };
  seg(mat.white, 16, 28.0, -46, 28.0, 0.12, 0.075);
  angled(16, -40, 28.0, 33.0, 1, 0.75);
  angled(16, -40, 28.0, 23.0, 1, 0.7);
  // Accessible stalls + hatched access aisle at the east end of the double row.
  for (let k = 0; k < 6; k++) seg(mat.white, -43 - k * 0.5, 23.2, -43 - k * 0.5 - 1.2, 32.8, 0.1, 0.076);
  flat(mat.blue, -46.6, -45.4, 27.4, 28.6, 0.077);
  car(-49.5, 30.5, Math.PI / 2 + 0.05, '#8c1b22');
  // Perpendicular row along 212-14's east wall (nose west).
  for (let z = 22; z <= 39.5; z += 2.75) seg(mat.white, 31.6, z, 26.1, z, 0.12, 0.075);
  for (let z = 23.4; z < 39; z += 2.75) if (r() < 0.75) car(28.8, z, (r() - 0.5) * 0.05);
  // Parallel parking along the north edge of the lot.
  for (let x = 12; x > -40; x -= 6.3) if (r() < 0.8) car(x, N0 - 5.4, Math.PI + (r() - 0.5) * 0.03);
  // Perpendicular row along the teal building (nose south), first two
  // accessible with a blue-striped aisle in front of the CVS east windows.
  for (let x = xE - 2.7; x >= -60; x -= 2.75) seg(mat.blue, x, 12.0, x, 17.6, 0.12, 0.075);
  for (let k = 0; k < 7; k++) seg(mat.blue, xE - 2.9 - k * 0.38, 12.2, xE - 2.9 - k * 0.38 - 1.6, 17.4, 0.09, 0.076);
  for (let x = xE - 2.7 - 2.75 * 1.5; x > -59; x -= 2.75) if (r() < 0.7) car(x, 14.9, Math.PI / 2 + (r() - 0.5) * 0.05);
  // ---- walk furniture ----
  const steel = M('#9da3a7', { roughness: 0.35, metalness: 0.7 });
  const rail = (ax, az, bx, bz, h = 1.05) => {
    const len = Math.hypot(bx - ax, bz - az), ry = -Math.atan2(bz - az, bx - ax);
    for (const y of [h, h * 0.55]) box(steel, len, 0.05, 0.05, (ax + bx) / 2, 0.15 + y, (az + bz) / 2, ry, false);
    const n = Math.ceil(len / 1.6);
    for (let k = 0; k <= n; k++) box(steel, 0.06, h, 0.06, ax + (bx - ax) * k / n, 0.15 + h / 2, az + (bz - az) * k / n, 0, false);
  };
  // Ramp railings along the CVS east face and the corner (photo).
  rail(xE - 2.5, 12.3, xE - 2.5, 19.9);
  rail(xE - 2.5, 19.9, xE + 0.6, 19.9);
  rail(xE - 1.0, 12.3, xE - 1.0, 17.0, 0.9);
  // Yellow bollard at the corner of the walk, planters / bins along the walk.
  box(M('#e2c02b'), 0.25, 1.0, 0.25, xE + 1.1, 0.65, 20.25, 0, true);
  const planter = (x, z, s = 1) => {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.32 * s, 0.28 * s, 0.75 * s, 16), M('#bfae93'));
    p.position.set(x, 0.15 + 0.375 * s, z);
    p.castShadow = true;
    add(p);
  };
  for (const s of [16.5, 21.5, 31.0, 54.4, 61.7]) planter(xE + s, zB + 0.55);
  // A-frame sign in front of AFC.
  {
    const t = textTexture({ width: 128, height: 256, bg: '#ffffff', draw(c, w, h) { c.fillStyle = '#d2232a'; c.fillRect(w * 0.15, h * 0.08, w * 0.7, h * 0.12); c.fillStyle = '#333'; for (let y = 0.3; y < 0.9; y += 0.08) c.fillRect(w * 0.15, h * y, w * 0.7, h * 0.03); } });
    const mA = new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 });
    for (const sd of [-1, 1]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.0, 0.03), mA);
      p.position.set(xE + 53.2, 0.65, zB + 1.5 + sd * 0.15);
      p.rotation.x = sd * 0.16;
      add(p);
    }
  }
  // Cart corral by the CVS doors.
  box(M('#b8282c', { metalness: 0.4, roughness: 0.5 }), 0.7, 0.9, 1.6, xE + 18.9, 0.6, zB + 0.9, 0, true);

  // ---- light poles (single shoebox heads) ----
  const poleM = M('#8e9396', { roughness: 0.45, metalness: 0.6 });
  const lotPole = (x, z, ry) => {
    box(M('#b9b6ae'), 0.6, 0.7, 0.6, x, 0.35, z, 0, false);
    box(poleM, 0.18, 9.5, 0.18, x, 4.75, z);
    box(poleM, 0.9, 0.08, 0.08, x + Math.cos(ry) * 0.45, 9.4, z - Math.sin(ry) * 0.45, ry, false);
    box(M('#5f6467', { emissive: '#fff4d6', emissiveIntensity: 0.05 }), 0.8, 0.22, 0.45, x + Math.cos(ry) * 0.95, 9.3, z - Math.sin(ry) * 0.95, ry, false);
  };
  lotPole(27.6, 20.9, -Math.PI / 2);
  lotPole(-12, 28.0, Math.PI / 2);
  lotPole(-52, 36.5, Math.PI / 2);

  // ================= STREET FURNITURE =================
  // NYC cobra-head street lights along Northern Blvd and Bell Blvd.
  const cobra = (x, z, dir) => {
    box(poleM, 0.22, 9.0, 0.22, x, 4.5, z);
    const ax = Math.sin(dir), az = Math.cos(dir);
    box(poleM, 0.1, 0.1, 2.6, x + ax * 1.2, 9.1, z + az * 1.2, dir, false);
    box(M('#c9cbcc', { emissive: '#fff1d0', emissiveIntensity: 0.08 }), 0.5, 0.25, 0.9, x + ax * 2.6, 9.0, z + az * 2.6, dir, false);
  };
  for (let x = 150; x > -50; x -= 33) { cobra(x, N0 - 0.7, 0); cobra(x - 16, N1 + 0.7, Math.PI); }
  for (const z of [-60, 0, 110, 150]) cobra(bellX(z) + B2 + 0.7, z, -Math.PI / 2);
  // Traffic signals at Northern & Bell: mast arms on two corners.
  const yellowM = M('#d8b21f', { roughness: 0.5 });
  const signal = (x, z, armDir, armLen) => {
    box(poleM, 0.3, 7, 0.3, x, 3.5, z);
    const ax = Math.sin(armDir), az = Math.cos(armDir);
    box(poleM, 0.14, 0.14, armLen, x + ax * armLen / 2, 6.6, z + az * armLen / 2, armDir, false);
    for (const t of [0.55, 0.95]) box(yellowM, 0.35, 1.1, 0.35, x + ax * armLen * t, 6.0, z + az * armLen * t, armDir, false);
    box(yellowM, 0.35, 1.1, 0.35, x, 3.2, z + 0.3, 0, false);
  };
  signal(bellX(N0) + B2 + 1.0, N0 - 1.0, 0, 10);
  signal(bellX(N1) - B2 - 1.0, N1 + 1.0, Math.PI, 10);
  signal(bellX(N1) + B2 + 1.0, N1 + 1.0, -Math.PI / 2, 6);
  signal(bellX(N0) - B2 - 1.0, N0 - 1.0, Math.PI / 2, 6);
  // Traffic on Northern and Bell; parked cars on Bell and 45th Rd.
  for (const [x, z, ry] of [[40, N0 + 5.5, Math.PI], [-12, N0 + 1.8, Math.PI], [-45, N0 + 5.5, Math.PI], [70, N0 + 9.5, Math.PI], [10, N1 - 5.6, 0], [55, N1 - 1.8, 0], [-30, N1 - 9.6, 0], [120, N1 - 5.6, 0]]) car(x, z, ry);
  for (let z = -15; z > -100; z -= 6.5) if (r() < 0.7) car(bellX(z) + B2 - 1.2, z, Math.PI / 2 + 0.07);
  for (let z = 30; z > -100; z -= 6.5) if (r() < 0.6) car(bellX(z) - B2 + 1.2, z, Math.PI / 2 + 0.07);
  for (let x = 140; x > -50; x -= 6.4) { if (r() < 0.6) car(x, -26.2, 0); if (r() < 0.6) car(x - 3, -31.8, 0); }

  // ================= TREES =================
  const trunkM = M('#5d4c3c', { roughness: 1 });
  const leafM = [M('#4b6e33', { roughness: 1 }), M('#5a7d3a', { roughness: 1 }), M('#3f6130', { roughness: 1 })];
  const ico1 = new THREE.IcosahedronGeometry(1, 1), ico0 = new THREE.IcosahedronGeometry(1, 0);
  const tr = new THREE.CylinderGeometry(0.16, 0.24, 1, 6);
  const nycTree = (x, z, s = 1) => {
    const far = Math.hypot(x, z) > 95;
    const th = 3.0 * s;
    const t = new THREE.Mesh(tr, trunkM);
    t.scale.set(s, th, s);
    t.position.set(x, th / 2, z);
    t.castShadow = true;
    add(t);
    const n = far ? 2 : 4;
    for (let k = 0; k < n; k++) {
      const m = new THREE.Mesh(far ? ico0 : ico1, leafM[Math.floor(r() * 3)]);
      const rad = (2.0 + r() * 1.0) * s;
      m.scale.set(rad, rad * 0.85, rad);
      m.position.set(x + (r() - 0.5) * 2.4 * s, th + rad * 0.7 + r() * 1.2 * s, z + (r() - 0.5) * 2.4 * s);
      m.castShadow = true;
      add(m);
    }
  };
  // Young street trees on the Northern Blvd sidewalk (satellite) and Bell Blvd.
  // Young street trees: clear trunk, small high crown.
  const youngTree = (x, z, s = 1) => {
    const th = 3.4 * s;
    const t = new THREE.Mesh(tr, trunkM);
    t.scale.set(0.6 * s, th, 0.6 * s);
    t.position.set(x, th / 2, z);
    t.castShadow = true;
    add(t);
    for (let k = 0; k < 3; k++) {
      const m = new THREE.Mesh(ico1, leafM[k % 3]);
      const rad = (1.05 + r() * 0.35) * s;
      m.scale.set(rad, rad * 1.1, rad);
      m.position.set(x + (r() - 0.5) * 1.0 * s, th + rad * 0.9 + k * 0.5 * s, z + (r() - 0.5) * 1.0 * s);
      m.castShadow = true;
      add(m);
    }
  };
  for (const x of [0, -9, -15, -21, -28, -40, -46]) youngTree(x, N0 - 1.2, 1);
  nycTree(11, N0 - 1.4, 1.0);
  for (const z of [36, 6, -6, -14]) youngTree(bellX(z) + B2 + 1.4, z, 1.15);
  // Canopy behind the strip along 45th Rd.
  for (let x = 28; x > -28; x -= 6.5) nycTree(x + (r() - 0.5) * 2, -21.6, 1.15);
  for (const [x, z, s] of TREES) nycTree(x, z, Math.min(1.35, s));

  // ================= BUILDINGS =================
  // Window texture tiled in metres on the walls of the OSM buildings.
  const winMat = (wall, win = '#2c333a', trim = null) => {
    const t = textTexture({
      width: 128, height: 96, bg: wall,
      draw(c, w, h) {
        c.fillStyle = 'rgba(0,0,0,0.05)'; c.fillRect(0, h - 4, w, 4);
        if (trim) { c.fillStyle = trim; c.fillRect(w * 0.2, h * 0.2, w * 0.36, h * 0.58); }
        c.fillStyle = win; c.fillRect(w * 0.24, h * 0.24, w * 0.28, h * 0.5);
        c.fillStyle = 'rgba(255,255,255,0.15)'; c.fillRect(w * 0.24, h * 0.48, w * 0.28, h * 0.02);
      },
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(1 / 3.2, 1 / 2.9);
    return new THREE.MeshStandardMaterial({ map: t, roughness: 0.9 });
  };
  const walls = [winMat('#8b4a3a', '#2c333a', '#d8d2c6'), winMat('#a35a43'), winMat('#c9b48f', '#323a42', '#ece6da'), winMat('#b9a184'), winMat('#d9d3c6', '#3a434c'), winMat('#7b5546'), winMat('#bdb8ae', '#36404a', '#ffffff')];
  const plainM = M('#a8a39a');
  const roofs = [M('#5d5f61'), M('#6d6c68'), M('#8a8985'), M('#4e5154')];
  const extrude = (pts, h, wallM, roofM, y0 = 0) => {
    const sh = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false });
    const m = new THREE.Mesh(geo, wallM);
    m.rotation.x = -Math.PI / 2;
    m.position.y = y0;
    m.castShadow = m.receiveShadow = true;
    add(m);
    const top = new THREE.Mesh(new THREE.ShapeGeometry(sh), roofM);
    top.rotation.x = -Math.PI / 2;
    top.position.y = y0 + h + 0.02;
    top.receiveShadow = true;
    add(top);
    return m;
  };
  const pts = (flatArr) => { const p = []; for (let i = 0; i < flatArr.length; i += 2) p.push([flatArr[i], flatArr[i + 1]]); return p; };
  const special = {};
  for (const [tag, h, arr] of BAYSIDE_BLDGS) {
    if (tag) { special[tag] = { h, p: pts(arr) }; continue; }
    const p = pts(arr);
    const k = Math.abs(Math.round(arr[0] * 7 + arr[1] * 13)) ;
    extrude(p, h, h < 4.6 ? plainM : walls[k % walls.length], roofs[k % roofs.length]);
  }

  // ---- teal 45-18 Bell Blvd (east neighbour; one storey, painted brick) ----
  {
    const s = special.teal;
    const tealM = (() => {
      const { map, normalMap } = BRICK.cream();
      return new THREE.MeshStandardMaterial({ color: '#5a958d', map, normalMap, normalScale: new THREE.Vector2(0.5, 0.5), roughness: 0.9 });
    })();
    extrude(s.p, s.h, tealM, M('#3c3f42'));
    // White coping on the north and east parapets (satellite), grey roof edge.
    box(M('#e9e7e1'), 31.6, 0.25, 0.4, -45.3, s.h + 0.12, 12.1, 0.02, false);
    box(M('#e9e7e1'), 0.4, 0.25, 26.3, -62.2, s.h + 0.12, -4.4, 0.076, false);
    // A few shopfronts and a door on the Bell Blvd face.
    for (const z of [-12, -4, 4]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 2.6), M('#2e3a44', { roughness: 0.2, metalness: 0.5 }));
      m.position.set(-61.2 + (z - 8.7) * 0.0763 - 0.05, 1.6, z);
      m.rotation.y = -Math.PI / 2 + 0.076;
      add(m);
    }
    box(M('#8e9399'), 0.5, 0.35, 0.18, -40, 4.2, 12.1, 0, false); // vent (photo)
  }

  // ---- 212-14 Northern Blvd (west neighbour) ----
  {
    const { map, normalMap } = BRICK.tan();
    const beige = new THREE.MeshStandardMaterial({ map, normalMap, normalScale: new THREE.Vector2(0.6, 0.6), roughness: 0.9, color: '#efe6d6' });
    const H4 = 15.2, x0 = 31.75, x1 = 62.0, zf = N0 - 4.1, zr = 22.0;
    const body = new THREE.Mesh(boxGeo(x1 - x0, H4, zf - zr), beige);
    body.position.set((x0 + x1) / 2, H4 / 2, (zf + zr) / 2);
    body.castShadow = body.receiveShadow = true;
    add(body);
    box(M('#d9d2c4'), x1 - x0 + 0.3, 0.45, zf - zr + 0.3, (x0 + x1) / 2, H4 + 0.2, (zf + zr) / 2, 0, true);
    box(M('#a7a6a1'), 6, 2.6, 4, 50, H4 + 1.3, 30, 0, true); // stair/elevator bulkhead
    // Storey bands and window ribbons on the Northern Blvd front.
    const glassM = M('#3d4b57', { roughness: 0.15, metalness: 0.55 });
    for (let f = 1; f < 4; f++) {
      const y = 4.4 + (f - 1) * 3.6;
      for (let x = x0 + 1.6; x < x1 - 2; x += 3.45) {
        const m = new THREE.Mesh(new THREE.PlaneGeometry(2.3, 2.0), glassM);
        m.position.set(x + 1.15, y + 1.1, zf + 0.02);
        add(m);
      }
      box(M('#e3dccd'), x1 - x0, 0.25, 0.15, (x0 + x1) / 2, y - 0.25, zf + 0.06, 0, false);
    }
    // Ground floor: retail glass on Northern Blvd and a little on the lot side.
    const gf = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0 - 3, 3.2), M('#33414c', { roughness: 0.12, metalness: 0.5 }));
    gf.position.set((x0 + x1) / 2, 1.9, zf + 0.02);
    add(gf);
    box(M('#5b5f63'), x1 - x0 - 2.5, 0.5, 0.25, (x0 + x1) / 2, 3.75, zf + 0.12, 0, false);
    const sideGlass = new THREE.Mesh(new THREE.PlaneGeometry(6, 3.0), M('#33414c', { roughness: 0.12, metalness: 0.5 }));
    sideGlass.position.set(x0 - 0.02, 1.8, zf - 4);
    sideGlass.rotation.y = -Math.PI / 2;
    add(sideGlass);
    // Low rear wing with the dark charcoal wall and the steel stair to its roof (AFC photo).
    const charcoal = M('#2d3033', { roughness: 0.8 });
    box(charcoal, x1 - x0, 3.6, zr - 12.6, (x0 + x1) / 2, 1.8, (zr + 12.6) / 2, 0, true);
    box(M('#55595d'), x1 - x0, 1.1, 0.12, (x0 + x1) / 2, 4.15, zr - 0.2, 0, false);
    for (let z = 13.4; z < zr; z += 1.4) box(M('#3a3e42'), 0.06, 1.1, 0.06, x0 + 0.3, 4.15, z, 0, false);
    {
      const run = 7.0, rise = 3.6, sx = x0 - 0.75;
      const st = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.12, Math.hypot(run, rise)), M('#7d8286', { metalness: 0.6, roughness: 0.4 }));
      st.position.set(sx, rise / 2, 13.2 + run / 2);
      st.rotation.x = -Math.atan2(rise, run);
      st.castShadow = true;
      add(st);
      for (const dx of [-0.55, 0.55]) {
        const rl = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, Math.hypot(run, rise)), steel);
        rl.position.set(sx + dx, rise / 2 + 1.0, 13.2 + run / 2);
        rl.rotation.x = -Math.atan2(rise, run);
        add(rl);
        box(steel, 0.05, 1.0, 0.05, sx + dx, rise + 0.5, 13.2 + run, 0, false);
        box(steel, 0.05, 1.0, 0.05, sx + dx, 0.5, 13.2, 0, false);
      }
      box(M('#7d8286', { metalness: 0.6 }), 1.2, 0.12, 1.4, sx, rise, 13.2 + run + 0.7, 0, true); // landing
    }
  }

  // ---- Con Ed Bayside substation (212-06) ----
  {
    const s = special.subst;
    extrude(s.p, s.h, M('#8a6a5a'), M('#5a5b5c'));
    const fenceM = M('#9aa0a5', { roughness: 0.5, metalness: 0.6, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
    const f = new THREE.Mesh(new THREE.PlaneGeometry(8.0, 2.6), fenceM);
    f.position.set(66.5, 1.3, N0 - 4.2);
    add(f);
  }

  // ---- north side of Northern Blvd ----
  {
    // 213-01 Northern Blvd (Northern Bell Plaza): three storeys + mechanical.
    const s = special.plaza;
    extrude(s.p, s.h - 2.3, winMat('#d6ccb9', '#2f3a44', '#efe9dd'), M('#9a9994'));
    box(M('#a9a7a1'), 12, 2.3, 8, -10, s.h - 1.15, 88, 0, true);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(28, 3.4), M('#34414b', { roughness: 0.15, metalness: 0.5 }));
    gl.position.set(-11.5, 1.9, 72.2 + 0.68 - 0.05);
    gl.rotation.y = Math.PI + 0.048;
    add(gl);
  }
  {
    // White Castle (213-17): white enamel box with a crenellated parapet.
    const s = special.whitecastle;
    extrude(s.p, s.h, M('#f4f4f2'), M('#b7b7b4'));
    for (let x = -49.5; x < -31; x += 1.6) box(M('#f4f4f2'), 0.8, 0.6, 0.5, x, s.h + 0.3, 88.0 - (x + 31) * 0.068, 0, false);
    sign('WHITE CASTLE', -40.5, 3.1, 87.6 - 0.65, Math.PI + 0.068, { w: 8, h: 0.9, color: '#1f3f8f', font: '800 {s}px Arial', glow: 0.25 });
  }
  {
    // Car dealership (OSM: Bayside Chrysler Jeep Dodge) and its small neighbour.
    const s = special.dealer;
    extrude(s.p, s.h, winMat('#d8d8d4', '#3a4550'), M('#7c7d7c'));
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(40, 4.2), M('#3b4855', { roughness: 0.1, metalness: 0.5 }));
    gl.position.set(41.5, 2.3, 71.6);
    gl.rotation.y = Math.PI;
    add(gl);
    sign('BAYSIDE CHRYSLER JEEP DODGE', 41.5, 5.6, 71.55, Math.PI, { w: 18, h: 1.0, color: '#1b2a44', font: '800 {s}px Arial', glow: 0.1 });
    const s2 = special.dealer2;
    extrude(s2.p, s2.h, winMat('#c9c5bc'), M('#77777a'));
  }
  {
    // Capital One (SE corner of Northern & Bell) with the drive-through lanes.
    const s = special.capone;
    extrude(s.p, s.h, winMat('#cdbfa7', '#2d3943', '#efe8da'), M('#6b6b69'));
    sign('Capital One', -101, 4.6, 33.7, -0.12, { w: 6, h: 1.0, color: '#0a3a6b', font: '700 {s}px Arial', glow: 0.2 });
    box(M('#e9e6df'), 3.5, 0.5, 14, -114.5, 3.6, 23, -0.13, true);
    for (const z of [17, 29]) box(M('#cfcac0'), 0.4, 3.4, 0.4, -116, 1.7, z, 0, true);
  }
  {
    // Queens Public Library (214-20 Northern Blvd).
    const s = special.library;
    extrude(s.p, s.h, winMat('#9c5c45', '#2c3540', '#d6cdbd'), M('#666664'));
    sign('QUEENS PUBLIC LIBRARY', -145, 3.6, 28.6, -0.13, { w: 10, h: 0.7, color: '#ffffff', bg: '#1e3a6e', font: '700 {s}px Arial', glow: 0.15 });
  }
}

// Satellite canopy sample: [x, z, size] in model coordinates.
const TREES = [
  [-36,-170,1.2],[-22,-170,1.2],[6,-170,1.2],[-36,-163,1.3],[-22,-163,1.3],[-15,-162,1.0],[6,-163,1.3],
  [13,-163,1.2],[-36,-156,1.3],[-29,-156,1.3],[-23,-157,1.0],[-14,-157,1.1],[6,-157,1.2],[27,-155,1.0],
  [34,-156,1.3],[76,-156,1.2],[83,-156,1.3],[90,-156,1.2],[104,-156,1.1],[-190,-149,1.3],[-183,-149,1.3],
  [-176,-149,1.3],[-169,-149,1.3],[-162,-149,1.2],[-148,-149,1.2],[0,-149,1.1],[6,-149,1.2],[13,-149,1.1],
  [21,-149,1.2],[27,-149,1.3],[34,-149,1.3],[41,-149,1.3],[47,-148,1.0],[56,-149,1.2],[62,-149,1.1],
  [69,-149,1.2],[76,-149,1.3],[83,-149,1.3],[90,-149,1.3],[97,-149,1.1],[111,-149,1.1],[182,-149,1.0],
  [187,-149,1.1],[-183,-143,1.2],[-176,-143,1.2],[-169,-143,1.2],[-162,-142,1.3],[-35,-143,1.0],[-29,-142,1.3],
  [-1,-142,1.3],[6,-143,1.2],[12,-144,1.0],[27,-143,1.2],[34,-142,1.3],[41,-142,1.3],[48,-142,1.3],
  [55,-142,1.3],[62,-142,1.2],[69,-143,1.2],[76,-143,1.2],[90,-142,1.3],[131,-143,1.0],[146,-142,1.3],
  [34,-136,1.1],[41,-136,1.1],[48,-136,1.3],[54,-136,1.0],[146,-135,1.3],[152,-135,1.1],[132,-128,1.2],
  [160,-128,1.2],[166,-128,1.0],[194,-129,1.1],[-197,-121,1.1],[-191,-120,1.0],[-182,-120,1.0],[-176,-121,1.3],
  [-169,-121,1.3],[97,-120,1.1],[104,-121,1.0],[111,-121,1.2],[118,-122,1.1],[125,-121,1.2],[160,-121,1.3],
  [167,-121,1.3],[174,-120,1.1],[-196,-114,1.2],[-190,-114,1.2],[-183,-115,1.2],[-176,-114,1.3],[-169,-114,1.3],
  [-164,-115,1.0],[-134,-114,1.3],[-127,-114,1.3],[41,-116,1.0],[55,-115,1.1],[97,-115,1.2],[103,-115,1.0],
  [167,-115,1.2],[174,-114,1.3],[181,-114,1.3],[195,-114,1.2],[-175,-108,1.1],[-169,-108,1.2],[-155,-106,1.1],
  [-134,-107,1.3],[-127,-107,1.3],[-22,-106,1.0],[7,-106,1.1],[13,-107,1.2],[55,-107,1.3],[61,-107,1.2],
  [98,-107,1.1],[104,-107,1.3],[111,-107,1.3],[118,-107,1.3],[125,-107,1.3],[131,-107,1.2],[161,-107,1.1],
  [167,-107,1.3],[174,-107,1.3],[181,-108,1.1],[189,-108,1.0],[194,-108,1.2],[-155,-101,1.2],[-149,-101,1.1],
  [-141,-100,1.3],[-134,-100,1.3],[-127,-100,1.3],[-63,-102,1.0],[-22,-102,1.1],[-16,-101,1.1],[-2,-102,1.0],
  [6,-101,1.2],[13,-100,1.3],[48,-101,1.1],[55,-101,1.1],[61,-101,1.1],[90,-102,1.0],[104,-101,1.1],
  [111,-101,1.1],[119,-101,1.0],[125,-101,1.2],[131,-101,1.2],[139,-99,1.0],[153,-100,1.2],[160,-100,1.2],
  [153,-93,1.1],[173,-93,1.1],[12,-86,1.1],[139,-86,1.1],[153,-87,1.0],[174,-86,1.1],[181,-86,1.2],
  [-196,-79,1.0],[-190,-79,1.2],[-183,-79,1.3],[-176,-79,1.3],[-169,-79,1.3],[-162,-79,1.3],[-156,-78,1.0],
  [-141,-79,1.2],[-133,-78,1.0],[-128,-78,1.0],[-71,-78,1.1],[26,-78,1.0],[68,-79,1.0],[139,-80,1.0],
  [-197,-73,1.1],[-190,-72,1.3],[-176,-72,1.2],[-169,-72,1.3],[-156,-73,1.1],[-141,-73,1.2],[-134,-73,1.2],
  [-127,-73,1.2],[-71,-73,1.1],[-9,-72,1.1],[6,-72,1.1],[27,-72,1.3],[34,-72,1.3],[62,-72,1.2],[69,-72,1.2],
  [76,-71,1.1],[174,-72,1.2],[195,-72,1.3],[-190,-65,1.3],[-126,-66,1.1],[-121,-65,1.1],[-71,-65,1.2],
  [-35,-64,1.0],[-1,-65,1.1],[27,-65,1.3],[62,-65,1.3],[69,-65,1.3],[76,-66,1.2],[83,-65,1.3],[195,-67,1.0],
  [-71,-58,1.3],[-36,-58,1.3],[-29,-57,1.1],[-1,-59,1.0],[63,-58,1.2],[69,-58,1.3],[76,-58,1.2],[105,-58,1.0],
  [-197,-50,1.1],[-190,-51,1.2],[-71,-51,1.3],[-35,-52,1.0],[63,-52,1.0],[69,-51,1.3],[76,-51,1.3],
  [153,-50,1.1],[-196,-44,1.2],[-190,-44,1.3],[-168,-44,1.2],[-162,-44,1.3],[-156,-44,1.1],[-70,-44,1.2],
  [48,-43,1.1],[69,-44,1.3],[76,-44,1.2],[104,-44,1.1],[147,-44,1.2],[153,-44,1.3],[159,-44,1.0],[181,-44,1.0],
  [-155,-38,1.2],[-148,-37,1.1],[-14,-36,1.0],[-8,-37,1.2],[-1,-36,1.1],[6,-36,1.0],[13,-37,1.3],[20,-37,1.2],
  [26,-36,1.0],[35,-36,1.1],[41,-37,1.3],[48,-37,1.3],[55,-37,1.2],[61,-37,1.2],[69,-37,1.3],[76,-37,1.3],
  [83,-38,1.1],[90,-37,1.3],[97,-37,1.3],[104,-37,1.3],[112,-37,1.2],[118,-37,1.3],[125,-37,1.3],[132,-37,1.3],
  [153,-38,1.1],[174,-36,1.1],[181,-37,1.2],[-154,-30,1.1],[-149,-31,1.1],[-43,-22,1.0],[-21,-24,1.0],
  [-15,-23,1.3],[-7,-24,1.0],[-1,-24,1.2],[6,-24,1.2],[13,-23,1.3],[20,-23,1.3],[26,-23,1.2],[41,-24,1.1],
  [48,-24,1.1],[55,-23,1.3],[62,-23,1.3],[69,-24,1.1],[76,-24,1.1],[84,-24,1.1],[90,-23,1.3],[97,-23,1.3],
  [103,-23,1.1],[112,-23,1.1],[118,-23,1.3],[125,-23,1.3],[132,-23,1.3],[138,-23,1.0],[146,-22,1.0],
  [153,-22,1.1],[160,-23,1.3],[174,-23,1.2],[181,-23,1.3],[188,-23,1.3],[195,-23,1.3],[62,-17,1.1],[90,-16,1.3],
  [97,-16,1.3],[104,-17,1.2],[125,-16,1.3],[132,-17,1.1],[139,-16,1.3],[146,-16,1.3],[153,-16,1.3],
  [175,-17,1.2],[-191,-10,1.1],[90,-9,1.2],[139,-9,1.3],[146,-9,1.2],[153,-9,1.3],[160,-9,1.2],[-161,-2,1.1],
  [-155,-2,1.2],[-149,-1,1.1],[-141,-2,1.1],[90,-2,1.3],[96,-2,1.1],[138,-3,1.0],[146,-3,1.1],[153,-2,1.3],
  [160,-2,1.3],[166,-3,1.0],[-141,4,1.2],[96,5,1.1],[153,3,1.0],[98,10,1.0],[104,11,1.2],[111,12,1.2],
  [111,18,1.0],[132,18,1.0],[-161,27,1.1],[113,26,1.0],[132,26,1.3],[-141,32,1.1],[118,33,1.2],[132,32,1.1],
  [174,34,1.1],[90,41,1.0],[174,40,1.3],[-155,76,1.1],[-148,75,1.1],[-183,80,1.0],[-154,81,1.2],[-149,82,1.1],
  [166,82,1.1],[-190,96,1.1],[166,96,1.2],[188,97,1.1],[-190,103,1.2],[-183,103,1.1],[6,103,1.2],[55,103,1.2],
  [126,103,1.1],[132,103,1.3],[138,103,1.1],[160,104,1.0],[-190,110,1.3],[-184,110,1.1],[6,110,1.3],
  [55,110,1.3],[60,110,1.0],[97,110,1.2],[125,110,1.3],[132,110,1.3],[138,109,1.1],[161,109,1.1],[167,110,1.2],
  [-195,117,1.0],[-190,117,1.3],[-183,117,1.2],[6,116,1.0],[55,117,1.3],[60,116,1.0],[126,116,1.0],
  [132,117,1.3],[139,116,1.1],[167,116,1.1],[175,116,1.0],[181,117,1.2],[-190,124,1.3],[-183,123,1.2],
  [-169,124,1.1],[-162,124,1.2],[-155,124,1.3],[7,124,1.1],[55,124,1.1],[132,124,1.2],[180,124,1.1],
  [-161,130,1.1],[-155,131,1.3],[-149,131,1.1],[-106,131,1.3],[-99,131,1.3],[7,131,1.1],[55,131,1.2],
  [132,130,1.2],[180,130,1.1],[-106,138,1.2],[-99,138,1.3],[7,137,1.1],[133,137,1.1],[138,138,1.1],
  [167,138,1.1],[180,138,1.2],[-106,144,1.2],[-99,145,1.3],[-93,144,1.0],[7,145,1.1],[139,145,1.2],
  [174,145,1.3],[181,145,1.2],[-155,152,1.3],[6,152,1.3],[12,152,1.1],[77,152,1.1],[82,152,1.1],[147,152,1.1],
  [152,152,1.0],[160,152,1.2],[167,152,1.3],[174,151,1.1],[180,151,1.1],[-155,159,1.2],[7,158,1.2],
  [181,159,1.0],[-155,166,1.2],[-50,167,1.0],[181,166,1.1],[-183,172,1.1],[-176,173,1.1],[-169,172,1.1],
  [-161,173,1.2],[-155,173,1.3],[7,174,1.0],[160,173,1.0],[181,171,1.0],[188,172,1.0],[-185,180,1.0],
  [-161,179,1.0],[-155,179,1.3],[-22,180,1.3],[-15,180,1.3],[0,180,1.1],[6,180,1.3],[11,180,1.0],[118,180,1.1],
  [125,180,1.2],[131,180,1.0],[154,180,1.1],[160,180,1.2],[189,180,1.1],[195,180,1.2],[-197,187,1.2],
  [-190,187,1.3],[-184,186,1.1],[-105,186,1.0],[-22,186,1.2],[-15,187,1.3],[6,186,1.1],[132,187,1.1],
  [154,186,1.1],[160,187,1.2],[189,186,1.0],[195,187,1.2],[-196,194,1.2],[-191,193,1.2],[-175,193,1.1],
  [-141,194,1.3],[-135,194,1.1],[-22,195,1.0],[-14,193,1.1],[70,194,1.1],[118,194,1.0],[125,194,1.2],
  [132,194,1.3],[140,194,1.2],[145,194,1.1],[153,194,1.1],[159,193,1.2],[174,194,1.3],[189,194,1.1],
  [195,194,1.3],
];

// OSM parking lots (outline x/z pairs).
const LOTS = [
  [6.0,179.8,-26.4,180.9,-26.7,171.6,-22.0,171.4,-22.6,153.8,-48.3,154.7,-48.6,145.1,-47.3,139.9,-17.3,138.9,-18.4,106.1,3.4,105.3],
  [-27.6,73.7,-51.2,74.8,-50.6,89.0,-26.9,87.9],
  [-161.3,126.8,-159.7,107.2,-159.7,106.3,-190.8,103.8,-192.5,124.3],
  [-159.7,107.2,-157.0,85.5,-188.3,82.0,-190.0,96.9,-190.8,103.8],
  [-154.0,58.5,-185.8,54.8,-188.0,74.7,-217.8,71.3,-220.3,93.4,-190.0,96.9,-188.3,82.0,-157.0,85.5],
  [196.2,66.8,177.0,67.2,178.1,98.8,181.1,99.4,239.4,96.6,238.9,83.9,197.0,85.9],
  [138.7,39.2,108.6,40.2,107.6,9.2,137.7,8.2],
];

// OSM footprints (x = west, z = north, metres) with NYC survey heights:
// [tag, height, [x0, z0, x1, z1, ...]]. Tagged ones are drawn individually above.
const BAYSIDE_BLDGS = [
  ['', 8.4, [-124.2,-26.0,-125.7,-9.8,-133.2,-10.5,-131.7,-26.7]],
  ['', 11.3, [-124.6,-80.5,-122.9,-98.1,-109.7,-96.9,-108.4,-79.0]],
  ['', 10.3, [-140.0,-27.4,-134.3,-26.5,-134.8,-23.4,-133.5,-23.2,-135.3,-11.3,-142.2,-12.4,-140.6,-23.4]],
  ['', 7.8, [-133.4,-172.0,-127.1,-171.9,-127.4,-159.1,-133.8,-159.3,-133.4,-170.6]],
  ['', 7.9, [-131.6,-93.8,-131.3,-93.7,-131.2,-94.9,-125.0,-94.3,-126.0,-83.0,-129.0,-83.3,-129.2,-81.8,-132.4,-82.1,-132.4,-82.8,-132.6,-82.8]],
  ['', 10.5, [-148.2,-28.3,-142.2,-27.6,-142.6,-24.1,-141.3,-24.0,-142.6,-12.3,-150.0,-13.1]],
  ['', 7.8, [-133.4,-170.6,-133.8,-159.3,-139.2,-159.4,-138.9,-170.7]],
  ['', 8.2, [-131.6,-93.8,-132.6,-82.8,-135.4,-83.1,-135.5,-81.4,-138.6,-81.7,-137.4,-94.3]],
  ['', 7.8, [-138.9,-170.7,-139.2,-159.4,-145.2,-159.6,-144.9,-170.9]],
  ['', 7.6, [-130.5,-130.1,-131.6,-118.7,-137.7,-119.3,-136.5,-130.7]],
  ['', 8.0, [-121.5,-61.2,-123.0,-45.3,-130.3,-46.0,-128.9,-61.8,-121.6,-61.2]],
  ['', 7.9, [-143.2,-94.8,-137.4,-94.3,-138.6,-81.7,-141.3,-81.9,-141.1,-83.7,-144.2,-83.9]],
  ['', 9.3, [-157.0,-28.5,-150.9,-27.5,-151.7,-22.5,-150.0,-22.2,-151.5,-12.7,-159.3,-14.0]],
  ['', 7.8, [-144.9,-170.9,-145.2,-159.6,-151.1,-159.7,-150.8,-171.0]],
  ['', 7.6, [-136.4,-132.2,-136.5,-130.7,-137.7,-119.3,-138.4,-119.4,-138.3,-120.4,-143.8,-121.0,-142.6,-132.9]],
  ['', 9.1, [-130.9,-61.3,-132.6,-46.6,-139.3,-47.4,-137.6,-62.1]],
  ['library', 4.6, [-157.5,2.0,-128.1,5.9,-130.0,20.1,-128.2,20.4,-128.6,22.7,-130.3,22.5,-131.3,30.1,-160.7,26.3]],
  ['', 8.2, [-143.2,-94.8,-144.2,-83.9,-147.2,-84.2,-147.3,-82.4,-150.5,-82.7,-149.3,-95.4]],
  ['', 8.9, [-164.9,-29.8,-159.3,-29.0,-159.7,-26.4,-158.5,-26.2,-160.3,-13.9,-167.1,-14.9]],
  ['', 7.8, [-150.8,-171.0,-151.1,-159.7,-156.7,-159.8,-156.4,-171.2]],
  ['', 7.7, [-142.6,-132.9,-143.8,-121.0,-149.8,-121.6,-148.5,-133.5]],
  ['', 9.2, [-142.7,-64.9,-139.0,-64.4,-139.3,-62.1,-138.5,-62.0,-140.3,-47.4,-147.1,-48.2,-145.3,-62.7,-143.0,-62.4]],
  ['', 8.2, [-155.0,-95.9,-149.3,-95.4,-150.5,-82.7,-153.4,-82.9,-153.2,-84.9,-155.9,-85.1]],
  ['', 7.8, [-162.8,-172.6,-156.3,-172.5,-156.4,-171.2,-156.7,-159.8,-163.2,-160.0,-162.9,-171.4]],
  ['', 7.7, [-148.5,-133.5,-149.8,-121.6,-155.7,-122.2,-154.4,-134.1]],
  ['', 8.5, [-148.0,-63.5,-149.6,-47.9,-156.1,-48.5,-154.5,-64.1]],
  ['', 8.2, [-154.9,-97.0,-155.0,-95.9,-155.9,-85.1,-156.1,-85.1,-156.0,-86.3,-159.1,-86.6,-159.3,-84.7,-162.5,-85.0,-161.4,-97.6]],
  ['', 10.2, [-174.4,-31.0,-168.4,-30.3,-168.8,-26.8,-167.9,-26.7,-169.3,-14.8,-176.2,-15.6]],
  ['', 7.8, [-162.9,-171.4,-163.2,-160.0,-168.6,-160.1,-168.3,-171.6]],
  ['', 7.7, [-160.7,-133.3,-160.5,-134.7,-154.4,-134.1,-155.7,-122.2,-161.6,-122.8,-161.7,-121.6,-162.6,-121.7,-161.4,-133.4]],
  ['', 10.6, [-156.0,-63.8,-157.8,-48.7,-164.3,-49.4,-162.5,-64.6]],
  ['', 8.2, [-166.7,-98.1,-161.4,-97.6,-162.5,-85.0,-165.3,-85.3,-165.1,-87.3,-167.7,-87.5]],
  ['', 8.0, [-182.7,-31.8,-175.8,-31.1,-176.1,-28.3,-175.7,-28.2,-177.1,-15.0,-184.4,-15.7]],
  ['', 7.9, [-168.3,-171.6,-168.6,-160.1,-174.7,-160.3,-174.4,-171.7]],
  ['', 7.7, [-161.4,-133.4,-162.6,-121.7,-168.2,-122.2,-167.0,-133.9]],
  ['', 10.3, [-165.1,-64.8,-166.8,-49.6,-173.4,-50.3,-171.7,-65.5]],
  ['', 8.2, [-173.4,-97.7,-173.1,-97.7,-173.0,-98.6,-166.7,-98.1,-167.7,-87.5,-171.2,-87.8,-171.3,-86.0,-174.4,-86.3,-174.4,-86.8]],
  ['', 9.1, [-191.8,-30.8,-191.2,-30.7,-191.1,-32.2,-185.7,-31.5,-186.3,-26.9,-184.8,-26.7,-186.0,-16.5,-193.5,-17.4]],
  ['', 8.0, [-174.4,-171.7,-174.7,-160.3,-180.1,-160.4,-179.8,-171.9]],
  ['', 8.0, [-166.9,-135.1,-167.0,-133.9,-168.2,-122.2,-168.7,-122.3,-168.6,-123.3,-174.3,-123.9,-173.1,-135.8]],
  ['', 8.1, [-172.7,-66.1,-174.5,-50.3,-181.3,-51.0,-179.5,-66.9]],
  ['', 8.2, [-173.4,-97.7,-174.4,-86.8,-177.2,-87.0,-177.3,-85.4,-180.3,-85.6,-179.2,-98.3]],
  ['', 8.0, [-179.8,-171.9,-180.1,-160.4,-186.5,-160.6,-186.2,-172.0]],
  ['', 7.7, [-173.1,-135.8,-174.3,-123.9,-179.8,-124.5,-178.6,-136.3]],
  ['', 9.0, [-188.7,-58.2,-190.1,-58.3,-189.2,-67.0,-182.4,-66.3,-183.8,-51.7,-189.3,-52.3]],
  ['', 8.2, [-185.0,-98.8,-179.2,-98.3,-180.3,-85.6,-183.2,-85.9,-183.0,-87.8,-185.9,-88.1]],
  ['', 9.2, [-199.0,-32.8,-193.7,-32.0,-194.4,-27.8,-192.5,-27.6,-194.1,-17.0,-201.2,-18.1]],
  ['', 8.0, [-186.2,-172.0,-186.5,-160.6,-191.9,-160.7,-191.6,-172.2]],
  ['', 7.7, [-178.6,-136.3,-179.8,-124.5,-186.0,-125.1,-184.8,-137.0]],
  ['', 9.0, [-190.1,-67.3,-190.7,-58.4,-191.5,-58.4,-191.8,-52.6,-197.8,-52.9,-196.9,-67.7]],
  ['', 8.2, [-185.0,-98.8,-185.9,-88.1,-189.2,-88.4,-189.4,-86.6,-192.6,-86.8,-191.5,-99.4]],
  ['', 8.1, [-202.2,-33.5,-203.2,-17.8,-210.0,-18.2,-209.0,-34.0]],
  ['', 7.7, [-191.9,-160.7,-198.4,-160.9,-198.1,-173.6,-191.6,-173.5,-191.6,-172.2]],
  ['', 7.7, [-190.6,-137.5,-184.8,-137.0,-186.0,-125.1,-191.9,-125.7,-190.8,-136.1]],
  ['', 8.6, [-199.0,-68.9,-199.9,-55.7,-200.6,-55.8,-200.8,-53.0,-207.4,-53.4,-206.3,-69.3]],
  ['', 8.2, [-197.1,-99.9,-191.5,-99.4,-192.6,-86.8,-195.2,-87.1,-195.0,-89.1,-198.1,-89.4]],
  ['', 7.7, [-192.0,-124.3,-198.8,-125.0,-197.6,-136.7,-190.8,-136.1,-191.9,-125.7]],
  ['', 8.2, [-198.1,-89.4,-198.4,-89.4,-198.5,-88.7,-201.1,-89.0,-201.0,-90.7,-204.3,-91.0,-203.3,-102.0,-197.0,-101.4,-197.1,-99.9]],
  ['', 7.9, [-204.7,-3.0,-204.5,-4.0,-182.0,-1.2,-182.1,-0.2,-180.3,0.0,-180.7,3.2,-179.9,3.3,-182.4,23.3,-213.6,19.4,-210.7,-3.7]],
  ['', 10.9, [-106.9,-57.8,-105.7,-41.5,-122.0,-43.1,-120.9,-59.4]],
  ['', 10.9, [-108.4,-79.0,-106.9,-57.8,-120.9,-59.4,-119.8,-70.1,-125.5,-71.0,-124.6,-80.5]],
  ['', 6.4, [-123.1,-113.9,-129.0,-114.7,-127.3,-137.2,-124.8,-136.9,-123.4,-118.4]],
  ['', 6.4, [-115.0,-119.2,-115.9,-134.9,-103.0,-135.7,-102.1,-120.0]],
  ['', 3.8, [-150.8,-9.0,-151.7,-3.1,-155.1,-3.6,-154.2,-9.5]],
  ['', 3.6, [-159.6,-74.3,-160.3,-68.5,-163.6,-68.9,-163.3,-74.7]],
  ['', 3.3, [-180.6,-76.2,-180.8,-70.5,-184.1,-70.6,-183.9,-76.3]],
  ['', 3.7, [-198.6,-13.8,-199.2,-8.0,-202.8,-8.4,-202.2,-14.2]],
  ['', 3.6, [-168.6,-10.9,-168.8,-5.3,-172.6,-5.4,-172.5,-11.0]],
  ['', 3.8, [-151.7,-3.1,-150.8,-9.0,-147.7,-8.5,-148.6,-2.6]],
  ['', 3.9, [-115.0,-119.2,-114.6,-113.1,-123.1,-113.9,-123.4,-118.4]],
  ['', 3.6, [-206.5,-14.6,-202.5,-14.1,-203.2,-8.0,-207.2,-8.5]],
  ['', 4.0, [-186.0,-6.5,-189.1,-6.8,-188.6,-12.8,-185.4,-12.6]],
  ['', 3.6, [-163.3,-74.7,-163.6,-68.9,-166.7,-69.2,-166.1,-75.0]],
  ['', 4.3, [-182.2,-12.3,-182.7,-6.2,-186.0,-6.5,-185.4,-12.6]],
  ['', 3.6, [-176.3,-75.8,-177.0,-70.1,-180.4,-70.5,-179.8,-76.2]],
  ['', 3.5, [-125.5,-70.9,-126.2,-65.1,-129.2,-65.5,-128.6,-71.2]],
  ['', 3.5, [-128.6,-71.2,-129.2,-65.5,-132.7,-65.8,-132.0,-71.6]],
  ['', 4.3, [-102.1,-120.0,-101.1,-111.5,-114.6,-113.1,-115.0,-119.2]],
  ['', 3.3, [-164.7,-10.8,-165.0,-5.3,-168.4,-5.5,-168.1,-11.0]],
  ['', 3.4, [-197.2,-77.8,-197.8,-72.2,-201.0,-72.6,-200.4,-78.2,-199.0,-78.0]],
  ['', 3.4, [-131.9,-1.2,-134.8,-1.5,-134.8,-1.7,-134.2,-7.1,-131.2,-6.7]],
  ['', 3.4, [-134.2,-7.3,-134.2,-7.1,-134.8,-1.7,-138.0,-2.0,-137.4,-7.6]],
  ['', 4.2, [-104.4,-174.0,-102.5,-139.3,-123.4,-138.1,-124.0,-150.2,-117.2,-150.6,-118.4,-173.2]],
  ['', 6.8, [210.9,-102.1,211.7,-89.8,205.8,-89.4,205.1,-100.0,205.4,-100.0,205.3,-101.7]],
  ['', 8.9, [202.1,-12.1,201.6,-12.0,201.2,-23.0,208.4,-23.3,208.5,-20.5,210.8,-20.6,211.3,-6.4,202.4,-6.0]],
  ['', 8.8, [192.0,-87.8,189.9,-87.8,189.8,-89.5,188.9,-89.5,188.8,-101.7,196.1,-101.8,196.3,-84.8,192.1,-84.8]],
  ['', 8.0, [198.6,-22.2,199.2,-3.3,193.6,-3.1,193.0,-22.0]],
  ['', 9.6, [196.4,-126.8,196.0,-126.8,195.8,-136.8,198.6,-136.9,198.5,-140.0,202.1,-140.1,202.5,-124.6,196.4,-124.5]],
  ['', 3.4, [205.5,-64.9,205.4,-65.9,207.7,-66.0,208.2,-53.5,202.1,-53.2,201.7,-64.7]],
  ['', 3.8, [201.7,-64.7,202.1,-53.2,196.2,-53.0,195.7,-64.5]],
  ['', 8.6, [188.5,-139.7,189.1,-125.0,181.5,-124.7,180.9,-139.4]],
  ['', 3.8, [195.7,-64.5,196.2,-53.0,189.9,-52.7,189.4,-64.2]],
  ['', 3.8, [183.7,-64.0,183.5,-67.3,189.3,-67.6,189.4,-64.2,189.9,-52.7,183.7,-52.4,183.3,-63.9]],
  ['', 3.6, [157.3,-131.3,157.4,-128.4,154.9,-128.3,155.3,-120.5,150.6,-120.3,150.1,-130.9]],
  ['', 3.9, [183.3,-63.9,183.7,-52.4,177.9,-52.2,177.4,-63.7]],
  ['', 3.8, [177.4,-63.7,177.9,-52.2,171.7,-51.9,171.2,-63.4]],
  ['', 3.8, [171.2,-63.4,171.7,-51.9,165.7,-51.7,165.2,-63.2]],
  ['', 3.6, [165.2,-63.2,165.7,-51.7,159.7,-51.4,159.3,-62.9]],
  ['', 3.7, [159.7,-51.4,153.3,-51.1,152.9,-62.6,159.3,-62.9]],
  ['', 8.7, [201.3,5.7,202.5,28.1,191.0,28.7,190.9,27.4,187.6,27.6,186.5,6.5,197.6,5.8,201.0,5.7]],
  ['', 4.5, [161.7,34.5,157.5,34.7,156.2,8.3,170.1,7.6,170.5,16.4,172.6,16.3,173.3,30.4,173.2,30.4,173.4,33.8,167.1,34.1,167.3,36.5,161.8,36.8]],
  ['', 8.0, [102.8,-17.0,103.9,-2.1,98.3,-1.7,97.2,-16.6]],
  ['', 7.8, [95.0,-176.7,95.9,-160.9,85.1,-160.4,84.5,-176.3]],
  ['', 7.5, [99.2,-55.7,99.4,-41.9,92.1,-41.8,91.9,-55.5]],
  ['', 7.1, [107.0,12.3,107.8,38.2,94.2,38.6,93.4,12.8]],
  ['', 9.3, [91.0,-98.3,91.4,-81.6,83.2,-81.4,82.8,-98.1]],
  ['', 9.4, [92.1,-136.5,94.9,-136.5,94.9,-135.3,100.0,-135.4,100.3,-122.8,92.4,-122.7,92.2,-133.0]],
  ['', 8.9, [78.0,-123.3,75.7,-123.2,75.4,-130.7,78.6,-130.9,78.4,-134.2,81.1,-134.3,81.1,-135.7,83.3,-135.8,83.4,-134.2,88.6,-134.5,88.8,-130.7,84.9,-126.6,85.2,-119.0,78.2,-118.6]],
  ['', 6.8, [89.5,-54.6,89.9,-39.7,84.7,-39.5,84.3,-54.4]],
  ['', 8.4, [77.0,-165.1,72.0,-164.7,71.1,-176.1,76.1,-176.5]],
  ['', 6.4, [89.4,3.8,90.9,39.5,81.8,39.9,81.1,23.4,81.7,19.5,82.4,19.5,81.7,4.1]],
  ['', 4.5, [76.8,1.9,76.9,9.7,59.0,10.0,59.0,4.4,61.5,4.4,61.5,2.7,68.4,2.6,68.4,2.0]],
  ['', 8.1, [69.3,-95.4,74.2,-95.4,74.2,-86.0,76.6,-86.0,76.6,-81.0,69.4,-81.0,69.4,-85.3]],
  ['', 12.0, [65.7,-11.7,64.8,-11.7,64.8,-12.3,63.9,-12.3,63.9,-13.8,64.9,-13.8,64.9,-14.8,65.3,-14.9,65.1,-18.6,73.9,-19.0,74.1,-13.7,76.0,-13.8,76.2,-7.2,74.0,-7.1,74.1,-4.2,66.0,-3.9,65.8,-11.0]],
  ['', 7.7, [60.1,-174.6,66.7,-174.9,67.3,-157.6,60.7,-157.4,60.7,-158.4,60.2,-172.6]],
  ['', 8.9, [69.8,-133.1,70.1,-120.2,63.5,-120.0,63.2,-132.9]],
  ['', 7.7, [60.2,-172.6,60.7,-158.4,54.1,-158.2,53.6,-172.3]],
  ['', 8.1, [61.4,-134.1,61.8,-120.0,56.7,-119.8,56.3,-133.9]],
  ['', 8.2, [69.4,-85.3,63.7,-85.3,63.6,-95.3,69.3,-95.4]],
  ['', 7.8, [53.6,-172.3,54.1,-158.2,47.6,-157.9,47.1,-172.1]],
  ['', 8.3, [60.4,-17.2,60.3,-10.5,58.7,-10.5,58.6,-6.4,53.7,-6.4,53.9,-17.3]],
  ['', 7.5, [47.6,-157.3,41.3,-157.0,40.7,-174.3,47.0,-174.5,47.1,-172.1,47.6,-157.9]],
  ['', 8.1, [49.5,-135.6,53.2,-135.8,53.3,-133.7,54.5,-133.8,55.2,-120.2,50.3,-120.0,50.3,-121.2]],
  ['', 9.2, [52.2,-63.1,43.5,-62.7,43.3,-68.8,58.1,-69.4,58.4,-60.2,57.4,-60.2,58.3,-38.8,51.2,-38.5,50.6,-54.7,52.1,-54.8,51.9,-59.8,52.3,-59.8]],
  ['', 7.8, [44.8,-87.8,42.8,-87.7,42.6,-92.4,43.3,-92.4,43.0,-97.8,49.8,-98.2,50.5,-86.4,44.9,-86.0]],
  ['', 9.3, [51.1,-14.9,51.9,1.2,45.4,1.6,44.6,-14.6]],
  ['', 7.5, [37.3,-177.8,37.7,-166.2,35.6,-166.1,35.7,-162.3,32.4,-162.2,31.9,-177.6]],
  ['', 8.8, [40.0,-94.8,40.5,-83.5,34.7,-83.2,34.2,-94.6]],
  ['', 9.8, [44.6,-14.6,45.4,1.6,39.4,1.9,38.6,-14.3]],
  ['', 7.6, [28.5,-173.9,29.4,-157.1,24.0,-156.8,23.1,-173.5]],
  ['', 7.7, [44.3,-131.3,44.3,-118.7,35.0,-118.6,35.0,-131.2]],
  ['', 9.8, [42.0,-59.1,42.5,-42.0,33.8,-41.7,33.4,-54.4,36.1,-54.5,35.9,-58.9]],
  ['', 8.4, [34.7,-83.2,29.3,-83.0,28.8,-94.4,34.2,-94.6]],
  ['', 9.5, [39.4,1.9,33.2,2.2,32.5,-13.9,38.6,-14.3]],
  ['', 8.2, [30.4,-135.9,31.1,-122.2,25.6,-121.9,25.1,-135.6]],
  ['', 7.1, [24.0,-156.8,18.5,-156.5,17.8,-168.6,18.4,-168.6,18.2,-172.0,20.8,-172.1,20.7,-173.4,23.1,-173.5]],
  ['', 8.2, [25.6,-121.9,20.3,-121.6,19.6,-135.3,25.1,-135.6]],
  ['', 5.1, [18.0,-43.6,17.5,-43.6,17.3,-55.6,25.7,-55.8,25.9,-43.8,25.0,-43.8,25.0,-41.2,18.1,-41.1]],
  ['', 7.3, [13.0,-138.6,13.2,-121.3,4.7,-121.2,4.5,-138.5]],
  ['', 4.5, [-9.3,-173.9,-6.5,-174.0,-6.3,-170.0,-3.8,-170.1,-3.3,-156.9,-5.1,-156.9,-6.2,-156.1,-8.2,-156.1,-9.4,-156.8,-9.9,-158.0,-10.0,-159.1,-10.9,-159.1,-11.3,-170.0,-9.1,-170.1]],
  ['', 9.3, [-1.1,-55.6,2.0,-55.7,2.1,-54.1,5.1,-54.2,5.2,-51.4,5.6,-51.4,5.8,-38.9,-0.7,-38.7]],
  ['', 9.1, [4.4,-95.7,5.5,-77.4,-1.5,-77.0,-2.5,-95.3]],
  ['', 9.5, [-15.2,-174.8,-14.7,-164.7,-19.9,-164.4,-20.4,-174.6]],
  ['', 6.8, [-2.4,-134.9,0.6,-135.1,0.7,-132.4,1.4,-132.4,2.0,-121.4,1.4,-121.3,1.5,-119.1,-5.8,-118.6,-6.5,-131.9,-2.3,-132.2]],
  ['', 9.6, [-9.0,-52.6,-5.3,-52.7,-5.2,-50.8,-2.3,-50.9,-2.0,-38.5,-8.6,-38.3]],
  ['', 7.2, [-5.6,-92.5,-5.1,-79.9,-12.5,-79.7,-12.9,-92.3]],
  ['', 9.6, [-15.5,-138.2,-14.8,-120.9,-22.8,-120.6,-23.5,-137.8]],
  ['', 8.4, [-28.3,-175.0,-28.4,-161.8,-34.9,-161.8,-34.7,-175.1]],
  ['', 8.7, [-35.6,-132.7,-26.4,-133.0,-25.8,-116.5,-30.1,-116.3,-30.2,-117.4,-35.1,-117.3]],
  ['', 5.8, [-32.3,-53.7,-21.6,-54.2,-20.8,-37.4,-31.5,-36.9,-31.6,-38.2,-32.2,-51.9]],
  ['', 8.7, [-19.1,-97.9,-18.4,-76.9,-30.3,-76.5,-30.9,-97.5]],
  ['', 3.3, [-31.6,-38.2,-38.6,-37.9,-39.3,-51.5,-32.2,-51.9]],
  ['subst', 3.0, [62.5,20.8,69.7,20.4,70.5,38.6,63.2,38.8,62.7,25.9]],
  ['w212', 5.7, [32.4,41.1,31.7,12.8,61.4,12.0,62.2,40.3]],
  ['', 9.0, [168.8,-1.7,169.1,4.5,157.3,5.1,157.0,-1.1]],
  ['', 9.6, [154.9,-22.8,167.8,-23.5,168.1,-18.1,169.5,-18.2,169.7,-15.3,155.4,-14.5]],
  ['', 7.4, [130.8,-51.0,130.8,-42.4,113.1,-42.4,113.1,-51.1]],
  ['', 4.6, [-42.4,-51.2,-42.0,-36.7,-61.7,-36.2,-65.1,-39.3,-65.4,-50.6]],
  ['', 7.3, [-58.1,-58.9,-58.0,-57.7,-52.7,-57.9,-52.7,-58.9,-42.3,-59.2,-42.1,-52.3,-66.5,-51.6,-66.7,-58.7]],
  ['', 7.3, [-42.5,-66.9,-42.3,-59.2,-52.7,-58.9,-52.8,-60.3,-58.1,-60.2,-58.1,-58.9,-66.7,-58.7,-66.8,-66.3,-48.5,-66.8]],
  ['', 8.9, [-45.8,-73.5,-45.7,-68.4,-48.6,-68.3,-48.5,-66.8,-66.8,-66.3,-67.0,-72.9]],
  ['', 9.5, [132.2,-65.8,132.6,-57.3,116.5,-56.6,116.2,-65.1]],
  ['', 6.9, [165.2,-78.9,165.2,-78.1,168.4,-78.2,168.5,-72.9,155.0,-72.5,154.9,-78.7]],
  ['', 8.9, [-67.5,-72.9,-67.6,-79.4,-48.9,-79.9,-49.0,-81.6,-45.3,-81.7,-45.2,-78.7,-45.9,-78.7,-45.8,-73.5,-67.0,-72.9]],
  ['', 8.0, [160.2,-94.9,160.1,-96.3,165.5,-96.6,165.7,-92.7,167.4,-92.7,167.6,-88.3,154.2,-87.6,153.9,-94.6]],
  ['', 8.9, [116.8,-93.2,121.9,-93.5,121.9,-92.4,126.0,-92.6,126.3,-88.7,128.0,-88.8,128.4,-82.9,113.8,-82.0,113.6,-84.4,114.9,-84.5,114.8,-85.4,117.3,-85.6]],
  ['', 4.5, [-40.4,-97.5,-40.0,-87.5,-45.1,-87.3,-44.9,-83.0,-68.7,-81.8,-69.4,-96.0,-68.9,-96.0]],
  ['', 9.2, [-55.8,-124.1,-55.6,-117.4,-69.3,-117.1,-69.5,-123.8]],
  ['', 9.5, [-50.9,-131.0,-50.7,-124.3,-55.8,-124.1,-69.5,-123.8,-69.6,-130.5,-66.4,-130.6]],
  ['', 9.1, [-36.5,-146.3,-36.2,-131.3,-50.9,-131.0,-66.4,-130.6,-66.8,-145.6,-52.9,-145.9]],
  ['', 10.0, [162.7,-144.2,162.8,-142.1,166.6,-142.2,166.8,-136.8,151.4,-136.1,151.0,-143.6]],
  ['', 10.3, [-51.8,-153.8,-51.7,-150.2,-53.0,-150.2,-52.9,-145.9,-66.8,-145.6,-66.9,-153.4]],
  ['', 6.1, [124.1,-156.5,124.1,-155.5,129.8,-155.8,130.0,-150.3,115.3,-149.7,115.0,-155.4,119.8,-155.6,119.8,-156.3]],
  ['', 10.3, [-53.2,-161.4,-53.1,-157.3,-51.9,-157.3,-51.8,-153.8,-66.9,-153.4,-67.1,-161.1]],
  ['', 7.6, [174.7,-124.0,171.6,-123.9,171.5,-129.1,172.9,-129.1,172.8,-132.6,174.1,-132.6,174.0,-133.5,180.0,-133.6,180.2,-122.6,174.7,-122.5]],
  ['', 4.5, [216.2,-3.0,216.5,4.7,201.8,5.4,201.5,-2.4]],
  ['', 3.3, [197.6,5.8,197.4,0.3,200.8,0.2,201.0,5.7]],
  ['', 5.0, [57.5,-75.8,57.9,-70.0,51.4,-69.6,51.0,-75.4]],
  ['', 4.8, [74.6,10.8,75.0,25.2,70.2,25.4,69.7,11.0]],
  ['', 3.3, [95.4,-7.7,95.8,-2.8,92.5,-2.5,92.1,-7.4]],
  ['teal', 5.4, [-29.4,11.9,-60.9,12.5,-61.2,8.7,-63.2,-17.5,-31.0,-18.2]],
  ['', 4.1, [110.3,-54.4,110.5,-48.6,104.6,-48.4,104.4,-54.1]],
  ['', 3.3, [25.9,-147.7,25.9,-141.8,21.9,-141.7,21.8,-147.6]],
  ['', 3.3, [69.5,11.4,69.7,16.4,63.1,16.7,62.9,11.8]],
  ['', 4.6, [181.9,-95.3,182.1,-88.3,175.4,-88.1,175.2,-95.0]],
  ['', 4.4, [22.0,-74.8,22.1,-69.1,14.2,-68.9,14.1,-74.7]],
  ['', 4.7, [76.3,-148.7,76.5,-143.2,71.1,-142.9,70.9,-148.4]],
  ['', 4.9, [12.6,-67.7,12.7,-59.6,3.1,-59.5,3.0,-67.6]],
  ['', 5.5, [190.4,-80.5,190.5,-73.5,183.4,-73.4,183.3,-80.4]],
  ['', 5.0, [185.2,-17.4,185.2,-9.2,178.5,-9.2,178.4,-17.3]],
  ['', 3.3, [21.9,-141.7,17.1,-141.7,17.0,-147.6,21.8,-147.6]],
  ['', 4.7, [-28.6,-154.6,-28.2,-148.1,-36.0,-147.6,-36.4,-154.1]],
  ['', 3.8, [110.0,-87.6,110.1,-81.3,103.7,-81.2,103.6,-87.5]],
  ['', 4.2, [110.6,-70.1,111.2,-62.5,105.2,-61.9,104.6,-69.6]],
  ['', 6.4, [205.5,-81.6,205.6,-74.8,198.9,-74.6,198.7,-81.4]],
  ['', 3.6, [93.3,-69.5,93.5,-64.0,89.7,-63.8,89.5,-69.4]],
  ['', 4.2, [182.3,-79.7,182.6,-73.5,176.4,-73.2,176.1,-79.4]],
  ['', 8.4, [25.6,-99.4,26.5,-82.4,18.7,-82.0,17.8,-99.0]],
  ['', 7.7, [193.6,-3.1,188.3,-2.9,187.6,-21.8,193.0,-22.0]],
  ['', 4.5, [-8.1,-67.2,-7.9,-61.1,-17.0,-60.9,-17.2,-67.0]],
  ['', 3.1, [190.7,-0.1,190.9,5.3,186.6,5.4,186.5,0.0]],
  ['', 4.0, [85.8,-77.3,85.9,-70.5,81.4,-70.4,81.3,-77.2]],
  ['', 3.7, [88.4,-142.9,88.4,-137.0,80.2,-136.9,80.2,-142.8]],
  ['', 3.8, [99.8,-156.4,100.0,-150.3,95.1,-150.3,95.1,-156.4]],
  ['', 5.1, [21.0,-67.7,21.0,-61.0,13.6,-60.9,13.6,-67.7]],
  ['', 4.3, [-16.5,-153.4,-16.5,-147.6,-20.3,-147.6,-20.3,-153.4,-17.3,-153.4]],
  ['', 4.3, [103.3,-69.4,103.4,-61.8,96.0,-61.7,96.0,-69.3,100.0,-69.3]],
  ['', 4.6, [186.1,-0.3,186.2,6.5,180.2,6.6,180.1,-0.1,181.6,-0.2]],
  ['', 5.4, [-41.2,-72.4,-33.3,-72.5,-33.2,-67.2,-40.4,-67.1,-40.4,-67.8,-41.1,-67.7]],
  ['', 7.7, [108.5,-17.0,122.5,-17.6,123.0,-7.5,130.5,-7.9,131.1,6.2,109.6,7.2]],
  ['', 3.4, [34.6,-67.6,35.0,-61.5,32.2,-61.4,32.4,-57.8,29.3,-57.6,28.8,-67.3]],
  ['', 3.5, [-7.0,-146.9,-6.9,-146.4,-5.1,-146.6,-4.6,-141.0,-12.9,-140.2,-13.4,-146.3]],
  ['', 5.3, [127.0,-148.1,128.0,-124.4,103.6,-123.3,102.8,-142.6,116.1,-143.2,115.9,-147.6]],
  ['', 3.1, [83.4,1.0,82.6,1.1,82.5,-1.1,88.3,-1.5,88.5,0.8,89.3,0.7,89.5,3.1,83.5,3.5]],
  ['', 3.1, [89.7,-19.1,90.2,-4.6,82.7,-4.4,82.7,-4.5,80.2,-4.4,79.8,-16.2,84.1,-16.4,84.1,-18.9]],
  ['', 11.0, [-72.8,-161.0,-73.0,-173.2,-52.0,-173.7,-51.9,-169.1,-50.3,-169.2,-50.1,-161.5,-53.2,-161.4,-67.1,-161.1]],
  ['dealer', 7.6, [63.5,85.4,65.1,85.4,65.3,97.7,80.9,97.4,80.9,102.0,75.1,102.1,60.3,102.4,20.3,103.1,19.8,71.9,63.3,71.1]],
  ['', 4.8, [-46.5,170.0,-47.0,155.1,-24.5,154.3,-24.0,169.2,-28.5,169.3]],
  ['dealer2', 3.8, [78.3,70.9,80.4,72.9,80.6,85.1,65.1,85.4,63.5,85.4,63.3,71.1]],
  ['', 8.5, [83.3,156.2,83.9,171.2,77.8,171.5,77.2,156.4]],
  ['', 8.5, [77.8,171.5,71.4,171.8,70.8,156.7,77.2,156.4]],
  ['', 8.8, [68.0,156.8,68.8,171.8,62.3,172.2,61.6,157.1]],
  ['', 8.5, [62.3,172.2,55.8,172.5,55.1,157.5,61.6,157.1]],
  ['', 9.3, [52.5,157.4,53.2,172.5,46.7,172.8,46.0,157.8]],
  ['', 9.1, [46.7,172.8,40.2,173.1,39.5,158.1,46.0,157.8]],
  ['', 11.3, [30.2,165.5,29.1,165.5,28.9,160.7,32.2,160.5,32.1,158.5,34.5,158.4,34.5,159.5,37.0,159.4,37.7,173.4,35.0,173.5,35.2,176.4,30.7,176.6]],
  ['plaza', 15.8, [-27.6,73.7,3.5,72.2,4.4,93.4,-5.3,93.8,-5.1,102.6,-20.4,103.2,-20.5,102.1,-26.2,102.4,-26.9,87.9]],
  ['', 11.2, [-223.7,147.3,-217.1,147.8,-216.6,141.6,-223.2,141.1,-222.1,126.9,-211.3,127.7,-212.1,137.0,-207.1,137.4,-206.5,129.4,-196.4,130.2,-196.8,134.7,-187.8,135.4,-187.5,131.0,-177.3,131.8,-177.9,139.7,-172.9,140.1,-172.2,131.0,-161.7,131.8,-162.8,146.1,-169.4,145.6,-169.8,151.6,-163.5,152.0,-164.5,165.0,-187.4,163.2,-186.7,154.7,-183.1,155.0,-182.6,148.1,-184.0,148.0,-183.9,146.6,-202.4,145.2,-202.5,146.7,-204.0,146.6,-204.5,153.3,-201.0,153.5,-201.7,162.1,-224.7,160.3]],
  ['', 8.3, [-86.1,171.3,-72.1,172.5,-73.0,181.8,-101.0,179.4,-100.2,170.3,-96.9,170.6]],
  ['', 10.9, [72.7,136.7,72.8,137.5,73.8,137.5,73.7,135.0,79.8,134.8,80.0,144.8,78.0,144.8,78.0,145.6,66.5,145.9,66.3,137.7,67.3,137.6,67.3,136.8]],
  ['', 7.9, [44.2,141.1,44.4,147.9,29.2,148.3,29.0,141.6]],
  ['', 8.2, [29.0,141.6,28.8,134.7,44.0,134.3,44.2,141.1]],
  ['', 8.6, [76.0,124.7,76.2,131.1,61.2,131.8,61.0,125.4]],
  ['', 9.2, [42.8,124.7,43.1,130.6,26.2,131.4,26.0,125.4]],
  ['', 10.5, [-201.3,116.2,-201.9,122.8,-218.1,121.3,-217.5,114.7]],
  ['', 8.6, [61.0,125.4,60.7,119.3,75.7,118.6,76.0,124.7]],
  ['', 9.2, [42.6,118.3,42.8,124.7,26.0,125.4,25.7,119.1]],
  ['', 9.6, [-119.2,118.8,-119.5,121.7,-121.7,121.5,-121.9,123.7,-134.8,122.4,-134.3,117.3]],
  ['', 10.0, [-200.8,109.6,-201.3,116.2,-217.5,114.7,-217.0,108.2]],
  ['', 9.3, [-119.0,109.1,-119.0,109.7,-114.2,110.1,-114.6,115.9,-119.5,115.6,-119.6,117.1,-135.8,115.8,-135.2,107.8]],
  ['', 9.2, [75.4,108.3,75.6,114.3,60.8,114.9,60.6,108.9]],
  ['', 9.5, [42.3,111.7,42.6,118.3,25.7,119.1,25.4,112.5]],
  ['', 10.9, [-200.3,103.0,-200.8,109.6,-217.0,108.2,-216.5,101.7]],
  ['', 6.7, [-74.4,105.0,-74.1,112.4,-107.4,109.9,-119.0,109.1,-135.2,107.8,-134.7,100.6,-107.1,102.6]],
  ['', 9.2, [25.4,112.5,25.2,105.9,42.0,105.1,42.3,111.7]],
  ['', 10.3, [-216.5,101.7,-216.0,95.2,-199.8,96.5,-200.3,103.0]],
  ['', 6.4, [-74.7,97.7,-74.4,105.0,-107.1,102.6,-106.5,95.3,-89.8,96.5]],
  ['', 8.0, [-76.5,89.9,-74.7,97.7,-89.8,96.5,-89.2,88.9,-76.6,89.9]],
  ['whitecastle', 4.1, [-31.4,87.7,-30.8,100.9,-49.7,101.7,-50.6,89.0]],
  ['', 8.9, [-130.9,73.7,-138.3,72.8,-136.7,60.0,-96.2,65.2,-96.4,66.1,-87.8,67.2,-87.7,66.6,-81.3,72.1,-81.9,72.5,-79.8,81.3,-85.3,82.5,-87.6,83.3,-87.5,84.2,-90.4,85.2,-95.3,84.5,-98.3,81.6,-98.6,81.1,-110.4,79.5,-110.0,76.2,-123.9,74.4,-125.4,85.8,-132.3,84.9]],
  ['', 4.3, [32.8,150.3,32.8,156.1,26.0,156.2,25.9,150.4]],
  ['', 4.3, [58.6,141.7,59.1,148.3,53.5,148.7,53.0,142.1]],
  ['', 9.7, [75.1,102.1,75.4,108.3,60.6,108.9,60.3,102.4]],
  ['', 7.2, [-72.6,128.2,-72.2,150.9,-93.1,149.4,-93.6,126.7,-73.9,128.1]],
  ['', 4.9, [-49.7,106.7,-19.5,105.5,-18.4,135.5,-48.6,136.7,-49.0,124.3]],
  ['', 5.9, [-74.1,112.4,-73.9,128.1,-93.6,126.7,-107.9,125.7,-107.4,109.9]],
  ['', 4.1, [-28.5,169.3,-28.1,181.4,-46.9,182.1,-47.3,170.0,-46.5,170.0]],
  ['', 6.2, [-197.0,54.2,-197.1,56.6,-191.3,57.1,-191.1,54.5,-187.8,54.8,-189.1,71.8,-217.3,69.8,-216.1,52.8,-208.7,53.3]],
  ['', 15.6, [-86.1,171.3,-85.7,167.5,-96.5,166.6,-96.9,170.6,-100.2,170.3,-139.4,166.9,-137.8,148.9,-72.9,154.6,-72.1,172.5]],
  ['', 8.0, [161.0,158.6,161.5,169.5,156.0,169.7,155.6,158.9]],
  ['', 8.4, [156.0,169.7,150.4,170.0,149.9,159.1,155.6,158.9]],
  ['', 8.9, [120.3,70.1,120.3,71.8,137.1,71.5,137.1,69.7,159.0,69.3,159.4,96.3,99.7,97.4,99.2,70.5,104.8,70.4]],
  ['', 10.5, [135.5,171.1,134.8,171.1,134.9,168.6,134.2,168.6,134.2,160.3,134.8,160.3,134.8,158.7,135.8,158.7,135.8,155.4,141.2,155.5,141.2,160.0,143.1,160.0,143.1,164.9,144.7,164.9,144.7,173.1,135.4,173.1]],
  ['', 10.7, [129.6,157.8,130.0,173.2,120.9,173.5,120.5,158.1]],
  ['', 7.9, [115.8,162.1,116.3,174.2,106.9,174.6,106.3,162.5]],
  ['', 8.3, [106.3,162.5,105.8,150.4,115.2,150.0,115.8,162.1]],
  ['', 8.3, [155.9,137.7,156.0,143.2,145.0,143.5,145.0,141.8,141.9,141.9,141.8,138.0]],
  ['', 11.2, [117.7,134.1,117.7,137.6,121.0,137.6,121.0,141.8,118.6,141.8,118.6,143.5,110.9,143.5,110.9,144.1,104.0,144.1,104.0,134.1]],
  ['', 8.7, [141.8,138.0,141.7,134.0,144.7,134.0,144.7,132.4,155.8,132.1,155.9,137.7]],
  ['', 9.0, [120.7,123.3,120.8,128.9,103.3,129.2,103.3,123.6]],
  ['', 8.6, [155.3,121.9,155.5,128.1,144.6,128.3,144.5,122.2]],
  ['', 9.7, [103.3,123.6,103.2,118.2,120.7,117.9,120.7,123.3]],
  ['', 8.8, [144.5,122.2,144.4,117.1,155.2,116.8,155.3,121.9]],
  ['', 8.6, [154.8,106.9,154.9,112.8,144.3,113.1,144.2,107.2]],
  ['', 8.9, [116.8,108.3,116.8,108.8,120.3,108.7,120.4,113.6,106.4,113.9,106.3,108.6]],
  ['', 9.0, [144.2,107.2,144.1,101.7,154.6,101.4,154.8,106.9]],
  ['', 8.9, [106.3,108.6,106.2,103.1,120.7,102.7,120.8,106.0,116.8,106.1,116.8,108.3]],
  ['', 3.3, [154.8,145.6,155.0,148.5,150.2,148.7,150.1,145.8]],
  ['', 3.3, [131.6,139.0,131.9,145.5,125.8,145.8,125.4,139.3]],
  ['', 2.6, [236.9,97.1,237.1,103.2,181.4,105.6,181.1,99.4]],
  ['', 3.8, [131.8,146.1,132.1,152.2,125.6,152.6,125.3,146.4]],
  ['', 10.0, [191.8,160.0,184.4,160.4,183.8,149.9,190.8,149.5,190.1,135.5,183.4,135.9,182.9,125.2,190.2,124.8,190.1,121.5,189.4,121.5,189.0,113.7,200.3,113.1,200.7,122.1,203.7,122.0,203.7,123.4,216.5,122.7,216.5,121.4,219.5,121.2,219.1,112.4,230.3,111.8,230.7,119.6,229.9,119.7,230.1,122.9,237.4,122.5,237.9,133.3,231.1,133.7,231.4,140.5,221.1,141.1,220.8,134.5,221.6,134.4,221.4,130.8,199.7,132.0,199.8,135.4,200.4,135.3,201.1,148.4,200.2,148.5,200.4,152.1,211.3,151.5,211.8,160.0,205.3,160.4,205.3,161.6,202.4,161.8,202.9,170.8,191.4,171.4,191.0,163.4,192.0,163.3]],
  ['', 3.1, [161.9,145.4,161.9,149.4,155.3,149.5,155.2,145.5,161.7,145.4]],
  ['capone', 6.0, [-91.9,30.1,-92.8,13.4,-94.3,13.3,-94.3,11.0,-108.1,12.4,-108.1,13.5,-111.0,13.8,-109.6,32.7,-95.4,34.3,-95.6,30.5]],
];
