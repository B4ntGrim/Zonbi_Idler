
// Zombie Idler — Game Data Constants
// All game data: classes, factions, items, zombies, routes, RMAT tiers

window.ZI = window.ZI || {};

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
  scavenge: ['Residential','Convenience','Garage','Warehouse','Mall','Apartment','Office','Gas Station'],
  contract: ['Iron March Outpost','Hearthguard Farm','Dustwalker Hub','Concordance Lab','Black Haven Den','Lodge Caravan'],
  training: ['Boxing Gym','Shooting Range','Survival Camp','Med Field','Workshop','Maker Hall'],
  patrol:   ['North Watchtower','East Perimeter','South Bridge','West Approach','Inner Wall'],
  raid:     ['Mall Complex','Police Station','Hospital','Military Depot','Lab Bunker'],
};
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
  const coord = String.fromCharCode(65 + col) + (row + 1);
  const difficulty = Math.max(1, Math.min(5, 1 + Math.floor(dist / 6) + (n > 0.72 ? 1 : 0)));
  // 'cleared' is real player progress (kills in the cell), not a random hash band.
  const state = h < 0.08 ? 'locked' : (ZI.isCellCleared && ZI.isCellCleared(gx, gy)) ? 'cleared' : h > 0.92 ? 'contested' : 'available';
  return {
    id: `${type}-${gx}-${gy}`, gx, gy, sx, sy, row, col, coord,
    name: pool[Math.floor(ZI.hash01(seed, gx, gy, 5) * pool.length)] + ' ' + coord,
    biome: biomes[bi], difficulty, state,
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
  return { gx:c.gx, gy:c.gy, sx:c.sx, sy:c.sy, row:c.row, col:c.col, name:c.name, biome:c.biome, difficulty:c.difficulty, threatLevel:c.threatLevel, rmatTier:c.rmatTier };
};
ZI.getTravZone = function() {
  try { const p = JSON.parse(localStorage.getItem('zi_trav_pos') || 'null'); return p && p.name ? p : null; } catch (e) { return null; }
};

// ─── SPLASH ART ROTATION (Save Files backdrop) ──────────────────────────────
// 10 scenes (4 survivor). Art is dropped in by the player/artist; each gore
// scene has an optional _mild variant used when Reduced Gore is on.
ZI.SPLASH_SET = [
  { id:'SPL-01', title:'Overrun Interstate',        kind:'Horde / Gore',       brief:'Jammed highway, horde pouring between abandoned cars, burning skyline.', gore:true },
  { id:'SPL-02', title:'The Pharmacy Run',          kind:'Survivor',           brief:'Lone survivor looting medicine while the infected press on the glass.', gore:false },
  { id:'SPL-03', title:"Butcher's Freezer",         kind:'Gore',               brief:'Walk-in freezer, meat hooks, a mutated infected over a fresh kill.', gore:true },
  { id:'SPL-04', title:'Rooftop Watch',             kind:'Survivor',           brief:'Two survivors on a sandbagged rooftop at smoggy dusk, horde below.', gore:false },
  { id:'SPL-05', title:'Hospital Corridor',         kind:'Gore / Horror',      brief:'Collapsed ceiling, drag marks, chained doors bulging from behind.', gore:true },
  { id:'SPL-06', title:'Campfire Circle',           kind:'Survivor',           brief:'Squad of four around a drum fire in a barricaded cul-de-sac.', gore:false },
  { id:'SPL-07', title:'Flooded Subway',            kind:'Gore / Environment', brief:'Half-flooded station, derailed car, drowned infected wading in.', gore:true },
  { id:'SPL-08', title:'The Last Stand at the Gate',kind:'Survivor / Action',  brief:'Camp gate at the moment of breach — floodlights, rain, sparks.', gore:false },
  { id:'SPL-09', title:'Mass Grave Excavation',     kind:'Gore / Lore',        brief:'Failed quarantine burn pit, abandoned military gear, falling ash.', gore:true },
  { id:'SPL-10', title:'Boss Silhouette',           kind:'Tier Tease',         brief:'SS-tier giant emerging from a burning refinery, tiny figures fleeing.', gore:true },
];
ZI.SPLASH = { MIN_S:25, MAX_S:30, FADE_S:2, SCALE_END:1.08, PAN:0.03, DIM:0.55 };
ZI.getReducedGore = function() { try { return localStorage.getItem('zi_reduced_gore') === '1'; } catch (e) { return false; } };
ZI.setReducedGore = function(v) { try { localStorage.setItem('zi_reduced_gore', v ? '1' : '0'); } catch (e) {} };

// ─── GLOBAL GAME CLOCK (shared day/time; 1 game second per 2 real seconds) ───
ZI.CLOCK_KEY = 'zi_game_clock';
ZI.CLOCK_RATE = 0.5; // game seconds per real second
ZI._clock = function() {
  let c; try { c = JSON.parse(localStorage.getItem(ZI.CLOCK_KEY) || 'null'); } catch (e) { c = null; }
  if (!c) { c = { base: 14 * 3600, day: 1, at: Date.now() }; localStorage.setItem(ZI.CLOCK_KEY, JSON.stringify(c)); }
  return c;
};
// Total game seconds since Day 1 00:00.
ZI.gameTotalSeconds = function() {
  const c = ZI._clock();
  return (c.day - 1) * 86400 + c.base + Math.floor((Date.now() - c.at) / 1000 * ZI.CLOCK_RATE);
};
ZI.getGameTime = function() {
  const t = ZI.gameTotalSeconds();
  return { day: Math.floor(t / 86400) + 1, second: t % 86400 };
};
// Skip ahead N in-game hours (e.g. resting at camp). Returns the new day number.
ZI.passTime = function(hours) {
  const t = ZI.gameTotalSeconds() + Math.round(hours * 3600);
  const c = { day: Math.floor(t / 86400) + 1, base: t % 86400, at: Date.now() };
  try { localStorage.setItem(ZI.CLOCK_KEY, JSON.stringify(c)); } catch (e) {}
  return c.day;
};

// ─── PLAYER SETTINGS ─────────────────────────────────────────────────────────
ZI.SETTINGS_KEY = 'zi_settings';
ZI.SETTINGS_DEFAULTS = { damageNumbers: true };
ZI.getSettings = function() { try { return Object.assign({}, ZI.SETTINGS_DEFAULTS, JSON.parse(localStorage.getItem(ZI.SETTINGS_KEY) || '{}')); } catch (e) { return Object.assign({}, ZI.SETTINGS_DEFAULTS); } };
ZI.setSetting = function(k, v) { const s = ZI.getSettings(); s[k] = v; try { localStorage.setItem(ZI.SETTINGS_KEY, JSON.stringify(s)); } catch (e) {} };

// ─── TRAVERSAL LOOT RISK ────────────────────────────────────────────────────
// Chance to loot a zone untouched; a failed roll means the survivor gets hurt.
// Zone threat lowers it; Scavenging and Stealth raise it.
ZI.lootSafeChance = function(cell) {
  const sc = ZI.effectiveLevel ? ZI.effectiveLevel('scavenging') : 1;
  const st = ZI.effectiveLevel ? ZI.effectiveLevel('stealth') : 1;
  const raw = 85 - (cell.threatLevel || 0) * 11 - (cell.difficulty || 1) * 3 + sc * 0.6 + st * 0.4;
  return Math.max(15, Math.min(95, Math.round(raw)));
};
ZI.lootFailDamage = function(cell) {
  const base = 6 + (cell.threatLevel || 0) * 4 + (cell.difficulty || 1) * 2;
  return Math.max(1, Math.round(base * (0.75 + Math.random() * 0.5)));
};

ZI.SAVE_SLOT_COUNT = 3;
ZI.SAVE_INDEX_KEY = 'zisave_index';   // { camp:{1:meta,…}, solo:{…} }
ZI.SAVE_ACTIVE_KEY = 'zisave_active'; // { mode, slot }
ZI._readJSON = function(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
ZI._gameKeys = function() {
  const out = [];
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.indexOf('zi_') === 0) out.push(k); }
  return out;
};
ZI._snapshot = function() { const snap = {}; ZI._gameKeys().forEach(k => { snap[k] = localStorage.getItem(k); }); return snap; };
ZI._restore = function(snap) {
  ZI._gameKeys().forEach(k => localStorage.removeItem(k));
  Object.entries(snap || {}).forEach(([k, v]) => { if (k.indexOf('zi_') === 0 && v != null) localStorage.setItem(k, v); });
};
ZI._summary = function() {
  let distance = 0; try { distance = parseInt(localStorage.getItem('zi_wander_total')) || 0; } catch (e) {}
  const run = ZI._readJSON('zi_wander_run', {});
  distance = Math.max(distance, Math.round(run.scroll || 0));
  // Use the game's real Camp Leader level (defined later in this file; _summary only runs at runtime).
  const level = ZI.leaderLevel ? ZI.leaderLevel() : 1;
  return { level, distance };
};
ZI.getActiveSlot = function() { return ZI._readJSON(ZI.SAVE_ACTIVE_KEY, null); };
ZI.listSlots = function(mode) {
  const idx = ZI._readJSON(ZI.SAVE_INDEX_KEY, {});
  // One-time safety: if progress exists but no file has ever been saved, keep it
  // as Slot 1 of the first mode opened so nothing already played is lost.
  if (!idx.camp && !idx.solo && ZI._gameKeys().length) {
    idx[mode] = { 1: { savedAt: Date.now(), label: 'Imported progress', summary: ZI._summary() } };
    localStorage.setItem('zisave_data_' + mode + '_1', JSON.stringify(ZI._snapshot()));
    localStorage.setItem(ZI.SAVE_INDEX_KEY, JSON.stringify(idx));
    localStorage.setItem(ZI.SAVE_ACTIVE_KEY, JSON.stringify({ mode, slot: 1 })); // current progress IS this file
  }
  // Repair: an imported file with no active file is the live progress — adopt it.
  if (!ZI.getActiveSlot() && idx[mode] && idx[mode][1] && idx[mode][1].label === 'Imported progress') {
    localStorage.setItem(ZI.SAVE_ACTIVE_KEY, JSON.stringify({ mode, slot: 1 }));
  }
  const m = idx[mode] || {};
  // The active file mirrors live progress — refresh its card so it never shows stale numbers.
  const act = ZI.getActiveSlot();
  if (act && act.mode === mode && m[act.slot]) m[act.slot] = Object.assign({}, m[act.slot], { summary: ZI._summary() });
  const out = [];
  for (let n = 1; n <= ZI.SAVE_SLOT_COUNT; n++) out.push(m[n] ? Object.assign({ slot: n, empty: false }, m[n]) : { slot: n, empty: true });
  return out;
};
ZI._writeSlot = function(mode, slot, label) {
  const idx = ZI._readJSON(ZI.SAVE_INDEX_KEY, {});
  idx[mode] = idx[mode] || {};
  localStorage.setItem('zisave_data_' + mode + '_' + slot, JSON.stringify(ZI._snapshot()));
  idx[mode][slot] = { savedAt: Date.now(), label: label || (idx[mode][slot] && idx[mode][slot].label) || ((mode === 'camp' ? 'Camp Leader' : 'Solo Survivor') + ' — File ' + slot), summary: ZI._summary() };
  localStorage.setItem(ZI.SAVE_INDEX_KEY, JSON.stringify(idx));
};
ZI._boot = function(mode, slot) {
  localStorage.setItem(ZI.SAVE_ACTIVE_KEY, JSON.stringify({ mode, slot }));
  // Timestamped, read-without-delete: the host may load the page more than once after reload.
  try { localStorage.setItem('zisave_resume', JSON.stringify({ mode, at: Date.now() })); } catch (e) {}
  location.reload();
};
ZI.startNewInSlot = function(mode, slot) {
  ZI._restore({});                       // clean progress
  // Brand-new file: empty stockpile, and the Crafting tutorial runs on first visit.
  localStorage.setItem('zi_materials', JSON.stringify({ metal:0, wood:0, cloth:0, electronics:0, fuel:0, medical:0 }));
  localStorage.setItem('zi_fresh_start', '1'); // first boot of this file opens on Traversal
  ZI._writeSlot(mode, slot, null);       // create the file immediately
  ZI._boot(mode, slot);
};
ZI.loadSlot = function(mode, slot) {
  const snap = ZI._readJSON('zisave_data_' + mode + '_' + slot, null);
  if (!snap) return false;
  ZI._restore(snap);
  ZI._boot(mode, slot);
  return true;
};
ZI.saveToActiveSlot = function() {
  const a = ZI.getActiveSlot();
  if (!a) return { ok: false, reason: 'No save file selected — choose one from the main menu' };
  ZI._writeSlot(a.mode, a.slot, null);
  return { ok: true, slot: a.slot };
};
ZI.deleteSlot = function(mode, slot) {
  const idx = ZI._readJSON(ZI.SAVE_INDEX_KEY, {});
  if (idx[mode]) delete idx[mode][slot];
  localStorage.setItem(ZI.SAVE_INDEX_KEY, JSON.stringify(idx));
  localStorage.removeItem('zisave_data_' + mode + '_' + slot);
  const a = ZI.getActiveSlot();
  if (a && a.mode === mode && a.slot === slot) localStorage.removeItem(ZI.SAVE_ACTIVE_KEY);
};
// Honour a resume request for ~20s after Continue/New Game; never deleted on read.
ZI.RESUME_WINDOW_MS = 20000;
ZI._bootMode = (function() {
  try {
    const r = JSON.parse(localStorage.getItem('zisave_resume') || 'null');
    if (r && r.mode && Date.now() - (r.at || 0) < ZI.RESUME_WINDOW_MS) return r.mode;
  } catch (e) {}
  return null;
})();
ZI.consumeBootMode = function() { return ZI._bootMode; };
// Called when the player deliberately goes back to the mode picker.
ZI.clearResume = function() { ZI._bootMode = null; try { localStorage.removeItem('zisave_resume'); } catch (e) {} };

// ─── SURVIVAL ATTRIBUTES ─────────────────────────────────────────────────────
ZI.SURVIVAL_ATTRS = [
  { key: 'S', name: 'Survival',       desc: 'Environmental resistance, hazard tolerance, radiation/corrosion defense' },
  { key: 'U', name: 'Underhandedness', desc: 'Stealth, noise reduction, escape chance, evasion' },
  { key: 'R', name: 'Reflex',         desc: 'Speed, precision, firearm finesse, dodge chance' },
  { key: 'V', name: 'Vitality',       desc: 'Max HP, wound resistance, infection tolerance' },
  { key: 'I', name: 'Insight',        desc: 'RMAT attunement, rare loot, hazard detection, tech aptitude' },
  { key: 'V2', name: 'Valor',         desc: 'Melee power, carry capacity, poise, heavy tools' },
  { key: 'A', name: 'Aptitude',       desc: 'Stamina, load capacity, sprint duration, endurance' },
  { key: 'L', name: 'Lucky',          desc: 'Legendary drop chance, loot bias, jackpot events' },
];

// ─── CLASSES ─────────────────────────────────────────────────────────────────
ZI.CLASSES = [
  { id: 'scavenger', name: 'Scavenger',     tier: 'standard', aura: 'Dumpfire', color: '#e6c47e',
    primary: ['U','L'], desc: 'Masters of stealth extraction. Double POI loot rolls.',
    perks: ['Silent Step', 'Pack Rat', 'Ghost Hands'], masteryLevel: 6 },
  { id: 'enforcer',  name: 'Enforcer',      tier: 'standard', aura: 'Ironwall', color: '#e0624c',
    primary: ['V2','V'], desc: 'Front-line brawlers. Heavy melee scales off Valor.',
    perks: ['Iron Grip', 'Breaker', 'Unstoppable'], masteryLevel: 6 },
  { id: 'medic',     name: 'Field Medic',   tier: 'standard', aura: 'Mend Aura', color: '#a2dca2',
    primary: ['V','A'], desc: 'Sustain specialists. Heal faster, infect slower.',
    perks: ['Triage', 'Clean Hands', 'Second Wind'], masteryLevel: 6 },
  { id: 'mechanic',  name: 'Mechanic',      tier: 'standard', aura: 'Tinker', color: '#a0a0c8',
    primary: ['I','A'], desc: 'Vehicle & tool experts. Repair costs halved.',
    perks: ['Quick Wrench', 'Jury Rig', 'Overhaul'], masteryLevel: 6 },
  { id: 'ranger',    name: 'Ranger',        tier: 'advanced', aura: 'Pathfinder', color: '#e6c47e',
    primary: ['R','U'], desc: 'Long-range survival. Firearms scale off Reflex+Insight.',
    perks: ['Steady Aim', 'Ghost Sight', 'Deadstop'], masteryLevel: 8 },
  { id: 'chemist',   name: 'RMAT Chemist',  tier: 'advanced', aura: 'Resonance', color: '#c894ff',
    primary: ['I','S'], desc: 'Anomalous material specialist. RMAT yield +40%.',
    perks: ['Attunement', 'Flux Control', 'Anomaly Pulse'], masteryLevel: 8 },
  { id: 'warden',    name: 'Warden',        tier: 'elite',    aura: 'Bulwark', color: '#74b6ee',
    primary: ['S','V'], desc: 'Hazard tanks. Immune to Tier I-III biome effects.',
    perks: ['Hazard Proof', 'Core Shell', 'Titan Walk'], masteryLevel: 10 },
  { id: 'phantom',   name: 'Phantom',       tier: 'elite',    aura: 'Wraith Step', color: '#e879f9',
    primary: ['U','R'], desc: 'Elite stealth assassins. Encounters can be bypassed entirely.',
    perks: ['Phase Walk', 'Silent Kill', 'Echo Fade'], masteryLevel: 10 },
];

// ─── FACTIONS ─────────────────────────────────────────────────────────────────
ZI.FACTIONS = [
  { id: 'concordance', name: 'The Concordance',       color: '#c894ff', rep: 0,
    theme: 'RMAT Researchers', territory: 'Labs & Hazard Domes',
    synergy: ['I','S'], rank: 'Stranger',
    services: ['RMAT Stabilizers', 'Exotic Blueprints', 'Hazard Forecasting', 'Insight Class Manuals'] },
  { id: 'ironmarch',   name: 'The Iron March',         color: '#e0624c', rep: 240,
    theme: 'Militarized Defenders', territory: 'Bunkers & Checkpoints',
    synergy: ['V2','V'], rank: 'Known',
    services: ['Heavy Armor', 'Bulk Ammo', 'Defense Contracts', 'Fortified Safe Zones'] },
  { id: 'dustwalkers', name: 'The Dustwalkers',        color: '#e6c47e', rep: 90,
    theme: 'Scavengers & Explorers', territory: 'Industrial POIs & Metro Shanties',
    synergy: ['U','L'], rank: 'Stranger',
    services: ['Black Market', 'Loot Rerollers', 'Route Intel', 'Scavenging Mods'] },
  { id: 'hearthguard', name: 'The Hearthguard',        color: '#a2dca2', rep: 180,
    theme: 'Builders & Farmers', territory: 'Agricultural Settlements',
    synergy: ['A','V'], rank: 'Known',
    services: ['Camp Blueprints', 'Farming Tools', 'Food Production Bonuses', 'Profession Upskill'] },
  { id: 'blackhaven',  name: 'Black Haven Collective', color: '#b99be8', rep: 45,
    theme: 'Smugglers & Brokers', territory: 'Hidden Trade Dens',
    synergy: ['R','I'], rank: 'Stranger',
    services: ['Contraband RMAT', 'Weapon Mods', 'Underground Auctions', 'Illegal Contracts'] },
  { id: 'lodge',       name: 'Hearthbound Lodge',      color: '#f59e42', rep: 320,
    theme: 'Resupply & Forecasting', territory: 'Mountain Inns & Caravans',
    synergy: ['L','I','V'], rank: 'Trusted',
    services: ['Hearty Meals', 'Weather Forecast', 'Route Predictions', 'Market Rumors'] },
];

ZI.REP_RANKS = ['Stranger','Neutral','Known','Allied','Trusted','Honored','Venerated'];
ZI.REP_THRESHOLDS = [0, 100, 250, 500, 900, 1500, 2500];

// ─── BIOMES ───────────────────────────────────────────────────────────────────
ZI.BIOMES = [
  { id: 'mountain',  name: 'Mountain Country',      tier: '0–1', color: '#6b8f71', danger: 1,
    resources: ['Wood','Herbs','Stone','Small Game'], rmat: 'Trace',
    zombies: ['Shamblers (90%)','Runners (10%)'],
    hazards: ['Cold','Fog','Rain'], depth: ['Surface','Mid-Depth'] },
  { id: 'suburbia',  name: 'Ruined Suburbia',        tier: '1–2', color: '#e6c47e', danger: 2,
    resources: ['Scrap Metal','Electronics','Packaged Food','Wiring'], rmat: 'Tier 1 (rare)',
    zombies: ['Shamblers (60%)','Runners (25%)','Spitters (10%)','Mutant Seedlings (5%)'],
    hazards: ['Structural Collapse','Noise Traps','Unstable Roofs'], depth: ['Surface','Mid-Depth','Core'] },
  { id: 'metro',     name: 'Metropolis City',        tier: '2–3', color: '#e0624c', danger: 3,
    resources: ['Batteries','Copper','Industrial Steel','Canned Stores'], rmat: 'Tier 2-3',
    zombies: ['Runners (45%)','Spitters (25%)','Brutes (15%)','Mutant Seedlings (10%)','Nightmares (5%)'],
    hazards: ['Toxic Air','Acid Rain','High Noise','Collapsed Floors'], depth: ['Surface','Mid-Depth','Core'] },
  { id: 'perimeter', name: 'The Debriefed Perimeter', tier: '4–5', color: '#c894ff', danger: 5,
    resources: ['Anomalous Tissue','Corrupted Cores','Isotope Canisters','Exp. Alloys'], rmat: 'Tier 4-5',
    zombies: ['Burrowers','Radiation Walkers','Corrosive Spitters','Terraformers','Alpha Packs','Titan Mutants'],
    hazards: ['Radiation','Corrosion','Extreme Weather','Anomalous Distortions'], depth: ['Surface','Mid-Depth','Core'] },
];

// ─── RMAT TIERS ───────────────────────────────────────────────────────────────
ZI.RMAT_TIERS = [
  { tier: 0, name: 'Trace',        color: '#b4b4b4', rarity: 'Common',    desc: 'Barely detectable residue. Basic crafting only.' },
  { tier: 1, name: 'Scrap-Grade',  color: '#7cc47c', rarity: 'Uncommon', desc: 'Low-grade material found in suburban ruins.' },
  { tier: 2, name: 'Refined',      color: '#7aa8f0', rarity: 'Rare',     desc: 'Processed anomalous compounds. Mid-tier gear.' },
  { tier: 3, name: 'Concentrated', color: '#b48cf0', rarity: 'Epic',     desc: 'Dense RMAT clusters from metro depths.' },
  { tier: 4, name: 'Crystallized', color: '#f0bc50', rarity: 'Legendary',desc: 'Perimeter-exclusive. Unstable without containment.' },
  { tier: 5, name: 'Exotic Echo',  color: '#f070bc', rarity: 'Exotic',   desc: 'Reality-warping material. Apex crafting only.' },
];

// ─── CANONICAL TIER META (rarity legibility — Stockpile/Recycler spec) ───────
// One rarity ladder + name-color palette reused everywhere an item name shows.
// COLOR SOURCE OF TRUTH: ZI.RMAT_TIERS[rank].color (keeps RMAT tiers and loot
// rarity congruent). TIER_META.color is the documented fallback only.
ZI.TIER_META = {
  T0: { label: 'T0', color: '#9BA3A8', rank: 0 },
  T1: { label: 'T1', color: '#5CCB5F', rank: 1 },
  T2: { label: 'T2', color: '#4EA3E0', rank: 2 },
  T3: { label: 'T3', color: '#B44EE0', rank: 3 },
  T4: { label: 'T4', color: '#E0A93F', rank: 4 },
  T5: { label: 'T5', color: '#E8632A', rank: 5 },
};
// Canonical word-rarity → T-tier (single vocabulary; no competing schemes).
ZI.RARITY_TO_TIER = { common:'T0', uncommon:'T1', rare:'T2', epic:'T3', legendary:'T4', exotic:'T5' };
// Normalize any item's rarity/tier field to 'T0'..'T5'.
ZI.tierOf = function(item) {
  if (item == null) return 'T0';
  if (typeof item === 'string') {
    if (ZI.TIER_META[item]) return item;
    return ZI.RARITY_TO_TIER[item.toLowerCase()] || 'T0';
  }
  if (item.tierKey && ZI.TIER_META[item.tierKey]) return item.tierKey;
  if (item.rarity != null) {
    const r = String(item.rarity).toLowerCase();
    if (ZI.RARITY_TO_TIER[r]) return ZI.RARITY_TO_TIER[r];
  }
  if (typeof item.tier === 'number') {
    // Recycler items use a 1-indexed rarity tier (Common=1 → T0). RMAT-native
    // data is already 0-indexed. fromWandering flags the 1-indexed convention.
    const idx = item.fromWandering ? item.tier - 1 : item.tier;
    return 'T' + Math.max(0, Math.min(5, idx));
  }
  return 'T0';
};
// Name color — prefer the RMAT tier color, fall back to the TIER_META palette.
ZI.tierColor = function(item) {
  const meta = ZI.TIER_META[ZI.tierOf(item)] || ZI.TIER_META.T0;
  return (ZI.RMAT_TIERS[meta.rank] && ZI.RMAT_TIERS[meta.rank].color) || meta.color || ZI.TIER_META.T0.color;
};
ZI.tierMeta = function(item) { return ZI.TIER_META[ZI.tierOf(item)] || ZI.TIER_META.T0; };
ZI.tierRank = function(item) { return (ZI.TIER_META[ZI.tierOf(item)] || ZI.TIER_META.T0).rank; };
// Ordered tier tally (high→low) for the at-a-glance header. Returns [{key,label,color,count}].
ZI.tierTally = function(items) {
  const counts = {};
  (items || []).forEach(it => { const t = ZI.tierOf(it); counts[t] = (counts[t] || 0) + 1; });
  return ['T5','T4','T3','T2','T1','T0']
    .filter(t => counts[t])
    .map(t => ({ key: t, label: ZI.TIER_META[t].label, color: ZI.tierColor(t), count: counts[t] }));
};


ZI.RMAT_TYPES = ['Mechanical','Chemical','Electronic','Medical','Anomalous'];

// Drop rates by zombie family + tier
ZI.RMAT_DROP_RATES = {
  'Shambler':         { tier0: 8, tier1: 2, tier2: 0, tier3: 0, tier4: 0, tier5: 0 },
  'Runner':           { tier0: 5, tier1: 4, tier2: 1, tier3: 0, tier4: 0, tier5: 0 },
  'Spitter':          { tier0: 4, tier1: 5, tier2: 3, tier3: 0.5, tier4: 0, tier5: 0 },
  'Brute':            { tier0: 3, tier1: 4, tier2: 5, tier3: 2, tier4: 0.5, tier5: 0 },
  'Burrower':         { tier0: 0, tier1: 2, tier2: 4, tier3: 6, tier4: 2, tier5: 0.5 },
  'Radiation Walker': { tier0: 0, tier1: 0, tier2: 3, tier3: 7, tier4: 4, tier5: 1 },
  'Titan Mutant':     { tier0: 0, tier1: 0, tier2: 1, tier3: 5, tier4: 8, tier5: 3 },
  'Nightmare':        { tier0: 0, tier1: 0, tier2: 0, tier3: 4, tier4: 7, tier5: 5 },
};

// ─── CRAFTING RECIPES (v2 — 35 recipes across T0–T5) ─────────────────────────
// cost keyed by the six base materials. time in seconds. out = display outputs.
ZI.CRAFT_RECIPES = [
  // ── T0 — Trace (Common) ──
  { id:'scrap_pouch',  name:'Scrap Pouch',  icon:'👝', tier:0, out:[{n:'Trace RMAT',q:3}], cost:{wood:10,metal:5}, time:180, unlock:'Default', enemy:'Shambler', lore:'A bag made from a torn jacket and twist ties. Holds things. Barely.' },
  { id:'nail_board',   name:'Nail Board',   icon:'🪓', tier:0, out:[{n:'Trace RMAT',q:2}], cost:{wood:15,metal:8}, time:300, unlock:'Default', enemy:'Shambler', lore:'A plank. With nails in it. Classic.' },
  { id:'scrap_wire',   name:'Scrap Wire',   icon:'🔗', tier:0, out:[{n:'Trace RMAT',q:4}], cost:{metal:20}, time:480, unlock:'Default', enemy:'Crawler', lore:'Stripped from a chain-link fence. Still has rust. You call that character.' },
  { id:'tinder_bundle',name:'Tinder Bundle',icon:'🌿', tier:0, out:[{n:'Trace RMAT',q:2},{n:'Fuel',q:5}], cost:{wood:25}, time:360, unlock:'Default', enemy:'Crawler', lore:'Dried bark, dead leaves, and something unidentifiable. It burns, which is all that matters.' },
  { id:'crude_splint', name:'Crude Splint', icon:'🩼', tier:0, out:[{n:'Trace RMAT',q:2}], cost:{wood:10,cloth:8}, time:240, unlock:'Scavenge Camp (Rank 1)', enemy:'Crawler', lore:"Two sticks and a strip of curtain. A field doctor's last resort." },

  // ── T1 — Scrap-Grade (Uncommon) ──
  { id:'reinforced_pack',name:'Reinforced Pack',icon:'🎒', tier:1, out:[{n:'Mechanical RMAT',q:1}], cost:{metal:40}, time:2700, unlock:'Default', enemy:'Shambler', lore:'Stitched together from warehouse shelving and dumpster finds. Smells like regret.' },
  { id:'barricade_panel',name:'Barricade Panel',icon:'🪵', tier:1, out:[{n:'Structural RMAT',q:1}], cost:{wood:25,metal:20}, time:1800, unlock:'Default', enemy:'Crawler', lore:"Salvaged lumber nailed into a crude barrier. Holds until it doesn't." },
  { id:'cloth_wrap_kit', name:'Cloth Wrap Kit', icon:'🩹', tier:1, out:[{n:'Medical RMAT',q:2}], cost:{cloth:20,medical:5}, time:1200, unlock:'Default', enemy:'Crawler', lore:'Torn shirts and antiseptic wipes. Crude but effective in a pinch.' },
  { id:'fuel_drum',      name:'Fuel Drum',      icon:'🛢', tier:1, out:[{n:'Chem RMAT',q:1},{n:'Fuel',q:20}], cost:{wood:40,metal:20,fuel:15}, time:3000, unlock:'Scavenge Camp (Rank 1)', enemy:'Runner', lore:"A sealed metal drum re-welded at the seams. Leaks occasionally. You've accepted this." },
  { id:'signal_booster', name:'Signal Booster', icon:'📡', tier:1, out:[{n:'Electronic RMAT',q:1}], cost:{metal:15,electronics:20,wood:10}, time:3300, unlock:'Radio Tower (Rank 1)', enemy:'Runner', lore:'A coat hanger soldered to a transistor radio circuit board. Somehow it works.' },
  { id:'trauma_kit',     name:'Trauma Kit',     icon:'🧰', tier:1, out:[{n:'Medical RMAT',q:1},{n:'Bio RMAT',q:1}], cost:{cloth:30,medical:20,electronics:5}, time:2400, unlock:'Infirmary (Rank 1)', enemy:'Spitter', lore:'Stitched from surgical tubing and a tackle box. Contains more hope than medicine.' },
  { id:'wire_mesh_trap', name:'Wire Mesh Trap', icon:'🕸', tier:1, out:[{n:'Mechanical RMAT',q:1}], cost:{metal:35,wood:20}, time:2100, unlock:'Perimeter (Rank 1)', enemy:'Shambler', lore:'Bent rebar woven into a funnel shape. The zombie goes in. The zombie does not come out.' },

  // ── T2 — Refined (Rare) ──
  { id:'arc_igniter',    name:'Arc Igniter',    icon:'⚡', tier:2, out:[{n:'Energy RMAT',q:1}], cost:{metal:15,electronics:25,fuel:10}, time:4800, unlock:'Research Lab', enemy:'Runner', lore:'Salvaged capacitors rigged to a car battery. Produces sparks on demand — and occasionally on accident.' },
  { id:'fuel_converter', name:'Fuel Converter', icon:'🔥', tier:2, out:[{n:'Chem RMAT',q:1}], cost:{metal:20,electronics:10,fuel:40}, time:6300, unlock:'Outpost Rank 2', enemy:'Spitter', lore:'A re-purposed diesel siphon modified with copper tubing. Converts waste oil into RMAT-grade fuel cells.' },
  { id:'hollow_point_press',name:'Hollow Point Press',icon:'🔧', tier:2, out:[{n:'Mechanical RMAT',q:1},{n:'Ammo',q:10}], cost:{metal:40,wood:15,fuel:10}, time:5400, unlock:'Armory (Rank 1)', enemy:'Runner', lore:'A modified reloading press from a gun shop backroom. The dies are improvised. The brass is questionable.' },
  { id:'sterilization_unit',name:'Sterilization Unit',icon:'🧫', tier:2, out:[{n:'Medical RMAT',q:2}], cost:{metal:25,cloth:20,medical:30,fuel:10}, time:7200, unlock:'Infirmary (Rank 2)', enemy:'Spitter', lore:'A pressure cooker modified with UV tubes and copper coil. Kills 99.9% of known pathogens. Unknown ones are on their own.' },
  { id:'composite_plating',name:'Composite Plating',icon:'🛡', tier:2, out:[{n:'Structural RMAT',q:1}], cost:{metal:50,wood:30,cloth:20}, time:9000, unlock:'Perimeter (Rank 2)', enemy:'Brute', lore:"Layers of corrugated steel and hardboard pressed together in a vise. It's heavy. That's the point." },
  { id:'circuit_splice', name:'Circuit Splice', icon:'💡', tier:2, out:[{n:'Electronic RMAT',q:1}], cost:{electronics:35,metal:10,fuel:5}, time:4200, unlock:'Research Lab (Rank 2)', enemy:'Runner', lore:'Fourteen salvaged circuit boards, reprogrammed with a cracked laptop and a lot of patience.' },
  { id:'toxin_filter',   name:'Toxin Filter',   icon:'🧪', tier:2, out:[{n:'Chem RMAT',q:1},{n:'Bio RMAT',q:1}], cost:{cloth:20,medical:15,fuel:25}, time:8100, unlock:'Outpost (Rank 3)', enemy:'Spitter', lore:'Activated charcoal packed into a gas mask canister. Filters most things. Do not test with Spitter acid.' },

  // ── T3 — Concentrated (Epic) ──
  { id:'neural_tap',     name:'Neural Tap',     icon:'🧠', tier:3, out:[{n:'Bio RMAT',q:1}], cost:{metal:10,cloth:10,electronics:40,fuel:5,medical:30}, time:10800, unlock:'Metro Clearance', enemy:'Brute', lore:'A disturbing fusion of surgical wire and zombie nervous tissue. Not recommended for the squeamish.' },
  { id:'siege_frame',    name:'Siege Frame',    icon:'🛡', tier:3, out:[{n:'Heavy RMAT',q:1}], cost:{metal:80,wood:30,electronics:15,fuel:20}, time:14400, unlock:'Armory Rank 3', enemy:'Titan', lore:'Welded armor plating stripped from an APC. Slow to build. Worth every hour.' },
  { id:'resonance_cell', name:'Resonance Cell', icon:'🔋', tier:3, out:[{n:'Energy RMAT',q:1},{n:'Chem RMAT',q:1}], cost:{electronics:60,fuel:40,metal:20}, time:12600, unlock:'Generator (Rank 2)', enemy:'Titan', lore:'A repurposed lithium cell stack wired in series with a homemade voltage regulator. The hum it makes is not reassuring.' },
  { id:'bone_weave_vest',name:'Bone Weave Vest',icon:'🦴', tier:3, out:[{n:'Bio RMAT',q:1},{n:'Structural RMAT',q:1}], cost:{cloth:50,medical:30,wood:20,metal:15}, time:16200, unlock:'Biolab (Rank 1)', enemy:'Brute', lore:'Hardened bone fragments from cleared zones, woven into tactical fabric. Lighter than it looks. Heavier than it should be.' },
  { id:'emp_coil',       name:'EMP Coil',       icon:'📻', tier:3, out:[{n:'Electronic RMAT',q:1}], cost:{electronics:70,fuel:30,metal:20,cloth:10}, time:18000, unlock:'Comms Array (Rank 2)', enemy:'Titan', lore:'A coil the size of a trash can lid, wound by hand over three days. When it fires, the lights go out. All the lights.' },
  { id:'hazard_patch_kit',name:'Hazard Patch Kit',icon:'☢️', tier:3, out:[{n:'Medical RMAT',q:2},{n:'Chem RMAT',q:1}], cost:{cloth:40,medical:50,fuel:20,electronics:10}, time:13500, unlock:'Infirmary (Rank 3)', enemy:'Spitter', lore:'A full decontamination kit reverse-engineered from a hazmat response manual. The manual was missing pages. You improvised.' },

  // ── T4 — Crystallized (Legendary) ──
  { id:'crystalline_core',name:'Crystalline Core',icon:'💎', tier:4, out:[{n:'Apex RMAT',q:1}], cost:{metal:50,electronics:80,fuel:60,medical:20}, time:28800, unlock:'Perimeter Access', enemy:'Colossus', lore:'A pulsing shard of stabilized RMAT crystal. Handle with lead gloves. Do not smell.' },
  { id:'plasma_conduit', name:'Plasma Conduit', icon:'🌡', tier:4, out:[{n:'Energy RMAT',q:1},{n:'Apex RMAT',q:1}], cost:{electronics:100,fuel:80,metal:30}, time:36000, unlock:'Generator (Rank 3)', enemy:'Colossus', lore:'A length of reinforced copper piping fused with RMAT crystal shards. It glows faintly. Best not to touch it longer than necessary.' },
  { id:'necrotic_membrane',name:'Necrotic Membrane',icon:'🫀', tier:4, out:[{n:'Bio RMAT',q:1},{n:'Apex RMAT',q:1}], cost:{medical:60,cloth:40,electronics:50,fuel:20}, time:32400, unlock:'Biolab (Rank 2)', enemy:'Colossus', lore:'A membrane harvested from a Colossus-class zombie, preserved in a sealed culture medium. It is still technically alive. This is intentional.' },
  { id:'siege_engine_frame',name:'Siege Engine Frame',icon:'🏗', tier:4, out:[{n:'Heavy RMAT',q:2}], cost:{metal:120,wood:60,electronics:40,fuel:30}, time:43200, unlock:'Armory (Rank 4)', enemy:'Colossus', lore:'The frame of a mobile artillery piece, stripped down and re-welded into a stationary siege platform. The original purpose is irrelevant now.' },
  { id:'quantum_splice_board',name:'Quantum Splice Board',icon:'🖥', tier:4, out:[{n:'Electronic RMAT',q:1},{n:'Chem RMAT',q:1}], cost:{electronics:90,metal:50,fuel:30,cloth:20}, time:25200, unlock:'Research Lab (Rank 3)', enemy:'Colossus', lore:"A motherboard redesigned from first principles after finding a pre-outbreak engineering textbook. Three of the chips on it don't exist in any known catalog." },

  // ── T5 — Exotic Echo (Exotic) — manual confirm only ──
  { id:'echo_condenser', name:'Echo Condenser', icon:'🌀', tier:5, out:[{n:'Exotic RMAT',q:1}], cost:{electronics:150,fuel:100,medical:50}, time:86400, unlock:'Nightmare Clearance', enemy:'Nightmare', lore:"Theoretical. The schematics appeared in your shelter overnight. You don't remember finding them." },
  { id:'void_lattice',   name:'Void Lattice',   icon:'🕳', tier:5, out:[{n:'Exotic RMAT',q:2}], cost:{electronics:200,metal:120,fuel:80,cloth:60}, time:129600, unlock:'Echo Chamber (Rank 1)', enemy:'Nightmare', lore:"A lattice of RMAT crystal grown in a resonance field over days. The structure doesn't match any known crystallographic pattern. It matches something else." },
  { id:'fracture_engine',name:'Fracture Engine',icon:'💥', tier:5, out:[{n:'Exotic RMAT',q:1},{n:'Apex RMAT',q:1},{n:'Energy RMAT',q:1}], cost:{electronics:180,fuel:150,metal:90,medical:40}, time:172800, unlock:'Void Reactor (Rank 1)', enemy:'Nightmare', lore:"A device that shouldn't work. The math says it can't. The math is wrong. You've learned not to question the math." },
  { id:'revenant_core',  name:'Revenant Core',  icon:'💀', tier:5, out:[{n:'Exotic RMAT',q:1}], cost:{medical:100,cloth:80,electronics:100,fuel:50}, time:72000, unlock:'Biolab (Rank 3)', enemy:'Nightmare', lore:"Something between a heart and a battery. It pulses at irregular intervals. You've started timing your breathing to it. You're trying to stop." },
  { id:'signal_zero',    name:'Signal Zero',    icon:'📶', tier:5, out:[{n:'Exotic RMAT',q:1}], cost:{metal:200,wood:100,electronics:80,fuel:60}, time:57600, unlock:'Comms Array (Rank 3)', enemy:'Nightmare', lore:"A broadcast on a frequency that shouldn't carry signal. Something is listening. You've decided that's fine." },
];
// Existing recipes output RMAT currencies.
ZI.CRAFT_RECIPES.forEach(r => { if (!r.kind) r.kind = 'rmat'; });

