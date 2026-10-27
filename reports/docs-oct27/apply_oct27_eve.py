import os, shutil, sys
ROOT = os.getcwd(); PRE = os.path.join(ROOT, 'reports/docs-oct27/pre-change-eve'); os.makedirs(PRE, exist_ok=True)
log = []
def edit(path, old, new):
    p = os.path.join(ROOT, path); s = open(p, encoding='utf-8').read(); n = s.count(old)
    if n != 1: sys.exit(f'FAIL {path}: expected 1 match, found {n}: {old[:70]!r}')
    dst = os.path.join(PRE, path.replace('/', '__'))
    if not os.path.exists(dst): shutil.copy2(p, dst)
    open(p, 'w', encoding='utf-8', newline='').write(s.replace(old, new)); log.append(path)

SP='reference/wandering-tab-spec.md'
edit(SP, 'Skills (16): combat, first aid, scavenging, stealth, athletics, endurance, foraging, smithing, medical, mechanical, discovery, trading, diplomat, logistics, engineering, command.\n',
 'Skills (17): combat, first aid, scavenging, stealth, athletics, endurance, foraging, smithing, medical, mechanical, discovery, trading, diplomat, logistics, engineering, command, cooking.\n\nCooking `[DECIDED Oct 27, Sam]`: a new skill, **separate from Foraging** (supersedes the 16-skill list). It belongs to cooking at the base stations (FOOD-02). `[OPEN]` XP sources (proposed: meals cooked at a station, more for better dishes), level cap, and what a higher level gives (proposed: faster cooking, chance of a better dish). Not yet in code (`game/stats.js` skill list).\n')
edit(SP, 'makes the 16 skills reachable through situations', 'makes the skills reachable through situations')

F1='reference/parked/fish-01-fishing-concept.md'
edit(F1, '| FP3 | Without the knife, fish gives **less nutrition**; the loss **shrinks as cooking skill rises**; the knife is always best |',
 '| FP3 | Without the knife, fish gives **less nutrition**; the loss **shrinks as Foraging rises** (`[DECIDED Oct 27 PM, Sam]`; replaces "cooking skill"); the knife is always best |')
edit(F1, 'Diplomat is already one of the 16 skills (spec, top).', 'Diplomat is already one of the skills (spec, top; 17 since Cooking was added Oct 27).')
edit(F1, '- `[OPEN]` **Prep skill:** the spec has no Cooking skill. FP3 needs one: Foraging (fishing already trains it; the Excalibur doc scaled fish nutrition with Foraging) or a new Cooking skill.',
 '- ~~`[OPEN]` **Prep skill:** Foraging or a new Cooking skill?~~ **Decided Oct 27 PM (Sam):** FP3 uses **Foraging**. Cooking is added as its own skill for the stations (spec skills line), separate from Foraging.')
edit(F1, '- `[OPEN]` **Plastic** is not a base material yet (FOOD-02 §2d); every gear recipe here depends on it.',
 '- ~~`[OPEN]` **Plastic** is not a base material yet.~~ **Decided Oct 27 PM (Sam):** plastics is the **seventh base material** (FOOD-02 §2d). `[OPEN]` its sources and abundance.\n- `[OPEN]` **Component reuse plan** (wire → `wiring`; wood frame and wood handle → from `planks`; metal clasp, metal hook, plastic reel and plastic float new): read back to Sam Oct 27 PM, awaiting his confirmation.')

F2='reference/parked/food-02-cooking-concept.md'
edit(F2, '- `[CONCEPT Oct 27]` **Stations:** smoker, cook basin and kettle pot. Not built yet.',
 '- `[CONCEPT Oct 27]` **Stations:** smoker, cook basin and kettle pot. **`[DECIDED Oct 27 PM, Sam]` They are steps of the §2c station ladder, unlocked through the Shop** (see §2c). Not built yet.')
