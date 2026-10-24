// game/survival-data.js — Project Zomboid-style and older static tables still read by the screens.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
// Everything attaches to the shared global ZI object; load-time calls live in game/bootstrap.js.




ZI.NUTRITION = {
  levels: [
    { label: 'Starving',    min: 0,  max: 15,  staminaMod: -0.40, regenMod: -0.50, color: '#e0624c' },
    { label: 'Hungry',      min: 15, max: 35,  staminaMod: -0.20, regenMod: -0.25, color: '#f08a52' },
    { label: 'Underfed',    min: 35, max: 50,  staminaMod: -0.08, regenMod: -0.10, color: '#e6c47e' },
    { label: 'Fed',         min: 50, max: 65,  staminaMod:  0.00, regenMod:  0.00, color: '#a2dca2' },
    { label: 'Well Fed',    min: 65, max: 80,  staminaMod: +0.10, regenMod: +0.12, color: '#62d69a' },
    { label: 'Nourished',   min: 80, max: 92,  staminaMod: +0.18, regenMod: +0.20, color: '#74b6ee' },
    { label: 'Peak Fueled', min: 92, max: 100, staminaMod: +0.28, regenMod: +0.30, color: '#c894ff' },
  ],
  hydration: [
    { label: 'Dehydrated',  min: 0,  max: 20,  staminaMod: -0.30, color: '#e0624c' },
    { label: 'Thirsty',     min: 20, max: 45,  staminaMod: -0.12, color: '#e6c47e' },
    { label: 'Hydrated',    min: 45, max: 70,  staminaMod:  0.00, color: '#a2dca2' },
    { label: 'Well Hydrated', min: 70, max: 88, staminaMod: +0.08, color: '#74b6ee' },
    { label: 'Optimal',     min: 88, max: 100, staminaMod: +0.15, color: '#c894ff' },
  ],
};


// ─── CAMP BUILDINGS ──────────────────────────────────────────────────────────
ZI.BUILDINGS = [
  { id: 'farm',       name: 'Farm',           zone: 'agricultural', tier: 1, output: 'Food', icon: '🌿' },
  { id: 'workshop',   name: 'Workshop',       zone: 'industrial',   tier: 2, output: 'Refined Scrap', icon: '⚙️' },
  { id: 'forge',      name: 'Forge',          zone: 'industrial',   tier: 2, output: 'Metal Alloys', icon: '🔥' },
  { id: 'medtent',    name: 'Med Tent',       zone: 'recovery',     tier: 2, output: 'Medicine', icon: '⛑️' },
  { id: 'barracks',   name: 'Barracks',       zone: 'recovery',     tier: 1, output: 'Survivor Morale', icon: '🏠' },
  { id: 'watchtower', name: 'Watchtower',     zone: 'defense',      tier: 2, output: 'Threat Detection', icon: '👁️' },
  { id: 'turret',     name: 'Auto-Turret',    zone: 'defense',      tier: 3, output: 'Horde Defense', icon: '🎯' },
  { id: 'recycler',   name: 'Recycler',       zone: 'industrial',   tier: 2, output: 'Scrap Recovery', icon: '♻️' },
  { id: 'kitchen',    name: 'Kitchen',        zone: 'support',      tier: 2, output: 'Meals', icon: '🍲' },
  { id: 'generator',  name: 'Generator',      zone: 'support',      tier: 3, output: 'Power', icon: '⚡' },
  { id: 'comms',      name: 'Comms Tower',    zone: 'support',      tier: 3, output: 'Intel', icon: '📡' },
  { id: 'anomalyforge', name: 'Anomaly Forge',zone: 'industrial',   tier: 5, output: 'RMAT Exotics', icon: '🔮' },
];

// ─── SURVIVOR ROLES ──────────────────────────────────────────────────────────

