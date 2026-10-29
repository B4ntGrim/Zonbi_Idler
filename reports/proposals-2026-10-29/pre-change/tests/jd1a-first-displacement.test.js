// Batch JD1a: first displacement (reference/jd1a-batch-draft.md v5; CURRENT_BATCH.md). Rules only; the switch is turned on
// only inside this test's own environments (ZI.Jester.TABLE.firstMeetingOn), never in a save.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const activeSrc = await readFile('game/active.js');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const T0 = 1790500000000, H = 3600000, DAY = 24 * 60000; // CLOCK-01: the Jester's stay remains 3–5 full game days
// mkEnv: a fresh browser-like environment. store0 = saved keys; on = switch for this environment only; map = optional cell-state function.
const mkEnv = (store0, opt) => {
  opt = opt || {};
  const store = Object.assign({ zi_world_seed: '12345' }, store0 || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw); const ZI = fw.ZI; ZI.wanderMounted = false;
  const c = { t: T0 }; ZI.installClock(() => c.t);
  if (opt.on) ZI.Jester.TABLE.firstMeetingOn = true;
  if (opt.map) { const orig = ZI.worldCell; ZI.worldCell = (gx, gy, type) => Object.assign(orig(gx, gy, type), { state: opt.map(gx, gy) }); }
  return { ZI, store, c };
};
const J = (ZI) => ZI.Jester.get();
const items = (ZI) => ({ stash: ZI.getStash().slice().sort(), lo: Object.values(ZI.getLoadout()).filter(Boolean).sort(), car: ZI.getCarried().map(e => e.id + 'x' + e.qty).sort() });
const kitCount = (ZI) => { const all = ZI.getStash().concat(Object.values(ZI.getLoadout())); return ['handmade_pouch', 'scout_kit'].map(id => all.filter(x => x === id).length + ZI.getCarried().filter(e => e.id === id).reduce((a, e) => a + e.qty, 0)).join('/'); };
// A run ready to be Downed at square (gx, gy): no heals, no revive; a haul with a story item; carried items with a story item.
const sector = (gx, gy) => ({ gx, gy });
const prime = (E, pos, opt) => {
  opt = opt || {}; const { ZI } = E;
  ZI._wj('zi_trav_pos', ZI.zoneFromCell(ZI.worldCell(pos.gx, pos.gy, 'scavenge')));
  ZI._wj('zi_charges', { heal: 0, scout: 0 }); ZI._wj('zi_base_charges', { heal: 0, scout: 0 });
  if (ZI.getBaseCharges) { const b = ZI.getBaseCharges(); if (b.heal) { ZI.refillBaseCharges = () => {}; } }
  ZI.saveCarried([{ id: 'ration', qty: 3 }, { id: 'medkit', qty: 1 }]);
  const run = Object.assign(ZI.defaultWanderRun(), { active: true, hp: 1, scroll: 300, scrollUm: 300e6, lastTickAt: E.c.t, _simNow: E.c.t,
    carried: [{ id: 'scrap', name: 'Scrap A', value: 3, seq: 1 }, { id: 'scrap', name: 'Scrap B', value: 5, seq: 2 }, { id: 'sealed_crate', name: 'Sealed Crate', isStory: true, seq: 3 }] }, opt.run || {});
  ZI.saveWanderRun(run); return run;
};
const down = (E, seed) => { const { ZI } = E; const s = ZI.getWanderRun(); ZI.spendCharge = () => ({ ok: false }); ZI.simRevive = () => false;
  const d = ZI.WanderSim._downed(s, ZI.seededRng(seed || 3), ZI.WanderSim.emptySummary()); ZI.saveWanderRun(s); return d; };
const reload = (E) => { const snap = E.ZI._snapshot(); const E2 = mkEnv({}, { on: E.ZI.Jester.TABLE.firstMeetingOn }); E2.ZI._restore(snap); E2.c.t = E.c.t; E2.ZI.Jester.onLoad(); return E2; };
const reloadOff = (E) => { const snap = E.ZI._snapshot(); const E2 = mkEnv({}, { on: false }); E2.ZI._restore(snap); E2.c.t = E.c.t; E2.ZI.Jester.onLoad(); return E2; };
const reloadOn = (E) => { const snap = E.ZI._snapshot(); const E2 = mkEnv({}, { on: true }); E2.ZI._restore(snap); E2.c.t = E.c.t; E2.ZI.Jester.onLoad(); return E2; };
const P = sector(3, 3);                         // a square in sector (0,0)
const OPEN = () => 'available';

