// Proposals applied Oct 29 (Sam: "implement the proposed ideas as safely as possible"):
// P1 rust retired + catch-up XP (off until the ramp is approved) · P2 consumable-only healing · codex dev tab
// verify-report fixes: monotonic clock (F2), status 24 h cap (F3), no phantom import (F5), damaged pointers (F7),
// save backup copy and index repair (F8).
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

// ── P1: no XP loss, no rust penalty ──
{ const E = mkEnv({ zi_world_seed:'1', zi_stat_xp: JSON.stringify({ combat: 40000, stealth: 9000 }), zi_skill_decay: JSON.stringify({ combat: { lastActiveUtc: T0 - 90 * DAY, floorXp: 0, floorProgress: {} } }),
    zi_decay_clock: JSON.stringify({ lastSettledUtc: T0 - 30 * DAY, lastSeenUtc: T0 - 30 * DAY }) });
  const Z = E.ZI; Z.settleSkillDecay(T0); for (let h = 1; h <= 72; h++) Z.decayHousekeeping(T0 + h * H);
  const x = Z.getStatXp();
  check('P1: 90 idle days and 3 days of open-session settles remove no profession XP', x.combat === 40000 && x.stealth === 9000, JSON.stringify(x));
  check('P1: effective level has no rust penalty after 90 idle days', Z.effectiveLevel('combat') === Z.statLevel('combat') && Z.skillRust('combat').eff === 1, Z.statLevel('combat') + ' / ' + Z.effectiveLevel('combat'));
  Z.applyInjury('test', false);
  check('P1: injury still lowers Combat effectiveness (capped)', Z.effectiveLevel('combat') < Z.statLevel('combat') && Z.effectiveLevel('combat') >= Math.floor(Z.statLevel('combat') * 0.8), Z.effectiveLevel('combat'));
  check('P1: the old decay records are kept (rollback-safe)', !!E.store.zi_skill_decay && !!E.store.zi_decay_clock); }
// ── P1: catch-up XP is off by default and has no effect ──
{ const E = mkEnv({ zi_world_seed:'1', zi_stat_xp: JSON.stringify({ endurance: 5000 }), zi_skill_decay: JSON.stringify({ endurance: { lastActiveUtc: T0 - 60 * DAY, floorXp: 0, floorProgress: {} } }) });
  const Z = E.ZI; Z.awardXp('endurance', 100);
  check('P1: catch-up is disabled until Sam approves the ramp (no bonus, no new save key)', !Z.CATCHUP.enabled && Z.CATCHUP.graceDays === null && Z.CATCHUP.rampDays === null && Z.getStatXp().endurance === 5100 && !E.store.zi_prof_catchup_v1); }
// ── P1: catch-up caps, with a test-only config ──
{ const E = mkEnv({ zi_world_seed:'1', zi_stat_xp: JSON.stringify({ endurance: 5000, combat: 5000 }),
    zi_skill_decay: JSON.stringify({ endurance: { lastActiveUtc: T0 - 60 * DAY, floorXp: 0, floorProgress: {} }, combat: { lastActiveUtc: T0, floorXp: 0, floorProgress: {} } }) });
  const Z = E.ZI; Object.assign(Z.CATCHUP, { enabled: true, graceDays: 2, rampDays: 5 });
  const next = Z._profXpToNext('endurance'), cap = Math.floor(next * 0.25);
  const before = Z.getStatXp().endurance; let maxRatio = 0, steps = 0;
  for (let i = 0; i < 400; i++) { const x0 = Z.getStatXp().endurance; Z.awardXp('endurance', 40); const got = Z.getStatXp().endurance - x0; maxRatio = Math.max(maxRatio, (got - 40) / 40); steps++; }
  const extra = Z.getStatXp().endurance - before - 40 * steps;
  check('P1 (test config): bonus never above +15% of an award', maxRatio <= 0.15 + 1e-9 && maxRatio > 0, maxRatio);
  check('P1 (test config): total bonus from one allowance never above 25% of XP-to-next (snapshotted)', extra === cap && cap > 0, extra + ' / ' + cap);
  check('P1 (test config): allowance ends at exactly 0, never negative', Z.getCatchUp().tracks.endurance.allowance === 0);
  const c0 = Z.getStatXp().combat; Z.awardXp('combat', 40);
  check('P1 (test config): a recently used track gets no bonus and its allowance is independent', Z.getStatXp().combat === c0 + 40);
  const t0 = Z.getStatXp().endurance; Z.awardXp('endurance', 3);
  check('P1 (test config): tiny awards round the bonus down (cannot exceed the cap by repetition)', Z.getStatXp().endurance - t0 === 3);
  const Y = mkEnv({ zi_world_seed:'1', zi_stat_xp: JSON.stringify({ combat: 9e6 }), zi_skill_decay: JSON.stringify({ combat: { lastActiveUtc: T0 - 60 * DAY, floorXp: 0, floorProgress: {} } }) }).ZI;
  Object.assign(Y.CATCHUP, { enabled: true, graceDays: 2, rampDays: 5 }); Y.awardXp('combat', 100);
  check('P1 (test config): no allowance at level 50', Y.statLevel('combat') === 50 && Y.getStatXp().combat === 9e6 + 100);
  Z.awardXp('endurance', 0); Z.awardXp('endurance', -5); Z.awardXp('endurance', NaN);
  check('P1: zero, negative and invalid amounts grant nothing', Z.getStatXp().endurance === t0 + 3); }

