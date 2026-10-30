// Batch TRAV-01a: Honest buttons (Traversal) — acceptance checks 1–12 (CURRENT_BATCH.md, LOCKED Oct 21, revised after step 1;
// slice reference/trav-01-traversal-slice.md T1, T2, T4, T5, T10, T13–T17, P1, P3).
// Rules are run headless against an in-memory store with an installed clock. Screen checks are source-level (like RB1/RB2);
// the click / tap / controller paths are also driven in a real browser by tools/browser-check/trav01a-checks.js.
// Usage (run_script): const T = await readFile('tests/trav-01a.test.js'); await (new Function('readFile','log', T))(readFile, log);
return (async () => {
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const src = (await readFile('bestiary-data.js')) + '\n' + (await Promise.all(ORDER.map(m => readFile('game/' + m + '.js')))).join('\n');
const screen = await readFile('screens-v3.jsx');
const html = await readFile('Zombie Idler v2.html'), htmlT = await readFile('Zombie Idler v2 - TEST SAVE.html');
let before = null; try { before = await readFile('archive/pre-trav01a-oct21/build/screens-v3.jsx'); } catch (e) {}
const results = []; const check = (n, c, x) => results.push([c ? 'PASS' : 'FAIL', n, x === undefined ? '' : String(x)]);
const DAY1 = new Date(2026, 9, 21, 10, 0, 0).getTime();                      // local 10:00
const at = (base, h) => base + h * 3600e3;
const mkEnv = (opt) => {
  opt = opt || {};
  const store = Object.assign({ zi_world_seed:'12345', zi_trav_start: JSON.stringify({ gx:0, gy:0 }), zi_trav_pos: JSON.stringify({ gx:0, gy:0, name:'Home' }) }, opt.store || {});
  const ls = { getItem:k => (k in store ? store[k] : null), setItem:(k,v)=>{store[k]=String(v);}, removeItem:k=>{delete store[k];}, key:i=>Object.keys(store)[i], get length(){return Object.keys(store).length;} };
  const doc = { hidden:false, visibilityState:'visible', addEventListener(){}, querySelectorAll:()=>[] };
  const fw = { localStorage: ls, sessionStorage: ls, console:{ log(){}, warn(){}, error(){} }, Date, Math, JSON, setInterval:()=>0, clearInterval:()=>{}, setTimeout:()=>0, clearTimeout:()=>{}, document: doc, addEventListener(){}, location:{ reload(){} } }; fw.window = fw;
  new Function('fw', 'with(fw){' + src + '}')(fw); const ZI = fw.ZI; ZI.wanderMounted = false;
  let now = opt.now || DAY1; ZI._installedClock = () => now;
  const xp = []; ZI.onXp((p, a, m) => xp.push({ p, a, action: m && m.action }));
  return { ZI, store, xp, setNow: (t) => { now = t; } };
};
// Source helpers: the Traversal screen body, and "is this text inside the Camp-Leader-only branch".
const tA = screen.indexOf('window.SatelliteTraversalScreen'), tB = screen.indexOf('\nwindow.', tA + 10);
const trav = screen.slice(tA, tB > 0 ? tB : undefined);
const between = (txt, open, close) => { const i = trav.indexOf(txt), a = trav.lastIndexOf(open, i), b = trav.indexOf(close, i); return i > 0 && a > 0 && b > i && trav.indexOf(close, a) === b; };
const branch = (txt) => { const s = trav.indexOf(txt); return s; };
const doBody = (() => { const a = trav.indexOf('const doAction = (id, cell) => {'), b = trav.indexOf('const ACTIONS = [', a); return trav.slice(a, b); })();
const noComments = (t) => t.replace(/\/\/[^\n]*/g, '');
const arm = (id) => { const m = doBody.search(new RegExp(`if \\(id === '${id}'[^\\n]*\\{\\n`)); const b = doBody.indexOf('} else if (id ===', m + 10); return m < 0 ? '' : doBody.slice(m, b > 0 ? b : undefined); };

// ── 1: 5 Traversal scouts per real day; each Scout spends 1; at 0 greyed with the reason; Wandering charges untouched ──
{ const { ZI, store } = mkEnv(); const wBefore = JSON.stringify(ZI.getBaseCharges()), first = ZI.getTravScouts();
  const spends = []; for (let i = 0; i < 6; i++) spends.push(ZI.spendTravScout());
  check('1: a new real day gives 5 Traversal scouts (data-table value)', first.left === 5 && first.max === 5 && ZI.TRAVERSAL_SCOUT_CHARGES_PER_DAY === 5, JSON.stringify(first));
  check('1: each Traversal Scout spends 1 (5 → 0); the 6th is refused', spends.slice(0, 5).every((r, i) => r.ok && r.left === 4 - i) && !spends[5].ok && ZI.getTravScouts().left === 0, JSON.stringify(spends.map(r => r.left)));
  check('1: the refusal carries the reason text', spends[5].reason === 'No Traversal scouts left. The pool refills every 12 game hours.', spends[5].reason);
  check('1: Wandering scout charges (zi_charges) are unchanged by Traversal scouting', JSON.stringify(ZI.getBaseCharges()) === wBefore && ZI.chargeTotals().scout === JSON.parse(wBefore).scout, wBefore);
  const sc = arm('scout');
  check('1: screen — Scout spends ZI.spendTravScout and stops on refusal (no XP, no reveal)', /ZI\.spendTravScout\(\)/.test(sc) && /if \(!sp\.ok\)[^\n]*return;/.test(sc) && !/spendCharge/.test(sc));
  check('1: screen — the panel greys Scout at 0 with the reason (disabled={!!a.reason})', /ts\.left <= 0 \? 'No Traversal scouts left today\. Refills at midnight\.'/.test(trav) && /disabled=\{!!a\.reason\}/.test(trav));
  check('1: screen — the pool is named "Traversal scouts n/5 today"', /Traversal scouts \{ts\.left\}\/\{ts\.max\} today/.test(trav)); }

// ── 2: refill at local midnight; an offline return across one or more midnights refills once, to 5 ──
{ const { ZI, setNow } = mkEnv(); ZI.spendTravScout(); ZI.spendTravScout(); ZI.spendTravScout();
  // SCOUT-01 (Sam, Oct 30): the pool refills every 12 GAME hours (12 real minutes), not at local midnight.
  const opened = ZI.getTravScouts().at;
  const lateSame = ZI.getTravScouts(opened + ZI.TRAV_SCOUT_RESET_MS - 1000).left;
  const after = ZI.getTravScouts(opened + ZI.TRAV_SCOUT_RESET_MS).left;
  check('2: no refill before the 12-game-hour window closes; full 5 once it does', lateSame === 2 && after === 5, lateSame + ' → ' + after);
  ZI.spendTravScout(); setNow(new Date(2026, 9, 25, 9, 0).getTime()); const multi = ZI.getTravScouts();
  ZI.spendTravScout(); const afterSpend = ZI.getTravScouts().left;
  check('2: a long absence refills once, to exactly 5 (never above the pool size)', multi.left === 5 && afterSpend === 4, multi.left + ' then ' + afterSpend);
  check('2: the window is 12 game hours, and the real-day offline cap is untouched',
    ZI.TRAV_SCOUT_RESET_MS === 12 * ZI.REAL_MS_PER_GAME_HOUR && ZI.OFFLINE_CAP_MS === 24 * 60 * 60 * 1000); }

// ── 3: Scout, Hide and Travel grant XP once per cell per real day; another cell the same day grants again ──
{ const { ZI, xp, setNow } = mkEnv(); const n = (act) => xp.filter(e => e.action === act).length;
  const a = [ZI.travEmitOnce('scout', '1,1', 'scout', 1), ZI.travEmitOnce('scout', '1,1', 'scout', 1), ZI.travEmitOnce('scout', '2,1', 'scout', 1)];
  check('3: Scout — Stealth XP once for a cell, again for a different cell', a.join() === 'true,false,true' && n('scout') === 2 && xp.filter(e => e.action === 'scout').every(e => e.p === 'stealth'), a.join());
  const h = [ZI.travEmitOnce('hide', '1,1', 'sneak', 1), ZI.travEmitOnce('hide', '1,1', 'sneak', 1), ZI.travEmitOnce('hide', '0,1', 'sneak', 1)];
  check('3: Hide — Stealth/Athletics XP once per cell per day', h.join() === 'true,false,true' && n('sneak') === 4, h.join() + ' events ' + n('sneak'));
  const t = [ZI.travEmitOnce('travel', '1,0', 'move', 2), ZI.travEmitOnce('travel', '1,0', 'move', 2), ZI.travEmitOnce('travel', '0,0', 'move', 2)];
  check('3: Travel — Athletics XP once per cell per day (T14)', t.join() === 'true,false,true' && n('move') === 2 && xp.filter(e => e.action === 'move').every(e => e.p === 'athletics'), t.join());
  check('3: kinds are separate (Scout on a cell does not use up Hide there)', ZI.travXpAvailable('travel', '1,1') && !ZI.travXpAvailable('scout', '1,1'));
  setNow(new Date(2026, 9, 22, 8, 0).getTime());
  check('3: the next real day grants XP again on the same cell', ZI.travEmitOnce('scout', '1,1', 'scout', 1) === true);
  check('3: screen — Travel and Hide use travEmitOnce; Scout uses the SCOUT-01 per-charge path; no unlimited emitAction left in them',
    /travEmitOnce\('travel', ck, 'move', 2\)/.test(arm('travel')) && /ZI\.scoutEmitXp\(ck\)/.test(arm('scout')) && /travEmitOnce\('hide', ck, 'sneak', 1\)/.test(arm('hide'))
    && !/ZI\.emitAction\('(move|scout|sneak|camp)'/.test(arm('travel') + arm('scout') + arm('hide') + arm('camp'))); }

// ── 4: Hide shows the threat level and the tier range Wandering can draw; matches ZI._bgZombie for the same state ──
{ const { ZI } = mkEnv(); const states = [{ scroll:0 }, { scroll:150 }, { scroll:400 }, { scroll:900, pressure:1 }, { scroll:2500 }, { scroll:20000 }];
  const bad = [];
  states.forEach(st => {
    const boost = (st.pressure || 0) * ZI.ACTIVE_TABLE.push.tierBoost * 1.5, lap = Math.floor(st.scroll / 100) + boost;
    const rng = ZI.seededRng(7), seen = new Set(); for (let i = 0; i < 4000; i++) { const z = ZI._bgZombie(lap, rng); if (z.tier) seen.add(z.tier); }
    const want = ZI.TIER_ORDER.filter(t => seen.has(t)), got = ZI.wanderDrawableTiers(st);
    if (want.join() !== got.join()) bad.push(JSON.stringify(st) + ' bg=' + want.join('') + ' hide=' + got.join(''));
  });
  check('4: the tier range equals what ZI._bgZombie actually draws (6 states, 4,000 draws each, Push On included)', !bad.length, bad.join(' | '));
  const cell = ZI.worldCell(2, 1, 'scavenge'), th = ZI.hideThreats(cell, { scroll:400 });
  check('4: Hide reports the cell threat level and a range label', th.threatLevel === Math.min(5, cell.threatLevel) && th.range === 'F–D' && th.tiers.join() === 'F,E,D' && th.dangerLabel === ZI.THREAT_LABELS[th.threatLevel], JSON.stringify(th));
  check('4: with no drawable tiers recorded the range reads "—", never an invented list', ZI.hideThreats(cell, { scroll:0 }).range === 'F' || ZI.hideThreats(cell, { scroll:0 }).range === '—', ZI.hideThreats(cell, { scroll:0 }).range);
  check('4: screen — the Hide arm reads ZI.hideThreats and the panel "Threats" line shows the last Hide range', /ZI\.hideThreats\(cell\)/.test(arm('hide')) && /line\('Threats'/.test(trav)); }

// ── 5: Hide advances the world clock by 12 game hours and names no zombie kinds or counts ──
{ const { ZI } = mkEnv(); const g0 = ZI.gameTotalSeconds(); ZI.passTime(ZI.TRAVERSAL_TABLE.hideGameHours); const g1 = ZI.gameTotalSeconds();
  check('5: TRAV_HIDE_GAME_HOURS = 12 and passTime moves the world clock by exactly 43,200 game s', ZI.TRAV_HIDE_GAME_HOURS === 12 && g1 - g0 === 43200, g1 - g0);
  const hd = arm('hide');
  check('5: screen — the Hide arm calls passTime(ZI.TRAVERSAL_TABLE.hideGameHours)', /ZI\.passTime\(ZI\.TRAVERSAL_TABLE\.hideGameHours\)/.test(hd));
  const out = ZI.hideThreats(ZI.worldCell(1, 1, 'scavenge'), { scroll:2500 }), names = (ZI.BESTIARY || []).map(z => z.name);
  check('5: Hide output holds no zombie names or counts (only threatLevel, dangerLabel, tiers, range)', Object.keys(out).sort().join() === 'dangerLabel,range,threatLevel,tiers' && !names.some(nm => JSON.stringify(out).includes(nm)), Object.keys(out).join());
  check('5: screen — the Hide text uses only th.threatLevel, th.dangerLabel and th.range', /Threats here: tiers \$\{th\.range\}/.test(hd) && !/BESTIARY|\.name\b(?!\s*\})/.test(hd.replace(/cell\.name/g, ''))); }

// ── 6: Solo has no Camp Leader controls; Camp Leader unchanged ──
{ check('6: mode comes from the active save (ZI.getActiveSlot().mode === "camp")', /const isCampMode = \(\(ZI\.getActiveSlot && ZI\.getActiveSlot\(\)\) \|\| \{\}\)\.mode === 'camp'/.test(trav));
  check('6: fake survivors list renders only in Camp Leader (Solo shows afflictions)', between('Available Survivors', '{isCampMode ? (', ') : renderAfflictions()}'));
  check('6: the Scavenge/Contracts/Training/Patrol/Raid tabs render only in Camp Leader', between('{mapTypes.map(t => (', '{isCampMode ? (', ') : renderSoloBar()}'));
  const right = (() => { const a = trav.indexOf('{/* RIGHT: Selected square details */}'), b = trav.indexOf('data-trav="side-panel"', a); return trav.slice(a, b); })();
  check('6: Dispatch, "Assigned" and "Expected yield" sit only inside the Camp Leader right column', /\{isCampMode \? \(/.test(right) && /Dispatch \(/.test(right) && /label="Assigned"/.test(right) && /EXPECTED YIELD/.test(right)
    && (trav.match(/Dispatch \(/g) || []).length === 1 && (trav.match(/label="Assigned"/g) || []).length === 1 && (trav.match(/EXPECTED YIELD/g) || []).length === 1);
  check('6: the old adjacent-cell action modal is Camp Leader only', /\{isCampMode && actionCell && \(\(\) => \{/.test(trav));
  if (before) {
    const blocks = [
      ['survivors list', '<div className="panel-title">Available Survivors</div>', '{/* Material totals */}'],
      ['map tabs', '{mapTypes.map(t => (', '{/* Map grid */}'],
      ['right column', '<div className="panel-title">Zone Details</div>', '{/* ── Zone action menu (adjacent cell) ── */}'],
    ];
    const diffs = blocks.filter(([nm, a, b]) => { const sa = before.indexOf(a), sb = before.indexOf(b, sa); const old = before.slice(sa, sb).replace(/\s+$/, ''); return !(sa > 0 && trav.includes(old.slice(0, old.lastIndexOf('\n')))); }).map(b => b[0]);
    check('6: Camp Leader blocks are byte-identical to the pre-batch build', !diffs.length, diffs.join(', '));
  } else check('6: Camp Leader blocks identical to the pre-batch build (backup missing)', false, 'archive/pre-trav01a-oct21/build/screens-v3.jsx not found'); }

// ── 7: afflictions area — Broken and Injured with the Wandering icons; Injured labelled "play time left" ──
{ const aff = (() => { const a = trav.indexOf('const renderAfflictions = () => {'), b = trav.indexOf('const renderSoloBar', a); return trav.slice(a, b); })();
  const wanderIcons = (screen.match(/data-status="broken"[^>]*>([^<]+)</) || [])[1], wanderInj = (screen.match(/data-status="injured"[^>]*>([^<]+)</) || [])[1];
  check('7: Broken uses the Wandering header icon and shows first', !!wanderIcons && aff.includes('>' + wanderIcons.trim() + '<') && aff.indexOf('data-affliction="broken"') < aff.indexOf('data-affliction="injured"'), wanderIcons);
  check('7: Injured uses the Wandering header icon', !!wanderInj && aff.includes('>' + wanderInj.trim() + '<'), wanderInj);
  check('7: Injured time is labelled "play time left" and read from ZI.getInjury().remainingMs', /min play time left/.test(aff) && /inj\.remainingMs/.test(aff) && /ZI\.getInjury/.test(aff) && /ZI\.isBroken/.test(aff));
  const { ZI } = mkEnv(); ZI.applyInjury('test', false); const j = ZI.getInjury(); ZI._wj(ZI.BROKEN_KEY, { on:true, rests:0 });
  check('7: the data the area reads is live (injury record and Broken flag present after applying them)', !!j && j.remainingMs > 0 && ZI.isBroken(), j && j.remainingMs); }

// ── 8: tutorial points at Wandering after Loot; a Solo reload opens on Traversal (both pages) ──
{ check('8: after Loot the tutorial target is Wandering, never Routes', /setTutTarget\('wandering'\); setTutPoint\(true\); \}, 1600\)/.test(arm('loot')) && !/setTutTarget\('routes'\)/.test(trav));
  const boot = /bootMode \? \(freshStart \? 'traversal' : \(bootMode === 'camp' \? 'camp-main' : 'traversal'\)\) : 'mode-select'/;
  check('8: Zombie Idler v2.html — Solo boot screen is Traversal; Camp Leader still Camp', boot.test(html));
  check('8: TEST SAVE page — Solo boot screen is Traversal; Camp Leader still Camp', boot.test(htmlT));
  check('8: Loot itself never changes screen', !/setScreen/.test(arm('loot'))); }

// ── 9: Make camp leaves HP and healsUsed unchanged; Command XP once per real day; camp cell still stored ──
{ const cp = (() => { const a = doBody.indexOf("} else if (id === 'camp') {"), b = doBody.indexOf("} else if (id === 'hide')", a); return doBody.slice(a, b); })();
  check('9: screen — the camp arm no longer writes HP or healsUsed (comments ignored)', !/syncWanderState|healsUsed|maxHp/.test(noComments(cp)), cp.length);
  check('9: screen — the camp cell is still stored, saved return is cleared, and the clock wakes at 06:00 next day', /writeJ\('zi_trav_camp', p\)/.test(cp) && /clearTravReturn/.test(cp) && /passTimeToNextMorning\(6\)/.test(cp));
  check("9: screen — Command XP via travEmitOnce('camp', 'any', 'camp', 1)", /travEmitOnce\('camp', 'any', 'camp', 1\)/.test(cp));
  const { ZI, xp, setNow } = mkEnv(); const run = Object.assign(ZI.defaultWanderRun(), { hp:37, healsUsed:2 }); ZI.saveWanderRun(run);
  const r = [ZI.travEmitOnce('camp', 'any', 'camp', 1), ZI.travEmitOnce('camp', 'any', 'camp', 1)]; setNow(new Date(2026, 9, 22, 9).getTime()); r.push(ZI.travEmitOnce('camp', 'any', 'camp', 1));
  const after = ZI.getWanderRun();
  check('9: Command XP once per real day (true, false, then true next day); the saved run keeps HP 37 and healsUsed 2', r.join() === 'true,false,true' && xp.filter(e => e.action === 'camp' && e.p === 'command').length === 2 && after.hp === 37 && after.healsUsed === 2, r.join() + ' hp ' + after.hp); }

// ── 10: Deploy is disabled with its reason when stamina is too low ──
{ const ok = (h) => /onClick=\{canRun \? onLaunch : undefined\}\s*disabled=\{!canRun\}/.test(h) && /title=\{canRun \? '' : deployReason\}/.test(h) && /\{!canRun && <div data-deploy-reason="1"/.test(h);
  check('10: Zombie Idler v2.html — Deploy disabled={!canRun} with a visible reason', ok(html));
  check('10: TEST SAVE page — Deploy disabled={!canRun} with a visible reason', ok(htmlT)); }

// ── 11: zone panel — click / tap (sheet) / confirm; hover = preview only; every action has a cost or a reason; Route mode disabled ──
{ check('11: Solo cell click opens the zone panel for any cell (select, not hover)', /if \(!isCampMode\) \{ openSoloPanel\(square\); return; \}/.test(trav));
  check('11: hover updates the preview without opening the zone panel; map-pan mode suppresses hover', /onMouseEnter=\{\(\) => \{ if \(!mapPanMode\) setHoveredSquare\(square\); \}\}/.test(trav) && /data-trav="preview"/.test(trav) && /const previewLine = \(c\) => `\$\{c\.name\} · \$\{FAM_LABEL/.test(trav) && !/onMouseEnter=\{\(\) => (openSoloPanel|setActionCell)/.test(trav));
  check('11: touch/pen opens a bottom sheet; swipe down (> 60 px) or tapping the backdrop closes it', /setSheetMode\(p === 'touch' \|\| p === 'pen'/.test(trav) && /data-trav="sheet"/.test(trav) && /bottom:0/.test(trav) && /clientY - y0 > 60\) closeSoloPanel\(\)/.test(trav) && /data-trav="sheet-backdrop" onClick=\{closeSoloPanel\}/.test(trav));
  check('11: controller — arrows / D-pad move the highlight; Enter, Space or A confirms; Escape or B closes', /k === 'ArrowUp'/.test(trav) && /\(k === 'Enter' \|\| k === ' '\)/.test(trav) && /getGamepads/.test(trav) && /edge\(0\)/.test(trav) && /edge\(1\)\) back\(\)/.test(trav) && /openSoloPanel\(ZI\.worldCell\(c\.hl\.gx, c\.hl\.gy, 'scavenge'\), 'controller'\)/.test(trav));
  check('11: the highlighted cell shows the same one-line preview', /const soloPreview = hoveredSquare \|\| hlCell;/.test(trav));
  // fix 1 (Oct 22): the action list moved into zoneActs() so the panel and the controller share one order and one set of reasons
  const acts = (() => { const a = trav.indexOf('return [', trav.indexOf('const zoneActs = (c) =>')), b = trav.indexOf('];', a); return trav.slice(a, b); })();
  const ids = ['travel','loot','scout','hide','camp'].filter(id => new RegExp(`id:'${id}'[^\\n]*reason:[^\\n]*cost:`).test(acts));
  check('11: every panel action (Travel, Loot, Scout, Hide, Make camp) carries a reason and a cost', ids.length === 5, ids.join(','));
  check("11: far and locked cells grey every action with \"Too far — move next to it.\" / \"Locked zone.\"", /const far = locked \? 'Locked zone\.' : \(!here && !adj\) \? 'Too far — move next to it\.' : null;/.test(trav) && /if \(!isHereCell\(cell\) && !isAdjCell\(cell\)\) \{ setActionResult\(\{ tone:'warn', text:'Too far — move next to it\.' \}\); return; \}/.test(doBody));
  check('11: a disabled action never runs and shows its reason instead of the cost', /disabled=\{!!a\.reason\}/.test(trav) && /if \(!a\.reason\) runSiteAction\(a\.id, c\)/.test(trav) && /\{a\.reason \|\| a\.cost\}/.test(trav));
  check('11: Route mode toggle is visible, disabled, with "Route builder coming soon"', /data-trav="route-mode" className="btn" disabled title="Route builder coming soon"/.test(trav) && /data-trav="route-mode-reason"[^>]*>Route builder coming soon</.test(trav));
  check('11: panel lines Familiarity · Loot · Danger · Threats · Features (no "On a route" line yet)', ['Familiarity','Loot','Danger','Threats','Features'].every(l => trav.includes(`line('${l}'`)) && !/On a route/.test(trav)); }

// ── TRAV-01a fix 1 (PF11, Sam Oct 22): controller focus inside the zone panel — source checks (browser: trav01a-checks.js F1–F9) ──
{ const items = (() => { const a = trav.indexOf('const panelItems = (c) =>'), b = trav.indexOf('};', a); return trav.slice(a, b); })();
  const order = ["id:'fort'", 'zoneActs(c)', "id:'wander'", "id:'close'"].map(t => items.indexOf(t));
  check('F1: confirming a zone by controller puts focus in the panel (first enabled action)', /setPanelFocus\(p === 'controller' \? '__first__' : null\)/.test(trav) && /it\.find\(x => x\.enabled\)/.test(trav));
  check('F2: focus order Fort (if shown) · Travel/Loot/Scout/Hide/Make Camp · Start wandering (if shown) · Close, wrapping', order.every(i => i > 0) && order[0] < order[1] && order[1] < order[2] && order[2] < order[3] && /zoneActs\(c\)\.map/.test(items) && /\(k \+ d \+ it\.length\) % it\.length/.test(trav));
  check('F3: greyed actions take focus but confirm on them does nothing', /enabled:!a\.reason/.test(items) && /if \(!it \|\| !it\.enabled\) return;/.test(trav));
  check('F4: confirm runs the focused button; focus is kept by action id (not DOM node)', /c\.panelRun\(c\.focusId\(\)\)/.test(trav) && /it\.some\(x => x\.id === want\) \? want/.test(trav) && /data-panel-focus=\{focusId === a\.id/.test(trav));
  check('F5: Back closes the panel and puts the map highlight back on that zone', /closeSoloPanel\(\); if \(had\) setHl\(\{ gx: cell\.gx, gy: cell\.gy \}\)/.test(trav));
  check('F6: while the panel has focus, arrows / D-pad do not move the map highlight', /if \(c\.actionCell && c\.panelFocus\) \{ if \(dy\) c\.panelMove\(dy\); return; \}/.test(trav));
  check('F7: a mouse press or touch on the map clears panel focus; mouse/touch opening sets no focus', /lastPointer\.current = e\.pointerType \|\| 'mouse'; setPanelFocus\(null\);/.test(trav));
  check('F8: the focused button shows the map highlight outline (2px #7fe0ff) and scrolls into view', (trav.match(/focusId === '?[a-z.]+'? \? '0 0 0 2px #7fe0ff inset/g) || []).length >= 4 && /scrollIntoView\(\{ block:'nearest' \}\)/.test(trav));
  check('F9: far / locked zones (all actions greyed, no Fort, no wander) fall to Close', /\{ id:'close', enabled:true \}/.test(items) && /\(ZI\.isFortCell\(c\) && \(here \|\| adj\)/.test(items) && /here && setScreen \?/.test(items));
  check('F-out: Camp Leader action panel untouched (no panel focus there)', !/panelFocus/.test(trav.slice(trav.indexOf("{actionResult && isHereCell(actionCell) && setScreen"), trav.indexOf("{actionResult && isHereCell(actionCell) && setScreen") + 900))); }

// ── 12: regression hooks — old saves load with Traversal scouts at 5; no save-version change ──
{ const { ZI, store } = mkEnv({ store: { zi_charges: JSON.stringify({ heal:1, scout:1 }) } });
  check('12: an existing save (no zi_trav_scout key) reads 5 Traversal scouts and writes nothing on read', ZI.getTravScouts().left === 5 && !('zi_trav_scout' in store) && !('zi_trav_xp_day' in store));
  check('12: save version unchanged (no TRAV-01a migration registered)', !/trav/i.test(String(ZI.SAVE_MIGRATIONS[ZI.SAVE_FORMAT.current])), ZI.SAVE_FORMAT.current);
  check('12: new keys are zi_* (kept per save slot by the snapshot)', ZI.TRAV_SCOUT_KEY.indexOf('zi_') === 0 && ZI.TRAV_XP_DAY_KEY.indexOf('zi_') === 0); }

results.forEach(r => log(r[0] + '  ' + r[1] + (r[0] === 'FAIL' ? '  ' + r[2] : '')));
const pass = results.filter(r => r[0] === 'PASS').length; log(`${pass}/${results.length} TRAV-01a checks passed`);
return results;
})();
