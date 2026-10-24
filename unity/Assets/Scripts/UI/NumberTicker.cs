// Assets/Scripts/UI/NumberTicker.cs
using TMPro;
using UnityEngine;
using ZedIdler.Services;

namespace ZedIdler.UI
{
    /// <summary>
    /// Helper that animates a TMP_Text counting from its current value to a new
    /// target value over a brief duration. Drop on any score / credits /
    /// reputation / HP label and call <see cref="SetValue"/>.
    /// </summary>
    [DisallowMultipleComponent]
    [RequireComponent(typeof(TMP_Text))]
    public sealed class NumberTicker : MonoBehaviour
    {
        [SerializeField, Range(0.05f, 2f)] private float duration = 0.5f;
        [SerializeField] private string prefix = "";
        [SerializeField] private string suffix = "";

        private TMP_Text _label;
        private IUIAnimationService _anim;
        private int _currentValue;

        private void Awake() { _label = GetComponent<TMP_Text>(); }
        private void Start() { ServiceLocator.TryGet(out _anim); }

        public int CurrentValue => _currentValue;

        public void SetValueImmediate(int v)
        {
            _currentValue = v;
            if (_label != null) _label.text = $"{prefix}{v}{suffix}";
        }

        public void SetValue(int v)
        {
            if (v == _currentValue) return;
            _anim?.NumberTick(_label, _currentValue, v, duration, prefix, suffix);
            _currentValue = v;
        }
    }
}
