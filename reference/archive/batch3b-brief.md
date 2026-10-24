# CURRENT BATCH — 3B: Forced Retreat Consequences

(Saved Oct 6 from Sam's final contract. Source of truth for Batch 3B; do not reconstruct from memory.)

## Goal
Create one canonical Forced Retreat consequence path in the shared Wandering simulation.
Current triggers: (1) Stress Breaking; (2) Downed after a lost fight with no successful recovery through the existing Heal/revive systems.
Do not begin Retreat Rules or any later system.

## SPEC STATUS
Batch-3A-conflicting spec passages are marked `[SUPERSEDED by Batch 3A …]` (14.4 overload, 14.7 0–100 carryCapacity, 15.2 overload multiplier). Do not implement from them.
The remaining `small loot loss` wording in 13.8 stays until 3B closes; where it conflicts, this batch governs (pre-approved, not a handoff).
`PARKED.md` contents are deferred, not requirements.

## DECIDED BEHAVIOR
**Definition:** the survivor can no longer stay in the field and is driven back to Base. The run ends; part of the haul may be lost. Involuntary; distinct from voluntary withdrawal.
**Triggers:** Stress Breaking; Downed without successful Heal/revive recovery.
**Not triggers by themselves:** low HP; zero Heal charges; overload; worn-out gear; voluntary withdrawal; successful revive.
**One canonical path** for both triggers in the shared simulation. No separate active Breaking and Downed loss systems. The screen never calculates consequences.

## HAUL LOSS
- **Base share:** 50%. Supersedes the old 10% Breaking loss, the "small loot loss" wording, and the historical Downed retention rule.
- **Scavenging modifier:** effective Scavenging, read at the Forced Retreat moment before any after-state mutation (for Breaking, before the Shaken reset). Endpoints: ≤1 → full base loss; ≥50 → zero; >50 clamped at zero.
- **Loss count:** N = eligible non-story haul entries (best item included in N).
  `lossCount = floor(N × baseLossShare × scavengingFactor)`; `actualLossCount = min(N − 1, lossCount)`. Do not recalculate after removing the protected item.
  At effective Scavenging 1: N 0→0, 1→0, 2→1, 3→1, 4→2, 5→2, 6→3.
- **Mid-level check:** at least one case (e.g. effective 25) must match the canonical factor.
- **Best-item protection:** the single most valuable eligible entry is always protected; value = the canonical Recycler/salvage value. Ties → earliest picked-up entry by stored pickup sequence (add a save-compatible sequence written at pickup if absent). Never infer order from display or array order.
- **Pickup-order migration:** older haul entries get a sequence from saved array order starting at 0; data-only; afterwards order comes only from the stored field.
- **Loss selection:** canonical seeded RNG; live and offline identical. Story/protected items never eligible.
- **Retained haul:** banked through the existing return/Recycler flow. No second destination or store.

## CARRIED ITEMS AND GEAR
Normal Forced Retreat never loses carried ordinary items, Med/Scout Kits, partially used kits (partial charges preserved), equipped gear, or story items. No extra durability damage. Harsher consequences belong to future Difficulty.

## DESTINATION AND AFTER-STATE
Returns immediately to Base (no withdrawal travel). Every Forced Retreat: ends the run; pressure 0; pending discovery → `left behind (forced retreat)`; applies haul loss; banks retained haul; returns to Base; begins existing timed Base rest; uses the existing resume-at-80%-HP behavior. No new minimum timer.
- **Breaking-specific:** stress reset to 60; reports Shaken.
- **Downed-specific:** no stress reset; preserves the run/fight stress; uses the resulting HP before Base rest.

## REVIVE
A successful revive consumes the revive item, prevents Forced Retreat, applies no haul loss, does not end the run, and keeps the existing shared revive behavior.

## FORT CARVE-OUT
A failed Fort guard attack must not trigger the generic Forced Retreat, the 50% loss, or a duplicate report. Add regression coverage. Do not redesign the Fort.

## REPEATED FORCED RETREATS
A long catch-up may contain several Forced Retreats; no new recovery timer. Each triggers exactly once, uses the state and haul present at that moment, has its own correctly ordered report, and stays equivalent across live/chunked/bulk. The repeated-Breaking spiral is a future Retreat Rules concern.

## REPORTING
Existing return-report/event system. Each result identifies at least: cause, destination, haul lost, protected/best item where useful, retained/banked haul, relevant resulting state. One canonical result per Forced Retreat; no duplicates from screen and simulation both observing it. Pending discoveries use `left behind (forced retreat)`.

## OLD DOWNED PATH AUDIT
Confirm the actual unrecoverable-combat path: whether the historical screen-owned Downed consequence exists, whether it is reachable, what currently handles lost combat with no recovery, whether any player path gets different consequences. Afterwards only one authoritative path. Retire/bypass only where reachability is proven; no broad cleanup.

## SAVE MIGRATION
3A left the schema at v4. The pickup-sequence migration bumps it to v5, data-only.

## CODE_STATE NOTE
Record: stress is stored in integer units of 1/5.184×10¹² of a point; the ×1.15 overload rate and one-off stress events round to this unit (canonical; no saved fractional remainder). (Final safeguards §9: record the current-state fact only; Unity storage-type instructions stay out unless already an authoritative rule.)

## ACCEPTANCE CHECKS
1. Breaking causes exactly one Forced Retreat.
2. Downed with no successful recovery causes exactly one Forced Retreat.
3. Successful revive: no Forced Retreat, no haul loss.
4. Low HP, zero Heal charges, overload, worn gear and voluntary withdrawal don't independently trigger it.
5. Base loss 50% before Scavenging.
6. Effective Scavenging: ≤1 full factor; ≥50 zero; >50 zero; effective 25 matches the canonical factor; rust lowering effective Scavenging raises loss; for Breaking, read before the Shaken reset. If impossible, STOP with a handoff.
7. Loss counts at effective 1: N=0→0, 1→0, 2→1, 3→1, 4→2, 5→2, 6→3.
8. The best-value eligible entry is never lost.
9. Equal-value ties protect the earliest pickup, by stored sequence.
10. Story items never lost.
11. Carried ordinary items, partial Med/Scout Kits and equipped gear untouched.
12. Breaking resets stress to 60; Downed does not.
13. Pending discovery → exactly one `left behind (forced retreat)`.
14. Live, uneven-chunk and bulk catch-up identical: trigger point, lost haul, protected entry, retained haul, destination, run state, stress, pressure, discovery result, report order.
15. Two or more Forced Retreats in one catch-up resolve separately and stay equivalent across chunk sizes.
16. A Fort guard-attack failure doesn't invoke the generic path.
17. Successful revive fully functional.
18. Old Downed path audited; one authoritative path.
19. Existing saves compatible; older haul entries get a deterministic sequence from saved order; schema v5; nothing else changes. (Safeguards §1: report version before/after and whether a migration was needed.)
20. Completed systems unchanged except as superseded.
21. After spec updates, no `[DECIDED]` 10% Breaking rule remains.

## REQUIRED VERIFICATION
batch3b, batch3a, batch2b, batch2a, equivalence, carrying, carrying-1b, Fort, load-regression, bug-fix; plus any materially touched subsystem. No closing with a failing regression.

## MANUAL TESTING
TEST SAVE only. Before any mutation verify title, test namespace, not the real game; otherwise STOP; never fall back to the real save. Write monitor on. Verify: a Breaking Forced Retreat; an unrecoverable Downed one if practical; the report shows cause and haul consequence; retained haul banks; carried items and partial kits intact; equipped gear intact; Wandering works, no new console errors.

## SPEC / SOURCE HIERARCHY
After implementation, mark the old 10% Breaking loss, "small loot loss" and historical Downed rule `[SUPERSEDED by Batch 3B]`.

## EXPLICITLY OUT
Dangerous Forced Retreat travel; Retreat Rules; Return Reserve; repeated-Breaking prevention; automatic withdrawal; Stamina; Afflictions; Difficulty; Hard-mode carried-item loss; extra equipment punishment; overload-triggered Forced Retreat; minimum recovery timers; Resource Priorities; Shop; Scheduling; Comfort; Church/PoIs; carrier/Rig/Med/Stim work. Nothing from R1 (two-condition redeployment, checkpoint recovery, stress 85, load 115%, HOLD/prompts, snoozes, automatic withdrawal).

## DESIGN HANDOFF RESOLUTIONS (Oct 6) [DECIDED]
- **Scavenging factor:** `forcedRetreatScavFactor(L) = scavDropRate(L) / DROP_MAX`. Don't change `scavDropRate()`; add a narrowly named helper. Checks: 1 → 1.00; 25 → the helper's own output (~0.51); 50 → 0; >50 → 0. `lossCount = floor(N × 0.50 × factor)`, `actualLossCount = min(N − 1, lossCount)`.
- **Save:** current v4, sequence absent; increment once to v5; data-only.
- **Canonical value:** `entry.value`, normalised like the Recycler (`max(1, value || 1)`); ties fall to pickup sequence.

## FINAL SAFEGUARDS (summary)
Transaction order: snapshot effective Scavenging → snapshot eligible haul and protected item → choose losses with seeded RNG → discovery `left behind (forced retreat)` → remove lost haul → bank retained → end run / pressure 0 → cause-specific state (Breaking → 60; Downed → no reset) → Base rest → exactly one report event. Exactly-once guard around the single entry point (one loss calculation, one banking, one pressure reset, one discovery interruption, one report, one rest transition). Tie-stability test across save/reload and display sorting. Report the old Downed path with file/function, reachability and the condition reaching it. SAVE section: title / namespace / real-page-excluded / outside-test writes / real save modified. Every suite listed individually plus focused tests.

## COMPLETION REPORT
STATUS · CHANGED · TESTS · MANUAL · SAVE · OLD DOWNED PATH · DEVIATIONS · DESIGN HANDOFFS · DEFERRED. End with `BATCH 3B: CLOSED` only if everything passes; then STOP.
