// STAT-02 live wiring (game/progression-live.js): save migration, main level from skill XP, picks, stat layer,
// status timing, eating, Auto-Eat, nap at base, Make camp, offline floor and readers of existing systems.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const base = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const prog = await readFile('game/progression.js'), live = await readFile('game/progression-live.js');
const html = await readFile('Zombie Idler v2.html'), htmlT = await readFile('Zombie Idler v2 - TEST SAVE.html'), ui = await readFile('progression-ui.jsx');
const results = [], check = (n, ok, d) => results.push([ok ? 'PASS' : 'FAIL', n, d === undefined ? '' : String(d)]);
const T0 = 1793200000000, GAME_DAY_MS = 24 * 60000;
const mkEnv = (opt) => {
  opt = opt || {};
  const store = Object.assign({ zi_world_seed: '12345', zi_offline_last_seen: String(opt.lastSeen || T0) }, opt.store || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const clock = { now: opt.now || T0 };
  class D extends Date { constructor(...a) { if (a.length) super(...a); else super(clock.now); } static now() { return clock.now; } }
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date: D, Math, JSON, Proxy, Object, Array,
    setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } };
  fw.window = fw;
  const code = opt.noLive ? base + '\n' + prog : base + '\n' + prog + '\n' + live;
  new Function('fw', 'with(fw){' + code + '}')(fw);
  const ZI = fw.ZI; ZI._installedClock = () => clock.now;
  return { ZI, store, clock, L: ZI.PROG.LIVE, P: ZI.PROG };
};
const oldCum = L => { let t = 0; for (let l = 1; l < L; l++) t += 100 * l + 10 * l * l; return t; };

// Pages load the live wiring after bootstrap
for (const [n, h] of [['main', html], ['TEST SAVE', htmlT]]) {
  const b = h.indexOf('game/bootstrap.js'), p = h.indexOf('game/progression-live.js'), q = h.indexOf('game/progression.js');
  check(`${n} page loads progression.js before bootstrap and progression-live.js after it`, q > 0 && b > q && p > b);
}

// H1: an existing save keeps its level
{
  const xp = oldCum(20) + Math.floor((100 * 20 + 10 * 400) / 2);
  const { ZI, L, P } = mkEnv({ store: { zi_character_xp: String(xp) } });
  check('H1: old level 20 save is still level 20 on the new curve', ZI.getCharacterLevel() === 20, ZI.getCharacterLevel());
  const nx = ZI.getCharacterXp();
  check('H1: XP sits inside level 20 on the new curve', nx > P.xpForLevel(20) && nx < P.xpForLevel(21), nx);
  check('H1: picks already earned by levels 2–20 are granted (12)', L.getState().pending === 12, L.getState().pending);
  check('H1: migration runs once', L.migrateCurve() === null);
}
{
  const { ZI, store } = mkEnv({ store: { zi_character_xp: String(oldCum(50)), zi_stat_xp: JSON.stringify({ combat: 90000, endurance: 30000 }) } });
  check('H1: old level 50 save with lots of skill XP is still level 50', ZI.getCharacterLevel() === 50, ZI.getCharacterLevel());
  check('H1: save records the migration', JSON.parse(store.zi_prog_v1).migratedFrom.level === 50);
}

// Main level from skill XP (Oct 28)
{
  const { ZI, L, P } = mkEnv();
  check('fresh save: level 1, no picks waiting', ZI.getCharacterLevel() === 1 && L.getState().pending === 0);
  const before = ZI.getCharacterXp(); ZI.applyWanderingXp(50000);
  check('banked Wandering score no longer adds main XP directly (counted through skills)', ZI.getCharacterXp() === before, ZI.getCharacterXp());
  ZI.awardXp('combat', 50); ZI.awardXp('firstAid', 20);
  const want = Math.round(P.mainXpFromSkill(70));
  check('skill XP from any profession feeds the main level (a × S^b)', ZI.getCharacterXp() === want, ZI.getCharacterXp() + ' vs ' + want);
  const S10 = P.skillFromMainXp(P.xpForLevel(10)) - 70 + 1;
  ZI.awardXp('scavenging', Math.ceil(S10));
  check('enough skill XP reaches level 10 and grants 6 picks', ZI.getCharacterLevel() === 10 && L.getState().pending === 6, ZI.getCharacterLevel() + ' / ' + L.getState().pending);
  const lv = ZI.getCharacterLevel(), x = ZI.getStatXp(); x.combat = 0; ZI._wj(ZI.STAT_XP_KEY, x); L.syncSkill();
  check('skill decay never lowers the main level', ZI.getCharacterLevel() === lv, ZI.getCharacterLevel());
  const o1 = L.currentOffer(), o2 = L.currentOffer();
  check('offer has 3 distinct stats', o1.length === 3 && new Set(o1).size === 3, o1.join(','));
  check('offers never include Shield or Movement Speed', o1.indexOf('shield') < 0 && o1.indexOf('moveSpeed') < 0, o1.join(','));
  check('open offer is saved (no re-roll on re-read)', o1.join() === o2.join());
  check('picking a stat not on offer is refused', !L.choose(P.STAT_KEYS.find(k => o1.indexOf(k) < 0)).ok);
  const r = L.choose(o1[0]);
  check('choosing raises the rank and spends one pick', r.ok && L.rank(o1[0]) === 1 && L.getState().pending === 5);
  check('upgrade card shows values only', /→/.test(r.card) && !/rank|\/24|\/30/i.test(r.card), r.card);
}
{ // Existing save keeps its level and continues on the skill curve
  const { ZI, L, P } = mkEnv({ store: { zi_character_xp: String(oldCum(30)) } });
  const lv = ZI.getCharacterLevel(), xp0 = ZI.getCharacterXp();
  ZI.awardXp('combat', 200);
  check('existing save: skill XP moves the main level up from where it was', ZI.getCharacterLevel() >= lv && ZI.getCharacterXp() > xp0, xp0 + ' → ' + ZI.getCharacterXp());
}

