// game/stats.js — XP system, professions, stat formulas, skill decay, injury and effective level.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
// Everything attaches to the shared global ZI object; load-time calls live in game/bootstrap.js.

// ─── WANDERING XP → CHARACTER STATS ──────────────────────────────────────────
ZI.WANDER_XP_KEY = 'zi_character_xp';
ZI.getCharacterXp = function() {
  try { return parseInt(localStorage.getItem(ZI.WANDER_XP_KEY) || '0', 10) || 0; }
  catch (e) { return 0; }
};
ZI.applyWanderingXp = function(amount) {
  if (!amount || amount <= 0) return ZI.getCharacterXp();
  const total = ZI.getCharacterXp() + Math.round(amount);
  try { localStorage.setItem(ZI.WANDER_XP_KEY, String(total)); } catch (e) {}
  return total;
};
// Character level from accumulated XP (matches LevelSystem: (lvl*100)+(lvl^2*10)).
ZI.getCharacterLevel = function() {
  let xp = ZI.getCharacterXp(), lvl = 1, need = 0;
  while (lvl < 100) { need = (lvl * 100) + (lvl * lvl * 10); if (xp < need) break; xp -= need; lvl++; }
  return lvl;
};

// ─── STAT FORMULAS (Wandering ↔ Stats integration) ──────────────────────────
// Profession-style stats level 1–50. Persisted XP in localStorage so the
// Wandering tab writes progress the Stats tab reads.
ZI.STAT_XP_KEY = 'zi_stat_xp';
ZI.getStatXp = function() {
  try { return JSON.parse(localStorage.getItem(ZI.STAT_XP_KEY) || '{}'); }
  catch (e) { return {}; }
};
ZI.addStatXp = function(stat, amount) {
  if (!stat || amount <= 0) return;
  const x = ZI.getStatXp();
  x[stat] = (x[stat] || 0) + amount;
  try { localStorage.setItem(ZI.STAT_XP_KEY, JSON.stringify(x)); } catch (e) {}
};

// ─── CENTRAL XP BUS (Change 1) ───────────────────────────────────────────────
// Canonical profession tracks. Every gameplay action routes XP here so the
// Stats page reflects live progress from every screen.
ZI.PROFESSIONS = [
  { id:'combat',     name:'Combat',      icon:'⚔', desc:'Killing power in the field.' },
  { id:'firstAid',   name:'First Aid',   icon:'⛑', desc:'Heal strength and frequency.' },
  { id:'scavenging', name:'Scavenging',  icon:'🔍', desc:'Loot quality and filtering.' },
  { id:'stealth',    name:'Stealth',     icon:'🥷', desc:'Scouting reach and quiet pushes.' },
  { id:'athletics',  name:'Athletics',   icon:'🏃', desc:'Movement speed and stamina.' },
  { id:'endurance',  name:'Endurance',   icon:'🛡', desc:'Damage soaked and survived.' },
  { id:'foraging',   name:'Foraging',    icon:'🌿', desc:'Wild finds while wandering.' },
  { id:'smithing',   name:'Smithing',    icon:'🔨', desc:'Weapon & armor crafting.' },
  { id:'medical',    name:'Medical',     icon:'💊', desc:'Consumable & medkit crafting.' },
  { id:'mechanical', name:'Mechanical',  icon:'⚙', desc:'Gear, recycling & repair.' },
  { id:'discovery',  name:'Discovery',   icon:'🧭', desc:'New recipes, zones & codex.' },
  { id:'trading',    name:'Trading',     icon:'💰', desc:'Market deals and auctions.' },
  { id:'diplomat',   name:'Diplomat',    icon:'🤝', desc:'Faction standing and rep.' },
  { id:'logistics',  name:'Logistics',   icon:'📋', desc:'Schedules and camp tasks.' },
  { id:'engineering',name:'Engineering', icon:'🏗', desc:'Traversal grid and builds.' },
  { id:'command',    name:'Command',     icon:'⭐', desc:'Squad leadership and runs.' },
];
ZI.STAT_XP_VER = 2;
ZI.STAT_VER_KEY = 'zi_stat_xp_ver';
// Ensure every track exists (default 0) exactly once; non-destructive migration.
ZI.ensureStatTracks = function() {
  let ver = 0; try { ver = parseInt(localStorage.getItem(ZI.STAT_VER_KEY)) || 0; } catch (e) {}
  const x = ZI.getStatXp();
  let changed = false;
  ZI.PROFESSIONS.forEach(p => { if (!(p.id in x)) { x[p.id] = 0; changed = true; } });
  if (changed) { try { localStorage.setItem(ZI.STAT_XP_KEY, JSON.stringify(x)); } catch (e) {} }
  if (ver !== ZI.STAT_XP_VER) { try { localStorage.setItem(ZI.STAT_VER_KEY, String(ZI.STAT_XP_VER)); } catch (e) {} }
};

