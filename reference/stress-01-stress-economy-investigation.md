# STRESS-01 — Stress economy investigation (Oct 17)

**Status:** investigation only, UNLOCKED. No production code, balance value, spec or save was changed. Nothing here is approved or closed; every number is measured in the runs listed, and nothing is extrapolated beyond them.

**Correction to the Oct 17 combat-balance report:** that report said the ~23 h of rest came from walking stress on unexplored ground (+15/h). That was wrong. The instrumented runs below show the survivor walks cleared home ground, where walking lowers stress. The actual cause is in section 1.

## 1. Verified root cause
The survivor rests about 23 h a day because of a **Downing loop with two walls.** Each wall alone is enough to fill the day:
1. **HP wall:** each Forced Retreat starts a rest from 1 HP to 80% (about 16 min at 5 HP/min). Downings are so frequent that this alone fills ~21.5 h/day once stress is removed (diagnostic D1).
2. **Stress wall:** the low-HP stress event (+5 when the survivor is below 25% HP while walking; `lowHpOnce`, once per run) is 97% of all stress added (29.7 of 30.6 per day). Base and checkpoint rest at the Bedroll rate (20/day) must bring stress under the resume gate (< 70) before the survivor leaves. In the current build, 14.7 of the 21.8 h/day of post-Downing rest is stress-only waiting.

**It is a self-balancing loop, not a slow-recovery problem.** Any recovery speed-up is spent on more fighting, which produces proportionally more Downings and low-HP events, and rest returns to ~22–23 h:
- Doubled Bedroll: encounters 114 → 215/day, Downings 26.9 → 46.8, rest 23.0 → 22.8 h.
- Removing low-HP stress (diagnostic D1): Downings 26.9 → 82.0, rest 23.0 → 22.3 h.

**Underlying driver:** about 59% of encounters end in a Downing event (67 of 114/day, counting ones a heal saved). This follows from the tier exposure found in the combat-balance report.

**Not the cause:**
- **Unexplored walking stress:** the harness survivor walks cleared ground 95% of the time (home ground counts as cleared, −0.10/min) and explored ground 5%. It never walks unexplored ground.
- **The clock:** no timing mismatch (section 2).

## 2. Audit
**Stress sources `[CODE]` (`ACTIVE_TABLE.stress`, `game/active.js` 31–43, 266–365):**
- Walking per minute by the familiarity of the current Traversal square: unexplored +0.25, explored +0.10, cleared −0.10. Positive rates are ×1.15 when overloaded. This also applies while walking back during a withdrawal.
- One-off events: failed venture +8, ambush +5, route change +3, low HP +5 (once per run; the flag resets when the run ends).
- Fights themselves add no stress.
- A Breaking sets stress to the Shaken floor (80).
- Home ground (start and camp squares) always counts as cleared (`ZI.isHomeCell`, `game/world.js` 158–166).

**Recovery `[CODE]`:**
- Only while resting: `WS._onRest` removes `bedRecoveryPerDay[restBed]` per 86,400,000 ms.
- Checkpoint and camp rest are fixed at the Bedroll (20). Base rest uses the default bed, which is the Bedroll, since no bed tiers are built.
- Rest ends at HP ≥ 80% and stress < 70 (`RETREAT_RULES_TABLE.resume`).

**H1 clock `[CODE]`:**
- `ZI.clockNow()` is real time (or the harness clock).
- `WanderEngine._run` seeds `_simNow = now − pending`. `advance()` reads no clock and moves `_simNow` only by consumed milliseconds (walking segments, rest steps, HOLD, Jester wait).
- Watched play (`liveStep` every second) and offline catch-up (`tick` on load, 24 h cap per return) both call the same `advance()`. The only difference is the `watching` flag, which affects HOLD prompts. The H2 T1 check confirms chunking does not change results.
- Walking stress (per minute) and recovery (per day) are both measured on this one simulated clock.

**Timing mismatch: none found.** So the clock-aligned recovery scenario was **not run**, as instructed.
- **Semantic note:** "per day" for bed recovery means a real day. Since Oct 16, the Jester's stay and injuries use game days (2.4 real min). This is a naming risk, not a clock fault.

