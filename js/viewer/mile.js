// Procedural model of a turn-of-the-century loft office building, matched to
// photos of 133 W 21st St. The whole street front is light grey-greige
// stone / terra-cotta:
//   - three-storey base: banded (rusticated) piers, groups of four windows
//     over panelled spandrels, carved entrance hood in the west bay,
//     shopfronts, SVA banner; crowned by a fluted cove cornice with long
//     console brackets on the piers and carved shells above them
//   - seven-storey shaft: five broad smooth piers framing four wide bays;
//     each bay holds four tall 1-over-1 sash windows between dark mullions,
//     with a sill ledge and a recessed speckled-brick spandrel carrying a
//     light stone band
//   - two-storey ornate attic: rosettes and fluted capitals on the piers,
//     a belt course with a carved frieze, carved pilasters with shield
//     cartouches, a Greek-key band, a scroll frieze, big scroll consoles
//     and a deep coffered cornice with dentils and a copper crest
import * as THREE from 'three';
import { grime, textTexture, rand } from './textures.js';
import { V, C, face, piece, brickMaterial, wall, createKit, addFireEscape, boxGeo } from './kit.js';

// ---------------------------------------------------------------------------
// Local canvas textures for the carved terra-cotta ornament.
const texCache = new Map();
function canvasTex(key, w, h, draw) {
  if (!texCache.has(key)) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d');
    draw(ctx, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = 8;
    texCache.set(key, t);
  }
  return texCache.get(key);
}
const ORN_BG = '#d9d5ce';
const ORN_SH = 'rgba(58,52,46,0.9)';
const ORN_HI = '#f1eee8';
// Stroke a path twice (offset shadow, then highlight) so it reads as relief.
function relief(ctx, path, lw, { sh = ORN_SH, hi = ORN_HI, off = 2 } = {}) {
  ctx.lineCap = 'square'; ctx.lineJoin = 'miter';
  ctx.save(); ctx.translate(off, off * 1.4); ctx.strokeStyle = sh; ctx.lineWidth = lw; ctx.beginPath(); path(ctx); ctx.stroke(); ctx.restore();
  ctx.strokeStyle = hi; ctx.lineWidth = lw * 0.7; ctx.beginPath(); path(ctx); ctx.stroke();
}
function fillRelief(ctx, path, { sh = ORN_SH, hi = ORN_HI, off = 2 } = {}) {
  ctx.save(); ctx.translate(off, off * 1.4); ctx.fillStyle = sh; ctx.beginPath(); path(ctx); ctx.fill(); ctx.restore();
  ctx.fillStyle = hi; ctx.beginPath(); path(ctx); ctx.fill();
}
function noise(ctx, w, h, seed, n = 1, a = 0.07) {
  const r = rand(seed);
  for (let i = 0; i < w * h * 0.04 * n; i++) {
    ctx.fillStyle = r() < 0.55 ? `rgba(50,45,40,${r() * a})` : `rgba(255,255,255,${r() * a})`;
    ctx.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2);
  }
}
const fillBand = (ctx, w, h, bg = ORN_BG) => {
  ctx.fillStyle = '#4b453e'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
};
// Neutral greige stone (the shared stone() texture is too warm/tan).
const greigeStone = () => canvasTex('mile-stone', 256, 256, (ctx, w, h) => {
  ctx.fillStyle = '#d6d2cb'; ctx.fillRect(0, 0, w, h);
  noise(ctx, w, h, 5, 3, 0.09);
  ctx.strokeStyle = 'rgba(80,74,66,0.18)'; ctx.lineWidth = 1.5;
  for (let y = 0; y < h; y += h / 3) { ctx.beginPath(); ctx.moveTo(0, y + 0.5); ctx.lineTo(w, y + 0.5); ctx.stroke(); }
});
// Greek-key (meander) band: two units per tile.
const fretTex = () => canvasTex('mile-fret', 128, 64, (ctx, w, h) => {
  fillBand(ctx, w, h, '#a7a39c');
  ctx.fillStyle = ORN_BG; ctx.fillRect(0, 0, w, 7); ctx.fillRect(0, h - 7, w, 7);
  for (const ox of [0, 64]) {
    relief(ctx, (c) => {
      c.moveTo(ox + 0, 50); c.lineTo(ox + 64, 50);
      c.moveTo(ox + 54, 50); c.lineTo(ox + 54, 14); c.lineTo(ox + 12, 14); c.lineTo(ox + 12, 40); c.lineTo(ox + 42, 40); c.lineTo(ox + 42, 25); c.lineTo(ox + 24, 25);
    }, 7);
  }
  noise(ctx, w, h, 9);
});
// Scroll frieze (rinceau with rosettes) between fillets.
const scrollTex = () => canvasTex('mile-scroll', 128, 48, (ctx, w, h) => {
  fillBand(ctx, w, h, '#aaa69f');
  ctx.fillStyle = ORN_BG; ctx.fillRect(0, 0, w, 6); ctx.fillRect(0, h - 6, w, 6);
  for (const cx of [32, 96]) {
    fillRelief(ctx, (c) => c.arc(cx, 24, 10, 0, Math.PI * 2));
    ctx.fillStyle = '#9c978f'; ctx.beginPath(); ctx.arc(cx, 24, 4, 0, Math.PI * 2); ctx.fill();
    relief(ctx, (c) => { c.moveTo(cx + 12, 24); c.bezierCurveTo(cx + 24, 8, cx + 40, 40, cx + 52, 24); }, 5);
    relief(ctx, (c) => { c.arc(cx + 22, 15, 5, 0, Math.PI * 1.5); c.moveTo(cx + 47, 33); c.arc(cx + 42, 33, 5, 0, Math.PI * 1.5); }, 3);
  }
  noise(ctx, w, h, 11);
});
// Egg-and-dart / dentil strip for the belt courses.
const dentilTex = () => canvasTex('mile-dentil', 64, 32, (ctx, w, h) => {
  fillBand(ctx, w, h, '#b3afa8');
  ctx.fillStyle = ORN_BG; ctx.fillRect(0, 0, w, 6);
  for (const cx of [16, 48]) {
    fillRelief(ctx, (c) => c.ellipse(cx, 19, 9, 10, 0, 0, Math.PI * 2));
    ctx.fillStyle = ORN_SH; ctx.fillRect(cx + 14, 9, 3, 20);
  }
  noise(ctx, w, h, 13);
});
// Carved pilaster panel of the attic: framed chain of ovals, lozenges and leaves.
const pilasterTex = () => canvasTex('mile-pilaster', 96, 512, (ctx, w, h) => {
  fillBand(ctx, w, h, ORN_BG);
  ctx.fillStyle = '#a19c94'; ctx.fillRect(12, 10, w - 24, h - 20);
  relief(ctx, (c) => c.rect(12, 10, w - 24, h - 20), 5);
  relief(ctx, (c) => { c.moveTo(w / 2, 14); c.lineTo(w / 2, h - 14); }, 4);
  for (let y = 44, k = 0; y < h - 30; y += 62, k++) {
    if (k % 2) fillRelief(ctx, (c) => { c.moveTo(w / 2, y - 24); c.lineTo(w / 2 + 22, y); c.lineTo(w / 2, y + 24); c.lineTo(w / 2 - 22, y); c.closePath(); });
    else fillRelief(ctx, (c) => c.ellipse(w / 2, y, 20, 26, 0, 0, Math.PI * 2));
    ctx.fillStyle = '#8f8a82'; ctx.beginPath(); ctx.ellipse(w / 2, y, 8, 11, 0, 0, Math.PI * 2); ctx.fill();
    relief(ctx, (c) => { c.moveTo(w / 2 - 28, y + 30); c.quadraticCurveTo(w / 2, y + 22, w / 2 + 28, y + 30); }, 4);
  }
  noise(ctx, w, h, 17);
});
// Fluted capital block with corner volutes and a leaf.
const capitalTex = () => canvasTex('mile-capital', 128, 192, (ctx, w, h) => {
  fillBand(ctx, w, h, ORN_BG);
  for (let x = 14; x < w - 8; x += 18) {
    const g = ctx.createLinearGradient(x, 0, x + 12, 0);
    g.addColorStop(0, '#8d8880'); g.addColorStop(0.5, '#c9c5be'); g.addColorStop(1, '#f2efe9');
    ctx.fillStyle = g; ctx.fillRect(x, 70, 12, h - 84);
  }
  for (const cx of [26, w - 26]) {
    fillRelief(ctx, (c) => c.arc(cx, 36, 20, 0, Math.PI * 2));
    relief(ctx, (c) => c.arc(cx, 36, 11, 0, Math.PI * 1.6), 4);
  }
  fillRelief(ctx, (c) => { c.moveTo(w / 2, 10); c.quadraticCurveTo(w / 2 + 22, 40, w / 2, 66); c.quadraticCurveTo(w / 2 - 22, 40, w / 2, 10); });
  ctx.fillStyle = '#e9e5de'; ctx.fillRect(0, 0, w, 6); ctx.fillRect(0, 64, w, 5);
  noise(ctx, w, h, 19);
});
// Vertical flutes / ribs (cove cornice, shells, brackets).
const fluteTex = () => canvasTex('mile-flute', 32, 32, (ctx, w, h) => {
  const g = ctx.createLinearGradient(0, 0, w, 0);
  g.addColorStop(0, '#77716a'); g.addColorStop(0.35, '#c4c0b9'); g.addColorStop(0.8, '#ebe8e2'); g.addColorStop(1, '#8a857e');
  ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
});
// Dark coffered soffit of the crowning cornice.
const cofferTex = () => canvasTex('mile-coffer', 64, 64, (ctx, w, h) => {
  ctx.fillStyle = '#4a4036'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#2b241d'; ctx.fillRect(8, 8, w - 16, h - 16);
  ctx.strokeStyle = '#5c5145'; ctx.lineWidth = 3; ctx.strokeRect(14, 14, w - 28, h - 28);
});

