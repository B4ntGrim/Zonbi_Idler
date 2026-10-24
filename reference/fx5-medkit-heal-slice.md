# Zed Idler — FX5 Medkit Heal (Slice Brief)

**Status:** **CLOSED Oct 15** (`reference/archive/fx5-batch.md`; report `handoff/to-design/FX5_COMPLETION_REPORT.md`). Sam authorized finding and fixing in one pass (Oct 15). Cause: the rest step rebuilt HP from its start value and erased any heal used while resting.
**Source:** `playtest-findings-oct15.md` PF2.

---

## 1. Next slice
Fix the Field Medkit so a use at low HP actually restores HP. **Why now:** H2 measures how policies survive; heals come before revive and Forced Retreat in the Downed order (spec §13.8), so a heal that logs but doesn't land would distort every heal-dependent H2 run.

## 2. Decided constraints `[DECIDED Oct 15]`
- PF2 is fixed in its own batch, **FX5, before H2**.
- Code investigates **read-only first** (step 1) and changes nothing until Sam locks the fix.
- **Why:** the cause isn't known yet (heal resolving to 0, HP overwritten after the write, or a use path broken by FX4 or JD1a), and the right fix depends on it.

## 3. Rules the fix must keep (from existing decisions; no new design)
- Heal amounts, charges and the shared heal rule (FX4) stay as they are; only the defect is fixed. No balance change.
- HP floor 1 and the Downed order (U5, U27) unchanged.
- JD1a: the Fort-bound Med Kit stays a story item that can't heal; `takeMedKit` still takes it first for the Fort.
- The display-only `hpLag` (Oct 10 HP-bar fix) never writes engine HP.

## 4. Open decisions (after step 1)
- **D-FX5a** `[DECIDED Oct 15]` (Sam: "find the bug and fix it"): a heal above the rest curve restarts the curve from the healed HP.
- **D-FX5b** `[PROPOSED]` no refund for kits or charges already lost (recommended; not built). Sam may overrule.

## 5. Spec impact
None expected (a defect against existing rules). If step 1 shows the spec is silent on who owns the HP write on item use, Design adds one line to §9.

## 6. Step 1 contract (this is `CURRENT_BATCH.md`)
See `CURRENT_BATCH.md`. Questions TQ-FX5a–d = PF2 questions 1–4.
