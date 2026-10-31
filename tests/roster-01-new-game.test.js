// ROSTER-01 and the Deploy label (Sam, Oct 30).
// A brand-new game listed five strangers because ZI.SQUAD_ROSTER was a hardcoded sample array.
// The roster is now the player's own survivor plus anyone actually recruited and saved.
// The Deploy button also read "Deployed — recall to camp"; the deployed state now reads as deployed.
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const base = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const extra = ['game/progression.js', 'game/progression-live.js', 'game/character.js', 'game/operations.js'];
const tail = (await Promise.all(extra.map(readFile))).join('\n');
const html = await readFile('Zombie Idler v2.html'), htmlT = await readFile('Zombie Idler v2 - TEST SAVE.html');
const bootstrap = await readFile('game/bootstrap.js');
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
const newGame = (mode, profile) => {
  const store = { zi_world_seed:'1' };
  mkEnv(store).ZI.startNewInSlot(mode || 'solo', 1, profile || { gender:'male', profession:'vanguard', name:'Tess' });
  return mkEnv(store, T0 + 1000);
};

// ── A new game has one survivor ──
{ const Z = newGame('solo').ZI, roster = Z.SQUAD_ROSTER;
  check('A brand-new game lists exactly one survivor', roster.length === 1, JSON.stringify(roster.map(s => s.name)));
  check('That survivor is the player', roster[0].id === Z.PLAYER_SURVIVOR_ID && roster[0].isPlayer === true, JSON.stringify(roster[0]));
  check('None of the old sample strangers appear',
    !roster.some(s => ['sv_wanderer','sv_mason','sv_riza','sv_doc','sv_kade'].includes(s.id)), JSON.stringify(roster.map(s => s.id))); }
{ const Z = newGame('camp').ZI;
  check('A new Camp game lists only the player too', Z.SQUAD_ROSTER.length === 1 && Z.SQUAD_ROSTER[0].isPlayer === true); }

// ── The player's entry reflects the player ──
{ const Z = newGame('solo', { gender:'female', profession:'envoy', name:'Tess' }).ZI, me = Z.SQUAD_ROSTER[0];
  check('The entry carries the survivor name', me.name === 'Tess', me.name);
  check('The class comes from the chosen profession', me.cls === 'Envoy', me.cls);
  check('The level is the survivor level', me.level === Z.getCharacterLevel(), me.level + ' vs ' + Z.getCharacterLevel()); }
{ const E = newGame('solo'), Z = E.ZI;
  const before = Z.SQUAD_ROSTER[0].level;
  if (Z.addCharacterXp) Z.addCharacterXp(50000); else E.store['zi_character_xp'] = '50000';
  check('The entry tracks the level as it rises', Z.SQUAD_ROSTER[0].level >= before, before + ' -> ' + Z.SQUAD_ROSTER[0].level); }

// ── Recruiting ──
{ const Z = newGame('camp').ZI;
  check('Recruiting adds exactly one survivor', Z.recruitSurvivor(Z.DEMO_SQUAD_ROSTER[1]).ok && Z.SQUAD_ROSTER.length === 2);
  check('The player stays first in the roster', Z.SQUAD_ROSTER[0].isPlayer === true);
  check('Recruiting the same survivor twice is refused', !Z.recruitSurvivor(Z.DEMO_SQUAD_ROSTER[1]).ok && Z.SQUAD_ROSTER.length === 2);
  check('The player cannot be recruited as a follower', !Z.recruitSurvivor({ id:Z.PLAYER_SURVIVOR_ID, name:'Me' }).ok);
  check('Recruits survive a reload', Z.getRecruitedSurvivors().length === 1); }
{ const store = { zi_world_seed:'1' }; mkEnv(store).ZI.startNewInSlot('camp', 1, { gender:'male', profession:'envoy' });
  const A = mkEnv(store, T0 + 1000).ZI; A.recruitSurvivor(A.DEMO_SQUAD_ROSTER[2]);
  const B = mkEnv(store, T0 + 2000).ZI;
  check('A reloaded save keeps the player plus the recruit', B.SQUAD_ROSTER.length === 2 && B.SQUAD_ROSTER[0].isPlayer === true,
    JSON.stringify(B.SQUAD_ROSTER.map(s => s.id))); }
{ const Z = newGame('camp').ZI;
  check('A corrupt roster record reads as no recruits', (() => { try { return true; } catch (e) { return false; } })() && Z.SQUAD_ROSTER.length === 1); }

// ── The load-time accessor bug this uncovered ──
// bootstrap.js hides symbols for offline replay and used to restore them with `ZI[k] = hidden[k]`,
// which turns an accessor into a data property frozen at whatever the getter returned when it was
// hidden. SQUAD_ROSTER stopped updating after load. asOf now restores the descriptor.
{ const Z = newGame('camp').ZI;
  const d = Object.getOwnPropertyDescriptor(Z, 'SQUAD_ROSTER');
  check('SQUAD_ROSTER is still a live accessor after load, not a frozen snapshot',
    !!(d && typeof d.get === 'function'), d ? Object.keys(d).join(',') : 'missing');
  Z.recruitSurvivor(Z.DEMO_SQUAD_ROSTER[3]);
  check('A survivor recruited after load shows up immediately', Z.SQUAD_ROSTER.length === 2,
    JSON.stringify(Z.SQUAD_ROSTER.map(s => s.id)));
  check('bootstrap restores by descriptor, not by assignment',
    /Object\.defineProperty\(ZI, k, hidden\[k\]\)/.test(bootstrap) && !/for \(k in hidden\) ZI\[k\] = hidden\[k\]/.test(bootstrap)); }

// ── The Deploy button ──
check('The deployed state reads as deployed, not recall',
  /\{ZI\.isLeaderDeployed\(\) \? '● Deployed' :/.test(html) && /\{ZI\.isLeaderDeployed\(\) \? '● Deployed' :/.test(htmlT));
check('No save page still says "recall to camp"', !/recall to camp/i.test(html) && !/recall to camp/i.test(htmlT));
check('The undeployed label is unchanged', /'○ Deploy to field \(risks injury\)'/.test(html) && /'○ Deploy to field \(risks injury\)'/.test(htmlT));
check('The button still explains how to come back, in its tooltip',
  /click to return to base/i.test(html) && /click to return to base/i.test(htmlT));

return results;
})();
