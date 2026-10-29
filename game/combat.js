// game/combat.js — Zombie discovery, combat simulation.
// Split from game-data.js (archived at archive/legacy/game-data.js). Load order: see Zombie Idler v2.html.
// Everything attaches to the shared global ZI object; load-time calls live in game/bootstrap.js.
// The old ZI.ZOMBIE_CODEX stat table had no readers (the Codex screen uses ZI.BESTIARY from bestiary-data.js);
// it was moved to reference/design-notes.js in change 4.


// ─── ZOMBIE DISCOVERY (codex unlock persistence) ────────────────────────────
ZI.DISCOVERY_KEY = 'zi_discovered_zombies';
ZI.getDiscovered = function() {
  try { return new Set(JSON.parse(localStorage.getItem(ZI.DISCOVERY_KEY) || '[]')); }
  catch (e) { return new Set(); }
};
ZI.discoverZombie = function(id) {
  if (!id) return false;
  const set = ZI.getDiscovered();
  if (set.has(id)) return false;
  set.add(id);
  try { localStorage.setItem(ZI.DISCOVERY_KEY, JSON.stringify([...set])); } catch (e) {}
  if (ZI.emitAction) ZI.emitAction('discover', 0.5); // codex unlock feeds Discovery
  return true;
};
ZI.isDiscovered = function(id) { return ZI.getDiscovered().has(id); };

// Full-fight resolution — both modes share this core (idle runs it to completion).
ZI.simulateCombat = function(survivor, enemy, mode, rng) {
  rng = rng || Math.random; // injectable random source (spec 10)
  const F = ZI.STAT_FORMULAS;
  const s = Object.assign({}, survivor), e = Object.assign({}, enemy);
  const log = [];
  let rounds = 0, dmgDealt = 0;
  const sFirst = (s.initiative || 0) >= (e.initiative || 0);
  while (s.hp > 0 && e.hp > 0 && rounds < 100) {
    rounds++;
    const order = sFirst ? [[s, e, true], [e, s, false]] : [[e, s, false], [s, e, true]];
    for (const [atk, def, isSurv] of order) {
      if (atk.hp <= 0 || def.hp <= 0) continue;
      const r = F.resolveAttack(atk, def, rng);
      if (isSurv && r.dealt) dmgDealt += r.dealt;
      log.push({ by: isSurv ? 'survivor' : 'enemy', ...r });
    }
  }
  const outcome = e.hp <= 0 ? 'win' : s.hp <= 0 ? 'downed' : 'flee';
  return { outcome, rounds, dmgDealt, hpLeft: Math.max(0, s.hp), enemyXp: enemy.xp || 10, log };
};
