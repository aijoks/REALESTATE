// Procedural model of a one-storey neighbourhood retail strip, matched to
// photos of 213-04 Northern Blvd, Bayside, Queens (tax lot 212-20 – 213-20
// Northern Blvd / 45-02 Bell Blvd, BBL 4-07313-0019; built 1996):
//   - 200 x 120 ft box (OSM: 62 x 36 m, 6.3 m) set at the back of the lot,
//     facing north across its parking lot to Northern Blvd; +x = west
//   - red-brick piers and knee walls, white spandrel panels and aluminium
//     storefronts with a transom row, a white fascia, a cream sign band in
//     tan picture frames and a beige dentil cornice over every bay
//   - CVS pharmacy (east end): its bay steps forward ~0.6 m and wraps the
//     NE corner, whose short east face (Santander "ATM inside" window, ramp
//     and railings) looks over the lot toward Bell Blvd; heart logo drawn
//     procedurally; a dark slate mansard bay between CVS and the in-line shops
//   - in-line shops; AFC Urgent Care (No. 213-04) at the west end with its
//     window graphics, next to an unlettered bay
import * as THREE from 'three';
import { textTexture, rand, BRICK } from './textures.js';
import { V, piece, createKit, boxGeo } from './kit.js';

// CVS heart: two lobes and a point, drawn on a canvas.
function heart(ctx, cx, cy, s, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.5);
  ctx.bezierCurveTo(cx - s * 0.15, cy + s * 0.32, cx - s * 0.62, cy + s * 0.05, cx - s * 0.58, cy - s * 0.2);
  ctx.bezierCurveTo(cx - s * 0.55, cy - s * 0.5, cx - s * 0.12, cy - s * 0.58, cx, cy - s * 0.3);
  ctx.bezierCurveTo(cx + s * 0.12, cy - s * 0.58, cx + s * 0.55, cy - s * 0.5, cx + s * 0.58, cy - s * 0.2);
  ctx.bezierCurveTo(cx + s * 0.62, cy + s * 0.05, cx + s * 0.15, cy + s * 0.32, cx, cy + s * 0.5);
  ctx.fill();
}

