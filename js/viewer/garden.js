// Procedural model of a garden-apartment complex, matched to photos of
// The Link at 4th Ave, 415 E University Blvd, Tucson:
//   - white stucco two- and three-storey blocks with grey concrete-tile
//     mansard bands, open walkways with black railings, exterior stairs,
//     flat-panel doors and sliding windows
//   - fenced pool courtyard: brick pillars, black steel fence, white deck,
//     pool, orange loungers, tiled ramada, lawn with hammocks, palms
//   - front parking court and the grey "THE LINK AT 4TH AVE 415" monument
import * as THREE from 'three';
import { textTexture, rand } from './textures.js';
import { V, piece, createKit } from './kit.js';

export function buildGarden(params) {
  const { width: W = 64, depth: D = 52 } = params;
  const r = rand(415);
  const FH = 2.9;
  const g = new THREE.Group();
  g.name = 'building';
  const { I, add, finish } = createKit(g, r);
  const stucco = new THREE.MeshStandardMaterial({ color: '#f1f0ec', roughness: 0.95 });
  const greyWall = new THREE.MeshStandardMaterial({ color: '#c4c6c8', roughness: 0.9 });
  const tileTex = textTexture({
    width: 256, height: 128, bg: '#4a4f55',
    draw(ctx, w, h) { for (let x = 0; x < w; x += 12) { ctx.fillStyle = x % 24 ? '#575c63' : '#3f444a'; ctx.fillRect(x, 0, 10, h); } ctx.fillStyle = 'rgba(0,0,0,0.25)'; for (let y = 0; y < h; y += 32) ctx.fillRect(0, y, w, 3); },
  });
  tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
  const tiles = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.8 });
  const box = (mat, w, h, d, x, y, z, ry = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.rotation.y = ry;
    m.castShadow = m.receiveShadow = true;
    return add(m);
  };

  // An apartment block. (x, z) centre, `len` along local x, `dep` deep;
  // ry rotates it; the walkway side faces local +z.
  function block(x, z, len, dep, floors, ry, { mansard = true, solar = false } = {}) {
    const H = floors * FH + 0.6;
    const F = new THREE.Matrix4().makeRotationY(ry).setPosition(x, 0, z);
    const P = (lx, y, lz, sx, sy, sz, c) => I.trim.add(piece(F, lx, y, lz, sx, sy, sz), c);
    const body = box(stucco, len, H, dep, 0, H / 2, 0);
    body.applyMatrix4(F);
    // Doors + windows on both long faces, walkway + railings on +z.
    const bays = Math.floor(len / 4.2);
    for (let f = 0; f < floors; f++) {
      const y0 = f * FH;
      for (let b = 0; b < bays; b++) {
        const lx = -len / 2 + 2.1 + b * 4.2;
        P(lx - 0.8, y0 + 1.05, dep / 2 + 0.01, 0.95, 2.05, 0.04, b % 2 ? '#3f4a57' : '#5a6470'); // door
        P(lx + 0.8, y0 + 1.5, dep / 2 + 0.01, 1.3, 1.0, 0.04, '#2b3138'); // window
        P(lx + 0.8, y0 + 1.5, dep / 2 + 0.03, 1.36, 0.06, 0.04, '#e9e9e6');
        P(lx, y0 + 1.6, -dep / 2 - 0.01, 1.8, 1.1, 0.04, '#2b3138'); // rear window
      }
      if (f > 0) {
        P(0, y0 - 0.05, dep / 2 + 0.75, len, 0.2, 1.5, '#d9d8d4'); // walkway slab
        for (let lx = -len / 2; lx <= len / 2; lx += 0.14) P(lx, y0 + 0.5, dep / 2 + 1.48, 0.025, 1.0, 0.025, '#1b1d1f');
        P(0, y0 + 1.0, dep / 2 + 1.48, len, 0.05, 0.05, '#1b1d1f');
        // Low stucco wing walls at the walkway ends.
        P(-len / 2 + 0.2, y0 + 0.55, dep / 2 + 0.75, 0.4, 1.1, 1.5, '#ececea');
      }
    }
    // Exterior stair at the +x end.
    for (let f = 1; f < floors; f++) {
      const y0 = (f - 1) * FH;
      const steps = 14;
      for (let k = 0; k < steps; k++) P(len / 2 - 2.5 + (k / steps) * 0.0 - 1.6 + k * 0.2, y0 + (k + 1) * (FH / steps), dep / 2 + 2.3, 0.22, 0.05, 1.0, '#24272a');
      P(len / 2 - 2.7, y0 + FH / 2, dep / 2 + 2.8, 3.2, 0.06, 0.06, '#1b1d1f');
    }
    // Grey tile mansard band at the roofline (front portion), parapet elsewhere.
    if (mansard) {
      const band = box(tiles, len + 0.8, 1.3, 1.2, 0, H + 0.2, dep / 2 - 0.3);
      band.rotation.x = -0.45;
      band.applyMatrix4(F);
      const back = box(tiles, len + 0.8, 1.3, 1.2, 0, H + 0.2, -dep / 2 + 0.3);
      back.rotation.x = 0.45;
      back.applyMatrix4(F);
    }
    const parapet = box(stucco, len + 0.2, 0.5, dep + 0.2, 0, H + 0.25, 0);
    parapet.applyMatrix4(F);
    // Roof units and optional solar panels.
    for (let k = 0; k < Math.floor(len / 9); k++) P(-len / 2 + 4 + k * 9, H + 0.95, 0, 1.6, 0.9, 1.4, '#b9bcbe');
    if (solar) for (let k = 0; k < 6; k++) P(-len / 2 + 6 + k * 3.4, H + 0.7, -1.2, 3, 0.12, 4.2, '#1e2b3f');
    return { H };
  }

  // Layout: front 3-storey block on the parking court, rear 3-storey block
  // with a grey wing, 2-storey block on the west side of the courtyard.
  block(-12, 16, 38, 11, 3, Math.PI, { solar: true });
  box(greyWall, 6, 8.9, 11.2, 9.5, 4.45, 16); // grey end tower with slot windows
  for (const y of [2, 4.9, 7.8]) I.trim.add(piece(new THREE.Matrix4(), 12.55, y, 16, 0.05, 1.2, 2.2), '#2b3138');
  block(4, -20, 46, 11, 3, 0);
  block(-26, -2, 28, 10, 2, Math.PI / 2);

  // ---- pool courtyard ----
  {
    const deck = new THREE.MeshStandardMaterial({ color: '#efede8', roughness: 0.9 });
    const px = 14, pz = 0;
    box(deck, 30, 0.15, 24, px, 0.08, pz);
    const water = new THREE.Mesh(new THREE.BoxGeometry(16, 0.1, 7), new THREE.MeshStandardMaterial({ color: '#2fc6d6', roughness: 0.05, metalness: 0.1, emissive: '#0b5d6b', emissiveIntensity: 0.25 }));
    water.position.set(px - 1, 0.17, pz + 2);
    add(water);
    box(new THREE.MeshStandardMaterial({ color: '#1f8fa3', roughness: 0.3 }), 16.4, 0.12, 7.4, px - 1, 0.13, pz + 2);
    // Orange loungers.
    const orange = new THREE.MeshStandardMaterial({ color: '#f07a18', roughness: 0.6 });
    for (const [x, z] of [[px + 9, pz + 6], [px + 10.6, pz + 6.5], [px + 8, pz - 4], [px + 9.5, pz - 4.3]]) {
      box(orange, 0.75, 0.35, 2.0, x, 0.4, z);
      const back = box(orange, 0.75, 0.9, 0.12, x, 0.85, z - 0.95);
      back.rotation.x = -0.6;
    }
    // Ramada with a hipped tile roof on brick piers.
    const brick = new THREE.MeshStandardMaterial({ color: '#9a5a44', roughness: 0.9 });
    for (const [x, z] of [[px + 9, pz - 9], [px + 14, pz - 9], [px + 9, pz - 4.5], [px + 14, pz - 4.5]]) box(brick, 0.8, 3, 0.8, x, 1.5, z);
    const hip = new THREE.Mesh(new THREE.ConeGeometry(4.6, 1.4, 4), tiles);
    hip.rotation.y = Math.PI / 4;
    hip.position.set(px + 11.5, 3.8, pz - 6.75);
    hip.castShadow = true;
    add(hip);
    // Fence: black pickets between brick pillars around the deck.
    const fence = (x0, z0, x1, z1) => {
      const len = Math.hypot(x1 - x0, z1 - z0);
      const ry = -Math.atan2(z1 - z0, x1 - x0);
      const F = new THREE.Matrix4().makeRotationY(ry).setPosition(x0, 0, z0);
      for (let s = 0; s <= len; s += 0.14) I.steel.add(piece(F, s, 0.75, 0, 0.025, 1.5, 0.025));
      for (const y of [0.15, 1.45]) I.steel.add(piece(F, len / 2, y, 0, len, 0.05, 0.05));
      for (let s = 0; s <= len + 0.01; s += len / Math.max(1, Math.round(len / 5))) box(brick, 0.6, 1.9, 0.6, 0, 0.95, 0).applyMatrix4(new THREE.Matrix4().multiplyMatrices(F, new THREE.Matrix4().makeTranslation(s, 0, 0)));
    };
    fence(px - 15, pz + 12, px + 15, pz + 12);
    fence(px - 15, pz - 12, px - 15, pz + 12);
    fence(px + 15, pz + 12, px + 15, pz - 12);
    // Lawn with hammocks between the west block and the pool.
    const lawn = new THREE.Mesh(new THREE.PlaneGeometry(10, 18), new THREE.MeshStandardMaterial({ color: '#5fae3a', roughness: 1 }));
    lawn.rotation.x = -Math.PI / 2;
    lawn.position.set(-15.5, 0.06, 0);
    add(lawn);
    const canvas = new THREE.MeshStandardMaterial({ color: '#f2efe6', roughness: 0.9, side: THREE.DoubleSide });
    for (const z of [-5, 1, 7]) {
      for (const dx of [-2, 2]) box(new THREE.MeshStandardMaterial({ color: '#2a2d30' }), 0.1, 1.6, 0.1, -15.5 + dx, 0.8, z);
      const h = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 3.8, 12, 1, true, Math.PI, Math.PI), canvas);
      h.rotation.z = Math.PI / 2;
      h.position.set(-15.5, 1.0, z);
      add(h);
    }
  }

  // Palms and an Italian cypress around the complex.
  const trunk = new THREE.MeshStandardMaterial({ color: '#7b6a55', roughness: 1 });
  const frond = new THREE.MeshStandardMaterial({ color: '#4f7a33', roughness: 1, side: THREE.DoubleSide });
  const palm = (x, z, h) => {
    box(trunk, 0.45, h, 0.45, x, h / 2, z);
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      const f = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 3.2), frond);
      f.position.set(x + Math.cos(a) * 1.3, h - 0.3, z + Math.sin(a) * 1.3);
      f.rotation.set(Math.PI / 2 - 0.5, 0, 0);
      f.rotation.order = 'YXZ';
      f.rotation.y = -a + Math.PI / 2;
      add(f);
    }
  };
  for (const [x, z, h] of [[30, 14, 13], [31, -8, 15], [-30, 22, 12], [24, 22, 14], [-34, -16, 11]]) palm(x, z, h);
  const cyp = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 1.1, 11, 10), new THREE.MeshStandardMaterial({ color: '#2f5226', roughness: 1 }));
  cyp.position.set(28, 5.5, -14);
  cyp.castShadow = true;
  add(cyp);

  // Monument sign at the parking entrance.
  {
    const sign = textTexture({
      width: 1024, height: 640, bg: '#5c6066',
      draw(ctx, w, h) {
        ctx.fillStyle = '#ffffff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.font = '700 120px "Helvetica Neue", Arial'; ctx.fillText('THE LINK', 60, 240);
        ctx.font = '500 70px "Helvetica Neue", Arial'; ctx.fillText('AT 4TH AVE', 64, 340);
        ctx.font = '600 150px "Helvetica Neue", Arial'; ctx.textAlign = 'center';
        ['4', '1', '5'].forEach((n, i) => ctx.fillText(n, 880, 150 + i * 170));
      },
    });
    const m = box(new THREE.MeshStandardMaterial({ map: sign, roughness: 0.6 }), 5.2, 3.2, 0.4, -4, 2.3, D / 2 + 6);
    m.material = [greyWall, greyWall, greyWall, greyWall, new THREE.MeshStandardMaterial({ map: sign, roughness: 0.6 }), greyWall];
    box(new THREE.MeshStandardMaterial({ color: '#9a5a44', roughness: 0.9 }), 6.4, 0.9, 1.6, -4, 0.45, D / 2 + 6.4);
  }

  finish();
  const floorRange = (n) => [(n - 1) * FH, n * FH];
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * 9;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, D / 2 + 2);
      case 'pool': return V(14, 2.5, 2);
      case 'roof': return V((u - 0.5) * W, y, 0);
      default: return V(0, y, 0);
    }
  };
  return { group: g, width: W, depth: D, height: 12, floorRange, hotspotPosition };
}
