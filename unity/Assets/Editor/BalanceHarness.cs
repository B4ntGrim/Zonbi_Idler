// Assets/Editor/BalanceHarness.cs
#if UNITY_EDITOR
using System.Collections.Generic;
using System.Text;
using UnityEditor;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Editor
{
    /// <summary>
    /// Editor balance-verification harness. Runs N simulated wandering runs at
    /// a range of player levels and reports aggregate outcomes (avg kills,
    /// death rate, loot/run, credits/run, time-to-camp-15) so designers can
    /// validate the curve before shipping. Pure simulation — does not require
    /// Play mode.
    /// </summary>
    public sealed class BalanceHarness : EditorWindow
    {
        private int _runsPerLevel = 500;
        private int _minLevel = 1;
        private int _maxLevel = 50;
        private int _levelStep = 5;
        private string _report = "";
        private Vector2 _scroll;
        private BalanceConfig _config;

        [MenuItem("ZedIdler/Balance Harness")]
        public static void Open() => GetWindow<BalanceHarness>("Balance Harness");

        private void OnGUI()
        {
            EditorGUILayout.LabelField("Simulation Parameters", EditorStyles.boldLabel);
            _config = (BalanceConfig)EditorGUILayout.ObjectField("Balance Config", _config, typeof(BalanceConfig), false);
            _runsPerLevel = EditorGUILayout.IntField("Runs per level", _runsPerLevel);
            _minLevel = EditorGUILayout.IntField("Min level", _minLevel);
            _maxLevel = EditorGUILayout.IntField("Max level", _maxLevel);
            _levelStep = EditorGUILayout.IntField("Level step", _levelStep);

            if (GUILayout.Button("Run Simulation"))
                _report = RunSimulation();

            EditorGUILayout.Space();
            EditorGUILayout.LabelField("Report", EditorStyles.boldLabel);
            _scroll = EditorGUILayout.BeginScrollView(_scroll, GUILayout.ExpandHeight(true));
            EditorGUILayout.TextArea(_report, GUILayout.ExpandHeight(true));
            EditorGUILayout.EndScrollView();
        }

        private string RunSimulation()
        {
            var cfg = _config;
            var sb = new StringBuilder();
            sb.AppendLine("level | avgKills | deathRate | loot/run | credits/run");
            sb.AppendLine("------+----------+-----------+----------+------------");

            var rng = new System.Random(12345);
            for (int lvl = _minLevel; lvl <= _maxLevel; lvl += _levelStep)
            {
                long totalKills = 0, totalLoot = 0, totalCredits = 0, deaths = 0;
                for (int run = 0; run < _runsPerLevel; run++)
                {
                    var (kills, loot, credits, died) = SimulateRun(lvl, rng, cfg);
                    totalKills += kills; totalLoot += loot; totalCredits += credits;
                    if (died) deaths++;
                }
                float avgKills = totalKills / (float)_runsPerLevel;
                float deathRate = deaths / (float)_runsPerLevel;
                float lootPerRun = totalLoot / (float)_runsPerLevel;
                float credPerRun = totalCredits / (float)_runsPerLevel;
                sb.AppendLine($"{lvl,5} | {avgKills,8:F1} | {deathRate,8:P0} | {lootPerRun,8:F1} | {credPerRun,10:F0}");
            }

            // Time-to-camp-level-15 estimate.
            if (cfg != null)
            {
                long xpFor15 = cfg.CumulativeXpToReach(15) * cfg.CampXpDivisor / 100;
                sb.AppendLine();
                sb.AppendLine($"Cumulative survivor XP for camp level 15 ≈ {xpFor15:N0}");
            }
            return sb.ToString();
        }

        // Lightweight standalone combat model mirroring SquadCombatSystem math.
        private (int kills, int loot, int credits, bool died) SimulateRun(int level, System.Random rng, BalanceConfig cfg)
        {
            float critMult = cfg != null ? cfg.CritMultiplier : 1.75f;
            float critPer  = cfg != null ? cfg.CritChancePerCombat : 0.001f;
            int hpPerEnd   = cfg != null ? cfg.HpPerEndurance : 10;

            // Synthetic survivor scaling with level.
            int strength = 10 + level;
            int combat = 12 + level;
            int endurance = 10 + level / 2;
            int hp = Mathf.Max(50, endurance * hpPerEnd);

            int encounterLimit = 10;
            int kills = 0, loot = 0, credits = 0;
            for (int e = 0; e < encounterLimit; e++)
            {
                int zHp = 20 + level * 3 + rng.Next(0, 40);
                int zDmg = 5 + level / 2;
                // Fight loop
                while (zHp > 0 && hp > 0)
                {
                    float baseDmg = strength + combat * 0.5f;
                    bool crit = rng.NextDouble() < combat * critPer;
                    int dealt = Mathf.RoundToInt(baseDmg * (crit ? critMult : 1f));
                    zHp -= dealt;
                    if (zHp <= 0) break;
                    hp -= zDmg + rng.Next(0, 4);
                }
                if (hp <= 0) return (kills, loot, credits, true);
                kills++;
                int dropped = 1 + rng.Next(0, 3);
                loot += dropped;
                credits += dropped * (8 + level);
            }
            return (kills, loot, credits, false);
        }
    }
}
#endif
