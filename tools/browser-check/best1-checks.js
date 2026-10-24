// BEST1 browser acceptance (Sam, Oct 17): the TEST SAVE page shows the correct bestiary record for each Wandering fight,
// including the duplicated names (Trapper Zed 20/38, Battle Cry General 22/39). Uses harness.js (TEST SAVE page, zitest__ shim,
// new browser profile per run). Test fixture only: the REAL ZI._bgZombie is steered onto one record (its tier pool + an rng
// that lands on it); nothing else in the game is changed. The card shows name, HP, INIT and the sprite; it shows no tier or
// armor, so armor consistency is checked through page state (the fight event and the stat block the fight used).
const { open } = require('./harness');
const out = []; const rec = (n, ok, x) => out.push((ok ? 'PASS' : 'FAIL') + ' | ' + n + ' | ' + (x || ''));
const IDS = [20, 38, 22, 39, 1, 14];
(async () => {
  const { browser, page, logs } = await open({ wait: 15000 });
  await page.click('text=SOLO SURVIVOR'); await page.waitForTimeout(1200);
  await page.locator('button', { hasText: '+ NEW GAME' }).first().click(); await page.waitForTimeout(2500);
  await page.getByText('Skip', { exact: true }).first().click({ timeout: 2000 }).catch(() => {});
  await page.locator('button', { hasText: 'WANDER HERE' }).first().click(); await page.waitForTimeout(3000);
  await page.getByText('Skip', { exact: true }).first().click({ timeout: 2000 }).catch(() => {});
  await page.evaluate(() => { const Z = window.ZI, RK = { F:0,E:1,D:2,C:3,B:4,A:5,S:6,BOSS:7 }, orig = Z._bgZombie, sb = Z.STAT_FORMULAS.enemyStatBlock, re = Z.WanderSim.resolveEncounter;
    window.__best1 = { target: null, last: null, armorUsed: null };
    // Fixture (Oct 24 timing fix): turn off the automatic retreat rules in this fresh test profile. Loot carried over
    // several fights reached the load limit, the patrol went On hold, no further fights happened and the later
    // records (usually Battle Cry General 22/39) timed out with "no card seen".
    Z.setRetreatRules && Z.setRetreatRules({ hpOff: true, loadIgnore: true });
    Z._bgZombie = (lap, rng) => { const t = window.__best1.target; if (t == null) return orig(lap, rng); const rec = Z.BESTIARY.find(b => b.id === t), rank = RK[rec.tier], pool = Z.BESTIARY.filter(b => (RK[b.tier] ?? 0) <= rank), i = pool.indexOf(rec);
      rng && rng(); return orig((rank + 1) * 1.5 - 1e-9, () => (i + 0.5) / pool.length); };
    Z.STAT_FORMULAS.enemyStatBlock = function (z) { const o = sb.apply(this, arguments); window.__best1.armorUsed = o.armor; return o; };
    Z.WanderSim.resolveEncounter = function () { const o = re.apply(this, arguments); window.__best1.last = o; return o; }; });
  for (const id of IDS) {
    const exp = await page.evaluate((id) => { const Z = window.ZI, r = Z.BESTIARY.find(b => b.id === id); window.__best1.target = id; window.__best1.last = null;
      Z.wanderAct && Z.wanderAct(s => { s.hp = 100; s.resting = false; s.restAt = null; s.retreatHold = null; }); Z.syncWanderState && Z.syncWanderState({ hp: 100 });
      window.__best1.armorUsed = null;
      const type = (r.base || r.name || 'shambler').toLowerCase().replace(/\s+/g, '');
      return { id, name: r.name, tier: r.tier, hp: r.hp, armor: r.armor || 0, init: Math.round((r.spd || 0.6) * 12), sprites: [0, 1, 2, 3].map(f => window.ZI_ART.zombieSvg(type, f)) }; }, id);
    let seen = null;
    for (let k = 0; k < 100 && !seen; k++) { await page.waitForTimeout(250);
      seen = await page.evaluate((exp) => { const ev = window.__best1.last; if (!ev || ev.bestiaryId !== exp.id) return null;
        if (ev.outcome === 'escaped') { window.__best1.last = null; return null; } // an escape skips the fight (no stat block): wait for a real fight
        const label = [...document.querySelectorAll('div')].find(d => d.children.length === 0 && /HP · INIT/.test(d.textContent)); if (!label) return null;
        const card = label.parentElement.innerText, sprite = [...document.querySelectorAll('div')].find(d => d.innerHTML && d.innerHTML.trim().startsWith('<svg') && d.style && d.style.right === '20%');
        // Zombie sprites (Oct 24): mapped entries show processed sprite art instead of the SVG; accept their own mapped sprite.
        const mapped = (window.ZI_ART.ZOMBIE_SPRITE_MAP || {})[exp.id], imgWrap = document.querySelector('[data-zombie-sprite]');
        if (mapped && imgWrap) return { card, spriteMatch: mapped.map(k => window.ZI_ART.ZOMBIE_SPRITES[k].file).includes(imgWrap.getAttribute('data-zombie-sprite')), ev: { bestiaryId: ev.bestiaryId, tier: ev.tier, outcome: ev.outcome }, armorUsed: window.__best1.armorUsed };
        const norm = (h) => { const t = document.createElement('div'); t.innerHTML = h; return t.innerHTML; }; // the browser re-serializes SVG markup; compare like with like
        return { card, spriteMatch: !!sprite && exp.sprites.map(norm).includes(sprite.innerHTML), ev: { bestiaryId: ev.bestiaryId, tier: ev.tier, outcome: ev.outcome }, armorUsed: window.__best1.armorUsed }; }, exp); }
    await page.screenshot({ path: `best1-card-${id}.png` });
    const okCard = !!seen && seen.card.includes(exp.name) && new RegExp('/' + exp.hp + ' HP · INIT ' + exp.init + '\\b').test(seen.card);
    rec(`Browser: id ${id} ${exp.name} (tier ${exp.tier}) — card shows its own record (name, ${exp.hp} HP, INIT ${exp.init}) and its own sprite`, okCard && seen.spriteMatch, seen ? seen.card.replace(/\n/g, ' · ') + ' · sprite ' + (seen.spriteMatch ? 'match' : 'MISMATCH') : 'no card seen');
    rec(`Page state: id ${id} fight event carries bestiaryId ${id}, tier ${exp.tier}; armor used in the fight = bestiary armor ${exp.armor}`, !!seen && seen.ev.tier === exp.tier && seen.armorUsed === exp.armor, seen ? JSON.stringify(seen.ev) + ' armorUsed ' + seen.armorUsed : '');
  }
  const errs = logs.filter(l => /^pageerror/.test(l) || (/^error/.test(l) && !/404|Warning: %s a style property/.test(l)));
  rec('Browser: no page errors', errs.length === 0, errs.slice(0, 3).join(' || ').slice(0, 300));
  console.log(out.join('\n')); await browser.close();
})().catch(e => { console.error('ERR', e.stack); console.log(out.join('\n')); process.exit(1); });
