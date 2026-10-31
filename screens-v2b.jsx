
// Zombie Idler v2 — Enhanced Screens Part 2
// Marketplace v2, Schedule v2, Camp Overview v2

// ─── MARKETPLACE V2 ──────────────────────────────────────────────────────────
function MarketplaceScreenV2() {
  const ZI = window.ZI;
  const ZI_ART = window.ZI_ART;
  const [selectedItem, setSelectedItem] = React.useState(null);
  const [bidAmount, setBidAmount] = React.useState('');
  const [boostItem, setBoostItem] = React.useState(null);
  const [tab, setTab] = React.useState('browse');
  const [filter, setFilter] = React.useState('All');
  const [pendingSeller, setPendingSeller] = React.useState(null); // seller review modal

  const auctionItems = [
    { id:'a1', name:'Sunder Pulse Axe',     type:'Legendary', tier:4, current:3200, bids:12, timeLeft:'2h 14m', seller:'IronDefender_77', color:'var(--amber)',  stats:{ damage:88, scaling:'Valor: A', durability:95, weight:'4.2kg', perk:'Killing blow +25% attack speed' }, img: ZI_ART?.contracts?.combat?.() },
    { id:'a2', name:'RMAT-4 Anomalous ×3',  type:'RMAT',      tier:4, current:5400, bids:8,  timeLeft:'45m',    seller:'Concordance_Trader',color:'var(--purple)',stats:{ quantity:3, purity:'94%', stability:'Moderate', biome:'Perimeter' }, img:null },
    { id:'a3', name:'Blueprint: Anomaly Forge',type:'Blueprint',tier:5,current:8900, bids:21, timeLeft:'6h 30m', seller:'ShadowBroker_K',   color:'var(--purple)',stats:{ unlocks:'Anomaly Forge T5', requires:'RMAT-4 ×10 + Concordance Allied' }, img:null },
    { id:'a4', name:'Temporal Plate (Exotic)',type:'Exotic',   tier:5, current:14200,bids:5,  timeLeft:'1h 02m', seller:'Dustwalker_Pro',   color:'var(--purple)',stats:{ armor:120, traits:'Encounter freq -30%', hazardResist:'100%', weight:'7.8kg' }, img:null },
  ];

  const browseItems = ZI.MARKET_ITEMS;
  const filtered = filter==='All' ? browseItems : browseItems.filter(i=>i.type===filter);
  const types = ['All','RMAT','Weapon','Armor','Blueprint','Legendary','Consumable'];

  const activeItem = selectedItem ? (auctionItems.find(i=>i.id===selectedItem) || browseItems.find(i=>i.id===selectedItem)) : null;

  // Boost items player has
  const boostItems = [
    { id:'b1', name:'RMAT-2 Mech Shard', bidBoost: 200, color:'var(--blue)' },
    { id:'b2', name:'Rare Ammo Cache',   bidBoost: 350, color:'var(--amber)' },
    { id:'b3', name:'Faction Token',     bidBoost: 500, color:'var(--purple)' },
  ];

  const totalBid = parseInt(bidAmount||'0') + (boostItem ? boostItems.find(b=>b.id===boostItem)?.bidBoost||0 : 0);

  return (
    <div className="screen-enter" style={{ display:'flex', flexDirection:'column', gap:0, height:'100%', overflow:'hidden' }}>
      {/* Header */}
      <div style={{ display:'flex', gap:10, padding:'7px 10px', background:'var(--bg3)', borderBottom:'1px solid var(--border)', flexShrink:0, alignItems:'center' }}>
        <div style={{ fontFamily:'var(--font-title)', fontSize:18, color:'var(--amber)' }}>Global Marketplace</div>
        <div style={{ flex:1 }}/>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', padding:'3px 8px', background:'var(--bg2)', border:'1px solid var(--border)' }}>
          🟢 Live · 52 players online
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--purple)', padding:'3px 8px', background:'rgba(168,85,247,0.1)', border:'1px solid rgba(168,85,247,0.3)' }}>
          ⚠ RMAT Storm active · RMAT +40%
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:12, color:'var(--amber)', padding:'3px 10px', background:'var(--bg2)', border:'1px solid var(--border)' }}>
          4,820 ₵
        </div>
      </div>

      {/* 3-column layout */}
      <div style={{ flex:1, display:'flex', gap:0, overflow:'hidden' }}>

        {/* LEFT 1/3: Browse / Auction listings */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', borderRight:'1px solid var(--border)', overflow:'hidden' }}>
          <div className="tab-nav">
            {[['browse','Browse'],['auction','Auction'],['sell','Sell'],['history','History']].map(([id,label])=>(
              <button key={id} className={`tab-btn${tab===id?' active':''}`} onClick={()=>setTab(id)}>{label}</button>
            ))}
          </div>

          {tab==='browse' && (
            <>
              <div style={{ padding:'5px 8px', background:'var(--bg3)', borderBottom:'1px solid var(--border)', display:'flex', gap:4, flexWrap:'wrap' }}>
                {types.map(t=>(
                  <button key={t} onClick={()=>setFilter(t)} style={{
                    fontFamily:'var(--font-mono)', fontSize:8, padding:'2px 6px',
                    border:`1px solid ${filter===t?'var(--amber)':'var(--border)'}`,
                    background:filter===t?'rgba(200,169,110,0.12)':'var(--bg4)',
                    color:filter===t?'var(--amber)':'var(--text3)', cursor:'pointer',
                  }}>{t}</button>
                ))}
              </div>
              <div style={{ flex:1, overflow:'auto' }}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr auto auto auto auto', padding:'4px 10px', background:'var(--bg3)', borderBottom:'1px solid var(--border)', gap:8 }}>
                  {['Item','Type','Tier','Price','Action'].map(h=>(
                    <span key={h} style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)' }}>{h}</span>
                  ))}
                </div>
                {filtered.map(item=>(
                  <div key={item.id}
                    onClick={()=>setSelectedItem(item.id===selectedItem?null:item.id)}
                    style={{
                      display:'grid', gridTemplateColumns:'1fr auto auto auto auto',
                      padding:'7px 10px', borderBottom:'1px solid var(--border)',
                      gap:8, alignItems:'center', cursor:'pointer',
                      background:selectedItem===item.id?'var(--bg4)':'transparent',
                      transition:'background 0.1s',
                    }}
                    onMouseEnter={e=>e.currentTarget.style.background='var(--bg4)'}
                    onMouseLeave={e=>e.currentTarget.style.background=selectedItem===item.id?'var(--bg4)':'transparent'}
                  >
                    <span style={{ fontFamily:'var(--font-body)', fontSize:12, color:'var(--text)' }}>{item.name}</span>
                    <Tag color="var(--text3)">{item.type}</Tag>
                    <Tag color={ZI.RMAT_TIERS[item.tier]?.color||'var(--text2)'}>{`T${item.tier}`}</Tag>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--amber)' }}>{item.basePrice}₵</span>
                    <button className="btn btn-sm btn-amber" onClick={e=>{e.stopPropagation(); setSelectedItem(item.id);}}>Buy</button>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab==='auction' && (
            <div style={{ flex:1, overflow:'auto', padding:8, display:'flex', flexDirection:'column', gap:6 }}>
              {auctionItems.map(item=>(
                <div key={item.id}
                  onClick={()=>setSelectedItem(item.id===selectedItem?null:item.id)}
                  style={{
                    padding:'10px 12px', cursor:'pointer',
                    border:`1px solid ${selectedItem===item.id?item.color:'var(--border)'}`,
                    background:selectedItem===item.id?'var(--bg4)':'var(--bg3)',
                    transition:'all 0.15s',
                  }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
                    <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                      <span style={{ fontFamily:'var(--font-body)', fontSize:14, color:item.color, fontWeight:500 }}>{item.name}</span>
                      <Tag color={item.color}>{`T${item.tier}`}</Tag>
                    </div>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:14, color:'var(--amber)', fontWeight:'bold' }}>{item.current.toLocaleString()}₵</span>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>{item.bids} bids · {item.seller}</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--amber)' }}>⏱ {item.timeLeft}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {(tab==='sell'||tab==='history') && (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text3)' }}>
                {tab==='sell'?'Drag items from inventory to list.':'No trade history yet.'}
              </div>
            </div>
          )}
        </div>

        {/* MIDDLE 1/3: Item art + world events */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', borderRight:'1px solid var(--border)', overflow:'hidden' }}>
          {activeItem ? (
            <ItemDetailPanel item={activeItem} onBack={()=>setSelectedItem(null)} isAuction={!!auctionItems.find(a=>a.id===activeItem?.id)}/>
          ) : (
            <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
              {/* Featured item art area */}
              <div style={{
                flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                padding:16, borderBottom:'1px solid var(--border)',
                background:'radial-gradient(ellipse at center, rgba(200,169,110,0.05), transparent)',
              }}>
                <div style={{ fontFamily:'var(--font-title)', fontSize:13, color:'var(--text3)', marginBottom:12, letterSpacing:'0.2em' }}>
                  FEATURED AUCTION
                </div>
                {/* Blueprint art for featured item */}
                <div style={{ marginBottom:12 }} dangerouslySetInnerHTML={{ __html: ZI_ART?.blueprints?.rifle?.() || '' }}/>
                <div style={{ fontFamily:'var(--font-body)', fontSize:14, color:'var(--amber)', textAlign:'center' }}>
                  Hunting Rifle WM
                </div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginTop:4 }}>
                  T3 Weapon · Reflex: A · Insight: B
                </div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--amber)', marginTop:8 }}>
                  380₵ · 12 in stock
                </div>
              </div>
              {/* Market events */}
              <div style={{ padding:10, overflow:'auto' }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:6 }}>ACTIVE MARKET EVENTS</div>
                {ZI.WORLD_EVENTS.map(e=>(
                  <div key={e.id} style={{
                    padding:'6px 8px', marginBottom:4,
                    background:e.active?`${e.color}18`:'var(--bg3)',
                    border:`1px solid ${e.active?e.color:'var(--border)'}`,
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:2 }}>
                      {e.active&&<div className="notif-dot"/>}
                      <span style={{ fontFamily:'var(--font-body)', fontSize:11, color:e.active?e.color:'var(--text2)' }}>{e.name}</span>
                      <Tag color={e.active?e.color:'var(--text3)'}>{e.duration}h</Tag>
                    </div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', lineHeight:1.5 }}>{e.effect}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT 1/3: Enhanced bidding */}
        <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div className="panel-title">Enhanced Bidding</div>
          <div style={{ flex:1, overflow:'auto', padding:10 }}>
            {tab==='auction' && activeItem && auctionItems.find(a=>a.id===activeItem.id) ? (
              <>
                {/* Current auction */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ fontFamily:'var(--font-body)', fontSize:14, color:'var(--amber)', marginBottom:4 }}>{activeItem.name}</div>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)' }}>Current highest</span>
                    <span style={{ fontFamily:'var(--font-mono)', fontSize:14, color:'var(--amber)', fontWeight:'bold' }}>
                      {auctionItems.find(a=>a.id===activeItem.id)?.current.toLocaleString()}₵
                    </span>
                  </div>
                </div>

                {/* Bid input */}
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:5 }}>YOUR BID</div>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={e=>setBidAmount(e.target.value)}
                    placeholder="Enter amount..."
                    style={{
                      width:'100%', padding:'7px 10px',
                      background:'var(--bg4)', border:'1px solid var(--border)',
                      color:'var(--amber)', fontFamily:'var(--font-mono)', fontSize:13,
                      outline:'none',
                    }}
                  />
                </div>

                {/* Boost items */}
                <div style={{ marginBottom:10 }}>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:5 }}>
                    BID BOOST ITEMS <span style={{ fontStyle:'italic', fontSize:8 }}>· use rare items to strengthen bid</span>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
                    {boostItems.map(b=>(
                      <div key={b.id}
                        onClick={()=>setBoostItem(boostItem===b.id?null:b.id)}
                        style={{
                          display:'flex', justifyContent:'space-between', alignItems:'center',
                          padding:'6px 8px', cursor:'pointer',
                          border:`1px solid ${boostItem===b.id?b.color:'var(--border)'}`,
                          background:boostItem===b.id?`${b.color.replace('var(--','').replace(')','')}`:'var(--bg3)',
                          transition:'all 0.15s',
                        }}>
                        <span style={{ fontFamily:'var(--font-body)', fontSize:11, color:'var(--text)' }}>{b.name}</span>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:b.color }}>+{b.bidBoost}₵</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div style={{
                  padding:'8px 10px', background:'var(--bg4)', border:'1px solid var(--border)',
                  marginBottom:10, display:'flex', justifyContent:'space-between',
                }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)' }}>Total bid</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:14, color:'var(--amber)', fontWeight:'bold' }}>
                    {totalBid.toLocaleString()}₵
                  </span>
                </div>

                <button className="btn btn-amber" style={{ width:'100%', marginBottom:6 }}
                  onClick={()=>{ window.ZI.emitAction && window.ZI.emitAction('transaction', 1 + (totalBid||0)/500); setPendingSeller({ item:activeItem, bid:totalBid }); }}>
                  Submit Bid →
                </button>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', lineHeight:1.5, textAlign:'center' }}>
                  Seller must accept before transaction completes.
                </div>
              </>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:4 }}>QUICK BUY</div>
                {activeItem && !auctionItems.find(a=>a.id===activeItem.id) && (
                  <>
                    <div style={{ padding:'8px 10px', background:'var(--bg4)', border:'1px solid var(--border)' }}>
                      <div style={{ fontFamily:'var(--font-body)', fontSize:14, color:'var(--amber)' }}>{activeItem.name}</div>
                      <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', marginTop:2 }}>
                        {activeItem.basePrice}₵ per unit
                      </div>
                    </div>
                    <button className="btn btn-amber" style={{ width:'100%' }} onClick={()=>{ window.ZI.emitAction && window.ZI.emitAction('transaction', 1.5); }}>Buy Now</button>
                    <button className="btn" style={{ width:'100%' }}>Add to Watchlist</button>
                  </>
                )}
                {!activeItem && (
                  <div style={{ textAlign:'center', padding:20 }}>
                    <div style={{ fontFamily:'var(--font-title)', fontSize:13, color:'var(--text3)', marginBottom:6 }}>No Item Selected</div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>Select a listing or auction item to bid.</div>
                  </div>
                )}
              </div>
            )}

            {/* Seller review prompt (modal) */}
            {pendingSeller && (
              <div style={{
                position:'fixed', inset:0, background:'rgba(15,14,12,0.85)',
                display:'flex', alignItems:'center', justifyContent:'center', zIndex:200,
              }}>
                <div style={{
                  width:380, background:'var(--bg2)', border:'1px solid var(--amber)',
                  padding:20,
                }}>
                  <div style={{ fontFamily:'var(--font-title)', fontSize:18, color:'var(--amber)', marginBottom:4 }}>Seller Review Required</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text2)', marginBottom:12, lineHeight:1.6 }}>
                    Your bid of <span style={{ color:'var(--amber)' }}>{pendingSeller.bid.toLocaleString()}₵</span> on <b>{pendingSeller.item?.name}</b> has been submitted to the seller. They must accept before the transaction completes.
                  </div>
                  <div style={{ padding:'8px 10px', background:'var(--bg4)', borderLeft:'3px solid var(--amber)', marginBottom:12, fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>
                    Marketplace rule: all transactions require seller confirmation. Rare items may attract counter-offers or decline.
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="btn btn-amber" style={{ flex:1 }} onClick={()=>setPendingSeller(null)}>Await Response</button>
                    <button className="btn btn-red" style={{ flex:1 }} onClick={()=>setPendingSeller(null)}>Withdraw Bid</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Item detail panel (spans > half screen via modal overlay)
function ItemDetailPanel({ item, onBack, isAuction }) {
  const ZI = window.ZI;
  const ZI_ART = window.ZI_ART;
  const rmatTier = ZI.RMAT_TIERS[item.tier] || ZI.RMAT_TIERS[1];

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
      <div style={{ padding:'8px 10px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8 }}>
        <button className="btn btn-sm" onClick={onBack}>← Back</button>
        <span style={{ fontFamily:'var(--font-title)', fontSize:14, color:'var(--amber)' }}>Item Details</span>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:12 }}>
        {/* Art area */}
        <div style={{
          marginBottom:12, padding:16, background:'var(--bg3)',
          border:`1px solid ${rmatTier.color}44`,
          display:'flex', alignItems:'center', justifyContent:'center', minHeight:120,
        }}>
          {item.img ? (
            <div dangerouslySetInnerHTML={{ __html: item.img }}/>
          ) : (
            <div dangerouslySetInnerHTML={{ __html: ZI_ART?.blueprints?.hazardSuit?.() || '' }}/>
          )}
        </div>

        {/* Name + tier */}
        <div style={{ fontFamily:'var(--font-title)', fontSize:20, color:rmatTier.color, marginBottom:4 }}>{item.name}</div>
        <div style={{ display:'flex', gap:6, marginBottom:12 }}>
          <Tag color={rmatTier.color}>T{item.tier}</Tag>
          <Tag color="var(--text3)">{item.type}</Tag>
          {isAuction && <Tag color="var(--green)">Auction</Tag>}
        </div>

        {/* Stats */}
        {item.stats && (
          <>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:6 }}>ITEM STATS</div>
            <div style={{ display:'flex', flexDirection:'column', gap:4, marginBottom:12 }}>
              {Object.entries(item.stats).map(([k,v])=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text3)' }}>{k.replace(/([A-Z])/g,' $1').replace(/^./,s=>s.toUpperCase())}</span>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text)' }}>{v}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Auction info */}
        {isAuction && (
          <div style={{ padding:'8px 10px', background:'var(--bg4)', border:'1px solid var(--border)' }}>
            <InfoRow label="Current bid" value={`${item.current?.toLocaleString()}₵`} color="var(--amber)"/>
            <InfoRow label="Total bids" value={item.bids} color="var(--text2)"/>
            <InfoRow label="Time remaining" value={item.timeLeft} color="var(--amber)"/>
            <InfoRow label="Seller" value={item.seller} color="var(--text2)"/>
          </div>
        )}
      </div>
    </div>
  );
}
Object.assign(window, { MarketplaceScreenV2, ItemDetailPanel });

