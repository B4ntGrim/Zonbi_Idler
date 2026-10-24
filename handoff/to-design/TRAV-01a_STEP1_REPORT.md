# TRAV-01a — Step 1 report (read-only investigation)

**Date:** Oct 21 · **Batch:** `CURRENT_BATCH.md` TRAV-01a (LOCKED Oct 21) · **Status:** steps 0 and 1 done. **STOPPED before step 2** — several answers change the plan (§4). No game or test file was changed.

Line numbers are from the step-0 build (`screens-v3.jsx` = `a7b89d36…`). HTML line numbers are from `Zombie Idler v2.html`; the TEST SAVE page has the same code at other lines.

---

## 1. Export applied (compare first, then apply)

| File | Local before | Export | What was done |
|---|---|---|---|
| `CURRENT_BATCH.md` | BAL-A (LOCKED Oct 19, implemented Oct 20, **NOT CLOSED**) | TRAV-01a | Replaced. BAL-A copy kept as `archive/pre-trav01a-oct21/CURRENT_BATCH-bal-a.md` |
| `DESIGN_HANDOFF.md` | Oct 17–20 handoff (holds the BAL-A status and the §4 scope note) | Oct 21 handoff | Replaced. Local copy archived as `archive/design-handoff-oct20.md` (and in `archive/pre-trav01a-oct21/`) |
| `reference/trav-01-traversal-slice.md` | did not exist | new | Added unchanged |
| `reference/playtest-findings-oct15.md` | PF1 `[DECIDED Oct 16]`, PF2; no PF3 | PF1 shown as `[OPEN]`; PF3–PF10 added | **Merged.** Took the export, but kept the local PF1 decision (Oct 16: gate stress < 70, Shaken 80, ceiling 71–95), which the export had lost. A one-line note marks the kept text |

