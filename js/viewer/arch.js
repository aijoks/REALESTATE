// Procedural model of a narrow seven-storey loft with an arched storefront,
// matched to photos of 12 E 44th St:
//   - ground floor: stone piers and one wide round arch filled with a
//     gridded glass fan over the shopfront; orange Delicacy sign band and a
//     small awning over the entrance
//   - carved stone frieze; stone 2nd floor with three windows between slim
//     pilasters (SS decals) under a dentil cornice; blue flag
//   - five floors of pale glazed brick, three windows each (wider centre),
//     dark frames and continuous stone sill ledges
//   - corbelled brick cornice of small arches with a stone coping
import * as THREE from 'three';
import { grime, textTexture, rand } from './textures.js';
import { V, C, face, piece, brickMaterial, wall, createKit, addFireEscape } from './kit.js';

export function buildArchLoft(params) {
  const { width: W = 7.6, depth: D = 31 } = params;

  const r = rand(1905);
  const g1 = 5.9;
  const g2 = 4.0;
  const frieze = 0.7;
  const baseH = g1 + frieze + g2;
  const FH = 3.4;
  const floors = 5;
  const wallTop = baseH + floors * FH;
  const top = wallTop + 1.5;

  const g = new THREE.Group();
  g.name = 'building';
  const { matStone, matSteel, I, opening, add, stoneBox, finish } = createKit(g, r);
  const matBrick = brickMaterial('glazed', grime('arch', { seed: 44, streaks: 16, strength: 0.18 }));
  matBrick.normalScale.set(0.3, 0.3); // smooth glazed face, not rough brick
  const matCommon = (seed) => brickMaterial('common', grime(`archcommon${seed}`, { seed, streaks: 50, strength: 0.7 }));
  const matBase = matStone.clone();
  matBase.color = new THREE.Color('#d9d1c2');
  const frame = '#2b2522';
  const front = D / 2;

  // =====================================================================
  // GROUND FLOOR: stone piers and a single wide arch
  // =====================================================================
  const pier = 0.6;
  const span = W - 2 * pier;
  const R = span / 2;
  const apex = g1 - 0.25;
  const spring = apex - R;
  const Fb = face(0, -W / 2, 0, front);
  {
    // Stone front with an arched opening.
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(W, 0); s.lineTo(W, g1); s.lineTo(0, g1); s.closePath();
    const h = new THREE.Path();
    h.moveTo(pier, 0.12); h.lineTo(pier + span, 0.12); h.lineTo(pier + span, spring);
    h.absarc(W / 2, spring, R, 0, Math.PI, false);
    h.lineTo(pier, 0.12);
    s.holes.push(h);
    const m = new THREE.Mesh(new THREE.ShapeGeometry(s, 24), matBase);
    m.applyMatrix4(Fb);
    m.castShadow = m.receiveShadow = true;
    add(m);
    // Arch reveal (thickness of the wall around the opening).
    const ring = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.4, 32, 1, true, -Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: '#b9b1a3', roughness: 0.85, side: THREE.DoubleSide }));
    ring.rotation.x = Math.PI / 2;
    ring.position.set(0, spring, front - 0.2);
    add(ring);
    // Keystone and voussoir band.
    const band = new THREE.Mesh(new THREE.TorusGeometry(R + 0.12, 0.13, 6, 32, Math.PI), matStone);
    band.position.set(0, spring, front + 0.04);
    add(band);
    stoneBox(0.5, 0.6, 0.25, 0, apex + 0.05, front + 0.1);
  }
  // Shopfront below the spring line, and the gridded glass fan above it.
  const shop = { x: W / 2, y: 0.12 + (spring - 0.12) / 2, w: span - 0.05, h: spring - 0.12, kind: 'grid', cols: 4, transom: 0, room: 'shop', frame: '#1c1c1c', reveal: '#b9b1a3', rd: 0.35, sill: false, roomDepth: 4 };
  opening(Fb, shop);
  {
    const fan = new THREE.Shape();
    fan.moveTo(-R, 0); fan.absarc(0, 0, R, Math.PI, 0, true); fan.lineTo(-R, 0);
    const glass = new THREE.Mesh(new THREE.ShapeGeometry(fan, 24), new THREE.MeshPhysicalMaterial({ color: '#2a3036', roughness: 0.05, metalness: 0.1, envMapIntensity: 1.6 }));
    glass.position.set(0, spring, front - 0.33);
    add(glass);
    const room = new THREE.Mesh(new THREE.BoxGeometry(span, R, 3), new THREE.MeshBasicMaterial({ color: '#c79a62', side: THREE.BackSide }));
    room.position.set(0, spring + R / 2, front - 1.9);
    add(room);
    // Muntins clipped to the arch.
    const M = (x, y, sx, sy) => I.frame.add(piece(new THREE.Matrix4(), x, y, front - 0.3, sx, sy, 0.05), '#1c1c1c');
    for (let x = -R + 0.55; x < R; x += 0.55) {
      const hgt = Math.sqrt(Math.max(0, R * R - x * x));
      M(x, spring + hgt / 2, 0.05, hgt);
    }
    for (let y = 0.5; y < R; y += 0.5) {
      const half = Math.sqrt(R * R - y * y);
      M(0, spring + y, half * 2, 0.05);
    }
    M(0, spring, span, 0.12);
  }
  // Orange Delicacy sign band at the spring line; awning over the door.
  {
    const tex = textTexture({
      width: 1024, height: 160, bg: '#e8682c',
      draw(ctx, w, h) {
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '800 96px Arial, sans-serif';
        const full = 'DELICACY';
        const wid = ctx.measureText(full).width;
        let x = w / 2 - wid / 2;
        ctx.textAlign = 'left';
        for (const [t, c] of [['DELI', '#ffffff'], ['CACY', '#7fd34a']]) { ctx.fillStyle = c; ctx.fillText(t, x, h / 2 + 4); x += ctx.measureText(t).width; }
      },
    });
    const sign = new THREE.Mesh(new THREE.PlaneGeometry(span, 0.6), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: 0.25 }));
    sign.position.set(0, spring - 0.2, front - 0.2);
    add(sign);
    const awnTex = textTexture({ text: 'DELICACY  (212) 697-4444', width: 1024, height: 128, bg: '#16181b', ink: '#ffffff', font: '700 60px Arial, sans-serif' });
    const awn = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.45, 1.6), [matSteel, matSteel, matSteel, matSteel, new THREE.MeshStandardMaterial({ map: awnTex, roughness: 0.5 }), matSteel]);
    awn.position.set(-W / 2 + 1.5, 2.6, front + 0.8);
    awn.castShadow = true;
    add(awn);
    const num = textTexture({ text: '12', width: 128, height: 96, bg: '#1d1d1d', ink: '#e9e3d6', font: '600 64px Georgia, serif' });
    const n = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.3), new THREE.MeshStandardMaterial({ map: num, roughness: 0.5 }));
    n.position.set(-W / 2 + 0.3, 2.3, front + 0.01);
    add(n);
  }

  // =====================================================================
  // CARVED FRIEZE + STONE 2ND FLOOR
  // =====================================================================
  stoneBox(W + 0.15, frieze, 0.25, 0, g1 + frieze / 2, front + 0.1);
  for (let x = -W / 2 + 0.2; x < W / 2; x += 0.32) I.trim.add(piece(new THREE.Matrix4(), x, g1 + frieze / 2, front + 0.24, 0.2, frieze - 0.25, 0.05), '#bcb1a0');
  const F2 = face(0, -W / 2, g1 + frieze, D / 2);
  const w2 = [{ x: 1.25, w: 1.6 }, { x: W / 2, w: 2.2 }, { x: W - 1.25, w: 1.6 }];
  const holes2 = w2.map((o) => ({ ...o, y: g2 / 2 - 0.1, h: 2.7, kind: 'dh', frame, reveal: '#a59c8c', rd: 0.3, sill: false }));
  add(wall(F2, W, g2, holes2, matBase));
  holes2.forEach((o) => opening(F2, o));
  for (const x of [2.32, W - 2.32]) I.trim.add(piece(F2, x, g2 / 2 - 0.1, 0.1, 0.22, 2.9, 0.2), '#cfc6b6');
  {
    const ss = textTexture({
      width: 256, height: 256, bg: 'rgba(0,0,0,0)',
      draw(ctx, w, h) { ctx.strokeStyle = '#f4f4f4'; ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(w / 2, h / 2, 90, 0, Math.PI * 2); ctx.stroke(); ctx.fillStyle = '#f4f4f4'; ctx.font = '600 100px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SS', w / 2, h / 2 + 6); },
    });
    for (const x of [1.25, W - 1.25]) {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), new THREE.MeshBasicMaterial({ map: ss, transparent: true, depthWrite: false }));
      d.position.set(-W / 2 + x, g1 + frieze + 2.0, front - 0.26);
      add(d);
    }
  }
  stoneBox(W + 0.4, 0.35, 0.55, 0, baseH - 0.05, front + 0.2);
  for (let x = -W / 2 + 0.1; x < W / 2 + 0.1; x += 0.28) I.trim.add(piece(new THREE.Matrix4(), x, baseH - 0.32, front + 0.32, 0.13, 0.18, 0.3), '#d3c9b8');
  // Blue flag on an angled pole from the 2nd floor.
  {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 3.0, 8), matSteel);
    pole.position.set(-W / 2 + 3.4, baseH + 0.2, front + 1.0);
    pole.rotation.set(0.75, 0, 0.12);
    add(pole);
    const ftex = textTexture({ lines: [{ text: '12', font: 'bold 60px Arial' }, { text: 'E 44', font: 'bold 44px Arial' }], width: 192, height: 512, bg: '#2a57b8', ink: '#fff' });
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 2.1), new THREE.MeshStandardMaterial({ map: ftex, side: THREE.DoubleSide, roughness: 0.7 }));
    flag.position.set(-W / 2 + 3.25, baseH - 1.1, front + 1.75);
    flag.rotation.y = Math.PI / 2;
    add(flag);
  }

  // =====================================================================
  // GLAZED-BRICK UPPER FLOORS + CORBELLED CORNICE
  // =====================================================================
  const Fu = face(0, -W / 2, baseH, D / 2);
  const upperH = top - baseH;
  const holes = [];
  for (let f = 0; f < floors; f++) {
    const y = f * FH + 0.6 + 1.3;
    for (const [x, w] of [[1.12, 1.4], [W / 2, 2.05], [W - 1.12, 1.4]]) {
      holes.push({ x, y, w, h: 2.6, kind: 'dh', frame, reveal: '#8f8c86', rd: 0.25, sill: false, header: '#bcb7ae' });
    }
  }
  add(wall(Fu, W, upperH, holes, matBrick));
  holes.forEach((o) => opening(Fu, o));
  for (let f = 0; f < floors; f++) {
    stoneBox(W - 0.4, 0.16, 0.22, 0, baseH + f * FH + 0.55, front + 0.11); // continuous sill ledge
  }
  // Corbel table: a row of small brick arches under a stone coping.
  for (let x = -W / 2 + 0.35; x < W / 2 - 0.2; x += 0.5) {
    const a = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.06, 6, 10, Math.PI), new THREE.MeshStandardMaterial({ color: '#c9c6bd', roughness: 0.9 }));
    a.position.set(x + 0.25, wallTop + 0.6, front + 0.12);
    add(a);
    I.trim.add(piece(new THREE.Matrix4(), x, wallTop + 0.45, front + 0.12, 0.12, 0.5, 0.22), '#c9c6bd');
  }
  stoneBox(W + 0.3, 0.3, 0.45, 0, wallTop + 0.95, front + 0.12);
  stoneBox(W + 0.5, 0.22, 0.6, 0, top - 0.1, front + 0.12);

  // =====================================================================
  // PARTY WALLS, REAR, ROOF
  // =====================================================================
  add(wall(face(Math.PI / 2, W / 2, 0, D / 2), D, top, [], matCommon(1)));
  add(wall(face(-Math.PI / 2, -W / 2, 0, -D / 2), D, top, [], matCommon(2)));
  const Fr = face(Math.PI, W / 2, 0, -D / 2);
  const rear = [];
  for (let f = 0; f < floors + 1; f++) for (const x of [1.8, 5.8]) rear.push({ x, y: g1 + 1.8 + f * FH, w: 1.3, h: 2.2, kind: 'dh', reveal: C.revealCommon, sillColor: '#b3a999' });
  add(wall(Fr, W, top, rear, matCommon(3)));
  rear.forEach((o) => opening(Fr, o));
  addFireEscape(I, { x0: -W / 2 + 0.8, x1: -W / 2 + 5.6, z: -D / 2, levels: [...Array(floors + 1).keys()].map((f) => g1 + 0.7 + f * FH) });
  {
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: '#4f4b48', roughness: 1 }));
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = top - 0.6;
    roof.receiveShadow = true;
    add(roof);
    const bulk = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.0, 5), matCommon(4));
    bulk.position.set(0, top + 0.9, -D / 2 + 6);
    bulk.castShadow = true;
    add(bulk);
  }

  finish();

  const floorRange = (n) => {
    if (n <= 1) return [0, g1];
    if (n === 2) return [g1 + frieze, baseH];
    const y0 = baseH + (n - 3) * FH;
    return [y0, y0 + FH];
  };
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * top;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, D / 2 + 1.0);
      case 'back': return V((0.5 - u) * W, y, -D / 2 - 0.9);
      case 'roof': return V((u - 0.5) * W, y, 0);
      default: return V(0, y, 0);
    }
  };

  return { group: g, width: W, depth: D, height: top + 2, floorRange, hotspotPosition };
}
