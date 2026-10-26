import io,sys
def edit(path, pairs):
    s=io.open(path,encoding='utf-8').read()
    for old,new in pairs:
        n=s.count(old)
        if n!=1: sys.exit(f"FAIL {path}: {n} matches for {old[:60]!r}")
        s=s.replace(old,new)
    io.open(path,'w',encoding='utf-8',newline='').write(s); print("ok",path)
edit('reference/circuit-expedition-concepts.md',[
 ("| C3 | **One loop only.** A toggle to run a circuit once, unlocked in the Shop for in-game currency | Convenience, not relief from designed friction (lead brief 5.1) |",
  "| C3 | **One loop only.** A toggle to run a circuit once, unlocked in the Shop for in-game currency. The Shop currency is **RMAT**; price **10 Tier 2 RMAT** (Refined, `ZI.RMAT_TIERS` tier 2), starting value for the economy check to tune | Convenience, not relief from designed friction (lead brief 5.1), so modest; Tier 2 means the player has run a few circuits first |"),
 ("**Still `[OPEN]` under these rules:** the \"one loop only\" price (C3), until the Shop currency is decided. Night rest window, night risk and report order were decided Oct 25 (C6a, C6b, C8).",
  "**Still `[OPEN]` under these rules:** nothing. Night rest window, night risk, report order (C6a, C6b, C8) and the C3 currency and price were decided Oct 25. The C6c code change goes in a small follow-up batch after CLOCK-01 closes."),
 ("The code moves to C6c in the clock work; until Code applies it, the code still uses the old window.",
  "The code change goes in a small follow-up batch after CLOCK-01 closes `[DECIDED Oct 25]`; until then, the code still uses the old window."),
])
edit('reference/parked/retreat-rules-shop.md',[
 ("bought with in-game currency. Price `[OPEN]`.",
  "bought with RMAT (the Shop currency, `[DECIDED Oct 25]`). Price **10 Tier 2 RMAT** (Refined), starting value `[DECIDED Oct 25]`.")])
edit('reference/00-document-index.md',[
 ("| Date | Decision | Recorded in |\n|---|---|---|\n",
  "| Date | Decision | Recorded in |\n|---|---|---|\n| Oct 25 | Placement, currency and price (Sam): the C6c night/dusk code change goes in a small follow-up batch after CLOCK-01 closes (CLOCK-01 stays locked); the Shop currency is RMAT; C3 \"one loop only\" costs 10 Tier 2 (Refined) RMAT, starting value | `reference/circuit-expedition-concepts.md`; `parked/retreat-rules-shop.md`; `DESIGN_HANDOFF.md` |\n")])
edit('DESIGN_HANDOFF.md',[
 ("Why: one window everywhere; night ends at Make camp's 06:00 wake.\n",
  "Why: one window everywhere; night ends at Make camp's 06:00 wake.\n- `[DECIDED Oct 25]` **C6c placement:** the night/dusk code change goes in a small follow-up batch after CLOCK-01 closes. CLOCK-01 stays locked.\n- `[DECIDED Oct 25]` **Shop currency is RMAT.**\n- `[DECIDED Oct 25]` **C3 price:** \"one loop only\" costs 10 Tier 2 (Refined) RMAT, starting value; the economy check tunes it. Why: a convenience, not relief (lead brief 5.1), so modest; Tier 2 means the player has run a few circuits first.\n"),
 ("To be folded into the clock work; CLOCK-01 is locked, so Sam confirms whether it joins CLOCK-01 or a follow-up batch.",
  "Goes in a small follow-up batch after CLOCK-01 closes `[DECIDED Oct 25]`; CLOCK-01 stays locked."),
 ("- \"One loop only\" price (C3): waits on the Shop currency (RMAT as main currency, carried below).\n",""),
 ("RMAT as main currency;","RMAT as main currency beyond the Shop (Shop currency decided RMAT, Oct 25);"),
])
r='reports/docs-oct25/DOCS_OCT25_REPORT.md'
s=io.open(r,encoding='utf-8').read()
s+="\n## Placement, currency and price follow-up (Sam, Oct 25)\nApplied by `apply_price.py`: C3 row now records RMAT and 10 Tier 2 RMAT (tier 2 = Refined in `ZI.RMAT_TIERS`); the open line under the Decisions table is empty; the C6c note records the follow-up batch; `parked/retreat-rules-shop.md` price note replaced; index log row; handoff §1 adds the three decisions, §3 records the placement and drops the price item. The carried \"RMAT as main currency\" item was narrowed to currency beyond the Shop, since Sam's decision covered the Shop. Pre-change copies: `pre-change/*-before-price.md`.\n"
io.open(r,'w',encoding='utf-8',newline='').write(s); print("ok report")
