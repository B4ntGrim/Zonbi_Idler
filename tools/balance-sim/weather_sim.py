"""AUD-01 pass 1 — clock and weather.

Inputs are Sam's Oct 30 decisions (WX-01 §3):
  364-day year, 4 x 91-day seasons, 1 game hour = 1 real minute,
  hard cap 96 game hours (4 game days), forced change at the cap (no repeat),
  rolled deterministically from save seed + day.

Everything this prints is [PROPOSED] for the audit. Run: python3 weather_sim.py
"""
from __future__ import annotations
import statistics, hashlib

YEAR_DAYS, SEASON_DAYS = 364, 91
CAP_H = 96                      # 4 game days; also 96 real minutes
SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter']

# WX-01 §4 weights, re-expressed for 91-day seasons, with AcidRain and
# RadiationStorm given a home (see the rationale printed at the end).
WEIGHTS = {
    'Spring': {'Clear': 30, 'Rain': 38, 'Fog': 28, 'AcidRain': 4},
    'Summer': {'Clear': 58, 'HeatWave': 30, 'Rain': 9, 'RadiationStorm': 3},
    'Autumn': {'Clear': 28, 'Fog': 34, 'Rain': 29, 'Blizzard': 5, 'AcidRain': 4},
    'Winter': {'Clear': 19, 'Blizzard': 49, 'Rain': 29, 'RadiationStorm': 3},
}

# [PROPOSED] per-season duration ranges in game hours. maxH <= CAP_H enforced.
# Winter runs long (a blizzard should feel like it settles in); summer is short
# and changeable; the two hazard weathers are deliberately brief everywhere.
DURATION = {
    'Spring': {'minH': 4,  'maxH': 36},
    'Summer': {'minH': 3,  'maxH': 28},
    'Autumn': {'minH': 6,  'maxH': 48},
    'Winter': {'minH': 10, 'maxH': 96},
}
HAZARD_MAX_H = 8                 # AcidRain / RadiationStorm never run long
HAZARDS = {'AcidRain', 'RadiationStorm'}
BAD = {'Rain', 'Fog', 'HeatWave', 'Blizzard', 'AcidRain', 'RadiationStorm'}


def season_of(day: int) -> str:
    return SEASONS[((day - 1) % YEAR_DAYS) // SEASON_DAYS]


def rand01(seed: int, day: int, salt: str) -> float:
    """Deterministic from seed + day, so offline settling matches live play."""
    h = hashlib.sha256(f'{seed}:{day}:{salt}'.encode()).hexdigest()
    return int(h[:8], 16) / 0xFFFFFFFF


def roll(seed: int, years: float = 6.0):
    """Walk the calendar in game hours, emitting (season, weather, hours)."""
    events, hour, idx, prev = [], 0, 0, None
    total_h = int(YEAR_DAYS * 24 * years)
    while hour < total_h:
        day = hour // 24 + 1
        s = season_of(day)
        w = dict(WEIGHTS[s])
        if prev is not None:
            w.pop(prev, None)          # forced change: never repeat
        keys = sorted(w)
        tot = sum(w[k] for k in keys)
        r = rand01(seed, idx, 'w') * tot
        acc = 0.0
        pick = keys[-1]
        for k in keys:
            acc += w[k]
            if r <= acc:
                pick = k
                break
        d = DURATION[s]
        hi = min(d['maxH'], HAZARD_MAX_H if pick in HAZARDS else d['maxH'])
        lo = min(d['minH'], hi)
        dur = int(lo + rand01(seed, idx, 'd') * (hi - lo))
        dur = max(1, min(dur, CAP_H))
        events.append((s, pick, dur, dur >= CAP_H))
        hour += dur
        idx += 1
        prev = pick
    return events


def main() -> None:
    ev = roll(seed=1337, years=6.0)
    print(f'AUD-01 pass 1 — {len(ev)} events over 6 game years '
          f'(~36 real days at 1 game day = 24 real min)\n')
    print(f'{"season":<8}{"weather":<16}{"share":>8}{"mean h":>9}{"p95 h":>8}{"events":>8}')
    for s in SEASONS:
        se = [e for e in ev if e[0] == s]
        tot = sum(e[2] for e in se)
        for w in sorted({e[1] for e in se}):
            we = [e[2] for e in se if e[1] == w]
            p95 = sorted(we)[int(len(we) * 0.95)] if len(we) > 1 else we[0]
            print(f'{s:<8}{w:<16}{100*sum(we)/tot:>7.1f}%{statistics.mean(we):>9.1f}{p95:>8}{len(we):>8}')
        print()

    caps = sum(1 for e in ev if e[3])
    print(f'cap fired (event hit 96h): {caps} of {len(ev)}  ({100*caps/len(ev):.2f}%)')

    # longest unbroken run of bad weather, in game hours
    worst, cur, worst_s = 0, 0, ''
    for s, w, d, _ in ev:
        if w in BAD:
            cur += d
            if cur > worst:
                worst, worst_s = cur, s
        else:
            cur = 0
    print(f'longest unbroken bad weather: {worst}h ({worst/24:.1f} game days, '
          f'{worst} real minutes) ending in {worst_s}')

    reps = sum(1 for a, b in zip(ev, ev[1:]) if a[1] == b[1])
    print(f'consecutive repeats (must be 0): {reps}')

    mx = max(e[2] for e in ev)
    print(f'longest single event: {mx}h  (cap {CAP_H}h) -> {"OK" if mx <= CAP_H else "BREACH"}')

    print('\n--- forecast window check ---')
    mean_ev = statistics.mean(e[2] for e in ev)
    print(f'mean event length {mean_ev:.1f}h. Insight at +2h/point reaches '
          f'{2*13}h at the cap of 13 -> about {26/mean_ev:.1f} events ahead.')
    print('A 26h window can outrun what has been rolled, so pre-roll is required:')
    print('  [PROPOSED] keep a rolling buffer of the next 3 events always rolled,')
    print('  and clamp the visible forecast to min(2 x Insight, buffer end).')

    print('\n--- hazard weather home [PROPOSED] ---')
    print('AcidRain  -> seasonal, Spring and Autumn (wet seasons), max 8h.')
    print('RadiationStorm -> seasonal, Summer and Winter, max 8h.')
    print('Rationale: both already exist in ZI.WEATHER_EFFECTS and need no new art or')
    print('rules. Keeping them seasonal (not biome) means one weather system, not two,')
    print('and an 8h ceiling keeps a hazard an event rather than a condition.')

    print('\n--- Chilled trigger [PROPOSED] ---')
    print('Chilled fires from the SOAKED rung of ZI.MOODLES.Wet, not Drenched.')
    print('Wet coldBuildupRate is [0.5, 1.5, 3.0, 5.0]/hour; Soaked at 3.0/h is where')
    print('cold accrues faster than a survivor shrugs off. Drenched would make Chilled')
    print('nearly unreachable except in a blizzard. Campfire cure [PROPOSED] 2 game hours.')


if __name__ == '__main__':
    main()
