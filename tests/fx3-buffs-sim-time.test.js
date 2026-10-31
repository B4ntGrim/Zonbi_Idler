// Batch FX3: buffs on simulation time — the 11 acceptance checks (reference/fx3-buffs-sim-time-slice.md §7; CURRENT_BATCH.md).
// Q4: a buff applies at a step iff from ≤ step time < until, where step time is the simulated time of the step being processed.
// D-FX3a: Jobs and Routes catch-ups judge XP buffs at each finish time. Reading never deletes; cleanup waits for every catch-up.
// Probe: every Wandering encounter step records the simulated time and what each buff reader returns at that moment.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const S = 1000, M = 60000, H = 3600000, T0 = 1790500000000;
const mkEnv = (store0) => {
  const store = Object.assign({ zi_world_seed:'12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify({ gx:0, gy:0, name:'Home', biome:'suburbia', difficulty:1 }) }, store0 || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  /* Oct 29: consumable-only healing ships (base heals 0); this suite tests heal-charge mechanics with the legacy base charges. Shipped rule: tests/proposals-oct29.test.js */ new Function('fw', 'with(fw){' + (src).replace('baseHeal: 0, baseScout: 2, commandPerkLevel: 40, commandPerkHeal: 0', 'baseHeal: 2, baseScout: 2, commandPerkLevel: 40, commandPerkHeal: 1') + '}')(fw); const ZI = fw.ZI; ZI.wanderMounted = false; ZI._wj('zi_charges', { heal: 999, scout: 0 });
  return { ZI, store };
};
const run0 = (ZI, o) => Object.assign(ZI.defaultWanderRun(), { active:true, hp:100, moveSpeed:3, scroll:400, scrollUm:400e6, lastCheckpoint:250, checkpoints:[250] }, o || {});
const rig = (opt) => { opt = opt || {}; const E = mkEnv(opt.store), Z = E.ZI; const c = { t: opt.t0 || T0 }; Z.installClock(() => c.t);
  Z.WanderEngine.rng = Z.seededRng(opt.seed || 7); Z.WanderEngine._lead = () => true; if (opt.maxSteps) Z.WANDER_SIM_TABLE.maxStepsPerCall = opt.maxSteps;
  const probes = []; const step = Z.WanderSim.step.bind(Z.WanderSim);
  Z.WanderSim.step = function (state, rng) { const t = state._simNow;
    probes.push({ t, n: Z.getActiveBuffs().length, dmg: Z.combatBuffsAt(t).dmgPct, evade: Z.activeEvadeBonus(), xp: Z.activeXpBonuses().combat || 0, m: Z.buffMoment() });
    return step(state, rng); };
  Z.saveWanderRun(run0(Z, Object.assign({ lastTickAt: c.t }, opt.run || {})));
  const tick = (t, live) => { c.t = t; return live ? Z.WanderEngine.liveStep(t) : Z.WanderEngine.tick(t); };
  const at = (t, fn) => { const k = c.t; c.t = t; fn(); c.t = k; }; // do something at another clock time (e.g. use a consumable before leaving)
  return { Z, E, c, probes, tick, at, run: () => Z.getWanderRun() }; };
const drain = (r, live) => { let n = 0; while ((r.run()._carryMs || 0) > 0 && n < 50000) { r.tick(r.c.t + S, live); n++; } return n; };
const inWin = (t, from, until) => t >= from && t < until;
// Every probe agrees with the rule, and the moment the readers used is the step's simulated time.
const ruleOk = (probes, from, until, key) => probes.length > 0 && probes.every(p => p.m === p.t && ((p[key] > 0) === inWin(p.t, from, until)));
const sig = (probes, key) => probes.map(p => (p.t - T0) + ':' + (p[key] > 0 ? 1 : 0)).join(',');
const dmgBuff = (r, from, sec) => r.at(from, () => r.Z.addBuff({ dmgPct: 50, durationSec: sec }));

// Oct 31 (TIER-01 divisor 3.0): fixture seed 3 for checks 1 and 5 (was 7). The divisor re-rolls the seed-7 walk, and seed 7 puts no encounter in the buff window, so the checks passed on nothing. Assertions unchanged.
// 1 — G1 criterion: 1-s, uneven, bulk and step-capped processing, watched and offline, give the same buff window
{ const F = T0 + 60 * S, U = F + 90 * S, END = T0 + 10 * M; // early window: a fresh run fights in its first minutes
  const play = (mode) => { const r = rig({ seed: 3, maxSteps: mode === 'capped' ? 3 : 0 }); dmgBuff(r, F, 90);
    if (mode === 'sec' || mode === 'watched') for (let t = T0 + S; t <= END; t += S) r.tick(t, mode === 'watched');
    else if (mode === 'uneven') { const g = r.Z.seededRng(99); let t = T0; while (t < END) { t = Math.min(END, t + Math.round(1 + g() * 36) * S); r.tick(t); } }
    else { r.tick(END); drain(r); }
    return r.probes.filter(p => p.t <= END); };
  const v = ['sec', 'watched', 'uneven', 'bulk', 'capped'].map(play); const s0 = sig(v[0], 'dmg');
  check('1: a buff applies on every simulated step in [t, t+d) and on none after, identically for 1-s, watched, uneven, bulk and step-capped processing',
    v.every(p => ruleOk(p, F, U, 'dmg') && sig(p, 'dmg') === s0) && v[0].some(p => p.dmg > 0), v.map(p => p.length + '/' + p.filter(x => x.dmg > 0).length).join(' ')); }

// 2 — the G1 bug: a 40-s buff used just before leaving, then 2 h away → applied for exactly its 40 simulated seconds
{ const r = rig(); dmgBuff(r, T0, 40); r.tick(T0 + 2 * H); drain(r);
  const inside = r.probes.filter(p => inWin(p.t, T0, T0 + 40 * S));
  check('2: 40-s buff, then 2 h away: every catch-up step in its 40 simulated seconds is buffed, none after (old build: none)',
    ruleOk(r.probes, T0, T0 + 40 * S, 'dmg') && inside.length > 0 && inside.every(p => p.dmg > 0), inside.length + ' steps inside, ' + r.probes.filter(p => p.dmg > 0).length + ' buffed of ' + r.probes.length); }

// 3 — expiry exactly on a step boundary (encounters every 6 s from the run start): the step at t+d is unbuffed
{ const r = rig(); const F = T0 + 12 * S, U = T0 + 36 * S; dmgBuff(r, F, 24); r.tick(T0 + 2 * M); drain(r);
  const onU = r.probes.find(p => p.t === U), onF = r.probes.find(p => p.t === F), last = r.probes.find(p => p.t === U - 6 * S);
  const R2 = rig(); dmgBuff(R2, F, 24); // a fresh copy for the reader boundaries (the first one's ended buff is cleaned up after the drain)
  const Z = R2.Z; const rd = (t) => { Z._buffMomentFn = () => t; const n = Z.getActiveBuffs().length; Z._buffMomentFn = null; return n; };
  check('3: the step exactly at expiry is unbuffed; the step at the start and the one before expiry are buffed (reader: until−1 ms on, until off, from on, from−1 ms off)',
    onU && onU.dmg === 0 && onU.n === 0 && onF && onF.dmg > 0 && last && last.dmg > 0 && rd(U - 1) === 1 && rd(U) === 0 && rd(F) === 1 && rd(F - 1) === 0,
    JSON.stringify({ onU: onU && onU.n, onF: onF && onF.n, last: last && last.n })); }

// 4 — escape (evade) and XP buffs follow the same rule as the damage buff, read inside the catch-up
{ const r = rig(); const F = T0 + 30 * S, U = F + 45 * S;
  r.at(F, () => { r.Z.addBuff({ evade: 15, durationSec: 45 }); r.Z.addBuff({ xpBonus: { track: 'combat', amount: 4 }, durationSec: 45 }); });
  r.tick(T0 + H); drain(r);
  check('4: escape and XP buffs apply on exactly the steps in [from, until) during a 1-h catch-up, like the damage buff',
    ruleOk(r.probes, F, U, 'evade') && ruleOk(r.probes, F, U, 'xp') && r.probes.some(p => p.evade === 15 && p.xp === 4), r.probes.filter(p => p.evade > 0).length + ' evade / ' + r.probes.filter(p => p.xp > 0).length + ' xp steps'); }

// 5 — long absence (72 h, FX2 cap) with carried time: the buff window matches an uninterrupted run over the same 24 h
{ const F = T0 + 48 * H + M, U = F + 2 * M; // the processed window starts at 48 h (24 h cap); a fresh run fights in its first minutes
  const away = rig({ seed: 3, maxSteps: 40 }); dmgBuff(away, F, 120); away.tick(T0 + 72 * H); drain(away);
  const watched = rig({ seed: 3, t0: T0 + 48 * H, run: { lastTickAt: T0 + 48 * H } }); dmgBuff(watched, F, 120);
  for (let t = T0 + 48 * H + 10 * S; t <= T0 + 48 * H + 30 * M; t += 10 * S) watched.tick(t);
  const win = (p) => p.filter(x => x.t >= T0 + 48 * H && x.t < F + 10 * M);
  check('5: 72 h away in 40-step calls: the buff applies over the same simulated window as an uninterrupted run (processing starts at the 24 h cap)',
    ruleOk(away.probes, F, U, 'dmg') && ruleOk(watched.probes, F, U, 'dmg') && sig(win(away.probes), 'dmg') === sig(win(watched.probes), 'dmg') && win(away.probes).some(p => p.dmg > 0) && Math.min(...away.probes.map(p => p.t)) >= T0 + 48 * H,
    win(away.probes).filter(p => p.dmg > 0).length + ' buffed steps each'); }

// 6 — cleanup: a buff still needed survives every read and tick; one that ended before every catch-up is removed
{ const r = rig({ maxSteps: 2 }); const F = T0 + H, U = F + 40 * S; dmgBuff(r, F, 40); const stored = () => JSON.parse(r.E.store.zi_active_buffs || '[]').length;
  r.tick(T0 + 2 * H); const liveRead = r.Z.getActiveBuffs().length; const after1 = stored();
  let ok = true; for (let i = 0; i < 2000 && r.run()._simNow < U; i++) { r.Z.getActiveBuffs(); r.Z.activeXpBonuses(); r.tick(r.c.t + S); if (r.run()._simNow < U && stored() !== 1) ok = false; }
  drain(r); const afterDrain = stored();
  // a finished-but-unsettled job holds a buff; settling it releases it
  const J = rig({ run: { active: false } }); J.at(T0, () => J.Z.addBuff({ xpBonus: { track: 'combat', amount: 3 }, durationSec: 60 }));
  J.Z.saveJobs({ v: J.Z.JOBS_VER, jobs: [{ id: 'j1', type: 'craft', refId: 'x', status: 'active', startedAt: T0, duration: 30 }] });
  J.Z._grantJob = () => true; J.c.t = T0 + 2 * H; const heldByJob = J.Z._pruneBuffs().length; J.Z._settleJobs(J.c.t); const releasedAfterJob = J.Z._pruneBuffs().length;
  check('6: a buff the catch-up still needs survives reads and ticks (the live read outside the run sees none, without deleting); once every catch-up has passed it, it is removed',
    after1 === 1 && liveRead === 0 && ok && afterDrain === 0 && heldByJob === 1 && releasedAfterJob === 0, JSON.stringify({ after1, liveRead, ok, afterDrain, heldByJob, releasedAfterJob })); }

// 7 — a buff used during the catch-up (live, at the current clock) never applies to earlier steps
{ const r = rig({ maxSteps: 5 }); const NOW = T0 + 3 * M; r.tick(NOW); const simAtUse = r.run()._simNow;
  r.Z.addBuff({ dmgPct: 50, durationSec: 60 }); drain(r); for (let t = r.c.t + S; t <= NOW + 2 * M; t += S) r.tick(t);
  check('7: a buff used mid-catch-up applies to no step before the moment it was used, and does apply after it',
    simAtUse < NOW && r.probes.filter(p => p.t < NOW).every(p => p.dmg === 0) && r.probes.some(p => p.t >= NOW && p.dmg > 0), 'sim at use ' + ((NOW - simAtUse) / S).toFixed(0) + ' s behind; ' + r.probes.filter(p => p.t >= NOW && p.dmg > 0).length + ' buffed steps after'); }

// 8 — XP-track refresh (no stacking) and default durations unchanged
{ const { ZI: Z } = mkEnv(); const c = { t: T0 }; Z.installClock(() => c.t);
  Z.addBuff({ xpBonus: { track: 'combat', amount: 5 }, durationSec: 60 }); c.t = T0 + 30 * S; Z.addBuff({ xpBonus: { track: 'combat', amount: 7 }, durationSec: 60 });
  const xpAt = (t) => { Z._buffMomentFn = () => t; const v = Z.activeXpBonuses().combat || 0; Z._buffMomentFn = null; return v; };
  const xs = [xpAt(T0 + 10 * S), xpAt(T0 + 30 * S), xpAt(T0 + 89 * S), xpAt(T0 + 90 * S)]; // read before any later cleanup
  Z.addBuff({ dmgPct: 10 }); Z.addBuff({ dmgPct: 10 });
  const b = Z.getActiveBuffs(); const dmg = b.filter(x => x.dmgPct);
  check('8: same XP track refreshes (5 before the refresh, 7 after, never 12; new one lasts its full 60 s); default duration 30 s; damage buffs still stack',
    xs.join('/') === '5/7/7/0' && dmg.length === 2 && dmg.every(x => x.until - x.from === 30 * S) && Z.combatBuffsAt(c.t).dmgPct === 20,
    xs.join('/')); }

// 9 — old saves: a stored buff without `from` (older shape) and one with it load and follow the rule
{ const old = [{ dmgPct: 20, until: T0 + 60 * S }, { evade: 10, from: T0 + 30 * S, until: T0 + 90 * S }];
  const r = rig({ store: { zi_active_buffs: JSON.stringify(old) } }); r.tick(T0 + H); drain(r);
  check('9: an old save\'s buffs (with and without a start time) load with no migration and apply on the right steps',
    ruleOk(r.probes, -Infinity, T0 + 60 * S, 'dmg') && ruleOk(r.probes, T0 + 30 * S, T0 + 90 * S, 'evade'), r.probes.filter(p => p.dmg > 0).length + ' dmg / ' + r.probes.filter(p => p.evade > 0).length + ' evade steps'); }

// 10 — an error thrown mid-step leaves no step moment behind
{ const r = rig(); dmgBuff(r, T0, 40); const step = r.Z.WanderSim.step; let thrown = false;
  r.Z.WanderSim.step = function () { throw new Error('boom'); };
  try { r.tick(T0 + H); } catch (e) { thrown = true; }
  r.Z.WanderSim.step = step;
  check('10: after an error inside a step, no step moment remains (the next read uses the current clock)', thrown && r.Z._buffMomentFn === null && r.Z.buffMoment() === T0 + H && r.Z.getActiveBuffs().length === 0); }

// 11 — Jobs and Routes catch-ups judge XP buffs at each finish time (D-FX3a)
{ const r = rig({ run: { active: false } }); const Z = r.Z; const seen = {};
  r.at(T0, () => Z.addBuff({ xpBonus: { track: 'combat', amount: 6 }, durationSec: 60 }));
  Z.saveJobs({ v: Z.JOBS_VER, jobs: [
    { id: 'in', type: 'craft', refId: 'a', status: 'active', startedAt: T0, duration: 30 },
    { id: 'out', type: 'repair', refId: 'b', status: 'active', startedAt: T0, duration: 90 },
    { id: 'late', type: 'build', refId: 'c', status: 'active', startedAt: T0 + 50 * M, duration: 120 } ] });
  Z._grantJob = (j) => { seen[j.id] = Z.activeXpBonuses().combat || 0; return true; };
  const route = (Z.ROUTES || [])[0]; const rs = {};
  if (route) rs[route.id] = { startedAt: T0 - 20 * S, durationMs: 50 * S, squadIds: [], mode: 'scav', threatLevel: 1, autoRepeat: true };
  Z._saveRouteRuns(rs); const runSeen = [];
  Z.completeRun = () => { runSeen.push(Z.activeXpBonuses().combat || 0); return {}; };
  r.c.t = T0 + 2 * H; r.at(T0 + 2 * H, () => Z.addBuff({ xpBonus: { track: 'combat', amount: 9 }, durationSec: 60 }));
  Z._settleJobs(r.c.t); Z.settleRouteRuns();
  check('11: a job or route run finishing during an absence gets an XP buff only if it was active at its finish time; a buff used on return does not apply to them',
    seen.in === 6 && seen.out === 0 && seen.late === 0 && !!route && runSeen[0] === 6 && runSeen.length > 1 && runSeen.slice(1).every(v => v === 0) && Z._buffMomentFn === null,
    JSON.stringify({ seen, runs: runSeen.length, first: runSeen.slice(0, 3) })); }

return results;
})();
