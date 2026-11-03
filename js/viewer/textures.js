// Procedural canvas textures — no external image assets needed for the model.
// Brick textures are generated at real-world scale (one tile = TILE metres)
// with a matching normal map so mortar joints catch the light.
import * as THREE from 'three';

export const TILE = 1.625; // metres covered by one brick texture tile (8 bricks x 24 courses)

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export function rand(seed) {
  // Deterministic PRNG so the facade looks the same on every load.
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const cache = new Map();
function cached(key, make) {
  if (!cache.has(key)) cache.set(key, make());
  return cache.get(key);
}

function finish(canvas, { srgb = true, repeat = true } = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  if (repeat) tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  if (srgb) tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

// Height map -> tangent-space normal map.
function normalFromHeight(hctx, size, strength = 2.5) {
  const src = hctx.getImageData(0, 0, size, size).data;
  const out = makeCanvas(size, size);
  const octx = out.getContext('2d');
  const img = octx.createImageData(size, size);
  const h = (x, y) => src[(((y + size) % size) * size + ((x + size) % size)) * 4] / 255;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = (h(x + 1, y) - h(x - 1, y)) * strength;
      const dy = (h(x, y + 1) - h(x, y - 1)) * strength;
      const len = Math.hypot(dx, dy, 1);
      const i = (y * size + x) * 4;
      img.data[i] = ((-dx / len) * 0.5 + 0.5) * 255;
      img.data[i + 1] = ((dy / len) * 0.5 + 0.5) * 255;
      img.data[i + 2] = ((1 / len) * 0.5 + 0.5) * 255;
      img.data[i + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  return out;
}

// Variegated running-bond brick with occasional dark clinkers.
// palette: list of [r,g,b] brick colours; mortar: css colour.
export function brick(name, { palette, mortar, clinker = 0.08, seed = 7, size = 1024 }) {
  return cached(`brick:${name}`, () => {
    const c = makeCanvas(size, size);
    const ctx = c.getContext('2d');
    const hc = makeCanvas(size, size);
    const hctx = hc.getContext('2d');
    const r = rand(seed);
    ctx.fillStyle = mortar;
    ctx.fillRect(0, 0, size, size);
    hctx.fillStyle = '#3a3a3a';
    hctx.fillRect(0, 0, size, size);
    const cols = 8;
    const rows = 24;
    const bw = size / cols;
    const bh = size / rows;
    const joint = Math.max(2, Math.round(size / 220));
    for (let row = 0; row < rows; row++) {
      const offset = row % 2 ? bw / 2 : 0;
      for (let col = -1; col <= cols; col++) {
        const base = palette[Math.floor(r() * palette.length)];
        const dark = r() < clinker ? 0.62 : 1;
        const v = 0.86 + r() * 0.26;
        const k = v * dark;
        const x = col * bw + offset + joint / 2;
        const y = row * bh + joint / 2;
        const w = bw - joint;
        const hgt = bh - joint;
        ctx.fillStyle = `rgb(${base[0] * k | 0},${base[1] * k | 0},${base[2] * k | 0})`;
        ctx.fillRect(x, y, w, hgt);
        // Speckle + soft edge burn for texture inside each brick.
        for (let i = 0; i < 26; i++) {
          const a = r() * 0.16;
          ctx.fillStyle = r() < 0.5 ? `rgba(0,0,0,${a})` : `rgba(255,235,215,${a * 0.6})`;
          ctx.fillRect(x + r() * w, y + r() * hgt, 1 + r() * 3, 1 + r() * 2);
        }
        const g = ctx.createLinearGradient(x, y, x, y + hgt);
        g.addColorStop(0, 'rgba(255,255,255,0.05)');
        g.addColorStop(1, 'rgba(0,0,0,0.12)');
        ctx.fillStyle = g;
        ctx.fillRect(x, y, w, hgt);
        hctx.fillStyle = `rgb(${200 + r() * 40 | 0},0,0)`;
        hctx.fillRect(x, y, w, hgt);
      }
    }
    const map = finish(c);
    const normalMap = finish(normalFromHeight(hctx, size), { srgb: false });
    for (const t of [map, normalMap]) t.repeat.set(1 / TILE, 1 / TILE);
    return { map, normalMap };
  });
}

export const BRICK = {
  // Deep red-brown face brick of the tower (Candela-era Flemish feel).
  tower: () => brick('tower', {
    palette: [[156, 74, 52], [140, 64, 46], [166, 86, 62], [126, 58, 42], [150, 80, 60], [176, 96, 70]],
    mortar: '#9c8e80', clinker: 0.09, seed: 11,
  }),
  // Chocolate-brown brick of the two-storey retail base.
  base: () => brick('base', {
    palette: [[100, 64, 52], [88, 56, 46], [110, 72, 58], [78, 50, 42], [116, 80, 66]],
    mortar: '#6a5a50', clinker: 0.05, seed: 5,
  }),
  // Buff / cream face brick of 1910s loft buildings (10 E 38th St).
  buff: () => brick('buff', {
    // 10 E 38th: cool light grey-buff face brick.
    palette: [[212, 205, 191], [202, 195, 181], [219, 213, 200], [194, 187, 173], [207, 199, 184]],
    mortar: '#cdc6b8', clinker: 0.03, seed: 38,
  }),
  // 115 E 23rd: warm cream glazed-look brick.
  cream: () => brick('cream', {
    palette: [[222, 206, 180], [214, 198, 172], [228, 214, 190], [206, 190, 164], [218, 203, 176]],
    mortar: '#d6cab4', clinker: 0.02, seed: 23,
  }),
  // Grey-tan face brick of the Ladies' Mile lofts (133 W 21st St).
  tan: () => brick('tan', {
    palette: [[172, 156, 134], [160, 145, 124], [182, 167, 146], [150, 136, 117], [168, 150, 126]],
    mortar: '#a69c8c', clinker: 0.06, seed: 21,
  }),
  // Lighter, rougher common brick on the side and rear walls.
  common: () => brick('common', {
    palette: [[142, 80, 60], [128, 72, 56], [150, 92, 70], [118, 70, 58], [136, 98, 82]],
    mortar: '#9a8f84', clinker: 0.04, seed: 23,
  }),
};

export function stone() {
  return cached('stone', () => {
    const size = 512;
    const c = makeCanvas(size, size);
    const ctx = c.getContext('2d');
    const r = rand(3);
    ctx.fillStyle = '#d4c9b3';
    ctx.fillRect(0, 0, size, size);
    for (let i = 0; i < 9000; i++) {
      const a = r() * 0.08;
      ctx.fillStyle = r() < 0.55 ? `rgba(60,50,40,${a})` : `rgba(255,255,255,${a})`;
      ctx.fillRect(r() * size, r() * size, 1 + r() * 3, 1 + r() * 3);
    }
    // Faint ashlar joints.
    ctx.strokeStyle = 'rgba(90,80,70,0.25)';
    ctx.lineWidth = 2;
    for (let y = 0; y < size; y += size / 4) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(size, y); ctx.stroke();
    }
    const map = finish(c);
    map.repeat.set(1 / 1.2, 1 / 1.2);
    return map;
  });
}

// Large-scale weathering: soot streaks under sills, darker base, blotches.
// Sampled with a 0..1 face UV so it never tiles.
export function grime(name, { seed = 1, streaks = 60, strength = 1, w = 512, h = 1024 } = {}) {
  return cached(`grime:${name}`, () => {
    const c = makeCanvas(w, h);
    const ctx = c.getContext('2d');
    const r = rand(seed);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 40; i++) {
      const x = r() * w;
      const y = r() * h;
      const rad = 40 + r() * 160;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      const a = (0.05 + r() * 0.12) * strength;
      const tone = r() < 0.5 ? '60,60,60' : '120,110,100';
      g.addColorStop(0, `rgba(${tone},${a})`);
      g.addColorStop(1, `rgba(${tone},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    for (let i = 0; i < streaks; i++) {
      const x = r() * w;
      const y = r() * h;
      const len = 60 + r() * 260;
      const g = ctx.createLinearGradient(0, y, 0, y + len);
      g.addColorStop(0, `rgba(40,40,40,${(0.08 + r() * 0.12) * strength})`);
      g.addColorStop(1, 'rgba(40,40,40,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, 2 + r() * 10, len);
    }
    const g = ctx.createLinearGradient(0, h, 0, h * 0.75);
    g.addColorStop(0, `rgba(30,30,30,${0.25 * strength})`);
    g.addColorStop(1, 'rgba(30,30,30,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, h * 0.75, w, h * 0.25);
    const tex = finish(c, { repeat: false });
    tex.flipY = true;
    return tex;
  });
}

// Curtain wall / punched window facades for neighbouring towers.
export function facadeTexture(kind, seed = 1) {
  return cached(`facade:${kind}:${seed}`, () => {
    const size = 512;
    const c = makeCanvas(size, size);
    const ctx = c.getContext('2d');
    const r = rand(seed);
    if (kind === 'glass') {
      const g = ctx.createLinearGradient(0, 0, size, size);
      g.addColorStop(0, '#5f7f9c');
      g.addColorStop(1, '#2f4a63');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, size, size);
      for (let y = 0; y < size; y += 64) for (let x = 0; x < size; x += 32) {
        ctx.fillStyle = `rgba(${r() < 0.5 ? '255,255,255' : '0,0,0'},${r() * 0.08})`;
        ctx.fillRect(x, y, 32, 64);
      }
      ctx.fillStyle = '#2a3440';
      for (let y = 0; y < size; y += 64) ctx.fillRect(0, y, size, 5);
      for (let x = 0; x < size; x += 32) ctx.fillRect(x, 0, 3, size);
    } else if (kind === 'banded') {
      ctx.fillStyle = '#c8b9a2';
      ctx.fillRect(0, 0, size, size);
      for (let y = 0; y < size; y += 64) {
        ctx.fillStyle = '#4b5966';
        ctx.fillRect(0, y + 24, size, 26);
        for (let x = 0; x < size; x += 32) {
          ctx.fillStyle = `rgba(255,240,210,${r() < 0.2 ? 0.35 : 0})`;
          ctx.fillRect(x + 2, y + 26, 28, 22);
          ctx.fillStyle = '#9b8e7b';
          ctx.fillRect(x, y + 24, 2, 26);
        }
      }
    } else if (kind === 'fluted') {
      ctx.fillStyle = '#a9adb2';
      ctx.fillRect(0, 0, size, size);
      for (let x = 0; x < size; x += 8) {
        const g = ctx.createLinearGradient(x, 0, x + 8, 0);
        g.addColorStop(0, '#7d8288');
        g.addColorStop(0.5, '#d9dde1');
        g.addColorStop(1, '#868b91');
        ctx.fillStyle = g;
        ctx.fillRect(x, 0, 8, size);
      }
      ctx.fillStyle = 'rgba(60,60,60,0.35)';
      for (let y = 0; y < size; y += 128) ctx.fillRect(0, y, size, 2);
    } else if (kind === 'louver') {
      ctx.fillStyle = '#5c4636';
      ctx.fillRect(0, 0, size, size);
      for (let x = 0; x < size; x += 16) {
        ctx.fillStyle = r() < 0.5 ? '#7a5e48' : '#6b513e';
        ctx.fillRect(x, 0, 10, size);
      }
    } else if (kind === 'prewar') {
      ctx.fillStyle = '#d8cfbf';
      ctx.fillRect(0, 0, size, size);
      for (let y = 8; y < size; y += 64) for (let x = 10; x < size; x += 64) {
        ctx.fillStyle = r() < 0.25 ? '#e9d7ad' : '#3b4450';
        ctx.fillRect(x, y + 10, 30, 40);
        ctx.fillStyle = '#b9ad98';
        ctx.fillRect(x - 3, y + 50, 36, 4);
      }
    } else if (kind === 'netting') {
      // Black construction netting with orange stripes over pipe scaffold.
      ctx.fillStyle = '#16181a';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 3000; i++) { ctx.fillStyle = `rgba(255,255,255,${r() * 0.05})`; ctx.fillRect(r() * size, r() * size, 1, 3); }
      ctx.fillStyle = 'rgba(60,64,68,0.55)';
      for (let y = 0; y < size; y += 43) ctx.fillRect(0, y, size, 3);
      for (let x = 0; x < size; x += 64) {
        ctx.fillStyle = '#b8521d';
        ctx.fillRect(x + 30, 0, 3, size);
        ctx.fillStyle = 'rgba(90,96,100,0.5)';
        ctx.fillRect(x + 6, 0, 2, size);
      }
    } else if (kind === 'beaux') {
      // Beaux-arts limestone: deep window pairs between pilasters.
      ctx.fillStyle = '#d6ccb8';
      ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 4000; i++) { ctx.fillStyle = `rgba(80,70,55,${r() * 0.06})`; ctx.fillRect(r() * size, r() * size, 2, 2); }
      for (let y = 0; y < size; y += 128) {
        ctx.fillStyle = '#c2b7a1'; ctx.fillRect(0, y + 116, size, 12);
        for (let x = 0; x < size; x += 128) {
          ctx.fillStyle = '#e3dac8'; ctx.fillRect(x, y, 18, 128);
          for (const dx of [32, 78]) {
            ctx.fillStyle = '#9d9282'; ctx.fillRect(x + dx - 3, y + 18, 40, 86);
            ctx.fillStyle = r() < 0.2 ? '#4f5156' : '#2a2d31'; ctx.fillRect(x + dx, y + 22, 34, 78);
            ctx.fillStyle = '#c9bfab'; ctx.fillRect(x + dx - 4, y + 100, 42, 6);
          }
        }
      }
    } else if (kind === 'brickwall') {
      // Plain red-brick party wall.
      ctx.fillStyle = '#8b4c3a';
      ctx.fillRect(0, 0, size, size);
      for (let y = 0; y < size; y += 8) {
        const off = (y / 8) % 2 ? 12 : 0;
        for (let x = -off; x < size; x += 24) {
          const v = 0.85 + r() * 0.3;
          ctx.fillStyle = `rgb(${142 * v | 0},${76 * v | 0},${58 * v | 0})`;
          ctx.fillRect(x + 1, y + 1, 22, 6);
        }
      }
      for (let i = 0; i < 25; i++) { ctx.fillStyle = `rgba(40,40,40,${r() * 0.12})`; ctx.fillRect(r() * size, r() * size, 40 + r() * 120, 20 + r() * 80); }
    } else if (kind === 'esb') {
      // Limestone with continuous vertical window strips and metal spandrels.
      ctx.fillStyle = '#cdc7ba';
      ctx.fillRect(0, 0, size, size);
      for (let x = 8; x < size; x += 32) {
        ctx.fillStyle = '#9aa1a8'; ctx.fillRect(x, 0, 14, size);
        for (let y = 0; y < size; y += 36) { ctx.fillStyle = r() < 0.12 ? '#e7d8b0' : '#3a4148'; ctx.fillRect(x + 2, y + 6, 10, 24); }
      }
    } else if (kind === 'redtower') {
      // Red-brick residential tower: punched windows + glass bay strips.
      ctx.fillStyle = '#a4553d';
      ctx.fillRect(0, 0, size, size);
      for (let y = 0; y < size; y += 64) {
        ctx.fillStyle = '#c9b9a3'; ctx.fillRect(0, y + 54, size, 6);
        for (let x = 0; x < size; x += 128) {
          ctx.fillStyle = '#7f9bb0'; ctx.fillRect(x + 8, y + 12, 44, 40);
          ctx.fillStyle = '#d7dde2'; ctx.fillRect(x + 8, y + 30, 44, 3);
          ctx.fillStyle = r() < 0.2 ? '#e9d8b2' : '#4a5b6a'; ctx.fillRect(x + 70, y + 12, 26, 38);
          ctx.fillStyle = '#9fb7c6'; ctx.fillRect(x + 104, y + 6, 22, 52);
        }
      }
    } else if (kind === 'whitegrid') {
      ctx.fillStyle = '#eef0f2';
      ctx.fillRect(0, 0, size, size);
      for (let y = 0; y < size; y += 32) for (let x = 0; x < size; x += 32) {
        ctx.fillStyle = r() < 0.15 ? '#8aa0b4' : '#55687a';
        ctx.fillRect(x + 6, y + 6, 20, 20);
      }
    }
    return finish(c);
  });
}

export function textTexture({
  text,
  sub,
  width = 1024,
  height = 256,
  bg = '#121212',
  ink = '#f2f2f2',
  font = 'bold 120px "Helvetica Neue", Arial, sans-serif',
  subFont = '600 44px "Helvetica Neue", Arial, sans-serif',
  lines = null,
  draw = null,
} = {}) {
  const c = makeCanvas(width, height);
  const ctx = c.getContext('2d');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (draw) {
    draw(ctx, width, height);
  } else if (lines) {
    const step = height / (lines.length + 1);
    lines.forEach((ln, i) => {
      ctx.font = typeof ln === 'object' ? ln.font : i < 3 ? font : subFont;
      ctx.fillText(typeof ln === 'object' ? ln.text : ln, width / 2, step * (i + 1));
    });
  } else {
    ctx.font = font;
    ctx.fillText(text, width / 2, sub ? height * 0.42 : height / 2);
    if (sub) {
      ctx.font = subFont;
      ctx.fillText(sub, width / 2, height * 0.78);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function stripedAwning(text) {
  return textTexture({
    width: 2048,
    height: 256,
    draw(ctx, w, h) {
      for (let x = 0; x < w; x += 56) {
        ctx.fillStyle = (x / 56) % 2 ? '#2463c4' : '#dfe8f6';
        ctx.fillRect(x, 0, 56, h);
      }
      ctx.fillStyle = 'rgba(28,80,170,0.78)';
      ctx.fillRect(0, h * 0.18, w, h * 0.64);
      ctx.fillStyle = '#fff';
      ctx.font = '600 120px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, w / 2, h / 2 + 6);
    },
  });
}

export function hotspotTexture(color = '#3b82f6') {
  const c = makeCanvas(128, 128);
  const ctx = c.getContext('2d');
  ctx.beginPath();
  ctx.arc(64, 64, 56, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.92)';
  ctx.fill();
  ctx.beginPath();
  ctx.arc(64, 64, 40, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(64, 64, 14, 0, Math.PI * 2);
  ctx.fillStyle = '#fff';
  ctx.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Vertical vinyl leasing banner, laid out like the one on the building:
// logo, SPACE / FOR / LEASE, uses, contact box, web + phone, logo.
export function leaseBannerTexture({
  brand = 'FIRST PIONEER',
  brandSub = 'REALTY',
  headline = ['SPACE', 'FOR', 'LEASE'],
  uses = ['Office', 'Medical', 'Retail'],
  contactLines = ['Exclusive', 'Leasing Agents'],
  web = '',
  phone = '',
} = {}) {
  const w = 512;
  const h = 2200;
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, '#24479e');
  g.addColorStop(1, '#1d3c8c');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = '#e9edf5';
  ctx.lineWidth = 10;
  ctx.strokeRect(14, 14, w - 28, h - 28);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const logo = (y) => {
    // Staircase mark: four columns of 1-4 squares rising to the right, each
    // column capped in orange over blue, separated by thin white joints.
    const s = 24;
    const gap = 3;
    const x0 = 54;
    const yb = y + 96;
    for (let c = 0; c < 4; c++) {
      for (let k = 0; k <= c; k++) {
        const x = x0 + c * s;
        const top = yb - (k + 1) * s;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(x - gap, top - gap, s + gap, s + gap);
        ctx.fillStyle = k === c ? '#cf5b2c' : '#1f4f99';
        ctx.fillRect(x, top, s - gap, s - gap);
      }
    }
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'left';
    const words = brand.split(' ');
    ctx.font = '600 56px Georgia, "Times New Roman", serif';
    ctx.fillText(words[0] ?? '', 168, y + 40);
    ctx.fillText(words.slice(1).join(' '), 168, y + 94);
    ctx.font = '500 22px Georgia, serif';
    ctx.fillText(brandSub.split('').join(' '), 172, y + 124);
    ctx.textAlign = 'center';
  };

  logo(50);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 150px Impact, "Arial Narrow", "Helvetica Neue", Arial, sans-serif';
  headline.forEach((t, i) => ctx.fillText(t, w / 2, 400 + i * 172, w - 70));
  ctx.font = '800 92px "Arial Narrow", "Helvetica Neue", Arial, sans-serif';
  uses.forEach((t, i) => ctx.fillText(t, w / 2, 1000 + i * 104, w - 90));

  // Orange-red contact box.
  ctx.fillStyle = '#e1542c';
  ctx.fillRect(70, 1360, w - 140, 240);
  ctx.strokeStyle = '#f6b8a2';
  ctx.lineWidth = 4;
  ctx.strokeRect(84, 1374, w - 168, 212);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'italic 500 50px Georgia, serif';
  contactLines.forEach((t, i) => ctx.fillText(t, w / 2, 1460 + i * 70, w - 190));

  ctx.font = '700 46px "Helvetica Neue", Arial, sans-serif';
  if (web) ctx.fillText(web, w / 2, 1700, w - 80);
  ctx.font = '800 72px "Arial Narrow", "Helvetica Neue", Arial, sans-serif';
  if (phone) ctx.fillText(phone, w / 2, 1800, w - 70);
  logo(1900);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}
