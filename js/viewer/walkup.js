// Procedural model of a 1920 six-storey corner walk-up (residential over
// ground-floor retail), matched to street photos of 370 W 51st St and the
// NYC/OSM footprint: a 30.7 m long face on W 51st St and a 7.7 m end on
// Ninth Avenue (the eastern 23 m is only 5.8 m deep), roof at ~20 m.
//   - buff/tan brick, stone sills and lintels, darker brick quoins at the
//     Ninth Avenue corners
//   - 51st St (front, +z), east to west: shop with a red-brick base and a
//     small round yellow sign; Briciola (dark wood and glass, red door frame,
//     sidewalk cafe); the residential entrance in a dark stone surround with
//     two lanterns; plain brick with a black service door and bins; Monkey
//     Thief (neon monkey-face mural, black awning, glass front) at the corner
//   - 11 window bays in irregular groups, a shallow pier near the middle and a
//     two-bay fire escape left of it
//   - Ninth Avenue (west, +x): five bays, fire escape over the four nearest
//     the corner with a drop ladder; coral-painted 'ritas storefront with a
//     dark cornice band, two black awning strips and a central black door
//   - brick parapet with stone cap; pierced panels at the Ninth Ave ends
import * as THREE from 'three';
import { grime, textTexture, rand } from './textures.js';
import { V, face, piece, brickMaterial, wall, createKit, addFireEscape } from './kit.js';

