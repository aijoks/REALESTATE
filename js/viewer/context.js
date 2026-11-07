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
//   east  (-x): 14 E 38th, pre-war loft building (52 m)
//   west  (+x): ornate limestone corner building with a deep dark cornice
//   south (-z): plain brick party walls a few storeys above the roof terrace
//   Fifth Avenue (+x, ~30 m west): one-way southbound, Empire State Building 4
//   blocks south; no construction (shed/netting removed: work finished)
// Neighbours fade out whenever they block the view of the subject building.
import { SITE_EXTRAS } from './sites/index.js';
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

// Roof colours for the generic neighbour blocks (tar / gravel / membrane).
const ROOF_COLOR = {
  glass: '#5f6469',
  fluted: '#6b7074',
  banded: '#85827c',
  prewar: '#77736c',
  whitegrid: '#8c8b87',
  beaux: '#4a4b4c',
  netting: '#595b5d',
  tenement: '#5e5a56',
  redtenement: '#5e5a56',
  brickwall: '#6a6560',
  stucco: '#8a877f',
  darkgrid: '#55585b',
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
    // The box's top face (+y, group 2) is dropped from the facade mesh and
    // replaced by a plain roof plane, so roofs seen from above don't show the
    // window texture. The roof follows the facade's fade (opacity/depthWrite).
    const geo = boxUV(w, h, d, tw, th);
    const keepIdx = [];
    for (const g of geo.groups) if (g.materialIndex !== 2) for (let i = g.start; i < g.start + g.count; i++) keepIdx.push(geo.index.getX(i));
    geo.setIndex(keepIdx);
    geo.clearGroups();
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set((x0 + x1) / 2, y0 + h / 2, (z0 + z1) / 2);
    mesh.castShadow = mesh.receiveShadow = true;
    const roofMat = new THREE.MeshStandardMaterial({ color: ROOF_COLOR[kind] ?? '#7d7a74', roughness: 0.95, metalness: 0, transparent: true, opacity: 1 });
    const roof = new THREE.Mesh(new THREE.PlaneGeometry(w, d), roofMat);
    roof.rotation.x = -Math.PI / 2;
    roof.position.y = h / 2;
    roof.receiveShadow = true;
    roof.onBeforeRender = () => { roofMat.opacity = mat.opacity; roofMat.depthWrite = mat.depthWrite; };
    mesh.add(roof);
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
  // Footprints and heights from OpenStreetMap (NYC survey data), measured in
  // the Manhattan grid from the 56th St building line: Z(o) maps an OSM
  // offset (m north of the building's centre, building line at +15.8) to
  // scene z. Block depth 56th→55th building lines is ~61 m.
  const Z = (o) => front + o - 15.8;
  const zS56 = streetZ(-1) + road / 2 + walk; // 55th St building line
  const zN56 = streetZ(1) - road / 2 - walk; // 57th St building line
  // Tower 56 (east, x -27.9…-9.8): 30 m podium with four slanted louvred
  // setbacks across its front 5.2 m, 33-storey (118 m) tower behind.
  {
    const parts = [];
    const x0 = -27.9;
    const run = 1.3;
    parts.push(block('glass', x0, eastX, Z(-14.4), front, 10));
    const steps = [[10, 15, run], [15, 20, 2 * run], [20, 25, 3 * run], [25, 30, 4 * run]];
    const slopeMat = new THREE.MeshStandardMaterial({ color: '#9fb7c8', metalness: 0.6, roughness: 0.1, transparent: true, opacity: 1, envMapIntensity: 1.6 });
    for (const [y0, y1, set] of steps) {
      parts.push(block('louver', x0, eastX, Z(-14.4), front - set, y1 - y0, y0));
      const slope = new THREE.Mesh(new THREE.PlaneGeometry(eastX - x0, Math.hypot(run, 1.6)), slopeMat);
      slope.rotation.x = -Math.atan2(run, 1.6);
      slope.position.set((x0 + eastX) / 2, y0 + 0.8, front - set + run / 2);
      scene.add(slope);
      parts.push(slope);
    }
    parts.push(block('banded', x0, eastX, Z(-14.4), Z(10.6), 88, 30));
    group(parts);
    // Zimbabwe House (5 storeys) and the 44.7 m building at the Lexington corner.
    block('prewar', -40.5, x0 - 0.05, Z(-13.6), front, 17.2);
    block('prewar', -73.9, -40.55, Z(-26.8), front, 44.7, 0, { fade: false });
  }

  // West: 425 Park Avenue's fluted service core is built tight against the
  // west wall. Its 45 m front block is set back 4.4 m from the building line,
  // leaving the front strip of the wall (with the lease banner) exposed; the
  // core then steps to 110 m and to the 219–262 m fins of the tower crown.
  {
    const x0 = W / 2 + 0.02;
    const x1 = 20.5;
    slab(W / 2, x1, Z(11.4), front); // open paving in front of it
    const parts = [
      block('fluted', x0, x1, Z(5.1), Z(11.4), 45),
      block('fluted', x0, x1, Z(2.1), Z(5.1), 110),
      block('fluted', x0, x1, Z(-31.4), Z(2.1), 219),
      block('fluted', x0, x1, Z(-35.6), Z(-31.4), 110),
      block('fluted', x0, x1, Z(-40.5), Z(-35.6), 45),
    ];
    for (const [a, b, h] of [[-9.0, -6.8, 242], [-4.4, -1.7, 242], [-13.3, -11.1, 242], [-17.9, -15.7, 242], [-22.1, -20.0, 242], [-26.8, -24.5, 242],
      [-6.9, -4.2, 262], [-15.8, -13.2, 262], [-24.7, -22.0, 262]]) parts.push(block('fluted', x0 + 0.3, x1 - 0.3, Z(a), Z(b), h - 219, 219));
    group(parts);
    // A 4-storey annex of 425 Park behind our rear yard.
    block('brickwall', 5.1, x0 - 0.05, zS56, Z(-23.7), 16);
  }

  // 425 Park Avenue — SE corner of Park & 56th (Foster + Partners): glass
  // lobby under a canopy, then three setback tiers (45 / 110 / 219 m).
  {
    const x0 = 20.55;
    const x1 = PK.eastLine;
    const parts = [
      block('glass', 22.2, x1 - 2.4, zS56 + 4, Z(8.0), 10),
      block('glass', x0, x1, zS56 + 2.6, Z(13.6), 35, 10),
      block('glass', x0, 43.1, Z(-38.2), Z(9.2), 65, 45),
      block('glass', x0, 38.8, Z(-33.8), Z(4.8), 109, 110),
    ];
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#e7e6e2', roughness: 0.6, transparent: true, opacity: 1 });
    for (const [cx0, cx1, cz0, cz1] of [[x0, x1 + 0.5, Z(8.0) - 0.5, front + 1.2], [x1 - 2.6, x1 + 0.5, zS56, front + 1.2]]) {
      const canopy = new THREE.Mesh(new THREE.BoxGeometry(cx1 - cx0, 0.8, cz1 - cz0), canopyMat);
      canopy.position.set((cx0 + cx1) / 2, 9.6, (cz0 + cz1) / 2);
      canopy.castShadow = true;
      scene.add(canopy);
      parts.push(canopy);
    }
    group(parts);
  }

  // Behind (south, the north side of 55th St), east to west.
  block('prewar', -12.4, 5.05, zS56, Z(-23.7), 56.4); // 115 E 55th
  block('tenement', -18.4, -12.45, zS56, Z(-23.7), 18.1); // 119 E 55th
  block('prewar', -35.0, -18.45, zS56, Z(-15.1), 41.6); // 123 E 55th
  block('banded', -46.6, -35.05, zS56, Z(-24.1), 106); // Concorde Hotel
  block('tenement', -73.9, -46.65, zS56, Z(-26.9), 20, 0, { fade: false });

  // Across E 56th (north side), east to west.
  block('prewar', -73.6, -38.65, acrossZ, Z(64.6), 45, 0, { fade: false });
  block('redtenement', -38.6, -32.75, acrossZ, Z(64.6), 19.2); // 127 E 56th
  block('tenement', -32.7, -26.65, acrossZ, Z(64.6), 18.6); // 125 E 56th
  block('prewar', -26.6, 22.05, acrossZ, Z(64.7), 68.9); // Lombardy Hotel
  {
    // 445 Park Avenue — NE corner: banded office block over shops, stepping
    // back in wedding-cake setbacks from 46 m to 80 m.
    const x0 = 22.1;
    const shopMat = new THREE.MeshStandardMaterial({ color: '#23272b', roughness: 0.4, metalness: 0.3, transparent: true, opacity: 1 });
    const shops = new THREE.Mesh(new THREE.BoxGeometry(PK.eastLine - x0 + 0.2, 5, zN56 - acrossZ + 0.2), shopMat);
    shops.position.set((x0 + PK.eastLine) / 2, 2.5, (acrossZ + zN56) / 2);
    scene.add(shops);
    const parts = [shops, block('banded', x0, PK.eastLine, acrossZ, zN56, 41, 5)];
    for (const [y0, y1, x1, z0, z1] of [[46, 52, PK.eastLine, 40.9, 95.3], [52, 58, 46.1, 40.9, 92], [58, 64, 43.1, 40.9, 88.8], [64, 70, 39.5, 44.6, 86.3], [70, 80, 35.9, 47.2, 83]]) {
      parts.push(block('banded', x0, x1, Z(z0), Math.min(Z(z1), zN56), y1 - y0, y0));
    }
    group(parts);
  }
  // Corners west of Park Avenue: 6-storey corner building under the 124 m
  // Franklin National Bank tower (NW); 70 m corner block and the stepped
  // Park Avenue Tower (SW).
  {
    const wl = PK.westLine;
    block('prewar', wl, wl + 21, acrossZ, Z(56), 39);
    block('glass', wl, wl + 21, Z(56), zN56, 124.3);
    block('banded', wl, wl + 21, zS56, front, 70);
    group([
      block('glass', wl + 21.1, wl + 55, zS56, front, 40),
      block('glass', wl + 24.8, wl + 55, Z(-21.8), Z(13.8), 110, 40),
      block('glass', wl + 30.6, wl + 52.7, Z(-15.2), Z(7.4), 21, 150),
    ]);
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
  // site.frontVans === false keeps the kerb in front clear so the shopfronts show.
  if (site.frontVans !== false) {
    vehicle(-14, lane);
    vehicle(-4, lane, { len: 5.4, ht: 2.3 });
    vehicle(7, lane);
    if (16 < PK.eastLine - 3) vehicle(16, lane, { len: 4.6, ht: 1.5, body: new THREE.MeshStandardMaterial({ color: '#d7d9db', roughness: 0.3, metalness: 0.5 }), cabin: 0.5 });
    vehicle(2, front + walk + 5.2, { len: 4.8, ht: 1.6, body: yellow, cabin: 0.5 });
  }
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

  // Footprints / heights from OpenStreetMap (NYC survey data), in the
  // Manhattan grid: Z(o) maps an OSM offset (m north of the building's
  // centre; 38th St building line at +14.4) to scene z.
  const Z = (o) => front + o - 14.4;
  const netX = -23.2; // 14 E 38th: x -23.2…-7.8, 52.4 m

  // East: 14 E 38th (52.4 m), a pre-war loft building. Its facade work is
  // finished: no more netting or pipe scaffold.
  block('prewar', netX, eastX, Z(-10.5), front, 52.4);

  // West: the ornate limestone building (46.6 m, deep dark cornice) runs
  // 61 m along 38th St to the Fifth Avenue corner, 37 m deep, with a leg
  // back to 37th St.
  {
    const x1 = PK.eastLine;
    const z0 = Z(-22.6);
    const h = 46.6;
    const base = block('glass', westX, x1, z0, front, 9);
    const body = block('beaux', westX, x1, z0, front, h - 9, 9);
    const leg = block('beaux', 10.3, 30.1, zS, z0 - 0.05, h);
    const corniceMat = new THREE.MeshStandardMaterial({ color: '#26282a', roughness: 0.7, transparent: true, opacity: 1 });
    // The cornice is a projecting band along 38th St and Fifth Av only; its
    // top sits 0.15 m below the roof so the two never share a plane
    // (previously a full-depth slab coplanar with the roof z-fought).
    const cH = 2.4;
    const cTop = h - 0.15;
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(x1 - westX + 0.7, cH, 2.6), corniceMat);
    cornice.position.set((westX + x1) / 2 + 0.45, cTop - cH / 2, front + 0.5);
    const corniceAv = new THREE.Mesh(new THREE.BoxGeometry(2.6, cH - 0.1, front - z0 - 0.2), corniceMat);
    corniceAv.position.set(x1 + 0.5, cTop - 0.05 - (cH - 0.1) / 2, (z0 + front) / 2);
    corniceAv.castShadow = true;
    scene.add(corniceAv);
    cornice.castShadow = true;
    scene.add(cornice);
    const bracketMat = new THREE.MeshStandardMaterial({ color: '#1d1f21', roughness: 0.7, transparent: true, opacity: 1 });
    const brackets = new THREE.InstancedMesh(new THREE.BoxGeometry(0.35, 1.4, 1.6), bracketMat, Math.ceil((x1 - westX) / 1.6));
    const mm = new THREE.Matrix4();
    for (let i = 0; i < brackets.count; i++) brackets.setMatrixAt(i, mm.makeTranslation(westX + 0.8 + i * 1.6, h - 3.1, front + 0.8));
    scene.add(brackets);
    const band = new THREE.Mesh(new THREE.BoxGeometry(x1 - westX, 1.2, 0.5), new THREE.MeshStandardMaterial({ color: '#cfc4ae', roughness: 0.8, transparent: true, opacity: 1 }));
    band.position.set((westX + x1) / 2, 9.6, front + 0.25);
    scene.add(band);
    group([base, body, cornice, corniceAv, brackets, band]);
    group([leg]);
    // The 37th St / Fifth corner (44.5 m).
    block('prewar', 30.15, x1, zS, z0 - 0.05, 44.5, 0, { fade: false });
  }

  // Behind (north side of 37th St), with a ~6.6 m yard behind our building.
  block('prewar', -6.2, 10.25, zS, Z(-21.1), 47.1); // 9 E 37th
  block('tenement', -13.7, -6.25, zS, Z(-19.3), 28.5); // 13 E 37th
  block('banded', -59.4, -13.75, zS, Z(-15.3), 56.5); // 232 Madison

  // Further east on our side: a 56 m sliver, then the 65 m Madison corner.
  block('prewar', -30.8, netX - 0.05, Z(-7.1), Z(12.7), 56.3);
  block('banded', -59.5, -30.85, Z(-15.5), Z(14.1), 65, 0, { fade: false });
  slab(-70, -59.5, zS, front, 0.165); // corner paving toward Madison Av

  // Across E 38th (north side), east to west.
  {
    // 260 Madison: 40 m street wall stepping back to 91 m.
    const parts = [block('prewar', -59.1, -14.2, acrossZ, zN, 40)];
    for (const [y0, y1, x0, z0, z1] of [[40, 52, -53.7, 37.8, 89.2], [52, 64, -47.4, 42.7, 83.2], [64, 76, -41.8, 48.2, 77.6], [76, 91, -36.4, 56.7, 69.3]]) {
      parts.push(block('prewar', x0, -14.25, Z(z0), Math.min(Z(z1), zN), y1 - y0, y0));
    }
    group(parts);
  }
  block('banded', -14.15, 0.1, acrossZ, zN, 43.5);
  block('glass', 0.15, 11.4, acrossZ, zN, 90); // Hyatt Centric (height not in OSM; estimated)
  block('prewar', 11.45, 22.7, acrossZ, zN, 46.5);
  block('beaux', 22.75, 35.05, acrossZ, Z(55), 30); // not in OSM; estimated
  {
    // 425 Fifth Avenue: 41 m podium, 188 m tower set close to the street.
    const parts = [block('beaux', 35.1, PK.eastLine, acrossZ, Z(56.7), 41)];
    for (const [y0, y1, x0, x1, z0, z1] of [[41, 85, 39.8, 66.3, 34.6, 56.7], [85, 133, 40.8, 65.3, 35.2, 56.6], [133, 188, 42.8, 63.2, 36.8, 54.8]]) {
      parts.push(block('glass', x0, x1, Z(z0), Z(z1), y1 - y0, y0));
    }
    group(parts);
    block('prewar', 34.6, PK.eastLine, Z(56.75), zN, 31, 0, { fade: false });
  }
  // West of Fifth: 420 Fifth (40 m podium, 119 m tower) on our side, the
  // 61 m former Lord & Taylor block across 38th, 8 W 38th beyond.
  {
    const wl = PK.westLine;
    group([
      block('banded', wl, wl + 44, zS, front, 40),
      block('glass', wl + 4, wl + 40, Z(-34.8), Z(5.8), 79.2, 40),
    ]);
    block('beaux', wl, wl + 55.9, acrossZ, zN, 61.4);
    block('prewar', wl + 44.05, wl + 55.9, Z(-19.3), front, 47, 0, { fade: false });
  }

  // Empire State Building: west side of Fifth between 33rd and 34th St.
  empireState(scene, PK.westLine + 64, streetZ(-5) + road / 2 + walk, streetZ(-4) - road / 2 - walk);

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

  // Footprints / heights from OpenStreetMap (NYC survey data). Z(o) maps an
  // OSM offset (m north of the building's centre; 23rd St building line at
  // -5.0) to local z (front = +z = south). Local x = west, as in OSM.
  const Z = (o) => front - (o + 5.0);

  // West: the 21.4 m (six-storey) cream lofts with New York Sports Clubs at
  // grade run all the way to the Park Avenue South corner, 33 m deep.
  const loftA = block('prewar', westX, westX + 20, Z(28.2), front, 21.4);
  const loftB = block('prewar', westX + 20.1, PK.eastLine - 9, Z(28.2), front, 21.4);
  const loftC = block('beaux', PK.eastLine - 8.9, PK.eastLine, Z(28.2), front, 21.4);
  const orange = new THREE.MeshStandardMaterial({ color: '#ef6a1f', roughness: 0.6 });
  for (const x of [westX + 4, westX + 13, westX + 24, westX + 33]) {
    const sgn = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.7, 0.25), orange);
    sgn.position.set(x, 3.6, front + 0.15);
    scene.add(sgn);
  }
  group([loftA, loftB, loftC]);

  // Behind the lofts: the 81.9 m brick building, its south wall facing 23rd St
  // above the lofts (plain brick; no mural).
  const muralBldg = block('brickwall', 11, PK.eastLine, Math.max(zS, Z(56.8)), Z(24.9), 81.9);
  group([muralBldg]);

  // East: 119 E 23rd, the 70.5 m red-brick residential tower built against
  // our east wall on a stone retail podium, with street trees in front; then
  // two 25 m walk-ups, the low Gramercy Theatre and the Lexington corner.
  const podium = block('beaux', -25.4, eastX, Z(28.1), front, 9);
  const tower = block('redtower', -25.4, eastX, Z(28.1), front - 0.8, 61.5, 9);
  group([podium, tower]);
  block('tenement', -34.0, -25.45, Z(24.7), front, 25.4); // 123 E 23rd
  block('redtenement', -42.6, -34.05, Z(24.1), front, 25.0); // 125 E 23rd
  block('stucco', -58.3, -42.65, Z(29.4), front, 10.7); // Gramercy Theatre
  block('prewar', -73.3, -58.35, Z(24.2), front, 46.6, 0, { fade: false });
  const leaf = new THREE.MeshStandardMaterial({ color: '#4f8a35', roughness: 1 });
  const trunk = new THREE.MeshStandardMaterial({ color: '#4a3a2c', roughness: 1 });
  for (const x of [eastX - 4, eastX - 13, eastX - 29]) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.2, 3.4, 8), trunk);
    t.position.set(x, 1.7, front + walk - 1.1);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6, 1), leaf);
    crown.position.set(x, 5.6, front + walk - 1.1);
    crown.scale.set(1.2, 1, 1.1);
    for (const o of [t, crown]) { o.castShadow = true; scene.add(o); }
  }

  // Behind our lot (south side of 24th St), across a ~10 m yard.
  block('tenement', -19.8, 10.95, zS, Z(32.4), 19.9); // 124 E 24th
  block('redtenement', -44.1, -19.85, zS, Z(26.6), 18.8);
  block('tenement', -57.9, -44.15, zS, Z(39.7), 16.2);
  block('prewar', -73.2, -57.95, zS, Z(30.4), 19.9, 0, { fade: false });
  // Across 23rd Street (south side), east to west.
  block('prewar', -73.6, -27.55, acrossZ, zN, 44.2);
  block('banded', -27.5, 3.0, acrossZ, zN, 46.1);
  block('tenement', 3.05, 10.4, acrossZ, Z(-65.8), 16.9); // 112 E 23rd
  block('prewar', 10.45, 18.1, acrossZ, Z(-62.7), 37.0); // 110 E 23rd
  block('banded', 18.15, PK.eastLine, acrossZ, Z(-78.1), 48.4);
  block('prewar', 3.05, PK.eastLine, Z(-78.15), zN, 40.8, 0, { fade: false });
  // West of Park Avenue South: the MetLife office complex fills the block
  // (40 m base, 119–142 m slabs); 304 Park Av S and the 237 m tower at
  // 45 E 22nd across 23rd.
  {
    const wl = PK.westLine;
    group([
      block('banded', wl, wl + 55.9, zS, front, 40),
      block('banded', wl + 5.7, wl + 55.9, Z(26.4), Z(6.2), 89, 40),
      block('banded', wl + 9.9, wl + 32.4, Z(40), Z(26.45), 79, 40),
      block('banded', wl + 32.4, wl + 55.9, Z(40.4), Z(24.5), 101.8, 40),
    ]);
    block('prewar', wl, wl + 53, acrossZ, Z(-68.4), 58.8); // 304 Park Av S
    block('glass', 124, 145, Z(-65.7) + 3, Z(-93.8) - 3, 237, 0, { fade: false }); // 45 E 22nd
  }

  // MetLife clock tower (Madison Ave & 23rd–24th St), west beyond Park Ave S.
  {
    const cx = PK.westLine + 118;
    const cz = Z(44.1);
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
  // Footprints, widths and heights from NYC building survey data (OSM),
  // measured along 21st St from the building's centre (x = 0, +x = east).
  const zS = streetZ(-1) + road / 2 + walk;
  const zN = streetZ(1) - road / 2 - walk;
  const westX = -W / 2 - 0.02;
  const eastX = W / 2 + 0.02;
  const rear22 = front - 33.4; // back of the lots facing 22nd St

  // West: Nos. 143 and 145 — a five-storey tan-brick loft read as one front
  // (16.2 m / 15.8 m, No. 145 only 16 m deep), the blue-panelled No. 151
  // (15.8 m), then the 50 m "Casa" block.
  block('prewar', westX - 6, westX, front - 30, front, 16.2);
  block('prewar', westX - 12, westX - 6.05, front - 16, front, 15.8);
  block('glass', westX - 36, westX - 12.05, front - 30, front, 15.8);
  block('redtower', westX - 57, westX - 36.05, front - 30, front, 50.6);

  // East, toward Sixth Avenue: narrow ornate No. 131 (13.2 m), the modern
  // grey No. 125 with roof planting (49.4 m), brick No. 117 (19 m), then the
  // big corner building with a dark cornice (30.3 m) wrapping to 22nd St.
  block('beaux', eastX, eastX + 7, front - 26, front, 13.2);
  const modern = block('whitegrid', eastX + 7.05, eastX + 36, front - 30, front, 49.4);
  const green = new THREE.MeshStandardMaterial({ color: '#4c7f36', roughness: 1, transparent: true, opacity: 1 });
  const planting = new THREE.Mesh(new THREE.BoxGeometry(26, 1.4, 3), green);
  planting.position.set(eastX + 21.5, 50.1, front - 2);
  scene.add(planting);
  group([modern, planting]);
  block('brickwall', eastX + 36.05, eastX + 50, front - 30, front, 19.0);
  const older = block('beaux', eastX + 50.05, PK.eastLine, zS, front, 30.3);
  const cor = new THREE.Mesh(new THREE.BoxGeometry(PK.eastLine - eastX - 50 + 0.4, 1.6, 1.4), new THREE.MeshStandardMaterial({ color: '#2b3a36', roughness: 0.7, transparent: true, opacity: 1 }));
  cor.position.set((eastX + 50 + PK.eastLine) / 2, 30.4, front + 0.4);
  scene.add(cor);
  group([older, cor]);
  // Street trees along the east sidewalk.
  const leaf = new THREE.MeshStandardMaterial({ color: '#4f8a35', roughness: 1 });
  const trunk = new THREE.MeshStandardMaterial({ color: '#4a3a2c', roughness: 1 });
  for (const x of [eastX + 14, eastX + 22, eastX + 30, eastX + 44, eastX + 58]) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 3, 8), trunk);
    t.position.set(x, 1.5, front + walk - 1);
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(1.7, 1), leaf);
    c.position.set(x, 4.4, front + walk - 1);
    c.scale.set(0.9, 1.3, 0.9);
    for (const o of [t, c]) { o.castShadow = true; scene.add(o); }
  }

  // Behind: the south side of 22nd St (Nos. 156 to 116), lot by lot.
  for (const [kind, x0, x1, h] of [
    ['tenement', -66, -57.05, 13.2], ['banded', -57, -39.05, 45.5], ['prewar', -39, -28.05, 41.5],
    ['brickwall', -28, -8.05, 46.0], ['prewar', -8, 5.35, 35.3], ['beaux', 5.4, 17.5, 50.5],
    ['whitegrid', 17.55, 34.95, 50.5], ['prewar', 35, 55.95, 45.8], ['brickwall', 56, eastX + 49.95, 39.1],
  ]) block(kind, x0, x1, zS, rear22, h);

  // Across 21st St (south side): No. 150 (19.4 m), low No. 142 (8.3 m),
  // Nos. 136 and 132 (45.5 / 46.1 m), the long No. 120 (44.5 m), then the
  // corner toward Sixth Avenue.
  block('redtenement', -72, -55.05, acrossZ, zN, 19.4);
  block('tenement', -55, -30.55, acrossZ, zN, 8.3);
  block('brickwall', -30.5, -6.35, acrossZ, zN, 45.5);
  block('prewar', -6.3, 7.65, acrossZ, zN, 46.1);
  block('beaux', 7.7, 64.8, acrossZ, zN, 44.5);
  block('prewar', 64.85, PK.eastLine, acrossZ, zN, 30);
  block('glass', PK.westLine, PK.westLine + 50, acrossZ, zN, 80);
  block('prewar', PK.westLine, PK.westLine + 50, zS, front, 36);
}

