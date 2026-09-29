import * as THREE from 'three';

// Procedural Japanese-style artworks (ukiyo-e / sumi-e inspired), drawn on canvas.
const W = 512, H = 640;
function rng(seed) { let a = seed; return () => { a = (a * 16807) % 2147483647; return a / 2147483647; }; }
function make(draw) {
  const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); draw(g); return c;
}
function paper(g, color = '#efe4cc', seed = 4) {
  const r = rng(seed); g.fillStyle = color; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 700; i++) { g.fillStyle = `rgba(120,90,50,${r() * 0.05})`; g.fillRect(r() * W, r() * H, 1 + r() * 30, 1); }
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.15})`; g.beginPath(); g.arc(r() * W, r() * H, r() * 40, 0, 7); g.fill(); }
}
const seal = (g, x, y, s = 34, ch = '猫') => {
  g.fillStyle = '#b8402f'; g.beginPath(); g.roundRect(x, y, s, s, 4); g.fill();
  g.fillStyle = '#f3e6cf'; g.font = `700 ${s * 0.7}px "Shippori Mincho", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ch, x + s / 2, y + s / 2 + 2);
};
const vtext = (g, str, x, y, size = 26, color = '#2a2622') => {
  g.fillStyle = color; g.font = `600 ${size}px "Shippori Mincho", serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  [...str].forEach((c, i) => g.fillText(c, x, y + i * size * 1.15));
};
function catEyes(g, cx, cy, gap, r, color = '#e8c25a') {
  for (const s of [-1, 1]) {
    g.fillStyle = color; g.beginPath(); g.ellipse(cx + s * gap, cy, r, r * 0.8, 0, 0, 7); g.fill();
    g.fillStyle = '#111'; g.beginPath(); g.ellipse(cx + s * gap, cy, r * 0.25, r * 0.75, 0, 0, 7); g.fill();
  }
}
function whiskers(g, cx, cy, gap, len) {
  g.strokeStyle = 'rgba(240,235,220,.85)'; g.lineWidth = 1.6;
  for (const s of [-1, 1]) for (let i = -1; i <= 1; i++) { g.beginPath(); g.moveTo(cx + s * gap, cy + i * 6); g.lineTo(cx + s * (gap + len), cy + i * 14 - 4); g.stroke(); }
}

// 1. 坐著的黑貓與紅日
export function catSun() {
  return make((g) => {
    paper(g, '#efe2c6', 7);
    g.fillStyle = '#c2402f'; g.beginPath(); g.arc(256, 270, 150, 0, 7); g.fill();
    g.fillStyle = 'rgba(239,226,198,.22)'; for (let i = 0; i < 5; i++) { g.beginPath(); g.arc(256, 270, 150 - i * 6, 0, 7); g.lineWidth = 3; g.strokeStyle = 'rgba(239,226,198,.12)'; g.stroke(); }
    // ground brush strokes
    g.strokeStyle = '#2a2622'; g.lineCap = 'round';
    for (let i = 0; i < 4; i++) { g.globalAlpha = 0.5 - i * 0.1; g.lineWidth = 12 - i * 2; g.beginPath(); g.moveTo(90 + i * 20, 566 + i * 8); g.quadraticCurveTo(256, 556 + i * 8, 420 - i * 20, 568 + i * 6); g.stroke(); }
    g.globalAlpha = 1;
    g.fillStyle = '#1b1918';
    g.beginPath(); g.moveTo(170, 566); g.bezierCurveTo(140, 470, 190, 400, 256, 396); g.bezierCurveTo(322, 400, 372, 470, 342, 566); g.closePath(); g.fill();
    g.beginPath(); g.ellipse(256, 350, 64, 55, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(204, 322); g.lineTo(208, 262); g.lineTo(248, 302); g.fill();
    g.beginPath(); g.moveTo(308, 322); g.lineTo(304, 262); g.lineTo(264, 302); g.fill();
    g.strokeStyle = '#1b1918'; g.lineWidth = 22; g.beginPath(); g.moveTo(340, 560); g.bezierCurveTo(430, 560, 440, 470, 400, 440); g.stroke();
    catEyes(g, 256, 348, 24, 11); whiskers(g, 256, 372, 34, 42);
    g.fillStyle = '#d88a86'; g.beginPath(); g.moveTo(249, 366); g.lineTo(263, 366); g.lineTo(256, 375); g.fill();
    g.fillStyle = '#b8402f'; g.beginPath(); g.ellipse(256, 402, 46, 8, 0, 0, 7); g.fill();       // ribbon
    g.fillStyle = '#e8c25a'; g.beginPath(); g.arc(256, 416, 8, 0, 7); g.fill();               // bell
    vtext(g, '福猫', 462, 96, 30); seal(g, 445, 560, 34);
  });
}

// 2. 月下睡貓
export function catSleep() {
  return make((g) => {
    paper(g, '#1f2c4a', 11);
    const r = rng(9); for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,240,200,${0.2 + r() * 0.6})`; g.beginPath(); g.arc(r() * W, r() * 300, 1 + r() * 2, 0, 7); g.fill(); }
    g.fillStyle = '#f2e6b8'; g.beginPath(); g.arc(340, 200, 92, 0, 7); g.fill();
    g.fillStyle = '#1f2c4a'; g.beginPath(); g.arc(378, 178, 80, 0, 7); g.fill();
    // roof line
    g.fillStyle = '#121b30'; g.beginPath(); g.moveTo(0, 470); g.lineTo(512, 400); g.lineTo(512, 640); g.lineTo(0, 640); g.fill();
    // curled cat
    g.fillStyle = '#e8e0d2'; g.beginPath(); g.ellipse(250, 452, 140, 66, -0.05, 0, 7); g.fill();
    g.fillStyle = '#d88a4a'; g.beginPath(); g.ellipse(210, 430, 46, 30, 0.2, 0, 7); g.fill(); g.beginPath(); g.ellipse(310, 440, 36, 26, -0.3, 0, 7); g.fill();
    g.fillStyle = '#e8e0d2'; g.beginPath(); g.ellipse(368, 462, 50, 44, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(336, 432); g.lineTo(338, 396); g.lineTo(364, 420); g.fill(); g.beginPath(); g.moveTo(398, 432); g.lineTo(404, 398); g.lineTo(376, 420); g.fill();
    g.strokeStyle = '#e8e0d2'; g.lineWidth = 20; g.lineCap = 'round'; g.beginPath(); g.moveTo(120, 470); g.bezierCurveTo(90, 520, 200, 528, 330, 512); g.stroke();
    g.strokeStyle = '#2a2622'; g.lineWidth = 3; for (const x of [350, 388]) { g.beginPath(); g.arc(x, 462, 9, 0.15, Math.PI - 0.15); g.stroke(); }
    g.fillStyle = '#d88a86'; g.beginPath(); g.arc(369, 476, 4, 0, 7); g.fill();
    g.fillStyle = 'rgba(240,235,220,.7)'; g.font = '700 26px "Shippori Mincho", serif'; g.textAlign = 'center'; for (let i = 0; i < 3; i++) { g.globalAlpha = 0.8 - i * 0.22; g.fillText('z', 420 + i * 22, 410 - i * 30); } g.globalAlpha = 1;
    vtext(g, '月夜', 60, 90, 30, '#f2e6b8'); seal(g, 44, 560, 34, '眠');
  });
}

