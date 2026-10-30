// SIM-02 — the seeded stream must not depend on character state (Oct 30 review).
// Every BALANCE-03 and CLOCK-01 comparison run assumes that one seed replays one sequence of
// events. That only holds if each simulated step draws the SAME NUMBER of values from the rng
// whatever the survivor looks like. A draw taken behind a condition that reads character state
// — `if (bonus > 0 && rng() < bonus)` — silently breaks it: two survivors on the same seed
// fall out of step, and runs stop being comparable.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const base = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const extra = ['game/progression.js', 'game/progression-live.js', 'game/character.js', 'game/operations.js'];
const tail = (await Promise.all(extra.map(readFile))).join('\n');
const wandering = await readFile('game/wandering.js');
const results = [], check = (n, ok, d) => results.push([ok ? 'PASS' : 'FAIL', n, d === undefined ? '' : String(d)]);
const T0 = 1793200000000;
const mkEnv = (store, now) => {
  store = store || {}; const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const clock = { now: now || T0 };
  class D extends Date { constructor(...a) { if (a.length) super(...a); else super(clock.now); } static now() { return clock.now; } }
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date: D, Math, JSON, Proxy, Object, Array,
    setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){}, search:'' } };
  fw.window = fw; new Function('fw', 'with(fw){' + base + '\n' + tail + '}')(fw);
  fw.ZI._installedClock = () => clock.now; fw.ZI.wanderMounted = false; return { ZI: fw.ZI, store, clock };
};
// A survivor at a given level in one profession, stepped with a counting rng.
const drawsFor = (profession, xp, steps) => {
  const store = { zi_world_seed:'1' };
  mkEnv(store).ZI.startNewInSlot('solo', 1, { gender:'male', profession:'vanguard' });
  const Z = mkEnv(store, T0 + 1000).ZI;
  if (xp > 0 && Z.addStatXp) Z.addStatXp(profession, xp);
  let n = 0, a = 12345;
  const rng = () => { n++; a = (a * 1103515245 + 12345) & 0x7fffffff; return (a % 100000) / 100000; };
  const counts = [];
  for (let i = 0; i < steps; i++) { const before = n; Z.wanderPolicyStep(rng, { simNow: T0 + i * 1000 }); counts.push(n - before); }
  return { total: n, counts, level: Z.statLevel ? Z.statLevel(profession) : 1 };
};

// ── The exact defect this guards ──
// The profession-bonus work added `if (bonusSalvage > 0 && rng() < bonusSalvage)`. The draw was
// taken only once Scavenging was high enough for the bonus to exist, so two survivors on one seed
// drew a different NUMBER of values and fell out of step. It now always draws.
// The guard holds before the bonus exists too, so this suite can land ahead of that work.
{ const present = /bonusSalvage/.test(wandering);
  const gated = /bonusSalvage\s*>\s*0\s*&&\s*rng\(\)/.test(wandering);
  const unconditional = /if \(rng\(\) < bonusSalvage\)/.test(wandering);
  check('The bonus-salvage roll always draws, whatever the Scavenging level',
    !present || (unconditional && !gated), present ? ('unconditional=' + unconditional + ' gated=' + gated) : 'not present yet'); }

// ── No NEW state-gated draws ──
// One `&& rng()` predates this work: the escape roll in WanderSim.resolveEncounter, whose draw
// already sits inside a state-dependent policyEvades branch. Making it unconditional would shift
// every historical balance baseline without removing the underlying conditionality, so it stays.
// Any ADDITIONAL conditional draw is a regression and fails here.
{ const sites = wandering.match(/&&\s*rng\(\)/g) || [];
  const escapeOnly = /chance > 0 && rng\(\) \* 100 < chance/.test(wandering);
  check('wandering.js has exactly one conditional draw, the known pre-existing escape roll',
    sites.length === 1 && escapeOnly, sites.length + ' site(s)'); }

// ── Why there is no blanket draw-count invariant ──
// Profession levels legitimately change encounter weights and success chances, so outcomes - and
// therefore which branches run - diverge by design. What must NOT vary is a draw taken or skipped
// purely on a level threshold. These runs simply prove the harness still steps without throwing.
{ const STEPS = 25;
  const novice = drawsFor('scavenging', 0, STEPS), expert = drawsFor('scavenging', 500000, STEPS);
  check('Both survivors step cleanly and draw from the stream', novice.total > 0 && expert.total > 0, novice.total + ' / ' + expert.total);
  check('The two survivors really are at different Scavenging levels', expert.level > novice.level, novice.level + ' vs ' + expert.level);
  check('Each step draws at least one value', novice.counts.every(c => c >= 1));
  check('No step runs away', Math.max.apply(null, novice.counts) <= 12, 'max ' + Math.max.apply(null, novice.counts)); }

return results;
})();
