// TIER-01 (Sam, Oct 31): tier escalation divisor 1.5 -> 3.0
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

const TIERS = ['F','E','D','C','B','A','S','BOSS'];
{ const E = mkEnv({ zi_world_seed:'1' }); const Z = E.ZI;
  check('TIER-01: ZI.TIER_LAP_DIVISOR is 3.0', Z.TIER_LAP_DIVISOR === 3.0, Z.TIER_LAP_DIVISOR);
  const first = {};
  for (let s = 0; s <= 2600; s++) { for (const t of Z.wanderDrawableTiers({ scroll: s, pressure: 0 })) if (!(t in first)) first[t] = s; }
  check('TIER-01: each tier unlocks every 3 laps (300 m): F at 0 m … BOSS at 2100 m', TIERS.every((t, r) => first[t] === 300 * r), JSON.stringify(first));
  const days = TIERS.map(t => (first[t] / 1.4 / 1440).toFixed(2)).join(' / ');
  check('TIER-01: unlock game days at 1.4 m/s and 24 real minutes per game day match the contract', days === '0.00 / 0.15 / 0.30 / 0.45 / 0.60 / 0.74 / 0.89 / 1.04', days);
  const BOSS = new Set(Z.BESTIARY.filter(z => z.tier === 'BOSS').map(z => z.name));
  const rngFor = seed => { let x = seed >>> 0; return () => (x = (Math.imul(x, 1103515245) + 12345) >>> 0) / 4294967296; };
  const bossDraws = lap => { const r = rngFor(7); let n = 0; for (let i = 0; i < 400; i++) { const z = Z._bgZombie(lap, r); if (z && BOSS.has(z.name)) n++; } return n; };
  check('TIER-01: the spawner cannot draw BOSS at lap 20', bossDraws(20) === 0, bossDraws(20));
  check('TIER-01: the spawner can draw BOSS at lap 21', bossDraws(21) > 0, bossDraws(21));
  const srcs = await Promise.all(['game/wandering.js', 'game/world.js', 'screens-v3.jsx'].map(readFile));
  check('TIER-01 D3: no tier reader keeps a private 1.5 divisor', srcs.every(s => !/lap \/ 1\.5/.test(s)));
  check('TIER-01 D6: the camp horde tier keeps its own 1.5', /floor\(t \/ 1\.5\)/.test(await readFile('game/camp.js')));
  check('TIER-01 D4: the Push On boost term is unchanged', /tierBoost \* 1\.5 : 0/.test(await readFile('game/wandering.js'))); }
return results;
})();
