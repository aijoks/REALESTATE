// Real surroundings for site 'tucson-snyder' (traced from satellite imagery / OSM).
// Called at the end of buildSuburban. ctx: { THREE, scene, add, flat, box, W, D, front, site, r, mats }
// Coordinates: building centred at origin, +z = the building's street front, metres.
//
// 7877 E Snyder Rd: the Walgreens (41 x 35 m) faces south onto Snyder Rd with
// its entrance tower on the SE corner toward the Sabino Canyon Rd signal.
// Model axes here: +z = south, +x = east. Parking wraps the east, south and
// north sides; a drive on the west side reaches Snyder Rd. North: Sabino
// Canyon Self Storage (teal metal roofs) and an office building; west: Bion
// CrossFit; east across Sabino Canyon Rd: Circle K.
//
// This file also exports `desertKit`, the small toolkit shared by the Tucson
// site files of this agent (tucson-university, tucson-saguaro-vista).
import { textTexture } from '../textures.js';

export function desertKit(ctx, { seed = 7 } = {}) {
  const { THREE, scene, add } = ctx;
  // Remove the generic suburban dressing (lots, stripes, cars, poles, sheds,
  // shrubs...) but keep the ground plane and the distant mountain ridge.
  const ground = scene.children[0];
  const ridges = [];
  for (const o of scene.children.slice()) {
    if (o === ground) continue;
    if (o.isMesh && o.geometry?.type === 'ConeGeometry' && o.material?.flatShading && o.scale.x > 1.5) { ridges.push(o); continue; }
    scene.remove(o);
  }
  let s = seed >>> 0;
  const r = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const cache = new Map();
  const M = (color, o = {}) => {
    const k = color + JSON.stringify(o);
    if (!cache.has(k)) cache.set(k, new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...o }));
    return cache.get(k);
  };
  const B = (color) => {
    const k = 'basic' + color;
    if (!cache.has(k)) cache.set(k, new THREE.MeshBasicMaterial({ color }));
    return cache.get(k);
  };
  const mat = {
    asphalt: M('#3d3e40', { roughness: 0.95 }),
    asphalt2: M('#55575a', { roughness: 0.95 }), // older, sun-faded lot
    road: M('#46484b', { roughness: 0.95 }),
    concrete: M('#c9c4ba'),
    dirt: M('#c4a882', { roughness: 1 }),
    gravel: M('#a88a6a', { roughness: 1 }),
    redgravel: M('#9a6a4f', { roughness: 1 }),
    lawn: M('#6f9a45', { roughness: 1 }),
    white: B('#e9e7e0'),
    yellow: B('#e6be2e'),
    blue: B('#2d6bb3'),
    kerb: M('#d4d0c7'),
  };
  // ---- ground pieces ----
  const flat = (m, x0, x1, z0, z1, y = 0.05) => {
    const g = new THREE.PlaneGeometry(Math.abs(x1 - x0), Math.abs(z1 - z0));
    const mesh = new THREE.Mesh(g, m);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.set((x0 + x1) / 2, y, (z0 + z1) / 2);
    mesh.receiveShadow = true;
    return add(mesh);
  };
  // An oriented strip from A to B of width w (roads, stripes, kerbs).
  const strip = (m, ax, az, bx, bz, w, y = 0.05) => {
    const len = Math.hypot(bx - ax, bz - az);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(len, w), m);
    mesh.rotation.set(-Math.PI / 2, 0, Math.atan2(-(bz - az), bx - ax));
    mesh.position.set((ax + bx) / 2, y, (az + bz) / 2);
    mesh.receiveShadow = true;
    return add(mesh);
  };
  const poly = (m, pts, y = 0.05) => {
    const sh = new THREE.Shape(pts.map(([x, z]) => new THREE.Vector2(x, -z)));
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(sh, 12), m);
    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = y;
    mesh.receiveShadow = true;
    return add(mesh);
  };
  const box = (m, w, h, d, x, y, z, ry = 0, shadow = true) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    mesh.rotation.y = ry;
    mesh.castShadow = shadow;
    mesh.receiveShadow = true;
    return add(mesh);
  };
  // Raised kerb along a line.
  const kerb = (ax, az, bx, bz, w = 0.3) => {
    const len = Math.hypot(bx - ax, bz - az);
    return box(mat.kerb, len, 0.15, w, (ax + bx) / 2, 0.075, (az + bz) / 2, -Math.atan2(bz - az, bx - ax), false);
  };
  // Dashed line along A-B.
  const dashes = (m, ax, az, bx, bz, dash = 3, gap = 6, w = 0.12, y = 0.075) => {
    const len = Math.hypot(bx - ax, bz - az);
    for (let t = 0; t + dash <= len; t += dash + gap) {
      const t0 = t / len, t1 = (t + dash) / len;
      strip(m, ax + (bx - ax) * t0, az + (bz - az) * t0, ax + (bx - ax) * t1, az + (bz - az) * t1, w, y);
    }
  };
  // A road segment A-B: asphalt, optional double-yellow centre, lane dashes,
  // kerbs and sidewalks. lanes = offsets (m, from the centre line) of white dashes.
  const road = (ax, az, bx, bz, w, { centre = 'double', lanes = [], walk = 0, kerbs = true, median = 0, y = 0.045 } = {}) => {
    const len = Math.hypot(bx - ax, bz - az);
    const ux = (bx - ax) / len, uz = (bz - az) / len;
    const nx = -uz, nz = ux; // left normal
    strip(mat.road, ax, az, bx, bz, w, y);
    const off = (o) => [ax + nx * o, az + nz * o, bx + nx * o, bz + nz * o];
    if (median) {
      const [a, b, c, d] = off(0);
      box(mat.kerb, len, 0.18, median, (a + c) / 2, 0.09, (b + d) / 2, -Math.atan2(bz - az, bx - ax), false);
      strip(mat.gravel, a, b, c, d, median - 0.4, 0.19);
    } else if (centre === 'double') {
      for (const o of [-0.15, 0.15]) strip(mat.yellow, ...off(o), 0.1, y + 0.03);
    }
    for (const o of lanes) dashes(mat.white, ...off(o));
    for (const sd of [-1, 1]) {
      if (kerbs) kerb(...off(sd * (w / 2 + 0.15)));
      if (walk) strip(mat.concrete, ...off(sd * (w / 2 + 0.3 + walk / 2)), walk, 0.12);
    }
  };
  // Streetcar rails along A-B.
  const rails = (ax, az, bx, bz) => {
    const len = Math.hypot(bx - ax, bz - az);
    const nx = -(bz - az) / len, nz = (bx - ax) / len;
    for (const o of [-0.72, 0.72]) strip(M('#8d8f92', { roughness: 0.4, metalness: 0.7 }), ax + nx * o, az + nz * o, bx + nx * o, bz + nz * o, 0.12, 0.08);
  };

  // ---- cars ----
  const carCols = ['#e8e8e6', '#9aa3ab', '#7a1d22', '#c9c3b5', '#2c3440', '#b8bcc2', '#1d1f22', '#5a6b7a', '#ffffff', '#8a8f6a'];
  const glassM = M('#3a4652', { roughness: 0.15, metalness: 0.5 });
  const tyreM = M('#18191a');
  const car = (x, z, ry, col) => {
    const g = new THREE.Group();
    const c = M(col ?? carCols[Math.floor(r() * carCols.length)], { roughness: 0.35, metalness: 0.5 });
    const truck = r() < 0.25;
    const body = new THREE.Mesh(new THREE.BoxGeometry(truck ? 5.3 : 4.6, truck ? 0.95 : 0.75, 1.85), c);
    body.position.y = truck ? 0.8 : 0.65;
    const cab = new THREE.Mesh(new THREE.BoxGeometry(truck ? 1.8 : 2.4, 0.62, 1.7), glassM);
    cab.position.set(truck ? 0.6 : -0.15, truck ? 1.58 : 1.33, 0);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(truck ? 1.7 : 2.1, 0.06, 1.66), c);
    roof.position.set(cab.position.x, cab.position.y + 0.32, 0);
    const tyres = new THREE.Mesh(new THREE.BoxGeometry(truck ? 3.9 : 3.3, 0.5, 1.8), tyreM);
    tyres.position.y = 0.28;
    g.add(body, cab, roof, tyres);
    g.traverse((o) => { if (o.isMesh) o.castShadow = true; });
    g.position.set(x, 0.05, z);
    g.rotation.y = ry;
    return add(g);
  };
  // A row of stalls along A-B; stalls extend `depth` to the left (side=1) or
  // right (side=-1) of the direction of travel. Cars parked with prob `fill`.
  const stalls = (ax, az, bx, bz, side = 1, { depth = 5.5, pitch = 2.75, fill = 0.55, ada = 0 } = {}) => {
    const len = Math.hypot(bx - ax, bz - az);
    const ux = (bx - ax) / len, uz = (bz - az) / len;
    const nx = -uz * side, nz = ux * side;
    const n = Math.floor(len / pitch);
    for (let k = 0; k <= n; k++) {
      const px = ax + ux * k * pitch, pz = az + uz * k * pitch;
      strip(mat.white, px, pz, px + nx * depth, pz + nz * depth, 0.12, 0.075);
    }
    for (let k = 0; k < n; k++) {
      const cx = ax + ux * (k + 0.5) * pitch + nx * depth * 0.5;
      const cz = az + uz * (k + 0.5) * pitch + nz * depth * 0.5;
      if (k < ada) { flat(mat.blue, cx - 0.6, cx + 0.6, cz - 0.6, cz + 0.6, 0.078); continue; }
      if (r() < fill) car(cx, cz, Math.atan2(-nz, nx) + (r() - 0.5) * 0.06);
    }
  };

  // ---- lights ----
  const poleM = M('#4a4038', { roughness: 0.5, metalness: 0.5 });
  const headM = M('#3a332d', { roughness: 0.5, metalness: 0.5, emissive: '#fff4d6', emissiveIntensity: 0.05 });
  const pole = (x, z, { h = 9, arms = 1, ry = 0 } = {}) => {
    box(M('#bdb6a8'), 0.7, 0.8, 0.7, x, 0.4, z, 0, false);
    box(poleM, 0.18, h, 0.18, x, h / 2, z);
    for (let k = 0; k < arms; k++) {
      const a = ry + k * Math.PI;
      box(headM, 1.0, 0.22, 0.5, x + Math.cos(a) * 0.55, h, z - Math.sin(a) * 0.55, a, false);
    }
  };

  // ---- planting ----
  const trunkM = M('#5b4a3a', { roughness: 1 });
  const leafs = {
    mesquite: [M('#6f7d3f', { roughness: 1 }), M('#7f8d4a', { roughness: 1 })],
    paloverde: [M('#9aab5c', { roughness: 1 }), M('#a8b86a', { roughness: 1 })],
    pine: [M('#3f5a34', { roughness: 1 }), M('#4b6a3c', { roughness: 1 })],
    ficus: [M('#4e6e34', { roughness: 1 }), M('#5a7c3c', { roughness: 1 })],
  };
  const ico = new THREE.IcosahedronGeometry(1, 1);
  const tree = (x, z, sc = 1, kind = 'mesquite') => {
    const L = leafs[kind] ?? leafs.mesquite;
    const th = (kind === 'pine' ? 3 : 1.8) * sc;
    box(trunkM, 0.3 * sc, th, 0.3 * sc, x, th / 2, z, r() * 3);
    const n = kind === 'pine' ? 4 : 5;
    for (let k = 0; k < n; k++) {
      const m = new THREE.Mesh(ico, L[k % 2]);
      const rad = (kind === 'pine' ? 1.6 : 1.7 + r() * 0.8) * sc;
      m.scale.set(rad, rad * (kind === 'pine' ? 1.4 : 0.42), rad);
      m.position.set(x + (r() - 0.5) * 2.6 * sc, th + (kind === 'pine' ? k * 1.4 * sc : (0.4 + r() * 0.9) * sc), z + (r() - 0.5) * 2.6 * sc);
      m.castShadow = true;
      add(m);
    }
  };
  const frondM = M('#56803a', { roughness: 1, side: THREE.DoubleSide });
  const palmTrunk = M('#8a7660', { roughness: 1 });
  const palm = (x, z, h = 12) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.32, h, 6), palmTrunk);
    t.position.set(x, h / 2, z);
    t.castShadow = true;
    add(t);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.7, 6, 4), M('#6b5a44', { roughness: 1 }));
    head.position.set(x, h - 0.2, z);
    add(head);
    for (let k = 0; k < 10; k++) {
      const a = (k / 10) * Math.PI * 2 + r();
      const f = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 3.0), frondM);
      f.rotation.order = 'YXZ';
      f.rotation.set(Math.PI / 2 - 0.45 - r() * 0.3, -a + Math.PI / 2, 0);
      f.position.set(x + Math.cos(a) * 1.3, h - 0.4, z + Math.sin(a) * 1.3);
      f.castShadow = true;
      add(f);
    }
  };
  const shrub = (x, z, sc = 1, color = '#7c8a4c') => {
    const m = new THREE.Mesh(ico, M(color, { roughness: 1 }));
    m.scale.set(0.9 * sc, 0.6 * sc, 0.9 * sc);
    m.position.set(x, 0.45 * sc, z);
    m.castShadow = true;
    return add(m);
  };
  const agaveM = M('#93ab9c', { roughness: 0.7 });
  const cone4 = new THREE.ConeGeometry(0.14, 1.5, 4);
  const agave = (x, z, sc = 1) => {
    for (let k = 0; k < 9; k++) {
      const a = (k / 9) * Math.PI * 2;
      const lf = new THREE.Mesh(cone4, agaveM);
      lf.scale.setScalar(sc);
      lf.position.set(x + Math.cos(a) * 0.3 * sc, 0.65 * sc, z + Math.sin(a) * 0.3 * sc);
      lf.rotation.set(Math.sin(a) * 0.7, 0, -Math.cos(a) * 0.7);
      add(lf);
    }
  };
  const cactusM = M('#4f6b3a', { roughness: 0.9 });
  const saguaro = (x, z, h = 7) => {
    const t = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.38, h, 8), cactusM);
    t.position.set(x, h / 2, z);
    t.castShadow = true;
    add(t);
    const sides = r() < 0.5 ? [-1, 1] : [r() < 0.5 ? -1 : 1];
    for (const sx of sides) {
      const ah = h * (0.25 + r() * 0.15);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, ah, 7), cactusM);
      arm.position.set(x + sx * 0.85, h * 0.5 + ah / 2, z);
      arm.castShadow = true;
      add(arm);
      const el = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.9, 7), cactusM);
      el.rotation.z = Math.PI / 2;
      el.position.set(x + sx * 0.45, h * 0.5, z);
      add(el);
    }
  };
  // Natural Sonoran desert: scattered creosote, palo verde, mesquite, saguaros.
  const desert = (x0, x1, z0, z1, density = 1, { saguaros = true, trees = true } = {}) => {
    const area = Math.abs((x1 - x0) * (z1 - z0));
    const n = Math.round((area / 90) * density);
    for (let k = 0; k < n; k++) {
      const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0);
      const p = r();
      if (trees && p < 0.12) tree(x, z, 0.7 + r() * 0.5, r() < 0.5 ? 'paloverde' : 'mesquite');
      else if (saguaros && p < 0.17) saguaro(x, z, 4 + r() * 5);
      else shrub(x, z, 0.6 + r() * 0.8, r() < 0.5 ? '#7d8650' : '#8e9160');
    }
  };
  // Gravel landscape bed with shrubs and optional trees.
  const bed = (x0, x1, z0, z1, { trees = 0, shrubs = 0, kind = 'mesquite', m = mat.gravel, y = 0.06 } = {}) => {
    flat(m, x0, x1, z0, z1, y);
    for (let k = 0; k < trees; k++) tree(x0 + (x1 - x0) * (k + 0.5) / trees, z0 + (z1 - z0) * (0.3 + r() * 0.4), 0.8 + r() * 0.4, kind);
    for (let k = 0; k < shrubs; k++) shrub(x0 + r() * (x1 - x0), z0 + r() * (z1 - z0), 0.6 + r() * 0.5);
  };

  // ---- buildings ----
  // A box building with parapet; roof: 'flat' | 'metal' (low-slope standing
  // seam) | 'hip' | 'gable'. Returns { top } (roof height).
  const seamTex = (bg, line) => {
    const k = 'seam' + bg;
    if (!cache.has(k)) {
      const t = textTexture({ width: 128, height: 128, bg, draw(c, w, h) { c.fillStyle = line; for (let x = 0; x < w; x += 16) c.fillRect(x, 0, 3, h); } });
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(8, 1);
      cache.set(k, new THREE.MeshStandardMaterial({ map: t, roughness: 0.5, metalness: 0.4 }));
    }
    return cache.get(k);
  };
  const hipGeo = (w, h, d) => {
    const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4, 1);
    g.rotateY(Math.PI / 4);
    g.scale(w, h, d);
    g.translate(0, h / 2, 0);
    return g;
  };
  const gableGeo = (len, span, rise) => {
    const sh = new THREE.Shape([new THREE.Vector2(-span / 2, 0), new THREE.Vector2(span / 2, 0), new THREE.Vector2(0, rise)]);
    const g = new THREE.ExtrudeGeometry(sh, { depth: len, bevelEnabled: false });
    g.translate(0, 0, -len / 2);
    g.rotateY(Math.PI / 2);
    return g;
  };
  const bldg = ({ x, z, w, d, h, ry = 0, color = '#e2d6c2', roof = 'flat', roofColor = '#d8d4cc', parapet = 0.5, rtu = 0, eave = 0.4, rise }) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    const wall = M(color);
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), wall);
    body.position.y = h / 2;
    body.castShadow = body.receiveShadow = true;
    g.add(body);
    if (roof === 'flat') {
      const top = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.4, d - 0.4), M(roofColor));
      top.rotation.x = -Math.PI / 2;
      top.position.y = h + 0.02;
      g.add(top);
      if (parapet) {
        for (const [pw, pd, px, pz] of [[w, 0.3, 0, d / 2 - 0.15], [w, 0.3, 0, -d / 2 + 0.15], [0.3, d, w / 2 - 0.15, 0], [0.3, d, -w / 2 + 0.15, 0]]) {
          const p = new THREE.Mesh(new THREE.BoxGeometry(pw, parapet, pd), wall);
          p.position.set(px, h + parapet / 2, pz);
          p.castShadow = true;
          g.add(p);
        }
      }
      for (let k = 0; k < rtu; k++) {
        const u = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.2, 1.6), M('#b9bcbe', { roughness: 0.5, metalness: 0.4 }));
        u.position.set((r() - 0.5) * (w - 4), h + 0.6, (r() - 0.5) * (d - 4));
        u.castShadow = true;
        g.add(u);
      }
    } else if (roof === 'metal') {
      const m = new THREE.Mesh(gableGeo(w + eave * 2, d + eave * 2, rise ?? 0.8), seamTex(roofColor, '#00000033'));
      m.position.y = h;
      m.castShadow = true;
      g.add(m);
    } else if (roof === 'hip') {
      const m = new THREE.Mesh(hipGeo(w + eave * 2, rise ?? Math.min(w, d) * 0.28, d + eave * 2), M(roofColor));
      m.position.y = h;
      m.castShadow = true;
      g.add(m);
    } else if (roof === 'gable') {
      const m = new THREE.Mesh(gableGeo(w + eave * 2, d + eave * 2, rise ?? d * 0.25), M(roofColor));
      m.position.y = h;
      m.castShadow = true;
      g.add(m);
    }
    add(g);
    return g;
  };
  // Glazing / storefront plane on a building face, placed in world coords:
  // (x, z) = centre of the panel on the wall, ry = wall facing angle (0 => +z).
  const glazing = (x, z, ry, w, h, y = 0.2, color = '#3c4a55') => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M(color, { roughness: 0.15, metalness: 0.5 }));
    m.position.set(x, y + h / 2, z);
    m.rotation.y = ry;
    return add(m);
  };
  // Text sign. bg null => transparent channel letters; otherwise a panel.
  const sign = (text, x, y, z, ry, { w = 6, h = 1.2, color = '#c8102e', bg = null, font = '800 {s}px Arial', glow = 0.25, sub = null, subColor, border = null, depth = 0 } = {}) => {
    const tw = 1024, th = Math.max(64, Math.round((1024 * h) / w));
    const tex = textTexture({
      width: tw, height: th, bg: bg ?? 'rgba(0,0,0,0)',
      draw(c, cw, ch) {
        if (border) { c.strokeStyle = border; c.lineWidth = ch * 0.06; c.strokeRect(ch * 0.05, ch * 0.05, cw - ch * 0.1, ch - ch * 0.1); }
        c.fillStyle = color; c.textAlign = 'center'; c.textBaseline = 'middle';
        let fs = Math.round(ch * (sub ? 0.5 : 0.72));
        c.font = font.replace('{s}', fs);
        while (c.measureText(text).width > cw * 0.92 && fs > 8) { fs -= 4; c.font = font.replace('{s}', fs); }
        c.fillText(text, cw / 2, sub ? ch * 0.38 : ch / 2 + ch * 0.03);
        if (sub) {
          c.fillStyle = subColor ?? color;
          let ss = Math.round(ch * 0.26);
          c.font = `700 ${ss}px Arial`;
          while (c.measureText(sub).width > cw * 0.9 && ss > 8) { ss -= 2; c.font = `700 ${ss}px Arial`; }
          c.fillText(sub, cw / 2, ch * 0.78);
        }
      },
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: !bg, roughness: 0.5, emissive: '#ffffff', emissiveMap: tex, emissiveIntensity: glow, depthWrite: !!bg }));
    m.position.set(x, y, z);
    m.rotation.y = ry;
    if (depth && bg) {
      const back = box(M(bg), w, h, depth, x - Math.sin(ry) * (depth / 2 + 0.01), y, z - Math.cos(ry) * (depth / 2 + 0.01), ry);
      back.castShadow = true;
    }
    return add(m);
  };
  // Monument / pylon sign on a base.
  const monument = (text, x, z, ry, { w = 3, h = 2, color = '#ffffff', bg = '#c8102e', base = '#b9a58a', sub, font } = {}) => {
    box(M(base), w + 0.6, 0.8, 0.9, x, 0.4, z, ry);
    const fx = Math.sin(ry) * 0.36, fz = Math.cos(ry) * 0.36;
    box(M(bg), w, h, 0.7, x, 0.8 + h / 2, z, ry);
    sign(text, x + fx, 0.8 + h / 2, z + fz, ry, { w: w * 0.96, h: h * 0.9, color, bg, sub, font, glow: 0.2 });
    sign(text, x - fx, 0.8 + h / 2, z - fz, ry + Math.PI, { w: w * 0.96, h: h * 0.9, color, bg, sub, font, glow: 0.2 });
  };
  // Fuel canopy: flat roof on columns with a coloured fascia band.
  const canopy = (x, z, w, d, ry, { h = 5, fascia = '#e21b23', band = '#ffffff', brand, brandColor = '#ffffff' } = {}) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    g.rotation.y = ry;
    const top = new THREE.Mesh(new THREE.BoxGeometry(w, 1.0, d), M(fascia));
    top.position.y = h + 0.5;
    top.castShadow = true;
    const strip2 = new THREE.Mesh(new THREE.BoxGeometry(w + 0.04, 0.25, d + 0.04), M(band));
    strip2.position.y = h + 0.2;
    const under = new THREE.Mesh(new THREE.PlaneGeometry(w, d), M('#f4f2ec', { emissive: '#ffffff', emissiveIntensity: 0.3 }));
    under.rotation.x = Math.PI / 2;
    under.position.y = h - 0.01;
    g.add(top, strip2, under);
    const nx = Math.max(1, Math.round(w / 8));
    for (let i = 0; i < nx; i++) {
      const cx = -w / 2 + (w / nx) * (i + 0.5);
      for (const cz of [-d / 4, d / 4]) {
        const c = new THREE.Mesh(new THREE.BoxGeometry(0.5, h, 0.5), M('#e8e6e0'));
        c.position.set(cx, h / 2, cz);
        c.castShadow = true;
        const disp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.7, 0.6), M('#d8d8d8'));
        disp.position.set(cx, 0.95, cz);
        g.add(c, disp);
        const island = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.2, 4), M('#c9c4ba'));
        island.position.set(cx, 0.1, cz);
        g.add(island);
      }
    }
    add(g);
    if (brand) {
      const c = Math.cos(ry), sn = Math.sin(ry);
      for (const sd of [1, -1]) {
        const lx = 0, lz = sd * (d / 2 + 0.03);
        sign(brand, x + c * lx + sn * lz, h + 0.5, z - sn * lx + c * lz, ry + (sd < 0 ? Math.PI : 0), { w: Math.min(w * 0.5, 8), h: 0.85, color: brandColor, glow: 0.35 });
      }
    }
    return g;
  };
  // A single-family house with a hip roof (tile or shingle).
  const house = (x, z, w, d, ry = 0, { wall = '#e3d3b8', roof = '#a8623e', h = 3.2 } = {}) => {
    bldg({ x, z, w, d, h, ry, color: wall, roof: 'hip', roofColor: roof, rise: Math.min(w, d) * 0.22, eave: 0.5 });
  };
  // Masonry wall along A-B.
  const wallRun = (ax, az, bx, bz, h = 1.8, color = '#c9b597', t = 0.25) => {
    const len = Math.hypot(bx - ax, bz - az);
    return box(M(color), len, h, t, (ax + bx) / 2, h / 2, (az + bz) / 2, -Math.atan2(bz - az, bx - ax));
  };
  const flipRidges = () => { for (const m of ridges) m.position.z *= -1; };

  return { THREE, r, M, B, mat, flat, strip, poly, box, kerb, dashes, road, rails, car, stalls, pole, tree, palm, shrub, agave, saguaro, desert, bed, bldg, glazing, sign, monument, canopy, house, wallRun, hipGeo, gableGeo, seamTex, flipRidges, ridges };
}

