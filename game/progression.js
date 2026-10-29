// game/progression.js — STAT-02: Melvor-style XP curve, 10 core stats with hidden ranks, stat-pick offers with soft
// pity, and compounding status states. Source: CURRENT_BATCH.md (STAT-02) and "Stat Progression — Addendum v4".
//
// Everything lives under one namespace, ZI.PROG, and is pure data + functions. This file does NOT replace the
// existing character level (ZI.getCharacterLevel, curve 100L+10L²), the profession tracks, ZI.NUTRITION, ZI.MOODLES,
// injuries or any save key. Wiring into the live game waits on the Design Handoff in reports/STAT-02/REPORT.md.
// UI rule (STAT-02 §4): never show ranks, k, pity weights or modifier formulas. Use PROG.displayStat / PROG.cardText.

window.ZI = window.ZI || {};
(function (ZI) {
  const P = {};

  // ─── CONFIG (all values tunable; nothing below hard-codes them) ────────────
  P.CONFIG = {
    maxLevel: 100,
    xpRatio: 1.065,            // each level costs 6.5% more than the one before (Melvor-style finish)
    xpTotal: 7557000,          // total XP from level 1 to 100 (kept from the original draft)
    targetActiveHours: 300,    // pacing target for level 100
    sourceMix: { regular: 0.60, elite: 0.25, objective: 0.15 },
    // Placeholder activity counts per active hour (Addendum v4). Replace with playtest counts.
    phases: [
      { id: 'learn',      label: 'Learn the loop',    fromHour: 0,   toHour: 5,   perHour: { regular: 120, elite: 6, objective: 4 } },
      { id: 'shape',      label: 'Shape a build',     fromHour: 5,   toHour: 45,  perHour: { regular: 90,  elite: 5, objective: 3 } },
      { id: 'tradeoffs',  label: 'Make trade-offs',   fromHour: 45,  toHour: 115, perHour: { regular: 60,  elite: 4, objective: 2 } },
      { id: 'specialize', label: 'Specialize',        fromHour: 115, toHour: 200, perHour: { regular: 45,  elite: 3, objective: 2 } },
      { id: 'endgame',    label: 'Endgame cap chase', fromHour: 200, toHour: 300, perHour: { regular: 30,  elite: 2, objective: 1 } },
    ],
    ranksToCap: 30,            // audit Oct 28: 24 → 30 after Shield and Movement Speed were hidden (keeps the Damage cap near L90)
    curveK: 1.5,               // diminishing returns dial, one global value (Sam, Oct 28)
    perStatK: {},              // optional per-stat override, unused for now
    evenOnlyUntil: 35,         // levels 2–35: standard pick on even levels only
    checkpoints: [10, 20, 35, 50, 70, 85, 90, 95, 100],
    offerSize: 3,
    pityStep: 0.35,            // draw weight = 1 + pityStep × misses
    statusCompoundRate: 0.15,  // same rate for stacked bad and stacked good states
    hiddenStats: ['shield', 'moveSpeed'], // Sam, Oct 28: not offered until they do something in the game
    // Main level from skill XP (Sam, Oct 28): all profession XP adds up; main XP = a × (total skill XP)^b.
    // Fitted to 5 × 300 h Wandering simulations (Oct 28 walk pace 1.4 m/s) so the locked hours table holds within 4%
    // (reports/STAT-02/AUDIT.md).
    mainXp: { a: 111.848, b: 0.87 },
  };

  // key, display name, start, cap, display format
  P.STATS = [
    { key: 'maxHp',       name: 'Max HP',         start: 40,   cap: 60,   fmt: 'int' },
    { key: 'hpRegen',     name: 'HP Regen',       start: 10,   cap: 20,   fmt: 'dec1' },
    { key: 'shield',      name: 'Shield',         start: 50,   cap: 80,   fmt: 'int' },
    { key: 'armor',       name: 'Armor',          start: 0,    cap: 40,   fmt: 'pct' },
    { key: 'evasion',     name: 'Evasion',        start: 1,    cap: 25,   fmt: 'pct' },
    { key: 'damage',      name: 'Damage',         start: 1.00, cap: 1.30, fmt: 'mult' },
    { key: 'critChance',  name: 'Crit Chance',    start: 1,    cap: 35,   fmt: 'pct' },
    { key: 'critDamage',  name: 'Crit Damage',    start: 2.00, cap: 3.00, fmt: 'mult' },
    { key: 'attackSpeed', name: 'Attack Speed',   start: 100,  cap: 150,  fmt: 'pct' },
    { key: 'moveSpeed',   name: 'Movement Speed', start: 1.07, cap: 1.25, fmt: 'mult' },
  ];
  P.STAT_KEYS = P.STATS.map(s => s.key);
  P.statDef = key => P.STATS.find(s => s.key === key);

  // ─── XP CURVE ───────────────────────────────────────────────────────────────
  // XP to advance from level L = a × ratio^L, with a scaled so levels 1→100 total xpTotal (a ≈ 906.1).
  let _cum = null, _a = null;
  P._build = function () {
    const C = P.CONFIG; let sum = 0;
    for (let L = 1; L < C.maxLevel; L++) sum += Math.pow(C.xpRatio, L);
    _a = C.xpTotal / sum; _cum = [0, 0];
    let total = 0;
    for (let L = 1; L < C.maxLevel; L++) { total += Math.round(_a * Math.pow(C.xpRatio, L)); _cum[L + 1] = total; }
  };
  P.xpCoefficient = () => { if (_a === null) P._build(); return _a; };
  P.xpToNext = function (L) {
    if (_cum === null) P._build();
    if (L < 1 || L >= P.CONFIG.maxLevel) return 0;
    return _cum[L + 1] - _cum[L];
  };
  P.xpForLevel = function (L) { if (_cum === null) P._build(); return _cum[Math.max(1, Math.min(P.CONFIG.maxLevel, L))]; };
  P.levelFromXp = function (xp) {
    if (_cum === null) P._build();
    let L = 1; while (L < P.CONFIG.maxLevel && xp >= _cum[L + 1]) L++;
    return L;
  };
  P.xpPerActiveHour = () => P.CONFIG.xpTotal / P.CONFIG.targetActiveHours;
  P.activeHoursAtLevel = L => P.xpForLevel(L) / P.xpPerActiveHour();
  P.phaseAtHour = h => P.CONFIG.phases.find(p => h >= p.fromHour && h < p.toHour) || P.CONFIG.phases[P.CONFIG.phases.length - 1];
  // Average XP per event for a source in a phase: the source's hourly budget ÷ its hourly count.
  P.xpPerEvent = function (phaseId, source) {
    const ph = P.CONFIG.phases.find(p => p.id === phaseId); if (!ph) return 0;
    return P.xpPerActiveHour() * P.CONFIG.sourceMix[source] / ph.perHour[source];
  };

  // ─── RANK MATH (integer ranks; value derived, never accumulated) ───────────
  P.kFor = key => (P.CONFIG.perStatK[key] != null ? P.CONFIG.perStatK[key] : P.CONFIG.curveK);
  P.statValue = function (key, rank) {
    const s = P.statDef(key), N = P.CONFIG.ranksToCap;
    const r = Math.max(0, Math.min(N, Math.floor(rank)));
    if (r === N) return s.cap; // exact cap, no float drift
    return s.start + (s.cap - s.start) * (1 - Math.pow(1 - r / N, P.kFor(key)));
  };
  P.formatStat = function (key, v) {
    const s = P.statDef(key);
    if (s.fmt === 'int') return String(Math.round(v));
    if (s.fmt === 'dec1') return (Math.round(v * 10) / 10).toFixed(1);
    if (s.fmt === 'pct') return Math.round(v) + '%';
    return (Math.round(v * 100) / 100).toFixed(2) + '×';
  };
  P.displayStat = (key, rank) => P.formatStat(key, P.statValue(key, rank));
  // Upgrade card text: stat name and rounded before → after only (no ranks).
  P.cardText = (key, rankBefore) => P.statDef(key).name + ' ' + P.displayStat(key, rankBefore) + ' → ' + P.displayStat(key, rankBefore + 1);
  // Tooltip breakdown: numbers only. gear / effects are supplied by the caller (kept as separate components).
  P.breakdown = function (key, rank, parts) {
    const s = P.statDef(key), p = parts || {};
    const level = P.statValue(key, rank) - s.start, gear = p.gear || 0, effects = p.effects || 0;
    return { base: s.start, level, gear, effects, total: s.start + level + gear + effects };
  };

  // ─── STAT PICKS ─────────────────────────────────────────────────────────────
  P.isCheckpoint = L => P.CONFIG.checkpoints.indexOf(L) !== -1;
  P.standardPickAt = L => L >= 2 && L <= P.CONFIG.maxLevel && !(L <= P.CONFIG.evenOnlyUntil && L % 2 === 1);
  // Level 35 is odd, so under the even-only rule it gets its checkpoint bonus only (1 pick). This matches every
  // locked simulation; see Design Handoff H3 in reports/STAT-02/REPORT.md.
  P.picksAtLevel = L => (P.standardPickAt(L) ? 1 : 0) + (L >= 2 && P.isCheckpoint(L) ? 1 : 0);
  P.totalPicks = function () { let n = 0; for (let L = 2; L <= P.CONFIG.maxLevel; L++) n += P.picksAtLevel(L); return n; };

  P.newState = function () {
    const ranks = {}, misses = {};
    P.STAT_KEYS.forEach(k => { ranks[k] = 0; misses[k] = 0; });
    return { v: 1, ranks, misses };
  };
  P.isCapped = (st, key) => st.ranks[key] >= P.CONFIG.ranksToCap;
  P.isOfferable = (st, key) => !P.isCapped(st, key) && P.CONFIG.hiddenStats.indexOf(key) === -1;
  P.visibleStats = () => P.STATS.filter(s => P.CONFIG.hiddenStats.indexOf(s.key) === -1);
  P.mainXpFromSkill = S => S > 0 ? P.CONFIG.mainXp.a * Math.pow(S, P.CONFIG.mainXp.b) : 0;
  P.skillFromMainXp = X => X > 0 ? Math.pow(X / P.CONFIG.mainXp.a, 1 / P.CONFIG.mainXp.b) : 0;
  P.drawWeight = (st, key) => 1 + P.CONFIG.pityStep * (st.misses[key] || 0);

  // Weighted sampling without replacement among uncapped stats. Updates hidden miss counters.
  P.makeOffer = function (st, rng) {
    const rand = rng || Math.random;
    const pool = P.STAT_KEYS.filter(k => P.isOfferable(st, k));
    const offer = [];
    const n = Math.min(P.CONFIG.offerSize, pool.length);
    for (let i = 0; i < n; i++) {
      let total = 0; pool.forEach(k => { total += P.drawWeight(st, k); });
      let x = rand() * total, pick = pool[pool.length - 1];
      for (const k of pool) { x -= P.drawWeight(st, k); if (x < 0) { pick = k; break; } }
      offer.push(pick); pool.splice(pool.indexOf(pick), 1);
    }
    P.STAT_KEYS.forEach(k => {
      if (!P.isOfferable(st, k)) return;
      st.misses[k] = offer.indexOf(k) !== -1 ? 0 : (st.misses[k] || 0) + 1;
    });
    return offer;
  };
  P.applyPick = function (st, offer, key) {
    if (offer.indexOf(key) === -1) return { ok: false, reason: 'not offered' };
    if (P.isCapped(st, key)) return { ok: false, reason: 'capped' };
    const before = st.ranks[key]; st.ranks[key] = before + 1;
    return { ok: true, key, card: P.cardText(key, before), capped: P.isCapped(st, key) };
  };

  // ─── STATUS STATES ──────────────────────────────────────────────────────────
  // Tier polarity: +1 good, 0 neutral, −1 bad. Modifiers are fractional changes to the named stat.
  // Modifier values: Oct 28 audit (combat-simulator checked). Final balance waits on playtest.
  // offlineWorst: the worst tier time away can reach ("mild tier"; never the severe one).
  P.STATUS = { // values set by the Oct 28 audit (reports/STAT-02/AUDIT.md); still subject to playtest
    hunger: { label: 'Hunger', offlineWorst: 2, tiers: [
      { name: 'Well Fed', pol: 1,  mods: { hpRegen: 0.10, damage: 0.04 } },
      { name: 'Peckish',  pol: 0,  mods: {} },
      { name: 'Hungry',   pol: -1, mods: { hpRegen: -0.10, damage: -0.06 } },
      { name: 'Starving', pol: -1, mods: { hpRegen: -0.25, damage: -0.09, maxHp: -0.05 } } ] },
    rest: { label: 'Rest', offlineWorst: 2, tiers: [
      { name: 'Rested',    pol: 1,  mods: { evasion: 0.15, attackSpeed: 0.05 } },
      { name: 'Tired',     pol: 0,  mods: {} },
      { name: 'Fatigued',  pol: -1, mods: { evasion: -0.20, damage: -0.04 } },
      { name: 'Exhausted', pol: -1, mods: { evasion: -0.30, damage: -0.07, attackSpeed: -0.15 } } ] },
    wounds: { label: 'Wounds', offlineWorst: 2, tiers: [
      { name: 'Healthy',    pol: 0,  mods: {} },
      { name: 'Scratched',  pol: -1, mods: { hpRegen: -0.05 } },
      { name: 'Wounded',    pol: -1, mods: { maxHp: -0.10, damage: -0.03 } },
      { name: 'Badly Hurt', pol: -1, mods: { maxHp: -0.20, damage: -0.05 } } ] },
    sickness: { label: 'Sickness', offlineWorst: 2, tiers: [
      { name: 'Healthy',  pol: 0,  mods: {} },
      { name: 'Queasy',   pol: -1, mods: { hpRegen: -0.05 } },
      { name: 'Sick',     pol: -1, mods: { hpRegen: -0.15, damage: -0.05 } },
      { name: 'Feverish', pol: -1, mods: { hpRegen: -0.30, damage: -0.05, critChance: -0.20 } } ] },
    morale: { label: 'Morale', offlineWorst: 1, tiers: [
      { name: 'Steady', pol: 0,  mods: {} },
      { name: 'Uneasy', pol: -1, mods: { critChance: -0.10, evasion: -0.05 } },
      { name: 'Shaken', pol: -1, mods: { critChance: -0.25, evasion: -0.10, damage: -0.03 } } ] },
  };
  P.STATUS_KEYS = Object.keys(P.STATUS);
  P.newStatus = () => ({ hunger: 1, rest: 1, wounds: 0, sickness: 0, morale: 0 });
  P.statusLabels = function (s) { const out = {}; P.STATUS_KEYS.forEach(t => { out[t] = P.STATUS[t].tiers[s[t]].name; }); return out; };

  // Combined hidden modifiers. Each extra active bad state makes all bad modifiers harsher by the compound rate;
  // each extra good state makes all good modifiers stronger by the same rate. Multiplier = 1 + rate × (count − 1).
  P.statusModifiers = function (s) {
    const rate = P.CONFIG.statusCompoundRate;
    const good = [], bad = [];
    P.STATUS_KEYS.forEach(t => { const tier = P.STATUS[t].tiers[s[t]]; if (tier.pol > 0) good.push(tier); else if (tier.pol < 0) bad.push(tier); });
    const gm = good.length > 1 ? 1 + rate * (good.length - 1) : 1;
    const bm = bad.length > 1 ? 1 + rate * (bad.length - 1) : 1;
    const out = {};
    good.forEach(tier => Object.keys(tier.mods).forEach(k => { out[k] = (out[k] || 0) + tier.mods[k] * gm; }));
    bad.forEach(tier => Object.keys(tier.mods).forEach(k => { out[k] = (out[k] || 0) + tier.mods[k] * bm; }));
    return out;
  };

  // Offline settle (app closed). The character self-manages from supplies; no track can pass its offlineWorst tier.
  // Drift rates are PLACEHOLDERS (one tier per N game hours). Hours here are game hours from the world clock.
  P.OFFLINE_RATES = { hungerHoursPerTier: 8, restHoursPerTier: 16, rationsPerMeal: 1, mealEveryHours: 8, sleepEveryHours: 16 };
  P.settleOffline = function (status, gameHours, supplies) {
    const R = P.OFFLINE_RATES, s = Object.assign({}, status), sup = Object.assign({ rations: 0 }, supplies || {});
    const summary = { meals: 0, sleeps: 0, rationsUsed: 0, woundsTended: false };
    let h = 0;
    while (h < gameHours) {
      const step = Math.min(1, gameHours - h); h += step;
      if (Math.floor(h) % R.mealEveryHours === 0 && step === 1) {
        if (sup.rations >= R.rationsPerMeal) { sup.rations -= R.rationsPerMeal; summary.meals++; summary.rationsUsed += R.rationsPerMeal; s.hunger = 0; }
        else s.hunger = Math.min(P.STATUS.hunger.offlineWorst, s.hunger + 1);
      }
      if (Math.floor(h) % R.sleepEveryHours === 0 && step === 1) { summary.sleeps++; s.rest = 0; }
    }
    if (s.wounds > 0) { summary.woundsTended = true; s.wounds = Math.max(0, s.wounds - 1); }
    P.STATUS_KEYS.forEach(t => { if (s[t] > P.STATUS[t].offlineWorst) s[t] = P.STATUS[t].offlineWorst; });
    const parts = [];
    if (summary.meals) parts.push('ate ' + (summary.meals === 1 ? 'once' : summary.meals === 2 ? 'twice' : summary.meals + ' times'));
    else parts.push('went without food');
    if (summary.sleeps) parts.push('slept well');
    if (summary.woundsTended) parts.push('tended wounds');
    if (summary.rationsUsed) parts.push('used ' + summary.rationsUsed + ' ration' + (summary.rationsUsed === 1 ? '' : 's'));
    const text = parts.join(', ');
    return { status: s, supplies: sup, summary, text: text.charAt(0).toUpperCase() + text.slice(1) };
  };

  // ─── HEADLESS SIMULATION (acceptance checks; not used by the game) ─────────
  P.seededRng = function (seed) {
    let a = seed >>> 0;
    return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  };
  const DEFENSE = ['maxHp', 'hpRegen', 'shield', 'armor', 'evasion'];
  P.chooseFor = function (build, offer, st, rng) {
    if (build === 'damage') return offer.indexOf('damage') !== -1 ? 'damage' : offer[Math.floor(rng() * offer.length)];
    const lowest = list => { const lo = Math.min.apply(null, list.map(k => st.ranks[k])); const c = list.filter(k => st.ranks[k] === lo); return c[Math.floor(rng() * c.length)]; };
    if (build === 'balanced') return lowest(offer);
    if (build === 'survival') { const d = offer.filter(k => DEFENSE.indexOf(k) !== -1); return d.length ? lowest(d) : offer[Math.floor(rng() * offer.length)]; }
    return offer[0];
  };
  P.simulateRun = function (build, rng) {
    const st = P.newState(); let firstCap = null, damageCap = null;
    for (let L = 2; L <= P.CONFIG.maxLevel; L++) {
      for (let i = 0; i < P.picksAtLevel(L); i++) {
        const offer = P.makeOffer(st, rng);
        if (!offer.length) continue;
        const key = P.chooseFor(build, offer, st, rng);
        P.applyPick(st, offer, key);
        if (P.isCapped(st, key)) { if (firstCap === null) firstCap = L; if (key === 'damage' && damageCap === null) damageCap = L; }
      }
    }
    return { firstCap, damageCap, ranks: st.ranks };
  };
  P.simulate = function (build, runs, seed) {
    const rng = P.seededRng(seed || 1), caps = [], dmg = []; let neverDamage = 0, anyCap = 0;
    for (let i = 0; i < runs; i++) {
      const r = P.simulateRun(build, rng);
      caps.push(r.firstCap === null ? 101 : r.firstCap); dmg.push(r.damageCap === null ? 101 : r.damageCap);
      if (r.damageCap === null) neverDamage++; if (r.firstCap !== null && r.firstCap < 100) anyCap++;
    }
    const med = a => { const s = a.slice().sort((x, y) => x - y), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
    return { runs, medianFirstCap: med(caps), medianDamageCap: med(dmg), neverDamagePct: neverDamage / runs * 100, capBefore100Pct: anyCap / runs * 100 };
  };

  ZI.PROG = P;
})(window.ZI);
