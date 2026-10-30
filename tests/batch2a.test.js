// Batch 2A acceptance tests (A1–A6). Headless, isolated in-memory storage per environment.
// Usage (run_script): const T = await readFile('tests/batch2a.test.js'); await (new Function('readFile','log', T))(readFile, log);
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const best = await readFile('bestiary-data.js');
const gameSrc = (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x || '']);
const mkEnv = (seed) => {
  const store = Object.assign({ zi_materials: JSON.stringify({ metal:200, wood:200, cloth:200, electronics:200, fuel:200, medical:200 }) }, seed || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } };
  fw.window = fw;
  new Function('fw', 'with(fw){' + best + '\n' + gameSrc + '}')(fw);
  return { ZI: fw.ZI, store };
};
const runState = (t0, o) => JSON.stringify(Object.assign({ scroll:0, lastCheckpoint:0, checkpoints:[], active:true, hp:100, kills:0, xp:0, mats:0, healsUsed:0,
  moveSpeed:3, maxHeals:2, healPct:25, lastTickAt:t0, paused:false, carried:[] }, o || {}));
const sig = (E, events) => {
  const r = JSON.parse(E.store.zi_wander_run);
  return JSON.stringify({
    kills:r.kills, xp:r.xp, mats:r.mats, hp:Math.round(r.hp * 1e6) / 1e6, scroll:Math.round(r.scroll * 1e3) / 1e3, resting:!!r.resting,
    carried:(r.carried || []).map(c => c.name), banked: JSON.parse(E.store.zi_wander_loot || '[]').map(i => i.name),
    statXp: JSON.parse(E.store.zi_stat_xp || '{}'), checkpoints: r.checkpoints,
    events: events.map(e => [e.kind, e.outcome || '', e.enemy || e.text || e.mark || ''].join('|')),
  });
};
const pair = (seedN, secs, runOverrides, policy) => {
  const t0 = Date.now();
  // Both harnesses must share the same clock anchor too; otherwise a millisecond of test startup jitter can move a
  // simulated event across midnight and change its intentionally daily-rotating encounter modifier.
  const clock = JSON.stringify({ base:14 * 3600, day:1, at:t0, rate:60 });
  const mk = () => { const E = mkEnv({ zi_world_seed:'1', zi_game_clock:clock, zi_wander_run: runState(t0, runOverrides), zi_wander_policy: JSON.stringify(policy || { id:'ethical' }) }); E.ZI.WanderEngine.rng = E.ZI.seededRng(seedN); return E; };
  const L = mk(), O = mk(); const evL = [], evO = [], daily = { live:[], offline:[] };
  for (const [label, E] of [['live',L],['offline',O]]) {
    const original = E.ZI.worldDailyShift;
    E.ZI.worldDailyShift = function(cell, salt, amplitude, atMs) {
      const value = original.call(this, cell, salt, amplitude, atMs);
      if (salt === 3) daily[label].push({ atMs, day:this.worldDayIndex(atMs), value });
      return value;
    };
  }
  L.ZI.wanderMounted = true;
  for (let k = 1; k <= secs; k++) evL.push(...L.ZI.WanderEngine.liveStep(t0 + k * 1000));
  O.ZI.wanderMounted = false;
  evO.push(...O.ZI.WanderEngine.tick(t0 + secs * 1000));
  return { L, O, evL, evO, daily, sL: sig(L, evL), sO: sig(O, evO) };
};

// ── A1. Live = offline for the same seed and elapsed time ──
for (const [seedN, secs, over, pol, label] of [
  [42, 600, {}, null, 'seed 42, 10 min, ethical'],
  [7, 600, {}, { id:'criminal' }, 'seed 7, 10 min, criminal'],
  [99, 900, { hp:22, maxHeals:0 }, { id:'immoral' }, 'seed 99, 15 min, out of heals (retreat + timed rest)'],
]) {
  const p = pair(seedN, secs, over, pol);
  const kinds = p.evL.reduce((m, e) => (m[e.kind + (e.outcome ? ':' + e.outcome : '')] = (m[e.kind + (e.outcome ? ':' + e.outcome : '')] || 0) + 1, m), {});
  const live = JSON.parse(p.sL), offline = JSON.parse(p.sO), diff = Object.keys(live).filter(k => JSON.stringify(live[k]) !== JSON.stringify(offline[k])).map(k => ({ field:k, live:live[k], offline:offline[k] }));
  const dailyDiff = p.daily.live.map((x,i) => ({ live:x, offline:p.daily.offline[i] })).filter(x => !x.offline || JSON.stringify(x.live) !== JSON.stringify(x.offline));
  check('A1 ' + label + ': identical kills, XP by skill, loot, policy events, HP, retreats', p.sL === p.sO, JSON.stringify({ events:kinds, differences:diff, dailyDiff }));
  if (p.sL !== p.sO) { const a = JSON.parse(p.sL), b = JSON.parse(p.sO); for (const k in a) if (JSON.stringify(a[k]) !== JSON.stringify(b[k])) log('  diff ' + k + ': live ' + JSON.stringify(a[k]).slice(0, 160) + ' | offline ' + JSON.stringify(b[k]).slice(0, 160)); }
  else log('  ' + label + ': ' + JSON.stringify(kinds));
}

