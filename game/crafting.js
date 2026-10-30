// game/crafting.js — Crafting recipes, gear-recipe generation, drop rates.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
// Everything attaches to the shared global ZI object; load-time calls live in game/bootstrap.js.

// ─── CRAFTING RECIPES (v2 — 35 recipes across T0–T5) ─────────────────────────
// cost keyed by the six base materials. time in seconds. out = display outputs.
ZI.CRAFT_RECIPES = [
  // ── T0 — Trace (Common) ──
  { id:'scrap_pouch',  name:'Scrap Pouch',  icon:'👝', tier:0, out:[{n:'Trace RMAT',q:3}], cost:{wood:10,metal:5}, time:180, unlock:'Default', enemy:'Shambler', lore:'A bag made from a torn jacket and twist ties. Holds things. Barely.' },
  { id:'nail_board',   name:'Nail Board',   icon:'🪓', tier:0, out:[{n:'Trace RMAT',q:2}], cost:{wood:15,metal:8}, time:300, unlock:'Default', enemy:'Shambler', lore:'A plank. With nails in it. Classic.' },
  { id:'scrap_wire',   name:'Scrap Wire',   icon:'🔗', tier:0, out:[{n:'Trace RMAT',q:4}], cost:{metal:20}, time:480, unlock:'Default', enemy:'Crawler', lore:'Stripped from a chain-link fence. Still has rust. You call that character.' },
  { id:'tinder_bundle',name:'Tinder Bundle',icon:'🌿', tier:0, out:[{n:'Trace RMAT',q:2},{n:'Fuel',q:5}], cost:{wood:25}, time:360, unlock:'Default', enemy:'Crawler', lore:'Dried bark, dead leaves, and something unidentifiable. It burns, which is all that matters.' },
  // MED-01 (Sam, Oct 30): M1 renamed to Crude Crutch, id kept so existing saves survive.
  // M4 it no longer outputs Trace RMAT — it produces the crutch itself. kind:'gear' keeps the
  // RMAT grant in jobs.js from firing. M8: Trace RMAT now unlocks the next medical tier instead.
  { id:'crude_splint', name:'Crude Crutch', icon:'🩼', tier:0, kind:'gear', out:[{n:'Crude Crutch',q:1}], grantsGear:'crude_splint', grantsQty:1, cost:{wood:10,cloth:8}, time:240, unlock:'Scavenge Camp (Rank 1)', enemy:'Crawler', lore:"Two sticks and a strip of curtain. A field doctor's last resort." },
  // MED-01 M9: the upgrade. Gated by ZI.recipeGate below; craft time is [PROPOSED].
  { id:'improvised_splint', name:'Improvised Splint', icon:'🪢', tier:1, kind:'gear', out:[{n:'Improvised Splint',q:1}], grantsGear:'improvised_splint', grantsQty:1, cost:{wood:15,cloth:12}, time:600, unlock:'Trace RMAT ×10', enemy:'Crawler', lore:'Padded, bound and actually set. The limb keeps mending after you walk away.' },

  // ── T1 — Scrap-Grade (Uncommon) ──
  { id:'reinforced_pack',name:'Reinforced Pack',icon:'🎒', tier:1, out:[{n:'Mechanical RMAT',q:1}], cost:{metal:40}, time:2700, unlock:'Default', enemy:'Shambler', lore:'Stitched together from warehouse shelving and dumpster finds. Smells like regret.' },
  { id:'barricade_panel',name:'Barricade Panel',icon:'🪵', tier:1, out:[{n:'Structural RMAT',q:1}], cost:{wood:25,metal:20}, time:1800, unlock:'Default', enemy:'Crawler', lore:"Salvaged lumber nailed into a crude barrier. Holds until it doesn't." },
  { id:'cloth_wrap_kit', name:'Cloth Wrap Kit', icon:'🩹', tier:1, out:[{n:'Medical RMAT',q:2}], cost:{cloth:20,medical:5}, time:1200, unlock:'Default', enemy:'Crawler', lore:'Torn shirts and antiseptic wipes. Crude but effective in a pinch.' },
  { id:'fuel_drum',      name:'Fuel Drum',      icon:'🛢', tier:1, out:[{n:'Chem RMAT',q:1},{n:'Fuel',q:20}], cost:{wood:40,metal:20,fuel:15}, time:3000, unlock:'Scavenge Camp (Rank 1)', enemy:'Runner', lore:"A sealed metal drum re-welded at the seams. Leaks occasionally. You've accepted this." },
  { id:'signal_booster', name:'Signal Booster', icon:'📡', tier:1, out:[{n:'Electronic RMAT',q:1}], cost:{metal:15,electronics:20,wood:10}, time:3300, unlock:'Radio Tower (Rank 1)', enemy:'Runner', lore:'A coat hanger soldered to a transistor radio circuit board. Somehow it works.' },
  { id:'trauma_kit',     name:'Trauma Kit',     icon:'🧰', tier:1, out:[{n:'Medical RMAT',q:1},{n:'Bio RMAT',q:1}], cost:{cloth:30,medical:20,electronics:5}, time:2400, unlock:'Infirmary (Rank 1)', enemy:'Spitter', lore:'Stitched from surgical tubing and a tackle box. Contains more hope than medicine.' },
  { id:'wire_mesh_trap', name:'Wire Mesh Trap', icon:'🕸', tier:1, out:[{n:'Mechanical RMAT',q:1}], cost:{metal:35,wood:20}, time:2100, unlock:'Perimeter (Rank 1)', enemy:'Shambler', lore:'Bent rebar woven into a funnel shape. The zombie goes in. The zombie does not come out.' },

  // ── T2 — Refined (Rare) ──
  { id:'arc_igniter',    name:'Arc Igniter',    icon:'⚡', tier:2, out:[{n:'Energy RMAT',q:1}], cost:{metal:15,electronics:25,fuel:10}, time:4800, unlock:'Research Lab', enemy:'Runner', lore:'Salvaged capacitors rigged to a car battery. Produces sparks on demand — and occasionally on accident.' },
  { id:'fuel_converter', name:'Fuel Converter', icon:'🔥', tier:2, out:[{n:'Chem RMAT',q:1}], cost:{metal:20,electronics:10,fuel:40}, time:6300, unlock:'Outpost Rank 2', enemy:'Spitter', lore:'A re-purposed diesel siphon modified with copper tubing. Converts waste oil into RMAT-grade fuel cells.' },
  { id:'hollow_point_press',name:'Hollow Point Press',icon:'🔧', tier:2, out:[{n:'Mechanical RMAT',q:1},{n:'Ammo',q:10}], cost:{metal:40,wood:15,fuel:10}, time:5400, unlock:'Armory (Rank 1)', enemy:'Runner', lore:'A modified reloading press from a gun shop backroom. The dies are improvised. The brass is questionable.' },
  { id:'sterilization_unit',name:'Sterilization Unit',icon:'🧫', tier:2, out:[{n:'Medical RMAT',q:2}], cost:{metal:25,cloth:20,medical:30,fuel:10}, time:7200, unlock:'Infirmary (Rank 2)', enemy:'Spitter', lore:'A pressure cooker modified with UV tubes and copper coil. Kills 99.9% of known pathogens. Unknown ones are on their own.' },
  { id:'composite_plating',name:'Composite Plating',icon:'🛡', tier:2, out:[{n:'Structural RMAT',q:1}], cost:{metal:50,wood:30,cloth:20}, time:9000, unlock:'Perimeter (Rank 2)', enemy:'Brute', lore:"Layers of corrugated steel and hardboard pressed together in a vise. It's heavy. That's the point." },
  { id:'circuit_splice', name:'Circuit Splice', icon:'💡', tier:2, out:[{n:'Electronic RMAT',q:1}], cost:{electronics:35,metal:10,fuel:5}, time:4200, unlock:'Research Lab (Rank 2)', enemy:'Runner', lore:'Fourteen salvaged circuit boards, reprogrammed with a cracked laptop and a lot of patience.' },
  { id:'toxin_filter',   name:'Toxin Filter',   icon:'🧪', tier:2, out:[{n:'Chem RMAT',q:1},{n:'Bio RMAT',q:1}], cost:{cloth:20,medical:15,fuel:25}, time:8100, unlock:'Outpost (Rank 3)', enemy:'Spitter', lore:'Activated charcoal packed into a gas mask canister. Filters most things. Do not test with Spitter acid.' },

  // ── T3 — Concentrated (Epic) ──
  { id:'neural_tap',     name:'Neural Tap',     icon:'🧠', tier:3, out:[{n:'Bio RMAT',q:1}], cost:{metal:10,cloth:10,electronics:40,fuel:5,medical:30}, time:10800, unlock:'Metro Clearance', enemy:'Brute', lore:'A disturbing fusion of surgical wire and zombie nervous tissue. Not recommended for the squeamish.' },
  { id:'siege_frame',    name:'Siege Frame',    icon:'🛡', tier:3, out:[{n:'Heavy RMAT',q:1}], cost:{metal:80,wood:30,electronics:15,fuel:20}, time:14400, unlock:'Armory Rank 3', enemy:'Titan', lore:'Welded armor plating stripped from an APC. Slow to build. Worth every hour.' },
  { id:'resonance_cell', name:'Resonance Cell', icon:'🔋', tier:3, out:[{n:'Energy RMAT',q:1},{n:'Chem RMAT',q:1}], cost:{electronics:60,fuel:40,metal:20}, time:12600, unlock:'Generator (Rank 2)', enemy:'Titan', lore:'A repurposed lithium cell stack wired in series with a homemade voltage regulator. The hum it makes is not reassuring.' },
  { id:'bone_weave_vest',name:'Bone Weave Vest',icon:'🦴', tier:3, out:[{n:'Bio RMAT',q:1},{n:'Structural RMAT',q:1}], cost:{cloth:50,medical:30,wood:20,metal:15}, time:16200, unlock:'Biolab (Rank 1)', enemy:'Brute', lore:'Hardened bone fragments from cleared zones, woven into tactical fabric. Lighter than it looks. Heavier than it should be.' },
  { id:'emp_coil',       name:'EMP Coil',       icon:'📻', tier:3, out:[{n:'Electronic RMAT',q:1}], cost:{electronics:70,fuel:30,metal:20,cloth:10}, time:18000, unlock:'Comms Array (Rank 2)', enemy:'Titan', lore:'A coil the size of a trash can lid, wound by hand over three days. When it fires, the lights go out. All the lights.' },
  { id:'hazard_patch_kit',name:'Hazard Patch Kit',icon:'☢️', tier:3, out:[{n:'Medical RMAT',q:2},{n:'Chem RMAT',q:1}], cost:{cloth:40,medical:50,fuel:20,electronics:10}, time:13500, unlock:'Infirmary (Rank 3)', enemy:'Spitter', lore:'A full decontamination kit reverse-engineered from a hazmat response manual. The manual was missing pages. You improvised.' },

  // ── T4 — Crystallized (Legendary) ──
  { id:'crystalline_core',name:'Crystalline Core',icon:'💎', tier:4, out:[{n:'Apex RMAT',q:1}], cost:{metal:50,electronics:80,fuel:60,medical:20}, time:28800, unlock:'Perimeter Access', enemy:'Colossus', lore:'A pulsing shard of stabilized RMAT crystal. Handle with lead gloves. Do not smell.' },
  { id:'plasma_conduit', name:'Plasma Conduit', icon:'🌡', tier:4, out:[{n:'Energy RMAT',q:1},{n:'Apex RMAT',q:1}], cost:{electronics:100,fuel:80,metal:30}, time:36000, unlock:'Generator (Rank 3)', enemy:'Colossus', lore:'A length of reinforced copper piping fused with RMAT crystal shards. It glows faintly. Best not to touch it longer than necessary.' },
  { id:'necrotic_membrane',name:'Necrotic Membrane',icon:'🫀', tier:4, out:[{n:'Bio RMAT',q:1},{n:'Apex RMAT',q:1}], cost:{medical:60,cloth:40,electronics:50,fuel:20}, time:32400, unlock:'Biolab (Rank 2)', enemy:'Colossus', lore:'A membrane harvested from a Colossus-class zombie, preserved in a sealed culture medium. It is still technically alive. This is intentional.' },
  { id:'siege_engine_frame',name:'Siege Engine Frame',icon:'🏗', tier:4, out:[{n:'Heavy RMAT',q:2}], cost:{metal:120,wood:60,electronics:40,fuel:30}, time:43200, unlock:'Armory (Rank 4)', enemy:'Colossus', lore:'The frame of a mobile artillery piece, stripped down and re-welded into a stationary siege platform. The original purpose is irrelevant now.' },
  { id:'quantum_splice_board',name:'Quantum Splice Board',icon:'🖥', tier:4, out:[{n:'Electronic RMAT',q:1},{n:'Chem RMAT',q:1}], cost:{electronics:90,metal:50,fuel:30,cloth:20}, time:25200, unlock:'Research Lab (Rank 3)', enemy:'Colossus', lore:"A motherboard redesigned from first principles after finding a pre-outbreak engineering textbook. Three of the chips on it don't exist in any known catalog." },

  // ── T5 — Exotic Echo (Exotic) — manual confirm only ──
  { id:'echo_condenser', name:'Echo Condenser', icon:'🌀', tier:5, out:[{n:'Exotic RMAT',q:1}], cost:{electronics:150,fuel:100,medical:50}, time:86400, unlock:'Nightmare Clearance', enemy:'Nightmare', lore:"Theoretical. The schematics appeared in your shelter overnight. You don't remember finding them." },
  { id:'void_lattice',   name:'Void Lattice',   icon:'🕳', tier:5, out:[{n:'Exotic RMAT',q:2}], cost:{electronics:200,metal:120,fuel:80,cloth:60}, time:129600, unlock:'Echo Chamber (Rank 1)', enemy:'Nightmare', lore:"A lattice of RMAT crystal grown in a resonance field over days. The structure doesn't match any known crystallographic pattern. It matches something else." },
  { id:'fracture_engine',name:'Fracture Engine',icon:'💥', tier:5, out:[{n:'Exotic RMAT',q:1},{n:'Apex RMAT',q:1},{n:'Energy RMAT',q:1}], cost:{electronics:180,fuel:150,metal:90,medical:40}, time:172800, unlock:'Void Reactor (Rank 1)', enemy:'Nightmare', lore:"A device that shouldn't work. The math says it can't. The math is wrong. You've learned not to question the math." },
  { id:'revenant_core',  name:'Revenant Core',  icon:'💀', tier:5, out:[{n:'Exotic RMAT',q:1}], cost:{medical:100,cloth:80,electronics:100,fuel:50}, time:72000, unlock:'Biolab (Rank 3)', enemy:'Nightmare', lore:"Something between a heart and a battery. It pulses at irregular intervals. You've started timing your breathing to it. You're trying to stop." },
  { id:'signal_zero',    name:'Signal Zero',    icon:'📶', tier:5, out:[{n:'Exotic RMAT',q:1}], cost:{metal:200,wood:100,electronics:80,fuel:60}, time:57600, unlock:'Comms Array (Rank 3)', enemy:'Nightmare', lore:"A broadcast on a frequency that shouldn't carry signal. Something is listening. You've decided that's fine." },
];
// Existing recipes output RMAT currencies.
ZI.CRAFT_RECIPES.forEach(r => { if (!r.kind) r.kind = 'rmat'; });

