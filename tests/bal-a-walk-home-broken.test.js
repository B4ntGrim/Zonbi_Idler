// Batch BAL-A: Walk home and Broken — acceptance checks 1–10 (CURRENT_BATCH.md; slice brief §2 A1–A8, §3 O5–O8, §3a D1–D7b).
// Deterministic where a branch depends on a roll: scripted rolls (seq) instead of random aggregates.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const screen = await readFile('screens-v3.jsx');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const HOME = { gx:0, gy:0, name:'Home', biome:'suburbia', difficulty:1 }, FAR = { gx:6, gy:5, name:'Far', biome:'suburbia', difficulty:1 };
const mkEnv = (opt) => {
  opt = opt || {};
  const store = Object.assign({ zi_world_seed:'12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify(opt.far ? FAR : HOME) }, opt.store || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const doc = { hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] };
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document: doc, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw); const ZI = fw.ZI; ZI.wanderMounted = false;
  ZI._wj('zi_charges', { heal: opt.heals == null ? 0 : opt.heals, scout: 0 });
  return { ZI, store, doc };
};
const run0 = (ZI, o) => Object.assign(ZI.defaultWanderRun(), { active:true, hp:100, moveSpeed:3, scroll:400, scrollUm:400e6, lastCheckpoint:250, checkpoints:[250], _simNow: 1790500000000 }, o || {});
const seq = (a, d) => { let i = 0; return () => (i < a.length ? a[i++] : (d == null ? 0.5 : d)); };
const adv = (ZI, st, sec, rng, step, away) => { const ev = []; let t = 0, k = 0; away = away || ZI.WanderSim.emptySummary(); while (t < sec - 1e-9) { const sz = Array.isArray(step) ? step[k++ % step.length] : (step || sec); const d = Math.min(sz, sec - t); ZI.WanderSim.advance(st, d, away, rng, ev); t += d; } let g = 0; while (st._carryMs > 0 && g++ < 10000) ZI.WanderSim.advance(st, 0, away, rng, ev); return ev; };
const kinds = (ev, k) => ev.filter(e => e.kind === k);
const setRep = (ZI, fid, v) => { ZI.getRep(fid); const s = ZI.getContractSave(); s.repByFaction[fid] = v; ZI.saveContractSave(s); };
const quiet = (ZI) => { ZI.WALK_HOME_TABLE.groups.meetPct = 0; ZI.WALK_HOME_TABLE.pursuers.countWeights = [100, 0, 0]; };

// ── 1: rule 5 scope (A1, D3): no encounters, policy events or discoveries on the walk back; timers frozen ──
{ const { ZI } = mkEnv({ far:true, heals:5 }); quiet(ZI); const st = run0(ZI); ZI.wanderWithdraw(st);
  const t0 = [st._encMs || 0, st._polMs || 0, st._discMs || 0], ev = []; const away = ZI.WanderSim.emptySummary(); let tAt = null;
  for (let i = 0; i < 120 && !kinds(ev, 'withdrawn').length; i++) { ZI.WanderSim.advance(st, 1, away, ZI.seededRng(1), ev); if (kinds(ev, 'withdrawn').length && !tAt) tAt = [st._encMs || 0, st._polMs || 0, st._discMs || 0]; }
  const walk = ev.slice(0, ev.findIndex(e => e.kind === 'withdrawn'));
  check('1: walk back — 0 zombie encounters, 0 policy events, 0 new discoveries; encounter/policy/discovery timers frozen', walk.length >= 0 && !walk.some(e => e.kind === 'zombie' || e.kind === 'policy' || e.kind === 'prompt' || e.kind === 'discovery') && kinds(ev, 'withdrawn').length === 1 && JSON.stringify(tAt) === JSON.stringify(t0), JSON.stringify({ k: walk.map(e => e.kind), t0, tAt })); }

// ── 2: pursuers (A2, D5) — scripted rolls ──
{ const P = (rolls, o) => { const { ZI } = mkEnv({ far:true, heals:(o && o.heals) || 0 }); ZI.WALK_HOME_TABLE.groups.meetPct = 0; ZI.WALK_HOME_TABLE.pursuers.countWeights = [0, 100, 0];
    const st = run0(ZI, { hp: (o && o.hp) || 100, kills: 7, xp: 70 }); if (o && o.weapon) { const lo = ZI.getLoadout(); lo.melee = o.weapon; ZI.saveLoadout(lo); }
    ZI.wanderWithdraw(st); if (o && o.evade) st.retreatEvade = 30; const away = ZI.WanderSim.emptySummary(), ev = []; const dura0 = JSON.stringify(ZI.getDuraMap());
    ZI.WanderSim._walkHomeStart(st, away, ev, seq(rolls)); return { ZI, st, ev, away, dura0 }; };
  // rolls: group meet (no), pursuer count (1), escape roll, [fight: pursuer hit roll, damage roll] …
  const esc = P([0.99, 0, 0.1]);
  check('2: escape — 60% roll succeeds; no damage, no fight', kinds(esc.ev, 'pursuer').length === 1 && esc.ev[0].outcome === 'escaped' && esc.st.hp === 100, JSON.stringify(esc.ev));
  const hit = P([0.99, 0, 0.9, 0.1, 0]);     // no weapon: 10 damage, 15-HP pursuer survives one strike; it hits (30%) for 3; the next strike kills it
  check('2: hit — 30% roll lands for 3–6 (here 3); the survivor kills it next strike', hit.ev[0].outcome === 'fought' && hit.ev[0].dmg === 3 && hit.st.hp === 97, JSON.stringify(hit.ev[0]));
  const miss = P([0.99, 0, 0.9, 0.5]);
  check('2: miss — a roll ≥ 30% does no damage', miss.ev[0].outcome === 'fought' && miss.ev[0].dmg === 0 && miss.st.hp === 100);
  check('2: pursuers yield nothing — no XP, kills, loot or durability wear (D5a)', hit.st.kills === 7 && hit.st.xp === 70 && (hit.st.carried || []).length === 0 && JSON.stringify(hit.ZI.getDuraMap()) === hit.dura0);
  const wpn = P([0.99, 0, 0.9], { weapon: 'bat' });
  check('2: with a weapon the pursuer dies in one strike and the weapon does not wear', wpn.ev[0].outcome === 'fought' && wpn.ev[0].dmg === 0 && JSON.stringify(wpn.ZI.getDuraMap()) === wpn.dura0);
  const dn = P([0.99, 0, 0.9, 0.1, 0], { hp: 2 });
  check('2: HP ≤ 1 goes through the normal Downed path (no heal → Forced Retreat to Base)', dn.ev[0].outcome === 'downed' && dn.ev[0].downed === 'forcedRetreat' && dn.st.resting && dn.st.restAt === 'base', JSON.stringify(dn.ev[0]).slice(0, 160));
  const ev2 = P([0.99, 0, 0.9, 0.1, 0], { evade: true });
  check('2: a successful getaway changes nothing for pursuers (separate rolls, D5b)', JSON.stringify(ev2.ev[0]) === JSON.stringify(hit.ev[0]) && ev2.st.hp === hit.st.hp);
  const gw = mkEnv({ far:true }).ZI; const g = gw.retreatEvadeRoll(Object.assign(run0(gw), { withdrawing:true }), seq([0]), []);
  check('2: getaway text no longer promises evasion on the walk back', g.ok && !/evasion/.test(g.text), g.text); }

// ── 3: groups (A3, D4a) ──
{ const G = (rep, o) => { const { ZI } = mkEnv({ far:true }); ZI.WALK_HOME_TABLE.pursuers.countWeights = [0, 0, 100]; ZI.WALK_HOME_TABLE.groups.meetPct = 100; setRep(ZI, ZI.HEX_ORDER[0], rep);
    if (o && o.broken) ZI._wj(ZI.BROKEN_KEY, { on: true, rests: 0 });
    if (o && o.pocket) ZI.saveCarried([{ id:'medkit', qty:1, charges:2 }]);
    const st = run0(ZI, { carried: [{ name:'salvage', value:3, weight:1, seq:0 }, { name:'story', id:'sealed_crate', isStory:true, value:1, weight:1, seq:1 }] }); ZI.wanderWithdraw(st);
    const left0 = st.withdrawLeftM, away = ZI.WanderSim.emptySummary(), ev = []; let banked = null; const bk = ZI.bankWanderLoot; ZI.bankWanderLoot = (h) => { banked = h.map(x => x.name); return bk(h); };
    ZI.WanderSim._walkHomeStart(st, away, ev, seq((o && o.rolls) || [0, 0, 0.9])); return { ZI, st, ev, away, left0, banked }; };
  const fr = G(300);
  check('3: friendly (≥ 250) escorts — walk halved, no pursuers', kinds(fr.ev, 'walkGroup')[0].reaction === 'friendly' && Math.abs(fr.st.withdrawLeftM - fr.left0 / 2) < 1e-9 && !kinds(fr.ev, 'pursuer').length, JSON.stringify(kinds(fr.ev, 'walkGroup')[0]));
  const ne = G(100, { rolls: [0, 0, 0, 0.1, 0.1] });
  check('3: neutral (0–249) passes by; pursuers still roll', kinds(ne.ev, 'walkGroup')[0].reaction === 'neutral' && kinds(ne.ev, 'pursuer').length === 2);
  const ho = G(-10, { rolls: [0, 0, 0] });   // meet, faction 0, injury roll succeeds
  check('3: hostile (< 0) — mocked, injured, left Broken, sent home to rest at Base; haul kept and banked; not a Downing', kinds(ho.ev, 'walkGroup')[0].reaction === 'hostile' && ho.ZI.isBroken() && ho.ZI.getInjury() && ho.st.resting && ho.st.restAt === 'base' && JSON.stringify(ho.banked) === JSON.stringify(['salvage', 'story']) && !ho.ev.some(e => e.forcedRetreat || e.fr) && !ho.away.downedRetreats && !ho.away.forcedRetreats, JSON.stringify({ ev: ho.ev[0], banked: ho.banked }));
  check('3: hostile send-home moves the survivor home on the map and saves the return (D1)', JSON.stringify(ho.ZI._rj('zi_trav_pos')) === JSON.stringify({ gx:0, gy:0 }) && ho.ZI._rj(ho.ZI.TRAV_RETURN_KEY).gx === 6);
  const hb = G(-10, { broken: true, pocket: true, rolls: [0, 0, 0.9] });
  check('3: hostile while already Broken steals the run haul only — story items kept, pockets untouched (D4a)', kinds(hb.ev, 'walkGroup')[0].stolen === 1 && JSON.stringify(hb.banked) === JSON.stringify(['story']) && hb.ZI.getCarried().length === 1 && hb.ZI.getCarried()[0].id === 'medkit' && !hb.ZI.getInjury(), JSON.stringify({ ev: hb.ev[0], banked: hb.banked }));
  // cap: 3 meetings a day (real day, local midnight); a new day resets
  { const { ZI } = mkEnv({ far:true }); ZI.WALK_HOME_TABLE.pursuers.countWeights = [100, 0, 0]; ZI.WALK_HOME_TABLE.groups.meetPct = 100; setRep(ZI, ZI.HEX_ORDER[0], 100);
    let met = 0; const day0 = new Date(2026, 9, 19, 9, 0).getTime();
    for (let k = 0; k < 4; k++) { const st = run0(ZI, { _simNow: day0 + k * 3600000 }); ZI.wanderWithdraw(st); const ev = []; ZI.WanderSim._walkHomeStart(st, null, ev, seq([0, 0, 0])); met += kinds(ev, 'walkGroup').length; }
    const st5 = run0(ZI, { _simNow: day0 + 24 * 3600000 }); ZI.wanderWithdraw(st5); const ev5 = []; ZI.WanderSim._walkHomeStart(st5, null, ev5, seq([0, 0, 0]));
    check('3: the group cap holds at 3 a day and resets the next day', met === 3 && kinds(ev5, 'walkGroup').length === 1, met); }
  { const { ZI } = mkEnv(); check('3: groups stay unnamed before the Fort hand-in', /^Unnamed group/.test(ZI.factionDisplayName('ironmarch'))); } }

// ── 4: Broken (A4–A6, D4c) ──
{ const { ZI } = mkEnv({ far:true, heals:999 }); ZI.setRetreatRules({ loadIgnore:true }); const st = run0(ZI); ZI.setStress(99.6); ZI.WanderSim._stress(st, 1, null);
  let fr = 0; const f = ZI.forcedRetreat; ZI.forcedRetreat = function() { fr++; return f.apply(this, arguments); };
  const ev = []; ZI.WanderSim.advance(st, 0.001, ZI.WanderSim.emptySummary(), ZI.seededRng(1), ev);
  check('4: max stress → Broken, stress 80, no Forced Retreat, the run continues', kinds(ev, 'broken').length === 1 && ev[0].entered && ZI.getStress() <= 80.0001 && ZI.getStress() >= 79.99 && fr === 0 && !st.resting, JSON.stringify(ev[0]));
  check('4: Broken penalties — max HP 82, speed ×0.7', ZI.maxHp() === 82 && Math.abs(ZI.SurvivorRules.moveSpeed({ moveMode:'walk' }) - 3 * 0.7) < 1e-9 && st.hp <= 82);
  const F = ZI.STAT_FORMULAS; const atk = { accuracy:0, damageMin:10, damageMax:10, crit:0, attackLossPct:18 }, def = { evasion:0, armor:0, hp:100 };
  check('4: a Broken attack falters on an 18% roll (and lands otherwise)', F.resolveAttack(Object.assign({}, atk), Object.assign({}, def), seq([0.1])).result === 'skip' && F.resolveAttack(Object.assign({}, atk), Object.assign({}, def), seq([0.5, 0, 0, 0.99])).result === 'hit');
  const d1 = Object.assign({}, def, { dmgTakenPct:5 }); F.resolveAttack({ accuracy:0, damageMin:20, damageMax:20, crit:0 }, d1, seq([0, 0, 0.99]));
  check('4: a Broken survivor takes +5% damage (20 → 21)', d1.hp === 79, d1.hp);
  check('4: overload doubles stress gains', ZI.ACTIVE_TABLE.load.overloadStressMult === 2); }
{ const rel = (rolls, o) => { const { ZI } = mkEnv(); ZI._wj(ZI.BROKEN_KEY, { on:true, rests:0 }); const lo = ZI.getLoadout(); lo.melee = 'bat'; lo.vest = 'vest_t1'; ZI.saveLoadout(lo);
    const m = ZI.getDuraMap(); m.bat = (o && o.bat != null) ? o.bat : 50; m.vest_t1 = (o && o.vest != null) ? o.vest : 50; ZI.saveDuraMap(m);
    const ev = [], r = seq(rolls); const out = []; for (let k = 0; k < 3 && ZI.isBroken(); k++) out.push(ZI.brokenRestCompleted({}, (o && o.where) || 'checkpoint', null, ev, r));
    return { ZI, ev, out, dura: ZI.getDuraMap() }; };
  const r1 = rel([0.1]), r2 = rel([0.5, 0.1]), r3 = rel([0.5, 0.5, 0.1]), r4 = rel([0.5, 0.5, 0.5, 0, 1]);
  check('4: release by roll at rest 1 (no cost)', r1.ev.length === 1 && r1.ev[0].by === 'roll' && r1.ev[0].rests === 1 && r1.dura.bat === 50 && !r1.ZI.isBroken());
  check('4: release by roll at rest 2 (no cost)', r2.ev.length === 1 && r2.ev[0].by === 'roll' && r2.ev[0].rests === 2 && r2.dura.bat === 50);
  check('4: release by roll at rest 3 — the third rest still rolls (no cost)', r3.ev.length === 1 && r3.ev[0].by === 'roll' && r3.ev[0].rests === 3 && r3.dura.bat === 50 && r3.dura.vest_t1 === 50);
  check('4: three failed rolls → forced release after the third, weapon −5% and vest −10% of max (50 → 47, 45)', r4.ev.length === 1 && r4.ev[0].by === 'forced' && r4.ev[0].rests === 3 && r4.dura.bat === 47 && r4.dura.vest_t1 === 45 && !r4.ZI.isBroken(), JSON.stringify(r4.dura));
  const fl = rel([0.5, 0.5, 0.5, 1, 1], { bat: 6, vest: 3 });
  check('4: the cost never goes below 10% of max and never raises an item already below it', fl.dura.bat === 5 && fl.dura.vest_t1 === 3, JSON.stringify(fl.dura));
  const dl = rel([0.1], { where: 'deliberate' });
  check('4: only automatic rests count (checkpoint, Base, Jester camp) — another rest type does nothing (D4c)', dl.out[0] === null && dl.ZI.getBroken().rests === 0 && dl.ZI.isBroken()); }

// ── 5: home and return (D1), resume gate (A5) ──
{ const { ZI } = mkEnv({ far:true, heals:0 }); const st = run0(ZI); const fr = ZI.forcedRetreat(st, 'downed', ZI.seededRng(1));
  const atHome = JSON.stringify(ZI._rj('zi_trav_pos')) === JSON.stringify({ gx:0, gy:0 }), saved = ZI._rj(ZI.TRAV_RETURN_KEY);
  const st2 = run0(ZI, { resting:true, restAt:'base', restStartHp:100, restElapsedMs:0 }); const fr2 = ZI.forcedRetreat(Object.assign(run0(ZI)), 'downed', ZI.seededRng(2)); // a second Forced Retreat while home
  const kept = ZI._rj(ZI.TRAV_RETURN_KEY) && ZI._rj(ZI.TRAV_RETURN_KEY).gx === 6;
  const ev = []; ZI.WanderSim.advance(st2, 0.001, ZI.WanderSim.emptySummary(), ZI.seededRng(1), ev);
  check('5: Forced Retreat moves home (starting cell), saves the cell; a second one at home keeps it; the rest end returns instantly, with no prompt', fr.movedHome && atHome && saved && saved.gx === 6 && kept && kinds(ev, 'returned').length === 1 && ZI._rj('zi_trav_pos').gx === 6 && !ZI._rj(ZI.TRAV_RETURN_KEY), JSON.stringify(ev.map(e => e.kind))); }
{ const { ZI } = mkEnv({ far:true, store:{ zi_trav_camp: JSON.stringify({ gx:2, gy:1 }) } }); ZI.forcedRetreat(run0(ZI), 'downed', ZI.seededRng(1));
  check('5: home is the player\'s camp when one exists', ZI._rj('zi_trav_pos').gx === 2 && ZI._rj('zi_trav_pos').gy === 1);
  ZI.clearTravReturn();
  check('5: the saved return can be cleared (manual travel, Make camp, Jester relocation use this)', !ZI._rj(ZI.TRAV_RETURN_KEY) && /clearTravReturn/.test(String(ZI.Jester._finishTrade)) && (screen.match(/clearTravReturn/g) || []).length >= 2); }
{ const { ZI } = mkEnv(); const st = run0(ZI, { hp:20, resting:true, restAt:'checkpoint', restStartHp:20, restElapsedMs:0 }); ZI.setStress(90);
  const need = Math.ceil(60 / (100 * 5 / 100 / 60000)); ZI.WanderSim.advance(st, (need - 1) / 1000, null, ZI.seededRng(1), []); const before = st.resting;
  const ev = []; ZI.WanderSim.advance(st, 0.001, null, ZI.seededRng(1), ev);
  check('5: the resume gate is HP only — stress 90 does not hold the rest past HP 80', before && !st.resting && kinds(ev, 'resumed')[0].hp === 80, need);
  const rr = ZI.retreatRulesTrue(run0(ZI)); ZI.setStress(99);
  check('5: the stress retreat rule never fires', !ZI.retreatRulesTrue(run0(ZI)).some(c => c.rule === 'stress')); }

// ── 6/9: injury (O5–O7, D2, D4b, D7b) ──
{ const { ZI, doc } = mkEnv(); const T = ZI.INJURY_TABLE;
  ZI.applyInjury('test', false);
  check('9: a new injury lasts 1.5 real hours (combat and athletics −10%)', ZI.getInjury().remainingMs === 90 * 60000 && ZI.getInjury().skills.join() === 'combat,athletics' && ZI.getInjury().pct === 0.10);
  const a = ZI.injuryCreditTick(1000), b = ZI.injuryCreditTick(2000), c = ZI.injuryCreditTick(2000 + 3600000);
  check('9: visible ticks count it down (first tick credits 0, then the real gap, capped at 5 s per tick)', a === 0 && b === 1000 && c === 5000 && ZI.getInjury().remainingMs === 90 * 60000 - 6000, [a, b, c].join(','));
  doc.hidden = true; doc.visibilityState = 'hidden'; const h1 = ZI.injuryCreditTick(3700000); doc.hidden = false; doc.visibilityState = 'visible'; const h2 = ZI.injuryCreditTick(3800000);
  check('9: a hidden page never counts, and the first visible tick after it credits 0', h1 === 0 && h2 === 0 && ZI.getInjury().remainingMs === 90 * 60000 - 6000);
  const r0 = ZI.getInjury().remainingMs; ZI._injPresent = true; ZI.injuryOnDamage(10); const r1 = ZI.getInjury().remainingMs; ZI.injuryOnDamage(1000); const r2 = ZI.getInjury().remainingMs; ZI._injPresent = false; ZI.injuryOnDamage(10); const r3 = ZI.getInjury().remainingMs;
  check('9: damage while present adds 30 s per HP (cap 3 h); damage outside a present window adds nothing', r1 === r0 + 300000 && r2 === T.capMs && r3 === r2, [r0, r1, r2, r3].join(','));
  ZI._wj(ZI.INJURY_KEY2, Object.assign(ZI.getInjury(), { remainingMs: 600000 })); ZI.applyInjury('again', false);
  check('9: a re-injury sets the larger of the time left or 1.5 h (no stacking)', ZI.getInjury().remainingMs === 90 * 60000); }
{ const { ZI } = mkEnv(); const c = { t: 1790500000000 }; ZI.installClock(() => c.t); ZI.WanderEngine.rng = ZI.seededRng(3); ZI.WanderEngine._lead = () => true;
  ZI.applyInjury('test', false); ZI.saveWanderRun(run0(ZI, { lastTickAt: c.t })); c.t += 72 * 3600000; ZI.WanderEngine.tick(c.t);
  check('9: a 72-h offline catch-up neither counts down nor extends the injury (frozen while closed, O6)', ZI.getInjury().remainingMs === 90 * 60000); }
{ const cure = (o) => { const { ZI } = mkEnv(); if (o.pocket) ZI.saveCarried(o.pocket); if (o.slot) { const lo = ZI.getLoadout(); lo.consumable1 = o.slot; ZI.saveLoadout(lo); }
    const st = { hp: 40 }; ZI.applyInjury('t', st); return { ZI, st }; };
  const p = cure({ pocket: [{ id:'field_bandage', qty:2 }] }), s = cure({ slot: 'field_bandage' }), m = cure({ pocket: [{ id:'medkit', qty:1, charges:2 }] });
  check('9: a Field Bandage in a pocket is used at once — injury cured, one bandage spent, its heal applied (D4b)', !p.ZI.getInjury() && p.ZI.getCarried()[0].qty === 1 && p.st.hp === 70);
  check('9: a Field Bandage in a consumable slot also cures it', !s.ZI.getInjury() && s.ZI.getLoadout().consumable1 === null);
  check('9: a Medkit does not cure the injury (O7)', !!m.ZI.getInjury() && m.ZI.getCarried().length === 1);
  check('9: Make camp no longer treats the injury (O5)', !/treatInjury\(1\)/.test(screen)); }
{ const mig = (untilFromNow) => { const { ZI } = mkEnv(); ZI._wj('zi_injury', { skills:['combat','athletics'], pct:0.10, until: ZI.clockNow() + untilFromNow }); ZI._migrateInjuryV2(); return ZI; };
  const a = mig(3 * 86400000), b = mig(5 * 60000), c = mig(-1000);
  check('9: migration (D7b) — an old multi-day injury becomes 1.5 h; a short one keeps its real time; an expired one is dropped; the old key is removed',
    a.getInjury().remainingMs === 90 * 60000 && Math.abs(b.getInjury().remainingMs - 5 * 60000) < 50 && !c.getInjury() && a._rj('zi_injury', null) === null, [a.getInjury().remainingMs, b.getInjury() && b.getInjury().remainingMs].join(','));
  const { ZI } = mkEnv(); ZI.setInjury(3);
  check('9: the Fort guard injury uses the same rule (1.5 h)', ZI.getInjury().remainingMs === 90 * 60000); }

// ── 7: parity through a walk back with pursuers, a group and Broken (named exception: injury growth only while present) ──
{ const sig = (step) => { const { ZI } = mkEnv({ far:true, heals:0 }); ZI._wj('zi_wander_policy', { id:'heinous', changedAt:0 }); ZI.WALK_HOME_TABLE.groups.meetPct = 50; ZI.WALK_HOME_TABLE.pursuers.countWeights = [0, 50, 50]; const st = run0(ZI); const away = ZI.WanderSim.emptySummary();
    const ev = adv(ZI, st, 3 * 3600, ZI.seededRng(19), step, away);
    return { s: JSON.stringify({ k: ev.map(e => e.kind + ':' + (e.outcome || e.reaction || e.downed || '')), hp: st.hp, u: ZI.getStressState().u, um: st.scrollUm, rest: st.resting, br: ZI.getBroken(), pos: ZI._rj('zi_trav_pos') }), ev }; };
  const a = sig(1), b = sig([1.3, 0.7, 2.9]), c = sig(null);
  const has = (k) => a.ev.some(e => e.kind === k);
  check('7: 1-s, uneven and bulk processing identical through walks back (pursuers, groups), Broken and rests', a.s === b.s && b.s === c.s && has('pursuer') && has('withdrawn'), [a.s === b.s, b.s === c.s, has('pursuer'), has('walkGroup'), has('broken')].join('/')); }

// ── 10: presentation (A8, D6) ──
{ const { ZI } = mkEnv(); const away = { walkGroups:['Unnamed group A pass by on the road and leave you be.'], pursuersMet:2, pursuersEscaped:1, brokenEntries:1, brokenReleases:1, injuryTreated:1 };
  const rows = ZI.returnReport(away).join(' | ');
  check('10: the return report names groups, pursuers, Broken entry and release, and a treated injury', /Unnamed group A/.test(rows) && /Crawlers on the way back: 2 met, 1 slipped/.test(rows) && /Went Broken 1×/.test(rows) && /Recovered from Broken 1×/.test(rows) && /Field Bandage used/.test(rows), rows);
  check('10: status icons for Broken and Injured sit beside the survivor name (Broken first) with effect tooltips', /data-status-icons/.test(screen) && /data-status="broken"/.test(screen) && /data-status="injured"/.test(screen) && screen.indexOf('data-status="broken"') < screen.indexOf('data-status="injured"') && /paused while the game isn't visible/.test(screen));
  check('10: the HP bar reads the current max HP; old stress-gate and walk-back wording is gone', /ZI\.maxHp/.test(screen) && !/stress < 70/.test(screen) && !/encounters can still happen/.test(screen));
  check('10: the log shows every new event kind', ['broken','brokenReleased','walkGroup','pursuer','returned','injuryTreated'].every(k => screen.includes("r.kind === '" + k + "'"))); }

// ── Smoke-test fixes (Oct 20) ──
{ const { ZI } = mkEnv(); ZI._wj('zi_trav_camp', HOME); ZI._wj('zi_trav_pos', FAR); ZI.clearTravReturn();
  const seen = []; const off = ZI.onTravPosChange(() => seen.push(ZI._rj('zi_trav_pos', null)));
  const moved = ZI._sendHomeOnMap(); const back = ZI._returnFromHome(); off();
  check('smoke: the map is told when the game moves the survivor (sent home, then returned)', moved && back && seen.length === 2 && seen[0].gx === 0 && seen[1].gx === 6, JSON.stringify(seen));
  ZI._wj('zi_trav_pos', HOME); const seen2 = []; const off2 = ZI.onTravPosChange(() => seen2.push(1));
  const atHome = ZI._sendHomeOnMap(); off2();
  check('smoke: already home — nothing saved, no notice', atHome === false && seen2.length === 0 && ZI._rj('zi_trav_return', null) === null);
  check('smoke: the Traversal map subscribes to position changes', /ZI\.onTravPosChange/.test(screen));
  check('smoke: no HP display is hard-coded to /100', !/HP[^\n`]{0,40}\/100\b/.test(screen.replace(/stress[^\n]*\/100/gi, '')), (screen.match(/HP[^\n`]{0,40}\/100\b/g) || []).join(' | ')); }

{ check('save: the injury migration is registered as the newest version', (() => { const { ZI } = mkEnv(); return /_migrateInjuryV2/.test(String(ZI.SAVE_MIGRATIONS[ZI.SAVE_FORMAT.current])); })()); }
return results;
})();
