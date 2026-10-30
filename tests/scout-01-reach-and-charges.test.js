// SCOUT-01 — Traversal Scout (Sam, Oct 30).
// Charges refill every 12 GAME hours (12 real minutes) instead of at local midnight; XP is earned
// per charge but only for a square not yet scouted in the window; and reach grows from the
// adjacent square to at most 9 via gear, Stealth, a working vehicle and a scouting bird.
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

// ── The refill window ──
{ const Z = fresh().ZI;
  const GH = 12 * Z.REAL_MS_PER_GAME_HOUR;
  check('The pool refills every 12 GAME hours, which is 12 real minutes',
    Z.TRAV_SCOUT_RESET_MS === GH && Z.TRAV_SCOUT_RESET_MS === 12 * 60 * 1000, Z.TRAV_SCOUT_RESET_MS + ' ms');
  check('It is not a real-day window any more', Z.TRAV_SCOUT_RESET_MS !== 24 * 60 * 60 * 1000);
  check('The offline-progress cap is untouched', Z.OFFLINE_CAP_MS === 24 * 60 * 60 * 1000); }

{ const E = fresh(), Z = E.ZI, max = Z.TRAVERSAL_TABLE.scoutChargesPerDay;
  check('A new file starts with a full pool', Z.getTravScouts().left === max);
  check('Reading the pool does not open the window', Z.getTravScouts().at === null);
  const first = Z.spendTravScout(T0 + 1000);
  check('The window opens on the first spend', first.ok && Z.getTravScouts(T0 + 1000).at === T0 + 1000);
  for (let i = 1; i < max; i++) Z.spendTravScout(T0 + 1000 + i);
  check('Every charge can be spent', Z.getTravScouts(T0 + 2000).left === 0);
  check('A spend past the last charge is refused', !Z.spendTravScout(T0 + 2000).ok);
  check('The pool is still empty just before the window closes', Z.getTravScouts(T0 + 1000 + Z.TRAV_SCOUT_RESET_MS - 1).left === 0);
  check('The pool refills when the window closes', Z.getTravScouts(T0 + 1000 + Z.TRAV_SCOUT_RESET_MS).left === max);
  check('The card reports when the pool comes back', first.resetsAt === T0 + 1000 + Z.TRAV_SCOUT_RESET_MS); }

{ const store = { zi_world_seed:'1' }; mkEnv(store).ZI.startNewInSlot('solo', 1, { gender:'male', profession:'vanguard' });
  store['zi_trav_scout'] = JSON.stringify({ day: '2026-10-29', left: 0 }); // a save written before SCOUT-01
  const Z = mkEnv(store, T0 + 1000).ZI;
  check('A pre-SCOUT-01 save reads as a full pool, so no migration is needed',
    Z.getTravScouts().left === Z.TRAVERSAL_TABLE.scoutChargesPerDay); }

// ── XP per charge, new squares only ──
{ const E = fresh(), Z = E.ZI;
  check('A square not yet scouted pays XP', Z.scoutXpAvailable('3,4') && Z.scoutEmitXp('3,4', T0 + 1000) === true);
  check('The same square does not pay twice in the window', !Z.scoutXpAvailable('3,4') && Z.scoutEmitXp('3,4', T0 + 2000) === false);
  check('A different square still pays', Z.scoutEmitXp('5,6', T0 + 3000) === true);
  check('The XP record clears with the window', Z.scoutXpAvailable('3,4', T0 + 1000 + Z.TRAV_SCOUT_RESET_MS));
  check('A square pays again in the next window', Z.scoutEmitXp('3,4', T0 + 1000 + Z.TRAV_SCOUT_RESET_MS) === true); }

// ── Reach ──
{ const Z = fresh().ZI;
  check('Reach starts at the adjacent square', Z.SCOUT_RANGE_BASE === 1 && Z.scoutRange() >= 1);
  check('Reach never exceeds 9', Z.SCOUT_RANGE_MAX === 9);
  const parts = Z.scoutRangeParts();
  check('Reach is reported as named parts', ['base','gear','stealth','vehicle','companion'].every(k => k in parts), JSON.stringify(parts));
  check('A bird adds nothing until one exists', parts.companion === 0); }
{ const E = fresh(), Z = E.ZI;
  const before = Z.scoutRange();
  Z.GEAR_ITEMS.push({ id:'test_scope', name:'Test Scope', slot:'trinket', cat:'gear', rarity:'rare', icon:'🔭', carryW:1, scoutRange:3, desc:'test' });
  Z.grantGear('test_scope', 1); Z.equipGear('test_scope', 'trinket');
  check('Equipped gear widens the reach by its scoutRange', Z.scoutRange() === before + 3, before + ' -> ' + Z.scoutRange()); }
{ const E = fresh(), Z = E.ZI;
  const base = Z.scoutRangeParts().stealth;
  Z.addStatXp && Z.addStatXp('stealth', 500000);
  check('Stealth widens the reach as it levels', Z.scoutRangeParts().stealth > base, base + ' -> ' + Z.scoutRangeParts().stealth);
  check('Stealth adds one step every 4 levels',
    Z.scoutRangeParts().stealth === Math.floor(Z.statLevel('stealth') / Z.SCOUT_STEALTH_LEVELS_PER_STEP)); }
{ const E = fresh(), Z = E.ZI;
  const before = Z.scoutRangeParts().vehicle;
  E.store['zi_vehicle'] = JSON.stringify({ found:true, name:'Rusted Pickup', condition:100 });
  check('No vehicle adds nothing', before === 0);
  check('A working vehicle widens the reach', Z.scoutRangeParts().vehicle === Z.SCOUT_VEHICLE_RANGE);
  E.store['zi_vehicle'] = JSON.stringify({ found:true, name:'Farm Truck', condition:100, scoutRange:4 });
  check('A vehicle carrying its own traversal bonus uses that instead', Z.scoutRangeParts().vehicle === 4); }
{ const E = fresh(), Z = E.ZI;
  Z.GEAR_ITEMS.push({ id:'test_huge', name:'Test Array', slot:'back', cat:'gear', rarity:'epic', icon:'📡', carryW:1, scoutRange:50, desc:'test' });
  Z.grantGear('test_huge', 1); Z.equipGear('test_huge', 'back');
  check('The total is clamped to 9 however much is stacked', Z.scoutRange() === 9, String(Z.scoutRange())); }

// ── Which squares are scoutable ──
{ const E = fresh(), Z = E.ZI, here = { gx:10, gy:10 };
  check('Your own square is not a scout target', Z.canScoutCell(here, { gx:10, gy:10 }) === false);
  check('An adjacent square is in reach at base', Z.canScoutCell(here, { gx:11, gy:11 }) === true);
  const r = Z.scoutRange();
  check('A square exactly at the reach limit is allowed', Z.canScoutCell(here, { gx:10 + r, gy:10 }) === true);
  check('A square one past the limit is refused', Z.canScoutCell(here, { gx:10 + r + 1, gy:10 }) === false);
  check('Reach is measured as a square area, not a cross', Z.canScoutCell(here, { gx:10 + r, gy:10 + r }) === true); }

return results;
})();
