// H2 — Matrix runner and report (reference/h2-batch-draft.md; CURRENT_BATCH.md, locked Oct 15).
// Headless, deterministic, no game file changes. Every "return" is a real page load: all game scripts are evaluated
// fresh against the saved storage (bootstrap settles run), then the background engine ticks once per simulated second
// until it has caught up (the page stays open until the catch-up is done). Nothing is granted to the survivor.
//
// Harness-only environment (never written to a save, never in the game files):
//  - the Jester switch is turned on in the harness's in-memory copy of game/active.js (JD1a check 10)
//  - Date and Math.random are pinned to the simulated clock and a seeded stream; ZI.installRolls(master seed)
//  - WanderEngine._lead always leads (single-tab; simulation locking is a real-time multi-tab guard, H1 A1)
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto');

const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const T0 = 1790500000000, S = 1000, M = 60000, H = 3600000, DAY = 86400000;
const CFG = {                       // H2 data table (brief D4, D5, D6, D9; spec §12.6 once closed)
  days: 30, returnEveryH: 8, seeds: [101, 202, 303, 404, 505],
  policies: ['ethical', 'immoral', 'criminal', 'heinous'],
  starts: ['A', 'B-bat', 'B-iron_knuckles', 'B-pocket_knife'],
  drainMaxTicks: 200000,            // S2 guard for one catch-up
  s4WindowH: 24, runawayRatio: 3,  // D6 S4, D9
};
const KIT_IDS = ['handmade_pouch', 'scout_kit', 'medkit', 'fort_medkit', 'old_padded_jacket'];

const h32 = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h >>> 0; };
const mulberry = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
const fp = (o) => crypto.createHash('sha256').update(JSON.stringify(o, Object.keys(o).sort())).digest('hex').slice(0, 16);

function loadSrc(root) {
  const rd = (p) => fs.readFileSync(path.join(root, p), 'utf8');
  const parts = ORDER.map(m => {
    let s = rd('game/' + m + '.js');
    if (m === 'active') {
      const n = (s.match(/firstMeetingOn: false,/g) || []).length;
      if (n !== 1) throw new Error('STOP: Jester switch text not found exactly once in game/active.js (' + n + ')');
      s = s.replace('firstMeetingOn: false,', 'firstMeetingOn: true, /* H2 harness copy only */');
    }
    return s;
  });
  return rd('bestiary-data.js') + '\n' + parts.join('\n');
}

// One page load. store persists across loads; clk.t is the simulated clock; key seeds Math.random and the engine rng.
function pageLoad(src, store, clk, seed, key) {
  const ls = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; },
    key: i => Object.keys(store)[i], get length() { return Object.keys(store).length; } };
  const r = mulberry(h32(seed + ':math:' + key)); const Mth = Object.create(Math); Mth.random = r;
  class D extends Date { constructor(...a) { if (a.length) super(...a); else super(clk.t); } static now() { return clk.t; } }
  const quiet = { log() {}, warn() {}, error() {}, info() {} };
  const fw = { localStorage: ls, sessionStorage: ls, console: quiet, Date: D, Math: Mth, JSON, setInterval: () => 0, clearInterval: () => {}, setTimeout: () => 0, clearTimeout: () => {},
    document: { hidden: true, visibilityState: 'hidden', addEventListener() {}, querySelectorAll: () => [] }, addEventListener() {}, location: { reload() {} } };
  fw.window = fw; fw.ZI = { _installedClock: () => clk.t };
  new Function('fw', 'with(fw){' + src + '}')(fw);
  const Z = fw.ZI; Z.wanderMounted = false; Z.installRolls(h32(seed + ':rolls'));
  Z.WanderEngine.rng = Z.seededRng(h32(seed + ':wander:' + key)); Z.WanderEngine._lead = () => true;
  return Z;
}

const sumObj = (o) => Object.values(o || {}).reduce((a, v) => a + (typeof v === 'number' ? v : 0), 0);
const kitCount = (Z) => { const all = Z.getStash().concat(Object.values(Z.getLoadout()).filter(Boolean)); const car = Z.getCarried();
  const out = {}; KIT_IDS.forEach(id => { out[id] = all.filter(x => x === id).length + car.filter(e => e.id === id).reduce((a, e) => a + (e.qty || 1), 0); }); return out; };

