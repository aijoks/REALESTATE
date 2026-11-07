// Turns a published floor plan image into a 3D cut-away floor:
//   - the drawing itself, laid on a floor slab at the storey's level, and
//   - its walls and columns raised to waist height, read straight from the
//     drawing: thick inked features (walls, columns, cores) are kept, thin ones
//     (text, dimensions, door swings, furniture) stay flat on the floor.
//
// model3d (per plan, in js/data/floorplans.js):
//   rot : quarter-turns counter-clockwise that put the street side at the
//         bottom of the image (0 when it already is; 1 when the street is on
//         the left edge).
//   box : the building's footprint in the ORIGINAL image, as fractions
//         [x0, y0, x1, y1] (exterior wall lines; may run past the image when
//         the drawing only shows part of the lot). It is stretched onto the
//         model's width × depth, front (street) at +z.
import * as THREE from 'three';

const cache = new Map();
const loadImage = (src) => {
  if (!cache.has(src)) {
    cache.set(src, new Promise((res, rej) => {
      const im = new Image();
      im.decoding = 'async';
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = src;
    }));
  }
  return cache.get(src);
};

// Rotate the image `rot` quarter-turns counter-clockwise onto a canvas.
function rotated(img, rot) {
  const r = ((rot % 4) + 4) % 4;
  const c = document.createElement('canvas');
  c.width = r % 2 ? img.naturalHeight : img.naturalWidth;
  c.height = r % 2 ? img.naturalWidth : img.naturalHeight;
  const x = c.getContext('2d');
  x.translate(c.width / 2, c.height / 2);
  x.rotate((-r * Math.PI) / 2);
  x.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);
  return c;
}
// The footprint box after the same rotation.
function rotBox([x0, y0, x1, y1], rot) {
  let b = [x0, y0, x1, y1];
  for (let i = 0; i < (((rot % 4) + 4) % 4); i++) b = [b[1], 1 - b[2], b[3], 1 - b[0]]; // one CCW turn
  return b;
}

// Square min / max filters (separable) on a 0/1 grid.
function morph(src, w, h, r, max) {
  const tmp = new Uint8Array(w * h), out = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = max ? 0 : 1;
    for (let k = -r; k <= r; k++) { const xx = x + k; const s = xx < 0 || xx >= w ? 0 : src[y * w + xx]; v = max ? v | s : v & s; }
    tmp[y * w + x] = v;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let v = max ? 0 : 1;
    for (let k = -r; k <= r; k++) { const yy = y + k; const s = yy < 0 || yy >= h ? 0 : tmp[yy * w + x]; v = max ? v | s : v & s; }
    out[y * w + x] = v;
  }
  return out;
}

// Greedy rectangles over a 0/1 grid: horizontal runs, grown downwards while
// the next row has the identical run.
function rectangles(m, w, h) {
  const used = new Uint8Array(w * h);
  const rects = [];
  for (let y = 0; y < h; y++) {
    let x = 0;
    while (x < w) {
      if (!m[y * w + x] || used[y * w + x]) { x++; continue; }
      let x1 = x;
      while (x1 + 1 < w && m[y * w + x1 + 1] && !used[y * w + x1 + 1]) x1++;
      let y1 = y;
      grow: while (y1 + 1 < h) {
        for (let k = x; k <= x1; k++) if (!m[(y1 + 1) * w + k] || used[(y1 + 1) * w + k]) break grow;
        y1++;
      }
      for (let yy = y; yy <= y1; yy++) for (let k = x; k <= x1; k++) used[yy * w + k] = 1;
      rects.push([x, y, x1 + 1, y1 + 1]);
      x = x1 + 1;
    }
  }
  return rects;
}

