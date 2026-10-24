const { open } = require('./harness');
const texts = (page) => page.$$eval('button', bs => bs.map(b => b.innerText.trim().replace(/\s+/g,' ')).filter(Boolean));
const out = []; const rec = (n, ok, x) => { out.push((ok ? 'PASS' : 'FAIL') + ' | ' + n + ' | ' + (x || '')); };
const paceBtn = (page) => page.locator('button', { hasText: /(Walk|Jog|Run) .*m\/s/ }).first();
(async () => {
  const { browser, page, logs } = await open({ wait: 15000 });
  await page.click('text=SOLO SURVIVOR'); await page.waitForTimeout(1200);
  await page.locator('button', { hasText: '+ NEW GAME' }).first().click(); await page.waitForTimeout(2000);
  await page.locator('button', { hasText: 'Skip' }).first().click().catch(()=>{}); await page.waitForTimeout(800);
  await page.locator('button', { hasText: 'WANDER HERE' }).first().click(); await page.waitForTimeout(3000);
  await page.locator('button', { hasText: 'Skip' }).first().click({ timeout: 2000 }).catch(()=>{}); await page.waitForTimeout(500);

  // ── FX4 follow-up: speed shot through the screen ──
  await paceBtn(page).click(); await page.waitForTimeout(600);           // Walk → Jog
  const jogLabel = (await paceBtn(page).innerText()).trim();
  const jog = parseFloat(jogLabel.match(/([\d.]+)m\/s/)[1]);
  await page.evaluate(() => { const Z = window.ZI, lo = Z.getLoadout(); lo.consumable2 = 'stimpack'; Z.saveLoadout(lo); });
  await page.waitForTimeout(1200);
  await page.locator('button', { hasText: 'More actions' }).first().click(); await page.waitForTimeout(500);
  const shot = page.locator('button[title^="Use Adrenaline"]').first();
  const hasShot = await shot.count();
  if (hasShot) await shot.click(); await page.waitForTimeout(1200);
  const buffs = await page.evaluate(() => window.ZI.getActiveBuffs().filter(b => b.speedPct).map(b => ({ speedPct: b.speedPct, sec: Math.round((b.until - b.from) / 1000) })));
  const upLabel = (await paceBtn(page).innerText()).trim(); const up = parseFloat(upLabel.match(/([\d.]+)m\/s/)[1]);
  const logTxt = await page.evaluate(() => document.body.innerText);
  rec('FX4-a: the shot button is there once a speed shot is equipped', hasShot > 0, 'count ' + hasShot);
  rec('FX4-b: using it puts a 45-s +30% speed buff in the shared buff store', buffs.length === 1 && buffs[0].speedPct === 30 && buffs[0].sec === 45, JSON.stringify(buffs));
  rec('FX4-c: the pace label rises by 30% (' + jogLabel + ' → ' + upLabel + ')', Math.abs(up - Math.round(jog * 1.3 * 10) / 10) <= 0.11, jog + ' → ' + up);
  rec('FX4-d: the combat log reports the shot', /\+30% speed/.test(logTxt));
  await page.waitForTimeout(46000);
  const downLabel = (await paceBtn(page).innerText()).trim(); const down = parseFloat(downLabel.match(/([\d.]+)m\/s/)[1]);
  const buffsAfter = await page.evaluate(() => window.ZI.getActiveBuffs().filter(b => b.speedPct).length);
  rec('FX4-e: after 45 s the label drops back and the buff is gone', Math.abs(down - jog) < 0.051 && buffsAfter === 0, downLabel + ', active speed buffs ' + buffsAfter);

  // ── RB1 ──
  const t = await texts(page);
  rec('RB1-6: one retreat button in the main bar (the policy control); no manual Retreat, no separate Retreat Rules', t.filter(x => /Auto-retreat|Withdrawing/.test(x)).length === 1 && !t.some(x => /^↩ Retreat$/.test(x)) && !t.some(x => /Retreat Rules/.test(x)), t.filter(x => /retreat|Retreat|Withdraw/.test(x)).join(' / '));
  const rr = await page.evaluate(() => window.ZI.getRetreatRules());
  const pol = t.find(x => /Auto-retreat/.test(x)) || '';
  rec('RB1-5a: the policy button shows the current rules', pol.includes('HP ' + rr.hpFloorPct + '%') && pol.includes('Stress ' + rr.stressCeiling) && pol.includes('Load ' + rr.loadLimitPct + '%'), pol);
  await page.locator('button', { hasText: /Auto-retreat/ }).first().click(); await page.waitForTimeout(500);
  const panelOpen = await page.evaluate(() => /HP floor/.test(document.body.innerText) && /Stress ceiling/.test(document.body.innerText));
  rec('RB1-5b: clicking it opens the retreat rules', panelOpen);
  await page.locator('button', { hasText: /Auto-retreat/ }).first().click(); await page.waitForTimeout(300);
  const marks = await page.evaluate(() => ({ btn: document.querySelectorAll('button[title^="Select checkpoint"]').length, div: document.querySelectorAll('div[title^="Checkpoint at"]').length }));
  rec('RB1-6b: distance-bar checkpoints are not clickable (none reached yet on a new save; markers checked statically in the suite)', marks.btn === 0, JSON.stringify(marks));
  const before = await page.evaluate(() => { const s = window.ZI.getWanderRun(); return { scroll: s.scroll, mode: s.moveMode, cp: s.lastCheckpoint }; });
  if (!(await page.locator('button', { hasText: 'Run Back' }).count())) { await page.locator('button', { hasText: 'More actions' }).first().click(); await page.waitForTimeout(400); }
  await page.locator('button', { hasText: 'Run Back' }).first().click(); await page.waitForTimeout(1500);
  const after = await page.evaluate(() => { const s = window.ZI.getWanderRun(); return { scroll: s.scroll, withdrawing: !!s.withdrawing, left: s.withdrawLeftM, mode: s.moveMode, resting: !!s.resting }; });
  const t2 = await texts(page); const body2 = await page.evaluate(() => document.body.innerText);
  rec('RB1-1: Run Back starts a withdrawal (no teleport): the survivor is walking back with distance left', (after.withdrawing || after.resting) && !/Path retraced/.test(body2), JSON.stringify({ before, after }));
  rec('RB1-4: the pace is kept (Jog)', after.mode === 'jog' && t2.some(x => /Jog/.test(x)), after.mode);
  rec('RB1-5c: the main bar shows the withdrawal in progress', after.resting || t2.some(x => /Withdrawing/.test(x)), t2.filter(x => /Withdraw|Auto-retreat|Run Back/.test(x)).join(' / '));
  rec('RB1-log: the log reports the withdrawal', /Withdrawing —/.test(body2) || /⏪/.test(body2));
  await page.screenshot({ path: '/home/claude/bt/rb1.png' });
  const errs = logs.filter(l => /^pageerror/.test(l) || (/^error/.test(l) && !/404/.test(l)));
  rec('No page errors (React warnings and 404s for art files excluded)', errs.length === 0, errs.slice(0, 3).join(' || ').slice(0, 400));
  console.log(out.join('\n'));
  await browser.close();
})().catch(e => { console.error('ERR', e.stack); console.log(out.join('\n')); process.exit(1); });
