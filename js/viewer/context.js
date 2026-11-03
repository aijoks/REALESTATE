// Street, avenue and neighbouring buildings for each site (front faces +z = north,
// +x = west). Shared streetscape + per-site neighbours, chosen by `site.id`.
//
// e56-park — 120 E 56th St:
//   east  (-x): Tower 56 — stepped podium with slanted glass setbacks, tall tower behind
//   west  (+x): silver fluted tower built tight against the west wall (front set
//               back so the banner strip shows), open paving in front of it
//   south (-z): large banded office tower behind the lot
//   north (+z): across E 56th St — white grid tower, pre-war stone building, 445 Park
//   Park Avenue (+x, ~56 m west): two roadways + planted median, 425 Park on the
//   SE corner, 445 Park on the NE corner, towers lining the avenue
//
// e38-fifth — 10 E 38th St:
//   east  (-x): building wrapped in black construction netting + pipe scaffold
//   west  (+x): ornate limestone corner building with a deep dark cornice
//   south (-z): plain brick party walls a few storeys above the roof terrace
//   Fifth Avenue (+x, ~30 m west): one-way southbound, Empire State Building 4
//   blocks south; green sidewalk shed along the frontage
// Neighbours fade out whenever they block the view of the subject building.
import * as THREE from 'three';
import { facadeTexture, textTexture, rand } from './textures.js';

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
  netting: [12, 24],
  beaux: [10, 16.4],
  brickwall: [8, 12],
  esb: [10, 14],
  redtower: [12, 14],
  tenement: [8, 8],
  redtenement: [8, 8],
  stucco: [8, 10],
  darkgrid: [8, 9.2],
};

