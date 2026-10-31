// TOOL-01 — Hand tools and the salvage baseline (Sam, Oct 30).
// reference/vehicle-recycler-tools-proposal.md. Five tool families with Ready -> Worn -> Broken
// states that recover contextual materials in Traversal, Wandering and Routes, assist Recycler
// jobs (reserving the tool and wearing it only on completion), and can be repaired or scrapped.
// Written during the Oct 30 review; the feature shipped with no tests of its own.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const base = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const extra = ['game/progression.js', 'game/progression-live.js', 'game/character.js', 'game/operations.js'];
const tail = (await Promise.all(extra.map(readFile))).join('\n');
const results = [], check = (n, ok, d) => results.push([ok ? 'PASS' : 'FAIL', n, d === undefined ? '' : String(d)]);
const T0 = 1793200000000;
const mkEnv = (store, now) => {
  store = store || {}; const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const clock = { now: now || T0 };
  class D extends Date { constructor(...a) { if (a.length) super(...a); else super(clock.now); } static now() { return clock.now; } }
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date: D, Math, JSON, Proxy, Object, Array,
    setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){}, search:'' } };
  fw.window = fw; new Function('fw', 'with(fw){' + base + '\n' + tail + '}')(fw);
  fw.ZI._installedClock = () => clock.now; fw.ZI.wanderMounted = false; return { ZI: fw.ZI, store, clock, fw };
};
const fresh = (now) => { const store = { zi_world_seed:'1' }; mkEnv(store).ZI.startNewInSlot('solo', 1, { gender:'male', profession:'vanguard' }); return mkEnv(store, now || T0 + 1000); };
const FAMILIES = ['screwdriver','wrench','needlenose_pliers','claw_hammer','acetylene_torch'];

// ── The condition ladder ──
{ const Z = mkEnv({ zi_world_seed:'1' }).ZI;
  // Scoped to items that belong to a hand-tool FAMILY. Other cat:'tool' items (bird net, bird
  // trap and anything later) are not condition-laddered hand tools and are not this suite's business.
  const tools = Z.GEAR_ITEMS.filter(g => g.cat === 'tool' && g.toolFamily);
  check('Five tool families exist in three states each', tools.length === 15 && new Set(tools.map(t => t.toolFamily)).size === 5, tools.length + ' items');
  check('Every tool state is ready, worn or broken', tools.every(t => ['ready','worn','broken'].includes(t.toolCondition)));
  const bad = [];
  FAMILIES.forEach(id => {
    const ready = Z.getGearItem(id), worn = ready && Z.getGearItem(ready.toolNextId), broken = worn && Z.getGearItem(worn.toolNextId);
    if (!ready || ready.toolCondition !== 'ready') bad.push(id + ':ready');
    if (!worn || worn.toolCondition !== 'worn') bad.push(id + ':worn');
    if (!broken || broken.toolCondition !== 'broken') bad.push(id + ':broken');
    if (broken && broken.toolNextId) bad.push(id + ':broken-has-next');
    if (worn && worn.toolRepairId !== id) bad.push(id + ':worn-repair');
    if (broken && broken.toolRepairId !== id) bad.push(id + ':broken-repair');
  });
  check('Ready -> Worn -> Broken chains and repair targets are consistent', bad.length === 0, bad.join(' '));
  check('Broken tools are scrap with material outputs', tools.filter(t => t.toolCondition === 'broken').every(t => t.toolScrap && t.outputs && Object.keys(t.outputs).length));
  check('A Utility Tool slot exists and accepts tools', !!Z.GEAR_SLOTS.find(s => s.id === 'toolbelt' && s.accepts === 'tool'));
}
{ const E = mkEnv({ zi_world_seed:'1' });
  check('Bone Fragments, Fasteners and Wiring are real materials',
    ['bones','fasteners','wiring'].every(k => E.fw.ZI_MATERIALS && E.fw.ZI_MATERIALS[k] && E.fw.ZI_MATERIALS[k].max > 0)); }

