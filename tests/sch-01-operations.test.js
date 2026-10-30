// SCH-01 (Sam, Oct 30): the Scheduling page. Solo drops the duplicate Base schedule section;
// Now and next sorts urgent -> running -> idle with a return-time column; design proposals start
// hidden; an injury no longer renders in the green "Available now" styling; the page and tab are
// named "Scheduling". Camp Leader is unchanged (mode deferred).
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const base = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const extra = ['game/progression.js', 'game/progression-live.js', 'game/character.js', 'game/operations.js'];
const tail = (await Promise.all(extra.map(readFile))).join('\n');
const html = await readFile('Zombie Idler v2.html'), htmlT = await readFile('Zombie Idler v2 - TEST SAVE.html');
const ops = await readFile('operations-ui.jsx');
const results = [], check = (n, ok, d) => results.push([ok ? 'PASS' : 'FAIL', n, d === undefined ? '' : String(d)]);
const T0 = 1793200000000;
const mkEnv = (store, now) => {
  store = store || {}; const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const clock = { now: now || T0 };
  class D extends Date { constructor(...a) { if (a.length) super(...a); else super(clock.now); } static now() { return clock.now; } }
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date: D, Math, JSON, Proxy, Object, Array,
    setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document:{ hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] }, addEventListener(){}, location:{ reload(){}, search:'' } };
  fw.window = fw; new Function('fw', 'with(fw){' + base + '\n' + tail + '}')(fw);
  fw.ZI._installedClock = () => clock.now; fw.ZI.wanderMounted = false; return { ZI: fw.ZI, store, clock };
};