export function buildContext(scene, { W, D, site = {} }) {
  if (site.suburban) return buildSuburban(scene, { W, D, site });
  const siteId = site.id ?? 'e56-park';
  const av = site.avenue ?? { kind: 'park', name: 'Park Av', eastLine: 56 };
  const streetName = site.street ?? 'E 56 St';
  const fadeables = [];
  const r = rand(56);
  const front = D / 2;
  const walk = site.walk ?? 4.5;
  const road = site.road ?? 10.6;
  // Mirrored sites (front facing south): the root group is flipped in x, so
  // sign textures are flipped back to read correctly.
  const unmirror = (tex) => {
    if (site.mirror) { tex.wrapS = THREE.RepeatWrapping; tex.repeat.x = -1; tex.offset.x = 1; }
    return tex;
  };
  const farWalk = front + walk + road;
  const acrossZ = farWalk + walk;
  // The avenue runs along z; x grows westward. Park Ave: two roadways and a
  // planted median. Fifth Ave: one wide one-way (southbound) roadway.
  const e = av.eastLine;
  const PK = av.kind === 'park'
    ? { eastLine: e, eastCurb: e + 5, median0: e + 17, median1: e + 23, westCurb: e + 35, westLine: e + 40, median: true,
      lanes: [e + 9, e + 13, e + 27, e + 31] }
    : av.kind === 'narrow'
      // Narrow one-way side street (e.g. 35th St in Queens).
      ? { eastLine: e, eastCurb: e + 4.5, westCurb: e + 14.5, westLine: e + 19, median: false, lanes: [e + 9.5] }
      : av.kind === 'parkSouth'
      // Park Avenue South: one two-way roadway, double yellow centre line.
      ? { eastLine: e, eastCurb: e + 5, westCurb: e + 24, westLine: e + 29, median: false, twoWay: true,
        lanes: [e + 9.75, e + 19.25], centre: e + 14.5 }
      : { eastLine: e, eastCurb: e + 6, westCurb: e + 24.5, westLine: e + 30.5, median: false,
        lanes: [e + 9.7, e + 13.4, e + 17.1, e + 20.8] };
  const avMid = (PK.eastLine + PK.westLine) / 2;
  const spacing = site.blockSpacing ?? 80;
  const streetZ = (k) => front + walk + road / 2 + k * spacing; // centre of our street (k=0), next street north (1), south (-1)...

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
  const yellowLine = new THREE.MeshBasicMaterial({ color: '#e2b52c' });
  if (site.streetTwoWay) {
    for (const dz of [-0.12, 0.12]) {
      for (const [x0, x1] of [[-260, PK.eastLine - 1], [PK.westLine + 1, 320]]) flat(yellowLine, x0, x1, front + walk + road / 2 + dz - 0.05, front + walk + road / 2 + dz + 0.05, 0.02);
    }
  }

  // ---------- the avenue ----------
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
      // Lane dashes.
      for (const x of PK.lanes) {
        for (let z = z0 + 6; z < z1 - 6; z += 9) flat(lineMat, x - 0.06, x + 0.06, z, z + 3, 0.02);
      }
      if (PK.centre) for (const dx of [-0.12, 0.12]) flat(yellowLine, PK.centre + dx - 0.05, PK.centre + dx + 0.05, z0 + 1, z1 - 1, 0.02);
      if (!PK.median) continue;
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
    }
    // Shrubs on the median (instanced).
    if (shrubs.length) {
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
    }

    // Crosswalks at our street: across the avenue (both sides) and across the street.
    const zebra = new THREE.MeshBasicMaterial({ color: '#e9e7e0' });
    for (const [za, zb] of [[front + 0.6, front + walk - 0.6], [farWalk + 0.6, acrossZ - 0.6]]) {
      for (let x = PK.eastCurb + 0.6; x < PK.westCurb - 0.4; x += 1.2) {
        if (PK.median && x > PK.median0 - 0.3 && x < PK.median1 + 0.3) continue;
        flat(zebra, x - 0.3, x + 0.3, za, zb, 0.021);
      }
    }
    for (const [xa, xb] of [[PK.eastLine + 0.6, PK.eastCurb - 0.4], [PK.westCurb + 0.4, PK.westLine - 0.6]]) {
      for (let z = front + walk + 0.5; z < farWalk - 0.3; z += 1.2) flat(zebra, xa - 3, xb, z - 0.3, z + 0.3, 0.021);
    }
    // Stop bars.
    flat(zebra, PK.eastLine - 4.4, PK.eastLine - 3.9, front + walk, farWalk, 0.021);
    if (PK.median) {
      flat(zebra, PK.eastCurb, PK.median0, front - 0.6, front - 0.1, 0.021);
      flat(zebra, PK.median1, PK.westCurb, acrossZ + 0.1, acrossZ + 0.6, 0.021);
    } else {
      flat(zebra, PK.eastCurb, PK.westCurb, acrossZ + 0.1, acrossZ + 0.6, 0.021);
      if (PK.twoWay) flat(zebra, PK.eastCurb, PK.westCurb, front - 0.6, front - 0.1, 0.021);
    }

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
    if (PK.median) {
      signal((PK.median0 + PK.median1) / 2, front - 3.2, Math.PI, 'green');
      signal((PK.median0 + PK.median1) / 2, acrossZ + 3.2, 0, 'green');
    }

    const signTex = (draw, w = 256, h = 96) => {
      const c = document.createElement('canvas');
      c.width = w; c.height = h;
      draw(c.getContext('2d'), w, h);
      const t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    };
    const oneWaySign = (pointRight) => signTex((ctx, w, h) => {
      ctx.fillStyle = '#111'; ctx.fillRect(0, 0, w, h);
      ctx.save();
      if (!pointRight) { ctx.translate(w, 0); ctx.scale(-1, 1); }
      ctx.fillStyle = '#fff';
      ctx.beginPath(); ctx.moveTo(18, h / 2 - 22); ctx.lineTo(w - 70, h / 2 - 22); ctx.lineTo(w - 70, h / 2 - 38); ctx.lineTo(w - 14, h / 2);
      ctx.lineTo(w - 70, h / 2 + 38); ctx.lineTo(w - 70, h / 2 + 22); ctx.lineTo(18, h / 2 + 22); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#111'; ctx.font = 'bold 34px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('ONE WAY', pointRight ? w / 2 - 20 : w / 2 + 20, h / 2 + 2);
    });
    // A plate facing +z shows texture-right as world +x (west); one facing -z
    // shows it as world -x (east).
    const east = (site.streetDir ?? 'east') === 'east';
    const blade = (txt) => signTex((ctx, w, h) => {
      ctx.fillStyle = '#0f6b3a'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 4; ctx.strokeRect(5, 5, w - 10, h - 10);
      ctx.fillStyle = '#fff'; ctx.font = 'bold 46px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(txt, w / 2, h / 2 + 2);
    });
    const plate = (tex, w, h, x, y, z, ry) => {
      unmirror(tex);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.6 }));
      m.position.set(x, y, z);
      m.rotation.y = ry;
      scene.add(m);
    };
    // One-way signs on our street at the avenue, plus street-name blades.
    if (!site.streetTwoWay) {
      plate(oneWaySign(!east), 1.2, 0.45, PK.eastCurb - 0.5, 3.4, acrossZ - 0.62, 0);
      plate(oneWaySign(east), 1.2, 0.45, PK.eastCurb - 0.5, 3.4, front + 0.98, Math.PI);
    }
    plate(blade(streetName), 1.3, 0.3, PK.eastCurb - 0.5, 5.45, front + 0.8, 0);
    plate(blade(av.name), 1.3, 0.3, PK.eastCurb - 0.5, 5.8, front + 0.8, Math.PI / 2);
    plate(blade(streetName), 1.3, 0.3, PK.westCurb + 0.5, 5.45, acrossZ - 0.8, 0);
    plate(blade(av.name), 1.3, 0.3, PK.westCurb + 0.5, 5.8, acrossZ - 0.8, Math.PI / 2);

    // Con Ed steam stack in E 56th, as in the photo from Park Ave.
    if (siteId === 'e56-park') {
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
  // `keep`: stay visible in the foreground; fade only when it actually blocks
  // the sight-lines to the building (e.g. an elevated train).
  const group = (meshes, { keep = false } = {}) => {
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
    fadeables.push({ mesh: meshes[0], mats: ms, box, boxes: meshes.map((m) => new THREE.Box3().setFromObject(m)), opacity: 1, keep });
  };

  const eastX = -W / 2 - 0.05;
  if (siteId === 'e56-park') {
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

  } else if (siteId === 'canal-lafayette') {
    neighbours250canal({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK, unmirror, r });
  } else if (siteId === 'qb-34-35') {
    neighboursQueensBlvd({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK, flat, asphaltMat, slab });
  } else if (siteId === 'w51-ninth') {
    neighbours370w51({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK });
  } else if (siteId === 'e44-fifth') {
    neighbours12e44({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK });
  } else if (siteId === 'w36-fifth') {
    neighbours8w36({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK });
  } else if (siteId === 'w38-sixth') {
    neighbours102w38({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK });
  } else if (siteId === 'w21-sixth') {
    neighbours21st({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK });
  } else if (siteId === 'e23-parksouth') {
    neighbours23rd({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK, unmirror, r });
  } else if (siteId === 'e38-fifth') {
    neighbours38th({ scene, block, group, matFor, W, D, front, walk, road, acrossZ, streetZ, PK, slab, r });
  }

  // Low-rise neighbourhoods (e.g. Hell's Kitchen) get walk-ups instead of
  // Midtown towers. Each call still draws exactly one random number, so the
  // other sites' layouts are unchanged.
  const lineH = (base, span) => (site.lowRise ? 15 + r() * 14 : base + r() * span);
  const lowKinds = ['tenement', 'redtenement', 'prewar', 'tenement'];

  // Further along the street, to make the canyon.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const x0 = side > 0 ? PK.westLine + 56 + i * 34 : -70 - (i + 1) * 34;
      const kinds = site.lowRise ? lowKinds : ['glass', 'prewar', 'banded', 'whitegrid'];
      block(kinds[(i + (side > 0 ? 1 : 0)) % 4], x0, x0 + 32, streetZ(-1) + road / 2 + walk, front - 1, lineH(40, 110), 0, { fade: false });
      block(kinds[(i + 2) % 4], x0, x0 + 32, acrossZ, streetZ(1) - road / 2 - walk, lineH(40, 120), 0, { fade: false });
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
      // Leave the Empire State Building lot (33rd–34th, west side of Fifth) clear.
      if (siteId === 'w36-fifth' && k === -3) n++;
      // Corner sites put the avenue right at the building, so the east-side
      // blocks start further east.
      else block(site.lowRise ? lowKinds[n++ % 4] : kinds[n++ % kinds.length], PK.eastLine - 18 < 6 ? PK.eastLine - 28 : 18, PK.eastLine, z0, z1, lineH(55, 170), 0, { fade: false });
      if (siteId === 'e38-fifth' && k === -5) { n++; continue; }
      block(site.lowRise ? lowKinds[n++ % 4] : kinds[n++ % kinds.length], PK.westLine, PK.westLine + 50, z0, z1, lineH(55, 190), 0, { fade: false });
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
      if (Math.abs(Math.cos(a) * dist - avMid) < 45) { m.makeScale(0, 0, 0); sky.setMatrixAt(i, m); continue; }
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
  if (16 < PK.eastLine - 3) vehicle(16, lane, { len: 4.6, ht: 1.5, body: new THREE.MeshStandardMaterial({ color: '#d7d9db', roughness: 0.3, metalness: 0.5 }), cabin: 0.5 });
  vehicle(2, front + walk + 5.2, { len: 4.8, ht: 1.6, body: yellow, cabin: 0.5 });
  vehicle(-30, farWalk - 1.2, { len: 4.7, ht: 1.5, body: new THREE.MeshStandardMaterial({ color: '#2b3a4f', roughness: 0.3, metalness: 0.5 }), cabin: 0.5 });

  const cab = { len: 4.8, ht: 1.7, body: yellow, cabin: 0.5 };
  const black = new THREE.MeshStandardMaterial({ color: '#15171b', roughness: 0.25, metalness: 0.6 });
  const grey = new THREE.MeshStandardMaterial({ color: '#6b6f75', roughness: 0.3, metalness: 0.6 });
  if (PK.median) {
    // Park Avenue traffic: northbound on the east roadway, southbound on the west.
    vehicle(PK.eastCurb + 2, front - 8, { ...cab, heading: -Math.PI / 2 });
    vehicle(PK.eastCurb + 6, front - 22, { len: 4.9, ht: 1.7, body: black, cabin: 0.5, heading: -Math.PI / 2 });
    vehicle(PK.median1 + 6, acrossZ + 9, { ...cab, heading: Math.PI / 2 });
    vehicle(PK.median1 + 10, acrossZ + 24, { len: 7.5, ht: 3.4, body: white, cabin: 0.3, heading: Math.PI / 2 });
    vehicle(PK.median1 + 2, front - 30, { len: 4.7, ht: 1.5, body: grey, cabin: 0.5, heading: Math.PI / 2 });
  } else if (PK.twoWay) {
    // Two-way avenue: northbound on the east half, southbound on the west half.
    const bus = new THREE.MeshStandardMaterial({ color: '#1e5bb8', roughness: 0.35, metalness: 0.3 });
    vehicle(PK.eastCurb + 2.5, front - 10, { ...cab, heading: -Math.PI / 2 });
    vehicle(PK.eastCurb + 6.5, acrossZ + 12, { len: 12, ht: 3.2, body: bus, cabin: 0.35, heading: -Math.PI / 2 });
    vehicle(PK.westCurb - 2.5, acrossZ + 6, { len: 4.9, ht: 1.7, body: black, cabin: 0.5, heading: Math.PI / 2 });
    vehicle(PK.westCurb - 6.5, front - 26, { ...cab, heading: Math.PI / 2 });
  } else {
    // One-way avenue: Fifth runs south; `heading` overrides (e.g. Sixth runs north).
    const oneWay = av.heading ?? Math.PI / 2;
    const bus = new THREE.MeshStandardMaterial({ color: '#1e5bb8', roughness: 0.35, metalness: 0.3 });
    // Only place vehicles that fit inside the roadway (narrow side streets).
    const fits = (x) => x < PK.westCurb - 1.5;
    if (fits(PK.eastCurb + 3)) vehicle(PK.eastCurb + 3, acrossZ + 14, { len: 12, ht: 3.2, body: bus, cabin: 0.35, heading: oneWay });
    if (fits(PK.eastCurb + 8)) vehicle(PK.eastCurb + 8, acrossZ + 6, { ...cab, heading: oneWay });
    if (fits(PK.eastCurb + 12)) vehicle(PK.eastCurb + 12, front - 12, { len: 4.9, ht: 1.7, body: black, cabin: 0.5, heading: oneWay });
    if (fits(PK.eastCurb + 16)) vehicle(PK.eastCurb + 16, acrossZ + 30, { ...cab, heading: oneWay });
    if (fits(PK.eastCurb + 8)) vehicle(PK.eastCurb + 8, front - 34, { len: 4.7, ht: 1.5, body: grey, cabin: 0.5, heading: oneWay });
  }
  vehicle(PK.eastLine - 9, front + walk + 6, { len: 4.9, ht: 1.7, body: black, cabin: 0.5 });

  const pole = new THREE.MeshStandardMaterial({ color: '#2e3134', roughness: 0.5, metalness: 0.6 });
  for (const x of [-22, 24].filter((x) => x < PK.eastLine - 1 || x > PK.westLine + 1)) {
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
  let changed = false;
  camera.updateMatrixWorld();
  pv.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(pv);
  const subjectDist = subject ? subject.distanceToPoint(camera.position) : Infinity;
  for (const f of fadeables) {
    let blocks = f.boxes.some((bx) => bx.containsPoint(camera.position));
    if (!blocks && foreground && !f.keep && subject && frustum.intersectsBox(f.box) && f.box.distanceToPoint(camera.position) < subjectDist - 3) blocks = true;
    for (const t of tg) {
      if (blocks) break;
      ray.origin.copy(camera.position);
      ray.direction.subVectors(t, camera.position);
      const dist = ray.direction.length();
      ray.direction.normalize();
      for (const bx of f.boxes) if (ray.intersectBox(bx, hit) && hit.distanceTo(camera.position) < dist) { blocks = true; break; }
    }
    const goal = blocks ? 0.07 : 1;
    if (Math.abs(goal - f.opacity) < 0.002) continue;
    changed = true;
    f.opacity += (goal - f.opacity) * Math.min(1, dt * 4);
    if (Math.abs(goal - f.opacity) < 0.003) f.opacity = goal;
    for (const m of f.mats) {
      m.opacity = f.opacity;
      m.depthWrite = f.opacity > 0.98;
    }
    f.mesh.castShadow = true;
  }
  return changed;
}

// ---------------------------------------------------------------------------
// 10 E 38th St neighbours (between Fifth and Madison; Fifth is to the west).
function neighbours38th({ scene, block, group, matFor, W, D, front, walk, road, acrossZ, streetZ, PK, slab, r }) {
  const zS = streetZ(-1) + road / 2 + walk; // north building line of the next street south
  const zN = streetZ(1) - road / 2 - walk; // south building line of the next street north
  const eastX = -W / 2 - 0.02;
  const westX = W / 2 + 0.02;

  // East: building wrapped in black netting over pipe scaffolding.
  {
    const net = block('netting', -W / 2 - 24, eastX, -D / 2, front + 0.3, 56);
    const pipeMat = new THREE.MeshStandardMaterial({ color: '#8d9296', roughness: 0.5, metalness: 0.6, transparent: true, opacity: 1 });
    const pipes = [];
    for (let x = -W / 2 - 23.5; x < eastX; x += 2.4) pipes.push([x, 28, front + 0.45, 0.06, 56, 0.06]);
    for (let y = 2; y < 56; y += 2) pipes.push([-W / 2 - 12, y, front + 0.45, 24, 0.05, 0.05]);
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), pipeMat, pipes.length);
    const m = new THREE.Matrix4();
    pipes.forEach(([x, y, z, sx, sy, sz], i) => im.setMatrixAt(i, m.compose(new THREE.Vector3(x, y, z), new THREE.Quaternion(), new THREE.Vector3(sx, sy, sz))));
    scene.add(im);
    group([net, im]);
  }

  // West: ornate limestone corner building to Fifth Avenue, deep dark cornice.
  {
    const x1 = PK.eastLine;
    const z0 = front - 30;
    const base = block('glass', westX, x1, z0, front, 9);
    const body = block('beaux', westX, x1, z0, front, 52, 9);
    const corniceMat = new THREE.MeshStandardMaterial({ color: '#26282a', roughness: 0.7, transparent: true, opacity: 1 });
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(x1 - westX + 0.8, 2.4, 31.8), corniceMat);
    cornice.position.set((westX + x1) / 2 + 0.4, 61.2, (z0 + front) / 2 + 0.9);
    cornice.castShadow = true;
    scene.add(cornice);
    const bracketMat = new THREE.MeshStandardMaterial({ color: '#1d1f21', roughness: 0.7, transparent: true, opacity: 1 });
    const brackets = new THREE.InstancedMesh(new THREE.BoxGeometry(0.35, 1.4, 1.6), bracketMat, Math.ceil((x1 - westX) / 1.6));
    const mm = new THREE.Matrix4();
    for (let i = 0; i < brackets.count; i++) brackets.setMatrixAt(i, mm.makeTranslation(westX + 0.8 + i * 1.6, 59.3, front + 0.8));
    scene.add(brackets);
    const band = new THREE.Mesh(new THREE.BoxGeometry(x1 - westX, 1.2, 0.5), new THREE.MeshStandardMaterial({ color: '#cfc4ae', roughness: 0.8, transparent: true, opacity: 1 }));
    band.position.set((westX + x1) / 2, 9.6, front + 0.25);
    scene.add(band);
    group([base, body, cornice, brackets, band]);
    block('prewar', westX, x1, zS, z0 - 0.1, 70, 0, { fade: false });
  }

  // Behind (south): brick party walls a few storeys above the roof terrace,
  // with a small yard behind the building.
  block('brickwall', -W / 2 - 24, PK.eastLine, zS, -D / 2 - 6, 52);
  block('brickwall', -W / 2 - 24, eastX, -D / 2 - 6, -D / 2, 52, 0, { fade: false });

  // Further east on our side of the street.
  block('prewar', -W / 2 - 58, -W / 2 - 24.1, zS, front, 46, 0, { fade: false });
  block('banded', -104, -W / 2 - 58.1, zS, front, 72, 0, { fade: false });

  // Across E 38th (north side), and the corners west of Fifth.
  block('prewar', -46, -10, acrossZ, zN, 64);
  block('banded', -9.9, 20, acrossZ, zN, 82);
  block('beaux', 20.1, PK.eastLine, acrossZ, zN, 58);
  block('glass', -104, -46.1, acrossZ, zN, 112, 0, { fade: false });
  block('glass', PK.westLine, PK.westLine + 50, acrossZ, zN, 140);
  block('banded', PK.westLine, PK.westLine + 50, zS, front, 96);

  // Empire State Building: west side of Fifth between 33rd and 34th St.
  empireState(scene, PK.westLine + 64, streetZ(-5) + road / 2 + walk, streetZ(-4) - road / 2 - walk);

  // Green sidewalk shed along the frontage (and the netted building next door).
  {
    const x0 = -W / 2 - 24;
    const x1 = W / 2 + 0.4;
    const depth = 3.4;
    const hgt = 3.7;
    const green = new THREE.MeshStandardMaterial({ color: '#2f5848', roughness: 0.6, metalness: 0.3 });
    const brace = new THREE.MeshStandardMaterial({ color: '#c2c6c9', roughness: 0.4, metalness: 0.6 });
    const add = (geo, mat, x, y, z, q) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z);
      if (q) m.quaternion.copy(q);
      m.castShadow = true;
      scene.add(m);
      return m;
    };
    for (let x = x0 + 0.2; x <= x1; x += 2.44) {
      for (const z of [front + 0.25, front + depth]) add(new THREE.BoxGeometry(0.14, hgt, 0.14), green, x, hgt / 2, z);
    }
    for (let x = x0 + 0.2; x + 2.44 <= x1; x += 4.88) {
      const len = Math.hypot(2.44, hgt - 0.6);
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.atan2(hgt - 0.6, 2.44)));
      const q2 = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, -Math.atan2(hgt - 0.6, 2.44)));
      add(new THREE.BoxGeometry(len, 0.05, 0.05), brace, x + 1.22, hgt / 2, front + depth, q);
      add(new THREE.BoxGeometry(len, 0.05, 0.05), brace, x + 1.22, hgt / 2, front + depth, q2);
    }
    add(new THREE.BoxGeometry(x1 - x0, 0.35, depth + 0.2), green, (x0 + x1) / 2, hgt + 0.17, front + depth / 2 + 0.1);
    // Green railing on top of the deck.
    add(new THREE.BoxGeometry(x1 - x0, 0.06, 0.06), green, (x0 + x1) / 2, hgt + 1.45, front + depth + 0.15);
    for (let x = x0 + 0.2; x <= x1; x += 1.22) add(new THREE.BoxGeometry(0.06, 1.1, 0.06), green, x, hgt + 0.9, front + depth + 0.15);
    const mesh = new THREE.MeshStandardMaterial({ color: '#2f5848', roughness: 0.8, transparent: true, opacity: 0.45, side: THREE.DoubleSide });
    add(new THREE.PlaneGeometry(x1 - x0, 1.0), mesh, (x0 + x1) / 2, hgt + 0.85, front + depth + 0.15);
    // Lights under the deck.
    const lamp = new THREE.MeshBasicMaterial({ color: '#fff6dc' });
    for (let x = x0 + 1.4; x < x1; x += 4.88) add(new THREE.BoxGeometry(0.3, 0.06, 0.3), lamp, x, hgt - 0.02, front + depth / 2);
    // White signs hung on the railing.
    const sign = (text, x, w) => {
      const t = textTexture({ text, width: 768, height: 192, bg: '#f4f4f2', ink: '#24456e', font: '600 64px "Helvetica Neue", Arial' });
      add(new THREE.PlaneGeometry(w, 0.75), new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 }), x, hgt + 0.95, front + depth + 0.2);
    };
    sign('10 East 38th Street, NYC', 3.4, 2.8);
    sign('SIDEWALK SHED', -1.3, 2.2);
  }

  // Ornamental lampposts on 38th near Fifth.
  const post = new THREE.MeshStandardMaterial({ color: '#3d4a45', roughness: 0.5, metalness: 0.5 });
  const globe = new THREE.MeshStandardMaterial({ color: '#f2efe6', emissive: '#fff3d6', emissiveIntensity: 0.4, roughness: 0.3 });
  for (const x of [W / 2 + 6, PK.eastLine + 1.5]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.18, 6.5, 12), post);
    p.position.set(x, 3.25, front + walk - 0.5);
    const arm = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 6, 16, Math.PI), post);
    arm.position.set(x - 0.5, 6.4, front + walk - 0.5);
    const gl = new THREE.Mesh(new THREE.SphereGeometry(0.28, 16, 12), globe);
    gl.position.set(x - 1.0, 6.1, front + walk - 0.5);
    for (const o of [p, arm, gl]) { o.castShadow = true; scene.add(o); }
  }
}

