import io,sys
def rd(p): return io.open(p,encoding='utf-8').read()
def wr(p,s): io.open(p,'w',encoding='utf-8',newline='').write(s); print("ok",p)
def rep(s,old,new,p):
    n=s.count(old)
    if n!=1: sys.exit(f"FAIL {p}: {n} matches for {old[:70]!r}")
    return s.replace(old,new)

wr('reference/concordance-introduction-concept.md',"""# Concordance introduction (concept)

**Status:** Concept with decided parts (Sam, Oct 26). Not scheduled; not a build input. Follows the Sealed Crate beat (`wandering-fort-scene.md` §12.2).

## 1. Shape

| # | Rule | Tag | Why |
|---|---|---|---|
| CI1 | **Start:** begins at the Survey Point marker after the Sealed Crate beat. A Concordance survey team confronts the survivor; the crate is their stolen property | `[CONCEPT Oct 26]` | Gives the first meeting real stakes |
| CI2 | **Three exits (no dead ends):** (a) hand it back; (b) keep it and walk; (c) open it together (Diplomat check, CI4). Standing changes follow the ±50 per-event cap (spec 4.2) | `[CONCEPT Oct 26]` | First faction rivalry, event-driven (spec 4.3) |
| CI3 | **Crate contents:** medical supplies, rations, and a story item (a Concordance research log) | `[CONCEPT Oct 26]` | Medicine is what the Hearthguard wanted, so the crate ties both factions together |
| CI4 | **Open-together outcome by Diplomat:** low, crate returned with no thief penalty; mid, survivor keeps the rations; high, also keeps some medical supplies and the research log. Other modifiers (policy, scouting the team) `[OPEN]` | `[PROPOSED]` | Skill matters without gating the story |
| CI5 | **No dead end:** the research log is also reachable by another route (CI13), so core progression never rests on one skill check | `[PROPOSED, accepted by Sam]` | Pillar: never gate core progression behind randomness |
| CI6 | **Heinous:** the team will not talk. (a) Attack (Risk: HIGH): a win gives the full crate and the research log, plus an uncommon Concordance gear drop `[PROPOSED 25%]`; the Concordance turns hostile. (b) Let them go: keep the crate; the log comes via CI13 | `[CONCEPT Oct 26]` | Heinous makes every faction hostile (spec 2.3) |
| CI7 | **Criminal:** the team may talk, but the Diplomat check is harder (CI11) | `[CONCEPT Oct 26]` | Reputation colours the meeting |

## 2. Details (Oct 26)

| # | Rule | Tag | Why |
|---|---|---|---|
| CI8 | **Seeded starting standing:** the scene is the same for every starting standing (spec 4.6). Only the team leader's tone changes: colder at Wary, more relaxed at Neutral. All exits work from any start | `[DECIDED Oct 26]` | One scene to build and test; no seed can break it |
| CI9 | **The research log is a story item** (`isStory`): no pocket, weight only, cannot be dropped or sold, never lost on a Hard-mode forced retreat until its quest ends (Fort brief 12.6, spec 14.1) | `[DECIDED Oct 26]` | Reuses the story-item rule |
| CI10 | **Crate supplies and pockets:** medical supplies and rations take pockets: a free pocket first, else the Wandering haul, then the stash when banked (same rule as fish) | `[DECIDED Oct 26]` | Nothing wasted or blocked |
| CI11 | **Diplomat tiers:** low below level 10; mid 10–19; high 20+. Criminal: +5 levels per tier (mid 15, high 25) | `[PROPOSED starting values, accepted by Sam]`; kept open in `wandering-design-audit.md` §6 for playtest | Early-game reach; Criminal pays for its reputation |
| CI12 | **Standing changes:** hand it back: Concordance +40, Hearthguard −25. Keep it and walk: Concordance −50, Hearthguard +10. Open it together: Concordance +20 at any tier. Heinous attack: Concordance −50 | `[DECIDED Oct 26, starting values]` | All within the ±50 per-event cap |
| CI13 | **Backup route:** if the survivor did not get the research log, a second survey site is marked a few game days after the first meeting `[PROPOSED 3 game days, about 72 real minutes]`, on an unlocked cell nearby, placed deterministically from the seed (like the first Fort). Entering it finds an abandoned Concordance camp with the log; guaranteed, no skill check | `[DECIDED Oct 26]` | Core progression never rests on a check or a fight |

## 3. Open
- `[OPEN]` CI4 other modifiers (policy, scouting the team).
- `[OPEN]` Failed-check wording and the scene text (terminal style, original).
- `[OPEN]` Which Concordance gear item drops in CI6.
""")

