// Assets/Scripts/Services/PrestigeCoordinator.cs
using UnityEngine;
using ZedIdler.Services;

namespace ZedIdler.Services
{
    /// <summary>
    /// Listens for <see cref="IPrestigeService.OnPrestiged"/> and performs the
    /// actual soft-progression wipe: camp level / survivors / inventory /
    /// backpack / equipment / recycler queue / contracts. Prestige currency,
    /// purchased upgrades, faction reputation, daily streak, and tier rank all
    /// survive (those live in services NOT touched here).
    /// </summary>
    /// <remarks>
    /// Why a separate coordinator: <see cref="PrestigeService"/> stays pure
    /// (currency + upgrades only). The destructive reset is cross-cutting, so it
    /// lives here where it can resolve every other service and call the reset
    /// methods in the right order. Triggers a save immediately after.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class PrestigeCoordinator : MonoBehaviour
    {
        [Tooltip("Wipe faction reputation on prestige too? Default false — rep is account-wide meta.")]
        [SerializeField] private bool wipeFactionReputation = false;
        [Tooltip("Auto-save right after the reset.")]
        [SerializeField] private bool saveAfterReset = true;

        private IPrestigeService _prestige;

        private void Start()
        {
            if (ServiceLocator.TryGet(out _prestige))
                _prestige.OnPrestiged += HandlePrestiged;
        }

        private void OnDestroy()
        {
            if (_prestige != null) _prestige.OnPrestiged -= HandlePrestiged;
        }

        private void HandlePrestiged(long awardedPoints)
        {
            Debug.Log($"[PrestigeCoordinator] Reset triggered (+{awardedPoints} LP). Wiping soft progression…");

            // Inventory + backpack
            if (ServiceLocator.TryGet<IInventoryService>(out var inv)) inv.Clear();
            if (ServiceLocator.TryGet<IBackpackService>(out var bag)) bag.Clear();

            // Recycler queue (cancel everything in flight)
            if (ServiceLocator.TryGet<IRecyclerService>(out var rec))
            {
                var queued = new System.Collections.Generic.List<string>();
                foreach (var job in rec.Queue) queued.Add(job.jobId);
                foreach (var id in queued) rec.CancelJob(id);
            }

            // Contracts (drop all active/available — they re-roll fresh next session)
            if (ServiceLocator.TryGet<IContractsService>(out var contracts))
            {
                var ids = new System.Collections.Generic.List<string>();
                foreach (var c in contracts.All) ids.Add(c.instanceId);
                foreach (var id in ids) contracts.FailContract(id); // safe no-op on terminal states
            }

            // Camp level / survivor XP aggregate (the heart of the soft reset)
            if (ServiceLocator.TryGet<IPlayerProfile>(out var profile))
                profile.ResetForPrestige(); // see PlayerProfile addition

            // Optional faction wipe
            if (wipeFactionReputation && ServiceLocator.TryGet<IFactionService>(out var fac))
                fac.ResetAllReputation();

            // Apply starting-credit prestige bonus, if any upgrades grant it.
            if (profile != null && _prestige != null)
            {
                // start_credits upgrade EffectPerLevel = 250 (flat per level).
                int grant = Mathf.RoundToInt(_prestige.GetEffectFlatTotal("start_credits"));
                if (grant > 0) profile.AddCredits(grant);
            }

            if (saveAfterReset && ServiceLocator.TryGet<Core.IGameManager>(out var gm))
                gm.RequestSave();

            Debug.Log("[PrestigeCoordinator] Soft progression wiped. Meta progression intact.");
        }
    }
}
