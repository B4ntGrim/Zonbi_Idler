# Zombie Idler — Design Decision Handoff
**Project:** Simulation Harness v1 / H1–H2  
**Status:** Five decisions locked; one pending technical verification  
**Audience:** Claude Design  
**Purpose:** Reconcile newly discovered gameplay issues without expanding or invalidating H1.  
**Recorded:** Oct 10. Source text as supplied by Sam (complete).

## 1. Authoritative Design Decisions

### Q1 — Minimum Survivor HP
**Status: [DECIDED]**

Survivor HP must never fall below **1**, including during Downed states, forced retreat, base rest, and recovery.

The HP minimum applies consistently across watched gameplay, offline catch-up, and headless simulation.

**Implementation requirements:**
- Investigate the existing Downed HP behavior reported as DH1.
- Identify why `restStartHp` can become 0 and produce fractional HP below 1.
- Correct the responsible gameplay path in a dedicated bug-fix batch.
- Add regression tests covering Downed, forced retreat, rest, recovery, and repeated simulation steps.
- Preserve existing maximum HP, healing rules, and other unrelated survival mechanics.

Do not silently introduce this fix as part of H1.

### Q2 — Offline 24-Hour Cap
**Status: [DECIDED]**

A single player return may process **no more than 24 hours of accumulated gameplay time**, including previously carried or unprocessed simulation time.

The cap applies to the total amount processed during the return, not separately to each source of elapsed time.

**Implementation requirements:**
- Investigate DH2 and the `_carryMs` accumulation behavior.
- Establish how carried time is counted against the 24-hour allowance.
- Ensure repeated processing within one return cannot bypass the limit.
- Preserve legitimate simulation progress without granting more than 24 hours per return.
- Define how excess time is retained or discarded based on existing progression rules; do not invent a new carry-retention policy without approval.
- Test consecutive absences, interrupted processing, large carried remainders, and ordinary 24-hour catch-up.

Implement in a separate gameplay correction batch.

### Q3 — XP Decay Floor
**Status: [PENDING — TECHNICAL VERIFICATION]**

No final gameplay decision is authorized yet.

Claude Code reported that `settleSkillDecay` can reduce XP below an intended floor or below zero.

Before proposing a fix, Claude Code must establish:

1. The exact existing XP-floor rule.
2. The authoritative specification section defining it.
3. Whether the floor applies to total XP, current-level XP, individual skill XP, or another tracked value.
4. Whether the floor changes with survivor level or skill progression.
5. Which code paths violate the rule.
6. The smallest correction that would enforce the existing design.

Claude Design must present the verified rule and any genuine conflict for approval.

**Do not assume zero is the correct floor. Do not implement an XP decay fix yet.**

### Q4 — Buff Expiration During Offline Catch-Up
**Status: [DECIDED]**

Buff effects and expiration must be evaluated using the **simulation timestamp associated with the gameplay step being processed**.

A buff remains available for every eligible simulated moment before its expiration and stops applying when simulated time reaches its expiration.

**Implementation requirements:**
- Unify buff-effect evaluation and buff expiration around the appropriate simulation time.
- Prevent real-time cleanup from prematurely removing buffs that should still affect unprocessed simulated gameplay.
- Preserve existing buff durations, effects, stacking rules, and balance.
- Test expiration boundaries, long absences, carried simulation time, watched gameplay, and offline catch-up.
- Define and verify cleanup behavior after all eligible simulation steps have completed.
- Ensure this behavior does not grant buffs beyond their intended duration.

Implement this as a separate gameplay consistency fix, not an unapproved H1 change.

### Q5 — Screen-Dependent Survivor Attributes
**Status: [DECIDED]**

Gameplay calculations for survivor movement speed and healing effectiveness must live in **shared game-rule functions**, rather than depending on the Wandering screen to write those values into gameplay state.

Both watched and offline simulation must use the same authoritative calculations.

**Implementation requirements:**
- Identify the complete inputs currently used to calculate `moveSpeed` and `healPct`.
- Move the authoritative calculation into reusable game logic.
- Make the Wandering screen consume those calculated values rather than independently defining them.
- Ensure headless simulation uses the same rules.
- Preserve existing modifiers from equipment, buffs, stims, skills, and any other verified inputs.
- Validate ordinary new saves, equipment changes, buffs, healing, offline progression, and existing saves.
- Avoid introducing gameplay balance changes.

Implement in a separate shared-rules batch with regression tests.

### Q6 — H2 Starting Survivor Scenarios
**Status: [DECIDED]**

H2 must run **both starting scenarios**, with results clearly separated.

