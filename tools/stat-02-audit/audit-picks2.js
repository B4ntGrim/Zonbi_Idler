const { mkEnv } = require('./audit-env'); const { ZI } = mkEnv({ noLive: true }); const P = ZI.PROG;
P.CONFIG.hiddenStats = ['shield', 'moveSpeed']; P.CONFIG.pityStep = 0.35;
const rows = [];
for (const even of [35, 50, 60, 70]) for (const ranks of [24, 28, 30]) {
  P.CONFIG.evenOnlyUntil = even; P.CONFIG.ranksToCap = ranks;
  const d = P.simulate('damage', 4000, 101), b = P.simulate('balanced', 4000, 202), s = P.simulate('survival', 4000, 303);
  rows.push({ evenOnlyUntil: even, ranksToCap: ranks, picks: P.totalPicks(), dmgLevel: d.medianDamageCap, dmgHours: +P.activeHoursAtLevel(Math.min(100, d.medianDamageCap)).toFixed(0), neverCapPct: +d.neverDamagePct.toFixed(1), survivalCapsPct: +s.capBefore100Pct.toFixed(1), balancedCapsPct: +b.capBefore100Pct.toFixed(1) });
}
console.table(rows);