// Action → { profession: weight } map. emitAction(id, scale) splits a base
// amount across the listed tracks. Base XP per action lives in ACTION_XP.
ZI.ACTION_XP = {
  'kill':        { base:8,  split:{ combat:1 } }, // scavenging XP comes from looting the kill (no double count)
  'xp.firstAid': { base:1,  split:{ firstAid:1 } },
  'xp.stealth':  { base:1,  split:{ stealth:1 } },
  'xp.scavenging':{ base:1, split:{ scavenging:1 } },
  'loot':        { base:4,  split:{ scavenging:1 } },
  'forage':      { base:5,  split:{ foraging:1 } },
  'heal':        { base:12, split:{ firstAid:1 } },
  'revive':      { base:30, split:{ firstAid:0.6, endurance:0.4 } },
  'scout':       { base:5,  split:{ stealth:1 } },
  'sneak':       { base:8,  split:{ stealth:0.7, athletics:0.3 } },
  'endure':      { base:3,  split:{ endurance:1 } },
  'move':        { base:2,  split:{ athletics:1 } },
  'checkpoint':  { base:15, split:{ athletics:0.5, command:0.5 } },
  'camp':        { base:10, split:{ command:1 } },
  'craft.smith': { base:20, split:{ smithing:0.8, mechanical:0.2 } },
  'craft.medical':{base:20, split:{ medical:1 } },
  'craft.mech':  { base:20, split:{ mechanical:0.8, smithing:0.2 } },
  'craft.rmat':  { base:14, split:{ mechanical:0.5, discovery:0.5 } },
  'repair':      { base:10, split:{ mechanical:1 } },
  'recycle':     { base:4,  split:{ mechanical:1 } },
  'discover':    { base:25, split:{ discovery:1 } },
  'transaction': { base:10, split:{ trading:1 } },
  'faction':     { base:15, split:{ diplomat:1 } },
  'task':        { base:6,  split:{ logistics:1 } },
  'build':       { base:18, split:{ engineering:1 } },
  'run.complete':{ base:22, split:{ command:0.6, logistics:0.4 } },
  'wander.escape':{ base:10, split:{ stealth:0.6, athletics:0.25, scavenging:0.15 } },
  // Schedule idle jobs (per game-hour tick) + block completion.
  'schedule.tick':{ base:1,  split:{ logistics:1 } },       // scaled per-job in emitScheduleTick
  'schedule.complete':{ base:12, split:{ logistics:1 } },
  // Faction contracts.
  'contract.accept':{ base:6,  split:{ diplomat:1 } },
  'contract.complete':{ base:60, split:{ diplomat:1 } },
};
ZI._xpListeners = [];
ZI.onXp = function(fn) { ZI._xpListeners.push(fn); return () => { ZI._xpListeners = ZI._xpListeners.filter(f => f !== fn); }; };
// Award raw XP to one track (routes through addStatXp + notifies listeners).
ZI.awardXp = function(profId, amount, meta) {
  if (!profId || amount <= 0) return;
  ZI.addStatXp(profId, Math.round(amount));
  ZI._xpListeners.forEach(fn => { try { fn(profId, Math.round(amount), meta || {}); } catch (e) {} });
};
// Emit a named action; splits its base XP (× scale) across mapped professions.
// Flat XP-bonus items (§5) add +N per track when that track is already granted.
ZI.emitAction = function(actionId, scale, meta) {
  const def = ZI.ACTION_XP[actionId];
  if (!def) return;
  const total = def.base * (scale == null ? 1 : scale);
  const bonuses = ZI.activeXpBonuses ? ZI.activeXpBonuses() : {};
  Object.entries(def.split).forEach(([prof, w]) => {
    let amt = Math.round(total * w);
    if (amt > 0) { amt += (bonuses[prof] || 0); ZI.awardXp(prof, amt, Object.assign({ action: actionId }, meta || {})); }
  });
};
// XP→level: cumulative curve  xpForLevel(L) = 50·L + 12·L²  (prof cap 50)
// XP→level. Non-scavenging: existing curve xpForLevel(L)=50L+12L² (unchanged).
// Scavenging: steepest curve via cumulative STAT_FORMULAS.xpToNext (most-gated).
ZI._scavCumCache = null;
ZI._scavCumThreshold = function(L) {
  // Cumulative XP required to REACH level L (sum of xpToNext for 1..L-1).
  if (!ZI._scavCumCache) {
    ZI._scavCumCache = [0, 0]; // index by level; L1 needs 0
    let total = 0;
    for (let i = 1; i < 50; i++) { total += ZI.STAT_FORMULAS.xpToNext('scavenging', i); ZI._scavCumCache[i + 1] = total; }
  }
  return ZI._scavCumCache[Math.min(50, Math.max(1, L))] || 0;
};
ZI.statLevel = function(stat) {
  if (ZI._maybeSettleOnRead) ZI._maybeSettleOnRead();
  const xp = (ZI.getStatXp()[stat] || 0);
  let lvl = 1;
  if (stat === 'scavenging') {
    while (lvl < 50 && xp >= ZI._scavCumThreshold(lvl + 1)) lvl++;
    return lvl;
  }
  while (lvl < 50 && xp >= (50 * (lvl + 1) + 12 * (lvl + 1) * (lvl + 1))) lvl++;
  return lvl;
};

