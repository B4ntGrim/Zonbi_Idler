// game/infiltration.js — Persistent faction cover actions at Traversal faction sites.
+// Load after items.js and fort.js. Gear enters a disguise set when it has factionId.
+
+(function () {
+  const STATE_KEY = 'zi_infiltration_v1';
+  const HEAD_SLOTS = ['helmet', 'mask']; // Concordance respirators use the Mask slot.
+  const BODY_SLOT = 'vest';
+  const HAND_SLOT = 'gloves';
+  const ALERT_AT = 3;
+
+  function readState() {
+    return ZI._rj(STATE_KEY, { sites: {}, researchLogFound: false, intel: null });
+  }
+  function saveState(state) { ZI._wj(STATE_KEY, state); }
+  function factionSite(cell) {
+    if (!cell) return null;
+    if (ZI.isSurveyCell && ZI.isSurveyCell(cell)) return { id:'concordance-survey', factionId:'concordance' };
+    if (ZI.isFortCell && ZI.isFortCell(cell)) return { id:'hearthguard-fort', factionId:'hearthguard' };
+    return null;
+  }
+  function wornFaction(slotId) {
+    const itemId = ZI.getLoadout()[slotId], item = itemId && ZI.getGearItem(itemId);
+    return item && item.factionId || null;
+  }
+  function hasDisguise(factionId) {
+    return HEAD_SLOTS.some(slot => wornFaction(slot) === factionId)
+      && wornFaction(BODY_SLOT) === factionId && wornFaction(HAND_SLOT) === factionId;
+  }
+  function siteProgress(state, siteId) {
+    if (!state.sites[siteId]) state.sites[siteId] = { suspicion:0, used:{} };
+    return state.sites[siteId];
+  }
+  function currentLead(state) {
+    const lead = state.intel;
+    return lead && lead.expiresAt > ZI.clockNow() ? lead : null;
+  }
+
+  ZI.isDisguisedAs = hasDisguise;
+  ZI.getInfiltrationIntel = function () {
+    const state = readState(), lead = currentLead(state);
+    if (!lead && state.intel) { state.intel = null; saveState(state); }
+    return lead;
+  };
+  ZI.infiltrationOptions = function (cell) {
+    const site = factionSite(cell);
+    if (!site) return [];
+    const state = readState(), progress = siteProgress(state, site.id);
+    const disguised = hasDisguise(site.factionId);
+    const unavailable = !disguised
+      ? 'Requires matching faction helmet or respirator, body armor, and gloves.'
+      : progress.suspicion >= ALERT_AT ? 'Your cover is blown at this site.' : null;
+    const researchTaken = site.factionId !== 'concordance' || state.researchLogFound;
+    return [
+      { id:'infiltrate-loot', icon:'◈', label:'Loot Stores',
+        reason:unavailable || (progress.used.loot ? 'These stores were already looted.' : null),
+        cost:`Medical and technical supplies · Suspicion ${progress.suspicion}/${ALERT_AT}` },
+      { id:'infiltrate-research', icon:'📓', label:'Steal Research',
+        reason:unavailable || (researchTaken ? 'No research log remains to take.' : null),
+        cost:`Advances the Sealed Crate investigation · Suspicion ${progress.suspicion}/${ALERT_AT}` },
+      { id:'infiltrate-listen', icon:'◉', label:'Listen In',
+        reason:unavailable || (progress.used.listen ? 'You have already listened in here.' : null),
+        cost:`Reveal a temporary survey-team lead · Suspicion ${progress.suspicion}/${ALERT_AT}` },
+    ];
+  };
+  ZI.resolveInfiltration = function (cell, actionId) {
+    const site = factionSite(cell);
+    if (!site) return { ok:false, message:'There is no faction site here.' };
+    if (!hasDisguise(site.factionId)) return { ok:false, message:'A complete matching uniform is required.' };
+    const state = readState(), progress = siteProgress(state, site.id);
+    if (progress.suspicion >= ALERT_AT) return { ok:false, message:'Your cover is blown at this site.' };
+    const action = String(actionId || '').replace(/^infiltrate-/, '');
+    if (progress.used[action]) return { ok:false, message:'You have already used this opportunity.' };
+
+    if (action === 'loot') {
+      const materials = window.ZI_MATERIALS || {}, reward = { medical:3, electronics:2, metal:2 }, got = [];
+      Object.entries(reward).forEach(([key, amount]) => {
+        const item = materials[key]; if (!item) return;
+        const before = item.current || 0, max = Number.isFinite(item.max) ? item.max : before + amount;
+        item.current = Math.min(max, before + amount);
+        if (item.current > before) got.push(`+${item.current - before} ${item.name || key}`);
+      });
+      progress.used.loot = true;
+      progress.suspicion = Math.min(ALERT_AT, progress.suspicion + 1);
+      saveState(state);
+      return { ok:true, tone:'good', message:`You take supplies from the stores: ${got.join(', ') || 'your stockpiles are full'}. Suspicion ${progress.suspicion}/${ALERT_AT}.` };
+    }
+    if (action === 'research') {
+      if (site.factionId !== 'concordance' || state.researchLogFound) return { ok:false, message:'No research log is available here.' };
+      state.researchLogFound = true;
+      progress.used.research = true;
+      progress.suspicion = Math.min(ALERT_AT, progress.suspicion + 2);
+      ZI.grantGear('concordance_research_log', 1);
+      saveState(state);
+      return { ok:true, tone:'good', message:'You secure a Concordance research log. The Sealed Crate investigation advances. Suspicion rises.' };
+    }
+    if (action === 'listen') {
+      const fort = ZI.getFortPos && ZI.getFortPos(), survey = ZI.getSurveyPoint && ZI.getSurveyPoint();
+      const target = site.factionId === 'hearthguard' ? survey : fort;
+      if (!target || target.gx == null || target.gy == null) return { ok:false, message:'You hear movement, but cannot place the team on the map yet.' };
+      state.intel = { kind:'survey-team', factionId:'concordance', gx:target.gx, gy:target.gy,
+        coord:target.coord, expiresAt:ZI.clockNow() + (ZI.GAME_DAY_MS || 24 * 60 * 60 * 1000) };
+      progress.used.listen = true;
+      saveState(state);
+      return { ok:true, tone:'info', message:`You overhear a survey-team lead near ${target.coord}. It stays useful for one game day.` };
+    }
+    return { ok:false, message:'Unknown infiltration action.' };
+  };
+})();
+