// ── P2: consumable-only healing ──
{ const E = mkEnv({ zi_world_seed:'1', zi_charges: JSON.stringify({ heal: 2, scout: 2 }) }); const Z = E.ZI;
  Z.awardXp('command', 5e5);
  check('P2: shipped rule has no free base heal and no Command heal charge', Z.ACTIVE_TABLE.charges.baseHeal === 0 && Z.ACTIVE_TABLE.charges.commandPerkHeal === 0 && Z.baseChargeMax().heal === 0, Z.effectiveLevel('command'));
  check('P2: an older save\'s stored free heal charges are dropped, not turned into Medkits; scout charges kept', Z.getBaseCharges().heal === 0 && Z.getBaseCharges().scout === 2 && Z.chargeTotals().heal === 0 && Z.getCarried().every(e => e.id !== 'medkit'));
  const st = { hp: 30 }; const r = Z.wanderHeal(st, Z.seededRng(1));
  check('P2: with no Medkit, Heal fails and HP is unchanged (even at Command 40+)', !r.ok && st.hp === 30, JSON.stringify(r));
  Z.refillBaseCharges();
  check('P2: rest/refill never creates heal charges', Z.getBaseCharges().heal === 0 && Z.getBaseCharges().scout === 2); }
{ const E = mkEnv({ zi_world_seed:'1' }); const Z = E.ZI;
  Z.saveCarried([{ id:'medkit', qty:1, charges:2 }]); const st = { hp: 20 };
  const a = Z.wanderHeal(st, () => 0.99), hp1 = st.hp, b = Z.wanderHeal(st, () => 0.99), c = Z.wanderHeal(st, () => 0.99);
  check('P2: one Medkit gives exactly two heals, then it is used up', a.ok && b.ok && !c.ok && hp1 > 20 && !Z.getCarried().some(e => e.id === 'medkit'), [a.ok, b.ok, c.ok, hp1, st.hp].join('/'));
  const pct = Z.STAT_FORMULAS.firstAidHealPercent(Z.effectiveLevel('firstAid'));
  check('P2: First Aid sets the heal amount, not the number of charges', hp1 - 20 === Math.round(Z.maxHp() * pct / 100) && Z.ACTIVE_TABLE.charges.kit.medkit.charges === 2, hp1 - 20);
  check('P2: the Fort-bound Med Kit is not a heal charge', !Z.isKit('fort_medkit')); }

