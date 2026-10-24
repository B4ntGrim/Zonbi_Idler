// game/active.js — Batch 2B: active play (spec 13). Plain rules, no UI: the Wandering screen only displays these
// results and calls the player actions. Discovery prompts, charges/kits, Push On, withdrawal, Change Route, stress.
// Every number lives in ZI.ACTIVE_TABLE (starting values from CURRENT_BATCH.md, Batch 2B).

ZI.ACTIVE_TABLE = {
  discoveryEverySec: 120,
  discoveryWeights: { campsite: 70, structure: 30 },
  sites: {
    campsite:  { name:'Campsite',  siteTier:0, timerSec:20, mats:3, lootValue:6,  checks:['scavenging','discovery'] },
    structure: { name:'Structure', siteTier:1, timerSec:45, mats:6, lootValue:14, checks:['scavenging','discovery'] },
  },
  riskLabels: ['Low', 'Medium', 'High', 'Deadly'],
  riskOdds: [85, 65, 45, 25],                         // venture success % by true risk tier (hidden unless scouted)
  riskScore: { perSiteTier: 10, perZoneDifficulty: 4, perPressure: 6, perSkillLevel: 0.9, thresholds: [12, 24, 36] },
  rewardMult: [1, 1.5, 2.2, 3],
  rewardRarity: ['Common', 'Uncommon', 'Rare', 'Epic'],
  failPenalty: [                                      // spec 13.5 starting values, by true risk tier
    { hpPct: 10, haulLoss: 0, ambush: false },
    { hpPct: 20, haulLoss: 1, ambush: false },
    { hpPct: 30, haulLoss: 0, ambush: true },
    { hpPct: 40, haulLoss: 2, ambush: true },
  ],
  policyVentureMax: { ethical: 0, immoral: 1, criminal: 2, heinous: 3 }, // default: venture if risk index ≤ this
  xp: { moveOnScale: 0.2, ventureScale: 0.6 },
  scout: { exactOddsLevel: 15, reduceRiskLevel: 30 },  // D1: Discovery 30+ lowers the actual risk one tier (min Low)
  charges: { baseHeal: 2, baseScout: 2, commandPerkLevel: 40, commandPerkHeal: 1, kit: { medkit: { kind:'heal', charges: 2 }, scout_kit: { kind:'scout', charges: 2 } } },
  // Batch 3A field load (spec 14.4). overloadStressMult = the Normal-difficulty value; difficulty scaling comes later.
  load: { limitPct: 125, speedAtLimit: 0.75, overloadStressMult: 1.15 },
  push: { maxPressure: 3, encounterRateMult: 0.15, tierBoost: 1 },
  changeRoute: { stress: 3, moveStepSec: 30 },
  stress: {
    max: 100, unexploredPerMin: 0.25, exploredPerMin: 0.10, clearedPerMin: -0.10,
    failedVenture: 8, ambush: 5, changeRoute: 3, lowHpOnce: 5, lowHpPct: 25,
    stages: [
      { id:'calm',     name:'Calm',     min: 0,   wear: 1.00, fumble: 0,  riskShift: 0, levelPenalty: 0 },
      { id:'strained', name:'Strained', min: 40,  wear: 1.10, fumble: 5,  riskShift: 0, levelPenalty: 0 },
      { id:'stressed', name:'Stressed', min: 70,  wear: 1.25, fumble: 10, riskShift: 1, levelPenalty: 0.05 },
      { id:'breaking', name:'Breaking', min: 100, wear: 1.25, fumble: 10, riskShift: 1, levelPenalty: 0.05 },
    ],
    shakenFloor: 80,                       // PF1 (Sam, Oct 16): was 60; kept above the resume gate (< 70) so a Breaking forces a stress rest (~12 h at the Bedroll rate)
    bedRecoveryPerDay: { bedroll: 20, cot: 30, bunk: 40, bed: 50 }, defaultBed: 'bedroll',
  },
  levelPenaltyCap: 0.20,                              // rust + stress (+ injury) never more than −20% (spec 13.8)
};

// ─── STRESS (0–100, saved, persists between runs) ─────────────────────────────
ZI.STRESS_KEY = 'zi_stress';
// B9: stress is stored as an exact integer count of units (STRESS_UNITS per point). With 1 unit = 1/5.184e12 of a point,
// every per-minute and per-day rate in ACTIVE_TABLE is a whole number of units per millisecond, so the sum is exact and
// identical however the elapsed time is chunked (1-s live beats or one bulk catch-up). 100 points = 5.184e14 < 2^53.
ZI.STRESS_UNITS = 60000 * 86400000;
ZI.stressUnitsPerMsFromPerMin = function(perMin) { return Math.round(perMin * 86400000); };
ZI.stressUnitsPerMsFromPerDay = function(perDay) { return Math.round(perDay * 60000); };
ZI.getStressState = function() {
  const s = Object.assign({ value: 0 }, ZI._rj(ZI.STRESS_KEY, {}));
  if (s.u == null) s.u = Math.round((s.value || 0) * ZI.STRESS_UNITS); // older saves stored only the value
  return s;
};
ZI.getStress = function() { return ZI.getStressState().u / ZI.STRESS_UNITS; };
ZI._setStressU = function(u) {
  const max = ZI.ACTIVE_TABLE.stress.max * ZI.STRESS_UNITS;
  const s = ZI.getStressState(); s.u = Math.max(0, Math.min(max, Math.round(u))); s.value = s.u / ZI.STRESS_UNITS;
  ZI._wj(ZI.STRESS_KEY, s); return s.value;
};
ZI.setStress = function(v) { return ZI._setStressU(v * ZI.STRESS_UNITS); };
ZI.addStressUnits = function(du) { return ZI._setStressU(ZI.getStressState().u + du); };
ZI.addStress = function(d) { return ZI.addStressUnits(Math.round(d * ZI.STRESS_UNITS)); };
ZI.stressStage = function(v) {
  if (v == null) v = ZI.getStress();
  const st = ZI.ACTIVE_TABLE.stress.stages; let cur = st[0];
  st.forEach(s => { if (v >= s.min) cur = s; });
  return cur;
};
ZI.stressWearMult = function() { return ZI.stressStage().wear; };
// Effective level: rust, injury and stress combined, capped at −20% (spec 13.8 / B5).
ZI.effectiveLevel = function(skill) {
  let pen = 1 - ZI.skillRust(skill).eff;
  const j = ZI.getInjury && ZI.getInjury(); if (j && j.skills.includes(skill)) pen += j.pct;
  pen += ZI.stressStage().levelPenalty;
  pen = Math.min(ZI.ACTIVE_TABLE.levelPenaltyCap, Math.max(0, pen));
  return Math.max(1, Math.floor(ZI.statLevel(skill) * (1 - pen)));
};
// Bed in use while resting (no bed tiers are built yet → Bedroll). R1: the one source of truth for the rest stress
// rate. where = 'checkpoint' → fixed at the Bedroll rate; anything else (Base) → the current bed tier (today Bedroll).
ZI.restBed = function(where) { return (where === 'checkpoint' || where === 'camp') && ZI.RETREAT_RULES_TABLE ? ZI.RETREAT_RULES_TABLE.checkpointRestBed : ZI.ACTIVE_TABLE.stress.defaultBed; }; // JD1a: the Jester's camp rests at the Bedroll rate
ZI.restStressPerDay = function(where) { return ZI.ACTIVE_TABLE.stress.bedRecoveryPerDay[ZI.restBed(where)] || 0; };

