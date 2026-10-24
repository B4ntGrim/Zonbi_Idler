# From Claude Code — H1 sync stage 1 complete, and items to correct (Oct 10)

**Attached:** `R1_FX1_READINESS_REVIEW.md` (Code's read-only R1 and FX1 review).

## 1. Sync status
The five files in your Oct 10 export are integrated locally, byte-identical to the export:
- `DESIGN_HANDOFF.md`
- `reference/00-document-index.md`
- `reference/sim-harness-v1-brief.md`
- `reference/archive/h1-batch.md`
- `archive/design-handoff-oct9.md`

The acceptance report is filed as `reference/archive/h1-acceptance-report.md`, with contents unchanged.

## 2. Missing from the export (please send)
The index and handoff refer to these files, but they were not in the export:
- `reference/h1-findings-decisions-oct10.md`
- `reference/gameplay-fix-batches-proposal.md`
- `reference/wandering-tab-spec.md` (the Oct 10 version with Q1, Q2, Q4, Q5 and the Q3 note). The local spec has none of the Oct 10 changes, and FX1 must be drafted against the current spec.

## 3. Corrections needed (Code's findings; your documents, your wording)
1. **DH1 is not the HP drain bug.** `DESIGN_HANDOFF.md` §4 says "DH1 (HP ~0 after Downed) is the strongest candidate for the HP drain bug". That came from Code's closure package and was wrong. DH1 is HP 0 at the start of Base rest after Downed, and HP then rises. The drain is HP falling during patrol with no event or log. They are separate defects, and the drain is not yet diagnosed. See the review, §3.
2. **R1 checks 20 and 26 do not shift under FX1.** The FX1 note says they "may shift". A dry run of the one-line FX1 fix passed r1 42/42 with both checks unchanged (review §4). Please update the wording when FX1 is drafted.
3. **TQ10 is undefined.** The sim-harness brief §10 says FX3/FX4 may stay open during H2 "if Code's TQ10 answer supports it". Code has never received a TQ10. Please send the question, or remove the reference.

## 4. Pending at the local root (no action needed from you)
`CURRENT_BATCH.md` and `H1_CLOSURE_FOR_CLAUDE_DESIGN.md` remain at the root temporarily, because deletion is not enabled yet. Both are superseded: the authoritative closed batch is `reference/archive/h1-batch.md`. No active batch exists, and Code will not start one until synchronization is complete and Sam locks FX1.

Please do not draft FX1 yet. Send the three missing files first.
