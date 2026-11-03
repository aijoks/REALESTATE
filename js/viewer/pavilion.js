// Procedural model of a one-storey corner bank pavilion with a rooftop
// billboard, matched to photos of 250 Canal St (TD Bank, Canal & Lafayette):
//   - black steel frame and full-height glass on both street faces, with a
//     black organic laser-cut screen behind part of the glazing
//   - wraparound green fascia with TD logo panels and 道明银行 lettering,
//     black parapet above; "OPEN 7 DAYS" and "250" at the Canal St entrance
//   - steel billboard structure on the roof, angled to face the corner,
//     with a lit catwalk and a "NEW TRADITION" band under the ad panel
import * as THREE from 'three';
import { textTexture, rand } from './textures.js';
import { V, face, piece, wall, createKit } from './kit.js';

export function buildPavilion(params) {
  const { width: W = 21, depth: D = 19 } = params;
  const front = D / 2;
  const r = rand(250);
  const glassTop = 4.9;
  const fasciaH = 2.3;
  const parapetH = 1.1;
  const top = glassTop + fasciaH + parapetH;

  const g = new THREE.Group();
  g.name = 'building';
  const { matSteel, I, opening, add, finish } = createKit(g, r);
  const black = new THREE.MeshStandardMaterial({ color: '#141516', roughness: 0.45, metalness: 0.4 });
  const green = new THREE.MeshStandardMaterial({ color: '#56b532', roughness: 0.55, emissive: '#2c6b14', emissiveIntensity: 0.25 });

  // Laser-cut screen texture (black organic pattern on transparent).
  const screenTex = textTexture({
    width: 512, height: 512, bg: 'rgba(0,0,0,0)',
    draw(ctx, w, h) {
      ctx.strokeStyle = '#0d0e0f';
      ctx.lineCap = 'round';
      for (let i = 0; i < 70; i++) {
        ctx.lineWidth = 6 + r() * 10;
        ctx.beginPath();
        let x = r() * w;
        let y = r() * h;
        ctx.moveTo(x, y);
        for (let k = 0; k < 3; k++) { x += (r() - 0.5) * 160; y += (r() - 0.5) * 160; ctx.lineTo(x, y); }
        ctx.stroke();
      }
    },
  });
  screenTex.wrapS = screenTex.wrapT = THREE.RepeatWrapping;

  // One street elevation: black wall with full-height glazed bays.
  function elevation(F, len, bays, entranceBay, screens) {
    const col = 0.55;
    const bay = (len - col) / bays;
    const holes = [];
    for (let i = 0; i < bays; i++) {
      const cx = col + i * bay + (bay - col) / 2;
      const ent = i === entranceBay;
      holes.push({
        x: cx, y: 0.15 + (glassTop - 0.35) / 2, w: bay - col, h: glassTop - 0.35,
        kind: ent ? 'lobby' : 'grid', cols: 2, transom: 1.1, room: 'lobby', frame: '#111213', reveal: '#1a1b1c', rd: 0.25, sill: false, roomDepth: 6,
      });
      if (screens.includes(i)) {
        const s = new THREE.Mesh(new THREE.PlaneGeometry(bay - col - 0.1, glassTop - 1.6), new THREE.MeshBasicMaterial({ map: screenTex, transparent: true, depthWrite: false }));
        s.applyMatrix4(piece(F, cx, 0.15 + (glassTop - 1.6) / 2, -0.4, 1, 1, 1));
        add(s);
      }
    }
    add(wall(F, len, top, holes, black));
    holes.forEach((o) => opening(F, o));
    // Projecting black columns.
    for (let i = 0; i <= bays; i++) I.trim.add(piece(F, col / 2 + i * bay, glassTop / 2, 0.12, col, glassTop, 0.25), '#101112');
    return bay;
  }

  const Ff = face(0, -W / 2, 0, front); // Canal St (north), local x west -> east? (west at +x)
  const Fl = face(-Math.PI / 2, -W / 2, 0, -D / 2); // Lafayette St (east, -x), runs south -> north
  elevation(Ff, W, 5, 3, [0, 1]);
  elevation(Fl, D, 5, -1, [0, 1, 2]);
  add(wall(face(Math.PI / 2, W / 2, 0, front), D, top, [], black));
  add(wall(face(Math.PI, W / 2, 0, -D / 2), W, top, [], black));

  // Green fascia wrapping the two street faces, with TD panels and lettering.
  {
    const panel = (cn) => textTexture({
      width: 1024, height: 256, bg: '#56b532',
      draw(ctx, w, h) {
        ctx.fillStyle = '#3f9a24'; ctx.fillRect(0, 0, h * 1.15, h);
        ctx.fillStyle = '#ffffff'; ctx.textBaseline = 'middle';
        ctx.font = '700 150px "Helvetica Neue", Arial, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('TD', h * 0.575, h / 2 + 6);
        if (cn) { ctx.textAlign = 'left'; ctx.font = '500 110px "PingFang SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif'; ctx.fillText('道明银行', h * 1.4, h / 2 + 4); }
      },
    });
    const pFront = new THREE.MeshStandardMaterial({ map: panel(true), roughness: 0.55, emissive: '#ffffff', emissiveMap: panel(true), emissiveIntensity: 0.12 });
    const pBig = new THREE.MeshStandardMaterial({ map: panel(false), roughness: 0.55 });
    const y = glassTop + fasciaH / 2;
    const band = (F, len) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(len + 0.1, fasciaH, 0.25), green);
      m.applyMatrix4(piece(F, len / 2, y, 0.25, 1, 1, 1));
      m.castShadow = true;
      add(m);
    };
    band(Ff, W);
    band(Fl, D);
    const sign = (F, x, w, mat) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, fasciaH * 0.85), mat);
      m.applyMatrix4(piece(F, x, y, 0.385, 1, 1, 1));
      add(m);
    };
    sign(Ff, 4.2, 7.2, pFront);
    sign(Ff, W - 3.0, 4.2, pBig);
    sign(Fl, 4.0, 7.2, pFront);
    sign(Fl, D - 2.4, 4.2, pBig);
    // Black parapet band with a thin coping.
    for (const [F, len] of [[Ff, W], [Fl, D]]) {
      const p = new THREE.Mesh(new THREE.BoxGeometry(len + 0.3, parapetH, 0.35), black);
      p.applyMatrix4(piece(F, len / 2, glassTop + fasciaH + parapetH / 2, 0.2, 1, 1, 1));
      add(p);
    }
    // "OPEN 7 DAYS" and "250" on the glass by the Canal St entrance.
    const open = textTexture({ text: 'OPEN 7 DAYS', width: 512, height: 96, bg: 'rgba(0,0,0,0)', ink: '#ffffff', font: '600 64px "Helvetica Neue", Arial' });
    const o = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.42), new THREE.MeshBasicMaterial({ map: open, transparent: true, depthWrite: false }));
    o.applyMatrix4(piece(Ff, 13.3, 3.9, -0.22, 1, 1, 1));
    add(o);
    const num = textTexture({ text: '250', width: 256, height: 128, bg: 'rgba(0,0,0,0)', ink: '#ffffff', font: '600 84px "Helvetica Neue", Arial' });
    const n = new THREE.Mesh(new THREE.PlaneGeometry(0.8, 0.4), new THREE.MeshBasicMaterial({ map: num, transparent: true, depthWrite: false }));
    n.applyMatrix4(piece(Ff, 13.3, 3.2, -0.22, 1, 1, 1));
    add(n);
  }

  // Roof.
  const roof = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: '#3c3b39', roughness: 1 }));
  roof.rotation.x = -Math.PI / 2;
  roof.position.y = top - 0.4;
  roof.receiveShadow = true;
  add(roof);

  // =====================================================================
  // ROOFTOP BILLBOARD, angled to face the Canal & Lafayette corner
  // =====================================================================
  {
    const bb = new THREE.Group();
    const bw = 17;
    const bh = 6.2;
    const base = top - 0.4;
    const y0 = base + 6.2; // bottom of the ad panel
    const S = (x, y, z, sx, sy, sz, q) => { const m = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), black); m.position.set(x, y, z); m.scale.set(sx, sy, sz); if (q) m.quaternion.copy(q); m.castShadow = true; bb.add(m); };
    for (const x of [-bw / 2 + 1.5, -2.2, 2.2, bw / 2 - 1.5]) {
      for (const z of [-2.4, -0.4]) S(x, base + (y0 - base) / 2, z, 0.28, y0 - base, 0.28);
      const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.7, 0, 0));
      S(x, base + 2.4, -1.4, 0.12, 4.4, 0.12, q);
    }
    S(0, y0 - 0.15, -1.4, bw + 0.6, 0.25, 2.8); // catwalk
    for (let x = -bw / 2; x <= bw / 2; x += 1.1) S(x, y0 + 0.45, 0.85, 0.05, 1.0, 0.05); // railing posts
    S(0, y0 + 0.95, 0.85, bw, 0.06, 0.06);
    // Lamps on arms.
    const lampMat = new THREE.MeshStandardMaterial({ color: '#d9d9d6', roughness: 0.4, metalness: 0.6 });
    for (let x = -bw / 2 + 1.5; x < bw / 2; x += 3.3) {
      const l = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.25, 0.4), lampMat);
      l.position.set(x, y0 - 0.5, 1.6);
      bb.add(l);
    }
    // "NEW TRADITION" band and the ad panel.
    const band = textTexture({
      width: 1024, height: 96, bg: '#151617',
      draw(ctx, w, h) { ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = 'italic 900 64px Arial Black, Arial'; ctx.fillStyle = '#8be04e'; ctx.fillText('NEW', w / 2 - 130, h / 2 + 3); ctx.fillStyle = '#ffffff'; ctx.fillText('TRADITION', w / 2 + 90, h / 2 + 3); },
    });
    const bandM = new THREE.Mesh(new THREE.PlaneGeometry(bw, 1.2), new THREE.MeshStandardMaterial({ map: band, roughness: 0.5 }));
    bandM.position.set(0, y0 - 1.0, 1.2);
    bb.add(bandM);
    const ad = textTexture({
      width: 1024, height: 384, bg: '#f46b45',
      draw(ctx, w, h) {
        const grd = ctx.createLinearGradient(0, h, w, 0);
        grd.addColorStop(0, '#f9a12e'); grd.addColorStop(0.45, '#f2546c'); grd.addColorStop(1, '#c13584');
        ctx.fillStyle = grd; ctx.fillRect(0, 0, w, h);
        ctx.fillStyle = 'rgba(20,20,30,0.85)'; ctx.fillRect(w * 0.37, 0, w * 0.26, h * 0.86);
        ctx.fillStyle = 'rgba(255,255,255,0.18)';
        ctx.beginPath(); ctx.arc(w * 0.47, h * 0.35, 46, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(w * 0.55, h * 0.4, 46, 0, Math.PI * 2); ctx.fill();
      },
    });
    const adM = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.35), [black, black, black, black, new THREE.MeshStandardMaterial({ map: ad, roughness: 0.6, emissive: '#ffffff', emissiveMap: ad, emissiveIntensity: 0.15 }), black]);
    adM.position.set(0, y0 + bh / 2 + 0.2, 0.9);
    adM.castShadow = true;
    bb.add(adM);
    bb.rotation.y = -Math.PI / 5.5; // turned toward the corner
    bb.position.set(-1.5, 0, front - 6.5);
    add(bb);
  }

  finish();

  const floorRange = () => [0, glassTop];
  const hotspotPosition = ([u, v, faceName]) => {
    const y = v * top;
    switch (faceName) {
      case 'front': return V((u - 0.5) * W, y, front + 1.0);
      case 'left': return V(-W / 2 - 1.0, y, (u - 0.5) * D);
      case 'roof': return V((u - 0.5) * W, y, 0);
      default: return V(0, y, 0);
    }
  };
  return { group: g, width: W, depth: D, height: 16, floorRange, hotspotPosition };
}
