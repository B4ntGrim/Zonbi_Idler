# WX-01 — Weather, seasons and afflictions (Oct 30)

**Status:** `[PROPOSED — pending systems audit]`. Design decided by Sam in the Oct 30 voice
session. **Not built** — Batch B is blocked on another session's uncommitted edits to
`screens-v2.jsx`, `game/stats.js` and `game/items.js`.

Sam's own words on scope: *"this all will need a systems audit."* Weather now touches stats,
afflictions, travel, scavenging and Insight, so nothing here is build-ready until that audit runs.

## 1. What already exists — read this before building anything

The instruction block assumed weather had to be designed from scratch. It does not. `game/
survival-data.js` is live and loaded:

| Thing | Where | State |
|---|---|---|
| `ZI.WEATHER_STAT_MODS` — Rain, Fog, HeatWave, Blizzard | survival-data.js:303 | per-stat percentages **and** an `opportunity` string each |
| `ZI.TIME_STAT_MODS` — time of day | survival-data.js:340 | same shape |
| `ZI.conditionMods(weather, phase)` | survival-data.js:363 | combines both, with `reasons` and `parts` for provenance |
| `ZI.WEATHER_EFFECTS` | survival-data.js:375 | Rain, Fog, HeatWave, Blizzard, **AcidRain**, **RadiationStorm** |
| `ZI.MOODLES.Wet` | survival-data.js:146 | Damp → Wet → Soaked → **Drenched**, with `coldBuildupRate` and `temperatureDrop` |
| `ZI.MOODLES.Thirsty` | survival-data.js:109 | Thirsty → Very Thirsty → Parched → Dehydrated, with stamina and speed penalties |

**So there is a thirst model, and Drenched already exists** as the top rung of a Wet ladder that
already models cold building into sickness — which is the escalation Sam described, already written.

### Why the panel feels dead
`screens-v2.jsx:18`:

```js
const [weather, setWeather] = React.useState('Rain');
```

Weather is **local React state with a hardcoded default**. It is not in the save, not driven by the
calendar, and resets whenever the screen is reopened. The panel at `screens-v2.jsx:244` calls
`conditionMods` and renders genuine numbers from genuine data — but that is its only consumer.
Nothing applies those modifiers to travel, combat or scavenging.

Sam read this exactly right: the numbers are honest, they just never reach the survivor.

**The work is wiring, not defining.** Three gaps: make weather world state, apply `conditionMods`
to the real stat pipeline, rebuild the panel.

## 2. Decisions (Sam, Oct 30, voice)

| # | Decision | Tag |
|---|---|---|
| W1 | Weather **follows the seasons** | `[DECIDED]` |
| W2 | **Insight owns forecasting** — more Insight sees further ahead. Weather's own effects apply to everyone | `[DECIDED]` |
| W3 | **Rain** cuts both ways: slower travel, but it masks noise and cleanses the survivor | `[DECIDED]` |
| W4 | Rain leaves a **Drenched** affliction on return, cured by drying at the campfire; left too long it becomes **Chilled** | `[DECIDED]` |
| W5 | **Fog**: fewer encounters, worse scavenging | `[DECIDED]` |
| W6 | **Heat wave**: faster thirst, applies **Overheated**; cured by water and resting in shade | `[DECIDED]` |
| W7 | **Blizzard**: heavy slowdown, applies **Chilled** directly — but zombies are slowed too, making it a window for risky runs | `[DECIDED]` |
| W8 | Being Drenched **shows in Wandering**: dripping water, then drying beside the campfire | `[DECIDED]` |
| W9 | "Open Opportunities" must say **what to do and how long is left**, not vague hints | `[DECIDED]` |
| W10 | Panel order: **NOW → EFFECTS → OPPORTUNITY → FORECAST** | `[DECIDED]` |
| W11 | The **route-planning screen** gets a compact weather line, so routes are chosen with weather known | `[DECIDED]` |
| W12 | Weather icons do not match the retro style and need regenerating | `[DECIDED]` |

## 3. Conflicts — all resolved (Sam, Oct 30, voice)

### 3.1 Calendar `[DECIDED Sam]`
The calendar **stays at 364 days** (`ZI.getCalendar`, `game/core.js:111`). Years roll over
continuously; the game does not end. **Seasons are 4 x 91 game days**, cycling every year.

**The 240-day figure was a unit mix-up, now settled.** It is **real-world days to reach level 100**,
not campaign length. At 1 game day = 24 real minutes (CLOCK-01):

