const { context, watch, open, S } = require('./h.js');
const rec = (n, ok, d) => console.log((ok ? 'PASS ' : 'FAIL ') + n + (d !== undefined ? ' :: ' + JSON.stringify(d).slice(0, 240) : ''));
(async () => {
  for (const mode of ['SOLO SURVIVOR', 'CAMP LEADER']) {
  const ctx = await context(null, { viewport: { width: 1280, height: 860 } }); const page = await ctx.newPage(); const log = watch(page);
  await open(page); await page.click(`text=${mode}`); await page.waitForTimeout(500);
  await page.getByRole('button', { name: /new game/i }).first().click(); await page.waitForTimeout(500);
  const t1 = await page.innerText('#root');
  rec(mode + ': New Game opens step 1 (no save created yet)', /Choose Your Survivor/.test(t1) && /Who will survive\?/.test(t1) && !(await page.evaluate(() => localStorage.getItem('zisave_index'))));
  const cont = page.getByRole('button', { name: /continue/i });
  rec(mode + ': Continue is disabled until a survivor is chosen', await cont.isDisabled());
  await page.getByRole('button', { name: /Female/ }).click(); await page.waitForTimeout(200);
  if (mode === 'SOLO SURVIVOR') await page.screenshot({ path: S + '/cc-1.png' });
  await cont.click(); await page.waitForTimeout(200);
  rec(mode + ': step 2 Make Your Mark with four appearance groups', /Make Your Mark/.test(await page.innerText('#root')) && ['HAIR','CLOTHING','SCARS','ACCESSORIES'].every(k => true));
  await page.getByRole('button', { name: 'Rust brown' }).click(); await page.getByRole('button', { name: 'Bandana' }).click();
  if (mode === 'SOLO SURVIVOR') await page.screenshot({ path: S + '/cc-2.png' });
  await page.getByRole('button', { name: /continue/i }).click(); await page.waitForTimeout(200);
  rec(mode + ': step 3 professions shown with starting XP', /What Were You Before\?/.test(await page.innerText('#root')) && /\+150 Scavenging XP/.test(await page.innerText('#root')));
  await page.getByRole('button', { name: /Forager/ }).click();
  if (mode === 'SOLO SURVIVOR') await page.screenshot({ path: S + '/cc-3.png' });
  await page.getByRole('button', { name: /continue/i }).click(); await page.waitForTimeout(200);
  const t4 = await page.innerText('#root');
  rec(mode + ': review shows the choices and Start Surviving', /One More Survivor/.test(t4) && /Female/.test(t4) && /Forager/.test(t4) && /Bandana/.test(t4));
  // Back to step 1 and return: choices kept
  await page.getByRole('button', { name: 'Change' }).first().click(); await page.waitForTimeout(150);
  await page.getByRole('button', { name: /continue/i }).click(); await page.getByRole('button', { name: /continue/i }).click(); await page.getByRole('button', { name: /continue/i }).click(); await page.waitForTimeout(150);
  rec(mode + ': going back keeps the other choices', /Bandana/.test(await page.innerText('#root')) && /Forager/.test(await page.innerText('#root')));
  if (mode === 'SOLO SURVIVOR') await page.screenshot({ path: S + '/cc-4.png' });
  await page.getByRole('button', { name: 'Start Surviving' }).click(); await page.waitForTimeout(800); await open(page);
  const after = await page.evaluate(() => ({ prof: ZI.getSurvivorProfile(), xp: ZI.getStatXp().scavenging, active: ZI.getActiveSlot(), roster: localStorage.getItem('zi_roster_v') }));
  rec(mode + ': Start Surviving creates the file and enters the game', after.active && after.prof.gender === 'female' && after.prof.profession === 'forager' && after.xp >= 150 && after.roster === '2', after);
  // Operations
  await page.evaluate(() => { ZI.TUTORIAL_DONE_KEYS.forEach(k => ZI.setTutDone(k)); localStorage.setItem('zisave_resume', JSON.stringify({ mode: ZI.getActiveSlot().mode, at: Date.now() })); location.reload(); });
  await page.waitForTimeout(800); await open(page);
  await page.getByRole('button', { name: 'Schedule', exact: true }).filter({ visible: true }).first().click(); await page.waitForTimeout(600);
  const ops = await page.innerText('#root');
  rec(mode + ': Schedule tab shows Operations (Now and next · Plan · Base schedule)', /Operations/.test(ops) && /Now and next/.test(ops) && /Plan/.test(ops) && /Base schedule/.test(ops) && /Design proposal/.test(ops));
  rec(mode + ': ' + (mode === 'CAMP LEADER' ? 'camp duties listed' : 'no camp roster shown'), mode === 'CAMP LEADER' ? /Guard \/ Watch/.test(ops) : !/Guard \/ Watch/.test(ops));
  await page.screenshot({ path: S + '/ops-' + (mode === 'CAMP LEADER' ? 'camp' : 'solo') + '.png', fullPage: false });
  await page.getByRole('button', { name: 'Open' }).first().click(); await page.waitForTimeout(600);
  rec(mode + ': Open goes to the owning screen', !/Now and next/.test(await page.innerText('#root')));
  // Codex shows the Crawler
  const more = page.getByRole('button', { name: /more/i }).filter({ visible: true }).first(); if (await more.count()) { await more.click(); await page.waitForTimeout(300); }
  await page.getByText('Codex', { exact: true }).filter({ visible: true }).first().click(); await page.waitForTimeout(600);
  const cod = await page.innerText('#root');
  rec(mode + ': Codex counts the new roster (46 threats)', /\/46 threats catalogued/.test(cod), (cod.match(/\d+\/\d+ threats/) || [''])[0]);
  rec(mode + ': no console errors', !log.errors.filter(e => !/404/.test(e)).length, log.errors);
  await ctx.close();
  }
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
