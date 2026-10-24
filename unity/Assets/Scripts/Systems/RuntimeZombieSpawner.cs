// Assets/Scripts/Systems/RuntimeZombieSpawner.cs
using System;
using UnityEngine;
using ZedIdler.Data;
using ZedIdler.Services;

namespace ZedIdler.Systems
{
    /// <summary>
    /// Higher-level spawn coordinator that turns the combat spec's spawn rules
    /// (section 5) into concrete <see cref="ZombieDefinition"/> rolls.
    /// Sits between <see cref="WanderingSceneController"/> and
    /// <see cref="ICatalogService.RollZombie"/>, applying time-of-day, weather,
    /// noise, and horde event modifiers.
    /// </summary>
    /// <remarks>
    /// Pure C# class. Resolves catalog + time + traversal lazily so it can be
    /// constructed at any point in the boot sequence.
    ///
    /// Rule sources (spec section 5):
    /// • Day: Standard / Infected favored.
    /// • Night: Fast / Elite spawn rate raised.
    /// • Fog: Heavy / HordeLeader boost.
    /// • Storm: all spawn weights ×1.25.
    /// • Player Level > 50: Elite / HordeLeader become eligible.
    /// • Noise triggered: spawn-rate +40% for N turns.
    /// </remarks>
    public sealed class RuntimeZombieSpawner
    {
        private readonly ICatalogService _catalogs;
        private readonly ITimeService    _time;
        private readonly ITraversalContext _traversal;
        private readonly System.Random _rng;

        private WeatherType _currentWeather = WeatherType.Clear;
        private int _noiseTurnsRemaining;
        private int _hordeEventTurnsRemaining;

        public WeatherType CurrentWeather
        {
            get => _currentWeather;
            set => _currentWeather = value;
        }

        public bool IsNoiseAlertActive => _noiseTurnsRemaining > 0;
        public bool IsHordeEventActive => _hordeEventTurnsRemaining > 0;

        public event Action<ZombieDefinition> OnZombieSpawned;
        public event Action OnHordeEventStarted;
        public event Action OnHordeEventEnded;

        public RuntimeZombieSpawner(ICatalogService catalogs, ITimeService time = null,
                                    ITraversalContext traversal = null, int? rngSeed = null)
        {
            _catalogs = catalogs ?? throw new ArgumentNullException(nameof(catalogs));
            _time      = time;
            _traversal = traversal;
            _rng = rngSeed.HasValue ? new System.Random(rngSeed.Value) : new System.Random();
        }

        // ─── Public spawn API ─────────────────────────────────────────────────
        /// <summary>
        /// Roll a zombie definition using the current biome + time-of-day +
        /// player level + active modifiers. Returns null if no match.
        /// </summary>
        public ZombieDefinition SpawnNext(int playerLevel)
        {
            if (_catalogs.ZombieCatalog == null) return null;
            ApplyTurnDecay();

            var biome = _traversal?.CurrentBiome ?? BiomeTag.Suburbia;
            var time  = _time?.TimeOfDay        ?? TimeOfDay.Any;

            // Storm boosts global multiplier; restore after roll.
            float savedMult = _catalogs.ZombieCatalog.GlobalSpawnMultiplier;
            try
            {
                float mult = savedMult;
                if (_currentWeather == WeatherType.Storm)    mult *= 1.25f;
                if (_noiseTurnsRemaining > 0)                 mult *= 1.40f;
                if (_hordeEventTurnsRemaining > 0)            mult *= 1.80f;
                _catalogs.ZombieCatalog.GlobalSpawnMultiplier = mult;

                var def = _catalogs.RollZombie(biome, time, playerLevel);
                if (def != null) OnZombieSpawned?.Invoke(def);
                return def;
            }
            finally
            {
                _catalogs.ZombieCatalog.GlobalSpawnMultiplier = savedMult;
            }
        }

        /// <summary>
        /// Force-roll a specific tier (used for horde-event waves and the
        /// executable <c>spawn</c> command's tier path).
        /// </summary>
        public ZombieDefinition SpawnTier(ZombieTier tier)
        {
            if (_catalogs.ZombieCatalog == null) return null;
            var pool = _catalogs.ZombieCatalog.FilterByTier(tier);
            if (pool.Count == 0) return null;
            var def = pool[_rng.Next(pool.Count)];
            OnZombieSpawned?.Invoke(def);
            return def;
        }

        // ─── Trigger hooks ────────────────────────────────────────────────────
        /// <summary>Combat detected loud noise (gunshot, etc.). Boost spawns for N turns.</summary>
        public void TriggerNoise(int turns = 3) => _noiseTurnsRemaining = Mathf.Max(_noiseTurnsRemaining, turns);

        /// <summary>Begin a horde event. Spawn rate +80% and Heavy/HordeLeader gain weight.</summary>
        public void StartHordeEvent(int turns)
        {
            _hordeEventTurnsRemaining = Mathf.Max(1, turns);
            OnHordeEventStarted?.Invoke();
        }

        /// <summary>Force-end the current horde event.</summary>
        public void EndHordeEvent()
        {
            if (_hordeEventTurnsRemaining == 0) return;
            _hordeEventTurnsRemaining = 0;
            OnHordeEventEnded?.Invoke();
        }

        private void ApplyTurnDecay()
        {
            if (_noiseTurnsRemaining > 0) _noiseTurnsRemaining--;
            if (_hordeEventTurnsRemaining > 0)
            {
                _hordeEventTurnsRemaining--;
                if (_hordeEventTurnsRemaining == 0) OnHordeEventEnded?.Invoke();
            }
        }
    }

    /// <summary>
    /// Coarse weather state used by the spawner. Phase 2 weather service will
    /// drive transitions; for now it's set manually.
    /// </summary>
    public enum WeatherType
    {
        Clear  = 0,
        Rain   = 1,
        Fog    = 2,
        Storm  = 3
    }
}
