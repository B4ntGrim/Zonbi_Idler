import io,sys,re
def rd(p): return io.open(p,encoding='utf-8').read()
def wr(p,s): io.open(p,'w',encoding='utf-8',newline='').write(s); print("ok",p)
def rep(s,old,new,p):
    n=s.count(old)
    if n!=1: sys.exit(f"FAIL {p}: {n} matches for {old[:70]!r}")
    return s.replace(old,new)
def insert_before(s,anchor,text,p): return rep(s,anchor,text+anchor,p)

# A. BAL-A
p='reference/slice-retreat-broken-batch-a-draft.md'; s=rd(p)
s=insert_before(s,"## 4. Parked","""## 3b. Open questions answered (Sam, Oct 26)

| # | Decision | Why |
|---|---|---|
| B1 | **Main balance target: Downings per km** `[DECIDED Oct 26]`. Field time is a guardrail: tuning may not push it below about 50% | Downings are what the player feels; the guardrail stops "fewer Downings" coming from more time in bed |
| B2 | **Rule 5 scope: closed** `[DECIDED Oct 26]`. Already covered by BAL-A (policy events pause on the walk home, acceptance check 1) | Nothing left to decide |
| B3 | **Raise starting (T0) durability so gear lasts a full 8 h absence** `[DECIDED Oct 26]`. Values go in a later batch, not BAL-A. Repair cost revisited later | Gear breaking while away punishes being away |
| B4 | **Automatic repair `[PARKED]`** as a quality-of-life Shop idea (matches §4) | Tests showed it barely changes balance |
| B5 | **Broken penalty: mild for now; tune in playtests** `[DECIDED Oct 26]`. Steers the tuning of A4's penalties (A4 was set "between mild and harsh", Oct 19) toward the mild end; A4's values stand until a playtest batch changes them | Broken is only 2–5% of the time at current rates |
| B6 | **Codex Option B** `[DECIDED Oct 26]`: `WANDER_SIM_TABLE.codexFromWandering = true`; an entry unlocks on a fight, not an evade (tutorial spec 7.3); 13 Discovery XP once per new entry. Dependency met: BEST1 is CLOSED (Oct 17) and the flag exists in `game/wandering.js` (currently `false`). Flipping it belongs to a batch, not this document change | The Codex fills from where most zombies are met |

**Still needed to close BAL-A:** Sam's TEST SAVE smoke test; the 30-day H2 run; Sam's review of the BAL-A report scope note §4.

**Audit notes (Oct 26, for Sam):**
- Broken release at 1 in 6 per rest means about 58% of Broken spells end in the forced release (with 5–10% durability loss). Check that against B5 "mild" in the playtest.
- The injury timer's online/offline difference (O5/O6) is the one named parity exception. The 30-day run must treat it as such, or the comparison fails.

""",p); wr(p,s)

# B. FOOD-01
p='reference/food-01-nutrition-slice.md'; s=rd(p)
s=rep(s,"| P6 | **Basic auto-eat, free and on by default.** Below the threshold, the survivor eats from the Food slot | The policy decides; nothing waits on the player |",
 "| P6 | **Basic auto-eat, free and on by default.** Below the threshold, the survivor eats from the Food slot (order and containers: F2, F5, F17, F18, Oct 26) | The policy decides; nothing waits on the player |",p)
s=rep(s,"| O3 | **Encounter pacing.** Food cost follows pacing | Design pre-screen (BALANCE-03 round 8, Oct 21): about **90 s average** between encounters hits the field-time band with decided stress values; food demand about **10 rations a day**. Awaiting Code's H2 rerun |",
 "| ~~O3~~ | ~~**Encounter pacing.**~~ **Decided Oct 26 as O3a–O3c (§3b).** See the conflict note there: round 8 recommended 90 s; Sam chose 60 s with familiarity scaling | — |",p)
