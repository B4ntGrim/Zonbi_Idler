# Oct 24 — Record Sam's CLOCK-01 O1–O6 decisions and issue the batch.
# Run from E:\Zed_Idler. Each replacement must match exactly once or the script stops.
# Before running: copy CURRENT_BATCH.md to archive/trav-01a-batch.md (done Oct 24).
p = 'reference/clock-01-slice.md'
s = open(p, encoding='utf-8').read()

def R(a, b):
    global s
    assert s.count(a) == 1, a[:60]
    s = s.replace(a, b)

R("**Status:** Slice written Oct 23 from Sam's instructions. Decisions CL1–CL8 `[DECIDED Oct 23]`. **Not ready for Code:** open decisions O1–O6 (§3) must be locked first. The batch draft (§6) is not yet `CURRENT_BATCH.md`.",
  "**Status:** **LOCKED Oct 24.** Decisions CL1–CL8 `[DECIDED Oct 23]`; O1–O6 `[DECIDED Oct 24]` (§3). The §6 batch was issued as `CURRENT_BATCH.md` on Oct 24.")
R("| CL3 | **Hide advances the clock 12 game hours.** Hide can be used again, but a **cap** stops a player from hiding forever. The cap value is `[OPEN]` (O1) |",
  "| CL3 | **Hide advances the clock 12 game hours.** Hide can be used again, but a **cap** stops a player from hiding forever. Cap: **2 per real day** (O1, `[DECIDED Oct 24]`) |")
R("| CL8 | **Both HTML pages are in scope.** Sam has not named them yet; see O6 |",
  "| CL8 | **Both HTML pages are in scope:** `Zombie Idler v2.html` and `Zombie Idler v2 - TEST SAVE.html` (O6, `[DECIDED Oct 24]`) |")
R("| T8 | 1 game hour = 1 real minute (a game day is 24 real minutes; a 364-day year is about 6 real days) | `[DECIDED Oct 21]`. **See O2:** Code's survey used 5 real minutes |",
  "| T8 | 1 game hour = 1 real minute (a game day is 24 real minutes; a 364-day year is about 6 real days) | `[DECIDED Oct 21]`; reconfirmed Oct 24 (O2). Code's 5-minute survey value is not used |")
R("## 3. Open decisions (Sam must lock these before the batch goes to Code)",
  """## 3. Decisions O1–O6 — LOCKED `[DECIDED Oct 24]` (Sam)

| # | Locked rule | Data-table value |
|---|---|---|
| O1 | **Hide cap: 2 per real day**, reset at local midnight. At the cap, Hide is greyed with "No more hiding today. Resets at midnight." (Sam chose 2 over the recommended 3) | `TRAV_HIDE_MAX_PER_DAY = 2` |
| O2 | **Clock rate stays T8:** 1 game hour = 1 real minute | `ZI.REAL_MS_PER_GAME_HOUR = 60000` |
| O3 | **Make camp always wakes at 06:00 of the next calendar day** (skip of 6 to 30 game hours) | `CAMP_WAKE_HOUR = 6` |
| O4 | **Calendar shows the full absence; progress credits at most 24 real hours.** The away summary says "Progress capped at 24 hours" when the cap applies | `OFFLINE_CREDIT_CAP_REAL_HOURS = 24` |
| O5 | **Injury treatment subtracts play time** (real minutes), not game days | — |
| O6 | **Pages in scope:** `Zombie Idler v2.html` and `Zombie Idler v2 - TEST SAVE.html` | — |

*Why 2 Hides:* 2 × 12 = 24 game hours a day at most, so Hide can wait out one bad night but never skips more than a day. It keeps Make camp (once a day, to 06:00) as the main way to move to morning.

### Original recommendations (kept for the record; superseded by the table above)""")
R("**Status:** DRAFT. Waiting on O1–O6.", "**Status:** **LOCKED by Sam (Oct 24).** Issued to Code as `CURRENT_BATCH.md`.")
R("1. **Rate.** `ZI.REAL_MS_PER_GAME_HOUR` set to the locked rate (O2; T8 = 60 000).", "1. **Rate.** `ZI.REAL_MS_PER_GAME_HOUR = 60000` (O2, T8).")
R("Repeatable up to the O1 cap; at the cap", "Repeatable up to **2 per real day** (`TRAV_HIDE_MAX_PER_DAY = 2`, O1), reset at local midnight; at the cap")
R("Moves the clock to 06:00 of the morning set by O3.", "Moves the clock to 06:00 of the **next calendar day** (O3), from any time of day.")
R("Time beyond the cap is discarded, as in FX2.", "Time beyond the cap is discarded, as in FX2. The calendar still moves for the whole absence (O4), and the away summary says \"Progress capped at 24 hours\" when the cap applied.")
R("6. Make camp lands at exactly 06:00 (per O3) from", "6. Make camp lands at exactly 06:00 of the next calendar day (O3) from")
R("2. Hide three times (or up to the cap); confirm", "2. Hide twice; confirm")
R("Hide moves the clock exactly 12 game hours; repeats work until the cap;", "Hide moves the clock exactly 12 game hours; a second Hide works; a third is refused;")
R("(proposed) Hide all reset", "Hide all reset")
open(p, 'w', encoding='utf-8').write(s)

# Issue §6 as CURRENT_BATCH.md
a = s.index('# CURRENT_BATCH — CLOCK-01'); b = s.index('## 7. Lessons')
open('CURRENT_BATCH.md', 'w', encoding='utf-8').write(s[a:b].rstrip().rstrip('-').rstrip() + "\n")
