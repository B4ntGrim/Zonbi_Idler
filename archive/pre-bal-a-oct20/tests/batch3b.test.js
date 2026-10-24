// Batch 3B: Forced Retreat consequences — one canonical path (reference/batch3b-brief.md).
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const mkEnv = (seed, mathObj) => {
  const store = Object.assign({ zi_materials: JSON.stringify({ metal:200 }), zi_world_seed:'12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify({ gx:0, gy:0, name:'Home', biome:'suburbia', difficulty:1 }) }, seed || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console, Date, Math: mathObj || Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document:{ hidden:false, addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw); fw.ZI.wanderMounted = false; return { ZI: fw.ZI, store };
};
const FAR = { zi_trav_pos: JSON.stringify({ gx:6, gy:5, name:'Far', biome:'suburbia', difficulty:1 }) };
const run0 = (ZI) => Object.assign(ZI.defaultWanderRun(), { active:true, hp:100, moveSpeed:3 });
const until = (ZI, st, sec, rng, away, step) => { const ev = []; let t = 0, k = 0; while (t < sec - 1e-9) { const sz = Array.isArray(step) ? step[k++ % step.length] : (step || sec); const d = Math.min(sz, sec - t); ZI.WanderSim.advance(st, d, away, rng, ev); t += d; } let g = 0; while (st._carryMs > 0 && g++ < 500) ZI.WanderSim.advance(st, 0, away, rng, ev); return ev; };
const haulOf = (n, v) => Array.from({ length: n }, (_, i) => ({ name:'h' + i, value: typeof v === 'function' ? v(i) : (v || 1), seq: i }));
const brute = { kind:'zombie', z:{ name:'Brute', hp:9999, dmg:200, armor:50, xp:10, tier:'S' } };
const frCount = (ZI) => { let n = 0; const f = ZI.forcedRetreat; ZI.forcedRetreat = function() { const r = f.apply(this, arguments); if (r) n++; return r; }; return () => n; };
const breakNow = (ZI, st, rng) => { ZI.setStress(99.6); ZI.WanderSim._stress(st, 1, null); const ev = []; ZI.WanderSim.advance(st, 0.001, ZI.WanderSim.emptySummary(), rng || ZI.seededRng(1), ev); return ev; };

// ── Scavenging helper (Oct 6 handoff) ──
{ const { ZI } = mkEnv(); const F = ZI.STAT_FORMULAS;
  check('6: factor at effective Scavenging 1 = 1.00', Math.abs(F.forcedRetreatScavFactor(1) - 1) < 1e-12, F.forcedRetreatScavFactor(1));
  check('6: factor at 25 = scavDropRate(25)/DROP_MAX (helper output)', F.forcedRetreatScavFactor(25) === Math.max(0, Math.min(1, F.scavDropRate(25) / F.DROP_MAX)) && F.forcedRetreatScavFactor(25) > 0.5 && F.forcedRetreatScavFactor(25) < 0.52, F.forcedRetreatScavFactor(25));
  check('6: factor at 50 = 0 and stays 0 above 50', F.forcedRetreatScavFactor(50) === 0 && F.forcedRetreatScavFactor(60) === 0 && F.forcedRetreatScavFactor(99) === 0);
  check('6: helper reuses scavDropRate (unchanged)', F.scavDropRate(1) === F.DROP_MAX * 49 / 49);
  const want = [0, 0, 1, 1, 2, 2, 3];
  check('7: loss counts at effective 1: N=0..6 → 0,0,1,1,2,2,3', want.every((x, N) => ZI.forcedRetreatLossCount(N, F.forcedRetreatScavFactor(1)) === x), want.map((_, N) => ZI.forcedRetreatLossCount(N, 1)).join(','));
  check('5: base loss share is 50% before Scavenging', ZI.FORCED_RETREAT_TABLE.baseLossShare === 0.5 && ZI.forcedRetreatLossCount(100, 1) === 50);
  check('6: mid-level count uses the factor (N=10 at 25 → floor(10×0.5×f))', ZI.forcedRetreatLossCount(10, F.forcedRetreatScavFactor(25)) === Math.floor(10 * 0.5 * F.forcedRetreatScavFactor(25)), ZI.forcedRetreatLossCount(10, F.forcedRetreatScavFactor(25)));
}
// ── Effective (not raw) Scavenging; rust raises loss; zero loss at 50+ ──
{ const { ZI } = mkEnv(); const raw = ZI.effectiveLevel;
  const lossAt = (L) => { ZI.effectiveLevel = (s) => s === 'scavenging' ? L : raw(s); const st = run0(ZI); st.carried = haulOf(10); const fr = ZI.forcedRetreat(st, 'downed', ZI.seededRng(2)); ZI.effectiveLevel = raw; return fr; };
  const a = lossAt(1), b = lossAt(25), c = lossAt(50), d = lossAt(70);
  check('6: forcedRetreat reads effective Scavenging (1 → 5 of 10 lost)', a.scavenging === 1 && a.lostCount === 5, a.lostCount);
  check('6: rust lowering effective Scavenging raises loss (25 → ' + b.lostCount + ', 1 → ' + a.lostCount + ')', b.lostCount < a.lostCount);
  check('6: effective 50+ loses nothing', c.lostCount === 0 && d.lostCount === 0 && c.banked === 10);
}
// ── 1, 12: Breaking ──
{ const { ZI } = mkEnv(FAR); const n = frCount(ZI); const st = run0(ZI); st.carried = haulOf(6);
  const scavBefore = ZI.effectiveLevel('scavenging');
  const ev = breakNow(ZI, st); const br = ev.filter(e => e.forcedRetreat);
  check('1: Breaking causes exactly one Forced Retreat', n() === 1 && br.length === 1 && br[0].cause === 'breaking', n());
  check('6: for Breaking, Scavenging read before the Shaken reset', br[0].scavenging === scavBefore, br[0].scavenging + ' vs ' + scavBefore);
  check('12: Breaking resets stress to 80 and reports Shaken', Math.abs(ZI.getStress() - 80) < 0.01 && br[0].shaken === true, ZI.getStress()); /* PF1 (authorized by Sam, Oct 16): Shaken floor 80, above the resume gate (< 70) */
  check('Base destination; run ended; pressure 0; Base rest entered (resumes at once from full HP)', br[0].destination === 'Base' && (st.resting || ev.some(e => e.kind === 'resumed')) && st.pressure === 0 && (st.carried || []).length === 0);
}
// ── 2, 3, 12, 17: Downed / revive ──
{ const { ZI } = mkEnv(); ZI._wj('zi_charges', { heal:0, scout:0 }); ZI.setStress(30); const n = frCount(ZI);
  const st = run0(ZI); st.carried = haulOf(4); const r = ZI.WanderSim.resolveEncounter(st, brute, ZI.seededRng(1));
  check('2: Downed with no recovery → exactly one Forced Retreat', r.outcome === 'forcedRetreat' && r.fr && r.fr.cause === 'downed' && n() === 1, r.outcome);
  check('12: Downed does not reset stress to 60', Math.abs(ZI.getStress() - 30) < 0.01 && r.fr.shaken === false, ZI.getStress());
  check('2: Downed loses 2 of 4 at effective 1 and banks the rest', r.fr.lostCount === 2 && r.fr.banked === 2, r.fr.lostCount);
}
{ const { ZI } = mkEnv(); ZI._wj('zi_charges', { heal:0, scout:0 }); ZI.grantGear('revenant_infusion', 1); ZI.equipGear('revenant_infusion', 'consumable1'); const n = frCount(ZI);
  const st = run0(ZI); st.carried = haulOf(4); const r = ZI.WanderSim.resolveEncounter(st, brute, ZI.seededRng(1));
  check('3/17: successful revive — no Forced Retreat, no haul loss, run continues', r.outcome === 'revived' && n() === 0 && st.carried.length >= 4 && !st.resting, r.outcome + ' carried=' + st.carried.length + ' n=' + n());
}
// ── 4: not triggers by themselves ──
{ const { ZI } = mkEnv(); const n = frCount(ZI);
  const s1 = run0(ZI); s1.hp = 20; ZI._wj('zi_charges', { heal:5, scout:0 }); until(ZI, s1, 30, ZI.seededRng(4), ZI.WanderSim.emptySummary(), 1);
  const s2 = run0(ZI); ZI._wj('zi_charges', { heal:0, scout:0 }); s2.carried = [{ name:'ballast', value:1, weight: ZI.carryTotals(null, null, { carried: [] }).capacityKg * 1.2, seq:0 }]; ZI.setStress(10); until(ZI, s2, 20, ZI.seededRng(5), ZI.WanderSim.emptySummary(), 1);
  const s3 = run0(ZI); s3.scroll = 300; s3.lastCheckpoint = 250; ZI.wanderWithdraw(s3); until(ZI, s3, 60, ZI.seededRng(6), ZI.WanderSim.emptySummary(), 1);
  check('4: low HP with heals, zero heals at full HP, overload, voluntary withdrawal → no Forced Retreat', n() === 0, n());
}
// ── 8, 9, 10, 11: protection and what is never lost ──
{ const { ZI } = mkEnv();
  const st = run0(ZI); st.carried = haulOf(6, i => i === 3 ? 50 : 2); const fr = ZI.forcedRetreat(st, 'downed', ZI.seededRng(9));
  check('8: best-value entry is kept', fr.kept === 'h3' && fr.lost.indexOf('h3') < 0, fr.kept);
  const s2 = run0(ZI); s2.carried = [{ name:'late', value:9, seq:7 }, { name:'early', value:9, seq:2 }, { name:'x', value:1, seq:3 }];
  const f2 = ZI.forcedRetreat(s2, 'downed', ZI.seededRng(1));
  check('9: equal-value tie protects the earliest pickup by stored sequence (not array order)', f2.kept === 'early', f2.kept);
  const s3 = run0(ZI); s3.carried = haulOf(4).concat([{ name:'Sealed Crate', id:'sealed_crate', value:1, seq:9 }]); let banked = [];
  const bk = ZI.bankWanderLoot; ZI.bankWanderLoot = (a) => { banked = banked.concat(a); return bk(a); };
  const f3 = ZI.forcedRetreat(s3, 'downed', ZI.seededRng(3)); ZI.bankWanderLoot = bk;
  check('10: story item never lost (not eligible, banked)', f3.eligible === 4 && f3.lost.indexOf('Sealed Crate') < 0 && banked.some(e => e.name === 'Sealed Crate'));
}
{ const { ZI } = mkEnv(); ZI.grantGear('medkit', 2); ZI.grantGear('pipe_pistol', 1); ZI.equipGear('pipe_pistol', 'primary');
  ZI.grantGear('handmade_pouch', 1); ZI.equipGear('handmade_pouch', 'backpack'); ZI.takeToCarried('medkit', 1);
  const car = ZI.getCarried(); if (car[0]) { car[0].charges = 1; ZI.saveCarried(car); }
  const before = JSON.stringify([ZI.getCarried(), ZI.getLoadout()]); const dur = JSON.stringify(ZI._rj('zi_durability', {}));
  const st = run0(ZI); st.carried = haulOf(5); ZI.forcedRetreat(st, 'breaking', ZI.seededRng(1));
  check('11: carried items, partial kit charges and equipped gear untouched; no extra wear', JSON.stringify([ZI.getCarried(), ZI.getLoadout()]) === before && JSON.stringify(ZI._rj('zi_durability', {})) === dur && ZI.getCarried()[0] && ZI.getCarried()[0].charges === 1);
}
// ── 13, exactly-once ──
{ const { ZI } = mkEnv(FAR); const st = run0(ZI); st.carried = haulOf(4); ZI.createPrompt(st, ZI.seededRng(7));
  const away = ZI.WanderSim.emptySummary(); ZI.setStress(99.6); ZI.WanderSim._stress(st, 1, null);
  const ev = until(ZI, st, 2, ZI.seededRng(1), away, 1);
  const lb = ev.filter(e => e.decision === 'left behind' && /forced retreat/.test(e.outcome));
  check('13: pending discovery → exactly one left behind (forced retreat)', lb.length === 1 && (away.discoveries || []).filter(d => /forced retreat/.test(d.outcome)).length === 1, lb.length);
  check('report: one Forced Retreat row with cause and haul consequence', ZI.returnReport(away).filter(r => /Forced retreat/.test(r)).length === 1 && ZI.returnReport(away).some(r => /Broke under stress: lost 2 of 4/.test(r)), ZI.returnReport(away).join(' | '));
}
{ const { ZI } = mkEnv(); let bankCalls = 0; const bk = ZI.bankWanderLoot; ZI.bankWanderLoot = (a) => { bankCalls++; return bk(a); };
  const st = run0(ZI); st.carried = haulOf(4); st.pressure = 2; ZI.createPrompt(st, ZI.seededRng(2));
  const a = ZI.forcedRetreat(st, 'downed', ZI.seededRng(1)), b = ZI.forcedRetreat(st, 'breaking', ZI.seededRng(1));
  check('exactly-once: second call on the same failure is refused (one loss calc, one banking, one discovery interruption, one rest)', !!a && b === null && bankCalls === 1 && (st._leftBehind || []).length === 1 && st.resting, bankCalls);
}
// ── 14, 15: equivalence incl. two or more Forced Retreats in one catch-up ──
// R1: Base rest now ends only at stress < 50, so a Breaking rests ~12 h; repeated Forced Retreats in 6 h come from Downed
// (rules off so the HP rule does not withdraw first).
{ const sig = (step) => { const { ZI } = mkEnv(Object.assign({ zi_retreat_rules: JSON.stringify({ hpOff:true, stressOff:true, loadIgnore:true }) }, FAR)); ZI._wj('zi_charges', { heal:0, scout:0 }); ZI.setStress(0); const st = run0(ZI);
    const away = ZI.WanderSim.emptySummary(); const ev = until(ZI, st, 6 * 3600, ZI.seededRng(11), away, step);
    const frs = ev.filter(e => e.forcedRetreat || e.fr).map(e => JSON.stringify(e.fr || e));
    return { frs, away: JSON.stringify(away.forcedRetreats || []), st: JSON.stringify([st.hp, st.scroll, st.resting, (st.carried || []).length, st.pressure, ZI.getStress()]) }; };
  const a = sig(1), b = sig([3, 1, 7, 2]), c = sig(6 * 3600);
  check('15: two or more Forced Retreats in one 6-h catch-up', a.frs.length >= 2, a.frs.length);
  check('14/15: live 1-s, uneven 3/1/7/2-s and one bulk catch-up identical (trigger, loss, kept, banked, stress, run state, order)', a.frs.join('|') === b.frs.join('|') && b.frs.join('|') === c.frs.join('|') && a.away === c.away && a.st === b.st && b.st === c.st, a.frs.length + '/' + b.frs.length + '/' + c.frs.length);
}
// ── 16: Fort carve-out ──
{ const m = Object.create(Math); m.random = () => 0.999; const { ZI } = mkEnv({}, m); const n = frCount(ZI);
  const st = run0(ZI); st.carried = haulOf(4); ZI.saveWanderRun(st);
  ZI.getFortPos && ZI.getFortPos(); const r = ZI.fortAttack(); const after = ZI.getWanderRun();
  check('16: failed Fort guard attack → Fort costs only (no generic Forced Retreat, no 50% loss, no report)', r && r.ok === false && n() === 0 && (after.carried || []).length === 4 && !after.resting, r && r.text);
}
// ── 19: save migration v4 → v5 and tie stability across reload/sorting ──
{ const old = { zi_save_version:'4', zi_wander_run: JSON.stringify({ active:true, hp:80, scroll:120, carried:[{ name:'first', value:5, weight:1 }, { name:'second', value:5, weight:1 }, { name:'junk', value:1, weight:1 }] }) };
  const E1 = mkEnv(old); const r1 = E1.ZI.getWanderRun();
  check('19: v4 → v5; sequence from saved order starting at 0; nothing else changed', E1.ZI.getSaveVersion() === E1.ZI.SAVE_FORMAT.current && E1.ZI.SAVE_FORMAT.current >= 5 && r1.carried.map(e => e.seq).join(',') === '0,1,2' && r1.hp === 80 && r1.scroll === 120 && r1.carried[0].weight === 1, E1.ZI.getSaveVersion() + ' ' + r1.carried.map(e => e.seq));
  r1.carried.reverse(); E1.ZI.saveWanderRun(r1);       // display/sort reorders the array
  const E2 = mkEnv(E1.store); const r2 = E2.ZI.getWanderRun(); const fr = E2.ZI.forcedRetreat(r2, 'downed', E2.ZI.seededRng(1));
  check('9/19: after save/reload and reordering, the original earliest pickup is still protected', fr.kept === 'first' && r2.carried.length === 0, fr.kept);
  const s = E2.ZI.defaultWanderRun(); s.carried = [{ name:'a', value:1, seq:4 }]; E2.ZI.simPickup(s, { name:'b', value:1 });
  check('19: new pickups get the next monotonic sequence', s.carried[1].seq === 5, s.carried[1].seq);
}
// ── 18, 21: one authoritative path; no old rules left ──
{ const w = await readFile('game/wandering.js'), a = await readFile('game/active.js'), sc = await readFile('screens-v3.jsx');
  check('18: old out-of-heals retreat and 10% Breaking code removed; one forcedRetreat entry point', !/_retreat\(state, out\)/.test(w) && !/breakingHaulLossPct/.test(a) && !/loseHaul\(state, lose/.test(a) && (a.match(/ZI\.forcedRetreat = function/g) || []).length === 1);
  check('18: legacy screen Downed overlay cannot open from a saved HP ≤ 0', /const \[downed, setDowned\] = React\.useState\(false\)/.test(sc));
}

let pass = 0; for (const [r, n, x] of results) { if (r === 'PASS') pass++; log(r + '  ' + n + '  ' + (r === 'FAIL' ? x : '')); }
log(pass + '/' + results.length + ' batch-3B checks passed');
})();
