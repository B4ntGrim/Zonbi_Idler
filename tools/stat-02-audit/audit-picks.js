const { mkEnv } = require('./audit-env'); const { ZI } = mkEnv({ noLive: true }); const P = ZI.PROG;
const rows = [];
for (const hidden of [[], ['shield', 'moveSpeed']]) for (const pity of [0.35, 0.2, 0.1, 0]) {
  P.CONFIG.hiddenStats = hidden; P.CONFIG.pityStep = pity;
  const d = P.simulate('damage', 4000, 101), b = P.simulate('balanced', 4000, 202), s = P.simulate('survival', 4000, 303);
  rows.push({ hidden: hidden.length ? 'shield+move hidden' : 'all 10', pity, dmgMedianLevel: d.medianDamageCap, dmgHours: +P.activeHoursAtLevel(Math.min(100, d.medianDamageCap)).toFixed(0), neverCapPct: +d.neverDamagePct.toFixed(1), balancedCapsPct: +b.capBefore100Pct.toFixed(1), survivalCapsPct: +s.capBefore100Pct.toFixed(1) });
}
console.table(rows);
