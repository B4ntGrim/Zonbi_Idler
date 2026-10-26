const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const h = require('./harness');
(async () => {
  for (const mode of ['narrow-mouse', 'phone-touch']) {
    const { browser, page } = await h.open({ wait: 40000 });
    await page.click('text=SOLO SURVIVOR'); await page.waitForTimeout(1200);
    await page.locator('button', { hasText: '+ NEW GAME' }).first().click(); await page.waitForTimeout(3000);
    await page.locator('button', { hasText: /^Skip/ }).first().click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(600);
    await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(1200);
    await page.screenshot({ path: `/tmp/claude-0/${mode}-a.png` });
    const info = await page.evaluate(() => { const z = window.ZI.getTravZone(); const el = document.querySelector(`[data-cell="${z.gx},${z.gy}"]`); const r = el && el.getBoundingClientRect(); const side = document.querySelector('[data-trav="side-panel"]'); const sr = side && side.getBoundingClientRect(); return { cell: r && [r.x|0, r.y|0, r.width|0, r.height|0], side: sr && [sr.x|0, sr.y|0, sr.width|0, sr.height|0], cells: document.querySelectorAll('[data-cell]').length, docW: document.documentElement.scrollWidth, docH: document.documentElement.scrollHeight }; });
    console.log(mode, JSON.stringify(info));
    const z = await page.evaluate(() => window.ZI.getTravZone());
    try { await page.click(`[data-cell="${z.gx},${z.gy}"]`, { timeout: 5000 }); } catch (e) { console.log(' click failed:', e.message.split('\n')[0]); }
    await page.waitForTimeout(600);
    console.log(' sheet:', await page.locator('[data-trav="sheet"]').count(), 'side panel content:', await page.locator('[data-trav="side-panel"] [data-trav="zone-panel"]').count());
    await page.screenshot({ path: `/tmp/claude-0/${mode}-b.png` });
    await browser.close();
  }
})();