// ─── GEAR & CONSUMABLE RECIPES (craft straight into the equip stash) ─────────
// Intermediate-component chains from the spec are collapsed to base-material
// costs for the prototype. grantsGear puts the finished item in the stash.
// NOTE: invoked later via ZI._appendGearRecipes() — AFTER GEAR_ITEMS exists.
ZI._gearRecipe = function(gearId, qty, tier, time, cost, unlock) {
  const g = ZI.getGearItem(gearId);
  return { id:'cr_'+gearId, name:g.name, icon:g.icon, tier,
    kind:(g.cat === 'consumable' ? 'consumable' : 'gear'),
    out:[{ n:g.name, q:qty }], cost, time, unlock: unlock || 'Default',
    grantsGear:gearId, grantsQty:qty, lore:g.desc };
};
ZI._appendGearRecipes = function(){ const R = ZI._gearRecipe; ZI.CRAFT_RECIPES.push(
  // ── Consumables ──
  R('rag_wrap',3,0,180,{cloth:10,wood:5}), R('lucky_charm',2,0,240,{wood:10,cloth:5}),
  R('scrap_adrenaline',2,0,240,{fuel:10,medical:5}), R('coal_paste',2,0,420,{wood:15,fuel:8}),
  R('field_bandage',2,1,1200,{cloth:20,medical:10}), R('focus_tabs',2,1,1500,{medical:20,electronics:10,fuel:5},'Research Lab'),
  R('salvagers_oil',2,1,1500,{fuel:25,metal:15,wood:10},'Scavenge Camp (Rank 1)'),
  R('trauma_dressing',2,2,3600,{cloth:30,medical:25,electronics:10},'Infirmary (Rank 1)'),
  R('overclock_patch',1,2,6300,{electronics:35,medical:20,fuel:15},'Research Lab (Rank 2)'),
  R('rmat_attractor',1,2,4800,{electronics:35,metal:20,fuel:15,medical:10},'Research Lab (Rank 1)'),
  R('thermal_gel',1,2,7200,{metal:25,fuel:20,cloth:20,electronics:15},'Armory (Rank 2)'),
  R('combat_stim_iv',1,3,10800,{medical:40,electronics:25,cloth:20,fuel:15},'Infirmary (Rank 2)'),
  R('apex_combat',1,3,12600,{medical:50,electronics:35,fuel:25,metal:20},'Armory (Rank 3)'),
  R('echo_siphon',1,3,14400,{electronics:50,fuel:35,metal:25},'Generator (Rank 2)'),
  R('nanite_serum',1,4,28800,{medical:60,electronics:40,fuel:30},'Biolab (Rank 2)'),
  R('crystalline_surge',1,4,36000,{medical:70,electronics:60,fuel:40},'Crystallization Chamber (Rank 1)'),
  R('crystalline_resonator',1,4,43200,{electronics:70,fuel:50,metal:40},'Crystallization Chamber (Rank 1)'),
  R('revenant_infusion',1,5,86400,{medical:80,cloth:60,electronics:50,fuel:30},'Revenant Program'),
  R('echo_state',1,5,108000,{medical:100,electronics:80,fuel:60},'Echo Chamber (Rank 1)'),
  R('singularity_seed',1,5,115200,{electronics:100,fuel:80,metal:60,medical:40},'Fracture Point'),
  // ── Melee ──
  R('iron_knuckles',1,1,1800,{metal:30}), R('pipe_pistol',1,1,2400,{metal:25,wood:10}),
  R('spike_board',1,1,2700,{wood:50,metal:30},'Armory (Rank 1)'),
  R('combat_knife',1,2,3600,{metal:40,cloth:15},'Armory (Rank 1)'),
  R('steel_baton',1,2,4500,{metal:45},'Armory (Rank 1)'),
  R('machete_blade',1,2,5400,{metal:50,cloth:20,wood:15},'Armory (Rank 2)'),
  R('combat_axe',1,3,9000,{metal:70,wood:20,cloth:10},'Armory (Rank 2)'),
  R('shock_baton',1,3,10800,{metal:40,electronics:50,fuel:20},'Research Lab (Rank 2)'),
  R('jet_sledge',1,4,21600,{metal:90,fuel:60,electronics:20},'Armory (Rank 3)'),
  // ── Ranged ──
  R('pipe_shotgun',1,1,3600,{metal:40,wood:20},'Armory (Rank 1)'),
  R('compound_bow',1,2,6300,{wood:40,metal:25,cloth:20},'Workshop (Rank 1)'),
  R('crossbow',1,2,7200,{wood:40,metal:40,cloth:10},'Armory (Rank 2)'),
  R('shock_pistol',1,3,9000,{metal:30,electronics:50},'Research Lab (Rank 1)'),
  R('arc_carbine',1,3,14400,{metal:40,electronics:60,fuel:20},'Research Lab (Rank 2)'),
  R('flamethrower',1,4,28800,{metal:80,fuel:60,electronics:30},'Workshop (Rank 3)'),
  R('void_pulse_rifle',1,5,72000,{metal:90,electronics:80,fuel:60,medical:20},'Fracture Point'),
  // ── Armor & Utility ──
  R('scrap_helmet',1,1,2100,{metal:30,cloth:10}), R('leather_gloves',1,1,1800,{cloth:20,fuel:8}),
  R('soft_armor_vest',1,2,4500,{cloth:40,metal:25},'Infirmary (Rank 1)'),
  R('riot_helmet',1,2,5400,{metal:40,cloth:20},'Armory (Rank 1)'),
  R('combat_boots',1,2,3600,{metal:20,cloth:15,fuel:10},'Armory (Rank 1)'),
  R('composite_helmet',1,3,10800,{metal:60,cloth:30,electronics:10},'Armory (Rank 2)'),
  R('molle_pack',1,3,7200,{cloth:50,metal:20},'Workshop (Rank 1)'),
  R('sensor_rig',1,3,7200,{electronics:40,metal:20},'Research Lab (Rank 1)'),
  R('perimeter_helmet',1,4,25200,{metal:80,electronics:40,medical:20},'Perimeter Access'),
  R('plate_carrier',1,4,25200,{metal:90,cloth:40,electronics:20},'Armory (Rank 3)'),
  // ── Evade items (§4) ──
  R('runners_cloak',1,2,7200,{cloth:10},'Scout Post (Rank 1)'), R('ghost_wrap',1,3,10800,{cloth:20,electronics:10},'Scout Post (Rank 2)'),
  R('adrenaline_shot',2,2,3600,{medical:8,fuel:4}), R('smoke_vial',2,3,5400,{fuel:15,electronics:8},'Research Lab (Rank 1)'),
  // ── Attribute-XP bonus items (§5, T3–T5 investment) ──
  R('tacticians_lens',1,4,28800,{electronics:12,cloth:4},'Research Lab (Rank 3)'),
  R('warlords_sigil',1,5,72000,{metal:40,electronics:30,medical:20},'Armory (Rank 4)'),
  R('combat_focus_draught',2,3,10800,{medical:6},'Infirmary (Rank 2)'),
  R('scholars_tonic',2,4,21600,{medical:10,electronics:10},'Research Lab (Rank 3)')
); };

// Per-enemy RMAT drop-rate curves for the crafting detail panel (T0…T5 %).
ZI.CRAFT_DROP_RATES = {
  Shambler:  [55, 25, 12, 5, 2, 1],
  Crawler:   [60, 22, 10, 5, 2, 1],
  Runner:    [40, 30, 20, 7, 2, 1],
  Spitter:   [40, 30, 20, 7, 2, 1],
  Brute:     [25, 25, 25, 15, 7, 3],
  Titan:     [25, 25, 25, 15, 7, 3],
  Colossus:  [10, 15, 20, 25, 20, 10],
  Nightmare: [3, 7, 10, 15, 30, 35],
};

// ─── GEAR LOADOUT SYSTEM (equippable items modify Wandering stats) ───────────
ZI.RARITY_COLORS = {
  common:'#b4b4b4', uncommon:'#7cc47c', rare:'#7aa8f0', epic:'#b48cf0', legendary:'#f0bc50', exotic:'#f070bc',
};
// 14 typed equip slots. accepts = item category that fits.
ZI.GEAR_SLOTS = [
  { id:'primary',     label:'Primary',    accepts:'weapon',     group:'weapon' },
  { id:'secondary',   label:'Sidearm',    accepts:'weapon',     group:'weapon' },
  { id:'melee',       label:'Melee',      accepts:'weapon',     group:'weapon' },
  { id:'helmet',      label:'Helmet',     accepts:'armor',      group:'armor' },
  { id:'mask',        label:'Mask',       accepts:'armor',      group:'armor' },
  { id:'vest',        label:'Body Armor', accepts:'armor',      group:'armor' },
  { id:'gloves',      label:'Gloves',     accepts:'armor',      group:'armor' },
  { id:'boots',       label:'Boots',      accepts:'armor',      group:'armor' },
  { id:'backpack',    label:'Pack',       accepts:'gear',       group:'gear' },
  { id:'rig',         label:'Rig',        accepts:'gear',       group:'gear' },
  { id:'consumable1', label:'Med',        accepts:'consumable', group:'consumable' },
  { id:'consumable2', label:'Stim',       accepts:'consumable', group:'consumable' },
  { id:'consumable3', label:'Food',       accepts:'consumable', group:'consumable' },
  { id:'throwable',   label:'Throw',      accepts:'consumable', group:'consumable' },
  { id:'back',        label:'Back',       accepts:'gear',       group:'gear' },
  { id:'trinket',     label:'Trinket',    accepts:'gear',       group:'gear' },
];
// Full gear roster. dmg drives weapon power; armor/carryW/speedDelta/lootBonus feed the resolver.
ZI.GEAR_ITEMS = [
  // Weapons
  { id:'rifle',      name:'AK-74 Carbine',     slot:'primary',   cat:'weapon', rarity:'rare',      icon:'🔫', dmg:42, armor:0, carryW:4, speedDelta:-5, lootBonus:0,  desc:'Reliable 5.45mm carbine. Loud but devastating.' },
  { id:'shotgun',    name:'Sawn-Off Shotgun',  slot:'primary',   cat:'weapon', rarity:'uncommon',  icon:'🔫', dmg:65, armor:0, carryW:3, speedDelta:-3, lootBonus:0,  desc:'Close range devastation. Useless past 20m.' },
  { id:'suppressed', name:'Suppressed SMG',    slot:'primary',   cat:'weapon', rarity:'epic',      icon:'🔫', dmg:28, armor:0, carryW:3, speedDelta:-2, lootBonus:0,  desc:'Quiet and fast. Urban specialist weapon.' },
  { id:'pistol',     name:'9mm Pistol',        slot:'secondary', cat:'weapon', rarity:'common',    icon:'🔫', dmg:22, armor:0, carryW:1, speedDelta:0,  lootBonus:0,  desc:'Standard sidearm. Backup when it counts.' },
  { id:'revolver',   name:'.357 Revolver',     slot:'secondary', cat:'weapon', rarity:'uncommon',  icon:'🔫', dmg:38, armor:0, carryW:2, speedDelta:0,  lootBonus:0,  desc:'Heavy hitting. Slow to reload.' },
  { id:'machete',    name:'Military Machete',  slot:'melee',     cat:'weapon', rarity:'uncommon',  icon:'🔪', dmg:30, armor:0, carryW:2, speedDelta:5,  lootBonus:0,  desc:'Silent. Efficient. Close range only.' },
  { id:'bat',        name:'Nail Bat',          slot:'melee',     cat:'weapon', rarity:'common',    icon:'🏏', dmg:18, armor:0, carryW:2, speedDelta:0,  lootBonus:0,  desc:'Improvised. Gets the job done.' },
  { id:'crowbar',    name:'Crowbar',           slot:'melee',     cat:'weapon', rarity:'common',    icon:'🪛', dmg:22, armor:0, carryW:3, speedDelta:-2, lootBonus:5,  desc:'Opens locked containers.' },
  // Armor
  { id:'helmet_t2',  name:'Ballistic Helmet T2',slot:'helmet',   cat:'armor',  rarity:'rare',      icon:'🪖', dmg:0, armor:12, carryW:2, speedDelta:-3, lootBonus:0,  desc:'Rated for pistol caliber.' },
  { id:'helmet_t1',  name:'Construction Hard Hat',slot:'helmet', cat:'armor',  rarity:'common',    icon:'⛑️', dmg:0, armor:4,  carryW:1, speedDelta:0,  lootBonus:0,  desc:'Better than nothing. Barely.' },
  { id:'gasmask',    name:'NBC Gas Mask',      slot:'mask',      cat:'armor',  rarity:'epic',      icon:'😷', dmg:0, armor:5,  carryW:2, speedDelta:-5, lootBonus:0,  desc:'Required for toxic zones. -15% visibility.' },
  { id:'balaclava',  name:'Tactical Balaclava',slot:'mask',      cat:'armor',  rarity:'uncommon',  icon:'🥷', dmg:0, armor:1,  carryW:0, speedDelta:0,  lootBonus:0,  desc:'Minor protection.' },
  { id:'vest_t3',    name:'SAPI Plate Carrier',slot:'vest',      cat:'armor',  rarity:'legendary', icon:'🦺', dmg:0, armor:35, carryW:5, speedDelta:-12,lootBonus:0,  desc:'Military-grade ceramic. Stops rifle rounds.' },
  { id:'vest_t1',    name:'Padded Jacket',     slot:'vest',      cat:'armor',  rarity:'common',    icon:'🧥', dmg:0, armor:8,  carryW:2, speedDelta:0,  lootBonus:0,  desc:'Civilian padding. Minimal ballistic value.' },
  { id:'gloves_t2',  name:'Combat Gloves',     slot:'gloves',    cat:'armor',  rarity:'uncommon',  icon:'🧤', dmg:0, armor:2,  carryW:0, speedDelta:0,  lootBonus:0,  desc:'+10% melee damage. Improved grip.' },
  { id:'boots_t2',   name:'Tactical Boots',    slot:'boots',     cat:'armor',  rarity:'rare',      icon:'🥾', dmg:0, armor:1,  carryW:0, speedDelta:8,  lootBonus:0,  desc:'-20% movement noise. Sprint bonus.' },
  { id:'boots_t1',   name:'Work Boots',        slot:'boots',     cat:'armor',  rarity:'common',    icon:'🥾', dmg:0, armor:0,  carryW:1, speedDelta:-2, lootBonus:0,  desc:'Sturdy. Nothing special.' },
  // Gear
  { id:'backpack_lg',name:'Military MOLLE Pack',slot:'backpack', cat:'gear',   rarity:'rare',      icon:'🎒', dmg:0, armor:0,  carryW:-8, speedDelta:-8, lootBonus:15, desc:'12 extra stash slots on run.' },
  { id:'backpack_sm',name:'Daypack',           slot:'backpack',  cat:'gear',   rarity:'common',    icon:'🎒', dmg:0, armor:0,  carryW:-3, speedDelta:-3, lootBonus:8,  desc:'6 extra stash slots. Lightweight.' },
  { id:'rig_t2',     name:'Tactical Chest Rig',slot:'rig',       cat:'gear',   rarity:'uncommon',  icon:'🎽', dmg:0, armor:0,  carryW:0,  speedDelta:0,  lootBonus:0,  desc:'+4 quick slots. +20% reload speed.' },
  // Consumables
  { id:'medkit',     name:'Field Medkit',      slot:'consumable1',cat:'consumable',rarity:'uncommon',icon:'🧰', dmg:0, armor:0, carryW:1, speedDelta:0, lootBonus:0, effect:{heal:60}, desc:'+60 HP over 8s.' },
  { id:'bandage',    name:'Bandage Roll',      slot:'consumable1',cat:'consumable',rarity:'common', icon:'🩹', dmg:0, armor:0, carryW:0, speedDelta:0, lootBonus:0, effect:{heal:25}, desc:'+25 HP over 4s. Stops bleeding.' },
  { id:'stimpack',   name:'Adrenaline Shot',   slot:'consumable2',cat:'consumable',rarity:'rare',   icon:'💉', dmg:0, armor:0, carryW:0, speedDelta:0, lootBonus:0, effect:{speedPct:30,durSec:45}, desc:'+30% speed for 45s.' },
  { id:'ration',     name:'MRE Ration',        slot:'consumable3',cat:'consumable',rarity:'common', icon:'🥫', dmg:0, armor:0, carryW:1, speedDelta:0, lootBonus:0, effect:{heal:12}, desc:'+40% stamina regen 120s.' },
  { id:'grenade',    name:'Frag Grenade',      slot:'throwable', cat:'consumable',rarity:'uncommon',icon:'💣', dmg:0, armor:0, carryW:1, speedDelta:0, lootBonus:0, effect:{killEnemy:true}, desc:'120 blast / 5m radius.' },
  { id:'flashbang',  name:'Flashbang',         slot:'throwable', cat:'consumable',rarity:'uncommon',icon:'🧨', dmg:0, armor:0, carryW:0, speedDelta:0, lootBonus:0, effect:{stun:true}, desc:'Stun 6s / 8m radius.' },
];
ZI.getGearItem = function(id) { return ZI.GEAR_ITEMS.find(g => g.id === id) || null; };

// ─── ITEM PURPOSE TAXONOMY ("every item earns its place") ────────────────────
// Derives a purpose[] array + marketValue for every gear item so nothing reads
// as random. Tags: equip / enhance / consume / trade / faction.
ZI.PURPOSE_META = {
  equip:   { icon:'⚔', label:'Equip',   color:'#e6c47e' },
  enhance: { icon:'▲', label:'Enhance', color:'#5CCB5F' },
  consume: { icon:'✚', label:'Consume', color:'#4EA3E0' },
  trade:   { icon:'⧉', label:'Trade',   color:'#E0A93F' },
  faction: { icon:'⚑', label:'Faction', color:'#B44EE0' },
};
// Item ids referenced by any faction contract's requires.equipped (built §4).
ZI._factionRequiredItems = function() {
  const set = new Set();
  (ZI.CONTRACTS || []).forEach(c => { (c.requires && c.requires.equipped || []).forEach(id => set.add(id)); });
  return set;
};
ZI.deriveItemPurpose = function(item) {
  const p = new Set();
  const hasStat = ['dmg','armor','speedDelta','lootBonus'].some(k => item[k]) || (item.stats && Object.keys(item.stats).length);
  if (item.slot && (hasStat || item.cat === 'weapon' || item.cat === 'armor' || item.cat === 'gear')) p.add('equip');
  if (item.xpBonus || (item.stats && item.stats.evade) || (item.effect && (item.effect.dmgPct || item.effect.speedPct || item.effect.lootPct || item.effect.armor || item.effect.evade || item.effect.xpBonus))) p.add('enhance');
  if (item.cat === 'consumable' && item.effect) p.add('consume');
  if (ZI._factionRequiredItems().has(item.id)) p.add('faction');
  // Tradeable: anything with a positive derived market value (most gear).
  return [...p];
};
// Market value anchor: tier-scaled base + stat contribution.
ZI.deriveMarketValue = function(item) {
  if (typeof item.marketValue === 'number') return item.marketValue;
  const rank = ZI.tierRank ? ZI.tierRank(item) : 0;
  let v = 10 + rank * 30;
  v += (item.dmg || 0) * 2 + (item.armor || 0) * 3 + Math.abs(item.lootBonus || 0) * 2;
  if (item.stats) v += (item.stats.evade || 0) * 4 + (item.stats.speed || 0) * 3;
  if (item.xpBonus) v += item.xpBonus.amount * 15;
  return Math.round(v);
};
// One-time enrichment pass: attach purpose[] + marketValue; warn on purposeless.
ZI.auditItems = function() {
  const flagged = [];
  (ZI.GEAR_ITEMS || []).forEach(it => {
    it.marketValue = ZI.deriveMarketValue(it);
    it.purpose = ZI.deriveItemPurpose(it);
    if (it.marketValue > 0 && !it.purpose.includes('trade')) it.purpose.push('trade'); // sellable sink
    if (!it.purpose.length) flagged.push(it.id);
  });
  if (flagged.length && typeof console !== 'undefined') console.warn('[ZI audit] purposeless items:', flagged);
  return flagged;
};

// ─── CRAFTABLE GEAR & CONSUMABLES (supply-chain outputs → equip stash) ───────
// Consumables carry a generic `effect` the Wandering run reads:
//   heal:n  speedPct:n  dmgPct:n  armorAdd:n  lootPct:n  durSec:n
//   killEnemy:true  stun:true  revive:n (HP restored when downed)
ZI.GEAR_ITEMS.push(
  // ===== CONSUMABLES — Healing =====
  { id:'rag_wrap',        name:'Rag Wrap',         slot:'consumable1', cat:'consumable', rarity:'common',    icon:'🩹', dmg:0,armor:0,carryW:0,speedDelta:0,lootBonus:0, effect:{heal:15}, desc:'Restores 15 HP instantly.' },
  { id:'field_bandage',   name:'Field Bandage',    slot:'consumable1', cat:'consumable', rarity:'common',    icon:'🩺', dmg:0,armor:0,carryW:0,speedDelta:0,lootBonus:0, effect:{heal:30}, desc:'Restores 30 HP over 10s.' },
  { id:'trauma_dressing', name:'Trauma Dressing',  slot:'consumable1', cat:'consumable', rarity:'uncommon',  icon:'🏥', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{heal:55}, desc:'Restores 55 HP; suppresses pain.' },
  { id:'combat_stim_iv',  name:'Combat Stimulant IV',slot:'consumable1',cat:'consumable', rarity:'rare',     icon:'🩻', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{heal:80,dmgPct:15,durSec:8}, desc:'+80 HP over 8s; +15% damage during.' },
  { id:'nanite_serum',    name:'Nanite Repair Serum',slot:'consumable1',cat:'consumable', rarity:'epic',     icon:'🔬', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{heal:100}, desc:'Restores 100 HP; clears debuffs.' },
  { id:'revenant_infusion',name:'Revenant Infusion',slot:'consumable1',cat:'consumable', rarity:'exotic',    icon:'💀', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{revive:50}, desc:'On downed: revive at 50 HP. One-shot.' },
  // ===== CONSUMABLES — Stat Boosts =====
  { id:'scrap_adrenaline',name:'Scrap Adrenaline', slot:'consumable2', cat:'consumable', rarity:'common',    icon:'⚡', dmg:0,armor:0,carryW:0,speedDelta:0,lootBonus:0, effect:{speedPct:20,durSec:30}, desc:'+20% move speed for 30s.' },
  { id:'focus_tabs',      name:'Focus Tabs',       slot:'consumable2', cat:'consumable', rarity:'uncommon',  icon:'🧠', dmg:0,armor:0,carryW:0,speedDelta:0,lootBonus:0, effect:{dmgPct:25,durSec:45}, desc:'+25% weapon damage for 45s.' },
  { id:'overclock_patch', name:'Overclock Patch',  slot:'consumable2', cat:'consumable', rarity:'rare',      icon:'🔌', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{speedPct:35,durSec:50}, desc:'+35% move speed for 50s.' },
  { id:'apex_combat',     name:'Apex Combat Formula',slot:'consumable2',cat:'consumable', rarity:'epic',     icon:'🧪', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{dmgPct:20,speedPct:20,armorAdd:20,durSec:75}, desc:'+20% dmg/speed, +20 armor for 75s.' },
  { id:'crystalline_surge',name:'Crystalline Surge Capsule',slot:'consumable2',cat:'consumable',rarity:'legendary',icon:'💎',dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{dmgPct:50,speedPct:50,armorAdd:50,lootPct:50,durSec:45}, desc:'+50% all stats for 45s.' },
  { id:'echo_state',      name:'Echo State Protocol',slot:'consumable2',cat:'consumable', rarity:'exotic',   icon:'🌀', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{dmgPct:100,speedPct:100,lootPct:100,durSec:30}, desc:'Doubles all stats + loot for 30s.' },
  // ===== CONSUMABLES — Evade burst (§4) & XP-boost draughts (§5) =====
  { id:'adrenaline_shot', name:'Adrenaline Shot+',  slot:'consumable2', cat:'consumable', rarity:'uncommon',  icon:'💨', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{evade:20,durSec:30}, desc:'+20 escape chance for 30s.' },
  { id:'smoke_vial',      name:'Smoke Vial',        slot:'consumable2', cat:'consumable', rarity:'rare',      icon:'💨', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{evade:35,durSec:45}, desc:'+35 escape chance for 45s.' },
  { id:'combat_focus_draught',name:'Combat Focus Draught',slot:'consumable2',cat:'consumable',rarity:'rare',  icon:'📿', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{xpBonus:{track:'combat',amount:8},durSec:120}, desc:'+8 Combat XP per action for 120s.' },
  { id:'scholars_tonic',  name:"Scholar's Tonic",   slot:'consumable2', cat:'consumable', rarity:'epic',      icon:'📿', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{xpBonus:{track:'discovery',amount:10},durSec:120}, desc:'+10 Discovery XP per action for 120s.' },
  // ===== CONSUMABLES — Loot Amplifiers =====
  { id:'lucky_charm',     name:'Lucky Charm',      slot:'consumable3', cat:'consumable', rarity:'common',    icon:'🍀', dmg:0,armor:0,carryW:0,speedDelta:0,lootBonus:0, effect:{lootPct:5,durSec:60}, desc:'+5% loot value for 60s.' },
  { id:'salvagers_oil',   name:"Salvager's Oil",   slot:'consumable3', cat:'consumable', rarity:'uncommon',  icon:'🛢️', dmg:0,armor:0,carryW:0,speedDelta:0,lootBonus:0, effect:{lootPct:20,durSec:90}, desc:'+20% loot value for 90s.' },
  { id:'rmat_attractor',  name:'RMAT Attractor',   slot:'consumable3', cat:'consumable', rarity:'rare',      icon:'🧲', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{lootPct:35,durSec:120}, desc:'+35% loot value for 120s.' },
  { id:'echo_siphon',     name:'Echo Siphon',      slot:'consumable3', cat:'consumable', rarity:'epic',      icon:'🌀', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{lootPct:60,durSec:180}, desc:'+60% loot value for 180s.' },
  { id:'crystalline_resonator',name:'Crystalline Resonator',slot:'consumable3',cat:'consumable',rarity:'legendary',icon:'💎',dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{lootPct:100,durSec:240}, desc:'Doubles loot value for 240s.' },
  // ===== CONSUMABLES — Hazard Counters (throwables / utility) =====
  { id:'coal_paste',      name:'Coal Paste',       slot:'throwable',   cat:'consumable', rarity:'common',    icon:'🖤', dmg:0,armor:0,carryW:0,speedDelta:0,lootBonus:0, effect:{armorAdd:8,durSec:60}, desc:'Cuts toxin damage — +8 armor 60s.' },
  { id:'thermal_gel',     name:'Thermal Gel',      slot:'throwable',   cat:'consumable', rarity:'rare',      icon:'🌡️', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{heal:10,armorAdd:12,durSec:90}, desc:'Fire resist — +12 armor, +10 HP 90s.' },
  { id:'singularity_seed',name:'Singularity Seed', slot:'throwable',   cat:'consumable', rarity:'exotic',    icon:'🌌', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{killEnemy:true,lootPct:200,durSec:60}, desc:'Loot singularity: clears target, +200% loot 60s.' },

  // ===== FINISHED GEAR — Melee Weapons =====
  { id:'iron_knuckles', name:'Iron Knuckles',   slot:'melee',   cat:'weapon', rarity:'common',   icon:'👊', dmg:20,armor:0,carryW:1,speedDelta:3,lootBonus:0, desc:'15% stagger chance on hit.' },
  { id:'spike_board',   name:'Spike Board',     slot:'melee',   cat:'weapon', rarity:'uncommon', icon:'🪓', dmg:28,armor:0,carryW:3,speedDelta:-2,lootBonus:0, desc:'Ignores 15% of enemy armor.' },
  { id:'combat_knife',  name:'Combat Knife',    slot:'melee',   cat:'weapon', rarity:'uncommon', icon:'🔪', dmg:30,armor:0,carryW:1,speedDelta:6,lootBonus:0, desc:'Silent kills — no noise on headshots.' },
  { id:'steel_baton',   name:'Steel Baton',     slot:'melee',   cat:'weapon', rarity:'uncommon', icon:'🪄', dmg:26,armor:0,carryW:2,speedDelta:4,lootBonus:0, desc:'25% stun chance on hit.' },
  { id:'machete_blade', name:'Machete Blade',   slot:'melee',   cat:'weapon', rarity:'rare',     icon:'⚔️', dmg:36,armor:0,carryW:2,speedDelta:8,lootBonus:0, desc:'Cleave — hits up to 2 enemies.' },
  { id:'combat_axe',    name:'Combat Axe',      slot:'melee',   cat:'weapon', rarity:'epic',     icon:'🪓', dmg:52,armor:0,carryW:4,speedDelta:-4,lootBonus:0, desc:'10% decapitate on unarmored.' },
  { id:'shock_baton',   name:'Shock Baton',     slot:'melee',   cat:'weapon', rarity:'epic',     icon:'⚡', dmg:30,armor:0,carryW:2,speedDelta:2,lootBonus:0, desc:'Every hit applies 3s paralysis.' },
  { id:'jet_sledge',    name:'Jet-Assisted Sledge',slot:'melee',cat:'weapon', rarity:'legendary',icon:'🔨', dmg:88,armor:0,carryW:6,speedDelta:-10,lootBonus:0, desc:'Shockwave knockback; smashes barricades.' },
  // ===== FINISHED GEAR — Ranged =====
  { id:'pipe_shotgun',  name:'Improvised Pipe Shotgun',slot:'primary',cat:'weapon',rarity:'common',icon:'🔫', dmg:55,armor:0,carryW:3,speedDelta:-3,lootBonus:0, desc:'Cone spread — hits up to 3.' },
  { id:'compound_bow',  name:'Compound Bow',    slot:'primary', cat:'weapon', rarity:'uncommon', icon:'🏹', dmg:40,armor:0,carryW:3,speedDelta:-2,lootBonus:0, desc:'Silent — zero noise.' },
  { id:'crossbow',      name:'Crossbow',        slot:'primary', cat:'weapon', rarity:'rare',     icon:'🏹', dmg:58,armor:0,carryW:4,speedDelta:-4,lootBonus:0, desc:'Bolt penetration — pierces 2.' },
  { id:'arc_carbine',   name:'Arc Carbine',     slot:'primary', cat:'weapon', rarity:'epic',     icon:'🔫', dmg:60,armor:0,carryW:4,speedDelta:-3,lootBonus:0, desc:'Arc burst — chains to adjacent.' },
  { id:'flamethrower',  name:'Flamethrower',    slot:'primary', cat:'weapon', rarity:'legendary',icon:'🔥', dmg:50,armor:0,carryW:8,speedDelta:-12,lootBonus:0, desc:'Sustained burn; spreads to nearby.' },
  { id:'void_pulse_rifle',name:'Void Pulse Rifle',slot:'primary',cat:'weapon',rarity:'exotic',   icon:'🌀', dmg:120,armor:0,carryW:5,speedDelta:-6,lootBonus:8, desc:'Phases through cover; kills boost loot.' },
  { id:'pipe_pistol',   name:'Pipe Pistol',     slot:'secondary',cat:'weapon',rarity:'common',   icon:'🔫', dmg:20,armor:0,carryW:1,speedDelta:0,lootBonus:0, desc:'Single-shot scrap sidearm.' },
  { id:'shock_pistol',  name:'Shock Pistol',    slot:'secondary',cat:'weapon',rarity:'rare',     icon:'⚡', dmg:18,armor:0,carryW:1,speedDelta:0,lootBonus:0, desc:'Chain shock — arcs to adjacent.' },
  // ===== FINISHED GEAR — Armor =====
  { id:'scrap_helmet',    name:'Scrap Helmet',    slot:'helmet', cat:'armor', rarity:'common',   icon:'⛑️', dmg:0,armor:6,carryW:1,speedDelta:-1,lootBonus:0, desc:'Iron-plate saucepan. It works.' },
  { id:'riot_helmet',     name:'Riot Helmet',     slot:'helmet', cat:'armor', rarity:'uncommon', icon:'⛑️', dmg:0,armor:12,carryW:2,speedDelta:-3,lootBonus:0, desc:'Face shield deflects bites.' },
  { id:'composite_helmet',name:'Composite Helmet',slot:'helmet', cat:'armor', rarity:'rare',     icon:'⛑️', dmg:0,armor:20,carryW:2,speedDelta:-4,lootBonus:0, desc:'Alloy/weave/padding. -15% head dmg.' },
  { id:'perimeter_helmet',name:'Perimeter Helmet',slot:'helmet', cat:'armor', rarity:'legendary',icon:'⛑️', dmg:0,armor:30,carryW:3,speedDelta:-6,lootBonus:0, desc:'Integrated HUD; NBC rated.' },
  { id:'soft_armor_vest', name:'Soft Armor Vest', slot:'vest',   cat:'armor', rarity:'uncommon', icon:'🦺', dmg:0,armor:20,carryW:3,speedDelta:-4,lootBonus:0, desc:'Ballistic weave panel vest.' },
  { id:'plate_carrier',   name:'Plate Carrier',   slot:'vest',   cat:'armor', rarity:'epic',     icon:'🦺', dmg:0,armor:38,carryW:5,speedDelta:-10,lootBonus:0, desc:'Ballistic steel insert carrier.' },
  { id:'leather_gloves',  name:'Leather Gloves',  slot:'gloves', cat:'armor', rarity:'common',   icon:'🧤', dmg:0,armor:3,carryW:0,speedDelta:0,lootBonus:0, desc:'Cured leather grip.' },
  { id:'combat_boots',    name:'Combat Boots',    slot:'boots',  cat:'armor', rarity:'uncommon', icon:'🥾', dmg:0,armor:2,carryW:1,speedDelta:6,lootBonus:0, desc:'Tempered tread — sprint bonus.' },
  // ===== FINISHED GEAR — Utility =====
  { id:'molle_pack',      name:'MOLLE Pack',      slot:'backpack',cat:'gear', rarity:'rare',     icon:'🎒', dmg:0,armor:0,carryW:-10,speedDelta:-8,lootBonus:18, desc:'Crafted MOLLE — big carry + loot.' },
  { id:'sensor_rig',      name:'Sensor Rig',      slot:'rig',     cat:'gear', rarity:'rare',     icon:'🎽', dmg:0,armor:2,carryW:1,speedDelta:0,lootBonus:8, desc:'PCB sensor rig — loot detection.' },
  // ===== EVADE-CHANCE ITEMS (§4) — flat evade points into escapeChance =====
  { id:'runners_cloak',   name:"Runner's Cloak",  slot:'back',    cat:'gear', rarity:'uncommon', icon:'🧣', dmg:0,armor:0,carryW:2,speedDelta:2,lootBonus:0, stats:{ evade:8, speed:2 }, durability:{ max:100, current:100, drainPerUse:1 }, desc:'Light cloak — slip contact more often.' },
  { id:'ghost_wrap',      name:'Ghost Wrap',      slot:'back',    cat:'gear', rarity:'rare',     icon:'🧣', dmg:0,armor:0,carryW:1,speedDelta:3,lootBonus:0, stats:{ evade:14, speed:3 }, durability:{ max:140, current:140, drainPerUse:1 }, desc:'Muffled wrap — a Runner might still lose you.' },
  // ===== ATTRIBUTE-XP BONUS ITEMS (§5) — flat +N XP per qualifying action =====
  { id:'tacticians_lens', name:"Tactician's Lens",slot:'trinket', cat:'gear', rarity:'epic',     icon:'🔬', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, xpBonus:{ track:'discovery', amount:5 }, durability:{ max:200, current:200, drainPerUse:1 }, desc:'+5 Discovery XP per qualifying action while worn.' },
  { id:'warlords_sigil',  name:"Warlord's Sigil", slot:'trinket', cat:'gear', rarity:'legendary',icon:'🎖', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, xpBonus:{ track:'combat', amount:6 }, durability:{ max:240, current:240, drainPerUse:1 }, desc:'+6 Combat XP per qualifying action while worn.' },
);
// Now that GEAR_ITEMS + getGearItem exist, append the gear/consumable recipes.
ZI._appendGearRecipes();
// Enrich every item with purpose[] + marketValue (audit runs after contracts load below).