// ─── MARKETPLACE ITEMS ───────────────────────────────────────────────────────
ZI.MARKET_ITEMS = [
  { id: 'rmat1_mech',  name: 'RMAT-1 Mechanical',  type: 'RMAT', tier: 1, basePrice: 45,  supply: 82, demand: 67 },
  { id: 'rmat2_chem',  name: 'RMAT-2 Chemical',    type: 'RMAT', tier: 2, basePrice: 180, supply: 41, demand: 78 },
  { id: 'rmat3_elec',  name: 'RMAT-3 Electronic',  type: 'RMAT', tier: 3, basePrice: 520, supply: 18, demand: 89 },
  { id: 'rmat4_anom',  name: 'RMAT-4 Anomalous',   type: 'RMAT', tier: 4, basePrice: 1800,supply: 5,  demand: 97 },
  { id: 'scrap_t2',    name: 'Refined Scrap (T2)',  type: 'Material', tier: 2, basePrice: 22, supply: 95, demand: 44 },
  { id: 'alloy_t3',    name: 'Hardened Alloy (T3)', type: 'Material', tier: 3, basePrice: 95, supply: 32, demand: 71 },
  { id: 'fireaxe',     name: 'Fire Axe (Clean)',    type: 'Weapon',   tier: 2, basePrice: 120, supply: 28, demand: 55 },
  { id: 'huntrifle',   name: 'Hunting Rifle (WM)',  type: 'Weapon',   tier: 3, basePrice: 380, supply: 12, demand: 82 },
  { id: 'hazsuit_t2',  name: 'Hazard Suit T2',      type: 'Armor',    tier: 2, basePrice: 260, supply: 20, demand: 68 },
  { id: 'medkit_adv',  name: 'Advanced Med-Kit',    type: 'Consumable',tier:2, basePrice: 75, supply: 55, demand: 81 },
  { id: 'blueprint_turret', name: 'Blueprint: Auto-Sentry', type: 'Blueprint', tier: 3, basePrice: 900, supply: 3, demand: 99 },
  { id: 'legendary_axe', name: 'Sunder Pulse Axe',  type: 'Legendary', tier: 4, basePrice: 3200, supply: 1, demand: 100 },
];

// ─── WORLD EVENTS ─────────────────────────────────────────────────────────────
ZI.WORLD_EVENTS = [
  { id: 'rmat_storm',    name: 'RMAT Storm',        duration: 12, effect: 'RMAT yield +40% · Hazard buildup ×2 · Mutation zones ×2', color: '#c894ff', active: true },
  { id: 'shortage',      name: 'Food Shortage',     duration: 8,  effect: 'Food prices +60% · Hearthguard contracts +bonus', color: '#f08a52', active: false },
  { id: 'migration',     name: 'Zombie Migration',  duration: 6,  effect: 'Threat +25% · New routes blocked · Horde size ×1.5', color: '#e0624c', active: false },
  { id: 'black_auction', name: 'Black Haven Auction', duration: 3, effect: 'Tier 4-5 items available · Risk of faction rep loss', color: '#b99be8', active: false },
];

// ─── SCHEDULED TASKS ─────────────────────────────────────────────────────────
ZI.TASK_TYPES = [
  { id: 'scavenge',   name: 'Scavenge Route',  icon: '🗺️',  duration: 4, category: 'solo' },
  { id: 'craft',      name: 'Craft Item',      icon: '⚙️',  duration: 2, category: 'both' },
  { id: 'train',      name: 'Train Stats',     icon: '💪',  duration: 3, category: 'both' },
  { id: 'assign',     name: 'Assign Survivor', icon: '👤',  duration: 1, category: 'camp' },
  { id: 'repair',     name: 'Repair Gear',     icon: '🔧',  duration: 2, category: 'both' },
  { id: 'trade',      name: 'Marketplace Trade', icon: '💰', duration: 1, category: 'both' },
  { id: 'rest',       name: 'Rest & Recover',  icon: '😴',  duration: 3, category: 'both' },
  { id: 'faction',    name: 'Faction Contract', icon: '🤝', duration: 4, category: 'both' },
  { id: 'defend',     name: 'Horde Defense',   icon: '🛡️',  duration: 2, category: 'camp' },
  { id: 'extract',    name: 'RMAT Extraction', icon: '💎',  duration: 5, category: 'solo' },
];

