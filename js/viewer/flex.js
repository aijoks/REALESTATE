// Procedural model of a single-storey distribution warehouse with a
// two-storey front office, matched to photos of 2100 Directors Row, Orlando:
//   - smooth cream stucco walls with projecting pilaster strips, a thin
//     cornice line and pairs of small high windows along the long side
//   - office front: dark glass curtain-wall entry bay rising the full
//     height, blue barrel awning, "2100", ramp and stairs with railings
//   - side loading area: dock canopy and roll-up doors behind a fenced yard
import * as THREE from 'three';
import { textTexture, rand } from './textures.js';
import { V, face, piece, wall, createKit } from './kit.js';

export function buildFlex(params) {
  const { width: W = 32, depth: D = 110, tenant = 'AmerisourceBergen', number = '2100' } = params;
  const front = D / 2;
  const r = rand(2100);
  const H = 10.5;

  const g = new THREE.Group();
  g.name = 'building';
  const { I, opening, add, finish } = createKit(g, r, { glass: 'sky' });
  const stucco = new THREE.MeshStandardMaterial({ color: '#f0e6d2', roughness: 0.9 });
  const trimC = '#e2d6bf';
  const darkGlass = '#1d2228';
  const win = (x, y) => ({ x, y, w: 0.75, h: 1.25, kind: 'dh', frame: '#3a3f44', reveal: '#cdbfa4', rd: 0.12, sill: false, tint: '#5b6c7c' });

  // ---- office front (+z) ----
  const Ff = face(0, -W / 2, 0, front);
  const bayX = W * 0.62;
  const bayW = 7.2;
  const fHoles = [
    { x: bayX, y: H / 2 + 0.6, w: bayW, h: H - 1.5, kind: 'grid', cols: 4, transom: 0, frame: '#15181b', reveal: '#2a2f34', rd: 0.35, sill: false, tint: darkGlass },
  ];
  for (const x of [6.0, 8.0, W - 3.2]) fHoles.push(win(x, H - 2.4));
  fHoles.push(win(bayX - bayW / 2 - 2.4, H - 2.4));
  add(wall(Ff, W, H, fHoles, stucco));
  fHoles.forEach((o) => opening(Ff, o));
  // Recessed frame around the glass bay, mullion fins.
  for (const dx of [-bayW / 2 - 0.45, bayW / 2 + 0.45]) I.trim.add(piece(Ff, bayX + dx, H / 2, 0.15, 0.9, H, 0.3), trimC);
  I.trim.add(piece(Ff, bayX, H - 0.25, 0.15, bayW + 1.8, 0.5, 0.3), trimC);
  for (let k = 1; k < 4; k++) I.trim.add(piece(Ff, bayX - bayW / 2 + (k * bayW) / 4, H / 2 + 0.6, -0.15, 0.12, H - 1.5, 0.25), '#0f1113');
  // Blue barrel awning with the tenant name, and the street number.
  {
    const tex = textTexture({
      width: 1024, height: 256, bg: '#1f3f86',
      draw(ctx, w, h) { ctx.fillStyle = '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = '600 96px "Helvetica Neue", Arial'; ctx.fillText(tenant, w / 2, h * 0.62); },
    });
    const awn = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 4.6, 24, 1, false, -Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: '#1f3f86', roughness: 0.6, side: THREE.DoubleSide }));
    awn.rotation.z = Math.PI / 2;
    awn.applyMatrix4(piece(Ff, bayX + 0.9, 3.6, 1.6, 1, 1, 1));
    awn.castShadow = true;
    add(awn);
    const face2 = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 1.1), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }));
    face2.applyMatrix4(piece(Ff, bayX + 0.9, 3.3, 3.02, 1, 1, 1));
    add(face2);
    const num = textTexture({ text: number, width: 256, height: 96, bg: '#f0e6d2', ink: '#222', font: '600 70px Arial' });
    const n = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.34), new THREE.MeshStandardMaterial({ map: num, roughness: 0.6 }));
    n.applyMatrix4(piece(Ff, bayX - bayW / 2 - 1.4, 4.6, 0.02, 1, 1, 1));
    add(n);
  }
  // Entrance ramp, stairs and black railings.
  {
    const conc = new THREE.MeshStandardMaterial({ color: '#d9d5cc', roughness: 0.9 });
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(14, 1.0, 2.6), conc);
    ramp.applyMatrix4(piece(Ff, bayX - 4, 0.5, 1.3, 1, 1, 1));
    ramp.receiveShadow = ramp.castShadow = true;
    add(ramp);
    for (let k = 0; k < 4; k++) {
      const st = new THREE.Mesh(new THREE.BoxGeometry(3, 0.25 * (4 - k), 0.35), conc);
      st.applyMatrix4(piece(Ff, bayX + 4.2, 0.125 * (4 - k), 2.75 + k * 0.35, 1, 1, 1));
      add(st);
    }
    for (let x = bayX - 11; x <= bayX + 5.6; x += 0.8) I.steel.add(piece(Ff, x, 1.5, 2.55, 0.04, 1.0, 0.04));
    I.steel.add(piece(Ff, bayX - 2.7, 2.0, 2.55, 16.6, 0.05, 0.05));
  }

  // ---- long side (-x) with pilasters, high windows and loading docks ----
  const Fs = face(-Math.PI / 2, -W / 2, 0, -front); // runs rear -> front
  const sHoles = [];
  const step = 9.2;
  for (let x = step / 2; x < D - 4; x += step) {
    for (const dx of [-0.55, 0.55]) sHoles.push(win(x + dx, H - 2.0));
  }
  // Roll-up dock doors along the rear half of the side.
  const docks = [];
  for (let x = 10; x < D * 0.55; x += 5.5) docks.push({ x, y: 1.25 + 1.6, w: 3.2, h: 3.2, kind: 'panel', panel: '#cfd2d4', reveal: '#bfb39b', rd: 0.2, sill: false });
  add(wall(Fs, D, H, [...sHoles, ...docks], stucco));
  [...sHoles, ...docks].forEach((o) => opening(Fs, o));
  for (let x = 0.4; x < D; x += step) I.trim.add(piece(Fs, x, H / 2, 0.12, 0.8, H, 0.24), trimC);
  I.trim.add(piece(Fs, D / 2, H - 0.35, 0.16, D, 0.3, 0.3), trimC);
  // Dock canopy and loading platform.
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(D * 0.5, 0.3, 4.5), new THREE.MeshStandardMaterial({ color: '#e9e3d6', roughness: 0.6 }));
  canopy.applyMatrix4(piece(Fs, D * 0.3, 5.0, 2.25, 1, 1, 1));
  canopy.castShadow = true;
  add(canopy);
  const dock = new THREE.Mesh(new THREE.BoxGeometry(D * 0.5, 1.25, 3.5), new THREE.MeshStandardMaterial({ color: '#c8c3b8', roughness: 0.9 }));
  dock.applyMatrix4(piece(Fs, D * 0.3, 0.62, 1.75, 1, 1, 1));
  add(dock);

  // ---- other walls (plain stucco with pilasters) ----
  const Fe = face(Math.PI / 2, W / 2, 0, front);
  add(wall(Fe, D, H, [], stucco));
  for (let x = 0.4; x < D; x += step) I.trim.add(piece(Fe, x, H / 2, 0.12, 0.8, H, 0.24), trimC);
  const Fr = face(Math.PI, W / 2, 0, -front);
  add(wall(Fr, W, H, [], stucco));
  // Cornice line on the front.
  I.trim.add(piece(Ff, W / 2, H - 0.35, 0.16, W, 0.3, 0.3), trimC);

  const roof = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: '#b9b5ae', roughness: 1 }));
  roof.rotation.x = -Math.PI / 2;
  roof.position.y = H - 0.05;
  add(roof);
  for (const [x, z] of [[-6, 20], [6, -10], [-4, -35]]) {
    const u = new THREE.Mesh(new THREE.BoxGeometry(3, 1.4, 2.4), new THREE.MeshStandardMaterial({ color: '#b8bcbf', roughness: 0.45, metalness: 0.5 }));
    u.position.set(x, H + 0.7, z);
    add(u);
  }

  finish();

  const floorRange = () => [0, H];
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * H;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, front + 1.5);
      case 'left': return V(-W / 2 - 1.5, y, front - u * D);
      case 'roof': return V((u - 0.5) * W, y, 0);
      default: return V(0, y, 0);
    }
  };
  return { group: g, width: W, depth: D, height: H + 2, floorRange, hotspotPosition };
}
