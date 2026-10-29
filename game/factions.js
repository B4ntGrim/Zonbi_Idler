// game/factions.js — Factions, standing, contracts, hexagon, faction naming and unlock.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
// Everything attaches to the shared global ZI object; load-time calls live in game/bootstrap.js.

// ─── FACTIONS ─────────────────────────────────────────────────────────────────
ZI.FACTIONS = [
  { id: 'concordance', name: 'The Concordance',       color: '#c894ff', rep: 0,
    theme: 'RMAT Researchers', territory: 'Labs & Hazard Domes',
    synergy: ['I','S'], rank: 'Stranger',
    services: ['RMAT Stabilizers', 'Exotic Blueprints', 'Hazard Forecasting', 'Insight Class Manuals'] },
  { id: 'ironmarch',   name: 'The Iron March',         color: '#e0624c', rep: 240,
    theme: 'Militarized Defenders', territory: 'Bunkers & Checkpoints',
    synergy: ['V2','V'], rank: 'Known',
    services: ['Heavy Armor', 'Bulk Ammo', 'Defense Contracts', 'Fortified Safe Zones'] },
  { id: 'dustwalkers', name: 'The Dustwalkers',        color: '#e6c47e', rep: 90,
    theme: 'Scavengers & Explorers', territory: 'Industrial POIs & Metro Shanties',
    synergy: ['U','L'], rank: 'Stranger',
    services: ['Black Market', 'Loot Rerollers', 'Route Intel', 'Scavenging Mods'] },
  { id: 'hearthguard', name: 'The Hearthguard',        color: '#a2dca2', rep: 180,
    theme: 'Builders & Farmers', territory: 'Agricultural Settlements',
    synergy: ['A','V'], rank: 'Known',
    services: ['Camp Blueprints', 'Farming Tools', 'Food Production Bonuses', 'Profession Upskill'] },
  { id: 'blackhaven',  name: 'Black Haven Collective', color: '#b99be8', rep: 45,
    theme: 'Smugglers & Brokers', territory: 'Hidden Trade Dens',
    synergy: ['R','I'], rank: 'Stranger',
    services: ['Contraband RMAT', 'Weapon Mods', 'Underground Auctions', 'Illegal Contracts'] },
  { id: 'lodge',       name: 'Hearthbound Lodge',      color: '#f59e42', rep: 320,
    theme: 'Resupply & Forecasting', territory: 'Mountain Inns & Caravans',
    synergy: ['L','I','V'], rank: 'Trusted',
    services: ['Hearty Meals', 'Weather Forecast', 'Route Predictions', 'Market Rumors'] },
];

ZI.REP_RANKS = ['Stranger','Neutral','Known','Allied','Trusted','Honored','Venerated'];
ZI.REP_THRESHOLDS = [0, 100, 250, 500, 900, 1500, 2500];

