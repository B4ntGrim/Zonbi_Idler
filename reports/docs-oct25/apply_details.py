import io,sys
def edit(path, pairs):
    s=io.open(path,encoding='utf-8').read()
    for old,new in pairs:
        n=s.count(old)
        if n!=1: sys.exit(f"FAIL {path}: {n} matches for {old[:60]!r}")
        s=s.replace(old,new)
    io.open(path,'w',encoding='utf-8',newline='').write(s); print("ok",path)
C='reference/circuit-expedition-concepts.md'
edit(C,[
 ("| A hard \"stop at nightfall\" rule would end nearly every loop (one game day = 24 real minutes); the toggle trades speed for risk |",
  "| A hard \"stop at nightfall\" rule would end nearly every loop (one game day = 24 real minutes); the toggle trades speed for risk |\n| C6a | **Night rest window:** 22:00–06:00 game time (8 game hours, about 8 real minutes), starting value | Matches Make camp's 06:00 wake |\n| C6b | **Night travel risk:** travelling at night (toggle on) adds +25% encounters, starting value | Same size as the e-bike's quiet bonus (ROUTE-01 R3a, −25%), so the bike offsets it |"),
 ("| C8 | **Return report** shows loops completed, stops visited, the rule that ended the run, and hauls to claim | Only the outcomes that matter |",
  "| C8 | **Return report** shows loops completed, stops visited, the rule that ended the run, and hauls to claim. **Order:** (1) headline: loops completed and the ending rule; (2) one line per stop: cell, kills, loot, repeat visits grouped; (3) notable events only: Downing, discovery, forced retreat; (4) haul total with Claim All | Only the outcomes that matter |"),
 ("**Still `[OPEN]` under these rules:** the return report's detailed contents (stop display, haul list, log depth); night rest length and the night risk value; the \"one loop only\" price.",
  "**Still `[OPEN]` under these rules:** the \"one loop only\" price (C3), until the Shop currency is decided. Night rest window, night risk and report order were decided Oct 25 (C6a, C6b, C8).\n\n**Conflict `[CODE]` (found Oct 25):** the header screen (`screens-v2.jsx` line 41) treats night as 21:00–05:00 (dusk 18:00–21:00 and 05:00–07:00), and `ZI.TIME_STAT_MODS.night` applies stealth +10% and combat −10% in that window. C6a uses 22:00–06:00. One night window should hold everywhere; Sam to decide which."),
])
I='reference/00-document-index.md'
edit(I,[
 ("Decisions **C1–C9 `[DECIDED Oct 25]`** (duration display, repeat, one-loop Shop toggle, safe ending, stop rules, night, rule priority, return report, one repeat rule)",
  "Decisions **C1–C9, C6a, C6b `[DECIDED Oct 25]`** (duration display, repeat, one-loop Shop toggle, safe ending, stop rules, night and its window and risk, rule priority, return report and its order, one repeat rule)"),
 ("| Date | Decision | Recorded in |\n|---|---|---|\n",
  "| Date | Decision | Recorded in |\n|---|---|---|\n| Oct 25 | Circuit details (Sam): C6a night rest 22:00–06:00 game time (starting value); C6b night travel +25% encounters (starting value); C8 report order headline → stops → notable events → haul total with Claim All; C3 price stays open until the Shop currency is decided. Conflict found: code's night window is 21:00–05:00 | `reference/circuit-expedition-concepts.md`; `DESIGN_HANDOFF.md` |\n"),
])
edit('DESIGN_HANDOFF.md',[
 ("Resolves the Auto-Repeat conflict.",
  "Resolves the Auto-Repeat conflict.\n- `[DECIDED Oct 25]` **Circuit details:** C6a night rest 22:00–06:00 game time (8 game hours, starting value; matches Make camp's 06:00 wake) · C6b night travel +25% encounters (starting value; the e-bike's −25% offsets it) · C8 report order: headline (loops, ending rule) → one line per stop (cell, kills, loot, repeats grouped) → notable events only (Downing, discovery, forced retreat) → haul total with Claim All."),
 ("- Circuit return report detailed contents (stop display, haul list, log depth).\n- Night rest length and the night-travel risk value (C6).\n- \"One loop only\" price (C3).",
  "- **Night window conflict:** code treats night as 21:00–05:00 (`screens-v2.jsx` line 41; `ZI.TIME_STAT_MODS.night` stealth +10%, combat −10%); C6a uses 22:00–06:00. Pick one window for both.\n- \"One loop only\" price (C3): waits on the Shop currency (RMAT as main currency, carried below)."),
])
r='reports/docs-oct25/DOCS_OCT25_REPORT.md'
s=io.open(r,encoding='utf-8').read()
s+="\n## Circuit details follow-up (Sam, Oct 25)\nApplied by `apply_details.py`: C6a and C6b rows added after C6; C8 gains the report order; the open line now lists only the C3 price; index entry and log row; handoff §1 and §3 updated. Search for an existing night definition found `screens-v2.jsx` line 41 (night 21:00–05:00, dusk 18–21 and 05–07) and `ZI.TIME_STAT_MODS` in `game/survival-data.js`; recorded as a conflict, code not changed. Pre-change copies: `pre-change/*-before-details.md`.\n"
io.open(r,'w',encoding='utf-8',newline='').write(s); print("ok report")