// AFC red cross with the white lower-case "afc".
function afcCross(ctx, cx, cy, s) {
  ctx.fillStyle = '#d2232a';
  const a = s * 0.34;
  ctx.fillRect(cx - a / 2, cy - s / 2, a, s);
  ctx.fillRect(cx - s * 0.62, cy - a / 2 - s * 0.02, s * 1.24, a + s * 0.04);
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  for (let y = cy - s / 2 + 3; y < cy + s / 2; y += 7) for (let x = cx - a / 2 + 3; x < cx + a / 2; x += 7) ctx.fillRect(x, y, 2, 2);
  ctx.fillStyle = '#ffffff';
  ctx.font = `800 ${Math.round(s * 0.36)}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('afc', cx, cy + s * 0.01);
}

export function buildStrip(params) {
  const { width: W = 62.1, depth: D = 36.3 } = params;
  const r = rand(21304);
  const g = new THREE.Group();
  g.name = 'building';
  const { I, add, finish } = createKit(g, r, { glass: 'sky' });

  const ROOF = 5.4; // roof deck
  const H = 6.3; // top of cornice (OSM height)
  const zA = D / 2; // CVS bay front
  const zB = D / 2 - 0.6; // in-line shops front
  const x0 = -W / 2; // east end (CVS corner); s = metres west of it
  const eastZ0 = zA - 5.75; // the CVS east face runs from the neighbour (teal) wall to the corner

  // ---- materials ----
  const brickM = (() => {
    const { map, normalMap } = BRICK.qred();
    return new THREE.MeshStandardMaterial({ map, normalMap, normalScale: new THREE.Vector2(0.8, 0.8), roughness: 0.92 });
  })();
  const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
  const cream = M('#ece3cb');
  const white = M('#f3f1ea');
  const tan = M('#c6b28e');
  const cornice = M('#d2c3a2');
  const roofM = M('#cfcfca', { roughness: 0.95 });
  const blockM = M('#b9a48a');
  const slateTex = textTexture({
    width: 256, height: 256, bg: '#3f454b',
    draw(c, w, h) {
      for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? -10 : 0; x < w; x += 20) {
        const v = 0.8 + r() * 0.4;
        c.fillStyle = `rgb(${66 * v | 0},${72 * v | 0},${80 * v | 0})`;
        c.fillRect(x + 1, y + 1, 18, 14);
      }
    },
  });
  slateTex.wrapS = slateTex.wrapT = THREE.RepeatWrapping;
  slateTex.repeat.set(5, 2);
  const slate = new THREE.MeshStandardMaterial({ map: slateTex, roughness: 0.7, side: THREE.DoubleSide });

  const mesh = (geo, mat, F, x, y, z, { cast = true } = {}) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    if (F) m.applyMatrix4(F);
    m.castShadow = cast;
    m.receiveShadow = true;
    return add(m);
  };
  const boxIn = (mat, F, w, h, d, x, y, z, o) => mesh(boxGeo(w, h, d), mat, F, x, y, z, o);
  // A transparent texture plane (signs, window graphics) on a face.
  const decal = (F, tex, w, h, x, y, z, { glow = 0.25, emissive = '#ffffff', transparent = true } = {}) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({
      map: tex, transparent, roughness: 0.5, emissive, emissiveMap: tex, emissiveIntensity: glow, depthWrite: !transparent,
    }));
    m.position.set(x, y, z);
    m.applyMatrix4(F);
    return add(m);
  };
  const canvasTex = (w, h, draw, bg = 'rgba(0,0,0,0)', px = 1024) => textTexture({ width: px, height: Math.max(32, Math.round(px * h / w)), bg, draw });

  // Face frames: local x along the wall, +z out of it.
  const FA = new THREE.Matrix4().makeTranslation(x0, 0, zA);
  const FB = new THREE.Matrix4().makeTranslation(x0, 0, zB);
  const FE = new THREE.Matrix4().makeRotationY(-Math.PI / 2).setPosition(x0, 0, eastZ0);
  const FR = new THREE.Matrix4().makeRotationY(Math.PI).setPosition(-x0, 0, -D / 2); // rear, local x runs west -> east

  // ---- body ----
  // Solid behind the shop fronts; a hollow 5 m zone along the front (and the
  // CVS east face) so the lit interiors show through the glass.
  const zIn = eastZ0;
  boxIn(brickM, null, W, ROOF, zIn + D / 2, 0, ROOF / 2, (zIn - D / 2) / 2);
  boxIn(brickM, null, W, 0.3, zB - zIn, 0, ROOF - 0.15, (zB + zIn) / 2);
  boxIn(brickM, null, 15.4, 0.3, zA - zB, x0 + 7.7, ROOF - 0.15, (zA + zB) / 2);
  boxIn(brickM, null, 0.3, ROOF, zB - zIn, W / 2 - 0.15, ROOF / 2, (zB + zIn) / 2);
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(W - 0.6, D - 1), roofM);
  roof.rotation.x = -Math.PI / 2;
  roof.position.set(0, ROOF + 0.02, -0.3);
  roof.receiveShadow = true;
  add(roof);
  // Low parapet on the sides and rear.
  boxIn(brickM, null, W, 0.6, 0.3, 0, ROOF + 0.3, -D / 2 + 0.15);
  boxIn(brickM, null, 0.3, 0.6, D - 1, W / 2 - 0.15, ROOF + 0.3, -0.5);
  boxIn(brickM, null, 0.3, 0.6, D - 1, -W / 2 + 0.15, ROOF + 0.3, -0.5);

  // ---- storefront bays ----
  // An opening in a brick wall: glass (with fake interior), aluminium frame,
  // mullions, optional transom bar and white spandrel panel below the glass.
  const frameCol = '#d9dcdc';
  const opening = (F, o) => {
    const { s0, s1, y0, y1 } = o;
    const w = s1 - s0, h = y1 - y0, cx = (s0 + s1) / 2, cy = (y0 + y1) / 2;
    const gy0 = o.spandrel ? o.spandrel : y0;
    const gh = y1 - gy0;
    if (o.spandrel) I.trim.add(piece(F, cx, (y0 + gy0) / 2, -0.1, w, gy0 - y0, 0.05), '#f2f0ea');
    I.clear.add(piece(F, cx, gy0 + gh / 2, -0.12, w, gh, 1), o.tint ?? '#e9eef2');
    // Interior: a lit room behind the glass.
    I.room.add(piece(F, cx, gy0 + gh / 2 + 0.1, -2.2, w, gh + 0.4, 4.0), o.room ?? '#f4efe4');
    // Reveal (brick-coloured jambs/head) and frame.
    I.trim.add(piece(F, s0 + 0.04, cy, -0.06, 0.08, h, 0.12), '#8e4632');
    I.trim.add(piece(F, s1 - 0.04, cy, -0.06, 0.08, h, 0.12), '#8e4632');
    I.frame.add(piece(F, cx, y1 - 0.04, -0.1, w, 0.08, 0.1), frameCol);
    I.frame.add(piece(F, cx, gy0 + 0.04, -0.1, w, 0.08, 0.1), frameCol);
    I.frame.add(piece(F, s0 + 0.05, gy0 + gh / 2, -0.1, 0.1, gh, 0.1), frameCol);
    I.frame.add(piece(F, s1 - 0.05, gy0 + gh / 2, -0.1, 0.1, gh, 0.1), frameCol);
    const n = o.panes ?? Math.max(1, Math.round(w / 1.4));
    for (let k = 1; k < n; k++) I.frame.add(piece(F, s0 + (w * k) / n, gy0 + gh / 2, -0.1, 0.07, gh, 0.08), frameCol);
    if (o.transom) {
      I.frame.add(piece(F, cx, o.transom, -0.1, w, 0.07, 0.08), frameCol);
      if (o.transomPanes) for (let k = 1; k < o.transomPanes; k++) I.frame.add(piece(F, s0 + (w * k) / o.transomPanes, (o.transom + y1) / 2, -0.1, 0.05, y1 - o.transom, 0.07), frameCol);
    }
    if (o.door) {
      // Glass doors with push bars.
      const [d0, d1] = o.door;
      for (const dx of [d0, (d0 + d1) / 2, d1]) I.frame.add(piece(F, dx, 1.1, -0.08, 0.09, 2.2, 0.1), frameCol);
      I.frame.add(piece(F, (d0 + d1) / 2, 2.2, -0.08, d1 - d0, 0.09, 0.1), frameCol);
      I.frame.add(piece(F, (d0 + d1) / 2, 1.0, -0.06, d1 - d0 - 0.3, 0.05, 0.06), '#a9adb0');
    }
  };
  // Brick wall with rectangular holes.
  const brickWall = (F, s0, s1, top, holes) => {
    const s = new THREE.Shape();
    s.moveTo(s0, 0); s.lineTo(s1, 0); s.lineTo(s1, top); s.lineTo(s0, top); s.closePath();
    for (const o of holes) {
      const p = new THREE.Path();
      p.moveTo(o.s0, o.y0); p.lineTo(o.s1, o.y0); p.lineTo(o.s1, o.y1); p.lineTo(o.s0, o.y1); p.closePath();
      s.holes.push(p);
    }
    const geo = new THREE.ShapeGeometry(s);
    const m = new THREE.Mesh(geo, brickM);
    m.position.z = 0.01;
    m.applyMatrix4(F);
    m.castShadow = m.receiveShadow = true;
    add(m);
    for (const o of holes) opening(F, o);
  };
  const FASCIA0 = 3.25, FASCIA1 = 3.6, BAND1 = 5.85;
  // Cream sign band with a tan picture frame, white fascia below, dentil
  // cornice above. `ends` adds the returns at either end of a projecting run.
  const band = (F, s0, s1, { frames = [[s0, s1]], cornice: withCornice = true, depth = 0.35 } = {}) => {
    const w = s1 - s0, cx = (s0 + s1) / 2;
    boxIn(white, F, w, FASCIA1 - FASCIA0, depth + 0.05, cx, (FASCIA0 + FASCIA1) / 2, (depth + 0.05) / 2, { cast: false });
    boxIn(cream, F, w, BAND1 - FASCIA1, depth, cx, (FASCIA1 + BAND1) / 2, depth / 2);
    for (const [a, b] of frames) {
      const fw = b - a - 0.5, fc = (a + b) / 2, fy0 = FASCIA1 + 0.22, fy1 = BAND1 - 0.2, t = 0.09;
      I.trim.add(piece(F, fc, fy0, depth + 0.015, fw, t, 0.03), '#bfa985');
      I.trim.add(piece(F, fc, fy1, depth + 0.015, fw, t, 0.03), '#bfa985');
      I.trim.add(piece(F, fc - fw / 2, (fy0 + fy1) / 2, depth + 0.015, t, fy1 - fy0 + t, 0.03), '#bfa985');
      I.trim.add(piece(F, fc + fw / 2, (fy0 + fy1) / 2, depth + 0.015, t, fy1 - fy0 + t, 0.03), '#bfa985');
    }
    if (withCornice) {
      boxIn(cornice, F, w + 0.1, H - BAND1, depth + 0.35, cx, (BAND1 + H) / 2, (depth + 0.35) / 2);
      boxIn(tan, F, w + 0.16, 0.08, depth + 0.42, cx, H - 0.04, (depth + 0.42) / 2, { cast: false });
      // Dentils under the cornice.
      for (let s = s0 + 0.15; s < s1 - 0.1; s += 0.32) I.trim.add(piece(F, s, BAND1 - 0.05, depth + 0.12, 0.16, 0.13, 0.22), '#cbb995');
    }
  };

  // ---- CVS bay (s 0 – 15.4), front at zA ----
  brickWall(FA, 0, 15.4, FASCIA0, [
    { s0: 1.0, s1: 3.4, y0: 0, y1: 3.05, transom: 2.45, panes: 1, door: [1.1, 3.3], room: '#fbf6ec' },
    { s0: 4.1, s1: 11.6, y0: 0.45, y1: 3.05, spandrel: 1.15, transom: 2.7, panes: 6, transomPanes: 12 },
    { s0: 12.3, s1: 14.8, y0: 0.45, y1: 3.05, spandrel: 1.15, transom: 2.7, panes: 2, transomPanes: 4 },
  ]);
  band(FA, 0, 15.4);
  // Return of the projecting CVS bay at its west end.
  {
    const F = new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(x0 + 15.4, 0, zA);
    boxIn(brickM, F, 0.6, FASCIA0, 0.02, 0.3, FASCIA0 / 2, 0);
  }
  // ---- CVS east face (local x 0 at the teal neighbour -> 5.75 at the corner) ----
  brickWall(FE, 0, 5.75, FASCIA0, [
    { s0: 0.6, s1: 1.9, y0: 0.45, y1: 3.05, spandrel: 1.15, transom: 2.7, panes: 1, transomPanes: 2 },
    { s0: 2.5, s1: 5.0, y0: 0.45, y1: 3.05, spandrel: 1.15, transom: 2.7, panes: 2, transomPanes: 4 },
  ]);
  band(FE, 0, 5.75 + 0.75, { frames: [[0, 5.75]] });

  // CVS logos: one line on the north face, stacked on the east face.
  const cvsRed = '#cc0a1c';
  const cvsLine = canvasTex(8, 1.0, (c, w, h) => {
    heart(c, h * 0.55, h * 0.52, h * 0.95, cvsRed);
    c.fillStyle = cvsRed; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    c.font = `900 ${Math.round(h * 0.98)}px "Arial Black", Arial, sans-serif`;
    c.fillText('CVS', h * 1.12, h * 0.9);
    const x2 = h * 1.12 + c.measureText('CVS').width + h * 0.08;
    c.font = `800 ${Math.round(h * 0.72)}px Arial, sans-serif`;
    c.fillText('pharmacy', x2, h * 0.9);
  });
  decal(FA, cvsLine, 7.6, 0.95, 6.9, 4.72, 0.37, { glow: 0.3, emissive: cvsRed });
  const cvsStack = canvasTex(4.4, 1.9, (c, w, h) => {
    const top = h * 0.55;
    heart(c, w * 0.2, top * 0.52, top * 0.92, cvsRed);
    c.fillStyle = cvsRed; c.textBaseline = 'alphabetic'; c.textAlign = 'left';
    c.font = `900 ${Math.round(top * 0.98)}px "Arial Black", Arial, sans-serif`;
    c.fillText('CVS', w * 0.32, top * 0.9);
    c.textAlign = 'center';
    c.font = `800 ${Math.round(h * 0.3)}px Arial, sans-serif`;
    c.fillText('pharmacy', w * 0.5, h * 0.88);
  });
  decal(FE, cvsStack, 4.3, 1.85, 2.9, 4.73, 0.37, { glow: 0.3, emissive: cvsRed });
  // Santander "ATM inside" panel hanging in the east window.
  const santander = canvasTex(1.4, 0.75, (c, w, h) => {
    c.fillStyle = '#ec0000'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#ffffff'; c.lineWidth = h * 0.03; c.strokeRect(h * 0.05, h * 0.05, w - h * 0.1, h - h * 0.1);
    c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    // flame mark
    c.beginPath(); c.ellipse(w * 0.14, h * 0.34, h * 0.07, h * 0.16, 0.3, 0, Math.PI * 2); c.fill();
    c.font = `italic 600 ${Math.round(h * 0.27)}px Georgia, serif`;
    c.fillText('Santander', w * 0.56, h * 0.35);
    c.fillRect(w * 0.08, h * 0.56, w * 0.84, h * 0.02);
    c.font = `700 ${Math.round(h * 0.17)}px Arial`;
    c.fillText('ATM INSIDE', w * 0.5, h * 0.76);
  }, '#ec0000', 512);
  decal(FE, santander, 1.2, 0.64, 3.75, 2.15, -0.16, { glow: 0.35, transparent: false, emissive: '#ffffff' });
  // Blue accessible-ramp sign beside the entrance and a small store-hours plate.
  const ramp = canvasTex(0.45, 0.6, (c, w, h) => {
    c.fillStyle = '#1f5fae'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#ffffff'; c.beginPath(); c.arc(w * 0.5, h * 0.22, w * 0.08, 0, Math.PI * 2); c.fill();
    c.fillRect(w * 0.44, h * 0.3, w * 0.12, h * 0.2);
    c.lineWidth = w * 0.07; c.strokeStyle = '#ffffff'; c.beginPath(); c.arc(w * 0.47, h * 0.55, w * 0.18, 0, Math.PI * 2); c.stroke();
    c.font = `700 ${Math.round(h * 0.09)}px Arial`; c.textAlign = 'center'; c.fillText('HANDICAPPED', w / 2, h * 0.84); c.fillText('RAMP', w / 2, h * 0.94);
  }, '#1f5fae', 256);
  decal(FA, ramp, 0.42, 0.56, 0.55, 2.0, 0.03, { glow: 0.2, transparent: false });

  // ---- mansard bay (s 15.4 – 22) ----
  brickWall(FB, 15.4, 22, FASCIA0, [
    { s0: 15.9, s1: 18.4, y0: 0.45, y1: 3.05, spandrel: 1.15, transom: 2.7, panes: 3, transomPanes: 3 },
    { s0: 20.0, s1: 21.0, y0: 0, y1: 2.2, panes: 1, tint: '#7d8186', room: '#cfc9bd' },
  ]);
  boxIn(white, FB, 6.6, 0.75, 0.3, 18.7, 3.6, 0.15, { cast: false });
  {
    // Sloped slate face leaning back to the roof edge.
    const mg = new THREE.PlaneGeometry(6.6, 2.5);
    const m = new THREE.Mesh(mg, slate);
    m.rotation.x = -0.42;
    m.position.set(18.7, 3.98 + 1.15, -0.2);
    m.applyMatrix4(FB);
    m.castShadow = m.receiveShadow = true;
    add(m);
    boxIn(M('#2f3337'), FB, 6.7, 0.1, 1.3, 18.7, 6.2, -0.6, { cast: false });
    // Cheeks closing the ends of the mansard against the neighbouring bands.
    for (const s of [15.45, 21.95]) boxIn(cream, FB, 0.1, 2.75, 1.25, s, 4.95, -0.25, { cast: false });
  }
  // ---- in-line shop (s 22 – 40): full-height storefront, unlettered band ----
  brickWall(FB, 22, 40, FASCIA0, [
    { s0: 22.7, s1: 30.0, y0: 0.5, y1: 3.05, transom: 2.75, panes: 7 },
    { s0: 30.0, s1: 32.2, y0: 0, y1: 3.05, transom: 2.45, panes: 1, door: [30.1, 32.1] },
    { s0: 32.2, s1: 39.3, y0: 0.5, y1: 3.05, transom: 2.75, panes: 7 },
  ]);
  band(FB, 22, 40);
  // ---- unlettered bay (s 40 – 47) ----
  brickWall(FB, 40, 47, FASCIA0, [
    { s0: 40.6, s1: 46.3, y0: 0.85, y1: 3.05, panes: 2, room: '#e8ece9' },
  ]);
  band(FB, 40, 47);
  // ---- AFC Urgent Care (s 47 – 62.1), No. 213-04 ----
  brickWall(FB, 47, W, FASCIA0, [
    { s0: 47.7, s1: 50.05, y0: 0.85, y1: 3.05, panes: 1, tint: '#9aa3ab', room: '#55595e' },
    { s0: 50.1, s1: 52.45, y0: 0.85, y1: 3.05, panes: 1, tint: '#9aa3ab', room: '#55595e' },
    { s0: 52.5, s1: 54.85, y0: 0.85, y1: 3.05, panes: 1, tint: '#9aa3ab', room: '#55595e' },
    { s0: 54.95, s1: 57.0, y0: 0, y1: 3.05, transom: 2.45, panes: 1, door: [55.0, 56.95], room: '#8d8a84' },
    { s0: 57.15, s1: 61.55, y0: 0.85, y1: 3.05, panes: 4 },
  ]);
  band(FB, 47, W + 0.02);
  const afcSign = canvasTex(6.4, 1.1, (c, w, h) => {
    afcCross(c, h * 0.5, h * 0.5, h * 0.92);
    c.fillStyle = '#16181b'; c.textAlign = 'left'; c.textBaseline = 'middle';
    c.font = `900 ${Math.round(h * 0.5)}px "Arial Black", Arial, sans-serif`;
    c.fillText('URGENT CARE', h * 1.12, h * 0.55);
  });
  decal(FB, afcSign, 6.0, 1.03, 54.6, 4.75, 0.37, { glow: 0.22, emissive: '#ffffff' });
  // Window graphics (white lettering on the glass, red afc crosses).
  const winText = (lines, { logo = false } = {}) => canvasTex(2.35, 2.2, (c, w, h) => {
    c.fillStyle = '#ffffff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    if (logo) {
      c.fillStyle = 'rgba(255,255,255,0.92)';
      c.beginPath(); c.arc(w / 2, h * 0.45, w * 0.2, 0, Math.PI * 2); c.fill();
      afcCross(c, w / 2, h * 0.45, w * 0.32);
      c.fillStyle = '#e03a3a'; c.font = `800 ${Math.round(h * 0.06)}px Arial`; c.fillText('WALK IN', w / 2, h * 0.14);
    }
    lines.forEach(([t, y, sz], i) => {
      c.fillStyle = '#ffffff';
      c.font = `900 ${Math.round(h * (sz ?? 0.08))}px Arial`;
      c.fillText(t, w / 2, h * y);
    });
  }, 'rgba(0,0,0,0)', 512);
  decal(FB, winText([['X-RAY & LAB', 0.12], ['ON SITE', 0.21], ['WE TREAT ADULTS', 0.42], ['& CHILDREN', 0.51], ['OPEN 7 DAYS', 0.72], ['A WEEK', 0.81]]), 2.3, 2.15, 48.88, 1.95, -0.1, { glow: 0.2 });
  decal(FB, winText([], { logo: true }), 2.3, 2.15, 51.28, 1.95, -0.1, { glow: 0.2 });
  decal(FB, winText([['FOR ILLNESS', 0.1], ['OR INJURY', 0.19], ['DOT', 0.38], ["WORKER'S", 0.55], ['COMP EXAM', 0.64], ['USCIS IMMIGRATION', 0.8, 0.06], ['PHYSICAL', 0.88]]), 2.3, 2.15, 53.68, 1.95, -0.1, { glow: 0.2 });
  // Photo panels: patients and a doctor on pale grey, one "walk in" panel.
  const person = (seed, coat) => canvasTex(1.08, 2.15, (c, w, h) => {
    const rr = rand(seed);
    c.fillStyle = '#d9dadb'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#c4c6c8'; c.fillRect(0, 0, w, h * 0.12);
    c.fillStyle = coat; c.beginPath(); c.ellipse(w * 0.5, h * 0.95, w * 0.48, h * 0.42, 0, Math.PI, 0); c.fill();
    c.fillStyle = ['#6b4a3a', '#c79c7c', '#8a5e44'][Math.floor(rr() * 3)];
    c.beginPath(); c.ellipse(w * 0.5, h * 0.4, w * 0.2, h * 0.12, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#26211f'; c.beginPath(); c.ellipse(w * 0.5, h * 0.33, w * 0.22, h * 0.08, 0, Math.PI, 0); c.fill();
  }, '#d9dadb', 256);
  const walkIn = canvasTex(1.08, 2.15, (c, w, h) => {
    c.fillStyle = '#eceded'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#d2232a'; c.textAlign = 'center'; c.font = `800 ${Math.round(h * 0.06)}px Arial`; c.fillText('WALK IN', w / 2, h * 0.2);
    afcCross(c, w / 2, h * 0.42, w * 0.42);
    c.font = `800 ${Math.round(h * 0.05)}px Arial`; c.fillText('NO APPOINTMENT', w / 2, h * 0.68); c.fillText('NEEDED', w / 2, h * 0.74);
  }, '#eceded', 256);
  [person(3, '#3d3f46'), walkIn, person(7, '#ffffff'), person(11, '#4b5b6e')].forEach((t, k) => {
    decal(FB, t, 1.04, 2.1, 57.7 + k * 1.1, 1.95, -0.1, { glow: 0.12, transparent: false });
  });
  // Brick pier and end at the west wall.
  boxIn(brickM, FB, 0.6, FASCIA0, 0.12, W - 0.3, FASCIA0 / 2, 0.06);

  // ---- rear (45th Road) ----
  for (const [s, w] of [[9, 3.2], [24, 3.2], [44, 3.2]]) {
    I.trim.add(piece(FR, W - s, 1.6, 0.02, w, 3.2, 0.05), '#8c9094'); // roll-up doors
    for (let y = 0.2; y < 3.2; y += 0.2) I.frame.add(piece(FR, W - s, y, 0.05, w, 0.03, 0.02), '#7a7e82');
  }
  for (const s of [5, 17, 31, 38, 52, 58]) I.trim.add(piece(FR, W - s, 1.05, 0.02, 0.95, 2.1, 0.05), '#6f6a62');
  boxIn(blockM, FR, W, 0.4, 0.06, W / 2, 0.2, 0.03, { cast: false });

  // ---- roof plant (satellite: units over the CVS and the in-line shops) ----
  const rtu = M('#c9c7c1', { roughness: 0.5, metalness: 0.4 });
  for (const [x, z, w, d] of [[-24, 8, 2.4, 1.8], [-17, 2, 2.4, 1.8], [-8, 9, 3.2, 2.2], [-2, 6, 4.5, 3.0], [6, 10, 2.2, 1.6], [10, -2, 2.2, 1.6], [18, 7, 2.4, 1.8], [24, 0, 2.2, 1.6], [-12, -8, 2.2, 1.6], [2, -10, 2.2, 1.6], [20, -10, 2.0, 1.5]]) {
    boxIn(rtu, null, w, 1.2, d, x, ROOF + 0.6, z);
  }

  finish();

  const floorRange = () => [0, H];
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * 10;
    switch (faceName) {
      case 'front': return V(x0 + u * W, y, zA + 2.5);
      case 'east': return V(x0 - 2.5, y, eastZ0 + u * 5.75);
      case 'lot': return V(x0 + u * W, y, 30);
      case 'roof': return V(x0 + u * W, y, 0);
      default: return V(0, y, 0);
    }
  };
  return { group: g, width: W, depth: D, height: H, floorRange, hotspotPosition };
}
