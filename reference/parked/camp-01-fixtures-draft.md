# CAMP-01 — Camp fixtures (draft)

**Status:** `[PARKED]` until the Block 3 camp answer is reviewed (`reports/oct22-readonly/READONLY_REPORT.md`, Q8). Rebuilt Oct 22 by the Creative Director; Sam to confirm. Filed Oct 29 from the Oct 22 instruction blocks (see `../oct22-decisions-wpn02-pf13-route-alc-perk.md`).

| Fixture | What it does | Feeds | Noise or scent |
|---|---|---|---|
| Bedroll → proper bed | Stress recovery of 20–50 per day (spec §13.8) | Rest | None |
| Cooking fire | Turns raw food and fish into meals | FOOD-02, Nutrition | Noise 3 with a fire; sets scent |
| Generator | Charges batteries while the player is away; runs on fuel | E-bike, prototypes, angle grinder | Noise 2 while running |
| Workbench | Field repairs and crafting at camp | Smithing, Mechanical | Noise 2 |
| Storage crate | Holds items at camp | Carrying | None |
| Rain barrel | Holds water for later systems; inactive for now | Parked | None |

All fixtures use the existing timed-job system and the 24-hour offline cap (CLOCK-01).

## Companion notes — pity principle `[PROPOSED]`

| System | Pity pushes toward | Step | Cap | Resets when |
|---|---|---|---|---|
| Later Forts | A good find | +0.25% | None set | A Fort is found |
| PF13 trait encounters | Pressure | +5% per miss | 75% of total chance | An encounter happens, or the cell is cleared |
| Silent Hunter in Travel | Pressure, slowed | +2.5% | Same | Same |
| Booze dependence | A penalty | Rises from the 5th drink | 50% `[DECIDED Oct 22]` | The game day ends |

Rules: (1) a pity timer can push toward a reward or toward pressure; (2) a pressure timer must be visible to the player; (3) a pity timer never gates core progression.
