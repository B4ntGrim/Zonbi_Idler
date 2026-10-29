const { context, watch, open, S } = require('./h.js');
const H = 3600e3, T0 = Date.UTC(2026, 9, 20, 12, 0, 0);
const rec = (n, ok, d) => console.log((ok ? 'PASS ' : 'FAIL ') + n + (d !== undefined ? ' :: ' + JSON.stringify(d).slice(0, 220) : ''));
(async () => {
  // fresh visit
  let ctx = await context(null); await ctx.clock.install({ time: T0 }); let page = await ctx.newPage(); let log = watch(page);
  await open(page); await page.click('text=SOLO SURVIVOR'); await page.waitForTimeout(600);
  const body = await page.innerText('body');
  rec('fresh browser: no phantom "Imported progress" file', !/Imported progress/.test(body) && (body.match(/Empty slot/g) || []).length === 3);
  // new game, codex tabs
  await page.evaluate(() => ZI.startNewInSlot('solo', 1)); await page.waitForTimeout(500); await open(page);
  await page.evaluate(() => { ZI.TUTORIAL_DONE_KEYS.forEach(k => ZI.setTutDone(k)); localStorage.setItem('zisave_resume', JSON.stringify({ mode: 'solo', at: Date.now() })); location.reload(); });
  await page.waitForTimeout(800); await open(page);
  const more = page.getByRole('button', { name: /more/i }).filter({ visible: true }).first(); if (await more.count()) { await more.click(); await page.waitForTimeout(300); }
  await page.getByText('Codex', { exact: true }).filter({ visible: true }).first().click(); await page.waitForTimeout(800);
  const codex = await page.innerText('#root');
  rec('Codex: no "In development" reveal-all tab for players', !/In development/i.test(codex.replace(/\d+ more in development/i, '')) && /All/.test(codex), (codex.match(/.{0,20}development.{0,20}/i) || [''])[0]);
  // heals: no Medkit -> 0
  const ch = await page.evaluate(() => ZI.chargeTotals());
  rec('new save: heal charges come only from the starter Medkit (2), no free base heals', ch.baseHeal === 0 && ch.heal === ch.kitHeal, ch);
  // damaged file with no backup -> message
  await page.evaluate(() => { ZI.startNewInSlot('solo', 2); }); await page.waitForTimeout(500); await open(page);
  await page.evaluate(() => { localStorage.setItem('zisave_data_solo_1', '{"zi_stat_xp":"{\\"sc'); localStorage.removeItem('zisave_prev_solo_1'); localStorage.removeItem('zisave_resume'); location.reload(); });
  await page.waitForTimeout(800); await open(page); await page.click('text=SOLO SURVIVOR'); await page.waitForTimeout(600);
  await page.getByRole('button', { name: /continue/i }).first().click(); await page.waitForTimeout(800);
  const note = await page.getByRole('status').innerText().catch(() => '');
  rec('Continue on a damaged file with no backup shows a message', /damaged and has no good backup/.test(note), note);
  rec('no console errors', !log.errors.filter(e => !/404/.test(e)).length, log.errors);
  await ctx.close();
  // clock moved back 2 h on a brand-new save
  const dir = S + '/prof-rollback'; require('fs').rmSync(dir, { recursive: true, force: true });
  ctx = await context(dir); await ctx.clock.install({ time: T0 }); page = ctx.pages()[0] || await ctx.newPage(); await open(page);
  await page.evaluate(() => ZI.startNewInSlot('solo', 1)); await page.waitForTimeout(500); await open(page); await page.waitForTimeout(2000);
  const seen = await page.evaluate(() => Number(localStorage.getItem('zi_offline_last_seen'))); await ctx.close();
  ctx = await context(dir); await ctx.clock.install({ time: seen - 2 * H }); page = ctx.pages()[0] || await ctx.newPage(); log = watch(page); await open(page);
  const cal = await page.evaluate(() => ({ c: ZI.getCalendar(), status: JSON.parse(localStorage.getItem('zi_status_v1')).lastGameSec }));
  rec('PC clock set back 2 h: calendar stays valid (no Year 0 / negative values)', cal.c.year >= 1 && cal.c.day >= 1 && cal.c.hh >= 0 && cal.c.mm >= 0 && cal.status >= 0, cal);
  await ctx.close(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
