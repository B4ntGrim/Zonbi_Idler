// Assets/Scripts/UI/ZoneCellView.cs
using System;
using TMPro;
using UnityEngine;
using UnityEngine.EventSystems;
using UnityEngine.UI;
using ZedIdler.Data;
using ZedIdler.Services;

namespace ZedIdler.UI
{
    /// <summary>
    /// One cell prefab on the satellite grid. Renders biome-tinted background
    /// with a noise overlay, threat stars, state badge, and lock icon. Click
    /// invokes a callback wired by <see cref="TraversalSceneView"/>.
    /// </summary>
    /// <remarks>
    /// Prefab setup (designer):
    /// - Root: RectTransform with this script + Image (background)
    /// - Child: Image (noise overlay, alpha ~0.25)
    /// - Child: HorizontalLayoutGroup with 5 small star Images
    /// - Child: TMP_Text (zone label, bottom)
    /// - Child: TMP_Text (state badge, top-right corner)
    /// - Child: GameObject (lock icon, shown only when state == Locked)
    /// - Child: Image (selection outline, shown when selected)
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class ZoneCellView : MonoBehaviour, IPointerClickHandler, IPointerEnterHandler, IPointerExitHandler
    {
        [Header("Slots")]
        [SerializeField] private Image background;
        [SerializeField] private Image noiseOverlay;
        [SerializeField] private Image selectionOutline;
        [SerializeField] private GameObject lockIcon;
        [SerializeField] private TMP_Text labelText;
        [SerializeField] private TMP_Text stateBadge;
        [SerializeField] private Image[] starIcons; // length 5

        [Header("Biome Tints")]
        [SerializeField] private Color mountainTint  = new Color(0.30f, 0.45f, 0.30f);
        [SerializeField] private Color suburbiaTint  = new Color(0.55f, 0.45f, 0.30f);
        [SerializeField] private Color metroTint     = new Color(0.30f, 0.35f, 0.45f);
        [SerializeField] private Color perimeterTint = new Color(0.45f, 0.20f, 0.50f);

        [Header("State Colors")]
        [SerializeField] private Color colorAvailable    = new Color(0.30f, 0.80f, 0.45f);
        [SerializeField] private Color colorCleared      = new Color(0.55f, 0.50f, 0.40f);
        [SerializeField] private Color colorContested    = new Color(0.85f, 0.45f, 0.25f);
        [SerializeField] private Color colorLocked       = new Color(0.30f, 0.28f, 0.25f);
        [SerializeField] private Color colorUndiscovered = new Color(0.40f, 0.38f, 0.35f);

        [Header("Star Colors")]
        [SerializeField] private Color starFilled = new Color(0.95f, 0.82f, 0.30f);
        [SerializeField] private Color starEmpty  = new Color(0.20f, 0.20f, 0.20f);

        // ─── State ───────────────────────────────────────────────────────────
        public ZoneCell Cell { get; private set; }
        public bool IsSelected { get; private set; }

        public event Action<ZoneCellView> OnClicked;
        public event Action<ZoneCellView> OnHovered;
        public event Action<ZoneCellView> OnUnhovered;

        // ─── Binding ──────────────────────────────────────────────────────────
        public void Bind(ZoneCell cell)
        {
            Cell = cell;
            if (background != null) background.color = TintForBiome(cell.biome);
            if (labelText != null)  labelText.text  = $"{cell.gridX},{cell.gridY}";
            if (stateBadge != null)
            {
                stateBadge.text  = StateLabel(cell.state);
                stateBadge.color = ColorForState(cell.state);
            }
            if (lockIcon != null) lockIcon.SetActive(cell.state == ZoneState.Locked);
            ApplyThreatStars(cell.threatLevel);
            SetSelected(false);

            // Pop the cell on bind.
            if (ZedIdler.Services.ServiceLocator.TryGet<ZedIdler.Services.IUIAnimationService>(out var anim))
                anim.Pop(transform);
        }

        public void SetSelected(bool isSelected)
        {
            IsSelected = isSelected;
            if (selectionOutline != null) selectionOutline.gameObject.SetActive(isSelected);
        }

        private void ApplyThreatStars(int threat)
        {
            if (starIcons == null) return;
            for (int i = 0; i < starIcons.Length; i++)
            {
                if (starIcons[i] == null) continue;
                starIcons[i].color = i < threat ? starFilled : starEmpty;
            }
        }

        // ─── Input ────────────────────────────────────────────────────────────
        public void OnPointerClick(PointerEventData _)  => OnClicked?.Invoke(this);
        public void OnPointerEnter(PointerEventData _)  => OnHovered?.Invoke(this);
        public void OnPointerExit(PointerEventData _)   => OnUnhovered?.Invoke(this);

        // ─── Lookups ──────────────────────────────────────────────────────────
        private Color TintForBiome(BiomeTag b)
        {
            switch (b)
            {
                case BiomeTag.Mountain:  return mountainTint;
                case BiomeTag.Suburbia:  return suburbiaTint;
                case BiomeTag.Metro:     return metroTint;
                case BiomeTag.Perimeter: return perimeterTint;
                default: return Color.gray;
            }
        }

        private Color ColorForState(ZoneState s)
        {
            switch (s)
            {
                case ZoneState.Available:    return colorAvailable;
                case ZoneState.Cleared:      return colorCleared;
                case ZoneState.Contested:    return colorContested;
                case ZoneState.Locked:       return colorLocked;
                default: return colorUndiscovered;
            }
        }

        private static string StateLabel(ZoneState s)
        {
            switch (s)
            {
                case ZoneState.Available:    return "AVAIL";
                case ZoneState.Cleared:      return "CLEAR";
                case ZoneState.Contested:    return "HOT";
                case ZoneState.Locked:       return "LOCK";
                default: return "?";
            }
        }
    }
}