ZI.LOADOUT_KEY = 'zi_loadout';
ZI.STASH_KEY = 'zi_stash';
ZI.STASH_VER = 2; // bump resets any previously seeded stash so gear is gated to crafted outputs
ZI.emptyLoadout = function() {
  const l = {}; ZI.GEAR_SLOTS.forEach(s => l[s.id] = null); return l;
};
ZI.getLoadout = function() {
  let l; try { l = JSON.parse(localStorage.getItem(ZI.LOADOUT_KEY) || 'null'); } catch (e) { l = null; }
  return Object.assign(ZI.emptyLoadout(), l || {});
};
ZI.saveLoadout = function(l) { try { localStorage.setItem(ZI.LOADOUT_KEY, JSON.stringify(l)); } catch (e) {} };
// Stash holds ONLY gear the player has crafted/earned (no pre-seeding).
ZI.getStash = function() {
  let raw; try { raw = JSON.parse(localStorage.getItem(ZI.STASH_KEY) || 'null'); } catch (e) { raw = null; }
  if (!raw || raw.v !== ZI.STASH_VER || !Array.isArray(raw.items)) {
    raw = { v: ZI.STASH_VER, items: [] };
    try { localStorage.setItem(ZI.STASH_KEY, JSON.stringify(raw)); } catch (e) {}
  }
  return raw.items;
};
ZI.saveStash = function(items) {
  try { localStorage.setItem(ZI.STASH_KEY, JSON.stringify({ v: ZI.STASH_VER, items: items || [] })); } catch (e) {}
};
// Grant a crafted gear item into the stash. Call when a gear-producing recipe completes.
ZI.grantGear = function(itemId, qty) {
  if (!ZI.getGearItem(itemId)) return false;
  const items = ZI.getStash();
  for (let i = 0; i < (qty || 1); i++) items.push(itemId);
  ZI.saveStash(items);
  return true;
};
// Equip an item from stash into its compatible slot. Returns {loadout, stash}.
ZI.equipGear = function(itemId, slotId) {
  const item = ZI.getGearItem(itemId); if (!item) return null;
  const slot = ZI.GEAR_SLOTS.find(s => s.id === slotId); if (!slot || slot.accepts !== item.cat) return null;
  const loadout = ZI.getLoadout();
  let stash = ZI.getStash().filter(id => id !== itemId);
  // §5 stack-cap: at most ONE equipped xpBonus gear per track. Displace any
  // currently-equipped gear that boosts the same track.
  if (item.xpBonus && item.xpBonus.track) {
    ZI.GEAR_SLOTS.forEach(s => {
      if (s.id === slotId) return;
      const other = loadout[s.id] && ZI.getGearItem(loadout[s.id]);
      if (other && other.xpBonus && other.xpBonus.track === item.xpBonus.track) {
        stash.push(loadout[s.id]); loadout[s.id] = null; // return the conflicting item to stash
      }
    });
  }
  if (loadout[slotId]) stash.push(loadout[slotId]); // displaced item returns to stash
  loadout[slotId] = itemId;
  ZI.saveLoadout(loadout); ZI.saveStash(stash);
  return { loadout, stash, displacedTrack: item.xpBonus && item.xpBonus.track };
};
ZI.unequipGear = function(slotId) {
  const loadout = ZI.getLoadout();
  if (!loadout[slotId]) return { loadout, stash: ZI.getStash() };
  const stash = ZI.getStash(); stash.push(loadout[slotId]); loadout[slotId] = null;
  ZI.saveLoadout(loadout); ZI.saveStash(stash);
  return { loadout, stash };
};
// Live survivor stats from the equipped loadout (spec §13).
ZI.resolveLoadoutStats = function(loadout) {
  loadout = loadout || ZI.getLoadout();
  let armor = 0, weight = 0, speedDelta = 0, lootBonus = 0, weaponDamage = 0, filled = 0, hasWeapon = false;
  ZI.GEAR_SLOTS.forEach(s => {
    const it = loadout[s.id] && ZI.getGearItem(loadout[s.id]); if (!it) return;
    if (ZI.itemHasDurability(it) && ZI.itemWorn(it)) return; // worn item gives no benefit until repaired
    filled++;
    armor += it.armor || 0; weight += it.carryW || 0; speedDelta += it.speedDelta || 0; lootBonus += it.lootBonus || 0;
    if (it.cat === 'weapon') { weaponDamage += it.dmg || 0; hasWeapon = true; }
  });
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  return {
    displayHP: clamp(80 + Math.floor(armor / 2), 0, 100),
    armorRating: clamp(armor, 0, 100),
    carryCapacity: clamp(100 - weight, 0, 100),
    speed: clamp(100 + speedDelta, 10, 100),
    lootBonusPct: lootBonus,   // legacy key (kept for back-compat)
    lootFind: lootBonus,       // flat-integer alias (spec §4)
    weaponDamage, filled, hasWeapon,
  };
};

// ─── FUNCTIONAL-ITEM SCHEMA HELPERS (tier/weight bands, durability, repair) ──
// Non-destructive layer over ZI.GEAR_ITEMS: derives tier, weight and durability
// from existing fields + tier bands, so no bulk item rewrite is required.
ZI.ITEM_BANDS = {
  T0: { weight:[1,2],  dur:[40,60]   },
  T1: { weight:[1,3],  dur:[60,90]   },
  T2: { weight:[2,5],  dur:[90,130]  },
  T3: { weight:[3,7],  dur:[130,180] },
  T4: { weight:[5,9],  dur:[180,240] },
  T5: { weight:[6,12], dur:[240,320] },
};
ZI.REPAIR_FACTOR = 0.5; // BalanceConfig dial: fully-worn repairs for ~half a fresh craft.
// Item's canonical tier key ('T0'..'T5') from its rarity/tier field.
ZI.itemTierKey = function(item) { return ZI.tierOf(item); };
// Flat weight (kg): authored `weight`, else |carryW|, else tier-band midpoint.
ZI.itemWeight = function(item) {
  if (!item) return 1;
  if (typeof item.weight === 'number') return item.weight;
  if (typeof item.carryW === 'number' && item.carryW > 0) return item.carryW;
  const b = ZI.ITEM_BANDS[ZI.itemTierKey(item)] || ZI.ITEM_BANDS.T0;
  return Math.round((b.weight[0] + b.weight[1]) / 2);
};
// Consumables never carry durability.
ZI.itemHasDurability = function(item) {
  if (!item) return false;
  const c = item.cat;
  return c === 'weapon' || c === 'armor' || c === 'gear' || c === 'melee' || c === 'ranged' || c === 'equipment';
};
// Max durability: authored durability.max, else tier-band midpoint.
ZI.itemDurabilityMax = function(item) {
  if (item && item.durability && item.durability.max) return item.durability.max;
  const b = ZI.ITEM_BANDS[ZI.itemTierKey(item)] || ZI.ITEM_BANDS.T0;
  return Math.round((b.dur[0] + b.dur[1]) / 2);
};
ZI.itemDrainPerUse = function(item) {
  return (item && item.durability && item.durability.drainPerUse) || 1;
};

// ─── ACTIVE BONUS AGGREGATION (evade + flat XP bonuses, §5) ──────────────────
// Timed consumable buffs live here so both the resolver and the XP bus can read
// them; equipped-gear bonuses are summed from the live loadout.
ZI.BUFF_KEY = 'zi_active_buffs';
ZI.getActiveBuffs = function() {
  let b; try { b = JSON.parse(localStorage.getItem(ZI.BUFF_KEY) || '[]'); } catch (e) { b = []; }
  const now = Date.now();
  const live = (b || []).filter(x => x.until > now);
  if (live.length !== (b || []).length) { try { localStorage.setItem(ZI.BUFF_KEY, JSON.stringify(live)); } catch (e) {} }
  return live;
};
ZI.addBuff = function(buff) { // { evade?, xpBonus:{track,amount}?, durationSec }
  let live = ZI.getActiveBuffs();
  // §5: xpBonus buffs don't stack with themselves — same track refreshes duration.
  if (buff.xpBonus && buff.xpBonus.track) {
    live = live.filter(b => !(b.xpBonus && b.xpBonus.track === buff.xpBonus.track));
  }
  live.push(Object.assign({}, buff, { until: Date.now() + (buff.durationSec || 30) * 1000 }));
  try { localStorage.setItem(ZI.BUFF_KEY, JSON.stringify(live)); } catch (e) {}
};
// Σ evade points from equipped gear + active consumable buffs (flat integer).
ZI.activeEvadeBonus = function() {
  let total = 0;
  const lo = ZI.getLoadout ? ZI.getLoadout() : {};
  (ZI.GEAR_SLOTS || []).forEach(s => {
    const it = lo[s.id] && ZI.getGearItem(lo[s.id]);
    if (it && !(ZI.itemHasDurability(it) && ZI.itemWorn && ZI.itemWorn(it)) && it.stats && it.stats.evade) total += it.stats.evade;
  });
  ZI.getActiveBuffs().forEach(b => { if (b.evade) total += b.evade; });
  return total;
};
// track → flat XP bonus from equipped gear + active buffs.
ZI.activeXpBonuses = function() {
  const out = {};
  const add = (track, amt) => { if (track && amt) out[track] = (out[track] || 0) + amt; };
  const lo = ZI.getLoadout ? ZI.getLoadout() : {};
  (ZI.GEAR_SLOTS || []).forEach(s => {
    const it = lo[s.id] && ZI.getGearItem(lo[s.id]);
    if (it && !(ZI.itemHasDurability(it) && ZI.itemWorn && ZI.itemWorn(it)) && it.xpBonus) add(it.xpBonus.track, it.xpBonus.amount);
  });
  ZI.getActiveBuffs().forEach(b => { if (b.xpBonus) add(b.xpBonus.track, b.xpBonus.amount); });
  return out;
};
// The craft recipe backing a gear item (for repair cost), if any.
ZI.recipeForItem = function(item) {
  if (!item || !ZI.CRAFT_RECIPES) return null;
  return ZI.CRAFT_RECIPES.find(r => r.grantsGear === item.id)
      || ZI.CRAFT_RECIPES.find(r => r.out && r.out.some(o => o.n === item.name)) || null;
};

// Per-item durability state (keyed by itemId — stash is non-instanced in the
// prototype; a slotless map is the safe, non-breaking granularity).
ZI.DURA_KEY = 'zi_durability';
ZI.getDuraMap = function() { try { return JSON.parse(localStorage.getItem(ZI.DURA_KEY) || '{}'); } catch (e) { return {}; } };
ZI.saveDuraMap = function(m) { try { localStorage.setItem(ZI.DURA_KEY, JSON.stringify(m)); } catch (e) {} };
ZI.itemDurability = function(item) {
  if (!ZI.itemHasDurability(item)) return null;
  const m = ZI.getDuraMap();
  const max = ZI.itemDurabilityMax(item);
  const cur = (item.id in m) ? m[item.id] : max;
  return { current: Math.max(0, Math.min(max, cur)), max };
};
ZI.applyWear = function(item, n) {
  if (!ZI.itemHasDurability(item)) return;
  const m = ZI.getDuraMap();
  const max = ZI.itemDurabilityMax(item);
  const cur = (item.id in m) ? m[item.id] : max;
  m[item.id] = Math.max(0, cur - (n || ZI.itemDrainPerUse(item)));
  ZI.saveDuraMap(m);
};
ZI.itemWorn = function(item) {
  const d = ZI.itemDurability(item);
  return d ? d.current <= 0 : false;
};
// Repair cost = fraction of the original craft cost × REPAIR_FACTOR × missingFrac.
ZI.repairCost = function(item) {
  const d = ZI.itemDurability(item);
  if (!d || d.current >= d.max) return { materials:{}, rmat:{}, missingFrac:0 };
  const missingFrac = (d.max - d.current) / d.max;
  const recipe = ZI.recipeForItem(item);
  const materials = {}, rmat = {};
  if (recipe && recipe.cost) {
    Object.entries(recipe.cost).forEach(([k, q]) => {
      materials[k] = Math.ceil(q * ZI.REPAIR_FACTOR * missingFrac);
    });
  } else {
    // Fallback: tier-scaled generic metal cost when no recipe backs the item.
    const rank = ZI.tierRank(item);
    materials.metal = Math.max(1, Math.ceil((5 + rank * 6) * ZI.REPAIR_FACTOR * missingFrac));
  }
  return { materials, rmat, missingFrac };
};
// Can the player afford a repair right now? (checks live ZI_MATERIALS + RMAT wallet)
ZI.canAffordRepair = function(item) {
  const cost = ZI.repairCost(item);
  const M = window.ZI_MATERIALS || {};
  for (const [k, q] of Object.entries(cost.materials)) { if (((M[k] && M[k].current) || 0) < q) return false; }
  const hold = ZI.getRmatHoldings();
  for (const [k, q] of Object.entries(cost.rmat)) { if ((hold[k] || 0) < q) return false; }
  return true;
};
// Deduct cost and refill to max. Returns true on success.
ZI.repairItem = function(item) {
  if (!ZI.itemHasDurability(item)) return false;
  if (!ZI.canAffordRepair(item)) return false;
  const cost = ZI.repairCost(item);
  const M = window.ZI_MATERIALS || {};
  Object.entries(cost.materials).forEach(([k, q]) => { if (M[k]) M[k].current = Math.max(0, M[k].current - q); });
  Object.entries(cost.rmat).forEach(([k, q]) => ZI.addRmat(k, -q));
  const m = ZI.getDuraMap();
  m[item.id] = ZI.itemDurabilityMax(item);
  ZI.saveDuraMap(m);
  if (ZI.emitAction) ZI.emitAction('repair', 1 + ZI.tierRank(item) * 0.5);
  return true;
};

// ─── ZOMBIE CODEX (full combat stat blocks) ──────────────────────────────────
// Detailed per-family combat stats surfaced in the expandable Codex screen.
// minHit/maxHit: damage range per strike · hitChance: base to-land %
// accuracy: targeting precision rating (affects hitChance vs evasive squads)
// critChance/critMult: crit odds & damage multiplier
// lifesteal: % of damage dealt recovered as HP
// damageReduction: flat % incoming mitigation
// evasionMelee/evasionRanged: % chance to dodge that attack type
ZI.ZOMBIE_CODEX = [
  { id:'shambler', name:'Shambler', tier:0, family:'Baseline', color:'#a2dca2', danger:1,
    desc:'Slow, witless world-filler. Lethal only in numbers. The first thing every survivor learns to kill.',
    biomes:['Mountain','Suburbia','Metro'], weakness:'Blunt · Fire · Noise traps',
    stats:{ minHit:2, maxHit:4, hitChance:55, accuracy:30, critChance:2, critMult:1.5, lifesteal:0, damageReduction:0, evasionMelee:2, evasionRanged:0 } },

  { id:'runner', name:'Runner', tier:1, family:'Ambusher', color:'#f08a52', danger:2,
    desc:'Sprints on sight, punishes noise. Packs form fast. The reason you never reload in the open.',
    biomes:['Suburbia','Metro'], weakness:'Obstacles · Stamina drain · Spike traps',
    stats:{ minHit:4, maxHit:7, hitChance:70, accuracy:55, critChance:8, critMult:1.6, lifesteal:0, damageReduction:0, evasionMelee:18, evasionRanged:25 } },

  { id:'spitter', name:'Spitter', tier:2, family:'Ranged Harasser', color:'#a0d040', danger:3,
    desc:'Lobs corrosive bile from range, forcing repositioning. Fragile up close — if you can reach it.',
    biomes:['Suburbia','Perimeter'], weakness:'Precision damage · Funneling corridors',
    stats:{ minHit:5, maxHit:9, hitChance:62, accuracy:75, critChance:6, critMult:1.7, lifesteal:0, damageReduction:5, evasionMelee:10, evasionRanged:8 } },

  { id:'brute', name:'Brute', tier:3, family:'Tank', color:'#e0624c', danger:4,
    desc:'Structure-breaker. Slow but relentless, shrugs off small-arms fire. Bring something heavy.',
    biomes:['Metro','Perimeter'], weakness:'High-damage melee · Explosives · Distraction',
    stats:{ minHit:9, maxHit:15, hitChance:65, accuracy:40, critChance:5, critMult:2.0, lifesteal:0, damageReduction:30, evasionMelee:0, evasionRanged:0 } },

  { id:'burrower', name:'Burrower', tier:4, family:'Subterranean', color:'#6a5848', danger:4,
    desc:'Tunnels beneath terrain and erupts at point-blank. Ambush predator of the deep zones.',
    biomes:['Perimeter'], weakness:'Vibration · Seismic traps · Hammer/Pike',
    stats:{ minHit:7, maxHit:12, hitChance:80, accuracy:60, critChance:15, critMult:1.8, lifesteal:8, damageReduction:10, evasionMelee:30, evasionRanged:12 } },

  { id:'radiationWalker', name:'Radiation Walker', tier:4, family:'Mutation Specialist', color:'#d0f040', danger:5,
    desc:'Glowing apex mutant that bleeds radiation. Drains the living to sustain itself.',
    biomes:['Perimeter'], weakness:'Hazard armor · Irradiated weapons · Energy fields',
    stats:{ minHit:8, maxHit:14, hitChance:68, accuracy:65, critChance:10, critMult:1.9, lifesteal:20, damageReduction:18, evasionMelee:12, evasionRanged:10 } },

  { id:'titan', name:'Titan Mutant', tier:5, family:'Apex / Boss', color:'#c894ff', danger:5,
    desc:'A wall of corrupted muscle and bone. RMAT-saturated, near-unstoppable. Run, or commit everything.',
    biomes:['Perimeter'], weakness:'Sustained focus fire · Apex-tier gear · Anomaly weapons',
    stats:{ minHit:17, maxHit:30, hitChance:60, accuracy:45, critChance:12, critMult:2.5, lifesteal:15, damageReduction:45, evasionMelee:0, evasionRanged:5 } },
];


// ─── ZOMBIE DISCOVERY (codex unlock persistence) ────────────────────────────
ZI.DISCOVERY_KEY = 'zi_discovered_zombies';
ZI.getDiscovered = function() {
  try { return new Set(JSON.parse(localStorage.getItem(ZI.DISCOVERY_KEY) || '[]')); }
  catch (e) { return new Set(); }
};
ZI.discoverZombie = function(id) {
  if (!id) return false;
  const set = ZI.getDiscovered();
  if (set.has(id)) return false;
  set.add(id);
  try { localStorage.setItem(ZI.DISCOVERY_KEY, JSON.stringify([...set])); } catch (e) {}
  if (ZI.emitAction) ZI.emitAction('discover', 0.5); // codex unlock feeds Discovery
  return true;
};
ZI.isDiscovered = function(id) { return ZI.getDiscovered().has(id); };