// ---------------------------------------------------------------------------
// 115 E 23rd St neighbours (north side of 23rd between Park Ave South and
// Lexington; local +x = west, toward Park Ave South).
function neighbours23rd({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK, unmirror, r }) {
  const zS = streetZ(-1) + road / 2 + walk; // building line on the next street north
  const zN = streetZ(1) - road / 2 - walk; // building line across 23rd (south side)
  const westX = W / 2 + 0.02;
  const eastX = -W / 2 - 0.02;

  // West: six-storey cream lofts with New York Sports Clubs at grade, then
  // the corner building at Park Avenue South.
  const loftA = block('prewar', westX, westX + 20, front - 26, front, 24);
  const loftB = block('prewar', westX + 20.1, PK.eastLine - 8, front - 26, front, 26);
  block('glass', PK.eastLine - 7.9, PK.eastLine, front - 26, front, 30);
  const orange = new THREE.MeshStandardMaterial({ color: '#ef6a1f', roughness: 0.6 });
  for (const x of [westX + 4, westX + 13, westX + 24, westX + 33]) {
    const sgn = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.7, 0.25), orange);
    sgn.position.set(x, 3.6, front + 0.15);
    scene.add(sgn);
  }
  group([loftA, loftB]);

  // Behind the lofts: the tall brick building with the shark mural.
  const muralBldg = block('brickwall', westX + 1, westX + 24, front - 50, front - 26.2, 46);
  {
    const c = document.createElement('canvas');
    c.width = 512; c.height = 512;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, '#eef3f6'); g.addColorStop(1, '#b9d2e4');
    ctx.fillStyle = g; ctx.fillRect(0, 0, 512, 512);
    ctx.fillStyle = '#5c7f99';
    ctx.beginPath(); ctx.ellipse(300, 250, 170, 120, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a9343a';
    ctx.beginPath(); ctx.ellipse(320, 290, 90, 50, -0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(240 + i * 20, 255 + i * 4); ctx.lineTo(250 + i * 20, 280 + i * 4); ctx.lineTo(260 + i * 20, 258 + i * 4); ctx.fill(); }
    ctx.font = '900 96px Impact, Arial Black, Arial'; ctx.textAlign = 'center'; ctx.fillText('SHARK', 256, 480);
    const tex = unmirror(new THREE.CanvasTexture(c));
    tex.colorSpace = THREE.SRGBColorSpace;
    const mural = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, transparent: true, opacity: 1 }));
    mural.position.set(westX + 12.5, 35, front - 26.1);
    scene.add(mural);
    group([muralBldg, mural]);
  }
  block('brickwall', westX + 24.1, westX + 40, front - 56, front - 30, 52);

  // East: tall red-brick residential tower built against our east wall, on a
  // stone retail podium, with street trees in front.
  const podium = block('beaux', eastX - 34, eastX, front - 28, front, 9);
  const tower = block('redtower', eastX - 34, eastX, front - 28, front - 0.8, 78, 9);
  group([podium, tower]);
  const leaf = new THREE.MeshStandardMaterial({ color: '#4f8a35', roughness: 1 });
  const trunk = new THREE.MeshStandardMaterial({ color: '#4a3a2c', roughness: 1 });
  for (const x of [eastX - 7, eastX - 20, eastX - 31]) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 3.4, 8), trunk);
    t.position.set(x, 1.7, front + walk - 1.1);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6, 1), leaf);
    crown.position.set(x, 5.6, front + walk - 1.1);
    crown.scale.set(1.2, 1, 1.1);
    for (const o of [t, crown]) { o.castShadow = true; scene.add(o); }
  }

  // Behind our lot (north) and further east.
  block('banded', eastX - 34, westX + 1, zS, -D / 2 - 0.2, 62);
  block('prewar', -104, eastX - 34.1, zS, front, 48, 0, { fade: false });
  // Across 23rd Street.
  block('glass', -70, -12, acrossZ, zN, 72);
  block('prewar', -11.9, 24, acrossZ, zN, 40);
  block('banded', 24.1, PK.eastLine, acrossZ, zN, 58);
  // West of Park Avenue South.
  block('banded', PK.westLine, PK.westLine + 50, zS, front, 92);
  block('glass', PK.westLine, PK.westLine + 50, acrossZ, zN, 110);

  // MetLife clock tower (Madison Ave & 23rd–24th St), west beyond Park Ave S.
  {
    const cx = PK.westLine + 118;
    const cz = front - 40;
    const stone = new THREE.MeshStandardMaterial({ color: '#d8d2c4', roughness: 0.75 });
    const add = (geo, mat, y, ry = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(cx, y, cz); m.rotation.y = ry; m.castShadow = true; scene.add(m); return m; };
    const tex = new THREE.CanvasTexture((() => {
      const c = document.createElement('canvas'); c.width = 128; c.height = 512; const k = c.getContext('2d');
      k.fillStyle = '#d8d2c4'; k.fillRect(0, 0, 128, 512);
      for (let y = 6; y < 512; y += 18) for (let x = 10; x < 128; x += 24) { k.fillStyle = '#4c535a'; k.fillRect(x, y, 10, 11); }
      return c;
    })());
    tex.colorSpace = THREE.SRGBColorSpace; tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(2, 6);
    add(new THREE.BoxGeometry(30, 150, 26), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75 }), 75);
    add(new THREE.BoxGeometry(27, 24, 23), stone, 162);
    const clock = new THREE.MeshStandardMaterial({ color: '#f1ede2', roughness: 0.5 });
    for (const [dx, dz, ry] of [[0, 13.1, 0], [0, -13.1, Math.PI], [15.1, 0, Math.PI / 2], [-15.1, 0, -Math.PI / 2]]) {
      const f = new THREE.Mesh(new THREE.CircleGeometry(4.6, 32), clock);
      f.position.set(cx + dx, 128, cz + dz); f.rotation.y = ry; scene.add(f);
    }
    const roof = add(new THREE.ConeGeometry(19, 30, 4), new THREE.MeshStandardMaterial({ color: '#b9b6ad', roughness: 0.6 }), 189, Math.PI / 4);
    roof.scale.set(1, 1, 0.86);
    add(new THREE.CylinderGeometry(2.4, 3.2, 8, 12), stone, 206);
    add(new THREE.SphereGeometry(2.2, 16, 12), new THREE.MeshStandardMaterial({ color: '#d4a63a', roughness: 0.25, metalness: 0.9 }), 212);
    add(new THREE.CylinderGeometry(0.25, 0.25, 6, 6), new THREE.MeshStandardMaterial({ color: '#d4a63a', metalness: 0.9, roughness: 0.3 }), 217);
  }
}