export function site_tucson_snyder(ctx) {
  const K = desertKit(ctx, { seed: 7877 });
  const { mat, flat, poly, road, kerb, stalls, pole, tree, bed, desert, bldg, sign, monument, canopy, house, box, M, strip, saguaro, agave, shrub, wallRun, glazing } = K;
  const { W, D } = ctx; // 41 x 35 m store, +z = south (Snyder Rd), +x = east (Sabino Canyon Rd)
  const n = -D / 2, so = D / 2, w = -W / 2, e = W / 2;

  // ---- roads ----
  // E Snyder Rd: kerb-to-kerb z 62.3..74.3, double yellow at z 68.
  road(-420, 68, 82, 68, 12, { lanes: [], walk: 0 });
  road(97, 68, 420, 68, 12, {});
  flat(mat.road, 81, 97, 62, 74, 0.046); // intersection box
  for (const x of [80, 98]) for (let k = 0; k < 8; k++) strip(mat.white, x - 2 + k * 0.5, 61.5, x - 2 + k * 0.5, 74.5, 0.25, 0.07); // crosswalk bars
  // N Sabino Canyon Rd: x 81..97 north of Snyder, centre x 89; south of the
  // signal it bends SSW toward Tanque Verde.
  road(89, 62, 89, -420, 16, { lanes: [-4, 4], centre: 'double' });
  road(89, 74.5, 60, 145, 16, { lanes: [-4, 4] });
  road(60, 145, 20, 420, 16, { lanes: [-4, 4] });
  // Side street south of Snyder opposite the store (to the Sabino Enclave homes).
  road(-5, 74.5, -5, 200, 8, { centre: 'none' });
  // West: the local road climbing north to the hillside homes.
  road(-178, 74.5, -178, -400, 8, { centre: 'none' });

  // ---- Walgreens lot ----
  // Paving: everything from the storage wall (z -28/-38.6) to z 34.6, x -39..57.
  flat(mat.asphalt2, -39, 57, -34.5, 34.6, 0.05);
  flat(mat.asphalt2, -12, 57, -38.6, -34.5, 0.05);
  // West drive to Snyder Rd (x -38..-22) with flared mouth.
  flat(mat.asphalt2, -38, -22, 34.6, 62.3, 0.05);
  poly(mat.asphalt2, [[-38, 52], [-44, 62.3], [-16, 62.3], [-22, 52]], 0.05);
  kerb(-38, 34.6, -38, 52); kerb(-22, 34.6, -22, 52);
  // NE entry from Sabino Canyon Rd between the lot and the storage drive.
  poly(mat.asphalt2, [[57, -28], [81, -30], [81, -14], [57, -16]], 0.05);
  // Storefront sidewalks (raised) on the south and east sides + entrance apron.
  box(mat.concrete, W + 1, 0.15, 3.6, 0, 0.075, so + 1.8, 0, false);
  box(mat.concrete, 3.6, 0.15, D + 1, e + 1.8, 0.075, 0, 0, false);
  poly(M('#b5674a'), [[e - 3, so + 3.6], [e + 3.6, so - 3], [e + 7.5, so + 1], [e + 1, so + 7.5]], 0.17); // red apron at the doors
  // Stall rows (cars) — south row nose-in toward Snyder Rd.
  stalls(40, 28.3, -14, 28.3, -1, { depth: 6, fill: 0.5, ada: 3 });
  // East double row x 31..43 (z -20..20) split by a striped centre line.
  stalls(37, -20, 37, 20, 1, { depth: 6, fill: 0.45 });
  stalls(37, -20, 37, 20, -1, { depth: 6, fill: 0.4 });
  bed(31, 43, -21.2, -20, { trees: 1, kind: 'mesquite' });
  bed(31, 43, 20, 21.4, { shrubs: 2 }); // (its mesquite is left out: it would sit in the corner-entrance view)
  // Single row along the east edge, nose-in east.
  stalls(51, -14, 51, 26, -1, { depth: 6, fill: 0.35 });
  // North row along the storage wall, nose-in north.
  stalls(-6, -27.4, 52, -27.4, -1, { depth: 6, fill: 0.2 });
  bed(-6, 57, -38.6, -33.6, { shrubs: 14, m: mat.redgravel });
  // Drive-aisle arrows.
  for (const [x, z, ry] of [[10, 24.5, -Math.PI / 2], [27, 4, 0], [-30, 10, Math.PI]]) arrow(ctx, K, x, z, ry);
  // Light poles (shoebox heads) as in the satellite: along the south row and east lot.
  for (const x of [-25, -3, 18, 36]) pole(x, 27.6, { arms: 1, ry: Math.PI / 2 });
  for (const z of [-20, 0, 20]) pole(37, z, { arms: 2 });
  pole(-30, -20, { arms: 1 });

  // ---- landscaping ----
  // South strip between the lot and Snyder Rd (mesquites and palo verdes),
  // natural desert closer to the road.
  bed(-38, 57, 34.6, 43, { trees: 0, shrubs: 0, m: mat.redgravel });
  for (const [x, k] of [[-12, 'mesquite'], [3, 'paloverde'], [19, 'mesquite'], [33, 'paloverde'], [47, 'mesquite']]) tree(x, 38.5, 0.75, k);
  flat(mat.dirt, -38, 81, 43, 62, 0.03);
  desert(-14, 78, 46, 60, 0.35, { saguaros: false });
  // East buffer to Sabino Canyon Rd.
  bed(57, 80.7, -16, 34.6, { m: mat.redgravel });
  desert(59, 79, -12, 42, 0.7, { saguaros: true });
  for (const [x, z] of [[62, 5], [66, 20], [72, -6]]) tree(x, z, 1.2, 'mesquite');
  agave(46, 31.5, 1.2);
  // Planters at the store corners.
  for (const [x, z] of [[w - 1.5, so + 2], [e + 2, n - 1.5]]) shrub(x, z, 1.2);
  // Pharmacy drive-thru canopy on the west wall + dumpster enclosure NW.
  {
    const cx = -23.8;
    for (const z of [-15, 8]) box(M('#e6d3b4'), 0.6, 4, 0.6, cx, 2, z);
    box(M('#e6d3b4'), 3.6, 0.6, 25, cx + 1.4, 4.2, -3.5);
    box(M('#b9805a'), 4.0, 0.25, 25.4, cx + 1.4, 4.6, -3.5);
    sign('PHARMACY DRIVE-THRU', cx - 0.32, 3.75, -3.5, -Math.PI / 2, { w: 7, h: 0.5, color: '#c8102e', glow: 0.3 });
    box(M('#cdbb9c'), 8.5, 2.2, 5.5, -14.5, 1.1, -20.6);
  }
  // Walgreens pylon at the Snyder Rd driveway.
  monument('Walgreens', -12, 50, 0, { w: 4.2, h: 1.4, bg: '#ffffff', color: '#c8102e', base: '#d6bd94', font: 'italic 700 {s}px "Brush Script MT", Georgia, cursive' });

  // ---- Sabino Canyon Self Storage (4819 N Sabino Canyon Rd) ----
  const teal = '#3f8f86';
  const stor = (x0, x1, z0, z1, h = 3.4) => bldg({ x: (x0 + x1) / 2, z: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0, h, color: '#d8ccb6', roof: 'metal', roofColor: teal, rise: 0.6, eave: 0.2 });
  flat(mat.asphalt2, -152, 62, -112, -38.6, 0.045);
  stor(-150, 36, -49.5, -38.6);
  stor(-129, -11.6, -38.6, -27.6);
  stor(-140, -40.6, -70, -59);
  stor(-140, -40.6, -85.6, -75.5);
  stor(-150, -40.6, -102, -95);
  stor(-28.5, -21.7, -101, -67.6);
  stor(-21, 37, -67.6, -60.6);
  bldg({ x: 48, z: -45.6, w: 14.6, d: 14, h: 4.2, color: '#d8ccb6', roof: 'hip', roofColor: teal, rise: 3 }); // office
  sign('SABINO CANYON SELF STORAGE', 55.4, 3.0, -45.6, Math.PI / 2, { w: 9, h: 0.9, color: '#1f5f58', bg: '#f2ead8', glow: 0.1 });
  monument('SABINO CANYON', 76, -50, Math.PI / 2, { w: 3.4, h: 1.5, bg: '#2f6f68', color: '#f6efe0', sub: 'SELF STORAGE', base: '#b9a58a' });
  // RVs and trailers in the storage yard.
  for (let k = 0; k < 9; k++) box(M(k % 3 ? '#efefea' : '#d9d4c8'), 2.5, 3.0, 9, -110 + k * 6.5, 1.6, -108 + (k % 2) * 2, 0);
  // Storage perimeter walls.
  wallRun(-152, -112, 62, -112, 2.4);
  wallRun(-152, -112, -152, -38.6, 2.4);

  // ---- office building north of the storage (4825 N Sabino Canyon Rd) ----
  bldg({ x: 14, z: -124.5, w: 39, d: 64, h: 8.2, color: '#ece6da', rtu: 10, roofColor: '#efefec' });
  flat(mat.asphalt2, 34, 62, -160, -70, 0.045);
  stalls(40, -150, 40, -75, -1, { depth: 5.5, fill: 0.4 });
  stalls(56, -150, 56, -75, 1, { depth: 5.5, fill: 0.3 });
  sign('4825', 33.6, 6.2, -100, Math.PI / 2, { w: 2.4, h: 0.8, color: '#5a5045', glow: 0 });

  // ---- Bion CrossFit (7801 E Snyder Rd) ----
  flat(mat.asphalt2, -160, -84, -12, 30, 0.045);
  bldg({ x: -103, z: 5.4, w: 26, d: 24, h: 7.6, color: '#f2f0ea', rtu: 0 });
  for (let k = 0; k < 8; k++) box(M('#1e2b3f', { roughness: 0.3, metalness: 0.5 }), 2.2, 0.12, 5, -112 + k * 2.6, 7.95, 3 + (k % 2) * 0.01, 0, false);
  glazing(-103, 17.42, 0, 12, 2.4, 0.3);
  sign('BION CROSSFIT', -103, 5.6, 17.45, 0, { w: 9, h: 1.0, color: '#1b1b1b', glow: 0 });
  stalls(-150, 24, -90, 24, 1, { depth: 5.5, fill: 0.3 });
  stalls(-150, -6, -120, -6, -1, { depth: 5.5, fill: 0.2 });
  road(-122, 30, -122, 62.3, 7, { centre: 'none', kerbs: false });
  desert(-84, -40, -30, 60, 0.9);
  desert(-160, -124, 30, 60, 0.6);

  // ---- east of Sabino Canyon Rd: Circle K (4808 N Sabino Canyon Rd) ----
  flat(mat.asphalt2, 98, 185, -30, 60, 0.045);
  canopy(130, 12, 26, 13, 0, { fascia: '#e21b23', band: '#f39c1f', brand: 'CIRCLE K', h: 5 });
  bldg({ x: 160, z: -12, w: 26, d: 15, h: 5.5, color: '#efe9de', rtu: 2 });
  box(M('#e21b23'), 26.2, 0.9, 0.4, 160, 5.0, -4.3, 0);
  sign('CIRCLE K', 160, 4.9, -4.05, 0, { w: 6, h: 0.75, color: '#ffffff', glow: 0.3 });
  glazing(160, -4.45, 0, 16, 2.6, 0.3);
  monument('CIRCLE K', 101, 50, -Math.PI / 2, { w: 2.4, h: 2.4, bg: '#e21b23', color: '#ffffff', base: '#b9a58a' });
  for (const [x, z] of [[118, 0], [146, 2], [170, -30]]) K.car(x, z, Math.PI / 2);
  // Offices/apartments along the east side of Sabino Canyon Rd, north of Circle K.
  for (const [x, z, ww, dd] of [[128, -60, 12, 30], [150, -62, 20, 12], [128, -120, 20, 24], [160, -150, 30, 16]]) bldg({ x, z, w: ww, d: dd, h: 6.5, color: '#e7e2d8', rtu: 2, roofColor: '#f0efeb' });
  bldg({ x: 127, z: -157, w: 22, d: 14, h: 5, color: '#e9dcc4', roof: 'hip', roofColor: '#4e6f9a', rise: 2.5 });
  sign('SABINO CANYON VETERINARY CARE', 127, 3.4, -149.9, 0, { w: 9, h: 0.8, color: '#2c4a6e', glow: 0 });
  desert(98, 200, 74, 160, 0.6);
  desert(98, 200, 60, 74, 0.0);

  // ---- residential: hillside homes north-west, the Sabino Enclave south ----
  const tileRoof = ['#a8623e', '#b56d45', '#9c5a3a', '#b9774c'];
  for (const [x, z, ry] of [[-150, 100, 0.2], [-128, 112, -0.1], [-102, 108, 0.4], [-76, 116, 0], [-40, 104, -0.3], [-22, 128, 0.2], [18, 104, 0.1], [36, 128, -0.4], [-60, 145, 0.15], [-100, 150, -0.2], [20, 160, 0.3], [-30, 170, 0]]) {
    house(x, z, 15 + K.r() * 5, 12 + K.r() * 4, ry, { roof: tileRoof[Math.floor(K.r() * 4)] });
  }
  desert(-200, 60, 80, 200, 0.35, { saguaros: true });
  for (const [x, z] of [[-60, -170], [-30, -180], [-90, -175], [0, -200], [-130, -160], [-160, -190]]) house(x, z, 14, 12, K.r() - 0.5, { roof: tileRoof[Math.floor(K.r() * 4)] });
  desert(-200, -40, -150, -112, 0.6);
  desert(-200, -160, -112, 60, 0.4);
  saguaro(-55, 58, 7.5);
  saguaro(70, 55, 6.5);
}

// Small painted arrow on the pavement (helper class keeps the call site terse).
export function arrow(ctx, K, x, z, ry) {
  const { THREE } = ctx;
  const sh = new THREE.Shape([[-0.25, -1.4], [0.25, -1.4], [0.25, 0.3], [0.7, 0.3], [0, 1.4], [-0.7, 0.3], [-0.25, 0.3]].map(([a, b]) => new THREE.Vector2(a, b)));
  const m = new THREE.Mesh(new THREE.ShapeGeometry(sh), K.mat.white);
  m.rotation.set(-Math.PI / 2, 0, ry);
  m.position.set(x, 0.078, z);
  ctx.add(m);
}