// ── Legacy saves (S1, B4) ──
{ const E = mkEnv({ zi_starter_kit_given: 'true', zi_save_version: '7' }, { on: true }); E.ZI.Jester.onLoad(); const a = JSON.stringify(items(E.ZI));
  const E2 = reload(reload(reload(E))); prime(E2, P); const d = down(E2);
  check('1: legacy save with the kit flag: record written once (not eligible, migrated); 3 more loads grant nothing; with the switch on its first Downing is the Base Forced Retreat',
    J(E.ZI).eligible === false && J(E.ZI).migrated === true && JSON.stringify(items(reload(reload(E)).ZI)) === a && d.fr && d.fr.kind === 'forcedRetreat' && !J(E2.ZI).phase, JSON.stringify(J(E.ZI))); }
{ const E = mkEnv({ zi_save_version: '7' }, { on: true }); E.ZI.Jester.onLoad(); const k1 = kitCount(E.ZI), med1 = E.ZI.getStash().filter(x => x === 'medkit').length;
  const E2 = reload(reload(E));
  check('2: legacy save without the kit flag: the old kit once on the first load (pouch, scout kit, med kit); later loads grant nothing',
    k1 === '1/1' && med1 === 1 && kitCount(E2.ZI) === '1/1' && E2.ZI.getStash().filter(x => x === 'medkit').length === 1 && E2.store.zi_starter_kit_given === 'true', k1 + ' med ' + med1); }
{ const E = mkEnv({ zi_fort_starter_given: 'true', zi_save_version: '7' }, { on: true }); E.ZI.Jester.onLoad(); E.ZI.Jester.onLoad();
  check('3: legacy save with only the earlier med-kit flag: no second med kit', E.ZI.getStash().filter(x => x === 'medkit').length === 0 && kitCount(E.ZI) === '1/1', JSON.stringify(items(E.ZI))); }
{ const E = mkEnv({}, { on: false }); E.ZI.Jester.onNewSave(); E.ZI.Jester.onLoad(); const k = kitCount(E.ZI);
  const E2 = reloadOn(E); prime(E2, P); const d = down(E2);
  check('3b: created with the switch off, loaded with it on: kit once, not eligible, no second kit, first Downing is the Base Forced Retreat (no trade)',
    k === '1/1' && J(E.ZI).eligible === false && kitCount(E2.ZI) === '1/1' && d.fr && d.fr.kind === 'forcedRetreat' && !J(E2.ZI).phase, k); }
{ const E = mkEnv({}, { on: true }); E.ZI.Jester.onNewSave(); E.ZI.Jester.onLoad();
  check('3c: created with the switch on: eligible, no kit items anywhere, kit flag not set',
    J(E.ZI).eligible === true && kitCount(E.ZI) === '0/0' && !E.ZI.getStash().includes('medkit') && !('zi_starter_kit_given' in E.store)); }

// ── The trade (S2) ──
const eligible = (opt) => { const E = mkEnv({}, Object.assign({ on: true, map: OPEN }, opt || {})); E.ZI.Jester.onNewSave(); prime(E, P); return E; };
{ const E = eligible(); const lo = E.ZI.getLoadout(); lo.vest = 'vest_t1'; E.ZI.saveLoadout(lo); E.ZI.grantGear('crowbar', 1);
  const before = { lo: JSON.stringify(E.ZI.getLoadout()), stash: JSON.stringify(E.ZI.getStash()) }; const d = down(E); const s = E.ZI.getWanderRun(), r = J(E.ZI);
  check('4: the trade takes the haul and carried items (not story items); equipped gear and stash untouched; recorded; resting at the camp',
    d.fr.kind === 'jesterDisplacement' && r.phase === 'resting' && s.carried.length === 1 && s.carried[0].id === 'sealed_crate' && E.ZI.getCarried().length === 0 && r.trade.names.join() === 'Scrap A,Scrap B'
    && JSON.stringify(E.ZI.getLoadout()) === before.lo && JSON.stringify(E.ZI.getStash()) === before.stash && s.resting && s.restAt === 'camp' && s.jesterCamp, JSON.stringify(r.trade.carried)); }

