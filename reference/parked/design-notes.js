// reference/design-notes.js — design-note tables that no screen or game module reads.
// NOT loaded by any page. Moved here from the game/ modules in change 4 (dead design data cleanup) after a
// project-wide search found no runtime references. Kept for reference; do not load.
// [PARKED] Predates spec v2.0. Not authoritative. Check against the spec before reusing anything.
window.ZI = window.ZI || {};

// from game/combat.js
// Detailed per-family combat stats once meant for the expandable Codex screen.
// minHit/maxHit: damage range per strike · hitChance: base to-land % · accuracy: targeting precision rating
// critChance/critMult: crit odds & damage multiplier · lifesteal: % of damage dealt recovered as HP
// damageReduction: flat % incoming mitigation · evasionMelee/evasionRanged: % chance to dodge that attack type
ZI.ZOMBIE_CODEX = [
  { id:'shambler', name:'Shambler', tier:0, family:'Baseline', color:'#a2dca2', danger:1,
    desc:'Slow, witless world-filler. Lethal only in numbers. The first thing every survivor learns to kill.',
    biomes:['Mountain','Suburbia','Metro'], weakness:'Blunt · Fire · Noise traps',
    stats:{ minHit:2, maxHit:4, hitChance:55, accuracy:30, critChance:2, critMult:1.5, lifesteal:0, damageReduction:0, evasionMelee:2, evasionRanged:0 } },

  { id:'runner', name:'Runner', tier:1, family:'Ambusher', color:'#f08a52', danger:2,
    desc:'Sprints on sight, punishes noise. Packs form fast. The reason you never reload in the open.',
    biomes:['Suburbia','Metro'], weakness:'Obstacles · Stamina drain · Spike traps',
    stats:{ minHit:4, maxHit:7, hitChance:70, accuracy:55, critChance:8, critMult:1.6, lifesteal:0, damageReduction:0, evasionMelee:18, evasionRanged:25 } },

  { id:'spitter', name:'Spitter', tier:2, family:'Ranged Harasser', color:'#a0d040', danger:3,
    desc:'Lobs corrosive bile from range, forcing repositioning. Fragile up close — if you can reach it.',
    biomes:['Suburbia','Perimeter'], weakness:'Precision damage · Funneling corridors',
    stats:{ minHit:5, maxHit:9, hitChance:62, accuracy:75, critChance:6, critMult:1.7, lifesteal:0, damageReduction:5, evasionMelee:10, evasionRanged:8 } },

  { id:'brute', name:'Brute', tier:3, family:'Tank', color:'#e0624c', danger:4,
    desc:'Structure-breaker. Slow but relentless, shrugs off small-arms fire. Bring something heavy.',
    biomes:['Metro','Perimeter'], weakness:'High-damage melee · Explosives · Distraction',
    stats:{ minHit:9, maxHit:15, hitChance:65, accuracy:40, critChance:5, critMult:2.0, lifesteal:0, damageReduction:30, evasionMelee:0, evasionRanged:0 } },

  { id:'burrower', name:'Burrower', tier:4, family:'Subterranean', color:'#6a5848', danger:4,
    desc:'Tunnels beneath terrain and erupts at point-blank. Ambush predator of the deep zones.',
    biomes:['Perimeter'], weakness:'Vibration · Seismic traps · Hammer/Pike',
    stats:{ minHit:7, maxHit:12, hitChance:80, accuracy:60, critChance:15, critMult:1.8, lifesteal:8, damageReduction:10, evasionMelee:30, evasionRanged:12 } },

  { id:'radiationWalker', name:'Radiation Walker', tier:4, family:'Mutation Specialist', color:'#d0f040', danger:5,
    desc:'Glowing apex mutant that bleeds radiation. Drains the living to sustain itself.',
    biomes:['Perimeter'], weakness:'Hazard armor · Irradiated weapons · Energy fields',
    stats:{ minHit:8, maxHit:14, hitChance:68, accuracy:65, critChance:10, critMult:1.9, lifesteal:20, damageReduction:18, evasionMelee:12, evasionRanged:10 } },

  { id:'titan', name:'Titan Mutant', tier:5, family:'Apex / Boss', color:'#c894ff', danger:5,
    desc:'A wall of corrupted muscle and bone. RMAT-saturated, near-unstoppable. Run, or commit everything.',
    biomes:['Perimeter'], weakness:'Sustained focus fire · Apex-tier gear · Anomaly weapons',
    stats:{ minHit:17, maxHit:30, hitChance:60, accuracy:45, critChance:12, critMult:2.5, lifesteal:15, damageReduction:45, evasionMelee:0, evasionRanged:5 } },
];

