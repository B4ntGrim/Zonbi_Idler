// TRAV-01a fix 1 (PF11, Sam Oct 22): controller / keyboard focus inside the zone panel — browser checks F1–F9.
// Keyboard only: no mouse clicks on the map or the panel. Fresh test storage (TEST SAVE page). Run by trav01a-checks.js at its end,
// or on its own: node trav01a-fix1-checks.js
const { open } = require('./harness');
const sleep = (p, ms) => p.waitForTimeout(ms);
async function run(rec) {
  const { browser, page, logs } = await open({ wait: 30000 });
  await page.click('text=SOLO SURVIVOR'); await sleep(page, 1200);
  await page.locator('button', { hasText: '+ NEW GAME' }).first().click(); await sleep(page, 4000);
  await page.locator('button', { hasText: /^Skip/ }).first().click({ timeout: 3000 }).catch(() => {}); await sleep(page, 600);
  await page.mouse.move(2, 2);                                                    // pointer parked off the map; never clicked
  const key = async (k, n) => { for (let i = 0; i < (n === undefined ? 1 : n); i++) { await page.keyboard.press(k); await sleep(page, 140); } };
  const focused = () => page.evaluate(() => { const f = document.querySelector('[data-panel-focus="1"]'); return f ? (f.getAttribute('data-action') || f.getAttribute('data-trav')) : null; });
  const items = () => page.$$eval('[data-trav="zone-panel"] [data-action], [data-trav="zone-panel"] [data-trav="wander"], [data-trav="zone-panel"] [data-trav="close"]',
    bs => bs.map(b => ({ id: b.getAttribute('data-action') || b.getAttribute('data-trav'), off: b.disabled })));
  const hlCell = () => page.evaluate(() => { const c = [...document.querySelectorAll('[data-cell]')].find(e => /127, 224, 255\) 0px 0px 0px 2px inset/.test(getComputedStyle(e).boxShadow)); return c ? c.getAttribute('data-cell') : null; });
  const outline = () => page.evaluate(() => [...document.querySelectorAll('[data-trav="zone-panel"] button')].filter(b => /127, 224, 255\) 0px 0px 0px 2px inset/.test(getComputedStyle(b).boxShadow)).map(b => b.getAttribute('data-action') || b.getAttribute('data-trav')));
  const scouts = async () => +((await page.locator('[data-trav="scouts"]').innerText()).match(/(\d)\/5/)[1]);
  const posOf = () => page.evaluate(() => { const z = window.ZI.getTravZone(); return z.gx + ',' + z.gy; });
  // Land the highlight on the player's own cell: steer from the current highlight (or the player's cell if none) with arrows,
  // then wait out the cells' 0.15 s style transition before reading colours.
  const toOwnCell = async () => {
    await sleep(page, 300); const cur = await hlCell(), me = await posOf();
    const [mx, my] = me.split(',').map(Number);
    if (!cur) { const d = await page.evaluate(() => { const z = window.ZI.getTravZone();
        for (const [k, b] of [['ArrowRight','ArrowLeft'],['ArrowLeft','ArrowRight'],['ArrowDown','ArrowUp'],['ArrowUp','ArrowDown']]) { const dx = k === 'ArrowRight' ? 1 : k === 'ArrowLeft' ? -1 : 0, dy = k === 'ArrowDown' ? 1 : k === 'ArrowUp' ? -1 : 0;
          if (document.querySelector(`[data-cell="${z.gx + dx},${z.gy + dy}"]`)) return [k, b]; } return null; });
      await key(d[0]); await key(d[1]); }
    else { const [hx, hy] = cur.split(',').map(Number);
      await key(mx > hx ? 'ArrowRight' : 'ArrowLeft', Math.abs(mx - hx)); await key(my > hy ? 'ArrowDown' : 'ArrowUp', Math.abs(my - hy)); }
    await sleep(page, 300); return (await hlCell()) === me; };
  const focusTo = async (id) => { for (let i = 0; i < 12 && (await focused()) !== id; i++) await key('ArrowDown'); return (await focused()) === id; };

  const reloadTraversal = async () => {
    await page.evaluate(() => { window.localStorage.removeItem('zi_fresh_start'); window.localStorage.setItem('zisave_resume', JSON.stringify({ mode: 'solo', at: Date.now() })); });
    await page.reload(); await page.waitForFunction(() => window.ZI && document.querySelectorAll('button').length > 5, null, { timeout: 30000 }); await sleep(page, 1500); await page.mouse.move(2, 2); };
  const nbrKey = () => page.evaluate(() => { const z = window.ZI.getTravZone();
    for (const [k, dx, dy] of [['ArrowRight',1,0],['ArrowLeft',-1,0],['ArrowDown',0,1],['ArrowUp',0,-1]]) { const el = document.querySelector(`[data-cell="${z.gx + dx},${z.gy + dy}"]`); const c = window.ZI.worldCell(z.gx + dx, z.gy + dy, 'scavenge'); if (el && c.state !== 'locked') return k; } return null; });
  const BACK = { ArrowRight:'ArrowLeft', ArrowLeft:'ArrowRight', ArrowDown:'ArrowUp', ArrowUp:'ArrowDown' };

  // T: the Traversal tutorial step "Hover each option" (5 actions) can be finished with controller focus alone
  if (!(await page.evaluate(() => window.ZI.tutDone('zi_trav_tutorial_done')))) {
    await toOwnCell(); const nk = await nbrKey(); await key(nk); await key('Enter'); await sleep(page, 300);
    const tutOn = /Hover each option/.test(await page.evaluate(() => document.body.innerText));
    for (let i = 0; i < 6; i++) await key('ArrowDown');
    await sleep(page, 1200);
    rec('F-tut: during the tutorial, moving controller focus over the 5 actions completes "Hover each option" (panel closes as with mouse hover)', tutOn && (await page.locator('[data-trav="zone-panel"]').count()) === 0, 'tutorial menu shown ' + tutOn);
  } else rec('F-tut: tutorial already done in this save (skipped)', true);
  await page.evaluate(() => window.ZI.setTutDone('zi_trav_tutorial_done')); await reloadTraversal();

  // F1: confirm on own cell → focus on the first enabled action; Scout by keyboard spends 1 Traversal scout
  const landed = await toOwnCell(); const own = await hlCell(); await key('Enter'); await sleep(page, 250);
  let it = await items(); const firstOn = (it.find(x => !x.off) || {}).id, f0 = await focused();
  rec('F1: keyboard confirm moves focus into the panel, on the first enabled action', landed && !!f0 && f0 === firstOn, `focus ${f0}, first enabled ${firstOn}, items ${it.map(x => x.id + (x.off ? '(off)' : '')).join(',')}`);
  const s0 = await scouts(); const onScout = await focusTo('scout'); await key('Enter'); await sleep(page, 250); const s1 = await scouts();
  rec('F1: arrow to Scout, Enter → Traversal scouts drop by 1 (no mouse used)', onScout && s1 === s0 - 1, `${s0} → ${s1}`);
  rec('F4: after the action, focus stays on the same button (Scout)', (await focused()) === 'scout');

  // F2: Up/Down visit every button in order and wrap; only the focused one has the blue outline
  it = await items(); const seq = []; const start = await focused(); const k0 = it.findIndex(x => x.id === start);
  for (let i = 0; i < it.length; i++) { await key('ArrowDown'); seq.push(await focused()); }
  const want = it.map((_, i) => it[(k0 + 1 + i) % it.length].id);
  rec('F2: Down cycles every panel button in order and wraps back to the start', seq.join(',') === want.join(',') && seq[seq.length - 1] === start, seq.join(','));
  await key('ArrowUp'); const up1 = await focused();
  rec('F2: Up goes the other way (wraps at the top too)', up1 === it[(k0 - 1 + it.length) % it.length].id, `${start} → ${up1}`);
  const ol = await outline();
  rec('F2/F8: exactly the focused button has the 2px #7fe0ff outline', ol.length === 1 && ol[0] === up1, ol.join(','));

  // F3: greyed action (Travel on your own cell) takes focus; Enter does nothing; reason stays
  const p0 = await posOf(); const onTravel = await focusTo('travel'); await key('Enter'); await sleep(page, 200);
  const tr = await page.evaluate(() => { const b = document.querySelector('[data-trav="zone-panel"] [data-action="travel"]'); return { off: b.disabled, note: b.querySelector('[data-action-note]').innerText }; });
  rec('F3: focus on greyed Travel + Enter → nothing happens; reason stays visible; panel stays open', onTravel && tr.off && tr.note === "You're already here." && (await posOf()) === p0 && (await page.locator('[data-trav="zone-panel"]').count()) === 1, JSON.stringify(tr));

  // F4 (check 4): with focus in the panel, arrows don't move the map highlight
  await sleep(page, 300); const h0 = await hlCell(); await key('ArrowLeft'); await key('ArrowRight'); await key('ArrowDown'); await key('ArrowUp'); await sleep(page, 300);
  rec('F6: with focus in the panel, arrows do not move the map highlight', (await hlCell()) === h0 && h0 === own, `${own} / ${h0} / ${await hlCell()}`);

  // F5: Escape closes; the highlight is on the same cell
  await key('Escape'); await sleep(page, 350);
  rec('F5: Escape closes the panel; the map highlight is back on the same cell', (await page.locator('[data-trav="zone-panel"]').count()) === 0 && (await hlCell()) === own, await hlCell());

  // F9 (check 6): a far zone opened by keyboard → focus on Close
  const far = await page.evaluate(() => { const Z = window.ZI, z = Z.getTravZone();
    for (const [dx, dy, k] of [[2,0,'ArrowRight'],[-2,0,'ArrowLeft'],[0,2,'ArrowDown'],[0,-2,'ArrowUp']]) if (document.querySelector(`[data-cell="${z.gx + dx},${z.gy + dy}"]`)) return k; return null; });
  if (far) { await key(far, 2); await key('Enter'); await sleep(page, 250); it = await items();
    rec('F9: far zone opened by keyboard (every action greyed) → focus lands on Close', it.filter(x => x.id !== 'close').every(x => x.off) && (await focused()) === 'close', `${it.map(x => x.id + (x.off ? '(off)' : '')).join(',')} · focus ${await focused()}`);
    await key('Enter'); await sleep(page, 200);
    rec('F9: Enter on Close closes the panel and keeps the highlight on that zone', (await page.locator('[data-trav="zone-panel"]').count()) === 0 && !!(await hlCell()));
    await key(BACK[far], 2);
  } else rec('F9: far zone check', false, 'no cell 2 away in view');

  // F7 (check 8): a mouse click on the map clears panel focus; arrows go back to the map
  await key('Enter'); await sleep(page, 200); const hadFocus = !!(await focused());
  const nb = await page.evaluate(() => { const z = window.ZI.getTravZone(); for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) { const s = `[data-cell="${z.gx + dx},${z.gy + dy}"]`; if (document.querySelector(s)) return s; } return null; });
  await page.click(nb); await sleep(page, 250);
  const clr = await focused(); await sleep(page, 300); const hb = await hlCell(); const mk = await nbrKey(); await key(mk); await sleep(page, 300); const ha = await hlCell();
  rec('F7: a mouse click on the map clears panel focus; arrows then move the map highlight again', hadFocus && clr === null && (await outline()).length === 0 && hb !== ha, `before ${hadFocus} · after click ${clr} · hl ${hb} → ${ha}`);
  await key('Escape'); await page.mouse.move(2, 2);

  // F8 / check 7: phone-size window, keyboard only. T13: a controller confirm opens the side panel, not the bottom sheet (see report).
  await page.setViewportSize({ width: 390, height: 520 }); await sleep(page, 600);
  const landedP = await toOwnCell(); await key('Enter'); await sleep(page, 300);
  const where = await page.evaluate(() => ({ sheet: !!document.querySelector('[data-trav="sheet"] [data-trav="zone-panel"]'), side: !!document.querySelector('[data-trav="side-panel"] [data-trav="zone-panel"]') }));
  await focusTo('close');
  const vis = await page.evaluate(() => { const f = document.querySelector('[data-panel-focus="1"]'); let sc = f.parentElement; while (sc && !(sc.scrollHeight > sc.clientHeight && /auto|scroll/.test(getComputedStyle(sc).overflowY))) sc = sc.parentElement;
    const r = f.getBoundingClientRect(), v = sc ? sc.getBoundingClientRect() : { top: 0, bottom: innerHeight };
    return { scroller: !!sc, scrolled: sc ? sc.scrollTop : 0, inView: r.top >= v.top - 1 && r.bottom <= v.bottom + 1 && r.bottom <= innerHeight + 1 }; });
  rec('F8: phone-size window (390×520) — focus on Close is scrolled into view', vis.inView && vis.scroller && vis.scrolled > 0, JSON.stringify(Object.assign(where, vis)));
  const sp0 = await scouts(); await focusTo('scout'); await key('Enter'); await sleep(page, 250);
  const fAfter = await focused();
  rec('F8: phone-size window — same keyboard flow works (Scout runs, focus kept)', landedP && (await scouts()) === sp0 - 1 && fAfter === 'scout', `own cell ${landedP} · ${sp0} → ${await scouts()} · focus ${fAfter} · opened in ${where.sheet ? 'bottom sheet' : where.side ? 'side panel' : '?'}`);
  await page.screenshot({ path: '/home/claude/bt/trav01a-fix1-phone.png' });
  await key('Escape'); await page.setViewportSize({ width: 1400, height: 900 }); await sleep(page, 400);
  await toOwnCell(); await key('Enter'); await sleep(page, 250); await page.screenshot({ path: '/home/claude/bt/trav01a-fix1-desktop.png' }); await key('Escape');

  const errs = logs.filter(l => /^pageerror/.test(l) || (/^error/.test(l) && !/404|Failed to load resource/.test(l)));
  rec('Fix 1: no page errors', errs.length === 0, errs.slice(0, 3).join(' || '));
  await browser.close();
}
module.exports = { run };
if (require.main === module) { const out = []; const rec = (n, ok, x) => out.push((ok ? 'PASS' : 'FAIL') + ' | ' + n + ' | ' + (x == null ? '' : String(x).slice(0, 260)));
  run(rec).then(() => console.log(out.join('\n'))).catch(e => { console.error('ERR', e.stack); console.log(out.join('\n')); process.exit(1); }); }
