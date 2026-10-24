// Assets/Scripts/Services/ContractsService.cs
using System;
using System.Collections.Generic;
using UnityEngine;
using ZedIdler.Data;
using ZedIdler.Entities;

namespace ZedIdler.Services
{
    /// <summary>
    /// Persistent backend for the contract system. Maintains a pool of N
    /// active offers per faction, handles acceptance/progress/expiry/completion,
    /// integrates with Factions for rewards, with PlayerProfile for rescue
    /// missions (lost-but-recoverable survivors), and with the catalog for
    /// contract templates.
    /// </summary>
    /// <remarks>
    /// Lifecycle: Available → Accepted → InProgress → Completed | Failed | Expired
    ///
    /// Refresh policy: on contract completion, the faction's offer is replaced
    /// by a freshly rolled one (per spec answer 5).
    ///
    /// Failure roll: when a contract fails, each reserved survivor rolls
    /// independently for permanent loss vs lost-but-recoverable. Recoverable
    /// survivors generate a Rescue mission via <see cref="IPlayerProfile.StartRescueMission"/>.
    ///
    /// Wandering integration: <see cref="ReportKill"/> / <see cref="ReportLoot"/>
    /// / <see cref="ReportZoneCleared"/> hooks let the Wandering loop auto-
    /// progress contracts the player has accepted.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class ContractsService : MonoBehaviour, IContractsService
    {
        [Header("Offer Pool")]
        [Tooltip("Active offer slots PER faction.")]
        [SerializeField, Range(1, 10)] private int offersPerFaction = 3;

        [Header("Defaults")]
        [SerializeField, Range(0.5f, 72f)] private float fallbackTimeLimitHours = 8f;
        [SerializeField] private bool autoPopulateOnStart = true;

        // ─── Services ─────────────────────────────────────────────────────────
        private ICatalogService _catalog;
        private IFactionService _factions;
        private IPlayerProfile _profile;
        private IInventoryService _inventory;
        private ITraversalContext _traversal;

        // ─── State ────────────────────────────────────────────────────────────
        private readonly List<ContractInstance> _all = new List<ContractInstance>();
        private System.Random _rng = new System.Random();

        public IReadOnlyList<ContractInstance> All => _all;

        // ─── Events ───────────────────────────────────────────────────────────
        public event Action<ContractInstance> OnContractOffered;
        public event Action<ContractInstance> OnContractAccepted;
        public event Action<ContractInstance> OnContractProgress;
        public event Action<ContractInstance> OnContractCompleted;
        public event Action<ContractInstance> OnContractFailed;
        public event Action<ContractInstance> OnContractExpired;

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            ServiceLocator.Register<IContractsService>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<IContractsService>();

        private void Start()
        {
            ServiceLocator.TryGet(out _catalog);
            ServiceLocator.TryGet(out _factions);
            ServiceLocator.TryGet(out _profile);
            ServiceLocator.TryGet(out _inventory);
            ServiceLocator.TryGet(out _traversal);
            if (autoPopulateOnStart) PopulateInitialOffers();
        }

        private void Update() => Tick(Time.deltaTime);

        // ─── Pool population ──────────────────────────────────────────────────
        public void PopulateInitialOffers()
        {
            if (_factions == null) return;
            foreach (var faction in _factions.Factions)
            {
                if (faction == null) continue;
                int existing = CountOpenOffers(faction.FactionId);
                for (int i = existing; i < offersPerFaction; i++) RollOffer(faction.FactionId);
            }
        }

        private int CountOpenOffers(string factionId)
        {
            int n = 0;
            for (int i = 0; i < _all.Count; i++)
                if (_all[i].factionId == factionId && _all[i].state == ContractState.Available) n++;
            return n;
        }

        private ContractInstance RollOffer(string factionId)
        {
            var template = PickRandomTemplateForFaction(factionId);
            if (template == null) return default;
            var inst = new ContractInstance
            {
                instanceId       = Guid.NewGuid().ToString("N"),
                contractId       = template.ContractId,
                type             = template.Type,
                factionId        = factionId,
                difficulty       = template.Difficulty,
                state            = ContractState.Available,
                offeredUtcTicks  = DateTime.UtcNow.Ticks,
                expiresUtcTicks  = DateTime.UtcNow.AddHours(template.TimeLimitHours <= 0 ? fallbackTimeLimitHours : template.TimeLimitHours).Ticks,
                progressCurrent  = 0,
                progressGoal     = template.ObjectiveCount > 0 ? template.ObjectiveCount : template.ObjectiveQuantity,
                creditReward     = template.ScaledCreditReward,
                factionRepReward = template.ScaledFactionRep,
                reservedSurvivorIds = Array.Empty<string>()
            };
            _all.Add(inst);
            OnContractOffered?.Invoke(inst);
            return inst;
        }

        private Contract PickRandomTemplateForFaction(string factionId)
        {
            if (_catalog is IContractCatalogProvider ccp)
            {
                var all = ccp.GetAllContracts();
                var matches = new List<Contract>();
                int campLevel = _profile?.CampLevel ?? 0;
                foreach (var c in all)
                {
                    if (c == null) continue;
                    if (c.Type == ContractType.Rescue) continue; // Rescues are spawned by PlayerProfile, not rolled.
                    if (c.FactionId != factionId) continue;
                    if (c.RequiredCampLevel > campLevel) continue;
                    matches.Add(c);
                }
                if (matches.Count == 0) return null;
                return matches[_rng.Next(matches.Count)];
            }
            return null;
        }

        // ─── Accept / Complete / Fail ─────────────────────────────────────────
        public bool AcceptContract(string instanceId, IReadOnlyList<string> survivorIds)
        {
            int idx = _all.FindIndex(c => c.instanceId == instanceId);
            if (idx < 0) return false;
            var c = _all[idx];
            if (c.state != ContractState.Available) return false;
            if (survivorIds == null || survivorIds.Count < (GetTemplate(c)?.MinSquadSize ?? 1)) return false;

            c.state = ContractState.Accepted;
            c.acceptedUtcTicks = DateTime.UtcNow.Ticks;
            c.reservedSurvivorIds = new List<string>(survivorIds).ToArray();
            _all[idx] = c;
            OnContractAccepted?.Invoke(c);
            return true;
        }

        public bool ReportProgress(string instanceId, int delta)
        {
            int idx = _all.FindIndex(c => c.instanceId == instanceId);
            if (idx < 0) return false;
            var c = _all[idx];
            if (c.state != ContractState.Accepted && c.state != ContractState.InProgress) return false;
            c.state = ContractState.InProgress;
            c.progressCurrent = Mathf.Clamp(c.progressCurrent + delta, 0, c.progressGoal);
            _all[idx] = c;
            OnContractProgress?.Invoke(c);
            if (c.progressCurrent >= c.progressGoal) CompleteContract(instanceId);
            return true;
        }

        public bool CompleteContract(string instanceId)
        {
            int idx = _all.FindIndex(c => c.instanceId == instanceId);
            if (idx < 0) return false;
            var c = _all[idx];
            if (c.state == ContractState.Completed || c.state == ContractState.Failed) return false;
            c.state = ContractState.Completed;
            _all[idx] = c;

            // Apply rewards.
            _profile?.AddCredits(c.creditReward);
            _factions?.OnContractCompleted(c.factionId);

            var template = GetTemplate(c);
            if (template != null && _inventory != null)
            {
                foreach (var bonus in template.BonusItemRewards)
                {
                    if (!string.IsNullOrEmpty(bonus.itemId) && bonus.quantity > 0)
                        _inventory.AddDrop(new LootDrop { itemId = bonus.itemId, quantity = bonus.quantity, rarity = bonus.outputRarity });
                }
            }

            OnContractCompleted?.Invoke(c);

            ZedIdler.Services.ServiceLocator.Get<ZedIdler.Services.Analytics.IAnalyticsService>()
                ?.Progression("contract_completed", new System.Collections.Generic.Dictionary<string, object>
                {
                    { "type", c.type.ToString() }, { "faction", c.factionId },
                    { "difficulty", c.difficulty }, { "credits", c.creditReward }
                });

            // Multi-stage chain: spawn the next stage immediately if defined.
            if (template != null && !string.IsNullOrEmpty(template.NextContractId))
            {
                SpawnChainStage(template.NextContractId, c.factionId);
            }

            // Refresh pool — replace with a fresh offer (spec answer 5).
            _all.RemoveAt(idx);
            if (!string.IsNullOrEmpty(c.factionId)) RollOffer(c.factionId);
            return true;
        }

        /// <summary>
        /// Spawn the next stage of a multi-stage chain. Bypasses the random
        /// roll — the specific template id is instantiated directly so chains
        /// proceed deterministically.
        /// </summary>
        private ContractInstance SpawnChainStage(string contractId, string factionId)
        {
            var template = (_catalog is IContractCatalogProvider ccp) ? ccp.GetContract(contractId) : null;
            if (template == null) return default;
            var inst = new ContractInstance
            {
                instanceId       = Guid.NewGuid().ToString("N"),
                contractId       = template.ContractId,
                type             = template.Type,
                factionId        = string.IsNullOrEmpty(factionId) ? template.FactionId : factionId,
                difficulty       = template.Difficulty,
                state            = ContractState.Available,
                offeredUtcTicks  = DateTime.UtcNow.Ticks,
                expiresUtcTicks  = DateTime.UtcNow.AddHours(template.TimeLimitHours <= 0 ? fallbackTimeLimitHours : template.TimeLimitHours).Ticks,
                progressCurrent  = 0,
                progressGoal     = template.ObjectiveCount > 0 ? template.ObjectiveCount : template.ObjectiveQuantity,
                creditReward     = template.ScaledCreditReward,
                factionRepReward = template.ScaledFactionRep,
                reservedSurvivorIds = Array.Empty<string>()
            };
            _all.Add(inst);
            OnContractOffered?.Invoke(inst);
            return inst;
        }

        public bool FailContract(string instanceId)
        {
            int idx = _all.FindIndex(c => c.instanceId == instanceId);
            if (idx < 0) return false;
            var c = _all[idx];
            if (c.state == ContractState.Completed || c.state == ContractState.Failed) return false;
            c.state = ContractState.Failed;
            _all[idx] = c;

            _factions?.OnContractFailed(c.factionId);
            ApplySurvivorLossRolls(c);
            OnContractFailed?.Invoke(c);

            ZedIdler.Services.ServiceLocator.Get<ZedIdler.Services.Analytics.IAnalyticsService>()
                ?.Progression("contract_failed", new System.Collections.Generic.Dictionary<string, object>
                {
                    { "type", c.type.ToString() }, { "faction", c.factionId }, { "difficulty", c.difficulty }
                });

            // Replace with a fresh offer.
            _all.RemoveAt(idx);
            if (!string.IsNullOrEmpty(c.factionId)) RollOffer(c.factionId);
            return true;
        }

        private void ApplySurvivorLossRolls(ContractInstance c)
        {
            var template = GetTemplate(c);
            if (template == null || _profile == null) return;
            // Template value of 0 means "use centralized balance default".
            float pPerm  = template.SurvivorLossPermChance > 0f
                ? template.SurvivorLossPermChance
                : ZedIdler.Services.BalanceRuntime.SurvivorPermLossChance;
            float pRec   = template.SurvivorLossRecoverableChance > 0f
                ? template.SurvivorLossRecoverableChance
                : ZedIdler.Services.BalanceRuntime.SurvivorRecoverableChance;
            int zoneTier = c.difficulty;
            foreach (var survivorId in c.reservedSurvivorIds)
            {
                double r = _rng.NextDouble();
                if (r < pPerm)
                {
                    // Permanent loss — Roster system should remove the survivor.
                    // We just fire the rescue ledger as "expired" so external systems can react.
                    _profile.StartRescueMission(survivorId, zoneTier, default, DateTime.UtcNow.Ticks - 1);
                }
                else if (r < pPerm + pRec)
                {
                    _profile.StartRescueMission(survivorId, zoneTier, default, DateTime.UtcNow.Ticks);
                }
            }
        }

        // ─── Wandering hooks ──────────────────────────────────────────────────
        public void ReportKill(ZombieTier tier, string factionEnemyId)
        {
            for (int i = 0; i < _all.Count; i++)
            {
                var c = _all[i];
                if (c.state != ContractState.Accepted && c.state != ContractState.InProgress) continue;
                if (c.type == ContractType.EliteElimination)
                {
                    var tpl = GetTemplate(c);
                    if (tpl != null && tier == tpl.ObjectiveZombieTier) ReportProgress(c.instanceId, 1);
                }
                else if (c.type == ContractType.Rivalry && !string.IsNullOrEmpty(factionEnemyId) && factionEnemyId == c.factionId)
                {
                    ReportProgress(c.instanceId, 1);
                }
            }
        }

        public void ReportLoot(string itemId, int quantity)
        {
            for (int i = 0; i < _all.Count; i++)
            {
                var c = _all[i];
                if (c.state != ContractState.Accepted && c.state != ContractState.InProgress) continue;
                if (c.type != ContractType.Salvage && c.type != ContractType.Courier && c.type != ContractType.ResourceDelivery)
                    continue;
                var tpl = GetTemplate(c);
                if (tpl != null && tpl.ObjectiveItemId == itemId) ReportProgress(c.instanceId, quantity);
            }
        }

        public void ReportZoneCleared(BiomeTag biome)
        {
            for (int i = 0; i < _all.Count; i++)
            {
                var c = _all[i];
                if (c.state != ContractState.Accepted && c.state != ContractState.InProgress) continue;
                if (c.type != ContractType.Reconnaissance && c.type != ContractType.HazardSurvey) continue;
                var tpl = GetTemplate(c);
                if (tpl != null && (tpl.ObjectiveBiome == BiomeTag.Any || (tpl.ObjectiveBiome & biome) != 0))
                    ReportProgress(c.instanceId, 1);
            }
        }

        // ─── Tick / expire ────────────────────────────────────────────────────
        public void Tick(float deltaSeconds)
        {
            long nowTicks = DateTime.UtcNow.Ticks;
            for (int i = _all.Count - 1; i >= 0; i--)
            {
                var c = _all[i];
                if (c.state == ContractState.Completed || c.state == ContractState.Failed) continue;
                if (c.expiresUtcTicks <= nowTicks)
                {
                    if (c.state == ContractState.Accepted || c.state == ContractState.InProgress)
                    {
                        // Treat expired-while-active as a failure.
                        FailContract(c.instanceId);
                    }
                    else
                    {
                        c.state = ContractState.Expired;
                        OnContractExpired?.Invoke(c);
                        _all.RemoveAt(i);
                        if (!string.IsNullOrEmpty(c.factionId)) RollOffer(c.factionId);
                    }
                }
            }
        }

        public void ApplyOfflineProgress(TimeSpan elapsed)
        {
            // Expire stale contracts; no progress is simulated offline.
            Tick((float)elapsed.TotalSeconds);
        }

        private Contract GetTemplate(ContractInstance c)
        {
            return (_catalog is IContractCatalogProvider ccp) ? ccp.GetContract(c.contractId) : null;
        }

        // ─── Snapshot ─────────────────────────────────────────────────────────
        [Serializable]
        public struct Snapshot
        {
            public ContractInstance[] all;
        }

        public Snapshot CreateSnapshot() => new Snapshot { all = _all.ToArray() };

        public void Restore(Snapshot s)
        {
            _all.Clear();
            if (s.all != null) _all.AddRange(s.all);
        }
    }