// ---------------------------------------------------------------------------
// 133 W 21st St neighbours (north side of 21st, Sixth Avenue to the east;
// here local +x is east, toward the avenue).
function neighbours21st({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK }) {
  const zS = streetZ(-1) + road / 2 + walk;
  const zN = streetZ(1) - road / 2 - walk;
  const westX = -W / 2 - 0.02;
  const eastX = W / 2 + 0.02;

  // West: five-storey tan-brick loft, with a taller dark-brick building behind.
  block('prewar', westX - 24, westX, front - 28, front, 21);
  block('brickwall', westX - 28, westX - 1, front - 52, front - 28.2, 46);
  block('banded', -120, westX - 24.1, zS, front, 40, 0, { fade: false });

  // East, toward Sixth Avenue: narrow ornate building, a modern grey
  // residential block with roof planting, an older building with a dark
  // cornice, then the corner.
  block('beaux', eastX, eastX + 7.5, front - 26, front, 24);
  const modern = block('whitegrid', eastX + 7.6, eastX + 30, front - 26, front, 40);
  const green = new THREE.MeshStandardMaterial({ color: '#4c7f36', roughness: 1, transparent: true, opacity: 1 });
  const planting = new THREE.Mesh(new THREE.BoxGeometry(20, 1.4, 3), green);
  planting.position.set(eastX + 18.8, 40.7, front - 2);
  scene.add(planting);
  group([modern, planting]);
  const older = block('beaux', eastX + 30.1, eastX + 52, front - 26, front, 30);
  const cor = new THREE.Mesh(new THREE.BoxGeometry(22.4, 1.6, 1.4), new THREE.MeshStandardMaterial({ color: '#2b3a36', roughness: 0.7, transparent: true, opacity: 1 }));
  cor.position.set(eastX + 41, 30.4, front + 0.4);
  scene.add(cor);
  group([older, cor]);
  if (PK.eastLine > eastX + 52.2) block('prewar', eastX + 52.1, PK.eastLine, front - 26, front, 28);
  // Street trees along the east sidewalk.
  const leaf = new THREE.MeshStandardMaterial({ color: '#4f8a35', roughness: 1 });
  const trunk = new THREE.MeshStandardMaterial({ color: '#4a3a2c', roughness: 1 });
  for (const x of [eastX + 14, eastX + 22, eastX + 30]) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 3, 8), trunk);
    t.position.set(x, 1.5, front + walk - 1);
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 1), leaf);
    c.position.set(x, 4.4, front + walk - 1);
    c.scale.set(0.9, 1.3, 0.9);
    for (const o of [t, c]) { o.castShadow = true; scene.add(o); }
  }

  // Behind (north) and across 21st Street.
  block('banded', westX - 24, PK.eastLine, zS, -D / 2 - 0.2, 58);
  block('prewar', -70, -20, acrossZ, zN, 32);
  block('whitegrid', -19.9, 18, acrossZ, zN, 48);
  block('beaux', 18.1, PK.eastLine, acrossZ, zN, 30);
  block('glass', PK.westLine, PK.westLine + 50, acrossZ, zN, 80);
  block('prewar', PK.westLine, PK.westLine + 50, zS, front, 36);
}

