// Procedural model of a Spanish Colonial office campus, matched to photos of
// El Dorado Square, 1200 N El Dorado Pl, Tucson:
//   - two-storey cream stucco buildings with red clay-tile hip roofs, a
//     central three-storey tower with an arched loggia and small balcony,
//     wrought-iron Juliet balconies, arched ground-floor openings, brick
//     panels at the base, brick planter walls and ball-topped bollards
//   - entrance: brick pillars with stone caps and ball finials, iron fence,
//     brick-paver drive, "EL DORADO SQUARE 1200" sign in a flower bed
import * as THREE from 'three';
import { textTexture, rand } from './textures.js';
import { V, piece, createKit } from './kit.js';

export function buildMission(params) {
  const { width: W = 70, depth: D = 60 } = params;
  const front = D / 2;
  const r = rand(1981);
  const g = new THREE.Group();
  g.name = 'building';
  const { I, add, finish } = createKit(g, r);
  const stucco = new THREE.MeshStandardMaterial({ color: '#eadfc8', roughness: 0.95 });
  const brickTex = textTexture({
    width: 256, height: 256, bg: '#b5674c',
    draw(ctx, w, h) { for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? -16 : 0; x < w; x += 32) { const v = 0.85 + r() * 0.3; ctx.fillStyle = `rgb(${190 * v | 0},${104 * v | 0},${78 * v | 0})`; ctx.fillRect(x + 1, y + 1, 30, 14); } },
  });
  brickTex.wrapS = brickTex.wrapT = THREE.RepeatWrapping;
  const brick = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.9 });
  const tileTex = textTexture({
    width: 256, height: 128, bg: '#b8543a',
    draw(ctx, w, h) { for (let x = 0; x < w; x += 10) { const v = 0.8 + r() * 0.35; ctx.fillStyle = `rgb(${190 * v | 0},${86 * v | 0},${60 * v | 0})`; ctx.fillRect(x, 0, 8, h); } ctx.fillStyle = 'rgba(0,0,0,0.2)'; for (let y = 0; y < h; y += 22) ctx.fillRect(0, y, w, 3); },
  });
  tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
  tileTex.repeat.set(4, 2);
  const tiles = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.8 });
  const stone = new THREE.MeshStandardMaterial({ color: '#e3dccd', roughness: 0.9 });
  const box = (mat, w, h, d, x, y, z, ry = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.rotation.y = ry;
    m.castShadow = m.receiveShadow = true;
    return add(m);
  };
  const hipRoof = (w, d, h, x, y, z, ry = 0) => {
    // Square pyramid (rotated so its base is axis-aligned), stretched to the
    // footprint plus eaves.
    const geo = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
    geo.rotateY(Math.PI / 4);
    const m = new THREE.Mesh(geo, tiles);
    m.scale.set(w + 1.2, h, d + 1.2);
    m.position.set(x, y + h / 2, z);
    m.rotation.y = ry;
    m.castShadow = true;
    return add(m);
  };
  const bollard = (x, z) => {
    box(stone, 0.7, 1.1, 0.7, x, 0.55, z);
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.32, 14, 10), stone);
    b.position.set(x, 1.4, z);
    add(b);
  };

  // A Spanish Colonial office building facing local +z.
  function building(x, z, len, dep, ry, { tower = false, brickBase = true } = {}) {
    const H = 7.2;
    const F = new THREE.Matrix4().makeRotationY(ry).setPosition(x, 0, z);
    const P = (lx, y, lz, sx, sy, sz, c) => I.trim.add(piece(F, lx, y, lz, sx, sy, sz), c);
    const body = box(stucco, len, H, dep, 0, H / 2, 0);
    body.applyMatrix4(F);
    const roofG = hipRoof(len, dep, 2.6, 0, H, 0);
    roofG.applyMatrix4(F);
    const n = Math.floor(len / 4);
    for (let k = 0; k < n; k++) {
      const lx = -len / 2 + 2 + k * 4;
      if (tower && Math.abs(lx) < 3) continue;
      // Ground floor: arched opening (left half) or brick-based window (right).
      if (lx < 0) {
        P(lx, 1.4, dep / 2 + 0.01, 2.0, 2.6, 0.05, '#2c2a28');
        const arch = new THREE.Mesh(new THREE.CircleGeometry(1.0, 16, 0, Math.PI), new THREE.MeshStandardMaterial({ color: '#2c2a28', roughness: 0.6 }));
        arch.applyMatrix4(piece(F, lx, 2.7, dep / 2 + 0.01, 1, 1, 1));
        add(arch);
      } else {
        if (brickBase) { const bp = box(brick, 3.6, 3.2, 0.2, 0, 1.6, 0); bp.applyMatrix4(piece(F, lx, 0, dep / 2 + 0.1, 1, 1, 1)); }
        P(lx, 1.7, dep / 2 + 0.22, 1.6, 1.9, 0.04, '#2d3a33');
        for (const dx of [-0.4, 0, 0.4]) P(lx + dx, 1.7, dep / 2 + 0.25, 0.05, 1.9, 0.03, '#e9e2d2');
      }
      // Upper floor: tall window with a wrought-iron Juliet balcony.
      P(lx, 5.1, dep / 2 + 0.01, 1.3, 2.0, 0.05, '#2d3a33');
      P(lx, 4.05, dep / 2 + 0.35, 1.9, 0.12, 0.7, '#ece4d4');
      for (let b = -0.85; b <= 0.86; b += 0.14) P(lx + b, 4.55, dep / 2 + 0.68, 0.025, 0.85, 0.025, '#1b1b1b');
      P(lx, 4.98, dep / 2 + 0.68, 1.8, 0.05, 0.05, '#1b1b1b');
    }
    if (tower) {
      const tb = box(stucco, 5.2, 11, 5.2, 0, 5.5, dep / 2 - 1.6);
      tb.applyMatrix4(F);
      // Arched loggia openings and a small balcony.
      P(0, 1.5, dep / 2 + 1.01, 2.4, 3.0, 0.05, '#3a312b');
      P(0, 8.3, dep / 2 + 1.01, 2.6, 2.6, 0.05, '#3a312b');
      for (const y of [3.0, 9.6]) {
        const a = new THREE.Mesh(new THREE.CircleGeometry(1.25, 16, 0, Math.PI), new THREE.MeshStandardMaterial({ color: '#3a312b', roughness: 0.6 }));
        a.applyMatrix4(piece(F, 0, y, dep / 2 + 1.02, 1, 1, 1));
        add(a);
      }
      P(0, 7.0, dep / 2 + 1.4, 3.0, 0.15, 0.8, '#ece4d4');
      for (let b = -1.4; b <= 1.41; b += 0.14) P(b, 7.45, dep / 2 + 1.78, 0.025, 0.8, 0.025, '#1b1b1b');
      const tr = hipRoof(5.2, 5.2, 1.6, 0, 11, dep / 2 - 1.6);
      tr.applyMatrix4(F);
      // Warm lantern in the loggia.
      P(0, 9.2, dep / 2 + 0.6, 0.35, 0.45, 0.35, '#ffd9a0');
    }
    // Brick planter walls with ball bollards in front.
    const pw = box(brick, len * 0.8, 0.6, 0.45, 0, 0.3, dep / 2 + 3.2);
    pw.applyMatrix4(F);
    for (const lx of [-len * 0.4, -len * 0.13, len * 0.13, len * 0.4]) {
      const v = new THREE.Vector3(lx, 0, dep / 2 + 3.6).applyMatrix4(F);
      bollard(v.x, v.z);
    }
  }

  // Featured building (photo 2) at the front, siblings around the quad.
  building(0, front - 8, 40, 14, 0, { tower: true });
  building(-W / 2 + 8, -6, 26, 12, Math.PI / 2);
  building(W / 2 - 8, -6, 26, 12, -Math.PI / 2, { brickBase: false });
  building(0, -front + 8, 34, 12, Math.PI, { brickBase: false });

  // Quad: lawn, sycamores and olive trees.
  const lawn = new THREE.Mesh(new THREE.PlaneGeometry(W - 30, 22), new THREE.MeshStandardMaterial({ color: '#5f913f', roughness: 1 }));
  lawn.rotation.x = -Math.PI / 2;
  lawn.position.set(0, 0.05, -6);
  add(lawn);
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#c9c0b3', roughness: 1 });
  const leafA = new THREE.MeshStandardMaterial({ color: '#a8823c', roughness: 1 }); // autumn sycamore
  const leafB = new THREE.MeshStandardMaterial({ color: '#7d8a63', roughness: 1 }); // olive
  const tree = (x, z, s, leaf) => {
    const t = box(trunkMat, 0.5 * s, 7 * s, 0.5 * s, x, 3.5 * s, z);
    t.rotation.z = (r() - 0.5) * 0.2;
    for (let k = 0; k < 5; k++) {
      const c = new THREE.Mesh(new THREE.IcosahedronGeometry((2 + r()) * s, 1), leaf);
      c.position.set(x + (r() - 0.5) * 4 * s, (7 + r() * 2.5) * s, z + (r() - 0.5) * 4 * s);
      c.castShadow = true;
      add(c);
    }
  };
  for (const [x, z] of [[-14, front + 4], [14, front + 4], [-6, -6], [8, -10], [-W / 2 - 4, front - 6]]) tree(x, z, 1, leafA);
  for (const [x, z] of [[W / 2 + 6, front + 12], [W / 2 + 12, front + 6]]) tree(x, z, 0.9, leafB);

  // Entrance: brick pillars with ball finials, iron fence, paver drive, sign.
  {
    const ex = W / 2 + 4;
    const ez = front + 10;
    for (const dz of [0, 9]) {
      box(brick, 1.6, 3.6, 1.6, ex, 1.8, ez - dz);
      box(stone, 1.9, 0.35, 1.9, ex, 3.75, ez - dz);
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), stone);
      ball.position.set(ex, 4.4, ez - dz);
      add(ball);
    }
    box(brick, 0.5, 1.2, 9, ex, 0.6, ez - 4.5);
    for (let k = 0; k <= 9; k += 0.18) I.steel.add(piece(new THREE.Matrix4(), ex, 2.0, ez - k, 0.03, 1.6, 0.03));
    I.steel.add(piece(new THREE.Matrix4(), ex, 2.8, ez - 4.5, 0.05, 0.05, 9));
    const paverTex = textTexture({
      width: 256, height: 256, bg: '#8f5a48',
      draw(ctx, w, h) { for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 32) { const v = 0.85 + r() * 0.25; ctx.fillStyle = `rgb(${150 * v | 0},${92 * v | 0},${74 * v | 0})`; ctx.fillRect(x + ((y / 16) % 2 ? 0 : 16), y, 30, 14); } },
    });
    paverTex.wrapS = paverTex.wrapT = THREE.RepeatWrapping;
    paverTex.repeat.set(4, 10);
    const drive = new THREE.Mesh(new THREE.PlaneGeometry(9, 40), new THREE.MeshStandardMaterial({ map: paverTex, roughness: 0.95 }));
    drive.rotation.x = -Math.PI / 2;
    drive.position.set(ex + 6, 0.06, ez - 6);
    add(drive);
    // Sign on a flower bed.
    const signTex = textTexture({
      width: 1024, height: 320, bg: '#e8e2cf',
      draw(ctx, w, h) {
        ctx.strokeStyle = '#2f5a3a'; ctx.lineWidth = 12; ctx.strokeRect(14, 14, w - 28, h - 28);
        ctx.fillStyle = '#2f5a3a'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = 'italic 600 54px Georgia, serif'; ctx.fillText('ES', w / 2, 70);
        ctx.font = '600 104px Georgia, "Times New Roman", serif'; ctx.fillText('EL DORADO SQUARE', w / 2, 175);
        ctx.font = '600 48px Georgia, serif'; ctx.fillText('1200', w / 2, 262);
      },
    });
    const s = box(new THREE.MeshStandardMaterial({ color: '#2f5a3a' }), 5, 1.6, 0.3, ex + 1.2, 1.6, ez + 4.5, Math.PI / 2);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 1.5), new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.6 }));
    face.position.set(ex + 1.36, 1.6, ez + 4.5);
    face.rotation.y = Math.PI / 2;
    add(face);
    box(brick, 1.6, 0.6, 7, ex + 1.8, 0.3, ez + 4.5);
    const cols = ['#e2366b', '#f4f0f2', '#7a3fa0', '#d61f3c', '#f7a8c4'];
    for (let k = 0; k < 80; k++) {
      const f = new THREE.Mesh(new THREE.IcosahedronGeometry(0.22, 0), new THREE.MeshStandardMaterial({ color: cols[k % cols.length], roughness: 0.8 }));
      f.position.set(ex + 2.6 + r() * 2.4, 0.3 + r() * 0.3, ez + 1.2 + r() * 6.6);
      add(f);
    }
  }

  finish();
  const floorRange = (n) => [(n - 1) * 3.6, n * 3.6];
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * 12;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, front + 1.5);
      case 'gate': return V(W / 2 + 4, 5.5, front + 10);
      case 'roof': return V((u - 0.5) * W, y, 0);
      default: return V(0, y, 0);
    }
  };
  return { group: g, width: W, depth: D, height: 14, floorRange, hotspotPosition };
}
