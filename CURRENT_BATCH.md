# CURRENT_BATCH — STAT-02: Progression Curve, Stat Picks & Status States

**Status (Oct 29):** Live. Step 3 applied (Sam's H6–H10 answers plus the audit). Open: no repeatable food source (AUDIT §6), the 24 → 30 ranks change needs Sam's OK, and the RMAT income check against the Auto-Eat price. Oct 29 proposals (rust retired, consumable-only healing, save hardening) are recorded in `reports/proposals-2026-10-29/REPORT.md`; they are not part of this contract.


**Batch ID:** STAT-02 (proposed)
**Source of truth:** "Stat Progression — Addendum v4" plus the decisions locked by voice on Oct 28, 2026 (listed below)
**Target:** E:\Zed_Idler (Unity / C#)
**Handoff:** Copy this contract into CURRENT_BATCH.md. Save the report to reports/STAT-02/.

## Scope change (Sam decision)

The main draft and Addendum v4 said "no live-game changes". **Sam has now asked for these systems to be implemented in the game code.** That guard is lifted for this batch only. Before overwriting any existing XP, stat or save logic, Code must report what it found in the existing code (Design Handoff), and must keep save migration safe.

## Goal

Implement the locked progression maths, the stat-pick system and the status-state system as configurable data-driven systems.

## Decided behaviour

### 1. XP curve
- XP to next level at level L = `a × 1.065^L`, with `a ≈ 906.1`. Total XP from L1 to L100 is about 7,557,000.
- XP comes from **active play only**: regular encounters, elites/bosses, objectives/discoveries.
- Source budget per active hour: 60% / 25% / 15% of 25,190 XP. Per-event values use the phase table in Addendum v4. All values configurable (ScriptableObject or a JSON config).

### 2. Core stats and ranks
- 10 core stats: Max HP 40→60, HP Regen 10→20, Shield 50→80, Armor 0→40%, Evasion 1→25%, Damage 1.00→1.30×, Crit Chance 1→35%, Crit Damage 2.00→3.00×, Attack Speed 100→150%, Move Speed 1.07→1.25×.
- Store an **integer rank** from 0 to 24 per stat. Never accumulate rounded increments.
- Derived value: `start + (cap − start) × (1 − (1 − r/24)^k)` with **k = 1.5 for all stats** (single global config value; allow a per-stat override field, unused for now).
- Keep base, level ranks, gear and temporary effects as separate components in the stat index.

### 3. Stat picks
- **Levels 2–35:** a standard pick on even levels only. **Levels 36–100:** a standard pick every level.
- **Checkpoint bonus picks** at levels **10, 20, 35, 50, 70, 85, 90, 95, 100**, each from a fresh offer.
- Each offer shows 3 distinct uncapped stats. Capped stats never appear.
- **Soft pity on offers:** each stat has a hidden miss counter that goes up by 1 each offer it is not shown and resets to 0 when shown. Draw weight = `1 + 0.35 × misses`, weighted sampling without replacement. The value 0.35 is configurable.

### 4. Front-facing display (hidden formulas)
- Upgrade cards show the stat name and rounded before → after values only (for example "Max HP 44 → 45"). **Never show ranks, k or formulas in the UI.**
- Stat tooltip shows a breakdown (Base / Level / Gear / Effects) as numbers only.

### 5. Status states
- Tracks and tiers (labels shown, stat effects hidden):
  - Hunger: Well Fed / Peckish / Hungry / Starving
  - Rest: Rested / Tired / Fatigued / Exhausted
  - Wounds: Healthy / Scratched / Wounded / Badly Hurt
  - Sickness: Healthy / Queasy / Sick / Feverish
  - Morale: Steady / Uneasy / Shaken
- Each tier applies hidden stat modifiers (values configurable; Code proposes placeholder values in the report and does not invent final balance).
- **Compounding:** each additional active negative state multiplies all negative modifiers by +15%. Each additional positive state multiplies positive modifiers by +15%. The same rate both ways; the rate is configurable.
- **Time:** states progress on the world clock both online and offline.
- **Offline (app closed):** the character self-manages: eats from supplies, sleeps at camp, tends wounds. Offline states can **never go past the mild tier** (for example Hungry, never Starving; Wounded, never Badly Hurt). Respect the existing 24-hour offline progress cap from CLOCK-01.
- The away screen shows a short summary (for example "Ate twice, slept well, used 3 rations").

## Likely files (Code to confirm)
Progression / XP manager, stat definitions and stat index, level-up offer UI, status-state manager, offline progress handler, away screen, save data.

## Acceptance checks
- The XP table reproduces Addendum v4 totals within rounding (L50 ≈ 310,033; L90 ≈ 4,018,874; L100 ≈ 7,557,000).
- No offer has duplicate stats or capped stats. Checkpoint levels give exactly two picks.
- Rank 24 equals the cap exactly. Rank math stays integer in the save data.
- Headless simulation (at least 2,000 runs) with the damage-first build gives a median Damage cap around level 90, with ≤ ~12% of runs never capping. Balanced and survival builds never cap before level 100.
- Two stacked negative states produce a larger penalty than the sum of each alone; the same holds for positive states.
- An offline period with zero supplies never produces a severe tier.
- No UI surface shows ranks, k, pity weights or modifier formulas.

## Explicitly out
- Discovery journal (feature 4) — not designed yet.
- Final balance values for status modifiers.
- ALC-01 drunk / hangover states (parked; will plug into the status system later).
- Task duration sync.

## Required verification
- Report what existing XP, stat and save logic was replaced, plus the save-migration approach.
- Attach the simulation output and the placeholder modifier table to reports/STAT-02/.
- Raise a Design Handoff instead of inventing design for anything unclear.