// Run the repository's readFile/log suites from Node on Windows or Linux.
const fs = require('node:fs/promises');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
(async () => {
  const files = process.argv.slice(2);
  const suites = files.length ? files : (await fs.readdir(path.join(root, 'tests'))).filter(f => f.endsWith('.test.js')).sort().map(f => 'tests/' + f);
  let passed = 0, failed = 0;
  for (const file of suites) {
    try {
      const readFile = p => fs.readFile(path.resolve(root, p), 'utf8');
      const logs = [];
      const returned = await new Function('readFile', 'log', await readFile(file))(readFile, line => logs.push(String(line)));
      const rows = Array.isArray(returned) ? returned : logs.join('\n').split('\n').filter(line => /^\s*(PASS|FAIL)\s+/.test(line)).map(line => {
        const match = line.trim().match(/^(PASS|FAIL)\s+(.*)$/); return [match[1], match[2]];
      });
      if (!rows.length) throw new Error('Suite did not report results');
      const bad = rows.filter(r => r[0] === 'FAIL');
      passed += rows.filter(r => r[0] === 'PASS').length; failed += bad.length;
      console.log(`${file}: ${rows.filter(r => r[0] === 'PASS').length} passed, ${bad.length} failed`);
      bad.forEach(r => console.log(JSON.stringify(r)));
    } catch (e) { failed++; console.error(file + ': ' + e.stack); }
  }
  console.log(JSON.stringify({ suites:suites.length, passed, failed }));
  process.exitCode = failed ? 1 : 0;
})();