**Points for Claude Design:**
- **E1. BAL-A is still `NOT CLOSED`.** The Oct 21 handoff does not mention it. Its three open items (Sam's TEST SAVE check, the full 30-day H2 matrix, review of the §4 scope note) are now only in the archived Oct 20 handoff. Please carry them into the next handoff or close BAL-A.
- **E2. The export's PF1 was older than the local copy.** Please update the claude.ai project copy of `playtest-findings-oct15.md` to keep the Oct 16 decision, so the next export does not undo it again.
- **E3. Index rows to add** (index not changed, as the manifest asked): `reference/trav-01-traversal-slice.md` (current, TRAV-01a locked); `archive/design-handoff-oct20.md`; `archive/pre-trav01a-oct21/` (pre-batch copies and build backup); the `playtest-findings-oct15.md` row should list PF3–PF10; decisions-log rows for Oct 21.
- The export folder stays in `handoff/from-design/` (deleting is not allowed from here). It can move to `handoff/applied/oct21/` later.

## 2. Step 0 — baseline

- **Suites:** all 26 run headless (Node 22, the same `readFile`/`log` call the suites expect). **605/605 PASS.** (The BAL-A report said 506; the difference is counting only: `fort-s12` reports 100 checks as one summary line.)
- **Backup for the differential:** `archive/pre-trav01a-oct21/build/` holds `game/*.js`, `screens-v2.jsx`, `screens-v3.jsx`, both HTML pages, `tests/*.js` and `CODE_STATE.md`.
- **Hashes:** `archive/pre-trav01a-oct21/build/HASHES.md5` (MD5). Key ones: `screens-v3.jsx a7b89d36…`, `game/active.js fed093cd…`, `game/world.js 55fbab46…`, `game/stats.js 29486493…`, `game/combat.js 71d1a86c…`, `game/wandering.js 7aa7d053…`.

## 3. Step 1 — answers

### TQ-T1 — What Traversal Scout does today (PF5)
- Handler: `screens-v3.jsx:876–880` (`doAction('scout')`).
- **Charges: none. Cooldown: none. Limit: none.** Every click gives XP.
- **XP:** `ZI.emitAction('scout', 1)` → `ACTION_XP.scout` = **5 Stealth** (`game/stats.js:83`, split at `119–127`), plus any flat XP bonus item.
- **Effect on the cell:** writes `zi_trav_scouted[cell] = true` (`screens-v3.jsx:877`). **Nothing reads this key** (no reader in `game/` or the screens). The result text only shows data the panel already shows (threat, biome, RMAT tier, looted).
- Side effect: Stealth level adds +0.4 % per level to loot safety (`world.js:107`), so spam-scouting slowly raises every cell's "safe %". That is the only way scouting touches loot today.
- **Wandering already has scout charges:** `ACTIVE_TABLE.charges.baseScout: 2` (`game/active.js:26`), stored in `zi_charges` (`active.js:88–99`), spent by `ZI.spendCharge('scout')` (`active.js:115–130`, base first, then carried Scout Kits). They refill **after a rest** (`active.js:767`, `wandering.js:421`), not per day. See §4, S1.
- A real-day helper already exists: `ZI._localDayKey(t)` (`active.js:1102`, local midnight; used by BAL-A walk-home groups). It can drive the daily refill.

### TQ-T2 — What Hide does today, and what zombie data a cell has (PF8)
- Handler: `screens-v3.jsx:892–895`. **Text only.** No time, no limit, no effect.
- **XP:** `emitAction('sneak', 1)` → base 8: **6 Stealth + 2 Athletics** per click (`stats.js:84`). Unlimited. Same farming problem as Scout.
- **Zombies in a cell: no data exists.** A cell (`ZI.worldCell`, `world.js:58–85`) has `difficulty` (1–5), `threatLevel` (0–5), biome and RMAT tier. Nothing lists zombies per cell.
- Wandering picks each zombie from the whole bestiary by distance walked (`ZI._bgZombie`, `wandering.js:105–115`: tier rank ≤ lap ÷ 1.5). **It does not read the cell.** The decided "tier band follows the square's difficulty" (BALANCE-03, Oct 17) is not in code yet (BAL-A report §4 lists it as unscheduled). See §4, S2.
- **Codex:** unlocks are stored in `zi_discovered_zombies` (`combat.js:9–22`). The only caller of `ZI.discoverZombie` is Wandering (`wandering.js:321`), and it is **switched off** (`WANDER_SIM_TABLE.codexFromWandering: false`, `wandering.js:309`, BEST1 Option A). **So today nothing unlocks a Codex entry.** See §4, S3.
- Codex screen: `screens-v3.jsx:2720–2850`. A locked entry already shows its **tier** ("UNIDENTIFIED · Tier X", `2834–2845`). The **danger label** is not bestiary data; the screen derives it from tier (`tierDanger`, about line 2771). Bestiary records (`bestiary-data.js`) have `id`, `name`, `tier`, `base`, `traits`, a free-text `biome`, stats.

### TQ-T3 — What Loot does today, why it goes to Routes, where "61% safe" comes from (PF6)
- Handler: `screens-v3.jsx:855–875`.
- **Once per cell** (`zi_trav_looted`). Roll 1–100 against the safe chance. Grants 2–3 random materials, each 2 to (5 + 2 × RMAT tier) (`grantRandomMats`, `836–845`).
- Clean search: Scavenging XP `4 × (1 + 0.3 × difficulty)` (`860`). Failed roll: damage `lootFailDamage` (`world.js:110–113`), HP floor 1 (U26), Endurance XP.
- **"61% safe"** = `ZI.lootSafeChance` (`world.js:104–109`): **85 − 11 × threat − 3 × difficulty + 0.6 × Scavenging level + 0.4 × Stealth level**, clamped to 15–95. Example: threat 2, difficulty 1, level-1 skills → 61.
- **Why Loot "opens Routes":** Loot does **not** change screens in normal play. It does so **only while the Traversal tutorial is running**: `screens-v3.jsx:856` points the tutorial's last step at the **Routes** tab ("Loot runs happen on Routes", `TUT_TARGETS.routes`, `807–810`); "Take me there" or clicking the tab calls `setScreen('solo-main')` (`828–833`). Two other things send a Solo player to Routes:
  - **every normal reload of a Solo save opens on Routes** (`Zombie Idler v2.html:4016`: boot screen is `'solo-main'` unless it is a fresh start);
  - the **Dispatch** button in the right-hand Zone Details panel (§ TQ-T5).

### TQ-T4 — What Make camp does today (for TRAV-01b)
- Handler: `screens-v3.jsx:881–891`. Blocked only on the Fallow Ground cell while that quest runs (`ZI.canCampAt`, `fort.js:71`).
- **Cost: none. Cooldown: none.** Each click:
  - moves the survivor to the cell (`zi_trav_pos`) and **stores the camp cell in `zi_trav_camp`** (`885`); clears a saved return (BAL-A D1);
  - **10 Command XP** (`stats.js:88`);
  - advances the world/header clock by 24 game hours (`ZI.passTime(24)`, `core.js:77–82`; world clock only);
  - **sets HP to full and `healsUsed` to 0** (`syncWanderState`, `889`). **This is a free, unlimited full heal.**
  - does not cure the injury (BAL-A O5, `890`).
- The camp cell is read by `ZI.homeCell()` (`active.js:1082`, where a Forced Retreat sends the survivor) and `ZI.isHomeCell` (`world.js:159–162`, counts as cleared ground).
- **Why PF4 happens:** the full heal fixes HP, but rest stress keeps falling at the Bedroll rate (`restBed`, `active.js:85`: checkpoint and camp both use `checkpointRestBed`), so the stress gate still holds. Checkpoint rest **can** read the camp cell (via `homeCell`/`zi_trav_camp`); nothing does today.

### TQ-T5 — Routes buttons with no handler; route-building code (PF6)
Static read (no browser run):
- **Routes screen** (`SoloMainScreen`, HTML `1763–1998`): every button has a handler, with one exception. **Deploy** (`RouteDetailPanel`, HTML `2625–2631`) gets `onClick = undefined` when stamina is too low, but it is **not disabled** and looks clickable at 40 % opacity. A red warning shows above it (`2610–2617`). The survivor card is **placeholder data** (stamina fixed at 78, `1776–1786`), so any route with duration × 8 above the effective stamina can never deploy.
- **Traversal "Dispatch (n) →"** (`screens-v3.jsx:1231–1257`, right-hand Zone Details panel, any non-adjacent cell): Camp Leader dispatch of the **fake survivor list**. With no vehicle it goes to `'solo-loading'`, which just renders Traversal again (HTML `4060–4062`). **It grants Engineering XP on every click** (`emitAction('build', …)` = 18 × (1 + 0.3 × threat), `stats.js:99`). A dead button that pays XP.
- **Route-building code: none.** Routes are the fixed list `ZI.ROUTES` by biome; `game/routes.js:146–298` only runs them. **So the Route mode toggle ships disabled** ("Route builder coming soon"), as the batch allows.

### TQ-T6 — Afflictions in code; what renders the survivors section
- **Afflictions that exist:**
  - **Injured** — `zi_injury_v2` (`active.js:1170–1190`): `{ skills, pct, remainingMs, source }`. **Counts down only on visible-page ticks** (BAL-A D2/O6: frozen while the game is closed). See §4, S5.
  - **Broken** — `zi_broken` (`active.js:1026–1027`, `ZI.isBroken()`).
  - Shaken is not a status (it only sets stress to 80, `active.js:546`). Buffs are positive effects, not afflictions.
- **Icons already exist** (BAL-A D6) on the Wandering header: `screens-v3.jsx:1906–1911` (Broken first, then 🩹 Injured, effects in the tooltip). Reuse these.
- **The survivors section:** `screens-v3.jsx:909–948` renders `survivors`, a **hard-coded list of four fake survivors** (`739–744`: Mira Chen, Buck Talon, …). Also part of the Camp Leader controls:
  - the five map tabs (`688–694`, rendered `963–978`). Each tab renames every cell (`WORLD_NAMES[type]`, `world.js:49`);
  - the "Assigned" row and the "Expected yield" text in Zone Details (`1209`, `1214–1222`);
  - the Dispatch button (`1231–1257`).
- **Mode:** the Traversal screen gets no `mode` prop (HTML `4062`, `4070`). It can read the mode with `ZI.getActiveSlot().mode` (`save.js:66`), so the HTML pages need no change.

### Other facts the batch needs
- **Save keys:** every `zi_*` key is saved per slot automatically (`save.js:11–17`). New keys (scout charges, per-cell daily XP, sighted list) need **no save-version bump** if a missing key reads as "full charges / nothing yet". No migration planned.
- **Zone panel today:** two separate pieces. Hover fills the right-hand Zone Details panel (`1181–1259`); a click on your own or an adjacent cell opens the action modal (`1061–1067`, `1268–1313`). Actions work only on your own cell or an adjacent one. The new panel must show the greyed reason for other cells (for example "Too far — move next to it").
- **Panel "Features":** only the **Fort** (`isFortCell`), **Fallow Ground** (`isFallowCell`), the **camp** and the **start** cell exist (`fort.js:42–43`, `world.js:159–162`). No water, Church or Workshop on cells.
- **Panel "Familiarity":** `ZI.cellFamiliarity` (`world.js:168–172`): cleared by kills; "explored" means the **sector** has been viewed. Scouting does not change it (that is TRAV-01b).
- **Tutorial text** (`screens-v3.jsx:791`) describes Hide as "waits out a threat" and Make Camp as a safe rest point. It will be out of date after this batch.

## 4. Stop — answers that change the plan

| # | Finding | Why it matters | Code's recommendation |
|---|---|---|---|
| **S1** | Wandering already has **scout charges** (2 base, refill after rest, plus Scout Kits). The batch adds "5 scout charges per real day" for Traversal. | Two scout-charge pools with different rules will confuse players and drift apart (design rules §4.3). | Decide: **(a)** separate Traversal pool (`zi_trav_scout`, 5/real day; Wandering unchanged), or **(b)** one pool for both. Code recommends **(a)** for this batch: it matches the locked text and touches no Wandering balance. Name it clearly in the UI ("Traversal scouts 3/5 today"). |
| **S2** | **No per-cell zombie data exists.** Hide has nothing to reveal, and Wandering does not pick zombies by cell. | If Hide invents a list that Wandering does not use, Hide lies, which is the opposite of "honest buttons". | Decide the source. Option: a per-cell list rolled from the world seed, sized by `threatLevel`, kinds from the tier band of the cell's `difficulty`, **and** Wandering draws from that same list in that cell (this is the BALANCE-03 tier-band direction, so it changes balance → H2 rerun). Smaller option: Hide shows the tier band only ("F–E threats, about 3") with no Wandering change. |
| **S3** | **Nothing unlocks Codex entries today** (Wandering unlock is off; no other caller). | "Full stats unlock when fought" is unreachable. After this batch, Hide's *sighted* would be the only Codex progress. | Not blocking. Ship *sighted* as written. Decide separately whether to turn on Codex unlocks from Wandering (Codex Option B, open since Oct 17). |
| **S4** | **Contracts disagree:** the batch says Scout and Hide XP is once per cell per **real** day; the slice (P1, P3) says per **game** day. | The batch says "if this file and the slice disagree, stop and ask". A game day is 2.4 real minutes today, so a game-day limit would barely limit anything. | Use **real day** (as the batch says). Please fix the slice text. |
| **S5** | The **injury timer is not real time.** It counts down only while the game is visible (BAL-A D2/O6). | Labelling it "real time" would be wrong while the game is closed. | Label it "play time left" (or "real time while playing"). Needs Sam's wording. |
| **S6** | **Loot goes to Routes only inside the tutorial** (the last tutorial step points at Routes). Normal reloads also open Solo on Routes (HTML file). | Fixing PF6 means changing **tutorial content** and, for reloads, the **HTML pages**, which are not in the likely files. | Tutorial: point the last step at **Wandering** (the other existing target) after Loot. Reload: open Solo on Traversal. Both need Sam's OK (the reload fix is outside the likely files). |
| **S7** | The **Dispatch** button, the "Assigned" row and the "Expected yield" text are Camp Leader controls the batch does not name. Dispatch also pays Engineering XP per click. | They must go with the survivors list, or Solo keeps a dead, XP-paying button. | Include them in behavior 6 (removed in Solo). |

**Noted, not in this batch (for TRAV-01b or later):**
- **Make camp is a free, unlimited full heal** plus 10 Command XP per click (TQ-T4). TRAV-01b should give it a cost or a limit.
- **Travel** gives 2 Athletics XP per move with no limit (move back and forth).
- The **Deploy** button should be `disabled` with its reason, not just faded.
- Codex search matches the names of unidentified zombies (small spoiler).

**Smaller defaults Code will use unless told otherwise:**
- *Hide "takes a short time":* advance the world clock by a data-table value (`TRAV_HIDE_GAME_HOURS = 1`), like Make camp does; no screen lock.
- *Acceptance check 3:* read as "an offline return across one or more midnights refills charges once, to the full daily amount".
- *Danger label for sighted entries:* reuse the Codex screen's tier → danger map, moved into data so both screens use it.

## 5. Next

Claude Design reviews S1–S7 with Sam. Code starts step 2 after Sam's answers. No production code is changed until then.
