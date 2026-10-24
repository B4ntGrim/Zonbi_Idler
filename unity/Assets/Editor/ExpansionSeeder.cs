// Assets/Editor/ExpansionSeeder.cs
#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Editor
{
    /// <summary>
    /// Seeds the Phase 4 content expansion: 12 new zombies (variant rotation
    /// + new tiers with abilities), 10 new weapons (faction-exclusive,
    /// salvaged, RMAT-infused, unique), and 20 new contracts including
    /// multi-stage faction chains. Idempotent.
    /// </summary>
    public static class ExpansionSeeder
    {
        private const string ZOMBIE_FOLDER   = "Assets/Data/Zombies";
        private const string WEAPON_FOLDER   = "Assets/Data/Weapons";
        private const string CONTRACT_FOLDER = "Assets/Data/Contracts";
        private const string LOOT_FOLDER     = "Assets/Data/LootTables";

        [MenuItem("ZedIdler/Seed Content Expansion")]
        public static void SeedAll()
        {
            int l = SeedExpansionLoot();
            int z = SeedZombies();
            int w = SeedWeapons();
            int c = SeedContracts();
            AssetDatabase.SaveAssets(); AssetDatabase.Refresh();
            Debug.Log($"[ExpansionSeeder] +{l} loot tables, +{z} zombies, +{w} weapons, +{c} contracts.");
        }

        // ─── EXPANSION LOOT TABLES (Apex / WorldBoss / themed variants) ───────
        private struct ELootSeed
        {
            public string assetName;
            public int dropsPerRoll;
            public (string itemId, LootRarity rarity, float weight, int minQty, int maxQty)[] entries;
        }

        private static int SeedExpansionLoot()
        {
            var seeds = new[]
            {
                // Themed variant table — Tier-2/3 RMAT, themed mats
                new ELootSeed { assetName="loot_variant", dropsPerRoll=2, entries=new[] {
                    ("metal_scraps",       LootRarity.Common,   30f, 1, 3),
                    ("electronics",        LootRarity.Common,   28f, 1, 2),
                    ("rmat_shard",         LootRarity.Uncommon, 20f, 1, 2),
                    ("rare_gear",          LootRarity.Rare,     10f, 1, 1),
                } },
                // Apex table — Tier-4 RMAT, exotic components
                new ELootSeed { assetName="loot_apex", dropsPerRoll=3, entries=new[] {
                    ("rmat_shard",         LootRarity.Uncommon, 30f, 2, 4),
                    ("rare_gear",          LootRarity.Rare,     22f, 1, 2),
                    ("rmat_core",          LootRarity.Rare,     18f, 1, 2),
                    ("exotic_component",   LootRarity.Epic,     10f, 1, 1),
                    ("blueprint_fragment", LootRarity.Rare,     12f, 1, 1),
                } },
                // WorldBoss table — Tier-5 RMAT, exotic + guaranteed blueprint pressure
                new ELootSeed { assetName="loot_worldboss", dropsPerRoll=4, entries=new[] {
                    ("rmat_core",          LootRarity.Rare,     26f, 2, 4),
                    ("exotic_component",   LootRarity.Epic,     20f, 1, 2),
                    ("rmat_echo",          LootRarity.Epic,     16f, 1, 2),
                    ("exotic_blueprint",   LootRarity.Legendary,10f, 1, 1),
                    ("blueprint_fragment", LootRarity.Rare,     18f, 1, 2),
                } },
            };

            EnsureFolder(LOOT_FOLDER);
            int created = 0;
            foreach (var s in seeds)
            {
                string path = $"{LOOT_FOLDER}/{s.assetName}.asset";
                if (AssetDatabase.LoadAssetAtPath<LootTable>(path) != null) continue;
                var lt = ScriptableObject.CreateInstance<LootTable>();
                var so = new SerializedObject(lt);
                so.FindProperty("dropsPerRoll").intValue = s.dropsPerRoll;
                var arr = so.FindProperty("entries");
                arr.arraySize = s.entries.Length;
                for (int j = 0; j < s.entries.Length; j++)
                {
                    var e = arr.GetArrayElementAtIndex(j);
                    e.FindPropertyRelative("itemId").stringValue    = s.entries[j].itemId;
                    e.FindPropertyRelative("rarity").enumValueIndex = (int)s.entries[j].rarity;
                    e.FindPropertyRelative("weight").floatValue     = s.entries[j].weight;
                    e.FindPropertyRelative("minQuantity").intValue  = s.entries[j].minQty;
                    e.FindPropertyRelative("maxQuantity").intValue  = s.entries[j].maxQty;
                }
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(lt, path);
                created++;
            }
            return created;
        }

        /// <summary>Resolve the right expansion loot table asset for a zombie tier.</summary>
        private static LootTable LootForTier(ZombieTier tier)
        {
            string name = tier == ZombieTier.WorldBoss ? "loot_worldboss"
                        : tier == ZombieTier.Apex       ? "loot_apex"
                        : "loot_variant";
            return AssetDatabase.LoadAssetAtPath<LootTable>($"{LOOT_FOLDER}/{name}.asset");
        }

        // ─── 12 NEW ZOMBIES ───────────────────────────────────────────────────
        private struct ZSeed
        {
            public string id, name;
            public ZombieTier tier;
            public ZombieVariantTheme theme;
            public int hpMin, hpMax, dmgMin, dmgMax, speed, armor, baseXp, minLvl, difficulty;
            public ZombieAbility abilities;
            public int selfHeal, aoeDmg;
            public float reflectPct;
        }

        private static int SeedZombies()
        {
            var seeds = new[]
            {
                // Variant rotation (existing tiers, themed)
                new ZSeed { id="z_frozen_heavy", name="Frozen Brute", tier=ZombieTier.Heavy, theme=ZombieVariantTheme.Frozen, hpMin=80, hpMax=120, dmgMin=18, dmgMax=28, speed=2, armor=6, baseXp=42, minLvl=5, difficulty=20, abilities=ZombieAbility.ArmorOnHit },
                new ZSeed { id="z_burning_runner", name="Burning Sprinter", tier=ZombieTier.Fast, theme=ZombieVariantTheme.Burning, hpMin=20, hpMax=35, dmgMin=10, dmgMax=18, speed=12, armor=0, baseXp=28, minLvl=3, difficulty=15, abilities=ZombieAbility.AoEOnDeath, aoeDmg=15 },
                new ZSeed { id="z_acidic_spitter", name="Acidic Spitter", tier=ZombieTier.Infected, theme=ZombieVariantTheme.Acidic, hpMin=30, hpMax=55, dmgMin=12, dmgMax=22, speed=5, armor=0, baseXp=32, minLvl=4, difficulty=18, abilities=ZombieAbility.DrainWeaponDur | ZombieAbility.InfectsOnHit },
                new ZSeed { id="z_irradiated_standard", name="Glowmaw", tier=ZombieTier.Standard, theme=ZombieVariantTheme.Irradiated, hpMin=30, hpMax=50, dmgMin=8, dmgMax=14, speed=4, armor=1, baseXp=22, minLvl=2, difficulty=10, abilities=ZombieAbility.RMatCorrupted },
                new ZSeed { id="z_plagued_horde", name="Plagued Caller", tier=ZombieTier.HordeLeader, theme=ZombieVariantTheme.Plagued, hpMin=220, hpMax=380, dmgMin=32, dmgMax=55, speed=4, armor=12, baseXp=180, minLvl=55, difficulty=80, abilities=ZombieAbility.SummonOnHit | ZombieAbility.InfectsOnHit | ZombieAbility.SwarmCall },
                new ZSeed { id="z_shadow_elite", name="Shadow Stalker", tier=ZombieTier.Elite, theme=ZombieVariantTheme.Shadow, hpMin=90, hpMax=160, dmgMin=24, dmgMax=38, speed=8, armor=4, baseXp=72, minLvl=30, difficulty=55, abilities=ZombieAbility.TeleportEvasion },

                // New tiers
                new ZSeed { id="z_apex_regen", name="Apex Regenerator", tier=ZombieTier.Apex, theme=ZombieVariantTheme.Anomalous, hpMin=350, hpMax=550, dmgMin=40, dmgMax=65, speed=6, armor=10, baseXp=280, minLvl=65, difficulty=90, abilities=ZombieAbility.SelfHeal | ZombieAbility.EnrageBelow50Hp, selfHeal=15 },
                new ZSeed { id="z_apex_reflector", name="Apex Mirrorshell", tier=ZombieTier.Apex, theme=ZombieVariantTheme.Anomalous, hpMin=300, hpMax=500, dmgMin=35, dmgMax=55, speed=4, armor=15, baseXp=300, minLvl=70, difficulty=92, abilities=ZombieAbility.ReflectDamage | ZombieAbility.ArmorOnHit, reflectPct=0.25f },
                new ZSeed { id="z_apex_emp", name="Apex Pulser", tier=ZombieTier.Apex, theme=ZombieVariantTheme.Anomalous, hpMin=280, hpMax=460, dmgMin=30, dmgMax=50, speed=7, armor=8, baseXp=320, minLvl=75, difficulty=95, abilities=ZombieAbility.EMPPulse | ZombieAbility.DrainWeaponDur },
                new ZSeed { id="z_worldboss_titan", name="Titan: Old Wound", tier=ZombieTier.WorldBoss, theme=ZombieVariantTheme.Anomalous, hpMin=1200, hpMax=2000, dmgMin=80, dmgMax=140, speed=3, armor=25, baseXp=900, minLvl=85, difficulty=100, abilities=ZombieAbility.SelfHeal | ZombieAbility.AoEOnDeath | ZombieAbility.ArmorOnHit, selfHeal=30, aoeDmg=80 },
                new ZSeed { id="z_worldboss_swarm", name="Titan: The Choir", tier=ZombieTier.WorldBoss, theme=ZombieVariantTheme.Plagued, hpMin=900, hpMax=1500, dmgMin=60, dmgMax=110, speed=5, armor=18, baseXp=950, minLvl=90, difficulty=100, abilities=ZombieAbility.SummonOnHit | ZombieAbility.SwarmCall | ZombieAbility.InfectsOnHit },
                new ZSeed { id="z_worldboss_rift", name="Titan: Rift Spawn", tier=ZombieTier.WorldBoss, theme=ZombieVariantTheme.Anomalous, hpMin=1000, hpMax=1700, dmgMin=70, dmgMax=130, speed=6, armor=22, baseXp=1100, minLvl=95, difficulty=100, abilities=ZombieAbility.TeleportEvasion | ZombieAbility.RMatCorrupted | ZombieAbility.EnrageBelow50Hp },
            };

            EnsureFolder(ZOMBIE_FOLDER);
            int created = 0;
            foreach (var s in seeds)
            {
                string path = $"{ZOMBIE_FOLDER}/Z_{s.id}.asset";
                if (AssetDatabase.LoadAssetAtPath<ZombieDefinition>(path) != null) continue;
                var asset = ScriptableObject.CreateInstance<ZombieDefinition>();
                var so = new SerializedObject(asset);
                so.FindProperty("zombieId").stringValue        = s.id;
                so.FindProperty("displayName").stringValue     = s.name;
                so.FindProperty("tier").enumValueIndex         = (int)s.tier;
                so.FindProperty("hpMin").intValue              = s.hpMin;
                so.FindProperty("hpMax").intValue              = s.hpMax;
                so.FindProperty("damageMin").intValue          = s.dmgMin;
                so.FindProperty("damageMax").intValue          = s.dmgMax;
                so.FindProperty("speed").intValue              = s.speed;
                so.FindProperty("armor").intValue              = s.armor;
                so.FindProperty("baseXp").intValue             = s.baseXp;
                so.FindProperty("minPlayerLevel").intValue     = s.minLvl;
                so.FindProperty("abilities").intValue          = (int)s.abilities;
                so.FindProperty("variantTheme").enumValueIndex = (int)s.theme;
                so.FindProperty("selfHealPerTurn").intValue    = s.selfHeal;
                so.FindProperty("deathAoeDamage").intValue     = s.aoeDmg;
                so.FindProperty("reflectPct").floatValue       = s.reflectPct;
                so.FindProperty("variantDifficulty").intValue  = s.difficulty;
                var lt = LootForTier(s.tier);
                if (lt != null) so.FindProperty("lootTable").objectReferenceValue = lt;
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(asset, path);
                created++;
            }
            return created;
        }

        // ─── 10 NEW WEAPONS ───────────────────────────────────────────────────
        private struct WSeed
        {
            public string id, name, ammo, factionId, traitId;
            public WeaponSlot slot; public WeaponKind kind;
            public WeaponTier tier; public WeaponFamily family;
            public int minDmg, maxDmg, magSize, durability, sockets;
            public float dmgMult, critBonus;
            public WeaponStatScaling scaling;
        }

        private static int SeedWeapons()
        {
            var seeds = new[]
            {
                // Faction-exclusive
                new WSeed { id="w_iron_march_battle_rifle", name="Iron March Battle Rifle", slot=WeaponSlot.Primary, kind=WeaponKind.Ranged, tier=WeaponTier.Rare, family=WeaponFamily.FactionExclusive, factionId="iron_march", minDmg=22, maxDmg=38, magSize=20, ammo="ammo_rifle", durability=160, sockets=3, dmgMult=1.50f, scaling=WeaponStatScaling.StrengthCombat },
                new WSeed { id="w_dustwalker_carbine", name="Dustwalker Pathfinder Carbine", slot=WeaponSlot.Primary, kind=WeaponKind.Ranged, tier=WeaponTier.Uncommon, family=WeaponFamily.FactionExclusive, factionId="dustwalkers", minDmg=14, maxDmg=24, magSize=15, ammo="ammo_rifle", durability=110, sockets=2, dmgMult=1.20f, scaling=WeaponStatScaling.AgilityCombat },
                new WSeed { id="w_concordance_pulse", name="Concordance Pulse Emitter", slot=WeaponSlot.Primary, kind=WeaponKind.Ranged, tier=WeaponTier.Epic, family=WeaponFamily.FactionExclusive, factionId="concordance", minDmg=18, maxDmg=42, magSize=8, ammo="ammo_pulse", durability=120, sockets=4, dmgMult=1.65f, critBonus=0.10f, scaling=WeaponStatScaling.IntellectCombat },

                // Salvaged
                new WSeed { id="w_salvage_nailgun", name="Salvaged Nailgun", slot=WeaponSlot.Primary, kind=WeaponKind.Ranged, tier=WeaponTier.Common, family=WeaponFamily.Salvaged, minDmg=5, maxDmg=10, magSize=20, ammo="ammo_nails", durability=70, sockets=1, dmgMult=0.95f, scaling=WeaponStatScaling.AgilityCombat },
                new WSeed { id="w_salvage_pipe_bomb", name="Pipe Bomb", slot=WeaponSlot.Throwable, kind=WeaponKind.Throwable, tier=WeaponTier.Common, family=WeaponFamily.Salvaged, minDmg=30, maxDmg=70, magSize=1, ammo=null, durability=1, sockets=0, dmgMult=1.10f, scaling=WeaponStatScaling.StrengthCombat },
                new WSeed { id="w_salvage_chainsword", name="Rusted Chainsword", slot=WeaponSlot.Melee, kind=WeaponKind.Melee, tier=WeaponTier.Uncommon, family=WeaponFamily.Salvaged, minDmg=18, maxDmg=32, magSize=0, ammo=null, durability=90, sockets=2, dmgMult=1.35f, scaling=WeaponStatScaling.StrengthCombat },

                // RMAT-infused
                new WSeed { id="w_rmat_echo_rifle", name="RMAT Echo Rifle", slot=WeaponSlot.Primary, kind=WeaponKind.Ranged, tier=WeaponTier.Epic, family=WeaponFamily.RMatInfused, traitId="ignore_armor", minDmg=20, maxDmg=40, magSize=10, ammo="ammo_rmat", durability=140, sockets=4, dmgMult=1.60f, critBonus=0.05f, scaling=WeaponStatScaling.IntellectCombat },
                new WSeed { id="w_rmat_void_blade", name="Voidedge Blade", slot=WeaponSlot.Melee, kind=WeaponKind.Melee, tier=WeaponTier.Epic, family=WeaponFamily.RMatInfused, traitId="aoe_pulse", minDmg=28, maxDmg=52, magSize=0, ammo=null, durability=200, sockets=3, dmgMult=1.70f, scaling=WeaponStatScaling.IntellectCombat },

                // Unique (not faction-tied)
                new WSeed { id="w_unique_lastwhisper", name="Last Whisper", slot=WeaponSlot.Secondary, kind=WeaponKind.Ranged, tier=WeaponTier.Legendary, family=WeaponFamily.Unique, traitId="execute_low_hp", minDmg=20, maxDmg=40, magSize=6, ammo="ammo_revolver", durability=180, sockets=4, dmgMult=1.85f, critBonus=0.15f, scaling=WeaponStatScaling.AgilityCombat },
                new WSeed { id="w_unique_oldwound", name="Old Wound", slot=WeaponSlot.Melee, kind=WeaponKind.Melee, tier=WeaponTier.Legendary, family=WeaponFamily.Unique, traitId="bleed_stack", minDmg=24, maxDmg=46, magSize=0, ammo=null, durability=240, sockets=4, dmgMult=1.75f, scaling=WeaponStatScaling.StrengthCombat },
            };

            EnsureFolder(WEAPON_FOLDER);
            int created = 0;
            foreach (var s in seeds)
            {
                string path = $"{WEAPON_FOLDER}/{s.id}.asset";
                if (AssetDatabase.LoadAssetAtPath<WeaponDefinition>(path) != null) continue;
                var asset = ScriptableObject.CreateInstance<WeaponDefinition>();
                var so = new SerializedObject(asset);
                so.FindProperty("weaponId").stringValue      = s.id;
                so.FindProperty("displayName").stringValue   = s.name;
                so.FindProperty("slot").enumValueIndex       = (int)s.slot;
                so.FindProperty("kind").enumValueIndex       = (int)s.kind;
                so.FindProperty("minDamage").intValue        = s.minDmg;
                so.FindProperty("maxDamage").intValue        = s.maxDmg;
                so.FindProperty("damageMultiplier").floatValue = s.dmgMult;
                so.FindProperty("magazineSize").intValue     = s.magSize;
                so.FindProperty("ammoItemId").stringValue    = s.ammo ?? "";
                so.FindProperty("durabilityCostPerShot").intValue = 1;
                so.FindProperty("maxDurability").intValue    = s.durability;
                so.FindProperty("startingCleanliness").intValue = 100;
                so.FindProperty("cleanlinessLossPerUse").intValue = 1;
                so.FindProperty("maxMisfireChance").floatValue = 0.25f;
                so.FindProperty("misfireBreakRollChance").floatValue = 0.04f;
                so.FindProperty("socketCount").intValue      = s.sockets;
                so.FindProperty("primaryScaling").enumValueIndex = (int)s.scaling;
                so.FindProperty("diplomatRankBonusPerRank").floatValue = 0.04f;
                so.FindProperty("accuracy").floatValue       = 0.86f;
                so.FindProperty("critChanceBonus").floatValue = s.critBonus;
                so.FindProperty("tier").enumValueIndex       = (int)s.tier;
                so.FindProperty("family").enumValueIndex     = (int)s.family;
                so.FindProperty("exclusiveFactionId").stringValue = s.factionId ?? "";
                so.FindProperty("uniqueTraitId").stringValue = s.traitId ?? "";
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(asset, path);
                created++;
            }
            return created;
        }

        // ─── 20 NEW CONTRACTS ─────────────────────────────────────────────────
        private struct CSeed
        {
            public string id, name, factionId, itemId, next, prereq;
            public ContractType type;
            public int diff, lvl, qty, count, cred, rep, rank;
            public float hours;
            public BiomeTag biome;
            public ZombieTier zTier;
            public bool endgame;
        }

        private static int SeedContracts()
        {
            var seeds = new[]
            {
                // New types — scattered factions
                new CSeed { id="contract_escort_caravan", name="Escort the Caravan", type=ContractType.Escort, factionId="dustwalkers", diff=3, lvl=4, count=5, hours=6, cred=320, rep=90, biome=BiomeTag.Suburbia, zTier=ZombieTier.Standard },
                new CSeed { id="contract_assassin_brokerage", name="Silence the Broker", type=ContractType.Assassination, factionId="black_haven", diff=5, lvl=12, count=1, hours=8, cred=600, rep=140, biome=BiomeTag.Metro, zTier=ZombieTier.Elite },
                new CSeed { id="contract_heist_lab", name="Heist: Concordance Lab", type=ContractType.Heist, factionId="black_haven", diff=6, lvl=18, count=1, hours=10, cred=900, rep=180, biome=BiomeTag.Metro, zTier=ZombieTier.Elite },
                new CSeed { id="contract_survival_arena", name="Survive the Arena", type=ContractType.SurvivalTrial, factionId="iron_march", diff=5, lvl=15, count=10, hours=12, cred=750, rep=160, biome=BiomeTag.Suburbia, zTier=ZombieTier.Standard },
                new CSeed { id="contract_anomaly_seal", name="Seal the RMAT Rift", type=ContractType.AnomalyContainment, factionId="concordance", diff=7, lvl=25, count=3, hours=10, cred=1100, rep=220, biome=BiomeTag.Perimeter, zTier=ZombieTier.Apex },
                new CSeed { id="contract_convoy_hit", name="Ambush the Convoy", type=ContractType.ConvoyAmbush, factionId="dustwalkers", diff=4, lvl=8, count=1, hours=6, cred=480, rep=120, biome=BiomeTag.Mountain, zTier=ZombieTier.Standard },
                new CSeed { id="contract_sabotage_outpost", name="Sabotage Iron March Outpost", type=ContractType.Sabotage, factionId="black_haven", diff=5, lvl=14, count=1, hours=8, cred=620, rep=150, biome=BiomeTag.Suburbia, zTier=ZombieTier.Standard },
                new CSeed { id="contract_intel_anomaly", name="Photograph the Anomaly", type=ContractType.IntelGathering, factionId="concordance", diff=3, lvl=6, count=4, hours=5, cred=280, rep=100, biome=BiomeTag.Perimeter, zTier=ZombieTier.Standard },
                new CSeed { id="contract_recruit_survivors", name="Recruit the Survivors", type=ContractType.Recruitment, factionId="hearthguard", diff=2, lvl=3, count=3, hours=6, cred=240, rep=110, biome=BiomeTag.Suburbia, zTier=ZombieTier.Standard },
                new CSeed { id="contract_lodge_hunt", name="Trophy Hunt: Apex Beast", type=ContractType.EliteElimination, factionId="lodge", diff=7, lvl=30, count=1, hours=12, cred=950, rep=200, biome=BiomeTag.Mountain, zTier=ZombieTier.Apex },

                // Multi-stage Iron March chain (3 stages)
                new CSeed { id="contract_chain_iron_1", name="Iron March: Recruit Trial", type=ContractType.FactionTrial, factionId="iron_march", diff=2, lvl=3, count=5, hours=4, cred=200, rep=80, rank=0, biome=BiomeTag.Suburbia, zTier=ZombieTier.Standard, next="contract_chain_iron_2" },
                new CSeed { id="contract_chain_iron_2", name="Iron March: Veteran Trial", type=ContractType.FactionTrial, factionId="iron_march", diff=5, lvl=18, count=8, hours=8, cred=620, rep=180, rank=2, biome=BiomeTag.Metro, zTier=ZombieTier.Heavy, next="contract_chain_iron_3", prereq="contract_chain_iron_1" },
                new CSeed { id="contract_chain_iron_3", name="Iron March: Commander Trial", type=ContractType.FactionTrial, factionId="iron_march", diff=8, lvl=45, count=3, hours=14, cred=1500, rep=350, rank=4, biome=BiomeTag.Perimeter, zTier=ZombieTier.HordeLeader, prereq="contract_chain_iron_2", endgame=true },

                // Multi-stage Concordance chain (2 stages, endgame)
                new CSeed { id="contract_chain_concord_1", name="Concordance: Field Calibration", type=ContractType.FactionTrial, factionId="concordance", diff=4, lvl=15, count=5, hours=8, cred=480, rep=160, rank=2, biome=BiomeTag.Metro, zTier=ZombieTier.Standard, next="contract_chain_concord_2" },
                new CSeed { id="contract_chain_concord_2", name="Concordance: Apex Stabilization", type=ContractType.FactionTrial, factionId="concordance", diff=9, lvl=70, count=1, hours=18, cred=2200, rep=500, rank=5, biome=BiomeTag.Perimeter, zTier=ZombieTier.Apex, prereq="contract_chain_concord_1", endgame=true },

                // Multi-stage Black Haven chain (2 stages, endgame)
                new CSeed { id="contract_chain_haven_1", name="Black Haven: Smuggler Initiation", type=ContractType.FactionTrial, factionId="black_haven", diff=3, lvl=8, count=2, hours=6, cred=360, rep=120, rank=1, biome=BiomeTag.Suburbia, zTier=ZombieTier.Standard, next="contract_chain_haven_2" },
                new CSeed { id="contract_chain_haven_2", name="Black Haven: Vault Heist", type=ContractType.Megastructure, factionId="black_haven", diff=8, lvl=55, count=1, hours=14, cred=1800, rep=420, rank=4, biome=BiomeTag.Metro, zTier=ZombieTier.HordeLeader, prereq="contract_chain_haven_1", endgame=true },

                // Faction endgame solos
                new CSeed { id="contract_endgame_lodge_grand", name="Lodge: The Grand Hunt", type=ContractType.EliteElimination, factionId="lodge", diff=9, lvl=80, count=1, hours=16, cred=2000, rep=480, rank=5, biome=BiomeTag.Mountain, zTier=ZombieTier.WorldBoss, endgame=true },
                new CSeed { id="contract_endgame_hearth_megastructure", name="Hearthguard: Build the Sanctuary", type=ContractType.Megastructure, factionId="hearthguard", diff=7, lvl=40, count=1, hours=20, cred=1600, rep=400, rank=4, biome=BiomeTag.Suburbia, zTier=ZombieTier.Elite, endgame=true },
                new CSeed { id="contract_endgame_dust_worldboss", name="Dustwalkers: Caravan Apocalypse", type=ContractType.Megastructure, factionId="dustwalkers", diff=9, lvl=85, count=1, hours=18, cred=2400, rep=520, rank=5, biome=BiomeTag.Perimeter, zTier=ZombieTier.WorldBoss, endgame=true },
            };

            EnsureFolder(CONTRACT_FOLDER);
            int created = 0;
            foreach (var s in seeds)
            {
                string path = $"{CONTRACT_FOLDER}/{s.id}.asset";
                if (AssetDatabase.LoadAssetAtPath<Contract>(path) != null) continue;
                var asset = ScriptableObject.CreateInstance<Contract>();
                var so = new SerializedObject(asset);
                so.FindProperty("contractId").stringValue       = s.id;
                so.FindProperty("displayName").stringValue      = s.name;
                so.FindProperty("description").stringValue      = $"{s.name} — issued by {s.factionId}.";
                so.FindProperty("type").enumValueIndex          = (int)s.type;
                so.FindProperty("factionId").stringValue        = s.factionId ?? "";
                so.FindProperty("difficulty").intValue          = s.diff;
                so.FindProperty("requiredCampLevel").intValue   = s.lvl;
                so.FindProperty("minSquadSize").intValue        = 1;
                so.FindProperty("objectiveItemId").stringValue  = s.itemId ?? "";
                so.FindProperty("objectiveQuantity").intValue   = s.qty;
                so.FindProperty("objectiveBiome").intValue      = (int)s.biome;
                so.FindProperty("objectiveZombieTier").enumValueIndex = (int)s.zTier;
                so.FindProperty("objectiveCount").intValue      = s.count;
                so.FindProperty("timeLimitHours").floatValue    = s.hours;
                so.FindProperty("baseCreditReward").intValue    = s.cred;
                so.FindProperty("baseFactionRep").intValue      = s.rep;
                so.FindProperty("difficultyRewardMultiplier").floatValue = 0.30f;
                so.FindProperty("survivorLossPermChance").floatValue        = 0.05f;
                so.FindProperty("survivorLossRecoverableChance").floatValue = 0.20f;
                so.FindProperty("nextContractId").stringValue         = s.next ?? "";
                so.FindProperty("prerequisiteContractId").stringValue = s.prereq ?? "";
                so.FindProperty("requiredFactionRank").intValue       = s.rank;
                so.FindProperty("isFactionEndgame").boolValue         = s.endgame;
                so.ApplyModifiedPropertiesWithoutUndo();
                AssetDatabase.CreateAsset(asset, path);
                created++;
            }
            return created;
        }

        private static void EnsureFolder(string path)
        {
            if (AssetDatabase.IsValidFolder(path)) return;
            string parent = System.IO.Path.GetDirectoryName(path).Replace('\\', '/');
            string leaf   = System.IO.Path.GetFileName(path);
            if (!AssetDatabase.IsValidFolder(parent)) EnsureFolder(parent);
            AssetDatabase.CreateFolder(parent, leaf);
        }
    }
}
#endif
