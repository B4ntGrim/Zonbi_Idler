// Assets/Scripts/Systems/CombatLog.cs
using System;
using System.Collections.Generic;
using UnityEngine;

namespace ZedIdler.Systems
{
    /// <summary>
    /// Scrollable combat log with an executable command parser.
    /// Lives inside the Wandering tab's Combat Log sub-menu (spec section 6).
    /// </summary>
    /// <remarks>
    /// The log keeps the most recent <see cref="MaxEntries"/> lines in memory.
    /// Commands are submitted via <see cref="Submit"/>; the parser dispatches to
    /// <see cref="ICombatCommandHandler"/> implementations registered by the host
    /// (typically <see cref="CombatSystem"/>).
    /// </remarks>
    [Serializable]
    public sealed class CombatLog
    {
        public const int MaxEntries = 200;

        private readonly List<LogEntry> _entries = new List<LogEntry>(MaxEntries);
        private ICombatCommandHandler _handler;

        public IReadOnlyList<LogEntry> Entries => _entries;

        /// <summary>Fired whenever a new entry is appended. UI subscribes here.</summary>
        public event Action<LogEntry> OnEntryAppended;

        /// <summary>Bind the handler that resolves executable commands.</summary>
        public void BindHandler(ICombatCommandHandler handler) => _handler = handler;

        /// <summary>Append a non-command log line.</summary>
        public void Append(string text, LogChannel channel = LogChannel.Info)
        {
            var entry = new LogEntry { channel = channel, text = text, utcTicks = DateTime.UtcNow.Ticks };
            _entries.Add(entry);
            if (_entries.Count > MaxEntries) _entries.RemoveAt(0);
            OnEntryAppended?.Invoke(entry);
        }

        /// <summary>
        /// Submit raw user input. If the input starts with '/' or matches a known
        /// command, it's routed to the handler; otherwise it's logged as chat.
        /// </summary>
        public void Submit(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return;
            string trimmed = raw.Trim();

            // Always echo the command itself so the user sees what was sent.
            Append($"> {trimmed}", LogChannel.Command);

            string verb;
            string[] args;
            ParseCommand(trimmed, out verb, out args);

            if (verb == "clear")
            {
                _entries.Clear();
                return;
            }
            if (verb == "help" || verb == "?")
            {
                Append("commands: force_win, add_xp <amount>, spawn <type>, set_hp <value>, show_stats, clear", LogChannel.Info);
                return;
            }

            if (_handler == null)
            {
                Append("(no command handler bound)", LogChannel.Warning);
                return;
            }
            var result = _handler.HandleCommand(verb, args);
            if (!string.IsNullOrEmpty(result.message))
                Append(result.message, result.success ? LogChannel.System : LogChannel.Warning);
        }

        private static void ParseCommand(string raw, out string verb, out string[] args)
        {
            string s = raw.StartsWith("/") ? raw.Substring(1) : raw;
            var parts = s.Split(new[] { ' ' }, StringSplitOptions.RemoveEmptyEntries);
            if (parts.Length == 0) { verb = ""; args = Array.Empty<string>(); return; }
            verb = parts[0].ToLowerInvariant();
            args = new string[parts.Length - 1];
            Array.Copy(parts, 1, args, 0, args.Length);
        }
    }

    public enum LogChannel
    {
        Info     = 0,  // descriptive lines: turn order, scrolling encounters
        Hit      = 1,  // player attacks
        Damage   = 2,  // damage taken
        Crit     = 3,  // critical strikes
        Kill     = 4,  // zombie defeated
        Loot     = 5,  // loot drops
        Defeat   = 6,  // player defeated
        Command  = 7,  // echoed command input
        System   = 8,  // executable command output
        Warning  = 9,  // failed commands / config issues
    }

    [Serializable]
    public struct LogEntry
    {
        public LogChannel channel;
        public string text;
        public long utcTicks;
    }

    /// <summary>
    /// Implemented by <see cref="CombatSystem"/> (or test stubs) to resolve
    /// executable commands typed into the combat log.
    /// </summary>
    public interface ICombatCommandHandler
    {
        CommandResult HandleCommand(string verb, string[] args);
    }

    public struct CommandResult
    {
        public bool success;
        public string message;
        public static CommandResult Ok(string m)  => new CommandResult { success = true,  message = m };
        public static CommandResult Err(string m) => new CommandResult { success = false, message = m };
    }
}
