// Assets/Scripts/UI/SquadHpBarStripView.cs
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;
using ZedIdler.Services;
using ZedIdler.Systems;

namespace ZedIdler.UI
{
    /// <summary>
    /// Horizontal strip of HP bars, one per squad member. Subscribes to
    /// <see cref="WanderingSceneController"/> events to refresh the active
    /// squad. Designer-wired prefab for each bar.
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class SquadHpBarStripView : MonoBehaviour
    {
        [SerializeField] private RectTransform barContainer;
        [SerializeField] private SquadHpBarView barPrefab;

        private WanderingSceneController _controller;
        private readonly Dictionary<string, SquadHpBarView> _bars = new Dictionary<string, SquadHpBarView>();

        private void OnEnable()
        {
            _controller = ServiceLocator.Get<WanderingSceneController>();
            if (_controller == null) { enabled = false; return; }
            _controller.OnRunStarted += _ => Rebuild();
            _controller.OnRunPaused  += () => Rebuild();
            Rebuild();
        }

        private void Update()
        {
            if (_controller?.SquadCombat == null) return;
            foreach (var kv in _bars)
            {
                int hp = _controller.SquadCombat.GetSurvivorHp(kv.Key);
                int max = _controller.SquadCombat.GetSurvivorMaxHp(kv.Key);
                kv.Value.SetHp(hp, max, _controller.SquadCombat.IsSurvivorDown(kv.Key));
            }
        }

        private void Rebuild()
        {
            if (barContainer == null || barPrefab == null) return;
            foreach (Transform t in barContainer) Destroy(t.gameObject);
            _bars.Clear();
            if (_controller.ActiveSquad == null) return;
            foreach (var s in _controller.ActiveSquad)
            {
                if (s == null) continue;
                var bar = Instantiate(barPrefab, barContainer);
                bar.Bind(s.DisplayName);
                _bars[s.Id] = bar;
            }
        }
    }

    /// <summary>Single HP bar in the squad strip.</summary>
    public sealed class SquadHpBarView : MonoBehaviour
    {
        [SerializeField] private TMP_Text nameText;
        [SerializeField] private TMP_Text hpText;
        [SerializeField] private Slider hpSlider;
        [SerializeField] private GameObject downedOverlay;

        public void Bind(string name)
        {
            if (nameText != null) nameText.text = name;
            if (downedOverlay != null) downedOverlay.SetActive(false);
        }

        public void SetHp(int hp, int max, bool isDown)
        {
            if (hpSlider != null) { hpSlider.maxValue = max; hpSlider.value = hp; }
            if (hpText != null)   hpText.text = $"{hp}/{max}";
            if (downedOverlay != null) downedOverlay.SetActive(isDown);
        }
    }
}
