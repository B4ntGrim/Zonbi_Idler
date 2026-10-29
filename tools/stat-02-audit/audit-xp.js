const { mkEnv } = require('./audit-env');
const { ZI, clock } = mkEnv();
const rng = ZI.PROG.seededRng(5);
const prof = {}; ZI.onXp((p, a) => { prof[p] = (prof[p] || 0) + a; });
const s = ZI.getWanderRun(); Object.assign(s, { active: true, status: 'active', paused: false, hp: ZI.maxHp(), scroll: 0, lastTickAt: clock.now });
ZI.saveWanderRun(s);
const rm0 = JSON.stringify(ZI.getRmatHoldings());
const rows = []; let stash0 = ZI.getStash().length;
const HOURS = +process.argv[2] || 10;
for (let h = 1; h <= HOURS; h++) {
  for (let m = 0; m < 60; m++) {
    const st = ZI.getWanderRun(); const away = ZI.WanderSim.emptySummary(), ev = [];
    st._simNow = clock.now;
    ZI.WanderSim.advance(st, 60, away, rng, ev, {});
    clock.now += 60000; st.lastTickAt = clock.now; ZI.saveWanderRun(st);
  }
  const tot = Object.values(prof).reduce((a, x) => a + x, 0);
  const st = ZI.getWanderRun();
  rows.push({ h, profXp: tot, scroll: Math.round(st.scroll || 0), hp: Math.round(st.hp), rmat: ZI.getRmatHoldings(), stash: ZI.getStash().length, rations: ZI.getStash().filter(x => x === 'ration').length, profLv: Object.fromEntries(Object.keys(prof).map(k => [k, ZI.statLevel(k)])) });
}
console.log("RATES", JSON.stringify(rows.map((r,i)=>[r.h, r.profXp - (i? rows[i-1].profXp:0), r.scroll])));
const wl = ZI.getWanderLoot ? ZI.getWanderLoot() : null;
const st2 = ZI.getWanderRun();
const items = {}; (Array.isArray(wl) ? wl : (wl && wl.items) || []).forEach(x => { const id = typeof x === 'string' ? x : (x.id || x.itemId || x.name); items[id] = (items[id] || 0) + 1; });
console.log('LAST', JSON.stringify(rows[rows.length - 1]));
console.log('WANDERLOOT', JSON.stringify(wl && (Array.isArray(wl) ? wl.slice(0, 3) : Object.keys(wl))), 'count', Array.isArray(wl) ? wl.length : '', JSON.stringify(items).slice(0, 600));
console.log('RUNKEYS', Object.keys(st2).join(','), 'carried', JSON.stringify(st2.carried || st2.haul || '').slice(0, 300));
