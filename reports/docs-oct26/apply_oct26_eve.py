import io,sys,re
def rd(p): return io.open(p,encoding='utf-8').read()
def wr(p,s): io.open(p,'w',encoding='utf-8',newline='').write(s); print("ok",p)
def rep(s,old,new,p):
    if s.count(old)!=1: sys.exit(f"FAIL {p}: {s.count(old)} x {old[:60]!r}")
    return s.replace(old,new)
def line_starting(s,prefix,p):
    L=s.split('\n'); h=[i for i,l in enumerate(L) if l.startswith(prefix)]
    if len(h)!=1: sys.exit(f"FAIL {p}: {prefix!r}")
    return L,h[0]

# PF15
p='reference/playtest-findings-oct15.md'; s=rd(p)
L,i=line_starting(s,"**Fix direction `[PROPOSED]`",p)
L[i]="**Fix `[DECIDED Oct 26, Sam]`:** (1) **Continue keeps live progress:** when the chosen file is the active file, resume from the live `zi_*` keys (write the snapshot first, or skip the restore); loading a different file still restores that file. (2) **Autosave** the active slot about every **60 s** `[DECIDED starting value]` and on page hide or unload. (3) **Regression test:** close, reopen and Continue preserve every `zi_*` key except those offline catch-up legitimately changes; catch-up then runs (24 h cap). Priority: first batch, ahead of other work. Draft contract: `pf15-save-continue-slice.md`. Until it ships: press **Save** before closing."
wr(p,'\n'.join(L))

wr('reference/pf15-save-continue-slice.md',"""# PF15 — Continue keeps progress, autosave (slice brief)

**Status:** Decisions `[DECIDED Oct 26, Sam]`. Draft batch below; **not yet issued** as `CURRENT_BATCH.md`. CLOCK-01 is still the active batch (NOT CLOSED: manual browser checks pending).

## 1. Next slice
Fix the critical defect PF15 (`playtest-findings-oct15.md`): the save-files screen's Continue calls `ZI.loadSlot`, which replaces live progress with the slot's creation-time snapshot (no autosave). Every playtest is unreliable until this is fixed.

## 2. Decided constraints
| # | Rule | Why |
|---|---|---|
| S1 | Continue on the **active** file resumes the live `zi_*` keys; loading a **different** file still restores that file | Continue must never discard progress |
| S2 | Autosave the active slot every **60 s** (starting value, data table) and on `visibilitychange` (hidden) and `pagehide` | Closing the tab must not lose progress |
| S3 | Regression test: close → reopen → Continue preserves every `zi_*` key except those offline catch-up legitimately changes; catch-up runs with the 24 h cap | Proves the fix and guards it |

## 3. Open decisions
- `[OPEN]` **Order with CLOCK-01:** pause CLOCK-01's remaining manual checks and ship PF15 first, or close CLOCK-01 first. Recommendation: PF15 first; CLOCK-01's remaining checks are manual browser checks that need a reliable save.
- `[CODE]` Step 1 confirms the cause and lists files before any change.

## 4. Parked / out
Server-side saves; cloud sync; changes to the TEST SAVE shim; any gameplay change.

## 5. Proposed batch (draft `CURRENT_BATCH.md`)

### BATCH PF15 — Continue keeps progress

**Goal.** Reopening the game and pressing Continue resumes exactly where the player left off, then runs offline catch-up.

**Decided behavior.** S1–S3 above.

**Likely files.** `game/save.js` (`loadSlot`, `_writeSlot`, new autosave), `Zombie Idler v2.html` (save-files screen Continue, autosave wiring), `Zombie Idler v2 - TEST SAVE.html` (regenerate), new `tests/pf15-continue.test.js`, `CODE_STATE.md`.

**Step 1 (read-only).** Confirm the cause: Continue → `loadSlot` → `_restore(snapshot)`; snapshots written only at creation and manual Save. Report in `reports/pf15/PF15_STEP1_REPORT.md`. Stop if the cause differs.

**Acceptance checks.**
1. Active file: play, close without pressing Save, reopen, Continue → every `zi_*` key matches the pre-close fingerprint except catch-up keys (clock, run progress, timers that settle).
2. Catch-up runs on that Continue (offline window, 24 h cap); the return report shows.
3. Loading a **different** file restores that file's snapshot (unchanged behaviour).
4. Autosave writes the active slot within 60 s of a change, and on page hide/unload.
5. New file: tutorial, starter kit and charges as before (no regression to JD1a).
6. No console errors in either page; all existing suites pass.

**Explicitly out.** CLOCK-01 changes; server saves; gameplay changes.

**Required verification.** Step 1 report; completion report `reports/pf15/PF15_COMPLETION_REPORT.md`; `PF15: CLOSED` or `NOT CLOSED`.
""")

