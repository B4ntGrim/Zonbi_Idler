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
    r.duration /= 10; // CLOCK-01 T9: preserve each route's real duration at the slower game clock.
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
// Keep every unclaimed haul inside the existing per-slot Last Run save.
// Legacy reports have one haul; claimed reports contribute nothing.
ZI.getUnclaimedRouteRewards = function(last = ZI.getLastRun()) {
  if (!last || last.claimed) return { hauls: [], loot: 0, runs: 0 };
  const hauls = Array.isArray(last.unclaimedHauls) ? last.unclaimedHauls
    : [{ name: `${last.name} haul`, value: last.loot, rarity: 'Common' }];
  return { hauls, loot: hauls.reduce((sum, haul) => sum + (haul.value || 0), 0), runs: hauls.length };
};
// Shared by route XP grants and the Idle preview on both game pages.
ZI.ROUTE_XP_MULTIPLIERS = { active: 1, passive: 0.8 };
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

// Solo route preparation: shared preview, departure snapshot, and outcome rules.
(function defineSoloRoutePreparation() {
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
ZI.ROUTE_PREP_TABLE={
  combatPerLevel:0.5,athleticsCombatPerLevel:0.1,weaponPerDamage:0.3,armorPerPoint:0.25,
  referenceDamage:8,threatPenalty:2,minWin:5,maxWin:95,
  stealthPerLevel:0.8,escapeToAvoid:0.2,quietAvoidBonus:12,maxAvoid:65,
  athleticsTravelPerLevel:0.01,loadTravelPenalty:0.4,minTravelMultiplier:0.5,maxTravelMultiplier:3,
  weaponNoise:{rifle:1,shotgun:1.2,pistol:0.8,revolver:1,suppressed:0.25,compound_bow:0},
  rangedNoise:1,meleeNoise:0.2,bootsNoiseMultiplier:0.8
};
ZI.routeUsesSoloPreparation=function(squadIds){
  return !(squadIds&&squadIds.length) && !(ZI.currentGameMode&&ZI.currentGameMode()==='camp');
};
ZI.routeLootCapacity=function(kg){
  if(kg<0.5)return 0;
  let low=0,high=Math.ceil(kg*6+6);
  while(low<high){
    const mid=Math.ceil((low+high)/2);
    if(ZI.salvageWeight(mid)<=kg)low=mid;else high=mid-1;
  }
  return low;
};
ZI.getRoutePreparation=function(route,threatLevel){
  if(!route)return null;
  const T=ZI.ROUTE_PREP_TABLE,gear=ZI.resolveLoadoutStats(),carry=ZI.carryTotals();
  const skills={};['combat','stealth','athletics','scavenging'].forEach(k=>{skills[k]=ZI.effectiveLevel(k);});
  const loadout=ZI.getLoadout(),weapons=[];
  let noise=0;
  ['primary','secondary','melee'].forEach(slot=>{
    const item=loadout[slot]&&ZI.getGearItem(loadout[slot]);
    if(!item || (ZI.itemHasDurability(item)&&ZI.itemWorn(item)))return;
    weapons.push(item.name);
    const n=T.weaponNoise[item.id] ?? (slot==='melee'?T.meleeNoise:T.rangedNoise);
    noise=Math.max(noise,n);
  });
  const boots=loadout.boots&&ZI.getGearItem(loadout.boots);
  if(boots&&boots.id==='boots_t2'&&!ZI.itemWorn(boots))noise*=T.bootsNoiseMultiplier;
  const biome=(ZI.BIOMES||[]).find(b=>b.id===route.biome);
  const base=ZI.BIOME_SUCCESS[route.risk||(biome&&biome.danger)||1]??50;
  const combat=clamp(Math.round(base+(skills.combat-1)*T.combatPerLevel+
    (skills.athletics-1)*T.athleticsCombatPerLevel+
    (Math.max(T.referenceDamage,gear.weaponDamage)-T.referenceDamage)*T.weaponPerDamage+
    gear.armorRating*T.armorPerPoint-Math.max(0,threatLevel||0)*T.threatPenalty),T.minWin,T.maxWin);
  const avoid=clamp(Math.round((skills.stealth-1)*T.stealthPerLevel+
    (gear.escapeBonus||0)*T.escapeToAvoid+Math.max(0,1-noise)*T.quietAvoidBonus),0,T.maxAvoid);
  const loadRatio=carry.capacityKg>0?carry.rawLoadKg/carry.capacityKg:0;
  const travelMultiplier=clamp((1+loadRatio*T.loadTravelPenalty)/
    (Math.max(10,gear.speed)/100)/(1+(skills.athletics-1)*T.athleticsTravelPerLevel),
    T.minTravelMultiplier,T.maxTravelMultiplier);
  const durationHours=Math.max(0.1,route.duration||0.1)*travelMultiplier;
  const freeKg=Math.max(0,carry.hardLimitKg-carry.rawLoadKg);
  const maxLoot=ZI.routeLootCapacity(freeKg);
  return {
    version:1,characterLevel:ZI.getCharacterLevel(),skills,
    weaponNames:weapons,weaponDamage:gear.weaponDamage,armor:gear.armorRating,gearSpeed:gear.speed,
    lootFind:gear.lootFind||0,noise,noiseLabel:noise<=0.3?'Quiet':noise<=0.8?'Moderate':'Loud',
    combatWinChance:combat,avoidChance:avoid,travelMultiplier,durationHours,
    durationMs:Math.max(1,Math.round(durationHours*ZI.GAME_HOUR_MS)),
    loadKg:carry.loadKg,capacityKg:carry.capacityKg,hardLimitKg:carry.hardLimitKg,
    freeKg:Math.floor(freeKg*10)/10,maxLoot,
    canDeploy:maxLoot>0,
    blockedReason:maxLoot>0?'':'No room for loot. Unload items or equip a larger pack.',
    factors:[
      'Combat '+skills.combat+' · weapon power '+gear.weaponDamage+' · armor '+gear.armorRating,
      'Stealth '+skills.stealth+' · '+(noise<=0.3?'quiet':noise<=0.8?'moderate':'loud')+' equipment',
      'Athletics '+skills.athletics+' · load '+carry.loadKg+' kg'
    ]
  };
};
// Field tools can recover small, node-specific materials during a route run.
// They use the same carried/equipped inventory and condition progression as Wandering.
ZI.routeToolSalvage=function(type){
  const finds=[];
  const award=(family,material,amount,label)=>{
    if(!ZI.carriedHandTool||!ZI.carriedHandTool(family))return;
    const got=ZI.addMaterial?ZI.addMaterial(material,amount):0;
    if(got>0){ZI.useCarriedHandTool(family);finds.push('+'+got+' '+label+' ('+family+')');}
  };
  if(type==='combat')award('pliers','bones',1,'Bone Fragments');
  if(type==='loot'){
    award('hammer','fasteners',2,'Fasteners');
    award('screwdriver','electronics',1,'Electronics');
    award('pliers','wiring',1,'Wiring');
  }
  if(type==='vehicle'){
    award('wrench','fasteners',2,'Fasteners');
    if(ZI.carriedHandTool&&ZI.carriedHandTool('torch')){
      const fuel=window.ZI_MATERIALS&&window.ZI_MATERIALS.fuel;
      if(fuel&&fuel.current>=1){const got=ZI.addMaterial?ZI.addMaterial('metal',3):0;if(got>0){fuel.current-=1;ZI.useCarriedHandTool('torch');finds.push('+'+got+' Metal plate scrap (torch, −1 Fuel)');}}
    }
  }
  return finds;
};
ZI.resolvePreparedRouteNodes=function(route,mode,preparation){
  const P=preparation,lootMult=mode==='passive'?0.7:1,log=[],actions=[{id:'move',scale:1}];
  let loot=0,losses=null,avoided=0,won=0,lost=0;
  const matName=['Trace RMAT','Scrap','Electronics','Copper','Cores','Echo'][route.rmatTier]||'Salvage';
  for(const node of route.nodes){
    const type=ZI.routeNodeType(node);
    if(type==='combat'){
      if(Math.random()*100<P.avoidChance){
        avoided++;actions.push({id:'sneak',scale:1});
        log.push({node,type,text:'Slipped past — Stealth and quiet equipment avoided a fight'});
      }else if(Math.random()*100<P.combatWinChance){
        won++;const g=3+Math.floor(Math.random()*route.rmatTier*3+4);loot+=g;
        actions.push({id:'kill',scale:0.6,meta:{noCellKill:true}});
        const tools=ZI.routeToolSalvage(type);
        log.push({node,type,text:'Cleared — +'+g+' salvage'+(tools.length?' · '+tools.join(', '):'')});
      }else{
        lost++;losses='Survivor injured';actions.push({id:'endure',scale:1});
        log.push({node,type,text:'Overrun — encounter readiness was insufficient'});
      }
    }else if(type==='loot'){
      const g=Math.round((6+Math.random()*(route.rmatTier*5+6)+P.lootFind)*lootMult);
      loot+=g;actions.push({id:'loot',scale:1});
      const tools=ZI.routeToolSalvage(type);
      log.push({node,type,text:'Looted +'+g+' '+matName+(tools.length?' · '+tools.join(', '):'')});
    }else if(type==='hazard'){
      const dmg=Math.round(route.risk*3*Math.random());loot=Math.max(0,loot-dmg);
      actions.push({id:'endure',scale:1});
      log.push({node,type,text:dmg?'Hazard — lost '+dmg+' salvage':'Hazard avoided'});
    }else if(type==='vehicle'){
      const tools=ZI.routeToolSalvage(type);
      log.push({node,type,text:'Vehicle site inspected on foot'+(tools.length?' · '+tools.join(', '):'')});
    }else if(type==='extraction'){
      loot=Math.round(loot*lootMult);log.push({node,type,text:'Extraction'});
    }else{
      log.push({node,type,text:'Departed on foot — '+P.loadKg+' kg carried; '+P.freeKg+' kg room for loot'});
    }
  }
  const lootLeftBehind=Math.max(0,loot-P.maxLoot);loot=Math.min(loot,P.maxLoot);
  if(lootLeftBehind)log.push({node:'Pack capacity',type:'loot',text:'Left '+lootLeftBehind+' salvage behind — pack space limited the haul'});
  log.filter(e=>e.type==='extraction').forEach(e=>{e.text='Returned with '+loot+' loot';});
  log.push({node:'Preparation',type:'start',text:P.factors.join(' · ')});
  return {prob:P.combatWinChance,loot,vehicleWear:0,losses,log,actions,preparation:P,
    outcomes:{avoided,won,lost,lootLeftBehind,capacityLimited:lootLeftBehind>0}};
};
})();

