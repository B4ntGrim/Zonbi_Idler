# Zed Idler — Playtest Findings (Oct 15)

**Status:** Current. Findings from Sam's real-game play, from Oct 15 (after JD1a closed); PF3 added Oct 16; PF4–PF10 added Oct 21. Not a batch and not a build input. Each finding needs a decision from Sam (and, for defects, facts from Code) before any fix is scheduled.
**Why this file exists:** H2 needs a punch-list of problems seen in real play so the simulation can confirm or rule them out. Add new findings here as PF3, PF4, … with what was seen, what was expected, and why it matters.

---

## PF1 — Stress alone holds the resume gate (balance) — **DECIDED Oct 16 (Sam)**

> **Kept from the local copy (Code, Oct 21 apply):** the export showed PF1 as `[OPEN]`; the Oct 16 decision below stands.

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

> **Oct 21:** PF4 below is Sam's direction for a version of option A limited to making camp.

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

## PF3 — Craft progress bar doesn't keep pace with the game clock (suspected defect) `[OPEN]`

**Seen (Sam, Oct 16; screenshot):** on Crafting Recipes, the craft job bar for **Runner's Cloak** (craft time 120 min, label "120m") moves out of step with the game. The in-game clock runs faster than real time, but the bar seems to advance at a different rate, so a 120-minute craft doesn't fill in the time the game clock says 120 minutes takes.

**Expected:** one clock. The bar fills at the game clock's rate. A 120 game-minute craft completes when the game clock has advanced 120 minutes, and the label counts down the time remaining on that same clock.

**Why it matters:** this is the same family as FX3 (buffs judged by the simulation clock) and H1's "one clock" rule. If crafting reads a different clock than the rest of the game, the bar misleads the player, and watched play and offline returns may finish crafts at different times.

**Not covered by H2:** H2 excludes crafting, so the 80-run baseline won't detect or affect this.

**Questions for Code** (read-only first; answer with file:line):
1. Which clock does a craft job's progress read: real time (`Date.now`), the H1 simulated clock (`ZI.installClock`), or the in-game time of day? Which clock does the bar's width read, and which does the job's completion read? Are they the same?
2. What is the game-to-real time ratio, and where is it defined?
3. Is the "120m" label the total craft time or the time remaining? Does it count down?
4. On an offline return, does a craft finish at the same game time it would in watched play?
5. Do other timed jobs (Schedule camp jobs, Routes runs) share the craft timer or have their own?

**Handling `[PROPOSED]`:** a small fix batch **FX6**, run like FX5: Code investigates read-only, then Sam locks the fix. Recommended timing: after H2 step 4, since H2 doesn't touch crafting; Sam can move it earlier.

## PF4 — Making camp doesn't speed up checkpoint rest (design gap) `[DECIDED Oct 21]`

> **Decided Oct 21 (Sam):** the proposal below is accepted; see TRAV-01 T12.

**Seen (Sam, Oct 21):** while Wandering, the survivor is injured and withdraws to rest at its checkpoint. The player opens Traversal, clicks the survivor's cell and chooses **Make camp**. The rest continues at the same speed.

**Sam's direction `[CONCEPT Oct 21]`:** making camp should speed up the rest at the checkpoint.

**What exists `[CODE]` / `[DECIDED]`:**
- Checkpoint and camp rest run at the Bedroll rate (PF1).
- Make camp no longer cures the injury; injuries are cured by items (Field Bandage) and the once-a-day deliberate Rest roll (Oct 19, O5 and O9).
- Make camp doesn't count toward the Broken release (D4c) and clears a saved return (D1).
- The deliberate Rest (Batch B, once per real day: +25 HP, −10 stress, 8% injury cure) is the existing player-chosen rest action.

**Proposal `[PROPOSED]`:**
- **What camp speeds:** stress recovery, the thing that actually holds the gate (PF1). With regen, HP is already fast. The injury stays item-cured.
- **How much:** resting at a camp cell recovers stress at the **next bed tier up** (Cot, 30 a day, instead of Bedroll, 20). Reuses the bed ladder; no new rate.
- **Cost:** camp rest uses camp food (FOOD-01 O9), so camping costs supplies.
- **Abuse guard:** the bonus applies only while resting at the cell where the camp stands, and only for rest that the gate requires.
- Camp rest is its own stress-relief source with its own limit (no shared budget, decided Oct 21).

**Why it matters:** the player took a deliberate action at the right moment and nothing changed. That reads as broken, and it is exactly the attention-worthy moment the design rules say should be rewarded.

**Questions for Code (read-only):** what Make camp does today (cost, effects, where the camp cell is stored), and whether checkpoint rest can read the camp cell.

## PF5 — Scouting a cell can be clicked endlessly for Stealth XP (suspected defect / exploit) `[DECIDED Oct 21: 5–10 scout charges a day]`

> **Decided Oct 21 (Sam):** 5 to 10 scout charges per day (start 5, test 10). See `trav-01-traversal-slice.md` T1.

**Seen (Sam, Oct 21):** on Traversal, clicking Scout on a cell again and again keeps granting Stealth XP.

**Expected:** scouting has a cost and a limit. Spec §13.3 `[DECIDED]`: scout uses **charges** (base charges refill daily; scout kits carry their own).

