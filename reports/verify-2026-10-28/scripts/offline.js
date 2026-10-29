// Real-browser offline checks: close the browser, reopen it N hours later (fake system clock), read what was credited.
const { context, watch, open, S } = require('./h.js');
const fs = require('fs');
const H = 3600e3, T0 = Date.UTC(2026, 9, 20, 12, 0, 0);

const probe = () => {
  const w = ZI.offlineWindow(); const jobs = ZI._readJobsRaw().jobs;
  const job = jobs.find(j => j.type === 'probe');
  return {
    now: Date.now(), window: { elapsedH: w.elapsedMs / 3600e3, creditedH: w.creditedMs / 3600e3, discardedH: w.discardedMs / 3600e3 },
    lastSeen: localStorage.getItem('zi_offline_last_seen'),
    probeJob: job ? { creditedH: (Date.now() - job.startedAt) / 3600e3, status: job.status } : 'completed/missing',
    calendar: ZI.getCalendar(), gameSec: ZI.gameTotalSeconds(),
    status: (() => { try { return JSON.parse(localStorage.getItem('zi_status_v1')); } catch (e) { return 'unreadable'; } })(),
    active: ZI.getActiveSlot(),
  };
};

async function phaseA(dir) {
  const ctx = await context(dir); await ctx.clock.install({ time: T0 });
  const page = ctx.pages()[0] || await ctx.newPage(); const log = watch(page);
  await open(page);
  await page.evaluate(() => ZI.startNewInSlot('solo', 2));
  await page.waitForTimeout(500); await open(page);
  await page.evaluate(() => { ZI.enqueueJob('probe', 'probe', 30 * 3600, {}); ZI.saveToActiveSlot(); });
  await page.waitForTimeout(3000); // let the 1-s heartbeat run
  const a = await page.evaluate(probe);
  await ctx.close();
  return { a, log };
}
async function phaseB(dir, closeAt, deltaMs, tamper) {
  const ctx = await context(dir); await ctx.clock.install({ time: closeAt + deltaMs });
  if (tamper) await ctx.addInitScript(tamper);
  const page = ctx.pages()[0] || await ctx.newPage(); const log = watch(page);
  await open(page);
  const b = await page.evaluate(probe);
  // Reload straight away: a second load must not credit the absence again.
  await page.reload(); await open(page);
  const c = await page.evaluate(probe);
  await ctx.close();
  return { b, c, log };
}

(async () => {
  const cases = [
    ['1h', 1 * H], ['23h59m', 24 * H - 60e3], ['exactly 24h', 24 * H], ['24h + 1 min', 24 * H + 60e3],
    ['30h', 30 * H], ['7 days', 7 * 24 * H], ['clock moved back 2h', -2 * H],
  ];
  const only = process.argv[2];
  const out = [];
  for (const [name, d] of cases) {
    if (only && !name.includes(only)) continue;
    const dir = S + '/prof-' + name.replace(/\W+/g, '_'); fs.rmSync(dir, { recursive: true, force: true });
    const A = await phaseA(dir);
    const closeAt = Number(A.a.lastSeen);
    const B = await phaseB(dir, closeAt, d);
    out.push({ name, deltaH: d / H, before: A.a, after: B.b, afterReload: B.c, errors: A.log.errors.concat(B.log.errors).filter(e => !/image-slots|404/.test(e)) });
    console.log(name, JSON.stringify({ window: B.b.window, job: B.b.probeJob, reloadWindow: B.c.window, reloadJob: B.c.probeJob, cal: [A.a.calendar, B.b.calendar], status: B.b.status && B.b.status.lastAway, err: out.at(-1).errors.length }));
  }
  fs.writeFileSync(S + '/offline-results' + (only ? '-' + only.replace(/\W+/g, '_') : '') + '.json', JSON.stringify(out, null, 1));
  process.exit(0);
})();