# Traversal
p='reference/trav-01-traversal-slice.md'; s=rd(p)
L,i=line_starting(s,"| T18 |",p)
L[i]=L[i].replace("| T18 | **Travel costs stamina**","| ~~T18~~ | ~~**Travel costs stamina**~~ **Superseded Oct 26 (Sam): dropped.** TRAV-02 is the only travel limit (no stamina meter, FOOD-01 ST1). Original:",1)
s='\n'.join(L)
s,n=re.subn(r"\*\*Conflict `\[OPEN\]` \(for Sam\):\*\* T18 .*?\n","**Resolved Oct 26 (evening):** T18 dropped; TRAV-02 is the only travel limit.\n",s,count=1,flags=re.S)
if n!=1: sys.exit("FAIL t18 note")
s=rep(s,"| CL-assign |","""| TRAV-02c | **Footwear (on foot only):** sneakers +1 square a day, light, wear out fast; military boots no extra squares, but camps made while wearing them recover stress at the Bunk rate (40 a day) instead of the Cot rate (T12), and last much longer; barefoot or worn-out footwear −1 square a day. Bikes and vehicles ignore footwear | `[DECIDED Oct 26]`; values `[PROPOSED]` | Gear shapes the day without a second meter; reuses the Boots slot, durability and camp rest rates |
| TRAV-02d | **Stacking and floor:** season modifiers (SEASON-01: summer +1, winter −1) stack with footwear; the daily cap never falls below **1 square** | `[DECIDED Oct 26]` | No dead ends |
| CL-assign |""",p)
wr(p,s)

# Seasons
wr('reference/season-01-seasons-concept.md',"""# SEASON-01 — Seasons (concept)

**Status:** Concept with decided parts (Sam, Oct 26 evening). Not scheduled; not a build input. Before any slice, check against BIOME-01 hazards, C6c day/night, the CLOCK-01 calendar, TRAV-02 / TRAV-02c, and the preview weather tables in code (`ZI.WEATHER_EFFECTS`, `ZI.WEATHER_STAT_MODS`, `game/survival-data.js`).

## 1. Decisions `[DECIDED Oct 26, Sam; values PROPOSED]`
- **Length:** one **real week** per season; a full cycle about a real month. Seasons run on real time, not the game calendar (a game year is about 6 real days). To be tested in the audit.
- **Display:** the calendar shows the season, e.g. "Year 2, Day 140 · Autumn".
- **Each season has two bonuses and two minuses** (one food-related, one not), all applied together:

| Season | Bonus 1 | Minus 1 | Bonus 2 | Minus 2 |
|---|---|---|---|---|
| Spring | Fishing and foraging +25% | Rain raises failed loot searches | Stress recovers faster | Mud wears boots faster |
| Summer | Longer days, less night-travel risk | Zombie encounters +15% | +1 travel square a day | Heat raises stress when carrying a heavy load |
| Autumn | Food finds +25%; orchards and vineyards (FOOD-01 F4) | Shorter days, more night | Falling leaves reveal zombies: fewer ambushes | Rain wears gear faster |
| Winter | Zombies slower, escapes easier | Cold hazards (BIOME-01), food finds −25% | Snow shows tracks: scouting cheaper | Cold: −1 travel square a day |

- **Stacking** `[DECIDED Oct 26]`: season travel modifiers stack with footwear (TRAV-02c); the cap never falls below 1 square (TRAV-02d).

*Why:* every season is a trade-off across food, combat, travel, stress and gear, so each feels like a chapter and planning changes with it.

## 2. Open
- `[OPEN]` How summer and autumn day length change the C6c night window (22:00–06:00) without breaking it.
- `[OPEN]` Seasons apply to offline catch-up through the shared step (proposed yes, for parity).
- `[OPEN]` Exact numbers for stress, wear and scouting effects (audit).
- `[OPEN]` How winter changes Mountain Country's hot days and cold nights.
""")