// ─── MARKET SHOP (gated vendor sub-view) ─────────────────────────────────────
function ShopScreen() {
  const ZI = window.ZI;
  const [, force] = React.useState(0);
  const rerender = () => force(n => n + 1);
  const tierColor = (t) => ZI.tierColor(t);

  const catGroups = [
    { key:'blueprint', label:'Blueprints',         cats:['blueprint'] },
    { key:'capacity',  label:'Capacity',           cats:['capacity'] },
    { key:'station',   label:'Cooking stations',   cats:['station'] },
    { key:'gear',      label:'Gear & Consumables', cats:['gear','consumable'] },
    { key:'cosmetic',  label:'Cosmetics & QoL',    cats:['cosmetic','qol'] },
  ];
  const [collapsed, setCollapsed] = React.useState({});
  const items = ZI.SHOP_ITEMS || [];

  // Sort within a group: unlocked-affordable → unlocked → locked(nearest) → owned.
  const stateRank = { unlocked:0, locked:1, owned:2 };
  const sortItems = (arr) => arr.slice().sort((a, b) => {
    const sa = ZI.shopState(a), sb = ZI.shopState(b);
    if (stateRank[sa] !== stateRank[sb]) return stateRank[sa] - stateRank[sb];
    if (sa === 'locked') return ZI.shopGateFraction(b) - ZI.shopGateFraction(a); // nearest first
    return 0;
  });

  // Nearest unlock across all locked items.
  const locked = items.filter(e => ZI.shopState(e) === 'locked');
  const nearest = locked.slice().sort((a, b) => ZI.shopGateFraction(b) - ZI.shopGateFraction(a))[0];
  const nearestMsg = (() => {
    if (!nearest) return locked.length === 0 ? 'All stock unlocked.' : '';
    const p = ZI.shopProgress(nearest);
    if (p.distance) return `${nearest.name} — ${(p.distance.req - p.distance.cur).toLocaleString()} m to go`;
    if (p.lap) return `${nearest.name} — ${p.lap.req - p.lap.cur} lap(s) to go`;
    if (p.rmat) return `${nearest.name} — needs ${p.rmat.tier}${p.rmat.isTierReach ? ' tier' : ` ×${p.rmat.req}`}`;
    return nearest.name;
  })();

  // Oct 27: purchases are live. One path (ZI.shopPurchase) checks the gate and the RMAT wallet, then grants.
  const [notice, setNotice] = React.useState(null);
  React.useEffect(() => {
    const timer = setInterval(rerender, 5000);
    return () => clearInterval(timer);
  }, []);
  const buy = (entry) => {
    const r = ZI.shopPurchase(entry);
    setNotice({ id: entry.id, ok: r.ok, text: r.ok ? r.text : r.reason });
    rerender();
  };
  const [tradeNotice, setTradeNotice] = React.useState(null);
  const jesterVisit = ZI.jesterTradeVisit();
  const jesterOffers = ZI.jesterTradeOffers();
  const trade = (offer) => {
    const r = ZI.jesterTrade(offer.id);
    setTradeNotice({ id:offer.id, ok:r.ok, text:r.ok ? r.text : r.reason });
    rerender();
  };
  const wallet = ZI.getRmatHoldings();

  const ProgressLine = ({ c, label, color }) => (
    <div style={{ marginBottom:3 }}>
      <div style={{ display:'flex', justifyContent:'space-between', fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:2 }}>
        <span>{label}</span><span>{c.cur.toLocaleString?.() ?? c.cur} / {c.req.toLocaleString?.() ?? c.req}</span>
      </div>
      <div style={{ height:4, background:'var(--bg4)', borderRadius:2 }}>
        <div style={{ height:'100%', width:`${Math.min(100, (c.cur / c.req) * 100)}%`, background:color, borderRadius:2 }}/>
      </div>
    </div>
  );

  const Card = ({ entry }) => {
    const st = ZI.shopState(entry);
    const col = tierColor(entry.tier);
    const meta = ZI.TIER_META[entry.tier] || ZI.TIER_META.T0;
    const prog = ZI.shopProgress(entry);
    const lvl = ZI.shopLevel(entry.id);
    const maxLvl = entry.grant?.maxLevel || 1;
    return (
      <div style={{
        padding:'11px 12px', background:`linear-gradient(110deg, ${col}12, var(--bg3) 42%)`, border:`1px solid ${col}66`,
        borderLeft:`4px solid ${col}`, opacity: st === 'locked' ? 0.9 : 1,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
          <span style={{ fontSize:18, filter:'saturate(0.75)' }}>{entry.icon}</span>
          <span style={{ fontFamily:'var(--font-body)', fontSize:15, fontWeight:700, color:col, flex:1, textShadow:`0 0 8px ${col}55` }}>{entry.name}</span>
          <span className="tag" style={{ fontSize:10, color:col, borderColor:col, background:col+'22', letterSpacing:'0.05em' }}>{meta.label}</span>
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text2)', marginBottom:8, lineHeight:1.5 }}>{entry.desc}</div>
        {st === 'locked' && (
          <div style={{ marginBottom:6 }}>
            {prog.distance && <ProgressLine c={prog.distance} label="Wandering distance" color={col}/>}
            {prog.lap && <ProgressLine c={prog.lap} label="Lap milestone" color={col}/>}
            {prog.rmat && <ProgressLine c={{ cur:prog.rmat.cur, req:prog.rmat.req }} label={prog.rmat.isTierReach ? `Reach RMAT ${prog.rmat.tier}` : `RMAT ${prog.rmat.tier}`} color={col}/>}
          </div>
        )}
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          {st === 'owned' ? (
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--green)' }}>
              ✓ {entry.repeatable && entry.grant?.maxLevel ? `Lvl ${lvl}/${maxLvl}` : 'Owned'}
            </span>
          ) : st === 'unlocked' ? (
            <>
            <span data-shop-price={entry.id} style={{ fontFamily:'var(--font-mono)', fontSize:11, color: ZI.shopCanAfford(entry) ? col : 'var(--red2)' }}>
                {ZI.shopPriceText(entry)} {entry.repeatable && entry.grant?.maxLevel ? `· Lvl ${lvl}/${maxLvl}` : ''}
              </span>
              <button data-shop-buy={entry.id} onClick={() => buy(entry)} disabled={!ZI.shopCanAfford(entry)} title={ZI.shopCanAfford(entry) ? 'Buy with RMAT' : 'Not enough RMAT'} style={{
                marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:12, fontWeight:'bold', padding:'5px 14px',
                background: ZI.shopCanAfford(entry) ? 'var(--amber)' : 'var(--bg4)', border:'1px solid ' + (ZI.shopCanAfford(entry) ? 'var(--amber)' : 'var(--border)'),
                color: ZI.shopCanAfford(entry) ? '#000' : 'var(--text3)', cursor: ZI.shopCanAfford(entry) ? 'pointer' : 'not-allowed',
              }}>Buy</button>
            </>
          ) : (
            <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:col }}>🔒 Locked — meet the gate to unlock{ZI.shopPrice(entry) ? ` · price ${ZI.shopPriceText(entry)}` : ''}</span>
          )}
        </div>
        {notice && notice.id === entry.id && <div data-shop-notice={notice.ok ? 'ok' : 'fail'} style={{ marginTop:6, fontFamily:'var(--font-mono)', fontSize:9, color: notice.ok ? 'var(--green)' : 'var(--red2)' }}>{notice.ok ? '✓ ' : '✕ '}{notice.text}</div>}
      </div>
    );
  };

  return (
    <div className="screen-enter" style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      {/* Nearest-unlock header */}
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'7px 12px', background:'var(--bg3)', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--amber)' }}>◈ Next unlock:</span>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text2)' }}>{nearestMsg || '—'}</span>
        <span data-shop-wallet style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', display:'flex', gap:8, flexWrap:'wrap', justifyContent:'flex-end' }}>
          <span>Wandering {ZI.getLifetimeDistance().toLocaleString()} m · Lap {ZI.getLifetimeLap()}</span>
          <span>RMAT: {['T0','T1','T2','T3','T4','T5'].map(k => <span key={k} style={{ color:tierColor(k), marginLeft:5 }}>{k} {wallet[k] || 0}</span>)}</span>
        </span>
      </div>
      <div style={{ flex:1, overflow:'auto', padding:10, display:'flex', flexDirection:'column', gap:10 }}>
        {catGroups.map(group => {
          const groupItems = sortItems(items.filter(e => group.cats.includes(e.cat)));
          if (!groupItems.length) return null;
          const isCol = collapsed[group.key];
          return (
            <div key={group.key} className="panel" style={{ padding:0, flexShrink:0 }}>
              <div className="panel-title" onClick={() => setCollapsed(c => ({ ...c, [group.key]: !c[group.key] }))} style={{ cursor:'pointer', display:'flex', alignItems:'center' }}>
                <span>{isCol ? '▸' : '▾'} {group.label}</span>
                <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)' }}>{groupItems.length}</span>
              </div>
              {!isCol && (
                <div style={{ padding:8, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:6 }}>
                  {groupItems.map(e => <Card key={e.id} entry={e}/>)}
                </div>
              )}
            </div>
          );
        })}
        <div className="panel" data-jester-trades style={{ padding:0, flexShrink:0, borderColor:jesterVisit.present ? 'var(--purple)' : 'var(--border)' }}>
          <div className="panel-title" style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span>🎭 Mystic Jester · Bulk Requests</span>
            <span style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:9, color:jesterVisit.present ? 'var(--green)' : 'var(--text3)' }}>
              {jesterVisit.present ? `At the Shop · ${jesterVisit.daysRemaining} day${jesterVisit.daysRemaining === 1 ? '' : 's'} left` : `Away · returns in ${jesterVisit.daysRemaining} day${jesterVisit.daysRemaining === 1 ? '' : 's'}`}
            </span>
          </div>
          <div style={{ padding:8, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:6 }}>
            {jesterOffers.map(offer => {
              const item = ZI.getGearItem(offer.itemId), canTrade = jesterVisit.present && offer.lotsRemaining > 0 && offer.stashCount >= offer.qty;
              const rewardText = Object.entries(offer.reward).map(([tier, qty]) => `${qty} ${tier} RMAT`).join(' + ');
              return <div key={offer.id} style={{ padding:'9px 11px', background:'var(--bg3)', border:'1px solid var(--border)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                  <span style={{ fontSize:15 }}>{item?.icon || '◈'}</span>
                  <span style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--text)', flex:1 }}>{item?.name || offer.itemId}</span>
                  <span className="tag" style={{ color:'var(--purple)', borderColor:'var(--purple)', background:'rgba(168,85,247,0.12)' }}>Bulk</span>
                </div>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text2)', marginBottom:7, lineHeight:1.5 }}>
                  Wants {offer.qty} · You have {offer.stashCount} in Stockpile · Pays {rewardText}<br/>{offer.note}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:offer.lotsRemaining ? 'var(--text3)' : 'var(--green)' }}>
                    {offer.lotsRemaining ? `${offer.lotsRemaining} lot${offer.lotsRemaining === 1 ? '' : 's'} left this visit` : 'Order filled this visit'}
                  </span>
                  <button onClick={() => trade(offer)} disabled={!canTrade} title={!jesterVisit.present ? 'The Jester is away from the Shop' : (offer.stashCount < offer.qty ? `Need ${offer.qty} in Stockpile` : 'Trade one bulk lot')} style={{ marginLeft:'auto', fontFamily:'var(--font-mono)', fontSize:10, padding:'3px 12px', background:canTrade ? 'var(--purple)' : 'var(--bg4)', border:'1px solid ' + (canTrade ? 'var(--purple)' : 'var(--border)'), color:canTrade ? '#fff' : 'var(--text3)', cursor:canTrade ? 'pointer' : 'not-allowed' }}>Trade</button>
                </div>
                {tradeNotice && tradeNotice.id === offer.id && <div style={{ marginTop:6, fontFamily:'var(--font-mono)', fontSize:9, color:tradeNotice.ok ? 'var(--green)' : 'var(--red2)' }}>{tradeNotice.ok ? '✓ ' : '✕ '}{tradeNotice.text}</div>}
              </div>;
            })}
          </div>
          <div style={{ padding:'0 10px 8px', fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)' }}>Trades use stored Stockpile items only. Equipped, carried, and story items are never included.</div>
        </div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', textAlign:'center', padding:4 }}>
          Prices are in RMAT. They are starting values for the economy check (the circuit toggle's 10 T2 is decided).
        </div>
      </div>
    </div>
  );
}

