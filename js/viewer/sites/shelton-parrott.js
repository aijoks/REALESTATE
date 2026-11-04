// Real surroundings for site 'shelton-parrott' (1 Parrott Drive, Shelton CT),
// traced from Google satellite imagery and OSM. Called by buildSuburban with
// site.bare (no generic lots / trees / sheds).
// ctx: { THREE, scene, add, flat, box, W, D, front, site, r, mats }
// The building's long axis runs NNE-SSW (16 deg off north). Tracing was done
// in pixels of two north-up images; P() / S() convert them to model metres
// (model +x = along the building toward SSW, +z = toward WNW).
import { textTexture } from '../textures.js';

const SN = Math.sin((16 * Math.PI) / 180);
const CS = Math.cos((16 * Math.PI) / 180);
// Zoom-19 image (0.2244 m/px).
const P = (px, py) => [(-SN * px + CS * py) * 0.2244 - 76.35, (-CS * px - SN * py) * 0.2244 + 152];
// Zoom-18 image (0.4488 m/px), registered to the zoom-19 one.
const S = (X, Y) => P((X - 675.6) * 2 + 588, (Y - 697) * 2 + 626);

export function site_shelton_parrott(ctx) {
  const { THREE, add, r, mats } = ctx;
  const { asphalt, white, yellow, grass, kerbMat } = mats;
  const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...o });
  const lotMat = M('#4b4c4f', { roughness: 0.95 });
  const sand = M('#c9b48f', { roughness: 1 });

  // Flat polygon on the ground from model [x, z] points.
  const poly = (pts, mat, y = 0.04) => {
    const sh = new THREE.Shape();
    pts.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)));
    const m = add(new THREE.Mesh(new THREE.ShapeGeometry(sh), mat));
    m.rotation.x = -Math.PI / 2;
    m.position.y = y;
    m.receiveShadow = true;
    return m;
  };
  // A road along a polyline (model points), with round joints and a centre line.
  const road = (pts, w, mat = asphalt, y = 0.05, centre = true) => {
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, z0] = pts[i];
      const [x1, z1] = pts[i + 1];
      const len = Math.hypot(x1 - x0, z1 - z0);
      const m = add(new THREE.Mesh(new THREE.PlaneGeometry(len, w), mat));
      m.rotation.set(-Math.PI / 2, 0, Math.atan2(-(z1 - z0), x1 - x0));
      m.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
      m.receiveShadow = true;
      if (centre) {
        for (const o of [-0.12, 0.12]) {
          const l = add(new THREE.Mesh(new THREE.PlaneGeometry(len, 0.1), yellow));
          l.rotation.copy(m.rotation);
          const nx = -(z1 - z0) / len;
          const nz = (x1 - x0) / len;
          l.position.set((x0 + x1) / 2 + nx * o, y + 0.01, (z0 + z1) / 2 + nz * o);
        }
      }
      const j = add(new THREE.Mesh(new THREE.CircleGeometry(w / 2, 16), mat));
      j.rotation.x = -Math.PI / 2;
      j.position.set(x1, y - 0.002, z1);
    }
  };
  const box = (pts, h, color) => {
    // Extruded neighbour footprint (model points).
    const sh = new THREE.Shape();
    pts.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    const m = add(new THREE.Mesh(geo, M(color)));
    m.castShadow = m.receiveShadow = true;
    return m;
  };
  // Sign plate on a wall between two model points a -> b (outside on the right in plan).
  const sign = (a, b, t, y, text, sub, w, bg = '#ffffff', ink = '#1f2a3a') => {
    const [x0, z0] = a;
    const [x1, z1] = b;
    const len = Math.hypot(x1 - x0, z1 - z0);
    const tex = textTexture({ text, sub, width: 1024, height: 220, bg, ink, font: '800 92px Arial', subFont: '600 42px Arial' });
    const m = add(new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.215), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 })));
    const nx = -(z1 - z0) / len;
    const nz = (x1 - x0) / len;
    m.position.set(x0 + (x1 - x0) * t + nx * 0.12, y, z0 + (z1 - z0) * t + nz * 0.12);
    m.rotation.y = Math.atan2(nx, nz);
  };
  const Pm = (arr) => arr.map(([a, b]) => P(a, b));
  const Sm = (arr) => arr.map(([a, b]) => S(a, b));

  // ---------------- ground cover ----------------
  // Construction site (sand) east of Parrott Drive.
  poly(Sm([[880, 60], [1024, 60], [1024, 1024], [880, 1024], [860, 820], [880, 500]]), sand, 0.02);

  // ---------------- roads ----------------
  // Parrott Drive: from Bridgeport Ave (south-east) north past the building to a cul-de-sac.
  const parrott = [...Pm([[1280, 1255], [1100, 1170], [960, 1090], [850, 1010], [800, 950], [793, 850], [805, 700], [825, 560], [848, 400], [870, 200], [885, 0]]), ...Sm([[842, 300], [855, 240], [878, 205]])];
  road(parrott, 9);
  {
    const [cx, cz] = S(884, 192);
    const c = add(new THREE.Mesh(new THREE.CircleGeometry(15, 32), asphalt));
    c.rotation.x = -Math.PI / 2;
    c.position.set(cx, 0.049, cz);
  }
  // Progress Drive (west) and the street along the north.
  road(Sm([[300, -40], [312, 200], [310, 330], [285, 450], [240, 520], [170, 560], [-60, 600]]), 9);
  road(Sm([[300, 30], [580, 30], [640, 40], [880, 192]]), 8);
  // Service drive from Parrott Drive to the south lots.
  road(Pm([[800, 1000], [700, 1065], [560, 1075]]), 7, asphalt, 0.048, false);

  // ---------------- parking / drives on the site ----------------
  poly(Pm([[330, 905], [560, 1050], [560, 1095], [400, 1280], [250, 1280], [250, 980]]), lotMat); // south lot
  poly(Pm([[300, 900], [330, 905], [250, 980], [230, 940]]), lotMat);
  poly(Pm([[415, 100], [480, 100], [470, 150], [415, 430], [380, 520], [350, 500], [385, 420]]), lotMat); // west drive
  poly(Pm([[700, 380], [835, 380], [815, 525], [700, 525]]), lotMat); // east lot (north block)
  poly(Pm([[430, 0], [885, 0], [872, 120], [760, 188], [510, 108], [430, 108]]), lotMat); // north apron
  poly(Pm([[640, 470], [700, 470], [700, 525], [640, 525]]), lotMat);
  // Stripes in the south lot and east lot.
  {
    const stripe = (a, b) => road([a, b], 0.12, white, 0.07, false);
    for (let k = 0; k < 14; k++) {
      const [x, z] = P(330 + k * 13, 930 + k * 8);
      stripe([x, z], [x + 5.4 * Math.cos(0.9), z + 5.4 * Math.sin(0.9)]);
    }
    for (let k = 0; k < 9; k++) {
      const a = P(712 + k * 12, 392);
      stripe(a, [a[0] + 5.2, a[1] + 0.6]);
    }
  }
  // Circular drop-off drive with its grass island, in front of the CARA lobby.
  {
    const [cx, cz] = P(398, 812);
    const ring = add(new THREE.Mesh(new THREE.CircleGeometry(12, 40), asphalt));
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(cx, 0.052, cz);
    const isl = add(new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 0.25, 40), grass));
    isl.position.set(cx, 0.13, cz);
    const k = add(new THREE.Mesh(new THREE.TorusGeometry(5.2, 0.2, 6, 40), kerbMat));
    k.rotation.x = -Math.PI / 2;
    k.position.set(cx, 0.16, cz);
    // Drive from the loop down to the south lot and toward the lobby.
    road([[cx + 8, cz - 4], [P(380, 905)[0], P(380, 905)[1]]], 7, asphalt, 0.051, false);
    road([[cx, cz], [P(455, 760)[0], P(455, 760)[1]]], 6, asphalt, 0.051, false);
  }

  // ---------------- parked cars ----------------
  const carCols = ['#e8e8e6', '#8e9aa6', '#7a1d22', '#c9c3b5', '#2c3440', '#b8bcc2', '#3c5a78'];
  const car = ([x, z], ry) => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.8, 1.85), M(carCols[Math.floor(r() * carCols.length)], { roughness: 0.3, metalness: 0.5 }));
    body.position.y = 0.65;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.6, 1.7), M('#22272d', { roughness: 0.2, metalness: 0.6 }));
    cab.position.set(-0.2, 1.3, 0);
    g.add(body, cab);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    add(g);
  };
  for (let k = 0; k < 14; k++) if (r() < 0.4) car(P(335 + k * 13, 948 + k * 8), -0.9 + Math.PI / 2);
  for (let k = 0; k < 9; k++) if (r() < 0.55) car(P(718 + k * 12, 410), Math.PI / 2 - 0.28);
  for (const p of [[735, 440], [742, 493], [520, 2], [600, 2], [660, 2]]) car(P(...p), 0.3);

  // ---------------- neighbouring buildings ----------------
  const b50 = Sm([[630, 268], [778, 285], [770, 365], [625, 350]]);
  box(b50, 8, '#d7d9db');
  sign(b50[3], b50[2], 0.5, 5.6, '50 PARROTT DRIVE', null, 8);
  const b60 = Sm([[655, 100], [805, 140], [795, 220], [650, 190]]);
  box(b60, 8, '#dcdcda');
  sign(b60[3], b60[2], 0.5, 5.6, '60 PARROTT DRIVE', null, 8);
  const b14 = Sm([[372, 52], [555, 52], [555, 222], [372, 222]]);
  box(b14, 9, '#c9cdd2');
  sign(b14[3], b14[2], 0.5, 6.2, '14 PROGRESS DRIVE', 'Office · light industrial', 9);
  const b10 = Sm([[408, 402], [470, 408], [420, 565], [345, 550], [340, 490], [360, 470]]);
  box(b10, 7, '#d3d5d6');
  sign(b10[4], b10[3], 0.5, 4.6, 'GRIFFIN HOSPITAL', 'Occupational Medicine Center · 10 Progress Dr', 10, '#ffffff', '#00467f');
  box(Sm([[145, 690], [250, 600], [315, 690], [210, 765]]), 11, '#c8b89c');
  box(Sm([[125, 165], [190, 170], [190, 262], [125, 240]]), 6, '#dcdcdc');
  box(Sm([[115, 10], [230, 10], [230, 100], [115, 100]]), 7, '#e6e6e4');
  box(Sm([[965, 455], [1015, 478], [900, 780], [860, 778], [852, 668], [870, 640]]), 9, '#c7ccd2');
  box(Sm([[870, 890], [945, 828], [975, 850], [900, 955]]), 7, '#b9c3cc');
  // Big parking lots of the Progress Drive office park (west).
  poly(Sm([[0, 170], [200, 170], [200, 330], [130, 520], [0, 540]]), lotMat, 0.035);
  poly(Sm([[150, 760], [440, 770], [440, 900], [150, 900]]), lotMat, 0.035);

  // ---------------- woods (instanced) ----------------
  const inside = (pt, poly2) => {
    let c = false;
    for (let i = 0, j = poly2.length - 1; i < poly2.length; j = i++) {
      const [xi, zi] = poly2[i];
      const [xj, zj] = poly2[j];
      if ((zi > pt[1]) !== (zj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - zi)) / (zj - zi) + xi) c = !c;
    }
    return c;
  };
  // Keep the lawn strip in front of the building and the drives clear.
  const keepClear = [
    [[-90, 34], [-12, 34], [-12, 44], [-90, 50]],
    [[-12, 21], [62, 21], [62, 40], [-12, 40]],
    [[48, -2], [106, -2], [106, 52], [48, 52]],
  ];
  const woods = [
    Sm([[330, 560], [480, 560], [560, 640], [600, 1000], [430, 1000], [330, 920]]),
    Sm([[560, 300], [610, 300], [600, 640], [560, 640]]),
    Sm([[690, 520], [785, 520], [780, 900], [700, 920]]),
    Sm([[800, 250], [870, 250], [860, 850], [795, 850]]),
    Sm([[560, 930], [760, 930], [760, 1024], [560, 1024]]),
    Sm([[70, 140], [300, 140], [300, 560], [200, 560], [200, 330], [70, 330]]),
    Sm([[0, 560], [140, 560], [140, 900], [0, 900]]),
    Sm([[350, 230], [620, 230], [620, 300], [350, 300]]),
  ];
  const spots = [];
  for (const w of woods) {
    let x0 = Infinity; let x1 = -Infinity; let z0 = Infinity; let z1 = -Infinity;
    for (const [x, z] of w) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); }
    for (let x = x0; x < x1; x += 6.5) {
      for (let z = z0; z < z1; z += 6.5) {
        const p = [x + (r() - 0.5) * 5, z + (r() - 0.5) * 5];
        if (!inside(p, w) || keepClear.some((k) => inside(p, k))) continue;
        if (p[0] > -86 && p[0] < 86 && p[1] > -38 && p[1] < 38) continue; // the building itself
        spots.push(p);
      }
    }
  }
  {
    const n = spots.length;
    const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), M('#ffffff', { roughness: 1 }), n * 2);
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.32, 1, 6), M('#4b3d30', { roughness: 1 }), n);
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const col = new THREE.Color();
    const greens = ['#3d6b2b', '#4a7a33', '#335c24', '#56813a', '#2f4f26'];
    spots.forEach(([x, z], i) => {
      const h = 8 + r() * 8;
      trunks.setMatrixAt(i, m4.compose(new THREE.Vector3(x, h * 0.3, z), q, new THREE.Vector3(1, h * 0.6, 1)));
      for (let k = 0; k < 2; k++) {
        const s = 2.6 + r() * 2.2;
        crowns.setMatrixAt(i * 2 + k, m4.compose(new THREE.Vector3(x + (r() - 0.5) * 2, h * (0.62 + k * 0.22), z + (r() - 0.5) * 2), q, new THREE.Vector3(s, s * 0.9, s)));
        crowns.setColorAt(i * 2 + k, col.set(greens[Math.floor(r() * greens.length)]));
      }
    });
    crowns.castShadow = true;
    add(crowns);
    add(trunks);
  }
  // Evergreens and lawn trees in front of the office (as photographed).
  const ever = M('#2f4b2a', { roughness: 1 });
  for (const [x, z, h] of [[57, 28, 12], [116, 26, 10], [-14, 48, 9], [20, 52, 8]]) {
    const c = add(new THREE.Mesh(new THREE.ConeGeometry(h * 0.32, h, 10), ever));
    c.position.set(x, h / 2 + 0.8, z);
    c.castShadow = true;
  }
}
