// Procedural model of the single-storey flex office / lab building at
// 1 Parrott Drive, Shelton, CT (former Pitney Bowes plant, 1976, renovated
// 2002), traced from satellite imagery / OSM and matched to the photos.
// Real footprint ~168 m x 72 m in three stepped blocks along a NNE-SSW axis:
//   - north block (industrial): white split-face block, truck doors
//   - middle block: on its west face, a grey ribbed metal fascia over a ribbon
//     of tall windows (industrial wing entrance with steps), then the long
//     cream metal-panel office facade with glass curtain-wall bays between
//     round white pilasters and gold disc ornaments, rounded at its south end
//   - south block: the glazed CARA lobby behind stone planters, facing the
//     circular drop-off drive
// Local axes: +z = real WNW (the front), +x = along the building toward SSW.
import * as THREE from 'three';
import { textTexture, rand } from './textures.js';
import { V, piece, createKit } from './kit.js';

export function buildLabFlex(params) {
  const { width: W = 168, depth: D = 72, sign = 'CARA', tenants = [] } = params;
  const front = D / 2;
  const r = rand(1976);
  const H = 6.5;
  const g = new THREE.Group();
  g.name = 'building';
  const { I, add, finish } = createKit(g, r, { glass: 'sky' });
  const panel = new THREE.MeshStandardMaterial({ color: '#ece4d6', roughness: 0.75 });
  const white = new THREE.MeshStandardMaterial({ color: '#f6f5f1', roughness: 0.5 });
  const blockTex = textTexture({
    width: 256, height: 256, bg: '#e9ecef',
    draw(ctx, w, h) { ctx.strokeStyle = '#c9cdd1'; ctx.lineWidth = 3; for (let y = 0; y <= h; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); } for (let y = 0; y < h; y += 32) for (let x = (y / 32) % 2 ? 16 : 0; x <= w; x += 32) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 32); ctx.stroke(); } },
  });
  blockTex.wrapS = blockTex.wrapT = THREE.RepeatWrapping;
  blockTex.repeat.set(18, 2);
  const blockMat = new THREE.MeshStandardMaterial({ map: blockTex, roughness: 0.9 });
  const ribTex = textTexture({ width: 256, height: 64, bg: '#9da3a8', draw(ctx, w) { for (let x = 0; x < w; x += 8) { ctx.fillStyle = x % 16 ? '#aeb4b9' : '#8b9196'; ctx.fillRect(x, 0, 6, 64); } } });
  ribTex.wrapS = THREE.RepeatWrapping;
  ribTex.repeat.set(12, 1);
  const rib = new THREE.MeshStandardMaterial({ map: ribTex, roughness: 0.5, metalness: 0.4 });
  const stoneTex = textTexture({
    width: 256, height: 128, bg: '#8e8579',
    draw(ctx, w, h) { for (let i = 0; i < 90; i++) { const v = 110 + r() * 80; ctx.fillStyle = `rgb(${v},${v - 6},${v - 14})`; ctx.fillRect(r() * w, r() * h, 18 + r() * 30, 10 + r() * 16); } },
  });
  stoneTex.wrapS = THREE.RepeatWrapping;
  stoneTex.repeat.set(4, 1);
  const stone = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 1 });
  const box = (mat, w, h, d, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    return add(m);
  };
  const M0 = new THREE.Matrix4();
  const RZ = new THREE.Matrix4().makeRotationY(Math.PI / 2); // faces +x
  const glassBay = (x0, x1, z, h, F = M0) => {
    const w = x1 - x0;
    I.glass.add(piece(F, (x0 + x1) / 2, 0.3 + h / 2, z + 0.02, w, h, 1), '#cfe2ee');
    for (let x = x0; x <= x1 + 0.01; x += w / Math.max(1, Math.round(w / 1.6))) I.frame.add(piece(F, x, 0.3 + h / 2, z + 0.05, 0.1, h, 0.1), '#d9dcdf');
    for (const y of [0.3, 0.3 + h * 0.55, 0.3 + h]) I.frame.add(piece(F, (x0 + x1) / 2, y, z + 0.05, w, 0.1, 0.1), '#d9dcdf');
  };
  const pilaster = (x, z) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, H + 1.2, 20), white);
    c.position.set(x, (H + 1.2) / 2, z + 0.4);
    c.castShadow = true;
    add(c);
  };
  const plant = (x, z) => box(new THREE.MeshStandardMaterial({ color: '#c3c6c8', roughness: 0.5, metalness: 0.4 }), 2.6, 1.2, 2.0, x, H + 1.0, z);

  // ---- footprint (traced) ----
  const N = { x0: -W / 2, x1: -11.4, z0: -27, z1: front }; // north block
  const Mb = { x0: -11.4, x1: 60.6, z0: -front, z1: 23 }; // middle block
  const S = { x0: 60.6, x1: W / 2, z0: -35, z1: 0 }; // south block
  const HN = 7.6;

  // ---- north block: industrial, white split-face block ----
  box(blockMat, N.x1 - N.x0, HN, N.z1 - N.z0, (N.x0 + N.x1) / 2, HN / 2, (N.z0 + N.z1) / 2);
  box(white, N.x1 - N.x0 + 0.3, 0.5, N.z1 - N.z0 + 0.3, (N.x0 + N.x1) / 2, HN + 0.1, (N.z0 + N.z1) / 2);
  // Small strip windows along the west face, truck doors on the north end.
  for (let x = N.x0 + 8; x < N.x1 - 10; x += 7) glassBay(x, x + 3.2, N.z1, 1.1, new THREE.Matrix4().makeTranslation(0, 3.6, 0));
  {
    const Fn = new THREE.Matrix4().makeRotationY(-Math.PI / 2).setPosition(N.x0, 0, 0);
    for (const z of [-12, 8]) I.trim.add(piece(Fn, z, 2.2, 0.05, 3.4, 4.0, 0.1), '#c9ccce');
  }

  // ---- middle block ----
  // (the south-west corner is left open for the rounded corner below)
  box(panel, Mb.x1 - Mb.x0, H, Mb.z1 - 3 - Mb.z0, (Mb.x0 + Mb.x1) / 2, H / 2, (Mb.z0 + Mb.z1 - 3) / 2);
  box(panel, Mb.x1 - 3 - Mb.x0, H, 3, (Mb.x0 + Mb.x1 - 3) / 2, H / 2, Mb.z1 - 1.5);
  box(panel, Mb.x1 - Mb.x0 + 0.3, 1.4, Mb.z1 - 3 - Mb.z0 + 0.3, (Mb.x0 + Mb.x1) / 2, H + 0.4, (Mb.z0 + Mb.z1 - 3) / 2);
  box(panel, Mb.x1 - 3 - Mb.x0 + 0.3, 1.4, 3.3, (Mb.x0 + Mb.x1 - 3) / 2, H + 0.4, Mb.z1 - 1.35);
  for (let x = Mb.x0 + 17; x < Mb.x1; x += 3) I.trim.add(piece(M0, x, H + 0.4, Mb.z1 + 0.17, 0.05, 1.3, 0.02), '#d8cfbf');
  // Industrial wing entrance: block return wall, ribbed fascia over a window ribbon.
  {
    const bx0 = Mb.x0 + 1.5;
    const bx1 = Mb.x0 + 16;
    const fz = Mb.z1;
    box(blockMat, 1.5, H + 1.2, 6, Mb.x0 + 0.75, (H + 1.2) / 2, fz - 2.5);
    box(rib, bx1 - bx0, 2.4, 0.4, (bx0 + bx1) / 2, H - 0.3, fz + 0.2);
    glassBay(bx0, bx1, fz, 4.0);
    I.frame.add(piece(M0, bx0 + 4, 1.6, fz + 0.08, 2.2, 2.6, 0.12), '#c7ccd0');
    for (let k = 0; k < 3; k++) box(new THREE.MeshStandardMaterial({ color: '#cfcbc3', roughness: 0.9 }), 3.4, 0.18, 0.6, bx0 + 4, 0.09 + k * 0.18, fz + 1.6 - k * 0.5);
    I.trim.add(piece(M0, Mb.x0 + 0.7, H - 1.2, fz + 0.6, 0.5, 0.5, 0.8), '#2c2e30');
    const mulch = new THREE.Mesh(new THREE.PlaneGeometry(bx1 - bx0, 3), new THREE.MeshStandardMaterial({ color: '#4a3226', roughness: 1 }));
    mulch.rotation.x = -Math.PI / 2;
    mulch.position.set((bx0 + bx1) / 2, 0.06, fz + 1.6);
    add(mulch);
    const shrub = new THREE.MeshStandardMaterial({ color: '#5d7a35', roughness: 1 });
    for (let x = bx0 + 6.5; x < bx1; x += 2.2) {
      const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9 + r() * 0.3, 1), shrub);
      s.position.set(x, 0.7, fz + 1.4 + (r() - 0.5) * 0.6);
      s.scale.y = 0.8;
      s.castShadow = true;
      add(s);
    }
    for (const x of [bx0 + 7.5, bx0 + 10.5, bx0 + 13]) {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 9, 8), new THREE.MeshStandardMaterial({ color: '#8c8279', roughness: 1 }));
      t.position.set(x, 4.5, fz + 3);
      t.rotation.z = (r() - 0.5) * 0.15;
      t.castShadow = true;
      add(t);
    }
  }
  // Office facade: glass curtain-wall bays between round pilasters.
  const bays = [[Mb.x0 + 19, Mb.x0 + 33], [Mb.x0 + 36, Mb.x0 + 50], [Mb.x0 + 53, Mb.x0 + 66]];
  for (const [x0, x1] of bays) {
    glassBay(x0, x1, Mb.z1, 4.6);
    for (const x of [x0 - 0.9, x1 + 0.9]) pilaster(x, Mb.z1);
  }
  // Rounded south-west corner with grey disc ornaments.
  {
    const cyl = new THREE.Mesh(new THREE.CylinderGeometry(3.1, 3.1, H + 1.1, 24, 1, false, 0, Math.PI / 2), panel);
    cyl.position.set(Mb.x1 - 3, (H + 1.1) / 2, Mb.z1 - 3);
    cyl.castShadow = true;
    add(cyl);
    for (const y of [2.2, 3.5, 4.8]) {
      const d = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 20), new THREE.MeshStandardMaterial({ color: '#8f8a83', roughness: 0.6 }));
      d.rotation.x = Math.PI / 2;
      d.position.set(Mb.x1 - 4.6 + (y === 3.5 ? 0.9 : 0), y, Mb.z1 + 0.06);
      add(d);
    }
  }
  // South face of the middle block (in the recess): glazing.
  glassBay(-20, -6, Mb.x1, 4.4, RZ);
  // Truck doors on the east side.
  {
    const Fe = new THREE.Matrix4().makeRotationY(Math.PI).setPosition(0, 0, Mb.z0);
    for (const x of [-20, -14, 30]) I.trim.add(piece(Fe, x, 2.2, 0.05, 3.4, 4.0, 0.1), '#c9ccce');
  }

  // ---- south block: CARA lobby ----
  box(panel, S.x1 - S.x0, H, S.z1 - S.z0, (S.x0 + S.x1) / 2, H / 2, (S.z0 + S.z1) / 2);
  box(panel, S.x1 - S.x0 + 0.3, 1.4, S.z1 - S.z0 + 0.3, (S.x0 + S.x1) / 2, H + 0.4, (S.z0 + S.z1) / 2);
  for (let x = S.x0; x < S.x1; x += 3) I.trim.add(piece(M0, x, H + 0.4, S.z1 + 0.17, 0.05, 1.3, 0.02), '#d8cfbf');
  const ex = S.x0 + 13; // entrance centre
  glassBay(S.x0 + 1.5, S.x0 + 6, S.z1, 4.6);
  glassBay(ex - 5.5, ex + 5.5, S.z1, 4.6);
  for (const x of [S.x0 + 7, ex + 6.4]) pilaster(x, S.z1);
  {
    const lobby = new THREE.Mesh(new THREE.BoxGeometry(11, 4.2, 4), new THREE.MeshBasicMaterial({ color: '#f3ecd2', side: THREE.BackSide }));
    lobby.position.set(ex, 2.4, S.z1 - 2.1);
    add(lobby);
    const tex = textTexture({
      width: 1024, height: 192, bg: 'rgba(0,0,0,0)',
      draw(ctx, w, h) { ctx.fillStyle = '#a89548'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '500 130px "Helvetica Neue", Arial'; ctx.fillText(sign.split('').join(' '), w / 2, h / 2 + 6); },
    });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.5), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.4, metalness: 0.5, depthWrite: false }));
    s.position.set(ex + 1.5, H + 0.45, S.z1 + 0.18);
    add(s);
    const gold = new THREE.MeshStandardMaterial({ color: '#a89548', roughness: 0.4, metalness: 0.6 });
    for (const x of [ex + 7, ex + 8.5]) {
      const d = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 20), gold);
      d.rotation.x = Math.PI / 2;
      d.position.set(x, H + 0.45, S.z1 + 0.2);
      add(d);
    }
  }
  // Stone planters with railings, the steps, lamp post.
  {
    for (const [x, w] of [[ex - 8, 9], [ex + 6.5, 6]]) {
      box(stone, w, 1.2, 1.2, x, 0.6, S.z1 + 4.2);
      for (let k = 0; k <= w; k += 0.6) I.steel.add(piece(M0, x - w / 2 + k, 1.75, S.z1 + 4.0, 0.03, 0.9, 0.03));
    }
    for (let k = 0; k < 3; k++) box(new THREE.MeshStandardMaterial({ color: '#d4d0c8', roughness: 0.9 }), 4, 0.18, 0.6, ex + 1.5, 0.09 + k * 0.18, S.z1 + 4.6 - k * 0.5);
    I.steel.add(piece(M0, S.x0 - 4, 3.5, 6, 0.12, 7, 0.12));
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.5), new THREE.MeshStandardMaterial({ color: '#f4f1e8', emissive: '#fff4d6', emissiveIntensity: 0.6 }));
    lamp.position.set(S.x0 - 4, 7.1, 6);
    add(lamp);
  }

  // ---- other tenants: door plaques / wall signs ----
  // tenants: [{ name, sub, at: [x, y, z], ry, w, bg, ink }]
  for (const t of tenants) {
    const tex = textTexture({ text: t.name, sub: t.sub, width: 1024, height: 220, bg: t.bg ?? '#ffffff', ink: t.ink ?? '#1f2a3a', font: '800 96px Arial', subFont: '600 44px Arial' });
    const w = t.w ?? 5;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.215), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }));
    m.position.set(...t.at);
    m.rotation.y = t.ry ?? 0;
    add(m);
  }

  // Dark single-ply roof membrane inside the parapets (as on the satellite).
  {
    const roofMat = new THREE.MeshStandardMaterial({ color: '#4d5156', roughness: 0.95 });
    const slab = (x0, x1, z0, z1, y) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.04, z1 - z0), roofMat);
      m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
      m.receiveShadow = true;
      add(m);
    };
    slab(N.x0 + 0.45, N.x1 - 0.2, N.z0 + 0.45, N.z1 - 0.45, HN + 0.37);
    slab(Mb.x0 + 0.2, Mb.x1 - 0.45, Mb.z0 + 0.45, Mb.z1 - 3, H + 1.12);
    slab(Mb.x0 + 0.2, Mb.x1 - 3, Mb.z1 - 3, Mb.z1 - 0.45, H + 1.12);
    slab(S.x0 - 0.2, S.x1 - 0.45, S.z0 + 0.45, S.z1 - 0.45, H + 1.12);
  }
  // Roof plant (many small rooftop units, as seen from above).
  for (let x = N.x0 + 6; x < N.x1 - 3; x += 9) for (let z = N.z0 + 6; z < N.z1 - 3; z += 11) if (r() < 0.6) box(new THREE.MeshStandardMaterial({ color: '#c3c6c8', roughness: 0.5, metalness: 0.4 }), 2.6, 1.2, 2.0, x + r() * 3, HN + 0.9, z + r() * 3);
  for (let x = Mb.x0 + 6; x < Mb.x1 - 3; x += 12) for (let z = Mb.z0 + 6; z < Mb.z1 - 4; z += 13) if (r() < 0.55) plant(x + r() * 3, z + r() * 3);
  plant(S.x0 + 10, -18);
  plant(S.x0 + 16, -8);

  finish();
  // Front face z at a given x (stepped facade).
  const faceZ = (x) => (x < N.x1 ? N.z1 : x < Mb.x1 ? Mb.z1 : S.z1);
  const floorRange = () => [0, H];
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * H;
    const x = (u - 0.5) * W;
    switch (faceName) {
      case 'front': return V(x, y, faceZ(x) + 2);
      case 'roof': return V(x, y, 0);
      default: return V(0, y, 0);
    }
  };
  return { group: g, width: W, depth: D, height: 9, floorRange, hotspotPosition };
}
