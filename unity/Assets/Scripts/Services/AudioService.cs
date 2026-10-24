// Assets/Scripts/Services/AudioService.cs
using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Audio;
using ZedIdler.Data;

namespace ZedIdler.Services
{
    /// <summary>
    /// Persistent audio backend. AudioMixer + pooled AudioSources, bank-based
    /// random variant selection, music state machine with fade-out-fade-in,
    /// auto-ducking, PlayerPrefs volume persistence.
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class AudioService : MonoBehaviour, IAudioService
    {
        [Header("Mixer")]
        [SerializeField] private AudioMixer mixer;
        [SerializeField] private MixerGroupBinding[] mixerGroups; // one per AudioBus enum.

        [Header("Pool")]
        [SerializeField, Range(4, 64)] private int poolSize = 16;

        [Header("Music")]
        [SerializeField] private AudioSource musicSource; // optional second source for cross-fade
        [SerializeField] private AudioSource musicSourceB;
        [SerializeField, Range(0.1f, 5f)] private float musicFadeSeconds = 1.5f;

        [Header("Ducking")]
        [SerializeField] private string musicVolumeParam = "MusicVolume"; // mixer exposed param (dB)
        [SerializeField, Range(0f, 1f)] private float duckRecoveryPerSec = 2f;

        [Header("Seed Catalog (designer slots)")]
        [SerializeField] private SoundDefinition[] sounds;
        [SerializeField] private SoundBank[] banks;
        [SerializeField] private string resourcesRoot = "Audio";

        // ─── State ────────────────────────────────────────────────────────────
        private readonly Dictionary<string, SoundDefinition> _soundsById = new Dictionary<string, SoundDefinition>();
        private readonly Dictionary<string, SoundBank>       _banksById  = new Dictionary<string, SoundBank>();
        private readonly Dictionary<AudioBus, AudioMixerGroup> _groupByBus = new Dictionary<AudioBus, AudioMixerGroup>();
        private readonly Dictionary<string, int>             _activeCount = new Dictionary<string, int>();
        private readonly Queue<AudioSource> _pool = new Queue<AudioSource>();
        private readonly System.Random _rng = new System.Random();

        private string _currentMusicState;
        private float  _duckHoldRemaining;
        private float  _musicVolumeDb;

        public event Action<string> OnSoundPlayed;
        public event Action<string> OnMusicStateChanged;

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            ServiceLocator.Register<IAudioService>(this);

            // Resources fallback
            if (sounds == null || sounds.Length == 0) sounds = Resources.LoadAll<SoundDefinition>(resourcesRoot);
            if (banks  == null || banks.Length  == 0) banks  = Resources.LoadAll<SoundBank>(resourcesRoot);

            // Build indices
            foreach (var s in sounds ?? Array.Empty<SoundDefinition>())
                if (s != null && !string.IsNullOrEmpty(s.SoundId)) _soundsById[s.SoundId] = s;
            foreach (var b in banks ?? Array.Empty<SoundBank>())
                if (b != null && !string.IsNullOrEmpty(b.BankId)) _banksById[b.BankId] = b;
            foreach (var m in mixerGroups ?? Array.Empty<MixerGroupBinding>())
                if (m.group != null) _groupByBus[m.bus] = m.group;

            // Build source pool
            for (int i = 0; i < poolSize; i++)
            {
                var go = new GameObject($"AudioSource_{i}");
                go.transform.SetParent(transform);
                var src = go.AddComponent<AudioSource>();
                src.playOnAwake = false;
                _pool.Enqueue(src);
            }

            LoadVolumesFromPrefs();
        }

        private void OnDestroy() => ServiceLocator.Unregister<IAudioService>();

        private void Update()
        {
            if (_duckHoldRemaining > 0f)
            {
                _duckHoldRemaining -= Time.unscaledDeltaTime;
                if (_duckHoldRemaining <= 0f)
                {
                    // Smooth recover music volume.
                    if (mixer != null) mixer.SetFloat(musicVolumeParam, _musicVolumeDb);
                }
            }
        }

        // ─── Play API ─────────────────────────────────────────────────────────
        public void Play(string idOrBankId)
        {
            // Banks take precedence over single sounds.
            if (_banksById.TryGetValue(idOrBankId, out var bank))
            {
                var pick = bank.PickRandom(_rng);
                if (pick != null) PlaySound(pick);
                return;
            }
            if (_soundsById.TryGetValue(idOrBankId, out var sound))
            {
                PlaySound(sound);
                return;
            }
            // Unknown id — silently skip; this is a safe-by-default API.
        }