ZI.STAT_FORMULAS = {
  // ── FIRST AID ──  heal amount & count scale with level.
  // healPercent(L) = clamp(20 + 1.2·L, 20, 75)   ·  L1≈21% · L25≈50% · L46+≈75% cap
  firstAidHealPercent(L) { return Math.min(75, Math.round(20 + 1.2 * L)); },
  // healCount(L)   = clamp(2 + floor(L/8), 2, 8) ·  L1=2 · L8=3 · L48=8
  firstAidHealCount(L) { return Math.max(2, Math.min(8, 2 + Math.floor(L / 8))); },
  // XP per successful heal, scaled by amount restored.
  firstAidXpForHeal(amountHealed) { return Math.round(12 + amountHealed * 0.2); },

  // ── SCAVENGING ──  parallels Wandering looting.
  // XP per kill scales with zombie tier rank (0=F … 7=BOSS); per-item flat.
  scavengingXpForKill(tierRank) { return 6 + tierRank * 2; },
  scavengingXpForItem() { return 4; },
  // Loot quality % bonus = clamp(0.6·L, 0, 60)
  scavengingQualityBonus(L) { return Math.min(60, Math.round(0.6 * L)); },
  // Rarity filter unlocks: which rarities can be filter-targeted at level L.
  scavengingFilters(L) {
    const f = ['Common'];
    if (L >= 10) f.push('Uncommon');
    if (L >= 20) f.push('Rare');
    if (L >= 30) f.push('Epic');
    if (L >= 40) f.push('Legendary');
    return f;
  },

  // ── STEALTH ──  gained by scouting & pushing.
  // "Perfected sum": stealth efficiency = scoutPower + pushPower, both rising with L.
  stealthXpForScout() { return 5; },
  stealthXpForPush() { return 8; },
  // Scout reveals 1 + floor(L/4) zombies sequentially.  L1=1 · L12=4 · L48=13
  stealthScoutCount(L) { return 1 + Math.floor(L / 4); },
  // Push distance = 75 + 2.5·L metres (base 75 now, scaling with Stealth). L1≈77 · L50=200
  stealthPushDistance(L) { return Math.round(75 + 2.5 * L); },
  // Combined "perfected" efficiency rating (UI display).
  stealthEfficiency(L) { return this.stealthScoutCount(L) + Math.round(this.stealthPushDistance(L) / 25); },

  // ── EVADE / PUSH-TO-ESCAPE ── (Wandering disengage; all tunable) ──
  ESCAPE_BASE: 25, ESCAPE_MIN: 5, ESCAPE_MAX: 90,
  escapeStealthBonus(L) { return Math.round(L * 1.4); },          // Stealth is primary
  escapeReflexBonus(athleticsLvl) { return Math.round((athleticsLvl || 0) * 0.8); },
  escapeGearSpeedBonus(speedStat) { return Math.round(((speedStat || 100) - 100) * 0.4); }, // faster loadout helps
  // Enemy resistance derived from speed (fast zeds resist escape). unescapable → 999.
  escapeEnemyResist(enemy) {
    if (!enemy) return 0;
    if (enemy.unescapable || (enemy.traits && /grab|hold|latch/i.test(enemy.traits.join ? enemy.traits.join(' ') : ''))) return 999;
    if (typeof enemy.escapeResist === 'number') return enemy.escapeResist;
    const spd = enemy.spd || enemy.init || 6;
    return Math.round(spd * 3); // Shambler(~4)→12, Runner(~12+)→36+
  },
  escapeChance(stealthLvl, athleticsLvl, speedStat, enemy) {
    const resist = this.escapeEnemyResist(enemy);
    if (resist >= 999) return 0; // unescapable
    const itemEvade = (window.ZI && window.ZI.activeEvadeBonus) ? window.ZI.activeEvadeBonus() : 0; // §4 craftable evade
    const weaponEscape = (window.ZI && window.ZI.resolveLoadoutStats) ? (window.ZI.resolveLoadoutStats().escapeBonus || 0) : 0; // CB1: e.g. Pocket Knife +30
    const raw = this.ESCAPE_BASE + this.escapeStealthBonus(stealthLvl)
      + this.escapeReflexBonus(athleticsLvl) + this.escapeGearSpeedBonus(speedStat) + itemEvade + weaponEscape - resist;
    return Math.max(this.ESCAPE_MIN, Math.min(this.ESCAPE_MAX, Math.round(raw)));
  },
  escapeOpportunityDamage(enemy) { return Math.max(2, Math.round((enemy && enemy.atk || 8) * 0.6)); },

  // ── SCAVENGING LOOT-LOSS GATING (most-gated stat) ──
  // BalanceConfig dials:
  DROP_MAX: 0.90, LMAX: 50, PACK_LEADER_THRESHOLD: 25,
  // Fraction of the NON-best haul lost on a bad run end. L50 → 0 (total protection).
  scavDropRate(L) {
    const r = this.DROP_MAX * (this.LMAX - L) / (this.LMAX - 1);
    return Math.max(0, Math.min(this.DROP_MAX, r));
  },
  scavDropProtection(L) { return 1 - this.scavDropRate(L); }, // for UI (0..1)
  // Pack Leader (§2.1): a squadmate gets the better of own vs. leader drop rate,
  // but only in a squad (≥2) with the Camp Leader present & Scavenging ≥ threshold.
  effectiveDropRate(ownScavLvl, squad, campLeaderId) {
    const own = this.scavDropRate(ownScavLvl);
    if (!Array.isArray(squad) || squad.length < 2) return own;
    const leader = squad.find(s => s.id === campLeaderId);
    if (!leader || (leader.scavengingLevel || 0) < this.PACK_LEADER_THRESHOLD) return own;
    return Math.min(own, this.scavDropRate(leader.scavengingLevel));
  },

  // ── PER-PROFESSION XP CURVE (Scavenging steepest) ──
  A_BASE: 100, P_BASE: 1.5, A_SCAV: 150, P_SCAV: 1.8, GATE_START: 35, GATE_STEP: 0.15,
  xpToNext(profession, L) {
    if (profession === 'scavenging') {
      const gate = 1 + Math.max(0, L - this.GATE_START) * this.GATE_STEP;
      return Math.round(this.A_SCAV * Math.pow(L, this.P_SCAV) * gate);
    }
    return Math.round(this.A_BASE * Math.pow(L, this.P_BASE));
  },

  // ── COMBAT RESOLUTION MODEL (shared by idle auto-resolve + active) ──
  BASE_HIT: 65, HIT_MIN: 5, HIT_MAX: 95, MIN_CHIP: 1, CRIT_BONUS: 6,
  // Derive the survivor's combatant stat block from loadout + professions.
  survivorStatBlock(loadoutStats) {
    const s = loadoutStats || (window.ZI.resolveLoadoutStats && window.ZI.resolveLoadoutStats()) || {};
    const combatLvl = window.ZI.statLevel ? window.ZI.statLevel('combat') : 1;
    const athLvl = window.ZI.statLevel ? window.ZI.statLevel('athletics') : 1;
    const wpn = s.weaponDamage || 8;
    return {
      name:'Survivor', hp: s.displayHP || 100, hpMax: s.displayHP || 100,
      damageMin: Math.max(1, Math.round(wpn * 0.6)), damageMax: Math.max(2, Math.round(wpn * 1.1)), damageBonus: 0,
      accuracy: 55 + combatLvl, evasion: Math.round(athLvl * 0.8) + (window.ZI.activeEvadeBonus ? window.ZI.activeEvadeBonus() : 0),
      armor: s.armorRating || 0, crit: 5 + Math.round(combatLvl * 0.5), critBonus: this.CRIT_BONUS,
      lifesteal: 0, initiative: 10 + Math.round((s.speed || 100) / 10) + athLvl,
      heavySwingPct: s.heavySwingPct || 0, staggerPct: s.staggerPct || 0, // CB1 weapon specials, read by resolveAttack
    };
  },
  // Build an enemy stat block from a bestiary/encounter shape.
  enemyStatBlock(z) {
    const st = z.stats || {};
    return {
      name: z.name || 'Zombie', hp: z.hp || z.currentHp || 25, hpMax: z.hp || 25,
      damageMin: st.minHit || Math.max(1, Math.round((z.atk||z.dmg||8) * 0.6)),
      damageMax: st.maxHit || Math.max(2, Math.round((z.atk||z.dmg||8) * 1.1)), damageBonus: 0,
      accuracy: st.accuracy || 55, evasion: st.evasionMelee || 8,
      armor: z.armor || st.damageReduction || 0, crit: st.critChance || 5, critBonus: Math.round((st.critMult||1.5) * this.CRIT_BONUS),
      lifesteal: st.lifesteal || 0, initiative: Math.round((z.spd || z.init || 6) * 1.5),
      xp: z.xp || 10, bestiaryId: z.bestiaryId || z.id,
    };
  },
  // Atomic single-attack exchange (whole-number in/out).
  resolveAttack(atk, def, rng) {
    rng = rng || Math.random; // injectable random source (spec 10)
    if (atk._skipNext) { atk._skipNext = false; return { result:'skip' }; } // CB1: a heavy swing or a stagger costs this attack
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
    const hitChance = clamp(this.BASE_HIT + atk.accuracy - def.evasion, this.HIT_MIN, this.HIT_MAX);
    // CB1: rolls are drawn only when a special is present, so fighters without one keep their exact sequences
    const heavy = () => { if (atk.heavySwingPct > 0 && rng() * 100 < atk.heavySwingPct) atk._skipNext = true; };
    if (rng() * 100 > hitChance) { heavy(); return { result:'miss' }; }
    let dmg = Math.floor(atk.damageMin + rng() * (atk.damageMax - atk.damageMin + 1)) + (atk.damageBonus || 0);
    const crit = rng() * 100 <= atk.crit;
    if (crit) dmg += atk.critBonus || 0;
    const dealt = Math.max(this.MIN_CHIP, dmg - (def.armor || 0));
    def.hp -= dealt;
    if (atk.lifesteal) atk.hp = Math.min(atk.hpMax, atk.hp + Math.floor(dealt * atk.lifesteal / 100));
    if (atk.staggerPct > 0 && rng() * 100 < atk.staggerPct) def._skipNext = true; // CB1: stagger — the target loses its next attack
    heavy();
    return { result: crit ? 'crit' : 'hit', dealt, defHp: def.hp };
  },
};

