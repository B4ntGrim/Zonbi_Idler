# Batch R1: Baseline Retreat Rules (final, for Claude Code)

**Precondition:** Batch 3B reports `BATCH 3B: CLOSED`.

**Amendment from the Claude Design final (Oct 6):** Base rest uses the player's current bed tier through `restBed()`; checkpoint rest uses the Bedroll rate. This changes Section D and acceptance checks 20 and 25. Nothing else differs from the Design final.

---

## R1 ADDENDUM — check 25 and Section D (Oct 6) `[DECIDED]`

Bed tiers are not implemented. `restBed()` always returns the Bedroll rate.

- Section D: Base rest recovers stress through `restBed()`. Today that is
  the Bedroll rate (−20/day). When bed tiers are built, Base rest uses them
  through `restBed()` with no R1 change. Checkpoint rest stays at the Bedroll
  rate.
- Check 25 is replaced by: checkpoint rest and Base rest both get their
  stress rate from `restBed()` (one source of truth); checkpoint rest is
  fixed at the Bedroll rate. Do not add bed-tier state, fields or tests.
- Bed tiers stay a future feature (spec 13.8); add a row to PARKED.md.

---

## A. Final behavior summary

**When the rules apply:** only during normal field activity, never while withdrawing or resting. They are checked whenever one of their inputs changes and at every exact boundary in H.

**The rules:**

- **HP rule:** HP below the floor (default 30%) and no Heal charges remain (base and kit).
  - Exact integer comparison: `hp × 100 < F × maxHp`.
  - Strictly less-than: exactly at the floor does not fire.
- **Stress rule:** stress ≥ the ceiling (default 85).
- **Load rule:** load ≥ the limit (default 115%).

**Fixed priority:** HP → Stress → Load. When several rules are true at the same moment, the first is the primary trigger.

**What a firing rule does:** it starts the existing voluntary withdrawal to the last valid checkpoint, never a Forced Retreat. R1 does not change the withdrawal's destination.

**At the checkpoint:**

- the haul is banked through the existing return and Recycler flow `[DECIDED, B2]`;
- the run ends and snoozes clear;
- the survivor enters the existing rest state at the checkpoint.

**Forced Retreat (Batch 3B), unchanged:** it returns immediately to Base with the Batch 3B consequences. Breaking resets stress to 60.

**Redeployment gate,** after every automatic recovery (checkpoint rest after a withdrawal, or Base rest after a Forced Retreat): the patrol resumes only when **HP ≥ 80% and stress < 50**. There is no minimum timer.

**Watching:** the real interactive Wandering screen is selected and the page is foreground-visible.

- Watching: a firing rule opens a prompt and HOLD (C).
- Not watching (a background tab, the hidden layout copy, or offline catch-up): no prompt and no HOLD; the withdrawal starts immediately.

---

## B. Settings and UI

**Location:** a collapsed "Retreat Rules" panel on the Wandering screen.

**Editable settings:**

- HP floor: 10–60%, or Off;
- stress ceiling: 51–95, or Off;
- load limit: 100–125%, or Ignore.

**Validation on load and save:**

- a stress ceiling of 50 or less, or a malformed value, is clamped to 51;
- a missing value defaults to 85;
- other settings are clamped into their ranges.

**Read-only line:** "Resume when HP ≥ 80% and stress < 50".

**When a change applies:** at the next rule check. An open prompt is unaffected.

**Data table:** every number lives there: defaults, ranges, snooze steps, the 20 s timer, resume thresholds, the checkpoint rest stress rate and the priority order.

---

## C. Prompt/HOLD state machine

1. **A rule fires during patrol.**
   - Not watching: withdraw and record the causes (F).
   - Watching:
     - if a discovery prompt is open, close it and record `left behind (withdrew)`;
     - show the primary-trigger prompt, e.g. "Pack heavy (115%): bank and return?";
     - enter HOLD.
2. **During HOLD.**
   - Paused: movement, new encounters (including policy encounters), new discovery rolls, and travel stress.
   - Still running: the 20 s timer, timed buffs and debuffs, decay clocks and other passive timers, and cleared-ground stress recovery.
   - Another rule becomes true: it is ignored for this prompt.
   - Stress reaches 100: the prompt and HOLD are cancelled, and Breaking runs the Forced Retreat at once.
3. **The prompt resolves.**
   - Return now, or the timer runs out: HOLD ends and the withdrawal begins.
   - Push on: HOLD ends, every rule that is true at that moment is snoozed (E), and the patrol resumes.
4. **Watching stops mid-prompt** (another tab, leaving the screen, or closing the page):
   - cancel the prompt, end HOLD immediately and begin the withdrawal;
   - don't wait for the timer, don't resume the activity, and never recreate the prompt;
   - when the game loads, a saved HOLD becomes a withdrawal at the run's last saved tick.

---

## D. Recovery

**Stress recovery rate:**

