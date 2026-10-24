# Next implementation batch — recommendation (Oct 17)

**Status:** recommendation only. Not approved. Does not change the active queue until Sam approves.

## Recommended next batch: BEST1 — Wandering enemy identity (verified defect)
- **Why first:** BESTIARY-01 found a verified defect. Wandering fights lose the bestiary record, so armor never applies (0 for all 45 types), the Codex never unlocks from Wandering (0 entries), and duplicated names display the wrong tier record. Balance numbers tuned on this pipeline would describe armor-less, misidentified enemies. BALANCE-02 should be re-run on top of the repair.
- **Scope:** carry the existing `bestiaryId`, `tier` and `armor` from the picked bestiary record on every Wandering encounter (`ZI._bgZombie`, `game/wandering.js`). Same pool, same single rng draw.
- **Explicitly out:**
  - renames;
  - new ids;
  - bestiary `spd` or `traits` in escape or initiative (separate design decision: the speed scales don't match);
  - armor or damage types (WEAP-ARMOR-01 stays parked);
  - headshots;
  - any balance value.
- **Acceptance checks:** the regression tests in `bestiary-01-enemy-identity-findings.md` §6:
  - id and tier on every event, with identical pick sequences;
  - `id 38` / `id 39` resolve correctly;
  - armor reaches `enemyStatBlock`;
  - Codex unlocks once;
  - T1/T2 and the full suite pass;
  - H2 hashes re-baselined and documented.
- **Needs Sam's approval:**
  - the production change and its outcome effects (armor at tier B+, Codex Discovery XP);
  - the split-equivalence label;
  - the H2 re-baseline.

## After BEST1 (design decisions, not implementation)
1. Sam sets an active-exploration target alongside the 2–5 Downings/day target (BALANCE-02 §10).
2. Re-run BALANCE-02's candidate set on the repaired build. Leading directions:
   - encounter interval about 60 s;
   - cap2-like tier gating;
   - 70% hit chance;
   - smaller low-HP event;
   - venture and walking stress review;
   - then carry capacity.
3. Only then draft a balance batch.
