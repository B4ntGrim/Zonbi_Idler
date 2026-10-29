// progression-ui.jsx — STAT-02 Survivor panel (Stats screen): level, upgrade picks, condition words, Eat, away summary.
// UI rule: show names and rounded values only. Never show ranks, the curve dial, pity weights or modifier formulas.
function SurvivorProgressPanel() {
  const ZI = window.ZI, P = ZI && ZI.PROG, L = P && P.LIVE;
  const [, bump] = React.useState(0);
  const [note, setNote] = React.useState(null);
  React.useEffect(() => {
    if (!L) return;
    const off = L.onChange(() => bump(n => n + 1));
    const off2 = ZI.onInventoryChange ? ZI.onInventoryChange(() => bump(n => n + 1)) : null;
    const t = setInterval(() => bump(n => n + 1), 5000);
    return () => { off(); if (typeof off2 === 'function') off2(); clearInterval(t); };
  }, []);
  if (!L) return null;

  const level = ZI.getCharacterLevel(), xp = ZI.getCharacterXp();
  const from = P.xpForLevel(level), to = level >= 100 ? from : P.xpForLevel(level + 1);
  const pct = level >= 100 ? 100 : Math.max(0, Math.min(100, (xp - from) / Math.max(1, to - from) * 100));
  const st = L.getState(), offer = st.pending > 0 ? L.currentOffer() : null;
  const labels = L.labels(), status = L.getStatus(), idx = L.statusIndex();
  const food = L.foodList().length, autoEat = L.autoEatOwned();
  const tone = (track) => { const tier = P.STATUS[track].tiers[idx[track]]; return tier.pol > 0 ? 'var(--green)' : tier.pol === 0 ? 'var(--text2)' : (idx[track] >= P.STATUS[track].tiers.length - 1 ? 'var(--red2)' : 'var(--amber)'); };
  const mono = { fontFamily:'var(--font-mono)', fontSize:11 };
  const btn = { ...mono, padding:'6px 10px', background:'var(--bg4)', color:'var(--text)', border:'1px solid var(--border)', cursor:'pointer' };

  const pick = (key) => { const r = L.choose(key); setNote(r.ok ? r.card : r.reason); bump(n => n + 1); };
  const eat = () => { const r = L.eat(); setNote(r.ok ? `Ate ${r.name}.` : r.reason); bump(n => n + 1); };
  const nap = () => { const r = L.nap(); setNote(r.ok ? 'Took a nap.' : r.reason); bump(n => n + 1); };
  const dismissAway = () => { const s = L.getStatus(); s.lastAway = null; L.saveStatus(s); };

  return (
    <div className="panel" style={{ flex:'1 1 100%', display:'flex', flexDirection:'column' }} data-testid="survivor-progress">
      <div className="panel-title" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <span>Survivor</span>
        <span style={{ ...mono, color:'var(--amber)' }}>Level {level}</span>
      </div>
      <div style={{ padding:10, display:'flex', flexDirection:'column', gap:10 }}>
        {status.lastAway && (
          <div style={{ ...mono, color:'var(--text)', background:'var(--bg3)', border:'1px solid var(--border)', padding:'7px 10px', display:'flex', justifyContent:'space-between', gap:8 }}>
            <span>While you were away: {status.lastAway.text}.</span>
            <button style={{ ...btn, padding:'2px 8px' }} onClick={dismissAway} aria-label="Dismiss away summary">OK</button>
          </div>
        )}
        <div>
          <div style={{ height:6, background:'var(--bg4)', border:'1px solid var(--border)' }}>
            <div style={{ width: pct + '%', height:'100%', background:'var(--amber)' }}/>
          </div>
          <div style={{ ...mono, color:'var(--text3)', marginTop:4 }}>{level >= 100 ? 'Max level' : `${Math.max(0, to - xp).toLocaleString()} XP to level ${level + 1}`}</div>
        </div>

        {offer && (
          <div style={{ border:'1px solid var(--amber)', padding:8, background:'var(--bg3)' }}>
            <div style={{ ...mono, color:'var(--amber)', marginBottom:6 }}>Choose an upgrade{st.pending > 1 ? ` · ${st.pending} waiting` : ''}</div>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {offer.map(k => (
                <button key={k} style={{ ...btn, flex:'1 1 140px', textAlign:'left' }} onClick={() => pick(k)}>{L.cardText(k, L.rank(k))}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {P.STATUS_KEYS.map(t => (
            <div key={t} style={{ ...mono, padding:'4px 8px', border:'1px solid var(--border)', background:'var(--bg3)' }} title={P.STATUS[t].label}>
              <span style={{ color:'var(--text3)' }}>{P.STATUS[t].label}: </span><span style={{ color: tone(t) }}>{labels[t]}</span>
            </div>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <button style={btn} onClick={eat} disabled={!food}>Eat ({food} in camp)</button>
          <button style={btn} onClick={nap} disabled={!L.canNap()} title={L.canNap() ? 'Rest for a short while' : 'Nap at your base or camp'}>Nap</button>
          <span style={{ ...mono, color:'var(--text3)' }}>{autoEat ? 'Auto-Eat is on.' : 'Auto-Eat: buy it in the Shop.'}</span>
          {note && <span style={{ ...mono, color:'var(--text2)' }}>{note}</span>}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(150px, 1fr))', gap:4 }}>
          {P.visibleStats().map(s => {
            return (
              <div key={s.key} style={{ ...mono, display:'flex', justifyContent:'space-between', padding:'3px 6px', background:'var(--bg3)', border:'1px solid var(--border)' }}>
                <span style={{ color:'var(--text2)' }}>{s.name}</span><span style={{ color:'var(--text)' }}>{L.display(s.key)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { SurvivorProgressPanel });
