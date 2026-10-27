// game/items.js — Gear slots and items, loadout, stash, durability, bonuses, purpose tags, story items, starter kit.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
// Everything attaches to the shared global ZI object; load-time calls live in game/bootstrap.js.

// ─── GEAR LOADOUT SYSTEM (equippable items modify Wandering stats) ───────────
ZI.RARITY_COLORS = {
  common:'#b4b4b4', uncommon:'#7cc47c', rare:'#7aa8f0', epic:'#b48cf0', legendary:'#f0bc50', exotic:'#f070bc',
};
// 14 typed equip slots. accepts = item category that fits.
ZI.GEAR_SLOTS = [
  { id:'primary',     label:'Primary',    accepts:'weapon',     group:'weapon' },
  { id:'secondary',   label:'Sidearm',    accepts:'weapon',     group:'weapon' },
  { id:'melee',       label:'Melee',      accepts:'weapon',     group:'weapon' },
  { id:'helmet',      label:'Helmet',     accepts:'armor',      group:'armor' },
  { id:'mask',        label:'Mask',       accepts:'armor',      group:'armor' },
  { id:'vest',        label:'Body Armor', accepts:'armor',      group:'armor' },
  { id:'gloves',      label:'Gloves',     accepts:'armor',      group:'armor' },
  { id:'boots',       label:'Boots',      accepts:'armor',      group:'armor' },
  { id:'backpack',    label:'Pack',       accepts:'gear',       group:'gear' },
  { id:'rig',         label:'Rig',        accepts:'gear',       group:'gear' },
  { id:'consumable1', label:'Med',        accepts:'consumable', group:'consumable' },
  { id:'consumable2', label:'Stim',       accepts:'consumable', group:'consumable' },
  { id:'consumable3', label:'Food',       accepts:'consumable', group:'consumable' },
  { id:'throwable',   label:'Throw',      accepts:'consumable', group:'consumable' },
  { id:'back',        label:'Back',       accepts:'gear',       group:'gear' },
  { id:'trinket',     label:'Trinket',    accepts:'gear',       group:'gear' },
];
// Full gear roster. dmg drives weapon power; armor/carryW/speedDelta/lootBonus feed the resolver.
ZI.GEAR_ITEMS = [
  // Weapons
  { id:'rifle',      name:'AK-74 Carbine',     slot:'primary',   cat:'weapon', rarity:'rare',      icon:'🔫', dmg:42, armor:0, carryW:4, speedDelta:-5, lootBonus:0,  desc:'Reliable 5.45mm carbine. Loud but devastating.' },
  { id:'shotgun',    name:'Sawn-Off Shotgun',  slot:'primary',   cat:'weapon', rarity:'uncommon',  icon:'🔫', dmg:65, armor:0, carryW:3, speedDelta:-3, lootBonus:0,  desc:'Close range devastation. Useless past 20m.' },
  { id:'suppressed', name:'Suppressed SMG',    slot:'primary',   cat:'weapon', rarity:'epic',      icon:'🔫', dmg:28, armor:0, carryW:3, speedDelta:-2, lootBonus:0,  desc:'Quiet and fast. Urban specialist weapon.' },
  { id:'pistol',     name:'9mm Pistol',        slot:'secondary', cat:'weapon', rarity:'common',    icon:'🔫', dmg:22, armor:0, carryW:1, speedDelta:0,  lootBonus:0,  desc:'Standard sidearm. Backup when it counts.' },
  { id:'revolver',   name:'.357 Revolver',     slot:'secondary', cat:'weapon', rarity:'uncommon',  icon:'🔫', dmg:38, armor:0, carryW:2, speedDelta:0,  lootBonus:0,  desc:'Heavy hitting. Slow to reload.' },
  { id:'machete',    name:'Military Machete',  slot:'melee',     cat:'weapon', rarity:'uncommon',  icon:'🔪', dmg:30, armor:0, carryW:2, speedDelta:5,  lootBonus:0,  desc:'Silent. Efficient. Close range only.' },
  { id:'bat',        name:'Nail Bat',          slot:'melee',     cat:'weapon', rarity:'common',    icon:'🏏', dmg:28, armor:0, carryW:3, speedDelta:0,  lootBonus:0,  heavySwingPct:30, desc:'Improvised and heavy. Heavy swing: 30% chance to lose your next attack.' }, // CB1
  { id:'pocket_knife', name:'Pocket Knife',     slot:'melee',     cat:'weapon', rarity:'common',    icon:'🔪', dmg:16, armor:0, carryW:0.5, speedDelta:0, lootBonus:5,  escapeBonus:30, desc:'Small and quiet. +30 escape chance, +5 loot.' }, // CB1: starter weapon (no recipe)
  { id:'crowbar',    name:'Crowbar',           slot:'melee',     cat:'weapon', rarity:'common',    icon:'🪛', dmg:22, armor:0, carryW:3, speedDelta:-2, lootBonus:5,  desc:'Opens locked containers.' },
  // Armor
  { id:'helmet_t2',  name:'Ballistic Helmet T2',slot:'helmet',   cat:'armor',  rarity:'rare',      icon:'🪖', dmg:0, armor:12, carryW:2, speedDelta:-3, lootBonus:0,  desc:'Rated for pistol caliber.' },
  { id:'helmet_t1',  name:'Construction Hard Hat',slot:'helmet', cat:'armor',  rarity:'common',    icon:'⛑️', dmg:0, armor:4,  carryW:1, speedDelta:0,  lootBonus:0,  desc:'Better than nothing. Barely.' },
  { id:'gasmask',    name:'NBC Gas Mask',      slot:'mask',      cat:'armor',  rarity:'epic',      icon:'😷', dmg:0, armor:5,  carryW:2, speedDelta:-5, lootBonus:0,  desc:'Required for toxic zones. -15% visibility.' },
  { id:'balaclava',  name:'Tactical Balaclava',slot:'mask',      cat:'armor',  rarity:'uncommon',  icon:'🥷', dmg:0, armor:1,  carryW:0, speedDelta:0,  lootBonus:0,  desc:'Minor protection.' },
  { id:'vest_t3',    name:'SAPI Plate Carrier',slot:'vest',      cat:'armor',  rarity:'legendary', icon:'🦺', dmg:0, armor:35, carryW:5, speedDelta:-12,lootBonus:0,  desc:'Military-grade ceramic. Stops rifle rounds.' },
  { id:'vest_t1',    name:'Padded Jacket',     slot:'vest',      cat:'armor',  rarity:'common',    icon:'🧥', dmg:0, armor:8,  carryW:2, speedDelta:0,  lootBonus:0,  desc:'Civilian padding. Minimal ballistic value.' },
  { id:'old_padded_jacket', name:'Old Padded Jacket', slot:'vest', cat:'armor', rarity:'common', icon:'🧥', dmg:0, armor:4, carryW:2, speedDelta:0, lootBonus:0, desc:'Worn thin and patched twice. Better than nothing.' }, // JD1a (B1): from the Elder Jester; armor 4, 2 kg
  { id:'gloves_t2',  name:'Combat Gloves',     slot:'gloves',    cat:'armor',  rarity:'uncommon',  icon:'🧤', dmg:0, armor:2,  carryW:0, speedDelta:0,  lootBonus:0,  desc:'+10% melee damage. Improved grip.' },
  { id:'boots_t2',   name:'Tactical Boots',    slot:'boots',     cat:'armor',  rarity:'rare',      icon:'🥾', dmg:0, armor:1,  carryW:0, speedDelta:8,  lootBonus:0,  desc:'-20% movement noise. Sprint bonus.' },
  { id:'boots_t1',   name:'Work Boots',        slot:'boots',     cat:'armor',  rarity:'common',    icon:'🥾', dmg:0, armor:0,  carryW:1, speedDelta:-2, lootBonus:0,  desc:'Sturdy. Nothing special.' },
  // Gear
  { id:'backpack_lg',name:'Military MOLLE Pack',slot:'backpack', cat:'gear',   rarity:'rare',      icon:'🎒', dmg:0, armor:0,  carryW:-8, speedDelta:-8, lootBonus:15, desc:'12 extra stash slots on run.' },
  { id:'backpack_sm',name:'Daypack',           slot:'backpack',  cat:'gear',   rarity:'common',    icon:'🎒', dmg:0, armor:0,  carryW:-3, speedDelta:-3, lootBonus:8,  desc:'6 extra stash slots. Lightweight.' },
  { id:'rig_t2',     name:'Tactical Chest Rig',slot:'rig',       cat:'gear',   rarity:'uncommon',  icon:'🎽', dmg:0, armor:0,  carryW:0,  speedDelta:0,  lootBonus:0,  desc:'+4 quick slots. +20% reload speed.' },
  { id:'handmade_pouch',name:'Handmade Pouch', slot:'backpack',  cat:'gear',   rarity:'common',    icon:'👝', dmg:0, armor:0,  carryW:-5, speedDelta:0,  lootBonus:0, pockets:2, desc:'Starter pouch. 2 pockets, +5 kg.' },
  // Consumables
  { id:'scout_kit',  name:'Scout Kit',         slot:'consumable2',cat:'consumable',rarity:'common', icon:'🔭', dmg:0, armor:0, carryW:1, speedDelta:0, lootBonus:0, charges:2, desc:'Binoculars and notes. Holds 2 scout charges.' },
  { id:'medkit',     name:'Field Medkit',      slot:'consumable1',cat:'consumable',rarity:'uncommon',icon:'🧰', dmg:0, armor:0, carryW:1, speedDelta:0, lootBonus:0, effect:{heal:60}, desc:'+60 HP over 8s.' },
  { id:'fort_medkit', name:'Fort-bound Med Kit', slot:null, cat:'story', isStory:true, rarity:'uncommon', icon:'🧰', dmg:0, armor:0, carryW:1, speedDelta:0, lootBonus:0, purpose:['faction'], desc:'Sealed and marked for the Fort. Not yours to open.' }, // JD1a (B1, U21): story item, 1 kg; Fort hand-in only
  { id:'concordance_research_log', name:'Concordance Research Log', slot:null, cat:'story', isStory:true, rarity:'rare', icon:'📓', dmg:0, armor:0, carryW:0.2, speedDelta:0, lootBonus:0, purpose:['faction'], desc:'A protected story item: notes on the infection and the Sealed Crate.' },
  { id:'bandage',    name:'Bandage Roll',      slot:'consumable1',cat:'consumable',rarity:'common', icon:'🩹', dmg:0, armor:0, carryW:0, speedDelta:0, lootBonus:0, effect:{heal:25}, desc:'+25 HP over 4s. Stops bleeding.' },
  { id:'stimpack',   name:'Adrenaline Shot',   slot:'consumable2',cat:'consumable',rarity:'rare',   icon:'💉', dmg:0, armor:0, carryW:0, speedDelta:0, lootBonus:0, effect:{speedPct:30,durSec:45}, desc:'+30% speed for 45s.' },
  { id:'ration',     name:'MRE Ration',        slot:'consumable3',cat:'consumable',rarity:'common', icon:'🥫', dmg:0, armor:0, carryW:1, speedDelta:0, lootBonus:0, effect:{heal:12}, desc:'+40% stamina regen 120s.' },
  { id:'grenade',    name:'Frag Grenade',      slot:'throwable', cat:'consumable',rarity:'uncommon',icon:'💣', dmg:0, armor:0, carryW:1, speedDelta:0, lootBonus:0, effect:{killEnemy:true}, desc:'120 blast / 5m radius.' },
  { id:'flashbang',  name:'Flashbang',         slot:'throwable', cat:'consumable',rarity:'uncommon',icon:'🧨', dmg:0, armor:0, carryW:0, speedDelta:0, lootBonus:0, effect:{stun:true}, desc:'Stun 6s / 8m radius.' },
];
// Build the mechanical part of every item description from the values the game
// actually uses. Optional attributeBonuses supports future S.U.R.V.I.V.A.L.
// affixes without inventing attribute values for the existing catalog.
ZI.itemStatLines = function(item) {
  if (!item) return [];
  const lines = [];
  const add = (label, value) => {
    if (Number.isFinite(value) && value !== 0) lines.push(`${label} ${value > 0 ? '+' : ''}${value}`);
    else if (typeof value === 'string' && value) lines.push(`${label} ${value}`);
  };
  if (item.unique === true) lines.push('Unique');
  if (item.cat === 'weapon') add('Base damage', item.dmg);
  if (item.cat === 'armor') add('Armor', item.armor);
  add('Movement', item.speedDelta);
  add('Loot find', item.lootBonus);
  add('Heavy swing chance', item.heavySwingPct);
  add('Stagger chance', item.staggerPct);
  add('Escape chance', item.escapeBonus);
  Object.entries(item.stats || {}).forEach(([key, value]) => add(key === 'evade' ? 'Evasion' : key, value));
  if (item.unique === true) {
    Object.entries(item.attributeBonuses || {}).forEach(([key, value]) => {
      const attr = (ZI.SURVIVAL_ATTRS || []).find(a => a.key === key);
      add(`${attr ? attr.name : key} attribute`, value);
    });
  }
  const effect = item.effect || {};
  add('Heal', effect.heal);
  add('Damage', effect.dmgPct == null ? 0 : `${effect.dmgPct > 0 ? '+' : ''}${effect.dmgPct}%`);
  add('Movement speed', effect.speedPct == null ? 0 : `${effect.speedPct > 0 ? '+' : ''}${effect.speedPct}%`);
  add('Armor', effect.armorAdd);
  add('Evasion', effect.evade);
  add('Loot value', effect.lootPct == null ? 0 : `${effect.lootPct > 0 ? '+' : ''}${effect.lootPct}%`);
  if (effect.xpBonus) add(`${effect.xpBonus.track} XP/action`, effect.xpBonus.amount);
  if (effect.revive) add('Revive', `${effect.revive}% HP`);
  if (effect.stun) lines.push('Special: stuns target');
  if (effect.killEnemy) lines.push('Special: instantly defeats the target');
  if (Number.isFinite(effect.durSec)) lines.push(`Duration ${effect.durSec}s`);
  if (Number.isFinite(item.charges)) lines.push(`${item.charges} charges`);
  return lines;
};
ZI.describeGearItem = function(item) {
  if (!item) return '';
  return [item.desc || '', ...ZI.itemStatLines(item)].filter(Boolean).join('\n');
};
ZI.getGearItem = function(id) { return ZI.GEAR_ITEMS.find(g => g.id === id) || null; };

