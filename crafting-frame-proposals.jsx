// Proposed card previews embedded inside Crafting, with source-linked reference data.
(function () {
  const W = window.ZI_CRAFTING_FRAMES;
  const rarityNames = { common:'Common', uncommon:'Uncommon', rare:'Rare', epic:'Epic', legendary:'Legendary', exotic:'Exotic', unique:'Unique', relic:'Relic Legendary' };
  const rosters = [['all','All rosters'],['launch','Launch axes'],['live','In game'],['axes','100 axe designs'],['uniques','Uniques'],['sets','Sets'],['ranged','Ranged concepts'],['workshop','Workshop'],['relics','Relics'],['legacy','Legacy prototype']];
  const slotName = s => ({primary:'Primary',secondary:'Sidearm',melee:'Melee',throwable:'Throwable',offhand:'Off-hand (proposed)'}[s] || W.MISSING);
  const themeFor = r => r.art === 'flame' ? 'hazard' : ['pistol','revolver','flare','smg'].includes(r.art) ? 'bronze' : ['crossbow','bow','axe','shield'].includes(r.art) && r.rarity !== 'unique' ? 'leather' : 'copper';
  const isMissing = v => v == null || v === '' || v === W.MISSING;

  // Integer-grid silhouettes stay crisp at every card size; no text is baked into art.
  // Team sprite art keeps a hint of real-world size but stays readable (Sam, Oct 27): the picture fills 75% of the
  // box for the smallest items (knives, pistols) up to 100% for 110 cm and longer (rifles, flamethrower rig).
  const spriteFill = cm => Math.round(75 + 25 * Math.max(0, Math.min(1, (cm - 15) / 95)));
  function WeaponArt({ record:r, compact=false }) {
    if (r.sprite) return <span className={'wc-art wc-art-sprite' + (compact ? ' wc-art-small' : '')} aria-hidden="true">
      <img src={r.sprite.src} alt="" draggable={false} style={compact ? undefined : (r.sprite.w / r.sprite.h < 1.2 ? { height: spriteFill(r.sprite.cm) + '%', width:'auto' } : { width: spriteFill(r.sprite.cm) + '%' })}/>
    </span>;
    const electric = /shock|arc|void|night-current/.test(r.id);
    const metal = r.section === 'C1' ? '#a3aaa0' : r.section === 'C2' || r.id === 'unique-raquelle' ? '#b78654' : '#a3b0ad';
    const light = electric ? '#77e4e5' : '#e6c895';
    const twoBlade = /double|twin|paired wings/i.test((r.description || '') + ' ' + (r.subfamily || ''));
    const axeHead = r.id === 'unique-danielle' || r.id === 'AXE-152' ? 'M47 13L65 11 72 16 68 30 57 32 54 26 47 25z'
      : r.id === 'unique-raquelle' || r.id === 'AXE-153' ? 'M47 15L64 8 76 12 82 23 77 40 63 35 56 28 47 27z'
      : r.id === 'AXE-251' || r.id === 'AXE-258' ? 'M47 14L61 9 69 12 66 20 76 25 72 35 60 29 47 25z'
      : r.section === 'C1' ? 'M42 13L61 10 72 21 64 34 44 29z' : 'M47 13L68 10 78 16 75 35 58 30 47 27z';
    const t = r.art;
    return <svg className={'wc-art' + (compact ? ' wc-art-small' : '')} viewBox="0 0 96 80" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <ellipse cx="48" cy="70" rx="33" ry="3" fill="#050808" opacity=".6"/>
      <g stroke="#080b0c" strokeWidth="2" strokeLinejoin="miter">
        {t === 'axe' && <g transform="rotate(28 48 40)">
          <path d="M44 13h7v57h-7z" fill="#66513c"/><path d="M45 48h5v17h-5z" fill="#302e29"/>
          <path d={axeHead} fill={metal}/>
          <path d="M61 15h3v8h-3z" fill="#d1d5bb" stroke="none"/>
          {twoBlade && <path d="M46 13L28 10 18 16 21 35 38 30 47 27z" fill={metal}/>}
          <path d="M44 17h8v7h-8z" fill="#544a38"/>
          {r.rarity === 'unique' && <path d="M58 19h9v4h-9z" fill="#e4bb63" stroke="none"/>}
        </g>}
        {t === 'set' && <><path d="M29 17l19 23-19 23L10 40z" fill="#8b9c77"/><path d="M67 17l19 23-19 23L48 40z" fill="#b79d66"/><path d="M29 28l10 12-10 12-10-12zM67 28l10 12-10 12-10-12z" fill="#1b261b"/></>}
        {(t === 'rifle' || t === 'support' || t === 'shotgun' || t === 'smg') && <g transform="rotate(-18 48 40)">
          <path d="M8 31h19v15H17l-9 9z" fill="#68513c"/><path d="M27 29h35v16H27z" fill="#5a6867"/>
          <path d="M60 33h25v7H60zM83 31h7v11h-7z" fill="#8b9894"/>
          <path d="M36 43h9l-2 17h-8z" fill="#3b403c"/><path d="M48 44h11l4 16H49z" fill="#535a51"/>
          {t === 'support' && <path d="M48 45h16v17H48z" fill="#716f55"/>}
          {t === 'rifle' && <path d="M38 20h23v7H38zM46 27v3" fill="#465251"/>}
          {t === 'shotgun' && <path d="M61 42h22v5H61z" fill="#6a503c"/>}
          {t === 'smg' && <path d="M72 31h18v12H72z" fill="#3c4645"/>}
          <path d="M32 33h20v3H32z" fill={electric ? light : '#a0a997'} stroke="none"/>
        </g>}
        {(t === 'pistol' || t === 'revolver' || t === 'flare') && <g transform="rotate(-24 48 40)">
          <path d="M24 26h53v12H42l-4 27H24l6-29h-6z" fill="#87928b"/>
          <path d="M28 39h11l-3 22H25z" fill="#65503d"/>
          <path d="M43 39h12v12H40" fill="none"/>
          {t === 'revolver' && <path d="M38 24h17v17H38z" fill="#5e6967"/>}
          {t === 'flare' && <path d="M46 23h32v18H46z" fill="#ae7440"/>}
          {electric && <path d="M55 29h17v4H55z" fill={light} stroke="none"/>}
        </g>}
        {(t === 'bow' || t === 'crossbow') && <g transform="rotate(-26 48 40)">
          <path d="M44 15h7v52h-7z" fill="#70553b"/>
          <path d="M20 24l8-10 19-4 21 4 9 10-10 5-20-8-19 8z" fill="#85938c"/>
          <path d="M22 25l25 25 28-25" fill="none" stroke="#d0c4a1" strokeWidth="1"/>
          {t === 'crossbow' && <path d="M39 44h19v9H46l-3 13h-8z" fill="#5b4936"/>}
          <path d="M48 8v36" stroke="#d0c4a1" strokeWidth="1"/>
        </g>}
        {(t === 'knife' || t === 'blade' || t === 'katana') && <g transform="rotate(35 48 40)">
          <path d={t === 'knife' ? 'M44 15l10-8v38H44z' : 'M45 8l9-3v42H43z'} fill={metal}/>
          <path d="M45 47h7v22h-7z" fill="#51463c"/><path d="M37 45h23v5H37z" fill="#b28751"/>
          {t === 'katana' && <><path d="M45 9h3v34h-3z" fill="#8be1de" stroke="none"/><path d="M54 55h14v13H54z" fill="#4c5d54"/><path d="M58 57h6v8h-6z" fill="#65c9cf" stroke="none"/><path d="M52 49h9v6" fill="none" stroke="#b58a4b"/></>}
        </g>}
        {(t === 'bat' || t === 'crowbar' || t === 'hammer') && <g transform="rotate(31 48 40)">
          <path d="M44 19h9v50h-9z" fill={t === 'crowbar' ? '#7d8783' : '#72583b'}/>
          {t === 'hammer' ? <path d="M24 12h48v19H24z" fill="#6a7775"/> : t === 'crowbar' ? <path d="M44 20V9h16v8h-7v8" fill="#7d8783"/> : <path d="M41 10h15v35H41z" fill="#8a6a43"/>}
          {electric && <path d="M43 13h6v20h-6z" fill={light} stroke="none"/>}
        </g>}
        {t === 'knuckles' && <><path d="M18 28h60v25H18zM25 52h14v10H25zM57 52h14v10H57z" fill="#a19c84"/>{[24,38,52,66].map(x => <path key={x} d={`M${x} 34h8v12h-8z`} fill="#111714"/>)}</>}
        {t === 'flame' && <g transform="rotate(-16 48 40)">
          <path d="M14 20h14v43H14zM30 20h14v43H30z" fill="#7d8151"/><path d="M14 25h30v8H14zM14 52h30v6H14z" fill="#384641"/>
          <path d="M46 32h25v12H46zM65 33h21v7H65zM48 43h9v17h-9z" fill="#9a9480"/>
          <path d="M20 62h29V43" fill="none" stroke="#4e5e51" strokeWidth="4"/>
          <path d="M84 32l6-8 3 12-4 9-6-4z" fill="#e5a352"/><path d="M86 35h4v5h-4z" fill="#f0d69a" stroke="none"/>
        </g>}
        {t === 'grenade' && <><path d="M37 14h22v11H37z" fill="#827e61"/><path d="M28 27h40l8 11v23L64 69H32L20 59V38z" fill="#637359"/><path d="M31 38h34M31 48h34M38 29v31M55 29v31" fill="none" stroke="#374536"/><path d="M59 15h14v18" fill="none" stroke="#b0a27b"/></>}
        {t === 'shield' && <><path d="M23 13l25-6 25 6v35L63 62 48 73 33 62 23 48z" fill="#7f765c"/><path d="M29 18l19-5 19 5v28L58 58 48 65 38 58 29 46z" fill="#3d443e"/><path d="M44 18h8v40h-8z" fill="#af8853"/><path d="M37 33h22v14H37z" fill="#857d60"/></>}
      </g>
    </svg>;
  }
  function StatRow({ label, value, unit, tone='normal' }) {
    const missing = isMissing(value);
    return <div className={'wc-stat wc-tone-' + (missing ? 'missing' : tone)}><dt>{label}</dt><dd>{W.format(value, unit)}</dd></div>;
  }
  // Rows with a value show normally; every undefined row folds into one "Not defined" line.
  function Rows({ rows }) {
    const shown = rows.filter(x => !isMissing(x[1])), missing = rows.filter(x => isMissing(x[1])).map(x => x[0]);
    return <>{shown.map(([label, value, unit, tone]) => <StatRow key={label} label={label} value={value} unit={unit} tone={tone}/>)}
      {missing.length > 0 && <div className="wc-stat wc-tone-missing wc-unset"><dt>Not defined</dt><dd>{missing.join(' · ')}</dd></div>}</>;
  }
  // Base stats depend on the slot: melee weapons have no fire mode, magazine or reload.
  function baseRows(r) {
    if (r.slot === 'melee') return [['DPS', null], ['Attacks / second', null]];
    if (r.slot === 'primary' || r.slot === 'secondary') return [['DPS', null], ['Fire mode', r.fireMode], ['Magazine capacity', r.magazine], ['Reload time', null]];
    if (r.slot === 'throwable') return [['Recovery chance', r.recovery, '%']];
    return [];
  }
  function Card({ record:r, records }) {
    const set = records.find(s => s.id === r.setId);
    const pieces = (r.pieces || []).map(id => records.find(w => w.id === id)).filter(Boolean);
    const base = baseRows(r);
    const attrsSet = r.attributes && r.attributes.some(a => !isMissing(a.value));
    return <article className={'wc-card wc-theme-' + themeFor(r) + ' wc-rarity-' + (r.rarity || 'undefined')} data-proposed-frame={r.id}>
      <div className="wc-proposed-stamp">PROPOSED FRAME · RECIPE NOT APPROVED{r.launch && <span className="wc-launch-tag">LAUNCH AXE</span>}{r.parked && <span className="wc-parked-tag">PARKED POOL</span>}</div>
      <div className="wc-card-trim" aria-hidden="true"/>
      <header className="wc-card-header">
        <div className="wc-heading-copy"><div className="wc-eyebrow">{r.status}</div><h2 tabIndex="-1" id="wc-detail-title">{r.name}</h2>{r.epithet && <p className="wc-epithet">“{r.epithet}”</p>}<div className="wc-classification">{rarityNames[r.rarity] || 'Rarity · Not defined'} · {r.family}</div></div>
        <div className={'wc-icon-frame' + (pieces.length && !r.sprite ? ' wc-icon-pair' : '')}>{pieces.length && !r.sprite ? pieces.map(p => <WeaponArt key={p.id} record={p}/>) : <WeaponArt record={r}/>}</div>
      </header>
      <div className="wc-card-content">
        {r.roster === 'sets' ? <section className="wc-set-pieces" aria-label="Set pieces"><div className="wc-eyebrow">Two-piece set · {r.setType}</div>{pieces.map(p => <a key={p.id} href={W.href(p.id)}><WeaponArt record={p} compact/><span>{p.name}<small>{p.epithet}</small></span><span aria-hidden="true">↗</span></a>)}</section> : <section className="wc-base-block" aria-label="Base weapon stats">
          <div className="wc-damage"><span>BASE DAMAGE</span><strong className={isMissing(r.baseDamage) ? 'wc-undefined-damage' : ''}>{W.format(r.baseDamage)}</strong></div>
          {base.length > 0 && <dl className="wc-branches"><Rows rows={base}/></dl>}
        </section>}
        <dl className="wc-properties"><Rows rows={[['Slot', r.roster === 'sets' ? r.setType : slotName(r.slot)], ['Weight', r.weight, 'kg'], ...(r.slot === 'throwable' || r.roster === 'sets' ? [] : [['Hands', r.hands]]), ['Construction tier', r.constructionTier], ...(r.roster === 'workshop' ? [['Biome', r.biome], ['Materials', r.materials]] : []), ...(r.durability != null ? [['Prototype durability', r.durability]] : [])]}/></dl>
        {r.bonuses.length > 0 && <section className="wc-section"><h3>Recorded bonuses</h3><dl>{r.bonuses.map(b => <StatRow key={b.label} {...b}/>)}</dl></section>}
        {r.affixes && r.affixes.length > 0 && <section className="wc-section"><h3>Proposed bonus themes</h3><div className="wc-chips">{r.affixes.map(a => <span key={a} className="wc-chip">{a}</span>)}</div><p className="wc-small-note">Bonus values are not defined yet.</p></section>}
        {r.attributes && (attrsSet
          ? <section className="wc-section wc-attributes"><h3>S.U.R.V.I.V.A.L. attributes</h3><dl><Rows rows={r.attributes.map(a => [a.label, a.value, a.unit, a.tone])}/></dl></section>
          : <section className="wc-section wc-attributes"><h3>S.U.R.V.I.V.A.L. attributes</h3><p className="wc-small-note">Not assigned yet.</p></section>)}
        <section className="wc-description"><h3>{r.roster === 'live' ? 'Recorded description' : 'Design identity'}</h3><p>{r.description || W.MISSING}</p>{r.roster === 'live' && <p className="wc-small-note">Description effects may require supporting mechanics. Recorded damage is not a DPS estimate.</p>}</section>
        {r.signature && <section className={'wc-signature' + (r.rarity === 'relic' ? ' wc-relic-signature' : '')}><h3>{r.roster === 'sets' ? 'Proposed pair effect' : r.rarity === 'relic' ? 'Inherited signature · proposed' : 'Exclusive mechanic · proposed'}</h3><p>{r.signature}</p></section>}
        {set && <a className="wc-set-link" href={W.href(set.id)}><span>◈ {set.name}<small>{set.setType} · inspect the pair bonus</small></span><span aria-hidden="true">↗</span></a>}
        {r.baseId && <a className="wc-set-link" href={W.href(r.baseId)}>Inspect the base Legendary <span aria-hidden="true">↗</span></a>}
        <footer className="wc-card-footer">{!isMissing(r.sockets) && <div className="wc-socket-line"><span className="wc-socket" aria-hidden="true">◇</span><span>Sockets</span><strong>{W.format(r.sockets)}</strong></div>}<dl><Rows rows={[...(isMissing(r.sockets) ? [['Sockets', null]] : []), ['Requirement', r.requirement]]}/></dl><div className="wc-record-id">{r.id}</div></footer>
      </div>
    </article>;
  }

  window.ProposedRecipeFrames = function ProposedRecipeFrames() {
    const records = React.useMemo(() => W.getRecords(), []);
    const [route, setRoute] = React.useState(W.readRoute);
    const [search, setSearch] = React.useState('');
    const [roster, setRoster] = React.useState('all');
    const [slot, setSlot] = React.useState('all');
    const [rarity, setRarity] = React.useState('all');
    const detailRef = React.useRef(null);
    React.useEffect(() => { const update = () => setRoute(W.readRoute()); window.addEventListener('hashchange', update); return () => window.removeEventListener('hashchange', update); }, []);
    const selected = records.find(r => r.id === route.id);
    React.useEffect(() => { if (detailRef.current) { detailRef.current.scrollTop = 0; const h = detailRef.current.querySelector('#wc-detail-title'); if (h) h.focus({ preventScroll:true }); } }, [route.id]);
    const query = search.trim().toLowerCase();
    const inRoster = (r, id) => id === 'all' || (id === 'launch' ? !!r.launch : r.roster === id);
    const shown = records.filter(r => inRoster(r, roster) && (slot === 'all' || r.slot === slot) && (rarity === 'all' || (r.rarity || 'undefined') === rarity)
      && (!query || [r.name,r.epithet,r.maker,r.family,r.id,r.subfamily,r.sectionTitle,r.status].filter(Boolean).join(' ').toLowerCase().includes(query)));
    const clear = () => { setSearch(''); setRoster('all'); setSlot('all'); setRarity('all'); };
    const linkTo = id => records.find(r => r.id === id);
    const highlights = ['unique-night-current','crossbow','flamethrower','wf-hedge-reaper'].map(linkTo).filter(Boolean);
    const uniqueIds = ['AXE-151','AXE-152','AXE-153','AXE-201','AXE-251','AXE-258'];
    function Preview({ record:r }) { return <a href={W.href(r.id)} className={'wc-preview wc-theme-' + themeFor(r) + ' wc-rarity-' + (r.rarity || 'undefined')}><WeaponArt record={r}/><div><span className="wc-eyebrow">{r.status}</span><strong>{r.name}</strong><small>{r.epithet || r.family}</small></div><span className="wc-preview-arrow" aria-hidden="true">↗</span></a>; }
    return <div className="wc-screen" data-proposed-crafting-frames>
      <header className="wc-page-header"><div><div className="wc-eyebrow">CRAFTING / PROPOSAL REVIEW</div><h1><a href={W.href()}>Proposed frame cards</a>{selected && <><span className="wc-breadcrumb"> / </span><span className="wc-current-name">{selected.name}</span></>}</h1></div><span className="wc-total">{records.length} proposed frames <span>{rosters.slice(2).map(([id, label]) => `${records.filter(r => r.roster === id).length} ${({live:'in game',axes:'regular axes',uniques:'Uniques',sets:'sets',ranged:'ranged concepts',workshop:'workshop',relics:'Relics',legacy:'legacy'})[id] || label}`).join(' · ')}</span></span></header>
      <div className="wc-layout">
        <aside className="wc-sidebar" aria-label="Proposed recipe frame cards">
          <div className="wc-search"><label htmlFor="wc-search-input">Find a proposed frame</label><input id="wc-search-input" type="search" placeholder="Name, family, maker or ID…" value={search} onChange={e => setSearch(e.target.value)}/></div>
          <nav className="wc-rosters" aria-label="Weapon rosters">{rosters.map(([id,label]) => <button key={id} onClick={() => setRoster(id)} aria-pressed={roster === id}>{label}<span>{records.filter(r => inRoster(r, id)).length}</span></button>)}</nav>
          <div className="wc-filters"><label>Slot<select value={slot} onChange={e => setSlot(e.target.value)}><option value="all">All slots</option>{['primary','secondary','melee','throwable','offhand'].map(s => <option key={s} value={s}>{slotName(s)}</option>)}</select></label><label>Rarity<select value={rarity} onChange={e => setRarity(e.target.value)}><option value="all">All rarities</option>{Object.entries(rarityNames).map(([id,label]) => <option key={id} value={id}>{label}</option>)}<option value="undefined">Not defined</option></select></label></div>
          <div className="wc-list-heading"><h2>Frame proposals</h2><span role="status">{shown.length} shown</span></div>
          <div className="wc-list">{shown.map(r => <a key={r.id} href={W.href(r.id)} aria-current={route.id === r.id ? 'page' : undefined} className={'wc-list-row wc-rarity-' + (r.rarity || 'undefined')}><WeaponArt record={r} compact/><span className="wc-list-copy"><strong>{r.name}</strong><small>{r.epithet || r.family}</small><span>{r.id} · {r.status}</span></span>{r.launch && <span className="wc-launch-dot" title="Launch axe">L</span>}<span className="wc-list-chevron" aria-hidden="true">›</span></a>)}{shown.length === 0 && <div className="wc-empty"><p>No matching frame cards.</p><button onClick={clear}>Clear filters</button></div>}</div>
          <div className="wc-list-footer">All frame cards are proposed. Select one to preview.</div>
        </aside>
        <main className="wc-detail" ref={detailRef} aria-label="Proposed crafting frame preview">
          {selected ? <div className="wc-detail-grid"><Card record={selected} records={records}/><aside className="wc-record-notes">
            <a href={W.href()} className="wc-back">← All proposed frame cards</a>
            <section><h3>Record</h3><dl><StatRow label="Status" value={selected.status}/><StatRow label="Record ID" value={selected.id}/>{selected.maker && <StatRow label="Maker" value={selected.maker}/>}</dl>{selected.sectionTitle && <p>{selected.sectionTitle}</p>}{selected.subfamily && <p>{selected.subfamily}</p>}</section>
            {(selected.role || selected.tradeoff) && <section><h3>Proposed role</h3><p>{selected.role}</p>{selected.tradeoff && <><h4>Tradeoff</h4><p>{selected.tradeoff}</p></>}</section>}
            {selected.acquisition && <section><h3>Acquisition concept</h3><p>{selected.acquisition}</p></section>}
            {selected.origin && <section><h3>Historical inspiration</h3><p>{selected.origin.archetype}</p><p>{selected.origin.culture}<br/>{selected.origin.era}</p><p>{selected.origin.site}, {selected.origin.country}</p><p className="wc-small-note">Historical anchor only. The weapon’s name, design variation and mechanics are fictional concepts.</p>{/^https:\/\//.test(selected.origin.source || '') && <a href={selected.origin.source} target="_blank" rel="noreferrer">Historical source ↗</a>}</section>}
            {selected.origin2 && <section><h3>Imported art</h3><p>{selected.origin2.pack}</p><p>{selected.origin2.author} · {selected.origin2.license}</p><p className="wc-small-note">Converted to the game palette and pixel grid. Listed in art/weapons/CREDITS.md.</p></section>}
            <section><h3>Source record</h3><p>{selected.sourceLabel}</p><p className="wc-source-id">{selected.sourceId}</p><a href={selected.source} target="_blank" rel="noreferrer">Open source file ↗</a></section>
            <section className="wc-data-note"><h3>Undefined values</h3><p>“Not defined” means the source has no approved value. It does not mean zero.</p>{selected.roster !== 'live' && <p>This is a reference concept. It does not grant or equip an item.</p>}</section>
          </aside></div> : route.id || route.invalid ? <div className="wc-empty wc-not-found"><h2>Frame proposal not found</h2><p>This link does not match a proposed card in this review.</p><a href={W.href()}>Return to proposed frame cards</a></div> : <div className="wc-overview">
            <div className="wc-overview-heading"><div className="wc-eyebrow">PROPOSED RECIPE FRAME CARDS</div><h2>Frame design proposals.</h2><p>Review the card frames for equipment, axe designs, Uniques, Relics and paired sets. These previews do not approve a recipe or its balance.</p><span className="wc-reference-label">All frames proposed · Existing source values shown for reference · Missing metrics remain “Not defined”</span></div>
            <div className="wc-featured-grid">{highlights.map(r => <Preview key={r.id} record={r}/>)}</div>
            <section className="wc-overview-section"><h3>Danielle &amp; Raquelle</h3><p>Two distinct axes. One proposed finishing sequence.</p><div className="wc-pair-banner">{['unique-danielle','unique-raquelle'].map(id => <Preview key={id} record={linkTo(id)}/>)}<a className="wc-pair-bonus" href={W.href('set-duet-of-iron')}><span>◈ TWO-PIECE SET</span><strong>Duet of Iron</strong><small>Inspect the pieces and proposed pair effect →</small></a></div></section>
            <section className="wc-overview-section" data-launch-axes><h3>Launch axes · 20</h3><p>Ship first: 4 stone, 6 copper, 2 throwing and the 8 Uniques. The other 88 axe concepts stay parked.</p><div className="wc-unique-grid">{[...W.LAUNCH_AXES].filter(id => !uniqueIds.includes(id) && !id.startsWith('unique-')).map(id => linkTo(id)).filter(Boolean).map(r => <Preview key={r.id} record={r}/>)}</div></section>
            <section className="wc-overview-section"><h3>The six named axe Uniques</h3><div className="wc-unique-grid">{uniqueIds.map(id => <Preview key={id} record={linkTo(id)}/>)}</div></section>
            <section className="wc-overview-section"><h3>Set concepts</h3><div className="wc-set-overview">{records.filter(r => r.roster === 'sets').map(r => <a key={r.id} href={W.href(r.id)}><span>◈ {r.setType}</span><strong>{r.name}</strong><small>{r.pieces.map(id => linkTo(id).name).join(' + ')}</small></a>)}</div></section>
          </div>}
        </main>
      </div>
    </div>;
  };
  window.CraftingWorkspace = function CraftingWorkspace({ children }) {
    const [proposed, setProposed] = React.useState(() => W.readRoute().active);
    React.useEffect(() => {
      const sync = () => setProposed(W.readRoute().active);
      window.addEventListener('hashchange', sync);
      return () => window.removeEventListener('hashchange', sync);
    }, []);
    const open = show => { setProposed(show); window.location.hash = show ? W.href() : '#crafting'; };
    return <div className="crafting-workspace" data-crafting-workspace>
      <nav className="crafting-frame-tabs" aria-label="Crafting sections">
        <span>CRAFTING</span>
        <button onClick={() => open(false)} aria-pressed={!proposed}>Recipes</button>
        <button onClick={() => open(true)} aria-pressed={proposed}>Proposed frame cards <small>PROPOSED</small></button>
      </nav>
      <div className="crafting-workspace-content">{proposed ? <window.ProposedRecipeFrames/> : children}</div>
    </div>;
  };
})();
