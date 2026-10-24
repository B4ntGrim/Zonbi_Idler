// Assets/Scripts/UI/LocalizedText.cs
using TMPro;
using UnityEngine;
using ZedIdler.Services;

namespace ZedIdler.UI
{
    /// <summary>
    /// Auto-binds a TMP_Text to a localization key. Resolves on enable using
    /// the active locale (applied at launch). Drop on any static label and set
    /// the key; optional plural mode + format args.
    /// </summary>
    [DisallowMultipleComponent]
    [RequireComponent(typeof(TMP_Text))]
    public sealed class LocalizedText : MonoBehaviour
    {
        [SerializeField] private string key;
        [SerializeField] private bool isPlural;
        [SerializeField] private int pluralCount = 1;
        [Tooltip("If non-empty, used as fallback when the key is missing.")]
        [SerializeField] private string fallback;

        private TMP_Text _label;
        private ILocalizationService _loc;

        private void Awake() => _label = GetComponent<TMP_Text>();

        private void OnEnable()
        {
            ServiceLocator.TryGet(out _loc);
            Refresh();
        }

        public void SetKey(string newKey) { key = newKey; Refresh(); }
        public void SetPluralCount(int count) { pluralCount = count; if (isPlural) Refresh(); }

        public void Refresh()
        {
            if (_label == null) return;
            if (_loc == null) { if (!string.IsNullOrEmpty(fallback)) _label.text = fallback; return; }

            string result = isPlural ? _loc.GetPlural(key, pluralCount) : _loc.Get(key);
            // raw-key fallback → use designer fallback if provided
            if (result == key && !string.IsNullOrEmpty(fallback)) result = fallback;
            _label.text = result;
        }
    }
}
