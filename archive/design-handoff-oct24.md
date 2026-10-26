# Design handoff — Oct 24

**Replaces:** the Oct 21–23 handoff, archived as `archive/design-handoff-oct21-23.md` (its open items are carried below).
**Active batch:** `CURRENT_BATCH.md` = **CLOCK-01** (locked Oct 24). Code starts with the step-1 read-only report (`reports/clock-01/CLOCK-01_STEP1_REPORT.md`).

## 1. Decisions made (Sam, Oct 24)
- `[DECIDED Oct 24]` **CLOCK-01 O1–O6:** Hide cap **2 uses per rolling 24 real hours** (Sam chose 2 over the recommended 3); clock rate stays T8 (1 game hour = 1 real minute); Make camp always wakes at 06:00 of the next calendar day; the calendar shows the full absence while all offline systems share one processing window capped at 24 real hours per absence (capacity limit; no player-facing message required); injury treatment subtracts play time; both HTML pages in scope.
- `[DECIDED Oct 24]` **CLOCK-01 Hide and camp cooldowns:** each Hide use returns 24 real hours after it is spent; Make camp returns 24 real hours after its last use. Local midnight and timezone changes do not refill these actions. Existing scout and other daily limits keep their current reset rules in this batch.
- `[DECIDED Oct 24]` **Future daily-limit pass:** eventually move existing daily limits (including Traversal scouts and other local-midnight limits) to rolling 24-hour refills after use. Keep that migration outside CLOCK-01; only Hide and Make camp change now.
- `[DECIDED Oct 24]` **CLOCK-01 scope:** keep this batch focused on the browser prototype. Server-side enforcement of the 24-hour offline-processing limit is deferred to later server wiring.
- `[DECIDED Oct 24]` **Jester stay:** keep the duration at 3–5 full game days across the clock-rate change. At the new rate, that is about 72–120 real minutes; this is an explicit exception to T9's usual real-duration preservation.
- `[DECIDED Oct 24]` **Make camp and injuries:** Make camp does not treat injuries; the active browser screen already follows this rule. Injury treatment helpers use real play minutes, while Field Bandages and the deliberate Rest handle cures.
- `[DECIDED Oct 24]` **Route-preparation numbers** (`ROUTE_PREP_TABLE`) accepted as starting values. A retroactive decision record (§0) now sits in `reference/routes-preparation-implementation.md`.
- `[DECIDED Oct 24]` **BAL-A scope note §4 assignments:** tier band → the tier-band batch; post-kill heal → already superseded by FOOD-01 O1 (regen); Option C heal-then-retreat, the near-death stress scale and consumable-only healing → Batch B; EN3 encounter spacing → FOOD-01 O3 (pacing). BAL-A closes on the full H2 matrix.
- `[DECIDED Oct 24]` **Working rules:** `E:\C2C` is the file-exchange folder with ChatGPT. Every working file or script that leaves this computer for the cloud, or that Claude writes or runs here, is duplicated under `handoff/to-cloud/<date>/` with a MANIFEST.

## 2. Files changed
- `CURRENT_BATCH.md` (now CLOCK-01); `archive/trav-01a-batch.md` (old contract).
- `reference/clock-01-slice.md` (O1–O6 locked, batch status); `reference/trav-01-traversal-slice.md` (P3 cap, §7 row).
- `reference/routes-preparation-implementation.md` (§0 decision record); `CODE_STATE.md` (Stockpile line).
- `reports/stockpile-loadout-2026-10-23/STOCKPILE_LINK_REPORT.md` (new, retroactive).
- 39 documents copied from the claude.ai Project into `reference/`, `reference/parked/` and `archive/` (list in the index, Oct 24 section).
- `reference/00-document-index.md`; `DESIGN_HANDOFF.md` (this file); `archive/design-handoff-oct21-23.md`.
- `handoff/to-cloud/2026-10-24/` (snapshot, C2C copies, tools); `reports/docs-oct24/pre-change/`; `reports/h2-full-2026-10-24/`.

## 3. Open questions
**Sam:**
- Tier-band batch: Sam's data to parse, then the slice's open decisions.
- STOCK-01 tab set: proposed Recycler · Storage · Food vs the built Recycler · Storage · Gear & Loadout.
- Route noise vs PF13 noise 0–4 (reuse one scale).
- BAL-A: TEST SAVE check (who runs it).
- Carried: TRAV-01a 7-step smoke test; FOOD-01 O3 and fish rarity; FOOD-02 C1–C6; djinn P10–P16 and curse values; RMAT as main currency; ROUTE-01 transport sourcing; Rig pocket ratio (proposed 0.5); D2 travel stamina numbers.

**Code:** CLOCK-01 step 1 (rescaled durations); FOOD-01 O6 facts; STATS-01 save key and UI reference size; BALANCE-03 round 8 rerun; Stockpile one-second polling (mobile).

## 4. Next step
H2 full matrix finishes → BAL-A closure report. Then Sam shares the tier-band data and Code starts CLOCK-01 step 1.
