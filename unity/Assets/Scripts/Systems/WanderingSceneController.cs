// Assets/Scripts/Systems/WanderingSceneController.cs
using System;
using UnityEngine;
using ZedIdler.Core;
using ZedIdler.Data;
using ZedIdler.Entities;
using ZedIdler.Services;

namespace ZedIdler.Systems
{
    /// <summary>Reasons WanderingSceneController auto-returned a run.</summary>
    public enum AutoReturnReason
    {
        EncounterLimitReached = 0,
        ManualReturn          = 1,
        SurvivorDefeated      = 2
    }

    /// <summary>
    /// Persistent backend that drives Wandering combat continuously, even when
    /// the player is viewing another tab. Owns the active <see cref="CombatSystem"/>
    /// instance, chains encounters with a configurable inter-encounter delay,
    /// and exposes executable scene-level commands (loot / eat / drink / scout / etc.).
    /// </summary>
    /// <remarks>
    /// Placement: this MonoBehaviour lives on the persistent Bootstrap GameObject
    /// alongside <c>GameManager</c> and <c>CatalogService</c> — NOT in the
    /// Wandering scene — so it keeps ticking when other scenes are loaded.
    /// The scene-bound UI (HP bars, sprite slots, log view) is in
    /// <c>WanderingSceneView</c>, which subscribes to events on this controller.
    ///
    /// Integration:
    /// • Reads BiomeTag from <see cref="ITraversalContext"/>.
    /// • Reads TimeOfDay from <see cref="ITimeService"/>.
    /// • Rolls zombies from <see cref="ICatalogService"/>.
    /// • Auto-routes loot to <see cref="IInventoryService"/> on kill.
    /// • Wraps the inner <see cref="CombatSystem"/> as a command handler so the
    ///   executable text box dispatches scene-level commands first before
    ///   falling through to combat-level commands.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class WanderingSceneController : MonoBehaviour, ICombatCommandHandler
    {
        [Header("Pacing")]
        [Tooltip("Base seconds per combat turn. Modified by survivor level, perks, and gear at runtime.")]
        [SerializeField, Range(0.25f, 5f)] private float baseTurnInterval = 1f;

        [Tooltip("Delay between an encounter ending and the next zombie auto-spawning.")]
        [SerializeField, Range(0.5f, 10f)] private float interEncounterDelay = 2f;

        [Header("Defaults (used when services aren't bound yet)")]
        [SerializeField] private BiomeTag fallbackBiome = BiomeTag.Suburbia;

        [Header("Background Ticking")]
        [Tooltip("Keep advancing combat while the player is on other tabs.")]
        [SerializeField] private bool tickInBackground = true;

        [Header("Run Limits")]
        [Tooltip("Auto-return when this many encounters have been resolved.")]
        [SerializeField, Range(1, 50)] private int encounterLimit = 10;

        [Tooltip("Meters traveled per combat turn for the distance HUD.")]
        [SerializeField, Range(1, 100)] private int metersPerTurn = 10;

        [Tooltip("Auto-loot ON by default. Toggle via UI or 'autoloot off' command.")]
        [SerializeField] private bool autoLootEnabled = true;

        [Header("Bandage Loot")]
        [Tooltip("ItemId that 'use_bandage' looks for. Auto-loot honors this when HP is low.")]
        [SerializeField] private string bandageItemId = "bandage";
        [SerializeField, Range(0f, 1f)] private float autoBandageHpThreshold = 0.4f;
        [SerializeField, Range(5, 100)] private int bandageHealAmount = 25;

        // ─── Runtime state ────────────────────────────────────────────────────
        /// <summary>Public read-only handle to the runtime spawner (for weather/noise/horde triggers).</summary>
        public RuntimeZombieSpawner Spawner => _spawner;

        public CombatSystem Combat { get; private set; }
        public SquadCombatSystem SquadCombat { get; private set; }
        public IReadOnlyList<Survivor> ActiveSquad { get; private set; }
        public Survivor ActiveSurvivor { get; private set; }
        public bool IsRunning { get; private set; }
        public BiomeTag CurrentBiome { get; private set; }
        public TimeOfDay CurrentTimeOfDay { get; private set; } = TimeOfDay.Any;

        private float _interEncounterTimer;
        private bool _waitingForNextEncounter;
        private int _kills;
        private int _turnsElapsed;
        private int _encountersResolved;
        private int _ammoInMag = 30;       // placeholder until weapon system lands
        private int _weaponCleanliness = 100; // 0–100
        private bool _hasGun = true;        // placeholder
        private bool _hasMeleeWeapon = true;

        // Services
        private ICatalogService _catalogs;
        private ITraversalContext _traversal;
        private ITimeService _time;
        private IInventoryService _inventory;
        private RuntimeZombieSpawner _spawner;
        private IBackpackService _backpack;
        private IPlayerProfile _profile;

        // ─── Events (subscribe from WanderingSceneView and any other UI) ──────
        public event Action<Survivor> OnRunStarted;
        public event Action OnRunPaused;
        public event Action<AutoReturnReason> OnAutoReturn;
        public event Action<int> OnDistanceChanged;
        public event Action<int> OnEncounterCountChanged;
        public event Action<CombatEncounter, bool> OnEncounterStarted;     // (encounter, playerHasInitiative)
        public event Action<CombatEncounter> OnEncounterEnded;
        public event Action<int, TurnAction> OnTurnResolved;
        public event Action<ZombieDefinition, LootDrop[]> OnZombieDefeated;
        public event Action<Survivor> OnSurvivorDefeated;
        public event Action<LogEntry> OnCombatLogEntry;
        public event Action<int> OnSurvivorHpChanged;

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            ServiceLocator.Register<WanderingSceneController>(this);
        }