// ---------------------------------------------------------------------------
// 102 W 38th St neighbours. The building faces north and the site is
// mirrored, so local +x points east toward Sixth Avenue.
function neighbours102w38({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK }) {
  const zS = streetZ(-1) + road / 2 + walk;
  const zN = streetZ(1) - road / 2 - walk;
  const eastX = W / 2 + 0.02;
  const westX = -W / 2 - 0.02;

  // East: pink four-storey walk-up with a black-awninged shop (Polish Me),
  // a tall dark-brick tower rising behind it, then the corner at Sixth.
  const pink = block('stucco', eastX, eastX + 8, front - 20, front, 15);
  const awnMat = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.6, transparent: true, opacity: 1 });
  const awn = new THREE.Mesh(new THREE.BoxGeometry(7.6, 1.0, 1.4), awnMat);
  awn.position.set(eastX + 4, 3.6, front + 0.6);
  scene.add(awn);
  group([pink, awn]);
  block('darkgrid', eastX + 0.5, eastX + 24, front - 46, front - 20.2, 92);
  if (PK.eastLine > eastX + 8.2) block('prewar', eastX + 8.1, PK.eastLine, front - 22, front, 26);

  // West: tall buff ornate loft with dark louvred windows, and its stepped
  // tower rising behind with a crowning lantern.
  const loft = block('beaux', westX - 26, westX, front - 24, front, 56);
  const t1 = block('prewar', westX - 24, westX - 2, front - 40, front - 24.2, 72);
  const t2 = block('prewar', westX - 21, westX - 5, front - 37, front - 27, 84);
  const lantern = block('beaux', westX - 16, westX - 10, front - 35, front - 29, 92);
  group([loft, t1, t2, lantern]);
  block('banded', -110, westX - 26.1, zS, front, 60, 0, { fade: false });

  // Behind and across West 38th Street (garment district lofts).
  block('prewar', westX - 26, PK.eastLine, zS, -D / 2 - 0.2, 64);
  block('beaux', -60, -14, acrossZ, zN, 58);
  block('prewar', -13.9, 14, acrossZ, zN, 44);
  block('banded', 14.1, PK.eastLine, acrossZ, zN, 70);
  block('glass', PK.westLine, PK.westLine + 50, zS, front, 120);
  block('banded', PK.westLine, PK.westLine + 50, acrossZ, zN, 90);
}

// Empire State Building, stepped tiers + mast, centred at (cx, between z0..z1).
function empireState(scene, cx, z0, z1) {
  {
    const cz = (z0 + z1) / 2;
    const tex = facadeTexture('esb', 3);
    const tier = (w, d, y0, y1) => {
      const g = new THREE.BoxGeometry(w, y1 - y0, d);
      const uv = g.attributes.uv;
      const dims = [[d, y1 - y0], [d, y1 - y0], [w, d], [w, d], [w, y1 - y0], [w, y1 - y0]];
      for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / 10, uv.getY(i) * dims[f][1] / 14); }
      const mesh = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0.15 }));
      mesh.position.set(cx, (y0 + y1) / 2, cz);
      mesh.castShadow = true;
      scene.add(mesh);
    };
    tier(126, z1 - z0, 0, 25);
    tier(96, 52, 25, 90);
    tier(80, 46, 90, 125);
    tier(58, 40, 125, 320);
    tier(42, 30, 320, 345);
    tier(24, 22, 345, 372);
    tier(14, 14, 372, 381);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 4.5, 40, 16), new THREE.MeshStandardMaterial({ color: '#d8d6d0', roughness: 0.4, metalness: 0.5 }));
    mast.position.set(cx, 401, cz);
    scene.add(mast);
    const spire = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.2, 62, 8), new THREE.MeshStandardMaterial({ color: '#c9c9c9', roughness: 0.4, metalness: 0.7 }));
    spire.position.set(cx, 452, cz);
    scene.add(spire);
  }
}

