// game/world.js — Seeded world map, sectors and cells, kills per cell, cleared state, loot risk, km unlocks.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
// Everything attaches to the shared global ZI object; load-time calls live in game/bootstrap.js.

// ─── SAVE FILES (per game mode, 3 slots each) ────────────────────────────────
// A save = a snapshot of every 'zi_*' localStorage key (all game progress).
// Slot data lives under 'zisave_*' so it is never itself part of a snapshot.
// Loading/starting a file rewrites the zi_* keys, then reloads the page so
// every system (materials, engines, loadout…) re-reads clean state.
// ─── TRAVERSAL ↔ WANDERING LINK ─────────────────────────────────────────────
// ─── SEEDED WORLD MAP (sectors of 8×6 cells; 65,535 possible world seeds) ────
// Every cell is a pure function of (seed, global x, global y), so any sector
// regenerates identically on demand and neighbouring sectors always line up.
ZI.SECTOR_COLS = 8; ZI.SECTOR_ROWS = 6;
ZI.MAX_SEED = 65535;
ZI.worldSeed = function() {
  let s = parseInt(localStorage.getItem('zi_world_seed'));
  if (!(s >= 1 && s <= ZI.MAX_SEED)) { s = 1 + Math.floor(Math.random() * ZI.MAX_SEED); try { localStorage.setItem('zi_world_seed', String(s)); } catch (e) {} }
  return s;
};
// Deterministic 0..1 hash of (seed, x, y, salt).
ZI.hash01 = function(seed, x, y, salt) {
  let h = (seed * 374761393 + x * 668265263 + y * 2147483647 + (salt || 0) * 144665) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
  return (h >>> 0) / 4294967295;
};
// Smooth value noise so biomes form regions instead of confetti.
ZI.valueNoise = function(seed, x, y, scale, salt) {
  const fx = x / scale, fy = y / scale, x0 = Math.floor(fx), y0 = Math.floor(fy);
  const tx = fx - x0, ty = fy - y0, sm = t => t * t * (3 - 2 * t);
  const a = ZI.hash01(seed, x0, y0, salt), b = ZI.hash01(seed, x0 + 1, y0, salt);
  const c = ZI.hash01(seed, x0, y0 + 1, salt), d = ZI.hash01(seed, x0 + 1, y0 + 1, salt);
  const u = sm(tx), v = sm(ty);
  return (a * (1 - u) + b * u) * (1 - v) + (c * (1 - u) + d * u) * v;
};
// A small, repeatable daily variation layered over the fixed world. It is scoped
// to the existing 8x6 sector grid and never participates in POI/cell placement.
ZI.WORLD_DAILY_VARIATION = { lootSafetyPct:4, lootYieldUnits:1, factionCheckPct:4, encounterWeightPct:0.10 };
ZI.worldDayIndex = function(atMs) {
  if (!Number.isFinite(atMs) || !ZI._clock) return Math.max(1, Math.floor(ZI.getGameTime ? ZI.getGameTime().day : 1));
  const c = ZI._clock();
  const elapsed = Math.floor((atMs - c.at) / 1000 * (c.rate || ZI.CLOCK_RATE));
  return Math.max(1, Math.floor(((c.day - 1) * 86400 + c.base + elapsed) / 86400) + 1);
};
ZI.worldDailySignal = function(cell, salt, atMs) {
  const seed = ZI.worldSeed(), day = ZI.worldDayIndex(atMs);
  const dailySeed = (seed + day * 7919) % (ZI.MAX_SEED + 1);
  const sx = cell && Number.isFinite(cell.sx) ? cell.sx : cell && Number.isFinite(cell.gx) ? Math.floor(cell.gx / ZI.SECTOR_COLS) : 0;
  const sy = cell && Number.isFinite(cell.sy) ? cell.sy : cell && Number.isFinite(cell.gy) ? Math.floor(cell.gy / ZI.SECTOR_ROWS) : 0;
  return ZI.hash01(dailySeed, sx, sy, 401 + (salt || 0));
};
ZI.worldDailyShift = function(cell, salt, amplitude, atMs) {
  const max = Math.max(0, Number.isFinite(amplitude) ? amplitude : 1);
  return Math.round((ZI.worldDailySignal(cell, salt, atMs) * 2 - 1) * max);
};
// Road edges are decided per shared edge, so both cells on either side agree.
// Arteries every 6th row / 8th column guarantee the network connects across sectors.
ZI.roadEdgeH = function(seed, gx, gy) { // between (gx,gy) and (gx+1,gy)
  if (((gy % ZI.SECTOR_ROWS) + ZI.SECTOR_ROWS) % ZI.SECTOR_ROWS === 3) return 'artery';
  return ZI.hash01(seed, gx, gy, 11) < 0.34 ? 'street' : null;
};
ZI.roadEdgeV = function(seed, gx, gy) { // between (gx,gy) and (gx,gy+1)
  if (((gx % ZI.SECTOR_COLS) + ZI.SECTOR_COLS) % ZI.SECTOR_COLS === 4) return 'artery';
  return ZI.hash01(seed, gx, gy, 23) < 0.34 ? 'street' : null;
};
ZI.WORLD_NAMES = {
  scavenge: ['Residential','Convenience','Garage','Warehouse','Mall','Apartment','Office','Parking Structure','Corner Store','Civic Block'],
  contract: ['Iron March Outpost','Hearthguard Farm','Dustwalker Hub','Concordance Lab','Black Haven Den','Lodge Caravan'],
  training: ['Boxing Gym','Shooting Range','Survival Camp','Med Field','Workshop','Maker Hall'],
  patrol:   ['North Watchtower','East Perimeter','South Bridge','West Approach','Inner Wall'],
  raid:     ['Mall Complex','Hospital','Military Depot','Lab Bunker'],
};
// Specialized sites are rolled once per fixed 8x6 sector, not placed by drawing
// from every cell's ordinary-name pool. Rates shape the mix; biome and spacing
// rules guide placement while sectors fill to their seeded target.
ZI.WORLD_POI_POLICY = [
  { id:'police-station', name:'Police Station', chance:0.10, biomes:['metro'], spacing:4, salt:101 },
  { id:'water-treatment-plant', name:'Water Treatment Plant', chance:0.08, biomes:['metro'], spacing:4, salt:102 },
  { id:'pharmacy', name:'Pharmacy', chance:0.16, biomes:['metro','suburbia'], spacing:4, salt:103, lesser:true },
  { id:'grocery-store', name:'Grocery Store', chance:0.22, biomes:['metro','suburbia'], spacing:3, salt:104, lesser:true },
  { id:'library', name:'Library', chance:0.14, biomes:['metro','suburbia'], spacing:4, salt:105, lesser:true },
  { id:'gas-station', name:'Gas Station', chance:0.18, biomes:['mountain','metro','suburbia','perimeter'], spacing:3, salt:106 },
  { id:'laundromat', name:'Laundromat', chance:0.14, biomes:['metro','suburbia'], spacing:3, salt:107, lesser:true },
  { id:'hardware-store', name:'Hardware Store', chance:0.14, biomes:['metro','suburbia'], spacing:3, salt:108 },
  { id:'community-shelter', name:'Community Shelter', chance:0.10, biomes:['metro','suburbia'], spacing:4, salt:109 },
  { id:'fire-station', name:'Fire Station', chance:0.12, biomes:['metro','suburbia'], spacing:4, salt:110 },
  { id:'transit-depot', name:'Transit Depot', chance:0.08, biomes:['metro'], spacing:4, salt:111 },
  { id:'school', name:'School', chance:0.12, biomes:['metro','suburbia'], spacing:3, salt:112 },
  { id:'office-building', name:'Office Building', chance:0.10, biomes:['metro','suburbia'], spacing:3, salt:113, lesser:true },
  { id:'scrapyard', name:'Scrapyard', chance:0.10, biomes:['mountain','suburbia','perimeter'], spacing:3, salt:114, lesser:true },
  { id:'church', name:'Church', chance:0.12, biomes:['mountain','suburbia','metro','perimeter'], spacing:4, salt:115 },
];
ZI.WORLD_POI_SECTOR_MIN = 5;
ZI.WORLD_POI_SECTOR_MAX = 7;
ZI.WORLD_ORDINARY_NAMES = ZI.WORLD_NAMES.scavenge;
const poiSectorCache = new Map();
ZI.poiPlacementsForSector = function(sx, sy, seed) {
  const key = `${seed}:${sx}:${sy}`;
  if (poiSectorCache.has(key)) return poiSectorCache.get(key);
  const C = ZI.SECTOR_COLS, R = ZI.SECTOR_ROWS;
  const start = (() => { try { return JSON.parse(localStorage.getItem('zi_trav_start') || localStorage.getItem('zi_trav_pos') || 'null'); } catch (e) { return null; } })();
  // The initial position is chosen before the Fort is settled. Defer POI placement
  // until that fixed, seed-picked Fort cell exists so the two sites cannot overlap it.
  if (!start || !Number.isFinite(start.gx) || !localStorage.getItem('zi_fort1_pos')) return [];
  const startSx = Number.isFinite(start.sx) ? start.sx : Math.floor(start.gx / C);
  const startSy = Number.isFinite(start.sy) ? start.sy : Math.floor(start.gy / R);
  const isStartSector = sx === startSx && sy === startSy;
  const storageKey = `zi_world_poi_sites_${seed}_${sx}_${sy}`;
  let savedSites = null;
  try { const saved = JSON.parse(localStorage.getItem(storageKey) || 'null'); if (Array.isArray(saved)) savedSites = saved; } catch (e) {}
  const biomes = ['mountain','suburbia','metro','perimeter'];
  const cells = [];
  for (let row=0; row<R; row++) for (let col=0; col<C; col++) {
    const gx = sx*C+col, gy = sy*R+row;
    const n = ZI.valueNoise(seed,gx,gy,5,3), dist = Math.sqrt(gx*gx+gy*gy);
    const bi = Math.max(0,Math.min(3,Math.floor(n*2.2+dist/12)));
    cells.push({ gx, gy, col, row, biome:biomes[bi] });
  }
  const placed = savedSites ? savedSites.slice() : [], occupied = new Set(placed.map(p => `${p.gx},${p.gy}`));
  const fort = (() => { try { return JSON.parse(localStorage.getItem('zi_fort1_pos') || 'null'); } catch (e) { return null; } })();
  const target = ZI.WORLD_POI_SECTOR_MIN + Math.floor(Math.min(0.999999999, ZI.hash01(seed,sx,sy,2188)) * (ZI.WORLD_POI_SECTOR_MAX - ZI.WORLD_POI_SECTOR_MIN + 1));
  const putPolicy = (policy, index, minSpacing) => {
    const candidates = cells.filter(c => policy.biomes.includes(c.biome) && !(fort && c.gx === fort.gx && c.gy === fort.gy))
      .map(c => ({ ...c, rank:ZI.hash01(seed,c.gx,c.gy,1200+index+placed.length*97) }))
      .sort((a,b) => a.rank-b.rank);
    const choice = candidates.find(c => {
      for (const p of placed) if (p.id === policy.id && Math.max(Math.abs(p.gx-c.gx),Math.abs(p.gy-c.gy)) < minSpacing) return false;
      return !occupied.has(`${c.gx},${c.gy}`);
    });
    if (!choice) return false;
    const site = { gx:choice.gx, gy:choice.gy, col:choice.col, row:choice.row, biome:choice.biome, id:policy.id, name:policy.name, spacing:policy.spacing, lesser:!!policy.lesser };
    placed.push(site); occupied.add(`${site.gx},${site.gy}`); return true;
  };
  const policyOrder = ZI.WORLD_POI_POLICY.map((policy,index) => ({ policy,index, roll:ZI.hash01(seed,sx,sy,2200+policy.salt) }));
  // Chance rolls shape the mix; seeded fallback fills each sector to its 5–7 site target.
  const preferred = policyOrder.filter(x => x.roll < x.policy.chance).sort((a,b) => a.roll-b.roll);
  const fallback = policyOrder.slice().sort((a,b) => (a.roll / a.policy.chance) - (b.roll / b.policy.chance));
  preferred.forEach(x => { if (placed.length < target) putPolicy(x.policy,x.index,x.policy.spacing); });
  fallback.forEach(x => { if (placed.length < target) putPolicy(x.policy,x.index,x.policy.spacing); });
  // Allow repeated POI types when a sector's biome mix cannot supply enough distinct types.
  for (const spacing of [2, 1]) {
    let added = true;
    while (placed.length < target && added) {
      added = false;
      for (const x of fallback) {
        if (placed.length >= target) break;
        if (putPolicy(x.policy,x.index,spacing)) added = true;
      }
    }
  }

  // Keep each extra site as a discovery reward. POI ids from earlier explored
  // sectors are persisted per seed, so revisiting/reloading never rerolls them.
  if (!isStartSector) {
    const seenKey = `zi_world_poi_seen_${seed}`;
    let seen = [];
    try { const raw = JSON.parse(localStorage.getItem(seenKey) || '[]'); if (Array.isArray(raw)) seen = raw; } catch (e) {}
    // Migrate older saves by rebuilding prior explored sectors in their saved order.
    if (!seen.length) {
      let prior = new Set();
      let explored = []; try { const raw = JSON.parse(localStorage.getItem('zi_world_explored') || '["0,0"]'); if (Array.isArray(raw)) explored = raw; } catch (e) {}
      for (const sectorKey of explored) {
        if (sectorKey === `${sx},${sy}`) continue;
        const parts = sectorKey.split(',').map(Number); if (parts.length !== 2 || parts.some(Number.isNaN)) continue;
        const [px,py] = parts, pk = `zi_world_poi_sites_${seed}_${px}_${py}`;
        let earlier = null; try { earlier = JSON.parse(localStorage.getItem(pk) || 'null'); } catch (e) {}
        if (!Array.isArray(earlier)) earlier = buildPriorSites(px,py,seed,prior,start,fort);
        earlier.forEach(p => prior.add(p.id));
        try { localStorage.setItem(pk, JSON.stringify(earlier)); } catch (e) {}
      }
      seen = Array.from(prior);
    }
    const updated = new Set(seen); placed.forEach(p => updated.add(p.id));
    try { localStorage.setItem(seenKey, JSON.stringify(Array.from(updated))); } catch (e) {}
  } else {
    try { localStorage.setItem(`zi_world_poi_seen_${seed}`, JSON.stringify(Array.from(new Set(placed.map(p=>p.id))))); } catch (e) {}
  }
  try { localStorage.setItem(storageKey, JSON.stringify(placed)); } catch (e) {}
  // Keep memory bounded while the player explores many sectors.
  if (poiSectorCache.size >= 64) poiSectorCache.delete(poiSectorCache.keys().next().value);
  poiSectorCache.set(key, placed);
  return placed;
};
// Rebuild an older explored sector without consulting the current sector's cache.
function buildPriorSites(sx,sy,seed,prior,start,fort) {
  const C=ZI.SECTOR_COLS,R=ZI.SECTOR_ROWS, biomes=['mountain','suburbia','metro','perimeter'], cells=[];
  for(let row=0;row<R;row++) for(let col=0;col<C;col++) { const gx=sx*C+col,gy=sy*R+row,n=ZI.valueNoise(seed,gx,gy,5,3),dist=Math.sqrt(gx*gx+gy*gy),bi=Math.max(0,Math.min(3,Math.floor(n*2.2+dist/12))); cells.push({gx,gy,col,row,biome:biomes[bi]}); }
  const startSx=start?(Number.isFinite(start.sx)?start.sx:Math.floor(start.gx/C)):0,startSy=start?(Number.isFinite(start.sy)?start.sy:Math.floor(start.gy/R)):0,isStart=sx===startSx&&sy===startSy,target=isStart?2:3,placed=[],occupied=new Set();
  const put=(policy,index)=>{ if(placed.some(p=>p.id===policy.id))return false; const candidates=cells.filter(c=>policy.biomes.includes(c.biome)&&!(fort&&c.gx===fort.gx&&c.gy===fort.gy)).map(c=>({...c,rank:ZI.hash01(seed,c.gx,c.gy,1200+index)})).sort((a,b)=>a.rank-b.rank); const choice=candidates.find(c=>placed.every(p=>Math.max(Math.abs(p.gx-c.gx),Math.abs(p.gy-c.gy))>=Math.max(policy.spacing,p.spacing))&&!occupied.has(`${c.gx},${c.gy}`)); if(!choice)return false; const site={gx:choice.gx,gy:choice.gy,col:choice.col,row:choice.row,biome:choice.biome,id:policy.id,name:policy.name,spacing:policy.spacing,lesser:!!policy.lesser}; placed.push(site);occupied.add(`${site.gx},${site.gy}`);return true; };
  const order=ZI.WORLD_POI_POLICY.map((policy,index)=>({policy,index,roll:ZI.hash01(seed,sx,sy,2200+policy.salt)}));
  order.filter(x=>x.roll<x.policy.chance).sort((a,b)=>a.roll-b.roll).forEach(x=>{if(placed.length<target)put(x.policy,x.index);});
  order.filter(x=>!placed.some(p=>p.id===x.policy.id)).sort((a,b)=>(a.roll/a.policy.chance)-(b.roll/b.policy.chance)).forEach(x=>{if(placed.length<target)put(x.policy,x.index);});
  if(!isStart) for(const x of ZI.WORLD_POI_POLICY.map((policy,index)=>({policy,index})).filter(x=>x.policy.lesser&&!prior.has(x.policy.id)&&!placed.some(p=>p.id===x.policy.id))) if(put(x.policy,x.index))break;
  return placed;
}
ZI.sectorLabel = function(sx, sy) {
  const ns = sy === 0 ? '' : (sy < 0 ? 'N' + (-sy) : 'S' + sy);
  const ew = sx === 0 ? '' : (sx < 0 ? 'W' + (-sx) : 'E' + sx);
  return (ns + ew) || 'Origin';
};
ZI.worldCell = function(gx, gy, type) {
  const seed = ZI.worldSeed(), C = ZI.SECTOR_COLS, R = ZI.SECTOR_ROWS;
  const sx = Math.floor(gx / C), sy = Math.floor(gy / R);
  const col = gx - sx * C, row = gy - sy * R;
  const h = ZI.hash01(seed, gx, gy, 1);
  const dist = Math.sqrt(gx * gx + gy * gy);
  const n = ZI.valueNoise(seed, gx, gy, 5, 3);
  const biomes = ['mountain','suburbia','metro','perimeter'];
  const bi = Math.max(0, Math.min(3, Math.floor(n * 2.2 + dist / 12)));
  const pool = ZI.WORLD_NAMES[type] || ZI.WORLD_NAMES.scavenge;
  const sectorSites = type === 'scavenge' ? ZI.poiPlacementsForSector(sx,sy,seed) : [];
  const poi = sectorSites.find(site => site.gx === gx && site.gy === gy) || null;
  const locationPool = type === 'scavenge' ? ZI.WORLD_ORDINARY_NAMES : pool;
  const poiType = poi ? poi.id : null;
  const coord = String.fromCharCode(65 + col) + (row + 1);
  const difficulty = Math.max(1, Math.min(5, 1 + Math.floor(dist / 6) + (n > 0.72 ? 1 : 0)));
  // 'cleared' is real player progress (kills in the cell), not a random hash band.
  const state = h < 0.08 ? 'locked' : (ZI.isCellCleared && ZI.isCellCleared(gx, gy)) ? 'cleared' : h > 0.92 ? 'contested' : 'available';
  return {
    id: `${type}-${gx}-${gy}`, gx, gy, sx, sy, row, col, coord,
    name: (poi ? poi.name : locationPool[Math.floor(ZI.hash01(seed, gx, gy, 5) * locationPool.length)]) + ' ' + coord,
    biome: biomes[bi], poiType, difficulty, state,
    threatLevel: Math.min(5, difficulty + Math.floor(h * 2)),
    duration: 1 + Math.floor(h * 8),
    rmatTier: Math.min(5, Math.floor(difficulty * 0.8)),
    roads: {
      n: ZI.roadEdgeV(seed, gx, gy - 1), s: ZI.roadEdgeV(seed, gx, gy),
      w: ZI.roadEdgeH(seed, gx - 1, gy), e: ZI.roadEdgeH(seed, gx, gy),
    },
    tileSeed: (seed * 7 + gx * 131 + gy * 17) | 0,
    xPos: col, yPos: row,
  };
};
// Sectors the player has already generated/viewed (always re-viewable).
ZI.getExploredSectors = function() { try { return JSON.parse(localStorage.getItem('zi_world_explored') || '["0,0"]'); } catch (e) { return ['0,0']; } };
ZI.markSectorExplored = function(sx, sy) {
  const k = sx + ',' + sy, list = ZI.getExploredSectors();
  if (!list.includes(k)) { list.push(k); try { localStorage.setItem('zi_world_explored', JSON.stringify(list)); } catch (e) {} }
};
// The survivor's Traversal map cell is where the idle Wandering patrol happens.
ZI.zoneFromCell = function(c) {
  return { gx:c.gx, gy:c.gy, sx:c.sx, sy:c.sy, row:c.row, col:c.col, name:c.name, biome:c.biome, poiType:c.poiType || null, difficulty:c.difficulty, threatLevel:c.threatLevel, rmatTier:c.rmatTier };
};
ZI.getTravZone = function() {
  try { const p = JSON.parse(localStorage.getItem('zi_trav_pos') || 'null'); return p && p.name ? p : null; } catch (e) { return null; }
};