// 3. 青海波
export function seigaiha() {
  return make((g) => {
    paper(g, '#e9ddc2', 13);
    const R = 60;
    for (let row = 0; row < 12; row++) for (let col = -1; col < 8; col++) {
      const x = col * R * 2 + (row % 2 ? R : 0), y = 70 + row * R * 0.5;
      for (let k = 4; k >= 0; k--) { g.beginPath(); g.arc(x, y, R * (k + 1) / 5, 0, 7); g.fillStyle = k % 2 ? '#e9ddc2' : '#2f4a72'; g.fill(); g.strokeStyle = '#e9ddc2'; g.lineWidth = 1.5; g.stroke(); }
    }
    g.fillStyle = '#e9ddc2'; g.fillRect(0, 0, W, 70);
    g.fillStyle = '#c2402f'; g.beginPath(); g.arc(256, 70, 44, 0, 7); g.fill();
    g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(0, 610, W, 30); seal(g, 452, 30, 32, '波');
  });
}

// 4. 富士
export function fuji() {
  return make((g) => {
    paper(g, '#efe4cc', 15);
    g.fillStyle = '#c2402f'; g.beginPath(); g.arc(360, 210, 78, 0, 7); g.fill();
    g.fillStyle = '#5a7590'; g.beginPath(); g.moveTo(-20, 470); g.lineTo(210, 200); g.lineTo(240, 210); g.lineTo(540, 470); g.closePath(); g.fill();
    g.fillStyle = '#f3ede0'; g.beginPath(); g.moveTo(210, 200); g.lineTo(240, 210); g.lineTo(275, 262); g.lineTo(248, 250); g.lineTo(226, 278); g.lineTo(205, 250); g.lineTo(176, 268); g.lineTo(150, 252); g.closePath(); g.fill();
    g.fillStyle = 'rgba(255,255,255,.75)';
    for (const [x, y, s] of [[110, 400, 1], [400, 380, 1.2], [250, 430, .8]]) { for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(x + i * 26 * s, y - (i % 2) * 10, 40 * s, 14 * s, 0, 0, 7); g.fill(); } }
    g.fillStyle = '#2f4a72'; g.fillRect(0, 470, W, 170);
    g.strokeStyle = '#efe4cc'; g.lineWidth = 3; for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(20 + (i % 2) * 30, 500 + i * 14); g.quadraticCurveTo(120, 490 + i * 14, 210, 500 + i * 14); g.stroke(); g.beginPath(); g.moveTo(300, 500 + i * 14); g.quadraticCurveTo(400, 490 + i * 14, 500 - (i % 2) * 20, 500 + i * 14); g.stroke(); }
    vtext(g, '不二', 56, 70, 30); seal(g, 450, 580, 32, '富');
  });
}