s=rep(s,"| O6 `[CODE]` | Does a nutrition or stamina value exist today? What does a ration do? Current field HP recovery rate and its file? | Code answers in step 1 |",
 "| O6 `[CODE]` | Does a nutrition or stamina value exist today? What does a ration do? Current field HP recovery rate and its file? **Extended Oct 26 (ST3):** does an attack-speed stat exist, where does evasion come from (gear bonuses and anything else), and can attack speed take a multiplier? Stop and report if a stamina system already exists with different rules | Code answers in step 1 |\n| F5-cap `[OPEN]` | **Conflict:** F5 says food comfort is capped at −10 stress per day; FOOD-02 §1a decided (Oct 21) **5 per real day**, audited in FOOD-02 §2b, with the Legendary Lunch Pail raising it to 8 | Keep the audited 5 per real day (the −10 broke nothing yet only because it isn't built); Sam to confirm |\n| F15-day `[OPEN]` | **Day unit for Well Nourished.** A game day is 24 real minutes; at about 11 meals a real day the survivor eats about 0.2 meals per game day, so 3 groups in one game day is unreachable | Count groups over one real day (or a rolling 24 real hours), the unit the food stress cap uses; Sam to confirm |\n| F11-rate `[OPEN]` | **Background find rate.** About one per 10 game minutes is one per 10 real seconds, six times the decided 60 s encounter gap: about 8,600 metal and XP grants per real day of Wandering | Set it in the economy audit (`wandering-design-audit.md` §6); a rate near one per encounter or rarer is likely |",p)