// ---------------------------------------------------------------------------
// 102 W 38th St neighbours. The building faces north and the site is
// mirrored, so local +x points east toward Sixth Avenue.
function neighbours102w38({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK }) {
  // Widths and heights from NYC building survey data (OSM); x is measured
  // along 38th St from the building's centre (+x = east, toward Sixth Ave).
  const zS = streetZ(-1) + road / 2 + walk;
  const zN = streetZ(1) - road / 2 - walk;
  const eastX = W / 2 + 0.02;
  const westX = -W / 2 - 0.02;

  // East: the low corner group at Sixth Avenue — the pink four-storey front
  // on 38th St with the black-awninged Polish Me (14.5 m), then Nos. 1015,
  // 1013 and 1011 Sixth Avenue (14.8 / 15.4 / 15.7 m), 18 m deep.
  const pink = block('stucco', eastX, PK.eastLine, front - 7, front, 14.5);
  const awnMat = new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.6, transparent: true, opacity: 1 });
  const awn = new THREE.Mesh(new THREE.BoxGeometry(7.6, 1.0, 1.4), awnMat);
  awn.position.set(eastX + 4, 3.6, front + 0.6);
  scene.add(awn);
  group([pink, awn]);
  block('tenement', eastX, PK.eastLine, front - 15, front - 7.05, 14.8);
  block('redtenement', eastX, PK.eastLine, front - 23, front - 15.05, 15.4);
  block('tenement', eastX, PK.eastLine, front - 31, front - 23.05, 15.7);

  // Behind: 1001 Sixth Avenue, the dark-brick stepped tower on the 37th St
  // half of the block (63 / 71 m wings, 87 m shaft, 95 m crown).
  {
    const shaft = block('darkgrid', westX - 4, eastX + 10, zS, front - 31.05, 87);
    const crown = block('darkgrid', westX + 3, eastX + 5, front - 48, front - 41, 8, 87);
    block('darkgrid', eastX + 10.05, PK.eastLine, zS, front - 31.1, 71);
    group([shaft, crown]);
  }

  // West: the 30 m-wide buff ornate loft (front ~50 m) and its stepped tower
  // behind, crowned by a lantern at the surveyed 80.8 m.
  const loft = block('beaux', westX - 30, westX, front - 24, front, 50);
  const t1 = block('prewar', westX - 28, westX - 2, front - 36, front - 24.2, 62);
  const t2 = block('prewar', westX - 25, westX - 5, front - 33, front - 27, 72);
  const lantern = block('beaux', westX - 18, westX - 12, front - 32, front - 28, 8.8, 72);
  group([loft, t1, t2, lantern]);
  // Further west, the 89.6 m tower, and the 12-storey (45.5 m) building
  // behind on the 37th St side.
  block('banded', -74, westX - 30.05, front - 30, front, 89.6);
  block('prewar', -74, westX - 4.05, zS, front - 36.6, 45.5);

  // Across West 38th Street (north side), west to east: a 67 m slab, a
  // wedding-cake setback building climbing from 33 to 81 m, No. 109
  // (43.7 m), then a low 14.5 m strip to the corner with the 133 m tower
  // rising behind it from the 39th St half of the block.
  block('banded', -74, -37.55, acrossZ, zN, 67);
  {
    const tiers = [[0, 2.5, 33], [2.5, 5, 50], [5, 8, 67], [8, 30, 81]];
    const parts = tiers.map(([d0, d1, h]) => block('prewar', -37.5, -22.55, acrossZ + d0, acrossZ + d1 - 0.05, h));
    group(parts);
  }
  block('beaux', -22.5, -13.05, acrossZ, zN, 43.7);
  block('tenement', -13, PK.eastLine, acrossZ, acrossZ + 28, 14.5);
  block('glass', -8, 18, acrossZ + 28.05, zN, 133);

  // East of Sixth Avenue: a 65 m podium on the 38th St corner with a 132 m
  // tower, low walk-ups (9-16 m) further south; banded offices to the north.
  block('banded', PK.westLine, PK.westLine + 36, front - 24, front, 65);
  block('glass', PK.westLine + 5, PK.westLine + 34, front - 22, front - 3, 67, 65);
  block('tenement', PK.westLine, PK.westLine + 18, zS, front - 24.05, 12.5);
  block('banded', PK.westLine, PK.westLine + 50, acrossZ, zN, 90);
}