// ── A2. A live kill grants Combat and Scavenging XP once each ──
{
  const t0 = Date.now();
  const E = mkEnv({ zi_wander_run: runState(t0), zi_wander_policy: JSON.stringify({ id:'criminal' }) });
  E.ZI.WanderEngine.rng = E.ZI.seededRng(3); E.ZI.wanderMounted = true;
  let found = null;
  for (let k = 1; k <= 300 && !found; k++) {
    const before = JSON.parse(E.store.zi_stat_xp || '{}');
    const ev = E.ZI.WanderEngine.liveStep(t0 + k * 1000);
    const wins = ev.filter(e => e.kind === 'zombie' && e.outcome === 'win');
    if (wins.length === 1 && ev.length === 1) found = { before, after: JSON.parse(E.store.zi_stat_xp || '{}'), z: wins[0] };
  }
  const A = E.ZI.ACTION_XP;
  const d = (k) => (found.after[k] || 0) - (found.before[k] || 0);
  const expCombat = Math.round(A.kill.base * (found.z.xp || 10) / 10 * A.kill.split.combat), expScav = Math.round(A.loot.base * A.loot.split.scavenging);
  check('A2: live kill → Combat XP once', d('combat') === expCombat, 'got ' + d('combat') + ', expected ' + expCombat);
  check('A2: live kill → Scavenging XP once', d('scavenging') === expScav, 'got ' + d('scavenging') + ', expected ' + expScav);
}

// ── A3. No Math.random swap remains in the simulation path ──
{
  const sim = gameSrc;
  check('A3: no Math.random assignment in game/*.js', !/Math\.random\s*=[^=]/.test(sim));
  check('A3: _withRng removed', !/_withRng/.test(sim));
  const t0 = Date.now(); const E = mkEnv({ zi_wander_run: runState(t0) });
  // Allowed: ids for banked items (toRecyclerItem) and the one-time persisted world seed — they never affect results.
  let calls = 0; const realR = Math.random; Math.random = function() { const st = new Error().stack || ''; if (!/toRecyclerItem|worldSeed/.test(st.split('\n').slice(2, 4).join(' '))) calls++; return realR(); };
  try { E.ZI.WanderEngine.rng = E.ZI.seededRng(5); E.ZI.wanderMounted = true; for (let k = 1; k <= 120; k++) E.ZI.WanderEngine.liveStep(t0 + k * 1000); } finally { Math.random = realR; }
  check('A3: a seeded 2-min run makes no result-affecting Math.random call', calls === 0, 'calls=' + calls);
}

