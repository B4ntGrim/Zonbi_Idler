// game/economy.js — Materials (ZI_MATERIALS), RMAT wallet, Wandering loot bank, recycler, market shop.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
// Everything attaches to the shared global ZI object; load-time calls live in game/bootstrap.js.

// ─── WANDERING LOOT BANK → RECYCLER FEED ─────────────────────────────────────
// Items gathered in Wandering are banked here on extraction/retreat and surfaced
// in the Recycler's inventory for breakdown into simpler materials.
ZI.WANDER_LOOT_KEY = 'zi_wander_loot';
ZI.getWanderLoot = function() {
  try { return JSON.parse(localStorage.getItem(ZI.WANDER_LOOT_KEY) || '[]'); }
  catch (e) { return []; }
};
// Convert a carried run-item { name, value, rarity } into a recycler item with
// material outputs scaled by value/rarity.
ZI.toRecyclerItem = function(it) {
  const rarityTier = { Common:1, Uncommon:2, Rare:3, Epic:4, Legendary:5 };
  const tier = rarityTier[it.rarity] || 1;
  const v = Math.max(1, it.value || 1);
  const n = (it.name || '').toLowerCase();
  const outputs = {};
  if (/rifle|pistol|gun|blade|knife|hatchet|wrench|pipe|metal|scrap|can|gear/.test(n)) outputs.metal = Math.max(1, Math.round(v * 0.4));
  if (/radio|monitor|battery|electronic|circuit|wire|chip/.test(n)) outputs.electronics = Math.max(1, Math.round(v * 0.5));
  if (/hoodie|cloth|rag|bandage|fabric|tarp/.test(n)) outputs.cloth = Math.max(1, Math.round(v * 0.6));
  if (/wood|plank|stock|handle/.test(n)) outputs.wood = Math.max(1, Math.round(v * 0.5));
  if (/gas|fuel/.test(n)) outputs.fuel = Math.max(1, Math.round(v * 0.3));
  if (/bandage|medical|med|pill|syringe/.test(n)) outputs.medical = Math.max(1, Math.round(v * 0.3));
  if (Object.keys(outputs).length === 0) outputs.metal = Math.max(1, Math.round(v * 0.5)); // generic salvage → metal
  const bankedAt = ZI.buffMoment ? ZI.buffMoment() : ZI.clockNow(); // simulated extraction time during catch-up
  return {
    id: 'w' + bankedAt + Math.floor(ZI.roll('ids') * 1e6), // H1 (A2): live = Math.random(); harness = seeded 'ids' stream
    name: it.name || 'Salvage',
    tier,
    rarity: it.rarity || 'Common', // preserve canonical rarity word for tierOf()
    weight: typeof it.weight === 'number' ? it.weight : ZI.salvageWeight(v), // canonical salvage weight (Batch 3A)
    outputs,
    fromWandering: true,
    bankedAt, // for "Newest banked" sort
  };
};
ZI.bankWanderLoot = function(items) {
  if (!items || !items.length) return;
  const bank = ZI.getWanderLoot();
  for (const it of items) bank.push(ZI.toRecyclerItem(it));
  try { localStorage.setItem(ZI.WANDER_LOOT_KEY, JSON.stringify(bank)); } catch (e) {}
};
ZI.consumeWanderLoot = function(id) {
  const bank = ZI.getWanderLoot().filter(i => i.id !== id);
  try { localStorage.setItem(ZI.WANDER_LOOT_KEY, JSON.stringify(bank)); } catch (e) {}
};