- **Checkpoint rest** after a voluntary withdrawal recovers stress at the Bedroll rate, −20 a day `[DECIDED, B1]`.
- **Base rest** after a Forced Retreat recovers stress at the player's current bed tier through `restBed()`, as today (Bedroll −20, Cot −30, Bunk −40, Proper bed −50 per day; spec 13.8).
- The cleared-ground −0.10/min rate is not a rest rate.

**Ending rest:** both kinds of rest end only when HP ≥ 80% and stress < 50.

**After Breaking** (stress reset to 60): the survivor rests at Base until both conditions hold, about 12 hours with a Bedroll and less with a better bed.

**No stall:** stress always falls at a negative rate while resting, so recovery always finishes.

---

## E. Snooze state

Push on saves a re-trigger threshold for each rule true at that moment, measured from its current value and not clamped:

| Rule | Snoozed until | Example | Unreachable case |
|---|---|---|---|
| Stress | value + 10 | 88 → 98 | 94 → 104 (Breaking at 100 comes first) |
| Load | value + 10 points | 112% → 122% | 118% → 128% (the 125% ceiling comes first) |
| HP | value − 10 points | 27% → 17%, still needing no heals | 7% → −3% (Downed comes first) |

Rules not true at Push on are not snoozed.

**Unaffected:** Breaking, Downed, the pickup ceiling and Forced Retreat all work normally regardless of snoozes.

**Push-on log line `[PROPOSED, C4]`:**

- if the threshold can't be reached (stress ≥ 100, load > 125% or HP ≤ 0%), it reads "No more stress / load / health warnings this run";
- otherwise it gives the real value, e.g. "Next stress warning at 98".

**Lifetime:** the current run only. All snoozes clear on every run-ending path (withdrawal arrival, Forced Retreat, Return to Base), and a new run starts with none. A value dipping and rising again does not clear them.

---

## F. Reporting

- **Withdrawals:** one event each, with the primary cause and any other rules true at the same moment, e.g. `Withdrew: Low HP (also: Stress 86)`.
- **Push on:** logged once on the live screen; it gets no return-report row.
- **Interrupted discoveries:** keep the existing `left behind (withdrew)` row.
- **Single source:** the live log and the return report read the same event.

---

## G. Save state

