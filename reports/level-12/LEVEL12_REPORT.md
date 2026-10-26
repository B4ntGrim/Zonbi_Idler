# Design Handoff — character level appears stuck at 12 (read-only, Oct 26)

No code was changed.

## 1. How level is computed
- `game/stats.js:6` key `zi_character_xp`; `getCharacterXp` (line 7) reads it.
- `game/stats.js:18–22` `getCharacterLevel`: XP for level L → L+1 is `L*100 + L²*10`; the loop runs to **level 100**. There is **no table or cap at 12**.

## 2. Numbers
- Total XP to reach level 12: 11,660. XP for 12 → 13: **2,640** (13 → 14: 3,090).
- The TEST SAVE's XP lives in browser localStorage and can't be read from the files. To check: in the browser console, `ZI.getCharacterXp()` and `ZI.getCharacterLevel()`.

## 3. Likely cause
- Character XP grows only through `ZI.applyWanderingXp` (`game/stats.js:11`). The only caller is **`screens-v3.jsx:2736`**, inside the **Downed overlay's button**: run XP is banked to character level only when the survivor is Downed and the player taps it.
- So a player who rarely gets Downed, or plays mostly offline or through Routes, stops gaining character level. As the curve steepens (2,640 per level at 12), it reads as "stuck".
- Skill decay (`settleSkillDecay`, `game/stats.js` ~350–367) touches **profession XP** (`zi_stat_xp`), not character XP. Not the cause.

## 4. Decision for Sam
Where should character XP be banked? Options: (a) on every return, retreat and offline settlement, through the XP bus (`ZI.emitAction`); (b) continuously as earned. Recommendation: (a), so watched and offline play bank the same way (parity, H1). Code fix goes in a batch after Sam decides.

**Decided Oct 26 (PM), Sam:** character XP is banked automatically on every return from a run (retreat, forced retreat, Downed and offline settlement), the same watched or away, through the XP bus. Code fix goes in a batch.
