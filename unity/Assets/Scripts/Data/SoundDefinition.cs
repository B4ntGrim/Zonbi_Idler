// Assets/Scripts/Data/SoundDefinition.cs
using System;
using UnityEngine;
using UnityEngine.Audio;

namespace ZedIdler.Data
{
    /// <summary>
    /// Static description of a single sound effect. Combined into a
    /// <see cref="SoundBank"/> when multiple variations of the same event exist.
    /// </summary>
    [CreateAssetMenu(menuName = "ZedIdler/Sound Definition", fileName = "Sound_New", order = 120)]
    public sealed class SoundDefinition : ScriptableObject
    {
        [Header("Identity")]
        [SerializeField] private string soundId;
        [SerializeField] private string displayName;
        [SerializeField] private AudioClip clip; // may be null = silent placeholder

        [Header("Bus")]
        [SerializeField] private AudioBus bus = AudioBus.SfxCombat;

        [Header("Playback")]
        [SerializeField, Range(0f, 1f)] private float baseVolume = 1f;
        [SerializeField, Range(0.1f, 3f)] private float pitchMin = 1f;
        [SerializeField, Range(0.1f, 3f)] private float pitchMax = 1f;
        [SerializeField, Range(0, 32)] private int maxSimultaneous = 4;

        [Header("Ducking")]
        [Tooltip("Briefly lower Music bus when this plays.")]
        [SerializeField] private bool duckMusic = false;
        [SerializeField, Range(0f, 1f)] private float duckAmount = 0.4f;
        [SerializeField, Range(0.1f, 3f)] private float duckHoldSeconds = 0.5f;

        public string     SoundId         => soundId;
        public string     DisplayName     => displayName;
        public AudioClip  Clip            => clip;
        public AudioBus   Bus             => bus;
        public float      BaseVolume      => baseVolume;
        public float      PitchMin        => pitchMin;
        public float      PitchMax        => pitchMax;
        public int        MaxSimultaneous => maxSimultaneous;
        public bool       DuckMusic       => duckMusic;
        public float      DuckAmount      => duckAmount;
        public float      DuckHoldSeconds => duckHoldSeconds;
    }

    /// <summary>
    /// Finer-grained mixer bus enum. Each maps to an <see cref="AudioMixerGroup"/>
    /// at runtime via <see cref="ZedIdler.Services.AudioService"/>'s inspector wiring.
    /// </summary>
    public enum AudioBus
    {
        Master     = 0,
        Music      = 1,
        Ambient    = 2,
        SfxCombat  = 3,
        SfxLoot    = 4,
        UiClick    = 5,
        Notification = 6,
        Voice      = 7
    }
}
