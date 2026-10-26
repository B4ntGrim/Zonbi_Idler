
// Zed Idler v3 — Last Stand: Dead Zone Inspired Screens
// Satellite map traversal, side-scroller wandering, recycler, material economy

window.ZI_ART = window.ZI_ART || {};

// ─── HIGH-DETAIL SURVIVOR SPRITE (36×48, painted + auto-outlined) ───────────
// Painted in layers on a pixel grid, then every empty pixel touching the body
// becomes a dark outline — the classic hand-pixelled look. Output is
// run-length rows so the SVG stays light. Built once and cached.
// Map the equipped weapon to a sprite pose + projectile.
window.ZI_ART.weaponKindFor = function(loadout) {
  const Z = window.ZI; if (!Z || !Z.getGearItem) return 'fists';
  const id = loadout && (loadout.primary || loadout.secondary || loadout.melee);
  const it = id && Z.getGearItem(id); if (!it) return 'fists';
  const n = (it.name + ' ' + it.id).toLowerCase();
  if (/crossbow/.test(n)) return 'crossbow';
  if (/\bbow\b|compound/.test(n)) return 'bow';
  if (/flame/.test(n)) return 'flame';
  if (/shotgun|sawn/.test(n)) return 'shotgun';
  if (/smg|suppress/.test(n)) return 'smg';
  if (/pistol|revolver|357|9mm/.test(n)) return 'pistol';
  if (/rifle|carbine|ak-|pulse/.test(n)) return 'rifle';
  if (/machete|knife|blade/.test(n)) return 'blade';
  if (/axe|hatchet/.test(n)) return 'axe';
  if (/knuckle/.test(n)) return 'fists';
  if (/bat|pipe|baton|sledge|board|crowbar|club|hammer/.test(n)) return 'blunt';
  return it.slot === 'melee' ? 'blunt' : 'rifle';
};
window.ZI_ART.WEAPON_FX = {
  rifle:   { muzzle:[32,18], shot:'tracer' }, smg:{ muzzle:[31,18], shot:'tracer' }, shotgun:{ muzzle:[31,18], shot:'spread' },
  pistol:  { muzzle:[31,14], shot:'tracer' }, crossbow:{ shot:'bolt' }, bow:{ shot:'arrow' }, flame:{ muzzle:[30,18], shot:'flame' },
  blade:{ shot:'slash' }, axe:{ shot:'slash' }, blunt:{ shot:'slash' }, fists:{ shot:'slash' },
};
window.ZI_ART.survivorRuns = function(kind = 'rifle') {
  window.ZI_ART._survivorCache = window.ZI_ART._survivorCache || {};
  if (window.ZI_ART._survivorCache[kind]) return window.ZI_ART._survivorCache[kind];
  const W = 36, H = 48, g = Array.from({ length:H }, () => Array(W).fill(null));
  const P = {
    k:'#120d0a', h:'#3a2418', H:'#6a4428', s:'#c89468', S:'#94603e', l:'#e6b88a', e:'#140c0a',
    b:'#7a2c22', B:'#4a1814', j:'#4c5c3a', J:'#2f3b25', G:'#6e8052', u:'#7a6a48', U:'#54482e',
    p:'#5e4628', q:'#3c2c18', t:'#2a1e14', T:'#b09a58', n:'#3c3628', N:'#26221a', K:'#565040',
    o:'#2c1c10', O:'#150c08', L:'#7a6a48', r:'#2a2a2a', R:'#55554f', w:'#6e4626', X:'#4a2c18',
    c:'#2c2420', m:'#5aa0b8', d:'#5c261a',
  };
  const px = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = c; };
  const rect = (x, y, w, h, c) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) px(xx, yy, c); };
  // Bedroll + backpack (behind)
  rect(5,11,7,3,'u'); rect(5,12,7,1,'U'); px(5,11,'U'); px(11,13,'U');
  rect(5,14,6,12,'q'); rect(6,15,4,10,'p'); rect(6,18,4,1,'t'); px(7,21,'T'); rect(6,23,4,1,'q'); px(9,15,'u');
  // Legs (back leg darker), knee pad, folds
  rect(12,28,4,14,'N'); rect(17,28,4,14,'n'); rect(17,33,4,2,'K'); px(18,32,'N'); px(19,37,'N'); px(20,30,'N'); px(13,35,'n'); px(14,31,'n');
  // Boots with laces + soles
  rect(11,42,6,4,'o'); rect(16,42,7,4,'o'); rect(11,45,6,1,'O'); rect(16,45,7,1,'O'); px(22,44,'O');
  [[13,43],[14,43],[18,43],[19,43],[18,44]].forEach(([x,y]) => px(x,y,'L'));
  // Torso jacket with shading, collar, zipper, chest strap
  rect(10,12,11,15,'j'); rect(10,12,2,15,'J'); rect(12,12,7,1,'J'); rect(14,13,3,1,'G'); rect(13,14,2,5,'G');
  for (let y = 15; y < 26; y++) px(16, y, 'J');
  for (let i = 0; i < 10; i++) px(11 + i, 13 + i, 't');
  px(12,22,'d'); px(13,22,'d'); px(13,23,'d'); px(18,15,'d'); px(11,17,'d');
  // Belt, buckle, pouch
  rect(10,26,12,2,'t'); rect(15,26,2,2,'T'); rect(19,25,3,3,'q'); px(20,25,'p');
  // Head: neck, face, hair (back of head left, face right), eye, ear, nose
  rect(14,10,3,2,'S'); rect(12,2,8,8,'s'); rect(12,1,8,3,'h'); rect(11,2,3,7,'h'); rect(14,1,4,1,'H'); px(12,2,'H'); px(13,3,'H');
  px(17,4,'h'); px(18,4,'h'); px(18,5,'e'); px(19,5,'l'); px(16,4,'l'); px(13,6,'S'); px(13,5,'S'); px(20,6,'s'); px(15,5,'S');
  // Bandana over nose/mouth with knot trailing back
  rect(14,7,7,3,'b'); rect(14,9,6,1,'B'); px(15,7,'B'); px(11,8,'b'); px(10,9,'b'); px(11,9,'B'); px(9,10,'B');
  // ── Arms + weapon, drawn to match what's equipped ──
  const longGunArms = () => { rect(21,15,5,2,'J'); rect(18,13,3,5,'j'); px(19,13,'G'); rect(20,17,3,3,'j'); px(20,19,'J'); };
  const meleeArms = () => { rect(10,16,2,7,'J'); rect(18,13,3,4,'j'); px(19,13,'G'); rect(20,12,3,3,'j'); rect(22,12,2,3,'c'); };
  const MET = '#c8ccd0', BOLT = '#c8c0a0';
  const k = kind;
  if (k === 'rifle') {
    longGunArms();
    rect(12,18,5,3,'w'); rect(12,20,5,1,'X'); px(13,18,'X');
    rect(17,18,6,2,'r'); rect(17,18,6,1,'R'); rect(20,20,2,3,'r'); px(21,22,'R');
    rect(18,16,5,2,'r'); px(18,16,'R'); px(22,16,'m'); px(22,17,'m');
    rect(23,18,8,1,'r'); rect(23,19,4,1,'R'); px(31,18,'R');
    rect(19,19,2,2,'c'); rect(25,17,2,2,'c'); px(26,19,'c');
  } else if (k === 'smg') {
    longGunArms();
    rect(13,18,4,2,'r'); px(13,20,'r'); rect(17,18,6,2,'r'); rect(17,18,6,1,'R'); rect(19,20,2,4,'r'); px(20,23,'R');
    rect(23,18,4,1,'r'); rect(27,18,3,1,'R'); rect(27,19,3,1,'r');
    rect(18,19,2,2,'c'); rect(23,19,2,2,'c');
  } else if (k === 'shotgun') {
    longGunArms();
    rect(12,18,5,3,'w'); rect(12,20,5,1,'X'); rect(17,18,4,2,'r'); rect(17,18,4,1,'R');
    rect(21,18,9,1,'r'); rect(21,19,9,1,'R'); rect(23,20,4,1,'w'); px(30,18,'r'); px(30,19,'r');
    rect(19,19,2,2,'c'); rect(24,20,2,2,'c');
  } else if (k === 'pistol') {
    rect(18,13,3,4,'j'); px(19,13,'G'); rect(20,15,5,2,'j'); rect(19,17,5,2,'J');
    rect(25,15,2,2,'c'); rect(24,17,2,1,'c');
    rect(26,14,4,1,'r'); rect(26,15,1,2,'r'); px(27,15,'R'); px(29,14,'R');
  } else if (k === 'crossbow') {
    longGunArms();
    rect(13,19,11,2,'w'); rect(13,20,11,1,'X');
    rect(24,13,1,13,'X'); px(25,12,'X'); px(25,26,'X'); px(23,13,'w'); px(23,25,'w');
    [[23,14],[22,15],[22,16],[21,17],[21,18],[21,21],[22,22],[22,23],[23,24]].forEach(([x,y]) => px(x,y,'L'));
    rect(19,18,9,1,BOLT); px(28,18,'R'); px(29,18,'R'); px(19,17,'b'); px(19,19,'b');
    rect(18,20,2,2,'c'); rect(22,20,2,2,'c');
  } else if (k === 'bow') {
    rect(21,15,6,2,'J'); rect(18,13,3,5,'j'); px(19,13,'G'); rect(17,17,3,3,'j');
    [[26,9],[27,10],[27,11],[28,12],[28,13],[28,14],[28,15],[28,16],[28,17],[28,18],[28,19],[28,20],[28,21],[28,22],[28,23],[27,24],[27,25],[26,26]].forEach(([x,y]) => px(x,y,'w'));
    px(26,9,'X'); px(26,26,'X');
    [[25,10],[24,11],[23,12],[22,13],[21,14],[20,15],[19,16],[19,17],[19,19],[20,20],[21,21],[22,22],[23,23],[24,24],[25,25]].forEach(([x,y]) => px(x,y,'L'));
    rect(19,18,10,1,BOLT); px(29,18,'R'); px(30,18,'R'); px(19,17,'b'); px(19,19,'b');
    rect(27,17,2,3,'c'); rect(18,18,2,2,'c');
  } else if (k === 'flame') {
    rect(5,14,5,11,'#7a2418'); rect(6,14,1,11,'#a8402a'); rect(5,13,5,1,'#4a1810'); rect(6,25,3,1,'#4a1810');
    longGunArms();
    rect(17,18,11,2,'r'); rect(17,18,11,1,'R'); rect(20,20,2,2,'r'); px(28,18,'r'); px(28,19,'r'); px(29,18,'#e07a30');
    [[10,20],[11,21],[12,22],[13,22],[14,22],[15,21],[16,21]].forEach(([x,y]) => px(x,y,'N'));
    rect(19,19,2,2,'c'); rect(24,17,2,2,'c');
  } else if (k === 'blade') {
    meleeArms(); rect(22,14,2,2,'X');
    for (let i = 0; i < 8; i++) { px(24 + i, 12 - i, MET); px(24 + i, 13 - i, 'R'); }
    px(31,4,MET);
  } else if (k === 'axe') {
    meleeArms();
    for (let i = 0; i < 9; i++) px(23 + i * 0.6, 14 - i, 'w');
    rect(27,4,4,4,'R'); rect(30,4,1,4,MET); px(26,5,'r'); px(26,6,'r');
  } else if (k === 'blunt') {
    meleeArms();
    for (let i = 0; i < 8; i++) { px(23 + i * 0.6, 13 - i, 'w'); px(24 + i * 0.6, 13 - i, 'X'); }
    rect(26,3,4,4,'w'); rect(26,3,4,1,'X'); px(26,4,MET); px(29,5,MET); px(28,3,MET);
  } else {
    // Fists / knuckles
    rect(18,13,3,4,'j'); px(19,13,'G'); rect(20,16,4,2,'j'); rect(24,15,3,3,'c'); rect(26,15,1,3,'R');
    rect(14,17,2,5,'J'); rect(15,21,2,2,'c');
  }
  // Auto outline: empty pixels bordering the figure become the dark outline colour
  const out = g.map(r => r.slice());
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g[y][x]) continue;
    const n = [[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy]) => g[y+dy] && g[y+dy][x+dx]);
    if (n) out[y][x] = 'k';
  }
  const runs = [];
  for (let y = 0; y < H; y++) {
    let x = 0;
    while (x < W) {
      const c = out[y][x]; if (!c) { x++; continue; }
      let w = 1; while (x + w < W && out[y][x + w] === c) w++;
      runs.push({ x, y, w, c: P[c] }); x += w;
    }
  }
  return (window.ZI_ART._survivorCache[kind] = runs);
};

