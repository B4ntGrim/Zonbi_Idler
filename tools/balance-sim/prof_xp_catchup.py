"""PROF-01 — Profession XP catch-up, modelled before anything is built.

Source: "Zed Idler - Character Creation Instructions (Draft)", Oct 28, section
"Profession XP Catch-Up - Balance Audit Pending". Provisional values:
  - max bonus rate            +15% to XP earned in that profession
  - boosted allowance          25% of the base XP to that profession's next level,
                               measured when the allowance begins
  - decay                      bonus rate fades as the allowance is consumed
  - independence               each of the 16 professions accrues its own
  - protection                 XP and mastery never decrease

The doc leaves accumulation timing unspecified, so that is the free parameter
this model sweeps. Everything else follows the doc.
"""
import math, random

LEVEL_CURVE_K = 1.5          # mirrors ZI STAT-02 curveK
BASE_XP_L1    = 100

# AUD-01 pass 4 — Sam's Oct 30 decisions
ACCRUAL_DAYS  = 2            # P2: was 3; 2 catches the weekend player
ALLOWANCE     = 0.50         # P4: was 0.25
AWAY_CAP_DAYS = 14           # P5: allowance scales with days away up to this
MAX_RATE      = 0.15         # unchanged

def xp_to_next(level):
    """Base XP required for `level` -> `level+1`."""
    return BASE_XP_L1 * (level ** LEVEL_CURVE_K)

class Profession:
    def __init__(self, name, level=1):
        self.name, self.level, self.xp = name, level, 0.0
        self.idle_days = 0.0
        self.allowance = 0.0      # base XP still eligible for boosting
        self.allowance_cap = 0.0  # what it was when it opened
        self.boost_earned = 0.0   # bonus XP actually granted (for audit)
        self.base_earned = 0.0

    def tick_idle(self, days, accrual_days=ACCRUAL_DAYS):
        """No qualifying activity: accrue toward the allowance.

        AUD-01 pass 4 (Sam, Oct 30): threshold is 2 days, and the allowance is
        ALLOWANCE x level-1 XP - flat, not a share of the current level's
        requirement - so the bonus lands hardest relative to a neglected
        low-level profession instead of a high-level one."""
        self.idle_days += days
        if self.idle_days >= accrual_days:
            # P5: scale with how long they were away, capped at AWAY_CAP_DAYS.
            scale = min(self.idle_days, AWAY_CAP_DAYS) / AWAY_CAP_DAYS
            cap = ALLOWANCE * xp_to_next(1) * scale
            self.allowance = self.allowance_cap = cap

    def rate(self):
        """Bonus rate now: max MAX_RATE, fading linearly as the allowance is spent."""
        if self.allowance <= 0 or self.allowance_cap <= 0:
            return 0.0
        return MAX_RATE * (self.allowance / self.allowance_cap)

    def earn(self, base_xp):
        self.idle_days = 0.0
        granted = 0.0
        remaining = base_xp
        # consume the allowance in small steps so the rate decays continuously
        while remaining > 0:
            step = min(remaining, max(1e-6, self.allowance_cap / 50) if self.allowance > 0 else remaining)
            granted += step * self.rate()
            if self.allowance > 0:
                self.allowance = max(0.0, self.allowance - step)
            remaining -= step
        self.base_earned += base_xp
        self.boost_earned += granted
        self.xp += base_xp + granted
        while self.xp >= xp_to_next(self.level):
            self.xp -= xp_to_next(self.level); self.level += 1
        return granted

def run(days, level, pattern, accrual_days=ACCRUAL_DAYS, xp_per_active_day=40.0):
    p = Profession('test', level)
    for d in range(days):
        if pattern(d):
            p.earn(xp_per_active_day)
        else:
            p.tick_idle(1.0, accrual_days)
    return p

def pct(a, b):
    return 0.0 if b == 0 else 100.0 * a / b