// ─── LOOT LOADING ITEMS ───────────────────────────────────────────────────────
ZI.LOOT_CATEGORIES = {
  heavy:  { label: 'Heavy Cargo',   timePerUnit: 4.5, desc: 'Metal alloys, fuel drums, vehicle parts' },
  medium: { label: 'Supply Crates', timePerUnit: 2.8, desc: 'Food stores, ammo boxes, toolkits' },
  light:  { label: 'RMAT Samples',  timePerUnit: 1.2, desc: 'Shards, cores, echo vials — handle carefully' },
  data:   { label: 'Intel Drives',  timePerUnit: 0.5, desc: 'Blueprints, maps, faction data' },
};

// ─── PROJECT ZOMBOID-INSPIRED SYSTEMS ────────────────────────────────────────
// PZ is the gold standard for realistic zombie survival simulation.
// These systems are justified by PZ's design logic and adapted for Zombie Idler.

// MOODLES — PZ's status effect system. In PZ, moodles cascade:
// Hungry → Very Hungry → Starving (each increasing panic, reducing combat, slowing healing)
// Zombie Idler uses the same cascade logic but as percentage modifiers on the SURVIVAL stat system.
ZI.MOODLES = {
  // BODY CONDITION (from PZ: Hungry/Thirsty/Tired/Sick/Injured/Stressed/Bored/Unhappy/Panicked)
  Hungry: {
    levels: ['Peckish','Hungry','Very Hungry','Famished','Starving'],
    // In PZ, each level reduces combat effectiveness, healing speed, and eventually causes fainting
    staminaPenalties: [0, -0.08, -0.18, -0.30, -0.45],
    healPenalties:    [0, -0.10, -0.25, -0.40, -0.60],
    xpPenalties:      [0, -0.05, -0.12, -0.25, -0.40],
    color: '#f08a52',
  },
  Thirsty: {
    levels: ['Thirsty','Very Thirsty','Parched','Dehydrated'],
    // PZ: dehydration causes faster stamina loss and blurred vision mechanics
    staminaPenalties: [-0.05, -0.15, -0.28, -0.45],
    speedPenalties:   [0, -0.05, -0.15, -0.30],
    color: '#74b6ee',
  },
  Tired: {
    levels: ['Tired','Very Tired','Exhausted','Dead Tired'],
    // PZ: exhaustion causes attack speed reduction, miss chance, and eventual forced sleep
    attackSpeedPenalties: [0, -0.10, -0.25, -0.50],
    awarenessPenalties:   [-0.05, -0.15, -0.30, -0.60],
    color: '#6b8f71',
  },
  Panicked: {
    levels: ['Anxious','Nervous','Scared','Terrified','Hysterical'],
    // PZ: panic increases weapon sway, reduces aiming accuracy, causes faster breathing (noise)
    accuracyPenalties: [0, -0.08, -0.20, -0.40, -0.70],
    noisePenalties:    [0, +0.10, +0.20, +0.35, +0.60], // more noise when panicked
    color: '#c894ff',
  },
  Sick: {
    levels: ['Queasy','Nauseous','Sick','Severely Sick'],
    // PZ: sickness drains health over time; zombification is a special sickness type
    hpDrainPerHour: [0, 1, 3, 8],
    staminaPenalties: [-0.05, -0.15, -0.30, -0.55],
    color: '#a2dca2',
    note: 'Zombie bites cause Infection moodle. Laceration = 25% infection chance. Bite = 100% fatal without antibiotics.',
  },
  Injured: {
    levels: ['Light Wound','Deep Wound','Bleeding','Fracture'],
    // PZ: wounds require bandaging; deep wounds need sutures; fractures need splints + time
    mobilityPenalties: [0, -0.10, -0.20, -0.50],
    bleedRatePerMin:   [0, 0, 2, 0], // units of blood lost per minute
    treatmentRequired: ['Bandage','Suture Kit','Bandage + Tourniquet','Splint + Rest'],
    color: '#e0624c',
  },
  Wet: {
    levels: ['Damp','Wet','Soaked','Drenched'],
    // PZ: wet clothing causes cold buildup, which leads to sickness
    coldBuildupRate: [0.5, 1.5, 3.0, 5.0], // per hour
    temperatureDrop: [-1, -3, -6, -10],
    color: '#74b6ee',
    note: 'Clothes dry over time if player stays warm and dry. Heavy rain = fastest soak.',
  },
};

