# Docs report — circuit decisions C1–C8 (Oct 25)

Applied the Creative Director's instruction block (Sam, Oct 25). Pre-change copies in `pre-change/`; edits made by `apply_c1_c8.py` (exact-match replacements, each matched once).

## Edits
1. `reference/circuit-expedition-concepts.md`: new "Decisions [DECIDED Oct 25]" table C1–C8 after "Design aim"; open questions 1, 4, 9, 11 struck through and marked answered (9 notes that missing-information defaults stay open). Others left `[OPEN]`.
2. `reference/route-01-route-builder-concept.md` §3: pointer to C1–C8.
3. `reference/parked/retreat-rules-shop.md`: "one loop only" (C3) added to the Shop.
4. `reference/00-document-index.md`: circuit entry, decisions log row, reports row, header date.
5. `DESIGN_HANDOFF.md` replaced; old copy at `archive/design-handoff-oct24.md`.

## Propagation search (reference/ and reference/parked/: circuit, repeat, stop rule, night, loop)
| Hit | Action |
|---|---|
| `route-01-route-builder-concept.md` R1, §3, §4 | Pointer added in §3 |
| `biome-01-chunks-slice.md` line 66 (Cold Exposure at night) | Cross-reference to C6 added |
| `biome-01-chunks-slice.md` line 89 (Pegasus along a circuit) | No change; unaffected |
| `routes-preparation-implementation.md` lines 48, 56, 74 (map circuits out of scope) | No change; still true |
| `00-document-index.md` line 237 (circuits remain separate) | No change; historical Oct 23 note |
| `tutorial-first-session-spec.md` lines 182, 268, 362 (Auto-Repeat is a Shop unlock `[DECIDED]`) | Conflict raised, then resolved by C9 (see below) |
| Other "repeat"/"loop" hits (balance, Jester, POI, stress, H1/H2 records) | Unrelated meaning; no change |

No files left this computer, so no `handoff/to-cloud/` entry was needed.

## C9 follow-up (Sam, Oct 25)
Applied by `apply_c9.py`. Supersession note added at `tutorial-first-session-spec.md` lines 182, 268, 362 (Auto-Repeat only; Active/Idle unchanged); C9 row in the circuit Decisions table; index entry and log row; handoff §1 gains C9 and the conflict is removed from §3. No other Auto-Repeat references in `reference/` or `reference/parked/`. Pre-change copies: `pre-change/tutorial-first-session-spec.md` and `*-before-c9.md`.

## Circuit details follow-up (Sam, Oct 25)
Applied by `apply_details.py`: C6a and C6b rows added after C6; C8 gains the report order; the open line now lists only the C3 price; index entry and log row; handoff §1 and §3 updated. Search for an existing night definition found `screens-v2.jsx` line 41 (night 21:00–05:00, dusk 18–21 and 05–07) and `ZI.TIME_STAT_MODS` in `game/survival-data.js`; recorded as a conflict, code not changed. Pre-change copies: `pre-change/*-before-details.md`.

## C6c follow-up (Sam, Oct 25)
Applied by `apply_c6c.py`: C6c row (night 22:00–06:00 game-wide; dusk 19:00–22:00 and 06:00–08:00, both decided); conflict note marked resolved; index entry and log row; handoff §1 adds C6c, §3 carries the code change as a pending Code item. No game code changed: CLOCK-01 is a locked batch, so the `screens-v2.jsx` edit waits for Sam to place it. Only `screens-v2.jsx` lines 41–42 define the night and dusk hours. Pre-change copies: `pre-change/*-before-c6c.md`.

## Placement, currency and price follow-up (Sam, Oct 25)
Applied by `apply_price.py`: C3 row now records RMAT and 10 Tier 2 RMAT (tier 2 = Refined in `ZI.RMAT_TIERS`); the open line under the Decisions table is empty; the C6c note records the follow-up batch; `parked/retreat-rules-shop.md` price note replaced; index log row; handoff §1 adds the three decisions, §3 records the placement and drops the price item. The carried "RMAT as main currency" item was narrowed to currency beyond the Shop, since Sam's decision covered the Shop. Pre-change copies: `pre-change/*-before-price.md`.

## C10–C21 follow-up (Sam, Oct 26)
Applied by `apply_c10_c21.py`. The instruction header said C10–C20 but listed C10–C21; all twelve rows were added after C9. Questions 2, 3, 5–8, 10, 12–14 struck through and mapped; question 9 completed by C17; note added that 15–24 stay open. ROUTE-01 §3 pointer extended. Index log row and header date; handoff §1, §3, §4. Checks: C16 matches `poi-framework-v1-brief.md` line 390; C18 narrows spec 2.5 (later Forts rolled only while present), noted in its row; C21 auto-eat is not in the code (only FOOD-01 P6), recorded as a dependency. Pre-change copies: `pre-change/*-before-c10.md`.
