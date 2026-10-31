"""AUD-01b re-run 3 — Elemental Resistance.

Replaces flat damage reduction (STAT-03 Addendum C5, Sam, Oct 30). One resistance
covers all elements; armor stays the physical percentage reducer.

The point of the swap: flat DR subtracted from EVERY hit, so weak attackers were
hurt disproportionately and low tiers went trivial. Resistance only touches
elemental damage, so a plain physical zombie is unaffected at any level - the
trivialisation problem cannot recur by construction.

Elemental attackers are tagged from the live bestiary's names, traits and
abilities.
"""
from __future__ import annotations
import re

RANKS_TO_CAP = 30
RES_CAP = 0.50               # [PROPOSED] 50% at rank 30, linear
ARMOR_CAP = 0.40

ELEM_WORDS = ['toxic', 'acid', 'shock', 'electric', 'elect', 'freeze', 'frost', 'cryo',
              'radiation', 'radio', 'poison', 'corros', 'venom', 'burn', 'fire',
              'incend', 'thermite', 'napalm']
TIERS = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'BOSS']


def load_bestiary(path='bestiary-data.js'):
    s = open(path, encoding='utf-8').read()
    rows = re.findall(r"\{ id:(\d+), name:'(.*?)', tier:'([A-Z]+)',(.*?)\},", s)
    out = []
    for _id, name, tier, rest in rows:
        m = re.search(r'dmg:(\d+)', rest)
        if not m:
            continue
        txt = (name + ' ' + rest).lower()
        out.append({'name': name, 'tier': tier, 'dmg': int(m.group(1)),
                    'elemental': any(w in txt for w in ELEM_WORDS)})
    return out


def ranks_at(level: int) -> int:
    return min(RANKS_TO_CAP, int((level - 1) * 0.30))


def resistance(ranks: int) -> float:
    return RES_CAP * (ranks / RANKS_TO_CAP)


def armor_at(level: int) -> float:
    return min(ARMOR_CAP, ARMOR_CAP * (ranks_at(level) / RANKS_TO_CAP))


def taken(z, level: int) -> float:
    d = z['dmg'] * (1 - armor_at(level))
    if z['elemental']:
        d *= (1 - resistance(ranks_at(level)))
    return d


def main() -> None:
    b = load_bestiary()
    print(f'AUD-01b re-run 3 — Elemental Resistance (cap {RES_CAP:.0%} over {RANKS_TO_CAP} ranks)\n')
    print('Elemental attackers in the live bestiary:')
    for t in TIERS:
        ts = [z for z in b if z['tier'] == t]
        if not ts:
            continue
        e = [z for z in ts if z['elemental']]
        print(f'  {t:<5} {len(e):>2} of {len(ts):>2} elemental'
              + (f"   e.g. {e[0]['name']}" if e else '   (physical only)'))

    print(f'\nDamage taken, elemental vs physical, by tier and level')
    print(f'{"tier":>6}{"kind":>11}' + ''.join(f'{f"L{L}":>9}' for L in (10, 40, 80)))
    phys_changed = []
    elem_at_cap = {}
    for t in TIERS:
        ts = [z for z in b if z['tier'] == t]
        if not ts:
            continue
        for kind, sel in (('elemental', True), ('physical', False)):
            g = [z for z in ts if z['elemental'] == sel]
            if not g:
                continue
            row = f'{t:>6}{kind:>11}'
            for L in (10, 40, 80):
                v = sum(taken(z, L) for z in g) / len(g)
                row += f'{v:>9.1f}'
            print(row)
            if not sel:
                raw = sum(z['dmg'] for z in g) / len(g)
                only_armor = raw * (1 - armor_at(80))
                got = sum(taken(z, 80) for z in g) / len(g)
                phys_changed.append(abs(got - only_armor) > 1e-9)
            else:
                raw = sum(z['dmg'] for z in g) / len(g)
                got = sum(taken(z, 80) for z in g) / len(g)
                elem_at_cap[t] = got / (raw * (1 - armor_at(80)))

    print('\n--- FAIL CHECK 1: physical-only tiers must be untouched by resistance ---')
    print(f'  {"FAIL" if any(phys_changed) else "PASS"} — resistance never applied to a physical attacker')

    # The instruction's check: FAIL if an elemental tier takes LESS than 50% of its
    # damage, i.e. resistance is over-strong. 50% resistance floors it at exactly 50%.
    print('\n--- FAIL CHECK 2: elemental damage must not drop below 50% of post-armor ---')
    low = min(elem_at_cap.values())
    for t, v in sorted(elem_at_cap.items()):
        print(f'  {t:<5} takes {v:.0%} of its post-armor damage')
    print(f'  lowest {low:.0%}  -> {"PASS" if low >= 0.5 - 1e-9 else "FAIL (resistance too strong)"}')
    full = 1 - RES_CAP
    print(f'  at a full 30 ranks it would be exactly {full:.0%} -> '
          f'{"PASS" if full >= 0.5 - 1e-9 else "FAIL"} (the cap is the floor, by design)')

    print('\n--- the trivialisation test that killed flat DR ---')
    HP = 150
    f_phys = [z for z in b if z['tier'] == 'F' and not z['elemental']]
    f_elem = [z for z in b if z['tier'] == 'F' and z['elemental']]
    for label, g in (('F physical', f_phys), ('F elemental', f_elem)):
        if not g:
            print(f'  {label}: none in the bestiary')
            continue
        raw = HP / (sum(z['dmg'] for z in g) / len(g))
        l80 = HP / (sum(taken(z, 80) for z in g) / len(g))
        print(f'  {label}: {raw:.1f} raw hits -> {l80:.1f} at L80  '
              f'(flat DR gave 174.4; armor alone gives {raw/(1-armor_at(80)):.1f})')


if __name__ == '__main__':
    main()