// ─── ITEM PURPOSE TAXONOMY ("every item earns its place") ────────────────────
// Derives a purpose[] array + marketValue for every gear item so nothing reads
// as random. Tags: equip / enhance / consume / trade / faction.
ZI.PURPOSE_META = {
  equip:   { icon:'⚔', label:'Equip',   color:'#e6c47e' },
  enhance: { icon:'▲', label:'Enhance', color:'#5CCB5F' },
  consume: { icon:'✚', label:'Consume', color:'#4EA3E0' },
  trade:   { icon:'⧉', label:'Trade',   color:'#E0A93F' },
  faction: { icon:'⚑', label:'Faction', color:'#B44EE0' },
};
// Item ids referenced by any faction contract's requires.equipped (built §4).
ZI._factionRequiredItems = function() {
  const set = new Set();
  (ZI.CONTRACTS || []).forEach(c => { (c.requires && c.requires.equipped || []).forEach(id => set.add(id)); });
  return set;
};
ZI.deriveItemPurpose = function(item) {
  const p = new Set();
  const hasStat = ['dmg','armor','speedDelta','lootBonus'].some(k => item[k]) || (item.stats && Object.keys(item.stats).length);
  if (item.slot && (hasStat || item.cat === 'weapon' || item.cat === 'armor' || item.cat === 'gear')) p.add('equip');
  if (item.xpBonus || (item.stats && item.stats.evade) || (item.effect && (item.effect.dmgPct || item.effect.speedPct || item.effect.lootPct || item.effect.armor || item.effect.evade || item.effect.xpBonus))) p.add('enhance');
  if (item.cat === 'consumable' && item.effect) p.add('consume');
  if (ZI._factionRequiredItems().has(item.id)) p.add('faction');
  // Tradeable: anything with a positive derived market value (most gear).
  return [...p];
};
// Market value anchor: tier-scaled base + stat contribution.
ZI.deriveMarketValue = function(item) {
  if (typeof item.marketValue === 'number') return item.marketValue;
  const rank = ZI.tierRank ? ZI.tierRank(item) : 0;
  let v = 10 + rank * 30;
  v += (item.dmg || 0) * 2 + (item.armor || 0) * 3 + Math.abs(item.lootBonus || 0) * 2;
  if (item.stats) v += (item.stats.evade || 0) * 4 + (item.stats.speed || 0) * 3;
  if (item.xpBonus) v += item.xpBonus.amount * 15;
  return Math.round(v);
};
// One-time enrichment pass: attach purpose[] + marketValue; warn on purposeless.
ZI.auditItems = function() {
  const flagged = [];
  (ZI.GEAR_ITEMS || []).forEach(it => {
    it.marketValue = ZI.deriveMarketValue(it);
    it.purpose = ZI.deriveItemPurpose(it);
    if (it.marketValue > 0 && !it.purpose.includes('trade')) it.purpose.push('trade'); // sellable sink
    if (!it.purpose.length) flagged.push(it.id);
  });
  if (flagged.length && typeof console !== 'undefined') console.warn('[ZI audit] purposeless items:', flagged);
  return flagged;
};

