// Procedural model of a narrow Beaux-Arts loft building, matched to photos of
// 102 W 38th St:
//   - two-storey limestone base: entrance with console brackets, pediment and
//     "102" on the left; small shopfront, service door and the B&Q Trimmings
//     shop (red sign, brass doors) to the right; a 4-window 2nd floor in a
//     dark frame between side windows under carved corbels; modillion belt
//   - seven office floors: light stone side piers with one window each,
//     framing a recessed dark-brown centre bay of four windows per floor with
//     ornamented spandrel panels; diagonal flagpole
//   - attic of four arched windows, cartouche frieze and a deep bracketed
//     cornice; bronze "Managed by First Pioneer" plaque at the door
import * as THREE from 'three';
import { grime, textTexture, rand } from './textures.js';
import { V, C, face, piece, brickMaterial, wall, createKit, addFireEscape } from './kit.js';

export function buildNarrowLoft(params) {
  const { width: W = 12.5, depth: D = 30 } = params;

  const r = rand(1910);
  const g1 = 4.8;
  const g2 = 4.0;
  const baseH = g1 + g2;
  const FH = 3.5;
  const floors = 7;
  const atticH = 3.4;
  const shaftTop = baseH + floors * FH;
  const atticTop = shaftTop + atticH;
  const top = atticTop + 1.3;

  const g = new THREE.Group();
  g.name = 'building';
  const { matStone, matSteel, I, opening, add, stoneBox, finish } = createKit(g, r);
  const matSide = brickMaterial('cream', grime('narrow', { seed: 102, streaks: 90, strength: 1.1 }));
  const matCommon = (seed) => brickMaterial('common', grime(`narrowcommon${seed}`, { seed, streaks: 50, strength: 0.7 }));
  const matBase = matStone.clone();
  matBase.color = new THREE.Color('#e6dccb');
  const brown = '#4a3127';
  const frame = '#2b211c';
  const side = 2.45; // side bay width
  const cw = W - 2 * side; // dark centre bay
  const cx = [-1.5, -0.5, 0.5, 1.5].map((k) => W / 2 + k * (cw / 4));
  const cww = cw / 4 - 0.34;

  // =====================================================================
  // LIMESTONE BASE
  // =====================================================================
  const Fb = face(0, -W / 2, 0, D / 2);
  const baseHoles = [
    { x: 1.3, y: 0.12 + 1.6, w: 1.5, h: 3.2, kind: 'lobby', room: 'lobby', frame: '#8a6a2c', reveal: '#9c9384', rd: 0.5, sill: false, roomDepth: 4 },
    { x: 3.2, y: 0.12 + 1.55, w: 1.1, h: 3.1, kind: 'shop', room: 'warm', frame: '#8a6a2c', reveal: '#9c9384', rd: 0.25, sill: false },
    { x: 4.75, y: 0.12 + 1.1, w: 0.95, h: 2.2, kind: 'panel', panel: '#3a3433', reveal: '#9c9384', rd: 0.12, sill: false },
    { x: 7.7, y: 0.12 + 1.6, w: 2.6, h: 3.2, kind: 'shop', room: 'shop', frame: '#9c7a2e', reveal: '#9c9384', rd: 0.25, sill: false },
    { x: 9.95, y: 0.12 + 1.6, w: 1.2, h: 3.2, kind: 'lobby', room: 'shop', frame: '#b48a2e', reveal: '#9c9384', rd: 0.25, sill: false },
    { x: 1.2, y: g1 + 1.95, w: 1.1, h: 2.3, kind: 'dh', frame, reveal: '#9c9384', sillColor: '#e2d8c6' },
    { x: W - 1.2, y: g1 + 1.95, w: 1.1, h: 2.3, kind: 'dh', frame, reveal: '#9c9384', sillColor: '#e2d8c6' },
  ];
  for (const x of cx) baseHoles.push({ x, y: g1 + 1.95, w: cww, h: 2.6, kind: 'dh', frame, reveal: brown, rd: 0.3, sillColor: '#e2d8c6' });
  add(wall(Fb, W, baseH, baseHoles, matBase));
  baseHoles.forEach((o) => opening(Fb, o));
  // Dark frame and ornamented mullions around the 2nd-floor centre windows.
  I.trim.add(piece(Fb, W / 2, g1 + 1.95, 0.03, cw + 0.3, 3.0, 0.06), brown);
  for (let k = 1; k < 4; k++) I.trim.add(piece(Fb, W / 2 + (k - 2) * (cw / 4), g1 + 1.95, 0.08, 0.28, 2.7, 0.1), '#5b3d30');
  // Carved corbels over the side windows and at the centre frame.
  for (const x of [0.55, 1.85, side + 0.2, W - side - 0.2, W - 1.85, W - 0.55]) {
    I.trim.add(piece(Fb, x, g1 + 3.45, 0.16, 0.34, 0.75, 0.3), '#ddd2be');
  }
  // Modillion belt course over the base.
  stoneBox(W + 0.3, 0.45, 0.5, 0, baseH + 0.05, D / 2 + 0.2);
  for (let x = -W / 2 + 0.25; x < W / 2; x += 0.45) I.trim.add(piece(new THREE.Matrix4(), x, baseH - 0.32, D / 2 + 0.25, 0.16, 0.26, 0.4), '#d8cdb8');
  // Entrance surround: console brackets and a small pediment, "102" plate.
  stoneBox(0.42, 2.0, 0.5, -W / 2 + 0.3, 2.9, D / 2 + 0.25);
  stoneBox(0.42, 2.0, 0.5, -W / 2 + 2.3, 2.9, D / 2 + 0.25);
  stoneBox(2.6, 0.4, 0.6, -W / 2 + 1.3, 4.05, D / 2 + 0.3);
  // Shallow pediment: a low triangular prism sitting on the entablature.
  const tri = new THREE.Shape();
  tri.moveTo(-1.35, 0); tri.lineTo(1.35, 0); tri.lineTo(0, 0.45); tri.closePath();
  const pedGeo = new THREE.ExtrudeGeometry(tri, { depth: 0.55, bevelEnabled: false });
  pedGeo.translate(0, 0, -0.275);
  const ped = new THREE.Mesh(pedGeo, matStone);
  ped.position.set(-W / 2 + 1.3, 4.25, D / 2 + 0.3);
  ped.castShadow = true;
  add(ped);
  {
    const num = textTexture({ text: '102', width: 256, height: 96, bg: '#c9a54a', ink: '#3a2a12', font: '600 66px Georgia, serif' });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.4), new THREE.MeshStandardMaterial({ map: num, roughness: 0.4, metalness: 0.6 }));
    m.position.set(-W / 2 + 1.3, 3.1, D / 2 - 0.37);
    add(m);
    // "Managed by First Pioneer" bronze plaque beside the door.
    const plaque = textTexture({
      width: 512, height: 340, bg: '#3a2f27',
      draw(ctx, w, h) {
        ctx.strokeStyle = '#c9a54a'; ctx.lineWidth = 14; ctx.strokeRect(7, 7, w - 14, h - 14);
        ctx.fillStyle = '#d8b766'; ctx.textAlign = 'center';
        ctx.font = '600 26px Georgia, serif'; ctx.fillText('M A N A G E D   B Y', w / 2, 62);
        for (let c = 0; c < 4; c++) for (let k = 0; k <= c; k++) ctx.fillRect(60 + c * 26, 210 - k * 26, 22, 22);
        ctx.textAlign = 'left'; ctx.font = '500 64px Georgia, serif';
        ctx.fillText('FIRST', 180, 150); ctx.fillText('PIONEER', 180, 215);
        ctx.font = '500 20px Georgia, serif'; ctx.fillText('P R O P E R T I E S ,  I N C .', 184, 262);
      },
    });
    const pl = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.03), [matSteel, matSteel, matSteel, matSteel, new THREE.MeshStandardMaterial({ map: plaque, roughness: 0.35, metalness: 0.7 }), matSteel]);
    pl.position.set(-W / 2 + 0.3, 1.6, D / 2 + 0.52);
    add(pl);
    // B&Q Trimmings sign.
    const sign = textTexture({
      width: 1024, height: 256, bg: '#a1161d',
      draw(ctx, w, h) {
        ctx.strokeStyle = '#f1e6dc'; ctx.lineWidth = 6; ctx.strokeRect(10, 10, w - 20, h - 20);
        ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '800 112px Arial, sans-serif'; ctx.fillText('B&Q TRIMMINGS', w / 2, h * 0.42);
        ctx.font = '600 36px Arial, sans-serif'; ctx.fillText('TRIMS  |  RHINESTONES  |  FEATHERS  |  BEADS', w / 2, h * 0.8);
      },
    });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.9), new THREE.MeshStandardMaterial({ map: sign, roughness: 0.5 }));
    s.position.set(-W / 2 + 8.6, 3.85, D / 2 + 0.03);
    add(s);
    // Diagonal flagpole from the 3rd floor.
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 4.2, 8), new THREE.MeshStandardMaterial({ color: '#1a1a1a', roughness: 0.5, metalness: 0.6 }));
    pole.position.set(-W / 2 + 7.1, baseH + 2.4, D / 2 + 1.3);
    pole.rotation.set(0.95, 0, -0.25);
    add(pole);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), new THREE.MeshStandardMaterial({ color: '#1a1a1a', metalness: 0.6, roughness: 0.4 }));
    ball.position.set(-W / 2 + 6.6, baseH + 0.95, D / 2 + 3.0);
    add(ball);
  }

  // =====================================================================
  // SHAFT: light side piers + recessed dark centre bay
  // =====================================================================
  const upperH = top - baseH;
  const Fs = face(0, -W / 2, baseH, D / 2);
  const sideHoles = [];
  const wy = (f) => f * FH + 0.55 + 1.15;
  for (let f = 0; f < floors; f++) {
    for (const x of [side / 2, W - side / 2]) {
      sideHoles.push({ x, y: wy(f), w: 1.05, h: 2.3, kind: 'dh', frame, reveal: '#a59b8a', sillColor: '#e2d8c6', header: '#d6ccb8' });
    }
  }
  // Side piers are one wall with the centre bay cut out (and window holes).
  sideHoles.push({ x: W / 2, y: (shaftTop - baseH) / 2, w: cw, h: shaftTop - baseH, kind: 'panel', panel: brown, reveal: brown, rd: 0.35, sill: false });
  add(wall(Fs, W, upperH, sideHoles, matSide));
  sideHoles.slice(0, -1).forEach((o) => opening(Fs, o));
  // The recessed centre bay: dark wall with four windows per floor.
  const Fc = face(0, -W / 2 + side, baseH, D / 2 - 0.35);
  const cHoles = [];
  for (let f = 0; f < floors; f++) {
    for (const x of cx) cHoles.push({ x: x - side, y: wy(f) + 0.1, w: cww, h: 2.45, kind: 'dh', frame, reveal: '#3a2620', rd: 0.18, sill: false });
  }
  const darkMat = new THREE.MeshStandardMaterial({ color: '#4e352b', roughness: 0.6, metalness: 0.25 });
  add(wall(Fc, cw, shaftTop - baseH, cHoles, darkMat));
  cHoles.forEach((o) => opening(Fc, o));
  // Ornamented spandrel panels, cornice ledges and slim mullions in the bay.
  for (let f = 0; f < floors; f++) {
    const y = f * FH + 0.27;
    I.trim.add(piece(Fc, cw / 2, y, 0.04, cw, 0.62, 0.08), '#5a3d31');
    I.trim.add(piece(Fc, cw / 2, y + 0.36, 0.1, cw, 0.1, 0.2), '#3e2a22');
    for (let k = 0; k < 4; k++) {
      const x = (k + 0.5) * (cw / 4);
      I.trim.add(piece(Fc, x, y, 0.09, cw / 4 - 0.5, 0.36, 0.04), '#6a4a3b');
    }
    for (let k = 1; k < 4; k++) I.trim.add(piece(Fc, k * (cw / 4), y + FH / 2 + 0.1, 0.06, 0.2, FH - 0.7, 0.12), '#3e2a22');
  }
  // Stone quoins / pier edges framing the dark bay.
  for (const x of [side - 0.12, W - side + 0.12]) I.trim.add(piece(Fs, x, (shaftTop - baseH) / 2, 0.05, 0.24, shaftTop - baseH, 0.1), '#d9cfbc');

  // =====================================================================
  // ATTIC, FRIEZE, BRACKETED CORNICE
  // =====================================================================
  const atticY = shaftTop - baseH;
  const Fa = face(0, -W / 2, shaftTop, D / 2);
  const aHoles = [];
  for (const x of cx) aHoles.push({ x, y: 1.3, w: cww * 0.9, h: 1.9, kind: 'dh', frame, reveal: '#9c9384', rd: 0.3, sillColor: '#e2d8c6' });
  for (const x of [side / 2, W - side / 2]) aHoles.push({ x, y: 1.3, w: 0.9, h: 1.8, kind: 'dh', frame, reveal: '#9c9384', sillColor: '#e2d8c6' });
  add(wall(Fa, W, atticH + 1.3, aHoles, matBase));
  aHoles.forEach((o) => opening(Fa, o));
  // Arched heads over the four centre attic windows, and a cartouche.
  for (const x of cx) {
    const arch = new THREE.Mesh(new THREE.TorusGeometry(cww * 0.48, 0.12, 8, 20, Math.PI), matStone);
    arch.position.set(-W / 2 + x, shaftTop + 2.25, D / 2 + 0.06);
    add(arch);
  }
  const cart = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 0.18, 24), matStone);
  cart.rotation.x = Math.PI / 2;
  cart.scale.set(1.6, 1, 0.9);
  cart.position.set(0, shaftTop + 0.25, D / 2 + 0.12);
  add(cart);
  stoneBox(W + 0.2, 0.3, 0.35, 0, shaftTop - 0.1, D / 2 + 0.12);
  // Deep cornice with large scrolled brackets.
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(W + 1.8, 0.75, 2.2), new THREE.MeshStandardMaterial({ color: '#cbbfa8', roughness: 0.8 }));
  cornice.position.set(0, top - 0.05, D / 2 + 0.75);
  cornice.castShadow = true;
  add(cornice);
  for (let x = -W / 2 + 0.3; x <= W / 2; x += (W - 0.6) / 5) {
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.4, 1.6), matStone);
    br.position.set(x, top - 1.0, D / 2 + 0.8);
    br.castShadow = true;
    add(br);
  }

  // =====================================================================
  // PARTY WALLS, REAR, ROOF
  // =====================================================================
  add(wall(face(Math.PI / 2, W / 2, 0, D / 2), D, top, [], matCommon(1)));
  add(wall(face(-Math.PI / 2, -W / 2, 0, -D / 2), D, top, [], matCommon(2)));
  const Fr = face(Math.PI, W / 2, 0, -D / 2);
  const rear = [];
  for (let f = 0; f < floors + 2; f++) for (const x of [2.2, 6.25, 10.3]) rear.push({ x, y: g1 + 1.8 + f * FH, w: 1.3, h: 2.2, kind: 'dh', reveal: C.revealCommon, sillColor: '#b3a999' });
  add(wall(Fr, W, top, rear, matCommon(3)));
  rear.forEach((o) => opening(Fr, o));
  addFireEscape(I, { x0: -W / 2 + 0.9, x1: -W / 2 + 6.4, z: -D / 2, levels: [...Array(floors + 2).keys()].map((f) => g1 + 0.7 + f * FH) });
  {
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: '#4f4b48', roughness: 1 }));
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = top - 0.4;
    roof.receiveShadow = true;
    add(roof);
    const bulk = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.2, 5.5), matCommon(4));
    bulk.position.set(W / 2 - 2.6, top + 1.2, -D / 2 + 5);
    bulk.castShadow = true;
    add(bulk);
    const tank = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.75, 3.2, 24), new THREE.MeshStandardMaterial({ color: '#6e5038', roughness: 0.95 }));
    body.position.y = 4.4;
    const lid = new THREE.Mesh(new THREE.ConeGeometry(1.9, 1.0, 24), new THREE.MeshStandardMaterial({ color: '#33302d', roughness: 0.9 }));
    lid.position.y = 6.5;
    tank.add(body, lid);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8), matSteel);
      leg.position.set(Math.cos(a) * 1.25, 1.4, Math.sin(a) * 1.25);
      tank.add(leg);
    }
    tank.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    tank.position.set(-W / 2 + 3.4, top - 0.4, -D / 2 + 9);
    add(tank);
  }

  finish();

  const floorRange = (n) => {
    if (n <= 1) return [0, g1];
    if (n === 2) return [g1, baseH];
    if (n <= 2 + floors) { const y0 = baseH + (n - 3) * FH; return [y0, y0 + FH]; }
    return [shaftTop, atticTop];
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
