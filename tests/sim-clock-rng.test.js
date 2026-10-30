// H1 — One clock and seeded rolls (reference/sim-harness-v1-brief.md §5, CURRENT_BATCH.md "Required tests").
// Runs like the other suites: const T = await readFile('tests/sim-clock-rng.test.js'); await (new Function('readFile','log', T))(readFile, log);
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const T0 = 1790500000000;
// opt.realDate: a scripted Date for the whole sandbox (differential and live-default tests); opt.store: seed storage.
const mkEnv = (opt) => {
  opt = opt || {};
  const store = Object.assign({ zi_materials: JSON.stringify({ metal:200 }), zi_world_seed:'12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify({ gx:0, gy:0, name:'Home', biome:'suburbia', difficulty:1 }), zi_charges: JSON.stringify({ heal:5, scout:0 }) }, opt.store || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const doc = { hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] };
  let D = Date; if (opt.realDate) { const c = opt.realDate; D = class extends Date { constructor(...a) { if (a.length) super(...a); else super(c.t); } static now() { c.reads = (c.reads || 0) + 1; return c.t; } }; }
  let M = Math; if (opt.mathSeed != null) { let s = opt.mathSeed >>> 0; M = Object.create(Math); M.random = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; }; }
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date: D, Math: M, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document: doc, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  if (opt.preClock) { const pc = opt.preClock; fw.ZI = { _installedClock: () => { pc.reads = (pc.reads || 0) + 1; return pc.t; } }; } // harness clock in place before load
  /* Oct 29: consumable-only healing ships (base heals 0); this suite tests heal-charge mechanics with the legacy base charges. Shipped rule: tests/proposals-oct29.test.js */ /* Oct 29: this suite checks retreat/sim timing, not pace; it pins the pre-Oct-28 3 m/s pace its timings were written for. The real pace (1.4 m/s) is tested in fx4. */ new Function('fw', 'with(fw){' + ((opt.code || src)).replace('baseHeal: 0, baseScout: 2, commandPerkLevel: 40, commandPerkHeal: 0', 'baseHeal: 2, baseScout: 2, commandPerkLevel: 40, commandPerkHeal: 1').replace('PACE: { walk: { base: 1.4, perCond: 0 }, jog: { base: 1.4, perCond: 0.28 }, run: { base: 1.4, perCond: 0.6066666666666667 } }', 'PACE: { walk: { base: 3, perCond: 0 }, jog: { base: 3, perCond: 0.6 }, run: { base: 3, perCond: 1.3 } }') + '}')(fw); fw.ZI.wanderMounted = false;
  return { ZI: fw.ZI, store, fw };
};
// A simulated clock installed into ZI.clockNow(); reads are counted.
const simClock = (ZI, t) => { const c = { t, reads: 0 }; ZI.installClock(() => { c.reads++; return c.t; }); return c; };
const run0 = (ZI, o) => Object.assign(ZI.defaultWanderRun(), { active:true, hp:100, moveSpeed:3, scroll:400, scrollUm:400e6, lastCheckpoint:250, checkpoints:[250] }, o || {});
const busy = (ms) => { const w = Date.now() + ms; while (Date.now() < w) {} };
const fp = (o) => JSON.stringify(o, Object.keys(o).sort());
// Engine run: lastTickAt = start, then ticks at the given simulated offsets (ms). Returns the run and all events.
const engineRun = (opt) => {
  const E = mkEnv(opt.env), Z = E.ZI, c = simClock(Z, opt.start || T0); Z.WanderEngine.rng = Z.seededRng(opt.seed || 7); Z.WanderEngine._lead = () => true;
  if (opt.maxSteps) Z.WANDER_SIM_TABLE.maxStepsPerCall = opt.maxSteps;
  if (opt.setup) opt.setup(Z, c);
  Z.saveWanderRun(run0(Z, Object.assign({ lastTickAt: c.t }, opt.run || {})));
  const ev = [], trace = [];
  for (const off of opt.ticks) { c.t = (opt.start || T0) + off; if (opt.delay) busy(opt.delay); ev.push(...Z.WanderEngine.tick(c.t)); const s = Z.getWanderRun(); trace.push([c.t, s.lastTickAt, s._carryMs || 0, s._simNow]); }
  return { Z, E, c, ev, trace, run: Z.getWanderRun() };
};
const range = (n, step, from) => Array.from({ length: n }, (_, i) => (from || 0) + (i + 1) * step);

// ── Required test 3: _simNow advances by exactly the consumed simulation time ──
{ // 3a: engine ticks — after every tick the simulated clock sits at (lastTickAt − carried time).
  const r = engineRun({ ticks: range(60, 60000) });
  const bad = r.trace.filter(([now, last, carry, sim]) => sim !== last - carry);
  check('3a: after each engine tick, _simNow = lastTickAt − _carryMs (60 ticks of 60 s)', bad.length === 0, bad.slice(0, 2).map(b => JSON.stringify(b)).join(' '));
}
{ // 3b: direct advance() calls with real delays between them: _simNow moves by exactly dt each call.
  const { ZI } = mkEnv(); const st = run0(ZI, { _simNow: T0 }); const rng = ZI.seededRng(3), away = ZI.WanderSim.emptySummary(), d = [];
  for (let i = 0; i < 5; i++) { const b = st._simNow, cb = st._carryMs || 0; busy(3); ZI.WanderSim.advance(st, 10, away, rng, []); d.push(st._simNow - b - (10000 + cb - (st._carryMs || 0))); }
  check('3b: direct advance() with 3 ms real delays: _simNow += consumed time exactly', d.every(x => x === 0), d.join(','));
}
{ // 3c: carried time — a tiny step cap forces _carryMs; the clock still moves only by consumed time.
  const { ZI } = mkEnv(); ZI.WANDER_SIM_TABLE.maxStepsPerCall = 3; const st = run0(ZI, { _simNow: T0 }); const rng = ZI.seededRng(4), away = ZI.WanderSim.emptySummary(); let ok = true, sawCarry = false;
  for (let i = 0; i < 20; i++) { const b = st._simNow, cb = st._carryMs || 0; ZI.WanderSim.advance(st, 120, away, rng, []); const ca = st._carryMs || 0; if (ca > 0) sawCarry = true; if (st._simNow - b !== 120000 + cb - ca) ok = false; }
  check('3c: with step-capped carry, _simNow += (dt + carry in − carry out) every call', ok && sawCarry, 'sawCarry=' + sawCarry);
}
{ // 3d: a late tick (machine slow / tab asleep) changes nothing: same simulated offsets, real delays inserted.
  const a = engineRun({ ticks: range(30, 60000) }), b = engineRun({ ticks: range(30, 60000), delay: 4 });
  check('3d: real delays between ticks do not change the run (fingerprint)', fp(a.run) === fp(b.run));
}

// ── Required test 4: a buff's active window is identical with and without delays and carried time ──
// Compares only what H1 changed. G1 (brief §7) is fixed by FX3 (Oct 10): buffs are read at the simulated moment and
// reading never deletes them; tests/fx3-buffs-sim-time.test.js covers short buffs during a catch-up. 4a still uses
// a window that ends after the run; 4b compares variants whose clock follows the same path.
{ const buffedAt = (r) => r.ev.filter(e => e && e.buffed !== undefined).map(e => e.buffed ? 1 : 0).join('');
  const flush = (r) => { let g = 0, t = r.c.t; while ((r.Z.getWanderRun()._carryMs || 0) > 0 && g++ < 2000) { t += 1000; r.c.t = t; r.ev.push(...r.Z.WanderEngine.tick(t)); } return r; };
  // 4a: start boundary. Buff from T0+30 s (simulated) to T0+10 h.
  const setupA = (Z, c) => { c.t = T0 + 30000; Z.addBuff({ dmgPct: 50, durationSec: 36000 }); c.t = T0; };
  const base = engineRun({ setup: setupA, ticks: range(30, 60000) });
  const one = engineRun({ setup: setupA, ticks: [30 * 60000] });
  const late = engineRun({ setup: setupA, ticks: range(30, 60000), delay: 3 });
  const carry = flush(engineRun({ setup: setupA, ticks: range(30, 60000), maxSteps: 4 }));
  const s = buffedAt(base);
  check('4a: buff start boundary identical for 1-min ticks, one 30-min tick, delayed ticks and step-capped carry', /^0+1+/.test(s) && buffedAt(one) === s && buffedAt(late) === s && buffedAt(carry) === s, [s, buffedAt(one), buffedAt(late), buffedAt(carry)].map(x => x.length + ':' + x.slice(0, 30)).join(' | '));
  // 4b: expiry boundary. Buff from T0+30 s to T0+70 s, 10-s ticks with and without real delays.
  const setupB = (Z, c) => { c.t = T0 + 30000; Z.addBuff({ dmgPct: 50, durationSec: 40 }); c.t = T0; };
  const b1 = engineRun({ setup: setupB, ticks: range(60, 10000) }), b2 = engineRun({ setup: setupB, ticks: range(60, 10000), delay: 3 });
  const sb = buffedAt(b1);
  check('4b: buff expiry boundary identical with and without real delays (10-s ticks)', /^0+1+0+/.test(sb) && buffedAt(b2) === sb, sb + ' | ' + buffedAt(b2));
}

// ── Required test 1: an installed clock — 72 simulated hours, no real waiting, every system sees the same 72 h ──
{ const { ZI } = mkEnv(); const c = simClock(ZI, T0); const real0 = Date.now(), H = 3600000;
  ZI.WanderEngine.rng = ZI.seededRng(5); ZI.WanderEngine._lead = () => true;
  const pol = ZI.setPolicy('immoral'); const coolStart = ZI.policyCooldownLeftMs();
  ZI.consumeCommand(); const cmdStart = ZI.cmdResetInMs();
  ZI.setInjury(2); const injStart = !!ZI.getInjury();
  ZI.addBuff({ dmgPct: 10, durationSec: 3600 }); const buffStart = ZI.getActiveBuffs().length;
  (ZI.PROFESSIONS || []).forEach(p => ZI.awardXp(p.id, 1)); const idle0 = Math.max(...ZI.PROFESSIONS.map(p => ZI.skillIdleDays(p.id)));
  ZI.saveWanderRun(run0(ZI, { lastTickAt: c.t }));
  for (let h = 1; h <= 72; h++) { c.t = T0 + h * H; ZI.WanderEngine.tick(c.t); }
  const s = ZI.getWanderRun(), realMs = Date.now() - real0; const dec = ZI.getDecay();
  const untouched = ZI.PROFESSIONS.filter(p => dec[p.id] && dec[p.id].lastActiveUtc === T0).map(p => ZI.skillIdleDays(p.id)), used = ZI.PROFESSIONS.filter(p => dec[p.id] && dec[p.id].lastActiveUtc !== T0).map(p => dec[p.id].lastActiveUtc);
  const ok = pol.ok && coolStart > 0 && ZI.policyCooldownLeftMs() === 0 && cmdStart === ZI.CMD_CYCLE_MS && ZI.cmdResetInMs() === ZI.CMD_CYCLE_MS
    && injStart && !!ZI.getInjury() && ZI.getInjury().remainingMs === ZI.INJURY_TABLE.baseMs && buffStart === 1 && ZI.getActiveBuffs().length === 0
    && idle0 === 0 && untouched.length > 0 && untouched.every(d => d === 3) && used.every(t => t > T0 && t <= T0 + 72 * H) && s.lastTickAt === T0 + 72 * H && s._simNow === s.lastTickAt - (s._carryMs || 0) && realMs < 60000;
  check('1: installed clock — 72 h simulated; cooldown, command window, buff, decay and the run all see the same 72 h; the injury is frozen through catch-up (BAL-A O6/D2b); no real waiting', ok,
    JSON.stringify({ pol: pol.ok, coolStart, coolEnd: ZI.policyCooldownLeftMs(), cmdStart, injStart, inj: !!ZI.getInjury(), buffStart, buffs: ZI.getActiveBuffs().length, idle0, untouched, usedN: used.length, last: s.lastTickAt - T0, sim: s._simNow - T0, realMs }));
}

// ── Required test 2: no stray clock or roll reads in scope ──
{ const { ZI } = mkEnv(); const W = ZI.WanderSim, G = ZI.WanderEngine;
  const fns = { getCmdWindow: ZI.getCmdWindow, cmdResetInMs: ZI.cmdResetInMs, policyCooldownLeftMs: ZI.policyCooldownLeftMs, setPolicy: ZI.setPolicy,
    skillDecayState: ZI.skillDecayState, skillIdleDays: ZI.skillIdleDays, getDecayClock: ZI.getDecayClock, decayDaysOwed: ZI.decayDaysOwed, decayHeartbeat: ZI.decayHeartbeat,
    decayHousekeeping: ZI.decayHousekeeping, settleSkillDecay: ZI.settleSkillDecay, _maybeSettleOnRead: ZI._maybeSettleOnRead, getInjury: ZI.getInjury, setInjury: ZI.setInjury,
    getActiveBuffs: ZI.getActiveBuffs, addBuff: ZI.addBuff, combatBuffsAt: ZI.combatBuffsAt, repApply: ZI.repApply, settleRepForgiveness: ZI.settleRepForgiveness,
    toRecyclerItem: ZI.toRecyclerItem, tryDiscoverVehicle: ZI.tryDiscoverVehicle, awardXp: ZI.awardXp, _boot: ZI._boot,
    'WanderSim.advance': W.advance, 'WanderSim.step': W.step, _holdStep: W._holdStep, _restStep: W._restStep, _ruleCheck: W._ruleCheck,
    'WanderEngine.start': G.start, 'WanderEngine.tick': G.tick, 'WanderEngine.liveStep': G.liveStep, 'WanderEngine._run': G._run, 'WanderEngine._lead': G._lead };
  // Allowed: the reload-resume window and simulation locking (real time), the session id (real time) and `rng || Math.random`
  // fallbacks (no rng passed). Comments are ignored.
  const allow = [/JSON\.stringify\(\{ mode, at: Date\.now\(\) \}\)/g, /const realNow = Date\.now\(\);/g, /Math\.random\(\)\.toString\(36\)/g, /\|\|\s*Math\.random\b/g, /rng \|\| Math\.random/g];
  const stray = Object.entries(fns).filter(([n, f]) => { if (typeof f !== 'function') return true; let t = f.toString(); t = t.replace(/\/\/[^\n]*/g, ''); allow.forEach(a => { t = t.replace(a, ''); }); return /Date\.now\(|new Date\(|performance\.now\(|Math\.random\(/.test(t); }).map(([n]) => n);
  check('2: no Date.now(), new Date(), performance.now() or Math.random() in scope outside the clock, the roll hook and the real-time exemptions', stray.length === 0, stray.join(','));
  const adv = W.advance.toString();
  check('2b: advance() itself reads no clock (neither Date.now() nor ZI.clockNow())', !/Date\.now|clockNow|ZI\.now\(/.test(adv));
}

// ── Required test 5: same seed and configuration → identical final state ──
const fullRun = (seed, rollSeed, hours) => { const pc = { t: T0 }, E = mkEnv({ preClock: pc }), Z = E.ZI, c = pc; Z.installRolls(rollSeed); Z.WanderEngine.rng = Z.seededRng(seed); Z.WanderEngine._lead = () => true;
  Z.saveWanderRun(run0(Z, { lastTickAt: c.t })); for (let i = 1; i <= hours * 6; i++) { c.t = T0 + i * 600000; Z.WanderEngine.tick(c.t); }
  const store = Object.assign({}, E.store); delete store.zisim_lock; /* simulation locking stays on real time (A1) */ return { run: Z.getWanderRun(), store, Z }; };
{ const a = fullRun(11, 99, 6), b = fullRun(11, 99, 6);
  const differences = (x, y) => Object.keys(Object.assign({}, x, y)).filter(k => JSON.stringify(x[k]) !== JSON.stringify(y[k])).map(k => ({ key:k, first:x[k], second:y[k] }));
  const comparableStore = store => { const copy = Object.assign({}, store); if (copy.zi_game_clock) { const clock = JSON.parse(copy.zi_game_clock); delete clock.at; copy.zi_game_clock = JSON.stringify(clock); } return copy; };
  const storeA = comparableStore(a.store), storeB = comparableStore(b.store);
  check('5: same seed and configuration give identical simulation state and gameplay storage (wall-clock timestamp excluded)', fp(a.run) === fp(b.run) && fp(storeA) === fp(storeB) && JSON.parse(a.store.zi_wander_loot || '[]').length > 0, JSON.stringify({ run:differences(a.run,b.run), storage:differences(storeA,storeB) }));
}

// ── Required test 6: streams are independent ──
{ const a = fullRun(11, 99, 6), b = fullRun(11, 12345, 6);
  const loot = (r) => JSON.parse(r.store.zi_wander_loot || '[]');
  const noIds = (r) => loot(r).map(x => Object.assign({}, x, { id: null }));
  check('6a: a different roll seed changes only the Recycler ids; the Wandering run and every other value are identical', fp(a.run) === fp(b.run) && JSON.stringify(noIds(a)) === JSON.stringify(noIds(b)) && JSON.stringify(loot(a).map(x => x.id)) !== JSON.stringify(loot(b).map(x => x.id)));
  const { ZI } = mkEnv(); ZI.installRolls(7); const solo = [ZI.roll('ids'), ZI.roll('ids'), ZI.roll('ids')];
  const E2 = mkEnv(); E2.ZI.installRolls(7); const mixed = []; mixed.push(E2.ZI.roll('ids')); E2.ZI.roll('other'); E2.ZI.roll('other'); mixed.push(E2.ZI.roll('ids')); E2.ZI.roll('other'); mixed.push(E2.ZI.roll('ids'));
  check('6b: draws from another system do not change a stream\'s sequence', JSON.stringify(solo) === JSON.stringify(mixed) && solo[0] !== solo[1]);
}

// ── Required test 7: live defaults unchanged ──
{ const clk = { t: T0 + 123 }; const { ZI } = mkEnv({ realDate: clk, mathSeed: 42 });
  let s = 42; const lcg = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  const nowOk = ZI.clockNow() === T0 + 123 && ZI.now() === T0 + 123 && !ZI._installedClock && !ZI._rollStreams;
  // The sandbox's Math.random has been consumed during load; compare the hook with the next value of the same generator.
  const M = ZI.roll('ids'); let found = false; for (let i = 0; i < 100000 && !found; i++) if (lcg() === M) found = true;
  check('7: no harness installed — ZI.clockNow() and ZI.now() return Date.now(); ZI.roll() returns the next Math.random() value', nowOk && found, JSON.stringify({ clockNow: ZI.clockNow() - T0, now: ZI.now() - T0 }));
}

// ── Required test 8: the Wandering roll sequence is unchanged from the step-0 build ──
{ // Golden values recorded from the step-0 build (h1-snapshots/step0-baseline/golden-wandering.json): seededRng(7) first five
  // draws, and a fingerprint of one hour of Wandering events (seed 7, 1-min ticks, scripted time).
  const GOLD = { first: [0.011704753153026104, 0.06195825757458806, 0.97690763277933, 0.6990287057124078, 0.5214452685322613], events: 76, hash: 2727097708 }; /* BAL-A (authorized, Oct 19): identical to the step-0 build until the first walk back, where rule 5 now applies (A1–A3); re-recorded */
  const clk = { t: T0 }; const { ZI } = mkEnv({ realDate: clk, mathSeed: 42 }); const r = ZI.seededRng(7); const first = [r(), r(), r(), r(), r()];
  ZI.WanderEngine.rng = ZI.seededRng(7); ZI.WanderEngine._lead = () => true; ZI.saveWanderRun(run0(ZI, { lastTickAt: clk.t }));
  const ev = []; for (let i = 1; i <= 60; i++) { clk.t = T0 + i * 60000; ev.push(...ZI.WanderEngine.tick(clk.t)); }
  const sig = ev.map(e => [e.kind, e.outcome || '', e.dmgTaken || 0, e.chance || 0].join(':')).join('|'); let h = 5381; for (let i = 0; i < sig.length; i++) h = ((h * 33) ^ sig.charCodeAt(i)) >>> 0;
  check('8: seededRng(7) and one hour of Wandering events match the step-0 build exactly', JSON.stringify(first) === JSON.stringify(GOLD.first) && ev.length === GOLD.events && h === GOLD.hash, JSON.stringify({ n: ev.length, h }));
}

// ── Required test 9: distributions of converted rolls ──
{ const { ZI } = mkEnv(); ZI.installRolls(2024); const N = 10000, a = [], b = [];
  for (let i = 0; i < N; i++) { a.push(ZI.roll('ids')); b.push(Math.random()); }
  const st = (v) => { const m = v.reduce((x, y) => x + y, 0) / v.length, sd = Math.sqrt(v.reduce((x, y) => x + (y - m) * (y - m), 0) / v.length); return { m, sd, lo: Math.min(...v), hi: Math.max(...v) }; };
  const A = st(a), B = st(b), se = 0.2887 / Math.sqrt(N);
  const idOk = a.every(x => { const k = Math.floor(x * 1e6); return Number.isInteger(k) && k >= 0 && k <= 999999; });
  check('9: seeded \'ids\' stream vs Math.random — same [0,1) range, mean and spread within sampling error (10,000 draws); id part stays 0–999999', A.lo >= 0 && A.hi < 1 && Math.abs(A.m - 0.5) < 4 * se && Math.abs(A.m - B.m) < 6 * se && Math.abs(A.sd - B.sd) < 0.01 && idOk, JSON.stringify({ seeded: A, math: B }));
}

// ── Required test 10: the 24 h offline cap through WanderEngine.tick, with _carryMs ──
{ const H = 3600000;
  const away = (hours, maxSteps, extra) => { const E = mkEnv(), Z = E.ZI, c = simClock(Z, T0); Z.WanderEngine.rng = Z.seededRng(7); Z.WanderEngine._lead = () => true; if (maxSteps) Z.WANDER_SIM_TABLE.maxStepsPerCall = maxSteps;
    Z.saveWanderRun(run0(Z, { lastTickAt: c.t })); c.t = T0 + hours * H; Z.WanderEngine.tick(c.t); const first = Z.getWanderRun(); const r = { Z, c, first: { carry: first._carryMs || 0, secs: (first.awaySummary || {}).secs || 0, simStart: first._simNow } };
    if (extra) extra(r); r.run = Z.getWanderRun(); return r; };
  const a24 = away(24, 1e6), a72 = away(72, 1e6); /* PF1 (authorized by Sam, Oct 16): shorter rests mean a 24 h return takes more than the default 200 steps; lift the cap here so 10a checks the 24 h window alone (carry is covered by 10b) */
  const strip = (s) => { const o = Object.assign({}, s); delete o.lastTickAt; delete o._simNow; return o; };
  check('10a: 72 h away processes exactly 24 h (awaySummary.secs = 86,400, no carry) and ends in the same state as 24 h away', a72.first.secs === 86400 && a72.first.carry === 0 && fp(strip(a72.run)) === fp(strip(a24.run)), JSON.stringify({ secs: a72.first.secs, carry: a72.first.carry }));
  // Step cap forced low so a return leaves carried time; draining it with 1-s ticks adds exactly the drain's real time — never more.
  let drainTicks = 0; const capped = away(72, 40, (r) => { let t = r.c.t; while ((r.Z.getWanderRun()._carryMs || 0) > 0 && drainTicks < 20000) { t += 1000; r.c.t = t; r.Z.WanderEngine.tick(t); drainTicks++; } });
  const simulated = (capped.run._simNow - (T0 + 72 * H - 24 * H)) / 1000;
  check('10b: with carried time, total simulated time = 24 h + the drain\'s own elapsed time, never more', capped.first.carry > 0 && capped.run._carryMs === 0 && simulated === 86400 + drainTicks, JSON.stringify({ carry0h: (capped.first.carry / H).toFixed(2), drainTicks, simulated }));
  // FX2 (authorized): carried time left when the player leaves again no longer stacks onto the next 24 h.
  const stack = away(72, 4, (r) => { r.c.t += 72 * H; r.Z.WanderEngine.tick(r.c.t); });
  check('10c: step cap 4, away 72 h, leave at once, away 72 h again → the second return\'s backlog is at most 24 h (carried time counts toward the cap)', (stack.run._carryMs || 0) <= 24 * H && stack.first.carry > 0, 'backlog ' + ((stack.run._carryMs || 0) / H).toFixed(2) + ' h (first return left ' + (stack.first.carry / H).toFixed(2) + ' h)');
}

// ── Required test 11: verified bounds hold (XP/level, charges, durability; HP and stress) ──
{ const { ZI } = mkEnv(); const c = simClock(ZI, T0); ZI.WanderEngine.rng = ZI.seededRng(21); ZI.WanderEngine._lead = () => true; ZI.saveWanderRun(run0(ZI, { lastTickAt: c.t }));
  const bad = []; const max = ZI.baseChargeMax(); let lowHp = null;
  const inspect = (tag) => {
    const xp = ZI.getStatXp(); (ZI.PROFESSIONS || []).forEach(p => { const L = ZI.statLevel(p.id), x = xp[p.id] || 0; if (!(L >= 1 && L <= 50)) bad.push(tag + ' level ' + p.id + '=' + L); if (!isFinite(x)) bad.push(tag + ' xp ' + p.id + '=' + x); });
    const b = ZI.getBaseCharges(); ['heal', 'scout'].forEach(k => { if (!(b[k] >= 0 && b[k] <= Math.max(max[k], ZI.baseChargeMax()[k]))) bad.push(tag + ' base ' + k + '=' + b[k]); });
    ZI.getCarried().forEach(e => { const k = ZI.ACTIVE_TABLE.charges.kit[e.id]; if (k && e.charges != null && !(e.charges >= 1 && e.charges <= ZI.kitFull(e.id))) bad.push(tag + ' kit ' + e.id + '=' + e.charges); });
    const lo = ZI.getLoadout(); Object.values(lo || {}).forEach(id => { const g = id && ZI.getGearItem(id); const d = g && ZI.itemDurability(g); if (d && !(d.current >= 0 && d.current <= d.max)) bad.push(tag + ' dura ' + id + '=' + d.current); });
    const s = ZI.getWanderRun(), u = ZI.getStressState().u; if (!(isFinite(s.hp) && s.hp >= 1 && s.hp <= 100)) bad.push(tag + ' hp=' + s.hp); // FX1 (authorized): HP bound tightened 0–100 → 1–100 if (s.hp < 1 && !lowHp) lowHp = { tick: tag, hp: s.hp, resting: s.resting, restStartHp: s.restStartHp }; if (!(u >= 0 && u <= ZI.ACTIVE_TABLE.stress.max * ZI.STRESS_UNITS && Number.isInteger(u))) bad.push(tag + ' stress=' + u);
  };
  for (let i = 1; i <= 144; i++) { c.t = T0 + i * 600000; ZI.WanderEngine.tick(c.t); inspect('t' + i); }
  // Durability clamp from the rule itself: a huge wear never goes below 0.
  const gid = (ZI.GEAR_ITEMS || []).find(g => ZI.itemHasDurability(g)); if (gid) { ZI.applyWear(gid, 1e9); const d = ZI.itemDurability(gid); if (d.current !== 0) bad.push('applyWear clamp ' + d.current); }
  check('11: bounds hold over 24 h — level 1–50, XP finite, base charges 0–max, kit charges 1–full, durability 0–max, HP 1–100, stress 0–max (integer units)', bad.length === 0, bad.slice(0, 4).join('; '));
}

// ── Required test 15: a pre-H1 save loads unchanged and the run continues ──
{ const PRE = {"zi_materials":"{\"metal\":200}","zi_world_seed":"12345","zi_trav_start":"{\"gx\":0,\"gy\":0}","zi_trav_pos":"{\"gx\":0,\"gy\":0,\"name\":\"Home\",\"biome\":\"suburbia\",\"difficulty\":1}","zi_charges":"{\"heal\":0,\"scout\":2}","zi_stat_xp":"{\"combat\":240,\"firstAid\":181,\"scavenging\":126,\"stealth\":30,\"athletics\":51,\"endurance\":213,\"foraging\":10,\"smithing\":0,\"medical\":14,\"mechanical\":0,\"discovery\":11,\"trading\":0,\"diplomat\":22,\"logistics\":0,\"engineering\":0,\"command\":24}","zi_stat_xp_ver":"2","zi_jobs":"{\"v\":1,\"jobs\":[]}","zi_decay_clock":"{\"lastSettledUtc\":1790503600000,\"lastSeenUtc\":1790503600000}","zi_stress":"{\"value\":19.728055555555557,\"u\":102270240000000}","zi_retreat_rules":"{\"hpOff\":false,\"stressOff\":false,\"loadIgnore\":false,\"hpFloorPct\":30,\"loadLimitPct\":115,\"stressCeiling\":85}","zi_tut_progress":"[]","zi_save_version":"7","zi_wander_run":"{\"scroll\":940,\"lastCheckpoint\":750,\"checkpoints\":[250,500,750],\"carried\":[],\"active\":true,\"hp\":41.5,\"kills\":30,\"xp\":300,\"mats\":115,\"healsUsed\":0,\"moveSpeed\":3,\"maxHeals\":3,\"healPct\":25,\"lastTickAt\":1790503600000,\"paused\":false,\"awaySummary\":{\"kills\":30,\"xp\":300,\"mats\":115,\"dist\":540,\"secs\":3600,\"loot\":30,\"escapes\":3,\"retreats\":0,\"events\":7,\"eventLog\":[\"\ud83d\udd4a Sick settlement asks for help \u2014 failed (50%): botched, took 10 dmg \u00b7 medical XP\",\"\ud83d\udd4a Refugee convoy under threat (Unnamed group D) \u2014 success (50%): handled \u00b7 diplomat XP \u00b7 Unnamed group D +14 rep \u00b7 Unnamed group B -7 rep\",\"\ud83d\udd4a Refugee convoy under threat (Unnamed group C) \u2014 failed (50%): botched, took 11 dmg \u00b7 diplomat XP \u00b7 Unnamed group C +4 rep \u00b7 The Hearthguard -2 rep\",\"\ud83d\udd4a Wounded stranger \u2014 success (51%): handled \u00b7 firstAid XP\"],\"stressStart\":0,\"stressEnd\":19.728055555555557,\"dmgTaken\":573,\"ruleWithdrawals\":[\"Withdrew: Low HP\",\"Withdrew: Low HP\",\"Withdrew: Low HP\",\"Withdrew: Low HP\"],\"forcedRetreats\":[{\"cause\":\"downed\",\"eligible\":11,\"lostCount\":5,\"kept\":\"Shambler salvage\",\"banked\":6,\"shaken\":false},{\"cause\":\"downed\",\"eligible\":7,\"lostCount\":3,\"kept\":\"Shambler salvage\",\"banked\":4,\"shaken\":false},{\"cause\":\"downed\",\"eligible\":7,\"lostCount\":3,\"kept\":\"Shambler salvage\",\"banked\":4,\"shaken\":false},{\"cause\":\"downed\",\"eligible\":6,\"lostCount\":3,\"kept\":\"Shambler salvage\",\"banked\":3,\"shaken\":false}],\"downedRetreats\":4,\"discoveries\":[{\"site\":\"Campsite\",\"risk\":\"Low\",\"decision\":\"left behind\",\"byPolicy\":false,\"outcome\":\"left behind (forced retreat)\"}]},\"retreatSnoozes\":{},\"retreatHold\":null,\"withdrawCauses\":null,\"retreatEvade\":0,\"retreatEvadeRolled\":false,\"scrollUm\":940000000,\"_encMs\":0,\"_polMs\":12000,\"_carryMs\":0,\"_simNow\":1790503048000,\"_discMs\":96000,\"pickupSeq\":31,\"withdrawing\":false,\"withdrawLeftM\":0,\"withdrawLeftUm\":154000000,\"lowHpStressed\":false,\"pressure\":0,\"prompt\":null,\"_breakPending\":false,\"resting\":true,\"restAt\":\"base\",\"restStartHp\":0,\"restElapsedMs\":498000,\"_leftBehind\":[]}","zi_carried":"{\"v\":1,\"items\":[]}","zi_stash":"{\"v\":2,\"items\":[]}","zi_unlocked_zones":"[\"rt_suburb2\",\"rt_metro1\"]","zi_skill_decay":"{\"endurance\":{\"lastActiveUtc\":1790503600000,\"floorXp\":0,\"floorProgress\":{},\"lastSettle\":1790500600000},\"combat\":{\"lastActiveUtc\":1790503600000,\"floorXp\":0,\"floorProgress\":{},\"lastSettle\":1790500600000},\"scavenging\":{\"lastActiveUtc\":1790503600000,\"floorXp\":0,\"floorProgress\":{},\"lastSettle\":1790500600000},\"stealth\":{\"lastActiveUtc\":1790503600000,\"floorXp\":0,\"floorProgress\":{},\"lastSettle\":1790500600000},\"athletics\":{\"lastActiveUtc\":1790503600000,\"floorXp\":0,\"floorProgress\":{},\"lastSettle\":1790500600000},\"medical\":{\"lastActiveUtc\":1790501200000,\"floorXp\":0,\"floorProgress\":{},\"lastSettle\":1790500600000},\"firstAid\":{\"lastActiveUtc\":1790503600000,\"floorXp\":0,\"floorProgress\":{},\"lastSettle\":1790500600000},\"discovery\":{\"lastActiveUtc\":1790503600000,\"floorXp\":0,\"floorProgress\":{},\"lastSettle\":1790500600000},\"command\":{\"lastActiveUtc\":1790503600000,\"floorXp\":0,\"floorProgress\":{},\"lastSettle\":1790500600000},\"diplomat\":{\"lastActiveUtc\":1790503600000,\"floorXp\":0,\"floorProgress\":{},\"lastSettle\":1790500600000},\"foraging\":{\"lastActiveUtc\":1790501200000,\"floorXp\":0,\"floorProgress\":{},\"lastSettle\":1790501200000}}","zi_cell_kills":"{\"0,0\":30}","zi_contracts":"{\"v\":1,\"active\":[],\"repByFaction\":{\"hearthguard\":-62,\"concordance\":14,\"ironmarch\":238,\"dustwalkers\":81,\"blackhaven\":53,\"lodge\":320},\"completedCount\":0,\"_repSeeded\":true,\"repLastOffense\":{\"ironmarch\":1790500600000,\"dustwalkers\":1790502400000,\"hearthguard\":1790503600000}}","zi_wander_loot":"[{\"id\":\"w1790500600000519818\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790500600000},{\"id\":\"w1790500600000914939\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790500600000},{\"id\":\"w1790500600000698715\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790500600000},{\"id\":\"w1790500600000753081\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790500600000},{\"id\":\"w1790500600000689433\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790500600000},{\"id\":\"w1790500600000521116\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790500600000},{\"id\":\"w1790501200000151823\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790501200000},{\"id\":\"w179050120000049061\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790501200000},{\"id\":\"w1790501200000226315\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790501200000},{\"id\":\"w1790501200000287363\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790501200000},{\"id\":\"w1790502400000997032\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790502400000},{\"id\":\"w1790502400000710403\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790502400000},{\"id\":\"w1790502400000671381\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790502400000},{\"id\":\"w1790502400000361886\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790502400000},{\"id\":\"w1790503600000256329\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790503600000},{\"id\":\"w1790503600000104572\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790503600000},{\"id\":\"w1790503600000899458\",\"name\":\"Shambler salvage\",\"tier\":1,\"rarity\":\"Common\",\"weight\":1.5,\"outputs\":{\"metal\":5},\"fromWandering\":true,\"bankedAt\":1790503600000}]"};
  const before = Object.keys(PRE).sort(), runFields = Object.keys(JSON.parse(PRE.zi_wander_run)).sort();
  const E = mkEnv({ store: Object.assign({}, PRE), preClock:{ t:JSON.parse(PRE.zi_wander_run).lastTickAt } }), Z = E.ZI; const c = simClock(Z, JSON.parse(PRE.zi_wander_run).lastTickAt);
  const after = Object.keys(E.store).filter(k => k !== Z.OFFLINE_LAST_SEEN_KEY).sort(), runAfter = Object.keys(JSON.parse(E.store.zi_wander_run)).sort();
  const sameKeys = JSON.stringify(after) === JSON.stringify(before), sameFields = JSON.stringify(runAfter) === JSON.stringify(runFields), sameVer = E.store.zi_save_version === String(Z.SAVE_FORMAT.current); /* BAL-A (authorized, Oct 19): the injury migration (D7b) moves a v7 save to the current version; no keys are added */
  Z.WanderEngine.rng = Z.seededRng(3); Z.WanderEngine._lead = () => true; const r0 = Z.getWanderRun();
  c.t += 600000; Z.WanderEngine.tick(c.t); const r1 = Z.getWanderRun(); const st = Object.assign({}, r1); Z.WanderSim.advance(st, 60, Z.WanderSim.emptySummary(), Z.seededRng(4), []);
  const moved = r1.lastTickAt === r0.lastTickAt + 600000 && (r1.scrollUm !== r0.scrollUm || r1.kills !== r0.kills || r1.resting) && isFinite(st._simNow) && st._simNow === r1._simNow + 60000 - (st._carryMs || 0) + (r1._carryMs || 0);
  check('15: pre-H1 save (v' + PRE.zi_save_version + ') loads with the same keys, run fields and save version, and the run continues (engine tick + advance)', sameKeys && sameFields && sameVer && moved,
    JSON.stringify({ sameKeys, sameFields, sameVer, moved, added: after.filter(k => !before.includes(k)), removed: before.filter(k => !after.includes(k)) }));
}

results.forEach(r => log(r[0] + '  ' + r[1] + (r[0] === 'FAIL' ? '  ' + r[2] : '')));
const pass = results.filter(r => r[0] === 'PASS').length; log(`${pass}/${results.length} H1 clock/RNG checks passed`);
return results;
})();
