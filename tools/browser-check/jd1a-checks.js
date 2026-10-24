const { open } = require('./harness');
const out = []; const rec = (n, ok, x) => out.push((ok ? 'PASS' : 'FAIL') + ' | ' + n + ' | ' + (x || ''));
(async () => {
  const { browser, page, logs } = await open({ wait: 15000 });
  await page.click('text=SOLO SURVIVOR'); await page.waitForTimeout(1200);
  await page.locator('button', { hasText: '+ NEW GAME' }).first().click(); await page.waitForTimeout(2500);
  await page.locator('button', { hasText: 'Skip' }).first().click().catch(()=>{}); await page.waitForTimeout(600);
  const st = await page.evaluate(() => ({ on: window.ZI.Jester.TABLE.firstMeetingOn, rec: window.ZI.Jester.get(), kit: window.ZI._rj('zi_starter_kit_given', false), stash: window.ZI.getStash().slice().sort() }));
  rec('Browser (TEST SAVE, new game): switch off; record says not eligible; the existing starter kit is given as today', st.on === false && st.rec && st.rec.eligible === false && st.kit === true && st.stash.includes('handmade_pouch') && st.stash.includes('scout_kit'), JSON.stringify(st));
  await page.locator('button', { hasText: 'WANDER HERE' }).first().click(); await page.waitForTimeout(4000);
  await page.locator('button', { hasText: 'Skip' }).first().click({ timeout: 2000 }).catch(()=>{});
  await page.waitForTimeout(15000);
  const w = await page.evaluate(() => { const s = window.ZI.getWanderRun(); return { active: s.active, jesterCamp: !!s.jesterCamp, wait: !!s.jesterWait, kills: s.kills }; });
  rec('Browser: Wandering plays normally (no camp, no wait) for 15 s', w.active && !w.jesterCamp && !w.wait, JSON.stringify(w));
  const errs = logs.filter(l => /^pageerror/.test(l) || (/^error/.test(l) && !/404/.test(l)));
  rec('Browser: no page errors', errs.length === 0, errs.slice(0, 3).join(' || ').slice(0, 300));
  console.log(out.join('\n')); await browser.close();
})().catch(e => { console.error('ERR', e.stack); console.log(out.join('\n')); process.exit(1); });
