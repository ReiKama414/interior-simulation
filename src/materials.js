import * as THREE from 'three';

function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

function canvasTex(w, h, draw, { repeat = [1, 1], color = true } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  if (color) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
const gray = (v) => `rgb(${v | 0},${v | 0},${v | 0})`;

// ---- procedural textures (near-white so material.color tints them) ----
function plankTexture() {
  const r = rng(7);
  return canvasTex(1024, 1024, (g, w, h) => {
    const rows = 10, ph = h / rows;
    for (let i = 0; i < rows; i++) {
      const y = i * ph; let x = -r() * w * 0.6;
      while (x < w) {
        const len = w * (0.5 + r() * 0.5), base = 205 + r() * 40;
        g.fillStyle = gray(base); g.fillRect(x, y, len, ph);
        for (let k = 0; k < 26; k++) {
          const yy = y + r() * ph; g.strokeStyle = `rgba(60,40,20,${0.03 + r() * 0.06})`; g.lineWidth = 0.6 + r() * 1.6;
          g.beginPath(); g.moveTo(x, yy); g.bezierCurveTo(x + len * .3, yy + (r() - .5) * 6, x + len * .6, yy + (r() - .5) * 6, x + len, yy); g.stroke();
        }
        g.fillStyle = 'rgba(30,20,10,.55)'; g.fillRect(x, y, 2, ph);
        x += len;
      }
      g.fillStyle = 'rgba(30,20,10,.6)'; g.fillRect(0, y, w, 2.5);
    }
  });
}
function grainTexture() {
  const r = rng(21);
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = gray(228); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 140; i++) {
      const x = r() * w; g.strokeStyle = `rgba(70,45,20,${0.04 + r() * 0.09})`; g.lineWidth = 0.6 + r() * 2.2;
      g.beginPath(); g.moveTo(x, 0); g.bezierCurveTo(x + (r() - .5) * 30, h * .33, x + (r() - .5) * 30, h * .66, x + (r() - .5) * 14, h); g.stroke();
    }
  });
}
function plasterTexture() {
  const r = rng(3);
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = gray(240); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 1600; i++) {
      const v = 200 + r() * 55; g.fillStyle = `rgba(${v},${v},${v},${0.08 + r() * 0.12})`;
      g.beginPath(); g.arc(r() * w, r() * h, 2 + r() * 26, 0, 7); g.fill();
    }
  });
}
function linenTexture(size = 256) {
  const r = rng(11);
  return canvasTex(size, size, (g, w, h) => {
    g.fillStyle = gray(232); g.fillRect(0, 0, w, h);
    for (let i = 0; i < h; i += 2) { g.fillStyle = `rgba(0,0,0,${r() * 0.07})`; g.fillRect(0, i, w, 1); }
    for (let i = 0; i < w; i += 2) { g.fillStyle = `rgba(0,0,0,${r() * 0.07})`; g.fillRect(i, 0, 1, h); }
    for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.12})`; g.fillRect(r() * w, r() * h, 1 + r() * 6, 1); }
  }, { repeat: [3, 3] });
}
function tatamiTexture() {
  const r = rng(5);
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = gray(226); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { g.strokeStyle = `rgba(90,80,40,${0.05 + r() * 0.12})`; g.lineWidth = 1; const y = i * 2 + r();
      g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
  }, { repeat: [1, 1] });
}
function stoneTexture() {
  const r = rng(9);
  return canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = gray(236); g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const v = r() < .5 ? 190 : 250; g.fillStyle = `rgba(${v},${v},${v},${0.1 + r() * .2})`;
      g.beginPath(); g.arc(r() * w, r() * h, 1 + r() * 9, 0, 7); g.fill(); }
    for (let i = 0; i < 10; i++) { g.strokeStyle = 'rgba(80,70,60,.06)'; g.lineWidth = 3 + r() * 6; const y = r() * h;
      g.beginPath(); g.moveTo(0, y); g.bezierCurveTo(w * .3, y + 30, w * .6, y - 30, w, y + 10); g.stroke(); }
  });
}

// ---- palette: what the user can choose per material slot ----
export const PALETTE = {
  floor: { label: '地板', items: [
    ['白蠟木', '#e7d6b6'], ['蜂蜜橡木', '#d5a869'], ['胡桃木', '#8a5a36'], ['煙燻橡木', '#54413a'], ['墨染黑檀', '#2f2a27']] },
  wall: { label: '牆面', items: [
    ['和紙白', '#efe9dc'], ['砂壁', '#d9c4a1'], ['抹茶灰', '#b3bda3'], ['赤陶土', '#c98d70'], ['墨藍', '#46525f']] },
  fabric: { label: '織品', items: [
    ['亞麻', '#e8e1d2'], ['燕麥', '#cdbfa5'], ['苔綠', '#84906a'], ['靛染', '#48607a'], ['炭灰', '#4b4a4e']] },
  accent: { label: '點綴', items: [
    ['芥末黃', '#d9a63c'], ['櫻粉', '#d8a3a0'], ['抹茶', '#8d9c5a'], ['藍染', '#2f4a72'], ['朱紅', '#c2402f']] },
  wood: { label: '木作', items: [
    ['檜木', '#e6cb9e'], ['橡木', '#b98d5c'], ['胡桃', '#71492f'], ['黑檀', '#2f2620'], ['白蠟', '#dbd0bb']] },
  stone: { label: '石材', items: [
    ['洞石', '#dccfb8'], ['板岩', '#525860'], ['白水磨石', '#ebe7de'], ['玄武岩', '#2f3234'], ['陶土', '#b97b5a']] },
  rug: { label: '地墊', items: [
    ['藺草', '#d9caa8'], ['淺灰', '#a6a39d'], ['靛藍', '#3f5674'], ['鏽紅', '#a4563d'], ['墨黑', '#38383a']] },
};

export function createMaterials() {
  const std = (o) => new THREE.MeshStandardMaterial(o);
  const M = {
    floor: std({ map: plankTexture(), roughness: 0.55, metalness: 0 }),
    wall: std({ map: plasterTexture(), bumpMap: plasterTexture(), bumpScale: 0.6, roughness: 0.95 }),
    wallAccent: std({ map: plasterTexture(), roughness: 0.95 }),
    wood: std({ map: grainTexture(), roughness: 0.6 }),
    fabric: std({ map: linenTexture(), bumpMap: linenTexture(), bumpScale: 0.5, roughness: 0.95 }),
    accent: std({ map: linenTexture(), roughness: 0.9 }),
    stone: std({ map: stoneTexture(), roughness: 0.5 }),
    rug: std({ map: tatamiTexture(), bumpMap: tatamiTexture(), bumpScale: 0.8, roughness: 1 }),
    dark: std({ color: '#1d1f22', roughness: 0.45, metalness: 0.4 }),
    ceramic: std({ color: '#efe9de', roughness: 0.3 }),
    leaf: std({ color: '#5d7a45', roughness: 0.8, flatShading: true }),
    leaf2: std({ color: '#7d9658', roughness: 0.8, flatShading: true }),
    trunk: std({ color: '#5a4636', roughness: 0.9 }),
    soil: std({ color: '#2c2521', roughness: 1 }),
    paper: std({ color: '#f4e7c9', roughness: 0.9, emissive: new THREE.Color('#ffc978'), emissiveIntensity: 0.05, side: THREE.DoubleSide }),
    shoji: std({ color: '#f1ead9', roughness: 0.95, emissive: new THREE.Color('#f1ead9'), emissiveIntensity: 0.14, side: THREE.DoubleSide }),
    sheer: std({ color: '#f5efe2', roughness: 1, transparent: true, opacity: 0.55, side: THREE.DoubleSide, depthWrite: false }),
    glass: new THREE.MeshStandardMaterial({ color: '#cfe4f2', roughness: 0.05, transparent: true, opacity: 0.22, depthWrite: false,
      emissive: new THREE.Color('#9ccaf2'), emissiveIntensity: 0.5 }),
    screen: new THREE.MeshBasicMaterial({ color: '#bcd8ff' }),
    paint: std({ color: '#f4f0e6', roughness: 0.8 }),
    plinth: std({ color: '#12171d', roughness: 0.55, metalness: 0.2 }),
    ground: std({ color: '#141b23', roughness: 0.75 }),
  };
  return M;
}

// palette slot -> material(s) it drives
export const SLOT_TARGETS = {
  floor: ['floor'], wall: ['wall'], fabric: ['fabric'], accent: ['accent'],
  wood: ['wood'], stone: ['stone'], rug: ['rug'],
};
