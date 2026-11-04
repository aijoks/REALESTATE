// Real surroundings for site 'orlando-central-park' (2100 Directors Row),
// traced from Google satellite imagery, OSM and the Orange County situs
// address points. Called by buildSuburban with site.bare (no generic parts).
// ctx: { THREE, scene, add, flat, box, W, D, front, site, r, mats }
// Model axes: +z = real west, -x = real north (Directors Row), +x = south.
import { textTexture } from '../textures.js';

export function site_orlando_central_park(ctx) {
  const { THREE, add, flat, box, r, mats } = ctx;
  const { asphalt, white, yellow, grass, kerbMat } = mats;
  const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...o });
  const lot = M('#4a4b4d', { roughness: 0.95 });
  const conc = M('#b9b6ae');
  const yardMat = M('#6d6a63');

  // ---------------- roads ----------------
  // Directors Row (E-W, real) runs along model z at x ~ -94.
  flat(asphalt, -98, -90.5, -520, 520, 0.03);
  for (const dx of [-0.12, 0.12]) flat(yellow, -94.25 + dx - 0.05, -94.25 + dx + 0.05, -520, 520, 0.06);
  // Currency Drive heads north from Directors Row (T at z ~ 57).
  flat(asphalt, -420, -98, 52.5, 61.5, 0.031);
  for (const dz of [-0.12, 0.12]) flat(yellow, -420, -100, 57 + dz - 0.05, 57 + dz + 0.05, 0.06);
  // Chancellor Drive (N-S, real) far to the west.
  flat(asphalt, -520, 520, 359, 372, 0.031);
  // Premier Row, north.
  flat(asphalt, -305, -297, -520, 520, 0.031);

  // Rail lines: spur along the south edge of the site, main line to the west.
  const rail = (x0, x1, z0, z1) => {
    flat(M('#7a6e62'), x0, x1, z0, z1, 0.035);
    const alongZ = Math.abs(z1 - z0) > Math.abs(x1 - x0);
    const c = alongZ ? (x0 + x1) / 2 : (z0 + z1) / 2;
    for (const o of [-0.72, 0.72]) {
      if (alongZ) flat(M('#555a5e', { metalness: 0.6 }), c + o - 0.04, c + o + 0.04, z0, z1, 0.09);
      else flat(M('#555a5e', { metalness: 0.6 }), x0, x1, c + o - 0.04, c + o + 0.04, 0.09);
    }
  };
  rail(64, 68, -520, 205);
  rail(-520, 520, 211, 215);
  rail(-220, -216, -520, 205);

  // ---------------- the site ----------------
  // Paving: west yard, north dock apron / parking, east employee lot.
  flat(lot, -88, 62, 75, 110, 0.04);
  flat(lot, -88, -44, -76, 75, 0.041);
  flat(lot, -88, 62, -136, -75, 0.04);
  flat(conc, -90.5, -86, 92, 104, 0.045); // drive apron (west)
  flat(conc, -90.5, -86, -120, -108, 0.045); // drive apron (east lot)
  // Grass verge along Directors Row with a curved island at the west drive.
  flat(grass, -90.5, -88, -136, 92, 0.042);
  {
    const island = add(new THREE.Mesh(new THREE.CylinderGeometry(7, 7, 0.22, 32, 1, false, Math.PI / 2, Math.PI / 2), grass));
    island.position.set(-88, 0.11, 104);
    const kerb = add(new THREE.Mesh(new THREE.TorusGeometry(7, 0.16, 6, 24, Math.PI / 2), kerbMat));
    kerb.rotation.set(-Math.PI / 2, 0, Math.PI);
    kerb.position.set(-88, 0.12, 104);
    flat(grass, -90.5, -88, 104, 112, 0.042);
  }
  // Parking stripes: employee rows in the fenced north lot and the east lot.
  for (let z = 70; z > -50; z -= 2.8) flat(white, -71, -65, z - 0.06, z + 0.06, 0.07);
  for (let x = -84; x < 56; x += 2.8) {
    for (const z0 of [-80, -92.5, -105, -117.5]) flat(white, x - 0.06, x + 0.06, z0 - 5.6, z0, 0.07);
  }
  // Painted dock lines in the truck court.
  for (let z = 19; z > -52; z -= 4.2) flat(yellow, -62, -45, z - 0.06, z + 0.06, 0.07);

  // Chain-link fence around the employee lot and dock court (as photographed).
  const fenceMat = new THREE.MeshStandardMaterial({ color: '#9aa0a5', roughness: 0.5, metalness: 0.6, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
  const postMat = M('#8b9196', { roughness: 0.4, metalness: 0.7 });
  const fence = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const m = add(new THREE.Mesh(new THREE.PlaneGeometry(len, 2.4), fenceMat));
    m.position.set((x0 + x1) / 2, 1.2, (z0 + z1) / 2);
    m.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
    const n = Math.ceil(len / 3);
    for (let k = 0; k <= n; k++) box(0.1, 2.6, 0.1, x0 + ((x1 - x0) * k) / n, 1.3, z0 + ((z1 - z0) * k) / n, postMat);
    const top = add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, len, 6), postMat));
    top.rotation.z = Math.PI / 2;
    top.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
    top.position.set((x0 + x1) / 2, 2.45, (z0 + z1) / 2);
  };
  fence(-74, 73, -52.6, 73);
  fence(-74, 73, -74, 30);
  fence(-74, 18, -74, -74);
  fence(-74, -74, -55.6, -74);

  // ---------------- vehicles ----------------
  const carCols = ['#e8e8e6', '#8e9aa6', '#7a1d22', '#c9c3b5', '#2c3440', '#b8bcc2', '#5a6b7c'];
  const car = (x, z, ry) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.8, 1.85), M(carCols[Math.floor(r() * carCols.length)], { roughness: 0.3, metalness: 0.5 }));
    body.position.y = 0.65;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 1.7), M('#22272d', { roughness: 0.2, metalness: 0.6 }));
    cab.position.set(-0.2, 1.3, 0);
    g.add(body, cab);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    add(g);
  };
  const trailerMat = M('#e6e7e8', { roughness: 0.6 });
  const trailer = (x, z, ry, len = 16, tractor = false) => {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(len, 3.0, 2.6), trailerMat);
    b.position.y = 2.6;
    g.add(b);
    for (const dx of [-len / 2 + 2, len / 2 - 3]) {
      const w = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 2.4), M('#1d1d1d'));
      w.position.set(dx, 0.5, 0);
      g.add(w);
    }
    if (tractor) {
      const c = new THREE.Mesh(new THREE.BoxGeometry(5, 3.2, 2.5), M(['#b3262a', '#1f4a8a', '#f2f2f2'][Math.floor(r() * 3)], { roughness: 0.4, metalness: 0.4 }));
      c.position.set(len / 2 + 2.4, 1.9, 0);
      g.add(c);
    }
    g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    add(g);
  };
  // Employee cars in the fenced lot (one row by the fence).
  for (let z = 68.6; z > -48; z -= 2.8) if (r() < 0.55 && (z > 26 || z < 14)) car(-68, z, 0);
  // Trailers backed into the north docks, a few more staged in the court.
  for (let z = 17.5; z > -50; z -= 4.2) if (r() < 0.6) trailer(-53.5, z, 0, 15);
  trailer(-82, -64, Math.PI / 2 + 0.05, 16, true);
  // East lot: scattered cars.
  for (let x = -82.6; x < 54; x += 2.8) for (const z of [-82.8, -95.3, -107.8, -120.3]) if (r() < 0.32) car(x, z, Math.PI / 2);

  // Building-products yard (PrimeSource) on the west side: pallets and lumber.
  {
    const wood = M('#b58a5a');
    const wrap = M('#d9dcd5');
    for (let x = 20; x < 52; x += 3.4) {
      for (let z = 82; z < 104; z += 3.2) {
        if (r() < 0.3) continue;
        const h = 0.6 + r() * 1.4;
        box(2.4, h, 1.3, x, h / 2, z, r() < 0.5 ? wood : wrap);
      }
    }
    flat(yardMat, 16, 54, 79, 106, 0.045);
  }

  // Three-headed light poles (the photo shows one inside the fence).
  const poleMat = M('#b9bcbf', { roughness: 0.4, metalness: 0.7 });
  const headMat = new THREE.MeshStandardMaterial({ color: '#dcdedf', roughness: 0.3, metalness: 0.4, emissive: '#fff4d6', emissiveIntensity: 0.15 });
  for (const [x, z] of [[-76, 50], [-76, -10], [-79, 118], [-60, -100], [-10, -100], [40, -100], [20, 95]]) {
    const p = add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 11, 10), poleMat));
    p.position.set(x, 5.5, z);
    p.castShadow = true;
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      const head = add(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.25, 12), headMat));
      head.position.set(x + Math.cos(a) * 1.2, 11.4, z + Math.sin(a) * 1.2);
      const arm = add(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 0.08), poleMat));
      arm.position.set(x + Math.cos(a) * 0.6, 11.3, z + Math.sin(a) * 0.6);
      arm.rotation.y = -a;
    }
  }

  // ---------------- vegetation ----------------
  const leaf = [M('#3f6b2c', { roughness: 1 }), M('#4d7d33', { roughness: 1 }), M('#365e27', { roughness: 1 })];
  const trunk = M('#4b3d30', { roughness: 1 });
  const oak = (x, z, s) => {
    const t = add(new THREE.Mesh(new THREE.CylinderGeometry(0.25 * s, 0.4 * s, 4 * s, 7), trunk));
    t.position.set(x, 2 * s, z);
    for (let k = 0; k < 4; k++) {
      const c = add(new THREE.Mesh(new THREE.IcosahedronGeometry((2.2 + r() * 1.4) * s, 0), leaf[k % 3]));
      c.position.set(x + (r() - 0.5) * 4 * s, (4.6 + r() * 2.6) * s, z + (r() - 0.5) * 4 * s);
      c.castShadow = true;
    }
  };
  // Live oaks along both verges of Directors Row and Currency Drive.
  for (const [x, z] of [[-88.5, -70], [-88.5, -128], [-88.8, 116], [-89, 132]]) oak(x, z, 1.2 + r() * 0.3);
  for (let z = -440; z < 440; z += 26) if (Math.abs(z - 57) > 14 && (z < -60 || z > 20)) oak(-104 - r() * 3, z, 1.0 + r() * 0.4);
  // Tree line along the rail spur behind (south of) the building.
  for (let z = -200; z < 100; z += 9) oak(70 + (r() - 0.5) * 3, z, 0.9 + r() * 0.5);
  // Shrub bed at the office front.
  for (let x = -31; x < -14; x += 2) {
    const b = add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), leaf[1]));
    b.position.set(x, 0.6, 76.3);
    b.scale.y = 0.7;
  }

  // ---------------- neighbouring buildings ----------------
  const shed = (x0, x1, z0, z1, h, c = '#e3ddd0') => box(x1 - x0, h, z1 - z0, (x0 + x1) / 2, h / 2, (z0 + z1) / 2, M(c));
  // A sign plate on the face of a neighbour: n = outward normal ('-x' faces Directors Row etc.).
  const sign = (text, sub, x, y, z, ry, w = 10, bg = '#ffffff', ink = '#1d2a44') => {
    const tex = textTexture({ text, sub, width: 1024, height: 220, bg, ink, font: '800 100px Arial', subFont: '600 44px Arial' });
    const m = add(new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.215), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 })));
    m.position.set(x, y, z);
    m.rotation.y = ry;
  };
  const RY = { '-x': -Math.PI / 2, '+x': Math.PI / 2, '+z': 0, '-z': Math.PI };

  // 2200 Directors Row (west neighbour): older north part, newer south part,
  // small office block toward the road; truck court between it and us.
  shed(-53.4, 11, 142, 207.8, 9, '#cfcdc8');
  shed(4.5, 88.5, 110.5, 207.8, 10, '#ecebe7');
  shed(-69.2, -53.4, 136, 181.5, 6.5, '#d8d4cb');
  sign('2200', 'DIRECTORS ROW', -69.3, 4.4, 158, RY['-x'], 6);
  // Long warehouse across the rail spur (south).
  shed(74, 124, -130, 102.8, 10, '#efeeea');
  // CMS (2002 Directors Row, OSM name "CMS") east of the employee lot.
  shed(-35, 58.5, -328, -138, 10.5, '#eceae4');
  sign('CMS', '2002 DIRECTORS ROW', -35.1, 7, -170, RY['-x'], 9);
  // North of Directors Row: truck/trailer yard, Sunbelt, small office and fuel canopy.
  flat(lot, -207, -112.5, -68, 42, 0.04);
  for (let x = -200; x < -120; x += 10) for (let z = -60; z < 34; z += 3.4) if (r() < 0.5) trailer(x, z, Math.PI / 2 + (r() - 0.5) * 0.1, 14);
  shed(-204.5, -120.5, -105, -86.7, 6.5, '#e7e5df');
  shed(-204.5, -144, -184, -122, 7, '#a9785a');
  sign('SUNBELT', 'RENTALS', -143.9, 4.6, -153, RY['+x'], 9, '#1c5e3a', '#ffffff');
  flat(lot, -212, -105, -200, -110, 0.04);
  shed(-212.5, -149.5, -354, -202, 9, '#efeeea');
  shed(-169.5, -115.5, 110.7, 138, 7, '#e9e8e4');
  {
    const roof = box(15.5, 0.8, 18, -162, 5.2, 82, M('#b8323a'));
    for (const [dx, dz] of [[-6, -7], [6, -7], [-6, 7], [6, 7]]) box(0.4, 4.8, 0.4, -162 + dx, 2.4, 82 + dz, M('#d8d8d8'));
    roof.castShadow = true;
  }
  flat(lot, -215, -108, 64, 150, 0.04);
  // Larger buildings farther out (west of the rail line, north on Premier Row).
  shed(-69.5, 142.5, 224, 336, 10, '#d9cdb2');
  shed(-253.5, -117, 242, 342, 9, '#dcdad4');
  shed(-395, -340, 71, 321, 9, '#3b4250');
  shed(-290, -225, -40, 27, 8, '#ecebe7');
  shed(-290, -228, -102, -62, 8, '#ecebe7');
}
