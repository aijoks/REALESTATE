// Real surroundings for site 'tucson-saguaro-vista' (traced from satellite imagery / OSM).
// Called at the end of buildSuburban. ctx: { THREE, scene, add, flat, box, W, D, front, site, r, mats }
// Coordinates: building centred at origin, +z = the building's street front, metres.
//
// Saguaro Vista Shopping Center, 7780-7890 E Speedway Blvd (SW corner of
// Speedway & Pantano). The model is the Fry's building (136 x 58 m incl. the
// Dollar Tree in-line space); its front faces north onto the parking field
// and Speedway Blvd. Model axes: +z = north, +x = west.
// Pixel->model (Google z19 tile mosaic, 0.2525 m/px): x = -(px-892)*0.2525,
// z = -(py-1125)*0.2525. OSM POIs (dx, dy from 32.2345,-110.8255):
// x = -(11.8 + dx), z = 48.7 - dy.
import { desertKit, arrow } from './tucson-snyder.js';
import { textTexture } from '../textures.js';

export function site_tucson_saguaro_vista(ctx) {
  const K = desertKit(ctx, { seed: 7812 });
  const { THREE } = ctx;
  const { mat, flat, poly, road, stalls, pole, tree, palm, bed, bldg, sign, monument, canopy, box, M, strip, glazing, desert, agave, wallRun } = K;
  K.flipRidges(); // the Santa Catalinas are north (+z) here
  const front = ctx.front; // 29
  flat(M('#c7ad88', { roughness: 1 }), -500, 500, -500, 500, 0.02);

  // ---- roads ----
  // E Speedway Blvd: z 150.2..184.3, raised median z 165.4..170.4.
  road(400, 167.3, -400, 167.3, 34, { median: 5, lanes: [-6.1, -9.7, 6.1, 9.7], walk: 2.5 });
  // N Pantano Rd: x -149.5..-185, median.
  road(-167, 149.8, -167, -500, 35, { median: 4, lanes: [-5.8, -9.4, 5.8, 9.4], walk: 2.5 });
  road(-167, 184.8, -167, 500, 35, { median: 4, lanes: [-5.8, -9.4, 5.8, 9.4], walk: 2.5 });
  flat(mat.road, -185, -149.5, 150, 184.5, 0.046);
  for (const [ax, az, bx, bz] of [[-150, 148, -184, 148], [-150, 186.5, -184, 186.5], [-147.5, 151, -147.5, 183.5], [-187, 151, -187, 183.5]]) {
    const len = Math.hypot(bx - ax, bz - az);
    for (let t = 0; t < len; t += 1) strip(mat.white, ax + (bx - ax) * t / len, az + (bz - az) * t / len, ax + (bx - ax) * (t + 0.5) / len, az + (bz - az) * (t + 0.5) / len, 3, 0.07);
  }
  // Residential street south of the center and the cul-de-sac (Grady Ave).
  road(230, -46, -149, -46, 9, { centre: 'none', walk: 1.5 });
  road(-80, -46, -80, -110, 8, { centre: 'none' });

  // ---- the parking field ----
  flat(mat.asphalt, -149, 115, 29, 150, 0.05); // whole field to Speedway & Pantano
  flat(mat.asphalt, -149, 115, -42, 29, 0.049); // side / rear drives
  // Landscape strip along Speedway with trees (sat: palo verdes + mesquites).
  bed(-148, 114, 146.5, 150, { m: mat.redgravel });
  for (let x = 108; x > -146; x -= 13) tree(x + K.r() * 3, 148.2, 0.85, K.r() < 0.5 ? 'mesquite' : 'paloverde');
  // Entry gaps from Speedway (west, centre, east) cut through the strip.
  for (const [x0, x1] of [[106, 114], [21, 31], [-77, -68]]) flat(mat.asphalt, x0, x1, 146.4, 150.3, 0.07);
  // Single row along Speedway, nose north.
  stalls(18, 140.5, -66, 140.5, -1, { depth: 5.5, fill: 0.35 });
  stalls(104, 140.5, 66, 140.5, -1, { depth: 5.5, fill: 0.2 });
  // Eight double rows running N-S (sat: tree islands at both ends).
  const rows = [59.8, 39.6, 19.4, 0, -18.4, -37.4, -56.3, -76];
  rows.forEach((x, i) => {
    stalls(x, 50, x, 128, 1, { depth: 5.4, fill: 0.62 - Math.abs(i - 3.5) * 0.06, ada: i === 3 || i === 4 ? 3 : 0 });
    stalls(x, 50, x, 128, -1, { depth: 5.4, fill: 0.6 - Math.abs(i - 3.5) * 0.06 });
    bed(x - 5.4, x + 5.4, 46.5, 50, { trees: 1, kind: 'mesquite' });
    bed(x - 5.4, x + 5.4, 128, 131.5, { trees: 1, kind: 'paloverde' });
    if (i % 2 === 0) pole(x, 89, { h: 10, arms: 2, ry: 0 });
  });
  arrow(ctx, K, 30, 40, 0);
  arrow(ctx, K, -40, 37, Math.PI);
  // Storefront fire lane markings along Fry's.
  flat(M('#d24b3b'), -68, 68, 33.4, 33.7, 0.075);
  // Cart corrals.
  for (const [x, z] of [[29.6, 70], [-9, 100], [-47, 70]]) box(M('#c9cdd0', { metalness: 0.6, roughness: 0.4 }), 1.6, 1.1, 6, x, 0.55, z);
  // Fry's pylon at the Speedway centre entry.
  monument("FRY'S", 34, 143.6, 0, { w: 3.6, h: 2.4, bg: '#ffffff', color: '#d0242e', base: '#8f8a84', font: '900 {s}px Arial Black, Arial', sub: 'FOOD & DRUG' });
  // Pharmacy drive-thru canopy + red sign at the east end.
  box(M('#e7dcc9'), 7, 0.8, 6, -71.5, 4.4, 20);
  for (const z of [17.5, 22.5]) box(M('#8f8a84'), 0.6, 4, 0.6, -74.5, 2, z);
  sign('PHARMACY DRIVE THRU', -71.5, 4.4, 23.05, 0, { w: 6.4, h: 0.7, color: '#ffffff', bg: '#d0242e', glow: 0.4 });
  // Rear service drive and loading docks.
  for (let k = 0; k < 4; k++) box(M('#5a5a58'), 3.6, 3.8, 0.3, -20 + k * 5, 1.9, -29.2);
  box(M('#f2f2f0'), 16, 4, 2.6, -2, 2.0, -36, 0); // trailer
  box(M('#efefea'), 2.4, 2.9, 2.6, -11.5, 1.45, -36);
  wallRun(-149, -42, 115, -42, 2.2, '#c6b294');
  bed(-149, 115, -46 + 4.5, -42, { m: mat.gravel });

  // ---- Fry's Fuel Center (7770) ----
  canopy(47.8, 121.2, 29, 13.6, 0, { fascia: '#ffffff', band: '#d0242e', brand: "FRY'S FUEL", brandColor: '#d0242e', h: 5.2 });
  bldg({ x: 48.4, z: 111.5, w: 7, d: 4.6, h: 3.6, color: '#e7dcc9', rtu: 0 });
  // ---- MY DR NOW (7760): pad at the NW corner ----
  bldg({ x: 89.5, z: 117, w: 26.5, d: 13.4, h: 6.2, color: '#e9e0cf', rtu: 2 });
  box(M('#8f8a84'), 6, 7.2, 1.0, 82, 3.6, 123.8);
  sign('MY DR NOW', 82, 5.6, 124.35, 0, { w: 5, h: 0.9, color: '#ffffff', bg: '#1d6fb8', glow: 0.3, depth: 0.1 });
  glazing(92, 123.75, 0, 14, 2.4, 0.3);
  stalls(104, 108, 76, 108, 1, { depth: 5.2, fill: 0.4 });

  // ---- West in-line strip (7780-7798): faces east onto the field ----
  // 28.5 x 73 m building, x 78.8..107.3, z 25.3..98.5; stone arches (Simply Smiles photo).
  {
    const xf = 78.8, cz = 61.9, len = 73.2;
    bldg({ x: 93, z: cz, w: 28.5, d: len, h: 6.4, color: '#e7dcc9', rtu: 6, roofColor: '#dcd8d0' });
    // Covered walk + stone piers along the east (storefront) face.
    box(M('#e7dcc9'), 3.4, 0.6, len, xf - 1.7, 4.3, cz);
    const stone = M('#7d6f62');
    for (let z = cz - len / 2 + 1; z <= cz + len / 2 - 1; z += 7.3) box(stone, 1.0, 4.0, 1.0, xf - 3.1, 2.0, z);
    // Taller sign towers at each tenant with an arch-like recess.
    const tenants = [
      ['Simply Smiles', '#ffffff', '#3b3b3b', 85.6, 'DENTISTRY', '700 italic {s}px Georgia, serif'],
      ['SALLY BEAUTY', '#1c1c1c', null, 76.5],
      ['COST CUTTERS', '#c8102e', null, 71.5],
      ['Splash Nail Spa', '#2a7fb8', null, 51.3, null, 'italic 700 {s}px Georgia, serif'],
      ['PARK AVENUE CLEANERS', '#1f3f6e', null, 41.2],
      ['AVAILABLE · 7798', '#6f6a62', null, 31.5],
    ];
    for (const [name, col, bg, z, sub, font] of tenants) {
      if (bg !== null || sub) {
        box(stone, 1.2, 8.2, 7, xf - 0.3, 4.1, z);
        box(M('#ece4d4'), 1.3, 2.6, 6.6, xf - 0.35, 6.7, z);
        sign(name, xf - 1.02, 6.95, z, -Math.PI / 2, { w: 5.6, h: 1.6, color: '#2a2a2a', sub, subColor: '#2a2a2a', font, glow: 0.05 });
      } else {
        sign(name, xf - 0.08, 5.4, z, -Math.PI / 2, { w: 5.2, h: 0.75, color: col, font: font ?? '800 {s}px Arial', glow: 0.25 });
      }
      glazing(xf - 0.03, z, -Math.PI / 2, 5.2, 2.6, 0.3);
    }
    // Red awnings (sat) over the storefront bays.
    for (let z = cz - len / 2 + 4; z < cz + len / 2 - 3; z += 7.3) {
      const a = box(M('#a4372c'), 1.2, 0.12, 5.4, xf - 0.7, 3.4, z);
      a.rotation.z = -0.35;
    }
    stalls(72.6, 30, 72.6, 98, -1, { depth: 5.4, fill: 0.5 });
    flat(mat.concrete, xf - 4, xf, 25.3, 98.5, 0.11);
  }
  // Behind the strip: drive + church/daycare-style buildings to the west.
  bldg({ x: 159, z: 109, w: 38.6, d: 21.5, h: 6.5, color: '#efe6d6', roof: 'hip', roofColor: '#c4552f', rise: 4 });
  bldg({ x: 160, z: 74.5, w: 14, d: 15, h: 5, color: '#eeeeea' });
  flat(M('#8aa65a'), 135, 155, 50, 75, 0.04);

  // ---- east pads along Pantano ----
  // Burger King No. 7880.
  {
    const bx = -86.2, bz = 125.2;
    bldg({ x: bx, z: bz, w: 13.4, d: 20.7, h: 5.0, color: '#c9a77c', rtu: 2, parapet: 0.4 });
    for (const [w, d, dx, dz] of [[13.6, 0.3, 0, 10.3], [13.6, 0.3, 0, -10.3], [0.3, 20.9, 6.65, 0], [0.3, 20.9, -6.65, 0]]) box(M('#d33a2c'), w, 0.8, d, bx + dx, 5.4, bz + dz, 0, false); // red fascia band
    box(M('#b5826a'), 13.5, 1.0, 20.8, bx, 0.5, bz, 0, false); // brick base
    box(M('#2b2b2d'), 1.2, 7.2, 7.5, bx + 6.9, 3.6, bz - 1); // dark entry tower (west face)
    const logo = textTexture({
      width: 512, height: 512, bg: 'rgba(0,0,0,0)',
      draw(c, w, h) {
        c.fillStyle = '#1d4f9c'; c.beginPath(); c.ellipse(w / 2, h / 2, w * 0.48, h * 0.42, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#f5a623'; c.beginPath(); c.ellipse(w / 2, h / 2, w * 0.44, h * 0.38, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#d62300'; c.font = '900 92px Arial Black, Arial'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('BURGER', w / 2, h * 0.4); c.fillText('KING', w / 2, h * 0.6);
      },
    });
    const lm = new THREE.MeshStandardMaterial({ map: logo, transparent: true, emissive: '#ffffff', emissiveMap: logo, emissiveIntensity: 0.3, depthWrite: false });
    const lg = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), lm);
    lg.position.set(bx + 7.52, 5.2, bz - 1);
    lg.rotation.y = Math.PI / 2;
    ctx.add(lg);
    sign('HOME OF THE WHOPPER', bx + 7.6, 3.0, bz - 1, Math.PI / 2, { w: 6.5, h: 0.6, color: '#e9e6df', glow: 0.1 });
    sign('7880', bx + 6.75, 4.4, bz + 8, Math.PI / 2, { w: 1.6, h: 0.6, color: '#3b3229', glow: 0 });
    glazing(bx + 6.72, bz + 5, Math.PI / 2, 8, 1.9, 0.9);
    const lg2 = lg.clone();
    lg2.position.set(bx, 5.2, bz + 10.4);
    lg2.rotation.y = 0;
    ctx.add(lg2);
    // Drive-thru lane around the east side + menu board.
    flat(M('#4a4b4d'), bx - 10.5, bx - 6.7, bz - 12, bz + 12, 0.06);
    box(M('#2b2b2d'), 0.3, 2.2, 2.4, bx - 11, 1.1, bz + 4);
    stalls(bx + 14, bz - 10, bx + 14, bz + 10, -1, { depth: 5, fill: 0.4 });
    monument('BURGER KING', -98, 143.5, 0, { w: 2.4, h: 2.4, bg: '#1d4f9c', color: '#f5a623', base: '#8f8a84' });
  }
  // Starbucks No. 7890 with drive-thru.
  {
    const bx = -130.8, bz = 125;
    bldg({ x: bx, z: bz, w: 10, d: 23, h: 5.6, color: '#e6e0d4', rtu: 1 });
    box(M('#5a4636'), 10.4, 1.2, 23.4, bx, 5.0, bz, 0, false);
    sign('STARBUCKS', bx + 5.25, 4.9, bz, Math.PI / 2, { w: 5.5, h: 0.9, color: '#ffffff', bg: '#00704a', glow: 0.3 });
    sign('STARBUCKS', bx, 4.9, bz + 11.75, 0, { w: 5.5, h: 0.9, color: '#ffffff', bg: '#00704a', glow: 0.3 });
    glazing(bx + 5.02, bz - 3, Math.PI / 2, 9, 2.4, 0.3);
    flat(M('#4a4b4d'), bx - 9, bx - 5.2, bz - 14, bz + 14, 0.06);
    stalls(bx + 12, bz - 9, bx + 12, bz + 9, 1, { depth: 5, fill: 0.5 });
  }
  // 1011 N Pantano: Anasi Flooring + Bark Avenue Dog Wash (angular white building).
  bldg({ x: -107.5, z: 75, w: 19, d: 24, h: 5.8, color: '#f2f0ea', rtu: 2 });
  poly(M('#f2f0ea'), [[-98, 87], [-117, 87], [-117, 92], [-98, 87]], 0.06);
  sign('ANASI FLOORING', -97.95, 4.4, 80, Math.PI / 2, { w: 6.5, h: 0.7, color: '#7b3f1d', glow: 0.1 });
  sign('BARK AVENUE DOG WASH', -97.95, 4.4, 68, Math.PI / 2, { w: 7.5, h: 0.7, color: '#2b6aa8', glow: 0.1 });
  glazing(-97.98, 74, Math.PI / 2, 16, 2.4, 0.3);
  // Water Street Station (1001 N Pantano).
  bldg({ x: -109.3, z: 53.7, w: 12.6, d: 11.3, h: 4.6, color: '#e7e9ec', rtu: 1 });
  sign('WATER STREET STATION', -103, 3.6, 53.7, Math.PI / 2, { w: 6.5, h: 0.7, color: '#ffffff', bg: '#1f7ab8', glow: 0.25 });
  glazing(-102.98, 52, Math.PI / 2, 5, 2.2, 0.3);
  stalls(-90, 45, -90, 95, -1, { depth: 5.2, fill: 0.35 });
  // BRAKEmax (991 N Pantano): service bays facing north.
  bldg({ x: -106.8, z: -8.2, w: 37.8, d: 16.4, h: 6.0, color: '#ecebe6', rtu: 1 });
  for (let k = 0; k < 5; k++) glazing(-93 - k * 7, 0.03, 0, 4.2, 4.0, 0, '#9ea4a8');
  sign('BRAKEmax', -106.8, 5.2, 0.05, 0, { w: 7, h: 1.0, color: '#c8102e', bg: '#ffffff', glow: 0.25 });
  stalls(-90, 2, -146, 2, -1, { depth: 5.2, fill: 0.3 });

  // ---- north of Speedway ----
  flat(mat.asphalt2, -150, 140, 186.8, 300, 0.045);
  potosino(ctx, K, -68.3, 219.7);
  // Brake Masters (7855): long bay building.
  bldg({ x: -29.8, z: 223.4, w: 12.6, d: 35.3, h: 5.6, color: '#efe7d8', rtu: 1, roof: 'flat' });
  for (let k = 0; k < 4; k++) glazing(-36.13, 210 + k * 7, -Math.PI / 2, 4, 3.8, 0, '#8c9297');
  sign('BRAKE MASTERS', -36.15, 4.7, 212, -Math.PI / 2, { w: 6, h: 0.9, color: '#ffffff', bg: '#1c3f8f', glow: 0.25 });
  // Walgreens (7885) at the NW corner of Speedway & Pantano.
  bldg({ x: -108.3, z: 237.3, w: 29.8, d: 47.6, h: 7.2, color: '#e6d3b4', rtu: 4 });
  box(M('#e6d3b4'), 6, 9, 6, -95, 4.5, 215.6, Math.PI / 4); // corner entrance tower
  { const cap = new THREE.Mesh(K.hipGeo(7.5, 1.6, 7.5), M('#3f8f86')); cap.rotation.y = Math.PI / 4; cap.position.set(-95, 9, 215.6); ctx.add(cap); }
  sign('Walgreens', -108.3, 6.0, 213.45, Math.PI, { w: 9, h: 1.6, color: '#c8102e', font: 'italic 700 {s}px "Brush Script MT", Georgia, cursive', glow: 0.3 });
  sign('Walgreens', -93.35, 6.0, 240, -Math.PI / 2, { w: 9, h: 1.6, color: '#c8102e', font: 'italic 700 {s}px "Brush Script MT", Georgia, cursive', glow: 0.3 });
  // Public Storage: long metal-roof buildings north-west of Brake Masters.
  for (const [x, z, w, d] of [[7.3, 240, 31, 88], [-20, 272, 22, 22], [-55, 272, 40, 22]]) bldg({ x, z, w, d, h: 4.2, color: '#ebe6dc', roof: 'metal', roofColor: '#c9ced3', rise: 0.5 });
  sign('PUBLIC STORAGE', 7.3, 3.2, 195.95, Math.PI, { w: 8, h: 1.0, color: '#ffffff', bg: '#f57b20', glow: 0.25 });
  // Office / medical campus north-west.
  for (const [x, z, w, d, h] of [[110, 260, 36, 22, 7], [70, 250, 26, 18, 6.5], [160, 230, 30, 26, 6.5]]) bldg({ x, z, w, d, h, color: '#f1eee8', rtu: 3 });
  for (let x = 120; x > 40; x -= 22) stalls(x, 200, x - 18, 200, 1, { depth: 5.2, fill: 0.35 });
  // SunWest FCU (7901) across the Pantano intersection.
  bldg({ x: -219, z: 240, w: 22, d: 16, h: 6, color: '#efe9de', rtu: 1 });
  sign('SUNWEST FCU', -208, 4.6, 240, Math.PI / 2, { w: 6, h: 0.8, color: '#1f4e8c', glow: 0.1 });

  // ---- east of Pantano: Speedway & Pantano Square ----
  flat(mat.asphalt2, -400, -187, -60, 148, 0.045);
  bldg({ x: -218.8, z: 102.7, w: 14, d: 20, h: 5.5, color: '#efe7d8', rtu: 1 });
  sign('JACK IN THE BOX', -211.75, 4.3, 102.7, Math.PI / 2, { w: 6, h: 1.0, color: '#d6001c', bg: '#ffffff', glow: 0.3 });
  bldg({ x: -211.8, z: 40.7, w: 14, d: 20, h: 5.5, color: '#b8763f', rtu: 1 });
  sign("ARBY'S", -204.75, 4.3, 40.7, Math.PI / 2, { w: 4.5, h: 1.2, color: '#d71920', bg: '#ffffff', glow: 0.3 });
  bldg({ x: -265, z: 60, w: 70, d: 16, h: 6, color: '#ece2cf', rtu: 4, ry: Math.PI / 2 });
  const sq = [['KUNG-FU MASSAGE', 85], ['ON THE ROCKS', 72], ['SW MOTOR VEHICLE CTR', 58], ['MORADO CANYON REALTY', 45], ['EVOLVE PHYSICAL THERAPY', 33]];
  for (const [n, z] of sq) sign(n, -256.9, 4.5, z, Math.PI / 2, { w: 7, h: 0.75, color: '#3a2f25', glow: 0.1 });
  bldg({ x: -302, z: 110, w: 30, d: 16, h: 6.5, color: '#efefea', rtu: 1 });
  sign('FIRESTONE', -286.9, 5.2, 110, Math.PI / 2, { w: 6, h: 1.0, color: '#ffffff', bg: '#d6001c', glow: 0.25 });
  stalls(-195, 0, -195, 140, 1, { depth: 5.2, fill: 0.35 });

  // ---- apartments / townhomes south and west (sat: tan two-storey rows) ----
  const apt = (x, z, w, d, ry = 0) => bldg({ x, z, w, d, h: 6, ry, color: '#e8dcc6', roof: 'gable', roofColor: '#8f6a48', rise: 2.2, eave: 0.4 });
  for (const [x, z, w, d] of [[205, 95, 30, 12], [205, 75, 30, 12], [205, 55, 30, 12], [205, 30, 30, 12], [205, 0, 30, 12], [175, 30, 28, 11], [160, 0, 22, 12], [130, -5, 24, 11], [195, -30, 30, 11]]) apt(x, z, w, d);
  for (const [x, z, w, d] of [[63, -58, 22, 11], [35, -58, 22, 11], [7, -58, 20, 11], [-28, -62, 16, 14], [-55, -60, 14, 18], [-105, -62, 18, 16], [-130, -60, 16, 18]]) apt(x, z, w, d);
  for (const [x, z, w, d] of [[120, -95, 28, 10], [90, -95, 24, 10], [30, -95, 26, 10], [-15, -95, 22, 10], [-40, -95, 22, 10], [-110, -100, 22, 12], [-135, -100, 18, 12]]) apt(x, z, w, d);
  desert(-150, 110, -140, -108, 0.4, { saguaros: true });
  desert(110, 240, -140, -45, 0.5);
  for (const [x, z] of [[100, -75], [60, -78], [-30, -78], [-120, -80], [150, 50], [180, 110]]) tree(x, z, 1.1, 'mesquite');
  for (const [x, z] of [[-150, 140], [114, 145], [-148, 30]]) palm(x, z, 13);
  agave(26, 145, 1.1); agave(-64, 145, 1.1);
}

