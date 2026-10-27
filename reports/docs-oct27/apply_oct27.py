import os, shutil, sys, re
ROOT = os.getcwd()
PRE = os.path.join(ROOT, 'reports/docs-oct27/pre-change')
log = []
def edit(path, old, new):
    p = os.path.join(ROOT, path)
    s = open(p, encoding='utf-8').read()
    n = s.count(old)
    if n != 1:
        sys.exit(f'FAIL {path}: expected 1 match, found {n}: {old[:70]!r}')
    dst = os.path.join(PRE, path.replace('/', '__'))
    if not os.path.exists(dst): shutil.copy2(p, dst)
    open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new))
    log.append(path)

# 1 POI brief — tick-based fishing supersedes per-cell cooldown
poi = 'reference/poi-framework-v1-brief.md'
edit(poi, '- One action, one per-cell cooldown.',
 '- One action. ~~One per-cell cooldown.~~ Superseded Oct 27 (Sam): tick-based fishing, see `parked/fish-01-fishing-concept.md` §1.')
edit(poi, '- A cell gives up to **N pulls per visit**, then rests for one game day.',
 '- ~~A cell gives up to **N pulls per visit**, then rests for one game day.~~ **Superseded Oct 27 (Sam):** fishing is tick-based; each clock tick is a fresh roll and the player cancels at any time (`parked/fish-01-fishing-concept.md` FA3).')
edit(poi, '| Pulls per visit (N) | 3 |', '| ~~Pulls per visit (N)~~ | ~~3~~ superseded Oct 27 (tick-based, FISH-01) |')
edit(poi, '| Cell rest after N pulls | One game day (primary balance lever) |',
 '| ~~Cell rest after N pulls~~ | ~~One game day~~ superseded Oct 27; tick length is now the primary balance lever (FISH-01) |')
edit(poi, '- The Sunken Blade Easter egg is [PARKED] (see PARKED.md); not in v1 scope.',
 '- The Sunken Blade Easter egg is [PARKED] (see PARKED.md); not in v1 scope. Questline redesigned Oct 27 (Lady of the Lake): `parked/fish-01-fishing-concept.md` §5.')

# 2 PARKED.md — Sunken Blade trigger and scene choice
edit('PARKED.md', 'After [PROPOSED: 50] water visits or fishing attempts, a pull triggers a terminal-style dialogue scene granting a unique rusted claymore that must be restored before use.',
 '~~After [PROPOSED: 50] water visits or fishing attempts, a pull triggers a terminal-style dialogue scene granting a unique rusted claymore that must be restored before use.~~ **Trigger superseded Oct 27 (Sam):** 10 fishing spots → the Lady of the Lake → gift five legendary fish → quest → pond scene (`reference/parked/fish-01-fishing-concept.md` §5). Without the Broken Crown the blade is the unique rusted claymore that must be restored; wearing the crown it comes out unbroken at a quality tier.')
edit('PARKED.md', 'OPEN: does the scene offer a real choice (draw it / leave it)?',
 '~~OPEN: does the scene offer a real choice (draw it / leave it)?~~ Decided Oct 27: draw it or leave it; a left blade waits at that pond as a Traversal action.')

# 3 FOOD-01 — legendary chance
edit('reference/food-01-nutrition-slice.md', '| Legendary | 30 (fixed) | 3% | value `[DECIDED Oct 21]`, chance `[PROPOSED]` |',
 '| Legendary | 30 (fixed) | ~~3%~~ 0.1% per roll | value `[DECIDED Oct 21]`; chance `[DECIDED Oct 27, Sam, starting value]`, supersedes 3%. `[OPEN]` rerun the fish sim: Common/Uncommon shares and visit estimates assumed 3%; more tiers coming (`parked/fish-01-fishing-concept.md` §2) |')

# 4 Djinn — gate conflict
dj = 'reference/parked/djinn-fishing-concept.md'
edit(dj, '## 5. Open\n\n',
 '## 5. Open\n\n- `[OPEN]` **Oct 27 conflict (Sam\'s fishing decisions, `fish-01-fishing-concept.md`):** the legendary chance is now 0.1% per tick roll (was 3% of fish), and five legendary fish are gifted to the Lady of the Lake. The gate value (5) and the "about 100 / 26 visits" estimate need a rerun. Recommended: the gate counts legendaries **caught**, so gifting them never closes it.\n')

