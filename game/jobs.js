// game/jobs.js — Craft/repair/build/recycle timer queue and its grants.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
// Everything attaches to the shared global ZI object; load-time calls live in game/bootstrap.js.

// ─── TIMER & OFFLINE JOB ENGINE (keystone: craft/repair/build queue) ─────────
// Grant-on-complete hooks are defined FIRST so no settle call — including the
// very first one at file load — can ever run before they exist (that ordering
// gap previously caused a job to be silently removed without granting output).
// Craft-completion grant: applies a recipe's outputs (RMAT wallet, gear, XP).
ZI.grantJobCraft = function(recipeId, qty, meta) {
  const r = (ZI.CRAFT_RECIPES || []).find(x => x.id === recipeId); if (!r) return;
  const n = qty || 1;
  for (let i = 0; i < n; i++) {
    if (r.grantsGear && ZI.grantGear) ZI.grantGear(r.grantsGear, r.grantsQty || 1);
    else if (ZI.GEAR_ITEMS) r.out.forEach(o => { const g = ZI.GEAR_ITEMS.find(gi => gi.name === o.n); if (g && ZI.grantGear) ZI.grantGear(g.id, o.q || 1); });
    if ((r.kind === 'rmat' || !r.kind) && ZI.addRmat) r.out.forEach(o => { if (/rmat/i.test(o.n)) ZI.addRmat(r.tier, o.q || 1); });
  }
  const medicalYield = r.kind === 'consumable' ? Math.min(0.1225, ZI.professionBonus ? ZI.professionBonus('medical', 0.0025) : 0) : 0;
  if (r.grantsGear && medicalYield > 0 && ZI.roll('medicalyield') < medicalYield && ZI.grantGear) ZI.grantGear(r.grantsGear, 1);
  const scale = 1 + (r.tier || 0) * 0.4;
  if (r.kind === 'gear') ZI.emitAction && ZI.emitAction('craft.smith', scale);
  else if (r.kind === 'consumable') ZI.emitAction && ZI.emitAction('craft.medical', scale);
  else ZI.emitAction && ZI.emitAction('craft.rmat', scale);
};
// Recycle-completion grant: applies an item's material outputs to the stockpile.
// Returns true only if materials were actually available to credit — if the
// material store isn't ready yet, the job is NOT consumed (retried next tick).
ZI.grantRecycleOutput = function(item, meta) {
  meta = meta || {};
  // Malformed job: dropped rather than retried forever — but any tool it reserved must come back,
  // otherwise the tool is destroyed with no job to show for it (review, Oct 30).
  if (!item || !item.outputs) {
    if (meta.reservedToolId && ZI.grantGear) ZI.grantGear(meta.reservedToolId, 1);
    return true;
  }
  const M = window.ZI_MATERIALS;
  if (!M || !Object.keys(M).length) {
    if (typeof console !== 'undefined') console.warn('[ZI JobEngine] ZI_MATERIALS not ready — deferring recycle grant', item.name);
    return false;
  }
  let grantedAny = false;
  Object.entries(item.outputs).forEach(([mat, amt]) => {
    const target = M[mat]; if (!target) return;
    const mechYield = Math.min(0.1225, ZI.professionBonus ? ZI.professionBonus('mechanical', 0.0025) : 0);
    const extra = ZI.roll && mechYield > 0 && ZI.roll('recyclebonus') < mechYield ? 1 : 0;
    target.current = Math.min(target.max, target.current + amt + extra);
    grantedAny = true;
  });
  if (item.fromWandering && ZI.consumeWanderLoot) ZI.consumeWanderLoot(item.id);
  if (!item.fromToolScrap && meta.reservedToolId && ZI.getGearItem && ZI.grantGear) {
    const tool = ZI.getGearItem(meta.reservedToolId);
    if (tool && tool.toolNextId) ZI.grantGear(tool.toolNextId, 1);
  }
  if (ZI.emitAction) ZI.emitAction('recycle', 1);
  if (typeof console !== 'undefined') console.log('[ZI JobEngine] recycled', item.name, '→', item.outputs);
  return true;
};
ZI.now = function() { return ZI.clockNow(); }; // H1: the one gameplay clock lives in game/core.js
ZI.JOBS_KEY = 'zi_jobs';
ZI.JOBS_VER = 1;
ZI.BASE_CRAFT_SLOTS = 1;
// Raw store reader/writer (no settle side-effects — used internally by _settleJobs
// to avoid recursion). Public reads go through ZI.getJobs(), which settles first.
ZI._readJobsRaw = function() {
  let s; try { s = JSON.parse(localStorage.getItem(ZI.JOBS_KEY) || 'null'); } catch (e) { s = null; }
  if (!s || s.v !== ZI.JOBS_VER) s = { v: ZI.JOBS_VER, jobs: [] };
  return s;
};
ZI.saveJobs = function(s) { try { localStorage.setItem(ZI.JOBS_KEY, JSON.stringify(s)); } catch (e) {} };
// Settle-on-read: every public read re-checks elapsed time and completes any
// due jobs first. This makes the queue self-healing even if the background
// setInterval ticker is throttled/unreliable (e.g. a backgrounded iframe) —
// any UI poll (progress bars, job counts) drives completion, not just the timer.
ZI._settling = false;
ZI.getJobs = function() {
  if (!ZI._settling) {
    ZI._settling = true;
    try { ZI._settleJobs(ZI.now()); } catch (e) { if (typeof console !== 'undefined') console.error('[ZI JobEngine] settle failed', e); }
    ZI._settling = false;
  }
  return ZI._readJobsRaw();
};
// Craft + repair share the Workshop pool; builds have a separate lane.
ZI.craftSlots = function() { return ZI.BASE_CRAFT_SLOTS + ZI.structureLevel('workshop'); };
ZI.buildSlots = function() { return 1; };
ZI.recycleSlots = function() { return 1; }; // single-lane FIFO, mirrors the old queue's one-at-a-time behavior
ZI._poolOf = function(type) { return type === 'build' ? 'build' : type === 'recycle' ? 'recycle' : 'craft'; };
ZI._slotsFor = function(pool) { return pool === 'build' ? ZI.buildSlots() : pool === 'recycle' ? ZI.recycleSlots() : ZI.craftSlots(); };
// Enqueue a job. Auto-starts if a slot is free, else queued (FIFO).
ZI.enqueueJob = function(type, refId, duration, meta, qty) {
  const s = ZI.getJobs();
  const pool = ZI._poolOf(type);
  const active = s.jobs.filter(j => ZI._poolOf(j.type) === pool && j.status === 'active').length;
  const job = { id:'job_'+ZI.now()+Math.floor(Math.random()*1e5), type, refId, qty:qty||1,
    duration: duration||1, startedAt: active < ZI._slotsFor(pool) ? ZI.now() : null,
    status: active < ZI._slotsFor(pool) ? 'active' : 'queued', meta: meta || {} };
  s.jobs.push(job); ZI.saveJobs(s); ZI._settleJobs(ZI.now());
  return job;
};
ZI._grantJob = function(j) {
  if (j.type === 'craft') return ZI.grantJobCraft ? (ZI.grantJobCraft(j.refId, j.qty, j.meta), true) : false;
  if (j.type === 'repair') { const it = ZI.getGearItem(j.refId); if (it) { const m = ZI.getDuraMap(); m[j.refId] = ZI.itemDurabilityMax(it); ZI.saveDuraMap(m); if (ZI.emitAction) ZI.emitAction('repair', 1 + ZI.tierRank(it) * 0.5); } return true; }
  if (j.type === 'build') { const cs = ZI.getCampSave(); cs.built[j.refId] = j.meta.toLevel; ZI.saveCampSave(cs); if (ZI.emitAction) ZI.emitAction('build', 1); return true; }
  if (j.type === 'recycle') return ZI.grantRecycleOutput ? ZI.grantRecycleOutput(j.meta.item, j.meta) : false;
  return true; // unknown job type — don't block the queue on it
};
// Offline catch-up: walk the queue forward through elapsed real time, respecting slots.
ZI._settleJobs = function(now, offlineWindow) {
  const s = ZI._readJobsRaw();
  const completed = [];
  let guard = 0;
  while (guard++ < 2000) {
    // complete any active job whose timer elapsed
    const done = s.jobs.filter(j => j.status === 'active' && j.startedAt != null && now >= j.startedAt + j.duration * 1000);
    if (!done.length) break;
    // finish the earliest-finishing one, then promote a queued job into the freed slot
    done.sort((a, b) => (a.startedAt + a.duration*1000) - (b.startedAt + b.duration*1000));
    const j = done[0];
    const finishAt = j.startedAt + j.duration * 1000;
    const prevMoment = ZI._buffMomentFn; ZI._buffMomentFn = () => finishAt; // FX3 (D-FX3a): XP buffs judged at the job's finish time
    let granted; try { granted = ZI._grantJob(j); } finally { ZI._buffMomentFn = prevMoment; }
    if (!granted) break; // e.g. materials store not ready yet — retry on the next settle, don't drop the job
    completed.push({ type:j.type, refId:j.refId });
    s.jobs = s.jobs.filter(x => x.id !== j.id);
    // promote next queued job in the same pool; its clock starts when the slot freed
    const pool = ZI._poolOf(j.type);
    const next = s.jobs.find(x => x.status === 'queued' && ZI._poolOf(x.type) === pool);
    if (next) { next.status = 'active'; next.startedAt = finishAt; }
  }
  // fill any idle slots with queued jobs starting now (first load)
  ['craft','build','recycle'].forEach(pool => {
    const activeN = s.jobs.filter(x => ZI._poolOf(x.type) === pool && x.status === 'active').length;
    let free = ZI._slotsFor(pool) - activeN;
    s.jobs.filter(x => x.status === 'queued' && ZI._poolOf(x.type) === pool).forEach(x => {
      if (free > 0) { x.status = 'active'; x.startedAt = now; free--; }
    });
  });
  // Shift unfinished timers across the discarded part of a long absence so it cannot accrue later.
  if (offlineWindow && offlineWindow.discardedMs > 0) {
    s.jobs.forEach(j => { if (j.status === 'active' && j.startedAt != null) j.startedAt += offlineWindow.discardedMs; });
  }
  ZI.saveJobs(s);
  return completed;
};
ZI.jobProgress = function(j) {
  if (j.status !== 'active' || j.startedAt == null) return 0;
  return Math.max(0, Math.min(1, (ZI.now() - j.startedAt) / (j.duration * 1000)));
};
ZI.jobRemaining = function(j) {
  if (j.status !== 'active' || j.startedAt == null) return j.duration;
  return Math.max(0, Math.round((j.startedAt + j.duration * 1000 - ZI.now()) / 1000));
};
ZI.jobsByType = function(type) { return ZI.getJobs().jobs.filter(j => j.type === type); };
ZI.cancelJob = function(id) {
  const s = ZI.getJobs(), job = s.jobs.find(j => j.id === id);
  s.jobs = s.jobs.filter(j => j.id !== id); ZI.saveJobs(s);
  if (job && job.type === 'recycle' && job.meta && job.meta.reservedToolId && ZI.grantGear) ZI.grantGear(job.meta.reservedToolId, 1);
  ZI._settleJobs(ZI.now());
};
// The JobEngine ticker (foreground) + one settle on load (offline catch-up).
ZI.JobEngine = { timer:null, start(){ if(this.timer) return; this.timer=setInterval(()=>{ try{ ZI.heartbeatOfflineWindow(); ZI._settleJobs(ZI.now()); ZI.settleSchedule(); ZI.settleRouteRuns && ZI.settleRouteRuns(); }catch(e){} },1000); } };
