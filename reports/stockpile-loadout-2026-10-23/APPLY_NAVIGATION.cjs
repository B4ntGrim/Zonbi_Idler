// Applies the authorized Routes -> Stockpile loadout navigation to both entry pages.
// Run only after PRE_CHANGE_HASHES.json has been created in this report folder.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const root = 'E:/Zed_Idler', manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'PRE_CHANGE_HASHES.json'), 'utf8'));
const pages = ['Zombie Idler v2.html', 'Zombie Idler v2 - TEST SAVE.html'];
for (const name of pages) {
  const file = path.join(root, name), original = fs.readFileSync(file, 'utf8');
  const before = manifest.find(x => path.resolve(x.file) === path.resolve(file));
  if (!before || crypto.createHash('sha256').update(original).digest('hex') !== before.sha256) throw Error('Page changed since backup: ' + name);
}
for (const name of pages) {
  const file = path.join(root, name), original = fs.readFileSync(file, 'utf8');
  let html = original.replace(/\r\n/g, '\n');
  const replace = (from, to) => {
    if (!html.includes(from) || html.indexOf(from) !== html.lastIndexOf(from)) throw Error('Expected one match: ' + from.slice(0, 100));
    html = html.replace(from, () => to);
  };
  replace('function SoloRoutePreparationPanel({ preparation, setScreen }) {', 'function SoloRoutePreparationPanel({ preparation, setScreen, onManageGear, onReturnToRoute, routeName }) {');
  replace('      <div className="panel-title">Expedition preparation</div>', '      <div className="panel-title">Expedition preparation{routeName ? " · " + routeName : ""}</div>');
  replace('      <button className="btn" style={{width:\'100%\', marginTop:9}} onClick={() => setScreen(\'stockpile\')}>Manage gear &amp; carried items</button>\n      <button className="btn" style={{width:\'100%\', marginTop:5}} onClick={() => setScreen(\'stat-leveling\')}>View skills</button>',
`      {onReturnToRoute ? (
        <button className="btn btn-amber" style={{width:'100%', marginTop:9}} onClick={onReturnToRoute}>Return to selected route</button>
      ) : (
        <>
          <button className="btn" style={{width:'100%', marginTop:9}} onClick={onManageGear || (() => setScreen('stockpile'))}>Manage gear &amp; carried items</button>
          <button className="btn" style={{width:'100%', marginTop:5}} onClick={() => setScreen('stat-leveling')}>View skills</button>
        </>
      )}`);
  replace('function SoloMainScreen({ setScreen, setActiveRoute, threatLevel, mode }) {',
`function RouteLoadoutPreparation({ route, threatLevel, onReturnToRoute }) {
  const preparation = useSoloRoutePreparation(route, threatLevel);
  return <SoloRoutePreparationPanel preparation={preparation} routeName={route && route.name} onReturnToRoute={onReturnToRoute}/>;
}

function SoloMainScreen({ setScreen, setActiveRoute, threatLevel, mode, initialPlan = null, onManageGear }) {`);
  replace("  const [selectedBiome, setSelectedBiome] = useState('suburbia');\n  const [selectedRoute, setSelectedRoute] = useState(null);\n  const [runMode, setRunMode] = useState('active');\n  const [autoRepeat, setAutoRepeat] = useState({}); // routeId → bool",
`  const [selectedBiome, setSelectedBiome] = useState(() => initialPlan ? initialPlan.biome : 'suburbia');
  const [selectedRoute, setSelectedRoute] = useState(() => initialPlan ? ZI.ROUTES.find(r => r.id === initialPlan.routeId) || null : null);
  const [runMode, setRunMode] = useState(() => initialPlan ? initialPlan.runMode : 'active');
  const [autoRepeat, setAutoRepeat] = useState(() => initialPlan ? { ...initialPlan.autoRepeat } : {}); // routeId → bool`);
  replace('        {!isCamp ? <SoloRoutePreparationPanel preparation={preparation} setScreen={setScreen}/> : (',
`        {!isCamp ? <SoloRoutePreparationPanel preparation={preparation} setScreen={setScreen} onManageGear={onManageGear ? () => onManageGear({
          biome: selectedBiome, routeId: (selectedRoute || filteredRoutes[0])?.id || null,
          runMode, autoRepeat: { ...autoRepeat },
        }) : null}/> : (`);
  replace('  const [activeRoute, setActiveRoute] = useState(null);',
`  const [activeRoute, setActiveRoute] = useState(null);
  // Planning context is temporary UI state. Inventory and route-run saves stay canonical.
  const [routePlan, setRoutePlan] = useState(null);
  const [preparingRoute, setPreparingRoute] = useState(false);
  const navigate = next => { setPreparingRoute(false); setScreen(next); };
  const openRouteGear = plan => { setRoutePlan(plan); setPreparingRoute(true); setScreen('stockpile'); };`);
  replace("      case 'solo-main':     return <SoloMainScreen setScreen={setScreen} setActiveRoute={setActiveRoute} threatLevel={tweaks.threatLevel} mode={mode}/>;",
"      case 'solo-main':     return <SoloMainScreen setScreen={navigate} setActiveRoute={setActiveRoute} threatLevel={tweaks.threatLevel} mode={mode} initialPlan={mode === 'camp' ? null : routePlan} onManageGear={openRouteGear}/>;");
  replace("      case 'stockpile':     return <StockpileScreen/>;",
`      case 'stockpile':     return <StockpileScreen initialTab={preparingRoute ? 'loadout' : 'recycler'} onNavigate={navigate}
        preparationPanel={preparingRoute && routePlan ? <RouteLoadoutPreparation
          route={ZI.ROUTES.find(r => r.id === routePlan.routeId)} threatLevel={tweaks.threatLevel}
          onReturnToRoute={() => navigate('solo-main')}/> : null}/>;`);
  replace('          screen={screen}\n          setScreen={setScreen}', '          screen={screen}\n          setScreen={navigate}');
  replace('screens-v3.jsx?v=1792681200000', 'screens-v3.jsx?v=20261023-stockpile-loadout');
  fs.writeFileSync(file, original.includes('\r\n') ? html.replace(/\n/g, '\r\n') : html);
  console.log('Updated ' + name);
}