// ── Codex developer tab (Addendum 6) and tutorial wording ──
check('Codex: the reveal-all "In development" tab only exists with ?dev', /ZI\.isDevView && ZI\.isDevView\(\) \? \[\{ id:'dev'/.test(screens) && /const devMode = catFilter === 'dev' && !!\(ZI\.isDevView && ZI\.isDevView\(\)\)/.test(screens));
check('Tutorial no longer says unused skills go rusty', !/go rusty/.test(screens) && /never lose progress/.test(screens));

// ── F2: a clock moved back never gives negative calendar values ──
{ const E = mkEnv({ zi_world_seed:'1' }, T0); const Z = E.ZI; Z.getCalendar(); E.clock.now = T0 - 2 * H;
  const c = Z.getCalendar(), g = Z.gameTotalSeconds();
  check('F2: PC clock set back 2 h → calendar holds (Year ≥ 1, Day ≥ 1, valid time)', c.year >= 1 && c.day >= 1 && c.hh >= 0 && c.mm >= 0 && g >= 0, JSON.stringify(c));
  E.clock.now = T0 + H;
  check('F2: the calendar runs again once real time passes the saved moment', Z.gameTotalSeconds() > g); }
// ── F3: offline status uses at most the 24 h credited window ──
{ const lastSeen = T0 - 7 * DAY; const E = mkEnv({ zi_world_seed:'1', zi_offline_last_seen: String(lastSeen),
    zi_status_v1: JSON.stringify({ nutrition: 70, rest: 70, lastGameSec: 50400, lastAway: null }), zi_game_clock: JSON.stringify({ base: 50400, day: 1, at: lastSeen, rate: 60 }) }, T0);
  const away = JSON.parse(E.store.zi_status_v1).lastAway; // the load-time catch-up already ran
  check('F3: 7 days away → status catch-up counts 24 real hours (1,440 game hours), not 10,080', away && away.gameHours === 1440, away && away.gameHours); }
// ── F5: no phantom "Imported progress" on a first visit ──
{ const E = mkEnv({}); const Z = E.ZI; Z.getStatXp(); Z.getJobs && Z.getJobs(); Z.getCalendar();
  const slots = Z.listSlots('solo');
  check('F5: a brand-new browser shows three empty files', slots.every(s => s.empty) && !E.store.zisave_index, JSON.stringify(slots.map(s => s.label || 'empty')));
  const P = mkEnv({ zi_stat_xp: JSON.stringify({ combat: 500 }) }).ZI;
  check('F5: real progress with no files is still kept as Imported progress', P.listSlots('solo')[0].label === 'Imported progress'); }
// ── F7: damaged active pointer ──
{ const Z = mkEnv({ zisave_active: '[1,2]' }).ZI;
  check('F7: a damaged active-file pointer reads as no file (no "Slot undefined")', Z.getActiveSlot() === null && !Z.saveToActiveSlot().ok); }
check('F7: a damaged Traversal position is treated as missing', /typeof p !== 'object' \|\| Array\.isArray\(p\) \|\| !\(Number\.isFinite\(p\.gx\) \|\| Number\.isFinite\(p\.row\)\)/.test(screens));
// ── F8: backup copy, fallback load, index repair, damaged-file message ──
{ const store = { zi_world_seed:'1' }; let E = mkEnv(store, T0); E.ZI.startNewInSlot('solo', 1);
  E = mkEnv(store, T0 + 1000); E.ZI.awardXp('scavenging', 300); E.ZI.saveToActiveSlot(); E.ZI.awardXp('scavenging', 200); E.ZI.saveToActiveSlot();
  check('F8: saving keeps the previous good copy of the file', JSON.parse(JSON.parse(store.zisave_prev_solo_1).zi_stat_xp).scavenging === 300);
  E.ZI.startNewInSlot('solo', 2); E = mkEnv(store, T0 + 2000);
  store.zisave_data_solo_1 = store.zisave_data_solo_1.slice(0, 40);
  const ok = E.ZI.loadSlot('solo', 1); E = mkEnv(store, T0 + 3000);
  check('F8: a damaged file loads from its backup copy (the last good write: 500 XP, autosaved when leaving it)', ok && E.ZI.getActiveSlot().slot === 1 && E.ZI.getStatXp().scavenging === 500 && !!JSON.parse(store.zisave_index).solo[1].restoredFromBackupAt, E.ZI.getStatXp().scavenging);
  const idx = JSON.parse(store.zisave_index); idx.solo = { 1: null }; store.zisave_index = JSON.stringify(idx);
  const cards = E.ZI.listSlots('solo');
  check('F8: files missing from a damaged index are listed again from their data', !cards[0].empty && !cards[1].empty && /recovered/.test(cards[1].label), JSON.stringify(cards.map(c => c.empty ? 'empty' : c.label)));
  E.ZI.deleteSlot('solo', 1);
  check('F8: deleting a file also deletes its backup copy', !store.zisave_data_solo_1 && !store.zisave_prev_solo_1); }
check('F8: Continue on a damaged file with no backup shows a message', /if \(!ZI\.loadSlot\(mode, slot\)\) setNotice\(\{ ok:false, text:`File \$\{slot\} is damaged/.test(html));
return results;
})();
