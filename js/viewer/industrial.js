// Procedural model of a block-long commercial / warehouse building, matched
// to photos of 34-09 Queens Blvd (between 34th and 35th St):
//   - front block, four storeys: cream concrete pilasters with capped posts
//     rising above the parapet, cream floor beams, light red brick bays with a
//     dark red band on every floor and small sparse windows
//   - street-level shops between the pilasters (Pin Framing awnings at the
//     34th St end, K2 Boxing, TLC signage toward 35th St)
//   - rooftop steel billboard frame with an art-supply ad and a First Pioneer
//     panel; mechanical bulkhead
//   - rear warehouse: brown brick panels between cream pilasters, roof
//     railing, a pink-walled loading dock wing with roll-up doors and graffiti
import * as THREE from 'three';
import { grime, textTexture, rand } from './textures.js';
import { V, face, piece, boxGeo, brickMaterial, wall, createKit } from './kit.js';

export function buildIndustrial(params) {
  const { width: W = 85, frontDepth: D1 = 40, rearDepth: D2 = 40 } = params;
  const D = D1 + D2;
  const front = D / 2;
  const split = front - D1; // z where the front block meets the rear warehouse

  const r = rand(3409);
  const g1 = 5.0;
  const FH = 4.4;
  const floors = 3;
  const wallTop = g1 + floors * FH;
  const top = wallTop + 1.0;

  const g = new THREE.Group();
  g.name = 'building';
  const { matStone, matSteel, I, opening, add, finish } = createKit(g, r);
  const matRed = brickMaterial('qred', grime('qred', { seed: 34, streaks: 30, strength: 0.4 }));
  const matDark = brickMaterial('qdark');
  const matBrown = brickMaterial('qbrown', grime('qbrown', { seed: 36, streaks: 40, strength: 0.5 }));
  const cream = matStone.clone();
  cream.color = new THREE.Color('#ead9b8');
  const capMat = new THREE.MeshStandardMaterial({ color: '#7a4434', roughness: 0.8 });

  const box = (mat, w, h, d, M) => {
    const m = new THREE.Mesh(boxGeo(w, h, d), mat);
    m.applyMatrix4(M);
    m.castShadow = m.receiveShadow = true;
    return add(m);
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
      if (s) holes.push({ x: cx, y: 0.12 + 1.85, w: bay - pil - 0.3, h: 3.7, kind: 'grid', cols: 3, transom: 0.7, room: s.dark ? undefined : 'shop', frame: '#1b1b1b', reveal: '#d8c7a6', rd: 0.25, sill: false, ...s.opening });
      for (let f = 0; f < floors; f++) {
        const y0 = g1 + f * FH;
        const p = r();
        if (p < 0.62) holes.push({ x: cx + (r() - 0.5) * 1.6, y: y0 + 3.0, w: 0.85, h: 0.6, kind: 'dh', frame: '#e8e8e4', reveal: '#c7b79c', rd: 0.15, sill: false });
        else if (p < 0.8) for (const dx of [-0.7, 0.7]) holes.push({ x: cx + dx, y: y0 + 2.4, w: 0.55, h: 1.5, kind: 'dh', frame: '#e8e8e4', reveal: '#c7b79c', rd: 0.15, sill: false });
      }
    }
    add(wall(F, len, top, holes, matRed));
    holes.forEach((o) => opening(F, o));
    for (let i = 0; i < bays; i++) {
      const cx = pil + i * bay + (bay - pil) / 2;
      for (let f = 0; f < floors; f++) {
        const y0 = g1 + f * FH;
        // Dark red band, then the cream floor beam above it.
        box(matDark, bay - pil, 1.1, 0.04, piece(F, cx, y0 + 1.35, 0.02, 1, 1, 1));
        box(cream, bay - pil, 0.45, 0.16, piece(F, cx, y0 + FH - 0.05, 0.08, 1, 1, 1));
      }
      box(cream, bay - pil, 0.5, 0.18, piece(F, cx, g1 - 0.2, 0.09, 1, 1, 1));
    }
    // Pilasters with capped posts above the parapet.
    for (let i = 0; i <= bays; i++) {
      const x = pil / 2 + i * bay;
      box(cream, pil, top + 0.2, 0.45, piece(F, x, (top + 0.2) / 2, 0.22, 1, 1, 1));
      box(cream, pil + 0.25, 1.5, 0.7, piece(F, x, top + 0.95, 0.22, 1, 1, 1));
      const hat = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.55, 4), capMat);
      hat.rotation.y = Math.PI / 4;
      hat.applyMatrix4(piece(F, x, top + 1.98, 0.22, 1, 1, 1));
      hat.castShadow = true;
      add(hat);
    }
    box(cream, len, 0.35, 0.3, piece(F, len / 2, top - 0.15, 0.1, 1, 1, 1));
    return { pil, bay };
  }

  // ---- Queens Blvd front (local x runs west -> east: 34th St -> 35th St) ----
  const Ff = face(0, -W / 2, 0, front);
  const bays = 14;
  const signs = [];
  const { pil, bay } = elevation(Ff, W, bays, (i, cx, w) => {
    signs.push([i, cx, w]);
    return { opening: {} };
  });
  // Storefront signage per bay, west to east.
  const navy = new THREE.MeshStandardMaterial({ color: '#16336e', roughness: 0.6 });
  const blueAwn = new THREE.MeshStandardMaterial({ color: '#1d4fb8', roughness: 0.6 });
  const signBox = (cx, w, tex, y = 4.35, h = 0.95) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.2), [matSteel, matSteel, matSteel, matSteel, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }), matSteel]);
    m.applyMatrix4(piece(Ff, cx, y, 0.32, 1, 1, 1));
    m.castShadow = true;
    add(m);
  };
  const awning = (cx, w, mat, tex) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 1.0, 1.3), [mat, mat, mat, mat, tex ? new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }) : mat, mat]);
    m.applyMatrix4(piece(Ff, cx, 4.2, 0.75, 1, 1, 1));
    m.rotation.x = 0;
    m.castShadow = true;
    add(m);
  };
  const T = (text, bg, ink, font = '800 92px Arial', sub = null) => textTexture({ text, sub, width: 1024, height: 200, bg, ink, font, subFont: '600 40px Arial' });
  for (const [i, cx, w] of signs) {
    if (i <= 2) awning(cx, w + 0.6, blueAwn, T('PIN FRAMING', '#1d4fb8', '#ffffff', '700 96px Georgia, serif', 'www.pinframing.com · 718-391-0022'));
    else if (i === 3) awning(cx, w + 0.4, navy, T('34-09', '#16336e', '#ffffff', '600 90px Georgia, serif'));
    else if (i === 4) awning(cx, w + 0.4, new THREE.MeshStandardMaterial({ color: '#8f1d1d', roughness: 0.6 }), T('QUEENS HOME GALLERY', '#8f1d1d', '#f6e7b6', '800 72px Arial'));
    else if (i === 7) signBox(cx, w, T('K2 BOXING CLUB', '#111111', '#ffffff', '800 96px Arial', '718 361 5252 · www.k2boxing.com'));
    else if (i === 8) signBox(cx, w, T('NYC DRIVERS ASSISTANCE', '#f4f4f2', '#1a1a1a', '800 70px Arial', 'TLC Summonses · DMV Tickets'));
    else if (i === 9) signBox(cx, w, T('TLC LAWYERS', '#101010', '#ffd94a', '800 104px Arial', 'Industry Representatives'));
    else if (i === 10 || i === 11) signBox(cx, w + pil, T('INSURANCE', '#101010', '#ffffff', '900 120px Arial', 'N.Y. AUTO BROKERAGE'), 4.3, 1.4);
    else if (i >= 12) signBox(cx, w, T('TLC INSURANCE', '#101010', '#ffd94a', '800 92px Arial', 'Car Service · Black Car'), 4.3, 1.4);
  }
  // "Commercial space for lease" posters in the empty Pin Framing windows.
  {
    const lease = textTexture({ lines: [{ text: 'COMMERCIAL', font: 'bold 34px Arial' }, { text: 'SPACE', font: 'bold 34px Arial' }, { text: 'FOR LEASE', font: 'bold 34px Arial' }, { text: 'FIRST PIONEER', font: '600 24px Georgia' }, { text: '718-482-0700', font: '600 22px Arial' }], width: 256, height: 384, bg: '#f6f6f3', ink: '#1d3c7a' });
    for (const [i, cx] of signs.slice(0, 3)) {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.1), new THREE.MeshBasicMaterial({ map: lease }));
      p.applyMatrix4(piece(Ff, cx + (i % 2 ? 0.8 : -0.8), 1.6, -0.18, 1, 1, 1));
      add(p);
    }
  }

  // ---- side elevations of the front block (34th St at -x, 35th St at +x) ----
  const sideBays = Math.round(D1 / bay);
  elevation(face(-Math.PI / 2, -W / 2, 0, split), D1, sideBays, (i) => (i >= sideBays - 2 ? { opening: {} } : null));
  elevation(face(Math.PI / 2, W / 2, 0, front), D1, sideBays, (i) => (i <= 1 ? { opening: {} } : null));
  // Loading bay at the back of the 35th St side.
  {
    const door = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 4.0), new THREE.MeshStandardMaterial({ color: '#cfd2d4', roughness: 0.5, metalness: 0.4 }));
    door.rotation.y = Math.PI / 2;
    door.position.set(W / 2 + 0.05, 2.0, split + 4.5);
    add(door);
  }

  // =====================================================================
  // ROOF: bulkhead and the billboard frame
  // =====================================================================
  {
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(W, D1), new THREE.MeshStandardMaterial({ color: '#58534e', roughness: 1 }));
    roof.rotation.x = -Math.PI / 2;
    roof.position.set(0, top - 0.3, split + D1 / 2);
    roof.receiveShadow = true;
    add(roof);
    const mech = new THREE.Mesh(new THREE.BoxGeometry(8, 3.4, 6), new THREE.MeshStandardMaterial({ color: '#8f9396', roughness: 0.6, metalness: 0.3 }));
    mech.position.set(-4, top + 1.4, front - 14);
    mech.castShadow = true;
    add(mech);

    // Steel lattice frame: columns, rails, diagonals, stepped top.
    const bx0 = -W / 2 + 6;
    const bw = 32;
    const bz = front - 10;
    const base = top - 0.3;
    const heightAt = (x) => {
      const t = Math.abs((x - bx0) / bw - 0.5) * 2; // 0 centre .. 1 ends
      return t < 0.35 ? 22 : t < 0.7 ? 19.5 : 16;
    };
    const S = (x, y, z, sx, sy, sz, q) => I.steel.add(piece(new THREE.Matrix4(), x, y, z, sx, sy, sz, q));
    for (let x = bx0; x <= bx0 + bw + 0.01; x += 3.2) {
      const h = heightAt(x);
      for (const dz of [0, -3]) S(x, base + h / 2, bz + dz, 0.16, h, 0.16);
      for (let y = 3; y < h; y += 3) S(x, base + y, bz - 1.5, 0.1, 0.1, 3);
    }
    for (let y = 3; y <= 22; y += 3) {
      const xs = [];
      for (let x = bx0; x <= bx0 + bw + 0.01; x += 3.2) if (heightAt(x) >= y) xs.push(x);
      if (xs.length < 2) continue;
      for (const dz of [0, -3]) S((xs[0] + xs[xs.length - 1]) / 2, base + y, bz + dz, xs[xs.length - 1] - xs[0], 0.12, 0.12);
      for (let k = 0; k < xs.length - 1; k++) {
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, (k % 2 ? 1 : -1) * Math.atan2(3, 3.2)));
        S((xs[k] + xs[k + 1]) / 2, base + y - 1.5, bz - 3, Math.hypot(3, 3.2), 0.07, 0.07, q);
      }
    }
    // Ad panels hung on the front of the frame.
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
      draw(ctx, w, h) {
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
    const panel = (tex, x0, w) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.55), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, side: THREE.DoubleSide }));
      m.position.set(x0 + w / 2, base + 3 + (w * 0.55) / 2 + 2, bz + 0.15);
      m.castShadow = true;
      add(m);
    };
    panel(ad, bx0 + 1, 16);
    panel(fp, bx0 + 17, 13);
  }

  // =====================================================================
  // REAR WAREHOUSE: brown brick panels between cream pilasters
  // =====================================================================
  {
    const H2 = 19;
    const z0 = -front;
    const pil = 1.0;
    const panels = (F, len) => {
      const n = Math.max(2, Math.round(len / 5.6));
      const step = (len - pil) / n;
      add(wall(F, len, H2, [], matBrown));
      for (let i = 0; i <= n; i++) box(cream, pil, H2, 0.4, piece(F, pil / 2 + i * step, H2 / 2, 0.2, 1, 1, 1));
      box(cream, len, 1.6, 0.3, piece(F, len / 2, 0.8, 0.15, 1, 1, 1));
      box(cream, len, 0.9, 0.35, piece(F, len / 2, H2 - 0.45, 0.17, 1, 1, 1));
      // Roof railing.
      for (let x = 0.5; x < len; x += 2.2) I.steel.add(piece(F, x, H2 + 0.55, -0.4, 0.05, 1.1, 0.05));
      I.steel.add(piece(F, len / 2, H2 + 1.1, -0.4, len, 0.06, 0.06));
    };
    panels(face(-Math.PI / 2, -W / 2, 0, z0), D2); // 34th St side
    panels(face(Math.PI / 2, W / 2, 0, split), D2); // 35th St side
    // Rear: west half brown panels, east half the pink loading-dock wing.
    const half = W * 0.45;
    panels(face(Math.PI, -W / 2 + half, 0, z0), half);
    const Fp = face(Math.PI, W / 2, 0, z0);
    const lenP = W - half;
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
    const doorHoles = [];
    for (let x = 3; x < lenP - 2; x += 4.4) doorHoles.push({ x, y: 1.25 + 1.2, w: 3.0, h: 2.6, kind: 'panel', panel: '#55504b', reveal: '#3c3834', rd: 0.3, sill: false });
    add(wall(Fp, lenP, 6.5, doorHoles, matBrown));
    doorHoles.forEach((o) => opening(Fp, o));
    for (const o of doorHoles) {
      const d = new THREE.Mesh(new THREE.PlaneGeometry(o.w - 0.1, o.h - 0.1), new THREE.MeshStandardMaterial({ map: graffiti, roughness: 0.8 }));
      d.applyMatrix4(piece(Fp, o.x, o.y, -0.22, 1, 1, 1));
      add(d);
    }
    const pink = new THREE.MeshStandardMaterial({ color: '#c96b62', roughness: 0.85 });
    box(pink, lenP, 4.5, 0.3, piece(Fp, lenP / 2, 6.5 + 2.25, -1.0, 1, 1, 1));
    box(cream, lenP, 0.35, 3.4, piece(Fp, lenP / 2, 6.5, 0.9, 1, 1, 1)); // dock canopy
    box(new THREE.MeshStandardMaterial({ color: '#9ea2a4', roughness: 0.5 }), lenP, H2 - 11, 0.3, piece(Fp, lenP / 2, 11 + (H2 - 11) / 2, -3, 1, 1, 1));
    for (let x = 2; x < lenP; x += 7) I.trim.add(piece(Fp, x, 8.4, -0.8, 0.9, 0.6, 0.4), '#e6e6e2'); // AC units
    const roof2 = new THREE.Mesh(new THREE.PlaneGeometry(W, D2), new THREE.MeshStandardMaterial({ color: '#5a5550', roughness: 1 }));
    roof2.rotation.x = -Math.PI / 2;
    roof2.position.set(0, H2 - 0.2, z0 + D2 / 2);
    add(roof2);
  }

  finish();

  const floorRange = (n) => (n <= 1 ? [0, g1] : [g1 + (n - 2) * FH, g1 + (n - 1) * FH]);
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * top;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, front + 1.5);
      case 'back': return V((0.5 - u) * W, y, -front - 2);
      case 'right': return V(W / 2 + 1.5, y, front - u * D);
      case 'roof': return V((u - 0.5) * W, y, front - 10);
      default: return V(0, y, 0);
    }
  };
  return { group: g, width: W, depth: D, height: top + 3, floorRange, hotspotPosition };
}
