// Assets/Scripts/Data/GameConfig.cs
using UnityEngine;

namespace ZedIdler.Data
{
    /// <summary>
    /// Tunable configuration for <see cref="ZedIdler.Core.GameManager"/>.
    /// Exposed as a ScriptableObject so designers can tune values without recompiling.
    /// Create via: Right-click in Project → Create → ZedIdler → Game Config.
    /// </summary>
    [CreateAssetMenu(menuName = "ZedIdler/Game Config", fileName = "GameConfig", order = 0)]
    public sealed class GameConfig : ScriptableObject
    {
        [Header("Save System")]
        [Tooltip("Filename (no extension) for the JSON save file inside Application.persistentDataPath.")]
        [SerializeField] private string saveFileName = "zedidler_save";

        [Tooltip("Schema version. Bump when SaveData layout changes to allow migration.")]
        [SerializeField] private int saveSchemaVersion = 1;

        [Header("Offline Progression")]
        [Tooltip("Maximum elapsed real-world hours that count toward offline schedule progress. " +
                 "Prevents 6-month absences from generating absurd rewards.")]
        [Range(1f, 168f)]
        [SerializeField] private float maxOfflineHours = 24f;

        [Tooltip("Minimum seconds between manual save attempts (rate-limit the save button).")]
        [Range(0f, 30f)]
        [SerializeField] private float minSaveIntervalSeconds = 2f;

        [Header("Mobile Lifecycle")]
        [Tooltip("Save on application pause (iOS/Android background). PC ignores this.")]
        [SerializeField] private bool saveOnApplicationPause = true;

        [Tooltip("Save on application focus loss (PC alt-tab, mobile foreground swap).")]
        [SerializeField] private bool saveOnFocusLoss = false;

        [Header("Scene Map")]
        [Tooltip("Scene name for each top-level GameState. Index must match GameState enum order.")]
        [SerializeField] private SceneMapping[] sceneMap = new SceneMapping[0];

        // ─── Public read-only accessors ───────────────────────────────────────
        public string SaveFileName => saveFileName;
        public int SaveSchemaVersion => saveSchemaVersion;
        public float MaxOfflineHours => maxOfflineHours;
        public float MinSaveIntervalSeconds => minSaveIntervalSeconds;
        public bool SaveOnApplicationPause => saveOnApplicationPause;
        public bool SaveOnFocusLoss => saveOnFocusLoss;
        public SceneMapping[] SceneMap => sceneMap;
    }

    /// <summary>
    /// Maps a <see cref="ZedIdler.Core.GameState"/> to its Unity scene name.
    /// </summary>
    [System.Serializable]
    public struct SceneMapping
    {
        public ZedIdler.Core.GameState state;
        public string sceneName;
    }
}