| | |
|---|---|
| 1 game hour | 1 real minute |
| 1 game day | 24 real minutes |
| 1 season (91 game days) | ~1.5 real days |
| 1 game year (364 game days) | ~6.1 real days |
| 240 real days to L100 | **~39.5 game years** |

So a player sees the seasons cycle roughly 40 times on the way to level 100. Weather is a
short-term texture, not a campaign arc — which is what makes the duration cap below matter.

### 3.2 Afflictions `[DECIDED Sam]`
**Build on the existing ladder, do not replace it.** `ZI.MOODLES.Wet`
(Damp → Wet → Soaked → **Drenched**) stays as the rain affliction, and **Chilled extends that same
ladder** rather than becoming a separate status. There is **no new DRENCHED status**. Overheated
pairs with the existing `ZI.MOODLES.Thirsty`.

This closes the duplicate-systems risk: one ladder, not two.

### 3.3 AcidRain and RadiationStorm `[DECIDED Sam]`
**Kept.** They stay in `ZI.WEATHER_EFFECTS`. Whether they are seasonal or biome-driven goes to the
audit (§4).

## 4. `[PROPOSED]` values for the audit
Claude's placeholders; each belongs in a named constant.

- Season weights — Spring: Clear 30 / Rain 40 / Fog 30 · Summer: Clear 60 / Heat Wave 30 / Rain 10 ·
  Autumn: Clear 30 / Fog 35 / Rain 30 / Blizzard 5 · Winter: Clear 20 / Blizzard 50 / Rain 30.
  `[AUDIT]` These must be **re-expressed for 91-day seasons** and must **assign AcidRain and
  RadiationStorm** a home (seasonal or biome-based).
- **Weather duration `[DECIDED Sam]`:** varies by season, with a **hard cap of 4 game days**.
  Because 1 game hour = 1 real minute, that cap is **96 game hours = 96 real minutes** either way.
  When an event reaches the cap the weather is **forced to change**, so it can never rain
  indefinitely. Rolled deterministically from save seed + day.
- **Clear-sky guarantee `[DECIDED Sam, Oct 30]`:** after **48 consecutive game hours** of bad
  weather, the next event is **forced Clear**. The 96-hour cap only limits a single event; audit
  pass 1 found different bad weathers chaining for **621 game hours** (about 10.4 real hours) in
  winter, every event individually legal. This closes that.
- `[AUDIT]` Per-season min/max ranges, as named constants —
  `ZI.WEATHER_DURATION[season] = { minH, maxH }` with `maxH <= 96` enforced. A winter blizzard
  should be able to run long while summer rain stays short.
- Rain travel −15%, noise −1 (PF13 0–4 scale, floor 0)
- Fog encounters −20%, scavenge −15%
- Heat wave thirst drain +50%
- Blizzard travel −35%, zombie attack speed −20%
- Drenched hpRegen −25%, attackSpeed −10%; escalates to Chilled after 6 in-game hours
- Chilled hpRegen −40%, attackSpeed −20%, moveSpeed −10%
- Overheated hpRegen −25%, damage −10%
- Forecast window: current weather at 0 Insight, +2 in-game hours per Insight point

## 5. Art
- Drips and steam are **code-drawn particles** over the existing sprite — no new art (WX-01 B5).
- The **sitting / warming-hands pose is new art**, queued at
  `tools/art-gen/prompts/campfire-dry-off.md`. Until it exists, reuse the idle pose beside the fire.
- Weather and affliction icons queued at `tools/art-gen/prompts/weather-icons.md` and
  `affliction-icons.md`. The affliction prompt carries the §3.2 flag.

## 6. Audit checklist

Carried forward to the systems audit. Everything here is a number or rule nobody has validated yet.

- [ ] Per-season duration ranges (Spring / Summer / Autumn / Winter), each within the 4-game-day cap
- [ ] Forced-change rule: the roll after a capped event **must not repeat that weather**
- [ ] Whether AcidRain and RadiationStorm are seasonal weathers or biome hazards
- [ ] Forecast window per Insight point, checked against the 4-day cap — a window longer than the
      cap would show weather that has not been rolled yet
- [ ] Season weights re-expressed for 91-day seasons, with the two extra weathers assigned
- [ ] Chilled's thresholds on the Wet ladder: which rung triggers it, and the cure time at the fire
- [ ] Every weather modifier verified to change a **computed** stat, not just panel text
