// Damaged save FILES: corrupt the slot index / active pointer / slot snapshot, then use the Save Files screen.
const { context, watch, open, S } = require('./h.js');
const fs = require('fs');
const good = JSON.parse(fs.readFileSync(S + '/good-storage.json', 'utf8'));
const cases = [
  ['zisave_index', 'truncated', v => v.slice(0, v.length / 2 | 0)],
  ['zisave_index', 'slot entry is null', () => JSON.stringify({ solo: { 1: null } })],
  ['zisave_active', 'garbage', () => '%%'],
  ['zisave_data_solo_1', 'truncated', v => v.slice(0, v.length / 2 | 0)],
  ['zisave_data_solo_1', 'garbage', () => '%%corrupt'],
  ['zisave_data_solo_1', 'inner key truncated', v => { const o = JSON.parse(v); o.zi_stat_xp = o.zi_stat_xp.slice(0, 10); return JSON.stringify(o); }],
  ['zisave_data_solo_1', 'empty object', () => '{}'],
];
(async () => {
  const ctx = await context(null); const page = await ctx.newPage(); const log = watch(page);
  await open(page);
  for (const [k, name, fn] of cases) {
    await page.evaluate(([g, k, v]) => { localStorage.clear(); for (const [a, b] of Object.entries(g)) localStorage.setItem(a, b); localStorage.setItem(k, v); localStorage.removeItem('zisave_resume'); }, [good, k, fn(good[k])]);
    log.errors.length = 0; let r = {};
    try {
      await page.reload(); await open(page);
      await page.click('text=SOLO SURVIVOR'); await page.waitForTimeout(700);
      r.saveScreen = (await page.innerText('body')).match(/Save Files[\s\S]{0,220}/)?.[0].replace(/\s+/g, ' ') || 'NO SAVE SCREEN: ' + (await page.innerText('body')).slice(0, 120);
      const btn = page.getByRole('button', { name: /continue/i }).first();
      if (await btn.count()) { await btn.click(); await page.waitForTimeout(800); await open(page);
        r.afterContinue = (await page.innerText('body')).slice(0, 100).replace(/\s+/g, ' ');
        r.xp = await page.evaluate(() => { try { return ZI.getStatXp().scavenging; } catch (e) { return 'err ' + e.message; } });
      } else r.afterContinue = 'no Continue button';
    } catch (e) { r.fatal = e.message.slice(0, 150); }
    r.errors = log.errors.filter(e => !/image-slots|404|Warning:/.test(e)).slice(0, 3);
    console.log(k + ' [' + name + '] ' + JSON.stringify(r));
  }
  process.exit(0);
})();
