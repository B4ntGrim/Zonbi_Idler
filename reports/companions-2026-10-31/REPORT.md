# Companion prototype and activity gains — October 31, 2026

## Implemented in this change

- Both HTML entry points load a bottom activity feed and expose persistent Settings toggles. All gain categories enabled by default; exact amounts off. Category filters, companion-only source filter, consecutive-entry grouping and bar visibility supported.
- Profession notifications subscribe to existing XP events and preserve action / companionName metadata. Other experience, RMAT, components, stash items and material gains use positive balance differences sampled each real second. This sampling can miss gains spent within the same interval; it is a first-pass HUD, not a transaction ledger. Pending carried Wandering loot is not yet captured. Existing companion systems do not currently emit companionName.
- The HUD reads balances only. It never awards XP, feeds companions or creates a second simulation engine. A slot/world identity change clears old entries. Existing save snapshots already include the zi_-prefixed Settings key.
- companion-prototype.html is a self-contained interactive design sandbox, linked from the activity bar and included by the web builder. Shows Latch's sheet, travel/base assignment explanation, scheduled work / player proficiency rule, hidden/revealed gain previews, a 24-second visual countdown, and an adjustable food-cost calculator. Does not alter saves.

## Confirmed direction

One-time recruitment payment; food-only recurring upkeep with companion-specific consumption every 24 real seconds. Player-assigned schedule controls base work; completed work grants the player profession XP. Blocked work gives none. Companion loot contribution: additional 75–225 percent, with gathering speed independent of yield. First recruitment encounter preserved. All gains displayed by default; numbers hidden until enabled; display filters in Settings.

## Draft values, not validated balance

Latch: neutral deserter; former faction unspecified. Melee specialist, sidearm competent, rifles weak; modest offense and defense. Traveling loot contribution +75%. Base support starting proposals: crafting duration -10%, food crafting duration -15% total, rest benefit +10%, stress recovery ×1.20 with zero floor. One food portion per interval is an editable calculator assumption, not live consumption.

## Food audit finding

24 real seconds implies 150 meals per real hour per companion. If each meal costs one existing food item, that is 3,600 items per real day. The calculator separates portion quantity from food-items-per-portion. No measured food-income simulation has established sustainability. Recruitment price, food conversion, task durations/output/XP, facilities, hunger consequences and offline upkeep remain unresolved. Audit must compare net food income, companion output and extra traversal loot over matched seeded runs before enabling live upkeep.

## Validation

- Targeted Node suites: activity-feed 10/10; stat-02-live 53/53; save-fixes 19/19. Total 82 passing checks.
- Existing char-crawler-ops suite: 41 passing, 3 failing. Reproduced all three against original HTML entry points: appearance schema, legacy clothing migration, and new-save profile assertion. No character creation code was modified.
- activity-bar.jsx and both modified inline HTML applications compiled with the repository's vendored Babel. JavaScript syntax and git whitespace checks pass.
- Browser visual verification attempted but unavailable: Playwright Chromium executable is not installed. No visual QA pass claimed.
- Broader regression run incomplete; early output also contains equivalence failures. No complete suite pass or full BAL-A 80-run simulation claimed.

## Remaining integration

Live recruitment, first-encounter wiring, solo squad/camp-roster membership, base scheduler execution, food deductions, travel loot application, rest/crafting/stress effects and companion-specific countdown are not implemented in the game. These must follow the economy audit and reconcile prototype and Unity/C# owners. This patch provides the reviewable sheet/calculator and live notification UI without enabling unvalidated economy changes. The actual HUD labels its 1-second sampling cadence; only the sandbox shows a companion countdown.

## Next work

Audit food acquisition, capacity and recipe outputs using the current clock and seeded simulations. Set validated consumption/task data, then wire recruitment and schedule adapters to existing owners. Replace polled resource diffs with source-tagged reward events to cover every gain precisely.
