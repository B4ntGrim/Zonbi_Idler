// CLOCK-01 step 1: shared rate, calendar arithmetic, and rate-change continuity.
return (async () => {
const src = await readFile('game/core.js');
const results = [], check = (name, ok, detail) => results.push([ok ? 'PASS' : 'FAIL', name, detail || '']);
const T0 = 1790500000000;
function env(savedClock) {
  const store = savedClock ? { zi_game_clock: JSON.stringify(savedClock) } : {};
  const localStorage = { getItem:k => store[k] ?? null, setItem:(k,v) => { store[k] = String(v); } };
  const D = class extends Date { constructor(...args) { super(...(args.length ? args : [T0])); } static now() { return T0; } };
  const fw = { localStorage, Date:D }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw);
  return { ZI:fw.ZI, store };
}

{
  const { ZI } = env();
  check('selected rate is 60,000 ms per game hour', ZI.REAL_MS_PER_GAME_HOUR === 60000, ZI.REAL_MS_PER_GAME_HOUR);
}
{
  const cases = [
    [1, 1, 1], [364, 1, 364], [365, 2, 1], [728, 2, 364], [729, 3, 1],
  ];
  for (const [totalDay, year, day] of cases) {
    const { ZI } = env({ day:totalDay, base:0, at:T0, rate:60 });
    const c = ZI.getCalendar();
    check(`calendar total day ${totalDay} is Year ${year}, Day ${day}`, c.year === year && c.day === day, JSON.stringify(c));
  }
}
{
  const { ZI } = env({ day:1, base:8*3600+7*60, at:T0, rate:600 });
  const c = ZI.getCalendar();
  check('calendar time is zero-padded numeric hour and minute fields', c.hh === 8 && c.mm === 7, JSON.stringify(c));
}
{
  const { ZI, store } = env({ day:2, base:0, at:T0-60000, rate:600 });
  const c = ZI.getCalendar();
  const saved = JSON.parse(store.zi_game_clock);
  check('old clock accrues at its saved rate before switching to the new rate', c.year === 1 && c.day === 2 && c.hh === 10 && c.mm === 0 && saved.rate === ZI.CLOCK_RATE, JSON.stringify({ calendar:c, savedRate:saved.rate }));
}
return results;
})();
