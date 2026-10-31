// Street + neighbouring buildings around 120 E 56th St (front faces +z = north).
//   east  (-x): Tower 56 — stepped podium with slanted glass setbacks, tall tower behind
//   west  (+x): low construction shed, silver fluted tower, glass tower with canopy
//   south (-z): large banded office tower behind the lot
//   north (+z): across E 56th St — white grid tower, pre-war stone building, glass tower
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
  const sidewalk = (z0, z1) => {
    const w = 400;
    const tex = walkTex.clone();
    tex.repeat.set(w / 1.6, (z1 - z0) / 1.6);
    tex.needsUpdate = true;
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.16, z1 - z0), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.95 }));
    m.position.set(0, 0.08, (z0 + z1) / 2);
    m.receiveShadow = true;
    scene.add(m);
    const curb = new THREE.Mesh(new THREE.BoxGeometry(w, 0.17, 0.25), new THREE.MeshStandardMaterial({ color: '#8f8c86', roughness: 0.9 }));
    curb.position.set(0, 0.085, z0 > front ? z0 + 0.12 : z1 - 0.12);
    scene.add(curb);
  };
  sidewalk(front, front + walk);
  sidewalk(farWalk, acrossZ + 0.5);
  const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(400, road), new THREE.MeshStandardMaterial({ color: '#36373a', roughness: 0.95 }));
  asphalt.rotation.x = -Math.PI / 2;
  asphalt.position.set(0, 0.01, front + walk + road / 2);
  asphalt.receiveShadow = true;
  scene.add(asphalt);
  const lineMat = new THREE.MeshBasicMaterial({ color: '#d9d6cc' });
  for (const dz of [2.4, road - 2.4]) {
    const l = new THREE.Mesh(new THREE.PlaneGeometry(400, 0.12), lineMat);
    l.rotation.x = -Math.PI / 2;
    l.position.set(0, 0.02, front + walk + dz);
    scene.add(l);
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
    if (fade) fadeables.push({ mesh, mats: [mat], box: new THREE.Box3().setFromObject(mesh), opacity: 1 });
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
    fadeables.push({ mesh: meshes[0], mats: ms, box, opacity: 1 });
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

  // West: shed in the gap, fluted tower, glass tower with lobby canopy.
  {
    const shed = block('louver', W / 2 + 0.1, W / 2 + 4.5, front - 6, front, 3.4, 0, { fade: false });
    shed.material = new THREE.MeshStandardMaterial({ color: '#202224', roughness: 0.7 });
    block('fluted', W / 2 + 4.8, W / 2 + 13.5, -D / 2, front - 2, 165);
    const parts = [
      block('glass', W / 2 + 13.6, W / 2 + 46, -D / 2, front - 7, 120, 15),
      block('glass', W / 2 + 13.6, W / 2 + 46, -D / 2, front - 4, 14),
    ];
    const canopyMat = new THREE.MeshStandardMaterial({ color: '#e7e6e2', roughness: 0.6, transparent: true, opacity: 1 });
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(32.4, 1.1, 6), canopyMat);
    canopy.position.set(W / 2 + 29.8, 14.4, front - 2);
    canopy.castShadow = true;
    scene.add(canopy);
    parts.push(canopy);
    group(parts);
  }

  // Behind (south).
  block('banded', -30, 18, -D / 2 - 42, -D / 2 - 3, 175);
  block('glass', 19, 52, -D / 2 - 40, -D / 2 - 3, 95);

  // Across the street (north).
  block('whitegrid', -52, -14, acrossZ, acrossZ + 30, 96);
  block('prewar', -13, 12, acrossZ, acrossZ + 25, 52);
  block('glass', 13, 46, acrossZ, acrossZ + 30, 135);

  // Further along the street, to make the canyon.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 5; i++) {
      const x0 = side > 0 ? 66 + i * 34 : -70 - (i + 1) * 34;
      const kinds = ['glass', 'prewar', 'banded', 'whitegrid'];
      block(kinds[(i + (side > 0 ? 1 : 0)) % 4], x0, x0 + 32, -D / 2 - 10, front - 1, 40 + r() * 110, 0, { fade: false });
      block(kinds[(i + 2) % 4], x0, x0 + 32, acrossZ, acrossZ + 30, 40 + r() * 120, 0, { fade: false });
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
  const vehicle = (x, z, { len = 5.9, ht = 2.5, body = white, cabin = 0.32 } = {}) => {
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
    v.rotation.y = Math.PI; // traffic flows west on E 56th
    scene.add(v);
  };
  const lane = front + walk + 1.2;
  vehicle(-14, lane);
  vehicle(-4, lane, { len: 5.4, ht: 2.3 });
  vehicle(7, lane);
  vehicle(16, lane, { len: 4.6, ht: 1.5, body: new THREE.MeshStandardMaterial({ color: '#d7d9db', roughness: 0.3, metalness: 0.5 }), cabin: 0.5 });
  vehicle(2, front + walk + 5.2, { len: 4.8, ht: 1.6, body: yellow, cabin: 0.5 });
  vehicle(-30, farWalk - 1.2, { len: 4.7, ht: 1.5, body: new THREE.MeshStandardMaterial({ color: '#2b3a4f', roughness: 0.3, metalness: 0.5 }), cabin: 0.5 });

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
export function updateFades(fadeables, camera, dt, subject) {
  camera.updateMatrixWorld();
  pv.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  frustum.setFromProjectionMatrix(pv);
  const subjectDist = subject ? subject.distanceToPoint(camera.position) : Infinity;
  for (const f of fadeables) {
    let blocks = f.box.containsPoint(camera.position);
    if (!blocks && subject && frustum.intersectsBox(f.box) && f.box.distanceToPoint(camera.position) < subjectDist - 3) blocks = true;
    for (const t of targets) {
      if (blocks) break;
      ray.origin.copy(camera.position);
      ray.direction.subVectors(t, camera.position);
      const dist = ray.direction.length();
      ray.direction.normalize();
      if (ray.intersectBox(f.box, hit) && hit.distanceTo(camera.position) < dist) blocks = true;
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
