# Zed Idler — Design Handoff (Oct 9)

**Read first:** `CLAUDE_DESIGN_RULES.md`, then this file, then `00-document-index.md`.
**Replaces:** no earlier handoff. When the next handoff is written, move this one to `archive/`.

---

## 1. Decisions made Oct 9 `[DECIDED]`

| # | Decision | Recorded in |
|---|---|---|
| 1 | **The Church is a repeatable POI type.** A world can hold more than one; each has its own `poiId`. Churches stay rare. | `poi-framework-v1-brief.md` §3 · `wandering-church-scene.md` §2, §8, §9 |
| 2 | **The Workshop uses normal POI placement.** It is placed by the framework and revealed through discovery states, not created by chance inside a garage discovery. A garage can remain its look (flavor only). | `poi-framework-v1-brief.md` §3 · `wandering-workshop-scene.md` §2, §9, §10, §11 |
| 3 | **The world is not a fixed size.** It keeps expanding as the player travels, at the player's own risk. Every POI type places per grid from the grid's seed; no type may depend on a per-world total. A grid generated late must produce the same POIs as one generated at world creation. | `poi-framework-v1-brief.md` §2 · `faction-quests-and-poi-density.md` §2, §3.5, §10 |

## 2. Concepts recorded (not decided)

- **Faction quests, travel and POI density** `[CONCEPT]`, `[PARKED]`. Sam's direction: distance travelled decides how many sites a player sees; factions offer quests by reputation, some tied to Churches and Workshops; travel can bring altercations with another faction that grow into story. Developed in `parked/faction-quests-and-poi-density.md`.
- **Expansion risk:** danger rises with distance from the start `[CONCEPT]`. How sites change with distance is `[OPEN]` (recommended: richer farther out).

---

## 3. Files changed or created Oct 9

| File | Folder | Change |
|---|---|---|
| `poi-framework-v1-brief.md` | `reference/` | World-size rule (§2); Church and Workshop listed as repeatable (§3) |
| `wandering-church-scene.md` | `parked/` | Repeatable POI; framework placement; `[PARKED]` status line |
| `wandering-workshop-scene.md` | `parked/` | Normal POI placement; `[PARKED]` status line |
| `faction-quests-and-poi-density.md` | `parked/` | **New** parked brief |
| `wandering-tab-spec.md` | `reference/` | **v2.1.** Two diverged copies merged: the `uploads/` copy (Batch 1A, 1B, 3A, 3B decisions) plus the Oct 1 story-item and familiarity rules from the `reference/` copy. Old copy archived as `wandering-tab-spec-pre-merge-oct9.md`. Companion headers updated to v2.1 |
| `wandering-church-scene.md` | `reference/parked/` | Oct 3 disposition integrated (§0); shop/trade and blessing output `[PARKED]`; Remove stress `[PROPOSED]`; superseded rules kept as history (§10). Old copy: `archive/wandering-church-scene-pre-disposition-oct9.md` |
| `wandering-workshop-scene.md`, `wandering-horde-ground-scene.md` | `reference/parked/` | Removed "the Church gates comfort" and "Church is a sink" wording to match |
| `CLAUDE_DESIGN_RULES.md` | project root | **New** permanent rules |
| `DESIGN_HANDOFF.md` | project root | **New** (this file) |

The site briefs, spec, Fort brief, audit, lead brief and index were also restored to Sam's local `reference/` folder from the Claude project.

---

## 4. Housekeeping still to do

| # | Task | Notes |
|---|---|---|
| 1 | Confirm `r1-brief.md` belongs in `archive/` | It was archived before R1 was confirmed closed. Keep it there only if Code confirms R1 |

Done Oct 9: `[PARKED]` line on all four parked briefs; `design-notes.js` parked with its note; batch 2, 3B and R1 briefs archived; `headshots-concept` parked; folders renamed to `parked/` and `archive/`; `PARKED.md` moved to the project root; Fort header fixed (v2.0); `00-document-index.md` rewritten.

---

## 5. Open questions

### For Sam
1. **Is R1 closed and the HP drain bug fixed?** Unknown. This blocks the POI framework (its precondition).
2. Older decisions still listed as open in `wandering-design-audit.md` §2 (A–E): kits as consumables, Fort standing exception, Criminal at the Fort, the late-game fork, policy reputation leaning. Check which are already settled and close the rest.
3. Parked, no rush: Church and Workshop counts per grid and placement constraints; distance scaling of sites.

### For Code (implementation facts; ask before the framework batch)
1. How large is one world grid, in cells?
2. When does a new grid generate (reaching the edge of the current one, or another trigger)?
3. Does a grid generated late produce the same content as if generated at world creation? (Required by decision 3.)
4. How is generated world content saved today, and what is the current save version?

---

## 6. Next step

**First, confirm R1's status** from `CODE_STATE.md` or by asking Code.
- **If R1 is closed:** write the POI Framework v1 slice (format in the rules, §6), with the Code questions in §5 answered, and draft its `CURRENT_BATCH.md` for Sam to lock.
- **If R1 is open:** finishing R1 comes first; the framework waits.
