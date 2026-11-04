// Procedural model of the distribution warehouse at 2100 Directors Row,
// Orlando (Orlando Central Park), traced from satellite imagery / OSM and
// matched to the listing photo:
//   - real footprint ~111 m (west front) x ~150 m (north side): the office
//     block at the north-west corner projects ~7 m north of a recessed dock
//     wall; a small block projects at the north-east corner; the south-west
//     corner is notched ~10 m
//   - smooth cream stucco walls with projecting pilaster strips, a thin
//     cornice line and pairs of small high windows
//   - office front (west): dark glass curtain-wall entry bay rising the full
//     height, blue barrel awning (AmerisourceBergen, as photographed), "2100",
//     ramp and stairs with railings
//   - truck docks with a canopy along the recessed north wall
// Local axes: +z = real west (the office front), +x = real south, -x = north.
import * as THREE from 'three';
import { textTexture, rand } from './textures.js';
import { V, face, piece, wall, createKit } from './kit.js';

export function buildFlex(params) {
  const { width: W = 111, depth: D = 150, tenant = 'AmerisourceBergen', number = '2100', tenant2 = null } = params;
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

  // Footprint (traced): walls run along the outline with the outside on the
  // right-hand side in plan (x right, z down).
  const xN = -W / 2 + 3.4; // office block north wall
  const xDock = -W / 2 + 10.8; // recessed dock wall
  const zNE = -front + 22; // north-east block
  const zOff = front - 53; // east end of the office block
  const xNotch = W / 2 - 39; // south-west notch
  const zNotch = front - 10.5;
  const P = [[xN, front], [xNotch, front], [xNotch, zNotch], [W / 2, zNotch], [W / 2, -front], [-W / 2, -front], [-W / 2, zNE], [xDock, zNE], [xDock, zOff], [xN, zOff]];
  const edges = P.map((a, i) => [a, P[(i + 1) % P.length]]);
  const frameOf = ([x0, z0], [x1, z1]) => face(Math.atan2(-(z1 - z0), x1 - x0), x0, 0, z0);
  const lenOf = ([x0, z0], [x1, z1]) => Math.hypot(x1 - x0, z1 - z0);

  const step = 9.2;
  const pilasters = (F, len) => {
    for (let x = 0.4; x < len; x += step) I.trim.add(piece(F, x, H / 2, 0.12, 0.8, H, 0.24), trimC);
    I.trim.add(piece(F, len - 0.4, H / 2, 0.12, 0.8, H, 0.24), trimC);
    I.trim.add(piece(F, len / 2, H - 0.35, 0.16, len, 0.3, 0.3), trimC);
  };
  const highPairs = (len, y = H - 2.0, from = step / 2, to = len - 3) => {
    const hs = [];
    for (let x = from; x < to; x += step) for (const dx of [-0.55, 0.55]) hs.push(win(x + dx, y));
    return hs;
  };

  // ---- office front (west, +z), north end ----
  const [fa, fb] = edges[0];
  const Ff = frameOf(fa, fb);
  const fLen = lenOf(fa, fb);
  const bayX = 14;
  const bayW = 7.2;
  {
    const holes = [
      { x: bayX, y: H / 2 + 0.6, w: bayW, h: H - 1.5, kind: 'grid', cols: 4, transom: 0, frame: '#15181b', reveal: '#2a2f34', rd: 0.35, sill: false, tint: darkGlass },
    ];
    // Two-storey office windows north of the bay, sparse high pairs beyond.
    for (const x of [3.2, 6.6]) holes.push(win(x, H - 2.4));
    for (const x of [bayX + bayW / 2 + 2.6, bayX + bayW / 2 + 9.5]) holes.push(win(x, H - 2.4));
    holes.push(...highPairs(fLen, H - 2.0, 33, fLen - 3));
    // Personnel door and a couple of roll-up doors on the yard end.
    const doors = [];
    for (const x of [fLen - 9, fLen - 18]) doors.push({ x, y: 2.4, w: 4.2, h: 4.4, kind: 'panel', panel: '#d3d6d8', reveal: '#bfb39b', rd: 0.2, sill: false });
    add(wall(Ff, fLen, H, [...holes, ...doors], stucco));
    [...holes, ...doors].forEach((o) => opening(Ff, o));
    pilasters(Ff, fLen);
    // Recessed frame around the glass bay, mullion fins.
    for (const dx of [-bayW / 2 - 0.45, bayW / 2 + 0.45]) I.trim.add(piece(Ff, bayX + dx, H / 2, 0.15, 0.9, H, 0.3), trimC);
    I.trim.add(piece(Ff, bayX, H - 0.25, 0.15, bayW + 1.8, 0.5, 0.3), trimC);
    for (let k = 1; k < 4; k++) I.trim.add(piece(Ff, bayX - bayW / 2 + (k * bayW) / 4, H / 2 + 0.6, -0.15, 0.12, H - 1.5, 0.25), '#0f1113');
  }
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
  // Entrance ramp (running north toward the corner), stairs and black railings.
  {
    const conc = new THREE.MeshStandardMaterial({ color: '#d9d5cc', roughness: 0.9 });
    const ramp = new THREE.Mesh(new THREE.BoxGeometry(12, 1.0, 2.6), conc);
    ramp.applyMatrix4(piece(Ff, bayX - 3.5, 0.5, 1.3, 1, 1, 1));
    ramp.receiveShadow = ramp.castShadow = true;
    add(ramp);
    for (let k = 0; k < 4; k++) {
      const st = new THREE.Mesh(new THREE.BoxGeometry(3, 0.25 * (4 - k), 0.35), conc);
      st.applyMatrix4(piece(Ff, bayX + 4.2, 0.125 * (4 - k), 2.75 + k * 0.35, 1, 1, 1));
      add(st);
    }
    for (let x = bayX - 9.5; x <= bayX + 5.6; x += 0.8) I.steel.add(piece(Ff, x, 1.5, 2.55, 0.04, 1.0, 0.04));
    I.steel.add(piece(Ff, bayX - 2, 2.0, 2.55, 15.1, 0.05, 0.05));
  }
  // Second tenant's wall sign over the yard doors (building-products yard).
  if (tenant2) {
    const t2 = textTexture({
      width: 1024, height: 200, bg: '#ffffff',
      draw(ctx, w, h) {
        ctx.fillStyle = '#c8102e'; ctx.fillRect(0, 0, 26, h);
        ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1b365d'; ctx.font = '800 92px Arial'; ctx.fillText(tenant2, 60, h * 0.42);
        ctx.fillStyle = '#c8102e'; ctx.font = '600 44px Arial'; ctx.fillText('BUILDING PRODUCTS', 64, h * 0.8);
      },
    });
    const s = new THREE.Mesh(new THREE.PlaneGeometry(9, 1.75), new THREE.MeshStandardMaterial({ map: t2, roughness: 0.5 }));
    s.applyMatrix4(piece(Ff, fLen - 13.5, 6.4, 0.05, 1, 1, 1));
    add(s);
  }

  // ---- north side: office block, recessed dock wall, north-east block ----
  const docks = [];
  for (let i = 0; i < edges.length; i++) {
    if (i === 0) continue;
    const [a, b] = edges[i];
    const F = frameOf(a, b);
    const len = lenOf(a, b);
    let holes = [];
    if (i === 7) {
      // Recessed dock wall (faces north): dock-high doors under a canopy.
      for (let x = 4; x < len - 3; x += 4.2) docks.push({ x, y: 1.25 + 1.5, w: 2.8, h: 3.0, kind: 'panel', panel: '#cfd2d4', reveal: '#bfb39b', rd: 0.2, sill: false });
      holes = [...docks, ...highPairs(len, H - 1.6)];
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(len - 2, 0.3, 4.5), new THREE.MeshStandardMaterial({ color: '#e9e3d6', roughness: 0.6 }));
      canopy.applyMatrix4(piece(F, len / 2, 5.2, 2.25, 1, 1, 1));
      canopy.castShadow = true;
      add(canopy);
      for (let x = 2; x < len; x += 8) I.steel.add(piece(F, x, 2.6, 4.3, 0.12, 5.2, 0.12));
      const plat = new THREE.Mesh(new THREE.BoxGeometry(len - 2, 1.25, 1.2), new THREE.MeshStandardMaterial({ color: '#c8c3b8', roughness: 0.9 }));
      plat.applyMatrix4(piece(F, len / 2, 0.62, 0.6, 1, 1, 1));
      add(plat);
      // Black dock bumpers / seals beside each door.
      for (const o of docks) for (const dx of [-1.7, 1.7]) I.steel.add(piece(F, o.x + dx, 2.9, 0.15, 0.3, 3.4, 0.3));
    } else if (i === 9) {
      // Office block north wall: two levels of windows near the corner.
      for (let x = len - 4; x > len - 30; x -= step) for (const dx of [-0.55, 0.55]) holes.push(win(x + dx, H - 2.4), win(x + dx, 3.4));
      holes.push(...highPairs(len, H - 2.0, step / 2, len - 32));
      // Man door and one roll-up toward the dock yard.
      holes.push({ x: 6, y: 2.4, w: 4.2, h: 4.4, kind: 'panel', panel: '#cfd2d4', reveal: '#bfb39b', rd: 0.2, sill: false });
    } else if (len > 20) {
      holes = highPairs(len);
    }
    add(wall(F, len, H, holes, stucco));
    holes.forEach((o) => opening(F, o));
    pilasters(F, len);
  }

  // Roof: membrane with a grid of rooftop units and skylights (as seen from above).
  {
    const roofMat = new THREE.MeshStandardMaterial({ color: '#d9dad6', roughness: 1 });
    const shape = new THREE.Shape();
    P.forEach(([x, z], i) => (i ? shape.lineTo(x, -z) : shape.moveTo(x, -z)));
    const roof = new THREE.Mesh(new THREE.ShapeGeometry(shape), roofMat);
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = H - 0.05;
    roof.receiveShadow = true;
    add(roof);
    for (const [x, z] of P) I.trim.add(piece(new THREE.Matrix4(), x, H + 0.35, z, 0.5, 0.7, 0.5), trimC);
    const unitMat = '#b8bcbf';
    for (let x = -42; x < 50; x += 15) {
      for (let z = -66; z < 70; z += 17) {
        if (x > xNotch - 2 && z > zNotch - 3) continue;
        I.trim.add(piece(new THREE.Matrix4(), x + (r() - 0.5) * 3, H + 0.5, z + (r() - 0.5) * 3, 2.2, 1.0, 1.8), unitMat);
      }
    }
    for (let x = -36; x < 48; x += 21) for (let z = -58; z < 60; z += 26) I.trim.add(piece(new THREE.Matrix4(), x, H + 0.12, z, 1.2, 0.25, 2.4), '#e9ecee');
  }

  finish();

  const floorRange = () => [0, H];
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * H;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, front + 1.5);
      case 'left': return V(xDock - 6, y, front - u * D);
      case 'roof': return V((u - 0.5) * W, y, 0);
      default: return V(0, y, 0);
    }
  };
  return { group: g, width: W, depth: D, height: H + 2, floorRange, hotspotPosition };
}
