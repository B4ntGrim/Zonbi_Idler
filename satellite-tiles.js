// Zed Idler — procedural satellite tiles for the Traversal grid.
// Top-down, blocky, desaturated post-apocalyptic look (voxel-survival style).
// Each tile is a 64×64 SVG, deterministic per cell, cached as a data URI.
(function () {
  const cache = {};
  function rng(seed) {
    return function () {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  const R = (x, y, w, h, f, o) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}"${o ? ` opacity="${o}"` : ''}/>`;
  const pick = (r, a) => a[Math.floor(r() * a.length)];
  const ri = (r, a, b) => a + Math.floor(r() * (b - a + 1));

  function speckle(r, x, y, w, h, shades, n) {
    let s = '';
    for (let i = 0; i < n; i++) {
      const sz = r() < 0.7 ? 1 : 2;
      s += R(x + ri(r, 0, w - sz), y + ri(r, 0, h - sz), sz, sz, pick(r, shades));
    }
    return s;
  }
  function tree(r, x, y, big) {
    const s = big ? ri(r, 5, 7) : ri(r, 3, 5);
    const c = pick(r, ['#2c3d20', '#34482a', '#2f4424', '#3a4e2c']);
    return R(x + 1, y + 1, s, s, '#000', 0.4) + R(x, y, s, s, c) + R(x, y, Math.ceil(s / 2), Math.ceil(s / 2), '#4c6634', 0.8);
  }
  function deadTree(r, x, y) { return R(x, y, 2, 2, pick(r, ['#4a3a28', '#3e3226', '#5a4630'])) + R(x + 1, y + 1, 2, 2, '#000', 0.3); }
  function car(r, x, y, vertical) {
    const c = pick(r, ['#6a2a22', '#2a3a5a', '#7a7870', '#3a4a2a', '#8a6a2a', '#2e2e2e', '#5a2e4a']);
    const w = vertical ? 3 : 5, h = vertical ? 5 : 3;
    let s = R(x + 1, y + 1, w, h, '#000', 0.45) + R(x, y, w, h, c);
    s += vertical ? R(x, y + 1, 3, 1, '#1a1e22') : R(x + 1, y, 1, 3, '#1a1e22');
    if (r() < 0.35) s += R(x, y, w, h, '#1a1410', 0.55); // burnt out
    return s;
  }
  function house(r, x, y, w, h) {
    const roof = pick(r, ['#6e3a2a', '#4a4540', '#5a4a3a', '#3a3a3e', '#7a5a3a', '#5a3a30']);
    let s = R(x + 2, y + 2, w, h, '#000', 0.45) + R(x, y, w, h, roof);
    if (w >= h) s += R(x, y + Math.floor(h / 2), w, 1, '#000', 0.35) + R(x, y, w, Math.floor(h / 2), '#fff', 0.06);
    else s += R(x + Math.floor(w / 2), y, 1, h, '#000', 0.35) + R(x, y, Math.floor(w / 2), h, '#fff', 0.06);
    if (r() < 0.3) { // collapsed / burnt section
      const hx = x + ri(r, 1, Math.max(1, w - 5)), hy = y + ri(r, 1, Math.max(1, h - 4));
      s += R(hx, hy, 4, 3, '#14100c') + speckle(r, hx, hy, 4, 3, ['#5a5048', '#3a342c'], 4);
    }
    return s;
  }
  function crater(cx, cy, rad) {
    return `<circle cx="${cx}" cy="${cy}" r="${rad + 1}" fill="#7a6a52" opacity="0.5"/><circle cx="${cx}" cy="${cy}" r="${rad}" fill="#1e1812"/><circle cx="${cx - 1}" cy="${cy - 1}" r="${Math.max(1, rad - 2)}" fill="#2a2218"/>`;
  }
  function scorch(r, n) {
    let s = '';
    for (let i = 0; i < n; i++) s += `<ellipse cx="${ri(r, 4, 60)}" cy="${ri(r, 4, 60)}" rx="${ri(r, 3, 8)}" ry="${ri(r, 2, 6)}" fill="#0a0806" opacity="${(0.25 + r() * 0.3).toFixed(2)}"/>`;
    return s;
  }
  // Roads sit at the same position in every urban tile so neighbours connect.
  function roads(r, pos, width, asphalt) {
    const a = pos, b = pos + width;
    let s = R(0, a - 1, 64, width + 2, '#6a6660') + R(a - 1, 0, width + 2, 64, '#6a6660'); // sidewalks
    s += R(0, a, 64, width, asphalt) + R(a, 0, width, 64, asphalt);
    s += speckle(r, 0, a, 64, width, ['#2a2a2a', '#444240', '#302e2c'], 30);
    s += speckle(r, a, 0, width, 64, ['#2a2a2a', '#444240', '#302e2c'], 30);
    const mid = a + Math.floor(width / 2);
    for (let i = 0; i < 64; i += 6) {
      if (i < a - 2 || i > b + 1) { s += R(i, mid, 3, 1, '#8a7a3a', 0.7); s += R(mid, i, 1, 3, '#8a7a3a', 0.7); }
    }
    for (let i = 0; i < 4; i++) { // cracks
      const cx = ri(r, 0, 60);
      s += R(cx, a + ri(r, 0, width - 1), ri(r, 3, 7), 1, '#1c1c1c');
      s += R(a + ri(r, 0, width - 1), cx, 1, ri(r, 3, 7), '#1c1c1c');
    }
    return s;
  }
  const quads = (pos, width) => [[0, 0, pos - 1, pos - 1], [pos + width + 1, 0, 64 - pos - width - 1, pos - 1], [0, pos + width + 1, pos - 1, 64 - pos - width - 1], [pos + width + 1, pos + width + 1, 64 - pos - width - 1, 64 - pos - width - 1]];

  function suburbia(r) {
    let s = R(0, 0, 64, 64, '#4a4a2e') + speckle(r, 0, 0, 64, 64, ['#56563a', '#3e4228', '#6b6a3a', '#5a5230'], 120);
    const pos = 40, w = 8;
    s += roads(r, pos, w, '#3a3a38');
    quads(pos, w).forEach(([qx, qy, qw, qh]) => {
      if (qw < 8 || qh < 8) return;
      if (r() < 0.8) {
        const hw = Math.min(qw - 4, ri(r, 10, 16)), hh = Math.min(qh - 4, ri(r, 8, 12));
        const hx = qx + ri(r, 2, Math.max(2, qw - hw - 2)), hy = qy + ri(r, 2, Math.max(2, qh - hh - 2));
        s += R(hx + Math.floor(hw / 2) - 1, hy + hh, 3, Math.max(0, qy + qh - hy - hh), '#5e5a54'); // driveway
        s += house(r, hx, hy, hw, hh);
        if (r() < 0.5) s += car(r, hx + Math.floor(hw / 2) - 1, hy + hh + 1, true);
      } else if (r() < 0.5) { // backyard pool, now stagnant
        s += R(qx + 4, qy + 4, 8, 6, '#6a6660') + R(qx + 5, qy + 5, 6, 4, '#3a4a30');
      }
      const nt = ri(r, 1, 4);
      for (let i = 0; i < nt; i++) s += tree(r, qx + ri(r, 0, Math.max(0, qw - 6)), qy + ri(r, 0, Math.max(0, qh - 6)), r() < 0.4);
      if (r() < 0.5) s += R(qx, qy, qw, 1, '#5a4630', 0.8); // fence line
    });
    for (let i = 0; i < ri(r, 1, 3); i++) s += r() < 0.5 ? car(r, ri(r, 2, 56), pos + ri(r, 1, 4), false) : car(r, pos + ri(r, 1, 4), ri(r, 2, 56), true);
    s += scorch(r, ri(r, 0, 2));
    return s;
  }

  function metro(r) {
    let s = R(0, 0, 64, 64, '#3a3834') + speckle(r, 0, 0, 64, 64, ['#34322e', '#45423c', '#2e2c28'], 90);
    const pos = 38, w = 10;
    s += roads(r, pos, w, '#303030');
    quads(pos, w).forEach(([qx, qy, qw, qh]) => {
      if (qw < 8 || qh < 8) return;
      const kind = r();
      if (kind < 0.62) { // tower / warehouse roof
        const roof = pick(r, ['#7a7670', '#5e5b56', '#6a665e', '#4e4c48', '#8a847a']);
        const bx = qx + 1, by = qy + 1, bw = qw - 2, bh = qh - 2;
        s += R(bx + 3, by + 3, bw, bh, '#000', 0.5) + R(bx, by, bw, bh, roof);
        s += R(bx, by, bw, 1, '#fff', 0.12) + R(bx, by, 1, bh, '#fff', 0.12) + R(bx, by + bh - 1, bw, 1, '#000', 0.3);
        for (let i = 0; i < ri(r, 2, 5); i++) { // HVAC / stairwells
          const ux = bx + ri(r, 2, Math.max(2, bw - 6)), uy = by + ri(r, 2, Math.max(2, bh - 5));
          const uw = ri(r, 2, 5), uh = ri(r, 2, 4);
          s += R(ux + 1, uy + 1, uw, uh, '#000', 0.4) + R(ux, uy, uw, uh, pick(r, ['#9a968e', '#6e6a62', '#56524c']));
        }
        s += `<ellipse cx="${bx + ri(r, 4, Math.max(4, bw - 4))}" cy="${by + ri(r, 4, Math.max(4, bh - 4))}" rx="${ri(r, 2, 5)}" ry="${ri(r, 2, 4)}" fill="#2e2a24" opacity="0.4"/>`;
        if (r() < 0.3) { // collapsed roof
          const cx = bx + ri(r, 2, Math.max(2, bw - 9)), cy = by + ri(r, 2, Math.max(2, bh - 8));
          s += R(cx, cy, 8, 7, '#12100e') + speckle(r, cx, cy, 8, 7, ['#6a6660', '#4a4640', '#8a847a'], 16);
        }
      } else if (kind < 0.85) { // parking lot
        s += R(qx + 1, qy + 1, qw - 2, qh - 2, '#353533');
        for (let x = qx + 3; x < qx + qw - 4; x += 5) {
          s += R(x, qy + 2, 1, 6, '#8a8680', 0.5);
          if (r() < 0.55) s += car(r, x + 1, qy + 3, true);
          if (qh > 16) { s += R(x, qy + qh - 8, 1, 6, '#8a8680', 0.5); if (r() < 0.45) s += car(r, x + 1, qy + qh - 7, true); }
        }
      } else { // rubble lot
        s += R(qx + 1, qy + 1, qw - 2, qh - 2, '#4a443c') + speckle(r, qx + 1, qy + 1, qw - 2, qh - 2, ['#6a6660', '#2a2622', '#7e786e', '#3a342e'], 60);
        if (r() < 0.5) s += crater(qx + qw / 2, qy + qh / 2, ri(r, 3, 5));
      }
    });
    for (let i = 0; i < ri(r, 1, 4); i++) s += r() < 0.5 ? car(r, ri(r, 2, 56), pos + ri(r, 1, 6), false) : car(r, pos + ri(r, 1, 6), ri(r, 2, 56), true);
    if (r() < 0.4) s += speckle(r, pos - 2, pos - 2, w + 4, w + 4, ['#6a6660', '#4a443c', '#2a2622'], 25); // intersection debris
    s += scorch(r, ri(r, 1, 3));
    return s;
  }

  function mountain(r) {
    let s = R(0, 0, 64, 64, '#34422a') + speckle(r, 0, 0, 64, 64, ['#3d4a2a', '#2c3822', '#4a5632', '#56603a'], 140);
    let x = ri(r, 0, 63), y = 0; // winding dirt trail
    while (y < 64) { s += R(x, y, 3, 2, '#6e5a3e') + R(x + 1, y, 1, 2, '#7e6a4a', 0.6); x = Math.max(0, Math.min(61, x + ri(r, -2, 2))); y += 2; }
    for (let i = 0; i < ri(r, 2, 4); i++) { // rock outcrops
      const ox = ri(r, 2, 54), oy = ri(r, 2, 54);
      s += R(ox + 1, oy + 1, ri(r, 4, 8), ri(r, 3, 6), '#000', 0.35) + R(ox, oy, ri(r, 4, 8), ri(r, 3, 6), pick(r, ['#6a6862', '#5a5852', '#7a7870'])) + R(ox, oy, 2, 2, '#9a988e', 0.7);
    }
    if (r() < 0.35) { const cx = ri(r, 6, 44), cy = ri(r, 6, 44); s += R(cx - 3, cy - 3, 16, 14, '#5a4a34') + house(r, cx, cy, 10, 8); }
    if (r() < 0.25) s += `<ellipse cx="${ri(r, 10, 54)}" cy="${ri(r, 10, 54)}" rx="${ri(r, 5, 9)}" ry="${ri(r, 3, 6)}" fill="#2a3a40"/>`; // pond
    for (let i = 0; i < ri(r, 26, 40); i++) s += tree(r, ri(r, 0, 58), ri(r, 0, 58), r() < 0.5);
    return s;
  }

  function perimeter(r) {
    let s = R(0, 0, 64, 64, '#5e4a32') + speckle(r, 0, 0, 64, 64, ['#6b5438', '#54422c', '#7a6040', '#4a3a28'], 150);
    for (let i = 0; i < 10; i++) { // cracked earth
      let x = ri(r, 0, 63), y = ri(r, 0, 63);
      for (let j = 0; j < ri(r, 4, 9); j++) { s += R(x, y, 1, 1, '#2e2418'); x += ri(r, -1, 1); y += ri(r, -1, 1); }
    }
    for (let i = 0; i < ri(r, 1, 3); i++) { // ruined foundations
      const fx = ri(r, 2, 44), fy = ri(r, 2, 44), fw = ri(r, 10, 18), fh = ri(r, 8, 14);
      s += R(fx, fy, fw, 2, '#8a7e6a') + R(fx, fy, 2, fh, '#8a7e6a') + R(fx + fw - 2, fy + ri(r, 0, 4), 2, fh - 4, '#8a7e6a');
      s += R(fx + 2, fy + 2, fw - 4, fh - 3, '#3a2e22', 0.6) + speckle(r, fx + 2, fy + 2, fw - 4, fh - 3, ['#8a7e6a', '#4a3e2e'], 10);
    }
    for (let i = 0; i < ri(r, 1, 3); i++) s += crater(ri(r, 8, 56), ri(r, 8, 56), ri(r, 3, 6));
    if (r() < 0.6) { // irradiated pool
      const px = ri(r, 8, 48), py = ri(r, 8, 48);
      s += `<ellipse cx="${px}" cy="${py}" rx="9" ry="6" fill="#9acd32" opacity="0.18"/>`;
      s += R(px - 5, py - 3, 10, 6, '#4f7a22') + R(px - 3, py - 4, 6, 8, '#4f7a22') + R(px - 2, py - 2, 4, 3, '#8ac43a');
    }
    for (let i = 0; i < ri(r, 4, 9); i++) s += deadTree(r, ri(r, 0, 61), ri(r, 0, 61));
    if (r() < 0.5) { const fy = ri(r, 4, 58); for (let x = 0; x < 64; x += 4) s += R(x, fy, 1, 3, '#2a241c') + R(x, fy + 1, 4, 1, '#4a4238', 0.7); } // wire fence
    s += scorch(r, ri(r, 1, 3));
    return s;
  }

  const GEN = { suburbia, metro, mountain, perimeter };

  function tileUri(biome, seed) {
    const key = biome + ':' + seed;
    if (cache[key]) return cache[key];
    const r = rng(seed * 2654435761 + biome.length * 97);
    let body = (GEN[biome] || suburbia)(r);
    if (r() < 0.3) body += `<ellipse cx="${ri(r, 0, 64)}" cy="${ri(r, 0, 64)}" rx="${ri(r, 18, 30)}" ry="${ri(r, 12, 22)}" fill="#000" opacity="0.14"/>`; // cloud shadow
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" shape-rendering="crispEdges">`
      + `<defs><radialGradient id="v" cx="50%" cy="50%" r="70%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#000" stop-opacity="0.35"/></radialGradient></defs>`
      + body + `<rect width="64" height="64" fill="#6a5a3a" opacity="0.08"/><rect width="64" height="64" fill="url(#v)"/></svg>`;
    cache[key] = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
    return cache[key];
  }

  window.ZI_SAT = { tileUri };
})();