// NOISE SYSTEM — PZ's most innovative mechanic
// Zombies in PZ use a sophisticated hearing model:
// - Every action has a dB rating that attracts nearby zombies
// - Noise travels through walls at reduced strength
// - Wind direction and speed modify noise range
// - Zombies remember noise sources and investigate

// INFECTION & ZOMBIFICATION — PZ's most impactful survival rule
// In PZ, Knox Infection (zombification) is always 100% fatal if bitten.
// Laceration = 25% chance. Scratch = 7% chance.
// This is the core tension driver of all PZ gameplay.
// Zombie Idler adapts this with RMAT-influenced variables:
ZI.INFECTION = {
  biteChance: 1.00,      // PZ: Knox Infection from bite = always
  lacerationChance: 0.25, // PZ: 25% from deep zombie scratch/laceration
  scratchChance: 0.07,   // PZ: 7% from shallow scratch
  zombificationHours: { min: 8, max: 72 }, // PZ: variable, based on server settings
  // Zombie Idler modifiers:
  rmatAntibioticCure: true,  // Medical RMAT can cure infection if caught early (< 6h)
  concordanceVaccine: { reducesChanceBy: 0.40, requiresRep: 'Allied' }, // Concordance research
  vitality_reduction: 0.004, // Each point of Vitality reduces bite infection chance by 0.4%
  hazardSuitReduction: 0.60, // T3+ Hazard Suit reduces infection from all sources by 60%
  symptoms: ['Fever','Sweating','Nausea','Confusion','Loss of consciousness','Reanimation'],
  note: 'The most important PZ rule: always check survivors for bites after horde events.',
};

// ZOMBIE BEHAVIOR MODEL — PZ's advanced zombie AI rules
// PZ zombies use a detailed perception model that Zombie Idler adapts for its simulation:
ZI.ZOMBIE_BEHAVIOR = {
  // HEARING (PZ: zombies hear proportional to noise level)
  hearing: {
    base_range_m: 10,  // zombie hears sounds within 10m baseline
    nightMultiplier: 0.8, // PZ: zombies slightly less effective at night (hearing same, vision worse)
    migration_threshold: 200, // above 200 zombies in area = migration wave begins
    note: 'PZ: zombies attracted to noise remember the source for ~30 seconds before losing interest',
  },
  // SIGHT (PZ: FOV cone, reduced in darkness/fog/rain)
  sight: {
    base_fov_degrees: 180,
    base_range_m: 20,
    nightRange_m: 8,    // PZ: dark nights are critically dangerous
    fogMultiplier: 0.4, // PZ: fog reduces zombie sight dramatically — use it
    rainMultiplier: 0.7,
    note: 'PZ: crouch behind objects to break line of sight; height matters (second floor windows)',
  },
  // MEMORY (PZ: zombies remember last known player position)
  memory: {
    duration_s: 60,     // PZ: zombies "forget" player after ~60s without stimuli
    attractorItems: ['Noise maker','Car alarm','Distraction device'], // items that hold attention
    note: 'PZ: "herding" zombies into zones and circling back is a core advanced tactic',
  },
  // MIGRATION (PZ: zombies migrate toward populated areas and noise)
  migration: {
    triggers: ['Large noise event','Building construction','Generator running','High survivor density','Horde event aftermath'],
    waveSizes: { small: '20-50', medium: '100-300', large: '500-2000', apocalypse: '5000+' },
    note: 'PZ: don\'t stay in one place too long — zombies naturally drift toward activity',
  },
  // SPRINT VARIANTS (PZ: server-configurable, Zombie Idler uses tiered system)
  movement: {
    Shambler:    { speed: 0.4, sprint: false, note: 'PZ default: slow, easy to kite individually, dangerous in groups' },
    Walker:      { speed: 0.7, sprint: false, note: 'PZ: slightly faster, used in Survivor/Apocalypse modes' },
    Runner:      { speed: 1.2, sprint: true,  note: 'PZ sprint zombies: the most feared variant, requires cornering tactics' },
    Crawler:     { speed: 0.2, sprint: false, note: 'PZ: near-silent floor hazard, easy to miss in darkness' },
    // Zombie Idler exclusive:
    Burrower:    { speed: 0.5, sprint: 'burst', note: 'Emerges from ground near player — PZ-style ambush surprise' },
    Titan_Mutant:{ speed: 0.6, sprint: false, note: 'Tank archetype — PZ Brute equivalent with RMAT corruption' },
  },
};

