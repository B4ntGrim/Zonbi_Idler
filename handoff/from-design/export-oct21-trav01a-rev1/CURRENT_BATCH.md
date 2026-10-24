# CURRENT_BATCH — TRAV-01a: Honest buttons (Traversal)

**Source:** `reference/trav-01-traversal-slice.md` §7. If this file and the slice disagree, stop and ask.
**Status:** **LOCKED by Sam (Oct 21). Revised Oct 21 after the step-1 report:** Sam accepted Code's S1–S7 recommendations and Design's additions. Ready for step 2.
**Decisions:** T1, T2, T4, T5, T10, T11 (P1–P3), T13, T14–T17 `[DECIDED Oct 21]` (slice §2, §3, §3a, §3b).
**Findings covered:** PF5, PF6, PF7 (afflictions part), PF8, PF10 in `reference/playtest-findings-oct15.md`.
**Follow-on:** TRAV-01b (familiarity and camp) and CLOCK-01 (slower clock) are **not** part of this batch.

**Goal.** Every Traversal action has a clear effect, a limit and a visible result. Solo players see no Camp Leader controls.

## Decided behavior (all `[DECIDED Oct 21]`)

1. **Traversal scout charges (T1, T10, S1).** A **separate Traversal pool**, save key `zi_trav_scout`: **5 per real day** (data-table value `TRAVERSAL_SCOUT_CHARGES_PER_DAY = 5`). Each Traversal Scout spends 1. Refill once per real day at the player's local midnight (`ZI._localDayKey`); an offline return across one or more midnights refills once, to the full daily amount. The UI names it clearly, for example "Traversal scouts 3/5 today". **Wandering's scout charges are unchanged.**
2. **XP limits, once per cell per real day (P1, P3, S4, T14).** Scout (Stealth), Hide (Stealth/Athletics) and **Travel (Athletics)** each grant XP only for the first time per cell per **real** day. At 0 charges the Scout button is **greyed with the reason** ("No Traversal scouts left today. Refills at midnight."), never hidden.
3. **Hide shows what Wandering will actually use (T2, S2).** Hide on a cell shows the cell's **threat level** and the **tier range Wandering can currently draw** (from `ZI._bgZombie`'s existing rule), for example "Threats here: tiers F–E". It must not name zombie kinds or counts, because cells don't hold zombie lists yet. **No Codex "sighted" marking in this batch** (it comes with the tier-band batch, when cells own their zombies). Hide advances the world clock by `TRAV_HIDE_GAME_HOURS = 1`.
4. **Afflictions on Traversal (T4, S5).** The area that currently lists the fake survivors shows the survivor's active afflictions, reusing the Wandering header icons (Broken first, then Injured). Injured shows its remaining time labelled **"play time left"** (it counts down only while the game is open). Afflictions not yet in code are not added.
5. **No Camp Leader controls in Solo (T5, S7).** In Solo (`ZI.getActiveSlot().mode`), remove: the fake survivors list; the Scavenge, Contracts, Training, Patrol and Raid buttons and their map tabs; the **Dispatch** button; the **"Assigned"** row; the **"Expected yield"** text. Camp Leader is unchanged.
6. **Loot stays on Traversal (PF6, S6).** The Traversal tutorial's last step points at **Wandering** instead of Routes after Loot. **A reload of a Solo save opens on Traversal**, not Routes (HTML boot screen; both HTML pages are now in the file list). Loot rules are unchanged.
7. **Make camp is no longer a free, unlimited full heal (T15).** Make camp **no longer sets HP to full or resets `healsUsed`**. Its Command XP is granted once per real day. Everything else it does stays (camp cell, saved-return clearing, world clock). *Why now:* it is the same exploit class as Scout. Camp's real benefit (faster stress rest at the Cot rate, paid with camp food) arrives in TRAV-01b.
8. **Deploy is honest (T16).** On Routes, when stamina is too low, **Deploy is disabled** and shows its reason; it no longer looks clickable.
9. **Zone details panel (T13).** One panel on every platform, opened by selecting a cell:
   - Mouse: hover shows a **one-line preview** (name, familiarity, danger); **click** opens the full panel.
   - Touch: **tap** opens the panel as a **bottom sheet**; tap elsewhere or swipe down closes it.
   - Controller: moving the highlight shows the preview; **confirm** opens the panel.
   - Lines: Familiarity (`ZI.cellFamiliarity`) · Loot (safety % from `ZI.lootSafeChance` and size, or "Looted") · Danger (threat level) · Threats (Hide's tier range, once hidden) · Features (Fort, Fallow Ground, camp, start: only those that exist) · Actions (Scout, Hide, Loot, Make camp, Travel, each with its cost or the greyed reason, including "Too far — move next to it" for other cells). The "On a route" line is omitted until routes exist.
   - **Route mode toggle** ships **disabled with the reason** "Route builder coming soon".
10. **Unchanged:** loot amounts and safety, familiarity rules, camp rest rates, the game clock rate, combat, Wandering charges, save version (new keys read as "full / nothing yet" when missing).

## Likely files

`screens-v3.jsx` (Traversal section, tutorial targets, Routes Deploy) · `game/stats.js` (XP limits) · `game/world.js` (read-only helpers) · `Zombie Idler v2.html` and `Zombie Idler v2 - TEST SAVE.html` (Solo boot screen only) · save keys `zi_trav_scout` and per-cell daily XP · new `tests/trav-01a.test.js` · `CODE_STATE.md`. **Not** Wandering combat, Wandering charges, crafting, the Codex unlock rule, or the game clock rate.

## Steps

- **Step 0, baseline:** run all suites; preserve a copy of the current build for a differential; record hashes of the files above.
- **Step 1, investigation (read-only).** Answer with file:line evidence:
  - **TQ-T1** What Traversal **Scout** does today: charges, XP amount, cooldown, effect on the cell (PF5).
  - **TQ-T2** What **Hide** does today and what data exists about zombies present in a cell (PF8).
  - **TQ-T3** What **Loot** does today, why it navigates to Routes, and where the "safe %" (for example 61%) comes from (PF6).
  - **TQ-T4** What **Make camp** does today: cost, effects, where the camp cell is stored (needed later for TRAV-01b).
  - **TQ-T5** Which Routes buttons have no handler (PF6), and whether any route-building code exists (for the toggle).
  - **TQ-T6** Which afflictions exist in code today, and which code renders the available-survivors section.
  - **Stop and report** if any answer changes the plan above, or if a change is needed outside the likely files.
- **Step 2:** implement behaviors 1–8.
- **Step 3:** add the tests below; run the full regression.

## Acceptance checks (new suite `tests/trav-01a.test.js`)

1. A new real day gives 5 Traversal scouts; each Traversal Scout spends 1; at 0 the button is greyed with the reason; Wandering's scout charges are unaffected.
2. Traversal scouts refill at local midnight; an offline return across one or more midnights refills once, to 5.
3. Scout, Hide and Travel each grant XP once per cell per real day; a different cell the same day grants it again.
4. Hide shows the cell's threat level and the tier range Wandering can draw at that moment; the range matches `ZI._bgZombie`'s rule for the same state.
5. Hide advances the world clock by 1 game hour and names no zombie kinds or counts.
6. In Solo: no fake survivors list, no Scavenge/Contracts/Training/Patrol/Raid buttons or map tabs, no Dispatch, no "Assigned" row, no "Expected yield". In Camp Leader all are unchanged.
7. The afflictions area shows Broken and Injured with the Wandering icons; Injured's time is labelled "play time left".
8. After Loot, the tutorial's last step points at Wandering; reloading a Solo save opens on Traversal (both HTML pages).
9. Make camp leaves HP and `healsUsed` unchanged; its Command XP is granted once per real day; the camp cell is still stored.
10. Deploy is disabled with its reason when stamina is too low.
11. The zone panel opens by click (mouse), tap as a bottom sheet (touch) and confirm (controller); hover shows only the one-line preview; every action shows its cost or a greyed reason; the Route mode toggle is disabled with its reason.
12. **Regression:** all suites pass (baseline 605/605); existing saves load with Traversal scouts at 5.

## Smoke test (Sam, TEST SAVE, after Code reports CLOSED)

1. Scout one cell until Traversal scouts run out; confirm the greyed reason and that XP came once for that cell.
2. Hide in a cell; confirm it shows the threat level and tier range.
3. Confirm Traversal in Solo has no Camp Leader section and shows afflictions instead.
4. Loot a cell; confirm you stay on Traversal.
5. Make camp with low HP; confirm HP does not jump to full.
6. Reload the save; confirm it opens on Traversal.
7. Open the zone panel by clicking a cell; if possible, check the bottom sheet on a phone-sized window.

## Explicitly out

Familiarity effects and camp rest (TRAV-01b) · per-cell zombie lists, Hide naming kinds, and Codex sighted entries (tier-band batch) · Codex unlock rule (Codex Option B) · the clock change and Year/Day display (CLOCK-01) · the route builder (ROUTE-01) · Camp Leader controls · FOOD-01 and anything about hunger · loot amount or safety changes.

## Required verification

Step 1 report (`handoff/to-design/TRAV-01a_STEP1_REPORT.md`) · completion report with each check's result (`TRAV-01a_COMPLETION_REPORT.md`) · `TRAV-01a: CLOSED` or `NOT CLOSED`.