## 3. Tests performed
- **Build:** same hashes as the Oct 17 combat-balance report, re-verified on Sam's machine: `active.js a7bedfeba4e9bcb0` · `bootstrap.js a999706d9602df03` · `camp.js a1f9bc90987db05d` · `combat.js 4ab47d83608aaf15` · `core.js 48bb00f8d9d516dd` · `crafting.js 2bb38a8defd348cf` · `economy.js bfbab7115f522e5c` · `factions.js af21b974e3df742f` · `fort.js 6089fdd5df76480f` · `items.js a945d3631aceb920` · `jobs.js 1c6cc45e82e81410` · `routes.js bbb31f1db6434ef9` · `save.js 28076a9a61e6d485` · `stats.js f89005797f0e9d0a` · `survival-data.js 4a9cec01649a1402` · `wandering.js 20d20e48f196be4a` · `world.js a8ef90e9c7842c33` · `bestiary-data.js 9b78614e2fb77a56` · `h2.js b93504ed3ffccf79`. Node v22.22.0.
- **Harness:** H2 `runOne`, unchanged. Ethical policy, returns every 8 h, 7 days. Seeds 101, 202, 303, 404, 505 are common to every scenario. Starts A, B-bat, B-iron_knuckles and B-pocket_knife are run separately: 20 runs per scenario.
- **Held constant:** combat (95% zombie hit chance, 150 m tier step), starting equipment, CB1 weapons, rest gate, every rule not listed.
- **Control:** the observation hooks alone reproduce the unmodified build exactly in 20 of 20 runs (kills, Downings, withdrawals, rest ms).
- **Scenarios (in-memory data-table edits):** current · walk75 (`unexploredPerMin` 0.25 → 0.1875) · bed2x (Bedroll 20 → 40/day) · combo (both).
- **Diagnostics (not candidate changes; they break the "hold constant" rule on purpose to test cause):** D1 low-HP stress 0 · D1b low-HP 0 + bed2x · D2 combat 70% + early-game tier cap (as defined in the combat report) · D3 D2 + low-HP 0.
- **Results:** 160 runs, 0 FAIL, 0 WARN.

## 4. Results (mean ± SD across the 20 runs per scenario; per day unless noted)
| Scenario | Explore h | Rest h | Encounters | Kills | Downed | Saved by heal | km | Withdrawals | Longest rest h |
|---|---|---|---|---|---|---|---|---|---|
| **Current** | 0.2 ±0.0 | 23.0 ±0.5 | 114 ±17 | 68.3 ±10.4 | 26.9 ±4.3 | 40.0 ±6.4 | 1.71 ±0.29 | 1.4 ±0.5 | 8.0 ±2.5 |
| walk75 | identical to current in every run | | | | | | | | |
| bed2x | 0.3 ±0.0 | 22.8 ±0.5 | 215 ±24 | 120.8 ±13.0 | 46.8 ±5.3 | 71.1 ±8.2 | 3.26 ±0.46 | 2.5 ±0.6 | 4.0 ±1.1 |
| combo | identical to bed2x in every run | | | | | | | | |
| D1 low-HP 0 | 0.7 ±0.1 | 22.3 ±0.5 | 500 ±21 | 238.5 ±3.6 | 82.0 ±2.3 | 137.0 ±3.2 | 7.53 ±0.57 | 5.7 ±1.5 | 0.3 ±0.0 |
| D1b low-HP 0 + bed2x | identical to D1 | | | | | | | | |
| D2 70% + cap | 0.1 ±0.0 | 23.1 ±0.5 | 69 ±10 | 48.7 ±6.6 | 10.8 ±1.9 | 10.9 ±2.9 | 0.89 ±0.11 | 1.5 ±0.5 | 8.5 ±3.8 |
| D3 70% + cap + low-HP 0 | 1.3 ±0.3 | 21.3 ±0.4 | 1099 ±162 | 402.4 ±21.1 | 43.5 ±2.3 | 42.7 ±4.3 | 13.86 ±2.79 | 28.2 ±4.6 | 9.4 ±0.8 |

- Time coverage: walking, withdrawal walking, rest, HOLD and Jester wait add up to 100.00% of simulated time.
- HOLD was 0 h in all scenarios. The Jester wait was 0.8 ±0.5 h/day (B starts only, 7.72 h once).
- Withdrawal walking was ≤ 0.1 h/day in the main scenarios.

**Why walk75 = current and combo = bed2x:** unexplored walking time was 0 in every run, so changing its rate changes nothing in these conditions. Its effect on a survivor who walks unexplored squares is untested.

