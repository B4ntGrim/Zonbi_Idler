// Oct 29 (Sam): Character Creation on New Game · Crawler with the reusable Halved trait (new saves) · Operations page.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const base = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const extra = ['game/progression.js', 'game/progression-live.js', 'game/character.js', 'game/operations.js'];
const tail = (await Promise.all(extra.map(readFile))).join('\n');
const html = await readFile('Zombie Idler v2.html'), htmlT = await readFile('Zombie Idler v2 - TEST SAVE.html');
const cc = await readFile('character-creation.jsx'), ops = await readFile('operations-ui.jsx'), v3 = await readFile('screens-v3.jsx');
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

// ── Character Creation ──
{ const Z = mkEnv({ zi_world_seed:'1' }).ZI;
  check('CC: invalid profiles are refused (unknown gender)', Z.validSurvivorProfile({ gender:'other' }) === null && Z.validSurvivorProfile('x') === null && Z.validSurvivorProfile([1]) === null);
  const p = Z.validSurvivorProfile({ gender:'female', appearance:{ hair:'zzz' }, profession:'nope' });
  check('CC: bad appearance falls back to the first option; unknown profession is dropped', p.appearance.hair === Z.CHAR_CREATION.appearance.hair.options[0].id && p.profession === null);
  check('CC: professions are the 4 existing starting archetypes with their existing starting XP (no new values)', Z.charProfessions().length === Z.LEADER_ARCHETYPES.length && Z.charProfessions().every(c => { const a = Z.LEADER_ARCHETYPES.find(x => x.id === c.id); return c.effects.length === Object.keys(a.start).length && c.effects.every(e => a.start[e.prof] === e.xp); }));
  check('CC: appearance options carry no stat fields (cosmetic only)', Object.values(Z.CHAR_CREATION.appearance).every(c => c.options.every(o => Object.keys(o).every(k => ['id','label','filter','swatch'].includes(k))))); 
  const A = Z.CHAR_CREATION.appearance, n = k => A[k].options.length;
  check('CC: appearance has separately selectable clothing components, skin tone, scars, piercings and accessories', ['hair','hairColor','clothing','skinTone','jacketColor','shirtColor','pantsColor','bootsColor','gloves','scars','piercings','accessories'].every(k => A[k]) && n('hair') >= 12 && n('hairColor') >= 10 && n('clothing') >= 12 && n('jacketColor') >= 10 && n('piercings') >= 10 && n('accessories') >= 10, Object.keys(A).map(k => k + ':' + n(k)).join(' '));
  check('CC: option ids are unique within each group', Object.values(A).every(c => new Set(c.options.map(o => o.id)).size === c.options.length));
  const old = Z.validSurvivorProfile({ gender:'male', appearance:{ hair:'short', clothing:'rust', scars:'brow', accessories:'bandana' }, profession:'envoy' });
  check('CC: a version-1 profile keeps its look (old clothing colour moves to jacketColor)', !!old && old.appearance.jacketColor === 'rust' && old.appearance.clothing === A.clothing.options[0].id && old.appearance.hair === 'short' && old.appearance.accessories === 'bandana' && old.appearance.piercings === 'none', JSON.stringify(old)); }
{ const mk = (gender) => { const store = { zi_world_seed:'1' }; const E = mkEnv(store); E.ZI.startNewInSlot('solo', 1, { gender, appearance:{ clothingColor:'rust' }, profession:'forager' }); return mkEnv(store, T0 + 1000); };
  const F = mk('female'), M = mk('male');
  const fp = F.ZI.getSurvivorProfile(), snap = JSON.parse(F.store.zisave_data_solo_1), savedProfile = JSON.parse(snap.zi_survivor_profile || 'null');
  check('CC: Start Surviving saves the chosen survivor with the migrated jacket colour', fp.gender === 'female' && fp.profession === 'forager' && fp.appearance.jacketColor === 'rust' && savedProfile && savedProfile.appearance.jacketColor === 'rust');
  check('CC: the profession seeds exactly its existing starting XP', F.ZI.getStatXp().scavenging === 150 && F.ZI.getStatXp().foraging === 80, JSON.stringify(F.ZI.getStatXp()));
  check('CC: male and female survivors get identical stats (gender changes art only)', JSON.stringify(F.ZI.getStatXp()) === JSON.stringify(M.ZI.getStatXp()) && F.ZI.maxHp() === M.ZI.maxHp());
  const L = mkEnv({ zi_world_seed:'1' }); L.ZI.startNewInSlot('solo', 1);
  check('CC: New Game without a profile still works (older callers)', !!L.store.zisave_data_solo_1 && L.ZI.getSurvivorProfile() === null); }