// LOOT SYSTEM — PZ's container-based probabilistic loot
// PZ uses defined container types each with specific item tables and rarities.
// Zombie Idler uses the same logic but extends it with RMAT anomaly modifiers.
ZI.LOOT_CONTAINERS = {
  // Container: { items[], baseChance, exhausted_after_loots, rmat_chance }
  Glovebox:       { items:['Maps','Ammo (pistol)','Keys','Snacks'], baseChance:0.70, exhaustedAfter:1, rmatChance:0.01 },
  CarTrunk:       { items:['Tools','Spare tire','Jumper cables','Scrap metal'], baseChance:0.60, exhaustedAfter:1, rmatChance:0.02 },
  KitchenCabinet: { items:['Canned food','Spices','Cooking pot','Lighter'], baseChance:0.75, exhaustedAfter:3, rmatChance:0 },
  GunCabinet:     { items:['Rifles','Pistols','Ammo','Gun cleaning kit'], baseChance:0.35, exhaustedAfter:1, rmatChance:0.05, locked:true },
  HospitalShelf:  { items:['Antibiotics','Bandages','Suture kit','Painkillers','Blood bag'], baseChance:0.80, exhaustedAfter:2, rmatChance:0.08 },
  PoliceArmory:   { items:['Shotguns','Riot armor','Handcuffs','Ammo ×lots'], baseChance:0.25, exhaustedAfter:1, rmatChance:0.12, locked:true },
  WarehouseShelf: { items:['Industrial scrap','Electronics','Wiring','Heavy tools'], baseChance:0.65, exhaustedAfter:4, rmatChance:0.04 },
  LabStorage:     { items:['RMAT samples','Chemical compounds','Research notes'], baseChance:0.45, exhaustedAfter:2, rmatChance:0.35, requiresKeycard:true },
  AbandonedVehicle:{ items:['Car parts','Fuel','Battery','Scrap'], baseChance:0.55, exhaustedAfter:1, rmatChance:0.03 },
  ZombiePocket:   { items:['Random junk','Occasional valuables','Rare RMAT trace'], baseChance:0.30, exhaustedAfter:1, rmatChance:0.02 },
};

// FATIGUE / SLEEP MODEL — PZ forces real rest cycles
// In PZ, ignoring fatigue leads to: slowed movement, reduced combat, eventually passing out mid-fight.
// Zombie Idler integrates this as the "Schedule" system's core justification.
ZI.FATIGUE_MODEL = {
  // Hours awake → fatigue level → penalties
  phases: [
    { hoursAwake: [0,12],  level: 'Alert',    staminaMod:  0.00, xpMod:  0.00, combatMod:  0.00, color: 'var(--green)' },
    { hoursAwake: [12,16], level: 'Tired',    staminaMod: -0.08, xpMod: -0.05, combatMod: -0.05, color: 'var(--amber)' },
    { hoursAwake: [16,20], level: 'Exhausted',staminaMod: -0.25, xpMod: -0.20, combatMod: -0.20, color: 'var(--red2)' },
    { hoursAwake: [20,24], level: 'Dead Tired',staminaMod:-0.50, xpMod: -0.40, combatMod: -0.40, color: 'var(--red)' },
    { hoursAwake: [24,99], level: 'Blackout', staminaMod: -0.80, xpMod: -0.60, combatMod: -0.70, color: '#e0624c',
      note: 'PZ: character can pass out at any time. Zombie Idler: forces idle auto-rest and cancels active run.' },
  ],
  sleepHealing: {
    lightWound:  { hoursToHeal: 8,  requiresSleep: true,  note: 'PZ: wounds heal during sleep only if bandaged' },
    deepWound:   { hoursToHeal: 24, requiresSutures: true, requiresSleep: true },
    fracture:    { hoursToHeal: 168, requiresSplint: true, note: 'PZ: 1 full week for fractures; splint required' },
    infection:   { hoursToHeal: 48, requiresAntibiotics: true, note: 'PZ: non-zombie infections cured with antibiotics + rest' },
  },
  scheduleJustification: 'The 12-24h scheduling window maps directly to PZ\'s real-time day. Players plan a full survival day: sleep, eat, scavenge, build, rest — mirroring how PZ players structure their sessions.',
};