// ── Sprites ──
{ const Z = mkEnv({ zi_world_seed:'1' }).ZI, missing = [];
  for (const t of Z.GEAR_ITEMS.filter(g => g.cat === 'tool' && g.toolFamily)) {
    if (!t.sprite) { missing.push(t.id + ':no-sprite'); continue; }
    try { await readFile(t.sprite); } catch (e) { missing.push(t.sprite); }
  }
  check('Every tool sprite resolves to a real file', missing.length === 0, missing.join(' ')); }

// ── Equipping ──
{ const Z = fresh().ZI;
  Z.grantGear('screwdriver', 1);
  check('A ready tool equips to the toolbelt', !!Z.equipGear('screwdriver', 'toolbelt') && Z.getLoadout().toolbelt === 'screwdriver');
  Z.grantGear('wrench_broken', 1);
  check('A broken tool cannot be equipped', Z.equipGear('wrench_broken', 'toolbelt') === null); }

// ── Carried vs equipped ──
{ const Z = fresh().ZI;
  check('No tool carried means no field effect', !Z.carriedHandTool('screwdriver'));
  Z.grantGear('screwdriver', 1); Z.equipGear('screwdriver', 'toolbelt');
  check('An equipped tool counts as carried', !!Z.carriedHandTool('screwdriver'));
  check('Storing a tool is not the same as carrying it', !Z.carriedHandTool('wrench')); }
{ const Z = fresh().ZI;
  Z.saveCarried((Z.getCarried() || []).concat([{ id:'claw_hammer', qty:1 }]));
  check('A tool in pockets counts as carried', !!Z.carriedHandTool('hammer')); }
{ const Z = fresh().ZI;
  Z.saveCarried((Z.getCarried() || []).concat([{ id:'claw_hammer_broken', qty:1 }]));
  check('A broken carried tool gives no field effect', !Z.carriedHandTool('hammer')); }

// ── Wearing out ──
{ const Z = fresh().ZI;
  Z.grantGear('screwdriver', 1); Z.equipGear('screwdriver', 'toolbelt');
  Z.useCarriedHandTool('screwdriver');
  check('Using an equipped tool advances it to worn', Z.getLoadout().toolbelt === 'screwdriver_worn');
  Z.useCarriedHandTool('screwdriver');
  check('Using it again breaks it', Z.getLoadout().toolbelt === 'screwdriver_broken');
  check('A broken tool is no longer usable in the field', !Z.carriedHandTool('screwdriver') && !Z.useCarriedHandTool('screwdriver')); }
{ const Z = fresh().ZI;
  Z.saveCarried((Z.getCarried() || []).concat([{ id:'wrench', qty:1 }]));
  Z.useCarriedHandTool('wrench');
  const ids = (Z.getCarried() || []).map(e => e.id);
  check('A carried tool advances in place', ids.includes('wrench_worn') && !ids.includes('wrench')); }

// ── Repair ──
{ const Z = fresh().ZI, M = Z.getRmatHoldings ? null : null;
  Z.grantGear('wrench_worn', 1);
  check('A ready tool needs no repair', !Z.handToolRepairCheck('wrench').ok);
  const low = Z.handToolRepairCheck('wrench_worn');
  check('Repair is gated on Mechanical 2 or Engineering 2', !low.ok && /Mechanical|Engineering/.test(low.reason), low.reason); }
{ const E = fresh(), Z = E.ZI;
  Z.grantGear('wrench_worn', 1);
  Z.addStatXp && Z.addStatXp('mechanical', 100000);
  E.fw.ZI_MATERIALS.metal.current = 0; E.fw.ZI_MATERIALS.electronics.current = 0;
  const broke = Z.handToolRepairCheck('wrench_worn');
  check('Repair is refused without 2 Metal and 1 Electronics', !broke.ok && /Metal/.test(broke.reason), broke.reason);
  E.fw.ZI_MATERIALS.metal.current = 10; E.fw.ZI_MATERIALS.electronics.current = 10;
  const r = Z.repairHandTool('wrench_worn');
  check('Repair restores the tool to ready', r.ok && r.itemId === 'wrench' && Z.getStash().includes('wrench'), JSON.stringify(r));
  check('Repair charges 2 Metal and 1 Electronics', E.fw.ZI_MATERIALS.metal.current === 8 && E.fw.ZI_MATERIALS.electronics.current === 9); }