// ── Rewards once (S3, B3) ──
const atCamp = (opt) => { const E = eligible(opt); down(E); const s = E.ZI.getWanderRun(); s.resting = false; s.restAt = null; E.ZI.saveWanderRun(s); E.ZI.Jester.waitStep(s); E.ZI.saveWanderRun(s); return E; };
{ const E = atCamp(); const r1 = E.ZI.Jester.meet('pocket_knife'); const after = JSON.stringify(items(E.ZI)); const r2 = E.ZI.Jester.meet('bat'); const E2 = reload(E); const r3 = E2.ZI.Jester.meet('bat');
  const it = items(E.ZI);
  check('5: the meeting grants exactly jacket, Fort-bound Med Kit, 2 rations, pouch, scout kit and the chosen weapon; a second call and a call after reload grant nothing; kit flag set',
    r1.ok && !r2.ok && !r3.ok && JSON.stringify(items(E2.ZI)) === after && it.lo.join() === 'handmade_pouch,old_padded_jacket,pocket_knife' && it.stash.join() === 'fort_medkit' && it.car.join() === 'rationx2,scout_kitx1' && E.store.zi_starter_kit_given === 'true' && J(E.ZI).met === true,
    JSON.stringify(it)); }
{ const E = atCamp(); E.ZI.Jester.meet('iron_knuckles'); const it = items(E.ZI);
  check('5b: placement with empty slots: jacket in vest, pouch in backpack, weapon in melee; scout kit + 2 rations carried; story med kit in the stash',
    E.ZI.getLoadout().vest === 'old_padded_jacket' && E.ZI.getLoadout().backpack === 'handmade_pouch' && E.ZI.getLoadout().melee === 'iron_knuckles' && it.car.join() === 'rationx2,scout_kitx1' && it.stash.join() === 'fort_medkit', JSON.stringify(it)); }
{ const E = eligible(); const lo = E.ZI.getLoadout(); lo.vest = 'vest_t1'; lo.backpack = 'backpack_sm'; lo.melee = 'crowbar'; E.ZI.saveLoadout(lo); down(E);
  const s = E.ZI.getWanderRun(); s.resting = false; E.ZI.saveWanderRun(s); E.ZI.Jester.waitStep(s); E.ZI.saveWanderRun(s); E.ZI.Jester.meet('bat'); const L = E.ZI.getLoadout(), st = E.ZI.getStash().slice().sort();
  check('5c: placement with occupied slots: equipped vest, backpack and melee stay; jacket, pouch and weapon go to the stash',
    L.vest === 'vest_t1' && L.backpack === 'backpack_sm' && L.melee === 'crowbar' && st.join() === 'bat,fort_medkit,handmade_pouch,old_padded_jacket', st.join()); }

// ── The story med kit and the Fort (B1, B2) ──
{ const E = atCamp(); E.ZI.Jester.meet('bat'); const Z = E.ZI;
  const heal = Z.chargeTotals().kitHeal, dis = Z.canDiscard('fort_medkit'), rm = Z.removeFromStash('fort_medkit', 'sell');
  check('6: the Fort-bound Med Kit is a 1 kg story item: no healing charge, cannot be discarded, sold or removed; protected in a Forced Retreat',
    Z.isStoryItem('fort_medkit') && Z.getGearItem('fort_medkit').carryW === 1 && heal === 0 && dis === false && rm === false && Z.getStash().includes('fort_medkit') && Z._haulIsStory({ id: 'fort_medkit' }), JSON.stringify({ heal, dis, rm })); }
{ const E = mkEnv({}, {}); const Z = E.ZI; Z.grantGear('medkit', 1); Z.grantGear('fort_medkit', 1);
  const has = Z.hasMedKit(); Z.takeMedKit(); const st = Z.getStash().slice();
  const E2 = mkEnv({}, {}); E2.ZI.grantGear('medkit', 1); const has2 = E2.ZI.hasMedKit(); E2.ZI.takeMedKit();
  const E3 = mkEnv({}, {}); E3.ZI.grantGear('fort_medkit', 1);
  check('6b: both kits owned: the Fort hand-in takes the Fort-bound kit and leaves the Field Medkit; only a Field Medkit: unchanged; only the story kit: accepted',
    has && st.join() === 'medkit' && has2 && E2.ZI.getStash().length === 0 && E3.ZI.hasMedKit(), st.join()); }
{ const fortSrc = await readFile('game/fort.js');
  check('6c: the Fort module itself is unchanged in its terms (it still calls hasMedKit/takeMedKit only)', /ZI\.hasMedKit\(\)/.test(fortSrc) && /ZI\.takeMedKit\(\)/.test(fortSrc) && !/fort_medkit/.test(fortSrc)); }

