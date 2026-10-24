// Batch CB1: starter weapons — the 7 acceptance checks (reference/starter-weapons-cb1-slice.md §7; CURRENT_BATCH.md).
// Nail Bat dmg 28 · heavySwingPct 30 · 3 kg | Iron Knuckles dmg 16 · staggerPct 25 | Pocket Knife dmg 16 · escapeBonus +30 · loot +5 · 0.5 kg.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const mkEnv = (store0) => {
  const store = Object.assign({ zi_world_seed:'12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify({ gx:0, gy:0, name:'Home', biome:'suburbia', difficulty:1 }) }, store0 || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw); const ZI = fw.ZI; ZI.wanderMounted = false; return { ZI, store };
};
const equip = (ZI, items) => { const lo = ZI.getLoadout(); Object.entries(items).forEach(([slot, id]) => { lo[slot] = id; }); ZI.saveLoadout(lo); };
const melee = (ZI) => (ZI.GEAR_SLOTS.find(s => s.id === 'melee') || {}).id || 'melee';
const vestSlot = (ZI) => ZI.getGearItem('vest_t1').slot;
const block = (o) => Object.assign({ name:'S', hp:1000, hpMax:1000, damageMin:5, damageMax:5, damageBonus:0, accuracy:200, evasion:0, armor:0, crit:0, critBonus:0, lifesteal:0, initiative:100 }, o || {});
const foe = (o) => Object.assign({ name:'Z', hp:1000, hpMax:1000, damageMin:1, damageMax:1, damageBonus:0, accuracy:200, evasion:0, armor:0, crit:0, critBonus:0, lifesteal:0, initiative:1 }, o || {});

// 1 — staggerPct 100: the enemy never attacks right after a survivor hit; 0 behaves exactly like no field
{ const { ZI } = mkEnv(); const r = ZI.simulateCombat(block({ staggerPct:100 }), foe(), 'idle', ZI.seededRng(1)); let bad = 0, hits = 0;
  for (let i = 0; i + 1 < r.log.length; i++) { const a = r.log[i], b = r.log[i + 1]; if (a.by === 'survivor' && (a.result === 'hit' || a.result === 'crit')) { hits++; if (b.by === 'enemy' && b.result !== 'skip') bad++; } }
  const z0 = JSON.stringify(ZI.simulateCombat(block({ staggerPct:0 }), foe(), 'idle', ZI.seededRng(2))), zn = JSON.stringify(ZI.simulateCombat(block(), foe(), 'idle', ZI.seededRng(2)));
  check('1: staggerPct 100 — the enemy never attacks after a survivor hit; staggerPct 0 is identical to no field for the same seed', hits > 10 && bad === 0 && z0 === zn, hits + ' hits, ' + bad + ' enemy attacks after a hit'); }
// 2 — heavySwingPct 100: the survivor attacks at most every other turn; 0 behaves exactly like no field
{ const { ZI } = mkEnv(); const r = ZI.simulateCombat(block({ heavySwingPct:100 }), foe(), 'idle', ZI.seededRng(3)); const sv = r.log.filter(l => l.by === 'survivor'); let back2back = 0;
  for (let i = 0; i + 1 < sv.length; i++) if (sv[i].result !== 'skip' && sv[i + 1].result !== 'skip') back2back++;
  const z0 = JSON.stringify(ZI.simulateCombat(block({ heavySwingPct:0 }), foe(), 'idle', ZI.seededRng(4))), zn = JSON.stringify(ZI.simulateCombat(block(), foe(), 'idle', ZI.seededRng(4)));
  check('2: heavySwingPct 100 — the survivor never attacks on two turns in a row; heavySwingPct 0 is identical to no field', sv.length > 10 && back2back === 0 && z0 === zn, sv.length + ' survivor turns, ' + back2back + ' back-to-back attacks'); }
// 3 — Pocket Knife escapeBonus +30 raises escape chance by exactly 30 (inside the 5–90 clamp)
{ const { ZI } = mkEnv(); const F = ZI.STAT_FORMULAS, z = { atk:8, hp:40 }; const before = F.escapeChance(1, 1, 100, z); equip(ZI, { [melee(ZI)]: 'pocket_knife' }); const after = F.escapeChance(1, 1, 100, z);
  const hi = F.escapeChance(60, 60, 100, z);
  check('3: Pocket Knife raises escape chance by exactly 30 points, and the 90 cap still holds', after - before === 30 && hi <= 90, before + ' → ' + after + ' (high-skill ' + hi + ')'); }
// 4 — 20,000 seeded fights vs tiers F–E (padded jacket, new-save levels): HP lost per fight within ±0.15 of the slice
{ const target = { bat: 2.55, iron_knuckles: 2.82, pocket_knife: 3.71 }, got = {}; let ok = true;
  for (const id of Object.keys(target)) { const { ZI } = mkEnv(); equip(ZI, { [melee(ZI)]: id, [vestSlot(ZI)]: 'vest_t1' }); const F = ZI.STAT_FORMULAS, g = ZI.resolveLoadoutStats();
    const pool = (ZI.BESTIARY || []).filter(z => ['F', 'E'].includes(z.tier)); const rng = ZI.seededRng(99); let lost = 0;
    for (let i = 0; i < 20000; i++) { const z0 = pool[Math.floor(rng() * pool.length)];
      const sb = F.survivorStatBlock({ displayHP:100, armorRating: g.armorRating, weaponDamage: g.weaponDamage, speed:100, heavySwingPct: g.heavySwingPct, staggerPct: g.staggerPct });
      const r = ZI.simulateCombat(sb, F.enemyStatBlock({ name:z0.name, hp:z0.hp, atk:z0.dmg, xp:z0.xp }), 'idle', rng); lost += 100 - Math.max(0, r.hpLeft); }
    got[id] = +(lost / 20000).toFixed(3); if (Math.abs(got[id] - target[id]) > 0.15) ok = false; }
  check('4: HP lost per fight over 20,000 seeded fights is within ±0.15 of Bat 2.55 / Knuckles 2.82 / Knife 3.71', ok, JSON.stringify(got)); }
// 5 — watched, offline and headless give identical results with a starter weapon equipped
{ const sig = (step) => { const { ZI } = mkEnv(); equip(ZI, { [melee(ZI)]: 'iron_knuckles', [vestSlot(ZI)]: 'vest_t1' }); ZI._wj('zi_charges', { heal: 3, scout: 0 }); ZI._wj('zi_wander_policy', { id:'heinous', changedAt:0 });
    const st = Object.assign(ZI.defaultWanderRun(), { active:true, hp:100, moveSpeed:3, scroll:400, scrollUm:400e6, lastCheckpoint:250, checkpoints:[250] }); const ev = []; const rng = ZI.seededRng(5); let t = 0, k = 0;
    const steps = Array.isArray(step) ? step : [step]; while (t < 3600 - 1e-9) { const d = Math.min(steps[k++ % steps.length], 3600 - t); ZI.WanderSim.advance(st, d, ZI.WanderSim.emptySummary(), rng, ev); t += d; }
    let g2 = 0; while (st._carryMs > 0 && g2++ < 10000) ZI.WanderSim.advance(st, 0, ZI.WanderSim.emptySummary(), rng, ev);
    // Compare game state and the events that change it. 'tooHeavy' log rows are grouped per processing call (Batch 3A),
    // so their position in the event list depends on chunk size by design; the state they describe does not.
    const sorted = (o) => JSON.stringify(Object.keys(o).sort().reduce((a, k) => (a[k] = o[k], a), {}));
    return sorted(st) + '|' + JSON.stringify(ev.filter(e => e.kind !== 'tooHeavy').map(e => e.kind + ':' + (e.outcome || ''))); };
  const a = sig(1), b = sig([1.3, 0.7, 2.9]), c = sig(3600);
  check('5: 1-s (watched), uneven and bulk (offline/headless) processing give identical game state and events with Iron Knuckles equipped (grouped too-heavy log rows excepted, Batch 3A)', a === b && b === c); }
// 6 — weapons without specials: no skipped turns and no extra rolls (identical to an explicit zero)
{ const { ZI } = mkEnv(); const F = ZI.STAT_FORMULAS; let same = true, skips = 0;
  for (const id of ['crowbar', 'machete', 'combat_knife', 'spike_board']) { equip(ZI, { [melee(ZI)]: id }); const g = ZI.resolveLoadoutStats();
    const sb = F.survivorStatBlock({ displayHP:100, armorRating:0, weaponDamage:g.weaponDamage, speed:100, heavySwingPct:g.heavySwingPct, staggerPct:g.staggerPct });
    const r1 = ZI.simulateCombat(sb, F.enemyStatBlock({ name:'x', hp:60, atk:7, xp:5 }), 'idle', ZI.seededRng(6));
    const r2 = ZI.simulateCombat(Object.assign({}, sb, { heavySwingPct:0, staggerPct:0 }), F.enemyStatBlock({ name:'x', hp:60, atk:7, xp:5 }), 'idle', ZI.seededRng(6));
    if (JSON.stringify(r1) !== JSON.stringify(r2)) same = false; skips += r1.log.filter(l => l.result === 'skip').length; }
  check('6: other weapons fight exactly as before — no skipped turns, no extra rolls (full differential vs the pre-CB1 build reported separately)', same && skips === 0, 'skips ' + skips); }
// 7 — old saves holding a Nail Bat or Iron Knuckles load and use the new values
{ const out = ['bat', 'iron_knuckles'].map(id => { const { ZI } = mkEnv({ zi_loadout: JSON.stringify({ melee: id }) }); const g = ZI.resolveLoadoutStats(); return [id, g.weaponDamage, g.heavySwingPct, g.staggerPct, ZI.itemWeight(ZI.getGearItem(id))]; });
  const kn = (() => { const { ZI } = mkEnv(); const it = ZI.getGearItem('pocket_knife'); return it && it.slot === 'melee' && it.rarity === 'common' && it.dmg === 16 && it.lootBonus === 5 && ZI.itemWeight(it) === 0.5 && !(ZI.CRAFT_RECIPES || []).some(r => r.grantsGear === 'pocket_knife'); })();
  check('7: old saves with a Nail Bat (28 dmg, heavy swing 30, 3 kg) or Iron Knuckles (16 dmg, stagger 25) load with the new values; the Pocket Knife exists with no recipe', JSON.stringify(out) === JSON.stringify([['bat', 28, 30, 0, 3], ['iron_knuckles', 16, 0, 25, 1]]) && kn, JSON.stringify(out) + ' knife ' + kn); }

results.forEach(r => log(r.join('  ')));
return results;
})();