// ─── CRAFTABLE GEAR & CONSUMABLES (supply-chain outputs → equip stash) ───────
// Consumables carry a generic `effect` the Wandering run reads:
//   heal:n  speedPct:n  dmgPct:n  armorAdd:n  lootPct:n  durSec:n
//   killEnemy:true  stun:true  revive:n (HP restored when downed)
ZI.GEAR_ITEMS.push(
  // ===== CONSUMABLES — Healing =====
  { id:'rag_wrap',        name:'Rag Wrap',         slot:'consumable1', cat:'consumable', rarity:'common',    icon:'🩹', dmg:0,armor:0,carryW:0,speedDelta:0,lootBonus:0, effect:{heal:15}, desc:'Restores 15 HP instantly.' },
  { id:'field_bandage',   name:'Field Bandage',    slot:'consumable1', cat:'consumable', rarity:'common',    icon:'🩺', dmg:0,armor:0,carryW:0,speedDelta:0,lootBonus:0, effect:{heal:30}, desc:'Restores 30 HP over 10s.' },
  { id:'trauma_dressing', name:'Trauma Dressing',  slot:'consumable1', cat:'consumable', rarity:'uncommon',  icon:'🏥', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{heal:55}, desc:'Restores 55 HP; suppresses pain.' },
  { id:'combat_stim_iv',  name:'Combat Stimulant IV',slot:'consumable1',cat:'consumable', rarity:'rare',     icon:'🩻', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{heal:80,dmgPct:15,durSec:8}, desc:'+80 HP over 8s; +15% damage during.' },
  { id:'nanite_serum',    name:'Nanite Repair Serum',slot:'consumable1',cat:'consumable', rarity:'epic',     icon:'🔬', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{heal:100}, desc:'Restores 100 HP; clears debuffs.' },
  { id:'revenant_infusion',name:'Revenant Infusion',slot:'consumable1',cat:'consumable', rarity:'exotic',    icon:'💀', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{revive:50}, desc:'On downed: revive at 50 HP. One-shot.' },
  // ===== CONSUMABLES — Stat Boosts =====
  { id:'scrap_adrenaline',name:'Scrap Adrenaline', slot:'consumable2', cat:'consumable', rarity:'common',    icon:'⚡', dmg:0,armor:0,carryW:0,speedDelta:0,lootBonus:0, effect:{speedPct:20,durSec:30}, desc:'+20% move speed for 30s.' },
  { id:'focus_tabs',      name:'Focus Tabs',       slot:'consumable2', cat:'consumable', rarity:'uncommon',  icon:'🧠', dmg:0,armor:0,carryW:0,speedDelta:0,lootBonus:0, effect:{dmgPct:25,durSec:45}, desc:'+25% weapon damage for 45s.' },
  { id:'overclock_patch', name:'Overclock Patch',  slot:'consumable2', cat:'consumable', rarity:'rare',      icon:'🔌', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{speedPct:35,durSec:50}, desc:'+35% move speed for 50s.' },
  { id:'apex_combat',     name:'Apex Combat Formula',slot:'consumable2',cat:'consumable', rarity:'epic',     icon:'🧪', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{dmgPct:20,speedPct:20,armorAdd:20,durSec:75}, desc:'+20% dmg/speed, +20 armor for 75s.' },
  { id:'crystalline_surge',name:'Crystalline Surge Capsule',slot:'consumable2',cat:'consumable',rarity:'legendary',icon:'💎',dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{dmgPct:50,speedPct:50,armorAdd:50,lootPct:50,durSec:45}, desc:'+50% all stats for 45s.' },
  { id:'echo_state',      name:'Echo State Protocol',slot:'consumable2',cat:'consumable', rarity:'exotic',   icon:'🌀', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{dmgPct:100,speedPct:100,lootPct:100,durSec:30}, desc:'Doubles all stats + loot for 30s.' },
  // ===== CONSUMABLES — Evade burst (§4) & XP-boost draughts (§5) =====
  { id:'adrenaline_shot', name:'Adrenaline Shot+',  slot:'consumable2', cat:'consumable', rarity:'uncommon',  icon:'💨', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{evade:20,durSec:30}, desc:'+20 escape chance for 30s.' },
  { id:'smoke_vial',      name:'Smoke Vial',        slot:'consumable2', cat:'consumable', rarity:'rare',      icon:'💨', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{evade:35,durSec:45}, desc:'+35 escape chance for 45s.' },
  { id:'combat_focus_draught',name:'Combat Focus Draught',slot:'consumable2',cat:'consumable',rarity:'rare',  icon:'📿', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{xpBonus:{track:'combat',amount:8},durSec:120}, desc:'+8 Combat XP per action for 120s.' },
  { id:'scholars_tonic',  name:"Scholar's Tonic",   slot:'consumable2', cat:'consumable', rarity:'epic',      icon:'📿', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{xpBonus:{track:'discovery',amount:10},durSec:120}, desc:'+10 Discovery XP per action for 120s.' },
  // ===== CONSUMABLES — Loot Amplifiers =====
  { id:'lucky_charm',     name:'Lucky Charm',      slot:'consumable3', cat:'consumable', rarity:'common',    icon:'🍀', dmg:0,armor:0,carryW:0,speedDelta:0,lootBonus:0, effect:{lootPct:5,durSec:60}, desc:'+5% loot value for 60s.' },
  { id:'salvagers_oil',   name:"Salvager's Oil",   slot:'consumable3', cat:'consumable', rarity:'uncommon',  icon:'🛢️', dmg:0,armor:0,carryW:0,speedDelta:0,lootBonus:0, effect:{lootPct:20,durSec:90}, desc:'+20% loot value for 90s.' },
  { id:'rmat_attractor',  name:'RMAT Attractor',   slot:'consumable3', cat:'consumable', rarity:'rare',      icon:'🧲', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{lootPct:35,durSec:120}, desc:'+35% loot value for 120s.' },
  { id:'echo_siphon',     name:'Echo Siphon',      slot:'consumable3', cat:'consumable', rarity:'epic',      icon:'🌀', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{lootPct:60,durSec:180}, desc:'+60% loot value for 180s.' },
  { id:'crystalline_resonator',name:'Crystalline Resonator',slot:'consumable3',cat:'consumable',rarity:'legendary',icon:'💎',dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{lootPct:100,durSec:240}, desc:'Doubles loot value for 240s.' },
  // ===== CONSUMABLES — Hazard Counters (throwables / utility) =====
  { id:'coal_paste',      name:'Coal Paste',       slot:'throwable',   cat:'consumable', rarity:'common',    icon:'🖤', dmg:0,armor:0,carryW:0,speedDelta:0,lootBonus:0, effect:{armorAdd:8,durSec:60}, desc:'Cuts toxin damage — +8 armor 60s.' },
  { id:'thermal_gel',     name:'Thermal Gel',      slot:'throwable',   cat:'consumable', rarity:'rare',      icon:'🌡️', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{heal:10,armorAdd:12,durSec:90}, desc:'Fire resist — +12 armor, +10 HP 90s.' },
  { id:'singularity_seed',name:'Singularity Seed', slot:'throwable',   cat:'consumable', rarity:'exotic',    icon:'🌌', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, effect:{killEnemy:true,lootPct:200,durSec:60}, desc:'Loot singularity: clears target, +200% loot 60s.' },

  // ===== FINISHED GEAR — Melee Weapons =====
  { id:'iron_knuckles', name:'Iron Knuckles',   slot:'melee',   cat:'weapon', rarity:'common',   icon:'👊', dmg:16,armor:0,carryW:1,speedDelta:3,lootBonus:0, staggerPct:25, desc:'25% stagger chance on hit.' }, // CB1
  { id:'spike_board',   name:'Spike Board',     slot:'melee',   cat:'weapon', rarity:'uncommon', icon:'🪓', dmg:28,armor:0,carryW:3,speedDelta:-2,lootBonus:0, desc:'Ignores 15% of enemy armor.' },
  { id:'combat_knife',  name:'Combat Knife',    slot:'melee',   cat:'weapon', rarity:'uncommon', icon:'🔪', dmg:30,armor:0,carryW:1,speedDelta:6,lootBonus:0, desc:'Silent kills — no noise on headshots.' },
  { id:'steel_baton',   name:'Steel Baton',     slot:'melee',   cat:'weapon', rarity:'uncommon', icon:'🪄', dmg:26,armor:0,carryW:2,speedDelta:4,lootBonus:0, desc:'25% stun chance on hit.' },
  { id:'machete_blade', name:'Machete Blade',   slot:'melee',   cat:'weapon', rarity:'rare',     icon:'⚔️', dmg:36,armor:0,carryW:2,speedDelta:8,lootBonus:0, desc:'Cleave — hits up to 2 enemies.' },
  { id:'combat_axe',    name:'Combat Axe',      slot:'melee',   cat:'weapon', rarity:'epic',     icon:'🪓', dmg:52,armor:0,carryW:4,speedDelta:-4,lootBonus:0, desc:'10% decapitate on unarmored.' },
  { id:'shock_baton',   name:'Shock Baton',     slot:'melee',   cat:'weapon', rarity:'epic',     icon:'⚡', dmg:30,armor:0,carryW:2,speedDelta:2,lootBonus:0, desc:'Every hit applies 3s paralysis.' },
  { id:'jet_sledge',    name:'Jet-Assisted Sledge',slot:'melee',cat:'weapon', rarity:'legendary',icon:'🔨', dmg:88,armor:0,carryW:6,speedDelta:-10,lootBonus:0, desc:'Shockwave knockback; smashes barricades.' },
  // ===== FINISHED GEAR — Ranged =====
  { id:'pipe_shotgun',  name:'Improvised Pipe Shotgun',slot:'primary',cat:'weapon',rarity:'common',icon:'🔫', dmg:55,armor:0,carryW:3,speedDelta:-3,lootBonus:0, desc:'Cone spread — hits up to 3.' },
  { id:'compound_bow',  name:'Compound Bow',    slot:'primary', cat:'weapon', rarity:'uncommon', icon:'🏹', dmg:40,armor:0,carryW:3,speedDelta:-2,lootBonus:0, desc:'Silent — zero noise.' },
  { id:'crossbow',      name:'Crossbow',        slot:'primary', cat:'weapon', rarity:'rare',     icon:'🏹', dmg:58,armor:0,carryW:4,speedDelta:-4,lootBonus:0, desc:'Bolt penetration — pierces 2.' },
  { id:'arc_carbine',   name:'Arc Carbine',     slot:'primary', cat:'weapon', rarity:'epic',     icon:'🔫', dmg:60,armor:0,carryW:4,speedDelta:-3,lootBonus:0, desc:'Arc burst — chains to adjacent.' },
  { id:'flamethrower',  name:'Flamethrower',    slot:'primary', cat:'weapon', rarity:'legendary',icon:'🔥', dmg:50,armor:0,carryW:8,speedDelta:-12,lootBonus:0, desc:'Sustained burn; spreads to nearby.' },
  { id:'void_pulse_rifle',name:'Void Pulse Rifle',slot:'primary',cat:'weapon',rarity:'exotic',   icon:'🌀', dmg:120,armor:0,carryW:5,speedDelta:-6,lootBonus:8, desc:'Phases through cover; kills boost loot.' },
  { id:'pipe_pistol',   name:'Pipe Pistol',     slot:'secondary',cat:'weapon',rarity:'common',   icon:'🔫', dmg:20,armor:0,carryW:1,speedDelta:0,lootBonus:0, desc:'Single-shot scrap sidearm.' },
  { id:'shock_pistol',  name:'Shock Pistol',    slot:'secondary',cat:'weapon',rarity:'rare',     icon:'⚡', dmg:18,armor:0,carryW:1,speedDelta:0,lootBonus:0, desc:'Chain shock — arcs to adjacent.' },
  // ===== FINISHED GEAR — Armor =====
  { id:'scrap_helmet',    name:'Scrap Helmet',    slot:'helmet', cat:'armor', rarity:'common',   icon:'⛑️', dmg:0,armor:6,carryW:1,speedDelta:-1,lootBonus:0, desc:'Iron-plate saucepan. It works.' },
  { id:'riot_helmet',     name:'Riot Helmet',     slot:'helmet', cat:'armor', rarity:'uncommon', icon:'⛑️', dmg:0,armor:12,carryW:2,speedDelta:-3,lootBonus:0, desc:'Face shield deflects bites.' },
  { id:'composite_helmet',name:'Composite Helmet',slot:'helmet', cat:'armor', rarity:'rare',     icon:'⛑️', dmg:0,armor:20,carryW:2,speedDelta:-4,lootBonus:0, desc:'Alloy/weave/padding. -15% head dmg.' },
  { id:'perimeter_helmet',name:'Perimeter Helmet',slot:'helmet', cat:'armor', rarity:'legendary',icon:'⛑️', dmg:0,armor:30,carryW:3,speedDelta:-6,lootBonus:0, desc:'Integrated HUD; NBC rated.' },
  { id:'soft_armor_vest', name:'Soft Armor Vest', slot:'vest',   cat:'armor', rarity:'uncommon', icon:'🦺', dmg:0,armor:20,carryW:3,speedDelta:-4,lootBonus:0, desc:'Ballistic weave panel vest.' },
  { id:'plate_carrier',   name:'Plate Carrier',   slot:'vest',   cat:'armor', rarity:'epic',     icon:'🦺', dmg:0,armor:38,carryW:5,speedDelta:-10,lootBonus:0, desc:'Ballistic steel insert carrier.' },
  { id:'leather_gloves',  name:'Leather Gloves',  slot:'gloves', cat:'armor', rarity:'common',   icon:'🧤', dmg:0,armor:3,carryW:0,speedDelta:0,lootBonus:0, desc:'Cured leather grip.' },
  { id:'combat_boots',    name:'Combat Boots',    slot:'boots',  cat:'armor', rarity:'uncommon', icon:'🥾', dmg:0,armor:2,carryW:1,speedDelta:6,lootBonus:0, desc:'Tempered tread — sprint bonus.' },
  // ===== FINISHED GEAR — Utility =====
  { id:'molle_pack',      name:'MOLLE Pack',      slot:'backpack',cat:'gear', rarity:'rare',     icon:'🎒', dmg:0,armor:0,carryW:-10,speedDelta:-8,lootBonus:18, desc:'Crafted MOLLE — big carry + loot.' },
  { id:'sensor_rig',      name:'Sensor Rig',      slot:'rig',     cat:'gear', rarity:'rare',     icon:'🎽', dmg:0,armor:2,carryW:1,speedDelta:0,lootBonus:8, desc:'PCB sensor rig — loot detection.' },
  // ===== EVADE-CHANCE ITEMS (§4) — flat evade points into escapeChance =====
  { id:'runners_cloak',   name:"Runner's Cloak",  slot:'back',    cat:'gear', rarity:'uncommon', icon:'🧣', dmg:0,armor:0,carryW:2,speedDelta:2,lootBonus:0, stats:{ evade:8, speed:2 }, durability:{ max:100, current:100, drainPerUse:1 }, desc:'Light cloak — slip contact more often.' },
  { id:'ghost_wrap',      name:'Ghost Wrap',      slot:'back',    cat:'gear', rarity:'rare',     icon:'🧣', dmg:0,armor:0,carryW:1,speedDelta:3,lootBonus:0, stats:{ evade:14, speed:3 }, durability:{ max:140, current:140, drainPerUse:1 }, desc:'Muffled wrap — a Runner might still lose you.' },
  // ===== ATTRIBUTE-XP BONUS ITEMS (§5) — flat +N XP per qualifying action =====
  { id:'tacticians_lens', name:"Tactician's Lens",slot:'trinket', cat:'gear', rarity:'epic',     icon:'🔬', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, xpBonus:{ track:'discovery', amount:5 }, durability:{ max:200, current:200, drainPerUse:1 }, desc:'+5 Discovery XP per qualifying action while worn.' },
  { id:'warlords_sigil',  name:"Warlord's Sigil", slot:'trinket', cat:'gear', rarity:'legendary',icon:'🎖', dmg:0,armor:0,carryW:1,speedDelta:0,lootBonus:0, xpBonus:{ track:'combat', amount:6 }, durability:{ max:240, current:240, drainPerUse:1 }, desc:'+6 Combat XP per qualifying action while worn.' },
);
// Enrich every item with purpose[] + marketValue (audit runs after contracts load below).