// H4: stats add on top
{
  const plain = mkEnv({ noLive: true }), { ZI, L, P } = mkEnv(); const N = P.CONFIG.ranksToCap;
  const a = plain.ZI.STAT_FORMULAS.survivorStatBlock({ weaponDamage: 20, displayHP: 100 }), b = ZI.STAT_FORMULAS.survivorStatBlock({ weaponDamage: 20, displayHP: 100 });
  check('rank 0 + neutral status: survivor block unchanged', a.damageMin === b.damageMin && a.damageMax === b.damageMax && a.crit === b.crit && a.evasion === b.evasion && a.initiative === b.initiative && a.critBonus === b.critBonus && !b.armorPct, JSON.stringify([a, b].map(x => [x.damageMin, x.damageMax, x.crit, x.evasion, x.initiative, x.armorPct])));
  check('rank 0: max HP stays 100', ZI.maxHp() === plain.ZI.maxHp(), ZI.maxHp());
  check('cards show the real survivor value (Max HP 100 → 101)', L.cardText('maxHp', 0) === 'Max HP 100 → 101', L.cardText('maxHp', 0));
  check('sheet shows Evasion as a bonus on top', L.display('evasion') === '+0%', L.display('evasion'));
  const s = L.getState(); ['maxHp', 'damage', 'armor', 'evasion', 'critChance'].forEach(k => { s.ranks[k] = N; }); L.saveState(s);
  const c = ZI.STAT_FORMULAS.survivorStatBlock({ weaponDamage: 20, displayHP: 100 });
  check('Max HP cap adds +20 on top of 100', ZI.maxHp() === 120, ZI.maxHp());
  check('Damage cap multiplies weapon damage by 1.3', c.damageMax === Math.round(a.damageMax * 1.3), a.damageMax + ' → ' + c.damageMax);
  check('Armor cap gives 40% damage reduction', c.armorPct === 40, c.armorPct);
  check('Evasion and Crit Chance add points on top', c.evasion === a.evasion + 24 && c.crit === a.crit + 34, [c.evasion, c.crit].join(','));
  const atk = { accuracy: 500, damageMin: 20, damageMax: 20, crit: 0, critBonus: 0 }, def1 = { hp: 100, evasion: 0 }, def2 = { hp: 100, evasion: 0, armorPct: 40 };
  const r1 = ZI.STAT_FORMULAS.resolveAttack(Object.assign({}, atk), def1, () => 0.5), r2 = ZI.STAT_FORMULAS.resolveAttack(Object.assign({}, atk), def2, () => 0.5);
  check('percent Armor reduces damage taken', r2.dealt === Math.round(r1.dealt * 0.6), r1.dealt + ' → ' + r2.dealt);
}

