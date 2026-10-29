// Zed Idler — Bestiary & Loot Schema (imported from design docs)
// 45-zombie roster with color-tier system + 3-factor loot drop formula.
window.ZI = window.ZI || {};

// ─── TIER COLOR SYSTEM ────────────────────────────────────────────────────────
// Grade → {color, label}. Drives Codex card framing and threat read.
ZI.BESTIARY_TIERS = {
  F: { color:'#9a948a', label:'Tutorial / Fodder — teaches core mechanics' },
  E: { color:'#74b6ee', label:'Early game — introduces one new threat' },
  D: { color:'#62d69a', label:'Low-mid — needs gear or skill awareness' },
  C: { color:'#e6c47e', label:'Mid-game — demands counter-knowledge & gear' },
  B: { color:'#f08a52', label:'Late-mid — combo abilities, gear checks' },
  A: { color:'#c894ff', label:'Late game — high HP, multi-affixes, punishing' },
  S: { color:'#d83a5a', label:'Elite — mini-boss tier, high reward' },
  BOSS: { color:'#ff6a1a', label:'Boss — scripted, phase-shift encounter' },
};

// ─── FULL BESTIARY (45 entries) ──────────────────────────────────────────────
// Fields: id, name, tier, base, traits[], hp, dmg, spd, armor, xp,
//         weakness[primary,secondary], ability, loot, biome, notes
ZI.BESTIARY = [
  { id:1, name:'Simple Shambler', tier:'F', base:'Shambler', traits:['Clothed','Soiled','T0 Stinky'], hp:40, dmg:4, spd:0.6, armor:0, xp:10, weakness:['Blunt weapons','Fire'], ability:'None — passive wanderer', loot:'Torn cloth, minor scrap', biome:'Suburbs, Streets', notes:'Tutorial enemy. Teaches basic melee.' },
  { id:2, name:'Damp Lurker', tier:'F', base:'Shambler', traits:['Damp','Moldy','Dirty'], hp:50, dmg:5, spd:0.5, armor:0, xp:12, weakness:['Bludgeoning','Electricity'], ability:'Rusts player slashing weapons on contact', loot:'Wet cloth, mold sample', biome:'Sewers, Swamp', notes:'Introduces elemental resistance early.' },
  { id:3, name:'Stench Walker', tier:'F', base:'Shambler', traits:['T0 Stinky','Soiled','Clothed'], hp:40, dmg:4, spd:0.6, armor:0, xp:10, weakness:['Ranged attack','Fire'], ability:'Passively reduces nearby player attack speed', loot:'Soiled cloth', biome:'Streets, Slums', notes:'Area-denial smell. Fight from range.' },
  { id:4, name:'The Creeper', tier:'E', base:'Creeper', traits:['Ominous','Sneak'], hp:55, dmg:7, spd:0.7, armor:0, xp:20, weakness:['Noise traps','AOE'], ability:'Trails player; strikes only when overwhelmed', loot:'Cloth scraps, rare key', biome:'Alleyways, Tunnels', notes:'Stalker pressure. Trains awareness.' },
  { id:5, name:'Jingle Skirts', tier:'E', base:'Jingle Skirt', traits:['Noisemaker','Clothed'], hp:50, dmg:5, spd:0.5, armor:0, xp:18, weakness:['Silence traps','Ranged'], ability:'Emits escalating noise attracting hordes', loot:'Aluminum/Steel chain links', biome:'Markets, Malls', notes:'Audio awareness. Fun scrap reward.' },
  { id:6, name:'Pack Caller', tier:'E', base:'Pack Leader', traits:['Battle Cry'], hp:60, dmg:6, spd:0.65, armor:0, xp:25, weakness:['AOE/Burst DPS','Stun'], ability:'Spawns 2–3 extras on detection; buffs group', loot:'Cloth, random tool', biome:'Open streets, Parks', notes:'Group dynamic. AOE counter rewarded.' },
  { id:7, name:'Nimble Scavenger', tier:'E', base:'Nimble', traits:['Stuffed Pockets','Dextrous'], hp:55, dmg:5, spd:1.1, armor:0, xp:28, weakness:['Entangle traps','Net'], ability:'Leaps rooftops; drops rich loot on kill', loot:'High-value material cache', biome:'Rooftops, Parking garages', notes:'Verticality. Rewards patient trap play.' },
  { id:8, name:'Tainted Stroller', tier:'D', base:'Tainted', traits:['Ranged kills','Clothed'], hp:65, dmg:7, spd:0.6, armor:0, xp:30, weakness:['Blunt','Fire'], ability:'Contact stress buildup; 15s aura', loot:'Contagion sample, cloth', biome:'Swamps, Sewers', notes:'Stress mechanic. Poke-and-retreat.' },
  { id:9, name:'Frostbitten Shuffler', tier:'D', base:'Frostbite', traits:['Heavy'], hp:70, dmg:8, spd:0.4, armor:1, xp:32, weakness:['Fire elemental','Blunt'], ability:'Cold aura deals 0.02x elemental on contact', loot:'Frost shard (crafting mat)', biome:'Tundra, Warehouses', notes:'Elemental tutorial. Fire counters ice.' },
  { id:10, name:'Moldy Hermit', tier:'D', base:'Hermit', traits:['Fungei-layden','Dirty'], hp:75, dmg:8, spd:0.55, armor:0, xp:35, weakness:['Fire','Chemical spray'], ability:'Swarm of micro-minions burst from body on attack', loot:'Mold sample, fungal spores', biome:'Forests, Basements', notes:'Multi-hit swarm. Elemental shutoff.' },
  { id:11, name:'Ranged Sniper Zed', tier:'D', base:'Sharp', traits:['Return fire','Creeper'], hp:70, dmg:9, spd:0.6, armor:0, xp:38, weakness:['Ranged','Flanking'], ability:'Fires projectile at +5 range; passive until LoS', loot:'Bolt, cloth wrapping', biome:'Rooftops, Factories', notes:'Ranged tutorial. Cover & flanking.' },
  { id:12, name:'Sidestepper', tier:'D', base:'Runner', traits:['Dash','Sidestepping Trapper'], hp:65, dmg:7, spd:1.3, armor:0, xp:40, weakness:['High reflex attack','First strike'], ability:'Ignores floor traps; dashes through obstacles', loot:'Nimble sample, keyring', biome:'Highways, Warehouses', notes:'Anti-trap design. Backup counters.' },
  { id:13, name:'Noise Bomber', tier:'D', base:'Signal Imp', traits:['Battle Cry'], hp:68, dmg:6, spd:0.65, armor:0, xp:42, weakness:['Silent kill','AOE'], ability:'Shriek combo: +100 noise, triggers horde', loot:'Noise lure (crafting)', biome:'Alleyways, Markets', notes:'Horde-trigger combo. Priority targeting.' },
  { id:14, name:'Chrome Dome Bruiser', tier:'C', base:'Chrome Dome', traits:['Beefy','Tough Skin'], hp:100, dmg:12, spd:0.5, armor:2, xp:55, weakness:['Torso attacks','Blunt'], ability:'Headshots deal 0 damage; absorbs cranial fire', loot:'Metal skull scrap, leather', biome:'Scrapyards, Police zones', notes:'Headshot immunity. Body-shot habits.' },
  { id:15, name:'Immolation Stalker', tier:'C', base:'Immolation', traits:['Thorns','Creeper'], hp:85, dmg:10, spd:0.7, armor:0, xp:58, weakness:['Water/Foam','Ranged'], ability:'Burning aura; returns 0.80x melee dmg to attacker', loot:'Charred bone, ash', biome:'Factories, Ruins', notes:'Damage return. Rewards ranged.' },
  { id:16, name:'Acid Spitter', tier:'C', base:'Acid Vomit', traits:['Oozing','Hazardous'], hp:90, dmg:11, spd:0.6, armor:0, xp:60, weakness:['Strafe flanking','Wind corridor'], ability:'Cone acid spray + DOT; chance to burn', loot:'Acid gland (rare craft)', biome:'Sewers, Industrial zones', notes:'DOT counters. Acid gear loop.' },
  { id:17, name:'Shock Conductor', tier:'C', base:'Conductive', traits:['Strong'], hp:95, dmg:10, spd:0.6, armor:1, xp:62, weakness:['Insulated armor','Dry environment'], ability:'Electric burst on hit; 25% chance; 15s window', loot:'Copper wire, circuit shard', biome:'Power plants, Labs', notes:'Electricity. Gear-check. Insulation reward.' },
  { id:18, name:'Heavy Operator', tier:'C', base:'Heavy', traits:['Bash','Heavy'], hp:110, dmg:13, spd:0.4, armor:2, xp:65, weakness:['Appendage targeting','Disarm'], ability:'Throws carried object as first-strike; +10 dmg', loot:'Heavy tool, scrap iron', biome:'Construction, Industrial', notes:'Disarm intro. Appendage targeting.' },
  { id:19, name:'Grayscale Patient', tier:'C', base:'Grayscales', traits:['Surgical healing (NPC)','Hazardous'], hp:95, dmg:9, spd:0.55, armor:1, xp:63, weakness:['Chemical burn','Oozing'], ability:'Guaranteed affliction on first hit; petrifying infection', loot:'Infected sample, grey scale', biome:'Hospitals, Clinics', notes:'Economy mechanic — pay surgeons.' },
  { id:20, name:'Trapper Zed', tier:'C', base:'Tier - Trapper', traits:['Utility tools','Sidestepping Trapper'], hp:80, dmg:8, spd:0.6, armor:0, xp:60, weakness:['Crowd awareness','Clothed'], ability:'Silently lays traps; +30% path time', loot:'Trap parts, rope', biome:'Trap zones', notes:'Trap counter. Utility kit importance.' },
  { id:21, name:'Weapon Wielder Elite', tier:'B', base:'Weapon Wielder', traits:['Accelerated Dash','Heavy Hitter'], hp:120, dmg:15, spd:0.5, armor:2, xp:80, weakness:['Disarm (Dex)','Blunt'], ability:'Damage scales to held weapon; disarm strips buff', loot:'Dropped weapon, cloth', biome:'Military bases, Arenas', notes:'High-stakes disarm. Rewards dexterity.' },
  { id:22, name:'Battle Cry General', tier:'B', base:'Wretched', traits:['AOE burst','Pack Leader'], hp:115, dmg:12, spd:0.65, armor:1, xp:85, weakness:['Stun','Battle Cry'], ability:'8s dmg aura on self+group; spawns escort; debuffs player 40%', loot:'Commander badge (quest)', biome:'Barricaded zones, Camps', notes:'Boss-lite. Debuff + group threat.' },
  { id:23, name:'Blood Frenzy Berserker', tier:'B', base:'Runner', traits:['Sprint','Traps'], hp:130, dmg:14, spd:1.5, armor:0, xp:90, weakness:['Kiting','Ranged'], ability:'+30% speed, +60% atk speed below 50% HP', loot:'Bloodied cloth, adrenaline', biome:'Open arenas, Highways', notes:'Phase-shift danger. Early burst rewarded.' },
  { id:24, name:'Sneak Assassin', tier:'B', base:'Battle Hunger', traits:['Awareness skill','AOE reveal'], hp:110, dmg:13, spd:0.9, armor:0, xp:88, weakness:['AOE','Awareness'], ability:'Fully invisible; guaranteed first strike; accuracy scales', loot:'Shadow sample, fiber wrap', biome:'Tunnels, Nighttime streets', notes:'Stealth enemy. Awareness investment.' },
  { id:25, name:'Stun-Locker Warden', tier:'B', base:'Stun-locker', traits:['Shackle','Heavy'], hp:125, dmg:12, spd:0.5, armor:3, xp:85, weakness:['Long-arm weapons','Barbed armor'], ability:'Entangles + stun-locks; stress and scare on hit', loot:'Shackle chain, heavy scrap', biome:'Prisons, Institutions', notes:'Barbed armor & polearms rewarded.' },
  { id:26, name:'Armored Juggernaut', tier:'B', base:'Armored', traits:['Thicker Armor','Heavy'], hp:140, dmg:16, spd:0.35, armor:5, xp:95, weakness:['Armor-pierce rounds','Bludgeoning'], ability:'Near-immune to blades; stops most firearms; shield-resistant', loot:'Armor plating (craft tier B)', biome:'Military, Riot zones', notes:'Gear-check: bludgeon or AP.' },
  { id:27, name:'Light Sensitive Wraith', tier:'B', base:'Light Sensitive', traits:['Flashlight','Sneak'], hp:105, dmg:12, spd:0.8, armor:0, xp:82, weakness:['UV flare','Dash'], ability:'Night: +1.3x dmg & def; Day: -0.5x. Dashes in darkness', loot:'Shadow cloth, night sample', biome:'Night events, Tunnels', notes:'Time-of-day dynamic. Flashlight utility.' },
  { id:28, name:'Toxic Gas Cloud', tier:'B', base:'Toxic Gas', traits:['Hazardous','Oozing'], hp:115, dmg:10, spd:0.55, armor:0, xp:84, weakness:['Fire ignition','Wind corridors'], ability:'3 DPS gas cloud; stress aura; ignites with fire', loot:'Gas sac (rare), cloth', biome:'Sewers, Bunkers', notes:'AOE denial. Fire-ignite cheese intended.' },
  { id:29, name:'Quadruped Grappler', tier:'B', base:'Mutant', traits:['Quadruped','Long blades'], hp:120, dmg:13, spd:0.75, armor:3, xp:88, weakness:['Bladed polearms','First strike'], ability:'Four-arm guard blocks front attacks; entangles at range', loot:'Mutant limb sample', biome:'Labs, Corrupted zones', notes:'Flanking and polearm effectiveness.' },
  { id:30, name:'Hexapod Behemoth', tier:'A', base:'Hexapod', traits:['Polearms','Mutant'], hp:175, dmg:18, spd:0.45, armor:5, xp:130, weakness:['Long blades','Tough Skin'], ability:'Six-arm shifting wall; extremely hard to breach frontally', loot:'Rare mutant tissue', biome:'Research labs, Biomes', notes:'Tank puzzle. Sharp weapon mastery.' },
  { id:31, name:'Keyring Custodian', tier:'A', base:'Keyring Master', traits:['Any weapon','None'], hp:100, dmg:9, spd:0.6, armor:0, xp:120, weakness:['Dextrous','Clothed'], ability:'Guarantees keyring drop with access keys; passive', loot:'Keyring (unlocks content)', biome:'Restricted zones, Malls', notes:'Exploration reward. Meta-progression.' },
  { id:32, name:'Accelerated Dasher', tier:'A', base:'Runner', traits:['Accelerated Dash','Heavy Hitter'], hp:140, dmg:16, spd:2.0, armor:1, xp:135, weakness:['Polearms','First strike'], ability:'Chains dashes; first strike guaranteed; accuracy stacks', loot:'Speed sample, runner cloth', biome:'Open highways, Arenas', notes:'High-speed gauntlet. Polearms counter.' },
  { id:33, name:'Giant Aberration', tier:'A', base:'Giant', traits:['Katana class','Heavy'], hp:280, dmg:37, spd:0.35, armor:6, xp:200, weakness:['Fire','Traps'], ability:'Towering threat; +85% XP. No loot except XP + trophy', loot:'Trophy skull (achievement)', biome:'Boss arenas, Outskirts', notes:'Boss-tier. Trophy. Pure skill/trap test.' },
  { id:34, name:'Maggot Breeder', tier:'A', base:'Maggot Ridden', traits:['Hazardous','Oozing'], hp:90, dmg:11, spd:0.55, armor:0, xp:115, weakness:['Fire','Bludgeoning'], ability:'Larvae burst on death; maggots collectible as food', loot:'Maggot clusters (food!), toxin sac', biome:'Garbage zones, Swamps', notes:'Hidden achievement. Risk-reward harvest.' },
  { id:35, name:'Burrower Ambusher', tier:'A', base:'Burrower', traits:['Ranged during burrow','Mutant'], hp:155, dmg:17, spd:0.9, armor:2, xp:145, weakness:['Awareness skill','First strike'], ability:'Submerges and resurfaces near player or behind obstacles', loot:'Soil sample, burrower hide', biome:'Parks, Deserts, Dunes', notes:'Awareness + spatial prediction.' },
  { id:36, name:'Pressurized Bloat', tier:'A', base:'Pressurized T2', traits:['Hazardous','Heavy'], hp:160, dmg:14, spd:0.5, armor:0, xp:140, weakness:['Fire','Void piercing'], ability:'Detonates from pierce; 35% shrapnel AoE; stress aura', loot:'Biomass sac, hazmat cloth', biome:'Sewers, Waste zones', notes:'AOE explosion trap. Ammo switching.' },
  { id:37, name:'Hybrid-Limbed Freak', tier:'A', base:'Hybrid-Limbed', traits:['Unpredictable','Runner'], hp:145, dmg:16, spd:1.0, armor:0, xp:138, weakness:['Blunt','Dash'], ability:'Mismatched limbs create unpredictable attack arcs', loot:'Hybrid limb (rare craft)', biome:'Labs, Anomaly zones', notes:'RNG attack pattern. Reflex & agility.' },
  { id:38, name:'Trapper Zed', tier:'S', base:'Mutant', traits:['Quadruped'], hp:200, dmg:20, spd:0.7, armor:3, xp:190, weakness:['Insulated armor','Strong'], ability:'Silently lays traps during player activity', loot:'Trap parts, rope', biome:'Restricted zones', notes:'Trap counter-mechanics.' },
  { id:39, name:'Battle Cry General', tier:'S', base:'Mutant', traits:['Quadruped','Sprint'], hp:240, dmg:22, spd:0.6, armor:4, xp:210, weakness:['Traps','High reflex attack'], ability:'8s dmg aura on self+group; spawns escort', loot:'Commander badge', biome:'Camps, Corrupted zones', notes:'Elite group threat.' },
  { id:40, name:'Octopod Overlord', tier:'S', base:'Octopod', traits:['Insulated armor + blades','Mutant'], hp:300, dmg:28, spd:0.4, armor:8, xp:280, weakness:['Polearms','Strong'], ability:'Eight-limb wall; electric burst on all limbs; near-impenetrable front', loot:'Overlord sample (quest item)', biome:'End-game labs, Raid zones', notes:'End-game boss archetype. Full gear-check.' },
  { id:41, name:'Signal Imp Alpha', tier:'S', base:'Runner', traits:['Battle Cry'], hp:170, dmg:14, spd:1.8, armor:0, xp:175, weakness:['Neck/throat shot','Chemical agents'], ability:'+70 noise shriek + horde call; spawns escort pack', loot:'Signal amp (crafting)', biome:'Horde events, Alert zones', notes:'Elite horde-trigger. Precision marksmanship.' },
  { id:42, name:'Random Fan (Rare)', tier:'S', base:'Random Fan', traits:['Any damage type'], hp:130, dmg:8, spd:0.8, armor:0, xp:160, weakness:['Any','Blunt'], ability:'Loud, chaotic; drops rare loot and collectible merch', loot:'Collectible merch, rare mat', biome:'Events, Streets', notes:'Easter-egg. Collectible reward. Tone break.' },
  { id:43, name:'Path-Laden Watcher', tier:'S', base:'Path-ladden', traits:['Stealth reveal'], hp:120, dmg:7, spd:0.65, armor:0, xp:155, weakness:['Ranged','Sneak'], ability:'Non-combat observer; builds base threat +5% per active zombie', loot:'Watch token (base event trigger)', biome:'City perimeter, Base perimeter', notes:'Passive base-siege. Proactive hunting.' },
  { id:44, name:'Rebis Specimen', tier:'S', base:'Rebis', traits:['Fire + Blunt combo','Heavy'], hp:350, dmg:30, spd:0.25, armor:7, xp:350, weakness:['Fire','Blunt'], ability:'Unstable mutation triggers random affixes mid-fight; high research yield', loot:'Rebis flesh (top-tier craft)', biome:'Anomaly zones, Deep labs', notes:'RNG affixes mid-battle. Premium research.' },
  { id:45, name:'Chained Behemoth', tier:'BOSS', base:'Chained', traits:['Numbness','Magnetize/Immobilize'], hp:310, dmg:25, spd:1.9, armor:2, xp:320, weakness:['Explosive','Sprint'], ability:'Immune to disables; 0.80x speed from chains; chain drops on kill', loot:'High-value metal chain (silver/gold chance)', biome:'Prison boss, Industrial boss', notes:'Raw sustained DPS. Disable immunity lesson.' },
];