ZI.LOADOUT_KEY = 'zi_loadout';
ZI.STASH_KEY = 'zi_stash';
ZI.STASH_VER = 2; // bump resets any previously seeded stash so gear is gated to crafted outputs
ZI.emptyLoadout = function() {
  const l = {}; ZI.GEAR_SLOTS.forEach(s => l[s.id] = null); return l;
};
ZI.getLoadout = function() {
  let l; try { l = JSON.parse(localStorage.getItem(ZI.LOADOUT_KEY) || 'null'); } catch (e) { l = null; }
  return Object.assign(ZI.emptyLoadout(), l || {});
};
ZI.saveLoadout = function(l) { try { localStorage.setItem(ZI.LOADOUT_KEY, JSON.stringify(l)); } catch (e) {} ZI._notifyInventory(); };
// Stash holds ONLY gear the player has crafted/earned (no pre-seeding).
ZI.getStash = function() {
  let raw; try { raw = JSON.parse(localStorage.getItem(ZI.STASH_KEY) || 'null'); } catch (e) { raw = null; }
  if (!raw || raw.v !== ZI.STASH_VER || !Array.isArray(raw.items)) {
    raw = { v: ZI.STASH_VER, items: [] };
    try { localStorage.setItem(ZI.STASH_KEY, JSON.stringify(raw)); } catch (e) {}
  }
  return raw.items;
};
ZI.saveStash = function(items) {
  try { localStorage.setItem(ZI.STASH_KEY, JSON.stringify({ v: ZI.STASH_VER, items: items || [] })); } catch (e) {}
  ZI._notifyInventory();
};
// Change notification for the one stash/loadout store (Bug 1 fix). Screens subscribe and re-read ZI.getStash()/getLoadout()
// instead of keeping a copy taken at mount, so gear crafted by the job engine (or equipped on another screen) shows up.
ZI._invListeners = [];
ZI.onInventoryChange = function(fn) { ZI._invListeners.push(fn); return function() { ZI._invListeners = ZI._invListeners.filter(f => f !== fn); }; };
ZI._notifyInventory = function() { (ZI._invListeners || []).slice().forEach(fn => { try { fn(); } catch (e) {} }); };
// Grant a crafted gear item into the stash. Call when a gear-producing recipe completes.
ZI.grantGear = function(itemId, qty) {
  if (!ZI.getGearItem(itemId)) return false;
  const items = ZI.getStash();
  for (let i = 0; i < (qty || 1); i++) items.push(itemId);
  ZI.saveStash(items);
  return true;
};
// Equip an item from stash into its compatible slot. Returns {loadout, stash}.
ZI.equipGear = function(itemId, slotId) {
  const item = ZI.getGearItem(itemId); if (!item) return null;
  const slot = ZI.GEAR_SLOTS.find(s => s.id === slotId); if (!slot || slot.accepts !== item.cat) return null;
  const loadout = ZI.getLoadout();
  // Takes exactly ONE copy out of the stash (was: every copy with this id — Batch 1B fix).
  let stash = ZI.getStash(); const one = stash.indexOf(itemId); if (one >= 0) stash.splice(one, 1);
  // §5 stack-cap: at most ONE equipped xpBonus gear per track. Displace any
  // currently-equipped gear that boosts the same track.
  if (item.xpBonus && item.xpBonus.track) {
    ZI.GEAR_SLOTS.forEach(s => {
      if (s.id === slotId) return;
      const other = loadout[s.id] && ZI.getGearItem(loadout[s.id]);
      if (other && other.xpBonus && other.xpBonus.track === item.xpBonus.track) {
        stash.push(loadout[s.id]); loadout[s.id] = null; // return the conflicting item to stash
      }
    });
  }
  if (loadout[slotId]) stash.push(loadout[slotId]); // displaced item returns to stash
  loadout[slotId] = itemId;
  ZI.saveLoadout(loadout); ZI.saveStash(stash);
  return { loadout, stash, displacedTrack: item.xpBonus && item.xpBonus.track };
};
ZI.unequipGear = function(slotId) {
  const loadout = ZI.getLoadout();
  if (!loadout[slotId]) return { loadout, stash: ZI.getStash() };
  const stash = ZI.getStash(); stash.push(loadout[slotId]); loadout[slotId] = null;
  ZI.saveLoadout(loadout); ZI.saveStash(stash);
  return { loadout, stash };
};
// Live survivor stats from the equipped loadout (spec §13).
ZI.resolveLoadoutStats = function(loadout) {
  loadout = loadout || ZI.getLoadout();
  let armor = 0, weight = 0, speedDelta = 0, lootBonus = 0, weaponDamage = 0, filled = 0, hasWeapon = false, heavySwingPct = 0, staggerPct = 0, escapeBonus = 0;
  ZI.GEAR_SLOTS.forEach(s => {
    const it = loadout[s.id] && ZI.getGearItem(loadout[s.id]); if (!it) return;
    if (ZI.itemHasDurability(it) && ZI.itemWorn(it)) return; // worn item gives no benefit until repaired
    filled++;
    armor += it.armor || 0; weight += it.carryW || 0; speedDelta += it.speedDelta || 0; lootBonus += it.lootBonus || 0;
    if (it.cat === 'weapon') { weaponDamage += it.dmg || 0; hasWeapon = true;
      // CB1: weapon specials (the strongest equipped value of each; items without them contribute 0)
      heavySwingPct = Math.max(heavySwingPct, it.heavySwingPct || 0); staggerPct = Math.max(staggerPct, it.staggerPct || 0); escapeBonus = Math.max(escapeBonus, it.escapeBonus || 0); }
  });
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  return {
    displayHP: clamp(80 + Math.floor(armor / 2), 0, 100),
    armorRating: clamp(armor, 0, 100),
    carryCapacity: clamp(100 - weight, 0, 100),
    speed: clamp(100 + speedDelta, 10, 100),
    lootBonusPct: lootBonus,   // legacy key (kept for back-compat)
    lootFind: lootBonus,       // flat-integer alias (spec §4)
    weaponDamage, filled, hasWeapon, heavySwingPct, staggerPct, escapeBonus,
  };
};

