import os, shutil, sys
ROOT = os.getcwd()
PRE = os.path.join(ROOT, 'reports/docs-oct27/pre-change-pm')
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

# ---------- Addendum 10: PF15 order ----------
pf = 'reference/pf15-save-continue-slice.md'
edit(pf, '**Status:** Decisions `[DECIDED Oct 26, Sam]`. Draft batch below; **not yet issued** as `CURRENT_BATCH.md`. CLOCK-01 is still the active batch (NOT CLOSED: manual browser checks pending).',
 '**Status:** Decisions `[DECIDED Oct 26, Sam]`. **Next batch** `[DECIDED Oct 26, Sam, Addendum 10]`: issue this ahead of CLOCK-01\'s remaining manual checks. Draft batch below; not yet copied to `CURRENT_BATCH.md` (CLOCK-01 stays NOT CLOSED until its manual checks run on a reliable save).')
edit(pf, '- `[OPEN]` **Order with CLOCK-01:** pause CLOCK-01\'s remaining manual checks and ship PF15 first, or close CLOCK-01 first. Recommendation: PF15 first; CLOCK-01\'s remaining checks are manual browser checks that need a reliable save.',
 '- ~~`[OPEN]` **Order with CLOCK-01:** pause CLOCK-01\'s remaining manual checks and ship PF15 first, or close CLOCK-01 first.~~ **Decided Oct 26 (Sam, Addendum 10):** PF15 first, as the next batch, ahead of CLOCK-01\'s remaining manual checks.')

# ---------- Addendum 10 + 11: biome counters, Perimeter ----------
bi = 'reference/biome-01-chunks-slice.md'
edit(bi, '| Concordance respirator (CI14) blocks smoke; stealth',
 '| An **improvised respirator** (base tier, anyone, Addendum 10) or the Concordance respirator (CI14; same tier, Addendum 11) blocks smoke; stealth')
edit(bi, '| Hazmat suit (CI14) blocks radiation; a medical item treats it.',
 '| **Improvised radiation protection** (suit or anti-radiation medicine; base tier, anyone, Addendum 10) or the hazmat suit (CI14) blocks radiation; a medical item treats it.')
edit(bi, "| **`[PROPOSED]` — Sam to confirm** (presented by voice Oct 26; Sam's reply covered the mountain question) |",
 '| `[DECIDED Oct 26, Sam]` (Addendum 10); values `[PROPOSED]` |')
edit(bi, '**Conflict `[OPEN]` (for Sam):** the city and Perimeter counters are Concordance gear',
 '''**Resolved Oct 26 (Sam, Addendum 10; tier amended by Addendum 11):** every hazard has a **base-tier counter anyone can get**, made of **improvised** gear (improvised respirator for smoke; improvised radiation protection, a suit or anti-radiation medicine, for the Perimeter). Lore: people, NPCs included, scavenge scraps, make improvised components and build improvised finished items; improvised gear is low quality and is the base tier only. Sources: carried by NPCs; loot at Traversal POIs and checkpoints; craftable through the improvised chain (scavenged material → improvised component → improvised item). As the story goes on the player learns these are not the best (a gear ladder). Addendum 11 puts Concordance gear on the **same tier and durability as improvised** (its value is the disguise, `concordance-introduction-concept.md` CI19–CI26), superseding Addendum 10's reading that Concordance gear sits higher. `[OPEN]` What sits above improvised (for example salvaged military gear such as the NBC Gas Mask). `[OPEN]` for Code (reuse first): does the existing NBC Gas Mask (`game/items.js`, Mask slot) become the improvised base respirator or a higher rung?

~~**Conflict `[OPEN]` (for Sam):**~~ *Original note, kept for history:* the city and Perimeter counters are Concordance gear''')