// H5: timing, eating, Auto-Eat, nap, Make camp
{
  const { ZI, L, clock } = mkEnv();
  check('fresh survivor: Peckish and Tired (neutral)', L.labels().hunger === 'Peckish' && L.labels().rest === 'Tired', JSON.stringify(L.labels()));
  check('top bar Nutrition reads the meter', !ZI.getTopBarResources().Nutrition.pending && ZI.getNutrition().current === 70);
  clock.now += GAME_DAY_MS; L.settleStatus();
  check('one game day (24 real min) drops hunger one tier', L.labels().hunger === 'Hungry' && Math.round(ZI.getNutrition().current) === 45, ZI.getNutrition().current);
  check('tiredness builds slowly: one game day costs 1/6 of a tier', L.labels().rest === 'Tired' && Math.round(L.getStatus().rest) === 66, L.getStatus().rest);
  clock.now += 5 * GAME_DAY_MS; L.settleStatus();
  check('six game days (~2.4 real h) drop tiredness one tier', L.labels().rest === 'Fatigued' && Math.round(L.getStatus().rest) === 45, L.getStatus().rest);
  check('no Auto-Eat without the Shop unlock', !L.autoEatOwned() && L.labels().hunger === 'Starving');
  check('eating with no food is refused', !L.eat().ok);
  ZI.saveStash(['ration', 'ration', 'lucky_charm']);
  const n0 = L.getStatus().nutrition, e = L.eat();
  check('Eat uses a ration and adds one tier (25)', e.ok && e.item === 'ration' && ZI.getStash().filter(x => x === 'ration').length === 1 && Math.round(L.getStatus().nutrition - n0) === 25, JSON.stringify(e));
  check('loot boosters are not food', !L.isFood('lucky_charm'));
  const shop = ZI.SHOP_ITEMS.find(x => x.id === 'qol_autoeat');
  check('Shop sells Auto-Eat for 5 T1 RMAT (audit price)', !!shop && shop.grant.flag === 'autoEat' && shop.cost.T1 === 5 && shop.req.distance === 500, JSON.stringify(shop && shop.cost));
  check('nap works at base', L.canNap());
  const r0 = L.getStatus().rest, nap = L.nap();
  check('nap at base gives one tier of rest back', nap.ok && L.getStatus().rest > r0 + 24, r0 + ' → ' + L.getStatus().rest);
  ZI._wj('zi_trav_pos', { gx: 5, gy: 5 }); const zoneFn = ZI.getTravZone; ZI.getTravZone = () => ({ gx: 5, gy: 5 });
  check('nap is refused away from base or camp', !L.canNap() && !L.nap().ok);
  ZI.getTravZone = zoneFn;
  ZI.setProfileFlag('autoEat', true); clock.now += GAME_DAY_MS; L.settleStatus();
  check('with Auto-Eat the survivor eats on their own below Peckish', ZI.getStash().indexOf('ration') < 0 && L.getStatus().nutrition >= 25, L.getStatus().nutrition);
  const camp = ZI.spendCampUse();
  check('Make camp resets tiredness to Rested', camp.ok && L.labels().rest === 'Rested', JSON.stringify(L.labels()));
}

// Offline: never past the mild tier; survivor eats and sleeps
{
  const away = 20 * 3600e3;
  const pre = mkEnv(); const st = JSON.parse(pre.store.zi_status_v1); const clockSave = pre.store.zi_game_clock;
  const { L } = mkEnv({ now: T0 + away, lastSeen: T0, store: { zi_status_v1: JSON.stringify(st), zi_game_clock: clockSave } });
  const lbl = L.labels();
  check('offline with no food: hunger stops at Hungry (never Starving)', lbl.hunger === 'Hungry', lbl.hunger);
  check('offline: survivor slept at camp', lbl.rest === 'Rested' && /slept well/.test(L.getStatus().lastAway.text), L.getStatus().lastAway && L.getStatus().lastAway.text);
  const pre2 = mkEnv(); pre2.ZI.saveStash(['ration', 'ration', 'ration', 'ration']);
  const env2 = mkEnv({ now: T0 + away, lastSeen: T0, store: { zi_status_v1: pre2.store.zi_status_v1, zi_game_clock: pre2.store.zi_game_clock, zi_stash: pre2.store.zi_stash } });
  check('offline with food: eats until Well Fed (max 3 meals) and says so', /Ate 2 times|Ate twice/.test(env2.L.getStatus().lastAway.text) && env2.ZI.getStash().length === 2 && env2.L.labels().hunger === 'Well Fed', env2.L.getStatus().lastAway.text);
}

// H2: readers of systems that already run
{
  const { ZI, L } = mkEnv();
  ZI.applyInjury('test');
  check('Wounds reads the injury system', L.labels().wounds === 'Wounded', L.labels().wounds);
  ZI._wj(ZI.BROKEN_KEY, { on: true, rests: 0 });
  check('Morale reads Broken (Shaken)', L.labels().morale === 'Shaken', L.labels().morale);
  check('Sickness has no live source yet (Healthy)', L.labels().sickness === 'Healthy');
  const m = L.mods();
  check('stacked bad states feed hidden modifiers', (m.maxHp || 0) < 0 && (m.evasion || 0) < 0, JSON.stringify(m));
}

// UI source checks
check('UI hides Shield and Movement Speed on the sheet', /P\.visibleStats\(\)\.map/.test(ui));
check('UI has a Nap button', /onClick=\{nap\}/.test(ui));
return results;
})();
