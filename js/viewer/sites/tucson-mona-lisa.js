// Real surroundings for site 'tucson-mona-lisa' (traced from satellite imagery / OSM).
// Called at the end of buildSuburban. ctx: { THREE, scene, add, flat, box, W, D, front, site, r, mats }
// Coordinates: building centred at origin, +x east (Mona Lisa Rd), +z south (Ina Rd), metres.
// Mona Lisa Plaza sits at the NW corner of the signalised Ina / Mona Lisa
// intersection: Ina Rd (5 lanes) z 51..78, Mona Lisa Rd x ~50..66 (curving
// slightly east going north). Parking wraps the building (south rows along
// Ina, a west carport row, north row, east strip); a 2-storey apartment
// complex surrounds it to the north-west; offices/apartments east of Mona
// Lisa; desert lots, houses and a church south of Ina; Foothills Mall
// (AMC, Barnes & Noble, Applebee's, banks) ~450 m east along Ina.
import { textTexture } from '../textures.js';

export function site_tucson_mona_lisa(ctx) {
  const { THREE, scene, add, flat, r, mats } = ctx;
  // Drop the generic suburban parts (keep the ground and the far foothills).
  for (const c of [...scene.children]) {
    const keep = c.isMesh && ((c.geometry.type === 'PlaneGeometry' && c.geometry.parameters.width >= 1600) || c.material.flatShading);
    if (!keep) scene.remove(c);
  }
  scene.parent?.traverse((o) => {
    if (o.isDirectionalLight && o.castShadow && o.shadow.camera.right < 100) {
      Object.assign(o.shadow.camera, { left: -100, right: 100, top: 100, bottom: -100, far: 400 });
      o.shadow.camera.updateProjectionMatrix();
    }
  });

  const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...o });
  const { asphalt, white, yellow, kerbMat } = mats;
  const lot = M('#55565a', { roughness: 0.95 });
  const walk = M('#cfc8bb');
  const gravel = M('#b8a283', { roughness: 1 });
  const lawn = M('#5f913f', { roughness: 1 });
  const B = (w, h, d, x, y, z, mat, ry = 0) => {
    const m = add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat));
    m.position.set(x, y, z);
    m.rotation.y = ry;
    m.castShadow = m.receiveShadow = true;
    return m;
  };
  const rect = (mat, x0, x1, z0, z1, y = 0.03) => flat(mat, x0, x1, z0, z1, y);
  // Strip from (x0,z0) to (x1,z1), width w.
  const strip = (mat, x0, z0, x1, z1, w, y = 0.04) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const m = add(new THREE.Mesh(new THREE.PlaneGeometry(w, len), mat));
    m.rotation.set(-Math.PI / 2, 0, Math.atan2(x1 - x0, z1 - z0));
    m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
    m.receiveShadow = true;
    return m;
  };
  const sign = (text, { w = 8, h = 1.4, bg = '#ffffff', ink = '#222222', font = 'bold 110px "Helvetica Neue", Arial, sans-serif', px = 1024 } = {}) =>
    new THREE.MeshStandardMaterial({ map: textTexture({ text, width: px, height: Math.round((px * h) / w), bg, ink, font }), roughness: 0.6 });
  const wallSign = (mat, w, h, x, y, z, ry) => {
    const m = add(new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat));
    m.position.set(x + Math.sin(ry) * 0.06, y, z + Math.cos(ry) * 0.06);
    m.rotation.y = ry;
    return m;
  };

  // ---------- roads ----------
  rect(asphalt, -800, 800, 51, 78, 0.04); // Ina Rd
  rect(walk, -800, 800, 49, 51, 0.05);
  rect(walk, -800, 800, 78, 80, 0.05);
  for (const dz of [-0.12, 0.12]) rect(yellow, -800, 40, 64.5 + dz - 0.05, 64.5 + dz + 0.05, 0.06);
  for (const dz of [-0.12, 0.12]) rect(yellow, 68, 800, 64.5 + dz - 0.05, 64.5 + dz + 0.05, 0.06);
  for (const z of [55, 59.5, 69.5, 74]) for (let x = -795; x < 795; x += 9) if (x < 38 || x > 68) rect(white, x, x + 3, z - 0.07, z + 0.07, 0.06);
  // Mona Lisa Rd north of Ina (bends east) and south of Ina.
  strip(asphalt, 58, 51, 70, -170, 16);
  strip(asphalt, 70, -170, 76, -800, 16);
  strip(walk, 49, 49, 61, -170, 2);
  strip(walk, 67, 49, 79, -170, 2);
  strip(yellow, 58, 51, 70, -170, 0.25, 0.05);
  rect(asphalt, 42, 54, 78, 800, 0.04);
  rect(yellow, 47.9, 48.1, 80, 800, 0.05);
  rect(asphalt, 40, 68, 49, 80, 0.045); // intersection
  for (let x = 41; x < 67; x += 1.2) { rect(white, x, x + 0.6, 45.6, 48.6, 0.06); rect(white, x, x + 0.6, 80.5, 83.5, 0.06); }
  // Signal mast arms at the corners.
  const pole = M('#6f7377', { metalness: 0.5, roughness: 0.5 });
  const sigMat = M('#c7a400');
  for (const [x, z, ax, az] of [[39, 49, 1, 0], [69, 80, -1, 0], [69, 49, 0, 1], [39, 80, 0, -1]]) {
    B(0.3, 7, 0.3, x, 3.5, z, pole);
    const L = 12;
    B(ax ? L : 0.2, 0.2, az ? L : 0.2, x + (ax * L) / 2, 6.8, z + (az * L) / 2, pole);
    for (const k of [0.5, 0.8]) B(0.4, 1.0, 0.4, x + ax * L * k, 6.2, z + az * L * k, sigMat);
  }

  // ---------- site: parking around the building ----------
  rect(lot, -47, 44, -37, 43.5, 0.035);
  rect(lawn, -28.5, 28.5, 22, 24.2, 0.04); // planting strip in front (photo)
  rect(walk, -28.5, 28.5, 22.6, 24.4, 0.045);
  rect(gravel, -60, 49, 43.5, 49, 0.03); // desert landscaping along Ina
  rect(gravel, 28.5, 44, -40, 43.5, 0.031);
  rect(lot, 36, 50, -36, -26, 0.036); // drive from Mona Lisa Rd
  rect(lot, -42, -34, 43.5, 51, 0.036); // drive from Ina Rd
  rect(lot, 6, 14, 43.5, 51, 0.036);
  // Corner lawn with a curved kerb at the SE corner of the building (photo).
  {
    const g = add(new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 0.18, 24, 1, false, Math.PI / 2, Math.PI / 2), lawn));
    g.position.set(28.5, 0.09, 22);
    const k = add(new THREE.Mesh(new THREE.TorusGeometry(9, 0.18, 6, 20, Math.PI / 2), kerbMat));
    k.rotation.x = -Math.PI / 2;
    k.rotation.z = -Math.PI / 2;
    k.position.set(28.5, 0.12, 22);
  }
  const carCols = ['#e8e8e6', '#8e9aa6', '#7a1d22', '#c9c3b5', '#2c3440', '#b8bcc2', '#1f2a3a'];
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
  const rowX = (x0, x1, z0, p = 0.5) => {
    for (let x = x0; x <= x1 + 0.01; x += 2.7) rect(white, x - 0.06, x + 0.06, z0, z0 + 5.4, 0.06);
    for (let x = x0; x + 2.7 <= x1 + 0.01; x += 2.7) if (r() < p) car(x + 1.35, z0 + 2.7, Math.PI / 2);
  };
  const rowZ = (z0, z1, x0, p = 0.5) => {
    for (let z = z0; z <= z1 + 0.01; z += 2.7) rect(white, x0, x0 + 5.4, z - 0.06, z + 0.06, 0.06);
    for (let z = z0; z + 2.7 <= z1 + 0.01; z += 2.7) if (r() < p) car(x0 + 2.7, z + 1.35, 0);
  };
  rowX(-27, 20, 24.6, 0.35); // nose-in along the front (sat: cars at the wall)
  rowX(-40, 22, 37.4, 0.45);
  rowX(-38, 30, -37, 0.7); // north row
  rowX(-27, 3, -22, 0.4); // the notch behind the west wing
  rowZ(-30, 20, -47, 0.6); // west carport row
  rowZ(-27, 18, -34.6, 0.4);
  rowZ(-24, 14, 32.5, 0.45); // east strip
  // West carport (satellite: blue-grey roofs).
  const cpRoof = M('#8ea1b0', { metalness: 0.3, roughness: 0.5 });
  B(5.6, 0.15, 48, -44.2, 2.75, -4, cpRoof);
  for (let z = -27; z <= 20; z += 5.4) B(0.2, 2.7, 0.2, -41.6, 1.35, z, pole);
  // Lot lights.
  for (const [x, z] of [[-44, 34], [16, 45], [-38, -30], [10, -31], [41, -28]]) {
    B(0.18, 8, 0.18, x, 4, z, pole);
    B(1.2, 0.25, 0.5, x + 0.5, 8, z, M('#2d2f31'));
  }
  // Monument sign on the Ina frontage near the corner: plaza name + tenants.
  {
    const tex = textTexture({
      width: 512, height: 640, bg: '#ece8e0',
      draw(c, w, h) {
        c.fillStyle = '#c8102e'; c.fillRect(0, 0, w, 26);
        c.fillStyle = '#3a3330'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.font = '600 54px Georgia, serif'; c.fillText('MONA LISA PLAZA', w / 2, 80, w - 30);
        c.font = '600 46px Georgia, serif'; c.fillText('7225', w / 2, 140);
        const rows = [['Gentle Dental', '#d23c5a'], ['Morgan, Cohen & Bach', '#1f3a5f'], ['BAYADA Home Health Care', '#00508f'], ['Soreo Pathways', '#2f6f73'], ['Arizona DES', '#1b365d'], ['HomeWell Care Services', '#5b2a86'], ['Spencer Construction', '#7a4a1e']];
        rows.forEach(([t, col], i) => {
          const y = 196 + i * 62;
          c.fillStyle = '#ffffff'; c.fillRect(24, y, w - 48, 52);
          c.fillStyle = col; c.font = 'bold 32px "Helvetica Neue", Arial, sans-serif'; c.fillText(t, w / 2, y + 27, w - 60);
        });
      },
    });
    const stuc = M('#ece8e0');
    const ry = Math.PI / 4;
    const x = 34, z = 44;
    B(3.0, 3.9, 0.6, x, 1.95, z, stuc, ry);
    B(3.3, 0.25, 0.8, x, 4.0, z, M('#c8102e'), ry);
    const face = add(new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.25), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 })));
    face.position.set(x + Math.sin(ry) * 0.31, 2.0, z + Math.cos(ry) * 0.31);
    face.rotation.y = ry;
  }

  // ---------- plants ----------
  const trunk = M('#6b5a48', { roughness: 1 });
  const leafM = [M('#6f8a45', { roughness: 1 }), M('#8fa45a', { roughness: 1 })];
  const crown = new THREE.IcosahedronGeometry(1, 1);
  const tree = (x, z, s = 1) => {
    B(0.35 * s, 3 * s, 0.35 * s, x, 1.5 * s, z, trunk);
    for (let k = 0; k < 3; k++) {
      const c = add(new THREE.Mesh(crown, leafM[k % 2]));
      c.scale.set((1.8 + r()) * s, (1.2 + r() * 0.6) * s, (1.8 + r()) * s);
      c.position.set(x + (r() - 0.5) * 2.5 * s, (3.6 + r()) * s, z + (r() - 0.5) * 2.5 * s);
      c.castShadow = true;
    }
  };
  for (let x = -56; x < 38; x += 12) tree(x + r() * 4, 46.5, 0.9);
  for (const [x, z] of [[-30, -28], [6, -28], [30, -30], [-32, 0], [40, 12], [42, -12], [-52, 30], [-24, -14]]) tree(x, z, 1);
  const shrubM = M('#7c8c56', { roughness: 1 });
  for (let k = 0; k < 160; k++) { // creosote scrub on the desert lots south of Ina
    const x = (r() - 0.5) * 420, z = 86 + r() * 200;
    if (Math.abs(x - 48) < 10) continue;
    const b = add(new THREE.Mesh(crown, shrubM));
    b.scale.set(1 + r(), 0.6 + r() * 0.5, 1 + r());
    b.position.set(x, 0.4, z);
  }
  const cactus = M('#4f6b3a', { roughness: 0.9 });
  for (const [x, z, h] of [[90, 110, 7], [-70, 120, 6.5], [150, 95, 8], [20, 170, 7.5]]) {
    B(0.7, h, 0.7, x, h / 2, z, cactus);
    B(0.5, h * 0.35, 0.5, x + 0.8, h * 0.6, z, cactus);
    B(0.5, h * 0.3, 0.5, x - 0.8, h * 0.55, z, cactus);
  }

  // ---------- neighbours ----------
  const apt = M('#d4bf9e');
  const aptRoof = M('#e7e5df');
  const aptCarport = M('#c6b28f');
  const aptBox = (x0, x1, z0, z1, h = 7) => {
    B(x1 - x0, h, z1 - z0, (x0 + x1) / 2, h / 2, (z0 + z1) / 2, apt);
    B(x1 - x0 - 0.6, 0.2, z1 - z0 - 0.6, (x0 + x1) / 2, h + 0.1, (z0 + z1) / 2, aptRoof);
  };
  // Two-storey apartments north-west of the plaza (satellite).
  for (const b of [
    [-93, -75, -28, -7], [-93, -78, -6, 6], [-88, -73, 7, 23], [-70, -35, -59, -47], [-27, -12, -69, -55],
    [-10, 4, -64, -50], [12, 22, -72, -60], [22, 33, -58, -44], [-37, -2, -109, -96], [-95, -60, -86, -76],
    [-90, -40, -123, -108], [18, 30, -158, -138], [26, 41, -132, -112], [-155, -135, -100, -80], [-150, -130, -75, -58],
    [-140, -98, 8, 24], [-150, -112, -16, -2], [-67, -27, -161, -146],
  ]) aptBox(...b);
  for (const [x0, x1, z0, z1] of [[-75, -55, -100, -96], [-30, -5, -76, -73], [10, 30, -88, -85], [-100, -94, -60, -38]]) B(x1 - x0, 0.2, z1 - z0, (x0 + x1) / 2, 2.6, (z0 + z1) / 2, aptCarport);
  rect(lot, -120, 45, -125, -40, 0.03); // the complex's drives (approx.)
  strip(lot, -54, 49, -54, -40, 7, 0.036); // entry drive off Ina Rd
  rect(M('#3f8fbf'), -116, -110, -48, -40, 0.05); // pool
  rect(M('#4c7a5a'), -158, -133, -62, -32, 0.05); // tennis court
  // East of Mona Lisa Rd: two-storey offices/apartments and a red-tile complex.
  for (const b of [[113, 133, -63, -15], [147, 194, -57, -38], [205, 226, -60, -12], [142, 189, -14, 8]]) aptBox(...b, 7.5);
  rect(lot, 86, 235, -75, 30, 0.03);
  const tile = M('#b8573c');
  for (const [x0, x1, z0, z1] of [[108, 140, -161, -140], [150, 212, -160, -140], [108, 160, -130, -108], [170, 212, -130, -108]]) {
    B(x1 - x0, 6.5, z1 - z0, (x0 + x1) / 2, 3.25, (z0 + z1) / 2, M('#e2d4bc'));
    B(x1 - x0 + 0.8, 1.6, z1 - z0 + 0.8, (x0 + x1) / 2, 7.3, (z0 + z1) / 2, tile);
  }
  // South of Ina: a house on the SW corner lot, the church and its lot (SE).
  B(20, 4.5, 15, 1, 2.25, 124, M('#efe8dc'));
  B(14, 4, 10, -60, 2, 120, M('#e2d6c0'));
  rect(lot, 58, 164, 131, 226, 0.03);
  {
    const ch = add(new THREE.Mesh(new THREE.CylinderGeometry(24, 24, 7, 8), M('#ece4d6')));
    ch.position.set(192, 3.5, 170);
    ch.castShadow = true;
    const roof = add(new THREE.Mesh(new THREE.ConeGeometry(26, 9, 8), tile));
    roof.position.set(192, 11.5, 170);
    roof.castShadow = true;
  }
  // Foothills Mall area, one block east along Ina (OSM names).
  const mallMat = M('#ddd2c0');
  B(260, 12, 260, 640, 6, -300, mallMat);
  B(60, 18, 50, 539, 9, -389, M('#c9b9a0'));
  wallSign(sign('FOOTHILLS MALL', { w: 30, h: 3.2, bg: '#ddd2c0', ink: '#7a3b1e', font: 'bold 120px Georgia, serif' }), 30, 3.2, 510, 8.5, -200, -Math.PI / 2);
  wallSign(sign('AMC FOOTHILLS 15', { w: 16, h: 2.4, bg: '#c9b9a0', ink: '#c8102e' }), 16, 2.4, 509, 13, -389, -Math.PI / 2);
  B(40, 9, 34, 640, 4.5, -150, M('#d8c8ae'));
  wallSign(sign('BARNES & NOBLE', { w: 14, h: 2, bg: '#d8c8ae', ink: '#1e4d2b', font: 'bold 110px Georgia, serif' }), 14, 2, 640, 6.5, -132.9, 0);
  for (const [name, x, z, w, d, ink] of [
    ["Applebee's", 552, 102, 26, 20, '#b7142a'], ['Arizona Central Credit Union', 668, 102, 24, 18, '#00599c'],
    ['Bank of America', 863, 104, 22, 18, '#012169'], ['AT&T', 587, 100, 16, 14, '#009fdb'], ['Whiskey Roads', 553, -166, 22, 18, '#5a3a1a'],
  ]) {
    B(w, 6, d, x, 3, z, M('#e6ddcf'));
    wallSign(sign(name, { w: 8, h: 1.2, bg: '#e6ddcf', ink }), Math.min(w - 2, 10), 1.5, x - w / 2 - 0.01, 4.5, z, -Math.PI / 2);
  }
  rect(lot, 470, 800, -440, 45, 0.03);
  rect(lot, 520, 900, 84, 130, 0.03);
}