s=insert_before(s,"## 4. Open decisions","""## 3b. Decisions (Sam, Oct 26)

Recorded from Sam's voice sessions of Oct 26 (instruction docs "Zed Idler — Code Instructions Oct 26", Addendum and Addendum 2). Values are starting values unless marked otherwise.

### Top bar, auto-eat and fruit
| # | Rule | Tag | Why |
|---|---|---|---|
| F1 | **Top bar:** Nutrition shows this slice's meter (0–100) with Fed / Hungry / Starving; Medicine shows heal charges (kit + base). Any bar value with no system is hidden until one uses it. Display form: NB1 | `[DECIDED Oct 26]` | The bar must not show dead numbers |
| F2 | **Auto-eat eats the lowest-value food first.** The policy text says so; each meal is logged; a low-food warning shows on the Nutrition bar under 2 meals left. Nothing waits on the player | `[DECIDED Oct 26]` | Saves the good food; fair warning without a prompt |
| F3 | **Fruit nutrition:** apple 8, orange 8, grapes 6, raisins 8. Raisins are made by drying grapes (a simple recipe; FOOD-02 stays parked) | `[DECIDED Oct 26, starting values]` | Drying mainly buys shelf life |
| F4 | **Foraging finds** are variants of the existing "Abandoned farm" (Ethical) and "Undefended field" (Immoral) encounters (spec §2.3): orchard and vineyard. Unlock by Foraging level: apples 5, oranges 10, grapes 12. Finds appear in the log; higher Foraging finds more fruit | `[DECIDED Oct 26]` | Reuse before inventing (rules §4.3) |

### Comfort food, cola and cans
| # | Rule | Tag | Why |
|---|---|---|---|
| F5 | **Comfort food:** foods may carry a comfort value that lowers stress when eaten. Raisins −3, oranges −2, apples and grapes 0. Auto-eat picks comfort food first when stress is above 70; otherwise F2. **Daily cap: see the F5-cap conflict in §4** (−10 per day said Oct 26; 5 per real day decided Oct 21) | `[DECIDED Oct 26, testing values]`; cap `[OPEN]` | Ties to spec §13.8 comfort food |
| F6 | Oranges may later reduce sickness or infection risk. Not built until a sickness system exists | `[CONCEPT, PARKED]` | — |
| F7 | **Cola:** comfort food, −5 stress, 2 nutrition. Found only, never crafted. Rare roadside find (gas stations, stalled trucks, the "Broken-down vehicle" encounter and roadside policy events), about 2% on a successful search. Auto-eat uses it only when stress is above 70 | `[DECIDED Oct 26, testing values]` | A treat, not a meal |
| F8 | **Empty can:** the usual find at vending machines and trash bins. Scrap; banks to the Recycler as aluminium | `[DECIDED Oct 26]` | Makes the sealed can mean something |
| F9 | **Easter egg "The last can":** **0.02%** per vending-machine find (supersedes 0.5%), at most once per save. A sealed can (cola). Original log line, e.g. "One can left. You save it for later." Homage only: no brand names or quoted text from any book (rules §4.7) | `[DECIDED Oct 26, testing values]` | Finds are common, so 0.02% lands after roughly 14 hours of Wandering |
| F10 | **Hidden achievement "Can I get a number one?":** a burger, fries and a cola eaten within one game hour. Hidden until earned. Burger and fries carry both Food and Component tags. Inactive until FOOD-02 adds burgers and fries. *Watch:* a game hour is one real minute, so this needs manual eating or a deliberate auto-eat sequence | `[DECIDED Oct 26]` | — |
| F11 | **Background scavenging finds:** vending machines and trash bins are common background finds, not POIs or prompts. They resolve on their own as a log line. Each gives one piece of metal (aluminium scrap, weight only, banks via the Recycler). Frequency **`[OPEN]`, see F11-rate in §4** (proposed about one per 10 game minutes) | `[DECIDED Oct 26]` | Idle-friendly; attention stays on rare moments (rules §4.5) |
| F12 | **Scavenging XP:** each find grants a small amount of Scavenging XP through `ZI.emitAction` and resets Scavenging's decay clock (spec 3.3). Amount `[OPEN]`, listed in `wandering-design-audit.md` §6 | `[DECIDED Oct 26]` | Frequent finds could inflate Scavenging |

### Food groups, variety and containers
| # | Rule | Tag | Why |
|---|---|---|---|
| F13 | **One healing path:** food never heals HP directly. Food fills the meter; nutrition pays for out-of-combat recovery (P2/P3). Cooked dishes are worth more than their ingredients through more nutrition plus a bonus (e.g. raw potato about 5; steak and potatoes about 35 plus comfort or a short buff, `[PROPOSED]`, FOOD-02) | `[DECIDED Oct 26]` | A second heal path would duplicate med kits and drift (rules §4.3) |
| F14 | **Food groups:** every food item carries one group tag. Staples (potatoes, bread, rations): high nutrition, no extras. Protein (meat, fish): small recovery boost. Produce (fruit, vegetables): lighter; oranges link to F6. Dairy (mostly preserved: powdered milk, hard cheese, canned butter): slows nutrition drain for a while. Treats (cola, raisins): low nutrition, lower stress (F5). Numbers wait for FOOD-02 | `[CONCEPT Oct 26]` | Gives food a second dimension besides how filling it is |
| F15 | **Variety bonus "Well Nourished":** 3 groups eaten in one day: +5% damage, +5 max HP; all 5: +10% damage, +10 max HP; recalculated each day. Uses the shared buff store and simulation time (FX3). **Day unit `[OPEN]`, see F15-day in §4** | `[DECIDED Oct 26]`; values `[PROPOSED]` | Sam's priority: a varied diet makes a stronger survivor |
| F16 | **Wandering icon:** Well Nourished shows in the BAL-A status-icon row: an icon while active, five dots (one per group, filled when eaten that day), tap or hover for the bonus and time left | `[DECIDED Oct 26]` | — |
| F17 | **Auto-eat order:** default stays cheapest first (F2), with the F5 comfort rule above stress 70. A Shop unlock (RMAT) switches to variety first (a missing group first, then cheapest). Auto-eat draws from the Food slot's container | `[DECIDED Oct 26]` | Sells convenience, not relief (lead brief 5.1; P8) |
| F18 | **Food containers** go in the Food slot with a food-carrier tag. Capacity is total meals plus a cap on food types; stacks inside have no limit. Lunch bag: 6 meals, up to 4 types, 0.3 kg, early craft or find. Lunch pack: 12 meals, up to 6 types, 0.8 kg, mid craft. Cooler: 28 meals, up to 9 types, top tier, later craft; slows spoilage once spoilage exists; weight `[PROPOSED about 5 kg]`. No container: 1 stack, as today. Other consumables keep the normal stack rule (spec 14.8 #2). Not to be confused with the Legendary Lunch Pail (FOOD-02 §2b-i), a Trinket | `[DECIDED Oct 26]` | Sized to about half a day, one day and 2.5 days at about 11 meals a real day, so food stays a planning limit for 24 h circuits (C12, C21). The lunch bag can't hold all 5 groups |

### Pacing, stamina and the bar (closes O3)
| # | Rule | Tag | Why |
|---|---|---|---|
| O3a | **Base pacing: 60 s average between Wandering encounters** (code today: `WANDER_SIM_TABLE.encounterEverySec: 6`). Data-table value | `[DECIDED Oct 26, starting value]` | Round 8: about 31% field time, 2.9 Downings and 10.7 rations a day over 7 days |
| O3b | **Familiarity scaling** (`ZI.cellFamiliarity`, spec 13.8): uncleared about 40 s, explored 60 s, cleared about 90 s | `[PROPOSED]` | Dangerous ground feels busy, home ground calm |
| O3c | **Confirmation:** Code's round 8 rerun in H2 (round 8 §6) with O3a/O3b, plus Sam's smoke test for feel. Re-check F18 container sizes against the measured rations per day | `[DECIDED Oct 26]` | — |
| ST1 | **No separate stamina meter.** Stamina is the combat effect of the hunger states (P5). Fed: normal attack speed and evasion. Hungry: −25% attack speed, slightly lower evasion. Starving: −40% attack speed, lower evasion again | `[DECIDED Oct 26]`; values `[PROPOSED]` (Sam suggested −25 to −30%) | One food number; food now matters in fights |
| ST2 | Spec 13.4's "stamina or nutrition" route cost reads as nutrition; "stamina" wording superseded | `[DECIDED Oct 26]` | Follows ST1 |
| NB1 | **One layered bar** (top bar and Wandering): green fill = nutrition 0–100; blue layer = nutrition the carried food would add; outline colour = hunger state (normal / amber / red when the ST1 penalty applies) | **`[PROPOSED]` until Sam sees the mock-up** (Sam asked to see it before locking) | One place to read food, supply and penalty |

**Conflict note on O3a `[OPEN]` (for Sam):** round 8 §3 recommended **90 s**, because 60 s drops to about **21–24% field time in steady state (days 3–7)**, under the 25% band, and the model omits failed ventures, which lower field time further. Sam chose 60 s on Oct 26 with familiarity scaling. Options: keep 60 s and let the rerun decide; or move the base to 90 s with the same familiarity shape (about 60 / 90 / 135 s). B1 now makes Downings per km the main target, which the rerun should report too.

""",p); wr(p,s)

