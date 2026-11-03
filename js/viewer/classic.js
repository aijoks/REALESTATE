// Procedural model of a 1913 classical office tower, matched to photos of
// 115 E 23rd St:
//   - three-storey grey stone base: "115" lobby, shopfront (retail-for-lease
//     and Kung Fu Tea signs), "117" door; big glass on the 2nd floor flanked
//     by single windows; five windows across the 3rd floor
//   - cream-brick shaft (8 floors): a framed centre of 5 windows per floor
//     with darker spandrels, single-window side bays behind broad piers
//   - attic floor of 5 windows, frieze with 6 round rosettes, cornice
//   - blank party walls (both neighbours abut it), rear windows, roof plant
import * as THREE from 'three';
import { grime, textTexture, rand } from './textures.js';
import { V, C, face, piece, brickMaterial, wall, createKit, addFireEscape } from './kit.js';

export function buildClassicOffice(params) {
  const {
    width: W = 21,
    depth: D = 30,
    flag = ['OFFICE', 'SPACE', 'FOR LEASE'],
  } = params;

  const r = rand(1913);
  const g1 = 5.0; // ground
  const g2 = 4.2; // 2nd
  const g3 = 3.7; // 3rd
  const baseH = g1 + g2 + g3;
  const FH = 3.6; // shaft floors 4–11
  const shaftFloors = 8;
  const atticH = 3.7;
  const shaftTop = baseH + shaftFloors * FH;
  const atticTop = shaftTop + atticH;
  const friezeH = 1.7;
  const top = atticTop + friezeH;

  const g = new THREE.Group();
  g.name = 'building';
  const { matStone, matSteel, I, opening, add, stoneBox, finish } = createKit(g, r, { glass: 'sky' });

  const matBuff = brickMaterial('cream', grime('classic', { seed: 23, streaks: 14, strength: 0.15 }));
  const skyTint = () => (r() < 0.15 ? '#3f4c5a' : r() < 0.5 ? '#7fa9d8' : '#94bce6');
  const matCommon = (seed) => brickMaterial('common', grime(`classiccommon${seed}`, { seed, streaks: 50, strength: 0.7 }));
  const matBase = matStone.clone();
  matBase.color = new THREE.Color('#dcd8cf');
  const frame = '#2f3236';
  const reveal = '#a99878';
  const X = (f) => f * W; // fraction of frontage -> local x

  // =====================================================================
  // STONE BASE
  // =====================================================================
  const Fb = face(0, -W / 2, 0, D / 2);
  const baseHoles = [
    // Ground floor.
    { x: X(0.13), y: 0.12 + 1.6, w: 1.9, h: 3.2, kind: 'lobby', room: 'lobby', frame, reveal: '#8f8b84', rd: 0.35, sill: false, roomDepth: 4 },
    { x: X(0.51), y: 0.12 + 1.65, w: X(0.46), h: 3.3, kind: 'grid', cols: 4, transom: 0.7, room: 'shop', frame: '#26292c', reveal: '#8f8b84', rd: 0.25, sill: false },
    { x: X(0.87), y: 0.12 + 1.5, w: 1.6, h: 3.0, kind: 'french', room: 'warm', frame: '#6a4a2c', reveal: '#8f8b84', rd: 0.3, sill: false, blinds: false },
    // 2nd floor: single windows either side of the big glass.
    { x: X(0.13), y: g1 + g2 / 2, w: 1.9, h: 2.5, kind: 'dh2', reveal: '#9c978e', frame, sillColor: '#cfcbc2' },
    { x: X(0.51), y: g1 + g2 / 2 + 0.1, w: X(0.48), h: 3.1, kind: 'grid', cols: 6, transom: 0, room: 'warm', blinds: false, reveal: '#9c978e', frame: '#3b3f44', rd: 0.3, sillColor: '#cfcbc2' },
    { x: X(0.87), y: g1 + g2 / 2, w: 1.9, h: 2.5, kind: 'dh2', reveal: '#9c978e', frame, sillColor: '#cfcbc2' },
  ];
  // 3rd floor: five windows.
  for (const f of [0.13, 0.31, 0.5, 0.69, 0.87]) {
    baseHoles.push({ x: X(f), y: g1 + g2 + g3 / 2, w: 2.3, h: 2.2, kind: 'dh2', reveal: '#9c978e', frame, sillColor: '#cfcbc2' });
  }
  add(wall(Fb, W, baseH, baseHoles, matBase));
  baseHoles.forEach((o) => opening(Fb, o));
  // Belt course and plinth.
  stoneBox(W + 0.2, 0.45, 0.4, 0, baseH - 0.1, D / 2 + 0.12);
  stoneBox(W, 0.55, 0.12, 0, 0.27, D / 2 + 0.06);

  // Signs: address numerals, RETAIL FOR LEASE, KUNG FU TEA, blue flag.
  {
    const num = (t, x) => {
      const tex = textTexture({ text: t, width: 256, height: 128, bg: '#e9e6df', ink: '#3a3a3a', font: '600 80px "Helvetica Neue", Arial' });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }));
      m.position.set(-W / 2 + x, 3.85, D / 2 + 0.02);
      add(m);
    };
    num('115', X(0.13));
    num('117', X(0.87));
    const lease = textTexture({
      width: 1024, height: 256, bg: '#1d48a8', ink: '#fff',
      draw(ctx, w, h) {
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = 'bold 110px "Times New Roman", serif'; ctx.fillText('RETAIL FOR LEASE', w / 2, h * 0.38);
        ctx.font = 'bold 60px Arial'; ctx.fillText('2,287 SF + BASEMENT', w / 2, h * 0.8);
      },
    });
    const sign1 = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.05), new THREE.MeshStandardMaterial({ map: lease, roughness: 0.5 }));
    sign1.position.set(-W / 2 + X(0.38), 3.55, D / 2 + 0.06);
    add(sign1);
    const tea = textTexture({
      width: 1024, height: 256, bg: '#141414', ink: '#fff',
      draw(ctx, w, h) {
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '900 150px Arial Black, Impact, Arial';
        ctx.fillStyle = '#e8352b'; ctx.fillText('KUNG', w * 0.26, h / 2 + 6);
        ctx.fillStyle = '#ffffff'; ctx.fillText('FU', w * 0.55, h / 2 + 6);
        ctx.fillStyle = '#e8352b'; ctx.fillText('TEA', w * 0.8, h / 2 + 6);
      },
    });
    const sign2 = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.95, 0.15), [
      matSteel, matSteel, matSteel, matSteel, new THREE.MeshStandardMaterial({ map: tea, roughness: 0.45 }), matSteel,
    ]);
    sign2.position.set(-W / 2 + X(0.64), 3.55, D / 2 + 0.1);
    add(sign2);
    // Blue banner on a pole at the east (right-hand) end of the 2nd/3rd floors.
    const ftex = textTexture({
      width: 256, height: 768, bg: '#2a5fb0', ink: '#fff',
      lines: flag.map((t, i) => ({ text: t, font: `bold ${i === 2 ? 40 : 52}px Arial` })),
    });
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 2.6), new THREE.MeshStandardMaterial({ map: ftex, side: THREE.DoubleSide, roughness: 0.7 }));
    b.rotation.y = Math.PI / 2;
    b.position.set(W / 2 - 0.25, g1 + 3.0, D / 2 + 0.7);
    add(b);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.3), matSteel);
    rod.rotation.x = Math.PI / 2;
    rod.position.set(W / 2 - 0.25, g1 + 4.35, D / 2 + 0.6);
    add(rod);
  }

  // =====================================================================
  // CREAM-BRICK SHAFT + ATTIC
  // =====================================================================
  const Ft = face(0, -W / 2, baseH, D / 2);
  const upperH = top - baseH;
  const centre = [0.296, 0.4, 0.5, 0.6, 0.704];
  const holes = [];
  const wy = (f) => f * FH + 0.6 + 1.25;
  for (let f = 0; f < shaftFloors; f++) {
    for (const x of [0.133, 0.867]) holes.push({ x: X(x), y: wy(f), w: 1.55, h: 2.5, kind: 'dh', reveal, frame, rd: 0.42, sillColor: '#d6cfbf', tint: skyTint() });
    for (const x of centre) holes.push({ x: X(x), y: wy(f), w: 1.7, h: 2.5, kind: 'dh', reveal, frame, sillColor: '#d6cfbf', tint: skyTint() });
  }
  for (const x of [0.13, 0.31, 0.5, 0.69, 0.87]) {
    holes.push({ x: X(x), y: shaftFloors * FH + atticH / 2, w: 2.1, h: 2.3, kind: 'dh2', reveal, frame, sillColor: '#d6cfbf' });
  }
  add(wall(Ft, W, upperH, holes, matBuff));
  holes.forEach((o) => opening(Ft, o));

  // Raised frame around the centre grid, darker spandrels, broad side piers.
  const fx0 = X(0.245);
  const fx1 = X(0.755);
  const shaftH = shaftFloors * FH;
  I.trim.add(piece(Ft, fx0, shaftH / 2, 0.05, 0.42, shaftH, 0.1), '#d3c7ad');
  I.trim.add(piece(Ft, fx1, shaftH / 2, 0.05, 0.42, shaftH, 0.1), '#d3c7ad');
  for (let f = 0; f < shaftFloors; f++) {
    // Patterned brick spandrel panel under each row of the centre grid.
    I.trim.add(piece(Ft, (fx0 + fx1) / 2, f * FH + 0.32, 0.03, fx1 - fx0, 0.62, 0.06), '#d2c3a6');
    for (let x = fx0 + 0.15; x < fx1; x += 0.24) I.trim.add(piece(Ft, x, f * FH + 0.32, 0.065, 0.012, 0.56, 0.004), '#bfae8f');
    for (let k = 0; k < centre.length - 1; k++) {
      const x = X((centre[k] + centre[k + 1]) / 2);
      I.trim.add(piece(Ft, x, f * FH + FH / 2 + 0.3, 0.07, 0.34, FH - 0.6, 0.14), '#bfae8f');
    }
  }
  I.trim.add(piece(Ft, (fx0 + fx1) / 2, shaftH - 0.15, 0.05, fx1 - fx0 + 0.42, 0.3, 0.1), '#d3c7ad');
  for (const x of [0.03, 0.97]) I.trim.add(piece(Ft, X(x), shaftH / 2, 0.05, X(0.06), shaftH, 0.1), '#d8cdb5');
  // Stringcourse under the attic, frieze with rosettes, cornice.
  stoneBox(W + 0.1, 0.3, 0.3, 0, shaftTop + 0.05, D / 2 + 0.1);
  stoneBox(W + 0.05, friezeH, 0.2, 0, atticTop + friezeH / 2, D / 2 + 0.06);
  for (const f of [0.03, 0.22, 0.4, 0.6, 0.78, 0.97]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.11, 10, 24), matStone);
    ring.position.set(-W / 2 + X(f), atticTop + friezeH / 2, D / 2 + 0.2);
    ring.castShadow = true;
    add(ring);
    const boss = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.12, 16), matStone);
    boss.rotation.x = Math.PI / 2;
    boss.position.set(-W / 2 + X(f), atticTop + friezeH / 2, D / 2 + 0.2);
    add(boss);
  }
  stoneBox(W + 0.7, 0.45, 0.8, 0, top + 0.2, D / 2 - 0.05);

  // =====================================================================
  // PARTY WALLS, REAR, ROOF
  // =====================================================================
  add(wall(face(Math.PI / 2, W / 2, 0, D / 2), D, top, [], matCommon(1)));
  add(wall(face(-Math.PI / 2, -W / 2, 0, -D / 2), D, top, [], matCommon(2)));
  const Fr = face(Math.PI, W / 2, 0, -D / 2);
  const rear = [];
  for (let f = 0; f < shaftFloors + 2; f++) {
    for (const x of [2.2, 5.6, 9.0, 12.0, 15.4, 18.8]) {
      rear.push({ x, y: g1 + 1.9 + f * FH, w: 1.3, h: 2.3, kind: 'dh', reveal: C.revealCommon, sillColor: '#b3a999' });
    }
  }
  add(wall(Fr, W, top, rear, matCommon(3)));
  rear.forEach((o) => opening(Fr, o));
  addFireEscape(I, { x0: W / 2 - 7.4, x1: W / 2 - 1.2, z: -D / 2, levels: [...Array(shaftFloors + 2).keys()].map((f) => g1 + 0.75 + f * FH) });
  {
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: '#4f4b48', roughness: 1 }));
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = top - 0.4;
    roof.receiveShadow = true;
    add(roof);
    const bulk = new THREE.Mesh(new THREE.BoxGeometry(5, 3.4, 6.5), matCommon(4));
    bulk.position.set(-W / 2 + 3.4, top + 1.3, -D / 2 + 5);
    bulk.castShadow = true;
    add(bulk);
    const hvac = new THREE.MeshStandardMaterial({ color: '#b8bcbf', roughness: 0.45, metalness: 0.55 });
    for (const [x, z] of [[2, 2], [5, -3], [-1, -6]]) {
      const u = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 1.8), hvac);
      u.position.set(x, top + 0.2, z);
      u.castShadow = true;
      add(u);
    }
  }

  finish();

  const floorRange = (n) => {
    if (n <= 1) return [0, g1];
    if (n === 2) return [g1, g1 + g2];
    if (n === 3) return [g1 + g2, baseH];
    if (n >= 12) return [shaftTop, atticTop];
    const y0 = baseH + (n - 4) * FH;
    return [y0, y0 + FH];
  };
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * top;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, D / 2 + 0.9);
      case 'back': return V((0.5 - u) * W, y, -D / 2 - 0.9);
      case 'roof': return V((u - 0.5) * W, y, 0);
      default: return V(0, y, 0);
    }
  };

  return { group: g, width: W, depth: D, height: top + 2, floorRange, hotspotPosition };
}
