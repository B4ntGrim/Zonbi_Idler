// CL7: real modules and bootstrap, isolated synthetic saves; no real browser storage.
// Compare live one-second timer callbacks with a fresh page load after 1/8/24 hours.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = await readFile('bestiary-data.js') + '\n' + (await Promise.all(ORDER.filter(m => m !== 'bootstrap').map(m => readFile('game/' + m + '.js')))).join('\n');
const bootstrap = await readFile('game/bootstrap.js');
const results = [], check = (name, ok, detail) => results.push([ok ? 'PASS' : 'FAIL', name, detail || '']);
const T0 = 1790500000000, H = 3600000;
function load(saved, at, seed) {
  const store = { ...saved }, clock = { t:at }, timers = [], errors = [];
  const ls = { getItem:k => store[k] ?? null, setItem:(k,v) => { store[k] = String(v); }, removeItem:k => { delete store[k]; }, key:i => Object.keys(store)[i], get length(){ return Object.keys(store).length; } };
  let random = seed >>> 0;
  const M = Object.create(Math); M.random = () => { random = (Math.imul(random, 1664525) + 1013904223) >>> 0; return random / 4294967296; };
  class D extends Date { constructor(...args) { super(...(args.length ? args : [clock.t])); } static now(){ return clock.t; } }
  const fw = { localStorage:ls, sessionStorage:ls, Date:D, Math:M, JSON,
    console:{ log(){}, warn(){}, error(...args){ errors.push(args.join(' ')); } },
    setInterval(fn, ms){ timers.push({ fn, ms }); return timers.length; }, clearInterval(){}, setTimeout:()=>0, clearTimeout(){},
    document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } };
  fw.window = fw; fw.ZI = { _installedClock:() => clock.t };
  new Function('fw', 'with(fw){' + src + '}')(fw);
  const Z = fw.ZI; Z.WanderEngine._lead = () => true; Z.WanderEngine.rng = Z.seededRng(seed); Z.installRolls(seed);
  new Function('fw', 'with(fw){' + bootstrap + '}')(fw);
  return { Z, store, clock, timers, errors };
}
function fixture(kind) {
  const E = load({}, T0, 123), Z = E.Z;
  Z._wj('zi_world_seed', 12345);
  Z._wj('zi_trav_start', { gx:0, gy:0 }); Z._wj('zi_trav_pos', { gx:0, gy:0, biome:'suburbia', difficulty:1, name:'Home' });
  Z.gameTotalSeconds(); Z.heartbeatOfflineWindow(T0);
  if (kind === 'wandering' || kind === 'combined') {
    Z.saveWanderRun(Object.assign(Z.defaultWanderRun(), { active:true, hp:100, moveSpeed:3, lastTickAt:T0, _simNow:T0 }));
  }
  if (kind === 'schedule' || kind === 'combined') {
    Z.assignJob('s1', 'scavenge'); Z.assignJob('s2', 'guard');
  }
  if (kind === 'jobs' || kind === 'combined') {
    const recipe = Z.CRAFT_RECIPES.find(r => r.kind === 'rmat' || !r.kind);
    // Actual grants, queue promotion, construction and unfinished progress in separate lanes.
    Z.enqueueJob('craft', recipe.id, 1800, {}, 1);
    Z.enqueueJob('craft', recipe.id, 2*3600, {}, 2);
    Z.enqueueJob('craft', recipe.id, 25*3600, {}, 1);
    Z.enqueueJob('build', 'bunks', 1800, { toLevel:1 }, 1);
    Z.enqueueJob('build', 'farm', 25*3600, { toLevel:1 }, 1);
  }
  if (kind === 'routes' || kind === 'combined') {
    const route = Z.ROUTES[0];
    // Squad mode deliberately exercises the real route resolver without Solo preparation blocking deployment.
    const started = Z.startRouteRun(route, [Z.SQUAD_ROSTER[0].id], 'idle', 0, true);
    if (!started.ok) throw new Error(started.reason);
  }
  return E.store;
}
function snapshot(E, kind) {
  const Z = E.Z, out = { seconds:Z.gameTotalSeconds(), calendar:Z.getCalendar(), xp:Z.getStatXp() };
  if (kind === 'wandering' || kind === 'combined') {
    const s = { ...Z.getWanderRun() };
    // These report delivery/session fields do not change gameplay progress.
    delete s.awaySummary; delete s.retreatHold;
    out.run = s; out.stress = Z.getStressState(); out.loot = Z.getWanderLoot(); out.charges = Z.getBaseCharges(); out.broken = Z._rj('zi_broken', null);
  }
  if (kind === 'schedule' || kind === 'combined') out.schedule = Z.getSchedule();
  if (kind === 'jobs' || kind === 'combined') { out.jobs = Z._readJobsRaw(); out.camp = Z.getCampSave(); out.rmat = Z.getRmatHoldings(); }
  if (kind === 'routes' || kind === 'combined') {
    out.runs = Z._readRouteRuns(); out.last = Z.getLastRun(); out.visits = Z.getPoiVisits();
  }
  return out;
}
const normalize = value => {
  if (Array.isArray(value)) return value.map(normalize);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(k => [k, normalize(value[k])]));
  return typeof value === 'number' ? Math.round(value * 1e6) / 1e6 : value;
};
for (const kind of ['schedule','jobs','routes','wandering','combined']) {
  const saved = fixture(kind);
  for (const hours of [1,8,24]) {
    const online = load(saved, T0, 31), offline = load(saved, T0 + hours*H, 31);
    for (let sec = 1; sec <= hours*3600; sec++) {
      online.clock.t = T0 + sec*1000;
      online.timers.forEach(timer => { if ((sec*1000) % timer.ms === 0) timer.fn(); });
      // Routes also settle through their ordinary progress read while the Routes UI is open.
      if (kind === 'routes') online.Z.settleRouteRuns();
    }
    // The engine drains its bounded carry without advancing the comparison endpoint.
    offline.Z.WanderEngine.tick(offline.clock.t);
    let guard = 0;
    while ((offline.Z.getWanderRun()._carryMs || 0) > 0 && guard++ < 20000) offline.Z.WanderEngine.tick(offline.clock.t);
    const a = normalize(snapshot(online, kind)), b = normalize(snapshot(offline, kind));
    const differing = Object.keys(a).filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
    check(`${kind}: ${hours}h live/reloaded progress agrees`, differing.length === 0 && guard < 20000,
      JSON.stringify({ differing, online:a, offline:b }));
    check(`${kind}: ${hours}h no module errors`, !online.errors.length && !offline.errors.length, online.errors.concat(offline.errors).join('; '));
  }
}
// Exercise the real joint replay above the cap, rather than replacing subsystem grants.
{
  const saved = fixture('combined');
  const credited = load(saved, T0 + 24*H, 31), capped = load(saved, T0 + 30*H, 31);
  const a = normalize(snapshot(credited, 'combined')), b = normalize(snapshot(capped, 'combined'));
  check('combined: 30h away advances the calendar for all 30 hours', b.seconds - a.seconds === 6*H/1000*60);
  delete a.seconds; delete b.seconds; delete a.calendar; delete b.calendar;
  // Unfinished timers move over discarded time; completed rewards retain their actual event times.
  a.run.lastTickAt += 6*H; a.run._simNow += 6*H;
  a.schedule.assignments.forEach(assignment => { assignment.lastTick += 6*H; });
  a.jobs.jobs.forEach(job => { if (job.status === 'active') job.startedAt += 6*H; });
  Object.values(a.runs).forEach(run => { run.startedAt += 6*H; });
  const differing = Object.keys(a).filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
  check('combined: 30h away grants exactly 24h of actual gameplay progress', !differing.length, differing.join(', '));
  check('combined: above-cap reload reports no module errors', !credited.errors.length && !capped.errors.length);
}
return results;
})();