// ─── CHARGES AND KITS (spec 13.3, decisions D2/D3) ────────────────────────────
ZI.CHARGES_KEY = 'zi_charges';
// Base maximum: Command's self-discipline perk (spec 2.4) adds +1 Heal charge at its top level
// (moved here from the retired First Aid heal counter).
ZI.baseChargeMax = function() {
  const C = ZI.ACTIVE_TABLE.charges, perk = (ZI.effectiveLevel ? ZI.effectiveLevel('command') : 1) >= C.commandPerkLevel ? C.commandPerkHeal : 0;
  return { heal: C.baseHeal + perk, scout: C.baseScout };
};
ZI.getBaseCharges = function() {
  return Object.assign(ZI.baseChargeMax(), ZI._rj(ZI.CHARGES_KEY, {}));
};
ZI.refillBaseCharges = function() { ZI._wj(ZI.CHARGES_KEY, ZI.baseChargeMax()); ZI._notifyInventory && ZI._notifyInventory(); };
ZI.isKit = function(id) { return !!ZI.ACTIVE_TABLE.charges.kit[id]; };
ZI.kitFull = function(id) { const k = ZI.ACTIVE_TABLE.charges.kit[id]; return k ? k.charges : 0; };
// D3: every kit is its own carried entry with its own charge count. Stash copies are full unless listed here.
ZI.KIT_STASH_KEY = 'zi_kit_stash_charges';
ZI.getKitStashPartials = function() { return ZI._rj(ZI.KIT_STASH_KEY, {}); };
ZI.chargeTotals = function() {
  const base = ZI.getBaseCharges(), out = { heal: base.heal, scout: base.scout, baseHeal: base.heal, baseScout: base.scout, kitHeal: 0, kitScout: 0 };
  ZI.getCarried().forEach(e => {
    const k = ZI.ACTIVE_TABLE.charges.kit[e.id]; if (!k) return;
    const c = e.charges == null ? k.charges * (e.qty || 1) : e.charges;
    out[k.kind] += c; out[k.kind === 'heal' ? 'kitHeal' : 'kitScout'] += c;
  });
  return out;
};
// Spend one charge of a kind: base first, then the carried kit with the fewest charges left.
// Returns { ok, source, fumbled, reason }. A fumble still spends the charge (spec 9.1).
ZI.spendCharge = function(kind, rng) {
  rng = rng || Math.random;
  const base = ZI.getBaseCharges(); let source = null;
  if (base[kind] > 0) { base[kind]--; ZI._wj(ZI.CHARGES_KEY, base); source = 'base'; }
  else {
    const car = ZI.getCarried();
    const idx = car.map((e, i) => ({ e, i })).filter(x => { const k = ZI.ACTIVE_TABLE.charges.kit[x.e.id]; return k && k.kind === kind && (x.e.charges == null ? 1 : x.e.charges) > 0; })
      .sort((a, b) => (a.e.charges == null ? ZI.kitFull(a.e.id) : a.e.charges) - (b.e.charges == null ? ZI.kitFull(b.e.id) : b.e.charges))[0];
    if (!idx) return { ok:false, reason:'No ' + kind + ' charges left.' };
    const e = idx.e; if (e.charges == null) e.charges = ZI.kitFull(e.id);
    e.charges--; source = e.id;
    if (e.charges <= 0) car.splice(idx.i, 1);           // an empty kit is removed
    ZI.saveCarried(car);
  }
  const fumble = ZI.stressStage().fumble;
  if (fumble > 0 && rng() * 100 < fumble) return { ok:false, fumbled:true, source, reason:'Your hands shake — the charge is wasted.' };
  return { ok:true, source };
};
// Carrying integration: kits are single-entry items (1 pocket each) that keep their own charges.
(function() {
  ['medkit', 'scout_kit'].forEach(id => { const g = ZI.getGearItem(id); if (g) g.stackLimit = 1; });
  const take = ZI.takeToCarried, put = ZI.putBackToStash;
  ZI.takeToCarried = function(id, qty) {
    if (!ZI.isKit(id)) return take(id, qty);
    qty = Math.max(1, Math.floor(qty || 1)); let last = null;
    // All-or-nothing: validate the whole request before moving any kit (each kit is its own carried entry).
    const fail = (r) => { ZI.reportCarryRefusal && ZI.reportCarryRefusal(r); return { ok:false, reason:r }; };
    if (!ZI.atBaseOrCamp()) return fail(ZI.CARRY_BASE_ONLY_MSG);
    const have = ZI.stashCount(id); if (have < qty) return fail('Only ' + have + ' in the stash.');
    const g = ZI.getGearItem(id); if (!g) return fail('Unknown item.');
    const sim = ZI.getCarried().concat(Array.from({ length: qty }, () => ({ id, qty: 1 })));
    const t = ZI.carryTotals(null, sim);
    if (t.pocketsUsed > t.pocketsMax) return fail('No free pocket (' + t.pocketsUsed + '/' + t.pocketsMax + ').');
    if (t.loadKg > t.hardLimitKg) return fail('Too heavy: ' + t.loadKg + ' kg is over the ' + t.hardLimitKg + ' kg limit.');
    for (let i = 0; i < qty; i++) {
      last = take(id, 1); if (!last.ok) return last;
      const car = ZI.getCarried(), e = car[car.length - 1];
      const parts = ZI.getKitStashPartials(), list = parts[id] || [];
      e.charges = list.length ? list.pop() : ZI.kitFull(id);
      parts[id] = list; ZI._wj(ZI.KIT_STASH_KEY, parts); ZI.saveCarried(car);
    }
    return last;
  };
  ZI.putBackToStash = function(id, qty) {
    if (!ZI.isKit(id)) return put(id, qty);
    qty = Math.max(1, Math.floor(qty || 1)); let last = null;
    for (let i = 0; i < qty; i++) {
      // Put back the most-used kit of that type first, so full kits stay with the survivor.
      const car = ZI.getCarried(); let at = -1, best = Infinity; car.forEach((e, j) => { if (e.id !== id) return; const c = e.charges == null ? ZI.kitFull(id) : e.charges; if (c <= best) { best = c; at = j; } });
      if (at < 0) return last || put(id, 1);
      const charges = car[at].charges == null ? ZI.kitFull(id) : car[at].charges;
      if (!ZI.atBaseOrCamp || !ZI.atBaseOrCamp()) return put(id, 1); // same base/camp refusal path
      car.splice(at, 1); ZI.saveCarried(car);
      const st = ZI.getStash(); st.push(id); ZI.saveStash(st);
      if (charges < ZI.kitFull(id)) { const parts = ZI.getKitStashPartials(); (parts[id] = parts[id] || []).push(charges); ZI._wj(ZI.KIT_STASH_KEY, parts); }
      last = { ok:true };
    }
    return last;
  };
})();

// ─── DISCOVERY PROMPTS (spec 13.2) ────────────────────────────────────────────
ZI.discoveryRiskTier = function(siteId, state) {
  const A = ZI.ACTIVE_TABLE, site = A.sites[siteId], S = A.riskScore;
  const z = ZI.getTravZone ? ZI.getTravZone() : null;
  const eff = site.checks.reduce((a, k) => a + ZI.effectiveLevel(k), 0) / site.checks.length;
  const score = site.siteTier * S.perSiteTier + ((z && z.difficulty) || 1) * S.perZoneDifficulty + ((state && state.pressure) || 0) * S.perPressure - eff * S.perSkillLevel;
  let t = 0; S.thresholds.forEach(th => { if (score >= th) t++; });
  return Math.min(3, t);
};
// Label the player sees: Stressed reads one step worse (display only); a scout shows the true label.
ZI.promptLabelTier = function(p) { return p.scouted ? p.riskTier : Math.min(3, p.riskTier + ZI.stressStage().riskShift); };
ZI.createPrompt = function(state, rng) {
  const A = ZI.ACTIVE_TABLE, w = A.discoveryWeights;
  const tot = Object.values(w).reduce((a, b) => a + b, 0); let r = rng() * tot, siteId = 'campsite';
  for (const k of Object.keys(w)) { r -= w[k]; if (r < 0) { siteId = k; break; } }
  const site = A.sites[siteId];
  const p = { id: 'd' + Math.floor(rng() * 1e9), site: siteId, name: site.name, riskTier: ZI.discoveryRiskTier(siteId, state),
              timerSec: site.timerSec, expiresInMs: site.timerSec * 1000, createdLive: !!ZI.wanderMounted, scouted: false, scoutLevel: 0 };
  state.prompt = p;
  return p;
};
ZI.policyPromptDefault = function(p) {
  const pol = ZI.getPolicy().id, max = ZI.ACTIVE_TABLE.policyVentureMax[pol];
  return ZI.promptLabelTier(p) <= (max == null ? 0 : max) ? 'venture' : 'moveon';
};
// Resolve the pending prompt. choice: 'venture' | 'moveon' | null (= timed out → policy default).
ZI.resolvePrompt = function(state, choice, away, rng) {
  const A = ZI.ACTIVE_TABLE, p = state.prompt; if (!p) return null;
  state.prompt = null;
  const byPolicy = !choice; if (!choice) choice = ZI.policyPromptDefault(p);
  const label = A.riskLabels[p.riskTier];
  const ev = { kind:'discovery', site: p.name, risk: label, decision: choice, byPolicy, outcome: null, text: '' };
  if (choice === 'moveon') {
    ZI.emitAction && ZI.emitAction('discover', A.xp.moveOnScale);
    ev.outcome = 'moved on'; ev.text = `${p.name}: moved on.`;
  } else {
    const roll = Math.floor(rng() * 100) + 1, odds = A.riskOdds[p.riskTier];
    if (roll <= odds) {
      const mult = A.rewardMult[p.riskTier], site = A.sites[p.site];
      const mats = Math.round(site.mats * mult);
      const loot = { name: site.name + ' cache', value: Math.round(site.lootValue * mult), rarity: A.rewardRarity[p.riskTier] };
      state.mats = (state.mats || 0) + mats; if (!ZI.simPickup(state, loot)) loot.leftBehind = true;
      ZI.emitAction && (ZI.emitAction('loot', 1 + p.riskTier), ZI.emitAction('discover', A.xp.ventureScale));
      ev.outcome = 'success'; ev.mats = mats; ev.loot = loot;
      ev.text = `${p.name} (${label}): ventured — found ${loot.name} ◆${loot.value} and ${mats} mats.`;
    } else {
      const pen = A.failPenalty[p.riskTier], R = ZI.WANDER_REST_TABLE;
      const hpLoss = Math.round(R.maxHp * pen.hpPct / 100);
      state.hp = Math.max(1, state.hp - hpLoss); if (away) away.dmgTaken = (away.dmgTaken || 0) + hpLoss;
      const lost = ZI.loseHaul(state, pen.haulLoss, rng);
      ZI.WanderSim._stress(state, A.stress.failedVenture, away);
      ev.outcome = 'failed'; ev.hpLoss = hpLoss; ev.lost = lost;
      ev.text = `${p.name} (${label}): ventured and it went wrong — −${hpLoss} HP${lost.length ? ', lost ' + lost.join(', ') : ''}.`;
      if (state.hp <= 1 && hpLoss > 0) { // FX1 (U5): a failed venture that brings HP to 1 Downs the survivor
        const d = ZI.WanderSim._downed(state, rng, away); ev.downed = d.outcome;
        if (d.outcome === 'healed') ev.text += ` Downed — patched up (${d.healSource === 'base' ? 'base charge' : 'med kit'}).`;
        else if (d.outcome === 'revived') ev.text += ' Downed — Revenant Infusion triggers.';
        else { ev.fr = d.fr; ev.text += ' ' + (d.fr ? ZI.forcedRetreatText(d.fr) : 'Downed — forced retreat.'); }
      }
      if (pen.ambush && ev.downed !== 'forcedRetreat') {
        ZI.WanderSim._stress(state, A.stress.ambush, away);
        const amb = ZI.WanderSim.step(state, rng); ev.ambush = amb; if (away && amb && amb.dmgTaken) away.dmgTaken = (away.dmgTaken || 0) + amb.dmgTaken;
        ev.text += ` Ambushed: ${amb.enemy} (${amb.outcome}).`;
      }
    }
  }
  if (away) { away.discoveries = (away.discoveries || []).concat([{ site: ev.site, risk: ev.risk, decision: ev.decision, byPolicy, outcome: ev.outcome }]); }
  return ev;
};
// Remove up to n random eligible (non-story) haul items. Returns their names.