# ---------- Addendum 11: Concordance ----------
co = 'reference/concordance-introduction-concept.md'
edit(co, '| Field scanner | 0.5% (about 1 in 200 wins) | Trinket | Tool | Legendary | Concordance, information, scouting |\n',
 '''| Field scanner | 0.5% (about 1 in 200 wins) | Trinket | Tool | Legendary | Concordance, information, scouting |
| Gloves (disguise) | 6% `[PROPOSED]` | Gloves | Disguise gear | `[OPEN]` improvised tier (CI19) | Concordance, disguise |
| Boots (disguise) | 6% `[PROPOSED]` | Boots | Disguise gear | `[OPEN]` improvised tier (CI19) | Concordance, disguise |
| Hood | 5% `[PROPOSED]` | Helmet | Disguise gear | `[OPEN]` improvised tier (CI19) | Concordance, disguise |
| Legs piece | 5% `[PROPOSED]` | Legs | Disguise gear | `[OPEN]` improvised tier (CI19) | Concordance, disguise |
| Chest piece | 3% `[PROPOSED]` | Body Armor | Disguise gear | `[OPEN]` improvised tier (CI19) | Concordance, disguise; separate from the hazmat suit (CI25) |
''')
edit(co, 'All five carry the drop-source tag "Concordance survey team". The rarity names must match the tiers in code (W-3 check).\n',
 '''All five carry the drop-source tag "Concordance survey team". The rarity names must match the tiers in code (W-3 check).

**Oct 26 late evening additions (Sam, Addenda 11g, 11h):** the five disguise pieces above join the table `[DECIDED]`; their rates are `[PROPOSED]` starting values and the audit sets the final ones. They carry the same drop-source tag.
- **Conflict `[OPEN]` (for Sam):** the table header says "values kept as set" with **25% total** (also quoted in CI6). The added pieces raise the total to about **50%**. Addendum 11g leaves this to the audit; Sam to confirm the total is allowed to change.
- **Conflict `[OPEN]` (for Sam):** CI19 (Addendum 11) puts Concordance gear on the **improvised tier and durability**, but this table gives the original five rarities Uncommon to Legendary and calls the field scanner "the strongest of the five". Does CI19 cover all Concordance items (dart gun, field scanner, sample case) or only the wearable pieces (respirator, hazmat suit, disguise pieces)?

## 2b. Concordance disguise (Sam, Oct 26 late evening, Addenda 11–11i)

| # | Rule | Tag | Why |
|---|---|---|---|
| CI19 | **Concordance gear = improvised tier.** Concordance items keep their own names but sit on the **same tier and durability** as improvised gear (BIOME-01 base-tier counters). Their value is the disguise, not stats. Supersedes Addendum 10's reading that put Concordance gear above improvised. What sits above improvised is `[OPEN]` | `[DECIDED Oct 26, Sam]` | Disguise is the reason to wear them |
| CI20 | **Disguise:** wearing Concordance pieces lets the survivor enter a Concordance fort or POI undetected. Each piece lowers the chance of being discovered; no full-set requirement; with no pieces detection is certain; a full set leaves 5% (never fully safe). Reductions (data table): respirator (Mask) 25% · chest piece (Body Armor) 20% · hood (Helmet) 15% · legs piece (Legs) 15% · gloves 10% · boots 10% | Rule `[DECIDED Oct 26, Sam]`; values `[PROPOSED]` | Partial sets still help; never a guaranteed safe entry |
| CI21 | **Discovered in disguise:** Concordance standing drops and the survivor is **thrown out of the POI**. Standing loss −50 (the per-event cap, spec 4.2). Being thrown out never blocks a later retry | Rule `[DECIDED Oct 26, Sam]`; −50 `[PROPOSED]` | No dead ends |
| CI22 | **Thrown out to an adjacent Traversal square.** A passable, unlocked neighbour chosen deterministically from the seed `[PROPOSED]`. The move does **not** count against the daily movement cap (`trav-01-traversal-slice.md` TRAV-02e, like TRAV-02b) | `[DECIDED Oct 26, Sam]` (Addenda 11c, 11d) | A spent cap must never strand the survivor |
| CI23 | **Stripped of faction gear:** when discovered, the survivor loses every **equipped Concordance (faction) piece**, then is thrown out (CI22) with the standing loss (CI21). A **deliberate exception** to "equipped gear is never lost" (spec 13.8 Batch 3B note; 15.3), for this case only. Story items are never stripped; non-faction gear is kept | `[DECIDED Oct 26, Sam]` (Addendum 11e) | Sneaking into a faction base should cost something |
| CI24 | **Disguise piece sources:** hood, chest piece, legs piece, gloves and boots drop from Concordance survey teams via CI14 (§2a) | `[DECIDED Oct 26, Sam]`; rates `[PROPOSED]` (Addendum 11g) | Reuses the existing drop table |
| CI25 | **Chest piece and hazmat suit are separate items,** both Body Armor: the survivor wears one or the other, a deliberate trade-off between disguise and radiation protection | `[DECIDED Oct 26, Sam]` (Addendum 11h) | A real choice per trip |
| CI26 | **Actions inside, undetected:** (1) **Loot their stores**: better medical and tech supplies than elsewhere; (2) **Steal research**: notes that advance the Concordance story (the Sealed Crate thread, Fort brief 12.2); (3) **Listen in**: learn where survey teams will be (avoid or ambush them; ties to CI16). Each action makes a fresh detection roll at the disguise's current chance `[PROPOSED]`, so staying longer is riskier; discovery follows CI21–CI23. Player decisions made in person, with a timer and a default of leaving (rules §4.5) | Actions `[DECIDED Oct 26, Sam]`; per-action roll `[PROPOSED]` (Addendum 11i) | Attention goes to a moment that deserves it |

**Prisoner quest** `[PARKED]` (Addendum 11f): a harsher capture version is parked in `parked/prisoner-quest-concept.md`. CI21–CI23 are the light version.
''')
edit(co, '- `[OPEN]` Which Concordance gear item drops in CI6.\n',
 '''- `[OPEN]` Which Concordance gear item drops in CI6.
- `[OPEN]` CI14 total chance with the disguise pieces (25% → about 50%), and the final piece rates (audit).
- `[OPEN]` CI19 scope: all Concordance items, or only the wearable pieces? What sits above improvised?
- `[OPEN]` CI26 loot tables, research items, and how intel is shown; numbers to the audit.
- `[OPEN]` Does disguise work for other factions' forts later (same pattern)?
''')

