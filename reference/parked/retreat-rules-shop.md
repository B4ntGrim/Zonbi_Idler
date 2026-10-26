**Status:** [PARKED] until the Shop design takes it up. Filed Oct 13 (RB2d, Sam).

# Retreat rules as a Shop option

Sam, Oct 13: changing the retreat limits (HP floor, stress ceiling, load limit) will be options in the shop later. Until then every save uses the stored rules (defaults HP 30%, stress 85, load 115%) and the Wandering screen has no editor.

**What already exists `[CODE]`:** `ZI.RETREAT_RULES_TABLE` (defaults, ranges HP 10–60%, stress 71–95 (was 51–95; PF1 Oct 16), load 100–125%), `ZI.getRetreatRules` / `ZI.setRetreatRules` (validated, saved), and the rule check `ZI.retreatRulesTrue`. The old on-screen editor was removed in RB2 (`screens-v3.jsx`); the rules code was not changed.

**Open when it's scheduled:** what is sold (each limit, an on/off per rule, or a tier); price and currency; whether it's a one-time unlock; design rule §4.6 (never sell relief from a pain the design created) — check that the default limits are fair on their own before selling changes to them.

**Also in the Shop `[DECIDED Oct 25]`:** the circuit "one loop only" toggle (C3 in `reference/circuit-expedition-concepts.md`), bought with RMAT (the Shop currency, `[DECIDED Oct 25]`). Price **10 Tier 2 RMAT** (Refined), starting value `[DECIDED Oct 25]`.
