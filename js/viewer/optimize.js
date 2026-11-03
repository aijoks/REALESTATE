// Merge static scenery into as few draw calls as possible.
// The models and streetscape are built from hundreds of small meshes that
// never move (trim boxes, road markings, kerbs, signs...). Meshes that share
// a material, shadow flags and vertex layout are baked into one geometry.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// Merged meshes are baked in world space, so they're added to `into` (an
// untransformed parent such as the scene), not to `root`.
export function mergeStatic(root, { into, skip = new Set() } = {}) {
  root.updateMatrixWorld(true);
  const groups = new Map();
  root.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || skip.has(o)) return;
    const m = o.material;
    if (Array.isArray(m) || m.transparent || !o.visible) return;
    const g = o.geometry;
    const attrs = Object.keys(g.attributes).sort().join(',');
    const key = `${m.uuid}|${o.castShadow}|${o.receiveShadow}|${attrs}|${g.index ? 'i' : 'n'}|${o.renderOrder}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(o);
  });

  let removed = 0;
  for (const meshes of groups.values()) {
    if (meshes.length < 2) continue;
    const geos = meshes.map((o) => {
      const geo = o.geometry.clone();
      geo.applyMatrix4(o.matrixWorld);
      // Mirrored objects flip triangle winding when baked; flip it back.
      if (o.matrixWorld.determinant() < 0) flipWinding(geo);
      for (const k of Object.keys(geo.morphAttributes)) delete geo.morphAttributes[k];
      return geo;
    });
    const merged = mergeGeometries(geos, false);
    geos.forEach((gg) => gg.dispose());
    if (!merged) continue;
    const first = meshes[0];
    const mesh = new THREE.Mesh(merged, first.material);
    mesh.castShadow = first.castShadow;
    mesh.receiveShadow = first.receiveShadow;
    mesh.renderOrder = first.renderOrder;
    mesh.matrixAutoUpdate = false;
    (into ?? root).add(mesh);
    for (const o of meshes) {
      o.parent?.remove(o);
      removed++;
    }
  }
  // Static scenery never moves: stop recomputing its matrices every frame.
  root.traverse((o) => { if (!skip.has(o)) { o.updateMatrix(); o.matrixAutoUpdate = false; } });
  return removed;
}

function flipWinding(geo) {
  if (geo.index) {
    const idx = geo.index.array;
    for (let i = 0; i < idx.length; i += 3) { const t = idx[i + 1]; idx[i + 1] = idx[i + 2]; idx[i + 2] = t; }
    geo.index.needsUpdate = true;
    return;
  }
  for (const attr of Object.values(geo.attributes)) {
    const a = attr.array;
    const s = attr.itemSize;
    for (let i = 0; i < attr.count; i += 3) {
      for (let k = 0; k < s; k++) {
        const t = a[(i + 1) * s + k];
        a[(i + 1) * s + k] = a[(i + 2) * s + k];
        a[(i + 2) * s + k] = t;
      }
    }
    attr.needsUpdate = true;
  }
}
