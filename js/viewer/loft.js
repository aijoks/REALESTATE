// Procedural model of a 1910s buff-brick loft office building, matched to
// photos of 10 E 38th St:
//   - two-storey smooth stone base: three big gridded 2nd-floor windows,
//     lobby with "10" over the door, restaurant and shop at grade
//   - buff-brick tower, 11 windows per floor in a 3 | 5 | 3 rhythm with wider
//     piers between the groups and darker spandrel bands
//   - blank party walls (both neighbours are built tight against it), rear
//     windows onto a small yard
//   - roof terrace: pavers, black railing, wicker lounge seating, market
//     umbrellas, blue bistro sets, planters, metal-clad bulkhead + water tank
import * as THREE from 'three';
import { grime, textTexture, rand } from './textures.js';
import { V, C, face, piece, brickMaterial, wall, createKit, addFireEscape } from './kit.js';

export function buildBuffLoft(params) {
  const {
    floors = 11,
    width: W = 17.4,
    depth: D = 30.5,
    groundH = 4.6,
    secondH = 4.2,
    floorH: FH = 4.05,
    flag = ['OFFICE', 'SPACE', 'FOR LEASE'],
    address = '10',
  } = params;

  const r = rand(1916);
  const baseH = groundH + secondH;
  const towerFloors = floors - 2;
  const towerTop = baseH + towerFloors * FH;
  const parapet = 1.2;

  const g = new THREE.Group();
  g.name = 'building';
  const { matStone, matSteel, I, opening, add, stoneBox, brickBox, finish } = createKit(g, r, { glass: 'sky' });

  const matBuff = brickMaterial('buff', grime('buff', { seed: 4, streaks: 18, strength: 0.18 }));
  const matCommon = (seed) => brickMaterial('common', grime(`loftcommon${seed}`, { seed, streaks: 60, strength: 0.8 }));
  const matBaseStone = matStone.clone();
  matBaseStone.color = new THREE.Color('#e4e3de');
  const frameGrey = '#5d6166';
  const revealBuff = '#8f8d88';

  // Window centres across the front: 3 | 5 | 3 with wider piers between groups.
  const steps = [1.41, 1.41, 1.88, 1.41, 1.41, 1.41, 1.41, 1.88, 1.41, 1.41];
  const xs = [1.19];
  steps.forEach((d) => xs.push(xs[xs.length - 1] + d));
  const WW = 1.04;
  const WH = 2.5;
  const winY = (f) => f * FH + 0.75 + WH / 2;

  // =====================================================================
  // STONE BASE (front)
  // =====================================================================
  const Fb = face(0, -W / 2, 0, D / 2);
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length;
  const groups = [xs.slice(0, 3), xs.slice(3, 8), xs.slice(8)];
  const baseHoles = [];
  groups.forEach((grp, i) => {
    baseHoles.push({
      x: mean(grp), y: groundH + 2.1, w: i === 1 ? 6.75 : 3.9, h: 3.2, kind: 'grid', cols: grp.length,
      room: 'warm', blinds: false, reveal: '#9f9d96', frame: frameGrey, rd: 0.3, sillColor: '#cfcdc6',
    });
  });
  baseHoles.push(
    { x: 2.55, y: 0.12 + 1.65, w: 2.2, h: 3.3, kind: 'lobby', room: 'lobby', reveal: '#8f8d87', frame: frameGrey, rd: 0.35, sill: false, roomDepth: 4 },
    { x: 7.4, y: 0.12 + 1.6, w: 2.8, h: 3.2, kind: 'french', room: 'warm', frame: '#4a1f17', reveal: '#8f8d87', rd: 0.25, sill: false, blinds: false },
    { x: 13.1, y: 0.12 + 1.65, w: 4.6, h: 3.3, kind: 'shop', room: 'shop', frame: '#3b3326', reveal: '#8f8d87', rd: 0.25, sill: false },
  );
  add(wall(Fb, W, baseH, baseHoles, matBaseStone));
  baseHoles.forEach((o) => opening(Fb, o));
  stoneBox(W + 0.1, 0.32, 0.3, 0, baseH - 0.05, D / 2 + 0.1); // belt course over the base
  stoneBox(W, 0.5, 0.12, 0, 0.25, D / 2 + 0.06); // granite plinth

  // "10" over the lobby, restaurant blade sign, shop lettering.
  {
    const num = textTexture({ text: address, width: 256, height: 128, bg: 'rgba(0,0,0,0)', ink: '#3b3b3b', font: '600 92px "Helvetica Neue", Arial' });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.45), new THREE.MeshBasicMaterial({ map: num, transparent: true }));
    plate.position.set(-W / 2 + 2.55, 3.95, D / 2 + 0.01);
    add(plate);
    const blade = textTexture({
      width: 128, height: 512, bg: '#9f1f1a',
      draw(ctx, w, h) {
        ctx.fillStyle = '#f2e6d0'; ctx.font = 'bold 64px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        'BAR'.split('').forEach((ch, i) => ctx.fillText(ch, w / 2, h * 0.3 + i * 90));
      },
    });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.7, 0.55), [
      new THREE.MeshStandardMaterial({ map: blade }), new THREE.MeshStandardMaterial({ map: blade }),
      matSteel, matSteel, matSteel, matSteel,
    ]);
    sign.position.set(-W / 2 + 9.2, 2.6, D / 2 + 0.32);
    add(sign);
    const decal = textTexture({
      width: 1024, height: 256, bg: 'rgba(0,0,0,0)', ink: '#ffffff',
      draw(ctx, w, h) {
        ctx.fillStyle = '#fff'; ctx.font = '700 92px "Helvetica Neue", Arial'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        ctx.fillText('Look', w * 0.52, h * 0.3);
        ctx.fillText("who's back", w * 0.52, h * 0.72);
      },
    });
    const d = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.6), new THREE.MeshBasicMaterial({ map: decal, transparent: true, depthWrite: false }));
    d.position.set(-W / 2 + mean(groups[1]), groundH + 1.7, D / 2 - 0.24);
    add(d);
  }
  // Blue leasing flag on an outrigger at the left of the 2nd floor.
  {
    const tex = textTexture({
      width: 256, height: 768, bg: '#2a5fb0', ink: '#fff',
      lines: flag.map((t, i) => ({ text: t, font: `bold ${i === 2 ? 40 : 52}px Arial` })),
    });
    const b = new THREE.Mesh(new THREE.PlaneGeometry(0.85, 2.5), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.7 }));
    b.rotation.y = -Math.PI / 2;
    b.position.set(-W / 2 + 0.3, groundH + 1.9, D / 2 + 0.65);
    b.rotation.z = 0.05;
    add(b);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.2), matSteel);
    rod.rotation.x = Math.PI / 2;
    rod.position.set(-W / 2 + 0.3, groundH + 3.2, D / 2 + 0.55);
    add(rod);
  }

  // =====================================================================
  // BUFF-BRICK TOWER (front)
  // =====================================================================
  const towerWallH = towerTop - baseH + parapet;
  const Ft = face(0, -W / 2, baseH, D / 2);
  const holes = [];
  for (let f = 0; f < towerFloors; f++) {
    for (const x of xs) holes.push({ x, y: winY(f), w: WW, h: WH, kind: 'dh', reveal: revealBuff, frame: frameGrey, sillColor: '#cfccc4', header: '#8e8c87', tint: r() < 0.12 ? '#6f7a84' : '#dfe6ec' });
  }
  add(wall(Ft, W, towerWallH, holes, matBuff));
  holes.forEach((o) => opening(Ft, o));
  // Pier relief between the window groups and at the corners.
  for (const x of [(xs[2] + xs[3]) / 2, (xs[7] + xs[8]) / 2, 0.35, W - 0.35]) {
    I.trim.add(piece(Ft, x, towerWallH / 2, 0.05, x < 1 || x > W - 1 ? 0.7 : 0.62, towerWallH, 0.1), '#a9a7a1');
  }
  // Narrow grey mullion strips between neighbouring windows in each group.
  for (let k = 0; k < xs.length - 1; k++) {
    if (k === 2 || k === 7) continue;
    I.trim.add(piece(Ft, (xs[k] + xs[k + 1]) / 2, towerWallH / 2 - parapet / 2, 0.03, 0.2, towerWallH - parapet, 0.06), '#a3a19b');
  }
  // Darker spandrel bands across each group, under the sills and over the heads.
  // Spandrels: lighter stack-bond brick panels between each head and the sill above.
  for (let f = 0; f < towerFloors; f++) {
    const y0 = winY(f) + WH / 2 + 0.12;
    const y1 = (f + 1 < towerFloors ? winY(f + 1) : towerTop - baseH + 0.6) - WH / 2 - 0.12;
    if (y1 - y0 < 0.2) continue;
    for (const x of xs) {
      I.trim.add(piece(Ft, x, (y0 + y1) / 2, 0.012, WW + 0.1, y1 - y0, 0.02), '#dedbd3');
      for (let k = -4; k <= 4; k++) I.trim.add(piece(Ft, x + k * 0.12, (y0 + y1) / 2, 0.024, 0.012, y1 - y0, 0.004), '#bcb8ae');
      for (let y = y0 + 0.09; y < y1; y += 0.09) I.trim.add(piece(Ft, x, y, 0.024, WW + 0.1, 0.01, 0.004), '#c9c5bc');
    }
  }
  // Simple stone cornice band + parapet coping.
  stoneBox(W + 0.3, 0.35, 0.4, 0, towerTop + 0.1, D / 2 + 0.1);
  stoneBox(W + 0.1, 0.22, 0.45, 0, towerTop + parapet + 0.1, D / 2 - 0.1);

  // =====================================================================
  // PARTY WALLS + REAR
  // =====================================================================
  const sideH = towerTop + parapet;
  add(wall(face(Math.PI / 2, W / 2, 0, D / 2), D, sideH, [], matCommon(1)));
  add(wall(face(-Math.PI / 2, -W / 2, 0, -D / 2), D, sideH, [], matCommon(2)));
  const Fr = face(Math.PI, W / 2, 0, -D / 2);
  const rear = [];
  const rearXs = [1.8, 4.5, 7.2, 10.2, 12.9, 15.6];
  for (let f = -1; f < towerFloors; f++) {
    for (const x of rearXs) {
      rear.push({ x, y: f < 0 ? groundH + 2.0 : baseH + winY(f), w: 1.2, h: 2.3, kind: 'dh', reveal: C.revealCommon, sillColor: '#b3a999' });
    }
  }
  add(wall(Fr, W, sideH, rear, matCommon(3)));
  rear.forEach((o) => opening(Fr, o));
  addFireEscape(I, { x0: -W / 2 + 1.0, x1: -W / 2 + 7.2, z: -D / 2, levels: [groundH + 0.9, ...[...Array(towerFloors).keys()].map((f) => baseH + f * FH + 0.75)] });

  // =====================================================================
  // ROOF + TERRACE
  // =====================================================================
  {
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: '#4f4b48', roughness: 1 }));
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = towerTop;
    roof.receiveShadow = true;
    add(roof);
    // Coping on the other three parapets.
    stoneBox(0.4, 0.22, D, W / 2 - 0.2, towerTop + parapet + 0.1, 0);
    stoneBox(0.4, 0.22, D, -W / 2 + 0.2, towerTop + parapet + 0.1, 0);
    stoneBox(W, 0.22, 0.4, 0, towerTop + parapet + 0.1, -D / 2 + 0.2);

    // Paver deck over the front two-thirds of the roof.
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 4; x++) {
        const v = 196 + r() * 26 | 0;
        ctx.fillStyle = `rgb(${v},${v - 3},${v - 8})`;
        ctx.fillRect(x * 64 + 2, y * 64 + 2, 60, 60);
      }
    }
    const paverTex = new THREE.CanvasTexture(c);
    paverTex.colorSpace = THREE.SRGBColorSpace;
    paverTex.wrapS = paverTex.wrapT = THREE.RepeatWrapping;
    const deckD = D * 0.66;
    paverTex.repeat.set((W - 0.8) / 2.4, deckD / 2.4);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(W - 0.8, 0.12, deckD), new THREE.MeshStandardMaterial({ map: paverTex, roughness: 0.9 }));
    deck.position.set(0, towerTop + 0.06, D / 2 - 0.4 - deckD / 2);
    deck.receiveShadow = true;
    add(deck);
    const top = towerTop + 0.12;

    // Black railing just inside the street parapet and down the east side.
    const zr = D / 2 - 0.55;
    for (let x = -W / 2 + 0.5; x <= W / 2 - 0.5; x += 0.12) I.steel.add(piece(new THREE.Matrix4(), x, top + 0.5, zr, 0.02, 1.0, 0.02));
    I.steel.add(piece(new THREE.Matrix4(), 0, top + 1.0, zr, W - 1.0, 0.05, 0.05));
    for (let z = zr; z >= zr - deckD + 0.4; z -= 0.12) I.steel.add(piece(new THREE.Matrix4(), -W / 2 + 0.5, top + 0.5, z, 0.02, 1.0, 0.02));
    I.steel.add(piece(new THREE.Matrix4(), -W / 2 + 0.5, top + 1.0, zr - deckD / 2 + 0.2, 0.05, 0.05, deckD - 0.4));

    const wicker = new THREE.MeshStandardMaterial({ color: '#4e4842', roughness: 0.95 });
    const cushion = new THREE.MeshStandardMaterial({ color: '#d4cbb8', roughness: 1 });
    const blue = new THREE.MeshStandardMaterial({ color: '#3d86b6', roughness: 0.4, metalness: 0.5 });
    const canvasMat = new THREE.MeshStandardMaterial({ color: '#dbcfb6', roughness: 0.95, side: THREE.DoubleSide });
    const put = (geo, mat, x, y, z, ry = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, top + y, z);
      m.rotation.y = ry;
      m.castShadow = m.receiveShadow = true;
      return add(m);
    };
    const seat = (x, z, w, ry) => {
      const grp = new THREE.Group();
      const parts = [
        [new THREE.BoxGeometry(w, 0.42, 0.85), wicker, 0, 0.21, 0],
        [new THREE.BoxGeometry(w, 0.45, 0.18), wicker, 0, 0.62, -0.34],
        [new THREE.BoxGeometry(w - 0.12, 0.14, 0.66), cushion, 0, 0.49, 0.05],
        [new THREE.BoxGeometry(w - 0.12, 0.4, 0.14), cushion, 0, 0.72, -0.22],
      ];
      for (const [geo, mat, px, py, pz] of parts) {
        const m = new THREE.Mesh(geo, mat);
        m.position.set(px, py, pz);
        m.castShadow = true;
        grp.add(m);
      }
      grp.position.set(x, top, z);
      grp.rotation.y = ry;
      add(grp);
    };
    const umbrella = (x, z, rad) => {
      put(new THREE.CylinderGeometry(0.03, 0.03, 2.5, 8), matSteel, x, 1.25, z);
      put(new THREE.ConeGeometry(rad, 0.55, 8, 1, true), canvasMat, x, 2.55, z);
      put(new THREE.CylinderGeometry(0.28, 0.28, 0.05, 16), matSteel, x, 0.03, z);
    };
    // Lounge: sofa + armchairs around an ottoman, under a big umbrella.
    const lz = D / 2 - 6.5;
    seat(-1.4, lz - 1.1, 2.2, 0);
    seat(-3.1, lz + 0.4, 0.85, Math.PI / 2);
    seat(0.6, lz + 0.6, 0.85, -Math.PI / 2 - 0.3);
    seat(-1.0, lz + 1.9, 0.85, Math.PI);
    put(new THREE.BoxGeometry(0.7, 0.4, 0.7), wicker, -1.1, 0.2, lz + 0.4);
    umbrella(-0.4, lz - 0.1, 1.8);
    // Blue bistro tables and chairs.
    for (const [x, z] of [[3.6, lz - 2.6], [5.6, lz - 1.4], [4.2, lz - 4.6], [6.4, lz - 3.8], [3.2, lz - 6.4], [5.8, lz - 6.2]]) {
      put(new THREE.CylinderGeometry(0.33, 0.33, 0.03, 16), blue, x, 0.73, z);
      put(new THREE.CylinderGeometry(0.025, 0.025, 0.72, 6), blue, x, 0.36, z);
      for (const a of [0, Math.PI]) {
        const cx = x + Math.sin(a) * 0.55;
        const cz = z + Math.cos(a) * 0.55;
        put(new THREE.BoxGeometry(0.4, 0.03, 0.4), blue, cx, 0.45, cz, a);
        put(new THREE.BoxGeometry(0.4, 0.38, 0.03), blue, cx + Math.sin(a) * 0.2, 0.66, cz + Math.cos(a) * 0.2, a);
        for (const [dx, dz] of [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]]) {
          put(new THREE.CylinderGeometry(0.012, 0.012, 0.45, 4), blue, cx + dx, 0.22, cz + dz);
        }
      }
    }
    umbrella(5.0, lz - 4.2, 1.5);
    // Wooden planters along the west parapet.
    const wood = new THREE.MeshStandardMaterial({ color: '#9c7b58', roughness: 0.85 });
    for (const z of [lz + 1, lz - 4.5, lz - 10]) put(new THREE.BoxGeometry(0.55, 0.65, 4.6), wood, W / 2 - 0.75, 0.33, z);

    // Metal-clad stair bulkhead and timber water tank at the rear.
    const clad = new THREE.MeshStandardMaterial({ color: '#1e2022', roughness: 0.55, metalness: 0.5 });
    const bulk = new THREE.Mesh(new THREE.BoxGeometry(4.2, 3.3, 5.6), clad);
    bulk.position.set(-W / 2 + 2.6, towerTop + 1.65, -D / 2 + 3.6);
    bulk.castShadow = bulk.receiveShadow = true;
    add(bulk);
    const winMat = new THREE.MeshStandardMaterial({ color: '#2a3138', roughness: 0.2, metalness: 0.6 });
    const bw = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.1), winMat);
    bw.position.set(-W / 2 + 4.72, towerTop + 2.1, -D / 2 + 3.6);
    bw.rotation.y = Math.PI / 2;
    add(bw);
    const tank = new THREE.Group();
    const staves = new THREE.MeshStandardMaterial({ color: '#8a8378', roughness: 0.9, metalness: 0.2 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.95, 3.6, 28), staves);
    body.position.y = 4.9;
    const lid = new THREE.Mesh(new THREE.ConeGeometry(2.05, 1.0, 28), new THREE.MeshStandardMaterial({ color: '#8c6a46', roughness: 0.9 }));
    lid.position.y = 7.2;
    tank.add(body, lid);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 3.1), matSteel);
      leg.position.set(Math.cos(a) * 1.5, 1.55, Math.sin(a) * 1.5);
      tank.add(leg);
    }
    for (const y of [4.0, 5.0, 6.0]) {
      const hoop = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.03, 6, 32), matSteel);
      hoop.rotation.x = Math.PI / 2;
      hoop.position.y = y;
      tank.add(hoop);
    }
    tank.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    tank.position.set(-W / 2 + 7.2, towerTop, -D / 2 + 4);
    add(tank);
  }

  finish();

  const floorRange = (n) => {
    if (n <= 1) return [0, groundH];
    if (n === 2) return [groundH, baseH];
    const y0 = baseH + (n - 3) * FH;
    return [y0, y0 + FH];
  };
  const totalH = towerTop + parapet;
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * totalH;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, D / 2 + 0.9);
      case 'back': return V((0.5 - u) * W, y, -D / 2 - 0.9);
      case 'right': return V(W / 2 + 0.9, y, (0.5 - u) * D);
      case 'left': return V(-W / 2 - 0.9, y, (u - 0.5) * D);
      case 'roof': return V((u - 0.5) * W, y, D / 2 - 6);
      default: return V(0, y, 0);
    }
  };

  return { group: g, width: W, depth: D, height: totalH + 6, floorRange, hotspotPosition };
}