// ── Offline recovery and the wait (U38a) ──
{ const E = eligible(); down(E); const Z = E.ZI; Z.WanderEngine._lead = () => true; Z.WanderEngine.rng = Z.seededRng(5);
  let s = Z.getWanderRun(); s.lastTickAt = E.c.t; s._simNow = E.c.t; Z.saveWanderRun(s);
  E.c.t += 3 * H; Z.WanderEngine.tick(E.c.t); let g = 0; while ((Z.getWanderRun()._carryMs || 0) > 0 && g++ < 5000) { E.c.t += 1000; Z.WanderEngine.tick(E.c.t); }
  s = Z.getWanderRun(); const waited = J(Z).phase === 'waiting' && s.jesterWait && !s.resting && s.hp >= 80;
  const snap = { kills: s.kills, xp: s.xp, scroll: s.scrollUm, stress: Z.getStress(), car: (s.carried || []).length };
  E.c.t += 24 * H; Z.WanderEngine.tick(E.c.t); g = 0; while ((Z.getWanderRun()._carryMs || 0) > 0 && g++ < 5000) { E.c.t += 1000; Z.WanderEngine.tick(E.c.t); }
  const s2 = Z.getWanderRun(); const same = s2.kills === snap.kills && s2.xp === snap.xp && s2.scrollUm === snap.scroll && Z.getStress() === snap.stress && (s2.carried || []).length === snap.car && (s2._carryMs || 0) === 0;
  Z.Jester.meet('bat'); E.c.t += 10 * 1000; Z.WanderEngine.tick(E.c.t); const s3 = Z.getWanderRun();
  check('7: offline: rest at the camp completes, then the survivor waits; 24 h more adds no kills, XP, distance, stress or loot and nothing is carried over; after the meeting Wandering resumes from the camp',
    waited && same && !s3.jesterWait && !s3.jesterCamp && (s3._carryMs || 0) === 0, JSON.stringify({ waited, same, phase: J(Z).phase })); }
{ const E = mkEnv({}, { on: false, map: OPEN }); E.ZI.Jester.onNewSave(); prime(E, P); const d = down(E); const s = E.ZI.getWanderRun();
  check('8: switch off: the first Downing is the ordinary Base Forced Retreat and the survivor rests at Base; no wait can start',
    d.fr && d.fr.kind === 'forcedRetreat' && s.restAt === 'base' && !s.jesterCamp && !E.ZI.Jester.waitStep(s), d.fr && d.fr.kind); }

// ── Timer (U38b) ──
{ const E = atCamp(); E.c.t = T0 + 7 * H; E.ZI.Jester.meet('bat'); const r = J(E.ZI); const E2 = reload(reload(reload(E))); const r2 = J(E2.ZI);
  const end = r.meetAt + r.stayDays * DAY;
  check('9: the clock starts at the meeting (not arrival); start and length identical after 3 reloads; length 3–5 days; the camp is gone at the end',
    r.meetAt === T0 + 7 * H && r.meetAt !== r.trade.downAt && r.stayDays >= 3 && r.stayDays <= 5 && r2.meetAt === r.meetAt && r2.stayDays === r.stayDays && E2.ZI.Jester.campActive(end - 1) && !E2.ZI.Jester.campActive(end), JSON.stringify({ meetAt: r.meetAt - T0, stay: r.stayDays })); }

