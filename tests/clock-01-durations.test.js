// CLOCK-01 step 4: game-time timer inputs are rescaled so real durations stay constant.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = [], check = (name, ok, detail) => results.push([ok ? 'PASS' : 'FAIL', name, detail || '']);
const store = { zi_materials:JSON.stringify({ metal:200 }), zi_world_seed:'12345' };
const localStorage = { getItem:k => store[k] ?? null, setItem:(k,v) => { store[k] = String(v); }, removeItem:k => { delete store[k]; }, key:i => Object.keys(store)[i], get length(){ return Object.keys(store).length; } };
const fw = { localStorage, sessionStorage:localStorage, Date, Math, JSON, console:{ log(){}, warn(){}, error(){} }, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
new Function('fw', 'with(fw){' + src + '}')(fw);
const Z = fw.ZI;
const recipe = Z.CRAFT_RECIPES.find(r => r.id === 'scrap_pouch');
const craftReal = recipe.time * Z.REAL_MS_PER_GAME_HOUR / 3600000;
check('craft recipe time is scaled 10× while wall duration stays at 0.3 seconds', recipe.time === 18 && craftReal === 0.3, JSON.stringify({ gameSeconds:recipe.time, realSeconds:craftReal }));
const build = Z.getStructure('bunks').build[0];
const buildReal = build.time * Z.REAL_MS_PER_GAME_HOUR / 3600000;
check('camp build time is scaled 10× while wall duration stays at 0.2 seconds', build.time === 12 && buildReal === 0.2, JSON.stringify({ gameSeconds:build.time, realSeconds:buildReal }));
const route = Z.ROUTES.find(r => r.id === 'rt_cabin');
const routeMs = route.duration * Z.GAME_HOUR_MS;
check('route duration is scaled to 0.2 game hours while wall duration stays at 12 seconds', route.duration === 0.2 && routeMs === 12000 && route.staminaCost === 16, JSON.stringify({ gameHours:route.duration, realMs:routeMs, stamina:route.staminaCost }));
check('Jester exception remains three to five full game days at the new rate', Z.Jester.TABLE.dayMs === 24*Z.REAL_MS_PER_GAME_HOUR, Z.Jester.TABLE.dayMs);
return results;
})();
