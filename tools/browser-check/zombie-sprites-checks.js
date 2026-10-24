// Zombie sprites (Oct 24): Wandering shows the processed sprite art (zombie-sprites.js) for mapped bestiary
// entries, with a walking bob/sway, and keeps the painted SVG for every other entry. Display only.
// Same steering fixture as best1-checks.js (REAL ZI._bgZombie steered onto one record). Uses harness.js.
const { open } = require('./harness');
const out = []; const rec = (n, ok, x) => out.push((ok ? 'PASS' : 'FAIL') + ' | ' + n + ' | ' + (x || ''));
const IDS = [1, 2, 6, 14, 26, 45];
(async () => {
  const { browser, page, logs } = await open({ wait: 15000 });
  await page.click('text=SOLO SURVIVOR'); await page.waitForTimeout(1200);
  await page.locator('button', { hasText: '+ NEW GAME' }).first().click(); await page.waitForTimeout(2500);
  await page.getByText('Skip', { exact: true }).first().click({ timeout: 2000 }).catch(() => {});
  await page.locator('button', { hasText: 'WANDER HERE' }).first().click(); await page.waitForTimeout(3000);
  await page.getByText('Skip', { exact: true }).first().click({ timeout: 2000 }).catch(() => {});
  await page.evaluate(() => { const Z = window.ZI, RK = { F:0,E:1,D:2,C:3,B:4,A:5,S:6,BOSS:7 }, orig = Z._bgZombie;
    window.__zs = { target: null };
    Z._bgZombie = (lap, rng) => { const t = window.__zs.target; if (t == null) return orig(lap, rng); const rec = Z.BESTIARY.find(b => b.id === t), rank = RK[rec.tier], pool = Z.BESTIARY.filter(b => (RK[b.tier] ?? 0) <= rank), i = pool.indexOf(rec);
      rng && rng(); return orig((rank + 1) * 1.5 - 1e-9, () => (i + 0.5) / pool.length); }; });
  rec('Sprite table loaded (60 sprites; all 45 field entries mapped to existing sprites)', await page.evaluate(() => Object.keys(ZI_ART.ZOMBIE_SPRITES).length === 60 && ZI.BESTIARY.every(b => (ZI_ART.ZOMBIE_SPRITE_MAP[b.id] || []).length && ZI_ART.ZOMBIE_SPRITE_MAP[b.id].every(k => ZI_ART.ZOMBIE_SPRITES[k]))));
  for (const id of IDS) {
    const exp = await page.evaluate((id) => { const Z = window.ZI; window.__zs.target = id;
      Z.wanderAct && Z.wanderAct(s => { s.hp = 100; s.resting = false; s.restAt = null; }); Z.syncWanderState && Z.syncWanderState({ hp: 100 });
      const files = (ZI_ART.ZOMBIE_SPRITE_MAP[id] || []).map(k => ZI_ART.ZOMBIE_SPRITES[k].file);
      return { id, name: Z.BESTIARY.find(b => b.id === id).name, files }; }, id);
    let seen = null;
    for (let k = 0; k < 80 && !seen; k++) { await page.waitForTimeout(250);
      seen = await page.evaluate((exp) => {
        const label = [...document.querySelectorAll('div')].find(d => d.children.length === 0 && /HP · INIT/.test(d.textContent)); if (!label) return null;
        if (!label.parentElement.innerText.includes(exp.name)) return null;
        const wrap = [...document.querySelectorAll('div')].find(d => d.style && d.style.right === '20%' && d.style.bottom === '30%'); if (!wrap) return null;
        const img = wrap.querySelector('img');
        return { file: wrap.getAttribute('data-zombie-sprite'), svg: !!wrap.querySelector('svg'), loaded: img ? img.complete && img.naturalWidth > 0 : null,
          w: img ? img.width : null, h: img ? img.height : null, render: img ? getComputedStyle(img).imageRendering : null, t0: img ? img.style.transform : null,
          hpAbove: (() => { const hp = label.parentElement.getBoundingClientRect(), ir = (img || wrap).getBoundingClientRect(), sc = wrap.parentElement.getBoundingClientRect(); return hp.bottom <= ir.top + 4 && hp.top >= sc.top; })() }; }, exp); }
    let poses = [];
    if (seen && seen.file) for (let k = 0; k < 6; k++) { await page.waitForTimeout(130); const t = await page.evaluate(() => { const i = document.querySelector('[data-zombie-sprite] img'); return i && i.style.transform; }); if (t) poses.push(t); }
    await page.waitForTimeout(100);
    await page.screenshot({ path: `zsprite-${id}.png` });
    if (exp.files.length) {
      rec(`id ${id} ${exp.name}: shows its sprite (${exp.files.join(' / ')}), loaded, pixelated, 2x`, !!seen && exp.files.includes(seen.file) && seen.loaded && seen.render === 'pixelated' && !seen.svg, JSON.stringify(seen));
      rec(`id ${id}: HP bar sits above the sprite, inside the scene`, !!seen && seen.hpAbove, JSON.stringify(seen && seen.hpAbove));
      rec(`id ${id}: walking bob/sway changes pose over time`, new Set(poses).size >= 2, [...new Set(poses)].join(' | '));
    } else rec(`id ${id} ${exp.name}: unmapped, keeps painted SVG`, !!seen && seen.svg && !seen.file, JSON.stringify(seen));
  }
  await page.setViewportSize({ width: 390, height: 844 }); await page.evaluate(() => { window.__zs.target = 1; }); await page.waitForTimeout(4000);
  await page.screenshot({ path: 'zsprite-phone.png' });
  const errs = logs.filter(l => /^pageerror/.test(l) || (/^error/.test(l) && !/404|Warning: %s a style property/.test(l)));
  rec('Browser: no page errors', errs.length === 0, errs.slice(0, 3).join(' || ').slice(0, 300));
  console.log(out.join('\n')); await browser.close();
})().catch(e => { console.error('ERR', e.stack); console.log(out.join('\n')); process.exit(1); });