// ── A4. A session open 3 days applies 3 days of decay, not 1 ──
{
  const t0 = Date.now(), day = 86400000;
  const seed = () => ({ zi_stat_xp: JSON.stringify({ combat: 50000 }), zi_skill_decay: JSON.stringify({ combat: { lastActiveUtc: t0 - 30 * day, floorXp: 0, floorProgress: {} } }),
    zi_decay_clock: JSON.stringify({ lastSettledUtc: t0, lastSeenUtc: t0 }) });
  const open = mkEnv(seed());
  for (let h = 1; h <= 72; h++) { for (let m = 1; m <= 60; m += 15) open.ZI.decayHeartbeat(t0 + (h - 1) * 3600000 + m * 60000); open.ZI.decayHousekeeping(t0 + h * 3600000); }
  const lossOpen = 50000 - JSON.parse(open.store.zi_stat_xp).combat;
  const closed = mkEnv(seed()); closed.ZI._decayClockMem = null; closed.ZI.settleSkillDecay(t0 + 3 * day);
  const lossClosed = 50000 - JSON.parse(closed.store.zi_stat_xp).combat;
  const oneDay = mkEnv(seed()); oneDay.ZI.decayHeartbeat(t0 + day); oneDay.ZI.settleSkillDecay(t0 + day);
  const lossOne = 50000 - JSON.parse(oneDay.store.zi_stat_xp).combat;
  log('  decay loss: open 3 days ' + lossOpen + ' · closed 3 days ' + lossClosed + ' · open 1 day ' + lossOne);
  // Oct 29 (Sam, Profession Rust Replacement): settles still run on their clock but never remove XP.
  check('A4: open 3-day session removes no XP (rust decay retired Oct 29)', lossOpen === 0 && lossOne === 0, lossOpen + ' / ' + lossOne);
  check('A4: closed 3 days still capped at 1 day', Math.abs(lossClosed - lossOne) <= 1, lossClosed + ' vs ' + lossOne);
  check('A4: lastSettledUtc stored and advanced', JSON.parse(open.store.zi_decay_clock).lastSettledUtc === t0 + 72 * 3600000);
  // Settle on read: a level read after an hour of open time settles.
  const rd = mkEnv(seed()); rd.ZI._decayClockMem = { lastSettledUtc: Date.now() - 3600001, lastSeenUtc: Date.now() };
  rd.ZI.statLevel('combat');
  check('A4: reading a skill level settles once the hour has passed', JSON.parse(rd.store.zi_decay_clock).lastSettledUtc > Date.now() - 5000);
}

// ── A5. 10-minute offline catch-up: no rapid retreat-rest loops ──
{
  const report = [];
  for (const [label, over] of [['normal (2 heals)', {}], ['worst case (0 heals, 100 HP)', { maxHeals:0 }]]) {
    const t0 = Date.now();
    const E = mkEnv({ zi_wander_run: runState(t0, over), zi_wander_policy: JSON.stringify({ id:'criminal' }) });
    E.ZI.WanderEngine.rng = E.ZI.seededRng(11); E.ZI.wanderMounted = false;
    E.ZI.WanderEngine.tick(t0 + 600000);
    const a = JSON.parse(E.store.zi_wander_run).awaySummary;
    report.push(label + ': kills ' + a.kills + ', XP ' + a.xp + ', retreats ' + a.retreats + ', escapes ' + a.escapes + ', policy events ' + a.events);
    check('A5 ' + label + ': at most 1 retreat in 10 min', a.retreats <= 1, 'retreats=' + a.retreats);
  }
  report.forEach(r => log('  ' + r));
}

// ── A6. Unversioned save → v1 → current; new fields added only ──
{
  const t0 = Date.now() - 3600000;
  const E = mkEnv({ zi_wander_run: JSON.stringify({ scroll:120, active:true, hp:70 }), zi_skill_decay: JSON.stringify({ combat:{ lastActiveUtc:t0, floorXp:0, floorProgress:{}, lastSettle:t0 } }), zi_stat_xp: JSON.stringify({ combat:500 }) });
  const ZI = E.ZI, run = JSON.parse(E.store.zi_wander_run), clock = JSON.parse(E.store.zi_decay_clock || 'null');
  check('A6: unversioned save migrated to the current version (' + ZI.SAVE_FORMAT.current + ')', E.store.zi_save_version === String(ZI.SAVE_FORMAT.current) && ZI.SAVE_FORMAT.current >= 2); // later batches add migrations (3B: v5)
  check('A6: decay clock added (seeded from the per-skill stamp, then settled at load)', !!clock && clock.lastSettledUtc >= t0 && clock.lastSeenUtc >= t0);
  check('A6: rest fields added; existing run data kept', run.resting === false && run.scroll === 120 && run.hp === 70);
  check('A6: existing skill XP and per-skill stamps untouched', JSON.parse(E.store.zi_stat_xp).combat === 500 && JSON.parse(E.store.zi_skill_decay).combat.lastSettle === t0);
}

let pass = 0; for (const [r, n, x] of results) { if (r === 'PASS') pass++; log(r + '  ' + n + (r === 'FAIL' ? '  ' + x : '')); }
log(pass + '/' + results.length + ' batch-2A checks passed');
})();
