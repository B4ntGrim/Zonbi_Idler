const { mkEnv } = require('./audit-env'); const { ZI } = mkEnv(); const P = ZI.PROG, L = P.LIVE, F = ZI.STAT_FORMULAS;
const proposal = process.argv[2] === 'new';
if (proposal) {
  const T = P.STATUS, set = (t, i, m) => { T[t].tiers[i].mods = m; };
  set('hunger', 0, { hpRegen: 0.10, damage: 0.04 }); set('hunger', 2, { hpRegen: -0.10, damage: -0.06 }); set('hunger', 3, { hpRegen: -0.25, damage: -0.09, maxHp: -0.05 });
  set('rest', 0, { evasion: 0.15, attackSpeed: 0.05 }); set('rest', 2, { evasion: -0.20, damage: -0.04 }); set('rest', 3, { evasion: -0.30, damage: -0.07, attackSpeed: -0.15 });
  set('wounds', 1, { hpRegen: -0.05 }); set('wounds', 2, { maxHp: -0.10, damage: -0.03 }); set('wounds', 3, { maxHp: -0.20, damage: -0.05 });
  set('sickness', 1, { hpRegen: -0.05 }); set('sickness', 2, { hpRegen: -0.15, damage: -0.05 }); set('sickness', 3, { hpRegen: -0.30, damage: -0.05, critChance: -0.20 });
  set('morale', 1, { critChance: -0.10, evasion: -0.05 }); set('morale', 2, { critChance: -0.25, evasion: -0.10, damage: -0.03 });
}
const combos = {
  'Neutral': { hunger: 1, rest: 1, wounds: 0, sickness: 0, morale: 0 },
  'Best: Well Fed + Rested': { hunger: 0, rest: 0, wounds: 0, sickness: 0, morale: 0 },
  'Hungry + Fatigued': { hunger: 2, rest: 2, wounds: 0, sickness: 0, morale: 0 },
  'Hungry + Fatigued + Wounded': { hunger: 2, rest: 2, wounds: 2, sickness: 0, morale: 0 },
  'Starving + Exhausted': { hunger: 3, rest: 3, wounds: 0, sickness: 0, morale: 0 },
  'Worst: all severe': { hunger: 3, rest: 3, wounds: 3, sickness: 3, morale: 2 },
};
const FIGHTS = 4000; const out = [];
for (const [name, idx] of Object.entries(combos)) {
  L.statusIndex = () => idx; const row = { state: name };
  for (const tier of [2, 6]) {
    const rng = P.seededRng(9 + tier); let wins = 0, hpLost = 0;
    for (let i = 0; i < FIGHTS; i++) {
      const sb = F.survivorStatBlock({ weaponDamage: 14, displayHP: 100, armorRating: 2 }); sb.hpMax = ZI.maxHp(); sb.hp = sb.hpMax;
      const r = ZI.simulateCombat(sb, F.enemyStatBlock(ZI._bgZombie(tier, rng)), 'idle', rng);
      if (r.outcome === 'win' || (r.outcome !== 'loss' && r.hpLeft > 0 && r.outcome !== 'timeout')) wins++;
      hpLost += sb.hpMax - Math.max(0, r.hpLeft);
    }
    row['win% T' + tier] = +(wins / FIGHTS * 100).toFixed(1); row['HP lost T' + tier] = +(hpLost / FIGHTS).toFixed(1);
  }
  out.push(row);
}
console.log(proposal ? 'PROPOSED VALUES' : 'CURRENT PLACEHOLDERS'); console.table(out);