// ─── FUNCTIONAL-ITEM SCHEMA HELPERS (tier/weight bands, durability, repair) ──
// Non-destructive layer over ZI.GEAR_ITEMS: derives tier, weight and durability
// from existing fields + tier bands, so no bulk item rewrite is required.
ZI.ITEM_BANDS = {
  T0: { weight:[1,2],  dur:[40,60]   },
  T1: { weight:[1,3],  dur:[60,90]   },
  T2: { weight:[2,5],  dur:[90,130]  },
  T3: { weight:[3,7],  dur:[130,180] },
  T4: { weight:[5,9],  dur:[180,240] },
  T5: { weight:[6,12], dur:[240,320] },
};
ZI.REPAIR_FACTOR = 0.5; // BalanceConfig dial: fully-worn repairs for ~half a fresh craft.
// Item's canonical tier key ('T0'..'T5') from its rarity/tier field.
ZI.itemTierKey = function(item) { return ZI.tierOf(item); };
// Flat weight (kg): authored `weight`, else |carryW|, else tier-band midpoint.
ZI.itemWeight = function(item) {
  if (!item) return 1;
  if (typeof item.weight === 'number') return item.weight;
  if (typeof item.carryW === 'number' && item.carryW > 0) return item.carryW;
  const b = ZI.ITEM_BANDS[ZI.itemTierKey(item)] || ZI.ITEM_BANDS.T0;
  return Math.round((b.weight[0] + b.weight[1]) / 2);
};
// Consumables never carry durability.
ZI.itemHasDurability = function(item) {
  if (!item) return false;
  const c = item.cat;
  return c === 'weapon' || c === 'armor' || c === 'gear' || c === 'melee' || c === 'ranged' || c === 'equipment';
};
// Max durability: authored durability.max, else tier-band midpoint.
ZI.itemDurabilityMax = function(item) {
  if (item && item.durability && item.durability.max) return item.durability.max;
  const b = ZI.ITEM_BANDS[ZI.itemTierKey(item)] || ZI.ITEM_BANDS.T0;
  return Math.round((b.dur[0] + b.dur[1]) / 2);
};
ZI.itemDrainPerUse = function(item) {
  return (item && item.durability && item.durability.drainPerUse) || 1;
};

// ─── ACTIVE BONUS AGGREGATION (evade + flat XP bonuses, §5) ──────────────────
// Timed consumable buffs live here so both the resolver and the XP bus can read
// them; equipped-gear bonuses are summed from the live loadout.
ZI.BUFF_KEY = 'zi_active_buffs';
// FX3 (Q4): the moment buffs are judged at. A catch-up (a Wandering step, a finished job, a finished route run)
// sets ZI._buffMomentFn for the moment it is processing; otherwise it is the current game clock.
ZI._buffMomentFn = null;
ZI.buffMoment = function() {
  const t = ZI._buffMomentFn ? ZI._buffMomentFn() : null;
  return (typeof t === 'number' && isFinite(t)) ? t : ZI.clockNow();
};
// FX3: reading never deletes. A buff counts from its start (from) until its end (until), at the buff moment.
ZI.getActiveBuffs = function() {
  let b; try { b = JSON.parse(localStorage.getItem(ZI.BUFF_KEY) || '[]'); } catch (e) { b = []; }
  const t = ZI.buffMoment();
  return (b || []).filter(x => x.until > t && (x.from == null || x.from <= t));
};
// FX3: cleanup. Removes a buff only when it ended before every catch-up has passed it: the Wandering run's
// unprocessed time (never more than the 24 h cap back), unfinished jobs and route runs. Returns the kept buffs.
ZI._pruneBuffs = function() {
  let b; try { b = JSON.parse(localStorage.getItem(ZI.BUFF_KEY) || '[]'); } catch (e) { b = []; }
  b = b || [];
  const now = ZI.clockNow(); let h = now;
  try {
    const s = ZI.getWanderRun ? ZI.getWanderRun() : null;
    if (s && s.active && s.lastTickAt) {
      const done = (typeof s._simNow === 'number' && isFinite(s._simNow)) ? s._simNow : s.lastTickAt;
      h = Math.min(h, Math.max(now - ZI.WANDER_SIM_TABLE.offlineCapSec * 1000, done));
    }
  } catch (e) {}
  try { const js = ZI._readJobsRaw ? ZI._readJobsRaw() : null; ((js && js.jobs) || []).forEach(j => { if (j.status === 'active' && j.startedAt != null) h = Math.min(h, j.startedAt + j.duration * 1000); }); } catch (e) {}
  try { const rr = ZI._readRouteRuns ? ZI._readRouteRuns() : null; Object.values(rr || {}).forEach(r => { if (r && r.startedAt != null) h = Math.min(h, r.startedAt + r.durationMs); }); } catch (e) {}
  const keep = b.filter(x => x.until > h);
  if (keep.length !== b.length) { try { localStorage.setItem(ZI.BUFF_KEY, JSON.stringify(keep)); } catch (e) {} }
  return keep;
};
ZI.addBuff = function(buff) { // { evade?, xpBonus:{track,amount}?, durationSec }
  let all = ZI._pruneBuffs(); const now = ZI.clockNow();
  // §5: xpBonus buffs don't stack with themselves — same track refreshes duration.
  // FX3: the running one ends now instead of being deleted, so catch-up steps before now still see it.
  if (buff.xpBonus && buff.xpBonus.track) {
    all = all.map(b => (b.xpBonus && b.xpBonus.track === buff.xpBonus.track && b.until > now) ? Object.assign({}, b, { until: now }) : b);
  }
  // FX4 (D-FX4b): a new speed buff replaces the running one (as the screen did before); the old one ends now.
  if (buff.speedPct) all = all.map(b => (b.speedPct && b.until > now) ? Object.assign({}, b, { until: now }) : b);
  all.push(Object.assign({}, buff, { from: now, until: now + (buff.durationSec || 30) * 1000 }));
  try { localStorage.setItem(ZI.BUFF_KEY, JSON.stringify(all)); } catch (e) {}
};
// FX4 (Q5): survivor attributes computed by shared rules. Watched, offline and headless play all use these;
// the Wandering screen reads them and never writes the results into the run.
ZI.SurvivorRules = {
  // Pace is the player's saved setting (D-FX4a): Walk 3 m/s; Jog and Run scale with Athletics conditioning.
  PACE: { walk: { base: 3, perCond: 0 }, jog: { base: 3, perCond: 0.6 }, run: { base: 3, perCond: 1.3 } },
  // Athletics conditioning 3–10 from the effective (rusted) Athletics level.
  conditioning() { return Math.max(3, Math.min(10, Math.round(3 + (ZI.effectiveLevel ? ZI.effectiveLevel('athletics') : 1) / 7))); },
  // Speed (m/s) = pace × gear speed × speed buffs (read at the buff moment, FX3). Overload is applied on top by the walker.
  moveSpeed(state) {
    const P = this.PACE[(state && state.moveMode) || 'walk'] || this.PACE.walk;
    const pace = P.base + (P.perCond ? P.perCond * this.conditioning() : 0);
    const gear = ZI.resolveLoadoutStats ? (ZI.resolveLoadoutStats().speed || 100) : 100;
    let pct = 0; (ZI.getActiveBuffs ? ZI.getActiveBuffs() : []).forEach(b => { if (b.speedPct) pct += b.speedPct; });
    const broken = (ZI.isBroken && ZI.isBroken() && ZI.BROKEN_TABLE) ? 1 + ZI.BROKEN_TABLE.speedPct / 100 : 1; // BAL-A A4
    return pace * (gear / 100) * (1 + pct / 100) * broken;
  },
  // Heal strength (% of max HP): the First Aid rule every heal already uses.
  healPct() { return ZI.STAT_FORMULAS.firstAidHealPercent(ZI.effectiveLevel('firstAid')); },
  // Speed changes only when a speed buff starts or ends: ms from t to the next such moment (walking segments split there).
  msToSpeedChange(t) {
    let b; try { b = JSON.parse(localStorage.getItem(ZI.BUFF_KEY) || '[]'); } catch (e) { b = []; }
    let best = Infinity;
    (b || []).forEach(x => { if (!x.speedPct) return; [x.from, x.until].forEach(e => { if (typeof e === 'number' && e > t && e - t < best) best = e - t; }); });
    return best;
  },
};
// Σ evade points from equipped gear + active consumable buffs (flat integer).
ZI.activeEvadeBonus = function() {
  let total = 0;
  const lo = ZI.getLoadout ? ZI.getLoadout() : {};
  (ZI.GEAR_SLOTS || []).forEach(s => {
    const it = lo[s.id] && ZI.getGearItem(lo[s.id]);
    if (it && !(ZI.itemHasDurability(it) && ZI.itemWorn && ZI.itemWorn(it)) && it.stats && it.stats.evade) total += it.stats.evade;
  });
  ZI.getActiveBuffs().forEach(b => { if (b.evade) total += b.evade; });
  return total;
};
// track → flat XP bonus from equipped gear + active buffs.
ZI.activeXpBonuses = function() {
  const out = {};
  const add = (track, amt) => { if (track && amt) out[track] = (out[track] || 0) + amt; };
  const lo = ZI.getLoadout ? ZI.getLoadout() : {};
  (ZI.GEAR_SLOTS || []).forEach(s => {
    const it = lo[s.id] && ZI.getGearItem(lo[s.id]);
    if (it && !(ZI.itemHasDurability(it) && ZI.itemWorn && ZI.itemWorn(it)) && it.xpBonus) add(it.xpBonus.track, it.xpBonus.amount);
  });
  ZI.getActiveBuffs().forEach(b => { if (b.xpBonus) add(b.xpBonus.track, b.xpBonus.amount); });
  return out;
};
// The craft recipe backing a gear item (for repair cost), if any.
ZI.recipeForItem = function(item) {
  if (!item || !ZI.CRAFT_RECIPES) return null;
  return ZI.CRAFT_RECIPES.find(r => r.grantsGear === item.id)
      || ZI.CRAFT_RECIPES.find(r => r.out && r.out.some(o => o.n === item.name)) || null;
};

