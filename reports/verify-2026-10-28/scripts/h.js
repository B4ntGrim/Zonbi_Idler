// Shared Playwright helpers for the Zed Idler checks.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const S = __dirname;
const CDN = {
  'https://unpkg.com/react@18.3.1/umd/react.development.js': 'cdn/node_modules/react/umd/react.development.js',
  'https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js': 'cdn/node_modules/react-dom/umd/react-dom.development.js',
  'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js': 'cdn/node_modules/@babel/standalone/babel.min.js',
};
const BASE = process.env.ZI_BASE || 'http://127.0.0.1:8765/Zed_Idler/';
const PAGE = process.env.ZI_PAGE || 'Zombie Idler v2.html';

async function context(profileDir, opts = {}) {
  const ctx = profileDir
    ? await chromium.launchPersistentContext(profileDir, { headless: true, viewport: { width: 1400, height: 900 }, ...opts })
    : await (await chromium.launch()).newContext({ viewport: { width: 1400, height: 900 }, ...opts });
  await ctx.route(/^https:\/\/(unpkg\.com|fonts\.(googleapis|gstatic)\.com)\//, async route => {
    const u = route.request().url();
    if (CDN[u]) return route.fulfill({ path: path.join(S, CDN[u]), contentType: 'application/javascript', headers: { 'access-control-allow-origin': '*' } });
    if (u.includes('fonts.googleapis')) return route.fulfill({ body: '', contentType: 'text/css' });
    return route.fulfill({ status: 204, body: '' });
  });
  return ctx;
}

function watch(page) {
  const log = { errors: [], warnings: [], failed: [], http: [] };
  page.on('pageerror', e => log.errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') log.errors.push(m.text().slice(0, 400)); });
  page.on('requestfailed', r => log.failed.push(r.url() + ' ' + (r.failure() || {}).errorText));
  page.on('response', r => { if (r.status() >= 400) log.http.push(r.status() + ' ' + r.url()); });
  return log;
}

async function open(page, url = BASE + encodeURIComponent(PAGE)) {
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.ZI && document.querySelector('#root') && document.querySelector('#root').children.length > 0, null, { timeout: 60000 });
  await page.waitForTimeout(1500);
}

module.exports = { context, watch, open, BASE, PAGE, S };
