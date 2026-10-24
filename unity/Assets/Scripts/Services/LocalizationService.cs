// Assets/Scripts/Services/LocalizationService.cs
using System;
using System.Collections.Generic;
using System.Text;
using UnityEngine;

namespace ZedIdler.Services
{
    /// <summary>
    /// Lightweight key→value localization with CSV source tables, English
    /// fallback, ICU-style plural rules, and {0} argument substitution.
    /// Locale is applied on next launch (per design): the active locale is
    /// read from PlayerPrefs at Awake; <see cref="SetLocale"/> writes the pref
    /// but does not live-refresh.
    /// </summary>
    /// <remarks>
    /// CSV format (Resources/Localization/strings.csv):
    ///   key,en,es,fr,de,pt-BR,ja,ko,zh-Hans
    ///   ui.play,Play,Jugar,Jouer,Spielen,Jogar,プレイ,플레이,开始
    ///
    /// Plural keys use suffixes resolved by <see cref="GetPlural"/>:
    ///   contracts.count.one  = "{0} contract"
    ///   contracts.count.other= "{0} contracts"
    /// ICU categories supported: zero, one, two, few, many, other.
    /// </remarks>
    [DisallowMultipleComponent]
    public sealed class LocalizationService : MonoBehaviour, ILocalizationService
    {
        public const string LocalePrefKey = "locale";
        public const string DefaultLocale = "en";

        [SerializeField] private TextAsset csvTable;          // optional inspector slot
        [SerializeField] private string resourcesPath = "Localization/strings";
        [SerializeField] private string[] supportedLocales = { "en", "es", "fr", "de", "pt-BR", "ja", "ko", "zh-Hans" };

        private readonly Dictionary<string, Dictionary<string, string>> _table
            = new Dictionary<string, Dictionary<string, string>>(); // key -> (locale -> value)
        private string[] _localeColumns;
        private string _activeLocale = DefaultLocale;

        public string ActiveLocale => _activeLocale;
        public IReadOnlyList<string> SupportedLocales => supportedLocales;
        public event Action<string> OnLocaleChanged;

        private void Awake()
        {
            DontDestroyOnLoad(gameObject);
            _activeLocale = PlayerPrefs.GetString(LocalePrefKey, DefaultLocale);
            LoadTable();
            ServiceLocator.Register<ILocalizationService>(this);
        }

        private void OnDestroy() => ServiceLocator.Unregister<ILocalizationService>();

        // ─── Loading ──────────────────────────────────────────────────────────
        private void LoadTable()
        {
            var asset = csvTable != null ? csvTable : Resources.Load<TextAsset>(resourcesPath);
            if (asset == null)
            {
                Debug.LogWarning("[Localization] No CSV table found; keys will return raw.");
                return;
            }
            ParseCsv(asset.text);
        }

        private void ParseCsv(string csv)
        {
            _table.Clear();
            var lines = csv.Split('\n');
            if (lines.Length == 0) return;

            // Header: key,en,es,...
            _localeColumns = SplitCsvLine(lines[0]);
            for (int i = 1; i < lines.Length; i++)
            {
                if (string.IsNullOrWhiteSpace(lines[i])) continue;
                var cells = SplitCsvLine(lines[i]);
                if (cells.Length < 2) continue;
                string key = cells[0].Trim();
                if (string.IsNullOrEmpty(key)) continue;
                var perLocale = new Dictionary<string, string>();
                for (int c = 1; c < _localeColumns.Length && c < cells.Length; c++)
                {
                    string locale = _localeColumns[c].Trim();
                    perLocale[locale] = cells[c];
                }
                _table[key] = perLocale;
            }
        }

        // Minimal CSV splitter honoring quoted fields with embedded commas.
        private static string[] SplitCsvLine(string line)
        {
            var result = new List<string>();
            var sb = new StringBuilder();
            bool inQuotes = false;
            for (int i = 0; i < line.Length; i++)
            {
                char ch = line[i];
                if (ch == '"')
                {
                    if (inQuotes && i + 1 < line.Length && line[i + 1] == '"') { sb.Append('"'); i++; }
                    else inQuotes = !inQuotes;
                }
                else if (ch == ',' && !inQuotes) { result.Add(sb.ToString()); sb.Clear(); }
                else if (ch == '\r') { /* skip */ }
                else sb.Append(ch);
            }
            result.Add(sb.ToString());
            return result.ToArray();
        }

        // ─── Lookup ───────────────────────────────────────────────────────────
        public string Get(string key)
        {
            if (string.IsNullOrEmpty(key)) return key;
            if (_table.TryGetValue(key, out var perLocale))
            {
                if (perLocale.TryGetValue(_activeLocale, out var v) && !string.IsNullOrEmpty(v)) return v;
                if (perLocale.TryGetValue(DefaultLocale, out var en) && !string.IsNullOrEmpty(en)) return en; // fallback
            }
            return key; // raw-key fallback
        }

        public string Format(string key, params object[] args)
        {
            string template = Get(key);
            if (args == null || args.Length == 0) return template;
            try { return string.Format(template, args); }
            catch { return template; }
        }

        // ─── Pluralization (ICU categories) ───────────────────────────────────
        public string GetPlural(string baseKey, int count, params object[] args)
        {
            string category = PluralCategory(_activeLocale, count);
            // Try exact category, then "other", then base key.
            string key = $"{baseKey}.{category}";
            if (!_table.ContainsKey(key)) key = $"{baseKey}.other";
            if (!_table.ContainsKey(key)) key = baseKey;

            string template = Get(key);
            var allArgs = new object[1 + (args?.Length ?? 0)];
            allArgs[0] = count;
            if (args != null) Array.Copy(args, 0, allArgs, 1, args.Length);
            try { return string.Format(template, allArgs); }
            catch { return template; }
        }

        /// <summary>
        /// Returns ICU plural category for a locale + count. Implements the
        /// common rules for the launch locales; defaults to English rules.
        /// </summary>
        public static string PluralCategory(string locale, int count)
        {
            int n = Mathf.Abs(count);
            string lang = locale.Split('-')[0];
            switch (lang)
            {
                case "ja":
                case "ko":
                case "zh":
                    return "other"; // no plural distinction
                case "fr":
                    return (n == 0 || n == 1) ? "one" : "other";
                case "ru":
                {
                    int mod10 = n % 10, mod100 = n % 100;
                    if (mod10 == 1 && mod100 != 11) return "one";
                    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
                    return "many";
                }
                // en, es, de, pt-BR all share the simple one/other rule.
                default:
                    return n == 1 ? "one" : "other";
            }
        }

        // ─── Locale switching (apply on next launch) ──────────────────────────
        public void SetLocale(string locale)
        {
            if (string.IsNullOrEmpty(locale)) return;
            PlayerPrefs.SetString(LocalePrefKey, locale);
            PlayerPrefs.Save();
            // NOT live-applied: takes effect on next launch (per design).
            OnLocaleChanged?.Invoke(locale);
        }

        public bool IsLocaleSupported(string locale)
        {
            foreach (var l in supportedLocales) if (l == locale) return true;
            return false;
        }
    }

    public interface ILocalizationService
    {
        string ActiveLocale { get; }
        IReadOnlyList<string> SupportedLocales { get; }
        event Action<string> OnLocaleChanged;

        string Get(string key);
        string Format(string key, params object[] args);
        string GetPlural(string baseKey, int count, params object[] args);
        void SetLocale(string locale);
        bool IsLocaleSupported(string locale);
    }
}
