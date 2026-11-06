// Real surroundings for site 'shelton-parrott' (1 Parrott Drive, Shelton CT).
// Called by buildSuburban with site.bare (no generic lots / trees / sheds).
// ctx: { THREE, scene, add, flat, box, W, D, front, site, r, mats }
//
// Model frame: origin = centre of the building footprint, +x = along the
// building toward SSW, +z = toward WNW (the glazed office front); the long
// axis is 17.2 deg east of north, so real north is (-cos17.2, +sin17.2).
// Every road centreline, parking lot, neighbouring footprint and tree spot
// comes from shelton-parrott.data.js, generated from OpenStreetMap ways and
// the satellite canopy, converted into this frame:
//   - Parrott Drive leaves Bridgeport Ave (SR 714) opposite Fairchild Dr,
//     curves north past the Fountain Square entrance and the site's south
//     driveway, runs straight up the building's east side and ends in a
//     turnaround with drives on to the hotel / office lots to the north.
//   - The site's own drives: the south driveway into the big south lot, the
//     long west lot along the office front with its drop-off loop at the CARA
//     lobby, the north drive back out to Parrott Drive, and the east loading
//     lot / driveway.
//   - Progress Drive (west) does NOT connect to Parrott Drive.
import { textTexture } from '../textures.js';
import { roads, lots, bldgs, trees } from './shelton-parrott.data.js';

const LOOP_ID = 793944528; // OSM ring of the drop-off loop (drawn as a ring)
const PUBLIC = new Set(['secondary', 'tertiary', 'residential', 'unclassified']);

