// Assets/Scripts/UI/AudioSettingsView.cs
using TMPro;
using UnityEngine;
using UnityEngine.UI;
using ZedIdler.Data;
using ZedIdler.Services;

namespace ZedIdler.UI
{
    /// <summary>
    /// Designer-wired settings panel exposing one slider per <see cref="AudioBus"/>.
    /// Reads/writes via <see cref="IAudioService.SetBusVolume"/>; persisted to
    /// PlayerPrefs by the service.
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class AudioSettingsView : MonoBehaviour
    {
        [Header("Sliders (one per bus)")]
        [SerializeField] private BusSliderRow master;
        [SerializeField] private BusSliderRow music;
        [SerializeField] private BusSliderRow ambient;
        [SerializeField] private BusSliderRow combat;
        [SerializeField] private BusSliderRow loot;
        [SerializeField] private BusSliderRow ui;
        [SerializeField] private BusSliderRow notification;
        [SerializeField] private BusSliderRow voice;

        [Header("Diagnostics")]
        [SerializeField] private TMP_Text lastPlayedText;

        private IAudioService _audio;

        private void OnEnable()
        {
            ServiceLocator.TryGet(out _audio);
            if (_audio == null) { enabled = false; return; }
            Hook(master,       AudioBus.Master);
            Hook(music,        AudioBus.Music);
            Hook(ambient,      AudioBus.Ambient);
            Hook(combat,       AudioBus.SfxCombat);
            Hook(loot,         AudioBus.SfxLoot);
            Hook(ui,           AudioBus.UiClick);
            Hook(notification, AudioBus.Notification);
            Hook(voice,        AudioBus.Voice);

            _audio.OnSoundPlayed += HandleSoundPlayed;
        }

        private void OnDisable()
        {
            if (_audio != null) _audio.OnSoundPlayed -= HandleSoundPlayed;
        }

        private void Hook(BusSliderRow row, AudioBus bus)
        {
            if (row == null || row.slider == null) return;
            row.slider.minValue = 0f;
            row.slider.maxValue = 1f;
            row.slider.value = _audio.GetBusVolume(bus);
            row.slider.onValueChanged.AddListener(v =>
            {
                _audio.SetBusVolume(bus, v);
                if (row.valueLabel != null) row.valueLabel.text = $"{(int)(v * 100)}%";
                if (row.slider.handleRect != null
                    && ZedIdler.Services.ServiceLocator.TryGet<ZedIdler.Services.IUIAnimationService>(out var anim))
                {
                    anim.Pop(row.slider.handleRect, 1.18f, 0.18f);
                }
            });
            if (row.label != null) row.label.text = bus.ToString();
            if (row.valueLabel != null) row.valueLabel.text = $"{(int)(row.slider.value * 100)}%";
            if (row.testButton != null) row.testButton.onClick.AddListener(() => _audio.Play("ui_click"));
        }

        private void HandleSoundPlayed(string id)
        {
            if (lastPlayedText != null) lastPlayedText.text = $"Last: {id}";
        }
    }

    [System.Serializable]
    public sealed class BusSliderRow
    {
        public TMP_Text label;
        public Slider slider;
        public TMP_Text valueLabel;
        public Button testButton;
    }
}
