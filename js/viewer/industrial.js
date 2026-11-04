// Procedural model of the block-long commercial / warehouse property at
// 34-09 Queens Blvd (between 34th and 35th St), traced from satellite
// imagery + OSM (62 m frontage, roof ~15.5 m) and matched to the photos:
//   - four-storey front block along Queens Blvd (~17 m deep) and a west wing
//     running 45 m up 34th St, all with cream concrete pilasters and capped
//     posts above the parapet, light red brick bays with a dark red band on
//     every floor and small sparse windows
//   - street-level shops between the pilasters (Pin Framing awnings at the
//     34th St end, K2 Boxing, TLC signage toward 35th St)
//   - steel billboard frame on the west wing roof, running along 34th St with
//     its art-supply ad and First Pioneer panel facing east
//   - behind: a one-storey dock building on 35th St, a low link, the pink
//     loading-dock wing on a parking apron off 34th St, a brown brick rear
//     block, and the tall rear warehouse (brown brick panels between cream
//     pilasters, roof railing, rooftop units) reaching the next street north
import * as THREE from 'three';
import { grime, textTexture, rand } from './textures.js';
import { V, face, piece, boxGeo, brickMaterial, wall, createKit } from './kit.js';

export function buildIndustrial(params) {
  const { width: W = 62, depth: D = 152 } = params;
  const front = D / 2;
  // Traced plan (d = depth back from the Queens Blvd building line).
  const dA = 17; // four-storey front block depth
  const dB = 45; // four-storey west wing depth (along 34th St)
  const xWing = -2; // east edge of the west wing
  const dLow = 61; // rear of the low 35th St dock building / link
  const dRear = 91; // rear of the pink dock wing / brick rear block
  const xPink = -25.5; // dock wall of the pink wing (apron west of it)
  const xL = 2; // west edge of the brick rear block
  const Z = (d) => front - d;

  const r = rand(3409);
  const g1 = 4.6;
  const FH = 3.6;
  const floors = 3;
  const wallTop = g1 + floors * FH;
  const top = wallTop + 0.8;

  const g = new THREE.Group();
  g.name = 'building';
  const { matSteel, matStone, I, opening, add, finish } = createKit(g, r);
  const matRed = brickMaterial('qred', grime('qred', { seed: 34, streaks: 30, strength: 0.4 }));
  const matDark = brickMaterial('qdark');
  const matBrown = brickMaterial('qbrown', grime('qbrown', { seed: 36, streaks: 40, strength: 0.5 }));
  const cream = matStone.clone();
  cream.color = new THREE.Color('#ead9b8');
  const capMat = new THREE.MeshStandardMaterial({ color: '#7a4434', roughness: 0.8 });
  const roofMat = new THREE.MeshStandardMaterial({ color: '#4f4b47', roughness: 1 });

  const box = (mat, w, h, d, M) => {
    const m = new THREE.Mesh(boxGeo(w, h, d), mat);
    m.applyMatrix4(M);
    m.castShadow = m.receiveShadow = true;
    return add(m);
  };
  const M0 = new THREE.Matrix4();
  // Axis-aligned solid between x0..x1, d0..d1 (depths), y0..y1.
  const solid = (mat, x0, x1, d0, d1, y1, y0 = 0) => box(mat, x1 - x0, y1 - y0, d1 - d0, piece(M0, (x0 + x1) / 2, (y0 + y1) / 2, Z((d0 + d1) / 2), 1, 1, 1));
  const roofAt = (x0, x1, d0, d1, y, mat = roofMat) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, d1 - d0), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set((x0 + x1) / 2, y, Z((d0 + d1) / 2));
    m.receiveShadow = true;
    add(m);
  };

  // ---------------------------------------------------------------------
  // One pilastered elevation of the front block. `F` is the wall frame
  // (local x along the wall, +z out), `len` its length, `bays` the bay count.
  // `shop(i)` returns ground-floor options for bay i (or null for brick).
  // ---------------------------------------------------------------------
  function elevation(F, len, bays, shop) {
    const pil = 1.1;
    const bay = (len - pil) / bays;
    const holes = [];
    for (let i = 0; i < bays; i++) {
      const cx = pil + i * bay + (bay - pil) / 2;
      const s = shop(i, cx, bay - pil);
      if (s) holes.push({ x: cx, y: 0.12 + 1.75, w: bay - pil - 0.3, h: 3.5, kind: 'grid', cols: 3, transom: 0.7, room: s.dark ? undefined : 'shop', frame: '#1b1b1b', reveal: '#d8c7a6', rd: 0.25, sill: false, ...s.opening });
      for (let f = 0; f < floors; f++) {
        const y0 = g1 + f * FH;
        const p = r();
        if (p < 0.62) holes.push({ x: cx + (r() - 0.5) * 1.4, y: y0 + 2.45, w: 0.85, h: 0.6, kind: 'dh', frame: '#e8e8e4', reveal: '#c7b79c', rd: 0.15, sill: false });
        else if (p < 0.8) for (const dx of [-0.65, 0.65]) holes.push({ x: cx + dx, y: y0 + 1.95, w: 0.55, h: 1.4, kind: 'dh', frame: '#e8e8e4', reveal: '#c7b79c', rd: 0.15, sill: false });
      }
    }
    add(wall(F, len, top, holes, matRed));
    holes.forEach((o) => opening(F, o));
    for (let i = 0; i < bays; i++) {
      const cx = pil + i * bay + (bay - pil) / 2;
      for (let f = 0; f < floors; f++) {
        const y0 = g1 + f * FH;
        // Dark red band, then the cream floor beam above it.
        box(matDark, bay - pil, 0.95, 0.04, piece(F, cx, y0 + 1.05, 0.02, 1, 1, 1));
        box(cream, bay - pil, 0.4, 0.16, piece(F, cx, y0 + FH - 0.05, 0.08, 1, 1, 1));
      }
      box(cream, bay - pil, 0.5, 0.18, piece(F, cx, g1 - 0.2, 0.09, 1, 1, 1));
    }
    // Pilasters with capped posts above the parapet.
    for (let i = 0; i <= bays; i++) {
      const x = pil / 2 + i * bay;
      box(cream, pil, top + 0.2, 0.45, piece(F, x, (top + 0.2) / 2, 0.22, 1, 1, 1));
      box(cream, pil + 0.25, 1.4, 0.7, piece(F, x, top + 0.9, 0.22, 1, 1, 1));
      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.55, 4), capMat);
      hat.rotation.y = Math.PI / 4;
      hat.applyMatrix4(piece(F, x, top + 1.88, 0.22, 1, 1, 1));
      hat.castShadow = true;
      add(hat);
    }
    box(cream, len, 0.35, 0.3, piece(F, len / 2, top - 0.15, 0.1, 1, 1, 1));
    return { pil, bay };
  }
  // Plain back wall of the four-storey mass (brick with a cream coping).
  const backWall = (F, len, h = top) => {
    const holes = [];
    for (let x = 3; x < len - 2; x += 5.5) for (let f = 0; f < floors; f++) if (r() < 0.4) holes.push({ x, y: g1 + f * FH + 2.2, w: 0.8, h: 0.6, kind: 'dh', frame: '#e8e8e4', reveal: '#c7b79c', rd: 0.12, sill: false });
    add(wall(F, len, h, holes, matRed));
    holes.forEach((o) => opening(F, o));
    box(cream, len, 0.4, 0.35, piece(F, len / 2, h - 0.2, 0.1, 1, 1, 1));
  };

  // ---- Queens Blvd front (local x runs west -> east: 34th St -> 35th St) ----
  const Ff = face(0, -W / 2, 0, front);
  const bays = 11;
  const signs = [];
  const { pil, bay } = elevation(Ff, W, bays, (i, cx, w) => {
    signs.push([i, cx, w]);
    return { opening: {} };
  });
  // Storefront signage per bay, west to east (as photographed).
  const navy = new THREE.MeshStandardMaterial({ color: '#16336e', roughness: 0.6 });
  const blueAwn = new THREE.MeshStandardMaterial({ color: '#1d4fb8', roughness: 0.6 });
  const signBox = (cx, w, tex, y = 4.15, h = 0.95) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.2), [matSteel, matSteel, matSteel, matSteel, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }), matSteel]);
    m.applyMatrix4(piece(Ff, cx, y, 0.32, 1, 1, 1));
    m.castShadow = true;
    add(m);
  };
  const awning = (cx, w, mat, tex) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.0, 1.3), [mat, mat, mat, mat, tex ? new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }) : mat, mat]);
    m.applyMatrix4(piece(Ff, cx, 4.0, 0.75, 1, 1, 1));
    m.castShadow = true;
    add(m);
  };
  const T = (text, bg, ink, font = '800 92px Arial', sub = null) => textTexture({ text, sub, width: 1024, height: 200, bg, ink, font, subFont: '600 40px Arial' });
  for (const [i, cx, w] of signs) {
    if (i <= 1) awning(cx, w + 0.6, blueAwn, T('PIN FRAMING', '#1d4fb8', '#ffffff', '700 96px Georgia, serif', 'www.pinframing.com · 718-391-0022'));
    else if (i === 2) awning(cx, w + 0.4, navy, T('34-09', '#16336e', '#ffffff', '600 90px Georgia, serif'));
    else if (i === 3) awning(cx, w + 0.4, new THREE.MeshStandardMaterial({ color: '#8f1d1d', roughness: 0.6 }), T('QUEENS HOME GALLERY', '#8f1d1d', '#f6e7b6', '800 72px Arial'));
    else if (i === 5) signBox(cx, w, T('K2 BOXING CLUB', '#111111', '#ffffff', '800 96px Arial', '718 361 5252 · www.k2boxing.com'));
    else if (i === 6) signBox(cx, w, T('NYC DRIVERS ASSISTANCE', '#f4f4f2', '#1a1a1a', '800 70px Arial', 'TLC Summonses · DMV Tickets'));
    else if (i === 7) signBox(cx, w, T('TLC LAWYERS', '#101010', '#ffd94a', '800 104px Arial', 'Industry Representatives'));
    else if (i === 8 || i === 9) signBox(cx, w + pil, T('INSURANCE', '#101010', '#ffffff', '900 120px Arial', 'N.Y. AUTO BROKERAGE'), 4.1, 1.4);
    else if (i === 10) signBox(cx, w, T('TLC INSURANCE', '#101010', '#ffd94a', '800 92px Arial', 'Car Service · Black Car'), 4.1, 1.4);
  }
  // "Commercial space for lease" posters in the empty Pin Framing windows.
  {
    const lease = textTexture({ lines: [{ text: 'COMMERCIAL', font: 'bold 34px Arial' }, { text: 'SPACE', font: 'bold 34px Arial' }, { text: 'FOR LEASE', font: 'bold 34px Arial' }, { text: 'FIRST PIONEER', font: '600 24px Georgia' }, { text: '718-482-0700', font: '600 22px Arial' }], width: 256, height: 384, bg: '#f6f6f3', ink: '#1d3c7a' });
    for (const [i, cx] of signs.slice(0, 2)) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.1), new THREE.MeshBasicMaterial({ map: lease }));
      p.applyMatrix4(piece(Ff, cx + (i % 2 ? 0.8 : -0.8), 1.6, -0.18, 1, 1, 1));
      add(p);
    }
  }

  // ---- side elevations: 34th St (front block + west wing), 35th St corner ----
  const sideBays = 8;
  elevation(face(-Math.PI / 2, -W / 2, 0, Z(dB)), dB, sideBays, (i) => (i >= sideBays - 2 ? { opening: {} } : null));
  elevation(face(Math.PI / 2, W / 2, 0, front), dA, 3, (i) => (i <= 1 ? { opening: {} } : null));
  // Back walls of the four-storey L.
  backWall(face(Math.PI, W / 2, 0, Z(dA)), W / 2 - xWing);
  backWall(face(Math.PI / 2, xWing, 0, Z(dA)), dB - dA);
  backWall(face(Math.PI, xWing, 0, Z(dB)), xWing + W / 2);
  // Roof of the L with a mechanical bulkhead and hatch.
  roofAt(-W / 2, W / 2, 0, dA, top - 0.3);
  roofAt(-W / 2, xWing, dA, dB, top - 0.3);
  {
    const mech = new THREE.Mesh(new THREE.BoxGeometry(7, 3.0, 5), new THREE.MeshStandardMaterial({ color: '#8f9396', roughness: 0.6, metalness: 0.3 }));
    mech.position.set(12, top + 1.2, Z(9));
    mech.castShadow = true;
    add(mech);
    for (const [x, d] of [[22, 8], [4, 11], [-8, 30]]) box(new THREE.MeshStandardMaterial({ color: '#9a9d9f', roughness: 0.6, metalness: 0.3 }), 2.4, 1.3, 1.8, piece(M0, x, top + 0.35, Z(d), 1, 1, 1));
  }

  // =====================================================================
  // BILLBOARD: steel lattice along 34th St on the west wing roof (traced
  // from its shadow on 34th St), ad panels facing east.
  // =====================================================================
  {
    const px = -W / 2 + 14; // panel plane (east face of the frame)
    const backX = -W / 2 + 2.5; // rear legs
    const d0 = 3;
    const len = 40;
    const base = top - 0.3;
    const heightAt = (d) => {
      const t = Math.abs((d - d0) / len - 0.5) * 2; // 0 centre .. 1 ends
      return t < 0.35 ? 14 : t < 0.7 ? 12 : 9.5;
    };
    const S = (x, y, z, sx, sy, sz, q) => I.steel.add(piece(M0, x, y, z, sx, sy, sz, q));
    const ds = [];
    for (let d = d0; d <= d0 + len + 0.01; d += 3.2) ds.push(d);
    for (const d of ds) {
      const h = heightAt(d);
      S(px, base + h / 2, Z(d), 0.18, h, 0.18);
      S(px - 2.5, base + h * 0.4, Z(d), 0.14, h * 0.8, 0.14);
      // Raking strut back to the rear leg (A-frame).
      const dx = px - 2.5 - backX;
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.atan2(h * 0.8, dx)));
      S((px - 2.5 + backX) / 2, base + h * 0.4, Z(d), Math.hypot(dx, h * 0.8), 0.12, 0.12, q);
      for (let y = 3; y < h; y += 3) S(px - 1.25, base + y, Z(d), 2.5, 0.1, 0.1);
    }
    for (let y = 3; y <= 14; y += 3) {
      const ok = ds.filter((d) => heightAt(d) >= y);
      if (ok.length < 2) continue;
      for (const x of [px, px - 2.5]) S(x, base + y, Z((ok[0] + ok[ok.length - 1]) / 2), 0.12, 0.12, ok[ok.length - 1] - ok[0]);
      for (let k = 0; k < ok.length - 1; k++) {
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler((k % 2 ? 1 : -1) * Math.atan2(3, 3.2), 0, 0));
        S(px - 2.5, base + y - 1.5, Z((ok[k] + ok[k + 1]) / 2), 0.07, 0.07, Math.hypot(3, 3.2), q);
      }
    }
    // Ad panels hung on the east face of the frame.
    const ad = textTexture({
      width: 1024, height: 560, bg: '#f4f6ef',
      draw(ctx, w, h) {
        const grd = ctx.createLinearGradient(0, 0, w, h); grd.addColorStop(0, '#d9efe3'); grd.addColorStop(1, '#bfe0f0');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = '#2d8a3e'; ctx.beginPath(); ctx.ellipse(170, 300, 140, 110, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffffff'; ctx.font = 'italic 700 46px Georgia'; ctx.textAlign = 'center'; ctx.fillText('Artist', 170, 290); ctx.font = '600 28px Georgia'; ctx.fillText('& CRAFTSMAN', 170, 330);
        ctx.fillStyle = '#d23a2a'; ctx.font = '800 64px Arial'; ctx.textAlign = 'left'; ctx.fillText('ART & CRAFT SUPPLIES', 340, 140);
        ctx.fillStyle = '#1f3d7a'; ctx.font = '700 44px Arial'; ctx.fillText('4 LOCATIONS IN NYC', 340, 80);
        ctx.fillStyle = '#d23a2a'; ctx.fillRect(700, 380, 260, 90); ctx.fillStyle = '#fff'; ctx.font = '700 40px Arial'; ctx.fillText('OPEN ON 34TH ST', 712, 438);
      },
    });
    const fp = textTexture({
      width: 1024, height: 560, bg: '#ffffff',
      draw(ctx) {
        const s = 64;
        for (let c = 0; c < 4; c++) for (let k = 0; k <= c; k++) {
          ctx.fillStyle = k === c ? '#d4511e' : '#163f8f';
          ctx.fillRect(80 + c * (s + 4), 380 - k * (s + 4), s, s);
        }
        ctx.fillStyle = '#163f8f'; ctx.textAlign = 'left';
        ctx.font = '400 150px "Libre Bodoni", "Times New Roman", Georgia, serif';
        ctx.fillText('FIRST', 400, 250); ctx.fillText('PIONEER', 400, 400);
        ctx.font = '400 38px "Times New Roman", Georgia, serif'; ctx.fillText('P R O P E R T I E S ,  I N C .', 404, 460);
      },
    });
    // From the 35th St corner the ad reads on the left (south), First Pioneer on the right (north).
    const panel = (tex, dc, w) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.55), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, side: THREE.DoubleSide }));
      m.rotation.y = Math.PI / 2;
      m.position.set(px + 0.15, base + 2.5 + (w * 0.55) / 2, Z(dc));
      m.castShadow = true;
      add(m);
    };
    panel(ad, d0 + len / 2 - 7.5, 15);
    panel(fp, d0 + len / 2 + 7, 12.5);
  }

  // =====================================================================
  // LOW BUILDINGS BEHIND THE FRONT BLOCK
  // =====================================================================
  // One-storey dock building on 35th St (behind the corner), and the low link
  // behind the west wing.
  const HC = 6.5;
  solid(matRed, xWing, W / 2, dA, dLow, HC);
  roofAt(xWing, W / 2, dA, dLow, HC + 0.02);
  box(cream, 0.35, 0.4, dLow - dA, piece(M0, W / 2 + 0.05, HC - 0.2, Z((dA + dLow) / 2), 1, 1, 1));
  {
    // Roll-up dock doors under a canopy on 35th St.
    const F35 = face(Math.PI / 2, W / 2, 0, Z(dA));
    const doors = [{ x: 6, y: 2.3, w: 4.4, h: 4.2, kind: 'panel', panel: '#cfd2d4', reveal: '#3c3834', rd: 0.25, sill: false }, { x: 13, y: 2.3, w: 4.4, h: 4.2, kind: 'panel', panel: '#b7babc', reveal: '#3c3834', rd: 0.25, sill: false }];
    doors.forEach((o) => opening(F35, o));
    box(new THREE.MeshStandardMaterial({ color: '#4a4e52', roughness: 0.5, metalness: 0.4 }), 13, 0.3, 2.4, piece(F35, 9.5, 4.8, 1.2, 1, 1, 1));
  }
  solid(matBrown, -W / 2, xWing, dB, dLow, 5);
  roofAt(-W / 2, xWing, dB, dLow, 5.02);

  // Pink loading-dock wing on the apron off 34th St (as photographed).
  const graffiti = textTexture({
    width: 256, height: 256, bg: '#5b5550',
    draw(ctx, w, h) {
      const cols = ['#e0e0e0', '#7fb3ff', '#ffd23f', '#e04f9b', '#1f1f1f'];
      for (let k = 0; k < 7; k++) {
        ctx.strokeStyle = cols[Math.floor(r() * cols.length)]; ctx.lineWidth = 6 + r() * 8; ctx.beginPath();
        ctx.moveTo(r() * w, r() * h); for (let j = 0; j < 4; j++) ctx.quadraticCurveTo(r() * w, r() * h, r() * w, r() * h); ctx.stroke();
      }
    },
  });
  {
    const H1 = 6.5;
    const HP = 11;
    const lenP = dRear - dLow;
    solid(matBrown, xPink, xL, dLow, dRear, HP);
    roofAt(xPink, xL, dLow, dRear, HP + 0.02);
    const Fp = face(-Math.PI / 2, xPink - 0.02, 0, Z(dRear));
    const doorHoles = [];
    for (let x = 3; x < lenP - 2; x += 4.4) doorHoles.push({ x, y: 1.25 + 1.2, w: 3.0, h: 2.6, kind: 'panel', panel: '#55504b', reveal: '#3c3834', rd: 0.3, sill: false });
    add(wall(Fp, lenP, H1, doorHoles, matBrown));
    doorHoles.forEach((o) => opening(Fp, o));
    for (const o of doorHoles) {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(o.w - 0.1, o.h - 0.1), new THREE.MeshStandardMaterial({ map: graffiti, roughness: 0.8 }));
      d.applyMatrix4(piece(Fp, o.x, o.y, -0.22, 1, 1, 1));
      add(d);
    }
    const pink = new THREE.MeshStandardMaterial({ color: '#c96b62', roughness: 0.85 });
    box(pink, lenP * 0.7, HP - H1 - 0.3, 0.3, piece(Fp, lenP * 0.65, H1 + (HP - H1) / 2, 0.15, 1, 1, 1));
    box(new THREE.MeshStandardMaterial({ color: '#9ea2a4', roughness: 0.5, metalness: 0.3 }), lenP * 0.3, HP - H1 - 0.3, 0.3, piece(Fp, lenP * 0.15, H1 + (HP - H1) / 2, 0.15, 1, 1, 1));
    box(cream, lenP, 0.35, 3.4, piece(Fp, lenP / 2, H1, 1.7, 1, 1, 1)); // dock canopy
    for (let x = lenP * 0.4; x < lenP; x += 6) I.trim.add(piece(Fp, x, H1 + 2.2, 0.5, 0.9, 0.6, 0.4), '#e6e6e2'); // AC units
  }

  // =====================================================================
  // REAR: brick rear block and the tall rear warehouse (brown brick panels
  // between cream pilasters, roof railing) up to the next street north.
  // =====================================================================
  const panels = (F, len, H2, rail = true) => {
    const n = Math.max(2, Math.round(len / 5.6));
    const step = (len - 1) / n;
    add(wall(F, len, H2, [], matBrown));
    for (let i = 0; i <= n; i++) box(cream, 1.0, H2, 0.4, piece(F, 0.5 + i * step, H2 / 2, 0.2, 1, 1, 1));
    box(cream, len, 1.6, 0.3, piece(F, len / 2, 0.8, 0.15, 1, 1, 1));
    box(cream, len, 0.9, 0.35, piece(F, len / 2, H2 - 0.45, 0.17, 1, 1, 1));
    if (!rail) return;
    for (let x = 0.5; x < len; x += 2.2) I.steel.add(piece(F, x, H2 + 0.55, -0.4, 0.05, 1.1, 0.05));
    I.steel.add(piece(F, len / 2, H2 + 1.1, -0.4, len, 0.06, 0.06));
  };
  {
    const HL = 12;
    solid(matBrown, xL, W / 2, dLow, dRear, HL - 0.05);
    roofAt(xL, W / 2, dLow, dRear, HL);
    panels(face(Math.PI / 2, W / 2, 0, Z(dLow)), dRear - dLow, HL, false);
    for (const [x, d] of [[10, 70], [18, 82], [25, 66]]) box(new THREE.MeshStandardMaterial({ color: '#8a6b55', roughness: 0.7, metalness: 0.2 }), 3, 1.6, 2.4, piece(M0, x, HL + 0.8, Z(d), 1, 1, 1));
  }
  {
    const H2 = 13.3;
    solid(matBrown, -W / 2, W / 2, dRear, D, H2 - 0.05);
    roofAt(-W / 2, W / 2, dRear, D, H2, new THREE.MeshStandardMaterial({ color: '#8d8a84', roughness: 1 }));
    panels(face(-Math.PI / 2, -W / 2, 0, Z(D)), D - dRear, H2); // 34th St side
    panels(face(Math.PI / 2, W / 2, 0, Z(dRear)), D - dRear, H2); // 35th St side
    panels(face(Math.PI, W / 2, 0, Z(D)), W, H2); // north street
    // Personnel door on 34th St.
    const Fw = face(-Math.PI / 2, -W / 2, 0, Z(D));
    box(new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.7 }), 4.6, 4.4, 0.1, piece(Fw, D - dRear - 6, 2.2, 0.06, 1, 1, 1));
    // Teal rooftop units and a roof hatch, as seen from above.
    const teal = new THREE.MeshStandardMaterial({ color: '#8fc0bd', roughness: 0.5, metalness: 0.3 });
    for (const [x, d, w] of [[-12, 128, 14], [17, 138, 12]]) box(teal, w, 1.8, 3.6, piece(M0, x, H2 + 0.9, Z(d), 1, 1, 1));
    for (const [x, d] of [[-14, 104], [12, 108]]) box(teal, 9, 1.6, 3, piece(M0, x, H2 + 0.8, Z(d), 1, 1, 1));
    box(new THREE.MeshStandardMaterial({ color: '#4a4a4a', roughness: 0.8 }), 3.2, 1.0, 3.2, piece(M0, 2, H2 + 0.5, Z(120), 1, 1, 1));
  }

  finish();

  const floorRange = (n) => (n <= 1 ? [0, g1] : [g1 + (n - 2) * FH, g1 + (n - 1) * FH]);
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * top;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, front + 1.5);
      case 'back': return V((0.5 - u) * W, y, -front - 2);
      case 'left': return V(-W / 2 - 2, y, front - u * D);
      case 'right': return V(W / 2 + 1.5, y, front - u * D);
      case 'roof': return V(-W / 2 + 14, y, front - 3 - u * 40);
      default: return V(0, y, 0);
    }
  };
  return { group: g, width: W, depth: D, height: top + 3, floorRange, hotspotPosition };
}
