# CURRENT_BATCH — TRAV-01a: Honest buttons (Traversal)

**Source:** `reference/trav-01-traversal-slice.md` §7. If this file and the slice disagree, stop and ask.
**Status:** **LOCKED by Sam (Oct 21).** Ready for Code.
**Decisions:** T1, T2, T4, T5, T10, T11 (P1–P3), T13 `[DECIDED Oct 21]` (slice §2, §3, §3a).
**Findings covered:** PF5, PF6, PF7 (afflictions part), PF8, PF10 in `reference/playtest-findings-oct15.md`.
**Follow-on:** TRAV-01b (familiarity and camp) and CLOCK-01 (slower clock) are **not** part of this batch.

**Goal.** Every Traversal action has a clear effect, a limit and a visible result. Solo players see no Camp Leader controls.

## Decided behavior (all `[DECIDED Oct 21]`)

1. **Scout charges (T1, T10).** The survivor has **5 scout charges per real day** (data-table value `TRAVERSAL_SCOUT_CHARGES_PER_DAY = 5`; 10 will be tested later). Each Traversal Scout spends 1. Charges refill once per real day at the player's local midnight, the same reset the deliberate Rest uses. Online and offline behave the same.
2. **Scout XP limit (P1).** Stealth XP from a Traversal Scout is granted only for the **first scout of a given cell per real day**. With 0 charges the Scout button is shown **greyed with the reason** (for example "No scout charges left today. Refills at midnight."), never hidden.
3. **Hide reveals what's lurking (T2, P2).** Hide on a cell lists the **number and kinds** of zombies there, each linked to its Codex entry. Each kind shown is marked **sighted** in the Codex: name, tier and danger label become visible. **Full stats still unlock only when that zombie is fought** (existing decided Codex rule).
4. **Hide limits (P3).** Hide takes a short time (data-table value) and grants Stealth XP once per cell per real day.
5. **Afflictions on Traversal (T4).** The area that currently lists available survivors shows the survivor's **active afflictions** instead, each with its icon: Injured (with real time left, labelled as real time), Broken, and any others that exist in code today. Afflictions not yet in code (hunger, the djinn curse) are **not** added by this batch; the area must simply show them once they exist.
6. **No Camp Leader controls in Solo (T5).** In Solo Survivor, remove the available-survivors list and the **Scavenge, Contracts, Training, Patrol and Raid** buttons. Camp Leader keeps them (no change there).
7. **Loot stays on Traversal (PF6).** Looting a cell shows its result on Traversal and does **not** open the Routes screen. Loot rules themselves are unchanged in this batch.
8. **Zone details panel (T13).** Selecting a cell opens one panel on every platform:
   - Mouse: hover shows a **one-line preview** only (name, familiarity, danger); **click** opens the full panel beside the map.
   - Touch: **tap** opens the full panel as a **bottom sheet**; tap elsewhere or swipe down closes it.
   - Controller: moving the highlight shows the preview; **confirm** opens the full panel.
   - Panel lines: Familiarity · Loot (safety % and size, or "Looted") · Danger (threat level) · Lurking (zombies sighted by Hide, with Codex links) · Features (water, Fort, Church, Workshop, camp — whatever exists in code) · On a route (only if route data exists; otherwise omit the line) · Actions (Scout, Hide, Loot, Make camp, each with its cost or the greyed reason).
   - **Route mode toggle:** a visible toggle. While it's on, a tap or click adds the cell to the route instead of opening the panel. If no route-building code exists yet, ship the toggle **disabled with the reason** "Route builder coming soon" rather than leaving a dead control. (The route builder itself is ROUTE-01, not this batch.)
9. **Unchanged:** loot amounts and safety, familiarity rules, camp rest, the game clock, combat, save version unless a new key is needed (report it).

## Likely files

Traversal screen and actions (`screens-v3.jsx` Traversal section; Traversal action handlers) · world-cell state · Codex data (new `sighted` flag) · save keys for scout charges, per-cell daily XP and sighted entries · new `tests/trav-01a.test.js` · `CODE_STATE.md`. **Not** Wandering combat, crafting, or the game clock.

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

1. A new real day gives 5 scout charges; each Traversal Scout spends 1; at 0 the button is greyed with the reason.
2. Scouting the same cell twice in one real day grants Stealth XP once; a different cell the same day grants it again.
3. Charges refill at the player's local midnight; an offline return across midnight refills them once, not once per missed day beyond the 24 h cap rules.
4. Hide on a cell lists the zombie count and kinds; each kind is marked sighted in the Codex (name, tier, danger), and its full stats stay locked until fought.
5. Hide grants Stealth XP once per cell per real day.
6. In Solo, the available-survivors list and the Scavenge, Contracts, Training, Patrol and Raid buttons are absent; in Camp Leader they are unchanged.
7. The afflictions area shows each active affliction with its icon; Injured shows real time left labelled as real time.
8. Looting a cell shows the result on Traversal and does not open Routes.
9. Selecting a cell opens the zone panel by click (mouse), tap as a bottom sheet (touch) and confirm (controller); hover shows only the one-line preview.
10. With Route mode on, a tap adds a cell to the route; with it off, a tap opens the panel. If no route code exists, the toggle is disabled with its reason and no tap is lost.
11. Every action in the panel shows its cost or a greyed reason; no action button does nothing.
12. **Regression:** all suites pass; existing saves load with charges initialised to the full daily amount.

## Smoke test (Sam, TEST SAVE, after Code reports CLOSED)

1. Scout one cell until charges run out; confirm the greyed reason and that XP came once for that cell.
2. Hide in a cell; open the Codex and find the sighted entries.
3. Confirm Traversal in Solo has no Camp Leader section and shows afflictions instead.
4. Loot a cell; confirm you stay on Traversal.
5. Open the zone panel by clicking a cell; if possible, check the bottom sheet on a phone-sized window.

## Explicitly out

Familiarity effects and camp rest (TRAV-01b) · the clock change and Year/Day display (CLOCK-01) · the route builder (ROUTE-01) · Camp Leader controls · FOOD-01 and anything about hunger · loot amount or safety changes.

## Required verification

Step 1 report (`handoff/to-design/TRAV-01a_STEP1_REPORT.md`) · completion report with each check's result (`TRAV-01a_COMPLETION_REPORT.md`) · `TRAV-01a: CLOSED` or `NOT CLOSED`.
