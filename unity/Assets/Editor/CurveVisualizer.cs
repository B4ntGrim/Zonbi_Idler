// Assets/Editor/CurveVisualizer.cs
#if UNITY_EDITOR
using UnityEditor;
using UnityEngine;
using ZedIdler.Data;

namespace ZedIdler.Editor
{
    /// <summary>
    /// Editor window that plots the three balance curves designers care about:
    ///   1. XP-per-level + cumulative XP (from BalanceConfig formula)
    ///   2. RMAT drop-rate vs zombie tier
    ///   3. Marketplace price vs demand
    /// Pure GL line drawing — no Play mode required.
    /// </summary>
    public sealed class CurveVisualizer : EditorWindow
    {
        private enum Curve { XpPerLevel, CumulativeXp, DropRateVsTier, PriceVsDemand }
        private Curve _curve = Curve.XpPerLevel;
        private BalanceConfig _config;
        private Material _lineMat;

        [MenuItem("ZedIdler/Curve Visualizer")]
        public static void Open() => GetWindow<CurveVisualizer>("Curve Visualizer");

        private void OnEnable()
        {
            var shader = Shader.Find("Hidden/Internal-Colored");
            _lineMat = new Material(shader) { hideFlags = HideFlags.HideAndDontSave };
        }

        private void OnGUI()
        {
            _config = (BalanceConfig)EditorGUILayout.ObjectField("Balance Config", _config, typeof(BalanceConfig), false);
            _curve = (Curve)EditorGUILayout.EnumPopup("Curve", _curve);
            EditorGUILayout.HelpBox(Describe(_curve), MessageType.Info);

            var rect = GUILayoutUtility.GetRect(position.width - 20, position.height - 110);
            DrawGraph(rect);
        }

        private static string Describe(Curve c) => c switch
        {
            Curve.XpPerLevel     => "XP required to advance each level. Should ramp smoothly without a cliff.",
            Curve.CumulativeXp   => "Total XP to reach a level. The shape of long-term grind.",
            Curve.DropRateVsTier => "RMAT drop probability by zombie tier. Should reward deeper play.",
            Curve.PriceVsDemand  => "Effective market price multiplier vs demand (0.5×–1.5× band).",
            _ => ""
        };

        private void DrawGraph(Rect r)
        {
            if (Event.current.type != EventType.Repaint) return;
            GUI.BeginClip(r);
            GL.PushMatrix();
            GL.Clear(true, false, Color.clear);
            _lineMat.SetPass(0);

            // Background
            GL.Begin(GL.QUADS);
            GL.Color(new Color(0.12f, 0.11f, 0.10f, 1f));
            GL.Vertex3(0, 0, 0); GL.Vertex3(r.width, 0, 0); GL.Vertex3(r.width, r.height, 0); GL.Vertex3(0, r.height, 0);
            GL.End();

            // Axes
            GL.Begin(GL.LINES);
            GL.Color(new Color(0.4f, 0.38f, 0.34f, 1f));
            GL.Vertex3(30, r.height - 20, 0); GL.Vertex3(r.width - 10, r.height - 20, 0); // x
            GL.Vertex3(30, 10, 0); GL.Vertex3(30, r.height - 20, 0);                       // y
            GL.End();

            // Data
            int n = 64;
            float[] vals = new float[n];
            for (int i = 0; i < n; i++) vals[i] = Sample(_curve, i / (float)(n - 1));
            float max = Mathf.Max(0.0001f, MaxOf(vals));

            GL.Begin(GL.LINE_STRIP);
            GL.Color(new Color(0.78f, 0.66f, 0.40f, 1f));
            float gx0 = 30, gx1 = r.width - 10, gy0 = 10, gy1 = r.height - 20;
            for (int i = 0; i < n; i++)
            {
                float x = Mathf.Lerp(gx0, gx1, i / (float)(n - 1));
                float y = Mathf.Lerp(gy1, gy0, vals[i] / max);
                GL.Vertex3(x, y, 0);
            }
            GL.End();

            GL.PopMatrix();
            GUI.EndClip();

            // Axis labels (GUI, outside GL block)
            GUI.Label(new Rect(r.x + 4, r.y + 4, 120, 18), $"max {max:N0}");
            GUI.Label(new Rect(r.x + r.width - 80, r.y + r.height - 18, 80, 18), XAxisLabel(_curve));
        }

        private float Sample(Curve c, float t)
        {
            var cfg = _config;
            switch (c)
            {
                case Curve.XpPerLevel:
                {
                    int lvl = Mathf.Max(1, Mathf.RoundToInt(t * (cfg != null ? cfg.MaxLevel : 100)));
                    return cfg != null ? cfg.XpRequiredForLevel(lvl) : (lvl * 100 + lvl * lvl * 10);
                }
                case Curve.CumulativeXp:
                {
                    int lvl = Mathf.Max(1, Mathf.RoundToInt(t * (cfg != null ? cfg.MaxLevel : 100)));
                    return cfg != null ? cfg.CumulativeXpToReach(lvl) : lvl * lvl * 60;
                }
                case Curve.DropRateVsTier:
                {
                    // Synthetic exponential reward curve across 8 tiers.
                    int tier = Mathf.RoundToInt(t * 7);
                    return Mathf.Pow(1.6f, tier);
                }
                case Curve.PriceVsDemand:
                {
                    // 0.5 + demand/100, demand 0..100
                    float demand = t * 100f;
                    return 0.5f + demand / 100f;
                }
                default: return 0;
            }
        }

        private static string XAxisLabel(Curve c) => c switch
        {
            Curve.XpPerLevel     => "level →",
            Curve.CumulativeXp   => "level →",
            Curve.DropRateVsTier => "tier →",
            Curve.PriceVsDemand  => "demand →",
            _ => ""
        };

        private static float MaxOf(float[] v) { float m = 0; foreach (var x in v) if (x > m) m = x; return m; }
    }
}
#endif
