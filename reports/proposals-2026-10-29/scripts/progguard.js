const { context, watch, open } = require('./h.js');
(async () => {
  const ctx = await context(null); const page = await ctx.newPage(); const log = watch(page);
  await open(page); await page.evaluate(() => ZI.startNewInSlot('solo', 1)); await page.waitForTimeout(500); await open(page);
  for (const v of ['[1,2]', '{"v":1}', '"x"', '7']) {
    await page.evaluate(v => { localStorage.setItem('zi_prog_v1', v); localStorage.setItem('zisave_resume', JSON.stringify({ mode: 'solo', at: Date.now() })); }, v);
    log.errors.length = 0; await page.reload();
    let ok = true; try { await open(page); } catch (e) { ok = false; }
    console.log(v, ok ? 'game loads' : 'BLANK', JSON.stringify(log.errors.filter(e => !/404/.test(e)).slice(0, 2)), (await page.innerText('body')).slice(0, 60).replace(/\s+/g, ' '));
  }
  process.exit(0);
})();
