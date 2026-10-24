// Assets/Scripts/UI/UIAnimator.cs
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using ZedIdler.Services;

namespace ZedIdler.UI
{
    /// <summary>
    /// Drop-in component for any Button. Adds hover-grow + press-shrink + click-pop
    /// effects via <see cref="IUIAnimationService"/>. Honors reduced-motion.
    /// </summary>
    [DisallowMultipleComponent]
    [RequireComponent(typeof(RectTransform))]
    public sealed class UIAnimator : MonoBehaviour,
        IPointerEnterHandler, IPointerExitHandler,
        IPointerDownHandler, IPointerUpHandler,
        IPointerClickHandler
    {
        [SerializeField, Range(1f, 1.3f)] private float hoverScale = 1.05f;
        [SerializeField, Range(0.85f, 1f)] private float pressScale = 0.95f;
        [SerializeField, Range(0.05f, 0.5f)] private float duration = 0.12f;
        [SerializeField] private bool popOnClick = true;
        [SerializeField] private string clickSoundId = "ui_click";

        private IUIAnimationService _anim;
        private IAudioService _audio;
        private Vector3 _baseScale;

        private void Awake() { _baseScale = transform.localScale; }
        private void Start()
        {
            ServiceLocator.TryGet(out _anim);
            ServiceLocator.TryGet(out _audio);
        }

        public void OnPointerEnter(PointerEventData _) { SetScale(hoverScale); }
        public void OnPointerExit(PointerEventData _)  { SetScale(1f); }
        public void OnPointerDown(PointerEventData _)  { SetScale(pressScale); }
        public void OnPointerUp(PointerEventData _)    { SetScale(hoverScale); }

        public void OnPointerClick(PointerEventData _)
        {
            if (popOnClick) _anim?.Pop(transform, 1.12f, 0.18f);
            if (!string.IsNullOrEmpty(clickSoundId)) _audio?.Play(clickSoundId);
        }

        private void SetScale(float mult)
        {
            if (_anim?.ReducedMotion ?? false) { transform.localScale = _baseScale; return; }
            // Tween to target scale via a temporary handle: use Pop-style coroutine-less LerpUnclamped path.
            // Lightweight inline since this fires every hover.
            StopAllCoroutines();
            StartCoroutine(ScaleTo(_baseScale * mult, duration));
        }

        private System.Collections.IEnumerator ScaleTo(Vector3 target, float secs)
        {
            Vector3 start = transform.localScale;
            float t = 0f;
            while (t < secs)
            {
                transform.localScale = Vector3.Lerp(start, target, t / secs);
                t += Time.unscaledDeltaTime;
                yield return null;
            }
            transform.localScale = target;
        }
    }
}
