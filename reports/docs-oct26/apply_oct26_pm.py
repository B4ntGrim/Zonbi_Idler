import io,sys,re
def rd(p): return io.open(p,encoding='utf-8').read()
def wr(p,s): io.open(p,'w',encoding='utf-8',newline='').write(s); print("ok",p)
def rep(s,old,new,p):
    n=s.count(old)
    if n!=1: sys.exit(f"FAIL {p}: {n} matches for {old[:70]!r}")
    return s.replace(old,new)
def rowrep(s,prefix,new,p):
    L=s.split('\n'); hit=[i for i,l in enumerate(L) if l.startswith(prefix)]
    if len(hit)!=1: sys.exit(f"FAIL {p}: {len(hit)} rows {prefix!r}")
    L[hit[0]]=new; return '\n'.join(L)
D="`[DECIDED Oct 26, PM]`"

p='reference/food-01-nutrition-slice.md'; s=rd(p)
s=rowrep(s,"| O3a |",f"| O3a | **Base pacing: 90 s average between Wandering encounters** {D} (supersedes 60 s; code today `encounterEverySec: 6`). Data-table value | `[DECIDED Oct 26, starting value]` | Round 8: 60 s falls under the field-time band in steady state; 90 s holds about 29–31% |",p)
s=rowrep(s,"| O3b |","| O3b | **Familiarity scaling** (`ZI.cellFamiliarity`, spec 13.8): uncleared about 60 s, explored 90 s, cleared about 135 s (supersedes 40 / 60 / 90) | `[PROPOSED]` | Dangerous ground feels busy, home ground calm |",p)
s,n=re.subn(r"\*\*Conflict note on O3a `\[OPEN\]` \(for Sam\):\*\*[^\n]*\n", "**O3a conflict resolved Oct 26 (PM):** Sam moved the base to 90 s with familiarity 60 / 90 / 135 s.\n\n**Meals target `[DECIDED Oct 26, PM]`:** about **three meals per real day** (supersedes the ~11 rations a day sizing). `[OPEN]` How food reaches that (meal value, nutrition per full heal, walking drain), set with the round 8 rerun; then resize F18 (6 / 12 / 28 meals).\n", s, count=1)
if n!=1: sys.exit("FAIL O3a note")
for old,new in [("**Daily cap: see the F5-cap conflict in §4** (−10 per day said Oct 26; 5 per real day decided Oct 21)","**Daily cap: 5 stress per real day** (FOOD-02 §1a, audited; the −10 wording is superseded, Oct 26 PM). The Legendary Lunch Pail raises it to 8"),
 ("`[DECIDED Oct 26, testing values]`; cap `[OPEN]`","`[DECIDED Oct 26, testing values]`"),
 ("Frequency **`[OPEN]`, see F11-rate in §4** (proposed about one per 10 game minutes)","Frequency **about one per 90 s of Wandering** "+D+" (supersedes one per 10 game minutes): about 960 finds a real day; the last can (0.02%) lands after about 5 days of nonstop wandering"),
 ("**Day unit `[OPEN]`, see F15-day in §4**","**Counted over one real day** "+D+", the unit of the food stress cap"),
 ("Sized to about half a day, one day and 2.5 days at about 11 meals a real day","Sized to about half a day, one day and 2.5 days at about 11 meals a real day; **to be resized for the three-meals target** after the round 8 rerun")]:
    s=rep(s,old,new,p)
for pre in ("| F5-cap `[OPEN]`","| F15-day `[OPEN]`","| F11-rate `[OPEN]`"):
    L=s.split('\n'); i=[k for k,l in enumerate(L) if l.startswith(pre)]
    if len(i)!=1: sys.exit("FAIL "+pre)
    L.pop(i[0]); s='\n'.join(L)
wr(p,s)

p='reference/parked/food-02-cooking-concept.md'; s=rd(p)
s=rep(s,"- **Conflict `[OPEN]`:** F5 (Oct 26) says food comfort is capped at −10 a day; §1a decided 5 per real day (audited in §2b). Sam to confirm which stands.","- **Resolved Oct 26 (PM):** the food comfort cap stays **5 per real day** (§1a); F5's −10 wording is superseded.",p); wr(p,s)