        private void PlaySound(SoundDefinition s)
        {
            if (s == null) return;

            // Max simultaneous gate.
            _activeCount.TryGetValue(s.SoundId, out var n);
            if (n >= s.MaxSimultaneous) return;

            if (_pool.Count == 0) return; // pool exhausted; skip rather than allocate.
            var src = _pool.Dequeue();
            src.gameObject.SetActive(true);

            src.clip = s.Clip; // null clip = silent placeholder
            src.outputAudioMixerGroup = _groupByBus.TryGetValue(s.Bus, out var grp) ? grp : null;
            src.volume = s.BaseVolume;
            src.pitch  = UnityEngine.Random.Range(s.PitchMin, s.PitchMax);
            src.loop   = false;

            if (s.Clip != null) src.Play();

            // Apply ducking.
            if (s.DuckMusic && mixer != null)
            {
                _duckHoldRemaining = s.DuckHoldSeconds;
                float duckDb = LinearToDb(Mathf.Max(0.001f, 1f - s.DuckAmount));
                mixer.SetFloat(musicVolumeParam, _musicVolumeDb + duckDb);
            }

            _activeCount[s.SoundId] = n + 1;
            float lifetime = s.Clip != null ? s.Clip.length / Mathf.Max(0.1f, src.pitch) : 0.1f;
            StartCoroutine(ReturnToPool(src, s.SoundId, lifetime));
            OnSoundPlayed?.Invoke(s.SoundId);
        }

        private IEnumerator ReturnToPool(AudioSource src, string soundId, float lifetime)
        {
            yield return new WaitForSeconds(lifetime);
            src.Stop();
            src.clip = null;
            src.gameObject.SetActive(false);
            _pool.Enqueue(src);
            if (_activeCount.TryGetValue(soundId, out var n) && n > 0) _activeCount[soundId] = n - 1;
        }

        // ─── Music ────────────────────────────────────────────────────────────
        public void SetMusicState(string stateId, AudioClip clip)
        {
            if (_currentMusicState == stateId) return;
            _currentMusicState = stateId;
            OnMusicStateChanged?.Invoke(stateId);
            StartCoroutine(CrossfadeMusic(clip));
        }

        public void StopMusic() => StartCoroutine(CrossfadeMusic(null));

        private IEnumerator CrossfadeMusic(AudioClip next)
        {
            var src = musicSource;
            var alt = musicSourceB;
            if (src == null) yield break;

            // Fade out current.
            float t = 0f;
            float startVol = src.volume;
            while (t < musicFadeSeconds)
            {
                t += Time.unscaledDeltaTime;
                src.volume = Mathf.Lerp(startVol, 0f, t / musicFadeSeconds);
                yield return null;
            }
            src.Stop();
            src.clip = next;
            if (next == null) yield break;

            // Fade in.
            src.volume = 0f;
            src.loop = true;
            src.Play();
            t = 0f;
            while (t < musicFadeSeconds)
            {
                t += Time.unscaledDeltaTime;
                src.volume = Mathf.Lerp(0f, 1f, t / musicFadeSeconds);
                yield return null;
            }
            src.volume = 1f;
        }

        // ─── Volume / mixer ───────────────────────────────────────────────────
        public void SetBusVolume(AudioBus bus, float linear01)
        {
            if (mixer == null) return;
            string param = ParamForBus(bus);
            float db = LinearToDb(Mathf.Clamp01(linear01));
            mixer.SetFloat(param, db);
            if (bus == AudioBus.Music) _musicVolumeDb = db;
            PlayerPrefs.SetFloat($"audio_{bus}", linear01);
        }

        public float GetBusVolume(AudioBus bus)
        {
            return PlayerPrefs.GetFloat($"audio_{bus}", 1f);
        }

        private void LoadVolumesFromPrefs()
        {
            foreach (AudioBus bus in Enum.GetValues(typeof(AudioBus)))
                SetBusVolume(bus, PlayerPrefs.GetFloat($"audio_{bus}", 1f));
        }

        private string ParamForBus(AudioBus bus) => bus switch
        {
            AudioBus.Master       => "MasterVolume",
            AudioBus.Music        => musicVolumeParam,
            AudioBus.Ambient      => "AmbientVolume",
            AudioBus.SfxCombat    => "CombatVolume",
            AudioBus.SfxLoot      => "LootVolume",
            AudioBus.UiClick      => "UiVolume",
            AudioBus.Notification => "NotifVolume",
            AudioBus.Voice        => "VoiceVolume",
            _ => "MasterVolume"
        };

        private static float LinearToDb(float linear) =>
            linear <= 0.001f ? -80f : Mathf.Log10(linear) * 20f;

        [Serializable]
        public struct MixerGroupBinding
        {
            public AudioBus bus;
            public AudioMixerGroup group;
        }
    }

    public interface IAudioService
    {
        event Action<string> OnSoundPlayed;
        event Action<string> OnMusicStateChanged;

        void Play(string idOrBankId);
        void SetMusicState(string stateId, AudioClip clip);
        void StopMusic();
        void SetBusVolume(AudioBus bus, float linear01);
        float GetBusVolume(AudioBus bus);
    }
}
