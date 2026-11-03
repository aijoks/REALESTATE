// Shared building kit: real-scale brick materials, walls with openings, and
// recessed windows (reveal, frames, glass, blinds, fake interior) built as a
// handful of instanced meshes. Used by every procedural building generator.
import * as THREE from 'three';
import { BRICK, stone, grime } from './textures.js';

export { grime };

export const Q0 = new THREE.Quaternion();
export const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);

export const C = {
  stone: '#d2c7b0',
  stoneDark: '#bfb39b',
  frame: '#1f1c1a',
  wood: '#5b3519',
  revealTower: '#6b3427',
  revealBase: '#3f2b25',
  revealCommon: '#7c4a39',
  header: '#57261d',
};

export class Instancer {
  constructor() { this.items = []; }
  add(m, color = '#ffffff') { this.items.push([m, color]); }
  build(geometry, material, { cast = false, receive = false } = {}) {
    const mesh = new THREE.InstancedMesh(geometry, material, Math.max(1, this.items.length));
    const col = new THREE.Color();
    this.items.forEach(([m, c], i) => {
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, col.set(c));
    });
    mesh.count = this.items.length;
    mesh.castShadow = cast;
    mesh.receiveShadow = receive;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    return mesh;
  }
}

export const face = (ry, x, y, z) => new THREE.Matrix4().makeRotationY(ry).setPosition(x, y, z);
export const piece = (F, x, y, z, sx, sy, sz, q = Q0) =>
  F.clone().multiply(new THREE.Matrix4().compose(V(x, y, z), q, V(sx, sy, sz)));

// BoxGeometry with UVs in metres so tiled textures keep real-world scale.
export function boxGeo(w, h, d) {
  const g = new THREE.BoxGeometry(w, h, d);
  const uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) {
    for (let k = 0; k < 4; k++) {
      const i = f * 4 + k;
      uv.setXY(i, uv.getX(i) * dims[f][0], uv.getY(i) * dims[f][1]);
    }
  }
  return g;
}

// Brick material with an optional non-tiling weathering layer (sampled by
// the `faceUv` attribute that wall() adds).
export function brickMaterial(kind, grimeTex) {
  const { map, normalMap } = BRICK[kind]();
  const m = new THREE.MeshStandardMaterial({
    map, normalMap, normalScale: new THREE.Vector2(0.9, 0.9), roughness: 0.93, metalness: 0,
  });
  if (grimeTex) {
    m.onBeforeCompile = (sh) => {
      sh.uniforms.grimeMap = { value: grimeTex };
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', '#include <common>\nattribute vec2 faceUv;\nvarying vec2 vFaceUv;')
        .replace('#include <uv_vertex>', '#include <uv_vertex>\nvFaceUv = faceUv;');
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', '#include <common>\nuniform sampler2D grimeMap;\nvarying vec2 vFaceUv;')
        .replace('#include <map_fragment>', '#include <map_fragment>\ndiffuseColor.rgb *= texture2D(grimeMap, vFaceUv).rgb;');
    };
    m.customProgramCacheKey = () => 'brick-grime';
  }
  return m;
}

// A flat wall with rectangular holes, in local coords (x right, y up, +z out).
export function wall(F, w, h, holes, material) {
  const s = new THREE.Shape();
  s.moveTo(0, 0); s.lineTo(w, 0); s.lineTo(w, h); s.lineTo(0, h); s.closePath();
  for (const o of holes) {
    const x0 = o.x - o.w / 2;
    const y0 = o.y - o.h / 2;
    const p = new THREE.Path();
    p.moveTo(x0, y0); p.lineTo(x0, y0 + o.h); p.lineTo(x0 + o.w, y0 + o.h); p.lineTo(x0 + o.w, y0); p.closePath();
    s.holes.push(p);
  }
  const g = new THREE.ShapeGeometry(s);
  const pos = g.attributes.position;
  const fuv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    fuv[i * 2] = pos.getX(i) / w;
    fuv[i * 2 + 1] = pos.getY(i) / h;
  }
  g.setAttribute('faceUv', new THREE.BufferAttribute(fuv, 2));
  const mesh = new THREE.Mesh(g, material);
  mesh.applyMatrix4(F);
  mesh.castShadow = mesh.receiveShadow = true;
  return mesh;
}