- `zi_retreat_rules`, per save: the three settings and their Off/Ignore flags, validated as in B. Old saves get the defaults.
- In the current run:
  - active snoozes (rule and threshold);
  - an open HOLD (primary and secondary rules, remaining timer, any interrupted discovery's details), kept only so a load can apply C4;
  - the causes of the withdrawal in progress.
- **Save version:** bump by one from the version current when R1 starts, with a data-only migration. Don't hard-code a number.

---

## H. Exact simulation boundaries `[DECIDED, C1]`

Every threshold that a continuously changing value can cross must be an exact simulation boundary. Live play, uneven chunks and bulk catch-up must all cross it at the same simulated moment. That covers:

- the stress rule trigger, and any snoozed stress threshold;
- resume on stress < 50, which stress crosses continuously while resting;
- resume on HP ≥ 80%, which HP crosses continuously while resting;
- the HP rule trigger and any snoozed HP threshold, if HP can drain continuously (today it changes at fight events).

Load changes only at pickups, consumption and banking, so it is already safe.

---

## I. Numbered acceptance checks

1. **Thresholds:** HP fires only when HP is below the floor with no Heal charges, never exactly at it and never while heals remain; stress fires at or above its ceiling, and load at or above its limit; none fires before its threshold.
2. Off and Ignore disable a rule.
3. A fired rule starts the existing voluntary withdrawal to the last checkpoint, never a Forced Retreat, and never to Base.
4. Priority is HP → Stress → Load, identically live, offline and after a reload, and independent of UI order or object-key order.
5. Secondary causes are reported within a single withdrawal event.
6. **Snoozes from the current value:** 88 → 98, 112% → 122%, 27% → 17%. A rule that wasn't true at Push on stays active.
7. **Unreachable snoozes:** stress 94 → 104 is stored unclamped, Breaking still triggers at 100, and the log says "No more stress warnings this run". The same holds for at least one load case and one HP case.
8. Snoozes survive a reload during the run.
9. Snoozes clear on every run-ending path and never carry into the next run. A dip and rise doesn't clear them.
10. **Not watching:** a background tab, the hidden layout copy and offline catch-up never create a prompt or HOLD.
11. **Watching:** the real, foreground-visible screen shows the primary-trigger prompt and HOLD. Return now and the timer running out both withdraw; Push on resumes the patrol.
12. **Watching stops mid-prompt:** the prompt is cancelled and the withdrawal starts at once; the previous activity doesn't resume; the old prompt is never recreated; the player sees the withdrawal and its report.
13. **Page closed during HOLD:** the saved HOLD becomes a withdrawal at the last saved tick, matching an unwatched run from that moment.
14. **Discovery interruption:** the discovery closes as `left behind (withdrew)`, then the retreat prompt opens. The two never show together.
15. **During HOLD:** movement, encounters, discovery rolls and travel stress stop; the timer, buffs and decay keep running; a rule that newly becomes true doesn't change the prompt.
16. On cleared ground during HOLD, passive stress recovery continues at the usual rate.
17. Breaking during HOLD cancels it and runs the Forced Retreat immediately, exactly once.
18. No rule checks happen while withdrawing or resting. They resume with the patrol.
19. Checkpoint arrival banks the haul through the existing flow, so a load-triggered withdrawal at 115% can't retrigger the load rule on the same haul.
20. **No stall:** a survivor who withdraws above 50 stress recovers at the checkpoint at −20 a day and redeploys.
21. Checkpoint recovery uses the two-condition gate.
22. Forced Retreat recovery at Base uses the same two-condition gate. After a Breaking, the patrol doesn't resume at stress 60 just because HP reached 80%, and a 24 h catch-up shows no repeated-Breaking loop.
23. **Stress-ceiling validation:** 51–95 or Off are accepted. Saved values of 50 or less, or malformed ones, clamp to 51; a missing value defaults to 85.
24. **HP boundary:** with exact integer arithmetic at the 30% floor, exactly 30% doesn't trigger and anything below it does (with no heals). This includes a max HP that doesn't divide evenly, e.g. maxHp 95, where 28.5 HP doesn't trigger and 28 HP does.
25. ~~**Rest stress rate:** checkpoint rest recovers at the Bedroll rate (−20 a day). Base rest recovers at the current bed tier through `restBed()`: tested with a Bedroll and with at least one better bed.~~ `[SUPERSEDED by the R1 addendum]` **Rest stress rate:** checkpoint rest and Base rest both get their stress rate from `restBed()` (one source of truth); checkpoint rest is fixed at the Bedroll rate. No bed-tier state, fields or tests.
26. **Exact boundaries:** every boundary in H is crossed mid-chunk in the tests, at the same simulated moment for 1-second steps, uneven steps and one bulk catch-up.
27. **Overnight overload:** an unwatched, overloaded overnight run withdraws at 115%, banks at the checkpoint and redeploys under the gate.
28. **Unwatched equivalence:** 1-second, uneven and bulk processing give identical results throughout, including rule firing, withdrawal, banking, recovery and redeployment.
29. Old saves load with default, validated settings, no snoozes and no HOLD. Nothing else changes.
30. **Regressions:** all existing suites stay green, including Batch 3B and the Fort suite.
31. **Browser check:** TEST SAVE only; before any change, confirm the page title, the test namespace, and that this isn't the real game page; keep the write monitor running throughout.

---

## J. Explicit exclusions

- **Retreat features:** Return Reserve; the gear-condition rule; an editable resume ceiling; combined conditions; fallback or new destinations (Camp, Safehouse).
- **Forced Retreat:** dangerous Forced Retreat travel; any change to Forced Retreat consequences or its Base destination.
- **Reporting:** an approximate lost value in the too-heavy report row.
- **Tuning:** the voluntary-withdrawal downtime issue (stress 85 → 50 at −20/day is about 42 h) stays parked in `PARKED.md`; do not change rates or defaults to address it.
- **Other systems:** Resource Priorities, Scheduling, the Shop, Difficulty, Comfort, Afflictions, Stamina.
- **Carrying:** dropping haul in the field; carrier recipes or rebalance; the Rig slot; the Med/Stim quick slots.
- **Locations:** the Church and every other parked point of interest.
- **PARKED.md:** everything beyond the 4 rows R1 activates.

---

# IMPLEMENTATION REQUEST — Batch R1

Batch 3B is CLOSED. Implement this final Batch R1 brief exactly as approved. Treat it as the current authoritative batch contract.

## Before coding

- Save this brief unchanged to `reference/r1-brief.md`. Do not reconstruct rules from memory.
- Consult CODE_STATE only for relevant implementation state.
- Inspect only the directly implicated Wandering, active/rest, save and UI code.
- Consult PARKED.md only to confirm excluded ideas stay parked.
- Before changing anything, report what the existing voluntary withdrawal does with the haul and with stress at a checkpoint, and whether `restBed()` reads the current bed tier.

## Rules

- Do not reopen settled gameplay decisions.
- If existing code contradicts a locked R1 rule in a way that needs a new player-facing decision, STOP and return a DESIGN HANDOFF. Do not choose.
- Implementation-only choices with no player-facing effect may be resolved normally.

## Technical requirement: exact boundaries

Every threshold that a continuously changing value can cross must be an exact canonical simulation boundary (Section H). Live, uneven-chunk and bulk catch-up must cross it at the same simulated moment. Compare HP thresholds in exact integer arithmetic (`HP × 100 < floor% × maxHP`).

## Session safety

Settings, save fields and the migration are additive and safe to stop after. Do not start wiring rules into the simulation unless the rule wiring, HOLD, recovery gate and tests can all be finished in this session.

## Testing

- Use the TEST SAVE protections for all browser and manual testing. Identify the page before any change. If identification fails, STOP. Never fall back to the real save.
- Equivalence tests must cover every boundary in Section H, each crossed mid-chunk.

## Completion

Return the normal compact completion report, and state explicitly:

`BATCH R1: CLOSED` or `BATCH R1: NOT CLOSED`

Do not begin another batch after R1.
