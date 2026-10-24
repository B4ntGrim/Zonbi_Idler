# Zed Idler — Recoverable Throwing Axes

Status: BRAINSTORM. Consumable throwing axes with recovery percentage are owner-selected. Numbers and behavior below remain proposals. Prepared 2026-10-24.

## Existing category fit

- Held axe: cat = weapon; slot = melee.
- Throwing stack: cat = consumable; slot = throwable. This Throw slot already exists in game/items.js.
- Encyclopedia content family: axes/choppers. W2 says mastery feeds Combat rather than becoming another currency.
- Do not copy grenade killEnemy behavior. Axes need authored damage profiles.
- Current itemHasDurability excludes consumables. Recovery is stack settlement; per-axe durability would be another explicit change.
- AXE-251 through AXE-300 are the 50 throwing designs. Their names, shape variations and game effects are fictional. Historical context is separate.
- Owning or throwing consumables does not consume the survivor's ordinary equipped melee axe.

## Additions index

| ID | Addition | Integration instruction | Status |
|---|---|---|---|
| THR-01 | Stack ownership | Reuse carried/stash and consumable pathways. Decide whether Throw selects a carried stack or stores quantity; no separate ammo wallet. | Proposed; audit representation |
| THR-02 | Launch cost | Spend one axe per launched physical projectile. Invalid/canceled actions spend none; three-axe volleys spend three. | Proposed |
| THR-03 | Damage | Use an authored profile in shared combat, with eligible crit/status rules. Equipping Throw must not add passive weapon damage. | Proposed |
| THR-04 | Recovery display | Show Recovery Chance %, stock and conditions. Keep recovery separate from Luck. | Selected concept; display proposed |
| THR-05 | Recovery timing | First candidate: search once after a secured victory. Escape, downing and forced retreat give no automatic search recovery. Reconcile extraction rules. | Proposed |
| THR-06 | Eligibility | A missed axe may still be recoverable. Water, inaccessible ground or a destructive effect may make a launch ineligible. | Proposed |
| THR-07 | Probability | Combine only explicit base, gear, skill and context bonuses, then clamp. No hidden Luck/rarity/Pickup Range modifier. | Base and cap open |
| THR-08 | Accounting | Record launched, eligible, recovered and lost quantities per encounter. Piercing several targets still creates only one recoverable axe. | Proposed |
| THR-09 | Settlement | Persist result and inventory change as one recoverable transaction. Reloading or reopening reports must not reroll or refund again. | Required property |
| THR-10 | Timing | Launch at logical attack times, stop at empty stock, and return recoveries only at the agreed settlement point. | Proposed |
| THR-11 | Carrying | Count stack weight once and return axes to carried inventory using existing capacity/overflow rules. No Stockpile teleport. | Existing principle; details open |
| THR-12 | XP | Existing action bus awards qualifying kill/loot XP once. No XP for repeatedly throwing/recovering alone. Consumable-instance XP remains open. | Existing direction plus proposal |
| THR-13 | Rarity | Decide consumable eligibility under the new six-label ladder. Ancient-style enhancement is Legendary-only; consumable inclusion remains open. | Open |
| THR-14 | Special paths | Audit shared combat and explicitly included exceptions. Preserve walk-home pursuers' existing no-XP/no-loot/no-kill/no-wear rule. | Audit requirement |

## Probability candidate

    pRecover = clamp(base + explicitGearBonus + explicitSkillBonus + contextBonus, 0, cap)

All terms use the same unit. Resolve eligibility before rolling. A 95% cap is a possible test candidate, not a selected value. No starting base percentage is locked.

With N eligible launches, expected recovered quantity is N × pRecover. Ten launches at 40% have mean 4 recoveries and 6 losses; an actual saved result may be 3. Reopening the result must still show 3.

Recovery percentages are gameplay abstractions, not measurements from historical sources.

## Suggested roles

| Role | Strength | Cost |
|---|---|---|
| Light thrower | Faster release/flight | Lower damage per axe |
| Heavy thrower | Higher physical hit | Slower rate/heavier stock |
| Wide edge | Larger authored footprint | Lower single-target efficiency |
| Retriever | Explicit recovery bonus | Smaller offensive budget |
| Status pattern | Authored eligible status | Less direct burst |
| Elite breaker | Conditional elite/vulnerable bonus | Less efficient on ordinary targets |

Rarity does not automatically grant perfect recovery, infinite ammunition or longer range.

## Conservation and persistence checks for future implementation

- Start with stock S, launch L ≤ S, recover R with 0 ≤ R ≤ eligible launches ≤ L.
- New stock = S − L + R; losses = L − R. No recovery can create more axes than were spent.
- Every launch has at most one recovery, regardless of misses, piercing or target count.
- Chunked offline settlement preserves launch order, times and saved outcomes.
- Resuming a partial encounter cannot consume already spent axes again.
- Interrupted writes cannot grant both a refund and a later recovery.
- Live/offline outcomes and timing match.
- Recovery itself grants no loot, RMAT, crafting rewards or XP.

## Open decisions

Base chance/cap; safe search eligibility; throw cadence; simultaneous melee/throw actions; stack selection; any recovery skill; tier/rarity eligibility; intact return versus an explicitly designed repair state.

