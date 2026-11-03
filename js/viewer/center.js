// Procedural model of a grocery-anchored neighbourhood shopping center,
// matched to photos of Saguaro Vista Shopping Center, Tucson:
//   - Fry's Food & Drug anchor: cream stucco with grey split-face block
//     piers, a central front gable over a recessed glass entrance, standing-
//     seam red-brown metal roofs on the wings, lit red FRY'S FOOD & DRUG
//     sign, Pharmacy / Western Union / Bakery-Deli lettering, storefront
//     glass and a covered walk
//   - Potosino Mexican Food pad (No. 7865): stepped stucco box with small
//     square windows, stone wainscot, metal shade awnings on brackets, sun
//     logo, and a red monument sign
import * as THREE from 'three';
import { textTexture, rand } from './textures.js';
import { V, piece, createKit } from './kit.js';

export function buildCenter(params) {
  const { width: W = 110, depth: D = 55 } = params;
  const front = D / 2;
  const r = rand(7865);
  const g = new THREE.Group();
  g.name = 'building';
  const { I, add, finish } = createKit(g, r);
  const stucco = new THREE.MeshStandardMaterial({ color: '#e7dcc9', roughness: 0.95 });
  const block = new THREE.MeshStandardMaterial({ color: '#8f8a84', roughness: 0.95 });
  const metal = new THREE.MeshStandardMaterial({ color: '#8e4b3a', roughness: 0.55, metalness: 0.35 });
  const seamTex = textTexture({ width: 128, height: 128, bg: '#8e4b3a', draw(ctx, w, h) { ctx.fillStyle = '#6e372b'; for (let x = 0; x < w; x += 16) ctx.fillRect(x, 0, 3, h); } });
  seamTex.wrapS = seamTex.wrapT = THREE.RepeatWrapping;
  seamTex.repeat.set(20, 1);
  const seams = new THREE.MeshStandardMaterial({ map: seamTex, roughness: 0.55, metalness: 0.35 });
  const box = (mat, w, h, d, x, y, z) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = m.receiveShadow = true;
    return add(m);
  };
  const sign = (txt, font, color, w, h, x, y, z, glow = 0.35, ry = 0) => {
    const tex = textTexture({
      width: 1024, height: Math.round(1024 * h / w), bg: 'rgba(0,0,0,0)',
      draw(ctx, cw, ch) { ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = font(ch); ctx.fillText(txt, cw / 2, ch / 2 + 3); },
    });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.4, emissive: color, emissiveMap: tex, emissiveIntensity: glow, depthWrite: false }));
    m.position.set(x, y, z);
    m.rotation.y = ry;
    return add(m);
  };

  // =====================================================================
  // ANCHOR: Fry's Food & Drug
  // =====================================================================
  const H = 8.5;
  box(stucco, W, H, D, 0, H / 2, 0);
  box(block, W + 0.1, 1.0, D + 0.1, 0, 0.5, 0);
  // Covered walk along the front with block piers.
  box(stucco, W, 0.6, 4.2, 0, 4.6, front + 2.1);
  for (let x = -W / 2 + 2; x <= W / 2 - 2; x += 8.5) box(block, 1.2, 4.6, 1.2, x, 2.3, front + 3.8);
  // Storefront glass along the walk.
  for (let x = -W / 2 + 6; x < W / 2 - 4; x += 3.2) {
    if (Math.abs(x) < 9) continue;
    I.clear.add(piece(new THREE.Matrix4(), x, 1.9, front + 0.02, 3.0, 2.6, 1), '#e8eef4');
    I.frame.add(piece(new THREE.Matrix4(), x + 1.55, 1.9, front + 0.04, 0.1, 2.7, 0.06), '#2b2f33');
  }
  // Wing roofs: sloped standing-seam metal bands over each half.
  for (const sx of [-1, 1]) {
    const wlen = W / 2 - 9;
    const roof = box(seams, wlen, 0.3, 6.5, sx * (9 + wlen / 2), H + 1.6, front - 1.5);
    roof.rotation.x = -0.45;
    box(stucco, wlen, 2.4, 0.6, sx * (9 + wlen / 2), H + 0.6, front - 4);
    // Hipped ends.
    const end = new THREE.Mesh(new THREE.ConeGeometry(3.4, 2.8, 4), metal);
    end.rotation.y = Math.PI / 4;
    end.scale.set(0.9, 1, 1.1);
    end.position.set(sx * (W / 2 - 1), H + 1.4, front - 2);
    add(end);
    // Block pilasters rising through the parapet.
    for (const x of [sx * 18, sx * 34]) box(block, 2.2, H + 1.2, 1.0, x, (H + 1.2) / 2, front + 0.4);
  }
  // Central gable over the entrance.
  {
    const gw = 18;
    const gh = 13.5;
    const s = new THREE.Shape();
    s.moveTo(-gw / 2, 0); s.lineTo(gw / 2, 0); s.lineTo(gw / 2, gh - 3); s.lineTo(0, gh); s.lineTo(-gw / 2, gh - 3); s.closePath();
    const facade = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 1.2, bevelEnabled: false }), stucco);
    facade.position.set(0, 0, front + 0.6);
    facade.castShadow = true;
    add(facade);
    box(block, gw + 0.2, 5.4, 1.4, 0, 2.7, front + 1.2);
    // Recessed glass entrance under an arch-like opening.
    I.clear.add(piece(new THREE.Matrix4(), 0, 2.2, front + 1.95, 10, 3.6, 1), '#e8eef4');
    for (let x = -5; x <= 5; x += 1.25) I.frame.add(piece(new THREE.Matrix4(), x, 2.2, front + 1.97, 0.08, 3.6, 0.05), '#2b2f33');
    const lobby = new THREE.Mesh(new THREE.BoxGeometry(10, 3.6, 3), new THREE.MeshBasicMaterial({ color: '#f6efe0', side: THREE.BackSide }));
    lobby.position.set(0, 2.2, front + 0.4);
    add(lobby);
    // Metal gable roof behind the facade.
    for (const sx of [-1, 1]) {
      const pane = box(seams, gw / 2 + 1.2, 0.3, 14, sx * gw / 4, gh - 1.6, front - 6);
      pane.rotation.z = sx * -0.33;
    }
    sign("FRY'S", (h) => `900 ${Math.round(h * 0.85)}px Arial Black, Arial`, '#d0242e', 8, 2.2, 0, 8.6, front + 1.82, 0.5);
    sign('FOOD & DRUG', (h) => `800 ${Math.round(h * 0.8)}px Arial`, '#d0242e', 8.5, 1.0, 0, 6.9, front + 1.82, 0.5);
  }
  sign('Pharmacy', (h) => `italic 600 ${Math.round(h * 0.8)}px Georgia, serif`, '#2b2f33', 5, 1.0, -26, 6.4, front + 0.05, 0);
  sign('WESTERN UNION', (h) => `700 ${Math.round(h * 0.75)}px Arial`, '#2b2f33', 6, 0.7, -14, 6.4, front + 0.05, 0);
  sign('Bakery-Deli', (h) => `italic 700 ${Math.round(h * 0.8)}px Georgia, serif`, '#2b2f33', 6.5, 1.2, 24, 6.4, front + 0.05, 0);
  // Roof units.
  for (let k = 0; k < 8; k++) box(new THREE.MeshStandardMaterial({ color: '#c9c5bd', roughness: 0.5, metalness: 0.4 }), 3, 1.4, 2.4, -40 + k * 11, H + 0.7, -8 + (k % 3) * 6);

  // =====================================================================
  // PAD: Potosino Mexican Food (No. 7865)
  // =====================================================================
  {
    const px = -W / 2 - 22;
    const pz = front + 20;
    const pw = 12;
    const pd = 9;
    box(stucco, pw, 7.0, pd, px, 3.5, pz);
    box(stucco, 3, 6.0, pd - 2, px + pw / 2 + 1.4, 3.0, pz - 0.5); // stepped side mass
    box(stucco, pw + 0.8, 0.5, pd + 0.8, px, 7.2, pz);
    box(stucco, 3.6, 0.45, pd - 1.2, px + pw / 2 + 1.4, 6.2, pz - 0.5);
    const stone = new THREE.MeshStandardMaterial({ color: '#7a6a5a', roughness: 1 });
    for (const x of [px - pw / 2 + 0.8, px - 0.6, px + pw / 2 - 0.8]) box(stone, 1.4, 1.1, 0.3, x, 0.55, pz + pd / 2 + 0.1);
    for (const x of [px - 3.5, px + 3.5]) {
      I.clear.add(piece(new THREE.Matrix4(), x, 1.9, pz + pd / 2 + 0.02, 4.4, 3.0, 1), '#e8eef4');
      for (let k = -2; k <= 2; k++) I.frame.add(piece(new THREE.Matrix4(), x + k * 1.1, 1.9, pz + pd / 2 + 0.04, 0.08, 3.0, 0.05), '#202326');
    }
    for (let k = 0; k < 4; k++) I.trim.add(piece(new THREE.Matrix4(), px - 4.2 + k * 2.8, 6.0, pz + pd / 2 + 0.02, 0.7, 0.7, 0.04), '#3b4650');
    const awn = new THREE.MeshStandardMaterial({ color: '#4e4a45', roughness: 0.5, metalness: 0.5 });
    const shade = box(awn, pw + 2.5, 0.12, 2.2, px, 3.9, pz + pd / 2 + 1.1);
    shade.rotation.x = 0.12;
    for (const x of [px - 5, px, px + 5]) I.steel.add(piece(new THREE.Matrix4(), x, 3.5, pz + pd / 2 + 0.5, 0.06, 0.8, 0.8));
    const logo = textTexture({
      width: 1024, height: 256, bg: 'rgba(0,0,0,0)',
      draw(ctx, w, h) {
        ctx.fillStyle = '#f2b81c'; ctx.beginPath(); ctx.arc(w * 0.86, h * 0.45, 70, 0, Math.PI * 2); ctx.fill();
        ctx.font = 'italic 900 128px Georgia, serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillStyle = '#f4c23a'; ctx.fillText('Potosino', w / 2 + 4, h * 0.4 + 4); ctx.fillStyle = '#d6331f'; ctx.fillText('Potosino', w / 2, h * 0.4);
        ctx.font = '700 46px Arial'; ctx.fillStyle = '#1f9fb1'; ctx.fillText('MexicanFood', w / 2, h * 0.82);
      },
    });
    const lg = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.5), new THREE.MeshStandardMaterial({ map: logo, transparent: true, roughness: 0.4, emissive: '#ffffff', emissiveMap: logo, emissiveIntensity: 0.2, depthWrite: false }));
    lg.position.set(px, 4.9, pz + pd / 2 + 0.03);
    add(lg);
    sign('7865', (h) => `600 ${Math.round(h * 0.85)}px Arial`, '#6f6a62', 1.6, 0.5, px + pw / 2 - 1.2, 6.6, pz + pd / 2 + 0.03, 0);
    // Red monument sign and a planter wall with agave.
    const mono = textTexture({
      width: 256, height: 384, bg: '#d6331f',
      draw(ctx, w, h) { ctx.fillStyle = '#f2e6c8'; ctx.fillRect(24, 60, w - 48, 180); ctx.fillStyle = '#d6331f'; ctx.font = 'italic 900 52px Georgia'; ctx.textAlign = 'center'; ctx.fillText('Potosino', w / 2, 150); ctx.font = '600 24px Arial'; ctx.fillText('Mexican Food', w / 2, 190); },
    });
    const m = box(new THREE.MeshStandardMaterial({ color: '#d6331f', roughness: 0.6 }), 1.6, 2.4, 0.5, px - 9, 1.2, pz + pd / 2 + 6);
    const face = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 2.3), new THREE.MeshStandardMaterial({ map: mono, roughness: 0.6 }));
    face.position.set(m.position.x, 1.2, m.position.z + 0.26);
    add(face);
    box(stucco, 9, 1.0, 0.5, px + 3, 0.5, pz + pd / 2 + 4);
  }

  finish();
  const floorRange = () => [0, H];
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * 13;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, front + 4);
      case 'pad': return V(-W / 2 - 22, 9, front + 25);
      case 'roof': return V((u - 0.5) * W, y, 0);
      default: return V(0, y, 0);
    }
  };
  return { group: g, width: W, depth: D, height: 15, floorRange, hotspotPosition };
}