### By starting survivor (explore h · rest h · Downed · kills · km)
| Scenario | A | B Nail Bat | B Iron Knuckles | B Pocket Knife |
|---|---|---|---|---|
| Current | 0.2 · 23.8 · 28.7 · 67.3 · 1.88 | 0.2 · 22.7 · 28.9 · 74.3 · 1.78 | 0.2 · 22.7 · 27.3 · 71.4 · 1.67 | 0.1 · 22.7 · 22.7 · 60.1 · 1.51 |
| bed2x | 0.3 · 23.6 · 51.0 · 127.8 · 3.74 | 0.3 · 22.5 · 46.6 · 122.0 · 3.16 | 0.3 · 22.5 · 47.3 · 124.5 · 3.11 | 0.3 · 22.6 · 42.3 · 109.1 · 3.02 |
| D1 | 0.8 · 23.2 · 85.8 · 240.5 · 8.21 | 0.7 · 22.1 · 81.1 · 235.6 · 7.16 | 0.6 · 22.1 · 80.5 · 238.9 · 6.95 | 0.7 · 22.0 · 80.7 · 239.0 · 7.79 |
| D2 | 0.1 · 23.9 · 10.4 · 41.8 · 0.87 | 0.1 · 22.8 · 10.6 · 50.1 · 0.85 | 0.1 · 22.8 · 12.3 · 54.6 · 0.95 | 0.1 · 22.8 · 10.0 · 48.1 · 0.90 |
| D3 | 1.6 · 21.9 · 45.4 · 420.6 · 17.24 | 1.2 · 21.2 · 43.3 · 404.6 · 12.24 | 1.3 · 21.1 · 43.9 · 403.0 · 13.53 | 1.2 · 21.2 · 41.6 · 381.5 · 12.44 |

A rests about 1.1 h/day more than the B starts because the B starts' 7.72 h Jester wait is counted as waiting, not rest. Per-seed SD for Downings by start: ±0.2 to ±4.7 per day.

### Rest by cause (h/day; stress-only portion; rests/day; average length)
| Scenario | After a Downing | After a withdrawal | Jester camp |
|---|---|---|---|
| Current | 21.77 (14.72 stress-only) · 26.7 rests · 49 min | 1.19 (0.96) · 1.3 · 53 min | 0.03 |
| bed2x | 21.19 (8.90) · 46.6 · 27 min | 1.59 (1.17) · 2.5 · 38 min | 0.03 |
| D1 | 21.55 (0.00) · 81.8 · 16 min | ~0.6 (0.00) | 0.03 |
| D2 | 21.27 (18.46) · 10.6 · 2.0 h | ~1.7 | 0.03 |
| D3 | 14.75 (3.28) · 43.5 · 20 min | ~5.3, mostly load withdrawals | 0.03 |

### Stress
| Scenario | Calm < 40 | Strained 40–69 | Stressed 70–84 | 85+ | Added/day (main sources) | Removed/day | Day-end stress, days 1→7 |
|---|---|---|---|---|---|---|---|
| Current | 4.9% | 23.7% | 71.4% | 0.0% | low HP 29.7 · failed venture 0.8 | Base rest 18.1 · checkpoint 1.0 · cleared walking 1.1 | 64.8, 72.0, 71.2, 70.7, 72.1, 72.5, 72.2 |
| bed2x | 6.5% | 44.2% | 49.3% | 0.0% | low HP 48.3 · failed venture 1.8 | 35.3 · 2.7 · 2.1 | 57.7, 71.7, 70.1, 69.7, 69.6, 69.6, 70.2 |
| D1 | 100% | 0% | 0% | 0% | failed venture 7.7 | 5.1 · 0.2 · 1.7 | 1.0 → 5.6 |
| D2 | 1.5% | 8.2% | 90.2% | 0.0% | low HP 29.4 | 17.7 · 1.5 · 0.6 | 72.9 → 72.2 |
| D3 | 57.8% | 14.8% | 27.4% | 0.0% | failed venture 35.1 | 10.2 · 5.0 · 9.6 | 5.8, 9.6, 21.7, 35.2, 69.2, 72.7, 73.2 |

Shares are of simulated time. Breakings were 0 in every run of every scenario, so the Shaken floor (80) was never exercised.

### Recovery-loop failures
- H2 failure classes (S1 advance guard, S2 unprocessed time, S3 timerless state, S5 rest beyond worst case): 0 in all 160 runs.
- Longest single rest: 8.0 h (current), 4.0 h (bed2x).
- Empty-cycle streak (withdraw → rest → resume with nothing banked): max 2.5 ±0.8 current, 2.8 ±1.3 bed2x.
- No repeated-Breaking loop, no soft-lock.

## 5. Which changes improve gameplay without trivializing stress
- **walk75:** no effect in the tested conditions (no unexplored walking). Untested where it would matter: a survivor moved to unexplored squares.
- **bed2x:** roughly doubles activity (encounters, kills, km) and Downings. Rest share is unchanged (22.8 h). Stress stays meaningful (49% of time Stressed, Strained 44%). It does not fix the rest problem and increases Downings 74%.
  - **Conflict:** Bedroll 40/day equals the Bunk tier and undercuts the bed-upgrade ladder (spec §13.8 calls bed rates "deliberately modest").