        private void OnDestroy()
        {
            UnbindServices();
            ServiceLocator.Unregister<WanderingSceneController>();
        }

        private void Start()
        {
            ResolveServices();
        }

        private void Update()
        {
            if (!IsRunning) return;
            if (!tickInBackground && !IsWanderingActiveState()) return;

            if (_waitingForNextEncounter)
            {
                _interEncounterTimer -= Time.deltaTime;
                if (_interEncounterTimer <= 0f)
                {
                    _waitingForNextEncounter = false;
                    TrySpawnNextEncounter();
                }
                return;
            }

            Combat?.Tick(Time.deltaTime, GetEffectiveTurnInterval());
        }

        // ─── Public control ───────────────────────────────────────────────────
        /// <summary>Begin a new Wandering run with the given survivor.</summary>
        public void StartRun(Survivor survivor)
        {
            if (survivor == null) throw new ArgumentNullException(nameof(survivor));
            StartRun(new[] { survivor });
        }

        /// <summary>
        /// Begin a Wandering run with a squad of 1–4 survivors. Backwards-compatible
        /// 1-member overload exists above. Routes encounters through
        /// <see cref="SquadCombatSystem"/> instead of the single-survivor <see cref="CombatSystem"/>.
        /// </summary>
        public void StartRun(IList<Survivor> squad)
        {
            if (squad == null || squad.Count == 0) throw new ArgumentException("Empty squad.", nameof(squad));
            if (IsRunning) StopRun();

            ResolveServices();
            ActiveSurvivor = squad[0];
            ActiveSquad = new List<Survivor>(squad);
            SquadCombat = new SquadCombatSystem(squad);
            Combat = null; // squad mode supersedes single-survivor.
            BindSquadCombatEvents();
            _kills = 0;
            _turnsElapsed = 0;
            _encountersResolved = 0;
            IsRunning = true;

            _backpack?.StartRunWithSquad(ActiveSquad); // sum of per-survivor caps per spec
            OnRunStarted?.Invoke(ActiveSurvivor);

            CurrentBiome = _traversal?.CurrentBiome ?? fallbackBiome;
            CurrentTimeOfDay = _time?.TimeOfDay ?? TimeOfDay.Any;
            TrySpawnNextEncounter();
        }
        {
            if (survivor == null) throw new ArgumentNullException(nameof(survivor));
            if (IsRunning) StopRun();

            ResolveServices();
            ActiveSurvivor = survivor;
            Combat = new CombatSystem(survivor);
            BindCombatEvents();
            _kills = 0;
            _turnsElapsed = 0;
            _encountersResolved = 0;
            IsRunning = true;

            // Start the backpack run alongside combat.
            _backpack?.StartRun(survivor);

            OnRunStarted?.Invoke(survivor);

            CurrentBiome = _traversal?.CurrentBiome ?? fallbackBiome;
            CurrentTimeOfDay = _time?.TimeOfDay ?? TimeOfDay.Any;
            TrySpawnNextEncounter();
        }