p='reference/balance-03-round8-regen-oct21.md'; s=rd(p)
s=rep(s,"Sam set a 60 s base with familiarity scaling (about 40 / 60 / 90 s) as the starting value.","Sam set a 60 s base, then **moved it to 90 s (Oct 26 PM)** with familiarity scaling about 60 / 90 / 135 s. Also report what food mechanics reach about three meals a real day (meals target).",p); wr(p,s)

p='reference/wandering-design-audit.md'; s=rd(p)
s=rowrep(s,"| F11 background find rate","| F11 background find rate | about one per 90 s (decided Oct 26 PM) | Check metal and Scavenging XP per real day (about 960 finds) |",p)
s=rowrep(s,"| O3a pacing","| O3a pacing | 90 s base (decided Oct 26 PM; familiarity 60 / 90 / 135 s) | Confirm with the round 8 rerun |",p); wr(p,s)

p='reference/sim-harness-v1-brief.md'; s=rd(p)
s=rep(s,"**Conflict `[OPEN]`:** H2 scope (D3) excludes Fort scenes (\"No Fallow Ground quest\"). MS3 needs a scope change, or a proxy such as \"cells cleared and distance at which the Fallow Ground goal would be met\". Sam to choose when the next harness batch is drafted.",
"**Proxy `[DECIDED Oct 26, PM]`:** H2 scope D3 stays unchanged (no Fort scenes). MS3 reports whether the survivor becomes strong enough to clear the Fallow Ground cell (its clear target) and game days to get there. The real turn-in is tested with players.",p); wr(p,s)

p='reports/level-12/LEVEL12_REPORT.md'; s=rd(p)
s=s.rstrip('\n')+"\n\n**Decided Oct 26 (PM), Sam:** character XP is banked automatically on every return from a run (retreat, forced retreat, Downed and offline settlement), the same watched or away, through the XP bus. Code fix goes in a batch.\n"; wr(p,s)

p='reference/wandering-tab-spec.md'; s=rd(p)
s=rep(s,"Side effect accepted: valuable entries are heavy.","Side effect accepted: valuable entries are heavy. **Superseded Oct 26 (W-1, Sam):** every item has its own real-world weight per item type in the data table (e.g. aluminium can about 0.02 kg, gemstone about 0.05 kg `[PROPOSED]`); rarity never changes weight. Code reports current `ZI.salvageWeight` values and callers first (W-3).",p)
s=rep(s,"> - Movement: ×1.00 up to 100%, linear to ×0.75 at 125% (110% → ×0.90, 120% → ×0.80). Above 125% without a pickup, movement stays clamped at ×0.75.","> - Movement: ×1.00 up to 100%, linear to ×0.75 at 125% (110% → ×0.90, 120% → ×0.80). Above 125% without a pickup, movement stays clamped at ×0.75.\n> - **Oct 26 (W-2, Sam) `[DECIDED]`, values `[PROPOSED]`:** load up to 50% of capacity costs no speed; above that each extra kg slows movement by pace (walk −1%, jog −1.5%, run −2% per kg). The 125% pickup limit stays. `[OPEN]` How W-2 replaces or combines with the line above: Code reports the walk/jog/run constants first (W-3).",p); wr(p,s)

p='reference/weapons-development-directive.md'; s=rd(p)
s=s.rstrip('\n')+"\n\n## Candidate for a later phase `[CONCEPT, PARKED]` (Sam, Oct 26)\n- **Gem socketing:** gemstones are valuable and light (real-world weight, W-1) and may later be socketed into weapons. Not scheduled; take up in a later weapons phase after the conflict check (§3).\n"; wr(p,s)