    public interface IContractsService
    {
        IReadOnlyList<ContractInstance> All { get; }

        event Action<ContractInstance> OnContractOffered;
        event Action<ContractInstance> OnContractAccepted;
        event Action<ContractInstance> OnContractProgress;
        event Action<ContractInstance> OnContractCompleted;
        event Action<ContractInstance> OnContractFailed;
        event Action<ContractInstance> OnContractExpired;

        bool AcceptContract(string instanceId, IReadOnlyList<string> survivorIds);
        bool ReportProgress(string instanceId, int delta);
        bool CompleteContract(string instanceId);
        bool FailContract(string instanceId);

        void ReportKill(ZombieTier tier, string factionEnemyId);
        void ReportLoot(string itemId, int quantity);
        void ReportZoneCleared(BiomeTag biome);

        void Tick(float deltaSeconds);
        void ApplyOfflineProgress(TimeSpan elapsed);

        ContractsService.Snapshot CreateSnapshot();
        void Restore(ContractsService.Snapshot s);
    }

    public interface IContractCatalogProvider
    {
        Contract GetContract(string contractId);
        IReadOnlyList<Contract> GetAllContracts();
    }

    [Serializable]
    public struct ContractInstance
    {
        public string instanceId;
        public string contractId;       // template asset id
        public ContractType type;
        public string factionId;
        public int difficulty;
        public ContractState state;
        public long offeredUtcTicks;
        public long acceptedUtcTicks;
        public long expiresUtcTicks;
        public int progressCurrent;
        public int progressGoal;
        public int creditReward;
        public int factionRepReward;
        public string[] reservedSurvivorIds;
    }

    public enum ContractState
    {
        Available  = 0,
        Accepted   = 1,
        InProgress = 2,
        Completed  = 3,
        Failed     = 4,
        Expired    = 5
    }
}
