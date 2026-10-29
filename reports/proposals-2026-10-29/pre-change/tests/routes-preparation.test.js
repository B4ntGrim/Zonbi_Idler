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

test('Preview is stable and reads the actual character level',()=>{
  const {Z}=env(),route=Z.ROUTES[1],a=Z.getRoutePreparation(route,2),b=Z.getRoutePreparation(route,2);
  expect(a.characterLevel===Z.getCharacterLevel() && JSON.stringify(a)===JSON.stringify(b),'Preview uses sample values or random estimates');
});
test('Combat skill and working equipment improve encounter readiness',()=>{
  const {Z}=env(),route=Z.ROUTES[1],a=Z.getRoutePreparation(route,0);
  Z.saveLoadout(Object.assign(Z.emptyLoadout(),{primary:'rifle',vest:'vest_t3'}));
  const b=Z.getRoutePreparation(route,0);
  expect(b.combatWinChance>a.combatWinChance && b.armor>a.armor && b.freeKg<a.freeKg,'Equipment did not create protection/cargo tradeoffs');
  Z._wj(Z.STAT_XP_KEY,{combat:1e7}); const c=Z.getRoutePreparation(route,0);
  expect(c.combatWinChance>b.combatWinChance || b.combatWinChance===Z.ROUTE_PREP_TABLE.maxWin,'Combat training did not improve readiness');
});
test('Athletics reduces estimated travel time at the same load',()=>{
  const {Z}=env(),r=Z.ROUTES[1],a=Z.getRoutePreparation(r,0);
  Z._wj(Z.STAT_XP_KEY,{athletics:1e7});const b=Z.getRoutePreparation(r,0);
  expect(b.durationMs<a.durationMs && b.freeKg===a.freeKg,'Athletics does not affect travel or changed cargo');
});
test('Carried weight increases travel time and reduces haul room',()=>{
  const {Z}=env(),r=Z.ROUTES[1],a=Z.getRoutePreparation(r,0);
  Z.saveWanderRun(Object.assign(Z.defaultWanderRun(),{carried:[{name:'Existing haul',value:30,weight:5}]}));
  const b=Z.getRoutePreparation(r,0);
  expect(b.durationMs>a.durationMs && b.freeKg<a.freeKg,'Existing carried weight is not part of preparation');
});
test('Quiet weapon and Stealth increase encounter avoidance',()=>{
  const {Z}=env(),r=Z.ROUTES[1];
  Z.saveLoadout(Object.assign(Z.emptyLoadout(),{primary:'rifle'}));const loud=Z.getRoutePreparation(r,0);
  Z.saveLoadout(Object.assign(Z.emptyLoadout(),{primary:'suppressed'}));const quiet=Z.getRoutePreparation(r,0);
  expect(quiet.avoidChance>loud.avoidChance && quiet.noise<loud.noise,'Quiet equipment did not change avoidance');
  Z._wj(Z.STAT_XP_KEY,{stealth:1e7});const skilled=Z.getRoutePreparation(r,0);
  expect(skilled.avoidChance>quiet.avoidChance,'Stealth did not improve avoidance');
});
test('Worn equipment provides no weapon or quiet-weapon bonus',()=>{
  const {Z}=env(),r=Z.ROUTES[1];Z.saveLoadout(Object.assign(Z.emptyLoadout(),{primary:'suppressed'}));
  const item=Z.getGearItem('suppressed');Z.applyWear(item,Z.itemDurabilityMax(item)+1);
  const p=Z.getRoutePreparation(r,0);
  expect(p.weaponDamage===0 && p.weaponNames.length===0,'Worn equipment retained combat benefits');
});
test('Route difficulty and global threat affect the same readiness calculation',()=>{
  const {Z}=env(),r=Z.ROUTES[1],a=Z.getRoutePreparation(r,0),b=Z.getRoutePreparation(r,5),c=Z.getRoutePreparation(Object.assign({},r,{risk:5}),0);
  expect(b.combatWinChance<a.combatWinChance && c.combatWinChance<a.combatWinChance,'Difficulty or threat does not affect readiness');
});
test('Loot capacity obeys the canonical salvage weight including tiny spaces',()=>{
  const {Z}=env();
  for(const kg of [0,0.4,0.5,1,2.7,10,18.8]){
    const n=Z.routeLootCapacity(kg);
    expect((n===0 || Z.salvageWeight(n)<=kg) && (n===0&&kg<0.5 || Z.salvageWeight(n+1)>kg),'Capacity overflow or inaccurate maximum at '+kg);
  }
});
test('A full pack prevents deployment and gives an actionable reason',()=>{
  const {Z}=env(),r=Z.ROUTES[1];
  Z.saveWanderRun(Object.assign(Z.defaultWanderRun(),{carried:[{value:999,weight:999}]}));
  const p=Z.getRoutePreparation(r,0),result=Z.startRouteRun(r,[],'active',0,false);
  expect(!p.canDeploy && !result.ok && result.reason===p.blockedReason && !Z._readRouteRuns()[r.id],'Full pack launched or had no reason');
  expect(!Z.canSendAgain(r,[]).ok,'Send Again bypassed preparation');
});
test('A route timer uses exactly the displayed preparation duration',()=>{
  const {Z}=env(),r=Z.ROUTES[1],preview=Z.getRoutePreparation(r,3),result=Z.startRouteRun(r,[],'active',3,false),run=Z._readRouteRuns()[r.id];
  expect(result.ok && run.durationMs===preview.durationMs && JSON.stringify(run.preparation)===JSON.stringify(preview),'Timer and preview disagree');
});
test('Departure preparation survives reload and later loadout changes',()=>{
  const e=env(),Z=e.Z,r=Z.ROUTES[1];Z.startRouteRun(r,[],'active',0,false);
  const snapshot=Z._readRouteRuns()[r.id].preparation;
  Z.saveLoadout(Object.assign(Z.emptyLoadout(),{primary:'rifle',vest:'vest_t3'}));Z._wj(Z.STAT_XP_KEY,{combat:1e7,athletics:1e7});
  e.clk.t+=snapshot.durationMs+1;const after=env(e.store,e.clk);after.Z.settleRouteRuns();
  expect(JSON.stringify(after.Z.getLastRun().preparation)===JSON.stringify(snapshot),'Reload or new gear changed an already-launched run');
});
test('Legacy route runs without a preparation snapshot still resolve',()=>{
  const e=env(),r=e.Z.ROUTES[1];
  e.Z._saveRouteRuns({[r.id]:{startedAt:T0,durationMs:1000,squadIds:[],mode:'active',threatLevel:0,autoRepeat:false}});
  e.clk.t+=1001;e.Z.settleRouteRuns();
  expect(e.Z.getLastRun().routeId===r.id && e.Z.getLastRun().preparation.version===1,'Legacy active route did not settle');
});
test('Capacity limits the returned reward and explains left-behind salvage',()=>{
  const {Z}=env(),r=Object.assign({},fixture,{nodes:['Departure','Convenience Store','Extraction']});
  const p=Object.assign(Z.getRoutePreparation(r,0),{maxLoot:1,freeKg:0.5});
  const run=Z.completeRun(r,[],'active',0,p);
  expect(run.loot===1 && run.outcomes.capacityLimited && run.outcomes.lootLeftBehind>0,'Pack space did not limit the haul');
  expect(run.log.some(e=>/pack space/i.test(e.text)),'Report did not explain the limit');
  expect(Z.claimLastRun().amount===1,'Claim bypassed the capacity limit');
});
test('A zero-loot extraction cannot manufacture recycler salvage',()=>{
  const {Z}=env(),r=Object.assign({},fixture,{nodes:['Departure','Convenience Store','Extraction']});
  const p=Object.assign(Z.getRoutePreparation(r,0),{maxLoot:0,freeKg:0});
  Z.completeRun(r,[],'active',0,p);const result=Z.claimLastRun();
  expect(result.ok && result.amount===0 && Z.getWanderLoot().length===0,'Zero extracted loot created a material reward');
});
test('Avoided encounters train Stealth rather than granting a false kill',()=>{
  const {Z}=env(),r=Object.assign({},fixture,{nodes:['Departure','Street Fight','Extraction']});
  const p=Object.assign(Z.getRoutePreparation(r,0),{avoidChance:100,combatWinChance:100});
  const run=Z.completeRun(r,[],'active',0,p),xp=Z.getStatXp();
  expect(run.outcomes.avoided===1 && run.outcomes.won===0 && (xp.combat||0)===0 && xp.stealth>0 && xp.athletics>0,'Avoidance and actual activity XP disagree');
});
test('Won route fights preserve off-map kill metadata',()=>{
  const {Z}=env(),r=Object.assign({},fixture,{nodes:['Departure','Street Fight','Extraction']});
  const p=Object.assign(Z.getRoutePreparation(r,0),{avoidChance:0,combatWinChance:100}),events=[],emit=Z.emitAction;
  Z.emitAction=(id,scale,meta)=>{events.push({id,meta});emit(id,scale,meta);};
  const run=Z.completeRun(r,[],'active',0,p);
  expect(run.outcomes.won===1 && events.some(e=>e.id==='kill'&&e.meta.noCellKill),'Won route fight was not credited correctly');
});
test('Prepared probabilities match observed encounter outcomes',()=>{
  const {Z}=env(),r=Object.assign({},fixture,{nodes:['Departure','Street Fight','Extraction']});
  const p=Object.assign(Z.getRoutePreparation(r,0),{avoidChance:30,combatWinChance:65});
  let avoided=0,won=0,lost=0;
  for(let i=0;i<4000;i++){const out=Z.resolvePreparedRouteNodes(r,'active',p).outcomes;avoided+=out.avoided;won+=out.won;lost+=out.lost;}
  expect(Math.abs(avoided/4000-.30)<.03 && Math.abs(won/(won+lost)-.65)<.03,'Preview probabilities diverged from simulated resolution');
});
test('Camp or assigned-squad runs retain the earlier rules',()=>{
  const {Z}=env(),r=Z.ROUTES[1];Z.currentGameMode=()=> 'camp';
  const start=Z.startRouteRun(r,['sv_wanderer'],'active',0,false),saved=Z._readRouteRuns()[r.id];
  expect(start.ok && !saved.preparation && saved.durationMs===r.duration*Z.GAME_HOUR_MS,'Solo model changed the other mode');
  expect(Z.estimateSuccessProbability(r,['sv_wanderer'],5)===Z.BIOME_SUCCESS[2],'Other-mode estimate changed');
});
for(const file of ['Zombie Idler v2.html','Zombie Idler v2 - TEST SAVE.html']){
  const html=await readFile(file);
  test(file+': Solo preparation uses actual gear and capacity',()=>{
    expect(html.includes('function SoloRoutePreparationPanel')&&html.includes('ZI.getRoutePreparation(route, threatLevel)')&&html.includes('Manage gear &amp; carried items'),'Live preparation controls missing');
    const op=html.slice(html.indexOf('function SoloOperativePanel'),html.indexOf('function SquadAssignPanel'));
    expect(!op.includes('SQUAD_ROSTER')&&!op.includes('op.stamina'),'Solo summary still uses the sample squad member');
  });
  test(file+': report and details use saved preparation and actionable deployment reasons',()=>{
    expect(html.includes('liveRunD.preparation')&&html.includes('last.outcomes')&&html.includes("title={canRun ? '' : deployReason}")&&html.includes('Fight win chance'),'Outcome or readiness preview is disconnected');
  });
}
for(const file of ['Zombie Idler v2.html','Zombie Idler v2 - TEST SAVE.html']) {
  const html=await readFile(file);
  test(file+': preparation listeners defer, coalesce and cancel UI refreshes',()=>{
    const hookSource=html.slice(html.indexOf('function useSoloRoutePreparation('),html.indexOf('function SoloRoutePreparationPanel('));
    const tasks=new Map();let next=0,updates=0,mount,inventory,xp,unsubscribed=0;
    const fake={getRoutePreparation:()=>({ready:true}),onInventoryChange:fn=>{inventory=fn;return()=>unsubscribed++;},onXp:fn=>{xp=fn;return()=>unsubscribed++;}};
    const hook=new Function('useState','useEffect','ZI','setTimeout','clearTimeout','setInterval','clearInterval',hookSource+';return useSoloRoutePreparation;')(
      ()=>[0,()=>updates++],fn=>{mount=fn;},fake,fn=>{tasks.set(++next,fn);return next;},id=>tasks.delete(id),()=>99,()=>{});
    hook({id:'route'},0);const cleanup=mount();inventory();xp();
    expect(updates===0&&tasks.size===1,'A settlement updated React synchronously or scheduled duplicate refreshes');
    const [id,fn]=tasks.entries().next().value;tasks.delete(id);fn();
    expect(updates===1,'Deferred preparation update did not run');
    inventory();cleanup();expect(tasks.size===0&&unsubscribed===2,'Unmount left a pending update or subscribed listener');
  });
}
results.forEach(r=>log(r[0]+'  '+r[1]+(r[0]==='FAIL'?'  '+r[2]:'')));
log(results.filter(r=>r[0]==='PASS').length+'/'+results.length+' route preparation checks passed');
return results;
})();