// ── One run ──────────────────────────────────────────────────────────────────
function runOne(src, opt) {
  const start = opt.start, policy = opt.policy, seed = opt.seed, days = opt.days || CFG.days, every = (opt.returnEveryH || CFG.returnEveryH) * H;
  const weapon = start.startsWith('B-') ? start.slice(2) : null;
  const tag = [start, policy, seed].join('|');
  const store = {}, clk = { t: T0 };
  const rec = { kills: 0, maxRestMs: 0, downed: 0, downedHealed: 0, start, weapon, policy, seed, days, returnEveryH: every / H, fixtures: [], headless: [], checks: {}, fails: [], warns: [], info: { restMs: 0, waitMs: 0 },
    firstDowningDay: null, jester: null, events: { withdrawn: 0, forcedRetreat: 0, breaking: 0, jesterDisplacement: 0, resumed: 0 }, heals: { total: 0, whileResting: 0 },
    stressOnlyRestMs: 0, trap: { cycles: 0, emptyCycles: 0, maxEmptyStreak: 0 }, daily: [], returns: 0, drainTicks: 0, snapshot: null };

  // Day 0: new save (the real new-game path), then the first page load.
  let Z = pageLoad(src, store, clk, seed, 'new');
  Z.startNewInSlot('survival', 1);
  if (start === 'A') { // H2-a: designed skipper — switch on (harness only), not eligible, no kit
    Z.Jester.put({ v: 1, eligible: false, met: false, phase: null, h2Fixture: 'H2-a skipped tutorial' });
    Z._wj('zi_starter_kit_given', true); // the skipper forfeits the kit (U14/U37): marks it handled so the load-time kit migration never grants it
    rec.fixtures.push('H2-a: Jester record eligible:false (skipped tutorial); zi_starter_kit_given=true with no kit items (kit forfeited)');
  }
  Z = pageLoad(src, store, clk, seed, 'r0');
  { // A new save opens on Traversal (zi_fresh_start): the Traversal screen picks the starting square. Same logic as
    // screens-v3.jsx ~703–712 (random unlocked cell of the first sector), with the page's pinned Math.random.
    let p = Z._rj('zi_trav_pos', null);
    if (!p) { const open = []; for (let r = 0; r < Z.SECTOR_ROWS; r++) for (let c = 0; c < Z.SECTOR_COLS; c++) { const q = Z.worldCell(c, r, 'scavenge'); if (q.state !== 'locked') open.push(q); }
      const pick = open[Math.floor(Z.roll('h2-trav-start') * open.length)] || Z.worldCell(0, 0, 'scavenge'); p = Z.zoneFromCell(pick); Z._wj('zi_trav_pos', p); Z._wj('zi_trav_start', p); }
    rec.travStart = { gx: p.gx, gy: p.gy, name: p.name, biome: p.biome };
    rec.fixtures.push('First Traversal visit: start square picked as the Traversal screen does (screens-v3.jsx ~703)');
  }
  if (policy === 'heinous') { Z._wj('zi_wander_policy', { id: 'heinous', changedAt: 0 }); rec.fixtures.push('Heinous unlocked (D4 fixture)'); }
  else { const r = Z.setPolicy(policy); if (!r.ok && Z.getPolicy().id !== policy) throw new Error('policy ' + policy + ': ' + r.reason); }
  Z.syncWanderState({ active: true }); Z.WanderEngine.tick(clk.t);   // the player opens Wandering once, then leaves it running
  const kit0 = kitCount(Z);
  rec.startState = { kit: kit0, kitGiven: !!Z._rj('zi_starter_kit_given', false), jester: Z.Jester.get(), loadout: Z.getLoadout(), capacity: Z.getCapacity ? Z.getCapacity() : null };
  rec.checks.startOk = start === 'A'
    ? (Object.values(kit0).every(n => n === 0) && rec.startState.jester && rec.startState.jester.eligible === false)
    : (Object.values(kit0).every(n => n === 0) && !rec.startState.kitGiven && rec.startState.jester && rec.startState.jester.eligible === true);

  const restWorstMs = RESTWORST_MS;
  let curRestMs = 0, maxRestMs = 0, noProgMs = 0, lastProg = null, cycleOpen = false, cycleBanked = 0, emptyStreak = 0, prevStocks = null;
  const fail = (code, msg) => { if (rec.fails.length < 20) rec.fails.push({ code, day: +((clk.t - T0) / DAY).toFixed(3), msg }); };

  const returns = Math.floor(days * DAY / every);
  for (let n = 1; n <= returns; n++) {
    clk.t = T0 + n * every;
    Z = pageLoad(src, store, clk, seed, 'r' + n);
    rec.returns++;
    // Hooks (observe only)
    const WS = Z.WanderSim, step0 = WS.step.bind(WS), rest0 = WS._restStep, wait0 = Z.Jester.waitStep.bind(Z.Jester);
    let restedThisReturn = 0, waitedThisReturn = false;
    WS.step = function (state, rng) { const out = step0(state, rng); validate(Z, state, fail); return out; };
    WS._restStep = function (state, left, away, events) {
      const q = WS._restNeedMs(state), hpNeed = Math.max(0, q.hpTotal - (state.restElapsedMs || 0));
      const used = rest0.call(this, state, left, away, events);
      curRestMs += used; if (!state.resting) { maxRestMs = Math.max(maxRestMs, curRestMs); if (curRestMs > restWorstMs) fail('S5', 'one rest lasted ' + (curRestMs / H).toFixed(1) + ' h (worst case ' + (restWorstMs / H).toFixed(1) + ' h)'); curRestMs = 0; }
      restedThisReturn += used; rec.info.restMs += used; rec.stressOnlyRestMs += Math.max(0, used - hpNeed);
      validate(Z, state, fail); return used;
    };
    Z.Jester.waitStep = function (state) { const w = wait0(state); if (w) { waitedThisReturn = true; if (!rec.jester) rec.jester = {}; if (rec.jester.waitStartT == null) rec.jester.waitStartT = state._simNow; } return w; };
    const sh0 = Z.simHeal; Z.simHeal = function (state, rng, down) { const r = sh0.call(this, state, rng, down); if (r && r.ok) { rec.heals.total++; if (state.resting) rec.heals.whileResting++; } return r; };

    // Catch up: the page stays open, ticking each simulated second, until no time is left to process.
    const killsBefore = rec.kills, distBefore = Z.getLifetimeDistance ? Z.getLifetimeDistance() : 0;
    let events = Z.WanderEngine.tick(clk.t) || [], k = 0;
    while ((Z.getWanderRun()._carryMs || 0) > 0 && k < CFG.drainMaxTicks) { clk.t += S; events = events.concat(Z.WanderEngine.tick(clk.t) || []); k++; }
    rec.drainTicks += k;
    if ((Z.getWanderRun()._carryMs || 0) > 0) fail('S2', 'time left unprocessed after ' + k + ' catch-up ticks');
    if (Z._advanceGuardHit) { fail('S1', 'advance() safety guard hit ' + JSON.stringify(Z._advanceGuardHit)); Z._advanceGuardHit = null; }
    Z.decayHousekeeping && Z.decayHousekeeping(clk.t);

    // Events → counts, first Downing, trap cycles
    for (const e0 of events) {
      if (!e0 || !e0.kind) continue;
      // A Downing travels inside the fight event (outcome 'forcedRetreat', fr) or a policy event (downed, fr)
      const e = (e0.kind === 'zombie' && e0.outcome === 'forcedRetreat' && e0.fr) || (e0.kind === 'policy' && e0.downed === 'forcedRetreat' && e0.fr) || e0;
      if (e !== e0) rec.downed = (rec.downed || 0) + 1;
      if (e0.kind === 'zombie' && (e0.outcome === 'win' || e0.outcome === 'healed' || e0.outcome === 'revived')) rec.kills++;
      if (e0.kind === 'zombie' && e0.outcome === 'healed' || e0.kind === 'policy' && e0.downed === 'healed') rec.downedHealed = (rec.downedHealed || 0) + 1;
      if (!(e.kind in rec.events)) continue;
      rec.events[e.kind]++;
      if ((e.kind === 'forcedRetreat' && e.cause === 'downed') || e.kind === 'jesterDisplacement') { if (rec.firstDowningDay == null) rec.firstDowningDay = +((clk.t - T0) / DAY).toFixed(3); }
      if (e.kind === 'withdrawn' || e.kind === 'forcedRetreat' || e.kind === 'breaking' || e.kind === 'jesterDisplacement') { cycleOpen = true; cycleBanked = e.banked || 0; }
      if (e.kind === 'resumed' && cycleOpen) { cycleOpen = false; rec.trap.cycles++; if (cycleBanked > 0) emptyStreak = 0; else { rec.trap.emptyCycles++; emptyStreak++; rec.trap.maxEmptyStreak = Math.max(rec.trap.maxEmptyStreak, emptyStreak); } }
    }

    // H2-b: the idle player completes the Jester meeting at this return if the survivor is waiting
    const j = Z.Jester.get(), run = Z.getWanderRun();
    if (start === 'A' && (run.jesterCamp || (j && j.phase))) fail('A-JESTER', 'Scenario A entered the Jester path: ' + JSON.stringify(j));
    if (weapon && j && j.eligible && !j.met && j.phase === 'waiting') {
      const before = kitCount(Z), m = Z.Jester.meet(weapon), after = kitCount(Z);
      rec.jester = Object.assign(rec.jester || {}, { meetT: clk.t, meetDay: +((clk.t - T0) / DAY).toFixed(3), result: m, kitBefore: before, kitAfter: after, waitMs: rec.jester && rec.jester.waitStartT != null ? clk.t - rec.jester.waitStartT : null,
        weaponEquipped: Z.getLoadout().melee || null, record: Z.Jester.get() });
      rec.info.waitMs += rec.jester.waitMs || 0;
    } else if (waitedThisReturn && !weapon) fail('S3', 'waiting at the Jester camp in Scenario A');

    // D6: S3 states with no finite end; S5 rest beyond its worst case; S4 no progress
    const r2 = Z.getWanderRun();
    classifyState(r2, Z.Jester.get(), start).filter(c => c.cls === 'FAIL').forEach(c => fail(c.code, c.msg));
    if (r2.resting && curRestMs > restWorstMs) fail('S5', 'a rest still running after ' + (curRestMs / H).toFixed(1) + ' h (worst case ' + (restWorstMs / H).toFixed(1) + ' h)');
    const progressed = rec.kills !== killsBefore || (Z.getLifetimeDistance ? Z.getLifetimeDistance() : 0) > distBefore + 1;
    if (progressed) noProgMs = 0; else if (!(restedThisReturn > 0) && !waitedThisReturn) noProgMs += every;
    if (noProgMs >= CFG.s4WindowH * H) { if (rec.warns.length < 20) rec.warns.push({ code: 'S4', day: +((clk.t - T0) / DAY).toFixed(3), msg: Math.round(noProgMs / H) + ' h without progress' }); noProgMs = 0; }

    // Headless values (FX4 shared rules) and daily stocks
    rec.headless.push({ day: +((clk.t - T0) / DAY).toFixed(3), moveSpeed: Z.SurvivorRules.moveSpeed(r2), healPct: Z.SurvivorRules.healPct(r2) });
    if ((n * every) % DAY === 0) {
      const stocks = { day: (n * every) / DAY, hp: +r2.hp.toFixed(2), stress: +Z.getStress().toFixed(2), kills: rec.kills, distM: Math.round(Z.getLifetimeDistance ? Z.getLifetimeDistance() : 0),
        materials: sumObj(Z._rj('zi_materials', {})), wanderLoot: (Z._rj('zi_wander_loot', []) || []).length, stash: Z.getStash().length, rmat: sumObj(Z.getRmatHoldings ? Z.getRmatHoldings() : {}),
        charXp: Z.getCharacterXp ? Z.getCharacterXp() : null, charges: Z._rj('zi_charges', {}), resting: !!r2.resting, carried: (r2.carried || []).length };
      rec.daily.push(stocks); prevStocks = stocks;
    }
  }

  rec.maxRestMs = Math.max(maxRestMs, curRestMs);
  // End-of-run checks
  const kitEnd = kitCount(Z), jEnd = Z.Jester.get();
  rec.end = { kit: kitEnd, jester: jEnd, kitGiven: !!Z._rj('zi_starter_kit_given', false) };
  if (start === 'A') rec.checks.startsClaim = Object.values(kitEnd).every(n => n === 0) && !(jEnd && jEnd.phase) && jEnd.eligible === false;
  else if (rec.jester && rec.jester.result && rec.jester.result.ok) {
    const a = rec.jester.kitAfter, b = rec.jester.kitBefore;
    rec.checks.startsClaim = a.old_padded_jacket - b.old_padded_jacket === 1 && a.handmade_pouch - b.handmade_pouch === 1 && a.fort_medkit - b.fort_medkit === 1 && a.scout_kit - b.scout_kit === 1
      && jEnd.met === true && jEnd.weapon === weapon && rec.end.kitGiven === true;
  } else rec.checks.startsClaim = rec.firstDowningDay == null ? 'no meeting (no Downing in ' + days + ' days)' : false;
  // D9: runaway (report-only)
  const d10 = rec.daily.find(d => d.day === 10), dN = rec.daily[rec.daily.length - 1];
  rec.runaway = {}; if (d10 && dN && dN.day > 10) ['materials', 'wanderLoot', 'stash', 'rmat', 'charXp'].forEach(kk => { const a = d10[kk] || 0, b = dN[kk] || 0; rec.runaway[kk] = a > 0 ? +(b / a).toFixed(2) : null; });
  rec.runawayFlags = Object.entries(rec.runaway).filter(([, v]) => v != null && v > CFG.runawayRatio).map(([kk]) => kk);
  rec.result = rec.fails.length ? 'FAIL' : rec.warns.length ? 'WARN' : 'OK';
  if (rec.fails.length) rec.snapshot = { run: Z.getWanderRun(), jester: jEnd, stress: Z.getStress() };
  const st = Object.assign({}, store); delete st.zisim_lock; rec.storeHash = fp(st);
  if (opt.keepStore) Object.defineProperty(rec, '_store', { value: store, enumerable: false }), Object.defineProperty(rec, '_t', { value: clk.t, enumerable: false });
  rec.recordHash = fp(Object.assign({}, rec, { recordHash: undefined }));
  return rec;
}

