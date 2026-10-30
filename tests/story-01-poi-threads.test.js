// STORY-01 — Persistent POI narrative threads (Oct 30).
// Recurring locals at five POIs, a background-specific recollection, a keepsake, and a
// "safer approach" lead that raises the next loot attempt's safety at that cell.
// Written during the Oct 30 review; the feature shipped with no tests of its own.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const base = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const extra = ['game/progression.js', 'game/progression-live.js', 'game/character.js', 'game/operations.js', 'game/poi-dialogues.js'];
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
const STORY_POIS = ['community-shelter','pharmacy','grocery-store','transit-depot','library'];
const cell = (poiType, gx, gy) => ({ poiType: poiType, gx: gx === undefined ? 3 : gx, gy: gy === undefined ? 4 : gy, name:'Test Cell' });

// ── Which cells carry a thread ──
{ const Z = fresh().ZI, bad = [];
  STORY_POIS.forEach(id => { const s = Z.poiStoryForCell(cell(id)); if (!s || !s.npc || !s.npc.name) bad.push(id); });
  check('Every story POI id resolves to a named local', bad.length === 0, bad.join(' '));
  check('Each local is a distinct person', new Set(STORY_POIS.map(id => Z.poiStoryForCell(cell(id)).npc.id)).size === 5);
  check('A POI with no thread returns nothing', Z.poiStoryForCell(cell('hardware-store')) === null);
  check('A cell with no POI returns nothing', Z.poiStoryForCell(cell('')) === null && Z.poiStoryForCell(null) === null); }

// ── The three choices ──
{ const Z = fresh().ZI, s = Z.poiStoryForCell(cell('library'));
  check('Three choices are offered', s.options.length === 3 && s.options.every(o => o.label && o.storyChoice));
  check('The choices are kindness, keepsake and route',
    s.options.map(o => o.storyChoice).join() === 'kindness,keepsake,route');
  check('A first meeting starts at no bond and no keepsake', s.bond === 0 && s.relicFound === false);
  check('The keepsake is named before it is found', /Ask about/.test(s.options[1].label), s.options[1].label); }

// ── Kindness builds a bond, capped ──
{ const Z = fresh().ZI;
  const r = Z.resolvePoiStoryChoice(cell('library'), 'kindness');
  check('Kindness returns a line naming the local', !!r && /Ada Ruiz/.test(r.text), r && r.text.slice(0, 60));
  check('Kindness raises the bond', Z.poiStoryForCell(cell('library')).bond === 1);
  for (let i = 0; i < 6; i++) Z.resolvePoiStoryChoice(cell('library'), 'kindness');
  check('The bond is capped at 3', Z.poiStoryForCell(cell('library')).bond === 3);
  check('A bonded local changes the offer', /Share what you remember/.test(Z.poiStoryForCell(cell('library')).options[0].label)); }

// ── The keepsake ──
{ const Z = fresh().ZI;
  const r = Z.resolvePoiStoryChoice(cell('pharmacy'), 'keepsake');
  check('Asking about the keepsake recalls a background memory', !!r && /remember/i.test(r.text), r && r.text.slice(0, 70));
  const after = Z.poiStoryForCell(cell('pharmacy'));
  check('The keepsake is recorded and raises the bond once', after.relicFound === true && after.bond === 1);
  check('The offer changes once the keepsake is known', /Recall the keepsake/.test(after.options[1].label));
  Z.resolvePoiStoryChoice(cell('pharmacy'), 'keepsake');
  check('Asking again does not keep raising the bond', Z.poiStoryForCell(cell('pharmacy')).bond === 1);
  check('The keepsake memory is readable afterwards', !!Z.poiRelicMemory(cell('pharmacy'))); }

// ── The memory is specific to the survivor's background ──
{ const a = fresh().ZI;
  const vanguard = a.poiStoryForCell(cell('library')).memory;
  const store = { zi_world_seed:'1' }; mkEnv(store).ZI.startNewInSlot('solo', 1, { gender:'female', profession:'envoy' });
  const envoy = mkEnv(store, T0 + 1000).ZI.poiStoryForCell(cell('library')).memory;
  check('The recollection differs by background', vanguard !== envoy, vanguard.slice(0, 40) + ' | ' + envoy.slice(0, 40)); }

// ── The safer-approach lead ──
{ const E = fresh(), Z = E.ZI, c = cell('transit-depot', 7, 9);
  check('No lead exists before it is asked for', Z.poiRouteAid(c) === null);
  const r = Z.resolvePoiStoryChoice(c, 'route');
  check('Marking a safer approach grants a +15% lead', !!r && Z.poiRouteAid(c) && Z.poiRouteAid(c).bonus === 15);
  check('The lead is tied to that cell only', Z.poiRouteAid(cell('transit-depot', 1, 1)) === null);
  check('Consuming the lead clears it', Z.consumePoiRouteAid(c) === true && Z.poiRouteAid(c) === null);
  check('Consuming a lead that is not there is refused', Z.consumePoiRouteAid(c) === false); }

// ── Expiry ──
{ const E = fresh(), Z = E.ZI, c = cell('library', 2, 2);
  Z.resolvePoiStoryChoice(c, 'route');
  const aid = Z.poiRouteAid(c), windowMs = aid.expires - E.clock.now;
  E.clock.now += windowMs - 1000;
  check('The lead is still good just before it expires', !!Z.poiRouteAid(c));
  E.clock.now += 2000;
  check('The lead expires', Z.poiRouteAid(c) === null);
  // Recorded as current behaviour, NOT endorsed as intent. The window is seven REAL days.
  // On the CLOCK-01 clock (1 game day = 24 real minutes) that is 420 game days — longer than
  // the 364-day year. "Seven days" in the player-facing line almost certainly means game days,
  // which would be 7 * ZI.GAME_DAY_MS. Flagged for Sam; see the Oct 30 review.
  check('REVIEW NOTE: the lead window is 7 real days = 420 game days, over a full 364-day year',
    windowMs === 7 * 86400000 && Math.round(windowMs / Z.GAME_DAY_MS) === 420,
    windowMs + ' ms = ' + Math.round(windowMs / Z.GAME_DAY_MS) + ' game days vs a 364-day year'); }

// ── Persistence ──
{ const store = { zi_world_seed:'1' }; mkEnv(store).ZI.startNewInSlot('solo', 1, { gender:'male', profession:'vanguard' });
  const Z1 = mkEnv(store, T0 + 1000).ZI;
  Z1.resolvePoiStoryChoice(cell('grocery-store'), 'kindness');
  Z1.resolvePoiStoryChoice(cell('grocery-store'), 'keepsake');
  const Z2 = mkEnv(store, T0 + 2000).ZI, s = Z2.poiStoryForCell(cell('grocery-store'));
  check('Bonds and keepsakes survive a reload', s.bond === 2 && s.relicFound === true, JSON.stringify({ bond:s.bond, relic:s.relicFound })); }

// ── Guards ──
{ const Z = fresh().ZI;
  check('An unknown choice changes nothing', Z.resolvePoiStoryChoice(cell('library'), 'nonsense') === null);
  check('A choice at a POI with no thread is refused', Z.resolvePoiStoryChoice(cell('hardware-store'), 'kindness') === null); }

return results;
})();