// ── L1: Solo lists each base activity exactly once ──
check('L1: Solo no longer renders the duplicate Base schedule list',
  !/a\.group === 'base' && !a\.proposal/.test(ops) && /\{isCamp && \(\(\) =>/.test(ops));
check('L1: the Base schedule heading is Camp Leader only',
  /\{isCamp && <H sub="Camp duties/.test(ops) && !/Your upkeep at your base or forward camp/.test(ops));
{ const body = ops.split('\n').filter(l => !/^\s*\/\//.test(l)).join('\n');
  const names = (body.match(/Base schedule/g) || []).length;
  check('L1: "Base schedule" is rendered once, for Camp Leader only', names === 1, names + ' occurrence(s) outside comments'); }

// ── L2: Now and next ordering and the return-time column ──
{ const store = { zi_world_seed:'1' }; mkEnv(store).ZI.startNewInSlot('solo', 1, { gender:'male', profession:'vanguard' });
  const E = mkEnv(store, T0 + 1000), Z = E.ZI;
  Z._saveRouteRuns({
    late:  { startedAt: T0, durationMs: 7200000, squadIds: [], mode:'active', threatLevel:0, autoRepeat:false },
    done:  { startedAt: T0, durationMs: 1000,    squadIds: [], mode:'active', threatLevel:0, autoRepeat:false },
    soon:  { startedAt: T0, durationMs: 3600000, squadIds: [], mode:'active', threatLevel:0, autoRepeat:false },
  });
  const n = Z.opsNow('solo'), rank = Z.OPS_SORT_RANK;
  const ranks = n.field.map(r => rank[r.sort]);
  check('L2: rows are ordered urgent -> running -> idle',
    ranks.every((v, i) => i === 0 || ranks[i - 1] <= v), JSON.stringify(n.field.map(r => r.sort + ':' + r.id)));
  const running = n.field.filter(r => r.sort === 'running' && Number.isFinite(r.endsAt)).map(r => r.endsAt);
  check('L2: running rows are ordered soonest first',
    running.every((v, i) => i === 0 || running[i - 1] <= v), JSON.stringify(running));
  check('L2: a route whose time has passed sorts as urgent',
    n.field.some(r => r.id === 'route:done' && r.sort === 'urgent'));
  check('L2: a route still out sorts as running and carries a numeric endsAt',
    n.field.some(r => r.id === 'route:soon' && r.sort === 'running' && r.endsAt === T0 + 3600000));
  check('L2: no idle row carries an end time',
    n.field.concat(n.camp).every(r => r.sort !== 'idle' || !Number.isFinite(r.endsAt)));
  check('L2: every row declares a sort bucket',
    n.field.concat(n.camp).every(r => rank[r.sort] !== undefined), JSON.stringify(n.field.map(r => r.sort)));
  check('L2: the time is no longer duplicated inside detail',
    n.field.every(r => !/back at \d|done at \d|Make camp at \d/.test(r.detail)), JSON.stringify(n.field.map(r => r.detail)));
  check('L2: the UI renders endsAt in its own column',
    /const endLabel = \(r\) =>/.test(ops) && /textAlign:'right'/.test(ops));
  const before = JSON.stringify(store); Z.opsNow('solo');
  check('L2: reading the page still changes nothing in the save', JSON.stringify(store) === before); }

// ── L4: design proposals hidden by default ──
check('L4: proposals start hidden', /const \[showProposals, setShowProposals\] = React\.useState\(false\)/.test(ops));
check('L4: the toggle shows how many proposals are hidden',
  /Show \{catalog\.filter\(a => a\.proposal\)\.length\} design proposals/.test(ops));
{ const Z = mkEnv({ zi_world_seed:'1' }).ZI;
  const n = Z.opsCatalog('solo').filter(a => a.proposal).length;
  check('L4: Solo has proposals to hide, so the count is meaningful', n > 0, n + ' hidden'); }

// ── Injury badge ──
{ const store = { zi_world_seed:'1' }; mkEnv(store).ZI.startNewInSlot('solo', 1, { gender:'male', profession:'vanguard' });
  const Z = mkEnv(store, T0 + 1000).ZI, treat = Z.OPS_CATALOG.find(a => a.check === 'injury');
  check('Badge: with no injury the card reads Available now', Z.opsActivityStatus(treat, 'solo').key === 'available');
  Z.applyInjury && Z.applyInjury('test', false);
  const st = Z.opsActivityStatus(treat, 'solo');
  check('Badge: an active injury returns key "injured", never "available"',
    st.key === 'injured' && /^Injured: /.test(st.label), JSON.stringify(st));
  check('Badge: the UI gives "injured" the amber styling', /st\.key === 'injured' \? 'var\(--amber\)'/.test(ops)); }

// ── L6: the Scheduling rename ──
check('L6: the page title reads Scheduling', />Scheduling<\/span>/.test(ops) && !/>Operations<\/span>/.test(ops));
check('L6: both HTML entry points label the tab Scheduling',
  /\['solo-schedule','Scheduling'\]/.test(html) && /\['camp-schedule','Scheduling'\]/.test(html) &&
  /\['solo-schedule','Scheduling'\]/.test(htmlT) && /\['camp-schedule','Scheduling'\]/.test(htmlT));
check('L6: screen ids and the component name are unchanged',
  /case 'solo-schedule':/.test(html) && /case 'camp-schedule':/.test(html) && /OperationsScreen/.test(ops));

// ── Build hygiene ──
check('Cache-bust bumped in BOTH entry points',
  /game\/operations\.js\?v=20261030-sch01a/.test(html) && /operations-ui\.jsx\?v=20261030-sch01a/.test(html) &&
  /game\/operations\.js\?v=20261030-sch01a/.test(htmlT) && /operations-ui\.jsx\?v=20261030-sch01a/.test(htmlT));
check('The page still only reads (its one write stays Camp Leader duty assignment)',
  !/assignJob|enqueueJob|startRouteRun|spend[A-Z]|wanderAct|saveSchedule|_wj\(|setItem/.test(ops) && /ZI\.opsAssign\(/.test(ops));
{ let errs = [];
  try { const g = {}, m = { exports: {} }; new Function('self', 'window', 'global', 'module', 'exports', 'define', await readFile('tools/vendor/babel-standalone-7.29.0.min.js'))(g, g, g, m, m.exports, undefined);
    const B = m.exports.transform ? m.exports : g.Babel;
    try { B.transform(ops, { presets: ['react'], filename: 'operations-ui.jsx' }); } catch (e) { errs.push(String(e.message).slice(0, 160)); } }
  catch (e) { errs.push('babel load: ' + String(e.message).slice(0, 160)); }
  check('Scheduling page compiles (JSX parses)', errs.length === 0, errs.join(' | ')); }

return results;
})();
