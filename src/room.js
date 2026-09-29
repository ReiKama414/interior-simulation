import * as THREE from 'three';
import { artMesh, enso, bamboo, catSleep, seigaiha, catSun, catFace, fuji } from './art.js';

// scale a BoxGeometry's UVs so textures keep a constant world size (metres per tile)
function worldUV(geo, w, h, d, tile) {
  const uv = geo.attributes.uv; const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) {
    const k = f * 4 + i; uv.setXY(k, uv.getX(k) * dims[f][0] / tile, uv.getY(k) * dims[f][1] / tile);
  }
  return geo;
}
function slab(group, mat, x0, x1, y0, y1, z0, z1, tile = 3) {
  const w = x1 - x0, h = y1 - y0, d = z1 - z0;
  const m = new THREE.Mesh(worldUV(new THREE.BoxGeometry(w, h, d), w, h, d, tile), mat);
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = m.receiveShadow = true; group.add(m); return m;
}

export function buildRoom(M) {
  const group = new THREE.Group();
  const T = 0.25, H = 3.3;                       // wall thickness / height
  const X0 = -5, X1 = 5, Z0 = -4, Z1 = 4;        // interior

  // ground + plinth
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), M.ground);
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.95; ground.receiveShadow = true; group.add(ground);
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(11.4, 0.7, 9.4), M.plinth);
  plinth.position.y = -0.65; plinth.castShadow = plinth.receiveShadow = true; group.add(plinth);
  const trim = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(11.44, 0.72, 9.44)), new THREE.LineBasicMaterial({ color: '#e3b26b' }));
  trim.position.y = -0.65; group.add(trim);
  const rim = new THREE.Mesh(new THREE.BoxGeometry(11.6, 0.03, 9.6), new THREE.MeshBasicMaterial({ color: '#e3b26b' }));
  rim.position.y = -0.995; group.add(rim);

  // label on the plinth front (+z)
  const lc = document.createElement('canvas'); lc.width = 1024; lc.height = 128; const g = lc.getContext('2d');
  g.fillStyle = '#e3b26b'; g.font = '600 54px "Shippori Mincho", serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('ま  MA  ·  JAPANDI STUDIO', 512, 68);
  const lt = new THREE.CanvasTexture(lc); lt.colorSpace = THREE.SRGBColorSpace; lt.anisotropy = 8;
  const label = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 0.5), new THREE.MeshBasicMaterial({ map: lt, transparent: true, toneMapped: false }));
  label.position.set(0, -0.68, 4.71); group.add(label);
  const label2 = label.clone(); label2.rotation.y = Math.PI / 2; label2.position.set(5.71, -0.68, 0); group.add(label2);

  // floor slab (top surface at y = 0)
  slab(group, M.floor, X0 - T, X1 + T, -0.3, 0, Z0 - T, Z1 + T, 2);

  // back wall (z = Z0), with big window
  const bw = { x0: -1.0, x1: 2.2, y0: 0.35, y1: 2.85 };
  const back = (x0, x1, y0, y1) => slab(group, M.wall, x0, x1, y0, y1, Z0 - T, Z0, 3);
  back(X0 - T, bw.x0, 0, H); back(bw.x1, X1, 0, H); back(bw.x0, bw.x1, 0, bw.y0); back(bw.x0, bw.x1, bw.y1, H);
  // left wall (x = X0), with window
  const lw = { z0: -1.4, z1: 1.9, y0: 0.9, y1: 2.6 };
  const left = (z0, z1, y0, y1) => slab(group, M.wallAccent, X0 - T, X0, y0, y1, z0, z1, 3);
  left(Z0, lw.z0, 0, H); left(lw.z1, Z1, 0, H); left(lw.z0, lw.z1, 0, lw.y0); left(lw.z0, lw.z1, lw.y1, H);

  // baseboards (dark wood line)
  const skirt = new THREE.MeshStandardMaterial({ color: '#2b2622', roughness: 0.7 });
  const sb = (x0, x1, z0, z1) => slab(group, skirt, x0, x1, 0, 0.09, z0, z1, 1);
  sb(X0, bw.x0, Z0, Z0 + 0.02); sb(bw.x1, X1, Z0, Z0 + 0.02); sb(X0, X0 + 0.02, Z0, Z1);

  // window frames + glass
  const frame = (x, y, z, w, h, d) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.dark); m.position.set(x, y, z); m.castShadow = true; group.add(m); };
  const glass = (x, y, z, w, h, ry = 0) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), M.glass); m.position.set(x, y, z); m.rotation.y = ry; m.renderOrder = 3; group.add(m); };
  { // back window
    const w = bw.x1 - bw.x0, h = bw.y1 - bw.y0, cx = (bw.x0 + bw.x1) / 2, cy = (bw.y0 + bw.y1) / 2, z = Z0 - T / 2;
    glass(cx, cy, z, w, h);
    for (const i of [0, 1, 2, 3]) frame(bw.x0 + (w * i) / 3, cy, z, 0.06, h, 0.09);
    frame(cx, bw.y0, z, w, 0.06, 0.09); frame(cx, bw.y1, z, w, 0.06, 0.09); frame(cx, cy + 0.3, z, w, 0.03, 0.06);
    // sill
    slab(group, M.paint, bw.x0 - 0.05, bw.x1 + 0.05, bw.y0 - 0.03, bw.y0, Z0 - T, Z0 + 0.08, 1);
  }
  { // left window
    const w = lw.z1 - lw.z0, h = lw.y1 - lw.y0, cz = (lw.z0 + lw.z1) / 2, cy = (lw.y0 + lw.y1) / 2, x = X0 - T / 2;
    glass(x, cy, cz, w, h, Math.PI / 2);
    for (const i of [0, 1, 2]) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.09, h, 0.06), M.dark); m.position.set(x, cy, lw.z0 + (w * i) / 2); group.add(m); }
    const m1 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, w), M.dark); m1.position.set(x, lw.y0, cz); group.add(m1);
    const m2 = m1.clone(); m2.position.y = lw.y1; group.add(m2);
    const m3 = m1.clone(); m3.position.y = cy + 0.25; m3.scale.y = 0.5; group.add(m3);
    slab(group, M.paint, X0 - T, X0 + 0.08, lw.y0 - 0.03, lw.y0, lw.z0 - 0.05, lw.z1 + 0.05, 1);
  }

  // sheer curtains (wavy planes) beside the back window
  const curtain = (x, w, z, rotY = 0) => {
    const geo = new THREE.PlaneGeometry(w, 2.9, 28, 1); const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 22) * 0.03);
    const m = new THREE.Mesh(geo, M.sheer); m.position.set(x, 1.7, z); m.rotation.y = rotY; m.renderOrder = 2; group.add(m);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, w + 0.1, 8), M.dark); rod.rotation.z = Math.PI / 2; rod.position.set(x, 3.12, z); group.add(rod);
  };
  curtain(-1.45, 0.9, Z0 + 0.14); curtain(2.65, 0.9, Z0 + 0.14);

  // wall art (frames follow the wood palette)
  const hang = (canvas, w, x, y, z, ry = 0) => {
    const h = w * 1.25, art = artMesh(canvas, w, h, M.wood); art.position.set(x, y, z); art.rotation.y = ry; group.add(art);
  };
  const BZ = Z0 + 0.03, LX = X0 + 0.03, R = Math.PI / 2;
  hang(enso(), 0.7, -2.4, 1.85, BZ);
  hang(bamboo(), 0.42, -3.6, 1.7, BZ);
  hang(catSleep(), 0.5, 3.6, 1.95, BZ);
  hang(seigaiha(), 0.5, 4.4, 1.95, BZ);
  hang(catSun(), 0.8, LX, 1.8, -2.55, R);
  hang(catFace(), 0.52, LX, 2.1, 2.8, R);
  hang(fuji(), 0.42, LX, 2.1, 3.55, R);

  return { group, bounds: { X0, X1, Z0, Z1 } };
}