// Generic haul loss used by discovery failure penalties (spec 13.5) — not Forced Retreat, which has its own path.
ZI.loseHaul = function(state, n, rng) {
  const out = []; const h = state.carried || [];
  for (let i = 0; i < n; i++) {
    const elig = h.map((x, j) => j).filter(j => !(h[j] && (h[j].isStory || (ZI.getGearItem(h[j].id || '') || {}).isStory)));
    if (!elig.length) break;
    const j = elig[Math.floor(rng() * elig.length)]; out.push(h[j].name || h[j].id); h.splice(j, 1);
  }
  state.carried = h; return out;
};

// ─── RUN STATE: pressure, withdrawal, stress hooks inside the shared simulation ─
// Decision 3: a pending discovery is not dropped silently — it is recorded as left behind (no Move on XP).
ZI.endRunState = function(state, reason) {
  if (state.prompt) state._leftBehind = (state._leftBehind || []).concat([{ site: state.prompt.name, risk: ZI.ACTIVE_TABLE.riskLabels[state.prompt.riskTier], reason: reason || 'rest' }]);
  state.pressure = 0; state.withdrawing = false; state.withdrawLeftM = 0; state.lowHpStressed = false; state.prompt = null;
  state.retreatSnoozes = {}; state.retreatHold = null; state.withdrawCauses = null; // R1: run-scoped, cleared on every run-ending path
  state.retreatEvade = 0; state.retreatEvadeRolled = false; // getaway buff lasts until the next checkpoint (= arrival)
};
(function() {
  const WS = ZI.WanderSim, baseMove = WS._move;
  WS._stress = function(state, d, away) { if (d) WS._stressU(state, Math.round(d * ZI.STRESS_UNITS), away); };
  WS._stressU = function(state, du, away, rateScaled) {
    if (!du) return;
    if (du > 0 && !rateScaled && state && ZI.isOverloaded(state)) du = Math.round(du * ZI.ACTIVE_TABLE.load.overloadStressMult);
    const before = ZI.getStress(), after = ZI.addStressUnits(du);
    if (away) { if (away.stressStart == null) away.stressStart = before; away.stressEnd = after; }
    // Breaking fix: the instant stress reaches 100 (from any source), Breaking is due before any more time passes.
    // The shared simulation resolves it at the very next point (a zero-length segment), so recovery can't run first.
    if (state && !state.resting && ZI.getStressState().u >= ZI.ACTIVE_TABLE.stress.max * ZI.STRESS_UNITS) state._breakPending = true;
  };
  // B9: instant stress (low HP) is applied at the moment HP dropped, before any time passes or the next segment is
  // measured, so it never depends on how elapsed time was chunked. (It used to wait for the end of the next
  // walking segment; recovery clamped at 0 in between differed between 1-s beats and one bulk catch-up.)
  WS._beforeSegment = function(state, away) {
    const S = ZI.ACTIVE_TABLE.stress;
    if (!state.resting && !state.lowHpStressed && state.hp < ZI.WANDER_REST_TABLE.maxHp * S.lowHpPct / 100) { state.lowHpStressed = true; WS._stress(state, S.lowHpOnce, away); }
  };
  // Walking stress rate for this run state: positive rates are ×1.15 while overloaded (applied to the per-ms rate,
  // so the total is exact and chunk-independent).
  WS._walkStressRateFor = function(state) { const r = WS._walkStressRate(); return r > 0 && ZI.isOverloaded(state) ? Math.round(r * ZI.ACTIVE_TABLE.load.overloadStressMult) : r; };
  // Stress rate (units per ms) while walking the current cell.
  WS._walkStressRate = function() {
    const S = ZI.ACTIVE_TABLE.stress, z = ZI.getTravZone ? ZI.getTravZone() : null;
    const fam = z && z.gx != null && ZI.cellFamiliarity ? ZI.cellFamiliarity(z.gx, z.gy) : 'cleared';
    return ZI.stressUnitsPerMsFromPerMin(fam === 'cleared' ? S.clearedPerMin : fam === 'explored' ? S.exploredPerMin : S.unexploredPerMin);
  };
  WS._syncWithdrawUm = function(state) {
    if (state.withdrawLeftUm == null || Math.abs(state.withdrawLeftUm / 1e6 - (state.withdrawLeftM || 0)) > 1e-6) state.withdrawLeftUm = Math.round((state.withdrawLeftM || 0) * 1e6);
  };
  // Withdrawal arrival is an exact boundary: the walking segment ends at the arrival moment (after any Change Route
  // travel step still owed), and the remaining time is then processed in the new state (rest).
  WS._msToArrive = function(state) {
    if (!state.withdrawing || state.resting) return Infinity;
    WS._syncWithdrawUm(state);
    if (state.withdrawLeftUm <= 0) return 0;
    const rate = Math.round((state.moveSpeed || 3) * ZI.overloadSpeedMult(state) * 1000); // µm per ms
    return (state.stallMs > 0 ? state.stallMs : 0) + Math.ceil(state.withdrawLeftUm / rate);
  };
  // B9: walking segments end exactly when stress reaches Breaking, so it happens at the same simulated moment for any chunking.
  WS._msToBreak = function(state) {
    if (state.resting) return Infinity;
    const rem = ZI.ACTIVE_TABLE.stress.max * ZI.STRESS_UNITS - ZI.getStressState().u;
    if (state._breakPending || rem <= 0) return 0;
    const r = WS._walkStressRateFor(state); if (r <= 0) return Infinity;
    return rem <= 0 ? 0 : Math.ceil(rem / r);
  };
  // Walking: stress by familiarity of the current cell; withdrawal walks back instead of forward.
  WS._move = function(state, ms, away, events, rng) {
    const S = ZI.ACTIVE_TABLE.stress;
    WS._beforeSegment(state, away);
    if (state._breakPending) return; // Breaking resolves before any recovery or movement
    WS._stressU(state, WS._walkStressRateFor(state) * ms, away, true);
    if (state.stallMs > 0) { const used = Math.min(state.stallMs, ms); state.stallMs -= used; ms -= used; if (ms <= 0) return; }
    const f = ZI.overloadSpeedMult(state), sp0 = state.moveSpeed || 3;
    if (state.withdrawing) {
      // Remaining distance in whole micrometres, so arrival lands on the same simulated moment for any chunking.
      WS._syncWithdrawUm(state);
      state.withdrawLeftUm = Math.max(0, state.withdrawLeftUm - Math.round(sp0 * f * 1000) * ms);
      state.withdrawLeftM = state.withdrawLeftUm / 1e6;
      return;
    }
    state.moveSpeed = sp0 * f; try { return baseMove(state, ms, away, events, rng); } finally { state.moveSpeed = sp0; }
  };
  // After each walking segment: low-HP stress, arrival at safety, Breaking.
  WS._afterSegment = function(state, away, events, rng) {
    const S = ZI.ACTIVE_TABLE.stress, R = ZI.WANDER_REST_TABLE;
    ZI.flushTooHeavy(state, away, events);
    WS._flushLeftBehind(state, away, events);
    if (!state.lowHpStressed && state.hp < R.maxHp * S.lowHpPct / 100) { state.lowHpStressed = true; WS._stress(state, S.lowHpOnce, away); }
    if (state.withdrawing && state.withdrawLeftM <= 0) {
      const ev = { kind:'withdrawn', banked: (state.carried || []).length, causes: state.withdrawCauses || null };
      if (ev.banked && ZI.bankWanderLoot) ZI.bankWanderLoot(state.carried);
      state.carried = []; ZI.endRunState(state, 'withdrew');
      state.resting = true; state.restAt = 'checkpoint'; state.restStartHp = Math.max(0, state.hp); state.restElapsedMs = 0;
      if (away) away.withdrawals = (away.withdrawals || 0) + 1;
      events.push(ev); return true;
    }
    if ((state._breakPending || ZI.getStress() >= S.max) && !state.resting) {
      state._breakPending = false;
      const fr = ZI.forcedRetreat(state, 'breaking', rng);   // Batch 3B: the one canonical Forced Retreat path
      ZI.recordForcedRetreat(away, fr);
      events.push(fr); return true;
    }
    return false;
  };
  WS._flushLeftBehind = function(state, away, events) {
    if (!state._leftBehind || !state._leftBehind.length) return;
    state._leftBehind.forEach(l => { events.push({ kind:'discovery', site: l.site, risk: l.risk, decision:'left behind', byPolicy:false, outcome:'left behind (' + l.reason + ')', text: `${l.site}: left behind (${l.reason}).` }); if (away) away.discoveries = (away.discoveries || []).concat([{ site: l.site, risk: l.risk, decision:'left behind', byPolicy:false, outcome:'left behind (' + l.reason + ')' }]); });
    state._leftBehind = [];
  };
  // Resting (checkpoint or Base): stress recovery per day through restBed().
  WS._onRest = function(state, ms, away) {
    const per = ZI.restStressPerDay(state.restAt);
    WS._stressU(state, -ZI.stressUnitsPerMsFromPerDay(per) * ms, away);
  };
})();

