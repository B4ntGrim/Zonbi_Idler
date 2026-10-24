const { open } = require('./harness');
const out = []; const rec = (n, ok, x) => out.push((ok ? 'PASS' : 'FAIL') + ' | ' + n + ' | ' + (x || ''));
const restLow = (page, hp) => page.evaluate((hp) => { const Z = window.ZI; Z._wj(Z.STRESS_KEY, { value: 70 });
  Z.wanderAct(s => { s.hp = hp; s.resting = true; s.restAt = 'checkpoint'; s.restStartHp = hp; s.restElapsedMs = 0; s.withdrawing = false; }); }, hp);
const hp = (page) => page.evaluate(() => window.ZI.getWanderRun().hp);
(async () => {
  const { browser, page, logs } = await open({ wait: 15000 });
  await page.click('text=SOLO SURVIVOR'); await page.waitForTimeout(1200);
  await page.locator('button', { hasText: '+ NEW GAME' }).first().click(); await page.waitForTimeout(2500);
  await page.locator('button', { hasText: 'Skip' }).first().click().catch(()=>{}); await page.waitForTimeout(600);
  await page.evaluate(() => { const Z = window.ZI; const lo = Z.getLoadout(); const slot = Z.GEAR_SLOTS.find(s => s.accepts === 'consumable').id; lo[slot] = 'medkit'; Z.saveLoadout(lo); });
  await page.locator('button', { hasText: 'WANDER HERE' }).first().click(); await page.waitForTimeout(4000);
  await page.locator('button', { hasText: 'Skip' }).first().click({ timeout: 2000 }).catch(()=>{});
  await page.waitForTimeout(2000);
  // A: Heal button while resting
  await restLow(page, 30); await page.evaluate(() => window.ZI._wj('zi_charges', Object.assign({}, window.ZI._rj('zi_charges', {}), { heal: 2 })));
  await page.waitForTimeout(1500); const h0 = await hp(page);
  await page.locator('button', { hasText: '⛑ Heal' }).first().click(); await page.waitForTimeout(500); const h1 = await hp(page);
  await page.waitForTimeout(6000); const h2 = await hp(page);
  rec('Browser: ⛑ Heal while resting — HP rises and stays up after 6 s of rest ticks', h1 > h0 + 1 && h2 >= h1, `${h0.toFixed(1)} → ${h1.toFixed(1)} → ${h2.toFixed(1)}`);
  // B: equipped Field Medkit via More actions while resting
  await page.locator('button', { hasText: 'More actions' }).first().click().catch(()=>{}); await page.waitForTimeout(600);
  await restLow(page, 20); await page.waitForTimeout(1500); const k0 = await hp(page);
  const btn = page.locator('button[title^="Use Field Medkit"]').first(); const vis = await btn.isVisible().catch(() => false);
  if (vis) { await btn.click(); await page.waitForTimeout(500); }
  const k1 = await hp(page); await page.waitForTimeout(6000); const k2 = await hp(page);
  rec('Browser: equipped Field Medkit (More actions) while resting — +60 kept after 6 s', vis && k1 >= k0 + 59 && k2 >= k1, `button ${vis}; ${k0.toFixed(1)} → ${k1.toFixed(1)} → ${k2.toFixed(1)}`);
  const errs = logs.filter(l => /^pageerror/.test(l) || (/^error/.test(l) && !/404/.test(l)));
  rec('Browser: no page errors', errs.length === 0, errs.slice(0, 3).join(' || ').slice(0, 300));
  console.log(out.join('\n')); await browser.close();
})().catch(e => { console.error('ERR', e.stack); console.log(out.join('\n')); process.exit(1); });
