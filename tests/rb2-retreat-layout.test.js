// Batch RB2: retreat layout (reference/rb1-retreat-controls-slice.md §8; CURRENT_BATCH.md).
// Run Back is the only retreat control · the retreat-rules editor is parked (shop, later) · while resting, the scene shows the limits.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const screen = await readFile('screens-v3.jsx');
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const mkEnv = () => {
  const store = { zi_world_seed:'12345' };
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw); return fw.ZI;
};
const press = (screen.match(/wanderRetreatPress\(/g) || []).length;
check('1: Run Back is the only retreat control on the screen (one call to the shared withdrawal)', press === 1 && /RB1a: the player's manual withdrawal/.test(screen), press + ' call(s)');
check('2: no retreat-rules editor on the screen (parked for the shop)', !/setRetreatRules\(/.test(screen) && !/HP floor \{numIn/.test(screen) && !/numIn\(/.test(screen));
// 3 — the resting line follows the stored rules (the same expression the screen uses)
{ const Z = mkEnv(); const line = (rr) => { const parts = [!rr.hpOff && `HP ${rr.hpFloorPct}%`, !rr.stressOff && `stress ${rr.stressCeiling}`, !rr.loadIgnore && `load ${rr.loadLimitPct}%`].filter(Boolean); return parts.length ? `Retreats at ${parts.join(' · ')}` : 'Automatic retreat is off'; };
  const d = line(Z.getRetreatRules()); Z.setRetreatRules({ stressOff: true }); const s2 = line(Z.getRetreatRules()); Z.setRetreatRules({ hpOff: true, loadIgnore: true }); const s3 = line(Z.getRetreatRules());
  check('3: a new save shows "Retreats at HP 30% · stress 85 · load 115%"; a rule switched off is left out; all off reads "Automatic retreat is off"',
    d === 'Retreats at HP 30% · stress 85 · load 115%' && s2 === 'Retreats at HP 30% · load 115%' && s3 === 'Automatic retreat is off' && screen.includes("ruleLine = parts.length ? `Retreats at ${parts.join(' · ')}` : 'Automatic retreat is off';"), [d, s2, s3].join(' | ')); }
// 4 — the automatic retreat itself is unchanged: the rule still fires at the default HP floor
{ const Z = mkEnv(); Z._wj('zi_charges', { heal: 0, scout: 0 }); const st = Object.assign(Z.defaultWanderRun(), { active:true, hp:29, scroll:320, scrollUm:320e6, lastCheckpoint:250, checkpoints:[250] });
  const fired = Z.retreatRulesTrue ? Z.retreatRulesTrue(st) : [];
  check('4: the automatic retreat still uses the stored rules (no heals left, HP 29 < 30% fires the HP rule)', Array.isArray(fired) ? fired.some(f => (f.rule || f) === 'hp') : !!fired, JSON.stringify(fired).slice(0, 120)); }
return results;
})();