for (const [n, h] of [['main page', html], ['TEST SAVE page', htmlT]]) {
  check(n + ': New Game opens Character Creation and only "Start Surviving" creates the save', /setCreating\(slot\)/.test(h) && /onConfirm=\{\(profile\) => ZI\.startNewInSlot\(mode, creating, profile\)\}/.test(h) && /game\/character\.js\?v=/.test(h) && /character-creation\.jsx\?v=/.test(h));
}
check('CC screen: four steps with the draft titles and Start Surviving', ['Choose Your Survivor', 'Make Your Mark', 'What Were You Before?', 'One More Survivor', 'Start Surviving', 'Who will survive?'].every(t => cc.includes(t)) && !/startNewInSlot/.test(cc));
check('CC: the Wandering survivor uses the chosen name and gender', /getSurvivorProfile\(\)/.test(v3) && /gender: p \? p\.gender : undefined/.test(v3));

// ── Crawler / Halved ──
{ const Z = mkEnv({ zi_world_seed:'1' }).ZI, c = Z.BESTIARY_ROSTER.find(z => z.name === 'Crawler'), sh = Z.BESTIARY.find(z => z.id === 1);
  check('Crawler: Halved = half HP, half damage, attacks every second turn, built once from the Simple Shambler', c && c.hp === Math.round(sh.hp / 2) && c.dmg === Math.round(sh.dmg / 2) && c.attackEvery === 2 && c.mechTraits.join() === 'halved', JSON.stringify(c && { hp: c.hp, dmg: c.dmg, every: c.attackEvery }));
  check('Crawler: animation is not slowed by the trait (spd unchanged)', c.spd === sh.spd);
  check('Halved is reusable but assigned to the Crawler only; the original 45 are unchanged', Z.BESTIARY.length === 45 && Z.BESTIARY.every(z => !z.attackEvery && !(z.mechTraits || []).length) && Z.BESTIARY_ROSTER.filter(z => (z.mechTraits || []).includes('halved')).length === 1 && typeof Z.applyZombieTrait === 'function');
  check('Crawler: tier F (provisional), new id 46, new saves only (minRoster 2)', c.tier === 'F' && c.id === 46 && c.minRoster === 2);
  check('Older saves never meet the Crawler', Z.fieldBestiary().length === 45 && !Z.fieldBestiary().some(z => z.id === 46));
  let seen = 0; for (let k = 0; k < 400; k++) { if ((Z._bgZombie(0, Z.seededRng(k)) || {}).bestiaryId === 46) seen++; }
  check('Older saves: the field pool never picks it', seen === 0); }
{ const store = { zi_world_seed:'1' }; mkEnv(store).ZI.startNewInSlot('solo', 1, { gender:'male', profession:'vanguard' }); const Z = mkEnv(store, T0 + 1000).ZI;
  check('New saves meet the current roster (Crawler included)', store.zi_roster_v === '2' && Z.fieldBestiary().some(z => z.id === 46));
  let picked = null; for (let k = 0; k < 2000 && !picked; k++) { const z = Z._bgZombie(0, Z.seededRng(k)); if (z.bestiaryId === 46) picked = z; }
  check('New saves: the opening field pool can pick the Crawler and carries its attack interval', picked && picked.attackEvery === 2 && picked.hp === 20, JSON.stringify(picked));
  const eb = Z.STAT_FORMULAS.enemyStatBlock(picked), wall = Object.assign({}, Z.STAT_FORMULAS.enemyStatBlock({ name:'wall', hp: 1e6, dmg: 1 }), { accuracy: 0, evasion: 100 });
  const res = Z.simulateCombat(wall, eb, 'idle', Z.seededRng(3));
  const enemyActs = res.log.filter(l => l.by === 'enemy'), real = enemyActs.filter(l => l.result !== 'skip');
  check('Crawler fights: it acts on every second turn only (half attack frequency)', eb.attackEvery === 2 && enemyActs.length >= 10 && real.length === Math.floor(enemyActs.length / 2), real.length + ' of ' + enemyActs.length);
  const plain = Z.STAT_FORMULAS.enemyStatBlock(Z.BESTIARY[0]);
  check('Other zombies keep attacking every turn', plain.attackEvery === 1); }

