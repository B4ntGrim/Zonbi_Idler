// MED-01 (Sam, Oct 30): Crude Crutch and Improvised Splint.
// reference/med-01-crutch-and-splint-oct30.md. The crutch stops being an RMAT converter and
// becomes a reusable aid that steps a wound down a tier and may break; Trace RMAT now unlocks
// the Improvised Splint instead of being an output.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const base = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const extra = ['game/progression.js', 'game/progression-live.js', 'game/character.js', 'game/operations.js'];
const tail = (await Promise.all(extra.map(readFile))).join('\n');
const html = await readFile('Zombie Idler v2.html'), htmlT = await readFile('Zombie Idler v2 - TEST SAVE.html');
const ui = await readFile('progression-ui.jsx');
const results = [], check = (n, ok, d) => results.push([ok ? 'PASS' : 'FAIL', n, d === undefined ? '' : String(d)]);
const T0 = 1793200000000;
const mkEnv = (store, now) => {
  store = store || {}; const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const clock = { now: now || T0 };
  class D extends Date { constructor(...a) { if (a.length) super(...a); else super(clock.now); } static now() { return clock.now; } }
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date: D, Math, JSON, Proxy, Object, Array,
    setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){}, search:'' } };
  fw.window = fw; new Function('fw', 'with(fw){' + base + '\n' + tail + '}')(fw);
  fw.ZI._installedClock = () => clock.now; fw.ZI.wanderMounted = false; return { ZI: fw.ZI, store, clock };
};
const fresh = (now) => { const store = { zi_world_seed:'1' }; mkEnv(store).ZI.startNewInSlot('solo', 1, { gender:'male', profession:'vanguard' }); return mkEnv(store, now || T0 + 1000); };
// Put a wounded survivor at base holding the given aid.
const wounded = (aidId, tier) => {
  const E = fresh(), Z = E.ZI;
  if (aidId) { const st = Z.getStash(); st.push(aidId); Z.saveStash(st); }
  const s = Z.PROG.LIVE.settleStatus(); s.wounds = tier === undefined ? 3 : tier; Z.PROG.LIVE.saveStatus(s);
  return E;
};
const never = () => 1, always = () => 0;

// ── M1, M4: the recipe ──
{ const Z = mkEnv({ zi_world_seed:'1' }).ZI, r = Z.CRAFT_RECIPES.find(x => x.id === 'crude_splint');
  check('M1: the item is renamed Crude Crutch and keeps the id crude_splint', !!r && r.name === 'Crude Crutch' && r.id === 'crude_splint');
  check('M4: the recipe no longer outputs Trace RMAT', !!r && !r.out.some(o => /rmat/i.test(o.n)), JSON.stringify(r && r.out));
  check('M4: it produces the crutch itself, qty 1, for the unchanged wood 10 / cloth 8',
    !!r && r.grantsGear === 'crude_splint' && r.grantsQty === 1 && r.cost.wood === 10 && r.cost.cloth === 8);
  check('M4: kind is gear, so the RMAT grant in jobs.js cannot fire', !!r && r.kind === 'gear');
  check('Trace RMAT still has other sources', Z.CRAFT_RECIPES.filter(x => (x.out || []).some(o => o.n === 'Trace RMAT')).length >= 3,
    Z.CRAFT_RECIPES.filter(x => (x.out || []).some(o => o.n === 'Trace RMAT')).map(x => x.id).join());
  const sp = Z.CRAFT_RECIPES.find(x => x.id === 'improvised_splint');
  check('M9: the Improvised Splint recipe exists and grants the item', !!sp && sp.grantsGear === 'improvised_splint' && sp.kind === 'gear');
  check('M9: both medical aids are real gear items', !!Z.getGearItem('crude_splint') && !!Z.getGearItem('improvised_splint')); }

// ── M5, M7: reusable with a cumulative break chance ──
{ const Z = fresh().ZI;
  check('M7: the crutch breaks at 8% x use number', Math.round(Z.medAidBreakChance('crude_splint') * 100) === 8);
  check('M7: the splint breaks at 6% x use number', Math.round(Z.medAidBreakChance('improvised_splint') * 100) === 6);
  const ladder = [];
  for (let i = 0; i < 13; i++) { const m = Z.getMedAidUses(); m.crude_splint = i; Z.saveMedAidUses(m); ladder.push(Math.round(Z.medAidBreakChance('crude_splint') * 100)); }
  check('M7: the ladder is cumulative 8, 16, 24 ... and certain by the 13th use',
    ladder[0] === 8 && ladder[1] === 16 && ladder[2] === 24 && ladder[12] === 100, ladder.join(','));
  { const m = Z.getMedAidUses(); m.improvised_splint = 16; Z.saveMedAidUses(m);
    check('M7: the splint is certain by its 17th use', Z.medAidBreakChance('improvised_splint') === 1); } }

// ── M6: a use steps the wound down one tier ──
{ const Z = wounded('crude_splint', 3).ZI;
  const r = Z.useMedAid('crude_splint', never);
  check('M6: Badly Hurt steps down one tier', r.ok && r.woundsBefore === 3 && r.woundsAfter === 2, JSON.stringify(r));
  check('M5: a surviving crutch stays in the stash and counts the use', Z.getStash().includes('crude_splint') && Z.medAidUses('crude_splint') === 1);
  check('Sam, Oct 30: the splint heals the same one tier as the crutch',
    Z.MED_AIDS.improvised_splint.woundSteps === Z.MED_AIDS.crude_splint.woundSteps); }

