// Procedural model of a 1920 six-storey corner walk-up (residential over
// ground-floor retail), matched to photos of 370 W 51st St at Ninth Avenue:
//   - tan-brown brick with light stone lintels and sills, windows in a
//     1 · 1 · pair · 1 rhythm on 51st Street
//   - ground floor: residential entrance and vent at the east end; the
//     GQ Sushi restaurant wraps the corner under a dark brown fascia with
//     blue awnings; a second shop further down Ninth Avenue
//   - Ninth Avenue side: steel fire escapes and the tall vertical NETWORK
//     sign at the corner
//   - plain parapet with stone bands and a small centre plaque
import * as THREE from 'three';
import { grime, textTexture, rand } from './textures.js';
import { V, C, face, piece, brickMaterial, wall, createKit, addFireEscape } from './kit.js';

export function buildWalkup(params) {
  const { width: W = 12, depth: D = 17 } = params;

  const r = rand(1920);
  const g1 = 4.3;
  const FH = 3.05;
  const floors = 5;
  const wallTop = g1 + floors * FH;
  const parapet = 1.3;
  const top = wallTop + parapet;

  const g = new THREE.Group();
  g.name = 'building';
  const { matStone, matSteel, I, opening, add, stoneBox, finish } = createKit(g, r);
  const matBrick = brickMaterial('walkup', grime('walkup', { seed: 51, streaks: 40, strength: 0.55 }));
  const matCommon = (seed) => brickMaterial('common', grime(`walkcommon${seed}`, { seed, streaks: 50, strength: 0.7 }));
  const frame = '#2a2725';
  const lintel = '#d6ccb8';
  const brown = new THREE.MeshStandardMaterial({ color: '#3d2a22', roughness: 0.6 });
  const front = D / 2;
  const win = (x, f) => ({ x, y: g1 + f * FH + 0.85 + 0.85, w: 1.0, h: 1.7, kind: 'dh', frame, reveal: '#8a7a64', rd: 0.18, sillColor: lintel, header: lintel });
  const ac = (F, x, f) => { if (r() < 0.3) I.trim.add(piece(F, x, g1 + f * FH + 1.0, 0.25, 0.75, 0.45, 0.5), '#e4e4e0'); };

  // =====================================================================
  // 51st STREET FACADE (front, +z)
  // =====================================================================
  const Ff = face(0, -W / 2, 0, front);
  const fx = [1.0, 3.5, 6.0, 7.7, 10.5];
  const fHoles = [
    { x: 1.3, y: 0.12 + 1.35, w: 1.4, h: 2.7, kind: 'panel', panel: '#2b211c', reveal: '#6b5a48', rd: 0.25, sill: false },
    { x: 3.0, y: 0.12 + 1.6, w: 1.0, h: 1.4, kind: 'panel', panel: '#6c6c68', reveal: '#6b5a48', rd: 0.1, sill: false },
    { x: 7.95, y: 0.12 + 1.45, w: 7.1, h: 2.9, kind: 'grid', cols: 4, transom: 0.6, room: 'shop', frame: '#1c1c1c', reveal: '#3d2a22', rd: 0.25, sill: false, roomDepth: 4 },
  ];
  for (let f = 0; f < floors; f++) for (const x of fx) fHoles.push(win(x, f));
  add(wall(Ff, W, top, fHoles, matBrick));
  fHoles.forEach((o) => opening(Ff, o));
  for (let f = 0; f < floors; f++) for (const x of fx) ac(Ff, x, f);

  // =====================================================================
  // NINTH AVENUE FACADE (west, +x)
  // =====================================================================
  const Fw = face(Math.PI / 2, W / 2, 0, front); // local x runs from the corner (z = D/2) south
  const wx = [1.6, 4.4, 7.4, 10.4, 13.6];
  const wHoles = [
    { x: 3.2, y: 0.12 + 1.45, w: 5.6, h: 2.9, kind: 'grid', cols: 3, transom: 0.6, room: 'shop', frame: '#1c1c1c', reveal: '#3d2a22', rd: 0.25, sill: false, roomDepth: 4 },
    { x: 8.4, y: 0.12 + 1.35, w: 1.2, h: 2.7, kind: 'panel', panel: '#2b211c', reveal: '#6b5a48', rd: 0.2, sill: false },
    { x: 12.6, y: 0.12 + 1.45, w: 5.2, h: 2.9, kind: 'grid', cols: 3, transom: 0.6, room: 'warm', blinds: false, frame: '#1c1c1c', reveal: '#6b5a48', rd: 0.25, sill: false },
  ];
  for (let f = 0; f < floors; f++) for (const x of wx) wHoles.push(win(x, f));
  add(wall(Fw, D, top, wHoles, matBrick));
  wHoles.forEach((o) => opening(Fw, o));
  for (let f = 0; f < floors; f++) for (const x of wx) ac(Fw, x, f);
  // Two fire escapes on the avenue side (rotated helper: world z = local x).
  const escFrame = new THREE.Matrix4().makeRotationY(-Math.PI / 2);
  const levels = [...Array(floors).keys()].map((f) => g1 + f * FH + 0.8);
  addFireEscape(I, { x0: front - 6.0, x1: front - 0.8, z: -W / 2, levels, frame: escFrame });
  addFireEscape(I, { x0: front - 14.6, x1: front - 9.4, z: -W / 2, levels, frame: escFrame });

  // =====================================================================
  // STOREFRONT: GQ Sushi fascia wrapping the corner, blue awnings
  // =====================================================================
  {
    const gq = (w) => textTexture({
      width: 1024, height: Math.round(1024 * (1.1 / w)), bg: '#3d2a22',
      draw(ctx, cw, ch) {
        ctx.fillStyle = '#b8231e'; ctx.fillRect(0, 0, cw, 10);
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#e8322a'; ctx.font = `800 ${Math.round(ch * 0.46)}px Arial, sans-serif`;
        ctx.fillText('GQ SUSHI', cw / 2, ch * 0.42);
        ctx.fillStyle = '#f2ece2'; ctx.font = `600 ${Math.round(ch * 0.14)}px Arial, sans-serif`;
        ctx.fillText('J A P A N E S E   C U I S I N E', cw / 2, ch * 0.8);
      },
    });
    const fasciaFront = 7.6;
    const f1 = new THREE.Mesh(new THREE.BoxGeometry(fasciaFront, 1.1, 0.35), [brown, brown, brown, brown, new THREE.MeshStandardMaterial({ map: gq(fasciaFront), roughness: 0.5 }), brown]);
    f1.position.set(W / 2 - fasciaFront / 2 + 0.17, g1 - 0.15, front + 0.17);
    f1.castShadow = true;
    add(f1);
    const f2 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 1.1, 6.2), [new THREE.MeshStandardMaterial({ map: gq(6.2), roughness: 0.5 }), brown, brown, brown, brown, brown]);
    f2.position.set(W / 2 + 0.17, g1 - 0.15, front - 3.1 + 0.17);
    f2.castShadow = true;
    add(f2);
    const blue = new THREE.MeshStandardMaterial({ color: '#1f4f8f', roughness: 0.6, side: THREE.DoubleSide });
    const awnA = new THREE.Mesh(new THREE.PlaneGeometry(6.8, 1.1), blue);
    awnA.rotation.x = -0.9;
    awnA.position.set(W / 2 - 3.9, g1 - 1.05, front + 0.45);
    add(awnA);
    const awnB = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 5.4), blue);
    awnB.rotation.set(-Math.PI / 2, 0.9, 0);
    awnB.position.set(W / 2 + 0.45, g1 - 1.05, front - 3.1);
    add(awnB);
    const awnC = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 4.8), new THREE.MeshStandardMaterial({ color: '#2f6fb3', roughness: 0.6, side: THREE.DoubleSide }));
    awnC.rotation.set(-Math.PI / 2, 0.9, 0);
    awnC.position.set(W / 2 + 0.45, g1 - 1.05, front - 12.6);
    add(awnC);
    // Dark base panel under the shop windows on the east end of the front.
    I.trim.add(piece(Ff, 2.2, g1 / 2, 0.04, 3.6, g1 - 0.2, 0.06), '#3a2a22');
  }

  // Tall vertical NETWORK sign projecting from the corner on Ninth Avenue.
  {
    const tex = textTexture({
      width: 256, height: 1400, bg: '#f6f3ee',
      draw(ctx, w, h) {
        ctx.strokeStyle = '#c42a2a'; ctx.lineWidth = 10; ctx.strokeRect(8, 8, w - 16, h - 16);
        ctx.fillStyle = '#c42a2a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '800 170px Arial, sans-serif';
        'NETWORK'.split('').forEach((ch, i) => ctx.fillText(ch, w / 2, 110 + i * 184));
      },
    });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(1.5, 10.5, 0.18), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }));
    sign.position.set(W / 2 + 1.05, g1 + FH * 1.2 + 5.25, front - 0.6);
    sign.castShadow = true;
    add(sign);
    for (const y of [sign.position.y + 4.8, sign.position.y - 4.8]) {
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.08, 0.08), matSteel);
      arm.position.set(W / 2 + 0.2, y, front - 0.6);
      add(arm);
    }
  }

  // =====================================================================
  // PARAPET, PARTY WALLS, ROOF
  // =====================================================================
  for (const [w, x, z, ry] of [[W, 0, front, 0], [D, W / 2, 0, Math.PI / 2]]) {
    for (const y of [wallTop + 0.05, top - 0.1]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, y === top - 0.1 ? 0.25 : 0.22, 0.3), matStone);
      b.position.set(x + (ry ? 0.1 : 0), y, z + (ry ? 0 : 0.1));
      b.rotation.y = ry;
      b.castShadow = true;
      add(b);
    }
  }
  stoneBox(1.4, 0.7, 0.15, 0, wallTop + 0.7, front + 0.08); // centre plaque
  add(wall(face(-Math.PI / 2, -W / 2, 0, -D / 2), D, top, [], matCommon(2)));
  add(wall(face(Math.PI, W / 2, 0, -D / 2), W, top, [], matCommon(3)));
  {
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: '#4f4b48', roughness: 1 }));
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = wallTop;
    roof.receiveShadow = true;
    add(roof);
    const bulk = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.8, 4), matCommon(4));
    bulk.position.set(-W / 2 + 2.4, wallTop + 1.4, -D / 2 + 3.5);
    bulk.castShadow = true;
    add(bulk);
  }

  finish();

  const floorRange = (n) => {
    if (n <= 1) return [0, g1];
    const y0 = g1 + (n - 2) * FH;
    return [y0, y0 + FH];
  };
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * top;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, front + 1.0);
      case 'right': return V(W / 2 + 1.0, y, (0.5 - u) * D);
      case 'roof': return V((u - 0.5) * W, y, 0);
      default: return V(0, y, 0);
    }
  };

  return { group: g, width: W, depth: D, height: top + 2, floorRange, hotspotPosition };
}
