// Assets/Scripts/UI/EquipmentSceneView.cs
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;
using ZedIdler.Data;
using ZedIdler.Services;
using ZedIdler.Systems;

namespace ZedIdler.UI
{
    /// <summary>
    /// Designer-wired UI for managing weapon loadouts. Three slot rows
    /// (Primary / Secondary / Melee) per selected survivor, each showing
    /// the equipped weapon's runtime state and an RNG preview of the next
    /// shot outcome (misfire chance, damage range, accuracy).
    /// </summary>
    [DisallowMultipleComponent]
    public sealed class EquipmentSceneView : MonoBehaviour
    {
        [Header("Survivor Picker")]
        [SerializeField] private TMP_Dropdown survivorDropdown;

        [Header("Slot Rows (one per slot)")]
        [SerializeField] private EquipmentSlotRow primaryRow;
        [SerializeField] private EquipmentSlotRow secondaryRow;
        [SerializeField] private EquipmentSlotRow meleeRow;

        [Header("RNG Preview")]
        [SerializeField] private TMP_Text rngPreviewText;
        [SerializeField] private Button rollPreviewButton;

        [Header("Action Buttons")]
        [SerializeField] private Button reloadButton;
        [SerializeField] private Button cleanButton;
        [SerializeField] private Button repairButton;

        [Header("Mod Picker")]
        [SerializeField] private TMP_Dropdown modDropdown;
        [SerializeField] private Button installModButton;

        [Header("Toast")]
        [SerializeField] private TMP_Text toastText;

        private IEquipmentService _equip;
        private IWeaponCatalogProvider _catalog;
        private IRosterService _roster;
        private IFactionService _factions;
        private System.Random _rng = new System.Random();
        private string _selectedSurvivorId;
        private WeaponSlot _selectedSlot = WeaponSlot.Primary;

        private void OnEnable()
        {
            ServiceLocator.TryGet(out _equip);
            ServiceLocator.TryGet(out _catalog);
            ServiceLocator.TryGet(out _roster);
            ServiceLocator.TryGet(out _factions);
            if (_equip == null) { enabled = false; return; }

            _equip.OnEquipped += (_, __, ___) => Refresh();
            _equip.OnUnequipped += (_, __) => Refresh();
            _equip.OnAmmoChanged += (_, __) => Refresh();
            _equip.OnDurabilityChanged += (_, __) => Refresh();
            _equip.OnCleanlinessChanged += (_, __) => Refresh();
            _equip.OnMisfire += _ => Toast("⚠ Misfire!", true);
            _equip.OnBroken  += _ => Toast("✗ Weapon broken.", true);
            _equip.OnRepaired += _ => Toast("✓ Repaired.", false);
            _equip.OnModInstalled += (_, __) => Refresh();

            HookUI();
            BuildSurvivorDropdown();
            BuildModDropdown();
            Refresh();
        }

        private void HookUI()
        {
            if (survivorDropdown != null) survivorDropdown.onValueChanged.AddListener(_ => { SyncSelectedSurvivor(); Refresh(); });
            if (rollPreviewButton != null) rollPreviewButton.onClick.AddListener(RollRngPreview);
            if (reloadButton != null) reloadButton.onClick.AddListener(() => HandleAction(0));
            if (cleanButton  != null) cleanButton.onClick.AddListener(()  => HandleAction(1));
            if (repairButton != null) repairButton.onClick.AddListener(() => HandleAction(2));
            if (installModButton != null) installModButton.onClick.AddListener(InstallSelectedMod);
            if (primaryRow   != null) primaryRow.OnSelected   += () => { _selectedSlot = WeaponSlot.Primary;   Refresh(); };
            if (secondaryRow != null) secondaryRow.OnSelected += () => { _selectedSlot = WeaponSlot.Secondary; Refresh(); };
            if (meleeRow     != null) meleeRow.OnSelected     += () => { _selectedSlot = WeaponSlot.Melee;     Refresh(); };
        }

        private void BuildSurvivorDropdown()
        {
            if (survivorDropdown == null || _roster == null) return;
            survivorDropdown.ClearOptions();
            var opts = new List<TMP_Dropdown.OptionData>();
            foreach (var s in _roster.GetAvailableSurvivors())
                opts.Add(new TMP_Dropdown.OptionData($"{s.displayName} (Lv{s.level})"));
            survivorDropdown.AddOptions(opts);
            SyncSelectedSurvivor();
        }

        private void SyncSelectedSurvivor()
        {
            if (_roster == null || survivorDropdown == null) return;
            int idx = survivorDropdown.value;
            int i = 0;
            foreach (var s in _roster.GetAvailableSurvivors())
            {
                if (i == idx) { _selectedSurvivorId = s.id; return; }
                i++;
            }
        }

        private void BuildModDropdown()
        {
            if (modDropdown == null || _catalog == null) return;
            modDropdown.ClearOptions();
            var opts = new List<TMP_Dropdown.OptionData>();
            foreach (var m in _catalog.GetAllMods())
                if (m != null) opts.Add(new TMP_Dropdown.OptionData($"{m.DisplayName} ({m.Category})"));
            modDropdown.AddOptions(opts);
        }

        private void Refresh()
        {
            if (string.IsNullOrEmpty(_selectedSurvivorId)) return;
            BindRow(primaryRow,   WeaponSlot.Primary);
            BindRow(secondaryRow, WeaponSlot.Secondary);
            BindRow(meleeRow,     WeaponSlot.Melee);
        }

        private void BindRow(EquipmentSlotRow row, WeaponSlot slot)
        {
            if (row == null) return;
            var inst = _equip.GetEquippedInstance(_selectedSurvivorId, slot);
            var def = !string.IsNullOrEmpty(inst.weaponId) ? _catalog.GetWeapon(inst.weaponId) : null;
            row.Bind(slot, def, inst, slot == _selectedSlot);
        }

