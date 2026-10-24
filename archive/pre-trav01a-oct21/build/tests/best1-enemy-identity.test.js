// BEST1 — Wandering enemy identity (approved by Sam, Oct 17: Option A). Regression suite for the BEST1 repair in game/wandering.js.
// Runs like the other suites: const T = await readFile('tests/best1-enemy-identity.test.js'); await (new Function('readFile','log', T))(readFile, log);
// Codex-dependent checks are CONDITIONAL on ZI.WANDER_SIM_TABLE.codexFromWandering:
//   false → Option A (identity + armor; Codex unlocks from Wandering stay off; the approved setting)  ·  true → Option B (existing Codex unlock runs; needs separate approval).
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const T0 = 1790500000000;
// Isolated sandbox: an in-memory store only. No real localStorage, no real save, no network.
const mkEnv = (store0) => {
  const store = Object.assign({ zi_materials: JSON.stringify({ metal:200 }), zi_world_seed:'12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify({ gx:0, gy:0, name:'Home', biome:'suburbia', difficulty:1 }), zi_charges: JSON.stringify({ heal:5, scout:0 }) }, store0 || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  let s = 99; const M = Object.create(Math); M.random = () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  class D extends Date { constructor(...a) { if (a.length) super(...a); else super(T0); } static now() { return T0; } }
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date: D, Math: M, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document:{ hidden:true, visibilityState:'hidden', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  fw.ZI = { _installedClock: () => T0 };
  new Function('fw', 'with(fw){' + src + '}')(fw); fw.ZI.wanderMounted = false;
  return { ZI: fw.ZI, store };
};
const RK = { F:0, E:1, D:2, C:3, B:4, A:5, S:6, BOSS:7 };
const lapFor = (rank) => (rank + 1) * 1.5 - 1e-9;           // a lap whose pool is exactly tiers 0..rank
const forcePick = (Z, id) => { const rec = Z.BESTIARY.find(b => b.id === id), rank = RK[rec.tier], pool = Z.BESTIARY.filter(b => (RK[b.tier] ?? 0) <= rank), i = pool.indexOf(rec);
  return Z._bgZombie(lapFor(rank), () => (i + 0.5) / pool.length); }; // an rng that lands on that record
const codexMode = (Z) => Z.WANDER_SIM_TABLE.codexFromWandering === false ? 'A' : Z.WANDER_SIM_TABLE.codexFromWandering === true ? 'B' : 'unset';
const { ZI: Z, store } = mkEnv();

// BEST1-01 — ids unique
{ const ids = Z.BESTIARY.map(b => b.id); check('BEST1-01: all 45 bestiary definitions have unique integer ids', ids.length === 45 && new Set(ids).size === 45 && ids.every(Number.isInteger), ids.length); }
// BEST1-02 / 03 — seeded picks carry the selected record's id and tier; the pick itself is unchanged (same pool, one draw)
{ let ok2 = true, ok3 = true, okPick = true, n = 0;
  for (let rank = 0; rank <= 7; rank++) { const r1 = Z.seededRng(500 + rank), r2 = Z.seededRng(500 + rank), pool = Z.BESTIARY.filter(b => (RK[b.tier] ?? 0) <= rank);
    for (let k = 0; k < 200; k++, n++) { const z = Z._bgZombie(lapFor(rank), r1), exp = pool[Math.floor(r2() * pool.length)];
      if (z.name !== exp.name || z.hp !== exp.hp) okPick = false; if (z.bestiaryId !== exp.id) ok2 = false; if (z.tier !== exp.tier) ok3 = false; } }
  check('BEST1-PICK: enemy selection is unchanged (same pool, same single rng draw) — ' + n + ' seeded picks', okPick);
  check('BEST1-02: Wandering encounters carry the selected bestiary id', ok2);
  check('BEST1-03: encounter tier equals the selected definition\'s tier', ok3); }
// BEST1-04 / 06 — existing armor reaches enemyStatBlock and resolveAttack
{ let ok4 = true; Z.BESTIARY.forEach(b => { const eb = Z.STAT_FORMULAS.enemyStatBlock(forcePick(Z, b.id)); if (eb.armor !== (b.armor || 0)) ok4 = false; });
  check('BEST1-04: enemyStatBlock armor equals the bestiary armor for all 45 records', ok4);
  const atk = { name:'Survivor', accuracy:100, damageMin:10, damageMax:10, damageBonus:0, crit:0, critBonus:0 };
  const hit = (armor) => { const def = { hp:100, evasion:0, armor }; Z.STAT_FORMULAS.resolveAttack(Object.assign({}, atk), def, () => 0.01); return 100 - def.hp; };
  const armored = Z.BESTIARY.filter(b => b.armor > 0), okA = armored.every(b => { const eb = Z.STAT_FORMULAS.enemyStatBlock(forcePick(Z, b.id)); return hit(eb.armor) === Math.max(1, 10 - b.armor); });
  check('BEST1-06: the ' + armored.length + ' armored records reduce a 10-damage hit by their defined armor (MIN_CHIP 1 holds)', armored.length === 19 && okA, armored.length); }
// BEST1-05 — tier 0–1 unchanged: identical fights with and without the identity fields
{ const lows = Z.BESTIARY.filter(b => RK[b.tier] <= 1); let same = true;
  lows.forEach(b => { const z = forcePick(Z, b.id), bare = { name: z.name, hp: z.hp, atk: z.atk, xp: z.xp };
    const sb = () => Object.assign(Z.STAT_FORMULAS.survivorStatBlock({ displayHP:100, weaponDamage:16 }), { hp:100, hpMax:100 });
    const a = Z.simulateCombat(sb(), Z.STAT_FORMULAS.enemyStatBlock(z), 'idle', Z.seededRng(b.id)), c = Z.simulateCombat(sb(), Z.STAT_FORMULAS.enemyStatBlock(bare), 'idle', Z.seededRng(b.id));
    if (JSON.stringify([a.outcome, a.rounds, a.hpLeft, a.dmgDealt]) !== JSON.stringify([c.outcome, c.rounds, c.hpLeft, c.dmgDealt])) same = false; });
  check('BEST1-05: tier 0–1 (all armor 0) fights are identical with or without the carried fields', lows.length === 7 && same, lows.length); }
// BEST1-07 / 08 — duplicate display names stay distinguishable; the screen's lookup resolves by id
{ const pairs = [[20, 38], [22, 39]]; let ok7 = true, ok8 = true;
  const screenLookup = (r, roster) => roster.find(x => x.bestiaryId === r.bestiaryId) || roster.find(x => x.name === r.enemy) || roster[0]; // mirrors screens-v3.jsx ~1681
  const roster = Z.BESTIARY.map(b => ({ name: b.name, bestiaryId: b.id, tier: b.tier, armor: b.armor }));
  pairs.forEach(([lo, hi]) => { const zl = forcePick(Z, lo), zh = forcePick(Z, hi);
    if (!(zl.name === zh.name && zl.bestiaryId === lo && zh.bestiaryId === hi && zl.tier !== zh.tier)) ok7 = false;
    const ev = Z.WanderSim.resolveEncounter(Object.assign(Z.defaultWanderRun(), { active:true, hp:100 }), { kind:'zombie', z: zh }, Z.seededRng(1));
    const u = screenLookup(ev, roster); if (!(ev.bestiaryId === hi && u.bestiaryId === hi && u.tier === 'S' && u.armor === Z.BESTIARY.find(b => b.id === hi).armor)) ok8 = false; });
  check('BEST1-07: Trapper Zed (20/38) and Battle Cry General (22/39) stay distinguishable by id and tier', ok7);
  check('BEST1-08 (unit): the fight event resolves to the S-tier record by id in the screen lookup (browser check still required)', ok8); }
// BEST1-09 / 10 — speed and traits stay out; escape odds unchanged
{ let ok9 = true, ok10 = true;
  Z.BESTIARY.forEach(b => { const z = forcePick(Z, b.id); if ('spd' in z || 'traits' in z || 'base' in z) ok9 = false;
    const bare = { name: z.name, hp: z.hp, atk: z.atk, xp: z.xp }, F = Z.STAT_FORMULAS;
    if (F.escapeChance(1, 1, 100, z) !== F.escapeChance(1, 1, 100, bare)) ok10 = false; });
  check('BEST1-09: encounter objects carry no spd, traits or base', ok9);
  check('BEST1-10: escape chance is identical for all 45 records with and without the carried fields', ok10); }
// BEST1-11 / 12 — Codex boundary (CONDITIONAL)
{ const E = mkEnv(), Y = E.ZI, mode = codexMode(Y), st = Object.assign(Y.defaultWanderRun(), { active:true, hp:100 });
  const xpBefore = JSON.stringify(Y.getStatXp ? Y.getStatXp() : {});
  Y.WanderSim.resolveEncounter(st, { kind:'zombie', z: forcePick(Y, 38) }, Y.seededRng(2)); const after1 = Y.getDiscovered(), xp1 = (Y.getStatXp() || {}).discovery || 0;
  Y.WanderSim.resolveEncounter(Object.assign(st, { hp:100 }), { kind:'zombie', z: forcePick(Y, 38) }, Y.seededRng(3)); const xp2 = (Y.getStatXp() || {}).discovery || 0;
  if (mode === 'A') { check('BEST1-11 [Option A]: Wandering encounters do not unlock Codex entries', after1.size === 0, after1.size);
    check('BEST1-12 [Option A]: no Discovery XP from Wandering Codex unlocks', xp1 === 0 && xp2 === 0, xp1 + '/' + xp2); }
  else if (mode === 'B') { check('BEST1-11 [Option B]: the existing unlock records the correct id (38, not 20)', after1.has(38) && !after1.has(20), [...after1].join(','));
    check('BEST1-12 [Option B]: Discovery XP is awarded once per entry (second encounter adds none)', xp1 > 0 && xp2 === xp1, xp1 + '/' + xp2); }
  else check('BEST1-11/12: Codex boundary flag (WANDER_SIM_TABLE.codexFromWandering) is set to true or false', false, 'unset'); }
// BEST1-13 / 14 — watched and offline use the same enemy data; nothing is saved mid-encounter
{ const run = (chunks) => { const E = mkEnv(), Y = E.ZI, c = { t: T0 }; Y.installClock(() => c.t); Y.WanderEngine.rng = Y.seededRng(7); Y.WanderEngine._lead = () => true;
    Y.saveWanderRun(Object.assign(Y.defaultWanderRun(), { active:true, hp:100, moveSpeed:3, scroll:900, scrollUm:900e6, lastCheckpoint:750, checkpoints:[750], lastTickAt: T0 }));
    const ids = []; let ev = []; for (const dt of chunks) { c.t += dt; ev = ev.concat(chunks.length > 1 ? Y.WanderEngine.liveStep(c.t) : Y.WanderEngine.tick(c.t)); }
    let g = 0; while ((Y.getWanderRun()._carryMs || 0) > 0 && g++ < 5000) { c.t += 1000; ev = ev.concat(Y.WanderEngine.tick(c.t)); }
    ev.filter(e => e && e.kind === 'zombie').forEach(e => ids.push(e.bestiaryId)); return { ids, saved: E.store.zi_wander_run }; };
  const off = run([3600000]), live = run(new Array(3600).fill(1000));
  check('BEST1-13: one offline catch-up and 3,600 watched 1-s steps produce the same enemy id sequence', off.ids.length > 0 && JSON.stringify(off.ids) === JSON.stringify(live.ids) && off.ids.every(x => x != null), off.ids.length + ' vs ' + live.ids.length);
  check('BEST1-14: the saved run holds no encounter object (encounters are transient; identity is not lost on reload)', !/"z":\{|"_rec"/.test(off.saved || ''), (off.saved || '').length); }
// BEST1-16 — isolation: only the in-memory sandbox store was written
{ check('BEST1-16: tests ran on an in-memory store (no real localStorage in scope)', typeof globalThis.localStorage === 'undefined' && Object.keys(store).length > 0); }
return results;
})();