// ─── LOOT DROP FORMULA (3-factor) ─────────────────────────────────────────────
ZI.LOOT_FORMULA = {
  // Drop_Chance = Base_Rate × Tier_Multiplier × Kill_Bonus
  baseRateByRarity: { Common:[60,80], Uncommon:[20,45], Rare:[5,20], Epic:[1,5], Legendary:[0.1,1] },
  tierMultiplier:   { F:1.0, E:1.0, D:1.1, C:1.15, B:1.2, A:1.3, S:1.5, BOSS:2.0 },
  killBonus:        { normal:1.0, headshot:1.1, disarm:1.25, trap:1.15, elemental:1.3, firstStrike:1.05 },
  // Is_Unique override: E–C → min(base×2, 15%); B–BOSS → min(base, 5%)
  computeDropChance(rarity, tier, killType='normal', isUnique=false) {
    const [lo, hi] = this.baseRateByRarity[rarity] || [10,10];
    let base = (lo + hi) / 2;
    let chance = base * (this.tierMultiplier[tier]||1) * (this.killBonus[killType]||1);
    if (isUnique) {
      const earlyTiers = ['E','D','C'];
      chance = earlyTiers.includes(tier) ? Math.min(base*2, 15) : Math.min(base, 5);
    }
    return Math.round(chance * 100) / 100;
  },
};

