# BALANCE-03 — Confirmation of Sam's Oct 19 defaults (Oct 19)

**Status:** simulation only. **5 seeds** (101–505) × 4 starts × 7 real days. 120 runs, all completed.
- "FAIL" appears only as harness check D7 (HP above 100) in sets with HP growth. That check is the harness's own limit; it isn't a game error.
- No production code, UI or real save changed.

**Clock:** every "per day" figure is per **real day**.

## 1. Sets
| Set | Content |
|---|---|
| **C0** | Baseline N0: decided Oct 18–19 rules. Rule 5 covers policy events; resume after a Forced Retreat; Broken with in-between penalties; repairs at returns; Default gear; spacing EN3 ×2 (proposed lever) |
| **C1** | C0 plus **all of Sam's Oct 19 defaults** (values `[PROPOSED]`):<br>• Broken movement −30%;<br>• crawlers at 30% to hit, 3–6 damage, 60% escape;<br>• groups on 5% of walks, cap 3 a day, injury 50%;<br>• Improvised Long Blade (31 damage, 75 durability, 35 Metal + 15 Wood);<br>• +2 max HP every 3 levels;<br>• Medkits stack 3 per pocket;<br>• Scavenging 4× for 2 h after each return;<br>• injury 3 real hours;<br>• first Jester camp 3–5 real days with a hidden 1.5× recovery perk |
| **C1b** | C1 with the Long Blade made from **50 Metal only** |
| **C2** | C1 with the **Heinous** policy, plus "any group is hostile if Heinous" |
| **C2a** | C2 with groups reacting by **standing only** |
| **C2b** | C2 with **no groups** (Heinous control) |

## 2. Results (per real day; tutorial survivors / skipper)
| | C0 base | **C1 defaults** | **C1b Metal-only blade** | C2 Heinous | C2a Heinous, standing only | C2b Heinous, no groups |
|---|---|---|---|---|---|---|
| **Downings** | 1.5 / 3.0 | 0.7 / 2.1 | **0.4 / 1.6** | 4.7 / 7.7 | 4.6 / 7.9 | 3.9 / 6.7 |
| **Downings per km** | 0.01 / 0.03 | 0.01 / 0.03 | **0.01 / 0.02** | 0.27 / 0.58 | 0.27 / 0.64 | 0.19 / 0.41 |
| Field time (Wandering) | 61% / 53% | 48% / 40% | 50% / 43% | 33% / 28% | 33% / 27% | 34% / 28% |
| Scavenging hours | — | 4.9 | 4.9 | 4.9 | 4.9 | 4.9 |
| Distance | 99 / 87 km | 77 / 65 | 80 / 70 | 17 / 13 | 17 / 12 | 21 / 16 |
| Time Broken | 3% / 3% | 1% / 4% | 1% / 3% | 61% / 64% | 61% / 64% | 57% / 59% |
| Fights with weapon worn out or none | 21% / 28% | **34% / 44%** | **9% / 21%** | 56% | 57% | 56% |
| Average weapon damage | 16 / 12 | 17 / 14 | **28 / 25** | 11 | 11 | 11 |
| Repairs blocked (no materials) | 0 | **0.9** | 0 | 1.1 | 1.1 | 1.1 |
| Medkits crafted / charges used | 1.25 / 1.7 | 2.09 / 2.7–3.7 | 2.09 / 2.5–3.5 | 2.09 / 3.7 | 2.09 / 3.8 | 2.09 / 3.8 |
| Pursuer Downings | — | 0.05 / 0.09 | 0.02 / 0.03 | 0.10 / 0.17 | 0.15 / 0.17 | 0.20 / 0.23 |
| Groups: friendly / neutral / hostile | — | 2.0 / 0.5 / 0.0 | similar | 0 / 0 / 2.7 | 0 / 0.1 / 2.7 | — |
| Max HP at day 7 (level) | 100 | 106 (about 11) | 106 | 109 (about 16) | 109 | 109 |
| Pocket-blocked Medkit loads | 0.28 / 0.43 | 0.13 / 0.20 | — | 0–0.23 | — | — |

**Other measures:**
- **First Jester camp:** stays an average of **4.4 real days**. The hidden perk applied to about 3 hours of the tutorial survivor's rest over that stay.
- **Lasting injury (3 real hours):** about 0.01 h a day when ethical, 1.1 h a day when Heinous.

## 3. Findings
1. **The defaults hold:** ethical play lands at **0.4–2.1 Downings a day, 0.01–0.03 per km**. Wandering takes 40–50% of the day, plus about 5 hours of Scavenging.
2. **The Long Blade's Wood cost breaks its repairs.**
   - Repairs cost half the recipe in proportion to the damage, so the blade needs up to 8 Wood per repair. Wood comes only from looting new squares (about 9 a day), and Medkits, gloves and the blade compete for loot.
   - So about 0.9 repairs a day were blocked, and the blade was worn out in 34–44% of fights. Average damage stayed at 17.
   - **With a Metal-only recipe (C1b),** worn fights fall to 9–21%, damage reaches 25–28, and Downings drop further.
   - *Design lesson in brief:* **a repair cost inherits the recipe's scarcest material.**
3. **Crawlers:** one pursuer Downing per 11–20 real days for ethical play (target: 5–10 days). Slightly milder than aimed, but near target.
4. **Groups at 5% with a cap of 3 a day:** about 2–2.5 meetings a day for ethical play, mostly friendly. Each one now reads as an event.
5. **Heinous play is harsh even without groups** (C2b: 3.9 / 6.7 Downings a day, Broken about 58% of the time, 13–21 km a day).
   - The cause is Heinous risk-taking: failed ventures add about 520–560 stress a day, against about 90 for ethical play.
   - Groups add about +0.8–1.0 Downings a day, at about 2.5 hostile meetings.
   - **"Any group is hostile if Heinous" changes nothing** (C2 ≈ C2a): Heinous play already drives standing below 0, so the standing rule alone makes groups hostile.
6. **Scavenging 4×** roughly doubles Medkit supply (1.25 → 2.09 a day). Stacking 3 per pocket removes most pocket blocks.
7. **HP growth** is small, as intended: 106–109 max HP by day 7.

## 4. Recommendations for Sam
1. **Heinous (O3):** drop the "any group if Heinous" clause. **Standing alone decides** `[PROPOSED]`.
   - *Why:* identical results, one rule instead of two, and the player's own actions are visibly what turned the road hostile.
   - **Flag:** Heinous play is very punishing on its own (about 58% of the time Broken). Raise it as its own question; it's outside this slice.
2. **Long Blade recipe:** Metal only (about 50 Metal) `[PROPOSED]`, or keep Wood and give it a Metal-only repair cost.
   - *Why:* Metal is plentiful from recycling, so the first weapon stays repairable, which is the whole point of the upgrade.
3. **Crawlers:** keep the defaults, or nudge the hit chance to 35% to reach "one in 5–10 days". It's minor either way.
4. **Everything else:** confirmed as tested. The values become the starting data-table values for Batches A–C once Sam accepts them.
