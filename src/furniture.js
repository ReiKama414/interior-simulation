import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const rbGeo = (w, h, d, r) => new RoundedBoxGeometry(w, h, d, 3, Math.max(0.002, Math.min(r, w / 2 - 1e-3, h / 2 - 1e-3, d / 2 - 1e-3)));

function add(g, geo, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); g.add(m); return m;
}
const box = (g, mat, w, h, d, x, y, z, r = 0.02) => add(g, rbGeo(w, h, d, r), mat, x, y, z);
const cyl = (g, mat, rt, rb, h, x, y, z, seg = 28) => add(g, new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z);
const sph = (g, mat, r, x, y, z, sx = 1, sy = 1, sz = 1) => { const m = add(g, new THREE.SphereGeometry(r, 24, 16), mat, x, y, z); m.scale.set(sx, sy, sz); return m; };

// ---------- the pieces (origin = floor centre, front faces +z) ----------
export function createFurniture(M, lamps) {
  const lamp = (g, x, y, z, intensity, color = '#ffb866', dist = 9) => {
    const l = new THREE.PointLight(color, 0, dist, 2); l.position.set(x, y, z); g.add(l);
    lamps.push({ light: l, base: intensity }); return l;
  };

  const defs = [];
  const def = (key, name, w, d, build, pos, rot = 0, opts = {}) => defs.push({ key, name, w, d, build, pos, rot, ...opts });

  // 低矮沙發
  def('sofa', '低矮沙發', 2.3, 0.95, (g) => {
    box(g, M.wood, 2.1, 0.1, 0.8, 0, 0.13, 0.02, 0.02);
    for (const sx of [-0.9, 0.9]) for (const sz of [-0.3, 0.32]) box(g, M.wood, 0.07, 0.08, 0.07, sx, 0.04, sz, 0.01);
    box(g, M.fabric, 2.3, 0.5, 0.2, 0, 0.44, -0.37, 0.06);
    for (const x of [-0.72, 0, 0.72]) {
      box(g, M.fabric, 0.72, 0.2, 0.68, x, 0.28, 0.1, 0.07);
      const b = box(g, M.fabric, 0.7, 0.36, 0.16, x, 0.5, -0.22, 0.07); b.rotation.x = -0.14;
    }
    for (const sx of [-1.1, 1.1]) box(g, M.fabric, 0.16, 0.34, 0.9, sx, 0.3, 0, 0.06);
    const p1 = box(g, M.accent, 0.42, 0.42, 0.13, -0.68, 0.55, -0.06, 0.05); p1.rotation.set(-0.22, 0.25, 0.1);
    const p2 = box(g, M.accent, 0.36, 0.36, 0.12, 0.78, 0.5, -0.02, 0.05); p2.rotation.set(-0.2, -0.3, -0.1);
  }, [-4.0, 0.7], 1);

  // 圓形茶几 (ちゃぶ台)
  def('table', '圓形茶几', 1.1, 1.1, (g) => {
    cyl(g, M.wood, 0.55, 0.55, 0.05, 0, 0.4, 0);
    cyl(g, M.wood, 0.5, 0.55, 0.04, 0, 0.36, 0);
    for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4;
      const l = cyl(g, M.wood, 0.03, 0.045, 0.36, Math.cos(a) * 0.36, 0.18, Math.sin(a) * 0.36, 12);
      l.rotation.set(Math.sin(a) * 0.1, 0, -Math.cos(a) * 0.1); }
    cyl(g, M.stone, 0.2, 0.2, 0.015, -0.05, 0.435, 0.08);
    // teapot + cups
    sph(g, M.ceramic, 0.09, -0.05, 0.5, 0.08, 1, 0.85, 1);
    cyl(g, M.ceramic, 0.035, 0.05, 0.03, -0.05, 0.585, 0.08, 16);
    for (const [x, z] of [[0.12, 0.05], [0.14, 0.2]]) cyl(g, M.ceramic, 0.038, 0.028, 0.05, x, 0.47, z, 16);
    // vase + branch
    cyl(g, M.dark, 0.04, 0.05, 0.14, 0.27, 0.49, -0.2, 16);
    for (let i = 0; i < 3; i++) { const s = cyl(g, M.trunk, 0.004, 0.006, 0.34, 0.27 + i * .03 - .03, 0.72, -0.2, 6); s.rotation.set(0.15 * i - 0.15, 0, 0.12 * i - 0.1);
      sph(g, M.leaf2, 0.04, 0.27 + i * .06 - .06, 0.88 + i * .02, -0.2, 1, 0.7, 1); }
  }, [-2.35, 0.7], 0, { round: true });

  // 榻榻米地墊 (可拖曳，家具可放在上面)
  def('rug', '藺草地墊', 3.6, 3.0, (g) => {
    box(g, M.rug, 3.6, 0.03, 3.0, 0, 0.015, 0, 0.012);
    box(g, M.dark, 3.6, 0.032, 0.05, 0, 0.016, 1.475, 0.005); box(g, M.dark, 3.6, 0.032, 0.05, 0, 0.016, -1.475, 0.005);
  }, [-3.0, 0.7], 0, { rug: true });

  // 座椅 (座椅 zaisu)
  const zaisu = (g) => {
    box(g, M.accent, 0.5, 0.06, 0.5, 0, 0.21, 0.02, 0.025);
    box(g, M.wood, 0.56, 0.04, 0.56, 0, 0.16, 0.02, 0.015);
    for (const sx of [-0.24, 0.24]) for (const sz of [-0.22, 0.26]) box(g, M.wood, 0.04, 0.16, 0.04, sx, 0.08, sz, 0.01);
    const back = new THREE.Group(); back.position.set(0, 0.18, -0.25); back.rotation.x = -0.28; g.add(back);
    for (const sx of [-0.25, 0.25]) box(back, M.wood, 0.035, 0.5, 0.035, sx, 0.25, 0, 0.01);
    box(back, M.fabric, 0.5, 0.26, 0.05, 0, 0.32, 0.005, 0.02);
    box(back, M.wood, 0.56, 0.04, 0.05, 0, 0.5, 0, 0.015);
  };
  def('chairA', '座椅', 0.62, 0.62, zaisu, [-2.35, -0.5], 0);
  def('chairB', '座椅', 0.62, 0.62, zaisu, [-2.35, 1.9], 2);

  // 紙燈籠落地燈
  def('lantern', '紙燈籠落地燈', 0.5, 0.5, (g) => {
    cyl(g, M.stone, 0.17, 0.2, 0.05, 0, 0.025, 0);
    cyl(g, M.dark, 0.012, 0.012, 1.0, 0, 0.5, 0, 8);
    sph(g, M.paper, 0.27, 0, 1.2, 0, 1, 1.12, 1);
    for (let i = 0; i < 5; i++) { const r = add(g, new THREE.TorusGeometry(0.27 * Math.sqrt(1 - Math.pow((i - 2) / 2.7, 2)), 0.004, 6, 32), M.dark, 0, 1.2 + (i - 2) * 0.1, 0); r.rotation.x = Math.PI / 2; }
    lamp(g, 0, 1.2, 0, 13, '#ffb866', 10);
  }, [-4.55, -3.45], 0, { round: true });

  // 低矮邊櫃
  def('sideboard', '格柵邊櫃', 2.2, 0.48, (g) => {
    box(g, M.wood, 2.2, 0.5, 0.46, 0, 0.42, 0, 0.015);
    box(g, M.stone, 2.24, 0.03, 0.5, 0, 0.685, 0, 0.008);
    for (const sx of [-0.95, 0.95]) for (const sz of [-0.18, 0.18]) box(g, M.dark, 0.035, 0.17, 0.035, sx, 0.085, sz, 0.008);
    for (let i = 0; i < 26; i++) box(g, M.wood, 0.03, 0.44, 0.02, -1.0 + i * 0.08, 0.42, 0.235, 0.004);
    box(g, M.dark, 0.02, 0.44, 0.022, 0, 0.42, 0.236, 0.004);
    cyl(g, M.ceramic, 0.07, 0.09, 0.26, 0.75, 0.83, 0, 20); sph(g, M.ceramic, 0.09, 0.75, 0.92, 0, 1, 0.85, 1);
    box(g, M.accent, 0.3, 0.05, 0.22, -0.7, 0.72, 0, 0.008); box(g, M.fabric, 0.28, 0.04, 0.2, -0.7, 0.765, 0, 0.008); box(g, M.dark, 0.26, 0.05, 0.19, -0.69, 0.81, 0, 0.008);
  }, [-2.4, -3.72], 0);

  // 平台床
  def('bed', '低矮平台床', 2.1, 2.35, (g) => {
    box(g, M.wood, 2.1, 0.14, 2.3, 0, 0.11, 0.02, 0.03);
    box(g, M.dark, 1.9, 0.06, 2.1, 0, 0.03, 0.02, 0.01);
    // slatted headboard
    box(g, M.wood, 2.1, 0.08, 0.1, 0, 0.78, -1.1, 0.02);
    for (let i = 0; i < 17; i++) box(g, M.wood, 0.05, 0.6, 0.04, -0.96 + i * 0.12, 0.48, -1.1, 0.008);
    box(g, M.wood, 2.1, 0.06, 0.1, 0, 0.2, -1.1, 0.015);
    // futon
    box(g, M.fabric, 1.9, 0.2, 2.05, 0, 0.28, 0.06, 0.08);
    box(g, M.accent, 1.9, 0.07, 1.15, 0, 0.42, 0.55, 0.035);
    box(g, M.fabric, 1.84, 0.1, 0.9, 0, 0.44, -0.05, 0.05);
    for (const sx of [-0.45, 0.45]) { const p = box(g, M.fabric, 0.7, 0.14, 0.42, sx, 0.43, -0.82, 0.06); p.rotation.x = -0.12; }
    const q = box(g, M.accent, 0.4, 0.4, 0.1, 0.55, 0.5, -0.85, 0.04); q.rotation.set(-0.5, 0.2, 0.05);
  }, [3.4, -2.75], 0);

  // 床頭邊几 + 紙燈
  const stool = (g) => {
    cyl(g, M.wood, 0.24, 0.24, 0.05, 0, 0.5, 0);
    cyl(g, M.wood, 0.22, 0.22, 0.04, 0, 0.16, 0);
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; cyl(g, M.wood, 0.02, 0.02, 0.5, Math.cos(a) * 0.16, 0.25, Math.sin(a) * 0.16, 8); }
    cyl(g, M.dark, 0.09, 0.09, 0.02, 0, 0.535, 0);
    add(g, new THREE.CylinderGeometry(0.1, 0.1, 0.24, 24, 1, true), M.paper, 0, 0.66, 0);
    lamp(g, 0, 0.66, 0, 4, '#ffb866', 6);
    cyl(g, M.ceramic, 0.03, 0.03, 0.08, 0.15, 0.58, 0.05, 12);
  };
  def('nightL', '床頭邊几', 0.5, 0.5, stool, [1.95, -3.7], 0, { round: true });
  def('nightR', '床頭邊几', 0.5, 0.5, (g) => {
    cyl(g, M.wood, 0.24, 0.24, 0.05, 0, 0.5, 0); cyl(g, M.wood, 0.22, 0.22, 0.04, 0, 0.16, 0);
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; cyl(g, M.wood, 0.02, 0.02, 0.5, Math.cos(a) * 0.16, 0.25, Math.sin(a) * 0.16, 8); }
    box(g, M.dark, 0.2, 0.03, 0.14, 0, 0.545, 0, 0.005); box(g, M.accent, 0.16, 0.03, 0.12, 0.02, 0.575, 0, 0.005);
    cyl(g, M.ceramic, 0.05, 0.06, 0.09, -0.1, 0.59, 0.06, 16);
  }, [4.85, -3.7], 0, { round: true });

  // 障子屏風
  def('shoji', '障子屏風', 2.4, 0.12, (g) => {
    for (let i = 0; i < 3; i++) {
      const p = new THREE.Group(); p.position.x = -0.8 + i * 0.8; p.rotation.y = (i % 2 ? -1 : 1) * 0.16; g.add(p);
      add(p, new THREE.PlaneGeometry(0.74, 1.66), M.shoji, 0, 0.93, 0);
      box(p, M.wood, 0.04, 1.76, 0.05, -0.38, 0.93, 0, 0.008); box(p, M.wood, 0.04, 1.76, 0.05, 0.38, 0.93, 0, 0.008);
      box(p, M.wood, 0.8, 0.05, 0.05, 0, 0.09, 0, 0.008); box(p, M.wood, 0.8, 0.05, 0.05, 0, 1.79, 0, 0.008);
      for (let k = 1; k < 4; k++) box(p, M.wood, 0.015, 1.66, 0.03, -0.37 + k * 0.185, 0.93, 0.005, 0.003);
      for (let k = 1; k < 7; k++) box(p, M.wood, 0.74, 0.015, 0.03, 0, 0.09 + k * 0.24, 0.005, 0.003);
      box(p, M.wood, 0.12, 0.05, 0.14, -0.3, 0.025, 0, 0.01); box(p, M.wood, 0.12, 0.05, 0.14, 0.3, 0.025, 0, 0.01);
    }
  }, [1.0, 2.7], 1);

  // 開放式書架
  def('shelf', '開放書架', 1.6, 0.4, (g) => {
    for (const sx of [-0.8, 0, 0.8]) box(g, M.wood, 0.04, 1.4, 0.38, sx, 0.7, 0, 0.008);
    for (const y of [0.03, 0.4, 0.78, 1.16, 1.39]) box(g, M.wood, 1.64, 0.04, 0.4, 0, y, 0, 0.008);
    const cols = ['#7b6a55', '#b8a382', '#3d4a58', '#a0533a', '#d7ccb6', '#56634a'];
    for (let i = 0; i < 9; i++) box(g, new THREE.MeshStandardMaterial({ color: cols[i % 6], roughness: .8 }), 0.04 + (i % 3) * 0.01, 0.26 + (i % 4) * 0.03, 0.24, -0.72 + i * 0.055, 0.56 + (i % 4) * 0.015, 0, 0.004);
    box(g, M.fabric, 0.36, 0.28, 0.3, 0.4, 0.19, 0, 0.05); box(g, M.accent, 0.36, 0.28, 0.3, -0.4, 0.19, 0, 0.05);
    cyl(g, M.ceramic, 0.07, 0.08, 0.2, 0.4, 0.9, 0, 20); cyl(g, M.dark, 0.06, 0.05, 0.16, -0.4, 0.88, 0, 20);
    sph(g, M.leaf, 0.09, 0.4, 1.06, 0, 1, 0.8, 1);
    box(g, M.stone, 0.26, 0.05, 0.2, 0.4, 1.235, 0, 0.01); cyl(g, M.ceramic, 0.04, 0.05, 0.12, 0.4, 1.3, 0, 12);
  }, [-4.75, 2.9], 1);

  // 書桌 + 筆電 + 檯燈
  def('desk', '低矮書桌', 1.5, 0.7, (g) => {
    box(g, M.wood, 1.5, 0.05, 0.7, 0, 0.7, 0, 0.015);
    for (const sx of [-0.68, 0.68]) for (const sz of [-0.28, 0.28]) box(g, M.wood, 0.05, 0.68, 0.05, sx, 0.34, sz, 0.008);
    box(g, M.wood, 1.36, 0.04, 0.04, 0, 0.42, -0.28, 0.008);
    box(g, M.dark, 0.34, 0.015, 0.24, 0.05, 0.735, 0.02, 0.004);
    const lid = box(g, M.dark, 0.34, 0.22, 0.012, 0.05, 0.85, -0.1, 0.004); lid.rotation.x = -0.15;
    const scr = add(g, new THREE.PlaneGeometry(0.31, 0.19), M.screen, 0.05, 0.85, -0.093); scr.rotation.x = -0.15;
    // lamp
    cyl(g, M.dark, 0.06, 0.07, 0.02, -0.55, 0.735, -0.15, 20);
    const arm = cyl(g, M.dark, 0.007, 0.007, 0.36, -0.55, 0.9, -0.15, 8); arm.rotation.z = 0.05;
    const shade = add(g, new THREE.ConeGeometry(0.09, 0.1, 24, 1, true), M.paper, -0.5, 1.1, -0.15); shade.rotation.z = 0.25;
    lamp(g, -0.5, 1.05, -0.12, 4, '#ffcf8f', 5);
    cyl(g, M.ceramic, 0.04, 0.035, 0.09, 0.55, 0.775, 0.05, 16);
    box(g, M.fabric, 0.22, 0.03, 0.3, -0.25, 0.735, 0.15, 0.005);
  }, [2.4, 2.7], 0);

  def('stool', '木圓凳', 0.45, 0.45, (g) => {
    cyl(g, M.accent, 0.2, 0.2, 0.06, 0, 0.44, 0); cyl(g, M.wood, 0.21, 0.21, 0.04, 0, 0.39, 0);
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3 + 0.5; const l = cyl(g, M.wood, 0.018, 0.024, 0.4, Math.cos(a) * 0.14, 0.2, Math.sin(a) * 0.14, 8); l.rotation.set(Math.sin(a) * 0.08, 0, -Math.cos(a) * 0.08); }
  }, [2.4, 3.45], 0, { round: true });

  // 植物：橄欖樹
  def('olive', '橄欖樹', 0.7, 0.7, (g) => {
    cyl(g, M.ceramic, 0.27, 0.2, 0.4, 0, 0.2, 0, 32); cyl(g, M.soil, 0.25, 0.25, 0.02, 0, 0.395, 0);
    const t = cyl(g, M.trunk, 0.03, 0.05, 1.3, 0, 1.0, 0, 8); t.rotation.z = 0.05;
    let s = 3;
    const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < 14; i++) {
      const m = add(g, new THREE.IcosahedronGeometry(0.15 + r() * 0.1, 1), i % 2 ? M.leaf : M.leaf2, (r() - .5) * 0.6, 1.4 + r() * 0.65, (r() - .5) * 0.6);
      m.scale.set(1, 0.75, 1);
      if (i < 5) { const br = cyl(g, M.trunk, 0.008, 0.014, 0.4, m.position.x * .5, m.position.y - 0.25, m.position.z * .5, 5); br.rotation.set(m.position.z * 1.2, 0, -m.position.x * 1.2); }
    }
  }, [4.5, 1.2], 0, { round: true });

  // 植物：竹
  def('bamboo', '觀賞竹', 0.55, 0.55, (g) => {
    cyl(g, M.dark, 0.2, 0.17, 0.34, 0, 0.17, 0, 24); cyl(g, M.soil, 0.18, 0.18, 0.02, 0, 0.33, 0);
    for (let i = 0; i < 5; i++) {
      const x = (i - 2) * 0.06, z = ((i * 37) % 5 - 2) * 0.05, h = 1.7 + (i % 3) * 0.35;
      cyl(g, M.leaf2, 0.014, 0.017, h, x, 0.33 + h / 2, z, 8);
      for (let k = 1; k < 6; k++) cyl(g, M.leaf, 0.019, 0.019, 0.012, x, 0.33 + k * h / 6, z, 8);
      for (let k = 0; k < 4; k++) { const l = sph(g, M.leaf, 0.09, x + (k % 2 ? .1 : -.1), 0.33 + h - k * 0.14, z + (k < 2 ? .06 : -.06), 1, 0.16, 0.35); l.rotation.z = k % 2 ? -0.5 : 0.5; }
    }
  }, [-0.6, -3.55], 0, { round: true });


  // 床尾長凳
  def('bench', '床尾長凳', 1.6, 0.42, (g) => {
    box(g, M.wood, 1.6, 0.05, 0.42, 0, 0.42, 0, 0.015);
    box(g, M.accent, 1.5, 0.05, 0.36, 0, 0.47, 0, 0.02);
    for (const sx of [-0.7, 0.7]) box(g, M.wood, 0.05, 0.4, 0.36, sx, 0.2, 0, 0.01);
    box(g, M.wood, 1.4, 0.04, 0.04, 0, 0.16, 0, 0.008);
  }, [3.4, -1.3], 0);

  // 和風收納櫃 (箪笥)
  def('tansu', '和風收納櫃', 0.5, 1.0, (g) => {
    box(g, M.wood, 0.5, 0.78, 1.0, 0, 0.47, 0, 0.015);
    for (const sz of [-0.42, 0.42]) box(g, M.dark, 0.5, 0.08, 0.06, 0, 0.04, sz, 0.008);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 2; c++) {
      const y = 0.25 + r * 0.24, z = -0.24 + c * 0.48;
      box(g, M.wood, 0.02, 0.2, 0.44, 0.255, y + 0.1, z, 0.006);
      box(g, M.dark, 0.02, 0.02, 0.09, 0.27, y + 0.13, z, 0.004);
    }
    box(g, M.stone, 0.52, 0.03, 1.02, 0, 0.875, 0, 0.008);
    cyl(g, M.ceramic, 0.06, 0.08, 0.2, -0.02, 1.0, -0.2, 20); sph(g, M.ceramic, 0.075, -0.02, 1.1, -0.2, 1, 0.85, 1);
    box(g, M.fabric, 0.2, 0.06, 0.28, -0.02, 0.92, 0.22, 0.01); box(g, M.dark, 0.18, 0.05, 0.24, -0.02, 0.975, 0.22, 0.01);
  }, [-4.75, -1.85], 0);

  // 石面邊几
  def('sidetable', '石面邊几', 0.55, 0.55, (g) => {
    cyl(g, M.stone, 0.26, 0.26, 0.04, 0, 0.5, 0);
    cyl(g, M.wood, 0.05, 0.07, 0.46, 0, 0.25, 0, 20);
    cyl(g, M.wood, 0.19, 0.19, 0.03, 0, 0.015, 0);
    cyl(g, M.ceramic, 0.05, 0.06, 0.1, 0.06, 0.57, 0.04, 16);
    for (let i = 0; i < 2; i++) { const st = cyl(g, M.trunk, 0.004, 0.005, 0.24, 0.06 + i * 0.02, 0.74, 0.04, 6); st.rotation.z = 0.2 * (i ? 1 : -1); sph(g, M.leaf2, 0.03, 0.06 + (i ? 0.06 : -0.05), 0.85, 0.04, 1, 0.7, 1); }
  }, [-3.8, 2.75], 0, { round: true });

  // 圓形坐墩
  def('ottoman', '編織坐墩', 0.62, 0.62, (g) => {
    cyl(g, M.fabric, 0.29, 0.3, 0.3, 0, 0.17, 0, 32);
    cyl(g, M.accent, 0.27, 0.27, 0.05, 0, 0.35, 0, 32);
    for (let i = 0; i < 4; i++) cyl(g, M.wood, 0.3, 0.3, 0.012, 0, 0.06 + i * 0.07, 0, 32);
  }, [-1.2, 2.7], 0, { round: true });

  // 編織籃
  def('basket', '編織收納籃', 0.5, 0.5, (g) => {
    cyl(g, M.rug, 0.24, 0.2, 0.36, 0, 0.19, 0, 28);
    for (let i = 0; i < 5; i++) cyl(g, M.wood, 0.235 - i * 0.008, 0.235 - i * 0.008, 0.008, 0, 0.06 + i * 0.07, 0, 28);
    cyl(g, M.wood, 0.25, 0.25, 0.02, 0, 0.37, 0, 28);
    box(g, M.fabric, 0.34, 0.1, 0.28, 0, 0.42, 0, 0.05);
    box(g, M.accent, 0.3, 0.05, 0.24, 0.02, 0.49, 0, 0.03).rotation.y = 0.4;
  }, [4.6, 0.7], 0, { round: true });

  // 蕨類盆栽
  def('fern', '羽葉蕨', 0.6, 0.6, (g) => {
    cyl(g, M.stone, 0.22, 0.17, 0.3, 0, 0.15, 0, 28); cyl(g, M.soil, 0.2, 0.2, 0.02, 0, 0.3, 0);
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2, tilt = 0.7 + (i % 3) * 0.18, len = 0.5 + (i % 4) * 0.08;
      const arm = new THREE.Group(); arm.position.set(0, 0.32, 0); arm.rotation.set(0, a, 0); g.add(arm);
      const st = cyl(arm, M.leaf, 0.006, 0.01, len, len / 2 * Math.sin(tilt), len / 2 * Math.cos(tilt) * 0.7 + 0.05, 0, 5);
      st.rotation.z = -tilt;
      for (let k = 1; k < 6; k++) { const t = k / 6, l = sph(arm, i % 2 ? M.leaf : M.leaf2, 0.05, len * t * Math.sin(tilt) * 0.95, len * t * Math.cos(tilt) * 0.7 + 0.06 - t * t * 0.1, 0, 1, 0.22, 0.6); l.rotation.z = -tilt; }
    }
  }, [4.55, 3.4], 0, { round: true });

  // 第二塊地墊
  def('rug2', '床邊地毯', 2.4, 1.1, (g) => {
    box(g, M.rug, 2.4, 0.025, 1.1, 0, 0.0125, 0, 0.01);
    box(g, M.accent, 2.4, 0.027, 0.06, 0, 0.0135, 0.5, 0.004); box(g, M.accent, 2.4, 0.027, 0.06, 0, 0.0135, -0.5, 0.004);
  }, [3.4, -0.55], 0, { rug: true });

  // 行燈 (あんどん)
  def('andon', '木框行燈', 0.4, 0.4, (g) => {
    box(g, M.wood, 0.36, 0.05, 0.36, 0, 0.025, 0, 0.01);
    for (const [x, z] of [[-0.16, -0.16], [0.16, -0.16], [-0.16, 0.16], [0.16, 0.16]]) box(g, M.wood, 0.03, 0.62, 0.03, x, 0.36, z, 0.006);
    box(g, M.wood, 0.36, 0.04, 0.36, 0, 0.68, 0, 0.01);
    box(g, M.paper, 0.3, 0.58, 0.3, 0, 0.36, 0, 0.005);
    lamp(g, 0, 0.36, 0, 6, '#ffb866', 7);
  }, [0.7, -3.55], 0);

  // 前排閱讀角：球形落地燈 + 座墊 + 矮桌
  def('globe', '和紙球燈', 0.5, 0.5, (g) => {
    cyl(g, M.wood, 0.14, 0.17, 0.04, 0, 0.02, 0);
    for (let i = 0; i < 3; i++) { const a = i * Math.PI * 2 / 3; const l = cyl(g, M.wood, 0.014, 0.016, 0.56, Math.cos(a) * 0.08, 0.3, Math.sin(a) * 0.08, 8); l.rotation.set(Math.sin(a) * 0.16, 0, -Math.cos(a) * 0.16); }
    sph(g, M.paper, 0.23, 0, 0.78, 0); const ring = add(g, new THREE.TorusGeometry(0.235, 0.006, 6, 40), M.dark, 0, 0.78, 0); ring.rotation.x = Math.PI / 2;
    lamp(g, 0, 0.78, 0, 9, '#ffb866', 8);
  }, [-3.85, 3.6], 0, { round: true });
  const zabuton = (g) => {
    box(g, M.accent, 0.56, 0.07, 0.56, 0, 0.045, 0, 0.03); box(g, M.fabric, 0.5, 0.05, 0.5, 0, 0.08, 0, 0.025);
    for (const [x, z] of [[-0.27, -0.27], [0.27, -0.27], [-0.27, 0.27], [0.27, 0.27]]) sph(g, M.dark, 0.014, x, 0.05, z);
  };
  def('zabutonA', '座墊', 0.6, 0.6, zabuton, [-2.9, 3.6], 0);
  def('zabutonB', '座墊', 0.6, 0.6, zabuton, [-1.1, 3.6], 0);
  def('tray', '矮桌', 0.8, 0.5, (g) => {
    box(g, M.wood, 0.8, 0.04, 0.5, 0, 0.3, 0, 0.012); box(g, M.stone, 0.34, 0.012, 0.26, -0.15, 0.326, 0, 0.004);
    for (const sx of [-0.34, 0.34]) box(g, M.wood, 0.04, 0.28, 0.44, sx, 0.14, 0, 0.008);
    cyl(g, M.ceramic, 0.04, 0.03, 0.05, -0.1, 0.355, 0.04, 16); cyl(g, M.ceramic, 0.04, 0.03, 0.05, -0.22, 0.355, -0.04, 16);
    box(g, M.dark, 0.16, 0.02, 0.22, 0.24, 0.33, 0, 0.005);
  }, [-2.0, 3.65], 0);

  return defs;
}
