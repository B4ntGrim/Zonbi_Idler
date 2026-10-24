// game/routes.js — Routes, live runs, points of interest, vehicle, success odds, run completion.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
// Everything attaches to the shared global ZI object; load-time calls live in game/bootstrap.js.

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
ZI.tryDiscoverVehicle = function(rng) {
  rng = rng || Math.random; // the Wandering simulation passes its random source (spec 10)
  if (ZI.hasWorkingVehicle()) return null;
  if (rng() >= ZI.VEHICLE_FIND_CHANCE) return null;
  const v = { found: true, name: ZI.VEHICLE_NAMES[Math.floor(rng() * ZI.VEHICLE_NAMES.length)], at: ZI.clockNow() };
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
// A route run takes route.duration in-game hours, on the shared game clock (game/core.js):
// 1 in-game hour = ZI.REAL_MS_PER_GAME_HOUR (6 real seconds).
ZI.ROUTE_RUN_KEY = 'zi_route_runs';
ZI.GAME_HOUR_MS = ZI.REAL_MS_PER_GAME_HOUR;
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
      const endAt = done.startedAt + done.durationMs;
      const prevMoment = ZI._buffMomentFn; ZI._buffMomentFn = () => endAt; // FX3 (D-FX3a): XP buffs judged at the run's finish time
      try { ZI.completeRun(route, done.squadIds, done.mode, done.threatLevel); } finally { ZI._buffMomentFn = prevMoment; }
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
      if (t === 'combat') ZI.emitAction('kill', 0.6, { noCellKill:true }); // route fights happen off-map
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