export function site_shelton_parrott(ctx) {
  const { THREE, add, r, mats } = ctx;
  const { asphalt, white, yellow, grass, kerbMat } = mats;
  const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.9, ...o });
  const lotMat = M('#4a4b4e', { roughness: 0.95 });
  const driveMat = M('#424346', { roughness: 0.95 });

  // ---------------- geometry helpers ----------------
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  const segDist = (p, a, b) => {
    const dx = b[0] - a[0]; const dz = b[1] - a[1]; const L = dx * dx + dz * dz;
    const t = L ? Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / L)) : 0;
    return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dz);
  };
  const lineDist = (p, pts) => { let d = Infinity; for (let i = 0; i < pts.length - 1; i++) d = Math.min(d, segDist(p, pts[i], pts[i + 1])); return d; };
  const inside = (pt, poly) => {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, zi] = poly[i]; const [xj, zj] = poly[j];
      if ((zi > pt[1]) !== (zj > pt[1]) && pt[0] < ((xj - xi) * (pt[1] - zi)) / (zj - zi) + xi) c = !c;
    }
    return c;
  };
  // Centripetal Catmull-Rom resampling (~2 m steps) for smooth curves.
  const smooth = (pts, step = 2) => {
    if (pts.length < 3) return pts.slice();
    const out = [];
    const P = [[2 * pts[0][0] - pts[1][0], 2 * pts[0][1] - pts[1][1]], ...pts,
      [2 * pts.at(-1)[0] - pts.at(-2)[0], 2 * pts.at(-1)[1] - pts.at(-2)[1]]];
    for (let i = 1; i < P.length - 2; i++) {
      const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
      const t01 = Math.sqrt(dist(p0, p1)) || 1e-3; const t12 = Math.sqrt(dist(p1, p2)) || 1e-3; const t23 = Math.sqrt(dist(p2, p3)) || 1e-3;
      const n = Math.max(1, Math.ceil(dist(p1, p2) / step));
      for (let k = 0; k < n; k++) {
        const u = k / n;
        const v = [0, 1].map((c) => {
          const m1 = (p2[c] - p1[c] + t12 * ((p1[c] - p0[c]) / t01 - (p2[c] - p0[c]) / (t01 + t12)));
          const m2 = (p2[c] - p1[c] + t12 * ((p3[c] - p2[c]) / t23 - (p3[c] - p1[c]) / (t12 + t23)));
          const a = 2 * p1[c] - 2 * p2[c] + m1 + m2; const b = -3 * p1[c] + 3 * p2[c] - 2 * m1 - m2;
          return a * u * u * u + b * u * u + m1 * u + p1[c];
        });
        out.push(v);
      }
    }
    out.push(pts.at(-1).slice());
    return out;
  };
  // Unit left normal at each vertex (mitred, clamped).
  const normals = (pts) => pts.map((p, i) => {
    const a = pts[Math.max(0, i - 1)]; const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0]; const dz = b[1] - a[1]; const L = Math.hypot(dx, dz) || 1;
    return [-dz / L, dx / L];
  });
  // Flat ribbon along a polyline; w = width or per-vertex widths.
  const ribbon = (pts, w, mat, y) => {
    const ns = normals(pts);
    const pos = []; const idx = [];
    pts.forEach((p, i) => {
      const h = (Array.isArray(w) ? w[i] : w) / 2;
      pos.push(p[0] + ns[i][0] * h, y, p[1] + ns[i][1] * h, p[0] - ns[i][0] * h, y, p[1] - ns[i][1] * h);
      if (i) { const k = (i - 1) * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    // Make sure the faces point up.
    if (g.attributes.normal.getY(0) < 0) { for (let i = 0; i < idx.length; i += 3) [idx[i + 1], idx[i + 2]] = [idx[i + 2], idx[i + 1]]; g.setIndex(idx); g.computeVertexNormals(); }
    const m = add(new THREE.Mesh(g, mat));
    m.receiveShadow = true;
    return m;
  };
  const poly = (pts, mat, y) => {
    const sh = new THREE.Shape();
    pts.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)));
    const m = add(new THREE.Mesh(new THREE.ShapeGeometry(sh), mat));
    m.rotation.x = -Math.PI / 2;
    m.position.y = y;
    m.receiveShadow = true;
    return m;
  };
  const disc = (x, z, rad, mat, y) => {
    const m = add(new THREE.Mesh(new THREE.CircleGeometry(rad, 40), mat));
    m.rotation.x = -Math.PI / 2;
    m.position.set(x, y, z);
    m.receiveShadow = true;
    return m;
  };
  // Dashed / solid paint line offset `off` from a centreline.
  const paint = (pts, off, mat, y, dash = 0, gap = 0, lw = 0.12) => {
    const ns = normals(pts);
    const line = pts.map((p, i) => [p[0] + ns[i][0] * off, p[1] + ns[i][1] * off]);
    if (!dash) { ribbon(line, lw, mat, y); return; }
    let run = []; let s = 0;
    for (let i = 0; i < line.length; i++) {
      if (i) s += dist(line[i], line[i - 1]);
      const on = s % (dash + gap) < dash;
      if (on) run.push(line[i]);
      if ((!on || i === line.length - 1) && run.length > 1) { ribbon(run, lw, mat, y); run = []; } else if (!on) run = [];
    }
  };

  // ---------------- roads ----------------
  const ring = roads.find((rd) => rd.id === LOOP_ID);
  const net = roads.filter((rd) => rd.id !== LOOP_ID).map((rd) => {
    const curvy = PUBLIC.has(rd.k) || rd.k === 'driveway' || rd.k === 'service';
    const pts = curvy ? smooth(rd.p) : rd.p;
    let w = rd.w;
    // Parrott Drive widens to turn lanes at Bridgeport Ave.
    if (rd.n === 'Parrott Drive') w = pts.map(([x, z]) => 10 + 4 * Math.max(0, Math.min(1, (x - 100) / 25)) * (z < -70 ? 1 : 0));
    return { ...rd, pts, wv: w, pub: PUBLIC.has(rd.k) };
  });
  const halfAt = (rd, i) => (Array.isArray(rd.wv) ? rd.wv[i] : rd.wv) / 2;
  const Y = { secondary: 0.07, tertiary: 0.066, residential: 0.064, unclassified: 0.064, service: 0.058, driveway: 0.056, 'drive-through': 0.054, parking_aisle: 0.05 };
  for (const rd of net) ribbon(rd.pts, rd.wv, rd.pub ? asphalt : driveMat, Y[rd.k] ?? 0.056);

  // Junction flares: where a road ends on another road, widen its mouth so
  // the corners read as kerb returns instead of square cuts.
  for (const rd of net) {
    for (const end of [0, 1]) {
      const pts = end ? [...rd.pts].reverse() : rd.pts;
      const E = pts[0];
      const host = net.find((o) => o !== rd && (o.pub || !rd.pub) && lineDist(E, o.pts) < 0.6
        && !(o.k === rd.k && o.n === rd.n && Math.min(dist(E, o.pts[0]), dist(E, o.pts.at(-1))) < 0.6));
      if (!host) continue;
      let hi = 0; let hd = Infinity;
      host.pts.forEach((p, i) => { const d = dist(p, E); if (d < hd) { hd = d; hi = i; } });
      const hw = halfAt(host, hi);
      const fr = rd.pub && host.pub ? 7 : rd.k === 'parking_aisle' ? 2 : 3.5;
      let k = 1; while (k < pts.length - 1 && dist(pts[k], E) < hw + fr + 1) k++;
      const dx = pts[k][0] - E[0]; const dz = pts[k][1] - E[1]; const L = Math.hypot(dx, dz);
      if (L < hw + 1) continue;
      const d = [dx / L, dz / L]; const n = [-d[1], d[0]];
      const bw = (Array.isArray(rd.wv) ? rd.wv[end ? rd.wv.length - 1 : 0] : rd.wv) / 2;
      const at = (along, off) => [E[0] + d[0] * along + n[0] * off, E[1] + d[1] * along + n[1] * off];
      // Concave quarter-circle returns of radius fr on both sides.
      const side = (s) => {
        const out = [];
        for (let t = 0; t <= 8; t++) {
          const th = Math.PI + (t / 8) * (Math.PI / 2);
          out.push(at(hw + fr + fr * Math.cos(th), s * (bw + fr + fr * Math.sin(th))));
        }
        return out;
      };
      const shape = [at(hw - 0.4, bw + fr), ...side(1), ...side(-1).reverse(), at(hw - 0.4, -(bw + fr))];
      poly(shape, rd.pub ? asphalt : driveMat, (Y[rd.k] ?? 0.056) - 0.003);
    }
  }

  // Parrott Drive turnaround at its north end, and the drop-off loop.
  const parrott = net.find((rd) => rd.n === 'Parrott Drive');
  {
    const end = parrott.p.reduce((a, b) => (b[0] < a[0] ? b : a));
    disc(end[0] - 4, end[1] + 3, 15, asphalt, 0.063);
  }
  if (ring) {
    const cx = ring.p.reduce((s, p) => s + p[0], 0) / ring.p.length;
    const cz = ring.p.reduce((s, p) => s + p[1], 0) / ring.p.length;
    disc(cx, cz, 11.2, driveMat, 0.057);
    const isl = add(new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 0.25, 40), grass));
    isl.position.set(cx, 0.13, cz);
    const k = add(new THREE.Mesh(new THREE.TorusGeometry(5, 0.18, 6, 40), kerbMat));
    k.rotation.x = -Math.PI / 2;
    k.position.set(cx, 0.17, cz);
  }

  // ---------------- parking lots ----------------
  for (const l of lots) poly(l, lotMat, 0.04);
  // Paved apron in front of the industrial wing entrance (photographed).
  poly([[-10.6, 24.5], [8, 24.5], [8, 37], [-10.6, 37]], lotMat, 0.041);

  // ---------------- kerbs on the public roads ----------------
  {
    const spots = [];
    for (const rd of net) {
      if (!rd.pub) continue;
      const ns = normals(rd.pts);
      for (let i = 0; i < rd.pts.length - 1; i++) {
        const a = rd.pts[i]; const b = rd.pts[i + 1]; const L = dist(a, b);
        for (let t = 0; t < L; t += 1.2) {
          const u = t / L;
          const p = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
          const n = ns[i]; const h = halfAt(rd, i) + 0.15;
          for (const s of [1, -1]) {
            const q = [p[0] + n[0] * h * s, p[1] + n[1] * h * s];
            if (net.some((o) => o !== rd && lineDist(q, o.pts) < (Array.isArray(o.wv) ? 7 : o.wv / 2) + (o.pub && rd.pub ? 7.5 : 4))) continue;
            spots.push([q[0], q[1], Math.atan2(-(b[1] - a[1]), b[0] - a[0])]);
          }
        }
      }
    }
    const km = new THREE.InstancedMesh(new THREE.BoxGeometry(1.25, 0.14, 0.28), kerbMat, spots.length);
    const m4 = new THREE.Matrix4(); const q = new THREE.Quaternion(); const e = new THREE.Euler(); const one = new THREE.Vector3(1, 1, 1);
    spots.forEach(([x, z, ry], i) => km.setMatrixAt(i, m4.compose(new THREE.Vector3(x, 0.07, z), q.setFromEuler(e.set(0, ry, 0)), one)));
    km.receiveShadow = true;
    add(km);
  }

  // ---------------- markings ----------------
  // Bridgeport Ave (SR 714): double yellow centre, dashed lane lines, edge lines.
  for (const rd of net.filter((o) => o.k === 'secondary')) {
    const y = Y.secondary + 0.006;
    for (const o of [-0.14, 0.14]) paint(rd.pts, o, yellow, y);
    for (const o of [-4.3, 4.3]) paint(rd.pts, o, white, y, 3, 9);
    for (const o of [-7.9, 7.9]) paint(rd.pts, o, white, y);
  }
  // Parking stalls along the aisles that run through striped lots.
  const carSpots = [];
  {
    const stripes = [];
    const blocked = (p, self) => net.some((o) => o !== self && lineDist(p, o.pts) < (Array.isArray(o.wv) ? 7 : o.wv / 2) + 0.4)
      || bldgs.some((b) => inside(p, b.p));
    for (const rd of net.filter((o) => o.k === 'parking_aisle')) {
      for (let i = 0; i < rd.p.length - 1; i++) {
        const a = rd.p[i]; const b = rd.p[i + 1]; const L = dist(a, b);
        if (L < 8) continue;
        const d = [(b[0] - a[0]) / L, (b[1] - a[1]) / L]; const n = [-d[1], d[0]];
        for (let t = 3; t < L - 2.5; t += 2.75) {
          for (const s of [1, -1]) {
            const p0 = [a[0] + d[0] * t + n[0] * s * 3.4, a[1] + d[1] * t + n[1] * s * 3.4];
            const p1 = [p0[0] + n[0] * s * 5.2, p0[1] + n[1] * s * 5.2];
            const mid = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
            if (!lots.some((l) => inside(p0, l) && inside(p1, l))) continue;
            if (blocked(p1, rd) || blocked(mid, rd)) continue;
            stripes.push([mid[0], mid[1], Math.atan2(-n[1], n[0])]);
            const c = [mid[0] + d[0] * 1.37, mid[1] + d[1] * 1.37];
            if (t + 2.75 < L - 2.5 && !blocked(c, rd) && lots.some((l) => inside(c, l))) carSpots.push([c[0], c[1], Math.atan2(-n[1], n[0])]);
          }
        }
      }
    }
    const sm = new THREE.InstancedMesh(new THREE.PlaneGeometry(5.2, 0.12), white, stripes.length);
    const m4 = new THREE.Matrix4(); const q = new THREE.Quaternion(); const e = new THREE.Euler(); const one = new THREE.Vector3(1, 1, 1);
    stripes.forEach(([x, z, ry], i) => sm.setMatrixAt(i, m4.compose(new THREE.Vector3(x, 0.056, z), q.setFromEuler(e.set(-Math.PI / 2, ry, 0, 'YXZ')), one)));
    add(sm);
  }

  // ---------------- parked cars ----------------
  // Tour camera spots (x, z): keep cars and tree trunks clear of them.
  const cams = [[100, 38], [74, 26], [32, 44], [8, 38], [-104, 10]];
  {
    const carCols = ['#e8e8e6', '#8e9aa6', '#7a1d22', '#c9c3b5', '#2c3440', '#b8bcc2', '#3c5a78', '#1d1f22'];
    const near = carSpots.filter(([x, z]) => Math.hypot(x, z) < 260 && !cams.some((c) => dist(c, [x, z]) < 12) && r() < (Math.hypot(x, z) < 120 ? 0.42 : 0.3));
    const bodies = new THREE.InstancedMesh(new THREE.BoxGeometry(4.6, 0.8, 1.85), M('#ffffff', { roughness: 0.3, metalness: 0.5 }), near.length);
    const cabs = new THREE.InstancedMesh(new THREE.BoxGeometry(2.4, 0.6, 1.7), M('#22272d', { roughness: 0.2, metalness: 0.6 }), near.length);
    const m4 = new THREE.Matrix4(); const q = new THREE.Quaternion(); const e = new THREE.Euler(); const one = new THREE.Vector3(1, 1, 1); const col = new THREE.Color();
    near.forEach(([x, z, ry], i) => {
      q.setFromEuler(e.set(0, ry, 0));
      bodies.setMatrixAt(i, m4.compose(new THREE.Vector3(x, 0.65, z), q, one));
      bodies.setColorAt(i, col.set(carCols[Math.floor(r() * carCols.length)]));
      const o = new THREE.Vector3(-0.2, 0, 0).applyQuaternion(q);
      cabs.setMatrixAt(i, m4.compose(new THREE.Vector3(x + o.x, 1.3, z + o.z), q, one));
    });
    bodies.castShadow = cabs.castShadow = true;
    add(bodies);
    add(cabs);
  }

  // ---------------- neighbouring buildings ----------------
  const wallMat = M('#d9d7d2');
  const roofMats = new Map();
  for (const b of bldgs) {
    const sh = new THREE.Shape();
    b.p.forEach(([x, z], i) => (i ? sh.lineTo(x, -z) : sh.moveTo(x, -z)));
    const geo = new THREE.ExtrudeGeometry(sh, { depth: b.h, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    if (!roofMats.has(b.c)) roofMats.set(b.c, M(b.c));
    const m = add(new THREE.Mesh(geo, [roofMats.get(b.c), wallMat]));
    m.castShadow = m.receiveShadow = true;
    if (b.n && b.h > 5) {
      // Name sign on the longest wall that faces a road.
      let best = null;
      for (let i = 0; i < b.p.length; i++) {
        const a = b.p[i]; const c = b.p[(i + 1) % b.p.length]; const L = dist(a, c);
        if (L < 12) continue;
        const mid = [(a[0] + c[0]) / 2, (a[1] + c[1]) / 2];
        const out = [(c[1] - a[1]) / L, -(c[0] - a[0]) / L];
        const probe = [mid[0] + out[0] * 3, mid[1] + out[1] * 3];
        const side = inside(probe, b.p) ? -1 : 1;
        const dRoad = Math.min(...net.filter((o) => o.pub || o.k === 'service').map((o) => lineDist([mid[0] + out[0] * side * 3, mid[1] + out[1] * side * 3], o.pts)));
        if (!best || dRoad < best.d) best = { a, c, L, mid, out: [out[0] * side, out[1] * side], d: dRoad };
      }
      if (best) {
        const w = Math.min(10, best.L * 0.5);
        const tex = textTexture({ text: b.n.toUpperCase(), width: 1024, height: 200, bg: '#ffffff', ink: '#23324a', font: '800 104px Arial' });
        const s = add(new THREE.Mesh(new THREE.PlaneGeometry(w, w * 0.195), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.5 })));
        s.position.set(best.mid[0] + best.out[0] * 0.12, b.h - 1.4, best.mid[1] + best.out[1] * 0.12);
        s.rotation.y = Math.atan2(best.out[0], best.out[1]);
      }
    }
  }

  // ---------------- trees (canopy sampled from the satellite) ----------------
  const spots = trees.filter((p) => !cams.some((c) => dist(c, p) < 9));
  {
    const n = spots.length;
    const crowns = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), M('#ffffff', { roughness: 1 }), n * 2);
    const trunks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.2, 0.32, 1, 6), M('#4b3d30', { roughness: 1 }), n);
    const m4 = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const col = new THREE.Color();
    const greens = ['#3d6b2b', '#4a7a33', '#335c24', '#56813a', '#2f4f26'];
    spots.forEach(([x, z], i) => {
      const h = 9 + r() * 8;
      trunks.setMatrixAt(i, m4.compose(new THREE.Vector3(x, h * 0.3, z), q, new THREE.Vector3(1, h * 0.6, 1)));
      for (let k = 0; k < 2; k++) {
        const s = 2.7 + r() * 2.0;
        crowns.setMatrixAt(i * 2 + k, m4.compose(new THREE.Vector3(x + (r() - 0.5) * 2, h * (0.62 + k * 0.22), z + (r() - 0.5) * 2), q, new THREE.Vector3(s, s * 0.9, s)));
        crowns.setColorAt(i * 2 + k, col.set(greens[Math.floor(r() * greens.length)]));
      }
    });
    crowns.castShadow = true;
    add(crowns);
    add(trunks);
  }
  // The tall evergreen between the office wing and the CARA lobby (photo).
  const ever = M('#2f4b2a', { roughness: 1 });
  for (const [x, z, h] of [[57, 28, 12]]) {
    const c = add(new THREE.Mesh(new THREE.ConeGeometry(h * 0.32, h, 10), ever));
    c.position.set(x, h / 2 + 0.8, z);
    c.castShadow = true;
  }
}