// D6 classification of a run state at the end of a return (also used by the planted-state tests)
function classifyState(run, jesterRec, start) {
  const out = [];
  if (run.paused) out.push({ cls: 'FAIL', code: 'S3', msg: 'run paused with no timer' });
  if (run.prompt && !isFinite(run.prompt.expiresInMs)) out.push({ cls: 'FAIL', code: 'S3', msg: 'prompt with no timer' });
  if (run.retreatHold && !isFinite(run.retreatHold.expiresInMs)) out.push({ cls: 'FAIL', code: 'S3', msg: 'HOLD with no timer' });
  if (run.jesterWait || (jesterRec && jesterRec.phase === 'waiting')) out.push(start === 'A' ? { cls: 'FAIL', code: 'S3', msg: 'Scenario A waiting at the Jester camp' } : { cls: 'INFO', code: 'JESTER-WAIT', msg: 'waiting for the player at the Jester camp (U38a; the idle player meets him at the next return, H2-b)' });
  if (run.resting) out.push({ cls: 'INFO', code: 'REST', msg: 'resting' });
  return out;
}
const RESTWORST_MS = 16 * M + Math.ceil(30 / 20 * DAY);   // 1 HP → 80% at 5%/min + stress 100 → < 70 at the Bedroll rate (20/day); PF1 Oct 16 (was → < 50)
function classifyRest(ms) { return ms > RESTWORST_MS ? { cls: 'FAIL', code: 'S5', msg: 'one rest lasted ' + (ms / H).toFixed(1) + ' h (worst case ' + (RESTWORST_MS / H).toFixed(1) + ' h)' } : null; }

