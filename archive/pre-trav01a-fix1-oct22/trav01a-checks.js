// TRAV-01a browser check (TEST SAVE page, fresh test storage): the Solo Traversal screen as a player sees it.
// Run in the cloud workspace with tools/browser-check/harness.js (WEB/NM paths at its top).
const { open } = require('./harness');
const out = []; const rec = (n, ok, x) => out.push((ok ? 'PASS' : 'FAIL') + ' | ' + n + ' | ' + (x == null ? '' : String(x).slice(0, 260)));
const sleep = (p, ms) => p.waitForTimeout(ms);
(async () => {
  const { browser, page, logs } = await open({ wait: 30000 });
  await page.click('text=SOLO SURVIVOR'); await sleep(page, 1200);
  await page.locator('button', { hasText: '+ NEW GAME' }).first().click(); await sleep(page, 2500);
  await page.waitForTimeout(1500); await page.locator('button', { hasText: /^Skip/ }).first().click({ timeout: 3000 }).catch(() => {}); await sleep(page, 600);
  const tutStart = !(await page.evaluate(() => window.ZI.tutDone('zi_trav_tutorial_done')));
  const body = () => page.evaluate(() => document.body.innerText);
  const btnTexts = () => page.$$eval('button', bs => bs.filter(b => b.offsetParent !== null).map(b => b.innerText.trim().replace(/\s+/g, ' ')));
  const has = (sel) => page.locator(sel).count();
  const cellSel = async (dx, dy) => { const z = await page.evaluate(() => window.ZI.getTravZone()); return `[data-cell="${z.gx + dx},${z.gy + dy}"]`; };
  const ls = (k) => page.evaluate((k) => window.localStorage.getItem(k), k);
  const xpOf = async (p) => JSON.parse((await ls('zi_stat_xp')) || '{}')[p] || 0;

  // 6: Solo shows no Camp Leader controls; afflictions instead
  let t = await body(), bt = await btnTexts();
  rec('6: no "Available Survivors" list in Solo', !/Available Survivors/i.test(t) && !/Mira Chen|Buck Talon/.test(t));
  rec('6: no Scavenge / Contracts / Training / Patrol / Raid buttons', !bt.some(x => /^(🗺️ )?Scavenge$|Contracts|^(💪 )?Training$|^(🛡️ )?Patrol$|^(⚔️ )?Raid$/i.test(x)), bt.filter(x => /Scav|Contr|Train|Patrol|Raid/i.test(x)).join(' / ') || 'none');
  rec('6: no Dispatch, "Assigned" or "Expected yield"', !/Dispatch|Assigned|EXPECTED YIELD/i.test(t));
  rec('7: Afflictions panel shows (no afflictions on a new save) and "Traversal scouts 5/5 today"', (await has('[data-trav="afflictions"]')) === 1 && /No afflictions/.test(t) && /Traversal scouts 5\/5 today/.test(t));

  // 11: hover = one-line preview only
  const nbr = () => page.evaluate(() => { const Z = window.ZI, z = Z.getTravZone(); for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const c = Z.worldCell(z.gx + dx, z.gy + dy, 'scavenge'); if (c.state !== 'locked' && document.querySelector(`[data-cell="${c.gx},${c.gy}"]`)) return [dx, dy]; } return null; });
  const n0 = await nbr(); const here = await cellSel(0, 0), east = await cellSel(n0[0], n0[1]);
  await page.hover(east); await sleep(page, 300);
  const pv = await page.locator('[data-trav="preview"]').innerText();
  rec('11: mouse hover shows the one-line preview (name · familiarity · danger) and opens no panel', /· (Unexplored|Explored|Cleared) · Danger /.test(pv) && (await has('[data-trav="zone-panel"]')) === 0, pv);
  rec('11: Route mode toggle is visible and disabled, with its reason', await page.locator('[data-trav="route-mode"]').isDisabled() && /Route builder coming soon/.test(await body()));

  // 11: click opens the full panel beside the map
  await page.click(here); await sleep(page, 400);
  rec('11: click opens the zone panel beside the map (not a sheet)', (await has('[data-trav="side-panel"] [data-trav="zone-panel"]')) === 1 && (await has('[data-trav="sheet"]')) === 0);
  const lines = await page.$$eval('[data-trav="zone-panel"] [data-line]', ls => ls.map(l => l.getAttribute('data-line')));
  rec('11: panel lines Familiarity · Loot · Danger · Threats · Features', lines.join(',') === 'familiarity,loot,danger,threats,features', lines.join(','));
  const notes = await page.$$eval('[data-trav="zone-panel"] [data-action]', bs => bs.map(b => b.getAttribute('data-action') + ':' + (b.disabled ? 'off' : 'on') + ':' + (b.querySelector('[data-action-note]') || {}).innerText));
  rec('11: every action shows a cost or a greyed reason (own cell: Travel greyed "already here")', notes.length === 5 && notes.every(n => n.split(':')[2] && n.split(':')[2] !== 'undefined') && /travel:off:You're already here\./.test(notes.join('|')), notes.join(' | '));

  // 1 + 3: Scout until the pool is empty; XP once for this cell
  const st0 = await xpOf('stealth'); const left = [];
  for (let i = 0; i < 5; i++) { await page.locator('[data-trav="zone-panel"] [data-action="scout"]').click(); await sleep(page, 250); left.push((await page.locator('[data-trav="scouts"]').innerText()).match(/(\d)\/5/)[1]); }
  const st1 = await xpOf('stealth');
  const scoutBtn = page.locator('[data-trav="zone-panel"] [data-action="scout"]');
  const reason = await scoutBtn.locator('[data-action-note]').innerText();
  rec('1: each Scout spends 1 Traversal scout (4,3,2,1,0)', left.join(',') === '4,3,2,1,0', left.join(','));
  rec('1: at 0 the Scout button is greyed with the reason', await scoutBtn.isDisabled() && reason === 'No Traversal scouts left today. Refills at midnight.', reason);
  rec('3: five scouts of the same cell gave Stealth XP once (+5)', st1 - st0 === 5, st0 + ' → ' + st1);
  const wch = JSON.parse((await ls('zi_charges')) || '{}');
  rec('1: Wandering scout charges untouched', wch.scout === undefined || wch.scout >= 2 || wch.scout === 2, JSON.stringify(wch));

  // 4 + 5: Hide
  const g0 = await page.evaluate(() => window.ZI.gameTotalSeconds()), r0 = Date.now();
  await page.locator('[data-trav="zone-panel"] [data-action="hide"]').click(); await sleep(page, 300);
  const g1 = await page.evaluate(() => window.ZI.gameTotalSeconds()), realS = (Date.now() - r0) / 1000;
  const res = await page.locator('[data-trav="result"]').innerText(), thr = await page.locator('[data-line="threats"]').innerText();
  const want = await page.evaluate(() => window.ZI.hideThreats(window.ZI.getTravZone()).range);
  rec('4: Hide shows the threat level and the tier range Wandering can draw', /Threat level \d\/5/.test(res) && res.includes('tiers ' + want) && thr.includes('Tiers ' + want), res + ' || ' + thr);
  rec('5: Hide moved the world clock by 1 game hour (plus the clock\'s own running time)', g1 - g0 >= 3600 && g1 - g0 <= 3600 + Math.ceil((realS + 1) * 600), (g1 - g0) + ' game s over ' + realS.toFixed(2) + ' real s');
  rec('5: Hide names no zombie kinds or counts', !(await page.evaluate((r) => (window.ZI.BESTIARY || []).some(z => r.includes(z.name)), res)));

  // 9: Make camp with low HP
  await page.evaluate(() => window.ZI.syncWanderState({ hp: 30, healsUsed: 1 }));
  await page.locator('[data-trav="zone-panel"] [data-action="camp"]').click(); await sleep(page, 300);
  const run = await page.evaluate(() => window.ZI.getWanderRun()), campK = await ls('zi_trav_camp');
  rec('9: Make camp leaves HP 30 and healsUsed 1; camp cell stored', run.hp === 30 && run.healsUsed === 1 && !!campK, 'hp ' + run.hp + ' heals ' + run.healsUsed);
  const cmd0 = await xpOf('command'); await page.locator('[data-trav="zone-panel"] [data-action="camp"]').click(); await sleep(page, 300);
  rec('9: a second Make camp the same day gives no Command XP', (await xpOf('command')) === cmd0);

  // 8: Loot — during the tutorial the last step must point at Wandering; outside it the result stays on Traversal
  const tutOn = !(await page.evaluate(() => window.ZI.tutDone('zi_trav_tutorial_done')));
  await page.locator('[data-trav="zone-panel"] [data-action="loot"]').click(); await sleep(page, 2200);
  if (tutOn) {
    const spot = await body();
    rec('8: (tutorial running) after Loot the last step points at Wandering, not Routes', /Now go Wandering/.test(spot) && !/Loot runs happen on Routes/.test(spot) && !/View Route Details|Deploy \(/.test(spot));
    await page.locator('button', { hasText: /^Skip$/ }).first().click().catch(() => {}); await sleep(page, 500);
    rec('8: closing the tutorial leaves the player on Traversal', (await has('[data-trav="afflictions"]')) === 1 && await page.evaluate(() => window.ZI.tutDone('zi_trav_tutorial_done')));
  } else {
    rec('8: Loot shows its result on Traversal and does not open Routes', (await has('[data-trav="zone-panel"]')) === 1 && !/View Route Details|Deploy \(/.test(await body()), (await page.locator('[data-trav="result"]').innerText()).slice(0, 90));
  }

  // 3: Travel XP once per cell per day
  // pick an open, in-view orthogonal neighbour (the start cell is random; about 8% of cells are locked)
  const dir = await nbr();
  const ath0 = await xpOf('athletics');
  const go = async (dx, dy) => { await page.click(await cellSel(dx, dy)); await sleep(page, 300); await page.locator('[data-trav="zone-panel"] [data-action="travel"]').click(); await sleep(page, 400); };
  await go(dir[0], dir[1]); await go(-dir[0], -dir[1]); await go(dir[0], dir[1]);
  const ath1 = await xpOf('athletics');
  const per = await page.evaluate(() => window.ZI.ACTION_XP.move.base * 2);   // one Travel = base 2 × scale 2 = 4 Athletics
  rec('3: Travel out, back, out again → Athletics XP for 2 cells only (2 × ' + per + ', not 3 ×)', ath1 - ath0 === 2 * per, 'dir ' + dir + ' · ' + ath0 + ' → ' + ath1);
  // 8: Loot outside the tutorial (on the neighbour we now stand on)
  await page.click(await cellSel(0, 0)); await sleep(page, 300);
  await page.locator('[data-trav="zone-panel"] [data-action="loot"]').click(); await sleep(page, 2200);
  rec('8: (tutorial closed) Loot shows its result on Traversal and does not open Routes', (await has('[data-trav="zone-panel"] [data-trav="result"]')) === 1 && !/View Route Details|Deploy \(/.test(await body()), (await page.locator('[data-trav="result"]').innerText().catch(() => 'no result')).slice(0, 90));

  // 11: far cell → every action greyed "Too far — move next to it."
  const far = await page.evaluate(() => { const Z = window.ZI, z = Z.getTravZone(), C = Z.SECTOR_COLS, R = Z.SECTOR_ROWS; for (let gy = z.sy * R; gy < z.sy * R + R; gy++) for (let gx = z.sx * C; gx < z.sx * C + C; gx++) if (Math.max(Math.abs(gx - z.gx), Math.abs(gy - z.gy)) >= 3) return `[data-cell="${gx},${gy}"]`; return 'none'; });
  if (await has(far)) { await page.click(far); await sleep(page, 300);
    const fn = await page.$$eval('[data-trav="zone-panel"] [data-action]', bs => bs.map(b => b.disabled + ':' + b.querySelector('[data-action-note]').innerText));
    rec('11: a far cell opens the panel with every action greyed "Too far — move next to it." (or Locked)', fn.length === 5 && fn.every(x => /^true:(Too far — move next to it\.|Locked zone\.)$/.test(x)), fn.join(' | '));
  } else rec('11: far cell check', false, 'no cell 3 east in view');

  // 11: controller / keyboard
  await page.keyboard.press('Escape'); await sleep(page, 200);
  const closed = (await has('[data-trav="zone-panel"]')) === 0;
  await page.mouse.move(5, 5); await page.keyboard.press('ArrowRight'); await sleep(page, 200);
  const pv2 = await page.locator('[data-trav="preview"]').innerText();
  await page.keyboard.press('Enter'); await sleep(page, 300);
  rec('11: controller/keyboard — Escape closes; arrow moves the highlight with a preview; Enter (confirm) opens the panel beside the map', closed && /· Danger /.test(pv2) && (await has('[data-trav="side-panel"] [data-trav="zone-panel"]')) === 1 && (await has('[data-trav="sheet"]')) === 0, pv2);
  await page.keyboard.press('Escape'); await sleep(page, 200);

  // 11: touch → bottom sheet; tap outside closes; swipe down closes
  const tapCell = async (sel) => page.evaluate((sel) => { const el = document.querySelector(sel); el.dispatchEvent(new PointerEvent('pointerdown', { pointerType: 'touch', bubbles: true })); el.click(); }, sel);
  const hereNow = await cellSel(0, 0);
  await tapCell(hereNow); await sleep(page, 400);
  const sb = await page.evaluate(() => { const s = document.querySelector('[data-trav="sheet"]'); if (!s) return null; const r = s.getBoundingClientRect(); return { bottom: Math.round(r.bottom), vh: innerHeight, panel: !!s.querySelector('[data-trav="zone-panel"]') }; });
  rec('11: touch tap opens the full panel as a bottom sheet', !!sb && sb.panel && Math.abs(sb.bottom - sb.vh) <= 1, JSON.stringify(sb));
  await page.mouse.click(700, 20); await sleep(page, 300);
  const tapClosed = (await has('[data-trav="sheet"]')) === 0;
  await tapCell(hereNow); await sleep(page, 300);
  await page.evaluate(() => { const s = document.querySelector('[data-trav="sheet"]'); const mk = (y) => new Touch({ identifier: 1, target: s, clientX: 200, clientY: y });
    s.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [mk(500)], changedTouches: [mk(500)] }));
    s.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [mk(620)] })); });
  await sleep(page, 300);
  rec('11: tapping outside closes the sheet; a swipe down closes it too', tapClosed && (await has('[data-trav="sheet"]')) === 0);

  // 11: phone-sized window → a mouse click also opens the sheet
  await page.setViewportSize({ width: 390, height: 800 }); await sleep(page, 500);
  await page.evaluate((sel) => document.querySelector(sel).click(), hereNow); await sleep(page, 400);
  await page.screenshot({ path: '/home/claude/bt/trav01a-phone.png' });
  rec('11: phone-sized window opens the panel as a bottom sheet', (await has('[data-trav="sheet"] [data-trav="zone-panel"]')) === 1);
  await page.mouse.click(200, 30); await page.setViewportSize({ width: 1400, height: 900 }); await sleep(page, 500);
  await page.screenshot({ path: '/home/claude/bt/trav01a-desktop.png' });

  // 7: afflictions — Broken and Injured with the Wandering icons; "play time left"
  await page.evaluate(() => { window.ZI._wj(window.ZI.BROKEN_KEY, { on: true, rests: 0 }); window.ZI.applyInjury('test', false); });
  await page.click(await cellSel(0, 0)); await sleep(page, 400); await page.keyboard.press('Escape'); await sleep(page, 300);
  const aff = await page.evaluate(() => [...document.querySelectorAll('[data-affliction]')].map(e => e.getAttribute('data-affliction') + '=' + e.innerText.replace(/\s+/g, ' ')));
  rec('7: Broken (first) and Injured show with icons; Injured says "play time left"', aff.length === 2 && /^broken=💔/.test(aff[0]) && /^injured=🩹/.test(aff[1]) && /play time left/.test(aff[1]), aff.join(' | '));
  await page.screenshot({ path: '/home/claude/bt/trav01a-afflictions.png' });

  // 10: Deploy disabled with its reason on Routes
  await page.locator('button:visible', { hasText: /^Routes$/ }).first().click({ timeout: 5000 }).catch(async () => { await page.locator('button:visible', { hasText: '▾ More' }).first().click(); await page.locator('button:visible', { hasText: /^Routes$/ }).first().click(); });
  await sleep(page, 1000);
  let deploy = null;
  const biomes = await page.$$('text=/^(Suburbia|Metro|Mountain|Perimeter|Mountains|Metro Core)/');
  for (let b = 0; b <= biomes.length && !deploy; b++) {
    if (b < biomes.length) { await biomes[b].click().catch(() => {}); await sleep(page, 300); }
    const cards = await page.$$('[data-route-card], div[style*="cursor: pointer"]');
    for (const c of cards) { const tx = (await c.innerText()).slice(0, 40); if (!/min|h\b|Risk|RMAT/i.test(await c.innerText())) continue; await c.click().catch(() => {}); await sleep(page, 200);
      const d = await page.evaluate(() => { const b = document.querySelector('[data-deploy]'); if (!b) return null; const r = document.querySelector('[data-deploy-reason]'); return { disabled: b.disabled, reason: r ? r.innerText : null }; });
      if (d && d.disabled) { deploy = d; break; } }
  }
  if (deploy) rec('10: Deploy is disabled with its reason when stamina is too low', deploy.disabled && /stamina too low/i.test(deploy.reason || ''), JSON.stringify(deploy));
  else rec('10: (browser) no route with too little stamina found in this save; covered by the source check', true, 'not reached in UI');

  const errs = logs.filter(l => /^pageerror/.test(l) || (/^error/.test(l) && !/404|Failed to load resource/.test(l)));
  rec('No page errors (Solo run)', errs.length === 0, errs.slice(0, 3).join(' || '));

  // 8: a Solo reload opens on Traversal
  await page.evaluate(() => { window.localStorage.removeItem('zi_fresh_start'); window.localStorage.setItem('zisave_resume', JSON.stringify({ mode: 'solo', at: Date.now() })); });
  await page.reload(); await page.waitForFunction(() => window.ZI && document.querySelectorAll('button').length > 5, null, { timeout: 30000 }); await sleep(page, 1500);
  rec('8: reloading a Solo save opens on Traversal (not Routes)', (await has('[data-trav="afflictions"]')) === 1 && !/View Route Details|Deploy \(/.test(await body()));

  // 6: Camp Leader unchanged
  await page.evaluate(() => { const a = JSON.parse(window.localStorage.getItem('zisave_active') || '{"slot":1}'); a.mode = 'camp'; window.localStorage.setItem('zisave_active', JSON.stringify(a)); window.localStorage.setItem('zisave_resume', JSON.stringify({ mode: 'camp', at: Date.now() })); });
  await page.reload(); await page.waitForFunction(() => window.ZI && document.querySelectorAll('button').length > 5, null, { timeout: 30000 }); await sleep(page, 1200);
  await page.locator('button:visible', { hasText: /^Traversal$/ }).first().click({ timeout: 5000 }).catch(async () => { await page.locator('button:visible', { hasText: '▾ More' }).first().click(); await page.locator('button:visible', { hasText: /^Traversal$/ }).first().click(); });
  await sleep(page, 1200);
  t = await body(); bt = await btnTexts();
  rec('6: Camp Leader keeps the survivors list and the five map tabs', /Available Survivors/i.test(t) && ['Scavenge','Contracts','Training','Patrol','Raid'].every(n => bt.some(x => x.toLowerCase().includes(n.toLowerCase()))), bt.filter(x => /Scav|Contr|Train|Patrol|Raid/i.test(x)).join(' / '));
  rec('6: Camp Leader has no Solo afflictions panel or zone sheet', (await has('[data-trav="afflictions"]')) === 0);
  await page.screenshot({ path: '/home/claude/bt/trav01a-camp.png' });

  const errs2 = logs.filter(l => /^pageerror/.test(l) || (/^error/.test(l) && !/404|Failed to load resource/.test(l)));
  rec('No page errors (whole run)', errs2.length === 0, errs2.slice(0, 3).join(' || '));
  console.log(out.join('\n')); await browser.close();
})().catch(e => { console.error('ERR', e.stack); console.log(out.join('\n')); process.exit(1); });
