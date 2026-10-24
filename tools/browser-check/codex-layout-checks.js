// Codex art + phone layout (Oct 24). Codex: known field entries show their Wandering art (mapped sprite or the
// painted SVG) with the walking bob/sway; the "In development" tab lists the 60 expanded entries (ids 49-108) with
// art, never spawned. Wandering at phone width stacks the scene above the combat log at full width. Uses harness.js.
const { open } = require('./harness');
const out = []; const rec = (n, ok, x) => out.push((ok ? 'PASS' : 'FAIL') + ' | ' + n + ' | ' + (x || ''));
const navTo = async (page, label) => {
  for (let k = 0; k < 4; k++) await page.getByText('Skip', { exact: true }).first().click({ timeout: 800 }).catch(() => {});
  let b = page.locator('button:visible', { hasText: new RegExp('^' + label + '$') });
  if (!(await b.count())) { await page.getByText('MORE').first().click().catch(() => {}); await page.waitForTimeout(400); b = page.locator('button:visible', { hasText: new RegExp('^' + label + '$') }); }
  await b.first().click(); await page.waitForTimeout(900); };
const goCodex = (page) => navTo(page, 'Codex');
(async () => {
  const { browser, page, logs } = await open({ wait: 15000 });
  await page.click('text=SOLO SURVIVOR'); await page.waitForTimeout(1200);
  await page.locator('button', { hasText: '+ NEW GAME' }).first().click(); await page.waitForTimeout(2500);
  await page.getByText('Skip', { exact: true }).first().click({ timeout: 2000 }).catch(() => {});
  // Fixture: mark a few field records as discovered in this fresh test profile so their cards can open.
  await page.evaluate(() => { [1, 2, 6, 12, 14].forEach(id => ZI.discoverZombie(id)); });
  await goCodex(page);
  rec('Codex opens', await page.getByText('BESTIARY CODEX').count() > 0);
  rec('Header counts the 60 in-development entries', await page.getByText(/60 more in development/).count() > 0);
  rec('Wandering roster unchanged (45 field entries; expanded ids never in ZI.BESTIARY)', await page.evaluate(() => ZI.BESTIARY.length === 45 && !ZI.BESTIARY.some(b => b.id >= 49) && ZI.BESTIARY_EXPANDED.length === 60));
  const openCard = async (name) => { await page.getByText(name, { exact: true }).first().click(); await page.waitForTimeout(700); };
  const art = () => page.evaluate(() => { const b = document.querySelector('[data-codex-art]'); if (!b) return null; const imgs = [...b.querySelectorAll('img')];
    return { art: b.getAttribute('data-codex-art'), imgs: imgs.length, loaded: imgs.every(i => i.complete && i.naturalWidth > 0), t: (imgs[0] || b.firstElementChild).style.transform, w: Math.round(b.getBoundingClientRect().width) }; });
  const cases = [['Damp Lurker', '049-soggy-slump'], ['Simple Shambler', '051-lumbering-courier,053-frail-husk'], ['Pack Caller', '054-siren-stumper'], ['Sidestepper', '055-cinder-runner'], ['Chrome Dome Bruiser', '062-shatter-bone-bruiser']];
  for (const [name, exp] of cases) {
    await openCard(name); const a1 = await art(); await page.waitForTimeout(300); const a2 = await art();
    rec(`Codex ${name}: shows its Wandering art (${exp})`, !!a1 && a1.art === exp && (exp === 'svg' || a1.loaded), JSON.stringify(a1));
    rec(`Codex ${name}: art animates`, !!a1 && !!a2 && a1.t !== a2.t, (a1 && a1.t) + ' -> ' + (a2 && a2.t));
    if (name === 'Pack Caller') await page.screenshot({ path: 'codex-pack-caller.png' });
    await openCard(name); // close
  }
  await page.getByText('In development', { exact: true }).first().click(); await page.waitForTimeout(600);
  rec('In development tab lists 60 entries', await page.locator('[data-codex-dev]').count() === 60);
  for (const name of ['Muck Lurker', 'The Iron Titan']) { await openCard(name); const a = await art();
    rec(`In development: ${name} shows its art, loaded`, !!a && a.loaded && a.imgs === 1, JSON.stringify(a));
    await page.screenshot({ path: `codex-dev-${name.replace(/\W+/g, '-')}.png` }); await openCard(name); }
  // Phone
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(500);
  await openCard('The Iron Titan'); const pa = await art();
  rec('Phone: Codex art fits the screen', !!pa && pa.w <= 390, JSON.stringify(pa));
  await page.screenshot({ path: 'codex-phone.png' }); await openCard('The Iron Titan');
  // Navigate at desktop width: at phone width the header tab bar is wider than the screen (separate, existing issue)
  // and clicking an off-screen tab scrolls the whole app sideways, which would fake a layout result here.
  await page.setViewportSize({ width: 1400, height: 900 }); await navTo(page, 'Wandering');
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(800);
  if (!(await page.locator('[data-wander-layout]').count())) { await page.locator('button', { hasText: 'WANDER HERE' }).first().click({ timeout: 3000 }).catch(() => {}); await page.waitForTimeout(2500); }
  for (let k = 0; k < 3; k++) await page.getByText('Skip', { exact: true }).first().click({ timeout: 1000 }).catch(() => {});
  const lay = await page.evaluate(() => { const r = document.querySelector('[data-wander-layout]'); const sc = document.querySelector('[data-tut="scene"]'), lg = document.querySelector('[data-tut="log"]');
    const a = sc && sc.getBoundingClientRect(), b = lg && lg.getBoundingClientRect(); return { mode: r && r.getAttribute('data-wander-layout'), scene: a && [a.left, a.top, a.width, a.height].map(Math.round), log: b && [b.left, b.top, b.width].map(Math.round), docW: document.documentElement.scrollWidth }; });
  rec('Phone: Wandering stacks scene above the log at full width', lay.mode === 'stacked' && lay.scene && lay.scene[0] === 0 && lay.scene[2] >= 380 && lay.log && lay.log[1] >= lay.scene[1] + lay.scene[3] - 1 && lay.log[2] >= 380 && lay.docW <= 390, JSON.stringify(lay));
  await page.evaluate(() => { const Z = window.ZI; Z.setRetreatRules && Z.setRetreatRules({ hpOff: true, loadIgnore: true }); Z.wanderAct && Z.wanderAct(s => { s.hp = 100; s.resting = false; s.restAt = null; s.retreatHold = null; }); });
  let fit = null; for (let k = 0; k < 120 && !fit; k++) { await page.waitForTimeout(250); fit = await page.evaluate(() => { const z = document.querySelector('[data-zombie-sprite] img, [data-tut="scene"] div[style*="right: 20%"] svg'); const s = document.querySelector('[data-tut="scene"]'); const sv = [...document.querySelectorAll('svg')].find(x => x.getAttribute('viewBox') === '0 0 36 48');
    if (!z || !s) return null; const a = z.getBoundingClientRect(), b = s.getBoundingClientRect(), c = sv.getBoundingClientRect(); return { zombie: [a.left, a.right].map(Math.round), scene: [b.left, b.right].map(Math.round), survivor: [c.left, c.right].map(Math.round) }; }); }
  await page.screenshot({ path: 'wander-phone.png' });
  rec('Phone: zombie inside the scene and clear of the survivor', !!fit && fit.zombie[0] >= fit.scene[0] && fit.zombie[1] <= fit.scene[1] && fit.zombie[0] > fit.survivor[1], JSON.stringify(fit));
  await page.setViewportSize({ width: 1400, height: 900 }); await page.waitForTimeout(500);
  const desk = await page.evaluate(() => { const r = document.querySelector('[data-wander-layout]'); const lg = document.querySelector('[data-tut="log"]').getBoundingClientRect(); return { mode: r.getAttribute('data-wander-layout'), logW: Math.round(lg.width) }; });
  rec('Desktop: Wandering keeps the side-by-side layout (log 280 px)', desk.mode === 'side' && desk.logW === 280, JSON.stringify(desk));
  const errs = logs.filter(l => /^pageerror/.test(l) || (/^error/.test(l) && !/404|Warning: %s a style property/.test(l)));
  rec('Browser: no page errors', errs.length === 0, errs.slice(0, 3).join(' || ').slice(0, 300));
  console.log(out.join('\n')); await browser.close();
})().catch(e => { console.error('ERR', e.stack); console.log(out.join('\n')); process.exit(1); });
