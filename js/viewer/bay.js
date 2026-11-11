// Procedural model of a narrow grey stone loft with a dark metal window bay,
// matched to photos of 8 W 36th St:
//   - dark granite ground floor: YOON Haeundae Galbi with its gold mark, and the No. 8
//     entrance under a small canopy; tall 2nd-floor window above
//   - ten office floors: smooth grey stone piers framing a wide bay of four
//     black-framed windows per floor with projecting dark metal spandrels
//   - west side wall exposed above the neighbouring garage: grey render, a
//     column of windows near the street and a tall First Pioneer banner
//   - plain parapet, roof bulkhead and timber water tank, rear fire escape
import * as THREE from 'three';
import { grime, textTexture, rand } from './textures.js';
import { V, C, face, piece, brickMaterial, wall, createKit, addFireEscape } from './kit.js';

// Vertical First Pioneer banner (white vinyl, staircase mark, rotated text).
function bannerTexture() {
  return textTexture({
    width: 512, height: 1700, bg: '#f5f4f0',
    draw(ctx, w, h) {
      const s = 62;
      for (let c = 0; c < 4; c++) {
        for (let k = 0; k <= c; k++) {
          ctx.fillStyle = k === c ? '#d4511e' : '#2a6fc4';
          ctx.fillRect(110 + c * (s + 3), 420 - k * (s + 3), s, s);
        }
      }
      ctx.save();
      ctx.translate(w / 2 + 40, 540);
      ctx.rotate(Math.PI / 2);
      ctx.fillStyle = '#2a6fc4';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.font = '400 205px "Libre Bodoni", "Times New Roman", Georgia, serif';
      ctx.fillText('FIRST', 0, -110);
      ctx.fillText('PIONEER', 0, 80);
      ctx.font = '400 40px "Times New Roman", Georgia, serif';
      ctx.fillText('P R O P E R T I E S ,   I N C .', 8, 205);
      ctx.font = '600 26px Arial, sans-serif';
      ctx.fillStyle = '#6b7c8f';
      ctx.fillText('NEXT GENERATION REAL ESTATE', 8, 245);
      ctx.restore();
    },
  });
}