// ---------------------------------------------------------------------------
// 8 W 36th St neighbours. Faces north; mirrored so local +x points east,
// toward Fifth Avenue.
function neighbours8w36({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK }) {
  const zS = streetZ(-1) + road / 2 + walk;
  const zN = streetZ(1) - road / 2 - walk;
  const eastX = W / 2 + 0.02;
  const westX = -W / 2 - 0.02;

  // East: tall cream loft, then the Gorham Building on the Fifth Ave corner
  // (white stone, arcaded base, green copper cornice).
  block('beaux', eastX, eastX + 8, front - 24, front, 41);
  const gx0 = eastX + 8.1;
  const gx1 = PK.eastLine;
  const gor = block('beaux', gx0, gx1, front - 40, front, 37);
  const copper = new THREE.MeshStandardMaterial({ color: '#4f8a72', roughness: 0.6, metalness: 0.3, transparent: true, opacity: 1 });
  const cor = new THREE.Mesh(new THREE.BoxGeometry(gx1 - gx0 + 1.2, 2.0, 2.4), copper);
  cor.position.set((gx0 + gx1) / 2, 38, front + 0.6);
  scene.add(cor);
  const arcMat = new THREE.MeshStandardMaterial({ color: '#e8e2d4', roughness: 0.7, transparent: true, opacity: 1 });
  const arcs = [];
  for (let x = gx0 + 2.5; x < gx1 - 1; x += 4.2) {
    const a = new THREE.Mesh(new THREE.TorusGeometry(1.6, 0.22, 6, 16, Math.PI), arcMat);
    a.scale.z = 0.35;
    a.position.set(x, 6.2, front + 0.06);
    scene.add(a);
    arcs.push(a);
  }
  group([gor, cor, ...arcs]);

  // West: three-level open parking garage, then a tall grey stone loft.
  const deck = new THREE.MeshStandardMaterial({ color: '#8d8b86', roughness: 0.9, transparent: true, opacity: 1 });
  const steel = new THREE.MeshStandardMaterial({ color: '#2d3540', roughness: 0.5, metalness: 0.5, transparent: true, opacity: 1 });
  const parts = [];
  const gx = westX - 12;
  for (const y of [0.1, 3.6, 7.1, 10.6]) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(24, 0.3, 26), deck);
    s.position.set(gx, y, front - 13);
    s.receiveShadow = true;
    scene.add(s); parts.push(s);
  }
  for (let x = westX - 23; x < westX; x += 5.5) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.35, 11, 0.35), steel);
    c.position.set(x, 5.5, front - 0.4);
    scene.add(c); parts.push(c);
  }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(24, 0.9, 0.08), steel);
  rail.position.set(gx, 11.5, front - 0.3);
  scene.add(rail); parts.push(rail);
  const carCols = ['#c9ccd0', '#2b2f36', '#8c1d1d', '#e5e5e2', '#4a5563'];
  let ci = 0;
  for (const y of [3.75, 7.25, 10.75]) {
    for (let x = westX - 21; x < westX - 2; x += 3.2) {
      const car = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.3, 4.4), new THREE.MeshStandardMaterial({ color: carCols[ci++ % carCols.length], roughness: 0.35, metalness: 0.5, transparent: true, opacity: 1 }));
      car.position.set(x, y + 0.65, front - 3);
      scene.add(car); parts.push(car);
    }
  }
  group(parts);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4.2, 0.8), new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.5 }));
  sign.position.set(westX - 1.6, 8.0, front + 0.5);
  scene.add(sign);
  block('prewar', westX - 48, westX - 24.1, front - 26, front, 48);
  block('banded', -120, westX - 48.1, zS, front, 44, 0, { fade: false });

  // Behind and across West 36th Street.
  block('prewar', westX - 48, PK.eastLine, zS, -D / 2 - 0.2, 52);
  block('beaux', -60, -12, acrossZ, zN, 46);
  block('prewar', -11.9, 18, acrossZ, zN, 58);
  block('banded', 18.1, PK.eastLine, acrossZ, zN, 64);
  block('glass', PK.westLine, PK.westLine + 50, zS, front, 110);
  block('banded', PK.westLine, PK.westLine + 50, acrossZ, zN, 80);

  // Empire State Building two blocks south, on this (west) side of Fifth.
  empireState(scene, PK.eastLine - 64, streetZ(-3) + road / 2 + walk, streetZ(-2) - road / 2 - walk);
}

// ---------------------------------------------------------------------------
// 12 E 44th St neighbours. Faces north; local +x is west, toward Fifth Ave.
function neighbours12e44({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK }) {
  const zS = streetZ(-1) + road / 2 + walk;
  const zN = streetZ(1) - road / 2 - walk;
  const eastX = -W / 2 - 0.02;
  const westX = W / 2 + 0.02;

  // East: five-storey building — red-brick base with arched windows and a
  // black shop sign, grey-green painted upper floors with dark cornices —
  // and a taller cream tower set back behind it.
  const low = block('brickwall', eastX - 9, eastX, front - 24, front, 8);
  const up = block('prewar', eastX - 9, eastX, front - 24, front, 10, 8);
  up.material.color.set('#aab5a9');
  const black = new THREE.MeshStandardMaterial({ color: '#141516', roughness: 0.5, transparent: true, opacity: 1 });
  const sign = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.8, 0.2), black);
  sign.position.set(eastX - 4.5, 3.9, front + 0.12);
  scene.add(sign);
  const cor = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.5, 0.7), black);
  cor.position.set(eastX - 4.5, 18.2, front + 0.3);
  scene.add(cor);
  group([low, up, sign, cor]);
  block('whitegrid', eastX - 30, eastX - 1, front - 50, front - 24.2, 70);
  block('prewar', eastX - 30, eastX - 9.1, front - 24, front, 30);
  block('banded', -120, eastX - 30.1, zS, front, 52, 0, { fade: false });

  // West: white limestone nine-storey with an arched window bay and a white
  // sidewalk shed, then a taller brown-brick building toward Fifth.
  const white = block('beaux', westX, westX + 8.5, front - 26, front, 34);
  white.material.color.set('#f2efe8');
  const shedMat = new THREE.MeshStandardMaterial({ color: '#f1f1ee', roughness: 0.6, transparent: true, opacity: 1 });
  const shed = new THREE.Mesh(new THREE.BoxGeometry(9, 0.9, 3.2), shedMat);
  shed.position.set(westX + 4.3, 3.6, front + 1.6);
  scene.add(shed);
  const posts = [];
  for (const x of [westX + 0.3, westX + 4.3, westX + 8.3]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.2, 0.15), shedMat);
    p.position.set(x, 1.6, front + 3.1);
    scene.add(p); posts.push(p);
  }
  group([white, shed, ...posts]);
  block('darkgrid', westX + 8.6, westX + 19, front - 28, front, 44);
  block('prewar', westX + 19.1, PK.eastLine, front - 30, front, 40);

  // Behind and across East 44th Street.
  block('glass', eastX - 30, PK.eastLine, zS, -D / 2 - 0.2, 95);
  block('prewar', -60, -14, acrossZ, zN, 72);
  block('glass', -13.9, 16, acrossZ, zN, 110);
  block('beaux', 16.1, PK.eastLine, acrossZ, zN, 64);
  block('glass', PK.westLine, PK.westLine + 50, zS, front, 130);
  block('banded', PK.westLine, PK.westLine + 50, acrossZ, zN, 90);
}

// ---------------------------------------------------------------------------
// 370 W 51st St neighbours: corner of Ninth Avenue (local +x = west, the
// avenue starts at the building's west wall). Hell's Kitchen walk-ups.
function neighbours370w51({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK }) {
  const zS = streetZ(-1) + road / 2 + walk;
  const zN = streetZ(1) - road / 2 - walk;
  const eastX = -W / 2 - 0.02;

  // East along 51st: the six-storey walk-up with fire escapes and the green
  // Cleaners/Tailors awning, then more walk-ups.
  block('tenement', eastX - 15, eastX, front - 17, front, 19);
  const green = new THREE.MeshStandardMaterial({ color: '#1f5a3a', roughness: 0.6, transparent: true, opacity: 1 });
  const awn = new THREE.Mesh(new THREE.BoxGeometry(13, 0.9, 1.3), green);
  awn.position.set(eastX - 7.5, 3.4, front + 0.65);
  awn.rotation.x = 0.25;
  scene.add(awn);
  block('redtenement', eastX - 30, eastX - 15.1, front - 17, front, 17);
  block('tenement', eastX - 46, eastX - 30.1, front - 17, front, 21);
  block('prewar', -120, eastX - 46.1, zS, front, 24, 0, { fade: false });
  // South along Ninth Avenue: red-brick walk-ups with fire escapes and
  // colourful shop awnings.
  const awnCols = ['#2b6fd0', '#d23a2a', '#f0b429', '#2b6fd0'];
  let k = 0;
  for (let z = -D / 2 - 0.02; z > zS + 4; z -= 9) {
    const z0 = Math.max(zS, z - 8.9);
    block(k % 2 ? 'tenement' : 'redtenement', W / 2 - 16, W / 2, z0, z, 16 + (k % 3) * 2.5);
    const a = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, z - z0 - 1), new THREE.MeshStandardMaterial({ color: awnCols[k % 4], roughness: 0.6 }));
    a.position.set(W / 2 + 0.6, 3.3, (z + z0) / 2);
    scene.add(a);
    k++;
  }
  block('tenement', eastX - 46, W / 2 - 16.1, zS, -D / 2 - 0.2, 20);

  // Across 51st Street and across Ninth Avenue.
  block('tenement', -60, -14, acrossZ, zN, 19);
  block('redtenement', -13.9, PK.eastLine, acrossZ, zN, 22);
  block('tenement', PK.westLine, PK.westLine + 40, zS, front, 18);
  block('redtenement', PK.westLine, PK.westLine + 40, acrossZ, zN, 20);

  // Street trees on 51st.
  const leaf = new THREE.MeshStandardMaterial({ color: '#4f8a35', roughness: 1 });
  const trunk = new THREE.MeshStandardMaterial({ color: '#4a3a2c', roughness: 1 });
  for (const x of [eastX - 4, eastX - 18, eastX - 32]) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 4, 8), trunk);
    t.position.set(x, 2, front + walk - 1);
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(3.2, 1), leaf);
    c.position.set(x, 7, front + walk - 1);
    c.scale.set(1.1, 1, 1.1);
    for (const o of [t, c]) { o.castShadow = true; scene.add(o); }
  }
}