// ── Recycler: reservation, wear on completion, return on cancel ──
const salvage = (outputs) => ({ id:'scrap-test', name:'Test Salvage', weight:2, tier:1, rarity:'Common', outputs:outputs });
{ const E = fresh(), Z = E.ZI;
  check('A metal-only item asks for a wrench', (Z.recyclerToolMatch(salvage({ metal:5 })) || {}).family === 'wrench');
  check('An electronics-only item asks for pliers', (Z.recyclerToolMatch(salvage({ electronics:5 })) || {}).family === 'pliers');
  check('A mixed item asks for a screwdriver', (Z.recyclerToolMatch(salvage({ metal:5, electronics:2 })) || {}).family === 'screwdriver'); }
{ const E = fresh(), Z = E.ZI;
  const r = Z.queueRecycle(salvage({ metal:5 }), 'solo', 'solo', 'wrench');
  check('An assisted job is refused with no matching tool stored', !r.ok && /tool/i.test(r.reason), r.reason); }
{ const E = fresh(), Z = E.ZI;
  Z.grantGear('wrench', 1);
  const r = Z.queueRecycle(salvage({ metal:5 }), 'solo', 'solo', 'screwdriver');
  check('A tool that does not fit the salvage is refused', !r.ok, r.reason); }
{ const E = fresh(), Z = E.ZI;
  Z.grantGear('wrench_broken', 1);
  const r = Z.queueRecycle(salvage({ metal:5 }), 'solo', 'solo', 'wrench');
  check('A broken tool cannot assist a recycle job', !r.ok, r.reason); }
{ const E = fresh(), Z = E.ZI;
  Z.grantGear('wrench', 1);
  const before = Z.queueRecycle(salvage({ metal:5 }), 'solo', 'solo', null);
  const plain = before.ok ? before.job.meta.item.outputs.metal : null;
  const E2 = fresh(), Z2 = E2.ZI; Z2.grantGear('wrench', 1);
  const r = Z2.queueRecycle(salvage({ metal:5 }), 'solo', 'solo', 'wrench');
  check('An assisted job reserves the tool out of the stash', r.ok && !Z2.getStash().includes('wrench') && r.job.meta.reservedToolId === 'wrench');
  check('A wrench adds Metal to the yield', r.job.meta.item.outputs.metal === plain + 1, plain + ' -> ' + r.job.meta.item.outputs.metal); }
{ const E = fresh(), Z = E.ZI;
  Z.grantGear('needlenose_pliers', 1);
  const plain = Z.queueRecycle(salvage({ electronics:5 }), 'solo', 'solo', null);
  const E2 = fresh(), Z2 = E2.ZI; Z2.grantGear('needlenose_pliers', 1);
  const r = Z2.queueRecycle(salvage({ electronics:5 }), 'solo', 'solo', 'pliers');
  check('Pliers add Wiring and shorten the job', r.ok && r.job.meta.item.outputs.wiring === 1 && r.job.duration < plain.job.duration,
    r.job.duration + ' vs ' + plain.job.duration); }
{ const E = fresh(), Z = E.ZI;
  Z.grantGear('wrench', 1);
  const r = Z.queueRecycle(salvage({ metal:5 }), 'solo', 'solo', 'wrench');
  Z.cancelJob(r.job.id);
  check('Cancelling returns the tool unchanged', Z.getStash().includes('wrench') && !Z.getStash().includes('wrench_worn')); }
{ const E = fresh(), Z = E.ZI;
  Z.grantGear('wrench', 1);
  const r = Z.queueRecycle(salvage({ metal:5 }), 'solo', 'solo', 'wrench');
  Z.grantRecycleOutput(r.job.meta.item, r.job.meta);
  check('Completing an assisted job returns the tool one state worn',
    Z.getStash().includes('wrench_worn') && !Z.getStash().includes('wrench'), JSON.stringify(Z.getStash().filter(i => /wrench/.test(i)))); }
{ const E = fresh(), Z = E.ZI;
  Z.grantGear('wrench', 1);
  const r = Z.queueRecycle(salvage({ metal:5 }), 'solo', 'solo', 'wrench');
  const dropped = Z.grantRecycleOutput({ id:'broken', name:'Malformed' }, r.job.meta);
  check('Review fix: a malformed job hands the reserved tool back instead of destroying it',
    dropped === true && Z.getStash().includes('wrench'), JSON.stringify(Z.getStash().filter(i => /wrench/.test(i)))); }

