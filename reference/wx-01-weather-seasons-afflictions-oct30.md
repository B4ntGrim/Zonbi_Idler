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

## 3. Conflicts to resolve before building

1. **Calendar length.** Sam said a 240-day campaign, 4 seasons × 60 days. `ZI.getCalendar`
   (`game/core.js:111`) runs a **364-day year** and has no season concept anywhere in live code.
   `[OPEN]` Which is canon? Seasons cannot be built until this is settled.
2. **Duplicate afflictions.** Building new `DRENCHED` / `CHILLED` / `OVERHEATED` statuses would sit
   beside `ZI.MOODLES.Wet` and `ZI.MOODLES.Thirsty`, which already model the same ground in more
   detail. `[OPEN]` Extend the moodles, or retire them first? Shipping both is the one outcome to
   avoid.
3. **Two unlisted weathers.** `WEATHER_EFFECTS` has **AcidRain** and **RadiationStorm**, which were
   not in Sam's five. `[OPEN]` Keep, retire, or make them biome-specific hazards?

## 4. `[PROPOSED]` values for the audit
Claude's placeholders; each belongs in a named constant.

- Season weights — Spring: Clear 30 / Rain 40 / Fog 30 · Summer: Clear 60 / Heat Wave 30 / Rain 10 ·
  Autumn: Clear 30 / Fog 35 / Rain 30 / Blizzard 5 · Winter: Clear 20 / Blizzard 50 / Rain 30
- Event duration: 3–24 in-game hours, rolled per event, deterministic from save seed + day
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
