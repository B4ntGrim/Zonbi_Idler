"""AUD-01 pass 2 — progression convergence.

Sam's Oct 30 decisions (STAT-03 Addendum B):
  8 attributes, cap 13 each. 1 point per level L2-L100 = 99, plus 5 milestone
  points at L20/35/50/70/85 = 104 total. 8 x 13 = 104, so every build converges
  at L100 and the differentiation is the ORDER points are taken in.
  24 ranked stats, 3 per attribute (shield removed, flat DR in its slot).
  Rank gate: rankCap = min(30, 2 x attribute)  [STAT-03 Addendum A3].
"""
from __future__ import annotations

ATTRS = ['S', 'U', 'R', 'V', 'I', 'V2', 'A', 'L']
CAP = 10                 # [DECIDED Sam, Addendum C] 8 x 10 = 80
MILESTONES = [50]        # [PROPOSED] one point, to make L2-L80 total exactly 80
MAXL = 80                # launch ceiling; design max stays 100
RANKS_TO_CAP = 30
GATE = 3          # [DECIDED Sam] attribute 10 -> rank 30 exactly


def points_by(level: int) -> int:
    """Attribute points available having reached `level`."""
    return (level - 1) + sum(1 for m in MILESTONES if level >= m)


def spend(level: int, order):
    """Allocate every available point following `order`, respecting the cap."""
    pts = points_by(level)
    a = {k: 0 for k in ATTRS}
    i = 0
    while pts > 0:
        k = order[i % len(order)]
        if a[k] < CAP:
            a[k] += 1
            pts -= 1
        elif all(a[x] >= CAP for x in ATTRS):
            break
        i += 1
    return a


def power(a: dict) -> float:
    """Crude build power: unlocked rank headroom across the 3 stats each attribute
    owns, capped at 30 per stat. Enough to compare shapes, not to tune numbers."""
    return sum(min(RANKS_TO_CAP, GATE * v) * 3 for v in a.values())


FOCUSED = ['V', 'V2', 'R', 'S', 'U', 'A', 'I', 'L']   # two at a time, in order
EVEN = ATTRS                                           # round-robin


def focused_order():
    o = []
    for k in FOCUSED:
        o += [k] * CAP
    return o


def main() -> None:
    print('AUD-01 pass 2 — progression\n')
    print(f'points at L100: {points_by(MAXL)}  (99 levels + {len(MILESTONES)} milestones)')
    print(f'needed to cap all: {len(ATTRS)} x {CAP} = {len(ATTRS)*CAP}')
    print(f'convergence: {"PASS" if points_by(MAXL) == len(ATTRS)*CAP else "FAIL"}\n')

    print('--- does every build land in the same place at L100? ---')
    f = spend(MAXL, focused_order())
    e = spend(MAXL, EVEN)
    print(f'focused: {f}')
    print(f'even   : {e}')
    print(f'identical at L100: {"PASS" if f == e else "FAIL"}\n')

    print('--- how different do the two feel on the way there? ---')
    print(f'{"level":>6}{"points":>8}{"focused power":>15}{"even power":>12}{"gap":>8}'
          f'{"focused capped attrs":>22}')
    for L in (10, 25, 50, 75, 90, 100):
        fo, ev = spend(L, focused_order()), spend(L, EVEN)
        pf, pe = power(fo), power(ev)
        gap = 100 * (pf - pe) / pe if pe else 0
        capped = sum(1 for v in fo.values() if v >= CAP)
        print(f'{L:>6}{points_by(L):>8}{pf:>15}{pe:>12}{gap:>7.1f}%{capped:>22}')

    print('\n--- first attribute capped (focused build) ---')
    for L in range(2, MAXL + 1):
        if any(v >= CAP for v in spend(L, focused_order()).values()):
            print(f'  L{L}: first attribute reaches {CAP}')
            break

    print('\n--- dead level bands (a level that grants nothing new) ---')
    dead = []
    prev = None
    for L in range(2, MAXL + 1):
        cur = spend(L, EVEN)
        if prev is not None and cur == prev:
            dead.append(L)
        prev = cur
    print(f'  levels granting no new point: {dead if dead else "none"}')

    print('\n--- VIT-01 max-HP runaway under the new structure ---')
    for v in (0, 4, 8, 13):
        rc = min(RANKS_TO_CAP, GATE * v)
        print(f'  Vitality {v:>2} -> maxHp rank cap {rc:>2} of {RANKS_TO_CAP} '
              f'({"gated" if rc < RANKS_TO_CAP else "ungated"})')
    print()
    print('--- FAIL CHECK: can every stat reach rank 30 at the launch cap? ---')
    final = spend(MAXL, EVEN)
    worst = min(min(RANKS_TO_CAP, GATE * v) for v in final.values())
    print(f'  lowest rankCap across all 8 attributes at L{MAXL}: {worst} of {RANKS_TO_CAP}'
          f'  -> {"PASS" if worst >= RANKS_TO_CAP else "FAIL"}')
    print()
    print('--- attributes fully unlocked (rank 30 reachable) on the way up ---')
    print(f'{"level":>6}{"focused":>10}{"even":>8}')
    for L in (20, 40, 60, MAXL):
        fo, ev2 = spend(L, focused_order()), spend(L, EVEN)
        uf = sum(1 for v in fo.values() if GATE * v >= RANKS_TO_CAP)
        ue = sum(1 for v in ev2.values() if GATE * v >= RANKS_TO_CAP)
        print(f'{L:>6}{uf:>10}{ue:>8}')


if __name__ == '__main__':
    main()
