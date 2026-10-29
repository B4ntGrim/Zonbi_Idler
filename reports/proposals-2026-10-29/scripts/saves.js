// Save/resume: refresh, close/reopen, Continue, slot switching. Uses the real UI for menu steps.
const { context, watch, open, S } = require('./h.js');
const fs = require('fs');
const H = 3600e3, T0 = Date.UTC(2026, 9, 20, 12, 0, 0);
const xp = () => ({ xp: ZI.getStatXp().scavenging, screenText: document.body.innerText.slice(0, 160).replace(/\s+/g, ' '), active: ZI.getActiveSlot(),
  jobs: ZI._readJobsRaw().jobs.map(j => ({ t: j.type, creditedH: +((Date.now() - j.startedAt) / 3600e3).toFixed(3) })) });
const results = [];
const rec = (name, ok, detail) => { results.push({ name, ok, detail }); console.log((ok ? 'PASS ' : 'FAIL ') + name + ' :: ' + JSON.stringify(detail).slice(0, 400)); };

async function launch(dir, t) { const ctx = await context(dir); await ctx.clock.install({ time: t }); const page = ctx.pages()[0] || await ctx.newPage(); const log = watch(page); return { ctx, page, log }; }
async function continueSlot(page, mode, slot) {
  await page.click(mode === 'solo' ? 'text=SOLO SURVIVOR' : 'text=CAMP LEADER'); await page.waitForTimeout(600);
  const idx = await page.evaluate(([m, n]) => ZI.listSlots(m).filter(x => !x.empty).findIndex(x => x.slot === n), [mode, slot]);
  const btn = page.getByRole('button', { name: /continue/i }).nth(idx);
  await btn.click(); await page.waitForTimeout(500); await open(page);
}

(async () => {
  const dir = S + '/prof-saves'; fs.rmSync(dir, { recursive: true, force: true });
  // 1. New game in Solo slot 1, earn XP, save, earn more without saving.
  let { ctx, page, log } = await launch(dir, T0);
  await open(page);
  await page.evaluate(() => ZI.startNewInSlot('solo', 1)); await page.waitForTimeout(500); await open(page);
  await page.evaluate(() => { ZI.awardXp('scavenging', 1000); ZI.saveToActiveSlot(); ZI.awardXp('scavenging', 500); });
  const s0 = await page.evaluate(xp);
  rec('setup: 1,000 XP saved, then 500 more unsaved', s0.xp >= 1500, s0);

  // 2. Refresh.
  await page.reload(); await open(page);
  const s1 = await page.evaluate(xp);
  rec('refresh keeps unsaved progress in live storage', s1.xp === s0.xp, s1);
  rec('refresh returns the player to the game screen (not the mode picker)', !/TWO SURVIVAL FANTASIES/.test(s1.screenText), s1.screenText);

  // 3. Refresh 30 s later (outside the 20-s resume window).
  await ctx.clock.fastForward(30000); await page.reload(); await open(page);
  const s2 = await page.evaluate(xp);
  rec('refresh 30 s after New Game returns to the game screen', !/TWO SURVIVAL FANTASIES/.test(s2.screenText), s2.screenText);
  const closeAt = await page.evaluate(() => Date.now());
  await ctx.close();

  // 4. Close the browser, reopen 10 minutes later, choose Continue on the active slot.
  ({ ctx, page, log } = await launch(dir, closeAt + 10 * 60e3));
  await open(page);
  const s3 = await page.evaluate(xp);
  rec('after close/reopen, live progress is still in storage before any click', s3.xp === s0.xp, s3);
  await continueSlot(page, 'solo', 1);
  const s4 = await page.evaluate(xp);
  rec('Continue on the slot you were just playing keeps progress made since the last 💾 Save', s4.xp === s0.xp, { before: s0.xp, after: s4.xp });

  // 5. Slot switching: slot 1 has a 30-h job; play slot 2 for 48 h of real time; go back to slot 1.
  await page.evaluate(() => { ZI.enqueueJob('probe', 'probe', 30 * 3600, {}); ZI.saveToActiveSlot(); });
  const t5 = await page.evaluate(() => Date.now());
  await page.evaluate(() => ZI.startNewInSlot('solo', 2)); await page.waitForTimeout(500); await open(page);
  // keep slot 2 open for 48 h (the page heartbeat runs every second)
  for (let i = 0; i < 48; i++) await ctx.clock.fastForward(H);
  await page.waitForTimeout(1500);
  await page.evaluate(() => ZI.saveToActiveSlot());
  await page.evaluate(() => { ZI.clearResume(); }); await page.reload(); await open(page);
  await continueSlot(page, 'solo', 1);
  const s5 = await page.evaluate(xp);
  const pj = s5.jobs.find(j => j.t === 'probe');
  rec('slot 1 left for 48 h while slot 2 was played: its 30-h job gets at most 24 h of credit', !!pj && pj.creditedH <= 24.1, { slot1Jobs: s5.jobs, realHoursAway: (await page.evaluate(() => Date.now()) - t5) / H });

  // 6. Two tabs on the same save.
  const p2 = await ctx.newPage(); const log2 = watch(p2); await open(p2);
  await page.evaluate(() => ZI.awardXp('scavenging', 100));
  await p2.evaluate(() => ZI.awardXp('scavenging', 100));
  await page.waitForTimeout(1500);
  const tabs = [await page.evaluate(xp), await p2.evaluate(xp), await page.evaluate(() => JSON.parse(localStorage.getItem('zi_stat_xp')).scavenging)];
  rec('two open tabs: both XP grants survive in storage', tabs[2] === s5.xp + 200, { tab1: tabs[0].xp, tab2: tabs[1].xp, stored: tabs[2], expected: s5.xp + 200 });

  fs.writeFileSync(S + '/saves-results.json', JSON.stringify({ results, errors: log.errors.concat(log2.errors).filter(e => !/image-slots|404/.test(e)) }, null, 1));
  await ctx.close(); process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
