const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = path.resolve('E:/Zed_Idler');
const readFile = async file => {
  const resolved = path.resolve(root, file);
  if (!resolved.toLowerCase().startsWith(root.toLowerCase() + path.sep)) throw Error('Outside E project');
  return fs.readFileSync(resolved, 'utf8');
};
(async () => {
  const suites = fs.readdirSync(path.join(root, 'tests')).filter(n => n.endsWith('.test.js')).sort(), results = [];
  for (const name of suites) {
    const logs = [];
    try {
      const value = await new Function('readFile', 'log', await readFile('tests/' + name))(readFile, s => logs.push(String(s)));
      const rows = Array.isArray(value) ? value : logs.filter(s => /^(PASS|FAIL)\b/.test(s)).map(s => [s.startsWith('PASS') ? 'PASS' : 'FAIL', s]);
      results.push({ name, total: rows.length, passed: rows.filter(r => r[0] === 'PASS').length, failures: rows.filter(r => r[0] !== 'PASS') });
    } catch (e) { results.push({ name, error: e.stack }); }
  }
  const total = results.reduce((n, r) => n + (r.total || 0), 0), passed = results.reduce((n, r) => n + (r.passed || 0), 0);
  fs.writeFileSync(path.join(__dirname, 'TEST_RESULTS.json'), JSON.stringify({ total, passed, suites: results }, null, 2) + '\n');
  console.log(JSON.stringify({ total, passed, suites: results.length, failures: results.filter(r => r.error || r.failures.length) }));
  const backups = JSON.parse(fs.readFileSync(path.join(__dirname, 'PRE_CHANGE_HASHES.json'), 'utf8'));
  if (!backups.every(b => crypto.createHash('sha256').update(fs.readFileSync(b.backup)).digest('hex') === b.sha256)) throw Error('Backup verification failed');
  console.log('All original backup hashes verified.');
  if (passed !== total || results.some(r => r.error)) process.exitCode = 1;
})().catch(e => { console.error(e); process.exitCode = 1; });
