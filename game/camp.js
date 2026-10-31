// game/camp.js — Schedule jobs, camp buildings, Camp Leader, sieges.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
// Everything attaches to the shared global ZI object; load-time calls live in game/bootstrap.js.

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
ZI.SCHEDULE_OFFLINE_CAP_H = 24; // compatibility constant; shared real-time window is authoritative
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
ZI.emitScheduleTick = function(jobId, hours, remainder) {
  const job = ZI.getJob(jobId); if (!job || hours <= 0) return;
  const logisticsOutput = Math.min(0.1225, ZI.professionBonus ? ZI.professionBonus('logistics', 0.0025) : 0);
  const outputMult = (1 + logisticsOutput) * (1 + logisticsOutput)
    * (jobId === 'farm' ? 1 + Math.min(0.1225, ZI.professionBonus ? ZI.professionBonus('foraging', 0.0025) : 0) : 1);
  // Retain sub-point XP between live ticks. Rounding each one-second grant used to
  // make the total depend on how often the page settled the same elapsed time.
  const grant = (track, amount) => {
    if (!remainder) { ZI.awardXp(track, amount, { action:'schedule.tick', jobId }); return; }
    const total = amount + (remainder[track] || 0), whole = Math.round(total + 1e-9);
    remainder[track] = total - whole;
    if (whole > 0) ZI.awardXp(track, whole, { action:'schedule.tick', jobId });
  };
  grant(job.profession, job.xpPerHour * hours * outputMult);
  if (job.attr) grant(job.attr, job.xpPerHour * hours * (job.attrRatio || 0.4) * outputMult);
};
// Offline catch-up: settle each assignment's elapsed time in game hours (capped). 1 game hour = ZI.REAL_MS_PER_GAME_HOUR.
ZI.settleSchedule = function(window) {
  const s = ZI.getSchedule(); let any = false;
  const now = ZI.clockNow();
  window = window || { from:0, to:now, now };
  s.assignments.forEach(a => {
    const start = Math.max(a.lastTick || a.since, window.from);
    const elapsedH = Math.max(0, window.to - start) / ZI.REAL_MS_PER_GAME_HOUR;
    if (elapsedH > 0) { ZI.emitScheduleTick(a.jobId, elapsedH, a.xpRemainder || (a.xpRemainder = {})); any = true; }
    // The uncapped remainder of an absence is discarded for this assignment.
    a.lastTick = Math.max(a.lastTick || a.since, window.now);
  });
  if (s.assignments.length) ZI.saveSchedule(s);
  return s.assignments.length;
};

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
// CLOCK-01 T9: stored construction game-seconds are divided by ten to preserve
// their real build times at the new one-minute game-hour rate.
ZI.CAMP_STRUCTURES.forEach(s => (s.build || []).forEach(b => { if (Number.isFinite(b.time)) b.time /= 10; }));
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
  const cost = st.build[lvl]; if (!cost) return null;
  const efficiency = Math.min(0.1225, ZI.professionBonus ? ZI.professionBonus('engineering', 0.0025) : 0);
  if (!efficiency) return cost;
  const materials = Object.fromEntries(Object.entries(cost.materials || {}).map(([k, q]) => [k, Math.max(1, Math.ceil(q * (1 - efficiency)))]));
  return Object.assign({}, cost, { materials });
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
  // cost.time is CLOCK-01-rescaled game seconds; the job engine counts real seconds.
  ZI.enqueueJob('build', id, (cost.time || 60) * ZI.REAL_MS_PER_GAME_HOUR / 3600000, { toLevel: targetLevel });
  return { ok:true, level: targetLevel, queued:true };
};
// Consumer helpers — structure levels feed other systems.
ZI.structureEffect = function(id, key) {
  const st = ZI.getStructure(id); const lvl = ZI.structureLevel(id);
  if (!st || !lvl || !st.effectPerLevel || st.effectPerLevel[key] == null) return 0;
  const base = st.effectPerLevel[key] * lvl;
  if (id === 'farm' && key === 'foodOutput') return Math.round(base * (1 + Math.min(0.1225, ZI.professionBonus ? ZI.professionBonus('foraging', 0.0025) : 0)));
  return base;
};
ZI.recyclerOpSpeedBonus = function() { return ZI.structureEffect('recycler', 'opSpeed'); };
ZI.rosterCapacity = function() { return 4 + ZI.structureEffect('barracks', 'rosterCapacity'); };
ZI.campDefenseRating = function() {
  const base = ZI.structureEffect('watchtower', 'defenseRating');
  return Math.round(base * (1 + Math.min(0.1225, ZI.professionBonus ? ZI.professionBonus('engineering', 0.0025) : 0)));
};