// ---------------------------------------------------------------------------
// 34-09 Queens Blvd: the building fills the block between 34th St (-x) and
// 35th St (+x, the side street modelled as the "avenue"). Queens Blvd is the
// wide street in front, with the elevated 7 train over its centre.
function neighboursQueensBlvd({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK, flat, asphaltMat, slab }) {
  const zS = streetZ(-1) + road / 2 + walk;
  const zN = streetZ(1) - road / 2 - walk;
  const west = -W / 2;

  // 34th Street along the west end (sidewalks + one-way roadway).
  slab(west - 4.5, west, zS, front, 0.165);
  flat(asphaltMat, west - 14.5, west - 4.5, zS - 40, acrossZ + 40, 0.013);
  slab(west - 19, west - 14.5, zS, front, 0.165);
  slab(west - 19, west - 14.5, acrossZ, zN, 0.165);

  // Elevated 7 train over the middle of Queens Blvd.
  {
    const zc = front + walk + road / 2;
    const steel = new THREE.MeshStandardMaterial({ color: '#5f6a63', roughness: 0.6, metalness: 0.4, transparent: true, opacity: 1 });
    const parts = [];
    const deck = new THREE.Mesh(new THREE.BoxGeometry(520, 1.6, 9), steel);
    deck.position.set(0, 9.6, zc);
    deck.castShadow = true;
    scene.add(deck); parts.push(deck);
    for (const dz of [-4.2, 4.2]) {
      const girder = new THREE.Mesh(new THREE.BoxGeometry(520, 1.2, 0.3), steel);
      girder.position.set(0, 10.9, zc + dz);
      scene.add(girder); parts.push(girder);
    }
    const cols = new THREE.InstancedMesh(new THREE.BoxGeometry(0.7, 8.8, 0.7), steel, 2 * 27);
    const m = new THREE.Matrix4();
    let n = 0;
    for (let x = -260; x <= 260; x += 20) for (const dz of [-3.5, 3.5]) cols.setMatrixAt(n++, m.makeTranslation(x, 4.4, zc + dz));
    cols.count = n;
    // Columns are thin and never fade (their combined bounding box would
    // otherwise count as a solid wall across the view).
    scene.add(cols);
    group(parts, { keep: true });
  }

  // Across 35th St (east), across 34th St (west), behind, and across Queens Blvd.
  block('prewar', PK.westLine, PK.westLine + 40, zS, front, 14);
  block('tenement', west - 59, west - 19, front - 30, front, 10);
  block('brickwall', west - 59, west - 19, zS, front - 30.1, 16);
  block('brickwall', west, PK.eastLine, zS, -D / 2 - 6, 18);
  block('prewar', -70, -15, acrossZ, zN, 12);
  block('tenement', -14.9, 22, acrossZ, zN, 16);
  block('prewar', 22.1, PK.eastLine, acrossZ, zN, 10);
  block('glass', PK.westLine, PK.westLine + 40, acrossZ, zN, 60);
}

// ---------------------------------------------------------------------------
// 250 Canal St (SW corner of Canal & Lafayette). Faces north; mirrored, so
// local +x is east toward Lafayette St. The bank is one storey, so the
// neighbours' graffitied walls show above its roof.
function neighbours250canal({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK, unmirror, r }) {
  const zS = streetZ(-1) + road / 2 + walk;
  const zN = streetZ(1) - road / 2 - walk;
  const westX = -W / 2 - 0.02;

  const graffiti = (w, h) => {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 256;
    const ctx = c.getContext('2d');
    const cols = ['#c8312b', '#e7e7e7', '#7fa6d8', '#202020', '#e3c54a'];
    for (let k = 0; k < 9; k++) {
      ctx.strokeStyle = cols[k % cols.length]; ctx.lineWidth = 14 + r() * 18; ctx.lineJoin = 'round'; ctx.beginPath();
      let x = 40 + k * 105; let y = 60 + r() * 140; ctx.moveTo(x, y);
      for (let j = 0; j < 5; j++) { x += (r() - 0.3) * 60; y = 40 + r() * 180; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    const t = unmirror(new THREE.CanvasTexture(c));
    t.colorSpace = THREE.SRGBColorSpace;
    return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t, transparent: true, roughness: 0.9 }));
  };

  // Behind the bank along Lafayette: grey-painted brick five-storey with
  // graffiti on the wall that faces Canal above the bank's roof.
  const back = block('prewar', -W / 2 + 4, W / 2, zS + 20, -D / 2 - 0.02, 18);
  back.material.color.set('#b8b4ad');
  const gB = graffiti(14, 3.2);
  gB.position.set(3, 10.6, -D / 2 + 0.03);
  scene.add(gB);
  group([back, gB]);
  // West along Canal: tall white-painted loft with AC units and graffiti,
  // Popeyes at its corner further west.
  const west = block('prewar', westX - 16, westX, front - 26, front, 30);
  west.material.color.set('#e6e4df');
  const gW = graffiti(12, 3.5);
  gW.position.set(westX - 6, 10.5, front + 0.03);
  scene.add(gW);
  group([west, gW]);
  const pop = new THREE.Mesh(new THREE.BoxGeometry(5, 1.0, 0.25), new THREE.MeshStandardMaterial({ color: '#e35a1f', roughness: 0.5 }));
  pop.position.set(westX - 13.5, 4.4, front + 0.15);
  scene.add(pop);
  block('tenement', westX - 40, westX - 16.1, front - 24, front, 20);
  block('prewar', -110, westX - 40.1, zS, front, 24, 0, { fade: false });
  block('tenement', westX - 40, -W / 2 + 3.9, zS, front - 24.1, 22);

  // Across Canal Street and across Lafayette (Chinatown / SoHo edge).
  block('tenement', -70, -20, acrossZ, zN, 22);
  block('redtenement', -19.9, PK.eastLine, acrossZ, zN, 26);
  block('prewar', PK.westLine, PK.westLine + 34, zS, front, 30);
  block('beaux', PK.westLine, PK.westLine + 34, acrossZ, zN, 34);

  // Canal St subway entrance and a newsstand on the bank's sidewalk.
  const steel = new THREE.MeshStandardMaterial({ color: '#2f4a3b', roughness: 0.5, metalness: 0.5 });
  const rail = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.1, 2.2), steel);
  rail.position.set(-W / 2 + 5, 0.55, front + walk - 1.6);
  scene.add(rail);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.8, 1.8), new THREE.MeshStandardMaterial({ color: '#9a9c9e', roughness: 0.4, metalness: 0.6 }));
  stand.position.set(-1, 1.4, front + walk - 1.4);
  stand.castShadow = true;
  scene.add(stand);
}

