// game/core.js — Shared game object, storage helpers, clock, settings, difficulty table, rarity tiers and base tables.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
// Everything attaches to the shared global ZI object; load-time calls live in game/bootstrap.js.

// Zombie Idler — Game Data Constants
// All game data: classes, factions, items, zombies, routes, RMAT tiers

window.ZI = window.ZI || {};

// ─── H1: ONE CLOCK AND SEEDED ROLLS (sim harness brief A1, A2) ───────────────
// ZI.clockNow() is the gameplay and deterministic-record clock. Game: real time. Tests and the harness can install
// a simulated clock (ZI.installClock) that moves only when they move it. ZI.now() (game/jobs.js) returns the same
// clock; rule code calls ZI.clockNow() because the load-time replay (game/bootstrap.js) hides ZI.now before old
// line 1650. Real time stays only for session ids, savedAt, the reload-resume window and simulation locking.
ZI._installedClock = ZI._installedClock || null; // a harness may provide its clock before load, so load-time settles use it too
ZI.clockNow = function() { return ZI._installedClock ? ZI._installedClock() : Date.now(); };
ZI.installClock = function(fn) { ZI._installedClock = typeof fn === 'function' ? fn : null; };
// Per-system hook for rolls that use Math.random() today (the Wandering simulation keeps its own injected rng).
// Game: exactly Math.random(). Harness: ZI.installRolls(masterSeed) gives each system its own seeded stream.
ZI._rollStreams = null;
ZI.roll = function(system) { const g = ZI._rollStreams && ZI._rollStreams(system); return g ? g() : Math.random(); };
ZI.installRolls = function(masterSeed) {
  if (masterSeed == null) { ZI._rollStreams = null; return; }
  const streams = {}, hash = (str) => { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; };
  ZI._rollStreams = (system) => streams[system] || (streams[system] = ZI.seededRng(((masterSeed >>> 0) ^ hash(String(system))) >>> 0));
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

// ─── GLOBAL GAME CLOCK (one shared rate: 1 game hour = 1 real minute) ────────
// Oct 16 (Sam): every game-time system reads this one rate — the world clock, the header clock, crafting and build
// timers, the camp schedule and route runs (ZI.GAME_HOUR_MS in game/routes.js). Change it here to retune them all.
ZI.REAL_MS_PER_GAME_HOUR = 60000;
ZI.GAME_DAY_MS = 24 * ZI.REAL_MS_PER_GAME_HOUR; // one game day in real ms (24 real minutes). Skill decay stays on real days (Sam, Oct 16).
ZI.OFFLINE_LAST_SEEN_KEY = 'zi_offline_last_seen';
ZI.OFFLINE_CAP_MS = 24 * 60 * 60 * 1000;
ZI._offlineWindow = null;
ZI._inferOfflineLastSeen = function(now) {
  const marks = [];
  const read = key => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) { return null; } };
  const schedule = read('zi_schedule');
  (schedule && schedule.assignments || []).forEach(a => marks.push(Number(a.lastTick || a.since)));
  const jobs = read('zi_jobs');
  (jobs && jobs.jobs || []).forEach(j => { if (j.status === 'active' && j.startedAt != null) marks.push(Number(j.startedAt)); });
  const wander = read('zi_wander_run'); if (wander && wander.lastTickAt != null) marks.push(Number(wander.lastTickAt));
  const routes = read('zi_route_runs');
  Object.values(routes || {}).forEach(r => { if (r && r.startedAt != null) marks.push(Number(r.startedAt)); });
  const valid = marks.filter(t => Number.isFinite(t) && t >= 0 && t <= now);
  return valid.length ? Math.max(...valid) : now;
};
ZI.beginOfflineWindow = function(now) {
  now = Number.isFinite(now) ? now : ZI.clockNow();
  let last = NaN;
  try { const raw = localStorage.getItem(ZI.OFFLINE_LAST_SEEN_KEY); if (raw != null && raw !== '') last = Number(raw); } catch (e) {}
  if (!Number.isFinite(last) || last < 0 || last > now) last = ZI._inferOfflineLastSeen(now);
  const elapsedMs = Math.max(0, now - last), creditedMs = Math.min(elapsedMs, ZI.OFFLINE_CAP_MS);
  ZI._offlineWindow = { from:last, to:last + creditedMs, now, elapsedMs, creditedMs, discardedMs:elapsedMs - creditedMs };
  ZI._offlineWanderPending = elapsedMs >= 250;
  try { localStorage.setItem(ZI.OFFLINE_LAST_SEEN_KEY, String(now)); } catch (e) {}
  return ZI._offlineWindow;
};
ZI.offlineWindow = function() { return ZI._offlineWindow || ZI.beginOfflineWindow(); };
ZI.heartbeatOfflineWindow = function(now) {
  now = Number.isFinite(now) ? now : ZI.clockNow();
  try { localStorage.setItem(ZI.OFFLINE_LAST_SEEN_KEY, String(now)); } catch (e) {}
};
ZI.CLOCK_KEY = 'zi_game_clock';
ZI.CLOCK_RATE = 3600 * 1000 / ZI.REAL_MS_PER_GAME_HOUR; // game seconds per real second (600; was 0.5)
// TIER-01 (Sam, Oct 31): tier escalation divisor. A tier is drawable when its rank <= floor(lap / ZI.TIER_LAP_DIVISOR),
// lap = floor(scroll / 100) + Push On boost. 3.0 makes BOSS drawable at 1.04 game days of walking (was 0.52 at 1.5).
// Readers: _bgZombie (wandering.js), wanderDrawableTiers (world.js), the Traversal pool (screens-v3.jsx).
// camp.js horde tier is a separate system and keeps its own 1.5.
ZI.TIER_LAP_DIVISOR = 3.0;
// ART-02 (Sam, Oct 31): the widest zombie sprite, at its tier height, fits this share of the scene width (one global fit).
ZI.SCENE_WIDTH_SHARE = 0.65;
ZI._clock = function() {
  let c; try { c = JSON.parse(localStorage.getItem(ZI.CLOCK_KEY) || 'null'); } catch (e) { c = null; }
  if (!c) { c = { base: 14 * 3600, day: 1, at: Date.now(), rate: ZI.CLOCK_RATE }; localStorage.setItem(ZI.CLOCK_KEY, JSON.stringify(c)); }
  // A clock saved at another rate (old saves: 0.5) is settled at its own rate up to now, then continues at the
  // current rate — so changing the rate never jumps the day forward for the time already played.
  const rate = c.rate == null ? 0.5 : c.rate;
  if (rate !== ZI.CLOCK_RATE) {
    const now = Date.now(), t = (c.day - 1) * 86400 + c.base + Math.floor(Math.max(0, now - c.at) / 1000 * rate);
    c = { day: Math.floor(t / 86400) + 1, base: t % 86400, at: now, rate: ZI.CLOCK_RATE };
    try { localStorage.setItem(ZI.CLOCK_KEY, JSON.stringify(c)); } catch (e) {}
  }
  return c;
};
// Total game seconds since Day 1 00:00.
ZI.gameTotalSeconds = function() {
  const c = ZI._clock();
  // Oct 29: a PC clock set backwards never runs the calendar backwards (no Year 0 / negative days); it holds until
  // real time passes the saved moment again.
  return (c.day - 1) * 86400 + c.base + Math.floor(Math.max(0, Date.now() - c.at) / 1000 * ZI.CLOCK_RATE);
};
ZI.getGameTime = function() {
  const t = ZI.gameTotalSeconds();
  return { day: Math.floor(t / 86400) + 1, second: t % 86400 };
};
// Calendar years contain 364 days; the calendar is elapsed game time from Day 1.
ZI.getCalendar = function() {
  const t = ZI.gameTotalSeconds();
  const totalDay = Math.floor(t / 86400) + 1;
  const second = t % 86400;
  return {
    year: Math.floor((totalDay - 1) / 364) + 1,
    day: ((totalDay - 1) % 364) + 1,
    hh: Math.floor(second / 3600),
    mm: Math.floor(second / 60) % 60,
  };
};
// Skip ahead N in-game hours (e.g. resting at camp). Returns the new day number.
ZI.passTime = function(hours) {
  const t = ZI.gameTotalSeconds() + Math.round(hours * 3600);
  const c = { day: Math.floor(t / 86400) + 1, base: t % 86400, at: Date.now(), rate: ZI.CLOCK_RATE };
  try { localStorage.setItem(ZI.CLOCK_KEY, JSON.stringify(c)); } catch (e) {}
  return c.day;
};
ZI.passTimeToNextMorning = function(hour) {
  hour = Number.isFinite(hour) ? Math.max(0, Math.min(23, Math.floor(hour))) : 6;
  const t = ZI.gameTotalSeconds(), dayStart = Math.floor(t / 86400) * 86400;
  const target = dayStart + 86400 + hour * 3600;
  return ZI.passTime((target - t) / 3600);
};