// ─── PLAYER ACTIONS (live only; the screen calls these, they mutate the run state) ─
ZI.wanderHeal = function(state, rng) {
  const r = ZI.spendCharge('heal', rng); if (!r.ok) return r;
  const R = ZI.WANDER_REST_TABLE, L = ZI.effectiveLevel('firstAid');
  const amt = Math.round(R.maxHp * ZI.STAT_FORMULAS.firstAidHealPercent(L) / 100);
  state.hp = Math.min(R.maxHp, state.hp + amt);
  ZI.emitAction && ZI.emitAction('heal', 1 + amt / 100);
  return { ok:true, source: r.source, healed: amt };
};
ZI.wanderScout = function(state, rng) {
  const p = state.prompt; if (!p) return { ok:false, reason:'Nothing to scout right now.' };
  if (p.scouted) return { ok:false, reason:'Already scouted.' };
  const r = ZI.spendCharge('scout', rng); if (!r.ok) return r;
  const A = ZI.ACTIVE_TABLE, L = ZI.effectiveLevel('discovery');
  p.scouted = true; p.scoutLevel = L;
  if (L >= A.scout.exactOddsLevel) { p.oddsShown = true; }
  if (L >= A.scout.reduceRiskLevel && p.riskTier > 0) { p.riskTier -= 1; p.reduced = true; } // D1: actual one-tier reduction
  ZI.emitAction && ZI.emitAction('scout', 1);
  return { ok:true, source: r.source, prompt: p };
};
ZI.wanderPushOn = function(state) {
  const P = ZI.ACTIVE_TABLE.push;
  if ((state.pressure || 0) >= P.maxPressure) return { ok:false, reason:'Already pushing as hard as you can (' + P.maxPressure + '/' + P.maxPressure + ').' };
  state.pressure = (state.pressure || 0) + 1;
  ZI.emitAction && ZI.emitAction('sneak', 1);
  return { ok:true, pressure: state.pressure };
};
ZI.wanderWithdraw = function(state) {
  if (state.withdrawing) return { ok:false, reason:'Already heading back.' };
  if (state.resting) return { ok:false, reason:'Already at base.' };
  if (state.retreatHold && ZI.retreatHoldResolve) return ZI.retreatHoldResolve(state, 'return', null, []);
  if (state.prompt) { state._leftBehind = (state._leftBehind || []).concat([{ site: state.prompt.name, risk: ZI.ACTIVE_TABLE.riskLabels[state.prompt.riskTier], reason: 'withdrew' }]); state.prompt = null; }
  state.withdrawing = true;
  state.withdrawLeftM = Math.max(0, (state.scroll || 0) - (state.lastCheckpoint || 0)); // decision 2: back to the last checkpoint (the excursion's safety point)
  ZI.emitAction && ZI.emitAction('move', 1);
  return { ok:true, meters: Math.round(state.withdrawLeftM) };
};
ZI.wanderChangeRoute = function(state) {
  const C = ZI.ACTIVE_TABLE.changeRoute;
  state.stallMs = (state.stallMs || 0) + C.moveStepSec * 1000;
  ZI.WanderSim._stress(state, C.stress, null);
  ZI.emitAction && ZI.emitAction('move', 1);
  return { ok:true };
};
// Return report rows for an away summary (spec 13.6): discoveries, retreats, stress, rusting skills.
ZI.returnReport = function(away) {
  const rows = [];
  (away.discoveries || []).forEach(d => rows.push(d.decision === 'left behind' ? `${d.site} (${d.risk}): ${d.outcome}.` : `${d.byPolicy ? 'Policy' : 'You'}: ${d.site} (${d.risk}) — ${d.decision === 'venture' ? 'ventured' : 'moved on'}, ${d.outcome}.`));
  (away.ruleWithdrawals || []).forEach(t => rows.push(t + '.'));
  if (away.withdrawals) rows.push(`Withdrew to safety ${away.withdrawals}×.`);
  (away.forcedRetreats || []).forEach(f => rows.push(ZI.forcedRetreatText(f)));
  if (away.stressStart != null && Math.abs((away.stressEnd || 0) - away.stressStart) >= 1) rows.push(`Stress ${Math.round(away.stressStart)} → ${Math.round(away.stressEnd)}.`);
  if (away.tooHeavy) rows.push(`Left behind (too heavy): ${away.tooHeavy} item${away.tooHeavy > 1 ? 's' : ''}.`);
  (ZI.PROFESSIONS || []).forEach(p => { const r = ZI.skillRust(p.id); if (r.state === 'rusty' || r.state === 'rusted') rows.push(`${p.name} is ${r.state === 'rusty' ? 'Rusty' : 'Rusted'}.`); });
  return rows;
};

// ─── SAVE MIGRATION v2 → v3 (adds data only) ─────────────────────────────────
// Stress starts at 0, base charges start full, and any carried kit stack is split into one entry per kit,
// each full (D3). No item is lost: total kit count is preserved.
ZI.SAVE_FORMAT.current = 3;
ZI.SAVE_MIGRATIONS[3] = function() {
  if (localStorage.getItem(ZI.STRESS_KEY) == null) ZI._wj(ZI.STRESS_KEY, { value: 0 });
  if (localStorage.getItem(ZI.CHARGES_KEY) == null) ZI.refillBaseCharges();
  const raw = ZI._rj('zi_carried', null); const car = raw && Array.isArray(raw.items) ? raw.items : (Array.isArray(raw) ? raw : null); if (!car) return;
  const out = [];
  car.forEach(e => {
    if (ZI.isKit(e.id)) { for (let i = 0; i < (e.qty || 1); i++) out.push({ id: e.id, qty: 1, charges: e.charges != null && (e.qty || 1) === 1 ? e.charges : ZI.kitFull(e.id) }); }
    else out.push(e);
  });
  ZI._wj('zi_carried', raw && raw.items ? Object.assign({}, raw, { items: out }) : { v: ZI.CARRIED_VER, items: out });
};

// Live screen helper: apply a player action to the saved run state and save it back.
ZI.wanderAct = function(fn) { const s = ZI.getWanderRun(); const r = fn(s); ZI.saveWanderRun(s); ZI._notifyInventory && ZI._notifyInventory(); return r; };

// Decision 1: automatic healing in the shared simulation spends the same Heal charges as the button.
// down=true: the survivor lost the fight and is healed back on their feet (same amount as a top-up).
ZI.simHeal = function(state, rng, down) {
  const r = ZI.spendCharge('heal', rng); if (!r.ok) return r;
  const R = ZI.WANDER_REST_TABLE, amt = Math.round(R.maxHp * ZI.STAT_FORMULAS.firstAidHealPercent(ZI.effectiveLevel('firstAid')) / 100);
  state.hp = Math.min(R.maxHp, (down ? 1 : state.hp) + amt);
  ZI.emitAction && ZI.emitAction('heal', 1 + amt / 100);
  return { ok:true, source: r.source, healed: amt };
};
// B12: an equipped consumable with effect.revive (e.g. Revenant Infusion) saves a downed survivor once, then is used up.
ZI.simRevive = function(state) {
  const lo = ZI.getLoadout(); let slot = null, g = null;
  Object.keys(lo).forEach(k => { const it = lo[k] && ZI.getGearItem(lo[k]); if (!slot && it && it.effect && it.effect.revive) { slot = k; g = it; } });
  if (!slot) return false;
  lo[slot] = null; ZI.saveLoadout(lo);
  state.hp = Math.max(1, Math.min(ZI.WANDER_REST_TABLE.maxHp, g.effect.revive));
  ZI.emitAction && ZI.emitAction('revive');
  return true;
};
// B13: timed combat buffs live in the one buff store (zi_active_buffs) and are read by simulated time.
ZI.combatBuffsAt = function(t) {
  let b; try { b = JSON.parse(localStorage.getItem(ZI.BUFF_KEY) || '[]'); } catch (e) { b = []; }
  const out = { dmgPct: 0, armorAdd: 0 };
  (b || []).forEach(x => { if (x.until > t && (x.from == null || x.from <= t)) { out.dmgPct += x.dmgPct || 0; out.armorAdd += x.armorAdd || 0; } });
  return out;
};

// ─── BATCH 3A: FIELD LOAD (spec 14.1, 14.4) ──────────────────────────────────
// Load = equipped + carried + story + this run's haul, read from the run state the simulation is advancing.
ZI.loadFor = function(state) { const t = ZI.carryTotals(null, null, state); return { kg: t.rawLoadKg, cap: t.capacityKg }; };
const ZI_G = (kg) => Math.round(kg * 1000); // compare in whole grams: exact at the 100% and 125% boundaries
ZI.isOverloaded = function(state) { const L = ZI.loadFor(state); return ZI_G(L.kg) > ZI_G(L.cap); };
// Speed: ×1.00 up to 100% load, falling linearly to ×0.75 at 125%; clamped at ×0.75 beyond (raised as a handoff).
ZI.overloadSpeedMult = function(state) {
  const L = ZI.loadFor(state), T = ZI.ACTIVE_TABLE.load; if (!(L.cap > 0) || ZI_G(L.kg) <= ZI_G(L.cap)) return 1;
  const span = (T.limitPct - 100) / 100, over = Math.min(span, L.kg / L.cap - 1);
  return 1 - (1 - T.speedAtLimit) * (over / span);
};
// Pick up one haul entry whole, or leave it behind if the resulting load would exceed 125% of capacity.
ZI.simPickup = function(state, item) {
  if (typeof item.weight !== 'number') item.weight = ZI.salvageWeight(item.value);
  const L = ZI.loadFor(state), lim = ZI_G(L.cap * ZI.ACTIVE_TABLE.load.limitPct / 100);
  if (ZI_G(L.kg) + ZI_G(item.weight) <= lim) { item.seq = ZI.nextPickupSeq(state); state.carried = (state.carried || []).concat([item]); return true; }
  state._tooHeavy = (state._tooHeavy || []).concat([item.name || 'item']);
  return false;
};
// Refused pickups become one log event each and one grouped return-report count.
ZI.flushTooHeavy = function(state, away, events) {
  if (!state._tooHeavy || !state._tooHeavy.length) return;
  const names = state._tooHeavy; state._tooHeavy = [];
  if (events) events.push({ kind:'tooHeavy', names });
  if (away) away.tooHeavy = (away.tooHeavy || 0) + names.length;
};
// Save migration v3 → v4 (adds data only): haul entries without a stored weight get it derived.
ZI.SAVE_FORMAT.current = 4;
ZI.SAVE_MIGRATIONS[4] = function() {
  const r = ZI._rj('zi_wander_run', null); if (!r || !Array.isArray(r.carried)) return;
  r.carried.forEach(e => { if (e && typeof e.weight !== 'number') e.weight = ZI.salvageWeight(e.value); });
  ZI._wj('zi_wander_run', r);
};
// Save migration v4 → v5 (Batch 3B, adds data only): haul entries get a pickup sequence from their saved order,
// starting at 0. Afterwards order comes only from the stored field (never from array position).
ZI.SAVE_FORMAT.current = 5;
ZI.SAVE_MIGRATIONS[5] = function() {
  const r = ZI._rj('zi_wander_run', null); if (!r || !Array.isArray(r.carried)) return;
  let next = 0; r.carried.forEach(e => { if (e && typeof e.seq === 'number') next = Math.max(next, e.seq + 1); });
  r.carried.forEach(e => { if (e && typeof e.seq !== 'number') e.seq = next++; });
  r.pickupSeq = next;
  ZI._wj('zi_wander_run', r);
};

