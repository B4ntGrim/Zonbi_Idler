// All-gains HUD. Presentation only: never awards rewards or advances gameplay.
(function (Z) {
  const defaults = { activityBar:true, activityNumbers:false, activityProfession:true, activityExperience:true,
    activityResources:true, activityCompanionsOnly:false, activityCombine:true };
  Object.assign(Z.SETTINGS_DEFAULTS, defaults);
  const A = Z.ActivityFeed = { entries:[], limit:80 };
  let previous = null, identity = null;
  // Profession awards already expose source metadata; preserve it without changing XP.
  const hasXpEvents = typeof Z.onXp === 'function';
  A.push = function(category, label, amount, source) {
    if (!Number.isFinite(amount) || amount <= 0) return;
    const now = Z.clockNow(), last = A.entries[A.entries.length - 1];
    if (Z.getSettings().activityCombine && last && last.category === category && last.label === label && last.source === (source || 'Game') && now - last.at < 24000) {
      last.amount += amount; last.at = now;
    } else A.entries.push({ category, label, amount, source:source || 'Game', at:now });
    if (A.entries.length > A.limit) A.entries.splice(0, A.entries.length - A.limit);
  };
  if (hasXpEvents) Z.onXp((prof, amount, meta) => A.push('profession', prof + ' XP', amount, meta && meta.companionName ? 'Companion: ' + meta.companionName : (meta && meta.action) || 'Game'));
  A.visible = function() {
    const s = Z.getSettings();
    return A.entries.filter(e => s['activity' + ({profession:'Profession',experience:'Experience',resources:'Resources'})[e.category]] && (!s.activityCompanionsOnly || e.source.indexOf('Companion:') === 0));
  };
  A.text = function(e) { return e.source + ' · ' + (Z.getSettings().activityNumbers ? '+' + e.amount + ' ' : '') + e.label + (Z.getSettings().activityNumbers ? '' : ' gained'); };
  A.sample = function() {
    const snap = {};
    Object.entries(Z.getStatXp ? Z.getStatXp() : {}).forEach(([k,v]) => { snap['profession:' + k] = v; });
    snap['experience:Character XP'] = Z.getCharacterXp ? Z.getCharacterXp() : 0;
    Object.entries(Z.getRmatHoldings ? Z.getRmatHoldings() : {}).forEach(([k,v]) => { snap['resources:RMAT ' + k] = v; });
    Object.entries(Z.getComponents ? Z.getComponents() : {}).forEach(([k,v]) => { snap['resources:' + k] = v; });
    (Z.getStash ? Z.getStash() : []).forEach(id => { const g = Z.getGearItem && Z.getGearItem(id); const k = 'resources:' + (g ? g.name : id); snap[k] = (snap[k] || 0) + 1; });
    // Material storage is authoritative in this prototype; include direct material grants too.
    Object.values(typeof ZI_MATERIALS !== 'undefined' ? ZI_MATERIALS : {}).forEach(m => { if (Number.isFinite(m.current)) snap['resources:' + m.name] = m.current; });
    const slot = (localStorage.getItem(Z.SAVE_ACTIVE_KEY) || '') + ':' + (localStorage.getItem('zi_world_seed') || '');
    if (identity !== slot) { previous = null; A.entries = []; identity = slot; }
    if (previous) Object.entries(snap).forEach(([k,v]) => {
      const amount = v - (previous[k] || 0); if (amount > 0 && !(hasXpEvents && k.startsWith('profession:'))) {
        const at = k.indexOf(':'); A.push(k.slice(0,at), k.slice(at + 1) + (k.startsWith('profession:') ? ' XP' : ''), amount);
      }
    });
    previous = snap;
  };
  A.reset = function() { previous = null; A.entries = []; };
})(window.ZI);
