// game/fort.js — First Fort (Hearthguard gate), Fallow Ground, Survey Point, gate actions, extra wear.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
// Everything attaches to the shared global ZI object; load-time calls live in game/bootstrap.js.
ZI.FORT_FACTION = 'hearthguard';
// Guaranteed placement: an open cell 2–3 cells from the start, chosen from the world seed; Fallow Ground next to it.
ZI.getFortPos = function() {
  let f = ZI._rj('zi_fort1_pos', null); if (f) return f;
  const start = ZI._rj('zi_trav_start', null) || ZI._rj('zi_trav_pos', null);
  if (!start || start.gx == null) return null;
  // Brief 12.6 #2: inside the STARTING VIEW (the start's sector, SECTOR_COLS × SECTOR_ROWS),
  // 2–3 cells from the start (Chebyshev), on an unlocked cell with ≥1 unlocked neighbour (the Fallow cell).
  const ok = (c) => c && c.state !== 'locked' && c.state !== 'contested';
  const C = ZI.SECTOR_COLS, R = ZI.SECTOR_ROWS;
  const sx0 = Math.floor(start.gx / C) * C, sy0 = Math.floor(start.gy / R) * R;
  const inView = (gx, gy) => gx >= sx0 && gx < sx0 + C && gy >= sy0 && gy < sy0 + R;
  const fallowOpts = (p) => {
    const out = [];
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const c = ZI.worldCell(p.gx + dx, p.gy + dy, 'scavenge');
      if (ok(c) && !(c.gx === start.gx && c.gy === start.gy)) out.push(c);
    }
    // Prefer a Fallow cell that is also inside the starting view.
    const vis = out.filter(c => inView(c.gx, c.gy));
    return vis.length ? vis : out;
  };
  const ring = [];
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) {
    const d = Math.max(Math.abs(dx), Math.abs(dy)); if (d < 2) continue;
    const gx = start.gx + dx, gy = start.gy + dy; if (!inView(gx, gy)) continue;
    const c = ZI.worldCell(gx, gy, 'scavenge'); if (ok(c) && fallowOpts(c).length) ring.push(c);
  }
  if (!ring.length) return null; // no valid cell in view (not observed in tests; see report)
  const pick = ring[(ZI.worldSeed() >>> 0) % ring.length];
  const near = fallowOpts(pick);
  const fal = near[(ZI.worldSeed() >>> 3) % Math.max(1, near.length)] || pick;
  f = { gx:pick.gx, gy:pick.gy, sx:pick.sx, sy:pick.sy, row:pick.row, col:pick.col, coord:pick.coord,
        fallow:{ gx:fal.gx, gy:fal.gy, sx:fal.sx, sy:fal.sy, row:fal.row, col:fal.col, coord:fal.coord } };
  ZI._wj('zi_fort1_pos', f);
  return f;
};
ZI.isFortCell = function(c) { const f = ZI.getFortPos(); return !!(f && c && c.gx === f.gx && c.gy === f.gy); };
ZI.isFallowCell = function(c) { const f = ZI.getFortPos(); return !!(f && c && f.fallow && c.gx === f.fallow.gx && c.gy === f.fallow.gy); };
ZI.getFallowQuest = function() { return ZI._rj('zi_quest_fallow_ground', { state:'none' }); };
// Terms table (brief 12.1): offering the med kit → 40 kills, +50 standing, kit consumed.
// Passing a diplomat/command check → 60 kills, +25 standing, kit kept, guard stays wary.
ZI.FALLOW_TERMS = { offering:{ kills:40, rep:50 }, check:{ kills:60, rep:25 } };
ZI.fallowTerms = function() { const q = ZI.getFallowQuest(); return ZI.FALLOW_TERMS[q.terms === 'check' ? 'check' : 'offering']; };
ZI.fallowGoal = function() { const f = ZI.getFortPos(); return f ? ZI.cellClearTarget(f.fallow.gx, f.fallow.gy) : ZI.CELL_CLEAR_KILLS; };
ZI.fallowProgress = function() {
  const q = ZI.getFallowQuest(); if (!q.cell) return 0;
  const k = q.cell.gx + ',' + q.cell.gy; return Math.min(ZI.fallowGoal(), ZI.getCellKills()[k] || 0); // same total the map reads
};
// Survey Point: the session-ending hook toward the Concordance, 2 cells past the Fort.
ZI.getSurveyPoint = function() { return ZI._rj('zi_survey_point', null); };
ZI.placeSurveyPoint = function() {
  const f = ZI.getFortPos(); if (!f) return null;
  const cheb = (a, b) => Math.max(Math.abs(a.gx - b.gx), Math.abs(a.gy - b.gy));
  const cur = ZI.getSurveyPoint();
  if (cur) return cur; // a saved Survey Point is never relocated (decided)
  const ok = (c) => c.state !== 'locked' && !ZI.isFallowCell(c) && !ZI.isFortCell(c) && !ZI.isHomeCell(c.gx, c.gy);
  const ring = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (dx || dy) { const c = ZI.worldCell(f.gx + dx, f.gy + dy, 'scavenge'); if (ok(c)) ring.push(c); }
  if (!ring.length) return null;
  const c = ring[(ZI.worldSeed() >>> 5) % ring.length];
  const p = { gx:c.gx, gy:c.gy, coord:c.coord }; ZI._wj('zi_survey_point', p); return p;
};
ZI.isSurveyCell = function(c) { const p = ZI.getSurveyPoint(); return !!(p && c && p.gx === c.gx && p.gy === c.gy); };
ZI.inFortCell = function() { const z = ZI.getTravZone && ZI.getTravZone(); return !!(z && ZI.isFortCell(z)); };
// No camp on Fallow Ground while its quest is active or ready for turn-in (decided). Existing camps are untouched.
ZI.canCampAt = function(cell) { const st = ZI.getFallowQuest().state; return !(ZI.isFallowCell(cell) && (st === 'active' || st === 'ready')); };
// Brief 11.3/12.3: after attacking the guard, gear wear ×2 in the Fort's cell and its neighbours.
// Ends when the Fort's cell is 'cleared again': 40 new qualifying kills in the Fort cell, counted from the
// successful attack (qualifying = the cell-kill counter, which excludes Routes and the guard attack).
// zi_fort_reconciled is a future integration hook only; nothing in the current game sets it.
ZI.FORT_WEAR_MULT = 2;
ZI.FORT_WEAR_CLEAR_KILLS = 40;
ZI.startFortWearPenalty = function() {
  const f = ZI.getFortPos(); if (!f) return;
  if (ZI._rj('zi_fort_wear', null)) return;
  ZI._wj('zi_fort_wear', { at: Date.now(), baseKills: ZI.getCellKills()[f.gx + ',' + f.gy] || 0 });
};
ZI.fortWearActive = function() {
  const w = ZI._rj('zi_fort_wear', null), f = ZI.getFortPos(); if (!w || !f) return false;
  const since = (ZI.getCellKills()[f.gx + ',' + f.gy] || 0) - w.baseKills;
  if (since >= ZI.FORT_WEAR_CLEAR_KILLS || ZI._rj('zi_fort_reconciled', false)) { localStorage.removeItem('zi_fort_wear'); return false; }
  return true;
};
ZI.fortWearMult = function() {
  if (!ZI.fortWearActive()) return 1;
  const z = ZI.getTravZone && ZI.getTravZone(), f = ZI.getFortPos();
  if (!z || !f) return 1;
  return Math.max(Math.abs(z.gx - f.gx), Math.abs(z.gy - f.gy)) <= 1 ? ZI.FORT_WEAR_MULT : 1;
};
// Gate actions. Each returns { ok, tone, text, next } for the scene.
ZI.fortTone = function() {
  return { ethical:"You don't look like a raider. Show me what you carry.", immoral:'Keep your hands where I can see them.',
           criminal:'We know your kind. What are you selling?', heinous:'Not here. Move on.' }[ZI.getPolicy().id];
};
ZI.fortStartQuest = function(harder) {
  if (ZI.getFallowQuest().state !== 'none') return false; // terms are locked once the quest exists
  const f = ZI.getFortPos();
  const entry = harder ? 'check' : 'offering';
  // A Criminal survivor gets the harder-terms row whichever way they got in (brief 12.1, decided Sep 30).
  const terms = (entry === 'check' || ZI.getPolicy().id === 'criminal') ? 'check' : 'offering';
  ZI._wj('zi_quest_fallow_ground', { state:'active', cell:f.fallow, entry, terms, harder: terms === 'check', at: Date.now() });
  // Already cleared before accepting? Ready at once — still must return to the Fort.
  if (ZI.isCellCleared(f.fallow.gx, f.fallow.gy)) { const q = ZI.getFallowQuest(); q.state = 'ready'; ZI._wj('zi_quest_fallow_ground', q); }
  return true;
};
// Brief 12.6 #1: quest offered only at Hearthguard standing −250..+249 (Wary, Stranger, Neutral),
// never Hostile/Hunted, never under Heinous policy. Checked when the gate dialogue opens.
ZI.FORT_QUEST_REP_MIN = -250; ZI.FORT_QUEST_REP_MAX = 249;
ZI.fortQuestEligibility = function() {
  if (ZI.getPolicy().id === 'heinous') return { ok:false, reason:'heinous' };
  const r = ZI.getRep(ZI.FORT_FACTION);
  if (r < ZI.FORT_QUEST_REP_MIN) return { ok:false, reason:'hostile', rep:r };
  if (r > ZI.FORT_QUEST_REP_MAX) return { ok:false, reason:'high', rep:r };
  return { ok:true, rep:r };
};
ZI.fortOffer = function() {
  if (ZI.getFallowQuest().state !== 'none') return { ok:false, tone:'warn', text:'"You already have your task."' };
  if (!ZI.fortQuestEligibility().ok) return { ok:false, tone:'warn', text:'"Not here. Move on."' };
  if (!ZI.hasMedKit()) return { ok:false, tone:'warn', text:'"Medicine. Bring medicine." You have no med kit to give — craft one, or talk your way in.' };
  if (ZI.getPolicy().id === 'criminal') {
    // Harder-terms row: the med kit is kept (brief 12.1 table, applied literally).
    ZI.fortStartQuest(false);
    return { ok:true, tone:'warn', text:'The guard pushes the kit back into your hands. "Keep it. We know your kind." The gate opens a crack. Mythical Jester will hear you out, on harder terms.', next:'offer' };
  }
  ZI.takeMedKit();
  ZI.fortStartQuest(false); // standing only changes on turn-in
  return { ok:true, tone:'good', text:'The guard turns the kit over in their hands and nods. The gate opens a crack. Mythical Jester hears you out.', next:'offer' };
};
ZI.fortCheckChance = function(skill) {
  const pol = ZI.getPolicy().id;
  const mod = { ethical:15, immoral:0, criminal:-10, heinous:-40 }[pol] || 0;
  return Math.max(10, Math.min(90, Math.round(30 + ZI.effectiveLevel(skill) * 2.5 + mod)));
};
ZI.fortCheck = function(skill) {
  if (ZI.getFallowQuest().state !== 'none') return { ok:false, tone:'warn', text:'"You already have your task."' };
  if (!ZI.fortQuestEligibility().ok) return { ok:false, tone:'warn', text:'"Not here. Move on."' };
  const ch = ZI.fortCheckChance(skill), roll = Math.floor(Math.random() * 100) + 1;
  ZI.emitAction && ZI.emitAction(skill === 'diplomat' ? 'faction' : 'enc.convoy', 1);
  if (roll <= ch) { ZI.fortStartQuest(true); return { ok:true, tone:'good', text:`${skill === 'diplomat' ? 'You read the guard and ask for terms' : 'You hold your ground and do not blink'} (${ch}%, rolled ${roll}). "Fine. Mythical Jester will see you — but you'll earn it."`, next:'offer' }; }
  return { ok:false, tone:'warn', text:`It doesn't land (${ch}%, rolled ${roll}). "Come back with something we need." You can try again.` };
};
ZI.fortAttackChance = function() { return Math.max(15, Math.min(85, Math.round(35 + ZI.effectiveLevel('combat') * 1.5))); };
ZI.FORT_ATTACK_HP_PCT = 0.25;
ZI.fortAttackHpLoss = function() { return Math.round(ZI.SURVIVOR_MAX_HP * ZI.FORT_ATTACK_HP_PCT * ZI.difficultyMult('fortAttackHp')); };
ZI.fortAttack = function() {
  const ch = ZI.fortAttackChance(), roll = Math.floor(Math.random() * 100) + 1;
  ZI.emitAction && ZI.emitAction('kill', 1.5, { noCellKill:true }); // a human guard, not a zombie in this cell
  if (roll <= ch) {
    ZI.startFortWearPenalty(); // ×2 wear begins only after a SUCCESSFUL attack (decided)
    ZI._wj('zi_heinous_unlocked', true);
    ZI.getRep(ZI.FORT_FACTION);
    const s = ZI.getContractSave(); s.repByFaction[ZI.FORT_FACTION] = -400; ZI.saveContractSave(s);
    ZI._wj('zi_factions_unlocked', 'hostile');
    ZI._wj('zi_factions_known', [ZI.FORT_FACTION, 'lodge']);
    ZI._wj('zi_fort_hostile', true);
    return { ok:true, tone:'warn', text:`The guard falls (${ch}%, rolled ${roll}). A horn sounds across the fields. HEINOUS UNLOCKED. The Hearthguard are now Hostile — the Hearthbound Lodge will still trade with you.`, next:'done' };
  }
  const run = ZI.getWanderRun ? ZI.getWanderRun() : { hp:100 };
  const lost = ZI.fortAttackHpLoss();
  const hp = Math.max(1, (run.hp == null ? ZI.SURVIVOR_MAX_HP : run.hp) - lost);
  ZI.syncWanderState && ZI.syncWanderState({ hp });
  ZI.setInjury(3);
  return { ok:false, tone:'warn', text:`You are wounded and driven from the pikes (${ch}%, rolled ${roll}). HP ${hp}/100. A lasting injury: −10% combat and athletics for ~3 days (making camp speeds healing).` };
};
ZI.fortTurnIn = function() {
  const q = ZI.getFallowQuest(); if (q.state !== 'ready') return { ok:false, tone:'warn', text:'"The south field is still crawling. Finish the job."' };
  if (!ZI.inFortCell()) return { ok:false, tone:'warn', text:'"Come through the gate to report." Travel into the Fort\'s own cell to turn in Fallow Ground.' };
  q.state = 'done'; q.doneAt = Date.now(); ZI._wj('zi_quest_fallow_ground', q);
  const terms = ZI.FALLOW_TERMS[q.terms === 'check' ? 'check' : 'offering'];
  ZI.getRep(ZI.FORT_FACTION); ZI.repApply(ZI.FORT_FACTION, terms.rep);
  ZI._wj('zi_factions_unlocked', 'friendly');
  ZI._wj('zi_factions_known', [ZI.FORT_FACTION]);
  ZI.grantGear && ZI.grantGear('sealed_crate', 1);
  const sp = ZI.placeSurveyPoint();
  if (sp) ZI.queueWanderLog(`📡 A survey team was seen near ${sp.coord}. Survey Point marked on the Traversal map.`);
  q.repGained = terms.rep; ZI._wj('zi_quest_fallow_ground', q);
  ZI.emitAction && ZI.emitAction('contract.complete', 1, { faction: ZI.FORT_FACTION });
  return { ok:true, tone:'good', text:`Hearthguard standing +${terms.rep}. New item: SEALED CRATE (story item). FACTIONS page unlocked. New marker: SURVEY POINT on the Traversal map.`, next:'crate' };
};
