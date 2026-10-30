// game/operations.js — read-only data for the Operations (Schedule) page (Sam, Oct 29: build the proposal).
// Source: reference/operations-schedule-proposal.md. Rules kept from the proposal:
// • The page READS the systems that own each activity (Traversal, Wandering, Routes, the job queue, the camp
//   schedule, STAT-02 status). Its only write is Camp Leader duty assignment (ZI.opsAssign / ZI.opsUnassign below,
//   through the existing camp schedule). It never implies a sequence the engine does not use.
// • Every activity says who does it, what it needs, whether it runs while away, and what to expect.
// • Proposed chores (cooking, weapon upkeep, laundry, radio, intel, circuits, pending deploy, supply sorting, water)
//   carry the status "Design proposal" and are never selectable until their mechanic exists.
// • Camp Leader shows assignments to camp survivors and facilities; Solo Survivor shows the lone survivor's own plan
//   and never a camp roster.
ZI.OPS_STATUS = { available: 'Available now', injured: 'Injured', facility: 'Needs facility', supplies: 'Needs supplies', busy: 'Busy until…', proposal: 'Design proposal' };
// screen = the existing screen that owns the activity (navigation only). proposal = not built.
ZI.OPS_CATALOG = [
  // Field operations — both modes
  { id:'traversal', group:'field', modes:['solo','camp'], name:'Traversal', who:'Your survivor', needs:'Map position; daily scout/hide limits', away:'No (player actions)', result:'Travel, scout, loot, hide or make camp at a cell', screen:'traversal' },
  { id:'wander',    group:'field', modes:['solo','camp'], name:'Wandering patrol', who:'Your survivor', needs:'An active run', away:'Yes (24 h offline cap)', result:'Fights, loot, distance and skill XP', screen:'hack-slash' },
  { id:'route',     group:'field', modes:['solo'], name:'Route run', who:'Your survivor (squad on routes)', needs:'Route preparation and gear', away:'Yes (24 h offline cap)', result:'A haul and XP on return; shown below while running', screen:'solo-main' },
  { id:'deploy_pending', group:'field', modes:['solo','camp'], name:'Pending route deployment', who:'—', needs:'—', away:'—', result:'A short countdown with Cancel before a route starts', proposal:true },
  { id:'circuit',   group:'field', modes:['solo','camp'], name:'Plan a circuit', who:'—', needs:'—', away:'—', result:'Waypoints, stops and return conditions between Traversal and Routes', proposal:true },
  { id:'radio_listen', group:'field', modes:['solo','camp'], name:'Listen to radio', who:'—', needs:'A working radio (open)', away:'Open', result:'Faction traffic, rumors, contact, time-limited cache leads', proposal:true },
  { id:'intel',     group:'field', modes:['solo','camp'], name:'Send intel report', who:'You choose', needs:'Discoveries to report (open)', away:'—', result:'Share POIs and routes you found; never automatic', proposal:true },
  // Base and return operations
  { id:'salvage',   group:'base', modes:['solo','camp'], name:'Process salvage', who:'Recycler', needs:'Recyclable items in the stockpile', away:'Yes (job queue)', result:'Base materials from returned salvage', screen:'stockpile', check:'recycler' },
  { id:'craft',     group:'base', modes:['solo','camp'], name:'Craft / repair gear', who:'Workshop queue', needs:'Materials for the recipe', away:'Yes (job queue)', result:'Crafted items; repairs restore durability', screen:'rmat-crafting' },
  { id:'eat',       group:'base', modes:['solo','camp'], name:'Eat', who:'Your survivor', needs:'Food in the stash', away:'Yes: eats on their own while away (up to 3 meals)', result:'Nutrition back up (Auto-Eat is a Shop item)', screen:'stat-leveling', check:'food' },
  { id:'nap',       group:'base', modes:['solo','camp'], name:'Nap at base', who:'Your survivor', needs:'Be at your base or camp cell', away:'No', result:'One tier of tiredness back; costs 2 game hours', screen:'stat-leveling', check:'nap' },
  { id:'treat',     group:'base', modes:['solo','camp'], name:'Treat injury / recover', who:'Your survivor', needs:'An injury; play time or rest', away:'Rest: yes', result:'Injury heals with play time; rest restores HP', screen:'hack-slash', check:'injury' },
  { id:'cook',      group:'base', modes:['solo','camp'], name:'Cook / prepare meals', who:'—', needs:'Food, fuel (open)', away:'Open', result:'Meals from raw food (FOOD-02)', proposal:true, designOrder:1 },
  { id:'upkeep',    group:'base', modes:['solo','camp'], name:'Weapon upkeep', who:'—', needs:'Open', away:'Open', result:'Durability maintenance for chosen weapons', proposal:true, designOrder:2 },
  { id:'laundry',   group:'base', modes:['solo','camp'], name:'Laundry', who:'—', needs:'Water, fuel (open)', away:'Open', result:'Clean clothes; may lower scent and stress (open)', proposal:true, designOrder:3 },
  { id:'sort',      group:'base', modes:['solo','camp'], name:'Sort and preserve supplies', who:'—', needs:'Open', away:'Open', result:'Review food, medicine and parts; preservation is open', proposal:true },
  { id:'water',     group:'base', modes:['solo','camp'], name:'Water collection / purification', who:'—', needs:'Open', away:'Open', result:'Water for cooking and laundry', proposal:true },
  { id:'maintain',  group:'base', modes:['camp'], name:'Base maintenance / buildings', who:'Camp', needs:'Materials for the build', away:'Yes (build queue)', result:'Camp structures and upgrades', screen:'camp-main' },
];
// Chore design order (Sam, Oct 29): cooking → weapon upkeep → laundry.
ZI.opsCatalog = function(mode) { return ZI.OPS_CATALOG.filter(a => a.modes.indexOf(mode) >= 0); };
// Live status for one activity. Reads only.
ZI.opsActivityStatus = function(a, mode) {
  if (a.proposal) return { key: 'proposal', label: ZI.OPS_STATUS.proposal };
  const ok = { key: 'available', label: ZI.OPS_STATUS.available };
  try {
    if (a.check === 'food') { const L = ZI.PROG && ZI.PROG.LIVE; return L && L.foodList().length ? ok : { key: 'supplies', label: ZI.OPS_STATUS.supplies + ' (no food in the stash)' }; }
    if (a.check === 'nap') { const L = ZI.PROG && ZI.PROG.LIVE; return !L || L.canNap() ? ok : { key: 'facility', label: 'Needs base: go to your base or camp cell' }; }
    if (a.check === 'injury') { const j = ZI.getInjury && ZI.getInjury(); return j ? { key: 'injured', label: 'Injured: ' + Math.ceil(j.remainingMs / 60000) + ' play-min to heal' } : { key: 'available', label: 'No injury' }; }
    if (a.check === 'recycler') { const busy = (ZI._readJobsRaw ? ZI._readJobsRaw().jobs : []).find(j => j.type === 'recycle' && j.status === 'active'); return busy ? { key: 'busy', label: 'Busy until ' + ZI.opsClock(busy.startedAt + busy.duration * 1000) } : ok; }
  } catch (e) {}
  return ok;
};
ZI.opsClock = function(t) { try { return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch (e) { return '—'; } };
// "Now and next": what is running and what needs attention. Reads only (no settle calls).
// SCH-01 L2 (Sam, Oct 30): every row carries sort ('urgent' | 'running' | 'idle') and endsAt
// (epoch ms, or null). Order is urgent -> running (soonest first) -> idle. The UI shows endsAt in
// its own right-aligned column, so detail no longer repeats the time.
ZI.OPS_SORT_RANK = { urgent: 0, running: 1, idle: 2 };
ZI.opsSortRows = function(rows) {
  const rank = ZI.OPS_SORT_RANK;
  return rows.map((r, i) => [r, i]).sort((a, b) => {
    const ra = rank[a[0].sort] != null ? rank[a[0].sort] : 1, rb = rank[b[0].sort] != null ? rank[b[0].sort] : 1;
    if (ra !== rb) return ra - rb;
    const ea = Number.isFinite(a[0].endsAt) ? a[0].endsAt : Infinity, eb = Number.isFinite(b[0].endsAt) ? b[0].endsAt : Infinity;
    if (ea !== eb) return ea - eb;
    return a[1] - b[1];
  }).map(x => x[0]);
};
ZI.opsNow = function(mode) {
  const now = ZI.clockNow ? ZI.clockNow() : Date.now(), out = { field: [], camp: [], attention: [] };
  const run = ZI.getWanderRun ? ZI.getWanderRun() : null;
  if (run && run.active) {
    const state = run.resting ? 'resting' + (run.restAt ? ' at ' + run.restAt : '') : run.withdrawing ? 'walking back to the checkpoint' : run.paused ? 'paused' : 'on patrol';
    out.field.push({ id: 'wander', label: 'Wandering patrol', sort: 'running', endsAt: null, detail: state + ' · ' + Math.round(run.scroll || 0).toLocaleString() + ' m · HP ' + Math.round(run.hp || 0), screen: 'hack-slash' });
  } else out.field.push({ id: 'wander', label: 'Wandering patrol', sort: 'idle', endsAt: null, detail: 'not deployed', screen: 'hack-slash' });
  const runs = ZI._readRouteRuns ? ZI._readRouteRuns() : {};
  Object.entries(runs || {}).forEach(([id, r]) => {
    if (!r || !Number.isFinite(r.startedAt) || !(r.durationMs > 0)) return;
    const route = (ZI.ROUTES || []).find(x => x.id === id), end = r.startedAt + r.durationMs, done = now >= end;
    out.field.push({ id: 'route:' + id, label: 'Route: ' + (route ? route.name : id), sort: done ? 'urgent' : 'running', endsAt: end,
      detail: (done ? 'back, settling' : 'out') + (r.autoRepeat ? ' · repeats' : ''), screen: mode === 'solo' ? 'solo-main' : null });
  });
  const pos = ZI._rj ? ZI._rj('zi_trav_pos', null) : null;
  if (!pos || typeof pos !== 'object') out.field.push({ id: 'trav', label: 'Traversal', sort: 'idle', endsAt: null, detail: 'open the map to pick your start', screen: 'traversal' });
  else {
    const sc = ZI.getTravScouts ? ZI.getTravScouts() : null, hide = ZI.getHideUses ? ZI.getHideUses(now) : null, camp = ZI.getCampCooldown ? ZI.getCampCooldown(now) : null;
    const campReady = !!(camp && camp.available), campWaiting = !!(camp && !camp.available && Number.isFinite(camp.availableAt));
    out.field.push({ id: 'trav', label: 'Traversal',
      sort: campReady ? 'urgent' : campWaiting ? 'running' : 'idle',
      endsAt: campWaiting ? camp.availableAt : null,
      detail: (pos.name || 'Unknown cell') + (sc ? ' · scouts ' + sc.left + '/' + sc.max : '') + (hide ? ' · hide ' + hide.left + '/' + hide.max : '') + (campReady ? ' · Make camp ready' : campWaiting ? ' · Make camp' : ''), screen: 'traversal' });
  }
  (ZI._readJobsRaw ? ZI._readJobsRaw().jobs : []).forEach(j => {
    const end = j.startedAt != null ? j.startedAt + j.duration * 1000 : null, done = end != null && now >= end;
    out.camp.push({ id: 'job:' + j.id, label: (j.type === 'recycle' ? 'Recycling' : j.type === 'build' ? 'Building' : j.type === 'repair' ? 'Repairing' : 'Crafting') + (j.refId ? ': ' + String(j.refId).replace(/_/g, ' ') : ''),
      sort: j.status === 'queued' ? 'running' : done ? 'urgent' : 'running', endsAt: end,
      detail: j.status === 'queued' ? 'queued' : end != null ? (done ? 'done' : 'running') : j.status });
  });
  if (mode === 'camp') {
    const sch = ZI.getSchedule ? ZI.getSchedule() : { assignments: [] };
    out.camp.push({ id: 'duties', label: 'Camp duties', sort: 'idle', endsAt: null, detail: sch.assignments.length + ' assigned of ' + (ZI.SCHEDULE_JOBS || []).length + ' duties', screen: null });
  }
  out.field = ZI.opsSortRows(out.field);
  out.camp = ZI.opsSortRows(out.camp);
  // Attention
  const j = ZI.getInjury && ZI.getInjury(); if (j) out.attention.push('Injured: heals with ' + Math.ceil(j.remainingMs / 60000) + ' more play minutes.');
  if (ZI.isBroken && ZI.isBroken()) out.attention.push('Broken: the survivor needs rest.');
  try {
    const L = ZI.PROG && ZI.PROG.LIVE;
    if (L) {
      const lab = L.labels ? L.labels() : null, idx = L.statusIndex ? L.statusIndex() : null;
      if (idx && idx.hunger >= 2) out.attention.push(((lab && lab.hunger) || 'Hungry') + ': eat something (Stats).');
      if (idx && idx.rest >= 2) out.attention.push(((lab && lab.rest) || 'Tired') + ': nap at base or make camp.');
      const st = L.getState ? L.getState() : null; if (st && st.pending > 0) out.attention.push(st.pending + ' stat pick' + (st.pending === 1 ? '' : 's') + ' waiting (Stats).');
      if (L.foodList && !L.foodList().length) out.attention.push('No food in the stash.');
    }
  } catch (e) {}
  const un = ZI.getUnclaimedRouteRewards ? ZI.getUnclaimedRouteRewards() : null; if (un && un.runs > 0 && mode === 'solo') out.attention.push(un.runs + ' route haul' + (un.runs === 1 ? '' : 's') + ' waiting to be claimed (Routes).');
  return out;
};
// Camp Leader base schedule: each existing duty, its facility, who is on it, and whether it is covered.
ZI.opsCampDuties = function() {
  const sch = ZI.getSchedule ? ZI.getSchedule() : { assignments: [] };
  const names = {}; (ZI.SQUAD_ROSTER || []).forEach(s => { names[s.id] = s.name; });
  return (ZI.SCHEDULE_JOBS || []).map(job => {
    const who = sch.assignments.filter(a => a.jobId === job.id).map(a => names[a.survivorId] || a.survivorId);
    const built = !job.requires || (ZI.structureLevel ? ZI.structureLevel(job.requires) > 0 : false);
    const prof = (ZI.PROFESSIONS || []).find(p => p.id === job.profession);
    const whoIds = sch.assignments.filter(a => a.jobId === job.id).map(a => a.survivorId);
    return { id: job.id, label: job.label, profession: prof ? prof.name : job.profession, xpPerHour: job.xpPerHour, requires: job.requires, built, who, whoIds, slots: job.slots || 1,
      status: !built ? ZI.OPS_STATUS.facility + ' (' + job.requires + ')' : who.length ? 'Covered' : 'Uncovered' };
  });
};

// ─── Camp Leader duty assignment (Sam, Oct 29: "keep … assigning camp duties for camp leader") ─────────────────
// Uses the existing camp schedule (ZI.assignJob / ZI.unassignJob, game/camp.js) and its existing XP rates. Guards:
// the duty's facility must be built, one survivor per duty slot, at most ZI.commandScheduleSlots() duties staffed,
// and a survivor away on a route run cannot take a duty. Camp Leader only.
ZI.opsRouteBusy = function() {
  const busy = {};
  Object.entries(ZI._readRouteRuns ? ZI._readRouteRuns() : {}).forEach(([id, r]) => { (r && r.squadIds || []).forEach(s => { busy[s] = id; }); });
  return busy;
};
ZI.opsDutySlots = function() { return ZI.commandScheduleSlots ? ZI.commandScheduleSlots() : 3; };
ZI.opsAssign = function(survivorId, jobId, mode) {
  if (mode !== 'camp') return { ok: false, reason: 'Camp duties are a Camp Leader feature.' };
  const job = ZI.getJob && ZI.getJob(jobId); if (!job) return { ok: false, reason: 'Unknown duty.' };
  const sv = (ZI.SQUAD_ROSTER || []).find(s => s.id === survivorId); if (!sv) return { ok: false, reason: 'Unknown survivor.' };
  if (job.requires && !(ZI.structureLevel && ZI.structureLevel(job.requires) > 0)) return { ok: false, reason: 'Build the ' + job.requires + ' first.' };
  const route = ZI.opsRouteBusy()[survivorId]; if (route) return { ok: false, reason: sv.name + ' is away on a route run.' };
  const sch = ZI.getSchedule(), others = sch.assignments.filter(a => a.survivorId !== survivorId);
  if (others.filter(a => a.jobId === jobId).length >= (job.slots || 1)) return { ok: false, reason: job.label + ' is already staffed.' };
  if (others.length >= ZI.opsDutySlots()) return { ok: false, reason: 'All ' + ZI.opsDutySlots() + ' duty slots are in use (more come with leader level).' };
  ZI.assignJob(survivorId, jobId);
  return { ok: true };
};
ZI.opsUnassign = function(survivorId, mode) {
  if (mode !== 'camp') return { ok: false, reason: 'Camp duties are a Camp Leader feature.' };
  ZI.unassignJob(survivorId); return { ok: true };
};
