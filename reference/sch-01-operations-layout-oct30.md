# SCH-01 — Schedule (Operations) page: layout fixes and the away-efficiency direction

**Status:** §2 is `[DECIDED Oct 30, Sam]` and **BUILT** (batch SCH-01a, Oct 30). §4 is `[PROPOSED]` and awaits Sam.
**Camp Leader:** `[PARKED Oct 30, Sam]` — the mode is deferred; this batch changed nothing in it.
**Supersedes nothing.** Builds on `reference/operations-schedule-proposal.md` (the page itself).
**Files:** `operations-ui.jsx`, `game/operations.js`, both HTML entry points (cache-bust only).

## 1. Where the page stands

The Schedule tab renders `OperationsScreen` (`operations-ui.jsx`, 119 lines), with read-only data
from `game/operations.js` (133 lines). Three sections: **Now and next** · **Plan** · **Base
schedule**. Its only write is Camp Leader duty assignment. Built Oct 29 from the proposal doc.

## 2. Decided changes `[DECIDED Oct 30, Sam]`

| # | Change | Why |
|---|---|---|
| **L1** | **Remove the Solo "Base schedule" section.** | It renders `catalog.filter(group==='base' && !proposal)` — the same five items already shown as cards in Plan. Eat, Nap, Treat, Process salvage and Craft each appear twice on one page. Camp keeps its duty block, which earns its place with the assignment controls. |
| **L2** | **Sort "Now and next" by urgency, with return times in their own column.** | Rows are pushed in fixed order (patrol → routes → Traversal) regardless of what is live, and times ("back at 14:32", "done at 09:15") are buried mid-sentence. Order: needs you now → running (soonest return first) → idle. |
| **L3** | **Attention items get an Open button.** | They end in "(Stats)" or "(Routes)" as written instructions while every other row on the page has a button. |
| **L5** | **Injury gets its own amber badge.** An active injury returned status key `available`, so it rendered in the green "Available now" styling | `[DECIDED Oct 30, Sam]` — built |
| **L6** | **The page and the tab are both named "Scheduling."** "Operations" is dropped | `[DECIDED Oct 30, Sam]` — built |
| **L4** | **Design proposals hidden by default,** with the count on the toggle: "Show 9 design proposals". | Proposals are 4 of 7 field items and 5 of 10 base items. On by default, more than half of Plan is greyed, non-clickable cards, so the page reads as mostly unbuilt. |

### L1 detail
Delete the Solo branch of the Base schedule section (`operations-ui.jsx:110–114`) and its heading
for Solo only. Camp Leader's branch (`:78–109`) is unchanged. The Solo heading text
("Your upkeep at your base or forward camp") goes with it.

### L2 detail
`ZI.opsNow(mode)` returns `{ field, camp, attention }`. Add a sort key to each row:
- `urgent` — anything the player must act on (a route back and settling, Make camp ready)
- `running` — has a future end time; sort ascending by that time
- `idle` — "not deployed", "open the map to pick your start"

Rows carry the end time as a field (`endsAt`), not only inside `detail`. The UI right-aligns it as
a time, or "now" when it has passed. `detail` keeps the state words and drops the time it duplicates.

### L3 detail
`out.attention` becomes objects: `{ text, screen }` instead of bare strings. Existing pushes map as
Injured → `hack-slash`, Broken → `hack-slash`, Hungry/Tired/stat picks/No food → `stat-leveling`,
unclaimed hauls → `solo-main`. The UI keeps the amber panel and adds the standard Open button.

**This changes a shape an existing test reads — see §3.**

### L4 detail
`operations-ui.jsx:9` — `React.useState(true)` becomes `false`. The label takes the count of hidden
proposals for the current mode, so the player can see there is something behind the toggle.

## 3. Sequencing and collision `[CODE]`

`operations-ui.jsx` and `game/operations.js` are **clean** — not in the other session's uncommitted
set, and not in the literature patch. L1, L2 and L4 can be built now with no collision.

Two dependencies:

1. **Cache-bust.** Both entry points carry `operations.js?v=20261029-duties1` and
   `operations-ui.jsx?v=20261029-duties1` (`Zombie Idler v2.html:38,53`; `TEST SAVE:68,83`). Both
   must be bumped, and both HTMLs are currently dirty from the other session. One line each, in a
   file the team is patching — coordinate or do it last.
2. **L3 breaks a test.** `tests/char-crawler-ops.test.js:77` reads
   `attention.some(t => /Injured/.test(t))`, a regex against a string. Once attention items are
   objects, that check fails. That file is dirty from the other session's crawler work and is *not*
   in the literature patch, so it needs a deliberate one-line update.
   **Recommendation:** build L1, L2 and L4 now; hold L3 until the team's patch settles.

## 4. Away efficiency — the time structure Sam wants back `[PROPOSED]`

**Sam's direction (Oct 30, voice):** the time structure worth having is *how efficiently the player
plays while they are away*. Set and forget, plug and play, run from the Schedule tab.

