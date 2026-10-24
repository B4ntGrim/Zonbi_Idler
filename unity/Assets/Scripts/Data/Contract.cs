// Assets/Scripts/Data/Contract.cs
using System;
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// Contract categories. New types can be appended at the end without
    /// breaking saves (order is locked for serialization).
    /// </summary>
    public enum ContractType
    {
        Courier            = 0,
        Salvage            = 1,
        Defense            = 2,
        HazardSurvey       = 3,
        EliteElimination   = 4,
        Rivalry            = 5,
        HighRoller         = 6,
        ResourceDelivery   = 7,
        Reconnaissance     = 8,
        Rescue             = 9,
        Escort             = 10,
        Assassination      = 11,
        Heist              = 12,
        SurvivalTrial      = 13,
        AnomalyContainment = 14,
        ConvoyAmbush       = 15,
        Sabotage           = 16,
        IntelGathering     = 17,
        Recruitment        = 18,
        Megastructure      = 19,
        FactionTrial       = 20
    }

    /// <summary>
    /// Designer-authored contract template. Service instantiates a
    /// <see cref="ZedIdler.Services.ContractInstance"/> from one of these
    /// templates when adding a contract to a faction's offer pool.
    /// </summary>
    /// <remarks>
    /// Create via: Right-click → Create → ZedIdler → Contract.
    /// Asset name: <c>Contract_Courier_AmmoDrop</c>, etc.
    ///
    /// Fields are interpreted per-type by <see cref="ZedIdler.Services.ContractsService"/>.
    /// Not every field is used by every type — designers fill the relevant ones.
    /// </remarks>
    [CreateAssetMenu(menuName = "ZedIdler/Contract", fileName = "Contract_New", order = 100)]
    public sealed class Contract : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string contractId;
        [SerializeField] private string displayName;
        [SerializeField, TextArea(2, 5)] private string description;
        [SerializeField] private ContractType type = ContractType.Courier;

        [Header("Issuer")]
        [Tooltip("Issuing faction id. Leave empty for system-wide contracts (e.g. Rescue).")]
        [SerializeField] private string factionId;

        [Header("Difficulty & Gates")]
        [SerializeField, Range(1, 10)] private int difficulty = 1;
        [SerializeField, Range(0, 100)] private int requiredCampLevel = 0;
        [Tooltip("Minimum survivor count required to accept.")]
        [SerializeField, Range(1, 4)] private int minSquadSize = 1;

        [Header("Objective Parameters (interpreted per Type)")]
        [SerializeField] private string objectiveItemId;    // Courier / Delivery / Salvage target item.
        [SerializeField, Range(0, 999)] private int objectiveQuantity = 1;
        [SerializeField] private BiomeTag objectiveBiome = BiomeTag.Any;
        [SerializeField] private ZombieTier objectiveZombieTier = ZombieTier.Standard;
        [SerializeField, Range(0, 999)] private int objectiveCount = 1; // kills / turns / waves.

        [Header("Time Limit")]
        [Tooltip("Hours from acceptance until expiry. 0 = no timer.")]
        [SerializeField, Range(0f, 72f)] private float timeLimitHours = 8f;

        [Header("Rewards")]
        [SerializeField, Range(0, 50000)] private int baseCreditReward = 100;
        [SerializeField, Range(0, 1000)]  private int baseFactionRep   = 50;
        [SerializeField] private RecipeStack[] bonusItemRewards;
        [Tooltip("Reward multiplier per difficulty point. 0.25 = +25% per pt above 1.")]
        [SerializeField, Range(0f, 1f)] private float difficultyRewardMultiplier = 0.25f;

        [Header("Failure Consequences")]
        [Tooltip("Chance a survivor is permanently killed on fail (per survivor).")]
        [SerializeField, Range(0f, 1f)] private float survivorLossPermChance = 0.05f;
        [Tooltip("Chance a survivor is lost-but-recoverable (becomes a rescue mission).")]
        [SerializeField, Range(0f, 1f)] private float survivorLossRecoverableChance = 0.20f;

        [Header("Chain (multi-stage contracts)")]
        [Tooltip("Next contract template id in the chain. Empty = end of chain.")]
        [SerializeField] private string nextContractId;
        [Tooltip("This contract is gated behind completing this prior contract id.")]
        [SerializeField] private string prerequisiteContractId;
        [Tooltip("Faction rank required to even see this contract.")]
        [SerializeField, Range(0, 6)] private int requiredFactionRank = 0;
        [Tooltip("Endgame-only flag — surfaces at Honored+ with unique rewards.")]
        [SerializeField] private bool isFactionEndgame = false;

        // ─── Accessors ────────────────────────────────────────────────────────
        public string ContractId           => contractId;
        public string DisplayName          => displayName;
        public string Description          => description;
        public ContractType Type           => type;
        public string FactionId            => factionId;
        public int    Difficulty           => difficulty;
        public int    RequiredCampLevel    => requiredCampLevel;
        public int    MinSquadSize         => minSquadSize;
        public string ObjectiveItemId      => objectiveItemId;
        public int    ObjectiveQuantity    => objectiveQuantity;
        public BiomeTag ObjectiveBiome     => objectiveBiome;
        public ZombieTier ObjectiveZombieTier => objectiveZombieTier;
        public int    ObjectiveCount       => objectiveCount;
        public float  TimeLimitHours       => timeLimitHours;
        public int    BaseCreditReward     => baseCreditReward;
        public int    BaseFactionRep       => baseFactionRep;
        public RecipeStack[] BonusItemRewards => bonusItemRewards ?? Array.Empty<RecipeStack>();
        public float  DifficultyRewardMultiplier => difficultyRewardMultiplier;
        public float  SurvivorLossPermChance        => survivorLossPermChance;
        public float  SurvivorLossRecoverableChance => survivorLossRecoverableChance;
        public string NextContractId         => nextContractId;
        public string PrerequisiteContractId => prerequisiteContractId;
        public int    RequiredFactionRank    => requiredFactionRank;
        public bool   IsFactionEndgame       => isFactionEndgame;

        /// <summary>Final credit reward at this difficulty.</summary>
        public int ScaledCreditReward => Mathf.RoundToInt(baseCreditReward * (1f + difficultyRewardMultiplier * (difficulty - 1)));
        public int ScaledFactionRep => Mathf.RoundToInt(baseFactionRep   * (1f + difficultyRewardMultiplier * (difficulty - 1)));
    }
}
