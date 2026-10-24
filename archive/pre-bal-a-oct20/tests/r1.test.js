// Batch R1: Baseline Retreat Rules — the 31 acceptance checks (reference/r1-brief.md, Section I). Check 31 is the browser check.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const HOME = { gx:0, gy:0, name:'Home', biome:'suburbia', difficulty:1 }, FARPOS = { gx:6, gy:5, name:'Far', biome:'suburbia', difficulty:1 };
const mkEnv = (seed, opt) => {
  opt = opt || {};
  const store = Object.assign({ zi_materials: JSON.stringify({ metal:200 }), zi_world_seed:'12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify(opt.far ? FARPOS : HOME) }, seed || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const doc = { hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] };
  const fw = { localStorage: ls, sessionStorage: ls, console, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document: doc, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw); fw.ZI.wanderMounted = false;
  if (opt.heals != null) fw.ZI._wj('zi_charges', { heal: opt.heals, scout: 0 });
  return { ZI: fw.ZI, store, doc };
};
const run0 = (ZI, o) => Object.assign(ZI.defaultWanderRun(), { active:true, hp:100, moveSpeed:3, scroll:400, scrollUm:400e6, lastCheckpoint:250, checkpoints:[250] }, o || {});
const W = { watching:true };
// Advance sec seconds in steps (number or cycled array); flush any step-capped remainder.
const adv = (ZI, st, sec, rng, away, step, opts) => { const ev = []; let t = 0, k = 0; while (t < sec - 1e-9) { const sz = Array.isArray(step) ? step[k++ % step.length] : (step || sec); const d = Math.min(sz, sec - t); ZI.WanderSim.advance(st, d, away, rng, ev, opts); t += d; } let g = 0; while (st._carryMs > 0 && g++ < 5000) ZI.WanderSim.advance(st, 0, away, rng, ev, opts); return ev; };
const tick = (ZI, st, opts, ev) => { ev = ev || []; ZI.WanderSim.advance(st, 0.001, ZI.WanderSim.emptySummary(), ZI.seededRng(1), ev, opts); return ev; };
const capG = (ZI, st) => { const c = st.carried; st.carried = []; const L = ZI.loadFor(st); st.carried = c; return { base: Math.round(L.kg * 1000), cap: Math.round(L.cap * 1000) }; };
const setLoad = (ZI, st, pct, delta) => { const g = capG(ZI, st), tgt = Math.ceil(g.cap * pct / 100) + (delta || 0); st.carried = [{ name:'ballast', value:1, weight:(tgt - g.base) / 1000, seq:0 }]; st.pickupSeq = 1; };
const loadPct = (ZI, st) => { const L = ZI.loadFor(st); return Math.round(L.kg * 1000) * 100 / Math.round(L.cap * 1000); };
const rulesNow = (ZI, st) => ZI.retreatRulesTrue(st).map(c => c.rule).join(',');
const kinds = (ev, k) => ev.filter(e => e.kind === k);
const U = (ZI) => ZI.STRESS_UNITS;

// 1 — thresholds
{ const { ZI } = mkEnv(null, { heals:0 }); const st = run0(ZI);
  st.hp = 30; const at = rulesNow(ZI, st); st.hp = 29; const below = rulesNow(ZI, st);
  ZI._wj('zi_charges', { heal: 2, scout: 0 }); st.hp = 10; const withHeals = rulesNow(ZI, st);
  check('1: HP fires below the floor with no heals; never exactly at it; never while heals remain', at === '' && below === 'hp' && withHeals === '', [at, below, withHeals].join('|'));
  ZI._wj('zi_charges', { heal: 0, scout: 0 }); st.hp = 100;
  ZI._setStressU(85 * U(ZI) - 1); const s1 = rulesNow(ZI, st); ZI.setStress(85); const s2 = rulesNow(ZI, st); ZI.setStress(90); const s3 = rulesNow(ZI, st);
  check('1: stress fires at or above 85, not one unit below', s1 === '' && s2 === 'stress' && s3 === 'stress', [s1, s2, s3].join('|'));
  ZI.setStress(0); setLoad(ZI, st, 115, -1); const l1 = rulesNow(ZI, st); setLoad(ZI, st, 115); const l2 = rulesNow(ZI, st); setLoad(ZI, st, 120); const l3 = rulesNow(ZI, st);
  check('1: load fires at or above 115%, not one gram below', l1 === '' && l2 === 'load' && l3 === 'load', [l1, l2, l3].join('|')); }
// 2 — Off / Ignore
{ const { ZI } = mkEnv(null, { heals:0 }); const st = run0(ZI, { hp:10 }); ZI.setStress(95); setLoad(ZI, st, 125);
  const on = rulesNow(ZI, st); ZI.setRetreatRules({ hpOff:true }); const a = rulesNow(ZI, st); ZI.setRetreatRules({ stressOff:true }); const b = rulesNow(ZI, st); ZI.setRetreatRules({ loadIgnore:true }); const c = rulesNow(ZI, st);
  const ev = tick(ZI, st, null);
  check('2: Off and Ignore disable each rule', on === 'hp,stress,load' && a === 'stress,load' && b === 'load' && c === '' && !kinds(ev, 'ruleWithdraw').length && !st.withdrawing, [on, a, b, c].join('|')); }
// 3 — fired rule = existing voluntary withdrawal to the last checkpoint
{ const { ZI } = mkEnv(null, { far:true, heals:5 }); let fr = 0; const f = ZI.forcedRetreat; ZI.forcedRetreat = function() { fr++; return f.apply(this, arguments); };
  const st = run0(ZI); ZI.setStress(86); const away = ZI.WanderSim.emptySummary();
  const ev = adv(ZI, st, 0.001, ZI.seededRng(3), away);
  const startOk = st.withdrawing && Math.abs(st.withdrawLeftM - 150) < 0.01 && !st.resting && kinds(ev, 'ruleWithdraw').length === 1;
  const ev2 = adv(ZI, st, 120, ZI.seededRng(3), away, 1);
  check('3: rule starts the voluntary withdrawal to the last checkpoint (150 m back), never a Forced Retreat, never Base', startOk && fr === 0 && kinds(ev2, 'withdrawn').length === 1 && st.resting && st.restAt === 'checkpoint' && !ev2.some(e => e.forcedRetreat), JSON.stringify({ startOk, fr, restAt: st.restAt })); }
// 4 — priority HP → Stress → Load, live / offline / reload, independent of key order
{ const mk = (rulesJson) => { const E = mkEnv(rulesJson ? { zi_retreat_rules: rulesJson } : null, { heals:0 }); const st = run0(E.ZI, { hp:20 }); E.ZI.setStress(90); setLoad(E.ZI, st, 118); return Object.assign(E, { st }); };
  const A = mk(), evA = tick(A.ZI, A.st, null);
  const B = mk(JSON.stringify({ loadLimitPct:115, stressCeiling:85, hpFloorPct:30 })), evB = tick(B.ZI, B.st, null);
  const C = mk(); C.ZI.saveWanderRun(C.st); const C2 = mkEnv(C.store); const stC = C2.ZI.getWanderRun(); const evC = tick(C2.ZI, stC, null);
  const D = mk(); const evD = tick(D.ZI, D.st, W);
  const p = (ev) => { const e = kinds(ev, 'ruleWithdraw')[0]; return e ? e.primary + '>' + e.also.join(',') : 'none'; };
  check('4: priority HP → Stress → Load: offline, reordered settings keys, after reload and live (HOLD primary)', p(evA) === 'hp>stress,load' && p(evB) === p(evA) && p(evC) === p(evA) && D.st.retreatHold && D.st.retreatHold.primary.rule === 'hp' && D.st.retreatHold.also.map(a => a.rule).join(',') === 'stress,load', [p(evA), p(evB), p(evC), D.st.retreatHold && D.st.retreatHold.primary.rule].join(' | ')); }
// 5 — secondary causes inside one withdrawal event
{ const { ZI } = mkEnv(null, { heals:0 }); const st = run0(ZI, { hp:25 }); ZI.setStress(86); const away = ZI.WanderSim.emptySummary();
  const ev = adv(ZI, st, 0.001, ZI.seededRng(1), away); const rw = kinds(ev, 'ruleWithdraw'), rows = ZI.returnReport(away).filter(r => /^Withdrew:/.test(r));
  check('5: one event "Withdrew: Low HP (also: Stress 86)"; the return report reads the same text once', rw.length === 1 && rw[0].text === 'Withdrew: Low HP (also: Stress 86)' && rows.length === 1 && rows[0] === rw[0].text + '.', rw.map(e => e.text).join('|') + ' / ' + rows.join('|')); }
// 6 — snoozes measured from the current value
{ const { ZI } = mkEnv(null, { heals:0 }); ZI.setRetreatRules({ loadLimitPct:110 });
  const st = run0(ZI, { hp:27 }); ZI.setStress(88); setLoad(ZI, st, 112); tick(ZI, st, W); ZI.setStress(88);
  const r = ZI.retreatHoldResolve(st, 'pushon', null, []); const sn = st.retreatSnoozes;
  const okVals = Math.abs(sn.stress.value - 98) < 1e-9 && sn.stress.u === 98 * U(ZI) && Math.abs(sn.load.value - loadPct(ZI, st) - 10) < 1e-9 && Math.floor(sn.load.value) === 122 && sn.hp.x100 === 1700 && sn.hp.value === 17;
  check('6: Push on snoozes 88 → 98, 112% → 122%, 27% → 17%', okVals && /Next stress warning at 98/.test(r.text) && /Next load warning at 122%/.test(r.text) && /Next health warning at 17%/.test(r.text) && !st.retreatHold && !st.withdrawing, r.text);
  st.hp = 20; const a = rulesNow(ZI, st); st.hp = 16; const b = rulesNow(ZI, st);
  check('6: snoozed HP fires again only below 17% (still needing no heals)', a === '' && b === 'hp', a + '|' + b);
  const E2 = mkEnv(null, { heals:5 }), Z2 = E2.ZI, s2 = run0(Z2); setLoad(Z2, s2, 116); tick(Z2, s2, W); Z2.retreatHoldResolve(s2, 'pushon', null, []);
  const onlyLoad = Object.keys(s2.retreatSnoozes).join(','); Z2.setStress(85);
  check('6: a rule not true at Push on is not snoozed and stays active', onlyLoad === 'load' && rulesNow(Z2, s2) === 'stress', onlyLoad + ' / ' + rulesNow(Z2, s2)); }
// 7 — unreachable snoozes
{ const { ZI } = mkEnv(null, { far:true, heals:999 }); ZI.setRetreatRules({ loadIgnore:true }); const st = run0(ZI); ZI.setStress(94); tick(ZI, st, W);
  const r = ZI.retreatHoldResolve(st, 'pushon', null, []); ZI.setStress(99.995); // walk the last 0.005 to 100 (3 s on explored ground)
  const stored = st.retreatSnoozes.stress.u === 104 * U(ZI);
  let n = 0; const f = ZI.forcedRetreat; ZI.forcedRetreat = function() { const x = f.apply(this, arguments); if (x) n++; return x; };
  const ev = adv(ZI, st, 10, ZI.seededRng(4), ZI.WanderSim.emptySummary(), 1);
  check('7: stress 94 → 104 stored unclamped; log "No more stress warnings this run"; Breaking still at 100, once', stored && r.text.includes('No more stress warnings this run') && n === 1 && kinds(ev, 'breaking').length === 1 && !kinds(ev, 'ruleWithdraw').length, JSON.stringify({ stored, n, br: kinds(ev, 'breaking').length, rw: kinds(ev, 'ruleWithdraw').map(e => e.text) }));
  const E2 = mkEnv(null, { heals:5 }), Z2 = E2.ZI; const s2 = run0(Z2); setLoad(Z2, s2, 118); tick(Z2, s2, W); const r2 = Z2.retreatHoldResolve(s2, 'pushon', null, []);
  const E3 = mkEnv(null, { heals:0 }), Z3 = E3.ZI; const s3 = run0(Z3, { hp:7 }); tick(Z3, s3, W); const r3 = Z3.retreatHoldResolve(s3, 'pushon', null, []);
  check('7: load 118% → 128% and HP 7% → −3% report "No more … warnings this run" (stored unclamped)', r2.text.includes('No more load warnings this run') && s2.retreatSnoozes.load.value > 125 && r3.text.includes('No more health warnings this run') && s3.retreatSnoozes.hp.x100 === -300, r2.text + ' / ' + r3.text); }
// 8 — snoozes survive a reload
{ const E = mkEnv(null, { heals:5 }); const st = run0(E.ZI); E.ZI.setStress(88); tick(E.ZI, st, W); E.ZI.setStress(88); E.ZI.retreatHoldResolve(st, 'pushon', null, []); E.ZI.saveWanderRun(st);
  const E2 = mkEnv(E.store); const s2 = E2.ZI.getWanderRun(); E2.ZI.setStress(90); const ev = tick(E2.ZI, s2, null);
  check('8: snoozes survive a reload during the run (stress 90 does not fire against the 98 snooze)', s2.retreatSnoozes.stress && s2.retreatSnoozes.stress.u === 98 * E2.ZI.STRESS_UNITS && !kinds(ev, 'ruleWithdraw').length && !s2.withdrawing); }
// 9 — lifetime: cleared on every run-ending path, never carried over; dip and rise keeps them
{ const snoozed = (Z, st) => { Z.setStress(88); tick(Z, st, W); Z.retreatHoldResolve(st, 'pushon', null, []); return !!st.retreatSnoozes.stress; };
  const A = mkEnv(null, { heals:5 }), sa = run0(A.ZI); snoozed(A.ZI, sa); A.ZI.setStress(80); const d1 = rulesNow(A.ZI, sa); A.ZI.setStress(90); const d2 = rulesNow(A.ZI, sa);
  check('9: a dip (80) and rise (90) does not clear the snooze', d1 === '' && d2 === '' && !!sa.retreatSnoozes.stress);
  A.ZI.wanderWithdraw(sa); adv(A.ZI, sa, 60, A.ZI.seededRng(1), null, 1); const p1 = sa.resting && Object.keys(sa.retreatSnoozes).length === 0;
  const B = mkEnv(null, { heals:5 }), sb = run0(B.ZI); snoozed(B.ZI, sb); B.ZI.forcedRetreat(sb, 'downed', B.ZI.seededRng(1)); const p2 = Object.keys(sb.retreatSnoozes).length === 0;
  const C = mkEnv(null, { heals:5 }), sc = run0(C.ZI); snoozed(C.ZI, sc); C.ZI.saveWanderRun(sc); C.ZI.resetWanderRun(); const p3 = Object.keys(C.ZI.getWanderRun().retreatSnoozes).length === 0 && C.ZI.getWanderRun().retreatHold === null;
  B.ZI.setStress(10); const evR = adv(B.ZI, sb, 1, B.ZI.seededRng(1), null, 1); const p4 = kinds(evR, 'resumed').length === 1 && !sb.resting && Object.keys(sb.retreatSnoozes).length === 0;
  check('9: snoozes clear on withdrawal arrival, Forced Retreat and Return to Base; the next run starts with none', p1 && p2 && p3 && p4, [p1, p2, p3, p4].join(',')); }
// 10 — not watching: background tab, hidden layout copy, offline catch-up
{ const E = mkEnv(null, { heals:5 }), Z = E.ZI; const el = (o) => Object.assign({ isConnected:true, closest:() => null, getClientRects:() => [1] }, o);
  Z.wanderMounted = true; Z.WanderEngine.rng = Z.seededRng(10); Z._wanderWatchEl = el(); const vis = Z.retreatWatching();
  E.doc.visibilityState = 'hidden'; E.doc.hidden = true; const bg = Z.retreatWatching(); E.doc.visibilityState = 'visible'; E.doc.hidden = false;
  Z._wanderWatchEl = el({ closest:() => ({}) }); const copy = Z.retreatWatching();
  Z._wanderWatchEl = el({ getClientRects:() => [] }); const notLaid = Z.retreatWatching();
  check('10: watching only for the real, laid-out, foreground screen (background tab / hidden copy → not watching)', vis && !bg && !copy && !notLaid, [vis, bg, copy, notLaid].join(','));
  const t0 = 1e12; const st = run0(Z, { lastTickAt: t0 }); Z.setStress(86); Z.saveWanderRun(st);
  Z._wanderWatchEl = el({ closest:() => ({}) }); const ev1 = Z.WanderEngine.liveStep(t0 + 1000); const s1 = Z.getWanderRun();
  const E2 = mkEnv(null, { heals:5 }), s2 = run0(E2.ZI); E2.ZI.setStress(86); const ev2 = adv(E2.ZI, s2, 60, E2.ZI.seededRng(1), null, 60, W);
  const E3 = mkEnv(null, { heals:5 }), s3 = run0(E3.ZI); E3.ZI.setStress(86); const ev3 = adv(E3.ZI, s3, 1, E3.ZI.seededRng(1), null, 1);
  check('10: hidden copy, offline catch-up chunk and unwatched beats never create a prompt or HOLD; they withdraw', [ev1, ev2, ev3].every(ev => !kinds(ev, 'retreatHold').length && kinds(ev, 'ruleWithdraw').length === 1) && !s1.retreatHold && s1.withdrawing && (s2.withdrawing || s2.resting) && s3.withdrawing); }
// 11 — watching: prompt + HOLD; Return now, timeout, Push on
{ const live = (o) => { const E = mkEnv(null, { heals:5 }), Z = E.ZI; Z.wanderMounted = true; Z.WanderEngine.rng = Z.seededRng(12); Z._wanderWatchEl = { isConnected:true, closest:() => null, getClientRects:() => [1] };
    const t0 = 1e12; const st = run0(Z, { lastTickAt: t0 }); setLoad(Z, st, 115); Z.saveWanderRun(st); E.t = t0; E.step = (s) => { const out = []; for (let i = 0; i < (s || 1); i++) { E.t += 1000; out.push(...Z.WanderEngine.liveStep(E.t)); } return out; }; return E; };
  const A = live(), evA = A.step(); const h = A.ZI.getWanderRun().retreatHold;
  check('11: watching → primary-trigger prompt "Pack heavy (115%): bank and return?" and HOLD', h && h.text === 'Pack heavy (115%): bank and return?' && kinds(evA, 'retreatHold').length === 1 && !A.ZI.getWanderRun().withdrawing, h && h.text);
  const r = A.ZI.wanderAct(s => A.ZI.retreatHoldResolve(s, 'return', null, [])); const ra = A.ZI.getWanderRun();
  const B = live(); B.step(); const evB = B.step(21); const rb = B.ZI.getWanderRun();
  const C = live(); C.step(); const sc0 = C.ZI.getWanderRun().scroll; C.ZI.wanderAct(s => C.ZI.retreatHoldResolve(s, 'pushon', null, [])); const evC = C.step(5); const rc = C.ZI.getWanderRun();
  check('11: Return now withdraws; the 20 s timer withdraws; Push on resumes the patrol', r.ok && ra.withdrawing && !ra.retreatHold && rb.withdrawing && !rb.retreatHold && kinds(evB, 'ruleWithdraw').length === 1 && !rc.withdrawing && !rc.retreatHold && rc.scroll > sc0 && !kinds(evC, 'retreatHold').length, JSON.stringify({ a: ra.withdrawing, b: rb.withdrawing, c: [rc.withdrawing, rc.scroll - sc0] })); }
// 12 — watching stops mid-prompt
{ const E = mkEnv(null, { heals:5 }), Z = E.ZI; Z.wanderMounted = true; Z.WanderEngine.rng = Z.seededRng(12); Z._wanderWatchEl = { isConnected:true, closest:() => null, getClientRects:() => [1] };
  let t = 1e12; const st = run0(Z, { lastTickAt: t }); Z.setStress(86); Z.saveWanderRun(st); const step = () => { t += 1000; return Z.WanderEngine.liveStep(t); };
  step(); const opened = !!Z.getWanderRun().retreatHold;
  E.doc.visibilityState = 'hidden'; E.doc.hidden = true; const ev1 = step(); const r1 = Z.getWanderRun();
  E.doc.visibilityState = 'visible'; E.doc.hidden = false; const ev2 = []; for (let i = 0; i < 60; i++) ev2.push(...step());
  check('12: tab hidden mid-prompt → prompt cancelled, withdrawal starts at once, activity does not resume, prompt never recreated, withdrawal + arrival shown', opened && !r1.retreatHold && r1.withdrawing && kinds(ev1, 'ruleWithdraw').length === 1 && !kinds(ev2, 'retreatHold').length && kinds(ev2, 'withdrawn').length === 1 && !Z.getWanderRun().retreatHold);
  const E2 = mkEnv(null, { heals:5 }), s2 = run0(E2.ZI); E2.ZI.setStress(86); tick(E2.ZI, s2, W); const r = E2.ZI.retreatHoldResolve(s2, 'cancel', null, []);
  check('12: leaving the screen / closing (cancel) withdraws immediately with its event', r.ok && r.kind === 'ruleWithdraw' && s2.withdrawing && !s2.retreatHold); }
// 13 — page closed during HOLD
{ const E = mkEnv(null, { far:true, heals:5 }), Z = E.ZI; const st = run0(Z); Z.setStress(86); tick(Z, st, W); Z.saveWanderRun(st);
  const savedHold = !!Z.getWanderRun().retreatHold;
  const B = mkEnv(E.store); const sb = B.ZI.getWanderRun(); const evB = adv(B.ZI, sb, 600, B.ZI.seededRng(5), B.ZI.WanderSim.emptySummary(), 1, W);
  const C = mkEnv(E.store); const sc = C.ZI.getWanderRun(); const evC0 = [], rngC = C.ZI.seededRng(5); C.ZI.retreatHoldResolve(sc, 'cancel', null, evC0, rngC); const evC = evC0.concat(adv(C.ZI, sc, 600, rngC, C.ZI.WanderSim.emptySummary(), 1));
  const sig = (Z2, s, ev) => JSON.stringify({ k: ev.map(e => e.kind), st: Z2.getStress(), sc: s.scrollUm, left: s.withdrawLeftUm, rest: s.resting, hp: s.hp });
  check('13: a saved HOLD becomes a withdrawal at the last saved tick on load, matching an unwatched run from that moment', savedHold && evB[0] && evB[0].kind === 'ruleWithdraw' && !kinds(evB, 'retreatHold').length && sig(B.ZI, sb, evB) === sig(C.ZI, sc, evC), sig(B.ZI, sb, evB).slice(0, 160)); }
// 14 — discovery interruption
{ const { ZI } = mkEnv(null, { heals:5 }); ZI.wanderMounted = true; const st = run0(ZI); ZI.createPrompt(st, ZI.seededRng(2)); ZI.wanderMounted = false; ZI.setStress(86);
  const ev = tick(ZI, st, W); const lb = ev.findIndex(e => e.kind === 'discovery' && e.outcome === 'left behind (withdrew)'), ho = ev.findIndex(e => e.kind === 'retreatHold');
  check('14: the discovery closes as "left behind (withdrew)", then the retreat prompt opens; never both', lb >= 0 && ho > lb && !st.prompt && st.retreatHold && st.retreatHold.interrupted && st.retreatHold.interrupted.reason === 'withdrew', lb + '<' + ho); }
// 15 — during HOLD
{ const { ZI } = mkEnv(null, { far:true, heals:5 }); const st = run0(ZI); ZI.setStress(86); tick(ZI, st, W);
  const snap = () => JSON.stringify([st.scrollUm, st._encMs, st._polMs, st._discMs, st.kills, ZI.getStressState().u, (st.carried || []).length]);
  setLoad(ZI, st, 120); const b = snap(), sim0 = st._simNow, t0 = st.retreatHold.expiresInMs;
  const ev = adv(ZI, st, 10, ZI.seededRng(9), null, 1, W); const a = snap() === b;
  check('15: HOLD pauses movement, encounters, discovery rolls and travel stress; timer and simulated clock (buffs) run; a newly true rule does not change the prompt', a && st.retreatHold && st.retreatHold.expiresInMs === t0 - 10000 && st._simNow > sim0 && st.retreatHold.primary.rule === 'stress' && st.retreatHold.also.length === 0 && !ev.length, b + ' → ' + snap()); }
// 16 — cleared ground during HOLD
{ const { ZI } = mkEnv(null, { heals:5 }); const st = run0(ZI); ZI.setStress(90); tick(ZI, st, W); const u0 = ZI.getStressState().u;
  adv(ZI, st, 10, ZI.seededRng(1), null, 1, W); const du = u0 - ZI.getStressState().u;
  check('16: cleared-ground recovery continues during HOLD at the usual −0.10/min', st.retreatHold && du === 10000 * ZI.stressUnitsPerMsFromPerMin(0.10), du); }
// 17 — Breaking during HOLD
{ const { ZI } = mkEnv(null, { heals:5 }); let n = 0; const f = ZI.forcedRetreat; ZI.forcedRetreat = function() { const x = f.apply(this, arguments); if (x) n++; return x; };
  const st = run0(ZI); ZI.setStress(90); tick(ZI, st, W); ZI.WanderSim._stress(st, 20, null);
  const ev = adv(ZI, st, 6, ZI.seededRng(1), null, 1, W);
  check('17: stress 100 during HOLD cancels it and runs the Forced Retreat at once, exactly once', n === 1 && kinds(ev, 'breaking').length === 1 && ev[0].kind === 'breaking' && !st.retreatHold && st.resting && st.restAt === 'base' && !kinds(ev, 'ruleWithdraw').length, n); }
// 18 — no rule checks while withdrawing or resting
{ const { ZI } = mkEnv(null, { far:true, heals:5 }); let calls = 0; const f = ZI.retreatRulesTrue; ZI.retreatRulesTrue = function() { calls++; return f.apply(this, arguments); };
  const st = run0(ZI); ZI.setStress(86); tick(ZI, st, null); calls = 0;
  adv(ZI, st, 20, ZI.seededRng(1), null, 1); const cW = calls; adv(ZI, st, 60, ZI.seededRng(1), null, 1); const resting = st.resting; calls = 0; adv(ZI, st, 600, ZI.seededRng(1), null, 1); const cR = calls;
  const E2 = mkEnv(null, { heals:5 }), s2 = Object.assign(run0(E2.ZI), { resting:true, restAt:'checkpoint', restStartHp:100, restElapsedMs:0 }); let c2 = 0; const f2 = E2.ZI.retreatRulesTrue; E2.ZI.retreatRulesTrue = function() { c2++; return f2.apply(this, arguments); };
  adv(E2.ZI, s2, 5, E2.ZI.seededRng(1), null, 1);
  check('18: no rule checks while withdrawing or resting; they resume with the patrol', cW === 0 && resting && cR === 0 && !s2.resting && c2 > 0, [cW, cR, c2].join(',')); }
// 19 — banking at the checkpoint cannot retrigger the load rule on the same haul
{ const { ZI } = mkEnv(null, { heals:999 }); let banks = 0; const bk = ZI.bankWanderLoot; ZI.bankWanderLoot = function(a) { banks++; return bk.apply(this, arguments); };
  const st = run0(ZI); setLoad(ZI, st, 115); const away = ZI.WanderSim.emptySummary(), ev = []; let pctAtArrival = null;
  for (let s = 0; s < 1800 && !ev.some(e => e.kind === 'resumed'); s++) { const n0 = ev.length; ZI.WanderSim.advance(st, 1, away, ZI.seededRng(2 + s), ev); if (pctAtArrival == null && ev.slice(n0).some(e => e.kind === 'withdrawn')) pctAtArrival = loadPct(ZI, st); }
  const w = kinds(ev, 'withdrawn')[0];
  check('19: load 115% → withdraw → haul banked through the existing flow at the checkpoint; no retrigger on the same haul', kinds(ev, 'ruleWithdraw').length === 1 && kinds(ev, 'ruleWithdraw')[0].primary === 'load' && w && w.banked >= 1 && banks === 1 && pctAtArrival < 115 && kinds(ev, 'resumed').length === 1, [kinds(ev, 'ruleWithdraw').length, banks, pctAtArrival].join(',')); }
// 20 — no stall at the checkpoint
{ const { ZI } = mkEnv(null, { far:true, heals:5 }); const st = run0(ZI); ZI.setStress(86); const ev = adv(ZI, st, 60, ZI.seededRng(1), null, 1);
  const u0 = ZI.getStressState().u; adv(ZI, st, 3600, ZI.seededRng(1), null, 600); const du = u0 - ZI.getStressState().u;
  const ev2 = adv(ZI, st, 48 * 3600, ZI.seededRng(1), null, 3600); const rs = kinds(ev2, 'resumed')[0];
  check('20: withdrawing at 86 stress, the checkpoint rest recovers −20/day exactly and redeploys', kinds(ev, 'withdrawn').length === 1 && du === 3600000 * ZI.stressUnitsPerMsFromPerDay(20) && rs && rs.restAt === 'checkpoint' && rs.stress < 70 && rs.hp >= 80, du + ' ' + JSON.stringify(rs)); } /* PF1 (authorized by Sam, Oct 16): resume gate stress < 70 */
// 21 — two-condition gate at the checkpoint
{ const gate = (hp, stress) => { const { ZI } = mkEnv(null, { heals:5 }); const st = Object.assign(run0(ZI), { hp, resting:true, restAt:'checkpoint', restStartHp:hp, restElapsedMs:0 }); ZI.setStress(stress);
    const need = ZI.WanderSim._restNeedMs(st).need; ZI.WanderSim.advance(st, (need - 1) / 1000, null, ZI.seededRng(1), []); const before = st.resting;
    const ev = []; ZI.WanderSim.advance(st, 0.001, null, ZI.seededRng(1), ev); return { need, before, after: st.resting, hp: kinds(ev, 'resumed')[0] && kinds(ev, 'resumed')[0].hp, s: ZI.getStress() }; };
  const a = gate(20, 80), b = gate(50, 40), /* PF1 (authorized by Sam, Oct 16): resume gate stress < 70 */ hpMs = Math.ceil(60 / (100 * 5 / 100 / 60000));
  check('21: checkpoint rest ends only at HP ≥ 80% AND stress < 70 (HP alone at 12 min is not enough; stress-only case ends at the HP moment)', a.before && !a.after && a.need > hpMs * 10 && a.s < 70 && b.before && !b.after && b.need === Math.ceil(30 / (100 * 5 / 100 / 60000)) && b.hp === 80, JSON.stringify([a, b])); }
// 22 — Base gate after Breaking; no repeated-Breaking loop in 24 h
{ const { ZI } = mkEnv(null, { far:true, heals:5 }); const st = run0(ZI); ZI.setStress(99.9); ZI.WanderSim._stress(st, 1, null);
  const ev = adv(ZI, st, 3600, ZI.seededRng(6), ZI.WanderSim.emptySummary(), 60); const at1h = st.resting && st.restAt === 'base' && st.hp >= 80 && Math.abs(ZI.getStress() - (80 - 20 / 24)) < 1e-9; /* PF1 (authorized by Sam, Oct 16): Shaken floor 80, above the resume gate (< 70) */
  const ev2 = adv(ZI, st, 23 * 3600, ZI.seededRng(6), ZI.WanderSim.emptySummary(), 3600); const rs = kinds(ev2, 'resumed')[0];
  check('22: after Breaking (stress 80) the Base rest holds at HP ≥ 80% until stress < 70 (~12 h); 24 h shows no repeated-Breaking loop', kinds(ev, 'breaking').length === 1 && at1h && rs && rs.restAt === 'base' && rs.stress < 70 && kinds(ev2, 'breaking').length === 0, JSON.stringify({ at1h, rs, br2: kinds(ev2, 'breaking').length })); }
// 23 — stress-ceiling validation
{ const { ZI } = mkEnv(); const v = (x) => ZI.validateRetreatRules(x).stressCeiling;
  check('23: 71–95 and Off accepted; ≤ 70 or malformed → 71; missing → 85', v({ stressCeiling:71 }) === 71 && v({ stressCeiling:95 }) === 95 && v({ stressCeiling:80 }) === 80 && ZI.validateRetreatRules({ stressOff:true, stressCeiling:80 }).stressOff === true && v({ stressCeiling:70 }) === 71 && v({ stressCeiling:51 }) === 71 && v({ stressCeiling:0 }) === 71 && v({ stressCeiling:'x' }) === 71 && v({ stressCeiling:NaN }) === 71 && v({}) === 85 && v(null) === 85 && v({ stressCeiling:120 }) === 95); }
// 24 — HP boundary in exact integer arithmetic, incl. maxHp 95
{ const { ZI } = mkEnv(null, { heals:0 });
  const pure = !ZI.retreatHpBelow(30, 100, 30) && ZI.retreatHpBelow(29, 100, 30) && !ZI.retreatHpBelow(28.5, 95, 30) && ZI.retreatHpBelow(28, 95, 30);
  ZI.WANDER_REST_TABLE.maxHp = 95; const st = run0(ZI, { hp:28.5 }); const a = rulesNow(ZI, st); st.hp = 28; const b = rulesNow(ZI, st); ZI.WANDER_REST_TABLE.maxHp = 100;
  check('24: exactly 30% does not fire, below does; maxHp 95: 28.5 HP does not, 28 HP does', pure && a === '' && b === 'hp', a + '|' + b); }
// 25 — rest stress rate: one source (restBed), checkpoint fixed at Bedroll
{ const { ZI } = mkEnv(); const seen = []; const rb = ZI.restBed; ZI.restBed = function(w) { seen.push(w || 'base'); return rb.apply(this, arguments); };
  const s1 = Object.assign(run0(ZI), { resting:true, restAt:'checkpoint', restStartHp:100 }); ZI.setStress(70); ZI.WanderSim.advance(s1, 1, null, ZI.seededRng(1), []);
  const s2 = Object.assign(run0(ZI), { resting:true, restAt:'base', restStartHp:100 }); ZI.WanderSim.advance(s2, 1, null, ZI.seededRng(1), []);
  check('25: checkpoint and Base rest both take their stress rate from restBed(); checkpoint is fixed at Bedroll (−20/day)', seen.includes('checkpoint') && seen.includes('base') && rb('checkpoint') === 'bedroll' && ZI.restStressPerDay('checkpoint') === 20 && ZI.restStressPerDay('base') === ZI.ACTIVE_TABLE.stress.bedRecoveryPerDay[rb()] && /restStressPerDay/.test(ZI.WanderSim._onRest.toString()), seen.join(',')); }
// 26 — every Section H boundary crossed mid-chunk at the same simulated moment (1-s, uneven, bulk)
{ const STEPS = [1, [1.3, 0.7, 2.9], null];
  const caseRun = (setup, sec, step) => { const E = mkEnv(null, { far: setup.far, heals: setup.heals == null ? 999 : setup.heals }), Z = E.ZI; const st = run0(Z); setup.fn(Z, st);
    const ev = adv(Z, st, sec, Z.seededRng(17), Z.WanderSim.emptySummary(), step || sec);
    return { Z, st, ev, sig: JSON.stringify({ k: ev.map(e => e.kind), rw: kinds(ev, 'ruleWithdraw').map(e => [e.stressU, e.scrollUm]), rs: kinds(ev, 'resumed').map(e => [e.hp, e.stress]), u: Z.getStressState().u, um: st.scrollUm, left: st.withdrawLeftUm, hp: st.hp, rest: st.resting }) }; };
  const all = (setup, sec) => STEPS.map(s => caseRun(setup, sec, s));
  const same = (rs) => rs.every(r => r.sig === rs[0].sig);
  // stress-rule trigger, crossed mid-chunk (84.93 → 85 at +0.25/min = 16.8 s)
  { const rs = all({ far:true, fn:(Z) => Z.setStress(84.9333) }, 60), r = rs[0], rate = r.Z.WanderSim._walkStressRate(), thr = 85 * r.Z.STRESS_UNITS;
    const e = kinds(r.ev, 'ruleWithdraw')[0], ms = e ? (e.stressU - Math.round(84.9333 * r.Z.STRESS_UNITS)) / rate : -1;
    check('26: stress rule — fires at the exact first ms ≥ 85 (' + ms + ' ms, mid-chunk), same for 1-s, uneven and bulk', same(rs) && e && e.primary === 'stress' && e.stressU >= thr && e.stressU - thr < rate && ms % 1000 !== 0 && e.scrollUm === 400e6 + 3000 * ms, e && (e.stressU - thr)); }
  // snoozed stress threshold (88 → 98), crossed mid-chunk
  { const rs = all({ far:true, fn:(Z, st) => { Z.setStress(97.9333); st.retreatSnoozes = { stress: { u: 98 * Z.STRESS_UNITS, value: 98 } }; } }, 60), e = kinds(rs[0].ev, 'ruleWithdraw')[0];
    check('26: snoozed stress threshold — fires at the exact first ms ≥ 98, same for all chunkings', same(rs) && e && e.stressU >= 98 * rs[0].Z.STRESS_UNITS && e.stressU - 98 * rs[0].Z.STRESS_UNITS < rs[0].Z.WanderSim._walkStressRate(), e && e.stressU); }
  // resume on stress < 70 (HP already 100), crossed mid-chunk /* PF1 (authorized by Sam, Oct 16): resume gate stress < 70 */
  { const rs = all({ fn:(Z, st) => { Object.assign(st, { resting:true, restAt:'checkpoint', restStartHp:100, restElapsedMs:0 }); Z._setStressU(70 * Z.STRESS_UNITS + 4.7e9); } }, 30), r = rs[0], e = kinds(r.ev, 'resumed')[0], rate = r.Z.stressUnitsPerMsFromPerDay(20);
    const k = Math.floor(4.7e9 / rate) + 1;
    check('26: resume on stress < 70 — the exact first ms below 70, same for all chunkings', same(rs) && e && e.stress * r.Z.STRESS_UNITS === 70 * r.Z.STRESS_UNITS + 4.7e9 - k * rate, k + ' ms'); }
  // resume on HP ≥ 80% (stress low), crossed mid-chunk
  { const rs = all({ fn:(Z, st) => { Object.assign(st, { hp:79.9, resting:true, restAt:'checkpoint', restStartHp:79.9, restElapsedMs:0 }); Z.setStress(10); } }, 30), e = kinds(rs[0].ev, 'resumed')[0];
    check('26: resume on HP ≥ 80% — exact (1.2 s after 79.9 HP at 5 HP/min), same for all chunkings', same(rs) && e && e.hp === 80 && rs[0].st.scrollUm === 400e6 + 3000 * (30000 - Math.ceil(0.1 * 12000 - 1e-9)), rs[0].st.scrollUm); }
  // HP rule: HP changes only at discrete events (fights, policy, venture); the check runs at every event → same moment
  { const rs = all({ far:true, heals:0, fn:(Z) => Z.setStress(0) }, 900), e = kinds(rs[0].ev, 'ruleWithdraw')[0];
    check('26: HP rule — fires at the same event for all chunkings (HP changes only at events)', same(rs) && e && e.primary === 'hp', e && e.text); } }
// 27 — overnight overload (unwatched)
{ const E = mkEnv(null, { heals:999 }), Z = E.ZI; const st = run0(Z); setLoad(Z, st, 113); Z.saveWanderRun(st);
  const t0 = 1e12; Z.syncWanderState({ lastTickAt: t0, awaySummary: null }); Z.WanderEngine.rng = Z.seededRng(27);
  const ev = Z.WanderEngine.tick(t0 + 8 * 3600 * 1000); const away = Z.getWanderRun().awaySummary || {};
  const iW = ev.findIndex(e => e.kind === 'ruleWithdraw' && e.primary === 'load'), iA = ev.findIndex(e => e.kind === 'withdrawn'), iR = ev.findIndex(e => e.kind === 'resumed');
  check('27: an unwatched overloaded overnight run withdraws at 115%, banks at the checkpoint and redeploys under the gate', iW >= 0 && iA > iW && ev[iA].banked >= 1 && iR > iA && !kinds(ev, 'retreatHold').length && (away.ruleWithdrawals || []).length >= 1, [iW, iA, iR].join(',')); }
// 28 — unwatched equivalence: rule firing, withdrawal, banking, recovery, redeployment
{ const sig = (o, step) => { const E = mkEnv(null, { far:o.far, heals:o.heals }), Z = E.ZI; const st = run0(Z); Z.setStress(o.stress); setLoad(Z, st, o.load); const away = Z.WanderSim.emptySummary();
    const ev = adv(Z, st, o.sec, Z.seededRng(o.seed), away, step);
    return { s: JSON.stringify({ k: ev.map(e => e.kind + (e.primary ? ':' + e.primary : '')), t: kinds(ev, 'ruleWithdraw').map(e => e.text + e.stressU + '@' + e.scrollUm), u: Z.getStressState().u, um: st.scrollUm, hp: st.hp, rest: st.resting, wd: st.withdrawing, c: (st.carried || []).length, rep: Z.returnReport(away) }), ev }; };
  // FX1 (authorized scenario edit, Oct 10): under U5 a survivor walking home at 1 HP can be Downed, so case 1 no longer always completes a
  // withdrawal. Case 3 (load rule at 116%, heals in hand) restores a guaranteed withdraw → bank → rest → redeploy. The equivalence test is unchanged.
  const cases = [{ far:true, heals:0, stress:40, load:105, sec:3 * 3600, seed:28 }, { far:false, heals:2, stress:20, load:110, sec:3 * 3600, seed:29 }, { far:false, heals:2, stress:20, load:116, sec:3 * 3600, seed:31 }];
  const evs = []; let same = true; cases.forEach(o => { const a = sig(o, 1), b = sig(o, [3, 1, 7, 2]), c = sig(o, o.sec); same = same && a.s === b.s && b.s === c.s; evs.push(...a.ev); });
  const has = (k) => evs.some(e => e.kind === k);
  check('28: 1-s, uneven and one bulk catch-up identical through rule firing, withdrawal, banking, rest and redeployment', same && has('ruleWithdraw') && has('withdrawn') && has('resumed') && evs.some(e => e.kind === 'withdrawn' && e.banked > 0), [same, has('ruleWithdraw'), has('withdrawn'), has('resumed')].join(',')); }
// 29 — old saves
{ const oldRun = { active:true, hp:70, scroll:300, lastCheckpoint:250, checkpoints:[250], carried:[{ name:'a', value:3, weight:1, seq:0 }], pickupSeq:1 };
  const E = mkEnv({ zi_save_version:'5', zi_wander_run: JSON.stringify(oldRun) }), Z = E.ZI; const r = Z._rj('zi_wander_run', {}), rr = Z._rj('zi_retreat_rules', null);
  const rest = Object.assign({}, r); delete rest.retreatSnoozes; delete rest.retreatHold; delete rest.withdrawCauses;
  check('29: old save → default validated settings, no snoozes, no HOLD; nothing else changes', Z.getSaveVersion() === Z.SAVE_FORMAT.current && JSON.stringify(rr) === JSON.stringify(Z.validateRetreatRules(null)) && JSON.stringify(r.retreatSnoozes) === '{}' && r.retreatHold === null && r.withdrawCauses === null && JSON.stringify(rest) === JSON.stringify(oldRun), JSON.stringify(r).slice(0, 200)); }

results.forEach(r => log(r[0] + '  ' + r[1] + (r[0] === 'FAIL' ? '  ' + r[2] : '')));
const pass = results.filter(r => r[0] === 'PASS').length; log(`${pass}/${results.length} R1 checks passed`);
return results;
})();