### Correction: there is no server side
Sam described this as server-side functionality. The game is a local HTML/JS prototype on
`localStorage`. Nothing runs while the tab is closed. On reopen, `ZI.offlineWindow()` (`core.js:71`)
reads the last-seen timestamp and the settle functions replay the gap: `settleSchedule`
(camp duty XP), `settleRouteRuns`, `_settleJobs` (recycle, craft, build), `P.settleOffline`
(survival status), `settleSkillDecay`, `settleRepForgiveness`, orchestrated in `bootstrap.js`.
From the player's seat it looks identical, so the design intent survives — but it constrains what
can be promised, and it is the reason for the cap below.

### The ceiling that limits the intent
`ZI.OFFLINE_CAP_MS = 24 * 60 * 60 * 1000` (`core.js:53`) and `ZI.SCHEDULE_OFFLINE_CAP_H = 24`
(`camp.js:19`). **Nothing accrues past 24 real hours away.** Survival status is also capped by
`offlineWorst` (`progression.js:163–185`) so no track passes its mild tier — the survivor
self-manages from supplies and is never found in a severe state.

So today the reward for being away flattens completely after one day. A player who leaves for a week
gets exactly what a player who left yesterday gets. That works against "set and forget" as a reason
to keep the game installed.

**PROF-01 is already the answer and is already decided.** Its catch-up allowance scales with days
away to a 14-day cap (`prof-01-xp-catchup-sim-oct30.md`, P1–P5 `[DECIDED Sam]`), and it is not yet
built. It is the one decided mechanism that rewards absences longer than 24 hours.

### SCH-02 proposal: the away forecast
Give the Schedule tab a fourth element — **"While you're away"** — stating what happens if the
player closes the game now:

- what keeps running (duties, route runs, the job queue) and what stops
- what finishes, and when
- when the 24-hour ceiling is reached, stated plainly
- what the survivor will do for itself (eat up to 3 meals, rest) and the worst state it can reach
- after PROF-01 ships: the catch-up the player is building toward by staying away

This is time structure, which is what Sam asked to get back, without reviving the 24-hour task queue
the proposal deliberately removed. It also gives the page a reason to exist before a trip rather
than only after one: you set it, you see what you set, you close the game.

## 5. Tests
New file `tests/sch-01-operations.test.js` (clean, no collision):
- Solo renders each base activity exactly once
- "Now and next" orders urgent → running (by end time) → idle
- every running row carries `endsAt`
- proposals are hidden until the toggle is set, and the count matches the hidden items
- L3 only: every attention item has text and a screen that exists

## 6. Open
- ~~`[DECIDE]` L6 — the name.~~ **`[DECIDED Oct 30, Sam]`: "Scheduling", for both the tab and the page
  title. "Operations" is dropped. Screen ids (`solo-schedule`, `camp-schedule`) and the
  `OperationsScreen` component name are unchanged.**
- `[DECIDE]` **SCH-02** (§4) — build the away forecast?
- `[PARKED Oct 30, Sam]` Camp Leader still shows Eat / Nap / Treat cards that open the solo survivor's
  screens (`operations-ui.jsx` suppresses only `solo-main`). Sam: the mode is being worked on later.
- ~~`[OPEN]` An injury returns status key `available`.~~ **Fixed in SCH-01a: key `injured`, amber.**
- `[OPEN]` Whether the 24-hour offline cap should rise once PROF-01 catch-up is in.

## 7. Build record — batch SCH-01a (Oct 30)

Built: **L1, L2, L4, the injury badge, and the L6 rename.** Not built: **L3** (see §3.2) and
**SCH-02** (§4). Camp Leader untouched.

| File | Change |
|---|---|
| `game/operations.js` | `opsNow` rows carry `sort` and `endsAt`; new `ZI.OPS_SORT_RANK` and `ZI.opsSortRows`; times removed from `detail`; injury returns key `injured`; `OPS_STATUS.injured` added |
| `operations-ui.jsx` | Solo Base schedule section removed (Camp only); return-time column via `endLabel`; proposals default hidden with a count on the toggle; `injured` styled amber; title "Scheduling" |
| `Zombie Idler v2.html` | tab label 368 and 371; cache-bust 38 and 53 |
| `Zombie Idler v2 - TEST SAVE.html` | tab label 398 and 401; cache-bust 68 and 83 |
| `tests/sch-01-operations.test.js` | new, 24 checks, all passing |

Cache-bust: `20261029-duties1` → `20261030-sch01a` in both entry points.

### Deviation from the contract, for the record
§5 asked that *every* running row carry a numeric `endsAt`. An active Wandering patrol has no end
time — it runs until the player stops it — so it sorts as `running` with `endsAt: null` and shows no
time. The test instead asserts what is true: running rows with a time are ordered soonest first, and
**no `idle` row ever carries an end time**. Open-ended rows sort after timed ones.

### Not committed
Left uncommitted at Sam's instruction while the team's literature patch is in flight. Both HTML
entry points also hold other sessions' edits; only the four label lines and four cache-bust strings
were touched.
