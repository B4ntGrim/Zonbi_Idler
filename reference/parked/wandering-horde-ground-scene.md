# Zed Idler — The Horde Ground (Design Brief)

**Companion to:** `wandering-tab-spec.md` (v2.1), `wandering-fort-scene.md`, `wandering-church-scene.md`, `wandering-workshop-scene.md`. Read those first; this document adds the Horde Ground.
**Status:** `[PARKED]` until POI Framework v1 is complete and the Horde Ground is scheduled. Brainstorm captured Oct 3. Everything is `[PROPOSED]` unless tagged otherwise.
**Tags:** `[DECIDED]` confirmed by Sam · `[PROPOSED]` draft · `[OPEN]` needs a decision

---

## 1. Purpose

The Horde Ground is an optional Traversal site where the survivor chooses to hold a position against waves of the dead for the region's best raw RMAT. Where the Workshop keeps runs going, the Horde Ground is where a player **goes looking for a fight**.

*Why it matters for design:*
- **It gives a watching player a real gamble.** Each wave is a push-or-bank decision, the clearest risk ladder in the game.
- **It gives charges a high-stakes moment.** A heal charge spent mid-surge matters more than one spent on a quiet route.
- **It is a home for horde defense.** The lead brief lists horde defense as an unfinished structural gap (7.1, item 8). The Horde Ground is a small, contained version of it that can ship first.
- **It is optional.** It never gates core progression. Randomness and danger stay on optional content (working agreement 6).

---

## 2. Placement and availability `[PROPOSED]`

- One or two per region, placed by the world seed, never on the Fort cell, the Fallow Ground cell or the start cell.
- Visible on the map once the cell is explored, with a distinct marker and a Deadly risk label until scouted.
- **Never cleared for good.** A normal cell clears at 40 kills (`ZI.CELL_CLEAR_KILLS`). A Horde Ground cell resets after each surge. It is always uncleared ground for stress purposes.
- *Why:* the site's purpose is repeat combat. If it cleared, it would become a dead cell, the problem the Church was built to solve.
- `[OPEN]` Unlock timing: available from the start, or only after the Factions page opens so it does not distract from the first session? Proposed: after Fallow Ground is turned in.

---

## 3. The surge: how a session plays

1. **Prepare (optional).** Spend materials to fortify (Section 5).
2. **Commit.** The prompt shows the stakes: wave count, current stress, gear condition and the reward for each wave. The player starts the surge.
3. **Waves.** Each wave resolves automatically, like any zombie encounter (13.1). Between waves, a short prompt: **Hold** or **Bank and leave**.
4. **End.** The surge ends when the player banks, reaches the final wave, or stress hits 100 (Breaking, a forced retreat).

Sample screen (terminal style):
```
[TRAVERSAL E6] > HORDE GROUND  Wave 3 of 6 cleared
  Kills: 58   HP: 61/100   Stress: 66/100   Wear: ×1.25
  Haul: RMAT T2 ×4, Scrap ×9         Next wave: LARGER (scout?)
  > HOLD        > BANK AND LEAVE        (30s)
```

---

## 4. Player interactions

### 4.1 The commit decision
- Starting a surge is always the player's choice. The background engine and offline catch-up **never** start a surge.
- *Why:* a surge is a story moment like a Fort, and it should be attended. It also stops the policy from walking the survivor into the most dangerous site in the region while the player sleeps.

### 4.2 Hold or bank between waves
- Each wave pays more and costs more (larger waves, more stress, more wear).
- **Haul is at risk until banked.** A forced retreat loses part of the surge haul, like any run (13.8). Banking keeps all of it.
- If the player does not answer before the timer ends, the **policy default** decides:

| Policy | Default between waves |
|---|---|
| Ethical | Bank |
| Immoral | Hold while stress is below 60 |
| Criminal | Hold while stress is below 70 |
| Heinous | Hold while stress is below 85 |

- *Why:* nothing waits on the player (13.2), and the default keeps a distracted player from losing everything.

