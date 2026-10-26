import io,sys
def edit(path, pairs):
    s=io.open(path,encoding='utf-8').read()
    for old,new in pairs:
        n=s.count(old)
        if n!=1: sys.exit(f"FAIL {path}: {n} matches for {old[:60]!r}")
        s=s.replace(old,new)
    io.open(path,'w',encoding='utf-8',newline='').write(s); print("ok",path)
C='reference/circuit-expedition-concepts.md'
s=io.open(C,encoding='utf-8').read()
lines=s.split('\n')
c9=[i for i,l in enumerate(lines) if l.startswith('| C9 |')][0]
rows=[
("C10","**Timers (Q2).** Movement and stop timers run on real time; the game clock only sets conditions. A stop crossing 22:00 follows C6","Fits C1's real-time display; one clock for durations, the other for the world"),
("C11","**Quick circuit (Q3)** = 2–3 cells, about 5 real minutes per loop, at normal animation and simulation speed","Fits foot and bike range; no special speed keeps watched and offline results equal"),
("C12","**Long absence (Q5).** Beyond 24 real hours, settle 24 h and discard the rest; supplies drain only within it; the report says \"progress capped at 24 hours\"","Reuses FX2 and CLOCK-01 CL6"),
("C13","**While away (Q6)** = settled on the next load with seeded rolls; no server in the first version","Same settle-on-read pattern as crafting and route runs"),
("C14","**Parity (Q7).** One shared step function (H1); the screen only animates results; a per-stop done flag prevents duplicate rewards and lets an interrupted circuit resume","Watched and offline must match; the recap must never reroll or pay twice"),
("C15","**Valid cells and stops (Q8).** Unlocked cells only; stops are scavenge and rest. A blocked stop is skipped and reported; a blocked way home means walking back the way they came","Small, testable first version; never stranded"),
("C16","**Fishing is not a circuit stop (Q8);** it is started in person","Keeps the POI framework rule (`poi-framework-v1-brief.md`: fishing must be started in person at the water cell)"),
("C17","**Missing information (Q9).** Treat unknown as dangerous, apply the standing policy, and skip a stop when in doubt","The safest default earns trust while unattended"),
("C18","**No pause (Q10).** Discovery prompts use their normal timer and policy default; while away, the policy decides at once. Forts are never rolled on circuits","Nothing waits on the player (rules §4.5). Narrows spec 2.5, which rolls later Forts only on Traversal squares while the player is present"),
("C19","**ETA (Q12)** = one real-time estimate per loop: travel + stops + 25% buffer for unfamiliar cells, with the line \"estimate; encounters vary\"","Honest about uncertainty without false precision"),
("C20","**Map while running (Q13):** route line, survivor marker, next stop, loop counter. Kills, loot and events wait for the return report","A calm map; matches C8"),
("C21","**Supplies (Q14).** First version: foot and bike only, so nothing runs out mid-loop; food via Food-slot auto-eat; fuel, batteries and cargo wait for the vehicle slice","Keeps the first slice small. `[CODE]` auto-eat is not built yet; it comes from FOOD-01 (P6), so the circuit slice depends on FOOD-01 or ships without food use"),
]
new=[f"| {a} | {b} | {c} |" for a,b,c in rows]
lines[c9+1:c9+1]=new
s='\n'.join(lines)
s=s.replace("Sam, Oct 25 (voice session with the Creative Director). These nine rules are decided.",
 "Sam, Oct 25 (voice session with the Creative Director); C10–C21 Sam, Oct 26. These rules are decided.")
qa={"2.":"C10","3.":"C11","5.":"C12","6.":"C13","7.":"C14","8.":"C15–C16","10.":"C18","12.":"C19","13.":"C20","14.":"C21"}
lines=s.split('\n')
lo=[i for i,l in enumerate(lines) if l.startswith('## Open questions')][0]
hi=[i for i,l in enumerate(lines) if l.startswith('## Design risks')][0]
for q,c in qa.items():
    hit=[i for i in range(lo,hi) if lines[i].startswith(q+' ')]
    if len(hit)!=1: sys.exit("FAIL "+q)
    i=hit[0]; lines[i]=f"{q} ~~{lines[i][len(q)+1:]}~~ **Answered by {c} `[DECIDED Oct 26]`.**"