        private void HandleAction(int action)
        {
            var inst = _equip.GetEquippedInstance(_selectedSurvivorId, _selectedSlot);
            if (string.IsNullOrEmpty(inst.instanceId)) { Toast("No weapon equipped in slot.", true); return; }
            bool ok = action switch
            {
                0 => _equip.Reload(inst.instanceId),
                1 => _equip.Clean(inst.instanceId),
                2 => _equip.Repair(inst.instanceId),
                _ => false
            };
            string label = action == 0 ? "reload" : action == 1 ? "clean" : "repair";
            Toast(ok ? $"✓ {label}" : $"✗ {label} failed (missing supplies)", !ok);
        }

        private void InstallSelectedMod()
        {
            if (modDropdown == null || _catalog == null) return;
            var inst = _equip.GetEquippedInstance(_selectedSurvivorId, _selectedSlot);
            if (string.IsNullOrEmpty(inst.instanceId)) { Toast("No weapon in slot.", true); return; }
            int idx = modDropdown.value, i = 0;
            foreach (var m in _catalog.GetAllMods())
            {
                if (m == null) continue;
                if (i == idx) { Toast(_equip.InstallMod(inst.instanceId, m.ModId) ? "✓ Mod installed" : "✗ Mod failed", true); return; }
                i++;
            }
        }

        /// <summary>Roll a simulated shot outcome — pure preview, doesn't mutate weapon state.</summary>
        private void RollRngPreview()
        {
            if (rngPreviewText == null) return;
            var inst = _equip.GetEquippedInstance(_selectedSurvivorId, _selectedSlot);
            var def = !string.IsNullOrEmpty(inst.weaponId) ? _catalog.GetWeapon(inst.weaponId) : null;
            if (def == null) { rngPreviewText.text = "No weapon equipped."; return; }
            int rank = _factions?.GetAlignedFactionRank() ?? 0;
            var profile = _equip.GetDamageProfile(inst.instanceId, rank);
            float misfireChance = inst.cleanliness >= 100 ? 0f : Mathf.Lerp(0f, def.MaxMisfireChance, 1f - (inst.cleanliness / 100f));
            int dmgRoll = _rng.Next(profile.minDamage, profile.maxDamage + 1);
            int finalDmg = Mathf.RoundToInt(dmgRoll * profile.damageMult);
            bool simMisfire = _rng.NextDouble() < misfireChance;
            string status = inst.isBroken ? "BROKEN" : simMisfire ? "MISFIRE" : "OK";
            rngPreviewText.text =
                $"Sim Roll → {status}\n" +
                $"Damage: {finalDmg} (raw {dmgRoll} × {profile.damageMult:F2})\n" +
                $"Misfire chance: {misfireChance:P0}\n" +
                $"Accuracy: {profile.accuracy:P0}\n" +
                $"Diplomat rank bonus: +{rank * def.DiplomatRankBonusPerRank:P1}";
        }

        private void Toast(string msg, bool isError)
        {
            if (toastText == null) return;
            toastText.text = msg;
            toastText.color = isError ? new Color(0.9f, 0.45f, 0.3f) : new Color(0.5f, 0.85f, 0.5f);
        }
    }

    /// <summary>One weapon slot row in the equipment view. Designer-wired UI elements.</summary>
    public sealed class EquipmentSlotRow : MonoBehaviour, UnityEngine.EventSystems.IPointerClickHandler
    {
        [SerializeField] private TMP_Text slotLabel;
        [SerializeField] private TMP_Text weaponName;
        [SerializeField] private TMP_Text ammoText;
        [SerializeField] private Slider   durabilityBar;
        [SerializeField] private Slider   cleanlinessBar;
        [SerializeField] private TMP_Text statText;
        [SerializeField] private GameObject brokenOverlay;
        [SerializeField] private Image     selectionOutline;

        public event System.Action OnSelected;

        public void Bind(WeaponSlot slot, WeaponDefinition def, WeaponInstance inst, bool isSelected)
        {
            if (slotLabel != null) slotLabel.text = slot.ToString();
            if (selectionOutline != null) selectionOutline.gameObject.SetActive(isSelected);
            if (def == null)
            {
                if (weaponName != null) weaponName.text = "<empty>";
                if (ammoText != null)   ammoText.text   = "—";
                if (durabilityBar != null)  { durabilityBar.minValue = 0; durabilityBar.maxValue = 1; durabilityBar.value = 0; }
                if (cleanlinessBar != null) { cleanlinessBar.minValue = 0; cleanlinessBar.maxValue = 100; cleanlinessBar.value = 0; }
                if (statText != null)   statText.text = "";
                if (brokenOverlay != null) brokenOverlay.SetActive(false);
                return;
            }
            if (weaponName != null) weaponName.text = def.DisplayName;
            if (ammoText != null)
                ammoText.text = def.IsRanged ? $"{inst.currentAmmo} / {def.MagazineSize}" : "—";
            if (durabilityBar != null) { durabilityBar.minValue = 0; durabilityBar.maxValue = def.MaxDurability; durabilityBar.value = inst.durability; }
            if (cleanlinessBar != null){ cleanlinessBar.minValue = 0; cleanlinessBar.maxValue = 100; cleanlinessBar.value = inst.cleanliness; }
            if (statText != null)
                statText.text = $"Dmg {def.MinDamage}-{def.MaxDamage} × {def.DamageMultiplier:F2}";
            if (brokenOverlay != null) brokenOverlay.SetActive(inst.isBroken);
        }

        public void OnPointerClick(UnityEngine.EventSystems.PointerEventData _) => OnSelected?.Invoke();
    }
}
