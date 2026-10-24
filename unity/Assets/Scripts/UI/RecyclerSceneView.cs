// Assets/Scripts/UI/RecyclerSceneView.cs
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;
using ZedIdler.Data;
using ZedIdler.Services;

namespace ZedIdler.UI
{
    /// <summary>
    /// Hybrid scene UI for the Recycler — a large rendered image of the machine
    /// on one half, the operational UI (recipe list, queue, operator, output)
    /// off to the side.
    /// </summary>
    /// <remarks>
    /// Layout:
    /// - Left half: machine image (Image slot for art).
    /// - Right side panel:
    ///     - Operator selector (single dropdown of available survivors)
    ///     - Slot count display (auto from camp level)
    ///     - Recipe list (instantiated buttons)
    ///     - Active queue (instantiated entries with progress bars)
    ///     - Recent output log
    ///
    /// Designer-wires every slot. Subscribes to <see cref="IRecyclerService"/>
    /// events; rebuilds queue display on every change.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class RecyclerSceneView : MonoBehaviour
    {
        [Header("Machine Image")]
        [SerializeField] private Image machineImage;
        [SerializeField] private GameObject lockedOverlay;
        [SerializeField] private TMP_Text lockedMessage;

        [Header("Header")]
        [SerializeField] private TMP_Text slotCountText;
        [SerializeField] private TMP_Text operatorNameText;
        [SerializeField] private TMP_Text yieldBonusText;

        [Header("Recipe List")]
        [SerializeField] private RectTransform recipeListContainer;
        [SerializeField] private Button recipeButtonPrefab;

        [Header("Active Queue")]
        [SerializeField] private RectTransform queueContainer;
        [SerializeField] private RectTransform queueEntryPrefab; // expects children: Label (TMP_Text), Progress (Slider), Cancel (Button)
        [SerializeField] private TMP_Text emptyQueueText;

        [Header("Output Log")]
        [SerializeField] private RectTransform outputLogContainer;
        [SerializeField] private TMP_Text outputLogEntryPrefab;
        [SerializeField, Range(5, 50)] private int maxOutputLines = 20;

        // ─── Runtime state ────────────────────────────────────────────────────
        private IRecyclerService _service;
        private ICatalogService _catalogs;
        private IPlayerProfile _profile;
        private readonly List<RecyclerRecipe> _availableRecipes = new List<RecyclerRecipe>();
        private readonly Dictionary<string, RectTransform> _queueViews = new Dictionary<string, RectTransform>();
        private readonly Queue<TMP_Text> _outputLines = new Queue<TMP_Text>();

        // ─── Lifecycle ────────────────────────────────────────────────────────
        private void OnEnable()
        {
            ServiceLocator.TryGet(out _service);
            ServiceLocator.TryGet(out _catalogs);
            ServiceLocator.TryGet(out _profile);

            if (_service == null)
            {
                Debug.LogError("[RecyclerSceneView] No RecyclerService bound.");
                enabled = false; return;
            }

            _service.OnJobQueued    += HandleJobQueued;
            _service.OnJobStarted   += HandleJobStarted;
            _service.OnJobCompleted += HandleJobCompleted;
            _service.OnJobCancelled += HandleJobCancelled;
            _service.OnOperatorChanged += _ => RefreshHeader();

            BuildRecipeList();
            RebuildQueue();
            RefreshHeader();
            RefreshLockState();
        }

        private void OnDisable()
        {
            if (_service != null)
            {
                _service.OnJobQueued    -= HandleJobQueued;
                _service.OnJobStarted   -= HandleJobStarted;
                _service.OnJobCompleted -= HandleJobCompleted;
                _service.OnJobCancelled -= HandleJobCancelled;
            }
        }

        private void Update()
        {
            // Tick progress bars for active jobs.
            if (_service == null) return;
            for (int i = 0; i < _service.Queue.Count; i++)
            {
                var job = _service.Queue[i];
                if (_queueViews.TryGetValue(job.jobId, out var row))
                {
                    var slider = row.GetComponentInChildren<Slider>();
                    if (slider != null) slider.value = job.ProgressNormalized;
                }
            }
        }

        // ─── Build / refresh ──────────────────────────────────────────────────
        private void RefreshLockState()
        {
            if (lockedOverlay == null) return;
            if (!_service.IsUnlocked)
            {
                lockedOverlay.SetActive(true);
                int needed = ServiceLocator.Get<IUnlockService>()?.GetRequiredLevel("recycler") ?? 15;
                if (lockedMessage != null) lockedMessage.text = $"Requires Camp Level {needed}";
            }
            else
            {
                lockedOverlay.SetActive(false);
            }
        }

        private void RefreshHeader()
        {
            if (slotCountText != null)
                slotCountText.text = $"Slots: {_service.ConcurrentSlots}";
            if (operatorNameText != null)
                operatorNameText.text = string.IsNullOrEmpty(_service.OperatorSurvivorId)
                    ? "No operator assigned" : $"Operator: {_service.OperatorClass}";
        }

        private void BuildRecipeList()
        {
            if (recipeListContainer == null || recipeButtonPrefab == null) return;
            foreach (Transform t in recipeListContainer) Destroy(t.gameObject);
            _availableRecipes.Clear();

            // Discover recipes via the catalog provider extension.
            if (_catalogs is IRecyclerCatalogProvider rcp && _catalogs.CharacterTypes != null)
            {
                // The catalog service should expose AllRecipes; we use a lazy enumeration trick.
                var all = (rcp as IRecyclerCatalogListProvider)?.GetAllRecipes();
                if (all != null) _availableRecipes.AddRange(all);
            }

            int campLevel = _profile?.CampLevel ?? 0;
            foreach (var recipe in _availableRecipes)
            {
                if (recipe == null) continue;
                if (recipe.RequiredCampLevel > campLevel) continue;

                var btn = Instantiate(recipeButtonPrefab, recipeListContainer);
                var label = btn.GetComponentInChildren<TMP_Text>();
                if (label != null) label.text = $"{recipe.DisplayName} — {recipe.ProcessSeconds:F0}s";
                var captured = recipe;
                btn.onClick.AddListener(() => _service.QueueRecipe(captured));
            }
        }

        private void RebuildQueue()
        {
            if (queueContainer == null || queueEntryPrefab == null) return;
            foreach (Transform t in queueContainer) Destroy(t.gameObject);
            _queueViews.Clear();
            for (int i = 0; i < _service.Queue.Count; i++) AddQueueRow(_service.Queue[i]);
            UpdateEmptyState();
        }

        private void AddQueueRow(RecyclerJob job)
        {
            if (queueContainer == null || queueEntryPrefab == null) return;
            var row = Instantiate(queueEntryPrefab, queueContainer);
            _queueViews[job.jobId] = row;

            var label = row.GetComponentInChildren<TMP_Text>();
            if (label != null) label.text = job.recipeId;
            var slider = row.GetComponentInChildren<Slider>();
            if (slider != null) { slider.minValue = 0; slider.maxValue = 1; slider.value = job.ProgressNormalized; }
            var cancelBtn = row.GetComponentInChildren<Button>();
            if (cancelBtn != null)
            {
                string id = job.jobId;
                cancelBtn.onClick.AddListener(() => _service.CancelJob(id));
            }
            UpdateEmptyState();
        }

        private void UpdateEmptyState()
        {
            if (emptyQueueText != null) emptyQueueText.gameObject.SetActive(_service.Queue.Count == 0);
        }

        // ─── Event handlers ───────────────────────────────────────────────────
        private void HandleJobQueued(RecyclerJob job) => AddQueueRow(job);
        private void HandleJobStarted(RecyclerJob job) { /* visual state hook */ }

        private void HandleJobCompleted(RecyclerJob job)
        {
            if (_queueViews.TryGetValue(job.jobId, out var row))
            {
                Destroy(row.gameObject);
                _queueViews.Remove(job.jobId);
            }
            AppendOutput($"✓ Completed: {job.recipeId}");
            UpdateEmptyState();
        }

        private void HandleJobCancelled(RecyclerJob job, string reason)
        {
            if (_queueViews.TryGetValue(job.jobId, out var row))
            {
                Destroy(row.gameObject);
                _queueViews.Remove(job.jobId);
            }
            AppendOutput($"✗ Cancelled: {job.recipeId}");
            UpdateEmptyState();
        }

        private void AppendOutput(string text)
        {
            if (outputLogContainer == null || outputLogEntryPrefab == null) return;
            var entry = Instantiate(outputLogEntryPrefab, outputLogContainer);
            entry.text = text;
            _outputLines.Enqueue(entry);
            while (_outputLines.Count > maxOutputLines)
            {
                var old = _outputLines.Dequeue();
                if (old != null) Destroy(old.gameObject);
            }
        }
    }

    /// <summary>Catalog extension contract — Phase 2 follow-up should add this to CatalogService.</summary>
    public interface IRecyclerCatalogListProvider
    {
        IEnumerable<RecyclerRecipe> GetAllRecipes();
    }
}
