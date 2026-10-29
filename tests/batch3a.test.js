// Batch 3A: field load — haul weight, overload speed/stress, 125% pickup ceiling, persistence, migration.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x || '']);
const mkEnv = (seed) => {
  const store = Object.assign({ zi_materials: JSON.stringify({ metal:200 }), zi_world_seed:'12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify({ gx:0, gy:0, name:'Home', biome:'suburbia', difficulty:1 }) }, seed || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document:{ hidden:false, addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  /* Oct 29: consumable-only healing ships (base heals 0); this suite tests heal-charge mechanics with the legacy base charges. Shipped rule: tests/proposals-oct29.test.js */ new Function('fw', 'with(fw){' + (src).replace('baseHeal: 0, baseScout: 2, commandPerkLevel: 40, commandPerkHeal: 0', 'baseHeal: 2, baseScout: 2, commandPerkLevel: 40, commandPerkHeal: 1') + '}')(fw); fw.ZI.wanderMounted = false; return { ZI: fw.ZI, store };
};
const run0 = (ZI) => Object.assign(ZI.defaultWanderRun(), { active:true, hp:100, moveSpeed:3 });
const until = (ZI, st, sec, rng, away, step) => { const ev = []; let t = 0; while (t < sec - 1e-9) { const d = Math.min(step || sec, sec - t); ZI.WanderSim.advance(st, d, away, rng, ev); t += d; } let g = 0; while (st._carryMs > 0 && g++ < 500) ZI.WanderSim.advance(st, 0, away, rng, ev); return ev; };
const cap = (ZI) => ZI.carryTotals(null, null, { carried: [] }).capacityKg;
const fill = (ZI, s, kg) => { s.carried = [{ name:'ballast', value:1, weight: kg }]; };
// 1
{ const { ZI } = mkEnv(); const s = run0(ZI); s.carried = [{ name:'a', value:30 }, { name:'b', value:12 }];
  const t = ZI.carryTotals(null, null, s);
  check('1: haul weight is in the load total', Math.abs(t.haulKg - (ZI.salvageWeight(30) + ZI.salvageWeight(12))) < 1e-9 && t.loadKg >= t.haulKg, t.haulKg);
  check('1: haul uses no pockets', t.pocketsUsed === ZI.carryTotals(null, null, { carried: [] }).pocketsUsed); }
// 2
{ const { ZI } = mkEnv(); const it = { name:'x', value:27, rarity:'Common' };
  check('2: Recycler and haul weights come from one helper and match', ZI.toRecyclerItem(it).weight === ZI.haulEntryWeight(it) && ZI.haulEntryWeight(it) === ZI.salvageWeight(27)); }
// 3
{ const { ZI } = mkEnv(); const s = run0(ZI), C = cap(ZI);
  fill(ZI, s, C); check('3: at exactly 100% — speed ×1.00, no stress multiplier', ZI.overloadSpeedMult(s) === 1 && !ZI.isOverloaded(s));
  fill(ZI, s, C + 0.001); check('3: just above 100% — both apply', ZI.overloadSpeedMult(s) < 1 && ZI.isOverloaded(s));
  fill(ZI, s, C * 1.1); const f110 = ZI.overloadSpeedMult(s); fill(ZI, s, C * 1.2); const f120 = ZI.overloadSpeedMult(s); fill(ZI, s, C * 1.25); const f125 = ZI.overloadSpeedMult(s);
  check('3: curve 110% → ×0.90, 120% → ×0.80, 125% → ×0.75', Math.abs(f110 - 0.9) < 1e-9 && Math.abs(f120 - 0.8) < 1e-9 && Math.abs(f125 - 0.75) < 1e-9, [f110, f120, f125].join(',')); }
// 4
{ const { ZI } = mkEnv(); const s = run0(ZI), C = cap(ZI); const room = C * 1.25 - ZI.salvageWeight(30);
  fill(ZI, s, room); check('4: a pickup landing exactly on 125% is accepted', ZI.simPickup(s, { name:'exact', value:30 }) === true && s.carried.length === 2);
  check('4: a pickup that would exceed 125% is refused and not added', ZI.simPickup(s, { name:'heavy', value:30 }) === false && s.carried.length === 2);
  const ev = [], away = ZI.WanderSim.emptySummary(); ZI.flushTooHeavy(s, away, ev); ZI.flushTooHeavy(s, away, ev);
  check('4: refused loot is logged once and reported once (grouped)', ev.length === 1 && ev[0].names[0] === 'heavy' && ZI.returnReport(away).filter(r => /too heavy/.test(r)).length === 1, JSON.stringify(ev)); }
// 5
{ const { ZI } = mkEnv(); const s = run0(ZI), C = cap(ZI); fill(ZI, s, C * 1.1);
  ZI.setStress(10); ZI.WanderSim._stress(s, 4, null); const gain = ZI.getStress() - 10;
  ZI.setStress(10); ZI.WanderSim._stress(s, -4, null); const loss = ZI.getStress() - 10;
  check('5: overloaded — positive gains ×2, negative changes unchanged', Math.abs(gain - 8) < 1e-9 && Math.abs(loss + 4) < 1e-9, gain + ' / ' + loss); /* BAL-A (authorized, Oct 19): overload ×2 (A5) */
  const r0 = ZI.WanderSim._walkStressRate(); check('5: cleared-ground recovery is not multiplied', ZI.WanderSim._walkStressRateFor(s) === r0 && r0 < 0);
  s.carried = Array.from({ length: 10 }, (_, i) => ({ name:'j' + i, value:1, weight: C * 0.12 })); ZI.setStress(99.5); ZI.WanderSim._stress(s, 1, null);
  const ev = []; ZI.WanderSim.advance(s, 1, ZI.WanderSim.emptySummary(), ZI.seededRng(1), ev);
  check('5: the Broken reset to 80 is not multiplied', ev.some(e => e.kind === 'broken' && e.stress === 80) && ZI.getStress() <= 80.0001, ZI.getStress()); } /* BAL-A (authorized, Oct 19): Broken replaces Breaking (A4) */ /* PF1 (authorized by Sam, Oct 16): Shaken floor 80 */
// 6
{ const runIt = (step) => { const E2 = mkEnv({ zi_trav_pos: JSON.stringify({ gx:6, gy:5, name:'Far', biome:'suburbia', difficulty:1 }), zi_retreat_rules: JSON.stringify({ hpOff:true, stressOff:true, loadIgnore:true }) }); const Z = E2.ZI; const s = run0(Z), C = cap(Z); // R1 rules off: checks the 125% ceiling
    Z._wj('zi_charges', { heal: 999, scout: 2 }); s.carried = [{ name:'ballast', value:1, weight: C * 0.97 }]; Z.setStress(10);
    const away = Z.WanderSim.emptySummary(); const ev = until(Z, s, 900, Z.seededRng(21), away, step);
    return { out: JSON.stringify({ st: Z.getStress(), um: s.scrollUm, sc: s.scroll, hp: s.hp, n: (s.carried || []).length, kg: Z.loadFor(s).kg, heavy: away.tooHeavy || 0 }), crossed100: Z.loadFor(s).kg > C, heavy: away.tooHeavy || 0 }; };
  const a = runIt(1), b = runIt(7), c = runIt(900);
  check('6: 1-s beats, 7-s and one 900-s catch-up give identical stress, load, haul and position', a.out === b.out && a.out === c.out, a.out + ' | ' + c.out);
  check('6: the run crossed 100% and hit the 125% ceiling', a.crossed100 && a.heavy > 0, 'heavy=' + a.heavy); }
// 7
{ const E1 = mkEnv(); const Z = E1.ZI; const s = run0(Z); s.carried = Array.from({ length: 25 }, (_, i) => ({ name:'loot' + i, value: 10 + i, weight: Z.salvageWeight(10 + i) })); Z.saveWanderRun(s);
  const E2 = mkEnv(E1.store); const back = E2.ZI.getWanderRun();
  check('7: a large haul survives a reload intact (14.9 closed)', back.carried.length === 25 && back.carried.every((e, i) => e.name === 'loot' + i && e.weight === Z.salvageWeight(10 + i))); }
// 8
{ const old = { zi_save_version: '3', zi_wander_run: JSON.stringify({ active:true, hp:80, scroll:120, carried:[{ name:'old salvage', value:18, rarity:'Common' }] }), zi_stash: JSON.stringify({ v:2, items:['medkit'] }) };
  const { ZI } = mkEnv(old); const r = ZI.getWanderRun();
  check('8: older run without haul weights gets them derived', ZI.getSaveVersion() === ZI.SAVE_FORMAT.current && r.carried[0].weight === ZI.salvageWeight(18));
  check('8: existing save otherwise unchanged', r.hp === 80 && r.scroll === 120 && r.carried.length === 1 && ZI.getStash().join() === 'medkit'); }
// Withdrawal arrival equivalence (pre–Forced Retreat fix)
{ const runIt = (steps, overloaded) => { const E2 = mkEnv(); const Z = E2.ZI; const s = run0(Z), C = cap(Z);
    Z._wj('zi_charges', { heal: 999, scout: 2 }); Z.setStress(20);
    s.carried = overloaded ? [{ name:'ballast', value:1, weight: C * 1.2 }] : [{ name:'pack', value:12 }];
    s.scroll = 400; s.lastCheckpoint = 250; s.pressure = 2; Z.wanderWithdraw(s);
    const away = Z.WanderSim.emptySummary(), ev = [], rng = Z.seededRng(31); let t = 0, i = 0, arrivedAt = null;
    while (t < 240 - 1e-9) { const d = Math.min(steps[i++ % steps.length], 240 - t); const n0 = ev.length; Z.WanderSim.advance(s, d, away, rng, ev); t += d;
      for (let k = n0; k < ev.length; k++) if (ev[k].kind === 'withdrawn' && arrivedAt == null) arrivedAt = 'call@' + Math.round(t); }
    let g = 0; while (s._carryMs > 0 && g++ < 500) Z.WanderSim.advance(s, 0, away, rng, ev);
    const arrive = ev.findIndex(e => e.kind === 'withdrawn');
    return { out: JSON.stringify({ st: Z.getStress(), um: s.scrollUm, sc: s.scroll, left: s.withdrawLeftUm, rest: s.resting, restMs: s.restElapsedMs, hp: s.hp, pr: s.pressure, wd: s.withdrawing,
      kinds: ev.map(e => e.kind), arriveIdx: arrive, report: Z.returnReport(away) }), arrived: arrive >= 0 }; };
  for (const ov of [false, true]) {
    const a = runIt([1], ov), b = runIt([3, 1, 7, 2], ov), c = runIt([240], ov);
    check('W-' + (ov ? 'overloaded' : 'normal') + ': withdrawal reaches safety', a.arrived && c.arrived);
    check('W-' + (ov ? 'overloaded' : 'normal') + ': 1-s, uneven and one bulk catch-up give identical arrival, position, run, rest, stress, pressure and report', a.out === b.out && a.out === c.out, a.out.slice(0, 160) + ' | ' + c.out.slice(0, 160));
  }
  const s1 = (() => { const Z = mkEnv().ZI, s = run0(Z); Z._wj('zi_charges', { heal: 999, scout: 2 }); s.carried = [{ name:'b', value:1, weight: cap(Z) * 1.2 }]; s.scroll = 400; s.lastCheckpoint = 250; Z.wanderWithdraw(s); return Z.WanderSim._msToArrive(s); })();
  check('W: overloaded withdrawal takes longer (×0.80 speed at 120%)', s1 === Math.ceil(150e6 / Math.round(3 * 0.8 * 1000)), s1); }

let pass = 0; for (const [r, n, x] of results) { if (r === 'PASS') pass++; log(r + '  ' + n + '  ' + (r === 'FAIL' ? x : '')); }
log(pass + '/' + results.length + ' batch-3A checks passed');
})();
