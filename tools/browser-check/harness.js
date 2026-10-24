// Headless browser harness: loads the TEST SAVE page with CDN libraries served from local npm copies.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
const WEB = '/home/claude/web', NM = '/home/claude/jsxcheck/node_modules';
const CDN = {
  'https://unpkg.com/react@18.3.1/umd/react.development.js': NM + '/react/umd/react.development.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js': NM + '/react-dom/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js': NM + '/@babel/standalone/babel.min.js',
};
const type = (f) => ({ '.html':'text/html', '.js':'application/javascript', '.jsx':'text/babel', '.css':'text/css' })[path.extname(f)] || 'application/octet-stream';
async function open(opts) {
  opts = opts || {};
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
  const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
  const page = await ctx.newPage();
  const logs = [];
  page.on('console', m => logs.push(m.type() + ': ' + m.text()));
  page.on('pageerror', e => logs.push('pageerror: ' + e.message));
  await page.route('**/*', async (route) => {
    const u = route.request().url();
    if (CDN[u]) return route.fulfill({ status: 200, contentType: 'application/javascript', headers: { 'Access-Control-Allow-Origin': '*' }, body: fs.readFileSync(CDN[u]) });
    if (u.startsWith('http://zi.test/')) {
      const p = decodeURIComponent(new URL(u).pathname).replace(/^\//, '');
      const f = path.join(WEB, p);
      if (f.startsWith(WEB) && fs.existsSync(f) && fs.statSync(f).isFile()) return route.fulfill({ status: 200, contentType: type(f), body: fs.readFileSync(f) });
      return route.fulfill({ status: 404, body: '' });
    }
    return route.fulfill({ status: 204, body: '' }); // fonts and anything else external
  });
  await page.goto('http://zi.test/Zombie%20Idler%20v2%20-%20TEST%20SAVE.html');
  try { await page.waitForFunction(() => window.ZI && document.querySelectorAll('button').length > 5, null, { timeout: opts.wait || 60000 }); } catch (e) { logs.push('WAIT TIMEOUT'); }
  return { browser, page, logs };
}
module.exports = { open };