p='reference/wandering-fort-scene.md'; s=rd(p)
s=rep(s,"**the elder's name stays `[OPEN]`**.","**the elder is Elder Jerry** `[DECIDED Oct 26, PM]` (closes the name item).",p)
s=rep(s,"**Remaining (content work):** write the full dialogue tree for the gate, the elder and the quest turn-in; write the story beat that follows the turn-in; design the event that introduces the Concordance.","**Remaining (content work):** ~~write the full dialogue tree for the gate, the elder and the quest turn-in; write the story beat that follows the turn-in; design the event that introduces the Concordance.~~ All three done Oct 26: dialogue tree §12.2a, Sealed Crate §12.2, Concordance `concordance-introduction-concept.md`.",p)
s=rep(s,"### 12.3 Extra gear wear near the Fort after an attack","""### 12.2a Dialogue tree `[DECIDED Oct 26, Sam; first-draft text, may be polished]`

Text lives in data (terminal style, original). The elder is **Elder Jerry**.

**1. Gate**
- Guard opening: "Far enough. Nobody comes past the pikes without a reason. What do you have that we want?"
- Offer med kit: "Medicine. That's worth more than gold out here. Wait here." (offering terms, §12.1)
- Diplomat pass: "You talk like someone who's bargained before. Fine. The elder decides." Fail: "Words are cheap. Come back with something real."
- Command pass: "You've got nerve. Jerry might like that." Fail: "Don't push me, stranger."
- Leave: "Smart."
- Attack: confirmation "This cannot be undone. The Hearthguard will be hostile."

**2. Meeting Jerry**
- Offering terms: "So you're the one with the medicine. I'm Jerry. I keep this place fed. There's a field south of here, Fallow Ground, crawling with the dead. Clear it and you've got a seat at our table."
- Harder terms (check): "You talked your way in. Talk's fine, but work's better. Clear the south field, and clear it well."
- Accept: "Good. Come back when it's done. We'll know."
- Decline: "Your choice. The gate opens again when you're ready." The quest stays available (no dead end).

**3. Turn-in:** the §12.2 Sealed Crate beat, with Jerry. Closing line: "That mark is not ours. Somebody built this. Find out who."

**4. Refusals and the hostile path**
- Return after being turned away: "You again. Pockets still empty?"
- Heinous, later visit: "We've heard what you are. Turn around before the pikes find you." No quest.
- Successful attack: a horn sounds. Jerry from the tower: "He had a daughter. Remember that, when you come asking for anything." Heinous unlocks; Hearthguard Hostile (§10.4).
- Failed attack: "We don't kill strangers. Don't make that our rule." The survivor is driven off wounded (§11.3, §12.6 #3).

### 12.3 Extra gear wear near the Fort after an attack""",p); wr(p,s)

p='reference/trav-01-traversal-slice.md'; s=rd(p)
s=rep(s,"## 3. Proposed details (P1–P7 accepted Oct 21, T11)","""## 2a. TRAV-02 daily movement cap and Camp Leader assignment (Oct 26)

| # | Rule | Tag | Why |
|---|---|---|---|
| TRAV-02 | **Square-by-square Traversal movement is capped per real day by transport,** using ROUTE-01 R3: foot 2, bike 3, electric bike 5, vehicle 8+ (starting value). Resets each real day at local midnight, like scout charges (T1) | `[DECIDED Oct 26]` | Limits travel per day by transport |
| TRAV-02a | **Tutorial exemption:** uncapped until Fallow Ground is turned in | `[DECIDED Oct 26]` | The first Fort is 2–3 squares away; the first session must reach it, clear Fallow and return in 20–30 minutes |
| TRAV-02b | **Forced retreat, Run Back and other emergency withdrawals never count** against the cap. Circuit travel follows the circuit rules (C1–C21) | `[DECIDED Oct 26, PM]` | A spent cap must never strand the survivor (no dead ends) |
| CL-assign | **Camp Leader assignment:** select an available survivor, then click a Traversal cell to assign that survivor's job there. T5 unchanged: the section stays hidden in Solo | `[CONCEPT Oct 26]` | Micromanage what each survivor does for the camp |

**Conflict `[OPEN]` (for Sam):** T18 (`[DECIDED Oct 22]`, concept) limits travel with a **stamina pool** (5 per cell, regen 10 per real hour). FOOD-01 ST1 (Oct 26) says there is **no separate stamina meter**, and TRAV-02 now caps travel per day. Three rules limit the same thing. Options: drop T18 in favour of TRAV-02; or keep T18 and drop TRAV-02; or make T18's cost nutrition (ST2). Recommendation: drop T18; TRAV-02 is simpler to read and test.

## 3. Proposed details (P1–P7 accepted Oct 21, T11)""",p); wr(p,s)