// Per-item durability state (keyed by itemId — stash is non-instanced in the
// prototype; a slotless map is the safe, non-breaking granularity).
ZI.DURA_KEY = 'zi_durability';
ZI.getDuraMap = function() { try { return JSON.parse(localStorage.getItem(ZI.DURA_KEY) || '{}'); } catch (e) { return {}; } };
ZI.saveDuraMap = function(m) { try { localStorage.setItem(ZI.DURA_KEY, JSON.stringify(m)); } catch (e) {} };
ZI.itemDurability = function(item) {
  if (!ZI.itemHasDurability(item)) return null;
  const m = ZI.getDuraMap();
  const max = ZI.itemDurabilityMax(item);
  const cur = (item.id in m) ? m[item.id] : max;
  return { current: Math.max(0, Math.min(max, cur)), max };
};
ZI.applyWear = function(item, n) {
  if (!ZI.itemHasDurability(item)) return;
  const m = ZI.getDuraMap();
  const max = ZI.itemDurabilityMax(item);
  const cur = (item.id in m) ? m[item.id] : max;
  m[item.id] = Math.max(0, cur - (n || ZI.itemDrainPerUse(item)));
  ZI.saveDuraMap(m);
};
ZI.itemWorn = function(item) {
  const d = ZI.itemDurability(item);
  return d ? d.current <= 0 : false;
};
// Repair cost = fraction of the original craft cost × REPAIR_FACTOR × missingFrac.
ZI.repairCost = function(item) {
  const d = ZI.itemDurability(item);
  if (!d || d.current >= d.max) return { materials:{}, rmat:{}, missingFrac:0 };
  const missingFrac = (d.max - d.current) / d.max;
  const recipe = ZI.recipeForItem(item);
  const materials = {}, rmat = {};
  if (recipe && recipe.cost) {
    Object.entries(recipe.cost).forEach(([k, q]) => {
      materials[k] = Math.ceil(q * ZI.REPAIR_FACTOR * missingFrac);
    });
  } else {
    // Fallback: tier-scaled generic metal cost when no recipe backs the item.
    const rank = ZI.tierRank(item);
    materials.metal = Math.max(1, Math.ceil((5 + rank * 6) * ZI.REPAIR_FACTOR * missingFrac));
  }
  return { materials, rmat, missingFrac };
};
// Can the player afford a repair right now? (checks live ZI_MATERIALS + RMAT wallet)
ZI.canAffordRepair = function(item) {
  const cost = ZI.repairCost(item);
  const M = window.ZI_MATERIALS || {};
  for (const [k, q] of Object.entries(cost.materials)) { if (((M[k] && M[k].current) || 0) < q) return false; }
  const hold = ZI.getRmatHoldings();
  for (const [k, q] of Object.entries(cost.rmat)) { if ((hold[k] || 0) < q) return false; }
  return true;
};
// Deduct cost and refill to max. Returns true on success.
ZI.repairItem = function(item) {
  if (!ZI.itemHasDurability(item)) return false;
  if (!ZI.canAffordRepair(item)) return false;
  const cost = ZI.repairCost(item);
  const M = window.ZI_MATERIALS || {};
  Object.entries(cost.materials).forEach(([k, q]) => { if (M[k]) M[k].current = Math.max(0, M[k].current - q); });
  Object.entries(cost.rmat).forEach(([k, q]) => ZI.addRmat(k, -q));
  const m = ZI.getDuraMap();
  m[item.id] = ZI.itemDurabilityMax(item);
  ZI.saveDuraMap(m);
  if (ZI.emitAction) ZI.emitAction('repair', 1 + ZI.tierRank(item) * 0.5);
  return true;
};
// The starter med kit (the offering the Hearthguard want).
// Brief 12.6 #4: the starter kit (handmade pouch, med kit, scout kit) comes with the save, not a screen.
// Granted at save creation; zi_starter_kit_given grants it once to older saves that lack it.
// Older saves that already got the med kit under the old rule (zi_fort_starter_given) do not get a second one.
ZI.ensureStarterKit = function() {
  if (ZI._rj('zi_starter_kit_given', false)) return false;
  const hadKit = ZI._rj('zi_fort_starter_given', false);
  ZI._wj('zi_starter_kit_given', true);
  if (!ZI.grantGear) return true;
  ZI.grantGear('handmade_pouch', 1);
  if (!hadKit) ZI.grantGear('medkit', 1);
  ZI.grantGear('scout_kit', 1);
  return true;
};
ZI.hasMedKit = function() {
  if ((ZI.getStash ? ZI.getStash() : []).includes('fort_medkit')) return true; // JD1a (B2): the Fort-bound Med Kit counts
  if ((ZI.getStash ? ZI.getStash() : []).includes('medkit')) return true;
  const lo = ZI.getLoadout ? ZI.getLoadout() : {}; return Object.values(lo).includes('medkit');
};
// Story items (brief 12.6 rule): weight only, no pocket, and never dropped, sold or lost to forced-retreat loss.
ZI.isStoryItem = function(idOrItem) { const it = typeof idOrItem === 'string' ? ZI.getGearItem(idOrItem) : idOrItem; return !!(it && it.isStory); };
ZI.canDiscard = function(idOrItem) { return !ZI.isStoryItem(idOrItem); };
// Use this for any drop/sell/loss path. It refuses story items.
ZI.removeFromStash = function(itemId, reason) {
  if (ZI.isStoryItem(itemId)) return false;
  const st = ZI.getStash(); const i = st.indexOf(itemId); if (i < 0) return false;
  st.splice(i, 1); ZI.saveStash(st); return true;
};
ZI.takeMedKit = function() {
  const st = ZI.getStash(); const f = st.indexOf('fort_medkit'); // JD1a (B2): the Fort-bound kit is handed in first; only it is consumed
  if (f >= 0) { st.splice(f, 1); ZI.saveStash(st); return true; }
  const i = st.indexOf('medkit');
  if (i >= 0) { st.splice(i, 1); ZI.saveStash(st); return true; }
  const lo = ZI.getLoadout(); const slot = Object.keys(lo).find(k => lo[k] === 'medkit');
  if (slot) { lo[slot] = null; ZI.saveLoadout(lo); return true; }
  return false;
};