**Scenario A — Authentic New Save**
- Begin with the actual new-save survivor.
- Do not grant equipment or capacity unavailable at game start.
- Preserve the real overload, withdrawal, rest, recovery, and redeployment rules.
- Report whether the survivor becomes trapped in repeated overload/recovery cycles.

**Scenario B — Starter Carrier Fixture**
- Begin with the same underlying survivor and gameplay rules.
- Provide a carrier as an explicit, simulation-only fixture.
- The carrier must be a real, existing item with its normal capacity and effects.
- Clearly record the item, starting inventory difference, and resulting load capacity.
- Do not modify the actual game starting inventory or grant players free equipment.

Both scenarios must:
- Use reproducible seeds.
- Preserve the four-policy baseline.
- Run under Normal difficulty unless a later specification authorizes otherwise.
- Run for 30 simulated days per configuration.
- Produce distinct results and comparative summaries.

**The starter-carrier scenario is a test fixture, not a change to actual new-player progression.**

## 2. Preserve H1 Boundaries

H1's reported automated results are:

- Existing regression checks: 415/415.
- New clock/RNG checks: 19/19.
- R1 check 15: 25/25 repeat executions passing.
- Differential testing: no unexpected gameplay-state differences reported.

H1 remains **NOT CLOSED** until the outstanding browser save-isolation check is completed and accepted.

> **Superseded Oct 10:** H1 CLOSED; the browser check passed. See `archive/h1-acceptance-report.md`.

Do not merge Q1, Q2, Q4, or Q5 gameplay fixes into H1 retroactively.

Keep their corrections as separately tracked implementation batches with their own test requirements.

## 3. Unresolved Technical Questions

Preserve the following questions for Claude Code.

**TQ1 — Downed HP**
Does DH1 reproduce during normal watched gameplay as well as accelerated simulation? What precise code path violates the minimum HP rule?

**TQ2 — Carried Offline Time**
How does `_carryMs` accumulate across absences and return calls? What minimal change enforces the strict 24-hour per-return limit without losing legitimate partial progress?

**TQ3 — XP Floor**
What is the exact authoritative XP-floor rule, and which decay paths violate it?

**TQ4 — Buff Timing**
Which buff creation, lookup, expiration, cleanup, and stacking paths require changes to honor simulated-time evaluation?

**TQ5 — Shared Survivor Attributes**
What are all inputs and dependencies for `moveSpeed` and `healPct`? Which shared-rule functions should own them?

**TQ6 — H1 Coverage**
Were there any potential H1 behavioral differences outside the differential test coverage, particularly during real browser execution and timed buffs?

**TQ7 — Split-Equivalence Contract**
How should the contradictory `ZI.now()` export requirements in DH4 be reconciled while preserving existing test expectations?

**TQ8 — Save Isolation**
Does the fingerprint test access the same storage origin and relevant save keys as the actual game and test-save builds?

**TQ9 — Separate Fixes**
Which discovered issues can be corrected independently, and what regression tests are required for each?

**TQ10 — H2 Readiness**
Which issues must be corrected before H2 results can be considered valid, and which may remain documented limitations?

Do not infer answers that require inspecting the actual code or authoritative specifications.

## 4. Required Work From Claude Design

1. Record Q1, Q2, Q4, Q5, and Q6 as `[DECIDED]` in the appropriate authoritative specifications.
2. Record Q3 as `[PENDING — TECHNICAL VERIFICATION]`.
3. Preserve all existing unrelated locked decisions.
4. Identify and report any conflicts with earlier specifications rather than silently overriding them.
5. Create separate, logically ordered bug-fix batch proposals for Q1, Q2, Q4, and Q5.
6. Preserve the unconfirmed XP-floor issue until Code returns evidence.
7. Update the H2 scenario specification to include both starting conditions.
8. Identify any H2 acceptance tests affected by the expanded scenario coverage.
9. Keep H1 open until its final browser verification is complete. *(Done: H1 CLOSED Oct 10.)*
10. Do not implement code or authorize a gameplay change beyond the decisions explicitly locked above.

## 5. Expected Deliverables

Return:

- A decision integration summary showing the exact authoritative documents updated.
- A list of specification conflicts, if any.
- A proposed order for the separate gameplay correction batches.
- The technical questions that must go to Claude Code.
- An updated H2 scenario matrix including both starting fixtures.
- Any remaining questions requiring user approval.
- Confirmation that H1, gameplay bug corrections, and H2 remain separately tracked.

**Stop after preparing the updated specifications and proposed implementation sequence. Do not start code implementation.**

---

**Integration (Oct 10):** see `reference/gameplay-fix-batches-proposal.md` for where each decision was recorded, the conflicts found, the proposed batch order, the questions for Code and the H2 scenario matrix.
