// Skill books and collectible tomes. Books grant profession XP modifiers when
// read; tome copies unlock schematics only after the collection and skill gates.
ZI.LITERATURE_ITEMS = [
  { id:'book_gunsmith_library', name:'Gunsmith Library: The Series', cat:'book', bookProfession:'combat', bookXpPct:10, icon:'📘', rarity:'rare', carryW:0.2, desc:'Read once for a permanent +10% Combat profession XP bonus.' },
  { id:'book_will_i_ever_die', name:'Will I Ever Die', cat:'book', bookProfession:'firstAid', bookXpPct:10, icon:'📕', rarity:'rare', carryW:0.2, desc:'Read once for a permanent +10% First Aid profession XP bonus.' },
  { id:'tome_foraging_hippies', name:'Foraging for Hippies', cat:'tome', tomeSeries:'foraging_hippies', icon:'📜', rarity:'epic', carryW:0.25, desc:'A physical copy for the Foraging for Hippies tome series.' },
  { id:'tome_smithing_mjolnir', name:'Smithing with Mjolnir', cat:'tome', tomeSeries:'smithing_mjolnir', icon:'📜', rarity:'epic', carryW:0.25, desc:'A physical copy for the Smithing with Mjolnir tome series.' },
  { id:'tome_chokes_enclosed', name:'Chokes & Enclosed', cat:'tome', tomeSeries:'chokes_enclosed', icon:'📜', rarity:'rare', carryW:0.25, desc:'A physical copy for the Chokes & Enclosed tome series.' },
  { id:'tome_small_arms_workshop', name:'Small Arms Without a Workshop', cat:'tome', tomeSeries:'small_arms_workshop', icon:'📜', rarity:'rare', carryW:0.25, desc:'A physical copy for the Small Arms Without a Workshop tome series.' },
  { id:'tome_i_shall_be_your_eyes', name:'I Shall Be Your Eyes', cat:'tome', tomeSeries:'i_shall_be_your_eyes', icon:'📜', rarity:'rare', carryW:0.25, desc:'A physical copy for the I Shall Be Your Eyes tome series.' },
  { id:'tome_ballet_bad_weather', name:'Ballet for Bad Weather', cat:'tome', tomeSeries:'ballet_bad_weather', icon:'📜', rarity:'rare', carryW:0.25, desc:'A physical copy for the Ballet for Bad Weather tome series.' },
  { id:'tome_lightfoots_quiet_step', name:'The Lightfoot’s Quiet Step', cat:'tome', tomeSeries:'lightfoots_quiet_step', icon:'📜', rarity:'rare', carryW:0.25, desc:'A physical copy for The Lightfoot’s Quiet Step tome series.' },
  { id:'tome_reload_this_series', name:'Reload This: The Series', cat:'tome', tomeSeries:'reload_this', icon:'📜', rarity:'epic', carryW:0.25, desc:'A physical copy for the Reload This tome series.' },
  { id:'tome_knights_reliquary_charter', name:'The Knight’s Reliquary: A Charter Series', cat:'tome', tomeSeries:'knights_reliquary', icon:'📜', rarity:'epic', carryW:0.25, desc:'A physical copy for The Knight’s Reliquary tome series.' },
  { id:'tome_armorer_range_log', name:'The Armorer’s Range Log', cat:'tome', tomeSeries:'armorer_range_log', icon:'📜', rarity:'rare', carryW:0.25, desc:'A physical copy for The Armorer’s Range Log tome series.' },
  { id:'tome_hardware_and_things', name:'Hardware and Things', cat:'tome', tomeSeries:'hardware_and_things', icon:'📜', rarity:'rare', carryW:0.25, desc:'A physical copy for the Hardware and Things tome series.' },
  { id:'tome_management_under_stress', name:'Management Under Stress', cat:'tome', tomeSeries:'management_under_stress', icon:'📜', rarity:'rare', carryW:0.25, desc:'A physical copy for the Management Under Stress tome series.' },
  { id:'tome_last_night_series', name:'The Last Night: The Series', cat:'tome', tomeSeries:'last_night', icon:'📜', rarity:'epic', carryW:0.25, desc:'A physical copy for The Last Night tome series.' },
];
ZI.GEAR_ITEMS.push(...ZI.LITERATURE_ITEMS);