// VEHICLE SYSTEM — PZ's deep vehicle mechanics
// PZ has one of the most detailed idle-era vehicle systems: fuel, battery, engine quality,
// rust, tire condition, brake fluid, coolant — each degrades independently.
ZI.VEHICLE_SYSTEMS = {
  components: {
    Engine:    { degradesPer100km: 0.5, failureEffect: 'Vehicle immobilized', repairSkill: 'Mechanics L4' },
    Battery:   { degradesPer100km: 0.3, failureEffect: 'Cannot start', repairSkill: 'Mechanics L2', note: 'PZ: dead battery = stranded. Always carry jumper cables.' },
    Tires:     { degradesPer100km: 2.0, failureEffect: 'Speed -50%, noise ×2', repairSkill: 'Mechanics L1', note: 'PZ: tire blowout mid-escape is devastating' },
    BrakeFluid:{ degradesPer100km: 0.2, failureEffect: 'Braking distance ×3', repairSkill: 'Mechanics L3' },
    Coolant:   { degradesPer100km: 0.4, failureEffect: 'Engine overheat → fires', repairSkill: 'Mechanics L3', note: 'PZ: overheating is silent until it\'s too late' },
    Trunk:     { maxWeightKg: { civilian:80, reinforced:150, expedition:250, radiation:200 }, note: 'PZ: overloaded trunks massively reduce speed' },
  },
  noiseBiome: {
    // PZ: vehicle noise is the #1 most dangerous sustained sound source
    mountain:  { engineNoise: 80,  hearingRange: 100, note: 'Sound echoes off ridges — approach cabins on foot' },
    suburbia:  { engineNoise: 100, hearingRange: 140, note: 'Street canyons amplify engine noise significantly' },
    metro:     { engineNoise: 120, hearingRange: 200, note: 'PZ urban logic: every block could have 100+ zeds' },
    perimeter: { engineNoise: 90,  hearingRange: 160, note: 'Anomalies distort sound propagation unpredictably' },
  },
  fuelConsumption: {
    // liters per hour of driving
    civilian:     { city: 8, highway: 6, offroad: 14 },
    reinforced:   { city: 12, highway: 9, offroad: 18 },
    expedition:   { city: 9, highway: 7, offroad: 11 },
    radiationReady:{ city: 14, highway: 11, offroad: 20 },
    note: 'PZ: always refuel before a run. Empty tank = extremely dangerous.',
  },
};

// CRAFTING LOGIC — PZ's recipe-and-materials system
// PZ requires: right items + right tool + right skill level + sometimes a recipe book.
// Zombie Idler mirrors this with: RMAT + Materials + Class Level + Blueprint unlock.

