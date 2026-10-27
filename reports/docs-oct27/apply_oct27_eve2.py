import os, shutil, sys
ROOT=os.getcwd(); PRE=os.path.join(ROOT,'reports/docs-oct27/pre-change-eve2'); os.makedirs(PRE,exist_ok=True); log=[]
def edit(path,old,new):
    p=os.path.join(ROOT,path); s=open(p,encoding='utf-8').read(); n=s.count(old)
    if n!=1: sys.exit(f'FAIL {path}: {n} matches: {old[:70]!r}')
    d=os.path.join(PRE,path.replace('/','__'))
    if not os.path.exists(d): shutil.copy2(p,d)
    open(p,'w',encoding='utf-8',newline='').write(s.replace(old,new)); log.append(path)
F1='reference/parked/fish-01-fishing-concept.md'
edit(F1,'the loss **shrinks as Foraging rises** (`[DECIDED Oct 27 PM, Sam]`; replaces "cooking skill")',
 'the loss **shrinks as the Cooking skill rises** (`[DECIDED Oct 27 PM, Sam]`; a brief Foraging reading the same afternoon is superseded)')
edit(F1,'**Decided Oct 27 PM (Sam):** FP3 uses **Foraging**. Cooking is added as its own skill for the stations (spec skills line), separate from Foraging.',
 '**Decided Oct 27 PM (Sam):** FP3 uses the new **Cooking** skill (spec skills line), separate from Foraging. Foraging still governs catching (POI brief).')
SP='reference/wandering-tab-spec.md'
edit(SP,'It belongs to cooking at the base stations (FOOD-02).',
 'It belongs to cooking at the base stations (FOOD-02) and controls fish preparation (FISH-01 FP3).')
TU='reference/tutorial-first-session-spec.md'
edit(TU,'`[OPEN]` what happens to the Auction view (player-to-player listings): remove, or park for later; and the Schedule task "Marketplace Trade".',
 '**The Auction view is removed** `[DECIDED Oct 27 PM, Sam]` (player-to-player listings, `ZI.MARKET_ITEMS` sample data). `[OPEN]` the Schedule task "Marketplace Trade".')
IX='reference/00-document-index.md'
edit(IX,'fish prep loss (FP3) scales with **Foraging**;','fish prep loss (FP3) scales with **Cooking** (Foraging reading superseded the same afternoon);')
edit(IX,'**the Shop replaces the Market tab**.','**the Shop replaces the Market tab** and the **Auction view is removed**.')
H='DESIGN_HANDOFF.md'
edit(H,'- **Fish prep:** the no-knife loss shrinks as **Foraging** rises (FISH-01 FP3).','- **Fish prep:** the no-knife loss shrinks as **Cooking** rises (FISH-01 FP3).')
edit(H,'- **The Shop replaces the Market tab.**','- **The Shop replaces the Market tab; the Auction view is removed.**')
edit(H,'- **Shop:** what happens to the Auction view and the "Marketplace Trade" schedule task;','- **Shop:** the "Marketplace Trade" schedule task;')
R='reports/docs-oct27/DOCS_OCT27_EVE_REPORT.md'
edit(R,'- Sam answered "Foraging" for the fish-prep skill and, separately, asked for a Cooking skill. Recorded as: FP3 uses Foraging; Cooking is a new skill for the stations. Confirm if Cooking should drive fish prep instead.',
 '- Follow-up 14:08 (Sam, `apply_oct27_eve2.py`, copies in `pre-change-eve2/`): **Cooking controls fish prep** (FP3), replacing the Foraging reading; **the Auction view is removed**.')
print('\n'.join(log))