ZI.TOME_SERIES = [
  { id:'foraging_hippies', name:'Foraging for Hippies', cap:50, profession:'foraging', milestones:[
    { copies:10, recipe:'cr_salvagers_oil', item:'Salvager’s Oil', requirements:{ foraging:5 } },
    { copies:20, recipe:'cr_rmat_attractor', item:'RMAT Attractor', requirements:{ foraging:10, discovery:5 } },
    { copies:50, recipe:'cr_molle_pack', item:'MOLLE Pack', requirements:{ foraging:20, mechanical:10 } },
  ] },
  { id:'smithing_mjolnir', name:'Smithing with Mjolnir', cap:100, profession:'smithing', milestones:[
    { copies:10, recipe:'cr_combat_knife', item:'Combat Knife', requirements:{ smithing:5, combat:5 } },
    { copies:20, recipe:'cr_machete_blade', item:'Machete Blade', requirements:{ smithing:10, combat:10 } },
    { copies:50, recipe:'cr_combat_axe', item:'Combat Axe', requirements:{ smithing:20, combat:15 } },
    { copies:70, recipe:'cr_shock_baton', item:'Shock Baton', requirements:{ smithing:25, engineering:10 } },
    { copies:85, recipe:'cr_siegebreaker_maul', item:'Siegebreaker Maul', requirements:{ smithing:30, combat:25 } },
    { copies:100, recipe:'cr_jet_sledge', item:'Jet-Assisted Sledge', requirements:{ smithing:35, engineering:25 }, station:'Armory Rank 3' },
  ] },
  { id:'chokes_enclosed', name:'Chokes & Enclosed', cap:50, profession:'combat', milestones:[
    { copies:10, recipe:'cr_pipe_shotgun', item:'Improvised Pipe Shotgun', requirements:{ combat:5, smithing:5 } },
    { copies:20, recipe:'cr_crossbow', item:'Crossbow', requirements:{ combat:12, mechanical:8 } },
    { copies:50, recipe:'cr_plate_carrier', item:'Plate Carrier', requirements:{ combat:22, smithing:18 }, station:'Armory (Rank 3)' },
  ] },
  { id:'small_arms_workshop', name:'Small Arms Without a Workshop', cap:50, profession:'mechanical', milestones:[
    { copies:10, recipe:'cr_pipe_pistol', item:'Pipe Pistol', requirements:{ mechanical:5, combat:5 } },
    { copies:20, recipe:'cr_shock_pistol', item:'Shock Pistol', requirements:{ mechanical:12, engineering:8 } },
    { copies:50, recipe:'cr_arc_carbine', item:'Arc Carbine', requirements:{ mechanical:22, engineering:18 }, station:'Research Lab (Rank 2)' },
  ] },
  { id:'i_shall_be_your_eyes', name:'I Shall Be Your Eyes', cap:50, profession:'discovery', milestones:[
    { copies:10, recipe:'cr_sensor_rig', item:'Sensor Rig', requirements:{ discovery:5, mechanical:5 } },
    { copies:20, recipe:'cr_tacticians_lens', item:'Tactician’s Lens', requirements:{ discovery:12, engineering:8 } },
    { copies:50, recipe:'cr_scholars_tonic', item:'Scholar’s Tonic', requirements:{ discovery:22, medical:15 }, station:'Research Lab (Rank 3)' },
  ] },
  { id:'ballet_bad_weather', name:'Ballet for Bad Weather', cap:50, profession:'stealth', milestones:[
    { copies:10, recipe:'cr_runners_cloak', item:'Runner’s Cloak', requirements:{ stealth:5, foraging:5 } },
    { copies:20, recipe:'cr_compound_bow', item:'Compound Bow', requirements:{ stealth:12, engineering:8 } },
    { copies:50, recipe:'thermal_gel', item:'Thermal Gel', requirements:{ stealth:22, medical:15 }, station:'Armory (Rank 2)' },
  ] },
  { id:'lightfoots_quiet_step', name:'The Lightfoot’s Quiet Step', cap:50, profession:'stealth', milestones:[
    { copies:10, recipe:'cr_ghost_wrap', item:'Ghost Wrap', requirements:{ stealth:5, mechanical:5 } },
    { copies:20, recipe:'cr_smoke_vial', item:'Smoke Vial', requirements:{ stealth:12, medical:8 } },
    { copies:50, recipe:'cr_combat_boots', item:'Combat Boots', requirements:{ stealth:22, smithing:15 }, station:'Armory (Rank 1)' },
  ] },
  { id:'reload_this', name:'Reload This: The Series', cap:100, profession:'combat', milestones:[
    { copies:10, recipe:'hollow_point_press', item:'Hollow Point Press', requirements:{ combat:5, mechanical:5 } },
    { copies:30, recipe:'cr_combat_focus_draught', item:'Combat Focus Draught', requirements:{ combat:12, medical:8 } },
    { copies:60, recipe:'cr_void_pulse_rifle', item:'Void Pulse Rifle', requirements:{ combat:22, engineering:18 }, station:'Fracture Point' },
    { copies:100, recipe:'cr_warlords_sigil', item:'Warlord’s Sigil', requirements:{ combat:30, smithing:25 }, station:'Armory (Rank 4)' },
  ] },
  { id:'knights_reliquary', name:'The Knight’s Reliquary: A Charter Series', cap:100, profession:'smithing', milestones:[
    { copies:10, recipe:'cr_spike_board', item:'Spike Board', requirements:{ smithing:5, combat:5 } },
    { copies:30, recipe:'cr_steel_baton', item:'Steel Baton', requirements:{ smithing:12, combat:8 } },
    { copies:60, recipe:'cr_riot_helmet', item:'Riot Helmet', requirements:{ smithing:22, combat:18 }, station:'Armory (Rank 1)' },
    { copies:100, recipe:'cr_perimeter_helmet', item:'Perimeter Helmet', requirements:{ smithing:30, engineering:25 }, station:'Perimeter Access' },
  ] },
  { id:'armorer_range_log', name:'The Armorer’s Range Log', cap:50, profession:'smithing', milestones:[
    { copies:10, recipe:'cr_scrap_helmet', item:'Scrap Helmet', requirements:{ smithing:5, mechanical:5 } },
    { copies:20, recipe:'cr_soft_armor_vest', item:'Soft Armor Vest', requirements:{ smithing:12, medical:8 }, station:'Infirmary (Rank 1)' },
    { copies:50, recipe:'cr_composite_helmet', item:'Composite Helmet', requirements:{ smithing:22, engineering:15 }, station:'Armory (Rank 2)' },
  ] },
  { id:'hardware_and_things', name:'Hardware and Things', cap:50, profession:'mechanical', milestones:[
    { copies:10, recipe:'reinforced_pack', item:'Reinforced Pack', requirements:{ mechanical:5, scavenging:5 } },
    { copies:20, recipe:'wire_mesh_trap', item:'Wire Mesh Trap', requirements:{ mechanical:12, engineering:8 } },
    { copies:50, recipe:'signal_booster', item:'Signal Booster', requirements:{ mechanical:22, engineering:15 }, station:'Radio Tower (Rank 1)' },
  ] },
  { id:'management_under_stress', name:'Management Under Stress', cap:50, profession:'command', milestones:[
    { copies:10, recipe:'cr_trauma_kit', item:'Trauma Kit', requirements:{ command:5, firstAid:5 } },
    { copies:20, recipe:'sterilization_unit', item:'Sterilization Unit', requirements:{ command:12, medical:8 }, station:'Infirmary (Rank 2)' },
    { copies:50, recipe:'cr_echo_siphon', item:'Echo Siphon', requirements:{ command:22, logistics:15 }, station:'Generator (Rank 2)' },
  ] },
  { id:'last_night', name:'The Last Night: The Series', cap:100, profession:'firstAid', milestones:[
    { copies:10, recipe:'cr_field_bandage', item:'Field Bandage', requirements:{ firstAid:5, medical:5 } },
    { copies:30, recipe:'cr_trauma_dressing', item:'Trauma Dressing', requirements:{ firstAid:12, medical:8 }, station:'Infirmary (Rank 1)' },
    { copies:60, recipe:'cr_nanite_serum', item:'Nanite Repair Serum', requirements:{ firstAid:22, engineering:18 }, station:'Biolab (Rank 2)' },
    { copies:100, recipe:'cr_revenant_infusion', item:'Revenant Infusion', requirements:{ firstAid:30, medical:25 }, station:'Revenant Program' },
  ] },
];