// ═══ BATCH 3B — FORCED RETREAT (one canonical consequence path; see reference/batch3b-brief.md) ═══
ZI.FORCED_RETREAT_TABLE = { baseLossShare: 0.50, destination: 'Base' }; // [DECIDED] Normal values
// Converts the existing scavDropRate shape (0.90 → 0) into the 1 → 0 factor Forced Retreat needs (Oct 6 handoff).
ZI.STAT_FORMULAS.forcedRetreatScavFactor = function(L) { return Math.max(0, Math.min(1, this.scavDropRate(L) / this.DROP_MAX)); };
ZI.nextPickupSeq = function(state) {
  if (typeof state.pickupSeq !== 'number') { let n = 0; (state.carried || []).forEach(e => { if (e && typeof e.seq === 'number') n = Math.max(n, e.seq + 1); }); state.pickupSeq = n; }
  return state.pickupSeq++;
};
ZI._haulIsStory = function(e) { return !!(e && (e.isStory || (ZI.getGearItem(e.id || '') || {}).isStory)); };
ZI.forcedRetreatLossCount = function(N, factor) {
  // Tiny epsilon only absorbs float error in N × 0.5 × factor (e.g. 0.9/0.9); it never changes an exact count.
  const n = Math.floor(N * ZI.FORCED_RETREAT_TABLE.baseLossShare * factor + 1e-9);
  return Math.max(0, Math.min(N - 1, n));
};
// The single entry point. Order: snapshot Scavenging → snapshot haul + protected item → seeded loss selection →
// end run (pending discovery left behind, pressure 0) → remove lost / bank retained → cause-specific state →
// Base rest → one result object (the caller emits it once). Returns null if already resolved (exactly-once guard).
ZI.forcedRetreat = function(state, cause, rng) {
  if (state.resting) return null;
  const scav = ZI.effectiveLevel('scavenging');
  const factor = ZI.STAT_FORMULAS.forcedRetreatScavFactor(scav);
  const haul = (state.carried || []).slice();
  const elig = haul.map((e, i) => ({ e, seq: typeof e.seq === 'number' ? e.seq : i, v: Math.max(1, e.value || 1) })).filter(x => !ZI._haulIsStory(x.e));
  const N = elig.length;
  let prot = null; elig.forEach(x => { if (!prot || x.v > prot.v || (x.v === prot.v && x.seq < prot.seq)) prot = x; });
  const count = ZI.forcedRetreatLossCount(N, factor);
  const cand = elig.filter(x => x !== prot).sort((a, b) => a.seq - b.seq);
  const lostSet = new Set(), lost = [];
  for (let k = 0; k < count && cand.length; k++) { const x = cand.splice(Math.floor(rng() * cand.length), 1)[0]; lostSet.add(x.e); lost.push(x.e.name || x.e.id); }
  ZI.endRunState(state, 'forced retreat');
  const retained = haul.filter(e => !lostSet.has(e));
  if (retained.length && ZI.bankWanderLoot) ZI.bankWanderLoot(retained);
  state.carried = []; state._breakPending = false;
  if (cause === 'breaking') ZI.setStress(ZI.ACTIVE_TABLE.stress.shakenFloor);
  state.resting = true; state.restAt = 'base'; state.restStartHp = Math.max(0, state.hp); state.restElapsedMs = 0;
  return { kind: cause === 'breaking' ? 'breaking' : 'forcedRetreat', forcedRetreat: true, cause, destination: ZI.FORCED_RETREAT_TABLE.destination,
    eligible: N, lost, lostCount: lost.length, kept: prot ? (prot.e.name || prot.e.id) : null, banked: retained.length,
    scavenging: scav, shaken: cause === 'breaking', hp: state.hp, stress: ZI.getStress() };
};
ZI.recordForcedRetreat = function(away, fr) {
  if (!away || !fr) return;
  away.forcedRetreats = (away.forcedRetreats || []).concat([{ cause: fr.cause, eligible: fr.eligible, lostCount: fr.lostCount, kept: fr.kept, banked: fr.banked, shaken: fr.shaken }]);
  if (fr.cause === 'breaking') { away.breakings = (away.breakings || 0) + 1; away.stressEnd = ZI.ACTIVE_TABLE.stress.shakenFloor; }
  else away.downedRetreats = (away.downedRetreats || 0) + 1;
};
ZI.forcedRetreatText = function(f) {
  const why = f.cause === 'breaking' ? 'Broke under stress' : 'Downed with no healing left';
  return `Forced retreat — ${why}: lost ${f.lostCount} of ${f.eligible} haul item${f.eligible === 1 ? '' : 's'}${f.kept ? `, kept ${f.kept}` : ''}; ${f.banked} banked at Base${f.shaken ? '; Shaken (stress ' + ZI.ACTIVE_TABLE.stress.shakenFloor + ')' : ''}.`;
};

// ═══ BATCH R1 — step 1 (additive): Retreat Rules settings, data table, save v6 (reference/r1-brief.md) ═══
// Steps 2–4 (rule checks, HOLD, resume gate) are wired in below the migration.
ZI.RETREAT_RULES_TABLE = {
  order: ['hp', 'stress', 'load'],                       // fixed priority HP → Stress → Load
  defaults: { hpFloorPct: 30, hpOff: false, stressCeiling: 85, stressOff: false, loadLimitPct: 115, loadIgnore: false },
  ranges: { hpFloorPct: [10, 60], stressCeiling: [71, 95], loadLimitPct: [100, 125] }, // PF1 (Sam, Oct 16): floor 71, was 51
  stressClampFloor: 71,                                  // ≤ 70 or malformed → 71 (hysteresis above resume < 70; was 51 / < 50)
  snoozeStep: { stress: 10, loadPct: 10, hpPct: 10 },
  promptSec: 20,
  resume: { hpPct: 80, stressBelow: 70 },               // PF1 (Sam, Oct 16): resume while Strained, not Stressed (was < 50)
  checkpointRestBed: 'bedroll',                           // checkpoint rest fixed at the Bedroll rate (addendum)
  watchMaxLagMs: 2000,                                    // a chunk longer than this is catch-up, never "watching"
};
ZI.RETREAT_RULES_KEY = 'zi_retreat_rules';
ZI.validateRetreatRules = function(raw) {
  const T = ZI.RETREAT_RULES_TABLE, D = T.defaults, R = T.ranges, r = raw && typeof raw === 'object' ? raw : {};
  const clamp = (v, [lo, hi]) => Math.max(lo, Math.min(hi, Math.round(v)));
  const num = (v) => typeof v === 'number' && isFinite(v);
  const out = {
    hpOff: r.hpOff === true, stressOff: r.stressOff === true, loadIgnore: r.loadIgnore === true,
    hpFloorPct: num(r.hpFloorPct) ? clamp(r.hpFloorPct, R.hpFloorPct) : D.hpFloorPct,
    loadLimitPct: num(r.loadLimitPct) ? clamp(r.loadLimitPct, R.loadLimitPct) : D.loadLimitPct,
  };
  if (r.stressCeiling === undefined || r.stressCeiling === null) out.stressCeiling = D.stressCeiling;   // missing → 85
  else if (!num(r.stressCeiling) || r.stressCeiling <= T.resume.stressBelow) out.stressCeiling = T.stressClampFloor; // ≤ 70 / malformed → 71
  else out.stressCeiling = clamp(r.stressCeiling, R.stressCeiling);
  return out;
};
ZI.getRetreatRules = function() { return ZI.validateRetreatRules(ZI._rj(ZI.RETREAT_RULES_KEY, null)); };
ZI.setRetreatRules = function(patch) { const v = ZI.validateRetreatRules(Object.assign(ZI.getRetreatRules(), patch || {})); ZI._wj(ZI.RETREAT_RULES_KEY, v); return v; };
// Save migration v5 → v6 (R1, adds data only): validated default settings; runs get empty snoozes and no HOLD.
ZI.SAVE_FORMAT.current = 6;
ZI.SAVE_MIGRATIONS[6] = function() {
  ZI._wj(ZI.RETREAT_RULES_KEY, ZI.validateRetreatRules(ZI._rj(ZI.RETREAT_RULES_KEY, null)));
  const r = ZI._rj('zi_wander_run', null); if (!r) return;
  if (!r.retreatSnoozes) r.retreatSnoozes = {};
  if (r.retreatHold === undefined) r.retreatHold = null;
  if (r.withdrawCauses === undefined) r.withdrawCauses = null;
  ZI._wj('zi_wander_run', r);
};