**Why it matters:** unlimited XP from a free click breaks earned mastery and skill floors, and it makes Stealth meaningless as a measure of play.

**Proposal `[PROPOSED]`:** a Traversal scout spends a scout charge like the Wandering scout; XP is granted only for the first scout of a cell per game day. With no charges left, the button is greyed with the reason.

**Questions for Code:** what Traversal Scout does today (charges, XP amount, cooldown, effect on the cell), with file:line.

## PF6 — Looting a cell opens Routes; Routes has dead buttons (suspected defect) `[OPEN]`

> **Oct 21:** Routes is being redesigned as a route builder over Traversal (`route-01-route-builder-concept.md`). Code's answers still needed.

**Seen (Sam, Oct 21):** looting a Traversal cell sends the player to the Routes screen. Some Routes buttons do nothing.

**Expected:** the loot result appears on Traversal, where the player acted. Routes is a separate tab (tutorial spec §7.4); `[CODE]` an earlier report already noted Routes opening by default as a bug.

**Questions for Code:** why the loot action navigates to Routes; which Routes buttons have no handler.

## PF7 — No visible day / date clock (design gap) `[DECIDED Oct 21]`

> **Decided Oct 21 (Sam):** Year and Day only, Days 1–364, Day 365 starts the next year; afflictions (with injury time) show on Traversal where the available-survivors section was. See TRAV-01 T3–T4.

**Seen (Sam, Oct 21):** when making camp for a 24-hour rest cycle, there is no day, month or year display.

**What exists `[CODE]`:** the game clock runs at 1 game hour = 6 real seconds; rest, injuries and the deliberate Rest run on real time (real day, local midnight reset).

~~Proposal: game day and time ("Day 14 · 06:20").~~ Superseded Oct 21 by the Year and Day decision. Still proposed: real-time countdowns labelled as real time.

## PF8 — Hide does nothing (design gap) `[DECIDED Oct 21]`

> **Decided Oct 21 (Sam):** Hide reveals the zombies lurking in the cell (count and kinds) and points to their Codex entries. See TRAV-01 T2; proposed: Hide marks entries *sighted*, full stats still unlock by fighting.

**Seen (Sam, Oct 21):** Hide shows "You stay low and let the noise from C2 pass. Nothing follows you." with no visible effect.

**Rule:** no dead ends and no buttons that only print text (design rules §4).

~~Proposal: Hide lowers encounter chance.~~ Superseded Oct 21 by Sam's reveal decision.


## PF9 — Scouting and wandering a cell should make it safer and richer (design direction) `[DECIDED Oct 21]`

> **Decided Oct 21 (Sam):** familiarity raises loot safety, loot amount and camp rest. **Looted cells do not regrow** (corrected Oct 21); loot stays once per cell, so familiarity improves that one loot. See TRAV-01 T6–T7. Routes tie in through ROUTE-01.

**Seen (Sam, Oct 21):** moving east, scouting the new cell trains Stealth, but the cell's loot safety (for example 61% safe) doesn't rise and no loot comes from it.

**Sam's direction:** time spent in a cell (scouting, wandering) should raise **loot safety**, increase **loot amount**, and make **resting easier** there. The tutorial should explain this.

**What exists to reuse:** cell **familiarity** (unexplored → explored → cleared; cleared comes from kills while stationed, §13.8). Cleared ground already lowers walking stress and spaces out encounters (EN1).

**Proposal `[PROPOSED]`:** each familiarity step raises the cell's loot safety and loot amount and improves camp rest there. Scouting moves a cell from unexplored to explored.

**Conflict resolved Oct 21:** loot stays **once per cell** (no regrowth, Sam). "More abundant" means familiarity raises the amount and safety of that one loot, so working a cell before looting it pays off.

**Tutorial:** one Traversal step explaining familiarity: "The more you work a cell, the safer and richer it gets."

## PF10 — Camp Leader controls show in Solo (design gap) `[DECIDED Oct 21]`

**Seen (Sam, Oct 21):** Traversal shows an available-survivors list and Scavenge, Contracts, Training, Patrol and Raid buttons that do nothing in Solo Survivor.

**Decided Oct 21 (Sam):** remove that section in Solo; afflictions take its place. The controls return with Camp Leader. See TRAV-01 T4–T5.

## PF13 — Traversal has no pushback from zombies (design gap) `[CONCEPT Oct 22]`

**Seen (Sam, Oct 22):** Make camp, Travel and Hide carry no risk. The player can camp in a zone full of zombies and nothing reacts. Only a failed Loot roll causes damage.

**Sam's direction:** the world must push back on Traversal actions, driven by the zombies' Codex identity. To be balanced through audits.

**Director's proposal `[PROPOSED]`:** actions make noise (Scout quiet, Hide silent, Travel moderate, Loot loud, Make camp loud and lasting); the zone's zombie kinds react by their traits (runners chase movement, hearing-led kinds come to noise, ambushers hit camps); outcomes reuse existing systems (Wandering fight, damage and stress, camp broken). Counterplay: Scout and Hide information, familiarity lowers pushback, Stealth lowers noise. Applies only to Traversal actions the player chooses, never to idle Wandering.

**Depends on:** zones owning their zombies (tier-band batch). Designed together with TRAV-01b (familiarity is the reward side, pushback the risk side). Numbers only after a simulation audit.
