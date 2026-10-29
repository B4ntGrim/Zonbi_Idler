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
  const accent = mode === 'camp' ? 'var(--green)' : 'var(--amber)';
  const steps = [
    { title: 'Choose Your Survivor', tag: 'Who will survive?', line: 'Every survivor has a story. Yours starts here.' },
    { title: 'Make Your Mark', line: "The wasteland doesn't care how you look. The survivors might." },
    { title: 'What Were You Before?', line: "The old world taught you something. Let's hope it was useful." },
    { title: 'One More Survivor', line: "The world ended. Your story didn't." },
  ];
  const canNext = step === 0 ? !!gender : step === 2 ? !!profession : true;
  const g = C.genders.find(x => x.id === gender);
  const clothing = C.appearance.clothing.options.find(o => o.id === appearance.clothing);
  const prof = professions.find(p => p.id === profession);
  const optLabel = (k) => { const o = C.appearance[k].options.find(x => x.id === appearance[k]); return o ? o.label : '—'; };

  const Portrait = ({ gid, size }) => {
    const gg = C.genders.find(x => x.id === gid);
    if (!gg) return <div style={{ width: size, height: size, border: '1px dashed var(--border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)', fontFamily:'var(--font-mono)', fontSize:11 }}>?</div>;
    return <div role="img" aria-label={gg.label + ' survivor'} style={{ width: size, height: size, backgroundImage: `url("${gg.art.src}")`, backgroundSize: gg.art.size, backgroundPosition: '0% 0%', backgroundRepeat: 'no-repeat', imageRendering: 'pixelated', filter: gid === gender && clothing ? clothing.filter : 'none' }}/>;
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
                <div style={{ display:'flex', justifyContent:'center' }}><Portrait gid={x.id} size={180}/></div>
                <div style={{ fontFamily:'var(--font-title)', fontSize:18, color:'var(--text)', textAlign:'center' }}>{x.label}</div>
              </>
            ), x.id))}
            <div style={{ gridColumn:'1 / -1', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)' }}>Your choice changes the art only. Men and women survive on the same terms.</div>
          </div>
        )}

        {step === 1 && (
          <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
            <div style={{ flex:'0 0 auto' }}><Portrait gid={gender} size={200}/></div>
            <div style={{ flex:'1 1 320px', display:'flex', flexDirection:'column', gap:14, minWidth:0 }}>
              {Object.entries(C.appearance).map(([k, cat]) => (
                <div key={k}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', letterSpacing:'0.12em', marginBottom:6 }}>{cat.label.toUpperCase()}</div>
                  <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                    {cat.options.map(o => (
                      <button key={o.id} className={appearance[k] === o.id ? 'btn btn-amber' : 'btn'} aria-pressed={appearance[k] === o.id} onClick={() => setAppearance(a => Object.assign({}, a, { [k]: o.id }))}>{o.label}</button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)' }}>Looks only: no appearance choice changes your stats. More options are on the way.</div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(240px, 1fr))', gap:12 }}>
            {professions.map(p => card(profession === p.id, () => setProfession(p.id), (
              <>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}><span style={{ fontSize:20 }}>{p.icon}</span><span style={{ fontFamily:'var(--font-title)', fontSize:18, color:'var(--text)' }}>{p.title}</span></div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--text2)' }}>{p.blurb}</div>
                <div style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--text3)', fontStyle:'italic' }}>"{p.flavor}"</div>
                <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>{p.effects.map(e => <span key={e.prof} style={{ fontFamily:'var(--font-mono)', fontSize:10, color: accent, border:`1px solid ${accent}`, padding:'2px 6px' }}>+{e.xp} {e.name} XP</span>)}</div>
              </>
            ), p.id))}
            <div style={{ gridColumn:'1 / -1', fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)' }}>Profession effects are starting Profession XP. They are separate from appearance, which has no effects.</div>
          </div>
        )}

        {step === 3 && (
          <div style={{ display:'flex', gap:18, flexWrap:'wrap' }}>
            <div style={{ flex:'0 0 auto' }}><Portrait gid={gender} size={220}/></div>
            <div style={{ flex:'1 1 320px', display:'flex', flexDirection:'column', gap:10, minWidth:0 }}>
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
            : <button className="btn btn-amber" disabled={!gender || !profession} onClick={() => onConfirm({ gender, appearance, profession, createdAt: Date.now() })}>Start Surviving</button>}
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { CharacterCreationScreen });