// ═══ BATCH R1 — steps 2–4: rule checks, HOLD prompt, resume gate (reference/r1-brief.md A, C, D, E, F, H) ═══
ZI._session = 's' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8); // a saved HOLD from another page load is never resumed
ZI.RETREAT_RULE_TEXT = {
  hp:     { primary:'Low HP',      short:'HP',     warn:'health', unit:'%', prompt:(v) => `Low HP (${v}%), no heals left: bank and return?` },
  stress: { primary:'High stress', short:'Stress', warn:'stress', unit:'',  prompt:(v) => `Stress high (${v}): bank and return?` },
  load:   { primary:'Pack heavy',  short:'Load',   warn:'load',   unit:'%', prompt:(v) => `Pack heavy (${v}%): bank and return?` },
};
// Watching = the real Wandering screen is mounted, laid out, not inside a hidden/inert copy, and the page is foreground-visible.
ZI.retreatWatching = function() {
  try {
    const el = ZI._wanderWatchEl;
    return !!(ZI.wanderMounted && el && el.isConnected && document.visibilityState === 'visible' && !document.hidden
      && !(el.closest && el.closest('[aria-hidden="true"],[inert]')) && el.getClientRects().length > 0);
  } catch (e) { return false; }
};
// Exact integer HP comparison (check 24): hp × 100 < floor% × maxHp. Exactly at the floor does not fire.
ZI.retreatHpBelow = function(hp, maxHp, floorPct) { return hp * 100 < floorPct * maxHp; };
ZI._stressRuleThrU = function(state, rr) {
  const sn = state.retreatSnoozes && state.retreatSnoozes.stress;
  return sn ? sn.u : rr.stressCeiling * ZI.STRESS_UNITS;
};
// Every rule true right now, in the fixed priority order (never UI or key order). Respects Off/Ignore and snoozes.
ZI.retreatRulesTrue = function(state) {
  const rr = ZI.getRetreatRules(), sn = state.retreatSnoozes || {}, out = [], maxHp = ZI.WANDER_REST_TABLE.maxHp;
  ZI.RETREAT_RULES_TABLE.order.forEach(rule => {
    if (rule === 'hp') {
      if (rr.hpOff || ZI.chargeTotals().heal > 0) return;
      const hp = state.hp, hit = sn.hp ? hp * 100 < sn.hp.x100 : ZI.retreatHpBelow(hp, maxHp, rr.hpFloorPct);
      if (hit) out.push({ rule, value: hp * 100 / maxHp });
    } else if (rule === 'stress') {
      if (rr.stressOff) return;
      const u = ZI.getStressState().u;
      if (u >= ZI._stressRuleThrU(state, rr)) out.push({ rule, value: u / ZI.STRESS_UNITS });
    } else if (rule === 'load') {
      if (rr.loadIgnore) return;
      const L = ZI.loadFor(state), g = ZI_G(L.kg), c = ZI_G(L.cap); if (!(c > 0)) return;
      const hit = sn.load ? g * 100 * sn.load.c >= sn.load.x * c : g * 100 >= rr.loadLimitPct * c;
      if (hit) out.push({ rule, value: g * 100 / c });
    }
  });
  return out;
};
ZI.retreatFmt = function(rule, v) { return Math.floor(v + 1e-9) + ZI.RETREAT_RULE_TEXT[rule].unit; };
ZI.retreatWithdrawText = function(causes) {
  const T = ZI.RETREAT_RULE_TEXT, also = causes.also || [];
  return 'Withdrew: ' + T[causes.primary.rule].primary + (also.length ? ' (also: ' + also.map(a => T[a.rule].short + ' ' + ZI.retreatFmt(a.rule, a.value)).join(', ') + ')' : '');
};
ZI.retreatPromptText = function(c) { return ZI.RETREAT_RULE_TEXT[c.rule].prompt(Math.floor(c.value + 1e-9)); };
// Snooze from the current value, unclamped (E): stress +10, load +10 points, HP −10 points.
ZI.retreatSnoozeFor = function(state, rule) {
  const S = ZI.RETREAT_RULES_TABLE.snoozeStep, maxHp = ZI.WANDER_REST_TABLE.maxHp;
  if (rule === 'stress') { const u = ZI.getStressState().u; return { u: u + S.stress * ZI.STRESS_UNITS, value: u / ZI.STRESS_UNITS + S.stress }; }
  if (rule === 'load') { const L = ZI.loadFor(state), g = ZI_G(L.kg), c = ZI_G(L.cap); return { x: g * 100 + S.loadPct * c, c, value: g * 100 / c + S.loadPct }; }
  return { x100: state.hp * 100 - S.hpPct * maxHp, value: state.hp * 100 / maxHp - S.hpPct };
};
ZI.retreatSnoozeReachable = function(rule, sn) {
  if (rule === 'stress') return sn.value < ZI.ACTIVE_TABLE.stress.max;
  if (rule === 'load') return sn.value <= ZI.ACTIVE_TABLE.load.limitPct;
  return sn.value > 0;
};
ZI.retreatSnoozeText = function(rule, sn) {
  const w = ZI.RETREAT_RULE_TEXT[rule].warn;
  return ZI.retreatSnoozeReachable(rule, sn) ? `Next ${w} warning at ${Math.round(sn.value)}${ZI.RETREAT_RULE_TEXT[rule].unit}` : `No more ${w} warnings this run`;
};
// Start the existing voluntary withdrawal (never a Forced Retreat) and record its causes as ONE event (F).
ZI.retreatBeginWithdrawal = function(state, causes, away, events, rng) {
  events = events || [];
  ZI.wanderWithdraw(state);
  const gw = ZI.retreatEvadeRoll(state, rng || Math.random, events); // automatic withdrawals also try a getaway                                   // existing path: last checkpoint; open discovery → left behind (withdrew)
  state.withdrawCauses = { primary: causes.primary, also: causes.also || [] };
  ZI.WanderSim._flushLeftBehind(state, away, events);
  const ev = { kind:'ruleWithdraw', primary: causes.primary.rule, also: (causes.also || []).map(a => a.rule), text: ZI.retreatWithdrawText(causes), stressU: ZI.getStressState().u, scrollUm: state.scrollUm };
  events.push(ev);
  if (away) away.ruleWithdrawals = (away.ruleWithdrawals || []).concat([ev.text]);  // the return report reads the same text
  if (gw) { events.splice(events.indexOf(gw), 1); events.push(gw); } // getaway line follows the withdrawal line
  return ev;
};
// Resolve an open HOLD. choice: 'return' | 'timeout' | 'cancel' (watching stopped) → withdraw; 'pushon' → snooze + resume.
ZI.retreatHoldResolve = function(state, choice, away, events, rng) {
  const h = state.retreatHold; if (!h) return { ok:false, reason:'No retreat prompt is open.' };
  events = events || []; state.retreatHold = null;
  if (choice === 'pushon') {
    const sn = state.retreatSnoozes = Object.assign({}, state.retreatSnoozes || {}), parts = [];
    ZI.retreatRulesTrue(state).forEach(c => { sn[c.rule] = ZI.retreatSnoozeFor(state, c.rule); parts.push(ZI.retreatSnoozeText(c.rule, sn[c.rule])); });
    const ev = { kind:'retreatPushOn', text: 'Pushed on.' + (parts.length ? ' ' + parts.join(' · ') + '.' : '') };
    events.push(ev); return Object.assign({ ok:true }, ev);
  }
  const ev = ZI.retreatBeginWithdrawal(state, h, away, events, rng);
  const gw = events.find(e => e.kind === 'retreatEvade');
  return Object.assign({ ok:true, choice }, ev, gw ? { evade: gw, text: ev.text + '. ' + gw.text } : {});
};
(function() {
  const WS = ZI.WanderSim;
  const breakingNow = (state) => state._breakPending || ZI.getStressState().u >= ZI.ACTIVE_TABLE.stress.max * ZI.STRESS_UNITS;
  // A1/C1: rules are checked only during normal field activity (not withdrawing, resting, or in HOLD); Breaking goes first.
  WS._ruleCheck = function(state, away, events, watching, rng) {
    if (!state.active || state.resting || state.withdrawing || state.retreatHold || breakingNow(state)) return false;
    const tr = ZI.retreatRulesTrue(state); if (!tr.length) return false;
    const causes = { primary: tr[0], also: tr.slice(1) };
    if (!watching) { ZI.retreatBeginWithdrawal(state, causes, away, events, rng); return true; }
    let interrupted = null;
    if (state.prompt) { interrupted = { site: state.prompt.name, risk: ZI.ACTIVE_TABLE.riskLabels[state.prompt.riskTier], reason:'withdrew' }; state._leftBehind = (state._leftBehind || []).concat([interrupted]); state.prompt = null; }
    WS._flushLeftBehind(state, away, events);                 // the discovery closes first; the two never show together
    state.retreatHold = { primary: causes.primary, also: causes.also, expiresInMs: ZI.RETREAT_RULES_TABLE.promptSec * 1000, text: ZI.retreatPromptText(causes.primary), interrupted, session: ZI._session };
    events.push({ kind:'retreatHold', text: state.retreatHold.text, primary: causes.primary.rule });
    return true;
  };
  // H: the stress rule (or its snoozed threshold) is an exact boundary while stress rises continuously.
  WS._msToRule = function(state) {
    if (!state.active || state.resting || state.withdrawing || state.retreatHold) return Infinity;
    const rr = ZI.getRetreatRules(); if (rr.stressOff) return Infinity;
    const thr = ZI._stressRuleThrU(state, rr), u = ZI.getStressState().u; if (u >= thr) return Infinity;
    const r = WS._walkStressRateFor(state); if (r <= 0) return Infinity;
    return Math.ceil((thr - u) / r);
  };
  // C2: HOLD. Paused: movement, encounters, discovery rolls, travel stress. Running: the timer, simulated clock (buffs),
  // cleared-ground recovery. Breaking cancels HOLD and runs the Forced Retreat at once. Not watching → withdraw now.
  WS._holdStep = function(state, left, away, events, rng, watching) {
    const h = state.retreatHold;
    if (breakingNow(state)) {
      state._breakPending = false;
      const fr = ZI.forcedRetreat(state, 'breaking', rng); state.retreatHold = null;
      if (fr) { ZI.recordForcedRetreat(away, fr); events.push(fr); }
      return 0;
    }
    if (!watching || h.session !== ZI._session) { ZI.retreatHoldResolve(state, 'cancel', away, events, rng); return 0; }
    const seg = Math.max(0, Math.min(h.expiresInMs, left)), rate = Math.min(0, WS._walkStressRateFor(state));
    if (rate < 0 && seg > 0) WS._stressU(state, rate * seg, away, true);
    h.expiresInMs -= seg; state._simNow = (state._simNow || 0) + seg;
    if (h.expiresInMs <= 0) ZI.retreatHoldResolve(state, 'timeout', away, events, rng);
    return seg;
  };
  // D/H: rest ends only when HP ≥ 80% AND stress < 70 (RETREAT_RULES_TABLE.resume; PF1, Oct 16). Both are exact boundaries (whole milliseconds).
  WS._restNeedMs = function(state) {
    const R = ZI.WANDER_REST_TABLE, G = ZI.RETREAT_RULES_TABLE.resume, U = ZI.STRESS_UNITS;
    const ratePerMs = R.maxHp * R.restHpPerMinutePct / 100 / 60000, target = R.maxHp * G.hpPct / 100;
    const start = state.restStartHp == null ? state.hp : state.restStartHp;
    const hpTotal = start >= target ? 0 : Math.ceil((target - start) / ratePerMs);
    const hpNeed = Math.max(0, hpTotal - (state.restElapsedMs || 0));
    const sRate = ZI.stressUnitsPerMsFromPerDay(ZI.restStressPerDay(state.restAt)), thr = G.stressBelow * U, u = ZI.getStressState().u;
    let sNeed = 0;
    if (u >= thr) {
      if (!(sRate > 0)) sNeed = Infinity;
      else { let k = Math.floor((u - thr) / sRate) + 1; while (k > 1 && u - (k - 1) * sRate < thr) k--; while (u - k * sRate >= thr) k++; sNeed = k; }
    }
    return { need: Math.max(hpNeed, sNeed), hpTotal, start, target, ratePerMs };
  };
  WS._restStep = function(state, left, away, events) {
    WS._flushLeftBehind(state, away, events);               // a discovery interrupted by the run ending is reported at once
    { // FX5 (PF2): a heal used while resting raised HP above the rest curve; restart the curve from the healed HP so the next step keeps it
      const q = WS._restNeedMs(state), el = state.restElapsedMs || 0;
      const cur = q.start >= q.target ? q.start : (el >= q.hpTotal ? q.target : Math.min(q.target, q.start + q.ratePerMs * el));
      if (state.hp > cur + 1e-9) { state.restStartHp = state.hp; state.restElapsedMs = 0; }
    }
    const r = WS._restNeedMs(state), used = Math.min(r.need, left);
    state.restElapsedMs = (state.restElapsedMs || 0) + used;
    state.hp = r.start >= r.target ? r.start : (state.restElapsedMs >= r.hpTotal ? r.target : Math.min(r.target, r.start + r.ratePerMs * state.restElapsedMs));
    WS._onRest(state, used, away);
    if (r.need > left) return used;
    const where = state.restAt || 'base';
    state.resting = false; state.restElapsedMs = 0; state.healsUsed = 0; state.restAt = null;
    ZI.refillBaseCharges && ZI.refillBaseCharges();          // D2: base charges refill after resting
    events.push({ kind:'resumed', hp: state.hp, stress: ZI.getStress(), restAt: where });
    return used;
  };
})();

