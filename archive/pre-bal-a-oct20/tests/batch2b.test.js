// Batch 2B focused tests: prompts, charges/kits, redirects, stress, breaking, report, migration, live/offline equality.
// Usage (run_script): const T = await readFile('tests/batch2b.test.js'); await (new Function('readFile','log', T))(readFile, log);
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x || '']);
const mkEnv = (seedStore) => {
  const store = Object.assign({ zi_materials: JSON.stringify({ metal:200, wood:200, cloth:200, electronics:200, fuel:200, medical:200 }),
    zi_world_seed: '12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify({ gx:0, gy:0, name:'Home', biome:'suburbia', difficulty:1 }) }, seedStore || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } };
  fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw);
  return { ZI: fw.ZI, store };
};
const run0 = (ZI) => Object.assign(ZI.defaultWanderRun(), { active:true, hp:100, maxHeals:3, healPct:30, moveSpeed:3 });
const until = (ZI, st, sec, rng, away, step) => { const ev = []; let t = 0; step = step || sec; while (t < sec - 1e-9) { const d = Math.min(step, sec - t); ZI.WanderSim.advance(st, d, away, rng, ev); t += d; } let g = 0; while (st._carryMs > 0 && g++ < 500) ZI.WanderSim.advance(st, 0, away, rng, ev); return ev; };

// ── B1/B2 prompts resolve by policy, never wait ──
{
  const { ZI } = mkEnv(); ZI.wanderMounted = true; const st = run0(ZI), rng = ZI.seededRng(7), away = ZI.WanderSim.emptySummary();
  const p = ZI.createPrompt(st, rng);
  check('B1: live prompt created with its timer', p && st.prompt && p.createdLive === true && p.expiresInMs === ZI.ACTIVE_TABLE.sites[p.site].timerSec * 1000);
  const ev = until(ZI, st, ZI.ACTIVE_TABLE.sites[p.site].timerSec + 1, rng, away, 1);
  const d = ev.find(e => e.kind === 'discovery');
  check('B1: unanswered prompt resolves by policy default at timeout', !st.prompt || st.prompt.id !== p.id ? (d && d.byPolicy === true) : false, JSON.stringify(d && { decision: d.decision, byPolicy: d.byPolicy }));
  ZI.wanderMounted = false; const st2 = run0(ZI), away2 = ZI.WanderSim.emptySummary();
  const ev2 = until(ZI, st2, 14400, ZI.seededRng(9), away2);
  const prompts = ev2.filter(e => e.kind === 'prompt');
  check('B2: offline prompts are never marked for player input', prompts.length > 0 && prompts.every(e => e.prompt.createdLive === false), prompts.length + ' prompts');
  const st2Wait = st2.prompt ? st2.prompt.expiresInMs <= ZI.ACTIVE_TABLE.sites[st2.prompt.site].timerSec * 1000 : true;
  check('B2: every offline resolution was by policy; nothing left waiting past its timer', (away2.discoveries || []).length > 0 && (away2.discoveries || []).filter(x => x.decision !== 'left behind').every(x => x.byPolicy) && st2Wait, (away2.discoveries || []).length + ' resolved of ' + prompts.length + ' (rest ends a run and drops its prompt)');
}
// ── B3/B4 breaking and the Shaken floor ──
{
  const { ZI } = mkEnv({ zi_trav_pos: JSON.stringify({ gx:6, gy:5, name:'Far', biome:'suburbia', difficulty:1 }), zi_retreat_rules: JSON.stringify({ hpOff:true, stressOff:true, loadIgnore:true }) }); // R1 rules off: this checks Breaking itself
  const st = run0(ZI); st.carried = Array.from({ length: 20 }, (_, i) => ({ name:'junk' + i, value:1 }));
  ZI.setStress(99.95); const away = ZI.WanderSim.emptySummary();
  const ev = until(ZI, st, 60, ZI.seededRng(3), away, 1);
  const br = ev.find(e => e.kind === 'breaking');
  check('B3: stress 100 forces a retreat (no death)', !!br && st.resting === true && st.hp >= 1);
  // Batch 3B supersedes the old 10% Breaking loss: 50% × Scavenging factor, best entry protected.
  check('B3: Forced Retreat haul loss follows the 3B rule (' + (br && br.eligible) + ' eligible at the moment → ' + (br && br.lost.length) + ' lost)', br && br.lost.length === ZI.forcedRetreatLossCount(br.eligible, ZI.STAT_FORMULAS.forcedRetreatScavFactor(br.scavenging)), br && br.lost.length);
  check('B3: stress reset to Shaken floor 80', Math.round(ZI.getStress()) <= 80 && ZI.getStress() >= 79.9, ZI.getStress()); /* PF1 (authorized by Sam, Oct 16): Shaken floor 80, above the resume gate (< 70) */
  check('B3: run ended (pressure and withdrawal cleared)', st.pressure === 0 && !st.withdrawing);
  const st2 = run0(ZI); ZI.setStress(60); const ev2 = until(ZI, st2, 30, ZI.seededRng(4), ZI.WanderSim.emptySummary(), 1);
  check('B4: starting at 60 does not break again', !ev2.some(e => e.kind === 'breaking'), ZI.getStress());
}
// ── B5 rust + stress cap ──
{
  const { ZI, store } = mkEnv({ zi_stat_xp: JSON.stringify({ combat: 40000 }) });
  const L = ZI.statLevel('combat');
  store.zi_skill_decay = JSON.stringify({ combat: { lastActiveUtc: Date.now() - 40 * 86400000, floorXp: 0, floorProgress: {} } });
  store.zi_injury = JSON.stringify({ skills:['combat'], pct:0.10, until: Date.now() + 86400000 });
  ZI.setStress(80);
  const eff = ZI.effectiveLevel('combat');
  check('B5: rust + injury + stress capped at −20%', eff === Math.max(1, Math.floor(L * 0.8)), L + ' → ' + eff);
}
// ── B6 action XP through emitAction ──
{
  const { ZI } = mkEnv(); const seen = []; const em = ZI.emitAction; ZI.emitAction = function(id, s, m) { seen.push(id); return em(id, s, m); };
  const st = run0(ZI); st.hp = 40; st.scroll = 300; ZI.wanderMounted = true; ZI.createPrompt(st, ZI.seededRng(1));
  ZI.wanderHeal(st, () => 0.99); ZI.wanderScout(st, () => 0.99); ZI.wanderPushOn(st); ZI.wanderChangeRoute(st); ZI.wanderWithdraw(st);
  check('B6: heal, scout, push, change route, withdraw emit XP', ['heal','scout','sneak','move'].every(k => seen.includes(k)), seen.join(','));
  const bad = /addStatXp\(/.test(await readFile('game/active.js'));
  check('B6: no direct addStatXp in active play', !bad);
}
// ── B7 charges and kits ──
{
  const { ZI } = mkEnv(); const st = run0(ZI);
  ZI.grantGear('handmade_pouch', 1); ZI.grantGear('tactical_vest', 1); ZI.equipGear('tactical_vest', 'vest');
  ZI.grantGear('medkit', 3);
  ZI.takeToCarried('medkit', 3);
  const kits = ZI.getCarried().filter(e => e.id === 'medkit');
  check('B7: three med kits are three entries, two charges each', kits.length === 3 && kits.every(e => e.qty === 1 && e.charges === 2), JSON.stringify(kits));
  const t0 = ZI.chargeTotals();
  check('B7: totals = base 2 + kits 6', t0.heal === 8 && t0.baseHeal === 2 && t0.kitHeal === 6, JSON.stringify(t0));
  const ok = () => 0.99;
  ZI.wanderHeal(st, ok); ZI.wanderHeal(st, ok);
  check('B7: base charges spent first', ZI.getBaseCharges().heal === 0 && ZI.chargeTotals().kitHeal === 6);
  ZI.wanderHeal(st, ok);
  const k2 = ZI.getCarried().filter(e => e.id === 'medkit').map(e => e.charges).sort();
  check('B7: one kit charge spent, others untouched', JSON.stringify(k2) === '[1,2,2]', JSON.stringify(k2));
  ZI.wanderHeal(st, ok);
  check('B7: an empty kit is removed', ZI.getCarried().filter(e => e.id === 'medkit').length === 2);
  ZI.setStress(50); const f = ZI.spendCharge('heal', () => 0);
  check('B7: fumble spends the charge and fails', f.ok === false && f.fumbled === true && ZI.chargeTotals().kitHeal === 3);
  ZI.setStress(0);
  const st2 = run0(ZI); st2.resting = true; st2.restStartHp = 79; st2.restElapsedMs = 0;
  ZI.WanderSim.advance(st2, 60, ZI.WanderSim.emptySummary(), ZI.seededRng(2), []);
  check('B7: base charges refill after rest at base; kits do not', ZI.getBaseCharges().heal === 2 && ZI.chargeTotals().kitHeal === 3, JSON.stringify(ZI.chargeTotals()));
  ZI.putBackToStash('medkit', 1);
  const partial = ZI.getKitStashPartials().medkit || [];
  ZI.takeToCarried('medkit', 1);
  check('B7: a part-used kit keeps its charges through stash and back', partial.length === 1 && ZI.getCarried().filter(e => e.id === 'medkit').some(e => e.charges === partial[0]), JSON.stringify(partial));
}
// ── B8 return report ──
{
  const { ZI } = mkEnv(); ZI.wanderMounted = false; const st = run0(ZI), away = ZI.WanderSim.emptySummary();
  until(ZI, st, 14400, ZI.seededRng(11), away);
  const rows = ZI.returnReport(away);
  check('B8: report lists every policy discovery decision', (away.discoveries || []).length > 0 && (away.discoveries || []).every(d => rows.some(r => r.includes(d.site) && r.includes(d.risk))), rows.slice(0, 3).join(' | '));
}
// ── B9 live/offline equivalence with discoveries ──
{
  const a = mkEnv(), b = mkEnv(); a.ZI.wanderMounted = false; b.ZI.wanderMounted = false;
  const sa = run0(a.ZI), sb = run0(b.ZI), ra = a.ZI.seededRng(42), rb = b.ZI.seededRng(42);
  const aw = a.ZI.WanderSim.emptySummary(), bw = b.ZI.WanderSim.emptySummary();
  until(a.ZI, sa, 900, ra, aw, 1); until(b.ZI, sb, 900, rb, bw);
  const pick = (s, w, Z) => JSON.stringify({ k: s.kills, hp: Math.round(s.hp * 1000), sc: Math.round(s.scroll), c: (s.carried || []).length, st: Math.round(Z.getStress() * 1000), d: (w.discoveries || []).map(x => x.site + x.decision + x.outcome), xp: Z.getStatXp() });
  check('B9: 1-s beats and one 900-s catch-up give identical results', pick(sa, aw, a.ZI) === pick(sb, bw, b.ZI), pick(sa, aw, a.ZI).slice(0, 120) + ' VS ' + pick(sb, bw, b.ZI).slice(0, 120));
}
// ── B11 migration ──
{
  const { ZI, store } = mkEnv({ zi_save_version: '2', zi_carried: JSON.stringify({ v:1, items:[{ id:'medkit', qty:3 }, { id:'bandage', qty:2 }] }) });
  check('B11: old save migrated to the current version (≥3)', ZI.getSaveVersion() === ZI.SAVE_FORMAT.current && ZI.getSaveVersion() >= 3, ZI.getSaveVersion());
  const car = ZI.getCarried();
  check('B11: kit stack split into entries, nothing lost', car.filter(e => e.id === 'medkit').length === 3 && car.find(e => e.id === 'bandage').qty === 2, JSON.stringify(car));
  check('B11: stress starts at 0, base charges full', ZI.getStress() === 0 && ZI.getBaseCharges().heal === 2);
}
// ── B14 push lifecycle ──
{
  const { ZI } = mkEnv(); const st = run0(ZI); st.scroll = 200; st.lastCheckpoint = 0;
  [1,2,3,4].forEach(() => ZI.wanderPushOn(st));
  check('B14: push pressure capped at 3', st.pressure === 3);
  // Controlled active patrol: plenty of base heal charges so no fight ends in a rest, home (cleared) ground so
  // stress never builds. Only pressure differs between the two runs.
  const patrol = (pressure) => {
    const E2 = mkEnv({ zi_retreat_rules: JSON.stringify({ hpOff:true, stressOff:true, loadIgnore:true }) }); const Z = E2.ZI; Z.wanderMounted = false; Z._wj('zi_charges', { heal: 9999, scout: 2 }); // R1 rules off: pressure only
    const laps = []; const bg = Z._bgZombie; Z._bgZombie = function(lap, rng) { laps.push(lap); return bg.call(this, lap, rng); };
    const s0 = run0(Z); s0.pressure = pressure; const ev = until(Z, s0, 1800, Z.seededRng(5), Z.WanderSim.emptySummary());
    return { enc: ev.filter(e => e.kind === 'zombie').length, rested: ev.filter(e => e.kind === 'resumed' || e.kind === 'retreat').length, meanLap: laps.reduce((a, b) => a + b, 0) / Math.max(1, laps.length), resting: s0.resting };
  };
  const p0 = patrol(0), p3 = patrol(3);
  const want = 1 + 3 * ZI.ACTIVE_TABLE.push.encounterRateMult;
  check('B14: control run stays on patrol (no rest)', !p0.resting && !p3.resting && p0.rested === 0 && p3.rested === 0, JSON.stringify({ p0, p3 }));
  check('B14: pressure 3 raises the encounter rate by the configured factor (±10%)', p0.enc > 20 && Math.abs(p3.enc / p0.enc - want) / want < 0.10, p0.enc + ' → ' + p3.enc + ' (want ×' + want.toFixed(2) + ')');
  { const laps = []; const bg = ZI._bgZombie; ZI._bgZombie = function(lap, rng) { laps.push(lap); return bg.call(this, lap, rng); };
    const a = run0(ZI), b = run0(ZI); a.scroll = b.scroll = 600; b.pressure = 3;
    ZI.WanderSim.rollEncounter(a, ZI.seededRng(9)); ZI.WanderSim.rollEncounter(b, ZI.seededRng(9)); ZI._bgZombie = bg;
    check('B14: pressure 3 raises the encounter tier by the configured steps', laps[1] - laps[0] === 3 * ZI.ACTIVE_TABLE.push.tierBoost * 1.5, laps.join(' → ')); }
  ZI.wanderWithdraw(st); until(ZI, st, 400, ZI.seededRng(6), ZI.WanderSim.emptySummary(), 1);
  check('B14: pressure resets when the run ends', st.pressure === 0, st.pressure);
}
// ── B15 stress rates by familiarity ──
{
  const { ZI } = mkEnv(); const st = run0(ZI); let fam = 'unexplored';
  ZI.getTravZone = () => ({ gx:3, gy:3 }); ZI.cellFamiliarity = () => fam;
  const S = ZI.ACTIVE_TABLE.stress; const t = (f) => { fam = f; ZI.setStress(50); ZI.WanderSim._move(st, 600000, ZI.WanderSim.emptySummary(), [], ZI.seededRng(1)); return +(ZI.getStress() - 50).toFixed(4); };
  const u = t('unexplored'), e = t('explored'), c = t('cleared');
  check('B15: unexplored +0.25/min, explored +0.10/min, cleared −0.10/min', u === +(S.unexploredPerMin * 10).toFixed(4) && e === +(S.exploredPerMin * 10).toFixed(4) && c === +(S.clearedPerMin * 10).toFixed(4), u + ' / ' + e + ' / ' + c);
}
// ── B16 stress wear through the canonical wear path ──
{
  const { ZI } = mkEnv(); ZI.grantGear('machete', 1); ZI.equipGear('machete', 'melee');
  const g = ZI.getGearItem('machete'), d0 = ZI.itemDurability(g).current;
  ZI.setStress(75); ZI.wearEquippedOnKill(); const d1 = ZI.itemDurability(g).current;
  ZI.setStress(0); ZI.wearEquippedOnKill(); const d2 = ZI.itemDurability(g).current;
  const drain = ZI.itemDrainPerUse(g);
  check('B16: Stressed wear ×1.25, Calm ×1.00, no rounding drift', Math.abs((d0 - d1) - drain * 1.25) < 1e-9 && Math.abs((d1 - d2) - drain) < 1e-9, (d0 - d1) + ' / ' + (d1 - d2));
}

// ── Locked decisions + B12/B13 ──
{
  const { ZI } = mkEnv(); const st = run0(ZI); ZI.refillBaseCharges();
  const r = ZI.WanderSim.resolveEncounter(st, { kind:'zombie', z:{ name:'Brute', hp:9999, dmg:200, armor:50, xp:10, tier:'S' } }, ZI.seededRng(1));
  check('D-1: auto-heal in the simulation spends a base Heal charge', r.outcome === 'healed' && r.healSource === 'base' && ZI.getBaseCharges().heal <= 1, r.outcome + ' ' + r.healSource);
  check('D-1: no maxHeals counter used by auto-heal', !/healsUsed < state.maxHeals/.test(await readFile('game/wandering.js')));
  const st2 = run0(ZI); st2.scroll = 1380; st2.lastCheckpoint = 1250;
  const w = ZI.wanderWithdraw(st2);
  check('D-2: withdrawal = distance back to the last checkpoint', w.meters === 130, w.meters);
  const st3 = run0(ZI); st3.scroll = 300; ZI.createPrompt(st3, ZI.seededRng(2)); ZI.wanderWithdraw(st3);
  const ev = []; const away = ZI.WanderSim.emptySummary(); ZI.WanderSim.advance(st3, 1, away, ZI.seededRng(3), ev);
  const lb = ev.find(e => e.decision === 'left behind');
  check('D-3: pending discovery recorded as left behind (withdrew), no Move on', lb && /left behind \(withdrew\)/.test(lb.text) && ZI.returnReport(away).some(x => /left behind \(withdrew\)/.test(x)), lb && lb.text);
}
{
  const { ZI } = mkEnv(); ZI._wj('zi_charges', { heal:0, scout:0 }); ZI.grantGear('revenant_infusion', 1); ZI.equipGear('revenant_infusion', 'consumable1');
  const st = run0(ZI); const r = ZI.WanderSim.resolveEncounter(st, { kind:'zombie', z:{ name:'Brute', hp:9999, dmg:200, armor:50, xp:10, tier:'S' } }, ZI.seededRng(1));
  check('B12: out of heals, a primed revive saves the survivor in the shared simulation', r.outcome === 'revived' && st.hp === 50 && !ZI.getLoadout().consumable1 && !st.resting, r.outcome + ' hp=' + st.hp);
  const r2 = ZI.WanderSim.resolveEncounter(st, { kind:'zombie', z:{ name:'Brute', hp:9999, dmg:200, armor:50, xp:10, tier:'S' } }, ZI.seededRng(1));
  check('B12: revive is used up; next time the survivor is Downed → Forced Retreat (3B)', r2.outcome === 'forcedRetreat' && r2.fr && r2.fr.cause === 'downed');
}
{
  const { ZI } = mkEnv(); ZI.addBuff({ dmgPct: 50, armorAdd: 5, durationSec: 30 });
  const now = Date.now();
  check('B13: buff active inside its window', ZI.combatBuffsAt(now + 1000).dmgPct === 50 && ZI.combatBuffsAt(now + 1000).armorAdd === 5);
  check('B13: buff not applied before it was taken or after it expires', ZI.combatBuffsAt(now - 60000).dmgPct === 0 && ZI.combatBuffsAt(now + 31000).dmgPct === 0);
  const st = run0(ZI); st._simNow = now + 1000;
  const r = ZI.WanderSim.resolveEncounter(st, ZI.WanderSim.rollEncounter(st, ZI.seededRng(4)), ZI.seededRng(4));
  check('B13: shared combat reads the buff (no screen involved)', r.buffed === true);
}

// ── B9 regression + stress boundaries: identical results for any chunking of the same elapsed time ──
{
  const pickS = (Z, s) => JSON.stringify({ stress: Z.getStress(), hp: s.hp, scroll: s.scroll, kills: s.kills, resting: s.resting, carried: (s.carried || []).length });
  const runChunks = (seed, sec, steps, setup) => steps.map(step => { const E2 = mkEnv(setup && setup.store); const Z = E2.ZI; Z.wanderMounted = false; if (setup && setup.fn) setup.fn(Z); const s = run0(Z); if (setup && setup.state) setup.state(s); const ev = until(Z, s, sec, Z.seededRng(seed), Z.WanderSim.emptySummary(), step); return { out: pickS(Z, s), breakings: ev.filter(e => e.kind === 'breaking').length }; });
  const same = (rs) => rs.every(r => r.out === rs[0].out && r.breakings === rs[0].breakings);
  // The case that diverged before the fix (seed 42, 60 s: 4.9889 vs 4.9972 stress).
  const r1 = runChunks(42, 60, [1, 60]);
  check('B9-reg: seed 42 / 60 s — 1-s beats equal one catch-up (diverged by 0.0083 before the fix)', same(r1), r1.map(r => r.out).join(' VS '));
  const r2 = runChunks(42, 900, [1, 7, 60, 900]);
  check('B9: 900 s identical for chunk sizes 1, 7, 60 and 900 s', same(r2), r2.map(r => r.out.slice(0, 60)).join(' | '));
  const r3 = runChunks(3, 240, [1, 13, 240], { fn: Z => Z.setStress(0.05) });
  check('B9: stress near 0 while recovering clamps at 0 the same way', same(r3), r3.map(r => r.out.slice(0, 40)).join(' | '));
  const far = { store: { zi_trav_pos: JSON.stringify({ gx:6, gy:5, name:'Far', biome:'suburbia', difficulty:1 }) } };
  const r4 = runChunks(3, 240, [1, 11, 240], Object.assign({}, { store: Object.assign({ zi_retreat_rules: JSON.stringify({ hpOff:true, stressOff:true, loadIgnore:true }) }, far.store) }, { fn: Z => Z.setStress(99.5), state: s => { s.carried = Array.from({ length: 20 }, (_, i) => ({ name:'junk' + i, value:1 })); } }));
  check('B9: gaining near 100 breaks at the same simulation point', same(r4) && r4[0].breakings >= 1, r4.map(r => r.breakings + ' ' + r.out.slice(0, 60)).join(' | '));
  const r5 = runChunks(8, 600, [1, 9, 600], { fn: Z => { Z._wj('zi_charges', { heal: 0, scout: 0 }); Z.setStress(2); } });
  check('B9: a period with gain (low HP, fights) and recovery (cleared ground, rest) matches', same(r5), r5.map(r => r.out.slice(0, 60)).join(' | '));
}

// ── Breaking fix: the instant stress reaches 100, Breaking resolves before any recovery ──
{
  const homeEnv = () => { const E2 = mkEnv(); E2.ZI.wanderMounted = false; return E2.ZI; };
  const junk = (s, n) => { s.carried = Array.from({ length: n }, (_, i) => ({ name:'junk' + i, value:1 })); };
  // 1 + 2: instant event on cleared ground (home cell recovers stress)
  { const Z = homeEnv(), s = run0(Z); junk(s, 10); Z.setStress(99.6); Z.WanderSim._stress(s, 1, null);
    const ev = []; Z.WanderSim.advance(s, 1, Z.WanderSim.emptySummary(), Z.seededRng(1), ev);
    const br = ev.filter(e => e.kind === 'breaking');
    const bi = ev.findIndex(e => e.kind === 'breaking');
    // Returned to base: rest starts at once; at full HP it is already above the resume threshold, so the patrol resumes in the same instant.
    check('Break-1: instant event to 100 breaks immediately, once, and returns to base', br.length === 1 && bi === 0 && (s.resting === true || (ev[bi + 1] && ev[bi + 1].kind === 'resumed')), br.length + ' first=' + (ev[0] && ev[0].kind) + ' next=' + (ev[1] && ev[1].kind));
    check('Break-2: on cleared ground, recovery did not run first; stress reset to 80', Z.getStress() <= 80.0001 && Z.getStress() >= 79.99 && br[0] && br[0].lost.length === Z.forcedRetreatLossCount(10, Z.STAT_FORMULAS.forcedRetreatScavFactor(br[0].scavenging)), Z.getStress() + ' lost ' + (br[0] && br[0].lost.length)); } // 3B loss rule /* PF1 (authorized by Sam, Oct 16): Shaken floor 80 */
  // 3: a large event crossing 100 clamps and breaks once
  { const Z = homeEnv(), s = run0(Z); junk(s, 10); Z.setStress(95); Z.WanderSim._stress(s, 30, null);
    check('Break-3: crossing 100 clamps at 100 before resolution', Z.getStress() === 100);
    const ev = []; Z.WanderSim.advance(s, 30, Z.WanderSim.emptySummary(), Z.seededRng(2), ev);
    check('Break-3: one Breaking, no duplicate retreat', ev.filter(e => e.kind === 'breaking').length === 1 && ev.filter(e => e.kind === 'withdrawn' || e.outcome === 'retreated').length === 0); }
  // live action path: Change Route at 99 on cleared ground
  { const Z = homeEnv(), s = run0(Z); junk(s, 10); Z.setStress(98); Z.wanderChangeRoute(s);
    const ev = []; Z.WanderSim.advance(s, 1, Z.WanderSim.emptySummary(), Z.seededRng(3), ev);
    check('Break-3b: Change Route to 100 breaks at the next instant', ev.some(e => e.kind === 'breaking')); }
  // 4: timed accumulation stops exactly at the boundary (unexplored ground +0.25/min)
  { const store = { zi_trav_pos: JSON.stringify({ gx:6, gy:5, name:'Far', biome:'suburbia', difficulty:1 }) };
    const E2 = mkEnv(store); const Z = E2.ZI; Z.wanderMounted = false; const s = run0(Z); Z.setStress(99.95);
    const ms = Z.WanderSim._msToBreak(s), rate = Z.WanderSim._walkStressRate();
    check('Break-4: time to break = exact remaining stress / rate', ms === Math.ceil(0.05 * Z.STRESS_UNITS / rate), ms); }
  // 5: same seed/state/timeline breaks at the same point live and offline
  { const runIt = (step) => { const E2 = mkEnv(); const Z = E2.ZI; Z.wanderMounted = false; const s = run0(Z); junk(s, 10); Z.setStress(99.6);
      Z.WanderSim._stress(s, 1, null); const ev = until(Z, s, 120, Z.seededRng(4), Z.WanderSim.emptySummary(), step);
      return JSON.stringify({ k: ev.map(e => e.kind), st: Z.getStress(), hp: s.hp, sc: s.scroll, c: (s.carried || []).length }); };
    const a = runIt(1), b = runIt(120);
    check('Break-5: live 1-s beats and one catch-up break at the same point', a === b, a.slice(0, 120) + ' VS ' + b.slice(0, 120)); }
}

let pass = 0; for (const [r, n, x] of results) { if (r === 'PASS') pass++; log(r + '  ' + n + '  ' + (r === 'FAIL' ? x : '')); }
log(pass + '/' + results.length + ' batch-2B checks passed');
})();
