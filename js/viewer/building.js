// Procedural "pre-war brick" building generator.
// Builds a full 3D model (front, sides, back, roof) from the parameters in
// properties.js so every side of the building can be toured, not just the
// side that was photographed.
import * as THREE from 'three';
import { brickTexture, stoneTexture, textTexture } from './textures.js';

const FLOOR_H = 3.3; // typical tower floor, metres
const GROUND_H = 4.6; // double-height retail
const SECOND_H = 3.9; // 2nd floor inside the brick base
const BASE_H = GROUND_H + SECOND_H;

export function buildPrewarBrick(params) {
  const { floors = 15, width: W = 15.2, depth: D = 30, storefronts = [], bannerText = [] } = params;
  const towerFloors = floors - 2;
  const towerH = towerFloors * FLOOR_H;
  const totalH = BASE_H + towerH;

  const g = new THREE.Group();
  g.name = 'building';

  // ---------- materials ----------
  const redBrick = brickTexture({ base: '#8b4536', mortar: '#b8a999', seed: 11 });
  const darkBrick = brickTexture({ base: '#4b3129', mortar: '#5e4b42', variance: 16, seed: 5 });
  const stone = stoneTexture();
  const matRed = new THREE.MeshStandardMaterial({ map: redBrick, roughness: 0.92, metalness: 0 });
  const matDark = new THREE.MeshStandardMaterial({ map: darkBrick, roughness: 0.95 });
  const matStone = new THREE.MeshStandardMaterial({ map: stone, roughness: 0.8, color: '#e2d9c6' });
  const matFrame = new THREE.MeshStandardMaterial({ color: '#2a2a2a', roughness: 0.6, metalness: 0.3 });
  const matGlass = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.15, metalness: 0.6 });
  const matRoof = new THREE.MeshStandardMaterial({ color: '#6b6560', roughness: 1 });
  const matWood = new THREE.MeshStandardMaterial({ color: '#5a3416', roughness: 0.7 });
  const matMetal = new THREE.MeshStandardMaterial({ color: '#9a9a9a', roughness: 0.4, metalness: 0.8 });

  const setRepeat = (mat, w, h, scale = 1) => {
    const m = mat.clone();
    m.map = mat.map.clone();
    m.map.repeat.set((w / 2) * scale, (h / 2) * scale);
    m.map.needsUpdate = true;
    return m;
  };

  // ---------- retail base (dark brick, two storeys) ----------
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(W, BASE_H, D),
    [
      setRepeat(matDark, D, BASE_H),
      setRepeat(matDark, D, BASE_H),
      matRoof,
      matRoof,
      setRepeat(matDark, W, BASE_H),
      setRepeat(matDark, W, BASE_H),
    ],
  );
  base.position.y = BASE_H / 2;
  base.castShadow = base.receiveShadow = true;
  g.add(base);

  // Front of the base: three bays divided by brick piers.
  const pierW = 0.9;
  const pierXs = [-W / 2 + pierW / 2, -W / 6, W / 6, W / 2 - pierW / 2];
  for (const x of pierXs) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(pierW, BASE_H + 0.5, 0.35), setRepeat(matDark, pierW, BASE_H));
    pier.position.set(x, (BASE_H + 0.5) / 2, D / 2 + 0.17);
    pier.castShadow = true;
    g.add(pier);
  }
  // Stone parapet band on top of base + finials on inner piers.
  const band = new THREE.Mesh(new THREE.BoxGeometry(W + 0.2, 0.45, 0.5), matStone);
  band.position.set(0, BASE_H + 0.35, D / 2 + 0.2);
  g.add(band);
  for (const x of [-W / 6, W / 6]) {
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 0.6), matStone);
    plinth.position.set(x, BASE_H + 0.8, D / 2 + 0.17);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 16), matStone);
    ball.position.set(x, BASE_H + 1.3, D / 2 + 0.17);
    g.add(plinth, ball);
  }

  // 2nd-floor big bay windows (one per bay).
  const bayW = W / 3 - pierW;
  for (let i = 0; i < 3; i++) {
    const cx = -W / 3 + i * (W / 3);
    addWindow(g, cx, GROUND_H + SECOND_H / 2 + 0.1, D / 2, bayW - 0.6, 2.6, 'front', matFrame, matGlass, '#9fb4c8');
    // Ground-floor storefront glazing
    addWindow(g, cx, 1.55, D / 2, bayW - 0.5, 2.4, 'front', matFrame, matGlass, '#f0c87a');
  }

  // Storefront signage: sign board, entrance canopy, awning.
  for (const sf of storefronts) {
    const x0 = -W / 2 + sf.span[0] * W;
    const x1 = -W / 2 + sf.span[1] * W;
    const cx = (x0 + x1) / 2;
    const w = x1 - x0 - 0.3;
    if (sf.kind === 'sign') {
      const tex = textTexture({ text: sf.text, sub: sf.sub, bg: sf.color, ink: sf.ink });
      const sign = new THREE.Mesh(new THREE.BoxGeometry(w, 1.1, 0.25), [
        matFrame, matFrame, matFrame, matFrame,
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }),
        matFrame,
      ]);
      sign.position.set(cx, GROUND_H - 0.9, D / 2 + 0.3);
      g.add(sign);
    } else if (sf.kind === 'entrance') {
      const frame = new THREE.Mesh(new THREE.BoxGeometry(w, GROUND_H - 0.4, 0.6), matFrame);
      frame.position.set(cx, (GROUND_H - 0.4) / 2, D / 2 + 0.3);
      g.add(frame);
      const door = new THREE.Mesh(
        new THREE.PlaneGeometry(w - 0.8, GROUND_H - 1.2),
        new THREE.MeshStandardMaterial({ color: '#ffe9c4', emissive: '#ffcf8a', emissiveIntensity: 0.6, roughness: 0.2, metalness: 0.5 }),
      );
      door.position.set(cx, (GROUND_H - 1.2) / 2, D / 2 + 0.61);
      g.add(door);
      const tex = textTexture({ text: sf.text, width: 512, height: 96, bg: '#222', ink: '#fff', font: '600 48px Arial' });
      const plate = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.3), new THREE.MeshBasicMaterial({ map: tex }));
      plate.position.set(cx, GROUND_H - 0.8, D / 2 + 0.61);
      g.add(plate);
    } else if (sf.kind === 'awning') {
      const tex = textTexture({ text: sf.text, stripes: true, ink: '#fff', font: 'bold 72px Georgia, serif' });
      const awn = new THREE.Mesh(new THREE.BoxGeometry(w, 0.7, 1.4), [
        matFrame, matFrame, new THREE.MeshStandardMaterial({ color: sf.color }), matFrame,
        new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }),
        matFrame,
      ]);
      awn.position.set(cx, GROUND_H - 1.0, D / 2 + 0.7);
      awn.rotation.x = 0.18;
      g.add(awn);
      const doors = new THREE.Mesh(new THREE.PlaneGeometry(w - 1, 2.6), matWood);
      doors.position.set(cx, 1.4, D / 2 + 0.36);
      g.add(doors);
    }
  }

  // Blue vertical banners hanging off the front corners (as in the photo).
  const bannerTex = textTexture({ lines: ['DAY SPA', 'Awarded #1', '2nd Floor'], width: 256, height: 768, bg: '#1f6fd6', ink: '#fff', font: 'bold 40px Arial', subFont: '600 28px Arial' });
  for (const s of [-1, 1]) {
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.4), new THREE.MeshStandardMaterial({ map: bannerTex, side: THREE.DoubleSide }));
    flag.position.set(s * (W / 2 - 0.6), GROUND_H + 1.2, D / 2 + 1.1);
    flag.rotation.y = Math.PI / 2;
    g.add(flag);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.6), matMetal);
    pole.rotation.x = Math.PI / 2;
    pole.position.set(s * (W / 2 - 0.6), GROUND_H + 2.45, D / 2 + 0.8);
    g.add(pole);
  }

  // ---------- tower (red brick) ----------
  const tower = new THREE.Mesh(new THREE.BoxGeometry(W, towerH, D), [
    setRepeat(matRed, D, towerH),
    setRepeat(matRed, D, towerH),
    matRoof,
    matRoof,
    setRepeat(matRed, W, towerH),
    setRepeat(matRed, W, towerH),
  ]);
  tower.position.y = BASE_H + towerH / 2;
  tower.castShadow = tower.receiveShadow = true;
  g.add(tower);

  // Projecting corner bays on the front (upper floors), like the photo.
  const bayStart = 4; // first tower floor index (0-based) with the bay
  const bayH = (towerFloors - bayStart) * FLOOR_H;
  for (const s of [-1, 1]) {
    const bay = new THREE.Mesh(new THREE.BoxGeometry(3.4, bayH, 0.7), [
      setRepeat(matRed, 0.7, bayH), setRepeat(matRed, 0.7, bayH), matStone, matStone,
      setRepeat(matRed, 3.4, bayH), setRepeat(matRed, 3.4, bayH),
    ]);
    bay.position.set(s * (W / 2 - 2.2), BASE_H + bayStart * FLOOR_H + bayH / 2, D / 2 + 0.35);
    bay.castShadow = true;
    g.add(bay);
    const corbel = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 0.9), matStone);
    corbel.position.set(s * (W / 2 - 2.2), BASE_H + bayStart * FLOOR_H - 0.25, D / 2 + 0.35);
    g.add(corbel);
  }

  // Windows: instanced for performance. Front 6 / rear 6 / sides 8 per floor.
  const windows = [];
  const frontXs = spread(6, W, 1.2);
  const sideZs = spread(8, D, 1.6);
  for (let f = 0; f < towerFloors; f++) {
    const y = BASE_H + f * FLOOR_H + FLOOR_H / 2;
    const inBay = f >= bayStart;
    frontXs.forEach((x, i) => {
      const edge = i === 0 || i === 5;
      windows.push({ x, y, z: D / 2 + (inBay && edge ? 0.7 : 0), face: 'front' });
      windows.push({ x: -x, y, z: -D / 2, face: 'back' });
    });
    sideZs.forEach((z) => {
      windows.push({ x: W / 2, y, z, face: 'right' });
      windows.push({ x: -W / 2, y, z: -z, face: 'left' });
    });
  }
  addInstancedWindows(g, windows, 1.3, 2.0, matFrame, matGlass);

  // Limestone crown: cornice band + three pediments + corner finials.
  const cornice = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.9, D + 0.6), matStone);
  cornice.position.y = totalH + 0.45;
  g.add(cornice);
  for (const x of [-W / 2 + 2.2, 0, W / 2 - 2.2]) {
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0, 1.6, 1.4, 4, 1), matStone);
    ped.rotation.y = Math.PI / 4;
    ped.scale.set(1.4, 1, 0.45);
    ped.position.set(x, totalH + 1.6, D / 2 - 0.1);
    g.add(ped);
  }
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(W, 1.1, 0.4), setRepeat(matRed, W, 1.1));
  parapet.position.set(0, totalH + 1.45, D / 2 - 0.3);
  g.add(parapet);
  const parapetBack = parapet.clone();
  parapetBack.position.z = -D / 2 + 0.3;
  g.add(parapetBack);

  // Roof: bulkhead + classic timber water tower.
  const bulkhead = new THREE.Mesh(new THREE.BoxGeometry(5, 3.2, 6), setRepeat(matRed, 6, 3.2));
  bulkhead.position.set(-W / 2 + 3.5, totalH + 0.9 + 1.6, -D / 2 + 5);
  bulkhead.castShadow = true;
  g.add(bulkhead);
  const wt = new THREE.Group();
  const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.7, 1.9, 3.4, 20), matWood);
  tank.position.y = 4.4;
  const cone = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.4, 20), new THREE.MeshStandardMaterial({ color: '#3b3b3b', roughness: 0.9 }));
  cone.position.y = 6.8;
  wt.add(tank, cone);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.8), matMetal);
    leg.position.set(Math.cos(a) * 1.3, 1.4, Math.sin(a) * 1.3);
    wt.add(leg);
  }
  wt.position.set(W / 2 - 4, totalH + 0.9, -D / 2 + 9);
  g.add(wt);
  for (let i = 0; i < 3; i++) {
    const hvac = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.9, 1.6), matMetal);
    hvac.position.set(-2 + i * 2.6, totalH + 0.9 + 0.45, D / 2 - 6);
    g.add(hvac);
  }

  // Big "SPACE FOR LEASE" banner on the east side wall.
  if (bannerText.length) {
    const tex = textTexture({ lines: bannerText, width: 512, height: 1536, bg: '#1d3f7a', ink: '#fff', font: 'bold 150px Arial', subFont: '600 90px Arial' });
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 13.8), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }));
    banner.position.set(W / 2 + 0.08, BASE_H + 2 * FLOOR_H + 6.9, D / 2 - 3.2);
    banner.rotation.y = Math.PI / 2;
    g.add(banner);
  }

  // ---------- helpers exposed to the viewer ----------
  const floorRange = (n) => {
    if (n <= 1) return [0, GROUND_H];
    if (n === 2) return [GROUND_H, BASE_H];
    const y0 = BASE_H + (n - 3) * FLOOR_H;
    return [y0, y0 + FLOOR_H];
  };
  const hotspotPosition = ([u, v, face]) => {
    const y = v * totalH;
    switch (face) {
      case 'front': return new THREE.Vector3((u - 0.5) * W, y, D / 2 + 0.9);
      case 'back': return new THREE.Vector3((0.5 - u) * W, y, -D / 2 - 0.9);
      case 'right': return new THREE.Vector3(W / 2 + 0.9, y, (0.5 - u) * D);
      case 'left': return new THREE.Vector3(-W / 2 - 0.9, y, (u - 0.5) * D);
      case 'roof': return new THREE.Vector3((u - 0.5) * W, y, 0);
      default: return new THREE.Vector3(0, y, 0);
    }
  };

  return { group: g, width: W, depth: D, height: totalH + 2, floorRange, hotspotPosition };
}