// WEATHER SYSTEM — PZ's temperature and weather impact
// PZ weather affects: temperature (clothing needs), visibility, zombie alertness,
// foraging yield, vehicle traction, and mood moodles.
// ─── CONDITION STAT MODIFIERS (weather × time of day) ────────────────────────
// Whole-number % bonuses/penalties to professions, each with an in-world reason,
// plus an "opportunity" line telling the player what the window is good for.
ZI.WEATHER_STAT_MODS = {
  Rain: {
    mods: [
      { stat:'stealth',    pct:15,  why:'Rain masks footsteps and scent' },
      { stat:'foraging',   pct:10,  why:'Wet soil turns up roots and mushrooms' },
      { stat:'athletics',  pct:-15, why:'Soaked clothing adds weight to every stride' },
      { stat:'scavenging', pct:-5,  why:'Waterlogged containers slow searches' },
    ],
    opportunity:'Push and scout under cover of rain. Avoid long sprints.',
  },
  Fog: {
    mods: [
      { stat:'stealth',    pct:20,  why:'Visibility drops for everything, including them' },
      { stat:'combat',     pct:-10, why:'Targets emerge too close to line up a hit' },
      { stat:'discovery',  pct:-10, why:'Landmarks vanish; new sites are harder to spot' },
    ],
    opportunity:'Best window for evasion runs. Keep fights short.',
  },
  HeatWave: {
    mods: [
      { stat:'endurance',  pct:-15, why:'Heat drains stamina faster' },
      { stat:'athletics',  pct:-10, why:'Overheating caps sprint duration' },
      { stat:'scavenging', pct:10,  why:'Sluggish undead let you loot longer' },
      { stat:'medical',    pct:5,   why:'Dehydration cases give medics more practice' },
    ],
    opportunity:'Loot slow-moving zones. Carry water and skip long pushes.',
  },
  Blizzard: {
    mods: [
      { stat:'athletics',  pct:-20, why:'Snowdrifts and ice cut movement speed' },
      { stat:'stealth',    pct:10,  why:'Wind noise covers movement' },
      { stat:'foraging',   pct:-20, why:'Ground cover buries most finds' },
      { stat:'mechanical', pct:10,  why:'Stuck indoors, crews tinker and repair' },
    ],
    opportunity:'Stay in camp: craft, repair and recycle. Short stealth runs only.',
  },
};
ZI.TIME_STAT_MODS = {
  night: {
    mods: [
      { stat:'stealth',    pct:10,  why:'Darkness hides silhouettes' },
      { stat:'combat',     pct:-10, why:'Aggression peaks after dark' },
    ],
    opportunity:'Night runs pay more RMAT but hit harder.',
  },
  dusk: {
    mods: [
      { stat:'scavenging', pct:5,   why:'Low light, low activity, lookers still see' },
    ],
    opportunity:'Last safe window to extract before night spawns.',
  },
  day: {
    mods: [
      { stat:'scavenging', pct:10,  why:'Full light makes searches thorough' },
      { stat:'stealth',    pct:-10, why:'Nowhere to hide in daylight' },
    ],
    opportunity:'Prime scavenging hours. Loud work is safest now.',
  },
};
// Combined % modifier per stat for the current conditions.
ZI.conditionMods = function(weather, phase) {
  const out = {};
  const add = (list, src) => (list || []).forEach(m => {
    if (!out[m.stat]) out[m.stat] = { pct:0, reasons:[], parts:[] };
    out[m.stat].pct += m.pct; out[m.stat].reasons.push(m.why);
    out[m.stat].parts.push({ src, pct:m.pct, why:m.why });
  });
  add((ZI.WEATHER_STAT_MODS[weather] || {}).mods, weather === 'HeatWave' ? 'Heat Wave' : weather);
  add((ZI.TIME_STAT_MODS[phase] || {}).mods, phase.charAt(0).toUpperCase() + phase.slice(1));
  return out;
};