// ─── LIVE ROUTE RUNS (continuous progress along the node chain) ──────────────
// A route run takes route.duration in-game hours, on the shared game clock (game/core.js):
// 1 in-game hour = ZI.REAL_MS_PER_GAME_HOUR (60 real seconds).
ZI.ROUTE_RUN_KEY = 'zi_route_runs';
ZI.GAME_HOUR_MS = ZI.REAL_MS_PER_GAME_HOUR;
ZI._readRouteRuns = function() {
  try { return JSON.parse(localStorage.getItem(ZI.ROUTE_RUN_KEY) || '{}') || {}; } catch (e) { return {}; }
};
ZI._saveRouteRuns = function(r) { try { localStorage.setItem(ZI.ROUTE_RUN_KEY, JSON.stringify(r)); } catch (e) {} };
ZI.startRouteRun = function(route, squadIds, mode, threatLevel, autoRepeat) {
  if (!route) return { ok: false, reason: 'No route selected' };
  const preparation = ZI.routeUsesSoloPreparation(squadIds) ? ZI.getRoutePreparation(route, threatLevel) : null;
  if (preparation && !preparation.canDeploy) return { ok: false, reason: preparation.blockedReason };
  const runs = ZI._readRouteRuns();
  runs[route.id] = { startedAt: ZI.clockNow(), durationMs: preparation ? preparation.durationMs : Math.max(0.1, route.duration) * ZI.GAME_HOUR_MS,
    squadIds: (squadIds || []).slice(), mode, threatLevel: threatLevel || 0, autoRepeat: !!autoRepeat, preparation };
  ZI._saveRouteRuns(runs);
  return { ok: true, preparation };
};
ZI.setRouteRunRepeat = function(routeId, on) {
  const runs = ZI._readRouteRuns();
  if (runs[routeId]) { runs[routeId].autoRepeat = !!on; ZI._saveRouteRuns(runs); }
};
// Settle-on-read: finished runs resolve into Last Run; auto-repeat restarts them
// from their finish time so offline repeats chain correctly.
ZI.settleRouteRuns = function(offlineWindow) {
  const runs = ZI._readRouteRuns(); const now = offlineWindow ? offlineWindow.to : ZI.clockNow(); let changed = false;
  Object.entries(runs).forEach(([id, r]) => {
    const route = (ZI.ROUTES || []).find(x => x.id === id);
    if (!route) { delete runs[id]; changed = true; return; }
    // Bound by the actual number due, rather than silently stopping after 50.
    // The shared load window already caps the credited absence at 24 real hours.
    if (!(r.durationMs > 0) || !Number.isFinite(r.durationMs) || !Number.isFinite(r.startedAt)) { delete runs[id]; changed = true; return; }
    const due = Math.max(0, Math.floor((now - r.startedAt) / r.durationMs));
    let guard = 0;
    while (runs[id] && now >= runs[id].startedAt + runs[id].durationMs && guard < due) {
      guard++; changed = true;
      const done = runs[id];
      const endAt = done.startedAt + done.durationMs;
      const prevMoment = ZI._buffMomentFn; ZI._buffMomentFn = () => endAt; // FX3 (D-FX3a): XP buffs judged at the run's finish time
      try { ZI.completeRun(route, done.squadIds, done.mode, done.threatLevel, done.preparation); } finally { ZI._buffMomentFn = prevMoment; }
      if (done.autoRepeat) runs[id] = Object.assign({}, done, { startedAt: done.startedAt + done.durationMs });
      else delete runs[id];
    }
  });
  if (offlineWindow && offlineWindow.discardedMs > 0) {
    Object.values(runs).forEach(r => { if (Number.isFinite(r.startedAt)) { r.startedAt += offlineWindow.discardedMs; changed = true; } });
  }
  if (changed) ZI._saveRouteRuns(runs);
  return runs;
};
// Live progress for one route: null if not running.
ZI.routeRunProgress = function(routeId) {
  const r = ZI.settleRouteRuns()[routeId];
  if (!r) return null;
  const elapsed = Math.max(0, ZI.clockNow() - r.startedAt);
  return { pct: Math.min(1, elapsed / r.durationMs), remainingMs: Math.max(0, r.durationMs - elapsed),
    elapsedMs: elapsed, durationMs: r.durationMs, autoRepeat: r.autoRepeat, mode: r.mode, preparation: r.preparation || null };
};