// ─── RECYCLER VIEW (consolidated filter/sort dropdown — persisted) ───────────
ZI.RECYCLER_VIEW_KEY = 'zi_recycler_view';
ZI.getRecyclerView = function() {
  let v; try { v = JSON.parse(localStorage.getItem(ZI.RECYCLER_VIEW_KEY) || 'null'); } catch (e) { v = null; }
  return Object.assign({ filter: 'all', sort: 'tier' }, v || {});
};
ZI.saveRecyclerView = function(v) {
  try { localStorage.setItem(ZI.RECYCLER_VIEW_KEY, JSON.stringify(v)); } catch (e) {}
};
// Filter options with the minimum tier rank each requires. Gated by the
// Scavenging stat's existing rarity-filter unlocks.
ZI.RECYCLER_FILTERS = [
  { id: 'all',   label: 'All tiers', minRank: 0 },
  { id: 't0',    label: 'T0 only',   minRank: 0, exact: 0 },
  { id: 't1up',  label: 'T1+',       minRank: 1 },
  { id: 't3up',  label: 'T3+',       minRank: 3 },
  { id: 't5',    label: 'T5 only',   minRank: 5, exact: 5 },
];
// Which tier ranks the player has unlocked filtering for, via Scavenging level.
ZI.unlockedFilterRanks = function() {
  const lvl = (ZI.statLevel && ZI.statLevel('scavenging')) || 1;
  const words = (ZI.STAT_FORMULAS && ZI.STAT_FORMULAS.scavengingFilters(lvl)) || ['Common'];
  // Map unlocked rarity words → ranks; T0 (floor) is always available.
  const ranks = new Set([0]);
  words.forEach(w => { const t = ZI.RARITY_TO_TIER[w.toLowerCase()]; if (t) ranks.add(ZI.TIER_META[t].rank); });
  return ranks;
};
ZI.isFilterUnlocked = function(filter) {
  if (!filter || filter.minRank <= 0) return true;
  return ZI.unlockedFilterRanks().has(filter.minRank);
};
// Apply a saved view (filter+sort) to a list of recycler items.
ZI.applyRecyclerView = function(items, view) {
  const f = ZI.RECYCLER_FILTERS.find(x => x.id === view.filter) || ZI.RECYCLER_FILTERS[0];
  let out = (items || []).filter(it => {
    const rank = ZI.tierRank(it);
    if (f.exact != null) return rank === f.exact;
    return rank >= (f.minRank || 0);
  });
  const sort = view.sort || 'tier';
  out = out.slice().sort((a, b) => {
    if (sort === 'weight') return (a.weight || 0) - (b.weight || 0);
    if (sort === 'newest') return (b.bankedAt || 0) - (a.bankedAt || 0);
    return ZI.tierRank(b) - ZI.tierRank(a); // tier high→low (default)
  });
  return out;
};

// ─── MARKET SHOP (gated vendor sub-view) ─────────────────────────────────────
// Market view persistence (Auction ⇄ Shop).
ZI.MARKET_VIEW_KEY = 'zi_market_view';
ZI.getMarketView = function() {
  try { return localStorage.getItem(ZI.MARKET_VIEW_KEY) || 'auction'; } catch (e) { return 'auction'; }
};
ZI.saveMarketView = function(v) { try { localStorage.setItem(ZI.MARKET_VIEW_KEY, v); } catch (e) {} };

// Canonical RMAT wallet (single source; default zeros). Keyed by T-tier.
ZI.RMAT_HOLD_KEY = 'zi_rmat';
ZI.getRmatHoldings = function() {
  let h; try { h = JSON.parse(localStorage.getItem(ZI.RMAT_HOLD_KEY) || 'null'); } catch (e) { h = null; }
  return Object.assign({ T0:0, T1:0, T2:0, T3:0, T4:0, T5:0 }, h || {});
};
ZI.addRmat = function(tierKeyOrRank, qty) {
  const key = typeof tierKeyOrRank === 'number' ? 'T' + Math.max(0, Math.min(5, tierKeyOrRank)) : tierKeyOrRank;
  if (!/^T[0-5]$/.test(key)) return;
  const h = ZI.getRmatHoldings(); h[key] = (h[key] || 0) + (qty || 0);
  try { localStorage.setItem(ZI.RMAT_HOLD_KEY, JSON.stringify(h)); } catch (e) {}
};
// ─── TOP BAR RESOURCES (Oct 27) ─────────────────────────────────────────────
// The one backend reader for the header's resource strip, in display order. Read-only; the top bar polls it.
// Each entry: { current, max, rate, pending }. pending = the system isn't built yet; the chip shows "—".
//   Nutrition — ZI.getNutrition() → { current, max } (FOOD-01 meter, 0–100). Not built yet.
//   Food      — camp food: Food-slot items in the base stash (FOOD-01 O9).
//   Ammo      — ZI.getAmmo() → number. No ammo store exists yet.
//   Fuel      — ZI_MATERIALS.fuel (saved material).
//   RMAT      — RMAT wallet, all tiers T0–T5.
ZI.getTopBarResources = function() {
  const out = {};
  const nut = typeof ZI.getNutrition === 'function' ? ZI.getNutrition() : null;
  out.Nutrition = nut && Number.isFinite(nut.current)
    ? { current: nut.current, max: nut.max || 100, rate: 0, pending: false }
    : { current: 0, max: 100, rate: 0, pending: true };
  let food = 0;
  try {
    const isFood = id => { const g = ZI.getGearItem && ZI.getGearItem(id); return !!g && g.slot === 'consumable3'; };
    (ZI.getStash ? ZI.getStash() : []).forEach(id => { if (isFood(id)) food++; });
  } catch (e) {}
  out.Food = { current: food, max: 0, rate: 0, pending: false };
  const ammo = typeof ZI.getAmmo === 'function' ? ZI.getAmmo() : null;
  out.Ammo = Number.isFinite(ammo) ? { current: ammo, max: 0, rate: 0, pending: false } : { current: 0, max: 0, rate: 0, pending: true };
  const F = window.ZI_MATERIALS && window.ZI_MATERIALS.fuel;
  out.Fuel = { current: F ? F.current : 0, max: F ? F.max : 0, rate: 0, pending: !F };
  const h = ZI.getRmatHoldings();
  out.RMAT = { current: ['T0','T1','T2','T3','T4','T5'].reduce((a, k) => a + (h[k] || 0), 0), max: 0, rate: 0, pending: false };
  return out;
};
ZI.rmatReachedRank = function() {
  const h = ZI.getRmatHoldings();
  let max = 0;
  ['T0','T1','T2','T3','T4','T5'].forEach(k => { if ((h[k] || 0) > 0) max = Math.max(max, ZI.TIER_META[k].rank); });
  return max;
};

