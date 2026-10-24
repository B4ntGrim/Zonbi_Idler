# Zed Idler — Draft Validation Report

Prepared 2026-10-24. These checks validate documentation/data integrity and example arithmetic. They are not game-engine regression tests.

| Check | Result | Evidence |
|---|---|---|
| Catalogue model count | PASS | 300 |
| Unique tracking IDs | PASS | AXE-001 through AXE-300 |
| Unique model IDs | PASS | 300 stable draft model IDs |
| Unique names | PASS | 300 personal names |
| Unique shape configurations | PASS | 300 fictional head/haft configurations |
| Markdown catalogue rows | PASS | 300 item rows |
| Historical anchor count | PASS | 30 shared source records |
| Source references | PASS | Every model has a valid H-number |
| Six catalogue groups | PASS | 6 groups of 50 |
| Held category mapping | PASS | 250 weapon/melee |
| Throwing category mapping | PASS | 50 consumable/throwable |
| Unset production balance | PASS | No guessed runtime balance |
| Requested metric rows | PASS | 14 Attack + 8 Defense + 7 Utility |
| Typed damage example | PASS | 150 |
| Split damage example | PASS | 138 |
| Crit expectation example | PASS | 1.10 |
| Area example | PASS | Radius x1.2 |
| Recovery expectation and stock | PASS | Mean 4 recovered from 10 eligible launches at 40 percent |

## Scope and limitations

- Focused source inspection: items.js, stats.js, combat.js, wandering.js, active.js, core.js, current weapon directive and parked encyclopedia.
- Historical sourcing: linked museum, excavation-project and research-author references. Some records have limited find context; uncertainty is retained in the source register.
- Full Phase 1 audit: NOT COMPLETE.
- Game regression tests: NOT RUN; no game behavior was changed.
- Browser playthrough: NOT RUN; no game behavior was changed.
- Balance simulations: NOT RUN; formulas and values remain brainstorm proposals.
- Claude Code acknowledgement/execution: NOT ASSUMED.
- Existing game, tests, saves and project references were not edited. Only newly authored bundle files are published.

Copy verification is performed separately by comparing SHA-256 hashes of every published file against the workspace originals.
