// Assets/Scripts/UI/SplashRotator.cs
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

/// <summary>
/// Rotates full-screen background splash art with crossfades and slow Ken Burns motion.
/// See splash_art_rotation_spec.md.
/// </summary>
public class SplashRotator : MonoBehaviour
{
    [System.Serializable]
    public class SplashEntry
    {
        public string id;              // e.g. "SPL-01"
        public Texture2D standard;
        public Texture2D mild;         // Reduced-gore variant; falls back to standard if null
    }

    [Header("Layers (stacked, full-screen)")]
    [SerializeField] private RawImage layerA;
    [SerializeField] private RawImage layerB;

    [Header("Art Set")]
    [SerializeField] private List<SplashEntry> entries = new List<SplashEntry>();

    [Header("Timing (seconds)")]
    [SerializeField] private float minInterval = 25f;
    [SerializeField] private float maxInterval = 30f;
    [SerializeField] private float crossfadeDuration = 2f;

    [Header("Ken Burns")]
    [SerializeField] private float startScale = 1.0f;
    [SerializeField] private float endScale = 1.08f;
    [SerializeField, Range(0f, 0.1f)] private float maxPanFraction = 0.03f;

    [Header("Settings")]
    [SerializeField] private bool reducedGore = false;

    private CanvasGroup groupA, groupB;
    private RawImage front, back;
    private readonly List<int> bag = new List<int>();
    private int lastIndex = -1;
    private bool suspended;

    private void Awake()
    {
        groupA = GetOrAddGroup(layerA);
        groupB = GetOrAddGroup(layerB);
        front = layerA;
        back = layerB;
        groupA.alpha = 1f;
        groupB.alpha = 0f;
    }

    private void Start()
    {
        if (entries.Count == 0) { Debug.LogWarning("SplashRotator: no entries assigned."); return; }
        StartCoroutine(RotateLoop());
    }

    /// <summary>Call from menu/UI code when a full-screen panel covers the background.</summary>
    public void SetSuspended(bool value) => suspended = value;

    /// <summary>Call from the settings service when the player toggles Reduced Gore.</summary>
    public void SetReducedGore(bool value) => reducedGore = value;

    private void OnApplicationPause(bool paused) => suspended = paused;

    private IEnumerator RotateLoop()
    {
        ShowOn(front, NextIndex());
        while (true)
        {
            float interval = Random.Range(minInterval, maxInterval);
            Vector2 panFrom = RandomPan();
            Vector2 panTo = RandomPan();
            float elapsed = 0f;
            bool nextQueued = false;
            int nextIndex = -1;

            while (elapsed < interval)
            {
                if (!suspended)
                {
                    elapsed += Time.unscaledDeltaTime;
                    ApplyKenBurns(front.rectTransform, elapsed / (interval + crossfadeDuration), panFrom, panTo);

                    // Queue the next image onto the hidden layer ahead of the crossfade.
                    if (!nextQueued && elapsed > interval - crossfadeDuration)
                    {
                        nextIndex = NextIndex();
                        ShowOn(back, nextIndex);
                        ResetTransform(back.rectTransform);
                        nextQueued = true;
                    }
                }
                yield return null;
            }

            if (!nextQueued) { ShowOn(back, NextIndex()); ResetTransform(back.rectTransform); }

            // Crossfade: front keeps drifting while back fades in.
            float t = 0f;
            CanvasGroup fg = GroupOf(front), bg = GroupOf(back);
            while (t < crossfadeDuration)
            {
                if (!suspended)
                {
                    t += Time.unscaledDeltaTime;
                    float k = Mathf.SmoothStep(0f, 1f, t / crossfadeDuration);
                    bg.alpha = k;
                    fg.alpha = 1f - k;
                    ApplyKenBurns(front.rectTransform, (interval + t) / (interval + crossfadeDuration), panFrom, panTo);
                }
                yield return null;
            }
            bg.alpha = 1f;
            fg.alpha = 0f;

            // Swap roles.
            (front, back) = (back, front);
            front.transform.SetAsLastSibling();
        }
    }

    private void ShowOn(RawImage target, int index)
    {
        SplashEntry e = entries[index];
        target.texture = (reducedGore && e.mild != null) ? e.mild : e.standard;
    }

    // Shuffle bag: every image shows once before any repeat, and never back-to-back across refills.
    private int NextIndex()
    {
        if (bag.Count == 0)
        {
            for (int i = 0; i < entries.Count; i++) bag.Add(i);
            for (int i = bag.Count - 1; i > 0; i--)
            {
                int j = Random.Range(0, i + 1);
                (bag[i], bag[j]) = (bag[j], bag[i]);
            }
            if (bag.Count > 1 && bag[0] == lastIndex)
                (bag[0], bag[bag.Count - 1]) = (bag[bag.Count - 1], bag[0]);
        }
        int next = bag[0];
        bag.RemoveAt(0);
        lastIndex = next;
        return next;
    }

    private void ApplyKenBurns(RectTransform rt, float progress, Vector2 from, Vector2 to)
    {
        progress = Mathf.Clamp01(progress);
        float s = Mathf.Lerp(startScale, endScale, progress);
        rt.localScale = new Vector3(s, s, 1f);
        Vector2 size = rt.rect.size;
        Vector2 pan = Vector2.Lerp(from, to, progress);
        rt.anchoredPosition = new Vector2(pan.x * size.x, pan.y * size.y);
    }

    private void ResetTransform(RectTransform rt)
    {
        rt.localScale = new Vector3(startScale, startScale, 1f);
        rt.anchoredPosition = Vector2.zero;
    }

    private Vector2 RandomPan() =>
        new Vector2(Random.Range(-maxPanFraction, maxPanFraction), Random.Range(-maxPanFraction, maxPanFraction));

    private CanvasGroup GroupOf(RawImage img) => img == layerA ? groupA : groupB;

    private static CanvasGroup GetOrAddGroup(RawImage img)
    {
        var g = img.GetComponent<CanvasGroup>();
        return g != null ? g : img.gameObject.AddComponent<CanvasGroup>();
    }
}