// Empire State Building, stepped tiers + mast, centred at (cx, between z0..z1).
function empireState(scene, cx, z0, z1) {
  {
    const cz = (z0 + z1) / 2;
    const tex = facadeTexture('esb', 3);
    const esbRoof = new THREE.MeshStandardMaterial({ color: '#9d9a93', roughness: 0.9 });
    const tier = (w, d, y0, y1) => {
      const g = new THREE.BoxGeometry(w, y1 - y0, d);
      const uv = g.attributes.uv;
      const dims = [[d, y1 - y0], [d, y1 - y0], [w, d], [w, d], [w, y1 - y0], [w, y1 - y0]];
      for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / 10, uv.getY(i) * dims[f][1] / 14); }
      // Setback roofs (+y face, group 2) get plain stone, not the window texture.
      const wall = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6, metalness: 0.15 });
      const mesh = new THREE.Mesh(g, [wall, wall, esbRoof, wall, wall, wall]);
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
  // Widths and heights from NYC building survey data (OSM); x is measured
  // along 36th St from the building's centre (+x = east, toward Fifth Ave).
  const zS = streetZ(-1) + road / 2 + walk;
  const zN = streetZ(1) - road / 2 - walk;
  const eastX = W / 2 + 0.02;
  const westX = -W / 2 - 0.02;

  // East: the narrow cream loft and the Gorham Building (390 Fifth Ave:
  // white stone, arcaded base, green copper cornice), both 43.4 m, running
  // ~48 m to the Fifth Avenue corner; No. 384 Fifth (32.3 m) south of it.
  block('beaux', eastX, eastX + 8, front - 24, front, 43.4);
  const gx0 = eastX + 8.05;
  const gx1 = PK.eastLine;
  const gor = block('beaux', gx0, gx1, front - 30, front, 43.4);
  const copper = new THREE.MeshStandardMaterial({ color: '#4f8a72', roughness: 0.6, metalness: 0.3, transparent: true, opacity: 1 });
  const cor = new THREE.Mesh(new THREE.BoxGeometry(gx1 - gx0 + 1.2, 2.0, 2.4), copper);
  cor.position.set((gx0 + gx1) / 2, 42.4, front + 0.6);
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
  block('prewar', PK.eastLine - 31, PK.eastLine, front - 39, front - 30.05, 32.3);

  // West: the four-level open parking garage (11.5 m, ~15 m frontage), then
  // No. 16 (49.6 m), No. 20 (46.2 m) and No. 28 (44.5 m).
  const deck = new THREE.MeshStandardMaterial({ color: '#8d8b86', roughness: 0.9, transparent: true, opacity: 1 });
  const steel = new THREE.MeshStandardMaterial({ color: '#2d3540', roughness: 0.5, metalness: 0.5, transparent: true, opacity: 1 });
  const parts = [];
  const gw = 15;
  const gx = westX - gw / 2;
  for (const y of [0.1, 3.6, 7.1, 10.6]) {
    const sl = new THREE.Mesh(new THREE.BoxGeometry(gw, 0.3, 30), deck);
    sl.position.set(gx, y, front - 15);
    sl.receiveShadow = true;
    scene.add(sl); parts.push(sl);
  }
  for (let x = westX - gw + 0.3; x < westX; x += 4.9) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(0.35, 11, 0.35), steel);
    c.position.set(x, 5.5, front - 0.4);
    scene.add(c); parts.push(c);
  }
  const rail = new THREE.Mesh(new THREE.BoxGeometry(gw, 0.9, 0.08), steel);
  rail.position.set(gx, 11.5, front - 0.3);
  scene.add(rail); parts.push(rail);
  const carCols = ['#c9ccd0', '#2b2f36', '#8c1d1d', '#e5e5e2', '#4a5563'];
  let ci = 0;
  for (const y of [3.75, 7.25, 10.75]) {
    for (let x = westX - gw + 2; x < westX - 1.5; x += 3.2) {
      const car = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.3, 4.4), new THREE.MeshStandardMaterial({ color: carCols[ci++ % carCols.length], roughness: 0.35, metalness: 0.5, transparent: true, opacity: 1 }));
      car.position.set(x, y + 0.65, front - 3);
      scene.add(car); parts.push(car);
    }
  }
  group(parts);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(0.15, 4.2, 0.8), new THREE.MeshStandardMaterial({ color: '#111', roughness: 0.5 }));
  sign.position.set(westX - 1.6, 8.0, front + 0.5);
  scene.add(sign);
  block('prewar', westX - 31, westX - gw - 0.05, front - 30, front, 49.6);
  block('banded', westX - 51, westX - 31.05, front - 30, front, 46.2);
  block('prewar', westX - 66, westX - 51.05, front - 30, front, 44.5);

  // Behind (35th St half of the block): a 55.3 m building right behind
  // No. 8, a 49.5 m one toward Fifth, a five-storey building behind No. 16,
  // and the rest of the garage deck.
  block('banded', westX - 0.6, eastX + 20, zS, front - 30.2, 55.3);
  block('prewar', eastX + 20.05, PK.eastLine, zS, front - 39.05, 49.5);
  block('tenement', westX - 35, westX - gw - 0.05, zS, front - 30.05, 17);
  {
    const sl = new THREE.Mesh(new THREE.BoxGeometry(gw - 0.7, 11.5, zS - front + 30), deck);
    sl.position.set(gx - 0.35, 5.75, (zS + front - 30) / 2);
    sl.castShadow = sl.receiveShadow = true;
    scene.add(sl);
  }

  // Across West 36th Street, west to east: No. 19 (45.5 m), No. 15
  // (61.4 m), Nos. 13 and 11 (27 / 23.4 m), No. 7 (58 m), No. 3 (23
  // storeys), then 400 Fifth Avenue — a 40 m podium with its 193 m tower.
  for (const [kind, x0, x1, h] of [
    ['prewar', -71, -55.65, 45], ['banded', -55.6, -40.65, 45.5], ['prewar', -40.6, -27.05, 61.4],
    ['redtenement', -27, -20.75, 27], ['tenement', -20.7, -12.7, 23.4], ['beaux', -12.65, 3.2, 58],
    ['banded', 3.25, 15.8, 84],
  ]) block(kind, x0, x1, acrossZ, zN, h);
  block('prewar', 15.85, PK.eastLine, acrossZ, zN, 40);
  block('glass', 20.8, 46.8, acrossZ + 11, acrossZ + 45, 153, 40);
  block('glass', PK.westLine, PK.westLine + 50, zS, front, 110);
  block('banded', PK.westLine, PK.westLine + 50, acrossZ, zN, 80);

  // Empire State Building two blocks south, on this (west) side of Fifth.
  empireState(scene, PK.eastLine - 64, streetZ(-3) + road / 2 + walk, streetZ(-2) - road / 2 - walk);
}