// ─── LOOT RARITY → LEVEL RANGE (flexible tiers) ──────────────────────────────
ZI.LOOT_TIERS = [
  { tier:1, level:[1,8],   rarity:'Common',    intent:'Can vary by biome' },
  { tier:2, level:[3,10],  rarity:'Uncommon',  intent:'Overlaps Common at low end' },
  { tier:3, level:[6,13],  rarity:'Rare',      intent:'Mid-game; unlocked by area' },
  { tier:4, level:[9,16],  rarity:'Epic',      intent:'Late-game; rare in early zones' },
  { tier:5, level:[12,20], rarity:'Legendary', intent:'End-game; BOSS can push to 20' },
];

// ─── SAMPLE LOOT ENTRIES (from schema) ───────────────────────────────────────
ZI.LOOT_SAMPLES = [
  { itemId:'ITM_00501', name:'Steel Chain Scraps',     zombie:'Jingle Skirts',        category:'CraftingMaterial', rarity:'Common',    value:1,  weight:4.0,  unique:false, lore:'streets|metal_scrap' },
  { itemId:'ITM_00502', name:'Aluminum Jingle Charms',  zombie:'Jingle Skirts',        category:'CraftingMaterial', rarity:'Uncommon',  value:2,  weight:6.0,  unique:false, lore:'streets|metal_scrap' },
  { itemId:'ITM_00503', name:'Silver Charm (Rare Find)',zombie:'Jingle Skirts',        category:'Luxury',           rarity:'Rare',      value:4,  weight:8.0,  unique:true,  lore:'streets|luxury|hidden_achievement' },
  { itemId:'ITM_01401', name:'Metal Skull Fragment',    zombie:'Chrome Dome Bruiser',  category:'CraftingMaterial', rarity:'Common',    value:5,  weight:9.0,  unique:false, lore:'scrapyard|metal_scrap' },
  { itemId:'ITM_01402', name:'Hardened Leather Vest',   zombie:'Chrome Dome Bruiser',  category:'Armor',            rarity:'Uncommon',  value:7,  weight:11.0, unique:false, lore:'scrapyard|police' },
  { itemId:'ITM_01403', name:'Chrome Dome Trophy',      zombie:'Chrome Dome Bruiser',  category:'Luxury',           rarity:'Epic',      value:10, weight:14.0, unique:true,  lore:'scrapyard|trophy' },
  { itemId:'ITM_02101', name:'Dropped Combat Knife',    zombie:'Weapon Wielder Elite', category:'Weapon',           rarity:'Uncommon',  value:8,  weight:55,   unique:false, lore:'military|melee' },
  { itemId:'ITM_03302', name:'Giant Trophy Skull',      zombie:'Giant Aberration',     category:'Luxury',           rarity:'Legendary', value:0,  weight:0,    unique:true,  lore:'boss_arena|achievement|trophy' },
  { itemId:'ITM_04401', name:'Rebis Flesh Sample',      zombie:'Rebis Specimen',       category:'Research',         rarity:'Epic',      value:13, weight:0.5,  unique:false, lore:'anomaly_zone|research|rare_craft' },
  { itemId:'ITM_04402', name:'Unstable Mutation Core',  zombie:'Rebis Specimen',       category:'Mod',              rarity:'Legendary', value:13, weight:0.5,  unique:true,  lore:'anomaly_zone|end_game|research' },
];