// from game/survival-data.js
ZI.SURVIVOR_ROLES = ['Scavenger','Guard','Engineer','Medic','Farmer','Cook','Mechanic','Scout'];

// from game/survival-data.js
ZI.NOISE_SOURCES = {
  // Action: { db, range_m, duration_s, attractsFrom_direction }
  Gunshot_Pistol:     { db: 140, range: 120, duration: 10,  note: 'PZ: single pistol shot clears a block-radius within seconds' },
  Gunshot_Shotgun:    { db: 160, range: 200, duration: 15,  note: 'PZ: most dangerous noise source in dense areas' },
  Gunshot_Suppressed: { db: 90,  range: 30,  duration: 4,   note: 'PZ: suppressors reduce range by ~75%' },
  MeleeAttack:        { db: 60,  range: 20,  duration: 1,   note: 'PZ: melee is quiet but grunts/thuds still attract close zombies' },
  RunningFootsteps:   { db: 50,  range: 15,  duration: 0.5, note: 'PZ: running players leave a noise trail every 2 steps' },
  WalkingFootsteps:   { db: 30,  range: 5,   duration: 0.3, note: 'PZ: walking is near-silent on soft ground' },
  CrouchWalk:         { db: 15,  range: 2,   duration: 0.2, note: 'PZ: sneak movement, minimal noise, core stealth tactic' },
  CarEngine:          { db: 120, range: 150, duration: 60,  note: 'PZ: vehicles are the loudest sustained noise source' },
  HornHonk:           { db: 150, range: 300, duration: 5,   note: 'PZ: horn = instant horde bait, also used as distraction' },
  BreakingGlass:      { db: 80,  range: 50,  duration: 3,   note: 'PZ: smashing windows is loud; use elbow or crowbar quietly' },
  Hammering:          { db: 100, range: 80,  duration: 30,  note: 'PZ: construction attracts zombies; build at dawn or use doors' },
  Generator:          { db: 90,  range: 70,  duration: 3600,note: 'PZ: running generator all night = guaranteed horde by morning' },
  CrowbarDoor:        { db: 70,  range: 35,  duration: 5,   note: 'PZ: forced entry much noisier than lockpicking' },
  Coughing:           { db: 55,  range: 18,  duration: 2,   note: 'PZ: sick characters cough involuntarily, revealing position' },
  Scream:             { db: 145, range: 250, duration: 8,   note: 'PZ: panic screams are near-gunshot level; avoid high fear' },
};

// from game/survival-data.js
ZI.CRAFTING_LOGIC = {
  qualitySystem: {
    // PZ: crafting quality scales with skill level (1-10 in each skill)
    // Zombie Idler: crafting quality scales with Class Level + Profession
    Poor:        { classLevel: [1,3],  qualityMod: 0.70, note: 'PZ: "Poorly crafted" items have lower durability and stats' },
    Normal:      { classLevel: [4,6],  qualityMod: 1.00 },
    Good:        { classLevel: [7,8],  qualityMod: 1.20 },
    Exceptional: { classLevel: [9,10], qualityMod: 1.40, note: 'PZ: master craftsmen produce items that rival manufactured gear' },
  },
  toolRequirements: {
    // PZ: you need the right tool or the recipe fails
    // Tier gates in Zombie Idler follow PZ's tool-gating philosophy
    Workbench:      { tier: 1, allows: ['Basic weapons','Simple repairs','Crude armor'] },
    WeaponBench:    { tier: 2, allows: ['Firearm mods','Blade sharpening','Socket installation'] },
    Forge:          { tier: 3, allows: ['Metal alloys','Armor crafting','Heavy melee'] },
    MedStation:     { tier: 2, allows: ['Medicine brewing','Antibiotic synthesis','Suture kits'] },
    AnomalyForge:   { tier: 5, allows: ['RMAT Exotics','Legendary traits','Reality-infused gear'],
                      note: 'No PZ equivalent — apex tier unique to Zombie Idler\'s RMAT system' },
  },
  disassembly: {
    // PZ: disassembling items gives XP and parts — a core scavenging loop
    note: 'Zombie Idler\'s Salvage system mirrors PZ disassembly: break down any item for components + Scrapping XP',
    skillGain: 'Scrapping profession XP per disassembly',
    rmatRecovery: '5-15% RMAT residue chance on T2+ items',
  },
};