// Parent: the Shop tab. The Shop replaced the Market tab and the Auction view was removed [DECIDED Oct 27, Sam].
// MarketplaceScreenV2 (the old auction) stays defined but is no longer reachable.
function MarketParent() {
  return (
    <div data-shop-tab style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
      <div style={{ display:'flex', alignItems:'center', gap:10, padding:'6px 10px', borderBottom:'1px solid var(--border)', flexShrink:0 }}>
        <span style={{ fontFamily:'var(--font-title)', fontSize:13, letterSpacing:'0.06em', color:'var(--amber)' }}>SHOP</span>
        <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)' }}>Fixed vendor · prices in RMAT · stock unlocks with progress</span>
      </div>
      <div style={{ flex:1, minHeight:0, overflow:'hidden' }}><ShopScreen/></div>
    </div>
  );
}
Object.assign(window, { ShopScreen, MarketParent });

// ─── SCHEDULE SCREEN V2 (draggable timeline + 6 tasks only) ──────────────────
function ScheduleScreenV2({ mode }) {
  const ZI = window.ZI;
  const ZI_ART = window.ZI_ART;

  // Save Draft / Confirm flow state
  const [draftLocked, setDraftLocked] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);

  const ALLOWED_TASKS = [
    { id:'craft',  name:'Craft Item(s)',       icon:'craft',  duration:2, category:'both',  color:'var(--amber)' },
    { id:'train',  name:'Train Stats',         icon:'train',  duration:3, category:'both',  color:'var(--red2)' },
    { id:'repair', name:'Repair Gear',         icon:'repair', duration:2, category:'both',  color:'var(--text2)' },
    { id:'trade',  name:'Marketplace Trade',   icon:'trade',  duration:1, category:'both',  color:'var(--green)' },
    { id:'rest',   name:'Rest & Recover',      icon:'rest',   duration:3, category:'both',  color:'var(--blue)' },
    { id:'horde',  name:'Prepping for Horde',  icon:'horde',  duration:2, category:'camp',  color:'var(--rust2)', css:'#e0624c' },
  ];

  const [tasks, setTasks] = React.useState([
    { id:1, taskId:'rest',   label:'Rest & Recover',     duration:3, priority:1 },
    { id:2, taskId:'craft',  label:'Craft: Hazard Suit',  duration:2, priority:2 },
    { id:3, taskId:'trade',  label:'Marketplace Trade',   duration:1, priority:3 },
    { id:4, taskId:'train',  label:'Train Stats: Reflex', duration:3, priority:4 },
    { id:5, taskId:'repair', label:'Repair: Truck',       duration:2, priority:5 },
  ]);

  const [draggedId, setDraggedId] = React.useState(null);
  const [dragOverId, setDragOverId] = React.useState(null);
  const [dragSource, setDragSource] = React.useState(null); // 'timeline' or 'queue'

  const TIMELINE_H = 24;
  const totalHours = tasks.reduce((s,t)=>s+t.duration,0);
  const overBudget = totalHours > TIMELINE_H;

  // Draggable timeline blocks
  const onTimelineDragStart = (id) => { setDraggedId(id); setDragSource('timeline'); };
  const onTimelineDragOver = (id, e) => { e.preventDefault(); setDragOverId(id); };
  const onTimelineDrop = (targetId) => {
    if (!draggedId || draggedId === targetId) { setDraggedId(null); setDragOverId(null); return; }
    setTasks(prev => {
      const arr = [...prev];
      const fromIdx = arr.findIndex(t=>t.id===draggedId);
      const toIdx   = arr.findIndex(t=>t.id===targetId);
      const [moved] = arr.splice(fromIdx,1);
      arr.splice(toIdx,0,moved);
      return arr.map((t,i)=>({...t,priority:i+1}));
    });
    setDraggedId(null); setDragOverId(null);
  };

  const addTask = (taskType) => {
    if (draftLocked) return;
    const newTotal = totalHours + taskType.duration;
    if (newTotal > TIMELINE_H) return; // hard cap
    setTasks(prev=>[...prev,{
      id:Date.now(), taskId:taskType.id,
      label:taskType.name, duration:taskType.duration,
      priority:prev.length+1,
    }]);
  };

  const removeTask = (id) => { if (draftLocked) return; setTasks(prev=>prev.filter(t=>t.id!==id)); };
  const moveUp = (idx) => {
    if(draftLocked || idx===0)return;
    setTasks(prev=>{const a=[...prev];[a[idx-1],a[idx]]=[a[idx],a[idx-1]];return a.map((t,i)=>({...t,priority:i+1}));});
  };
  const moveDown = (idx) => {
    if(draftLocked || idx===tasks.length-1)return;
    setTasks(prev=>{const a=[...prev];[a[idx],a[idx+1]]=[a[idx+1],a[idx]];return a.map((t,i)=>({...t,priority:i+1}));});
  };

  return (
    <div className="screen-enter" style={{ display:'flex', gap:8, padding:8, height:'100%', overflow:'hidden' }}>
      {/* LEFT: Task queue */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:8, minWidth:0, overflow:'hidden' }}>

        {/* Timeline visualization */}
        <div className="panel" style={{ padding:'10px 12px', flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
            <div style={{ fontFamily:'var(--font-title)', fontSize:13, color:'var(--amber)', letterSpacing:'0.1em' }}>24-HOUR SCHEDULE TIMELINE</div>
            <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color: overBudget?'var(--red2)':'var(--green)' }}>
              {totalHours}h / 24h {overBudget?'⚠ OVER BUDGET':'used'}
            </div>
          </div>
          {/* Hour markers */}
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
            {[0,4,8,12,16,20,24].map(h=>(
              <span key={h} style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)' }}>{h===0?'NOW':`+${h}h`}</span>
            ))}
          </div>
          {/* Draggable timeline */}
          <div style={{ height:36, background:'var(--bg4)', borderRadius:2, overflow:'hidden', display:'flex', position:'relative' }}>
            {tasks.map((task, i) => {
              const taskDef = ALLOWED_TASKS.find(t=>t.id===task.taskId);
              const color = taskDef?.css || taskDef?.color || 'var(--text2)';
              const widthPct = (task.duration / TIMELINE_H) * 100;
              return (
                <div key={task.id}
                  draggable
                  onDragStart={()=>onTimelineDragStart(task.id)}
                  onDragOver={e=>onTimelineDragOver(task.id,e)}
                  onDrop={()=>onTimelineDrop(task.id)}
                  style={{
                    width:`${widthPct}%`, height:'100%', flexShrink:0,
                    background: color,
                    borderRight:'2px solid var(--bg)',
                    display:'flex', alignItems:'center', paddingLeft:4,
                    overflow:'hidden', cursor:'grab',
                    opacity: draggedId===task.id?0.5:1,
                    outline: dragOverId===task.id?'2px dashed var(--amber)':'none',
                    transition:'opacity 0.15s',
                  }}>
                  {/* 8-bit task icon */}
                  {ZI_ART?.tasks?.[task.taskId] && (
                    <span dangerouslySetInnerHTML={{__html:ZI_ART.tasks[task.taskId]()}} style={{flexShrink:0,marginRight:3}}/>
                  )}
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'rgba(255,255,255,0.85)', whiteSpace:'nowrap', overflow:'hidden' }}>
                    {task.label.split(':')[0]}
                  </span>
                </div>
              );
            })}
            {totalHours < TIMELINE_H && (
              <div style={{ flex:1, background:'var(--bg4)', borderLeft:'1px dashed var(--border2)', display:'flex', alignItems:'center', paddingLeft:8 }}>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)' }}>{TIMELINE_H-totalHours}h free</span>
              </div>
            )}
          </div>
          <div style={{ marginTop:4, fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)' }}>
            Drag blocks to reorder · Max 24h · Tasks run offline in priority order
          </div>
        </div>

        {/* Priority queue */}
        <div className="panel" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div className="panel-title" style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span>Priority Queue — drag or use arrows</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)' }}>{tasks.length} tasks</span>
          </div>
          <div style={{ flex:1, overflow:'auto', padding:8, display:'flex', flexDirection:'column', gap:5 }}>
            {tasks.map((task, idx) => {
              const taskDef = ALLOWED_TASKS.find(t=>t.id===task.taskId);
              const color = taskDef?.css || taskDef?.color || 'var(--text2)';
              const startHour = tasks.slice(0,idx).reduce((s,t)=>s+t.duration,0);
              return (
                <div key={task.id}
                  draggable
                  onDragStart={()=>onTimelineDragStart(task.id)}
                  onDragOver={e=>onTimelineDragOver(task.id,e)}
                  onDrop={()=>onTimelineDrop(task.id)}
                  style={{
                    display:'flex', alignItems:'center', gap:8,
                    padding:'7px 10px', background:'var(--bg3)',
                    border:`1px solid ${dragOverId===task.id?'var(--amber)':draggedId===task.id?'var(--border2)':'var(--border)'}`,
                    cursor:'grab', transition:'all 0.15s',
                    opacity:draggedId===task.id?0.4:1,
                  }}>
                  {/* Priority badge */}
                  <div style={{
                    width:20, height:20, borderRadius:'50%', border:`1px solid ${color}`,
                    display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
                    fontFamily:'var(--font-mono)', fontSize:9, color,
                  }}>{idx+1}</div>

                  {/* 8-bit icon */}
                  {ZI_ART?.tasks?.[task.taskId] && (
                    <span dangerouslySetInnerHTML={{__html:ZI_ART.tasks[task.taskId]()}} style={{flexShrink:0}}/>
                  )}

                  {/* Color bar */}
                  <div style={{ width:3, height:24, background:color, borderRadius:1, flexShrink:0 }}/>

                  {/* Info */}
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--text)', fontWeight:500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
                      {task.label}
                    </div>
                    <div style={{ display:'flex', gap:6, marginTop:2 }}>
                      <Tag color={color}>{fmtTime(task.duration*60)}</Tag>
                      <span style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)' }}>Starts +{startHour}h from now</span>
                    </div>
                  </div>

                  {/* Controls */}
                  <div style={{ display:'flex', gap:3, flexShrink:0 }}>
                    <button onClick={()=>moveUp(idx)} style={{ background:'var(--bg4)', border:'1px solid var(--border)', color:'var(--text2)', width:20, height:20, cursor:'pointer', fontSize:9, display:'flex', alignItems:'center', justifyContent:'center' }}>↑</button>
                    <button onClick={()=>moveDown(idx)} style={{ background:'var(--bg4)', border:'1px solid var(--border)', color:'var(--text2)', width:20, height:20, cursor:'pointer', fontSize:9, display:'flex', alignItems:'center', justifyContent:'center' }}>↓</button>
                    <button onClick={()=>removeTask(task.id)} style={{ background:'rgba(139,58,42,0.15)', border:'1px solid var(--red)', color:'var(--red2)', width:20, height:20, cursor:'pointer', fontSize:9, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT: Add task + summary */}
      <div style={{ width:260, display:'flex', flexDirection:'column', gap:8, flexShrink:0 }}>
        <div className="panel" style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          <div className="panel-title">Add Task</div>
          <div style={{ flex:1, overflow:'auto', padding:8, display:'flex', flexDirection:'column', gap:5 }}>
            {ALLOWED_TASKS.filter(t=>t.category==='both'||(mode==='camp'&&t.category==='camp')||(mode!=='camp'&&t.category==='solo')).map(taskType=>{
              const color = taskType.css || taskType.color;
              const wouldExceed = totalHours + taskType.duration > TIMELINE_H;
              return (
                <div key={taskType.id}
                  onClick={()=>!wouldExceed&&addTask(taskType)}
                  style={{
                    display:'flex', alignItems:'center', gap:8, padding:'7px 10px',
                    cursor:wouldExceed?'not-allowed':'pointer',
                    background:'var(--bg3)', border:`1px solid var(--border)`,
                    opacity: wouldExceed ? 0.7 : 1,
                    transition:'all 0.15s',
                  }}
                  onMouseEnter={e=>{ if(!wouldExceed) e.currentTarget.style.borderColor=color; }}
                  onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}
                >
                  {ZI_ART?.tasks?.[taskType.icon] && (
                    <span dangerouslySetInnerHTML={{__html:ZI_ART.tasks[taskType.icon]()}} style={{flexShrink:0}}/>
                  )}
                  <div style={{ flex:1 }}>
                    <div style={{ fontFamily:'var(--font-body)', fontSize:13, color:'var(--text)' }}>{taskType.name}</div>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)' }}>{fmtTime(taskType.duration*60)}</div>
                  </div>
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color }}>
                    {wouldExceed ? 'No room' : '+ Add'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        <div className="panel" style={{ padding:10, flexShrink:0 }}>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text3)', marginBottom:8 }}>SCHEDULE SUMMARY</div>
          <InfoRow label="Tasks" value={tasks.length} color="var(--text)"/>
          <InfoRow label="Total time" value={fmtTime(totalHours*60)} color={overBudget?'var(--red2)':'var(--amber)'}/>
          <InfoRow label="Done by" value={`+${totalHours}h from now`} color="var(--text2)"/>
          <div style={{ height:1, background:'var(--border)', margin:'8px 0' }}/>

          {/* Two-step Save Draft → Confirm flow */}
          {!draftLocked ? (
            <>
              <button className="btn" style={{ width:'100%', marginBottom:6 }}>Menu</button>
              <button
                className="btn btn-amber"
                style={{ width:'100%' }}
                onClick={() => setDraftLocked(true)}
                disabled={tasks.length === 0 || overBudget}
              >
                Save Draft
              </button>
              <div style={{ marginTop:8, fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', lineHeight:1.5 }}>
                Lock in the {totalHours}/24h schedule to confirm.
              </div>
            </>
          ) : confirmed ? (
            <>
              <div style={{
                padding:'8px 10px', background:'rgba(76,175,125,0.15)',
                border:'1px solid var(--green)', textAlign:'center', marginBottom:6,
                fontFamily:'var(--font-mono)', fontSize:11, color:'var(--green)',
              }}>
                ✓ Schedule Activated
              </div>
              <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', textAlign:'center', lineHeight:1.5, marginBottom:8 }}>
                Survivors will execute the queue while offline.<br/>
                Return in {fmtTime(totalHours*60)} for results.
              </div>
              <button className="btn" style={{ width:'100%' }} onClick={() => { setConfirmed(false); setDraftLocked(false); }}>
                Edit Schedule
              </button>
            </>
          ) : (
            <>
              <div style={{
                padding:'5px 8px', background:'var(--bg4)',
                borderLeft:'3px solid var(--amber)', marginBottom:8,
                fontFamily:'var(--font-mono)', fontSize:9, color:'var(--amber)',
              }}>
                ⚠ Draft locked. Confirm or revert below.
              </div>
              <button className="btn" style={{ width:'100%', marginBottom:6 }} onClick={() => setDraftLocked(false)}>
                Revert to Edit
              </button>
              <button
                className="btn btn-green"
                style={{ width:'100%' }}
                onClick={() => { setConfirmed(true); if (window.ZI.emitAction) { window.ZI.emitAction('task', Math.max(1, tasks.length)); } }}
              >
                Confirm Schedule
              </button>
              <div style={{ marginTop:8, fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text3)', lineHeight:1.5 }}>
                Tasks will lock & run while offline.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
Object.assign(window, { ScheduleScreenV2 });
