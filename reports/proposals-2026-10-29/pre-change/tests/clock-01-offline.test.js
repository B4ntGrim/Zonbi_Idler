// CLOCK-01 step 2: all offline systems consume the same bounded browser absence window.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data'];
const src = (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = [], check = (name, ok, detail) => results.push([ok ? 'PASS' : 'FAIL', name, detail || '']);
const H = 3600000, T0 = 1790500000000;
const store = { zi_schedule:JSON.stringify({ v:1, assignments:[{ survivorId:'s', jobId:'scavenge', since:T0, lastTick:T0 }] }) };
const localStorage = { getItem:k => store[k] ?? null, setItem:(k,v) => { store[k] = String(v); }, removeItem:k => { delete store[k]; }, key:i => Object.keys(store)[i], get length(){ return Object.keys(store).length; } };
const D = class extends Date { constructor(...args) { super(...(args.length ? args : [T0 + 30*H])); } static now() { return T0 + 30*H; } };
const fw = { localStorage, sessionStorage:localStorage, Date:D, Math, JSON, console:{ log(){}, warn(){}, error(){} }, setInterval:()=>0, clearInterval:()=>{}, document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
new Function('fw', 'with(fw){' + src + '}')(fw);
const Z = fw.ZI; Z.installClock(() => T0 + 30*H);
const w = Z.beginOfflineWindow(T0 + 30*H);
check('without a prior marker, timer state seeds one shared 24-hour window and six-hour discarded remainder', w.from === T0 && w.to === T0 + 24*H && w.creditedMs === 24*H && w.discardedMs === 6*H, JSON.stringify({ from:w.from-T0, to:w.to-T0, discarded:w.discardedMs }));

let scheduleHours = 0;
Z.emitScheduleTick = (_job, hours) => { scheduleHours += hours; };
localStorage.setItem(Z.SCHEDULE_KEY, JSON.stringify({ v:Z.SCHEDULE_VER, assignments:[{ survivorId:'s', jobId:'scavenge', since:T0, lastTick:T0 }] }));
Z.settleSchedule(w);
check('camp schedule receives exactly the shared 24-real-hour window (1,440 game hours at the selected rate)', scheduleHours === 1440, scheduleHours);

Z._slotsFor = () => 1; Z._grantJob = () => true;
Z.saveJobs({ v:Z.JOBS_VER, jobs:[{ id:'long', type:'craft', refId:'x', qty:1, duration:25*H/1000, startedAt:T0, status:'active', meta:{} }] });
Z._settleJobs(w.to, w);
let jobs = Z._readJobsRaw().jobs;
check('unfinished crafting timer is shifted over the discarded six hours', jobs.length === 1 && jobs[0].startedAt === T0 + 6*H, jobs.map(j => j.startedAt-T0).join(','));

Z.ROUTES = [{ id:'r', duration:30 }]; Z.completeRun = () => {};
Z._saveRouteRuns({ r:{ startedAt:T0, durationMs:30*H, squadIds:[], mode:'active', threatLevel:0, autoRepeat:false } });
Z.settleRouteRuns(w);
const route = Z._readRouteRuns().r;
check('unfinished route timer is shifted over the same discarded six hours', !!route && route.startedAt === T0 + 6*H, route && route.startedAt-T0);

const st = Object.assign(Z.defaultWanderRun(), { active:true, hp:100, lastTickAt:T0, _simNow:T0, awaySummary:Z.WanderSim.emptySummary() });
Z.saveWanderRun(st); Z.WanderEngine._lead = () => true;
let wanderSeconds = 0;
Z.WanderSim.advance = (state, seconds) => { wanderSeconds += seconds; state._simNow += seconds*1000; };
Z._pruneBuffs = () => {};
Z.WanderEngine.tick(T0 + 30*H);
const afterWander = Z.getWanderRun();
check('Wandering consumes 24 hours from the same window and discards the six-hour remainder', wanderSeconds === 24*3600 && afterWander.lastTickAt === T0 + 30*H && afterWander._simNow === T0 + 30*H, JSON.stringify({ seconds:wanderSeconds, last:afterWander.lastTickAt-T0, sim:afterWander._simNow-T0 }));
return results;
})();