// Purchased set (versioned, list-based — mirrors zi_stash).
ZI.SHOP_KEY = 'zi_shop';
ZI.SHOP_VER = 1;
ZI.getShopSave = function() {
  let s; try { s = JSON.parse(localStorage.getItem(ZI.SHOP_KEY) || 'null'); } catch (e) { s = null; }
  if (!s || s.v !== ZI.SHOP_VER) s = { v: ZI.SHOP_VER, owned: [], levels: {} };
  return s;
};
ZI.saveShopSave = function(s) { try { localStorage.setItem(ZI.SHOP_KEY, JSON.stringify(s)); } catch (e) {} };
ZI.shopOwned = function(id) { return ZI.getShopSave().owned.includes(id); };
ZI.shopLevel = function(id) { return ZI.getShopSave().levels[id] || 0; };

// Gate evaluator — AND of provided req keys (omitted keys ignored).
ZI.shopReqMet = function(entry) {
  const r = entry.req || {};
  if (r.rmatTier != null) { const need = ZI.TIER_META[r.rmatTier] ? ZI.TIER_META[r.rmatTier].rank : 0; if (ZI.rmatReachedRank() < need) return false; }
  if (r.rmatCount) { const h = ZI.getRmatHoldings(); if ((h[r.rmatCount.tier] || 0) < r.rmatCount.qty) return false; }
  if (r.distance != null && ZI.getLifetimeDistance() < r.distance) return false;
  if (r.lap != null && ZI.getLifetimeLap() < r.lap) return false;
  return true;
};
ZI.shopState = function(entry) {
  const lvl = ZI.shopLevel(entry.id);
  if (entry.repeatable) {
    const max = (entry.grant && entry.grant.maxLevel) || 1;
    if (lvl >= max) return 'owned';
  } else if (ZI.shopOwned(entry.id)) {
    return 'owned';
  }
  return ZI.shopReqMet(entry) ? 'unlocked' : 'locked';
};
ZI.shopProgress = function(entry) {
  const r = entry.req || {}, out = {};
  if (r.distance != null) out.distance = { cur: ZI.getLifetimeDistance(), req: r.distance };
  if (r.lap != null) out.lap = { cur: ZI.getLifetimeLap(), req: r.lap };
  if (r.rmatCount) out.rmat = { cur: (ZI.getRmatHoldings()[r.rmatCount.tier] || 0), req: r.rmatCount.qty, tier: r.rmatCount.tier };
  else if (r.rmatTier != null) out.rmat = { cur: ZI.rmatReachedRank(), req: (ZI.TIER_META[r.rmatTier] || {}).rank || 0, tier: r.rmatTier, isTierReach: true };
  return out;
};
// Fraction [0..1] toward the gate (min across conditions) — for "nearest unlock".
ZI.shopGateFraction = function(entry) {
  const p = ZI.shopProgress(entry); let frac = 1;
  Object.values(p).forEach(c => { if (c.req > 0) frac = Math.min(frac, c.cur / c.req); });
  return Math.max(0, Math.min(1, frac));
};
// Apply a purchase's grant (ready for when a cost model is chosen).
ZI.shopBuy = function(entry) {
  const g = entry.grant || {};
  if (g.kind === 'gear' && ZI.grantGear) ZI.grantGear(g.itemId, g.qty || 1);
  else if (g.kind === 'recipe') ZI.unlockShopRecipe(g.recipeId);
  else if (g.kind === 'capacity') ZI.applyCapacity(g.field, g.amount);
  else if (g.kind === 'flag') ZI.setProfileFlag(g.flag, g.value);
  const s = ZI.getShopSave();
  if (entry.repeatable) s.levels[entry.id] = (s.levels[entry.id] || 0) + 1;
  else if (!s.owned.includes(entry.id)) s.owned.push(entry.id);
  ZI.saveShopSave(s);
  if (ZI.emitAction) ZI.emitAction('transaction', 1 + (ZI.TIER_META[entry.tier] ? ZI.TIER_META[entry.tier].rank : 0) * 0.4);
};
// Grant sinks (single stores; consumed by their systems when wired).
ZI.unlockShopRecipe = function(id) { try { const k='zi_unlocked_recipes'; const set=JSON.parse(localStorage.getItem(k)||'[]'); if(!set.includes(id)){set.push(id);localStorage.setItem(k,JSON.stringify(set)); if(ZI.emitAction) ZI.emitAction('discover');} } catch(e){} };
ZI.isRecipeUnlocked = function(id) { try { return JSON.parse(localStorage.getItem('zi_unlocked_recipes')||'[]').includes(id); } catch(e){ return false; } };
ZI.applyCapacity = function(field, amount) { try { const k='zi_caps'; const c=JSON.parse(localStorage.getItem(k)||'{}'); c[field]=(c[field]||0)+(amount||0); localStorage.setItem(k,JSON.stringify(c)); } catch(e){} };
ZI.getCapacity = function(field) { try { return (JSON.parse(localStorage.getItem('zi_caps')||'{}'))[field]||0; } catch(e){ return 0; } };
ZI.setProfileFlag = function(flag, value) { try { const k='zi_flags'; const f=JSON.parse(localStorage.getItem(k)||'{}'); f[flag]=value; localStorage.setItem(k,JSON.stringify(f)); } catch(e){} };
ZI.getProfileFlag = function(flag) { try { return (JSON.parse(localStorage.getItem('zi_flags')||'{}'))[flag]; } catch(e){ return undefined; } };
// Count entries newly unlocked but not yet owned (for the dropdown badge).
ZI.shopNewUnlockCount = function() {
  return (ZI.SHOP_ITEMS || []).filter(e => ZI.shopState(e) === 'unlocked').length;
};