// ---------------------------------------------------------------------------
// 12 E 44th St neighbours. Faces north; local +x is west, toward Fifth Ave.
function neighbours12e44({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK }) {
  // Positions and heights from the OSM / NYC building footprints (x west+,
  // z north+, the subject centred). 44th St is 19.6 m between building lines,
  // Fifth's east building line is at x = 72, Madison's west line at x = -55.6.
  const zS = streetZ(-1) + road / 2 + walk; // 43rd St north building line (~ -47)
  const zN = streetZ(1) - road / 2 - walk;
  const eastX = -W / 2 - 0.02;
  const westX = W / 2 + 0.02;
  const MAD = -55.6;

  // East: 14 E 44th (7.6 m wide, 19.9 m) — red-brick base with arched
  // windows and a black Bread & Butter sign, grey-green painted upper floors
  // under a deep dark cornice; its 20 m rear wing wraps behind.
  const low = block('brickwall', eastX - 7.63, eastX, -13.8, front, 8);
  const up = block('prewar', eastX - 7.63, eastX, -13.8, front, 11.9, 8);
  up.material.color.set('#aab5a9');
  const black = new THREE.MeshStandardMaterial({ color: '#141516', roughness: 0.5, transparent: true, opacity: 1 });
  const bb = textTexture({ text: 'BREAD & BUTTER', width: 1024, height: 96, bg: '#141516', ink: '#f2ede2', font: '600 58px Georgia, serif' });
  const sign = new THREE.Mesh(new THREE.BoxGeometry(7.3, 0.8, 0.2), [black, black, black, black, new THREE.MeshStandardMaterial({ map: bb, roughness: 0.5, transparent: true, opacity: 1 }), black]);
  sign.position.set(eastX - 3.82, 3.9, front + 0.12);
  scene.add(sign);
  const cor = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.6, 0.8), black);
  cor.position.set(eastX - 3.82, 19.5, front + 0.35);
  scene.add(cor);
  group([low, up, sign, cor]);
  const wingA = block('brickwall', -16.4, eastX, -23.1, -13.82, 20);
  const wingB = block('brickwall', -16.4, eastX - 7.65, -13.82, -3.6, 20);
  group([wingA, wingB]);

  // 340 Madison Avenue: through-block office building from 14 E 44th to
  // Madison, 62 m with setbacks to 72 and 81.8 m, and an 81.8 m rear wing
  // reaching behind this building.
  {
    const tint = (m) => { m.material.color.set('#d9cdb6'); return m; };
    const parts = [
      tint(block('prewar', MAD, eastX - 7.67, -3.6, front - 0.1, 62)),
      tint(block('prewar', MAD, -16.45, zS, -3.62, 62)),
      tint(block('prewar', MAD + 2.8, eastX - 7.67, zS + 1.1, front - 3.0, 10, 62)),
      tint(block('prewar', MAD + 6, -16.45, zS + 3.2, front - 6.6, 9.8, 72)),
      tint(block('prewar', -16.4, -1.45, zS, -23.15, 81.8)),
    ];
    group(parts);
  }

  // Madison Avenue (one-way north), 24 m between building lines.
  {
    const asphalt = new THREE.MeshStandardMaterial({ color: '#36373a', roughness: 0.95 });
    const walkMat = new THREE.MeshStandardMaterial({ color: '#b3afa7', roughness: 0.95 });
    const xs = [MAD - 24, MAD - 19.5, MAD - 4.5, MAD];
    const mad = new THREE.Mesh(new THREE.BoxGeometry(xs[2] - xs[1], 0.172, 900), asphalt);
    mad.position.set((xs[1] + xs[2]) / 2, 0.086, 0);
    mad.receiveShadow = true;
    scene.add(mad);
    const lines = new THREE.MeshBasicMaterial({ color: '#d9d6cc' });
    for (let z = -400; z < 400; z += 9) {
      const kk = Math.round((z - streetZ(0)) / (streetZ(1) - streetZ(0)));
      if (Math.abs(z - streetZ(kk)) < road / 2 + 2) continue;
      for (const dx of [3.75, 7.5, 11.25]) {
        const l = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 3), lines);
        l.rotation.x = -Math.PI / 2;
        l.position.set(xs[1] + dx, 0.175, z);
        scene.add(l);
      }
    }
    // Avenue sidewalks between the cross streets; the cross streets' own
    // asphalt is covered by a patch where they meet the avenue.
    for (let k = -5; k < 5; k++) {
      const z0 = streetZ(k) + road / 2;
      const z1 = streetZ(k + 1) - road / 2;
      for (const [a, b] of [[xs[0], xs[1]], [xs[2], xs[3]]]) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(b - a, 0.17, z1 - z0), walkMat);
        s.position.set((a + b) / 2, 0.085, (z0 + z1) / 2);
        s.receiveShadow = true;
        scene.add(s);
      }
    }
  }
  // East of Madison.
  block('banded', -120, MAD - 24, zS, front, 58, 0, { fade: false });
  block('glass', -120, MAD - 24, acrossZ, zN, 96, 0, { fade: false });

  // West: 10 E 44th (7 m, 29.4 m) — white with an arched window bay and a
  // white sidewalk shed; the Cornell Club (15.4 m wide, 55.5 m); then 529
  // Fifth Avenue on the corner, 38 m at the street stepping up to 80 m.
  const white = block('beaux', westX, 11.0, -13.7, front, 29.4);
  white.material.color.set('#f2efe8');
  const shedMat = new THREE.MeshStandardMaterial({ color: '#f1f1ee', roughness: 0.6, transparent: true, opacity: 1 });
  const shed = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.9, 3.2), shedMat);
  shed.position.set(westX + 4.0, 3.6, front + 1.6);
  scene.add(shed);
  const posts = [];
  for (const x of [westX + 0.3, westX + 4.0, westX + 7.7]) {
    const p = new THREE.Mesh(new THREE.BoxGeometry(0.15, 3.2, 0.15), shedMat);
    p.position.set(x, 1.6, front + 3.1);
    scene.add(p); posts.push(p);
  }
  group([white, shed, ...posts]);
  const cornell = block('prewar', 11.02, 26.4, -13.7, front, 55.5);
  cornell.material.color.set('#b9a998');
  {
    const parts = [block('beaux', 26.42, PK.eastLine, -13.6, front, 38)];
    for (const [x1, z1, y0, h] of [[66.8, 9.3, 38, 22], [63.9, 5.8, 60, 6], [61, 1.7, 66, 6], [41, -1.1, 72, 7.6]]) {
      parts.push(block('banded', 26.42, x1, -13.6, z1, h, y0));
    }
    group(parts);
  }

  // Behind, on 43rd St: an 11-storey building right behind this one, and the
  // Lefcourt National Building tower (to 141 m) toward Fifth.
  block('prewar', -1.43, 15.68, zS, -20.0, 32.6);
  {
    const parts = [
      block('prewar', 15.7, PK.eastLine, zS, -13.65, 67.2),
      block('prewar', 18.4, 47.4, -40, -22.5, 57.2, 67.2),
      block('prewar', 23.9, 42, -37, -25.4, 16.8, 124.4),
    ];
    group(parts);
  }

  // Across East 44th Street (north side), west to east.
  {
    const parts = [block('prewar', 29.2, PK.eastLine, acrossZ, zN, 43), block('glass', 29.2, 62.2, acrossZ + 9, acrossZ + 24.4, 77, 43)];
    group(parts);
  }
  block('tenement', 22.15, 29.18, acrossZ, zN, 23.6);
  {
    const parts = [block('brickwall', 13.1, 22.13, acrossZ, acrossZ + 2.3, 16.7), block('whitegrid', 13.1, 22.13, acrossZ + 2.3, zN, 58)];
    group(parts);
  }
  block('whitegrid', -12.1, 13.08, acrossZ, zN, 64.8);
  {
    const parts = [block('prewar', MAD, -12.12, acrossZ, zN, 49.2), block('prewar', MAD + 7, -12.12, acrossZ + 4, zN, 4.9, 49.2)];
    group(parts);
  }

  // Across Fifth Avenue.
  block('glass', PK.westLine, PK.westLine + 50, zS, front, 130);
  block('banded', PK.westLine, PK.westLine + 50, acrossZ, zN, 90);
}

