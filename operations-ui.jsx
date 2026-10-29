// operations-ui.jsx — Operations page shown on the Schedule tab (Sam, Oct 29: build reference/operations-schedule-proposal.md).
// Three sections: Now and next · Plan (activity catalog with availability) · Base schedule. Buttons open the screen
// that owns an activity; the one change made here is Camp Leader duty assignment (ZI.opsAssign / ZI.opsUnassign). Proposed activities are labeled "Design proposal" and cannot be selected.
// The previous mock timeline (ScheduleScreenV2 in screens-v2b.jsx) is kept in the code, unused, for rollback.
function OperationsScreen({ mode, setScreen }) {
  const ZI = window.ZI;
  const [, tick] = React.useState(0);
  React.useEffect(() => { const t = setInterval(() => tick(n => n + 1), 5000); return () => clearInterval(t); }, []);
  const [showProposals, setShowProposals] = React.useState(true);
  const [dutyMsg, setDutyMsg] = React.useState(null);
  const now = ZI.opsNow(mode), catalog = ZI.opsCatalog(mode);
  const isCamp = mode === 'camp', accent = isCamp ? 'var(--green)' : 'var(--amber)';
  const go = (screen) => screen && setScreen && setScreen(screen);
  const badge = (st) => {
    const col = st.key === 'available' ? 'var(--green)' : st.key === 'proposal' ? 'var(--text3)' : st.key === 'busy' ? 'var(--blue)' : 'var(--amber)';
    return <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color: col, border:`1px solid ${col}`, padding:'1px 6px', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>{st.label}</span>;
  };
  const H = ({ children, sub }) => (
    <div style={{ margin:'18px 0 8px' }}>
      <div style={{ fontFamily:'var(--font-title)', fontSize:16, color: accent, letterSpacing:'0.08em' }}>{children}</div>
      {sub && <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)', marginTop:2 }}>{sub}</div>}
    </div>
  );
  const row = (r) => (
    <div key={r.id} className="panel" style={{ padding:'8px 10px', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
      <span style={{ fontFamily:'var(--font-body)', fontSize:14, color:'var(--text)', minWidth:150 }}>{r.label}</span>
      <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', flex:'1 1 200px', minWidth:0 }}>{r.detail}</span>
      {r.screen && <button className="btn" onClick={() => go(r.screen)}>Open</button>}
    </div>
  );
  const groups = [['field', 'Field operations'], ['base', 'Base and return operations']];
  return (
    <div style={{ height:'100%', overflow:'auto', padding:'16px 18px 60px' }}>
      <div style={{ maxWidth:980, margin:'0 auto' }}>
        <div style={{ display:'flex', alignItems:'baseline', gap:10, flexWrap:'wrap' }}>
          <span style={{ fontFamily:'var(--font-title)', fontSize:24, color:'var(--text)' }}>Operations</span>
          <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)' }}>{isCamp ? 'Camp Leader: assignments to camp survivors and facilities' : 'Solo Survivor: your own plan, no camp roster'}</span>
        </div>

        <H sub="What is running now and what needs you. Updates every few seconds.">Now and next</H>
        {now.attention.length > 0 && (
          <div className="panel" style={{ padding:'8px 10px', marginBottom:8, borderColor:'var(--amber)' }}>
            {now.attention.map((t, i) => <div key={i} style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--amber)' }}>⚠ {t}</div>)}
          </div>
        )}
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>{now.field.map(row)}</div>
        {now.camp.length > 0 && <div style={{ display:'flex', flexDirection:'column', gap:6, marginTop:6 }}>{now.camp.map(row)}</div>}

        <H sub="Choose an activity; Open takes you to the screen that runs it. Design proposals are not playable yet.">Plan</H>
        <label style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', display:'inline-flex', gap:6, alignItems:'center', marginBottom:6 }}>
          <input type="checkbox" checked={showProposals} onChange={e => setShowProposals(e.target.checked)}/> Show design proposals
        </label>
        {groups.map(([gid, gname]) => {
          const items = catalog.filter(a => a.group === gid && (showProposals || !a.proposal));
          if (!items.length) return null;
          return (
            <div key={gid} style={{ marginBottom:10 }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', letterSpacing:'0.14em', margin:'8px 0 6px' }}>{gname.toUpperCase()}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:8 }}>
                {items.map(a => {
                  const st = ZI.opsActivityStatus(a, mode);
                  return (
                    <div key={a.id} className="panel" style={{ padding:10, display:'flex', flexDirection:'column', gap:5, opacity: a.proposal ? 0.65 : 1 }}>
                      <div style={{ display:'flex', gap:6, alignItems:'center' }}><span style={{ fontFamily:'var(--font-body)', fontSize:14, color:'var(--text)', flex:1 }}>{a.name}</span>{badge(st)}</div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text2)' }}>{a.result}</div>
                      {a.designOrder && <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--amber)' }}>Design order: {a.designOrder} of 3 (cooking → weapon upkeep → laundry)</div>}
                      {!a.proposal && <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>Who: {a.who} · Needs: {a.needs} · While away: {a.away}</div>}
                      {a.screen && !a.proposal && (!isCamp || a.screen !== 'solo-main') && <button className="btn" style={{ alignSelf:'flex-start' }} onClick={() => go(a.screen)}>Open</button>}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        <H sub={isCamp ? 'Camp duties staffed by your survivors. Assign one survivor per duty.' : 'Your upkeep at your base or forward camp.'}>Base schedule</H>
        {isCamp ? (() => {
          const duties = ZI.opsCampDuties(), busy = ZI.opsRouteBusy(), roster = ZI.SQUAD_ROSTER || [];
          const staffed = duties.reduce((n, d) => n + d.whoIds.length, 0), cap = ZI.opsDutySlots();
          const assignedTo = {}; duties.forEach(d => d.whoIds.forEach(id => { assignedTo[id] = d.label; }));
          const assign = (svId, jobId) => { const r = svId ? ZI.opsAssign(svId, jobId, mode) : { ok: true }; setDutyMsg(r.ok ? null : r.reason); tick(n => n + 1); };
          return (
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)' }}>Duty slots in use: {staffed} / {cap} (more with leader level). A survivor holds one duty at a time; survivors away on a route run cannot take one.</div>
            {dutyMsg && <div role="status" style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--red2)' }}>⚠ {dutyMsg}</div>}
            {duties.map(d => (
              <div key={d.id} className="panel" style={{ padding:'8px 10px', display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                <span style={{ fontFamily:'var(--font-body)', fontSize:14, color:'var(--text)', minWidth:170 }}>{d.label}</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text2)', flex:'1 1 160px' }}>{d.profession} · {d.xpPerHour} XP per game hour</span>
                {d.built ? (
                  d.whoIds.length ? (
                    <>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--green)' }}>{d.who.join(', ')}{d.whoIds.some(id => busy[id]) ? ' (also on a route!)' : ''}</span>
                      <button className="btn" onClick={() => { d.whoIds.forEach(id => ZI.opsUnassign(id, mode)); setDutyMsg(null); tick(n => n + 1); }}>Unassign</button>
                    </>
                  ) : (
                    <select aria-label={'Assign a survivor to ' + d.label} value="" onChange={e => assign(e.target.value, d.id)} style={{ fontFamily:'var(--font-mono)', fontSize:11, background:'var(--bg)', color:'var(--text)', border:'1px solid var(--border)', padding:'4px 6px' }}>
                      <option value="">Assign…</option>
                      {roster.map(s => <option key={s.id} value={s.id} disabled={!!busy[s.id]}>{s.name}{busy[s.id] ? ' (on a route)' : assignedTo[s.id] ? ' (moves from ' + assignedTo[s.id] + ')' : ''}</option>)}
                    </select>
                  )
                ) : <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--amber)' }}>{d.status}</span>}
              </div>
            ))}
            <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)' }}>Duties earn their profession XP while you are away (24-hour offline cap). Proposed camp chores (cooking, then weapon upkeep, then laundry) are listed under Plan as design proposals.</div>
          </div>
          );
        })()
        : (
          <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {catalog.filter(a => a.group === 'base' && !a.proposal).map(a => row({ id: 'b:' + a.id, label: a.name, detail: ZI.opsActivityStatus(a, mode).label + ' · ' + a.result, screen: a.screen }))}
          </div>
        )}
      </div>
    </div>
  );
}
Object.assign(window, { OperationsScreen });
