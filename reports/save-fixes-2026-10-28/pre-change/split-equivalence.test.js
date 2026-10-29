// TEMPORARY split-equivalence check: the archived game-data.js versus the game/ modules.
// Both run in the same browser-like sandbox (no ZI_MATERIALS until "screens-v3.jsx" adds it after load, as in the
// browser; for the split build it comes from game/economy.js), with frozen time and a seeded Math.random.
// Usage (run_script): const T = await readFile('tests/split-equivalence.test.js'); await (new Function('readFile','log', T))(readFile, log);
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','routes','survival-data','bootstrap'];
const legacy = await readFile('archive/legacy/game-data.js');
const mods = []; for (const m of ORDER) mods.push(await readFile('game/' + m + '.js'));
const split = mods.join('\n');
const econ = mods[ORDER.indexOf('economy')];
const matBlock = econ.slice(econ.indexOf('// ─── MATERIAL ECONOMY'));
const T0 = 1790000000000;
// Storage keys that intentionally differ from the legacy file because of a documented fix (change number in comment).
// zi_stat_xp: the recycle grant now also awards its XP at load (change 3) instead of on the next tick.
// Symbols intentionally removed from the runtime (change 4: moved to reference/design-notes.js).
const REMOVED = new Set(['ZOMBIE_CODEX','SURVIVOR_ROLES','NOISE_SOURCES','CRAFTING_LOGIC','SCAVENGING','CAMP_DEFENSE_LOGIC']);
// Injury accessors now live in game/active.js, which this pre-active split-module comparison intentionally omits.
const OUTSIDE_ORDER = new Set(['getInjury','setInjury','treatInjury']);
// Functions intentionally changed / symbols intentionally added by the smoke-test bug fixes.
const CHANGED_FN = new Set([/* Clock unify (authorized by Sam, Oct 16): one shared game-clock rate */ '_clock','passTime','settleSchedule','buildStructure','setInjury','treatInjury', 'getCmdWindow','cmdResetInMs','policyCooldownLeftMs','setPolicy','skillDecayState','skillIdleDays','getDecayClock','_maybeSettleOnRead','getInjury','setInjury','getActiveBuffs','repApply','settleRepForgiveness','_boot','now','awardXp', /* H1 authorized (16) */ 'saveStash','saveLoadout','equipGear','unequipGear','resolveLoadoutStats', '_bgZombie','settleSkillDecay','simulateCombat','statLevel','tryDiscoverVehicle', 'addBuff', 'toRecyclerItem', 'defaultWanderRun', 'startNewInSlot','_gameKeys', /* FX3 (authorized Oct 10): catch-ups judge XP buffs at each finish time */ '_settleJobs', 'settleRouteRuns', /* JD1a (authorized by Sam, Oct 13): the Fort accepts the Fort-bound Med Kit first */ 'hasMedKit', 'takeMedKit']); // + tutorial follow-up: new save writes an empty zi_tut_progress // + R1: run-scoped snooze/HOLD/causes fields // + Batch 3A: shared salvage weight // + Batch 2A · Batch 2B: addBuff records when a buff was taken (B13): rng passed directly, decay clock // Bug 1 + carrying 1A (wrapped)
// Carrying 1A (§14.8): Belt slot added, six carrier items added, carrier/stack fields set on existing items.
const DATA_CHANGED = new Set([/* Clock unify (authorized by Sam, Oct 16) */ 'CLOCK_RATE','GAME_HOUR_MS','JobEngine', 'GEAR_SLOTS','GEAR_ITEMS', 'WanderEngine', 'WanderSim','WANDER_SIM_TABLE','STAT_FORMULAS','SAVE_FORMAT','SAVE_MIGRATIONS', 'ACTION_XP', 'CRAFT_RECIPES']); // CB1 (authorized by Sam, Oct 10): the Iron Knuckles recipe lore copies the item description (15% → 25% stagger) // + 'camp' action (Make Camp → Command XP) // + Batch 2A // Batch 1: WanderEngine.tick now calls the shared WanderSim
const STORE_ADDED = new Set(['zi_save_version', 'zi_decay_clock', 'zi_offline_last_seen']); // Batch 1: save format version stamped at load
const ADDED = new Set([/* TRAV-01a (LOCKED by Sam, Oct 21): Traversal scout pool, daily XP limits, Hide tier range */ 'TRAVERSAL_TABLE', 'TRAVERSAL_SCOUT_CHARGES_PER_DAY', 'TRAV_HIDE_GAME_HOURS', 'TRAV_SCOUT_KEY', 'TRAV_XP_DAY_KEY', '_travToday', 'getTravScouts', 'spendTravScout', '_travXpDone', 'travXpAvailable', 'travEmitOnce', 'TIER_ORDER', 'wanderDrawableTiers', 'tierLabelShort', 'hideThreats', 'THREAT_LABELS', /* Clock unify (authorized by Sam, Oct 16): the one shared rate */ 'REAL_MS_PER_GAME_HOUR', 'GAME_DAY_MS','OFFLINE_LAST_SEEN_KEY','OFFLINE_CAP_MS','_offlineWindow','_offlineWanderPending','_inferOfflineLastSeen','beginOfflineWindow','offlineWindow','heartbeatOfflineWindow','getCalendar','passTimeToNextMorning','TRAV_HIDE_MAX_PER_24H','TRAV_HIDE_USES_KEY','TRAV_CAMP_LAST_USED_KEY','_hideUsesAt','getHideUses','spendHideUse','getCampCooldown','spendCampUse', /* FX3 (authorized by Sam, Oct 10): buff moment and cleanup */ '_buffMomentFn', 'buffMoment', '_pruneBuffs', /* FX4 (authorized by Sam, Oct 12): shared survivor rules */ 'SurvivorRules', '_installedClock','clockNow','installClock','_rollStreams','roll','installRolls', /* H1 */ 'TUTORIAL_DONE_KEYS', 'TUT_DONE_VALUE', 'tutDone', 'setTutDone', 'TUT_PROGRESS_KEY', 'TUT_STEP_IDS', 'TUT_SCREEN_DONE_KEY', 'tutScreenForKey', 'getTutProgress', 'markTutSteps', 'tutStepsDone', '_migrateTutProgress', 'salvageWeight', 'DECAY_CLOCK','WANDER_REST_TABLE','_decayClockMem','_maybeSettleOnRead','_saveDecayClock','_settlingDecay','decayDaysOwed','decayHeartbeat','decayHousekeeping','getDecayClock','wearEquippedOnKill', 'WANDER_SIM_TABLE','WanderSim','seededRng','SAVE_FORMAT','SAVE_MIGRATIONS','getSaveVersion','migrateSave', 'CARRY_BASE_ONLY_MSG','lastCarryMessage','reportCarryRefusal','stashCount','takeToCarried','putBackToStash', 'BASE_CAPACITY_KG','CARRIER_SLOTS','DEFAULT_STACK_LIMIT','HARD_CARRY_PCT','CARRIER_DATA','itemPocketSize','itemStackLimit','itemAllowedSlots','CARRIED_KEY','CARRIED_VER','ensureCarriedStore','normalizeCarried','getCarried','saveCarried','haulEntryWeight','carryTotals','canCarryAdd','_carriedAdd','_carriedRemove','atBaseOrCamp','_carrierChangeCheck','_returnCarriedToStash','lastEquipError','devGrantItem','_invListeners','onInventoryChange','_notifyInventory','RECYCLER_OPERATORS','currentGameMode','availableRecyclerOperators','defaultRecyclerOperator','canUseRecyclerOperator','queueRecycle','isRecyclable','recycleAll']); // Bugs 1–3
// Idle route fixes (authorized by Sam, Oct 23): retain unclaimed hauls and apply the advertised idle XP.
CHANGED_FN.add('completeRun'); CHANGED_FN.add('claimLastRun');
ADDED.add('getUnclaimedRouteRewards'); ADDED.add('ROUTE_XP_MULTIPLIERS');
// Solo preparation (authorized Oct 23): real skill/gear/cargo forecasts and departure snapshots.
['startRouteRun','routeRunProgress','estimateSuccessProbability','resolveRunNodes','canSendAgain'].forEach(k => CHANGED_FN.add(k));
['ROUTE_PREP_TABLE','routeUsesSoloPreparation','routeLootCapacity','getRoutePreparation','resolvePreparedRouteNodes'].forEach(k => ADDED.add(k));
// Top bar resources (Oct 27): one read-only backend reader for the header strip; dev-only view flag (world seed).
['getTopBarResources','isDevView'].forEach(k => ADDED.add(k));
// Shop purchases (Sam, Oct 27: "implement the Shop purchases"): RMAT prices, one purchase path, consumables re-buyable.
['shopPrice','shopCanAfford','shopPriceText','shopPurchase'].forEach(k => ADDED.add(k)); CHANGED_FN.add('shopState'); DATA_CHANGED.add('SHOP_ITEMS');
const INTENDED = { zi_rmat: 2, zi_jobs: 3, zi_materials: 3, zi_stash: 3, zi_stat_xp: 3 };
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x || '']);
// CLOCK-01 T9 rescales these data tables; CL7 adds fractional schedule credit.
// Their behavior is covered by clock-01-durations and clock-01-equivalence.
CHANGED_FN.add('emitScheduleTick');
DATA_CHANGED.add('CAMP_STRUCTURES'); DATA_CHANGED.add('ROUTES');
INTENDED.zi_schedule = 'CLOCK-01 bounded catch-up and retained fractional XP';
const mkEnv = (code, seedStore, legacyMaterials) => {
  const store = Object.assign({}, seedStore || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  let seed = 12345; const rnd = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const M = Object.create(Math); M.random = rnd;
  class D extends Date { constructor(...a) { if (a.length) super(...a); else super(T0); } static now() { return T0; } }
  const fw = { localStorage: ls, sessionStorage: ls, console, Date: D, Math: M, JSON, Proxy, Object, Array, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{},
    document:{ hidden:false, addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){} } };
  fw.window = fw;
  new Function('fw', 'with(fw){' + code + '}')(fw);
  if (legacyMaterials) new Function('fw', 'with(fw){' + matBlock + '}')(fw); // what screens-v3.jsx did after load
  return { fw, ZI: fw.ZI, store };
};
const safeJSON = (v) => { const seen = new WeakSet(); try { return JSON.stringify(v, (k, x) => { if (typeof x === 'function') return 'fn:' + x.toString(); if (x && typeof x === 'object') { if (seen.has(x)) return '[cycle]'; seen.add(x); } return x; }); } catch (e) { return 'ERR ' + e.message; } };
const compare = (label, A, B) => {
  const ka = Object.keys(A.ZI).sort(), kb = Object.keys(B.ZI).sort();
  const onlyA = ka.filter(k => !(k in B.ZI) && !REMOVED.has(k) && !OUTSIDE_ORDER.has(k)), onlyB = kb.filter(k => !(k in A.ZI) && !ADDED.has(k));
  check(label + ': removed design tables are gone', [...REMOVED].every(k => !(k in B.ZI)));
  check(label + ': same ZI symbols', !onlyA.length && !onlyB.length, 'only legacy=' + onlyA.join(',') + ' only split=' + onlyB.join(','));
  const fnDiff = ka.filter(k => !REMOVED.has(k) && !CHANGED_FN.has(k) && typeof A.ZI[k] === 'function' && (typeof B.ZI[k] !== 'function' || A.ZI[k].toString() !== B.ZI[k].toString()));
  check(label + ': function code unchanged', !fnDiff.length, fnDiff.join(','));
  const dataDiff = ka.filter(k => !REMOVED.has(k) && !DATA_CHANGED.has(k) && typeof A.ZI[k] !== 'function' && safeJSON(A.ZI[k]) !== safeJSON(B.ZI[k]));
  check(label + ': data values equal', !dataDiff.length, dataDiff.join(','));
  const sk = new Set([...Object.keys(A.store), ...Object.keys(B.store)]);
  const stDiff = [...sk].filter(k => A.store[k] !== B.store[k] && !(INTENDED[k]) && !STORE_ADDED.has(k));
  check(label + ': saved storage after load equal', !stDiff.length, stDiff.join(','));
  if (label === 'fresh') check(label + ': materials equal', safeJSON(A.fw.ZI_MATERIALS) === safeJSON(B.fw.ZI_MATERIALS)); // returning player differs by design (change 3)
  check(label + ': wrappers installed once', B.ZI._decayWrapped === true && B.ZI._killWrapped === true && A.ZI._decayWrapped === B.ZI._decayWrapped);
};
// Scenario 1: fresh storage
compare('fresh', mkEnv(legacy, {}, true), mkEnv(split, {}, false));
// Scenario 2: returning player with due jobs (craft RMAT, gear craft, recycle), an old schedule shift, an active save slot
const seedEnv = mkEnv(legacy, { zi_world_seed:'777', zi_materials: JSON.stringify({ metal:120, wood:90, cloth:40, electronics:30, fuel:20, medical:15 }) }, true);
const SZ = seedEnv.ZI;
const rmat = SZ.CRAFT_RECIPES.find(r => (r.kind || 'rmat') === 'rmat');
const gear = SZ.CRAFT_RECIPES.find(r => r.kind === 'gear');
SZ.enqueueJob('craft', rmat.id, 30, {}, 1);
SZ.enqueueJob('craft', gear.id, 30, {}, 1);
SZ.enqueueJob('recycle', 'rec1', 30, { item:{ id:'w1', name:'Old Radio', outputs:{ electronics:3, metal:2 }, weight:1 } }, 1);
const js = JSON.parse(seedEnv.store.zi_jobs); js.jobs.forEach(j => { j.status = 'active'; j.startedAt = T0 - 3600000; }); seedEnv.store.zi_jobs = JSON.stringify(js);
seedEnv.store.zi_schedule = JSON.stringify({ v: SZ.SCHEDULE_VER, assignments:[{ survivorId:'s1', jobId: SZ.SCHEDULE_JOBS[0].id, since: T0 - 7200000, lastTick: T0 - 7200000 }] });
seedEnv.store.zisave_active = JSON.stringify({ mode:'solo', slot:1 }); seedEnv.store[SZ.SAVE_ACTIVE_KEY] = JSON.stringify({ mode:'solo', slot:1 });
const seeded = Object.assign({}, seedEnv.store);
const A2 = mkEnv(legacy, seeded, true), B2 = mkEnv(split, seeded, false);
compare('returning player', A2, B2);
// Known issues A and B must still behave as before (preserved, not fixed)
const rmatWallet = (E) => E.store.zi_rmat || '';
check('issue A fixed: split credits load-time craft RMAT, legacy did not', rmatWallet(A2) !== rmatWallet(B2) && /"T\d":[1-9]/.test(rmatWallet(B2)), 'legacy=' + rmatWallet(A2) + ' split=' + rmatWallet(B2));
const recyclePending = (E) => (JSON.parse(E.store.zi_jobs || '{"jobs":[]}').jobs || []).some(j => j.type === 'recycle');
check('issue B fixed: legacy left the recycle job waiting, split granted it at load', recyclePending(A2) && !recyclePending(B2), 'legacy=' + recyclePending(A2) + ' split=' + recyclePending(B2));
// One authoritative materials list (bootstrap's temporary hide/restore assigns the same object back; it defines nothing)
const defRe = /window\.ZI_MATERIALS\s*=\s*\(function/g;
const matDefs = (split.match(defRe) || []).length;
const v3 = await readFile('screens-v3.jsx'), page = await readFile('Zombie Idler v2.html');
check('one ZI_MATERIALS definition across game/, screens-v3.jsx and the page', matDefs === 1 && !(v3.match(defRe) || []).length && !(page.match(defRe) || []).length, 'game/=' + matDefs + ' v3=' + (v3.match(defRe) || []).length);
check('ZI_MATERIALS defined in economy only', (econ.match(defRe) || []).length === 1);
let pass = 0; for (const [r, n, x] of results) { if (r === 'PASS') pass++; log(r + '  ' + n + '  ' + (x && r === 'FAIL' ? x : '')); }
log(pass + '/' + results.length + ' equivalence checks passed');
})();
