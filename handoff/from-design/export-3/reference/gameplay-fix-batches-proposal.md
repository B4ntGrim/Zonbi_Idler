# Zed Idler — Gameplay Fix Batches and H2 Scenarios (Proposal, Oct 10)

**Status:** `[PROPOSED]` batches; U1–U4 `[DECIDED Oct 10]` (§6). These are batch proposals, not batch contracts. No code work starts from this file. Each batch is written up in `CURRENT_BATCH.md` only after Sam approves it and the batch before it closes.
**Source:** `h1-findings-decisions-oct10.md` (Q1–Q6, TQ1–TQ10).
**Tracking:** H1, the fix batches FX1–FX4, Q3 and H2 are tracked separately. None of them merges into another.

---

## 1. Where the decisions were recorded

| Decision | Status | Recorded in |
|---|---|---|
| Q1 HP minimum 1 | `[DECIDED Oct 10]` | `wandering-tab-spec.md` §13.8, after the Batch 3B Forced Retreat note |
| Q2 24 h cap per return, carried time included | `[DECIDED Oct 10]` | Spec §9 "Cap offline effects"; spec §3.2 absence-cap row |
| Q3 XP decay floor | `[PENDING — TECHNICAL VERIFICATION]` | Spec §3.4, note under "Decay can never take XP below the highest floor earned" |
| Q4 Buffs on simulation time | `[DECIDED Oct 10]` | Spec §9; sim-harness brief §7 (G1 → FX3) |
| Q5 Shared `moveSpeed` / `healPct` | `[DECIDED Oct 10]` | Spec §9; sim-harness brief §7 (G2 → FX4) |
| Q6 Two H2 starting scenarios | `[DECIDED Oct 10]` | Sim-harness brief §6: D4, D5, D10 amended; new D11 |
| H1 | **CLOSED Oct 10** | `reference/archive/h1-batch.md`; `reference/archive/h1-acceptance-report.md`; sim-harness brief status line |

No earlier locked decision was changed.

---

## 2. Conflicts and gaps found in earlier specs