        /// <summary>
        /// Return survivor to base — transfers backpack to inventory and stops the run.
        /// Always available; the trip is instant per spec.
        /// </summary>
        public void ReturnToBase()
        {
            if (!IsRunning) return;
            _backpack?.EndRun(transferToInventory: true);
            StopRun();
        }

        /// <summary>Stop the current run. Pauses ticking and frees the combat instance.</summary>
        public void StopRun()
        {
            if (Combat != null && Combat.IsInEncounter) Combat.EndEncounter();
            UnbindCombatEvents();
            Combat = null;
            IsRunning = false;
            OnRunPaused?.Invoke();
        }

        /// <summary>Submit a raw command from the executable text box.</summary>
        public void SubmitCommand(string raw) => Combat?.Log.Submit(raw);

        // ─── Service resolution ──────────────────────────────────────────────
        private void ResolveServices()
        {
            if (_traversal == null) ServiceLocator.TryGet(out _traversal);
            if (_time      == null) ServiceLocator.TryGet(out _time);
            if (_catalogs  == null) ServiceLocator.TryGet(out _catalogs);
            if (_inventory == null) ServiceLocator.TryGet(out _inventory);
            if (_backpack  == null) ServiceLocator.TryGet(out _backpack);
            if (_profile   == null) ServiceLocator.TryGet(out _profile);
            if (_spawner   == null && _catalogs != null)
                _spawner = new RuntimeZombieSpawner(_catalogs, _time, _traversal);

            if (_traversal != null) _traversal.OnBiomeChanged += HandleBiomeChanged;
            if (_time      != null) _time.OnHourChanged      += HandleHourChanged;
        }

        private void UnbindServices()
        {
            if (_traversal != null) _traversal.OnBiomeChanged -= HandleBiomeChanged;
            if (_time      != null) _time.OnHourChanged      -= HandleHourChanged;
        }

        private void HandleBiomeChanged(BiomeTag b) => CurrentBiome = b;
        private void HandleHourChanged(int hour)
        {
            if (_time != null) CurrentTimeOfDay = _time.TimeOfDay;
        }

        // ─── Encounter chain ──────────────────────────────────────────────────
        private void TrySpawnNextEncounter()
        {
            if (_catalogs?.ZombieCatalog == null)
            {
                Debug.LogWarning("[Wandering] No ZombieCatalog available; skipping spawn.");
                return;
            }
            int level = ActiveSurvivor?.Level.Level ?? 1;
            // Route through RuntimeZombieSpawner so weather/noise/horde modifiers apply.
            var zombie = _spawner != null
                ? _spawner.SpawnNext(level)
                : _catalogs.RollZombie(CurrentBiome, CurrentTimeOfDay, level);
            if (zombie == null)
            {
                Debug.LogWarning($"[Wandering] No zombie matched (biome={CurrentBiome}, time={CurrentTimeOfDay}, lvl={level}).");
                return;
            }
            Combat.BeginEncounter(zombie);
        }

        private void QueueNextEncounter()
        {
            _interEncounterTimer = interEncounterDelay;
            _waitingForNextEncounter = true;
        }

