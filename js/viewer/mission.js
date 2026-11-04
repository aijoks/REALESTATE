// Procedural model of El Dorado Square, 1200 N El Dorado Pl, Tucson: a
// nine-building Spanish Colonial office campus (built 1981), traced from
// satellite imagery. Origin = campus centre; +x east, +z south (El Dorado
// Place, the campus entrance), -z north. Buildings A-I (suite numbers
// A-1xx ... I-9xx; the photo of Building D shows "D 400"):
//   A SE of the entrance drive   B SW of the drive   C west, middle
//   D west (photo: tower + loggia, faces south)   E, F north courtyard pair
//   G, H east (rotated ~30 / 23 deg)   I south-east
// Details from the photos: cream stucco, red clay-tile hip roofs, a
// three-storey loggia tower with balcony, wrought-iron Juliet balconies,
// arched ground-floor openings, brick base panels, brick planter walls with
// ball-topped stone bollards, a gated brick-paver entrance with brick
// pillars, iron fence and the "EL DORADO SQUARE 1200" sign in a flower bed.
// Tenant directory boards on each building (see properties.js tenants).
import * as THREE from 'three';
import { textTexture, rand } from './textures.js';
import { V, piece, createKit } from './kit.js';

// Known tenants per building (listings / directories; see properties.js).
const TENANTS = {
  C: ['Zola Healing CoLab · C-320'],
  D: ['Monier Insurance Agency · D-430', 'Desert Breeze Mental Health · D-420', 'Liberation Counseling · D-420'],
  F: ['Scarlet Rabbit Wellness · F-600', 'Lucid Awakening · F-640', 'Help & Hope Counseling · F-640'],
  G: ['Human Resource Network'],
  I: ['Nutritional Services of S. Arizona · I-905'],
};

// Building specs: centre, rotation, bars (local x0,x1,z0,z1), front face.
// front: { bar index, side: 'n'|'s'|'e'|'w' } (local directions).
export const ED_BUILDINGS = [
  { id: 'A', cx: 4, cz: 53.5, ry: 0, bars: [[-14, 15, -13.5, -4.5], [-14, -5, -4.5, 13.5], [-14, 6, 5, 13.5], [4, 14, -5, 9, 'flat']], front: [0, 'n'] },
  { id: 'B', cx: -56, cz: 56, ry: 0, bars: [[-20, 20, -13, -5], [-12, 18, 4, 13], [-3, 8, -6, 5], [-20, -14, -5, 10, 'flat']], front: [0, 'e'] },
  { id: 'C', cx: -56, cz: 27, ry: 0, bars: [[-21, 21, -11, -1.5], [-21, 6, 3, 11], [10, 21, -1.5, 9], [-10, 4, -2, 4]], front: [1, 's'] },
  { id: 'D', cx: -55, cz: -9, ry: 0, bars: [[-19, 19, 1, 11.5], [-19, -10, -12, 1], [10, 19, -12, 1], [-19, 19, -12, -5]], front: [0, 's'], tower: -4 },
  { id: 'E', cx: -12, cz: -32, ry: 0, bars: [[-17, 17, 5, 14], [-17, 17, -14, -5], [-17, -8, -5, 5], [8, 17, -5, 5]], front: [0, 's'] },
  { id: 'F', cx: 23.5, cz: -30.5, ry: 0, bars: [[-13.5, 13.5, 5, 13.5], [-13.5, 13.5, -13.5, -5], [-13.5, -5, -5, 5], [5, 13.5, -5, 5]], front: [0, 's'] },
  { id: 'G', cx: 76, cz: -35, ry: 0.52, bars: [[-12.5, 12.5, 4.5, 13], [-12.5, 12.5, -13, -4.5], [-12.5, -4, -4.5, 4.5], [4, 12.5, -4.5, 4.5]], front: [0, 's'] },
  { id: 'H', cx: 77, cz: -4.5, ry: 0.4, bars: [[-9.5, 9.5, 3, 11], [-9.5, 9.5, -11, -3], [-9.5, -3, -3, 3], [3, 9.5, -3, 3]], front: [2, 'w'] },
  { id: 'I', cx: 39, cz: 41, ry: 0, bars: [[-12.5, 12.5, -7, 3], [-6, 6, 3, 11]], front: [0, 'n'] },
];

