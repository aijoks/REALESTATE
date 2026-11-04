// Procedural model of a single-storey flex office / lab building, matched to
// photos of 1 Parrott Drive, Shelton, CT:
//   - long cream metal-panel facade with a raised parapet band, large glass
//     curtain-wall bays between round white pilasters, rows of round gold
//     disc ornaments, "CARA" letters over the glazed entrance
//   - stone retaining-wall planters with railings, a circular drop-off drive
//     around a grass island, lawn and evergreens
//   - at the far end a wing of white split-face block with a grey ribbed
//     metal fascia over a ribbon of tall windows and a stepped entrance
import * as THREE from 'three';
import { textTexture, rand } from './textures.js';
import { V, piece, createKit } from './kit.js';

export function buildLabFlex(params) {
  const { width: W = 120, depth: D = 75, sign = 'CARA' } = params;
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
  blockTex.repeat.set(6, 2);
  const blockMat = new THREE.MeshStandardMaterial({ map: blockTex, roughness: 0.9 });
  const ribTex = textTexture({ width: 256, height: 64, bg: '#9da3a8', draw(ctx, w, h) { for (let x = 0; x < w; x += 8) { ctx.fillStyle = x % 16 ? '#aeb4b9' : '#8b9196'; ctx.fillRect(x, 0, 6, h); } } });
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
  const glassBay = (x0, x1, z, h) => {
    const w = x1 - x0;
    I.glass.add(piece(M0, (x0 + x1) / 2, 0.3 + h / 2, z + 0.02, w, h, 1), '#cfe2ee');
    for (let x = x0; x <= x1 + 0.01; x += w / Math.round(w / 1.6)) I.frame.add(piece(M0, x, 0.3 + h / 2, z + 0.05, 0.1, h, 0.1), '#d9dcdf');
    for (const y of [0.3, 0.3 + h * 0.55, 0.3 + h]) I.frame.add(piece(M0, (x0 + x1) / 2, y, z + 0.05, w, 0.1, 0.1), '#d9dcdf');
  };

  // ---- main cream building (west two-thirds) ----
  const mainW = W * 0.68;
  const mx = -W / 2 + mainW / 2;
  box(panel, mainW, H, D, mx, H / 2, 0);
  box(panel, mainW + 0.3, 1.4, D + 0.3, mx, H + 0.4, 0); // parapet band
  for (let x = -W / 2; x < -W / 2 + mainW; x += 3) I.trim.add(piece(M0, x, H + 0.4, front + 0.17, 0.05, 1.3, 0.02), '#d8cfbf');
  // Glass bays between round pilasters, disc ornaments on the solid panels.
  const bays = [[-W / 2 + 6, -W / 2 + 22], [-W / 2 + 27, -W / 2 + 46], [-W / 2 + 58, -W / 2 + 76]];
  for (const [x0, x1] of bays) {
    glassBay(x0, x1, front, 4.6);
    for (const x of [x0 - 0.9, x1 + 0.9]) {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, H + 1.2, 20), white);
      c.position.set(x, (H + 1.2) / 2, front + 0.4);
      c.castShadow = true;
      add(c);
    }
  }
  const gold = new THREE.MeshStandardMaterial({ color: '#a89548', roughness: 0.4, metalness: 0.6 });
  for (const xs of [-W / 2 + 49.5, -W / 2 + 53.5]) {
    for (const y of [2.2, 3.5, 4.8]) {
      const d = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 20), new THREE.MeshStandardMaterial({ color: '#8f8a83', roughness: 0.6 }));
      d.rotation.x = Math.PI / 2;
      d.position.set(xs + (y === 3.5 ? 1 : 0), y, front + 0.06);
      add(d);
    }
  }
  // CARA sign with gold discs over the entrance bay.
  {
    const tex = textTexture({
      width: 1024, height: 192, bg: 'rgba(0,0,0,0)',
      draw(ctx, w, h) { ctx.fillStyle = '#a89548'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '500 130px "Helvetica Neue", Arial'; ctx.fillText(sign.split('').join(' '), w / 2, h / 2 + 6); },
    });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(8, 1.5), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.4, metalness: 0.5, depthWrite: false }));
    s.position.set(-W / 2 + 67, H + 0.45, front + 0.18);
    add(s);
    for (const x of [-W / 2 + 72.5, -W / 2 + 74]) {
      const d = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.06, 20), gold);
      d.rotation.x = Math.PI / 2;
      d.position.set(x, H + 0.45, front + 0.2);
      add(d);
    }
  }
  // Glazed entrance pavilion with a lit lobby.
  {
    const lobby = new THREE.Mesh(new THREE.BoxGeometry(14, 4.2, 4), new THREE.MeshBasicMaterial({ color: '#f3ecd2', side: THREE.BackSide }));
    lobby.position.set(-W / 2 + 67, 2.4, front - 1.8);
    add(lobby);
  }

  // ---- east wing: split-face block with a grey ribbed fascia ----
  {
    const ew = W - mainW;
    const ex = W / 2 - ew / 2;
    const fz = front - 8; // set back from the main front
    box(blockMat, ew, H + 1.2, D - 8, ex, (H + 1.2) / 2, -4);
    // Recessed bay: grey ribbed fascia over a ribbon of tall windows.
    const bx0 = ex - ew / 2 + 10;
    const bx1 = W / 2 - 3;
    box(rib, bx1 - bx0, 2.4, 0.4, (bx0 + bx1) / 2, H - 0.3, fz + 0.2);
    glassBay(bx0, bx1, fz, 4.0);
    // Entrance doors and three steps.
    I.frame.add(piece(M0, bx0 + 7, 1.6, fz + 0.08, 2.2, 2.6, 0.12), '#c7ccd0');
    for (let k = 0; k < 3; k++) box(new THREE.MeshStandardMaterial({ color: '#cfcbc3', roughness: 0.9 }), 3.4, 0.18, 0.6, bx0 + 7, 0.09 + k * 0.18, fz + 1.6 - k * 0.5);
    // Wall-pack light on the block.
    I.trim.add(piece(M0, ex - ew / 2 + 5, H - 1.2, fz + 0.1, 0.8, 0.5, 0.3), '#2c2e30');
    // Mulch bed and clipped shrubs along the wing.
    const mulch = new THREE.Mesh(new THREE.PlaneGeometry(ew, 3), new THREE.MeshStandardMaterial({ color: '#4a3226', roughness: 1 }));
    mulch.rotation.x = -Math.PI / 2;
    mulch.position.set(ex, 0.06, fz + 1.6);
    add(mulch);
    const shrub = new THREE.MeshStandardMaterial({ color: '#5d7a35', roughness: 1 });
    for (let x = ex - ew / 2 + 1.5; x < W / 2 - 1; x += 2.2) {
      const s = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9 + r() * 0.3, 1), shrub);
      s.position.set(x, 0.7, fz + 1.4 + (r() - 0.5) * 0.6);
      s.scale.y = 0.8;
      s.castShadow = true;
      add(s);
    }
  }

  // ---- stone planters, entry drive and landscaping ----
  {
    const ex = -W / 2 + 67;
    for (const [x, w] of [[ex - 7, 9], [ex + 7.5, 8]]) {
      box(stone, w, 1.2, 1.2, x, 0.6, front + 4.2);
      for (let k = 0; k <= w; k += 0.6) I.steel.add(piece(M0, x - w / 2 + k, 1.75, front + 4.0, 0.03, 0.9, 0.03));
    }
    const island = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.25, 40), new THREE.MeshStandardMaterial({ color: '#5f9a3f', roughness: 1 }));
    island.position.set(ex - 6, 0.14, front + 14);
    add(island);
    const kerb = new THREE.Mesh(new THREE.TorusGeometry(5, 0.2, 6, 40), new THREE.MeshStandardMaterial({ color: '#d6d2c9', roughness: 0.9 }));
    kerb.rotation.x = -Math.PI / 2;
    kerb.position.set(ex - 6, 0.16, front + 14);
    add(kerb);
    // Lamp post.
    I.steel.add(piece(M0, -W / 2 + 51, 3.5, front + 5, 0.12, 7, 0.12));
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.3, 0.5), new THREE.MeshStandardMaterial({ color: '#f4f1e8', emissive: '#fff4d6', emissiveIntensity: 0.6 }));
    lamp.position.set(-W / 2 + 51, 7.1, front + 5);
    add(lamp);
    // Evergreen and deciduous trees.
    const ever = new THREE.MeshStandardMaterial({ color: '#2f4b2a', roughness: 1 });
    for (const [x, z, h] of [[-W / 2 + 50, front + 8, 11], [-W / 2 - 6, front + 9, 10], [W / 2 + 4, front + 6, 9]]) {
      const c = new THREE.Mesh(new THREE.ConeGeometry(h * 0.32, h, 10), ever);
      c.position.set(x, h / 2 + 0.8, z);
      c.castShadow = true;
      add(c);
    }
    const bare = new THREE.MeshStandardMaterial({ color: '#8c8279', roughness: 1 });
    for (const [x, z] of [[W / 2 - 22, front - 5], [W / 2 - 15, front - 5.5], [W / 2 - 9, front - 5]]) {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 9, 8), bare);
      t.position.set(x, 4.5, z);
      t.rotation.z = (r() - 0.5) * 0.15;
      t.castShadow = true;
      add(t);
    }
  }

  // Roof plant.
  for (let k = 0; k < 7; k++) box(new THREE.MeshStandardMaterial({ color: '#c3c6c8', roughness: 0.5, metalness: 0.4 }), 3, 1.3, 2.4, -W / 2 + 10 + k * 15, H + 0.65, -10 + (k % 3) * 8);

  finish();
  const floorRange = () => [0, H];
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * H;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, front + 2);
      case 'roof': return V((u - 0.5) * W, y, 0);
      default: return V(0, y, 0);
    }
  };
  return { group: g, width: W, depth: D, height: 9, floorRange, hotspotPosition };
}
