// ART-02 (Sam, Oct 31): phone width fix, one global width fit
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

const core = base;
const scr = screens;
check('ART-02: ZI.SCENE_WIDTH_SHARE is 0.65, defined once in game/core.js', /ZI\.SCENE_WIDTH_SHARE = 0\.65;/.test(core) && (core.match(/ZI\.SCENE_WIDTH_SHARE =/g) || []).length === 1);
check('ART-02: the per-sprite width clamp is gone from screens-v3.jsx', !/sceneWidth \* 0\.5/.test(scr) && !/if \(w > maxW\)/.test(scr));
check('ART-02: one global widthFit is computed and feeds every tier height (commanders and minions too)', /const widthFit = \(\(\) =>/.test(scr) && /rawZombieHeightForTier\(tier\) \* widthFit/.test(scr));
check('ART-02: the width fit reads the tunable share, not a literal', /window\.ZI\.SCENE_WIDTH_SHARE/.test(scr) || /window\.ZI && window\.ZI\.SCENE_WIDTH_SHARE/.test(scr));

return results;
})();
