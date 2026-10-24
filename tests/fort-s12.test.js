// Headless test harness for Fort brief §12 (runs game-data.js against an in-memory localStorage).
// Usage (run_script): const T = await readFile('tests/fort-s12.test.js'); await (new Function('readFile','log', T))(readFile, log);
return (async () => {
// Loads the game/ modules in exactly the browser order (Zombie Idler v2.html).
const GAME_MODULES = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await Promise.all(GAME_MODULES.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = [];
const check = (name, cond, extra) => { results.push([cond ? 'PASS' : 'FAIL', name, extra || '']); };
const mkEnv = (seedOverride) => {
  const store = {};
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } };
  fw.window = fw;
  if (seedOverride != null) store['zi_world_seed'] = String(seedOverride);
  // Materials now come from game/economy.js (one copy); seed the same starting stock the old sandbox stub had.
  store['zi_materials'] = JSON.stringify({ metal:100, cloth:100, medical:50, electronics:50, fuel:50, wood:100 });
  new Function('fw', 'with(fw){' + src + '}')(fw);
  const ZI = fw.ZI;
  // Fresh game: start in an open cell near the origin (mirrors the Traversal first-visit pick).
  let start = null;
  for (let gy = 0; gy < 8 && !start; gy++) for (let gx = 0; gx < 8 && !start; gx++) { const c = ZI.worldCell(gx, gy, 'scavenge'); if (c.state === 'available') start = c; }
  const p = ZI.zoneFromCell(start);
  ls.setItem('zi_trav_pos', JSON.stringify(p)); ls.setItem('zi_trav_start', JSON.stringify(p));
  ZI.ensureStarterKit();
  const standIn = (cell) => ls.setItem('zi_trav_pos', JSON.stringify(ZI.zoneFromCell(ZI.worldCell(cell.gx, cell.gy, 'scavenge'))));
  const kills = (n) => { for (let i = 0; i < n; i++) ZI.emitAction('kill', 1); };
  const rep = () => ZI.getRep(ZI.FORT_FACTION);
  const stashCount = (id) => ZI.getStash().filter(x => x === id).length;
  const forceCheckPass = () => { const r = Math.random; Math.random = () => 0; const out = ZI.fortCheck('diplomat'); Math.random = r; return out; };
  return { ZI, store, ls, start, standIn, kills, rep, stashCount, forceCheckPass, reload: () => {
    // Simulate reload: re-run game-data.js over the SAME storage.
    const fw2 = Object.assign({}, fw); fw2.window = fw2; new Function('fw', 'with(fw){' + src + '}')(fw2); return fw2.ZI;
  } };
};

// ── Placement ──
{
  const T = mkEnv(12345), ZI = T.ZI, f = ZI.getFortPos();
  const dist = (a, b) => Math.max(Math.abs(a.gx - b.gx), Math.abs(a.gy - b.gy));
  check('Fort placed 2–3 cells (Chebyshev) from start', f && dist(f, T.start) >= 2 && dist(f, T.start) <= 3, f && ('d=' + dist(f, T.start)));
  check('Fallow cell adjacent to Fort', f && dist(f.fallow, f) === 1, f && ('d=' + dist(f.fallow, f)));
  check('Fallow cell is not the start cell', f && !(f.fallow.gx === T.start.gx && f.fallow.gy === T.start.gy));
  check('Fort position persists (same object on re-read)', JSON.stringify(ZI.getFortPos()) === JSON.stringify(f));
}

// ── Home ground (12.5) ──
{
  const T = mkEnv(777), ZI = T.ZI;
  check('Start cell cleared with 0 kills', ZI.isCellCleared(T.start.gx, T.start.gy));
  check('Start cell worldCell.state === cleared', ZI.worldCell(T.start.gx, T.start.gy, 'scavenge').state === 'cleared');
  const f = ZI.getFortPos();
  const other = ZI.worldCell(f.fallow.gx, f.fallow.gy, 'scavenge');
  T.ls.setItem('zi_trav_camp', JSON.stringify(ZI.zoneFromCell(ZI.worldCell(f.gx, f.gy, 'scavenge'))));
  check('Camp cell cleared with 0 kills', ZI.isCellCleared(f.gx, f.gy));
  check('Non-home cell not cleared at 0 kills', !ZI.isCellCleared(other.gx, other.gy));
}

// ── Path A: med kit ──
{
  const T = mkEnv(1001), ZI = T.ZI, f = ZI.getFortPos();
  const kit0 = T.stashCount('medkit'), rep0 = T.rep();
  check('A: starter med kit present', kit0 === 1, 'medkits=' + kit0);
  const r = ZI.fortOffer();
  check('A: offer accepted', r.ok);
  const q = ZI.getFallowQuest();
  check('A: terms stored = offering', q.terms === 'offering');
  check('A: target 40', ZI.fallowGoal() === 40);
  check('A: med kit consumed', T.stashCount('medkit') === kit0 - 1);
  check('A: no standing change at gate', T.rep() === rep0, rep0 + '→' + T.rep());
  T.standIn(f.fallow); T.kills(39);
  check('A: 39/40 not ready', ZI.getFallowQuest().state === 'active' && !ZI.isCellCleared(f.fallow.gx, f.fallow.gy));
  T.kills(1);
  check('A: 40/40 ready', ZI.getFallowQuest().state === 'ready' && ZI.isCellCleared(f.fallow.gx, f.fallow.gy));
  check('A: map state reads same number', ZI.worldCell(f.fallow.gx, f.fallow.gy, 'scavenge').state === 'cleared' && ZI.fallowProgress() === 40);
  const tOut = ZI.fortTurnIn();
  check('A: turn-in refused outside the Fort cell (standing on field)', !tOut.ok && ZI.getFallowQuest().state === 'ready');
  T.standIn(f);
  const t = ZI.fortTurnIn();
  check('A: turn-in ok inside the Fort cell', t.ok);
  check('A: +50 standing', T.rep() - rep0 === 50, rep0 + '→' + T.rep());
  check('A: 1 Sealed Crate', T.stashCount('sealed_crate') === 1);
  check('A: Factions unlocked (friendly)', ZI.factionsUnlocked() === 'friendly');
  check('A: Survey Point placed', !!ZI.getSurveyPoint());
  const t2 = ZI.fortTurnIn();
  check('A: second turn-in refused', !t2.ok);
  check('A: no duplicate crate / standing after repeat', T.stashCount('sealed_crate') === 1 && T.rep() - rep0 === 50);
  const ZI2 = T.reload();
  check('A: after reload: done, terms kept, crate once', ZI2.getFallowQuest().state === 'done' && ZI2.getFallowQuest().terms === 'offering' && ZI2.getStash().filter(x => x === 'sealed_crate').length === 1);
  const sp1 = JSON.stringify(ZI2.getSurveyPoint()); ZI2.placeSurveyPoint();
  check('A: Survey Point stable after reload/re-place', JSON.stringify(ZI2.getSurveyPoint()) === sp1);
}

// ── Path B: check route ──
{
  const T = mkEnv(2002), ZI = T.ZI, f = ZI.getFortPos();
  const kit0 = T.stashCount('medkit'), rep0 = T.rep();
  const r = T.forceCheckPass();
  check('B: check passed', r.ok);
  const q = ZI.getFallowQuest();
  check('B: terms stored = check', q.terms === 'check');
  check('B: target 60', ZI.fallowGoal() === 60 && ZI.cellClearTarget(f.fallow.gx, f.fallow.gy) === 60);
  check('B: med kit retained', T.stashCount('medkit') === kit0);
  T.standIn(f.fallow); T.kills(59);
  check('B: 59/60 not ready, map not cleared', ZI.getFallowQuest().state === 'active' && ZI.worldCell(f.fallow.gx, f.fallow.gy, 'scavenge').state !== 'cleared');
  T.kills(1);
  check('B: 60/60 ready, map cleared', ZI.getFallowQuest().state === 'ready' && ZI.worldCell(f.fallow.gx, f.fallow.gy, 'scavenge').state === 'cleared');
  T.standIn(f); ZI.fortTurnIn();
  check('B: +25 standing', T.rep() - rep0 === 25, rep0 + '→' + T.rep());
  check('B: med kit still retained after turn-in', T.stashCount('medkit') === kit0);
  check('B: crate + factions + survey', T.stashCount('sealed_crate') === 1 && ZI.factionsUnlocked() === 'friendly' && !!ZI.getSurveyPoint());
}

// ── Path C: kills before acceptance ──
{
  const T = mkEnv(3003), ZI = T.ZI, f = ZI.getFortPos();
  T.standIn(f.fallow); T.kills(25);
  ZI.fortOffer();
  check('C: prior 25 kills count toward quest', ZI.fallowProgress() === 25 && ZI.getFallowQuest().state === 'active');
  T.kills(15);
  check('C: ready at 40 total', ZI.getFallowQuest().state === 'ready');
}

// ── Path D: field already cleared ──
{
  const T = mkEnv(4004), ZI = T.ZI, f = ZI.getFortPos();
  T.standIn(f.fallow); T.kills(40);
  ZI.fortOffer();
  check('D: already-cleared field → ready immediately', ZI.getFallowQuest().state === 'ready');
  check('D: ready is not done (turn-in still required)', ZI.getFallowQuest().state !== 'done' && !ZI.factionsUnlocked());
}

// ── Path F: alternate entry after quest exists ──
{
  const T = mkEnv(5005), ZI = T.ZI;
  ZI.fortOffer();
  const kitAfterOffer = T.stashCount('medkit');
  T.forceCheckPass();
  check('F: later check does not switch terms 40→60', ZI.getFallowQuest().terms === 'offering' && ZI.fallowGoal() === 40, 'terms=' + ZI.getFallowQuest().terms);
  ZI.grantGear('medkit', 1); const k1 = T.stashCount('medkit');
  ZI.fortOffer();
  check('F: second offer does not consume another kit', T.stashCount('medkit') === k1, k1 + '→' + T.stashCount('medkit'));
}

// ── Faction naming (11.4) ──
{
  const T = mkEnv(6006), ZI = T.ZI;
  const hg = ZI.factionDisplayName('hearthguard');
  check('Naming: Hearthguard shown by name before unlock', /Hearthguard/i.test(hg), hg);
  const others = ZI.HEX_ORDER.filter(id => id !== 'hearthguard').map(id => ZI.factionDisplayName(id));
  check('Naming: exactly 5 unnamed groups', others.length === 5 && others.every(n => /^Unnamed group /.test(n)), others.join(' / '));
  const letters = others.map(n => n.slice(-1)).join('');
  check('Naming: letters are A–E, no gap', letters.split('').sort().join('') === 'ABCDE', letters);
  const live = ZI.liveFactions ? ZI.liveFactions() : [];
  check('Naming: Factions page uses same display names', live.length && live.every(f => f.name === ZI.factionDisplayName(f.id)));
}

// ── Survey Point (my implementation choice: 2 cells beyond the Fort) ──
{
  for (const sd of [11, 22, 33, 44, 55]) {
    const T = mkEnv(sd), ZI = T.ZI, f = ZI.getFortPos(); ZI.placeSurveyPoint(); const sp = ZI.getSurveyPoint();
    const d = sp ? Math.max(Math.abs(sp.gx - f.gx), Math.abs(sp.gy - f.gy)) : -1;
    const bad = sp && (ZI.isHomeCell(sp.gx, sp.gy) || ZI.isFallowCell(sp) || ZI.isFortCell(sp));
    check('Survey seed ' + sd + ': next to the Fort, not home/field/Fort', d === 1 && !bad, 'd=' + d);
  }
}

// ── Kill-source isolation (one counter; only in-cell kills) ──
{
  const T = mkEnv(7007), ZI = T.ZI, f = ZI.getFortPos();
  T.standIn(f.fallow); ZI.fortOffer();
  const before = ZI.fallowProgress();
  const route = (ZI.ROUTES || [])[0]; if (route) ZI.completeRun(route, [], 'passive', 0);
  check('Kills: Routes combat nodes do not credit the Traversal cell', ZI.fallowProgress() === before, before + '→' + ZI.fallowProgress());
  const r = Math.random; Math.random = () => 0.99; ZI.fortAttack(); Math.random = r;
  check('Kills: Fort-guard attack does not credit the cell', ZI.fallowProgress() === before, before + '→' + ZI.fallowProgress());
  T.kills(3);
  check('Kills: Wandering kills still count', ZI.fallowProgress() === before + 3);
}
// ── Path E: reload mid-quest (check terms) ──
{
  const T = mkEnv(8008), ZI = T.ZI, f = ZI.getFortPos();
  T.forceCheckPass(); T.standIn(f.fallow); T.kills(30);
  const ZI2 = T.reload();
  check('E: reload keeps terms=check, target 60, progress 30', ZI2.getFallowQuest().terms === 'check' && ZI2.fallowGoal() === 60 && ZI2.fallowProgress() === 30);
  check('E: reload keeps map and quest in sync', ZI2.worldCell(f.fallow.gx, f.fallow.gy, 'scavenge').state !== 'cleared' && ZI2.getFallowQuest().state === 'active');
}

// ── Sep 30 decisions ──
{
  // Criminal: harder terms whichever way in; kit kept on the offering path
  const T = mkEnv(10010), ZI = T.ZI, f = ZI.getFortPos();
  ZI.setPolicy ? ZI.setPolicy('criminal', true) : T.ls.setItem('zi_wander_policy', JSON.stringify({ id:'criminal', since:0 }));
  const kit0 = T.stashCount('medkit');
  const r = ZI.fortOffer();
  const q = ZI.getFallowQuest();
  check('Criminal offering → harder terms (60, +25), entry recorded as offering', r.ok && q.terms === 'check' && q.entry === 'offering' && ZI.fallowGoal() === 60, 'policy=' + ZI.getPolicy().id + ' terms=' + q.terms);
  check('Criminal offering keeps the med kit', T.stashCount('medkit') === kit0);
}
{
  // Camp not allowed on the quest cell until turned in
  const T = mkEnv(11011), ZI = T.ZI, f = ZI.getFortPos();
  const fal = ZI.worldCell(f.fallow.gx, f.fallow.gy, 'scavenge');
  check('Camp: allowed on Fallow cell before the quest exists', ZI.canCampAt(fal));
  ZI.fortOffer();
  check('Camp: blocked on Fallow cell while quest active', !ZI.canCampAt(fal));
  T.standIn(f.fallow); T.kills(40);
  check('Camp: blocked on Fallow cell while quest ready', ZI.getFallowQuest().state === 'ready' && !ZI.canCampAt(fal));
  T.standIn(f); ZI.fortTurnIn();
  check('Camp: allowed on Fallow cell after turn-in', ZI.getFallowQuest().state === 'done' && ZI.canCampAt(fal));
  check('Camp: allowed elsewhere', ZI.canCampAt(ZI.worldCell(f.gx, f.gy, 'scavenge')));
}
{
  // Hearthguard start standing world-seeded in −150..+150
  const vals = [1, 2, 3, 4, 5, 6].map(sd => { const T = mkEnv(sd * 997); return T.ZI.getRep('hearthguard'); });
  check('HG start standing in [−150, 150] and seed-dependent', vals.every(v => v >= -150 && v <= 150) && new Set(vals).size > 1, vals.join(','));
}
{
  // Survey log queued for the Wandering combat log (once)
  const T = mkEnv(12012), ZI = T.ZI, f = ZI.getFortPos();
  ZI.fortOffer(); T.standIn(f.fallow); T.kills(40); T.standIn(f); ZI.fortTurnIn();
  const q1 = ZI.drainWanderLog(), q2 = ZI.drainWanderLog();
  check('Survey log: one queued message naming the Survey Point, drained once', q1.length === 1 && q1[0].includes(ZI.getSurveyPoint().coord) && q2.length === 0, JSON.stringify(q1));
}
{
  // 12.3 wear ×2 in Fort cell + neighbours after any attack; ends when Fort cell is cleared again
  const T = mkEnv(13013), ZI = T.ZI, f = ZI.getFortPos();
  check('Wear: ×1 before any attack', ZI.fortWearMult() === 1);
  T.standIn(f.fallow);
  const r = Math.random; Math.random = () => 0.99; ZI.fortAttack(); Math.random = r; // failed attack
  check('Wear: failed attack does NOT start ×2', ZI.fortWearMult() === 1 && !ZI._rj('zi_fort_wear', null));
  T.kills(5); // kills before the successful attack must not count toward "cleared again"
  Math.random = () => 0; ZI.fortAttack(); Math.random = r; // successful attack
  check('Wear: ×2 next to the Fort after a successful attack', ZI.fortWearMult() === 2);
  T.standIn(f);
  check('Wear: ×2 in the Fort cell', ZI.fortWearMult() === 2);
  T.standIn(T.start);
  check('Wear: ×1 away from the Fort', ZI.fortWearMult() === 1);
  T.standIn(f.fallow); T.kills(50);
  T.standIn(f);
  check('Wear: kills in another cell do not end it', ZI.fortWearMult() === 2);
  const route = (ZI.ROUTES || [])[0]; if (route) ZI.completeRun(route, [], 'passive', 0);
  check('Wear: Routes combat does not end it', ZI.fortWearMult() === 2);
  T.kills(39);
  check('Wear: still ×2 at 39 new Fort-cell kills', ZI.fortWearMult() === 2);
  T.kills(1);
  check('Wear: ends at 40 new Fort-cell kills', ZI.fortWearMult() === 1 && !ZI._rj('zi_fort_wear', null));
  check('Wear: nothing in the game sets zi_fort_reconciled', !ZI._rj('zi_fort_reconciled', false));
}

{
  // Survey Point: a saved point is never relocated (old save with a point 2 cells away)
  const T = mkEnv(14014), ZI = T.ZI, f = ZI.getFortPos();
  const old = { gx: f.gx + 2, gy: f.gy, coord: 'OLD' };
  T.ls.setItem('zi_survey_point', JSON.stringify(old));
  ZI.placeSurveyPoint();
  check('Survey: saved point is not relocated', JSON.stringify(ZI.getSurveyPoint()) === JSON.stringify(old));
}
{
  // Hearthguard: existing save keeps its stored standing
  const T = mkEnv(15015), ZI = T.ZI;
  const s = ZI.getContractSave(); s.repByFaction.hearthguard = 180; s._repSeeded = true; ZI.saveContractSave(s);
  const ZI2 = T.reload();
  check('HG: existing save keeps its standing (180)', ZI2.getRep('hearthguard') === 180);
}
{
  // Criminal via check: harder terms, entry recorded as check, kit kept
  const T = mkEnv(16016), ZI = T.ZI;
  T.ls.setItem('zi_wander_policy', JSON.stringify({ id:'criminal', since:0 }));
  const k0 = T.stashCount('medkit'); T.forceCheckPass(); const q = ZI.getFallowQuest();
  check('Criminal check: terms=check, entry=check, kit kept', q.terms === 'check' && q.entry === 'check' && T.stashCount('medkit') === k0, 'policy=' + ZI.getPolicy().id);
}
{
  // Quest/cell state stays distinct: kill count, cleared, target, progress, ready, done
  const T = mkEnv(17017), ZI = T.ZI, f = ZI.getFortPos(), k = f.fallow.gx + ',' + f.fallow.gy;
  T.standIn(f.fallow); T.kills(40);
  const cleared40 = ZI.isCellCleared(f.fallow.gx, f.fallow.gy);
  T.forceCheckPass();
  const q = ZI.getFallowQuest();
  check('State: kill count unchanged by accepting (40)', (ZI.getCellKills()[k] || 0) === 40);
  check('State: cleared at 40 before; uncleared under 60-kill terms (brief-approved flip)', cleared40 && !ZI.isCellCleared(f.fallow.gx, f.fallow.gy));
  check('State: target 60, progress 40, not ready, not done', ZI.fallowGoal() === 60 && ZI.fallowProgress() === 40 && q.state === 'active');
}

{
  // HG init regression: no stored standing → seed value (never 180), persisted; stored → preserved
  const T = mkEnv(18018), ZI = T.ZI;
  T.ls.setItem('zi_contracts', JSON.stringify({ v: ZI.CONTRACT_VER, active: [], repByFaction: { ironmarch: 240 }, completedCount: 0, _repSeeded: true }));
  const v = ZI.getRep('hearthguard'), seeded = ZI.seededHearthguardRep();
  const stored = JSON.parse(T.ls.getItem('zi_contracts')).repByFaction.hearthguard;
  check('HG init: no stored standing (seeded flag set) → seed value, persisted, not 180', v === seeded && stored === seeded && v !== 180 && v >= -150 && v <= 150, 'v=' + v);
  const T2 = mkEnv(19019), Z2 = T2.ZI;
  T2.ls.setItem('zi_contracts', JSON.stringify({ v: Z2.CONTRACT_VER, active: [], repByFaction: {}, completedCount: 0 }));
  check('HG init: no stored standing (legacy, unseeded) → seed value', Z2.getRep('hearthguard') === Z2.seededHearthguardRep());
  const T3 = mkEnv(20020), Z3 = T3.ZI;
  T3.ls.setItem('zi_contracts', JSON.stringify({ v: Z3.CONTRACT_VER, active: [], repByFaction: { hearthguard: 77 }, completedCount: 0 }));
  check('HG init: explicit stored value preserved even before one-time fold', Z3.getRep('hearthguard') === 77 && JSON.parse(T3.ls.getItem('zi_contracts')).repByFaction.hearthguard === 77);
}


// ── Brief 12.6 decisions ──
{
  // #1 eligibility −250..+249, not Heinous
  const T = mkEnv(26001), ZI = T.ZI;
  const setRep = (v) => { const s = ZI.getContractSave(); s.repByFaction.hearthguard = v; ZI.saveContractSave(s); };
  setRep(-251); check('12.6#1: −251 not eligible', !ZI.fortQuestEligibility().ok);
  setRep(-250); check('12.6#1: −250 eligible', ZI.fortQuestEligibility().ok);
  setRep(249);  check('12.6#1: +249 eligible', ZI.fortQuestEligibility().ok);
  setRep(250);  check('12.6#1: +250 not eligible', !ZI.fortQuestEligibility().ok);
  setRep(0); ZI._wj('zi_heinous_unlocked', true); ZI.setPolicy && ZI.setPolicy('heinous', true);
  const heinous = ZI.getPolicy().id === 'heinous';
  check('12.6#1: Heinous policy not eligible', heinous ? !ZI.fortQuestEligibility().ok : true, heinous ? '' : 'policy switch unavailable headless');
  setRep(-400); const r = ZI.fortOffer(); check('12.6#1: offer refused when Hostile', !r.ok && ZI.getFallowQuest().state === 'none');
}
{
  // #2 placement inside the starting view, 2–3 Chebyshev, with an unlocked neighbour
  let okAll = true, bad = [];
  for (const seed of [101,202,303,404,505,606,707,808,909,1111,2222,3333]) {
    const T = mkEnv(seed), ZI = T.ZI, f = ZI.getFortPos(), s = T.start;
    if (!f) { okAll = false; bad.push(seed + ':none'); continue; }
    const C = ZI.SECTOR_COLS, R = ZI.SECTOR_ROWS;
    const sameView = Math.floor(f.gx / C) === Math.floor(s.gx / C) && Math.floor(f.gy / R) === Math.floor(s.gy / R);
    const d = Math.max(Math.abs(f.gx - s.gx), Math.abs(f.gy - s.gy));
    const fal = Math.max(Math.abs(f.fallow.gx - f.gx), Math.abs(f.fallow.gy - f.gy));
    const stored = !!T.ls.getItem('zi_fort1_pos');
    if (!(sameView && d >= 2 && d <= 3 && fal === 1 && stored)) { okAll = false; bad.push(seed + ':d' + d + (sameView ? '' : ':outside')); }
  }
  check('12.6#2: Fort inside start view, 2–3 cells, Fallow neighbour, stored (12 seeds)', okAll, bad.join(' '));
}
{
  // #3 failed attack = 25% of max HP, floor 1
  const T = mkEnv(26003), ZI = T.ZI;
  ZI.syncWanderState({ hp: 100 });
  const R = Math.random; Math.random = () => 0.999; ZI.fortAttack(); Math.random = R;
  check('12.6#3: failed attack 100 → 75 HP', ZI.getWanderRun().hp === 75, 'hp=' + ZI.getWanderRun().hp);
  ZI.syncWanderState({ hp: 10 });
  Math.random = () => 0.999; ZI.fortAttack(); Math.random = R;
  check('12.6#3: never below 1 HP', ZI.getWanderRun().hp === 1);
  check('12.6#3: no difficulty stored → ×1', ZI.difficultyMult('fortAttackHp') === 1);
}
{
  // #4 starter kit: once, with pouch + med kit + scout kit; old save with old flag gets no 2nd med kit
  const T = mkEnv(26004), ZI = T.ZI;
  check('12.6#4: new save has pouch, med kit, scout kit', T.stashCount('handmade_pouch') === 1 && T.stashCount('medkit') === 1 && T.stashCount('scout_kit') === 1);
  ZI.ensureStarterKit(); T.reload().ensureStarterKit();
  check('12.6#4: granted once (repeat calls + reload)', T.stashCount('medkit') === 1 && T.stashCount('scout_kit') === 1 && T.stashCount('handmade_pouch') === 1);
  const T2 = mkEnv(26005), Z2 = T2.ZI;
  T2.ls.setItem('zi_stash', JSON.stringify({ v: Z2.STASH_VER, items:['medkit'] })); T2.ls.setItem('zi_fort_starter_given', 'true'); T2.ls.setItem('zi_starter_kit_given', 'false');
  Z2.ensureStarterKit();
  check('12.6#4: old save (old med-kit flag) gets pouch + scout kit, no 2nd med kit', T2.stashCount('medkit') === 1 && T2.stashCount('scout_kit') === 1 && T2.stashCount('handmade_pouch') === 1);
}
{
  // #5 Sealed Crate 2 kg, isStory, cannot be removed
  const T = mkEnv(26006), ZI = T.ZI, it = ZI.getGearItem('sealed_crate');
  check('12.6#5: Sealed Crate 2 kg and isStory', it && it.carryW === 2 && it.isStory === true);
  ZI.grantGear('sealed_crate', 1);
  check('12.6#5: story item refused by removeFromStash', ZI.removeFromStash('sealed_crate', 'drop') === false && T.stashCount('sealed_crate') === 1);
  check('12.6#5: non-story item can be removed', ZI.removeFromStash('scout_kit', 'drop') === true);
}
// ── Probe: spec ambiguities (reported, not decided) ──
{
  const T = mkEnv(9009), ZI = T.ZI, f = ZI.getFortPos();
  T.standIn(f.fallow); T.kills(40);
  const pre = ZI.worldCell(f.fallow.gx, f.fallow.gy, 'scavenge').state;
  T.forceCheckPass();
  const post = ZI.worldCell(f.fallow.gx, f.fallow.gy, 'scavenge').state;
  log('PROBE 40 kills then check terms: map ' + pre + ' → ' + post + ', quest ' + ZI.getFallowQuest().state);
  const T2 = mkEnv(9010), Z2 = T2.ZI, f2 = Z2.getFortPos();
  T2.ls.setItem('zi_trav_camp', JSON.stringify(Z2.zoneFromCell(Z2.worldCell(f2.fallow.gx, f2.fallow.gy, 'scavenge'))));
  Z2.fortOffer();
  log('PROBE camp on Fallow cell, 0 kills: quest ' + Z2.getFallowQuest().state);
}

const fails = results.filter(r => r[0] === 'FAIL');
log(results.map(r => r.join('  ')).join('\n'));
log(`\n${results.length - fails.length}/${results.length} passed`);
})();