# 5 FOOD-02 — cooking stations and plastics
f2 = 'reference/parked/food-02-cooking-concept.md'
edit(f2, '## 3. Open\n',
 '''## 2d. Cooking stations, materials and spoilage (Sam, Oct 27)

- `[CONCEPT Oct 27]` **Stations:** smoker, cook basin and kettle pot. Not built yet. Each needs its own art and is **clickable inside the crafting/cooking menu**. Spoilage is tackled through them (the smoker preserves fish and meat, `[PROPOSED]`).
- `[DECIDED Oct 27]` **Material balance:** metal and wood each get their own balance; **wood is more abundant than metal**. `[PROPOSED]` kettle pot mostly metal, smoker mostly wood, cook basin a mix, so neither material bottlenecks.
- `[PROPOSED Oct 27, Sam]` **Plastics** as a new material (containers and seals that slow spoilage, water jugs; fishing gear in FISH-01). `[OPEN]` a seventh base material, or replacing one of the six (`[CODE]` wood, metal, cloth, medical, electronics, fuel).
- `[PROPOSED]` **Spoilage starting reference:** GDD v5.3 decay, perishables lose 10% of value every two days at camp; during travel it depends on containers.
- `[OPEN]` Reconcile with §2c's station ladder (Campfire → Camp stove → Field kitchen): are the smoker, cook basin and kettle pot rungs of that ladder, or parallel stations with different jobs?
- Fish preparation (descaling knife, skill-scaled loss) lives in `fish-01-fishing-concept.md` §3.

## 3. Open
''')

# 6 Spec — Diplomat XP
edit('reference/wandering-tab-spec.md',
 'Skills (16): combat, first aid, scavenging, stealth, athletics, endurance, foraging, smithing, medical, mechanical, discovery, trading, diplomat, logistics, engineering, command.\n',
 'Skills (16): combat, first aid, scavenging, stealth, athletics, endurance, foraging, smithing, medical, mechanical, discovery, trading, diplomat, logistics, engineering, command.\n\nDiplomat XP `[DECIDED Oct 27, Sam]`: earned from trading, negotiating and successfully talking past NPC encounters (siren checks included, FISH-01 §6), **on successes only**; failed checks give no XP. `[OPEN]` level cap; whether a trade gives both Trading and Diplomat XP.\n')

# 7 ANIM-01 — pickup animation
edit('reference/playtest-findings-oct15.md',
 'Slice after CLOCK-01 and BIOME-01; Code first reports read-only how the current sway is drawn.\n',
 'Slice after CLOCK-01 and BIOME-01; Code first reports read-only how the current sway is drawn.\n\n**ANIM-01 addition `[CONCEPT Oct 27]` (Sam):** the main character is a retro pixel-style sprite (size `[OPEN]`; the art must carry over to the Unity port). New **loot pickup** animation: he **bends at the waist** (legs mostly straight, slight knee bend; not a squat), leans in and grabs the item off the ground. `[PROPOSED]` 6 frames: weight shifts forward · hips hinge, back leans · torso about level, arm reaches down, free arm swings back · hand closes (hold this frame longer) · rises with the item to the chest · standing. Sam updated the Wandering animation art Oct 27; review the team\'s uploads before building.\n')

# 8 Index
ix = 'reference/00-document-index.md'
edit(ix, '# Zed Idler — Document Index (updated Oct 26, afternoon)', '# Zed Idler — Document Index (updated Oct 27)')
edit(ix, '| `djinn-fishing-concept.md` | The djinn fishing secret: wish of three items, curse (Hunted + Hollow), Endured reward | Until the Water POI fishing loop ships and FOOD-01 closes. Copied Oct 24 |\n',
 '| `djinn-fishing-concept.md` | The djinn fishing secret: wish of three items, curse (Hunted + Hollow), Endured reward | Until the Water POI fishing loop ships and FOOD-01 closes. Copied Oct 24 |\n| `fish-01-fishing-concept.md` | FISH-01: tick-based fishing in Traversal, fish tiers, fish prep and descaling knife, fishing gear and components, the Sunken Blade / Lady of the Lake questline, Naga Sirens and Black Haven | Until the Water POI fishing loop ships and FOOD-01 closes. New Oct 27 |\n')
edit(ix, '| Date | Decision | Recorded in |\n|---|---|---|\n| Oct 26 (evening) |',
 '| Date | Decision | Recorded in |\n|---|---|---|\n| Oct 27 | Voice session (Sam): FISH-01 tick-based fishing in Traversal (supersedes per-cell rest), legendary 0.1% per roll, fish prep with descaling knife (skill-scaled loss), gear rod/net/traps + waders, tackle box, lures/bait, fisher\'s hat, sub-parts as components; Sunken Blade via the Lady of the Lake (10 spots, five legendary fish, Broken Crown, Discovery and loot-quality %), Naga Sirens for Black Haven (Diplomat check); Diplomat XP on successes; cooking stations and wood/metal balance; plastics proposed; ANIM-01 pickup animation concept. Conflicts flagged: prep skill, fish sim at 0.1%, djinn gate | `parked/fish-01-fishing-concept.md`; `poi-framework-v1-brief.md`; `food-01-nutrition-slice.md`; `parked/food-02-cooking-concept.md` §2d; `parked/djinn-fishing-concept.md` §5; `wandering-tab-spec.md`; `playtest-findings-oct15.md`; `PARKED.md` |\n| Oct 26 (evening) |')

print('\n'.join(log))
