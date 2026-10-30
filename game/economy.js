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
    const max = entry.grant && entry.grant.maxLevel; // no maxLevel = buy again any time (consumables)
    if (max && lvl >= max) return 'owned';
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
// ─── SHOP PURCHASES (Oct 27, Sam: "implement the Shop purchases") ───────────────────────────────────────
// Currency is RMAT [DECIDED Oct 25]. entry.cost = { T2: 10 } (RMAT tier → amount). Levelled capacity items
// (costScale 'level') cost cost × next level. Every price except the circuit toggle is a starting value.
ZI.shopPrice = function(entry) {
  const base = entry.cost || null; if (!base) return null;
  const mult = entry.costScale === 'level' ? ZI.shopLevel(entry.id) + 1 : 1;
  const out = {}; Object.entries(base).forEach(([k, q]) => { out[k] = q * mult; }); return out;
};
ZI.shopCanAfford = function(entry) {
  const price = ZI.shopPrice(entry); if (!price) return false;
  const h = ZI.getRmatHoldings();
  return Object.entries(price).every(([k, q]) => (h[k] || 0) >= q);
};
ZI.shopPriceText = function(entry) {
  const price = ZI.shopPrice(entry); if (!price) return 'Not priced';
  return Object.entries(price).map(([k, q]) => `${q} ${k} RMAT${ZI.RMAT_TIERS && ZI.RMAT_TIERS[+k.slice(1)] ? ' (' + ZI.RMAT_TIERS[+k.slice(1)].name + ')' : ''}`).join(' + ');
};
// The one purchase path: checks the gate and the wallet, takes the RMAT, then applies the grant.
ZI.shopPurchase = function(entry) {
  if (!entry) return { ok:false, reason:'Unknown item.' };
  const st = ZI.shopState(entry);
  if (st === 'owned') return { ok:false, reason:'Already owned.' };
  if (st === 'locked') return { ok:false, reason:'Not unlocked yet.' };
  const price = ZI.shopPrice(entry);
  if (!price) return { ok:false, reason:'Not priced yet.' };
  if (!ZI.shopCanAfford(entry)) return { ok:false, reason:`Needs ${ZI.shopPriceText(entry)}.` };
  if (entry.grant && entry.grant.kind === 'gear' && !(ZI.getGearItem && ZI.getGearItem(entry.grant.itemId))) return { ok:false, reason:'That item is missing from the game data.' };
  Object.entries(price).forEach(([k, q]) => ZI.addRmat(k, -q));
  ZI.shopBuy(entry);
  return { ok:true, price, text:`Bought ${entry.name} for ${Object.entries(price).map(([k, q]) => q + ' ' + k).join(' + ')} RMAT.` };
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

// Curated vendor catalog. cost = RMAT by tier (currency [DECIDED Oct 25]); prices are starting values for the
// economy check except the circuit toggle (10 T2, [DECIDED Oct 25]). Gates are an AND of the provided req keys.
ZI.SHOP_ITEMS = [
  // ── Blueprints (goals) ──
  { id:'bp_forged_plate', name:'Blueprint: Forged Plate', cat:'blueprint', tier:'T3', icon:'▤',
    desc:'Unlocks the Forged Plate armor recipe in Crafting.', req:{ rmatTier:'T3', distance:3000 },
    cost:{ T3:6 }, grant:{ kind:'recipe', recipeId:'plate_carrier' }, repeatable:false },
  { id:'bp_arc_carbine', name:'Blueprint: Arc Carbine', cat:'blueprint', tier:'T3', icon:'▤',
    desc:'Unlocks the Arc Carbine ranged recipe.', req:{ rmatTier:'T2', lap:3 },
    cost:{ T2:12 }, grant:{ kind:'recipe', recipeId:'arc_carbine' }, repeatable:false },
  { id:'bp_void_rifle', name:'Blueprint: Void Pulse Rifle', cat:'blueprint', tier:'T5', icon:'▤',
    desc:'Apex ranged blueprint. The last thing they hear.', req:{ rmatTier:'T5', distance:12000 },
    cost:{ T5:4 }, grant:{ kind:'recipe', recipeId:'void_pulse_rifle' }, repeatable:false },
  // ── Capacity (power sinks, repeatable) ──
  { id:'cap_backpack', name:'Backpack Reinforcement', cat:'capacity', tier:'T1', icon:'▦',
    desc:'+10kg carry weight per level.', req:{ distance:1000 },
    cost:{ T1:5 }, costScale:'level', grant:{ kind:'capacity', field:'backpackKg', amount:10, maxLevel:5 }, repeatable:true },
  { id:'cap_stash', name:'Stash Expansion', cat:'capacity', tier:'T2', icon:'▦',
    desc:'+4 stash slots per level.', req:{ rmatTier:'T2', distance:2500 },
    cost:{ T2:4 }, costScale:'level', grant:{ kind:'capacity', field:'stashSlots', amount:4, maxLevel:5 }, repeatable:true },
  { id:'cap_squad', name:'Squad Billet', cat:'capacity', tier:'T3', icon:'▦',
    desc:'+1 max squad size per level (up to 4).', req:{ rmatTier:'T3', lap:5 },
    cost:{ T3:3 }, costScale:'level', grant:{ kind:'capacity', field:'squadMax', amount:1, maxLevel:3 }, repeatable:true },
  { id:'cap_recycler', name:'Recycler Tune-Up', cat:'capacity', tier:'T2', icon:'▦',
    desc:'+0.2 Recycler operator speed per level.', req:{ rmatTier:'T1', distance:2000 },
    cost:{ T1:6 }, costScale:'level', grant:{ kind:'capacity', field:'recyclerOpSpeed', amount:0.2, maxLevel:5 }, repeatable:true },
  // ── Gear & consumables (convenience) ──
  { id:'shop_vest_t3', name:'SAPI Plate Carrier', cat:'gear', tier:'T4', icon:'🦺',
    desc:'Vendor-stocked legendary vest, straight to your stash.', req:{ rmatTier:'T4', distance:8000 },
    cost:{ T4:5 }, grant:{ kind:'gear', itemId:'vest_t3', qty:1 }, repeatable:false },
  { id:'shop_medkits', name:'Field Medkit ×3', cat:'consumable', tier:'T1', icon:'🧰',
    desc:'Three medkits delivered to your loadout stash.', req:{ distance:1500 },
    cost:{ T1:4 }, grant:{ kind:'gear', itemId:'medkit', qty:3 }, repeatable:true },
  { id:'shop_stims', name:'Adrenaline Shot ×2', cat:'consumable', tier:'T2', icon:'💉',
    desc:'Two adrenaline shots for the next push.', req:{ lap:2 },
    cost:{ T2:3 }, grant:{ kind:'gear', itemId:'stimpack', qty:2 }, repeatable:true },
  // ── Cosmetics / QoL (prestige) ──
  { id:'cos_amber_term', name:'Amber Terminal Skin', cat:'cosmetic', tier:'T3', icon:'✦',
    desc:'Recolors the UI terminal to warm amber. Pure flex.', req:{ lap:4 },
    cost:{ T3:4 }, grant:{ kind:'flag', flag:'terminalSkin', value:'amber' }, repeatable:false },
  { id:'qol_autorecycle', name:'Auto-Recycle T0', cat:'qol', tier:'T2', icon:'⚙',
    desc:'Automatically recycle banked T0 salvage.', req:{ distance:4000 },
    cost:{ T2:8 }, grant:{ kind:'flag', flag:'autoRecycleT0', value:true }, repeatable:false },
  // ── Cooking stations: steps of the FOOD-02 ladder, unlocked here, then crafted [DECIDED Oct 27 PM]. The Campfire stays free. ──
  { id:'station_kettle_pot', name:'Kettle Pot (station unlock)', cat:'station', tier:'T1', icon:'♨',
    desc:'Unlocks the Kettle Pot cooking station. You craft it afterwards; the recipe arrives with the cooking-stations batch. The Campfire still cooks every basic recipe.', req:{},
    cost:{ T1:4 }, grant:{ kind:'flag', flag:'station_kettle_pot', value:true }, repeatable:false },
  { id:'station_cook_basin', name:'Cook Basin (station unlock)', cat:'station', tier:'T1', icon:'♨',
    desc:'Unlocks the Cook Basin cooking station (next step after the Kettle Pot). Crafted after unlocking.', req:{ distance:1500 },
    cost:{ T1:8 }, grant:{ kind:'flag', flag:'station_cook_basin', value:true }, repeatable:false },
  { id:'station_smoker', name:'Smoker (station unlock)', cat:'station', tier:'T2', icon:'♨',
    desc:'Unlocks the Smoker, which is planned to preserve fish and meat against spoilage. Crafted after unlocking.', req:{ rmatTier:'T2' },
    cost:{ T2:6 }, grant:{ kind:'flag', flag:'station_smoker', value:true }, repeatable:false },
  { id:'qol_cook_order', name:'Cook Greatest to Least', cat:'qol', tier:'T2', icon:'⚙',
    desc:'Smart cooking order: the station cooks the most valuable food first. Basic automatic cooking stays free (FOOD-02 C3). Takes effect when cooking stations are built.', req:{ rmatTier:'T2' },
    cost:{ T2:8 }, grant:{ kind:'flag', flag:'cookGreatestToLeast', value:true }, repeatable:false },
  { id:'qol_circuit_one_loop', name:'Circuit: One Loop Only', cat:'qol', tier:'T2', icon:'⟲',
    desc:'Adds a toggle to run a circuit once and stop at the start cell instead of repeating (circuit C3). Takes effect when circuits are built.', req:{},
    cost:{ T2:10 }, grant:{ kind:'flag', flag:'circuitOneLoop', value:true }, repeatable:false },
  { id:'cos_echo_palette', name:'Echo Sprite Palette', cat:'cosmetic', tier:'T5', icon:'✦',
    desc:'Reality-warped sprite palette. Deep-haul prestige marker.', req:{ rmatTier:'T5', distance:15000 },
    cost:{ T5:3 }, grant:{ kind:'flag', flag:'spritePalette', value:'echo' }, repeatable:false },
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
    bones:       { name:'Bone Fragments', icon:'🦴', color:'#d7cbb0', current:0, max:200, sources:['Pliers salvage after zombie encounters','Crafting salvage'] },
    fasteners:   { name:'Fasteners', icon:'⚙', color:'#aeb8c2', current:0, max:200, sources:['Hammer and wrench salvage','Workshops'] },
    wiring:      { name:'Wiring', icon:'〰', color:'#d89b52', current:0, max:200, sources:['Needle-nose pliers','Electrical salvage'] },
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
ZI.addMaterial = function(key, amount) {
  const m = window.ZI_MATERIALS && window.ZI_MATERIALS[key];
  if (!m || !Number.isFinite(amount) || amount <= 0) return 0;
  const before = m.current; m.current = Math.min(m.max, before + Math.floor(amount)); return m.current - before;
};

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
ZI.recyclerToolMatch = function(item) {
  const o = item && item.outputs || {};
  if (o.metal > 0 && o.electronics > 0) return { family:'screwdriver', label:'Screwdriver' };
  if (o.metal > 0) return { family:'wrench', label:'Wrench' };
  if (o.electronics > 0) return { family:'pliers', label:'Pliers' };
  return null;
};
// Queue one item on the normal recycle job lane; an assisted job reserves its tool until finish/cancel.
ZI.queueRecycle = function(item, opId, mode, toolAssist) {
  if (!ZI.canUseRecyclerOperator(opId, mode)) return { ok:false, reason:'operator not available in this mode' };
  if (!ZI.isRecyclable(item)) return { ok:false, reason:'not recyclable' };
  const op = ZI.RECYCLER_OPERATORS.find(o => o.id === opId);
  const effSpeed = op.speed + (ZI.recyclerOpSpeedBonus ? ZI.recyclerOpSpeedBonus() : 0);
  const match = toolAssist ? ZI.recyclerToolMatch(item) : null;
  if (toolAssist && (!match || match.family !== toolAssist)) return { ok:false, reason:'that tool does not fit this salvage' };
  if (toolAssist && item.fromToolScrap) return { ok:false, reason:'broken tools can be recycled, but cannot assist a recycler job' };
  let reservedToolId = null;
  if (toolAssist && !item.fromToolScrap) {
    const stash = ZI.getStash(), index = stash.findIndex(id => { const g = ZI.getGearItem(id); return g && g.toolFamily === toolAssist && g.toolCondition !== 'broken'; });
    if (index < 0) return { ok:false, reason:'keep a usable matching tool in Stockpile first' };
    reservedToolId = stash.splice(index, 1)[0]; ZI.saveStash(stash);
  }
  if (item.fromToolScrap) {
    const stash = ZI.getStash(), index = stash.indexOf(item.gearItemId);
    if (index < 0) return { ok:false, reason:'broken tool is no longer in Stockpile' };
    reservedToolId = stash.splice(index, 1)[0]; ZI.saveStash(stash);
  }
  const duration = item.weight * (toolAssist === 'pliers' ? 10500 : 14000) / effSpeed / 1000;
  const outputs = Object.fromEntries(Object.entries(item.outputs).map(([k, v]) => [k, Math.floor(v * op.bonusMult)]));
  if (toolAssist === 'wrench' && outputs.metal > 0) outputs.metal += 1;
  if (toolAssist === 'screwdriver' && outputs.electronics > 0) outputs.electronics += 1;
  if (toolAssist === 'pliers' && outputs.electronics > 0) { outputs.wiring = (outputs.wiring || 0) + 1; }
  const boosted = Object.assign({}, item, { outputs });
  const job = ZI.enqueueJob('recycle', item.id, duration, { item:boosted, toolFamily:toolAssist || null, reservedToolId }, 1);
  return { ok:true, job };
};
// Eligible = has material outputs, is not a story item, and is not already in the recycle queue.
ZI.isRecyclable = function(item) {
  if (!item || !item.outputs || !Object.values(item.outputs).some(v => v > 0)) return false;
  if (item.isStory || (ZI.isStoryItem && (ZI.isStoryItem(item.id) || (item.gearId && ZI.isStoryItem(item.gearId))))) return false;
  return !ZI.jobsByType('recycle').some(j => j.refId === item.id);
};
ZI.brokenToolRecyclerItems = function() {
  const seen = {};
  return ZI.getStash().map(id => ZI.getGearItem(id)).filter(g => g && g.toolScrap).map(g => {
    const n = seen[g.id] || 0; seen[g.id] = n + 1;
    return { id:`tool-scrap:${g.id}:${n}`, name:g.name, tier:1, rarity:'Common', weight:g.weight || 1, outputs:Object.assign({}, g.outputs), sprite:g.sprite, icon:g.icon, fromToolScrap:true, gearItemId:g.id };
  });
};
ZI.handToolScavenge = function(poiType) {
  const finds = [];
  const award = (family, material, amount, label) => {
    if (!ZI.carriedHandTool || !ZI.carriedHandTool(family)) return;
    const got = ZI.addMaterial(material, amount);
    if (got > 0) { ZI.useCarriedHandTool(family); finds.push(`+${got} ${label} (tool)`); }
  };
  if (['hardware-store','school','scrapyard','office-building'].includes(poiType)) award('hammer','fasteners',2,'Fasteners');
  if (['hardware-store','scrapyard','police-station','transit-depot'].includes(poiType)) award('pliers','wiring',1,'Wiring');
  if (['hardware-store','police-station','transit-depot'].includes(poiType)) award('screwdriver','electronics',1,'Electronics');
  if (['scrapyard','gas-station','police-station'].includes(poiType) && ZI.carriedHandTool && ZI.carriedHandTool('wrench')) award('wrench','fasteners',2,'Fasteners');
  if (['scrapyard','gas-station','hardware-store'].includes(poiType) && ZI.carriedHandTool && ZI.carriedHandTool('torch')) {
    const fuel = window.ZI_MATERIALS && window.ZI_MATERIALS.fuel;
    if (fuel && fuel.current >= 1) {
      const got = ZI.addMaterial('metal',3);
      if (got > 0) { fuel.current -= 1; ZI.useCarriedHandTool('torch'); finds.push(`+${got} Metal from cut plate scrap (−1 Fuel)`); }
    }
  }
  return finds;
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