# C. FOOD-02
p='reference/parked/food-02-cooking-concept.md'; s=rd(p)
s=insert_before(s,"## 2. Proposed rules `[PROPOSED]`","""## 1b. Links from FOOD-01 (Oct 26)

Recorded in `food-01-nutrition-slice.md` §3b; listed here so this slice picks them up when unparked:
- **F3** raisins are dried grapes: the first simple recipe.
- **F10** hidden achievement "Can I get a number one?" (burger, fries, cola within one game hour) is inactive until this slice adds burgers and fries, which carry both Food and Component tags.
- **F13** dishes beat ingredients through nutrition plus a bonus (e.g. raw potato about 5; steak and potatoes about 35 plus comfort or a short buff) `[PROPOSED]`. Fits C6.
- **F14** food-group numbers are set in this slice.
- **F17** the variety-first auto-eat Shop unlock sits beside "Cook greatest to least".
- **Conflict `[OPEN]`:** F5 (Oct 26) says food comfort is capped at −10 a day; §1a decided 5 per real day (audited in §2b). Sam to confirm which stands.

""",p); wr(p,s)

# D. spec
p='reference/wandering-tab-spec.md'; s=rd(p)
lines=s.split('\n'); i=[k for k,l in enumerate(lines) if l.startswith('| Immoral | Undefended field')][0]
j=i
while lines[j].strip()!='': j+=1
lines.insert(j,"\n> **Oct 26 (FOOD-01 F4) `[DECIDED]`:** orchard (apples, Foraging 5; oranges, Foraging 10) and vineyard (grapes, Foraging 12) are variants of \"Abandoned farm\" and \"Undefended field\", not new encounters. F7: the \"Broken-down vehicle\" encounter can roll the rare cola. See `food-01-nutrition-slice.md` §3b.")
s='\n'.join(lines)
s=rep(s,"| Push on | Extends the run, raises encounter tier and rate | Stamina and risk |","| Push on | Extends the run, raises encounter tier and rate | Nutrition and risk (~~stamina~~: superseded Oct 26, FOOD-01 ST2) |",p)
s=rep(s,"a **stamina or nutrition** cost (the resource used is `[PROPOSED]`: stamina by default, nutrition on long routes).","a ~~**stamina or nutrition**~~ **nutrition** cost (~~the resource used is `[PROPOSED]`: stamina by default, nutrition on long routes~~; superseded Oct 26, FOOD-01 ST1–ST2: no separate stamina meter).",p)
s=rep(s,"- **Food:** comfort food reduces stress and ties into the nutrition cost of route changes.","- **Food:** comfort food reduces stress and ties into the nutrition cost of route changes. Values and daily cap: FOOD-01 F5 (Oct 26) and FOOD-02 §1a.",p)
s=rep(s,"- Food and Throw are quick-use slots holding one stack each. They do not count as pockets.","- ~~Food and Throw are quick-use slots holding one stack each.~~ **Superseded in part Oct 26 (FOOD-01 F18):** Throw holds one stack; Food holds one stack, or a food container (lunch bag, lunch pack, cooler) holding several food types with no stack limit inside. They do not count as pockets.",p)
wr(p,s)