export function buildMission(params) {
  const { width: W = 150, depth: D = 140 } = params;
  const front = D / 2;
  const r = rand(1981);
  const g = new THREE.Group();
  g.name = 'building';
  const { I, add, finish } = createKit(g, r);
  const stucco = new THREE.MeshStandardMaterial({ color: '#eadfc8', roughness: 0.95 });
  const flatRoof = new THREE.MeshStandardMaterial({ color: '#d9d6cf', roughness: 0.9 });
  const brickTex = textTexture({
    width: 256, height: 256, bg: '#b5674c',
    draw(ctx, w, h) { for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? -16 : 0; x < w; x += 32) { const v = 0.85 + r() * 0.3; ctx.fillStyle = `rgb(${190 * v | 0},${104 * v | 0},${78 * v | 0})`; ctx.fillRect(x + 1, y + 1, 30, 14); } },
  });
  brickTex.wrapS = brickTex.wrapT = THREE.RepeatWrapping;
  const brick = new THREE.MeshStandardMaterial({ map: brickTex, roughness: 0.9 });
  const tileTex = textTexture({
    width: 256, height: 128, bg: '#b8543a',
    draw(ctx, w, h) { for (let x = 0; x < w; x += 10) { const v = 0.8 + r() * 0.35; ctx.fillStyle = `rgb(${200 * v | 0},${88 * v | 0},${58 * v | 0})`; ctx.fillRect(x, 0, 8, h); } ctx.fillStyle = 'rgba(0,0,0,0.2)'; for (let y = 0; y < h; y += 22) ctx.fillRect(0, y, w, 3); },
  });
  tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
  tileTex.repeat.set(4, 2);
  const tiles = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.8 });
  const stone = new THREE.MeshStandardMaterial({ color: '#e3dccd', roughness: 0.9 });
  const archMat = new THREE.MeshStandardMaterial({ color: '#2c2a28', roughness: 0.6 });
  const archGeo = new THREE.CircleGeometry(1.0, 14, 0, Math.PI);
  const box = (mat, w, h, d, x, y, z, ry = 0) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z); m.rotation.y = ry;
    m.castShadow = m.receiveShadow = true;
    return add(m);
  };
  const hipGeo = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
  hipGeo.rotateY(Math.PI / 4);
  hipGeo.translate(0, 0.5, 0);
  const H = 7.2;
  const ballGeo = new THREE.SphereGeometry(0.32, 12, 8);
  const bollard = (x, z) => {
    box(stone, 0.7, 1.1, 0.7, x, 0.55, z);
    const b = new THREE.Mesh(ballGeo, stone);
    b.position.set(x, 1.4, z);
    add(b);
  };
  const signMat = (tex) => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 });

  // Windows and details on one wall. F: frame at the wall centre (ground
  // level), local +z out of the wall. rich = the building's main front.
  function wallDetail(F, L, rich, skipX = null) {
    const P = (lx, y, lz, sx, sy, sz, c) => I.trim.add(piece(F, lx, y, lz, sx, sy, sz), c);
    const n = Math.floor((L - 2) / 4);
    if (n < 1) return;
    const x0 = -((n - 1) * 4) / 2;
    for (let k = 0; k < n; k++) {
      const lx = x0 + k * 4;
      if (skipX !== null && Math.abs(lx - skipX) < 3.4) continue;
      if (rich && k % 3 === 0) {
        // Arched ground-floor opening.
        P(lx, 1.4, 0.01, 2.0, 2.6, 0.05, '#2c2a28');
        const a = new THREE.Mesh(archGeo, archMat);
        a.applyMatrix4(piece(F, lx, 2.7, 0.012, 1, 1, 1));
        add(a);
      } else {
        if (rich) P(lx, 1.6, 0.1, 3.4, 3.2, 0.2, '#b4654a');
        P(lx, 1.7, 0.22, 1.6, 1.9, 0.04, '#2d3a33');
        for (const dx of [-0.4, 0, 0.4]) P(lx + dx, 1.7, 0.25, 0.05, 1.9, 0.03, '#e9e2d2');
      }
      // Upper floor: tall window, Juliet balcony on the main fronts.
      P(lx, 5.1, 0.01, 1.3, 2.0, 0.05, '#2d3a33');
      P(lx, 5.1, 0.03, 0.05, 2.0, 0.03, '#e9e2d2');
      if (rich || k % 2 === 0) {
        P(lx, 4.05, 0.35, 1.9, 0.12, 0.7, '#ece4d4');
        for (let b = -0.85; b <= 0.86; b += 0.17) I.steel.add(piece(F, lx + b, 4.55, 0.68, 0.025, 0.85, 0.025));
        I.steel.add(piece(F, lx, 4.98, 0.68, 1.8, 0.05, 0.05));
      } else {
        P(lx, 4.02, 0.08, 1.6, 0.1, 0.16, '#ece4d4');
      }
    }
  }

  // Board with a building letter + suite block, and tenant names.
  function directory(F, id, names) {
    const tex = textTexture({
      width: 512, height: 512, bg: '#2f5a3a',
      draw(ctx, w, h) {
        ctx.strokeStyle = '#e8e2cf'; ctx.lineWidth = 8; ctx.strokeRect(10, 10, w - 20, h - 20);
        ctx.fillStyle = '#e8e2cf'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '600 120px Georgia, serif'; ctx.fillText(id, w / 2, 92);
        ctx.font = '600 40px Georgia, serif'; ctx.fillText(`${'ABCDEFGHI'.indexOf(id) + 1}00`, w / 2, 168);
        ctx.font = '600 30px Georgia, serif';
        (names ?? []).forEach((t, i) => {
          const [nm, su] = t.split(' · ');
          ctx.font = '600 31px Georgia, serif'; ctx.fillText(nm, w / 2, 236 + i * 88, w - 40);
          if (su) { ctx.font = 'italic 26px Georgia, serif'; ctx.fillText(su, w / 2, 270 + i * 88); }
        });
      },
    });
    const mat = signMat(tex);
    const post = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.6, 0.18), new THREE.MeshStandardMaterial({ color: '#2f5a3a', roughness: 0.6 }));
    post.applyMatrix4(piece(F, 0, 1.25, 0, 1, 1, 1));
    post.castShadow = true;
    add(post);
    for (const s of [-0.6, 0.6]) I.steel.add(piece(F, s, 0.25, 0, 0.08, 0.5, 0.08));
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.4), mat);
    face.applyMatrix4(piece(F, 0, 1.25, 0.1, 1, 1, 1));
    add(face);
  }
  // Big wall letter plaque (Building D photo: "D" over the suite block).
  function plaque(F, id) {
    const tex = textTexture({
      width: 128, height: 192, bg: '#e9e1cc',
      draw(ctx, w, h) {
        ctx.fillStyle = '#3a3330'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '600 104px Georgia, serif'; ctx.fillText(id, w / 2, 70);
        ctx.font = '600 40px Georgia, serif'; ctx.fillText(`${'ABCDEFGHI'.indexOf(id) + 1}00`, w / 2, 158);
      },
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 1.1), signMat(tex));
    m.applyMatrix4(piece(F, 0, 3.0, 0.03, 1, 1, 1));
    add(m);
  }

  const sideFrame = (BF, bx, bz, w, d, side) => {
    const [ang, ox, oz, L] = { s: [0, 0, d / 2, w], n: [Math.PI, 0, -d / 2, w], e: [Math.PI / 2, w / 2, 0, d], w: [-Math.PI / 2, -w / 2, 0, d] }[side];
    return [BF.clone().multiply(new THREE.Matrix4().makeRotationY(ang).setPosition(bx + ox, 0, bz + oz)), L];
  };

  const centres = {};
  for (const b of ED_BUILDINGS) {
    const BF = new THREE.Matrix4().makeRotationY(b.ry).setPosition(b.cx, 0, b.cz);
    b.bars.forEach(([x0, x1, z0, z1, kind], bi) => {
      const w = x1 - x0, d = z1 - z0, bx = (x0 + x1) / 2, bz = (z0 + z1) / 2;
      const flat = kind === 'flat';
      const h = flat ? H + 0.4 : H;
      const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), stucco);
      body.applyMatrix4(piece(BF, bx, h / 2, bz, 1, 1, 1));
      body.castShadow = body.receiveShadow = true;
      add(body);
      if (flat) {
        const top = new THREE.Mesh(new THREE.BoxGeometry(w - 0.6, 0.1, d - 0.6), flatRoof);
        top.applyMatrix4(piece(BF, bx, h - 0.3, bz, 1, 1, 1));
        add(top);
        for (let k = 0; k < 2; k++) I.trim.add(piece(BF, bx + (r() - 0.5) * (w - 3), h - 0.3 + 0.5, bz + (r() - 0.5) * (d - 3), 1.6, 1.0, 1.2), '#c9c7c2');
      } else {
        const roof = new THREE.Mesh(hipGeo, tiles);
        const rise = Math.min(w, d) * 0.28;
        roof.applyMatrix4(piece(BF, bx, H - 0.05, bz, w + 1.2, rise, d + 1.2));
        roof.castShadow = true;
        add(roof);
      }
      const [fb, fside] = b.front;
      for (const side of ['s', 'n', 'e', 'w']) {
        const [F, L] = sideFrame(BF, bx, bz, w, d, side);
        const rich = bi === fb && side === fside;
        wallDetail(F, L, rich, rich && b.tower !== undefined ? b.tower : null);
      }
    });
    // Main entry: plaque, planter wall, bollards and a directory board.
    const [fb, fside] = b.front;
    const [x0, x1, z0, z1] = b.bars[fb];
    const [F, L] = sideFrame(BF, (x0 + x1) / 2, (z0 + z1) / 2, x1 - x0, z1 - z0, fside);
    plaque(F.clone().multiply(new THREE.Matrix4().setPosition(L / 2 - 6, 0, 0)), b.id);
    const pw = new THREE.Mesh(new THREE.BoxGeometry(L * 0.7, 0.6, 0.45), brick);
    pw.applyMatrix4(piece(F, 0, 0.3, 3.2, 1, 1, 1));
    pw.castShadow = true;
    add(pw);
    for (const lx of [-L * 0.35, -L * 0.12, L * 0.12, L * 0.35]) {
      const v = new THREE.Vector3(lx, 0, 3.6).applyMatrix4(F);
      bollard(v.x, v.z);
    }
    directory(F.clone().multiply(new THREE.Matrix4().setPosition(L * 0.35 + 2.2, 0, 3.4)), b.id, TENANTS[b.id]);
    centres[b.id] = new THREE.Vector3(0, 0, 4).applyMatrix4(F);
    if (b.tower !== undefined) tower(F, b.tower);
  }

  // Building D: three-storey loggia tower with a balcony (photo 2).
  function tower(F, lx) {
    const P = (x, y, z, sx, sy, sz, c) => I.trim.add(piece(F, lx + x, y, z, sx, sy, sz), c);
    const tb = new THREE.Mesh(new THREE.BoxGeometry(5.2, 11, 5.2), stucco);
    tb.applyMatrix4(piece(F, lx, 5.5, -1.6, 1, 1, 1));
    tb.castShadow = tb.receiveShadow = true;
    add(tb);
    P(0, 1.5, 1.01, 2.4, 3.0, 0.05, '#3a312b');
    P(0, 8.3, 1.01, 2.6, 2.6, 0.05, '#3a312b');
    P(0, 5.1, 1.01, 2.0, 2.2, 0.05, '#3a312b');
    for (const y of [3.0, 9.6]) {
      const a = new THREE.Mesh(new THREE.CircleGeometry(1.25, 16, 0, Math.PI), archMat);
      a.applyMatrix4(piece(F, lx, y, 1.02, 1, 1, 1));
      add(a);
    }
    P(0, 7.0, 1.4, 3.0, 0.15, 0.8, '#ece4d4');
    for (let b = -1.4; b <= 1.41; b += 0.14) I.steel.add(piece(F, lx + b, 7.45, 1.78, 0.025, 0.8, 0.025));
    I.steel.add(piece(F, lx, 7.85, 1.78, 2.9, 0.05, 0.05));
    P(0, 4.2, 1.4, 2.6, 0.15, 0.8, '#ece4d4');
    for (let b = -1.2; b <= 1.21; b += 0.14) I.steel.add(piece(F, lx + b, 4.6, 1.78, 0.025, 0.7, 0.025));
    const tr = new THREE.Mesh(hipGeo, tiles);
    tr.applyMatrix4(piece(F, lx, 11, -1.6, 6.4, 1.6, 6.4));
    tr.castShadow = true;
    add(tr);
    P(0, 9.2, 0.6, 0.35, 0.45, 0.35, '#ffd9a0');
    // Lamp post and green "D" sign in front (photo).
    I.steel.add(piece(F, lx - 4, 1.6, 4.2, 0.1, 3.2, 0.1));
    P(-4, 3.3, 4.2, 0.4, 0.5, 0.4, '#f3ead2');
  }

  // Lawns in front of the buildings, sycamores and olives.
  const lawnMat = new THREE.MeshStandardMaterial({ color: '#5f913f', roughness: 1 });
  const lawn = (x0, x1, z0, z1) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), lawnMat);
    m.rotation.x = -Math.PI / 2;
    m.position.set((x0 + x1) / 2, 0.06, (z0 + z1) / 2);
    m.receiveShadow = true;
    add(m);
  };
  lawn(-73, -37, 3, 5.6);
  lawn(-28, 4, -17, -14);
  lawn(-60, -51, -16, -9); // D courtyard
  lawn(-17, -7, -36, -28); // E courtyard
  lawn(19, 28, -34, -27); // F courtyard
  const trunkMat = new THREE.MeshStandardMaterial({ color: '#c9c0b3', roughness: 1 });
  const leafA = new THREE.MeshStandardMaterial({ color: '#a8823c', roughness: 1 }); // autumn sycamore
  const leafB = new THREE.MeshStandardMaterial({ color: '#7d8a63', roughness: 1 }); // olive
  const leafC = new THREE.MeshStandardMaterial({ color: '#56703a', roughness: 1 }); // evergreen
  const crownGeo = new THREE.IcosahedronGeometry(1, 1);
  const tree = (x, z, s, leaf) => {
    const t = box(trunkMat, 0.45 * s, 7 * s, 0.45 * s, x, 3.5 * s, z);
    t.rotation.z = (r() - 0.5) * 0.2;
    for (let k = 0; k < 4; k++) {
      const c = new THREE.Mesh(crownGeo, leaf);
      c.scale.setScalar((2 + r()) * s);
      c.position.set(x + (r() - 0.5) * 4 * s, (7 + r() * 2.5) * s, z + (r() - 0.5) * 4 * s);
      c.castShadow = true;
      add(c);
    }
  };
  // Traced from the satellite canopy.
  for (const [x, z, s, l] of [
    [-76, 9, 1.1, leafA], [-40, 9, 1.0, leafA], [-30, -4, 1.2, leafA], [-22, 8, 1.1, leafA], [-14, 20, 1.2, leafA],
    [-26, 30, 1.0, leafA], [-30, 46, 1.0, leafC], [-18, 64, 0.9, leafB], [-34, 64, 0.9, leafB], [-8, 30, 1.1, leafA],
    [10, -12, 1.0, leafA], [26, -12, 0.9, leafA], [-36, -52, 1.0, leafC], [-26, -14, 0.9, leafA], [32, 24, 1.1, leafC],
    [50, -50, 1.3, leafC], [58, -20, 1.2, leafC], [60, 10, 1.1, leafC], [22, 60, 1.2, leafC], [44, 60, 1.1, leafC],
    [-80, -30, 1.0, leafC], [-46, -30, 1.0, leafC], [56, 36, 1.0, leafC], [-82, 40, 0.9, leafC],
  ]) tree(x, z, s, l);

  // Entrance on El Dorado Place: drive x -32..-22, brick pillars with ball
  // finials, iron fence, sign in a flower bed east of the drive (photo 1).
  {
    const ex = -20;
    const ez = 68.5;
    for (const [px, pz] of [[-33.5, ez], [ex, ez], [-2, ez]]) {
      box(brick, 1.6, 3.6, 1.6, px, 1.8, pz);
      box(stone, 1.9, 0.35, 1.9, px, 3.75, pz);
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.55, 16, 12), stone);
      ball.position.set(px, 4.4, pz);
      add(ball);
    }
    // Brick low wall + iron fence along the street, east of the gate pillar.
    box(brick, 17.4, 1.0, 0.5, (ex - 2) / 2, 0.5, ez);
    for (let x = ex + 0.9; x < -2.8; x += 0.2) I.steel.add(piece(new THREE.Matrix4(), x, 1.8, ez, 0.03, 1.6, 0.03));
    I.steel.add(piece(new THREE.Matrix4(), (ex - 2) / 2, 2.6, ez, 17, 0.05, 0.05));
    box(brick, 6, 1.0, 0.5, -37.5, 0.5, ez);
    for (let x = -40.4; x < -34.4; x += 0.2) I.steel.add(piece(new THREE.Matrix4(), x, 1.8, ez, 0.03, 1.6, 0.03));
    I.steel.add(piece(new THREE.Matrix4(), -37.5, 2.6, ez, 6, 0.05, 0.05));
    const paverTex = textTexture({
      width: 256, height: 256, bg: '#8f5a48',
      draw(ctx, w, h) { for (let y = 0; y < h; y += 16) for (let x = 0; x < w; x += 32) { const v = 0.85 + r() * 0.25; ctx.fillStyle = `rgb(${150 * v | 0},${92 * v | 0},${74 * v | 0})`; ctx.fillRect(x + ((y / 16) % 2 ? 0 : 16), y, 30, 14); } ctx.fillStyle = '#cfc6b8'; ctx.fillRect(0, 0, w, 6); },
    });
    paverTex.wrapS = paverTex.wrapT = THREE.RepeatWrapping;
    paverTex.repeat.set(3, 10);
    const drive = new THREE.Mesh(new THREE.PlaneGeometry(10, 36), new THREE.MeshStandardMaterial({ map: paverTex, roughness: 0.95 }));
    drive.rotation.x = -Math.PI / 2;
    drive.position.set(-27, 0.07, 56);
    drive.receiveShadow = true;
    add(drive);
    // Sign on a flower bed, facing the street and the drive.
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
    const sx = -15.5, sz = 70.4;
    const sry = -0.35;
    box(new THREE.MeshStandardMaterial({ color: '#2f5a3a' }), 5, 1.6, 0.3, sx, 1.6, sz, sry);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(4.9, 1.5), signMat(signTex));
    face.position.set(sx + Math.sin(sry) * 0.16, 1.6, sz + Math.cos(sry) * 0.16);
    face.rotation.y = sry;
    add(face);
    box(brick, 7, 0.6, 2.2, sx + 0.6, 0.3, sz + 0.6, sry);
    const cols = ['#e2366b', '#f4f0f2', '#7a3fa0', '#d61f3c', '#f7a8c4'];
    const fl = cols.map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 }));
    const flGeo = new THREE.IcosahedronGeometry(0.22, 0);
    for (let k = 0; k < 90; k++) {
      const f = new THREE.Mesh(flGeo, fl[k % fl.length]);
      const u = (r() - 0.5) * 8, v = r() * 2.6;
      f.position.set(sx + Math.cos(sry) * u + Math.sin(sry) * v, 0.25 + r() * 0.35, sz - Math.sin(sry) * u + Math.cos(sry) * v);
      add(f);
    }
    // Campus directory at the gate, listing every known tenant.
    const dirTex = textTexture({
      width: 512, height: 768, bg: '#2f5a3a',
      draw(ctx, w, h) {
        ctx.strokeStyle = '#e8e2cf'; ctx.lineWidth = 8; ctx.strokeRect(10, 10, w - 20, h - 20);
        ctx.fillStyle = '#e8e2cf'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.font = '600 40px Georgia, serif'; ctx.fillText('DIRECTORY', w / 2, 52);
        const rows = [...Object.entries(TENANTS).flatMap(([b, ts]) => ts.map((t) => t.split(' · ')[0] + ` · ${b}`)),
          'Sandra L. Reed, CPA', 'El Dorado Psychotherapy Offices', 'Desert Psychotherapy & Consultation'];
        ctx.font = '600 25px Georgia, serif'; ctx.textAlign = 'left';
        rows.forEach((t, i) => ctx.fillText(t, 34, 110 + i * 46, w - 60));
      },
    });
    const dpost = box(new THREE.MeshStandardMaterial({ color: '#2f5a3a' }), 1.6, 2.4, 0.2, -36.5, 1.5, 69.6);
    dpost.rotation.y = 0.5;
    const df = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.25), signMat(dirTex));
    df.position.set(-36.5 + Math.sin(0.5) * 0.11, 1.5, 69.6 + Math.cos(0.5) * 0.11);
    df.rotation.y = 0.5;
    add(df);
  }

  finish();
  const floorRange = (n) => [(n - 1) * 3.6, n * 3.6];
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * 12;
    if (centres[faceName]) return centres[faceName].clone().setY(y);
    switch (faceName) {
      case 'gate': return V(-15.5, 3.6, 70.4);
      case 'front': return V((u - 0.5) * W, y, front + 1.5);
      default: return V(0, y, 0);
    }
  };
  return { group: g, width: W, depth: D, height: 14, floorRange, hotspotPosition };
}
