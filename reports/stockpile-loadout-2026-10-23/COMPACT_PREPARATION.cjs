const fs = require('fs'), path = require('path'), root = 'E:/Zed_Idler';
for (const name of ['Zombie Idler v2.html', 'Zombie Idler v2 - TEST SAVE.html']) {
  const file = path.join(root, name), original = fs.readFileSync(file, 'utf8');
  let html = original.replace(/\r\n/g, '\n');
  const from = 'function SoloRoutePreparationPanel({ preparation, setScreen, onManageGear, onReturnToRoute, routeName }) {';
  if (!html.includes(from)) throw Error('Unexpected panel signature');
  html = html.replace(from, from.replace('routeName })', 'routeName, compact = false })'));
  const anchor = '  const p = preparation;\n  return (\n    <div className="panel" style={{padding:12, flexShrink:0}}>';
  if (!html.includes(anchor)) throw Error('Panel body not found');
  html = html.replace(anchor, `  const p = preparation;
  if (compact) return (
    <div className="panel" style={{padding:10, flexShrink:0}}>
      <div style={{display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginBottom:8}}>
        <div className="panel-title" style={{flex:1, margin:0}}>Preparing {routeName || 'route'}</div>
        <button className="btn btn-amber" onClick={onReturnToRoute}>Return to selected route</button>
      </div>
      <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))', gap:'5px 16px'}}>
        <InfoRow label="Weapon" value={p.weaponNames.join(', ') || 'Unarmed'}/>
        <InfoRow label="Protection" value={p.armor + ' armor'}/>
        <InfoRow label="Carried" value={p.loadKg + ' / ' + p.hardLimitKg + ' kg max'}/>
        <InfoRow label="Room for loot" value={p.freeKg + ' kg'} color={p.canDeploy?'var(--green)':'var(--red2)'}/>
        <InfoRow label="Travel estimate" value={fmtTime(p.durationHours*60)}/>
        <InfoRow label="Fight win chance" value={p.combatWinChance + '%'}/>
        <InfoRow label="Avoid a fight" value={p.avoidChance + '%'}/>
      </div>
      <div style={{fontFamily:'var(--font-mono)', fontSize:9, color:p.canDeploy?'var(--text3)':'var(--red2)', marginTop:6}}>
        {p.canDeploy ? 'Changes apply to your next departure. Running routes keep their departure loadout.' : p.blockedReason}
      </div>
    </div>
  );
  return (
    <div className="panel" style={{padding:12, flexShrink:0}}>`);
  html = html.replace('routeName={route && route.name} onReturnToRoute={onReturnToRoute}/>', 'routeName={route && route.name} onReturnToRoute={onReturnToRoute} compact/>');
  fs.writeFileSync(file, original.includes('\r\n') ? html.replace(/\n/g, '\r\n') : html);
}
const file = path.join(root, 'screens-v3.jsx'), original = fs.readFileSync(file, 'utf8');
let jsx = original.replace(/\r\n/g, '\n');
const carry = '            {/* Carrying: take from stash / put back (base or camp only) */}\n            <div style={{ flexShrink:0 }}><CarryPanel/></div>\n';
if (!jsx.includes(carry)) throw Error('Carrying block not found');
jsx = jsx.replace(carry, '');
const tail = '          </div>\n        )}\n      </div>\n    </div>\n  );\n};';
const at = jsx.lastIndexOf(tail);
if (at < 0) throw Error('Stockpile closing block not found');
jsx = jsx.slice(0, at) + carry + jsx.slice(at);
fs.writeFileSync(file, original.includes('\r\n') ? jsx.replace(/\n/g, '\r\n') : jsx);
