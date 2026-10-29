// Batch 1A — carrying data model (spec §14, §14.8). Usage: const T = await readFile('tests/carrying.test.js'); await (new Function('readFile','log', T))(readFile, log);
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x || '']);
const mkEnv = (seedStore) => {
  const store = Object.assign({}, seedStore || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } };
  fw.window = fw; new Function('fw', 'with(fw){' + src + '}')(fw); return { fw, ZI: fw.ZI, store };
};
const atField = (E) => { E.store.zi_trav_start = JSON.stringify({ gx:0, gy:0 }); E.store.zi_trav_pos = JSON.stringify({ gx:5, gy:5, name:'Field E6' }); };
const atBase  = (E) => { E.store.zi_trav_start = JSON.stringify({ gx:0, gy:0 }); E.store.zi_trav_pos = JSON.stringify({ gx:0, gy:0, name:'Home A1' }); };

// Old-save migration: stash and loadout untouched, empty carried store created once
{
  const stash = JSON.stringify({ v:2, items:['medkit','scout_kit','sealed_crate'] }), lo = JSON.stringify({ melee:'machete', backpack:'handmade_pouch' });
  const E = mkEnv({ zi_stash: stash, zi_loadout: lo }), ZI = E.ZI;
  check('Migration: no carried store before first read', E.store.zi_carried == null);
  check('Migration: empty store created on first read', ZI.getCarried().length === 0 && E.store.zi_carried === JSON.stringify({ v:1, items:[] }));
  check('Migration: stash unchanged', E.store.zi_stash === stash);
  check('Migration: loadout unchanged (belt reads empty)', E.store.zi_loadout === lo && ZI.getLoadout().belt === null && ZI.getLoadout().melee === 'machete');
  check('Migration: second read does not rewrite', ZI.ensureCarriedStore() === false);
}
// Belt slot
{
  const E = mkEnv({}), ZI = E.ZI; atBase(E);
  ['handmade_pouch','backpack_sm','satchel'].forEach(id => ZI.devGrantItem(id, 1));
  check('Belt: slot exists, accepts gear', ZI.GEAR_SLOTS.some(s => s.id === 'belt' && s.accepts === 'gear'));
  check('Belt: handmade pouch fits the Belt', !!ZI.equipGear('handmade_pouch', 'belt') && ZI.getLoadout().belt === 'handmade_pouch');
  check('Belt: a Daypack does not fit the Belt', ZI.equipGear('backpack_sm', 'belt') === null && /Belt/.test(ZI.lastEquipError));
  check('Belt: handmade pouch also fits the Pack slot', ZI.itemAllowedSlots(ZI.getGearItem('handmade_pouch')).includes('backpack'));
}
// Pocket and kg totals
{
  const E = mkEnv({}), ZI = E.ZI; atBase(E);
  ['backpack_sm','satchel','vest_t3','sealed_crate'].forEach(id => ZI.devGrantItem(id, 1));
  ZI.equipGear('backpack_sm','backpack'); ZI.equipGear('satchel','belt'); ZI.equipGear('vest_t3','vest');
  const t = ZI.carryTotals();
  check('Totals: pockets from Pack + Belt + Body Armor (2+3+5)', t.pocketsMax === 10, 'max=' + t.pocketsMax);
  check('Totals: capacity 15 + 15 + 5 + 3 kg', t.capacityKg === 38, 'cap=' + t.capacityKg);
  check('Totals: equipped items use no pockets', t.pocketsUsed === 0);
  check('Totals: equipped items count toward kg', t.gearKg > 0);
  check('Totals: story item in the stash weighs 2 kg on you, 0 pockets', t.storyKg === 2 && ZI.itemPocketSize(ZI.getGearItem('sealed_crate')) === 0);
  check('Totals: carryCapacity is now derived from kg', ZI.resolveLoadoutStats().carryCapacity === Math.round(100 * (1 - t.loadKg / t.capacityKg)) && ZI.resolveLoadoutStats().capacityKg === 38);
  check('Totals: Rig and other slots give 0 pockets', ZI.CARRIER_SLOTS.join() === 'backpack,belt,vest');
}
// Stacks, pockets refusal, 125% kg refusal
{
  const E = mkEnv({}), ZI = E.ZI; atBase(E);
  ZI.devGrantItem('tactical_vest', 1); ZI.equipGear('tactical_vest','vest');
  check('Stack: 7 bandages fill 2 pockets (5 + 2)', ZI._carriedAdd('bandage', 7).ok && ZI.getCarried().length === 2 && ZI.carryTotals().pocketsUsed === 2);
  check('Stack: kits never stack (2 med kits = 2 pockets)', ZI._carriedAdd('medkit', 2).ok && ZI.carryTotals().pocketsUsed === 4);
  const t0 = ZI.carryTotals();
  let added = 0, last = null; for (let i = 0; i < 8; i++) { last = ZI._carriedAdd('vest_t3', 1); if (last.ok) added++; else break; }
  const t1 = ZI.carryTotals();
  check('Limits: refusal before exceeding 125% kg or pockets', !last.ok && t1.loadKg <= t1.hardLimitKg && t1.pocketsUsed <= t1.pocketsMax, last.reason);
  check('Limits: story items cannot be added to carried', ZI.canCarryAdd('sealed_crate', 1).ok === false);
}
{
  const E = mkEnv({}), ZI = E.ZI; atBase(E);
  ZI.devGrantItem('handmade_pouch', 1); ZI.equipGear('handmade_pouch','backpack');
  ZI._carriedAdd('medkit', 1); ZI._carriedAdd('scout_kit', 1);
  check('Limits: third pocketed item refused with 2 pockets', ZI.canCarryAdd('medkit', 1).ok === false && /pocket/i.test(ZI.canCarryAdd('medkit', 1).reason));
}
// Losing pockets: base returns overflow to stash; field refuses and names items
{
  const E = mkEnv({}), ZI = E.ZI; atBase(E);
  ZI.devGrantItem('handmade_pouch', 1); ZI.equipGear('handmade_pouch','backpack'); ZI._carriedAdd('medkit', 1); ZI._carriedAdd('scout_kit', 1);
  const st0 = ZI.getStash().length;
  const r = ZI.unequipGear('backpack');
  check('Carrier off at base: overflow back to stash', !r.refused && ZI.getCarried().length === 0 && ZI.getStash().length === st0 + 3);
}
{
  const E = mkEnv({}), ZI = E.ZI; atBase(E);
  ZI.devGrantItem('handmade_pouch', 1); ZI.equipGear('handmade_pouch','backpack'); ZI._carriedAdd('medkit', 1);
  atField(E);
  const r = ZI.unequipGear('backpack');
  check('Carrier off in the field: refused, items named', r.refused === true && /Field Medkit/.test(r.reason) && ZI.getLoadout().backpack === 'handmade_pouch' && ZI.getCarried().length === 1);
}
// Normalisation never deletes from storage
{
  const raw = JSON.stringify({ v:1, items:[{ id:'nope', qty:2 }, { id:'bandage', qty:12 }] });
  const E = mkEnv({ zi_carried: raw }), ZI = E.ZI;
  const c = ZI.getCarried();
  check('Normalise: unknown id skipped in view, storage untouched', !c.some(e => e.id === 'nope') && E.store.zi_carried === raw);
  check('Normalise: 12 bandages read as stacks 5/5/2', c.map(e => e.qty).join() === '5,5,2');
}
// New items: data only, no recipes
{
  const E = mkEnv({}), ZI = E.ZI;
  const ids = ['belt_pouch','satchel','rucksack','cargo_jacket','tactical_vest','heavy_plate'];
  check('New carriers exist with §14.2 numbers', ids.every(id => ZI.getGearItem(id) && ZI.getGearItem(id).pockets != null) && ZI.getGearItem('molle_pack').capacityKg > ZI.getGearItem('backpack_lg').capacityKg);
  check('New carriers have no recipes yet (owed)', !ZI.CRAFT_RECIPES.some(r => ids.includes(r.grantsGear)));
}
let pass = 0; for (const [r, n, x] of results) { if (r === 'PASS') pass++; log(r + '  ' + n + '  ' + (r === 'FAIL' ? x : '')); }
log(pass + '/' + results.length + ' carrying checks passed');
})();