### 4.3 Tool moments
- **Scout** reveals the next wave's size and the odds of holding. At high Discovery, it can also lower the next wave by one step.
- **Heal** mid-surge is the clutch use for heal charges.
- Fumble chances from stress (13.8) apply, so a stressed survivor may waste a charge at the worst moment. That is the stress system's purpose, showing up where it is felt.

### 4.4 Preparation (horde-defense layer)
See Section 5.

---

## 5. Fortification `[PROPOSED]`

Before committing, the player can spend materials to prepare the ground:

| Fortification | Effect | Feeds |
|---|---|---|
| Barricade | Reduces wave damage | Engineering |
| Spike line | Thins each wave | Smithing |
| Noise trap | Splits a wave; lowers stress gained | Mechanical |

- Fortifications last for one surge.
- *Why:* this adds a planning step for players who like to prepare, connects the base skills to combat, and gives the horde-defense gap a small first version that can grow into camp defense in Camp Leader.

---

## 6. Rewards and economy

- **Best raw RMAT tier in the region**, rising per wave. The final wave has a small chance at one tier above the region's normal tier.
- **Diminishing returns:** a cooldown between surges at the same Horde Ground (starting 8 real hours). `[PROPOSED]`
- *Why:* without a cooldown, the Horde Ground becomes the only place worth farming, and RMAT floods the economy. The cooldown keeps it a special trip.
- **Economy note:** the Horde Ground is a major RMAT **source**. The Workshop (bench work) is a sink; the Church's economy role is `[PARKED]` (Church brief §1, Oct 9). Add them to the economy audit together.

---

## 7. Risk and failure

- Stress gains are high: uncleared ground plus combat. The policy stress multiplier applies (13.8).
- Gear wear rises per wave (starting ×1.25 from wave 3, ×1.5 from wave 5).
- Breaking (stress 100): forced retreat, part of the surge haul lost, stress resets to the Shaken floor (80; was 60, PF1 Oct 16). On Hard, the normal forced-retreat item loss applies (15.3).
- Downed: sent home with part of the haul, as in a normal run.
- No death and no permanent loss beyond the normal Hard-mode rule. Consequences, not punishments (design pillar).

---

## 8. Combined with other sites

- A Workshop near a Horde Ground lets a player repair between surges. A Church near one lets them shed stress. Placing these sites a few cells apart turns a region into a loop: fight, mend, calm, repeat.
- `[OPEN]` Should world generation try to place a Workshop within reach of each Horde Ground? Proposed: yes, as a soft preference, not a guarantee.

---

## 9. System touchpoints

| System | What the Horde Ground does |
|---|---|
| Traversal | Repeatable combat site; never clears |
| Combat | Wave-based automatic encounters |
| Stress and wear (13.8) | Rising stress and wear per wave; the cost of holding |
| Tools (13.3) | Clutch use for scout and heal charges |
| Base skills | Fortifications feed engineering, smithing and mechanical |
| Economy | Major RMAT source, balanced by cooldown and by Workshop sinks (Church role `[PARKED]`) |
| Horde defense gap | A contained first version; later grows into camp defense |

---

## 10. Integration notes `[PROPOSED]`

- Data: `HordeGroundSite` with wave table (size, reward, stress, wear per wave), cooldown and fortification recipes.
- Surge rolls use the shared `RollEncounter` and `ResolveEncounter` functions (spec 10), never a separate simulation.
- `playerPresent` must be true to start a surge. Between-wave defaults use the same timer-then-policy rule as discovery prompts.
- Surge haul is held in saved state, not screen memory, so closing the app mid-surge does not lose it. (Same issue already open for wandering haul.)
- All XP through `ZI.emitAction`.

---

## 11. Open questions

1. Unlock timing: from start, or after Fallow Ground (proposed)?
2. Number of waves, wave growth and reward per wave.
3. Cooldown between surges (8 hours proposed).
4. Fortification list, costs and effects.
5. What happens if the app closes mid-surge: resolve the current wave and bank by policy default (proposed)?
6. Soft placement near a Workshop (proposed yes).
7. Camp Leader version, which becomes camp defense (park for later).
