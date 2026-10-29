// Batch 1B tests: single-copy equip, story-item protection, take/put back and the base-or-camp rule.
// Usage (run_script): const T = await readFile('tests/carrying-1b.test.js'); await (new Function('readFile','log', T))(readFile, log);
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x || '']);
const mkEnv = (seedStore) => {
  const store = Object.assign({ zi_materials: JSON.stringify({ metal:200, wood:200, cloth:200, electronics:200, fuel:200, medical:200 }) }, seedStore || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } };
  fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw);
  return { ZI: fw.ZI, store };
};
const count = (ZI, id) => ZI.getStash().filter(x => x === id).length;
const carriedQty = (ZI, id) => ZI.getCarried().filter(e => e.id === id).reduce((a, e) => a + e.qty, 0);
const place = (E, base, at, camp) => {
  E.store.zi_trav_start = JSON.stringify(base);
  E.store.zi_trav_pos = JSON.stringify(Object.assign({ name:'Test cell', biome:'suburbia', difficulty:1 }, at));
  if (camp) E.store.zi_trav_camp = JSON.stringify(camp);
};

// ── A. Single-copy equip (and audit of the same bug pattern) ──
{
  const E = mkEnv(), ZI = E.ZI;
  ZI.grantGear('medkit', 3);
  const r = ZI.equipGear('medkit', 'consumable1');
  check('A: equip one of three copies', !!r && ZI.getLoadout().consumable1 === 'medkit');
  check('A: exactly one copy left the stash (3 → 2)', count(ZI, 'medkit') === 2, 'stash=' + count(ZI, 'medkit'));
  ZI.equipGear('medkit', 'consumable1');
  check('A: re-equipping the same slot keeps the total (displaced copy returns)', count(ZI, 'medkit') === 2 && ZI.getLoadout().consumable1 === 'medkit');
  ZI.unequipGear('consumable1');
  check('Audit: unequip returns exactly one copy (2 → 3)', count(ZI, 'medkit') === 3);
  ZI.takeMedKit();
  check('Audit: takeMedKit uses exactly one copy (3 → 2)', count(ZI, 'medkit') === 2);
  ZI.removeFromStash('medkit');
  check('Audit: removeFromStash removes exactly one copy (2 → 1)', count(ZI, 'medkit') === 1);
}

// ── B. Story-item protection from generic destructive/consumptive operations ──
{
  const E = mkEnv(), ZI = E.ZI;
  ZI.grantGear('sealed_crate', 1); ZI.grantGear('medkit', 1);
  check('B: Recycler refuses a story item', ZI.isRecyclable({ id:'sealed_crate', name:'Sealed Crate', outputs:{ metal:2 }, weight:2 }) === false
    && ZI.recycleAll([{ id:'sealed_crate', name:'Sealed Crate', outputs:{ metal:2 }, weight:2 }], 'solo', 'solo').queued.length === 0);
  check('B: selling/dropping (removeFromStash) refuses a story item', ZI.removeFromStash('sealed_crate', 'sell') === false && count(ZI, 'sealed_crate') === 1);
  const rec = ZI.CRAFT_RECIPES.find(r => r.kind === 'gear');
  ZI.enqueueJob('craft', rec.id, 1, {}, 1);
  const js = JSON.parse(E.store.zi_jobs); js.jobs.forEach(j => j.startedAt = Date.now() - 86400000); E.store.zi_jobs = JSON.stringify(js); ZI.getJobs();
  check('B: crafting ingredient consumption leaves the story item', count(ZI, 'sealed_crate') === 1);
  ZI.takeMedKit();
  check('B: "use any matching item" (takeMedKit) leaves the story item', count(ZI, 'sealed_crate') === 1 && count(ZI, 'medkit') === 0);
  check('B: story item still stored, counted and shown as on you', ZI.carryTotals().storyKg === ZI.itemWeight(ZI.getGearItem('sealed_crate')));
  check('B: story item cannot be taken into or put back from carried', ZI.takeToCarried('sealed_crate').ok === false && ZI.putBackToStash('sealed_crate').ok === false);
}