// Glass looks: 'dark' shows the room behind (pre-war sash windows); 'sky'
// reads as bright, sky-reflecting modern glazing. Instance tint sets the hue.
const GLASS = {
  dark: { color: '#1b2128', opacity: 0.58, envMapIntensity: 2.4 },
  sky: { color: '#ffffff', opacity: 0.86, envMapIntensity: 1.6 },
};

export function createKit(g, r, { glass = 'dark' } = {}) {
  const gl = GLASS[glass] ?? GLASS.dark;
  const matStone = new THREE.MeshStandardMaterial({ map: stone(), roughness: 0.82, color: '#efe6d4' });
  const matTrim = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.85 });
  const matFrame = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.45, metalness: 0.35 });
  const matGlass = new THREE.MeshPhysicalMaterial({
    color: gl.color, roughness: 0.03, metalness: 0.0, transparent: true, opacity: gl.opacity,
    envMapIntensity: gl.envMapIntensity, specularIntensity: 1, depthWrite: false,
  });
  // Shopfronts and lobbies always use clear glass so their lit interiors show.
  const matGlassClear = new THREE.MeshPhysicalMaterial({
    color: GLASS.dark.color, roughness: 0.03, metalness: 0.0, transparent: true, opacity: GLASS.dark.opacity,
    envMapIntensity: GLASS.dark.envMapIntensity, specularIntensity: 1, depthWrite: false,
  });
  const roomGeo = new THREE.BoxGeometry(1, 1, 1);
  {
    // Fake interior shading: bright back wall & ceiling, darker floor/sides.
    const shade = [0.72, 0.72, 0.95, 0.42, 1, 1];
    const cols = [];
    for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) cols.push(shade[f], shade[f], shade[f]);
    roomGeo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  }
  const matRoom = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.BackSide, vertexColors: true });
  const matBlind = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9 });
  const matSteel = new THREE.MeshStandardMaterial({ color: '#232323', roughness: 0.55, metalness: 0.6 });

  const I = {
    trim: new Instancer(), frame: new Instancer(), glass: new Instancer(), clear: new Instancer(),
    room: new Instancer(), blind: new Instancer(), steel: new Instancer(),
  };

  // ---------- window / opening ----------
  function opening(F, o) {
    const { x, y, w, h } = o;
    const rd = o.rd ?? 0.24;
    const P = (px, py, pz, sx, sy, sz) => piece(F, x + px, y + py, pz, sx, sy, sz);
    const rev = o.reveal ?? C.revealTower;
    I.trim.add(P(-w / 2 - 0.03, 0, -rd / 2, 0.06, h + 0.12, rd), rev);
    I.trim.add(P(w / 2 + 0.03, 0, -rd / 2, 0.06, h + 0.12, rd), rev);
    I.trim.add(P(0, h / 2 + 0.03, -rd / 2, w, 0.06, rd), rev);
    I.trim.add(P(0, -h / 2 - 0.03, -rd / 2, w, 0.06, rd), rev);
    const zf = -rd + 0.05;

    if (o.kind === 'panel') {
      I.trim.add(P(0, 0, zf, w, h, 0.05), o.panel ?? '#151515');
    } else {
      const ft = 0.075;
      const fd = 0.07;
      const fc = o.frame ?? C.frame;
      I.frame.add(P(-w / 2 + ft / 2, 0, zf, ft, h, fd), fc);
      I.frame.add(P(w / 2 - ft / 2, 0, zf, ft, h, fd), fc);
      I.frame.add(P(0, h / 2 - ft / 2, zf, w, ft, fd), fc);
      I.frame.add(P(0, -h / 2 + ft / 2, zf, w, ft, fd), fc);
      const hbar = (yy, t = 0.07) => I.frame.add(P(0, yy, zf + 0.012, w, t, fd), fc);
      const vbar = (xx, hh = h, yy = 0, t = 0.08) => I.frame.add(P(xx, yy, zf + 0.012, t, hh, fd), fc);
      switch (o.kind) {
        case 'dh': hbar(0.03, 0.08); break;
        case 'dh2': hbar(0.03, 0.08); vbar(0, h, 0, 0.11); break;
        case 'band': hbar(-h / 2 + h * 0.36, 0.09); hbar(-h / 2 + h * 0.56, 0.09); vbar(0, h * 0.2, -h / 2 + h * 0.46); break;
        case 'shop': hbar(h / 2 - 0.55); break;
        case 'lobby': hbar(h / 2 - 0.6, 0.09); vbar(0, h - 0.6, -0.3, 0.09); vbar(-w / 4, h - 0.6, -0.3, 0.05); vbar(w / 4, h - 0.6, -0.3, 0.05); break;
        case 'french': hbar(h / 2 - 0.5, 0.09); vbar(0, h - 0.5, -0.25, 0.12); vbar(-w / 4, h - 0.5, -0.25); vbar(w / 4, h - 0.5, -0.25); break;
        case 'grid': {
          // Big loft storefront: transom row on top, `cols` lights across.
          hbar(h / 2 - (o.transom ?? 0.8), 0.09);
          const cols = o.cols ?? 3;
          for (let k = 1; k < cols; k++) vbar(-w / 2 + (w * k) / cols, h, 0, 0.09);
          break;
        }
        default: break;
      }
      (o.room ? I.clear : I.glass).add(P(0, 0, zf, w - 0.02, h - 0.02, 1), o.room ? '#e8eef4' : o.tint ?? '#e8eef4');

      // Interior: lit or dim office, warm shops, bright lobby.
      let room;
      const p = r();
      switch (o.room) {
        case 'shop': room = '#e8bd80'; break;
        case 'lobby': room = '#ffd9a0'; break;
        case 'warm': room = p < 0.6 ? '#c9a678' : '#a88660'; break;
        default:
          if (p < 0.14) room = '#c9b48c';
          else if (p < 0.22) room = '#aab4bb';
          else { const v = 34 + r() * 40 | 0; room = `rgb(${v},${v - 2},${v - 5})`; }
      }
      const depth = o.roomDepth ?? 2.4;
      const over = o.over ?? 0.45;
      I.room.add(P(0, 0.1, zf - depth / 2 - 0.02, w + over * 2, h + 0.9, depth), room);
      if (o.blinds !== false && (o.room === undefined || o.room === 'warm') && r() < 0.45) {
        const frac = 0.12 + r() * 0.55;
        const bc = ['#bdb6a8', '#a9a192', '#cfcabe', '#9d927f'][Math.floor(r() * 4)];
        I.blind.add(P(0, h / 2 - (h * frac) / 2 - 0.02, zf - 0.06, w - 0.14, h * frac, 1), bc);
      }
    }
    if (o.sill !== false) I.trim.add(P(0, -h / 2 - 0.07, 0.05, w + 0.3, 0.12, 0.17), o.sillColor ?? C.stone);
    if (o.header) I.trim.add(P(0, h / 2 + 0.14, 0.012, w + 0.26, 0.26, 0.024), o.header);
    if (o.surround) {
      const s = 0.24;
      I.trim.add(P(-w / 2 - s / 2, 0.02, 0.04, s, h + s * 2 + 0.1, 0.08), C.stone);
      I.trim.add(P(w / 2 + s / 2, 0.02, 0.04, s, h + s * 2 + 0.1, 0.08), C.stone);
      I.trim.add(P(0, h / 2 + s / 2 + 0.05, 0.04, w + s * 2, s, 0.08), C.stone);
      I.trim.add(P(0, h / 2 + s + 0.12, 0.07, 0.34, 0.28, 0.12), C.stoneDark); // keystone
    }
  }

  const add = (mesh) => { g.add(mesh); return mesh; };
  const stoneBox = (w, h, d, x, y, z, F = null) => {
    const m = new THREE.Mesh(boxGeo(w, h, d), matStone);
    m.position.set(x, y, z);
    if (F) m.applyMatrix4(F);
    m.castShadow = m.receiveShadow = true;
    return add(m);
  };
  const brickBox = (mat, w, h, d, x, y, z) => {
    const m = new THREE.Mesh(boxGeo(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    return add(m);
  };

  const finish = () => {
    // ---------- instanced detail meshes ----------
    add(I.trim.build(new THREE.BoxGeometry(1, 1, 1), matTrim, { cast: true, receive: true }));
    add(I.frame.build(new THREE.BoxGeometry(1, 1, 1), matFrame, { cast: false, receive: true }));
    add(I.room.build(roomGeo, matRoom));
    add(I.blind.build(new THREE.PlaneGeometry(1, 1), matBlind));
    add(I.steel.build(new THREE.BoxGeometry(1, 1, 1), matSteel, { cast: true }));
    const glass = add(I.glass.build(new THREE.PlaneGeometry(1, 1), matGlass));
    glass.renderOrder = 2;
    const clear = add(I.clear.build(new THREE.PlaneGeometry(1, 1), matGlassClear));
    clear.renderOrder = 2;
  };

  return { matStone, matTrim, matFrame, matGlass, matRoom, matBlind, matSteel, I, opening, add, stoneBox, brickBox, finish };
}

// Steel fire escape on a rear wall facing -z at `z`: a landing per level from
// x0 to x1, railings, brackets and zig-zag stairs between landings.
export function addFireEscape(I, { x0, x1, z, levels, depth = 1.2 }) {
  const wid = x1 - x0;
  const S = (x, y, zz, sx, sy, sz, q) => I.steel.add(piece(new THREE.Matrix4(), x, y, zz, sx, sy, sz, q));
  const brace = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.8, 0, 0));
  levels.forEach((y, i) => {
    S((x0 + x1) / 2, y, z - depth / 2, wid, 0.06, depth);
    S((x0 + x1) / 2, y + 0.95, z - depth, wid, 0.04, 0.04);
    S(x0, y + 0.95, z - depth / 2, 0.04, 0.04, depth);
    S(x1, y + 0.95, z - depth / 2, 0.04, 0.04, depth);
    for (let x = x0; x <= x1 + 0.001; x += 0.16) S(x, y + 0.48, z - depth, 0.018, 0.95, 0.018);
    for (let k = 0.16; k < depth; k += 0.16) { S(x0, y + 0.48, z - k, 0.018, 0.95, 0.018); S(x1, y + 0.48, z - k, 0.018, 0.95, 0.018); }
    for (const x of [x0 + 0.3, x1 - 0.3]) S(x, y - 0.45, z - 0.4, 0.05, 0.9, 0.05, brace);
    if (i < levels.length - 1) {
      const y2 = levels[i + 1];
      const dir = i % 2 ? 1 : -1;
      const xa = dir > 0 ? x0 + 0.6 : x1 - 0.6;
      const xb = xa + dir * Math.min(3.4, wid - 1.2);
      const len = Math.hypot(xb - xa, y2 - y);
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.atan2(y2 - y, xb - xa)));
      for (const dz of [0.12, 0.72]) S((xa + xb) / 2, (y + y2) / 2, z - dz, len, 0.12, 0.03, q);
      for (let k = 1; k < 13; k++) {
        const t = k / 13;
        S(xa + (xb - xa) * t, y + (y2 - y) * t, z - 0.42, 0.24, 0.025, 0.6);
      }
    }
  });
}