// ── Skill decay: level-scaled, policy-protected, rust before loss, earned floors ──
ZI.DECAY = { minRate:0.01, maxRate:0.04, rustyOffsetDays:2, rustyEff:0.95, rustedEff:0.90, baselineMult:0.5, absenceCapDays:1, floorStep:10, floorEvents:25 };
ZI.graceDays = function(L) { return L < 15 ? 4 : L < 30 ? 3 : L < 45 ? 2 : 1; };
ZI.getDecay = function() { return ZI._rj('zi_skill_decay', {}); };
ZI.skillDecayState = function(skill) {
  const all = ZI.getDecay();
  return all[skill] || { lastActiveUtc: ZI.clockNow(), floorXp: 0, floorProgress: {}, lastSettle: ZI.clockNow() };
};
ZI._saveDecay = function(skill, st) { const all = ZI.getDecay(); all[skill] = st; ZI._wj('zi_skill_decay', all); };
ZI.skillIdleDays = function(skill) { return (ZI.clockNow() - ZI.skillDecayState(skill).lastActiveUtc) / 86400000; };
ZI.skillRust = function(skill) {
  const L = ZI.statLevel(skill), idle = ZI.skillIdleDays(skill), g = ZI.graceDays(L);
  if (idle <= g) return { state:'fresh', eff:1 };
  if (idle <= g + ZI.DECAY.rustyOffsetDays) return { state:'rusty', eff:ZI.DECAY.rustyEff };
  return { state:'rusted', eff:ZI.DECAY.rustedEff };
};
// Effective level used by gameplay formulas (rust applied).
ZI.effectiveLevel = function(skill) { return Math.max(1, Math.floor(ZI.statLevel(skill) * ZI.skillRust(skill).eff)); };
// Decay settle (spec 3, 10). One clock per save (zi_decay_clock): lastSettledUtc = end of the last settle,
// lastSeenUtc = last heartbeat while the game was open. Each settle applies decay for the time since
// lastSettledUtc, counting open-session time in full and closed time capped at absenceCapDays.
ZI.DECAY_CLOCK = { key: 'zi_decay_clock', settleEveryOpenSec: 3600, heartbeatSec: 60, minSettleDays: 0.01 };
ZI._decayClockMem = null;
ZI.getDecayClock = function(now) {
  if (ZI._decayClockMem) return ZI._decayClockMem;
  let c = ZI._rj(ZI.DECAY_CLOCK.key, null);
  if (!c) { // first run, or a pre-clock save: start from the latest per-skill settle stamp
    const all = ZI.getDecay(); const stamps = Object.values(all).map(s => s && s.lastSettle).filter(Boolean);
    const t = stamps.length ? Math.max.apply(null, stamps) : (now || ZI.clockNow());
    c = { lastSettledUtc: t, lastSeenUtc: t }; ZI._wj(ZI.DECAY_CLOCK.key, c);
  }
  return (ZI._decayClockMem = c);
};
ZI._saveDecayClock = function(c) { ZI._decayClockMem = c; ZI._wj(ZI.DECAY_CLOCK.key, c); };
ZI.decayHeartbeat = function(now) {
  const c = ZI.getDecayClock(now);
  if (now - (c.lastSeenUtc || 0) >= ZI.DECAY_CLOCK.heartbeatSec * 1000) { c.lastSeenUtc = now; ZI._saveDecayClock(c); }
};
// Engine housekeeping, about once per hour of open session time.
ZI.decayHousekeeping = function(now) {
  ZI.decayHeartbeat(now);
  if (now - ZI.getDecayClock(now).lastSettledUtc >= ZI.DECAY_CLOCK.settleEveryOpenSec * 1000) ZI.settleSkillDecay(now);
};
// Days of decay owed now: open time in full + closed time capped.
ZI.decayDaysOwed = function(now) {
  const c = ZI.getDecayClock(now), day = 86400000;
  const seen = Math.max(c.lastSettledUtc, Math.min(now, c.lastSeenUtc || c.lastSettledUtc));
  const open = Math.max(0, seen - c.lastSettledUtc), closed = Math.max(0, now - seen);
  return (open + Math.min(closed, ZI.DECAY.absenceCapDays * day)) / day;
};
ZI._settlingDecay = false;
ZI.settleSkillDecay = function(now) {
  now = now || ZI.clockNow();
  if (ZI._settlingDecay) return;
  const days = ZI.decayDaysOwed(now);
  if (days < ZI.DECAY_CLOCK.minSettleDays) return;
  ZI._settlingDecay = true;
  try {
    const x = ZI.getStatXp(); let changed = false;
    (ZI.PROFESSIONS || []).forEach(p => {
      const st = ZI.skillDecayState(p.id);
      if (ZI.skillRust(p.id).state === 'rusted' && (x[p.id] || 0) > (st.floorXp || 0)) {
        const L = ZI.statLevel(p.id);
        let rate = ZI.DECAY.minRate + (ZI.DECAY.maxRate - ZI.DECAY.minRate) * (L - 1) / 49;
        if (ZI.BASELINE_SKILLS.includes(p.id)) rate *= ZI.DECAY.baselineMult;
        // Base rest spot: a built Bunks slows decay of base-work skills by 25%.
        if (ZI.BASE_WORK_SKILLS.includes(p.id) && ZI.getCampSave && ((ZI.getCampSave().built || {}).bunks || 0) > 0) rate *= 0.75;
        const above = (x[p.id] || 0) - (st.floorXp || 0);
        x[p.id] = Math.round((st.floorXp || 0) + above * (1 - rate * days)); changed = true;
      }
    });
    if (changed) { try { localStorage.setItem(ZI.STAT_XP_KEY, JSON.stringify(x)); } catch (e) {} }
    ZI._saveDecayClock({ lastSettledUtc: now, lastSeenUtc: now });
  } finally { ZI._settlingDecay = false; }
};
// Settle when a skill's level is read (spec 10), throttled to the hourly cadence.
ZI._maybeSettleOnRead = function() {
  if (ZI._settlingDecay || !ZI.PROFESSIONS) return;
  const now = ZI.clockNow(), c = ZI._decayClockMem || ZI.getDecayClock(now);
  if (now - c.lastSettledUtc >= ZI.DECAY_CLOCK.settleEveryOpenSec * 1000) ZI.settleSkillDecay(now);
};
// Lasting injury from the attack: −10% effective level on combat & athletics, ~3 days or treatment.
ZI.getInjury = function() { const j = ZI._rj('zi_injury', null); return j && j.until > ZI.clockNow() ? j : null; };
ZI.setInjury = function(days) { ZI._wj('zi_injury', { skills:['combat','athletics'], pct:0.10, until: ZI.clockNow() + days * ZI.GAME_DAY_MS }); }; // game days (Oct 16)
ZI.treatInjury = function(days) { const j = ZI.getInjury(); if (!j) return; j.until -= days * ZI.GAME_DAY_MS; ZI._wj('zi_injury', j); };
// Rust + injury combined never exceed −20% (spec 13.8).
ZI.effectiveLevel = function(skill) {
  let eff = ZI.skillRust(skill).eff;
  const j = ZI.getInjury(); if (j && j.skills.includes(skill)) eff -= j.pct;
  return Math.max(1, Math.floor(ZI.statLevel(skill) * Math.max(0.8, eff)));
};
// Brief 12.6 #3: a failed attack costs 25% of max HP (never below 1 HP), × the difficulty multiplier.
ZI.SURVIVOR_MAX_HP = 100;