        // ─── Combat event wiring ──────────────────────────────────────────────
        private void BindSquadCombatEvents()
        {
            if (SquadCombat == null) return;
            SquadCombat.OnEncounterStarted += (enc, _) => OnEncounterStarted?.Invoke(enc, true);
            SquadCombat.OnEncounterEnded   += ForwardEncounterEnded;
            SquadCombat.OnTurnResolved     += ForwardTurnResolved;
            SquadCombat.OnZombieDefeated   += HandleZombieDefeated;
            SquadCombat.OnSurvivorDowned   += HandleSurvivorDefeated;
            SquadCombat.OnSquadWiped       += () => StopRun();
            SquadCombat.OnCombatLogEntry   += entry => OnCombatLogEntry?.Invoke(entry);
            SquadCombat.OnSurvivorHpChanged += (_, hp) => OnSurvivorHpChanged?.Invoke(hp);
            SquadCombat.Log.BindHandler(this);
        }

        {
            Combat.OnEncounterStarted += ForwardEncounterStarted;
            Combat.OnEncounterEnded   += ForwardEncounterEnded;
            Combat.OnTurnResolved     += ForwardTurnResolved;
            Combat.OnZombieDefeated   += HandleZombieDefeated;
            Combat.OnSurvivorDefeated += HandleSurvivorDefeated;
            Combat.OnCombatLogEntry   += entry => OnCombatLogEntry?.Invoke(entry);

            // Layer our scene-level command handler ON TOP of combat's handler.
            Combat.Log.BindHandler(this);
        }

        private void UnbindCombatEvents()
        {
            if (Combat == null) return;
            Combat.OnEncounterStarted -= ForwardEncounterStarted;
            Combat.OnEncounterEnded   -= ForwardEncounterEnded;
            Combat.OnTurnResolved     -= ForwardTurnResolved;
            Combat.OnZombieDefeated   -= HandleZombieDefeated;
            Combat.OnSurvivorDefeated -= HandleSurvivorDefeated;
        }

        private void ForwardEncounterStarted(CombatEncounter enc, bool playerFirst) =>
            OnEncounterStarted?.Invoke(enc, playerFirst);

        private void ForwardEncounterEnded(CombatEncounter enc) =>
            OnEncounterEnded?.Invoke(enc);

        private void ForwardTurnResolved(int turnIdx, TurnAction action)
        {
            _turnsElapsed = turnIdx;
            OnTurnResolved?.Invoke(turnIdx, action);
            OnDistanceChanged?.Invoke(GetDistanceMeters());
            if (action.actor == TurnActor.Zombie) OnSurvivorHpChanged?.Invoke(Combat.SurvivorHp);
        }

        /// <summary>Distance traveled this run in meters (turns × metersPerTurn).</summary>
        public int GetDistanceMeters() => _turnsElapsed * metersPerTurn;

        /// <summary>Encounters resolved this run (kills count).</summary>
        public int EncountersResolved => _encountersResolved;

        /// <summary>Whether auto-loot is currently enabled for this run.</summary>
        public bool IsAutoLootEnabled => autoLootEnabled;
        public void SetAutoLoot(bool enabled) { autoLootEnabled = enabled; }

        private void HandleZombieDefeated(ZombieDefinition z, LootDrop[] loot)
        {
            _kills++;
            _encountersResolved++;
            OnEncounterCountChanged?.Invoke(_encountersResolved);

            // Route loot through the backpack first (weight-gated), then base inventory.
            if (autoLootEnabled)
            {
                for (int i = 0; i < loot.Length; i++)
                {
                    if (!loot[i].IsValid) continue;
                    if (_backpack != null)
                    {
                        if (!_backpack.TryAddDrop(loot[i]))
                        {
                            Combat?.Log.Append($"[Loot] Backpack full \u2014 {loot[i].quantity}\u00d7 {loot[i].itemId} left behind", LogChannel.Warning);
                        }
                    }
                    else if (_inventory != null)
                    {
                        _inventory.AddDrop(loot[i]);
                    }
                }
            }
            OnZombieDefeated?.Invoke(z, loot);

            // Auto-bandage if HP is critical and we have one.
            float hpRatio = (float)Combat.SurvivorHp / Mathf.Max(1, Combat.SurvivorMaxHp);
            if (hpRatio < autoBandageHpThreshold && _inventory != null && _inventory.HasItem(bandageItemId))
            {
                TryUseBandage();
            }

            // Auto-return on encounter limit.
            if (_encountersResolved >= encounterLimit)
            {
                Combat?.Log.Append($"[Wandering] Encounter limit reached ({encounterLimit}). Returning to base.", LogChannel.System);
                OnAutoReturn?.Invoke(AutoReturnReason.EncounterLimitReached);
                ReturnToBase();
                return;
            }

            QueueNextEncounter();
        }

