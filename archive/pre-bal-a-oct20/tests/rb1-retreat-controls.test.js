// Batch RB1: retreat controls (reference/rb1-retreat-controls-slice.md §6; CURRENT_BATCH.md).
// RB1a Run Back is the manual withdrawal under the shared retreat rule · RB1b the main-bar Retreat button is the policy control
// RB1c the distance bar is display only · RB1d Run Back keeps the pace. Checks 5 and 6 rewritten Oct 13 for RB2 (authorized by Sam). Screen checks are static (source); rule checks run the game code.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const screen = await readFile('screens-v3.jsx');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const T0 = 1790500000000;
const mkEnv = () => {
  const store = { zi_world_seed:'12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify({ gx:0, gy:0, name:'Home', biome:'suburbia', difficulty:1 }) };
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw); const ZI = fw.ZI; ZI.wanderMounted = false; ZI._wj('zi_charges', { heal: 999, scout: 0 }); ZI.installClock(() => T0);
  return ZI;
};
// The Run Back handler and the main-bar policy button, cut out of the screen source.
const rbStart = screen.indexOf('// RB1a: the player\'s manual withdrawal'); const rbHandler = rbStart > 0 ? screen.slice(rbStart, screen.indexOf('}}', rbStart)) : '';

// 1 — static: Run Back calls the shared withdrawal; no teleport, no encounter clear, no pace reset
check('1: Run Back calls the shared withdrawal (wanderRetreatPress via wanderAct) and no longer teleports, clears the encounter or resets the pace',
  /wanderAct\(s => window\.ZI\.wanderRetreatPress\(s\)\)/.test(rbHandler) && !/setWanderScroll|setEncounter\(null\)|setMoveMode/.test(rbHandler) && !/Path retraced/.test(screen), rbHandler.length + ' chars');

// 2 — the press Run Back makes is the same rule a Retreat press used: same seed, same state
{ const press = () => { const Z = mkEnv(); const s = Object.assign(Z.defaultWanderRun(), { active:true, hp:100, scroll:320, scrollUm:320e6, lastCheckpoint:250, checkpoints:[250], moveMode:'jog' }); const r = Z.wanderRetreatPress(s, Z.seededRng(4)); return JSON.stringify({ ok: r.ok, w: s.withdrawing, left: s.withdrawLeftM, evade: s.retreatEvade || 0, mode: s.moveMode }); };
  const a = press(), b = press(), o = JSON.parse(a);
  check('2: a Run Back press withdraws to the last checkpoint (70 m) with one getaway roll, identically each time', a === b && o.ok && o.w && Math.abs(o.left - 70) < 1e-6, a); }

// 3 — a second press during the walk rolls the getaway (unchanged rule)
{ const Z = mkEnv(); const s = Object.assign(Z.defaultWanderRun(), { active:true, hp:100, scroll:320, scrollUm:320e6, lastCheckpoint:250, checkpoints:[250] });
  Z.wanderRetreatPress(s, Z.seededRng(4)); const r2 = Z.wanderRetreatPress(s, Z.seededRng(5));
  check('3: a second press while withdrawing goes to the getaway roll, not a second withdrawal', s.withdrawing && (r2.kind === 'retreatEvade' || /getaway|slipped|heading back/i.test(r2.reason || r2.text || '')), JSON.stringify(r2).slice(0, 120)); }

// 4 — pace kept
{ const Z = mkEnv(); const s = Object.assign(Z.defaultWanderRun(), { active:true, hp:100, scroll:320, scrollUm:320e6, lastCheckpoint:250, checkpoints:[250], moveMode:'run' }); Z.wanderRetreatPress(s, Z.seededRng(4));
  check('4: the saved pace is unchanged by Run Back (Run stays Run)', s.moveMode === 'run' && !/setMoveMode\('walk'\)/.test(rbHandler)); }

// 5 — rewritten Oct 13 (authorized, RB2 superseded RB1b): the retreat limits are shown in the scene while resting, not on a main-bar button
check('5: (RB2) the scene\'s resting status shows the retreat limits, each left out when off', /RB2: the automatic retreat runs in the background/.test(screen) && /rr\.hpOff/.test(screen) && /rr\.stressOff/.test(screen) && /rr\.loadIgnore/.test(screen) && /`Retreats at \$\{parts\.join\(' · '\)\}`/.test(screen));

// 6 — rewritten Oct 13 (authorized, RB2): no retreat button in the main bar at all
check('6: (RB2) no "↩ Retreat", "Auto-retreat" or "Retreat Rules" button remains', !/: '↩ Retreat'/.test(screen) && !/⚙ Retreat Rules/.test(screen) && !/Auto-retreat:/.test(screen));

// 6b — the distance bar is display only; nothing on the screen calls setWanderScroll
check('6b: distance-bar checkpoints are markers with no click handler, and no screen code calls setWanderScroll', !/jumpTo/.test(screen) && /title=\{`Checkpoint at \$\{m\}m`\}/.test(screen) && !/setWanderScroll\(/.test(screen));

return results;
})();