// ── C. Take / put back and the base-or-camp rule ──
{
  const E = mkEnv(), ZI = E.ZI;
  place(E, { gx:0, gy:0 }, { gx:0, gy:0 });
  ZI.grantGear('handmade_pouch', 1); ZI.grantGear('medkit', 3); ZI.grantGear('scout_kit', 1);
  ZI.equipGear('handmade_pouch', 'backpack');
  let notes = 0; const off = ZI.onInventoryChange(() => notes++);
  const before = count(ZI, 'medkit') + carriedQty(ZI, 'medkit');
  const t1 = ZI.takeToCarried('medkit', 1);
  check('C: Take at start/base cell', t1.ok && count(ZI, 'medkit') === 2 && carriedQty(ZI, 'medkit') === 1);
  check('C: Take notifies open screens', notes > 0);
  ZI.takeToCarried('medkit', 1);
  check('C: quantity preserved across take (stash + carried unchanged)', count(ZI, 'medkit') + carriedQty(ZI, 'medkit') === before);
  const third = ZI.takeToCarried('scout_kit', 1);
  check('C: pocket limit refuses with a clear reason (pouch = 2 pockets)', third.ok === false && /pocket/i.test(third.reason), third.reason);
  check('C: refusal is reported to open screens', ZI.lastCarryMessage && /pocket/i.test(ZI.lastCarryMessage.text));
  const pb = ZI.putBackToStash('medkit', 1);
  check('C: Put back at base', pb.ok && count(ZI, 'medkit') === 2 && carriedQty(ZI, 'medkit') === 1);
  check('C: Take more than the stash holds is refused', ZI.takeToCarried('scout_kit', 3).ok === false);

  // Field: away from base and camp
  place(E, { gx:0, gy:0 }, { gx:3, gy:2 });
  const n0 = notes;
  const ft = ZI.takeToCarried('scout_kit', 1), fp = ZI.putBackToStash('medkit', 1);
  check('C: field Take refused with the base/camp message', ft.ok === false && ft.reason === ZI.CARRY_BASE_ONLY_MSG);
  check('C: field Put back refused, nothing moved', fp.ok === false && count(ZI, 'medkit') === 2 && carriedQty(ZI, 'medkit') === 1);
  check('C: field refusal notifies screens', notes > n0);
  const lo0 = JSON.stringify(ZI.getLoadout()), st0 = JSON.stringify(ZI.getStash());
  const fe = ZI.equipGear('scout_kit', 'consumable2'); const feErr = ZI.lastEquipError; const fu = ZI.unequipGear('backpack');
  check('C: field equip refused (no stash bypass)', fe === null && feErr === ZI.CARRY_BASE_ONLY_MSG);
  check('C: field unequip refused (no stash bypass)', fu && fu.refused === true);
  check('C: field refusals left loadout and stash unchanged', JSON.stringify(ZI.getLoadout()) === lo0 && JSON.stringify(ZI.getStash()) === st0);

  // Camp cell: established camp allows it again
  place(E, { gx:0, gy:0 }, { gx:3, gy:2 }, { gx:3, gy:2 });
  const campTake = ZI.takeToCarried('medkit', 1);
  check('C: Take allowed on an established camp cell', ZI.atBaseOrCamp() && campTake.ok && carriedQty(ZI, 'medkit') === 2, JSON.stringify({ at: ZI.atBaseOrCamp(), campTake, carried: ZI.getCarried(), stash: ZI.getStash() }));
  check('C: equip allowed on a camp cell', !!ZI.equipGear('scout_kit', 'consumable2'));
  off();
}
{
  // kg limit: plenty of pockets, too much weight
  const E = mkEnv(), ZI = E.ZI;
  place(E, { gx:0, gy:0 }, { gx:0, gy:0 });
  ZI.grantGear('tactical_vest', 1); ZI.equipGear('tactical_vest', 'vest');
  const heavy = ZI.GEAR_ITEMS.filter(g => !g.isStory && ZI.itemPocketSize(g) === 1 && g.cat !== 'consumable' && !ZI.CARRIER_DATA[g.id])
    .sort((a, b) => ZI.itemWeight(b) - ZI.itemWeight(a))[0];
  ZI.grantGear(heavy.id, 12);
  let last = null; for (let i = 0; i < 12; i++) { last = ZI.takeToCarried(heavy.id, 1); if (!last.ok) break; }
  const t = ZI.carryTotals();
  check('C: kg limit refuses with a clear reason', last.ok === false && /heavy|kg/i.test(last.reason), last.reason + ' (' + heavy.id + ' ' + ZI.itemWeight(heavy) + ' kg)');
  check('C: load never exceeds the hard limit', t.loadKg <= t.hardLimitKg, t.loadKg + '/' + t.hardLimitKg);
}