# ---------- Addendum 11: Legs slot and the never-lost exception (spec) ----------
sp = 'reference/wandering-tab-spec.md'
edit(sp, 'The paperdoll slots are: **Melee, Helmet, Mask, Body Armor, Gloves, Boots, Pack, Trinket, Food, Throw.** `[DECIDED]`',
 'The paperdoll slots are: **Melee, Helmet, Mask, Body Armor, Gloves, Boots, Pack, Trinket, Food, Throw.** `[DECIDED]` *Updated:* Belt added (14.1); **Legs** added Oct 26 (Sam, Addendum 11). Current list in 14.1.')
edit(sp, 'The paperdoll becomes: Melee, Helmet, Mask, Body Armor, Gloves, Boots, Pack, **Belt**, Trinket, Food, Throw.',
 'The paperdoll becomes: Melee, Helmet, Mask, Body Armor, Gloves, Boots, Pack, **Belt**, Trinket, Food, Throw. **Updated Oct 26 `[DECIDED, Sam, Addendum 11]`:** a **Legs** armour slot is added: Melee, Helmet, Mask, Body Armor, Gloves, **Legs**, Boots, Pack, Belt, Trinket, Food, Throw. `[OPEN]` whether Legs items (for example cargo pants) grant pockets.')
edit(sp, 'Only three slots hold carriers, because the paperdoll has no legs or belt slot.',
 'Only three slots hold carriers~~, because the paperdoll has no legs or belt slot~~ (*superseded:* Belt added in 14.1; **Legs** added Oct 26, Addendum 11, pockets `[OPEN]`).')
edit(sp, '- Never lost: carried items, kits (partial charges kept), equipped gear (no extra wear), story items.\n',
 '- Never lost: carried items, kits (partial charges kept), equipped gear (no extra wear), story items.\n- **One exception `[DECIDED Oct 26, Sam, Addendum 11e]`:** a survivor discovered in disguise in a Concordance POI is stripped of every equipped Concordance (faction) piece (`concordance-introduction-concept.md` CI23). Story items and non-faction gear are kept. This is not a Forced Retreat.\n')
edit(sp, 'Equipped gear and story items are never lost this way.',
 'Equipped gear and story items are never lost this way. (The one equipped-gear exception, being discovered in disguise, is not a forced retreat: 13.8 Batch 3B note, CI23.)')

