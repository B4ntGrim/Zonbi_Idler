// game/police-station.js — Solo Police Station search quest.
// Loaded after wandering.js and active.js, before bootstrap's offline replay.
(function () {
  const QUEST_KEY = 'zi_police_station_quest';
  const GUN_ID = 'pistol';
  const GUN_FIND_CHANCE = 0.08; // Initial tuning value: chance on a successful loot-producing policy encounter.

  ZI.isPoliceStationCell = function (cell) {
    return !!(cell && cell.biome === 'metro' && /^Police Station(?:\s|$)/i.test(cell.name || ''));
  };

  ZI.getPoliceStationQuest = function () {
    return ZI._rj(QUEST_KEY, { active:false, completed:false });
  };

  ZI.beginPoliceStationSearch = function () {
    const quest = ZI.getPoliceStationQuest();
    if (quest.completed) return { ok:false, message:'The Police Station gun search is complete.' };
    if (quest.active) return { ok:true, message:'The Police Station gun search is already underway.' };
    const next = { active:true, completed:false, startedAt:ZI.clockNow() };
    ZI._wj(QUEST_KEY, next);
    ZI.queueWanderLog && ZI.queueWanderLog('📋 Quest started: Search the Police Station for a firearm. Wandering may turn one up.');
    return { ok:true, message:'Quest started: Search the Police Station for a firearm.' };
  };

  const baseStep = ZI.wanderPolicyStep;
  ZI.wanderPolicyStep = function (rng, ctx) {
    const result = baseStep.call(this, rng, ctx);
    const zone = ZI.getTravZone && ZI.getTravZone();
    const quest = ZI.getPoliceStationQuest();
    rng = rng || Math.random;
    if (quest.active && !quest.completed && ZI.isPoliceStationCell(zone) && result.ok && result.loot) {
      result.policeStationSearchEvent = true;
      if (rng() < GUN_FIND_CHANCE && ZI.grantGear && ZI.grantGear(GUN_ID, 1)) {
        quest.active = false;
        quest.completed = true;
        quest.completedAt = ZI.clockNow();
        ZI._wj(QUEST_KEY, quest);
        result.policeStationQuestComplete = true;
        result.text += ' Quest complete: a 9mm Pistol was found at the Police Station.';
      }
    }
    return result;
  };

  if (ZI.returnReport) {
    const baseReport = ZI.returnReport;
    ZI.returnReport = function (away) {
      const rows = baseReport(away);
      if (away && away.policeStationSearches > 0) {
        const completionAlreadyListed = (away.eventLog || []).some(text => text.includes('Quest complete: a 9mm Pistol'));
        if (away.policeStationQuestComplete && !completionAlreadyListed) rows.push('Quest complete: a 9mm Pistol was found at the Police Station.');
        else if (!away.policeStationQuestComplete) rows.push('The Police Station gun search continues; no firearm was found during this return.');
      }
      return rows;
    };
  }
})();