// ---------------------------------------------------------------------------
// 370 W 51st St neighbours: corner of Ninth Avenue (local +x = west, the
// avenue starts at the building's west wall). Hell's Kitchen walk-ups.
function neighbours370w51({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK }) {
  // Lots and heights from the OSM / NYC building footprints (x west+, z
  // north+). 51st St is 18.1 m between building lines; Ninth Ave's east
  // building line is the west wall (x = W/2), its west line 30.5 m beyond.
  const zS = streetZ(-1) + road / 2 + walk; // 50th St north building line
  const zN = streetZ(1) - road / 2 - walk; // 52nd St south building line
  const eastX = -W / 2 - 0.02;
  const AV = W / 2 + 0.02;
  const tint = (m, c) => { m.material.color.set(c); return m; };

  // East along 51st (south side): older brick walk-ups with fire escapes,
  // 17.8-19.4 m, then a 52 m modern building.
  tint(block('tenement', eastX - 8.0, eastX, -23.7, front, 17.8), '#c9a58a');
  block('redtenement', eastX - 19.6, eastX - 8.02, -22.2, front, 19.2);
  block('tenement', eastX - 31.4, eastX - 19.62, -23.4, front, 19.4);
  block('redtenement', eastX - 35, eastX - 31.42, -24, front, 18);
  block('prewar', -87, eastX - 35.02, -25.6, front - 0.3, 52.5);
  block('tenement', -120, -87.02, zS, front, 20, 0, { fade: false });

  // South along Ninth Avenue: 754 (lighter stone with an ornate cornice,
  // 14.2 m) behind this building, then 752-744 Ninth Ave walk-ups and a
  // one-storey corner at 50th. Awnings over their shops.
  {
    const st = tint(block('beaux', -15.5, AV - 0.02, -11.4, -D / 2 - 0.02, 14.2), '#e3dccb');
    const lot = new THREE.Mesh(new THREE.BoxGeometry(W - 7.8 + 0.1, 14.2, front - 5.8 + D / 2 - 0.04), st.material);
    lot.position.set(-15.5 + (W - 7.8 + 15.5 - W / 2) / 2, 7.1, (-D / 2 + front - 5.8) / 2);
    scene.add(lot);
    const cor = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 7.5), new THREE.MeshStandardMaterial({ color: '#cfc6b2', roughness: 0.8, transparent: true, opacity: 1 }));
    cor.position.set(AV + 0.3, 13.9, -7.6);
    scene.add(cor);
    group([st, lot, cor]);
  }
  const awnCols = ['#2b6fd0', '#d23a2a', '#f0b429', '#2b6fd0', '#1f5a3a', '#7a2a6a'];
  [[-19.2, -11.42, 16.3], [-26.9, -19.22, 16.7], [-34.8, -26.92, 16.7], [-42.2, -34.82, 16.7], [-50.2, -42.22, 17.1], [zS, -50.22, 6.1]].forEach(([z0, z1, h], k) => {
    block(k % 2 ? 'tenement' : 'redtenement', -12, AV - 0.02, z0, z1, h);
    const a = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.7, z1 - z0 - 1), new THREE.MeshStandardMaterial({ color: awnCols[k], roughness: 0.6 }));
    a.position.set(AV + 0.6, 3.3, (z0 + z1) / 2);
    scene.add(a);
  });
  // Behind, toward 50th St.
  block('tenement', -15.3, -12.02, zS, -11.42, 16);
  block('redtenement', -23.2, -15.32, zS, -30.3, 16.9);
  block('tenement', -41.2, -23.22, zS, -25, 18);
  block('prewar', -64.5, -41.22, zS, -31.2, 49.4);

  // Across 51st (north side), east to west: walk-ups 14.6-19.8 m, then the
  // corner row on Ninth (15.1 m on the corner, 17.4 m beyond).
  for (const [x0, x1, h, k] of [[-60, -53.4, 14.6, 0], [-53.4, -45.9, 17.2, 1], [-45.9, -28.7, 19.8, 0], [-28.8, -23.1, 18.0, 1], [-23.1, -15.7, 18.3, 0]]) {
    block(k ? 'redtenement' : 'tenement', x0, x1 - 0.02, acrossZ, acrossZ + 26.2, h);
  }
  block('tenement', -120, -60.02, acrossZ, zN, 19, 0, { fade: false });
  block('redtenement', -15.7, AV - 0.02, acrossZ, acrossZ + 7.7, 15.1);
  [[29.8, 37.6, 17.4], [37.6, 44.9, 17.4], [44.9, 52.9, 17.4], [52.9, 60.2, 17.4], [60.2, 67.9, 17.4], [67.9, zN, 14.4]].forEach(([z0, z1, h], k) => {
    block(k % 2 ? 'redtenement' : 'tenement', -11.1, AV - 0.02, z0 - 3.85 + 3.85, z1 - 0.02, h);
  });
  block('tenement', -15.68, -11.12, acrossZ + 7.72, zN, 18.4);

  // Across Ninth Avenue: 18-19 m walk-ups south of 51st, ~14.5 m north.
  for (let z = front - 0.3, k = 0; z > zS + 1; z -= 7.9, k++) block(k % 2 ? 'tenement' : 'redtenement', PK.westLine, PK.westLine + 26.5, Math.max(zS, z - 7.9), z - 0.02, 18.1 + (k % 3) * 0.3);
  for (let z = acrossZ, k = 0; z < zN - 1; z += 7.7, k++) block(k % 2 ? 'redtenement' : 'tenement', PK.westLine, PK.westLine + 24.3, z, Math.min(zN, z + 7.68), 14.5 + (k % 2) * 0.4);

  // Glass towers in the distance to the east (seen over the corner).
  block('glass', -175, -150, 60, 95, 150, 0, { fade: false });
  block('glass', -215, -185, 10, 40, 190, 0, { fade: false });

  // Street trees on 51st (one in front of the building, one by the east end).
  const leaf = new THREE.MeshStandardMaterial({ color: '#4f8a35', roughness: 1 });
  const trunk = new THREE.MeshStandardMaterial({ color: '#4a3a2c', roughness: 1 });
  for (const x of [2.5, -14.5, eastX - 12]) {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.22, 4, 8), trunk);
    t.position.set(x, 2, front + walk - 0.8);
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(2.8, 1), leaf);
    c.position.set(x, 6.8, front + walk - 0.8);
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

  // Neighbours traced from satellite + OSM building heights (NYC survey data).
  // d = depth back from the Queens Blvd building line.
  const Zd = (d) => front - d;
  const nb = (kind, x0, x1, d0, d1, h) => block(kind, x0, x1, Zd(d1), Zd(d0), h);
  // The generic street-canyon filler (added after this function) would put a
  // 15-29 m block over the low buildings across 34th St; keep it out there.
  {
    const add0 = scene.add.bind(scene);
    scene.add = (...objs) => {
      const keep = objs.filter((o) => !(o.isMesh && Math.abs(o.position.x + 88) < 0.01 && o.position.z > zS - 10 && o.position.z < front));
      return keep.length ? add0(...keep) : scene;
    };
  }
  // Our side of the north street, and its far sidewalk (the generic street
  // is drawn 34 m wide; the real one is ~10 m, so the rest is built over).
  slab(west - 4.5, PK.eastLine, zS - 5, zS, 0.165);
  slab(west - 19, PK.westLine + 60, zS - 19.5, zS - 15, 0.165);
  // Across 34th St (west): low storefront buildings on Queens Blvd, taller
  // lofts behind (OSM heights 6-17 m).
  nb('redtenement', west - 42, west - 19, 0, 38, 7.8);
  nb('tenement', west - 55, west - 42, 0, 38, 6.2);
  nb('redtenement', west - 79, west - 55, 0, 38, 6.7);
  nb('brickwall', west - 54, west - 19, 38, 70, 10.3);
  nb('prewar', west - 79, west - 54, 38, 70, 16.8);
  nb('brickwall', west - 74, west - 33, 70, 133, 12);
  nb('tenement', west - 33, west - 19, 70, 125, 9);
  nb('brickwall', west - 79, west - 19, 133, D - 0.5, 8);
  // Across 35th St (east): corner building (9.2 m), a one-storey shop behind
  // it (4.9 m), then a long white-roofed two-storey warehouse.
  nb('prewar', PK.westLine, PK.westLine + 30, 0, 30, 9.2);
  nb('tenement', PK.westLine, PK.westLine + 30, 30, 42, 4.9);
  nb('stucco', PK.westLine, PK.westLine + 42, 42, D - 0.5, 10);
  // North of the north street.
  block('brickwall', west - 19, 16, zS - 75, zS - 19.5, 9);
  block('stucco', PK.westLine, PK.westLine + 50, zS - 75, zS - 19.5, 8);
  // Across Queens Blvd.
  block('prewar', -70, -15, acrossZ, zN, 12);
  block('tenement', -14.9, 22, acrossZ, zN, 16);
  block('prewar', 22.1, PK.eastLine, acrossZ, zN, 10);
  block('glass', PK.westLine, PK.westLine + 40, acrossZ, zN, 60);
}