edit(F2, '- `[PROPOSED Oct 27, Sam]` **Plastics** as a new material (containers and seals that slow spoilage, water jugs; fishing gear in FISH-01). `[OPEN]` a seventh base material, or replacing one of the six (`[CODE]` wood, metal, cloth, medical, electronics, fuel).',
 '- `[DECIDED Oct 27 PM, Sam]` **Plastics is the seventh base material**, alongside `[CODE]` wood, metal, cloth, medical, electronics and fuel (containers and seals that slow spoilage, water jugs; fishing gear in FISH-01). `[OPEN]` where plastics drops and how abundant it is (proposed: between wood and metal). Code: `ZI_MATERIALS` and every "six base materials" recipe comment change when a batch builds it.')
edit(F2, '- `[OPEN]` Reconcile with §2c\'s station ladder (Campfire → Camp stove → Field kitchen): are the smoker, cook basin and kettle pot rungs of that ladder, or parallel stations with different jobs?',
 '- ~~`[OPEN]` Rungs of the §2c ladder, or parallel stations?~~ **Decided Oct 27 PM (Sam): rungs of the ladder, as Shop unlocks** (§2c).')
edit(F2, '**Shop unlocks (RMAT, efficiency only):** an extra cooking queue slot;',
 '**Stations as Shop unlocks `[DECIDED Oct 27 PM, Sam]`:** the kettle pot, cook basin and smoker are **steps of this ladder, unlocked in the Shop** (the Shop replaces the Market tab; currency RMAT, decided Oct 25). The Campfire stays free from the start and cooks every basic recipe, so eating is never locked behind the Shop (rule 5.1). `[PROPOSED]` order Campfire → kettle pot → cook basin → camp stove → smoker → field kitchen; the Shop unlocks a station, then the player crafts it from wood, metal and plastics (keeps the material balance in §2d). `[OPEN]` the order, whether the camp stove and field kitchen stay, and RMAT prices.\n\n**Shop unlocks (RMAT, efficiency only):** an extra cooking queue slot;')

TU='reference/tutorial-first-session-spec.md'
edit(TU, '| Market | Parked feature. Its tutorial is written in the batch that builds it | One-line placeholder until then (7.6) |',
 '| ~~Market~~ Shop | **The Shop replaces the Market tab** `[DECIDED Oct 27 PM, Sam]`. Parked feature; its tutorial is written in the batch that builds it | One-line placeholder until then (7.6) |')
edit(TU, '### 7.6 Market (placeholder)\n',
 '### 7.6 Market (placeholder) — becomes the Shop\n\n`[DECIDED Oct 27 PM, Sam]` **The Shop replaces the Market.** The Market tab becomes the Shop (RMAT currency, decided Oct 25), which holds the Shop unlocks (cooking stations, FOOD-02 §2c; "one loop only", C9; retreat rules, `parked/retreat-rules-shop.md`). `[OPEN]` what happens to the Auction view (player-to-player listings): remove, or park for later; and the Schedule task "Marketplace Trade". The `market.placeholder` text below changes with the batch that builds the Shop.\n')

IX='reference/00-document-index.md'
edit(IX, '| Date | Decision | Recorded in |\n|---|---|---|\n',
 '| Date | Decision | Recorded in |\n|---|---|---|\n| Oct 27 (evening) | Sam\'s answers: **Cooking** added as a 17th skill, separate from Foraging; fish prep loss (FP3) scales with **Foraging**; **plastics is the seventh base material**; smoker, cook basin and kettle pot are **steps of FOOD-02\'s station ladder, unlocked in the Shop**; **the Shop replaces the Market tab**. Component reuse plan read back, awaiting confirmation | `wandering-tab-spec.md` (skills); `parked/fish-01-fishing-concept.md` FP3, §8; `parked/food-02-cooking-concept.md` §2c, §2d; `tutorial-first-session-spec.md` 7.6 |\n')
print('\n'.join(log))