// from game/survival-data.js
ZI.SCAVENGING = {
  containerSearch: {
    // PZ: searching takes time proportional to container size; skill speeds this up
    timeModifiers: {
      Scavenging_L1: 1.00,
      Scavenging_L5: 0.75,
      Scavenging_L10: 0.50, // PZ: veteran scavengers are twice as fast
    },
    luckBonus: {
      Lucky_10: +0.05,   // per 10 Lucky stat points
      Lucky_100: +0.50,  // max Lucky = 50% better loot rolls
    },
  },
  // PZ zone categories (adapted)
  zones: {
    Residential:   { searchTime: 8,  specialItems:['Food','Clothing','Simple tools','Meds'], rmatChance: 0.01 },
    Commercial:    { searchTime: 12, specialItems:['Electronics','Packaged food','Cash register loot'], rmatChance: 0.03 },
    Industrial:    { searchTime: 15, specialItems:['Heavy tools','Metal scrap','Vehicle parts'], rmatChance: 0.08 },
    Hospital:      { searchTime: 10, specialItems:['All medical supplies','Rare antibiotics'], rmatChance: 0.12 },
    Military:      { searchTime: 20, specialItems:['Military weapons','Ammo','Explosives','Body armor'], rmatChance: 0.20, danger:'Very High' },
    Laboratory:    { searchTime: 25, specialItems:['RMAT clusters','Research data','Exotic compounds'], rmatChance: 0.45, danger:'Apex' },
  },
  exhaustedContainers: {
    note: 'PZ: containers don\'t respawn. Once looted, they stay empty permanently (on default settings). Zombie Idler uses long respawn timers (7-30 days) to simulate scarcity without permanent depletion.',
    respawnDays: { civilian: 7, industrial: 14, military: 21, laboratory: 30 },
  },
};

// from game/survival-data.js
ZI.CAMP_DEFENSE_LOGIC = {
  wallTypes: {
    // PZ: log walls → wooden walls → metal walls (each takes more damage before breach)
    Scrap_Barricade:  { hpPerPanel: 50,  tier:1, zombieBreachTime:'20s', materials:'Scrap ×10' },
    Wooden_Wall:      { hpPerPanel: 150, tier:2, zombieBreachTime:'90s', materials:'Wood ×20' },
    Reinforced_Wall:  { hpPerPanel: 400, tier:3, zombieBreachTime:'5m',  materials:'Metal ×30 + Engineering L5' },
    Composite_Wall:   { hpPerPanel: 1000,tier:4, zombieBreachTime:'20m', materials:'Alloy ×40 + RMAT-1 ×2' },
    RMAT_Barrier:     { hpPerPanel: 5000,tier:5, zombieBreachTime:'Never (standard)', materials:'RMAT-4 ×5 + Anomaly Forge' },
  },
  // PZ: kill corridors funnel zombies into optimal defensive positions
  killCorridors: {
    note: 'PZ tactic: barricade all but one entrance, put traps + shooters at the funnel. Zombie Idler formalizes this as "Defense Rating" which improves with Watchtower + Turret + Wall combo.',
    bonuses: {
      FunnelSetup: '+25% Defense Rating',
      OverwatchPosition: '+15% ammo efficiency',
      TrapLane: '+40% damage to funnel zombies',
    },
  },
  hordeScaling: {
    note: 'PZ: hordes scale with time, population density, and noise events. After day 30 in Zombie Idler, horde composition shifts — more Runners, Brutes appear, eventually Mutants. Mirrors PZ\'s population respawn and migration mechanics.',
    day_milestones: {
      day_1_10:   'Shamblers (85%), Runners (15%) — PZ Week 1 equivalent',
      day_11_30:  'Shamblers (65%), Runners (25%), Spitters (10%) — PZ Month 1',
      day_31_60:  'Runners (40%), Spitters (25%), Brutes (20%), Mutants (15%)',
      day_61_plus:'Apex variants appear — PZ late-game density equivalent',
    },
  },
};