        private void HandleSurvivorDefeated(Survivor s)
        {
            OnSurvivorDefeated?.Invoke(s);

            // Preserve backpack as a rescue mission so the player can recover it.
            if (_backpack != null && _profile != null)
            {
                var bag = _backpack.CreateSnapshot();
                int zoneTier = (int)CurrentBiome; // rough heuristic until ZoneCell threat propagation lands
                _profile.StartRescueMission(s.Id, zoneTier, bag, DateTime.UtcNow.Ticks);
                _backpack.EndRun(transferToInventory: false); // bag stays with rescue mission
            }
            StopRun();
        }

        // ─── Turn-interval scaling ────────────────────────────────────────────
        /// <summary>
        /// Effective seconds-per-turn after applying survivor level, perk, and gear modifiers.
        /// Faster = shorter interval = more turns per second. Floored at 0.25s to prevent
        /// runaway pacing.
        /// </summary>
        public float GetEffectiveTurnInterval()
        {
            if (ActiveSurvivor == null) return baseTurnInterval;

            // -1% per level over 1 (level 100 → -0.99 → clamped)
            float levelBonus = (ActiveSurvivor.Level.Level - 1) * 0.01f;
            // Agility-based: -0.2% per agility point
            float agilityBonus = ActiveSurvivor.Stats.Agility * 0.002f;

            float multiplier = Mathf.Max(0.25f, 1f - levelBonus - agilityBonus);
            // Weapon cleanliness penalty: dirty weapons fire slower.
            if (_hasGun && _weaponCleanliness < 50)
            {
                multiplier *= 1.0f + (50 - _weaponCleanliness) * 0.01f;
            }
            return Mathf.Clamp(baseTurnInterval * multiplier, 0.25f, 5f);
        }

        // ─── Foreground / background gating ───────────────────────────────────
        private bool IsWanderingActiveState()
        {
            if (!ServiceLocator.TryGet<IGameManager>(out var gm)) return true;
            return gm.CurrentState == GameState.Wandering;
        }

        // ─── ICombatCommandHandler — scene-level commands ─────────────────────
        // Handles loot/eat/drink/check_magazine/clean_weapon/scout. Falls through
        // to CombatSystem's handler for combat-level commands (force_win, add_xp, etc.).
        public CommandResult HandleCommand(string verb, string[] args)
        {
            switch (verb)
            {
                case "return":         return CmdReturn();
                case "distance":       return CmdDistance();
                case "autoloot":       return CmdAutoLoot(args);
                case "backpack":       return CmdBackpack();
                case "loot":           return CmdLoot();
                case "use_bandage":    return CmdUseBandage();
                case "eat":            return CmdEat(args);
                case "drink":          return CmdDrink(args);
                case "check_magazine": return CmdCheckMagazine();
                case "clean_weapon":   return CmdCleanWeapon();
                case "scout":          return CmdScout();

                // Defer to inner combat handler for the rest.
                default:
                    return ((ICombatCommandHandler)Combat).HandleCommand(verb, args);
            }
        }

        private CommandResult CmdReturn()
        {
            if (!IsRunning) return CommandResult.Err("no active run");
            ReturnToBase();
            return CommandResult.Ok("Returned to base. Backpack transferred.");
        }

        private CommandResult CmdDistance()
        {
            return CommandResult.Ok($"Distance traveled: {GetDistanceMeters()}m \u00b7 {_encountersResolved}/{encounterLimit} encounters.");
        }