wr('reports/level-12/LEVEL12_REPORT.md',"""# Design Handoff — character level appears stuck at 12 (read-only, Oct 26)

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
""")

p='reference/00-document-index.md'; s=rd(p)
s=rep(s,"# Zed Idler — Document Index (updated Oct 26)","# Zed Idler — Document Index (updated Oct 26, afternoon)",p)
s=rep(s,"| `circuit-expedition-concepts.md` |","| `concordance-introduction-concept.md` | Concordance introduction after the Sealed Crate: stolen crate, three exits, Heinous and Criminal versions, Diplomat tiers, standing changes, guaranteed backup route (CI1–CI13) | Concept with decided parts (Oct 26); not a build input |\n| `circuit-expedition-concepts.md` |",p)
s=rep(s,"| Date | Decision | Recorded in |\n|---|---|---|\n","""| Date | Decision | Recorded in |
|---|---|---|
| Oct 26 | BAL-A answers B1–B6 (Sam): Downings per km main target with field-time guardrail; rule 5 closed; T0 durability for an 8 h absence (later batch); automatic repair parked; Broken mild; Codex Option B | `slice-retreat-broken-batch-a-draft.md` §3b; `DESIGN_HANDOFF.md` |
| Oct 26 | FOOD-01 decisions F1–F18, O3a–O3c, ST1–ST2 (Sam): top bar, auto-eat order, fruit, foraging variants, comfort food, cola, cans, last-can Easter egg, hidden achievement, background finds, food groups, Well Nourished, containers, 60 s pacing, stamina from hunger. NB1 bar proposed until the mock-up. Conflicts flagged: F5 cap vs FOOD-02 5/day; F15 day unit; F11 rate; O3a vs round 8's 90 s | `food-01-nutrition-slice.md` §3b, §4; `parked/food-02-cooking-concept.md` §1b; `wandering-tab-spec.md` §2.3, 13.4, 13.8, 14.1 |
| Oct 26 | Milestone MS1–MS2 (Sam): Fallow Ground turn-in is the first milestone, with a one-time chapter card; Sealed Crate beat kept, elder unnamed. MS3 proposed (conflicts with H2 scope D3) | `wandering-fort-scene.md` §12.2; `tutorial-first-session-spec.md` Beat 8; `sim-harness-v1-brief.md` §12 |
| Oct 26 | Concordance introduction CI1–CI13 (Sam) | `concordance-introduction-concept.md`; `wandering-design-audit.md` §6 |
""",p)
s=rep(s,"| `reports/docs-oct25/` |","| `reports/docs-oct26/` | Oct 26 docs session: pre-change copies, apply scripts, report |\n| `reports/level-12/` | Read-only Design Handoff: character level appears stuck at 12 |\n| `reports/docs-oct25/` |",p)
wr(p,s)

