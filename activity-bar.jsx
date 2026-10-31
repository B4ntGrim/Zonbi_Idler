// Polls display data only. Does not create an independent simulation timer.
function ActivityBar() {
  const [, refresh] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => { ZI.ActivityFeed.sample(); refresh(n => n + 1); }, 1000);
    return () => clearInterval(t);
  }, []);
  const s = ZI.getSettings(); if (!s.activityBar) return null;
  const entries = ZI.ActivityFeed.visible().slice(-3);
  return <aside aria-label="Activity gains" style={{flexShrink:0,borderTop:'1px solid var(--border)',background:'var(--bg2)',padding:'6px 12px',fontSize:12,display:'flex',gap:12,alignItems:'center',flexWrap:'wrap'}}>
    <span style={{color:'var(--amber)'}}>ACTIVITY · 1s updates</span>
    <span style={{flex:1}}>{entries.length ? entries.map((e,i) => <span key={i} style={{marginRight:16}}>{ZI.ActivityFeed.text(e)}</span>) : 'Gains will appear here.'}</span>
    <SettingsButton above/>
    <a href="companion-prototype.html" target="_blank" rel="noopener noreferrer">Companion prototype</a>
  </aside>;
}
window.ActivityBar = ActivityBar;