// ── Breaking ──
{ const Z = wounded('crude_splint', 3).ZI;
  const r = Z.useMedAid('crude_splint', always);
  check('A broken crutch still treats the wound first', r.ok && r.woundsAfter === 2 && r.broke === true);
  check('A broken crutch leaves the stash', !Z.getStash().includes('crude_splint'));
  check('A replacement starts its break ladder over', Z.medAidUses('crude_splint') === 0); }

// ── M10: the regen burst ──
{ const E = wounded('improvised_splint', 3), Z = E.ZI;
  const r = Z.useMedAid('improvised_splint', never);
  check('M10: the splint grants a +50% regen burst', r.ok && r.regen && r.regen.pct === 0.5 && r.regen.gameHours === 2);
  check('M10: the burst is live immediately', Z.medRegenBonus() === 0.5);
  const first = Z.medRegenBurst().until;
  E.clock.now += 30000;
  const s2 = Z.PROG.LIVE.settleStatus(); s2.wounds = 3; Z.PROG.LIVE.saveStatus(s2);
  Z.useMedAid('improvised_splint', never);
  check('M10: re-use refreshes the window and never stacks', Z.medRegenBurst().until > first && Z.medRegenBonus() === 0.5);
  E.clock.now += 2 * Z.REAL_MS_PER_GAME_HOUR + 1000;
  check('M10: the burst expires after 2 game hours', Z.medRegenBonus() === 0); }
{ const Z = wounded('crude_splint', 3).ZI;
  Z.useMedAid('crude_splint', never);
  check('M10: the crutch grants no regen burst', Z.medRegenBonus() === 0); }
{ const E = wounded('improvised_splint', 3), Z = E.ZI;
  const beforeRate = Z.WANDER_REST_TABLE.restHpPerMinutePct;
  Z.useMedAid('improvised_splint', never);
  const afterRate = Z.WANDER_REST_TABLE.restHpPerMinutePct;
  check('M10: the burst actually raises the rest regen rate', afterRate > beforeRate, beforeRate + ' -> ' + afterRate); }

// ── M8: Trace RMAT unlocks the next medical tier ──
{ const Z = fresh().ZI;
  check('M8: the splint starts locked', !Z.isSplintUnlocked());
  check('M8: the gate reports it locked and says what is missing',
    !!Z.recipeGate('improvised_splint') && Z.recipeGate('improvised_splint').unlocked === false && Z.recipeGate('improvised_splint').missing.length === 1);
  const poor = Z.unlockImprovisedSplint();
  check('M8: unlocking is refused without 10 Trace RMAT', !poor.ok);
  Z.addRmat('T0', 10);
  const ok = Z.unlockImprovisedSplint();
  check('M8: unlocking succeeds with 10 Trace RMAT', ok.ok && Z.isSplintUnlocked());
  check('Sam, Oct 30: the 10 Trace RMAT are spent', (Z.getRmatHoldings().T0 || 0) === 0, Z.getRmatHoldings().T0);
  check('M8: once unlocked the gate opens', Z.recipeGate('improvised_splint').unlocked === true);
  check('M8: unlocking twice is refused', !Z.unlockImprovisedSplint().ok); }
{ const Z = fresh().ZI;
  check('The gate leaves ordinary recipes alone', Z.recipeGate('scrap_pouch') === null); }

// ── Guards ──
{ const Z = wounded('crude_splint', 0).ZI;
  check('Guard: a healthy survivor cannot use an aid', !Z.useMedAid('crude_splint', never).ok); }
{ const Z = wounded(null, 3).ZI;
  check('Guard: an aid you do not own cannot be used', !Z.useMedAid('crude_splint', never).ok); }
{ const Z = wounded('crude_splint', 3).ZI;
  check('Guard: a non-medical item is refused', !Z.useMedAid('medkit', never).ok); }

// ── Art and build ──
check('M2: both entry points use crude-splint-v2.png',
  /crude_splint: 'art\/crafting\/recipes\/crude-splint-v2\.png'/.test(html) && /crude_splint: 'art\/crafting\/recipes\/crude-splint-v2\.png'/.test(htmlT));
check('M3: v1 and v3 are no longer wired to the crutch', !/crude-splint-v1\.png/.test(html) && !/crude-splint-v3\.png/.test(html) && !/crude-splint-v3\.png/.test(htmlT));
check('Both entry points gate locked recipes through ZI.recipeGate', /ZI\.recipeGate/.test(html) && /ZI\.recipeGate/.test(htmlT));
check('Cache-bust bumped in BOTH entry points', ['game/items.js', 'game/crafting.js', 'game/progression-live.js', 'progression-ui.jsx']
  .every(f => html.indexOf(f + '?v=20261030-med01') > 0 && htmlT.indexOf(f + '?v=20261030-med01') > 0));
check('The Stats panel offers Use and the unlock', /data-med-aid=/.test(ui) && /data-med-unlock=/.test(ui) && /ZI\.useMedAid/.test(ui));
{ let errs = [];
  try { const g = {}, m = { exports: {} }; new Function('self', 'window', 'global', 'module', 'exports', 'define', await readFile('tools/vendor/babel-standalone-7.29.0.min.js'))(g, g, g, m, m.exports, undefined);
    const B = m.exports.transform ? m.exports : g.Babel;
    try { B.transform(ui, { presets: ['react'], filename: 'progression-ui.jsx' }); } catch (e) { errs.push(String(e.message).slice(0, 160)); } }
  catch (e) { errs.push('babel load: ' + String(e.message).slice(0, 160)); }
  check('The Stats panel compiles (JSX parses)', errs.length === 0, errs.join(' | ')); }

return results;
})();
