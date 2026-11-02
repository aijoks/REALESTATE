// Procedural model of a Rosario Candela-era pre-war brick office building,
// matched to street photos of 120 E 56th St:
//   - 2-storey chocolate-brick base, 3 bays split by piers with ball finials,
//     5 big 2nd-floor windows, retail + lobby at grade
//   - red-brown brick tower with two projecting corner pavilions (windows on
//     their inner returns) and a recessed 3-bay centre
//   - limestone stringcourses, stone-framed top floors, corbelled ledges and a
//     shaped (Flemish) centre gable
//   - plain common-brick side / rear walls, fire escape, bulkhead, water tank
// Every window is a real recessed opening with frame, glass, blind and a fake
// interior, so the model reads correctly from any angle.
import * as THREE from 'three';
import { grime, textTexture, stripedAwning, leaseBannerTexture, rand } from './textures.js';
import { V, C, face, piece, boxGeo, brickMaterial, wall, createKit } from './kit.js';

export function buildPrewarBrick(params) {
  const {
    floors = 15,
    width: W = 18.3,
    depth: D = 30.5,
    groundH = 4.2,
    secondH = 3.8,
    floorH: FH = 3.35,
    pavilionWidth: pw = 4.4,
    pavilionProjection: proj = 1.6,
    leaseBanner = null,
  } = params;

  const r = rand(1926);
  const baseH = groundH + secondH;
  const towerFloors = floors - 2;
  const towerTop = baseH + towerFloors * FH;
  const parapet = 1.4;
  const cw = W - 2 * pw;
  const zc = D / 2 - proj;

  const g = new THREE.Group();
  g.name = 'building';

  // ---------- materials ----------
  const matTower = (seed) => brickMaterial('tower', grime(`tower${seed}`, { seed, streaks: 50, strength: 0.55 }));
  const matBase = brickMaterial('base', grime('base', { seed: 9, streaks: 20, strength: 0.6 }));
  const matCommon = (seed) => brickMaterial('common', grime(`common${seed}`, { seed, streaks: 70, strength: 0.9 }));
  const matTowerPlain = brickMaterial('tower');
  const matBasePlain = brickMaterial('base');
  const matCommonPlain = brickMaterial('common');
  const { matStone, matSteel, I, opening, add, stoneBox, brickBox, finish } = createKit(g, r);

  const winY = (f) => f * FH + 0.85 + 0.925; // window centre above a tower floor's base
  const WH = 1.85;
  const crown = (f) => f >= towerFloors - 2;

  // =====================================================================
  // RETAIL BASE (front)
  // =====================================================================
  const Fb = face(0, -W / 2, 0, D / 2);
  const X = (x) => x + W / 2; // world x -> base-wall local x
  const baseHoles = [];
  const secondY = groundH + 1.75;
  for (const x of [-7.3, -3.7, 0, 3.7, 7.3]) {
    baseHoles.push({ x: X(x), y: secondY, w: 2.6, h: 2.1, kind: 'band', room: 'warm', reveal: C.revealBase, rd: 0.3 });
  }
  baseHoles.push(
    { x: X(-8.2), y: 0.12 + 1.3, w: 1.0, h: 2.6, kind: 'panel', panel: '#121212', reveal: C.revealBase, rd: 0.15, sill: false },
    { x: X(-6.85), y: 0.12 + 1.45, w: 1.3, h: 2.9, kind: 'shop', room: 'shop', reveal: C.revealBase, rd: 0.15, sill: false },
    { x: X(-4.0), y: 0.12 + 1.45, w: 3.0, h: 2.9, kind: 'shop', room: 'shop', reveal: C.revealBase, rd: 0.2, sill: false },
    { x: X(0), y: 0.12 + 1.625, w: 2.3, h: 3.25, kind: 'lobby', room: 'lobby', reveal: '#151515', rd: 0.35, sill: false, roomDepth: 4 },
    { x: X(3.4), y: 0.12 + 1.35, w: 2.0, h: 2.7, kind: 'french', room: 'warm', frame: C.wood, reveal: C.revealBase, rd: 0.2, sill: false, blinds: false },
    { x: X(5.45), y: 0.12 + 1.3, w: 0.75, h: 2.6, kind: 'shop', room: 'warm', frame: C.wood, reveal: C.revealBase, rd: 0.2, sill: false, blinds: false },
  );
  add(wall(Fb, W, baseH, baseHoles, matBase));
  baseHoles.forEach((o) => opening(Fb, o));

  // Piers + ball finials, stone coping band across the full front.
  for (const sx of [-1, 1]) {
    brickBox(matBasePlain, 0.6, baseH + 0.55, 0.3, sx * 1.83, (baseH + 0.55) / 2, D / 2 + 0.15);
    stoneBox(0.78, 0.26, 0.48, sx * 1.83, baseH + 0.68, D / 2 + 0.15);
    stoneBox(0.5, 0.2, 0.4, sx * 1.83, baseH + 0.9, D / 2 + 0.15);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.27, 24, 16), matStone);
    ball.position.set(sx * 1.83, baseH + 1.27, D / 2 + 0.15);
    ball.castShadow = true;
    add(ball);
    brickBox(matBasePlain, 0.4, baseH, 0.14, sx * (W / 2 - 0.2), baseH / 2, D / 2 + 0.07);
  }
  stoneBox(W + 0.16, 0.3, 0.55, 0, baseH + 0.15, D / 2 - 0.08);
  // Recessed ledge (roof of the base between the pavilions).
  {
    const ledge = new THREE.Mesh(new THREE.PlaneGeometry(cw, proj), new THREE.MeshStandardMaterial({ color: '#5d5853', roughness: 1 }));
    ledge.rotation.x = -Math.PI / 2;
    ledge.position.set(0, baseH + 0.31, zc + proj / 2 - 0.1);
    ledge.receiveShadow = true;
    add(ledge);
  }

  // Storefront signage --------------------------------------------------
  {
    const tex = textTexture({
      width: 2048, height: 240, bg: '#111',
      draw(ctx, w, h) {
        const crownIcon = (cx) => {
          ctx.fillStyle = '#f1f1f1';
          ctx.beginPath();
          ctx.moveTo(cx - 34, h * 0.62); ctx.lineTo(cx - 40, h * 0.28); ctx.lineTo(cx - 16, h * 0.46);
          ctx.lineTo(cx, h * 0.2); ctx.lineTo(cx + 16, h * 0.46); ctx.lineTo(cx + 40, h * 0.28); ctx.lineTo(cx + 34, h * 0.62);
          ctx.closePath(); ctx.fill();
        };
        crownIcon(w * 0.22); crownIcon(w * 0.78);
        ctx.fillStyle = '#f1f1f1';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '700 128px "Helvetica Neue", Arial, sans-serif';
        ctx.fillText("TRUMAN'S", w / 2, h * 0.4);
        ctx.font = '500 44px Georgia, serif';
        ctx.fillText("G E N T L E M E N ' S   G R O O M E R S", w / 2, h * 0.82);
      },
    });
    const black = new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.5 });
    const sign = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.85, 0.2), [
      black, black, black, black, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.45 }), black,
    ]);
    sign.position.set(-5.65, 3.65, D / 2 + 0.1);
    sign.castShadow = true;
    add(sign);
  }
  // Black lobby portal with "120" in the transom.
  {
    const black = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.4, metalness: 0.2 });
    const jamb = (x, w) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, 3.9, 0.3), black); m.position.set(x, 1.95, D / 2 + 0.15); m.castShadow = true; add(m); };
    jamb(-1.34, 0.38); jamb(1.34, 0.38);
    const top = new THREE.Mesh(new THREE.BoxGeometry(3.06, 0.53, 0.3), black);
    top.position.set(0, 3.635, D / 2 + 0.15);
    add(top);
    const num = textTexture({ text: '120', width: 256, height: 96, bg: '#1b1b1b', ink: '#f4f4f4', font: '600 64px "Helvetica Neue", Arial' });
    const plate = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.28), new THREE.MeshBasicMaterial({ map: num }));
    plate.position.set(0, 3.07, D / 2 - 0.27);
    add(plate);
  }
  // Striped awning with valance text.
  {
    const slopeTex = stripedAwning('');
    const slope = new THREE.Mesh(new THREE.PlaneGeometry(7.3, Math.hypot(1.3, 0.55)), new THREE.MeshStandardMaterial({ map: slopeTex, side: THREE.DoubleSide, roughness: 0.8 }));
    slope.rotation.x = -Math.atan2(1.3, 0.55);
    slope.position.set(5.65, 3.675, D / 2 + 0.65);
    slope.castShadow = true;
    add(slope);
    const val = new THREE.Mesh(new THREE.PlaneGeometry(7.3, 0.34), new THREE.MeshStandardMaterial({ map: stripedAwning('120 E. 56TH     MiRano     RISTORANTE'), roughness: 0.8 }));
    val.position.set(5.65, 3.23, D / 2 + 1.3);
    add(val);
  }
  // Blue vestibule enclosure.
  {
    const blue = new THREE.MeshStandardMaterial({ color: '#1f63d6', roughness: 0.55 });
    const front = textTexture({
      width: 512, height: 576, bg: '#1f63d6',
      draw(ctx, w, h) {
        const grd = ctx.createLinearGradient(0, 80, 0, 420);
        grd.addColorStop(0, '#f6d7a0'); grd.addColorStop(1, '#8a5a32');
        ctx.fillStyle = grd; ctx.fillRect(60, 70, w - 120, 330);
        ctx.strokeStyle = '#0f3f99'; ctx.lineWidth = 14; ctx.strokeRect(60, 70, w - 120, 330);
        ctx.fillStyle = '#fff'; ctx.font = 'italic 700 74px Georgia, serif';
        ctx.textAlign = 'center'; ctx.fillText('MiRano', w / 2, 260);
      },
    });
    const box = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.7, 1.3), [blue, blue, blue, blue, new THREE.MeshStandardMaterial({ map: front, roughness: 0.4 }), blue]);
    box.position.set(7.7, 1.35, D / 2 + 0.65);
    box.castShadow = box.receiveShadow = true;
    add(box);
  }
  // "22 Day Spa" blue banners on outriggers at both ends of the 2nd floor.
  {
    const tex = textTexture({
      width: 256, height: 768, bg: '#1e6fd9', ink: '#fff',
      lines: [
        { text: '(22)', font: 'bold 54px Georgia' }, { text: 'DAY SPA', font: 'bold 50px Georgia' },
        { text: 'Awarded', font: 'italic 34px Georgia' }, { text: '#1', font: 'bold 50px Georgia' },
        { text: 'Day Spa', font: '34px Georgia' }, { text: 'in NYC', font: '34px Georgia' },
        { text: '120 E 56 St', font: '26px Georgia' }, { text: '2nd Floor', font: '26px Georgia' },
      ],
    });
    const mat = new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.7 });
    for (const sx of [-1, 1]) {
      const b = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 2.4), mat);
      b.rotation.y = sx * Math.PI / 2;
      b.position.set(sx * (W / 2 - 0.3), groundH + 1.45, D / 2 + 0.6);
      add(b);
      for (const yy of [groundH + 2.7, groundH + 0.22]) {
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.0), matSteel);
        rod.rotation.x = Math.PI / 2;
        rod.position.set(sx * (W / 2 - 0.3), yy, D / 2 + 0.5);
        add(rod);
      }
    }
  }
  // Gooseneck lamps over the right-hand 2nd-floor windows.
  for (const x of [2.9, 6.5]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.5), matSteel);
    arm.position.set(x, groundH + 3.05, D / 2 + 0.25);
    const shade = new THREE.Mesh(new THREE.ConeGeometry(0.17, 0.16, 16, 1, true), new THREE.MeshStandardMaterial({ color: '#1d1d1d', side: THREE.DoubleSide, metalness: 0.5, roughness: 0.4 }));
    shade.position.set(x, groundH + 2.97, D / 2 + 0.5);
    add(arm); add(shade);
  }

  // =====================================================================
  // TOWER FRONT: pavilions, returns, recessed centre
  // =====================================================================
  const towerWallH = towerTop - baseH;
  const pavH = towerWallH + parapet;
  const Fpl = face(0, -W / 2, baseH, D / 2);
  const Fpr = face(0, W / 2 - pw, baseH, D / 2);
  const Frl = face(Math.PI / 2, -W / 2 + pw, baseH, D / 2);
  const Frr = face(-Math.PI / 2, W / 2 - pw, baseH, zc);
  const Fc = face(0, -W / 2 + pw, baseH, zc);

  const floorsList = [...Array(towerFloors).keys()];
  const towerWin = (x, f, w, kind) => ({
    x, y: winY(f), w, h: WH, kind, reveal: C.revealTower,
    header: crown(f) ? null : C.header, surround: crown(f),
  });

  for (const [F, seed] of [[Fpl, 31], [Fpr, 32]]) {
    const holes = floorsList.map((f) => towerWin(pw / 2, f, 2.3, 'dh2'));
    add(wall(F, pw, pavH, holes, matTower(seed)));
    holes.forEach((o) => opening(F, o));
  }
  for (const [F, seed] of [[Frl, 33], [Frr, 34]]) {
    const holes = floorsList.map((f) => ({ ...towerWin(proj / 2, f, 0.8, 'dh'), over: 0.3, roomDepth: 1.8, surround: false, header: C.header }));
    add(wall(F, proj, pavH, holes, matTower(seed)));
    holes.forEach((o) => opening(F, o));
  }
  {
    const holes = [];
    for (const f of floorsList) for (const dx of [-3.0, 0, 3.0]) holes.push(towerWin(cw / 2 + dx, f, 1.55, 'dh2'));
    add(wall(Fc, cw, towerWallH, holes, matTower(35)));
    holes.forEach((o) => opening(Fc, o));
    // Stone spandrel panels tying the two stone-framed top floors together.
    for (const dx of [-3.0, 0, 3.0]) {
      const y0 = winY(towerFloors - 2) + WH / 2 + 0.36;
      const y1 = winY(towerFloors - 1) - WH / 2 - 0.13;
      I.trim.add(piece(Fc, cw / 2 + dx, (y0 + y1) / 2, 0.03, 1.55 + 0.48, y1 - y0, 0.06), C.stoneDark);
    }
  }

  // Limestone stringcourse under the stone-framed top floors, and a
  // corbelled ledge under the top floor of each pavilion.
  {
    const yb = (towerFloors - 2) * FH + 0.35;
    stoneBox(cw, 0.26, 0.16, cw / 2, yb, 0.08, Fc);
    for (const F of [Fpl, Fpr]) stoneBox(pw + 0.1, 0.26, 0.16, pw / 2, yb, 0.08, F);
    for (const F of [Frl, Frr]) stoneBox(proj, 0.26, 0.16, proj / 2, yb, 0.08, F);
    const yl = (towerFloors - 1) * FH + 0.38;
    for (const F of [Fpl, Fpr]) {
      stoneBox(pw + 0.3, 0.3, 0.5, pw / 2, yl, 0.25, F);
      for (const dx of [-1.5, -0.5, 0.5, 1.5]) stoneBox(0.22, 0.4, 0.34, pw / 2 + dx, yl - 0.33, 0.17, F);
    }
    // Lower stringcourse above the 2nd tower floor.
    const y2 = 2 * FH + 0.15;
    stoneBox(cw, 0.16, 0.1, cw / 2, y2, 0.05, Fc);
    for (const F of [Fpl, Fpr]) stoneBox(pw, 0.16, 0.1, pw / 2, y2, 0.05, F);
    for (const F of [Frl, Frr]) stoneBox(proj, 0.16, 0.1, proj / 2, y2, 0.05, F);
  }

  // Shaped (Flemish) centre gable with stone coping and medallion.
  {
    const half = [[0, parapet], [0.9, parapet], [0.9, 2.0], [1.9, 2.0]];
    const quad = (a, c, b, n = 7) => {
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        half.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]);
      }
    };
    quad([1.9, 2.0], [2.95, 2.0], [2.95, 3.0]);
    half.push([3.25, 3.0], [3.25, 3.3]);
    quad([3.25, 3.3], [3.25, 4.2], [cw / 2, 4.3], 8);
    const top = [...half, ...half.slice(0, -1).reverse().map(([x, y]) => [cw - x, y])];
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    top.forEach(([x, y]) => s.lineTo(x, y));
    s.lineTo(cw, 0);
    s.closePath();
    const gGeo = new THREE.ExtrudeGeometry(s, { depth: 0.4, bevelEnabled: false });
    gGeo.translate(0, 0, -0.4);
    const gable = new THREE.Mesh(gGeo, matTowerPlain);
    gable.applyMatrix4(piece(Fc, 0, towerWallH, 0, 1, 1, 1));
    gable.castShadow = gable.receiveShadow = true;
    add(gable);
    const band = new THREE.Shape();
    band.moveTo(top[0][0] - 0.12, top[0][1] + 0.1);
    top.forEach(([x, y]) => band.lineTo(x, y + 0.1));
    band.lineTo(top[top.length - 1][0] + 0.12, top[top.length - 1][1] + 0.1);
    [...top].reverse().forEach(([x, y]) => band.lineTo(x, y - 0.16));
    band.closePath();
    const bGeo = new THREE.ExtrudeGeometry(band, { depth: 0.6, bevelEnabled: false });
    bGeo.translate(0, 0, -0.5);
    const coping = new THREE.Mesh(bGeo, matStone);
    coping.applyMatrix4(piece(Fc, 0, towerWallH, 0, 1, 1, 1));
    coping.castShadow = true;
    add(coping);
    const med = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.14, 32), matStone);
    med.rotation.x = Math.PI / 2;
    med.applyMatrix4(piece(Fc, cw / 2, towerWallH + 2.75, 0.07, 1, 1, 1));
    add(med);
    const fin = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), matStone);
    fin.applyMatrix4(piece(Fc, cw / 2, towerWallH + 4.6, -0.15, 1, 1, 1));
    add(fin);
  }

  // =====================================================================
  // SIDE + REAR WALLS (common brick)
  // =====================================================================
  const sideH = towerTop + parapet;
  const sideWin = (x, f) => ({ x, y: baseH + winY(f), w: 1.2, h: WH, kind: 'dh', reveal: C.revealCommon, sillColor: '#b3a999' });
  {
    // West (+x) — a blank party wall; the fluted tower next door is built
    // against it, leaving only the front strip with the leasing banner exposed.
    const Fw = face(Math.PI / 2, W / 2, 0, D / 2);
    const holes = [];
    add(wall(Fw, D, sideH, holes, matCommon(41)));
    holes.forEach((o) => opening(Fw, o));
    // East (-x), local x runs rear -> front.
    const Fe = face(-Math.PI / 2, -W / 2, 0, -D / 2);
    const holesE = [];
    for (const f of floorsList) {
      for (const x of [1.8, 4.0, 6.2]) holesE.push(sideWin(x, f));
      if (f >= 4) for (const x of [D - 1.7, D - 3.4]) holesE.push(sideWin(x, f));
    }
    add(wall(Fe, D, sideH, holesE, matCommon(42)));
    holesE.forEach((o) => opening(Fe, o));
    // Rear.
    const Fr = face(Math.PI, W / 2, 0, -D / 2);
    const holesR = [];
    const rearXs = [1.9, 5.5, 9.15, 12.8, 16.4];
    for (const x of rearXs) holesR.push({ ...sideWin(x, 0), y: groundH + 1.75, w: 1.4 });
    for (const f of floorsList) for (const x of rearXs) holesR.push({ ...sideWin(x, f), w: 1.4 });
    holesR.push({ x: 9.15, y: 0.12 + 1.15, w: 1.1, h: 2.3, kind: 'panel', panel: '#3a3f44', sill: false, reveal: C.revealCommon });
    add(wall(Fr, W, sideH, holesR, matCommon(43)));
    holesR.forEach((o) => opening(Fr, o));

    // Leasing banner near the front of the west wall, hung from a steel rail.
    if (leaseBanner) {
      const bw = 4.4;
      const bh = 19;
      const bz = D / 2 - 3.3;
      const by = baseH + 0.9 + bh / 2;
      const banner = new THREE.Mesh(
        new THREE.PlaneGeometry(bw, bh),
        new THREE.MeshStandardMaterial({ map: leaseBannerTexture(leaseBanner), roughness: 0.7 }),
      );
      banner.position.set(W / 2 + 0.07, by, bz);
      banner.rotation.y = Math.PI / 2;
      banner.castShadow = true;
      add(banner);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.22, bw + 0.5), matSteel);
      rail.position.set(W / 2 + 0.09, by + bh / 2 + 0.12, bz);
      add(rail);
      for (const dz of [-bw / 2 - 0.15, bw / 2 + 0.15]) {
        const strap = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.1, 0.06), matSteel);
        strap.position.set(W / 2 + 0.07, by + bh / 2 + 0.6, bz + dz);
        add(strap);
      }
    }

    // Fire escape on the rear wall.
    const fx0 = -1.2;
    const fx1 = 4.8;
    const fwid = fx1 - fx0;
    const fdep = 1.2;
    const zr = -D / 2;
    const levels = [groundH + 0.85, ...floorsList.map((f) => baseH + f * FH + 0.82)];
    const S = (x, y, z, sx, sy, sz, q) => I.steel.add(piece(new THREE.Matrix4(), x, y, z, sx, sy, sz, q));
    levels.forEach((y, i) => {
      S((fx0 + fx1) / 2, y, zr - fdep / 2, fwid, 0.06, fdep);
      S((fx0 + fx1) / 2, y + 0.95, zr - fdep, fwid, 0.04, 0.04);
      S(fx0, y + 0.95, zr - fdep / 2, 0.04, 0.04, fdep);
      S(fx1, y + 0.95, zr - fdep / 2, 0.04, 0.04, fdep);
      for (let x = fx0; x <= fx1 + 0.001; x += 0.16) S(x, y + 0.48, zr - fdep, 0.018, 0.95, 0.018);
      for (let z = 0.16; z < fdep; z += 0.16) { S(fx0, y + 0.48, zr - z, 0.018, 0.95, 0.018); S(fx1, y + 0.48, zr - z, 0.018, 0.95, 0.018); }
      for (const x of [fx0 + 0.3, fx1 - 0.3]) S(x, y - 0.45, zr - 0.4, 0.05, 0.9, 0.05, new THREE.Quaternion().setFromEuler(new THREE.Euler(0.8, 0, 0)));
      if (i < levels.length - 1) {
        const y2 = levels[i + 1];
        const dir = i % 2 ? 1 : -1;
        const xa = dir > 0 ? fx0 + 0.6 : fx1 - 0.6;
        const xb = xa + dir * 3.4;
        const len = Math.hypot(xb - xa, y2 - y);
        const ang = Math.atan2(y2 - y, xb - xa);
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, ang));
        for (const dz of [0.12, 0.72]) S((xa + xb) / 2, (y + y2) / 2, zr - dz, len, 0.12, 0.03, q);
        const steps = 13;
        for (let k = 1; k < steps; k++) {
          const t = k / steps;
          S(xa + (xb - xa) * t, y + (y2 - y) * t, zr - 0.42, 0.24, 0.025, 0.6);
        }
      }
    });
  }

  // =====================================================================
  // ROOF
  // =====================================================================
  {
    const s = new THREE.Shape();
    const pts = [[-W / 2, -D / 2], [W / 2, -D / 2], [W / 2, D / 2], [W / 2 - pw, D / 2], [W / 2 - pw, zc], [-W / 2 + pw, zc], [-W / 2 + pw, D / 2], [-W / 2, D / 2]];
    s.moveTo(pts[0][0], -pts[0][1]);
    pts.slice(1).forEach(([x, z]) => s.lineTo(x, -z));
    const roof = new THREE.Mesh(new THREE.ShapeGeometry(s), new THREE.MeshStandardMaterial({ color: '#4f4b48', roughness: 1 }));
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = towerTop;
    roof.receiveShadow = true;
    add(roof);

    // Parapet coping around the perimeter (centre gable has its own).
    const cap = towerTop + parapet + 0.13;
    const seg = (x1, z1, x2, z2) => {
      const len = Math.hypot(x2 - x1, z2 - z1) + 0.3;
      const m = stoneBox(len, 0.26, 0.5, (x1 + x2) / 2, cap, (z1 + z2) / 2);
      m.rotation.y = -Math.atan2(z2 - z1, x2 - x1);
    };
    seg(-W / 2, D / 2, -W / 2 + pw, D / 2);
    seg(-W / 2 + pw, D / 2, -W / 2 + pw, zc);
    seg(W / 2 - pw, zc, W / 2 - pw, D / 2);
    seg(W / 2 - pw, D / 2, W / 2, D / 2);
    seg(W / 2, D / 2, W / 2, -D / 2);
    seg(W / 2, -D / 2, -W / 2, -D / 2);
    seg(-W / 2, -D / 2, -W / 2, D / 2);

    // Stair/elevator bulkhead.
    brickBox(matCommonPlain, 4.6, 3.4, 6.5, -W / 2 + 3.2, towerTop + 1.7, -D / 2 + 5);
    stoneBox(4.8, 0.22, 6.7, -W / 2 + 3.2, towerTop + 3.5, -D / 2 + 5);
    const door = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 2.1), new THREE.MeshStandardMaterial({ color: '#3b4045', roughness: 0.6 }));
    door.position.set(-W / 2 + 3.2, towerTop + 1.05, -D / 2 + 8.26);
    add(door);

    // Timber water tank on a steel stand.
    const wt = new THREE.Group();
    const stave = textTexture({
      width: 512, height: 256, bg: '#6b4a2e',
      draw(ctx, w, h) {
        const rr = rand(77);
        for (let x = 0; x < w; x += 16) { ctx.fillStyle = `rgb(${95 + rr() * 30 | 0},${66 + rr() * 20 | 0},${42 + rr() * 14 | 0})`; ctx.fillRect(x, 0, 15, h); }
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        for (let x = 0; x < w; x += 16) ctx.fillRect(x + 15, 0, 1, h);
        ctx.fillStyle = '#2a2a2a';
        for (const y of [0.15, 0.4, 0.65, 0.88]) ctx.fillRect(0, h * y, w, 5);
      },
    });
    stave.wrapS = THREE.RepeatWrapping;
    stave.repeat.set(3, 1);
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.05, 3.8, 32, 1, true), new THREE.MeshStandardMaterial({ map: stave, roughness: 0.95, side: THREE.DoubleSide }));
    tank.position.y = 5.2;
    const lid = new THREE.Mesh(new THREE.ConeGeometry(2.2, 1.3, 32), new THREE.MeshStandardMaterial({ color: '#33302d', roughness: 0.9 }));
    lid.position.y = 7.75;
    const floorDisc = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.15, 24), matSteel);
    floorDisc.position.y = 3.25;
    wt.add(tank, lid, floorDisc);
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 3.2), matSteel);
      leg.position.set(Math.cos(a) * 1.6, 1.6, Math.sin(a) * 1.6);
      wt.add(leg);
      const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.4), matSteel);
      const b = (i + 1) / 6 * Math.PI * 2;
      brace.position.set((Math.cos(a) + Math.cos(b)) * 0.8, 1.6, (Math.sin(a) + Math.sin(b)) * 0.8);
      brace.lookAt(Math.cos(b) * 1.6, 3.2, Math.sin(b) * 1.6);
      brace.rotateX(Math.PI / 2);
      wt.add(brace);
    }
    wt.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    wt.position.set(W / 2 - 4.2, towerTop, -D / 2 + 11);
    add(wt);

    // Rooftop HVAC units.
    const hvac = new THREE.MeshStandardMaterial({ color: '#b8bcbf', roughness: 0.45, metalness: 0.55 });
    for (const [x, z] of [[-2.5, 3], [0.5, 3], [3.5, 3], [-1, -2]]) {
      const u = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 1.6), hvac);
      u.position.set(x, towerTop + 0.55, z);
      u.castShadow = true;
      add(u);
      const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.06, 20), matSteel);
      fan.position.set(x, towerTop + 1.13, z);
      add(fan);
    }
  }

  finish();

  // ---------- helpers exposed to the viewer ----------
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
      case 'back': return V((0.5 - u) * W, y, -D / 2 - 1.8);
      case 'right': return V(W / 2 + 0.9, y, (0.5 - u) * D);
      case 'left': return V(-W / 2 - 0.9, y, (u - 0.5) * D);
      case 'roof': return V((u - 0.5) * W, y, 0);
      default: return V(0, y, 0);
    }
  };

  return { group: g, width: W, depth: D, height: totalH + 4, floorRange, hotspotPosition };
}
