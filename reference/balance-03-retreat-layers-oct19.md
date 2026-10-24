# BALANCE-03 — Walk home and layers round (Oct 19)

**Status:** simulation only, a **screening round** (3 seeds instead of 5, so differences under about 1 Downing a day are within noise). No production code, UI or real save changed.

**Clock:** every "per day" figure is per **real day**.

**Governing measure:** Downings per km (Sam). Field time of 55–63% is accepted (Sam, Oct 19).

## 1. Baseline N0
**Decided rules (Oct 18–19):**
- Option C 40/30;
- rule 5 now also **pauses roadside policy events** on the walk home `[DECIDED Oct 19]`;
- near-death 1/1/3; top-up +5; no free charges; Medkit recipe; skipper pouch; loot damage;
- crafting and recycling pause Wandering;
- a Forced Retreat returns the survivor home instantly, then after rest **it resumes Wandering where it was** `[DECIDED Oct 19]`;
- Broken model (stress resets to 80; HP-only resume; overload ×2; Monopoly release) with penalties **between mild and harsh** `[DECIDED Oct 19]`: −18% max HP, 18% of attacks lost, +5% damage taken (values proposed).

**Player choices (disclosed):**
- repair at each 8-real-hour return, below 50% durability;
- craft Default-unlock gear before Medkits (Iron Knuckles if no weapon, Scrap Helmet, Leather Gloves).
- Not included: automatic repair (parked for the Shop) and the Pipe Pistol (its damage stacking is unconfirmed).

**Proposed lever:** encounter spacing EN3 ×2.

**Runs:** seeds 101, 202 and 303 × 4 starts × 7 real days. Every set is N0 plus **one** layer.

## 2. Results (per real day; tutorial survivors / skipper)
| Set | Layer (all values proposed) | Downings | Downings per km | Field time | Notes |
|---|---|---|---|---|---|
| **N0** | Baseline | **1.4 / 2.6** | **0.01 / 0.03** | 61% / 54% | 100 / 90 km; Broken 2–3% of the time |
| R1 | **Crawlers** on the walk home: 0–2 per walk (60/30/10%), 70% slip away, 20% to hit, 2–5 damage (armor −1 per 10), 15 HP | 1.0 / 1.4 | 0.01 / 0.02 | 61% / 56% | 36–42 met a day, 11–13 fought, about 4 HP damage a day. **Pursuer Downings: 0.02–0.05 a day** (one per 20–50 real days) |
| R2 | **Groups by standing:** met on 20% of walks; friendly at standing Known or better (≥ 250) escorts (walk halved, no pursuers); neutral passes; hostile below 0, or any group if Heinous (see note) | 1.9 / 1.7 | 0.02 / 0.02 | 60% / 56% | Ethical standings: **11–14 escorts a day**, 2.5–3 neutral, **0.2–0.3 hostile** |
| R2h | Worst case: every group met is hostile | **8.0 / 12.6** | 0.17 / 0.39 | 43% / 35% | 12–14 hostile a day; Broken 44% of the time; 6–7 injuries; 11–16 items stolen; about 2 h a day walking back out after being sent home |
| R3 | Crawlers + groups | 1.6 / 1.7 | 0.02 / 0.02 | 60% / 55% | Escorts replace some pursuer walks |
| B1 | Broken: movement −30% | 1.6 / 2.1 | 0.02 / 0.02 | 60% / 55% | No measurable effect |
| B2 | Broken: +25 points fumble chance | 1.4 / 2.6 | 0.01 / 0.03 | 61% / 54% | Identical to N0: no heal attempted while Broken |
| B3 | Both | 1.6 / 2.1 | 0.02 / 0.02 | — | No measurable effect |
| T1 | **First crafted tier:** 75 durability (starter T0 = 50), +15% stats | 1.6 / 2.2 | 0.02 / 0.02 | 61% / 55% | Skipper: worn-weapon fights 26% → 16%, damage 12 → 16. Tutorial survivors unchanged |
| H1 | **+2 max HP every 3 character levels** | 1.5 / 1.1 | 0.02 / 0.01 | 62% / 57% | Level about 11 by day 7, so 106 max HP |
| M3 / M5 | **Medkit stacking**, 3 / 5 per pocket | 1.5 / 2.5 (both) | 0.02 / 0.03 | 61% / 54% | Pocket-blocked loads 0.33–0.52 → 0.06–0.14 (M3) or 0–0.05 (M5). No change in Downings at current supply |
| S1 | **Solo Scavenging** 2 h after each return, ×1 | 1.4 / 1.9 | 0.02 / 0.03 | 44% / 40% | Medkits 1.33 → 1.60 |
| S2 | ×2 | 1.2 / 1.1 | 0.02 / 0.02 | 46% / 40% | 1.89 / 1.76 |
| S4 | ×4 | 0.5 / 1.0 | 0.01 / 0.01 | 47% / 42% | 2.11 / 2.24; Leather Gloves reached in 3/9 runs |
| S8 | ×8 | 0.4 / 1.0 | 0.01 / 0.01 | 48% / 43% | 2.9 / 2.9; skipper pockets block 1.1 loads a day and 6.7 Medkits pile up in stash |