        private CommandResult CmdAutoLoot(string[] args)
        {
            if (args.Length > 0)
            {
                if (args[0] == "on")  autoLootEnabled = true;
                else if (args[0] == "off") autoLootEnabled = false;
            }
            else autoLootEnabled = !autoLootEnabled;
            return CommandResult.Ok($"Auto-loot: {(autoLootEnabled ? "ON" : "OFF")}");
        }

        private CommandResult CmdBackpack()
        {
            if (_backpack == null) return CommandResult.Err("no backpack service bound");
            int items = 0;
            foreach (var kv in _backpack.Contents) items += kv.Value;
            return CommandResult.Ok($"Backpack: {_backpack.CurrentWeight:F1}/{_backpack.WeightCap:F1}kg \u00b7 {items} items \u00b7 {_backpack.Contents.Count} stacks");
        }

        private CommandResult CmdLoot()
        {
            // Loot is auto-collected in passive mode; this exposes the inventory count.
            if (_inventory == null) return CommandResult.Err("inventory not bound");
            return CommandResult.Ok($"Auto-loot active. {_kills} kills this run. Inventory updated in real time.");
        }

        private CommandResult CmdUseBandage() => TryUseBandage()
            ? CommandResult.Ok($"Bandage applied. +{bandageHealAmount} HP.")
            : CommandResult.Err("no bandage available");

        private bool TryUseBandage()
        {
            if (_inventory == null || Combat == null) return false;
            if (!_inventory.HasItem(bandageItemId)) return false;
            if (!_inventory.Consume(bandageItemId, 1)) return false;

            // Heal via set_hp-equivalent path (CombatSystem doesn't expose Heal directly).
            int newHp = Mathf.Min(Combat.SurvivorMaxHp, Combat.SurvivorHp + bandageHealAmount);
            Combat.HandleCommand("set_hp", new[] { newHp.ToString() });
            OnSurvivorHpChanged?.Invoke(newHp);
            return true;
        }

        private CommandResult CmdEat(string[] args)
        {
            string item = args.Length > 0 ? args[0] : "ration";
            if (_inventory == null) return CommandResult.Err("inventory not bound");
            if (!_inventory.Consume(item, 1)) return CommandResult.Err($"no {item} in inventory");
            return CommandResult.Ok($"Consumed {item}. +stamina (applied next encounter).");
        }

        private CommandResult CmdDrink(string[] args)
        {
            string item = args.Length > 0 ? args[0] : "water";
            if (_inventory == null) return CommandResult.Err("inventory not bound");
            if (!_inventory.Consume(item, 1)) return CommandResult.Err($"no {item} in inventory");
            return CommandResult.Ok($"Drank {item}. +stamina.");
        }

        private CommandResult CmdCheckMagazine()
        {
            if (!_hasGun) return CommandResult.Err("no firearm equipped");
            return CommandResult.Ok($"Magazine: {_ammoInMag} rounds loaded.");
        }

        private CommandResult CmdCleanWeapon()
        {
            if (!_hasGun && !_hasMeleeWeapon) return CommandResult.Err("no weapon equipped");
            int before = _weaponCleanliness;
            _weaponCleanliness = 100;
            return CommandResult.Ok($"Weapon cleaned ({before}% → 100%). Turn interval restored.");
        }

        private CommandResult CmdScout()
        {
            int level = ActiveSurvivor?.Level.Level ?? 1;
            var roll = UnityEngine.Random.value;
            string report = roll < 0.4f ? "Two undead ahead, low threat."
                          : roll < 0.7f ? "Loot cache spotted near a wrecked vehicle."
                          : roll < 0.9f ? $"A {(_catalogs?.ZombieCatalog?.FilterByTier(ZombieTier.Heavy).Count > 0 ? "Heavy Brute" : "patrol")} 60m ahead — avoid or engage."
                                        : "Anomaly node detected — RMAT opportunity.";
            Combat?.Log.Append($"[scout] {report}", LogChannel.System);
            return CommandResult.Ok(report);
        }
    }
}
