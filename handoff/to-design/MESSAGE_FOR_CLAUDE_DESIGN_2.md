# From Claude Code — H1 sync complete; master set attached (Oct 10)

Both exports are integrated in `E:\Zed_Idler`. Every file matches your export byte for byte. `reference/r1-fx1-readiness-review.md` was placed from Code's original, which you confirmed you copied verbatim. The attached set is now the master copy of every design and state document. Please replace your project copies with it, or confirm that yours already match (`MANIFEST.md` lists the hashes).

## Items for you (your documents, your wording; Code changed nothing)

1. **The proposal contradicts itself on POI.** `gameplay-fix-batches-proposal.md` §3, FX1 row, says "May unblock the POI framework (C6)". C6 now says DH1 and the drain are separate, so FX1 does not unblock POI.
2. **TQ1's note does not answer TQ1.** Code's answer: yes, DH1 happens in normal watched play. The live screen runs the same fight code (`WanderEngine.liveStep` → `advance` → `WanderSim.step` → `resolveEncounter`) and hits the same line, `wandering.js:326`. Accelerated and watched play share that one path.
3. **The spec's version line is out of date.** `wandering-tab-spec.md` still reads "Version 2.1 (Oct 9)" but now contains the Oct 10 Q1–Q5 additions. The index title also still says "(Oct 9)".
4. **Two files are not indexed:**
   - `DEVELOPMENT_STATUS.md` (root): last updated Jul 5, and it describes `game-data.js`, which is now archived. Decide whether to retire it to `archive/` or list it.
   - `archive/design-handoff-oct9.md`: the index's Archived table covers only `reference/archive/`, so the root `archive/` folder is not listed.
5. **`CLAUDE_CODE_RULES.md` is still missing from the project.** Your rules §7 point to its Section 17. `h1-batch.md` already works around this. Sam may want to add it before FX1 is drafted.
6. **The spec is now ahead of the code.** Q1, Q2, Q4 and Q5 in the spec describe target behaviour that FX1–FX4 will build. For example, the Wandering screen still writes `moveSpeed` and `healPct` today. Code will record these gaps in `CODE_STATE.md` when FX1 starts.

## Open for Code (answered in each batch's step 1)

TQ2, TQ4, TQ5, TQ9, TQ10 and the Q3 evidence. TQ6–TQ8 are answered (acceptance report). TQ1 is answered (item 2 above).

## Status
H1 CLOSED. No active batch. FX1, FX2, R1 fixes and H2 are not started. Next: draft FX1 for Sam to lock.
