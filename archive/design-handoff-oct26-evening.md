# Design handoff — Oct 26 (evening)

**Replaces:** the Oct 26 morning handoff, archived as `archive/design-handoff-oct26-am.md`.
**Active batch:** `CURRENT_BATCH.md` = **CLOCK-01** (unchanged). **PF15 comes first** once Sam approves the fix direction.
**Source:** Google Docs "Zed Idler — Code Instructions Oct 26 — Addendum 3, 4, 5, 5b, 6, 6b", applied Oct 26 evening.

## 1. Decisions made (Sam, Oct 26 afternoon)
- **Conflicts settled:** encounter pacing base **90 s** (familiarity 60 / 90 / 135 s) · food comfort cap stays **5 per real day** · Well Nourished counts per **real day** · target **about three meals a real day** (mechanics open) · background finds **one per 90 s** · character XP **banks on every return**, watched or away · MS3 uses a **Fallow-clear proxy**, H2 scope unchanged.
- **Weight:** W-1 real-world weights per item type; rarity never changes weight (supersedes value-driven salvage weight). W-2 load above 50% of capacity slows movement by pace (walk −1%, jog −1.5%, run −2% per kg, proposed). Gem socketing parked for weapons.
- **Concordance CI14–CI18:** drop table (respirator 12%, sample case 7%, hazmat suit 4%, dart gun 1.5%, field scanner 0.5%; no pity counter) · repeat survey teams · frequency by distance (≈6 / 2 / 1 a day) · sample case +25% medical finds · identity (infection research; cure in public, control in private).
- **Fort:** the elder is **Elder Jerry**; dialogue tree (first draft) in Fort brief §12.2a.
- **TRAV-02:** daily Traversal movement cap by transport (2 / 3 / 5 / 8+), free until Fallow Ground is turned in; emergency withdrawals never count.
- **Codex "In development" tab:** developer-only. **ANIM-01:** richer Wandering animation (display only), after CLOCK-01 and BIOME-01. **Camp Leader assignment:** concept.

## 2. Files changed
`food-01-nutrition-slice.md` · `parked/food-02-cooking-concept.md` · `balance-03-round8-regen-oct21.md` · `wandering-design-audit.md` · `sim-harness-v1-brief.md` · `wandering-tab-spec.md` (§14.3, §14.4) · `weapons-development-directive.md` · `wandering-fort-scene.md` (§12.2a) · `trav-01-traversal-slice.md` (§2a) · `route-01-route-builder-concept.md` (R3) · `tutorial-first-session-spec.md` (§5) · `concordance-introduction-concept.md` (§2a) · `playtest-findings-oct15.md` (PF14–PF16) · `slice-retreat-broken-batch-a-draft.md` · `00-document-index.md` · `reports/level-12/LEVEL12_REPORT.md` · `reports/docs-oct26/` (PM pre-change copies, script, report) · this file; `archive/design-handoff-oct26-am.md`.

## 3. Open questions
**Sam (urgent):**
- **PF15 fix direction:** approve (1) Continue on the active file keeps live progress, (2) autosave on a timer and on page hide, (3) a close-and-reopen regression test. Until fixed, press **Save** in the top bar before closing, or progress is lost on Continue.
- **T18 vs TRAV-02 vs ST1:** three rules limit travel. Recommendation: drop T18 (travel stamina).

**Sam (other):**
- BAL-A closure: Broken gear, injury timer and the Solo-save T5 check, on a fresh test save after PF15; the 30-day H2 run; BAL-A scope note §4.
- Codex unlocks from Wandering need the B6 batch (`codexFromWandering = true`); the smoke-test "fail" was expected.
- Meals-target mechanics (after the round 8 rerun); then resize the food containers.
- NB1 nutrition bar mock-up; CI14 item stats and weights; Concordance CI4 modifiers and scene text.
- Circuit questions 15–24; C21 depends on FOOD-01 auto-eat; fish rarity split.
- Tier-band batch: Sam's data to parse, then the slice's open decisions.
- STOCK-01 tab set: proposed Recycler · Storage · Food vs the built Recycler · Storage · Gear & Loadout.
- Route noise vs PF13 noise 0–4 (reuse one scale).
- Carried: TRAV-01a 7-step smoke test; FOOD-02 C1–C6; djinn P10–P16 and curse values; RMAT as main currency beyond the Shop (Shop currency decided RMAT, Oct 25); ROUTE-01 transport sourcing; Rig pocket ratio (proposed 0.5); D2 travel stamina numbers.

**Code:** CLOCK-01 step 1 (rescaled durations); FOOD-01 O6 facts; STATS-01 save key and UI reference size; BALANCE-03 round 8 rerun; Stockpile one-second polling (mobile).

**Code (read-only first):** PF15 fingerprint test and fix proposal · W-3 (salvage weights and callers, rarity tiers incl. "relic", walk/jog/run constants) · FOOD-01 O6 with ST3 · round 8 rerun (90 s base, three-meals target) · ANIM-01 current-sway report · whether the test save should have a Jester starter weapon.

## 4. Next step
Sam approves the PF15 fix direction; Code fixes it before other batch work. Then a fresh test save for the remaining BAL-A checks.
