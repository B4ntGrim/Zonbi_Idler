// Batch 1 (Foundation) acceptance checks.
// Usage (run_script): const T = await readFile('tests/batch1.test.js'); await (new Function('readFile','log', T))(readFile, log);
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const mods = await Promise.all(ORDER.map(m => readFile('game/' + m + '.js'))); const src = mods.join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x || '']);
const mkEnv = (seedStore) => {
  const store = Object.assign({}, seedStore || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } };
  fw.window = fw; new Function('fw', 'with(fw){' + src + '}')(fw);
  return { ZI: fw.ZI, store };
};
const baseRun = (ZI) => Object.assign(ZI.defaultWanderRun(), { active:true, hp:100, maxHeals:3, healPct:25, healsUsed:0, moveSpeed:3, scroll:400 });

// 1. Same seed + same elapsed time → same results (offline bulk path, run twice in separate saves)
{
  const A = mkEnv({ zi_world_seed:'4242' }), B = mkEnv({ zi_world_seed:'4242' });
  const sa = baseRun(A.ZI), sb = baseRun(B.ZI), wa = { kills:0, xp:0, mats:0, dist:0, secs:0 }, wb = { kills:0, xp:0, mats:0, dist:0, secs:0 };
  A.ZI.WanderSim.advance(sa, 3600, wa, A.ZI.seededRng(7)); B.ZI.WanderSim.advance(sb, 3600, wb, B.ZI.seededRng(7));
  const strip = (s) => JSON.stringify({ hp:s.hp, kills:s.kills, xp:s.xp, mats:s.mats, carried:s.carried, heals:s.healsUsed });
  check('1: same seed + elapsed time → identical offline results', strip(sa) === strip(sb) && JSON.stringify(wa) === JSON.stringify(wb) && sa.kills > 0, 'kills=' + sa.kills);
  check('1: same seed → identical XP granted', A.store.zi_stat_xp === B.store.zi_stat_xp);
  const C = mkEnv({ zi_world_seed:'4242' }), sc = baseRun(C.ZI), wc = { kills:0, xp:0, mats:0, dist:0, secs:0 };
  C.ZI.WanderSim.advance(sc, 3600, wc, C.ZI.seededRng(8));
  check('1: a different seed gives a different run (RNG really injected)', strip(sc) !== strip(sa));
  check('1: one step = one roll + one resolve (live-screen entry point)', typeof A.ZI.WanderSim.step === 'function' && !!A.ZI.WanderSim.step(baseRun(A.ZI), A.ZI.seededRng(1)).outcome);
}
// 2. Policy survives resetWanderRun, retreat and death
{
  const E = mkEnv(), ZI = E.ZI;
  ZI.setPolicy('criminal', true);
  ZI.resetWanderRun(); const p1 = ZI.getPolicy().id;
  ZI.syncWanderState({ hp:0, status:'downed' }); ZI.resetWanderRun(); const p2 = ZI.getPolicy().id;
  check('2: policy kept across reset, retreat and downed', p1 === 'criminal' && p2 === 'criminal');
  check('2: policy stored outside the run object', !!E.store.zi_wander_policy && !/criminal/.test(E.store.zi_wander_run || ''));
}
// 3. One XP path; scavenging once per kill
{
  const direct = mods.join('\n').split('\n').filter(l => /addStatXp\(/.test(l) && !/ZI\.addStatXp = function/.test(l) && !/^\s*ZI\.addStatXp\(profId/.test(l));
  const screens = (await Promise.all(['screens-v3.jsx','screens-v2.jsx','screens-v2b.jsx'].map(f => readFile(f)))).join('\n');
  check('3: no direct addStatXp calls outside the XP bus', !direct.length && !/addStatXp\(/.test(screens), direct.join(' | '));
  const E = mkEnv(), ZI = E.ZI;
  let r = null; for (let k = 1; k < 50 && (!r || r.outcome !== 'win'); k++) { const s = baseRun(ZI); r = ZI.WanderSim.step(s, ZI.seededRng(k)); }
  const sc = JSON.parse(E.store.zi_stat_xp || '{}').scavenging || 0;
  const want = Math.round(ZI.ACTION_XP.loot.base * ZI.ACTION_XP.loot.split.scavenging);
  check('3: one kill grants scavenging XP exactly once', r.outcome === 'win' && sc === want, 'scavenging=' + sc + ' expected ' + want);
}
// 4. Decay: at most one day on return, never below an earned floor
{
  const DAY = 86400000, now = Date.now();
  const mk = (floorXp) => mkEnv({ zi_stat_xp: JSON.stringify({ combat: 20000 }), zi_skill_decay: JSON.stringify({ combat: { lastActiveUtc: now - 30 * DAY, floorXp, floorProgress:{}, lastSettle: now - 10 * DAY } }) });
  const E = mk(0), xp = JSON.parse(E.store.zi_stat_xp).combat, L = E.ZI.statLevel('combat');
  const rate = E.ZI.DECAY.minRate + (E.ZI.DECAY.maxRate - E.ZI.DECAY.minRate) * (L - 1) / 49;
  // Oct 29 (Sam, Profession Rust Replacement): inactivity never removes XP. Was: one day of decay on return.
  check('4: a 10-day absence removes no XP (rust decay retired Oct 29)', xp === 20000, 'xp=' + xp + ' (old rule would give ' + Math.round(20000 * (1 - rate)) + ')');
  const F = mk(19990);
  check('4: decay never drops XP below the earned floor', JSON.parse(F.store.zi_stat_xp).combat >= 19990);
}
// 5. Floors are banked by qualifying events, not by reaching the level
{
  const E = mkEnv(), ZI = E.ZI;
  ZI.awardXp('combat', 200000);
  const st0 = ZI.skillDecayState('combat');
  check('5: reaching a high level alone banks no floor', (st0.floorXp || 0) === 0, 'floorXp=' + st0.floorXp + ' level=' + ZI.statLevel('combat'));
  for (let k = 0; k < ZI.DECAY.floorEvents; k++) ZI.emitAction('kill', 1);
  check('5: the required qualifying events bank the floor', (ZI.skillDecayState('combat').floorXp || 0) > 0, 'floorXp=' + ZI.skillDecayState('combat').floorXp);
}
// 6. Out of heals offline → retreat, rest, resume (never stalls)
{
  const E = mkEnv({ zi_world_seed:'9' }), ZI = E.ZI;
  const s = Object.assign(baseRun(ZI), { hp:5, maxHeals:0 }), w = { kills:0, xp:0, mats:0, dist:0, secs:0 };
  ZI.WanderSim.advance(s, 6 * 60 * 60, w, ZI.seededRng(3));
  check('6: no heals left → retreat (withdrawal or Downed Forced Retreat), rests and keeps patrolling', ((w.downedRetreats || 0) + (w.withdrawals || 0)) >= 1 && w.kills > 0 && s.hp > 0 && !s.paused && (ZI.WanderSim.advance(s, 3600, w, ZI.seededRng(4)), w.kills > 0), JSON.stringify({ retreats:w.retreats, kills:w.kills, hp:s.hp }));
}
// 7. Save version + migration
{
  const E = mkEnv({ zi_stat_xp: JSON.stringify({ combat: 50 }) });
  check('7: an old save without a version loads and is upgraded', E.store.zi_save_version === String(E.ZI.SAVE_FORMAT.current) && JSON.parse(E.store.zi_stat_xp).combat >= 50);
  check('7: the version is part of the slot snapshot (zi_* key)', 'zi_save_version' in E.ZI._snapshot());
  const F = mkEnv({ zi_save_version: String(E.ZI.SAVE_FORMAT.current) });
  check('7: a current save is left as it is', F.store.zi_save_version === String(F.ZI.SAVE_FORMAT.current) && F.ZI.migrateSave().length === 0);
}
let pass = 0; for (const [r, n, x] of results) { if (r === 'PASS') pass++; log(r + '  ' + n + '  ' + (r === 'FAIL' ? x : '')); }
log(pass + '/' + results.length + ' batch-1 checks passed');
})();