const LITERATURE_KEY = 'zi_literature_state';
const readLiteratureState = () => { const s = ZI._rj ? ZI._rj(LITERATURE_KEY, {}) : {}; return s && typeof s === 'object' && !Array.isArray(s) ? s : {}; };
const saveLiteratureState = s => { if (ZI._wj) ZI._wj(LITERATURE_KEY, s); };
ZI._literatureListeners = [];
ZI.onLiteratureChange = function(fn) { ZI._literatureListeners.push(fn); return () => { ZI._literatureListeners = ZI._literatureListeners.filter(f => f !== fn); }; };
ZI._notifyLiteratureChange = function() { (ZI._literatureListeners || []).slice().forEach(fn => { try { fn(); } catch (e) {} }); };
ZI.bookXpBonuses = function() {
  const read = readLiteratureState().readBooks || {}, out = {};
  ZI.LITERATURE_ITEMS.filter(it => it.cat === 'book' && read[it.id]).forEach(it => { out[it.bookProfession] = (out[it.bookProfession] || 0) + it.bookXpPct; });
  return out;
};
ZI.bookXpBonus = function(profession) { return (ZI.bookXpBonuses()[profession] || 0); };
ZI.isSkillBookRead = function(itemId) { return !!(readLiteratureState().readBooks || {})[itemId]; };
ZI.readSkillBook = function(itemId) {
  const item = ZI.getGearItem(itemId), state = readLiteratureState();
  if (!item || item.cat !== 'book') return { ok:false, reason:'That is not a skill book.' };
  if (!ZI.atBaseOrCamp()) return { ok:false, reason:'Read books at base or camp.' };
  if (!ZI.getStash().includes(itemId)) return { ok:false, reason:'Store the book at base before reading it.' };
  state.readBooks = state.readBooks || {};
  if (state.readBooks[itemId]) return { ok:false, reason:'You have already learned from this title.' };
  state.readBooks[itemId] = true; saveLiteratureState(state); ZI._notifyLiteratureChange();
  return { ok:true, profession:item.bookProfession, percent:item.bookXpPct, text:`Read ${item.name}: +${item.bookXpPct}% ${item.bookProfession} XP from now on.` };
};
ZI.tomeSeriesProgress = function(seriesId) {
  const series = ZI.TOME_SERIES.find(s => s.id === seriesId); if (!series) return null;
  const state = readLiteratureState(); state.tomeCounts = state.tomeCounts || {};
  const physical = ZI.getStash ? ZI.getStash().filter(id => { const it = ZI.getGearItem(id); return it && it.tomeSeries === seriesId; }).length : 0;
  state.tomeCounts[seriesId] = Math.min(series.cap, Math.max(state.tomeCounts[seriesId] || 0, physical));
  const copies = state.tomeCounts[seriesId];
  const levels = ZI.PROFESSIONS || [];
  const milestones = series.milestones.map(m => {
    const missing = Object.entries(m.requirements).filter(([p, level]) => (ZI.statLevel ? ZI.statLevel(p) : 1) < level).map(([p, level]) => {
      const name = (levels.find(x => x.id === p) || { name:p }).name; return `${name} ${level}`;
    });
    const ready = copies >= m.copies && missing.length === 0;
    if (ready && m.recipe && ZI.unlockShopRecipe) ZI.unlockShopRecipe(m.recipe);
    return { ...m, reached:copies >= m.copies, ready, missing };
  });
  saveLiteratureState(state);
  return { series, copies, milestones, next:milestones.find(m => !m.ready) || null };
};
ZI.creditTomeCopy = function(itemId, qty) {
  const item = ZI.getGearItem(itemId); if (!item || item.cat !== 'tome' || !item.tomeSeries) return false;
  const state = readLiteratureState(); state.tomeCounts = state.tomeCounts || {};
  const series = ZI.TOME_SERIES.find(s => s.id === item.tomeSeries); if (!series) return false;
  state.tomeCounts[series.id] = Math.min(series.cap, (state.tomeCounts[series.id] || 0) + Math.max(1, Math.floor(qty || 1)));
  saveLiteratureState(state); ZI.tomeSeriesProgress(series.id); ZI._notifyLiteratureChange(); return true;
};
ZI.tomeSchematicGate = function(recipeId) {
  for (const series of ZI.TOME_SERIES) {
    const milestone = series.milestones.find(m => m.recipe === recipeId);
    if (milestone) {
      const progress = ZI.tomeSeriesProgress(series.id);
      const current = progress && progress.milestones.find(m => m.recipe === recipeId);
      return { series:series.name, seriesId:series.id, currentCopies:progress ? progress.copies : 0, copies:milestone.copies, item:milestone.item, requirements:milestone.requirements, station:milestone.station || null, missing:current ? current.missing : [], unlocked:!!(current && current.ready && ZI.isRecipeUnlocked && ZI.isRecipeUnlocked(recipeId)) };
    }
  }
  return null;
};
// Literature is rare field loot. It enters the survivor's carried pack and must be brought home.
ZI.rollLiteratureLoot = function(cell) {
  const poi = (cell && cell.poiType) || '';
  const focused = /library|school|clinic|hospital|armory|workshop|smith|scrapyard/i.test(poi);
  if (Math.random() >= (focused ? 0.08 : 0.025)) return null;
  const candidates = ZI.LITERATURE_ITEMS.filter(it => it.cat === 'tome' || (focused && it.cat === 'book'));
  if (!candidates.length) return null;
  const item = candidates[Math.floor(Math.random() * candidates.length)];
  const added = ZI._carriedAdd ? ZI._carriedAdd(item.id, 1) : { ok:false };
  return added.ok ? item : null;
};
ZI.ungroupedTomeCount = function() {
  const ids = ZI.LITERATURE_ITEMS.filter(it => it.cat === 'tome' && !it.tomeSeries).map(it => it.id);
  const count = items => (items || []).reduce((n, e) => n + (ids.includes(e.id) ? (e.qty || 1) : 0), 0);
  return (ZI.getStash ? ZI.getStash().filter(id => ids.includes(id)).length : 0) + count(ZI.getCarried ? ZI.getCarried() : []);
};
ZI.burnLiterature = function(itemId) {
  const item = ZI.getGearItem(itemId);
  if (!item || !['book','tome'].includes(item.cat)) return { ok:false, reason:'That item cannot be turned into kindling.' };
  if (!ZI.atBaseOrCamp()) return { ok:false, reason:'Convert literature to kindling at base or camp.' };
  const stash = ZI.getStash(), at = stash.indexOf(itemId); if (at < 0) return { ok:false, reason:'Store it at base first.' };
  if (item.tomeSeries) ZI.tomeSeriesProgress(item.tomeSeries);
  stash.splice(at, 1); ZI.saveStash(stash);
  const fuel = window.ZI_MATERIALS && window.ZI_MATERIALS.fuel;
  if (fuel) fuel.current = Math.min(fuel.max, fuel.current + 1);
  ZI._notifyLiteratureChange();
  return { ok:true, fuel: fuel ? fuel.current : null, text:`Converted ${item.name} into kindling.` };
};
