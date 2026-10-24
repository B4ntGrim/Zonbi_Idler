# Zed Idler — Design Handoff (Oct 16)

**Read first:** `CLAUDE_DESIGN_RULES.md`, then this file, then `reference/00-document-index.md`.
**Replaces:** the Oct 15 handoff, archived as `archive/design-handoff-oct15.md`.
**Active batch:** **H2**, locked Oct 15; **steps 0–3 done, stopped for review** (`handoff/to-design/H2_DRY_RUN_REPORT.md`). Unchanged today.

---

## 1. Decisions made (Oct 16)

- **A1 `[DECIDED Oct 16]`** AMMO-12 stays at weapons Phase 6 (W6 stands).
- **A2 `[DECIDED Oct 16]`** AMMO-12's Phase A audit items fold into the weapons Phase 1 read-only audit, so ammo conflicts surface early.
- **Player Intent Preservation Invariant** (Sam's team) added to AMMO-12 as a `[PROPOSED]` addendum: 7 rules + acceptance sequence (proposed test A25). Notes I1–I4.
- **LR1 `[DECIDED Oct 16]`** One shared loadout resolver for watched combat, offline simulation, repairs and save loading. It reads saved intent plus current eligibility and computes the effective loadout; nothing else does. Folds into AMMO-12 v1.3. Regression group LR-01–LR-09 drafted `[PROPOSED]`, required before implementation. Phase 1 audit adds: list every place that computes equipped state today.
- **PF3 logged** (Sam, screenshot): the craft progress bar (Runner's Cloak, 120 min) doesn't keep pace with the game clock. Suspected one-clock defect; questions for Code in `playtest-findings-oct15.md`. Fix batch FX6 `[PROPOSED]`, after H2 step 4.
- **AMMO-12 filed** (Sam: "put this review draft into our queue of batches"). The team draft *Ammunition, Recovery & Loadout Systems* v1.2 is now `reference/parked/ammo-12-ammunition-loadout-draft.md`, `[PARKED]` until weapons Phase 6 (Ranged combat), per W6. The original text is kept verbatim under Claude Design's intake notes A1–A9 (queue placement, first conflict check, teaching note).

## 2. Where the build stands

**CLOSED:** H1 · FX1–FX5 · CB1 · RB1 · RB2 · JD1a. The Jester rules exist with the switch off for players.
**Queue:** **H2** (80 runs) → JD1b (Jester scene) → weapons Phase 1 read-only audit → weapons Phases 2–5 (Data, Persistence, Progression, Balance) → weapons Phase 6 Ranged combat (**input: AMMO-12**; its own Phases A–F run inside Phase 6, each with GO/NO-GO).

## 3. Files changed (Oct 16)

| File | Change |
|---|---|
| `reference/parked/ammo-12-ammunition-loadout-draft.md` | **New**; parked draft + intake notes; A1/A2 decided; invariant addendum; LR1 + test group LR |
| `reference/weapons-development-directive.md` | Related line points to AMMO-12; §5 audit scope A2 and LR1 `[DECIDED Oct 16]` |
| `reference/playtest-findings-oct15.md` | PF3 added |
| `reference/00-document-index.md` | Parked row, directive row, decisions log, archive row |
| `DESIGN_HANDOFF.md` | This file; Oct 15 handoff archived as `archive/design-handoff-oct15.md` |

## 4. Open questions

**For Sam (when convenient):** lock the Player Intent Preservation Invariant (recommended; I1 folds it into §13, I2 makes it test A25), or leave it proposed until Phase 6 · Accept test group LR as drafted · PF3/FX6 timing: after H2 step 4 (recommended) or before · LR-a: recompute the effective loadout on load rather than save it (recommended).
**For Sam (later):** PF1 option (after H2 measures it) · D-FX5b refund (default no) · Fort-bound Med Kit display values (copied from Field Medkit) · AMMO-12 §20's 14 open decisions plus A3 (firearms already in saves), all at Phase 6.
**For Sam (now, carried):** run H2 step 4 (the 80-run baseline) as-is (recommended), or decide PF1 first.
**For Code:** PF3 questions 1–5 (read-only) · R1 still needs `BATCH R1: CLOSED` (POI framework blocked until then) · Q3 XP decay floor evidence.
**Carried, unchanged:** tutorial spec fold-in of the Jester decisions; U24 Jester guardrail session; audit §2 A–E; Church and Workshop counts per grid; distance scaling; Code's four world-grid questions; duplicate H1 acceptance reports.

## 5. Next step

Sam reviews the H2 dry run (`H2_DRY_RUN_REPORT.md`) and says go for step 4, the 80-run baseline. AMMO-12 waits for weapons Phase 6.