// Scroll console profile in the (out, up) plane, extruded across `width`.
function consoleGeo({ h, d0, d1, width }) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(d0, 0);
  s.bezierCurveTo(d0 + 0.12, h * 0.35, d0 - 0.05, h * 0.55, d1 * 0.65, h * 0.78);
  s.quadraticCurveTo(d1, h * 0.84, d1, h);
  s.lineTo(0, h);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: width, bevelEnabled: false, curveSegments: 10 });
  g.rotateY(-Math.PI / 2);
  g.translate(width / 2, 0, 0);
  return g;
}

export function buildLadiesMile(params) {
  const { width: W = 30, depth: D = 29, banner = ['SVA', 'NYC'] } = params;

  const r = rand(1900);
  // Storey heights sized so the cornice top meets the surveyed roof height
  // (NYC/OSM: 46.6 m).
  const g1 = 4.6;
  const g2 = 3.8;
  const g3 = 3.8;
  const baseH = g1 + g2 + g3;
  const FH = 3.5;
  const shaftFloors = 7;
  const TFH = 3.85;
  const topFloors = 2;
  const shaftTop = baseH + shaftFloors * FH;
  const wallTop = shaftTop + topFloors * TFH;
  const top = wallTop + 2.2;

  const g = new THREE.Group();
  g.name = 'building';
  const { matSteel, I, opening, add, stoneBox, finish } = createKit(g, r, { glass: 'sky' });
  const skyTint = () => (r() < 0.3 ? '#2f3a44' : r() < 0.6 ? '#9db3c6' : '#c4d3df');
  const matCommon = (seed) => brickMaterial('common', grime(`milecommon${seed}`, { seed, streaks: 50, strength: 0.7 }));

  // ---- materials: one light greige stone for the whole street front ----
  const stoneTex = greigeStone();
  stoneTex.repeat.set(1 / 1.6, 1 / 1.6);
  const stoneMat = (color, rough = 0.85) => new THREE.MeshStandardMaterial({ map: stoneTex, color, roughness: rough });
  const matFacade = stoneMat('#e2ddd5');
  const matBase = stoneMat('#ddd6cb');
  const matDarkStone = stoneMat('#b8b2a8');
  // Speckled grey-buff brick of the recessed spandrels.
  const matSpandrel = brickMaterial('buff');
  matSpandrel.color = new THREE.Color('#8e8a84');
  const ornMat = (tex, rx = 1, ry = 1, color = '#ffffff') => {
    const t = tex.clone();
    t.repeat.set(rx, ry);
    t.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ map: t, color, roughness: 0.85 });
  };
  const frame = '#2c2e30';
  const reveal = '#8f8a82';
  const ledge = '#d3cfc7';

  // ---- bay grid: 5 piers (broad end piers), 4 bays, 4 sashes per bay ----
  const pE = 1.75;
  const pI = 1.2;
  const bay = (W - 2 * pE - 3 * pI) / 4;
  const pierW = (i) => (i === 0 || i === 4 ? pE : pI);
  const pierX = (i) => (i === 0 ? pE / 2 : i === 4 ? W - pE / 2 : pE + i * bay + (i - 0.5) * pI);
  const bayX = (i) => pE + i * (bay + pI) + bay / 2; // local x of bay centre
  const mull = 0.2;
  const groupW = bay - 0.14;
  const ww = (groupW - 3 * mull) / 4;
  const winXs = (i) => [0, 1, 2, 3].map((k) => bayX(i) - groupW / 2 + ww / 2 + k * (ww + mull));

  // Mesh helpers in a face's local frame (x right from the west corner, y up, z out).
  const blk = (mat, w, h, d, x, y, z, F) => {
    const m = new THREE.Mesh(boxGeo(w, h, d), mat);
    m.position.set(x, y, z);
    m.applyMatrix4(F);
    m.castShadow = m.receiveShadow = true;
    return add(m);
  };
  // Box with an ornament texture on its front face only.
  const ornBox = (mat, side, w, h, d, x, y, z, F) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), [side, side, side, side, mat, side]);
    m.position.set(x, y, z);
    m.applyMatrix4(F);
    m.castShadow = m.receiveShadow = true;
    return add(m);
  };
  const T = (F, x, y, z, sx, sy, sz, col) => I.trim.add(piece(F, x, y, z, sx, sy, sz), col);
  // A group of four sashes: holes, dark mullions and one continuous sill ledge.
  const group = (holes, F, i, y, h, opts = {}) => {
    for (const x of winXs(i)) holes.push({ x, y, w: ww, h, kind: 'dh', reveal, frame, sill: false, rd: 0.22, tint: skyTint(), ...opts });
    for (let k = 1; k < 4; k++) {
      const x = bayX(i) - groupW / 2 + k * (ww + mull) - mull / 2;
      I.frame.add(piece(F, x, y, -0.04, mull + 0.02, h + 0.04, 0.1), opts.mullion ?? '#3c3d3e');
    }
  };

  // =====================================================================
  // BASE (ground + 2 storeys)
  // =====================================================================
  const Fb = face(0, -W / 2, 0, D / 2);
  const baseHoles = [
    { x: bayX(0), y: 0.12 + 1.75, w: 2.4, h: 3.5, kind: 'lobby', room: 'lobby', frame, reveal: '#9a958c', rd: 0.5, sill: false, roomDepth: 4 },
  ];
  for (let i = 1; i < 4; i++) {
    baseHoles.push({ x: bayX(i), y: 0.12 + 1.8, w: bay - 0.5, h: 3.6, kind: 'grid', cols: 4, transom: 0.8, room: i === 2 ? 'shop' : 'warm', blinds: false, frame: '#24272a', reveal: '#9a958c', rd: 0.3, sill: false });
  }
  const f2y = 6.45, f2h = 2.6, f3y = 10.2, f3h = 2.5;
  for (let i = 0; i < 4; i++) {
    group(baseHoles, Fb, i, f2y, f2h);
    group(baseHoles, Fb, i, f3y, f3h);
  }
  add(wall(Fb, W, baseH, baseHoles, matBase));
  baseHoles.forEach((o) => opening(Fb, o));
  for (let i = 0; i < 4; i++) {
    // Sill ledges and panelled spandrels under each window group.
    for (const [y, h] of [[f2y, f2h], [f3y, f3h]]) T(Fb, bayX(i), y - h / 2 - 0.07, 0.08, groupW + 0.2, 0.14, 0.22, ledge);
    for (const yc of [4.45, 8.35]) {
      if (i === 0 && yc < 5) continue; // entrance hood sits here
      T(Fb, bayX(i), yc, 0.03, bay - 0.3, 0.8, 0.06, '#d6d2ca');
      for (let k = 0; k < 4; k++) T(Fb, bayX(i) - groupW / 2 + ww / 2 + k * (ww + mull), yc, 0.05, ww - 0.15, 0.5, 0.05, '#bdb8af');
    }
  }
  // Banded (rusticated) piers: a core with projecting stone courses.
  for (let i = 0; i < 5; i++) {
    blk(matBase, pierW(i), baseH, 0.32, pierX(i), baseH / 2, 0.16, Fb);
    for (let y = 0.3, k = 0; y < baseH - 0.6; y += 0.56, k++) {
      T(Fb, pierX(i), y + 0.25, 0.36, pierW(i) + 0.06, 0.46, 0.1, k % 3 ? '#dcd8d1' : '#d3cfc7');
    }
  }
  // Entrance hood with a carved cartouche over the lobby door (west bay).
  {
    const x = bayX(0);
    stoneBox(3.4, 0.45, 0.9, -W / 2 + x, 4.0, D / 2 + 0.45);
    stoneBox(3.6, 0.15, 1.0, -W / 2 + x, 4.3, D / 2 + 0.5);
    stoneBox(0.35, 3.6, 0.45, -W / 2 + x - 1.45, 1.8, D / 2 + 0.25);
    stoneBox(0.35, 3.6, 0.45, -W / 2 + x + 1.45, 1.8, D / 2 + 0.25);
    const shield = new THREE.Shape();
    shield.moveTo(-0.45, 0.5); shield.lineTo(0.45, 0.5); shield.lineTo(0.45, -0.05);
    shield.quadraticCurveTo(0.4, -0.4, 0, -0.55); shield.quadraticCurveTo(-0.4, -0.4, -0.45, -0.05); shield.closePath();
    const sg = new THREE.ExtrudeGeometry(shield, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 2 });
    const sm = new THREE.Mesh(sg, matFacade);
    sm.position.set(x, 5.0, 0.55);
    sm.applyMatrix4(Fb);
    sm.castShadow = true;
    add(sm);
    for (const s of [-1, 1]) {
      const vol = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.25, 14), matFacade);
      vol.rotation.x = Math.PI / 2;
      vol.position.set(x + s * 0.7, 4.65, 0.6);
      vol.applyMatrix4(Fb);
      add(vol);
    }
  }
  // Fluted cove cornice over the base, long console brackets hanging down
  // the piers and a carved shell on the ledge above each pier.
  {
    const rise = 0.9, out = 1.0;
    const len = Math.hypot(rise, out);
    const cove = new THREE.Mesh(new THREE.BoxGeometry(W + 0.2, len, 0.12), [matBase, matBase, matBase, matBase, ornMat(fluteTex(), (W + 0.2) / 0.3, 1, '#e8e4dd'), matBase]);
    cove.rotation.x = Math.atan2(out, rise);
    cove.position.set(W / 2, baseH - 0.65 + rise / 2, 0.36 + out / 2);
    cove.applyMatrix4(Fb);
    cove.castShadow = cove.receiveShadow = true;
    add(cove);
    blk(matBase, W + 0.5, 0.36, 1.55, W / 2, baseH + 0.43, 0.78, Fb);
    T(Fb, W / 2, baseH + 0.2, 1.42, W + 0.3, 0.1, 0.1, '#cfcac2');
    const cg = consoleGeo({ h: 3.0, d0: 0.12, d1: 0.95, width: 0.5 });
    const cMat = stoneMat('#cdc7bd');
    const shellGeo = new THREE.SphereGeometry(0.5, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const shellMat = ornMat(fluteTex(), 10, 1, '#e8e4dd');
    for (let i = 0; i < 5; i++) {
      const c = new THREE.Mesh(cg, cMat);
      c.position.set(pierX(i), baseH - 0.62 - 3.0 + 0.6, 0.42);
      c.applyMatrix4(Fb);
      c.castShadow = true;
      add(c);
      const sh = new THREE.Mesh(shellGeo, shellMat);
      sh.rotation.x = Math.PI / 2;
      sh.scale.set(1, 1, 1.25);
      sh.position.set(pierX(i), baseH + 1.05, 0.36);
      sh.applyMatrix4(Fb);
      sh.castShadow = true;
      add(sh);
      blk(matFacade, 1.0, 0.25, 0.5, pierX(i), baseH + 0.73, 0.5, Fb);
    }
  }
  // SVA banner on an outrigger from the pier between the second and third bays.
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
    const bx = -W / 2 + pierX(2);
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
  // SHAFT (7 storeys): smooth piers, sash groups, brick spandrels
  // =====================================================================
  const Ft = face(0, -W / 2, baseH, D / 2);
  const shaftH = shaftFloors * FH;
  {
    const holes = [];
    for (let f = 0; f < shaftFloors; f++) for (let i = 0; i < 4; i++) group(holes, Ft, i, f * FH + 1.3 + 1.0, 2.0);
    add(wall(Ft, W, shaftH, holes, matSpandrel));
    holes.forEach((o) => opening(Ft, o));
    for (let f = 0; f < shaftFloors; f++) {
      const L = f * FH;
      for (let i = 0; i < 4; i++) {
        T(Ft, bayX(i), L + 1.24, 0.1, groupW + 0.1, 0.12, 0.22, ledge); // sill ledge
        if (f > 0) T(Ft, bayX(i), L + 0.55, 0.03, bay - 0.28, 0.55, 0.07, '#bfbab1'); // stone band in the spandrel
      }
    }
    for (let i = 0; i < 5; i++) blk(matFacade, pierW(i), shaftH, 0.34, pierX(i), shaftH / 2, 0.16, Ft);
  }

  // =====================================================================
  // ATTIC (2 storeys) + CROWNING CORNICE
  // =====================================================================
  const Fa = face(0, -W / 2, shaftTop, D / 2);
  const wT = topFloors * TFH; // local y of the cornice line
  {
    const holes = [];
    for (let i = 0; i < 4; i++) {
      group(holes, Fa, i, 2.0, 2.1, { mullion: '#2f3032' });
      group(holes, Fa, i, TFH + 1.3, 2.1, { mullion: '#2f3032' });
    }
    add(wall(Fa, W, top - shaftTop, holes, matFacade));
    holes.forEach((o) => opening(Fa, o));
    const matPil = ornMat(pilasterTex());
    const matCap = ornMat(capitalTex());
    const matScroll = ornMat(scrollTex(), bay / 1.05, 1);
    const matFret = ornMat(fretTex(), bay / 1.2, 1);
    const matDentil = ornMat(dentilTex(), (W + 0.4) / 0.5, 1);
    const rosette = new THREE.SphereGeometry(0.34, 16, 10);
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(-0.32, 0.55); shieldShape.lineTo(0.32, 0.55); shieldShape.lineTo(0.32, -0.1);
    shieldShape.quadraticCurveTo(0.28, -0.45, 0, -0.62); shieldShape.quadraticCurveTo(-0.28, -0.45, -0.32, -0.1); shieldShape.closePath();
    const shieldGeo = new THREE.ExtrudeGeometry(shieldShape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 });
    const consoleTop = consoleGeo({ h: 2.95, d0: 0.25, d1: 1.35, width: 0.9 });
    const consoleEnd = consoleGeo({ h: 2.95, d0: 0.25, d1: 1.35, width: 1.2 });
    for (let i = 0; i < 5; i++) {
      const x = pierX(i);
      const pw = pierW(i);
      // Carved pilaster over the two attic floors.
      ornBox(matPil, matFacade, pw - 0.1, wT - 0.4, 0.3, x, (wT - 0.4) / 2, 0.15, Fa);
      // Rosette and fluted capital where the shaft pier ends.
      const ro = new THREE.Mesh(rosette, matFacade);
      ro.scale.set(1, 1, 0.6);
      ro.position.set(x, -0.6, 0.42);
      ro.applyMatrix4(Fa);
      add(ro);
      ornBox(matCap, matFacade, pw + 0.2, 1.9, 0.7, x, 0.7, 0.35, Fa);
      blk(matFacade, pw + 0.45, 0.22, 0.86, x, 1.76, 0.43, Fa);
      // Shield cartouche at the Greek-key band.
      const sh = new THREE.Mesh(shieldGeo, matFacade);
      sh.position.set(x, TFH - 0.35, 0.3);
      sh.applyMatrix4(Fa);
      sh.castShadow = true;
      add(sh);
      blk(matFacade, pw + 0.15, 0.25, 0.5, x, TFH + 0.1, 0.25, Fa);
      // Big scroll console under the crowning cornice.
      const c = new THREE.Mesh(i === 0 || i === 4 ? consoleEnd : consoleTop, matFacade);
      c.position.set(x, wT + 0.05 - 2.95, 0.28);
      c.applyMatrix4(Fa);
      c.castShadow = true;
      add(c);
    }
    for (let i = 0; i < 4; i++) {
      const x = bayX(i);
      // Belt course over the shaft: carved frieze under a projecting ledge.
      ornBox(matScroll, matFacade, bay, 0.5, 0.18, x, 0.3, 0.09, Fa);
      // Greek-key band between the attic floors, sill ledge with blocks.
      ornBox(matFret, matFacade, bay, 0.6, 0.16, x, TFH - 0.45, 0.08, Fa);
      T(Fa, x, TFH + 0.1, 0.16, bay, 0.16, 0.32, ledge);
      for (let k = 0; k < 7; k++) T(Fa, x - bay / 2 + 0.4 + k * ((bay - 0.8) / 6), TFH - 0.06, 0.18, 0.14, 0.18, 0.26, '#cfcac2');
      // Scroll frieze under the cornice.
      ornBox(matScroll, matFacade, bay, 0.42, 0.14, x, wT - 0.85, 0.07, Fa);
    }
    blk(matFacade, W + 0.3, 0.26, 0.5, W / 2, 0.68, 0.25, Fa);
    ornBox(matDentil, matFacade, W + 0.3, 0.2, 0.42, W / 2, 0.47, 0.21, Fa);
    blk(matFacade, W + 0.2, 0.18, 0.42, W / 2, wT - 0.53, 0.21, Fa);
    ornBox(matDentil, matFacade, W + 0.2, 0.2, 0.36, W / 2, wT - 0.37, 0.18, Fa);

    // Crowning cornice: dark coffered soffit, modillions, fascia with
    // dentils, crown moulding and a copper crest.
    const ov = 1.75;
    const soffit = new THREE.Mesh(new THREE.BoxGeometry(W + 0.8, 0.2, ov), [matDarkStone, matDarkStone, matDarkStone, ornMat(cofferTex(), (W + 0.8) / 0.9, ov / 0.9), matDarkStone, matDarkStone]);
    soffit.position.set(W / 2, wT + 0.15, ov / 2);
    soffit.applyMatrix4(Fa);
    soffit.castShadow = true;
    add(soffit);
    for (let x = -0.2; x < W + 0.3; x += 0.9) T(Fa, x, wT - 0.01, ov / 2 + 0.1, 0.16, 0.14, ov - 0.25, '#3f362d');
    blk(stoneMat('#cfcac2'), W + 0.9, 0.95, 0.3, W / 2, wT + 0.7, ov - 0.05, Fa);
    for (let x = -0.3; x < W + 0.4; x += 0.32) T(Fa, x, wT + 1.05, ov + 0.15, 0.16, 0.22, 0.12, '#d7d3cc');
    blk(stoneMat('#a89f92'), W + 1.0, 0.28, ov + 0.35, W / 2, wT + 1.31, (ov + 0.35) / 2, Fa);
    T(Fa, W / 2, wT + 1.53, ov + 0.18, W + 1.0, 0.18, 0.12, '#6f9a86');
    T(Fa, W / 2, wT + 0.4, ov + 0.12, W + 0.9, 0.12, 0.1, '#bdb7ad');
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
    // Roof as seen from above: two wooden water tanks side by side on a
    // steel platform over the west-centre stair/elevator bulkhead, a mechanical
    // penthouse east of centre, rows of white condensing units toward the
    // rear-east corner, and a low parapet all round.
    const roofY = top - 0.5;
    const parapetMat = matCommon(5);
    for (const [w, d, x, z] of [[W, 0.35, 0, -D / 2 + 0.18], [0.35, D, -W / 2 + 0.18, 0], [0.35, D, W / 2 - 0.18, 0]]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(w, 1.1, d), parapetMat);
      p.position.set(x, roofY + 0.55, z);
      add(p);
    }
    const bulk = new THREE.Mesh(new THREE.BoxGeometry(9.5, 3.4, 6.5), matCommon(4));
    bulk.position.set(-W / 2 + 10.5, roofY + 1.7, -1.5);
    bulk.castShadow = true;
    add(bulk);
    const pent = new THREE.Mesh(new THREE.BoxGeometry(5, 3.0, 9), matCommon(6));
    pent.position.set(W / 2 - 9, roofY + 1.5, 3.5);
    pent.castShadow = true;
    add(pent);
    const tankWood = new THREE.MeshStandardMaterial({ color: '#8a6a4c', roughness: 0.95 });
    const tankLid = new THREE.MeshStandardMaterial({ color: '#b08a66', roughness: 0.9 });
    for (const tx of [-W / 2 + 8.4, -W / 2 + 12.8]) {
      const tank = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 2.0, 3.8, 28), tankWood);
      body.position.y = 3.4 + 1.9;
      const lid = new THREE.Mesh(new THREE.ConeGeometry(2.1, 1.0, 28), tankLid);
      lid.position.y = 3.4 + 3.8 + 0.5;
      tank.add(body, lid);
      for (let k = 0; k < 6; k++) {
        const a = (k / 6) * Math.PI * 2;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4), matSteel);
        leg.position.set(Math.cos(a) * 1.5, 3.4 + 0.7 - 1.4, Math.sin(a) * 1.5);
        tank.add(leg);
      }
      tank.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      tank.position.set(tx, roofY + 1.4, -2.2);
      add(tank);
    }
    // Condensing units: instanced white boxes in rows at the rear-east.
    {
      const units = [];
      for (let row = 0; row < 3; row++) for (let k = 0; k < 6; k++) units.push([W / 2 - 13 + k * 1.9, -D / 2 + 2.6 + row * 2.2]);
      for (let k = 0; k < 4; k++) units.push([W / 2 - 4.2, 0.5 + k * 2.0]);
      const unitMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1.5, 1.1, 1.4), new THREE.MeshStandardMaterial({ color: '#e4e4df', roughness: 0.6, metalness: 0.2 }), units.length);
      const m4 = new THREE.Matrix4();
      units.forEach(([x, z], i) => { m4.makeTranslation(x, roofY + 0.75, z); unitMesh.setMatrixAt(i, m4); });
      unitMesh.castShadow = true;
      add(unitMesh);
      // Silver duct run from the units to the penthouse.
      const duct = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.6, D * 0.45), new THREE.MeshStandardMaterial({ color: '#b9bcbf', roughness: 0.4, metalness: 0.6 }));
      duct.position.set(W / 2 - 6, roofY + 0.5, -D / 2 + 9);
      add(duct);
    }
    // Low skylight frames on the front half of the roof.
    for (const [x, z] of [[-3, 7], [1, 7], [-3, 11], [1, 11]]) {
      const sk = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 2.6), new THREE.MeshStandardMaterial({ color: '#3a3f44', roughness: 0.3, metalness: 0.4 }));
      sk.position.set(x, roofY + 0.25, z);
      add(sk);
    }
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