// ─── REUSABLE ZOMBIE TRAITS + ROSTER ADDITIONS (Oct 29) ──────────────────────
// Source: Google Doc "Zed Idler — Crawler Sprite & Halved Trait" (team review draft, Oct 27); Sam asked on Oct 29 for the
// Crawler with the Halved trait in new games. Halved = 50% max HP, 50% damage per hit, 50% attack frequency (twice the
// interval). Animation speed is a separate visual setting and is NOT halved. Halved is reusable but is assigned to the
// Crawler only (draft review gate 6). The original 45-entry ZI.BESTIARY is unchanged; additions live in
// ZI.BESTIARY_ROSTER with a minRoster number, and ZI.fieldBestiary() returns the roster a save actually meets.
ZI.ZOMBIE_TRAITS = {
  halved: { label: 'Halved', maxHpMultiplier: 0.5, damageMultiplier: 0.5, attackRateMultiplier: 0.5,
    desc: 'Torn in half. Half the health, half the bite, attacks half as often.' },
};
// Applied once, when the record is built (never again at fight time), using the engine's whole-number stats.
ZI.applyZombieTrait = function(base, traitId) {
  const t = ZI.ZOMBIE_TRAITS[traitId]; if (!t || !base) return base;
  const out = Object.assign({}, base);
  out.hp = Math.max(1, Math.round(base.hp * t.maxHpMultiplier));
  out.dmg = Math.max(1, Math.round(base.dmg * t.damageMultiplier));
  out.attackEvery = Math.max(1, Math.round((base.attackEvery || 1) / t.attackRateMultiplier)); // turns between attacks
  out.mechTraits = (base.mechTraits || []).concat([traitId]);
  return out;
};
ZI.BESTIARY_ROSTER = [
  // Crawler: a Simple Shambler (id 1) torn in half. Tier F is PROVISIONAL (the draft leaves the tier to a bestiary
  // review; a halved F-tier body is the weakest choice that keeps it in the opening pool). Sprite: none exported yet,
  // so the field and Codex fall back to the drawn (SVG) zombie, as the draft requires until a validated atlas exists.
  ZI.applyZombieTrait(Object.assign({}, ZI.BESTIARY.find(z => z.id === 1), {
    id: 46, name: 'Crawler', tier: 'F', base: 'Crawler', traits: ['Halved', 'Soiled', 'Low to the ground'],
    weakness: ['Blunt weapons', 'Stomps'], ability: 'Drags itself after the living; half a body, half the threat',
    loot: 'Torn cloth', biome: 'Streets, Suburbs', minRoster: 2, // XP stays the base 10: the draft does not halve rewards
    notes: 'Reusable Halved trait (50% HP, 50% damage, attacks every second turn). Tier provisional. New saves only.',
  }), 'halved'),
];
ZI.saveRosterVersion = function() {
  try { const v = parseInt(localStorage.getItem('zi_roster_v'), 10); return Number.isInteger(v) && v > 0 ? v : 1; } catch (e) { return 1; }
};
// The zombies this save can meet: the original 45, plus additions whose minRoster the save has reached.
ZI.fieldBestiary = function() {
  const v = ZI.saveRosterVersion();
  return (ZI.BESTIARY || []).concat((ZI.BESTIARY_ROSTER || []).filter(z => (z.minRoster || 1) <= v));
};