// ── Operations ──
{ const store = { zi_world_seed:'1' }; mkEnv(store).ZI.startNewInSlot('solo', 1, { gender:'male', profession:'vanguard' }); const Z = mkEnv(store, T0 + 1000).ZI;
  const solo = Z.opsCatalog('solo'), camp = Z.opsCatalog('camp');
  check('Ops: Solo never shows camp-only operations; Camp has no Routes card', !solo.some(a => a.id === 'maintain') && camp.some(a => a.id === 'maintain') && !camp.some(a => a.id === 'route'));
  check('Ops: every proposed activity is labeled Design proposal and has nothing to open', Z.OPS_CATALOG.filter(a => a.proposal).every(a => !a.screen && Z.opsActivityStatus(a, 'solo').label === 'Design proposal') && ['cook','upkeep','laundry','radio_listen','intel','circuit','deploy_pending','sort','water'].every(id => Z.OPS_CATALOG.find(a => a.id === id).proposal));
  check('Ops: every existing activity says who, needs, while-away and result, and opens its owning screen', Z.OPS_CATALOG.filter(a => !a.proposal).every(a => a.who && a.needs && a.away && a.result && a.screen));
  const before = JSON.stringify(store); const n = Z.opsNow('solo'); Z.opsCampDuties(); Z.OPS_CATALOG.forEach(a => Z.opsActivityStatus(a, 'solo'));
  check('Ops: reading the page changes nothing in the save', JSON.stringify(store) === before);
  check('Ops: Now and next lists the patrol, Traversal and attention items', n.field.some(r => r.id === 'wander') && n.field.some(r => r.id === 'trav') && Array.isArray(n.attention), JSON.stringify(n.field.map(r => r.id)));
  Z.applyInjury && Z.applyInjury('test', false);
  check('Ops: an injury shows as an attention item', Z.opsNow('solo').attention.some(t => /Injured/.test(t)));
  const duties = Z.opsCampDuties();
  check('Ops (Camp): every existing duty is listed with its facility status', duties.length === Z.SCHEDULE_JOBS.length && duties.every(d => d.status && d.profession)); }