// ─── WANDERING XP → CHARACTER STATS ──────────────────────────────────────────
ZI.WANDER_XP_KEY = 'zi_character_xp';
ZI.getCharacterXp = function() {
  try { return parseInt(localStorage.getItem(ZI.WANDER_XP_KEY) || '0', 10) || 0; }
  catch (e) { return 0; }
};
ZI.applyWanderingXp = function(amount) {
  if (!amount || amount <= 0) return ZI.getCharacterXp();
  const total = ZI.getCharacterXp() + Math.round(amount);
  try { localStorage.setItem(ZI.WANDER_XP_KEY, String(total)); } catch (e) {}
  return total;
};
// Character level from accumulated XP (matches LevelSystem: (lvl*100)+(lvl^2*10)).
ZI.getCharacterLevel = function() {
  let xp = ZI.getCharacterXp(), lvl = 1, need = 0;
  while (lvl < 100) { need = (lvl * 100) + (lvl * lvl * 10); if (xp < need) break; xp -= need; lvl++; }
  return lvl;
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

// ─── STAT FORMULAS (Wandering ↔ Stats integration) ──────────────────────────
// Profession-style stats level 1–50. Persisted XP in localStorage so the
// Wandering tab writes progress the Stats tab reads.
ZI.STAT_XP_KEY = 'zi_stat_xp';
ZI.getStatXp = function() {
  try { return JSON.parse(localStorage.getItem(ZI.STAT_XP_KEY) || '{}'); }
  catch (e) { return {}; }
};
ZI.addStatXp = function(stat, amount) {
  if (!stat || amount <= 0) return;
  const x = ZI.getStatXp();
  x[stat] = (x[stat] || 0) + amount;
  try { localStorage.setItem(ZI.STAT_XP_KEY, JSON.stringify(x)); } catch (e) {}
};

// ─── CENTRAL XP BUS (Change 1) ───────────────────────────────────────────────
// Canonical profession tracks. Every gameplay action routes XP here so the
// Stats page reflects live progress from every screen.
ZI.PROFESSIONS = [
  { id:'combat',     name:'Combat',      icon:'⚔', desc:'Killing power in the field.' },
  { id:'firstAid',   name:'First Aid',   icon:'⛑', desc:'Heal strength and frequency.' },
  { id:'scavenging', name:'Scavenging',  icon:'🔍', desc:'Loot quality and filtering.' },
  { id:'stealth',    name:'Stealth',     icon:'🥷', desc:'Scouting reach and quiet pushes.' },
  { id:'athletics',  name:'Athletics',   icon:'🏃', desc:'Movement speed and stamina.' },
  { id:'endurance',  name:'Endurance',   icon:'🛡', desc:'Damage soaked and survived.' },
  { id:'foraging',   name:'Foraging',    icon:'🌿', desc:'Wild finds while wandering.' },
  { id:'smithing',   name:'Smithing',    icon:'🔨', desc:'Weapon & armor crafting.' },
  { id:'medical',    name:'Medical',     icon:'💊', desc:'Consumable & medkit crafting.' },
  { id:'mechanical', name:'Mechanical',  icon:'⚙', desc:'Gear, recycling & repair.' },
  { id:'discovery',  name:'Discovery',   icon:'🧭', desc:'New recipes, zones & codex.' },
  { id:'trading',    name:'Trading',     icon:'💰', desc:'Market deals and auctions.' },
  { id:'diplomat',   name:'Diplomat',    icon:'🤝', desc:'Faction standing and rep.' },
  { id:'logistics',  name:'Logistics',   icon:'📋', desc:'Schedules and camp tasks.' },
  { id:'engineering',name:'Engineering', icon:'🏗', desc:'Traversal grid and builds.' },
  { id:'command',    name:'Command',     icon:'⭐', desc:'Squad leadership and runs.' },
];
ZI.STAT_XP_VER = 2;
ZI.STAT_VER_KEY = 'zi_stat_xp_ver';
// Ensure every track exists (default 0) exactly once; non-destructive migration.
ZI.ensureStatTracks = function() {
  let ver = 0; try { ver = parseInt(localStorage.getItem(ZI.STAT_VER_KEY)) || 0; } catch (e) {}
  const x = ZI.getStatXp();
  let changed = false;
  ZI.PROFESSIONS.forEach(p => { if (!(p.id in x)) { x[p.id] = 0; changed = true; } });
  if (changed) { try { localStorage.setItem(ZI.STAT_XP_KEY, JSON.stringify(x)); } catch (e) {} }
  if (ver !== ZI.STAT_XP_VER) { try { localStorage.setItem(ZI.STAT_VER_KEY, String(ZI.STAT_XP_VER)); } catch (e) {} }
};

// Action → { profession: weight } map. emitAction(id, scale) splits a base
// amount across the listed tracks. Base XP per action lives in ACTION_XP.
ZI.ACTION_XP = {
  'kill':        { base:8,  split:{ combat:1 } }, // scavenging XP comes from looting the kill (no double count)
  'xp.firstAid': { base:1,  split:{ firstAid:1 } },
  'xp.stealth':  { base:1,  split:{ stealth:1 } },
  'xp.scavenging':{ base:1, split:{ scavenging:1 } },
  'loot':        { base:4,  split:{ scavenging:1 } },
  'forage':      { base:5,  split:{ foraging:1 } },
  'heal':        { base:12, split:{ firstAid:1 } },
  'revive':      { base:30, split:{ firstAid:0.6, endurance:0.4 } },
  'scout':       { base:5,  split:{ stealth:1 } },
  'sneak':       { base:8,  split:{ stealth:0.7, athletics:0.3 } },
  'endure':      { base:3,  split:{ endurance:1 } },
  'move':        { base:2,  split:{ athletics:1 } },
  'checkpoint':  { base:15, split:{ athletics:0.5, command:0.5 } },
  'craft.smith': { base:20, split:{ smithing:0.8, mechanical:0.2 } },
  'craft.medical':{base:20, split:{ medical:1 } },
  'craft.mech':  { base:20, split:{ mechanical:0.8, smithing:0.2 } },
  'craft.rmat':  { base:14, split:{ mechanical:0.5, discovery:0.5 } },
  'repair':      { base:10, split:{ mechanical:1 } },
  'recycle':     { base:4,  split:{ mechanical:1 } },
  'discover':    { base:25, split:{ discovery:1 } },
  'transaction': { base:10, split:{ trading:1 } },
  'faction':     { base:15, split:{ diplomat:1 } },
  'task':        { base:6,  split:{ logistics:1 } },
  'build':       { base:18, split:{ engineering:1 } },
  'run.complete':{ base:22, split:{ command:0.6, logistics:0.4 } },
  'wander.escape':{ base:10, split:{ stealth:0.6, athletics:0.25, scavenging:0.15 } },
  // Schedule idle jobs (per game-hour tick) + block completion.
  'schedule.tick':{ base:1,  split:{ logistics:1 } },       // scaled per-job in emitScheduleTick
  'schedule.complete':{ base:12, split:{ logistics:1 } },
  // Faction contracts.
  'contract.accept':{ base:6,  split:{ diplomat:1 } },
  'contract.complete':{ base:60, split:{ diplomat:1 } },
};
ZI._xpListeners = [];
ZI.onXp = function(fn) { ZI._xpListeners.push(fn); return () => { ZI._xpListeners = ZI._xpListeners.filter(f => f !== fn); }; };
// Award raw XP to one track (routes through addStatXp + notifies listeners).
ZI.awardXp = function(profId, amount, meta) {
  if (!profId || amount <= 0) return;
  ZI.addStatXp(profId, Math.round(amount));
  ZI._xpListeners.forEach(fn => { try { fn(profId, Math.round(amount), meta || {}); } catch (e) {} });
};
// Emit a named action; splits its base XP (× scale) across mapped professions.
// Flat XP-bonus items (§5) add +N per track when that track is already granted.
ZI.emitAction = function(actionId, scale, meta) {
  const def = ZI.ACTION_XP[actionId];
  if (!def) return;
  const total = def.base * (scale == null ? 1 : scale);
  const bonuses = ZI.activeXpBonuses ? ZI.activeXpBonuses() : {};
  Object.entries(def.split).forEach(([prof, w]) => {
    let amt = Math.round(total * w);
    if (amt > 0) { amt += (bonuses[prof] || 0); ZI.awardXp(prof, amt, Object.assign({ action: actionId }, meta || {})); }
  });
};
ZI.ensureStatTracks();

// ─── SCHEDULE JOBS (idle profession XP; job→profession 1:1) ──────────────────
ZI.SCHEDULE_JOBS = [
  { id:'guard',    label:'Guard / Watch',      profession:'combat',     attr:'valor',           requires:'watchtower', slots:1, xpPerHour:40, attrRatio:0.4 },
  { id:'workshop', label:'Workshop / Forge',   profession:'smithing',   attr:'aptitude',        requires:'forge',      slots:1, xpPerHour:40, attrRatio:0.4 },
  { id:'garage',   label:'Garage / Motor Pool',profession:'mechanical', attr:'aptitude',        requires:'garage',     slots:1, xpPerHour:40, attrRatio:0.4 },
  { id:'infirmary',label:'Infirmary / Clinic', profession:'firstAid',   attr:'vitality',        requires:'infirmary',  slots:1, xpPerHour:40, attrRatio:0.4 },
  { id:'farm',     label:'Farm Plot / Garden', profession:'foraging',   attr:'survival',        requires:'garden',     slots:1, xpPerHour:40, attrRatio:0.4 },
  { id:'scavenge', label:'Scavenge Detail',    profession:'scavenging', attr:'underhandedness', requires:null,         slots:1, xpPerHour:35, attrRatio:0.4 },
  { id:'recon',    label:'Recon / Scout Post', profession:'stealth',    attr:'insight',         requires:'scoutpost',  slots:1, xpPerHour:40, attrRatio:0.4 },
  { id:'radio',    label:'Trade / Radio Post', profession:'diplomat',   attr:'insight',         requires:'radiopost',  slots:1, xpPerHour:40, attrRatio:0.4 },
];
ZI.getJob = function(id) { return ZI.SCHEDULE_JOBS.find(j => j.id === id) || null; };
ZI.SCHEDULE_KEY = 'zi_schedule';
ZI.SCHEDULE_VER = 1;
ZI.SCHEDULE_OFFLINE_CAP_H = 24; // idle-pacing cap on offline accrual (§3 24h daily loop)
ZI.getSchedule = function() {
  let s; try { s = JSON.parse(localStorage.getItem(ZI.SCHEDULE_KEY) || 'null'); } catch (e) { s = null; }
  if (!s || s.v !== ZI.SCHEDULE_VER) s = { v: ZI.SCHEDULE_VER, assignments: [] };
  return s;
};
ZI.saveSchedule = function(s) { try { localStorage.setItem(ZI.SCHEDULE_KEY, JSON.stringify(s)); } catch (e) {} };
ZI.assignJob = function(survivorId, jobId) {
  const s = ZI.getSchedule();
  s.assignments = s.assignments.filter(a => a.survivorId !== survivorId); // one job per survivor
  s.assignments.push({ survivorId, jobId, since: Date.now(), lastTick: Date.now() });
  ZI.saveSchedule(s);
};
ZI.unassignJob = function(survivorId) {
  const s = ZI.getSchedule();
  s.assignments = s.assignments.filter(a => a.survivorId !== survivorId);
  ZI.saveSchedule(s);
};
// Award a job's idle XP for `hours` (profession full, attr × ratio) via the bus.
ZI.emitScheduleTick = function(jobId, hours) {
  const job = ZI.getJob(jobId); if (!job || hours <= 0) return;
  ZI.awardXp(job.profession, job.xpPerHour * hours, { action:'schedule.tick', jobId });
  if (job.attr) ZI.awardXp(job.attr, job.xpPerHour * hours * (job.attrRatio || 0.4), { action:'schedule.tick', jobId });
};
// Offline catch-up: settle each assignment's elapsed real-time (capped). ~1 real min = 1 game hour.
ZI.settleSchedule = function() {
  const s = ZI.getSchedule(); const now = Date.now(); let any = false;
  s.assignments.forEach(a => {
    const elapsedH = Math.min(ZI.SCHEDULE_OFFLINE_CAP_H, (now - (a.lastTick || a.since)) / 60000);
    if (elapsedH >= 0.02) { ZI.emitScheduleTick(a.jobId, elapsedH); a.lastTick = now; any = true; }
  });
  if (any) ZI.saveSchedule(s);
  return s.assignments.length;
};

// ─── FACTION CONTRACTS (Diplomat active loop) ────────────────────────────────
ZI.CONTRACTS = [
  { id:'c_iron_delivery', faction:'ironmarch', tier:'T2', type:'delivery', title:'Steel for the Forge',
    objective:{ metal:40 }, reward:{ diplomatXp:60, rep:15, materials:{ fuel:10 }, rmat:{ T2:2 } }, requires:{ diplomatLevel:2, rep:0 } },
  { id:'c_iron_clearance', faction:'ironmarch', tier:'T3', type:'clearance', title:'Thin the Horde',
    objective:{ kills:10, enemy:'Runner' }, reward:{ diplomatXp:90, rep:25, rmat:{ T3:1 } }, requires:{ diplomatLevel:4 } },
  { id:'c_conc_scavenge', faction:'concordance', tier:'T2', type:'scavenge', title:'Recover the Cache',
    objective:{ item:'Old Radio' }, reward:{ diplomatXp:70, rep:20, materials:{ electronics:15 } }, requires:{ diplomatLevel:3, equipped:['gasmask'] } },
  { id:'c_conc_escort', faction:'concordance', tier:'T3', type:'escort', title:'Safe Passage',
    objective:{ escort:1 }, reward:{ diplomatXp:100, rep:30, gear:'medkit' }, requires:{ diplomatLevel:5, equipped:['vest_t3'] } },
  { id:'c_free_bounty', faction:'freeholders', tier:'T4', type:'bounty', title:'Cull the Titan',
    objective:{ boss:'Titan Mutant' }, reward:{ diplomatXp:150, rep:40, rmat:{ T4:1 } }, requires:{ diplomatLevel:7 } },
];
ZI.getContract = function(id) { return ZI.CONTRACTS.find(c => c.id === id) || null; };
ZI.CONTRACT_KEY = 'zi_contracts';
ZI.CONTRACT_VER = 1;
ZI.getContractSave = function() {
  let s; try { s = JSON.parse(localStorage.getItem(ZI.CONTRACT_KEY) || 'null'); } catch (e) { s = null; }
  if (!s || s.v !== ZI.CONTRACT_VER) s = { v: ZI.CONTRACT_VER, active: [], repByFaction: {}, completedCount: 0 };
  return s;
};
ZI.saveContractSave = function(s) { try { localStorage.setItem(ZI.CONTRACT_KEY, JSON.stringify(s)); } catch (e) {} };
ZI.contractState = function(id) {
  const s = ZI.getContractSave();
  const a = s.active.find(x => x.id === id);
  return a ? a.state : 'OFFERED';
};
ZI.factionRep = function(faction) { return (ZI.getContractSave().repByFaction[faction] || 0); };
ZI.diplomatLevel = function() { return ZI.statLevel ? ZI.statLevel('diplomat') : 1; };
ZI.contractRequirementsMet = function(c) {
  const r = c.requires || {};
  if (r.diplomatLevel && ZI.diplomatLevel() < r.diplomatLevel) return false;
  if (r.rep && ZI.factionRep(c.faction) < r.rep) return false;
  return true;
};
// §4 — equip-gate check. Returns { ok, missing:[itemName] } for the current loadout.
ZI.contractEquipCheck = function(c) {
  const req = (c.requires && c.requires.equipped) || [];
  if (!req.length) return { ok:true, missing:[] };
  const lo = ZI.getLoadout ? ZI.getLoadout() : {};
  const equipped = new Set(Object.values(lo).filter(Boolean));
  const equippedTags = new Set();
  equipped.forEach(id => { const it = ZI.getGearItem(id); if (it && it.tags) it.tags.forEach(t => equippedTags.add(t)); });
  const missing = req.filter(need => !equipped.has(need) && !equippedTags.has(need))
    .map(need => { const it = ZI.getGearItem(need); return it ? it.name : need; });
  return { ok: missing.length === 0, missing };
};
// §4 — human-readable reason a contract can't be accepted yet (or null if ok).
ZI.contractBlockReason = function(c) {
  const r = c.requires || {};
  if (r.diplomatLevel && ZI.diplomatLevel() < r.diplomatLevel) return `Requires Diplomat Lv ${r.diplomatLevel}`;
  if (r.rep && ZI.factionRep(c.faction) < r.rep) return `Requires ${r.rep} reputation with this faction`;
  const eq = ZI.contractEquipCheck(c);
  if (!eq.ok) return `Requires equipped: ${eq.missing.join(', ')}`;
  return null;
};
ZI.acceptContract = function(id) {
  const c = ZI.getContract(id); if (!c) return { ok:false, reason:'Unknown contract' };
  const s = ZI.getContractSave();
  if (s.active.find(x => x.id === id)) return { ok:false, reason:'Already accepted' };
  const blocked = ZI.contractBlockReason(c);
  if (blocked) return { ok:false, reason: blocked };
  s.active.push({ id, state:'ACTIVE', progress:0, acceptedAt: Date.now() });
  ZI.saveContractSave(s);
  ZI.emitAction('contract.accept', 1, { faction: c.faction });
  return { ok:true };
};
ZI.progressContract = function(id, amount) {
  const s = ZI.getContractSave(); const a = s.active.find(x => x.id === id);
  if (!a || a.state !== 'ACTIVE') return;
  a.progress = (a.progress || 0) + (amount || 1);
  ZI.saveContractSave(s);
};
ZI.completeContract = function(id) {
  const c = ZI.getContract(id); if (!c) return false;
  const s = ZI.getContractSave(); const a = s.active.find(x => x.id === id);
  if (!a || a.state === 'COMPLETE') return false;
  a.state = 'COMPLETE';
  s.completedCount = (s.completedCount || 0) + 1;
  // Grant material/rmat/gear rewards through existing sinks.
  if (c.reward.materials && window.ZI_MATERIALS) Object.entries(c.reward.materials).forEach(([k, q]) => { const M = window.ZI_MATERIALS[k]; if (M) M.current = Math.min(M.max, M.current + q); });
  if (c.reward.rmat) Object.entries(c.reward.rmat).forEach(([k, q]) => ZI.addRmat(k, q));
  if (c.reward.gear && ZI.grantGear) ZI.grantGear(c.reward.gear, 1);
  ZI.saveContractSave(s);
  if (c.reward.rep && ZI.repApply) ZI.repApply(c.faction, c.reward.rep); // capped, clamped single rep path
  const tierScale = 1 + (ZI.TIER_META[c.tier] ? ZI.TIER_META[c.tier].rank : 1) * 0.3;
  ZI.emitAction('contract.complete', tierScale, { faction: c.faction });
  return true;
};
ZI.settleSchedule(); // catch up idle jobs on load
ZI.auditItems();     // enrich items with purpose[] + marketValue (contracts now defined)

// ─── CAMP INFRASTRUCTURE (Camp Leader overview) ──────────────────────────────
// Craftable structures, gated by Camp Leader level, with per-level build bundles.
// Unlock cadence follows the prime-number convention used elsewhere.
ZI.CAMP_STRUCTURES = [
  { id:'bunks', name:'Bunks', sprite:'bunks', job:null, requires:{ campLeaderLevel:1, structures:[] }, maxLevel:5, footprint:{w:2,h:1},
    effectPerLevel:{ regenRate:1 }, desc:'Rest & recovery — health/stamina regen for off-shift survivors.',
    build:[ {materials:{wood:20,cloth:10}, time:120}, {materials:{wood:40,cloth:20,metal:10}, time:300}, {materials:{wood:70,cloth:35,metal:25}, time:900}, {materials:{wood:110,cloth:60,metal:45}, rmat:{T1:2}, time:2100}, {materials:{wood:160,cloth:90,metal:70}, rmat:{T2:2}, time:4200} ] },
  { id:'farm', name:'Farm', sprite:'farm', job:'farm', requires:{ campLeaderLevel:2, structures:[] }, maxLevel:5, footprint:{w:2,h:2},
    effectPerLevel:{ jobXpRate:10, foodOutput:5 }, desc:'Grows crops → food; feeds the Kitchen.',
    build:[ {materials:{wood:30,cloth:5}, time:180}, {materials:{wood:55,cloth:15,metal:10}, time:600}, {materials:{wood:90,metal:25,fuel:10}, rmat:{T1:2}, time:1500}, {materials:{wood:140,metal:45,fuel:20}, rmat:{T2:2}, time:3600}, {materials:{wood:200,metal:70,fuel:35}, rmat:{T2:4,T3:1}, time:7200} ] },
  { id:'recycler', name:'Recycler', sprite:'recycler', job:null, requires:{ campLeaderLevel:5, structures:[] }, maxLevel:5, footprint:{w:2,h:2},
    effectPerLevel:{ opSpeed:0.2 }, desc:'Breaks items → materials. Upgrades raise operator speed.',
    build:[ {materials:{metal:40,electronics:10}, time:300}, {materials:{metal:75,electronics:25,fuel:10}, rmat:{T1:2}, time:900}, {materials:{metal:120,electronics:45,fuel:20}, rmat:{T2:2}, components:{wiring:6}, time:2400}, {materials:{metal:180,electronics:70,fuel:35}, rmat:{T3:2}, components:{wiring:14}, time:5400}, {materials:{metal:250,electronics:100,fuel:50}, rmat:{T3:4,T4:1}, components:{wiring:24}, time:10800} ] },
  { id:'workshop', name:'Workshop', sprite:'workshop', job:null, requires:{ campLeaderLevel:3, structures:[] }, maxLevel:5, footprint:{w:2,h:2},
    effectPerLevel:{ craftSpeed:0.1 }, desc:'General crafting bench — enables and speeds crafting.',
    build:[ {materials:{wood:30,metal:30}, time:300}, {materials:{wood:50,metal:60,electronics:15}, rmat:{T1:2}, time:900}, {materials:{wood:80,metal:100,electronics:30}, rmat:{T2:2}, components:{planks:8}, time:2400}, {materials:{metal:150,electronics:50,fuel:20}, rmat:{T3:2}, components:{planks:16}, time:5400}, {materials:{metal:220,electronics:80,fuel:35}, rmat:{T3:4,T4:1}, components:{planks:28}, time:10800} ] },
  { id:'watchtower', name:'Watchtower', sprite:'watchtower', job:'guard', requires:{ campLeaderLevel:5, structures:[] }, maxLevel:5, footprint:{w:1,h:2},
    effectPerLevel:{ jobXpRate:15, defenseRating:10 }, desc:'Camp defense rating + guard duty; ties to horde defense.',
    build:[ {materials:{wood:60,metal:40}, time:600}, {materials:{wood:100,metal:80,cloth:20}, rmat:{T1:2}, time:1500}, {materials:{metal:140,wood:70,electronics:20}, rmat:{T2:2}, components:{planks:10}, time:3600}, {materials:{metal:220,electronics:45,fuel:20}, rmat:{T3:2}, components:{planks:20}, time:7200}, {materials:{metal:320,electronics:80,fuel:40}, rmat:{T3:5,T4:1}, components:{planks:34}, time:14400} ] },
  { id:'forge', name:'Forge', sprite:'forge', job:'workshop', requires:{ campLeaderLevel:7, structures:[] }, maxLevel:5, footprint:{w:2,h:2},
    effectPerLevel:{ jobXpRate:15, jobSlots:1 }, desc:'Craft & repair weapons and armor.',
    build:[ {materials:{metal:40,fuel:10}, rmat:{T2:2}, components:{forged_iron:4}, time:1200}, {materials:{metal:80,fuel:25}, rmat:{T3:2}, components:{forged_iron:10}, time:2700}, {materials:{metal:140,wood:40}, rmat:{T3:4,T4:1}, components:{forged_iron:20}, time:5400}, {materials:{metal:220,fuel:50}, rmat:{T4:2}, components:{forged_iron:34}, time:10800}, {materials:{metal:320,fuel:80}, rmat:{T4:4,T5:1}, components:{forged_iron:52}, time:21600} ] },
  { id:'infirmary', name:'Infirmary', sprite:'infirmary', job:'infirmary', requires:{ campLeaderLevel:7, structures:[] }, maxLevel:5, footprint:{w:2,h:2},
    effectPerLevel:{ jobXpRate:15, healRate:5 }, desc:'Heal survivors; craft medical consumables.',
    build:[ {materials:{cloth:40,medical:20}, rmat:{T1:2}, time:1200}, {materials:{cloth:70,medical:40,electronics:10}, rmat:{T2:2}, time:2700}, {materials:{cloth:110,medical:70,electronics:25}, rmat:{T3:2}, components:{wiring:8}, time:5400}, {materials:{cloth:160,medical:110,electronics:45}, rmat:{T3:4}, components:{wiring:18}, time:10800}, {materials:{cloth:220,medical:160,electronics:70}, rmat:{T4:3}, components:{wiring:30}, time:21600} ] },
  { id:'kitchen', name:'Kitchen', sprite:'kitchen', job:null, requires:{ campLeaderLevel:11, structures:['farm'] }, maxLevel:5, footprint:{w:2,h:1},
    effectPerLevel:{ mealBuff:5 }, desc:'Cooks crops into meal consumables (buffs). Requires Farm.',
    build:[ {materials:{metal:30,wood:30,fuel:15}, rmat:{T1:2}, time:900}, {materials:{metal:60,wood:50,fuel:30}, rmat:{T2:2}, time:2100}, {materials:{metal:100,fuel:50}, rmat:{T2:4}, components:{planks:10}, time:4800}, {materials:{metal:160,fuel:80}, rmat:{T3:3}, components:{planks:20}, time:9600}, {materials:{metal:230,fuel:120}, rmat:{T4:2}, components:{planks:32}, time:19200} ] },
  { id:'garage', name:'Garage', sprite:'garage', job:'garage', requires:{ campLeaderLevel:11, structures:[] }, maxLevel:5, footprint:{w:2,h:2},
    effectPerLevel:{ jobXpRate:15, vehicleRepair:10 }, desc:'Vehicle repair/refuel; enables Route vehicle nodes.',
    build:[ {materials:{metal:60,fuel:20}, rmat:{T2:2}, components:{wiring:6}, time:1500}, {materials:{metal:110,fuel:45,electronics:20}, rmat:{T2:4}, components:{wiring:14}, time:3600}, {materials:{metal:170,fuel:70,electronics:40}, rmat:{T3:3}, components:{wiring:24}, time:7200}, {materials:{metal:250,fuel:110,electronics:65}, rmat:{T4:2}, components:{wiring:38}, time:14400}, {materials:{metal:340,fuel:160,electronics:95}, rmat:{T4:4,T5:1}, components:{wiring:54}, time:28800} ] },
  { id:'scoutpost', name:'Scout Post', sprite:'scoutpost', job:'recon', requires:{ campLeaderLevel:13, structures:[] }, maxLevel:5, footprint:{w:1,h:1},
    effectPerLevel:{ jobXpRate:15, mapReveal:1 }, desc:'Reveals map/traversal info; recon duty.',
    build:[ {materials:{wood:40,electronics:20}, rmat:{T2:2}, time:1200}, {materials:{wood:70,electronics:40,metal:20}, rmat:{T3:2}, time:2700}, {materials:{electronics:70,metal:40}, rmat:{T3:4}, components:{wiring:10}, time:5400}, {materials:{electronics:110,metal:70}, rmat:{T4:2}, components:{wiring:20}, time:10800}, {materials:{electronics:160,metal:100}, rmat:{T4:4}, components:{wiring:32}, time:21600} ] },
  { id:'radiopost', name:'Radio Post', sprite:'radiopost', job:'radio', requires:{ campLeaderLevel:17, structures:[] }, maxLevel:5, footprint:{w:1,h:1},
    effectPerLevel:{ jobXpRate:15, contractSlots:1 }, desc:'Faction contract board; comms.',
    build:[ {materials:{electronics:40,metal:20}, rmat:{T2:2}, components:{wiring:6}, time:1500}, {materials:{electronics:80,metal:40}, rmat:{T3:2}, components:{wiring:14}, time:3600}, {materials:{electronics:130,metal:70}, rmat:{T3:4}, components:{wiring:24}, time:7200}, {materials:{electronics:190,metal:110}, rmat:{T4:3}, components:{wiring:38}, time:14400}, {materials:{electronics:260,metal:160}, rmat:{T4:5,T5:1}, components:{wiring:54}, time:28800} ] },
  { id:'barracks', name:'Barracks', sprite:'barracks', job:null, requires:{ campLeaderLevel:19, structures:[] }, maxLevel:5, footprint:{w:2,h:2},
    effectPerLevel:{ rosterCapacity:2, squadCapacity:1 }, desc:'Housing — raises roster capacity & squad size.',
    build:[ {materials:{wood:80,metal:50,cloth:30}, rmat:{T2:2}, components:{planks:8}, time:1800}, {materials:{wood:140,metal:90,cloth:50}, rmat:{T3:2}, components:{planks:18}, time:4200}, {materials:{wood:200,metal:140,cloth:80}, rmat:{T3:5}, components:{planks:30}, time:9000}, {materials:{metal:220,wood:280,cloth:120}, rmat:{T4:3}, components:{planks:46}, time:18000}, {materials:{metal:320,wood:380,cloth:170}, rmat:{T4:5,T5:1}, components:{planks:64}, time:36000} ] },
  { id:'walls', name:'Walls', sprite:'walls', job:null, requires:{ campLeaderLevel:5, structures:[] }, maxLevel:5, footprint:{w:2,h:1},
    effectPerLevel:{ wallHp:120 }, desc:'Fortification — the horde attacks walls first. Raises siege wall HP.',
    build:[ {materials:{wood:60,metal:40}, time:600}, {materials:{wood:120,metal:80,fuel:10}, rmat:{T1:2}, time:1800}, {materials:{metal:160,wood:90}, rmat:{T2:2}, components:{planks:12}, time:4200}, {materials:{metal:240,fuel:30}, rmat:{T3:2}, components:{planks:24}, time:9000}, {materials:{metal:340,fuel:60}, rmat:{T3:5,T4:1}, components:{planks:40}, time:18000} ] },
];
ZI.getStructure = function(id) { return ZI.CAMP_STRUCTURES.find(s => s.id === id) || null; };
ZI.CAMP_KEY = 'zi_camp';
ZI.CAMP_VER = 1;
ZI.getCampSave = function() {
  let s; try { s = JSON.parse(localStorage.getItem(ZI.CAMP_KEY) || 'null'); } catch (e) { s = null; }
  if (!s || s.v !== ZI.CAMP_VER) s = { v: ZI.CAMP_VER, built: {} };
  return s;
};
ZI.saveCampSave = function(s) { try { localStorage.setItem(ZI.CAMP_KEY, JSON.stringify(s)); } catch (e) {} };
ZI.structureLevel = function(id) { return ZI.getCampSave().built[id] || 0; };
// Camp Leader level — main character's survivor level (assumed 1–100 track).
ZI.CAMP_LEADER_KEY = 'zi_camp_leader_level';
ZI.getCampLeaderLevel = function() {
  let v; try { v = parseInt(localStorage.getItem(ZI.CAMP_LEADER_KEY)); } catch (e) {}
  return v > 0 ? v : 12; // sensible default so early structures are visible/testable
};
ZI.setCampLeaderLevel = function(n) { try { localStorage.setItem(ZI.CAMP_LEADER_KEY, String(n)); } catch (e) {} };
// State: 'built' | 'ready' (unlocked, unbuilt or upgradeable) | 'locked'.
ZI.structureState = function(id) {
  const st = ZI.getStructure(id); if (!st) return 'locked';
  const lvl = ZI.structureLevel(id);
  const gate = st.requires || {};
  const leaderOk = ZI.getCampLeaderLevel() >= (gate.campLeaderLevel || 1);
  const prereqOk = (gate.structures || []).every(pid => ZI.structureLevel(pid) > 0);
  if (!leaderOk || !prereqOk) return lvl > 0 ? 'built' : 'locked';
  return lvl > 0 ? 'built' : 'ready';
};
// Cost bundle for the NEXT level (or null if maxed).
ZI.structureNextCost = function(id) {
  const st = ZI.getStructure(id); if (!st) return null;
  const lvl = ZI.structureLevel(id);
  if (lvl >= st.maxLevel) return null;
  return st.build[lvl] || null;
};
ZI.canAffordStructure = function(id) {
  const cost = ZI.structureNextCost(id); if (!cost) return false;
  const M = window.ZI_MATERIALS || {};
  for (const [k, q] of Object.entries(cost.materials || {})) if (((M[k] && M[k].current) || 0) < q) return false;
  const hold = ZI.getRmatHoldings();
  for (const [k, q] of Object.entries(cost.rmat || {})) if ((hold[k] || 0) < q) return false;
  // components live in a light store (crafted-up supply layer)
  const comp = ZI.getComponents();
  for (const [k, q] of Object.entries(cost.components || {})) if ((comp[k] || 0) < q) return false;
  return true;
};
// Component supply store (intermediate crafted items feeding structures).
ZI.COMPONENT_KEY = 'zi_components';
ZI.getComponents = function() { try { return JSON.parse(localStorage.getItem(ZI.COMPONENT_KEY) || '{}'); } catch (e) { return {}; } };
ZI.addComponent = function(id, q) { const c = ZI.getComponents(); c[id] = (c[id] || 0) + q; try { localStorage.setItem(ZI.COMPONENT_KEY, JSON.stringify(c)); } catch (e) {} };
// Build or upgrade: deduct the bundle, raise level, return {ok} or {ok:false,reason}.
ZI.buildStructure = function(id) {
  const st = ZI.getStructure(id); if (!st) return { ok:false, reason:'Unknown structure' };
  if (ZI.structureState(id) === 'locked') return { ok:false, reason:`Requires Camp Leader Lv ${st.requires.campLeaderLevel}` };
  const cost = ZI.structureNextCost(id); if (!cost) return { ok:false, reason:'Max level' };
  if (!ZI.canAffordStructure(id)) return { ok:false, reason:'Insufficient resources' };
  const M = window.ZI_MATERIALS || {};
  Object.entries(cost.materials || {}).forEach(([k, q]) => { if (M[k]) M[k].current = Math.max(0, M[k].current - q); });
  Object.entries(cost.rmat || {}).forEach(([k, q]) => ZI.addRmat(k, -q));
  Object.entries(cost.components || {}).forEach(([k, q]) => ZI.addComponent(k, -q));
  const targetLevel = ZI.structureLevel(id) + 1;
  // Enqueue as a timed construction job (separate build lane). Level applies on completion.
  ZI.enqueueJob('build', id, cost.time || 60, { toLevel: targetLevel });
  return { ok:true, level: targetLevel, queued:true };
};
// Consumer helpers — structure levels feed other systems.
ZI.structureEffect = function(id, key) {
  const st = ZI.getStructure(id); const lvl = ZI.structureLevel(id);
  if (!st || !lvl || !st.effectPerLevel || st.effectPerLevel[key] == null) return 0;
  return st.effectPerLevel[key] * lvl;
};
ZI.recyclerOpSpeedBonus = function() { return ZI.structureEffect('recycler', 'opSpeed'); };
ZI.rosterCapacity = function() { return 4 + ZI.structureEffect('barracks', 'rosterCapacity'); };
ZI.campDefenseRating = function() { return ZI.structureEffect('watchtower', 'defenseRating'); };

// ─── CAMP LEADER (fixed player avatar) ───────────────────────────────────────
ZI.LEADER_KEY = 'zi_leader';
ZI.LEADER_VER = 1;
// Starter leader archetypes (subset of character types) with attribute leanings.
ZI.LEADER_ARCHETYPES = [
  { id:'vanguard',  name:'Vanguard',  lean:'Combat / Valor',        icon:'⚔', start:{ combat:120, endurance:80 } },
  { id:'forager',   name:'Forager',   lean:'Scavenging / Survival', icon:'🔍', start:{ scavenging:150, foraging:80 } },
  { id:'artisan',   name:'Artisan',   lean:'Smithing / Mechanical', icon:'🔨', start:{ smithing:120, mechanical:100 } },
  { id:'envoy',     name:'Envoy',     lean:'Diplomat / Command',    icon:'🤝', start:{ diplomat:120, command:80 } },
];
ZI.getLeader = function() {
  let l; try { l = JSON.parse(localStorage.getItem(ZI.LEADER_KEY) || 'null'); } catch (e) { l = null; }
  if (!l || l.v !== ZI.LEADER_VER) l = { v: ZI.LEADER_VER, id:'leader_main', archetype:null, name:'Commander', deployed:false, recovery:null };
  return l;
};
ZI.saveLeader = function(l) { try { localStorage.setItem(ZI.LEADER_KEY, JSON.stringify(l)); } catch (e) {} };
ZI.campLeaderId = 'leader_main';
// One-time start selection: seeds starting XP leanings.
ZI.chooseLeader = function(archetypeId, name) {
  const arc = ZI.LEADER_ARCHETYPES.find(a => a.id === archetypeId); if (!arc) return false;
  const l = ZI.getLeader(); l.archetype = archetypeId; if (name) l.name = name; ZI.saveLeader(l);
  const xp = ZI.getStatXp(); Object.entries(arc.start).forEach(([k, v]) => { xp[k] = (xp[k] || 0) + v; });
  try { localStorage.setItem(ZI.STAT_XP_KEY, JSON.stringify(xp)); } catch (e) {}
  ZI._scavCumCache = null; // recompute after seeding
  return true;
};
ZI.leaderChosen = function() { return !!ZI.getLeader().archetype; };
// Leader's level IS the Camp Leader level (unifies with Camp Infra gate).
ZI.leaderLevel = function() { return ZI.getCampLeaderLevel(); };
// Deploy state: safe in camp, at risk in the field.
ZI.isLeaderDeployed = function() { return !!ZI.getLeader().deployed; };
ZI.isLeaderRecovering = function() { const r = ZI.getLeader().recovery; return !!r && ZI.now() < r.until; };
ZI.leaderStatus = function() {
  if (ZI.isLeaderRecovering()) return 'recovering';
  return ZI.isLeaderDeployed() ? 'deployed' : 'camp';
};
ZI.leaderRecoveryRemaining = function() { const r = ZI.getLeader().recovery; return (r && ZI.now() < r.until) ? Math.round((r.until - ZI.now()) / 1000) : 0; };
ZI.deployLeader = function(on) {
  if (on && ZI.isLeaderRecovering()) return false; // can't deploy while recovering
  const l = ZI.getLeader(); l.deployed = !!on; ZI.saveLeader(l); return true;
};
// Injury on downed-while-deployed: enter timed Recovery (Infirmary shortens it).
ZI.injureLeader = function(enemyTier) {
  const l = ZI.getLeader();
  const base = 300 + (enemyTier || 1) * 180;                 // seconds, scales with tier
  const infLvl = ZI.structureLevel('infirmary');
  const dur = Math.round(base * (1 - Math.min(0.6, infLvl * 0.12))); // Infirmary reduces up to 60%
  l.deployed = false; l.recovery = { until: ZI.now() + dur * 1000, severity: enemyTier || 1 };
  ZI.saveLeader(l);
  return dur;
};
ZI.treatLeader = function() { // Infirmary "treat to speed recovery" — halves remaining
  const l = ZI.getLeader(); if (!l.recovery) return false;
  const rem = l.recovery.until - ZI.now(); if (rem <= 0) { l.recovery = null; ZI.saveLeader(l); return true; }
  l.recovery.until = ZI.now() + Math.round(rem / 2); ZI.saveLeader(l); return true;
};
// Pack Leader gating reads the leader's live deploy + Scavenging (Scavenging spec §2.1).
ZI.packLeaderActive = function(squadHasLeader) {
  return squadHasLeader && ZI.isLeaderDeployed() && !ZI.isLeaderRecovering()
      && ZI.statLevel('scavenging') >= ZI.STAT_FORMULAS.PACK_LEADER_THRESHOLD;
};
// Command capacity scales with leader level.
ZI.commandRosterCap = function() { return ZI.rosterCapacity() + Math.floor(ZI.leaderLevel() / 10); };
ZI.commandSquadCap = function() { return Math.max(1, Math.min(4, 1 + Math.floor(ZI.leaderLevel() / 20) + ZI.structureLevel('barracks'))); };
ZI.commandScheduleSlots = function() { return 3 + Math.floor(ZI.leaderLevel() / 15); };

// ─── HORDE / CAMP-SIEGE DEFENSE (wave defense on the combat model) ───────────
ZI.SIEGE_KEY = 'zi_siege';
ZI.SIEGE_VER = 1;
ZI.getSiegeSave = function() {
  let s; try { s = JSON.parse(localStorage.getItem(ZI.SIEGE_KEY) || 'null'); } catch (e) { s = null; }
  if (!s || s.v !== ZI.SIEGE_VER) s = { v: ZI.SIEGE_VER, wallHp: 100, wallMax: 100, lastSiegeAt: ZI.now(), nextSiegeAt: ZI.now() + 6*3600*1000, active: null, history: [] };
  return s;
};
ZI.saveSiegeSave = function(s) { try { localStorage.setItem(ZI.SIEGE_KEY, JSON.stringify(s)); } catch (e) {} };
// Walls HP scales with the fortification structure level.
ZI.wallMaxHp = function() { return 100 + ZI.structureLevel('walls') * 120; };
// Countdown to the next siege (threat pulls it sooner; a periodic floor keeps cadence).
ZI.siegeCountdown = function(threatLevel) {
  const s = ZI.getSiegeSave();
  const threatPull = (threatLevel || 0) * 900 * 1000; // higher threat → sooner
  const eff = s.nextSiegeAt - threatPull;
  return Math.max(0, Math.round((eff - ZI.now()) / 1000));
};
ZI.siegeImminent = function(threatLevel) { return ZI.siegeCountdown(threatLevel) <= 300; };
// Forecast: waves + horde tier scale with threat and elapsed time.
ZI.siegeForecast = function(threatLevel) {
  const t = threatLevel || 3;
  const waves = 3 + Math.floor(t / 2);
  const hordeTier = Math.min(7, 1 + Math.floor(t / 1.5));
  return { waves, hordeTier, wallHp: ZI.getSiegeSave().wallHp, wallMax: ZI.wallMaxHp(),
    defenseRating: ZI.campDefenseRating(), defenders: ZI.siegeDefenderCount() };
};
ZI.siegeDefenderCount = function() {
  // Guard-shift assignments + optionally the deployed leader.
  const sched = ZI.getSchedule().assignments.filter(a => a.jobId === 'guard').length;
  return sched + (ZI.isLeaderDeployed() ? 1 : 0);
};
// Resolve a full siege on the combat model. mode:'idle' auto; returns recap.
ZI.resolveSiege = function(threatLevel, leaderDefends) {
  const f = ZI.siegeForecast(threatLevel);
  const s = ZI.getSiegeSave();
  s.wallMax = ZI.wallMaxHp();
  let wallHp = s.wallHp;
  const defRating = f.defenseRating;
  const log = []; let outcome = 'held'; let casualties = 0; let resourcesLost = 0;
  // Build a defender stat block (aggregate of guards + leader).
  const guardStrength = f.defenders * 12 + defRating * 2;
  for (let w = 1; w <= f.waves; w++) {
    const waveTier = Math.min(7, f.hordeTier + Math.floor((w - 1) / 2));
    const waveSize = 4 + w * 2 + Math.round(threatLevel || 0);
    // Wall phase: horde batters walls, reduced by defense rating (tower fire).
    const wallDmg = Math.max(0, waveSize * (6 + waveTier * 2) - defRating * 3);
    wallHp -= wallDmg;
    if (wallHp > 0) {
      log.push({ wave:w, text:`Wall held — took ${wallDmg} damage (${Math.max(0,wallHp)}/${s.wallMax})` });
    } else {
      // Breach: defenders fight through the combat model.
      const enemy = { name:`Wave ${w}`, hp: waveSize * (10 + waveTier * 4), hpMax: waveSize * (10 + waveTier * 4),
        damageMin: 4 + waveTier, damageMax: 8 + waveTier * 2, damageBonus:0, accuracy: 55 + waveTier * 2,
        evasion: waveTier, armor: waveTier, crit: 5 + waveTier, critBonus: 8, lifesteal:0, initiative: 6 + waveTier * 2, xp: waveTier * 10 };
      const defender = { name:'Defenders', hp: guardStrength * 6, hpMax: guardStrength * 6,
        damageMin: Math.round(guardStrength * 0.5), damageMax: guardStrength, damageBonus:0,
        accuracy: 60 + defRating, evasion: 8, armor: defRating, crit: 8, critBonus: 8, lifesteal:0, initiative: 14 };
      const res = ZI.simulateCombat(defender, enemy, 'idle');
      if (res.outcome !== 'win') { outcome = wallHp < -s.wallMax ? 'overrun' : 'breached'; casualties++; resourcesLost += waveSize * 3; log.push({ wave:w, text:`Wall breached — defenders took casualties (wave ${w})` }); }
      else { log.push({ wave:w, text:`Wall down but wave repelled in melee (wave ${w})` }); if (outcome==='held') outcome = 'held_damaged'; }
    }
  }
  // Apply outcome.
  s.wallHp = Math.max(0, wallHp);
  s.lastSiegeAt = ZI.now(); s.nextSiegeAt = ZI.now() + (18 + Math.random()*12) * 3600 * 1000;
  const rewards = {};
  if (outcome === 'held' || outcome === 'held_damaged') {
    rewards.loot = f.waves * 20 + f.hordeTier * 15;
    ZI.emitAction && ZI.emitAction('run.complete', 1.5, { siege:true });
    ZI.awardXp && ZI.awardXp('combat', f.waves * 25);
    ZI.awardXp && ZI.awardXp('valor', f.waves * 15);
    rewards.threatReset = true;
  } else {
    // Breached/overrun: damage a structure, steal resources, injure leader if deployed.
    if (window.ZI_MATERIALS) { const keys = Object.keys(window.ZI_MATERIALS); const k = keys[Math.floor(Math.random()*keys.length)]; const M = window.ZI_MATERIALS[k]; const stolen = Math.min(M.current, resourcesLost); M.current -= stolen; rewards.stolen = { mat:k, amount:stolen }; }
    if (leaderDefends && ZI.isLeaderDeployed()) { const d = ZI.injureLeader(f.hordeTier); rewards.leaderInjured = d; }
    ZI.awardXp && ZI.awardXp('combat', f.waves * 10);
  }
  s.history.unshift({ at: ZI.now(), outcome, waves: f.waves, casualties, resourcesLost });
  s.history = s.history.slice(0, 10);
  ZI.saveSiegeSave(s);
  return { outcome, waves: f.waves, casualties, resourcesLost, rewards, log };
};

// ─── TIMER & OFFLINE JOB ENGINE (keystone: craft/repair/build queue) ─────────
// Grant-on-complete hooks are defined FIRST so no settle call — including the
// very first one at file load — can ever run before they exist (that ordering
// gap previously caused a job to be silently removed without granting output).
// Craft-completion grant: applies a recipe's outputs (RMAT wallet, gear, XP).
ZI.grantJobCraft = function(recipeId, qty, meta) {
  const r = (ZI.CRAFT_RECIPES || []).find(x => x.id === recipeId); if (!r) return;
  const n = qty || 1;
  for (let i = 0; i < n; i++) {
    if (r.grantsGear && ZI.grantGear) ZI.grantGear(r.grantsGear, r.grantsQty || 1);
    else if (ZI.GEAR_ITEMS) r.out.forEach(o => { const g = ZI.GEAR_ITEMS.find(gi => gi.name === o.n); if (g && ZI.grantGear) ZI.grantGear(g.id, o.q || 1); });
    if ((r.kind === 'rmat' || !r.kind) && ZI.addRmat) r.out.forEach(o => { if (/rmat/i.test(o.n)) ZI.addRmat(r.tier, o.q || 1); });
  }
  const scale = 1 + (r.tier || 0) * 0.4;
  if (r.kind === 'gear') ZI.emitAction && ZI.emitAction('craft.smith', scale);
  else if (r.kind === 'consumable') ZI.emitAction && ZI.emitAction('craft.medical', scale);
  else ZI.emitAction && ZI.emitAction('craft.rmat', scale);
};
// Recycle-completion grant: applies an item's material outputs to the stockpile.
// Returns true only if materials were actually available to credit — if the
// material store isn't ready yet, the job is NOT consumed (retried next tick).
ZI.grantRecycleOutput = function(item) {
  if (!item || !item.outputs) return true; // malformed job — don't retry forever, just drop it
  const M = window.ZI_MATERIALS;
  if (!M || !Object.keys(M).length) {
    if (typeof console !== 'undefined') console.warn('[ZI JobEngine] ZI_MATERIALS not ready — deferring recycle grant', item.name);
    return false;
  }
  let grantedAny = false;
  Object.entries(item.outputs).forEach(([mat, amt]) => {
    const target = M[mat]; if (!target) return;
    target.current = Math.min(target.max, target.current + amt);
    grantedAny = true;
  });
  if (item.fromWandering && ZI.consumeWanderLoot) ZI.consumeWanderLoot(item.id);
  if (ZI.emitAction) ZI.emitAction('recycle', 1);
  if (typeof console !== 'undefined') console.log('[ZI JobEngine] recycled', item.name, '→', item.outputs);
  return true;
};
ZI.now = function() { return Date.now(); };
ZI.JOBS_KEY = 'zi_jobs';
ZI.JOBS_VER = 1;
ZI.BASE_CRAFT_SLOTS = 1;
// Raw store reader/writer (no settle side-effects — used internally by _settleJobs
// to avoid recursion). Public reads go through ZI.getJobs(), which settles first.
ZI._readJobsRaw = function() {
  let s; try { s = JSON.parse(localStorage.getItem(ZI.JOBS_KEY) || 'null'); } catch (e) { s = null; }
  if (!s || s.v !== ZI.JOBS_VER) s = { v: ZI.JOBS_VER, jobs: [] };
  return s;
};
ZI.saveJobs = function(s) { try { localStorage.setItem(ZI.JOBS_KEY, JSON.stringify(s)); } catch (e) {} };
// Settle-on-read: every public read re-checks elapsed time and completes any
// due jobs first. This makes the queue self-healing even if the background
// setInterval ticker is throttled/unreliable (e.g. a backgrounded iframe) —
// any UI poll (progress bars, job counts) drives completion, not just the timer.
ZI._settling = false;
ZI.getJobs = function() {
  if (!ZI._settling) {
    ZI._settling = true;
    try { ZI._settleJobs(ZI.now()); } catch (e) { if (typeof console !== 'undefined') console.error('[ZI JobEngine] settle failed', e); }
    ZI._settling = false;
  }
  return ZI._readJobsRaw();
};
// Craft + repair share the Workshop pool; builds have a separate lane.
ZI.craftSlots = function() { return ZI.BASE_CRAFT_SLOTS + ZI.structureLevel('workshop'); };
ZI.buildSlots = function() { return 1; };
ZI.recycleSlots = function() { return 1; }; // single-lane FIFO, mirrors the old queue's one-at-a-time behavior
ZI._poolOf = function(type) { return type === 'build' ? 'build' : type === 'recycle' ? 'recycle' : 'craft'; };
ZI._slotsFor = function(pool) { return pool === 'build' ? ZI.buildSlots() : pool === 'recycle' ? ZI.recycleSlots() : ZI.craftSlots(); };
// Enqueue a job. Auto-starts if a slot is free, else queued (FIFO).
ZI.enqueueJob = function(type, refId, duration, meta, qty) {
  const s = ZI.getJobs();
  const pool = ZI._poolOf(type);
  const active = s.jobs.filter(j => ZI._poolOf(j.type) === pool && j.status === 'active').length;
  const job = { id:'job_'+ZI.now()+Math.floor(Math.random()*1e5), type, refId, qty:qty||1,
    duration: duration||1, startedAt: active < ZI._slotsFor(pool) ? ZI.now() : null,
    status: active < ZI._slotsFor(pool) ? 'active' : 'queued', meta: meta || {} };
  s.jobs.push(job); ZI.saveJobs(s); ZI._settleJobs(ZI.now());
  return job;
};
ZI._grantJob = function(j) {
  if (j.type === 'craft') return ZI.grantJobCraft ? (ZI.grantJobCraft(j.refId, j.qty, j.meta), true) : false;
  if (j.type === 'repair') { const it = ZI.getGearItem(j.refId); if (it) { const m = ZI.getDuraMap(); m[j.refId] = ZI.itemDurabilityMax(it); ZI.saveDuraMap(m); if (ZI.emitAction) ZI.emitAction('repair', 1 + ZI.tierRank(it) * 0.5); } return true; }
  if (j.type === 'build') { const cs = ZI.getCampSave(); cs.built[j.refId] = j.meta.toLevel; ZI.saveCampSave(cs); if (ZI.emitAction) ZI.emitAction('build', 1); return true; }
  if (j.type === 'recycle') return ZI.grantRecycleOutput ? ZI.grantRecycleOutput(j.meta.item) : false;
  return true; // unknown job type — don't block the queue on it
};
// Offline catch-up: walk the queue forward through elapsed real time, respecting slots.
ZI._settleJobs = function(now) {
  const s = ZI._readJobsRaw();
  const completed = [];
  let guard = 0;
  while (guard++ < 2000) {
    // complete any active job whose timer elapsed
    const done = s.jobs.filter(j => j.status === 'active' && j.startedAt != null && now >= j.startedAt + j.duration * 1000);
    if (!done.length) break;
    // finish the earliest-finishing one, then promote a queued job into the freed slot
    done.sort((a, b) => (a.startedAt + a.duration*1000) - (b.startedAt + b.duration*1000));
    const j = done[0];
    const granted = ZI._grantJob(j);
    if (!granted) break; // e.g. materials store not ready yet — retry on the next settle, don't drop the job
    completed.push({ type:j.type, refId:j.refId });
    const finishAt = j.startedAt + j.duration * 1000;
    s.jobs = s.jobs.filter(x => x.id !== j.id);
    // promote next queued job in the same pool; its clock starts when the slot freed
    const pool = ZI._poolOf(j.type);
    const next = s.jobs.find(x => x.status === 'queued' && ZI._poolOf(x.type) === pool);
    if (next) { next.status = 'active'; next.startedAt = finishAt; }
  }
  // fill any idle slots with queued jobs starting now (first load)
  ['craft','build','recycle'].forEach(pool => {
    const activeN = s.jobs.filter(x => ZI._poolOf(x.type) === pool && x.status === 'active').length;
    let free = ZI._slotsFor(pool) - activeN;
    s.jobs.filter(x => x.status === 'queued' && ZI._poolOf(x.type) === pool).forEach(x => {
      if (free > 0) { x.status = 'active'; x.startedAt = now; free--; }
    });
  });
  ZI.saveJobs(s);
  return completed;
};
ZI.jobProgress = function(j) {
  if (j.status !== 'active' || j.startedAt == null) return 0;
  return Math.max(0, Math.min(1, (ZI.now() - j.startedAt) / (j.duration * 1000)));
};
ZI.jobRemaining = function(j) {
  if (j.status !== 'active' || j.startedAt == null) return j.duration;
  return Math.max(0, Math.round((j.startedAt + j.duration * 1000 - ZI.now()) / 1000));
};
ZI.jobsByType = function(type) { return ZI.getJobs().jobs.filter(j => j.type === type); };
ZI.cancelJob = function(id) { const s = ZI.getJobs(); s.jobs = s.jobs.filter(j => j.id !== id); ZI.saveJobs(s); ZI._settleJobs(ZI.now()); };
// The JobEngine ticker (foreground) + one settle on load (offline catch-up).
ZI.JobEngine = { timer:null, start(){ if(this.timer) return; this.timer=setInterval(()=>{ try{ ZI._settleJobs(ZI.now()); }catch(e){} },1000); } };
ZI._settleJobs(ZI.now());
ZI.JobEngine.start();
// XP→level: cumulative curve  xpForLevel(L) = 50·L + 12·L²  (prof cap 50)
// XP→level. Non-scavenging: existing curve xpForLevel(L)=50L+12L² (unchanged).
// Scavenging: steepest curve via cumulative STAT_FORMULAS.xpToNext (most-gated).
ZI._scavCumCache = null;
ZI._scavCumThreshold = function(L) {
  // Cumulative XP required to REACH level L (sum of xpToNext for 1..L-1).
  if (!ZI._scavCumCache) {
    ZI._scavCumCache = [0, 0]; // index by level; L1 needs 0
    let total = 0;
    for (let i = 1; i < 50; i++) { total += ZI.STAT_FORMULAS.xpToNext('scavenging', i); ZI._scavCumCache[i + 1] = total; }
  }
  return ZI._scavCumCache[Math.min(50, Math.max(1, L))] || 0;
};
ZI.statLevel = function(stat) {
  const xp = (ZI.getStatXp()[stat] || 0);
  let lvl = 1;
  if (stat === 'scavenging') {
    while (lvl < 50 && xp >= ZI._scavCumThreshold(lvl + 1)) lvl++;
    return lvl;
  }
  while (lvl < 50 && xp >= (50 * (lvl + 1) + 12 * (lvl + 1) * (lvl + 1))) lvl++;
  return lvl;
};

ZI.STAT_FORMULAS = {
  // ── FIRST AID ──  heal amount & count scale with level.
  // healPercent(L) = clamp(20 + 1.2·L, 20, 75)   ·  L1≈21% · L25≈50% · L46+≈75% cap
  firstAidHealPercent(L) { return Math.min(75, Math.round(20 + 1.2 * L)); },
  // healCount(L)   = clamp(2 + floor(L/8), 2, 8) ·  L1=2 · L8=3 · L48=8
  firstAidHealCount(L) { return Math.max(2, Math.min(8, 2 + Math.floor(L / 8))); },
  // XP per successful heal, scaled by amount restored.
  firstAidXpForHeal(amountHealed) { return Math.round(12 + amountHealed * 0.2); },

  // ── SCAVENGING ──  parallels Wandering looting.
  // XP per kill scales with zombie tier rank (0=F … 7=BOSS); per-item flat.
  scavengingXpForKill(tierRank) { return 6 + tierRank * 2; },
  scavengingXpForItem() { return 4; },
  // Loot quality % bonus = clamp(0.6·L, 0, 60)
  scavengingQualityBonus(L) { return Math.min(60, Math.round(0.6 * L)); },
  // Rarity filter unlocks: which rarities can be filter-targeted at level L.
  scavengingFilters(L) {
    const f = ['Common'];
    if (L >= 10) f.push('Uncommon');
    if (L >= 20) f.push('Rare');
    if (L >= 30) f.push('Epic');
    if (L >= 40) f.push('Legendary');
    return f;
  },

  // ── STEALTH ──  gained by scouting & pushing.
  // "Perfected sum": stealth efficiency = scoutPower + pushPower, both rising with L.
  stealthXpForScout() { return 5; },
  stealthXpForPush() { return 8; },
  // Scout reveals 1 + floor(L/4) zombies sequentially.  L1=1 · L12=4 · L48=13
  stealthScoutCount(L) { return 1 + Math.floor(L / 4); },
  // Push distance = 75 + 2.5·L metres (base 75 now, scaling with Stealth). L1≈77 · L50=200
  stealthPushDistance(L) { return Math.round(75 + 2.5 * L); },
  // Combined "perfected" efficiency rating (UI display).
  stealthEfficiency(L) { return this.stealthScoutCount(L) + Math.round(this.stealthPushDistance(L) / 25); },

  // ── EVADE / PUSH-TO-ESCAPE ── (Wandering disengage; all tunable) ──
  ESCAPE_BASE: 25, ESCAPE_MIN: 5, ESCAPE_MAX: 90,
  escapeStealthBonus(L) { return Math.round(L * 1.4); },          // Stealth is primary
  escapeReflexBonus(athleticsLvl) { return Math.round((athleticsLvl || 0) * 0.8); },
  escapeGearSpeedBonus(speedStat) { return Math.round(((speedStat || 100) - 100) * 0.4); }, // faster loadout helps
  // Enemy resistance derived from speed (fast zeds resist escape). unescapable → 999.
  escapeEnemyResist(enemy) {
    if (!enemy) return 0;
    if (enemy.unescapable || (enemy.traits && /grab|hold|latch/i.test(enemy.traits.join ? enemy.traits.join(' ') : ''))) return 999;
    if (typeof enemy.escapeResist === 'number') return enemy.escapeResist;
    const spd = enemy.spd || enemy.init || 6;
    return Math.round(spd * 3); // Shambler(~4)→12, Runner(~12+)→36+
  },
  escapeChance(stealthLvl, athleticsLvl, speedStat, enemy) {
    const resist = this.escapeEnemyResist(enemy);
    if (resist >= 999) return 0; // unescapable
    const itemEvade = (window.ZI && window.ZI.activeEvadeBonus) ? window.ZI.activeEvadeBonus() : 0; // §4 craftable evade
    const raw = this.ESCAPE_BASE + this.escapeStealthBonus(stealthLvl)
      + this.escapeReflexBonus(athleticsLvl) + this.escapeGearSpeedBonus(speedStat) + itemEvade - resist;
    return Math.max(this.ESCAPE_MIN, Math.min(this.ESCAPE_MAX, Math.round(raw)));
  },
  escapeOpportunityDamage(enemy) { return Math.max(2, Math.round((enemy && enemy.atk || 8) * 0.6)); },

  // ── SCAVENGING LOOT-LOSS GATING (most-gated stat) ──
  // BalanceConfig dials:
  DROP_MAX: 0.90, LMAX: 50, PACK_LEADER_THRESHOLD: 25,
  // Fraction of the NON-best haul lost on a bad run end. L50 → 0 (total protection).
  scavDropRate(L) {
    const r = this.DROP_MAX * (this.LMAX - L) / (this.LMAX - 1);
    return Math.max(0, Math.min(this.DROP_MAX, r));
  },
  scavDropProtection(L) { return 1 - this.scavDropRate(L); }, // for UI (0..1)
  // Pack Leader (§2.1): a squadmate gets the better of own vs. leader drop rate,
  // but only in a squad (≥2) with the Camp Leader present & Scavenging ≥ threshold.
  effectiveDropRate(ownScavLvl, squad, campLeaderId) {
    const own = this.scavDropRate(ownScavLvl);
    if (!Array.isArray(squad) || squad.length < 2) return own;
    const leader = squad.find(s => s.id === campLeaderId);
    if (!leader || (leader.scavengingLevel || 0) < this.PACK_LEADER_THRESHOLD) return own;
    return Math.min(own, this.scavDropRate(leader.scavengingLevel));
  },

  // ── PER-PROFESSION XP CURVE (Scavenging steepest) ──
  A_BASE: 100, P_BASE: 1.5, A_SCAV: 150, P_SCAV: 1.8, GATE_START: 35, GATE_STEP: 0.15,
  xpToNext(profession, L) {
    if (profession === 'scavenging') {
      const gate = 1 + Math.max(0, L - this.GATE_START) * this.GATE_STEP;
      return Math.round(this.A_SCAV * Math.pow(L, this.P_SCAV) * gate);
    }
    return Math.round(this.A_BASE * Math.pow(L, this.P_BASE));
  },

  // ── COMBAT RESOLUTION MODEL (shared by idle auto-resolve + active) ──
  BASE_HIT: 65, HIT_MIN: 5, HIT_MAX: 95, MIN_CHIP: 1, CRIT_BONUS: 6,
  // Derive the survivor's combatant stat block from loadout + professions.
  survivorStatBlock(loadoutStats) {
    const s = loadoutStats || (window.ZI.resolveLoadoutStats && window.ZI.resolveLoadoutStats()) || {};
    const combatLvl = window.ZI.statLevel ? window.ZI.statLevel('combat') : 1;
    const athLvl = window.ZI.statLevel ? window.ZI.statLevel('athletics') : 1;
    const wpn = s.weaponDamage || 8;
    return {
      name:'Survivor', hp: s.displayHP || 100, hpMax: s.displayHP || 100,
      damageMin: Math.max(1, Math.round(wpn * 0.6)), damageMax: Math.max(2, Math.round(wpn * 1.1)), damageBonus: 0,
      accuracy: 55 + combatLvl, evasion: Math.round(athLvl * 0.8) + (window.ZI.activeEvadeBonus ? window.ZI.activeEvadeBonus() : 0),
      armor: s.armorRating || 0, crit: 5 + Math.round(combatLvl * 0.5), critBonus: this.CRIT_BONUS,
      lifesteal: 0, initiative: 10 + Math.round((s.speed || 100) / 10) + athLvl,
    };
  },
  // Build an enemy stat block from a bestiary/encounter shape.
  enemyStatBlock(z) {
    const st = z.stats || {};
    return {
      name: z.name || 'Zombie', hp: z.hp || z.currentHp || 25, hpMax: z.hp || 25,
      damageMin: st.minHit || Math.max(1, Math.round((z.atk||z.dmg||8) * 0.6)),
      damageMax: st.maxHit || Math.max(2, Math.round((z.atk||z.dmg||8) * 1.1)), damageBonus: 0,
      accuracy: st.accuracy || 55, evasion: st.evasionMelee || 8,
      armor: z.armor || st.damageReduction || 0, crit: st.critChance || 5, critBonus: Math.round((st.critMult||1.5) * this.CRIT_BONUS),
      lifesteal: st.lifesteal || 0, initiative: Math.round((z.spd || z.init || 6) * 1.5),
      xp: z.xp || 10, bestiaryId: z.bestiaryId || z.id,
    };
  },
  // Atomic single-attack exchange (whole-number in/out).
  resolveAttack(atk, def) {
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const hitChance = clamp(this.BASE_HIT + atk.accuracy - def.evasion, this.HIT_MIN, this.HIT_MAX);
    if (Math.random() * 100 > hitChance) return { result:'miss' };
    let dmg = Math.floor(atk.damageMin + Math.random() * (atk.damageMax - atk.damageMin + 1)) + (atk.damageBonus || 0);
    const crit = Math.random() * 100 <= atk.crit;
    if (crit) dmg += atk.critBonus || 0;
    const dealt = Math.max(this.MIN_CHIP, dmg - (def.armor || 0));
    def.hp -= dealt;
    if (atk.lifesteal) atk.hp = Math.min(atk.hpMax, atk.hp + Math.floor(dealt * atk.lifesteal / 100));
    return { result: crit ? 'crit' : 'hit', dealt, defHp: def.hp };
  },
};

// Full-fight resolution — both modes share this core (idle runs it to completion).
ZI.simulateCombat = function(survivor, enemy, mode) {
  const F = ZI.STAT_FORMULAS;
  const s = Object.assign({}, survivor), e = Object.assign({}, enemy);
  const log = [];
  let rounds = 0, dmgDealt = 0;
  const sFirst = (s.initiative || 0) >= (e.initiative || 0);
  while (s.hp > 0 && e.hp > 0 && rounds < 100) {
    rounds++;
    const order = sFirst ? [[s, e, true], [e, s, false]] : [[e, s, false], [s, e, true]];
    for (const [atk, def, isSurv] of order) {
      if (atk.hp <= 0 || def.hp <= 0) continue;
      const r = F.resolveAttack(atk, def);
      if (isSurv && r.dealt) dmgDealt += r.dealt;
      log.push({ by: isSurv ? 'survivor' : 'enemy', ...r });
    }
  }
  const outcome = e.hp <= 0 ? 'win' : s.hp <= 0 ? 'downed' : 'flee';
  return { outcome, rounds, dmgDealt, hpLeft: Math.max(0, s.hp), enemyXp: enemy.xp || 10, log };
};

// ─── COMMAND RATE LIMIT (60 / rolling 24h, server-cycle aligned) ─────────────
// The authoritative 24h cycle lives server-side; the client mirrors it with a
// rolling window anchored to the last cycle start (or first use).
ZI.CMD_LIMIT = 60;
ZI.CMD_KEY = 'zi_cmd_window';
ZI.CMD_CYCLE_MS = 24 * 60 * 60 * 1000;
ZI.getCmdWindow = function() {
  let w;
  try { w = JSON.parse(localStorage.getItem(ZI.CMD_KEY) || 'null'); } catch (e) { w = null; }
  const now = Date.now();
  if (!w || (now - w.start) >= ZI.CMD_CYCLE_MS) {
    w = { start: now, count: 0 };
    try { localStorage.setItem(ZI.CMD_KEY, JSON.stringify(w)); } catch (e) {}
  }
  return w;
};
ZI.cmdsRemaining = function() {
  const w = ZI.getCmdWindow();
  return Math.max(0, ZI.CMD_LIMIT - w.count);
};
ZI.cmdResetInMs = function() {
  const w = ZI.getCmdWindow();
  return Math.max(0, ZI.CMD_CYCLE_MS - (Date.now() - w.start));
};
// Returns true if the command is allowed (and consumes one); false if depleted.
ZI.consumeCommand = function() {
  const w = ZI.getCmdWindow();
  if (w.count >= ZI.CMD_LIMIT) return false;
  w.count += 1;
  try { localStorage.setItem(ZI.CMD_KEY, JSON.stringify(w)); } catch (e) {}
  return true;
};

// ─── WANDERING LOOT BANK → RECYCLER FEED ─────────────────────────────────────
// Items gathered in Wandering are banked here on extraction/retreat and surfaced
// in the Recycler's inventory for breakdown into simpler materials.
ZI.WANDER_LOOT_KEY = 'zi_wander_loot';
ZI.getWanderLoot = function() {
  try { return JSON.parse(localStorage.getItem(ZI.WANDER_LOOT_KEY) || '[]'); }
  catch (e) { return []; }
};
// Convert a carried run-item { name, value, rarity } into a recycler item with
// material outputs scaled by value/rarity.
ZI.toRecyclerItem = function(it) {
  const rarityTier = { Common:1, Uncommon:2, Rare:3, Epic:4, Legendary:5 };
  const tier = rarityTier[it.rarity] || 1;
  const v = Math.max(1, it.value || 1);
  const n = (it.name || '').toLowerCase();
  const outputs = {};
  if (/rifle|pistol|gun|blade|knife|hatchet|wrench|pipe|metal|scrap|can|gear/.test(n)) outputs.metal = Math.max(1, Math.round(v * 0.4));
  if (/radio|monitor|battery|electronic|circuit|wire|chip/.test(n)) outputs.electronics = Math.max(1, Math.round(v * 0.5));
  if (/hoodie|cloth|rag|bandage|fabric|tarp/.test(n)) outputs.cloth = Math.max(1, Math.round(v * 0.6));
  if (/wood|plank|stock|handle/.test(n)) outputs.wood = Math.max(1, Math.round(v * 0.5));
  if (/gas|fuel/.test(n)) outputs.fuel = Math.max(1, Math.round(v * 0.3));
  if (/bandage|medical|med|pill|syringe/.test(n)) outputs.medical = Math.max(1, Math.round(v * 0.3));
  if (Object.keys(outputs).length === 0) outputs.metal = Math.max(1, Math.round(v * 0.5)); // generic salvage → metal
  return {
    id: 'w' + Date.now() + Math.floor(Math.random() * 1e6),
    name: it.name || 'Salvage',
    tier,
    rarity: it.rarity || 'Common', // preserve canonical rarity word for tierOf()
    weight: Math.max(0.5, Math.round((v / 6) * 2) / 2),
    outputs,
    fromWandering: true,
    bankedAt: Date.now(), // for "Newest banked" sort
  };
};
ZI.bankWanderLoot = function(items) {
  if (!items || !items.length) return;
  const bank = ZI.getWanderLoot();
  for (const it of items) bank.push(ZI.toRecyclerItem(it));
  try { localStorage.setItem(ZI.WANDER_LOOT_KEY, JSON.stringify(bank)); } catch (e) {}
};
ZI.consumeWanderLoot = function(id) {
  const bank = ZI.getWanderLoot().filter(i => i.id !== id);
  try { localStorage.setItem(ZI.WANDER_LOOT_KEY, JSON.stringify(bank)); } catch (e) {}
};

// ─── RECYCLER VIEW (consolidated filter/sort dropdown — persisted) ───────────
ZI.RECYCLER_VIEW_KEY = 'zi_recycler_view';
ZI.getRecyclerView = function() {
  let v; try { v = JSON.parse(localStorage.getItem(ZI.RECYCLER_VIEW_KEY) || 'null'); } catch (e) { v = null; }
  return Object.assign({ filter: 'all', sort: 'tier' }, v || {});
};
ZI.saveRecyclerView = function(v) {
  try { localStorage.setItem(ZI.RECYCLER_VIEW_KEY, JSON.stringify(v)); } catch (e) {}
};
// Filter options with the minimum tier rank each requires. Gated by the
// Scavenging stat's existing rarity-filter unlocks.
ZI.RECYCLER_FILTERS = [
  { id: 'all',   label: 'All tiers', minRank: 0 },
  { id: 't0',    label: 'T0 only',   minRank: 0, exact: 0 },
  { id: 't1up',  label: 'T1+',       minRank: 1 },
  { id: 't3up',  label: 'T3+',       minRank: 3 },
  { id: 't5',    label: 'T5 only',   minRank: 5, exact: 5 },
];
// Which tier ranks the player has unlocked filtering for, via Scavenging level.
ZI.unlockedFilterRanks = function() {
  const lvl = (ZI.statLevel && ZI.statLevel('scavenging')) || 1;
  const words = (ZI.STAT_FORMULAS && ZI.STAT_FORMULAS.scavengingFilters(lvl)) || ['Common'];
  // Map unlocked rarity words → ranks; T0 (floor) is always available.
  const ranks = new Set([0]);
  words.forEach(w => { const t = ZI.RARITY_TO_TIER[w.toLowerCase()]; if (t) ranks.add(ZI.TIER_META[t].rank); });
  return ranks;
};
ZI.isFilterUnlocked = function(filter) {
  if (!filter || filter.minRank <= 0) return true;
  return ZI.unlockedFilterRanks().has(filter.minRank);
};
// Apply a saved view (filter+sort) to a list of recycler items.
ZI.applyRecyclerView = function(items, view) {
  const f = ZI.RECYCLER_FILTERS.find(x => x.id === view.filter) || ZI.RECYCLER_FILTERS[0];
  let out = (items || []).filter(it => {
    const rank = ZI.tierRank(it);
    if (f.exact != null) return rank === f.exact;
    return rank >= (f.minRank || 0);
  });
  const sort = view.sort || 'tier';
  out = out.slice().sort((a, b) => {
    if (sort === 'weight') return (a.weight || 0) - (b.weight || 0);
    if (sort === 'newest') return (b.bankedAt || 0) - (a.bankedAt || 0);
    return ZI.tierRank(b) - ZI.tierRank(a); // tier high→low (default)
  });
  return out;
};

// ─── MARKET SHOP (gated vendor sub-view) ─────────────────────────────────────
// Market view persistence (Auction ⇄ Shop).
ZI.MARKET_VIEW_KEY = 'zi_market_view';
ZI.getMarketView = function() {
  try { return localStorage.getItem(ZI.MARKET_VIEW_KEY) || 'auction'; } catch (e) { return 'auction'; }
};
ZI.saveMarketView = function(v) { try { localStorage.setItem(ZI.MARKET_VIEW_KEY, v); } catch (e) {} };

// Canonical RMAT wallet (single source; default zeros). Keyed by T-tier.
ZI.RMAT_HOLD_KEY = 'zi_rmat';
ZI.getRmatHoldings = function() {
  let h; try { h = JSON.parse(localStorage.getItem(ZI.RMAT_HOLD_KEY) || 'null'); } catch (e) { h = null; }
  return Object.assign({ T0:0, T1:0, T2:0, T3:0, T4:0, T5:0 }, h || {});
};
ZI.addRmat = function(tierKeyOrRank, qty) {
  const key = typeof tierKeyOrRank === 'number' ? 'T' + Math.max(0, Math.min(5, tierKeyOrRank)) : tierKeyOrRank;
  if (!/^T[0-5]$/.test(key)) return;
  const h = ZI.getRmatHoldings(); h[key] = (h[key] || 0) + (qty || 0);
  try { localStorage.setItem(ZI.RMAT_HOLD_KEY, JSON.stringify(h)); } catch (e) {}
};
ZI.rmatReachedRank = function() {
  const h = ZI.getRmatHoldings();
  let max = 0;
  ['T0','T1','T2','T3','T4','T5'].forEach(k => { if ((h[k] || 0) > 0) max = Math.max(max, ZI.TIER_META[k].rank); });
  return max;
};

// Lifetime (monotonic, non-regressing) Wandering distance/lap for shop gates.
ZI.WANDER_TOTAL_KEY = 'zi_wander_total';
ZI.getLifetimeDistance = function() {
  let stored = 0; try { stored = parseInt(localStorage.getItem(ZI.WANDER_TOTAL_KEY)) || 0; } catch (e) {}
  const cur = Math.round((ZI.getWanderRun && ZI.getWanderRun().scroll) || 0);
  const max = Math.max(stored, cur);
  if (max > stored) { try { localStorage.setItem(ZI.WANDER_TOTAL_KEY, String(max)); } catch (e) {} }
  return max;
};
ZI.getLifetimeLap = function() { return Math.floor(ZI.getLifetimeDistance() / 1000); };

// Purchased set (versioned, list-based — mirrors zi_stash).
ZI.SHOP_KEY = 'zi_shop';
ZI.SHOP_VER = 1;
ZI.getShopSave = function() {
  let s; try { s = JSON.parse(localStorage.getItem(ZI.SHOP_KEY) || 'null'); } catch (e) { s = null; }
  if (!s || s.v !== ZI.SHOP_VER) s = { v: ZI.SHOP_VER, owned: [], levels: {} };
  return s;
};
ZI.saveShopSave = function(s) { try { localStorage.setItem(ZI.SHOP_KEY, JSON.stringify(s)); } catch (e) {} };
ZI.shopOwned = function(id) { return ZI.getShopSave().owned.includes(id); };
ZI.shopLevel = function(id) { return ZI.getShopSave().levels[id] || 0; };

// Gate evaluator — AND of provided req keys (omitted keys ignored).
ZI.shopReqMet = function(entry) {
  const r = entry.req || {};
  if (r.rmatTier != null) { const need = ZI.TIER_META[r.rmatTier] ? ZI.TIER_META[r.rmatTier].rank : 0; if (ZI.rmatReachedRank() < need) return false; }
  if (r.rmatCount) { const h = ZI.getRmatHoldings(); if ((h[r.rmatCount.tier] || 0) < r.rmatCount.qty) return false; }
  if (r.distance != null && ZI.getLifetimeDistance() < r.distance) return false;
  if (r.lap != null && ZI.getLifetimeLap() < r.lap) return false;
  return true;
};
ZI.shopState = function(entry) {
  const lvl = ZI.shopLevel(entry.id);
  if (entry.repeatable) {
    const max = (entry.grant && entry.grant.maxLevel) || 1;
    if (lvl >= max) return 'owned';
  } else if (ZI.shopOwned(entry.id)) {
    return 'owned';
  }
  return ZI.shopReqMet(entry) ? 'unlocked' : 'locked';
};
ZI.shopProgress = function(entry) {
  const r = entry.req || {}, out = {};
  if (r.distance != null) out.distance = { cur: ZI.getLifetimeDistance(), req: r.distance };
  if (r.lap != null) out.lap = { cur: ZI.getLifetimeLap(), req: r.lap };
  if (r.rmatCount) out.rmat = { cur: (ZI.getRmatHoldings()[r.rmatCount.tier] || 0), req: r.rmatCount.qty, tier: r.rmatCount.tier };
  else if (r.rmatTier != null) out.rmat = { cur: ZI.rmatReachedRank(), req: (ZI.TIER_META[r.rmatTier] || {}).rank || 0, tier: r.rmatTier, isTierReach: true };
  return out;
};
// Fraction [0..1] toward the gate (min across conditions) — for "nearest unlock".
ZI.shopGateFraction = function(entry) {
  const p = ZI.shopProgress(entry); let frac = 1;
  Object.values(p).forEach(c => { if (c.req > 0) frac = Math.min(frac, c.cur / c.req); });
  return Math.max(0, Math.min(1, frac));
};
// Apply a purchase's grant (ready for when a cost model is chosen).
ZI.shopBuy = function(entry) {
  const g = entry.grant || {};
  if (g.kind === 'gear' && ZI.grantGear) ZI.grantGear(g.itemId, g.qty || 1);
  else if (g.kind === 'recipe') ZI.unlockShopRecipe(g.recipeId);
  else if (g.kind === 'capacity') ZI.applyCapacity(g.field, g.amount);
  else if (g.kind === 'flag') ZI.setProfileFlag(g.flag, g.value);
  const s = ZI.getShopSave();
  if (entry.repeatable) s.levels[entry.id] = (s.levels[entry.id] || 0) + 1;
  else if (!s.owned.includes(entry.id)) s.owned.push(entry.id);
  ZI.saveShopSave(s);
  if (ZI.emitAction) ZI.emitAction('transaction', 1 + (ZI.TIER_META[entry.tier] ? ZI.TIER_META[entry.tier].rank : 0) * 0.4);
};
// Grant sinks (single stores; consumed by their systems when wired).
ZI.unlockShopRecipe = function(id) { try { const k='zi_unlocked_recipes'; const set=JSON.parse(localStorage.getItem(k)||'[]'); if(!set.includes(id)){set.push(id);localStorage.setItem(k,JSON.stringify(set)); if(ZI.emitAction) ZI.emitAction('discover');} } catch(e){} };
ZI.isRecipeUnlocked = function(id) { try { return JSON.parse(localStorage.getItem('zi_unlocked_recipes')||'[]').includes(id); } catch(e){ return false; } };
ZI.applyCapacity = function(field, amount) { try { const k='zi_caps'; const c=JSON.parse(localStorage.getItem(k)||'{}'); c[field]=(c[field]||0)+(amount||0); localStorage.setItem(k,JSON.stringify(c)); } catch(e){} };
ZI.getCapacity = function(field) { try { return (JSON.parse(localStorage.getItem('zi_caps')||'{}'))[field]||0; } catch(e){ return 0; } };
ZI.setProfileFlag = function(flag, value) { try { const k='zi_flags'; const f=JSON.parse(localStorage.getItem(k)||'{}'); f[flag]=value; localStorage.setItem(k,JSON.stringify(f)); } catch(e){} };
ZI.getProfileFlag = function(flag) { try { return (JSON.parse(localStorage.getItem('zi_flags')||'{}'))[flag]; } catch(e){ return undefined; } };
// Count entries newly unlocked but not yet owned (for the dropdown badge).
ZI.shopNewUnlockCount = function() {
  return (ZI.SHOP_ITEMS || []).filter(e => ZI.shopState(e) === 'unlocked').length;
};

// Curated vendor catalog. cost is RESERVED (see spec §6) — Buy stays disabled
// until a currency is chosen. Gates are an AND of the provided req keys.
ZI.SHOP_ITEMS = [
  // ── Blueprints (goals) ──
  { id:'bp_forged_plate', name:'Blueprint: Forged Plate', cat:'blueprint', tier:'T3', icon:'▤',
    desc:'Unlocks the Forged Plate armor recipe in Crafting.', req:{ rmatTier:'T3', distance:3000 },
    cost:null, grant:{ kind:'recipe', recipeId:'plate_carrier' }, repeatable:false },
  { id:'bp_arc_carbine', name:'Blueprint: Arc Carbine', cat:'blueprint', tier:'T3', icon:'▤',
    desc:'Unlocks the Arc Carbine ranged recipe.', req:{ rmatTier:'T2', lap:3 },
    cost:null, grant:{ kind:'recipe', recipeId:'arc_carbine' }, repeatable:false },
  { id:'bp_void_rifle', name:'Blueprint: Void Pulse Rifle', cat:'blueprint', tier:'T5', icon:'▤',
    desc:'Apex ranged blueprint. The last thing they hear.', req:{ rmatTier:'T5', distance:12000 },
    cost:null, grant:{ kind:'recipe', recipeId:'void_pulse_rifle' }, repeatable:false },
  // ── Capacity (power sinks, repeatable) ──
  { id:'cap_backpack', name:'Backpack Reinforcement', cat:'capacity', tier:'T1', icon:'▦',
    desc:'+10kg carry weight per level.', req:{ distance:1000 },
    cost:null, grant:{ kind:'capacity', field:'backpackKg', amount:10, maxLevel:5 }, repeatable:true },
  { id:'cap_stash', name:'Stash Expansion', cat:'capacity', tier:'T2', icon:'▦',
    desc:'+4 stash slots per level.', req:{ rmatTier:'T2', distance:2500 },
    cost:null, grant:{ kind:'capacity', field:'stashSlots', amount:4, maxLevel:5 }, repeatable:true },
  { id:'cap_squad', name:'Squad Billet', cat:'capacity', tier:'T3', icon:'▦',
    desc:'+1 max squad size per level (up to 4).', req:{ rmatTier:'T3', lap:5 },
    cost:null, grant:{ kind:'capacity', field:'squadMax', amount:1, maxLevel:3 }, repeatable:true },
  { id:'cap_recycler', name:'Recycler Tune-Up', cat:'capacity', tier:'T2', icon:'▦',
    desc:'+0.2 Recycler operator speed per level.', req:{ rmatTier:'T1', distance:2000 },
    cost:null, grant:{ kind:'capacity', field:'recyclerOpSpeed', amount:0.2, maxLevel:5 }, repeatable:true },
  // ── Gear & consumables (convenience) ──
  { id:'shop_vest_t3', name:'SAPI Plate Carrier', cat:'gear', tier:'T4', icon:'🦺',
    desc:'Vendor-stocked legendary vest, straight to your stash.', req:{ rmatTier:'T4', distance:8000 },
    cost:null, grant:{ kind:'gear', itemId:'vest_t3', qty:1 }, repeatable:false },
  { id:'shop_medkits', name:'Field Medkit ×3', cat:'consumable', tier:'T1', icon:'🧰',
    desc:'Three medkits delivered to your loadout stash.', req:{ distance:1500 },
    cost:null, grant:{ kind:'gear', itemId:'medkit', qty:3 }, repeatable:true },
  { id:'shop_stims', name:'Adrenaline Shot ×2', cat:'consumable', tier:'T2', icon:'💉',
    desc:'Two adrenaline shots for the next push.', req:{ lap:2 },
    cost:null, grant:{ kind:'gear', itemId:'stimpack', qty:2 }, repeatable:true },
  // ── Cosmetics / QoL (prestige) ──
  { id:'cos_amber_term', name:'Amber Terminal Skin', cat:'cosmetic', tier:'T3', icon:'✦',
    desc:'Recolors the UI terminal to warm amber. Pure flex.', req:{ lap:4 },
    cost:null, grant:{ kind:'flag', flag:'terminalSkin', value:'amber' }, repeatable:false },
  { id:'qol_autorecycle', name:'Auto-Recycle T0', cat:'qol', tier:'T2', icon:'⚙',
    desc:'Automatically recycle banked T0 salvage.', req:{ distance:4000 },
    cost:null, grant:{ kind:'flag', flag:'autoRecycleT0', value:true }, repeatable:false },
  { id:'cos_echo_palette', name:'Echo Sprite Palette', cat:'cosmetic', tier:'T5', icon:'✦',
    desc:'Reality-warped sprite palette. Deep-haul prestige marker.', req:{ rmatTier:'T5', distance:15000 },
    cost:null, grant:{ kind:'flag', flag:'spritePalette', value:'echo' }, repeatable:false },
];

// ─── WANDERING RUN STATE (persist progress + checkpoints across tabs) ────────
// Progress is held when the player leaves the Wandering tab and restored on
// return. Each checkpoint reached is registered here so the slider bar can
// render it as a selectable point.
ZI.WANDER_RUN_KEY = 'zi_wander_run';
ZI.defaultWanderRun = function() {
  return { scroll: 0, lastCheckpoint: 0, checkpoints: [], carried: [],
           active: false, hp: 100, kills: 0, xp: 0, mats: 0, healsUsed: 0,
           moveSpeed: 3, maxHeals: 3, healPct: 25, lastTickAt: 0,
           paused: false, awaySummary: null };
};
ZI.getWanderRun = function() {
  let s;
  try { s = JSON.parse(localStorage.getItem(ZI.WANDER_RUN_KEY) || 'null'); } catch (e) { s = null; }
  return Object.assign(ZI.defaultWanderRun(), s || {});
};
ZI.saveWanderRun = function(state) {
  try { localStorage.setItem(ZI.WANDER_RUN_KEY, JSON.stringify(state)); } catch (e) {}
};
// Merge partial fields into the persisted run (used by the live screen to keep
// the background engine in sync with on-screen play).
ZI.syncWanderState = function(partial) {
  const s = ZI.getWanderRun();
  Object.assign(s, partial);
  ZI.saveWanderRun(s);
  return s;
};
// Persist the live distance so leaving the tab doesn't reset progress.
ZI.setWanderScroll = function(scroll) {
  const s = ZI.getWanderRun();
  s.scroll = scroll;
  ZI.saveWanderRun(s);
};
// Register a checkpoint at the given meter mark (sorted, unique). Returns the list.
ZI.addCheckpoint = function(meters) {
  const s = ZI.getWanderRun();
  if (!s.checkpoints.includes(meters)) {
    s.checkpoints.push(meters);
    s.checkpoints.sort((a, b) => a - b);
  }
  s.lastCheckpoint = meters;
  ZI.saveWanderRun(s);
  return s.checkpoints.slice();
};
ZI.getCheckpoints = function() { return (ZI.getWanderRun().checkpoints || []).slice(); };
// Clear the run (called on Return to Base / extraction).
ZI.resetWanderRun = function() { ZI.saveWanderRun(ZI.defaultWanderRun()); };

// ─── BACKGROUND WANDERING ENGINE ─────────────────────────────────────────────
// Keeps the patrol "data stream" advancing even when the Wandering tab is not
// mounted. While the screen IS mounted, the React loop drives play and the
// engine only stamps the clock; while it's NOT mounted (player on another tab),
// the engine advances distance, resolves auto-combat, banks loot, and registers
// checkpoints — uninterrupted. A single shared timer; never cleared on tab swap.
ZI.wanderMounted = false;
ZI.CHECKPOINT_EVERY = 250;
ZI._bgZombie = function(lap) {
  const pool = (ZI.BESTIARY || []).filter(z => {
    const rank = { F:0, E:1, D:2, C:3, B:4, A:5, S:6, BOSS:7 }[z.tier] ?? 0;
    return rank <= Math.min(7, Math.floor(lap / 1.5));
  });
  const z = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
  return z ? { name: z.name, hp: z.hp, atk: z.dmg, xp: z.xp }
           : { name: 'Shambler', hp: 25, atk: 8, xp: 10 };
};
// ═══ WANDERING POLICY, SKILL DECAY, REPUTATION & HEXAGON (Wandering spec v1.0) ═══
// Pure rules (no React) so the live screen and the offline engine share one simulation.
ZI._rj = function(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
ZI._wj = function(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

// ── Policies (stored under their own key so retreats/deaths never wipe them) ──
ZI.POLICIES = {
  ethical:  { id:'ethical',  name:'Ethical',  icon:'🕊', color:'#7fd88f', desc:'Help people, keep the peace. Slow and safe.', resolve:'evade' },
  immoral:  { id:'immoral',  name:'Immoral',  icon:'🎒', color:'#e6c47e', desc:'Self-interest. Take what is left behind.', resolve:'either' },
  criminal: { id:'criminal', name:'Criminal', icon:'🗝', color:'#f09a4a', desc:'Theft, smuggling and gang conflict.', resolve:'either' },
  heinous:  { id:'heinous',  name:'Heinous',  icon:'☠', color:'#ff3b3b', desc:'Atrocity for maximum loot. Every faction turns hostile.', resolve:'fight' },
};
ZI.POLICY_SWITCH_COOLDOWN_H = 4;
ZI.getPolicy = function() { return ZI._rj('zi_wander_policy', { id:'ethical', changedAt:0 }); };
// Evade rule shared by the live screen and the offline engine (spec §7 #2).
// Ethical always evades, Heinous always fights; Immoral/Criminal follow the player's Evade toggle.
ZI.policyEvades = function() {
  const p = ZI.getPolicy();
  if (p.id === 'ethical') return true;
  if (p.id === 'heinous') return false;
  return !!p.evade;
};
ZI.setEvadeToggle = function(on) { const p = ZI.getPolicy(); p.evade = !!on; ZI._wj('zi_wander_policy', p); };
ZI.heinousUnlocked = function() { return ZI._rj('zi_heinous_unlocked', false) === true; };
ZI.policyCooldownLeftMs = function() {
  const p = ZI.getPolicy();
  if (p.id === 'heinous') return 0; // never trapped in Heinous
  return Math.max(0, (p.changedAt || 0) + ZI.POLICY_SWITCH_COOLDOWN_H * 3600000 - Date.now());
};
ZI.setPolicy = function(id) {
  const cur = ZI.getPolicy();
  if (!ZI.POLICIES[id] || id === cur.id) return { ok:false, reason:'Already active' };
  if (id === 'heinous' && !ZI.heinousUnlocked()) return { ok:false, reason:'Locked — find the Fort on a Traversal square' };
  const left = ZI.policyCooldownLeftMs();
  if (left > 0) return { ok:false, reason:`Cooldown: ${Math.ceil(left / 60000)} min left` };
  ZI._wj('zi_wander_policy', { id, changedAt: Date.now() });
  return { ok:true };
};

// ── Encounter pools (policy decides which encounters roll; encounters decide skills) ──
// kind: 'help' | 'loot' | 'trade' | 'faction' | 'zombie' | 'raid'. rep: rep delta on success (to a rolled faction).
ZI.ENCOUNTER_POOLS = {
  ethical: [
    { id:'wounded',   name:'Wounded stranger',              checks:['firstAid','diplomat'],   w:25, kind:'help',  rep:+12 },
    { id:'sickset',   name:'Sick settlement asks for help', checks:['medical','firstAid'],    w:15, kind:'help',  rep:+15 },
    { id:'convoy',    name:'Refugee convoy under threat',   checks:['diplomat','command'],    w:15, kind:'faction', rep:+14 },
    { id:'caravan',   name:'Fair-trade caravan',            checks:['trading','diplomat'],    w:20, kind:'trade', rep:+8 },
    { id:'farm',      name:'Abandoned farm',                checks:['foraging','discovery'],  w:15, kind:'loot' },
    { id:'zgroup_e',  name:'Zombie group',                  checks:['combat','stealth'],      w:10, kind:'zombie' },
  ],
  immoral: [
    { id:'cache',     name:'Abandoned cache',               checks:['scavenging','discovery'],w:30, kind:'loot' },
    { id:'wounded_i', name:'Wounded stranger (ignore or loot)', checks:['stealth','scavenging'], w:20, kind:'loot', rep:-8 },
    { id:'field',     name:'Undefended field',              checks:['foraging','stealth'],    w:15, kind:'loot', rep:-5 },
    { id:'lopsided',  name:'Lopsided trade',                checks:['trading','diplomat'],    w:15, kind:'trade', rep:-6 },
    { id:'zgroup_i',  name:'Zombie group',                  checks:['combat','stealth'],      w:20, kind:'zombie' },
  ],
  criminal: [
    { id:'vehicle',   name:'Broken-down vehicle',           checks:['mechanical','engineering'], w:20, kind:'loot' },
    { id:'storehouse',name:'Locked storehouse',             checks:['stealth','mechanical'],  w:20, kind:'loot', rep:-10 },
    { id:'fence',     name:'Fence stolen goods',            checks:['trading','diplomat'],    w:20, kind:'trade', rep:-6 },
    { id:'gang',      name:'Faction patrol or gang',        checks:['combat','command'],      w:10, kind:'faction', rep:-18 },
    { id:'guarded',   name:'Cache under guard',             checks:['scavenging','stealth'],  w:20, kind:'loot', rep:-8 },
    { id:'zgroup_c',  name:'Zombie group',                  checks:['combat','stealth'],      w:10, kind:'zombie' },
  ],
  heinous: [
    { id:'ambush',    name:'Ambush a convoy',               checks:['combat','command'],      w:30, kind:'raid', rep:-40 },
    { id:'raid',      name:'Raid a settlement',             checks:['combat','endurance'],    w:25, kind:'raid', rep:-45 },
    { id:'captive',   name:'Interrogate a captive',         checks:['command','diplomat'],    w:15, kind:'raid', rep:-30 },
    { id:'strip',     name:'Strip the fallen',              checks:['scavenging','combat'],   w:15, kind:'loot', rep:-20 },
    { id:'zgroup_h',  name:'Zombie group',                  checks:['combat','endurance'],    w:15, kind:'zombie' },
  ],
};
ZI.BASELINE_SKILLS = ['athletics','endurance','discovery'];
ZI.BASE_WORK_SKILLS = ['smithing','mechanical','engineering','logistics'];
// Register one XP-bus action per encounter (primary 70% / secondary 30%) + baseline trickle.
Object.values(ZI.ENCOUNTER_POOLS).forEach(pool => pool.forEach(e => {
  ZI.ACTION_XP['enc.' + e.id] = { base:14, split:{ [e.checks[0]]:0.7, [e.checks[1]]:0.3 } };
}));
ZI.ACTION_XP['enc.baseline'] = { base:4, split:{ athletics:0.4, endurance:0.3, discovery:0.3 } };

// ── Reputation: one store (repByFaction), negative tiers, ±50 cap, Lodge floor ──
ZI.REP_TIERS = [
  { min:-1000, name:'Hunted',   color:'#ff3b3b' }, { min:-600, name:'Hostile', color:'#f06a4a' },
  { min:-250,  name:'Wary',     color:'#e6a84a' },
  ...ZI.REP_RANKS.map((n, i) => ({ min: ZI.REP_THRESHOLDS[i], name: n, color: ['#b8b0a0','#d8d0b8','#e6d8a8','#a2dca2','#7fd88f','#7fe0ff','#ffd86a'][i] })),
];
// Live faction list for UI: rep from the single store; rank kept within REP_RANKS
// (so rank-progress maths stay valid) and 'standing' carries the negative tier name.
ZI.liveFactions = function() {
  return (ZI.FACTIONS || []).map(f => {
    const rep = ZI.getRep(f.id), t = ZI.repTier(rep);
    const rank = ZI.REP_RANKS.includes(t.name) ? t.name : ZI.REP_RANKS[0];
    return Object.assign({}, f, { rep, rank, standing: t.name, standingColor: t.color, lodgeMarkup: f.id === 'lodge' ? ZI.LODGE_MARKUP : 0 });
  });
};
// Lodge trades with anyone, at a steep markup (hexagon never applies to trade).
ZI.lodgePrice = function(base) { return Math.round(base * (1 + ZI.LODGE_MARKUP)); };
ZI.REP_MAX_EVENT = 50; ZI.LODGE_MIN_REP = -250; ZI.LODGE_MARKUP = 0.60;
ZI.getRep = function(fid) {
  const s = ZI.getContractSave();
  if (!s._repSeeded) { // one-time: fold the old static faction rep into the single store
    (ZI.FACTIONS || []).forEach(f => { if (s.repByFaction[f.id] == null) s.repByFaction[f.id] = f.rep || 0; });
    if (s.repByFaction.freeholders != null) { s.repByFaction.hearthguard = (s.repByFaction.hearthguard || 0) + s.repByFaction.freeholders; delete s.repByFaction.freeholders; }
    s._repSeeded = true; ZI.saveContractSave(s);
  }
  return s.repByFaction[fid] || 0;
};
ZI.repTier = function(v) { let t = ZI.REP_TIERS[0]; ZI.REP_TIERS.forEach(x => { if (v >= x.min) t = x; }); return t; };
ZI.repApply = function(fid, delta) {
  ZI.getRep(fid);
  const s = ZI.getContractSave();
  let d = Math.max(-ZI.REP_MAX_EVENT, Math.min(ZI.REP_MAX_EVENT, Math.round(delta)));
  if (d < 0) d = Math.round(d * 1.25); // losing standing is faster than gaining it
  let v = Math.max(-1000, Math.min(2500, (s.repByFaction[fid] || 0) + d));
  if (fid === 'lodge') v = Math.max(ZI.LODGE_MIN_REP, v); // the Lodge never goes Hostile
  s.repByFaction[fid] = v; s.repLastOffense = s.repLastOffense || {};
  if (d < 0) s.repLastOffense[fid] = Date.now();
  ZI.saveContractSave(s);
  return v;
};
// Slow forgiveness: negative standing drifts +10/day toward 0 after 2 offense-free days.
ZI.settleRepForgiveness = function() {
  const s = ZI.getContractSave(); const last = s.repForgiveAt || Date.now(); const now = Date.now();
  const days = Math.min(1, (now - last) / 86400000); if (days < 0.01) return;
  (ZI.FACTIONS || []).forEach(f => {
    const v = s.repByFaction[f.id] || 0, off = (s.repLastOffense || {})[f.id] || 0;
    if (v < 0 && now - off > 2 * 86400000) s.repByFaction[f.id] = Math.min(0, Math.round(v + 10 * days));
  });
  s.repForgiveAt = now; ZI.saveContractSave(s);
};
(ZI.CONTRACTS || []).forEach(c => { if (c.faction === 'freeholders') c.faction = 'hearthguard'; }); // 'freeholders' isn't one of the six

// ── Hexagon: each faction strong vs the next clockwise, weak vs the previous ──
ZI.HEX_ORDER = ['ironmarch','dustwalkers','blackhaven','concordance','hearthguard','lodge'];
ZI.HEX_MOD = 15; // ± points of fight/evade odds
ZI.alignedFaction = function() {
  let best = null, bv = -Infinity;
  ZI.HEX_ORDER.forEach(f => { const v = ZI.getRep(f); if (v > bv) { bv = v; best = f; } });
  return best;
};
ZI.hexModifier = function(mine, theirs) {
  const a = ZI.HEX_ORDER.indexOf(mine), b = ZI.HEX_ORDER.indexOf(theirs), n = ZI.HEX_ORDER.length;
  if (a < 0 || b < 0 || a === b) return 0;
  if ((a + 1) % n === b) return ZI.HEX_MOD;
  if ((b + 1) % n === a) return -ZI.HEX_MOD;
  return 0;
};

// ── Skill decay: level-scaled, policy-protected, rust before loss, earned floors ──
ZI.DECAY = { minRate:0.01, maxRate:0.04, rustyOffsetDays:2, rustyEff:0.95, rustedEff:0.90, baselineMult:0.5, absenceCapDays:1, floorStep:10, floorEvents:25 };
ZI.graceDays = function(L) { return L < 15 ? 4 : L < 30 ? 3 : L < 45 ? 2 : 1; };
ZI.getDecay = function() { return ZI._rj('zi_skill_decay', {}); };
ZI.skillDecayState = function(skill) {
  const all = ZI.getDecay();
  return all[skill] || { lastActiveUtc: Date.now(), floorXp: 0, floorProgress: {}, lastSettle: Date.now() };
};
ZI._saveDecay = function(skill, st) { const all = ZI.getDecay(); all[skill] = st; ZI._wj('zi_skill_decay', all); };
ZI.skillIdleDays = function(skill) { return (Date.now() - ZI.skillDecayState(skill).lastActiveUtc) / 86400000; };
ZI.skillRust = function(skill) {
  const L = ZI.statLevel(skill), idle = ZI.skillIdleDays(skill), g = ZI.graceDays(L);
  if (idle <= g) return { state:'fresh', eff:1 };
  if (idle <= g + ZI.DECAY.rustyOffsetDays) return { state:'rusty', eff:ZI.DECAY.rustyEff };
  return { state:'rusted', eff:ZI.DECAY.rustedEff };
};
// Effective level used by gameplay formulas (rust applied).
ZI.effectiveLevel = function(skill) { return Math.max(1, Math.floor(ZI.statLevel(skill) * ZI.skillRust(skill).eff)); };
// Every XP grant stamps the skill as active and progresses its floor.
if (!ZI._decayWrapped) {
  ZI._decayWrapped = true;
  const baseAward = ZI.awardXp;
  ZI.awardXp = function(prof, amount, meta) {
    baseAward(prof, amount, meta);
    if (!prof || !(amount > 0)) return;
    const st = ZI.skillDecayState(prof); st.lastActiveUtc = Date.now();
    const L = ZI.statLevel(prof), tier = Math.floor(L / ZI.DECAY.floorStep) * ZI.DECAY.floorStep;
    if (tier >= ZI.DECAY.floorStep) {
      st.floorProgress[tier] = (st.floorProgress[tier] || 0) + 1;
      if (st.floorProgress[tier] >= ZI.DECAY.floorEvents) {
        const xpAt = prof === 'scavenging' ? ZI._scavCumThreshold(tier) : (50 * tier + 12 * tier * tier);
        st.floorXp = Math.max(st.floorXp || 0, xpAt);
      }
    }
    ZI._saveDecay(prof, st);
  };
}
// Apply decay once per settle, capped to one day of loss per absence.
ZI.settleSkillDecay = function() {
  const x = ZI.getStatXp(); let changed = false; const now = Date.now();
  (ZI.PROFESSIONS || []).forEach(p => {
    const st = ZI.skillDecayState(p.id);
    if (!st.lastSettle) st.lastSettle = now;
    const days = Math.min(ZI.DECAY.absenceCapDays, (now - st.lastSettle) / 86400000);
    if (days < 0.01) return;
    st.lastSettle = now;
    if (ZI.skillRust(p.id).state === 'rusted' && (x[p.id] || 0) > (st.floorXp || 0)) {
      const L = ZI.statLevel(p.id);
      let rate = ZI.DECAY.minRate + (ZI.DECAY.maxRate - ZI.DECAY.minRate) * (L - 1) / 49;
      if (ZI.BASELINE_SKILLS.includes(p.id)) rate *= ZI.DECAY.baselineMult;
      // Base rest spot: a built Bunks slows decay of base-work skills by 25%.
      if (ZI.BASE_WORK_SKILLS.includes(p.id) && ZI.getCampSave && ((ZI.getCampSave().built || {}).bunks || 0) > 0) rate *= 0.75;
      const above = (x[p.id] || 0) - (st.floorXp || 0);
      x[p.id] = Math.round((st.floorXp || 0) + above * (1 - rate * days)); changed = true;
    }
    ZI._saveDecay(p.id, st);
  });
  if (changed) { try { localStorage.setItem(ZI.STAT_XP_KEY, JSON.stringify(x)); } catch (e) {} }
};

// ── The Fort (Heinous unlock): Traversal squares only, 2% + pity ──
ZI.FORT_CHANCE = 0.02; ZI.FORT_PITY_STEP = 0.0025;
ZI.rollFort = function(rng) {
  if (ZI.heinousUnlocked() || ZI._rj('zi_fort_pending', false)) return false;
  if (!(ZI.getTravZone && ZI.getTravZone())) return false;
  const pity = ZI._rj('zi_fort_pity', 0);
  if (rng() < ZI.FORT_CHANCE + pity) { ZI._wj('zi_fort_pity', 0); ZI._wj('zi_fort_pending', true); return true; }
  ZI._wj('zi_fort_pity', pity + ZI.FORT_PITY_STEP); return false;
};
ZI.resolveFort = function(join) {
  ZI._wj('zi_fort_pending', false);
  if (join) { ZI._wj('zi_heinous_unlocked', true); return 'You swear in at the Fort. Heinous policy unlocked.'; }
  return 'You walk away from the Fort. It may find you again.';
};

// ── One shared step: roll + resolve a policy encounter. Live screen = 1 step; offline = many. ──
ZI.wanderPolicyStep = function(rng, ctx) {
  rng = rng || Math.random; ctx = ctx || {};
  // The Fort is now a fixed Traversal site (Hearthguard gate), not a random roll.
  const pol = ZI.getPolicy(), P = ZI.POLICIES[pol.id] || ZI.POLICIES.ethical;
  const pool = ZI.ENCOUNTER_POOLS[P.id] || ZI.ENCOUNTER_POOLS.ethical;
  let r = rng() * pool.reduce((a, e) => a + e.w, 0), e = pool[0];
  for (const x of pool) { r -= x.w; if (r <= 0) { e = x; break; } }
  const lvl = ZI.effectiveLevel(e.checks[0]), lvl2 = ZI.effectiveLevel(e.checks[1]);
  const cmd = ZI.effectiveLevel('command');
  let faction = null, hex = 0, standing = null;
  if (e.kind === 'faction' || e.kind === 'trade' || e.kind === 'raid' || (e.rep && e.rep < 0)) {
    faction = ZI.HEX_ORDER[Math.floor(rng() * ZI.HEX_ORDER.length)];
    hex = ZI.hexModifier(ZI.alignedFaction(), faction);
    standing = ZI.repTier(ZI.getRep(faction));
  }
  let chance = 48 + lvl * 1.1 + lvl2 * 0.4 + hex + (e.kind === 'faction' ? cmd * 0.3 : 0);
  if (standing && (standing.name === 'Hostile' || standing.name === 'Hunted')) chance -= standing.name === 'Hunted' ? 18 : 10;
  if (P.id === 'heinous') chance += 6; // brute force
  chance = Math.max(10, Math.min(95, Math.round(chance)));
  const ok = rng() * 100 < chance;
  const scale = ok ? 1 : 0.4;
  ZI.emitAction && ZI.emitAction('enc.' + e.id, scale, { encounter: e.id });
  ZI.emitAction && ZI.emitAction('enc.baseline', 1);
  const fName = faction ? ((ZI.FACTIONS.find(f => f.id === faction) || {}).name || faction) : null;
  let repTxt = '';
  if (faction && e.rep) {
    const d = ok ? e.rep : Math.round(e.rep * (e.rep < 0 ? 1 : 0.3));
    if (P.id === 'heinous') ZI.HEX_ORDER.forEach(f => ZI.repApply(f, f === faction ? d : -6)); else ZI.repApply(faction, d);
    // Event-driven rivalry: helping one faction costs standing with its hexagon rival.
    if (d > 0) { const i = ZI.HEX_ORDER.indexOf(faction); ZI.repApply(ZI.HEX_ORDER[(i + 5) % 6], -Math.ceil(d / 2)); }
    repTxt = ` · ${fName} ${d >= 0 ? '+' : ''}${d} rep`;
  }
  const lootMult = { ethical:0.8, immoral:1, criminal:1.25, heinous:1.8 }[P.id] || 1;
  const loot = ok && (e.kind === 'loot' || e.kind === 'raid' || e.kind === 'trade')
    ? { name: e.name.replace(/ \(.*\)$/, '') + ' haul', value: Math.max(2, Math.round((6 + lvl * 0.6) * lootMult)), rarity: rng() < 0.12 * lootMult ? 'Uncommon' : 'Common' } : null;
  const dmg = ok ? 0 : Math.round(4 + rng() * 8 + (e.kind === 'raid' || e.kind === 'faction' ? 6 : 0));
  const how = e.kind === 'zombie' ? (P.resolve === 'evade' ? 'evaded' : 'cut down') : ok ? 'handled' : 'botched';
  const text = `${P.icon} ${e.name}${fName ? ` (${fName}${hex ? `, hexagon ${hex > 0 ? '+' : ''}${hex}%` : ''})` : ''} — ${ok ? 'success' : 'failed'} (${chance}%): ${how}${loot ? `, +${loot.name}` : ''}${dmg ? `, took ${dmg} dmg` : ''} · ${e.checks[0]} XP${repTxt}`;
  return { ok, encounter:e, chance, loot, dmg, faction, text, tone: ok ? 'player' : 'enemy' };
};
// ═══ FIRST FORT (Hearthguard gate), FALLOW GROUND, FACTIONS GATE (Fort brief §10–11) ═══
ZI.CELL_CLEAR_KILLS = 40;
ZI.FORT_FACTION = 'hearthguard';
// Kills are credited to whichever Traversal cell the survivor is standing in.
ZI.getCellKills = function() { return ZI._rj('zi_cell_kills', {}); };
ZI.addCellKill = function(n) {
  const z = ZI.getTravZone && ZI.getTravZone(); if (!z || z.gx == null) return;
  const k = z.gx + ',' + z.gy, m = ZI.getCellKills(); m[k] = (m[k] || 0) + (n || 1); ZI._wj('zi_cell_kills', m);
  const q = ZI.getFallowQuest();
  if (q.state === 'active' && q.cell && q.cell.gx === z.gx && q.cell.gy === z.gy && m[k] - (q.baseKills || 0) >= ZI.CELL_CLEAR_KILLS) {
    q.state = 'ready'; ZI._wj('zi_quest_fallow_ground', q);
  }
};
if (!ZI._killWrapped) {
  ZI._killWrapped = true;
  const baseEmit = ZI.emitAction;
  ZI.emitAction = function(id, scale, meta) { baseEmit(id, scale, meta); if (id === 'kill') ZI.addCellKill(1); };
}
// Guaranteed placement: an open cell 2–3 cells from the start, chosen from the world seed; Fallow Ground next to it.
ZI.getFortPos = function() {
  let f = ZI._rj('zi_fort1_pos', null); if (f) return f;
  const start = ZI._rj('zi_trav_start', null) || ZI._rj('zi_trav_pos', null);
  if (!start || start.gx == null) return null;
  const ok = (c) => c && c.state !== 'locked' && c.state !== 'contested';
  const ring = [];
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
    const d = Math.max(Math.abs(dx), Math.abs(dy)); if (d < 2) continue;
    const c = ZI.worldCell(start.gx + dx, start.gy + dy, 'scavenge'); if (ok(c)) ring.push(c);
  }
  if (!ring.length) return null;
  const pick = ring[(ZI.worldSeed() >>> 0) % ring.length];
  const near = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue;
    const c = ZI.worldCell(pick.gx + dx, pick.gy + dy, 'scavenge');
    if (ok(c) && !(c.gx === start.gx && c.gy === start.gy)) near.push(c);
  }
  const fal = near[(ZI.worldSeed() >>> 3) % Math.max(1, near.length)] || pick;
  f = { gx:pick.gx, gy:pick.gy, sx:pick.sx, sy:pick.sy, row:pick.row, col:pick.col, coord:pick.coord,
        fallow:{ gx:fal.gx, gy:fal.gy, sx:fal.sx, sy:fal.sy, row:fal.row, col:fal.col, coord:fal.coord } };
  ZI._wj('zi_fort1_pos', f);
  return f;
};
// A Traversal cell is 'cleared' once it has CELL_CLEAR_KILLS kills (same counter the Fallow Ground quest reads).
ZI.isCellCleared = function(gx, gy) { return (ZI.getCellKills()[gx + ',' + gy] || 0) >= ZI.CELL_CLEAR_KILLS; };
// Familiarity for the Wandering stress system: 'cleared' | 'explored' | 'unexplored'.
ZI.cellFamiliarity = function(gx, gy) {
  if (ZI.isCellCleared(gx, gy)) return 'cleared';
  const C = ZI.SECTOR_COLS, R = ZI.SECTOR_ROWS;
  return ZI.getExploredSectors().includes(Math.floor(gx / C) + ',' + Math.floor(gy / R)) ? 'explored' : 'unexplored';
};
ZI.isFortCell = function(c) { const f = ZI.getFortPos(); return !!(f && c && c.gx === f.gx && c.gy === f.gy); };
ZI.isFallowCell = function(c) { const f = ZI.getFortPos(); return !!(f && c && f.fallow && c.gx === f.fallow.gx && c.gy === f.fallow.gy); };
ZI.getFallowQuest = function() { return ZI._rj('zi_quest_fallow_ground', { state:'none' }); };
ZI.fallowProgress = function() {
  const q = ZI.getFallowQuest(); if (!q.cell) return 0;
  const k = q.cell.gx + ',' + q.cell.gy; return Math.min(ZI.CELL_CLEAR_KILLS, (ZI.getCellKills()[k] || 0) - (q.baseKills || 0));
};
ZI.factionsUnlocked = function() { return ZI._rj('zi_factions_unlocked', null); }; // null | 'friendly' | 'hostile'
// The starter med kit (the offering the Hearthguard want).
ZI.ensureStarterKit = function() {
  if (ZI._rj('zi_fort_starter_given', false)) return;
  ZI._wj('zi_fort_starter_given', true);
  ZI.grantGear && ZI.grantGear('medkit', 1);
};
ZI.hasMedKit = function() {
  if ((ZI.getStash ? ZI.getStash() : []).includes('medkit')) return true;
  const lo = ZI.getLoadout ? ZI.getLoadout() : {}; return Object.values(lo).includes('medkit');
};
ZI.takeMedKit = function() {
  const st = ZI.getStash(); const i = st.indexOf('medkit');
  if (i >= 0) { st.splice(i, 1); ZI.saveStash(st); return true; }
  const lo = ZI.getLoadout(); const slot = Object.keys(lo).find(k => lo[k] === 'medkit');
  if (slot) { lo[slot] = null; ZI.saveLoadout(lo); return true; }
  return false;
};
// Lasting injury from the attack: −10% effective level on combat & athletics, ~3 days or treatment.
ZI.getInjury = function() { const j = ZI._rj('zi_injury', null); return j && j.until > Date.now() ? j : null; };
ZI.setInjury = function(days) { ZI._wj('zi_injury', { skills:['combat','athletics'], pct:0.10, until: Date.now() + days * 86400000 }); };
ZI.treatInjury = function(days) { const j = ZI.getInjury(); if (!j) return; j.until -= days * 86400000; ZI._wj('zi_injury', j); };
// Rust + injury combined never exceed −20% (spec 13.8).
ZI.effectiveLevel = function(skill) {
  let eff = ZI.skillRust(skill).eff;
  const j = ZI.getInjury(); if (j && j.skills.includes(skill)) eff -= j.pct;
  return Math.max(1, Math.floor(ZI.statLevel(skill) * Math.max(0.8, eff)));
};
// Gate actions. Each returns { ok, tone, text, next } for the scene.
ZI.fortTone = function() {
  return { ethical:"You don't look like a raider. Show me what you carry.", immoral:'Keep your hands where I can see them.',
           criminal:'We know your kind. What are you selling?', heinous:'Not here. Move on.' }[ZI.getPolicy().id];
};
ZI.fortStartQuest = function(harder) {
  const f = ZI.getFortPos(); const k = f.fallow.gx + ',' + f.fallow.gy;
  ZI._wj('zi_quest_fallow_ground', { state:'active', cell:f.fallow, baseKills: ZI.getCellKills()[k] || 0, harder: !!harder, at: Date.now() });
};
ZI.fortOffer = function() {
  if (!ZI.takeMedKit()) return { ok:false, tone:'warn', text:'"Medicine. Bring medicine." You have no med kit to give — craft one, or talk your way in.' };
  ZI.getRep(ZI.FORT_FACTION); ZI.repApply(ZI.FORT_FACTION, 20);
  ZI.fortStartQuest(false);
  return { ok:true, tone:'good', text:'The guard turns the kit over in their hands and nods. The gate opens a crack. The elder hears you out.', next:'offer' };
};
ZI.fortCheckChance = function(skill) {
  const pol = ZI.getPolicy().id;
  const mod = { ethical:15, immoral:0, criminal:-10, heinous:-40 }[pol] || 0;
  return Math.max(10, Math.min(90, Math.round(30 + ZI.effectiveLevel(skill) * 2.5 + mod)));
};
ZI.fortCheck = function(skill) {
  const ch = ZI.fortCheckChance(skill), roll = Math.floor(Math.random() * 100) + 1;
  ZI.emitAction && ZI.emitAction(skill === 'diplomat' ? 'faction' : 'enc.convoy', 1);
  if (roll <= ch) { ZI.fortStartQuest(true); return { ok:true, tone:'good', text:`${skill === 'diplomat' ? 'You read the guard and ask for terms' : 'You hold your ground and do not blink'} (${ch}%, rolled ${roll}). "Fine. The elder will see you — but you'll earn it."`, next:'offer' }; }
  return { ok:false, tone:'warn', text:`It doesn't land (${ch}%, rolled ${roll}). "Come back with something we need." You can try again.` };
};
ZI.fortAttackChance = function() { return Math.max(15, Math.min(85, Math.round(35 + ZI.effectiveLevel('combat') * 1.5))); };
ZI.fortAttack = function() {
  const ch = ZI.fortAttackChance(), roll = Math.floor(Math.random() * 100) + 1;
  ZI.emitAction && ZI.emitAction('kill', 1.5);
  if (roll <= ch) {
    ZI._wj('zi_heinous_unlocked', true);
    ZI.getRep(ZI.FORT_FACTION);
    const s = ZI.getContractSave(); s.repByFaction[ZI.FORT_FACTION] = -400; ZI.saveContractSave(s);
    ZI._wj('zi_factions_unlocked', 'hostile');
    ZI._wj('zi_fort_hostile', true);
    return { ok:true, tone:'warn', text:`The guard falls (${ch}%, rolled ${roll}). A horn sounds across the fields. HEINOUS UNLOCKED. The Hearthguard are now Hostile — the Hearthbound Lodge will still trade with you.`, next:'done' };
  }
  const run = ZI.getWanderRun ? ZI.getWanderRun() : { hp:100 };
  const hp = Math.max(1, (run.hp == null ? 100 : run.hp) - 28);
  ZI.syncWanderState && ZI.syncWanderState({ hp });
  ZI.setInjury(3);
  return { ok:false, tone:'warn', text:`You are wounded and driven from the pikes (${ch}%, rolled ${roll}). HP ${hp}/100. A lasting injury: −10% combat and athletics for ~3 days (making camp speeds healing).` };
};
ZI.fortTurnIn = function() {
  const q = ZI.getFallowQuest(); if (q.state !== 'ready') return { ok:false, tone:'warn', text:'"The south field is still crawling. Finish the job."' };
  q.state = 'done'; q.doneAt = Date.now(); ZI._wj('zi_quest_fallow_ground', q);
  ZI.repApply(ZI.FORT_FACTION, 50);
  ZI._wj('zi_factions_unlocked', 'friendly');
  ZI.grantGear && ZI.grantGear('medkit', 1);
  ZI.emitAction && ZI.emitAction('contract.complete', 1, { faction: ZI.FORT_FACTION });
  return { ok:true, tone:'good', text:'The elder walks the cleared field with you. "Good ground. We\'ll plant by spring." They return a med kit and speak of other groups beyond the ridge. FACTIONS UNLOCKED.', next:'done' };
};

ZI.settleSkillDecay(); ZI.settleRepForgiveness();

ZI.WanderEngine = {
  timer: null,
  start() {
    if (this.timer) return;
    this.timer = setInterval(() => { try { this.tick(); } catch (e) {} }, 1000);
  },
  tick() {
    const s = ZI.getWanderRun();
    const now = Date.now();
    if (!s.active) { s.lastTickAt = now; ZI.saveWanderRun(s); return; }
    // Screen is mounted → React is the authority; just keep the clock fresh.
    if (ZI.wanderMounted) { s.lastTickAt = now; ZI.saveWanderRun(s); return; }
    // Headless advance covering wall-clock elapsed (capped to 24h offline catch-up, §2).
    let dt = s.lastTickAt ? (now - s.lastTickAt) / 1000 : 1;
    dt = Math.max(0, Math.min(86400, dt));
    s.lastTickAt = now;
    if (dt < 0.25 || s.paused) { ZI.saveWanderRun(s); return; }

    const away = s.awaySummary || { kills: 0, xp: 0, mats: 0, dist: 0, secs: 0 };
    // Movement.
    const adv = (s.moveSpeed || 3) * dt;
    s.scroll += adv; away.dist += adv; away.secs += dt;
    // Checkpoints crossed.
    let cp = Math.floor(s.scroll / ZI.CHECKPOINT_EVERY);
    const lastCp = Math.floor((s.lastCheckpoint || 0) / ZI.CHECKPOINT_EVERY);
    if (cp > lastCp) {
      for (let i = lastCp + 1; i <= cp; i++) {
        ZI.addCheckpoint(i * ZI.CHECKPOINT_EVERY);
        const car = ZI.tryDiscoverVehicle && ZI.tryDiscoverVehicle();
        if (car) away.vehicle = car.name;
      }
      const fresh = ZI.getWanderRun();
      s.checkpoints = fresh.checkpoints; s.lastCheckpoint = fresh.lastCheckpoint;
    }
    // Encounters: one resolved fight roughly every 6 seconds of travel.
    s._encAccum = (s._encAccum || 0) + dt;
    let safety = 0;
    while (s._encAccum >= 6 && s.hp > 0 && safety < 200) {
      s._encAccum -= 6; safety++;
      const z = ZI._bgZombie(Math.floor(s.scroll / 100));
      // Evade stance honored offline: roll to skip the fight (no kill, no loot).
      if (ZI.policyEvades() && ZI.STAT_FORMULAS) {
        const sLvl = ZI.effectiveLevel('stealth');
        const chance = ZI.STAT_FORMULAS.escapeChance(sLvl, s.athletics || 6, s.moveSpeed ? Math.round(s.moveSpeed / 0.03) : 100, z);
        if (chance > 0 && Math.random() * 100 < chance) {
          if (ZI.emitAction) ZI.emitAction('wander.escape', 1, { enemy: z.name });
          away.escapes = (away.escapes || 0) + 1;
          continue; // slipped past — no damage, no kill
        }
      }
      // Resolve the fight through the shared combat model.
      const sb = ZI.STAT_FORMULAS.survivorStatBlock({ displayHP: s.hp, armorRating: 0, weaponDamage: s.weaponDamage || 10, speed: s.moveSpeed ? Math.round(s.moveSpeed / 0.03) : 100 });
      sb.hp = s.hp; sb.hpMax = 100;
      const eb = ZI.STAT_FORMULAS.enemyStatBlock(z);
      const res = ZI.simulateCombat(sb, eb, 'idle');
      s.hp = res.hpLeft;
      if (res.outcome !== 'win') {
        // Auto-heal if any heals remain, else hold position (survivor takes cover).
        if (s.healsUsed < s.maxHeals) {
          s.healsUsed++; s.hp = Math.min(100, 1 + Math.round(s.healPct));
        } else {
          // Idle keeps idling: fall back to base, rest to full, and resume the patrol.
          s.hp = 100; s.healsUsed = 0; away.retreats = (away.retreats || 0) + 1;
          continue;
        }
      }
      // Win the fight.
      s.kills++; s.xp += z.xp; const m = 2 + Math.floor(Math.random() * 4); s.mats += m;
      away.kills++; away.xp += z.xp; away.mats += m;
      if (ZI.emitAction) { ZI.emitAction('kill', (z.xp || 10) / 10); ZI.emitAction('loot', 1); } // one XP path
      // Away from camp: loot rides in the survivor's pack until they return to base.
      s.carried = (s.carried || []).concat([{ name: z.name + ' salvage', value: Math.max(1, z.xp), rarity: 'Common' }]);
      away.loot = (away.loot || 0) + 1;
      // Top up when low and heals remain.
      if (s.hp < 30 && s.healsUsed < s.maxHeals) {
        s.healsUsed++; s.hp = Math.min(100, s.hp + Math.round(s.healPct));
      }
    }
    // Policy encounters (same step the live screen uses), ~every 30 s of travel.
    s._polAccum = (s._polAccum || 0) + dt;
    let pSafe = 0;
    while (s._polAccum >= 30 && pSafe < 200) {
      s._polAccum -= 30; pSafe++;
      const r = ZI.wanderPolicyStep(Math.random);
      if (r.fort) { away.fort = true; break; }
      if (r.dmg) s.hp = Math.max(1, s.hp - r.dmg);
      if (r.loot) s.carried = (s.carried || []).concat([r.loot]);
      away.events = (away.events || 0) + 1;
      away.eventLog = (away.eventLog || []).concat([r.text]).slice(-4);
    }
    s.awaySummary = away;
    ZI.saveWanderRun(s);
  },
};
ZI.WanderEngine.start();




ZI.NUTRITION = {
  levels: [
    { label: 'Starving',    min: 0,  max: 15,  staminaMod: -0.40, regenMod: -0.50, color: '#e0624c' },
    { label: 'Hungry',      min: 15, max: 35,  staminaMod: -0.20, regenMod: -0.25, color: '#f08a52' },
    { label: 'Underfed',    min: 35, max: 50,  staminaMod: -0.08, regenMod: -0.10, color: '#e6c47e' },
    { label: 'Fed',         min: 50, max: 65,  staminaMod:  0.00, regenMod:  0.00, color: '#a2dca2' },
    { label: 'Well Fed',    min: 65, max: 80,  staminaMod: +0.10, regenMod: +0.12, color: '#62d69a' },
    { label: 'Nourished',   min: 80, max: 92,  staminaMod: +0.18, regenMod: +0.20, color: '#74b6ee' },
    { label: 'Peak Fueled', min: 92, max: 100, staminaMod: +0.28, regenMod: +0.30, color: '#c894ff' },
  ],
  hydration: [
    { label: 'Dehydrated',  min: 0,  max: 20,  staminaMod: -0.30, color: '#e0624c' },
    { label: 'Thirsty',     min: 20, max: 45,  staminaMod: -0.12, color: '#e6c47e' },
    { label: 'Hydrated',    min: 45, max: 70,  staminaMod:  0.00, color: '#a2dca2' },
    { label: 'Well Hydrated', min: 70, max: 88, staminaMod: +0.08, color: '#74b6ee' },
    { label: 'Optimal',     min: 88, max: 100, staminaMod: +0.15, color: '#c894ff' },
  ],
};

// ─── ROUTES ──────────────────────────────────────────────────────────────────
ZI.ROUTES = [
  { id: 'rt_cabin',    name: 'Hilltop Cabins',       biome: 'mountain',  duration: 2,  risk: 1, rmatTier: 0,
    nodes: ['Departure','Forest Trail','Abandoned Cabin','Extraction'], reward: 'Wood, Herbs, Scrap' },
  { id: 'rt_suburb1',  name: 'Crestwood Drive',       biome: 'suburbia',  duration: 4,  risk: 2, rmatTier: 1,
    nodes: ['Departure','Residential Zone','Convenience Store','Vehicle Cache','Extraction'], reward: 'Electronics, Packaged Food, Tier-1 RMAT' },
  { id: 'rt_suburb2',  name: 'Industrial Row',        biome: 'suburbia',  duration: 5,  risk: 2, rmatTier: 1,
    nodes: ['Departure','Warehouse District','Factory Floor','Roof Cache','Extraction'], reward: 'Scrap Metal, Wiring, Tier-1 RMAT' },
  { id: 'rt_metro1',   name: 'Downtown Grid',         biome: 'metro',     duration: 8,  risk: 3, rmatTier: 2,
    nodes: ['Departure','Street Level','Metro Tunnels','Office Tower','Extraction'], reward: 'Batteries, Copper, Tier-2 RMAT' },
  { id: 'rt_metro2',   name: 'Vertical Wasteland',    biome: 'metro',     duration: 10, risk: 4, rmatTier: 3,
    nodes: ['Departure','Access Road','Subway Nexus','Skyscraper Core','Anomaly Node','Extraction'], reward: 'Industrial Steel, Tier-3 RMAT, Blueprint' },
  { id: 'rt_perim1',   name: 'Perimeter Alpha Zone',  biome: 'perimeter', duration: 14, risk: 5, rmatTier: 4,
    nodes: ['Departure','Radiation Fields','CDC Ruins','Anomaly Cluster','Tier-4 Deposit','Extraction'], reward: 'Tier-4 RMAT, Corrupted Cores, Exotic Fragments' },
  { id: 'rt_perim2',   name: 'Echo Chamber Depth',    biome: 'perimeter', duration: 18, risk: 5, rmatTier: 5,
    nodes: ['Departure','Corrosive Corridor','Temporal Rift','Alpha Den','Echo Chamber','Apex Deposit','Extraction'], reward: 'Tier-5 RMAT Echo, Anomalous Tissue, Legendary Drops' },
];

// ─── ROUTES: canonical RMAT label + expanded card metadata (Routes spec) ─────
// Canonical tier vocabulary shared by biome header, route card, last-run.
ZI.rmatLabel = function(tier) {
  const t = ZI.RMAT_TIERS[tier]; if (!t) return `RMAT T${tier}`;
  return `RMAT T${tier} (${(t.rarity || '').toLowerCase()})`;
};
// Classify a node name into a type so the chain UI can pick an icon + danger color.
ZI.routeNodeType = function(name) {
  const n = (name || '').toLowerCase();
  if (/depart|start/.test(n)) return 'start';
  if (/extraction|extract/.test(n)) return 'extraction';
  if (/vehicle|cache|garage|car/.test(n)) return 'vehicle';
  if (/anomaly|rift|radiation|corrosive|temporal|collapse|den|alpha/.test(n)) return 'hazard';
  if (/loot|deposit|store|cache|chamber|vault|roof/.test(n)) return 'loot';
  return 'combat';
};
ZI.NODE_META = {
  start:      { icon:'▶', label:'Departure',  color:'#6b8f71' },
  combat:     { icon:'⚔', label:'Combat',     color:'#e6c47e' },
  loot:       { icon:'◈', label:'Loot Cache', color:'#7aa8f0' },
  hazard:     { icon:'⚠', label:'Hazard',     color:'#f06a5a' },
  vehicle:    { icon:'⛽', label:'Vehicle',    color:'#b48cf0' },
  extraction: { icon:'⚑', label:'Extraction', color:'#3dcf8e' },
};
// Per-route expanded card data (loot examples, recommended level, squad size, vehicle wear).
(function(){
  const lootByTier = {
    0: ['Wood x8–15','Herbs x3–6','Scrap x4–10'],
    1: ['RMAT T1 x2–4','Electronics x3–8','Scrap x8–15'],
    2: ['RMAT T2 x1–3','Copper x5–12','Blueprint (rare)'],
    3: ['RMAT T3 x1–2','Industrial Steel x4–9','Blueprint (rare)'],
    4: ['RMAT T4 x1–2','Corrupted Cores x2–4','Exotic Fragment (epic)'],
    5: ['RMAT T5 x1','Anomalous Tissue x1–3','Legendary Drop (legendary)'],
  };
  ZI.ROUTES.forEach(r => {
    r.lootRange   = lootByTier[r.rmatTier] || lootByTier[0];
    r.recLevel    = Math.max(1, r.risk * 5 - 3);          // rec survivor level
    r.squadMin    = 1;
    r.squadMax    = Math.min(4, 1 + Math.floor(r.risk / 2)); // tougher routes allow bigger squads
    r.hasVehicle  = r.nodes.some(n => ZI.routeNodeType(n) === 'vehicle');
    r.vehicleWear = r.hasVehicle ? Math.round(8 + r.risk * 4) : 0; // % condition loss
    r.staminaCost = r.duration * 8;
  });
})();

// Squad roster surfaced on the Routes screen (Change 3).
ZI.SQUAD_ROSTER = [
  { id:'sv_wanderer', name:'The Wanderer', level:14, cls:'Ranger',   hp:100, stamina:78 },
  { id:'sv_mason',    name:'Mason Cole',   level:11, cls:'Enforcer', hp:120, stamina:64 },
  { id:'sv_riza',     name:'Riza Vant',    level:9,  cls:'Scout',    hp:80,  stamina:90 },
  { id:'sv_doc',      name:'Doc Hollis',   level:12, cls:'Medic',    hp:90,  stamina:70 },
  { id:'sv_kade',     name:'Kade Mercer',  level:7,  cls:'Chemist',  hp:75,  stamina:82 },
];
// Last completed run summary (read by the Routes Last Run panel; written on run completion).
ZI.LAST_RUN_KEY = 'zi_last_run';
ZI.getLastRun = function() {
  try { return JSON.parse(localStorage.getItem(ZI.LAST_RUN_KEY) || 'null'); } catch (e) { return null; }
};
// ─── WORKING VEHICLE (unlocks Cargo Unloading after route runs) ──────────────
// Found by chance at Wandering checkpoints. Until then, route deploys skip the
// Unloading Cargo screen.
ZI.VEHICLE_KEY = 'zi_vehicle';
ZI.VEHICLE_FIND_CHANCE = 0.2; // per checkpoint reached
ZI.VEHICLE_NAMES = ['Rusted Pickup', 'Salvaged Hatchback', 'Battered Van', 'Old Sedan', 'Farm Truck'];
ZI.getVehicle = function() { try { return JSON.parse(localStorage.getItem(ZI.VEHICLE_KEY) || 'null'); } catch (e) { return null; } };
ZI.hasWorkingVehicle = function() { const v = ZI.getVehicle(); return !!(v && v.found); };
// Roll for a working car. Returns the vehicle if newly found this call, else null.
ZI.tryDiscoverVehicle = function() {
  if (ZI.hasWorkingVehicle()) return null;
  if (Math.random() >= ZI.VEHICLE_FIND_CHANCE) return null;
  const v = { found: true, name: ZI.VEHICLE_NAMES[Math.floor(Math.random() * ZI.VEHICLE_NAMES.length)], at: Date.now() };
  try { localStorage.setItem(ZI.VEHICLE_KEY, JSON.stringify(v)); } catch (e) {}
  if (ZI.emitAction) ZI.emitAction('discover', 1);
  return v;
};

// ─── POINT-OF-INTEREST FAMILIARITY (visits reveal loot intel on route nodes) ─
// Every time a route run passes a node, that POI gains a visit. Enough visits
// unlock more detail in the node's hover box.
ZI.POI_VISIT_KEY = 'zi_poi_visits';
ZI.POI_TIERS = [
  { min:0,  label:'Unexplored', color:'#a39478' },
  { min:1,  label:'Scouted',    color:'#cbbd9f' },
  { min:3,  label:'Familiar',   color:'#74b6ee' },
  { min:6,  label:'Known',      color:'#62d69a' },
  { min:10, label:'Mastered',   color:'#e6c47e' },
];
ZI.poiKey = function(routeId, idx) { return routeId + ':' + idx; };
ZI.getPoiVisits = function() { try { return JSON.parse(localStorage.getItem(ZI.POI_VISIT_KEY) || '{}') || {}; } catch (e) { return {}; } };
ZI.poiVisits = function(routeId, idx) { return ZI.getPoiVisits()[ZI.poiKey(routeId, idx)] || 0; };
ZI.addPoiVisits = function(routeId, count) {
  const v = ZI.getPoiVisits();
  for (let i = 0; i < count; i++) { const k = ZI.poiKey(routeId, i); v[k] = (v[k] || 0) + 1; }
  try { localStorage.setItem(ZI.POI_VISIT_KEY, JSON.stringify(v)); } catch (e) {}
};
ZI.poiTier = function(visits) {
  let t = ZI.POI_TIERS[0], next = null;
  for (let i = 0; i < ZI.POI_TIERS.length; i++) {
    if (visits >= ZI.POI_TIERS[i].min) { t = ZI.POI_TIERS[i]; next = ZI.POI_TIERS[i + 1] || null; }
  }
  return { tier: t, next, index: ZI.POI_TIERS.indexOf(t) };
};
// Loot intel per node type: categories (Familiar), item examples (Known), rare find (Mastered).
ZI.POI_LOOT = {
  start:      { categories:['Camp stores'], items:[], rare:null },
  combat:     { categories:['Zombie remains', 'Scrap', 'RMAT trace'],
                items:[{ n:'Cloth scraps', t:0 }, { n:'Scrap metal', t:0 }, { n:'Ammo cache', t:1 }, { n:'RMAT residue', t:1 }],
                rare:{ n:'Weapon parts', t:3, chance:4 } },
  loot:       { categories:['Containers', 'Food & medical', 'Electronics'],
                items:[{ n:'Canned food', t:0 }, { n:'Bandage roll', t:0 }, { n:'Circuit board', t:1 }, { n:'Medkit', t:2 }],
                rare:{ n:'Blueprint', t:3, chance:6 } },
  hazard:     { categories:['Chemicals', 'Irradiated salvage'],
                items:[{ n:'Chem residue', t:1 }, { n:'Fuel sludge', t:1 }, { n:'Contaminated tech', t:2 }],
                rare:{ n:'Higher-tier RMAT', t:4, chance:5 } },
  vehicle:    { categories:['Fuel', 'Car parts', 'Metal'],
                items:[{ n:'Fuel can', t:0 }, { n:'Car battery', t:1 }, { n:'Tire & rims', t:0 }, { n:'Wiring harness', t:1 }],
                rare:{ n:'Engine block', t:3, chance:3 } },
  extraction: { categories:['Supply drops', 'Mixed salvage'],
                items:[{ n:'Mixed salvage', t:0 }, { n:'Trade goods', t:1 }],
                rare:{ n:'Faction cache', t:3, chance:4 } },
};

ZI.setLastRun = function(summary) {
  try { localStorage.setItem(ZI.LAST_RUN_KEY, JSON.stringify(summary)); } catch (e) {}
};

// ─── LIVE ROUTE RUNS (continuous progress along the node chain) ──────────────
// A route run takes route.duration in-game hours. The game clock runs at
// 10 in-game minutes per real second, so 1 in-game hour = 6 real seconds.
ZI.ROUTE_RUN_KEY = 'zi_route_runs';
ZI.GAME_HOUR_MS = 6000;
ZI._readRouteRuns = function() {
  try { return JSON.parse(localStorage.getItem(ZI.ROUTE_RUN_KEY) || '{}') || {}; } catch (e) { return {}; }
};
ZI._saveRouteRuns = function(r) { try { localStorage.setItem(ZI.ROUTE_RUN_KEY, JSON.stringify(r)); } catch (e) {} };
ZI.startRouteRun = function(route, squadIds, mode, threatLevel, autoRepeat) {
  if (!route) return;
  const runs = ZI._readRouteRuns();
  runs[route.id] = { startedAt: Date.now(), durationMs: Math.max(1, route.duration) * ZI.GAME_HOUR_MS,
    squadIds: (squadIds || []).slice(), mode, threatLevel: threatLevel || 0, autoRepeat: !!autoRepeat };
  ZI._saveRouteRuns(runs);
};
ZI.setRouteRunRepeat = function(routeId, on) {
  const runs = ZI._readRouteRuns();
  if (runs[routeId]) { runs[routeId].autoRepeat = !!on; ZI._saveRouteRuns(runs); }
};
// Settle-on-read: finished runs resolve into Last Run; auto-repeat restarts them
// from their finish time so offline repeats chain correctly.
ZI.settleRouteRuns = function() {
  const runs = ZI._readRouteRuns(); const now = Date.now(); let changed = false;
  Object.entries(runs).forEach(([id, r]) => {
    const route = (ZI.ROUTES || []).find(x => x.id === id);
    if (!route) { delete runs[id]; changed = true; return; }
    let guard = 0;
    while (runs[id] && now >= runs[id].startedAt + runs[id].durationMs && guard < 50) {
      guard++; changed = true;
      const done = runs[id];
      ZI.completeRun(route, done.squadIds, done.mode, done.threatLevel);
      if (done.autoRepeat) runs[id] = Object.assign({}, done, { startedAt: done.startedAt + done.durationMs });
      else delete runs[id];
    }
  });
  if (changed) ZI._saveRouteRuns(runs);
  return runs;
};
// Live progress for one route: null if not running.
ZI.routeRunProgress = function(routeId) {
  const r = ZI.settleRouteRuns()[routeId];
  if (!r) return null;
  const elapsed = Math.max(0, Date.now() - r.startedAt);
  return { pct: Math.min(1, elapsed / r.durationMs), remainingMs: Math.max(0, r.durationMs - elapsed),
    elapsedMs: elapsed, durationMs: r.durationMs, autoRepeat: r.autoRepeat, mode: r.mode };
};

// ─── HOOK 3 — Success Probability formula ────────────────────────────────────
// Aggregate squad strength vs. route difficulty + global threat. Cheap enough
// to recompute live as the player toggles squad members.
// Fixed success chance per biome tier — a set number, not a live/random estimate
// (the previous Monte-Carlo roll re-randomised every render, so the meter flickered).
// Keyed by biome danger rating; tunable here as a single balance table.
ZI.BIOME_SUCCESS = { 1: 85, 2: 65, 3: 45, 4: 30, 5: 20 };
ZI.estimateSuccessProbability = function(route) {
  if (!route) return 0;
  const biome = (ZI.BIOMES || []).find(b => b.id === route.biome);
  const danger = biome ? biome.danger : (route.risk || 1);
  return ZI.BIOME_SUCCESS[danger] != null ? ZI.BIOME_SUCCESS[danger] : 50;
};
ZI.riskBand = function(prob) {
  return prob >= 75 ? { label:'Favorable', color:'#3dcf8e' }
       : prob >= 50 ? { label:'Even',      color:'#d9b94a' }
       : prob >= 30 ? { label:'Risky',     color:'#d98a4a' }
       :              { label:'Deadly',    color:'#f06a5a' };
};

// ─── HOOK 2 — Per-node auto-resolution engine ───────────────────────────────
// Walks the route's node chain and resolves each by type, accumulating loot,
// vehicle wear and losses. Idle mode applies the standard ×0.7 loot penalty.
// Active mode resolves at full value (the live monitoring is the UI scaffold).
ZI.resolveRunNodes = function(route, squadIds, mode, threatLevel) {
  const prob = ZI.estimateSuccessProbability(route, squadIds, threatLevel);
  const lootMult = mode === 'passive' ? 0.7 : 1.0;
  const log = [];
  let loot = 0, vehicleWear = 0, losses = null;
  const matName = ['Trace RMAT','Scrap','Electronics','Copper','Cores','Echo'][route.rmatTier] || 'Salvage';
  for (const node of route.nodes) {
    const type = ZI.routeNodeType(node);
    if (type === 'combat') {
      const won = Math.random() * 100 < prob;
      if (won) { const g = 3 + Math.floor(Math.random() * route.rmatTier * 3 + 4); loot += g; log.push({ node, type, text:`Cleared — +${g} salvage` }); }
      else { log.push({ node, type, text:`Overrun — took injuries` }); if (!losses) losses = 'Survivor injured'; }
    } else if (type === 'loot') {
      const g = Math.round((6 + Math.random() * (route.rmatTier * 5 + 6)) * lootMult);
      loot += g; log.push({ node, type, text:`Looted +${g} ${matName}` });
    } else if (type === 'hazard') {
      const dmg = Math.round(route.risk * 3 * Math.random());
      log.push({ node, type, text:`Hazard — ${dmg ? `lost ${dmg} salvage` : 'avoided'}` });
      loot = Math.max(0, loot - dmg);
    } else if (type === 'vehicle') {
      if (ZI.hasWorkingVehicle && ZI.hasWorkingVehicle()) {
        vehicleWear += route.vehicleWear || 10;
        log.push({ node, type, text:`Vehicle checkpoint — −${route.vehicleWear || 10}% condition` });
      } else {
        log.push({ node, type, text:`Abandoned vehicles — nothing drivable here` });
      }
    } else if (type === 'extraction') {
      loot = Math.round(loot * lootMult);
      log.push({ node, type, text:`Extracted with ${loot} loot` });
    } else {
      log.push({ node, type, text:`Departed` });
    }
  }
  return { prob, loot, vehicleWear, losses, log };
};

// ─── HOOK 1 — Run completion → Last Run + Claim + Send Again ─────────────────
// Resolves a run, writes the Last Run summary (unclaimed), returns it.
ZI.completeRun = function(route, squadIds, mode, threatLevel) {
  if (!route) return null;
  const r = ZI.resolveRunNodes(route, squadIds, mode, threatLevel);
  const hrs = route.duration;
  const summary = {
    routeId: route.id, name: route.name, biome: route.biome,
    nodes: route.nodes.slice(), squadIds: (squadIds || []).slice(), mode,
    time: hrs >= 1 ? `${hrs}h` : `${hrs * 60}m`,
    loot: r.loot, vehicleWear: r.vehicleWear, losses: r.losses,
    log: r.log, claimed: false, at: Date.now(),
  };
  ZI.setLastRun(summary);
  ZI.addPoiVisits(route.id, (route.nodes || []).length); // every node on a finished run counts as a visit
  // Route completion + per-node resolution feed the bus (Change 4.5).
  if (ZI.emitAction) {
    ZI.emitAction('run.complete', 1 + (route.risk || 1) * 0.3);
    (route.nodes || []).forEach(n => {
      const t = ZI.routeNodeType(n);
      if (t === 'combat') ZI.emitAction('kill', 0.6);
      else if (t === 'loot') ZI.emitAction('loot', 1);
      else if (t === 'hazard') ZI.emitAction('endure', 1);
    });
  }
  return summary;
};
// Grant the loot from the last (unclaimed) run. Returns {ok, amount} or {ok:false}.
ZI.claimLastRun = function() {
  const last = ZI.getLastRun();
  if (!last || last.claimed) return { ok: false, reason: last ? 'Already claimed' : 'No run to claim' };
  // Bank loot as recycler-bound salvage so it flows into the existing economy.
  if (ZI.bankWanderLoot) ZI.bankWanderLoot([{ name: `${last.name} haul`, value: last.loot, rarity:'Common' }]);
  last.claimed = true;
  ZI.setLastRun(last);
  return { ok: true, amount: last.loot };
};
// Validate that a route+squad can be re-sent (Send Again).
ZI.canSendAgain = function(route, squadIds) {
  if (!route) return { ok: false, reason: 'No route selected' };
  const roster = ZI.SQUAD_ROSTER || [];
  const squad = (squadIds || []).map(id => roster.find(s => s.id === id)).filter(Boolean);
  if (squad.some(s => s.hp <= 0)) return { ok: false, reason: 'A squad member is down' };
  return { ok: true };
};


// ─── CAMP BUILDINGS ──────────────────────────────────────────────────────────
ZI.BUILDINGS = [
  { id: 'farm',       name: 'Farm',           zone: 'agricultural', tier: 1, output: 'Food', icon: '🌿' },
  { id: 'workshop',   name: 'Workshop',       zone: 'industrial',   tier: 2, output: 'Refined Scrap', icon: '⚙️' },
  { id: 'forge',      name: 'Forge',          zone: 'industrial',   tier: 2, output: 'Metal Alloys', icon: '🔥' },
  { id: 'medtent',    name: 'Med Tent',       zone: 'recovery',     tier: 2, output: 'Medicine', icon: '⛑️' },
  { id: 'barracks',   name: 'Barracks',       zone: 'recovery',     tier: 1, output: 'Survivor Morale', icon: '🏠' },
  { id: 'watchtower', name: 'Watchtower',     zone: 'defense',      tier: 2, output: 'Threat Detection', icon: '👁️' },
  { id: 'turret',     name: 'Auto-Turret',    zone: 'defense',      tier: 3, output: 'Horde Defense', icon: '🎯' },
  { id: 'recycler',   name: 'Recycler',       zone: 'industrial',   tier: 2, output: 'Scrap Recovery', icon: '♻️' },
  { id: 'kitchen',    name: 'Kitchen',        zone: 'support',      tier: 2, output: 'Meals', icon: '🍲' },
  { id: 'generator',  name: 'Generator',      zone: 'support',      tier: 3, output: 'Power', icon: '⚡' },
  { id: 'comms',      name: 'Comms Tower',    zone: 'support',      tier: 3, output: 'Intel', icon: '📡' },
  { id: 'anomalyforge', name: 'Anomaly Forge',zone: 'industrial',   tier: 5, output: 'RMAT Exotics', icon: '🔮' },
];

// ─── SURVIVOR ROLES ──────────────────────────────────────────────────────────
ZI.SURVIVOR_ROLES = ['Scavenger','Guard','Engineer','Medic','Farmer','Cook','Mechanic','Scout'];

// ─── MARKETPLACE ITEMS ───────────────────────────────────────────────────────
ZI.MARKET_ITEMS = [
  { id: 'rmat1_mech',  name: 'RMAT-1 Mechanical',  type: 'RMAT', tier: 1, basePrice: 45,  supply: 82, demand: 67 },
  { id: 'rmat2_chem',  name: 'RMAT-2 Chemical',    type: 'RMAT', tier: 2, basePrice: 180, supply: 41, demand: 78 },
  { id: 'rmat3_elec',  name: 'RMAT-3 Electronic',  type: 'RMAT', tier: 3, basePrice: 520, supply: 18, demand: 89 },
  { id: 'rmat4_anom',  name: 'RMAT-4 Anomalous',   type: 'RMAT', tier: 4, basePrice: 1800,supply: 5,  demand: 97 },
  { id: 'scrap_t2',    name: 'Refined Scrap (T2)',  type: 'Material', tier: 2, basePrice: 22, supply: 95, demand: 44 },
  { id: 'alloy_t3',    name: 'Hardened Alloy (T3)', type: 'Material', tier: 3, basePrice: 95, supply: 32, demand: 71 },
  { id: 'fireaxe',     name: 'Fire Axe (Clean)',    type: 'Weapon',   tier: 2, basePrice: 120, supply: 28, demand: 55 },
  { id: 'huntrifle',   name: 'Hunting Rifle (WM)',  type: 'Weapon',   tier: 3, basePrice: 380, supply: 12, demand: 82 },
  { id: 'hazsuit_t2',  name: 'Hazard Suit T2',      type: 'Armor',    tier: 2, basePrice: 260, supply: 20, demand: 68 },
  { id: 'medkit_adv',  name: 'Advanced Med-Kit',    type: 'Consumable',tier:2, basePrice: 75, supply: 55, demand: 81 },
  { id: 'blueprint_turret', name: 'Blueprint: Auto-Sentry', type: 'Blueprint', tier: 3, basePrice: 900, supply: 3, demand: 99 },
  { id: 'legendary_axe', name: 'Sunder Pulse Axe',  type: 'Legendary', tier: 4, basePrice: 3200, supply: 1, demand: 100 },
];

// ─── WORLD EVENTS ─────────────────────────────────────────────────────────────
ZI.WORLD_EVENTS = [
  { id: 'rmat_storm',    name: 'RMAT Storm',        duration: 12, effect: 'RMAT yield +40% · Hazard buildup ×2 · Mutation zones ×2', color: '#c894ff', active: true },
  { id: 'shortage',      name: 'Food Shortage',     duration: 8,  effect: 'Food prices +60% · Hearthguard contracts +bonus', color: '#f08a52', active: false },
  { id: 'migration',     name: 'Zombie Migration',  duration: 6,  effect: 'Threat +25% · New routes blocked · Horde size ×1.5', color: '#e0624c', active: false },
  { id: 'black_auction', name: 'Black Haven Auction', duration: 3, effect: 'Tier 4-5 items available · Risk of faction rep loss', color: '#b99be8', active: false },
];

// ─── SCHEDULED TASKS ─────────────────────────────────────────────────────────
ZI.TASK_TYPES = [
  { id: 'scavenge',   name: 'Scavenge Route',  icon: '🗺️',  duration: 4, category: 'solo' },
  { id: 'craft',      name: 'Craft Item',      icon: '⚙️',  duration: 2, category: 'both' },
  { id: 'train',      name: 'Train Stats',     icon: '💪',  duration: 3, category: 'both' },
  { id: 'assign',     name: 'Assign Survivor', icon: '👤',  duration: 1, category: 'camp' },
  { id: 'repair',     name: 'Repair Gear',     icon: '🔧',  duration: 2, category: 'both' },
  { id: 'trade',      name: 'Marketplace Trade', icon: '💰', duration: 1, category: 'both' },
  { id: 'rest',       name: 'Rest & Recover',  icon: '😴',  duration: 3, category: 'both' },
  { id: 'faction',    name: 'Faction Contract', icon: '🤝', duration: 4, category: 'both' },
  { id: 'defend',     name: 'Horde Defense',   icon: '🛡️',  duration: 2, category: 'camp' },
  { id: 'extract',    name: 'RMAT Extraction', icon: '💎',  duration: 5, category: 'solo' },
];

// ─── LOOT LOADING ITEMS ───────────────────────────────────────────────────────
ZI.LOOT_CATEGORIES = {
  heavy:  { label: 'Heavy Cargo',   timePerUnit: 4.5, desc: 'Metal alloys, fuel drums, vehicle parts' },
  medium: { label: 'Supply Crates', timePerUnit: 2.8, desc: 'Food stores, ammo boxes, toolkits' },
  light:  { label: 'RMAT Samples',  timePerUnit: 1.2, desc: 'Shards, cores, echo vials — handle carefully' },
  data:   { label: 'Intel Drives',  timePerUnit: 0.5, desc: 'Blueprints, maps, faction data' },
};

// ─── PROJECT ZOMBOID-INSPIRED SYSTEMS ────────────────────────────────────────
// PZ is the gold standard for realistic zombie survival simulation.
// These systems are justified by PZ's design logic and adapted for Zombie Idler.

// MOODLES — PZ's status effect system. In PZ, moodles cascade:
// Hungry → Very Hungry → Starving (each increasing panic, reducing combat, slowing healing)
// Zombie Idler uses the same cascade logic but as percentage modifiers on the SURVIVAL stat system.
ZI.MOODLES = {
  // BODY CONDITION (from PZ: Hungry/Thirsty/Tired/Sick/Injured/Stressed/Bored/Unhappy/Panicked)
  Hungry: {
    levels: ['Peckish','Hungry','Very Hungry','Famished','Starving'],
    // In PZ, each level reduces combat effectiveness, healing speed, and eventually causes fainting
    staminaPenalties: [0, -0.08, -0.18, -0.30, -0.45],
    healPenalties:    [0, -0.10, -0.25, -0.40, -0.60],
    xpPenalties:      [0, -0.05, -0.12, -0.25, -0.40],
    color: '#f08a52',
  },
  Thirsty: {
    levels: ['Thirsty','Very Thirsty','Parched','Dehydrated'],
    // PZ: dehydration causes faster stamina loss and blurred vision mechanics
    staminaPenalties: [-0.05, -0.15, -0.28, -0.45],
    speedPenalties:   [0, -0.05, -0.15, -0.30],
    color: '#74b6ee',
  },
  Tired: {
    levels: ['Tired','Very Tired','Exhausted','Dead Tired'],
    // PZ: exhaustion causes attack speed reduction, miss chance, and eventual forced sleep
    attackSpeedPenalties: [0, -0.10, -0.25, -0.50],
    awarenessPenalties:   [-0.05, -0.15, -0.30, -0.60],
    color: '#6b8f71',
  },
  Panicked: {
    levels: ['Anxious','Nervous','Scared','Terrified','Hysterical'],
    // PZ: panic increases weapon sway, reduces aiming accuracy, causes faster breathing (noise)
    accuracyPenalties: [0, -0.08, -0.20, -0.40, -0.70],
    noisePenalties:    [0, +0.10, +0.20, +0.35, +0.60], // more noise when panicked
    color: '#c894ff',
  },
  Sick: {
    levels: ['Queasy','Nauseous','Sick','Severely Sick'],
    // PZ: sickness drains health over time; zombification is a special sickness type
    hpDrainPerHour: [0, 1, 3, 8],
    staminaPenalties: [-0.05, -0.15, -0.30, -0.55],
    color: '#a2dca2',
    note: 'Zombie bites cause Infection moodle. Laceration = 25% infection chance. Bite = 100% fatal without antibiotics.',
  },
  Injured: {
    levels: ['Light Wound','Deep Wound','Bleeding','Fracture'],
    // PZ: wounds require bandaging; deep wounds need sutures; fractures need splints + time
    mobilityPenalties: [0, -0.10, -0.20, -0.50],
    bleedRatePerMin:   [0, 0, 2, 0], // units of blood lost per minute
    treatmentRequired: ['Bandage','Suture Kit','Bandage + Tourniquet','Splint + Rest'],
    color: '#e0624c',
  },
  Wet: {
    levels: ['Damp','Wet','Soaked','Drenched'],
    // PZ: wet clothing causes cold buildup, which leads to sickness
    coldBuildupRate: [0.5, 1.5, 3.0, 5.0], // per hour
    temperatureDrop: [-1, -3, -6, -10],
    color: '#74b6ee',
    note: 'Clothes dry over time if player stays warm and dry. Heavy rain = fastest soak.',
  },
};

// NOISE SYSTEM — PZ's most innovative mechanic
// Zombies in PZ use a sophisticated hearing model:
// - Every action has a dB rating that attracts nearby zombies
// - Noise travels through walls at reduced strength
// - Wind direction and speed modify noise range
// - Zombies remember noise sources and investigate
ZI.NOISE_SOURCES = {
  // Action: { db, range_m, duration_s, attractsFrom_direction }
  Gunshot_Pistol:     { db: 140, range: 120, duration: 10,  note: 'PZ: single pistol shot clears a block-radius within seconds' },
  Gunshot_Shotgun:    { db: 160, range: 200, duration: 15,  note: 'PZ: most dangerous noise source in dense areas' },
  Gunshot_Suppressed: { db: 90,  range: 30,  duration: 4,   note: 'PZ: suppressors reduce range by ~75%' },
  MeleeAttack:        { db: 60,  range: 20,  duration: 1,   note: 'PZ: melee is quiet but grunts/thuds still attract close zombies' },
  RunningFootsteps:   { db: 50,  range: 15,  duration: 0.5, note: 'PZ: running players leave a noise trail every 2 steps' },
  WalkingFootsteps:   { db: 30,  range: 5,   duration: 0.3, note: 'PZ: walking is near-silent on soft ground' },
  CrouchWalk:         { db: 15,  range: 2,   duration: 0.2, note: 'PZ: sneak movement, minimal noise, core stealth tactic' },
  CarEngine:          { db: 120, range: 150, duration: 60,  note: 'PZ: vehicles are the loudest sustained noise source' },
  HornHonk:           { db: 150, range: 300, duration: 5,   note: 'PZ: horn = instant horde bait, also used as distraction' },
  BreakingGlass:      { db: 80,  range: 50,  duration: 3,   note: 'PZ: smashing windows is loud; use elbow or crowbar quietly' },
  Hammering:          { db: 100, range: 80,  duration: 30,  note: 'PZ: construction attracts zombies; build at dawn or use doors' },
  Generator:          { db: 90,  range: 70,  duration: 3600,note: 'PZ: running generator all night = guaranteed horde by morning' },
  CrowbarDoor:        { db: 70,  range: 35,  duration: 5,   note: 'PZ: forced entry much noisier than lockpicking' },
  Coughing:           { db: 55,  range: 18,  duration: 2,   note: 'PZ: sick characters cough involuntarily, revealing position' },
  Scream:             { db: 145, range: 250, duration: 8,   note: 'PZ: panic screams are near-gunshot level; avoid high fear' },
};

// INFECTION & ZOMBIFICATION — PZ's most impactful survival rule
// In PZ, Knox Infection (zombification) is always 100% fatal if bitten.
// Laceration = 25% chance. Scratch = 7% chance.
// This is the core tension driver of all PZ gameplay.
// Zombie Idler adapts this with RMAT-influenced variables:
ZI.INFECTION = {
  biteChance: 1.00,      // PZ: Knox Infection from bite = always
  lacerationChance: 0.25, // PZ: 25% from deep zombie scratch/laceration
  scratchChance: 0.07,   // PZ: 7% from shallow scratch
  zombificationHours: { min: 8, max: 72 }, // PZ: variable, based on server settings
  // Zombie Idler modifiers:
  rmatAntibioticCure: true,  // Medical RMAT can cure infection if caught early (< 6h)
  concordanceVaccine: { reducesChanceBy: 0.40, requiresRep: 'Allied' }, // Concordance research
  vitality_reduction: 0.004, // Each point of Vitality reduces bite infection chance by 0.4%
  hazardSuitReduction: 0.60, // T3+ Hazard Suit reduces infection from all sources by 60%
  symptoms: ['Fever','Sweating','Nausea','Confusion','Loss of consciousness','Reanimation'],
  note: 'The most important PZ rule: always check survivors for bites after horde events.',
};

// ZOMBIE BEHAVIOR MODEL — PZ's advanced zombie AI rules
// PZ zombies use a detailed perception model that Zombie Idler adapts for its simulation:
ZI.ZOMBIE_BEHAVIOR = {
  // HEARING (PZ: zombies hear proportional to noise level)
  hearing: {
    base_range_m: 10,  // zombie hears sounds within 10m baseline
    nightMultiplier: 0.8, // PZ: zombies slightly less effective at night (hearing same, vision worse)
    migration_threshold: 200, // above 200 zombies in area = migration wave begins
    note: 'PZ: zombies attracted to noise remember the source for ~30 seconds before losing interest',
  },
  // SIGHT (PZ: FOV cone, reduced in darkness/fog/rain)
  sight: {
    base_fov_degrees: 180,
    base_range_m: 20,
    nightRange_m: 8,    // PZ: dark nights are critically dangerous
    fogMultiplier: 0.4, // PZ: fog reduces zombie sight dramatically — use it
    rainMultiplier: 0.7,
    note: 'PZ: crouch behind objects to break line of sight; height matters (second floor windows)',
  },
  // MEMORY (PZ: zombies remember last known player position)
  memory: {
    duration_s: 60,     // PZ: zombies "forget" player after ~60s without stimuli
    attractorItems: ['Noise maker','Car alarm','Distraction device'], // items that hold attention
    note: 'PZ: "herding" zombies into zones and circling back is a core advanced tactic',
  },
  // MIGRATION (PZ: zombies migrate toward populated areas and noise)
  migration: {
    triggers: ['Large noise event','Building construction','Generator running','High survivor density','Horde event aftermath'],
    waveSizes: { small: '20-50', medium: '100-300', large: '500-2000', apocalypse: '5000+' },
    note: 'PZ: don\'t stay in one place too long — zombies naturally drift toward activity',
  },
  // SPRINT VARIANTS (PZ: server-configurable, Zombie Idler uses tiered system)
  movement: {
    Shambler:    { speed: 0.4, sprint: false, note: 'PZ default: slow, easy to kite individually, dangerous in groups' },
    Walker:      { speed: 0.7, sprint: false, note: 'PZ: slightly faster, used in Survivor/Apocalypse modes' },
    Runner:      { speed: 1.2, sprint: true,  note: 'PZ sprint zombies: the most feared variant, requires cornering tactics' },
    Crawler:     { speed: 0.2, sprint: false, note: 'PZ: near-silent floor hazard, easy to miss in darkness' },
    // Zombie Idler exclusive:
    Burrower:    { speed: 0.5, sprint: 'burst', note: 'Emerges from ground near player — PZ-style ambush surprise' },
    Titan_Mutant:{ speed: 0.6, sprint: false, note: 'Tank archetype — PZ Brute equivalent with RMAT corruption' },
  },
};

// LOOT SYSTEM — PZ's container-based probabilistic loot
// PZ uses defined container types each with specific item tables and rarities.
// Zombie Idler uses the same logic but extends it with RMAT anomaly modifiers.
ZI.LOOT_CONTAINERS = {
  // Container: { items[], baseChance, exhausted_after_loots, rmat_chance }
  Glovebox:       { items:['Maps','Ammo (pistol)','Keys','Snacks'], baseChance:0.70, exhaustedAfter:1, rmatChance:0.01 },
  CarTrunk:       { items:['Tools','Spare tire','Jumper cables','Scrap metal'], baseChance:0.60, exhaustedAfter:1, rmatChance:0.02 },
  KitchenCabinet: { items:['Canned food','Spices','Cooking pot','Lighter'], baseChance:0.75, exhaustedAfter:3, rmatChance:0 },
  GunCabinet:     { items:['Rifles','Pistols','Ammo','Gun cleaning kit'], baseChance:0.35, exhaustedAfter:1, rmatChance:0.05, locked:true },
  HospitalShelf:  { items:['Antibiotics','Bandages','Suture kit','Painkillers','Blood bag'], baseChance:0.80, exhaustedAfter:2, rmatChance:0.08 },
  PoliceArmory:   { items:['Shotguns','Riot armor','Handcuffs','Ammo ×lots'], baseChance:0.25, exhaustedAfter:1, rmatChance:0.12, locked:true },
  WarehouseShelf: { items:['Industrial scrap','Electronics','Wiring','Heavy tools'], baseChance:0.65, exhaustedAfter:4, rmatChance:0.04 },
  LabStorage:     { items:['RMAT samples','Chemical compounds','Research notes'], baseChance:0.45, exhaustedAfter:2, rmatChance:0.35, requiresKeycard:true },
  AbandonedVehicle:{ items:['Car parts','Fuel','Battery','Scrap'], baseChance:0.55, exhaustedAfter:1, rmatChance:0.03 },
  ZombiePocket:   { items:['Random junk','Occasional valuables','Rare RMAT trace'], baseChance:0.30, exhaustedAfter:1, rmatChance:0.02 },
};

// FATIGUE / SLEEP MODEL — PZ forces real rest cycles
// In PZ, ignoring fatigue leads to: slowed movement, reduced combat, eventually passing out mid-fight.
// Zombie Idler integrates this as the "Schedule" system's core justification.
ZI.FATIGUE_MODEL = {
  // Hours awake → fatigue level → penalties
  phases: [
    { hoursAwake: [0,12],  level: 'Alert',    staminaMod:  0.00, xpMod:  0.00, combatMod:  0.00, color: 'var(--green)' },
    { hoursAwake: [12,16], level: 'Tired',    staminaMod: -0.08, xpMod: -0.05, combatMod: -0.05, color: 'var(--amber)' },
    { hoursAwake: [16,20], level: 'Exhausted',staminaMod: -0.25, xpMod: -0.20, combatMod: -0.20, color: 'var(--red2)' },
    { hoursAwake: [20,24], level: 'Dead Tired',staminaMod:-0.50, xpMod: -0.40, combatMod: -0.40, color: 'var(--red)' },
    { hoursAwake: [24,99], level: 'Blackout', staminaMod: -0.80, xpMod: -0.60, combatMod: -0.70, color: '#e0624c',
      note: 'PZ: character can pass out at any time. Zombie Idler: forces idle auto-rest and cancels active run.' },
  ],
  sleepHealing: {
    lightWound:  { hoursToHeal: 8,  requiresSleep: true,  note: 'PZ: wounds heal during sleep only if bandaged' },
    deepWound:   { hoursToHeal: 24, requiresSutures: true, requiresSleep: true },
    fracture:    { hoursToHeal: 168, requiresSplint: true, note: 'PZ: 1 full week for fractures; splint required' },
    infection:   { hoursToHeal: 48, requiresAntibiotics: true, note: 'PZ: non-zombie infections cured with antibiotics + rest' },
  },
  scheduleJustification: 'The 12-24h scheduling window maps directly to PZ\'s real-time day. Players plan a full survival day: sleep, eat, scavenge, build, rest — mirroring how PZ players structure their sessions.',
};

// VEHICLE SYSTEM — PZ's deep vehicle mechanics
// PZ has one of the most detailed idle-era vehicle systems: fuel, battery, engine quality,
// rust, tire condition, brake fluid, coolant — each degrades independently.
ZI.VEHICLE_SYSTEMS = {
  components: {
    Engine:    { degradesPer100km: 0.5, failureEffect: 'Vehicle immobilized', repairSkill: 'Mechanics L4' },
    Battery:   { degradesPer100km: 0.3, failureEffect: 'Cannot start', repairSkill: 'Mechanics L2', note: 'PZ: dead battery = stranded. Always carry jumper cables.' },
    Tires:     { degradesPer100km: 2.0, failureEffect: 'Speed -50%, noise ×2', repairSkill: 'Mechanics L1', note: 'PZ: tire blowout mid-escape is devastating' },
    BrakeFluid:{ degradesPer100km: 0.2, failureEffect: 'Braking distance ×3', repairSkill: 'Mechanics L3' },
    Coolant:   { degradesPer100km: 0.4, failureEffect: 'Engine overheat → fires', repairSkill: 'Mechanics L3', note: 'PZ: overheating is silent until it\'s too late' },
    Trunk:     { maxWeightKg: { civilian:80, reinforced:150, expedition:250, radiation:200 }, note: 'PZ: overloaded trunks massively reduce speed' },
  },
  noiseBiome: {
    // PZ: vehicle noise is the #1 most dangerous sustained sound source
    mountain:  { engineNoise: 80,  hearingRange: 100, note: 'Sound echoes off ridges — approach cabins on foot' },
    suburbia:  { engineNoise: 100, hearingRange: 140, note: 'Street canyons amplify engine noise significantly' },
    metro:     { engineNoise: 120, hearingRange: 200, note: 'PZ urban logic: every block could have 100+ zeds' },
    perimeter: { engineNoise: 90,  hearingRange: 160, note: 'Anomalies distort sound propagation unpredictably' },
  },
  fuelConsumption: {
    // liters per hour of driving
    civilian:     { city: 8, highway: 6, offroad: 14 },
    reinforced:   { city: 12, highway: 9, offroad: 18 },
    expedition:   { city: 9, highway: 7, offroad: 11 },
    radiationReady:{ city: 14, highway: 11, offroad: 20 },
    note: 'PZ: always refuel before a run. Empty tank = extremely dangerous.',
  },
};

// CRAFTING LOGIC — PZ's recipe-and-materials system
// PZ requires: right items + right tool + right skill level + sometimes a recipe book.
// Zombie Idler mirrors this with: RMAT + Materials + Class Level + Blueprint unlock.
ZI.CRAFTING_LOGIC = {
  qualitySystem: {
    // PZ: crafting quality scales with skill level (1-10 in each skill)
    // Zombie Idler: crafting quality scales with Class Level + Profession
    Poor:        { classLevel: [1,3],  qualityMod: 0.70, note: 'PZ: "Poorly crafted" items have lower durability and stats' },
    Normal:      { classLevel: [4,6],  qualityMod: 1.00 },
    Good:        { classLevel: [7,8],  qualityMod: 1.20 },
    Exceptional: { classLevel: [9,10], qualityMod: 1.40, note: 'PZ: master craftsmen produce items that rival manufactured gear' },
  },
  toolRequirements: {
    // PZ: you need the right tool or the recipe fails
    // Tier gates in Zombie Idler follow PZ's tool-gating philosophy
    Workbench:      { tier: 1, allows: ['Basic weapons','Simple repairs','Crude armor'] },
    WeaponBench:    { tier: 2, allows: ['Firearm mods','Blade sharpening','Socket installation'] },
    Forge:          { tier: 3, allows: ['Metal alloys','Armor crafting','Heavy melee'] },
    MedStation:     { tier: 2, allows: ['Medicine brewing','Antibiotic synthesis','Suture kits'] },
    AnomalyForge:   { tier: 5, allows: ['RMAT Exotics','Legendary traits','Reality-infused gear'],
                      note: 'No PZ equivalent — apex tier unique to Zombie Idler\'s RMAT system' },
  },
  disassembly: {
    // PZ: disassembling items gives XP and parts — a core scavenging loop
    note: 'Zombie Idler\'s Salvage system mirrors PZ disassembly: break down any item for components + Scrapping XP',
    skillGain: 'Scrapping profession XP per disassembly',
    rmatRecovery: '5-15% RMAT residue chance on T2+ items',
  },
};

// WEATHER SYSTEM — PZ's temperature and weather impact
// PZ weather affects: temperature (clothing needs), visibility, zombie alertness,
// foraging yield, vehicle traction, and mood moodles.
// ─── CONDITION STAT MODIFIERS (weather × time of day) ────────────────────────
// Whole-number % bonuses/penalties to professions, each with an in-world reason,
// plus an "opportunity" line telling the player what the window is good for.
ZI.WEATHER_STAT_MODS = {
  Rain: {
    mods: [
      { stat:'stealth',    pct:15,  why:'Rain masks footsteps and scent' },
      { stat:'foraging',   pct:10,  why:'Wet soil turns up roots and mushrooms' },
      { stat:'athletics',  pct:-15, why:'Soaked clothing adds weight to every stride' },
      { stat:'scavenging', pct:-5,  why:'Waterlogged containers slow searches' },
    ],
    opportunity:'Push and scout under cover of rain. Avoid long sprints.',
  },
  Fog: {
    mods: [
      { stat:'stealth',    pct:20,  why:'Visibility drops for everything, including them' },
      { stat:'combat',     pct:-10, why:'Targets emerge too close to line up a hit' },
      { stat:'discovery',  pct:-10, why:'Landmarks vanish; new sites are harder to spot' },
    ],
    opportunity:'Best window for evasion runs. Keep fights short.',
  },
  HeatWave: {
    mods: [
      { stat:'endurance',  pct:-15, why:'Heat drains stamina faster' },
      { stat:'athletics',  pct:-10, why:'Overheating caps sprint duration' },
      { stat:'scavenging', pct:10,  why:'Sluggish undead let you loot longer' },
      { stat:'medical',    pct:5,   why:'Dehydration cases give medics more practice' },
    ],
    opportunity:'Loot slow-moving zones. Carry water and skip long pushes.',
  },
  Blizzard: {
    mods: [
      { stat:'athletics',  pct:-20, why:'Snowdrifts and ice cut movement speed' },
      { stat:'stealth',    pct:10,  why:'Wind noise covers movement' },
      { stat:'foraging',   pct:-20, why:'Ground cover buries most finds' },
      { stat:'mechanical', pct:10,  why:'Stuck indoors, crews tinker and repair' },
    ],
    opportunity:'Stay in camp: craft, repair and recycle. Short stealth runs only.',
  },
};
ZI.TIME_STAT_MODS = {
  night: {
    mods: [
      { stat:'stealth',    pct:10,  why:'Darkness hides silhouettes' },
      { stat:'combat',     pct:-10, why:'Aggression peaks after dark' },
    ],
    opportunity:'Night runs pay more RMAT but hit harder.',
  },
  dusk: {
    mods: [
      { stat:'scavenging', pct:5,   why:'Low light, low activity, lookers still see' },
    ],
    opportunity:'Last safe window to extract before night spawns.',
  },
  day: {
    mods: [
      { stat:'scavenging', pct:10,  why:'Full light makes searches thorough' },
      { stat:'stealth',    pct:-10, why:'Nowhere to hide in daylight' },
    ],
    opportunity:'Prime scavenging hours. Loud work is safest now.',
  },
};
// Combined % modifier per stat for the current conditions.
ZI.conditionMods = function(weather, phase) {
  const out = {};
  const add = (list, src) => (list || []).forEach(m => {
    if (!out[m.stat]) out[m.stat] = { pct:0, reasons:[], parts:[] };
    out[m.stat].pct += m.pct; out[m.stat].reasons.push(m.why);
    out[m.stat].parts.push({ src, pct:m.pct, why:m.why });
  });
  add((ZI.WEATHER_STAT_MODS[weather] || {}).mods, weather === 'HeatWave' ? 'Heat Wave' : weather);
  add((ZI.TIME_STAT_MODS[phase] || {}).mods, phase.charAt(0).toUpperCase() + phase.slice(1));
  return out;
};

ZI.WEATHER_EFFECTS = {
  Rain: {
    visibility: -0.40,        // PZ: rain halves visual range
    noiseReduction: -0.30,    // PZ: rain masks footstep noise — great cover for movement
    coldBuildupRate: 2.0,     // if not waterproofed
    zombieAwareness: -0.15,   // PZ: rain-soaked zombies are slightly less aware
    vehicleTraction: -0.25,
    forageYield: -0.20,       // PZ: foraging in rain is harder (ground disturbed)
    note: 'PZ players use rain for risky operations: vault windows, cross open areas, loot gunstores',
  },
  Fog: {
    visibility: -0.65,
    noiseReduction: 0,
    zombieVision: -0.60,     // PZ: fog makes zombies nearly blind — very safe movement
    playerVision: -0.50,
    note: 'PZ: foggy mornings are the safest time to move large distances. High risk reward timing.',
  },
  HeatWave: {
    staminaDrain: +0.25,     // PZ: heat exhaustion drains stamina faster
    thirstRate: +0.40,       // dehydrate faster
    foodSpoilRate: +0.60,    // PZ: food spoils dramatically faster in heat
    zombieAggression: +0.10,
    note: 'PZ: summer heat forces players to carry more water; refrigeration becomes critical',
  },
  Blizzard: {
    movement: -0.40,
    visibility: -0.70,
    coldBuildupRate: 5.0,
    vehicleStartChance: -0.30, // PZ: cold engines fail to start
    forageYield: -0.60,
    note: 'PZ winter: most dangerous condition; hypothermia kills faster than most zombies',
  },
  AcidRain: {
    // Zombie Idler exclusive (Metropolis + Perimeter)
    gearDegradation: +0.80,  // corrodes armor rapidly
    visibility: -0.30,
    healthDrain: 2,           // hp/min without hazard protection
    zombieMutation: +0.15,   // accelerates mutation in exposed zombies
    note: 'Adapted from PZ\'s toxic gas events — sustained environmental damage requiring gear mitigation',
  },
  RadiationStorm: {
    // Zombie Idler exclusive (Debriefed Perimeter)
    radiationBuildup: 5.0,   // per minute without protection
    rmatYield: +0.40,        // storms energize RMAT nodes
    anomalyFrequency: +0.60,
    visibilityDistortion: true,
    note: 'RMAT storms are the "power event" equivalent of PZ\'s helicopter event — high risk, massive reward',
  },
};

// FORAGING / SCAVENGING — PZ's foraging system
// PZ has a detailed foraging mechanic tied to the Foraging skill:
// higher skill = more items found, better quality, faster search
ZI.SCAVENGING = {
  containerSearch: {
    // PZ: searching takes time proportional to container size; skill speeds this up
    timeModifiers: {
      Scavenging_L1: 1.00,
      Scavenging_L5: 0.75,
      Scavenging_L10: 0.50, // PZ: veteran scavengers are twice as fast
    },
    luckBonus: {
      Lucky_10: +0.05,   // per 10 Lucky stat points
      Lucky_100: +0.50,  // max Lucky = 50% better loot rolls
    },
  },
  // PZ zone categories (adapted)
  zones: {
    Residential:   { searchTime: 8,  specialItems:['Food','Clothing','Simple tools','Meds'], rmatChance: 0.01 },
    Commercial:    { searchTime: 12, specialItems:['Electronics','Packaged food','Cash register loot'], rmatChance: 0.03 },
    Industrial:    { searchTime: 15, specialItems:['Heavy tools','Metal scrap','Vehicle parts'], rmatChance: 0.08 },
    Hospital:      { searchTime: 10, specialItems:['All medical supplies','Rare antibiotics'], rmatChance: 0.12 },
    Military:      { searchTime: 20, specialItems:['Military weapons','Ammo','Explosives','Body armor'], rmatChance: 0.20, danger:'Very High' },
    Laboratory:    { searchTime: 25, specialItems:['RMAT clusters','Research data','Exotic compounds'], rmatChance: 0.45, danger:'Apex' },
  },
  exhaustedContainers: {
    note: 'PZ: containers don\'t respawn. Once looted, they stay empty permanently (on default settings). Zombie Idler uses long respawn timers (7-30 days) to simulate scarcity without permanent depletion.',
    respawnDays: { civilian: 7, industrial: 14, military: 21, laboratory: 30 },
  },
};

// SKILLS / PROFESSION XP — PZ's skill system
// PZ has 13 skills across 4 categories; all level from 1-10.
// Zombie Idler's SURVIVAL attributes and Professions mirror this directly.
ZI.SKILL_XP_SOURCES = {
  // PZ-inspired XP gain events (adapted for Zombie Idler)
  Mechanics: {
    sources: ['Repairing vehicle (primary)','Dismantling engine parts','Installing mods','Using wrench/jack'],
    xpPerAction: { repair: 25, dismantle: 15, install: 20 },
    note: 'PZ: Mechanics is the most time-investment skill. Level 10 allows full engine rebuilds.',
  },
  Carpentry: { // → Engineering in Zombie Idler
    sources: ['Building structures','Repairing buildings','Crafting furniture','Dismantling buildings'],
    note: 'PZ: Carpentry is the primary base-building skill. Zombie Idler\'s Engineering mirrors this.',
  },
  FirstAid: {
    sources: ['Treating wounds on survivors','Performing surgery','Identifying symptoms','Crafting medicine'],
    xpPerAction: { bandage: 10, suture: 50, surgery: 200 },
    note: 'PZ: First Aid saves lives but only if you have the right supplies. Time-critical mechanic.',
  },
  Stealth: { // → Underhandedness
    sources: ['Moving crouched near zombies','Successful sneak kills','Evading detection'],
    note: 'PZ: Sneaking skill reduces noise radius from footsteps. High-level stealthers are nearly silent.',
  },
  Foraging: { // → Lucky + Insight
    sources: ['Successful loot rolls','Rare find events','Anomaly discoveries','POI intel'],
    note: 'PZ: Foraging 10 finds items others walk past. Zombie Idler\'s Lucky+Insight combination.',
  },
  Farming: {
    sources: ['Tending crops','Harvesting food','Composting','Seed collecting'],
    note: 'PZ: farming is the only renewable food source in the late game. Critical for Camp Mode.',
    growthDays: { Cabbage:6, Tomato:8, Radish:5, Potato:10, Strawberry:14, note:'PZ: crops die without water/fertilizer' },
  },
};

// CAMP DEFENSE — PZ's barricading and fortification logic
// PZ lets players board up windows, build walls, set traps, and create kill corridors.
// Zombie Idler's Camp Mode formalizes this into a building system.
ZI.CAMP_DEFENSE_LOGIC = {
  wallTypes: {
    // PZ: log walls → wooden walls → metal walls (each takes more damage before breach)
    Scrap_Barricade:  { hpPerPanel: 50,  tier:1, zombieBreachTime:'20s', materials:'Scrap ×10' },
    Wooden_Wall:      { hpPerPanel: 150, tier:2, zombieBreachTime:'90s', materials:'Wood ×20' },
    Reinforced_Wall:  { hpPerPanel: 400, tier:3, zombieBreachTime:'5m',  materials:'Metal ×30 + Engineering L5' },
    Composite_Wall:   { hpPerPanel: 1000,tier:4, zombieBreachTime:'20m', materials:'Alloy ×40 + RMAT-1 ×2' },
    RMAT_Barrier:     { hpPerPanel: 5000,tier:5, zombieBreachTime:'Never (standard)', materials:'RMAT-4 ×5 + Anomaly Forge' },
  },
  // PZ: kill corridors funnel zombies into optimal defensive positions
  killCorridors: {
    note: 'PZ tactic: barricade all but one entrance, put traps + shooters at the funnel. Zombie Idler formalizes this as "Defense Rating" which improves with Watchtower + Turret + Wall combo.',
    bonuses: {
      FunnelSetup: '+25% Defense Rating',
      OverwatchPosition: '+15% ammo efficiency',
      TrapLane: '+40% damage to funnel zombies',
    },
  },
  hordeScaling: {
    note: 'PZ: hordes scale with time, population density, and noise events. After day 30 in Zombie Idler, horde composition shifts — more Runners, Brutes appear, eventually Mutants. Mirrors PZ\'s population respawn and migration mechanics.',
    day_milestones: {
      day_1_10:   'Shamblers (85%), Runners (15%) — PZ Week 1 equivalent',
      day_11_30:  'Shamblers (65%), Runners (25%), Spitters (10%) — PZ Month 1',
      day_31_60:  'Runners (40%), Spitters (25%), Brutes (20%), Mutants (15%)',
      day_61_plus:'Apex variants appear — PZ late-game density equivalent',
    },
  },
};

// ─── END PZ-INSPIRED SYSTEMS ──────────────────────────────────────────────────
// ZI game data loaded
