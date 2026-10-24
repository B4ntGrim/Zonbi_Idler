# Zed Idler — Playtest Findings (Oct 15)

**Status:** Current. Findings from Sam's real-game play on Oct 15, after JD1a closed. Not a batch and not a build input. Each finding needs a decision from Sam (and, for PF2, facts from Code) before any fix is scheduled.
**Why this file exists:** H2 needs a punch-list of problems seen in real play so the simulation can confirm or rule them out. Add new findings here as PF3, PF4, … with what was seen, what was expected, and why it matters.

---

## PF1 — Stress alone holds the resume gate (balance) — **DECIDED Oct 16 (Sam)**

**Decision `[DECIDED Oct 16, Sam]` (option B, loosen the gate):** the resume gate is now HP ≥ 80% **and** stress < 70 (was < 50), so the survivor resumes while Strained but not Stressed. Knock-on changes, also decided Oct 16: the Shaken floor after a Breaking is 80 (was 60), so a Breaking still forces a stress rest; the player's stress retreat ceiling range is 71–95 (was 51–95; saved values ≤ 70 read as 71). Code: `RETREAT_RULES_TABLE.resume.stressBelow`, `ranges.stressCeiling`, `stressClampFloor`, `ACTIVE_TABLE.stress.shakenFloor` (`game/active.js`). Rest itself stays on real time at the bed rates.

**Seen (Sam, Oct 15):** after a withdrawal, Run Back reported "already resting at the checkpoint". The scene showed Forced Retreat / resting, resume when HP ≥ 80% and stress < 50. HP was 80%, stress 51. The resume estimate was about 52 minutes. Changing tabs (Traversal: scout, make camp) and starting Wandering again did not release the rest.

**Verdict:** working as designed; a balance problem, not a defect.
- `[CODE]` rest lowers stress at the bed rate: `bedRecoveryPerDay` bedroll 20, cot 30, bunk 40, bed 50 (`game/active.js` 41). Checkpoint and camp rest are fixed at the Bedroll rate; Base rest uses the current bed, and no bed tiers are built yet, so every rest today runs at the Bedroll rate (`active.js` 83–85).
- At 20 per day, **one stress point costs about 72 minutes of rest.** HP recovers much faster, so stress becomes the only thing holding the gate, even one point over.
- Starting Wandering by hand does not override the gate: the fixed resume gate outranks player choices (spec §13.8, U27). The banner was correct.

**Why it matters:** "basically ready, waiting an hour on one point" reads as broken to a player. It will repeat on every withdrawal until beds exist.

**Options for Sam `[PROPOSED]`** (decide after H2 shows how often it happens):
- **A. Faster rest recovery while resting for the gate.** Direct, but touches the spec rule that bed rates are "deliberately modest so they can't be abused" (§13.8) and the value of bed upgrades.
- **B. Loosen the gate.** For example, release at 80% HP when stress is within a small margin of 50, or let stress keep falling during the run instead of blocking. Keeps bed balance intact everywhere else.
- **C. Wait for bed tiers.** A cot (30/day) cuts the wait to about 48 min per point; does nothing for early players.
- **Guardrail (lead brief 5.1):** whichever option, never sell relief from this wait.

**H2 check:** count withdraw → rest → resume cycles where HP met the gate before stress, and the extra minutes stress added.

## PF2 — Field Medkit is used but heals nothing (defect) — **FIXED Oct 15 (FX5 CLOSED)**

**Cause:** only while resting: the rest step rebuilt HP from its start value each step and erased the heal (the kit or charge was still spent). Fixed in `WS._restStep`; report `handoff/to-design/FX5_COMPLETION_REPORT.md`.

**Seen (Sam, Oct 15):** at low HP, used the Field Medkit (equipped from Gear loadout) through the **Heal** button under the progress bars, and through **More actions → Items → use**. The combat log showed the Field Medkit as used. **HP did not rise.** Not yet observed: whether a charge or the item was consumed.

**Expected:** HP rises by the medkit's heal amount (shared heal rule after FX4).

**Why it matters:** a heal that logs but does not heal costs the player an item for nothing, and it would make H2's results invalid wherever a policy relies on heals (heals come before revive and Forced Retreat in the Downed order, §13.8).

**Questions for Code** (answer with file:line; read-only first):
1. Reproduce: low HP, Field Medkit from the Heal button and from the Items list. Does HP change? Is a charge or item consumed?
2. Which function writes HP on a medkit use, and does the screen or the engine own that write after FX4?
3. Is the heal amount resolving to 0 (for example a missing value in the shared heal rule or the `healPct` path FX4 moved), or is the HP written and then overwritten (for example by the display-only `hpLag` from the Oct 10 HP-bar fix, or a later sync)?
4. Did JD1a's `hasMedKit`/`takeMedKit` change (Fort-bound kit first) affect the use path?

**Handling `[DECIDED Oct 15]`:** a small fix batch **FX5, before H2**; Code investigates read-only first (step 1), then Sam locks the fix. Slice: `fx5-medkit-heal-slice.md`; step 1 is `CURRENT_BATCH.md`.