// ─── FACTION CONTRACTS (Diplomat active loop) ────────────────────────────────
ZI.CONTRACTS = [
  { id:'c_iron_delivery', faction:'ironmarch', tier:'T2', type:'delivery', title:'Steel for the Forge',
    objective:{ metal:40 }, reward:{ diplomatXp:60, rep:15, materials:{ fuel:10 }, rmat:{ T2:2 } }, requires:{ diplomatLevel:2, rep:0 } },
  { id:'c_iron_clearance', faction:'ironmarch', tier:'T3', type:'clearance', title:'Thin the Horde',
    objective:{ kills:10, enemy:'Runner' }, reward:{ diplomatXp:90, rep:25, rmat:{ T3:1 } }, requires:{ diplomatLevel:4 } },
  { id:'c_conc_scavenge', faction:'concordance', tier:'T2', type:'scavenge', title:'Recover the Cache',
    objective:{ item:'Old Radio' }, reward:{ diplomatXp:70, rep:20, materials:{ electronics:15 } }, requires:{ diplomatLevel:3, equipped:['gasmask'] } },
  { id:'c_conc_escort', faction:'concordance', tier:'T3', type:'escort', title:'Safe Passage',
    objective:{ escort:1 }, reward:{ diplomatXp:100, rep:30, gear:'medkit' }, requires:{ diplomatLevel:5, equipped:['vest_t3'] } },
  { id:'c_free_bounty', faction:'freeholders', tier:'T4', type:'bounty', title:'Cull the Titan',
    objective:{ boss:'Titan Mutant' }, reward:{ diplomatXp:150, rep:40, rmat:{ T4:1 } }, requires:{ diplomatLevel:7 } },
];
ZI.getContract = function(id) { return ZI.CONTRACTS.find(c => c.id === id) || null; };
ZI.CONTRACT_KEY = 'zi_contracts';
ZI.CONTRACT_VER = 1;
ZI.getContractSave = function() {
  let s; try { s = JSON.parse(localStorage.getItem(ZI.CONTRACT_KEY) || 'null'); } catch (e) { s = null; }
  if (!s || s.v !== ZI.CONTRACT_VER) s = { v: ZI.CONTRACT_VER, active: [], repByFaction: {}, completedCount: 0 };
  return s;
};
ZI.saveContractSave = function(s) { try { localStorage.setItem(ZI.CONTRACT_KEY, JSON.stringify(s)); } catch (e) {} };
ZI.contractState = function(id) {
  const s = ZI.getContractSave();
  const a = s.active.find(x => x.id === id);
  return a ? a.state : 'OFFERED';
};
ZI.factionRep = function(faction) { return (ZI.getContractSave().repByFaction[faction] || 0); };
ZI.diplomatLevel = function() { return ZI.statLevel ? ZI.statLevel('diplomat') : 1; };
ZI.contractRequirementsMet = function(c) {
  const r = c.requires || {};
  if (r.diplomatLevel && ZI.diplomatLevel() < r.diplomatLevel) return false;
  if (r.rep && ZI.factionRep(c.faction) < r.rep) return false;
  return true;
};
// §4 — equip-gate check. Returns { ok, missing:[itemName] } for the current loadout.
ZI.contractEquipCheck = function(c) {
  const req = (c.requires && c.requires.equipped) || [];
  if (!req.length) return { ok:true, missing:[] };
  const lo = ZI.getLoadout ? ZI.getLoadout() : {};
  const equipped = new Set(Object.values(lo).filter(Boolean));
  const equippedTags = new Set();
  equipped.forEach(id => { const it = ZI.getGearItem(id); if (it && it.tags) it.tags.forEach(t => equippedTags.add(t)); });
  const missing = req.filter(need => !equipped.has(need) && !equippedTags.has(need))
    .map(need => { const it = ZI.getGearItem(need); return it ? it.name : need; });
  return { ok: missing.length === 0, missing };
};
// §4 — human-readable reason a contract can't be accepted yet (or null if ok).
ZI.contractBlockReason = function(c) {
  const r = c.requires || {};
  if (r.diplomatLevel && ZI.diplomatLevel() < r.diplomatLevel) return `Requires Diplomat Lv ${r.diplomatLevel}`;
  if (r.rep && ZI.factionRep(c.faction) < r.rep) return `Requires ${r.rep} reputation with this faction`;
  const eq = ZI.contractEquipCheck(c);
  if (!eq.ok) return `Requires equipped: ${eq.missing.join(', ')}`;
  return null;
};
ZI.acceptContract = function(id) {
  const c = ZI.getContract(id); if (!c) return { ok:false, reason:'Unknown contract' };
  const s = ZI.getContractSave();
  if (s.active.find(x => x.id === id)) return { ok:false, reason:'Already accepted' };
  const blocked = ZI.contractBlockReason(c);
  if (blocked) return { ok:false, reason: blocked };
  s.active.push({ id, state:'ACTIVE', progress:0, acceptedAt: Date.now() });
  ZI.saveContractSave(s);
  ZI.emitAction('contract.accept', 1, { faction: c.faction });
  return { ok:true };
};
ZI.progressContract = function(id, amount) {
  const s = ZI.getContractSave(); const a = s.active.find(x => x.id === id);
  if (!a || a.state !== 'ACTIVE') return;
  a.progress = (a.progress || 0) + (amount || 1);
  ZI.saveContractSave(s);
};
ZI.completeContract = function(id) {
  const c = ZI.getContract(id); if (!c) return false;
  const s = ZI.getContractSave(); const a = s.active.find(x => x.id === id);
  if (!a || a.state === 'COMPLETE') return false;
  a.state = 'COMPLETE';
  s.completedCount = (s.completedCount || 0) + 1;
  // Grant material/rmat/gear rewards through existing sinks.
  if (c.reward.materials && window.ZI_MATERIALS) Object.entries(c.reward.materials).forEach(([k, q]) => { const M = window.ZI_MATERIALS[k]; if (M) M.current = Math.min(M.max, M.current + q); });
  if (c.reward.rmat) Object.entries(c.reward.rmat).forEach(([k, q]) => ZI.addRmat(k, q));
  if (c.reward.gear && ZI.grantGear) ZI.grantGear(c.reward.gear, 1);
  ZI.saveContractSave(s);
  if (c.reward.rep && ZI.repApply) ZI.repApply(c.faction, c.reward.rep); // capped, clamped single rep path
  const tierScale = 1 + (ZI.TIER_META[c.tier] ? ZI.TIER_META[c.tier].rank : 1) * 0.3;
  ZI.emitAction('contract.complete', tierScale, { faction: c.faction });
  return true;
};