ZI.WEATHER_EFFECTS = {
  Rain: {
    visibility: -0.40,        // PZ: rain halves visual range
    noiseReduction: -0.30,    // PZ: rain masks footstep noise — great cover for movement
    coldBuildupRate: 2.0,     // if not waterproofed
    zombieAwareness: -0.15,   // PZ: rain-soaked zombies are slightly less aware
    vehicleTraction: -0.25,
    forageYield: -0.20,       // PZ: foraging in rain is harder (ground disturbed)
    note: 'PZ players use rain for risky operations: vault windows, cross open areas, loot gunstores',
  },
  Fog: {
    visibility: -0.65,
    noiseReduction: 0,
    zombieVision: -0.60,     // PZ: fog makes zombies nearly blind — very safe movement
    playerVision: -0.50,
    note: 'PZ: foggy mornings are the safest time to move large distances. High risk reward timing.',
  },
  HeatWave: {
    staminaDrain: +0.25,     // PZ: heat exhaustion drains stamina faster
    thirstRate: +0.40,       // dehydrate faster
    foodSpoilRate: +0.60,    // PZ: food spoils dramatically faster in heat
    zombieAggression: +0.10,
    note: 'PZ: summer heat forces players to carry more water; refrigeration becomes critical',
  },
  Blizzard: {
    movement: -0.40,
    visibility: -0.70,
    coldBuildupRate: 5.0,
    vehicleStartChance: -0.30, // PZ: cold engines fail to start
    forageYield: -0.60,
    note: 'PZ winter: most dangerous condition; hypothermia kills faster than most zombies',
  },
  AcidRain: {
    // Zombie Idler exclusive (Metropolis + Perimeter)
    gearDegradation: +0.80,  // corrodes armor rapidly
    visibility: -0.30,
    healthDrain: 2,           // hp/min without hazard protection
    zombieMutation: +0.15,   // accelerates mutation in exposed zombies
    note: 'Adapted from PZ\'s toxic gas events — sustained environmental damage requiring gear mitigation',
  },
  RadiationStorm: {
    // Zombie Idler exclusive (Debriefed Perimeter)
    radiationBuildup: 5.0,   // per minute without protection
    rmatYield: +0.40,        // storms energize RMAT nodes
    anomalyFrequency: +0.60,
    visibilityDistortion: true,
    note: 'RMAT storms are the "power event" equivalent of PZ\'s helicopter event — high risk, massive reward',
  },
};

// FORAGING / SCAVENGING — PZ's foraging system
// PZ has a detailed foraging mechanic tied to the Foraging skill:
// higher skill = more items found, better quality, faster search

// SKILLS / PROFESSION XP — PZ's skill system
// PZ has 13 skills across 4 categories; all level from 1-10.
// Zombie Idler's SURVIVAL attributes and Professions mirror this directly.
ZI.SKILL_XP_SOURCES = {
  // PZ-inspired XP gain events (adapted for Zombie Idler)
  Mechanics: {
    sources: ['Repairing vehicle (primary)','Dismantling engine parts','Installing mods','Using wrench/jack'],
    xpPerAction: { repair: 25, dismantle: 15, install: 20 },
    note: 'PZ: Mechanics is the most time-investment skill. Level 10 allows full engine rebuilds.',
  },
  Carpentry: { // → Engineering in Zombie Idler
    sources: ['Building structures','Repairing buildings','Crafting furniture','Dismantling buildings'],
    note: 'PZ: Carpentry is the primary base-building skill. Zombie Idler\'s Engineering mirrors this.',
  },
  FirstAid: {
    sources: ['Treating wounds on survivors','Performing surgery','Identifying symptoms','Crafting medicine'],
    xpPerAction: { bandage: 10, suture: 50, surgery: 200 },
    note: 'PZ: First Aid saves lives but only if you have the right supplies. Time-critical mechanic.',
  },
  Stealth: { // → Underhandedness
    sources: ['Moving crouched near zombies','Successful sneak kills','Evading detection'],
    note: 'PZ: Sneaking skill reduces noise radius from footsteps. High-level stealthers are nearly silent.',
  },
  Foraging: { // → Lucky + Insight
    sources: ['Successful loot rolls','Rare find events','Anomaly discoveries','POI intel'],
    note: 'PZ: Foraging 10 finds items others walk past. Zombie Idler\'s Lucky+Insight combination.',
  },
  Farming: {
    sources: ['Tending crops','Harvesting food','Composting','Seed collecting'],
    note: 'PZ: farming is the only renewable food source in the late game. Critical for Camp Mode.',
    growthDays: { Cabbage:6, Tomato:8, Radish:5, Potato:10, Strawberry:14, note:'PZ: crops die without water/fertilizer' },
  },
};

// CAMP DEFENSE — PZ's barricading and fortification logic
// PZ lets players board up windows, build walls, set traps, and create kill corridors.
// Zombie Idler's Camp Mode formalizes this into a building system.