// ── Kit Take is all-or-nothing (2B kits are one entry each) ──
{
  const E = mkEnv(), ZI = E.ZI; place(E, { gx:0, gy:0 }, { gx:0, gy:0 });
  ZI.grantGear('handmade_pouch', 1); ZI.equipGear('handmade_pouch', 'backpack'); // 2 pockets
  ZI.grantGear('scout_kit', 1);
  const s0 = JSON.stringify(ZI.getStash()), c0 = JSON.stringify(ZI.getCarried());
  const r1 = ZI.takeToCarried('scout_kit', 3);
  check('Kit-1: more kits than the stash holds → refused, nothing moved', r1.ok === false && /stash/i.test(r1.reason) && JSON.stringify(ZI.getStash()) === s0 && JSON.stringify(ZI.getCarried()) === c0, r1.reason);
  ZI.grantGear('medkit', 3);
  const s1 = JSON.stringify(ZI.getStash()), c1 = JSON.stringify(ZI.getCarried());
  const r2 = ZI.takeToCarried('medkit', 3);
  check('Kit-2: enough kits but not enough pockets → refused, no partial pocket use', r2.ok === false && /pocket/i.test(r2.reason) && JSON.stringify(ZI.getStash()) === s1 && JSON.stringify(ZI.getCarried()) === c1, r2.reason);
  const r3 = ZI.takeToCarried('medkit', 2);
  check('Kit-3: exact quantity and exact pocket fit → all requested kits move', r3.ok === true && carriedQty(ZI, 'medkit') === 2 && count(ZI, 'medkit') === 1, JSON.stringify(ZI.getCarried()));
  check('Kit-4: each kit stays its own carried entry with full charges', ZI.getCarried().filter(e => e.id === 'medkit').length === 2 && ZI.getCarried().every(e => e.qty === 1 && e.charges === 2));
}
{
  const E = mkEnv(), ZI = E.ZI; place(E, { gx:0, gy:0 }, { gx:0, gy:0 });
  ZI.grantGear('handmade_pouch', 1); ZI.equipGear('handmade_pouch', 'backpack');
  ZI.grantGear('bandage', 3);
  const r = ZI.takeToCarried('bandage', 3), stacked = ZI.getCarried().filter(e => e.id === 'bandage');
  const rx = ZI.takeToCarried('bandage', 2);
  check('Kit-5: ordinary Take unchanged (stack of 3 in one entry; over-ask refused)', r.ok && stacked.length === 1 && stacked[0].qty === 3 && rx.ok === false, JSON.stringify(ZI.getCarried()));
}

let pass = 0; for (const [r, n, x] of results) { if (r === 'PASS') pass++; log(r + '  ' + n + '  ' + (r === 'FAIL' ? x : '')); }
log(pass + '/' + results.length + ' carrying-1B checks passed');
})();