// ─── GEAR & CONSUMABLE RECIPES (craft straight into the equip stash) ─────────
// Intermediate-component chains from the spec are collapsed to base-material
// costs for the prototype. grantsGear puts the finished item in the stash.
// NOTE: invoked later via ZI._appendGearRecipes() — AFTER GEAR_ITEMS exists.
ZI._gearRecipe = function(gearId, qty, tier, time, cost, unlock) {
  const g = ZI.getGearItem(gearId);
  return { id:'cr_'+gearId, name:g.name, icon:g.icon, tier,
    kind:(g.cat === 'consumable' ? 'consumable' : 'gear'),
    out:[{ n:g.name, q:qty }], cost, time, unlock: unlock || 'Default',
    grantsGear:gearId, grantsQty:qty, lore:g.desc };
};
ZI._appendGearRecipes = function(){ const R = ZI._gearRecipe; ZI.CRAFT_RECIPES.push(
  // ── Consumables ──
  R('rag_wrap',3,0,180,{cloth:10,wood:5}), R('lucky_charm',2,0,240,{wood:10,cloth:5}),
  R('scrap_adrenaline',2,0,240,{fuel:10,medical:5}), R('coal_paste',2,0,420,{wood:15,fuel:8}),
  R('field_bandage',2,1,1200,{cloth:20,medical:10}), R('focus_tabs',2,1,1500,{medical:20,electronics:10,fuel:5},'Research Lab'),
  R('salvagers_oil',2,1,1500,{fuel:25,metal:15,wood:10},'Scavenge Camp (Rank 1)'),
  R('trauma_dressing',2,2,3600,{cloth:30,medical:25,electronics:10},'Infirmary (Rank 1)'),
  R('overclock_patch',1,2,6300,{electronics:35,medical:20,fuel:15},'Research Lab (Rank 2)'),
  R('rmat_attractor',1,2,4800,{electronics:35,metal:20,fuel:15,medical:10},'Research Lab (Rank 1)'),
  R('thermal_gel',1,2,7200,{metal:25,fuel:20,cloth:20,electronics:15},'Armory (Rank 2)'),
  R('combat_stim_iv',1,3,10800,{medical:40,electronics:25,cloth:20,fuel:15},'Infirmary (Rank 2)'),
  R('apex_combat',1,3,12600,{medical:50,electronics:35,fuel:25,metal:20},'Armory (Rank 3)'),
  R('echo_siphon',1,3,14400,{electronics:50,fuel:35,metal:25},'Generator (Rank 2)'),
  R('nanite_serum',1,4,28800,{medical:60,electronics:40,fuel:30},'Biolab (Rank 2)'),
  R('crystalline_surge',1,4,36000,{medical:70,electronics:60,fuel:40},'Crystallization Chamber (Rank 1)'),
  R('crystalline_resonator',1,4,43200,{electronics:70,fuel:50,metal:40},'Crystallization Chamber (Rank 1)'),
  R('revenant_infusion',1,5,86400,{medical:80,cloth:60,electronics:50,fuel:30},'Revenant Program'),
  R('echo_state',1,5,108000,{medical:100,electronics:80,fuel:60},'Echo Chamber (Rank 1)'),
  R('singularity_seed',1,5,115200,{electronics:100,fuel:80,metal:60,medical:40},'Fracture Point'),
  // ── Melee ──
  R('iron_knuckles',1,1,1800,{metal:30}), R('pipe_pistol',1,1,2400,{metal:25,wood:10}),
  R('spike_board',1,1,2700,{wood:50,metal:30},'Armory (Rank 1)'),
  R('combat_knife',1,2,3600,{metal:40,cloth:15},'Armory (Rank 1)'),
  R('steel_baton',1,2,4500,{metal:45},'Armory (Rank 1)'),
  R('machete_blade',1,2,5400,{metal:50,cloth:20,wood:15},'Armory (Rank 2)'),
  R('combat_axe',1,3,9000,{metal:70,wood:20,cloth:10},'Armory (Rank 2)'),
  R('shock_baton',1,3,10800,{metal:40,electronics:50,fuel:20},'Research Lab (Rank 2)'),
  R('jet_sledge',1,4,21600,{metal:90,fuel:60,electronics:20},'Armory (Rank 3)'),
  R('siegebreaker_maul',1,5,72000,{metal:120,wood:40,fuel:45,electronics:35},'Armory (Rank 4)'),
  // ── Ranged ──
  R('pipe_shotgun',1,1,3600,{metal:40,wood:20},'Armory (Rank 1)'),
  R('compound_bow',1,2,6300,{wood:40,metal:25,cloth:20},'Workshop (Rank 1)'),
  R('crossbow',1,2,7200,{wood:40,metal:40,cloth:10},'Armory (Rank 2)'),
  R('shock_pistol',1,3,9000,{metal:30,electronics:50},'Research Lab (Rank 1)'),
  R('arc_carbine',1,3,14400,{metal:40,electronics:60,fuel:20},'Research Lab (Rank 2)'),
  R('flamethrower',1,4,28800,{metal:80,fuel:60,electronics:30},'Workshop (Rank 3)'),
  R('void_pulse_rifle',1,5,72000,{metal:90,electronics:80,fuel:60,medical:20},'Fracture Point'),
  // ── Armor & Utility ──
  R('scrap_helmet',1,1,2100,{metal:30,cloth:10}), R('leather_gloves',1,1,1800,{cloth:20,fuel:8}),
  R('soft_armor_vest',1,2,4500,{cloth:40,metal:25},'Infirmary (Rank 1)'),
  R('riot_helmet',1,2,5400,{metal:40,cloth:20},'Armory (Rank 1)'),
  R('combat_boots',1,2,3600,{metal:20,cloth:15,fuel:10},'Armory (Rank 1)'),
  R('composite_helmet',1,3,10800,{metal:60,cloth:30,electronics:10},'Armory (Rank 2)'),
  R('molle_pack',1,3,7200,{cloth:50,metal:20},'Workshop (Rank 1)'),
  R('sensor_rig',1,3,7200,{electronics:40,metal:20},'Research Lab (Rank 1)'),
  R('perimeter_helmet',1,4,25200,{metal:80,electronics:40,medical:20},'Perimeter Access'),
  R('plate_carrier',1,4,25200,{metal:90,cloth:40,electronics:20},'Armory (Rank 3)'),
  // ── Evade items (§4) ──
  R('runners_cloak',1,2,7200,{cloth:10},'Scout Post (Rank 1)'), R('ghost_wrap',1,3,10800,{cloth:20,electronics:10},'Scout Post (Rank 2)'),
  R('adrenaline_shot',2,2,3600,{medical:8,fuel:4}), R('smoke_vial',2,3,5400,{fuel:15,electronics:8},'Research Lab (Rank 1)'),
  // ── Attribute-XP bonus items (§5, T3–T5 investment) ──
  R('tacticians_lens',1,4,28800,{electronics:12,cloth:4},'Research Lab (Rank 3)'),
  R('warlords_sigil',1,5,72000,{metal:40,electronics:30,medical:20},'Armory (Rank 4)'),
  R('combat_focus_draught',2,3,10800,{medical:6},'Infirmary (Rank 2)'),
  R('scholars_tonic',2,4,21600,{medical:10,electronics:10},'Research Lab (Rank 3)')
); };

