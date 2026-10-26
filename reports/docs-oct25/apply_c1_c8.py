import io,sys
def edit(path, pairs):
    s=io.open(path,encoding='utf-8').read()
    for old,new in pairs:
        n=s.count(old)
        if n!=1: sys.exit(f"FAIL {path}: {n} matches for {old[:60]!r}")
        s=s.replace(old,new)
    io.open(path,'w',encoding='utf-8',newline='').write(s)
    print("ok",path)

C='reference/circuit-expedition-concepts.md'
decisions='''## Decisions [DECIDED Oct 25]

Sam, Oct 25 (voice session with the Creative Director). These eight rules are decided. Everything else in this note stays `[PROPOSED]` or `[OPEN]`, and the note is still not a build input; a Solo circuit slice will carry these into a batch.

| # | Rule | Why |
|---|---|---|
| C1 | **Duration display.** Circuit time shows in real time as the main figure, with the game-time equivalent in small text underneath | Players plan in their own time; the small figure ties the loop to the world calendar |
| C2 | **Repeat.** Circuits repeat by default | Idlers reward set-and-leave play |
| C3 | **One loop only.** A toggle to run a circuit once, unlocked in the Shop for in-game currency | Convenience, not relief from designed friction (lead brief 5.1) |
| C4 | **Safe ending.** When a circuit must stop, the survivor finishes the loop and stops at the start cell. In an emergency (for example very low HP), they retreat straight home | Never strand the survivor mid-route |
| C5 | **First-version stop rules:** low HP, high stress, full pack. Weather and threat wait for BIOME-01 | The game already tracks these three; fewer rules are easier to read and test |
| C6 | **Night.** The survivor rests through the night by default. A free toggle keeps them travelling at night at higher risk | A hard "stop at nightfall" rule would end nearly every loop (one game day = 24 real minutes); the toggle trades speed for risk |
| C7 | **Rule conflicts.** HP first, then stress, then pack | A predictable safety order earns trust |
| C8 | **Return report** shows loops completed, stops visited, the rule that ended the run, and hauls to claim | Only the outcomes that matter |

**Still `[OPEN]` under these rules:** the return report's detailed contents (stop display, haul list, log depth); night rest length and the night risk value; the "one loop only" price.

## Clock and prototype context [CODE]'''
edit(C,[
 ("## Clock and prototype context [CODE]", decisions),
 ("1. What should a player see as a circuit's duration: real travel time, game time, or both?",
  "1. ~~What should a player see as a circuit's duration: real travel time, game time, or both?~~ **Answered by C1 `[DECIDED Oct 25]`.**"),
 ("4. Is a circuit a single trip, a repeat-until-stopped routine, or either? How does a repeat end safely?",
  "4. ~~Is a circuit a single trip, a repeat-until-stopped routine, or either? How does a repeat end safely?~~ **Answered by C2–C4 `[DECIDED Oct 25]`.**"),
])
s=io.open(C,encoding='utf-8').read()
import re
for q,ans in (("9.","C5 and C7 (rule set and priority); defaults beyond these stay [OPEN]"),("11.","C5 and C6 (HP, stress, pack; night by rest default; weather and threat after BIOME-01)")):
    lines=s.split('\n'); hit=[i for i,l in enumerate(lines) if l.startswith(q+' ')]
    if len(hit)!=1: sys.exit("FAIL q"+q)
    i=hit[0]; body=lines[i][len(q)+1:]
    lines[i]=f"{q} ~~{body}~~ **Answered by {ans} `[DECIDED Oct 25]`.**"
    s='\n'.join(lines)
io.open(C,'w',encoding='utf-8',newline='').write(s); print("ok questions")

edit('reference/route-01-route-builder-concept.md',[("## 3. Open\n","## 3. Open\n\n- **Circuit decisions C1–C8 `[DECIDED Oct 25]`** live in `circuit-expedition-concepts.md` (Decisions): real-time duration with game time in small text, repeat by default, Shop \"one loop only\" toggle, safe ending at the start cell, first stop rules (HP, stress, pack), rest through the night by default, rule priority, return report. R1's \"loops it while idle\" now follows C2–C4.\n")])

edit('reference/parked/retreat-rules-shop.md',[("before selling changes to them.","before selling changes to them.\n\n**Also in the Shop `[DECIDED Oct 25]`:** the circuit \"one loop only\" toggle (C3 in `reference/circuit-expedition-concepts.md`), bought with in-game currency. Price `[OPEN]`.")])

edit('reference/biome-01-chunks-slice.md',[("Acts as the tutorial hazard.","Acts as the tutorial hazard. (Circuits rest through the night by default, C6 `[DECIDED Oct 25]` in `circuit-expedition-concepts.md`; Cold Exposure is a candidate cost for the night-travel toggle.)")])

I='reference/00-document-index.md'
edit(I,[
 ("| Planning only; all additions `[PROPOSED]`, unresolved choices `[OPEN]`; not a build input |",
  "| Planning only. Decisions **C1–C8 `[DECIDED Oct 25]`** (duration display, repeat, one-loop Shop toggle, safe ending, stop rules, night, rule priority, return report); other additions `[PROPOSED]`, unresolved choices `[OPEN]`; still not a build input |"),
 ("| Date | Decision | Recorded in |\n|---|---|---|\n",
  "| Date | Decision | Recorded in |\n|---|---|---|\n| Oct 25 | Circuit decisions C1–C8 (Sam): real-time duration with game time in small text; repeat by default; \"one loop only\" toggle as a Shop unlock for in-game currency; a stopping circuit finishes at its start cell, emergencies retreat straight home; first stop rules low HP, high stress, full pack; rest through the night by default with a free night-travel toggle; priority HP → stress → pack; return report covers loops, stops, ending rule and hauls | `reference/circuit-expedition-concepts.md`; `route-01-route-builder-concept.md` §3; `parked/retreat-rules-shop.md`; `DESIGN_HANDOFF.md` |\n"),
 ("| `reports/docs-oct24/` | Oct 24 docs session: pre-change copies |",
  "| `reports/docs-oct25/` | Oct 25 circuit decisions C1–C8: pre-change copies, apply script, report |\n| `reports/docs-oct24/` | Oct 24 docs session: pre-change copies |"),
 ("# Zed Idler — Document Index (updated Oct 24)","# Zed Idler — Document Index (updated Oct 25)"),
])