// ═══ CARRYING — Batch 1A (spec §14, decisions recorded in §14.8, Oct 3) ═══════
// Stash = owned and stored at base · Carried = deliberately brought along (zi_carried) · Loadout = equipped.
// Pockets limit distinct carried items (by item size); kilograms limit total mass. Model only: no take/put-back UI,
// no stress, no overload effects, no charges, and no change to Wandering loot pickup in this batch.
ZI.BASE_CAPACITY_KG = 15;                          // §14.2 base with no carriers
ZI.CARRIER_SLOTS = ['backpack', 'belt', 'vest'];   // Pack, Belt, Body Armor — the only pocket-granting slots
ZI.DEFAULT_STACK_LIMIT = 5;                        // §14.8 #2
ZI.HARD_CARRY_PCT = 1.25;                          // §14.4: nothing more can be added above 125% of capacity
ZI.GEAR_SLOTS.push({ id:'belt', label:'Belt', accepts:'gear', group:'gear' });
// §14.8 #6: item data only (no recipes yet; owed in the crafting batch). Armor/speed mirror the closest existing item.
ZI.GEAR_ITEMS.push(
  { id:'belt_pouch',    name:'Belt Pouch',        slot:'belt',     cat:'gear',  rarity:'common',    icon:'👝', dmg:0, armor:0,  carryW:0, speedDelta:0,   lootBonus:0, desc:'2 pockets, +3 kg.' },
  { id:'satchel',       name:'Satchel',           slot:'belt',     cat:'gear',  rarity:'uncommon',  icon:'👜', dmg:0, armor:0,  carryW:0, speedDelta:0,   lootBonus:0, desc:'3 pockets, +5 kg.' },
  { id:'rucksack',      name:'Rucksack',          slot:'backpack', cat:'gear',  rarity:'uncommon',  icon:'🎒', dmg:0, armor:0,  carryW:0, speedDelta:-3,  lootBonus:0, desc:'2 pockets, +25 kg.' },
  { id:'cargo_jacket',  name:'Cargo Jacket',      slot:'vest',     cat:'armor', rarity:'common',    icon:'🧥', dmg:0, armor:8,  carryW:2, speedDelta:0,   lootBonus:0, desc:'Hunting jacket. 4 pockets, +2 kg.' },
  { id:'tactical_vest', name:'Tactical Vest',     slot:'vest',     cat:'armor', rarity:'rare',      icon:'🦺', dmg:0, armor:20, carryW:3, speedDelta:-4,  lootBonus:0, desc:'Best carrying. 7 pockets, +5 kg.' },
  { id:'heavy_plate',   name:'Heavy Plate Armor', slot:'vest',     cat:'armor', rarity:'legendary', icon:'🛡', dmg:0, armor:38, carryW:6, speedDelta:-12, lootBonus:0, desc:'Maximum protection. No pockets.' }
);
// §14.2 + §14.8 #3/#4 carrier numbers. 'slots' lists every slot an item may be equipped in.
ZI.CARRIER_DATA = {
  handmade_pouch: { pockets:2, capacityKg:5,  slots:['backpack','belt'] },
  backpack_sm:    { pockets:2, capacityKg:15 }, rucksack:   { pockets:2, capacityKg:25 },
  backpack_lg:    { pockets:2, capacityKg:35 }, molle_pack: { pockets:2, capacityKg:40 },
  belt_pouch:     { pockets:2, capacityKg:3 },  satchel:    { pockets:3, capacityKg:5 },
  vest_t1:        { pockets:2, capacityKg:0 },  cargo_jacket: { pockets:4, capacityKg:2 },
  old_padded_jacket: { pockets:2, capacityKg:0 }, // JD1a (B1)
  soft_armor_vest:{ pockets:2, capacityKg:0 },  vest_t3:    { pockets:5, capacityKg:3 },
  plate_carrier:  { pockets:5, capacityKg:3 },  tactical_vest: { pockets:7, capacityKg:5 },
  heavy_plate:    { pockets:0, capacityKg:0 },
};
Object.keys(ZI.CARRIER_DATA).forEach(id => { const g = ZI.getGearItem(id); if (g) Object.assign(g, ZI.CARRIER_DATA[id]); });
['medkit', 'scout_kit'].forEach(id => { const g = ZI.getGearItem(id); if (g) g.stackLimit = 1; }); // kits never stack (charges are per kit)
ZI.itemPocketSize = function(item) { if (!item || item.isStory) return 0; return item.pocketSize != null ? item.pocketSize : 1; };
ZI.itemStackLimit = function(item) {
  if (!item) return 1;
  if (item.stackLimit != null) return item.stackLimit;
  return item.cat === 'consumable' ? ZI.DEFAULT_STACK_LIMIT : 1;
};
ZI.itemAllowedSlots = function(item) { return item ? (item.slots || [item.slot]) : []; };
// ── Carried-items store (versioned list; never deletes on read) ──
ZI.CARRIED_KEY = 'zi_carried'; ZI.CARRIED_VER = 1;
// Old saves (and new ones): create an empty store once. Stash and loadout are never touched.
ZI.ensureCarriedStore = function() {
  if (localStorage.getItem(ZI.CARRIED_KEY) != null) return false;
  ZI._wj(ZI.CARRIED_KEY, { v: ZI.CARRIED_VER, items: [] }); return true;
};
// Normalised view: unknown ids are skipped (left in storage), quantities split into stacks at the stack limit.
ZI.normalizeCarried = function(items) {
  const out = [];
  (Array.isArray(items) ? items : []).forEach(e => {
    const g = e && ZI.getGearItem(e.id); if (!g) return;
    let q = Math.max(1, Math.floor(+e.qty || 1)); const lim = ZI.itemStackLimit(g);
    const one = q === 1 && e.charges != null; // Batch 2B: a kit entry keeps its own charge count (D3)
    while (q > 0) { const n = Math.min(lim, q); const ent = { id: e.id, qty: n }; if (one) ent.charges = e.charges; out.push(ent); q -= n; }
  });
  return out;
};
ZI.getCarried = function() { ZI.ensureCarriedStore(); const raw = ZI._rj(ZI.CARRIED_KEY, { v: ZI.CARRIED_VER, items: [] }); return ZI.normalizeCarried(raw.items); };
ZI.saveCarried = function(items) { ZI._wj(ZI.CARRIED_KEY, { v: ZI.CARRIED_VER, items: ZI.normalizeCarried(items) }); ZI._notifyInventory && ZI._notifyInventory(); };
// Wandering haul weight (same formula the Recycler uses for banked loot).
// Batch 3A: one canonical salvage-weight rule, shared by the Recycler (toRecyclerItem) and the Wandering haul.
ZI.salvageWeight = function(value) { return Math.max(0.5, Math.round(Math.max(1, value || 1) / 6 * 2) / 2); };
ZI.haulEntryWeight = function(e) { return e && typeof e.weight === 'number' ? e.weight : ZI.salvageWeight(e && e.value); };
// ── Totals: pockets and kilograms ──
ZI.carryTotals = function(loadout, carried, runState) {
  loadout = loadout || ZI.getLoadout(); carried = carried || ZI.getCarried();
  let pocketsMax = 0, capacityKg = ZI.BASE_CAPACITY_KG + ((ZI.getCapacity && ZI.getCapacity('backpackKg')) || 0), gearKg = 0;
  ZI.GEAR_SLOTS.forEach(s => {
    const g = loadout[s.id] && ZI.getGearItem(loadout[s.id]); if (!g) return;
    gearKg += ZI.itemWeight(g);
    if (ZI.CARRIER_SLOTS.includes(s.id)) { pocketsMax += g.pockets || 0; capacityKg += g.capacityKg || 0; }
  });
  let pocketsUsed = 0, carriedKg = 0;
  carried.forEach(e => { const g = ZI.getGearItem(e.id); pocketsUsed += ZI.itemPocketSize(g); carriedKg += ZI.itemWeight(g) * e.qty; });
  // §14.8 #1: story items are always on the survivor, wherever they are stored; weight only, no pocket.
  let storyKg = 0; ZI.getStash().forEach(id => { const g = ZI.getGearItem(id); if (g && g.isStory) storyKg += ZI.itemWeight(g); });
  const run = runState || (ZI.getWanderRun && ZI.getWanderRun()) || {};
  const haulKg = (Array.isArray(run.carried) ? run.carried : []).reduce((a, e) => a + ZI.haulEntryWeight(e), 0);
  const r1 = (v) => Math.round(v * 10) / 10;
  const loadKg = r1(gearKg + carriedKg + storyKg + haulKg);
  return { pocketsMax, pocketsUsed, pocketsFree: pocketsMax - pocketsUsed, capacityKg, hardLimitKg: r1(capacityKg * ZI.HARD_CARRY_PCT),
    loadKg, rawLoadKg: gearKg + carriedKg + storyKg + haulKg, gearKg: r1(gearKg), carriedKg: r1(carriedKg), storyKg: r1(storyKg), haulKg: r1(haulKg), overCapacity: loadKg > capacityKg };
};
// ── Validation (model level; the take/put-back actions and their location rule come in 1B) ──
ZI.canCarryAdd = function(id, qty) {
  const g = ZI.getGearItem(id); qty = Math.max(1, qty || 1);
  if (!g) return { ok:false, reason:'Unknown item.' };
  if (g.isStory) return { ok:false, reason:'Story items are always on you already.' };
  const next = ZI.getCarried().concat([{ id, qty }]);
  const t = ZI.carryTotals(null, ZI.normalizeCarried(next));
  if (t.pocketsUsed > t.pocketsMax) return { ok:false, reason:'No free pocket (' + t.pocketsUsed + '/' + t.pocketsMax + ').', totals:t };
  if (t.loadKg > t.hardLimitKg) return { ok:false, reason:'Too heavy: ' + t.loadKg + ' kg is over the ' + t.hardLimitKg + ' kg limit.', totals:t };
  return { ok:true, totals:t, overCapacity: t.overCapacity };
};
// Merges into an existing stack first (stack limit respected by normalizeCarried).
ZI._carriedAdd = function(id, qty) {
  const c = ZI.canCarryAdd(id, qty); if (!c.ok) return c;
  ZI.saveCarried(ZI.getCarried().concat([{ id, qty: Math.max(1, qty || 1) }])); return { ok:true };
};
ZI._carriedRemove = function(id, qty) {
  const g = ZI.getGearItem(id); if (g && g.isStory) return { ok:false, reason:'Story items cannot be put away.' };
  let left = Math.max(1, qty || 1); const items = ZI.getCarried();
  for (let i = items.length - 1; i >= 0 && left > 0; i--) if (items[i].id === id) { const n = Math.min(left, items[i].qty); items[i].qty -= n; left -= n; }
  if (left > 0) return { ok:false, reason:'Not carried.' };
  ZI.saveCarried(items.filter(e => e.qty > 0)); return { ok:true };
};
// Start/base cell or an established camp cell (no travel position yet counts as base).
ZI.atBaseOrCamp = function() { const z = ZI.getTravZone && ZI.getTravZone(); if (!z || z.gx == null) return true; return ZI.isHomeCell(z.gx, z.gy); };
// §14.8 #5: losing pockets. At base, overflow returns to the stash; in the field, refuse and name what to drop first.
ZI._carrierChangeCheck = function(newLoadout) {
  const carried = ZI.getCarried(); const t = ZI.carryTotals(newLoadout, carried);
  if (t.pocketsUsed <= t.pocketsMax) return { ok:true };
  if (ZI.atBaseOrCamp()) {
    const keep = carried.slice(), back = []; let used = t.pocketsUsed;
    for (let i = keep.length - 1; i >= 0 && used > t.pocketsMax; i--) { const ps = ZI.itemPocketSize(ZI.getGearItem(keep[i].id)); if (!ps) continue; used -= ps; back.push(keep[i]); keep.splice(i, 1); }
    return { ok:true, keep, back };
  }
  const names = carried.filter(e => ZI.itemPocketSize(ZI.getGearItem(e.id)) > 0).map(e => ZI.getGearItem(e.id).name + (e.qty > 1 ? ' ×' + e.qty : ''));
  return { ok:false, reason:'Not enough pockets without this carrier (' + t.pocketsUsed + ' used, ' + t.pocketsMax + ' left). Drop items first: ' + names.join(', ') + '.' };
};
ZI._returnCarriedToStash = function(keep, back) {
  ZI.saveCarried(keep); const st = ZI.getStash();
  back.forEach(e => { for (let i = 0; i < e.qty; i++) st.push(e.id); }); ZI.saveStash(st);
};
ZI.lastEquipError = null;
(function() {
  const baseEquip = ZI.equipGear, baseUnequip = ZI.unequipGear, baseResolve = ZI.resolveLoadoutStats;
  ZI.equipGear = function(itemId, slotId) {
    ZI.lastEquipError = null;
    const g = ZI.getGearItem(itemId); if (!g) return null;
    if (slotId === 'belt' && !ZI.itemAllowedSlots(g).includes('belt')) { ZI.lastEquipError = g.name + ' does not fit the Belt slot.'; return null; }
    if (!ZI.CARRIER_SLOTS.includes(slotId)) return baseEquip(itemId, slotId);
    const lo = ZI.getLoadout(); lo[slotId] = itemId;
    const chk = ZI._carrierChangeCheck(lo); if (!chk.ok) { ZI.lastEquipError = chk.reason; return null; }
    const r = baseEquip(itemId, slotId);
    if (r && chk.back && chk.back.length) { ZI._returnCarriedToStash(chk.keep, chk.back); r.stash = ZI.getStash(); r.returnedToStash = chk.back; }
    return r;
  };
  ZI.unequipGear = function(slotId) {
    ZI.lastEquipError = null;
    const lo = ZI.getLoadout();
    if (!ZI.CARRIER_SLOTS.includes(slotId) || !lo[slotId]) return baseUnequip(slotId);
    lo[slotId] = null;
    const chk = ZI._carrierChangeCheck(lo);
    if (!chk.ok) { ZI.lastEquipError = chk.reason; return { loadout: ZI.getLoadout(), stash: ZI.getStash(), refused: true, reason: chk.reason }; }
    const r = baseUnequip(slotId);
    if (chk.back && chk.back.length) { ZI._returnCarriedToStash(chk.keep, chk.back); r.stash = ZI.getStash(); r.returnedToStash = chk.back; }
    return r;
  };
  // The 0–100 carry value is retired as the authority: carryCapacity is now "% of kg capacity free", worked out from kg.
  ZI.resolveLoadoutStats = function(loadout) {
    const r = baseResolve(loadout); const t = ZI.carryTotals(loadout || ZI.getLoadout());
    r.loadKg = t.loadKg; r.capacityKg = t.capacityKg; r.pocketsUsed = t.pocketsUsed; r.pocketsMax = t.pocketsMax;
    r.carryCapacity = t.capacityKg > 0 ? Math.max(0, Math.min(100, Math.round(100 * (1 - t.loadKg / t.capacityKg)))) : 0;
    return r;
  };
})();
// Developer-only: grant any item for testing (not shown in the UI). Call from the console.
ZI.devGrantItem = function(id, qty) { return ZI.getGearItem(id) ? ZI.grantGear(id, qty || 1) : false; };