// ── Broken tools as scrap ──
{ const E = fresh(), Z = E.ZI;
  Z.grantGear('claw_hammer_broken', 1);
  const list = Z.brokenToolRecyclerItems();
  check('Broken tools appear as Recycler scrap with their outputs',
    list.length === 1 && list[0].fromToolScrap === true && list[0].outputs.metal === 2, JSON.stringify(list.map(i => i.id))); }

// ── Field salvage ──
{ const E = fresh(), Z = E.ZI;
  check('A POI with no tool pool yields nothing', Z.handToolForPoi('church', () => 0.5) === null);
  check('Hardware stores and scrapyards can yield a tool',
    !!Z.handToolForPoi('hardware-store', () => 0.1) && !!Z.handToolForPoi('scrapyard', () => 0.1));
  check('The roll is deterministic for a given rng', Z.handToolForPoi('hardware-store', () => 0) === Z.handToolForPoi('hardware-store', () => 0)); }
{ const E = fresh(), Z = E.ZI;
  check('No tool carried means no route salvage', Z.routeToolSalvage('loot').length === 0);
  Z.saveCarried((Z.getCarried() || []).concat([{ id:'claw_hammer', qty:1 }]));
  E.fw.ZI_MATERIALS.fasteners.current = 0;
  const finds = Z.routeToolSalvage('loot');
  check('A carried hammer recovers Fasteners on a loot node', finds.length === 1 && E.fw.ZI_MATERIALS.fasteners.current === 2, JSON.stringify(finds));
  check('Route salvage wears the tool', (Z.getCarried() || []).some(e => e.id === 'claw_hammer_worn')); }
{ const E = fresh(), Z = E.ZI;
  Z.saveCarried((Z.getCarried() || []).concat([{ id:'acetylene_torch', qty:1 }]));
  E.fw.ZI_MATERIALS.fuel.current = 0;
  check('The torch will not cut without Fuel', Z.routeToolSalvage('vehicle').length === 0);
  E.fw.ZI_MATERIALS.fuel.current = 5; E.fw.ZI_MATERIALS.metal.current = 0;
  const finds = Z.routeToolSalvage('vehicle');
  check('The torch cuts plate scrap and burns 1 Fuel',
    finds.length === 1 && E.fw.ZI_MATERIALS.metal.current === 3 && E.fw.ZI_MATERIALS.fuel.current === 4, JSON.stringify(finds)); }
{ const E = fresh(), Z = E.ZI;
  E.fw.ZI_MATERIALS.fasteners.current = E.fw.ZI_MATERIALS.fasteners.max;
  Z.saveCarried((Z.getCarried() || []).concat([{ id:'claw_hammer', qty:1 }]));
  check('A full material store wastes neither the find nor the tool',
    Z.routeToolSalvage('loot').length === 0 && (Z.getCarried() || []).some(e => e.id === 'claw_hammer')); }

// ── addMaterial ──
{ const E = fresh(), Z = E.ZI;
  E.fw.ZI_MATERIALS.bones.current = 0;
  check('addMaterial returns what it actually credited', Z.addMaterial('bones', 5) === 5 && E.fw.ZI_MATERIALS.bones.current === 5);
  E.fw.ZI_MATERIALS.bones.current = E.fw.ZI_MATERIALS.bones.max - 2;
  check('addMaterial clamps at the cap', Z.addMaterial('bones', 10) === 2 && E.fw.ZI_MATERIALS.bones.current === E.fw.ZI_MATERIALS.bones.max);
  check('addMaterial refuses nonsense', Z.addMaterial('bones', -1) === 0 && Z.addMaterial('nope', 5) === 0); }

return results;
})();