if __name__ == '__main__':
    DAYS = 120
    print(f"PROF-01 catch-up model — {DAYS} game days, 40 base XP per active day\n")
    print("Q1. Does deliberate inactivity beat consistent practice?")
    print(f"{'level':>6}{'accrual':>9}{'pattern':>22}{'active days':>13}{'end level':>11}{'total XP':>11}{'bonus XP':>10}{'bonus %':>9}")
    patterns = [
        ('always active',        lambda d: True),
        ('5 on / 2 off',         lambda d: d % 7 < 5),
        ('10 on / 10 off',       lambda d: (d // 10) % 2 == 0),
        ('30 off then active',   lambda d: d >= 30),
    ]
    for level in (1, 8, 20):
        for accrual in (3, 7):
            for name, fn in patterns:
                p = run(DAYS, level, fn, accrual)
                active = sum(1 for d in range(DAYS) if fn(d))
                print(f"{level:>6}{accrual:>9}{name:>22}{active:>13}{p.level:>11}"
                      f"{p.base_earned + p.boost_earned:>11.0f}{p.boost_earned:>10.1f}"
                      f"{pct(p.boost_earned, p.base_earned):>8.2f}%")
        print()

def sweep():
    """Finding: at the doc's 15%/25%/3-day values the mechanic is nearly inert for
    ordinary play. Sweep accrual threshold and max rate to find where it bites."""
    DAYS = 120
    print("\nQ2. Where does the mechanic stop being inert? (level 8, 120 days)")
    print("    'weekend' = 5 on / 2 off — the commonest real pattern")
    print(f"{'accrual d':>10}{'max rate':>10}{'weekend bonus%':>16}{'10/10 bonus%':>14}{'30-off bonus%':>15}{'idle beats active?':>20}")
    import copy
    for accrual in (1, 2, 3, 5, 7):
        for maxrate in (0.15, 0.30, 0.50):
            global _MAX
            res = {}
            for nm, fn in [('weekend', lambda d: d % 7 < 5),
                           ('tenten',  lambda d: (d // 10) % 2 == 0),
                           ('thirty',  lambda d: d >= 30)]:
                p = Profession('t', 8)
                for d in range(DAYS):
                    if fn(d):
                        # temporarily scale the rate ceiling
                        orig = Profession.rate
                        p.earn(40.0 * 1.0)
                    else:
                        p.tick_idle(1.0, accrual)
                res[nm] = (pct(p.boost_earned, p.base_earned), p.base_earned + p.boost_earned)
            always = run(DAYS, 8, lambda d: True, accrual)
            beats = res['tenten'][1] > (always.base_earned + always.boost_earned)
            print(f"{accrual:>10}{maxrate:>10.0%}{res['weekend'][0]:>15.2f}%"
                  f"{res['tenten'][0]:>13.2f}%{res['thirty'][0]:>14.2f}%{str(beats):>20}")
            break  # rate ceiling is fixed at 15% inside rate(); see note
    print("\n  note: rate() hard-codes the doc's 15% ceiling, so only the accrual")
    print("  threshold varies here. A ceiling sweep needs that value parameterised.")

if __name__ == '__main__':
    sweep()

def pass4():
    """AUD-01 pass 4 — re-run under Sam's decisions. FAIL if any intermittent
    pattern finishes ahead of always-active."""
    DAYS = 120
    pats = [('always active',      lambda d: True),
            ('5 on / 2 off',       lambda d: d % 7 < 5),
            ('10 on / 10 off',     lambda d: (d // 10) % 2 == 0),
            ('30 days off first',  lambda d: d >= 30)]
    print(f'\n=== AUD-01 PASS 4 — threshold {ACCRUAL_DAYS}d, allowance {ALLOWANCE:.0%} '
          f'of level-1 XP, max rate {MAX_RATE:.0%} ===\n')
    print(f'{"level":>6}{"pattern":>20}{"active":>8}{"end lv":>8}{"total XP":>11}'
          f'{"bonus XP":>10}{"bonus %":>9}')
    fails = []
    for level in (1, 8, 20):
        base = None
        for name, fn in pats:
            p = run(DAYS, level, fn)
            tot = p.base_earned + p.boost_earned
            if name == 'always active':
                base = tot
            elif tot > base:
                fails.append((level, name, tot, base))
            active = sum(1 for d in range(DAYS) if fn(d))
            print(f'{level:>6}{name:>20}{active:>8}{p.level:>8}{tot:>11.0f}'
                  f'{p.boost_earned:>10.1f}{pct(p.boost_earned, p.base_earned):>8.2f}%')
        print()
    print('FAIL CHECK: any intermittent pattern ahead of always-active?')
    print('  ' + ('FAIL ' + str(fails) if fails else 'PASS — always-active wins at every level'))

    print('\nRelative boost by level (should now be LARGEST at low level):')
    for level in (1, 8, 20, 40):
        p = run(DAYS, level, lambda d: d % 7 < 5)
        print(f'  L{level:<3} weekend player: {pct(p.boost_earned, p.base_earned):>5.2f}% bonus')

if __name__ == '__main__':
    pass4()

def pass4b():
    DAYS = 120
    pats = [('always active',  lambda d: True),
            ('5 on / 2 off',   lambda d: d % 7 < 5),
            ('10 on / 10 off', lambda d: (d // 10) % 2 == 0),
            ('14 off first',   lambda d: d >= 14),
            ('30 off first',   lambda d: d >= 30)]
    print(f'\n=== AUD-01b RE-RUN 4 — allowance scales with days away (cap {AWAY_CAP_DAYS}d) ===\n')
    print(f'{"pattern":>18}{"active":>8}{"total XP":>11}{"bonus XP":>10}{"bonus %":>9}')
    base = None; fails = []
    for name, fn in pats:
        p = run(DAYS, 8, fn)
        tot = p.base_earned + p.boost_earned
        if name == 'always active': base = tot
        elif tot > base: fails.append((name, tot, base))
        active = sum(1 for d in range(DAYS) if fn(d))
        print(f'{name:>18}{active:>8}{tot:>11.0f}{p.boost_earned:>10.1f}'
              f'{pct(p.boost_earned, p.base_earned):>8.2f}%')
    print(f'\nFAIL CHECK: intermittent ahead of always-active? '
          f'{"FAIL " + str(fails) if fails else "PASS"}')
    print('\nDoes a long absence now beat a weekend?')
    for days in (2, 5, 14, 30):
        p = Profession('t', 8)
        p.tick_idle(days, ACCRUAL_DAYS)
        print(f'  {days:>2}d away -> allowance {p.allowance_cap:>6.1f} XP')

if __name__ == '__main__':
    pass4b()
