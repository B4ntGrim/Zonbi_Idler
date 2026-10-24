// Manual-QA driver for "Zombie Idler v2 - TEST SAVE.html" only. Loaded by fetch+eval from screenshot steps.
// Drives the real UI with scripted clicks and reads back what is rendered. Results accumulate in the
// TEST namespace under "qa_log" so they survive reloads. Refuses to run outside the test build.
(function () {
  if (window.QA) return;
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const ls = window.localStorage; // the zitest__ shim on the test page
  const realLS = () => { let f = document.getElementById('qa-real'); if (!f) { f = document.createElement('iframe'); f.id = 'qa-real'; f.style.display = 'none'; f.src = 'about:blank'; document.body.appendChild(f); } return f.contentWindow.localStorage; };
  // Proof of isolation: a write through the page's storage must land ONLY under the zitest__ prefix.
  const isTestBuild = () => {
    if (!/TEST SAVE/.test(document.title)) return false;
    const v = 'probe-' + Date.now(); ls.setItem('qa_probe', v);
    const r = realLS(), ok = r.getItem('zitest__qa_probe') === v && r.getItem('qa_probe') === null && ls.getItem('zi_trav_pos') === r.getItem('zitest__zi_trav_pos');
    ls.removeItem('qa_probe'); return ok;
  };
  const fp = () => { const r = realLS(); let n = 0, h = 5381; for (let i = 0; i < r.length; i++) { const k = r.key(i); if (k.indexOf('zitest__') === 0 || !/^(zi_|zisave)/.test(k)) continue; n++; const v = k + '=' + r.getItem(k); for (let j = 0; j < v.length; j++) h = ((h * 33) ^ v.charCodeAt(j)) >>> 0; } return n + ':' + h.toString(16); };
  const log = (id, line) => { const a = JSON.parse(ls.getItem('qa_log') || '[]'); a.push('[' + id + '] ' + line); ls.setItem('qa_log', JSON.stringify(a)); };
  const btn = (txt) => [...document.querySelectorAll('button')].find(b => (b.textContent || '').replace(/\s+/g, ' ').includes(txt));
  const click = async (txt, wait = 450) => { const b = btn(txt); if (!b) return false; if (b.disabled) return 'disabled'; b.click(); await sleep(wait); return true; };
  const visBtns = () => [...document.querySelectorAll('button')].filter(b => !b.closest('[aria-hidden="true"]') && b.offsetParent !== null);
  const goTab = async (label) => {
    const find = () => visBtns().find(x => (x.textContent || '').trim().toLowerCase() === label.toLowerCase());
    let b = find();
    if (!b) { const m = visBtns().find(x => (x.textContent || '').trim() === '▾ More'); if (m) { m.click(); await sleep(300); b = find(); } }
    if (b) { b.click(); await sleep(900); return true; } return false;
  };
  const Z = () => window.ZI;
  // Move the survivor the way a player does: click a neighbouring cell, choose Travel, close the result.
  const cellDiv = (gx, gy) => { const c = Z().worldCell(gx, gy, 'scavenge'); const lab = [...document.querySelectorAll('div,span')].find(e => e.children.length === 0 && (e.textContent || '').trim() === c.coord); if (!lab) return null; let el = lab; for (let i = 0; i < 5 && el; i++) { if (el.style && el.style.aspectRatio) return el; el = el.parentElement; } return null; };
  // Page the satellite view one sector toward a cell (uses the map's own arrow buttons).
  const page = async (cell) => { const z = Z().getTravZone(), C = Z().SECTOR_COLS, R = Z().SECTOR_ROWS; const sx = Math.floor(cell.gx / C) - Math.floor(z.gx / C), sy = Math.floor(cell.gy / R) - Math.floor(z.gy / R); const dir = sy < 0 ? 'North' : sy > 0 ? 'South' : sx < 0 ? 'West' : sx > 0 ? 'East' : null; if (!dir) return false; const b = [...document.querySelectorAll('button')].find(x => new RegExp('^View ' + dir + ':').test(x.title || '') && !x.disabled); if (!b) return false; b.click(); await sleep(700); return true; };
  const setPos = async (target) => {
    for (let hop = 0; hop < 16; hop++) {
      const z = Z().getTravZone(); if (z.gx === target.gx && z.gy === target.gy) return true;
      const sg = (v) => v > 0 ? 1 : v < 0 ? -1 : 0, dx = sg(target.gx - z.gx), dy = sg(target.gy - z.gy);
      // Orthogonal steps only: a diagonal step can cross two sector edges at once, but page()
      // turns the view along one axis, so the cell label then matched the wrong sector and stalled.
      const opts = [[dx, 0], [0, dy], [1, 0], [-1, 0], [0, 1], [0, -1]].filter(([a, b], i, arr) => (a || b) && arr.findIndex(o => o[0] === a && o[1] === b) === i && !(z.gx + a === (window.__qaPrev || {}).gx && z.gy + b === (window.__qaPrev || {}).gy));
      let moved = false;
      for (const [a, b] of opts) {
        const n = Z().worldCell(z.gx + a, z.gy + b, 'scavenge'); if (n.state === 'locked') continue;
        const C = Z().SECTOR_COLS, R = Z().SECTOR_ROWS, other = Math.floor(n.gx / C) !== Math.floor(z.gx / C) || Math.floor(n.gy / R) !== Math.floor(z.gy / R);
        if (other) await page(n); // coords repeat per sector, so the right sector must be on screen
        let el = cellDiv(n.gx, n.gy); if (!el) continue;
        el.click(); await sleep(450);
        const t = [...document.querySelectorAll('button')].find(x => /Travel/.test(x.textContent || '') && !/travel into/i.test(x.textContent || '') && !x.disabled);
        if (!t) { await click('Cancel', 200); await click('Done', 200); continue; }
        window.__qaPrev = { gx: z.gx, gy: z.gy };
        t.click(); await sleep(450); await click('Done', 300);
        moved = true; break;
      }
      if (!moved) return false;
    }
    const z = Z().getTravZone(); return z.gx === target.gx && z.gy === target.gy;
  };
  const fortMarker = () => [...document.querySelectorAll('[title]')].find(e => (e.getAttribute('title') || '').indexOf("The Hearthguard's Fort") === 0);
  const openGate = async () => {
    let m = fortMarker(); if (!m) { await page(Z().getFortPos()); m = fortMarker(); } if (!m) return 'no fort marker on screen';
    m.parentElement.click(); await sleep(450);
    if (sceneEl()) return 'scene';
    const ok = (await click('Approach the palisade')) || (await click('Return to the Fort'));
    return ok ? 'scene' : 'no Fort option in menu';
  };
  const sceneEl = () => { const hd = [...document.querySelectorAll('span')].find(s => /THE HEARTHGUARD'S FORT/.test(s.textContent || '')); return hd ? hd.closest('.panel') : null; };
  const sceneText = () => { const p = sceneEl(); return p ? p.innerText.replace(/\n{2,}/g, '\n').trim() : '(no scene)'; };
  const sceneButtons = () => { const p = sceneEl(); return p ? [...p.querySelectorAll('button')].map(b => (b.disabled ? '[disabled] ' : '') + (b.textContent || '').replace(/\s+/g, ' ').trim()) : []; };
  const closeScene = async () => { const p = sceneEl(); if (p) { const x = [...p.querySelectorAll('button')].find(b => b.textContent.trim() === '✕'); if (x) { x.click(); await sleep(300); } } };
  const legend = () => [...document.querySelectorAll('span')].map(s => s.textContent || '').filter(t => /^(🌾|📡|🏰)/.test(t.trim())).join(' | ') || '(no quest line)';
  const kills = (n) => { for (let i = 0; i < n; i++) Z().emitAction('kill', 1); };
  const st = () => {
    const q = Z().getFallowQuest(), f = Z().getFortPos();
    return { quest: q.state, entry: q.entry, terms: q.terms, goal: Z().fallowGoal(), prog: Z().fallowProgress(),
      medkits: Z().getStash().filter(x => x === 'medkit').length, crates: Z().getStash().filter(x => x === 'sealed_crate').length,
      hg: Z().getRep('hearthguard'), factions: Z().factionsUnlocked(), survey: Z().getSurveyPoint(),
      fallowState: f ? Z().worldCell(f.fallow.gx, f.fallow.gy, 'scavenge').state : null };
  };
  const fresh = (policy) => {
    if (!isTestBuild()) throw new Error('not the test build');
    const keep = ls.getItem('qa_log'), real0 = ls.getItem('qa_real_fp'), mon0 = ls.getItem('qa_mon'), snap0 = ls.getItem('qa_real_snap');
    ls.clear();
    if (keep) ls.setItem('qa_log', keep); if (real0) ls.setItem('qa_real_fp', real0); if (mon0) ls.setItem('qa_mon', mon0); if (snap0) ls.setItem('qa_real_snap', snap0);
    ['zi_trav_tutorial_done', 'zi_wander_tut_done', 'zi_craft_tut_done'].forEach(k => ls.setItem(k, '1')); // = ZI.TUT_DONE_VALUE
    ls.setItem('zi_fresh_start', '1');
    ls.setItem('zisave_resume', JSON.stringify({ mode: 'solo', at: Date.now() }));
    if (policy) ls.setItem('zi_wander_policy', JSON.stringify({ id: policy, since: 0 }));
    location.reload();
  };
  const overlay = (lines, page) => {
    let o = document.getElementById('qa-ov'); if (!o) { o = document.createElement('div'); o.id = 'qa-ov'; document.body.appendChild(o); }
    o.style.cssText = 'position:fixed;inset:0;z-index:100000;background:#0b0b0b;color:#e8e8e8;font:12px/1.35 monospace;padding:10px;overflow:hidden;white-space:pre-wrap;column-count:2;column-gap:18px';
    o.textContent = lines.join('\n');
  };
  const showLog = (page, per) => { const a = JSON.parse(ls.getItem('qa_log') || '[]'); overlay(a.slice(page * per, (page + 1) * per)); };
  // ── Environment monitor (installed per page load; counts persist in the test namespace) ──
  // storage events only fire for writes made by OTHER documents of this origin, so:
  //   zitest__* events  → another tab is using the TEST save (contamination)
  //   other zi_* events → another tab is using the REAL save (e.g. the player's own game tab)
  // The Storage.prototype.setItem hook counts any write THIS page makes outside the zitest__ namespace.
  const mon = () => {
    if (window.__qaMon) return;
    window.__qaMon = true;
    const bump = (k) => { const m = JSON.parse(ls.getItem('qa_mon') || '{}'); m[k] = (m[k] || 0) + 1; ls.setItem('qa_mon', JSON.stringify(m)); };
    window.addEventListener('storage', (e) => {
      if (!e.key) return;
      if (e.key.indexOf('zitest__') === 0) { if (e.key !== 'zitest__qa_mon' && e.key !== 'zitest__qa_log') bump('otherTabTestWrites'); }
      else if (/^(zi_|zisave)/.test(e.key)) { bump('otherTabRealWrites'); const m = JSON.parse(ls.getItem('qa_mon') || '{}'); m.realKeysSeen = Array.from(new Set([...(m.realKeysSeen || []), e.key])).slice(0, 12); ls.setItem('qa_mon', JSON.stringify(m)); }
    });
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (this === realLS() || this === window.__qaRealTop) { /* reads only */ }
      if (typeof k === 'string' && /^(zi_|zisave)/.test(k) && k.indexOf('zitest__') !== 0) { window.__qaOwnReal = (window.__qaOwnReal || 0) + 1; try { const m = JSON.parse(ls.getItem('qa_mon') || '{}'); m.thisPageRealWrites = (m.thisPageRealWrites || 0) + 1; m.thisPageRealKeys = Array.from(new Set([...(m.thisPageRealKeys || []), k])).slice(0, 12); orig.call(this, 'zitest__qa_mon', JSON.stringify(m)); } catch (e) {} }
      return orig.call(this, k, v);
    };
  };
  const monRead = () => JSON.parse(ls.getItem('qa_mon') || '{}');
  // Per-key snapshot of the REAL save (zi_/zisave keys only) for an exact opening/closing diff.
  const realSnap = () => { const r = realLS(), out = {}; for (let i = 0; i < r.length; i++) { const k = r.key(i); if (k.indexOf('zitest__') === 0 || !/^(zi_|zisave)/.test(k)) continue; const v = r.getItem(k); let h = 5381; for (let j = 0; j < v.length; j++) h = ((h * 33) ^ v.charCodeAt(j)) >>> 0; out[k] = h.toString(16); } return out; };
  const snapDiff = (a, b) => { const ch = []; new Set([...Object.keys(a), ...Object.keys(b)]).forEach(k => { if (a[k] !== b[k]) ch.push(k + (a[k] == null ? ' (added)' : b[k] == null ? ' (removed)' : ' (changed)')); }); return ch; };
  const clickNow = (txt) => { const b = btn(txt); if (!b) return false; if (b.disabled) return 'disabled'; b.click(); return true; };
  window.QA = { sleep, realLS, isTestBuild, fp, log, btn, click, clickNow, goTab, setPos, openGate, sceneText, sceneButtons, closeScene, legend, kills, st, fresh, overlay, showLog, sceneEl, mon, monRead, realSnap, snapDiff, page };
})();