// ─── CAMP LEADER (fixed player avatar) ───────────────────────────────────────
ZI.LEADER_KEY = 'zi_leader';
ZI.LEADER_VER = 1;
// Starter leader archetypes (subset of character types) with attribute leanings.
ZI.LEADER_ARCHETYPES = [
  { id:'vanguard',  name:'Vanguard',  lean:'Combat / Valor',        icon:'⚔', start:{ combat:120, endurance:80 } },
  { id:'forager',   name:'Forager',   lean:'Scavenging / Survival', icon:'🔍', start:{ scavenging:150, foraging:80 } },
  { id:'artisan',   name:'Artisan',   lean:'Smithing / Mechanical', icon:'🔨', start:{ smithing:120, mechanical:100 } },
  { id:'envoy',     name:'Envoy',     lean:'Diplomat / Command',    icon:'🤝', start:{ diplomat:120, command:80 } },
  { id:'paramedic', name:'Paramedic', lean:'First Aid / Medical', icon:'⛑', start:{ firstAid:120, medical:80 } },
  { id:'mechanic', name:'Mechanic', lean:'Mechanical / Engineering', icon:'⚙', start:{ mechanical:120, engineering:80 } },
  { id:'ranger', name:'Park Ranger', lean:'Foraging / Discovery', icon:'🌲', start:{ foraging:120, discovery:80 } },
  { id:'courier', name:'Courier', lean:'Athletics / Logistics', icon:'📦', start:{ athletics:120, logistics:80 } },
  { id:'firefighter', name:'Firefighter', lean:'Endurance / First Aid', icon:'🚒', start:{ endurance:120, firstAid:80 } },
  { id:'librarian', name:'Librarian', lean:'Discovery / Logistics', icon:'📚', start:{ discovery:120, logistics:80 } },
  { id:'electrician', name:'Electrician', lean:'Engineering / Mechanical', icon:'⚡', start:{ engineering:120, mechanical:80 } },
  { id:'farmer', name:'Farmer', lean:'Foraging / Endurance', icon:'🌾', start:{ foraging:120, endurance:80 } },
  { id:'chef', name:'Chef', lean:'Foraging / Medical', icon:'🍲', start:{ foraging:120, medical:80 } },
  { id:'teacher', name:'Teacher', lean:'Command / Discovery', icon:'✎', start:{ command:120, discovery:80 } },
  { id:'trader', name:'Trader', lean:'Trading / Diplomat', icon:'💰', start:{ trading:120, diplomat:80 } },
  { id:'surveyor', name:'Surveyor', lean:'Discovery / Engineering', icon:'🧭', start:{ discovery:120, engineering:80 } },
  { id:'carpenter', name:'Carpenter', lean:'Engineering / Smithing', icon:'🪚', start:{ engineering:120, smithing:80 } },
  { id:'nurse', name:'Nurse', lean:'Medical / First Aid', icon:'💊', start:{ medical:120, firstAid:80 } },
  { id:'dispatcher', name:'Dispatcher', lean:'Logistics / Command', icon:'📻', start:{ logistics:120, command:80 } },
  { id:'athlete', name:'Athlete', lean:'Athletics / Endurance', icon:'🏃', start:{ athletics:120, endurance:80 } },
  { id:'locksmith', name:'Locksmith', lean:'Stealth / Mechanical', icon:'🗝', start:{ stealth:120, mechanical:80 } },
  { id:'journalist', name:'Journalist', lean:'Discovery / Diplomat', icon:'📰', start:{ discovery:120, diplomat:80 } },
  { id:'salvager', name:'Salvager', lean:'Scavenging / Smithing', icon:'🧰', start:{ scavenging:120, smithing:80 } },
  { id:'coordinator', name:'Coordinator', lean:'Logistics / Diplomat', icon:'📋', start:{ logistics:120, diplomat:80 } },
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
ZI.wallMaxHp = function() { return Math.round((100 + ZI.structureLevel('walls') * 120) * (1 + Math.min(0.1225, ZI.professionBonus ? ZI.professionBonus('engineering', 0.0025) : 0))); };
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
