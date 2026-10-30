#!/usr/bin/env python3
"""Zed Idler — survivor stat framework for the balance harness (Oct 30 2026).

Reads the LIVE definitions out of the game source so the harness can never drift
from them:
  game/core.js        ZI.SURVIVAL_ATTRS (the SURVIVAL acronym)  + ZI.CLASSES
  game/stats.js       ZI.PROFESSIONS (16 tracks) + ZI.ACTION_XP
  game/progression.js ZI.PROG.STATS (STAT-02: 10 stats, hidden ranks)

Produces one StatBlock: damage output, damage resistance, and the utility
bonuses (move speed, XP %, RMAT currency, luck).
"""
import re, os, math

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
def _src(p): return open(os.path.join(ROOT, p), encoding='utf-8', errors='replace').read()

# ─── Live definitions ────────────────────────────────────────────────────────
def survival_attrs():
    s = _src('game/core.js')
    blk = s.split('ZI.SURVIVAL_ATTRS = [')[1].split('];')[0]
    return [{'key':k,'name':n,'desc':d} for k,n,d in
            re.findall(r"key: '([^']+)', name: '([^']+)',\s*desc: '([^']+)'", blk)]

def classes():
    s = _src('game/core.js')
    blk = s.split('ZI.CLASSES = [')[1].split('\n];')[0]
    out=[]
    for m in re.finditer(r"id: '([^']+)',\s*name: '([^']+)',\s*tier: '([^']+)'.*?primary: \[([^\]]+)\].*?masteryLevel: (\d+)", blk, re.S):
        out.append({'id':m.group(1),'name':m.group(2),'tier':m.group(3),
                    'primary':[x.strip().strip("'") for x in m.group(4).split(',')],
                    'mastery':int(m.group(5))})
    return out

def professions():
    s = _src('game/stats.js')
    blk = s.split('ZI.PROFESSIONS = [')[1].split('\n];')[0]
    return [{'id':i,'name':n} for i,n in re.findall(r"id:'([^']+)',\s*name:'([^']+)'", blk)]

def prog_stats():
    s = _src('game/progression.js')
    blk = s.split('P.STATS = [')[1].split('\n  ];')[0]
    return [{'key':k,'name':n,'start':float(a),'cap':float(b)} for k,n,a,b in
            re.findall(r"key: '([^']+)',\s*name: '([^']+)',\s*start: ([\d.]+),\s*cap: ([\d.]+)", blk)]

def prog_config():
    s = _src('game/progression.js')
    g = lambda k, d: float(re.search(rf"{k}: *([\d.]+)", s).group(1)) if re.search(rf"{k}: *([\d.]+)", s) else d
    return {'ranksToCap':int(g('ranksToCap',30)), 'curveK':g('curveK',1.5),
            'offerSize':int(g('offerSize',3)), 'evenOnlyUntil':int(g('evenOnlyUntil',35)),
            'checkpoints':[int(x) for x in re.search(r"checkpoints: \[([^\]]+)\]", s).group(1).split(',')]}

SURVIVAL   = survival_attrs()
CLASSES    = classes()
PROFESSIONS= professions()
PROG_STATS = prog_stats()
PROG_CFG   = prog_config()
BASE_HP    = 100          # WANDER_REST_TABLE.maxHp / SURVIVOR_MAX_HP; STAT-02 maxHp adds on top (H4)

def stat_value(key, rank):
    """Mirrors PROG.statValue: diminishing returns, curveK, ranksToCap."""
    d = next(s for s in PROG_STATS if s['key']==key)
    n, k = PROG_CFG['ranksToCap'], PROG_CFG['curveK']
    frac = 0.0 if n<=0 else (min(rank,n)/n) ** (1.0/k)
    return d['start'] + (d['cap']-d['start'])*frac

# ─── SURVIVAL attribute → effect mapping  [PROPOSED Oct 30] ──────────────────
# Each point of an attribute contributes the listed amount. Starting values for
# tuning; none of this is locked.
ATTR_EFFECT = {
    'S' : {'hazard_resist_pct': 1.0},
    'U' : {'evasion_pct': 0.6, 'escape_pct': 0.8},
    'R' : {'crit_chance_pct': 0.5, 'attack_speed_pct': 0.6},
    'V' : {'max_hp': 2.0},
    'I' : {'rmat_bonus_pct': 1.2, 'xp_bonus_pct': 0.5},
    'V2': {'damage_pct': 1.0, 'carry_kg': 0.5},
    'A' : {'move_speed_pct': 0.4, 'stamina': 1.5},
    'L' : {'luck_pct': 1.0, 'rmat_extra_chance_pct': 0.8},
}

