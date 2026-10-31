// PROF-01 (Sam, Oct 30 rules; built Oct 31): profession catch-up
// Authored Oct 31 with Sam's decisions. Loader copied from tests/proposals-oct29.test.js.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const base = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const prog = await readFile('game/progression.js'), live = await readFile('game/progression-live.js');
const screens = await readFile('screens-v3.jsx'), html = await readFile('Zombie Idler v2.html');
const results = [], check = (n, ok, d) => results.push([ok ? 'PASS' : 'FAIL', n, d === undefined ? '' : String(d)]);
const H = 3600000, DAY = 24 * H, T0 = 1793200000000;
const mkEnv = (store, now) => {
  store = store || {}; const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const clock = { now: now || T0 };
  class D extends Date { constructor(...a) { if (a.length) super(...a); else super(clock.now); } static now() { return clock.now; } }
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date: D, Math, JSON, Proxy, Object, Array,
    setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){}, search:'' } };
  fw.window = fw;
  new Function('fw', 'with(fw){' + base + '\n' + prog + '\n' + live + '}')(fw);
  fw.ZI._installedClock = () => clock.now; fw.ZI.wanderMounted = false;
  return { ZI: fw.ZI, store, clock };
};

{ const E = mkEnv({ zi_world_seed:'1', zi_stat_xp: JSON.stringify({ endurance: 5000 }), zi_skill_decay: JSON.stringify({ endurance: { lastActiveUtc: T0 - 2 * DAY, floorXp: 0, floorProgress: {} } }) });
  const Z = E.ZI;
  check('PROF-01 P3: level-1 XP base is 148 on the live curve', Z._profLevel1Xp('endurance') === 148, Z._profLevel1Xp('endurance'));
  check('PROF-01 P2: no allowance below the 2-day threshold', Z.catchUpAllowanceFor('endurance', 1.9) === 0);
  check('PROF-01 P4/P5: 2 days away gives 10 XP (148 × 50% × 2/14)', Z.catchUpAllowanceFor('endurance', 2) === 10, Z.catchUpAllowanceFor('endurance', 2));
  check('PROF-01 P5: 14 days and longer cap at 74 XP', Z.catchUpAllowanceFor('endurance', 14) === 74 && Z.catchUpAllowanceFor('endurance', 30) === 74);
  const x0 = Z.getStatXp().endurance; Z.awardXp('endurance', 100);
  check('PROF-01 P2: a weekend gap now earns a bonus (the sim had 0.00% at 3 days)', Z.getStatXp().endurance - x0 > 100, Z.getStatXp().endurance - x0); }
{ const E = mkEnv({ zi_world_seed:'1', zi_stat_xp: JSON.stringify({ endurance: 5000 }), zi_skill_decay: JSON.stringify({ endurance: { lastActiveUtc: T0 - DAY, floorXp: 0, floorProgress: {} } }) });
  const Z = E.ZI; const x0 = Z.getStatXp().endurance; Z.awardXp('endurance', 100);
  check('PROF-01: playing every day earns no catch-up (1 day idle is under the grace)', Z.getStatXp().endurance === x0 + 100, Z.getStatXp().endurance - x0); }
{ const E = mkEnv({ zi_world_seed:'1', zi_stat_xp: JSON.stringify({ endurance: 5000 }), zi_skill_decay: JSON.stringify({ endurance: { lastActiveUtc: T0 - 30 * DAY, floorXp: 0, floorProgress: {} } }) });
  const Z = E.ZI; const x0 = Z.getStatXp().endurance; let prev = x0; const got = [];
  for (let i = 0; i < 80; i++) { Z.awardXp('endurance', 100); const now = Z.getStatXp().endurance; got.push(now - prev - 100); prev = now; }
  check('PROF-01: the first award gets the full +15%', got[0] === 15, got.slice(0, 4).join(','));
  // The carry (fractional bonus kept between awards) can turn a 0 into a 1 later, so test the fade itself, not strict monotonicity.
  check('PROF-01: the rate fades as the allowance is spent (first award is the largest; early awards outpace later ones)', got[0] === 15 && got.slice(1).every(b => b <= got[0]) && got.slice(0, 10).reduce((a, b) => a + b, 0) > 2 * got.slice(10, 20).reduce((a, b) => a + b, 0), got.slice(0, 12).join(','));
  check('PROF-01: one absence pays exactly its 74 XP allowance, then nothing', got.reduce((a, b) => a + b, 0) === 74 && Z.getCatchUp().tracks.endurance.allowance === 0, got.reduce((a, b) => a + b, 0));
  check('PROF-01: earned XP is never reduced', prev >= x0 + 80 * 100); }
{ const E = mkEnv({ zi_world_seed:'1', zi_stat_xp: JSON.stringify({ endurance: 5000 }), zi_skill_decay: JSON.stringify({ endurance: { lastActiveUtc: T0 - 30 * DAY, floorXp: 0, floorProgress: {} } }) });
  const Z = E.ZI; Z.awardXp('endurance', 1); for (let i = 0; i < 10; i++) Z.awardXp('endurance', 100);
  const mid = Z.getCatchUp().tracks.endurance.allowance;
  E.clock.now = T0 + 14 * DAY;
  const before = Z.getStatXp().endurance; Z.awardXp('endurance', 100);
  check('PROF-01 P1/refill: a new absence replaces unused allowance (full +15% again)', mid > 0 && Z.getStatXp().endurance - before === 115, mid + ' / ' + (Z.getStatXp().endurance - before)); }
{ const E = mkEnv({ zi_world_seed:'1', zi_stat_xp: JSON.stringify({ combat: 9e6 }), zi_skill_decay: JSON.stringify({ combat: { lastActiveUtc: T0 - 60 * DAY, floorXp: 0, floorProgress: {} } }) });
  const Z = E.ZI; Z.awardXp('combat', 100);
  check('PROF-01: no allowance at level 50', Z.statLevel('combat') === 50 && Z.getStatXp().combat === 9e6 + 100, Z.getStatXp().combat); }

return results;
})();
