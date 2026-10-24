
// ═══ JD1a — First displacement: the Elder Jester's first meeting (reference/jd1a-batch-draft.md, CURRENT_BATCH.md) ═══
// Rules only. OFF for players until JD1b supplies the scene (S5): TABLE.firstMeetingOn is a code default, never read
// from a save. Records live in zi_jester (a zi_* key, so it travels with the save slot). Eligibility, kit receipt
// (zi_starter_kit_given) and trade completion are separate facts (B4). Every multi-store step writes its intent first and
// is safe to redo (the "flag first, act idempotently" pattern of ensureStarterKit), so a reload never repeats it (8d).
ZI.Jester = {
  KEY: 'zi_jester',
  TABLE: {
    firstMeetingOn: false,                 // S5: off for players until JD1b
    distances: [3, 4, 5, 2, 1],            // G1: search order (Chebyshev, as the Fort placement)
    stayDaysMin: 3, stayDaysMax: 5,        // U35/U38b: 3–5 days, rolled once at the meeting
    dayMs: 86400000,                       // the game's day convention (real 24 h on the game clock)
    weapons: ['bat', 'iron_knuckles', 'pocket_knife'],
    equip: [{ id: 'old_padded_jacket', slot: 'vest' }, { id: 'handmade_pouch', slot: 'backpack' }], // B3: empty slot, else stash
    carried: [{ id: 'scout_kit', qty: 1 }, { id: 'ration', qty: 2 }],                            // B3: go with the survivor
    stash: ['fort_medkit'],                                                                        // B3: the Fort checks the stash
  },
  on() { return !!this.TABLE.firstMeetingOn; },
  get() { return ZI._rj(this.KEY, null); },
  put(r) { ZI._wj(this.KEY, r); return r; },
  _sig() { const s = JSON.stringify([ZI.getStash(), ZI.getLoadout(), ZI.getCarried()]); let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h + ':' + s.length; },
  _hk(e) { return JSON.stringify([e.id || null, e.name || null, e.seq == null ? null : e.seq, e.value == null ? null : e.value]); },

  // ── B4: records at creation and on load ──
  onNewSave() {
    const on = this.on();
    this.put({ v: 1, eligible: on, met: false, phase: null });
    if (!on) ZI.ensureStarterKit();        // switch off: the existing kit once, as today
  },
  onLoad() {
    let r = this.get();
    if (!r) {                              // legacy save: exempt, migrated once; today's kit migration (flag-guarded)
      this.put({ v: 1, eligible: false, met: false, phase: null, migrated: true });
      ZI.ensureStarterKit(); return 'legacy';
    }
    if (!r.eligible) { ZI.ensureStarterKit(); this._finishPendingWeapon(); return 'exempt'; }
    if (r.phase === 'trading') { this._finishTrade(r); r = this.get(); }
    if (r.phase === 'granting') { this._grant(r); r = this.get(); }
    this._finishPendingWeapon();
    if (!this.on() && !r.fallback && r.phase !== 'done') { this.fallback(); return 'fallback'; }
    if (this.on() && (r.phase === 'resting' || r.phase === 'waiting')) {   // the run must agree with the record
      ZI.wanderAct(s => { if (!s.jesterCamp) { s.jesterCamp = true; if (r.phase === 'resting' && !s.resting) { s.resting = true; s.restAt = 'camp'; s.restStartHp = Math.max(0, s.hp || 1); s.restElapsedMs = 0; } } });
    }
    return 'eligible';
  },

  // ── G1: camp square ──
  campSquare(down, rng) {
    const C = ZI.SECTOR_COLS, R = ZI.SECTOR_ROWS, sx0 = Math.floor(down.gx / C) * C, sy0 = Math.floor(down.gy / R) * R;
    const inSec = (gx, gy) => gx >= sx0 && gx < sx0 + C && gy >= sy0 && gy < sy0 + R;
    const cell = (gx, gy) => ZI.worldCell(gx, gy, 'scavenge');
    const safe = (c) => !!c && c.state !== 'locked' && c.state !== 'contested' && !(ZI.isFortCell && ZI.isFortCell(c)) && !(ZI.isFallowCell && ZI.isFallowCell(c)) && !(ZI.isHomeCell && ZI.isHomeCell(c.gx, c.gy));
    // Legal movement (Traversal travel): one square to any of the 8 neighbours; locked squares can't be entered. Bounded to the sector.
    const k = (gx, gy) => gx + ',' + gy, reach = new Set([k(down.gx, down.gy)]), q = [[down.gx, down.gy]];
    while (q.length) { const [x, y] = q.shift();
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const nx = x + dx, ny = y + dy;
        if (!inSec(nx, ny) || reach.has(k(nx, ny))) continue; if (cell(nx, ny).state === 'locked') continue; reach.add(k(nx, ny)); q.push([nx, ny]); } }
    for (const d of this.TABLE.distances) {
      const opts = [];
      for (let gy = sy0; gy < sy0 + R; gy++) for (let gx = sx0; gx < sx0 + C; gx++) {
        if (Math.max(Math.abs(gx - down.gx), Math.abs(gy - down.gy)) !== d || !reach.has(k(gx, gy))) continue;
        const c = cell(gx, gy); if (safe(c)) opts.push(c);
      }
      if (opts.length) return opts[Math.floor(rng() * opts.length) % opts.length];
    }
    const here = cell(down.gx, down.gy);
    return safe(here) ? here : null;      // E1: no safe camp → null (the ordinary Base Forced Retreat)
  },

  // ── S2/G1/E1: the first Downing (called from WanderSim._downed instead of the Base Forced Retreat) ──
  firstDowning(state, rng) {
    if (!this.on() || state.resting) return null;
    const r = this.get(); if (!r || !r.eligible || r.met || r.phase || r.fallback) return null;
    const down = ZI._rj('zi_trav_pos', null);
    const camp = down && down.gx != null ? this.campSquare(down, rng) : null;
    if (!camp) { r.campSkipped = (r.campSkipped || []).concat([{ at: state._simNow != null ? state._simNow : ZI.clockNow(), reason: down ? 'noSafeSquare' : 'noPosition' }]); this.put(r); return null; } // E1
    const haul = (state.carried || []).filter(e => !ZI._haulIsStory(e));
    const carried = ZI.getCarried().filter(e => !ZI.isStoryItem(e.id));
    r.phase = 'trading';
    r.trade = { haul: haul.map(e => this._hk(e)), names: haul.map(e => e.name || e.id), carried: carried.map(e => ({ id: e.id, qty: e.qty })),
                carriedBefore: JSON.stringify(ZI.getCarried()), downAt: state._simNow != null ? state._simNow : ZI.clockNow(), down: { gx: down.gx, gy: down.gy } };
    r.camp = { gx: camp.gx, gy: camp.gy };
    this.put(r);                           // intent first (8d)
    this._finishTrade(r, state);
    return { kind: 'jesterDisplacement', forcedRetreat: true, cause: 'downed', destination: 'jesterCamp', eligible: haul.length, lost: r.trade.names.slice(),
             lostCount: haul.length, kept: null, banked: 0, scavenging: ZI.effectiveLevel('scavenging'), shaken: false, hp: state.hp, stress: ZI.getStress(), camp: { gx: camp.gx, gy: camp.gy } };
  },
  // Remove the traded items (story items never), move to the camp, rest there. Safe to redo after a reload.
  _finishTrade(r, liveState) {
    const apply = (s) => {
      const left = r.trade.haul.slice();
      s.carried = (s.carried || []).filter(e => { if (ZI._haulIsStory(e)) return true; const i = left.indexOf(this._hk(e)); if (i < 0) return true; left.splice(i, 1); return false; });
      if (!s.jesterCamp) {
        ZI.endRunState(s, 'jester');
        s.resting = true; s.restAt = 'camp'; s.restStartHp = Math.max(0, s.hp || 1); s.restElapsedMs = 0; s.jesterCamp = true;
      }
    };
    if (JSON.stringify(ZI.getCarried()) === r.trade.carriedBefore) {      // carried not yet reduced: reduce once
      const take = {}; r.trade.carried.forEach(e => { take[e.id] = (take[e.id] || 0) + e.qty; });
      const out = []; ZI.getCarried().forEach(e => { if (ZI.isStoryItem(e.id)) { out.push(e); return; } const t = Math.min(take[e.id] || 0, e.qty); take[e.id] = (take[e.id] || 0) - t; if (e.qty - t > 0) out.push(Object.assign({}, e, { qty: e.qty - t })); });
      ZI.saveCarried(out);
    }
    if (liveState) apply(liveState); else ZI.wanderAct(apply);
    const cell = ZI.worldCell(r.camp.gx, r.camp.gy, 'scavenge');
    ZI._wj('zi_trav_pos', ZI.zoneFromCell(cell));
    r.phase = 'resting'; this.put(r);
  },

  // ── U38a: waiting at the camp (called by WanderSim.advance at every step) ──
  waitStep(state) {
    if (!state.jesterCamp || state.resting) return false;
    const r = this.get();
    if (!r || !r.eligible || r.met || r.fallback || r.phase === 'done' || !this.on()) { state.jesterCamp = false; state.jesterWait = false; return false; }
    if (r.phase === 'resting') { r.phase = 'waiting'; this.put(r); }
    if (r.phase === 'waiting') { state.jesterWait = true; return true; }
    return false;
  },

  // ── Rewards: exactly once, in order, each placement guarded by an intent record ──
  _rewards(weaponId) {
    const T = this.TABLE, out = T.equip.map(e => ({ id: e.id, slot: e.slot }));
    if (weaponId) out.push({ id: weaponId, slot: 'melee' });
    T.carried.forEach(e => out.push({ id: e.id, to: 'carried', qty: e.qty }));
    T.stash.forEach(id => out.push({ id, to: 'stash' }));
    return out;
  },
  _place(g) {
    if (g.slot) { const lo = ZI.getLoadout(); if (!lo[g.slot]) { lo[g.slot] = g.id; ZI.saveLoadout(lo); } else ZI.grantGear(g.id, 1); return; } // B3: never replace
    if (g.to === 'carried') { ZI.saveCarried(ZI.getCarried().concat([{ id: g.id, qty: g.qty || 1 }])); return; }
    ZI.grantGear(g.id, g.qty || 1);
  },
  _placeOnce(r, g, doneKey) {             // intent + inventory signature: a redo never places twice
    if (r.inFlight && r.inFlight.key === doneKey) { if (r.inFlight.sig !== this._sig()) { r.inFlight = null; return true; } }
    else { r.inFlight = { key: doneKey, sig: this._sig() }; this.put(r); }
    this._place(g); r.inFlight = null; return true;
  },
  _grant(r) {
    r.granted = r.granted || [];
    r.grants.forEach((g, i) => { if (r.granted.includes(i)) return; this._placeOnce(r, g, 'g' + i); r.granted.push(i); this.put(r); });
    ZI._wj('zi_starter_kit_given', true);
    if (r.grantMode === 'meeting') {
      const T = this.TABLE, roll = ZI.roll ? ZI.roll() : Math.random();
      if (r.stayDays == null) r.stayDays = T.stayDaysMin + Math.min(T.stayDaysMax - T.stayDaysMin, Math.floor(roll * (T.stayDaysMax - T.stayDaysMin + 1)));
      if (r.meetAt == null) r.meetAt = ZI.clockNow();
      r.met = true;
    }
    r.phase = 'done'; delete r.grants; delete r.granted; this.put(r);
    ZI.wanderAct(s => { s.jesterWait = false; s.jesterCamp = false; });   // resume; an unfinished rest continues normally
  },

  // ── The meeting (JD1b's scene calls this with the player's choice; U38: never chosen for the player) ──
  meet(weaponId) {
    let r = this.get();
    if (!r || !r.eligible || r.met || r.fallback) return { ok: false, reason: 'No meeting is due.' };
    if (r.phase === 'granting') { this._grant(r); return { ok: true, resumed: true }; }   // a saved choice completes
    if (r.phase !== 'waiting' && r.phase !== 'resting') return { ok: false, reason: 'The survivor is not at the camp.' };
    if (!this.TABLE.weapons.includes(weaponId)) return { ok: false, reason: 'Choose one of the three weapons.' };
    r.phase = 'granting'; r.grantMode = 'meeting'; r.weapon = weaponId; r.grants = this._rewards(weaponId); r.granted = []; this.put(r);
    this._grant(this.get());
    return { ok: true, weapon: weaponId };
  },
  campActive(now) { const r = this.get(); return !!(r && r.met && r.meetAt != null && (now == null ? ZI.clockNow() : now) < r.meetAt + r.stayDays * this.TABLE.dayMs); },

  // ── B5: switch off with an eligible save ──
  fallback() {
    let r = this.get(); if (!r || !r.eligible || r.fallback || r.phase === 'done') return false;
    const from = r.phase || 'notStarted', at = ZI.clockNow();
    if (!r.phase) {                        // trade not started: permanently exempt, existing kit once
      r.eligible = false; r.exempt = 'switchOff'; r.fallback = { at, from }; this.put(r); ZI.ensureStarterKit();
      ZI.wanderAct(s => { s.jesterWait = false; s.jesterCamp = false; }); return true;
    }
    if (r.phase === 'trading') { this._finishTrade(r); r = this.get(); }
    r.fallback = { at, from };
    if (r.phase !== 'granting') { r.phase = 'granting'; r.grantMode = 'fallback'; r.grants = this._rewards(null); r.granted = []; r.weaponOwed = true; } // G2
    this.put(r); this._grant(this.get());
    return true;
  },

  // ── G2: an owed weapon (JD1b offers only this choice) ──
  chooseOwedWeapon(weaponId) {
    const r = this.get(); if (!r || !r.weaponOwed) return { ok: false, reason: 'No weapon is owed.' };
    if (r.weaponPending) { this._finishPendingWeapon(); return { ok: true, weapon: r.weaponPending, resumed: true }; } // a saved choice completes
    if (!this.TABLE.weapons.includes(weaponId)) return { ok: false, reason: 'Choose one of the three weapons.' };
    r.weaponPending = weaponId; this.put(r);
    this._finishPendingWeapon();
    return { ok: true, weapon: weaponId };
  },
  _finishPendingWeapon() {
    const r = this.get(); if (!r || !r.weaponOwed || !r.weaponPending) return false;
    this._placeOnce(r, { id: r.weaponPending, slot: 'melee' }, 'w');
    r.weapon = r.weaponPending; r.weaponOwed = false; r.weaponPending = null; this.put(r);
    return true;
  },
};