// 5. 招き猫の顔
export function catFace() {
  return make((g) => {
    paper(g, '#e3efe4', 17);
    g.fillStyle = '#8d9c5a'; for (let i = 0; i < 5; i++) { g.save(); g.translate(60 + i * 100, 620); g.rotate(-0.15 + i * 0.06); g.beginPath(); g.ellipse(0, -160, 12, 170, 0, 0, 7); g.fill(); g.restore(); }
    g.globalAlpha = 0.3; g.fillRect(0, 500, W, 140); g.globalAlpha = 1;
    g.fillStyle = '#f6f0e4'; g.beginPath(); g.ellipse(256, 340, 170, 150, 0, 0, 7); g.fill();
    g.beginPath(); g.moveTo(112, 260); g.lineTo(120, 130); g.lineTo(220, 200); g.fill(); g.beginPath(); g.moveTo(400, 260); g.lineTo(392, 130); g.lineTo(292, 200); g.fill();
    g.fillStyle = '#e39a52'; g.beginPath(); g.ellipse(190, 260, 62, 54, -0.3, 0, 7); g.fill(); g.fillStyle = '#2a2622'; g.beginPath(); g.ellipse(340, 270, 52, 46, 0.3, 0, 7); g.fill();
    g.fillStyle = '#e39a52'; g.beginPath(); g.moveTo(118, 236); g.lineTo(124, 150); g.lineTo(190, 200); g.fill();
    g.fillStyle = '#2a2622'; g.beginPath(); g.moveTo(394, 236); g.lineTo(388, 150); g.lineTo(322, 200); g.fill();
    g.strokeStyle = '#1b1918'; g.lineWidth = 6; g.lineCap = 'round';
    for (const s of [-1, 1]) { g.beginPath(); g.arc(256 + s * 62, 330, 22, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
    g.fillStyle = '#d8746e'; g.beginPath(); g.moveTo(240, 366); g.lineTo(272, 366); g.lineTo(256, 384); g.fill();
    g.beginPath(); g.moveTo(256, 384); g.lineTo(256, 400); g.moveTo(256, 400); g.quadraticCurveTo(236, 422, 214, 404); g.moveTo(256, 400); g.quadraticCurveTo(276, 422, 298, 404); g.stroke();
    whiskers(g, 256, 380, 92, 70); g.strokeStyle = '#1b1918'; g.globalAlpha = 0.5; whiskers(g, 256, 380, 92, 70); g.globalAlpha = 1;
    g.fillStyle = '#b8402f'; g.fillRect(140, 472, 232, 20); g.fillStyle = '#e8c25a'; g.beginPath(); g.arc(256, 506, 20, 0, 7); g.fill(); g.fillStyle = '#b8402f'; g.fillRect(232, 504, 48, 3);
    vtext(g, '招福', 460, 90, 30); seal(g, 440, 570, 34, '福');
  });
}

// 6. 円相 (enso)
export function enso() {
  return make((g) => {
    paper(g, '#efe7d6', 3);
    g.strokeStyle = '#1e1c1a'; g.lineCap = 'round';
    for (let i = 0; i < 6; i++) { g.lineWidth = 34 - i * 4; g.globalAlpha = i ? 0.28 : 0.9; g.beginPath(); g.arc(256, 300, 140 + i * 0.6, 0.6 + i * 0.03, 0.6 + Math.PI * 1.86 - i * 0.04); g.stroke(); }
    g.globalAlpha = 1; seal(g, 390, 520, 34, '禅');
  });
}

// 7. 竹
export function bamboo() {
  return make((g) => {
    paper(g, '#eee6d2', 19);
    g.strokeStyle = '#3a4a30'; g.lineCap = 'round';
    for (const [x, w, a] of [[170, 22, 0.94], [270, 18, 0.7], [352, 14, 0.5]]) {
      g.globalAlpha = a; g.lineWidth = w; g.beginPath(); g.moveTo(x, 640); g.lineTo(x + 6, -10); g.stroke();
      g.lineWidth = 3; g.strokeStyle = '#eee6d2'; for (let y = 60; y < 640; y += 110) { g.beginPath(); g.moveTo(x - w / 2, y); g.lineTo(x + w / 2 + 6, y - 3); g.stroke(); } g.strokeStyle = '#3a4a30';
    }
    g.globalAlpha = 0.85; g.fillStyle = '#3a4a30';
    for (const [x, y, rot] of [[210, 140, -0.5], [120, 260, 0.6], [300, 300, -0.4], [380, 180, 0.5], [240, 420, 0.5], [110, 470, -0.4]]) {
      for (let k = 0; k < 3; k++) { g.save(); g.translate(x, y); g.rotate(rot + k * 0.5 - 0.5); g.beginPath(); g.ellipse(40, 0, 46, 7, 0, 0, 7); g.fill(); g.restore(); }
    }
    g.globalAlpha = 1; seal(g, 420, 560, 32, '竹');
  });
}

export function artMesh(canvas, w, h, frameMat, opts = {}) {
  const tex = new THREE.CanvasTexture(canvas); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  const g = new THREE.Group();
  const bd = opts.border ?? 0.05;
  const mat = new THREE.Mesh(new THREE.BoxGeometry(w + bd * 2, h + bd * 2, 0.02), new THREE.MeshStandardMaterial({ color: '#f1ebdc', roughness: 0.9 }));
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 }));
  pic.position.z = 0.0115;
  const t = 0.035, fw = w + bd * 2 + t * 2, fh = h + bd * 2 + t * 2;
  const parts = [[fw, t, 0, (fh - t) / 2], [fw, t, 0, -(fh - t) / 2], [t, fh, (fw - t) / 2, 0], [t, fh, -(fw - t) / 2, 0]];
  parts.forEach(([pw, ph, x, y]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(pw, ph, 0.045), frameMat); m.position.set(x, y, 0.01); m.castShadow = m.receiveShadow = true; g.add(m); });
  mat.receiveShadow = pic.receiveShadow = true; g.add(mat, pic);
  return g;
}