// ─── HIGH-DETAIL ZOMBIE SPRITES (36×48, painted + auto-outlined) ────────────
// One painter, many archetypes: each bestiary base maps to a look (skin tone,
// build, clothing) plus signature features (exposed ribs, bloated throat,
// glowing veins, frost, armour, maggots, chains…). Faces left, toward the survivor.
window.ZI_ART.zombieLook = function(type) {
  const t = String(type || 'shambler').toLowerCase();
  const has = (...ks) => ks.some(k => t.includes(k));
  const base = { skin:['#6e8260','#4a5a40','#8ea07a'], shirt:['#3a4232','#262c20'], pants:['#2a2620','#1a1814'], eye:'#e8e0b0', feats:[], wide:false, scale:1 };
  if (has('runner','nimble','sharp','packleader','jingle','creeper')) Object.assign(base, { skin:['#7a8870','#525e48','#98a68a'], shirt:['#5a2a24','#3a1a16'], eye:'#ff4a3a', feats:['lean','hood'] });
  if (has('spit','acid','toxic','tainted','vomit')) Object.assign(base, { skin:['#8a9a48','#5e6c2c','#aebc64'], shirt:['#4a4430','#2e2a1c'], eye:'#d8f060', feats:['bloat','drool'] });
  if (has('brute','heavy','giant','titan','mutant','battle','hybrid','hexapod','octopod','rebis')) Object.assign(base, { skin:['#7a6a5a','#52463a','#9a8a74'], shirt:['#3a2e24','#241c16'], eye:'#ff7030', feats:['ribs','muscle'], wide:true, scale: has('titan','giant') ? 1.35 : 1.15 });
  if (has('burrow','trapper','path')) Object.assign(base, { skin:['#6a5a44','#46382a','#8a785c'], shirt:['#4a3c2a','#2e2418'], eye:'#f0d070', feats:['dirt','claws'] });
  if (has('radiation','conductive','signal','immolation','pressurized','lightsensitive')) Object.assign(base, { skin:['#5a6a6a','#3a4646','#7a8a8a'], shirt:['#2a3034','#1a1e22'], eye: has('immolation') ? '#ff9a30' : '#60f0ff', glow: has('immolation') ? '#ff8a20' : '#40e0f0', feats:['veins'] });
  if (has('frost')) Object.assign(base, { skin:['#9ab0bc','#6a808c','#c4d6e0'], shirt:['#3a4450','#262e36'], eye:'#bff4ff', feats:['ice'] });
  if (has('armored','chrome','weapon','keyring','chained','stun')) { base.feats = base.feats.concat(has('chained') ? ['chain'] : ['helmet']); if (has('armored','weapon')) base.feats.push('plates'); }
  if (has('maggot','wretched','hermit','grayscale','randomfan')) base.feats = base.feats.concat(['maggots','holes']);
  return base;
};
window.ZI_ART.zombieSvg = function(type, frame = 0) {
  const L = window.ZI_ART.zombieLook(type);
  const W = 36, H = 48, g = Array.from({ length:H }, () => Array(W).fill(null));
  const px = (x, y, c) => { x = Math.round(x); y = Math.round(y); if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = c; };
  const rect = (x, y, w, h, c) => { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) px(xx, yy, c); };
  let seed = 0; for (const ch of String(type)) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rnd = () => { seed = (seed * 1103515245 + 12345) >>> 0; return (seed >>> 8) / 16777216; };
  const [sk, skD, skL] = L.skin, [sh, shD] = L.shirt, [pa, paD] = L.pants;
  const sway = frame % 2 === 0 ? 0 : 1, step = frame % 2 === 0 ? 0 : 1;
  const wd = L.wide ? 2 : 0, lean = L.feats.includes('lean') ? -1 : 0;
  const BLOOD = '#5a0c0a', BLOOD2 = '#8a1410', BONE = '#d8ceb0', GUM = '#2a0606';
  // Legs (back leg darker), shuffling step, torn cuffs
  rect(16 + step, 31, 4 + wd / 2, 11, paD); rect(20 - step + wd, 31, 4 + wd / 2, 11, pa);
  px(21 - step + wd, 35, paD); px(17 + step, 38, pa); px(22 - step + wd, 40, BLOOD);
  // Bare, rotting feet
  rect(14 + step, 42, 6, 3, skD); rect(19 - step + wd, 42, 6, 3, sk); px(14 + step, 44, BONE); px(19 - step + wd, 44, skL); px(24 - step + wd, 43, BLOOD);
  // Torso (hunched), shirt shading, tears showing skin, blood
  const tx = 13 - wd + lean, tw = 11 + wd * 2;
  rect(tx, 15, tw, 16, sh); rect(tx + tw - 3, 15, 3, 16, shD); rect(tx, 15, tw, 1, shD);
  for (let i = 0; i < 4; i++) { const x = tx + 1 + Math.floor(rnd() * (tw - 3)), y = 17 + Math.floor(rnd() * 11); rect(x, y, 2, 1 + Math.floor(rnd() * 2), sk); }
  for (let i = 0; i < 5; i++) px(tx + Math.floor(rnd() * tw), 18 + Math.floor(rnd() * 12), rnd() > 0.5 ? BLOOD : BLOOD2);
  if (L.feats.includes('ribs') || L.feats.includes('holes')) { rect(tx + 2, 19, 5, 6, GUM); for (let y = 19; y < 25; y += 2) rect(tx + 2, y, 5, 1, BONE); }
  if (L.feats.includes('muscle')) { rect(tx + tw - 5, 16, 3, 3, skL); rect(tx - 1, 16, 3, 4, sk); }
  if (L.feats.includes('plates')) { rect(tx + 1, 16, tw - 2, 5, '#5a5c60'); rect(tx + 1, 16, tw - 2, 1, '#8a8c90'); px(tx + 3, 18, '#2a2c30'); px(tx + tw - 4, 18, '#2a2c30'); }
  if (L.feats.includes('chain')) for (let i = 0; i < tw + 2; i += 2) { px(tx - 1 + i, 22 + (i % 4 === 0 ? 0 : 1), '#8a8c8a'); px(tx + i, 22 + (i % 4 === 0 ? 1 : 0), '#5a5c5a'); }
  if (L.feats.includes('hood')) { rect(tx + 2, 13, tw - 1, 3, shD); }
  // Head: skull shape, patchy hair, exposed bone, open jaw with teeth
  const hx = 11 + lean, hy = 4;
  rect(hx + 1, hy, 8, 10, sk); rect(hx + 6, hy, 3, 10, skD); rect(hx + 1, hy + 9, 5, 1, skD);
  rect(hx + 2, hy - 1, 6, 1, '#2a2418'); px(hx + 3, hy, '#2a2418'); px(hx + 7, hy, '#2a2418'); px(hx + 5, hy - 1, sk);
  rect(hx + 5, hy, 2, 2, BONE); px(hx + 6, hy + 1, '#a8a088');
  px(hx + 2, hy + 3, skL); px(hx + 3, hy + 2, skL);
  // Sunken, glowing eyes
  rect(hx + 1, hy + 3, 2, 2, GUM); rect(hx + 4, hy + 3, 2, 2, GUM); px(hx + 1, hy + 3, L.eye); px(hx + 4, hy + 3, L.eye);
  px(hx, hy + 5, skD);
  // Jaw hanging open, teeth, blood drip
  rect(hx, hy + 7, 5, 3, GUM); [hx, hx + 2, hx + 4].forEach(x => px(x, hy + 7, BONE)); px(hx + 1, hy + 9, BONE); px(hx + 3, hy + 9, BONE);
  px(hx + 1, hy + 10, BLOOD2); px(hx + 1, hy + 11, BLOOD); px(hx + 3, hy + 11, BLOOD);
  if (L.feats.includes('drool')) { px(hx + 2, hy + 10, '#b8e040'); px(hx + 2, hy + 11, '#b8e040'); px(hx + 2, hy + 12, '#88b020'); px(hx + 2, hy + 13, '#88b020'); }
  if (L.feats.includes('bloat')) { rect(hx + 3, hy + 10, 6, 4, '#9ab040'); rect(hx + 4, hy + 10, 3, 1, '#c8e060'); px(hx + 7, hy + 12, '#6a7a20'); }
  if (L.feats.includes('helmet')) { rect(hx, hy - 2, 10, 4, '#5a5c60'); rect(hx, hy - 2, 10, 1, '#9a9ca0'); rect(hx - 1, hy + 1, 3, 1, '#3a3c40'); }
  // Arms reaching toward the survivor (near arm lit, far arm shadowed), clawed hands
  const ay = 16 + sway;
  rect(4, ay + 3, 9, 2, skD); rect(2, ay + 3, 2, 1, skD); px(1, ay + 4, BONE);
  rect(8 - wd, ay, 6 + wd, 3, sk); rect(3, ay, 5, 3, sk); rect(3, ay, 5, 1, skL); px(10, ay + 1, BLOOD);
  rect(1, ay, 2, 1, sk); px(0, ay, L.feats.includes('claws') ? BONE : skL); px(1, ay + 2, sk); px(0, ay + 2, L.feats.includes('claws') ? BONE : skL);
  if (L.feats.includes('claws')) { px(0, ay - 1, BONE); px(0, ay + 3, BONE); }
  rect(9, ay + 1, 3, 1, sh); // torn sleeve cuff
  // Glowing veins / frost / dirt / maggots
  if (L.feats.includes('veins')) { const v = L.glow; [[hx + 2, hy + 6],[hx + 3, hy + 5],[5, ay + 1],[6, ay + 2],[7, ay + 1],[tx + 3, 20],[tx + 4, 21],[tx + 4, 22],[tx + 5, 23],[tx + 6, 26],[tx + 7, 27]].forEach(([x, y]) => px(x, y, v)); }
  if (L.feats.includes('ice')) [[hx + 2, hy],[hx + 8, hy + 2],[3, ay],[tx + 1, 16],[tx + tw - 2, 20],[17, 40],[22, 37]].forEach(([x, y]) => { px(x, y, '#e8f8ff'); px(x, y - 1, '#bfe4f4'); });
  if (L.feats.includes('dirt')) for (let i = 0; i < 18; i++) px(2 + Math.floor(rnd() * 30), 12 + Math.floor(rnd() * 33), rnd() > 0.5 ? '#4a3a24' : '#6a5436');
  if (L.feats.includes('maggots')) [[tx + 3, 20],[tx + 5, 22],[tx + 4, 24],[hx + 6, hy + 4],[6, ay + 1]].forEach(([x, y]) => px(x, y, '#ece4c4'));
  // Auto outline
  const out = g.map(r => r.slice());
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (g[y][x]) continue;
    if ([[1,0],[-1,0],[0,1],[0,-1]].some(([dx, dy]) => g[y + dy] && g[y + dy][x + dx])) out[y][x] = '#120d0a';
  }
  let rects = '';
  for (let y = 0; y < H; y++) { let x = 0; while (x < W) { const c = out[y][x]; if (!c) { x++; continue; } let w = 1; while (x + w < W && out[y][x + w] === c) w++; rects += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="1" fill="' + c + '"/>'; x += w; } }
  const w = Math.round(72 * L.scale), h = Math.round(96 * L.scale);
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="' + w + '" height="' + h + '" shape-rendering="crispEdges">' + rects + '</svg>';
};

// ─── UNDEAD SIDE-SCROLLER SPRITES (16-bit, distinct per tier) ───────────────
ZI_ART.undead = {
  shambler: (frame=0) => {
    // 16-bit shambler: shuffling, head tilted, arms dangling
    const armOffset = frame % 2 === 0 ? 0 : 1;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 28" width="54" height="84" shape-rendering="crispEdges">
      <!-- Head, tilted left -->
      <rect x="6" y="0" width="8" height="2" fill="#4a6840"/>
      <rect x="5" y="2" width="9" height="6" fill="#5a7850"/>
      <!-- Hair tufts -->
      <rect x="6" y="0" width="1" height="1" fill="#1a2410"/>
      <rect x="12" y="0" width="1" height="1" fill="#1a2410"/>
      <!-- Eyes - glowing white -->
      <rect x="6" y="4" width="2" height="2" fill="#d0c8a8"/>
      <rect x="11" y="4" width="2" height="2" fill="#d0c8a8"/>
      <rect x="7" y="5" width="1" height="1" fill="#1a1010"/>
      <rect x="12" y="5" width="1" height="1" fill="#1a1010"/>
      <!-- Open mouth dripping -->
      <rect x="7" y="7" width="5" height="2" fill="#3a0808"/>
      <rect x="8" y="6" width="1" height="1" fill="#a08070"/>
      <rect x="10" y="6" width="1" height="1" fill="#a08070"/>
      <rect x="9" y="9" width="1" height="2" fill="#4a0a0a"/>
      <!-- Torso - tattered shirt -->
      <rect x="4" y="9" width="11" height="9" fill="#2a3424"/>
      <rect x="4" y="11" width="3" height="1" fill="#3a0808"/>
      <rect x="11" y="13" width="4" height="1" fill="#5a3424"/>
      <rect x="5" y="14" width="2" height="3" fill="#5a7850"/>
      <!-- Arms outstretched, swaying -->
      <rect x="0" y="${10+armOffset}" width="4" height="3" fill="#5a7850"/>
      <rect x="0" y="${13+armOffset}" width="3" height="2" fill="#5a7850"/>
      <rect x="15" y="${10-armOffset}" width="3" height="3" fill="#5a7850"/>
      <rect x="16" y="${13-armOffset}" width="2" height="2" fill="#5a7850"/>
      <!-- Hands - clawed -->
      <rect x="0" y="${15+armOffset}" width="2" height="1" fill="#4a6840"/>
      <rect x="16" y="${15-armOffset}" width="2" height="1" fill="#4a6840"/>
      <!-- Pants - torn -->
      <rect x="5" y="18" width="3" height="6" fill="#1e1a16"/>
      <rect x="10" y="18" width="3" height="6" fill="#1e1a16"/>
      <rect x="6" y="20" width="1" height="2" fill="#3a0808"/>
      <!-- Feet -->
      <rect x="4" y="24" width="4" height="2" fill="#2a1a10"/>
      <rect x="10" y="24" width="4" height="2" fill="#2a1a10"/>
      <rect x="4" y="26" width="3" height="2" fill="#1a1008"/>
      <rect x="11" y="26" width="3" height="2" fill="#1a1008"/>
    </svg>`;
  },

  runner: (frame=0) => {
    const stride = frame % 2;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 26" width="54" height="78" shape-rendering="crispEdges">
      <!-- Head - leaning forward, mouth wide -->
      <rect x="7" y="0" width="7" height="2" fill="#3a5040"/>
      <rect x="6" y="2" width="9" height="5" fill="#4a6050"/>
      <!-- Red eyes (predator) -->
      <rect x="7" y="4" width="2" height="2" fill="#c83030"/>
      <rect x="12" y="4" width="2" height="2" fill="#c83030"/>
      <rect x="8" y="5" width="1" height="1" fill="#1a0808"/>
      <rect x="13" y="5" width="1" height="1" fill="#1a0808"/>
      <!-- Snarl mouth -->
      <rect x="7" y="6" width="6" height="2" fill="#3a0808"/>
      <rect x="8" y="6" width="1" height="2" fill="#d0c8a8"/>
      <rect x="10" y="6" width="1" height="2" fill="#d0c8a8"/>
      <rect x="12" y="6" width="1" height="2" fill="#d0c8a8"/>
      <!-- Lean torso -->
      <rect x="5" y="8" width="9" height="7" fill="#1e2a20"/>
      <rect x="5" y="9" width="9" height="1" fill="#3a0808"/>
      <rect x="7" y="11" width="2" height="3" fill="#5a3030"/>
      <!-- Arms in running motion -->
      <rect x="2" y="${8+stride}" width="3" height="2" fill="#4a6050"/>
      <rect x="0" y="${10+stride}" width="3" height="2" fill="#4a6050"/>
      <rect x="14" y="${10-stride}" width="3" height="2" fill="#4a6050"/>
      <rect x="15" y="${12-stride}" width="3" height="2" fill="#4a6050"/>
      <!-- Legs in sprint stride -->
      <rect x="5" y="15" width="3" height="${4+stride*2}" fill="#1a1814"/>
      <rect x="11" y="15" width="3" height="${4-stride}" fill="#1a1814"/>
      <rect x="${5+stride*2}" y="${19+stride*2}" width="4" height="3" fill="#2a1a10"/>
      <rect x="${11-stride}" y="${19-stride}" width="4" height="3" fill="#2a1a10"/>
    </svg>`;
  },

  spitter: (frame=0) => {
    const sac = frame % 2;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 28" width="54" height="84" shape-rendering="crispEdges">
      <!-- Large bulbous head -->
      <rect x="5" y="0" width="9" height="3" fill="#5a7030"/>
      <rect x="4" y="3" width="11" height="6" fill="#6a8040"/>
      <!-- Yellow eyes -->
      <rect x="5" y="4" width="2" height="2" fill="#f0d050"/>
      <rect x="12" y="4" width="2" height="2" fill="#f0d050"/>
      <rect x="6" y="5" width="1" height="1" fill="#1a1010"/>
      <rect x="13" y="5" width="1" height="1" fill="#1a1010"/>
      <!-- Huge toxic mouth, dripping acid -->
      <rect x="4" y="7" width="11" height="3" fill="#5a7030"/>
      <rect x="5" y="8" width="9" height="2" fill="#0a0a0a"/>
      <!-- Acid trail -->
      <rect x="6" y="10" width="1" height="${2+sac}" fill="#a0d040"/>
      <rect x="9" y="10" width="1" height="${3+sac}" fill="#a0d040" opacity="0.9"/>
      <rect x="12" y="10" width="1" height="${2-sac}" fill="#a0d040"/>
      <!-- Body with toxic sacs -->
      <rect x="3" y="11" width="12" height="9" fill="#4a6020"/>
      <!-- Bulging sacs (animated) -->
      <rect x="1" y="${12+sac}" width="4" height="4" fill="#a0d040" opacity="0.85"/>
      <rect x="13" y="${12+sac}" width="4" height="4" fill="#a0d040" opacity="0.85"/>
      <rect x="2" y="${13+sac}" width="2" height="2" fill="#d0f060"/>
      <rect x="14" y="${13+sac}" width="2" height="2" fill="#d0f060"/>
      <!-- Thin arms -->
      <rect x="0" y="14" width="3" height="2" fill="#6a8040"/>
      <rect x="15" y="14" width="3" height="2" fill="#6a8040"/>
      <!-- Stunted legs -->
      <rect x="5" y="20" width="3" height="6" fill="#2a1814"/>
      <rect x="10" y="20" width="3" height="6" fill="#2a1814"/>
      <rect x="4" y="26" width="5" height="2" fill="#1a1008"/>
      <rect x="10" y="26" width="5" height="2" fill="#1a1008"/>
    </svg>`;
  },

  brute: (frame=0) => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 30" width="66" height="90" shape-rendering="crispEdges">
      <!-- Massive head, bone protrusions -->
      <rect x="6" y="0" width="10" height="2" fill="#2a3420"/>
      <rect x="5" y="2" width="12" height="8" fill="#3a4830"/>
      <!-- Bony brow ridge -->
      <rect x="4" y="3" width="14" height="2" fill="#d0c0a0"/>
      <!-- Glowing red eyes deep set -->
      <rect x="6" y="5" width="3" height="2" fill="#0a0a0a"/>
      <rect x="13" y="5" width="3" height="2" fill="#0a0a0a"/>
      <rect x="7" y="6" width="1" height="1" fill="#f04040"/>
      <rect x="14" y="6" width="1" height="1" fill="#f04040"/>
      <!-- Jutting jaw with tusks -->
      <rect x="5" y="8" width="12" height="3" fill="#3a0808"/>
      <rect x="6" y="9" width="2" height="3" fill="#d0c0a0"/>
      <rect x="14" y="9" width="2" height="3" fill="#d0c0a0"/>
      <rect x="9" y="10" width="1" height="2" fill="#d0c0a0"/>
      <rect x="12" y="10" width="1" height="2" fill="#d0c0a0"/>
      <!-- Massive torso -->
      <rect x="2" y="11" width="18" height="11" fill="#1e2418"/>
      <!-- Muscle definition -->
      <rect x="3" y="12" width="6" height="1" fill="#3a4830"/>
      <rect x="13" y="12" width="6" height="1" fill="#3a4830"/>
      <rect x="2" y="15" width="18" height="1" fill="#3a4830"/>
      <rect x="4" y="14" width="3" height="2" fill="#3a0808"/>
      <rect x="13" y="17" width="4" height="2" fill="#3a0808"/>
      <!-- Huge arms -->
      <rect x="0" y="11" width="3" height="10" fill="#3a4830"/>
      <rect x="19" y="11" width="3" height="10" fill="#3a4830"/>
      <rect x="0" y="20" width="4" height="3" fill="#3a4830"/>
      <rect x="18" y="20" width="4" height="3" fill="#3a4830"/>
      <!-- Massive fists -->
      <rect x="0" y="22" width="5" height="3" fill="#2a3420"/>
      <rect x="17" y="22" width="5" height="3" fill="#2a3420"/>
      <!-- Thick legs -->
      <rect x="4" y="22" width="6" height="6" fill="#1e1814"/>
      <rect x="12" y="22" width="6" height="6" fill="#1e1814"/>
      <rect x="3" y="28" width="7" height="2" fill="#0a0a08"/>
      <rect x="12" y="28" width="7" height="2" fill="#0a0a08"/>
    </svg>`;
  },

  burrower: (frame=0) => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 22" width="72" height="66" shape-rendering="crispEdges">
      <!-- Pale, eyeless head -->
      <rect x="8" y="0" width="8" height="2" fill="#3a3024"/>
      <rect x="7" y="2" width="10" height="5" fill="#4a4030"/>
      <!-- Skin folds -->
      <rect x="8" y="3" width="8" height="1" fill="#5a4838"/>
      <rect x="9" y="5" width="6" height="1" fill="#3a3024"/>
      <!-- Sensor pits (no eyes, just slits) -->
      <rect x="9" y="4" width="2" height="1" fill="#1a1408"/>
      <rect x="13" y="4" width="2" height="1" fill="#1a1408"/>
      <!-- Wide split mouth -->
      <rect x="6" y="6" width="12" height="2" fill="#3a0808"/>
      <rect x="7" y="6" width="1" height="2" fill="#d0c0a0"/>
      <rect x="9" y="6" width="1" height="2" fill="#d0c0a0"/>
      <rect x="11" y="6" width="1" height="2" fill="#d0c0a0"/>
      <rect x="13" y="6" width="1" height="2" fill="#d0c0a0"/>
      <rect x="15" y="6" width="1" height="2" fill="#d0c0a0"/>
      <rect x="17" y="6" width="1" height="2" fill="#d0c0a0"/>
      <!-- Long elongated body, low to ground -->
      <rect x="2" y="8" width="22" height="8" fill="#4a4030"/>
      <rect x="3" y="9" width="20" height="1" fill="#5a4838"/>
      <rect x="2" y="11" width="22" height="1" fill="#3a3024"/>
      <rect x="3" y="14" width="20" height="1" fill="#3a3024"/>
      <!-- Multiple claw-arms -->
      <rect x="0" y="${10+frame%2}" width="3" height="2" fill="#3a3024"/>
      <rect x="0" y="${13-frame%2}" width="3" height="2" fill="#3a3024"/>
      <rect x="21" y="${10+frame%2}" width="3" height="2" fill="#3a3024"/>
      <rect x="21" y="${13-frame%2}" width="3" height="2" fill="#3a3024"/>
      <!-- Claws -->
      <rect x="0" y="9" width="1" height="1" fill="#1a1408"/>
      <rect x="0" y="15" width="1" height="1" fill="#1a1408"/>
      <rect x="23" y="9" width="1" height="1" fill="#1a1408"/>
      <rect x="23" y="15" width="1" height="1" fill="#1a1408"/>
      <!-- Stubby legs -->
      <rect x="6" y="16" width="3" height="4" fill="#2a1e14"/>
      <rect x="15" y="16" width="3" height="4" fill="#2a1e14"/>
      <rect x="5" y="20" width="5" height="2" fill="#1a1408"/>
      <rect x="14" y="20" width="5" height="2" fill="#1a1408"/>
      <!-- Dirt particles around -->
      <rect x="1" y="20" width="1" height="1" fill="#3a2818"/>
      <rect x="22" y="20" width="1" height="1" fill="#3a2818"/>
      <rect x="12" y="21" width="1" height="1" fill="#3a2818"/>
    </svg>`;
  },

  radiationWalker: (frame=0) => {
    const glow = frame % 2;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 30" width="60" height="90" shape-rendering="crispEdges">
      <!-- Radiated head, glowing -->
      <rect x="6" y="0" width="8" height="2" fill="#3a3a1a"/>
      <rect x="5" y="2" width="10" height="6" fill="#5a5a20"/>
      <!-- Radiation veins -->
      <rect x="6" y="3" width="1" height="2" fill="#d0f040" opacity="${0.6+glow*0.2}"/>
      <rect x="13" y="3" width="1" height="2" fill="#d0f040" opacity="${0.6+glow*0.2}"/>
      <rect x="9" y="5" width="2" height="2" fill="#d0f040" opacity="${0.6+glow*0.2}"/>
      <!-- Eyes - pure radioactive yellow -->
      <rect x="6" y="4" width="2" height="2" fill="#f0f040"/>
      <rect x="12" y="4" width="2" height="2" fill="#f0f040"/>
      <rect x="7" y="5" width="1" height="1" fill="#1a1010"/>
      <rect x="13" y="5" width="1" height="1" fill="#1a1010"/>
      <!-- Mouth dripping radiation -->
      <rect x="7" y="6" width="6" height="2" fill="#3a3a00"/>
      <rect x="9" y="8" width="1" height="2" fill="#d0f040" opacity="${0.6+glow*0.3}"/>
      <!-- Body with growths -->
      <rect x="4" y="8" width="12" height="11" fill="#3a4020"/>
      <rect x="3" y="10" width="2" height="4" fill="#5a5a20"/>
      <rect x="15" y="11" width="2" height="3" fill="#5a5a20"/>
      <!-- Radiation patches -->
      <rect x="6" y="11" width="3" height="3" fill="#d0f040" opacity="${0.5+glow*0.3}"/>
      <rect x="10" y="13" width="4" height="2" fill="#d0f040" opacity="${0.5+glow*0.3}"/>
      <!-- Arms -->
      <rect x="0" y="10" width="4" height="3" fill="#5a5a20"/>
      <rect x="0" y="13" width="3" height="2" fill="#5a5a20"/>
      <rect x="16" y="10" width="4" height="3" fill="#5a5a20"/>
      <rect x="17" y="13" width="3" height="2" fill="#5a5a20"/>
      <!-- Legs -->
      <rect x="5" y="19" width="4" height="7" fill="#2a2818"/>
      <rect x="11" y="19" width="4" height="7" fill="#2a2818"/>
      <rect x="4" y="26" width="5" height="3" fill="#1a1808"/>
      <rect x="11" y="26" width="5" height="3" fill="#1a1808"/>
      <!-- Glowing aura particles -->
      <rect x="1" y="18" width="1" height="1" fill="#d0f040" opacity="${glow*0.8}"/>
      <rect x="18" y="22" width="1" height="1" fill="#d0f040" opacity="${glow*0.8}"/>
      <rect x="9" y="0" width="1" height="1" fill="#d0f040" opacity="${glow*0.6}"/>
    </svg>`;
  },

  titan: (frame=0) => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 36" width="84" height="108" shape-rendering="crispEdges">
      <!-- Enormous head with horns -->
      <rect x="9" y="2" width="10" height="2" fill="#1a1008"/>
      <rect x="8" y="4" width="12" height="8" fill="#2a1814"/>
      <!-- Horn protrusions -->
      <rect x="6" y="0" width="3" height="4" fill="#d0c0a0"/>
      <rect x="19" y="0" width="3" height="4" fill="#d0c0a0"/>
      <rect x="6" y="4" width="2" height="2" fill="#d0c0a0"/>
      <rect x="20" y="4" width="2" height="2" fill="#d0c0a0"/>
      <!-- Pure black eye sockets with red pinprick -->
      <rect x="9" y="6" width="3" height="3" fill="#000"/>
      <rect x="16" y="6" width="3" height="3" fill="#000"/>
      <rect x="10" y="7" width="1" height="1" fill="#f00000"/>
      <rect x="17" y="7" width="1" height="1" fill="#f00000"/>
      <!-- Massive maw -->
      <rect x="7" y="10" width="14" height="3" fill="#1a0000"/>
      <rect x="8" y="10" width="2" height="3" fill="#d0c0a0"/>
      <rect x="11" y="10" width="2" height="3" fill="#d0c0a0"/>
      <rect x="14" y="10" width="2" height="3" fill="#d0c0a0"/>
      <rect x="17" y="10" width="2" height="3" fill="#d0c0a0"/>
      <!-- Massive torso -->
      <rect x="3" y="12" width="22" height="14" fill="#1e1810"/>
      <!-- Chest plates -->
      <rect x="5" y="14" width="18" height="2" fill="#3a2418"/>
      <rect x="5" y="18" width="18" height="2" fill="#3a2418"/>
      <rect x="6" y="22" width="16" height="2" fill="#3a2418"/>
      <!-- Glowing chest core -->
      <rect x="12" y="16" width="4" height="4" fill="#f04000" opacity="${0.7+(frame%2)*0.3}"/>
      <rect x="13" y="17" width="2" height="2" fill="#f0a000" opacity="0.9"/>
      <!-- Giant arms -->
      <rect x="0" y="14" width="4" height="14" fill="#2a1814"/>
      <rect x="24" y="14" width="4" height="14" fill="#2a1814"/>
      <rect x="0" y="26" width="5" height="4" fill="#2a1814"/>
      <rect x="23" y="26" width="5" height="4" fill="#2a1814"/>
      <!-- Boulder fists -->
      <rect x="0" y="30" width="6" height="4" fill="#3a2418"/>
      <rect x="22" y="30" width="6" height="4" fill="#3a2418"/>
      <!-- Bone spikes on fists -->
      <rect x="0" y="28" width="1" height="2" fill="#d0c0a0"/>
      <rect x="5" y="28" width="1" height="2" fill="#d0c0a0"/>
      <rect x="22" y="28" width="1" height="2" fill="#d0c0a0"/>
      <rect x="27" y="28" width="1" height="2" fill="#d0c0a0"/>
      <!-- Massive legs -->
      <rect x="5" y="26" width="8" height="8" fill="#1a1408"/>
      <rect x="15" y="26" width="8" height="8" fill="#1a1408"/>
      <rect x="4" y="34" width="9" height="2" fill="#000"/>
      <rect x="15" y="34" width="9" height="2" fill="#000"/>
    </svg>`;
  },
};

// ─── DEAD ZONE STYLE PALETTE (additional) ────────────────────────────────────
ZI_ART.deadZoneCSS = `
  .dz-panel {
    background: linear-gradient(180deg, #2a261c 0%, #1e1c14 100%);
    border: 1px solid #4a4030;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 0 #0a0a08;
  }
  .dz-corner-bolt {
    position: absolute; width: 6px; height: 6px;
    background: radial-gradient(circle, #6a5040 0%, #2a1e14 60%);
    border-radius: 50%;
  }
  .dz-trim-top    { position: absolute; top:0; left:0; right:0; height:2px; background: linear-gradient(90deg, transparent, #6a5848, transparent); }
  .dz-trim-bottom { position: absolute; bottom:0; left:0; right:0; height:2px; background: linear-gradient(90deg, transparent, #4a3828, transparent); }
`;

// ─── MATERIAL ECONOMY ─── ZI_MATERIALS (the six base materials) is defined in game/economy.js.

// ─── FORT GATE SCENE (Hearthguard palisade; brief §10.4) ─────────────────────
window.FortGateScene = function FortGateScene({ onClose }) {
  const ZI = window.ZI;
  const q = ZI.getFallowQuest();
  const hostile = ZI._rj('zi_fort_hostile', false);
  const pol = ZI.getPolicy().id;
  // Quest eligibility is checked once, when the gate dialogue opens (brief 12.6 #1).
  const [elig] = React.useState(() => ZI.fortQuestEligibility());
  const [step, setStep] = React.useState(hostile ? 'hostile' : q.state === 'ready' ? 'turnin' : (q.state === 'active' || q.state === 'done') ? 'return' : 'approach');
  const [res, setRes] = React.useState(null);
  const [confirmAtk, setConfirmAtk] = React.useState(false);
  const act = (fn) => { const r = fn(); setRes(r); if (r.next) setStep(r.next); };
  const box = (lines) => <pre style={{ margin:0, whiteSpace:'pre-wrap', fontFamily:'var(--font-mono)', fontSize:13, lineHeight:1.55, color:'var(--text)', background:'#0b0a08', border:'1px solid #6a5436', padding:'10px 12px' }}>{lines}</pre>;
  const Btn = ({ onClick, children, danger, disabled, sub }) => (
    <button disabled={disabled} onClick={onClick} style={{ display:'block', width:'100%', textAlign:'left', padding:'8px 11px', cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1,
      background:'var(--bg3)', border:`1px solid ${danger ? '#ff3b3b' : '#6a5436'}`, color: danger ? '#ff6a5a' : 'var(--text)', fontFamily:'var(--font-mono)', fontSize:13 }}>
      <span>&gt; {children}</span>{sub && <span style={{ display:'block', fontSize:11, color:'var(--text2)', marginTop:2 }}>{sub}</span>}
    </button>);
  const f = ZI.getFortPos() || {};
  const hasKit = ZI.hasMedKit();
  return (
    <div style={{ position:'absolute', inset:0, zIndex:95, background:'rgba(0,0,0,0.82)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div className="panel" style={{ width:'100%', maxWidth:500, maxHeight:'calc(100% - 32px)', overflowY:'auto', padding:16, background:'var(--bg2)', borderColor:'#8a6a3a', display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#f0d060', letterSpacing:'0.12em' }}>[TRAVERSAL {f.coord}] · THE HEARTHGUARD'S FORT</span>
          <button onClick={onClose} style={{ marginLeft:'auto', background:'none', border:'1px solid var(--border)', color:'var(--text2)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:12, padding:'2px 8px' }}>✕</button>
        </div>
        {step === 'approach' && (<>
          {box('> Structure sighted: PALISADE\n  A ring of sharpened wooden pikes. Perimeter fencing, patched and tied.\n  Smoke behind it. A watchtower. One gate.')}
          <Btn onClick={() => setStep('gate')}>APPROACH</Btn>
          <Btn onClick={onClose}>LEAVE</Btn>
        </>)}
        {step === 'gate' && (<>
          {box('GUARD: "Far enough. Nobody comes past the pikes without a reason.\n        What do you have that we want?"\n\n' + (!elig.ok ? 'GUARD: "Not here. Move on."' : 'GUARD: "' + ZI.fortTone() + '"'))}
          {elig.ok && <Btn onClick={() => act(ZI.fortOffer)} disabled={!hasKit} sub={hasKit ? 'Costs the heal charges it carries. Medicine is what they need.' : '"Medicine. Bring medicine." — craft a Field Medkit, or talk your way in.'}>OFFER: Field Medkit</Btn>}
          {elig.ok && <Btn onClick={() => act(() => ZI.fortCheck('diplomat'))} sub={`Read the guard, ask for terms · ${ZI.fortCheckChance('diplomat')}% · harder terms: keep your kit, 60 kills, less standing`}>TALK: Diplomat check</Btn>}
          {elig.ok && <Btn onClick={() => act(() => ZI.fortCheck('command'))} sub={`Hold your ground · ${ZI.fortCheckChance('command')}% · harder terms: keep your kit, 60 kills, less standing`}>TALK: Command check</Btn>}
          <Btn onClick={onClose}>LEAVE</Btn>
          {!confirmAtk
            ? <Btn danger onClick={() => setConfirmAtk(true)} sub={`Risk: HIGH · ${ZI.fortAttackChance()}% · unlocks Heinous if it works`}>ATTACK THE GUARD</Btn>
            : <div style={{ border:'1px solid #ff3b3b', padding:10, background:'rgba(255,59,59,0.08)' }}>
                <div style={{ fontFamily:'var(--font-body)', fontSize:14, color:'var(--text)', marginBottom:8 }}>This cannot be undone. The Hearthguard will be hostile. Failure leaves a lasting injury.</div>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn" onClick={() => setConfirmAtk(false)}>Back off</button>
                  <button className="btn" style={{ borderColor:'#ff3b3b', color:'#ff6a5a' }} onClick={() => { setConfirmAtk(false); act(ZI.fortAttack); }}>Go for the guard</button>
                </div>
              </div>}
        </>)}
        {step === 'offer' && (<>
          {box('MYTHICAL JESTER: "There\'s a field south of here, crawling with the dead.\n                 Clear it and the gate opens."\n\n  QUEST: FALLOW GROUND' + (ZI.getFallowQuest().harder ? '  (harder terms)' : '') + '\n  Clear ' + (f.fallow ? f.fallow.coord : 'the field') + ' — ' + ZI.fallowGoal() + ' kills while stationed there.\n  Reward: access to the factions, +' + ZI.fallowTerms().rep + ' Hearthguard standing on turn-in.' + (ZI.getFallowQuest().terms === 'check' ? '\n  You keep your med kit. The guard keeps an eye on you.' : ''))}
          <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text2)' }}>Travel to 🌾 {f.fallow && f.fallow.coord}, then let your survivor Wander there. Cleared ground is calmer ground.</div>
          <Btn onClick={onClose}>ACCEPT QUEST</Btn>
        </>)}
        {step === 'return' && (<>
          {box(q.state === 'done'
            ? (q.terms === 'check' ? 'GUARD: "Mythical Jester vouches for you. I\'m still watching."' : 'GUARD: "Welcome back. Mythical Jester says you\'re one of us now."')
            : (q.terms === 'check' ? 'GUARD: "' + ZI.fallowProgress() + ' of ' + ZI.fallowGoal() + '. You talked your way in; now earn it."\n  The guard doesn\'t take their eyes off you.' : 'GUARD: "Field\'s not clear yet. ' + ZI.fallowProgress() + ' of ' + ZI.fallowGoal() + '. Keep at it."'))}
          <Btn onClick={onClose}>LEAVE</Btn>
        </>)}
        {step === 'turnin' && (<>
          {box((ZI.getFallowQuest().terms === 'check' ? 'GUARD: "Huh. You actually did it."' : 'GUARD: "Word came from the south field. It\'s quiet out there."') + '\n        "Mythical Jester wants to see you."\n\n  The gate swings open. From the inside, the pikes lean outward over\n  a ditch; the perimeter fence is lashed wire and old doors.')}
          {ZI.inFortCell()
            ? <Btn onClick={() => act(ZI.fortTurnIn)}>TURN IN: FALLOW GROUND</Btn>
            : <Btn disabled sub={`Travel into the Fort's cell (${f.coord}) to report.`}>TURN IN: FALLOW GROUND</Btn>}
        </>)}
        {step === 'crate' && (<>
          {box('MYTHICAL JESTER: "You cleared the south field. That is more than most would do\n                 for a stranger' + (ZI.getFallowQuest().terms === 'check' ? ' who talked their way to our gate."' : ' with a satchel of medicine."') + '\n\n  At the field\'s edge you found a SEALED CRATE, stamped with a\n  laboratory mark nobody here recognises.\n\nMYTHICAL JESTER: "That mark is not ours. Somebody built this. Find out who."\n  Mythical Jester unrolls a hand-drawn map. "Five other groups live between here\n  and the ridge. We trade with some. We fear one."')}
          <Btn onClick={onClose} sub={`A survey team was seen near ${(ZI.getSurveyPoint() || {}).coord || 'the ridge'}. Your Factions page is open.`}>CONTINUE</Btn>
        </>)}
        {step === 'hostile' && (<>
          {box('A horn sounds from the watchtower. Bows rise along the pikes.\n  The Hearthguard remember what you did.')}
          <Btn onClick={onClose}>LEAVE</Btn>
        </>)}
        {res && <div style={{ whiteSpace:'pre-wrap', fontFamily:'var(--font-body)', fontSize:14, lineHeight:1.5, padding:'8px 10px', border:`1px solid ${res.tone === 'good' ? 'var(--green)' : 'var(--amber)'}`, color: res.tone === 'good' ? 'var(--green)' : 'var(--amber)' }}>{res.text}</div>}
        {step === 'done' && <Btn onClick={onClose}>CONTINUE</Btn>}
      </div>
    </div>
  );
};

// ─── ACTIVE CONTROLS (Batch 2B, spec 13): buttons + discovery prompt + stress. Rules live in game/active.js. ───
window.ActiveControls = function ActiveControls({ onLog, setScreen }) {
  const Z = window.ZI, A = Z.ACTIVE_TABLE;
  const [, tick] = React.useState(0);
  React.useEffect(() => { const t = setInterval(() => tick(n => n + 1), 500); const off = Z.onInventoryChange ? Z.onInventoryChange(() => tick(n => n + 1)) : null; return () => { clearInterval(t); off && off(); }; }, []);
  const run = Z.getWanderRun(), ch = Z.chargeTotals(), stress = Z.getStress(), stage = Z.stressStage(stress), p = run.prompt;
  const act = (fn, ok) => { const r = Z.wanderAct(fn); if (!r) return; if (r.ok === false) onLog(r.fumbled ? '✋ ' + r.reason : '⚠ ' + r.reason, 'enemy'); else ok && onLog(ok(r), 'player'); tick(n => n + 1); };
  const mono = { fontFamily:'var(--font-mono)', fontSize:12, padding:'6px 11px', cursor:'pointer', whiteSpace:'nowrap' };
  const btn = (label, onClick, opts) => {
    opts = opts || {}; const dis = !!opts.disabled, c = opts.color || 'var(--amber)';
    return <button onClick={dis ? undefined : onClick} disabled={dis} title={opts.title} style={{ ...mono, cursor: dis ? 'not-allowed' : 'pointer', background: dis ? 'var(--bg4)' : 'transparent', color: dis ? 'var(--text3)' : c, border:`1px solid ${dis ? 'var(--border)' : c}` }}>{label}</button>;
  };
  const stColor = stage.id === 'calm' ? 'var(--green)' : stage.id === 'strained' ? 'var(--amber)' : 'var(--red2)';
  const hold = run.retreatHold, busy = run.resting || run.withdrawing || !!hold;
  const label = p ? A.riskLabels[Z.promptLabelTier(p)] : null;
  const live = p && p.createdLive && !hold;
  // RB2: the retreat rules are not edited on this screen (parked for the shop); the scene shows them while resting.
  return (
    <>
      {btn(`⛑ Heal ${ch.heal}`, () => act(s => Z.wanderHeal(s), r => `⛑ +${r.healed} HP (${r.source === 'base' ? 'base charge' : 'med kit'}).`), { disabled: ch.heal <= 0, color:'var(--green)', title:`Base ${ch.baseHeal} + kits ${ch.kitHeal}. Base charges refill after resting at base or camp.` })}
      {btn(`👁 Scout ${ch.scout}`, () => act(s => Z.wanderScout(s), r => r.prompt.reduced ? '👁 Scouted: you found a safer way in (risk −1 tier).' : r.prompt.oddsShown ? '👁 Scouted: exact odds revealed.' : '👁 Scouted: true risk confirmed.'), { disabled: ch.scout <= 0 || !live || p.scouted, title: live ? 'Scout this discovery' : 'Scout works on a discovery prompt' })}
      {btn(`⏫ Push On ${run.pressure || 0}/${A.push.maxPressure}`, () => act(s => Z.wanderPushOn(s), r => `⏫ Pushing on — pressure ${r.pressure}/${A.push.maxPressure}: more and tougher encounters.`), { disabled: busy || (run.pressure || 0) >= A.push.maxPressure, color:'var(--red2)' })}
      {btn('🔀 Change Route', () => { act(s => Z.wanderChangeRoute(s), () => `🔀 Changing route (+${A.changeRoute.stress} stress, ${A.changeRoute.moveStepSec}s of travel).`); setScreen && setScreen('traversal'); }, { disabled: busy, title:'Pick a new zone on the Traversal map' })}
      <span title={`Stress ${Math.round(stress)}/100 — ${stage.name}`} style={{ display:'flex', alignItems:'center', gap:6, fontFamily:'var(--font-mono)', fontSize:12, color: stColor, minWidth:150 }}>
        Stress {Math.round(stress)} · {stage.name}
        <span style={{ flex:1, minWidth:50, height:6, background:'var(--bg4)' }}><span style={{ display:'block', height:'100%', width: Math.min(100, stress) + '%', background: stColor }}/></span>
      </span>
      {hold && (
        <div role="dialog" data-retreat-hold="1" style={{ flexBasis:'100%', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', padding:'8px 10px', border:'1px solid var(--red2)', background:'rgba(255,80,60,0.08)' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--red2)' }}>⚠ {hold.text}</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text2)' }}>{Math.max(0, Math.ceil(hold.expiresInMs / 1000))}s · then return · patrol on hold</span>
          <span style={{ display:'flex', gap:6, marginLeft:'auto' }}>
            {btn('Return now', () => act(s => Z.retreatHoldResolve(s, 'return', null, []), r => '↩ ' + r.text), { color:'var(--amber)' })}
            {btn('Push on', () => act(s => Z.retreatHoldResolve(s, 'pushon', null, []), r => '⏵ ' + r.text), { color:'var(--text)' })}
          </span>
        </div>
      )}
      {live && (
        <div role="dialog" style={{ flexBasis:'100%', display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', padding:'8px 10px', border:'1px solid #f0d060', background:'rgba(240,208,96,0.08)' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'#f0d060' }}>🏚 {p.name} sighted · Risk: {label}{p.oddsShown ? ` · ${A.riskOdds[p.riskTier]}% · reward tier ${p.riskTier + 1}` : ''}</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--text2)' }}>{Math.max(0, Math.ceil(p.expiresInMs / 1000))}s · then policy decides</span>
          <span style={{ display:'flex', gap:6, marginLeft:'auto' }}>
            {btn('Venture closer', () => act(s => Z.resolvePrompt(s, 'venture', null, Math.random), r => r.text), { color:'#f0d060' })}
            {btn('Move on', () => act(s => Z.resolvePrompt(s, 'moveon', null, Math.random), r => r.text), { color:'var(--text)' })}
          </span>
        </div>
      )}
    </>
  );
};

// ─── SATELLITE MAP TRAVERSAL ─────────────────────────────────────────────────
window.SatelliteTraversalScreen = function SatelliteTraversalScreen({ setScreen, setActiveRoute }) {
  const ZI = window.ZI;
  const [activeType, setActiveType] = React.useState('scavenge');
  const [hoveredSquare, setHoveredSquare] = React.useState(null);
  const [selectedSquare, setSelectedSquare] = React.useState(null);
  const [selectedSurvivors, setSelectedSurvivors] = React.useState([1]);

  // Map types - each has its own grid of destination squares
  const mapTypes = [
    { id:'scavenge',  label:'Scavenge', color:'#e6c47e', icon:'🗺️' },
    { id:'contract',  label:'Contracts', color:'#c894ff', icon:'🤝' },
    { id:'training',  label:'Training',  color:'#a2dca2', icon:'💪' },
    { id:'patrol',    label:'Patrol',    color:'#74b6ee', icon:'🛡️' },
    { id:'raid',      label:'Raid',      color:'#f08a52', icon:'⚔️' },
  ];

  // Seeded world: sectors of 8×6 cells; cells are generated from the world seed.
  const COLS = ZI.SECTOR_COLS, ROWS = ZI.SECTOR_ROWS;
  const readJ = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
  const writeJ = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const worldSeed = ZI.worldSeed();
  // ── Outbreak start: persisted random starting cell + "You are Here" ──
  const [pos, setPos] = React.useState(() => {
    let p = readJ('zi_trav_pos', null);
    if (p && p.gx == null && p.row != null) { p = ZI.zoneFromCell(ZI.worldCell(p.col, p.row, 'scavenge')); writeJ('zi_trav_pos', p); } // migrate old saves
    if (!p) {
      const open = [];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) { const q = ZI.worldCell(c, r, 'scavenge'); if (q.state !== 'locked') open.push(q); }
      const pick = open[Math.floor(Math.random() * open.length)] || ZI.worldCell(0, 0, 'scavenge');
      p = ZI.zoneFromCell(pick);
      writeJ('zi_trav_pos', p); writeJ('zi_trav_start', p);
    }
    return p;
  });
  const [view, setView] = React.useState(() => ({ sx: pos.sx || 0, sy: pos.sy || 0 }));
  // Smoke-test fix (Oct 20): follow moves the game makes itself (forced retreat home, return after a Base rest).
  React.useEffect(() => ZI.onTravPosChange ? ZI.onTravPosChange(() => { const p = readJ('zi_trav_pos', null); if (p && p.gx != null) { setPos(p); setView({ sx: p.sx || 0, sy: p.sy || 0 }); } }) : undefined, []);
  const [explored, setExplored] = React.useState(() => ZI.getExploredSectors());
  const squares = React.useMemo(() => {
    const list = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) list.push(ZI.worldCell(view.sx * COLS + c, view.sy * ROWS + r, activeType));
    return list;
  }, [activeType, view.sx, view.sy, worldSeed, questTick]); // questTick: kills/quest terms change cleared state

  const biomeColors = {
    mountain:  { fill:'#1a2818', stroke:'#3a5028' },
    suburbia:  { fill:'#2a2218', stroke:'#4a3828' },
    metro:     { fill:'#1c1a20', stroke:'#3a3848' },
    perimeter: { fill:'#1e1024', stroke:'#3a1854' },
  };

  const stateColors = {
    available: '#a2dca2',
    cleared:   '#a39478',
    contested: '#f08a52',
    locked:    '#3a3228',
  };

  const survivors = [
    { id:1, name:'Mira Chen',    class:'mechanic',  level:8,  status:'idle' },
    { id:2, name:'Buck Talon',   class:'enforcer',  level:11, status:'idle' },
    { id:3, name:'Petra Voss',   class:'medic',     level:7,  status:'busy' },
    { id:4, name:'Yael Strom',   class:'ranger',    level:14, status:'idle' },
  ];

  const sq = selectedSquare || hoveredSquare;

  const [camp, setCamp] = React.useState(() => readJ('zi_trav_camp', null));
  const [looted, setLooted] = React.useState(() => readJ('zi_trav_looted', {}));
  const [scouted, setScouted] = React.useState(() => readJ('zi_trav_scouted', {}));
  const [actionCell, setActionCell] = React.useState(null);
  const [actionResult, setActionResult] = React.useState(null);
  const [fortOpen, setFortOpen] = React.useState(false);
  const [questTick, setQuestTick] = React.useState(0);
  React.useEffect(() => { ZI.getFortPos(); setQuestTick(t => t + 1); const t = setInterval(() => setQuestTick(x => x + 1), 3000); return () => clearInterval(t); }, []);
  const fortPos = ZI.getFortPos();
  const fallowQ = ZI.getFallowQuest();
  // TRAV-01a (Sam, Oct 21: T5, S7): Camp Leader controls show only in Camp Leader mode. Solo reads the active save's mode.
  const isCampMode = ((ZI.getActiveSlot && ZI.getActiveSlot()) || {}).mode === 'camp';
  const [travTick, setTravTick] = React.useState(0);           // re-render after a scout, XP or Hide changes stored state
  React.useEffect(() => { const t = setInterval(() => setTravTick(x => x + 1), 60000); return () => clearInterval(t); }, []);
  const [hideSeen, setHideSeen] = React.useState({});           // cell key → last Hide result this session (panel "Threats" line)
  const [sheetMode, setSheetMode] = React.useState(false);      // T13: touch opens the zone panel as a bottom sheet
  // TRAV-01a fix 2 (Oct 25): below 760 px the three desktop columns left the map 4 px wide, so no cell could be tapped and the
  // bottom sheet never opened. Solo stacks instead: map first at full width, afflictions and resources below, no side column
  // (the bottom sheet replaces it). Camp Leader keeps its layout. Same 760 px breakpoint as Wandering.
  const [travNarrow, setTravNarrow] = React.useState(() => (window.innerWidth || 1024) < 760);
  React.useEffect(() => { const f = () => setTravNarrow((window.innerWidth || 1024) < 760); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  const lastPointer = React.useRef('mouse');                    // 'mouse' | 'touch' | 'pen' | 'controller'
  const [hl, setHl] = React.useState(null);                     // controller/keyboard highlight { gx, gy }
  const [panelFocus, setPanelFocus] = React.useState(null);     // TRAV-01a fix 1 (PF11): controller focus inside the zone panel, by item id ('__first__' = first enabled)
  const sheetTouchY = React.useRef(null);
  const [tutStep, setTutStep] = React.useState(() => ZI.tutDone('zi_trav_tutorial_done') ? -1 : 0);
  const shortWait = (ms) => { const total = Math.max(1, Math.ceil(ms / 60000)), h = Math.floor(total / 60), m = total % 60; return h ? `${h}h ${m}m` : `${m}m`; };
  const hideUses = ZI.getHideUses ? ZI.getHideUses() : { left:2, max:2, nextAt:null };
  const campCooldown = ZI.getCampCooldown ? ZI.getCampCooldown() : { available:true, remainingMs:0 };
  // Grid helpers take the VIEWED sector's local (r,c) and compare in global coords.
  const gOf = (r, c) => ({ gx: view.sx * COLS + c, gy: view.sy * ROWS + r });
  const keyG = (gx, gy) => gy + '-' + gx; // sector 0 keys match older saves
  const cellKey = (r, c) => { const g = gOf(r, c); return keyG(g.gx, g.gy); };
  const isAdjacent = (r, c) => { const g = gOf(r, c); return Math.max(Math.abs(g.gx - pos.gx), Math.abs(g.gy - pos.gy)) === 1; };
  const isHere = (r, c) => { const g = gOf(r, c); return g.gx === pos.gx && g.gy === pos.gy; };
  const isHereCell = (cell) => cell.gx === pos.gx && cell.gy === pos.gy;
  const isAdjCell = (cell) => Math.max(Math.abs(cell.gx - pos.gx), Math.abs(cell.gy - pos.gy)) === 1;
  const sectorTag = (sx, sy) => ZI.sectorLabel(sx, sy);
  const posLabel = String.fromCharCode(65 + pos.col) + (pos.row + 1) + ((pos.sx || pos.sy) ? ' · ' + sectorTag(pos.sx, pos.sy) : '');
  const inPlayerSector = view.sx === pos.sx && view.sy === pos.sy;
  // Cardinal sector navigation — a new sector only generates when the survivor stands
  // within 1 cell of it (on that edge of their own sector). Explored sectors reopen freely.
  const DIRS = { n:{ dx:0, dy:-1, label:'North', arrow:'▲' }, s:{ dx:0, dy:1, label:'South', arrow:'▼' }, w:{ dx:-1, dy:0, label:'West', arrow:'◀' }, e:{ dx:1, dy:0, label:'East', arrow:'▶' } };
  const canView = (d) => {
    const t = { sx: view.sx + DIRS[d].dx, sy: view.sy + DIRS[d].dy };
    if (t.sx === pos.sx && t.sy === pos.sy) return { ok:true };
    if (explored.includes(t.sx + ',' + t.sy)) return { ok:true };
    if (!inPlayerSector) return { ok:false, why:'Return to your own sector first.' };
    const nearEdge = d === 'n' ? pos.row === 0 : d === 's' ? pos.row === ROWS - 1 : d === 'w' ? pos.col === 0 : pos.col === COLS - 1;
    return nearEdge ? { ok:true } : { ok:false, why:`Move to the ${DIRS[d].label.toLowerCase()} edge of this sector to scout beyond it.` };
  };
  const goView = (d) => {
    const chk = canView(d); if (!chk.ok) return;
    const t = { sx: view.sx + DIRS[d].dx, sy: view.sy + DIRS[d].dy };
    ZI.markSectorExplored(t.sx, t.sy); setExplored(ZI.getExploredSectors());
    setView(t); setSelectedSquare(null); setHoveredSquare(null);
  };

  const TUTORIAL = [
    { title:'Day One of the Outbreak', body:'The grid is the land around you, seen from above. Each cell is a zone: homes, stores, depots. Some are locked until you push further out. The arrows around the map show the next sector over, once you stand on that edge.' },
    { title:'You are Here', body:`Your survivor starts at ${posLabel}, marked with the pulsing ◉ YOU ARE HERE pin. Every outbreak drops you somewhere new. Smoke rises from a palisade nearby: the 🏰 Fort.` },
    { title:'Move one zone at a time', body:'The zones touching yours glow with a dashed outline. Click one of them to decide what to do there.' },
    { title:'Choose how to survive', body:'Travel moves you in. Loot grabs supplies once per zone. Scout reveals the danger first. Make Camp moves you in and sets a safe rest point. Hide shows which threats roam the zone.' },
  ];
  const closeTutorial = () => { setTutStep(-1); setTutPoint(false); ZI.setTutDone('zi_trav_tutorial_done'); };
  // Tutorial beat 2: exploring the action menu progressively darkens the screen,
  // then the spotlight moves up to the Wandering tab in the top bar.
  const [tutHover, setTutHover] = React.useState([]);
  const [tutPoint, setTutPoint] = React.useState(false);
  const inTutMenu = tutStep === 3 && !!actionCell;
  const noteTutHover = (id) => {
    if (!inTutMenu || tutHover.includes(id)) return;
    const next = [...tutHover, id];
    setTutHover(next);
    if (next.length >= 5) setTimeout(() => { setActionCell(null); setTutPoint(true); }, 700);
  };
  const [wanderRect, setWanderRect] = React.useState(null);
  const [tutTarget, setTutTarget] = React.useState('wandering'); // which top-bar tab the spotlight points at
  const TUT_TARGETS = {
    wandering: { label:'Wandering', screen:'hack-slash', title:'Now go Wandering', body:'Your survivor patrols the zone you\'re standing in, fighting and looting on their own while you\'re away.' },
    routes:    { label:'Routes',    screen:'solo-main', title:'Loot runs happen on Routes', body:'Pick a route through a biome to scavenge supplies. Longer, riskier routes bring back better loot.' },
  };
  const tgt = TUT_TARGETS[tutTarget];
  // Only a real, visible top-bar tab — skip the hidden measuring copies used for overflow.
  const findWanderBtn = () => [...document.querySelectorAll('button')].find(b => {
    if ((b.textContent || '').trim().toLowerCase() !== tgt.label.toLowerCase()) return false;
    if (b.closest('[aria-hidden="true"]')) return false;
    const r = b.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && getComputedStyle(b).visibility !== 'hidden';
  });
  React.useEffect(() => {
    if (!tutPoint) return;
    const measure = () => { const b = findWanderBtn(); if (b) { const r = b.getBoundingClientRect(); setWanderRect({ x:r.left, y:r.top, w:r.width, h:r.height }); } };
    measure();
    const t = setInterval(measure, 400);
    window.addEventListener('resize', measure);
    return () => { clearInterval(t); window.removeEventListener('resize', measure); };
  }, [tutPoint, tutTarget]);
  const finishTutorialToWander = () => {
    const screenId = tgt.screen;
    closeTutorial();
    // Navigate directly — works even if the tab is tucked inside the "▾ More" dropdown.
    if (setScreen) setScreen(screenId);
    else { const b = findWanderBtn(); if (b) b.click(); }
  };

  const MAT_KEYS = ['metal','wood','cloth','electronics','fuel','medical'];
  const grantRandomMats = (tier) => {
    const M = window.ZI_MATERIALS || {}; const got = [];
    const n = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      const k = MAT_KEYS[Math.floor(Math.random() * MAT_KEYS.length)];
      const amt = 2 + Math.floor(Math.random() * (4 + tier * 2));
      if (M[k]) { M[k].current = Math.min(M[k].max, M[k].current + amt); got.push(`+${amt} ${M[k].name}`); }
    }
    return got;
  };
  const doAction = (id, cell) => {
    const key = keyG(cell.gx, cell.gy);
    const coord = cell.coord + ((cell.sx || cell.sy) ? ' · ' + sectorTag(cell.sx, cell.sy) : '');
    const ck = cell.gx + ',' + cell.gy; // TRAV-01a: per-cell daily XP key
    let res;
    if (cell.state === 'locked') { setActionResult({ tone:'warn', text:'Locked zone.' }); return; }
    if (!isHereCell(cell) && !isAdjCell(cell)) { setActionResult({ tone:'warn', text:'Too far — move next to it.' }); return; }
    if (id === 'camp' && !campCooldown.available) { setActionResult({ tone:'warn', text:`Make Camp is ready in ${shortWait(campCooldown.remainingMs)}.` }); return; }
    if (id === 'hide' && hideUses.left <= 0) { setActionResult({ tone:'warn', text:`Hide is ready in ${shortWait(Math.max(0, hideUses.nextAt - ZI.clockNow()))}.` }); return; }
    if (id.indexOf('infiltrate-') === 0) {
      const result = ZI.resolveInfiltration(cell, id);
      res = { tone: result.tone || (result.ok ? 'good' : 'warn'), text: result.message };
    } else if (id === 'travel') {
      const p = ZI.zoneFromCell(cell); setPos(p); writeJ('zi_trav_pos', p);
      ZI.clearTravReturn && ZI.clearTravReturn(); // BAL-A D1: the player's own move replaces any saved return
      const xpT = ZI.travEmitOnce('travel', ck, 'move', 2); // TRAV-01a T14: Athletics XP once per cell per real day
      res = { tone:'good', text:`You move into ${cell.name}.${xpT ? ' +Athletics XP.' : ''}` };
    } else if (id === 'loot') {
      if (tutStep >= 0 && tutStep < TUTORIAL.length) setTimeout(() => { setActionCell(null); setTutTarget('wandering'); setTutPoint(true); }, 1600); // TRAV-01a S6: was 'routes'
      if (looted[key]) { res = { tone:'warn', text:`${coord} has already been picked clean.` }; }
      else {
        const chance = ZI.lootSafeChance(cell);
        const roll = Math.floor(Math.random() * 100) + 1;
        const got = grantRandomMats(cell.rmatTier || 0);
        const nl = { ...looted, [key]: true }; setLooted(nl); writeJ('zi_trav_looted', nl);
        if (roll <= chance) {
          ZI.emitAction && ZI.emitAction('loot', 1 + cell.difficulty * 0.3); // Scavenging XP only on a clean search
          res = { tone:'good', text:`Clean search (${chance}% safe, rolled ${roll}). You scavenge ${cell.name}: ${got.join(', ')}. +Scavenging XP.` };
        } else {
          const run = ZI.getWanderRun ? ZI.getWanderRun() : { hp:100 };
          const dmg = ZI.lootFailDamage(cell);
          const hp = Math.max(1, (run.hp == null ? 100 : run.hp) - dmg);
          ZI.syncWanderState && ZI.syncWanderState({ hp });
          ZI.queueWanderLog && ZI.queueWanderLog(`🩸 Hurt while looting ${cell.name}: −${dmg} HP (HP ${hp}/${ZI.maxHp ? ZI.maxHp() : 100}).`); // BAL-A: current max HP
          ZI.emitAction && ZI.emitAction('endure', dmg / 8);
          res = { tone:'warn', text:`Something was waiting (${chance}% safe, rolled ${roll}). You took ${dmg} damage — HP ${hp}/${ZI.maxHp ? ZI.maxHp() : 100} — but got away with ${got.join(', ')}.${hp <= 25 ? ' You\'re badly hurt: make camp to recover.' : ''}` };
        }
      }
    } else if (id === 'scout') {
      // TRAV-01a T1/T10/S1: a separate Traversal pool (5 per real day); Wandering's scout charges are untouched.
      const sp = ZI.spendTravScout();
      if (!sp.ok) { setActionResult({ tone:'warn', text: sp.reason }); setTravTick(t => t + 1); return; }
      const ns = { ...scouted, [key]: true }; setScouted(ns); writeJ('zi_trav_scouted', ns);
      const xpS = ZI.travEmitOnce('scout', ck, 'scout', 1); // P1: Stealth XP once per cell per real day
      const danger = ZI.THREAT_LABELS[Math.min(5, cell.threatLevel)];
      res = { tone:'info', text:`Scouted ${coord}: threat ${danger}, ${cell.biome} terrain, supplies up to RMAT T${cell.rmatTier}. ${looted[key] ? 'Already looted.' : 'Unlooted.'}${xpS ? ' +Stealth XP.' : ' No XP: already earned here today.'} Traversal scouts ${sp.left}/${sp.max} today.` };
    } else if (id === 'camp' && !ZI.canCampAt(cell)) {
      res = { tone:'warn', text:`You can't make camp on ${coord} while Fallow Ground is in progress.` };
    } else if (id === 'camp') {
      const used = ZI.spendCampUse();
      if (!used.ok) { setActionResult({ tone:'warn', text:`Make Camp is ready in ${shortWait(used.remainingMs)}.` }); setTravTick(t => t + 1); return; }
      const p = ZI.zoneFromCell(cell); setPos(p); writeJ('zi_trav_pos', p);
      setCamp(p); writeJ('zi_trav_camp', p);
      ZI.clearTravReturn && ZI.clearTravReturn(); // BAL-A D1
      const xpC = ZI.travEmitOnce('camp', 'any', 'camp', 1); // TRAV-01a T15: Command XP once per real day
      const day = ZI.passTimeToNextMorning ? ZI.passTimeToNextMorning(6) : null;
      // TRAV-01a T15: Make camp no longer sets HP to full or resets healsUsed (it was a free, unlimited full heal).
      // BAL-A O5: Make camp no longer treats the injury (only certain items cure it)
      res = { tone:'good', text:`You make camp at ${coord}.${day ? ` Day ${day} begins.` : ''} This is your new safe rest point: a Forced Retreat brings you here.${xpC ? ' +Command XP.' : ''}` };
    } else if (id === 'hide') {
      const used = ZI.spendHideUse();
      if (!used.ok) { setActionResult({ tone:'warn', text:`Hide is ready in ${shortWait(Math.max(0, used.nextAt - ZI.clockNow()))}.` }); setTravTick(t => t + 1); return; }
      // TRAV-01a T2/S2: Hide reports only what Wandering really uses (threat level and drawable tier range).
      ZI.passTime && ZI.passTime(ZI.TRAVERSAL_TABLE.hideGameHours);
      const th = ZI.hideThreats(cell);
      setHideSeen(m => ({ ...m, [key]: th }));
      const xpH = ZI.travEmitOnce('hide', ck, 'sneak', 1); // P3: XP once per cell per real day
      res = { tone:'info', text:`You stay hidden in ${coord} for 12 game hours. Threat level ${th.threatLevel}/5 (${th.dangerLabel}). Threats here: tiers ${th.range}, the range Wandering can meet right now.${xpH ? ' +Stealth XP.' : ' No XP: already earned here today.'}` };
    }
    setActionResult(res);
    setTravTick(t => t + 1);
  };
  const ACTIONS = [
    { id:'travel', icon:'➜', label:'Travel',    desc:'Move into this zone.' },
    { id:'loot',   icon:'◈', label:'Loot',      desc:'Grab supplies once per zone. A failed roll means you get hurt.' },
    { id:'scout',  icon:'👁', label:'Scout',     desc:'Check the threat and supplies. Uses 1 Traversal scout.' },
    { id:'camp',   icon:'⛺', label:'Make Camp', desc:'Move in and set your rest point.' },
    { id:'hide',   icon:'◌', label:'Hide',      desc:'Stay hidden for 12 game hours. Two uses refill one at a time after 24 real hours.' },
  ];

  // ── TRAV-01a Solo layout: afflictions, preview bar, zone details panel (T4, T13, S5) ──
  const FAM_LABEL = { unexplored:'Unexplored', explored:'Explored', cleared:'Cleared' };
  const previewLine = (c) => `${c.name} · ${FAM_LABEL[ZI.cellFamiliarity(c.gx, c.gy)] || '—'} · Danger ${ZI.THREAT_LABELS[Math.min(5, c.threatLevel || 0)]} (${c.threatLevel || 0}/5)`;
  const hlCell = hl ? ZI.worldCell(hl.gx, hl.gy, 'scavenge') : null;
  const soloPreview = hoveredSquare || hlCell;
  const openSoloPanel = (cell, via) => {
    const p = via || lastPointer.current;
    setSheetMode(p === 'touch' || p === 'pen' || (p !== 'controller' && (window.innerWidth || 1024) < 760));
    setActionCell(cell); setActionResult(null); setPanelFocus(p === 'controller' ? '__first__' : null);
    if (isAdjCell(cell) && tutStep >= 0 && tutStep <= 2) setTutStep(3);
  };
  const closeSoloPanel = () => { setActionCell(null); setActionResult(null); setPanelFocus(null); };
  // Controller / keyboard: arrows (or D-pad) move the highlight, Enter/Space (or A) confirms, Escape (or B) closes.
  const ctlRef = React.useRef({}); ctlRef.current = { hl, view, pos, actionCell, fortOpen, isCampMode, panelFocus, panelMove: (d) => movePanelFocus(d), panelRun: (id) => runPanelItem(id), focusId: () => focusId };
  React.useEffect(() => {
    const move = (dx, dy) => { const c = ctlRef.current; if (c.isCampMode || c.fortOpen) return;
      if (c.actionCell && c.panelFocus) { if (dy) c.panelMove(dy); return; } // TRAV-01a fix 1: focus is in the panel; the map highlight stays put
      const base = c.hl || { gx: c.pos.gx, gy: c.pos.gy };
      const minX = c.view.sx * COLS, minY = c.view.sy * ROWS;
      const inView = base.gx >= minX && base.gx < minX + COLS && base.gy >= minY && base.gy < minY + ROWS;
      const b = inView ? base : { gx: minX, gy: minY };
      setHl({ gx: Math.max(minX, Math.min(minX + COLS - 1, b.gx + dx)), gy: Math.max(minY, Math.min(minY + ROWS - 1, b.gy + dy)) }); };
    const confirm = () => { const c = ctlRef.current; if (c.isCampMode || c.fortOpen || !c.hl) return; lastPointer.current = 'controller'; openSoloPanel(ZI.worldCell(c.hl.gx, c.hl.gy, 'scavenge'), 'controller'); };
    const back = () => { const c = ctlRef.current; if (c.isCampMode || !c.actionCell) return; const had = !!c.panelFocus, cell = c.actionCell; closeSoloPanel(); if (had) setHl({ gx: cell.gx, gy: cell.gy }); };
    const act = () => { const c = ctlRef.current; if (c.isCampMode || c.fortOpen) return; if (c.actionCell && c.panelFocus) { c.panelRun(c.focusId()); return; } if (c.hl && !c.actionCell) confirm(); };
    const onKey = (e) => { const t = e.target && e.target.tagName; if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
      const k = e.key; if (k === 'ArrowUp') move(0, -1); else if (k === 'ArrowDown') move(0, 1); else if (k === 'ArrowLeft') move(-1, 0); else if (k === 'ArrowRight') move(1, 0);
      else if (k === 'Enter' || k === ' ') { const c = ctlRef.current; if (!(c.actionCell && c.panelFocus) && !(c.hl && !c.actionCell)) return; act(); } else if (k === 'Escape') back(); else return;
      e.preventDefault(); };
    window.addEventListener('keydown', onKey);
    let prev = {}; const pad = setInterval(() => { const g = navigator.getGamepads ? [...navigator.getGamepads()].find(Boolean) : null; if (!g) return;
      const pressed = (i) => !!(g.buttons[i] && g.buttons[i].pressed), edge = (i) => { const p = pressed(i), was = prev[i]; prev[i] = p; return p && !was; };
      if (edge(12)) move(0, -1); if (edge(13)) move(0, 1); if (edge(14)) move(-1, 0); if (edge(15)) move(1, 0);
      if (edge(0)) act(); if (edge(1)) back(); }, 120);
    return () => { window.removeEventListener('keydown', onKey); clearInterval(pad); };
  }, []);

  const renderAfflictions = () => {
    const br = ZI.isBroken && ZI.isBroken(), inj = ZI.getInjury && ZI.getInjury(), T = ZI.BROKEN_TABLE, ts = ZI.getTravScouts();
    const row = { display:'flex', alignItems:'flex-start', gap:8, padding:'7px 9px', background:'var(--bg3)', border:'1px solid var(--border)' };
    return (
      <div className="panel" data-trav="afflictions" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div className="panel-title">Afflictions</div>
        <div style={{ flex:1, overflow:'auto', padding:6, display:'flex', flexDirection:'column', gap:5 }}>
          {br && T && <div data-affliction="broken" style={row}><span style={{ fontSize:16, color:'var(--red2)' }}>💔</span><span style={{ flex:1 }}>
            <span style={{ display:'block', fontFamily:'var(--font-body)', fontSize:13, color:'var(--red2)' }}>Broken</span>
            <span style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text2)' }}>Max HP −{Math.abs(T.maxHpPct)}%, {T.attackLossPct}% of attacks falter, +{T.dmgTakenPct}% damage taken, {Math.abs(T.speedPct)}% slower. Recovers through completed rests.</span></span></div>}
          {inj && <div data-affliction="injured" style={row}><span style={{ fontSize:16, color:'var(--amber)' }}>🩹</span><span style={{ flex:1 }}>
            <span style={{ display:'block', fontFamily:'var(--font-body)', fontSize:13, color:'var(--amber)' }}>Injured</span>
            <span style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text2)' }}>Combat and athletics −{Math.round(inj.pct * 100)}%. <b data-injury-time="1">About {Math.max(1, Math.ceil(inj.remainingMs / 60000))} min play time left</b> (counts down only while the game is open). A Field Bandage treats it.</span></span></div>}
          {!br && !inj && <div data-affliction="none" style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)', padding:'6px 4px' }}>No afflictions. Injuries and other conditions show here.</div>}
        </div>
        <div data-trav="scouts" style={{ padding:'6px 9px', borderTop:'1px solid var(--border)', fontFamily:'var(--font-mono)', fontSize:11, color: ts.left > 0 ? 'var(--text2)' : 'var(--red2)' }}>👁 Traversal scouts {ts.left}/{ts.max} today</div>
      </div>
    );
  };

  const renderSoloBar = () => (
    <div className="panel" data-trav="preview-bar" style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 10px', flexShrink:0, flexWrap:'wrap', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)' }}>
      <span data-trav="preview" style={{ flex:1, minWidth:180, color: soloPreview ? 'var(--text)' : 'var(--text3)' }}>{soloPreview ? previewLine(soloPreview) : 'Point at a zone for a quick look. Click, tap or confirm to open its details.'}</span>
      <button data-trav="route-mode" className="btn" disabled title="Route builder coming soon" style={{ padding:'3px 10px', fontSize:11, opacity:0.5, cursor:'not-allowed' }}>Route mode: off</button>
      <span data-trav="route-mode-reason" style={{ fontSize:10, color:'var(--text3)' }}>Route builder coming soon</span>
    </div>
  );

  // TRAV-01a fix 1: one list of panel actions (order and greyed reasons) shared by the panel and the controller.
  const zoneActs = (c) => {
    const key = keyG(c.gx, c.gy), ck = c.gx + ',' + c.gy, here = isHereCell(c), adj = isAdjCell(c), locked = c.state === 'locked';
    const chance = ZI.lootSafeChance(c), ts = ZI.getTravScouts();
    const far = locked ? 'Locked zone.' : (!here && !adj) ? 'Too far — move next to it.' : null;
    const xpNote = (kind, label) => ZI.travXpAvailable(kind, kind === 'camp' ? 'any' : ck) ? `${label} XP once per ${kind === 'camp' ? 'day' : 'zone a day'}` : 'XP already earned today';
    return [
      { id:'travel', icon:'➜', label:'Travel',    reason: here ? "You're already here." : far, cost: `Moves you in · ${xpNote('travel', 'Athletics')}` },
      { id:'loot',   icon:'◈', label:'Loot',      reason: far || (looted[key] ? 'Already looted.' : null), cost: `Once per zone · ${chance}% safe · a failed roll hurts` },
      { id:'scout',  icon:'👁', label:'Scout',     reason: far || (ts.left <= 0 ? 'No Traversal scouts left today. Refills at midnight.' : null), cost: `1 Traversal scout (${ts.left}/${ts.max} today) · ${xpNote('scout', 'Stealth')}` },
      { id:'hide',   icon:'◌', label:'Hide',      reason: far || (hideUses.left <= 0 ? `Ready in ${shortWait(Math.max(0, hideUses.nextAt - ZI.clockNow()))}.` : null), cost: `${ZI.TRAVERSAL_TABLE.hideGameHours} game hours · ${hideUses.left}/${hideUses.max} uses left · each returns after 24h · ${xpNote('hide', 'Stealth')}` },
      { id:'camp',   icon:'⛺', label:'Make Camp', reason: far || (!ZI.canCampAt(c) ? "You can't make camp here while Fallow Ground is in progress." : !campCooldown.available ? `Ready in ${shortWait(campCooldown.remainingMs)}.` : null), cost: `Until 06:00 next game day · 24h refill after use · sets your rest point · ${xpNote('camp', 'Command')}` },
    ].concat((ZI.infiltrationOptions ? ZI.infiltrationOptions(c) : []).map(a => ({ ...a, reason: far || a.reason })));
  };
  const panelItems = (c) => {
    if (!c) return [];
    const here = isHereCell(c), adj = isAdjCell(c);
    return [
      ...(ZI.isFortCell(c) && (here || adj) ? [{ id:'fort', enabled:true }] : []),
      ...zoneActs(c).map(a => ({ id:a.id, enabled:!a.reason })),
      ...(here && setScreen ? [{ id:'wander', enabled:true }] : []),
      { id:'close', enabled:true },
    ];
  };
  const focusOf = (c, want) => { const it = panelItems(c); if (!want || !it.length) return null; return it.some(x => x.id === want) ? want : (it.find(x => x.enabled) || it[it.length - 1]).id; };
  const focusId = actionCell ? focusOf(actionCell, panelFocus) : null;
  const runPanelItem = (id) => { const c = actionCell; if (!c) return; const it = panelItems(c).find(x => x.id === id); if (!it || !it.enabled) return; // greyed: nothing
    if (id === 'fort') { closeSoloPanel(); setFortOpen(true); }
    else if (id === 'wander') setScreen('hack-slash');
    else if (id === 'close') { closeSoloPanel(); setHl({ gx: c.gx, gy: c.gy }); }
    else { noteTutHover(id); doAction(id, c); } };
  const movePanelFocus = (d) => { const it = panelItems(actionCell); if (!it.length) return; const k = Math.max(0, it.findIndex(x => x.id === focusId));
    const next = it[(k + d + it.length) % it.length].id; setPanelFocus(next); if (next !== 'fort' && next !== 'wander' && next !== 'close') noteTutHover(next); };
  React.useEffect(() => { if (panelFocus && focusId && focusId !== panelFocus) setPanelFocus(focusId); }, [panelFocus, focusId]); // pin by id
  React.useEffect(() => { if (!focusId) return; const el = document.querySelector('[data-panel-focus="1"]'); if (el && el.scrollIntoView) el.scrollIntoView({ block:'nearest' }); }, [focusId, actionCell, sheetMode, travTick]);
  const renderZonePanel = () => {
    const c = actionCell;
    if (!c) return (
      <div data-trav="panel-empty" style={{ textAlign:'center', padding:24 }}>
        <div style={{ fontFamily:'var(--font-title)', fontSize:14, color:'var(--text3)', marginBottom:6 }}>Select a zone</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)' }}>Click, tap or confirm a zone to see its details and actions.</div>
      </div>
    );
    const key = keyG(c.gx, c.gy), ck = c.gx + ',' + c.gy, here = isHereCell(c), adj = isAdjCell(c), locked = c.state === 'locked';
    const coord = c.coord + ((c.sx || c.sy) ? ' · ' + sectorTag(c.sx, c.sy) : '');
    const toneColor = { good:'var(--green)', warn:'var(--amber)', info:'#7fe0ff' };
    const fam = ZI.cellFamiliarity(c.gx, c.gy), chance = ZI.lootSafeChance(c), tier = c.rmatTier || 0, ts = ZI.getTravScouts();
    const start = readJ('zi_trav_start', null), seen = hideSeen[key];
    const intel = ZI.getInfiltrationIntel && ZI.getInfiltrationIntel();
    const feats = [ZI.isFortCell(c) && '🏰 Fort', ZI.isFallowCell(c) && '🌾 Fallow Ground', camp && camp.gx === c.gx && camp.gy === c.gy && '⛺ Your camp', start && start.gx === c.gx && start.gy === c.gy && '◎ Starting zone'].filter(Boolean);
    const far = locked ? 'Locked zone.' : (!here && !adj) ? 'Too far — move next to it.' : null;
    const acts = zoneActs(c);
    const line = (label, value, color, attr) => (
      <div data-line={attr} style={{ display:'flex', justifyContent:'space-between', gap:8, fontFamily:'var(--font-mono)', fontSize:11, padding:'2px 0' }}>
        <span style={{ color:'var(--text3)' }}>{label}</span><span style={{ color: color || 'var(--text)', textAlign:'right' }}>{value}</span>
      </div>
    );
    return (
      <div data-trav="zone-panel" data-tick={travTick}>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', letterSpacing:'0.1em' }}>ZONE {coord} · {here ? 'YOU ARE HERE' : adj ? 'NEXT TO YOU' : locked ? 'LOCKED' : 'FAR AWAY'}</div>
        <div style={{ fontFamily:'var(--font-title)', fontSize:18, color:'var(--amber)', margin:'2px 0 8px' }}>{c.name}</div>
        {inTutMenu && (
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, padding:'6px 9px', border:'1px solid #ff3b3b', background:'rgba(255,59,59,0.1)' }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#ff3b3b', letterSpacing:'0.08em' }}>TUTORIAL</span>
            <span style={{ flex:1, fontFamily:'var(--font-body)', fontSize:13, color:'var(--text)' }}>Hover each option to learn it.</span>
            <span style={{ display:'flex', gap:3 }}>{Array.from({ length:5 }).map((_, i) => <span key={i} style={{ width:7, height:7, borderRadius:'50%', background: i < tutHover.length ? '#ff3b3b' : 'var(--bg4)', border:'1px solid #ff3b3b' }}/>)}</span>
          </div>
        )}
        {line('Familiarity', FAM_LABEL[fam] || '—', fam === 'cleared' ? 'var(--green)' : 'var(--text)', 'familiarity')}
        {line('Loot', looted[key] ? 'Looted' : `${chance}% safe · 2–3 supplies, 2–${5 + 2 * tier} each`, looted[key] ? 'var(--text3)' : 'var(--text)', 'loot')}
        {line('Danger', `${ZI.THREAT_LABELS[Math.min(5, c.threatLevel || 0)]} (${c.threatLevel || 0}/5)`, (c.threatLevel || 0) > 3 ? 'var(--red2)' : 'var(--amber)', 'danger')}
        {line('Threats', seen ? `Tiers ${seen.range} (from your last Hide)` : 'Unknown — Hide here to learn', seen ? 'var(--text)' : 'var(--text3)', 'threats')}
        {intel && intel.gx === c.gx && intel.gy === c.gy && line('Intel', `Survey team reported near ${intel.coord}`, '#7fe0ff', 'faction-intel')}
        {line('Features', feats.length ? feats.join(' · ') : 'None', 'var(--text)', 'features')}
        <div className="divider"/>
        <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
          {ZI.isFortCell(c) && (here || adj) && (
            <button data-action="fort" data-panel-focus={focusId === 'fort' ? '1' : undefined} onClick={() => { closeSoloPanel(); setFortOpen(true); }} style={{ boxShadow: focusId === 'fort' ? '0 0 0 2px #7fe0ff inset, 0 0 10px rgba(127,224,255,0.5)' : undefined, display:'flex', alignItems:'center', gap:10, textAlign:'left', padding:'7px 10px', cursor:'pointer', background:'rgba(240,208,96,0.1)', border:'1px solid #f0d060', color:'var(--text)' }}>
              <span style={{ width:24, fontSize:18, textAlign:'center' }}>🏰</span>
              <span style={{ flex:1, fontFamily:'var(--font-body)', fontSize:14 }}>{fallowQ.state === 'ready' ? 'Return to the Fort — turn in Fallow Ground' : 'Approach the palisade'}</span>
            </button>
          )}
          {acts.map(a => (
            <button key={a.id} data-action={a.id} data-panel-focus={focusId === a.id ? '1' : undefined} disabled={!!a.reason} onMouseEnter={() => noteTutHover(a.id)} onFocus={() => noteTutHover(a.id)} onClick={() => { noteTutHover(a.id); if (!a.reason) doAction(a.id, c); }} style={{
              display:'flex', alignItems:'center', gap:10, textAlign:'left', padding:'6px 10px', cursor: a.reason ? 'not-allowed' : 'pointer', opacity: a.reason ? 0.55 : 1,
              background:'var(--bg3)', border:`1px solid ${inTutMenu && tutHover.includes(a.id) ? '#ff3b3b' : 'var(--border)'}`, color:'var(--text)', boxShadow: focusId === a.id ? '0 0 0 2px #7fe0ff inset, 0 0 10px rgba(127,224,255,0.5)' : undefined }}>
              <span style={{ width:24, fontSize:16, textAlign:'center', color:'#f0d060' }}>{a.icon}</span>
              <span style={{ flex:1 }}>
                <span style={{ display:'block', fontFamily:'var(--font-body)', fontSize:14 }}>{a.label}</span>
                <span data-action-note={a.reason ? 'reason' : 'cost'} style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:10, color: a.reason ? 'var(--red2)' : 'var(--text2)' }}>{a.reason || a.cost}</span>
              </span>
            </button>
          ))}
        </div>
        {actionResult && (
          <div data-trav="result" style={{ marginTop:8, padding:'8px 10px', background:'var(--bg4)', borderLeft:`3px solid ${toneColor[actionResult.tone]}`, fontFamily:'var(--font-body)', fontSize:13, color:'var(--text)', lineHeight:1.45 }}>{actionResult.text}</div>
        )}
        {here && setScreen && (
          <button className="btn btn-amber" data-trav="wander" data-panel-focus={focusId === 'wander' ? '1' : undefined} style={{ width:'100%', marginTop:8, boxShadow: focusId === 'wander' ? '0 0 0 2px #7fe0ff inset, 0 0 10px rgba(127,224,255,0.5)' : undefined }} onClick={() => setScreen('hack-slash')}>▶ Start wandering around this {c.name.replace(/ [A-H]\d+$/, '')}</button>
        )}
        <button className="btn" data-trav="close" data-panel-focus={focusId === 'close' ? '1' : undefined} style={{ width:'100%', marginTop:8, boxShadow: focusId === 'close' ? '0 0 0 2px #7fe0ff inset, 0 0 10px rgba(127,224,255,0.5)' : undefined }} onClick={closeSoloPanel}>Close</button>
      </div>
    );
  };

  return (
    <div className="screen-enter" data-trav-layout={!isCampMode && travNarrow ? 'stacked' : 'columns'} style={{ display:'flex', flexDirection: !isCampMode && travNarrow ? 'column' : 'row', gap:8, padding:8, height:'100%', overflowX:'hidden', overflowY: !isCampMode && travNarrow ? 'auto' : 'hidden', position:'relative' }}>

      {/* LEFT: Survivor roster + dispatch */}
      <div style={{ width: !isCampMode && travNarrow ? '100%' : 240, order: !isCampMode && travNarrow ? 2 : undefined, minHeight: !isCampMode && travNarrow ? 260 : undefined, display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
        {isCampMode ? (
        <div className="panel" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div className="panel-title">Available Survivors</div>
          <div style={{ flex:1, overflow:'auto', padding:6, display:'flex', flexDirection:'column', gap:5 }}>
            {survivors.map(s => {
              const classObj = ZI.CLASSES.find(c => c.id === s.class);
              const isSelected = selectedSurvivors.includes(s.id);
              const isBusy = s.status === 'busy';
              return (
                <div key={s.id}
                  onClick={() => !isBusy && setSelectedSurvivors(prev =>
                    prev.includes(s.id) ? prev.filter(id => id !== s.id) : [...prev, s.id]
                  )}
                  style={{
                    padding:'7px 9px', cursor: isBusy?'not-allowed':'pointer',
                    background: isSelected?'var(--bg4)':'var(--bg3)',
                    border:`1px solid ${isSelected?classObj?.color:'var(--border)'}`,
                    opacity: isBusy?0.75:1,
                    transition:'all 0.15s',
                  }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{
                      width:22, height:22, borderRadius:'50%',
                      border:`2px solid ${classObj?.color||'var(--border2)'}`, background:'var(--bg4)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontFamily:'var(--font-mono)', fontSize:10, color:classObj?.color||'var(--text2)',
                      flexShrink:0,
                    }}>{s.name[0]}</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--text)' }}>{s.name}</div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)' }}>
                        Lv{s.level} {classObj?.name} · {isBusy?'On Mission':'Idle'}
                      </div>
                    </div>
                    {isSelected && <div style={{ color:classObj?.color, fontSize:10 }}>✓</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        ) : renderAfflictions()}
        {/* Material totals */}
        <div className="panel" style={{ padding:8 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', marginBottom:5, letterSpacing:'0.1em' }}>RESOURCES</div>
          {Object.entries(window.ZI_MATERIALS).slice(0,6).map(([key, m]) => (
            <div key={key} style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
              <span style={{ fontSize:11 }}>{m.icon}</span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text2)', width:60, flexShrink:0 }}>{m.name}</span>
              <div style={{ flex:1 }}>
                <ProgressBar value={(m.current/m.max)*100} color={m.color} height={3}/>
              </div>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:m.color, width:32, textAlign:'right' }}>{m.current}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER: Satellite map */}
      <div data-trav="map-column" style={{ flex: !isCampMode && travNarrow ? '0 0 auto' : 1, order: !isCampMode && travNarrow ? 1 : undefined, display:'flex', flexDirection:'column', gap:8, minWidth:0, overflow:'hidden' }}>
        {/* Map type tabs */}
        {isCampMode ? (
        <div className="panel" style={{ display:'flex', alignItems:'center', flexShrink:0 }}>
          {mapTypes.map(t => (
            <button key={t.id} onClick={() => { setActiveType(t.id); setSelectedSquare(null); }} style={{
              fontFamily:'var(--font-body)', fontSize:11, letterSpacing:'0.12em', textTransform:'uppercase',
              padding:'8px 14px', background:'none', border:'none', cursor:'pointer',
              color: activeType===t.id ? t.color : 'var(--text3)',
              borderBottom: activeType===t.id ? `2px solid ${t.color}` : '2px solid transparent',
              borderRight: '1px solid var(--border)',
              transition:'all 0.15s', display:'flex', alignItems:'center', gap:5,
            }}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
          <div style={{ flex:1 }}/>
          <div style={{ padding:'8px 12px', fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>
            Threat Level {hoveredSquare?.threatLevel || sq?.threatLevel || 0}/5 · {squares.filter(s=>s.state==='available').length} available zones
          </div>
        </div>

        ) : renderSoloBar()}
        {/* Map grid */}
        <div className="panel" style={{
          flex:1, padding:'12px 34px 30px', position:'relative', overflow:'auto',
          background: `
            radial-gradient(ellipse at 30% 20%, rgba(200,169,110,0.04), transparent),
            radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.04), transparent),
            #0a0908
          `,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', flexWrap:'wrap' }}>
            <span style={{ color:'#ff3b3b', fontWeight:'bold' }}>◉ YOU ARE HERE · {posLabel}{pos.name ? ` · ${pos.name.replace(/ [A-H]\d+$/, '')}` : ''}</span>
            {setScreen && <button className="btn btn-amber" style={{ padding:'3px 10px', fontSize:11 }} onClick={() => setScreen('hack-slash')}>▶ Wander here</button>}
            <span style={{ color:'#f0d060' }}>┅ adjacent zones: click to act</span>
            {fortPos && fallowQ.state === 'none' && !ZI.factionsUnlocked() && <span style={{ color:'#f0d060' }}>🏰 Fort at {fortPos.coord}: smoke behind a palisade</span>}
            {fallowQ.state === 'active' && <span style={{ color:'#a2dca2' }}>🌾 Fallow Ground: {ZI.fallowProgress()}/{ZI.fallowGoal()} kills at {fallowQ.cell.coord} (wander there)</span>}
            {fallowQ.state === 'ready' && <span style={{ color:'#7fd88f', fontWeight:'bold' }}>🌾 Field cleared: travel into the Fort at {fortPos && fortPos.coord} to turn in</span>}
            {fallowQ.state === 'done' && ZI.getSurveyPoint() && <span style={{ color:'#7fe0ff' }}>📡 Survey Point at {ZI.getSurveyPoint().coord}: who made the crate?</span>}
            {camp && <span>⛺ Camp {String.fromCharCode(65 + camp.col) + (camp.row + 1)}{(camp.sx || camp.sy) ? ' · ' + sectorTag(camp.sx, camp.sy) : ''}</span>}
            <span style={{ marginLeft:'auto', color:'var(--text2)' }}>Sector <b style={{ color:'var(--amber)' }}>{sectorTag(view.sx, view.sy)}</b> · Seed #{worldSeed} / {ZI.MAX_SEED.toLocaleString()}</span>
            {!inPlayerSector && <button className="btn" style={{ padding:'3px 10px', fontSize:11 }} onClick={() => setView({ sx:pos.sx, sy:pos.sy })}>◉ Back to my sector</button>}
          </div>
          {/* Cardinal sector arrows */}
          {Object.entries(DIRS).map(([d, D]) => {
            const chk = canView(d);
            const t = { sx: view.sx + D.dx, sy: view.sy + D.dy };
            const known = explored.includes(t.sx + ',' + t.sy);
            const place = d === 'n' ? { top:40, left:'50%', transform:'translateX(-50%)' }
                        : d === 's' ? { bottom:4, left:'50%', transform:'translateX(-50%)' }
                        : d === 'w' ? { left:4, top:'50%', transform:'translateY(-50%)' }
                        :             { right:4, top:'50%', transform:'translateY(-50%)' };
            return (
              <button key={d} onClick={() => goView(d)} disabled={!chk.ok}
                title={chk.ok ? `View ${D.label}: sector ${sectorTag(t.sx, t.sy)}${known ? '' : ' (unexplored)'}` : chk.why}
                style={{ position:'absolute', zIndex:5, ...place, width: d==='n'||d==='s' ? 64 : 24, height: d==='n'||d==='s' ? 22 : 64,
                  display:'flex', alignItems:'center', justifyContent:'center', gap:4, cursor: chk.ok ? 'pointer' : 'not-allowed',
                  background: chk.ok ? 'rgba(240,208,96,0.14)' : 'var(--bg3)', border:`1px solid ${chk.ok ? '#f0d060' : 'var(--border)'}`,
                  color: chk.ok ? '#f0d060' : 'var(--text3)', fontFamily:'var(--font-mono)', fontSize:11, opacity: chk.ok ? 1 : 0.6 }}>
                {D.arrow}{(d==='n'||d==='s') && <span style={{ fontSize:9 }}>{D.label.slice(0,1)}{known || !chk.ok ? '' : '·new'}</span>}
              </button>
            );
          })}
          {/* Coordinate labels */}
          <div style={{ display:'grid', gridTemplateColumns:`32px repeat(${COLS}, 1fr)`, gap:2, marginBottom:2 }}>
            <div/>
            {Array.from({length:COLS}).map((_, c) => (
              <div key={c} style={{ textAlign:'center', fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>
                {String.fromCharCode(65+c)}
              </div>
            ))}
          </div>

          {/* Grid rows */}
          {Array.from({length:ROWS}).map((_, r) => (
            <div key={r} style={{ display:'grid', gridTemplateColumns:`32px repeat(${COLS}, 1fr)`, gap:2, marginBottom:2 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>
                {r+1}
              </div>
              {Array.from({length:COLS}).map((_, c) => {
                const square = squares.find(s => s.row === r && s.col === c);
                if (!square) return <div key={c}/>;
                const bc = biomeColors[square.biome];
                const sColor = stateColors[square.state];
                const isHovered = hoveredSquare?.id === square.id;
                const isSelected = selectedSquare?.id === square.id;
                const isLocked = square.state === 'locked';
                const cleared = square.state === 'cleared';

                return (
                  <div key={c} data-cell={square.gx + ',' + square.gy}
                    onPointerDown={(e) => { lastPointer.current = e.pointerType || 'mouse'; setPanelFocus(null); }}
                    onMouseEnter={() => setHoveredSquare(square)}
                    onMouseLeave={() => setHoveredSquare(null)}
                    onClick={() => {
                      if (!isCampMode) { openSoloPanel(square); return; } // TRAV-01a T13: select, don't hover (every platform)
                      if (isLocked) return;
                      if (isHere(r, c) && ZI.isFortCell(gOf(r, c))) { setFortOpen(true); return; } // inside the Fort's cell
                      if (isHere(r, c)) { setActionCell(square); setActionResult(null); return; } // your own zone: Loot / Scout / Make Camp / Hide
                      if (isAdjacent(r, c)) { setActionCell(square); setActionResult(null); if (tutStep >= 0 && tutStep <= 2) setTutStep(3); return; }
                      setSelectedSquare(isSelected ? null : square);
                    }}
                    style={{
                      aspectRatio:'1', position:'relative',
                      background: bc.fill,
                      border: isHere(r, c) ? '2px solid #ff3b3b' : isAdjacent(r, c) && !isLocked ? '2px dashed #f0d060' : `2px solid ${isSelected ? '#f0d060' : isHovered ? '#e6c47e' : 'rgba(0,0,0,0.55)'}`,
                      cursor: isLocked ? 'not-allowed' : 'pointer',
                      transition:'all 0.15s',
                      overflow:'hidden',
                      opacity: isLocked ? 0.7 : cleared ? 0.8 : 1,
                      boxShadow: (hl && hl.gx === square.gx && hl.gy === square.gy) ? '0 0 0 2px #7fe0ff inset, 0 0 10px rgba(127,224,255,0.5)' : isSelected ? '0 0 12px rgba(240,208,96,0.4)' : isHovered ? '0 0 6px rgba(200,169,110,0.3)' : 'none',
                    }}>
                    {/* Satellite imagery — procedural top-down tile */}
                    <div style={{
                      position:'absolute', inset:0,
                      backgroundImage:`url("${window.ZI_SAT ? window.ZI_SAT.tileUri(square.biome, square.tileSeed) : ''}")`,
                      backgroundSize:'cover', imageRendering:'pixelated',
                      filter: isHovered || isSelected ? 'saturate(1.15) brightness(1.1)' : 'saturate(0.9)',
                    }}/>
                    {/* Roads — edges shared with neighbours, so they connect across cells & sectors */}
                    {(() => {
                      const rd = square.roads, segs = [];
                      const end = { n:[50,0], s:[50,100], w:[0,50], e:[100,50] };
                      Object.entries(rd).forEach(([d, kind]) => { if (kind) segs.push({ d, kind, p:end[d] }); });
                      if (!segs.length) return null;
                      return (
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', opacity: isLocked ? 0.35 : 0.95 }}>
                          {segs.map(g => <line key={g.d + 'b'} x1="50" y1="50" x2={g.p[0]} y2={g.p[1]} stroke="#1b1a18" strokeWidth={g.kind === 'artery' ? 22 : 13} strokeLinecap="square"/>)}
                          {segs.map(g => <line key={g.d + 'a'} x1="50" y1="50" x2={g.p[0]} y2={g.p[1]} stroke="#3a3833" strokeWidth={g.kind === 'artery' ? 17 : 9} strokeLinecap="square"/>)}
                          {segs.filter(g => g.kind === 'artery').map(g => <line key={g.d + 'l'} x1="50" y1="50" x2={g.p[0]} y2={g.p[1]} stroke="#d9c26a" strokeWidth="1.6" strokeDasharray="6 6"/>)}
                          <rect x={50 - (segs.some(g => g.kind === 'artery') ? 8.5 : 4.5)} y={50 - (segs.some(g => g.kind === 'artery') ? 8.5 : 4.5)} width={segs.some(g => g.kind === 'artery') ? 17 : 9} height={segs.some(g => g.kind === 'artery') ? 17 : 9} fill="#3a3833"/>
                        </svg>
                      );
                    })()}
                    {/* Scanlines */}
                    <div style={{ position:'absolute', inset:0, pointerEvents:'none', background:'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 3px)' }}/>
                    {/* State tint / fog of war */}
                    {isLocked && <div style={{ position:'absolute', inset:0, background:'rgba(8,7,6,0.72)', backgroundImage:'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 7px)' }}/>}
                    {cleared && <div style={{ position:'absolute', inset:0, background:'rgba(98,214,154,0.12)' }}/>}
                    {square.state === 'contested' && <div style={{ position:'absolute', inset:0, background:'rgba(240,90,60,0.14)', boxShadow:'inset 0 0 10px rgba(240,90,60,0.45)' }}/>}
                    {/* Status corner */}
                    <div style={{
                      position:'absolute', top:0, right:0,
                      width:0, height:0,
                      borderLeft:'10px solid transparent',
                      borderTop:`10px solid ${sColor}`,
                    }}/>
                    {/* Difficulty stars */}
                    <div style={{ position:'absolute', top:3, left:3, display:'flex', gap:1 }}>
                      {Array.from({length:square.difficulty}).map((_, i) => (
                        <div key={i} style={{ width:3, height:3, background:'#f0d060', boxShadow:'0 0 2px rgba(240,208,96,0.6)' }}/>
                      ))}
                    </div>
                    {/* Fort + Fallow Ground markers */}
                    {(() => { const gg = gOf(r, c); const cellG = { gx: gg.gx, gy: gg.gy };
                      if (ZI.isFortCell(cellG)) return (
                        <div title="The Hearthguard's Fort — a palisade of wooden pikes" style={{ position:'absolute', top:2, right:2, zIndex:4, fontSize:18, lineHeight:1, filter:'drop-shadow(0 0 3px #000)', pointerEvents:'none' }}>🏰</div>);
                      if (ZI.isSurveyCell(cellG)) return (
                        <div title="Survey Point — a survey team was seen here" style={{ position:'absolute', top:2, right:2, zIndex:4, fontSize:16, lineHeight:1, filter:'drop-shadow(0 0 3px #000)', pointerEvents:'none' }}>📡</div>);
                      if (ZI.isFallowCell(cellG) && fallowQ.state !== 'none' && fallowQ.state !== 'done') return (
                        <div title="Fallow Ground — clear this field for the Hearthguard" style={{ position:'absolute', top:2, right:2, zIndex:4, fontSize:16, lineHeight:1, filter:'drop-shadow(0 0 3px #000)', pointerEvents:'none' }}>🌾</div>);
                      return null; })()}
                    {/* You are Here / camp / looted markers */}
                    {isHere(r, c) && (
                      <div style={{ position:'absolute', inset:0, zIndex:3, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'rgba(255,59,59,0.18)', boxShadow:'inset 0 0 0 2px #ff3b3b', pointerEvents:'none' }}>
                        <div className="trav-here-pin" style={{ fontSize:24, color:'#ff3b3b', textShadow:'0 0 8px #ff3b3b, 0 1px 2px #000', lineHeight:1 }}>◉</div>
                        <div style={{ fontFamily:'var(--font-mono)', fontSize:10, fontWeight:'bold', color:'#fff', background:'#ff3b3b', padding:'1px 4px', marginTop:2, whiteSpace:'nowrap', maxWidth:'100%', letterSpacing:'0.05em' }}>HERE</div>
                      </div>
                    )}
                    {camp && camp.gx === square.gx && camp.gy === square.gy && !isHere(r, c) && <div style={{ position:'absolute', top:2, right:12, zIndex:2, fontSize:11 }} title="Your camp">⛺</div>}
                    {looted[cellKey(r, c)] && <div style={{ position:'absolute', top:12, left:3, zIndex:2, fontFamily:'var(--font-mono)', fontSize:8, color:'#e6c47e', textShadow:'0 1px 2px #000' }} title="Looted">✓</div>}
                    {/* Lock or zone label */}
                    {isLocked ? (
                      <div style={{
                        position:'absolute', inset:0, display:'flex',
                        alignItems:'center', justifyContent:'center',
                        fontFamily:'var(--font-mono)', fontSize:16, color:'var(--text2)', textShadow:'0 1px 3px #000',
                      }}>🔒</div>
                    ) : (
                      <div style={{
                        position:'absolute', bottom:0, left:0, right:0, padding:'1px 2px',
                        fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text)',
                        lineHeight:1.2, textAlign:'center', overflow:'hidden', whiteSpace:'nowrap', textOverflow:'ellipsis',
                        background:'linear-gradient(0deg, rgba(0,0,0,0.75), rgba(0,0,0,0))', textShadow:'0 1px 2px #000',
                      }}>
                        {square.name.split(' ').slice(-1)[0]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Legend */}
          <div style={{ marginTop:12, display:'flex', gap:14, padding:'6px 8px', background:'var(--bg2)', border:'1px solid var(--border)', alignItems:'center' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>LEGEND:</div>
            {Object.entries(stateColors).map(([k, c]) => (
              <div key={k} style={{ display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:8, height:8, background:c }}/>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text2)', textTransform:'capitalize' }}>{k}</span>
              </div>
            ))}
            <div style={{ flex:1 }}/>
            <div style={{ display:'flex', gap:1 }}>
              {Array.from({length:5}).map((_,i)=>(
                <div key={i} style={{ width:4, height:4, background:'#f0d060' }}/>
              ))}
            </div>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text2)' }}>= 5 Stars (max difficulty)</span>
          </div>
        </div>
      </div>

      {/* RIGHT: Selected square details */}
      {isCampMode ? (
      <div style={{ width:280, display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
        <div className="panel" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div className="panel-title">Zone Details</div>
          <div style={{ flex:1, overflow:'auto', padding:10 }}>
            {sq ? (
              <>
                <div style={{ fontFamily:'var(--font-title)', fontSize:16, color:'var(--amber)', marginBottom:4 }}>
                  {sq.name}
                </div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text2)', marginBottom:10 }}>
                  {ZI.BIOMES.find(b=>b.id===sq.biome)?.name} · {activeType.toUpperCase()}
                </div>
                <div style={{ display:'flex', gap:4, marginBottom:10 }}>
                  {Array.from({length:5}).map((_,i)=>(
                    <div key={i} style={{
                      width:14, height:14,
                      background: i<sq.difficulty ? '#f0d060' : 'var(--bg4)',
                      border:'1px solid var(--border)',
                      clipPath:'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
                    }}/>
                  ))}
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text2)', marginLeft:6 }}>
                    Difficulty {sq.difficulty}/5
                  </span>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:5, marginBottom:12 }}>
                  <InfoRow label="State"      value={sq.state} color={stateColors[sq.state]}/>
                  <InfoRow label="Threat"     value={`${sq.threatLevel}/5`} color={sq.threatLevel>3?'var(--red2)':'var(--amber)'}/>
                  <InfoRow label="Duration"   value={fmtTime(sq.duration*60)} color="var(--text)"/>
                  <InfoRow label="RMAT Tier"  value={ZI.RMAT_TIERS[sq.rmatTier]?.name||'—'} color={ZI.RMAT_TIERS[sq.rmatTier]?.color||'var(--text3)'}/>
                  <InfoRow label="Assigned"   value={`${selectedSurvivors.length} survivor${selectedSurvivors.length!==1?'s':''}`} color="var(--amber)"/>
                </div>
                <div className="divider"/>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:4 }}>EXPECTED YIELD</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--text2)', lineHeight:1.5, marginBottom:10 }}>
                  {activeType==='scavenge' && '8–12 mixed materials · 1–2 weapons · Scrap & cloth bonus'}
                  {activeType==='contract' && 'Faction rep · Bonus credits · Unique blueprints possible'}
                  {activeType==='training' && 'SURVIVAL XP · Profession XP · Class fragment'}
                  {activeType==='patrol' && 'Threat clock reset · Survivor combat XP · Hostile cleanup'}
                  {activeType==='raid' && 'High-tier gear · Bulk materials · Risk of casualties'}
                </div>
              </>
            ) : (
              <div style={{ textAlign:'center', padding:24 }}>
                <div style={{ fontFamily:'var(--font-title)', fontSize:14, color:'var(--text3)', marginBottom:6 }}>Hover a Zone</div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)' }}>Click any unlocked square to dispatch survivors.</div>
              </div>
            )}
          </div>
          {selectedSquare && selectedSquare.state !== 'locked' && (
            <div style={{ padding:10, borderTop:'1px solid var(--border)' }}>
              <button
                className="btn btn-amber"
                style={{ width:'100%', marginBottom:6 }}
                onClick={() => {
                  window.ZI.emitAction && window.ZI.emitAction('build', 1 + (selectedSquare.threatLevel || 1) * 0.3);
                  setActiveRoute && setActiveRoute({
                    id: selectedSquare.id,
                    name: selectedSquare.name,
                    biome: selectedSquare.biome,
                    duration: selectedSquare.duration,
                    risk: selectedSquare.threatLevel,
                    rmatTier: selectedSquare.rmatTier,
                    nodes: ['Departure','Travel','Zone','Loot','Extraction'],
                    reward: '8–12 materials · faction rep',
                  });
                  setScreen && setScreen('solo-loading');
                }}
                disabled={selectedSurvivors.length === 0}
              >
                Dispatch ({selectedSurvivors.length}) →
              </button>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', textAlign:'center' }}>
                Survivors return in {fmtTime(selectedSquare.duration*60)} with results.
              </div>
            </div>
          )}
        </div>
      </div>

      ) : (
        <div data-trav="side-panel" style={{ width:300, display: travNarrow ? 'none' : 'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
          <div className="panel" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div className="panel-title">Zone Details</div>
            <div style={{ flex:1, overflow:'auto', padding:10 }}>{sheetMode ? null : renderZonePanel()}{sheetMode && <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)', textAlign:'center', padding:20 }}>Zone details open as a sheet at the bottom of the screen.</div>}</div>
          </div>
        </div>
      )}
      {!isCampMode && sheetMode && actionCell && ReactDOM.createPortal(
        <div data-trav="sheet-backdrop" onClick={closeSoloPanel} style={{ position:'fixed', inset:0, zIndex:9000, background:'rgba(0,0,0,0.5)' }}>
          <div data-trav="sheet" onClick={e => e.stopPropagation()}
            onTouchStart={e => { sheetTouchY.current = e.touches[0].clientY; }}
            onTouchEnd={e => { const y0 = sheetTouchY.current; sheetTouchY.current = null; if (y0 != null && e.changedTouches[0].clientY - y0 > 60) closeSoloPanel(); }}
            style={{ position:'fixed', left:0, right:0, bottom:0, maxHeight:'75vh', overflowY:'auto', background:'var(--bg2)', borderTop:'2px solid #f0d060', borderRadius:'12px 12px 0 0', padding:'8px 14px 16px', boxShadow:'0 -8px 28px rgba(0,0,0,0.7)' }}>
            <div data-trav="sheet-handle" style={{ width:44, height:5, borderRadius:3, background:'var(--border2)', margin:'0 auto 8px' }}/>
            {renderZonePanel()}
          </div>
        </div>,
        document.body
      )}
      {/* ── Zone action menu (adjacent cell) ── */}
      {isCampMode && actionCell && (() => {
        const coord = actionCell.coord + ((actionCell.sx || actionCell.sy) ? ' · ' + sectorTag(actionCell.sx, actionCell.sy) : '');
        const key = keyG(actionCell.gx, actionCell.gy);
        const toneColor = { good:'var(--green)', warn:'var(--amber)', info:'#7fe0ff' };
        return (
          <div onClick={() => setActionCell(null)} style={{ position:'absolute', inset:0, zIndex:80, background:`rgba(0,0,0,${inTutMenu ? (0.55 + 0.37 * tutHover.length / 5).toFixed(2) : 0.6})`, transition:'background 0.5s', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
            <div onClick={e => e.stopPropagation()} className="panel" style={{ width:'100%', maxWidth:380, maxHeight:'calc(100% - 32px)', overflowY:'auto', padding:14, borderColor:'#f0d060', background:'var(--bg2)' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', letterSpacing:'0.1em' }}>ZONE {coord} · {isHereCell(actionCell) ? 'YOU ARE HERE' : 'NEXT TO YOU'}</div>
              <div style={{ fontFamily:'var(--font-title)', fontSize:20, color:'var(--text)', margin:'2px 0 10px' }}>{actionCell.name}</div>
              {inTutMenu && (
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, padding:'6px 9px', border:'1px solid #ff3b3b', background:'rgba(255,59,59,0.1)' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#ff3b3b', letterSpacing:'0.08em' }}>TUTORIAL</span>
                  <span style={{ flex:1, fontFamily:'var(--font-body)', fontSize:13, color:'var(--text)' }}>Hover each option to learn it.</span>
                  <span style={{ display:'flex', gap:3 }}>{Array.from({ length:5 }).map((_, i) => <span key={i} style={{ width:7, height:7, borderRadius:'50%', background: i < tutHover.length ? '#ff3b3b' : 'var(--bg4)', border:'1px solid #ff3b3b' }}/>)}</span>
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {ZI.isFortCell(actionCell) && (
                  <button onClick={() => { setActionCell(null); setFortOpen(true); }} style={{ display:'flex', alignItems:'center', gap:10, textAlign:'left', padding:'8px 10px', cursor:'pointer', background:'rgba(240,208,96,0.1)', border:'1px solid #f0d060', color:'var(--text)' }}>
                    <span style={{ width:24, fontSize:18, textAlign:'center' }}>🏰</span>
                    <span style={{ flex:1 }}>
                      <span style={{ display:'block', fontFamily:'var(--font-body)', fontSize:14 }}>{fallowQ.state === 'ready' ? 'Return to the Fort — turn in Fallow Ground' : 'Approach the palisade'}</span>
                      <span style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text2)' }}>A ring of sharpened wooden pikes. One gate, one guard.</span>
                    </span>
                  </button>
                )}
                {ACTIONS.filter(a => !(a.id === 'travel' && isHereCell(actionCell))).map(a => {
                  const done = a.id === 'loot' && looted[key];
                  return (
                    <button key={a.id} disabled={done} onMouseEnter={() => noteTutHover(a.id)} onFocus={() => noteTutHover(a.id)} onClick={() => { noteTutHover(a.id); doAction(a.id, actionCell); }} style={{
                      display:'flex', alignItems:'center', gap:10, textAlign:'left', padding:'6px 10px',
                      cursor: done ? 'not-allowed' : 'pointer', opacity: done ? 0.55 : 1,
                      background:'var(--bg3)', border:`1px solid ${inTutMenu && tutHover.includes(a.id) ? '#ff3b3b' : 'var(--border)'}`, color:'var(--text)',
                    }}>
                      <span style={{ width:24, fontSize:16, textAlign:'center', color:'#f0d060' }}>{a.icon}</span>
                      <span style={{ flex:1 }}>
                        <span style={{ display:'block', fontFamily:'var(--font-body)', fontSize:14 }}>{a.label}{done ? ' (looted)' : ''}{a.id === 'loot' && !done ? <span style={{ marginLeft:8, fontFamily:'var(--font-mono)', fontSize:11, color: ZI.lootSafeChance(actionCell) >= 60 ? 'var(--green)' : ZI.lootSafeChance(actionCell) >= 35 ? 'var(--amber)' : 'var(--red2)' }}>{ZI.lootSafeChance(actionCell)}% safe</span> : null}</span>
                        <span style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text2)' }}>{a.desc}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {actionResult && (
                <div style={{ marginTop:10, padding:'8px 10px', background:'var(--bg4)', borderLeft:`3px solid ${toneColor[actionResult.tone]}`, fontFamily:'var(--font-body)', fontSize:13, color:'var(--text)', lineHeight:1.45 }}>{actionResult.text}</div>
              )}
              {actionResult && isHereCell(actionCell) && setScreen && (
                <button className="btn btn-amber" style={{ width:'100%', marginTop:8 }} onClick={() => setScreen('hack-slash')}>▶ Start wandering around this {actionCell.name.replace(/ [A-H]\d+$/, '')}</button>
              )}
              <button className="btn" style={{ width:'100%', marginTop:8 }} onClick={() => setActionCell(null)}>{actionResult ? 'Done' : 'Cancel'}</button>
            </div>
          </div>
        );
      })()}

      {/* ── Outbreak tutorial ── */}
      {fortOpen && <FortGateScene onClose={() => { setFortOpen(false); setQuestTick(t => t + 1); }}/>}
      {tutStep >= 0 && tutStep < TUTORIAL.length && !actionCell && !tutPoint && (
        <div style={{ position:'absolute', left:'50%', bottom:18, transform:'translateX(-50%)', zIndex:70, width:'min(460px, 94%)' }}>
          <div className="panel" style={{ padding:16, borderColor:'#ff3b3b', background:'var(--bg2)', boxShadow:'0 8px 28px rgba(0,0,0,0.7)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#ff3b3b', letterSpacing:'0.12em' }}>TUTORIAL · {tutStep + 1}/{TUTORIAL.length}</span>
              <button onClick={closeTutorial} style={{ background:'none', border:'none', color:'var(--text2)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:11 }}>Skip</button>
            </div>
            <div style={{ fontFamily:'var(--font-title)', fontSize:18, color:'var(--text)', marginBottom:6 }}>{TUTORIAL[tutStep].title}</div>
            <div style={{ fontFamily:'var(--font-body)', fontSize:14, color:'var(--text)', lineHeight:1.5, textWrap:'pretty' }}>{TUTORIAL[tutStep].body}</div>
            <div style={{ display:'flex', gap:8, marginTop:12, justifyContent:'flex-end' }}>
              {tutStep > 0 && <button className="btn" onClick={() => setTutStep(t => t - 1)}>Back</button>}
              {tutStep === 2
                ? <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'#f0d060', alignSelf:'center' }}>Click a glowing zone to continue →</span>
                : tutStep < TUTORIAL.length - 1
                  ? <button className="btn btn-amber" onClick={() => setTutStep(t => t + 1)}>Next</button>
                  : <button className="btn btn-amber" onClick={() => setTutPoint(true)}>Next</button>}
            </div>
          </div>
        </div>
      )}
      {tutPoint && ReactDOM.createPortal(
        <div onClick={(e) => {
            const r = wanderRect;
            if (r && e.clientX >= r.x - 6 && e.clientX <= r.x + r.w + 6 && e.clientY >= r.y - 6 && e.clientY <= r.y + r.h + 6) finishTutorialToWander();
          }}
          style={{ position:'fixed', inset:0, zIndex:9999, cursor:'default' }}>
          {wanderRect ? (
            <>
              <div className="tut-spot" style={{ position:'fixed', left:wanderRect.x - 6, top:wanderRect.y - 6, width:wanderRect.w + 12, height:wanderRect.h + 12,
                boxShadow:'0 0 0 9999px rgba(0,0,0,0.82)', border:'2px solid #ff3b3b', borderRadius:4, pointerEvents:'none', cursor:'pointer' }}/>
              <div style={{ position:'fixed', left: Math.max(12, Math.min(window.innerWidth - 332, wanderRect.x + wanderRect.w / 2 - 160)), top: wanderRect.y + wanderRect.h + 18, width:320, pointerEvents:'auto' }}
                onClick={e => e.stopPropagation()}>
                <div className="tut-arrow" style={{ position:'absolute', top:-14, left: Math.max(14, Math.min(292, wanderRect.x + wanderRect.w / 2 - Math.max(12, Math.min(window.innerWidth - 332, wanderRect.x + wanderRect.w / 2 - 160)) - 10)), fontSize:20, color:'#ff3b3b', lineHeight:1 }}>▲</div>
                <div className="panel" style={{ padding:14, borderColor:'#ff3b3b', background:'var(--bg2)', boxShadow:'0 8px 28px rgba(0,0,0,0.8)' }}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#ff3b3b', letterSpacing:'0.12em', marginBottom:4 }}>TUTORIAL · LAST STEP</div>
                  <div style={{ fontFamily:'var(--font-title)', fontSize:18, color:'var(--text)', marginBottom:6 }}>{tgt.title}</div>
                  <div style={{ fontFamily:'var(--font-body)', fontSize:14, color:'var(--text)', lineHeight:1.5 }}>Click the <b style={{ color:'#ff3b3b' }}>{tgt.label}</b> tab above. {tgt.body}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginTop:10 }}>
                    <button className="btn" onClick={closeTutorial}>Skip</button>
                    <button className="btn btn-amber" onClick={finishTutorialToWander}>Take me there</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.82)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div className="panel" onClick={e => e.stopPropagation()} style={{ padding:16, borderColor:'#ff3b3b', background:'var(--bg2)', maxWidth:340 }}>
                <div style={{ fontFamily:'var(--font-title)', fontSize:18, color:'var(--text)', marginBottom:8 }}>{tgt.title}</div>
                <button className="btn btn-amber" onClick={finishTutorialToWander}>Take me there</button>
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
      {tutStep < 0 && (
        <window.TutStepMenu label="Traversal" side="right" inset={14} zIndex={20} steps={TUTORIAL.map(t => t.title)} onPick={n => { setTutHover([]); setActionCell(null); setTutPoint(false); setTutStep(n); }}/>
      )}
    </div>
  );
};

// ─── WANDERING SCREEN (Side-Scroller, Auto Turn-Based) ───────────────────────
// ─── TUTORIAL REPLAY MENU: the "?" button opens the step list; pick any one step (spec principle 4, test plan 6) ─
window.TutStepMenu = function TutStepMenu({ label, steps, onPick, side, inset, zIndex }) {
  const [open, setOpen] = React.useState(false);
  const pos = { position:'absolute', bottom: inset, [side === 'left' ? 'left' : 'right']: inset, zIndex };
  return (
    <div data-tut-menu={label} style={pos}>
      {open && (
        <div className="panel" role="menu" style={{ position:'absolute', bottom:40, [side === 'left' ? 'left' : 'right']:0, width:260, padding:10, borderColor:'#ff3b3b', background:'var(--bg2)', boxShadow:'0 8px 28px rgba(0,0,0,0.7)', display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:2 }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#ff3b3b', letterSpacing:'0.12em' }}>REPLAY A STEP · {label.toUpperCase()}</span>
            <button onClick={() => setOpen(false)} title="Close" style={{ background:'none', border:'none', color:'var(--text2)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:12 }}>✕</button>
          </div>
          {steps.map((t, n) => (
            <button key={n} role="menuitem" onClick={() => { setOpen(false); onPick(n); }} style={{ display:'flex', gap:8, textAlign:'left', background:'var(--bg3)', border:'1px solid var(--border)', color:'var(--text)', cursor:'pointer', padding:'6px 8px', fontFamily:'var(--font-body)', fontSize:13 }}>
              <span style={{ fontFamily:'var(--font-mono)', color:'#ff3b3b' }}>{n + 1}</span><span>{t}</span>
            </button>
          ))}
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} title={`Replay a ${label} tutorial step`} aria-expanded={open} style={{ width:32, height:32, borderRadius:'50%', cursor:'pointer', background:'var(--bg3)', border:'1px solid #ff3b3b', color:'#ff3b3b', fontFamily:'var(--font-mono)', fontSize:14 }}>?</button>
    </div>
  );
};
// ─── WANDERING TUTORIAL (spotlights each HUD area and explains the decision) ─
window.WanderTutorial = function WanderTutorial({ rootRef, onDone, startAt }) {
  const STEPS = window.WANDER_TUT_STEPS;
  const [i, setI] = React.useState(() => Math.max(0, Math.min(STEPS.length - 1, startAt || 0)));
  return window.WanderTutorialView({ rootRef, onDone, STEPS, i, setI });
};
window.WANDER_TUT_STEPS = [
    { tut:'scene', title:'This is the idle half of the game', body:'Your survivor patrols the zone they stand on the Traversal map — walking, fighting and looting on their own, even while you\'re on other tabs or away. Your job here isn\'t to watch the fight; it\'s to decide how risky the patrol should be.' },
    { tut:'hp', title:'Health is the clock on every run', body:'Each zombie chips away at HP. Hit 0 and the survivor is downed: sent home, carrying only part of their haul. Watching this bar tells you when to heal, slow down, or head back.' },
    { tut:'haul', title:'Your pack is at risk until you bank it', body:'Loot rides in the survivor\'s pack (🎒) while they\'re out. Nothing is safe until you Return to Base — if they go down first, most of it is lost. Levelling Scavenging lets them keep more. The core choice: push deeper for more, or go home and keep what you have.' },
    { tut:'distance', title:'Distance, laps and checkpoints', body:'The further you travel, the tougher the zombies — each full bar is a lap (💀 ×1.1, ×1.2…). Checkpoints every 250 m are kept even if you\'re downed, and you can jump back to any of them on the slider below.' },
    { tut:'actions', title:'Policy, pace and risk', body:'Your standing policy (the first button) decides what your survivor meets while you\'re away and whether they fight or slip past zombies. Ethical is slow and safe; Criminal pays more and makes enemies. Heal spends a first-aid charge; Walk, Jog and Run trade safety for speed. More actions holds Idle Run, Run Back, your Gear and equipped consumables.' },
    { tut:'log', title:'The combat log', body:'Every hit, kill, loot drop and checkpoint is recorded here, along with a recap of anything that happened while you were away. Check it to see what\'s been hurting you and what you picked up.' },
    { tut:'cmds', title:'Tools and what trains you', body:'Heal, scout and push are your hands-on tools; the patrol keeps fighting on its own either way. What your survivor does trains them: healing builds First Aid, scouting and pushing build Stealth, looting builds Scavenging, and each policy encounter trains the skills it tests. Skills you stop using go rusty. When you come back, the log shows what happened while you were gone.' },
];
window.WanderTutorialView = function WanderTutorialView({ rootRef, onDone, STEPS, i, setI }) {
  const [rect, setRect] = React.useState(null);
  const step = STEPS[i];
  React.useEffect(() => {
    const measure = () => {
      const root = rootRef.current; if (!root) return;
      const el = root.querySelector('[data-tut="' + step.tut + '"]');
      const rr = root.getBoundingClientRect();
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({ x:r.left - rr.left, y:r.top - rr.top, w:r.width, h:r.height, rw:rr.width, rh:rr.height });
    };
    measure(); const t = setInterval(measure, 400);
    return () => clearInterval(t);
  }, [i]);
  const CARD_W = 340, pad = 6;
  let cardW = CARD_W;
  let cardStyle = { left:'50%', top:'50%', transform:'translate(-50%,-50%)' };
  if (rect) {
    const CARD_H = 230, gap = 12;
    const cx = Math.max(12, Math.min(rect.rw - CARD_W - 12, rect.x + rect.w / 2 - CARD_W / 2));
    const cy = Math.max(12, Math.min(rect.rh - CARD_H - 12, rect.y + rect.h / 2 - CARD_H / 2));
    const room = {
      below: rect.rh - (rect.y + rect.h) - gap,
      above: rect.y - gap,
      right: rect.rw - (rect.x + rect.w) - gap,
      left:  rect.x - gap,
    };
    const fits = { below: room.below >= CARD_H, above: room.above >= CARD_H, right: room.right >= CARD_W, left: room.left >= CARD_W };
    // Order: whichever fully-fitting side has the most spare room; card never sits on the target.
    const order = Object.keys(fits).filter(k => fits[k]).sort((a, b) => (room[b] - (b === 'left' || b === 'right' ? CARD_W : CARD_H)) - (room[a] - (a === 'left' || a === 'right' ? CARD_W : CARD_H)));
    let side = order[0];
    // Nothing fits at full width: use the roomiest left/right side with a narrower card (min 240px).
    if (!side) {
      const lr = room.right >= room.left ? 'right' : 'left';
      if (room[lr] >= 240) { side = lr; cardW = Math.min(CARD_W, room[lr] - 12); }
    }
    if (side === 'below') cardStyle = { left: cx, top: rect.y + rect.h + gap };
    else if (side === 'above') cardStyle = { left: cx, top: rect.y - gap, transform:'translateY(-100%)' };
    else if (side === 'right') cardStyle = { left: rect.x + rect.w + gap, top: cy };
    else if (side === 'left') cardStyle = { left: rect.x - gap - cardW, top: cy };
    else cardStyle = { left: 12, top: Math.max(12, rect.y + 12) }; // target fills the screen: top of it, clear of the sprites
  }
  return (
    <div style={{ position:'absolute', inset:0, zIndex:95 }}>
      {rect
        ? <div className="tut-spot" style={{ position:'absolute', left:rect.x - pad, top:rect.y - pad, width:rect.w + pad*2, height:rect.h + pad*2, boxShadow:'0 0 0 9999px rgba(0,0,0,0.78)', border:'2px solid #ff3b3b', borderRadius:4, pointerEvents:'none', transition:'all 0.3s' }}/>
        : <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.78)' }}/>}
      <div className="panel" style={{ position:'absolute', width:cardW, maxWidth:'calc(100% - 24px)', padding:14, borderColor:'#ff3b3b', background:'var(--bg2)', boxShadow:'0 8px 28px rgba(0,0,0,0.8)', ...cardStyle }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'#ff3b3b', letterSpacing:'0.12em' }}>TUTORIAL · WANDERING · {i + 1}/{STEPS.length}</span>
          <button onClick={onDone} style={{ background:'none', border:'none', color:'var(--text2)', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:11 }}>Skip ✕</button>
        </div>
        <div style={{ fontFamily:'var(--font-title)', fontSize:18, color:'var(--text)', marginBottom:6 }}>{step.title}</div>
        <div style={{ fontFamily:'var(--font-body)', fontSize:14, color:'var(--text)', lineHeight:1.5 }}>{step.body}</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:12 }}>
          <button className="btn" disabled={i === 0} onClick={() => setI(i - 1)} style={{ opacity: i === 0 ? 0.4 : 1 }}>Back</button>
          <span style={{ display:'flex', gap:4 }}>{STEPS.map((_, k) => <span key={k} style={{ width:7, height:7, borderRadius:'50%', background: k <= i ? '#ff3b3b' : 'var(--bg4)', border:'1px solid #ff3b3b' }}/>)}</span>
          {i < STEPS.length - 1
            ? <button className="btn btn-amber" onClick={() => setI(i + 1)}>Next</button>
            : <button className="btn btn-amber" onClick={onDone}>Start patrolling</button>}
        </div>
      </div>
    </div>
  );
};

window.WanderingScreen = function WanderingScreen({ route, setScreen }) {
  const ZI = window.ZI;
  // The idle patrol happens wherever the survivor stands on the Traversal map.
  const zone = (ZI.getTravZone && ZI.getTravZone()) || null;
  const zoneBiome = zone && ZI.BIOMES.find(b => b.id === zone.biome);
  const zoneCoord = zone ? String.fromCharCode(65 + zone.col) + (zone.row + 1) : null;

  // Encounter state
  const [encounter, setEncounter] = React.useState(null);
  const [encounters, setEncounters] = React.useState([]);
  const [combatLog, setCombatLog] = React.useState([
    { type:'info', text: zone ? `📍 Wandering around ${zone.name} (${zoneBiome ? zoneBiome.name : zone.biome})...` : 'Departing on Wandering patrol...' },
    ...(() => { // opening the screen mid-retreat: say so in the log
      const rn = window.ZI.getWanderRun ? window.ZI.getWanderRun() : {}, Z = window.ZI;
      if (rn.withdrawing) return [{ type:'enemy', text:`↩ ${rn.withdrawCauses && Z.retreatWithdrawText ? Z.retreatWithdrawText(rn.withdrawCauses) : 'Retreating'} — ${Math.round(rn.withdrawLeftM || 0)} m back to the checkpoint.` }];
      if (rn.resting) return [{ type:'enemy', text: rn.restAt === 'checkpoint' ? `🛏 Withdrew and resting at the checkpoint (HP ${Math.round(rn.hp || 0)}%) until HP ≥ 80%.` : `☠ Forced Retreat — resting at Base injured (HP ${Math.round(rn.hp || 0)}%) until HP ≥ 80%.` }];
      return [];
    })(),
  ]);
  // Story messages queued by other screens (e.g. the Survey Point) land here.
  React.useEffect(() => {
    const pull = () => { const q = window.ZI.drainWanderLog ? window.ZI.drainWanderLog() : []; if (q.length) setCombatLog(p => [...p, ...q.map(text => ({ type:'init', text }))]); };
    pull(); const t = setInterval(pull, 1500); return () => clearInterval(t);
  }, []);
  const [playerHp, setPlayerHp] = React.useState((window.ZI.getWanderRun && window.ZI.getWanderRun().hp) ?? 100);
  // Batch 3B: the shared simulation owns Downed (Forced Retreat → Base rest). The old overlay is bypassed: it opened when a saved
  // run had HP ≤ 0 at mount and its button resumed at 100 HP without rest.
  const [downed, setDowned] = React.useState(false);
  const [healsUsed, setHealsUsed] = React.useState((window.ZI.getWanderRun && window.ZI.getWanderRun().healsUsed) || 0);
  // FX4 (Q5): heal strength is the shared rule ZI.SurvivorRules.healPct(); the screen no longer computes or writes it.
  const FREE_KILLS = 10;
  const [killCmdsUsed, setKillCmdsUsed] = React.useState(0);
  // Movement: walk = 3m/tick. Jog/run scale with the survivor's Athletics stat.
  // 1–10 conditioning, from the survivor's real Athletics level (rust applied).
  const ATHLETICS = window.ZI.SurvivorRules.conditioning(); // FX4: the shared rule's conditioning value (display only)
  // FX4 (D-FX4a): pace is a saved player setting; the screen opens on it and saves each change. Speed is computed by rule.
  const [moveMode, setMoveMode] = React.useState(() => (window.ZI.getWanderRun && window.ZI.getWanderRun().moveMode) || 'walk');
  React.useEffect(() => { window.ZI.syncWanderState && window.ZI.syncWanderState({ moveMode }); }, [moveMode]);
  // ── Gear loadout: equipped items modify live stats (spec §13) ──
  const [loadout, setLoadout] = React.useState(() => window.ZI.getLoadout());
  const [stash, setStash] = React.useState(() => window.ZI.getStash());
  const [showGear, setShowGear] = React.useState(false);
  const [gearFilter, setGearFilter] = React.useState('ALL');
  // Re-read the one stash/loadout store whenever it changes (crafts finishing, equips on another screen).
  React.useEffect(() => window.ZI.onInventoryChange(() => { setStash(window.ZI.getStash()); setLoadout(window.ZI.getLoadout()); }), []);
  // Active consumable buffs (timed). Each is {until, val}.
  const [buffs, setBuffs] = React.useState({ speed:null, dmg:null, armor:null, loot:null });
  const [reviveCharge, setReviveCharge] = React.useState(0); // HP restored when downed
  const now0 = Date.now();
  const buffActive = (b) => b && now0 < b.until;
  const buffDmgPct   = buffActive(buffs.dmg)   ? buffs.dmg.val   : 0;
  const buffArmorAdd = buffActive(buffs.armor) ? buffs.armor.val : 0;
  const buffLootPct  = buffActive(buffs.loot)  ? buffs.loot.val  : 0;
  const gearStats = window.ZI.resolveLoadoutStats(loadout);
  const weaponKind = window.ZI_ART.weaponKindFor(loadout);
  const weaponFx = window.ZI_ART.WEAPON_FX[weaponKind] || {};
  // FX4 (Q5): speed = pace × gear × speed buffs, from the shared rule (display only; the simulation computes its own each step).
  const moveSpeed = window.ZI.SurvivorRules.moveSpeed({ moveMode });
  const [lastCheckpoint, setLastCheckpoint] = React.useState((window.ZI.getWanderRun && window.ZI.getWanderRun().lastCheckpoint) || 0);
  const CHECKPOINT_EVERY = 250; // meters
  const [checkpoints, setCheckpoints] = React.useState((window.ZI.getCheckpoints && window.ZI.getCheckpoints()) || []);
  const [idleMode, setIdleMode] = React.useState(route && route.idle === true);
  const [hudMenu, setHudMenu] = React.useState(false);
  // ── Standing policy (persists outside the run; see Wandering spec §2) ──
  const [policy, setPolicyState] = React.useState(() => window.ZI.getPolicy());
  const [polMenu, setPolMenu] = React.useState(false);
  const [polMsg, setPolMsg] = React.useState(null);
  const choosePolicy = (id) => {
    const r = window.ZI.setPolicy(id);
    if (r.ok) { setPolicyState(window.ZI.getPolicy()); setPolMenu(false); setPolMsg(null);
      setCombatLog(prev => [...prev, { type:'init', text:`${window.ZI.POLICIES[id].icon} Standing policy set to ${window.ZI.POLICIES[id].name}. Encounters will follow it.` }]); }
    else setPolMsg(r.reason);
  };
  const [wTut, setWTut] = React.useState(() => !window.ZI.tutDone('zi_wander_tut_done'));
  const [wTutStart, setWTutStart] = React.useState(0);
  const wanderRootRef = React.useRef(null);
  const [scroll, setScroll] = React.useState((window.ZI.getWanderRun && window.ZI.getWanderRun().scroll) || 0);
  // Narrow screens (phones): the scene sits above the combat log at full width instead of beside it. Display only.
  const [narrow, setNarrow] = React.useState(() => (window.innerWidth || 1024) < 760);
  React.useEffect(() => { const f = () => setNarrow((window.innerWidth || 1024) < 760); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f); }, []);
  const [activeSurvivor] = React.useState({ name:'Yael Strom', class:'ranger', hp:100, atk:18, def:8, init:14 });
  const [score, setScore] = React.useState(() => {
    const r = (window.ZI.getWanderRun && window.ZI.getWanderRun()) || {};
    return { kills: r.kills || 0, xp: r.xp || 0, mats: r.mats || 0 };
  });
  // Carried loot for this run — each entry { name, value }. Drives the
  // "drop all but most valuable on down" rule.
  // Persisted in zi_wander_run so the pack survives tab switches and the
  // background patrol can add to it while the tab is closed.
  const [carried, setCarried] = React.useState(() => ((window.ZI.getWanderRun && window.ZI.getWanderRun().carried) || []));
  React.useEffect(() => { window.ZI.syncWanderState && window.ZI.syncWanderState({ carried }); }, [carried]);
  const [cmdsLeft, setCmdsLeft] = React.useState((window.ZI.cmdsRemaining && window.ZI.cmdsRemaining()) || 60);
  const [animFrame, setAnimFrame] = React.useState(0);
  const [zombieAnim, setZombieAnim] = React.useState({});
  // Floating damage numbers ({id, who:'zombie'|'player', n})
  const [dmgPops, setDmgPops] = React.useState([]);
  // Display only: fight damage not yet replayed. The engine applies a whole fight at once; the HP readout steps down with each strike.
  const [hpLag, setHpLag] = React.useState(0);
  const hpMax = window.ZI.maxHp ? window.ZI.maxHp() : 100; // BAL-A: current max HP (lower while Broken)
  const hpShown = Math.min(hpMax, playerHp + hpLag);
  const popDmg = (who, n) => {
    if (!window.ZI.getSettings().damageNumbers || !(n > 0)) return;
    const id = Date.now() + Math.random();
    setDmgPops(p => [...p.slice(-6), { id, who, n, dx: Math.round(Math.random() * 24 - 12) }]);
    setTimeout(() => setDmgPops(p => p.filter(x => x.id !== id)), 950);
  };
  const logRef = React.useRef(null);
  const scrollRef = React.useRef((window.ZI.getWanderRun && window.ZI.getWanderRun().scroll) || 0);
  const [cmdInput, setCmdInput] = React.useState('');

  // Build the encounter pool from the full 45-zombie bestiary. Falls back to a
  // small built-in set if bestiary-data.js hasn't loaded.
  const TIER_RANK = { F:0, E:1, D:2, C:3, B:4, A:5, S:6, BOSS:7 };
  const mapBestiary = (z) => ({
    type: (z.base || z.name || 'shambler').toLowerCase().replace(/\s+/g, ''),
    name: z.name, hp: z.hp, atk: z.dmg, def: z.armor, init: Math.round((z.spd || 0.6) * 12),
    xp: z.xp, spd: z.spd, armor: z.armor, currentHp: z.hp, bestiaryId: z.id,
    tier: z.tier, weakness: z.weakness || [], loot: z.loot, drops: z.loot,
  });
  const bestiaryPool = (window.ZI.BESTIARY || []).map(mapBestiary);
  const undeadTypes = bestiaryPool.length ? bestiaryPool : [
    { type:'shambler', name:'Shambler', hp:25, atk:8, def:0, init:5, xp:10, tier:'F', weakness:['Blunt'], drops:'Cloth, scrap', currentHp:25 },
    { type:'runner', name:'Runner', hp:18, atk:14, def:0, init:18, xp:18, tier:'E', weakness:['Obstacles'], drops:'Cloth', currentHp:18 },
  ];
  // Depth-gated pool: only zombies whose tier rank is unlocked by current lap.
  const poolForDepth = (lap) => {
    // F at lap0, +1 tier ~every 1.5 laps; tougher Traversal zones start higher.
    const zoneBoost = zone ? Math.max(0, (zone.difficulty || 1) - 1) : 0;
    const maxRank = Math.min(7, Math.floor(lap / 1.5) + zoneBoost);
    const elig = undeadTypes.filter(u => (TIER_RANK[u.tier] ?? 0) <= maxRank);
    return elig.length ? elig : undeadTypes.filter(u => (TIER_RANK[u.tier] ?? 0) === 0);
  };

  // Animation tick
  React.useEffect(() => {
    const t = setInterval(() => setAnimFrame(f => (f + 1) % 4), 250);
    return () => clearInterval(t);
  }, []);

  // Restore checkpoint cursor from saved progress so resuming a tab doesn't
  // re-fire every checkpoint we already passed.
  React.useEffect(() => {
    if (scrollRef.lastCp == null) scrollRef.lastCp = Math.floor(scrollRef.current / CHECKPOINT_EVERY);
  }, []);

  // Mark the run active + claim authority while mounted; hand back to the
  // background engine on unmount. On mount, fold in anything the engine
  // resolved while we were away.
  // Policy encounters on the live screen: same shared step the offline engine runs.

  React.useEffect(() => {
    window.ZI.wanderMounted = true;
    const run = window.ZI.getWanderRun();
    window.ZI.syncWanderState({ active: true }); // FX4: speed and heal strength are no longer written by the screen
    const a = run.awaySummary;
    if (a && (a.kills > 0 || a.dist > 5 || a.dmgTaken > 0)) {
      const mins = Math.floor((a.secs || 0) / 60), secs = Math.round((a.secs || 0) % 60);
      setCombatLog(prev => [...prev,
        { type:'init', text:`📡 Patrol ran in the background ${mins>0?`${mins}m `:''}${secs}s — traveled ${Math.round(a.dist)}m, ${a.kills} kills, +${a.xp} XP, +${a.mats} mats${a.dmgTaken ? `, took ${Math.round(a.dmgTaken)} damage (HP now ${Math.round(run.hp || 0)})` : ''}${a.loot ? ` · ${a.loot} item${a.loot>1?'s':''} added to your pack (bank it by returning to camp)` : ''}.` },
        ...(window.ZI.returnReport ? window.ZI.returnReport(a).map(t => ({ type:'init', text:'📋 ' + t })) : []),
        ...(a.vehicle ? [{ type:'init', text:`🚗 While away, you found a working ${a.vehicle}! Cargo unloading is now unlocked for route runs.` }] : []),
        ...(a.events ? [{ type:'init', text:`⚖ ${a.events} policy encounter${a.events > 1 ? 's' : ''} resolved while away${a.retreats ? ` · fell back to rest ${a.retreats}×` : ''}:` }, ...(a.eventLog || []).map(t => ({ type:'info', text:'  ' + t }))] : []),
      ]);
    }
    if (run.paused) {
      setCombatLog(prev => [...prev,
        { type:'enemy', text:`⚠ Survivor pinned down at ${Math.round(run.scroll)}m — out of heals. Heal or Return to Base to resume.` }]);
    }
    window.ZI.syncWanderState({ awaySummary: null, paused: false });
    // R1: this screen counts as "watching" only while it is laid out and the page is foreground-visible. When watching
    // stops mid-prompt (tab hidden, page closing, leaving the screen) the prompt is cancelled and the withdrawal starts.
    const Z = window.ZI; Z._wanderWatchEl = wanderRootRef.current;
    const cancelHold = (keepAway) => {
      const s = Z.getWanderRun(); if (!s.retreatHold || !Z.retreatHoldResolve) return null;
      const away = keepAway ? (s.awaySummary || Z.WanderSim.emptySummary()) : null;
      const r = Z.retreatHoldResolve(s, 'cancel', away, []); if (keepAway) s.awaySummary = away; Z.saveWanderRun(s); return r;
    };
    const onVis = () => { if (document.visibilityState !== 'visible') { const r = cancelHold(false); if (r && r.text) setCombatLog(prev => [...prev.slice(-60), { type:'enemy', text:`↩ ${r.text}.` }]); } };
    const onHide = () => cancelHold(true);
    document.addEventListener('visibilitychange', onVis); window.addEventListener('pagehide', onHide);
    return () => {
      document.removeEventListener('visibilitychange', onVis); window.removeEventListener('pagehide', onHide);
      cancelHold(true);
      if (Z._wanderWatchEl === wanderRootRef.current) Z._wanderWatchEl = null;
      window.ZI.wanderMounted = false; // the background engine continues from the last live beat
    };
  }, []);

  // Keep the background engine fed with the live values it needs to continue.
  React.useEffect(() => {
    window.ZI.syncWanderState({
      hp: playerHp, kills: score.kills, xp: score.xp, mats: score.mats,
      healsUsed,
    });
  }, [playerHp, score, healsUsed]);

  // Live beat (spec 9, 10): the shared simulation (WanderSim via WanderEngine.liveStep) advances movement,
  // encounters, policy events and rest. The screen holds no game rules; it only animates the results.
  React.useEffect(() => {
    const show = (r) => {
      if (r.kind === 'zombie') {
        const u = undeadTypes.find(x => x.bestiaryId === r.bestiaryId) || undeadTypes.find(x => x.name === r.enemy) || undeadTypes[0];
        const maxHp = r.enemyHp || u.hp, killed = r.outcome === 'win' || r.outcome === 'healed' || r.outcome === 'revived';
        const vis = { ...u, hp: maxHp, currentHp: maxHp, id: Date.now() + Math.random() };
        setEncounter(vis); setTimeout(() => setEncounter(e => (e && e.id === vis.id ? null : e)), 3000); // display only: half the 6 s encounter gap
        // Replay the fight strike by strike: each survivor hit pops its own damage and lowers the zombie's HP bar.
        const hits = r.hits || [], gap = hits.length ? Math.min(350, 2200 / hits.length) : 0; let ehp = maxHp;
        const eTot = hits.reduce((s, h) => s + (h.by !== 's' && h.d > 0 ? h.d : 0), 0); if (eTot > 0) setHpLag(l => l + eTot);
        hits.forEach((h, i) => setTimeout(() => {
          if (h.by === 's') {
            if (h.d > 0) { ehp = Math.max(0, ehp - h.d); const now = ehp; popDmg('zombie', h.d); setEncounter(e => (e && e.id === vis.id ? { ...e, currentHp: now } : e)); setZombieAnim({ [vis.id]: 'hit' }); setTimeout(() => setZombieAnim({}), 150); }
          } else if (h.d > 0) { popDmg('player', h.d); setHpLag(l => Math.max(0, l - h.d)); }
          if (i === hits.length - 1 && killed) setEncounter(e => (e && e.id === vis.id ? { ...e, currentHp: 0 } : e));
        }, 250 + i * gap));
        const lines = [{ type:'spawn', text:`⚠ ${r.enemy} approaches!` }];
        if (r.outcome === 'escaped') lines.push({ type:'init', text:`💨 Slipped past ${r.enemy}.` });
        if (r.evadeCountered) lines.push({ type:'enemy', text:`👁 ${r.enemy} isn't fooled by the getaway.` });
        if (r.dmgDealt) lines.push({ type:'player', text:`→ You hit ${r.enemy} for ${r.dmgDealt}` });
        if (r.dmgTaken) { if (!hits.length) popDmg('player', r.dmgTaken); lines.push({ type:'enemy', text:`← ${r.enemy} hits you for ${r.dmgTaken}` }); }
        if (r.outcome === 'healed') lines.push({ type:'player', text:`⛑ You patch yourself up mid-fight (${r.healSource === 'base' ? 'base charge' : 'med kit'}).` });
        if (r.outcome === 'revived') lines.push({ type:'player', text:'💀 Revenant Infusion triggers — back on your feet.' });
        if (r.outcome === 'win' || r.outcome === 'healed') lines.push({ type:'kill', text:`💀 ${r.enemy} defeated! +${r.xp} XP · looted ${r.loot ? r.loot.name : 'nothing'}` });
        if (r.toppedUp) lines.push({ type:'player', text:'⛑ Heal used to top up.' });
        if (r.worn && r.worn.length) lines.push({ type:'enemy', text:`⚠ Worn out: ${r.worn.join(', ')} — repair in Stockpile → Storage before it helps again.` });
        if (r.outcome === 'forcedRetreat' && r.fr) lines.push({ type:'enemy', text:`☠ ${window.ZI.forcedRetreatText(r.fr)}` });
        return lines;
      }
      if (r.kind === 'policy') { if (r.dmg) popDmg('player', r.dmg); return [{ type: r.tone, text: r.text }]; }
      if (r.kind === 'checkpoint') return [{ type:'player', text:`⛺ Checkpoint reached at ${r.mark}m — safe rest stop secured.` }];
      if (r.kind === 'vehicle') return [{ type:'init', text:`🚗 Found a working ${r.name}! Cargo unloading is now unlocked for route runs.` }];
      if (r.kind === 'km') return [{ type:'init', text:`🗺 New Traversal zone unlocked: ${r.name} (${r.meters}m reached)` }];
      if (r.kind === 'resumed') return [{ type:'player', text:`🛏 Rested to ${Math.round(r.hp)} HP${r.stress != null ? `, stress ${Math.round(r.stress)}` : ''} — base charges refilled, back on patrol.` }];
      if (r.kind === 'prompt') return r.prompt.createdLive ? [{ type:'init', text:`🏚 ${r.prompt.name} sighted — venture closer or move on.` }] : [];
      if (r.kind === 'discovery') { if (r.hpLoss) popDmg('player', r.hpLoss); return [{ type: r.outcome === 'failed' ? 'enemy' : 'init', text: '🏚 ' + r.text }, ...(r.ambush ? [{ type:'enemy', text:'⚠ Ambushed at the site!' }, ...show(r.ambush)] : [])]; }
      if (r.kind === 'tooHeavy') return [{ type:'enemy', text:`🎒 Too heavy — left ${r.names.join(', ')} behind.` }];
      if (r.kind === 'withdrawn') return [{ type:'player', text:`↩ Reached the checkpoint${r.banked ? ` — ${r.banked} item${r.banked > 1 ? 's' : ''} banked` : ''}. Resting until HP ≥ 80%.` }];
      if (r.kind === 'ruleWithdraw') return [{ type:'enemy', text:`↩ ${r.text}.` }];
      if (r.kind === 'retreatHold') return [{ type:'enemy', text:`⚠ ${r.text}` }];
      if (r.kind === 'retreatEvade') return [{ type: r.ok ? 'player' : 'enemy', text:`${r.ok ? '💨' : '↩'} ${r.text}.` }];
      if (r.kind === 'breaking') return [{ type:'enemy', text:`💥 ${window.ZI.forcedRetreatText(r)}` }];
      // BAL-A A8: walk back, Broken, return home and injury lines
      if (r.kind === 'broken') return [{ type:'enemy', text:`💔 ${r.text}` }];
      if (r.kind === 'brokenReleased') return [{ type:'player', text:`💪 ${r.text}` }];
      if (r.kind === 'walkGroup') return [{ type: r.reaction === 'hostile' ? 'enemy' : r.reaction === 'friendly' ? 'player' : 'init', text:`👥 ${r.text}` }];
      if (r.kind === 'pursuer') { if (r.dmg) popDmg('player', r.dmg); return [{ type: r.outcome === 'escaped' ? 'player' : 'enemy', text:`🧟 ${r.text}` }]; }
      if (r.kind === 'returned') return [{ type:'player', text:`🧭 ${r.text}` }];
      if (r.kind === 'injuryTreated') return [{ type:'player', text:`🩹 ${r.text}` }];
      return [];
    };
    const t = setInterval(() => {
      if (downed) return;
      const results = window.ZI.WanderEngine.liveStep();
      const run = window.ZI.getWanderRun();
      scrollRef.current = run.scroll || 0; setScroll(run.scroll || 0);
      setPlayerHp(run.hp); setHealsUsed(run.healsUsed || 0);
      setScore({ kills: run.kills || 0, xp: run.xp || 0, mats: run.mats || 0 });
      setCarried(run.carried || []);
      if (run.checkpoints) { setCheckpoints(run.checkpoints); setLastCheckpoint(run.lastCheckpoint || 0); }
      if (!results.length) return;
      // Retreat-related events are always logged; other events are trimmed to the latest 6 per beat.
      const KEEP = new Set(['ruleWithdraw','withdrawn','breaking','retreatEvade','retreatHold','resumed','broken','brokenReleased','walkGroup','pursuer','returned','injuryTreated']);
      const keep = (r) => KEEP.has(r.kind) || (r.kind === 'zombie' && r.outcome === 'forcedRetreat');
      const recent = results.slice(-6), older = results.slice(0, -6), olderKeep = older.filter(keep);
      const lines = [...olderKeep, ...recent].flatMap(show);
      const dropped = older.length - olderKeep.length;
      if (dropped > 0) lines.unshift({ type:'info', text:`… ${dropped} earlier event${dropped > 1 ? 's' : ''} resolved` });
      setCombatLog(prev => [...prev.slice(-60), ...lines]);
    }, 1000);
    return () => clearInterval(t);
  }, [downed]);



  // Auto-scroll log
  React.useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [combatLog]);

  // ─── ENVIRONMENTAL ARTIFACTS (procedural, scroll-aware) ─────────────────
  // Generate stable layers of background, midground, foreground objects
  const artifacts = React.useMemo(() => {
    const seed = (n) => Math.sin(n * 12.9898) * 43758.5453 - Math.floor(Math.sin(n * 12.9898) * 43758.5453);
    const items = [];
    // Background buildings (slow scroll)
    for (let i = 0; i < 20; i++) {
      const r = seed(i + 100);
      const r2 = seed(i + 200);
      items.push({
        layer: 'bg', kind: 'building', id: `bg-b-${i}`,
        x: i * 280 + r * 60, y: 0,
        w: 80 + r2 * 90, h: 110 + r * 80,
        color: ['#1a1408','#221a10','#1e1610'][Math.floor(r * 3)],
        windows: Math.floor(r2 * 5) + 2,
      });
    }
    // Midground: cars, debris piles
    for (let i = 0; i < 14; i++) {
      const r = seed(i + 300);
      const r2 = seed(i + 400);
      const types = ['car','debris','stoneChunk','barrel','tireStack'];
      items.push({
        layer: 'mid', kind: types[Math.floor(r * types.length)], id: `mid-${i}`,
        x: i * 340 + r * 100,
        variant: Math.floor(r2 * 3),
      });
    }
    // Foreground: grass tufts, small stones, blood, bones
    for (let i = 0; i < 40; i++) {
      const r = seed(i + 500);
      const r2 = seed(i + 600);
      const types = ['grass','stone','bloodPool','bone','rubble','sign'];
      items.push({
        layer: 'fg', kind: types[Math.floor(r * types.length)], id: `fg-${i}`,
        x: i * 110 + r * 50,
        variant: Math.floor(r2 * 4),
      });
    }
    return items;
  }, []);

  // Command handler
  const runCommand = (raw) => {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    const parts = cmd.split(/\s+/);
    const verb = parts[0];
    const arg  = parts[1];

    setCombatLog(prev => [...prev, { type:'cmd', text:`> ${raw}` }]);

    const log = (text, type='info') => setCombatLog(prev => [...prev, { type, text }]);

    // Batch 2B (spec 13.7): typed gameplay commands and the 60/day limit are retired; Heal, Scout, Push On and
    // Retreat are buttons. Only the UI helpers status, clear and help remain.
    if (verb === 'help' || verb === '?') {
      log('Use the buttons above for Heal, Scout, Push On, Retreat and Change Route. Typed commands: status, clear, help.', 'info');
    } else if (!['status', 'stat', 'clear'].includes(verb)) {
      log(`"${verb}" is now a button above — typed commands are status, clear and help.`, 'info');
    } else if (verb === 'status' || verb === 'stat') {
      log(`HP: ${Math.round(playerHp * 10) / 10}/${hpMax} · Kills: ${score.kills} · XP: ${score.xp} · Mats: ${score.mats}`, 'info');
      log(`Distance: ${Math.round(scrollRef.current)}m · Active enemy: ${encounter?.name || 'none'}`, 'info');
    } else if (verb === 'clear') {
      setCombatLog([{ type:'info', text:'Log cleared' }]);
    } else {
      log(`Unknown command: "${verb}" — type 'help' for list`, 'enemy');
    }
  };

  // Use an equipped consumable (one-shot — consumes the item from the loadout).
  const useConsumable = (slotId) => {
    const id = loadout[slotId]; if (!id) return;
    const it = window.ZI.getGearItem(id); if (!it) return;
    const e = it.effect || {};
    const msgs = [];
    if (e.heal) { const mx = window.ZI.maxHp ? window.ZI.maxHp() : 100; window.ZI.wanderAct(s => { s.hp = Math.min(mx, s.hp + e.heal); }); setPlayerHp(p => Math.min(mx, p + e.heal)); if (downed && e.heal > 0) setDowned(false); msgs.push(`+${e.heal} HP`); }
    const until = Date.now() + (e.durSec || 0) * 1000;
    if (e.speedPct) { window.ZI.addBuff({ speedPct:e.speedPct, durationSec:e.durSec || 30 }); setBuffs(b => ({ ...b, speed:{ until, val:e.speedPct } })); msgs.push(`+${e.speedPct}% speed`); } // FX4 (D-FX4b): shared buff store
    // B13: combat buffs go to the canonical buff store so the shared simulation (live and offline) applies them.
    if (e.dmgPct)   { window.ZI.addBuff({ dmgPct:e.dmgPct, durationSec:e.durSec || 30 }); setBuffs(b => ({ ...b, dmg:{ until, val:e.dmgPct } }));     msgs.push(`+${e.dmgPct}% dmg`); }
    if (e.armorAdd) { window.ZI.addBuff({ armorAdd:e.armorAdd, durationSec:e.durSec || 30 }); setBuffs(b => ({ ...b, armor:{ until, val:e.armorAdd } })); msgs.push(`+${e.armorAdd} armor`); }
    if (e.lootPct)  { setBuffs(b => ({ ...b, loot:{ until, val:e.lootPct } }));   msgs.push(`+${e.lootPct}% loot`); }
    // §4/§5 — evade burst + flat XP-bonus buffs go to the global buff store
    // (read by escapeChance and the XP bus).
    if (e.evade)    { window.ZI.addBuff({ evade:e.evade, durationSec:e.durSec || 30 }); msgs.push(`+${e.evade} escape`); }
    if (e.xpBonus)  { window.ZI.addBuff({ xpBonus:e.xpBonus, durationSec:e.durSec || 60 }); msgs.push(`+${e.xpBonus.amount} ${e.xpBonus.track} XP/action`); }
    if (e.revive)   { setReviveCharge(e.revive); msgs.push(`revive primed (${e.revive} HP)`); }
    if (e.killEnemy && encounter) {
      setScore(s => ({ kills: s.kills + 1, xp: s.xp + encounter.xp, mats: s.mats + 3 }));
      setCarried(c => [...c, { name: `${encounter.name} salvage`, value: encounter.xp, rarity:'Common' }]);
      msgs.push(`${encounter.name} cleared`);
      setEncounter(null);
    } else if (e.stun && encounter) { msgs.push(`${encounter.name} stunned — slipped past`); setEncounter(null); }
    if (e.durSec && (e.speedPct || e.dmgPct || e.armorAdd || e.lootPct)) msgs.push(`${e.durSec}s`);
    setCombatLog(prev => [...prev, { type:'player', text:`${it.icon} ${it.name} — ${msgs.join(' · ') || 'used'}.` }]);
    // Consume the item (remove from loadout). Revive items stay until they trigger.
    if (!e.revive) { const lo = window.ZI.getLoadout(); lo[slotId] = null; window.ZI.saveLoadout(lo); setLoadout({ ...lo }); }
  };

  // Equipped consumable slots for the HUD quick-use bar.
  const consumableSlots = window.ZI.GEAR_SLOTS.filter(s => s.accepts === 'consumable' && loadout[s.id]);

  // Durability drain: wear the active weapon + body armor per combat encounter.
  const wearEquipped = () => {
    const Z = window.ZI, lo = Z.getLoadout();
    const worn = [];
    const drainSlot = (slotId) => {
      const it = lo[slotId] && Z.getGearItem(lo[slotId]);
      if (!it || !Z.itemHasDurability(it)) return;
      const before = Z.itemDurability(it);
      Z.applyWear(it, Z.itemDrainPerUse(it) * (Z.fortWearMult ? Z.fortWearMult() : 1));
      const after = Z.itemDurability(it);
      if (after && after.current <= 0 && before && before.current > 0) worn.push(it.name);
    };
    const weaponSlot = ['primary','secondary','melee'].find(sl => lo[sl]);
    if (weaponSlot) drainSlot(weaponSlot);
    drainSlot('vest');
    if (worn.length) setCombatLog(prev => [...prev, { type:'enemy', text:`⚠ Worn out: ${worn.join(', ')} — repair in Stockpile → Storage before it helps again.` }]);
    setLoadout({ ...lo }); // force re-resolve (durability lives in localStorage)
  };

  return (
    <div ref={wanderRootRef} className="screen-enter" data-wander-layout={narrow ? 'stacked' : 'side'} style={{ display:'flex', flexDirection:'column', height:'100%', overflowX:'hidden', overflowY: narrow ? 'auto' : 'hidden', background:'#0a0808', position:'relative' }}>

      {wTut && <WanderTutorial key={wTutStart} startAt={wTutStart} rootRef={wanderRootRef} onDone={() => { window.ZI.setTutDone('zi_wander_tut_done'); setWTut(false); }}/>}
      {!wTut && <window.TutStepMenu label="Wandering" side="right" inset={12} zIndex={30} steps={window.WANDER_TUT_STEPS.map(t => t.title)} onPick={n => { setWTutStart(n); setWTut(true); }}/>}
      {/* HUD bar */}
      <div className="wander-hud" style={{
        display:'flex', flexDirection:'column', gap:8, padding:'8px 12px', background:'var(--bg3)',
        borderBottom:'1px solid var(--border)', flexShrink:0,
      }}>
        {/* Row 1 — where you are, survivor health, haul */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px 16px', flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:0 }}>
            <div style={{ display:'flex', flexDirection:'column', lineHeight:1.2 }}>
              <span style={{ fontFamily:'var(--font-title)', fontSize:16, color:'var(--amber)' }}>WANDERING — {zone ? zone.name.replace(/ [A-H]\d+$/, '') : 'Patrol Zone'}</span>
              {zone && <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'#7fe0ff' }}>◉ {zoneCoord}{zoneBiome ? ` · ${zoneBiome.name}` : ''}</span>}
            </div>
            {setScreen && <button onClick={() => setScreen('traversal')} title="See where you are on the satellite map" style={{ fontFamily:'var(--font-mono)', fontSize:12, padding:'5px 10px', cursor:'pointer', background:'var(--bg4)', border:'1px solid #7fe0ff', color:'#7fe0ff' }}>🛰 Map</button>}
          </div>
          <div data-tut="hp" style={{ flex:'1 1 160px', minWidth:140, maxWidth:260 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', marginBottom:3 }}>
              <span>{activeSurvivor.name}{(() => { // BAL-A D6: status icons (Broken first), effects in the tooltip
                const Z = window.ZI, br = Z.isBroken && Z.isBroken(), inj = Z.getInjury && Z.getInjury(); if (!br && !inj) return null; const T = Z.BROKEN_TABLE;
                return (<span data-status-icons="1" style={{ marginLeft:6, display:'inline-flex', gap:4 }}>
                  {br && <span data-status="broken" title={`Broken — max HP −${Math.abs(T.maxHpPct)}%, ${T.attackLossPct}% of attacks falter, +${T.dmgTakenPct}% damage taken, ${Math.abs(T.speedPct)}% slower. Each completed rest has a 1-in-6 chance to recover; after the third failed roll it recovers anyway and worn gear loses some durability.`} style={{ color:'var(--red2)', cursor:'help' }}>💔</span>}
                  {inj && <span data-status="injured" title={`Injured — combat and athletics −${Math.round(inj.pct * 100)}%. About ${Math.max(1, Math.ceil(inj.remainingMs / 60000))} min left (paused while the game isn't visible). A Field Bandage treats it.`} style={{ color:'var(--amber)', cursor:'help' }}>🩹</span>}
                </span>); })()}</span>
              <span style={{ color: hpShown>40 ? 'var(--green)' : 'var(--red2)' }}>HP {Math.round(hpShown)}/{hpMax}</span>
            </div>
            <ProgressBar value={hpShown / hpMax * 100} color={hpShown>40?'var(--green)':'var(--red2)'} height={7} animated={hpShown<30}/>
          </div>
          <div data-tut="haul" style={{ fontFamily:'var(--font-mono)', fontSize:13, color:'var(--green)' }}>
            {score.kills} Kills · {score.xp} XP · {score.mats} Mats · 🎒 {carried.length} carried
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', marginLeft:'auto' }}>
            {idleMode ? 'IDLE · auto-heal at 30% HP' : 'AUTO-COMBAT · initiative turns'}
          </div>
        </div>
        {/* Row 2 — distance + journey checkpoints */}
        <div data-tut="distance" style={{ flex:'1 1 100%', minWidth:0 }}>
          {(() => {
            const lap = Math.floor(scroll / 100);
            const lapColors = ['var(--amber)','var(--green2)','var(--blue)','var(--purple)','var(--red2)','#e0e0e0','#f0d040'];
            const fillColor = lapColors[lap % lapColors.length];
            const prevColor = lap > 0 ? lapColors[(lap - 1) % lapColors.length] : null;
            // Logarithmic difficulty multiplier: x1.0 at lap 0, scaling up per lap.
            const mult = (1 + Math.log2(lap + 1) * 0.35).toFixed(1);
            return (
              <>
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:2 }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', letterSpacing:'0.06em' }}>DISTANCE TRAVELED</span>
                  {lap > 0 && (
                    <span style={{ display:'flex', alignItems:'center', gap:3, fontFamily:'var(--font-mono)', fontSize:12, color:fillColor }}>
                      {Array.from({ length: Math.min(lap, 8) }).map((_, i) => (
                        <span key={i} style={{ fontSize:13 }}>💀</span>
                      ))}
                      {lap > 8 && <span style={{ color:'var(--text3)' }}>+{lap - 8}</span>}
                      <span style={{ color:'var(--red2)', fontWeight:'bold', marginLeft:2 }}>x{mult}</span>
                    </span>
                  )}
                </div>
                {/* Lap-aware meter: previous lap color stays full underneath, current lap refills on top */}
                <div style={{ height:7, background: prevColor || 'var(--bg4)', borderRadius:1, overflow:'hidden' }}>
                  <div style={{ width:`${(scroll % 100)}%`, height:'100%', background:fillColor, transition:'width 0.1s linear' }}/>
                </div>
              </>
            );
          })()}
          {/* Linear journey slider — persists across tabs; checkpoints are selectable points */}
          {(() => {
            const maxReached = Math.max(scroll, lastCheckpoint, CHECKPOINT_EVERY);
            const pct = (m) => Math.max(0, Math.min(100, (m / maxReached) * 100));
            // RB1c: the distance bar is display only; checkpoints are markers, not travel buttons.
            return (
              <div style={{ marginTop:6 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', marginBottom:3 }}>
                  <span>0m</span>
                  <span style={{ color:'var(--amber)' }}>{Math.round(scroll)}m</span>
                  <span>{Math.round(maxReached)}m</span>
                </div>
                <div style={{ position:'relative', height:12, background:'var(--bg4)', borderRadius:6, border:'1px solid var(--border)' }}>
                  <div style={{ position:'absolute', left:0, top:0, height:'100%', width:`${pct(scroll)}%`, background:'var(--accent, var(--amber))', borderRadius:6, transition:'width 0.12s linear' }}/>
                  {checkpoints.map(m => (
                    <div key={m}
                      title={`Checkpoint at ${m}m`}
                      style={{ position:'absolute', top:'50%', left:`${pct(m)}%`, transform:'translate(-50%,-50%)',
                        width:11, height:11, borderRadius:'50%', background:'var(--bg2)', boxSizing:'border-box',
                        border:`2px solid ${scroll >= m ? 'var(--green)' : 'var(--text3)'}`, padding:0, zIndex:2 }}/>
                  ))}
                  <div style={{ position:'absolute', top:'50%', left:`${pct(scroll)}%`, transform:'translate(-50%,-50%)',
                    width:5, height:18, background:'var(--text)', borderRadius:2, pointerEvents:'none', zIndex:3 }}/>
                </div>
              </div>
            );
          })()}
        </div>
        {/* Row 3 — key actions up front, the rest in a dropdown */}
        <div data-tut="actions" style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <div style={{ position:'relative' }}>
            {(() => { const P = window.ZI.POLICIES[policy.id]; return (
              <button onClick={() => { setPolMenu(o => !o); setPolMsg(null); }} title="Standing policy — decides which encounters your survivor meets and how they resolve" style={{
                fontFamily:'var(--font-mono)', fontSize:12, padding:'6px 11px', cursor:'pointer',
                background: polMenu ? 'var(--bg4)' : 'transparent', border:`1px solid ${P.color}`, color:P.color,
              }}>{P.icon} {P.name} ▾</button>); })()}
            {polMenu && (
              <>
                <div onClick={() => setPolMenu(false)} style={{ position:'fixed', inset:0, zIndex:40 }}/>
                <div className="panel" style={{ position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:50, width:300, padding:8, background:'var(--bg2)', borderColor:'var(--amber)', boxShadow:'0 8px 24px rgba(0,0,0,0.6)' }}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--amber)', letterSpacing:'0.1em', marginBottom:6 }}>STANDING POLICY</div>
                  {Object.values(window.ZI.POLICIES).map(P => {
                    const locked = P.id === 'heinous' && !window.ZI.heinousUnlocked();
                    const on = P.id === policy.id;
                    return (
                      <button key={P.id} disabled={locked} onClick={() => choosePolicy(P.id)} style={{
                        display:'block', width:'100%', textAlign:'left', padding:'7px 9px', marginBottom:4, cursor: locked ? 'not-allowed' : 'pointer',
                        background: on ? 'var(--bg4)' : 'var(--bg3)', border:`1px solid ${on ? P.color : 'var(--border)'}`, opacity: locked ? 0.55 : 1,
                      }}>
                        <span style={{ display:'block', fontFamily:'var(--font-body)', fontSize:14, color:P.color }}>{P.icon} {P.name}{on ? ' · active' : ''}{locked ? ' 🔒' : ''}</span>
                        <span style={{ display:'block', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', lineHeight:1.4 }}>{locked ? 'Locked — it begins with blood at the Hearthguard\'s gate.' : P.desc}</span>
                      </button>
                    );
                  })}
                  {window.ZI.policyCooldownLeftMs() > 0 && <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', marginTop:4 }}>Next change in {Math.ceil(window.ZI.policyCooldownLeftMs() / 60000)} min (4 h cooldown).</div>}
                  {polMsg && <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--red2)', marginTop:4 }}>{polMsg}</div>}
                </div>
              </>
            )}
          </div>
        <ActiveControls setScreen={setScreen} onLog={(text, type) => setCombatLog(prev => [...prev.slice(-60), { type, text }])}/>
        <button
          onClick={() => setMoveMode(m => m === 'walk' ? 'jog' : m === 'jog' ? 'run' : 'walk')}
          style={{
            fontFamily:'var(--font-mono)', fontSize:12, padding:'6px 11px', cursor:'pointer',
            background: moveMode === 'run' ? 'rgba(200,97,42,0.2)' : moveMode === 'jog' ? 'rgba(76,175,125,0.15)' : 'var(--bg4)',
            color: moveMode === 'run' ? 'var(--red2)' : moveMode === 'jog' ? 'var(--green)' : 'var(--text3)',
            border:`1px solid ${moveMode === 'run' ? 'var(--red2)' : moveMode === 'jog' ? 'var(--green)' : 'var(--border)'}`,
          }}
          title={`Athletics ${ATHLETICS}/10 · ${moveSpeed.toFixed(1)} m/s`}>
          {moveMode === 'walk' ? '🚶 Walk 3m/s' : moveMode === 'jog' ? `🏃 Jog ${moveSpeed.toFixed(1)}m/s` : `⚡ Run ${moveSpeed.toFixed(1)}m/s`}
        </button>
          <div style={{ position:'relative' }}>
            <button onClick={() => setHudMenu(o => !o)} style={{
              fontFamily:'var(--font-mono)', fontSize:12, padding:'6px 11px', cursor:'pointer',
              background: hudMenu ? 'var(--bg4)' : 'transparent', border:`1px solid ${hudMenu ? 'var(--amber)' : 'var(--border)'}`, color:'var(--text)',
            }}>▾ More actions{consumableSlots.length ? ` · ${consumableSlots.length} item${consumableSlots.length > 1 ? 's' : ''}` : ''}</button>
            {hudMenu && (
              <>
                <div onClick={() => setHudMenu(false)} style={{ position:'fixed', inset:0, zIndex:40 }}/>
                <div className="panel wander-menu" onClick={() => setHudMenu(false)} style={{ position:'absolute', top:'calc(100% + 4px)', left:0, zIndex:50, minWidth:240, padding:6, display:'flex', flexDirection:'column', gap:6, background:'var(--bg2)', borderColor:'var(--amber)', boxShadow:'0 8px 24px rgba(0,0,0,0.6)' }}>
        <button
          onClick={() => setIdleMode(m => !m)}
          style={{
            fontFamily:'var(--font-mono)', fontSize:12, padding:'6px 11px', cursor:'pointer',
            background: idleMode ? 'rgba(168,85,247,0.18)' : 'var(--bg4)',
            color: idleMode ? 'var(--purple)' : 'var(--text3)',
            border:`1px solid ${idleMode ? 'var(--purple)' : 'var(--border)'}`,
          }}>
          {idleMode ? '◉ IDLE RUN' : '○ Idle Run'}
        </button>
        <button
          onClick={() => {
            // RB1a: the player's manual withdrawal, through the shared retreat rule (walk back to the last checkpoint,
            // one getaway roll, then rest). A second press while walking tries the getaway. RB1d: the pace is kept.
            const r = window.ZI.wanderAct(s => window.ZI.wanderRetreatPress(s));
            if (!r) return;
            setCombatLog(prev => [...prev.slice(-60), r.ok === false ? { type:'enemy', text:`⚠ ${r.reason}` }
              : { type:'player', text:`⏪ ${r.text}${/[.)]$/.test(r.text) ? '' : '.'}` }]);
          }}
          style={{
            fontFamily:'var(--font-mono)', fontSize:12, padding:'6px 11px', cursor:'pointer',
            background:'var(--bg4)', color:'var(--amber)', border:'1px solid var(--amber)',
          }}
          title="Withdraw to the last checkpoint now (takes time; one getaway roll; then rest). Press again while withdrawing to try the getaway.">
          {(() => { const wr = window.ZI.getWanderRun(); return wr.withdrawing ? `⏪ Run Back · ${Math.round(wr.withdrawLeftM || 0)}m` : '⏪ Run Back'; })()}
        </button>
        <button
          onClick={() => setShowGear(g => !g)}
          style={{
            fontFamily:'var(--font-mono)', fontSize:12, padding:'6px 11px', cursor:'pointer',
            background: showGear ? 'rgba(74,128,224,0.18)' : 'var(--bg4)',
            color: showGear ? 'var(--blue)' : 'var(--text2)',
            border:`1px solid ${showGear ? 'var(--blue)' : 'var(--border)'}`,
          }}
          title="Equip crafted gear to modify survivor stats">
          🎒 Gear {gearStats.filled > 0 ? `(${gearStats.filled})` : ''}
        </button>
        {consumableSlots.map(s => {
          const it = window.ZI.getGearItem(loadout[s.id]);
          return (
            <button key={s.id} onClick={() => useConsumable(s.id)}
              title={`Use ${it.name} — ${it.desc}`}
              style={{
                fontFamily:'var(--font-mono)', fontSize:12, padding:'6px 11px', cursor:'pointer',
                background:'rgba(80,200,120,0.12)', color:'var(--green)', border:'1px solid var(--green)',
              }}>
              {it.icon} Use
            </button>
          );
        })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Game scene */}
      <div style={{ flex: narrow ? '0 0 auto' : 1, display:'flex', flexDirection: narrow ? 'column' : 'row', overflow:'hidden' }}>
        <div data-tut="scene" style={{
          flex: narrow ? '0 0 340px' : 1, height: narrow ? 340 : undefined, position:'relative', overflow:'hidden',
          background: `linear-gradient(180deg, #0a0808 0%, #1a1410 60%, #2a1e14 100%)`,
        }}>
          {/* Parallax stars/dust (back layer, slow scroll) */}
          <div style={{
            position:'absolute', inset:0,
            backgroundImage: `
              radial-gradient(circle at ${(scroll*0.3) % 100}% 20%, #d4c9b0 1px, transparent 2px),
              radial-gradient(circle at ${(scroll*0.5 + 30) % 100}% 30%, #d4c9b0 1px, transparent 2px),
              radial-gradient(circle at ${(scroll*0.2 + 60) % 100}% 40%, #d4c9b0 1px, transparent 2px)`,
            backgroundSize: '200px 200px',
            opacity: 0.3, pointerEvents:'none',
          }}/>

          {/* Background ruins silhouette + buildings (mid layer, medium scroll) */}
          <div style={{
            position:'absolute', bottom:'40%', left:0, right:0, height:'30%',
            background: `linear-gradient(180deg, transparent 0%, #1e1410 100%)`,
            opacity:0.5,
          }}/>
          {/* Background buildings — varied silhouettes */}
          {artifacts.filter(a=>a.layer==='bg').map(b => {
            const left = (b.x - scroll * 0.4) % 5600;
            const adjLeft = left < -200 ? left + 5600 : left;
            return (
              <div key={b.id} style={{
                position:'absolute',
                left: adjLeft, bottom: '40%',
                width: b.w, height: b.h,
                background: b.color, opacity: 0.85,
              }}>
                {/* Windows */}
                {Array.from({length: b.windows}).map((_, wi) => {
                  const lit = (wi + b.x) % 5 === 0;
                  return (
                    <div key={wi} style={{
                      position:'absolute',
                      left: 8 + (wi % 3) * 22, top: 14 + Math.floor(wi / 3) * 20,
                      width: 8, height: 10,
                      background: lit ? '#c8a040' : '#08060a',
                      opacity: lit ? 0.7 : 1,
                    }}/>
                  );
                })}
                {/* Roof detail */}
                <div style={{ position:'absolute', top:-3, left:0, right:0, height:3, background:'#000' }}/>
              </div>
            );
          })}

          {/* Ground (foreground, fast scroll) */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0, height:'40%',
            background: `linear-gradient(180deg, #2a1e14 0%, #1a1208 100%)`,
          }}/>
          {/* Ground tile pattern */}
          <div style={{
            position:'absolute', bottom:0, left:0, right:0, height:'40%',
            backgroundImage: `repeating-linear-gradient(90deg, #2a1e14 0px, #2a1e14 30px, #3a2818 30px, #3a2818 32px)`,
            transform:`translateX(${-(scroll * 3) % 64}px)`,
            opacity: 0.6,
          }}/>

          {/* MIDGROUND ARTIFACTS — cars, debris, stones (mid scroll) */}
          {artifacts.filter(a=>a.layer==='mid').map(item => {
            const left = (item.x - scroll * 1.8) % 4800;
            const adjLeft = left < -200 ? left + 4800 : left;

            if (item.kind === 'car') {
              const colors = ['#3a2820','#2a1e14','#5a3424'];
              return (
                <div key={item.id} style={{
                  position:'absolute', left: adjLeft, bottom: '32%',
                  width: 80, height: 36,
                }}>
                  <svg viewBox="0 0 40 18" width="80" height="36" shapeRendering="crispEdges">
                    {/* Body */}
                    <rect x="2" y="6" width="36" height="8" fill={colors[(item.variant || 0) % 3]}/>
                    <rect x="6" y="2" width="28" height="5" fill={colors[(item.variant || 0) % 3]} opacity="0.8"/>
                    {/* Windows broken */}
                    <rect x="8" y="3" width="10" height="4" fill="#0a0a0a"/>
                    <rect x="22" y="3" width="10" height="4" fill="#0a0a0a"/>
                    <rect x="15" y="3" width="2" height="2" fill="#3a2820"/>
                    {/* Wheels - flat */}
                    <rect x="4" y="14" width="8" height="3" fill="#0a0808"/>
                    <rect x="28" y="14" width="8" height="3" fill="#0a0808"/>
                    {/* Hood damage */}
                    <rect x="3" y="6" width="4" height="2" fill="#1a1008"/>
                    <rect x="10" y="6" width="3" height="1" fill="#1a1008"/>
                    {/* Rust spots */}
                    <rect x="20" y="8" width="3" height="2" fill="#5a2810"/>
                  </svg>
                </div>
              );
            }
            if (item.kind === 'debris') {
              return (
                <div key={item.id} style={{
                  position:'absolute', left: adjLeft, bottom: '32%',
                  width: 48, height: 20,
                }}>
                  <svg viewBox="0 0 24 10" width="48" height="20" shapeRendering="crispEdges">
                    <rect x="0" y="5" width="6" height="5" fill="#3a2818"/>
                    <rect x="6" y="3" width="5" height="7" fill="#4a3024"/>
                    <rect x="11" y="6" width="4" height="4" fill="#3a2818"/>
                    <rect x="15" y="4" width="5" height="6" fill="#4a3024"/>
                    <rect x="20" y="6" width="4" height="4" fill="#3a2818"/>
                    <rect x="3" y="6" width="1" height="1" fill="#1a1008"/>
                    <rect x="8" y="5" width="1" height="1" fill="#1a1008"/>
                    <rect x="17" y="6" width="1" height="1" fill="#1a1008"/>
                  </svg>
                </div>
              );
            }
            if (item.kind === 'stoneChunk') {
              return (
                <div key={item.id} style={{
                  position:'absolute', left: adjLeft, bottom: '32%',
                  width: 32, height: 24,
                }}>
                  <svg viewBox="0 0 16 12" width="32" height="24" shapeRendering="crispEdges">
                    <polygon points="2,12 0,8 4,4 8,2 12,3 14,8 12,12" fill="#3a3830"/>
                    <polygon points="3,11 1,8 4,5 8,3 11,4 13,8 11,11" fill="#4a4838"/>
                    <rect x="5" y="6" width="2" height="2" fill="#5a5848"/>
                    <rect x="9" y="7" width="2" height="2" fill="#5a5848"/>
                  </svg>
                </div>
              );
            }
            if (item.kind === 'barrel') {
              const c = ['#5a3424','#3a4824','#4a3a20'][(item.variant || 0) % 3];
              return (
                <div key={item.id} style={{
                  position:'absolute', left: adjLeft, bottom: '32%',
                  width: 20, height: 28,
                }}>
                  <svg viewBox="0 0 10 14" width="20" height="28" shapeRendering="crispEdges">
                    <rect x="1" y="2" width="8" height="11" fill={c}/>
                    <rect x="1" y="2" width="8" height="1" fill="#0a0a0a"/>
                    <rect x="1" y="6" width="8" height="1" fill="#0a0a0a"/>
                    <rect x="1" y="11" width="8" height="1" fill="#0a0a0a"/>
                    <rect x="0" y="3" width="1" height="9" fill="#1a1008"/>
                    <rect x="9" y="3" width="1" height="9" fill="#1a1008"/>
                    <rect x="3" y="8" width="2" height="1" fill="#1a1008"/>
                  </svg>
                </div>
              );
            }
            if (item.kind === 'tireStack') {
              return (
                <div key={item.id} style={{
                  position:'absolute', left: adjLeft, bottom: '32%',
                  width: 28, height: 24,
                }}>
                  <svg viewBox="0 0 14 12" width="28" height="24" shapeRendering="crispEdges">
                    <rect x="1" y="8" width="12" height="3" fill="#0a0808"/>
                    <rect x="2" y="5" width="10" height="3" fill="#1a1408"/>
                    <rect x="3" y="2" width="8" height="3" fill="#0a0808"/>
                    <rect x="4" y="3" width="6" height="1" fill="#3a2818"/>
                    <rect x="3" y="6" width="8" height="1" fill="#3a2818"/>
                    <rect x="2" y="9" width="10" height="1" fill="#3a2818"/>
                  </svg>
                </div>
              );
            }
            return null;
          })}

          {/* FOREGROUND ARTIFACTS — grass, stones, blood, bones, signs (fast scroll) */}
          {artifacts.filter(a=>a.layer==='fg').map(item => {
            const left = (item.x - scroll * 3) % 4400;
            const adjLeft = left < -100 ? left + 4400 : left;

            if (item.kind === 'grass') {
              const heights = [4, 6, 8];
              const colors = ['#3a4830','#4a5840','#2a3820'];
              return (
                <div key={item.id} style={{
                  position:'absolute', left: adjLeft, bottom: '4%',
                  width: 16, height: 12,
                }}>
                  <svg viewBox="0 0 8 6" width="16" height="12" shapeRendering="crispEdges">
                    <rect x="1" y={6 - heights[(item.variant || 0) % 3] / 1.5} width="1" height={heights[(item.variant || 0) % 3] / 1.5} fill={colors[(item.variant || 0) % 3]}/>
                    <rect x="3" y={6 - heights[(item.variant || 0) % 3]} width="1" height={heights[(item.variant || 0) % 3]} fill={colors[(item.variant || 0) % 3]}/>
                    <rect x="5" y={6 - heights[(item.variant || 0) % 3] / 1.3} width="1" height={heights[(item.variant || 0) % 3] / 1.3} fill={colors[(item.variant || 0) % 3]}/>
                  </svg>
                </div>
              );
            }
            if (item.kind === 'stone') {
              return (
                <div key={item.id} style={{
                  position:'absolute', left: adjLeft, bottom: '5%',
                  width: 12, height: 8,
                }}>
                  <svg viewBox="0 0 6 4" width="12" height="8" shapeRendering="crispEdges">
                    <polygon points="0,4 1,1 3,0 5,1 6,4" fill="#3a3830"/>
                    <rect x="2" y="2" width="1" height="1" fill="#4a4838"/>
                  </svg>
                </div>
              );
            }
            if (item.kind === 'bloodPool') {
              return (
                <div key={item.id} style={{
                  position:'absolute', left: adjLeft, bottom: '3%',
                  width: 28, height: 6,
                }}>
                  <svg viewBox="0 0 14 3" width="28" height="6" shapeRendering="crispEdges">
                    <ellipse cx="7" cy="2" rx="6" ry="1.5" fill="#3a0808" opacity="0.8"/>
                    <ellipse cx="5" cy="2" rx="2" ry="0.5" fill="#5a0a0a"/>
                    <rect x="11" y="2" width="2" height="1" fill="#3a0808"/>
                  </svg>
                </div>
              );
            }
            if (item.kind === 'bone') {
              return (
                <div key={item.id} style={{
                  position:'absolute', left: adjLeft, bottom: '5%',
                  width: 20, height: 6,
                }}>
                  <svg viewBox="0 0 10 3" width="20" height="6" shapeRendering="crispEdges">
                    <rect x="0" y="0" width="2" height="3" fill="#d0c0a0"/>
                    <rect x="2" y="1" width="6" height="1" fill="#d0c0a0"/>
                    <rect x="8" y="0" width="2" height="3" fill="#d0c0a0"/>
                  </svg>
                </div>
              );
            }
            if (item.kind === 'rubble') {
              return (
                <div key={item.id} style={{
                  position:'absolute', left: adjLeft, bottom: '4%',
                  width: 20, height: 10,
                }}>
                  <svg viewBox="0 0 10 5" width="20" height="10" shapeRendering="crispEdges">
                    <rect x="0" y="3" width="3" height="2" fill="#3a2818"/>
                    <rect x="3" y="2" width="2" height="3" fill="#4a3024"/>
                    <rect x="5" y="3" width="2" height="2" fill="#3a2818"/>
                    <rect x="7" y="1" width="3" height="4" fill="#4a3024"/>
                  </svg>
                </div>
              );
            }
            if (item.kind === 'sign') {
              return (
                <div key={item.id} style={{
                  position:'absolute', left: adjLeft, bottom: '8%',
                  width: 14, height: 20,
                }}>
                  <svg viewBox="0 0 7 10" width="14" height="20" shapeRendering="crispEdges">
                    <rect x="3" y="3" width="1" height="7" fill="#2a1810"/>
                    <rect x="0" y="0" width="7" height="4" fill="#5a3024"/>
                    <rect x="0" y="0" width="7" height="1" fill="#7a4030"/>
                    <rect x="1" y="2" width="1" height="1" fill="#0a0a0a"/>
                    <rect x="3" y="2" width="1" height="1" fill="#0a0a0a"/>
                    <rect x="5" y="2" width="1" height="1" fill="#0a0a0a"/>
                  </svg>
                </div>
              );
            }
            return null;
          })}

          {/* Survivor sprite (left side, idle bobbing) */}
          <div style={{
            position:'absolute',
            left: '15%', bottom: '30%',
            width: 72, height: 96,
            transform: `translateY(${animFrame % 2 === 0 ? 0 : -2}px)`,
            zIndex: 10,
          }}>
            {dmgPops.filter(p => p.who === 'player').map(p => <div key={p.id} className="zi-dmg" style={{ top:-14, marginLeft:p.dx }}>-{p.n}</div>)}
            {/* Pixel-art survivor — 36×48 hand-painted grid with auto outline */}
            <svg viewBox="0 0 36 48" width="72" height="96" shapeRendering="crispEdges" style={{ overflow:'visible' }}>
              {window.ZI_ART.survivorRuns(weaponKind).map((r, i) => <rect key={i} x={r.x} y={r.y} width={r.w} height="1" fill={r.c}/>)}
              {encounter && (animFrame === 0 || animFrame === 2) && weaponFx.muzzle && (
                weaponFx.shot === 'flame' ? (
                  <g>
                    <rect x={weaponFx.muzzle[0]} y={weaponFx.muzzle[1] - 1} width="3" height="3" fill="#f0d060"/>
                    <rect x={weaponFx.muzzle[0] + 1} y={weaponFx.muzzle[1]} width="3" height="1" fill="#fff4b0"/>
                  </g>
                ) : (
                  <g>
                    <rect x={weaponFx.muzzle[0]} y={weaponFx.muzzle[1] - 1} width="2" height="3" fill="#f0d060"/>
                    <rect x={weaponFx.muzzle[0] + 2} y={weaponFx.muzzle[1]} width="2" height="1" fill="#fff4b0"/>
                    <rect x={weaponFx.muzzle[0]} y={weaponFx.muzzle[1] - 2} width="1" height="1" fill="#e07a30"/>
                    <rect x={weaponFx.muzzle[0]} y={weaponFx.muzzle[1] + 2} width="1" height="1" fill="#e07a30"/>
                  </g>
                )
              )}
              {encounter && (animFrame === 0 || animFrame === 2) && weaponFx.shot === 'slash' && (
                <path d="M 27 4 Q 36 14 29 26" fill="none" stroke="#f4f0e0" strokeWidth="1.2" opacity="0.8"/>
              )}
            </svg>
          </div>

          {/* Projectile travelling from the equipped weapon to the zombie */}
          {encounter && (animFrame === 0 || animFrame === 2) && weaponFx.shot !== 'slash' && (
            <div style={{ position:'absolute', left:'calc(15% + 70px)', right:'calc(20% + 40px)', bottom: weaponKind === 'pistol' ? 'calc(30% + 64px)' : 'calc(30% + 56px)', height:8, pointerEvents:'none', zIndex:11 }}>
              {weaponFx.shot === 'flame' ? (
                <div key={animFrame} className="zi-flame" style={{ position:'absolute', left:0, top:-4, height:16, width:'100%', background:'linear-gradient(90deg, #fff4b0, #f0a030 30%, #e0501a 70%, rgba(200,40,10,0))', borderRadius:'0 50% 50% 0', filter:'blur(1px)' }}/>
              ) : (
                <div key={animFrame} className="zi-proj" style={{ position:'absolute', top: weaponFx.shot === 'spread' ? -3 : 0 }}>
                  {weaponFx.shot === 'tracer' && <div style={{ width:22, height:2, background:'linear-gradient(90deg, rgba(240,208,96,0), #fff4b0)' }}/>}
                  {weaponFx.shot === 'spread' && [0,3,6].map(o => <div key={o} style={{ width:14, height:2, marginTop: o ? 1 : 0, background:'linear-gradient(90deg, rgba(240,208,96,0), #fff4b0)' }}/>)}
                  {(weaponFx.shot === 'bolt' || weaponFx.shot === 'arrow') && (
                    <svg width="30" height="6" viewBox="0 0 15 3" shapeRendering="crispEdges">
                      <rect x="0" y="1" width="12" height="1" fill={weaponFx.shot === 'bolt' ? '#c8c0a0' : '#8a6a3a'}/>
                      <rect x="12" y="0" width="2" height="3" fill="#55554f"/><rect x="14" y="1" width="1" height="1" fill="#55554f"/>
                      <rect x="0" y="0" width="2" height="1" fill="#7a2c22"/><rect x="0" y="2" width="2" height="1" fill="#7a2c22"/>
                    </svg>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Current zombie (right side, approaching/fighting) */}
          {encounter && (() => {
            // Display only: bestiary entries with processed sprite art (zombie-sprites.js) show it with a
            // walking bob and sway; every other entry keeps the painted SVG.
            const spr = window.ZI_ART.zombieSprite && window.ZI_ART.zombieSprite(encounter.bestiaryId, encounter.id);
            const wrap = {
              position:'absolute',
              right: '20%', bottom: '30%',
              transform: zombieAnim[encounter.id] === 'hit' ? 'translateX(8px)' : 'translateX(0)',
              transition:'transform 0.15s',
              zIndex: 10,
            };
            if (!spr) return <div style={wrap} dangerouslySetInnerHTML={{ __html: window.ZI_ART.zombieSvg(encounter.type, animFrame) }}/>;
            // Wide sprites (megaphone, runner) are capped at 80% of the scene so they never run off its left edge on a phone.
            return (
              <div style={{ ...wrap, width: spr.w * 2, maxWidth:'80%' }} data-zombie-sprite={spr.file}>
                <img src={spr.src} alt="" width={spr.w * 2} height={spr.h * 2} draggable={false}
                  style={{ display:'block', width:'100%', height:'auto', imageRendering:'pixelated', transformOrigin:'50% 100%',
                    transform: window.ZI_ART.ZOMBIE_WALK_POSES[animFrame % 4] }}/>
              </div>
            );
          })()}
          {/* Floating damage numbers over the zombie's head */}
          {encounter && dmgPops.some(p => p.who === 'zombie') && (() => { const zs = window.ZI_ART.zombieSprite && window.ZI_ART.zombieSprite(encounter.bestiaryId, encounter.id); return (
            <div style={{ position:'absolute', right:'20%', bottom: zs ? `calc(30% + ${Math.round(zs.h * 2 * 0.78)}px)` : 'calc(30% + 78px)', width: zs ? zs.w * 2 : 72, maxWidth:'80%', height:1, zIndex:20, pointerEvents:'none' }}>
              {dmgPops.filter(p => p.who === 'zombie').map(p => <div key={p.id} className="zi-dmg" style={{ top:0, marginLeft:p.dx }}>-{p.n}</div>)}
            </div>
          ); })()}
          {/* Encounter HP bar above zombie */}
          {encounter && (
            <div style={{
              position:'absolute',
              right: '22%', bottom: (() => { const zs = window.ZI_ART.zombieSprite && window.ZI_ART.zombieSprite(encounter.bestiaryId, encounter.id); return zs ? `calc(30% + ${zs.h * 2 + 10}px)` : 'calc(30% + 110px)'; })(), // sits just above the sprite; bosses are taller
              width: 80, zIndex: 12,
              background:'rgba(0,0,0,0.7)', padding: 3,
            }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--red2)', marginBottom:2 }}>
                {encounter.name}
              </div>
              <ProgressBar value={((encounter.currentHp ?? encounter.hp)/encounter.hp)*100} color="var(--red2)" height={4}/>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text2)', marginTop:2 }}>
                {Math.max(0, encounter.currentHp ?? encounter.hp)}/{encounter.hp} HP · INIT {encounter.init}
              </div>
            </div>
          )}

          {/* No encounter — status indicator (wandering / withdrawing / resting) */}
          {!encounter && !downed && (() => {
            const rn = window.ZI.getWanderRun(), Z = window.ZI;
            let title = 'Wandering...', sub = null, ruleLine = null;
            if (rn.resting) {
              const mins = Z.WanderSim._restNeedMs ? Math.ceil(Z.WanderSim._restNeedMs(rn).need / 60000) : null;
              title = rn.restAt === 'checkpoint' ? 'Resting at the checkpoint' : 'Resting at Base';
              sub = `HP ${Math.round(rn.hp || 0)}% · stress ${Math.round(Z.getStress())} · back on patrol${mins != null && isFinite(mins) ? ` in ~${mins} min` : ''} (HP ≥ 80%)`;
              // RB2: the automatic retreat runs in the background; while resting, the scene shows the limits it uses.
              const rr = Z.getRetreatRules ? Z.getRetreatRules() : null;
              if (rr) { const parts = [!rr.hpOff && `HP ${rr.hpFloorPct}%`, !rr.loadIgnore && `load ${rr.loadLimitPct}%`].filter(Boolean); // BAL-A A5: no stress rule
                ruleLine = parts.length ? `Retreats at ${parts.join(' · ')}` : 'Automatic retreat is off'; }
            } else if (rn.withdrawing) { title = 'Withdrawing...'; sub = `${Math.round(rn.withdrawLeftM || 0)} m to the checkpoint · the road is quiet; only slow crawlers follow`; } // BAL-A A1
            else if (rn.retreatHold) title = 'On hold';
            return (
              <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', display:'flex', flexDirection:'column', alignItems:'center', gap:6, textAlign:'center', maxWidth:'80%' }}>
                <div style={{ fontFamily:'var(--font-title)', fontSize:14, color:'var(--text3)', letterSpacing:'0.3em', textTransform:'uppercase', animation:'threat-pulse 2s ease-in-out infinite' }}>{title}</div>
                {sub && <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)' }}>{sub}</div>}
                {ruleLine && <div data-retreat-line="1" style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)' }}>{ruleLine}</div>}
              </div>
            );
          })()}

          {/* Downed / run-over overlay */}
          {downed && (
            <div style={{
              position:'absolute', inset:0,
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              gap:14, background:'rgba(10,6,6,0.78)', zIndex:30,
            }}>
              <div style={{ fontFamily:'var(--font-title)', fontSize:26, color:'var(--red2)', letterSpacing:'0.2em' }}>
                ☠ SURVIVOR DOWN
              </div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)', textAlign:'center', lineHeight:1.6 }}>
                Recovered loot secured to the Recycler. Checkpoints &amp; distance held.<br/>
                {carried.length > 0
                  ? `Carried out: ${carried.length} item${carried.length!==1?'s':''} (best: ${carried[0].name} ◆${carried[0].value})`
                  : 'Carried out: nothing'}
              </div>
              <button
                onClick={() => {
                  // Bank XP; resume from the furthest checkpoint — DO NOT wipe
                  // checkpoints or distance (monotonic progress held on downed).
                  if (window.ZI.applyWanderingXp) window.ZI.applyWanderingXp(score.xp);
                  const resume = lastCheckpoint || 0;
                  setPlayerHp(100); setDowned(false);
                  setScroll(resume); scrollRef.current = resume; scrollRef.lastCp = Math.floor(resume / CHECKPOINT_EVERY);
                  window.ZI.syncWanderState({ active: true, status: 'active', scroll: resume, hp: 100, lastTickAt: Date.now(), retreatSnoozes: {}, retreatHold: null, withdrawCauses: null });
                  setEncounter(null);
                  setHealsUsed(0); // heals recover on Return to Base
                  setKillCmdsUsed(0);
                  // Loot was already banked to the Recycler at the moment of downing — no re-bank.
                  setCombatLog([{ type:'info', text:`⛑ ${activeSurvivor.name} recovered. +${score.xp} XP banked. Resumed at checkpoint ${resume}m — journey progress held.` }]);
                  setCarried([]);
                  setScore({ kills:0, xp:0, mats:0 });
                }}
                style={{
                  marginTop:6, padding:'9px 22px', cursor:'pointer',
                  background:'var(--bg3)', border:'1px solid var(--amber)', color:'var(--amber)',
                  fontFamily:'var(--font-body)', fontSize:13, letterSpacing:'0.12em', textTransform:'uppercase',
                }}
              >Return to Base</button>
            </div>
          )}
        </div>

        {/* Combat log sidebar */}
        <div data-tut="log" style={{
          width: narrow ? '100%' : 280, borderLeft: narrow ? 'none' : '1px solid var(--border)', borderTop: narrow ? '1px solid var(--border)' : 'none',
          background:'var(--bg2)', display:'flex', flexDirection:'column', flexShrink:0,
        }}>
          <div className="panel-title" style={{ borderBottom:'1px solid var(--border)' }}>Combat Log</div>
          <div ref={logRef} style={{ flex:1, maxHeight: narrow ? 240 : undefined, minHeight: narrow ? 120 : undefined, overflowY:'auto', overflowX:'hidden', padding:8, display:'flex', flexDirection:'column', gap:3 }}>
            {combatLog.slice(-50).map((entry, i) => {
              const colors = {
                info:   'var(--text2)',
                spawn:  'var(--red2)',
                init:   'var(--amber)',
                player: 'var(--green)',
                enemy:  'var(--red2)',
                kill:   '#f0d060',
                cmd:    'var(--purple)',
              };
              return (
                <div key={i} style={{
                  fontFamily:'var(--font-mono)', fontSize:11, color:colors[entry.type]||'var(--text2)',
                  lineHeight:1.4, whiteSpace:'normal', overflowWrap:'anywhere', minWidth:0,
                }}>
                  {entry.text}
                </div>
              );
            })}
          </div>

          {/* Command input — executable text box */}
          <div data-tut="cmds" style={{ borderTop:'1px solid var(--border)', padding:'6px 8px', background:'var(--bg3)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--purple)', fontWeight:'bold' }}>{'>'}</span>
              <input
                type="text"
                value={cmdInput}
                onChange={e => setCmdInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    runCommand(cmdInput);
                    setCmdInput('');
                  }
                }}
                placeholder="status · clear · help"
                style={{
                  flex:1, background:'var(--bg4)', border:'1px solid var(--border2)',
                  padding:'4px 7px', fontFamily:'var(--font-mono)', fontSize:11,
                  color:'var(--text)', outline:'none',
                }}
              />
            </div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', marginTop:6, lineHeight:1.6 }}>
              <span style={{color:'var(--purple)'}}>cmds:</span> status · clear · help — actions are buttons above
            </div>
          </div>

          {/* Survivor & stats */}
          <div style={{ padding:10, borderTop:'1px solid var(--border)' }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', marginBottom:5, letterSpacing:'0.1em' }}>
              CURRENT SURVIVOR
            </div>
            <div style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--amber)', marginBottom:4 }}>
              {activeSurvivor.name}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
              <InfoRow label="ATK"  value={activeSurvivor.atk}  color="var(--red2)"/>
              <InfoRow label="DEF"  value={activeSurvivor.def}  color="var(--blue)"/>
              <InfoRow label="INIT" value={activeSurvivor.init} color="var(--amber)"/>
              <InfoRow label="HP"   value={`${Math.round(hpShown * 10) / 10}/${hpMax}`}    color="var(--green)"/>
            </div>
            <div style={{ marginTop:8, padding:'4px 40px 4px 6px', background:'var(--bg4)', borderLeft:'2px solid var(--amber)', fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', lineHeight:1.5 }}>
              Player attacks first unless undead has higher INIT. Combat resolves automatically.
            </div>
          </div>
        </div>
      </div>

      {/* ── GEAR LOADOUT OVERLAY ── */}
      {showGear && (() => {
        const filterCat = { ALL:null, WEAPONS:'weapon', ARMOR:'armor', GEAR:'gear', ITEMS:'consumable' }[gearFilter];
        const visibleStash = stash.map(id => window.ZI.getGearItem(id)).filter(Boolean)
          .filter(it => !filterCat || it.cat === filterCat);
        const rc = (r) => window.ZI.RARITY_COLORS[r] || 'var(--text3)';
        const equip = (id) => { const it = window.ZI.getGearItem(id); const r = window.ZI.equipGear(id, it.slot); if (r) { setLoadout({ ...r.loadout }); setStash([ ...r.stash ]); } };
        const unequip = (slotId) => { const r = window.ZI.unequipGear(slotId); setLoadout({ ...r.loadout }); setStash([ ...r.stash ]); };
        const groups = [['weapon','WEAPONS'],['armor','ARMOR'],['gear','GEAR'],['consumable','CONSUMABLES']];
        const StatBar = ({ label, value, color }) => (
          <div style={{ marginBottom:7 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:9, marginBottom:2 }}>
              <span style={{ color:'var(--text3)' }}>{label}</span><span style={{ color }}>{value}</span>
            </div>
            <ProgressBar value={value} color={color} height={5}/>
          </div>
        );
        return (
          <div onClick={() => setShowGear(false)} style={{ position:'absolute', inset:0, zIndex:80, background:'rgba(0,0,0,0.8)', display:'flex', alignItems:'center', justifyContent:'center', padding:14 }}>
            <div onClick={e => e.stopPropagation()} className="panel" style={{ width:'min(960px,96%)', height:'min(780px,94%)', display:'flex', flexDirection:'column', background:'var(--bg2)' }}>
              <div className="panel-title" style={{ display:'flex', alignItems:'center' }}>
                <span>Gear Loadout — equip to modify run stats</span>
                <button onClick={() => setShowGear(false)} style={{ marginLeft:'auto', cursor:'pointer', background:'none', border:'1px solid var(--border)', color:'var(--text2)', fontFamily:'var(--font-mono)', fontSize:11, padding:'2px 9px' }}>✕ Close</button>
              </div>
              <div style={{ flex:1, minHeight:0, display:'flex', gap:8, padding:8, overflow:'hidden' }}>
                {/* Survivor stats */}
                <div style={{ width:172, flexShrink:0, display:'flex', flexDirection:'column' }}>
                  <div className="panel" style={{ padding:10, flex:1, overflow:'auto' }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:8, letterSpacing:'0.1em' }}>SURVIVOR — {activeSurvivor.name}</div>
                    <StatBar label="Health" value={gearStats.displayHP} color="var(--green)"/>
                    <StatBar label="Armor" value={gearStats.armorRating} color="var(--blue)"/>
                    <StatBar label="Carry" value={gearStats.carryCapacity} color="var(--amber)"/>
                    <StatBar label="Speed" value={gearStats.speed} color="#c894ff"/>
                    <div className="divider" style={{ margin:'8px 0' }}/>
                    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                      <InfoRow label="Weapon Dmg" value={`+${Math.round(gearStats.weaponDamage * 0.25)}`} color="var(--red2)"/>
                      <InfoRow label="Loot Find" value={`+${gearStats.lootFind}`} color="var(--green)"/>
                      <InfoRow label="Slots Filled" value={`${gearStats.filled}/14`} color="var(--text2)"/>
                    </div>
                    {!gearStats.hasWeapon && (
                      <div style={{ marginTop:8, fontFamily:'var(--font-mono)', fontSize:8, color:'var(--red2)', lineHeight:1.5 }}>⚠ No weapon equipped — combat damage relies on base stats only.</div>
                    )}
                  </div>
                </div>
                {/* Paperdoll equip slots */}
                <div style={{ width:280, flexShrink:0, display:'flex', flexDirection:'column' }}>
                  <div className="panel" style={{ padding:10, flex:1, overflow:'auto' }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:8, letterSpacing:'0.1em' }}>EQUIPMENT</div>
                    {groups.map(([cat, label]) => (
                      <div key={cat} style={{ marginBottom:9 }}>
                        <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', marginBottom:4 }}>{label}</div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
                          {window.ZI.GEAR_SLOTS.filter(s => s.accepts === cat).map(s => {
                            const it = loadout[s.id] && window.ZI.getGearItem(loadout[s.id]);
                            return (
                              <div key={s.id} onClick={() => it && unequip(s.id)} title={it ? 'Click to unequip' : ''} style={{
                                padding:'6px 8px', minHeight:42, cursor: it ? 'pointer' : 'default',
                                background:'var(--bg3)', border:`1px solid ${it ? rc(it.rarity) : 'var(--border)'}`,
                                borderTop: it ? `2px solid ${rc(it.rarity)}` : '1px solid var(--border)',
                                display:'flex', alignItems:'center', gap:6,
                              }}>
                                {it ? (
                                  <>
                                    <span style={{ fontSize:15 }}>{it.icon}</span>
                                    <div style={{ minWidth:0 }}>
                                      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{it.name}</div>
                                      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)' }}>{s.label}</div>
                                    </div>
                                  </>
                                ) : (
                                  <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>{s.label}</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Stash grid */}
                <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column' }}>
                  <div className="panel" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
                    <div style={{ display:'flex', gap:4, padding:'8px 8px 0' }}>
                      {['ALL','WEAPONS','ARMOR','GEAR','ITEMS'].map(t => (
                        <button key={t} onClick={() => setGearFilter(t)} style={{
                          fontFamily:'var(--font-mono)', fontSize:9, padding:'3px 9px', cursor:'pointer',
                          background: gearFilter===t ? '#2a2318' : 'transparent',
                          border:`1px solid ${gearFilter===t ? '#d4a84a' : 'var(--border)'}`,
                          color: gearFilter===t ? '#f0b429' : 'var(--text3)',
                        }}>{t}</button>
                      ))}
                      <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', alignSelf:'center' }}>{visibleStash.length} in stash · click to equip</span>
                    </div>
                    <div style={{ flex:1, overflow:'auto', padding:8, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:4, alignContent:'start' }}>
                      {visibleStash.map(it => (
                        <div key={it.id} onClick={() => equip(it.id)} title={it.desc} style={{
                          padding:'6px 8px', cursor:'pointer', background:'var(--bg3)',
                          border:'1px solid var(--border)', borderTop:`2px solid ${rc(it.rarity)}`,
                          display:'flex', alignItems:'center', gap:7,
                        }}>
                          <span style={{ fontSize:15 }}>{it.icon}</span>
                          <div style={{ minWidth:0, flex:1 }}>
                            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{it.name}</div>
                            <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:rc(it.rarity) }}>
                              {it.dmg ? `DMG ${it.dmg}` : it.armor ? `ARM +${it.armor}` : it.lootBonus ? `LOOT +${it.lootBonus}` : it.cat}
                            </div>
                          </div>
                        </div>
                      ))}
                      {visibleStash.length === 0 && (
                        <div style={{ gridColumn:'1/-1', textAlign:'center', padding:24, fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)' }}>Nothing in this category. Craft gear or change the filter.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ flexShrink:0, maxHeight:240, overflow:'auto', padding:'0 8px 8px' }}><CarryPanel/></div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

// ─── ZOMBIE CODEX SCREEN ─────────────────────────────────────────────────────
window.ZombieCodexScreen = function ZombieCodexScreen() {
  const ZI = window.ZI;
  const [expanded, setExpanded] = React.useState(null);
  const [tierFilter, setTierFilter] = React.useState('ALL');
  const [catFilter, setCatFilter] = React.useState(() => { try { return localStorage.getItem('zi_codex_cat') || 'all'; } catch (e) { return 'all'; } });
  const pickCat = (c) => { setCatFilter(c); setExpanded(null); try { localStorage.setItem('zi_codex_cat', c); } catch (e) {} };
  const [search, setSearch] = React.useState('');
  // Art in the open card walks with the same bob/sway as Wandering fights (4 poses, 250 ms each).
  const [codexFrame, setCodexFrame] = React.useState(0);
  React.useEffect(() => { if (expanded == null) return; const t = setInterval(() => setCodexFrame(f => (f + 1) % 4), 250); return () => clearInterval(t); }, [expanded]);
  const expandedRoster = ZI.BESTIARY_EXPANDED || []; // ids 49-108: art + description only, never spawned (bestiary-expanded.js)
  const devMode = catFilter === 'dev';
  const A = window.ZI_ART || {};
  // The zombie's art, exactly as Wandering shows it: processed sprite where one is mapped, else the painted SVG.
  const artBox = (z, dev) => {
    const pose = (A.ZOMBIE_WALK_POSES || [])[codexFrame % 4] || 'none';
    const box = { minWidth:160, maxWidth:'100%', minHeight:150, flexShrink:0, display:'flex', alignItems:'flex-end', justifyContent:'center', gap:10, padding:'12px 10px 14px',
      background:'linear-gradient(180deg, #0a0808 0%, #1a1410 70%, #2a1e14 100%)', border:'1px solid var(--border)', overflow:'hidden', boxSizing:'border-box' };
    const keys = dev ? [z.art] : ((A.ZOMBIE_SPRITE_MAP || {})[z.id] || []);
    const list = keys.map(k => (A.ZOMBIE_SPRITES || {})[k]).filter(Boolean);
    if (list.length) return (
      <div data-codex-art={list.map(s => s.file).join(',')} style={box}>
        {list.map(s => <img key={s.file} src={s.src} alt="" width={s.w * 2} height={s.h * 2} draggable={false}
          style={{ display:'block', minWidth:0, maxWidth: (100 / list.length) + '%', height:'auto', imageRendering:'pixelated', transformOrigin:'50% 100%', transform: pose }}/>)}
      </div>);
    const type = (z.base || z.name || 'shambler').toLowerCase().replace(/\s+/g, '');
    return <div data-codex-art="svg" style={box}><div style={{ transformOrigin:'50% 100%', transform: pose, lineHeight:0 }} dangerouslySetInnerHTML={{ __html: A.zombieSvg ? A.zombieSvg(type, codexFrame) : '' }}/></div>;
  };

  const roster = ZI.BESTIARY || [];
  const tiers = ZI.BESTIARY_TIERS || {};
  const discovered = (ZI.getDiscovered && ZI.getDiscovered()) || new Set();
  const isKnown = (z) => discovered.has(z.id) || discovered.has(z.base) || discovered.has((z.name||'').toLowerCase());
  const discoveredCount = roster.filter(isKnown).length;

  const tierOrder = ['F','E','D','C','B','A','S','BOSS'];
  const tierLabel = (t) => t === 'BOSS' ? 'SS' : t; // display name only; data key stays 'BOSS'
  // Category tabs — derived from each zombie's base type, traits and ability.
  const CATS = [
    { id:'all',     label:'All',         icon:'◈' },
    { id:'walker',  label:'Walkers',     icon:'🧟' },
    { id:'runner',  label:'Runners',     icon:'💨' },
    { id:'brute',   label:'Brutes',      icon:'🛡' },
    { id:'hazard',  label:'Hazards',     icon:'☣' },
    { id:'special', label:'Specialists', icon:'✦' },
    { id:'elite',   label:'Elites',      icon:'💀' },
    { id:'dev',     label:'In development', icon:'🧪' },
  ];
  const catOf = (z) => {
    const txt = [z.base, z.name, z.ability].concat(z.traits || []).join(' ');
    if (z.tier === 'S' || z.tier === 'BOSS') return 'elite';
    if (/toxic|acid|immolat|taint|hazard|ooz|gas|pressur|maggot|frost|conduct|fung|vomit/i.test(txt)) return 'hazard';
    if (/heavy|giant|armou?red|mutant|beefy|tough|strong|octopod|hexapod|hybrid|chrome|chained/i.test(txt)) return 'brute';
    if (/runner|nimble|dash|sprint|creeper|quadruped/i.test(txt)) return 'runner';
    if (/shambler/i.test(z.base || '')) return 'walker';
    return 'special';
  };
  const catCount = (id) => {
    if (id === 'dev') return { total: expandedRoster.length, known: expandedRoster.length };
    const list = id === 'all' ? roster : roster.filter(z => catOf(z) === id);
    return { total: list.length, known: list.filter(isKnown).length };
  };
  let filtered = (devMode ? expandedRoster : roster).filter(z => (devMode || catFilter === 'all' || catOf(z) === catFilter) && (tierFilter === 'ALL' || z.tier === tierFilter));
  if (search.trim()) {
    const q = search.toLowerCase();
    filtered = filtered.filter(z => z.name.toLowerCase().includes(q) || (z.base || z.desc || '').toLowerCase().includes(q));
  }

  const StatBar = ({ label, value, max, color, suffix }) => (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', width:110, flexShrink:0 }}>{label}</span>
      <div style={{ flex:1, height:6, background:'var(--bg4)', borderRadius:1, overflow:'hidden' }}>
        <div style={{ width:`${Math.min(100,(value/max)*100)}%`, height:'100%', background:color }}/>
      </div>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text)', width:46, textAlign:'right', flexShrink:0 }}>{value}{suffix||''}</span>
    </div>
  );

  // Danger index 1–5 derived from tier rank.
  const tierDanger = { F:1, E:2, D:2, C:3, B:4, A:4, S:5, BOSS:5 };

  return (
    <div className="screen-enter" style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:'var(--bg)' }}>
      <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontFamily:'var(--font-title)', fontSize:18, color:'var(--amber)', letterSpacing:'0.08em' }}>BESTIARY CODEX</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)', marginTop:2 }}>
              {discoveredCount}/{roster.length} threats catalogued · encounter zombies to unlock full field data{expandedRoster.length ? ` · ${expandedRoster.length} more in development` : ''}
            </div>
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="search..."
            style={{ background:'var(--bg4)', border:'1px solid var(--border2)', padding:'5px 9px',
              fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text)', outline:'none', width:160 }}/>
        </div>
        {/* Category tabs */}
        <div style={{ display:'flex', gap:2, marginTop:10, flexWrap:'wrap', borderBottom:'1px solid var(--border)' }}>
          {CATS.map(c => {
            const on = catFilter === c.id;
            const n = catCount(c.id);
            return (
              <button key={c.id} onClick={() => pickCat(c.id)} style={{
                display:'flex', alignItems:'center', gap:6, padding:'6px 12px', cursor:'pointer',
                fontFamily:'var(--font-body)', fontSize:12, letterSpacing:'0.04em',
                background: on ? 'var(--bg3)' : 'transparent', color: on ? 'var(--amber)' : 'var(--text2)',
                border:'1px solid', borderColor: on ? 'var(--border) var(--border) var(--bg3)' : 'transparent',
                borderBottom: on ? '1px solid var(--bg3)' : '1px solid transparent', marginBottom:-1,
                borderTop: on ? '2px solid var(--amber)' : '2px solid transparent',
              }}>
                <span style={{ fontSize:12 }}>{c.icon}</span>
                <span>{c.label}</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>{n.known}/{n.total}</span>
              </button>
            );
          })}
        </div>
        {/* Tier filter (secondary) */}
        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:10, flexWrap:'wrap' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', marginRight:4, letterSpacing:'0.08em' }}>TIER</span>
          {tierOrder.map(t => {
            const tc = tiers[t] ? tiers[t].color : 'var(--text3)';
            const on = tierFilter === t;
            return (
              <button key={t} onClick={() => setTierFilter(on ? 'ALL' : t)} title={on ? 'Click again to show all tiers' : ''} style={{
                fontFamily:'var(--font-mono)', fontSize:12, padding:'5px 12px', minWidth:38, cursor:'pointer',
                background: on ? tc : 'transparent', color: on ? '#0f0e0c' : tc,
                border:`1px solid ${on ? tc : tc + '66'}`, fontWeight: on ? 'bold' : 'normal',
              }}>{t === 'BOSS' ? 'SS Tier' : t}</button>
            );
          })}
        </div>
      </div>

      <div style={{ flex:1, overflow:'auto', padding:12, display:'flex', flexDirection:'column', gap:6 }}>
        {filtered.map(z => {
          const known = isKnown(z);
          const open = known && expanded === z.id;
          const tc = (tiers[z.tier] && tiers[z.tier].color) || 'var(--text3)';
          const danger = tierDanger[z.tier] || 1;
          if (devMode) {
            const openD = expanded === z.id;
            return (
              <div key={'dev' + z.id} data-codex-dev={z.id} onClick={() => setExpanded(openD ? null : z.id)}
                style={{ background:'var(--bg2)', border:`1px solid ${openD ? tc : 'var(--border)'}`, borderLeft:`3px solid ${tc}`, cursor:'pointer', overflow:'hidden', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 14px' }}>
                  <div style={{ width:30, textAlign:'center', fontFamily:'var(--font-title)', fontSize:18, color:tc, flexShrink:0 }}>{tierLabel(z.tier)}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <span style={{ fontFamily:'var(--font-title)', fontSize:15, color:tc }}>{z.name}</span>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>#{z.id}</span>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--amber)', border:'1px solid var(--amber)', padding:'0 5px', letterSpacing:'0.08em' }}>IN DEVELOPMENT</span>
                    </div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text2)', marginTop:3, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{z.desc}</div>
                  </div>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:14, color:'var(--text3)', width:14, textAlign:'center', flexShrink:0 }}>{openD ? '−' : '+'}</span>
                </div>
                {openD && (
                  <div style={{ padding:'10px 14px 14px', borderTop:'1px solid var(--border)', display:'flex', gap:14, flexWrap:'wrap', alignItems:'flex-start' }}>
                    {artBox(z, true)}
                    <div style={{ flex:'1 1 220px', minWidth:0, fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text2)', lineHeight:1.7 }}>
                      <div>{z.desc}</div>
                      <div style={{ marginTop:8, color:'var(--text3)' }}>Art preview only. This zombie has no combat stats yet and doesn't appear in Wandering fights.</div>
                    </div>
                  </div>
                )}
              </div>
            );
          }
          if (!known) {
            return (
              <div key={z.id} style={{ background:'var(--bg2)', border:`1px dashed ${tc}55`, overflow:'hidden', opacity:0.85, flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 14px' }}>
                  <div style={{ width:30, textAlign:'center', fontFamily:'var(--font-title)', fontSize:22, color:tc }}>?</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'var(--font-title)', fontSize:14, color:'var(--text3)', letterSpacing:'0.2em' }}>UNIDENTIFIED</div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginTop:2 }}>Tier {tierLabel(z.tier)} · no field data on record</div>
                  </div>
                  <span style={{ fontSize:13 }}>🔒</span>
                </div>
              </div>
            );
          }
          return (
            <div key={z.id} onClick={() => setExpanded(open ? null : z.id)}
              style={{ background:'var(--bg2)', borderLeft:`3px solid ${tc}`,
                border:`1px solid ${open ? tc : 'var(--border)'}`, borderLeftColor:tc,
                cursor:'pointer', transition:'border-color 0.15s', overflow:'hidden', flexShrink:0 }}>
              {/* Header */}
              <div style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 14px' }}>
                <div style={{ width:30, textAlign:'center', fontFamily:'var(--font-title)', fontSize:18, color:tc }}>{tierLabel(z.tier)}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontFamily:'var(--font-title)', fontSize:15, color:tc }}>{z.name}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>{z.base}</span>
                  </div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text2)', marginTop:3 }}>
                    HP {z.hp} · DMG {z.dmg} · SPD {z.spd} · ARM {z.armor} · {z.xp} XP
                  </div>
                </div>
                <div style={{ display:'flex', gap:2, flexShrink:0 }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ width:6, height:14, borderRadius:1,
                      background: i <= danger ? tc : 'var(--bg4)' }}/>
                  ))}
                </div>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:14, color:'var(--text3)', width:14, textAlign:'center', flexShrink:0 }}>{open ? '−' : '+'}</span>
              </div>

              {/* Expanded */}
              {open && (
                <div style={{ padding:'4px 14px 14px', borderTop:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', gap:14, flexWrap:'wrap', alignItems:'flex-start', marginTop:10 }}>
                  {artBox(z, false)}
                  <div style={{ flex:'1 1 300px', minWidth:0 }}>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap', margin:'0 0 10px' }}>
                    {(z.traits||[]).map(t => (
                      <span key={t} style={{ fontFamily:'var(--font-mono)', fontSize:9, color:tc,
                        border:`1px solid ${tc}55`, padding:'2px 7px', borderRadius:2 }}>{t}</span>
                    ))}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0 24px' }}>
                    <div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:6, letterSpacing:'0.1em' }}>COMBAT STATS</div>
                      <StatBar label="Health"   value={z.hp}  max={350} color={tc}/>
                      <StatBar label="Damage"   value={z.dmg} max={37}  color="var(--red2)"/>
                      <StatBar label="Speed"    value={z.spd} max={2}   color="var(--amber)" suffix="×"/>
                      <StatBar label="Armor"    value={z.armor} max={8} color="var(--blue)"/>
                      <StatBar label="XP Reward"value={z.xp}  max={350} color="var(--green)"/>
                    </div>
                    <div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:6, letterSpacing:'0.1em' }}>FIELD DATA</div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text2)', lineHeight:1.7 }}>
                        <div><span style={{color:'var(--text3)'}}>Special:</span> {z.ability}</div>
                        <div style={{ marginTop:3 }}><span style={{color:'var(--text3)'}}>Weakness:</span> <span style={{color:'var(--green)'}}>{(z.weakness||[]).join(' · ')}</span></div>
                        <div style={{ marginTop:3 }}><span style={{color:'var(--text3)'}}>Loot:</span> <span style={{color:'var(--amber)'}}>{z.loot}</span></div>
                        <div style={{ marginTop:3 }}><span style={{color:'var(--text3)'}}>Biome:</span> {z.biome}</div>
                      </div>
                    </div>
                  </div>
                  <div style={{ marginTop:10, padding:'7px 10px', background:'var(--bg3)', borderLeft:`2px solid ${tc}`,
                    fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', fontStyle:'italic', lineHeight:1.5 }}>
                    📋 {z.notes}
                  </div>
                  </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ textAlign:'center', padding:40, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)' }}>
            No threats match this filter.
          </div>
        )}
      </div>
    </div>
  );
};

// ─── RECYCLER SCREEN ─────────────────────────────────────────────────────────
window.RecyclerScreen = function RecyclerScreen() {
  const ZI = window.ZI;
  const ZI_MATERIALS = window.ZI_MATERIALS;

  const [inventory, setInventory] = React.useState(() => {
    const starter = [
      { id:1, name:'Broken Pipe Rifle', tier:1, rarity:'Common',   weight:3, outputs:{metal:6, wood:2, electronics:1} },
      { id:2, name:'Tattered Hoodie',   tier:1, rarity:'Common',   weight:1, outputs:{cloth:5} },
      { id:3, name:'Rusted Wrench',     tier:1, rarity:'Common',   weight:1, outputs:{metal:3} },
      { id:4, name:'Old Radio',         tier:2, rarity:'Uncommon', weight:2, outputs:{electronics:4, metal:2, cloth:1} },
      { id:5, name:'Dead Battery',      tier:2, rarity:'Uncommon', weight:1, outputs:{electronics:2, fuel:1} },
      { id:6, name:'Bandage Roll',      tier:1, rarity:'Common',   weight:0.5, outputs:{cloth:2, medical:1} },
      { id:7, name:'Scrap Hatchet',     tier:1, rarity:'Common',   weight:2, outputs:{metal:4, wood:3} },
      { id:8, name:'Broken Monitor',    tier:3, rarity:'Rare',     weight:4, outputs:{electronics:8, metal:3, cloth:1} },
      { id:9, name:'Empty Gas Can',     tier:1, rarity:'Common',   weight:1, outputs:{metal:2, fuel:1} },
    ];
    // Prepend items gathered from Wandering runs so fresh loot recycles first.
    const wander = (ZI.getWanderLoot && ZI.getWanderLoot()) || [];
    return [...wander, ...starter];
  });

  // Queue lives in the persisted, always-on Job Engine (zi_jobs) — not local
  // state — so it survives tab switches, reloads, and settles offline.
  const [, forceRerender] = React.useState(0);
  React.useEffect(() => { const t = setInterval(() => forceRerender(n => n + 1), 250); return () => clearInterval(t); }, []);
  const queue = ZI.jobsByType('recycle');
  const gameMode = ZI.currentGameMode();
  const isCampMode = gameMode === 'camp';
  const [selectedOperator, setSelectedOperator] = React.useState(() => ZI.defaultRecyclerOperator());

  // Operators come from game/economy.js; camp survivors are only offered in Camp Leader mode.
  const operators = ZI.availableRecyclerOperators();
  const op = operators.find(o => o.id === selectedOperator) || operators[0];

  // Consolidated View (filter + sort), persisted across reloads.
  const [view, setView] = React.useState(() => ZI.getRecyclerView());
  const [viewOpen, setViewOpen] = React.useState(false);
  const setViewField = (patch) => setView(v => { const nv = { ...v, ...patch }; ZI.saveRecyclerView(nv); return nv; });
  const visible = ZI.applyRecyclerView(inventory, view);
  const tally = ZI.tierTally(inventory);
  const activeFilterLabel = (ZI.RECYCLER_FILTERS.find(f => f.id === view.filter) || {}).label || 'All tiers';
  const sortLabel = { tier:'Tier ▼', weight:'Weight ▲', newest:'Newest' }[view.sort] || 'Tier ▼';

  const addToQueue = (item) => {
    // Recycling takes real time — weight drives duration, operator speed divides it.
    // Recycler structure level adds an opSpeed bonus (Camp Infrastructure).
    // The operator's output bonus is baked in at queue time (ZI.queueRecycle), so grant-on-completion
    // doesn't need to know which operator queued the job.
    const r = ZI.queueRecycle(item, op.id);
    if (r.ok) setInventory(inv => inv.filter(i => i.id !== item.id));
    // Note: the item is NOT removed from zi_wander_loot here — it's removed by
    // ZI.grantRecycleOutput on completion, so a cancelled job doesn't lose it.
  };

  const removeFromQueue = (jobId) => {
    // Cancelling returns the item to the visible inventory (not lost).
    const job = queue.find(j => j.id === jobId);
    ZI.cancelJob(jobId);
    if (job && job.meta && job.meta.item) setInventory(inv => [job.meta.item, ...inv]);
  };

  // Bulk: recycle whatever the current View filter shows (one bulk action).
  const recycleShown = () => { visible.forEach(item => addToQueue(item)); };
  // Recycle All: every eligible item, through the same queue (ZI.recycleAll → ZI.queueRecycle → job engine).
  const recycleAll = () => { const r = ZI.recycleAll(inventory, op.id); if (r.queued.length) setInventory(inv => inv.filter(i => !r.queued.includes(i.id))); };
  const recyclableCount = inventory.filter(it => ZI.isRecyclable(it)).length;
  // Processing itself runs in ZI.JobEngine (always-on, persisted) — no local
  // interval needed here; forceRerender above just keeps the bars live.

  return (
    <div className="screen-enter" style={{ display:'flex', gap:8, padding:8, height:'100%', overflow:'hidden' }}>
      {/* LEFT: Inventory of items to recycle */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8, minWidth:0, overflow:'hidden' }}>
        <div className="panel" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div className="panel-title" style={{ display:'flex', alignItems:'center', gap:8, position:'relative' }}>
            <span>Recycler</span>
            {/* Consolidated View dropdown (filter + sort) */}
            <div style={{ position:'relative', marginLeft:'auto' }}>
              <button onClick={() => setViewOpen(o => !o)} style={{
                fontFamily:'var(--font-mono)', fontSize:9, padding:'3px 10px', cursor:'pointer',
                background:'var(--bg4)', border:`1px solid ${viewOpen ? 'var(--amber)' : 'var(--border)'}`,
                color: viewOpen ? 'var(--amber)' : 'var(--text2)', display:'flex', alignItems:'center', gap:6,
              }}>▾ VIEW <span style={{ color:'var(--text3)' }}>· {activeFilterLabel} · {sortLabel}</span></button>
              {viewOpen && (
                <>
                  <div onClick={() => setViewOpen(false)} style={{ position:'fixed', inset:0, zIndex:40 }}/>
                  <div style={{
                    position:'absolute', top:'110%', right:0, zIndex:50, minWidth:170,
                    background:'var(--bg2)', border:'1px solid var(--amber)', boxShadow:'0 6px 20px rgba(0,0,0,0.5)',
                    padding:6, fontFamily:'var(--font-mono)', fontSize:10,
                  }}>
                    <div style={{ color:'var(--text3)', fontSize:8, padding:'2px 6px' }}>── FILTER ──</div>
                    {ZI.RECYCLER_FILTERS.map(f => {
                      const unlocked = ZI.isFilterUnlocked(f);
                      const on = view.filter === f.id;
                      return (
                        <div key={f.id}
                          onClick={() => { if (unlocked) { setViewField({ filter: f.id }); setViewOpen(false); } }}
                          title={unlocked ? '' : `Unlock via Scavenging`}
                          style={{
                            padding:'4px 8px', cursor: unlocked ? 'pointer' : 'not-allowed',
                            color: on ? 'var(--amber)' : unlocked ? 'var(--text2)' : 'var(--text3)',
                            background: on ? 'var(--bg4)' : 'transparent', opacity: unlocked ? 1 : 0.75,
                            display:'flex', alignItems:'center', gap:6,
                          }}>
                          <span style={{ width:10 }}>{on ? '•' : ''}</span>{f.label}{!unlocked && <span style={{ marginLeft:'auto' }}>🔒</span>}
                        </div>
                      );
                    })}
                    <div style={{ color:'var(--text3)', fontSize:8, padding:'2px 6px', marginTop:4 }}>── SORT ──</div>
                    {[['tier','Tier (high→low)'],['weight','Weight (light→heavy)'],['newest','Newest banked']].map(([id, label]) => {
                      const on = view.sort === id;
                      return (
                        <div key={id} onClick={() => { setViewField({ sort: id }); setViewOpen(false); }} style={{
                          padding:'4px 8px', cursor:'pointer', color: on ? 'var(--amber)' : 'var(--text2)',
                          background: on ? 'var(--bg4)' : 'transparent', display:'flex', alignItems:'center', gap:6,
                        }}><span style={{ width:10 }}>{on ? '•' : ''}</span>{label}</div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
            <button onClick={recycleShown} disabled={visible.length === 0} style={{
              fontFamily:'var(--font-mono)', fontSize:9, padding:'3px 10px',
              cursor: visible.length ? 'pointer' : 'not-allowed',
              background: visible.length ? 'rgba(200,169,110,0.12)' : 'var(--bg4)',
              border:`1px solid ${visible.length ? 'var(--amber)' : 'var(--border)'}`,
              color: visible.length ? 'var(--amber)' : 'var(--text3)',
            }}>Recycle shown ▸ {visible.length}</button>
            <button onClick={recycleAll} disabled={recyclableCount === 0} title="Queue every recyclable item (story items are never recycled)" style={{
              fontFamily:'var(--font-mono)', fontSize:9, padding:'3px 10px',
              cursor: recyclableCount ? 'pointer' : 'not-allowed',
              background: recyclableCount ? 'rgba(200,169,110,0.12)' : 'var(--bg4)',
              border:`1px solid ${recyclableCount ? 'var(--amber)' : 'var(--border)'}`,
              color: recyclableCount ? 'var(--amber)' : 'var(--text3)',
            }}>Recycle All ▸ {recyclableCount}</button>
          </div>
          {/* Tier tally header (at-a-glance haul read) */}
          {tally.length > 0 && (
            <div style={{ display:'flex', alignItems:'center', gap:10, padding:'4px 10px', borderBottom:'1px solid var(--border)', flexWrap:'wrap' }}>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>◈</span>
              {tally.map(t => (
                <span key={t.key} style={{ fontFamily:'var(--font-mono)', fontSize:10, color:t.color }}>{t.count} {t.label}</span>
              ))}
              <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)' }}>{visible.length}/{inventory.length} shown</span>
            </div>
          )}
          <div style={{ flex:1, overflow:'auto', padding:6, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:5, alignContent:'start' }}>
            {visible.map(item => {
              const tColor = ZI.tierColor(item);
              const tMeta = ZI.tierMeta(item);
              return (
              <div key={item.id}
                onClick={() => addToQueue(item)}
                style={{
                  padding:'8px 10px', background:'var(--bg3)',
                  border:'1px solid var(--border)', borderLeft:`3px solid ${tColor}`, cursor:'pointer',
                  transition:'all 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = '#e6c47e'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4, gap:6 }}>
                  <span style={{ display:'flex', alignItems:'center', gap:5, minWidth:0 }}>
                    <span style={{ color:tColor, fontSize:11, flexShrink:0 }} title={`Tier ${tMeta.label}`}>◆</span>
                    {item.fromWandering && <span title="Recovered from a Wandering run" style={{ color:'var(--green)', flexShrink:0 }}>◈</span>}
                    <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:tColor, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{item.name}</span>
                  </span>
                  <Tag color={tColor}>{tMeta.label}</Tag>
                </div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:3 }}>
                  {Object.entries(item.outputs).map(([mat, amt]) => {
                    const m = ZI_MATERIALS[mat];
                    return (
                      <span key={mat} style={{ fontFamily:'var(--font-mono)', fontSize:9, color:m?.color || 'var(--text2)' }}>
                        {m?.icon} {amt} {m?.name}
                      </span>
                    );
                  })}
                </div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'#aab4bc' }} title="Drives recycle time, not value">Weight: {item.weight}kg</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--amber)' }}>+ Add</span>
                </div>
              </div>
              );
            })}
            {inventory.length === 0 && (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:24 }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)' }}>
                  No salvage banked — send a survivor Wandering to fill the Recycler.
                </div>
              </div>
            )}
            {inventory.length > 0 && visible.length === 0 && (
              <div style={{ gridColumn:'1/-1', textAlign:'center', padding:24 }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)' }}>
                  Nothing matches this filter. Change the View menu to see more.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Queue */}
        <div className="panel" style={{ flexShrink:0, maxHeight:'40%', display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div className="panel-title" style={{ display:'flex', justifyContent:'space-between' }}>
            <span>Recycler Queue — {op?.name} operating</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)' }}>{queue.length} pending · ×{op?.bonusMult.toFixed(2)} bonus</span>
          </div>
          <div style={{ flex:1, overflow:'auto', padding:6, display:'flex', flexDirection:'column', gap:4 }}>
            {queue.length === 0 ? (
              <div style={{ padding:14, textAlign:'center', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)' }}>
                Queue empty. Click items above to recycle.
              </div>
            ) : queue.map((job, idx) => {
              const item = job.meta && job.meta.item;
              const pct = ZI.jobProgress(job) * 100;
              const isActive = job.status === 'active';
              return (
                <div key={job.id} style={{
                  padding:'6px 10px', background:'var(--bg3)',
                  border:`1px solid ${isActive?'var(--amber)':'var(--border)'}`,
                  display:'flex', alignItems:'center', gap:10,
                }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
                      <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--text)' }}>{item?.name || job.refId}</span>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color: isActive?'var(--amber)':'var(--text3)' }}>
                        {isActive ? `${Math.round(pct)}% · ${ZI.jobRemaining(job)}s` : 'Queued'}
                      </span>
                    </div>
                    {isActive && <ProgressBar value={pct} color="var(--amber)" height={3} animated/>}
                  </div>
                  <button onClick={() => removeFromQueue(job.id)} style={{
                    background:'rgba(139,58,42,0.15)', border:'1px solid var(--red)',
                    color:'var(--red2)', width:20, height:20, cursor:'pointer', fontSize:10,
                  }}>✕</button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: Material economy panel + operator */}
      <div style={{ width:280, display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
        {/* Operator selector — camp survivors only in Camp Leader mode */}
        {!isCampMode && (
          <div className="panel" style={{ padding:10, flexShrink:0, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)' }}>RECYCLER OPERATOR · {op.name} (you). Assigning camp survivors needs Camp Leader mode.</div>
        )}
        {isCampMode && <div className="panel" style={{ padding:10, flexShrink:0 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:6 }}>RECYCLER OPERATOR</div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            {operators.map(o => {
              const classObj = ZI.CLASSES.find(c => c.id === o.class);
              const isSel = selectedOperator === o.id;
              return (
                <div key={o.id} onClick={() => setSelectedOperator(o.id)} style={{
                  padding:'6px 8px', cursor:'pointer',
                  background: isSel ? 'var(--bg4)' : 'var(--bg3)',
                  border:`1px solid ${isSel?classObj?.color:'var(--border)'}`,
                  display:'flex', alignItems:'center', gap:6, transition:'all 0.15s',
                }}>
                  <div style={{
                    width:22, height:22, borderRadius:'50%',
                    border:`2px solid ${classObj?.color}`, background:'var(--bg4)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontFamily:'var(--font-mono)', fontSize:10, color:classObj?.color,
                  }}>{o.name[0]}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--text)' }}>{o.name}</div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)' }}>
                      {o.type} · ×{o.speed.toFixed(1)} speed · ×{o.bonusMult.toFixed(2)} yield
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>}

        {/* Material economy */}
        <div className="panel" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div className="panel-title">Material Storage</div>
          <div style={{ flex:1, overflow:'auto', padding:8, display:'flex', flexDirection:'column', gap:5 }}>
            {Object.entries(ZI_MATERIALS).map(([key, m]) => {
              const pct = (m.current / m.max) * 100;
              return (
                <div key={key} style={{ padding:'6px 8px', background:'var(--bg3)', border:'1px solid var(--border)' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                    <span style={{ fontSize:14 }}>{m.icon}</span>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--text)', flex:1 }}>{m.name}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:m.color }}>
                      {m.current}/{m.max}
                    </span>
                  </div>
                  <ProgressBar value={pct} color={m.color} height={4}/>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', marginTop:3 }}>
                    Sources: {m.sources.slice(0,2).join(', ')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── CARRY PANEL (Batch 1B): take / put back, pockets and kg ─────────────────
// Reads the one stash/carried/loadout store and re-renders on ZI.onInventoryChange.
window.CarryPanel = function CarryPanel() {
  const Z = window.ZI;
  const [, tick] = React.useState(0);
  React.useEffect(() => Z.onInventoryChange(() => tick(n => n + 1)), []);
  const msg = Z.lastCarryMessage;
  React.useEffect(() => { if (!msg) return; const t = setTimeout(() => tick(n => n + 1), 6100); return () => clearTimeout(t); }, [msg && msg.at]);
  const t = Z.carryTotals(), here = Z.atBaseOrCamp(), carried = Z.getCarried();
  const counts = {}; Z.getStash().forEach(id => { counts[id] = (counts[id] || 0) + 1; });
  const owned = Object.keys(counts).map(id => Z.getGearItem(id)).filter(Boolean);
  const story = owned.filter(g => g.isStory), takeable = owned.filter(g => !g.isStory);
  const showMsg = msg && Date.now() - msg.at < 6000;
  const over = t.overCapacity, pct = t.capacityKg > 0 ? Math.min(100, t.loadKg / t.capacityKg * 100) : 100;
  const mono = { fontFamily:'var(--font-mono)' };
  const btn = (label, onClick, title) => (
    <button onClick={onClick} title={title} style={{ ...mono, fontSize:11, padding:'2px 8px', cursor:'pointer', background:'var(--bg4)', border:`1px solid ${here ? 'var(--amber)' : 'var(--border)'}`, color: here ? 'var(--amber)' : 'var(--text2)', whiteSpace:'nowrap' }}>{label}</button>
  );
  const row = (g, right, sub) => (
    <div key={g.id + (sub || '')} style={{ display:'flex', alignItems:'center', gap:6, padding:'4px 6px', background:'var(--bg3)', border:'1px solid var(--border)', borderLeft:`2px solid ${Z.tierColor(g.rarity)}` }}>
      <span style={{ fontSize:14 }}>{g.icon}</span>
      <span style={{ ...mono, fontSize:11, color:'var(--text)', flex:1, minWidth:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{g.name}{sub ? ' ' + sub : ''}</span>
      <span style={{ ...mono, fontSize:10, color:'var(--text2)' }}>{Z.itemWeight(g)} kg · {Z.itemPocketSize(g)} p</span>
      {right}
    </div>
  );
  return (
    <div className="panel" style={{ padding:0, display:'flex', flexDirection:'column' }}>
      <div className="panel-title" style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
        <span>Carrying</span>
        <span style={{ ...mono, fontSize:11, color: t.pocketsUsed >= t.pocketsMax && t.pocketsMax > 0 ? 'var(--amber)' : 'var(--text)' }}>Pockets {t.pocketsUsed}/{t.pocketsMax}</span>
        <span style={{ ...mono, fontSize:11, color: over ? 'var(--red2)' : 'var(--text)' }}>Load {t.loadKg}/{t.capacityKg} kg{over ? ' · over capacity (limit ' + t.hardLimitKg + ' kg)' : ''}</span>
        <span style={{ ...mono, fontSize:11, marginLeft:'auto', color: here ? 'var(--green)' : 'var(--text2)' }}>{here ? '● At base/camp: you can repack' : '○ In the field: repack at base or camp'}</span>
      </div>
      <div style={{ padding:'6px 10px 0' }}>
        <div style={{ height:6, background:'var(--bg4)' }}><div style={{ height:'100%', width: pct + '%', background: over ? 'var(--red2)' : 'var(--amber)' }}/></div>
        <div style={{ ...mono, fontSize:10, color:'var(--text2)', marginTop:3 }}>Gear {t.gearKg} kg · carried {t.carriedKg} kg · story {t.storyKg} kg · haul {t.haulKg} kg</div>
      </div>
      {showMsg && <div role="status" style={{ margin:'6px 10px 0', padding:'5px 8px', border:'1px solid var(--red2)', background:'rgba(220,80,60,0.1)', ...mono, fontSize:12, color:'var(--text)' }}>⚠ {msg.text}</div>}
      <div style={{ display:'flex', gap:10, padding:10, flexWrap:'wrap', alignItems:'flex-start' }}>
        <div style={{ flex:'1 1 240px', minWidth:0, display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ ...mono, fontSize:10, color:'var(--text2)', letterSpacing:'0.08em' }}>ON YOU ({carried.length + story.length})</div>
          {carried.map((e, i) => { const g = Z.getGearItem(e.id); return g && row(g, <div style={{ display:'flex', gap:4 }}>{btn('Put back', () => Z.putBackToStash(e.id, 1), 'Return one to the stash')}{e.qty > 1 && btn('All', () => Z.putBackToStash(e.id, e.qty), 'Return the whole stack')}</div>, e.qty > 1 ? '×' + e.qty : (String(i))); })}
          {story.map(g => row(g, <span style={{ ...mono, fontSize:10, color:'var(--amber)' }}>On you (story)</span>, '·s'))}
          {!carried.length && !story.length && <div style={{ ...mono, fontSize:11, color:'var(--text2)' }}>Nothing carried yet.</div>}
        </div>
        <div style={{ flex:'1 1 240px', minWidth:0, display:'flex', flexDirection:'column', gap:4 }}>
          <div style={{ ...mono, fontSize:10, color:'var(--text2)', letterSpacing:'0.08em' }}>IN STASH</div>
          {takeable.map(g => row(g, btn('Carry', () => Z.takeToCarried(g.id, 1), 'Take one from the stash'), counts[g.id] > 1 ? '×' + counts[g.id] : ''))}
          {!takeable.length && <div style={{ ...mono, fontSize:11, color:'var(--text2)' }}>Stash is empty.</div>}
        </div>
      </div>
    </div>
  );
};

// ─── STOCKPILE SCREEN (parent tab; Recycler lives in its sub-menu) ───────────
window.StockpileScreen = function StockpileScreen({ initialTab = 'recycler', preparationPanel = null, onNavigate } = {}) {
  const ZI_MATERIALS = window.ZI_MATERIALS;
  const Z = window.ZI;
  const [sub, setSub] = React.useState(initialTab === 'loadout' || initialTab === 'storage' ? initialTab : 'recycler');
  React.useEffect(() => { setSub(initialTab === 'loadout' || initialTab === 'storage' ? initialTab : 'recycler'); }, [initialTab]);
  const [loadout, setLoadout] = React.useState(() => Z.getLoadout());
  const [stash, setStash] = React.useState(() => Z.getStash());
  // Re-read the one stash/loadout store whenever it changes (crafts finishing, equips on another screen).
  React.useEffect(() => {
    let queued = null;
    const refresh = () => {
      if (queued !== null) return;
      queued = setTimeout(() => { queued = null; setStash(Z.getStash()); setLoadout(Z.getLoadout()); }, 0);
    };
    const unsubscribe = Z.onInventoryChange(refresh), timer = setInterval(refresh, 1000);
    return () => { unsubscribe(); clearInterval(timer); if (queued !== null) clearTimeout(queued); };
  }, []);
  const [gearFilter, setGearFilter] = React.useState('ALL');
  const pending = (Z.getWanderLoot && Z.getWanderLoot().length) || 0;
  const stashCount = stash.length;
  const subTabs = [['recycler','Recycler'], ['storage','Storage'], ['loadout','Gear & Loadout']];
  const rc = (r) => Z.tierColor(r); // canonical tier color (shared with Recycler names)
  const gearStats = Z.resolveLoadoutStats(loadout);
  const equip = (id) => { const it = Z.getGearItem(id); const r = Z.equipGear(id, it.slot); if (r) { setLoadout({ ...r.loadout }); setStash([ ...r.stash ]); } };
  const unequip = (slotId) => { const r = Z.unequipGear(slotId); setLoadout({ ...r.loadout }); setStash([ ...r.stash ]); };
  const repair = (id) => { const it = Z.getGearItem(id); if (!it) return; const d = Z.itemDurability(it); if (!d || d.current >= d.max) return; if (!Z.canAffordRepair(it)) return; const cost = Z.repairCost(it); const M = window.ZI_MATERIALS||{}; Object.entries(cost.materials).forEach(([k,q])=>{ if(M[k]) M[k].current=Math.max(0,M[k].current-q); }); Object.entries(cost.rmat||{}).forEach(([k,q])=>Z.addRmat(k,-q)); Z.enqueueJob('repair', id, Math.max(30, Math.round((d.max-d.current)*2)), {}); setLoadout({ ...Z.getLoadout() }); };
  const filterCat = { ALL:null, WEAPONS:'weapon', ARMOR:'armor', GEAR:'gear', ITEMS:'consumable' }[gearFilter];
  // Group stash item ids → counts, then filter.
  const stashCounts = stash.reduce((m, id) => { m[id] = (m[id]||0)+1; return m; }, {});
  const visibleStash = Object.keys(stashCounts).map(id => Z.getGearItem(id)).filter(Boolean)
    .filter(it => !filterCat || it.cat === filterCat);
  const gearGroups = [['weapon','WEAPONS'],['armor','ARMOR'],['gear','GEAR'],['consumable','CONSUMABLES']];
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Sub-menu */}
      <div role="tablist" aria-label="Stockpile" onKeyDown={e => {
        if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
        e.preventDefault();
        const index = subTabs.findIndex(([id]) => id === sub);
        const next = e.key === 'Home' ? 0 : e.key === 'End' ? subTabs.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : -1) + subTabs.length) % subTabs.length;
        setSub(subTabs[next][0]);
        const tab = e.currentTarget.querySelector('#stockpile-tab-' + subTabs[next][0]);
        if (tab) tab.focus();
      }} style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:6, padding:'6px 8px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <span style={{ fontFamily:'var(--font-title)', fontSize:12, color:'var(--amber)', letterSpacing:'0.1em', marginRight:4 }}>STOCKPILE</span>
        {subTabs.map(([id, label]) => (
          <button key={id} role="tab" tabIndex={sub===id ? 0 : -1} aria-selected={sub===id} aria-controls={'stockpile-' + id} id={'stockpile-tab-' + id} onClick={() => setSub(id)} style={{
            fontFamily:'var(--font-body)', fontSize:11, letterSpacing:'0.08em', textTransform:'uppercase',
            padding:'4px 14px', cursor:'pointer',
            background: sub===id ? 'var(--bg4)' : 'transparent',
            color: sub===id ? 'var(--amber)' : 'var(--text2)',
            border:`1px solid ${sub===id ? 'var(--amber)' : 'var(--border)'}`,
          }}>
            {label}{id==='recycler' && pending>0 ? ` (${pending})` : ''}{id==='storage' && stashCount>0 ? ` (${stashCount})` : ''}
          </button>
        ))}
        <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>
          {pending>0 ? `${pending} field item${pending!==1?'s':''} from Wandering awaiting breakdown` : 'No field salvage pending'}
        </span>
      </div>
      <div role="tabpanel" id={'stockpile-' + sub} aria-labelledby={'stockpile-tab-' + sub} style={{ flex:1, minHeight:0, overflow:'hidden' }}>
        {sub === 'recycler' ? <RecyclerScreen/> : sub === 'storage' ? (
          <div className="screen-enter" style={{ padding:10, height:'100%', overflow:'auto', display:'flex', flexDirection:'column', gap:10 }}>
            {/* Materials */}
            <div className="panel" style={{ padding:0, display:'flex', flexDirection:'column', flexShrink:0 }}>
              <div className="panel-title">Material Stockpile</div>
              <div style={{ padding:10, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(220px,1fr))', gap:8 }}>
                {Object.entries(ZI_MATERIALS).map(([key, m]) => {
                  const pct = (m.current / m.max) * 100;
                  return (
                    <div key={key} style={{ padding:'8px 10px', background:'var(--bg3)', border:'1px solid var(--border)' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
                        <span style={{ fontSize:16 }}>{m.icon}</span>
                        <span style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--text)', flex:1 }}>{m.name}</span>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:m.color }}>{m.current}/{m.max}</span>
                      </div>
                      <ProgressBar value={pct} color={m.color} height={5}/>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', marginTop:4 }}>
                        Sources: {m.sources.slice(0,2).join(', ')}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="panel" style={{ padding:0, flexShrink:0 }}>
              <div className="panel-title">Stored Equipment &amp; Supplies</div>
              <div style={{ padding:10, display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
                <span style={{ flex:'1 1 220px', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text2)' }}>Base reserves · matching items grouped by quantity. Choose what to wear and carry in Gear &amp; Loadout.</span>
                <button className="btn" onClick={() => setSub('loadout')}>Gear &amp; Loadout</button>
                {onNavigate && <button className="btn" onClick={() => onNavigate('rmat-crafting')}>Open Crafting</button>}
              </div>
              <div style={{ padding:'0 10px 10px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px,1fr))', gap:6 }}>
                {Object.keys(stashCounts).map(id => Z.getGearItem(id)).filter(Boolean).map(it => {
                  const dur = Z.itemDurability(it);
                  return <div key={it.id} style={{ padding:8, background:'var(--bg3)', border:'1px solid var(--border)', borderTop:`2px solid ${rc(it.rarity)}` }}>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}><span>{it.icon}</span><span style={{ flex:1, fontFamily:'var(--font-body)', fontSize:13 }}>{it.name}</span><b style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--amber)' }}>×{stashCounts[it.id]}</b></div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text2)', marginTop:4 }}>{it.rarity}{dur ? ` · Condition ${Math.round(dur.current)}/${dur.max}` : ''}</div>
                  </div>;
                })}
                {!stashCount && <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)' }}>No stored equipment or supplies. Completed crafts appear here.</div>}
              </div>
            </div>
          </div>
        ) : (
          <div className="screen-enter" style={{ padding:10, height:'100%', overflow:'auto', display:'flex', flexDirection:'column', gap:10 }}>
            {preparationPanel}

            {/* Crafted Gear & Loadout — equip here, carries into Wandering */}
            <div className="panel" style={{ padding:0, display:'flex', flexDirection:'column', flexShrink:0 }}>
              <div className="panel-title" style={{ display:'flex', alignItems:'center' }}>
                <span>Gear &amp; Loadout</span>
                <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>
                  Equipped gear is used in Routes and Wandering
                </span>
              </div>
              <div style={{ display:'flex', gap:10, padding:10, alignItems:'flex-start', flexWrap:'wrap' }}>
                {/* Equipment paperdoll */}
                <div style={{ flex:'1 1 300px', minWidth:0 }}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:8, letterSpacing:'0.1em' }}>EQUIPMENT — click to unequip</div>
                  {gearGroups.map(([cat, label]) => (
                    <div key={cat} style={{ marginBottom:9 }}>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', marginBottom:4 }}>{label}</div>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
                        {Z.GEAR_SLOTS.filter(s => s.accepts === cat).map(s => {
                          const it = loadout[s.id] && Z.getGearItem(loadout[s.id]);
                          const dur = it ? Z.itemDurability(it) : null;
                          const worn = it ? Z.itemWorn(it) : false;
                          const durPct = dur ? (dur.current / dur.max) * 100 : 100;
                          const durColor = durPct <= 20 ? '#f06a5a' : durPct <= 50 ? '#E0A93F' : '#3dcf8e';
                          const damaged = dur && dur.current < dur.max;
                          const afford = it && damaged ? Z.canAffordRepair(it) : false;
                          return (
                            <div key={s.id} title={it ? `${it.name}${dur ? ` · ${Math.round(dur.current)}/${dur.max} durability` : ''}` : s.label} style={{
                              padding:'6px 8px', minHeight:42, cursor:'default',
                              background:'var(--bg3)', border:`1px solid ${it ? (worn ? '#f06a5a' : rc(it.rarity)) : 'var(--border)'}`,
                              borderTop: it ? `2px solid ${worn ? '#f06a5a' : rc(it.rarity)}` : '1px solid var(--border)',
                              display:'flex', flexDirection:'column', gap:3,
                            }}>
                              {it ? (
                                <>
                                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                    <span style={{ fontSize:15 }}>{it.icon}</span>
                                    <div style={{ minWidth:0, flex:1 }}>
                                      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color: worn ? '#f06a5a' : 'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{it.name}{worn ? ' (worn)' : ''}</div>
                                      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)' }}>{s.label}</div>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); unequip(s.id); }} title="Unequip" style={{
                                      fontFamily:'var(--font-mono)', fontSize:8, padding:'1px 5px', cursor:'pointer',
                                      background:'var(--bg4)', border:'1px solid var(--border)', color:'var(--text3)',
                                    }}>✕</button>
                                  </div>
                                  {dur && (
                                    <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                                      <div style={{ flex:1, height:4, background:'var(--bg4)', borderRadius:2 }}>
                                        <div style={{ height:'100%', width:`${durPct}%`, background:durColor, borderRadius:2 }}/>
                                      </div>
                                      <span style={{ fontFamily:'var(--font-mono)', fontSize:7, color:durColor }}>{Math.round(dur.current)}/{dur.max}</span>
                                      {damaged && (
                                        <button onClick={(e) => { e.stopPropagation(); repair(it.id); }} disabled={!afford}
                                          title={afford ? 'Repair (partial re-craft)' : 'Not enough materials to repair'}
                                          style={{
                                            fontFamily:'var(--font-mono)', fontSize:7, padding:'1px 5px', cursor: afford ? 'pointer' : 'not-allowed',
                                            background: afford ? 'rgba(61,207,142,0.12)' : 'var(--bg4)',
                                            border:`1px solid ${afford ? '#3dcf8e' : 'var(--border)'}`, color: afford ? '#3dcf8e' : 'var(--text3)',
                                          }}>🔧</button>
                                      )}
                                    </div>
                                  )}
                                </>
                              ) : (
                                <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>{s.label}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {/* Resolved stats */}
                  <div style={{ display:'flex', gap:12, flexWrap:'wrap', marginTop:6, padding:'7px 9px', background:'var(--bg4)', border:'1px solid var(--border)' }}>
                    {[['HP',gearStats.displayHP,'var(--green)'],['Armor',gearStats.armorRating,'var(--blue)'],['Carry',gearStats.carryCapacity,'var(--amber)'],['Speed',gearStats.speed,'#c894ff'],['Loot',`+${gearStats.lootFind}`,'var(--green)'],['Wpn',`+${Math.round(gearStats.weaponDamage*0.25)}`,'var(--red2)']].map(([k,v,c]) => (
                      <span key={k} style={{ fontFamily:'var(--font-mono)', fontSize:10 }}><span style={{ color:'var(--text3)' }}>{k} </span><span style={{ color:c }}>{v}</span></span>
                    ))}
                  </div>
                </div>

                {/* Crafted stash */}
                <div style={{ flex:'1 1 320px', minWidth:0 }}>
                  <div style={{ display:'flex', gap:4, marginBottom:8 }}>
                    {['ALL','WEAPONS','ARMOR','GEAR','ITEMS'].map(t => (
                      <button key={t} onClick={() => setGearFilter(t)} style={{
                        fontFamily:'var(--font-mono)', fontSize:9, padding:'3px 9px', cursor:'pointer',
                        background: gearFilter===t ? '#2a2318' : 'transparent',
                        border:`1px solid ${gearFilter===t ? '#d4a84a' : 'var(--border)'}`,
                        color: gearFilter===t ? '#f0b429' : 'var(--text3)',
                      }}>{t}</button>
                    ))}
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:4, alignContent:'start' }}>
                    {visibleStash.map(it => (
                      <div key={it.id} onClick={() => equip(it.id)} title={`${it.desc} — click to equip`} style={{
                        padding:'6px 8px', cursor:'pointer', background:'var(--bg3)',
                        border:'1px solid var(--border)', borderTop:`2px solid ${rc(it.rarity)}`,
                        display:'flex', alignItems:'center', gap:7,
                      }}>
                        <span style={{ fontSize:15 }}>{it.icon}</span>
                        <div style={{ minWidth:0, flex:1 }}>
                          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                            {it.name}{stashCounts[it.id] > 1 ? ` ×${stashCounts[it.id]}` : ''}
                          </div>
                          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:rc(it.rarity) }}>
                            {it.dmg ? `DMG ${it.dmg}` : it.armor ? `ARM +${it.armor}` : it.lootBonus ? `LOOT +${it.lootBonus}` : it.cat}
                          </div>
                        </div>
                      </div>
                    ))}
                    {visibleStash.length === 0 && (
                      <div style={{ gridColumn:'1/-1', textAlign:'center', padding:24, fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)' }}>
                        {stashCount === 0 ? 'No crafted gear yet. Craft equipment & consumables in the Crafting tab — they appear here to equip.' : 'Nothing in this category.'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Carrying: take from stash / put back (base or camp only) */}
            <div style={{ flexShrink:0 }}><CarryPanel/></div>
          </div>
        )}
      </div>
    </div>
  );
};
