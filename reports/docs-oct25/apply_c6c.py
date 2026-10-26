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
 ("| Same size as the e-bike's quiet bonus (ROUTE-01 R3a, −25%), so the bike offsets it |",
  "| Same size as the e-bike's quiet bonus (ROUTE-01 R3a, −25%), so the bike offsets it |\n| C6c | **One night window game-wide:** night is 22:00–06:00 game time everywhere (header label, `ZI.TIME_STAT_MODS.night`, circuits). Dusk is 19:00–22:00 and 06:00–08:00 | One window everywhere; night ends at Make camp's 06:00 wake |"),
 ("**Conflict `[CODE]` (found Oct 25):** the header screen (`screens-v2.jsx` line 41) treats night as 21:00–05:00 (dusk 18:00–21:00 and 05:00–07:00), and `ZI.TIME_STAT_MODS.night` applies stealth +10% and combat −10% in that window. C6a uses 22:00–06:00. One night window should hold everywhere; Sam to decide which.",
  "**Conflict resolved by C6c `[DECIDED Oct 25]`:** the header screen (`screens-v2.jsx` lines 41–42) treated night as 21:00–05:00 (dusk 18:00–21:00 and 05:00–07:00), with `ZI.TIME_STAT_MODS.night` (stealth +10%, combat −10%) in that window. The code moves to C6c in the clock work; until Code applies it, the code still uses the old window."),
])
edit('reference/00-document-index.md',[
 ("Decisions **C1–C9, C6a, C6b `[DECIDED Oct 25]`** (duration display, repeat, one-loop Shop toggle, safe ending, stop rules, night and its window and risk,",
  "Decisions **C1–C9, C6a–C6c `[DECIDED Oct 25]`** (duration display, repeat, one-loop Shop toggle, safe ending, stop rules, night and its window and risk, one game-wide night window,"),
 ("| Date | Decision | Recorded in |\n|---|---|---|\n",
  "| Date | Decision | Recorded in |\n|---|---|---|\n| Oct 25 | C6c night window (Sam): night is 22:00–06:00 game time game-wide; dusk 19:00–22:00 and 06:00–08:00. Resolves the code conflict (code had night 21:00–05:00); code change queued for the clock work | `reference/circuit-expedition-concepts.md`; `DESIGN_HANDOFF.md` |\n"),
])
edit('DESIGN_HANDOFF.md',[
 ("haul total with Claim All.\n",
  "haul total with Claim All.\n- `[DECIDED Oct 25]` **C6c one night window:** night is 22:00–06:00 game time game-wide; dusk 19:00–22:00 and 06:00–08:00. Why: one window everywhere; night ends at Make camp's 06:00 wake.\n"),
 ("- **Night window conflict:** code treats night as 21:00–05:00 (`screens-v2.jsx` line 41; `ZI.TIME_STAT_MODS.night` stealth +10%, combat −10%); C6a uses 22:00–06:00. Pick one window for both.\n",
  "**Code (new, Oct 25):**\n- **C6c code change, not yet applied:** `screens-v2.jsx` lines 41–42: `isNight = gameHour >= 22 || gameHour < 6`; `isDusk = (gameHour >= 19 && gameHour < 22) || (gameHour >= 6 && gameHour < 8)`. `ZI.TIME_STAT_MODS.night` follows. To be folded into the clock work; CLOCK-01 is locked, so Sam confirms whether it joins CLOCK-01 or a follow-up batch.\n\n**Sam (cont.):**\n"),
])
r='reports/docs-oct25/DOCS_OCT25_REPORT.md'
s=io.open(r,encoding='utf-8').read()
s+="\n## C6c follow-up (Sam, Oct 25)\nApplied by `apply_c6c.py`: C6c row (night 22:00–06:00 game-wide; dusk 19:00–22:00 and 06:00–08:00, both decided); conflict note marked resolved; index entry and log row; handoff §1 adds C6c, §3 carries the code change as a pending Code item. No game code changed: CLOCK-01 is a locked batch, so the `screens-v2.jsx` edit waits for Sam to place it. Only `screens-v2.jsx` lines 41–42 define the night and dusk hours. Pre-change copies: `pre-change/*-before-c6c.md`.\n"
io.open(r,'w',encoding='utf-8',newline='').write(s); print("ok report")
