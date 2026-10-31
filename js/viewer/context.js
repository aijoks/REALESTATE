// Street + neighbouring buildings around 120 E 56th St (front faces +z = north).
//   east  (-x): Tower 56 — stepped podium with slanted glass setbacks, tall tower behind
//   west  (+x): silver fluted tower built tight against the west wall (front set
//               back so the banner strip shows), open paving in front of it
//   south (-z): large banded office tower behind the lot
//   north (+z): across E 56th St — white grid tower, pre-war stone building, 445 Park
//   Park Avenue (+x, ~56 m west): two roadways + planted median, 425 Park on the
//   SE corner, 445 Park on the NE corner, towers lining the avenue
// Neighbours fade out whenever they block the view of the subject building.
import * as THREE from 'three';
import { facadeTexture, rand } from './textures.js';

function boxUV(w, h, d, tileW, tileH) {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) {
    for (let k = 0; k < 4; k++) {
      const i = f * 4 + k;
      uv.setXY(i, (uv.getX(i) * dims[f][0]) / tileW, (uv.getY(i) * dims[f][1]) / tileH);
    }
  }
  return g;
}

const TILES = {
  glass: [24, 28.8],
  banded: [16, 26.8],
  fluted: [4, 20],
  louver: [6, 6],
  prewar: [14, 22],
  whitegrid: [12, 13.4],
};