// One indexed geometry for all wall blocks: group 0 = sides, group 1 = cut tops.
function wallGeometry(rects, toX, toZ, H) {
  const pos = [], nor = [], side = [], top = [];
  let v = 0;
  const quad = (a, b, c, d, n, into) => {
    pos.push(...a, ...b, ...c, ...d);
    for (let i = 0; i < 4; i++) nor.push(...n);
    into.push(v, v + 1, v + 2, v, v + 2, v + 3);
    v += 4;
  };
  for (const [gx0, gy0, gx1, gy1] of rects) {
    const x0 = toX(gx0), x1 = toX(gx1), z0 = toZ(gy0), z1 = toZ(gy1);
    quad([x0, H, z1], [x1, H, z1], [x1, H, z0], [x0, H, z0], [0, 1, 0], top);
    quad([x0, 0, z1], [x1, 0, z1], [x1, H, z1], [x0, H, z1], [0, 0, 1], side);
    quad([x1, 0, z0], [x0, 0, z0], [x0, H, z0], [x1, H, z0], [0, 0, -1], side);
    quad([x1, 0, z1], [x1, 0, z0], [x1, H, z0], [x1, H, z1], [1, 0, 0], side);
    quad([x0, 0, z0], [x0, 0, z1], [x0, H, z1], [x0, H, z0], [-1, 0, 0], side);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex([...side, ...top]);
  g.addGroup(0, side.length, 0);
  g.addGroup(side.length, top.length, 1);
  return g;
}

export async function buildPlanFloor({ src, model3d, W, D, maxAniso = 8 }) {
  const img = await loadImage(src);
  const rot = model3d.rot ?? 0;
  const canvas = rotated(img, rot);
  const [bx0, by0, bx1, by1] = rotBox(model3d.box, rot);

  // The whole image plane, scaled so the footprint box lands on W × D.
  const PW = W / (bx1 - bx0), PD = D / (by1 - by0);
  const cx = -W / 2 + (0.5 - bx0) * PW;
  const cz = -D / 2 + (0.5 - by0) * PD;
  const group = new THREE.Group();

  // Floor slab (pale oak) just inside the facade, then the drawing on top.
  const slab = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.25, 0.12, D - 0.25),
    new THREE.MeshBasicMaterial({ color: '#efe5d3' }),
  );
  slab.position.y = -0.06;
  slab.receiveShadow = true;
  group.add(slab);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAniso;
  tex.generateMipmaps = true;
  const drawing = new THREE.Mesh(
    new THREE.PlaneGeometry(PW, PD),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false, color: '#ffffff' }),
  );
  drawing.rotation.x = -Math.PI / 2;
  drawing.position.set(cx, 0.012, cz);
  drawing.renderOrder = 2;
  // Keep the drawing to the footprint (labels and dimensions outside it are dropped).
  drawing.material.clippingPlanes = [
    new THREE.Plane(new THREE.Vector3(1, 0, 0), W / 2), new THREE.Plane(new THREE.Vector3(-1, 0, 0), W / 2),
    new THREE.Plane(new THREE.Vector3(0, 0, 1), D / 2), new THREE.Plane(new THREE.Vector3(0, 0, -1), D / 2),
  ];
  group.add(drawing);

  // Wall mask at ~3.5 cm per cell, inside the footprint (plus a little margin).
  const cell = Math.max(0.035, Math.max(PW, PD) / 1400);
  const gw = Math.round(PW / cell), gh = Math.round(PD / cell);
  const sm = document.createElement('canvas');
  sm.width = gw; sm.height = gh;
  const sx = sm.getContext('2d', { willReadFrequently: true });
  sx.imageSmoothingQuality = 'high';
  sx.drawImage(canvas, 0, 0, gw, gh);
  const px = sx.getImageData(0, 0, gw, gh).data;
  const m = new Uint8Array(gw * gh);
  const gx0 = Math.floor(bx0 * gw) - 6, gx1 = Math.ceil(bx1 * gw) + 6, gy0 = Math.floor(by0 * gh) - 6, gy1 = Math.ceil(by1 * gh) + 6;
  for (let y = Math.max(0, gy0); y < Math.min(gh, gy1); y++) {
    for (let x = Math.max(0, gx0); x < Math.min(gw, gx1); x++) {
      const k = (y * gw + x) * 4;
      // Ink = opaque + dark (works for transparent line work and white-backed scans).
      const lum = px[k] * 0.3 + px[k + 1] * 0.59 + px[k + 2] * 0.11;
      m[y * gw + x] = px[k + 3] > 140 && lum < 120 ? 1 : 0;
    }
  }
  // Opening: drop features thinner than ~3 cells (text, dimension and door lines).
  const r = model3d.thin ?? 1;
  const walls = morph(morph(m, gw, gh, r, false), gw, gh, r, true);
  const rects = rectangles(walls, gw, gh);
  const toX = (g) => cx - PW / 2 + (g / gw) * PW;
  const toZ = (g) => cz - PD / 2 + (g / gh) * PD;
  const wallH = model3d.wallH ?? 1.15;
  const wallMesh = new THREE.Mesh(wallGeometry(rects, toX, toZ, wallH), [
    new THREE.MeshStandardMaterial({ color: '#fbfaf7', roughness: 0.95, envMapIntensity: 0.4 }),
    new THREE.MeshStandardMaterial({ color: '#27313d', roughness: 0.6 }),
  ]);
  // Lit by sun and sky but not shadowed by the (hidden) floors above.
  wallMesh.castShadow = false;
  wallMesh.receiveShadow = false;
  group.add(wallMesh);

  group.userData = { wallH, rects: rects.length, dispose() { tex.dispose(); group.traverse((o) => { o.geometry?.dispose(); [].concat(o.material ?? []).forEach((mm) => mm.dispose()); }); } };
  return group;
}
