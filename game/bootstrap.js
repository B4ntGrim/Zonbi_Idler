// game/bootstrap.js — every load-time call and function wrapper from the old game-data.js, in the original order.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
//
// TEMPORARY COMPATIBILITY (remove once the remaining load-order differences are reviewed):
// Each step runs "as of" its original line in game-data.js: ZI entries that were first defined further down that
// file are hidden while the step runs and restored straight after, so load-time behaviour matches the old file.
// Two known issues from the old file have since been fixed on purpose:
//   A. FIXED (change 2): a finished craft job's RMAT is now added to the wallet at load (see ALWAYS below).
//   B. FIXED (change 3): finished recycle jobs are now granted at load. ZI_MATERIALS (game/economy.js) is no longer
//      hidden, so recycle output is credited and jobs queued behind it are no longer held until the next tick.
//      Decision (Oct 2): like crafts finished while away, the recycle XP is awarded but is not active skill use —
//      it runs before the decay wrapper below, so it does not reset Mechanical's rust clock.
(function () {
  // Capture one browser-side absence window before any subsystem performs load-time catch-up.
  ZI.beginOfflineWindow && ZI.beginOfflineWindow();
  // Overlapping activities must earn rewards in time order: granting a whole
  // camp shift before replaying Wandering gives the survivor future skill levels.
  const absence = ZI.offlineWindow();
  const idleAward = ZI.awardXp; // retain the original offline job/schedule decay semantics
  const wanderAtLoad = ZI.getWanderRun();
  const replayTogether = absence.creditedMs > 0 && wanderAtLoad.active && !wanderAtLoad.paused &&
    (ZI.getSchedule().assignments.length > 0 || ZI._readJobsRaw().jobs.length > 0 || Object.keys(ZI._readRouteRuns()).length > 0);
  var DEF = {ACTION_XP:1145,BASELINE_SKILLS:2347,BASE_CRAFT_SLOTS:1653,BASE_WORK_SKILLS:2348,BIOMES:340,BIOME_SUCCESS:3149,BUFF_KEY:875,BUILDINGS:3251,CAMP_KEY:1387,CAMP_LEADER_KEY:1397,CAMP_STRUCTURES:1345,CAMP_VER:1388,CELL_CLEAR_KILLS:2543,CHECKPOINT_EVERY:2260,CLASSES:281,CLOCK_KEY:123,CLOCK_RATE:124,CMD_CYCLE_MS:1928,CMD_KEY:1927,CMD_LIMIT:1926,COMPONENT_KEY:1432,CONTRACTS:1251,CONTRACT_KEY:1264,CONTRACT_VER:1265,CRAFT_DROP_RATES:555,CRAFT_RECIPES:436,DECAY:2434,DIFFICULTY_TABLE:2792,DISCOVERY_KEY:1035,DURA_KEY:924,ENCOUNTER_POOLS:2315,FACTIONS:309,FALLOW_TERMS:2625,FATIGUE_MODEL:3486,FORT_ATTACK_HP_PCT:2789,FORT_FACTION:2544,FORT_QUEST_REP_MAX:2752,FORT_QUEST_REP_MIN:2752,FORT_WEAR_CLEAR_KILLS:2671,FORT_WEAR_MULT:2670,GAME_HOUR_MS:3099,GEAR_ITEMS:590,GEAR_SLOTS:571,HEX_MOD:2419,HEX_ORDER:2418,INFECTION:3409,ITEM_BANDS:837,JOBS_KEY:1651,JOBS_VER:1652,JobEngine:1743,LAST_RUN_KEY:3023,LEADER_ARCHETYPES:1464,LEADER_KEY:1461,LEADER_VER:1462,LOADOUT_KEY:751,LODGE_MARKUP:2374,LODGE_MIN_REP:2374,LOOT_CATEGORIES:3308,LOOT_CONTAINERS:3469,MARKET_ITEMS:3270,MARKET_VIEW_KEY:2051,MAX_SEED:17,MOODLES:3322,NODE_META:2985,NUTRITION:2932,POI_LOOT:3072,POI_TIERS:3049,POI_VISIT_KEY:3048,POLICIES:2276,POLICY_SWITCH_COOLDOWN_H:2282,PROFESSIONS:1113,PURPOSE_META:629,RARITY_COLORS:567,RARITY_TO_TIER:382,RECYCLER_FILTERS:2012,RECYCLER_VIEW_KEY:2002,REPAIR_FACTOR:845,REP_MAX_EVENT:2374,REP_RANKS:336,REP_THRESHOLDS:337,REP_TIERS:2356,RESUME_WINDOW_MS:256,RMAT_DROP_RATES:423,RMAT_HOLD_KEY:2058,RMAT_TIERS:360,RMAT_TYPES:420,ROUTES:2952,ROUTE_RUN_KEY:3098,SAVE_ACTIVE_KEY:169,SAVE_INDEX_KEY:168,SAVE_SLOT_COUNT:167,SCHEDULE_JOBS:1202,SCHEDULE_KEY:1213,SCHEDULE_OFFLINE_CAP_H:1215,SCHEDULE_VER:1214,SECTOR_COLS:16,SECTOR_ROWS:16,SETTINGS_DEFAULTS:149,SETTINGS_KEY:148,SHOP_ITEMS:2159,SHOP_KEY:2088,SHOP_VER:2089,SIEGE_KEY:1527,SIEGE_VER:1528,SKILL_XP_SOURCES:3726,SPLASH:118,SPLASH_SET:106,SQUAD_ROSTER:3015,STASH_KEY:752,STASH_VER:753,STAT_FORMULAS:1770,STAT_VER_KEY:1132,STAT_XP_KEY:1098,STAT_XP_VER:1131,SURVIVAL_ATTRS:269,SURVIVOR_MAX_HP:2788,TASK_TYPES:3294,TIER_META:373,TIME_STAT_MODS:3607,TRAVERSAL_KM_UNLOCKS:1072,UNLOCKED_ZONES_KEY:1079,VEHICLE_FIND_CHANCE:3031,VEHICLE_KEY:3030,VEHICLE_NAMES:3032,VEHICLE_SYSTEMS:3508,WANDER_LOOT_KEY:1959,WANDER_RUN_KEY:2209,WANDER_TOTAL_KEY:2077,WANDER_XP_KEY:1052,WEATHER_EFFECTS:3642,WEATHER_STAT_MODS:3570,WORLD_EVENTS:3286,WORLD_NAMES:48,WanderEngine:2834,ZOMBIE_BEHAVIOR:3425,_appendGearRecipes:498,_bgZombie:2261,_boot:219,_bootMode:257,_clock:125,_factionRequiredItems:637,_gameKeys:171,_gearRecipe:491,_grantJob:1692,_poolOf:1679,_readJSON:170,_readJobsRaw:1656,_readRouteRuns:3100,_restore:177,_rj:2272,_saveDecay:2441,_saveRouteRuns:3103,_scavCumCache:1749,_scavCumThreshold:1750,_settleJobs:1700,_settling:1666,_slotsFor:1680,_snapshot:176,_summary:181,_wj:2273,_writeSlot:212,_xpListeners:1179,acceptContract:1306,activeEvadeBonus:893,activeXpBonuses:904,addBuff:883,addCellKill:2547,addCheckpoint:2239,addComponent:1434,addPoiVisits:3059,addRmat:2063,addStatXp:1103,alignedFaction:2420,applyCapacity:2148,applyRecyclerView:2033,applyWanderingXp:1057,applyWear:934,assignJob:1222,auditItems:663,awardXp:1182,bankWanderLoot:1990,buildSlots:1677,buildStructure:1436,campDefenseRating:1458,campLeaderId:1476,canAffordRepair:965,canAffordStructure:1420,canCampAt:2662,canDiscard:2710,canSendAgain:3241,cancelJob:1741,cellClearTarget:2602,cellFamiliarity:2617,checkKmUnlocks:1085,chooseLeader:1478,claimLastRun:3231,clearResume:266,cmdResetInMs:1943,cmdsRemaining:1939,commandRosterCap:1522,commandScheduleSlots:1524,commandSquadCap:1523,completeContract:1323,completeRun:3205,conditionMods:3630,consumeBootMode:264,consumeCommand:1948,consumeWanderLoot:1996,contractBlockReason:1298,contractEquipCheck:1286,contractRequirementsMet:1279,contractState:1272,craftSlots:1676,defaultWanderRun:2210,deleteSlot:247,deployLeader:1497,deriveItemPurpose:642,deriveMarketValue:653,difficultyMult:2794,diplomatLevel:1278,discoverZombie:1040,drainWanderLog:2665,effectiveLevel:2450,emitAction:1189,emitScheduleTick:1234,emptyLoadout:754,enqueueJob:1682,ensureStarterKit:2694,ensureStatTracks:1134,equipGear:783,estimateSuccessProbability:3150,factionDisplayName:2654,factionKnown:2650,factionRep:1277,factionsUnlocked:2689,fallowGoal:2627,fallowProgress:2628,fallowTerms:2626,fortAttack:2796,fortAttackChance:2786,fortAttackHpLoss:2795,fortCheck:2778,fortCheckChance:2773,fortOffer:2760,fortQuestEligibility:2753,fortStartQuest:2739,fortTone:2735,fortTurnIn:2816,fortWearActive:2677,fortWearMult:2683,gameTotalSeconds:131,getActiveBuffs:876,getActiveSlot:189,getCampLeaderLevel:1398,getCampSave:1389,getCapacity:2149,getCellKills:2546,getCharacterLevel:1064,getCharacterXp:1053,getCheckpoints:2249,getCmdWindow:1929,getComponents:1433,getContract:1263,getContractSave:1266,getDecay:2436,getDifficulty:2793,getDiscovered:1036,getDuraMap:925,getExploredSectors:90,getFallowQuest:2622,getFortPos:2562,getGameTime:135,getGearItem:624,getInjury:2725,getJob:1212,getJobs:1667,getLastRun:3024,getLeader:1470,getLifetimeDistance:2078,getLifetimeLap:2085,getLoadout:757,getMarketView:2052,getPoiVisits:3057,getPolicy:2283,getProfileFlag:2151,getRecyclerView:2003,getReducedGore:119,getRep:2376,getRmatHoldings:2059,getSchedule:1216,getSettings:150,getShopSave:2090,getSiegeSave:1529,getStash:763,getStatXp:1099,getStructure:1386,getSurveyPoint:2635,getTravZone:99,getUnlockedZones:1080,getVehicle:3033,getWanderLoot:1960,getWanderRun:2216,graceDays:2435,grantGear:775,grantJobCraft:1616,grantRecycleOutput:1632,hasMedKit:2704,hasWorkingVehicle:3034,hash01:24,heinousUnlocked:2297,hexModifier:2425,inFortCell:2660,injureLeader:1502,isCellCleared:2612,isDiscovered:1049,isFallowCell:2599,isFilterUnlocked:2028,isFortCell:2598,isHomeCell:2608,isLeaderDeployed:1490,isLeaderRecovering:1491,isRecipeUnlocked:2147,isStoryItem:2709,isSurveyCell:2648,itemDrainPerUse:868,itemDurability:927,itemDurabilityMax:863,itemHasDurability:857,itemTierKey:847,itemWeight:849,itemWorn:942,jobProgress:1732,jobRemaining:1736,jobsByType:1740,leaderChosen:1486,leaderLevel:1488,leaderRecoveryRemaining:1496,leaderStatus:1492,listSlots:190,liveFactions:2363,loadSlot:234,lodgePrice:2373,lootFailDamage:162,lootSafeChance:156,markSectorExplored:91,now:1650,onXp:1180,packLeaderActive:1517,passTime:140,placeSurveyPoint:2636,poiKey:3056,poiTier:3064,poiVisits:3058,policyCooldownLeftMs:2298,policyEvades:2288,progressContract:1317,queueWanderLog:2664,recipeForItem:916,recycleSlots:1678,recyclerOpSpeedBonus:1456,removeFromStash:2712,repApply:2393,repTier:2392,repairCost:947,repairItem:974,resetWanderRun:2251,resolveLoadoutStats:812,resolveRunNodes:3167,resolveSiege:1559,riskBand:3156,rmatLabel:2971,rmatReachedRank:2069,roadEdgeH:40,roadEdgeV:44,rosterCapacity:1457,routeNodeType:2976,routeRunProgress:3135,saveCampSave:1394,saveContractSave:1271,saveDuraMap:926,saveJobs:1661,saveLeader:1475,saveLoadout:761,saveMarketView:2055,saveRecyclerView:2007,saveSchedule:1221,saveShopSave:2095,saveSiegeSave:1534,saveStash:771,saveToActiveSlot:241,saveWanderRun:2221,sectorLabel:55,seededHearthguardRep:2375,setCampLeaderLevel:1402,setInjury:2726,setLastRun:3091,setPolicy:2303,setProfileFlag:2150,setReducedGore:120,setRouteRunRepeat:3111,setSetting:151,setWanderScroll:2233,settleRepForgiveness:2406,settleRouteRuns:3117,settleSchedule:1240,settleSkillDecay:2471,shopBuy:2133,shopGateFraction:2127,shopLevel:2097,shopNewUnlockCount:2153,shopOwned:2096,shopProgress:2118,shopReqMet:2100,shopState:2108,siegeCountdown:1538,siegeDefenderCount:1553,siegeForecast:1546,siegeImminent:1544,simulateCombat:1903,skillDecayState:2437,skillIdleDays:2442,skillRust:2443,startFortWearPenalty:2672,startNewInSlot:225,startRouteRun:3104,statLevel:1759,structureEffect:1451,structureLevel:1395,structureNextCost:1414,structureState:1404,syncWanderState:2226,takeMedKit:2717,tierColor:404,tierMeta:408,tierOf:384,tierRank:409,tierTally:411,toRecyclerItem:1966,treatInjury:2727,treatLeader:1511,tryDiscoverVehicle:3036,unassignJob:1228,unequipGear:804,unlockShopRecipe:2146,unlockedFilterRanks:2020,valueNoise:30,wallMaxHp:1536,wanderMounted:2259,wanderPolicyStep:2495,worldCell:60,worldSeed:18,zoneFromCell:96};
  // Fixed issue A (change 2): the RMAT wallet is always available, so a craft job that finished while the player
  // was away credits its RMAT during the load-time catch-up instead of silently dropping it.
  var ALWAYS = { addRmat:1, getRmatHoldings:1, RMAT_HOLD_KEY:1 };
  // Restore by DESCRIPTOR, not by assignment. `ZI[k] = hidden[k]` turns an accessor property into
  // a plain data property holding whatever the getter happened to return when it was hidden, so a
  // live getter silently freezes at load (ROSTER-01, Oct 30: ZI.SQUAD_ROSTER stopped updating).
  var asOf = function (line, fn) {
    var hidden = {}, k;
    for (k in DEF) if (DEF[k] > line && !ALWAYS[k] && Object.prototype.hasOwnProperty.call(ZI, k)) {
      hidden[k] = Object.getOwnPropertyDescriptor(ZI, k); delete ZI[k];
    }
    try { fn(); } finally { for (k in hidden) Object.defineProperty(ZI, k, hidden[k]); }
  };
  // Fail loudly if a module did not load (a 404 or stale cache would otherwise leave ZI half-built).
  var need = { core:'tierOf', world:'worldCell', save:'listSlots', stats:'awardXp', items:'GEAR_ITEMS', crafting:'CRAFT_RECIPES', combat:'simulateCombat', factions:'getRep', camp:'CAMP_STRUCTURES', jobs:'_settleJobs', economy:'addRmat', wandering:'WanderEngine', fort:'getFortPos', routes:'ROUTES', 'survival-data':'MOODLES' };
  var missing = Object.keys(need).filter(function (m) { return !(need[m] in ZI); });
  if (!window.ZI_MATERIALS) missing.push('economy (ZI_MATERIALS)');
  if (missing.length && typeof console !== 'undefined') console.error('[ZI bootstrap] missing game modules:', missing.join(', '));

  // ── was game-data.js line 748
  asOf(748, function () {
// Now that GEAR_ITEMS + getGearItem exist, append the gear/consumable recipes.
ZI._appendGearRecipes();
// Sam, Oct 31: temporary item-value data for the catalog; not used by live trade or crafting balance.
ZI.CRAFT_RECIPES.forEach(r => {
  if (!Number.isFinite(r.placeholderUnitValue)) {
    const ingredientUnits = Object.values(r.cost || {}).reduce((sum, amount) => sum + (Number(amount) || 0), 0);
    r.placeholderUnitValue = Math.max(1, Math.round(((Number(r.tier) || 0) + 1) * 5 + ingredientUnits / 10));
  }
});
// CLOCK-01 T9: appended gear/consumable recipes follow the same 10× game-second rescale.
ZI.CRAFT_RECIPES.forEach(function (r) { if (Number.isFinite(r.time)) r.time /= 10; });
  });

  // ── was game-data.js line 1199
  asOf(1199, function () {
ZI.ensureStatTracks();
  });

  // ── was game-data.js line 1339
  asOf(1339, function () {
if (!replayTogether) ZI.settleSchedule(ZI.offlineWindow()); // joint activity replay happens after all wrappers are installed
  });

  // ── was game-data.js line 1340
  asOf(1340, function () {
ZI.auditItems();     // enrich items with purpose[] + marketValue (contracts now defined)
  });

  // ── was game-data.js line 1744
  asOf(1744, function () {
if (!replayTogether) ZI._settleJobs(ZI.offlineWindow().to, ZI.offlineWindow());
  });

  // ── was game-data.js line 1745
  asOf(1745, function () {
ZI.JobEngine.start();
  });

  // ── was game-data.js line 2452
  asOf(2452, function () {
// Every XP grant stamps the skill as active and progresses its floor.
if (!ZI._decayWrapped) {
  ZI._decayWrapped = true;
  const baseAward = ZI.awardXp;
  ZI.awardXp = function(prof, amount, meta) {
    baseAward(prof, amount, meta);
    if (!prof || !(amount > 0)) return;
    const st = ZI.skillDecayState(prof); st.lastActiveUtc = ZI.clockNow();
    const L = ZI.statLevel(prof), tier = Math.floor(L / ZI.DECAY.floorStep) * ZI.DECAY.floorStep;
    if (tier >= ZI.DECAY.floorStep) {
      st.floorProgress[tier] = (st.floorProgress[tier] || 0) + 1;
      if (st.floorProgress[tier] >= ZI.DECAY.floorEvents) {
        const xpAt = prof === 'scavenging' ? ZI._scavCumThreshold(tier) : (50 * tier + 12 * tier * tier);
        st.floorXp = Math.max(st.floorXp || 0, xpAt);
      }
    }
    ZI._saveDecay(prof, st);
  };
}
  });

  // ── was game-data.js line 2555
  asOf(2555, function () {
if (!ZI._killWrapped) {
  ZI._killWrapped = true;
  const baseEmit = ZI.emitAction;
  // Only kills made while stationed in the cell count (Routes nodes and the Fort guard pass noCellKill).
  ZI.emitAction = function(id, scale, meta) { baseEmit(id, scale, meta); if (id === 'kill' && !(meta && meta.noCellKill)) ZI.addCellKill(1); };
}
  });

  // ── was game-data.js line 2633
  asOf(2633, function () {
// Story item from the Fallow Ground turn-in (brief 12.2).
if (!ZI.GEAR_ITEMS.find(x => x.id === 'sealed_crate')) ZI.GEAR_ITEMS.push({ id:'sealed_crate', name:'Sealed Crate', slot:null, cat:'story', isStory:true, rarity:'rare', icon:'📦', dmg:0, armor:0, carryW:2, speedDelta:0, lootBonus:0, purpose:['faction'], desc:'Stamped with a laboratory mark the Hearthguard do not recognise. Someone built this.' });
  });

  // ── was game-data.js line 2832
  asOf(2832, function () {

if (!replayTogether) { ZI.settleSkillDecay(); ZI.settleRepForgiveness(); }
  });

  // ── was game-data.js line 2927
  asOf(2927, function () {
ZI.WanderEngine.start();
  });

  // ── was game-data.js line 3793
  asOf(3793, function () {

// ─── END PZ-INSPIRED SYSTEMS ──────────────────────────────────────────────────
// ZI game data loaded

// Older saves: grant the starter kit once (guarded by zi_starter_kit_given) whenever a save is active.
try { if (ZI.getActiveSlot && ZI.getActiveSlot()) { if (ZI.Jester) ZI.Jester.onLoad(); else ZI.ensureStarterKit(); } } catch (e) {} // JD1a (S1, B4, B5): legacy record + kit once; fallback when the switch is off
  });

  // Routes load after the original startup replay; settle them against the same bounded absence window.
  if (!replayTogether && ZI.settleRouteRuns) ZI.settleRouteRuns(ZI.offlineWindow());

  // ── Batch 1: upgrade saves that predate the version stamp (runs last; adds data only)
  ZI.migrateSave();

  if (replayTogether) {
    const installed = ZI._installedClock;
    const lead = ZI.WanderEngine._lead;
    let moment = absence.from;
    // Acquire the ordinary single-tab lock before touching a shared save.
    if (!lead.call(ZI.WanderEngine, absence.now, false)) return;
    ZI.installClock(() => moment);
    ZI._offlineWanderPending = false;
    // The tab keeps the acquired lock for this synchronous replay.
    ZI.WanderEngine._lead = () => true;
    try {
      while (moment < absence.to) {
        moment = Math.min(absence.to, moment + 1000);
        const step = { from:absence.from, to:moment, now:moment, discardedMs:0 };
        const activeAward = ZI.awardXp;
        ZI.awardXp = idleAward;
        try { ZI._settleJobs(moment); ZI.settleSchedule(step); }
        finally { ZI.awardXp = activeAward; }
        ZI.settleRouteRuns(step);
        ZI.WanderEngine.tick(moment);
        // Drain bounded work without inventing more elapsed time.
        let backlog = ZI.getWanderRun()._carryMs || 0;
        while (backlog > 0) {
          ZI.WanderEngine.tick(moment);
          const remaining = ZI.getWanderRun()._carryMs || 0;
          if (remaining >= backlog) throw new Error('Offline Wandering catch-up made no progress');
          backlog = remaining;
        }
        ZI.decayHousekeeping(moment);
      }
      if (absence.discardedMs > 0) {
        ZI._settleJobs(absence.to, absence);
        ZI.settleRouteRuns(absence);
        ZI.settleSchedule({ from:absence.to, to:absence.to, now:absence.now });
        const run = ZI.getWanderRun();
        run.lastTickAt = absence.now;
        if (Number.isFinite(run._simNow)) run._simNow += absence.discardedMs;
        ZI.saveWanderRun(run);
      }
    } finally {
      ZI.installClock(installed);
      ZI.WanderEngine._lead = lead;
    }
  }
})();