// ── Isolation (S5) ──
{ const E = mkEnv({ zi_save_version: '7' }, {}); E.ZI.Jester.onLoad(); const keys = Object.keys(E.store).filter(k => /jester/i.test(k));
  check('10: the switch is off by default, lives only in code (no save key), and a legacy save gains only the not-eligible record',
    E.ZI.Jester.TABLE.firstMeetingOn === false && keys.join() === 'zi_jester' && !/firstMeetingOn/.test(E.store.zi_jester) && J(E.ZI).eligible === false && /firstMeetingOn: false/.test(activeSrc)); }

// ── B5 fallback ──
{ const E = mkEnv({}, { on: true }); E.ZI.Jester.onNewSave(); const E2 = reloadOff(E); const r = J(E2.ZI); const E3 = reloadOn(reloadOff(reloadOff(E2))); prime(E3, P); const d = down(E3);
  check('10b: fallback, trade not started: permanently exempt, existing kit once; repeated loads and the switch on → no second kit, no trade',
    r.eligible === false && r.exempt === 'switchOff' && kitCount(E2.ZI) === '1/1' && kitCount(E3.ZI) === '1/1' && d.fr.kind === 'forcedRetreat' && !J(E3.ZI).phase, JSON.stringify(r)); }
{ const E = atCamp(); const E2 = reloadOff(E); const r = J(E2.ZI), s = E2.ZI.getWanderRun(), it = items(E2.ZI); const E3 = reloadOn(reloadOff(E2));
  check('10c: fallback, waiting at the camp: outstanding rewards once (no weapon; weapon owed), wait cleared, Wandering resumes; repeat loads and switch on add nothing',
    r.phase === 'done' && r.weaponOwed === true && r.fallback.from === 'waiting' && !s.jesterWait && !s.jesterCamp && it.lo.join() === 'handmade_pouch,old_padded_jacket' && JSON.stringify(items(E3.ZI)) === JSON.stringify(it) && !E3.ZI.Jester.meet('bat').ok, JSON.stringify(it)); }
{ const E = eligible(); down(E); const E2 = reloadOff(E); const s = E2.ZI.getWanderRun(), r = J(E2.ZI);
  check('10d: fallback, resting at the camp: rewards once, the rest continues (not skipped) and then normal Wandering',
    r.phase === 'done' && r.fallback.from === 'resting' && s.resting === true && s.restAt === 'camp' && !s.jesterCamp && items(E2.ZI).car.join() === 'rationx2,scout_kitx1', JSON.stringify({ resting: s.resting, restAt: s.restAt })); }
{ const E = atCamp(); E.ZI.Jester.meet('bat'); const before = JSON.stringify(items(E.ZI)); const E2 = reloadOff(E); const E3 = reloadOn(E2);
  check('10e: fallback, trade completed: outcome kept, nothing returned, no second kit; switch on → no trade', JSON.stringify(items(E2.ZI)) === before && JSON.stringify(items(E3.ZI)) === before && !J(E2.ZI).fallback && J(E3.ZI).phase === 'done'); }
{ // an interrupted trade: the intent was written, the carried store not yet reduced, the run not yet changed
  const E = eligible(); const Z = E.ZI; const s = Z.getWanderRun(); const r = Z.Jester.get();
  const haul = s.carried.filter(e => !Z._haulIsStory(e)), car = Z.getCarried().filter(e => !Z.isStoryItem(e.id));
  r.phase = 'trading'; r.trade = { haul: haul.map(e => Z.Jester._hk(e)), names: haul.map(e => e.name), carried: car.map(e => ({ id: e.id, qty: e.qty })), carriedBefore: JSON.stringify(Z.getCarried()), downAt: E.c.t, down: P }; r.camp = { gx: 6, gy: 3 }; Z.Jester.put(r);
  const E2 = reload(E), E3 = reload(E2); const s2 = E3.ZI.getWanderRun();
  // an interrupted grant: the intent for grant 0 was written, then the jacket placed, before 'granted' was saved
  const G = atCamp(); const rg = G.ZI.Jester.get(); rg.phase = 'granting'; rg.grantMode = 'meeting'; rg.weapon = 'bat'; rg.grants = G.ZI.Jester._rewards('bat'); rg.granted = []; rg.inFlight = { key: 'g0', sig: G.ZI.Jester._sig() }; G.ZI.Jester.put(rg);
  const lo = G.ZI.getLoadout(); lo.vest = 'old_padded_jacket'; G.ZI.saveLoadout(lo);
  const G2 = reload(G), G3 = reload(G2); const all = G3.ZI.getStash().concat(Object.values(G3.ZI.getLoadout()));
  check('10f: interrupted trade and interrupted grant finish exactly once on load: items removed once, rewards granted once (the jacket placed before the crash is not granted again)',
    J(E3.ZI).phase === 'resting' && E3.ZI.getCarried().length === 0 && s2.carried.length === 1 && s2.jesterCamp && J(G3.ZI).phase === 'done' && all.filter(x => x === 'old_padded_jacket').length === 1 && all.filter(x => x === 'bat').length === 1,
    JSON.stringify({ trade: J(E3.ZI).phase, carried: E3.ZI.getCarried().length, jackets: all.filter(x => x === 'old_padded_jacket').length })); }