# ---------- Addendum 11c/11d: TRAV-02e ----------
tr = 'reference/trav-01-traversal-slice.md'
edit(tr, '| CL-assign | **Camp Leader assignment:**',
 '| TRAV-02e | **Thrown out of a Concordance POI** (discovered in disguise): the survivor is placed on an adjacent passable, unlocked square, chosen deterministically from the seed `[PROPOSED]`. This move **never counts** against the cap, like TRAV-02b (`concordance-introduction-concept.md` CI22) | `[DECIDED Oct 26, Sam]` (Addenda 11c, 11d) | No dead ends |\n| CL-assign | **Camp Leader assignment:**')

# ---------- Addendum 11f: parked pointer ----------
edit('reference/parked/faction-quests-and-poi-density.md',
 '**Status:** `[PARKED]` until POI Framework v1 is complete and the faction quest system is scheduled. Concept captured Oct 9; updated Oct 9 (the world expands).',
 '**Status:** `[PARKED]` until POI Framework v1 is complete and the faction quest system is scheduled. Concept captured Oct 9; updated Oct 9 (the world expands).\n**Related (Oct 26):** `prisoner-quest-concept.md`, a captivity quest that waits on this brief.')

# ---------- Index ----------
ix = 'reference/00-document-index.md'
edit(ix, '| `pf15-save-continue-slice.md` | PF15 fix: Continue keeps live progress, 60 s autosave, regression test; draft batch | Decided Oct 26; draft batch, not issued (CLOCK-01 still active) |',
 '| `pf15-save-continue-slice.md` | PF15 fix: Continue keeps live progress, 60 s autosave, regression test; draft batch | Decided Oct 26; **next batch**, ahead of CLOCK-01\'s remaining manual checks (Addendum 10); not yet copied to `CURRENT_BATCH.md` |')
edit(ix, '| `concordance-introduction-concept.md` | Concordance introduction after the Sealed Crate: stolen crate, three exits, Heinous and Criminal versions, Diplomat tiers, standing changes, guaranteed backup route (CI1–CI13) |',
 '| `concordance-introduction-concept.md` | Concordance introduction after the Sealed Crate: stolen crate, three exits, Heinous and Criminal versions, Diplomat tiers, standing changes, guaranteed backup route (CI1–CI13); gear and survey teams (CI14–CI18); disguise, discovery and actions inside (CI19–CI26) |')
edit(ix, '| `faction-quests-and-poi-density.md` | Faction quests, travel altercations, per-grid POI density | POI Framework v1 and a faction quest system |\n',
 '| `faction-quests-and-poi-density.md` | Faction quests, travel altercations, per-grid POI density | POI Framework v1 and a faction quest system |\n| `prisoner-quest-concept.md` | `[PARKED]` (Sam, Oct 26, Addendum 11f): captured in disguise → held prisoner, stripped, belongings stowed, possibly forced labour; always a way out and a way to recover belongings | Faction quests exist (`faction-quests-and-poi-density.md`). New Oct 27 |\n')
edit(ix, '| Date | Decision | Recorded in |\n|---|---|---|\n| Oct 27 |',
 '| Date | Decision | Recorded in |\n|---|---|---|\n| Oct 26 (late, applied Oct 27) | Addenda 10–11i (Sam): PF15 is the next batch, ahead of CLOCK-01\'s manual checks; improvised base-tier hazard counters for everyone (closes the counter gap); Debriefed Perimeter row decided; Concordance gear = improvised tier (supersedes Addendum 10\'s ladder reading); **Legs** paperdoll slot; Concordance disguise (per-piece detection, full set 5%); discovered → −50 standing, stripped of faction pieces (exception to never-lost), thrown to an adjacent square exempt from TRAV-02; disguise pieces drop from survey teams; chest piece separate from hazmat suit; three actions inside; prisoner quest parked. Conflicts flagged: CI14 total 25% → ~50%; CI19 vs CI14 rarities | `pf15-save-continue-slice.md`; `biome-01-chunks-slice.md`; `concordance-introduction-concept.md` §2a, §2b; `wandering-tab-spec.md` 13.8, 14.1, 14.2, 15.3; `trav-01-traversal-slice.md` TRAV-02e; `parked/prisoner-quest-concept.md`; `parked/faction-quests-and-poi-density.md` |\n| Oct 27 |')

print('\n'.join(log))
