# Docs report — Oct 27 (morning voice-session addendum)

Applied by `apply_oct27.py` (exact-match edits, each matched once). Pre-change copies in `pre-change/`. Instruction source: `ADDENDUM_OCT27.md` (written from Sam's Oct 27 voice session; no Google Doc addendum existed for it). Docs only; no game code.

| Block | Where |
|---|---|
| 1–7 Fishing, tiers, prep, gear, Sunken Blade, sirens | new `reference/parked/fish-01-fishing-concept.md` |
| 1 tick-based fishing | `poi-framework-v1-brief.md`: per-cell cooldown, N pulls and cell rest marked superseded; Sunken Blade pointer |
| 2 legendary 0.1% | `food-01-nutrition-slice.md` fish table (3% superseded, sim rerun `[OPEN]`) |
| 2, 5 gate conflict | `parked/djinn-fishing-concept.md` §5 `[OPEN]` note |
| 5 Sunken Blade trigger and scene choice | `PARKED.md` row (old trigger struck; open question closed) |
| 7 Diplomat XP | `wandering-tab-spec.md` under the skills line |
| 8 stations, wood/metal, plastics | `parked/food-02-cooking-concept.md` new §2d |
| 9 pickup animation | `playtest-findings-oct15.md` ANIM-01 addition |
| All | `00-document-index.md` (header, parked row, Oct 27 log row); `DESIGN_HANDOFF.md` (old: `archive/design-handoff-oct26-late.md`) |

## Deviations and findings
- **Diplomat already exists** (one of the 16 skills in the spec, used by the Fort and Concordance). The voice session called it "new" because it checked the outdated GDD v5.3. Recorded as XP rules for the existing skill, not a new skill.
- **No Cooking skill** in the spec, but FP3 scales with cooking skill → `[OPEN]` for Sam.
- **Fish tier list** (Junk … Mutated) was offered in the session but never explicitly approved; recorded `[PROPOSED]`. "More than four tiers, topped by Legendary" is `[DECIDED]`.
- **Earlier same-session decisions superseded within the session** were recorded only in their final form (five-legendary counter → gift to the maiden; maiden check Diplomat → Command; skill-scaled loss confirmed after a misheard "no").
- **17-component list not found** on E: (`reference/`, `uploads/`). Code's component store: `forged_iron`, `wiring`, `planks`.
- **BAL-A** (on Sam's 11:30 list): `handoff/to-design/BAL_A_COMPLETION_REPORT.md` says implemented Oct 20, **NOT CLOSED** pending three checks.