// ---------------------------------------------------------------------------
// 250 Canal St (TD Bank) on the SE corner of Canal & Lafayette. Faces north;
// unmirrored, so local +x is west toward Lafayette St. The bank is one
// storey, so the neighbours' graffitied walls show above its roof.
function neighbours250canal({ scene, block, group, W, D, front, walk, road, acrossZ, streetZ, PK, unmirror, r }) {
  // Lots and heights from the OSM / NYC building footprints, in the frame
  // x = west along Canal (+x toward Lafayette), z = north (Canal). Canal is
  // 30 m between building lines; Lafayette's west line is at x = 29.9.
  const zS = streetZ(-1) + road / 2 + walk;
  const zN = streetZ(1) - road / 2 - walk;
  const eastX = -W / 2 - 0.02;
  const LAF = W / 2 + 0.02;

  const graffiti = (w, h, dark = false) => {
    const c = document.createElement('canvas');
    c.width = 1024; c.height = 256;
    const ctx = c.getContext('2d');
    const cols = dark ? ['#1c1c1c', '#3a3a3a', '#e7e7e7', '#1c1c1c'] : ['#c8312b', '#e7e7e7', '#7fa6d8', '#202020', '#e3c54a'];
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

  // East along Canal: 244 Canal, a grey four-storey (13.5 m) with graffiti on
  // the side wall above the bank's roof; then New Cameron Bakery (one storey)
  // and a 12 m building.
  {
    const grey = block('prewar', eastX - 6.9, eastX, -4.9, front, 13.5);
    grey.material.color.set('#b9b6b0');
    const rearLow = block('brickwall', eastX - 6.9, eastX, -8.5, -4.92, 6);
    const gE = graffiti(11, 3.4);
    gE.rotation.y = Math.PI / 2;
    gE.position.set(eastX + 0.03, 9.2, 2.5);
    scene.add(gE);
    group([grey, rearLow, gE]);
  }
  block('tenement', -25.2, eastX - 6.92, -6.6, front - 0.1, 4.7);
  block('redtenement', -39.2, -25.22, -23.5, front - 0.2, 12.1);
  // Baxter St gap, then 112 Walker and taller lofts further east.
  {
    const asphalt = new THREE.MeshStandardMaterial({ color: '#36373a', roughness: 0.95 });
    const bax = new THREE.Mesh(new THREE.BoxGeometry(12, 0.172, front - zS + 0.2), asphalt);
    bax.position.set(-47, 0.086, (front + zS) / 2);
    scene.add(bax);
  }
  block('tenement', -76.7, -55, -13.8, front - 0.1, 8);
  block('prewar', -104, -76.72, -12, front - 0.1, 27.8, 0, { fade: false });

  // Behind the bank: a white-painted 31 m loft (bulkhead to 35 m) wrapping
  // the bank's rear, graffiti across its north wall above the bank's roof,
  // Popeyes in its ground floor on Lafayette.
  {
    const white = block('prewar', -16.5, LAF, -30.3, -D / 2 - 0.02, 31);
    white.material.color.set('#e6e4df');
    const bulk = block('brickwall', -18, -5.7, -27.8, -19, 4, 31);
    const gB = graffiti(16, 3.6, true);
    gB.position.set(0, 10.6, -D / 2 + 0.03);
    scene.add(gB);
    const pop = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.0, 5), new THREE.MeshStandardMaterial({ color: '#e35a1f', roughness: 0.5, transparent: true, opacity: 1 }));
    pop.position.set(LAF + 0.15, 4.0, -16);
    scene.add(pop);
    const shed = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.5, 9), new THREE.MeshStandardMaterial({ color: '#4a4f55', roughness: 0.6, transparent: true, opacity: 1 }));
    shed.position.set(LAF + 1.3, 3.4, -24);
    scene.add(shed);
    group([white, bulk, gB, pop, shed]);
  }
  block('brickwall', -25.8, -16.52, -25, -8.52, 7);
  block('prewar', -39.2, LAF, zS, -30.32, 35);
  block('tenement', -104, -39.22, zS, -23.52, 22, 0, { fade: false });

  // Across Lafayette (west): the Hardware Building (21.8 m) on the corner,
  // 262-264 Canal, and taller hotels behind.
  block('prewar', PK.westLine, 66.4, -15.7, front - 0.1, 21.8);
  block('redtenement', 66.42, 74.2, -13.9, front - 0.1, 22.5);
  block('tenement', 74.22, 85.8, -13.9, front - 0.1, 22.1);
  block('beaux', PK.westLine, 48.7, -38.5, -15.72, 38.8);
  block('glass', 48.72, 63.7, -41.9, -15.72, 32);
  block('tenement', 63.72, 85.8, -43, -15.72, 24.6);

  // Across Canal Street (north side), east to west.
  block('tenement', -72.6, -44.4, acrossZ, zN, 26.2);
  block('redtenement', -44.38, -27.12, acrossZ, zN, 20);
  block('prewar', -27.1, -15.32, acrossZ, zN, 26.6);
  block('redtenement', -15.3, -0.82, acrossZ, zN, 24.8);
  block('tenement', -0.8, 8.5, acrossZ, zN, 19.4);
  block('brickwall', 8.52, PK.eastLine, acrossZ, acrossZ + 20, 3.3);
  block('tenement', PK.westLine, 50.5, acrossZ, zN, 17.9);
  block('redtenement', 50.52, 57.3, acrossZ, zN, 20.6);
  block('brickwall', 57.32, 73.4, acrossZ, zN, 10.5);
  block('prewar', 73.42, 85.8, acrossZ, zN, 27.3);

  // Canal St subway entrance (far end of the Canal frontage) and the
  // JCDecaux newsstand nearer the corner, on the bank's sidewalk.
  const steel = new THREE.MeshStandardMaterial({ color: '#2f4a3b', roughness: 0.5, metalness: 0.5 });
  const rail = new THREE.Mesh(new THREE.BoxGeometry(4.5, 1.1, 2.2), steel);
  rail.position.set(-W / 2 + 5, 0.55, front + walk - 1.6);
  scene.add(rail);
  const stand = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.8, 1.8), new THREE.MeshStandardMaterial({ color: '#9a9c9e', roughness: 0.4, metalness: 0.6 }));
  stand.position.set(2.5, 1.4, front + walk - 1.4);
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
  const desert = !!site.desert;
  const grass = new THREE.MeshStandardMaterial({ color: desert ? '#c7b08a' : '#6f9a45', roughness: 1 });
  const asphalt = new THREE.MeshStandardMaterial({ color: '#3b3c3e', roughness: 0.95 });
  const white = new THREE.MeshBasicMaterial({ color: '#e9e7e0' });
  const yellow = new THREE.MeshBasicMaterial({ color: '#e6be2e' });
  const kerbMat = new THREE.MeshStandardMaterial({ color: '#d4d0c7', roughness: 0.9 });
  flat(grass, -800, 800, -800, 800, 0);
  if (site.bare) {
    // The site file draws every real surrounding itself (no generic lots/trees/sheds).
    const box = (w, h, d, x, y, z, mat) => { const m = add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; return m; };
    SITE_EXTRAS[site.id]?.({ THREE, scene, add, flat, box, W, D, front, site, r, mats: { grass, asphalt, white, yellow, kerbMat } });
    return { fadeables: [] };
  }

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
  if (!desert) flat(grass, W / 2 + 1, W / 2 + 40, -front, front + 1, 0.011);

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
  if (site.noFence) {
    // Office campus: open lot, no fenced yard.
  } else if (!desert) {
    fenceRun(lotX0 + 2, front - 2, -W / 2 - 1, front - 2);
    fenceRun(lotX0 + 2, front - 2, lotX0 + 2, -front);
  } else {
    // Store sites wrap the lot around the corner: pave the +x side too.
    flat(asphalt, W / 2, W / 2 + 34, -front - 10, front + 1, 0.04);
  }

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
  for (let z = -front + 2; z < front - 6; z += 2.8) if (r() < (desert ? 0.25 : 0.6)) car(lotX0 + 6, z, 0);
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
  const leaf = desert
    ? [new THREE.MeshStandardMaterial({ color: '#8fa45a', roughness: 1 }), new THREE.MeshStandardMaterial({ color: '#a3b46b', roughness: 1 })] // palo verde
    : [new THREE.MeshStandardMaterial({ color: '#3f6b2c', roughness: 1 }), new THREE.MeshStandardMaterial({ color: '#4d7d33', roughness: 1 })];
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
  const treeSpots = desert
    ? [[W / 2 + 36, front - 4, 0.9], [W / 2 + 38, -front + 6, 1.0], [-W / 2 - 50, front + 40, 0.9], [W / 2 + 20, front + 38, 0.8]]
    : [[W / 2 + 4, front - 4, 1.3], [W / 2 + 10, front - 18, 1.5], [W / 2 + 6, front - 40, 1.2], [W / 2 + 24, front + 10, 1.1], [-W / 2 - 50, front + 40, 1.0]];
  if (site.trees !== false) for (const [x, z, s] of treeSpots) oak(x, z, s);
  if (desert) {
    // Agaves in gravel planters, saguaros, and the Santa Catalina foothills.
    const agaveMat = new THREE.MeshStandardMaterial({ color: '#9fb3a6', roughness: 0.7 });
    const agave = (x, z, s) => {
      const bed = add(new THREE.Mesh(new THREE.CylinderGeometry(2.2 * s, 2.2 * s, 0.25, 20), new THREE.MeshStandardMaterial({ color: '#8d7a66', roughness: 1 })));
      bed.position.set(x, 0.12, z);
      for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        const lf = add(new THREE.Mesh(new THREE.ConeGeometry(0.16 * s, 1.9 * s, 4), agaveMat));
        lf.position.set(x + Math.cos(a) * 0.35 * s, 0.9 * s, z + Math.sin(a) * 0.35 * s);
        lf.rotation.set(Math.sin(a) * 0.8, 0, -Math.cos(a) * 0.8);
      }
    };
    agave(W / 2 + 12, front + 16, 1.2);
    agave(-W / 2 - 4, front + 12, 1);
    const cactus = new THREE.MeshStandardMaterial({ color: '#4f6b3a', roughness: 0.9 });
    const saguaro = (x, z, h) => {
      const t = add(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.4, h, 10), cactus));
      t.position.set(x, h / 2, z);
      for (const sx of [-1, 1]) {
        const arm = add(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, h * 0.35, 8), cactus));
        arm.position.set(x + sx * 0.8, h * 0.62, z);
        const el = add(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.8, 8), cactus));
        el.rotation.z = Math.PI / 2;
        el.position.set(x + sx * 0.45, h * 0.45, z);
      }
    };
    for (const [x, z, h] of [[-90, front + 20, 7], [W / 2 + 60, -30, 8], [70, front + 80, 6.5], [-70, -front - 40, 7.5]]) saguaro(x, z, h);
    // Santa Catalina foothills: a jagged, hazy ridge line far behind the site.
    const rock = new THREE.MeshStandardMaterial({ color: '#8d7a69', roughness: 1, flatShading: true });
    for (let k = 0; k < 9; k++) {
      const rr = 150 + r() * 120;
      const h = 110 + r() * 120;
      const geo = new THREE.ConeGeometry(rr, h, 9, 3);
      const pos = geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        if (pos.getY(i) > -h / 2 + 1) {
          pos.setX(i, pos.getX(i) * (0.8 + r() * 0.4));
          pos.setZ(i, pos.getZ(i) * (0.8 + r() * 0.4));
          pos.setY(i, pos.getY(i) + (r() - 0.5) * h * 0.18);
        }
      }
      geo.computeVertexNormals();
      const m = add(new THREE.Mesh(geo, rock));
      m.scale.set(1.6, 1, 0.8);
      m.position.set(-700 + k * 190 + (r() - 0.5) * 80, h / 2 - 12, -760 - r() * 120);
    }
  }
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
  if (!site.noSheds) {
    shed(lotX0 - 70, lotX0 - 6, -60, 20, 8, '#d8cdb6');
    shed(W / 2 + 46, W / 2 + 130, -90, 10, 9, '#e3ddd0');
    shed(-150, -40, front + 64, front + 130, 7.5, '#cfc4ae');
    shed(40, 150, front + 64, front + 140, 9, '#e6e1d6');
    shed(-60, 60, -front - 90, -front - 25, 10, '#ddd4c2');
  }
  // Site-specific real surroundings (js/viewer/sites/<site.id>.js).
  const box = (w, h, d, x, y, z, mat) => {
    const m = add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat));
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    return m;
  };
  SITE_EXTRAS[site.id]?.({ THREE, scene, add, flat, box, W, D, front, site, r, mats: { grass, asphalt, white, yellow, kerbMat } });
  return { fadeables: [] };
}
