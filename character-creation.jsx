// character-creation.jsx — the four-step survivor creation shown when a New Game is started (Sam, Oct 29).
// Source: Google Doc "Zed Idler — Character Creation Instructions (Draft)", Oct 28. Data and rules: game/character.js.
// Steps: Choose Your Survivor · Make Your Mark · What Were You Before? · One More Survivor ("Start Surviving").
// Nothing is created until the player confirms; Back keeps every other choice.
function CharacterCreationScreen({ mode, slot, onCancel, onConfirm }) {
  const ZI = window.ZI, C = ZI.CHAR_CREATION;
  const professions = React.useMemo(() => ZI.charProfessions(), []);
  const [step, setStep] = React.useState(0);
  const [gender, setGender] = React.useState(null);
  const [appearance, setAppearance] = React.useState(() => ZI.charDefaultAppearance());
  const [profession, setProfession] = React.useState(null);
  const [professionQuery, setProfessionQuery] = React.useState('');
  const [name, setName] = React.useState('');
  const [frame, setFrame] = React.useState(0);
  React.useEffect(() => {
    if (step === 0) return undefined;
    const timer = window.setInterval(() => setFrame(f => (f + 1) % 16), 110);
    return () => window.clearInterval(timer);
  }, [step]);
  const accent = mode === 'camp' ? 'var(--green)' : 'var(--amber)';
  const steps = [
    { title: 'Choose Your Survivor', tag: 'Who will survive?', line: 'Every survivor has a story. Yours starts here.' },
    { title: 'Make Your Mark', line: "The wasteland doesn't care how you look. The survivors might." },
    { title: 'What Were You Before?', line: "The old world taught you something. Let's hope it was useful." },
    { title: 'One More Survivor', line: "The world ended. Your story didn't." },
  ];
  const canNext = step === 0 ? !!gender : step === 1 ? !!name.trim() : step === 2 ? !!profession : true;
  const g = C.genders.find(x => x.id === gender);
  const prof = professions.find(p => p.id === profession);
  const optLabel = (k) => { const o = C.appearance[k].options.find(x => x.id === appearance[k]); return o ? o.label : '—'; };

  const portrait = (gid, size, animated = false) => {
    const gg = C.genders.find(x => x.id === gid);
    if (!gg) return <div style={{ width: size, height: size, border: '1px dashed var(--border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)', fontFamily:'var(--font-mono)', fontSize:11 }}>?</div>;
    return animated && step === 1 ? <CharacterSprite gender={gid} appearance={appearance} frame={frame} width={size}/>
      : animated ? <div role="img" aria-label={gg.label + ' 16-frame survivor animation'} style={{ width:size, height:Math.round(size*1.5), backgroundImage:`url("${gg.art.walk}")`, backgroundSize:'400% 400%', backgroundPosition:`${(frame % 4)*100/3}% ${Math.floor(frame/4)*100/3}%`, backgroundRepeat:'no-repeat', imageRendering:'pixelated', backgroundColor:'#0b0d0d', border:'1px solid var(--border)' }}/>
      : <img src={gg.art.src} alt={gg.label + ' survivor'} width={size} height={Math.round(size * 1.5)} style={{ objectFit:'contain', imageRendering:'pixelated', background:'#0b0d0d', border:'1px solid var(--border)' }}/>;
  };
  const chip = (txt) => <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text2)', border:'1px solid var(--border)', padding:'2px 6px' }}>{txt}</span>;
  const card = (active, onClick, children, key) => (
    <button key={key} onClick={onClick} className="btn" aria-pressed={active} style={{ textAlign:'left', padding:12, textTransform:'none', letterSpacing:'normal', borderColor: active ? accent : 'var(--border)', borderWidth: active ? 2 : 1, background: active ? 'rgba(230,196,126,0.10)' : undefined, display:'flex', flexDirection:'column', gap:6, minWidth:0 }}>{children}</button>
  );

  return (
    <div style={{ position:'relative', height:'100%', overflow:'auto', padding:'28px 20px 60px', display:'flex', justifyContent:'center' }}>
      <div style={{ width:'100%', maxWidth:820 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14, flexWrap:'wrap' }}>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color: accent, letterSpacing:'0.2em' }}>{mode === 'camp' ? 'CAMP LEADER' : 'SOLO SURVIVOR'} · FILE {slot} · NEW SURVIVOR</span>
          <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)' }}>Step {step + 1} of 4</span>
        </div>
        <div style={{ fontFamily:'var(--font-title)', fontSize:30, color:'var(--text)' }}>{steps[step].title}</div>
        {steps[step].tag && <div style={{ fontFamily:'var(--font-title)', fontSize:18, color: accent, marginTop:4 }}>{steps[step].tag}</div>}
        <div style={{ fontFamily:'var(--font-body)', fontSize:14, color:'var(--text2)', margin:'6px 0 20px' }}>{steps[step].line}</div>

        {step === 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px, 1fr))', gap:12 }}>
            {C.genders.map(x => card(gender === x.id, () => setGender(x.id), (
              <>
                <div style={{ display:'flex', justifyContent:'center' }}>{portrait(x.id, 180)}</div>
                <div style={{ fontFamily:'var(--font-title)', fontSize:18, color:'var(--text)', textAlign:'center' }}>{x.label}</div>
              </>
            ), x.id))}
            <div style={{ gridColumn:'1 / -1', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)' }}>Your choice changes the art only. Men and women survive on the same terms.</div>
          </div>
        )}

        {step === 1 && (
          <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
            <div style={{ flex:'0 0 auto', position:'sticky', top:12, alignSelf:'flex-start' }}>{portrait(gender, 220, true)}<div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)', marginTop:4 }}>16-frame preview · appearance updates live</div></div>
            <div style={{ flex:'1 1 320px', display:'flex', flexDirection:'column', gap:14, minWidth:0 }}>
              <label style={{ display:'flex', flexDirection:'column', gap:6, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)' }}>SURVIVOR NAME
                <input value={name} maxLength={24} onChange={e => setName(e.target.value)} placeholder="Enter a survivor name" aria-label="Survivor name" style={{ padding:'9px 10px', background:'var(--bg3)', color:'var(--text)', border:'1px solid var(--border)', fontFamily:'var(--font-body)', fontSize:15 }}/>
              </label>
              {Object.entries(C.appearance).map(([k, cat]) => (
                <div key={k}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', letterSpacing:'0.12em', marginBottom:6 }}>{cat.label.toUpperCase()}</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {cat.options.map(o => (
                      <button key={o.id} className={appearance[k] === o.id ? 'btn btn-amber' : 'btn'} aria-pressed={appearance[k] === o.id} onClick={() => setAppearance(a => Object.assign({}, a, { [k]: o.id }))} style={{ textTransform:'none', letterSpacing:'normal', display:'inline-flex', alignItems:'center', gap:6 }}>{o.swatch && <span aria-hidden="true" style={{ width:12, height:12, background:o.swatch, border:'1px solid var(--border)', display:'inline-block' }}/>}{o.label}</button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)' }}>Appearance is cosmetic. Each choice updates the preview; starting XP comes from your old-world background.</div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
            <div style={{ flex:'0 0 auto', position:'sticky', top:12, alignSelf:'flex-start' }}>{portrait(gender, 180, true)}</div>
            <div style={{ flex:'1 1 520px', minWidth:0, display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:12 }}>
            <label style={{ gridColumn:'1 / -1', display:'flex', flexDirection:'column', gap:6, fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)' }}>FIND AN OLD-WORLD BACKGROUND
              <input value={professionQuery} onChange={e => setProfessionQuery(e.target.value)} placeholder="Search 24 backgrounds" aria-label="Search old-world backgrounds" style={{ padding:'9px 10px', background:'var(--bg3)', color:'var(--text)', border:'1px solid var(--border)', fontFamily:'var(--font-body)', fontSize:15 }}/>
            </label>
            {professions.filter(p => (p.title + ' ' + p.blurb + ' ' + p.lean).toLowerCase().includes(professionQuery.trim().toLowerCase())).map(p => card(profession === p.id, () => setProfession(p.id), (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ fontSize:20 }}>{p.icon}</span><span style={{ fontFamily:'var(--font-title)', fontSize:18, color:'var(--text)' }}>{p.title}</span></div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--text2)' }}>{p.blurb}</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--text3)', fontStyle:'italic' }}>"{p.flavor}"</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>{p.effects.map(e => <span key={e.prof} style={{ fontFamily:'var(--font-mono)', fontSize:10, color: accent, border:`1px solid ${accent}`, padding:'2px 6px' }}>+{e.xp} {e.name} XP</span>)}</div>
              </>
            ), p.id))}
            <div style={{ gridColumn:'1 / -1', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)' }}>Profession effects are starting Profession XP. They are separate from appearance, which has no effects.</div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
            <div style={{ flex:'0 0 auto' }}>{portrait(gender, 220, true)}</div>
            <div style={{ flex:'1 1 320px', display:'flex', flexDirection:'column', gap:10, minWidth:0 }}>
              <div><span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)' }}>NAME </span><span style={{ fontFamily:'var(--font-title)', fontSize:18 }}>{name.trim()}</span> <button className="btn" onClick={() => setStep(1)}>Change</button></div>
              <div><span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)' }}>SURVIVOR </span><span style={{ fontFamily:'var(--font-title)', fontSize:18 }}>{g ? g.label : '—'}</span> <button className="btn" onClick={() => setStep(0)}>Change</button></div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', alignItems:'center' }}><span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)' }}>LOOK </span>{Object.keys(C.appearance).map(k => <React.Fragment key={k}>{chip(C.appearance[k].label + ': ' + optLabel(k))}</React.Fragment>)}<button className="btn" onClick={() => setStep(1)}>Change</button></div>
              <div><span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)' }}>BEFORE </span><span style={{ fontFamily:'var(--font-title)', fontSize:18 }}>{prof ? prof.icon + ' ' + prof.title : '—'}</span> <button className="btn" onClick={() => setStep(2)}>Change</button></div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}><span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)' }}>STARTS WITH </span>{prof ? prof.effects.map(e => <React.Fragment key={e.prof}>{chip('+' + e.xp + ' ' + e.name + ' XP')}</React.Fragment>) : chip('—')}</div>
            </div>
          </div>
        )}

        <div style={{ display:'flex', gap:8, marginTop:24, flexWrap:'wrap' }}>
          <button className="btn" onClick={() => step === 0 ? onCancel() : setStep(step - 1)}>{step === 0 ? '← Save files' : '← Back'}</button>
          <div style={{ flex:1 }}/>
          {step < 3
            ? <button className="btn btn-amber" disabled={!canNext} onClick={() => canNext && setStep(step + 1)}>Continue →</button>
            : <button className="btn btn-amber" disabled={!gender || !profession || !name.trim()} onClick={() => onConfirm({ gender, appearance, profession, name:name.trim(), createdAt: Date.now() })}>Start Surviving</button>}
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { CharacterCreationScreen });