old=rd('DESIGN_HANDOFF.md')
carried=old.split('**Carried from Oct 24:**')[1].split('## 4. Next step')[0].strip()
carried=carried.replace("- BAL-A: TEST SAVE check (who runs it).\n","")
wr('DESIGN_HANDOFF.md',f"""# Design handoff — Oct 26

**Replaces:** the Oct 25–26 handoff, archived as `archive/design-handoff-oct25-26.md` (its decisions stay recorded in the documents; open items carried below).
**Active batch:** `CURRENT_BATCH.md` = **CLOCK-01** (unchanged).
**Source:** Google Docs "Zed Idler — Code Instructions Oct 26", "… Addendum" and "… Addendum 2", applied Oct 26 afternoon.

## 1. Decisions made (Sam, Oct 26)
- **BAL-A B1–B6** (`slice-retreat-broken-batch-a-draft.md` §3b): Downings per km is the main target, field time ≥ about 50% as guardrail · rule 5 closed · raise T0 durability for an 8 h absence (later batch) · automatic repair `[PARKED]` · Broken mild for now · Codex Option B (BEST1 dependency met).
- **FOOD-01 F1–F18, O3a/O3c, ST1–ST2** (`food-01-nutrition-slice.md` §3b): top bar shows real values · auto-eat lowest value first, comfort food above stress 70, Shop unlock for variety first · fruit values and Foraging unlocks (5 / 10 / 12) as variants of existing encounters · comfort food (raisins −3, oranges −2, cola −5) · empty cans, background finds, the last can at 0.02% once per save · hidden "number one" achievement (waits on FOOD-02) · one healing path · five food groups (concept) · Well Nourished buff and icon · lunch bag 6 / pack 12 / cooler 28 meals · 60 s encounter pacing with familiarity scaling · stamina is the hunger state's combat effect (no separate meter). F6 parked. NB1 layered bar `[PROPOSED]` until Sam sees the mock-up.
- **MS1–MS2:** Fallow Ground turn-in is the first milestone; one-time chapter card "Chapter One: Fallow Ground". Sealed Crate beat kept; the elder is not the Elder Jester; name open. MS3 proposed.
- **Concordance CI1–CI13** (`concordance-introduction-concept.md`).
- Earlier today (already applied): circuit decisions C10–C21.

## 2. Files changed
- `reference/slice-retreat-broken-batch-a-draft.md` (§3b) · `reference/food-01-nutrition-slice.md` (§3b, P6, §4) · `reference/parked/food-02-cooking-concept.md` (§1b) · `reference/wandering-tab-spec.md` (§2.3 note, 13.4, 13.8, 14.1) · `reference/wandering-fort-scene.md` (§12.2) · `reference/tutorial-first-session-spec.md` (Beat 8) · `reference/sim-harness-v1-brief.md` (§12) · `reference/wandering-design-audit.md` (§6) · `reference/balance-03-round8-regen-oct21.md` (§6) · new `reference/concordance-introduction-concept.md` · `reference/00-document-index.md`.
- `reports/level-12/LEVEL12_REPORT.md` (new) · `reports/docs-oct26/` (pre-change copies, scripts, report) · this file; `archive/design-handoff-oct25-26.md`.

## 3. Open questions
**Sam — conflicts found while applying (Oct 26):**
- **Pacing O3a:** 60 s chosen; round 8 recommended 90 s because 60 s gives about 21–24% steady-state field time, under the band. Keep 60 s for the rerun, or move the base to 90 s?
- **F5 food stress cap:** −10 per day (Oct 26) vs **5 per real day** decided and audited Oct 21 (FOOD-02 §1a, §2b; the Lunch Pail raises it to 8). Which stands?
- **F15 day unit:** a game day is 24 real minutes, so "3 food groups in one game day" is unreachable at about 11 meals a real day. Use a real day (or rolling 24 real hours)?
- **F11 find rate:** one per 10 game minutes = one per 10 real seconds, about 8,600 metal and XP grants a real day. Pick a rarer rate in the economy audit.
- **MS3:** H2 excludes Fort scenes (D3), so it can't see the milestone without a scope change or a proxy.
- **Level-12:** character XP banks only from the Downed overlay button (`screens-v3.jsx:2736`). Decide where it should bank (recommended: every return and offline settlement). See `reports/level-12/LEVEL12_REPORT.md`.

**Sam — other open:**
- BAL-A closure: TEST SAVE smoke test (reminder 6 PM today); the 30-day H2 run; review of the BAL-A report scope note §4. Audit notes in BAL-A §3b (Broken release about 58% forced; injury parity exception).
- NB1 nutrition bar: see the mock-up, then lock.
- Elder's name; Concordance CI4 modifiers, scene text, CI6 gear item.
- Circuit questions 15–24; C21 depends on FOOD-01 auto-eat.
- Fish rarity split (80 / 17 / 3, proposed).
{carried}

## 4. Next step
Sam settles the four conflicts above (pacing, food cap, day unit, find rate), runs the smoke test, then the 30-day H2 run closes BAL-A. Code's next read-only items: FOOD-01 O6 (with ST3) and the round 8 rerun with the Oct 26 inputs.
""")
