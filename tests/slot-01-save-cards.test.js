// SLOT-01 — Save file cards (Sam, Oct 30).
// A card used to read "Leader Lv 12" for every slot: ZI._summary() reported the Camp Leader
// level, which has nothing to do with the survivor in that file. Cards now show the survivor's
// own profession and level, in both Solo and Camp, and no card says "Leader".
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const base = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const extra = ['game/progression.js', 'game/progression-live.js', 'game/character.js', 'game/operations.js'];
const tail = (await Promise.all(extra.map(readFile))).join('\n');
const html = await readFile('Zombie Idler v2.html'), htmlT = await readFile('Zombie Idler v2 - TEST SAVE.html');
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
// A saved file: an index card plus the slot snapshot the card can be rebuilt from.
const seedSlot = (store, mode, slot, xp, profession, summary) => {
  const idx = JSON.parse(store['zisave_index'] || '{}');
  idx[mode] = idx[mode] || {};
  idx[mode][slot] = { savedAt: T0, label: mode + ' — File ' + slot, summary: summary === undefined ? null : summary };
  store['zisave_index'] = JSON.stringify(idx);
  store['zisave_data_' + mode + '_' + slot] = JSON.stringify({
    zi_character_xp: String(xp),
    zi_survivor_profile: JSON.stringify({ v:1, gender:'male', appearance:{}, profession: profession, name:'Test', createdAt: T0 }),
    zi_wander_total: '1234',
  });
};

// ── The level actually shown ──
{ const store = { zi_world_seed:'1' }; mkEnv(store).ZI.startNewInSlot('solo', 1, { gender:'male', profession:'vanguard' });
  const Z = mkEnv(store, T0 + 1000).ZI;
  store['zi_character_xp'] = '5000';
  const s = Z._summary();
  check('The summary reports the survivor level, not the Camp Leader level',
    s.level === Z.getCharacterLevel() && s.level > 1, 'summary ' + s.level + ' / survivor ' + Z.getCharacterLevel() + ' / leader ' + Z.leaderLevel());
  check('The Camp Leader level is kept separately, not shown as the survivor level',
    s.leaderLevel === Z.leaderLevel() && s.level !== s.leaderLevel, JSON.stringify({ level:s.level, leaderLevel:s.leaderLevel }));
  check('The summary carries the profession', s.profession === 'vanguard' && s.professionName === 'Vanguard', JSON.stringify(s)); }

// ── Profession naming ──
{ const Z = mkEnv({ zi_world_seed:'1' }).ZI;
  check('Every archetype id resolves to a display name', (Z.LEADER_ARCHETYPES || []).every(a => Z.professionName(a.id) === a.name));
  check('An unknown profession has no name', Z.professionName('nope') === null && Z.professionName(null) === null); }

// ── Each slot shows its own level ──
{ const store = { zi_world_seed:'1' };
  seedSlot(store, 'solo', 1, 0, 'vanguard');
  seedSlot(store, 'solo', 2, 5000, 'forager');
  seedSlot(store, 'solo', 3, 60000, 'artisan');
  const Z = mkEnv(store, T0 + 1000).ZI, slots = Z.listSlots('solo');
  const shown = slots.filter(s => !s.empty).map(s => s.summary.professionName + ' ' + s.summary.level);
  check('Three saved files each show their own profession and level',
    slots[0].summary.professionName === 'Vanguard' && slots[1].summary.professionName === 'Forager' && slots[2].summary.professionName === 'Artisan',
    shown.join(' | '));
  check('Slots at different XP show different levels',
    new Set(slots.filter(s => !s.empty).map(s => s.summary.level)).size === 3, shown.join(' | '));
  check('A higher-XP file is a higher level', slots[2].summary.level > slots[1].summary.level && slots[1].summary.level > slots[0].summary.level); }

// ── A file saved before this change still displays correctly ──
{ const store = { zi_world_seed:'1' };
  seedSlot(store, 'solo', 1, 5000, 'envoy', { level: 12, distance: 900 }); // legacy card: level 12 was the LEADER level
  const Z = mkEnv(store, T0 + 1000).ZI, slot = Z.listSlots('solo')[0];
  check('A legacy card is rebuilt from its own snapshot, not left at the leader level',
    slot.summary.professionName === 'Envoy' && slot.summary.level !== 12, JSON.stringify(slot.summary));
  check('The rebuilt level matches that file own XP', slot.summary.level === Z._levelFromXp(5000), slot.summary.level + ' vs ' + Z._levelFromXp(5000)); }

// ── Camp files follow the same rule (Sam, Oct 30: no slot says "Leader") ──
{ const store = { zi_world_seed:'1' };
  seedSlot(store, 'camp', 1, 5000, 'envoy');
  const Z = mkEnv(store, T0 + 1000).ZI, slot = Z.listSlots('camp')[0];
  check('A Camp file shows profession and level too', slot.summary.professionName === 'Envoy' && slot.summary.level > 1, JSON.stringify(slot.summary)); }

// ── Degenerate files ──
{ const store = { zi_world_seed:'1' };
  seedSlot(store, 'solo', 1, 0, null);
  const Z = mkEnv(store, T0 + 1000).ZI, slot = Z.listSlots('solo')[0];
  check('A file with no profession falls back to "Survivor", never "Leader"',
    slot.summary.professionName === 'Survivor' && slot.summary.level >= 1, JSON.stringify(slot.summary)); }
{ const Z = mkEnv({ zi_world_seed:'1' }, T0 + 1000).ZI;
  check('Empty slots stay empty', Z.listSlots('solo').every(s => s.empty)); }

// ── The card markup ──
check('Neither entry point prints "Leader Lv" on a save card', !/Leader Lv \{/.test(html) && !/Leader Lv \{/.test(htmlT));
check('Both entry points print the profession and level',
  /\{sl\.summary\.professionName\} · Level \{sl\.summary\.level\}/.test(html) &&
  /\{sl\.summary\.professionName\} · Level \{sl\.summary\.level\}/.test(htmlT));

return results;
})();
