# Zed Idler — Routes LLM handoff

Updated October 23, 2026. This file is the reusable handoff requested by Sam. Its companion JSON contains 39 flat parsing records.

## Workspace and scope

- Work only on E. The master project is E:/Zed_Idler.
- E:/C2C is the user-requested exchange folder for reusable instructions and LLM parsing exports. Keep the game and canonical project documents in the master folder.
- Existing weapon-reference files in C2C were left unchanged. The quarantine folder contains material excluded from uploading; it was not used for this work.
- Current design and implementation scope is Solo Survivor. Camp Leader is a later option and remains outside this work.
- Sam first requested brainstorming, then explicitly authorized the two reproduced idle-route fixes and a first preparation implementation using existing skills, equipped gear, and carrying space. He approved backups on E.
- The Traversal circuit builder, full biome-panel relocation, hydration expansion, new stamina rules, and vehicle reliability are separate concepts. They were not authorized for implementation by this slice.

## What is implemented

The main and TEST SAVE pages use the same Solo preparation model. It reads the actual character level, effective skills, working equipped gear, and existing carrying totals.

Preparation changes:

- Travel duration through Athletics, gear speed, and carried load.
- Per-fight win chance through Combat, Athletics, weapon power, armor, route difficulty, and global threat.
- Avoidance through Stealth, quiet equipment, and existing escape bonuses.
- Returned salvage through remaining carrying room and the canonical salvage-weight calculation.

Avoidance is rolled first; a detected encounter then uses the displayed fight win chance. This is not an overall safe-return percentage.

A run stores its preparation and duration at departure. Reloads and idle repeats use the saved snapshot. Change the loadout and restart the route to use new preparation. Old runs without a snapshot remain compatible.

Actual resolved activities feed the existing action-XP dispatcher. Avoided fights do not award fictitious kills. Route kills retain off-map metadata. Current injury wording remains a route-summary outcome; this slice did not add persistent HP damage, injury treatment, or equipment wear.

Pack overflow is left behind and explained in the return report. Empty extractions create no Recycler material.

The earlier idle fixes are retained: all unclaimed hauls survive repeats and reloads; Claim All grants each haul once; idle base XP uses the advertised 0.8 multiplier with the existing rounding and bonus rules.

## Interface

The Solo sidebar shows actual skills, gear, weight, room for loot, travel estimate, avoidance, and fight readiness. It links to the existing Stockpile controls for changing equipment/carried items and to Stats for skill information. The previous sample food, hydration, stamina, and vehicle-condition displays are not used as Solo readiness inputs. This does not settle the long-term hydration design.

Route cards and details use the shared model. Full packs block departure with an actionable reason. A running route shows its saved preparation. Return reports include avoided/won/lost fights and capacity-limited loot. Interface refresh listeners are deferred and coalesced so route settlement does not synchronously update another component during rendering.

## Relevant files

- E:/Zed_Idler/game/routes.js — ROUTE_PREP_TABLE, getRoutePreparation, routeLootCapacity, resolvePreparedRouteNodes, route snapshots, claims, XP.
- E:/Zed_Idler/Zombie Idler v2.html
- E:/Zed_Idler/Zombie Idler v2 - TEST SAVE.html
- E:/Zed_Idler/game/items.js — existing loadout, weight, carrying, and durability authorities; not changed by this slice.
- E:/Zed_Idler/game/stats.js — existing professions and action XP; not changed by this slice.
- E:/Zed_Idler/reference/routes-preparation-implementation.md — scoped implementation record.
- E:/Zed_Idler/reports/routes-preparation-2026-10-23/ — pre-change backups and verification artifacts.
- E:/Zed_Idler/tests/routes-preparation.test.js — 24 dedicated checks.
- E:/Zed_Idler/tests/routes-idle-rewards.test.js — 20 reward/XP regression checks.

## Verification and limits

617/617 checks passed across 29 suites. Four Solo starts each completed three simulated days without harness failures or warnings. Probability-frequency checks cover 4,000 encounters. Source syntax and matching page components were checked.

No real save was accessed. Browser rendering, live clicks, touch, and controller behavior remain unverified. The numeric preparation table contains initial implementation defaults; these checks are not a long-term balance audit.

## Existing design constraints

- Traversal cell salvage does not regrow. Repeated circuits must not refill already-looted shelves.
- Existing Traversal per-cell, per-real-day XP limits remain in force. Current predefined routes still resolve off-map; a later circuit builder must integrate world progress deliberately.
- Water v1 currently focuses on fishing and defers thirst, purification, containers, and automated POI schedules. Realism and craftable provisions remain an expansion direction.
- Follow the existing shared simulation, clock, offline-cap, and no-dead-end design principles. This slice did not implement the separate pending clock redesign.
- Several dedicated route-builder, food, cooking, stockpile, and profession-XP briefs referenced in older handoffs are missing from the reviewed folder. Do not claim they were inspected.

## Compile the parsing data

Read Zed_Idler_Routes_Parsing_Records.json as a JSON array. Produce one dataframe row per object, preserving these string columns:

id, topic, status, statement, why, evidence, proposed_target, open_question.

Preserve distinctions among DECIDED, IMPLEMENTED, CODE, CONCEPT, PROPOSED, OPEN, and SUPERSEDED. Existing implemented mechanics are recorded facts; initial tuning values are not automatically locked design decisions. Exclude superseded proposals from current requirements while retaining their history. Do not invent mechanics or treat a parsing request as authorization for new implementation.

## Session handoff

Implemented: idle reward/XP fixes and the first Solo preparation-to-outcome model.

Open: visual browser review, later balance tuning, Traversal circuit building, region-selector relocation, and separately scoped survival/transport systems.

Next step: visually inspect the updated TEST SAVE page, then continue one clearly scoped design or implementation task with Sam. Put future LLM-facing handoffs in E:/C2C.