p='reference/route-01-route-builder-concept.md'; s=rd(p)
s=rep(s,"| R3 | **Route length by transport:**","| R3 | **Route length by transport** (also the daily Traversal movement cap, TRAV-02, Oct 26; emergency withdrawals exempt):",p); wr(p,s)

p='reference/tutorial-first-session-spec.md'; s=rd(p)
s=rep(s,"## 5. Fort placement rule `[DECIDED concept, PROPOSED specifics]`","## 5. Fort placement rule `[DECIDED concept, PROPOSED specifics]`\n\n> **Oct 26 (TRAV-02a) `[DECIDED]`:** the daily Traversal movement cap does not apply until Fallow Ground is turned in, so the first session can reach the Fort, clear Fallow Ground and return.",p); wr(p,s)

p='reference/concordance-introduction-concept.md'; s=rd(p)
s=rep(s,"plus an uncommon Concordance gear drop `[PROPOSED 25%]`","plus a roll on the CI14 drop table (25% total; supersedes \"uncommon gear drop\")",p)
s=rep(s,"## 3. Open","""## 2a. Gear, repeat teams and identity (Sam, Oct 26 PM)

**CI14 Survey team drop table** `[DECIDED Oct 26; values kept as set, no pity counter]`. Rolled once per win against a Concordance survey team; 25% total.

| Item | Chance per win | Slot | Category | Rarity | Tags |
|---|---|---|---|---|---|
| Respirator mask | 12% | Mask | Protective gear | Uncommon | Concordance, hazard protection |
| Sample case | 7% | Belt | Carrier (3 pockets) | Uncommon | Concordance, medical, storage |
| Hazmat suit | 4% | Body Armour | Protective gear | Rare | Concordance, hazard protection, heavy |
| Dart gun | 1.5% | Ranged | Weapon | Rare | Concordance, ranged, needs ammo, quiet |
| Field scanner | 0.5% (about 1 in 200 wins) | Trinket | Tool | Legendary | Concordance, information, scouting |

All five carry the drop-source tag "Concordance survey team". The rarity names must match the tiers in code (W-3 check).

| # | Rule | Tag | Why |
|---|---|---|---|
| CI15 | **Repeat survey teams:** after the introduction, teams join the Wandering pools as a faction NPC encounter (spec 4.4). Every defeated team rolls CI14. Friendly players may trade or pass; only hostile or Heinous players fight | `[DECIDED Oct 26]` | A one-time fight would make rare items unreachable |
| CI16 | **Frequency by distance** to the nearest Concordance fort: adjacent (1 square) about 6 a real day; near (2–4) about 2; far (5+) about 1. Before a Concordance fort exists, the far rate applies | Bands `[DECIDED Oct 26]`; rates `[PROPOSED]` | The map becomes the dial; rare items reward riskier territory |
| CI17 | **Sample case effect:** while equipped, each medical supply picked up has a 25% chance `[PROPOSED]` of one extra. Freshness may come with spoilage `[CONCEPT]` | `[DECIDED Oct 26]` | Replaces a forced-retreat protection idea that did nothing (carried items are never lost, spec 13.8 Batch 3B) |
| CI18 | **Identity:** they research the infection itself and capture the infected to study them; publicly they want a cure, privately some want control (the infected as weapons); they live in sealed labs with air filters and strict rules, and look down on "primitive" farmers like the Hearthguard | `[DECIDED Oct 26]` | Fits the hexagon, the crate's lab mark and all five items |

**Item roles** `[CONCEPT Oct 26]`: respirator and hazmat suit protect against BIOME-01 hazards (smoke, toxic ground, cold), later infection; the hazmat suit is heavy, weak against bites and replaces a vest. Dart gun `[PARKED]` until weapons Phase 6 and AMMO-12. Field scanner reads a zombie's tier and traits before a fight and speeds Codex entries; the strongest of the five.

**Pacing check** (about 2 teams a day, about 70% wins): respirator about 6 days, sample case about 10, hazmat suit about 2.5 weeks, dart gun about 7 weeks, field scanner about 5 months; faster near a fort.

## 3. Open
- `[OPEN]` CI14 item stats and weights (real-world weights, W-1).""",p); wr(p,s)