class StatBlock:
    def __init__(self, attrs=None, ranks=None, cls=None, prof_levels=None, weapon=20):
        self.attrs  = {a['key']:0 for a in SURVIVAL}; self.attrs.update(attrs or {})
        self.ranks  = {s['key']:0 for s in PROG_STATS}; self.ranks.update(ranks or {})
        self.cls    = next((c for c in CLASSES if c['id']==cls), None)
        self.profs  = prof_levels or {}
        self.weapon = weapon
    def _attr(self, field):
        t=0.0
        for k,v in self.attrs.items():
            t += ATTR_EFFECT.get(k,{}).get(field,0.0)*v
        # class primaries count 1.25x on their two attributes [PROPOSED]
        if self.cls:
            for k in self.cls['primary']:
                t += ATTR_EFFECT.get(k,{}).get(field,0.0)*self.attrs.get(k,0)*0.25
        return t
    def v(self,key): return stat_value(key,self.ranks[key])
    # ── damage output ──
    def damage_per_hit(self):
        base = self.weapon * self.v('damage') * (1 + self._attr('damage_pct')/100)
        crit = (self.v('critChance') + self._attr('crit_chance_pct'))/100
        return base * (1 + crit*(self.v('critDamage')-1))
    def attack_speed(self): return (self.v('attackSpeed') + self._attr('attack_speed_pct'))/100
    def dps_factor(self):   return self.damage_per_hit() * self.attack_speed()
    # ── damage resistance ──
    def max_hp(self):   return BASE_HP + self.v('maxHp') + self._attr('max_hp')
    def armor_pct(self):return min(75, self.v('armor'))
    def evasion_pct(self): return min(75, self.v('evasion') + self._attr('evasion_pct'))
    def incoming(self, raw):
        return raw * (1-self.armor_pct()/100) * (1-self.evasion_pct()/100)
    def hp_regen_per_min(self): return self.v('hpRegen')
    # ── utility ──
    def move_speed(self):   return self.v('moveSpeed') * (1 + self._attr('move_speed_pct')/100)
    def xp_mult(self):      return 1 + self._attr('xp_bonus_pct')/100
    def luck_pct(self):     return self._attr('luck_pct')
    def rmat_mult(self):
        m = 1 + self._attr('rmat_bonus_pct')/100
        if self.cls and self.cls['id']=='chemist': m *= 1.40   # class desc: RMAT yield +40%
        return m
    def rmat_extra_chance(self): return self._attr('rmat_extra_chance_pct')/100
    def summary(self):
        return {'max_hp':round(self.max_hp(),1),'dmg_per_hit':round(self.damage_per_hit(),1),
                'atk_speed':round(self.attack_speed(),2),'armor%':round(self.armor_pct(),1),
                'evasion%':round(self.evasion_pct(),1),'regen/min':round(self.hp_regen_per_min(),1),
                'move':round(self.move_speed(),2),'xp×':round(self.xp_mult(),3),
                'rmat×':round(self.rmat_mult(),3),'luck%':round(self.luck_pct(),1)}

def wanderer_l14():
    """The Wanderer — Solo Survivor, level 14 Ranger (economy.js, routes.js)."""
    cfg=PROG_CFG; picks=0
    for L in range(2,15):
        if L<=cfg['evenOnlyUntil'] and L%2: continue
        picks+=1
        if L in cfg['checkpoints']: picks+=1
    per = picks//len(PROG_STATS)
    ranks = {s['key']:per for s in PROG_STATS}
    for s in PROG_STATS[:picks-per*len(PROG_STATS)]: ranks[s['key']]+=1
    return StatBlock(attrs={'R':6,'U':5,'V':4,'I':3,'A':3,'S':2,'V2':2,'L':2},
                     ranks=ranks, cls='ranger', weapon=20), picks
