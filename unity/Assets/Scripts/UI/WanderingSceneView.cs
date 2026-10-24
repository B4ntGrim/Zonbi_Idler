// Assets/Scripts/UI/WanderingSceneView.cs
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.UI;
using ZedIdler.Data;
using ZedIdler.Services;
using ZedIdler.Systems;

namespace ZedIdler.UI
{
    /// <summary>
    /// Scene-bound UI layer for the Wandering tab. Designer-wired —
    /// drag every Canvas element into the corresponding <c>[SerializeField]</c>
    /// slot in the inspector. Subscribes to <see cref="WanderingSceneController"/>
    /// events on enable and unsubscribes on disable so the view can come and go
    /// without leaks while the backend ticks on.
    /// </summary>
    /// <remarks>
    /// Uses the new Input System: bind <see cref="submitAction"/> to an
    /// InputActionReference that fires on Enter/Submit. The command input is
    /// a TMP InputField for cross-platform IME / virtual-keyboard support.
    ///
    /// Loot collection is auto in passive mode; the loot popup is a placeholder
    /// for the future filter UI.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class WanderingSceneView : MonoBehaviour
    {
        [Header("Survivor (left side)")]
        [SerializeField] private Image survivorSprite;
        [SerializeField] private Slider survivorHpBar;
        [SerializeField] private TMP_Text survivorHpText;
        [SerializeField] private TMP_Text survivorNameText;

        [Header("Zombie (right side)")]
        [SerializeField] private Image zombieSprite;
        [SerializeField] private Slider zombieHpBar;
        [SerializeField] private TMP_Text zombieHpText;
        [SerializeField] private TMP_Text zombieNameText;
        [SerializeField] private TMP_Text zombieTierBadge;

        [Header("Combat Log")]
        [SerializeField] private RectTransform logContent;
        [SerializeField] private TMP_Text logEntryPrefab;
        [SerializeField] private ScrollRect logScroll;
        [SerializeField, Range(20, 500)] private int maxLogLines = 100;

        [Header("Command Input (executable text box)")]
        [SerializeField] private TMP_InputField commandInput;
        [SerializeField] private Button submitButton;
        [SerializeField] private InputActionReference submitAction; // new Input System

        [Header("Indicators")]
        [SerializeField] private GameObject initiativeIndicator;
        [SerializeField] private TMP_Text killsText;
        [SerializeField] private GameObject lootPopupPrefab;
        [SerializeField] private RectTransform lootPopupHost;

        [Header("Tier Colors")]
        [SerializeField] private Color colorStandard    = new Color(0.5f, 0.5f, 0.5f);
        [SerializeField] private Color colorFast        = new Color(0.3f, 0.8f, 0.4f);
        [SerializeField] private Color colorHeavy       = new Color(0.55f, 0.35f, 0.2f);
        [SerializeField] private Color colorInfected    = new Color(0.6f, 0.7f, 0.3f);
        [SerializeField] private Color colorElite       = new Color(0.9f, 0.75f, 0.2f);
        [SerializeField] private Color colorHordeLeader = new Color(0.9f, 0.2f, 0.2f);

        private WanderingSceneController _controller;
        private readonly Queue<TMP_Text> _logEntries = new Queue<TMP_Text>();

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void OnEnable()
        {
            _controller = ServiceLocator.Get<WanderingSceneController>();
            if (_controller == null)
            {
                Debug.LogError("[WanderingSceneView] No WanderingSceneController in ServiceLocator. " +
                               "Add the persistent controller to the Bootstrap scene.");
                enabled = false;
                return;
            }

            _controller.OnRunStarted        += HandleRunStarted;
            _controller.OnEncounterStarted  += HandleEncounterStarted;
            _controller.OnTurnResolved      += HandleTurnResolved;
            _controller.OnSurvivorHpChanged += HandleSurvivorHpChanged;
            _controller.OnZombieDefeated    += HandleZombieDefeated;
            _controller.OnSurvivorDefeated  += HandleSurvivorDefeated;
            _controller.OnCombatLogEntry    += HandleLogEntry;

            if (submitButton != null) submitButton.onClick.AddListener(SubmitCommand);
            if (submitAction != null)
            {
                submitAction.action.performed += OnSubmitInput;
                submitAction.action.Enable();
            }

            // Seed initial UI state from the live controller (in case combat is mid-run).
            if (_controller.IsRunning) HydrateFromLiveCombat();
        }

        private void OnDisable()
        {
            if (_controller != null)
            {
                _controller.OnRunStarted        -= HandleRunStarted;
                _controller.OnEncounterStarted  -= HandleEncounterStarted;
                _controller.OnTurnResolved      -= HandleTurnResolved;
                _controller.OnSurvivorHpChanged -= HandleSurvivorHpChanged;
                _controller.OnZombieDefeated    -= HandleZombieDefeated;
                _controller.OnSurvivorDefeated  -= HandleSurvivorDefeated;
                _controller.OnCombatLogEntry    -= HandleLogEntry;
            }
            if (submitButton != null) submitButton.onClick.RemoveListener(SubmitCommand);
            if (submitAction != null)
            {
                submitAction.action.performed -= OnSubmitInput;
                submitAction.action.Disable();
            }
        }

        // ─── Event handlers ───────────────────────────────────────────────────
        private void HandleRunStarted(ZedIdler.Entities.Survivor s)
        {
            if (survivorNameText != null) survivorNameText.text = s.DisplayName;
            UpdateSurvivorHp(s.Stats.Endurance * 10); // matches CombatSystem.cs MaxHP derivation
        }

        private void HandleEncounterStarted(CombatEncounter enc, bool playerFirst)
        {
            var z = enc.zombieDef;
            if (zombieSprite != null && z.Sprite != null) zombieSprite.sprite = z.Sprite;
            if (zombieNameText != null) zombieNameText.text = z.DisplayName;
            if (zombieTierBadge != null)
            {
                zombieTierBadge.text = z.Tier.ToString().ToUpperInvariant();
                zombieTierBadge.color = ColorForTier(z.Tier);
            }
            UpdateZombieHp(enc.zombieHp, enc.zombieMaxHp);
            if (initiativeIndicator != null)
            {
                initiativeIndicator.SetActive(true);
                CancelInvoke(nameof(HideInitiativeIndicator));
                Invoke(nameof(HideInitiativeIndicator), 1.5f);
            }
        }

        private void HideInitiativeIndicator()
        {
            if (initiativeIndicator != null) initiativeIndicator.SetActive(false);
        }

        private void HandleTurnResolved(int turnIdx, TurnAction action)
        {
            if (action.actor == TurnActor.Player)
            {
                UpdateZombieHp(action.targetHpAfter, _controller.Combat?.Current?.zombieMaxHp ?? 1);
                // Pop the zombie sprite on crit.
                if (action.wasCrit && zombieSprite != null
                    && ZedIdler.Services.ServiceLocator.TryGet<ZedIdler.Services.IUIAnimationService>(out var animCrit))
                {
                    animCrit.Pop(zombieSprite.transform, 1.25f, 0.30f);
                }
            }
            else if (action.actor == TurnActor.Zombie)
            {
                // Shake the survivor sprite on damage.
                if (survivorSprite != null && action.damage > 0
                    && ZedIdler.Services.ServiceLocator.TryGet<ZedIdler.Services.IUIAnimationService>(out var animShake))
                {
                    animShake.Shake(survivorSprite.transform, 6f, 0.25f);
                }
            }
        }

        private void HandleSurvivorHpChanged(int hp) => UpdateSurvivorHp(hp);

        private void HandleZombieDefeated(ZombieDefinition z, LootDrop[] loot)
        {
            if (killsText != null && _controller != null)
                killsText.text = $"Kills: {GetKillCount()}";
            ShowLootPopup(loot);
        }

        private void HandleSurvivorDefeated(ZedIdler.Entities.Survivor s)
        {
            AppendLogLine("--- DEFEATED ---", Color.red);
        }

        private void HandleLogEntry(LogEntry entry)
        {
            AppendLogLine(entry.text, ColorForChannel(entry.channel));
        }

        // ─── UI helpers ───────────────────────────────────────────────────────
        private void UpdateSurvivorHp(int hp)
        {
            int max = _controller.Combat?.SurvivorMaxHp ?? 100;
            if (survivorHpBar != null) { survivorHpBar.maxValue = max; survivorHpBar.value = hp; }
            if (survivorHpText != null)
            {
                // Animate the HP counter from previous text to new value.
                int prev = max;
                if (survivorHpText.text != null)
                {
                    var parts = survivorHpText.text.Split('/');
                    if (parts.Length > 0) int.TryParse(parts[0].Trim(), out prev);
                }
                if (ZedIdler.Services.ServiceLocator.TryGet<ZedIdler.Services.IUIAnimationService>(out var anim))
                    anim.NumberTick(survivorHpText, prev, hp, 0.4f, suffix: $" / {max}");
                else
                    survivorHpText.text = $"{hp} / {max}";
            }
        }

        private void UpdateZombieHp(int hp, int max)
        {
            if (zombieHpBar != null) { zombieHpBar.maxValue = max; zombieHpBar.value = hp; }
            if (zombieHpText != null) zombieHpText.text = $"{hp} / {max}";
        }

        private void HydrateFromLiveCombat()
        {
            if (_controller.ActiveSurvivor != null && survivorNameText != null)
                survivorNameText.text = _controller.ActiveSurvivor.DisplayName;
            if (_controller.Combat?.Current != null)
            {
                var enc = _controller.Combat.Current;
                if (zombieNameText != null) zombieNameText.text = enc.zombieDef.DisplayName;
                UpdateZombieHp(enc.zombieHp, enc.zombieMaxHp);
            }
            if (_controller.Combat != null)
                UpdateSurvivorHp(_controller.Combat.SurvivorHp);
        }

        private void AppendLogLine(string text, Color color)
        {
            if (logEntryPrefab == null || logContent == null) return;
            var line = Instantiate(logEntryPrefab, logContent);
            line.text = text;
            line.color = color;
            _logEntries.Enqueue(line);
            while (_logEntries.Count > maxLogLines)
            {
                var old = _logEntries.Dequeue();
                if (old != null) Destroy(old.gameObject);
            }
            if (logScroll != null)
            {
                Canvas.ForceUpdateCanvases();
                logScroll.verticalNormalizedPosition = 0f;
            }
        }

        private void ShowLootPopup(LootDrop[] loot)
        {
            if (lootPopupPrefab == null || lootPopupHost == null || loot == null) return;
            var popup = Instantiate(lootPopupPrefab, lootPopupHost);
            var txt = popup.GetComponentInChildren<TMP_Text>();
            if (txt != null)
            {
                var parts = new List<string>();
                for (int i = 0; i < loot.Length; i++)
                    if (loot[i].IsValid) parts.Add($"+{loot[i].quantity} {loot[i].itemId}");
                txt.text = parts.Count == 0 ? "(no drops)" : string.Join("  ", parts);
            }
            Destroy(popup, 2.5f);
        }

        private void OnSubmitInput(InputAction.CallbackContext ctx) => SubmitCommand();

        private void SubmitCommand()
        {
            if (commandInput == null || _controller == null) return;
            var raw = commandInput.text;
            if (string.IsNullOrWhiteSpace(raw)) return;
            _controller.SubmitCommand(raw);
            commandInput.text = string.Empty;
            commandInput.ActivateInputField();
        }

        private int GetKillCount()
        {
            // The controller exposes _kills via OnZombieDefeated cadence; we just count locally.
            // (A public Kills accessor on the controller can replace this if desired.)
            return _logEntries.Count;
        }

        private Color ColorForTier(ZombieTier t)
        {
            switch (t)
            {
                case ZombieTier.Standard:    return colorStandard;
                case ZombieTier.Fast:        return colorFast;
                case ZombieTier.Heavy:       return colorHeavy;
                case ZombieTier.Infected:    return colorInfected;
                case ZombieTier.Elite:       return colorElite;
                case ZombieTier.HordeLeader: return colorHordeLeader;
                default: return Color.white;
            }
        }

        private Color ColorForChannel(LogChannel c)
        {
            switch (c)
            {
                case LogChannel.Hit:     return new Color(0.5f, 0.85f, 0.6f);
                case LogChannel.Damage:  return new Color(0.9f, 0.45f, 0.3f);
                case LogChannel.Crit:    return new Color(1f, 0.85f, 0.3f);
                case LogChannel.Kill:    return new Color(0.95f, 0.85f, 0.4f);
                case LogChannel.Loot:    return new Color(0.7f, 0.85f, 0.95f);
                case LogChannel.Defeat:  return Color.red;
                case LogChannel.Command: return new Color(0.7f, 0.55f, 0.95f);
                case LogChannel.System:  return new Color(0.6f, 0.85f, 0.9f);
                case LogChannel.Warning: return new Color(1f, 0.7f, 0.3f);
                default: return new Color(0.8f, 0.78f, 0.7f);
            }
        }
    }
}
