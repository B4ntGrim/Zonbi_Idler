# Design handoff — Oct 25

**Replaces:** the Oct 24 handoff, archived as `archive/design-handoff-oct24.md` (its open items are carried below).
**Active batch:** `CURRENT_BATCH.md` = **CLOCK-01** (unchanged).

## 1. Decisions made (Sam, Oct 25)
- `[DECIDED Oct 25]` **Circuit decisions C1–C8** (`reference/circuit-expedition-concepts.md`, Decisions): C1 real-time duration with game time in small text · C2 repeat by default · C3 "one loop only" toggle, a Shop unlock for in-game currency · C4 a stopping circuit finishes at its start cell; emergencies (e.g. very low HP) retreat straight home · C5 first stop rules: low HP, high stress, full pack (weather and threat after BIOME-01) · C6 rest through the night by default; free toggle to keep travelling at night at higher risk · C7 priority HP → stress → pack · C8 return report: loops completed, stops visited, ending rule, hauls to claim. Still not a build input.
- `[DECIDED Oct 25]` **C9 one repeat rule:** once circuits take over Idle run, C2/C3 supersede the tutorial spec's "Auto-Repeat is a Shop unlock" (6.1); until then predefined Routes keep it. Resolves the Auto-Repeat conflict.
- `[DECIDED Oct 25]` **Circuit details:** C6a night rest 22:00–06:00 game time (8 game hours, starting value; matches Make camp's 06:00 wake) · C6b night travel +25% encounters (starting value; the e-bike's −25% offsets it) · C8 report order: headline (loops, ending rule) → one line per stop (cell, kills, loot, repeats grouped) → notable events only (Downing, discovery, forced retreat) → haul total with Claim All.
- `[DECIDED Oct 25]` **C6c one night window:** night is 22:00–06:00 game time game-wide; dusk 19:00–22:00 and 06:00–08:00. Why: one window everywhere; night ends at Make camp's 06:00 wake.
- `[DECIDED Oct 25]` **C6c placement:** the night/dusk code change goes in a small follow-up batch after CLOCK-01 closes. CLOCK-01 stays locked.
- `[DECIDED Oct 25]` **Shop currency is RMAT.**
- `[DECIDED Oct 25]` **C3 price:** "one loop only" costs 10 Tier 2 (Refined) RMAT, starting value; the economy check tunes it. Why: a convenience, not relief (lead brief 5.1), so modest; Tier 2 means the player has run a few circuits first.

## 2. Files changed
- `reference/circuit-expedition-concepts.md` (Decisions section; open questions 1, 4, 9, 11 marked answered).
- `reference/route-01-route-builder-concept.md` (§3 pointer to C1–C8).
- `reference/parked/retreat-rules-shop.md` (Shop also holds "one loop only").
- `reference/biome-01-chunks-slice.md` (Cold Exposure note: circuits rest at night by default, C6).
- `reference/00-document-index.md` (circuit entry, decisions log, reports row, date).
- `reference/tutorial-first-session-spec.md` (6.1 lines 182, 268, 362: C9 supersession note).
- `DESIGN_HANDOFF.md` (this file); `archive/design-handoff-oct24.md`.
- `reports/docs-oct25/` (pre-change copies, apply script, report).

## 3. Open questions
**Code (new, Oct 25):**
- **C6c code change, not yet applied:** `screens-v2.jsx` lines 41–42: `isNight = gameHour >= 22 || gameHour < 6`; `isDusk = (gameHour >= 19 && gameHour < 22) || (gameHour >= 6 && gameHour < 8)`. `ZI.TIME_STAT_MODS.night` follows. Goes in a small follow-up batch after CLOCK-01 closes `[DECIDED Oct 25]`; CLOCK-01 stays locked.

**Sam (new, Oct 25):**
- Remaining circuit open questions (2, 3, 5–8, 10, 12–24).

**Carried from Oct 24:**
**Sam:**
- Tier-band batch: Sam's data to parse, then the slice's open decisions.
- STOCK-01 tab set: proposed Recycler · Storage · Food vs the built Recycler · Storage · Gear & Loadout.
- Route noise vs PF13 noise 0–4 (reuse one scale).
- BAL-A: TEST SAVE check (who runs it).
- Carried: TRAV-01a 7-step smoke test; FOOD-01 O3 and fish rarity; FOOD-02 C1–C6; djinn P10–P16 and curse values; RMAT as main currency beyond the Shop (Shop currency decided RMAT, Oct 25); ROUTE-01 transport sourcing; Rig pocket ratio (proposed 0.5); D2 travel stamina numbers.

**Code:** CLOCK-01 step 1 (rescaled durations); FOOD-01 O6 facts; STATS-01 save key and UI reference size; BALANCE-03 round 8 rerun; Stockpile one-second polling (mobile).

## 4. Next step
After CLOCK-01 and BIOME-01 close, draft a small Solo circuit slice built on C1–C8. 