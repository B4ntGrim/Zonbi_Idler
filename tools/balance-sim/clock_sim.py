#!/usr/bin/env python3
"""Zed Idler — CLOCK-01 balance simulator (design harness, Oct 30 2026).

Replaces the lost balance_regen_sim.py. Every earlier BALANCE-03 round modelled
a 'day' as 24 hours of survivor activity. CLOCK-01 makes one game day 24 REAL
minutes (1 game hour = 60 real seconds), so this harness runs on a real-second
tick and derives game days from it.

Does not import or change live game code. Mirrors game/wandering.js (_bgZombie,
resolveEncounter) and game/combat.js (round-based simulateCombat).
"""
import random, math, statistics, re, os, json
try:
    import survivor_stats as SS
except Exception:
    SS = None

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))

# ─── CLOCK-01 ────────────────────────────────────────────────────────────────
REAL_S_PER_GAME_HOUR = 60.0           # game/core.js REAL_MS_PER_GAME_HOUR = 60000
GAME_HOURS_PER_DAY   = 24
REAL_S_PER_GAME_DAY  = REAL_S_PER_GAME_HOUR * GAME_HOURS_PER_DAY   # 1440 s = 24 real min

def game_days(real_s):  return real_s / REAL_S_PER_GAME_DAY
def game_hours(real_s): return real_s / REAL_S_PER_GAME_HOUR

# ─── Survivor (recorded values) ──────────────────────────────────────────────
MAX_HP            = 100      # FX1 / round 8
DOWNED_AT         = 1        # FX1 U5
RETREAT_AT_PCT    = 30       # U27
RESUME_AT_PCT     = 80       # round 8 resume gate
HIT_DAMAGE        = 20       # calibrated: reproduces recorded T0 6.9 / T1 13.5 dmg per fight
ZOMBIE_ACCURACY   = 0.70     # combat-balance-investigation-oct17 preferred scenario
SURVIVOR_ARMOR    = 0        # starting gear
FIGHT_REAL_S      = 4.0      # round 8 assumption
MOVE_SPEED_MPS    = 1.4      # wandering.js _move default
ESCAPE_RATE       = 0.10     # policy evades; ethical policy, rough

# ─── Currency drops (Sam, Oct 30) ────────────────────────────────────────────
# BOSS is displayed as "SS" (world.js tierLabelShort) — one tier, not two.
CURRENCY = {'F':(1,1),'E':(1,1),'D':(1,1),'C':(1,2),'B':(1,2),'A':(1,3),'S':(1,4),'BOSS':(2,5)}
TIER_RANK = {'F':0,'E':1,'D':2,'C':3,'B':4,'A':5,'S':6,'BOSS':7}

def load_bestiary():
    src = open(os.path.join(ROOT,'bestiary-data.js'), encoding='utf-8', errors='replace').read()
    rows = re.findall(r"\{ id:(\d+), name:'([^']+)', tier:'([A-Z]+)'.*?hp:(\d+), dmg:(\d+), spd:([\d.]+), armor:(\d+), xp:(\d+)", src)
    return [{'id':int(i),'name':n,'tier':t,'hp':int(hp),'dmg':int(d),'armor':int(a),'xp':int(x)}
            for i,n,t,hp,d,sp,a,x in rows]

BESTIARY = load_bestiary()

TIER_DIVISOR = 1.5   # live value (wandering.js _bgZombie: rank <= floor(lap/1.5))

def drawable(scroll_m, lap_boost=0, divisor=None):
    lap = math.floor(scroll_m/100) + lap_boost
    cap = min(7, math.floor(lap/(divisor or TIER_DIVISOR)))
    return [z for z in BESTIARY if TIER_RANK[z['tier']] <= cap]

def fight(z, hp, rng, sb=None):
    """Round-based, mirrors combat.js: both sides act each round.
    With a StatBlock, damage output and resistance come from the stat framework."""
    if sb is None:
        per_hit = max(1, HIT_DAMAGE - z['armor'])
        rounds  = math.ceil(z['hp'] / per_hit)
        taken   = 0
        for _ in range(rounds):
            if rng.random() < ZOMBIE_ACCURACY:
                taken += max(1, z['dmg'] - SURVIVOR_ARMOR)
            if hp - taken <= DOWNED_AT: break
        return taken, rounds
    per_hit = max(1.0, sb.damage_per_hit() - z['armor']) * sb.attack_speed()
    rounds  = math.ceil(z['hp'] / per_hit)
    taken   = 0.0
    for _ in range(rounds):
        if rng.random() < ZOMBIE_ACCURACY:
            taken += sb.incoming(max(1, z['dmg']))
        if hp - taken <= DOWNED_AT: break
    return taken, rounds

def run(interval_s, regen_pct_per_min, horizon_real_s, seed=0, rest=True, divisor=None, sb=None):
    """One continuous field session. regen applies out of combat."""
    rng = random.Random(seed)
    max_hp = sb.max_hp() if sb else MAX_HP
    regen  = sb.hp_regen_per_min() if sb else regen_pct_per_min
    speed  = sb.move_speed() if sb else MOVE_SPEED_MPS
    hp, scroll, t = max_hp, 0.0, 0.0
    kills = deaths = escapes = retreats = 0
    currency = 0
    first_stop = None           # real s to first forced retreat / retreat-to-base
    per_day = {}
    resting = False
    while t < horizon_real_s:
        if resting:
            # rest at base: WANDER_REST_TABLE restHpPerMinutePct = 5
            need = (max_hp*RESUME_AT_PCT/100) - hp
            rest_s = max(0.0, need / (max_hp*0.05/60.0))
            t += rest_s; hp = max_hp*RESUME_AT_PCT/100; resting = False
            continue
        gap = interval_s
        t += gap; scroll += speed*gap
        hp = min(max_hp, hp + max_hp*(regen/100.0)*(gap/60.0))
        pool = drawable(scroll, divisor=divisor)
        if not pool: continue
        z = pool[rng.randrange(len(pool))]
        if rng.random() < ESCAPE_RATE:
            escapes += 1; continue
        taken, rounds = fight(z, hp, rng, sb)
        t += FIGHT_REAL_S; scroll += speed*FIGHT_REAL_S
        hp -= taken
        d = int(game_days(t))
        if hp <= DOWNED_AT:
            deaths += 1
            if first_stop is None: first_stop = t
            if not rest: break
            hp = max_hp*RESUME_AT_PCT/100; resting = False; continue
        kills += 1
        lo,hi = CURRENCY[z['tier']]
        got = rng.randint(lo,hi)
        if sb:
            got = int(round(got * sb.rmat_mult()))
            if rng.random() < sb.rmat_extra_chance(): got += 1
        currency += got
        per_day.setdefault(d, {'kills':0,'cur':0})
        per_day[d]['kills'] += 1; per_day[d]['cur'] += got
        if hp < max_hp*RETREAT_AT_PCT/100:
            retreats += 1
            if first_stop is None: first_stop = t
            if rest: resting = True
            else: break
    hours = t/3600.0
    return {'real_s':t,'game_days':game_days(t),'kills':kills,'currency':currency,
            'deaths':deaths,'escapes':escapes,'retreats':retreats,
            'kills_per_real_h':kills/hours if hours else 0,
            'cur_per_real_h':currency/hours if hours else 0,
            'first_stop_game_days':game_days(first_stop) if first_stop else None,
            'per_day':per_day}

def mean(xs): return statistics.mean(xs) if xs else 0.0
