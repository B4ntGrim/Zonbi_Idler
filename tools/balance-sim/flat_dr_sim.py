"""AUD-01 pass 3 — flat damage reduction.

Sam's Oct 30 decision (STAT-03 Addendum B2): shield leaves the rank system and
its slot is taken by FLAT damage reduction, which subtracts a fixed amount per
hit. Armor stays the percentage reducer, so the two must not be one mechanic
twice.

Sam's own concern drives the FAIL conditions: this is an idle game ground
against many zombies, so flat reduction either trivialises low tiers or dies.

Guards under test:
  - minimum damage floor: every hit lands for at least 20% of its damage
  - tier scaling: flat DR is scaled down against higher tiers

Zombie damage means are read from the live bestiary.
"""
from __future__ import annotations

TIER_DMG = {'F': 4.3, 'E': 5.8, 'D': 7.5, 'C': 10.4, 'B': 13.0, 'A': 17.2, 'S': 18.4, 'BOSS': 25.0}
TIERS = list(TIER_DMG)
TIER_RANK = {t: i for i, t in enumerate(TIERS)}

RANKS_TO_CAP = 30
FLOOR = 0.20                 # [PROPOSED] a hit never drops below 20% of its damage
FLAT_PER_RANK = 0.25         # [PROPOSED] flat DR gained per rank
TIER_SCALE = 0.85            # [PROPOSED] flat DR multiplied by this per tier above F
ARMOR_CAP = 0.40             # armor's existing 0-40% band


def ranks_at(level: int) -> int:
    """Ranks a player plausibly has in ONE stat they are investing in."""
    picks = (level - 1)
    return min(RANKS_TO_CAP, int(picks * 0.30))


def flat_dr(ranks: int, tier: str) -> float:
    return FLAT_PER_RANK * ranks * (TIER_SCALE ** TIER_RANK[tier])


def armor_at(level: int) -> float:
    return min(ARMOR_CAP, ARMOR_CAP * (ranks_at(level) / RANKS_TO_CAP))


def hit(dmg: float, ranks: int, tier: str, level: int):
    after_armor = dmg * (1 - armor_at(level))
    after_flat = after_armor - flat_dr(ranks, tier)
    floored = max(dmg * FLOOR, after_flat)
    return floored, floored <= dmg * FLOOR + 1e-9


def main() -> None:
    print('AUD-01 pass 3 — flat damage reduction')
    print(f'  flat {FLAT_PER_RANK}/rank, tier scale {TIER_SCALE}^tier, floor {FLOOR:.0%}\n')
    print(f'{"level":>6}{"ranks":>7}{"armor":>7}  ' + ''.join(f'{t:>12}' for t in TIERS))
    at_floor = {t: [] for t in TIERS}
    mitig_mid = []
    for L in (10, 25, 35, 50, 70, 90, 100):
        r = ranks_at(L)
        row = f'{L:>6}{r:>7}{armor_at(L):>6.0%}  '
        for t in TIERS:
            taken, floored = hit(TIER_DMG[t], r, t, L)
            at_floor[t].append(floored)
            row += f'{taken:>7.1f}{"*" if floored else " ":<5}'
            if 35 <= L <= 70:
                base_after_armor = TIER_DMG[t] * (1 - armor_at(L))
                share = (base_after_armor - taken) / TIER_DMG[t]
                mitig_mid.append(share)
        print(row)
    print('  * = hit landed on the 20% floor\n')

    print('--- FAIL CHECK 1: does any tier become effectively harmless? ---')
    bad = [t for t in TIERS if all(at_floor[t])]
    if bad:
        print(f'  FAIL — always at floor: {bad}')
    else:
        partial = {t: sum(at_floor[t]) for t in TIERS if any(at_floor[t])}
        print(f'  PASS — no tier is always at the floor.')
        print(f'  tiers that touch the floor at some levels: {partial if partial else "none"}')

    print('\n--- FAIL CHECK 2: flat DR mitigation at L35-70 (must be >= 5%) ---')
    m = sum(mitig_mid) / len(mitig_mid)
    print(f'  mean flat-DR contribution across tiers: {m:.1%}  '
          f'{"PASS" if m >= 0.05 else "FAIL"}')

    print('\n--- time to kill, survivor side (how long a tier takes to down you) ---')
    HP = 150
    print(f'{"tier":>6}{"raw hits":>10}{"with DR L50":>14}{"with DR L100":>14}')
    for t in TIERS:
        raw = HP / TIER_DMG[t]
        h50 = HP / hit(TIER_DMG[t], ranks_at(50), t, 50)[0]
        h100 = HP / hit(TIER_DMG[t], ranks_at(100), t, 100)[0]
        print(f'{t:>6}{raw:>10.1f}{h50:>14.1f}{h100:>14.1f}')

    print(f'\n[PROPOSED] constants: FLAT_PER_RANK {FLAT_PER_RANK}, TIER_SCALE {TIER_SCALE}, '
          f'FLOOR {FLOOR:.0%}')


if __name__ == '__main__':
    main()