// ─── BATCH 1B: take / put back, and the base-or-camp rule (§14.8) ─────────────
// Moving items between the stash and the survivor (taking, putting back, equipping, unequipping) is only
// allowed on the start/base cell or an established camp cell. Refusals are reported to open screens.
ZI.CARRY_BASE_ONLY_MSG = 'You can only change what you carry at your base or a camp.';
ZI.lastCarryMessage = null;
ZI.reportCarryRefusal = function(msg) { ZI.lastCarryMessage = msg ? { text: msg, at: Date.now() } : null; ZI._notifyInventory && ZI._notifyInventory(); };
ZI.stashCount = function(id) { return ZI.getStash().filter(x => x === id).length; };
ZI.takeToCarried = function(id, qty) {
  qty = Math.max(1, Math.floor(qty || 1));
  const fail = (r) => { ZI.reportCarryRefusal(r); return { ok:false, reason:r }; };
  if (!ZI.atBaseOrCamp()) return fail(ZI.CARRY_BASE_ONLY_MSG);
  const g = ZI.getGearItem(id); if (!g) return fail('Unknown item.');
  if (g.isStory) return fail('Story items are always on you already.');
  const have = ZI.stashCount(id); if (have < qty) return fail('Only ' + have + ' in the stash.');
  const c = ZI.canCarryAdd(id, qty); if (!c.ok) return fail(c.reason);
  const st = ZI.getStash(); for (let i = 0; i < qty; i++) st.splice(st.indexOf(id), 1);
  ZI.lastCarryMessage = null;
  ZI.saveStash(st); ZI.saveCarried(ZI.getCarried().concat([{ id, qty }]));
  return { ok:true, overCapacity: c.overCapacity };
};
ZI.putBackToStash = function(id, qty) {
  qty = Math.max(1, Math.floor(qty || 1));
  const fail = (r) => { ZI.reportCarryRefusal(r); return { ok:false, reason:r }; };
  if (!ZI.atBaseOrCamp()) return fail(ZI.CARRY_BASE_ONLY_MSG);
  const r = ZI._carriedRemove(id, qty); if (!r.ok) return fail(r.reason);
  const st = ZI.getStash(); for (let i = 0; i < qty; i++) st.push(id);
  ZI.lastCarryMessage = null; ZI.saveStash(st);
  return { ok:true };
};
// Equip/unequip move items to and from the stash, so they follow the same location rule.
(function() {
  const eq = ZI.equipGear, uneq = ZI.unequipGear;
  ZI.equipGear = function(itemId, slotId) {
    if (!ZI.atBaseOrCamp()) { ZI.lastEquipError = ZI.CARRY_BASE_ONLY_MSG; ZI.reportCarryRefusal(ZI.CARRY_BASE_ONLY_MSG); return null; }
    const r = eq(itemId, slotId);
    if (!r && ZI.lastEquipError) ZI.reportCarryRefusal(ZI.lastEquipError);
    return r;
  };
  ZI.unequipGear = function(slotId) {
    if (!ZI.atBaseOrCamp()) {
      // Keep §14.8 #5's information too: if taking off this carrier would also lose pockets, name what to drop first.
      let reason = ZI.CARRY_BASE_ONLY_MSG; const lo = ZI.getLoadout();
      if (ZI.CARRIER_SLOTS.includes(slotId) && lo[slotId]) { lo[slotId] = null; const chk = ZI._carrierChangeCheck(lo); if (!chk.ok) reason += ' ' + chk.reason; }
      ZI.lastEquipError = reason; ZI.reportCarryRefusal(reason);
      return { loadout: ZI.getLoadout(), stash: ZI.getStash(), refused: true, reason };
    }
    const r = uneq(slotId);
    if (r && r.refused) ZI.reportCarryRefusal(r.reason);
    return r;
  };
})();

// Gear wear from one won fight (shared simulation, live and offline): equipped weapon + body armor.
// Returns the names of items that wore out on this kill.
ZI.wearEquippedOnKill = function() {
  const lo = ZI.getLoadout(), worn = [];
  const drain = (slotId) => {
    const g = lo[slotId] && ZI.getGearItem(lo[slotId]);
    if (!g || !ZI.itemHasDurability(g)) return;
    const before = ZI.itemDurability(g);
    ZI.applyWear(g, ZI.itemDrainPerUse(g) * (ZI.fortWearMult ? ZI.fortWearMult() : 1) * (ZI.stressWearMult ? ZI.stressWearMult() : 1));
    const after = ZI.itemDurability(g);
    if (after && after.current <= 0 && before && before.current > 0) worn.push(g.name);
  };
  const weaponSlot = ['primary','secondary','melee'].find(sl => lo[sl]);
  if (weaponSlot) drain(weaponSlot);
  drain('vest');
  return worn;
};
