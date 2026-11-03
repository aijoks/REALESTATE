// Procedural model of a single-tenant corner drugstore, matched to photos of
// 7877 E Snyder Rd, Tucson (Walgreens):
//   - tan stucco box with a darker base course, set on a corner of the lot
//   - entrance tower on the 45° corner: arched opening over sliding doors,
//     arched window with the red "W" panel above, deep hipped tile cap
//   - on both wings a clay-tile shed roof on square columns shading a strip
//     of storefront windows; red script "Walgreens", PHARMACY and 1-HR PHOTO
import * as THREE from 'three';
import { textTexture, rand } from './textures.js';
import { V, piece, createKit } from './kit.js';

export function buildDrugstore(params) {
  const { width: W = 40, depth: D = 32 } = params;
  const r = rand(7877);
  const H = 6.8;
  const g = new THREE.Group();
  g.name = 'building';
  const { I, add, finish } = createKit(g, r, { glass: 'sky' });
  const stucco = new THREE.MeshStandardMaterial({ color: '#e6d3b4', roughness: 0.95 });
  const base = new THREE.MeshStandardMaterial({ color: '#d6bd94', roughness: 0.95 });
  const tileTex = textTexture({
    width: 256, height: 256, bg: '#b9805a',
    draw(ctx, w, h) {
      for (let y = 0; y < h; y += 16) for (let x = (y / 16) % 2 ? 8 : 0; x < w; x += 16) {
        const v = 0.85 + r() * 0.3;
        ctx.fillStyle = `rgb(${185 * v | 0},${125 * v | 0},${88 * v | 0})`;
        ctx.fillRect(x, y, 14, 14);
      }
    },
  });
  tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
  tileTex.repeat.set(6, 2);
  const tiles = new THREE.MeshStandardMaterial({ map: tileTex, roughness: 0.85 });
  const red = '#c8102e';

  const C = 6; // chamfer: corner cut back for the entrance tower
  // Footprint with the front-right corner (+x,+z) cut at 45°.
  const shape = new THREE.Shape();
  shape.moveTo(-W / 2, -D / 2); shape.lineTo(W / 2, -D / 2); shape.lineTo(W / 2, D / 2 - C);
  shape.lineTo(W / 2 - C, D / 2); shape.lineTo(-W / 2, D / 2); shape.closePath();
  const body = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: H, bevelEnabled: false }), stucco);
  body.rotation.x = -Math.PI / 2;
  body.castShadow = body.receiveShadow = true;
  add(body);
  const plinthShape = shape.clone();
  const plinth = new THREE.Mesh(new THREE.ExtrudeGeometry(plinthShape, { depth: 0.9, bevelEnabled: false }), base);
  plinth.rotation.x = -Math.PI / 2;
  plinth.scale.set(1.004, 1.004, 1);
  add(plinth);
  // Stepped parapet line.
  const cap = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: '#efe1c6', roughness: 0.9 }));
  cap.rotation.x = -Math.PI / 2;
  cap.position.y = H;
  cap.scale.set(1.006, 1.006, 1);
  add(cap);

  // ---- a wing: frame F runs along a wall, local +z out of the wall ----
  const wing = (F, len, { sign = true, photo = false, pharmacy = true }) => {
    // Storefront window strip.
    const gy = 2.2;
    for (let x = 2.5; x < len - 2; x += 2.6) {
      I.clear.add(piece(F, x, gy, 0.03, 2.4, 1.5, 1), '#9fc3d6');
      I.frame.add(piece(F, x + 1.25, gy, 0.05, 0.1, 1.6, 0.08), '#2c3034');
    }
    I.frame.add(piece(F, len / 2, gy + 0.78, 0.05, len - 4, 0.1, 0.08), '#2c3034');
    I.frame.add(piece(F, len / 2, gy - 0.78, 0.05, len - 4, 0.1, 0.08), '#2c3034');
    // Tile shed roof on columns.
    const depth = 3.0;
    const roof = new THREE.Mesh(new THREE.BoxGeometry(len, 0.25, depth + 0.4), tiles);
    roof.applyMatrix4(piece(F, len / 2, 4.15, depth / 2, 1, 1, 1));
    roof.rotation.x = 0;
    const tilt = new THREE.Matrix4().makeRotationX(0.22);
    roof.geometry.applyMatrix4(tilt);
    roof.castShadow = true;
    add(roof);
    for (let x = 2; x < len; x += 4.6) {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.6, 3.8, 0.6), stucco);
      col.applyMatrix4(piece(F, x, 1.9, depth, 1, 1, 1));
      col.castShadow = true;
      add(col);
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.9, 0.75), base);
      foot.applyMatrix4(piece(F, x, 0.45, depth, 1, 1, 1));
      add(foot);
    }
    // Signs on the wall above the roof.
    const signTex = (txt, font, ww, hh) => textTexture({
      width: 1024, height: Math.round(1024 * hh / ww), bg: 'rgba(0,0,0,0)',
      draw(ctx, w, h) { ctx.fillStyle = red; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = font(h); ctx.fillText(txt, w / 2, h / 2 + 4); },
    });
    const plate = (tex, x, y, ww, hh) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(ww, hh), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.4, emissive: '#7a0a1c', emissiveMap: tex, emissiveIntensity: 0.3 }));
      m.applyMatrix4(piece(F, x, y, 0.06, 1, 1, 1));
      add(m);
    };
    if (sign) plate(signTex('Walgreens', (h) => `italic 700 ${Math.round(h * 0.78)}px "Brush Script MT", "Segoe Script", Georgia, cursive`, 7, 1.4), len * 0.55, 5.4, 7, 1.4);
    if (pharmacy) plate(signTex('PHARMACY', (h) => `800 ${Math.round(h * 0.7)}px Arial`, 4, 0.6), len * 0.45, 4.75, 4, 0.6);
    if (photo) plate(signTex('1-HR PHOTO', (h) => `800 ${Math.round(h * 0.7)}px Arial`, 3.2, 0.55), len * 0.85, 4.75, 3.2, 0.55);
  };
  const frame = (ry, x, z) => new THREE.Matrix4().makeRotationY(ry).setPosition(x, 0, z);
  wing(frame(0, -W / 2, D / 2), W - C - 1, { photo: true }); // front (+z), runs west -> corner
  wing(frame(Math.PI / 2, W / 2, D / 2 - C - 1), D - C - 1, { photo: true }); // side (+x), runs corner -> rear

  // ---- corner entrance tower (faces 45° between +z and +x) ----
  {
    const T = new THREE.Group();
    const tw = 8.5;
    const th = 10.2;
    const s = new THREE.Shape();
    s.moveTo(-tw / 2, 0); s.lineTo(tw / 2, 0); s.lineTo(tw / 2, th); s.lineTo(-tw / 2, th); s.closePath();
    const arch = new THREE.Path();
    const aw = 2.9;
    arch.moveTo(-aw, 0.05); arch.lineTo(aw, 0.05); arch.lineTo(aw, 3.0); arch.absarc(0, 3.0, aw, 0, Math.PI, false); arch.lineTo(-aw, 0.05);
    s.holes.push(arch);
    const win = new THREE.Path();
    win.moveTo(-2.8, 6.9); win.lineTo(2.8, 6.9); win.lineTo(2.8, 8.2); win.absarc(0, 8.2, 2.8, 0, Math.PI, false); win.lineTo(-2.8, 6.9);
    s.holes.push(win);
    const front = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 1.2, bevelEnabled: false, curveSegments: 20 }), stucco);
    front.castShadow = true;
    T.add(front);
    for (const sx of [-1, 1]) {
      const side = new THREE.Mesh(new THREE.BoxGeometry(1.2, th, 6), stucco);
      side.position.set(sx * (tw / 2 - 0.6), th / 2, -2.4);
      side.castShadow = true;
      T.add(side);
      const ft = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.0, 1.4), base);
      ft.position.set(sx * (tw / 2 - 0.6), 0.5, 0.6);
      T.add(ft);
    }
    // Doors and lobby glow inside the arch.
    const doors = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 2.6), new THREE.MeshStandardMaterial({ color: '#c9d5dc', roughness: 0.1, metalness: 0.4 }));
    doors.position.set(0, 1.35, -1.2);
    T.add(doors);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(5.6, 3.2), new THREE.MeshBasicMaterial({ color: '#f3e9d4' }));
    glow.position.set(0, 4.3, -1.25);
    T.add(glow);
    // Arched window with the red W panel.
    const winShape = new THREE.Shape(win.getPoints(24));
    const glass = new THREE.Mesh(new THREE.ShapeGeometry(winShape, 20), new THREE.MeshStandardMaterial({ color: '#e8eef2', roughness: 0.1, metalness: 0.3 }));
    glass.position.z = 0.4;
    T.add(glass);
    for (const x of [-1.4, 0, 1.4]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 4.2, 0.08), new THREE.MeshStandardMaterial({ color: '#d9d9d6' })); m.position.set(x, 8.8, 0.45); T.add(m); }
    const wTex = textTexture({ text: 'W', width: 256, height: 256, bg: red, ink: '#ffffff', font: 'italic 700 190px "Brush Script MT", Georgia, cursive' });
    const wPanel = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.0), new THREE.MeshStandardMaterial({ map: wTex, roughness: 0.4, emissive: '#7a0a1c', emissiveIntensity: 0.3 }));
    wPanel.position.set(0, 8.2, 0.5);
    T.add(wPanel);
    // Deep hipped tile cap.
    const eave = new THREE.Mesh(new THREE.BoxGeometry(tw + 2.0, 0.5, 8.2), stucco);
    eave.position.set(0, th + 0.25, -2.2);
    eave.castShadow = true;
    T.add(eave);
    const hip = new THREE.Mesh(new THREE.ConeGeometry(6.2, 1.1, 4, 1), tiles);
    hip.rotation.y = Math.PI / 4;
    hip.scale.set(1, 1, 0.95);
    hip.position.set(0, th + 1.05, -2.2);
    hip.castShadow = true;
    T.add(hip);
    T.rotation.y = Math.PI / 4;
    T.position.set(W / 2 - C / 2 + 0.8, 0, D / 2 - C / 2 + 0.8);
    add(T);
  }

  // Roof plant.
  for (const [x, z] of [[-8, -4], [4, -8], [-14, 6]]) {
    const u = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.3, 2), new THREE.MeshStandardMaterial({ color: '#c9c5bd', roughness: 0.5, metalness: 0.4 }));
    u.position.set(x, H + 0.95, z);
    add(u);
  }

  finish();

  const floorRange = () => [0, H];
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * 11;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, D / 2 + 4);
      case 'corner': return V(W / 2 + 1.5, y, D / 2 + 1.5);
      case 'right': return V(W / 2 + 4, y, (0.5 - u) * D);
      default: return V(0, y, 0);
    }
  };
  return { group: g, width: W, depth: D, height: 13, floorRange, hotspotPosition };
}