i=[i for i in range(lo,hi) if lines[i].startswith('9. ')][0]
lines[i]=lines[i].replace("defaults beyond these stay [OPEN] `[DECIDED Oct 25]`.**","missing-information defaults by C17 `[DECIDED Oct 26]`.**")
s='\n'.join(lines)
s=s.replace("## Open questions [OPEN]\n","## Open questions [OPEN]\n\nQuestions 1–14 are answered (C1–C21, Oct 25–26). Questions 15–24 stay `[OPEN]` for later slices.\n",1)
io.open(C,'w',encoding='utf-8',newline='').write(s); print("ok circuit")
edit('reference/route-01-route-builder-concept.md',[("R1's \"loops it while idle\" now follows C2–C4.",
 "R1's \"loops it while idle\" now follows C2–C4. **C10–C21 `[DECIDED Oct 26]`:** the first circuit version is foot and bike only, with no fuel, battery or cargo use (C21); scavenge and rest stops only (C15–C16). Whether a bike ever uses fuel stays open below.")])
edit('reference/00-document-index.md',[
 ("Decisions **C1–C9, C6a–C6c `[DECIDED Oct 25]`**","Decisions **C1–C9, C6a–C6c `[DECIDED Oct 25]` and C10–C21 `[DECIDED Oct 26]`**"),
 ("| Date | Decision | Recorded in |\n|---|---|---|\n",
  "| Date | Decision | Recorded in |\n|---|---|---|\n| Oct 26 | Circuit questions 2–14 answered, C10–C21 (Sam): real-time timers; quick circuit 2–3 cells ≈ 5 real min; 24 h cap reused; settle on next load; one shared step function with per-stop done flags; unlocked cells, scavenge and rest stops only; fishing stays in person; unknown treated as dangerous; no pause for discoveries, no Fort rolls on circuits; ETA with 25% buffer; calm map; foot and bike only, food via auto-eat (FOOD-01). Questions 15–24 stay open | `reference/circuit-expedition-concepts.md`; `route-01-route-builder-concept.md` §3; `DESIGN_HANDOFF.md` |\n"),
 ("# Zed Idler — Document Index (updated Oct 25)","# Zed Idler — Document Index (updated Oct 26)"),
])
edit('DESIGN_HANDOFF.md',[
 ("# Design handoff — Oct 25","# Design handoff — Oct 25–26"),
 ("## 2. Files changed","- `[DECIDED Oct 26]` **Circuit questions 2–14, C10–C21:** C10 real-time timers, game clock sets conditions · C11 quick circuit 2–3 cells, ≈ 5 real min per loop · C12 24 h cap (FX2) · C13 settle on next load, no server · C14 one shared step function, per-stop done flags · C15 unlocked cells, scavenge and rest stops; blocked stop skipped, blocked way home walks back · C16 fishing not a circuit stop · C17 unknown = dangerous, skip when in doubt · C18 no pause; policy decides; no Fort rolls on circuits · C19 ETA travel + stops + 25% buffer · C20 map shows route, marker, next stop, loop counter · C21 foot and bike only; food via auto-eat; fuel, batteries, cargo wait for the vehicle slice.\n\n## 2. Files changed"),
 ("- Remaining circuit open questions (2, 3, 5–8, 10, 12–24).",
  "- Remaining circuit open questions 15–24 (later slices).\n- **C21 dependency:** auto-eat is not built (`[CODE]`); it comes from FOOD-01 P6. The circuit slice either waits for FOOD-01 or ships without food use."),
 ("draft a small Solo circuit slice built on C1–C8.","draft a small Solo circuit slice built on C1–C21."),
])
r='reports/docs-oct25/DOCS_OCT25_REPORT.md'
s=io.open(r,encoding='utf-8').read()
s+="\n## C10–C21 follow-up (Sam, Oct 26)\nApplied by `apply_c10_c21.py`. The instruction header said C10–C20 but listed C10–C21; all twelve rows were added after C9. Questions 2, 3, 5–8, 10, 12–14 struck through and mapped; question 9 completed by C17; note added that 15–24 stay open. ROUTE-01 §3 pointer extended. Index log row and header date; handoff §1, §3, §4. Checks: C16 matches `poi-framework-v1-brief.md` line 390; C18 narrows spec 2.5 (later Forts rolled only while present), noted in its row; C21 auto-eat is not in the code (only FOOD-01 P6), recorded as a dependency. Pre-change copies: `pre-change/*-before-c10.md`.\n"
io.open(r,'w',encoding='utf-8',newline='').write(s); print("ok report")
