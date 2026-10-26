// CLOCK-01 step 3: rolling Hide charges, Make Camp cooldown, and next-morning skips.
return (async () => {
const ORDER = ['core','world','stats'];
const src = (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const results = [], check = (name, ok, detail) => results.push([ok ? 'PASS' : 'FAIL', name, detail || '']);
const T0 = 1790500000000, DAY = 24*60*60*1000, RATE = 60;
function env(day, second) {
  const store = { zi_game_clock:JSON.stringify({ day, base:second, at:T0, rate:RATE }) };
  const localStorage = { getItem:k => store[k] ?? null, setItem:(k,v) => { store[k] = String(v); } };
  const D = class extends Date { constructor(...args) { super(...(args.length ? args : [T0])); } static now() { return T0; } };
  const fw = { localStorage, Date:D }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw);
  return { Z:fw.ZI, store };
}
{
  const { Z } = env(1, 0), a = Z.spendHideUse(T0), b = Z.spendHideUse(T0 + 1000), c = Z.spendHideUse(T0 + 2000);
  const before = Z.getHideUses(T0 + 2000), after = Z.getHideUses(T0 + DAY), full = Z.getHideUses(T0 + DAY + 1000);
  check('Hide allows two uses and refuses a third inside 24 real hours', a.ok && b.ok && !c.ok && before.left === 0, JSON.stringify({ a:a.ok, b:b.ok, c:c.ok, left:before.left }));
  check('Hide refills each charge exactly 24 hours after its own use', after.left === 1 && full.left === 2, JSON.stringify({ after, full }));
}
{
  const { Z } = env(1, 0), a = Z.spendCampUse(T0), b = Z.spendCampUse(T0 + DAY - 1), c = Z.getCampCooldown(T0 + DAY);
  check('Make Camp locks after a successful use and unlocks exactly 24 hours later', a.ok && !b.ok && c.available && c.remainingMs === 0, JSON.stringify({ a:a.ok, b:b.ok, c }));
}
for (const [label, second] of [['00:00',0],['05:59',5*3600+59*60],['06:00',6*3600],['12:00',12*3600],['23:59',23*3600+59*60]]) {
  const { Z } = env(1, second); Z.passTimeToNextMorning(6); const c = Z.getCalendar();
  check(`Make Camp from ${label} reaches 06:00 on the next calendar day`, c.year === 1 && c.day === 2 && c.hh === 6 && c.mm === 0, JSON.stringify(c));
}
return results;
})();
