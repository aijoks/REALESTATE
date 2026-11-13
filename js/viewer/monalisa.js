// Procedural model of a two-storey mission-revival office building, matched
// to the photo of Mona Lisa Plaza, 7225 N Mona Lisa Rd, Tucson:
//   - textured off-white stucco, red parapet coping, a curved mission
//     parapet with a quatrefoil medallion over the front, lower east wing
//   - deep two-storey arched (scalloped) entrance recesses on two faces
//   - ground-floor arcade of square piers with notched lintels and a thin
//     dark-red stripe at their base; paired windows in stucco surrounds
//   - "gentle dental" script sign, "7225" on the corner, wall lantern
import * as THREE from 'three';
import { textTexture, rand } from './textures.js';
import { V, piece, createKit } from './kit.js';

export function buildMonaLisa(params) {
  // Satellite: L-shaped footprint, a 57 x 29 m bar along Ina Rd plus a
  // 24 x 15 m block behind its east (Mona Lisa Rd) end; total depth 44 m.
  const { width: W = 57, depth: D = 44, barDepth: DB = 29, tenantSign = 'gentle dental', number = '7225' } = params;
  const front = D / 2;
  const r = rand(7225);
  const H = 8.6;
  const g = new THREE.Group();
  g.name = 'building';
  const { I, add, finish } = createKit(g, r, { glass: 'sky' });
  const stuccoTex = textTexture({
    width: 256, height: 256, bg: '#ece8e0',
    draw(ctx, w, h) { for (let i = 0; i < 5000; i++) { const v = r(); ctx.fillStyle = v < 0.5 ? `rgba(0,0,0,${v * 0.06})` : `rgba(255,255,255,${(v - 0.5) * 0.1})`; ctx.fillRect(r() * w, r() * h, 2 + r() * 3, 2 + r() * 3); } },
  });
  stuccoTex.wrapS = stuccoTex.wrapT = THREE.RepeatWrapping;
  stuccoTex.repeat.set(6, 2);
  const stucco = new THREE.MeshStandardMaterial({ map: stuccoTex, roughness: 0.95 });
  const redMat = new THREE.MeshStandardMaterial({ color: '#c8102e', roughness: 0.6 });
  const M0 = new THREE.Matrix4();
  const box = (mat, w, h, d, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    return add(m);
  };

  // Satellite + photo: the taller parapeted main block is the east 24 m
  // (full 44 m depth along Mona Lisa Rd); the slightly lower west wing runs
  // 33 m along Ina Rd, 29 m deep (L-shape, parking in the notch behind it).
  const NW = 24;
  const mainW = NW;
  const mx = W / 2 - mainW / 2;
  const bz = front - DB / 2;
  box(stucco, mainW, H, D, mx, H / 2, 0);
  const wingW = W - mainW;
  box(stucco, wingW, H - 0.6, DB - 1, -W / 2 + wingW / 2, (H - 0.6) / 2, bz - 0.5);
  // Red coping along the parapets.
  const coping = (w, d, x, y, z) => {
    box(redMat, w + 0.2, 0.3, 0.5, x, y, z + d / 2 - 0.15);
    box(redMat, w + 0.2, 0.3, 0.5, x, y, z - d / 2 + 0.15);
    box(redMat, 0.5, 0.3, d, x - w / 2 + 0.15, y, z);
    box(redMat, 0.5, 0.3, d, x + w / 2 - 0.15, y, z);
  };
  coping(mainW, D, mx, H + 0.15, 0);
  coping(wingW, DB - 1, -W / 2 + wingW / 2, H - 0.45, bz - 0.5);
  // Low clay-tile hip roofs behind the parapets (seen from above).
  const tileTex = textTexture({
    width: 256, height: 128, bg: '#b8543a',
    draw(ctx, w, h) { for (let x = 0; x < w; x += 10) { const v = 0.8 + r() * 0.35; ctx.fillStyle = `rgb(${205 * v | 0},${92 * v | 0},${60 * v | 0})`; ctx.fillRect(x, 0, 8, h); } ctx.fillStyle = 'rgba(0,0,0,0.2)'; for (let y = 0; y < h; y += 22) ctx.fillRect(0, y, w, 3); },
  });
  tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
  tileTex.repeat.set(6, 3);
  const tiles = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.8 });
  const hip = (w, d, h, x, y, z) => {
    const geo = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
    geo.rotateY(Math.PI / 4);
    const m = new THREE.Mesh(geo, tiles);
    m.scale.set(w, h, d);
    m.position.set(x, y + h / 2, z);
    m.castShadow = true;
    return add(m);
  };
  hip(mainW - 0.9, D - 0.9, 2.8, mx, H - 0.9, 0);
  hip(wingW - 0.3, DB - 1.9, 2.6, -W / 2 + wingW / 2 - 0.3, H - 1.5, bz - 0.5);
  box(new THREE.MeshStandardMaterial({ color: '#a9c0c8', roughness: 0.7 }), 6, 0.3, 9, W / 2 - NW + 4, H + 0.2, -front + 7);

  // Curved mission parapet over the front of the main block.
  {
    const pw = mainW * 0.82;
    const pts = [];
    const n = 40;
    for (let k = 0; k <= n; k++) {
      const t = k / n;
      const x = -pw / 2 + t * pw;
      const bell = Math.exp(-Math.pow((t - 0.5) / 0.22, 2)) * 2.4;
      const steps = (t < 0.08 || t > 0.92) ? 0.5 : (t < 0.14 || t > 0.86) ? 0.9 : 1.0;
      pts.push([x, Math.max(steps, bell + 0.6)]);
    }
    const s = new THREE.Shape();
    s.moveTo(-pw / 2, 0);
    pts.forEach(([x, y]) => s.lineTo(x, y));
    s.lineTo(pw / 2, 0);
    s.closePath();
    const para = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 0.6, bevelEnabled: false }), stucco);
    const px = mx - mainW / 2 + pw / 2 + 0.6;
    para.position.set(px, H, front - 0.3);
    para.castShadow = true;
    add(para);
    // Red coping following the curve.
    for (let k = 0; k < pts.length - 1; k++) {
      const [x0, y0] = pts[k];
      const [x1, y1] = pts[k + 1];
      const len = Math.hypot(x1 - x0, y1 - y0);
      const seg = new THREE.Mesh(new THREE.BoxGeometry(len + 0.05, 0.28, 0.75), redMat);
      seg.position.set(px + (x0 + x1) / 2, H + (y0 + y1) / 2 + 0.1, front);
      seg.rotation.z = Math.atan2(y1 - y0, x1 - x0);
      add(seg);
    }
    // Quatrefoil medallion.
    const med = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.15, 24), stucco);
    med.rotation.x = Math.PI / 2;
    med.position.set(px - pw * 0.22, H + 0.2, front + 0.38);
    add(med);
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.06, 4), redMat);
    inner.rotation.x = Math.PI / 2;
    inner.position.set(px - pw * 0.22, H + 0.2, front + 0.48);
    add(inner);
    // Script sign.
    const tex = textTexture({
      width: 1024, height: 256, bg: 'rgba(0,0,0,0)',
      draw(ctx, w, h) { ctx.font = 'italic 600 150px "Brush Script MT", "Segoe Script", Georgia, cursive'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#6e7378'; ctx.fillText(tenantSign, w / 2 + 4, h / 2 + 4); ctx.fillStyle = '#e9edf0'; ctx.fillText(tenantSign, w / 2, h / 2); },
    });
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(7, 1.75), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.3, metalness: 0.5, depthWrite: false }));
    sg.position.set(px + 2.5, H + 0.45, front + 0.36);
    add(sg);
  }

  // Scalloped two-storey arched recess cut into a face (frame F, local +z out).
  const archRecess = (F, cx, w, h) => {
    const P = (lx, y, lz, sx, sy, sz, c) => I.trim.add(piece(F, lx, y, lz, sx, sy, sz), c);
    // Dark recess back wall with upper glazing and ground-floor door.
    P(cx, h / 2, 0.03, w, h, 0.04, '#d6d0c5');
    I.glass.add(piece(F, cx, h - 2.0, 0.07, w - 0.8, 1.9, 1), '#3d4650');
    for (let k = 1; k < 4; k++) P(cx - w / 2 + 0.4 + (k * (w - 0.8)) / 4, h - 2.0, 0.09, 0.08, 1.9, 0.04, '#2a2c2e');
    P(cx, 1.3, 0.07, 1.8, 2.5, 0.04, '#2c3036');
    P(cx, 3.0, 0.07, w - 0.8, 0.12, 0.05, '#c9c2b5');
    // Side returns of the recess.
    for (const sx of [-1, 1]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(0.9, h, 1.6), stucco);
      side.applyMatrix4(piece(F, cx + sx * (w / 2 + 0.45), h / 2, 0.8, 1, 1, 1));
      add(side);
    }
    // Scalloped arch head: outer trim band and two shoulders.
    const head = new THREE.Mesh(new THREE.TorusGeometry(w / 2 - 0.5, 0.28, 8, 24, Math.PI), stucco);
    head.applyMatrix4(piece(F, cx, h - 0.9, 0.9, 1, 0.55, 1));
    add(head);
    for (const sx of [-1, 1]) P(cx + sx * (w / 2 - 0.25), h - 1.3, 0.9, 0.7, 0.8, 1.6, '#e4e0d7');
    P(cx, h - 0.15, 0.8, w + 1.8, 0.5, 1.6, '#e8e4dc');
  };
  const Ff = new THREE.Matrix4().setPosition(-W / 2, 0, front);
  const Fe = new THREE.Matrix4().makeRotationY(Math.PI / 2).setPosition(W / 2, 0, front);
  archRecess(Ff, W - 8.5, 7.0, H - 1.0);
  archRecess(Fe, 10, 6.5, H - 1.0);

  // Ground-floor arcade of square piers with notched lintels.
  const arcade = (F, x0, x1, z) => {
    const P = (lx, y, lz, sx, sy, sz, c) => I.trim.add(piece(F, lx, y, lz, sx, sy, sz), c);
    for (let x = x0; x <= x1 + 0.01; x += 3.4) {
      P(x, 1.6, z, 0.9, 3.2, 0.9, '#eae6de');
      P(x, 0.55, z + 0.47, 0.92, 0.08, 0.02, '#7e1d1f'); // red stripe
    }
    for (let x = x0; x < x1; x += 3.4) {
      P(x + 1.7, 3.35, z, 3.4, 0.5, 0.9, '#eae6de');
      P(x + 0.85, 3.0, z, 0.35, 0.3, 0.9, '#eae6de');
      P(x + 2.55, 3.0, z, 0.35, 0.3, 0.9, '#eae6de');
      I.glass.add(piece(F, x + 1.7, 1.7, 0.05, 2.2, 2.0, 1), '#5b6b78');
    }
  };
  arcade(Ff, 1.5, W - 14.5, 1.1);
  arcade(Fe, 15, D - 1.5, 1.1);

  // Paired upper windows in stucco surrounds.
  const pairs = (F, xs) => {
    for (const x of xs) {
      I.trim.add(piece(F, x, 6.1, 0.06, 2.1, 2.3, 0.12), '#e1dccf');
      for (const dx of [-0.42, 0.42]) I.glass.add(piece(F, x + dx, 6.1, 0.13, 0.62, 1.8, 1), '#4a5866');
    }
  };
  pairs(Ff, [3, 7, 11, 15, 19, 23, 27, 31, 35.5, 38.5, 41.5]);
  pairs(Fe, [16.5, 20, 23.5, 27, 30.5, 34, 37.5, 41]);
  // Rear (north) and west walls: plain paired windows on both floors.
  const Fn = new THREE.Matrix4().makeRotationY(Math.PI).setPosition(W / 2, 0, -front);
  const Fn2 = new THREE.Matrix4().makeRotationY(Math.PI).setPosition(W / 2 - NW, 0, front - DB);
  const Fw = new THREE.Matrix4().makeRotationY(-Math.PI / 2).setPosition(-W / 2, 0, front - DB + 1);
  for (const [F, xs] of [[Fn, [3, 7, 11, 15, 19]], [Fn2, [3, 7, 11, 15, 19, 23, 27, 31]], [Fw, [4, 8, 12, 16, 20, 24]]]) {
    pairs(F, xs);
    for (const x of xs) for (const dx of [-0.42, 0.42]) I.glass.add(piece(F, x + dx, 2.0, 0.13, 0.62, 1.8, 1), '#4a5866');
  }
  // Corner address and wall lantern.
  {
    const num = textTexture({ text: number, width: 256, height: 96, bg: 'rgba(0,0,0,0)', ink: '#222222', font: '600 74px Georgia, serif' });
    const n = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.52), new THREE.MeshBasicMaterial({ map: num, transparent: true, depthWrite: false }));
    n.rotation.y = Math.PI / 2;
    n.position.set(W / 2 + 0.03, H - 0.8, front - 0.9);
    add(n);
    I.trim.add(piece(Ff, W - 12.6, 3.2, 0.2, 0.3, 0.55, 0.3), '#1e1e1e');
  }
  // Tenant signage (listings / directories, see properties.js tenants).
  {
    const plate = (F, text, x, y, w, h, ink, bg = '#f4f2ee', font = 'bold 64px "Helvetica Neue", Arial, sans-serif') => {
      const tex = textTexture({ width: 512, height: Math.round((512 * h) / w), bg, ink, draw(ctx, cw, ch) {
        ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const lines = text.split('\n');
        lines.forEach((ln, i) => { ctx.font = i ? font.replace(/\d+px/, (m) => `${Math.round(parseInt(m) * 0.6)}px`) : font; ctx.fillText(ln, cw / 2, (ch * (i + 0.5)) / lines.length, cw - 24); });
      } });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 }));
      m.applyMatrix4(piece(F, x, y, 0.09, 1, 1, 1));
      add(m);
    };
    // Second Gentle Dental sign high on the east wall (photo, far right).
    const gd = textTexture({
      width: 512, height: 160, bg: 'rgba(0,0,0,0)',
      draw(ctx, w, h) { ctx.font = 'italic 600 96px "Brush Script MT", "Segoe Script", Georgia, cursive'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#2a8c9a'; ctx.fillText('gentle', w * 0.3, h / 2); ctx.fillStyle = '#d23c5a'; ctx.fillText('dental', w * 0.72, h / 2); },
    });
    const gs = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 1.0), new THREE.MeshStandardMaterial({ map: gd, transparent: true, roughness: 0.4, depthWrite: false }));
    gs.applyMatrix4(piece(Fe, 21.75, H - 0.6, 0.08, 1, 1, 1));
    add(gs);
    // Ground-floor suites: window lettering in the arcade bays.
    plate(Ff, 'BAYADA\nHome Health Care', 1.5 + 3.4 * 2 + 1.7, 2.3, 2.4, 0.75, '#00508f');
    plate(Ff, 'Soreo Pathways', 1.5 + 3.4 * 4 + 1.7, 2.3, 2.4, 0.55, '#2f6f73');
    plate(Ff, 'Arizona DES\nState of Arizona', 1.5 + 3.4 * 6 + 1.7, 2.3, 2.4, 0.75, '#1b365d');
    plate(Fe, 'HomeWell\nCare Services', 15 + 3.4 * 2 + 1.7, 2.3, 2.4, 0.75, '#5b2a86');
    plate(Fe, 'Spencer Construction', 15 + 3.4 * 5 + 1.7, 2.3, 2.4, 0.55, '#7a4a1e');
    // Lobby directories inside both arched entries.
    const dir = 'MONA LISA PLAZA\n101  Available\n200  Morgan, Cohen & Bach\n203  Gentle Dental\n1st fl  BAYADA · Soreo Pathways\nAZ DES · HomeWell · Spencer Constr.';
    plate(Ff, dir, W - 8.5 + 1.6, 1.6, 1.0, 1.2, '#1e2a33', '#e9e5dc', 'bold 54px "Helvetica Neue", Arial, sans-serif');
    plate(Fe, dir, 10 + 1.4, 1.6, 1.0, 1.2, '#1e2a33', '#e9e5dc', 'bold 54px "Helvetica Neue", Arial, sans-serif');
    // Morgan, Cohen & Bach (Suite 200) lettering in an upper front window.
    plate(Ff, 'MORGAN, COHEN & BACH\nAttorneys · Suite 200', 27, 6.1, 2.0, 0.55, '#1f3a5f');
  }
  // Low stucco screen wall and shrubs at the corner.
  box(stucco, 3.4, 1.6, 2.4, W / 2 + 2.6, 0.8, front - 13);
  const shrub = new THREE.MeshStandardMaterial({ color: '#3f6b2c', roughness: 1 });
  for (const [x, z, s] of [[W / 2 + 3, front - 9, 1.6], [W / 2 + 4.5, front + 2, 0.7]]) {
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 1), shrub);
    b.position.set(x, s * 0.8, z);
    b.castShadow = true;
    add(b);
  }
  const bloom = new THREE.MeshStandardMaterial({ color: '#f2f2ee', roughness: 1 });
  for (let k = 0; k < 4; k++) {
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.4, 1), k % 2 ? bloom : shrub);
    c.position.set(W / 2 + 4 + (r() - 0.5) * 2, 3 + r(), -front + 4 + (r() - 0.5) * 2);
    c.castShadow = true;
    add(c);
  }

  finish();
  const floorRange = (n) => [(n - 1) * 4.2, n * 4.2];
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * 11;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, front + 2);
      case 'right': return V(W / 2 + 2, y, front - u * D);
      default: return V(0, y, 0);
    }
  };
  // The L-shaped outline (main block + west wing, overlapping), so floor-plan
  // cut-aways keep to the building and leave the parking notch alone.
  const footprint = [[W / 2 - mainW, -front, W / 2, front], [-W / 2, bz - 0.5 - (DB - 1) / 2, W / 2, bz - 0.5 + (DB - 1) / 2]];
  // Ground-floor plans sit clear of the site's parking-lot paving (y ≈ 0.035).
  return { group: g, width: W, depth: D, height: 12, floorRange, hotspotPosition, footprint, groundLift: 0.1 };
}