- **combo:** same as bed2x here.
- **D1 (no low-HP stress):** trivializes stress (Calm 100% of the time) and triples Downings. Not a candidate as-is; it only proves the stress wall.
- **D3:** the only setting that raised active time meaningfully (0.2 → 1.3 h/day). Stress still returns to the 70s by day 5–7 (failed ventures rise to 35/day with more prompts). Load withdrawals become frequent (about 20/day), so carry capacity becomes the next limiter.
- **None of the tested stress-only changes improves the rest share.** It moves only when Downings per encounter fall *and* near-death moments stop holding the stress gate.

## 6. Recommended next decision
**Sam to set a target Downing rate for a starting survivor:** Downings per day, or encounters per Downing, under the ethical policy. Both walls scale with Downings, so this target is the input every follow-up test needs.

With a target set, the next read-only test would tune the two levers together against it:
- combat lethality (accuracy and tier gating);
- what a near-death moment costs in stress (the size of the low-HP event, or when it fires).

The 6-second encounter interval (about 600 encounters per active hour) is a third, untested factor worth including.

## 7. Implementation risks and conflicts
- **Bed rates:** raising the Bedroll conflicts with the bed-tier ladder (cot 30, bunk 40, bed 50) and spec §13.8.
- **Rest on the game clock:** Sam chose on Oct 16 to keep rest on real time and to fix PF1 by raising the gate. Clock-aligned recovery would be a new decision, not a correction. At 600× it would erase the stress wall entirely.
- **Low-HP stress event:** changing it changes the "quiet kill" and stress-reduction value of headshots (decided Oct 16), which reduce stress gained per encounter.
- **Harness blind spots:** the H2 survivor never moves to another Traversal square, so walking stress, explored/unexplored familiarity and the walk75 change are not exercised. Breakings never occurred. Results are for the ethical policy only.
- **Resume gate (< 70):** with stress pinned at 70–73, the gate is the binding stress constraint. Small changes to the gate or to the low-HP event will have outsized effects.
- **Carry load:** once activity rises (D3), load withdrawals dominate. Carry capacity will need checking in any follow-up.

## 8. Separate finding — bestiary identity (Trapper Zed, Battle Cry General)
- **Data:** 45 bestiary entries, all with unique `id`. Two display names repeat across tiers: Trapper Zed (`id 20`, tier C, 80 HP, armor 0; `id 38`, tier S, 200 HP, armor 3) and Battle Cry General (`id 22`, tier B, 115 HP, armor 1; `id 39`, tier S, 240 HP, armor 4).
- **Wandering fights carry only the display name `[CODE]`:** `ZI._bgZombie` (`game/wandering.js` 105–114) returns `{ name, hp, atk, xp, seesThrough }`, with no `id`, tier, armor, speed or traits. `resolveEncounter` records `enemy: z.name`; `bestiaryId` and `tier` are undefined.
- **Measured effects (3-day B-bat run, seed 101, 201 kills, 269 fights):**
  - **Codex:** `discoverZombie` is skipped, so no Codex entry was unlocked by any Wandering kill.
  - **Armor:** all 269 fights used enemy armor 0, although 19 of 45 bestiary zombies have armor above 0.
  - **Speed:** enemy initiative falls back to a default.
- **Display:** the live screen identifies the zombie by `bestiaryId` first, then by name (`screens-v3.jsx` ~1681). For the duplicated names it shows the first match in bestiary order (the lower-tier entry), so an S-tier Trapper Zed is displayed with the C-tier entry's details.
- **Risks:**
  - **Codex:** encounter, kill and headshot counts can't be attributed per type until fights carry `bestiaryId`; name-keyed counts would merge the C and S entries.
  - **Tier tracking:** telemetry or balance reports keyed by name misattribute these two pairs (this affected the first pass of the combat-balance report until tiers were tagged at pick time).
  - **Armor and damage types (`[CONCEPT]`, parked):** cannot work in Wandering until the fight carries the bestiary record (armor, traits). The Chrome Dome Bruiser's headshot immunity and armor are currently unreadable there.
  - **Headshots (decided Oct 16):** per-type modifiers and immunity need the bestiary identity, not the name.
- `[OPEN]` for Sam and Code: carry `bestiaryId` (and through it, tier and armor) on Wandering fights, and decide whether the duplicated names should be renamed. Not done; no production change was authorized.
