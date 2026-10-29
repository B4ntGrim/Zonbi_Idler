const { context, watch, open, S } = require('./h.js');
const H = 3600e3, T0 = Date.UTC(2026, 9, 20, 12, 0, 0);
(async () => {
  const ctx = await context(null); await ctx.clock.install({ time: T0 }); const page = await ctx.newPage(); watch(page);
  await open(page);
  await page.evaluate(() => ZI.startNewInSlot('solo', 1)); await page.waitForTimeout(500); await open(page);
  await page.evaluate(() => { ZI.enqueueJob('probe', 'probe', 100 * 3600, {}); ZI.saveToActiveSlot(); });
  const cal1 = await page.evaluate(() => ZI.getCalendar());
  await page.evaluate(() => ZI.startNewInSlot('solo', 2)); await page.waitForTimeout(500); await open(page);
  for (let i = 0; i < 48; i++) await ctx.clock.fastForward(H);
  await page.waitForTimeout(1500);
  await page.evaluate(() => ZI.loadSlot('solo', 1)); await page.waitForTimeout(500); await open(page);
  const r = await page.evaluate(() => { const j = ZI._readJobsRaw().jobs.find(x => x.type === 'probe'); return { creditedH: j && (Date.now() - j.startedAt) / 3600e3, window: ZI.offlineWindow().elapsedMs / 3600e3, cal: ZI.getCalendar() }; });
  console.log(JSON.stringify({ cal1, ...r })); process.exit(0);
})();