export function buildStoneBay(params) {
  const { width: W = 10.5, depth: D = 30.5, garageH = 11 } = params;

  const r = rand(1910);
  // Storey heights fitted to the surveyed roof height (NYC/OSM: 34.5 m) and
  // the photo, where the garage decks next door line up with the floors.
  const g1 = 4.1;
  const g2 = 3.1;
  const baseH = g1 + g2;
  const FH = 2.66;
  const floors = 10;
  const top = baseH + floors * FH + 0.7;

  const g = new THREE.Group();
  g.name = 'building';
  const { matStone, matSteel, I, opening, add, stoneBox, finish } = createKit(g, r, { glass: 'sky' });
  const matGrey = matStone.clone();
  matGrey.map = matStone.map;
  matGrey.color = new THREE.Color('#b9b6ae');
  const renderGrey = new THREE.MeshStandardMaterial({ color: '#a7a49d', roughness: 0.95 });
  // Weathered grey stucco for the exposed side wall.
  const stucco = brickMaterial('common', grime('baystucco', { seed: 361, streaks: 35, strength: 0.3 }));
  stucco.map = matStone.map; stucco.normalMap = null; stucco.color = new THREE.Color('#f0ede6');
  const bannerH = 10.5;
  const bannerTop = garageH + 3 + bannerH;
  const granite = new THREE.MeshStandardMaterial({ color: '#2b2a2a', roughness: 0.35, metalness: 0.2 });
  const matCommon = (seed) => brickMaterial('common', grime(`baycommon${seed}`, { seed, streaks: 50, strength: 0.7 }));
  const black = '#1d1f21';
  const pier = 1.25;
  const cw = W - 2 * pier;
  const cx = [-1.5, -0.5, 0.5, 1.5].map((k) => W / 2 + k * (cw / 4));
  const cww = cw / 4 - 0.18;
  const skyTint = () => (r() < 0.25 ? '#3a434c' : r() < 0.6 ? '#b9c7d3' : '#d5dee6');

  // =====================================================================
  // GROUND + 2ND FLOOR
  // =====================================================================
  const Fb = face(0, -W / 2, 0, D / 2);
  const baseHoles = [
    // YOON's storefront: dark-tinted glass over a dim, warm interior (photos);
    // the fixed colour also reads as glass from inside the floor cut-away.
    { x: 2.9, y: 0.12 + 1.75, w: 4.6, h: 3.5, kind: 'grid', cols: 3, transom: 0.8, room: 'warm', roomColor: '#5a4637', blinds: false, frame: '#141414', reveal: '#2b2a2a', rd: 0.25, sill: false },
    { x: 7.9, y: 0.12 + 1.45, w: 1.9, h: 2.9, kind: 'lobby', room: 'lobby', frame: '#141414', reveal: '#2b2a2a', rd: 0.5, sill: false, roomDepth: 4 },
    { x: W / 2, y: g1 + g2 / 2 + 0.1, w: cw, h: 2.5, kind: 'grid', cols: 4, transom: 0.7, frame: black, reveal: '#3a3a3a', rd: 0.3, sill: false, tint: '#9fb0be' },
  ];
  add(wall(Fb, W, baseH, baseHoles, matGrey));
  baseHoles.forEach((o) => opening(Fb, o));
  // Dark granite cladding on the ground floor.
  for (const [x0, x1] of [[0, 0.5], [5.25, 6.85], [8.9, W]]) {
    I.trim.add(piece(Fb, (x0 + x1) / 2, g1 / 2, 0.05, x1 - x0, g1, 0.1), '#2b2a2a');
  }
  I.trim.add(piece(Fb, W / 2, g1 - 0.35, 0.06, W, 0.7, 0.12), '#2b2a2a');
  {
    // Gold YOON Haeundae Galbi mark (the brush-stroke 윤 figure of the
    // restaurant's logo, with its name in small capitals beneath), "8" and
    // canopy at the entrance.
    const mark = textTexture({
      width: 256, height: 320, bg: '#2b2a2a',
      draw(ctx, w) {
        ctx.strokeStyle = ctx.fillStyle = '#d2ac55';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        const cx = w / 2;
        ctx.lineWidth = 15;
        ctx.beginPath(); ctx.ellipse(cx + 4, 62, 30, 27, -0.15, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 17;
        ctx.beginPath(); ctx.moveTo(cx - 74, 108); ctx.quadraticCurveTo(cx - 60, 128, cx - 20, 124); ctx.lineTo(cx + 46, 118); ctx.quadraticCurveTo(cx + 72, 114, cx + 82, 94); ctx.stroke();
        ctx.lineWidth = 14;
        ctx.beginPath(); ctx.moveTo(cx - 6, 128); ctx.lineTo(cx - 10, 176); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx + 26, 128); ctx.lineTo(cx + 24, 168); ctx.stroke();
        ctx.lineWidth = 16;
        ctx.beginPath(); ctx.moveTo(cx - 44, 158); ctx.quadraticCurveTo(cx - 52, 204, cx - 10, 206); ctx.quadraticCurveTo(cx + 46, 208, cx + 70, 192); ctx.stroke();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '600 21px "Helvetica Neue", Helvetica, Arial, sans-serif';
        ctx.fillText('Y O O N', cx, 252);
        ctx.font = '500 13px "Helvetica Neue", Helvetica, Arial, sans-serif';
        ctx.fillText('H A E U N D A E   G A L B I', cx, 280);
      },
    });
    const mm = new THREE.MeshStandardMaterial({ map: mark, roughness: 0.4, metalness: 0.5, emissive: '#ffffff', emissiveMap: mark, emissiveIntensity: 0.25 });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 1.0), mm);
    m.position.set(-W / 2 + 0.25 + 5.8, 2.85, D / 2 + 0.11);
    add(m);
    const num = textTexture({ text: '8', width: 128, height: 128, bg: '#2b2a2a', ink: '#e8e4da', font: '500 96px Georgia, serif' });
    const n = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.45), new THREE.MeshStandardMaterial({ map: num, roughness: 0.5 }));
    n.position.set(-W / 2 + 7.9, 3.75, D / 2 + 0.12);
    add(n);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.12, 1.3), granite);
    canopy.position.set(-W / 2 + 7.9, 3.35, D / 2 + 0.65);
    canopy.castShadow = true;
    add(canopy);
  }

  // =====================================================================
  // OFFICE FLOORS: grey stone piers + dark metal window bay
  // =====================================================================
  const Ft = face(0, -W / 2, baseH, D / 2);
  const upperH = top - baseH;
  const holes = [];
  const wy = (f) => f * FH + 0.55 + 1.0;
  for (let f = 0; f < floors; f++) {
    for (const x of cx) holes.push({ x, y: wy(f), w: cww, h: 1.95, kind: 'dh', frame: black, reveal: '#2a2c2e', rd: 0.22, sill: false, tint: skyTint() });
  }
  add(wall(Ft, W, upperH, holes, matGrey));
  holes.forEach((o) => opening(Ft, o));
  // Black metal frame of the bay: mullions, spandrels and projecting ledges.
  for (let f = 0; f < floors; f++) {
    const y0 = f * FH;
    I.trim.add(piece(Ft, W / 2, y0 + 0.28, 0.06, cw + 0.1, 0.56, 0.12), '#26282a');
    I.trim.add(piece(Ft, W / 2, y0 + 0.57, 0.22, cw + 0.4, 0.1, 0.42), '#1b1c1e');
    for (let k = 0; k < 4; k++) I.trim.add(piece(Ft, cx[k], y0 + 0.28, 0.13, cww - 0.1, 0.3, 0.03), '#34373a');
    for (let k = 0; k <= 4; k++) {
      const x = W / 2 + (k - 2) * (cw / 4);
      I.trim.add(piece(Ft, x, y0 + FH / 2 + 0.28, 0.07, k === 0 || k === 4 ? 0.22 : 0.16, FH - 0.56, 0.12), '#1d1f21');
    }
  }
  stoneBox(W + 0.15, 0.3, 0.35, 0, top - 0.15, D / 2 + 0.1);

  // =====================================================================
  // SIDE WALLS (west exposed above the garage), REAR, ROOF
  // =====================================================================
  const Fw = face(Math.PI / 2, W / 2, 0, D / 2);
  const sideHoles = [];
  for (let f = 1; f < floors; f++) {
    const y = baseH + wy(f);
    // As on site: the wall is blank down to the garage below ~20 m; above,
    // a single column of windows runs just behind the banner on the upper
    // floors, and one more window sits beside it over the banner.
    if (y < 20 || f > 8) continue;
    sideHoles.push({ x: 5.7, y, w: 1.1, h: 1.6, kind: 'dh', frame: black, reveal: '#c9c5bc', sillColor: '#e2ded5', header: '#e2ded5', tint: skyTint() });
    if (y > bannerTop + 1 && y < top - 5) sideHoles.push({ x: 2.6, y, w: 1.1, h: 1.6, kind: 'dh', frame: black, reveal: '#c9c5bc', sillColor: '#e2ded5', header: '#e2ded5', tint: skyTint() });
  }
  add(wall(Fw, D, top, sideHoles, stucco));
  sideHoles.forEach((o) => opening(Fw, o));
  {
    const bh = bannerH;
    const banner = new THREE.Mesh(new THREE.PlaneGeometry(3.15, bh), (() => { const t = bannerTexture(); return new THREE.MeshStandardMaterial({ map: t, roughness: 0.7, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.35 }); })());
    banner.rotation.y = Math.PI / 2;
    banner.position.set(W / 2 + 0.06, garageH + 3 + bh / 2, D / 2 - 2.1);
    banner.castShadow = true;
    add(banner);
  }
  add(wall(face(-Math.PI / 2, -W / 2, 0, -D / 2), D, top, [], matCommon(2)));
  const Fr = face(Math.PI, W / 2, 0, -D / 2);
  const rear = [];
  for (let f = 0; f < floors + 1; f++) for (const x of [2.0, 5.25, 8.5]) rear.push({ x, y: g1 + 1.8 + f * FH, w: 1.3, h: 2.2, kind: 'dh', reveal: C.revealCommon, sillColor: '#b3a999' });
  add(wall(Fr, W, top, rear, matCommon(3)));
  rear.forEach((o) => opening(Fr, o));
  addFireEscape(I, { x0: -W / 2 + 1.0, x1: -W / 2 + 6.2, z: -D / 2, levels: [...Array(floors + 1).keys()].map((f) => g1 + 0.7 + f * FH) });
  {
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: '#4f4b48', roughness: 1 }));
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = top - 0.6;
    roof.receiveShadow = true;
    add(roof);
    // Roof as seen from above (local -x = east): stair/elevator bulkhead on
    // the east side, the timber water tank toward the rear, a small white
    // tank mid-roof, and a white mechanical enclosure with fans at the
    // front-east corner (it shows over the parapet from the street).
    const roofY = top - 0.6;
    const bulk = new THREE.Mesh(new THREE.BoxGeometry(3.6, 3.0, 5.0), renderGrey);
    bulk.position.set(-W / 2 + 2.2, roofY + 1.5, -D / 2 + 10.5);
    bulk.castShadow = true;
    add(bulk);
    const tank = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 1.85, 3.4, 24), new THREE.MeshStandardMaterial({ color: '#8a6446', roughness: 0.95 }));
    body.position.y = 4.4;
    const lid = new THREE.Mesh(new THREE.ConeGeometry(2.0, 1.0, 24), new THREE.MeshStandardMaterial({ color: '#a27a55', roughness: 0.9 }));
    lid.position.y = 6.6;
    tank.add(body, lid);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.7), matSteel);
      leg.position.set(Math.cos(a) * 1.4, 1.35, Math.sin(a) * 1.4);
      tank.add(leg);
    }
    tank.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    tank.position.set(0.3, roofY, -D / 2 + 5.8);
    add(tank);
    const white = new THREE.MeshStandardMaterial({ color: '#e6e6e2', roughness: 0.55, metalness: 0.15 });
    const small = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 1.6, 20), white);
    small.position.set(-1.5, roofY + 0.8, -D / 2 + 12);
    small.castShadow = true;
    add(small);
    const ahu = new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.1, 4.2), white);
    ahu.position.set(-W / 2 + 2.1, roofY + 1.05, D / 2 - 3.6);
    ahu.castShadow = true;
    add(ahu);
    for (const dz of [-1, 1]) {
      const fan = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.12, 18), new THREE.MeshStandardMaterial({ color: '#3b3d40', roughness: 0.5, metalness: 0.5 }));
      fan.position.set(-W / 2 + 2.1, roofY + 2.16, D / 2 - 3.6 + dz);
      add(fan);
    }
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.05, 1.0, 6), matSteel);
    rail.position.set(-W / 2 + 4.2, roofY + 0.5, D / 2 - 3.6);
    add(rail);
  }

  finish();

  const floorRange = (n) => {
    if (n <= 1) return [0, g1];
    if (n === 2) return [g1, baseH];
    const y0 = baseH + (n - 3) * FH;
    return [y0, y0 + FH];
  };
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * top;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, D / 2 + 1.0);
      case 'back': return V((0.5 - u) * W, y, -D / 2 - 0.9);
      case 'right': return V(W / 2 + 1.0, y, (0.5 - u) * D);
      case 'roof': return V((u - 0.5) * W, y, 0);
      default: return V(0, y, 0);
    }
  };

  return { group: g, width: W, depth: D, height: top + 2, floorRange, hotspotPosition };
}
