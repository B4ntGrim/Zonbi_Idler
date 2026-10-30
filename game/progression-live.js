// game/progression-live.js — STAT-02 live wiring. Loads AFTER game/bootstrap.js so it wraps the final functions.
// Decisions (Sam, Oct 28): keep each player's level when the XP curve changes (H1); status tracks read the systems that
// already run (H2); level 35 gives one pick (H3); the 10 stats add on top of current survivor stats (H4); hunger drops
// one tier per game day, eating is by hand until Auto-Eat is bought in the Shop; tiredness drops one tier every two
// game days and Make camp resets it (H5). Pure maths lives in game/progression.js (ZI.PROG).
(function (ZI) {
  const P = ZI.PROG; if (!P || ZI.PROG.LIVE) return;
  const L = P.LIVE = {};
  const rj = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } };
  const wj = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  L.KEY = 'zi_prog_v1';            // { v, ranks, misses, pending, offer, lastLevel, migratedFrom }
  L.CURVE_KEY = 'zi_prog_curve_ver';
  L.STATUS_KEY = 'zi_status_v1';   // { nutrition, rest, lastGameSec, lastAway }
  L.CONFIG = {
    nutritionLossPerGameDay: 25,   // 4 tiers × 25 → one hunger tier per game day (H5)
    restLossPerGameDay: 25 / 6,    // one tiredness tier per six game days (~2.4 real h; Sam, Oct 28: slower; audit value)
    napRest: 25, napGameHours: 2,   // nap at base: one tier back, costs 2 game hours (audit values)
    tierEdges: [75, 50, 25],       // ≥75 tier 0 · ≥50 tier 1 · ≥25 tier 2 · below tier 3
    startNutrition: 70, startRest: 70,
    foodNutrition: 25,             // audit: one food item = one game day of hunger (one tier)
    autoEatRequiresShop: true,     // Sam, Oct 28 (overrides FOOD-01 P6/P8 — see REPORT H6)
    autoEatShopId: 'qol_autoeat', autoEatBelow: 50,
    offlineMaxMeals: 3,            // PLACEHOLDER: meals the survivor eats on their own while the app is closed
    offlineSleepAfterGameHours: 8, // away at least this long → slept at camp
    tickMs: 5000,
  };

  // ─── Level curve migration (H1: keep the level, refit XP) ───────────────────
  L.oldLevelInfo = function (xp) {
    let lvl = 1, need = 0, rest = xp;
    while (lvl < 100) { need = lvl * 100 + lvl * lvl * 10; if (rest < need) break; rest -= need; lvl++; }
    return { level: lvl, frac: lvl >= 100 ? 0 : rest / need };
  };
  L.getState = function () {
    // Damaged-save guard (Oct 28): a stored value that is not a state object (array, text, number, or an object
    // missing ranks/misses) is replaced with a fresh state instead of throwing and blanking every page load.
    const obj = v => v != null && typeof v === 'object' && !Array.isArray(v);
    let s = rj(L.KEY, null);
    if (!obj(s)) s = P.newState();
    if (!obj(s.ranks)) s.ranks = P.newState().ranks;
    if (!obj(s.misses)) s.misses = P.newState().misses;
    P.STAT_KEYS.forEach(k => { if (!Number.isInteger(s.ranks[k]) || s.ranks[k] < 0) s.ranks[k] = 0; else if (s.ranks[k] > P.CONFIG.ranksToCap) s.ranks[k] = P.CONFIG.ranksToCap; if (!Number.isFinite(s.misses[k]) || s.misses[k] < 0) s.misses[k] = 0; });
    if (!Number.isInteger(s.pending) || s.pending < 0) s.pending = 0;
    if (s.offer != null && !(Array.isArray(s.offer) && s.offer.every(k => P.STAT_KEYS.indexOf(k) >= 0))) s.offer = null;
    if (!Number.isInteger(s.lastLevel) || s.lastLevel < 1) s.lastLevel = 1;
    s.pending = s.pending || 0; s.offer = s.offer || null; s.lastLevel = s.lastLevel || 1;
    P.STAT_KEYS.forEach(k => { s.ranks[k] = s.ranks[k] || 0; s.misses[k] = s.misses[k] || 0; });
    return s;
  };
  L.saveState = s => { wj(L.KEY, s); L._notify(); };
  L.picksForLevels = function (from, to) { let n = 0; for (let l = from + 1; l <= to; l++) n += P.picksAtLevel(l); return n; };
  L.migrateCurve = function () {
    if (rj(L.CURVE_KEY, 0) === 2) return null;
    const xp = ZI.getCharacterXp(), old = L.oldLevelInfo(xp);
    const start = P.xpForLevel(old.level), next = P.xpToNext(old.level);
    const newXp = start + Math.floor(old.frac * next);
    try { localStorage.setItem(ZI.WANDER_XP_KEY, String(newXp)); } catch (e) {}
    const s = L.getState();
    s.lastLevel = old.level; s.pending = L.picksForLevels(1, old.level); // picks already earned by an existing save
    s.migratedFrom = { oldXp: xp, newXp, level: old.level };
    wj(L.KEY, s); wj(L.CURVE_KEY, 2);
    return s.migratedFrom;
  };

  // ─── Level and picks ────────────────────────────────────────────────────────
  ZI.getCharacterLevel = function () { return P.levelFromXp(ZI.getCharacterXp()); };
  L.syncLevel = function () {
    const lvl = ZI.getCharacterLevel(), s = L.getState();
    if (lvl > s.lastLevel) { s.pending += L.picksForLevels(s.lastLevel, lvl); s.lastLevel = lvl; L.saveState(s); }
    return lvl;
  };
  // Main level from skill XP (Sam, Oct 28). Every profession XP point counts once (decay never lowers the main level).
  // An existing save continues from the skill total that matches its current main XP, so nobody loses a level.
  L.totalSkillXp = function () { const x = ZI.getStatXp ? ZI.getStatXp() : {}; return Object.values(x).reduce((a, v) => a + (Number(v) > 0 ? Number(v) : 0), 0); };
  L.syncSkill = function () {
    const s = L.getState(), cur = L.totalSkillXp();
    if (!s.skill) s.skill = { lifetime: 0, lastTotal: cur, start: P.skillFromMainXp(ZI.getCharacterXp()) };
    if (cur > s.skill.lastTotal) s.skill.lifetime += cur - s.skill.lastTotal;
    s.skill.lastTotal = cur;
    const main = Math.round(P.mainXpFromSkill(s.skill.start + s.skill.lifetime));
    if (main > ZI.getCharacterXp()) { try { localStorage.setItem(ZI.WANDER_XP_KEY, String(main)); } catch (e) {} }
    wj(L.KEY, s);
    return L.syncLevel();
  };
  // Wandering's banked score XP is already counted through the kills' skill XP, so it no longer adds to the main level.
  ZI.applyWanderingXp = function () { L.syncSkill(); return ZI.getCharacterXp(); };
  if (ZI.onXp) ZI.onXp(() => L.syncSkill());
  // The open offer is saved, so a reload never re-rolls it.
  L.currentOffer = function () {
    const s = L.getState(); if (s.pending <= 0) return null;
    if (!s.offer || !s.offer.length || s.offer.some(k => P.isCapped(s, k))) { s.offer = P.makeOffer(s); L.saveState(s); }
    return s.offer;
  };
  L.choose = function (key) {
    const s = L.getState(), offer = s.offer || [];
    if (s.pending <= 0) return { ok: false, reason: 'No pick waiting.' };
    const before = s.ranks[key] || 0;
    const r = P.applyPick(s, offer, key); if (!r.ok) return r;
    r.card = L.cardText(key, before);
    s.pending--; s.offer = null; L.saveState(s); return r;
  };
  L.rank = key => L.getState().ranks[key] || 0;
  L.value = key => P.statValue(key, L.rank(key));
  L.bonus = key => L.value(key) - P.statDef(key).start;

  // ─── Status (H2 read existing systems, H5 timing) ───────────────────────────
  L.tierOf = function (meter) { const e = L.CONFIG.tierEdges; return meter >= e[0] ? 0 : meter >= e[1] ? 1 : meter >= e[2] ? 2 : 3; };
  L.getStatus = function () {
    const s = rj(L.STATUS_KEY, null);
    if (s) return s;
    const fresh = { nutrition: L.CONFIG.startNutrition, rest: L.CONFIG.startRest, lastGameSec: ZI.gameTotalSeconds(), lastAway: null };
    wj(L.STATUS_KEY, fresh); return fresh;
  };
  L.saveStatus = s => { wj(L.STATUS_KEY, s); L._notify(); };
  L.autoEatOwned = () => !L.CONFIG.autoEatRequiresShop || (ZI.shopOwned && ZI.shopOwned(L.CONFIG.autoEatShopId)) || !!(ZI.getProfileFlag && ZI.getProfileFlag('autoEat'));
  // Food = Food-slot items that are not loot boosters. Lowest value first (FOOD-01 F2).
  L.isFood = function (id) { const g = ZI.getGearItem && ZI.getGearItem(id); return !!g && g.slot === 'consumable3' && !(g.effect && g.effect.lootPct); };
  L.foodList = function () {
    return (ZI.getStash ? ZI.getStash() : []).filter(L.isFood)
      .sort((a, b) => ((ZI.getGearItem(a).marketValue || 0) - (ZI.getGearItem(b).marketValue || 0)));
  };
  L.foodValue = id => { const g = ZI.getGearItem(id); return (g && (g.nutrition || (g.effect && g.effect.nutrition))) || L.CONFIG.foodNutrition; };
  L._eatOne = function (s) {
    const id = L.foodList()[0]; if (!id) return null;
    if (!ZI.removeFromStash(id, 'eat')) return null;
    s.nutrition = Math.min(100, s.nutrition + L.foodValue(id)); return id;
  };
  L.eat = function () { // manual "Eat" button
    const s = L.settleStatus(), id = L._eatOne(s);
    if (!id) return { ok: false, reason: 'No food in camp.' };
    L.saveStatus(s); return { ok: true, item: id, name: ZI.getGearItem(id).name };
  };
  // Online settle: world clock (game seconds) drives the meters.
  L.settleStatus = function () {
    const s = L.getStatus(), now = ZI.gameTotalSeconds(), dh = Math.max(0, (now - (s.lastGameSec || now)) / 3600);
    s.nutrition = Math.max(0, s.nutrition - L.CONFIG.nutritionLossPerGameDay * dh / 24);
    s.rest = Math.max(0, s.rest - L.CONFIG.restLossPerGameDay * dh / 24);
    s.lastGameSec = now;
    if (L.autoEatOwned()) { let guard = 5; while (s.nutrition < L.CONFIG.autoEatBelow && guard-- > 0 && L._eatOne(s)) {} }
    wj(L.STATUS_KEY, s); return s;
  };
  // Offline settle (app closed): drain, but never past the mild tier; the survivor eats and sleeps on their own.
  L.settleOffline = function () {
    const s = L.getStatus(), now = ZI.gameTotalSeconds();
    let dh = Math.max(0, (now - (s.lastGameSec || now)) / 3600);
    // Oct 29: respect the CLOCK-01 24-real-hour offline cap (the calendar still moves for the full absence).
    const w = ZI.offlineWindow && ZI.offlineWindow();
    if (w && Number.isFinite(w.creditedMs) && ZI.REAL_MS_PER_GAME_HOUR > 0) dh = Math.min(dh, w.creditedMs / ZI.REAL_MS_PER_GAME_HOUR);
    const floor = L.CONFIG.tierEdges[2]; // never below the Hungry / Fatigued band
    const before = { hunger: L.tierOf(s.nutrition), rest: L.tierOf(s.rest) };
    s.nutrition = Math.max(Math.min(s.nutrition, floor), s.nutrition - L.CONFIG.nutritionLossPerGameDay * dh / 24);
    s.rest = Math.max(Math.min(s.rest, floor), s.rest - L.CONFIG.restLossPerGameDay * dh / 24);
    let meals = 0; const eaten = [];
    while (meals < L.CONFIG.offlineMaxMeals && s.nutrition < L.CONFIG.tierEdges[0]) { const id = L._eatOne(s); if (!id) break; meals++; eaten.push(id); }
    const slept = dh >= L.CONFIG.offlineSleepAfterGameHours; if (slept) s.rest = 100;
    s.lastGameSec = now;
    const parts = [meals ? 'ate ' + (meals === 1 ? 'once' : meals === 2 ? 'twice' : meals + ' times') : (s.nutrition < L.CONFIG.tierEdges[1] ? 'went without food' : '')];
    if (slept) parts.push('slept well');
    if (eaten.length) parts.push('used ' + eaten.length + ' food item' + (eaten.length === 1 ? '' : 's'));
    const text = parts.filter(Boolean).join(', ');
    s.lastAway = text ? { text: text.charAt(0).toUpperCase() + text.slice(1), gameHours: Math.round(dh), at: Date.now(), before } : null;
    wj(L.STATUS_KEY, s); return s.lastAway;
  };
  // Wounds from the injury system; Morale from Broken and stress; Sickness has no live source yet (stays Healthy).
  L.statusIndex = function () {
    const s = L.getStatus();
    let wounds = 0;
    const inj = ZI.getInjury && ZI.getInjury();
    const run = ZI.getWanderRun ? ZI.getWanderRun() : null, hpPct = run && run.hp != null ? run.hp / Math.max(1, L._baseMaxHp()) : 1;
    if (inj) wounds = hpPct < 0.25 ? 3 : 2; else if (hpPct < 0.7) wounds = 1;
    let morale = 0;
    if (ZI.isBroken && ZI.isBroken()) morale = 2; else if (ZI.getStress && ZI.getStress() >= 70) morale = 1;
    return { hunger: L.tierOf(s.nutrition), rest: L.tierOf(s.rest), wounds, sickness: 0, morale };
  };
  L.labels = () => P.statusLabels(L.statusIndex());
  L.mods = () => P.statusModifiers(L.statusIndex());
  ZI.getNutrition = function () { const s = L.getStatus(); return { current: Math.round(s.nutrition), max: 100 }; }; // top bar chip (FOOD-01 meter)
  // Nap at base (home cell or the current camp cell): one tier of tiredness back, costs game time. Any time at base.
  L.canNap = () => !ZI.atBaseOrCamp || ZI.atBaseOrCamp();
  L.nap = function () {
    if (!L.canNap()) return { ok: false, reason: 'Nap at your base or camp.' };
    const s = L.settleStatus();
    if (s.rest >= 100) return { ok: false, reason: 'Already rested.' };
    s.rest = Math.min(100, s.rest + L.CONFIG.napRest); wj(L.STATUS_KEY, s);
    if (ZI.passTime) ZI.passTime(L.CONFIG.napGameHours);
    const s2 = L.settleStatus(); L.saveStatus(s2);
    return { ok: true, rest: L.tierOf(s2.rest) };
  };
  // Make camp = sleep: resets tiredness.
  const origCamp = ZI.spendCampUse;
  ZI.spendCampUse = function () { const r = origCamp.apply(this, arguments); if (r && r.ok) { const s = L.settleStatus(); s.rest = 100; L.saveStatus(s); } return r; };

  // ─── H4: the 10 stats add on top of the current survivor ────────────────────
  const origMaxHp = ZI.maxHp;
  L._baseMaxHp = () => origMaxHp() + L.bonus('maxHp'); // no status mods here (avoids a loop through L.mods)
  ZI.maxHp = function () {
    const m = L.mods();
    return Math.max(1, Math.round((origMaxHp.apply(this, arguments) + L.bonus('maxHp')) * (1 + (m.maxHp || 0))));
  };
  // What the player sees (H4: values shown as they act on the survivor; never ranks).
  L.displayAt = function (key, r) {
    const d = P.statDef(key), v = P.statValue(key, r);
    if (key === 'maxHp') return String(Math.round(origMaxHp() + v - d.start));
    if (key === 'hpRegen') return Math.round(v / d.start * 100) + '% regen';
    if (key === 'evasion' || key === 'critChance') return '+' + Math.round(v - d.start) + '%';
    return P.formatStat(key, v);
  };
  L.display = key => L.displayAt(key, L.rank(key));
  L.cardText = (key, r) => P.statDef(key).name + ' ' + L.displayAt(key, r) + ' → ' + L.displayAt(key, r + 1);
  const F = ZI.STAT_FORMULAS, origBlock = F.survivorStatBlock;
  F.survivorStatBlock = function () {
    const sb = origBlock.apply(this, arguments), m = L.mods();
    const dmg = L.value('damage') * (1 + (m.damage || 0));
    sb.damageMin = Math.max(1, Math.round(sb.damageMin * dmg)); sb.damageMax = Math.max(sb.damageMin + 1, Math.round(sb.damageMax * dmg));
    sb.crit = Math.max(0, (sb.crit + L.bonus('critChance')) * (1 + (m.critChance || 0)));
    sb.critBonus = Math.round((sb.critBonus || 0) * L.value('critDamage') / P.statDef('critDamage').start);
    sb.evasion = Math.max(0, (sb.evasion + L.bonus('evasion')) * (1 + (m.evasion || 0)));
    sb.armorPct = Math.min(80, L.value('armor'));
    sb.initiative = Math.round(sb.initiative * (L.value('attackSpeed') / 100) * (1 + (m.attackSpeed || 0)));
    sb.hpMax = ZI.maxHp(); if (sb.hp > sb.hpMax) sb.hp = sb.hpMax;
    return sb;
  };
  // HP Regen: scales the rest regen rate read by Wandering and Active rest.
  const R = ZI.WANDER_REST_TABLE, baseRegen = R.restHpPerMinutePct;
  try {
    Object.defineProperty(R, 'restHpPerMinutePct', { configurable: true, enumerable: true,
      get() { const m = L.mods(); // MED-01 M10: the splint's regen burst multiplies the rest rate while it lasts.
        return baseRegen * (L.value('hpRegen') / P.statDef('hpRegen').start) * Math.max(0.1, 1 + (m.hpRegen || 0)) * (1 + (ZI.medRegenBonus ? ZI.medRegenBonus() : 0)); } });
  } catch (e) {}

  // ─── Shop: Auto-Eat (H5; price and gate are PLACEHOLDERS) ───────────────────
  if (ZI.SHOP_ITEMS && !ZI.SHOP_ITEMS.some(e => e.id === L.CONFIG.autoEatShopId)) {
    ZI.SHOP_ITEMS.push({ id: L.CONFIG.autoEatShopId, name: 'Auto-Eat', cat: 'qol', tier: 'T1', icon: '🍽',
      desc: 'Your survivor eats from camp food on their own when hungry.', req: { distance: 500 },
      cost: { T1: 5 }, grant: { kind: 'flag', flag: 'autoEat', value: true }, repeatable: false });
  }

  // ─── Food drops (Sam, Oct 28: food found on routes and at locations is real food, not recycler salvage) ───
  // Rolls use their own stream (ZI.roll('food')), so existing seeded combat and loot sequences are unchanged.
  L.FOOD = {
    itemId: 'canned_food',
    // Wandering: chance per won fight, by the location's name. Food-rich places pay more (audit values).
    wanderChance: [[/convenience/i, 0.35], [/residential|apartment/i, 0.30], [/mall|gas station/i, 0.25], [/garage|warehouse|office/i, 0.10]],
    wanderDefault: 0.15,
    // Traversal Loot (once per zone): [name pattern, items, chance per item].
    lootRolls: [[/convenience|residential|apartment|mall|gas station/i, 2, 0.70]], lootDefault: [1, 0.30],
    // Routes: one roll per food node on a claimed run.
    routeNode: /cabin|residential|convenience|store|market|mall|grocery|farm|diner|food/i, routeNodeChance: 0.60,
  };
  if (ZI.GEAR_ITEMS && !ZI.getGearItem(L.FOOD.itemId)) {
    ZI.GEAR_ITEMS.push({ id: L.FOOD.itemId, name: 'Canned Food', slot: 'consumable3', cat: 'consumable', rarity: 'common', icon: '🥫',
      dmg: 0, armor: 0, carryW: 1, speedDelta: 0, lootBonus: 0, nutrition: 25, effect: { heal: 6 }, marketValue: 1,
      desc: 'Fills you up for about a game day.' });
  }
  const foodRoll = () => (ZI.roll ? ZI.roll('food') : Math.random());
  L.addFood = function (n) {
    if (!(n > 0) || !ZI.getStash) return 0;
    const st = ZI.getStash(); for (let i = 0; i < n; i++) st.push(L.FOOD.itemId); ZI.saveStash(st);
    L.foodFound = (L.foodFound || 0) + n; return n;
  };
  const pick = (table, name, dflt) => { const row = table.find(r => r[0].test(name || '')); return row || dflt; };
  L.wanderFoodChance = function () { const z = ZI.getTravZone && ZI.getTravZone(); const row = pick(L.FOOD.wanderChance, z && z.name, null); return row ? row[1] : L.FOOD.wanderDefault; };
  L.rollLocationFood = function (cell) {
    const row = pick(L.FOOD.lootRolls, cell && cell.name, null), n = row ? row[1] : L.FOOD.lootDefault[0], p = row ? row[2] : L.FOOD.lootDefault[1];
    let got = 0; for (let i = 0; i < n; i++) if (foodRoll() < p) got++;
    return L.addFood(got);
  };
  L.rollRouteFood = function (nodes) { let got = 0; (nodes || []).forEach(nm => { if (L.FOOD.routeNode.test(nm) && foodRoll() < L.FOOD.routeNodeChance) got++; }); return L.addFood(got); };
  if (ZI.WanderSim && ZI.WanderSim.resolveEncounter) {
    const origResolve = ZI.WanderSim.resolveEncounter;
    ZI.WanderSim.resolveEncounter = function (state) {
      const out = origResolve.apply(this, arguments);
      if (out && out.outcome === 'win' && foodRoll() < L.wanderFoodChance()) { L.addFood(1); out.food = 'Canned Food'; }
      return out;
    };
  }
  if (ZI.claimLastRun) {
    const origClaim = ZI.claimLastRun;
    ZI.claimLastRun = function () {
      const last = ZI.getLastRun ? ZI.getLastRun() : null, r = origClaim.apply(this, arguments);
      if (r && r.ok && last) { r.food = L.rollRouteFood(last.nodes); }
      return r;
    };
  }

  // ─── Change listeners and load-time settle ──────────────────────────────────
  L._ls = []; L.onChange = fn => { L._ls.push(fn); return () => { L._ls = L._ls.filter(f => f !== fn); }; };
  L._notify = () => L._ls.slice().forEach(fn => { try { fn(); } catch (e) {} });
  L.boot = function () {
    L.migration = L.migrateCurve();
    L.syncSkill();
    const away = ZI.offlineWindow ? ZI.offlineWindow() : null;
    if (away && away.elapsedMs >= 60000) L.settleOffline(); else L.settleStatus();
  };
  L.boot();
  if (typeof document !== 'undefined' && typeof setInterval === 'function') setInterval(() => { L.settleStatus(); L.syncSkill(); L._notify(); }, L.CONFIG.tickMs);
})(window.ZI);