# Biome
p='reference/biome-01-chunks-slice.md'; s=rd(p)
s=rep(s,"## Biome loot bias \\[PROPOSED\\]","""### Biome hazards — decisions (Sam, Oct 26 evening)

The four bullets above are **superseded** by this table where they differ. Framework `[DECIDED Oct 26]`: each biome has a main hazard, a counter (gear or supplies) and an upside; hazards cost stress, HP or resources over time, never instant death; seasons (SEASON-01) may strengthen or weaken them.

| Biome | Hazard | Counter | Upside | Tag |
|---|---|---|---|---|
| Mountain Country (tutorial biome) | **Day:** heat and humidity drain nutrition faster. **Night** (C6c, 22:00–06:00): cold costs stress or HP (replaces the draft's "stamina drain"; stamina dropped, ST1) | Day: sun hat or light clothing, carrying water or fish. Night: making camp or warm clothing | High ground: scouting reveals more | `[DECIDED Oct 26]`; values `[PROPOSED]` |
| | **Onboarding:** the day-heat drain stays mild (or off) until Fallow Ground is turned in, like TRAV-02a | | | `[DECIDED Oct 26]` |
| Ruined Suburbia | Picked clean and collapsing: loot searches find less; a failed search can injure (debris, glass, falling ceilings). Keeps the draft's "scouting shows safe structures" | Gloves and a helmet reduce the injury chance | Fences, sheds and garages: stealth and escapes easier | `[DECIDED Oct 26]`; values `[PROPOSED]` |
| Metropolis City | Smoke from burning buildings costs HP over time (the draft's Toxic Air); noise draws larger zombie groups (PF13 noise 0–4) | Concordance respirator (CI14) blocks smoke; stealth and quiet weapons keep groups smaller | Richest loot: electronics and higher-tier materials | `[DECIDED Oct 26]`; values `[PROPOSED]` |
| The Debriefed Perimeter (endgame, outer edge) | Radiation builds slowly and lowers max HP until treated. Corrosive storms come and go: gear wears fast; the survivor seeks shelter | Hazmat suit (CI14) blocks radiation; a medical item treats it. Shelter (camp or building), military boots and better camps help in storms | Only source of Crystallized RMAT (already "Perimeter-exclusive" in code) | **`[PROPOSED]` — Sam to confirm** (presented by voice Oct 26; Sam's reply covered the mountain question) |

**Conflict `[OPEN]` (for Sam):** the city and Perimeter counters are Concordance gear that drops only when a survivor **defeats** a survey team (CI14/CI15: only hostile or Heinous players fight them; hazmat suit 4%). Non-hostile players would have no counter, which breaks the Hazard Counters pillar ("each hazard has a gear or consumable counter"). The code already has an **NBC Gas Mask** (`game/items.js`, Mask slot, "Required for toxic zones"). Recommendation: a craftable or findable basic counter for every hazard (gas mask for smoke; a basic protective suit or anti-radiation medicine for the Perimeter), with the Concordance items as the better versions.

## Biome loot bias \\[PROPOSED\\]""",p)
wr(p,s)

# Index
p='reference/00-document-index.md'; s=rd(p)
s=rep(s,"| `concordance-introduction-concept.md` |","| `pf15-save-continue-slice.md` | PF15 fix: Continue keeps live progress, 60 s autosave, regression test; draft batch | Decided Oct 26; draft batch, not issued (CLOCK-01 still active) |\n| `season-01-seasons-concept.md` | SEASON-01: a real week per season, two bonuses and two minuses each | Concept with decided parts (Oct 26); not a build input |\n| `concordance-introduction-concept.md` |",p)
s=rep(s,"| Date | Decision | Recorded in |\n|---|---|---|\n","""| Date | Decision | Recorded in |
|---|---|---|
| Oct 26 (evening) | PF15 fix approved (Continue keeps progress, 60 s autosave, regression test); T18 travel stamina dropped; TRAV-02c footwear (on foot only) and TRAV-02d floor of 1 square; SEASON-01 seasons; biome hazard table (Mountain, Suburbia, City decided; Perimeter proposed) with mountain onboarding. Conflict flagged: city and Perimeter counters only drop from Concordance fights | `playtest-findings-oct15.md` PF15; `pf15-save-continue-slice.md`; `trav-01-traversal-slice.md`; `season-01-seasons-concept.md`; `biome-01-chunks-slice.md` |
""",p)
wr(p,s)

