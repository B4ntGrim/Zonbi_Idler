// Layered character-creation sprite. The same pieces are used for the still and all 16 walk frames.
function CharacterSprite({ gender, appearance = {}, frame = 0, width = 220 }) {
  const A = window.ZI.CHAR_CREATION.appearance;
  const color = (key, fallback) => (A[key] && A[key].options.find(o => o.id === appearance[key])?.swatch) || fallback;
  const skin = color('skinTone', '#efba96'), hair = color('hairColor', '#1c1a19');
  const coat = color('jacketColor', '#626448'), shirt = color('shirtColor', '#303238');
  const pants = color('pantsColor', '#68674a'), boots = color('bootsColor', '#674533');
  const clothes = appearance.clothing || 'field', hairStyle = appearance.hair || 'hooded';
  const female = gender === 'female', phase = (frame % 16) * Math.PI / 8;
  const front = Math.round(Math.sin(phase) * 14), back = Math.round(Math.sin(phase + Math.PI) * 14);
  const bob = Math.round(Math.abs(Math.sin(phase)) * 2);
  const dark = '#171717', seam = '#29251f', metal = '#dbcc9b';
  const shape = (d, fill, stroke = dark, extra = {}) => <path d={d} fill={fill} stroke={stroke} strokeWidth="1.6" strokeLinejoin="round" {...extra}/>;
  const scar = appearance.scars || 'none', piercing = appearance.piercings || 'none', accessory = appearance.accessories || 'none';
  const head = (
    <g>
      {shape(female ? 'M31 16 L36 11 L45 10 L50 15 L51 25 L47 32 L38 34 L32 29 Z' : 'M30 16 L35 11 L45 10 L51 15 L52 26 L48 33 L37 34 L31 29 Z', skin)}
      {shape('M50 20 L55 22 L50 25 Z', skin)}
      <rect x="44" y="21" width="4" height="2" fill={dark}/>
      <path d="M49 29 L52 29" stroke="#794e42" strokeWidth="1"/>
      {female && shape('M38 29 L41 30 L45 30', '#9f5b53', 'none')}
      {hairStyle !== 'bald' && hairStyle !== 'buzz' && shape(
        ['long','loose','braids','locs'].includes(hairStyle) ? 'M29 20 Q27 8 39 7 L48 9 L53 17 L49 19 L46 14 L35 15 L33 25 L30 33 L26 39 L25 27 Z'
        : ['mohawk','topknot'].includes(hairStyle) ? 'M30 18 L34 7 L39 4 L43 9 L49 11 L51 18 L46 15 L34 16 Z'
        : ['afro','curly'].includes(hairStyle) ? 'M27 21 Q23 9 32 6 Q40 1 49 8 Q55 13 52 21 L48 16 L34 17 L31 24 Z'
        : 'M29 21 Q27 9 38 8 L47 9 L52 16 L49 21 L46 16 L35 17 L31 24 Z', hair)}
      {hairStyle === 'buzz' && shape('M31 19 Q30 10 39 10 L48 12 L50 18 L46 15 L34 16 Z',hair)}
      {hairStyle === 'topknot' && <circle cx="41" cy="5" r="5" fill={hair} stroke={dark} strokeWidth="1.5"/>}
      {hairStyle === 'curly' && <g fill={hair} stroke={dark} strokeWidth=".6"><circle cx="29" cy="13" r="3"/><circle cx="34" cy="8" r="3"/><circle cx="41" cy="7" r="3"/><circle cx="48" cy="10" r="3"/></g>}
      {hairStyle === 'undercut' && <rect x="28" y="19" width="6" height="6" fill={skin}/>}
      {hairStyle === 'sidecut' && <path d="M29 19 L35 18 L33 24 L28 24 Z" fill={skin}/>}
      {hairStyle === 'shaggy' && <path d="M34 16 L36 24 L40 18 L43 23 L47 17" stroke={hair} strokeWidth="4" fill="none"/>}
      {hairStyle === 'braids' && <path d="M28 27 L25 42 M31 28 L30 46" stroke={hair} strokeWidth="3" strokeDasharray="3 1"/>}
      {hairStyle === 'locs' && <path d="M28 23 L23 43 M32 26 L31 46" stroke={hair} strokeWidth="4" strokeDasharray="6 1"/>}
      {hairStyle === 'long' && shape('M29 24 L24 38 L23 47 L30 44 L33 30 Z',hair)}
      {hairStyle === 'long' && shape('M27 32 Q18 40 24 50 L27 51 Q23 43 32 38 Z',hair)}
      {hairStyle === 'loose' && shape('M30 27 L26 42 L29 54 L34 49 L36 33 Z',hair)}
      {hairStyle === 'hooded' && shape('M27 18 Q28 4 40 5 Q55 5 56 20 L53 28 L49 17 Q45 9 36 14 L31 25 Z',coat)}
      {['brow','bridge','jaw','cheek','lip','neck','burn'].includes(scar) &&
        <path d={scar==='brow'?'M42 18 L48 22':scar==='bridge'?'M49 22 L52 26':scar==='jaw'?'M37 30 L43 33':scar==='cheek'?'M41 24 L47 28':scar==='lip'?'M48 28 L51 31':scar==='neck'?'M34 33 L40 37':'M35 25 L41 29'} stroke="#a84e42" strokeWidth={scar==='burn'?3:1.5}/>}
      {piercing !== 'none' && <g fill={metal} stroke="#554d45" strokeWidth=".5">
        {['earstuds','earhoops','industrial','gauges','doubleear'].includes(piercing) && <circle cx="31" cy="25" r={piercing==='gauges'?2.3:1.3} fill={piercing==='earhoops'||piercing==='gauges'?'none':metal} strokeWidth={piercing==='earhoops'||piercing==='gauges'?1.3:.5}/>}
        {piercing==='doubleear' && <circle cx="30" cy="21" r="1.1"/>}
        {piercing==='industrial' && <path d="M29 19 L33 27" stroke={metal} strokeWidth="1.4"/>}
        {piercing==='brow' && <circle cx="47" cy="19" r="1.2"/>}
        {piercing==='nosestud' && <circle cx="52" cy="25" r="1.1"/>}
        {piercing==='septum' && <path d="M50 26 Q52 30 54 26" fill="none" stroke={metal} strokeWidth="1.2"/>}
        {piercing==='lip' && <circle cx="50" cy="31" r="1.2"/>}
        {piercing==='tongue' && <path d="M48 30 L52 30" stroke="#8f4444" strokeWidth="2"/>}
      </g>}
    </g>
  );
  const leg = (x, swing) => <g transform={`translate(${x} 68) rotate(${swing})`}>
    {shape('M-7 0 L8 0 L9 20 L5 38 L-4 39 L-9 18 Z', pants)}
    <path d="M-7 17 L7 19 M-5 30 L6 31" stroke={seam} strokeWidth="1.3"/>
    {shape('M-5 37 L6 37 L10 47 L14 49 L14 53 L-8 53 L-9 47 Z', boots)}
    <path d="M-7 49 L14 49" stroke="#bb9c75" strokeWidth="1"/>
  </g>;
  // Boots extend to y=121 (with a 1.6px outline); keep a small bottom margin so
  // the animated stride never clips the soles at the SVG viewport edge.
  return <svg role="img" aria-label={`${gender || 'Survivor'} character preview`} width={width} height={Math.round(width*1.55)} viewBox="0 0 80 124" shapeRendering="crispEdges" style={{ imageRendering:'pixelated', background:'radial-gradient(ellipse at 50% 43%, #252727 0%, #0b0d0d 73%)', border:'1px solid var(--border)', maxWidth:'100%' }}>
    <g transform={`translate(0 ${-bob})`}>
      {leg(33,back)}
      {leg(48,front)}
      {shape(female?'M25 35 L53 35 L59 49 L54 70 L26 70 L21 49 Z':'M22 35 L55 35 L59 49 L54 70 L25 70 L20 48 Z',coat)}
      {shape('M33 37 L47 37 L49 65 L31 65 Z',shirt)}
      {clothes==='hoodie' && <>{shape('M30 35 Q40 27 51 35 L49 44 L32 44 Z',coat)}{shape('M33 54 L47 54 L49 63 L31 63 Z',coat)}</>}
      {clothes==='poncho' && shape('M30 32 L50 32 L66 66 L13 66 Z',coat)}
      {clothes==='trench' && shape('M23 43 L31 47 L29 84 L19 83 Z M52 43 L58 49 L62 83 L53 84 Z',coat)}
      {clothes==='puffer' && <path d="M23 44 L56 44 M22 51 L57 51 M22 58 L57 58" stroke={seam} strokeWidth="2"/>}
      {clothes==='flannel' && <path d="M25 44 L54 44 M28 36 L28 64 M51 36 L51 64" stroke="#b9a88a" strokeWidth="2" strokeDasharray="3 3"/>}
      {clothes==='hivis' && <path d="M24 48 L56 48 M28 38 L31 65 M51 38 L48 65" stroke="#e6b349" strokeWidth="3"/>}
      {clothes==='rags' && shape('M21 65 L26 60 L31 68 L37 64 L44 69 L51 63 L58 67 L54 73 L25 72 Z',coat)}
      {['field','bomber','leather','workshirt'].includes(clothes) && <path d="M28 37 L34 45 L31 57 M51 37 L47 45 L50 57" stroke={seam} strokeWidth="2" fill="none"/>}
      {['field','coveralls','scrubs','workshirt'].includes(clothes) && <><rect x="24" y="47" width="7" height="7" fill={coat} stroke={seam}/><rect x="49" y="47" width="7" height="7" fill={coat} stroke={seam}/></>}
      {clothes==='tracksuit' && <path d="M40 36 L40 66 M23 42 L30 42 M49 42 L56 42" stroke="#c9c9bd" strokeWidth="1.6"/>}
      {clothes==='leather' && <><path d="M27 38 L41 58 L51 37 M28 43 L51 62" stroke="#1c1c1d" strokeWidth="3" fill="none"/><path d="M27 39 L40 57" stroke="#c9c7b7" strokeWidth="1"/></>}
      {clothes==='bomber' && <><path d="M22 63 L57 63" stroke="#25282b" strokeWidth="4"/><path d="M20 56 L25 58 M56 58 L61 56" stroke="#25282b" strokeWidth="4"/></>}
      {clothes==='workshirt' && <><path d="M40 36 L40 65" stroke={seam} strokeWidth="2"/><circle cx="40" cy="47" r="1" fill={metal}/><circle cx="40" cy="55" r="1" fill={metal}/></>}
      {clothes==='coveralls' && shape('M31 56 L48 56 L50 75 L30 75 Z',coat)}
      {clothes==='scrubs' && shape('M34 37 L40 44 L46 37 Z',skin)}
      {shape('M22 39 L26 40 L25 57 L30 70 L24 72 L18 55 Z',coat)}
      {shape('M55 39 L59 40 L63 57 L58 72 L52 70 L55 55 Z',coat)}
      {shape('M23 69 L30 69 L31 77 L26 80 L21 76 Z',appearance.gloves==='none'?skin:'#292a2d')}
      {shape('M52 69 L59 69 L60 77 L55 80 L50 76 Z',appearance.gloves==='none'?skin:'#292a2d')}
      {appearance.gloves==='fingerless' && <><rect x="24" y="76" width="5" height="3" fill={skin}/><rect x="53" y="76" width="5" height="3" fill={skin}/></>}
      {head}
      {accessory==='bandana' && <path d="M30 17 L49 17" stroke="#a63c39" strokeWidth="3"/>}
      {accessory==='cap' && shape('M29 13 L48 12 L52 18 L57 19 L56 21 L47 18 L30 19 Z','#3b4754')}
      {accessory==='beanie' && shape('M28 17 Q29 5 40 5 Q52 6 53 18 Z','#3b4754')}
      {['goggles','shades'].includes(accessory) && <path d="M36 21 L48 21" stroke={accessory==='goggles'?'#b5aa8d':'#181b21'} strokeWidth="4"/>}
      {accessory==='eyepatch' && <path d="M35 16 L49 23 M43 21 L48 22" stroke="#181b21" strokeWidth="3"/>}
      {accessory==='gasmask' && shape('M42 23 L52 23 L54 32 L46 37 L41 30 Z','#555e55')}
      {accessory==='headlamp' && <><path d="M30 13 L50 13" stroke="#292a2d" strokeWidth="2"/><circle cx="44" cy="12" r="2.5" fill="#f3d774"/></>}
      {accessory==='scarf' && shape('M30 34 L49 33 L50 39 L34 40 L30 47 Z','#9a4942')}
      {accessory==='dogtags' && <circle cx="40" cy="45" r="2" fill={metal}/>}
      {accessory==='watch' && <rect x="57" y="66" width="4" height="3" fill={metal}/>}
      {accessory==='bandolier' && <path d="M26 39 L52 64" stroke="#684c34" strokeWidth="4" strokeDasharray="3 2"/>}
      {accessory==='gloves' && <><rect x="22" y="70" width="8" height="5" fill="#26282a"/><rect x="51" y="70" width="8" height="5" fill="#26282a"/></>}
      {piercing==='navel' && <circle cx="40" cy="61" r="1.8" fill={metal} stroke="#292a2d"/>}
    </g>
  </svg>;
}