| # | Where | Finding | Needs |
|---|---|---|---|
| C1 | Spec §13.8 (Batch 3B), Q1 | Downed is a Forced Retreat trigger. The spec never says what HP value Downed means. If Downed is "HP reached 0", Q1 needs the trigger defined as "damage that would take HP to 0 or below", with stored HP held at 1 | Sam to confirm (§6 U1) |
| C2 | Spec §9 / §3.2, Q2 | The spec caps offline effects at 24 h but never says what happens to time beyond the cap. Q2 forbids inventing a policy | Code reports current behavior (TQ2); Sam decides if it isn't settled (U2) |
| C3 | Spec §3.4 / §12.2, Q3 | The only floor rule is "never below the highest floor earned". Nothing defines the floor before a milestone floor is earned. This is a real gap in the spec, not only in the code | Code evidence first (§4), then Sam |
| C4 | Sim-harness D5, Q6 | D5 says the harness never grants carrier capacity "silently". Scenario B grants one openly as a declared fixture. Compatible; D5 now says so | None |
| C5 | Sim-harness D5, Q5 | D5 derives the headless `moveSpeed` / `healPct` from the fixture. After FX4 the shared rule supplies them, and D5's derivation step goes away | Fold into the H2 draft once FX4 closes |
| C6 | Doc index; POI framework brief | The POI framework is "blocked until the HP drain bug is fixed". **Resolved Oct 10 (U7, Sam):** the HP drain bug is the DH1 defect and is fixed by FX1. This supersedes the earlier note that they were separate (Code's review §3); Code's two-tab hypothesis is kept as a V3 observation only | None |

---

## 3. Proposed batch order

H1 CLOSED Oct 10. All four start only after **H1 is CLOSED**, because their tests rely on the H1 clock and seeded rolls. One batch at a time; each has its own baseline, regression run and closing line.

| Order | Batch | Decision | Why this position |
|---|---|---|---|
| 1 | **FX1 HP floor and Downed** (`fx1-hp-floor-slice.md`, LOCKED Oct 10) | Q1, U5–U7 | Smallest, self-contained. An HP below 1 makes D7 validity fail in every H2 run. May unblock the POI framework (C6) |
| 2 | **FX2 Per-return cap** (`fx2-per-return-cap-slice.md`, proposed) | Q2 | Defines how much simulated time a return processes. FX3's carried-time tests depend on it |
| 3 | **FX3 Buffs on simulation time** | Q4 | Needs FX2's settled carried-time behavior. Buffs may feed `moveSpeed` / `healPct`, so it goes before FX4 |
| 4 | **FX4 Shared survivor attributes** | Q5 | Last, so it moves already-correct buff and healing inputs into shared rules. Touches the screen file |
| — | Q3 XP floor | Q3 | No batch until Code's evidence and Sam's decision |
| — | H2 | Q6 | After H1, FX1 and FX2 are CLOSED (U3) |

### Every batch
- **Step 0:** baseline (all suites), preserved build for a differential test, hashes of files expected to change.
- **Step 1, investigation:** Code answers the batch's TQ with file:line evidence and stops for review if the answer changes the planned fix.
- **Stop conditions:** any change to balance, save keys, save version or an unrelated rule; any test edit not authorized in the batch file; any finding outside the decision.
- **Closing line:** `FXn <NAME>: CLOSED` / `NOT CLOSED`.

### FX1 HP minimum (Q1, DH1, TQ1)
> **Superseded Oct 10** by `fx1-hp-floor-slice.md` (scope widened by U5). Kept as the planning record.
- **Scope:** the path that lets HP go below 1, including `restStartHp` reaching 0 and fractional HP.
- **Tests:** Downed, Forced Retreat, Base rest, recovery to resume (80%), repeated simulation steps; watched, offline and headless; HP ≥ 1 after every step; max HP and heal amounts unchanged.

### FX2 Per-return cap (Q2, DH2, TQ2)
- **Scope:** `WanderEngine.tick` return path and `_carryMs` accounting.
- **Tests:** ordinary 24 h return; 72 h away; consecutive absences; interrupted processing within one return; a large carried remainder. Total processed per return ≤ 24 h in every case; legitimate partial progress kept; time beyond the cap discarded (U2).

### FX3 Buffs on simulation time (Q4, G1, TQ4)
- **Scope:** buff creation, lookup, effect, expiry, cleanup and stacking.
- **Tests:** the G1 criterion (active on [t, t+d), inactive from t+d); expiry exactly on a step boundary; long absences; carried time; watched vs offline; any chunking; cleanup only after all eligible steps; never active beyond its duration.

### FX4 Shared survivor attributes (Q5, G2, TQ5)
- **Scope:** new shared rule functions for `moveSpeed` and `healPct`; the Wandering screen reads them.
- **Tests:** screen never mounted gives the same values as watched; new save; equipment change; buffs and stims; healing; offline progression; existing save loads; differential shows no balance change.

---

## 4. Questions for Code

Answer with file:line evidence. Do not change code to answer them.

**H1** (answered in the acceptance report §7, §13, §14; H1 CLOSED Oct 10)
- **TQ6** H1 behavioral differences outside the differential coverage, especially in the real browser and with timed buffs.
- **TQ7** How to reconcile the contradictory `ZI.now()` export requirements in DH4 while keeping existing test expectations.
- **TQ8** Whether the fingerprint test reads the same storage origin and save keys as the real game and the TEST SAVE build. Sam's browser check depends on this.

**Fix batches (each answered in that batch's step 1)**
- **TQ1** (FX1) Does DH1 reproduce in normal watched play as well as accelerated simulation? The exact path that breaks HP ≥ 1. *(Answered Oct 10: DH1 is not the HP drain bug; review §3.)*
- **TQ2** (FX2) How `_carryMs` builds up across absences and return calls; what happens today to time beyond 24 h; the smallest change that enforces the per-return cap.
- **TQ4** (FX3) Which buff creation, lookup, expiry, cleanup and stacking paths need changes.
- **TQ5** (FX4) Every input to `moveSpeed` and `healPct`, and which shared functions should own them.

**Q3 XP floor (no fix)**
1. The exact floor rule the code implements.
2. The spec section it comes from.
3. What it applies to: total XP, current-level XP, per-skill XP or another value.
4. Whether it changes with level or progression.
5. Which decay paths break it.
6. The smallest correction that would enforce the existing design.

**Planning**
- **TQ9** Confirm FX1–FX4 can be fixed independently in the order above, or name the dependencies that change it.
- **TQ10** For each of FX1–FX4 and Q3: must it close before H2 results are valid, or can it be a documented limitation?

---

## 5. H2 scenario matrix (sim-harness brief D4, D11)

| Axis | Values |
|---|---|
| Scenario | A Authentic new save · B Starter carrier fixture |
| Policy | the four baseline policies |
| Difficulty | Normal |
| Seeds | 5 (the same seeds in A and B) |
| Length | 30 simulated days |
| **Runs** | 2 × 4 × 1 × 5 = **40** |

**Run record additions:** scenario id; for B, the carrier item, the inventory difference and the load capacity; for A, the starting load capacity.
**Summary:** one policy table per scenario, plus an A vs B comparison per policy.

**Settled for the H2 draft:**
- Which carrier B uses. It must be an existing item with normal capacity and effects. **Belt pouch** `[DECIDED Oct 10, U4]`: the smallest existing carrier, so B tests "any carrier" with no big jump in capacity. **Finding (acceptance report §14):** with the belt pouch, B behaves like A (identical withdrawal counts over 24 h); B needs an HP-side change to test what it intends. `[OPEN]` for Sam before H2 is drafted.
- The definition of "trapped in repeated overload/recovery cycles" for A. `[DECIDED Oct 10, U4]`: within 30 days, N or more consecutive withdraw → rest → redeploy cycles with no net haul banked between them. N is set from the first report.
- Whether T1–T3 (D8) run in both scenarios or in A only. `[DECIDED Oct 10, U4]`: T1 and T2 in A only (they test time handling, not inventory); T3 in both.

---

## 6. Sam's answers `[DECIDED Oct 10]`

- **U1** (C1) **Yes.** Downed still triggers when damage would take HP to 0 or below; HP is held at 1. Only the stored value changes. *(Trigger wording superseded Oct 10 by U5: reaching 1 HP from any damage source Downs.)*
- **U5–U7** `[DECIDED Oct 10]`: see `fx1-hp-floor-slice.md` §2 (any source reaching 1 HP Downs; the Downing hit logs full damage; the HP drain bug is this defect).
- **U2** (C2) **Yes.** Time beyond the 24 h per-return cap is discarded. If TQ2 shows an existing rule that says otherwise, Code reports the conflict before FX2 changes anything.
- **U3** **Yes.** H2 starts only after H1, FX1 and FX2 are CLOSED (HP and cap errors would fail D7 and T2 in every run). FX3 and FX4 may be open during H2 as documented limitations if TQ10 supports it; otherwise they close first.
- **U4** **Approved:** belt pouch, the trap definition and the T1–T3 coverage in §5.
