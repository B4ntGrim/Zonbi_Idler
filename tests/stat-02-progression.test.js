// STAT-02 acceptance checks for game/progression.js (XP curve, ranks, picks, offers, status states, offline floor).
return (async () => {
const src = await readFile('game/progression.js');
const fw = {}; fw.window = fw;
new Function('fw', 'with(fw){' + src + '}')(fw);
const P = fw.ZI.PROG;
const results = [], check = (n, ok, d) => results.push([ok ? 'PASS' : 'FAIL', n, d === undefined ? '' : String(d)]);
const near = (a, b, tol) => Math.abs(a - b) <= tol;
const N = P.CONFIG.ranksToCap;

// XP curve
check('xp coefficient a ≈ 906.1', near(P.xpCoefficient(), 906.1, 0.1), P.xpCoefficient());
check('total XP to L50 ≈ 310,033', near(P.xpForLevel(50), 310033, 50), P.xpForLevel(50));
check('total XP to L90 ≈ 4,018,874', near(P.xpForLevel(90), 4018874, 50), P.xpForLevel(90));
check('total XP to L100 ≈ 7,557,000', near(P.xpForLevel(100), 7557000, 50), P.xpForLevel(100));
check('half of total XP falls between L89 and L90', P.xpForLevel(89) < P.CONFIG.xpTotal / 2 && P.CONFIG.xpTotal / 2 <= P.xpForLevel(90), P.levelFromXp(P.CONFIG.xpTotal / 2));
check('levelFromXp round-trips every level', [...Array(99)].every((_, i) => P.levelFromXp(P.xpForLevel(i + 2)) === i + 2));
check('XP per active hour ≈ 25,190', near(P.xpPerActiveHour(), 25190, 1), P.xpPerActiveHour());
check('regular XP per event in Learn the loop ≈ 126', near(P.xpPerEvent('learn', 'regular'), 126, 0.5), P.xpPerEvent('learn', 'regular'));

// Main level from skill XP (Oct 28)
check('main XP formula is a × S^b with the audited values', P.CONFIG.mainXp.a === 111.848 && P.CONFIG.mainXp.b === 0.87);
check('main XP and skill XP convert both ways', [10, 1000, 345547].every(S => near(P.skillFromMainXp(P.mainXpFromSkill(S)), S, S * 1e-9)));
check('about 345,500 skill XP (median 300 h at the 1.4 m/s walk) reaches level 99–100', P.levelFromXp(P.mainXpFromSkill(345547)) >= 99, P.levelFromXp(P.mainXpFromSkill(345547)));

// Ranks
check('30 hidden ranks to cap (audit, after hiding two stats)', N === 30, N);
check('top rank equals cap exactly for every stat', P.STATS.every(s => P.statValue(s.key, N) === s.cap));
check('rank 0 equals start for every stat', P.STATS.every(s => P.statValue(s.key, 0) === s.start));
check('diminishing returns: first rank gain > last rank gain', P.STATS.every(s => (P.statValue(s.key, 1) - P.statValue(s.key, 0)) > (P.statValue(s.key, N) - P.statValue(s.key, N - 1))));
check('k is 1.5 for all stats', P.STATS.every(s => P.kFor(s.key) === 1.5));

// Picks
const odd = [3, 5, 33, 35].map(P.standardPickAt), even = [2, 34, 36, 37, 99].map(P.standardPickAt);
check('no standard pick on odd levels 3–35', odd.every(x => !x));
check('standard pick on even levels to 35 and every level after', even.every(x => x));
check('checkpoint levels give exactly two picks (except odd L35, bonus only — H3)', P.CONFIG.checkpoints.every(L => P.picksAtLevel(L) === (L === 35 ? 1 : 2)), P.CONFIG.checkpoints.map(P.picksAtLevel).join(','));
check('91 picks from level 2 to 100', P.totalPicks() === 91, P.totalPicks());

// Offers
{
  const rng = P.seededRng(3); let dup = false, capped = false, hidden = false;
  for (let run = 0; run < 300; run++) {
    const st = P.newState();
    for (let i = 0; i < 91; i++) {
      const offer = P.makeOffer(st, rng);
      if (new Set(offer).size !== offer.length) dup = true;
      if (offer.some(k => P.isCapped(st, k))) capped = true;
      if (offer.some(k => k === 'shield' || k === 'moveSpeed')) hidden = true;
      P.applyPick(st, offer, offer.indexOf('damage') !== -1 ? 'damage' : offer[0]);
    }
  }
  check('no offer contains duplicate stats', !dup);
  check('capped stats never appear in offers', !capped);
  check('Shield and Movement Speed are never offered (hidden, Oct 28)', !hidden);
  check('8 stats are visible', P.visibleStats().length === 8 && !P.visibleStats().some(s => s.key === 'shield' || s.key === 'moveSpeed'));
}
{
  const st = P.newState(); st.misses.damage = 4;
  check('pity raises draw weight (1 + 0.35 × misses)', near(P.drawWeight(st, 'damage'), 2.4, 1e-9), P.drawWeight(st, 'damage'));
  const st2 = P.newState(); st2.ranks.damage = N; const r = P.applyPick(st2, ['damage'], 'damage');
  check('cannot pick a capped stat', !r.ok);
}

// Hidden display
{
  const card = P.cardText('maxHp', 5);
  check('upgrade card shows name and rounded before → after only', /^Max HP \d+ → \d+$/.test(card), card);
  check('upgrade card never shows ranks', !/rank|\/24|\/30|k=/i.test(card), card);
}

// Simulation
{
  const d = P.simulate('damage', 2000, 11), b = P.simulate('balanced', 2000, 12), s = P.simulate('survival', 2000, 13);
  check('damage build median Damage cap around level 90 (87–93)', d.medianDamageCap >= 87 && d.medianDamageCap <= 93, d.medianDamageCap);
  check('damage build: ≤ 12% of runs never cap Damage', d.neverDamagePct <= 12, d.neverDamagePct.toFixed(1) + '%');
  check('balanced build never caps a stat before level 100', b.capBefore100Pct === 0, b.capBefore100Pct);
  check('survival build never caps a stat before level 100', s.capBefore100Pct === 0, s.capBefore100Pct);
  log('SIM damage ' + JSON.stringify(d)); log('SIM balanced ' + JSON.stringify(b)); log('SIM survival ' + JSON.stringify(s));
}

// Status stacking
{
  const sum = (o) => Object.values(o).reduce((a, x) => a + x, 0);
  const base = { hunger: 1, rest: 1, wounds: 0, sickness: 0, morale: 0 };
  const hungry = Object.assign({}, base, { hunger: 2 }), fatigued = Object.assign({}, base, { rest: 2 }), both = Object.assign({}, base, { hunger: 2, rest: 2 });
  const neg = sum(P.statusModifiers(both)), sep = sum(P.statusModifiers(hungry)) + sum(P.statusModifiers(fatigued));
  check('two stacked bad states hurt more than the sum of each alone', neg < sep, neg.toFixed(4) + ' vs ' + sep.toFixed(4));
  const fed = Object.assign({}, base, { hunger: 0 }), rested = Object.assign({}, base, { rest: 0 }), fedRested = Object.assign({}, base, { hunger: 0, rest: 0 });
  const pos = sum(P.statusModifiers(fedRested)), psep = sum(P.statusModifiers(fed)) + sum(P.statusModifiers(rested));
  check('two stacked good states help more than the sum of each alone', pos > psep, pos.toFixed(4) + ' vs ' + psep.toFixed(4));
  const worst = P.statusModifiers({ hunger: 3, rest: 3, wounds: 3, sickness: 3, morale: 2 });
  check('worst stack keeps at least half of base damage (audit bound)', (worst.damage || 0) > -0.5, worst.damage);
}

// Offline floor
{
  const start = { hunger: 2, rest: 2, wounds: 3, sickness: 3, morale: 2 };
  const r = P.settleOffline(start, 24 * 3, { rations: 0 });
  const severe = P.STATUS_KEYS.filter(t => r.status[t] > P.STATUS[t].offlineWorst);
  check('offline with zero supplies never reaches a severe tier', severe.length === 0, JSON.stringify(P.statusLabels(r.status)));
  const fedRun = P.settleOffline(P.newStatus(), 16, { rations: 5 });
  check('away summary text is produced', /ate/i.test(fedRun.text) && /ration/.test(fedRun.text), fedRun.text);
}

return results;
})();