// ── Camp placement (G1, E1) ──
{ // over many seeds and every square of a sector on an open map: distance 3 when possible; always inside the sector; safe
  let ok = true, bad = ''; const E = mkEnv({ zi_fort1_pos: JSON.stringify({ gx: 40, gy: 40, fallow: { gx: 41, gy: 40 } }) }, { on: true, map: (gx, gy) => (gx * 7 + gy * 13) % 11 === 0 ? 'locked' : (gx * 5 + gy * 3) % 13 === 0 ? 'contested' : 'available' });
  const Z = E.ZI;
  for (let gy = 0; gy < 6; gy++) for (let gx = 0; gx < 8; gx++) for (let seed = 1; seed <= 21; seed++) {
    const c = Z.Jester.campSquare({ gx, gy }, Z.seededRng(seed)); if (!c) continue;
    const d = Math.max(Math.abs(c.gx - gx), Math.abs(c.gy - gy));
    // the first distance in 3,4,5,2,1 that has a safe square must be the one chosen (checked by recomputing)
    const has = (dd) => { for (let y = 0; y < 6; y++) for (let x = 0; x < 8; x++) { if (Math.max(Math.abs(x - gx), Math.abs(y - gy)) !== dd) continue; const q = Z.worldCell(x, y, 'scavenge'); if (q.state !== 'locked' && q.state !== 'contested' && !Z.isHomeCell(x, y)) return true; } return false; };
    const first = [3, 4, 5, 2, 1].find(has);
    if (c.state === 'locked' || c.state === 'contested' || c.gx < 0 || c.gx > 7 || c.gy < 0 || c.gy > 5 || Z.isHomeCell(c.gx, c.gy) || (first != null && d !== first && d !== 0)) { ok = false; bad = JSON.stringify({ gx, gy, c: [c.gx, c.gy], d, first }); }
  }
  check('11: placement order 3, 4, 5, 2, 1 then the Downing square; never locked, contested, Fort, Fallow or Home; always inside the sector (48 squares × 21 seeds; open-path map)', ok, bad); }
{ // a nearer square walled in by locked squares is skipped; the chosen camp has a legal path back
  const wall = new Set(['5,2', '5,3', '5,4', '6,2', '7,2', '6,4', '7,4']); // (6,3)/(7,3) enclosed; (3,3) Downing
  const E = mkEnv({ zi_fort1_pos: JSON.stringify({ gx: 40, gy: 40, fallow: { gx: 41, gy: 40 } }) }, { on: true, map: (gx, gy) => wall.has(gx + ',' + gy) ? 'locked' : Math.max(Math.abs(gx - 2), Math.abs(gy - 3)) === 3 ? 'contested' : 'available' }); // distance 3 all contested → distance 4 needed
  const Z = E.ZI; const seen = new Set(); for (let s = 1; s <= 30; s++) { const c = Z.Jester.campSquare({ gx: 2, gy: 3 }, Z.seededRng(s)); seen.add(c.gx + ',' + c.gy); }
  const reach = (c) => { const k = (x, y) => x + ',' + y, R = new Set([k(c.gx, c.gy)]), q = [[c.gx, c.gy]]; while (q.length) { const [x, y] = q.shift(); for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || nx > 7 || ny < 0 || ny > 5 || R.has(k(nx, ny)) || wall.has(k(nx, ny))) continue; R.add(k(nx, ny)); q.push([nx, ny]); } } return R.has('2,3'); };
  check('11b: safe departure: with distance 3 unusable, the walled-in distance-4 square (6,3) is never chosen; every chosen camp is at distance 4 and has a legal 8-neighbour path back (through contested squares, as movement allows)', !seen.has('6,3') && !seen.has('7,3') && [...seen].every(k => { const [x, y] = k.split(',').map(Number); return Math.max(Math.abs(x - 2), Math.abs(y - 3)) === 4; }) && [...seen].every(k => { const [x, y] = k.split(',').map(Number); return reach({ gx: x, gy: y }); }), [...seen].join(' ')); }
{ // E1: everything around is locked and the Downing square is contested
  const E = mkEnv({}, { on: true, map: (gx, gy) => (gx === 3 && gy === 3) ? 'contested' : 'locked' }); E.ZI.Jester.onNewSave(); prime(E, P); const d = down(E); const r = J(E.ZI);
  check('11c: E1: no safe camp and a contested Downing square → the ordinary Base Forced Retreat, no trade, still eligible, logged; the next qualifying Downing gets the meeting',
    d.fr.kind === 'forcedRetreat' && r.eligible === true && !r.phase && r.campSkipped && r.campSkipped[0].reason === 'noSafeSquare', JSON.stringify(r)); }

