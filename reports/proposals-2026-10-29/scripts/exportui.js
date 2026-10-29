// Export on "site A" (local dev page, in-browser Babel) → Import on "site B" (compiled hosted build, another origin),
// all through the real Save Files buttons, a real download and a real file upload.
const { context, watch, S } = require('./h.js');
const fs = require('fs');
const A = 'http://127.0.0.1:8765/Zonbi_Idler/Zombie%20Idler%20v2.html', B = 'http://localhost:8765/Zonbi_Idler/';
const ready = p => p.waitForFunction(() => window.ZI && document.body && document.querySelector('#root')?.children.length, null, { timeout: 90000 });
const res = []; const rec = (n, ok, d) => { res.push([ok, n]); console.log((ok ? 'PASS ' : 'FAIL ') + n + (d !== undefined ? ' :: ' + JSON.stringify(d).slice(0, 220) : '')); };
async function toSaveFiles(p, label) { await p.evaluate(() => { try { localStorage.removeItem('zisave_resume'); } catch (e) {} }); await p.reload(); await ready(p); await p.getByText(label, { exact: true }).first().click(); await p.waitForTimeout(600); }
(async () => {
  // Site A: a Solo game with progress, part of it unsaved.
  const ca = await context(null, { acceptDownloads: true }); const pa = await ca.newPage(); const la = watch(pa);
  await pa.goto(A); await ready(pa);
  await pa.evaluate(() => ZI.startNewInSlot('solo', 2)); await pa.waitForTimeout(1500); await ready(pa);
  await pa.evaluate(() => { ZI.awardXp('scavenging', 2000); ZI.saveToActiveSlot(); ZI.awardXp('scavenging', 345); });
  await toSaveFiles(pa, 'SOLO SURVIVOR');
  const [dl] = await Promise.all([pa.waitForEvent('download'), pa.getByRole('button', { name: 'Export' }).first().click()]);
  const file = S + '/' + dl.suggestedFilename(); await dl.saveAs(file);
  const note = await pa.getByRole('status').innerText().catch(() => '');
  rec('site A: Export downloads a .json file and confirms', /^zed-idler-solo-file2-\d{8}-\d{4}\.json$/.test(dl.suggestedFilename()) && /exported/i.test(note), [dl.suggestedFilename(), note]);
  const exp = JSON.parse(fs.readFileSync(file, 'utf8'));
  rec('the exported file includes the unsaved 345 XP (2,345 total)', JSON.parse(exp.snapshot.zi_stat_xp).scavenging === 2345);

  // Site B: its own unrelated game in File 1; import into empty File 3.
  const cb = await context(null); const pb = await cb.newPage(); const lb = watch(pb);
  await pb.goto(B); await ready(pb);
  await pb.evaluate(() => ZI.startNewInSlot('solo', 1)); await pb.waitForTimeout(1500); await ready(pb);
  await pb.evaluate(() => { ZI.awardXp('scavenging', 11); ZI.saveToActiveSlot(); });
  await toSaveFiles(pb, 'SOLO SURVIVOR');
  const imports = pb.getByRole('button', { name: 'Import' });
  rec('site B: every slot offers Import', (await imports.count()) === 3, await imports.count());
  const [chooser] = await Promise.all([pb.waitForEvent('filechooser'), imports.nth(2).click()]);
  await chooser.setFiles(file); await pb.waitForTimeout(800);
  const nb = await pb.getByRole('status').innerText().catch(() => '');
  const cards = await pb.evaluate(() => ZI.listSlots('solo').map(s => s.empty ? 'empty' : s.label));
  rec('site B: import into File 3 confirms and the card appears', /Imported into File 3/.test(nb) && cards[2] !== 'empty', [nb, cards]);
  rec('site B: File 1 is untouched', await pb.evaluate(() => ZI.getStatXp().scavenging === 11 && JSON.parse(JSON.parse(localStorage.getItem('zisave_data_solo_1')).zi_stat_xp).scavenging === 11));
  // Continue on File 3 (third Continue button).
  await pb.getByRole('button', { name: /continue/i }).nth(1).click(); await pb.waitForTimeout(1500); await ready(pb);
  const after = await pb.evaluate(() => ({ xp: ZI.getStatXp().scavenging, active: ZI.getActiveSlot(), bar: document.body.innerText.slice(0, 40) }));
  rec('site B: Continue on the imported file plays it with 2,345 XP', after.xp === 2345 && after.active.slot === 3, after);

  // Refusals through the UI: a damaged copy and a Solo file into Camp Leader.
  const broken = S + '/broken-save.json'; fs.writeFileSync(broken, fs.readFileSync(file, 'utf8').slice(0, 500));
  await toSaveFiles(pb, 'SOLO SURVIVOR');
  const before = await pb.evaluate(() => JSON.stringify(localStorage));
  let [ch2] = await Promise.all([pb.waitForEvent('filechooser'), pb.getByRole('button', { name: 'Import' }).nth(1).click()]);
  await ch2.setFiles(broken); await pb.waitForTimeout(600);
  const nd = await pb.getByRole('status').innerText().catch(() => '');
  rec('damaged file: refused with a message, nothing written', /damaged/i.test(nd) && before === await pb.evaluate(() => JSON.stringify(localStorage)), nd);
  await pb.getByRole('button', { name: 'OK' }).click();
  await pb.getByRole('button', { name: /change game mode/i }).click(); await pb.waitForTimeout(300);
  await pb.getByText('CAMP LEADER', { exact: true }).first().click(); await pb.waitForTimeout(500);
  [ch2] = await Promise.all([pb.waitForEvent('filechooser'), pb.getByRole('button', { name: 'Import' }).first().click()]);
  await ch2.setFiles(file); await pb.waitForTimeout(600);
  const nm = await pb.getByRole('status').innerText().catch(() => '');
  rec('a Solo file on the Camp Leader screen is refused with a message', /Solo Survivor save/.test(nm), nm);
  // Import over the live file via the confirm step: replaces it and reloads into it.
  await pb.getByRole('button', { name: 'OK' }).click();
  await pb.getByRole('button', { name: /change game mode/i }).click(); await pb.waitForTimeout(300);
  await pb.getByText('SOLO SURVIVOR', { exact: true }).first().click(); await pb.waitForTimeout(500);
  await pb.evaluate(() => ZI.awardXp('scavenging', 1)); // live File 3 now differs from the export
  await pb.getByRole('button', { name: 'Import' }).nth(2).click(); // filled slot → confirm first
  rec('importing over a filled file asks first', /Replace this file with an imported save\?/.test(await pb.innerText('body')));
  [ch2] = await Promise.all([pb.waitForEvent('filechooser'), pb.getByRole('button', { name: 'Yes' }).click()]);
  await ch2.setFiles(file); await pb.waitForTimeout(1500); await ready(pb);
  const over = await pb.evaluate(() => ({ xp: ZI.getStatXp().scavenging, inGame: /Save · Slot 3/.test(document.body.innerText) }));
  rec('import over the live file loads the imported progress (2,345)', over.xp === 2345 && over.inGame, over);
  const errs = la.errors.concat(lb.errors).filter(e => !/image-slots|404/.test(e));
  rec('no console errors on either site', !errs.length, errs);
  console.log(JSON.stringify({ passed: res.filter(r => r[0]).length, failed: res.filter(r => !r[0]).length }));
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