check('Ops: the Schedule tab shows the Operations page in both modes', /case 'camp-schedule': return window\.OperationsScreen \? <OperationsScreen mode="camp"/.test(html) && /case 'solo-schedule': return window\.OperationsScreen \? <OperationsScreen mode="solo"/.test(html) && /operations-ui\.jsx\?v=/.test(html) && /game\/operations\.js\?v=/.test(html));
check('Ops screen never runs or queues work; its only write is Camp Leader duty assignment through ZI.opsAssign / opsUnassign', !/assignJob|enqueueJob|startRouteRun|spend[A-Z]|wanderAct|saveSchedule|_wj\(|setItem/.test(ops) && /ZI\.opsAssign\(/.test(ops));
{ let errs = [];
  try { const g = {}, m = { exports: {} }; new Function('self', 'window', 'global', 'module', 'exports', 'define', await readFile('tools/vendor/babel-standalone-7.29.0.min.js'))(g, g, g, m, m.exports, undefined);
    const B = m.exports.transform ? m.exports : g.Babel; ['character-creation.jsx', 'operations-ui.jsx'].forEach(f => { try { B.transform(f === 'operations-ui.jsx' ? ops : cc, { presets: ['react'], filename: f }); } catch (e) { errs.push(f + ': ' + String(e.message).slice(0, 120)); } }); }
  catch (e) { errs.push('babel load: ' + String(e.message).slice(0, 120)); }
  check('New screens compile (JSX parses)', errs.length === 0, errs.join(' | ')); }
check('Ops: the chore design order is cooking → weapon upkeep → laundry', (() => { const s = mkEnv({}).ZI.OPS_CATALOG.filter(a => a.designOrder).sort((a, b) => a.designOrder - b.designOrder).map(a => a.id).join(); return s === 'cook,upkeep,laundry'; })());
// ── Camp duty assignment ──
{ const store = { zi_world_seed:'1' }; mkEnv(store).ZI.startNewInSlot('camp', 1, { gender:'male', profession:'envoy' }); const E = mkEnv(store, T0 + 1000), Z = E.ZI;
  // ROSTER-01 (Sam, Oct 30): a new game has only the player, so the camp survivors these duty
  // checks assign have to be recruited first rather than assumed present.
  (Z.DEMO_SQUAD_ROSTER || []).forEach(sv => Z.recruitSurvivor(sv));
  check('Duties: Solo cannot assign camp duties', !Z.opsAssign('sv_mason', 'scavenge', 'solo').ok && Z.getSchedule().assignments.length === 0);
  const r1 = Z.opsAssign('sv_mason', 'scavenge', 'camp');
  check('Duties: a duty with no facility requirement can be staffed (existing schedule)', r1.ok && Z.getSchedule().assignments.some(a => a.survivorId === 'sv_mason' && a.jobId === 'scavenge'));
  check('Duties: a duty whose facility is not built is refused', !Z.opsAssign('sv_riza', 'guard', 'camp').ok && /watchtower/.test(Z.opsAssign('sv_riza', 'guard', 'camp').reason));
  check('Duties: one survivor per duty slot', !Z.opsAssign('sv_riza', 'scavenge', 'camp').ok);
  const cs = Z.getCampSave(); ['watchtower','forge','garage','infirmary','garden'].forEach(b => { cs.built[b] = 1; }); Z.saveCampSave(cs);
  const cap = Z.opsDutySlots(); ['guard','workshop','garage','infirmary'].forEach((j, i) => Z.opsAssign(['sv_riza','sv_doc','sv_kade','sv_wanderer'][i], j, 'camp'));
  check('Duties: never more staffed duties than the Command slots allow', Z.getSchedule().assignments.length === cap, Z.getSchedule().assignments.length + ' / ' + cap);
  Z.opsAssign('sv_mason', 'farm', 'camp');
  check('Duties: re-assigning a survivor moves them (one duty each)', Z.getSchedule().assignments.filter(a => a.survivorId === 'sv_mason').length === 1 && Z.getSchedule().assignments.some(a => a.survivorId === 'sv_mason' && a.jobId === 'farm'));
  Z.opsUnassign('sv_mason', 'camp');
  check('Duties: Unassign frees the survivor', !Z.getSchedule().assignments.some(a => a.survivorId === 'sv_mason'));
  Z._saveRouteRuns({ r1: { startedAt: T0, durationMs: 3600000, squadIds: ['sv_mason'], mode:'active', threatLevel:0, autoRepeat:false } });
  check('Duties: a survivor away on a route run cannot take a duty', !Z.opsAssign('sv_mason', 'farm', 'camp').ok); }
return results;
})();