// Per-enemy RMAT drop-rate curves for the crafting detail panel (T0…T5 %).
ZI.CRAFT_DROP_RATES = {
  Shambler:  [55, 25, 12, 5, 2, 1],
  Crawler:   [60, 22, 10, 5, 2, 1],
  Runner:    [40, 30, 20, 7, 2, 1],
  Spitter:   [40, 30, 20, 7, 2, 1],
  Brute:     [25, 25, 25, 15, 7, 3],
  Titan:     [25, 25, 25, 15, 7, 3],
  Colossus:  [10, 15, 20, 25, 20, 10],
  Nightmare: [3, 7, 10, 15, 30, 35],
};

// ─── Recipe gates (MED-01, Oct 30) ───────────────────────────────────────────
// One entry point for "this recipe is listed but locked". The crafting browser calls
// ZI.recipeGate; tome schematics keep their own gate and are delegated to unchanged.
ZI.medRecipeGate = function(recipeId) {
  if (recipeId !== 'improvised_splint' || !ZI.MED_SPLINT_UNLOCK) return null;
  const U = ZI.MED_SPLINT_UNLOCK, held = (ZI.getRmatHoldings ? ZI.getRmatHoldings() : {})[U.rmatTier] || 0;
  const unlocked = ZI.isSplintUnlocked ? ZI.isSplintUnlocked() : false;
  return { label:'Medical Tier', series:'Trace RMAT', seriesId:'med_tier',
    currentCopies: Math.min(held, U.rmatQty), copies: U.rmatQty, item:'Improvised Splint',
    requirements:{}, station:null,
    missing: (unlocked || held >= U.rmatQty) ? [] : [(U.rmatQty - held) + ' more Trace RMAT'],
    unlocked: unlocked };
};
ZI.recipeGate = function(recipeId) {
  const med = ZI.medRecipeGate(recipeId);
  if (med) return med;
  return ZI.tomeSchematicGate ? ZI.tomeSchematicGate(recipeId) : null;
};
