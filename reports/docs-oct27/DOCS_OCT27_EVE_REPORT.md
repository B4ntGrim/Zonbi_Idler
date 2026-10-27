# Docs report — Oct 27 evening (Sam's answers in chat, 14:02)

Applied by `apply_oct27_eve.py` (exact-match edits, each matched once). Pre-change copies in `pre-change-eve/`. Docs only; no game code.

| Answer | Where |
|---|---|
| Cooking skill, separate from Foraging | `wandering-tab-spec.md` skills line (16 → 17) and §"Why" wording |
| Fish prep loss scales with Foraging | `parked/fish-01-fishing-concept.md` FP3; §8 prep-skill open item closed |
| Plastics = seventh base material | `parked/food-02-cooking-concept.md` §2d; FISH-01 §8 |
| Stations are FOOD-02 ladder steps, Shop unlocks | FOOD-02 §2c (new paragraph), §2d |
| Shop replaces the Market | `tutorial-first-session-spec.md` table row and 7.6 |
| All | `00-document-index.md` log row; `DESIGN_HANDOFF.md` (old: `archive/design-handoff-oct27-pm.md`) |

## Notes
- Follow-up 14:08 (Sam, `apply_oct27_eve2.py`, copies in `pre-change-eve2/`): **Cooking controls fish prep** (FP3), replacing the Foraging reading; **the Auction view is removed**.
- Component reuse plan not recorded as decided: Sam asked to hear it again first.
- Stations as Shop unlocks: the Campfire stays free so eating is never locked behind the Shop (rule 5.1).
- BAL-A not marked closed: Sam asked what is left; the handoff lists the three checks.
- Code impact for a later batch: `game/stats.js` skill list (Cooking), `ZI_MATERIALS` (plastics), the Market tab and `ZI.MARKET_*` (Shop).