// ═══ Getaway (post-R1 request): Retreat is always pressable in the field; a successful Stealth/Athletics roll on
// starting a withdrawal gives +30 evasion until the next checkpoint (arrival). Runners and watchers ignore it. ═══
ZI.RETREAT_EVADE = { evasion: 30, base: 25, stealthMul: 1.4, athleticsMul: 0.8, min: 10, max: 90 };
ZI.retreatEvadeCounters = function(z) { return !!z && (z.base === 'Runner' || (z.traits || []).some(t => /Awareness skill|Stealth reveal/.test(t))); };
ZI.retreatEvadeChance = function(state) {
  const E = ZI.RETREAT_EVADE, lv = (k) => (ZI.effectiveLevel ? ZI.effectiveLevel(k) : 0) || 0;
  return Math.max(E.min, Math.min(E.max, E.base + Math.round(lv('stealth') * E.stealthMul) + Math.round((state.athletics || lv('athletics')) * E.athleticsMul)));
};
// One roll per withdrawal. Uses the simulation rng on automatic paths so offline/online stay identical.
ZI.retreatEvadeRoll = function(state, rng, events) {
  if (!state.withdrawing || state.retreatEvadeRolled) return null;
  state.retreatEvadeRolled = true;
  const chance = ZI.retreatEvadeChance(state), roll = Math.floor((rng || Math.random)() * 100) + 1, ok = roll <= chance;
  if (ok) { state.retreatEvade = ZI.RETREAT_EVADE.evasion; ZI.emitAction && ZI.emitAction('sneak', 1); }
  const ev = { kind:'retreatEvade', ok, chance, roll, text: ok
    ? `Clean getaway (${chance}%, rolled ${roll}): +${ZI.RETREAT_EVADE.evasion} evasion until the checkpoint. Runners and watchers aren't fooled`
    : `Couldn't shake them (${chance}%, rolled ${roll})` };
  if (events) events.push(ev);
  return ev;
};
// The Retreat button: start a withdrawal (or answer an open prompt), or try the getaway if already withdrawing.
ZI.wanderRetreatPress = function(state, rng) {
  if (state.resting) return { ok:false, reason:'Already resting at the checkpoint.' };
  const ev = [];
  if (state.retreatHold) { const r = ZI.retreatHoldResolve(state, 'return', null, ev, rng); return Object.assign(r, { events: ev }); }
  if (state.withdrawing) {
    const g = ZI.retreatEvadeRoll(state, rng, ev);
    return g ? { ok:true, kind:'retreatEvade', text: g.text, evade: g } : { ok:false, reason: state.retreatEvade ? 'Already slipped away — keep heading back.' : 'Already heading back — the getaway was already tried.' };
  }
  const w = ZI.wanderWithdraw(state); if (!w.ok) return w;
  const g = ZI.retreatEvadeRoll(state, rng, ev);
  return Object.assign(w, { evade: g, text: `Withdrawing — ${w.meters} m back to the checkpoint. ${g.text}.` });
};