// ── Reputation: one store (repByFaction), negative tiers, ±50 cap, Lodge floor ──
ZI.REP_TIERS = [
  { min:-1000, name:'Hunted',   color:'#ff3b3b' }, { min:-600, name:'Hostile', color:'#f06a4a' },
  { min:-250,  name:'Wary',     color:'#e6a84a' },
  ...ZI.REP_RANKS.map((n, i) => ({ min: ZI.REP_THRESHOLDS[i], name: n, color: ['#b8b0a0','#d8d0b8','#e6d8a8','#a2dca2','#7fd88f','#7fe0ff','#ffd86a'][i] })),
];
// Live faction list for UI: rep from the single store; rank kept within REP_RANKS
// (so rank-progress maths stay valid) and 'standing' carries the negative tier name.
ZI.liveFactions = function() {
  return (ZI.FACTIONS || []).map(f => {
    const rep = ZI.getRep(f.id), t = ZI.repTier(rep);
    const rank = ZI.REP_RANKS.includes(t.name) ? t.name : ZI.REP_RANKS[0];
    const known = ZI.factionKnown(f.id);
    return Object.assign({}, f, { rep, rank, standing: t.name, standingColor: t.color, lodgeMarkup: f.id === 'lodge' ? ZI.LODGE_MARKUP : 0,
      known, name: known ? f.name : ZI.factionDisplayName(f.id), desc: known ? f.desc : 'You have heard of this group, but not their name. Later events will introduce them.' });
  });
};
// Lodge trades with anyone, at a steep markup (hexagon never applies to trade).
ZI.lodgePrice = function(base) { return Math.round(base * (1 + ZI.LODGE_MARKUP)); };
ZI.REP_MAX_EVENT = 50; ZI.LODGE_MIN_REP = -250; ZI.LODGE_MARKUP = 0.60;
ZI.seededHearthguardRep = function() { return Math.round(ZI.hash01(ZI.worldSeed(), 91, 17, 3) * 300 - 150); };
ZI.getRep = function(fid) {
  const s = ZI.getContractSave();
  let dirty = false;
  // Hearthguard: no explicit stored standing = uninitialized → seed-derived value in −150..+150, persisted.
  // An explicit stored value is never changed. The obsolete static 180 is never used (decided).
  if (s.repByFaction.hearthguard == null) {
    s.repByFaction.hearthguard = ZI.seededHearthguardRep(); dirty = true;
  }
  if (!s._repSeeded) { // one-time: fold the old static faction rep into the single store (other factions)
    (ZI.FACTIONS || []).forEach(f => { if (f.id !== 'hearthguard' && s.repByFaction[f.id] == null) s.repByFaction[f.id] = f.rep || 0; });
    if (s.repByFaction.freeholders != null) { s.repByFaction.hearthguard = (s.repByFaction.hearthguard || 0) + s.repByFaction.freeholders; delete s.repByFaction.freeholders; }
    s._repSeeded = true; dirty = true;
  }
  if (dirty) ZI.saveContractSave(s);
  return s.repByFaction[fid] || 0;
};
ZI.repTier = function(v) { let t = ZI.REP_TIERS[0]; ZI.REP_TIERS.forEach(x => { if (v >= x.min) t = x; }); return t; };
ZI.repApply = function(fid, delta) {
  ZI.getRep(fid);
  const s = ZI.getContractSave();
  let d = Math.max(-ZI.REP_MAX_EVENT, Math.min(ZI.REP_MAX_EVENT, Math.round(delta)));
  if (d < 0) d = Math.round(d * 1.25); // losing standing is faster than gaining it
  let v = Math.max(-1000, Math.min(2500, (s.repByFaction[fid] || 0) + d));
  if (fid === 'lodge') v = Math.max(ZI.LODGE_MIN_REP, v); // the Lodge never goes Hostile
  s.repByFaction[fid] = v; s.repLastOffense = s.repLastOffense || {};
  if (d < 0) s.repLastOffense[fid] = ZI.clockNow();
  ZI.saveContractSave(s);
  return v;
};
// Slow forgiveness: negative standing drifts +10/day toward 0 after 2 offense-free days.
ZI.settleRepForgiveness = function() {
  const s = ZI.getContractSave(); const last = s.repForgiveAt || ZI.clockNow(); const now = ZI.clockNow();
  const days = Math.min(1, (now - last) / 86400000); if (days < 0.01) return;
  (ZI.FACTIONS || []).forEach(f => {
    const v = s.repByFaction[f.id] || 0, off = (s.repLastOffense || {})[f.id] || 0;
    if (v < 0 && now - off > 2 * 86400000) s.repByFaction[f.id] = Math.min(0, Math.round(v + 10 * days));
  });
  s.repForgiveAt = now; ZI.saveContractSave(s);
};
(ZI.CONTRACTS || []).forEach(c => { if (c.faction === 'freeholders') c.faction = 'hearthguard'; }); // 'freeholders' isn't one of the six