// ─── TRAVERSAL LOOT RISK ────────────────────────────────────────────────────
// Chance to loot a zone untouched; a failed roll means the survivor gets hurt.
// Zone threat lowers it; Scavenging and Stealth raise it.
ZI.lootSafeChance = function(cell) {
  const sc = ZI.effectiveLevel ? ZI.effectiveLevel('scavenging') : 1;
  const st = ZI.effectiveLevel ? ZI.effectiveLevel('stealth') : 1;
  const daily = ZI.worldDailyShift ? ZI.worldDailyShift(cell, 1, ZI.WORLD_DAILY_VARIATION.lootSafetyPct) : 0;
  const raw = 85 - (cell.threatLevel || 0) * 11 - (cell.difficulty || 1) * 3 + sc * 0.6 + st * 0.4 + daily;
  return Math.max(15, Math.min(95, Math.round(raw)));
};
ZI.lootFailDamage = function(cell) {
  const base = 6 + (cell.threatLevel || 0) * 4 + (cell.difficulty || 1) * 2;
  return Math.max(1, Math.round(base * (0.75 + Math.random() * 0.5)));
};

// ─── KM-GATED TRAVERSAL UNLOCKS ──────────────────────────────────────────────
// Each milestone (in meters of Wandering distance) unlocks a new lootable zone.
ZI.TRAVERSAL_KM_UNLOCKS = [
  { meters: 300,  zoneId: 'rt_suburb2', name: 'Industrial Row' },
  { meters: 600,  zoneId: 'rt_metro1',  name: 'Downtown Grid' },
  { meters: 1000, zoneId: 'rt_metro2',  name: 'Vertical Wasteland' },
  { meters: 1500, zoneId: 'rt_perim1',  name: 'Perimeter Alpha Zone' },
  { meters: 2200, zoneId: 'rt_perim2',  name: 'Echo Chamber Depth' },
];
ZI.UNLOCKED_ZONES_KEY = 'zi_unlocked_zones';
ZI.getUnlockedZones = function() {
  try { return new Set(JSON.parse(localStorage.getItem(ZI.UNLOCKED_ZONES_KEY) || '[]')); }
  catch (e) { return new Set(); }
};
// Returns array of newly-unlocked milestones (for surfacing a toast/log).
ZI.checkKmUnlocks = function(meters) {
  const set = ZI.getUnlockedZones();
  const fresh = [];
  ZI.TRAVERSAL_KM_UNLOCKS.forEach(m => {
    if (meters >= m.meters && !set.has(m.zoneId)) { set.add(m.zoneId); fresh.push(m); }
  });
  if (fresh.length) { try { localStorage.setItem(ZI.UNLOCKED_ZONES_KEY, JSON.stringify([...set])); } catch (e) {} }
  return fresh;
};
// ═══ FIRST FORT (Hearthguard gate), FALLOW GROUND, FACTIONS GATE (Fort brief §10–11) ═══
ZI.CELL_CLEAR_KILLS = 40;
// Kills are credited to whichever Traversal cell the survivor is standing in.
ZI.getCellKills = function() { return ZI._rj('zi_cell_kills', {}); };
ZI.addCellKill = function(n) {
  const z = ZI.getTravZone && ZI.getTravZone(); if (!z || z.gx == null) return;
  const k = z.gx + ',' + z.gy, m = ZI.getCellKills(); m[k] = (m[k] || 0) + (n || 1); ZI._wj('zi_cell_kills', m);
  const q = ZI.getFallowQuest();
  if (q.state === 'active' && q.cell && q.cell.gx === z.gx && q.cell.gy === z.gy && ZI.isCellCleared(z.gx, z.gy)) {
    q.state = 'ready'; ZI._wj('zi_quest_fallow_ground', q);
  }
};
// A Traversal cell is 'cleared' once it has CELL_CLEAR_KILLS kills (same counter the Fallow Ground quest reads).
// Per-cell clear target: 40 by default; the Fallow Ground cell needs 60 on check terms (brief 12.4).
ZI.cellClearTarget = function(gx, gy) {
  const f = ZI._rj('zi_fort1_pos', null), q = ZI._rj('zi_quest_fallow_ground', { state:'none' });
  if (f && f.fallow && f.fallow.gx === gx && f.fallow.gy === gy && q.terms === 'check') return ZI.FALLOW_TERMS.check.kills;
  return ZI.CELL_CLEAR_KILLS;
};
// Home ground (start cell and camp cell) counts as cleared (brief 12.5).
ZI.isHomeCell = function(gx, gy) {
  const s = ZI._rj('zi_trav_start', null), c = ZI._rj('zi_trav_camp', null);
  return !!((s && s.gx === gx && s.gy === gy) || (c && c.gx === gx && c.gy === gy));
};
ZI.isCellCleared = function(gx, gy) {
  if (ZI.isHomeCell(gx, gy)) return true;
  return (ZI.getCellKills()[gx + ',' + gy] || 0) >= ZI.cellClearTarget(gx, gy);
};
// Familiarity for the Wandering stress system: 'cleared' | 'explored' | 'unexplored'.
ZI.cellFamiliarity = function(gx, gy) {
  if (ZI.isCellCleared(gx, gy)) return 'cleared';
  const C = ZI.SECTOR_COLS, R = ZI.SECTOR_ROWS;
  return ZI.getExploredSectors().includes(Math.floor(gx / C) + ',' + Math.floor(gy / R)) ? 'explored' : 'unexplored';
};

