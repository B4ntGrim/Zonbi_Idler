// Mobile nav (Oct 24): below 760 px the top bar is compact with a ☰ button that opens a side menu listing every
// screen; picking one opens it and closes the menu. Desktop keeps the full tab bar. Uses harness.js.
const { open } = require('./harness');
const out = []; const rec = (n, ok, x) => out.push((ok ? 'PASS' : 'FAIL') + ' | ' + n + ' | ' + (x || ''));
const overflow = (page) => page.evaluate(() => { const bad = []; document.querySelectorAll('body *').forEach(e => { if (e.scrollLeft > 0) bad.push(e.tagName + ':' + e.scrollLeft); }); return { docW: document.documentElement.scrollWidth, vw: innerWidth, scrolled: bad.slice(0, 5) }; });
(async () => {
  const { browser, page, logs } = await open({ wait: 15000 });
  await page.click('text=SOLO SURVIVOR'); await page.waitForTimeout(1200);
  await page.locator('button', { hasText: '+ NEW GAME' }).first().click(); await page.waitForTimeout(2500);
  for (let k = 0; k < 4; k++) await page.getByText('Skip', { exact: true }).first().click({ timeout: 800 }).catch(() => {});
  rec('Desktop: full tab bar, no ☰ button', await page.locator('[data-nav-toggle]').count() === 0 && await page.locator('button:visible', { hasText: /^Traversal$/ }).count() > 0);
  await page.setViewportSize({ width: 390, height: 844 }); await page.waitForTimeout(700);
  rec('Phone: compact bar with ☰ button', await page.locator('[data-topbar="compact"] [data-nav-toggle]').count() === 1);
  rec('Phone: bar shows the current screen name', /Traversal/i.test(await page.locator('[data-topbar="compact"]').innerText()), (await page.locator('[data-topbar="compact"]').innerText()).replace(/\n/g, ' · '));
  rec('Phone: nothing wider than the screen', (await overflow(page)).docW <= 390, JSON.stringify(await overflow(page)));
  const want = ['Routes', 'Traversal', 'Schedule', 'Market', 'Crafting', 'Stockpile', 'Factions', 'Stats', 'Wandering', 'Codex'];
  for (const label of ['Codex', 'Wandering', 'Stats', 'Market']) {
    await page.locator('[data-nav-toggle]').click(); await page.waitForTimeout(400);
    const items = await page.locator('[data-nav-drawer] [data-nav-item]').allInnerTexts();
    if (label === 'Codex') {
      rec('Menu lists every screen', want.every((w, i) => (items[i] || '').toLowerCase() === w.toLowerCase()), items.join(', '));
      const box = await page.locator('[data-nav-drawer]').boundingBox(); rec('Menu slides in from the left, inside the screen', box && box.x >= -1 && box.x + box.width <= 390, JSON.stringify(box));
      await page.screenshot({ path: 'nav-drawer.png' });
    }
    await page.locator('[data-nav-drawer] [data-nav-item]', { hasText: new RegExp('^' + label + '$', 'i') }).click(); await page.waitForTimeout(900);
    const bar = await page.locator('[data-topbar="compact"]').innerText();
    rec(`Pick ${label}: opens it and closes the menu`, await page.locator('[data-nav-drawer]').count() === 0 && new RegExp(label, 'i').test(bar), bar.replace(/\n/g, ' · '));
    rec(`${label}: nothing scrolled sideways`, (await overflow(page)).scrolled.length === 0 && (await overflow(page)).docW <= 390, JSON.stringify(await overflow(page)));
  }
  await page.locator('[data-nav-toggle]').click(); await page.waitForTimeout(300);
  await page.mouse.click(370, 400); await page.waitForTimeout(300);
  rec('Tapping outside the menu closes it', await page.locator('[data-nav-drawer]').count() === 0);
  await page.locator('[data-nav-toggle]').click(); await page.waitForTimeout(300); await page.keyboard.press('Escape'); await page.waitForTimeout(300);
  rec('Escape closes the menu', await page.locator('[data-nav-drawer]').count() === 0);
  await page.locator('[data-nav-toggle]').click(); await page.waitForTimeout(300); await page.locator('[data-nav-drawer] [data-nav-item="hack-slash"]').click(); await page.waitForTimeout(1500);
  for (let k = 0; k < 3; k++) await page.getByText('Skip', { exact: true }).first().click({ timeout: 800 }).catch(() => {});
  await page.screenshot({ path: 'nav-wandering-phone.png' });
  rec('Phone Wandering via menu: stacked layout at x=0', await page.evaluate(() => { const s = document.querySelector('[data-tut="scene"]'); const r = s && s.getBoundingClientRect(); return !!r && Math.round(r.left) === 0 && Math.round(r.width) >= 380; }));
  await page.setViewportSize({ width: 1400, height: 900 }); await page.waitForTimeout(700);
  rec('Back to desktop: full bar returns', await page.locator('[data-nav-toggle]').count() === 0 && await page.locator('button:visible', { hasText: /^Traversal$/ }).count() > 0);
  const errs = logs.filter(l => /^pageerror/.test(l) || (/^error/.test(l) && !/404|Warning: %s a style property/.test(l)));
  rec('Browser: no page errors', errs.length === 0, errs.slice(0, 3).join(' || ').slice(0, 300));
  console.log(out.join('\n')); await browser.close();
})().catch(e => { console.error('ERR', e.stack); console.log(out.join('\n')); process.exit(1); });