export function buildContext(scene, { W, D }) {
  const fadeables = [];
  const r = rand(56);
  const front = D / 2;
  const walk = 4.5;
  const road = 10.6;
  const farWalk = front + walk + road;
  const acrossZ = farWalk + walk;
  // Park Avenue (runs along z). x grows westward.
  const PK = { eastLine: 56, eastCurb: 61, median0: 73, median1: 79, westCurb: 91, westLine: 96 };
  const streetZ = (k) => front + walk + road / 2 + k * 80; // centre of E 56th (k=0), 57th (1), 55th (-1)...

  // ---------- ground, sidewalks, street ----------
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshStandardMaterial({ color: '#7d7b78', roughness: 1 }));
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  scene.add(ground);

  const walkTex = (() => {
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#b9b5ad';
    ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2500; i++) { ctx.fillStyle = `rgba(0,0,0,${r() * 0.06})`; ctx.fillRect(r() * 256, r() * 256, 2, 2); }
    ctx.strokeStyle = 'rgba(70,70,70,0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, 256, 256);
    const t = new THREE.CanvasTexture(c);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  })();
  const curbMat = new THREE.MeshStandardMaterial({ color: '#8f8c86', roughness: 0.9 });
  const slab = (x0, x1, z0, z1, h = 0.16) => {
    const w = x1 - x0;
    const d = z1 - z0;
    const tex = walkTex.clone();
    tex.repeat.set(w / 1.6, d / 1.6);
    tex.needsUpdate = true;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
    m.position.set((x0 + x1) / 2, h / 2, (z0 + z1) / 2);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  };
  const SEGS = [[-260, PK.eastCurb], [PK.westCurb, 320]]; // E 56th, broken by Park Ave
  const sidewalk = (z0, z1) => {
    for (const [x0, x1] of SEGS) {
      slab(x0, x1, z0, z1);
      const curb = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.17, 0.25), curbMat);
      curb.position.set((x0 + x1) / 2, 0.085, z0 > front ? z0 + 0.12 : z1 - 0.12);
      scene.add(curb);
    }
  };
  sidewalk(front, front + walk);
  sidewalk(farWalk, acrossZ + 0.5);
  const asphaltMat = new THREE.MeshStandardMaterial({ color: '#36373a', roughness: 0.95 });
  const flat = (mat, x0, x1, z0, z1, y = 0.01) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
    m.receiveShadow = true;
    scene.add(m);
    return m;
  };
  flat(asphaltMat, -260, 320, front + walk, front + walk + road);
  const lineMat = new THREE.MeshBasicMaterial({ color: '#d9d6cc' });
  for (const dz of [2.4, road - 2.4]) {
    for (const [x0, x1] of [[-260, PK.eastLine - 1], [PK.westLine + 1, 320]]) flat(lineMat, x0, x1, front + walk + dz - 0.06, front + walk + dz + 0.06, 0.02);
  }

  // ---------- Park Avenue ----------
  {
    const half = road / 2;
    const zMin = -420;
    const zMax = 420;
    flat(asphaltMat, PK.eastCurb, PK.westCurb, zMin, zMax, 0.012);
    // Other cross streets (55th, 57th, ...) east and west of the avenue.
    for (let k = -5; k <= 5; k++) if (k !== 0) flat(asphaltMat, -120, 220, streetZ(k) - half, streetZ(k) + half, 0.011);
    const yellowMat = new THREE.MeshStandardMaterial({ color: '#e0b324', roughness: 0.7 });
    const greenMat = new THREE.MeshStandardMaterial({ color: '#3f6a2c', roughness: 1 });
    const shrubs = [];
    for (let k = -5; k < 5; k++) {
      const z0 = streetZ(k) + half;
      const z1 = streetZ(k + 1) - half;
      // Avenue sidewalks (slightly higher so they sit cleanly over 56th's).
      slab(PK.eastLine, PK.eastCurb, z0, z1, 0.165);
      slab(PK.westCurb, PK.westLine, z0, z1, 0.165);
      for (const x of [PK.eastCurb - 0.12, PK.westCurb + 0.12]) {
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.17, z1 - z0), curbMat);
        c.position.set(x, 0.085, (z0 + z1) / 2);
        scene.add(c);
      }
      // Planted median, stopping short of the crosswalks, with yellow noses.
      const m0 = z0 + 3.6;
      const m1 = z1 - 3.6;
      const mw = PK.median1 - PK.median0;
      const curb = new THREE.Mesh(new THREE.BoxGeometry(mw, 0.2, m1 - m0), curbMat);
      curb.position.set((PK.median0 + PK.median1) / 2, 0.1, (m0 + m1) / 2);
      curb.receiveShadow = true;
      scene.add(curb);
      const bed = new THREE.Mesh(new THREE.BoxGeometry(mw - 0.8, 0.45, m1 - m0 - 1.6), greenMat);
      bed.position.set((PK.median0 + PK.median1) / 2, 0.22, (m0 + m1) / 2);
      bed.receiveShadow = true;
      scene.add(bed);
      for (const z of [m0 + 0.1, m1 - 0.1]) {
        const nose = new THREE.Mesh(new THREE.BoxGeometry(mw, 0.22, 0.2), yellowMat);
        nose.position.set((PK.median0 + PK.median1) / 2, 0.11, z);
        scene.add(nose);
      }
      for (let z = m0 + 1.4; z < m1 - 1.2; z += 1.1) {
        for (const dx of [-1.6, 0, 1.6]) shrubs.push([(PK.median0 + PK.median1) / 2 + dx + (r() - 0.5) * 0.5, z + (r() - 0.5) * 0.4, 0.45 + r() * 0.35]);
      }
      // Lane dashes: three lanes each way.
      for (const x of [PK.eastCurb + 4, PK.eastCurb + 8, PK.median1 + 4, PK.median1 + 8]) {
        for (let z = z0 + 6; z < z1 - 6; z += 9) flat(lineMat, x - 0.06, x + 0.06, z, z + 3, 0.02);
      }
    }
    // Shrubs on the median (instanced).
    const shrubMesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 1 }), shrubs.length);
    const mm = new THREE.Matrix4();
    const cc = new THREE.Color();
    shrubs.forEach(([x, z, s], i) => {
      mm.compose(new THREE.Vector3(x, 0.4 + s * 0.4, z), new THREE.Quaternion(), new THREE.Vector3(s * 0.75, s * 0.55, s * 0.75));
      shrubMesh.setMatrixAt(i, mm);
      shrubMesh.setColorAt(i, cc.set(['#3d6b2b', '#4a7a33', '#335c24', '#5b8a3c'][i % 4]));
    });
    shrubMesh.castShadow = true;
    scene.add(shrubMesh);

    // Crosswalks at E 56th: across the avenue (both sides) and across 56th.
    const zebra = new THREE.MeshBasicMaterial({ color: '#e9e7e0' });
    for (const [za, zb] of [[front + 0.6, front + walk - 0.6], [farWalk + 0.6, acrossZ - 0.6]]) {
      for (let x = PK.eastCurb + 0.6; x < PK.westCurb - 0.4; x += 1.2) {
        if (x > PK.median0 - 0.3 && x < PK.median1 + 0.3) continue;
        flat(zebra, x - 0.3, x + 0.3, za, zb, 0.021);
      }
    }
    for (const [xa, xb] of [[PK.eastLine + 0.6, PK.eastCurb - 0.4], [PK.westCurb + 0.4, PK.westLine - 0.6]]) {
      for (let z = front + walk + 0.5; z < farWalk - 0.3; z += 1.2) flat(zebra, xa - 3, xb, z - 0.3, z + 0.3, 0.021);
    }
    // Stop bars.
    flat(zebra, PK.eastLine - 4.4, PK.eastLine - 3.9, front + walk, farWalk, 0.021);
    flat(zebra, PK.eastCurb, PK.median0, front - 0.6, front - 0.1, 0.021);
    flat(zebra, PK.median1, PK.westCurb, acrossZ + 0.1, acrossZ + 0.6, 0.021);

    // Traffic signals, one-way and street-name signs.
    const poleMat = new THREE.MeshStandardMaterial({ color: '#3a3f3b', roughness: 0.55, metalness: 0.5 });
    const housing = new THREE.MeshStandardMaterial({ color: '#d9a816', roughness: 0.5, metalness: 0.2 });
    const lamp = { red: new THREE.MeshBasicMaterial({ color: '#ff3b2f' }), green: new THREE.MeshBasicMaterial({ color: '#35e07a' }), off: new THREE.MeshStandardMaterial({ color: '#2a2a2a' }) };
    // A corner pole with two signal heads at right angles; `faceAngle` is the
    // y-rotation of the first head (0 faces +z).
    const signal = (x, z, faceAngle, on = 'green') => {
      const g = new THREE.Group();
      const p = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 5.2, 10), poleMat);
      p.position.y = 2.6;
      g.add(p);
      for (const a of [faceAngle, faceAngle + Math.PI / 2]) {
        const head = new THREE.Group();
        head.add(new THREE.Mesh(new THREE.BoxGeometry(0.36, 1.05, 0.3), housing));
        ['red', 'yellow', 'green'].forEach((c, i) => {
          const l = new THREE.Mesh(new THREE.CircleGeometry(0.1, 16), c === on ? lamp[c] : lamp.off);
          l.position.set(0, 0.32 - i * 0.32, 0.16);
          head.add(l);
        });
        head.rotation.y = a;
        head.position.set(Math.sin(a) * 0.25, 4.6, Math.cos(a) * 0.25);
        g.add(head);
      }
      g.position.set(x, 0, z);
      g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
      scene.add(g);
    };
    // Faces: +x toward the west, -x toward the east, +z north, -z south.
    signal(PK.eastCurb - 0.5, front + 0.8, Math.PI / 2, 'green');
    signal(PK.eastCurb - 0.5, acrossZ - 0.8, Math.PI, 'green');
    signal(PK.westCurb + 0.5, front + 0.8, 0, 'red');
    signal(PK.westCurb + 0.5, acrossZ - 0.8, -Math.PI / 2, 'red');
    signal((PK.median0 + PK.median1) / 2, front - 3.2, Math.PI, 'green');
    signal((PK.median0 + PK.median1) / 2, acrossZ + 3.2, 0, 'green');

    const signTex = (draw, w = 256, h = 96) => {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      draw(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    const oneWay = signTex((ctx, w, h) => {
      ctx.fillStyle = '#111'; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(18, h / 2 - 22); ctx.lineTo(w - 70, h / 2 - 22); ctx.lineTo(w - 70, h / 2 - 38); ctx.lineTo(w - 14, h / 2);
      ctx.lineTo(w - 70, h / 2 + 38); ctx.lineTo(w - 70, h / 2 + 22); ctx.lineTo(18, h / 2 + 22); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#111'; ctx.font = 'bold 34px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('ONE WAY', w / 2 - 20, h / 2 + 2);
    });
    const blade = (txt) => signTex((ctx, w, h) => {
      ctx.fillStyle = '#0f6b3a'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(5, 5, w - 10, h - 10);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 46px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(txt, w / 2, h / 2 + 2);
    });
    const plate = (tex, w, h, x, y, z, ry) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.6 }));
      m.position.set(x, y, z);
      m.rotation.y = ry;
      scene.add(m);
    };
    // One-way (westbound) signs on E 56th at the avenue, plus street-name blades.
    plate(oneWay, 1.2, 0.45, PK.eastCurb - 0.5, 3.4, acrossZ - 0.62, 0);
    plate(oneWay, 1.2, 0.45, PK.eastCurb - 0.5, 3.4, front + 0.98, Math.PI);
    plate(blade('E 56 St'), 1.3, 0.3, PK.eastCurb - 0.5, 5.45, front + 0.8, 0);
    plate(blade('Park Av'), 1.3, 0.3, PK.eastCurb - 0.5, 5.8, front + 0.8, Math.PI / 2);
    plate(blade('E 56 St'), 1.3, 0.3, PK.westCurb + 0.5, 5.45, acrossZ - 0.8, 0);
    plate(blade('Park Av'), 1.3, 0.3, PK.westCurb + 0.5, 5.8, acrossZ - 0.8, Math.PI / 2);

    // Con Ed steam stack in E 56th, as in the photo from Park Ave.
    const stackTex = signTex((ctx, w, h) => {
      for (let y = 0; y < h; y += 16) { ctx.fillStyle = (y / 16) % 2 ? '#f1f1ef' : '#ee5a1c'; ctx.fillRect(0, y, w, 16); }
    }, 64, 128);
    const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 2.6, 18), new THREE.MeshStandardMaterial({ map: stackTex, roughness: 0.6 }));
    stack.position.set(44, 1.3, front + walk + 3.2);
    stack.castShadow = true;
    scene.add(stack);
    const steamMat = new THREE.MeshStandardMaterial({ color: '#f4f4f2', transparent: true, opacity: 0.32, depthWrite: false, roughness: 1 });
    for (let i = 0; i < 9; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.45 + i * 0.12, 14, 10), steamMat);
      puff.position.set(44 + (r() - 0.5) * 0.6 - i * 0.12, 2.9 + i * 0.55, front + walk + 3.2 + (r() - 0.5) * 0.5);
      scene.add(puff);
    }
  }

  // ---------- neighbours ----------
  const mats = {};
  const matFor = (kind) => {
    const tex = facadeTexture(kind, kind.length);
    return new THREE.MeshStandardMaterial({
      map: tex,
      roughness: kind === 'glass' || kind === 'fluted' ? 0.18 : 0.8,
      metalness: kind === 'glass' ? 0.55 : kind === 'fluted' ? 0.7 : 0.05,
      envMapIntensity: kind === 'glass' ? 1.4 : 1,
      transparent: true,
      opacity: 1,
    });
  };
  const block = (kind, x0, x1, z0, z1, h, y0 = 0, { fade = true } = {}) => {
    const w = x1 - x0;
    const d = z1 - z0;
    const [tw, th] = TILES[kind];
    const mat = matFor(kind);
    const mesh = new THREE.Mesh(boxUV(w, h, d, tw, th), mat);
    mesh.position.set((x0 + x1) / 2, y0 + h / 2, (z0 + z1) / 2);
    mesh.castShadow = mesh.receiveShadow = true;
    scene.add(mesh);
    if (fade) { const box = new THREE.Box3().setFromObject(mesh); fadeables.push({ mesh, mats: [mat], box, boxes: [box], opacity: 1 }); }
    mats[kind] = mat;
    return mesh;
  };
  const group = (meshes) => {
    // Fade a multi-part neighbour as one unit.
    const box = new THREE.Box3();
    const ms = [];
    meshes.forEach((m) => { box.expandByObject(m); ms.push(m.material); });
    meshes.forEach((m) => {
      const i = fadeables.findIndex((f) => f.mesh === m);
      if (i >= 0) fadeables.splice(i, 1);
    });
    // Sight-lines are tested against each part, so a tall tower's empty
    // bounding volume doesn't hide it unnecessarily.
    fadeables.push({ mesh: meshes[0], mats: ms, box, boxes: meshes.map((m) => new THREE.Box3().setFromObject(m)), opacity: 1 });
  };

  const eastX = -W / 2 - 0.05;
  // Tower 56 — granite/glass podium, stepped louvred setbacks, tower behind.
  {
    const parts = [];
    parts.push(block('glass', -36, eastX, -D / 2, front, 10));
    const steps = [[10, 15, 2.5], [15, 20, 5], [20, 25, 7.5], [25, 30, 10]];
    const slopeMat = new THREE.MeshStandardMaterial({ color: '#9fb7c8', metalness: 0.6, roughness: 0.1, transparent: true, opacity: 1, envMapIntensity: 1.6 });
    for (const [y0, y1, set] of steps) {
      parts.push(block('louver', -36, eastX, -D / 2, front - set, y1 - y0, y0));
      const slope = new THREE.Mesh(new THREE.PlaneGeometry(36 + eastX, Math.hypot(2.5, 1.6)), slopeMat);
      slope.rotation.x = -Math.atan2(2.5, 1.6);
      slope.position.set((-36 + eastX) / 2, y0 + 0.8, front - set + 1.25);
      scene.add(slope);
      parts.push(slope);
    }
    parts.push(block('banded', -36, eastX - 2, -D / 2, front - 14, 110, 30));
    group(parts);
  }

  // West: the fluted tower abuts the building's west wall. Its street face is
  // set back ~6 m, leaving the front strip of the wall (with the lease banner)
  // exposed.
  {
    const setback = 6.2;
    // The setback in front of it is open paving.
    slab(W / 2, W / 2 + 13.5, front - setback, front);
    block('fluted', W / 2 + 0.02, W / 2 + 13.5, -D / 2 - 6, front - setback, 165);
  }

  // 425 Park Avenue — SE corner of Park & 56th: glass lobby under an
  // L-shaped canopy, tower rising in three setback tiers.
  {
    const x0 = W / 2 + 13.6;
    const x1 = PK.eastLine;
    const zS = streetZ(-1) + road / 2 + walk;
    const parts = [
      block('glass', x0, x1 - 3, zS, front - 3, 14),
      block('glass', x0 + 1, x1 - 1, zS + 2, front - 2, 106, 14),
      block('glass', x0 + 3, x1 - 3, zS + 4, front - 4, 80, 120),
      block('glass', x0 + 5, x1 - 5, zS + 6, front - 6, 70, 200),
    ];
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#e7e6e2', roughness: 0.6, transparent: true, opacity: 1 });
    for (const [cx0, cx1, cz0, cz1] of [[x0, x1 + 0.5, front - 3.5, front + 1.2], [x1 - 4, x1 + 0.5, zS, front + 1.2]]) {
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(cx1 - cx0, 1.0, cz1 - cz0), canopyMat);
      canopy.position.set((cx0 + cx1) / 2, 14.3, (cz0 + cz1) / 2);
      canopy.castShadow = true;
      scene.add(canopy);
      parts.push(canopy);
    }
    group(parts);
  }

  // Behind (south).
  block('banded', -30, 18, streetZ(-1) + road / 2 + walk, -D / 2 - 3, 175);

  // Across the street (north).
  block('whitegrid', -52, -14, acrossZ, acrossZ + 30, 96);
  block('prewar', -13, 12, acrossZ, acrossZ + 25, 52);
  {
    // 445 Park Avenue — NE corner: banded 1940s/50s office slab over shops.
    const zN = streetZ(1) - road / 2 - walk;
    const shopMat = new THREE.MeshStandardMaterial({ color: '#23272b', roughness: 0.4, metalness: 0.3, transparent: true, opacity: 1 });
    const shops = new THREE.Mesh(new THREE.BoxGeometry(PK.eastLine - 13 + 0.2, 5, zN - acrossZ + 0.2), shopMat);
    shops.position.set((13 + PK.eastLine) / 2, 2.5, (acrossZ + zN) / 2);
    scene.add(shops);
    group([block('banded', 13, PK.eastLine, acrossZ, zN, 72, 5), shops]);
    // Corners west of the avenue.
    block('glass', PK.westLine, PK.westLine + 52, acrossZ, zN, 150);
    block('banded', PK.westLine, PK.westLine + 52, streetZ(-1) + road / 2 + walk, front, 118);
  }

  // Further along the street, to make the canyon.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const x0 = side > 0 ? PK.westLine + 56 + i * 34 : -70 - (i + 1) * 34;
      const kinds = ['glass', 'prewar', 'banded', 'whitegrid'];
      block(kinds[(i + (side > 0 ? 1 : 0)) % 4], x0, x0 + 32, streetZ(-1) + road / 2 + walk, front - 1, 40 + r() * 110, 0, { fade: false });
      block(kinds[(i + 2) % 4], x0, x0 + 32, acrossZ, streetZ(1) - road / 2 - walk, 40 + r() * 120, 0, { fade: false });
    }
  }

  // Towers lining Park Avenue up and down the avenue.
  {
    const kinds = ['glass', 'banded', 'prewar', 'glass', 'whitegrid', 'banded'];
    let n = 0;
    for (let k = -5; k < 5; k++) {
      if (k === -1 || k === 0) continue;
      const z0 = streetZ(k) + road / 2 + walk;
      const z1 = streetZ(k + 1) - road / 2 - walk;
      block(kinds[n++ % kinds.length], 18, PK.eastLine, z0, z1, 55 + r() * 170, 0, { fade: false });
      block(kinds[n++ % kinds.length], PK.westLine, PK.westLine + 50, z0, z1, 55 + r() * 190, 0, { fade: false });
    }
  }

  // Distant skyline (instanced, unshaded by fog-friendly colours).
  {
    const n = 220;
    const sky = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6, metalness: 0.2 }), n);
    const m = new THREE.Matrix4();
    const col = new THREE.Color();
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2;
      const dist = 230 + r() * 420;
      const w = 20 + r() * 35;
      const h = 30 + r() ** 2 * 220;
      if (Math.abs(Math.cos(a) * dist - 76) < 45) { m.makeScale(0, 0, 0); sky.setMatrixAt(i, m); continue; }
      m.compose(new THREE.Vector3(Math.cos(a) * dist, h / 2, Math.sin(a) * dist), new THREE.Quaternion(), new THREE.Vector3(w, h, 20 + r() * 35));
      sky.setMatrixAt(i, m);
      sky.setColorAt(i, col.set(['#9aa6b1', '#b8b2a6', '#7f8d9a', '#c9cdd1'][i % 4]));
    }
    scene.add(sky);
  }

  // ---------- street furniture & parked vans (as in the photos) ----------
  const white = new THREE.MeshStandardMaterial({ color: '#f1f1ef', roughness: 0.35, metalness: 0.1 });
  const dark = new THREE.MeshStandardMaterial({ color: '#1b1d20', roughness: 0.4, metalness: 0.4 });
  const tyre = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.9 });
  const yellow = new THREE.MeshStandardMaterial({ color: '#f2c318', roughness: 0.35, metalness: 0.1 });
  const vehicle = (x, z, { len = 5.9, ht = 2.5, body = white, cabin = 0.32, heading = Math.PI } = {}) => {
    const v = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(len, ht - 0.5, 2.0), body);
    b.position.y = 0.35 + (ht - 0.5) / 2;
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.05, (ht - 0.5) * cabin, 1.8), dark);
    glass.position.set(len / 2 + 0.01, 0.35 + (ht - 0.5) * (1 - cabin / 2) - 0.1, 0);
    v.add(b, glass);
    for (const dx of [-len / 2 + 0.9, len / 2 - 0.9]) {
      for (const dz of [-0.95, 0.95]) {
        const w = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.25, 18), tyre);
        w.rotation.x = Math.PI / 2;
        w.position.set(dx, 0.36, dz);
        v.add(w);
      }
    }
    v.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    v.position.set(x, 0, z);
    v.rotation.y = heading; // default: westbound on E 56th
    scene.add(v);
  };
  const lane = front + walk + 1.2;
  vehicle(-14, lane);
  vehicle(-4, lane, { len: 5.4, ht: 2.3 });
  vehicle(7, lane);
  vehicle(16, lane, { len: 4.6, ht: 1.5, body: new THREE.MeshStandardMaterial({ color: '#d7d9db', roughness: 0.3, metalness: 0.5 }), cabin: 0.5 });
  vehicle(2, front + walk + 5.2, { len: 4.8, ht: 1.6, body: yellow, cabin: 0.5 });
  vehicle(-30, farWalk - 1.2, { len: 4.7, ht: 1.5, body: new THREE.MeshStandardMaterial({ color: '#2b3a4f', roughness: 0.3, metalness: 0.5 }), cabin: 0.5 });

  // Park Avenue traffic: northbound on the east roadway, southbound on the west.
  const cab = { len: 4.8, ht: 1.7, body: yellow, cabin: 0.5 };
  const black = new THREE.MeshStandardMaterial({ color: '#15171b', roughness: 0.25, metalness: 0.6 });
  vehicle(PK.eastCurb + 2, front - 8, { ...cab, heading: -Math.PI / 2 });
  vehicle(PK.eastCurb + 6, front - 22, { len: 4.9, ht: 1.7, body: black, cabin: 0.5, heading: -Math.PI / 2 });
  vehicle(PK.median1 + 6, acrossZ + 9, { ...cab, heading: Math.PI / 2 });
  vehicle(PK.median1 + 10, acrossZ + 24, { len: 7.5, ht: 3.4, body: white, cabin: 0.3, heading: Math.PI / 2 });
  vehicle(PK.median1 + 2, front - 30, { len: 4.7, ht: 1.5, body: new THREE.MeshStandardMaterial({ color: '#6b6f75', roughness: 0.3, metalness: 0.6 }), cabin: 0.5, heading: Math.PI / 2 });
  vehicle(PK.eastLine - 9, front + walk + 6, { len: 4.9, ht: 1.7, body: black, cabin: 0.5 });

  const pole = new THREE.MeshStandardMaterial({ color: '#2e3134', roughness: 0.5, metalness: 0.6 });
  for (const x of [-22, 24]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.14, 8.5, 12), pole);
    p.position.set(x, 4.25, front + walk - 0.5);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 2.6, 8), pole);
    arm.rotation.x = Math.PI / 2;
    arm.position.set(x, 8.3, front + walk + 0.7);
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.18, 0.8), pole);
    head.position.set(x, 8.2, front + walk + 2.0);
    for (const o of [p, arm, head]) { o.castShadow = true; scene.add(o); }
  }

  return { fadeables };
}

