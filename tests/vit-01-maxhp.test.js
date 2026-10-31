// VIT-01 (Sam, Oct 31): max HP has no ceiling; Vitality runaway
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

{ const E = mkEnv({ zi_world_seed:'1' }); const Z = E.ZI;
  check('VIT-01: constants are 2 HP per point, gate 25, compounding 1.5%', Z.VIT01.perPoint === 2 && Z.VIT01.gate === 25 && Z.VIT01.compoundPct === 1.5, JSON.stringify(Z.VIT01));
  check('VIT-01 R2: +2 max HP per Vitality point below the gate', Z.vitalityHp(10, false) === 20 && Z.vitalityHp(24, true) === 48);
  check('VIT-01 R3: runaway stays shut when maxHp is not at its cap', Z.vitalityHp(40, false) === 80);
  const brute = p => { let t = 50; for (let j = 1; j <= p - 25; j++) t += 2 * Math.pow(1.015, j - 1); return t; };
  check('VIT-01 R4: closed form equals the point-by-point sum with 1.5% compounding', [26, 40, 100, 200].every(p => Math.abs(Z.vitalityHp(p, true) - brute(p)) < 1e-6));
  check('VIT-01: no ceiling — runaway runs past the old 300 HP stop', Z.vitalityHp(100, true) > 300 && Z.vitalityHp(200, true) > 1000, Z.vitalityHp(200, true).toFixed(1));
  const m0 = Z.maxHp(); Z.survivalAttributePoints = () => 40; const m1 = Z.maxHp(); delete Z.survivalAttributePoints;
  check('VIT-01: a stored Vitality value adds +2 per point to live max HP (maxHp not at cap here, so no runaway)', m1 - m0 === 80, m1 - m0);
  check('VIT-01: with no stored Vitality, live max HP is unchanged (runaway dormant)', m0 === Z.maxHp(), m0); }

return results;
})();
