import io,sys
def edit(path, pairs):
    s=io.open(path,encoding='utf-8').read()
    for old,new in pairs:
        n=s.count(old)
        if n!=1: sys.exit(f"FAIL {path}: {n} matches for {old[:60]!r}")
        s=s.replace(old,new)
    io.open(path,'w',encoding='utf-8',newline='').write(s); print("ok",path)
NOTE="**Superseded in part `[DECIDED Oct 25]`, C9:** once circuits take over Idle run, repeating is free (C2) and \"one loop only\" is the Shop unlock (C3); until then, predefined Routes keep Auto-Repeat as a Shop unlock. Active/Idle is unchanged. See `circuit-expedition-concepts.md`."
edit('reference/tutorial-first-session-spec.md',[
 ("| Active/Idle, Auto-Repeat | Introduced on Shop unlock `[DECIDED]` | One short step when unlocked in the Shop. Written in the Shop batch (parked); not mentioned in the Routes tutorial |",
  "| Active/Idle, Auto-Repeat | Introduced on Shop unlock `[DECIDED]` | One short step when unlocked in the Shop. Written in the Shop batch (parked); not mentioned in the Routes tutorial. "+NOTE+" |"),
 ("Active/Idle run modes and Auto-Repeat are Shop unlocks `[DECIDED]`; the Routes tutorial does not mention them (see 6.1).",
  "Active/Idle run modes and Auto-Repeat are Shop unlocks `[DECIDED]`; the Routes tutorial does not mention them (see 6.1). "+NOTE),
 ("they are Shop unlocks, taught by a short step on unlock, written in the Shop batch (6.1).",
  "they are Shop unlocks, taught by a short step on unlock, written in the Shop batch (6.1). "+NOTE),
])
edit('reference/circuit-expedition-concepts.md',[
 ("Sam, Oct 25 (voice session with the Creative Director). These eight rules","Sam, Oct 25 (voice session with the Creative Director). These nine rules"),
 ("| Only the outcomes that matter |\n",
  "| Only the outcomes that matter |\n| C9 | **One repeat rule everywhere.** Once circuits take over Idle run, C2/C3 supersede the tutorial spec's \"Auto-Repeat is a Shop unlock\" (6.1). Until then, predefined Routes keep Auto-Repeat as a Shop unlock | One rule for near-identical features (rules §4.3); easier to teach |\n"),
])
edit('reference/00-document-index.md',[
 ("Decisions **C1–C8 `[DECIDED Oct 25]`** (duration display, repeat, one-loop Shop toggle, safe ending, stop rules, night, rule priority, return report)",
  "Decisions **C1–C9 `[DECIDED Oct 25]`** (duration display, repeat, one-loop Shop toggle, safe ending, stop rules, night, rule priority, return report, one repeat rule)"),
 ("| Date | Decision | Recorded in |\n|---|---|---|\n",
  "| Date | Decision | Recorded in |\n|---|---|---|\n| Oct 25 | C9 one repeat rule (Sam): once circuits take over Idle run, repeating is free and \"one loop only\" is the Shop unlock, superseding the tutorial spec's Auto-Repeat Shop unlock; until then predefined Routes keep Auto-Repeat as a Shop unlock | `reference/circuit-expedition-concepts.md`; `tutorial-first-session-spec.md` 6.1; `DESIGN_HANDOFF.md` |\n"),
])
h=io.open('DESIGN_HANDOFF.md',encoding='utf-8').read()
a=h.index("- **Conflict to resolve:**"); b=h.index("- Circuit return report detailed contents")
h=h[:a]+h[b:]
io.open('DESIGN_HANDOFF.md','w',encoding='utf-8',newline='').write(h)
edit('DESIGN_HANDOFF.md',[
 ("C8 return report: loops completed, stops visited, ending rule, hauls to claim. Still not a build input.",
  "C8 return report: loops completed, stops visited, ending rule, hauls to claim. Still not a build input.\n- `[DECIDED Oct 25]` **C9 one repeat rule:** once circuits take over Idle run, C2/C3 supersede the tutorial spec's \"Auto-Repeat is a Shop unlock\" (6.1); until then predefined Routes keep it. Resolves the Auto-Repeat conflict."),
 ("- `reference/00-document-index.md` (circuit entry, decisions log, reports row, date).",
  "- `reference/00-document-index.md` (circuit entry, decisions log, reports row, date).\n- `reference/tutorial-first-session-spec.md` (6.1 lines 182, 268, 362: C9 supersession note)."),
 ("Sam settles the Auto-Repeat conflict before that slice.\n",""),
])
r='reports/docs-oct25/DOCS_OCT25_REPORT.md'
s=io.open(r,encoding='utf-8').read()
s=s.replace("| **Conflict, not changed.** Raised to Sam in `DESIGN_HANDOFF.md` §3 |","| Conflict raised, then resolved by C9 (see below) |")
s+="\n## C9 follow-up (Sam, Oct 25)\nApplied by `apply_c9.py`. Supersession note added at `tutorial-first-session-spec.md` lines 182, 268, 362 (Auto-Repeat only; Active/Idle unchanged); C9 row in the circuit Decisions table; index entry and log row; handoff §1 gains C9 and the conflict is removed from §3. No other Auto-Repeat references in `reference/` or `reference/parked/`. Pre-change copies: `pre-change/tutorial-first-session-spec.md` and `*-before-c9.md`.\n"
io.open(r,'w',encoding='utf-8',newline='').write(s); print("ok report")
