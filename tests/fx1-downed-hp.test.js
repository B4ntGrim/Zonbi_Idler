// Batch FX1: HP floor and Downed — the 11 acceptance checks (reference/fx1-hp-floor-slice.md §7; CURRENT_BATCH.md).
// Q1 HP never below 1 · U5 reaching 1 HP from damage inside a run Downs (heal → revive → Forced Retreat) · U6 full damage logged.
// U25/U26: the Fort guard attack and Traversal loot never Down (check 12, source-level).
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const mkEnv = (opt) => {
  opt = opt || {};
  const store = Object.assign({ zi_world_seed:'12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify({ gx:0, gy:0, name:'Home', biome:'suburbia', difficulty:1 }) }, opt.store || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw); const ZI = fw.ZI; ZI.wanderMounted = false;
  ZI._wj('zi_charges', { heal: opt.heals == null ? 0 : opt.heals, scout: 0 });
  if (opt.policy) ZI._wj('zi_wander_policy', { id: opt.policy, changedAt: 0 });
  return { ZI, store };
};
const run0 = (ZI, o) => Object.assign(ZI.defaultWanderRun(), { active:true, hp:100, moveSpeed:3, scroll:400, scrollUm:400e6, lastCheckpoint:250, checkpoints:[250] }, o || {});
const BRUTE = { name:'Test Brute', hp:400, atk:60, xp:10 };
const healAmt = (ZI) => Math.round(ZI.WANDER_REST_TABLE.maxHp * ZI.STAT_FORMULAS.firstAidHealPercent(ZI.effectiveLevel('firstAid')) / 100);
const heals = (ZI) => ZI._rj('zi_charges', {}).heal;
const adv = (ZI, st, sec, rng, step, away, ev) => { ev = ev || []; let t = 0, k = 0; while (t < sec - 1e-9) { const sz = Array.isArray(step) ? step[k++ % step.length] : (step || sec); const d = Math.min(sz, sec - t); ZI.WanderSim.advance(st, d, away || ZI.WanderSim.emptySummary(), rng, ev); t += d; } let g = 0; while (st._carryMs > 0 && g++ < 10000) ZI.WanderSim.advance(st, 0, away || ZI.WanderSim.emptySummary(), rng, ev); return ev; };

// 1 — lethal fight, no heals, no revive, 15+ seeds
{ let ok = 0, bad = []; for (let seed = 1; seed <= 16; seed++) { const { ZI } = mkEnv({ policy:'heinous' }); const st = run0(ZI, { hp:20 });
    const r = ZI.WanderSim.resolveEncounter(st, { kind:'zombie', z: BRUTE }, ZI.seededRng(seed));
    if (r.outcome === 'forcedRetreat' && r.fr && r.fr.cause === 'downed' && st.hp === 1 && st.restStartHp === 1 && st.restAt === 'base' && st.resting) ok++; else bad.push(seed + ':' + r.outcome + '/' + st.hp + '/' + st.restStartHp); }
  check('1: lethal fight with no heal or revive → Forced Retreat (downed), HP 1, restStartHp 1, Base rest — 16 seeds', ok === 16, bad.slice(0, 3).join(' ')); }
// 2 — lethal damage with a heal charge → healed (HP 1 + heal); with a revive consumable → revived
{ const { ZI } = mkEnv({ policy:'heinous', heals:1 }); const st = run0(ZI, { hp:20 }); const amt = healAmt(ZI);
  const r = ZI.WanderSim.resolveEncounter(st, { kind:'zombie', z: BRUTE }, ZI.seededRng(2));
  check('2: lethal fight with a heal charge → healed, HP = 1 + heal amount, charge spent', r.outcome === 'healed' && st.hp === Math.min(100, 1 + amt) && heals(ZI) === 0 && !st.resting, [r.outcome, st.hp, 1 + amt, heals(ZI)].join('/'));
  const E2 = mkEnv({ policy:'heinous' }), Z2 = E2.ZI, rev = (Z2.GEAR_ITEMS || []).find(g => g.effect && g.effect.revive);
  const lo = Z2.getLoadout(); lo[rev.slot] = rev.id; Z2.saveLoadout(lo); const st2 = run0(Z2, { hp:20 });
  const r2 = Z2.WanderSim.resolveEncounter(st2, { kind:'zombie', z: BRUTE }, Z2.seededRng(3));
  check('2: lethal fight with a revive consumable and no heals → revived, HP ≥ 1, consumable used', r2.outcome === 'revived' && st2.hp >= 1 && !Object.values(Z2.getLoadout()).includes(rev.id), [r2.outcome, st2.hp].join('/')); }
// 3 — a won fight that leaves exactly 1 HP Downs the survivor (U5)
{ const stub = (Z) => { Z.simulateCombat = () => ({ outcome:'win', rounds:2, dmgDealt:40, hpLeft:1, enemyXp:10, log:[{ by:'enemy', result:'hit', dealt:19 }] }); };
  const A = mkEnv({ policy:'heinous' }); stub(A.ZI); const sa = run0(A.ZI, { hp:20 }); const ra = A.ZI.WanderSim.resolveEncounter(sa, { kind:'zombie', z: BRUTE }, A.ZI.seededRng(4));
  const B = mkEnv({ policy:'heinous', heals:1 }); stub(B.ZI); const sb = run0(B.ZI, { hp:20 }); const rb = B.ZI.WanderSim.resolveEncounter(sb, { kind:'zombie', z: BRUTE }, B.ZI.seededRng(4));
  check('3: a fight won at exactly 1 HP Downs — Forced Retreat without heals; healed (1 + heal) with one', ra.outcome === 'forcedRetreat' && sa.hp === 1 && sa.restStartHp === 1 && rb.outcome === 'healed' && sb.hp === Math.min(100, 1 + healAmt(B.ZI)), [ra.outcome, sa.hp, rb.outcome, sb.hp].join('/')); }
// 4 — a policy hit that brings HP to 1 Downs (heal charge spent, or Forced Retreat)
{ const setup = (h) => { const E = mkEnv({ heals:h }), Z = E.ZI; Z.wanderPolicyStep = () => ({ dmg:99, text:'Test hit', tone:'enemy' }); Z.WanderSim.step = () => ({ kind:'zombie', outcome:'escaped' }); Z.createPrompt = () => null; return Z; };
  const Z = setup(0), st = run0(Z), away = Z.WanderSim.emptySummary(), ev = adv(Z, st, 31, Z.seededRng(5), 31, away);
  const d = ev.find(e => e.kind === 'policy' && e.downed);
  const Z2 = setup(1), st2 = run0(Z2), ev2 = adv(Z2, st2, 31, Z2.seededRng(5), 31); const d2 = ev2.find(e => e.kind === 'policy' && e.downed);
  check('4: policy hit to 1 HP → Forced Retreat (downed) with no heals, recorded on the return report', d && d.downed === 'forcedRetreat' && d.fr && d.fr.cause === 'downed' && st.resting && st.restAt === 'base' && st.restStartHp === 1 && (away.downedRetreats || 0) === 1, d && [d.downed, st.restStartHp, away.downedRetreats].join('/'));
  check('4: policy hit to 1 HP with a heal charge → healed, HP = 1 + heal, charge spent, run continues', d2 && d2.downed === 'healed' && st2.hp === Math.min(100, 1 + healAmt(Z2)) && heals(Z2) === 0 && !st2.resting, d2 && [d2.downed, st2.hp].join('/')); }
// 5 — a failed venture that brings HP to 1 Downs; the ambush is skipped when the survivor is sent home
{ const setup = (h) => { const E = mkEnv({ heals:h }), Z = E.ZI; Z.WanderSim.step = () => ({ kind:'zombie', outcome:'escaped', enemy:'stub' }); return Z; };
  const fail = () => 0.999;
  const Z = setup(0), st = run0(Z, { hp:5 }); Z.createPrompt(st, Z.seededRng(6)); st.prompt.riskTier = 3; const ev = Z.resolvePrompt(st, 'venture', Z.WanderSim.emptySummary(), fail);
  const Z2 = setup(1), st2 = run0(Z2, { hp:5 }); Z2.createPrompt(st2, Z2.seededRng(6)); st2.prompt.riskTier = 3; const ev2 = Z2.resolvePrompt(st2, 'venture', null, fail);
  check('5: failed venture to 1 HP → Forced Retreat (downed), no ambush afterwards; on-screen choice (no away summary) also works', ev.outcome === 'failed' && ev.downed === 'forcedRetreat' && ev.fr && ev.fr.cause === 'downed' && !ev.ambush && st.resting && st.restStartHp === 1 && !st.prompt, [ev.outcome, ev.downed, !!ev.ambush, st.restStartHp].join('/'));
  check('5: failed venture to 1 HP with a heal charge → healed (1 + heal); the ambush still happens', ev2.downed === 'healed' && st2.hp === Math.min(100, 1 + healAmt(Z2)) && !!ev2.ambush, [ev2.downed, st2.hp, !!ev2.ambush].join('/')); }
// 6 — rest from 1 HP resumes at the exact boundary (80% HP at ⌈79 / rate⌉ ms) and only with stress < 70 /* PF1 (authorized by Sam, Oct 16): resume gate stress < 70 */
{ const { ZI } = mkEnv(); const need = Math.ceil(79 * 12000); // 5 HP/min = 1 HP per 12,000 ms
  ZI.setStress(10); const st = run0(ZI, { hp:1, resting:true, restAt:'base', restStartHp:1, restElapsedMs:0 });
  const e1 = adv(ZI, st, (need - 1) / 1000, ZI.seededRng(7), (need - 1) / 1000); const before = st.resting;
  const e2 = adv(ZI, st, 0.001, ZI.seededRng(7), 0.001); const res = e2.find(e => e.kind === 'resumed');
  const E2 = mkEnv(), Z2 = E2.ZI; Z2.setStress(80); const s2 = run0(Z2, { hp:1, resting:true, restAt:'base', restStartHp:1, restElapsedMs:0 }); adv(Z2, s2, need / 1000 + 1, Z2.seededRng(7), need / 1000 + 1);
  check('6: rest from 1 HP resumes at exactly ' + need + ' ms with HP 80; still resting 1 ms earlier; stress 80 no longer holds the rest (HP-only gate)', before === true && !e1.some(e => e.kind === 'resumed') && res && st.hp === 80 && s2.resting === false, [before, res && res.hp, s2.resting].join('/')); } /* BAL-A (authorized, Oct 19): the resume gate is HP only (A5) */
// 7 — chunk equivalence through a Downed retreat and Base rest
{ const sig = (step) => { const { ZI } = mkEnv({ policy:'heinous' }); const st = run0(ZI); const away = ZI.WanderSim.emptySummary(); const ev = adv(ZI, st, 4 * 3600, ZI.seededRng(8), step, away);
    return { s: JSON.stringify({ k: ev.map(e => e.kind + ':' + (e.outcome || e.downed || '')), hp: st.hp, rest: st.resting, kills: st.kills, xp: st.xp, u: ZI.getStressState().u, um: st.scrollUm, dr: away.downedRetreats }), ev, away }; };
  const a = sig(1), b = sig([1.3, 0.7, 2.9]), c = sig(null);
  const downs = a.ev.filter(e => e.outcome === 'forcedRetreat' || e.downed === 'forcedRetreat').length, resumed = a.ev.filter(e => e.kind === 'resumed').length;
  check('7: 1-s, uneven and bulk processing identical through Downed Forced Retreats and Base rest', a.s === b.s && b.s === c.s && downs >= 1 && resumed >= 1, [a.s === b.s, b.s === c.s, downs, resumed].join('/')); }
// 8 + 9 — invariant HP ≥ 1 over 24 h, four policies, several seeds; no HP loss while resting
{ let minHp = 1e9, restDrop = [], chunks = 0;
  for (const pol of ['ethical', 'immoral', 'criminal', 'heinous']) for (let seed = 1; seed <= 3; seed++) {
    const { ZI } = mkEnv({ policy: pol }); const st = run0(ZI); const away = ZI.WanderSim.emptySummary();
    for (let i = 0; i < 24 * 60; i++) { const wasRest = !!st.resting, hp0 = st.hp, ev = [];
      ZI.WanderSim.advance(st, 60, away, ZI.seededRng(seed * 100000 + i), ev); chunks++;
      minHp = Math.min(minHp, st.hp); ev.forEach(e => { if (typeof e.hp === 'number') minHp = Math.min(minHp, e.hp); });
      if (wasRest && st.resting && !ev.some(e => e.kind === 'resumed') && st.hp < hp0 - 1e-9) restDrop.push(pol + seed + '@' + i); } } // a chunk that resumed and was Downed again is not rest
  check('8: HP ≥ 1 at every chunk end and event over 24 h (4 policies × 3 seeds, 1-min chunks)', minHp >= 1, 'min ' + minHp + ' over ' + chunks + ' chunks');
  check('9: HP never falls while the survivor is in Base or checkpoint rest', restDrop.length === 0, restDrop.slice(0, 3).join(' ')); }
// 10 — the Downing hit's log shows the attack's full damage (U6)
{ const { ZI } = mkEnv({ policy:'heinous' }); const st = run0(ZI, { hp:20 }); const r = ZI.WanderSim.resolveEncounter(st, { kind:'zombie', z: BRUTE }, ZI.seededRng(10));
  const eh = (r.hits || []).filter(h => h.by === 'e' && h.d > 0), total = eh.reduce((a, h) => a + h.d, 0), last = eh[eh.length - 1];
  check('10: the log shows full attack damage (enemy hits total ≥ HP before the fight) while stored HP is 1', st.hp === 1 && total >= 20 && last && last.d > 1, [st.hp, total, last && last.d].join('/')); }
// 11 — old save resting from hp 0 / restStartHp 0 loads and finishes rest with no migration
{ const old = Object.assign({ active:true, hp:0, resting:true, restAt:'base', restStartHp:0, restElapsedMs:0, scroll:400, lastCheckpoint:250, checkpoints:[250] });
  const { ZI, store } = mkEnv({ store: { zi_wander_run: JSON.stringify(old) } }); ZI.setStress(10);
  const st = ZI.getWanderRun();
  const ev = adv(ZI, st, 960, ZI.seededRng(11), 960); const res = ev.find(e => e.kind === 'resumed');
  check('11: an old save resting from HP 0 / restStartHp 0 loads and resumes at 80 HP after 960 s (FX1 adds no save key or migration)', res && st.hp === 80 && !st.resting, [res && res.hp, st.resting].join('/')); }
// 12 — U25/U26: the Fort guard attack and Traversal loot never route into Downed
{ const { ZI } = mkEnv(); const fortSrc = String(ZI.fortAttack || ''), wanderSrc = String(ZI.WanderSim.resolveEncounter);
  check('12: U25 — the Fort guard attack floors HP at 1 and never calls the Downed path (Traversal loot lives in the screen file, unchanged)', fortSrc.includes('Math.max(1') && !/_downed|forcedRetreat/.test(fortSrc) && /_downed/.test(wanderSrc)); }

results.forEach(r => log(r.join('  ')));
return results;
})();
