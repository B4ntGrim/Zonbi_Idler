# BALANCE-03 — Round 7 simulation plan: consumable-only healing and the first Downing (Oct 18)

**Status:** plan for review. No simulation run yet. No UI, production code or save changes.

**Source:** Sam's Oct 18 proposal, *"Healing, first Downing, and Mystic Jester"*. It supersedes the earlier free-charge statements:
- the 2 free charges that refill;
- the ordinary tutorial Medkit.

Round 6 relied on free charges refilling after rest, so it does not validate this design.

## 1. What changes from round 6
| Item | Round 6 | Round 7 |
|---|---|---|
| Free base heal charges | 2, refilled after every rest | **None.** The 2 base charges in code are set to 0 in the simulation |
| Ordinary Medkit | Tutorial Medkit added directly | **Only from a defined acquisition source**, with the assumption disclosed per set (§4) |
| Fort-bound Med Kit | Not modelled | Granted by the Jester; story item, no charges, never counted as healing |
| First Downing | Not modelled (H2 start fixture) | **Real sequence** (§3); reported separately from daily Downings |
| Starter kit at save creation (code fallback) | Present in code | **Off** in all sets: it grants an ordinary Medkit, which is not authorized (question Q4) |
| Stress ×¼, heal tied to the zombie, EN3 ×2 | Bundled in the candidate | Kept `[PROPOSED]`; tested **one at a time and together**, never assumed |
| Option C 40/30 + rule 5 | On | On (heal only when a carried item supplies a charge; otherwise retreat at 30%) |

## 2. Sets
**Run settings:**
- matched seeds 101–505;
- 4 starts;
- 7 days, returns every 8 h;
- traversal on;
- ethical policy first.

| Phase | Sets | Purpose |
|---|---|---|
| **A. No healing items at all** | (A0) decided rules only · (A1) + stress ×¼ · (A2) + heal tied to the zombie · (A3) + EN3 ×2 · (A4) all three | The floor: what play looks like with no charges, and what each proposed lever adds on its own |
| **B. Defined supply only** | A0 and A4, each with every supply source Sam approves (§4) | Shows how much one source changes A0 and A4 |
| **C. Tutorial → Jester sequence** | A0 and A4 with the real first-Downing sequence, for a tutorial completer and a skipper | Checks reward placement and capacity; separates the intro Downing |
| **D. Policies** | The best 1–2 sets × immoral, criminal, heinous | Robustness |

About 20–26 sets of 20 runs each.

## 3. The tutorial-to-Jester sequence (test model)
**Test environment only:** the Jester switch is on (JD1a, isolated save, never the real save).
1. The tutorial pages are complete; the save is eligible.
2. A staged strong opponent is met early in play and causes the first Downing (definition: Q3).
3. The first Downing goes to the Jester's camp, which already exists in code (`Jester.firstDowning`).
4. The meeting plays at the next return (S4: Wandering waits for it).
5. **Rewards**, under normal inventory rules with no capacity bypass:
   - the **pouch first**;
   - then the settled S3 rewards (Q5): Old Padded Jacket, the chosen weapon, scout kit and 2 rations;
   - and the **Fort-bound Med Kit** as a story item.
6. **Skipper:** U14/U23 behaviour as settled (Q6).

## 4. Supply sources that exist in code (Sam chooses which to model)
| Source | Code fact | Notes |
|---|---|---|
| Shop "Field Medkit ×3" | Unlocks at 1.5 km lifetime distance; **no cost set**; repeatable (`economy.js:225`) | How often is it claimed? |
| Faction contract reward | 1 Medkit; needs Diplomat 5 and `vest_t3` (`factions.js:45`) | Late game; out of the 7-day window |
| Crafting recipe | **Not in code.** The tutorial spec says the recipe is available from the start `[DECIDED]` | Cost and time undefined |
| Starter kit at save creation | `ensureStarterKit` grants a Medkit (switch-off fallback and legacy saves) | Conflicts with this slice; off in all sets |

## 5. Report for every set
**Per day:**
- field time (exploring + walk back), distance and encounters;
- recovery time, split into HP rest and stress-only rest;
- Medkit charges used and fumbled, and items depleted;
- rescues;
- full Downings (daily), with the intro Downing as its own line;
- stress by source.

**Danger relative to progress:**
- Downings per km and per 100 encounters;
- by tier, equipment (start) and combat-level band.

**Supply:** the assumption for each set, and medkits acquired, used and left at day 7.

## 6. Open questions for Sam
1. **Heal size per Medkit charge.**
   - The simulation's heal uses the First Aid formula: 20% + 1.2% per level, max 75%, so about 20–40 HP early.
   - The Field Medkit's item data says "+60 HP over 8 s".
   - Which one applies to a charge? This changes how much one Medkit is worth.
2. **Early Medkit supply.**
   - Without free charges and the starter Medkit, the first week has no ordinary Medkit unless a source is defined. Which should the simulation model?
     - **(a)** none (pure floor);
     - **(b)** the 1.5 km shop item, claimed how often?
     - **(c)** a crafting recipe, with cost and time to be proposed.
3. **The staged strong opponent.** What is it?
   - a fixed bestiary record, or a tier above the band;
   - when does it appear (first Wandering encounter after the tutorial, or after N encounters);
   - is the Downing guaranteed?

   Recommended: a scripted, guaranteed Downing, so the introduction never depends on chance (pillar: no core progression behind randomness).
4. **Starter-kit fallback.**
   - The code grants an ordinary Medkit at save creation when the Jester is off, and once to legacy saves.
   - Should those paths lose the Medkit, so no save gets an unapproved free one?
5. **Settled rewards.**
   - Your proposal names the pouch and the Fort-bound Med Kit.
   - The settled S3 rewards also include the Old Padded Jacket, the chosen weapon, the scout kit and 2 rations.
   - I'll keep all of them unless you say otherwise. Confirm?
6. **The intro Downing's costs.** Does the first Downing apply the same costs as later ones?
   - the full-Downing +5 stress;
   - haul loss, though the Jester's trade (S2) already takes the run haul.
7. **Skipper path.** Keep U14/U23?
   - A skipper meets the Jester later without the starter kit.
   - At that meeting the skipper gets only the Fort-bound Med Kit.

## 7. Documents affected once Sam confirms (not edited yet)
- **Spec §13.3:** remove base charges and record the consumable-only rule.
- **Elder Jester concept U21:** the note "early healing from daily base charges" is superseded.
- **Tutorial spec:** Med kit in pocket 1, crafting recipe.
- **JD1a fallback:** the starter Medkit.
- **Option C note:** heal only from a carried item.