**Notes:**
- **Hostile reaction** (R2 and R2h): +5 stress (mocked); a 50% chance of the existing lasting injury; if the survivor is already Broken, its haul is stolen; then it enters Broken and is sent home to rest. **A hostile send-home is not counted as a Downing.**
- **Scavenging hours and field time:** Scavenging runs about 4.9 h a day (2 h × 3 returns from its unlock at real day 1.7). Field time in S1–S8 excludes those hours; the raw figure counted them as field time. Distance falls from 100 to 72–79 km (tutorial survivors), so **each hour scavenging costs Wandering**, as intended.
- **H1 runs show harness FAIL D7.** This is the harness's own check that HP never exceeds 100; it isn't a game error. The game code has no 100 HP cap. The check would need updating when HP growth is implemented.

## 3. Findings
1. **Pausing policy events on the walk home is the big result:** N0 sits at **1.4–2.6 Downings a day (0.01–0.03 per km)** with 54–61% field time, which meets every target so far.
2. **Crawlers, at these values, are a scratch rather than a threat:** about one pursuer Downing per 20–50 real days. Sam asked for "a chance, but very low". This may be lower than intended.
3. **Groups met at a 20% rate are too frequent for an attention moment.** With ethical standings they mean 11–14 escorts a day, mostly friendly. If each friendly group offers a trade screen, that's a prompt every couple of hours. Hostile reactions are rare for an ethical player (0.2–0.3 a day) but severe if frequent (R2h).
   - A **Heinous player would face R2h-like days** under the "any group if Heinous" rule. That needs its own test before it's locked.
4. **Making Broken harder doesn't show in the numbers,** because the survivor is Broken only 2–3% of the time. The penalties apply when it happens. Sam can choose them by feel without changing balance.
5. **The first crafted tier helps skippers only.** For tutorial survivors, no Default craftable weapon beats the starter (Nail Bat 28 damage; Crafted Iron Knuckles 18; Pipe Pistol 20). **Design gap:** "crafted gear is a bit better than starter gear" can't hold for weapons until an early craftable melee weapon exists without an Armory rank.
6. **HP growth is small and steady,** as asked: +6 max HP by day 7. Its effect is inside the noise of this screening.
7. **Stacking only matters once supply exceeds pockets.** That happens with Scavenging at ×4–×8, mostly for one-pocket skippers.
8. **Scavenging works as a trade:** 2 h after each return costs about 25% of distance. At ×4 it adds about 0.8–1.0 Medkits a day; at ×8 it doubles supply and Downings drift down to 0.4–1.0 a day.

## 4. Decisions for Sam
1. **Crawler strength:** accept "one per 20–50 days", or raise it? For example, to 30% to hit, 3–6 damage and a 60% escape.
2. **Groups on the walk home:**
   - **(a) Meeting rate:** 20% of walks (11–14 a day), or rarer? `[PROPOSED]` 5% of walks, or a cap of about 3 a day, so each meeting stays an event.
   - **(b) Standing thresholds:** friendly at Known (≥ 250); hostile below 0 (Wary or worse) or Heinous.
   - **(c)** Test a Heinous run before locking "any group if Heinous".
3. **Broken penalties:** choose by feel. `[PROPOSED]` Slower movement, which a watching player can see; fumbles only show when healing.
4. **Early craftable weapon:** add a Default-unlock melee weapon a bit better than the Nail Bat, or move one Armory recipe down? (Needed for decision 4 of Oct 19 to hold for weapons.)
5. **HP growth:** keep +2 every 3 levels, or another pace? The skill tree stays a later concept.
6. **Medkit stacking:** 3 or 5 per pocket. `[PROPOSED]` 3: it removes nearly all blocked loads at current supply, while pockets still matter.
7. **Scavenging yield:** ×1, ×2, ×4 or ×8 (×1 = 0.25 Cloth + 0.125 Medical per real hour). `[PROPOSED]` ×4 (1 Cloth + 0.5 Medical per real hour): a clear gain without doubling supply.
8. **Clock flag:** the existing lasting injury lasts 3 **game** days, which is 7.2 real minutes (`ZI.setInjury`, game days). The same issue as the Jester's stay. Real days, or game days?

## 5. Next
Confirm the chosen combination with 5 seeds, plus a Heinous run if decision 2c is wanted. Then draft the slice brief and batch contract for Claude Code, and the spec propagation list.