// Evenly spread `n` items across `span`, inset from the edges.
function spread(n, span, inset) {
  const inner = span - inset * 2;
  return Array.from({ length: n }, (_, i) => -inner / 2 + (inner / (n - 1)) * i);
}

function addWindow(g, x, y, zWall, w, h, face, matFrame, matGlass, tint) {
  const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, h + 0.2, 0.18), matFrame);
  frame.position.set(x, y, zWall + 0.09);
  const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), matGlass.clone());
  glass.material.color.set(tint);
  glass.position.set(x, y, zWall + 0.19);
  g.add(frame, glass);
}

function addInstancedWindows(g, list, w, h, matFrame, matGlass) {
  const frameGeo = new THREE.BoxGeometry(w + 0.22, h + 0.22, 0.16);
  const glassGeo = new THREE.PlaneGeometry(w, h);
  const frames = new THREE.InstancedMesh(frameGeo, matFrame, list.length);
  const glass = new THREE.InstancedMesh(glassGeo, matGlass, list.length);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const pos = new THREE.Vector3();
  const off = new THREE.Vector3();
  const one = new THREE.Vector3(1, 1, 1);
  const col = new THREE.Color();
  const rot = {
    front: 0,
    back: Math.PI,
    right: Math.PI / 2,
    left: -Math.PI / 2,
  };
  list.forEach((wd, i) => {
    q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot[wd.face]);
    off.set(0, 0, 0.08).applyQuaternion(q);
    pos.set(wd.x, wd.y, wd.z).add(off);
    m.compose(pos, q, one);
    frames.setMatrixAt(i, m);
    off.set(0, 0, 0.17).applyQuaternion(q);
    pos.set(wd.x, wd.y, wd.z).add(off);
    m.compose(pos, q, one);
    glass.setMatrixAt(i, m);
    // Mix of sky-reflecting and warmly lit windows.
    const lit = ((i * 7919) % 17) < 5;
    col.set(lit ? '#f3d9a6' : '#8fa6bd');
    glass.setColorAt(i, col);
  });
  frames.castShadow = true;
  g.add(frames, glass);
}
