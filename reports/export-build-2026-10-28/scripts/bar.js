const { context, watch } = require('./h.js');
async function bar(base) {
  const ctx = await context(null); const page = await ctx.newPage(); watch(page);
  await page.goto(base + 'index.html'); await page.waitForFunction(() => window.ZI && document.querySelector('#root')?.children.length, null, { timeout: 90000 });
  await page.evaluate(() => ZI.startNewInSlot('camp', 1)); await page.waitForTimeout(1500);
  await page.waitForFunction(() => window.ZI && document.body && /Save/.test(document.body.innerText), null, { timeout: 90000 });
  const before = await page.evaluate(() => document.querySelector('#root').innerText.split('\n').slice(0, 16).join('|'));
  await page.setViewportSize({ width: 1390, height: 900 }); await page.waitForTimeout(300); await page.setViewportSize({ width: 1400, height: 900 }); await page.waitForTimeout(1500);
  const after = await page.evaluate(() => document.querySelector('#root').innerText.split('\n').slice(0, 16).join('|'));
  await ctx.close(); return { before, after };
}
(async () => { for (const b of ['DevAB', 'Zonbi_Idler']) console.log(b, JSON.stringify(await bar('http://127.0.0.1:8765/' + b + '/'))); process.exit(0); })();
