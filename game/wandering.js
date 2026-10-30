// game/wandering.js — Wandering run state, background engine, policies, encounters, command limit, log queue.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
// Everything attaches to the shared global ZI object; load-time calls live in game/bootstrap.js.

// ─── COMMAND RATE LIMIT (60 / rolling 24h, server-cycle aligned) ─────────────
// The authoritative 24h cycle lives server-side; the client mirrors it with a
// rolling window anchored to the last cycle start (or first use).
ZI.CMD_LIMIT = 60;
ZI.CMD_KEY = 'zi_cmd_window';
ZI.CMD_CYCLE_MS = 24 * 60 * 60 * 1000;
ZI.getCmdWindow = function() {
  let w;
  try { w = JSON.parse(localStorage.getItem(ZI.CMD_KEY) || 'null'); } catch (e) { w = null; }
  const now = ZI.clockNow();
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
  return Math.max(0, ZI.CMD_CYCLE_MS - (ZI.clockNow() - w.start));
};
// Returns true if the command is allowed (and consumes one); false if depleted.
ZI.consumeCommand = function() {
  const w = ZI.getCmdWindow();
  if (w.count >= ZI.CMD_LIMIT) return false;
  w.count += 1;
  try { localStorage.setItem(ZI.CMD_KEY, JSON.stringify(w)); } catch (e) {}
  return true;
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

// ─── WANDERING RUN STATE (persist progress + checkpoints across tabs) ────────
// Progress is held when the player leaves the Wandering tab and restored on
// return. Each checkpoint reached is registered here so the slider bar can
// render it as a selectable point.
ZI.WANDER_RUN_KEY = 'zi_wander_run';
ZI.defaultWanderRun = function() {
  return { scroll: 0, lastCheckpoint: 0, checkpoints: [], carried: [],
           active: false, hp: 100, kills: 0, xp: 0, mats: 0, healsUsed: 0,
           moveSpeed: 1.4, maxHeals: 3, healPct: 25, lastTickAt: 0,
           paused: false, awaySummary: null, retreatSnoozes: {}, retreatHold: null, withdrawCauses: null, retreatEvade: 0, retreatEvadeRolled: false };
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
ZI._bgZombie = function(lap, rng) {
  rng = rng || Math.random;
  const pool = (ZI.fieldBestiary ? ZI.fieldBestiary() : (ZI.BESTIARY || [])).filter(z => { // Oct 29: + roster additions for new saves (Crawler)
    const rank = { F:0, E:1, D:2, C:3, B:4, A:5, S:6, BOSS:7 }[z.tier] ?? 0;
    return rank <= Math.min(7, Math.floor(lap / 1.5));
  });
  const z = pool.length ? pool[Math.floor(rng() * pool.length)] : null;
  return z ? { name: z.name, hp: z.hp, atk: z.dmg, xp: z.xp, seesThrough: ZI.retreatEvadeCounters ? ZI.retreatEvadeCounters(z) : false,
               bestiaryId: z.id, tier: z.tier, armor: z.armor || 0, ...(z.attackEvery > 1 ? { attackEvery: z.attackEvery } : {}) } // BEST1 (Sam, Oct 17): carry the picked record's existing id, tier and armor; spd/traits intentionally excluded
           : { name: 'Shambler', hp: 25, atk: 8, xp: 10 };
};

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
// No toggle: the policy decides per encounter. Ethical always evades, Heinous always fights.
// Immoral slips past anything it can't easily take; Criminal fights unless badly outmatched.
// Either will run when the survivor is hurt.
ZI.policyEvades = function(enemy, hp) {
  const p = ZI.getPolicy().id;
  if (p === 'ethical') return true;
  if (p === 'heinous') return false;
  const eHp = (enemy && (enemy.hp || enemy.currentHp)) || 30;
  const low = hp != null && hp < 35;
  if (p === 'immoral') return low || eHp >= 30;
  return low || eHp >= 60; // criminal
};
ZI.heinousUnlocked = function() { return ZI._rj('zi_heinous_unlocked', false) === true; };
ZI.policyCooldownLeftMs = function() {
  const p = ZI.getPolicy();
  if (p.id === 'heinous') return 0; // never trapped in Heinous
  return Math.max(0, (p.changedAt || 0) + ZI.POLICY_SWITCH_COOLDOWN_H * 3600000 - ZI.clockNow());
};
ZI.setPolicy = function(id) {
  const cur = ZI.getPolicy();
  if (!ZI.POLICIES[id] || id === cur.id) return { ok:false, reason:'Already active' };
  if (id === 'heinous' && !ZI.heinousUnlocked()) return { ok:false, reason:'Locked — find the Fort on a Traversal square' };
  const left = ZI.policyCooldownLeftMs();
  if (left > 0) return { ok:false, reason:`Cooldown: ${Math.ceil(left / 60000)} min left` };
  ZI._wj('zi_wander_policy', { id, changedAt: ZI.clockNow() });
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


// ── One shared step: roll + resolve a policy encounter. Live screen = 1 step; offline = many. ──
ZI.wanderPolicyStep = function(rng, ctx) {
  rng = rng || Math.random; ctx = ctx || {};
  // The Fort is now a fixed Traversal site (Hearthguard gate), not a random roll.
  const pol = ZI.getPolicy(), P = ZI.POLICIES[pol.id] || ZI.POLICIES.ethical;
  const pool = ZI.ENCOUNTER_POOLS[P.id] || ZI.ENCOUNTER_POOLS.ethical;
  const here = ZI.getTravZone && ZI.getTravZone();
  const dailyVariation = ZI.WORLD_DAILY_VARIATION || {};
  const atMs = Number.isFinite(ctx.simNow) ? ctx.simNow : undefined;
  const dailyPressure = ZI.worldDailyShift ? ZI.worldDailyShift(here, 2, 1, atMs) : 0;
  const weightNudge = dailyVariation.encounterWeightPct || 0;
  const weights = pool.map(x => x.w * (['faction','raid','zombie'].includes(x.kind)
    ? 1 + dailyPressure * weightNudge
    : 1 - dailyPressure * weightNudge * 0.5));
  let r = rng() * weights.reduce((a, w) => a + w, 0), e = pool[0];
  for (let i = 0; i < pool.length; i++) { r -= weights[i]; if (r <= 0) { e = pool[i]; break; } }
  const lvl = ZI.effectiveLevel(e.checks[0]), lvl2 = ZI.effectiveLevel(e.checks[1]);
  const cmd = ZI.effectiveLevel('command');
  let faction = null, hex = 0, standing = null;
  if (e.kind === 'faction' || e.kind === 'trade' || e.kind === 'raid' || (e.rep && e.rep < 0)) {
    faction = ZI.choosePoiAwareFaction ? ZI.choosePoiAwareFaction(rng, here, atMs) : ZI.HEX_ORDER[Math.floor(rng() * ZI.HEX_ORDER.length)];
    hex = ZI.hexModifier(ZI.alignedFaction(), faction);
    standing = ZI.repTier(ZI.getRep(faction));
  }
  let chance = 48 + lvl * 1.1 + lvl2 * 0.4 + hex + (e.kind === 'faction' ? cmd * 0.3 : 0);
  if (faction) chance += ZI.worldDailyShift ? ZI.worldDailyShift(here, 3, dailyVariation.factionCheckPct || 0, atMs) : 0;
  if (standing && (standing.name === 'Hostile' || standing.name === 'Hunted')) chance -= standing.name === 'Hunted' ? 18 : 10;
  if (P.id === 'heinous') chance += 6; // brute force
  chance = Math.max(10, Math.min(95, Math.round(chance)));
  const ok = rng() * 100 < chance;
  const scale = ok ? 1 : 0.4;
  ZI.emitAction && ZI.emitAction('enc.' + e.id, scale, { encounter: e.id });
  ZI.emitAction && ZI.emitAction('enc.baseline', 1);
  const fName = faction ? ZI.factionDisplayName(faction) : null;
  let repTxt = '';
  if (faction && e.rep) {
    const d = ok ? e.rep : Math.round(e.rep * (e.rep < 0 ? 1 : 0.3));
    if (P.id === 'heinous') ZI.HEX_ORDER.forEach(f => ZI.repApply(f, f === faction ? d : -6)); else ZI.repApply(faction, d);
    // Event-driven rivalry (spec 4.3): a second faction is drawn at random for this encounter;
    // helping one costs standing with the other. No fixed rival table.
    let rivTxt = '';
    if (d > 0) {
      const others = ZI.HEX_ORDER.filter(f => f !== faction);
      const rival = others[Math.floor(rng() * others.length)];
      const rd = -Math.ceil(d / 2); ZI.repApply(rival, rd);
      rivTxt = ` · ${ZI.factionDisplayName(rival)} ${rd} rep`;
    }
    repTxt = ` · ${fName} ${d >= 0 ? '+' : ''}${d} rep${rivTxt}`;
  }
  const lootMult = { ethical:0.8, immoral:1, criminal:1.25, heinous:1.8 }[P.id] || 1;
  const loot = ok && (e.kind === 'loot' || e.kind === 'raid' || e.kind === 'trade')
    ? { name: e.name.replace(/ \(.*\)$/, '') + ' haul', value: Math.max(2, Math.round((6 + lvl * 0.6) * lootMult)), rarity: rng() < 0.12 * lootMult ? 'Uncommon' : 'Common' } : null;
  const toolFinds = [];
  const fieldTool = (family, material, amount, label) => {
    if (!ok || !ZI.carriedHandTool || !ZI.carriedHandTool(family)) return;
    const got = ZI.addMaterial ? ZI.addMaterial(material, amount) : 0;
    if (got > 0) { ZI.useCarriedHandTool(family); toolFinds.push(`+${got} ${label}`); }
  };
  if (e.id === 'storehouse') { fieldTool('screwdriver','electronics',1,'Electronics (screwdriver)'); fieldTool('pliers','wiring',1,'Wiring (pliers)'); }
  if (e.id === 'vehicle') {
    fieldTool('wrench','fasteners',2,'Fasteners (wrench)');
    const fuel = window.ZI_MATERIALS && window.ZI_MATERIALS.fuel;
    if (ok && fuel && fuel.current >= 1 && ZI.carriedHandTool && ZI.carriedHandTool('torch')) {
      const got = ZI.addMaterial ? ZI.addMaterial('metal',3) : 0;
      if (got > 0) { fuel.current -= 1; ZI.useCarriedHandTool('torch'); toolFinds.push(`+${got} plate scrap (−1 Fuel)`); }
    }
  }
  const dmg = ok ? 0 : Math.round(4 + rng() * 8 + (e.kind === 'raid' || e.kind === 'faction' ? 6 : 0));
  const how = e.kind === 'zombie' ? (P.resolve === 'evade' ? 'evaded' : 'cut down') : ok ? 'handled' : 'botched';
  const reaction = faction && ZI.poiFactionReaction && ZI.poiFactionReaction(ZI.getTravZone && ZI.getTravZone(), faction);
  const text = `${P.icon} ${e.name}${fName ? ` (${fName}${hex ? `, hexagon ${hex > 0 ? '+' : ''}${hex}%` : ''})` : ''} — ${ok ? 'success' : 'failed'} (${chance}%): ${how}${loot ? `, +${loot.name}` : ''}${dmg ? `, took ${dmg} dmg` : ''} · ${e.checks[0]} XP${repTxt}${reaction ? ` · ${reaction.text}` : ''}${toolFinds.length ? ` · tools: ${toolFinds.join(', ')}` : ''}`;
  return { ok, encounter:e, chance, loot, dmg, faction, factionReaction:reaction, toolFinds, text, tone: ok ? 'player' : 'enemy' };
};
// Messages for the Wandering combat log, delivered next time that screen is open.
ZI.queueWanderLog = function(text) { const q = ZI._rj('zi_wander_log_queue', []); q.push(text); ZI._wj('zi_wander_log_queue', q); };
ZI.drainWanderLog = function() { const q = ZI._rj('zi_wander_log_queue', []); if (q.length) ZI._wj('zi_wander_log_queue', []); return q; };

ZI.WanderEngine = {
  timer: null,
  rng: null, // injectable random source (spec 10); null = Math.random
  start() {
    if (this.timer) return;
    this.timer = setInterval(() => { try { ZI.injuryCreditTick && ZI.injuryCreditTick(); } catch (e) {} try { this.tick(); } catch (e) {} try { ZI.decayHousekeeping && ZI.decayHousekeeping(ZI.clockNow()); } catch (e) {} }, 1000); // BAL-A D2b: the injury clock runs on visible-page ticks
  },
  // Background/offline advance. While the Wandering screen is mounted the screen drives liveStep instead.
  tick(now) {
    if (ZI.wanderMounted) return null;
    return this._run(now || ZI.clockNow(), false);
  },
  // Live screen: one call per beat; returns the results for the screen to animate.
  liveStep(now) { return this._run(now || ZI.clockNow(), true); },
  // One tab runs the simulation at a time (several open copies of a save would each fight unwatched and write HP
  // into the shared run). The tab showing the Wandering screen takes over; a lock older than 3 s is free.
  LOCK_KEY: 'zisim_lock', LOCK_MS: 3000,
  _lead(now, live) {
    const me = ZI._session || (ZI._session = 's' + Math.random().toString(36).slice(2, 10));
    const watching = !!(live && ZI.retreatWatching && ZI.retreatWatching());
    const realNow = Date.now(); // H1 (A1): simulation locking stays on real time
    let lock = null; try { lock = JSON.parse(localStorage.getItem(this.LOCK_KEY) || 'null'); } catch (e) {}
    const heldElsewhere = lock && lock.id !== me && Math.abs(realNow - (lock.at || 0)) < this.LOCK_MS;
    if (heldElsewhere && !(watching && !lock.watching)) { this.follower = true; return false; }
    try { localStorage.setItem(this.LOCK_KEY, JSON.stringify({ id: me, at: realNow, watching })); } catch (e) {}
    this.follower = false; return true;
  },
  _run(now, live) {
    const out = [];
    if (!this._lead(now, live)) return out; // another tab is running this save; this one only displays it
    const offlineWindow = !live && ZI._offlineWanderPending ? ZI._offlineWindow : null;
    if (offlineWindow) ZI._offlineWanderPending = false;
    const tickNow = offlineWindow ? offlineWindow.to : now;
    const s = ZI.getWanderRun();
    if (!s.active) { s.lastTickAt = offlineWindow ? offlineWindow.now : now; ZI.saveWanderRun(s); return out; }
    if (!s.lastTickAt) { s.lastTickAt = offlineWindow ? offlineWindow.now : now; ZI.saveWanderRun(s); return out; }
    const from = offlineWindow ? Math.max(s.lastTickAt, offlineWindow.from) : s.lastTickAt;
    const newMs = Math.max(0, tickNow - from);
    if (s.paused) { if (offlineWindow) { s.lastTickAt = offlineWindow.now; ZI.saveWanderRun(s); } return out; }
    if (newMs < ZI.WANDER_SIM_TABLE.minStepSec * 1000 && !(s._carryMs > 0)) return out; // a saved backlog can drain at the same clock instant
    // FX2 (Q2, U2): one return processes at most 24 h in total, carried time included. Time beyond the cap is discarded.
    const pending = Math.min(ZI.WANDER_SIM_TABLE.offlineCapSec * 1000, newMs + (s._carryMs || 0));
    const dtMs = Math.min(pending, newMs);           // the new part of the window
    s._carryMs = pending - dtMs;                      // the backlog part (never above the cap); no new saved field (P1)
    const dt = dtMs / 1000;
    s._simNow = tickNow - pending; // H1 (A1a): the engine seeds the simulated clock at the start of the window it runs
    s.lastTickAt = offlineWindow ? offlineWindow.now : tickNow;
    const away = live ? ZI.WanderSim.emptySummary() : (s.awaySummary || ZI.WanderSim.emptySummary());
    // BAL-A D2b: damage extends an injury only in a 'present' window: the page is visible, this session has credited a tick, and the window is one tick long.
    ZI._injPresent = !!(ZI.pageVisible && ZI.pageVisible() && ZI._injLastCredit != null && newMs <= (ZI.INJURY_TABLE ? ZI.INJURY_TABLE.tickCreditCapMs : 0));
    try { ZI.WanderSim.advance(s, dt, away, this.rng || Math.random, out, { watching: !!(live && ZI.retreatWatching && ZI.retreatWatching()) }); } finally { ZI._injPresent = false; }
    if (offlineWindow && offlineWindow.discardedMs > 0) s._simNow += offlineWindow.discardedMs;
    if (ZI.tryBandageCure) { const used = ZI.tryBandageCure(s); if (used) { const ev = { kind:'injuryTreated', from: used, text:'Field Bandage used — injury treated.' }; out.push(ev); away.injuryTreated = (away.injuryTreated || 0) + 1; } } // BAL-A D4b
    if (!live) s.awaySummary = away;
    ZI.saveWanderRun(s);
    ZI._pruneBuffs && ZI._pruneBuffs(); // FX3: cleanup only after the run's clock has moved
    return out;
  },
};

// ─── SHARED WANDERING SIMULATION (spec 9, 10; Batches 1–2A) ─────────────────
// One RollEncounter + ResolveEncounter, called through step(). The random source is passed in as a parameter
// (spec 10, injectable IRng) through _bgZombie, simulateCombat and the combat rolls. advance() walks elapsed
// time in chronological order (movement, encounters, policy events, rest), so one long catch-up and many short
// live beats give the same result. Numbers live in WANDER_SIM_TABLE and WANDER_REST_TABLE.
ZI.WANDER_SIM_TABLE = { encounterEverySec: 6, policyEverySec: 30, matsMin: 2, matsSpread: 4, topUpBelowHp: 30, maxStepsPerCall: 200, offlineCapSec: 86400, minStepSec: 0.25, codexFromWandering: false }; // BEST1 Option A: Codex boundary flag (Oct 17)
// Timed rest [PROPOSED, starting values]: out of heals → retreat to base, recover, resume. Bed tiers raise the rate later.
ZI.WANDER_REST_TABLE = { maxHp: 100, restHpPerMinutePct: 5, restResumeAtHpPct: 80 };
ZI.WanderSim = {
  emptySummary() { return { kills:0, xp:0, mats:0, dist:0, secs:0, loot:0, escapes:0, retreats:0, events:0, eventLog:[] }; },
  rollEncounter(state, rng) {
    const boost = ZI.ACTIVE_TABLE ? (state.pressure || 0) * ZI.ACTIVE_TABLE.push.tierBoost * 1.5 : 0; // Push On: +1 tier step per pressure (1.5 laps = 1 tier)
    return { kind:'zombie', z: ZI._bgZombie(Math.floor((state.scroll || 0) / 100) + boost, rng) };
  },
  resolveEncounter(state, enc, rng) {
    const T = ZI.WANDER_SIM_TABLE, R = ZI.WANDER_REST_TABLE, z = enc.z;
    const out = { kind:'zombie', enemy: z.name, bestiaryId: z.bestiaryId, tier: z.tier, outcome:null, xp:0, mats:0, loot:null, hpBefore: state.hp, dmgTaken:0, dmgDealt:0, worn:[] };
    if (ZI.discoverZombie && z.bestiaryId && T.codexFromWandering) ZI.discoverZombie(z.bestiaryId); // BEST1 Option A (Sam, Oct 17): Codex unlocks from Wandering stay off until separately approved
    if (ZI.policyEvades(z, state.hp) && ZI.STAT_FORMULAS) {
      const chance = ZI.STAT_FORMULAS.escapeChance(ZI.effectiveLevel('stealth'), state.athletics || ZI.effectiveLevel('athletics'), ZI.SurvivorRules.speedRating(state.moveSpeed), z);
      if (chance > 0 && rng() * 100 < chance) { ZI.emitAction && ZI.emitAction('wander.escape', 1, { enemy: z.name }); out.outcome = 'escaped'; return out; }
    }
    const g = ZI.resolveLoadoutStats ? ZI.resolveLoadoutStats() : {};
    const bf = ZI.combatBuffsAt ? ZI.combatBuffsAt(state._simNow || ZI.clockNow()) : { dmgPct:0, armorAdd:0 }; // B13: timed buffs, by simulated time
    const sb = ZI.STAT_FORMULAS.survivorStatBlock({ displayHP: state.hp, armorRating: (g.armorRating || 0) + bf.armorAdd, weaponDamage: Math.round((g.weaponDamage || state.weaponDamage || 10) * (1 + bf.dmgPct / 100)), speed: ZI.SurvivorRules.speedRating(state.moveSpeed), heavySwingPct: g.heavySwingPct || 0, staggerPct: g.staggerPct || 0 }); // CB1
    out.buffed = bf.dmgPct > 0 || bf.armorAdd > 0;
    if (state.retreatEvade > 0) { if (z.seesThrough) out.evadeCountered = true; else { sb.evasion += state.retreatEvade; out.evadeBuff = state.retreatEvade; } } // getaway buff
    sb.hp = state.hp; sb.hpMax = ZI.maxHp();
    if (ZI.isBroken && ZI.isBroken()) { sb.attackLossPct = ZI.BROKEN_TABLE.attackLossPct; sb.dmgTakenPct = ZI.BROKEN_TABLE.dmgTakenPct; } // BAL-A A4
    const eb = ZI.STAT_FORMULAS.enemyStatBlock(z), res = ZI.simulateCombat(sb, eb, 'idle', rng);
    out.dmgDealt = res.dmgDealt || 0;
    out.enemyHp = eb.hp; out.hits = (res.log || []).map(l => ({ by: l.by === 'survivor' ? 's' : 'e', r: l.result, d: l.dealt || 0 })); // display only: per-strike replay
    out.dmgTaken = Math.max(0, state.hp - res.hpLeft);
    if (out.dmgTaken > 0 && ZI.injuryOnDamage) ZI.injuryOnDamage(out.dmgTaken); // BAL-A D2c
    state.hp = Math.max(1, res.hpLeft); // FX1 (Q1): HP never stored below 1; Downed is decided below, not by the stored value
    if (out.dmgTaken > 0 && ZI.emitAction) ZI.emitAction('endure', Math.max(1, out.dmgTaken) / 8);
    if (res.outcome !== 'win' || state.hp <= 1) { // FX1 (U5): a lost fight, or any fight that leaves HP at 1, Downs the survivor
      const d = ZI.WanderSim._downed(state, rng, null);
      if (d.outcome === 'healed') { out.outcome = 'healed'; out.healSource = d.healSource; }
      else if (d.outcome === 'revived') { out.outcome = 'revived'; }
      else { if (d.fumbled) out.fumbled = true; out.outcome = 'forcedRetreat'; out.fr = d.fr; out.banked = out.fr ? out.fr.banked : 0; return out; }
    }
    out.outcome = out.outcome || 'win';
    state.kills = (state.kills || 0) + 1; state.xp = (state.xp || 0) + z.xp; out.xp = z.xp;
    out.mats = T.matsMin + Math.floor(rng() * T.matsSpread); state.mats = (state.mats || 0) + out.mats;
    if (ZI.emitAction) { ZI.emitAction('kill', (z.xp || 10) / 10); ZI.emitAction('loot', 1); }
    out.loot = { name: z.name + ' salvage', value: Math.max(1, z.xp), rarity: 'Common' };
    if (ZI.carriedHandTool && ZI.carriedHandTool('pliers') && ZI.addMaterial && ZI.addMaterial('bones',1) > 0) {
      ZI.useCarriedHandTool('pliers'); out.toolFinds = ['+1 Bone Fragments (teeth and bone salvage)'];
    }
    if (ZI.simPickup) { if (!ZI.simPickup(state, out.loot)) out.tooHeavy = true; } else state.carried = (state.carried || []).concat([out.loot]);
    if (ZI.wearEquippedOnKill) out.worn = ZI.wearEquippedOnKill();
    if (state.hp < T.topUpBelowHp && ZI.chargeTotals && ZI.chargeTotals().heal > 0) { const h = ZI.simHeal(state, rng, false); if (h.ok) { out.toppedUp = true; out.healSource = h.source; } }
    return out;
  },
  // FX1 (U5): the one Downed path for damage inside a run (fights, policy hits, failed ventures).
  // Heal → revive → Forced Retreat, unchanged from the fight path. away may be null (a venture chosen on screen).
  // Not used by the Fort guard attack or Traversal loot (U25, U26): those floor HP at 1 and never Down.
  _downed(state, rng, away) {
    const h = ZI.simHeal ? ZI.simHeal(state, rng, true) : null;           // canonical Heal charges (base → med kit)
    if (h && h.ok) return { outcome: 'healed', healSource: h.source };
    if (ZI.simRevive && ZI.simRevive(state)) return { outcome: 'revived' }; // B12: primed revive consumable
    const fr = (ZI.Jester && ZI.Jester.firstDowning(state, rng)) || ZI.forcedRetreat(state, 'downed', rng); // JD1a: an eligible first Downing goes to the Jester's camp (off for players)
    if (away && fr && ZI.recordForcedRetreat) ZI.recordForcedRetreat(away, fr);
    return { outcome: 'forcedRetreat', fumbled: !!(h && h.fumbled), fr };
  },
  // Out of heals: retreat to base, bank the haul (spec 13.4), then rest on a timer.
  // One encounter: roll + resolve.
  step(state, rng) { return ZI.WanderSim.resolveEncounter(state, ZI.WanderSim.rollEncounter(state, rng), rng); },
  _move(state, ms, away, events, rng) {
    // Position is kept as exact integer micrometres so it is identical for any chunking of elapsed time.
    if (state.scrollUm == null || Math.abs(state.scrollUm / 1e6 - (state.scroll || 0)) > 1e-6) state.scrollUm = Math.round((state.scroll || 0) * 1e6);
    const advUm = Math.round((state.moveSpeed || 1.4) * 1000) * ms, adv = advUm / 1e6;
    state.scrollUm += advUm; state.scroll = state.scrollUm / 1e6; away.dist = (away.dist || 0) + adv;
    const cp = Math.floor(state.scroll / ZI.CHECKPOINT_EVERY), lastCp = Math.floor((state.lastCheckpoint || 0) / ZI.CHECKPOINT_EVERY);
    if (cp > lastCp) {
      for (let i = lastCp + 1; i <= cp; i++) {
        ZI.addCheckpoint(i * ZI.CHECKPOINT_EVERY);
        ZI.emitAction && ZI.emitAction('checkpoint');
        events.push({ kind:'checkpoint', mark: i * ZI.CHECKPOINT_EVERY });
        const car = ZI.tryDiscoverVehicle && ZI.tryDiscoverVehicle(rng);
        if (car) { away.vehicle = car.name; events.push({ kind:'vehicle', name: car.name }); }
      }
      const fresh = ZI.getWanderRun();
      state.checkpoints = fresh.checkpoints; state.lastCheckpoint = fresh.lastCheckpoint;
    }
    if (ZI.checkKmUnlocks) ZI.checkKmUnlocks(state.scroll).forEach(m => events.push({ kind:'km', name: m.name, meters: m.meters }));
  },
  // Advance by dt seconds in chronological order. events collects results for the live screen to animate.
  // opts.watching (R1): the real Wandering screen is selected and foreground-visible. Default false (unwatched).
  advance(state, dt, away, rng, events, opts) {
    const T = ZI.WANDER_SIM_TABLE, R = ZI.WANDER_REST_TABLE, EM = T.encounterEverySec * 1000, PM = T.policyEverySec * 1000;
    const WS = ZI.WanderSim, watchOn = !!(opts && opts.watching), lagMs = ZI.RETREAT_RULES_TABLE ? ZI.RETREAT_RULES_TABLE.watchMaxLagMs : 0;
    events = events || []; away = away || ZI.WanderSim.emptySummary();
    state._encMs = state._encMs || 0; state._polMs = state._polMs || 0;
    let left = Math.round(dt * 1000) + (state._carryMs || 0), n = 0; state._carryMs = 0;
    if (typeof state._simNow !== 'number' || !isFinite(state._simNow)) state._simNow = state.lastTickAt || 0; // H1 (A1a): advance() reads no clock; WanderEngine seeds _simNow, which moves only by consumed time
    const prevMoment = ZI._buffMomentFn; ZI._buffMomentFn = () => state._simNow; // FX3 (Q4): buffs are judged at this step's simulated time
    try {
    away.secs = (away.secs || 0) + left / 1000;
    let guard = 0;
    while (left > 0 && n < T.maxStepsPerCall) {
      if (state.jesterCamp && ZI.Jester && ZI.Jester.waitStep(state)) { state._simNow += left; left = 0; break; } // JD1a (U38a): waiting at the camp; time passes, nothing happens, nothing is replayed
      if (ZI.SurvivorRules) state.moveSpeed = ZI.SurvivorRules.moveSpeed(state); // FX4 (Q5): speed is recomputed by rule every step; the stored value is only this step's copy
      if (++guard > 100000) { ZI._advanceGuardHit = { left, n, resting: state.resting, encMs: state._encMs, polMs: state._polMs, hp: state.hp }; break; } // safety net
      if (state.resting && WS._restStep) { // BAL-A A5: rest ends when HP ≥ 80% of max HP (exact boundary)
        const used = WS._restStep(state, left, away, events, rng); left -= used; state._simNow += used; // H1 (A1a): rest time is simulated time
        if (state.resting) break;
        continue;
      }
      if (state.retreatHold && WS._holdStep) { // R1: HOLD — movement, encounters, discoveries and travel stress paused
        left -= WS._holdStep(state, left, away, events, rng, watchOn && left <= lagMs); n++;
        continue;
      }
      if (state.resting) {
        const ratePerMs = ZI.maxHp() * R.restHpPerMinutePct / 100 / 60000, target = ZI.maxHp() * R.restResumeAtHpPct / 100;
        const need = Math.max(0, Math.ceil((target - state.restStartHp) / ratePerMs) - (state.restElapsedMs || 0));
        if (need > left) { state.restElapsedMs = (state.restElapsedMs || 0) + left; state.hp = Math.min(target, state.restStartHp + ratePerMs * state.restElapsedMs); ZI.WanderSim._onRest && ZI.WanderSim._onRest(state, left, away); state._simNow += left; left = 0; break; } // H1 (A1a)
        left -= need; state._simNow += need; state.hp = target; state.resting = false; state.restElapsedMs = 0; state.healsUsed = 0;
        ZI.WanderSim._onRest && ZI.WanderSim._onRest(state, need, away);
        ZI.refillBaseCharges && ZI.refillBaseCharges(); // D2: base charges refill when the survivor has rested at base
        events.push({ kind:'resumed', hp: state.hp });
        continue;
      }
      const A = ZI.ACTIVE_TABLE, EMp = A ? Math.round(EM / (1 + (state.pressure || 0) * A.push.encounterRateMult)) : EM;
      const DM = A ? A.discoveryEverySec * 1000 : Infinity;
      state._discMs = state._discMs || 0;
      const promptLeft = state.prompt ? Math.max(0, state.prompt.expiresInMs) : Infinity;
      ZI.WanderSim._beforeSegment && ZI.WanderSim._beforeSegment(state, away); // instant stress (low HP) settles before the segment is measured
      if (WS._ruleCheck && WS._ruleCheck(state, away, events, watchOn && left <= lagMs, rng)) { n++; continue; } // R1 rule check at every input change / boundary
      if (state.withdrawing && !state.walkHomeRolled && WS._walkHomeStart) { WS._walkHomeStart(state, away, events, rng); n++; continue; } // BAL-A A2/A3: groups and pursuers, once per walk
      const RT = WS._msToRule ? WS._msToRule(state) : Infinity; // R1: stress-rule threshold is an exact boundary
      const BK = ZI.WanderSim._msToBreak ? ZI.WanderSim._msToBreak(state) : Infinity; // B9: stop exactly at the Breaking moment
      const AR = ZI.WanderSim._msToArrive ? ZI.WanderSim._msToArrive(state) : Infinity; // withdrawal arrival is an exact boundary
      const SP = ZI.SurvivorRules ? ZI.SurvivorRules.msToSpeedChange(state._simNow) : Infinity; // FX4: a speed buff's start or end is an exact boundary
      const wd = !!state.withdrawing; // BAL-A A1/D3: encounters, policy events and discoveries are frozen (not reset) for the whole walk back
      const seg = Math.min(wd ? Infinity : EMp - state._encMs, wd ? Infinity : PM - state._polMs, (state.prompt || wd) ? Infinity : DM - state._discMs, promptLeft, BK, AR, RT, SP, left);
      if (!wd) { state._encMs += seg; state._polMs += seg; } left -= seg; state._simNow += seg;
      if (state.prompt) state.prompt.expiresInMs -= seg; else if (!wd) state._discMs += seg;
      if (seg > 0) ZI.WanderSim._move(state, seg, away, events, rng);
      if (ZI.WanderSim._afterSegment && ZI.WanderSim._afterSegment(state, away, events, rng)) { n++; continue; }
      if (state.prompt && state.prompt.expiresInMs <= 0) {
        n++; events.push(ZI.resolvePrompt(state, null, away, rng));
        ZI.flushTooHeavy && ZI.flushTooHeavy(state, away, events); // BAL-A parity fix
      } else if (!wd && state._encMs >= EMp) {
        state._encMs = 0; n++;
        const r = ZI.WanderSim.step(state, rng); events.push(r);
        ZI.flushTooHeavy && ZI.flushTooHeavy(state, away, events); // BAL-A parity fix: report 'too heavy' right after the step that caused it, not at a chunk-dependent segment end
        const inc = (k, v) => { away[k] = (away[k] || 0) + (v == null ? 1 : v); }; // works with older summary shapes too
        if (r.dmgTaken) inc('dmgTaken', r.dmgTaken); // shown on return so HP loss is never unexplained
        if (r.outcome === 'escaped') inc('escapes');
        else if (r.outcome === 'forcedRetreat') ZI.recordForcedRetreat(away, r.fr);
        else { inc('kills'); inc('xp', r.xp); inc('mats', r.mats); inc('loot'); }
      } else if (!wd && state._polMs >= PM) {
        state._polMs = 0; n++;
        const r = ZI.wanderPolicyStep(rng, { simNow:state._simNow });
        if (r.dmg) { state.hp = Math.max(1, state.hp - r.dmg); away.dmgTaken = (away.dmgTaken || 0) + r.dmg; ZI.injuryOnDamage && ZI.injuryOnDamage(r.dmg); }
        if (r.loot) { if (ZI.simPickup) ZI.simPickup(state, r.loot); else state.carried = (state.carried || []).concat([r.loot]); }
        if (r.policeStationSearchEvent) away.policeStationSearches = (away.policeStationSearches || 0) + 1;
        if (r.policeStationQuestComplete) away.policeStationQuestComplete = true;
        ZI.flushTooHeavy && ZI.flushTooHeavy(state, away, events); // BAL-A parity fix
        events.push({ kind:'policy', text: r.text, tone: r.tone, dmg: r.dmg || 0, loot: r.loot || null });
        away.events = (away.events || 0) + 1; away.eventLog = (away.eventLog || []).concat([r.text]).slice(-4);
        if (r.dmg && state.hp <= 1) { // FX1 (U5): a policy hit that brings HP to 1 Downs the survivor
          const d = WS._downed(state, rng, away);
          const txt = d.outcome === 'healed' ? `⛑ Downed — you patch yourself up (${d.healSource === 'base' ? 'base charge' : 'med kit'}).`
            : d.outcome === 'revived' ? '💀 Downed — Revenant Infusion triggers, back on your feet.'
            : '☠ ' + (d.fr ? ZI.forcedRetreatText(d.fr) : 'Downed — forced retreat.');
          events.push({ kind:'policy', tone: d.outcome === 'forcedRetreat' ? 'enemy' : 'player', text: txt, dmg: 0, loot: null, downed: d.outcome, fr: d.fr || null });
        }
      } else if (!wd && !state.prompt && state._discMs >= DM) {
        state._discMs = 0; n++;
        const p = ZI.createPrompt && ZI.createPrompt(state, rng);
        if (p) events.push({ kind:'prompt', prompt: p });
      }
    }
    if (left <= 0 && !state.resting && !state.jesterWait && WS._ruleCheck) { WS._beforeSegment && WS._beforeSegment(state, away); WS._ruleCheck(state, away, events, watchOn, rng); } // end-of-chunk check (same simulated moment)
    if (left > 0) state._carryMs = (state._carryMs || 0) + left; // step cap reached: remaining time is kept for the next call
    } finally { ZI._buffMomentFn = prevMoment; } // FX3: the step moment never outlives advance(), even on an error
    return state;
  },
};
// Seeded RNG for reproducible runs and tests (mulberry32).
ZI.seededRng = function(seed) { let a = seed >>> 0; return function() { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