// Fade neighbours that block the view of the subject building, or that sit
// in the foreground of the shot (in view and nearer than the subject).
const ray = new THREE.Ray();
const hit = new THREE.Vector3();
const frustum = new THREE.Frustum();
const pv = new THREE.Matrix4();
const targets = [new THREE.Vector3(0, 6, 0), new THREE.Vector3(0, 26, 0), new THREE.Vector3(0, 48, 0)];
export function updateFades(fadeables, camera, dt, subject, { foreground = true, targets: tg = targets } = {}) {
  camera.updateMatrixWorld();
  pv.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(pv);
  const subjectDist = subject ? subject.distanceToPoint(camera.position) : Infinity;
  for (const f of fadeables) {
    let blocks = f.boxes.some((bx) => bx.containsPoint(camera.position));
    if (!blocks && foreground && subject && frustum.intersectsBox(f.box) && f.box.distanceToPoint(camera.position) < subjectDist - 3) blocks = true;
    for (const t of tg) {
      if (blocks) break;
      ray.origin.copy(camera.position);
      ray.direction.subVectors(t, camera.position);
      const dist = ray.direction.length();
      ray.direction.normalize();
      for (const bx of f.boxes) if (ray.intersectBox(bx, hit) && hit.distanceTo(camera.position) < dist) { blocks = true; break; }
    }
    const goal = blocks ? 0.07 : 1;
    f.opacity += (goal - f.opacity) * Math.min(1, dt * 5);
    for (const m of f.mats) {
      m.opacity = f.opacity;
      m.depthWrite = f.opacity > 0.98;
    }
    f.mesh.castShadow = true;
  }
}
