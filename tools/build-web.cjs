// tools/build-web.cjs — build the static web copy of the game for hosting (GitHub Pages).
//
//   node tools/build-web.cjs [outDir]          (default outDir: dist)
//
// What it does, and why:
// • The pages normally compile their JSX in the browser with @babel/standalone on every load (~9–11 s before the
//   menu appears). This build compiles each `<script type="text/babel">` (the .jsx files and the page's inline
//   script) once, with exactly the options @babel/standalone uses for those tags (presets react + env, the same three
//   plugins), so the code that runs is the same — only the waiting is gone.
// • Compiled files go to <outDir>/compiled/ and load with `defer`, in the original order, after the plain game
//   scripts — the same order the browser used before. Babel is no longer downloaded; React switches to its
//   production build (same version 18.3.1, with SRI).
// • Copies the runtime files (root .js/.css, game/, assets/, art/; no .md, no .jsx, no TEST SAVE page), writes
//   index.html plus "Zombie Idler v2.html" (old links keep working) and .nojekyll. Unchanged files are skipped and
//   files whose source was deleted are removed, so the folder always mirrors the current game.
// • Development is unchanged: keep editing the .jsx files and opening the pages locally as before; run this only
//   to produce the hosted copy. Needs only Node (Babel is vendored in tools/vendor/), no npm install.
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.resolve(ROOT, process.argv[2] || 'dist');
const PAGE = 'Zombie Idler v2.html';
const Babel = require('./vendor/babel-standalone-7.29.0.min.js');
const REACT_DEV = /<script src="https:\/\/unpkg\.com\/react@18\.3\.1\/umd\/react\.development\.js"[^>]*><\/script>/;
const REACTDOM_DEV = /<script src="https:\/\/unpkg\.com\/react-dom@18\.3\.1\/umd\/react-dom\.development\.js"[^>]*><\/script>/;
const BABEL_TAG = /<script src="https:\/\/unpkg\.com\/@babel\/standalone@[^"]+"[^>]*><\/script>\s*\n?/;
const REACT_PROD = '<script src="https://unpkg.com/react@18.3.1/umd/react.production.min.js" integrity="sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z" crossorigin="anonymous"></script>';
const REACTDOM_PROD = '<script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js" integrity="sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1" crossorigin="anonymous"></script>';
const COPY_DIRS = ['game', 'assets', 'art'];
const SKIP = f => /\.(md|jsx)$/i.test(f) || /TEST SAVE/.test(f) || /(^|[\\/])\./.test(path.basename(f));

// Same options @babel/standalone builds for a classic <script type="text/babel"> with no data-* attributes.
const compile = (code, filename) => Babel.transform(code, {
  filename, presets: ['react', 'env'],
  plugins: ['transform-class-properties', 'transform-object-rest-spread', 'transform-flow-strip-types'],
  targets: { browsers: undefined }, sourceMaps: false,
}).code;
const hash = s => crypto.createHash('sha256').update(s).digest('hex').slice(0, 10);
const write = (rel, data) => { produced.add(path.normalize(rel)); const p = path.join(OUT, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, data); };
let copied = 0, skipped = 0, pruned = 0; const stale = [];
const produced = new Set();
const copyFile = (rel) => {
  produced.add(path.normalize(rel));
  const src = path.join(ROOT, rel), dst = path.join(OUT, rel), st = fs.statSync(src);
  try { const d = fs.statSync(dst); if (d.size === st.size && d.mtimeMs >= st.mtimeMs) { skipped++; return; } } catch (e) {}
  fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); copied++;
};
const walk = (rel) => fs.readdirSync(path.join(ROOT, rel), { withFileTypes: true }).forEach(e => {
  const r = path.join(rel, e.name); if (SKIP(r)) return;
  if (e.isDirectory()) walk(r); else if (e.isFile()) copyFile(r);
});

const t0 = Date.now();
let html = fs.readFileSync(path.join(ROOT, PAGE), 'utf8');
const problems = [];
if (!REACT_DEV.test(html) || !REACTDOM_DEV.test(html) || !BABEL_TAG.test(html)) problems.push('expected React 18.3.1 development + @babel/standalone tags were not found in ' + PAGE);
html = html.replace(REACT_DEV, REACT_PROD).replace(REACTDOM_DEV, REACTDOM_PROD).replace(BABEL_TAG, '');
// compiled/ files are overwritten in place; stale ones are removed by the prune step below.
const compiledList = [];
// 1. External JSX files, in page order.
html = html.replace(/<script type="text\/babel" src="([^"?]+)(\?v=[^"]*)?"><\/script>/g, (m, src, v) => {
  const code = fs.readFileSync(path.join(ROOT, decodeURIComponent(src)), 'utf8');
  const out = 'compiled/' + src.replace(/\.jsx$/, '.js').replace(/[\\/]/g, '__');
  const js = compile(code, src); write(out, js); compiledList.push([src, out, js.length]);
  return '<script defer src="' + out + '?v=' + hash(js) + '"></script>';
});
// 2. The page's inline script.
let inline = 0;
html = html.replace(/<script type="text\/babel">([\s\S]*?)<\/script>/g, (m, code) => {
  const out = 'compiled/app' + (inline++ ? '-' + inline : '') + '.js';
  const js = compile(code, PAGE + ' (inline)'); write(out, js); compiledList.push(['inline script', out, js.length]);
  return '<script defer src="' + out + '?v=' + hash(js) + '"></script>';
});
if (/text\/babel/.test(html)) problems.push('a text/babel script is left in the page');
if (problems.length) { console.error('build-web: ' + problems.join('; ')); process.exit(1); }
// 3. Runtime files.
fs.readdirSync(ROOT, { withFileTypes: true }).forEach(e => { if (e.isFile() && /\.(js|css)$/.test(e.name) && !SKIP(e.name)) copyFile(e.name); });
COPY_DIRS.forEach(d => fs.existsSync(path.join(ROOT, d)) && walk(d));
copyFile('companion-prototype.html');
write('index.html', html); write(PAGE, html); write('.nojekyll', '');
// 4. Remove files left from an earlier build whose source is gone (never touches .git).
const prune = (rel) => fs.readdirSync(path.join(OUT, rel), { withFileTypes: true }).forEach(e => {
  const r = path.join(rel, e.name); if (r === '.git') return;
  if (e.isDirectory()) { prune(r); if (!fs.readdirSync(path.join(OUT, r)).length) try { fs.rmdirSync(path.join(OUT, r)); } catch (err) {} }
  else if (!produced.has(path.normalize(r))) { try { fs.unlinkSync(path.join(OUT, r)); pruned++; } catch (err) { stale.push(r); } }
});
prune('');
if (stale.length) console.warn('build-web: could not remove ' + stale.length + ' stale file(s) (delete them by hand): ' + stale.slice(0, 5).join(', '));
compiledList.forEach(([s, o, n]) => console.log('compiled ' + s + ' → ' + o + ' (' + Math.round(n / 1024) + ' KB)'));
console.log(JSON.stringify({ out: OUT, compiled: compiledList.length, copied, unchanged: skipped, removed: pruned, ms: Date.now() - t0 }));
