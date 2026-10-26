# Design handoff — Oct 26

**Replaces:** the Oct 25–26 handoff, archived as `archive/design-handoff-oct25-26.md` (its decisions stay recorded in the documents; open items carried below).
**Active batch:** `CURRENT_BATCH.md` = **CLOCK-01** (unchanged).
**Source:** Google Docs "Zed Idler — Code Instructions Oct 26", "… Addendum" and "… Addendum 2", applied Oct 26 afternoon.

## 1. Decisions made (Sam, Oct 26)
- **BAL-A B1–B6** (`slice-retreat-broken-batch-a-draft.md` §3b): Downings per km is the main target, field time ≥ about 50% as guardrail · rule 5 closed · raise T0 durability for an 8 h absence (later batch) · automatic repair `[PARKED]` · Broken mild for now · Codex Option B (BEST1 dependency met).
- **FOOD-01 F1–F18, O3a/O3c, ST1–ST2** (`food-01-nutrition-slice.md` §3b): top bar shows real values · auto-eat lowest value first, comfort food above stress 70, Shop unlock for variety first · fruit values and Foraging unlocks (5 / 10 / 12) as variants of existing encounters · comfort food (raisins −3, oranges −2, cola −5) · empty cans, background finds, the last can at 0.02% once per save · hidden "number one" achievement (waits on FOOD-02) · one healing path · five food groups (concept) · Well Nourished buff and icon · lunch bag 6 / pack 12 / cooler 28 meals · 60 s encounter pacing with familiarity scaling · stamina is the hunger state's combat effect (no separate meter). F6 parked. NB1 layered bar `[PROPOSED]` until Sam sees the mock-up.
- **MS1–MS2:** Fallow Ground turn-in is the first milestone; one-time chapter card "Chapter One: Fallow Ground". Sealed Crate beat kept; the elder is not the Elder Jester; name open. MS3 proposed.
- **Concordance CI1–CI13** (`concordance-introduction-concept.md`).
- Earlier today (already applied): circuit decisions C10–C21.

## 2. Files changed
- `reference/slice-retreat-broken-batch-a-draft.md` (§3b) · `reference/food-01-nutrition-slice.md` (§3b, P6, §4) · `reference/parked/food-02-cooking-concept.md` (§1b) · `reference/wandering-tab-spec.md` (§2.3 note, 13.4, 13.8, 14.1) · `reference/wandering-fort-scene.md` (§12.2) · `reference/tutorial-first-session-spec.md` (Beat 8) · `reference/sim-harness-v1-brief.md` (§12) · `reference/wandering-design-audit.md` (§6) · `reference/balance-03-round8-regen-oct21.md` (§6) · new `reference/concordance-introduction-concept.md` · `reference/00-document-index.md`.
- `reports/level-12/LEVEL12_REPORT.md` (new) · `reports/docs-oct26/` (pre-change copies, scripts, report) · this file; `archive/design-handoff-oct25-26.md`.

## 3. Open questions
**Sam — conflicts found while applying (Oct 26):**
- **Pacing O3a:** 60 s chosen; round 8 recommended 90 s because 60 s gives about 21–24% steady-state field time, under the band. Keep 60 s for the rerun, or move the base to 90 s?
- **F5 food stress cap:** −10 per day (Oct 26) vs **5 per real day** decided and audited Oct 21 (FOOD-02 §1a, §2b; the Lunch Pail raises it to 8). Which stands?
- **F15 day unit:** a game day is 24 real minutes, so "3 food groups in one game day" is unreachable at about 11 meals a real day. Use a real day (or rolling 24 real hours)?
- **F11 find rate:** one per 10 game minutes = one per 10 real seconds, about 8,600 metal and XP grants a real day. Pick a rarer rate in the economy audit.
- **MS3:** H2 excludes Fort scenes (D3), so it can't see the milestone without a scope change or a proxy.
- **Level-12:** character XP banks only from the Downed overlay button (`screens-v3.jsx:2736`). Decide where it should bank (recommended: every return and offline settlement). See `reports/level-12/LEVEL12_REPORT.md`.

**Sam — other open:**
- BAL-A closure: TEST SAVE smoke test (reminder 6 PM today); the 30-day H2 run; review of the BAL-A report scope note §4. Audit notes in BAL-A §3b (Broken release about 58% forced; injury parity exception).
- NB1 nutrition bar: see the mock-up, then lock.
- Elder's name; Concordance CI4 modifiers, scene text, CI6 gear item.
- Circuit questions 15–24; C21 depends on FOOD-01 auto-eat.
- Fish rarity split (80 / 17 / 3, proposed).

**Carried from earlier handoffs (Sam):**
- Tier-band batch: Sam's data to parse, then the slice's open decisions.
- STOCK-01 tab set: proposed Recycler · Storage · Food vs the built Recycler · Storage · Gear & Loadout.
- Route noise vs PF13 noise 0–4 (reuse one scale).
- Carried: TRAV-01a 7-step smoke test; FOOD-02 C1–C6; djinn P10–P16 and curse values; RMAT as main currency beyond the Shop (Shop currency decided RMAT, Oct 25); ROUTE-01 transport sourcing; Rig pocket ratio (proposed 0.5); D2 travel stamina numbers.

**Code:** CLOCK-01 step 1 (rescaled durations); FOOD-01 O6 facts; STATS-01 save key and UI reference size; BALANCE-03 round 8 rerun; Stockpile one-second polling (mobile).

## 4. Next step
Sam settles the four conflicts above (pacing, food cap, day unit, find rate), runs the smoke test, then the 30-day H2 run closes BAL-A. Code's next read-only items: FOOD-01 O6 (with ST3) and the round 8 rerun with the Oct 26 inputs.
