const { open } = require('./harness');
(async () => {
  const { browser, page, logs } = await open({ wait: 40000 });
  await page.click('text=SOLO SURVIVOR'); await page.waitForTimeout(1200);
  await page.locator('button', { hasText: '+ NEW GAME' }).first().click(); await page.waitForTimeout(3000);
  await page.locator('button', { hasText: /^Skip/ }).first().click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(600);
  const xp = () => page.evaluate(() => JSON.parse(localStorage.getItem('zi_stat_xp') || '{}').stealth || 0);
  const z = await page.evaluate(() => window.ZI.getTravZone());
  await page.click(`[data-cell="${z.gx},${z.gy}"]`); await page.waitForTimeout(400);
  for (let i = 0; i < 5; i++) {
    const b = page.locator('[data-trav="zone-panel"] [data-action="scout"]');
    if (await b.isDisabled()) { console.log('disabled at', i); break; }
    await b.click(); await page.waitForTimeout(400);
    const res = await page.locator('[data-trav="result"]').innerText().catch(() => '?');
    console.log(i, 'stealth', await xp(), '|', res.slice(0, 160), '| key', await page.evaluate(() => localStorage.getItem('zi_trav_xp_day')));
  }
  console.log(logs.filter(l => /error/i.test(l)).slice(0, 10).join('\n'));
  await browser.close();
})();
