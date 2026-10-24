// Assets/Scripts/UI/TutorialOverlayView.cs
using TMPro;
using UnityEngine;
using UnityEngine.UI;
using ZedIdler.Data;
using ZedIdler.Services;

namespace ZedIdler.UI
{
    /// <summary>
    /// Read-and-dismiss tutorial card overlay. Full-screen dim + centered card
    /// with title, body, illustration, progress dots, and Back / Next / Skip.
    /// Designer-wires the slots; subscribes to <see cref="ITutorialService"/>.
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class TutorialOverlayView : MonoBehaviour
    {
        [Header("Root")]
        [SerializeField] private GameObject overlayRoot;
        [SerializeField] private CanvasGroup canvasGroup;

        [Header("Card")]
        [SerializeField] private TMP_Text titleText;
        [SerializeField] private TMP_Text bodyText;
        [SerializeField] private Image illustration;
        [SerializeField] private TMP_Text progressText;

        [Header("Buttons")]
        [SerializeField] private Button backButton;
        [SerializeField] private Button nextButton;
        [SerializeField] private Button skipButton;
        [SerializeField] private TMP_Text nextButtonLabel;

        private ITutorialService _tutorial;
        private ILocalizationService _loc;
        private IUIAnimationService _anim;

        private void OnEnable()
        {
            ServiceLocator.TryGet(out _tutorial);
            ServiceLocator.TryGet(out _loc);
            ServiceLocator.TryGet(out _anim);
            if (_tutorial == null) { SetVisible(false); return; }

            _tutorial.OnStepShown     += HandleStepShown;
            _tutorial.OnTutorialStarted += HandleStarted;
            _tutorial.OnTutorialEnded += HandleEnded;

            if (backButton != null) backButton.onClick.AddListener(() => _tutorial.Previous());
            if (nextButton != null) nextButton.onClick.AddListener(() => _tutorial.Next());
            if (skipButton != null) skipButton.onClick.AddListener(() => _tutorial.Skip());

            SetVisible(_tutorial.IsActive);
            if (_tutorial.IsActive) HandleStepShown(_tutorial.Current, _tutorial.CurrentIndex, _tutorial.TotalSteps);
        }

        private void OnDisable()
        {
            if (_tutorial == null) return;
            _tutorial.OnStepShown     -= HandleStepShown;
            _tutorial.OnTutorialStarted -= HandleStarted;
            _tutorial.OnTutorialEnded -= HandleEnded;
        }

        private void HandleStarted() => SetVisible(true);
        private void HandleEnded(bool _) => SetVisible(false);

        private void HandleStepShown(TutorialStep step, int index, int total)
        {
            if (step == null) return;
            SetVisible(true);

            if (titleText != null)
                titleText.text = Localize(step.TitleKey, step.TitleFallback);
            if (bodyText != null)
                bodyText.text = Localize(step.BodyKey, step.BodyFallback);
            if (illustration != null)
            {
                illustration.sprite = step.Illustration;
                illustration.enabled = step.Illustration != null;
            }
            if (progressText != null)
                progressText.text = $"{index + 1} / {total}";

            if (backButton != null) backButton.interactable = index > 0;
            if (nextButtonLabel != null)
                nextButtonLabel.text = index >= total - 1
                    ? Localize("tutorial.finish", "Got it!")
                    : Localize("tutorial.next", "Next");

            // Pop the card for feedback.
            if (overlayRoot != null) _anim?.Pop(overlayRoot.transform, 1.04f, 0.18f);
        }

        private string Localize(string key, string fallback)
        {
            if (_loc != null && !string.IsNullOrEmpty(key))
            {
                var t = _loc.Get(key);
                if (!string.IsNullOrEmpty(t) && t != key) return t;
            }
            return string.IsNullOrEmpty(fallback) ? key : fallback;
        }

        private void SetVisible(bool visible)
        {
            if (overlayRoot != null) overlayRoot.SetActive(visible);
            if (canvasGroup != null)
            {
                canvasGroup.blocksRaycasts = visible;
                canvasGroup.interactable = visible;
                if (_anim != null && visible) _anim.Fade(canvasGroup, 0f, 1f, 0.2f);
                else canvasGroup.alpha = visible ? 1f : 0f;
            }
        }
    }
}