# Handoff
p='DESIGN_HANDOFF.md'; s=rd(p)
s=rep(s,"# Design handoff — Oct 26 (evening)","# Design handoff — Oct 26 (late evening)",p)
s=rep(s,"**Replaces:** the Oct 26 morning handoff, archived as `archive/design-handoff-oct26-am.md`.","**Replaces:** the Oct 26 evening handoff, archived as `archive/design-handoff-oct26-evening.md` (morning one in `archive/design-handoff-oct26-am.md`).",p)
s=rep(s,"## 2. Files changed","""- **Late evening (Addenda 7–9c):** PF15 fix approved (draft batch `pf15-save-continue-slice.md`) · T18 travel stamina dropped · footwear adjusts the movement cap on foot (sneakers +1, military boots better camps, worn-out −1), floor of 1 square · SEASON-01 (a real week per season, two bonuses and two minuses each) · biome hazards for Mountain (with mild onboarding), Suburbia and City; Perimeter proposed.

## 2. Files changed""",p)
L=s.split('\n')
L=[l for l in L if not l.startswith("- **PF15 fix direction:**") and not l.startswith("- **T18 vs TRAV-02 vs ST1:**")]
s='\n'.join(L)
s=s.replace("; D2 travel stamina numbers.",".")
s=rep(s,"**Sam (urgent):**\n","""**Sam (urgent):**
- **PF15 vs CLOCK-01 order:** ship PF15 first (recommended), or close CLOCK-01's manual checks first. Until PF15 ships, press **Save** before closing.
- **Hazard counters:** the city and Perimeter counters only drop from Concordance fights. Add basic counters for everyone (the existing NBC Gas Mask; a basic suit or anti-radiation medicine)?
- **Debriefed Perimeter:** confirm the hazard row (radiation, corrosive storms, hazmat suit, Crystallized RMAT); recorded as proposed.
""",p)
s=rep(s,"## 4. Next step\n","## 4. Next step\nIssue `pf15-save-continue-slice.md` as the next batch once Sam sets its order with CLOCK-01. ",p)
wr(p,s)

io.open('reports/docs-oct26/DOCS_OCT26_EVE_REPORT.md','w',encoding='utf-8',newline='').write("""# Docs report — Oct 26 late evening (Addenda 7, 7b, 7c, 8, 8b, 9, 9b, 9c)

Applied by `apply_oct26_eve.py` (exact-match edits). Pre-change copies in `pre-change-eve/`. Docs only; no game code.

| Addendum | Where |
|---|---|
| 7 PF15 fix | `playtest-findings-oct15.md` PF15 (fix decided); new `pf15-save-continue-slice.md` with draft batch (not issued; CLOCK-01 still active and NOT CLOSED) |
| 7b T18 dropped | `trav-01-traversal-slice.md` T18 superseded; §2a conflict note resolved; handoff carried item removed |
| 7c, 8b footwear, floor | `trav-01-traversal-slice.md` §2a TRAV-02c, TRAV-02d |
| 8 seasons | new `season-01-seasons-concept.md` |
| 9, 9b, 9c biomes | `biome-01-chunks-slice.md` new "Biome hazards — decisions" table; draft bullets marked superseded |
| All | `00-document-index.md` rows and log; `DESIGN_HANDOFF.md` (old: `archive/design-handoff-oct26-evening.md`) |

## Deviations and findings
- **Debriefed Perimeter recorded `[PROPOSED]`**, not decided: Sam's spoken reply after the readback answered the mountain question; asked to confirm.
- **Counter gap:** city and Perimeter counters are Concordance drops gated behind fighting survey teams; recorded `[OPEN]`, with the existing NBC Gas Mask (`game/items.js`) noted as a reuse candidate.
- **Rarity:** code uses an "epic" tier (gas mask); Sam's list has no "epic". Folded into the W-3 check.
- Mountain draft "stamina drain" reworded to stress or HP, as Addendum 9c asked.
""")
