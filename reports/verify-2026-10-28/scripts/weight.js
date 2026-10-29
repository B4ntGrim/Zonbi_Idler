const { context, watch, open, S } = require('./h.js');
(async () => {
  const ctx = await context(null); const page = await ctx.newPage(); const log = watch(page);
  const sizes = {}; page.on('response', async r => { try { const b = await r.body(); sizes[r.url()] = b.length; } catch (e) {} });
  const t0 = Date.now(); await open(page); const tMenu = Date.now() - t0;
  await page.evaluate(() => ZI.startNewInSlot('solo', 1)); await page.waitForTimeout(500);
  const t1 = Date.now(); await open(page); const tGame = Date.now() - t1;
  for (const t of ['ROUTES','TRAVERSAL','SCHEDULE','SHOP','CRAFTING','STOCKPILE']) { const el = page.getByText(t, { exact: true }).first(); if (await el.count()) { await el.click().catch(()=>{}); await page.waitForTimeout(1200); } }
  const tot = Object.values(sizes).reduce((a, b) => a + b, 0);
  const top = Object.entries(sizes).sort((a, b) => b[1] - a[1]).slice(0, 12).map(([u, n]) => (n / 1e6).toFixed(2) + 'MB ' + u.replace(/.*Zed_Idler\//, ''));
  const perf = await page.evaluate(() => { const m = performance.getEntriesByType('measure'); return null; });
  console.log(JSON.stringify({ tMenu, tGame, requests: Object.keys(sizes).length, totalMB: (tot / 1e6).toFixed(1), top, http: log.http, errors: log.errors.filter(e=>!/404/.test(e)).slice(0,5) }, null, 1));
  process.exit(0);
})();