// Potosino Mexican Food (No. 7865): stepped stucco pad across Speedway,
// front (with the sun logo) facing south toward the boulevard.
function potosino(ctx, K, cx, cz) {
  const { THREE } = ctx;
  const { M } = K;
  const g = new THREE.Group();
  g.position.set(cx, 0, cz);
  g.rotation.y = Math.PI; // local +z = world -z (south)
  ctx.add(g);
  const stucco = M('#e7dcc9');
  const stone = M('#7a6a5a', { roughness: 1 });
  const B = (m, w, h, d, x, y, z) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    g.add(mesh);
    return mesh;
  };
  const pw = 11.4, pd = 22;
  B(stucco, pw, 7.6, 9, 0, 3.8, pd / 2 - 4.5); // tall front mass
  B(stucco, pw + 0.8, 0.5, 9.8, 0, 7.85, pd / 2 - 4.5);
  B(stucco, pw - 1, 5.6, pd - 9, 0, 2.8, -4.5); // lower rear mass
  B(stucco, pw - 0.2, 0.45, pd - 8.6, 0, 5.8, -4.5);
  B(stucco, 3, 6.4, 6, pw / 2 + 1.2, 3.2, 2); // stepped side mass
  for (const x of [-pw / 2 + 0.8, -0.6, pw / 2 - 0.8]) B(stone, 1.4, 1.1, 0.3, x, 0.55, pd / 2 + 0.1);
  const glass = M('#2b3640', { roughness: 0.1, metalness: 0.5 });
  for (const x of [-2.9, 2.6]) {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 3.0), glass);
    p.position.set(x, 1.8, pd / 2 + 0.02);
    g.add(p);
  }
  for (let k = 0; k < 4; k++) {
    const w = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.7), M('#2b3640'));
    w.position.set(-4.2 + k * 2.8, 6.1, pd / 2 + 0.02);
    g.add(w);
  }
  const shade = B(M('#4e4a45', { metalness: 0.5, roughness: 0.5 }), pw + 2.5, 0.12, 2.2, 0, 3.9, pd / 2 + 1.1);
  shade.rotation.x = 0.12;
  const logo = textTexture({
    width: 1024, height: 256, bg: 'rgba(0,0,0,0)',
    draw(c, w, h) {
      c.fillStyle = '#f2b81c'; c.beginPath(); c.arc(w * 0.86, h * 0.45, 70, 0, Math.PI * 2); c.fill();
      c.font = 'italic 900 128px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.fillStyle = '#f4c23a'; c.fillText('Potosino', w / 2 + 4, h * 0.4 + 4); c.fillStyle = '#d6331f'; c.fillText('Potosino', w / 2, h * 0.4);
      c.font = '700 46px Arial'; c.fillStyle = '#1f9fb1'; c.fillText('MexicanFood', w / 2, h * 0.82);
    },
  });
  const lg = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), new THREE.MeshStandardMaterial({ map: logo, transparent: true, roughness: 0.4, emissive: '#ffffff', emissiveMap: logo, emissiveIntensity: 0.2, depthWrite: false }));
  lg.position.set(0, 4.9, pd / 2 + 0.03);
  g.add(lg);
  const num = textTexture({ width: 256, height: 96, bg: 'rgba(0,0,0,0)', draw(c, w, h) { c.fillStyle = '#6f6a62'; c.font = '600 72px Arial'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('7865', w / 2, h / 2); } });
  const nm = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.6), new THREE.MeshStandardMaterial({ map: num, transparent: true, depthWrite: false }));
  nm.position.set(pw / 2 - 1.2, 6.9, pd / 2 + 0.03);
  g.add(nm);
  // Low stucco screen wall, planter and the red monument sign by the sidewalk (photo).
  B(stucco, 9, 1.0, 0.5, 2.5, 0.5, pd / 2 + 4);
  const mono = textTexture({
    width: 256, height: 384, bg: '#d6331f',
    draw(c, w, h) { c.fillStyle = '#f2e6c8'; c.fillRect(24, 60, w - 48, 180); c.fillStyle = '#d6331f'; c.font = 'italic 900 52px Georgia'; c.textAlign = 'center'; c.fillText('Potosino', w / 2, 150); c.font = '600 24px Arial'; c.fillText('Mexican Food', w / 2, 190); },
  });
  B(M('#d6331f', { roughness: 0.6 }), 1.6, 2.4, 0.5, -6.5, 1.2, pd / 2 + 6);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.3), new THREE.MeshStandardMaterial({ map: mono, roughness: 0.6 }));
  face.position.set(-6.5, 1.2, pd / 2 + 6.26);
  g.add(face);
  // Parking beside it (west side), drive-thru lane on the east.
  K.stalls(cx + 8.5, cz - 10, cx + 8.5, cz + 10, -1, { depth: 5.2, fill: 0.5 });
}
