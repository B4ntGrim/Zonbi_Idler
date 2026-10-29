// A/B: same source, in-browser Babel (DevAB) vs precompiled build (Zonbi_Idler). Fixed clock + seed, so screens match.
const { context, watch, open, S } = require('./h.js');
const fs = require('fs');
const T0 = Date.UTC(2026, 9, 20, 12, 0, 0);
const TABS = { solo: ['Routes','Traversal','Schedule','Shop','Crafting','Stockpile','Stats','Wandering','Codex','Factions'], camp: ['Overview','Schedule','Traversal','Shop','Crafting','Stockpile','Stats','Codex','Factions'] };
async function run(base) {
  const ctx = await context(null); await ctx.clock.install({ time: T0 });
  await ctx.addInitScript(() => { let a = 1234567; Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; });
  const page = await ctx.newPage(); const log = watch(page);
  const t = Date.now(); await page.goto(base + 'index.html');
  await page.waitForFunction(() => window.ZI && document.querySelector('#root') && document.querySelector('#root').children.length > 0, null, { timeout: 90000 });
  const loadMs = Date.now() - t;
  const out = { loadMs, screens: {}, errors: null };
  out.screens.menu = await page.innerText('#root');
  for (const mode of ['solo', 'camp']) {
    await page.evaluate(m => { localStorage.setItem('zi_world_seed', '4242'); ZI.startNewInSlot(m, 1); }, mode);
    await page.waitForFunction(() => window.ZI && document.body && /Save/.test(document.body.innerText), null, { timeout: 90000 });
    await page.evaluate(() => { ZI.TUTORIAL_DONE_KEYS.forEach(k => ZI.setTutDone(k)); localStorage.setItem('zisave_resume', JSON.stringify({ mode: ZI.getActiveSlot().mode, at: Date.now() })); location.reload(); });
    await page.waitForTimeout(1000);
    await page.waitForFunction(() => window.ZI && document.body && /Save/.test(document.body.innerText), null, { timeout: 90000 });
    await page.waitForTimeout(500);
    out.screens[mode + ':home'] = await page.innerText('#root');
    for (const tab of TABS[mode]) {
      let btn = page.getByRole('button', { name: tab, exact: true }).filter({ visible: true }).first();
      if (!(await btn.count())) { const more = page.getByRole('button', { name: /more/i }).filter({ visible: true }).first(); if (await more.count()) { await more.click(); await page.waitForTimeout(300); } btn = page.getByText(tab, { exact: true }).filter({ visible: true }).first(); }
      if (!(await btn.count())) { out.screens[mode + ':' + tab] = 'NO TAB'; continue; }
      await btn.click({ timeout: 5000 }).catch(e => { out.screens[mode + ':' + tab + ':clickError'] = e.message.slice(0, 80); });
      await page.waitForTimeout(700);
      out.screens[mode + ':' + tab] = await page.innerText('#root');
    }
  }
  out.errors = log.errors.filter(e => !/image-slots|404/.test(e)); out.http = log.http.filter(h => !/image-slots/.test(h));
  await ctx.close(); return out;
}
(async () => {
  const dev = await run('http://127.0.0.1:8765/DevAB/'), prod = await run('http://127.0.0.1:8765/Zonbi_Idler/');
  const norm = s => s.replace(/\d{1,2}:\d{2}(:\d{2})?/g, 'T').replace(/\s+/g, ' ');
  const rows = Object.keys(dev.screens).map(k => [k, norm(dev.screens[k]) === norm(prod.screens[k]), dev.screens[k].length, (prod.screens[k] || '').length]);
  rows.forEach(r => console.log((r[1] ? 'same ' : 'DIFF ') + r[0] + '  (' + r[2] + ' / ' + r[3] + ' chars)'));
  console.log(JSON.stringify({ devLoadMs: dev.loadMs, prodLoadMs: prod.loadMs, devErrors: dev.errors, prodErrors: prod.errors, devHttp: dev.http, prodHttp: prod.http }, null, 1));
  fs.writeFileSync(S + '/ab-results.json', JSON.stringify({ dev, prod }, null, 1));
  process.exit(0);
})();
