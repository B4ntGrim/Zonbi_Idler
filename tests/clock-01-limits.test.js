// CLOCK-01 step 3: rolling Hide charges, Make Camp cooldown, and next-morning skips.
// Addendum (Sam, Oct 30): both now reset one GAME day apart (24 game hours = 24 real minutes),
// and Hide is once per game day. ZI.OFFLINE_CAP_MS (24 REAL hours) stays the offline cap.
return (async () => {
const ORDER = ['core','world','stats'];
const src = (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = [], check = (name, ok, detail) => results.push([ok ? 'PASS' : 'FAIL', name, detail || '']);
const T0 = 1790500000000, DAY = 24*60*60*1000, RATE = 60;
const GDAY = 24 * 60 * 1000; // one game day in real ms
function env(day, second) {
  const store = { zi_game_clock:JSON.stringify({ day, base:second, at:T0, rate:RATE }) };
  const localStorage = { getItem:k => store[k] ?? null, setItem:(k,v) => { store[k] = String(v); } };
  const D = class extends Date { constructor(...args) { super(...(args.length ? args : [T0])); } static now() { return T0; } };
  const fw = { localStorage, Date:D }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw);
  return { Z:fw.ZI, store };
}
{
  const { Z } = env(1, 0);
  check('The reset window is one GAME day, not one real day', Z.TRAV_RESET_MS === GDAY && Z.TRAV_RESET_MS === Z.GAME_DAY_MS, Z.TRAV_RESET_MS + ' ms');
  check('The offline-progress cap is still 24 REAL hours', Z.OFFLINE_CAP_MS === DAY, Z.OFFLINE_CAP_MS + ' ms');
  check('Hide is once per game day', Z.TRAV_HIDE_MAX_PER_GAME_DAY === 1);
}
{
  const { Z } = env(1, 0), a = Z.spendHideUse(T0), b = Z.spendHideUse(T0 + 1000);
  check('Hide allows one use and refuses a second inside the same game day',
    a.ok && !b.ok && Z.getHideUses(T0 + 1000).left === 0, JSON.stringify({ a:a.ok, b:b.ok }));
  check('Hide is still spent just before the game day is up', Z.getHideUses(T0 + GDAY - 1000).left === 0);
  check('Hide refills one game day after its use', Z.getHideUses(T0 + GDAY + 1000).left === 1);
}
{
  const { Z } = env(1, 0), a = Z.spendCampUse(T0), b = Z.spendCampUse(T0 + GDAY - 1), c = Z.getCampCooldown(T0 + GDAY);
  check('Make Camp locks after a use and unlocks exactly one game day later',
    a.ok && !b.ok && c.available && c.remainingMs === 0, JSON.stringify({ a:a.ok, b:b.ok, c }));
  check('Make Camp is still a hard cap inside the window', !Z.spendCampUse(T0 + 60000).ok);
}
for (const [label, second] of [['00:00',0],['05:59',5*3600+59*60],['06:00',6*3600],['12:00',12*3600],['23:59',23*3600+59*60]]) {
  const { Z } = env(1, second); Z.passTimeToNextMorning(6); const c = Z.getCalendar();
  check(`Make Camp from ${label} reaches 06:00 on the next calendar day`, c.year === 1 && c.day === 2 && c.hh === 6 && c.mm === 0, JSON.stringify(c));
}
return results;
})();