// ─── HIDE: WHAT WANDERING CAN DRAW (TRAV-01a behavior 3, Sam Oct 21: T2, S2) ──────────────────────────
// Cells do not hold zombie lists yet, so Hide reports only what Wandering really uses: the cell's threat level and
// the tier range ZI._bgZombie can draw right now. Same rule as wandering.js (_bgZombie + rollEncounter):
// lap = floor(scroll / 100) + Push On boost; a tier is drawable when its rank ≤ min(7, floor(lap / 1.5)).
ZI.TIER_ORDER = ['F','E','D','C','B','A','S','BOSS'];
ZI.wanderDrawableTiers = function(state) {
  const s = state || (ZI.getWanderRun ? ZI.getWanderRun() : {}) || {};
  const boost = ZI.ACTIVE_TABLE ? (s.pressure || 0) * ZI.ACTIVE_TABLE.push.tierBoost * 1.5 : 0;
  const lap = Math.floor((s.scroll || 0) / 100) + boost, cap = Math.min(7, Math.floor(lap / 1.5));
  const present = {}; (ZI.BESTIARY || []).forEach(z => { present[z.tier] = 1; });
  return ZI.TIER_ORDER.filter((t, rank) => rank <= cap && present[t]);
};
ZI.tierLabelShort = function(t) { return t === 'BOSS' ? 'SS' : t; };
ZI.hideThreats = function(cell, state) {
  const tiers = ZI.wanderDrawableTiers(state), lv = Math.min(5, (cell && cell.threatLevel) || 0);
  const range = tiers.length ? (tiers.length === 1 ? ZI.tierLabelShort(tiers[0]) : ZI.tierLabelShort(tiers[0]) + '–' + ZI.tierLabelShort(tiers[tiers.length - 1])) : '—';
  return { threatLevel: lv, dangerLabel: ZI.THREAT_LABELS[lv], tiers, range };
};
ZI.THREAT_LABELS = ['Quiet','Low','Moderate','High','Severe','Lethal'];
