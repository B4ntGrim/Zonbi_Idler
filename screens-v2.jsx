
// Zombie Idler v2 — New Screens Component File
// Requires: game-data.js, pixel-art.js, tweaks-panel.jsx loaded first

// ─── SURVIVAL STAT LEVELING SCREEN ──────────────────────────────────────────
// Tutorial spec 7.2: these panels use fixed sample values in the first release, so they carry a visible label.
function PreviewTag() {
  return <span className="tag" title="Sample values — not yet linked to your survivor" style={{ color:'var(--text2)', borderColor:'var(--text3)', background:'transparent', letterSpacing:'0.12em', textTransform:'uppercase' }}>Preview</span>;
}
function StatLevelingScreen() {
  const ZI = window.ZI;
  const ZI_ART = window.ZI_ART;

  const [gameNow, setGameNow] = React.useState(() => ZI.getCalendar()); // shared game calendar
  const gameSecond = gameNow.hh * 3600 + gameNow.mm * 60, gameDay = gameNow.day;
  const gameMinute = Math.floor(gameSecond / 60);
  const gameHour = Math.floor(gameSecond / 3600);
  const [weather, setWeather] = React.useState('Rain');
  const [selectedAttr, setSelectedAttr] = React.useState(null);
  const [, forceXp] = React.useState(0);
  const [xpFlash, setXpFlash] = React.useState(null); // {prof, amount}

  // Live-bind profession bars to the central XP bus (Change 6).
  React.useEffect(() => {
    if (!ZI.onXp) return;
    return ZI.onXp((prof, amount) => {
      forceXp(n => n + 1);
      const p = (ZI.PROFESSIONS || []).find(x => x.id === prof);
      setXpFlash({ prof: p ? p.name : prof, amount });
      clearTimeout(window.__ziXpFlashT);
      window.__ziXpFlashT = setTimeout(() => setXpFlash(null), 2400);
    });
  }, []);

  // Tick game clock: shared rate from game/core.js (1 game hour = 1 real minute).
  React.useEffect(() => {
    const t = setInterval(() => setGameNow(ZI.getCalendar()), 1000);
    return () => clearInterval(t);
  }, []);

  const isNight = gameHour >= 21 || gameHour < 5;
  const isDusk  = (gameHour >= 18 && gameHour < 21) || (gameHour >= 5 && gameHour < 7);

  const skyColor = isNight ? '#050810' : isDusk ? '#1a1018' : '#0a1828';
  const timeLabel = gameHour.toString().padStart(2,'0') + ':' + (gameMinute % 60).toString().padStart(2,'0') + ':' + (gameSecond % 60).toString().padStart(2,'0');

  // Character stats
  const [stats, setStats] = React.useState([
    { key:'S', name:'Survival',       xp:2340, maxXp:3000, level:7,  maxLevel:20, color:'var(--green)' },
    { key:'U', name:'Underhandedness',xp:1180, maxXp:2000, level:5,  maxLevel:20, color:'var(--purple)' },
    { key:'R', name:'Reflex',         xp:2850, maxXp:3000, level:8,  maxLevel:20, color:'var(--amber)' },
    { key:'V', name:'Vitality',       xp:900,  maxXp:2000, level:4,  maxLevel:20, color:'var(--red2)' },
    { key:'I', name:'Insight',        xp:2100, maxXp:2500, level:6,  maxLevel:20, color:'var(--blue)' },
    { key:'V2',name:'Valor',          xp:400,  maxXp:1500, level:3,  maxLevel:20, color:'var(--rust2)', css:'#e0624c' },
    { key:'A', name:'Aptitude',       xp:1900, maxXp:2500, level:6,  maxLevel:20, color:'var(--amber2)' },
    { key:'L', name:'Lucky',          xp:640,  maxXp:1500, level:3,  maxLevel:20, color:'var(--yellow)', css:'#f0d060' },
  ]);

  // Professions derived live from the central XP bus (zi_stat_xp).
  const PROF_COLORS = {
    combat:'var(--red2)', firstAid:'var(--green)', scavenging:'var(--amber)', stealth:'var(--purple)',
    athletics:'var(--blue)', endurance:'var(--metal)', foraging:'var(--green2)', smithing:'var(--rust2)',
    medical:'var(--green)', mechanical:'var(--metal)', discovery:'var(--blue)', trading:'var(--amber2)',
    diplomat:'var(--purple)', logistics:'var(--text2)', engineering:'var(--amber)', command:'var(--yellow)',
  };
  const xpForLvl = (L) => 50 * L + 12 * L * L;
  const liveXp = ZI.getStatXp ? ZI.getStatXp() : {};
  const professions = (ZI.PROFESSIONS || []).map(p => {
    const xp = liveXp[p.id] || 0;
    const level = ZI.statLevel ? ZI.statLevel(p.id) : 1;
    // Scavenging uses its steeper cumulative curve; others the standard curve.
    // Level 1 starts at 0 XP (statLevel only uses the curve from level 2 up).
    const floorXp = level <= 1 ? 0 : p.id === 'scavenging' ? ZI._scavCumThreshold(level) : xpForLvl(level);
    const nextXp  = p.id === 'scavenging' ? ZI._scavCumThreshold(level + 1) : xpForLvl(level + 1);
    return {
      id:p.id, name:p.name, icon:p.icon, level,
      xp: Math.max(0, xp - floorXp), maxXp: Math.max(1, nextXp - floorXp),
      total: xp, color: PROF_COLORS[p.id] || 'var(--amber)', css: PROF_COLORS[p.id],
    };
  });

  // Zombie index by time of day
  const zombiesByHour = isNight
    ? { primary:'Nightmares', secondary:'Runners', note:'PZ: zombie aggression peaks 22:00–04:00. Sprint variants most common.', color:'var(--red2)', dropRates: ZI.RMAT_DROP_RATES['Runner'] }
    : isDusk
    ? { primary:'Runners', secondary:'Spitters', note:'PZ: dusk transition — safest window closing fast. Move NOW.', color:'var(--amber)', dropRates: ZI.RMAT_DROP_RATES['Spitter'] }
    : { primary:'Shamblers', secondary:'Runners', note:'PZ: daylight hours — lower aggression, best for scavenging.', color:'var(--green)', dropRates: ZI.RMAT_DROP_RATES['Shambler'] };

  const weatherEffects = ZI.WEATHER_EFFECTS[weather] || ZI.WEATHER_EFFECTS.Rain;
  const weatherOptions = ['Rain','Fog','HeatWave','Blizzard'];

  const attrObj = ZI.SURVIVAL_ATTRS.find(a => a.key === selectedAttr || a.key === selectedAttr+'2');

  // Click-and-drag on empty space pans the whole Stats page (buttons, sliders and text inputs still work normally).
  const statsPanRef = React.useRef(null);
  const startStatsPan = (e) => {
    if (e.button !== 0 || e.target.closest('button, input, select, textarea, a, label, [role="slider"]')) return;
    const el = statsPanRef.current; if (!el) return;
    const x0 = e.clientX, y0 = e.clientY, l0 = el.scrollLeft, t0 = el.scrollTop;
    el.style.cursor = 'grabbing';
    const move = (ev) => { el.scrollLeft = l0 - (ev.clientX - x0); el.scrollTop = t0 - (ev.clientY - y0); };
    const up = () => { el.style.cursor = 'grab'; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move); window.addEventListener('mouseup', up);
  };
  return (
    <div ref={statsPanRef} onMouseDown={startStatsPan} className="screen-enter" style={{ display:'flex', flexWrap:'wrap', alignContent:'flex-start', gap:8, padding:8, height:'100%', overflow:'auto', position:'relative', cursor:'grab' }}>
      {xpFlash && (
        <div style={{
          position:'absolute', top:12, right:14, zIndex:60,
          fontFamily:'var(--font-mono)', fontSize:11, color:'var(--green)',
          background:'#10231a', border:'1px solid #3dcf8e', padding:'7px 12px',
          boxShadow:'0 4px 16px rgba(0,0,0,0.5)',
        }}>+{xpFlash.amount} {xpFlash.prof} XP</div>
      )}

      {/* LEFT: SURVIVAL attributes */}
      <div style={{ flex:'1 1 280px', minWidth:260, maxWidth:340, minHeight:'100%', display:'flex', flexDirection:'column', gap:8 }}>
        <div className="panel" style={{ flex:'1 0 auto', minHeight:420, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div className="panel-title" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span>SURVIVAL Attributes</span>
            <span style={{ display:'flex', gap:6, alignItems:'center' }}><PreviewTag/><Tag color="var(--amber)">Lv14 Ranger</Tag></span>
          </div>
          <div style={{ flex:1, overflow:'auto', padding:8, display:'flex', flexDirection:'column', gap:5 }}>
            {stats.map(s => {
              const pct = (s.xp / s.maxXp) * 100;
              const isSelected = selectedAttr === s.key;
              const color = s.css || s.color;
              return (
                <div key={s.key}
                  onClick={() => setSelectedAttr(isSelected ? null : s.key)}
                  style={{
                    padding:'8px 10px', cursor:'pointer',
                    border:`1px solid ${isSelected ? color : 'var(--border)'}`,
                    background: isSelected ? 'var(--bg4)' : 'var(--bg3)',
                    transition:'all 0.15s',
                  }}>
                  <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:5 }}>
                    <div style={{
                      width:28, height:28, border:`2px solid ${color}`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontFamily:'var(--font-title)', fontSize:14, color, background:'var(--bg4)', flexShrink:0,
                    }}>{s.key === 'V2' ? 'Va' : s.key}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between' }}>
                        <span style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--text)', fontWeight:500 }}>{s.name}</span>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color }}>Lv {s.level}</span>
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:3 }}>
                        <div style={{ flex:1 }}>
                          <ProgressBar value={pct} color={color} height={5}/>
                        </div>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', flexShrink:0 }}>
                          {s.xp}/{s.maxXp}
                        </span>
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text2)', lineHeight:1.5 }}>
                      {attrObj?.desc || 'No description'}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CENTER: Professions + Time display */}
      <div style={{ flex:'3 1 460px', display:'flex', flexDirection:'column', gap:8, minWidth:0, minHeight:'100%' }}>

        {/* Time of day + weather bar */}
        <div className="panel" style={{ padding:'10px 14px', flexShrink:0, background: skyColor, borderColor:'var(--border)', position:'relative', overflow:'hidden' }}>
          <div style={{
            position:'absolute', inset:0,
            background: isNight
              ? 'radial-gradient(ellipse at 80% 50%, rgba(80,50,150,0.15), transparent)'
              : isDusk
              ? 'radial-gradient(ellipse at 70% 50%, rgba(200,100,50,0.2), transparent)'
              : 'radial-gradient(ellipse at 60% 50%, rgba(70,120,180,0.15), transparent)',
            pointerEvents:'none',
          }}/>
          <div style={{ display:'flex', alignItems:'center', gap:'10px 16px', position:'relative', zIndex:1, flexWrap:'wrap' }}>
            {/* Clock */}
            <div style={{ textAlign:'center', flexShrink:0, width:132 }}>
              <div style={{ fontFamily:'var(--font-title)', fontSize:28, color: isNight?'var(--blue)':isDusk?'var(--red2)':'var(--amber)', lineHeight:1, fontVariantNumeric:'tabular-nums', whiteSpace:'nowrap' }}>
                {timeLabel}
              </div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginTop:2 }}>
                YEAR {gameNow.year} · DAY {gameDay} · {isNight ? '🌙 NIGHT' : isDusk ? '🌇 DUSK' : '☀️ DAY'}
              </div>
            </div>
            {/* 24h bar */}
            <div style={{ flex:'1 1 200px', minWidth:0, maxWidth:'100%' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:4 }}>TIME OF DAY</div>
              <div style={{ height:14, background:'var(--bg4)', borderRadius:1, overflow:'hidden', position:'relative' }}>
                {/* Day/night segments */}
                <div style={{ position:'absolute', left:0, top:0, width:'20.8%', height:'100%', background:'rgba(10,24,40,0.8)' }}/>
                <div style={{ position:'absolute', left:'20.8%', top:0, width:'8.4%', height:'100%', background:'rgba(180,90,40,0.5)' }}/>
                <div style={{ position:'absolute', left:'29.2%', top:0, width:'37.5%', height:'100%', background:'rgba(70,120,180,0.3)' }}/>
                <div style={{ position:'absolute', left:'66.7%', top:0, width:'8.4%', height:'100%', background:'rgba(180,90,40,0.5)' }}/>
                <div style={{ position:'absolute', left:'75%', top:0, width:'25%', height:'100%', background:'rgba(10,24,40,0.8)' }}/>
                {/* Cursor */}
                <div style={{
                  position:'absolute', top:0, bottom:0, width:3,
                  left:`${(gameSecond/86400)*100}%`,
                  background: isNight?'var(--blue)':isDusk?'var(--red2)':'var(--amber)',
                  boxShadow:`0 0 6px ${isNight?'var(--blue)':isDusk?'var(--red2)':'var(--amber)'}`,
                }}/>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', marginTop:2 }}>
                {['00','06','12','18','24'].map(h => (
                  <span key={h} style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)' }}>{h}</span>
                ))}
              </div>
            </div>
            {/* Weather selector */}
            <div style={{ flex:'0 1 auto', minWidth:0 }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:4, display:'flex', gap:6, alignItems:'center' }}>WEATHER <PreviewTag/></div>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap' }}>
                {weatherOptions.map(w => (
                  <button key={w} onClick={() => setWeather(w)} style={{
                    fontFamily:'var(--font-mono)', fontSize:9, padding:'3px 7px',
                    border:`1px solid ${weather===w?'var(--amber)':'var(--border)'}`,
                    background: weather===w?'rgba(200,169,110,0.12)':'var(--bg4)',
                    color: weather===w?'var(--amber)':'var(--text3)', cursor:'pointer',
                  }}>{w}</button>
                ))}
              </div>
            </div>
          </div>
          {/* Conditions → open opportunities (weather × time of day) */}
          {(() => {
            const phase = isNight ? 'night' : isDusk ? 'dusk' : 'day';
            const mods = ZI.conditionMods(weather, phase);
            const rows = Object.entries(mods).sort((a,b) => b[1].pct - a[1].pct);
            const profName = (id) => ((ZI.PROFESSIONS || []).find(p => p.id === id) || { name:id }).name;
            const profIcon = (id) => ((ZI.PROFESSIONS || []).find(p => p.id === id) || {}).icon || '';
            const wOpp = (ZI.WEATHER_STAT_MODS[weather] || {}).opportunity;
            const tOpp = (ZI.TIME_STAT_MODS[phase] || {}).opportunity;
            return (
              <div style={{ position:'relative', zIndex:1, marginTop:10, paddingTop:9, borderTop:'1px solid var(--border)', display:'flex', gap:14, alignItems:'flex-start', flexWrap:'wrap' }}>
                <div style={{ flex:'1 1 220px', minWidth:0 }}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:5, letterSpacing:'0.08em' }}>OPEN OPPORTUNITIES</div>
                  {[wOpp, tOpp].filter(Boolean).map((o, i) => (
                    <div key={i} style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--text)', lineHeight:1.45, marginBottom:3 }}>
                      <span style={{ color:'var(--amber)', marginRight:5 }}>▸</span>{o}
                    </div>
                  ))}
                </div>
                <div style={{ flex:'2 1 320px', minWidth:0, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px,1fr))', gap:5 }}>
                  {rows.map(([stat, m]) => {
                    const up = m.pct > 0, zero = m.pct === 0;
                    const c = zero ? 'var(--text3)' : up ? 'var(--green)' : 'var(--red2)';
                    return (
                      <div key={stat} style={{ padding:'5px 8px', background:'rgba(0,0,0,0.3)', border:`1px solid ${zero ? 'var(--border)' : up ? 'rgba(76,175,125,0.4)' : 'rgba(200,97,42,0.4)'}` }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                          <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--text)' }}>{profIcon(stat)} {profName(stat)}</span>
                          <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:c }}>{up ? '+' : ''}{m.pct}%</span>
                        </div>
                        {m.parts.map((p, i) => (
                          <div key={i} style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text2)', marginTop:2, lineHeight:1.35 }}>
                            <span style={{ color: p.pct > 0 ? 'var(--green)' : 'var(--red2)' }}>{p.src} {p.pct > 0 ? '+' : ''}{p.pct}%</span> · {p.why}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Zombie Index */}
        <div className="panel" style={{ padding:'10px 14px', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:'10px 16px', flexWrap:'wrap' }}>
            <div style={{ flex:'1 1 200px', minWidth:0 }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:5, display:'flex', gap:6, alignItems:'center' }}>ZOMBIE INDEX — {timeLabel} <PreviewTag/></div>
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:5 }}>
                <div style={{ width:8, height:8, borderRadius:'50%', background:zombiesByHour.color, boxShadow:`0 0 6px ${zombiesByHour.color}` }}/>
                <span style={{ fontFamily:'var(--font-body)', fontSize:14, color:zombiesByHour.color }}>{zombiesByHour.primary}</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)' }}>+ {zombiesByHour.secondary}</span>
              </div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', fontStyle:'italic', lineHeight:1.5 }}>{zombiesByHour.note}</div>
            </div>
            {/* Drop rates for current zombie */}
            <div style={{ flex:'1 1 160px', minWidth:0 }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:5 }}>LOOT TABLE — {zombiesByHour.primary.toUpperCase()}</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {ZI.RMAT_TIERS.map(tier => {
                  const rateKey = `tier${tier.tier}`;
                  const rate = (zombiesByHour.dropRates || {})[rateKey] || 0;
                  if (rate === 0) return null;
                  return (
                    <div key={tier.tier} style={{ textAlign:'center' }}>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:tier.color, marginBottom:2 }}>{rate}%</div>
                      <div style={{ width:20, height:32, background:'var(--bg4)', display:'flex', alignItems:'flex-end' }}>
                        <div style={{ width:'100%', background:tier.color, height:`${(rate/15)*100}%`, opacity:0.8 }}/>
                      </div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', marginTop:2 }}>T{tier.tier}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Weather effects */}
            <div style={{ flex:'1 1 200px', minWidth:0 }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:5 }}>WEATHER — {weather.toUpperCase()}</div>
              {Object.entries(weatherEffects).filter(([k])=>k!=='note').slice(0,4).map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', marginBottom:2 }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>
                    {k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase()).slice(0,16)}
                  </span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color: typeof v==='number'&&v<0?'var(--green)':typeof v==='number'&&v>0?'var(--red2)':'var(--amber)' }}>
                    {typeof v==='boolean'?(v?'Yes':'No'):typeof v==='number'?`${v>0?'+':''}${(v*100).toFixed(0)}%`:v}
                  </span>
                </div>
              ))}
              {weatherEffects.note && (
                <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', fontStyle:'italic', marginTop:4, lineHeight:1.4 }}>
                  {weatherEffects.note.slice(0,80)}...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Professions */}
        <div className="panel" style={{ flex:'1 0 auto', minHeight:380, display:'flex', flexDirection:'column' }}>
          <div className="panel-title">Profession XP <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginLeft:6 }}>· PZ skill model · actions = XP</span></div>
          <div style={{ flex:1, padding:8, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(230px, 1fr))', gap:6, alignContent:'start' }}>
            {professions.map(p => {
              const pct = (p.xp / p.maxXp) * 100;
              const color = p.css || p.color;
              const src = ZI.SKILL_XP_SOURCES[p.name]?.sources;
              const xpCopy = (src && src[0]) || p.desc || 'Actions in the field';
              return (
                <div key={p.id} style={{ padding:'8px 10px', background:'var(--bg3)', border:`1px solid ${xpFlash && xpFlash.prof===p.name ? color : 'var(--border)'}`, transition:'border-color 0.3s' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                    <span style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--text)', fontWeight:500 }}>
                      <span style={{ marginRight:5 }}>{p.icon}</span>{p.name}
                    </span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color }}>Lv {p.level}/50</span>
                  </div>
                  <ProgressBar value={pct} color={color} height={5}/>
                  <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginTop:3 }}>
                    <span>{p.xp}/{p.maxXp} XP</span>
                    <span>{p.total} total</span>
                  </div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', marginTop:3, fontStyle:'italic' }}>
                    +XP: {xpCopy}
                  </div>
                  {(() => {
                    const r = ZI.skillRust ? ZI.skillRust(p.id) : { state:'fresh' };
                    if (r.state === 'fresh') return null;
                    const days = ZI.skillIdleDays(p.id);
                    return (
                      <div style={{ marginTop:4, fontFamily:'var(--font-mono)', fontSize:11, color: r.state === 'rusted' ? 'var(--red2)' : 'var(--amber)' }}>
                        {r.state === 'rusted' ? '⚠ Rusted' : '⚠ Rusty'} · −{Math.round((1 - r.eff) * 100)}% efficiency · idle {Math.floor(days)}d{r.state === 'rusted' ? ' · losing XP' : ''}
                      </div>
                    );
                  })()}
                  {p.id === 'scavenging' && (() => {
                    const prot = Math.round(ZI.STAT_FORMULAS.scavDropProtection(p.level) * 100);
                    const bp = p.level >= 50 ? 'Total loot protection — you never lose loot.'
                             : p.level >= 25 ? 'Over half your haul survives a bad run.'
                             : 'Bad runs are punishing — level up to keep more.';
                    return (
                      <div style={{ marginTop:5, padding:'4px 6px', background:'var(--bg4)', borderLeft:'2px solid #E0A93F' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:8 }}>
                          <span style={{ color:'#E0A93F' }}>⧗ Most-gated</span>
                          <span style={{ color:'var(--green)' }}>{prot}% loot protection</span>
                        </div>
                        <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', marginTop:2 }}>{bp}</div>
                      </div>
                    );
                  })()}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: Unlock path for selected attr */}
      <div style={{ flex:'1 1 230px', minWidth:220, maxWidth:300, minHeight:'100%', display:'flex', flexDirection:'column', gap:8 }}>
        <div className="panel" style={{ flex:'1 0 auto', minHeight:420, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div className="panel-title">Stat Milestones</div>
          <div style={{ flex:1, overflow:'auto', padding:8 }}>
            {selectedAttr ? (
              <>
                <div style={{ fontFamily:'var(--font-body)', fontSize:14, color:'var(--amber)', marginBottom:4 }}>
                  {ZI.SURVIVAL_ATTRS.find(a=>a.key===selectedAttr||a.key===selectedAttr+'2')?.name || selectedAttr}
                </div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:10, lineHeight:1.6 }}>
                  {ZI.SURVIVAL_ATTRS.find(a=>a.key===selectedAttr||a.key===selectedAttr+'2')?.desc}
                </div>
                <div className="divider"/>
                {[25,50,75,100].map(threshold => {
                  const current = stats.find(s=>s.key===selectedAttr)?.level || 0;
                  const reached = current * 5 >= threshold;
                  return (
                    <div key={threshold} style={{
                      padding:'7px 8px', marginBottom:5,
                      border:`1px solid ${reached?'var(--amber)':'var(--border)'}`,
                      background: reached?'rgba(200,169,110,0.08)':'var(--bg3)',
                      opacity: reached ? 1 : 0.8,
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:2 }}>
                        <div style={{ width:7, height:7, borderRadius:'50%', background: reached?'var(--green)':'var(--border2)' }}/>
                        <span style={{ fontFamily:'var(--font-body)', fontSize:12, color: reached?'var(--amber)':'var(--text3)' }}>
                          Level {threshold/5} Milestone
                        </span>
                      </div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>
                        {threshold === 25 && 'Minor perk unlock · Scaling bonus'}
                        {threshold === 50 && 'Intermediate perk · Weapon grade up'}
                        {threshold === 75 && 'Major perk · Build archetype synergy'}
                        {threshold === 100 && 'Mastery spike · Class evolution eligible'}
                      </div>
                    </div>
                  );
                })}
              </>
            ) : (
              <div style={{ textAlign:'center', padding:20 }}>
                <div style={{ fontFamily:'var(--font-title)', fontSize:13, color:'var(--text3)', marginBottom:6 }}>Select a Stat</div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>Click any SURVIVAL attribute to view its milestone unlock path.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { StatLevelingScreen });

// ─── TRAVERSAL SIMULATION / ZOMBIE STRIKE MINIGAME ───────────────────────────
function TraversalScreen({ route }) {
  const ZI = window.ZI;
  const ZI_ART = window.ZI_ART;

  const TILE = 24; // tile size px
  const COLS = 30, ROWS = 18;
  const canvasRef = React.useRef(null);
  const stateRef = React.useRef(null);

  const [gameState, setGameState] = React.useState('traversal'); // traversal | combat | complete
  const [progress, setProgress] = React.useState(0); // 0-100 route progress
  const [score, setScore] = React.useState({ kills:0, xp:0, critHits:0 });
  const [activeZombies, setActiveZombies] = React.useState([]);
  const [player, setPlayer] = React.useState({ x:4, y:9, hp:100, stamina:78, facing:'right' });
  const [floats, setFloats] = React.useState([]); // floating damage numbers
  const [keys, setKeys] = React.useState({});
  const [lastClick, setLastClick] = React.useState(null);

  const biome = route ? ZI.BIOMES.find(b=>b.id===route.biome) : ZI.BIOMES[1];

  // Tile map generation (8-bit aesthetic)
  const tileMap = React.useMemo(() => {
    const map = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const rand = Math.sin(c * 47.3 + r * 91.7) * 0.5 + 0.5;
        let type = 'concrete';
        if (r === 0 || r === ROWS-1) type = 'rubble';
        else if (rand < 0.08) type = 'rubble';
        else if (rand < 0.15) type = 'blood';
        else if (rand > 0.92) type = 'rubble';
        map.push({ type, passable: type !== 'rubble' || rand > 0.05 });
      }
    }
    return map;
  }, []);

  // Spawn zombies periodically
  React.useEffect(() => {
    if (gameState !== 'traversal' && gameState !== 'combat') return;
    const t = setInterval(() => {
      if (activeZombies.length < 5) {
        const side = Math.random() > 0.5;
        setActiveZombies(prev => [...prev, {
          id: Date.now(),
          x: side ? COLS - 2 : 2,
          y: Math.floor(Math.random() * (ROWS - 4)) + 2,
          type: Math.random() > 0.7 ? 'runner' : 'shambler',
          hp: Math.random() > 0.7 ? 40 : 20,
          maxHp: Math.random() > 0.7 ? 40 : 20,
          state: 'moving',
        }]);
      }
    }, 2000);
    return () => clearInterval(t);
  }, [gameState, activeZombies.length]);

  // Advance progress
  React.useEffect(() => {
    const t = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { setGameState('complete'); return 100; }
        return p + 0.4;
      });
    }, 200);
    return () => clearInterval(t);
  }, []);

  // Move player via WASD
  React.useEffect(() => {
    const onKey = (e) => setKeys(prev => ({...prev, [e.key]: e.type === 'keydown'}));
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKey); };
  }, []);

  React.useEffect(() => {
    const t = setInterval(() => {
      setPlayer(p => {
        let { x, y, facing } = p;
        const speed = 1;
        if (keys['w'] || keys['W']) { y = Math.max(1, y - speed); }
        if (keys['s'] || keys['S']) { y = Math.min(ROWS-2, y + speed); }
        if (keys['a'] || keys['A']) { x = Math.max(1, x - speed); facing = 'left'; }
        if (keys['d'] || keys['D']) { x = Math.min(COLS-2, x + speed); facing = 'right'; }
        return { ...p, x, y, facing };
      });
    }, 80);
    return () => clearInterval(t);
  }, [keys]);

  // Move zombies toward player
  React.useEffect(() => {
    const t = setInterval(() => {
      setActiveZombies(prev => prev.map(z => {
        const speed = z.type === 'runner' ? 0.5 : 0.2;
        const dx = player.x - z.x, dy = player.y - z.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < 0.5) return z; // attacking range
        const nx = z.x + (dx/dist) * speed;
        const ny = z.y + (dy/dist) * speed;
        return { ...z, x: nx, y: ny };
      }));
    }, 100);
    return () => clearInterval(t);
  }, [player]);

  // Handle click attack
  const handleCanvasClick = React.useCallback((e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = (e.clientX - rect.left) / TILE;
    const my = (e.clientY - rect.top) / TILE;

    // Left click = melee, right click = ranged
    const isRanged = e.button === 2;
    const range = isRanged ? 8 : 1.5;

    const now = Date.now();
    const isCrit = lastClick && (now - lastClick) < 250; // rapid double-click = crit
    setLastClick(now);

    const dmg = isCrit ? (isRanged ? 35 : 25) : (isRanged ? 18 : 12);
    const xpGain = isCrit ? 30 : 10;

    let hitAny = false;
    setActiveZombies(prev => prev.map(z => {
      const dist = Math.sqrt((mx-z.x)**2 + (my-z.y)**2);
      if (dist < range) {
        hitAny = true;
        const newHp = z.hp - dmg;
        // Float
        setFloats(f => [...f, {
          id: Date.now() + Math.random(),
          x: z.x * TILE, y: z.y * TILE,
          text: isCrit ? `CRIT! ${dmg}` : `-${dmg}`,
          color: isCrit ? '#f0d060' : '#f08a52',
        }]);
        if (newHp <= 0) {
          setScore(s => ({ kills: s.kills+1, xp: s.xp+xpGain+(isCrit?20:0), critHits: s.critHits+(isCrit?1:0) }));
          return null;
        }
        return { ...z, hp: newHp };
      }
      return z;
    }).filter(Boolean));

    if (isCrit && hitAny) {
      setScore(s => ({...s, xp: s.xp + 5}));
    }
  }, [lastClick]);

  // Clean up old floats
  React.useEffect(() => {
    const t = setInterval(() => {
      setFloats(f => f.filter(fl => (Date.now() - fl.id) < 1500));
    }, 100);
    return () => clearInterval(t);
  }, []);

  const biomeColors = {
    mountain:  { ground:'#1a2c18', wall:'#2e3820', accent:'#4a6840' },
    suburbia:  { ground:'#1e1e1e', wall:'#2a2420', accent:'#3a3228' },
    metro:     { ground:'#181c20', wall:'#24282e', accent:'#303840' },
    perimeter: { ground:'#120c1a', wall:'#1e1428', accent:'#2a1a3a' },
  };
  const bc = biomeColors[biome?.id] || biomeColors.suburbia;

  return (
    <div className="screen-enter" style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden', background:'var(--bg)' }}>
      {/* HUD bar */}
      <div style={{
        display:'flex', gap:12, padding:'6px 12px', background:'var(--bg3)',
        borderBottom:'1px solid var(--border)', flexShrink:0, alignItems:'center',
      }}>
        <div style={{ fontFamily:'var(--font-title)', fontSize:14, color:'var(--amber)' }}>
          {route?.name || 'Traversal Run'}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', marginBottom:2 }}>ROUTE PROGRESS</div>
          <ProgressBar value={progress} color="var(--green)" height={6} animated/>
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--amber)' }}>{Math.round(progress)}%</div>
        {/* HP */}
        <div style={{ width:100 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', marginBottom:2 }}>HP</div>
          <ProgressBar value={player.hp} color="var(--red2)" height={6}/>
        </div>
        {/* Stamina */}
        <div style={{ width:100 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', marginBottom:2 }}>STAMINA</div>
          <ProgressBar value={player.stamina} color="var(--green)" height={6}/>
        </div>
        {/* Score */}
        <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--green)' }}>
          {score.kills} kills · {score.xp} XP · {score.critHits} CRITS
        </div>
        {/* Controls hint */}
        <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', borderLeft:'1px solid var(--border)', paddingLeft:10 }}>
          WASD move · LClick melee · RClick ranged · Double-click = CRIT
        </div>
      </div>

      {/* Game canvas */}
      <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
        <div
          ref={canvasRef}
          onClick={handleCanvasClick}
          onContextMenu={(e) => { e.preventDefault(); handleCanvasClick(e); }}
          style={{
            flex:1, position:'relative', overflow:'hidden',
            cursor:'crosshair', userSelect:'none',
            background: bc.ground,
          }}
        >
          {/* Tile grid */}
          {tileMap.map((tile, i) => {
            const col = i % COLS, row = Math.floor(i / COLS);
            if (tile.type === 'rubble') return (
              <div key={i} style={{
                position:'absolute',
                left: col*TILE, top: row*TILE,
                width:TILE, height:TILE,
                background: bc.wall,
                boxShadow:'inset 0 0 0 1px rgba(0,0,0,0.3)',
              }}/>
            );
            if (tile.type === 'blood') return (
              <div key={i} style={{
                position:'absolute',
                left: col*TILE, top: row*TILE,
                width:TILE, height:TILE,
                background:'#2a1414',
              }}/>
            );
            return null;
          })}

          {/* Grid lines (subtle 8-bit pixel feel) */}
          <div style={{
            position:'absolute', inset:0, pointerEvents:'none',
            backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
            backgroundSize: `${TILE}px ${TILE}px`,
          }}/>

          {/* Zombie sprites */}
          {activeZombies.map(z => {
            const hpPct = z.hp / z.maxHp;
            const zColor = z.type === 'runner' ? '#f08a52' : '#62d69a';
            return (
              <div key={z.id} style={{
                position:'absolute',
                left: z.x*TILE - TILE/2, top: z.y*TILE - TILE/2,
                width:TILE, height:TILE,
                transition:'left 0.1s, top 0.1s',
                zIndex:10,
              }}>
                {/* 8-bit zombie body */}
                <div style={{
                  width:TILE, height:TILE,
                  background: zColor,
                  border:`2px solid ${hpPct > 0.5 ? zColor : '#6b1a1a'}`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontFamily:'var(--font-mono)', fontSize:10, color:'#fff',
                  imageRendering:'pixelated',
                  opacity: 0.9,
                }}>
                  {z.type === 'runner' ? 'R' : 'Z'}
                </div>
                {/* HP bar above */}
                <div style={{ position:'absolute', top:-5, left:0, width:TILE, height:3, background:'#0f0e0c' }}>
                  <div style={{ width:`${hpPct*100}%`, height:'100%', background:zColor }}/>
                </div>
              </div>
            );
          })}

          {/* Player sprite */}
          <div style={{
            position:'absolute',
            left: player.x*TILE - TILE/2, top: player.y*TILE - TILE/2,
            width:TILE*1.2, height:TILE*1.2,
            zIndex:20, transition:'left 0.08s, top 0.08s',
          }}>
            <div style={{
              width:TILE*1.2, height:TILE*1.2,
              background:'var(--amber)', border:'2px solid var(--amber2)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontFamily:'var(--font-mono)', fontSize:12, color:'#0f0e0c', fontWeight:'bold',
              imageRendering:'pixelated',
            }}>@</div>
            {/* Player shadow */}
            <div style={{
              position:'absolute', bottom:-2, left:4, right:4, height:3,
              background:'rgba(0,0,0,0.4)', borderRadius:'50%',
            }}/>
          </div>

          {/* Floating damage numbers */}
          {floats.map(f => (
            <div key={f.id} className="tick-float" style={{
              position:'absolute', left:f.x, top:f.y,
              fontFamily:'var(--font-mono)', fontSize:f.text.startsWith('CRIT')?13:10,
              color:f.color, fontWeight:'bold', pointerEvents:'none', zIndex:30,
              textShadow:'0 0 4px rgba(0,0,0,0.8)',
            }}>{f.text}</div>
          ))}

          {/* Objective arrow */}
          <div style={{
            position:'absolute', right:TILE, top:'50%', transform:'translateY(-50%)',
            fontFamily:'var(--font-mono)', fontSize:20, color:'var(--green)',
            opacity: 0.7, animation:'threat-pulse 2s ease-in-out infinite',
          }}>→</div>

          {/* Complete overlay */}
          {gameState === 'complete' && (
            <div style={{
              position:'absolute', inset:0, background:'rgba(15,14,12,0.85)',
              display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
              zIndex:50,
            }}>
              <div style={{ fontFamily:'var(--font-title)', fontSize:36, color:'var(--green)', marginBottom:8 }}>EXTRACTED</div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:14, color:'var(--amber)', marginBottom:20 }}>
                {score.kills} kills · {score.xp} XP · {score.critHits} critical hits
              </div>
              <div style={{ display:'flex', gap:10 }}>
                <button className="btn btn-green" onClick={() => {
                  setProgress(0); setScore({kills:0,xp:0,critHits:0});
                  setActiveZombies([]); setGameState('traversal');
                }}>Run Again</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { TraversalScreen });

// ─── HACK-AND-SLASH MINIGAME ─────────────────────────────────────────────────
// Reuses TraversalScreen architecture but with distinct environments per activity
function HackSlashScreen({ activity='scavenge' }) {
  // activity: 'contracts' | 'scavenge' | 'train'
  const envColors = {
    contracts: { bg:'#0a1020', ground:'#141c28', wall:'#1e2c40', accent:'var(--blue)', label:'Faction Territory' },
    scavenge:  { bg:'#0e0c0a', ground:'#1a1814', wall:'#2a2010', accent:'var(--amber)', label:'Ruined Suburbia' },
    train:     { bg:'#0a100c', ground:'#141c14', wall:'#202c20', accent:'var(--green)', label:'Training Grounds' },
  };
  const env = envColors[activity] || envColors.scavenge;

  return (
    <div style={{ height:'100%', display:'flex', flexDirection:'column', overflow:'hidden', background:env.bg }}>
      {/* Environment header */}
      <div style={{
        padding:'6px 12px', background:'var(--bg3)', borderBottom:'1px solid var(--border)',
        display:'flex', alignItems:'center', gap:10, flexShrink:0,
      }}>
        <div style={{ width:8, height:8, borderRadius:'50%', background:env.accent, boxShadow:`0 0 6px ${env.accent}` }}/>
        <span style={{ fontFamily:'var(--font-title)', fontSize:14, color:env.accent }}>
          {activity.toUpperCase()} — {env.label}
        </span>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)', marginLeft:8 }}>
          WASD · LClick attack · RClick power/ranged · 1-4 switch items
        </span>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          {['1:Axe','2:Rifle','3:Medkit','4:Grenade'].map((item, i) => (
            <div key={i} style={{
              padding:'2px 8px', border:'1px solid var(--border2)',
              fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)',
              background: i===0?'rgba(200,169,110,0.12)':'transparent',
            }}>{item}</div>
          ))}
        </div>
      </div>
      {/* Embed traversal game with appropriate biome */}
      <div style={{ flex:1 }}>
        <TraversalScreen route={
          activity==='contracts' ? ZI.ROUTES[4] :
          activity==='scavenge'  ? ZI.ROUTES[1] :
          ZI.ROUTES[0]
        }/>
      </div>
    </div>
  );
}
Object.assign(window, { HackSlashScreen });