// ---------------------------------------------------------------------------
// Suburban business park (e.g. Orlando Central Park): lawn, parking lots,
// a fenced side yard, light poles, live oaks and low warehouses. The front of
// the building faces +z onto the lot; the side lot is along -x.
function buildSuburban(scene, { W, D, site }) {
  const r = rand(2100);
  const front = D / 2;
  const add = (m) => { scene.add(m); return m; };
  const flat = (mat, x0, x1, z0, z1, y = 0.01) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, z1 - z0), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
    m.receiveShadow = true;
    return add(m);
  };
  const grass = new THREE.MeshStandardMaterial({ color: '#6f9a45', roughness: 1 });
  const asphalt = new THREE.MeshStandardMaterial({ color: '#3b3c3e', roughness: 0.95 });
  const white = new THREE.MeshBasicMaterial({ color: '#e9e7e0' });
  const yellow = new THREE.MeshBasicMaterial({ color: '#e6be2e' });
  const kerbMat = new THREE.MeshStandardMaterial({ color: '#d4d0c7', roughness: 0.9 });
  flat(grass, -800, 800, -800, 800, 0);

  // Lots: front (+z) and along the long side (-x), plus the access road.
  const lotX0 = -W / 2 - 46;
  flat(asphalt, lotX0, W / 2 + 18, front + 1, front + 34, 0.04);
  flat(asphalt, lotX0, -W / 2, -front - 10, front + 1, 0.04);
  flat(asphalt, -400, 400, front + 44, front + 56, 0.04); // Directors Row
  for (const dz of [-0.12, 0.12]) flat(yellow, -400, 400, front + 50 + dz - 0.05, front + 50 + dz + 0.05, 0.07);
  flat(asphalt, W / 2 - 10, W / 2 + 2, front + 33, front + 45, 0.045); // driveway
  // Striped bays and wheel stops.
  for (let x = lotX0 + 3; x < W / 2 + 14; x += 2.8) {
    flat(white, x - 0.06, x + 0.06, front + 3, front + 9, 0.07);
    flat(white, x - 0.06, x + 0.06, front + 22, front + 28, 0.07);
    if (x > -W / 2 + 2) add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.15, 0.3), yellow)).position.set(x + 1.4, 0.08, front + 3.4);
  }
  for (let z = -front; z < front - 4; z += 2.8) flat(white, lotX0 + 3, lotX0 + 9, z - 0.06, z + 0.06, 0.07);
  // Grass island with a curved kerb at the front corner of the lot.
  const island = add(new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 0.2, 32, 1, false, 0, Math.PI / 2), grass));
  island.position.set(W / 2 + 6, 0.1, front + 18);
  const kerb = add(new THREE.Mesh(new THREE.TorusGeometry(9, 0.18, 6, 24, Math.PI / 2), kerbMat));
  kerb.rotation.x = -Math.PI / 2;
  kerb.position.set(W / 2 + 6, 0.12, front + 18);
  flat(grass, W / 2 + 1, W / 2 + 40, -front, front + 1, 0.011);

  // Chain-link fence around the side yard.
  const fence = new THREE.MeshStandardMaterial({ color: '#9aa0a5', roughness: 0.5, metalness: 0.6, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
  const post = new THREE.MeshStandardMaterial({ color: '#8b9196', roughness: 0.4, metalness: 0.7 });
  const fenceRun = (x0, z0, x1, z1) => {
    const len = Math.hypot(x1 - x0, z1 - z0);
    const m = add(new THREE.Mesh(new THREE.PlaneGeometry(len, 2.4), fence));
    m.position.set((x0 + x1) / 2, 1.2, (z0 + z1) / 2);
    m.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
    const n = Math.ceil(len / 3);
    for (let k = 0; k <= n; k++) {
      const p = add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.6, 6), post));
      p.position.set(x0 + ((x1 - x0) * k) / n, 1.3, z0 + ((z1 - z0) * k) / n);
    }
    const top = add(new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, len, 6), post));
    top.rotation.z = Math.PI / 2;
    top.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
    top.position.set((x0 + x1) / 2, 2.45, (z0 + z1) / 2);
  };
  fenceRun(lotX0 + 2, front - 2, -W / 2 - 1, front - 2);
  fenceRun(lotX0 + 2, front - 2, lotX0 + 2, -front);

  // Parked cars.
  const carCols = ['#e8e8e6', '#8e9aa6', '#7a1d22', '#c9c3b5', '#2c3440', '#b8bcc2'];
  const car = (x, z, ry) => {
    const g = new THREE.Group();
    const col = new THREE.MeshStandardMaterial({ color: carCols[Math.floor(r() * carCols.length)], roughness: 0.3, metalness: 0.5 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.8, 1.85), col);
    body.position.y = 0.65;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 1.7), new THREE.MeshStandardMaterial({ color: '#22272d', roughness: 0.2, metalness: 0.6 }));
    cab.position.set(-0.2, 1.3, 0);
    g.add(body, cab);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    add(g);
  };
  for (let x = lotX0 + 4.4; x < -W / 2 - 4; x += 2.8) if (r() < 0.75) car(x, front + 6, Math.PI / 2);
  for (let z = -front + 2; z < front - 6; z += 2.8) if (r() < 0.6) car(lotX0 + 6, z, 0);
  for (let x = -W / 2 + 5; x < W / 2 + 10; x += 2.8) if (r() < 0.35) car(x + 1.4, front + 25, Math.PI / 2);

  // Three-headed light poles.
  const poleMat = new THREE.MeshStandardMaterial({ color: '#b9bcbf', roughness: 0.4, metalness: 0.7 });
  const headMat = new THREE.MeshStandardMaterial({ color: '#dcdedf', roughness: 0.3, metalness: 0.4, emissive: '#fff4d6', emissiveIntensity: 0.15 });
  for (const [x, z] of [[lotX0 + 18, front + 2], [lotX0 + 18, -10], [-6, front + 16], [W / 2 + 14, front + 30]]) {
    const p = add(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 11, 10), poleMat));
    p.position.set(x, 5.5, z);
    p.castShadow = true;
    for (let k = 0; k < 3; k++) {
      const a = (k / 3) * Math.PI * 2;
      const arm = add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 6), poleMat));
      arm.position.set(x + Math.cos(a) * 0.7, 11.2, z + Math.sin(a) * 0.7);
      arm.rotation.set(Math.sin(a) * 1.0, 0, -Math.cos(a) * 1.0);
      const head = add(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.35, 0.25, 12), headMat));
      head.position.set(x + Math.cos(a) * 1.4, 11.7, z + Math.sin(a) * 1.4);
    }
  }

  // Live oaks and shrubs beside the office front.
  const leaf = [new THREE.MeshStandardMaterial({ color: '#3f6b2c', roughness: 1 }), new THREE.MeshStandardMaterial({ color: '#4d7d33', roughness: 1 })];
  const trunk = new THREE.MeshStandardMaterial({ color: '#4b3d30', roughness: 1 });
  const oak = (x, z, s) => {
    const t = add(new THREE.Mesh(new THREE.CylinderGeometry(0.25 * s, 0.4 * s, 4 * s, 8), trunk));
    t.position.set(x, 2 * s, z);
    for (let k = 0; k < 5; k++) {
      const c = add(new THREE.Mesh(new THREE.IcosahedronGeometry((2.2 + r() * 1.4) * s, 1), leaf[k % 2]));
      c.position.set(x + (r() - 0.5) * 4 * s, (5 + r() * 3) * s, z + (r() - 0.5) * 4 * s);
      c.castShadow = true;
    }
  };
  for (const [x, z, s] of [[W / 2 + 4, front - 4, 1.3], [W / 2 + 10, front - 18, 1.5], [W / 2 + 6, front - 40, 1.2], [W / 2 + 24, front + 10, 1.1], [-W / 2 - 50, front + 40, 1.0]]) oak(x, z, s);
  for (let x = W / 2 - 10; x < W / 2 + 2; x += 2) {
    const b = add(new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), leaf[1]));
    b.position.set(x, 0.7, front + 0.9);
    b.scale.y = 0.7;
  }

  // Low warehouses around the park.
  const shed = (x0, x1, z0, z1, h, c) => {
    const m = add(new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, h, z1 - z0), new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 })));
    m.position.set((x0 + x1) / 2, h / 2, (z0 + z1) / 2);
    m.castShadow = m.receiveShadow = true;
  };
  shed(lotX0 - 70, lotX0 - 6, -60, 20, 8, '#d8cdb6');
  shed(W / 2 + 46, W / 2 + 130, -90, 10, 9, '#e3ddd0');
  shed(-120, -20, front + 64, front + 130, 7.5, '#cfc4ae');
  shed(10, 120, front + 64, front + 140, 9, '#e6e1d6');
  shed(-60, 60, -front - 90, -front - 25, 10, '#ddd4c2');
  void site;
  return { fadeables: [] };
}