p='reference/playtest-findings-oct15.md'; s=rd(p)
s=s.rstrip('\n')+"""

## PF14 — BAL-A / TRAV-01a smoke test (Sam, Oct 26, TEST SAVE, Camp Leader mode)

| Check | Result |
|---|---|
| Walk home | **PASS.** Walked to the checkpoint, one getaway roll (14 vs 27%), haul banked, rest started on its own with the ≥ 80% gate |
| Broken gear | **NOT RUN.** No Melee weapon on this save. `[OPEN]` Check whether this save went through the Jester and should have a starter weapon (U17/U29) |
| Codex unlock from Wandering | **Not a defect (correction).** Fought types stayed ????, but B6 (Option B) was decided only on Oct 26 and is not built: `WANDER_SIM_TABLE.codexFromWandering` is still `false` (`game/wandering.js:315`, gate at :327). Expected until the B6 batch. Not a BAL-A blocker |
| Codex "In development" tab | **Finding.** Shows all 60 entries (F–SS) and clicking reveals tier submenus. **Decided Oct 26:** developer-only tool, hidden in player builds behind a developer flag |
| Scout (TRAV-01a) | **PASS.** 5 charges; "4/5 today"; repeat shows "XP already earned today" |
| Hide (TRAV-01a) | **PASS.** Threat tiers F–E; 2 uses a rolling 24 h (CLOCK-01 O1, decided Oct 24); XP once a day |
| Camp Leader section | **PASS in Camp Leader mode.** Re-check that it is hidden on a Solo save (T5) |
| Injury timer | **NOT COMPLETED** (blocked by PF15) |

## PF15 — Progress reverts on reopen (CRITICAL defect, Oct 26) `[CODE finding, read-only]`

**What Sam saw:** after closing and reopening the TEST SAVE, the tutorial played again, no offline catch-up, the old starter kit (pouch, med kit, scout kit) sat unequipped, scout charges were full again.

**Cause found (read-only, Oct 26):** the save-files screen's **▶ Continue** button calls `ZI.loadSlot` (`Zombie Idler v2.html:809, 857`), which runs `ZI._restore(snapshot)` (`game/save.js` `loadSlot`, `_restore`): it **deletes every live `zi_*` key and replaces them with the slot's stored snapshot**. That snapshot is written only when the file is created (`startNewInSlot` → `_writeSlot`) or when the player presses Save in the top bar (`saveToActiveSlot`). There is **no autosave**. So unless Save was pressed, Continue reverts the save to its creation state: fresh starter kit (Jester `onNewSave`), empty tutorial progress, full charges, empty Codex, the clock of that moment (so nothing to catch up).

**Consequence:** the live progress on the TEST SAVE was overwritten when Continue was pressed and cannot be recovered from the files.

**Fix direction `[PROPOSED]`, for Sam to approve before Code changes anything:** (1) Continue on the **active** file keeps live progress (write the snapshot first, or skip the restore); (2) autosave the active slot on a timer and on page hide/unload; (3) regression test: close, reopen, Continue preserves every `zi_*` key except those catch-up legitimately changes.

## PF16 — Wandering animation too simple (Sam, Oct 26) → ANIM-01

**ANIM-01 `[DECIDED Oct 26; details PROPOSED]`:** replace the back-and-forth sway with (1) a walk cycle by pace (walk slow, jog bouncy, run leaning), (2) event reactions (flinch, swing, burst on a kill), (3) load and state (heavy load shortens stride, low HP limps, high stress glances around), (4) resting idles (sitting, map, eating). Display only: reads shared state and events, never writes them (spec §9, FX4); watched and offline results identical; no new prompts. Order: 1 and 2 first. Slice after CLOCK-01 and BIOME-01; Code first reports read-only how the current sway is drawn.
"""; wr(p,s)