// Curated vendor catalog. cost is RESERVED (see spec §6) — Buy stays disabled
// until a currency is chosen. Gates are an AND of the provided req keys.
ZI.SHOP_ITEMS = [
  // ── Blueprints (goals) ──
  { id:'bp_forged_plate', name:'Blueprint: Forged Plate', cat:'blueprint', tier:'T3', icon:'▤',
    desc:'Unlocks the Forged Plate armor recipe in Crafting.', req:{ rmatTier:'T3', distance:3000 },
    cost:null, grant:{ kind:'recipe', recipeId:'plate_carrier' }, repeatable:false },
  { id:'bp_arc_carbine', name:'Blueprint: Arc Carbine', cat:'blueprint', tier:'T3', icon:'▤',
    desc:'Unlocks the Arc Carbine ranged recipe.', req:{ rmatTier:'T2', lap:3 },
    cost:null, grant:{ kind:'recipe', recipeId:'arc_carbine' }, repeatable:false },
  { id:'bp_void_rifle', name:'Blueprint: Void Pulse Rifle', cat:'blueprint', tier:'T5', icon:'▤',
    desc:'Apex ranged blueprint. The last thing they hear.', req:{ rmatTier:'T5', distance:12000 },
    cost:null, grant:{ kind:'recipe', recipeId:'void_pulse_rifle' }, repeatable:false },
  // ── Capacity (power sinks, repeatable) ──
  { id:'cap_backpack', name:'Backpack Reinforcement', cat:'capacity', tier:'T1', icon:'▦',
    desc:'+10kg carry weight per level.', req:{ distance:1000 },
    cost:null, grant:{ kind:'capacity', field:'backpackKg', amount:10, maxLevel:5 }, repeatable:true },
  { id:'cap_stash', name:'Stash Expansion', cat:'capacity', tier:'T2', icon:'▦',
    desc:'+4 stash slots per level.', req:{ rmatTier:'T2', distance:2500 },
    cost:null, grant:{ kind:'capacity', field:'stashSlots', amount:4, maxLevel:5 }, repeatable:true },
  { id:'cap_squad', name:'Squad Billet', cat:'capacity', tier:'T3', icon:'▦',
    desc:'+1 max squad size per level (up to 4).', req:{ rmatTier:'T3', lap:5 },
    cost:null, grant:{ kind:'capacity', field:'squadMax', amount:1, maxLevel:3 }, repeatable:true },
  { id:'cap_recycler', name:'Recycler Tune-Up', cat:'capacity', tier:'T2', icon:'▦',
    desc:'+0.2 Recycler operator speed per level.', req:{ rmatTier:'T1', distance:2000 },
    cost:null, grant:{ kind:'capacity', field:'recyclerOpSpeed', amount:0.2, maxLevel:5 }, repeatable:true },
  // ── Gear & consumables (convenience) ──
  { id:'shop_vest_t3', name:'SAPI Plate Carrier', cat:'gear', tier:'T4', icon:'🦺',
    desc:'Vendor-stocked legendary vest, straight to your stash.', req:{ rmatTier:'T4', distance:8000 },
    cost:null, grant:{ kind:'gear', itemId:'vest_t3', qty:1 }, repeatable:false },
  { id:'shop_medkits', name:'Field Medkit ×3', cat:'consumable', tier:'T1', icon:'🧰',
    desc:'Three medkits delivered to your loadout stash.', req:{ distance:1500 },
    cost:null, grant:{ kind:'gear', itemId:'medkit', qty:3 }, repeatable:true },
  { id:'shop_stims', name:'Adrenaline Shot ×2', cat:'consumable', tier:'T2', icon:'💉',
    desc:'Two adrenaline shots for the next push.', req:{ lap:2 },
    cost:null, grant:{ kind:'gear', itemId:'stimpack', qty:2 }, repeatable:true },
  // ── Cosmetics / QoL (prestige) ──
  { id:'cos_amber_term', name:'Amber Terminal Skin', cat:'cosmetic', tier:'T3', icon:'✦',
    desc:'Recolors the UI terminal to warm amber. Pure flex.', req:{ lap:4 },
    cost:null, grant:{ kind:'flag', flag:'terminalSkin', value:'amber' }, repeatable:false },
  { id:'qol_autorecycle', name:'Auto-Recycle T0', cat:'qol', tier:'T2', icon:'⚙',
    desc:'Automatically recycle banked T0 salvage.', req:{ distance:4000 },
    cost:null, grant:{ kind:'flag', flag:'autoRecycleT0', value:true }, repeatable:false },
  { id:'cos_echo_palette', name:'Echo Sprite Palette', cat:'cosmetic', tier:'T5', icon:'✦',
    desc:'Reality-warped sprite palette. Deep-haul prestige marker.', req:{ rmatTier:'T5', distance:15000 },
    cost:null, grant:{ kind:'flag', flag:'spritePalette', value:'echo' }, repeatable:false },
];