// ─── HOOK 3 — Success Probability formula ────────────────────────────────────
// Aggregate squad strength vs. route difficulty + global threat. Cheap enough
// to recompute live as the player toggles squad members.
// Fixed success chance per biome tier — a set number, not a live/random estimate
// (the previous Monte-Carlo roll re-randomised every render, so the meter flickered).
// Keyed by biome danger rating; tunable here as a single balance table.
ZI.BIOME_SUCCESS = { 1: 85, 2: 65, 3: 45, 4: 30, 5: 20 };
ZI.estimateSuccessProbability = function(route, squadIds, threatLevel, preparation) {
  if (!route) return 0;
  if (ZI.routeUsesSoloPreparation(squadIds)) return (preparation || ZI.getRoutePreparation(route, threatLevel)).combatWinChance;
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
ZI.resolveRunNodes = function(route, squadIds, mode, threatLevel, preparation) {
  if (ZI.routeUsesSoloPreparation(squadIds)) return ZI.resolvePreparedRouteNodes(route, mode, preparation || ZI.getRoutePreparation(route, threatLevel));
  const prob = ZI.estimateSuccessProbability(route, squadIds, threatLevel);
  const lootMult = mode === 'passive' ? 0.7 : 1.0;
  const log = [];
  let loot = 0, vehicleWear = 0, losses = null;
  const matName = ['Trace RMAT','Scrap','Electronics','Copper','Cores','Echo'][route.rmatTier] || 'Salvage';
  for (const node of route.nodes) {
    const type = ZI.routeNodeType(node);
    if (type === 'combat') {
      const won = Math.random() * 100 < prob;
      if (won) { const g = 3 + Math.floor(Math.random() * route.rmatTier * 3 + 4); loot += g; const tools=ZI.routeToolSalvage(type); log.push({ node, type, text:`Cleared — +${g} salvage${tools.length ? ` · ${tools.join(', ')}` : ''}` }); }
      else { log.push({ node, type, text:`Overrun — took injuries` }); if (!losses) losses = 'Survivor injured'; }
    } else if (type === 'loot') {
      const g = Math.round((6 + Math.random() * (route.rmatTier * 5 + 6)) * lootMult);
      loot += g; const tools=ZI.routeToolSalvage(type); log.push({ node, type, text:`Looted +${g} ${matName}${tools.length ? ` · ${tools.join(', ')}` : ''}` });
    } else if (type === 'hazard') {
      const dmg = Math.round(route.risk * 3 * Math.random());
      log.push({ node, type, text:`Hazard — ${dmg ? `lost ${dmg} salvage` : 'avoided'}` });
      loot = Math.max(0, loot - dmg);
    } else if (type === 'vehicle') {
      const tools=ZI.routeToolSalvage(type);
      if (ZI.hasWorkingVehicle && ZI.hasWorkingVehicle()) {
        vehicleWear += route.vehicleWear || 10;
        log.push({ node, type, text:`Vehicle checkpoint — −${route.vehicleWear || 10}% condition${tools.length ? ` · ${tools.join(', ')}` : ''}` });
      } else {
        log.push({ node, type, text:`Abandoned vehicles — nothing drivable here${tools.length ? ` · ${tools.join(', ')}` : ''}` });
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
ZI.completeRun = function(route, squadIds, mode, threatLevel, preparation) {
  if (!route) return null;
  const r = ZI.resolveRunNodes(route, squadIds, mode, threatLevel, preparation);
  const pending = ZI.getUnclaimedRouteRewards();
  const hrs = r.preparation ? r.preparation.durationHours : route.duration;
  const summary = {
    routeId: route.id, name: route.name, biome: route.biome,
    nodes: route.nodes.slice(), squadIds: (squadIds || []).slice(), mode,
    time: hrs >= 1 ? `${Math.round(hrs * 10) / 10}h` : `${Math.round(hrs * 60)}m`,
    loot: r.loot, vehicleWear: r.vehicleWear, losses: r.losses,
    log: r.log, preparation: r.preparation || null, outcomes: r.outcomes || null, claimed: false, at: ZI.buffMoment(),
    unclaimedHauls: pending.hauls.concat([{ name: `${route.name} haul`, value: r.loot, rarity: 'Common' }]),
  };
  ZI.setLastRun(summary);
  ZI.addPoiVisits(route.id, (route.nodes || []).length); // every node on a finished run counts as a visit
  // Route completion + per-node resolution feed the bus (Change 4.5).
  if (ZI.emitAction) {
    const xpMult = ZI.ROUTE_XP_MULTIPLIERS[mode] ?? 1;
    ZI.emitAction('run.complete', (1 + (route.risk || 1) * 0.3) * xpMult);
    if (r.actions) r.actions.forEach(action => ZI.emitAction(action.id, action.scale * xpMult, action.meta));
    else (route.nodes || []).forEach(n => {
      const t = ZI.routeNodeType(n);
      if (t === 'combat') ZI.emitAction('kill', 0.6 * xpMult, { noCellKill:true }); // route fights happen off-map
      else if (t === 'loot') ZI.emitAction('loot', xpMult);
      else if (t === 'hazard') ZI.emitAction('endure', xpMult);
    });
  }
  return summary;
};
// Claim all retained route hauls once, preserving each haul's recycler conversion.
ZI.claimLastRun = function() {
  const last = ZI.getLastRun();
  if (!last || last.claimed) return { ok: false, reason: last ? 'Already claimed' : 'No run to claim' };
  const pending = ZI.getUnclaimedRouteRewards(last);
  if (typeof ZI.bankWanderLoot !== 'function') return { ok: false, reason: 'Rewards unavailable. Try again.' };
  ZI.bankWanderLoot(pending.hauls.filter(haul => haul.value > 0));
  last.claimed = true;
  delete last.unclaimedHauls;
  ZI.setLastRun(last);
  return { ok: true, amount: pending.loot };
};
// Validate that a route+squad can be re-sent (Send Again).
ZI.canSendAgain = function(route, squadIds) {
  if (!route) return { ok: false, reason: 'No route selected' };
  if (ZI.routeUsesSoloPreparation(squadIds)) {
    const preparation = ZI.getRoutePreparation(route);
    return preparation.canDeploy ? { ok: true } : { ok: false, reason: preparation.blockedReason };
  }
  const roster = ZI.SQUAD_ROSTER || [];
  const squad = (squadIds || []).map(id => roster.find(s => s.id === id)).filter(Boolean);
  if (squad.some(s => s.hp <= 0)) return { ok: false, reason: 'A squad member is down' };
  return { ok: true };
};
