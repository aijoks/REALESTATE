// Procedural model of a turn-of-the-century loft office building, matched to
// photos of 133 W 21st St:
//   - three-storey rusticated stone base: carved entrance in the west bay,
//     shopfronts, windows in groups of four, topped by a deep corbelled
//     cornice with brackets and lion-head bosses; SVA banner
//   - grey-tan brick shaft: four bays between five broad piers, four windows
//     per bay, stone spandrel bands at every floor
//   - two ornate top floors: pier capitals, terracotta frieze, deep cornice
import * as THREE from 'three';
import { grime, textTexture, rand } from './textures.js';
import { V, C, face, piece, brickMaterial, wall, createKit, addFireEscape } from './kit.js';

export function buildLadiesMile(params) {
  const { width: W = 30, depth: D = 29, banner = ['SVA', 'NYC'] } = params;

  const r = rand(1900);
  const g1 = 5.0;
  const g2 = 4.0;
  const g3 = 4.0;
  const baseH = g1 + g2 + g3;
  const FH = 3.7;
  const shaftFloors = 7;
  const TFH = 3.9;
  const topFloors = 2;
  const shaftTop = baseH + shaftFloors * FH;
  const wallTop = shaftTop + topFloors * TFH;
  const top = wallTop + 2.2;

  const g = new THREE.Group();
  g.name = 'building';
  const { matStone, matSteel, I, opening, add, stoneBox, brickBox, finish } = createKit(g, r, { glass: 'sky' });
  const skyTint = () => (r() < 0.3 ? '#2f3a44' : r() < 0.6 ? '#9db3c6' : '#c4d3df');
  const matTan = brickMaterial('tan', grime('mile', { seed: 21, streaks: 40, strength: 0.5 }));
  const matTanPlain = brickMaterial('tan');
  const matCommon = (seed) => brickMaterial('common', grime(`milecommon${seed}`, { seed, streaks: 50, strength: 0.7 }));
  const matBase = matStone.clone();
  matBase.color = new THREE.Color('#d6cbb6');
  const frame = '#2c2e30';
  const reveal = '#8f8370';

  // Bays: 5 piers, 4 bays.
  const pier = 1.7;
  const bay = (W - 5 * pier) / 4;
  const bayX = (i) => pier + i * (bay + pier) + bay / 2; // local x of bay centre
  const pierX = (i) => pier / 2 + i * (bay + pier);
  const winXs = (i) => [-1.5, -0.5, 0.5, 1.5].map((k) => bayX(i) + k * (bay / 4));
  const ww = bay / 4 - 0.22;

  // =====================================================================
  // STONE BASE
  // =====================================================================
  const Fb = face(0, -W / 2, 0, D / 2);
  const baseHoles = [
    { x: bayX(0), y: 0.12 + 1.75, w: 2.4, h: 3.5, kind: 'lobby', room: 'lobby', frame, reveal: '#9a8f7c', rd: 0.5, sill: false, roomDepth: 4 },
  ];
  for (let i = 1; i < 4; i++) {
    baseHoles.push({ x: bayX(i), y: 0.12 + 1.8, w: bay - 0.5, h: 3.6, kind: 'grid', cols: 4, transom: 0.8, room: i === 2 ? 'shop' : 'warm', blinds: false, frame: '#24272a', reveal: '#9a8f7c', rd: 0.3, sill: false });
  }
  for (let i = 0; i < 4; i++) {
    for (const x of winXs(i)) {
      baseHoles.push({ x, y: g1 + g2 / 2, w: ww, h: 2.6, kind: 'dh', reveal: '#9a8f7c', frame, sillColor: '#cdc2ad' });
      baseHoles.push({ x, y: g1 + g2 + g3 / 2, w: ww, h: 2.6, kind: 'dh', reveal: '#9a8f7c', frame, sillColor: '#cdc2ad' });
    }
  }
  add(wall(Fb, W, baseH, baseHoles, matBase));
  baseHoles.forEach((o) => opening(Fb, o));
  // Rusticated piers: raised stone with horizontal joints on the piers only.
  for (let i = 0; i < 5; i++) {
    stoneBox(pier + 0.1, baseH, 0.35, -W / 2 + pierX(i), baseH / 2, D / 2 + 0.17);
    for (let y = 0.9; y < baseH - 0.3; y += 0.9) I.trim.add(piece(Fb, pierX(i), y, 0.36, pier + 0.12, 0.06, 0.02), '#a89d88');
  }
  // Carved entrance surround in the west bay.
  stoneBox(3.4, 0.6, 0.55, -W / 2 + bayX(0), 4.05, D / 2 + 0.3);
  stoneBox(0.35, 3.8, 0.45, -W / 2 + bayX(0) - 1.45, 1.9, D / 2 + 0.25);
  stoneBox(0.35, 3.8, 0.45, -W / 2 + bayX(0) + 1.45, 1.9, D / 2 + 0.25);
  // Corbelled cornice over the base: sloped soffit, brackets, lion bosses.
  {
    const y = baseH;
    const soffit = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.5, 1.6), matStone);
    soffit.position.set(0, y + 0.55, D / 2 + 0.75);
    soffit.rotation.x = -0.35;
    soffit.castShadow = true;
    add(soffit);
    stoneBox(W + 0.8, 0.35, 1.5, 0, y + 0.95, D / 2 + 0.8);
    for (let i = 0; i < 5; i++) {
      stoneBox(0.6, 1.4, 1.2, -W / 2 + pierX(i), y + 0.1, D / 2 + 0.6);
      const boss = new THREE.Mesh(new THREE.SphereGeometry(0.32, 16, 12), matStone);
      boss.position.set(-W / 2 + pierX(i), y + 1.4, D / 2 + 1.35);
      add(boss);
    }
  }
  // SVA banner on an outrigger over the second bay.
  {
    const tex = textTexture({
      width: 512, height: 640, bg: '#1d1d1f',
      draw(ctx, w, h) {
        ctx.fillStyle = '#2a8de8';
        for (let i = 0; i < 26; i++) {
          ctx.beginPath();
          ctx.arc(60 + ((i * 97) % 400), 60 + ((i * 53) % 520), 40 + ((i * 13) % 30), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#1d1d1f';
        ctx.fillRect(w / 2 - 110, h / 2 - 90, 220, 180);
        ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '900 84px Arial Black, Arial';
        banner.forEach((t, k) => ctx.fillText(t, w / 2, h / 2 - 40 + k * 84));
      },
    });
    const bx = -W / 2 + bayX(1) + bay / 2 + pier / 2;
    const b = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 3.3), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.7 }));
    b.position.set(bx + 1.1, g1 + 1.7, D / 2 + 1.6);
    b.rotation.y = -0.15;
    add(b);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.4), matSteel);
    rod.rotation.z = Math.PI / 2;
    rod.position.set(bx + 1.1, g1 + 3.4, D / 2 + 1.6);
    add(rod);
    const stay = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 3.6), matSteel);
    stay.position.set(bx + 0.9, g1 + 4.5, D / 2 + 0.9);
    stay.rotation.set(0.6, 0, 0.9);
    add(stay);
  }

  // =====================================================================
  // BRICK SHAFT + ORNATE TOP FLOORS
  // =====================================================================
  const Ft = face(0, -W / 2, baseH, D / 2);
  const upperH = top - baseH;
  const holes = [];
  const wy = (f) => (f < shaftFloors ? f * FH : shaftFloors * FH + (f - shaftFloors) * TFH) + 0.7 + 1.25;
  for (let f = 0; f < shaftFloors + topFloors; f++) {
    for (let i = 0; i < 4; i++) for (const x of winXs(i)) holes.push({ x, y: wy(f), w: ww, h: 2.5, kind: 'dh', reveal, frame, sillColor: '#d1c6b1', tint: skyTint() });
  }
  add(wall(Ft, W, upperH, holes, matTan));
  holes.forEach((o) => opening(Ft, o));
  const wallH = wallTop - baseH;
  for (let i = 0; i < 5; i++) {
    // Broad brick piers standing proud of the bays.
    brickBox(matTanPlain, pier + 0.1, wallH, 0.4, -W / 2 + pierX(i), baseH + wallH / 2, D / 2 + 0.2);
    // Capitals on the two ornate top floors.
    for (let k = 0; k < topFloors; k++) {
      const y = baseH + shaftFloors * FH + (k + 1) * TFH - 0.45;
      stoneBox(pier + 0.5, 0.6, 0.7, -W / 2 + pierX(i), y, D / 2 + 0.35);
      stoneBox(pier - 0.3, 0.9, 0.55, -W / 2 + pierX(i), y - 1.2, D / 2 + 0.32);
    }
  }
  // Spandrel bands between floors (stone), heavier frieze at the top floors.
  for (let f = 1; f < shaftFloors + topFloors; f++) {
    const y = f < shaftFloors ? f * FH : shaftFloors * FH + (f - shaftFloors) * TFH;
    const heavy = f >= shaftFloors;
    for (let i = 0; i < 4; i++) {
      I.trim.add(piece(Ft, bayX(i), y + 0.25, heavy ? 0.12 : 0.06, bay, heavy ? 0.5 : 0.32, heavy ? 0.24 : 0.12), heavy ? '#cfc2a8' : '#bdb19a');
    }
  }
  // Frieze with dentils and the deep top cornice.
  stoneBox(W + 0.3, 0.9, 0.5, 0, wallTop + 0.45, D / 2 + 0.2);
  for (let x = -W / 2 + 0.2; x < W / 2; x += 0.5) I.trim.add(piece(new THREE.Matrix4(), x, wallTop + 1.0, D / 2 + 0.55, 0.22, 0.25, 0.3), '#cfc2a8');
  const corniceMat = new THREE.MeshStandardMaterial({ color: '#3b3a36', roughness: 0.7 });
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(W + 1.6, 0.8, 2.0), corniceMat);
  cornice.position.set(0, wallTop + 1.65, D / 2 + 0.6);
  cornice.castShadow = true;
  add(cornice);
  for (let x = -W / 2 + 0.4; x < W / 2; x += 1.4) {
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.6, 1.4), corniceMat);
    br.position.set(x, wallTop + 1.05, D / 2 + 0.85);
    add(br);
  }

  // =====================================================================
  // PARTY WALLS, REAR, ROOF
  // =====================================================================
  add(wall(face(Math.PI / 2, W / 2, 0, D / 2), D, top, [], matCommon(1)));
  add(wall(face(-Math.PI / 2, -W / 2, 0, -D / 2), D, top, [], matCommon(2)));
  const Fr = face(Math.PI, W / 2, 0, -D / 2);
  const rear = [];
  for (let f = 0; f < shaftFloors + topFloors + 2; f++) {
    for (let x = 2; x < W - 1; x += 3.4) rear.push({ x, y: g1 + 1.9 + f * FH, w: 1.4, h: 2.3, kind: 'dh', reveal: C.revealCommon, sillColor: '#b3a999' });
  }
  add(wall(Fr, W, top, rear, matCommon(3)));
  rear.forEach((o) => opening(Fr, o));
  addFireEscape(I, { x0: -W / 2 + 2.0, x1: -W / 2 + 8.4, z: -D / 2, levels: [...Array(shaftFloors + topFloors + 2).keys()].map((f) => g1 + 0.75 + f * FH) });
  {
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: '#4f4b48', roughness: 1 }));
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = top - 0.5;
    roof.receiveShadow = true;
    add(roof);
    const bulk = new THREE.Mesh(new THREE.BoxGeometry(6, 3.6, 7), matCommon(4));
    bulk.position.set(-W / 2 + 5, top + 1.3, -D / 2 + 6);
    bulk.castShadow = true;
    add(bulk);
    const tank = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.05, 3.8, 28), new THREE.MeshStandardMaterial({ color: '#6e5038', roughness: 0.95 }));
    body.position.y = 5.0;
    const lid = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.2, 28), new THREE.MeshStandardMaterial({ color: '#33302d', roughness: 0.9 }));
    lid.position.y = 7.5;
    tank.add(body, lid);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.1), matSteel);
      leg.position.set(Math.cos(a) * 1.5, 1.55, Math.sin(a) * 1.5);
      tank.add(leg);
    }
    tank.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    tank.position.set(W / 2 - 6, top - 0.5, -D / 2 + 8);
    add(tank);
  }

  finish();

  const floorRange = (n) => {
    if (n <= 1) return [0, g1];
    if (n === 2) return [g1, g1 + g2];
    if (n === 3) return [g1 + g2, baseH];
    if (n <= 3 + shaftFloors) { const y0 = baseH + (n - 4) * FH; return [y0, y0 + FH]; }
    const y0 = shaftTop + (n - 4 - shaftFloors) * TFH;
    return [y0, y0 + TFH];
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
