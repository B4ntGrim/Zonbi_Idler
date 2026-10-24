const { open } = require('./harness');
const texts = (page) => page.$$eval('button', bs => bs.map(b => b.innerText.trim().replace(/\s+/g,' ')).filter(Boolean));
const out = []; const rec = (n, ok, x) => out.push((ok ? 'PASS' : 'FAIL') + ' | ' + n + ' | ' + (x || ''));
(async () => {
  const { browser, page, logs } = await open({ wait: 15000 });
  await page.click('text=SOLO SURVIVOR'); await page.waitForTimeout(1200);
  await page.locator('button', { hasText: '+ NEW GAME' }).first().click(); await page.waitForTimeout(2000);
  await page.locator('button', { hasText: 'Skip' }).first().click().catch(()=>{}); await page.waitForTimeout(800);
  await page.locator('button', { hasText: 'WANDER HERE' }).first().click(); await page.waitForTimeout(3000);
  await page.locator('button', { hasText: 'Skip' }).first().click({ timeout: 2000 }).catch(()=>{}); await page.waitForTimeout(500);
  const t = await texts(page);
  rec('RB2-1: no retreat button in the main bar (no Auto-retreat, no Retreat, no Retreat Rules)', !t.some(x => /Auto-retreat|^↩ Retreat|Retreat Rules/.test(x)), t.filter(x => /etreat|Withdraw/.test(x)).join(' / ') || 'none');
  await page.locator('button', { hasText: 'More actions' }).first().click(); await page.waitForTimeout(400);
  const menu = await texts(page);
  rec('RB2-2: More actions holds Run Back and no rules editor', menu.some(x => /Run Back/.test(x)) && !menu.some(x => /Retreat Rules|Rules/.test(x)), menu.filter(x => /Run Back|Rules|Idle|Gear/.test(x)).join(' / '));
  const rulesPanel = await page.evaluate(() => /HP floor|Stress ceiling|Load limit/.test(document.body.innerText));
  rec('RB2-3: no retreat-rules panel anywhere on the screen', !rulesPanel);
  await page.waitForTimeout(25000);  // walk a bit past the start so there is distance to go back
  if (!(await page.locator('button', { hasText: 'Run Back' }).count())) { await page.locator('button', { hasText: 'More actions' }).first().click(); await page.waitForTimeout(300); }
  await page.locator('button', { hasText: 'Run Back' }).first().click(); await page.waitForTimeout(800);
  const w = await page.evaluate(() => { const s = window.ZI.getWanderRun(); return { withdrawing: !!s.withdrawing, resting: !!s.resting, left: s.withdrawLeftM }; });
  rec('RB2-4: Run Back still starts the walk-back', w.withdrawing || w.resting, JSON.stringify(w));
  let line = null, title = null;
  for (let i = 0; i < 90 && !line; i++) { await page.waitForTimeout(1000); const r = await page.evaluate(() => { const el = document.querySelector('[data-retreat-line]'); return el ? { line: el.innerText, title: el.parentElement.firstChild.innerText } : null; }); if (r) { line = r.line; title = r.title; } }
  const rr = await page.evaluate(() => window.ZI.getRetreatRules());
  rec('RB2-5: while resting, the scene shows the retreat limits under the resting title', !!line && /Resting at/i.test(title) && line === `Retreats at HP ${rr.hpFloorPct}% · stress ${rr.stressCeiling} · load ${rr.loadLimitPct}%`, (title || '') + ' → ' + (line || 'not shown'));
  await page.screenshot({ path: '/home/claude/bt/rb2.png' });
  const errs = logs.filter(l => /^pageerror/.test(l) || (/^error/.test(l) && !/404/.test(l)));
  rec('No page errors', errs.length === 0, errs.slice(0, 3).join(' || ').slice(0, 300));
  console.log(out.join('\n')); await browser.close();
})().catch(e => { console.error('ERR', e.stack); console.log(out.join('\n')); process.exit(1); });
