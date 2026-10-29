const fs = require('fs'); const { mkEnv } = require('./audit-env'); const { ZI } = mkEnv({ noLive: true }); const P = ZI.PROG;
const seeds = fs.readdirSync('.').filter(f => /^rates-\d+\.json$/.test(f)).map(f => JSON.parse(fs.readFileSync(f)));
const cum = seeds.map(r => { let c = 0; return [0].concat(r.map(([h, x]) => (c += x))); });
const med = a => { const s = a.slice().sort((x, y) => x - y); return s[s.length >> 1]; };
const Ls = [25, 50, 75, 90, 100];
let best = null;
for (let b = 0.80; b <= 1.0001; b += 0.01) for (let a = 20; a <= 300; a *= 1.01) {
  let worst = 0; const out = [];
  for (const L of Ls) { const tgt = P.activeHoursAtLevel(L), xpN = P.xpForLevel(L);
    const hrs = cum.map(c => { for (let h = 1; h <= 360; h++) { const S = c[Math.min(h, 300)] * (h > 300 ? h / 300 : 1); if (a * Math.pow(S, b) >= xpN) return h; } return 360; });
    const m = med(hrs); out.push([L, +tgt.toFixed(1), m]); worst = Math.max(worst, Math.abs(m - tgt) / tgt); }
  if (!best || worst < best.worst) best = { a: +a.toFixed(3), b: +b.toFixed(2), worst, out };
}
console.log(JSON.stringify(best));
fs.writeFileSync('fit.json', JSON.stringify(best));
