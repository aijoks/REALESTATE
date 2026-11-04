// Real surroundings for site 'tucson-el-dorado' (traced from satellite imagery / OSM).
// Called at the end of buildSuburban. ctx: { THREE, scene, add, flat, box, W, D, front, site, r, mats }
// Coordinates: campus centred at origin, +x east, +z south (El Dorado Place), metres.
// The generic suburban lot/cars/poles/trees conflict with the real campus, so
// they are removed here (only the ground plane and the far foothills stay).
//   Wilmot Rd (6 lanes + median) x -135..-103, El Dorado Place z 73..85 curving
//   south at x ~98, service drive / shopping-centre lot to the north,
//   Tacotote (1340 N Wilmot) NW pad, El Dorado Health Campus (1400 N Wilmot)
//   to the north, BMO + offices (1181/1161/1141.. N El Dorado Pl) and the
//   New China buffet across El Dorado Pl, Trader Joe's plaza (1101 N Wilmot)
//   and small offices across Wilmot, apartments (1150 N El Dorado Pl) to the SE.
import { textTexture } from '../textures.js';

export function site_tucson_el_dorado(ctx) {
  const { THREE, scene, add, flat, r, mats } = ctx;
  // Drop the generic suburban parts (keep the ground and the foothills).
  for (const c of [...scene.children]) {
    const keep = c.isMesh && ((c.geometry.type === 'PlaneGeometry' && c.geometry.parameters.width >= 1600) || c.material.flatShading);
    if (!keep) scene.remove(c);
  }
  // The campus is ~190 m across: widen the sun's shadow box to cover it.
  scene.parent?.traverse((o) => {
    if (o.isDirectionalLight && o.castShadow && o.shadow.camera.right < 130) {
      Object.assign(o.shadow.camera, { left: -135, right: 135, top: 135, bottom: -135, far: 420 });
      o.shadow.camera.updateProjectionMatrix();
    }
  });

  const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...o });
  const asphalt = mats.asphalt;
  const lot = M('#4a4b4c', { roughness: 0.95 });
  const walk = M('#cfc8bb');
  const gravel = M('#b49d7c', { roughness: 1 });
  const lawnMat = M('#5f913f', { roughness: 1 });
  const { white, yellow, kerbMat } = mats;
  const B = (w, h, d, x, y, z, mat, ry = 0) => {
    const m = add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat));
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.castShadow = m.receiveShadow = true;
    return m;
  };
  const rect = (mat, x0, x1, z0, z1, y = 0.03) => flat(mat, x0, x1, z0, z1, y);
  const rotRect = (mat, cx, cz, w, d, ry, y = 0.03) => {
    const m = add(new THREE.Mesh(new THREE.PlaneGeometry(w, d), mat));
    m.rotation.set(-Math.PI / 2, 0, ry);
    m.position.set(cx, y, cz);
    m.receiveShadow = true;
    return m;
  };
  const sign = (text, { w = 8, h = 1.4, bg = '#ffffff', ink = '#222222', font = 'bold 120px "Helvetica Neue", Arial, sans-serif', px = 1024 } = {}) =>
    new THREE.MeshStandardMaterial({ map: textTexture({ text, width: px, height: Math.round((px * h) / w), bg, ink, font }), roughness: 0.6 });
  // Sign plane on a wall facing direction ry (0 = +z).
  const wallSign = (mat, w, h, x, y, z, ry) => {
    const m = add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat));
    m.position.set(x + Math.sin(ry) * 0.06, y, z + Math.cos(ry) * 0.06);
    m.rotation.y = ry;
    return m;
  };

  // ---------- ground cover ----------
  rect(gravel, -101, 112, -70, 90, 0.012);
  rect(lawnMat, -101, -34, 70, 74, 0.02);
  rect(lawnMat, -18, 60, 70, 74, 0.02);
  rect(lawnMat, 52, 72, -60, 30, 0.02);
  rect(lawnMat, -77, -36, 39, 43, 0.02);

  // ---------- roads ----------
  // Wilmot Rd: two 3-lane carriageways and a planted median.
  rect(asphalt, -135, -103.5, -500, 500, 0.04);
  rect(walk, -103.5, -100.5, -500, 500, 0.05);
  rect(walk, -138, -135, -500, 500, 0.05);
  B(3, 0.2, 1000, -119.25, 0.1, 0, kerbMat);
  rect(gravel, -120.5, -118, -500, 500, 0.21);
  for (const x of [-129.8, -125, -113.5, -108.7]) for (let z = -495; z < 500; z += 9) rect(white, x - 0.07, x + 0.07, z, z + 3, 0.06);
  for (const x of [-134.5, -104]) rect(white, x - 0.07, x + 0.07, -500, 500, 0.06);
  // El Dorado Place: east from Wilmot, curving south around the campus.
  const R = 48, acx = 50, acz = 127;
  rect(asphalt, -103.5, acx, 73, 85, 0.04);
  rect(walk, -100.5, acx, 71.2, 73, 0.05);
  rect(walk, -100.5, acx, 85, 87.5, 0.05);
  {
    const ring = add(new THREE.Mesh(new THREE.RingGeometry(R - 6, R + 6, 32, 1, 0, Math.PI / 2), asphalt));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(acx, 0.04, acz);
    // RingGeometry quadrant 0..90deg is +x/-z after the rotation: the NE arc.
    ring.receiveShadow = true;
    for (const [r0, r1] of [[R + 6, R + 8.5], [R - 8.5, R - 6]]) {
      const s = add(new THREE.Mesh(new THREE.RingGeometry(r0, r1, 32, 1, 0, Math.PI / 2), walk));
      s.rotation.x = -Math.PI / 2;
      s.position.set(acx, 0.05, acz);
    }
    const c = add(new THREE.Mesh(new THREE.RingGeometry(R - 0.08, R + 0.08, 32, 1, 0, Math.PI / 2), yellow));
    c.rotation.x = -Math.PI / 2;
    c.position.set(acx, 0.06, acz);
  }
  rect(asphalt, acx + R - 6, acx + R + 6, acz, 400, 0.04);
  rect(walk, acx + R + 6, acx + R + 8.5, acz, 400, 0.05);
  rect(walk, acx + R - 8.5, acx + R - 6, acz, 400, 0.05);
  rect(yellow, -103.5, acx, 78.92, 79.08, 0.06);
  rect(yellow, acx + R - 0.08, acx + R + 0.08, acz, 400, 0.06);
  // Service drive along the north edge of the campus.
  rect(asphalt, -103.5, 112, -81, -70, 0.04);

  // ---------- campus paving and parking ----------
  rect(lot, -101, 55, -70, -47, 0.035); // north lot (shared with Tacotote)
  rect(lot, -101, -30, -47, -24, 0.035); // Tacotote lot
  rect(lot, -101, -77, -24, 73, 0.035); // west lane along Wilmot
  rect(lot, -77, -34, 5.6, 16, 0.035); // lane in front of Building D
  rect(lot, -34, 55, -16, 34, 0.035); // central court
  rect(lot, 38, 50, -47, -16, 0.035); // east drive
  rect(lot, -34, -22, 34, 40, 0.035);
  // Bays: [x0, z, count, dir] rows of 2.7 m stalls, stripes and cars.
  const carCols = ['#e8e8e6', '#8e9aa6', '#7a1d22', '#c9c3b5', '#2c3440', '#b8bcc2', '#1f2a3a', '#d8d4cc'];
  const carMats = carCols.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.3, metalness: 0.5 }));
  const cabMat = new THREE.MeshStandardMaterial({ color: '#22272d', roughness: 0.2, metalness: 0.6 });
  const bodyGeo = new THREE.BoxGeometry(4.5, 0.8, 1.85);
  const cabGeo = new THREE.BoxGeometry(2.3, 0.6, 1.7);
  const car = (x, z, ry) => {
    const body = add(new THREE.Mesh(bodyGeo, carMats[Math.floor(r() * carMats.length)]));
    body.position.set(x, 0.65, z);
    body.rotation.y = ry;
    body.castShadow = true;
    const cab = add(new THREE.Mesh(cabGeo, cabMat));
    cab.position.set(x - Math.cos(ry) * 0.2, 1.3, z + Math.sin(ry) * 0.2);
    cab.rotation.y = ry;
  };
  // Row of stalls along x (cars nose north/south), stall depth 5.4.
  const rowX = (x0, x1, z0, p = 0.6) => {
    for (let x = x0; x <= x1 + 0.01; x += 2.7) rect(white, x - 0.06, x + 0.06, z0, z0 + 5.4, 0.06);
    for (let x = x0; x + 2.7 <= x1 + 0.01; x += 2.7) if (r() < p) car(x + 1.35, z0 + 2.7, Math.PI / 2);
  };
  const rowZ = (z0, z1, x0, p = 0.6) => {
    for (let z = z0; z <= z1 + 0.01; z += 2.7) rect(white, x0, x0 + 5.4, z - 0.06, z + 0.06, 0.06);
    for (let z = z0; z + 2.7 <= z1 + 0.01; z += 2.7) if (r() < p) car(x0 + 2.7, z + 1.35, 0);
  };
  rowX(-28, 36, -69.5, 0.75); // north lot, under the carports
  rowX(-28, 36, -52.4, 0.5);
  rowX(-66, -36, -52.4, 0.5);
  rowX(-66, -36, -40, 0.4);
  rowX(-75, -37, 7.0, 0.35); // in front of Building D (photo)
  rowX(-30, 52, -12, 0.45); // central court
  rowX(-30, 52, 8.5, 0.4);
  rowX(-30, 52, 14, 0.4);
  rowX(-12, 24, 28.5, 0.35);
  rowZ(-22, 70, -100.5, 0.55); // west lane
  rowZ(-44, -20, 44.6, 0.4); // east drive
  // Carports (OSM shade structures): steel posts and light roof panels.
  const cpRoof = M('#dfe6ea', { metalness: 0.3, roughness: 0.5 });
  const cpPost = M('#8b9196', { metalness: 0.6, roughness: 0.4 });
  const carport = (x0, x1, z0, z1) => {
    B(x1 - x0, 0.15, z1 - z0, (x0 + x1) / 2, 2.75, (z0 + z1) / 2, cpRoof);
    const along = x1 - x0 > z1 - z0;
    const L = along ? x1 - x0 : z1 - z0;
    for (let k = 0; k <= L; k += 5.4) {
      const px = along ? x0 + k : (x0 + x1) / 2;
      const pz = along ? (z0 + z1) / 2 : z0 + k;
      B(0.2, 2.7, 0.2, px, 1.35, pz, cpPost);
    }
  };
  carport(-9, 7, -69, -64);
  carport(20.5, 35.5, -69, -64);
  carport(-6.5, 8.5, 13, 18);
  carport(27.5, 42.5, 13, 18);
  carport(-98, -91.5, 13, 29);
  carport(-97.5, -91.5, -19.5, 1.5);

  // ---------- trees ----------
  const trunk = M('#6b5a48', { roughness: 1 });
  const leafM = [M('#4f6b33', { roughness: 1 }), M('#647a3f', { roughness: 1 })];
  const crown = new THREE.IcosahedronGeometry(1, 1);
  const tree = (x, z, s = 1) => {
    B(0.4 * s, 4 * s, 0.4 * s, x, 2 * s, z, trunk);
    for (let k = 0; k < 3; k++) {
      const c = add(new THREE.Mesh(crown, leafM[k % 2]));
      c.scale.setScalar((2 + r()) * s);
      c.position.set(x + (r() - 0.5) * 3 * s, (4.5 + r() * 2) * s, z + (r() - 0.5) * 3 * s);
      c.castShadow = true;
    }
  };
  const palmTrunk = M('#8a7563', { roughness: 1 });
  const frond = M('#5c7a3a', { roughness: 1 });
  const frondGeo = new THREE.ConeGeometry(0.5, 4.2, 4);
  frondGeo.translate(0, 2.1, 0);
  const palm = (x, z, h = 11) => {
    const t = add(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, h, 7), palmTrunk));
    t.position.set(x, h / 2, z);
    t.castShadow = true;
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2;
      const f = add(new THREE.Mesh(frondGeo, frond));
      f.position.set(x, h, z);
      f.rotation.set(Math.sin(a) * 1.9, 0, -Math.cos(a) * 1.9);
      f.scale.set(1, 1, 0.35);
      f.castShadow = true;
    }
  };
  for (let x = -96; x < 50; x += 11) palm(x + 4, 71.5, 10 + r() * 3); // El Dorado Pl frontage (satellite)
  for (let x = -94; x < 50; x += 14) palm(x, 86.5, 9 + r() * 3);
  for (let a = 0.15; a < 1.5; a += 0.3) palm(acx + Math.sin(a) * (R - 7.5), acz - Math.cos(a) * (R - 7.5), 10 + r() * 2);
  for (let z = -60; z < 70; z += 16) tree(-102, z, 1.1); // Wilmot verge
  for (let z = -200; z < 260; z += 22) tree(-119.25, z + r() * 6, 0.8); // median
  // Italian cypresses along the NE lot (satellite: dark columns).
  const cyp = M('#2f4a2a', { roughness: 1 });
  const cypGeo = new THREE.CylinderGeometry(0.2, 1.0, 9, 8);
  cypGeo.translate(0, 4.5, 0);
  for (let t = 0; t <= 1; t += 1 / 16) {
    const c = add(new THREE.Mesh(cypGeo, cyp));
    c.position.set(55.6 + t * 43, 0, 22.7 - t * 16.4);
    c.castShadow = true;
  }
  for (let i = 0; i < 4; i++) for (let j = 0; j < 6; j++) {
    const c = add(new THREE.Mesh(cypGeo, cyp));
    c.position.set(72 + j * 6, 0, 34 + i * 10);
    c.castShadow = true;
  }
  rotRect(lot, 80, 2, 46, 14, Math.atan2(16.4, 43), 0.035); // NE neighbour's lot
  rect(lawnMat, 64, 108, 28, 70, 0.02);

  // ---------- neighbouring buildings ----------
  const tan = M('#d9c9ad');
  const cream = M('#ebe3d3');
  const whiteBox = M('#e9e9e6');
  const roofTile = M('#b8573c');
  const hip = (w, d, h, x, y, z) => {
    const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
    g.rotateY(Math.PI / 4);
    const m = add(new THREE.Mesh(g, roofTile));
    m.scale.set(w + 1, h, d + 1);
    m.position.set(x, y + h / 2, z);
    m.castShadow = true;
  };
  // Tacotote (1340 N Wilmot), red-tile restaurant on the NW pad.
  B(23, 5.2, 24, -80.5, 2.6, -56, cream);
  hip(23, 24, 3, -80.5, 5.2, -56);
  wallSign(sign('TACOTOTE', { w: 6, h: 1.1, bg: '#1e3f2a', ink: '#f3d27a', font: 'bold 150px Georgia, serif' }), 6, 1.1, -92.1, 3.6, -56, -Math.PI / 2);
  wallSign(sign('TACOTOTE', { w: 6, h: 1.1, bg: '#1e3f2a', ink: '#f3d27a', font: 'bold 150px Georgia, serif' }), 6, 1.1, -80.5, 3.6, -43.9, 0);
  // El Dorado Health Campus (1400 N Wilmot) north of the service drive.
  B(118, 7.5, 64, 51, 3.75, -118, whiteBox);
  B(20.6, 6, 32, 2.3, 3, -104, cream);
  B(60, 2.5, 20, 60, 8.75, -125, M('#d3d6d8'));
  wallSign(sign('EL DORADO HEALTH CAMPUS', { w: 16, h: 1.2, bg: '#e9e9e6', ink: '#2a5d7c', font: 'bold 90px "Helvetica Neue", Arial, sans-serif' }), 16, 1.2, 40, 6, -85.9, 0);
  rect(lot, -101, -8, -160, -81, 0.035);
  for (let x = -96; x < -12; x += 24) rect(gravel, x, x + 3, -150, -90, 0.05);
  for (const z of [-148, -136, -118, -104, -92]) rowX(-93, -15, z, 0.45);
  // Across El Dorado Place (south): BMO, offices, buffet, medical offices.
  B(45, 6, 30, -61, 3, 125, M('#e4e2dc'));
  wallSign(sign('BMO', { w: 4, h: 1.6, bg: '#0079c1', ink: '#ffffff', font: 'bold 170px "Helvetica Neue", Arial, sans-serif', px: 512 }), 4, 1.6, -61, 4.4, 140.01, 0);
  wallSign(sign('BMO', { w: 4, h: 1.6, bg: '#0079c1', ink: '#ffffff', font: 'bold 170px "Helvetica Neue", Arial, sans-serif', px: 512 }), 4, 1.6, -61, 4.4, 110, Math.PI);
  B(32, 4.8, 21, -4, 2.4, 125, tan);
  B(32, 4.8, 21, 27, 2.4, 124, tan);
  wallSign(sign('1181', { w: 2, h: 0.7, bg: '#d9c9ad', ink: '#3a3330', px: 256, font: 'bold 120px Georgia, serif' }), 2, 0.7, -4, 3.4, 114.5, Math.PI);
  wallSign(sign('1161', { w: 2, h: 0.7, bg: '#d9c9ad', ink: '#3a3330', px: 256, font: 'bold 120px Georgia, serif' }), 2, 0.7, 27, 3.4, 113.5, Math.PI);
  for (const [z0, z1] of [[137, 168], [172, 204], [208, 236]]) B(22, 5, z1 - z0, 56.6, 2.5, (z0 + z1) / 2, tan);
  B(38, 6, 33, -59, 3, 192.5, M('#f0efe9'));
  wallSign(sign('NEW CHINA SUSHI GRILL BUFFET', { w: 14, h: 1.3, bg: '#9e1b1b', ink: '#ffd76a', font: 'bold 84px "Helvetica Neue", Arial, sans-serif' }), 14, 1.3, -59, 4.5, 176, Math.PI);
  rect(lot, -100.5, 92, 90, 240, 0.035);
  for (const x of [-5, 7]) carport(x - 6, x + 6, 157, 236);
  for (const z of [100, 150, 160, 210]) rowX(-36, 40, z, 0.4);
  for (const [x, z] of [[-90, 100], [-20, 150], [36, 100], [-90, 160]]) tree(x, z, 1);
  // Across Wilmot (west): Trader Joe's plaza (1101 N Wilmot) and small offices.
  rect(lot, -182, -138, 100, 260, 0.035);
  B(32, 6.5, 145, -198, 3.25, 177.5, M('#e8dcc8'));
  B(33, 1.2, 146, -198, 7.1, 177.5, roofTile);
  const shops = [
    ["Trader Joe's", 151, '#ffffff', '#c8102e', 'bold italic 120px Georgia, serif'],
    ['Ma Thai Massage', 132, '#ffffff', '#5b2a6e'],
    ["Bubbe's Fine Bagels", 172, '#ffffff', '#1d4f91'],
    ['Sachiko Sushi', 196, '#ffffff', '#222222'],
    ['Frozen Delight', 207, '#ffffff', '#d6336c'],
    ['Great Clips', 218, '#ffffff', '#0063a9'],
  ];
  for (const [t, z, bg, ink, font] of shops) {
    wallSign(sign(t, { w: 8, h: 1.2, bg, ink, font: font ?? 'bold 96px "Helvetica Neue", Arial, sans-serif' }), t === "Trader Joe's" ? 10 : 8, t === "Trader Joe's" ? 1.5 : 1.2, -181.9, 4.9, z, Math.PI / 2);
  }
  B(14, 4.5, 19, -154, 2.25, 58, tan);
  B(20, 4.5, 27, -155, 2.25, 31, cream);
  B(18, 4.5, 20, -154, 2.25, 4, tan);
  B(40, 5, 22, -158, 2.5, -90, cream);
  B(30, 5.5, 26, -210, 2.75, 42, M('#efe6d6'));
  wallSign(sign("Tucson Woman's Club", { w: 8, h: 1, bg: '#efe6d6', ink: '#3b2f5c', font: 'bold 92px Georgia, serif' }), 8, 1, -194.9, 3.6, 42, Math.PI / 2);
  // Apartments (1150 N El Dorado Pl) and El Dorado Plaza offices to the east.
  for (const [x, z, ry] of [[118, 92, 0], [150, 63, 0.2], [146, 135, 0], [168, 107, 0], [176, 153, 0], [183, 57, 0.2], [213, 137, 0], [123, 153, 0]]) {
    B(24, 7, 12, x, 3.5, z, M('#d8c4a4'), ry);
  }
  B(34, 5, 22, 158, 2.5, -17, cream);
  B(34, 5, 22, 190, 2.5, 5, cream);
  B(26, 7, 40, 135, 3.5, -60, M('#e3dccd'));

  // ---------- light poles ----------
  const pole = M('#6f7377', { metalness: 0.5, roughness: 0.5 });
  const head = M('#2d2f31');
  for (const [x, z] of [[-60, -58], [20, -58], [-76, 9], [-14, 1.5], [26, 1.5], [-90, 30], [-90, -30], [-60, 71.2], [-8, 71.2], [40, 71.2]]) {
    B(0.18, 8, 0.18, x, 4, z, pole);
    B(1.2, 0.25, 0.5, x + 0.5, 8, z, head);
  }
  for (let z = -200; z < 260; z += 40) { B(0.22, 10, 0.22, -119.25, 5, z, pole); B(4, 0.2, 0.3, -119.25, 10, z, pole); }
}