// ── Hexagon: each faction strong vs the next clockwise, weak vs the previous ──
ZI.HEX_ORDER = ['ironmarch','dustwalkers','blackhaven','concordance','hearthguard','lodge'];
ZI.HEX_MOD = 15; // ± points of fight/evade odds
ZI.alignedFaction = function() {
  let best = null, bv = -Infinity;
  ZI.HEX_ORDER.forEach(f => { const v = ZI.getRep(f); if (v > bv) { bv = v; best = f; } });
  return best;
};
ZI.hexModifier = function(mine, theirs) {
  const a = ZI.HEX_ORDER.indexOf(mine), b = ZI.HEX_ORDER.indexOf(theirs), n = ZI.HEX_ORDER.length;
  if (a < 0 || b < 0 || a === b) return 0;
  if ((a + 1) % n === b) return ZI.HEX_MOD;
  if ((b + 1) % n === a) return -ZI.HEX_MOD;
  return 0;
};
// Factions the survivor knows by name. Others show as unnamed groups (brief 11.4).
ZI.factionKnown = function(fid) {
  const known = ZI._rj('zi_factions_known', null);
  return (known || [ZI.FORT_FACTION]).includes(fid); // the Hearthguard are met by name at their gate
};
ZI.factionDisplayName = function(fid) {
  const f = (ZI.FACTIONS || []).find(x => x.id === fid);
  if (ZI.factionKnown(fid)) return f ? f.name : fid;
  const others = ZI.HEX_ORDER.filter(id => id !== ZI.FORT_FACTION); // five groups → letters A–E, fixed per faction
  return 'Unnamed group ' + String.fromCharCode(65 + Math.max(0, others.indexOf(fid)));
};
ZI.factionsUnlocked = function() { return ZI._rj('zi_factions_unlocked', null); }; // null | 'friendly' | 'hostile'