// ─── PLAYER SETTINGS ─────────────────────────────────────────────────────────
ZI.SETTINGS_KEY = 'zi_settings';
ZI.SETTINGS_DEFAULTS = { damageNumbers: true };
ZI.getSettings = function() { try { return Object.assign({}, ZI.SETTINGS_DEFAULTS, JSON.parse(localStorage.getItem(ZI.SETTINGS_KEY) || '{}')); } catch (e) { return Object.assign({}, ZI.SETTINGS_DEFAULTS); } };
ZI.setSetting = function(k, v) { const s = ZI.getSettings(); s[k] = v; try { localStorage.setItem(ZI.SETTINGS_KEY, JSON.stringify(s)); } catch (e) {} };

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
// ═══ WANDERING POLICY, SKILL DECAY, REPUTATION & HEXAGON (Wandering spec v1.0) ═══
// Pure rules (no React) so the live screen and the offline engine share one simulation.
ZI._rj = function(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
ZI._wj = function(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
// Difficulty multiplier hook. No difficulty is stored yet (spec 15 not built), so every save reads Normal (×1).
// The Easy/Hard values for this row are not in the difficulty table yet.
ZI.DIFFICULTY_TABLE = { normal: { fortAttackHp: 1 } };
ZI.getDifficulty = function() { return ZI._rj('zi_difficulty', 'normal'); };
ZI.difficultyMult = function(param) { const row = ZI.DIFFICULTY_TABLE[ZI.getDifficulty()] || ZI.DIFFICULTY_TABLE.normal; return row[param] != null ? row[param] : 1; };

// Developer view (Oct 27): open the page with ?dev in the address to show development-only info (e.g. the world seed).
ZI.isDevView = function() { try { return /[?&]dev(=1|=true)?(&|$)/.test(window.location.search); } catch (e) { return false; } };
