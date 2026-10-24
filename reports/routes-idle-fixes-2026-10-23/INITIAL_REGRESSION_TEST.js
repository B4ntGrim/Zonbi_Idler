// Idle route reward retention and XP regression checks. Uses isolated in-memory saves.
// Run with the same readFile/log wrapper as the existing acceptance suites.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = [], T0 = 1790500000000;
const test = (name, fn) => { try { fn(); results.push(['PASS',name,'']); } catch(e) { results.push(['FAIL',name,e.message]); } };
const expect = (ok, why) => { if (!ok) throw new Error(why); };
const env = (saved, clock) => {
  const store = saved || {}, clk = clock || { t:T0 }; let seed = 101;
  const M = Object.create(Math); M.random = () => { seed = Math.imul(seed,1664525) + 1013904223 | 0; return (seed >>> 0) / 4294967296; };
  class D extends Date { constructor(...args) { super(...(args.length ? args : [clk.t])); } static now() { return clk.t; } }
  const ls = { getItem:k => k in store ? store[k] : null, setItem:(k,v) => { store[k]=String(v); }, removeItem:k => { delete store[k]; }, key:i => Object.keys(store)[i], get length() { return Object.keys(store).length; } };
  const fw = { localStorage:ls,sessionStorage:ls,Date:D,Math:M,JSON,console:{log(){},warn(){},error(){}},setInterval:()=>0,clearInterval(){},setTimeout:()=>0,clearTimeout(){},document:{hidden:true,visibilityState:'hidden',addEventListener(){},querySelectorAll:()=>[]},addEventListener(){},location:{reload(){}} };
  fw.window=fw; fw.ZI={_installedClock:()=>clk.t};
  new Function('fw','with(fw){'+src+'}')(fw);
  return { Z:fw.ZI,store,clk };
};
const repeat = () => {
  const e=env(),Z=e.Z,route=Z.ROUTES.find(r=>r.id==='rt_suburb1'),completed=[];
  const complete=Z.completeRun;
  Z.completeRun=function(...args) { const r=complete.apply(this,args); completed.push(r); return r; };
  Z.startRouteRun(route,[],'passive',0,true);
  const duration=Z.routeRunProgress(route.id).durationMs;
  e.clk.t+=duration*3.5; Z.settleRouteRuns();
  return Object.assign(e,{route,completed,total:completed.reduce((n,r)=>n+r.loot,0)});
};
const fixture = {id:'rt_xp_fixture',name:'XP fixture',biome:'suburbia',duration:1,risk:5,rmatTier:1,nodes:['Departure','Extraction']};
const xpRun = mode => { const e=env(); e.Z.completeRun(fixture,[],mode,0); return e.Z.getStatXp(); };
test('Three idle repeats retain every haul after reload',()=>{
  const e=repeat(),r=env(e.store,e.clk),pending=r.Z.getUnclaimedRouteRewards();
  expect(e.completed.length===3 && pending.runs===3 && pending.loot===e.total,'Lost a completed haul or its value');
  expect(r.Z.getLastRun().loot===e.completed[2].loot,'Last Run no longer describes the latest individual run');
});
test('A repeat catch-up can claim the full generated reward exactly once',()=>{
  const e=repeat(),first=e.Z.claimLastRun(),bank=e.Z.getWanderLoot().length,second=e.Z.claimLastRun();
  expect(first.ok && first.amount===e.total,'Claim did not include all completed hauls');
  expect(bank===3 && !second.ok && e.Z.getWanderLoot().length===bank,'Repeated claim duplicated or omitted a haul');
});
test('Claimed rewards remain claimed across reload',()=>{
  const e=repeat(); e.Z.claimLastRun(); const r=env(e.store,e.clk);
  expect(!r.Z.claimLastRun().ok && r.Z.getWanderLoot().length===3,'Reload re-granted rewards');
});
test('New completions after Claim start a fresh pending set',()=>{
  const e=repeat(); e.Z.claimLastRun(); const last=e.Z.completeRun(e.route,[],'passive',0),pending=e.Z.getUnclaimedRouteRewards();
  expect(pending.runs===1 && pending.loot===last.loot,'Previously claimed rewards were carried forward');
});
test('Different routes preserve their individual recycler hauls',()=>{
  const e=env(),Z=e.Z,a=Z.ROUTES.find(r=>r.id==='rt_suburb1'),b=Z.ROUTES.find(r=>r.id==='rt_suburb2');
  const one=Z.completeRun(a,[],'active',0),two=Z.completeRun(b,[],'passive',0);
  const hauls=[{name:a.name+' haul',value:one.loot,rarity:'Common'},{name:b.name+' haul',value:two.loot,rarity:'Common'}];
  const expected=hauls.map(it=>Z.toRecyclerItem(it).outputs);
  const claim=Z.claimLastRun(),bank=Z.getWanderLoot();
  expect(claim.ok && claim.amount===one.loot+two.loot && bank.length===2,'Mixed routes lost a reward');
  expect(bank[0].name===hauls[0].name && bank[1].name===hauls[1].name && JSON.stringify(bank.map(it=>it.outputs))===JSON.stringify(expected),'Combining rewards changed their materials or rounding');
});
test('A legacy unclaimed report joins later completions only once',()=>{
  const e=env(),Z=e.Z,route=Z.ROUTES[0];
  Z.setLastRun({name:'Legacy',loot:11,claimed:false});
  const a=Z.completeRun(route,[],'passive',0),b=Z.completeRun(route,[],'passive',0),pending=Z.getUnclaimedRouteRewards();
  expect(pending.runs===3 && pending.loot===11+a.loot+b.loot,'Legacy reward was omitted or duplicated');
});
test('A legacy claimed report contributes no pending rewards',()=>{
  const e=env(),Z=e.Z; Z.setLastRun({name:'Legacy',loot:11,claimed:true});
  const run=Z.completeRun(Z.ROUTES[0],[],'active',0),pending=Z.getUnclaimedRouteRewards();
  expect(pending.runs===1 && pending.loot===run.loot,'Already-claimed legacy reward was reintroduced');
});
test('Legacy unclaimed saves can still be claimed directly',()=>{
  const {Z}=env(); Z.setLastRun({name:'Legacy',loot:11,claimed:false});
  const r=Z.claimLastRun(); expect(r.ok && r.amount===11 && !Z.claimLastRun().ok,'Legacy Claim compatibility failed');
});
test('No completed report means there is nothing to claim',()=>{
  const {Z}=env(); expect(!Z.claimLastRun().ok,'A missing report produced a reward');
});
test('Unavailable banking leaves rewards unclaimed',()=>{
  const {Z}=env(); Z.completeRun(Z.ROUTES[0],[],'active',0); Z.bankWanderLoot=undefined;
  expect(!Z.claimLastRun().ok && !Z.getLastRun().claimed,'Reward was marked claimed without a banking service');
});
test('Active completion retains full base XP',()=>{
  const xp=xpRun('active'); expect(xp.command===33 && xp.logistics===22,'Active XP changed');
});
test('Idle completion applies 0.8 before normal per-track rounding',()=>{
  const xp=xpRun('passive'); expect(xp.command===26 && xp.logistics===18,'Idle completion ignored its XP multiplier');
});
test('Existing non-passive mode values retain full XP',()=>{
  const xp=xpRun('scav'); expect(xp.command===33 && xp.logistics===22,'Existing mode compatibility changed');
});
test('Idle scales combat, loot and hazard XP and keeps off-map combat metadata',()=>{
  const play=mode=>{const {Z}=env(),events=[];Z.emitAction=(id,scale,meta)=>events.push({id,scale,meta});
    Z.completeRun(Object.assign({},fixture,{nodes:['Departure','Residential Zone','Convenience Store','Radiation Fields','Extraction']}),[],mode,0);return events;};
  const active=play('active'),idle=play('passive');
  expect(active.length===4 && idle.length===4 && idle.every((e,i)=>e.id===active[i].id && Math.abs(e.scale-active[i].scale*.8)<1e-9),'A route action bypassed the idle multiplier');
  expect(idle.find(e=>e.id==='kill').meta.noCellKill===true,'Route combat started crediting the current map cell');
});
test('Offline repeat completions use the same idle XP rule',()=>{
  const e=env(),Z=e.Z; Z.ROUTES.push(fixture); Z.startRouteRun(fixture,[],'passive',0,true);
  e.clk.t+=Z.routeRunProgress(fixture.id).durationMs*3.5; Z.settleRouteRuns();
  const xp=Z.getStatXp(); expect(xp.command===78 && xp.logistics===54,'Catch-up bypassed idle XP scaling');
});
test('Pending hauls stay inside the existing per-slot save snapshot',()=>{
  const e=repeat(),saved=e.Z._snapshot(),r=env(saved,e.clk),pending=r.Z.getUnclaimedRouteRewards();
  expect(pending.runs===3 && pending.loot===e.total,'Slot snapshot did not retain pending hauls');
});
for(const name of ['Zombie Idler v2.html','Zombie Idler v2 - TEST SAVE.html']) {
  const html=await readFile(name);
  test(name+': Claim preview uses all pending hauls',()=>expect(html.includes('ZI.getUnclaimedRouteRewards(last)') && html.includes('pending.loot') && html.includes('pending.runs') && html.includes("'Claim All'"),'Pending reward UI missing'));
  test(name+': idle XP preview reads the runtime multiplier',()=>expect(html.includes('XP ×{ZI.ROUTE_XP_MULTIPLIERS.passive}'),'XP preview can drift from runtime'));
}
results.forEach(r=>log(r[0]+'  '+r[1]+(r[0]==='FAIL'?'  '+r[2]:'')));
log(results.filter(r=>r[0]==='PASS').length+'/'+results.length+' idle-route checks passed');
return results;
})();