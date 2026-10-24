# BALANCE-03 — Broken model simulation (Oct 18)

**Status:** simulation only (Sam's voice-session concept, approved for simulation). No production code, UI or real save changed.

**Clock:** every "per day" is a **real day** (24 real hours).

## 1. Model tested (all values proposed / test-only)
**Base:** the S0 settled rules (survival mode):
- square-difficulty tiers with warned threats;
- near-death 1 / 1 / 3;
- full-Downing top-up 5;
- Option C 40/30 + rule 5;
- no free charges;
- Medkit recipe; all Medkits in pockets; quest kit pocket-free;
- scripted intro;
- skipper pouch;
- loot damage;
- crafting and survivor recycling pause Wandering;
- Forced Retreat returns home instantly.

**Broken model changes:**
- **Max stress → Broken** instead of a Breaking Forced Retreat. The survivor keeps going.
  - *Assumption:* stress resets to the existing Shaken floor (80) on entry. If it stayed at 100, Broken would retrigger constantly.
- **Stress no longer gates rest:** the resume gate is HP ≥ 80% only, and the player's stress retreat rule is off (otherwise it would loop withdraw → instant resume).
- **Overload above 100%:** stress gains ×2 (replaces ×1.15).

**Penalties while Broken:**

| Strength | Max HP | Survivor attacks | Damage taken |
|---|---|---|---|
| Mild | −10% | 10% of attacks lost | — |
| Harsh | −25% | 25% of attacks lost | +10% |

**Release (Monopoly-style):**
- each completed rest rolls 1 in 6;
- after 3 failed rests the survivor is released anyway, and the equipped weapon and body armor lose 5–10% durability (never below 10% of max, never raised).

**Runs:** each set also ran with encounter spacing EN3 ×2 (proposed lever). Matched seeds 101–505 × 7 real days. All 80 runs OK.

## 2. Results (per real day; tutorial survivors; skipper in brackets)
| | S0 (no Broken) | Broken mild | Broken harsh | **Broken mild + EN3 ×2** | Broken harsh + EN3 ×2 |
|---|---|---|---|---|---|
| **Field time** | 1.3% (1.1) | 13.9% (13.6) | 12.9% (12.8) | **36.8% (36.0)** | **35.1% (34.2)** |
| Rest h (stress-only) | 23.7 (20.9) | 20.7 (0) | 20.9 (0) | 15.2 (0) | 15.6 (0) |
| Distance | 0.49 km | 5.4 km | 4.8 km | 56 km | 54 km |
| Encounters / kills | 47 / 38 | 483 / 279 | 447 / 258 | 289 / 144 | 285 / 142 |
| **Recurring full Downings** | 5.6 (6.0) | 38.9 (44.2) | 42.6 (45.7) | **14.0 (15.3)** | 16.2 (17.7) |
| Downings per km | 11.3 | 7.3 | 8.9 | **0.25** | 0.30 |
| Downings per 100 encounters | 11.8 | 8.1 | 9.5 | 4.9 | 5.7 |
| Rescues | 0.3 | 0.8 | 0.5 | 1.3 | 1.1 |
| Withdrawals (trips ended on purpose) | 5 | 49 | 46 | 66 | 64 |
| **Time spent Broken** | 0 | 23% | 23% | 11% | 11% |
| Broken entries | 0 | 7.7 | 8.0 | 3.4 | 3.6 |
| Releases: by roll / after 3 rests | — | 3.2 / 4.5 | 3.3 / 4.7 | 1.4 / 2.0 | 1.4 / 2.2 |
| Medkits crafted / charges used | 1.6 / 3.0 | 1.6 / 3.0 | 1.6 / 3.1 | 1.6 / 3.0 | 1.6 / 2.9 |
| Stress: near-death / ventures; Bedroll | 27 / 2; 20 | 199 / 1; 17 | 204 / 1; 17 | 124 / 14; 13 | 128 / 13; 13 |

**Release check:**
- releases by roll ≈ 40% and forced ≈ 60%, matching a 1-in-6 chance with release after 3 rests (expected about 42% / 58%);
- about 2.5 rests per Broken spell.

## 3. Findings
1. **The Broken model removes the stress wall** (stress-only rest 21 h → 0). The survivor becomes **HP-limited**: many short trips (retreat at 30% HP, then about 15 minutes of HP rest).
2. **With encounter spacing it reaches the 25–50% target: 35–37% field time**, for both penalty strengths and both start types. Without spacing it is about 13–14%.
3. **Downings rise sharply in absolute terms** (14–18 a day with spacing, 39–46 without), because activity rises about 10–100×.
   - **Per unit of progress they are the lowest measured so far:** 0.25–0.30 Downings per km (S0: 11.3) and 4.9–5.7 per 100 encounters.
   - Against "about 1–2 recurring Downings a day", this is far over. Against "danger relative to distance and progress", it is the safest per km of any model.
4. **Mild and harsh penalties barely differ** (+2 Downings a day, −1.5 points of field time). The penalties are small next to the HP-gated trip loop; the survivor is Broken only 11–23% of the time.
5. **The durability cost had no effect in this simulation.** Weapons and armor were already worn to the 10% floor or below, because the simulation does no repairs. Skippers had no weapon or armor equipped at all.
   - The cost needs testing together with a repair loop to mean anything.
6. **Medkits don't change the picture** (about 1.6 crafted a day): renewable rest, not consumables, sets the pace.

## 4. Decisions for Sam
1. **Which Downing measure governs?** Per day (1–2 accepted) or per progress (Downings per km or per encounter)? With Broken + spacing, survivors reach target field time at 0.25 Downings per km but about 15 a day.
2. **If per day must fall:** test levers that cut Downings without restoring the stress wall:
   - a higher retreat threshold (for example heal 60 / retreat 50);
   - a cost per full Downing beyond +5 stress (for example a longer rest);
   - or fewer encounters per km (EN3 ×4).
3. **Stress on entering Broken:** keep the reset to the Shaken floor (80), or another value?
4. **Penalty strength:** mild and harsh behave alike. Pick by feel, or test stronger penalties so Broken matters more?
5. **Durability cost:** test with repairs modelled (the repair loop exists in code) before judging it.