// ─── MATERIAL ECONOMY ─────────────────────────────────────────────────────────
// ROOT CAUSE FIX: this object was plain in-memory JS, never persisted — so any
// page reload reset it to these hardcoded defaults while zi_jobs (localStorage)
// kept whatever had already completed, making a correctly-granted recycle job
// look like it "vanished without crediting materials" once the page reloaded.
// Every mutation (`M[key].current = ...`, used throughout the codebase) now
// auto-persists via a Proxy, and values are restored from storage on load.
window.ZI_MATERIALS = (function() {
  const defs = {
    metal:       { name:'Metal',       icon:'⚙', color:'#b4c2cf', current:0, max:500, sources:['Scrap autos','Industrial loot','Demolition'] },
    wood:        { name:'Wood',        icon:'🪵', color:'#c49a5e', current:0, max:500, sources:['Forest scavenge','Demolition','Furniture'] },
    cloth:       { name:'Cloth',       icon:'🧵', color:'#9fb0cc', current:0, max:300, sources:['Clothing items','Sheets','Tarps'] },
    electronics: { name:'Electronics', icon:'⚡', color:'#6ab0e0', current:0,  max:200, sources:['Appliances','Vehicles','Lab loot'] },
    fuel:        { name:'Fuel',        icon:'🔥', color:'#e07a30', current:0, max:300, sources:['Vehicle siphons','Generators','Caches'] },
    medical:     { name:'Medical',     icon:'💊', color:'#50c878', current:0,  max:150, sources:['Hospital loot','Pharmacy','Crafted'] },
  };
  const KEY = 'zi_materials';
  let persisted = {};
  try { persisted = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { persisted = {}; }
  Object.keys(defs).forEach(k => { if (typeof persisted[k] === 'number') defs[k].current = persisted[k]; });
  const save = () => {
    try {
      const snap = {}; Object.keys(defs).forEach(k => { snap[k] = defs[k].current; });
      localStorage.setItem(KEY, JSON.stringify(snap));
    } catch (e) {}
  };
  const wrapped = {};
  Object.keys(defs).forEach(k => {
    wrapped[k] = new Proxy(defs[k], {
      set(target, prop, value) { target[prop] = value; if (prop === 'current') save(); return true; },
    });
  });
  return wrapped;
})();

// ─── RECYCLER OPERATORS + QUEUEING (Bugs 2 and 3) ────────────────────────────
// Operator roster (moved from the Recycler screen so game rules can check it). Camp survivors may only run the
// Recycler in Camp Leader mode; in any other mode the lone survivor runs it themselves.
ZI.RECYCLER_OPERATORS = [
  { id:'mira', name:'Mira Chen',    class:'mechanic', level:8,  speed:1.5, bonusMult:1.2,  type:'Camp Survivor' },
  { id:'felix',name:'Felix Ortega', class:'mechanic', level:9,  speed:1.6, bonusMult:1.25, type:'Camp Survivor' },
  { id:'solo', name:'The Wanderer', class:'ranger',   level:14, speed:1.0, bonusMult:1.0,  type:'Solo Survivor' },
];
// Authoritative mode = the mode of the active save slot ('camp' | 'solo'); no active slot counts as not Camp Leader.
ZI.currentGameMode = function() { const a = ZI.getActiveSlot && ZI.getActiveSlot(); return a && a.mode ? a.mode : null; };
ZI.availableRecyclerOperators = function(mode) {
  const m = mode === undefined ? ZI.currentGameMode() : mode;
  return ZI.RECYCLER_OPERATORS.filter(o => m === 'camp' ? true : o.type !== 'Camp Survivor');
};
ZI.defaultRecyclerOperator = function(mode) { const m = mode === undefined ? ZI.currentGameMode() : mode; return m === 'camp' ? 'mira' : 'solo'; };
ZI.canUseRecyclerOperator = function(opId, mode) { return ZI.availableRecyclerOperators(mode).some(o => o.id === opId); };
// Queue one item on the normal recycle job lane. Same duration/output maths the screen used before.
ZI.queueRecycle = function(item, opId, mode) {
  if (!ZI.canUseRecyclerOperator(opId, mode)) return { ok:false, reason:'operator not available in this mode' };
  if (!ZI.isRecyclable(item)) return { ok:false, reason:'not recyclable' };
  const op = ZI.RECYCLER_OPERATORS.find(o => o.id === opId);
  const effSpeed = op.speed + (ZI.recyclerOpSpeedBonus ? ZI.recyclerOpSpeedBonus() : 0);
  const duration = item.weight * 14000 / effSpeed / 1000; // enqueueJob wants seconds
  const boosted = Object.assign({}, item, { outputs: Object.fromEntries(Object.entries(item.outputs).map(([k, v]) => [k, Math.floor(v * op.bonusMult)])) });
  const job = ZI.enqueueJob('recycle', item.id, duration, { item: boosted }, 1);
  return { ok:true, job };
};
// Eligible = has material outputs, is not a story item, and is not already in the recycle queue.
ZI.isRecyclable = function(item) {
  if (!item || !item.outputs || !Object.values(item.outputs).some(v => v > 0)) return false;
  if (item.isStory || (ZI.isStoryItem && (ZI.isStoryItem(item.id) || (item.gearId && ZI.isStoryItem(item.gearId))))) return false;
  return !ZI.jobsByType('recycle').some(j => j.refId === item.id);
};
// Recycle All: queues every eligible item through queueRecycle (the normal job lane and grantRecycleOutput).
ZI.recycleAll = function(items, opId, mode) {
  const queued = [], skipped = [], seen = new Set();
  (items || []).forEach(it => {
    if (!it || seen.has(it.id)) { if (it) skipped.push(it.id); return; }
    seen.add(it.id);
    const r = ZI.queueRecycle(it, opId, mode);
    (r.ok ? queued : skipped).push(it.id);
  });
  return { queued, skipped };
};
