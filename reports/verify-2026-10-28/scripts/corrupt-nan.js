// Damaged-save checks: corrupt one storage key at a time, reload, and see whether the game still starts and plays.
const { context, watch, open, S } = require('./h.js');
const fs = require('fs');
const T0 = Date.UTC(2026, 9, 20, 12, 0, 0);
const TABS = ['ROUTES', 'TRAVERSAL', 'SCHEDULE', 'SHOP', 'CRAFTING', 'STOCKPILE'];

async function health(page, log, clickTabs) {
  const r = await page.evaluate(() => ({ root: document.querySelector('#root').innerText.length, topbar: /Save/.test(document.body.innerText), menu: /TWO SURVIVAL FANTASIES/.test(document.body.innerText), zi: !!window.ZI && typeof ZI.listSlots === 'function' }));
  const tabErr = [];
  if (clickTabs && r.topbar) for (const t of TABS) {
    const el = page.getByText(t, { exact: true }).first();
    if (await el.count()) { await el.click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(400);
      const len = await page.evaluate(() => document.querySelector('#root').innerText.length); if (len < 50) tabErr.push(t + ': blank'); }
  }
  return { ...r, tabErr, errors: log.errors.filter(e => !/image-slots|404|Warning:/.test(e)).slice(0, 3) };
}

(async () => {
  const ctx = await context(null); await ctx.clock.install({ time: T0 });
  const page = await ctx.newPage(); let log = watch(page);
  await open(page);
  await page.evaluate(() => ZI.startNewInSlot('solo', 1)); await page.waitForTimeout(500); await open(page);
  await page.evaluate(() => { ZI.awardXp('scavenging', 800); ZI.enqueueJob('probe', 'probe', 3600, {}); ZI.saveToActiveSlot(); });
  for (const t of TABS) { const el = page.getByText(t, { exact: true }).first(); if (await el.count()) { await el.click().catch(() => {}); await page.waitForTimeout(300); } }
  await ctx.clock.fastForward(120000); await page.evaluate(() => ZI.saveToActiveSlot());
  const good = await page.evaluate(() => { const o = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o[k] = localStorage.getItem(k); } return o; });
  
  console.log('keys:', Object.keys(good).length, 'bytes:', JSON.stringify(good).length);
  const variants = {
    truncated: v => v.slice(0, Math.max(1, Math.floor(v.length / 2))),
    garbage: () => '\u0000%%corrupt%%',
    wrongType: v => (v.trim().startsWith('[') ? '{"x":1}' : v.trim().startsWith('{') ? '[1,2]' : '"text"'),
  };
  const rows = [];
  const keys = Object.keys(good).filter(k => k !== 'zisim_lock').sort();
  for (const k of keys) for (const [vn, fn] of Object.entries(variants)) {
    await page.evaluate(([g, k, v]) => { localStorage.clear(); for (const [a, b] of Object.entries(g)) localStorage.setItem(a, b); localStorage.setItem(k, v); localStorage.setItem('zisave_resume', JSON.stringify({ mode: 'solo', at: Date.now() })); }, [good, k, fn(good[k])]);
    log.errors.length = 0;
    let h;
    try { await page.reload(); await open(page); h = await health(page, log, false); }
    catch (e) { h = { root: 0, fatal: String(e.message).slice(0, 120), errors: log.errors.slice(0, 3) }; }
    h.nan = await page.evaluate(() => (document.body.innerText.match(/.{0,30}(NaN|undefined|Infinity).{0,20}/g) || []).slice(0, 3)); const ok = !h.nan.length && h.root > 0 && h.topbar && !(h.tabErr || []).length && !h.errors.length;
    rows.push({ key: k, variant: vn, ok, ...h });
    console.log((ok ? 'ok   ' : 'BAD  ') + k + ' [' + vn + '] ' + (ok ? '' : JSON.stringify(h).slice(0, 300)));
  }
  fs.writeFileSync(S + '/corrupt-nan.json', JSON.stringify(rows, null, 1));
  await ctx.close(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
