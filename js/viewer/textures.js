// Procedural canvas textures — no external image assets needed for the model.
import * as THREE from 'three';

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

function rand(seed) {
  // Tiny deterministic PRNG so the facade looks the same on every load.
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export function brickTexture({ base = '#8a4234', mortar = '#b5a797', variance = 22, seed = 7, size = 512 } = {}) {
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  const r = rand(seed);
  ctx.fillStyle = mortar;
  ctx.fillRect(0, 0, size, size);
  const bw = size / 8;
  const bh = size / 24;
  const gap = Math.max(1, size / 256);
  const [br, bg, bb] = hexToRgb(base);
  for (let row = 0; row < 24; row++) {
    const offset = row % 2 ? bw / 2 : 0;
    for (let col = -1; col < 9; col++) {
      const v = (r() - 0.5) * 2 * variance;
      ctx.fillStyle = `rgb(${clamp(br + v)},${clamp(bg + v * 0.8)},${clamp(bb + v * 0.7)})`;
      ctx.fillRect(col * bw + offset + gap, row * bh + gap, bw - gap * 2, bh - gap * 2);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function stoneTexture({ base = '#cfc6b4', seed = 3, size = 256 } = {}) {
  const c = makeCanvas(size, size);
  const ctx = c.getContext('2d');
  const r = rand(seed);
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 1800; i++) {
    const v = (r() - 0.5) * 30;
    ctx.fillStyle = `rgba(${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${v > 0 ? 255 : 0},${Math.abs(v) / 200})`;
    ctx.fillRect(r() * size, r() * size, 2, 2);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
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
  stripes = false,
  lines = null,
} = {}) {
  const c = makeCanvas(width, height);
  const ctx = c.getContext('2d');
  if (stripes) {
    for (let x = 0; x < width; x += 48) {
      ctx.fillStyle = (x / 48) % 2 ? '#2b6fd0' : '#e8eef8';
      ctx.fillRect(x, 0, 48, height);
    }
    ctx.fillStyle = 'rgba(31,95,191,0.55)';
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.fillStyle = ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (lines) {
    const step = height / (lines.length + 1);
    lines.forEach((ln, i) => {
      ctx.font = i < 3 ? font : subFont;
      ctx.fillText(ln, width / 2, step * (i + 1));
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

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function clamp(v) {
  return Math.max(0, Math.min(255, Math.round(v)));
}