# E. Fort scene
p='reference/wandering-fort-scene.md'; s=rd(p)
s=rep(s,"`[OPEN]` Which beat, and the elder's name.","""~~`[OPEN]` Which beat, and the elder's name.~~ **Oct 26 (Sam):** keep "The Sealed Crate" as drafted `[DECIDED Oct 26]`. The elder and the Elder Jester are different people; **the elder's name stays `[OPEN]`**.
- **MS1 `[DECIDED Oct 26]`:** turning in Fallow Ground is the first story milestone.
- **MS2 `[DECIDED Oct 26]`:** after the turn-in, a chapter card shows once: title "Chapter One: Fallow Ground", 2–3 story lines from this beat, a summary (days survived, cells cleared, kills, policy), the hook line, a Continue button. The survivor keeps working behind it; it closes itself after a timer `[PROPOSED 20 s]`. *Why:* the one moment that earns the player's attention (rules §4.5).
- Step 5's "Concordance introduction event" is now designed as a concept: `concordance-introduction-concept.md` (CI1–CI13, Oct 26).""",p); wr(p,s)

# F. tutorial
p='reference/tutorial-first-session-spec.md'; s=rd(p)
s=rep(s,"- The **Factions page opens**, with a clear moment (highlight the tab, a short line). The Hearthguard appear by name; the other factions remain unnamed groups until their events.\n",
"- The **Factions page opens**, with a clear moment (highlight the tab, a short line). The Hearthguard appear by name; the other factions remain unnamed groups until their events.\n- **Oct 26 `[DECIDED]` (MS1, MS2):** the turn-in is the first story milestone, closed by a one-time chapter card \"Chapter One: Fallow Ground\" (`wandering-fort-scene.md` §12.2). The turn-in scene is \"The Sealed Crate\".\n",p); wr(p,s)

# G. sim harness
p='reference/sim-harness-v1-brief.md'; s=rd(p)
s=s.rstrip('\n')+"""

## 12. Proposed milestone metric (MS3, Oct 26) `[PROPOSED]`

Report per run whether MS1 (turning in Fallow Ground) is reached, game days to reach it, and Downings and retreats before it. A run that never reaches it is flagged as a possible dead end.

**Conflict `[OPEN]`:** H2 scope (D3) excludes Fort scenes ("No Fallow Ground quest"). MS3 needs a scope change, or a proxy such as "cells cleared and distance at which the Fallow Ground goal would be met". Sam to choose when the next harness batch is drafted.
"""; wr(p,s)

# H. audit
p='reference/wandering-design-audit.md'; s=rd(p)
s=s.rstrip('\n')+"""

## 6. Open for playtest and economy review (added Oct 26)

| Item | Starting value | Why it is here |
|---|---|---|
| CI11 Diplomat tiers for the Concordance crate | low < 10, mid 10–19, high 20+; Criminal +5 per tier | Sam asked to keep it open for playtest |
| F12 Scavenging XP per background find | `[OPEN]` | Frequent finds could inflate Scavenging and stop its decay |
| F11 background find rate | proposed one per 10 game minutes (= 10 real seconds) | Six times the encounter rate; about 8,600 metal a real day of Wandering |
| O3a pacing | 60 s (round 8 recommended 90 s) | Steady-state field time at 60 s is under the band |
"""; wr(p,s)

# I. round 8
p='reference/balance-03-round8-regen-oct21.md'; s=rd(p)
s=rep(s,"- **Stop and report** if any decided rule can't be modelled in memory.","- **Stop and report** if any decided rule can't be modelled in memory.\n- **Oct 26 inputs (FOOD-01 O3a–O3c):** Sam set a 60 s base with familiarity scaling (about 40 / 60 / 90 s) as the starting value. Include 60 s and 90 s bases in the grid, report steady-state days 3–7 separately, and report Downings per km (B1, the main target) and rations per day (for F18 container sizes).",p); wr(p,s)