// ── Weapon owed (G2) ──
{ const E = atCamp(); const E2 = reloadOff(E); const E3 = reloadOn(reload(reload(E2))); const owed = J(E3.ZI).weaponOwed;
  const r1 = E3.ZI.Jester.chooseOwedWeapon('pocket_knife'); const after = JSON.stringify(items(E3.ZI)); const r2 = E3.ZI.Jester.chooseOwedWeapon('bat'); const E4 = reload(E3);
  check('11d: weapon owed survives 3 reloads and the switch on; the choice grants exactly that weapon once and clears the state; a second call and later loads add nothing; no trade or kit repeats',
    owed === true && r1.ok && !r2.ok && J(E3.ZI).weaponOwed === false && E3.ZI.getLoadout().melee === 'pocket_knife' && JSON.stringify(items(E4.ZI)) === after && kitCount(E4.ZI) === '1/1', after); }
{ const E = atCamp(); const E2 = reloadOff(E); const r = E2.ZI.Jester.get(); r.weaponPending = 'iron_knuckles'; E2.ZI.Jester.put(r);   // saved choice, crash before the grant
  const E3 = reload(E2); const r3 = J(E3.ZI);
  check('11e: a saved choice completes on load without asking again; the owed state clears only after the grant', E3.ZI.getLoadout().melee === 'iron_knuckles' && r3.weaponOwed === false && !r3.weaponPending && r3.weapon === 'iron_knuckles'); }
{ const mod = activeSrc.slice(activeSrc.indexOf('ZI.Jester = {'), activeSrc.indexOf('// Save migration (tutorial follow-up'));
  const E = atCamp(); const E2 = reloadOff(E); const E3 = reload(reload(E2)); const L = E3.ZI.getLoadout();
  check('11f: never auto-chosen: no weapon id is granted without a player choice on any fallback path, and the module never picks from the weapon list',
    !L.melee && !/weapons\[\s*Math|weapons\[\s*\d|pick.*weapons|weapons\.find/.test(mod) && J(E3.ZI).weaponOwed === true, L.melee || 'none'); }

// ── Policy (U39) ──
{ const E = eligible(); E.ZI._wj('zi_wander_policy', { id: 'criminal', changedAt: 5 }); const pol0 = E.store.zi_wander_policy; down(E); const s = E.ZI.getWanderRun(); s.resting = false; E.ZI.saveWanderRun(s); E.ZI.Jester.waitStep(s); E.ZI.saveWanderRun(s); E.ZI.Jester.meet('bat');
  const E2 = atCamp(); E2.ZI._wj('zi_wander_policy', { id: 'ethical', changedAt: 9 }); const pol2 = E2.store.zi_wander_policy; const E3 = reloadOff(E2);
  check('12: the standing policy is identical before and after the trade, the meeting and the fallback', E.store.zi_wander_policy === pol0 && E3.store.zi_wander_policy === pol2 && J(E3.ZI).fallback); }

return results;
})();