// ═══ JD1a — First displacement: the Elder Jester's first meeting (reference/jd1a-batch-draft.md, CURRENT_BATCH.md) ═══
// Rules only. OFF for players until JD1b supplies the scene (S5): TABLE.firstMeetingOn is a code default, never read
// from a save. Records live in zi_jester (a zi_* key, so it travels with the save slot). Eligibility, kit receipt
// (zi_starter_kit_given) and trade completion are separate facts (B4). Every multi-store step writes its intent first and
// is safe to redo (the "flag first, act idempotently" pattern of ensureStarterKit), so a reload never repeats it (8d).
ZI.Jester = {
  KEY: 'zi_jester',
  TABLE: {
    firstMeetingOn: false,                 // S5: off for players until JD1b
    distances: [3, 4, 5, 2, 1],            // G1: search order (Chebyshev, as the Fort placement)
    stayDaysMin: 3, stayDaysMax: 5,        // U35/U38b: 3–5 days, rolled once at the meeting
    dayMs: ZI.GAME_DAY_MS,                 // one game day on the shared game clock (Oct 16, Sam: 3–5 game days ≈ 7–12 real min)
    weapons: ['bat', 'iron_knuckles', 'pocket_knife'],
    equip: [{ id: 'old_padded_jacket', slot: 'vest' }, { id: 'handmade_pouch', slot: 'backpack' }], // B3: empty slot, else stash
    carried: [{ id: 'scout_kit', qty: 1 }, { id: 'ration', qty: 2 }],                            // B3: go with the survivor
    stash: ['fort_medkit'],                                                                        // B3: the Fort checks the stash
  },
  on() { return !!this.TABLE.firstMeetingOn; },
  get() { return ZI._rj(this.KEY, null); },
  put(r) { ZI._wj(this.KEY, r); return r; },
  _sig() { const s = JSON.stringify([ZI.getStash(), ZI.getLoadout(), ZI.getCarried()]); let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h + ':' + s.length; },
  _hk(e) { return JSON.stringify([e.id || null, e.name || null, e.seq == null ? null : e.seq, e.value == null ? null : e.value]); },

  // ── B4: records at creation and on load ──
  onNewSave() {
    const on = this.on();
    this.put({ v: 1, eligible: on, met: false, phase: null });
    if (!on) ZI.ensureStarterKit();        // switch off: the existing kit once, as today
  },
  onLoad() {
    let r = this.get();
    if (!r) {                              // legacy save: exempt, migrated once; today's kit migration (flag-guarded)
      this.put({ v: 1, eligible: false, met: false, phase: null, migrated: true });
      ZI.ensureStarterKit(); return 'legacy';
    }
    if (!r.eligible) { ZI.ensureStarterKit(); this._finishPendingWeapon(); return 'exempt'; }
    if (r.phase === 'trading') { this._finishTrade(r); r = this.get(); }
    if (r.phase === 'granting') { this._grant(r); r = this.get(); }
    this._finishPendingWeapon();
    if (!this.on() && !r.fallback && r.phase !== 'done') { this.fallback(); return 'fallback'; }
    if (this.on() && (r.phase === 'resting' || r.phase === 'waiting')) {   // the run must agree with the record
      ZI.wanderAct(s => { if (!s.jesterCamp) { s.jesterCamp = true; if (r.phase === 'resting' && !s.resting) { s.resting = true; s.restAt = 'camp'; s.restStartHp = Math.max(0, s.hp || 1); s.restElapsedMs = 0; } } });
    }
    return 'eligible';
  },

  // ── G1: camp square ──
  campSquare(down, rng) {
    const C = ZI.SECTOR_COLS, R = ZI.SECTOR_ROWS, sx0 = Math.floor(down.gx / C) * C, sy0 = Math.floor(down.gy / R) * R;
    const inSec = (gx, gy) => gx >= sx0 && gx < sx0 + C && gy >= sy0 && gy < sy0 + R;
    const cell = (gx, gy) => ZI.worldCell(gx, gy, 'scavenge');
    const safe = (c) => !!c && c.state !== 'locked' && c.state !== 'contested' && !(ZI.isFortCell && ZI.isFortCell(c)) && !(ZI.isFallowCell && ZI.isFallowCell(c)) && !(ZI.isHomeCell && ZI.isHomeCell(c.gx, c.gy));
    // Legal movement (Traversal travel): one square to any of the 8 neighbours; locked squares can't be entered. Bounded to the sector.
    const k = (gx, gy) => gx + ',' + gy, reach = new Set([k(down.gx, down.gy)]), q = [[down.gx, down.gy]];
    while (q.length) { const [x, y] = q.shift();
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const nx = x + dx, ny = y + dy;
        if (!inSec(nx, ny) || reach.has(k(nx, ny))) continue; if (cell(nx, ny).state === 'locked') continue; reach.add(k(nx, ny)); q.push([nx, ny]); } }
    for (const d of this.TABLE.distances) {
      const opts = [];
      for (let gy = sy0; gy < sy0 + R; gy++) for (let gx = sx0; gx < sx0 + C; gx++) {
        if (Math.max(Math.abs(gx - down.gx), Math.abs(gy - down.gy)) !== d || !reach.has(k(gx, gy))) continue;
        const c = cell(gx, gy); if (safe(c)) opts.push(c);
      }
      if (opts.length) return opts[Math.floor(rng() * opts.length) % opts.length];
    }
    const here = cell(down.gx, down.gy);
    return safe(here) ? here : null;      // E1: no safe camp → null (the ordinary Base Forced Retreat)
  },

  // ── S2/G1/E1: the first Downing (called from WanderSim._downed instead of the Base Forced Retreat) ──
  firstDowning(state, rng) {
    if (!this.on() || state.resting) return null;
    const r = this.get(); if (!r || !r.eligible || r.met || r.phase || r.fallback) return null;
    const down = ZI._rj('zi_trav_pos', null);
    const camp = down && down.gx != null ? this.campSquare(down, rng) : null;
    if (!camp) { r.campSkipped = (r.campSkipped || []).concat([{ at: state._simNow != null ? state._simNow : ZI.clockNow(), reason: down ? 'noSafeSquare' : 'noPosition' }]); this.put(r); return null; } // E1
    const haul = (state.carried || []).filter(e => !ZI._haulIsStory(e));
    const carried = ZI.getCarried().filter(e => !ZI.isStoryItem(e.id));
    r.phase = 'trading';
    r.trade = { haul: haul.map(e => this._hk(e)), names: haul.map(e => e.name || e.id), carried: carried.map(e => ({ id: e.id, qty: e.qty })),
                carriedBefore: JSON.stringify(ZI.getCarried()), downAt: state._simNow != null ? state._simNow : ZI.clockNow(), down: { gx: down.gx, gy: down.gy } };
    r.camp = { gx: camp.gx, gy: camp.gy };
    this.put(r);                           // intent first (8d)
    this._finishTrade(r, state);
    return { kind: 'jesterDisplacement', forcedRetreat: true, cause: 'downed', destination: 'jesterCamp', eligible: haul.length, lost: r.trade.names.slice(),
             lostCount: haul.length, kept: null, banked: 0, scavenging: ZI.effectiveLevel('scavenging'), shaken: false, hp: state.hp, stress: ZI.getStress(), camp: { gx: camp.gx, gy: camp.gy } };
  },
  // Remove the traded items (story items never), move to the camp, rest there. Safe to redo after a reload.
  _finishTrade(r, liveState) {
    const apply = (s) => {
      const left = r.trade.haul.slice();
      s.carried = (s.carried || []).filter(e => { if (ZI._haulIsStory(e)) return true; const i = left.indexOf(this._hk(e)); if (i < 0) return true; left.splice(i, 1); return false; });
      if (!s.jesterCamp) {
        ZI.endRunState(s, 'jester');
        s.resting = true; s.restAt = 'camp'; s.restStartHp = Math.max(0, s.hp || 1); s.restElapsedMs = 0; s.jesterCamp = true;
      }
    };
    if (JSON.stringify(ZI.getCarried()) === r.trade.carriedBefore) {      // carried not yet reduced: reduce once
      const take = {}; r.trade.carried.forEach(e => { take[e.id] = (take[e.id] || 0) + e.qty; });
      const out = []; ZI.getCarried().forEach(e => { if (ZI.isStoryItem(e.id)) { out.push(e); return; } const t = Math.min(take[e.id] || 0, e.qty); take[e.id] = (take[e.id] || 0) - t; if (e.qty - t > 0) out.push(Object.assign({}, e, { qty: e.qty - t })); });
      ZI.saveCarried(out);
    }
    if (liveState) apply(liveState); else ZI.wanderAct(apply);
    const cell = ZI.worldCell(r.camp.gx, r.camp.gy, 'scavenge');
    ZI._wj('zi_trav_pos', ZI.zoneFromCell(cell));
    r.phase = 'resting'; this.put(r);
  },

  // ── U38a: waiting at the camp (called by WanderSim.advance at every step) ──
  waitStep(state) {
    if (!state.jesterCamp || state.resting) return false;
    const r = this.get();
    if (!r || !r.eligible || r.met || r.fallback || r.phase === 'done' || !this.on()) { state.jesterCamp = false; state.jesterWait = false; return false; }
    if (r.phase === 'resting') { r.phase = 'waiting'; this.put(r); }
    if (r.phase === 'waiting') { state.jesterWait = true; return true; }
    return false;
  },

  // ── Rewards: exactly once, in order, each placement guarded by an intent record ──
  _rewards(weaponId) {
    const T = this.TABLE, out = T.equip.map(e => ({ id: e.id, slot: e.slot }));
    if (weaponId) out.push({ id: weaponId, slot: 'melee' });
    T.carried.forEach(e => out.push({ id: e.id, to: 'carried', qty: e.qty }));
    T.stash.forEach(id => out.push({ id, to: 'stash' }));
    return out;
  },
  _place(g) {
    if (g.slot) { const lo = ZI.getLoadout(); if (!lo[g.slot]) { lo[g.slot] = g.id; ZI.saveLoadout(lo); } else ZI.grantGear(g.id, 1); return; } // B3: never replace
    if (g.to === 'carried') { ZI.saveCarried(ZI.getCarried().concat([{ id: g.id, qty: g.qty || 1 }])); return; }
    ZI.grantGear(g.id, g.qty || 1);
  },
  _placeOnce(r, g, doneKey) {             // intent + inventory signature: a redo never places twice
    if (r.inFlight && r.inFlight.key === doneKey) { if (r.inFlight.sig !== this._sig()) { r.inFlight = null; return true; } }
    else { r.inFlight = { key: doneKey, sig: this._sig() }; this.put(r); }
    this._place(g); r.inFlight = null; return true;
  },
  _grant(r) {
    r.granted = r.granted || [];
    r.grants.forEach((g, i) => { if (r.granted.includes(i)) return; this._placeOnce(r, g, 'g' + i); r.granted.push(i); this.put(r); });
    ZI._wj('zi_starter_kit_given', true);
    if (r.grantMode === 'meeting') {
      const T = this.TABLE, roll = ZI.roll ? ZI.roll() : Math.random();
      if (r.stayDays == null) r.stayDays = T.stayDaysMin + Math.min(T.stayDaysMax - T.stayDaysMin, Math.floor(roll * (T.stayDaysMax - T.stayDaysMin + 1)));
      if (r.meetAt == null) r.meetAt = ZI.clockNow();
      r.met = true;
    }
    r.phase = 'done'; delete r.grants; delete r.granted; this.put(r);
    ZI.wanderAct(s => { s.jesterWait = false; s.jesterCamp = false; });   // resume; an unfinished rest continues normally
  },

  // ── The meeting (JD1b's scene calls this with the player's choice; U38: never chosen for the player) ──
  meet(weaponId) {
    let r = this.get();
    if (!r || !r.eligible || r.met || r.fallback) return { ok: false, reason: 'No meeting is due.' };
    if (r.phase === 'granting') { this._grant(r); return { ok: true, resumed: true }; }   // a saved choice completes
    if (r.phase !== 'waiting' && r.phase !== 'resting') return { ok: false, reason: 'The survivor is not at the camp.' };
    if (!this.TABLE.weapons.includes(weaponId)) return { ok: false, reason: 'Choose one of the three weapons.' };
    r.phase = 'granting'; r.grantMode = 'meeting'; r.weapon = weaponId; r.grants = this._rewards(weaponId); r.granted = []; this.put(r);
    this._grant(this.get());
    return { ok: true, weapon: weaponId };
  },
  campActive(now) { const r = this.get(); return !!(r && r.met && r.meetAt != null && (now == null ? ZI.clockNow() : now) < r.meetAt + r.stayDays * this.TABLE.dayMs); },

  // ── B5: switch off with an eligible save ──
  fallback() {
    let r = this.get(); if (!r || !r.eligible || r.fallback || r.phase === 'done') return false;
    const from = r.phase || 'notStarted', at = ZI.clockNow();
    if (!r.phase) {                        // trade not started: permanently exempt, existing kit once
      r.eligible = false; r.exempt = 'switchOff'; r.fallback = { at, from }; this.put(r); ZI.ensureStarterKit();
      ZI.wanderAct(s => { s.jesterWait = false; s.jesterCamp = false; }); return true;
    }
    if (r.phase === 'trading') { this._finishTrade(r); r = this.get(); }
    r.fallback = { at, from };
    if (r.phase !== 'granting') { r.phase = 'granting'; r.grantMode = 'fallback'; r.grants = this._rewards(null); r.granted = []; r.weaponOwed = true; } // G2
    this.put(r); this._grant(this.get());
    return true;
  },

  // ── G2: an owed weapon (JD1b offers only this choice) ──
  chooseOwedWeapon(weaponId) {
    const r = this.get(); if (!r || !r.weaponOwed) return { ok: false, reason: 'No weapon is owed.' };
    if (r.weaponPending) { this._finishPendingWeapon(); return { ok: true, weapon: r.weaponPending, resumed: true }; } // a saved choice completes
    if (!this.TABLE.weapons.includes(weaponId)) return { ok: false, reason: 'Choose one of the three weapons.' };
    r.weaponPending = weaponId; this.put(r);
    this._finishPendingWeapon();
    return { ok: true, weapon: weaponId };
  },
  _finishPendingWeapon() {
    const r = this.get(); if (!r || !r.weaponOwed || !r.weaponPending) return false;
    this._placeOnce(r, { id: r.weaponPending, slot: 'melee' }, 'w');
    r.weapon = r.weaponPending; r.weaponOwed = false; r.weaponPending = null; this.put(r);
    return true;
  },
};

// Save migration (tutorial follow-up, adds data only): zi_tut_progress from the old per-screen done flags.
// Version is the previous current + 1 (not hard-coded) so it always lands after the last migration.
ZI.SAVE_FORMAT.current = ZI.SAVE_FORMAT.current + 1;
ZI.SAVE_MIGRATIONS[ZI.SAVE_FORMAT.current] = function() { ZI._migrateTutProgress(); };
