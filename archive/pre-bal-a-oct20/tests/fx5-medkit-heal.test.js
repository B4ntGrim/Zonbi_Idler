// Batch FX5: medkit heal while resting (reference/fx5-medkit-heal-slice.md; playtest PF2).
// Defect: the rest step rebuilt HP from restStartHp + elapsed, so a heal used while resting was overwritten on the next
// step (charge or item already spent). Fix: a heal above the rest curve restarts the curve from the healed HP.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const S = 1000, M = 60000, H = 3600000, T0 = 1790500000000;
const mkEnv = () => {
  const store = { zi_world_seed:'12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify({ gx:0, gy:0, name:'Home', biome:'suburbia', difficulty:1 }) };
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw); return fw.ZI;
};
const rig = (o) => { o = o || {}; const Z = mkEnv(); const c = { t: T0 }; Z.installClock(() => c.t); Z.WanderEngine.rng = Z.seededRng(7); Z.WanderEngine._lead = () => true; Z.wanderMounted = false;
  Z._wj('zi_charges', { heal: o.charges == null ? 3 : o.charges, scout: 0 });
  if (o.stress != null) Z._wj(Z.STRESS_KEY, { value: o.stress });
  const run = Object.assign(Z.defaultWanderRun(), { active:true, hp:o.hp || 30, moveSpeed:3, scroll:400, scrollUm:400e6, lastCheckpoint:250, checkpoints:[250], lastTickAt:c.t,
    resting: o.resting !== false, restAt: o.restAt || 'checkpoint', restStartHp: o.hp || 30, restElapsedMs: 0 });
  Z.saveWanderRun(run);
  const rest = []; const rs = Z.WanderSim._restStep; Z.WanderSim._restStep = function (st, l, a, e) { const u = rs.call(this, st, l, a, e); rest.push({ hp: st.hp, resting: st.resting }); return u; }; // probe: HP after every rest step
  const tick = (dt, live) => { c.t += dt; return live ? Z.WanderEngine.liveStep(c.t) : Z.WanderEngine.tick(c.t); };
  return { Z, c, tick, rest, run: () => Z.getWanderRun() }; };
const heal = (R) => R.Z.wanderAct(s => R.Z.wanderHeal(s, R.Z.seededRng(1)));
const kit = (R, amt) => R.Z.wanderAct(s => { s.hp = Math.min(100, s.hp + amt); });   // the screen's equipped-consumable path (useConsumable)

// 1 Heal button while resting at the checkpoint: the heal is kept and rest keeps rising from it
{ const R = rig({ stress: 80 }); const h = heal(R); /* PF1 (authorized by Sam, Oct 16): resume gate stress < 70 — fixtures 60→80, 51→71 keep "still resting on stress" */ const hp0 = R.run().hp; R.tick(S); const a = R.run().hp; R.tick(M); const b = R.run().hp;
  check('1: Heal while resting at the checkpoint keeps the heal (' + hp0 + ' → ' + a.toFixed(2) + ' → ' + b.toFixed(2) + ')', h.ok && hp0 === 30 + h.healed && a >= hp0 && b > a); }
// 2 Equipped Field Medkit (+60) while resting: kept
{ const R = rig({ hp: 20, stress: 80 }); kit(R, 60); R.tick(S); const a = R.run().hp; R.tick(10 * M); const b = R.run().hp;
  check('2: equipped Field Medkit while resting keeps +60 (' + a.toFixed(2) + ', then ' + b.toFixed(2) + ')', a >= 80 && b >= a); }
// 3 Heal while resting at Base (Forced Retreat rest): kept
{ const R = rig({ restAt: 'base', stress: 80 }); const h = heal(R); R.tick(S); check('3: Heal while resting at Base keeps the heal', R.run().hp >= 30 + h.healed); }
// 4 Heal past the 80% gate while stress ≥ 70: HP stays at the healed value; rest ends only when stress < 70; resumes with the healed HP
{ const R = rig({ hp: 50, stress: 71 }); kit(R, 40); let n = 0; while (!R.rest.some(x => !x.resting) && n < 400) { R.tick(M); n++; }
  const k4 = R.rest.findIndex(x => !x.resting), first = R.rest.slice(0, k4 + 1), lo = Math.min(...first.map(x => x.hp)), end = R.rest[k4];
  check('4: healed to 90 with stress 71: HP never below 90 during rest; rest ends with HP 90 once stress < 70 (' + n + ' min)', lo >= 90 - 1e-9 && end && end.hp >= 90 - 1e-9 && n > 1, lo); }
// 5 Heal past 80% with stress < 70: resumes at once with the healed HP
{ const R = rig({ hp: 50, stress: 10 }); kit(R, 40); R.tick(S); const s = R.run();
  check('5: healed above 80% with stress 10: resumes on the next step at HP ' + s.hp, !s.resting && s.hp >= 90 - 1e-9); }
// 6 No heal: the rest curve is exactly the pre-FX5 curve (restStartHp + rate × elapsed, capped at 80%)
{ const R = rig({ hp: 30, stress: 80 }); const T = R.Z.WANDER_REST_TABLE, rate = T.maxHp * T.restHpPerMinutePct / 100 / 60000; let ok = true, at = 0;
  for (let i = 0; i < 30; i++) { R.tick(M); at += M; const exp = Math.min(80, 30 + rate * at); if (Math.abs(R.run().hp - exp) > 1e-9 || R.run().restStartHp !== 30) ok = false; }
  check('6: without a heal, rest HP and restStartHp are unchanged from before FX5', ok); }
// 7 Offline: heal, then 12 h away in one return: HP never below the healed value during rest; rest ends at the gate
{ const R = rig({ hp: 25, stress: 55 }); heal(R); const healed = R.run().hp; R.tick(12 * H);
  const k7 = R.rest.findIndex(x => !x.resting), lo = Math.min(...R.rest.slice(0, k7 + 1).map(x => x.hp)), end = R.rest[k7];
  check('7: offline 12 h after a heal while resting: HP ≥ the healed value (' + healed + ') throughout rest; rest ended at HP ' + (end && Math.round(end.hp)), lo >= healed - 1e-9 && !!end && end.hp >= 80 - 1e-9, lo); }
// 8 Watched (liveStep): heal kept and HP never falls during rest
{ const R = rig({ hp: 30, stress: 70 }); heal(R); let prev = R.run().hp, mono = true; for (let i = 0; i < 120; i++) { R.tick(S, true); const v = R.run().hp; if (v < prev - 1e-9) mono = false; prev = v; }
  check('8: watched play: after a heal while resting, HP never falls', mono && prev > 30); }
// 9 Two heals in one rest: both kept
{ const R = rig({ hp: 10, stress: 70 }); const a = heal(R); R.tick(5 * M); const mid = R.run().hp; const b = heal(R); const after = R.run().hp; R.tick(S);
  check('9: two heals during one rest are both kept', R.run().hp >= after && after === mid + b.healed && mid >= 10 + a.healed); }
// 10 Heal amounts unchanged (shared First Aid rule)
{ const R = rig({ stress: 60 }); const L = R.Z.effectiveLevel('firstAid'); const exp = Math.round(R.Z.WANDER_REST_TABLE.maxHp * R.Z.STAT_FORMULAS.firstAidHealPercent(L) / 100); const h = heal(R);
  check('10: Heal amount is the unchanged First Aid rule (' + h.healed + ')', h.healed === exp); }

return results;
})();