// D7 validity after every step
function validate(Z, state, fail) {
  const hp = state.hp, st = Z.getStress();
  if (!isFinite(hp) || hp < 1 - 1e-9 || hp > 100 + 1e-9) fail('D7', 'HP out of bounds: ' + hp);
  if (!isFinite(st) || st < 0 || st > 100) fail('D7', 'stress out of bounds: ' + st);
  const ch = Z._rj('zi_charges', {}); if (Object.values(ch).some(v => !isFinite(v) || v < 0)) fail('D7', 'charges out of bounds: ' + JSON.stringify(ch));
}

// ── Summary report ───────────────────────────────────────────────────────────
function summary(recs) {
  const L = [];
  const by = (f) => { const m = {}; recs.forEach(r => { const k = f(r); (m[k] = m[k] || []).push(r); }); return m; };
  const avg = (a, f) => a.length ? +(a.reduce((s, r) => s + (f(r) || 0), 0) / a.length).toFixed(2) : 0;
  L.push('# H2 report', '', `Runs: ${recs.length}. Days: ${recs[0] ? recs[0].days : '-'}. Returns every ${recs[0] ? recs[0].returnEveryH : '-'} h.`, '');
  L.push('**Limitations:** G3 reputation forgiveness settles at most one day per page load (3 loads/day here); G4 no difficulty modifiers (Normal only); Q3 XP decay floor unverified (XP bound: finite); narrated tutorial finds (U11) not built.', '');
  L.push('**Excluded systems (D3):** Routes (no claims, no vehicle wear) · Schedule (no camp jobs or job XP; base skills look more decayed) · Crafting (no material sinks; materials read high; kits and gear never crafted) · Fort scenes (no Fallow quest; Heinous via fixture) · Camp Leader (solo only).', '');
  const starts = by(r => r.start);
  for (const s of Object.keys(starts)) {
    L.push(`## Start ${s}`, '', '| Policy | Runs | OK/WARN/FAIL | Kills/day | km/day | Withdrawals | Forced (downed) | Breakings | Heals | Rest h | Stress-only rest h | Trap max streak | First Downing day | Meeting day | Runaway flags |', '|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
    const pol = by.call(null, r => r.start + '|' + r.policy);
    Object.keys(pol).filter(k => k.startsWith(s + '|')).forEach(k => { const a = pol[k], last = (r) => r.daily[r.daily.length - 1] || {};
      const cnt = (x) => a.filter(r => r.result === x).length;
      L.push(`| ${a[0].policy} | ${a.length} | ${cnt('OK')}/${cnt('WARN')}/${cnt('FAIL')} | ${avg(a, r => (last(r).kills || 0) / r.days)} | ${avg(a, r => (last(r).distM || 0) / 1000 / r.days)} | ${avg(a, r => r.events.withdrawn)} | ${avg(a, r => r.events.forcedRetreat)} | ${avg(a, r => r.events.breaking)} | ${avg(a, r => r.heals.total)} | ${avg(a, r => r.info.restMs / H)} | ${avg(a, r => r.stressOnlyRestMs / H)} | ${Math.max(...a.map(r => r.trap.maxEmptyStreak))} | ${avg(a, r => r.firstDowningDay)} | ${a[0].weapon ? avg(a, r => r.jester && r.jester.meetDay) : '—'} | ${[...new Set(a.flatMap(r => r.runawayFlags))].join(', ') || '—'} |`); });
    L.push('');
  }
  const fails = recs.filter(r => r.fails.length || r.warns.length);
  L.push('## Failures and warnings', '');
  if (!fails.length) L.push('None.'); else fails.forEach(r => L.push(`- ${r.start} ${r.policy} seed ${r.seed}: ` + r.fails.concat(r.warns).slice(0, 5).map(f => `${f.code} day ${f.day}: ${f.msg}`).join('; ')));
  return L.join('\n');
}

function runMatrix(root, opt) {
  const src = loadSrc(root), recs = [];
  for (const start of opt.starts) for (const policy of opt.policies) for (const seed of opt.seeds) {
    const t = Date.now(); const r = runOne(src, { start, policy, seed, days: opt.days }); r.wallMs = Date.now() - t; recs.push(r);
    if (opt.onRun) opt.onRun(r);
  }
  return recs;
}

module.exports = { CFG, T0, H, DAY, loadSrc, pageLoad, runOne, runMatrix, summary, kitCount, fp, classifyState, classifyRest, RESTWORST_MS };

if (require.main === module) {
  const a = process.argv.slice(2), root = a[0] || process.cwd(), mode = a[1] || 'dry';
  const out = path.join(root, 'reports', 'sim-harness-v1', mode); fs.mkdirSync(out, { recursive: true });
  const opt = mode === 'dry' ? { starts: CFG.starts, policies: ['ethical'], seeds: [CFG.seeds[0]], days: 3 } : { starts: CFG.starts, policies: CFG.policies, seeds: CFG.seeds, days: CFG.days };
  const recs = runMatrix(root, Object.assign(opt, { onRun: r => { fs.writeFileSync(path.join(out, `${r.start}_${r.policy}_${r.seed}.json`), JSON.stringify(r, null, 1)); console.log(r.start, r.policy, r.seed, r.result, 'firstDowning', r.firstDowningDay, 'meet', r.jester && r.jester.meetDay, 'wall', r.wallMs + 'ms'); } }));
  fs.writeFileSync(path.join(out, 'SUMMARY.md'), summary(recs)); console.log('wrote', out);
}