export function buildWalkup(params) {
  const { width: W = 30.7, depth: D = 7.7 } = params;

  const r = rand(1920);
  const g1 = 4.3;
  const FH = 3.05;
  const floors = 5;
  const wallTop = g1 + floors * FH;
  const parapet = 0.9;
  const top = wallTop + parapet;
  const avW = 7.8; // the Ninth Avenue wing runs the full depth
  const shallow = 5.8; // depth of the rest of the 51st St range
  const xStep = W / 2 - avW;

  const g = new THREE.Group();
  g.name = 'building';
  const { matStone, matSteel, I, opening, add, stoneBox, finish } = createKit(g, r);
  // Buff / tan face brick (street photos): cream brick warmed toward tan.
  const matBrick = brickMaterial('cream', grime('walkup', { seed: 51, streaks: 40, strength: 0.35 }));
  matBrick.color.set('#e4cfa4');
  const matCommon = (seed) => brickMaterial('common', grime(`walkcommon${seed}`, { seed, streaks: 50, strength: 0.7 }));
  const frame = '#2a2725';
  const lintel = '#d6ccb8';
  const front = D / 2;
  const rearE = front - shallow;
  const win = (x, f, w = 0.95) => ({ x, y: g1 + f * FH + 0.85 + 0.85, w, h: 1.7, kind: 'dh', frame, reveal: '#8a7a64', rd: 0.18, sillColor: lintel, header: lintel });
  const ac = (F, x, f) => { if (r() < 0.22) I.trim.add(piece(F, x, g1 + f * FH + 1.05, 0.25, 0.7, 0.42, 0.5), '#e4e4e0'); };
  const plate = (F, x, y, z, w, h, tex, basic = false) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic ? new THREE.MeshBasicMaterial({ map: tex, transparent: true }) : new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55 }));
    m.applyMatrix4(piece(F, x, y, z, 1, 1, 1));
    return add(m);
  };
  const box = (F, x, y, z, w, h, d, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.applyMatrix4(piece(F, x, y, z, 1, 1, 1));
    m.castShadow = true;
    return add(m);
  };
  const black = new THREE.MeshStandardMaterial({ color: '#161616', roughness: 0.55 });

  // =====================================================================
  // 51st STREET FACADE (front, +z); local x runs east -> west (corner)
  // =====================================================================
  const Ff = face(0, -W / 2, 0, front);
  const fx = [2.15, 5.1, 7.1, 10.0, 12.4, 14.4, 17.1, 20.0, 22.8, 24.8, 27.6];
  const fHoles = [
    // Shop with a red-brick base.
    { x: 2.7, y: 2.35, w: 4.4, h: 2.9, kind: 'grid', cols: 3, transom: 0.5, room: 'warm', blinds: false, frame: '#22201e', reveal: '#3a2a22', rd: 0.25, sill: false, roomDepth: 3 },
    // Briciola: dark wood and glass front, red-framed door.
    { x: 7.0, y: 1.8, w: 2.9, h: 3.3, kind: 'grid', cols: 2, transom: 0.7, room: 'shop', frame: '#3b2a1f', reveal: '#2a1f18', rd: 0.25, sill: false, roomDepth: 4 },
    { x: 9.25, y: 1.6, w: 1.2, h: 2.9, kind: 'french', room: 'shop', frame: '#b3261e', reveal: '#2a1f18', rd: 0.3, sill: false },
    { x: 11.1, y: 1.8, w: 2.0, h: 3.3, kind: 'grid', cols: 2, transom: 0.7, room: 'shop', frame: '#3b2a1f', reveal: '#2a1f18', rd: 0.25, sill: false, roomDepth: 4 },
    // Residential entrance.
    { x: 13.8, y: 1.6, w: 1.3, h: 2.9, kind: 'lobby', room: 'lobby', frame: '#111111', reveal: '#2b2826', rd: 0.35, sill: false },
    // Service door.
    { x: 17.4, y: 1.25, w: 1.05, h: 2.3, kind: 'panel', panel: '#1b1b1b', reveal: '#3a332c', rd: 0.12, sill: false },
    // Monkey Thief glass front at the corner.
    { x: 29.2, y: 1.75, w: 2.4, h: 3.1, kind: 'grid', cols: 2, transom: 0.6, room: 'warm', blinds: false, frame: '#141414', reveal: '#1a1a1d', rd: 0.25, sill: false, roomDepth: 4 },
  ];
  for (let f = 0; f < floors; f++) for (const x of fx) fHoles.push(win(x, f));
  add(wall(Ff, W, top, fHoles, matBrick));
  fHoles.forEach((o) => opening(Ff, o));
  for (let f = 0; f < floors; f++) for (const x of fx) ac(Ff, x, f);
  // Shallow pier near the middle.
  box(Ff, 13.25, (g1 + top) / 2, 0.06, 0.55, top - g1, 0.12, matBrick);
  // Fire escape over bays 4-5 with a drop ladder to the first floor.
  const levels = [...Array(floors).keys()].map((f) => g1 + f * FH + 0.8);
  // (Helper rotated 180 degrees so the balconies project north.)
  addFireEscape(I, { x0: W / 2 - 13.0, x1: W / 2 - 8.9, z: -front, levels, frame: new THREE.Matrix4().makeRotationY(Math.PI) });
  for (const dx of [0, 0.42]) I.steel.add(piece(Ff, 9.2 + dx, g1 - 0.4, 0.95, 0.04, 2.6, 0.04));
  for (let y = g1 - 1.6; y < g1 + 0.8; y += 0.3) I.steel.add(piece(Ff, 9.41, y, 0.95, 0.42, 0.03, 0.03));

  {
    // Shop: red-brick base, dark sign band and the round yellow sign.
    I.trim.add(piece(Ff, 2.7, 0.45, 0.05, 4.7, 0.9, 0.12), '#8a4a36');
    I.trim.add(piece(Ff, 2.7, 4.1, 0.05, 4.9, 0.5, 0.1), '#2b2420');
    const yel = textTexture({ width: 128, height: 128, bg: 'rgba(0,0,0,0)', draw(ctx, w, h) { ctx.fillStyle = '#f2b81c'; ctx.beginPath(); ctx.arc(w / 2, h / 2, 60, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#b3261e'; ctx.font = 'bold 30px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('CAFE', w / 2, h / 2); } });
    plate(Ff, 1.2, 4.05, 0.12, 0.6, 0.6, yel, true);

    // Briciola: dark wood fascia, small red sign, red door frame, cafe.
    const wood = new THREE.MeshStandardMaterial({ color: '#2e2219', roughness: 0.6 });
    box(Ff, 8.65, 3.85, 0.08, 7.0, 0.7, 0.16, wood);
    I.trim.add(piece(Ff, 8.65, 0.08, 0.05, 7.0, 0.16, 0.1), '#2e2219');
    const bri = textTexture({ text: 'BRICIOLA', width: 512, height: 96, bg: '#a8231d', ink: '#f6efe2', font: '600 56px Georgia, serif' });
    plate(Ff, 7.0, 3.85, 0.17, 1.4, 0.26, bri);
    for (const dx of [-0.7, 0.7]) I.trim.add(piece(Ff, 9.25 + dx, 1.6, 0.06, 0.14, 3.0, 0.1), '#b3261e');

    // Residential entrance: dark stone surround and two lanterns.
    for (const dx of [-0.95, 0.95]) I.trim.add(piece(Ff, 13.8 + dx, 1.85, 0.06, 0.5, 3.7, 0.14), '#3d3631');
    I.trim.add(piece(Ff, 13.8, 3.75, 0.08, 2.5, 0.45, 0.18), '#3d3631');
    for (const dx of [-1.5, 1.5]) {
      I.steel.add(piece(Ff, 13.8 + dx, 2.4, 0.15, 0.22, 0.38, 0.22));
      I.trim.add(piece(Ff, 13.8 + dx, 2.4, 0.27, 0.14, 0.26, 0.02), '#f4dca0');
    }

    // Monkey Thief: dark front with a neon monkey mural, black awning.
    const mural = textTexture({
      width: 1024, height: 560, bg: '#18141d',
      draw(ctx, w, h) {
        for (let i = 0; i < 160; i++) {
          ctx.fillStyle = ['#7a1f2c', '#2f5a34', '#a83a3a', '#3c2a4f', '#c75c4a'][i % 5];
          ctx.globalAlpha = 0.55;
          ctx.beginPath(); ctx.arc(r() * w, r() * h, 10 + r() * 26, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
        ctx.shadowColor = '#e04cff'; ctx.shadowBlur = 18; ctx.strokeStyle = '#d65cff'; ctx.lineWidth = 12;
        const cx = w * 0.42; const cy = h * 0.52;
        ctx.beginPath(); ctx.ellipse(cx, cy, 190, 230, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = '#ff6ec7'; ctx.lineWidth = 9;
        ctx.beginPath(); ctx.arc(cx, cy - 40, 105, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.ellipse(cx, cy + 110, 70, 55, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx - 230, cy - 30, 55, 0, Math.PI * 2); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx + 230, cy - 30, 55, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = '#ffd9ff'; ctx.font = '800 92px Arial, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText('MT', cx, cy - 40);
        ctx.shadowBlur = 0; ctx.fillStyle = '#ffffff'; ctx.font = '800 50px Arial, sans-serif';
        ctx.fillText('MONKEY THIEF', w * 0.83, 52);
      },
    });
    I.trim.add(piece(Ff, 27.05, 2.05, 0.03, 7.3, 4.1, 0.04), '#18141d');
    plate(Ff, 26.4, 2.1, 0.06, 5.8, 3.2, mural);
    const awn = box(Ff, 27.05, g1 - 0.2, 0.45, 7.4, 0.25, 0.9, black);
    awn.receiveShadow = true;
  }

  // =====================================================================
  // NINTH AVENUE FACADE (west, +x); local x runs from the corner south
  // =====================================================================
  const Fw = face(Math.PI / 2, W / 2, 0, front);
  const wx = [1.0, 2.3, 3.85, 5.35, 6.6];
  const coral = '#e39a80';
  const wHoles = [
    { x: 1.5, y: 2.05, w: 2.5, h: 2.3, kind: 'grid', cols: 4, transom: 0.01, room: 'warm', blinds: false, frame: '#141414', reveal: '#1d1d1d', rd: 0.2, sill: false },
    { x: 3.4, y: 1.55, w: 1.05, h: 2.9, kind: 'lobby', room: 'warm', frame: '#141414', reveal: '#1d1d1d', rd: 0.25, sill: false },
    { x: 5.35, y: 2.05, w: 2.5, h: 2.3, kind: 'grid', cols: 4, transom: 0.01, room: 'warm', blinds: false, frame: '#141414', reveal: '#1d1d1d', rd: 0.2, sill: false },
  ];
  for (let f = 0; f < floors; f++) for (const x of wx) wHoles.push(win(x, f, 0.9));
  add(wall(Fw, D, top, wHoles, matBrick));
  wHoles.forEach((o) => opening(Fw, o));
  for (let f = 0; f < floors; f++) for (const x of wx) ac(Fw, x, f);
  {
    // Coral-painted shopfront around the openings, black panelled base.
    for (const [x0, x1] of [[0, 0.25], [2.75, 2.87], [3.93, 4.1], [6.6, D]]) I.trim.add(piece(Fw, (x0 + x1) / 2, 1.95, 0.03, x1 - x0, 3.9, 0.05), coral);
    I.trim.add(piece(Fw, D / 2, 3.65, 0.03, D, 0.7, 0.05), coral);
    for (const [cx, w] of [[1.5, 2.6], [5.35, 2.6]]) {
      I.trim.add(piece(Fw, cx, 0.45, 0.06, w, 0.9, 0.1), '#141414');
      for (let k = 0; k < 4; k++) I.trim.add(piece(Fw, cx - w / 2 + (k + 0.5) * (w / 4), 0.45, 0.12, w / 4 - 0.12, 0.6, 0.03), '#262626');
      box(Fw, cx, 3.35, 0.3, w + 0.1, 0.16, 0.6, black); // awning strip
    }
    I.trim.add(piece(Fw, D / 2, g1 - 0.12, 0.15, D + 0.1, 0.3, 0.3), '#2a2422'); // cornice band
    const ritas = textTexture({ text: "'ritas", width: 256, height: 80, bg: '#2a1a16', ink: '#e8322a', font: 'italic 700 54px Georgia, serif' });
    plate(Fw, 3.4, 3.35, 0.07, 1.3, 0.38, ritas);
    // Darker brick quoins at both corners, above the shopfront.
    for (const qx of [0.27, D - 0.27]) {
      for (let y = g1 + 0.1, k = 0; y < wallTop; y += 0.62, k++) I.trim.add(piece(Fw, qx + (k % 2 ? (qx < 1 ? -0.1 : 0.1) : 0), y + 0.15, 0.025, k % 2 ? 0.34 : 0.54, 0.3, 0.04), '#8f6f4d');
    }
  }
  for (let y = g1 + 0.1, k = 0; y < wallTop; y += 0.62, k++) I.trim.add(piece(Ff, W - 0.27 + (k % 2 ? 0.1 : 0), y + 0.15, 0.025, k % 2 ? 0.34 : 0.54, 0.3, 0.04), '#8f6f4d');
  // Fire escape over the four bays nearest the corner (rotated helper:
  // world z = local x), drop ladder above the shop.
  const escFrame = new THREE.Matrix4().makeRotationY(-Math.PI / 2);
  addFireEscape(I, { x0: front - 5.95, x1: front - 0.45, z: -W / 2, levels, frame: escFrame });
  for (const dz of [0, 0.42]) I.steel.add(piece(Fw, 4.4 + dz, g1 - 0.2, 0.95, 0.04, 2.2, 0.04));
  for (let y = g1 - 1.2; y < g1 + 0.8; y += 0.3) I.steel.add(piece(Fw, 4.61, y, 0.95, 0.42, 0.03, 0.03));

  // =====================================================================
  // PARAPET: stone cap; pierced end panels on Ninth Ave, small panels on 51st
  // =====================================================================
  for (const [w, x, z, ry] of [[W, 0, front, 0], [D, W / 2, 0, Math.PI / 2]]) {
    for (const y of [wallTop + 0.05, top - 0.08]) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w + 0.1, y === top - 0.08 ? 0.2 : 0.18, 0.28), matStone);
      b.position.set(x + (ry ? 0.08 : 0), y, z + (ry ? 0 : 0.08));
      b.rotation.y = ry;
      b.castShadow = true;
      add(b);
    }
  }
  for (const [x0, x1] of [[0.1, 2.1], [D - 2.1, D - 0.1]]) {
    box(Fw, (x0 + x1) / 2, top + 0.2, 0.0, x1 - x0, 0.6, 0.3, matBrick);
    stoneBox(0.34, 0.12, x1 - x0 + 0.1, W / 2 + 0.02, top + 0.55, front - (x0 + x1) / 2);
    for (let k = 0; k < 6; k++) I.trim.add(piece(Fw, x0 + 0.22 + k * ((x1 - x0 - 0.44) / 5), wallTop + 0.55, 0.02, 0.13, 0.36, 0.04), '#1e1a17');
  }
  stoneBox(0.2, 0.35, 2.8, W / 2 + 0.08, wallTop + 0.5, front - D / 2); // plain band in the middle
  for (let x = 2.5; x < W - 1; x += 5.1) I.trim.add(piece(Ff, x, wallTop + 0.5, 0.04, 0.9, 0.35, 0.06), lintel);
  for (let k = 0; k < 5; k++) I.trim.add(piece(Ff, W - 1.9 + k * 0.38, wallTop + 0.55, 0.02, 0.13, 0.36, 0.04), '#1e1a17');

  // =====================================================================
  // PARTY WALL, REAR (L-shaped), ROOF
  // =====================================================================
  add(wall(face(-Math.PI / 2, -W / 2, 0, rearE), shallow, top, [], matCommon(2)));
  const rear = (F, len, seed) => {
    const h = [];
    for (let f = 0; f < floors; f++) for (let x = 1.4; x < len - 0.8; x += 2.9) h.push({ x, y: g1 + f * FH + 1.7, w: 0.9, h: 1.6, kind: 'dh', reveal: '#6e6253', sillColor: '#b3a999' });
    add(wall(F, len, top, h, matCommon(seed)));
    h.forEach((o) => opening(F, o));
  };
  rear(face(Math.PI, xStep, 0, rearE), xStep + W / 2, 3);
  rear(face(Math.PI, W / 2, 0, -D / 2), avW, 5);
  add(wall(face(-Math.PI / 2, xStep, 0, -D / 2), D - shallow, top, [], matCommon(6)));
  {
    const roofMat = new THREE.MeshStandardMaterial({ color: '#2f2d2c', roughness: 1 });
    for (const [x0, x1, z0] of [[-W / 2, xStep, rearE], [xStep, W / 2, -D / 2]]) {
      const roof = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, front - z0), roofMat);
      roof.rotation.x = -Math.PI / 2;
      roof.position.set((x0 + x1) / 2, wallTop, (front + z0) / 2);
      roof.receiveShadow = true;
      add(roof);
    }
    for (const [bx, bw, bd] of [[-4.5, 3.0, 3.6], [10.5, 2.6, 3.2]]) {
      const bulk = new THREE.Mesh(new THREE.BoxGeometry(bw, 2.6, bd), matCommon(4));
      bulk.position.set(bx, wallTop + 1.3, rearE + bd / 2 + 0.3);
      bulk.castShadow = true;
      add(bulk);
    }
    for (const x of [-12, -1, 6]) {
      const ch = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 0.7), matCommon(7));
      ch.position.set(x, wallTop + 0.8, rearE + 0.5);
      add(ch);
    }
    for (let i = 0; i < 4; i++) {
      const v = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.9, 8), matSteel);
      v.position.set(-10 + i * 6.5 + r() * 2, wallTop + 0.45, 0.2 + r() * 2);
      add(v);
    }
  }

  // =====================================================================
  // SIDEWALK: Briciola cafe tables, bins, street trees
  // =====================================================================
  {
    const rattan = new THREE.MeshStandardMaterial({ color: '#8a5a33', roughness: 0.8 });
    const marble = new THREE.MeshStandardMaterial({ color: '#efece6', roughness: 0.4 });
    for (const x of [-10.0, -8.4, -6.8, -5.2]) {
      const t = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.05, 14), marble);
      t.position.set(x, 0.92, front + 1.5);
      add(t);
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.75, 6), black);
      leg.position.set(x, 0.53, front + 1.5);
      add(leg);
      for (const dx of [-0.55, 0.55]) {
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.85, 0.42), rattan);
        c.position.set(x + dx, 0.58, front + 1.5);
        c.castShadow = true;
        add(c);
      }
    }
    for (let x = 3.6; x < 8.3; x += 1.2) {
      const bin = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.15, 0.8), black);
      bin.position.set(x, 0.75, front + 0.55);
      bin.castShadow = true;
      add(bin);
    }
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
