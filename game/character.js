// game/character.js — Survivor creation shown on New Game (Sam, Oct 29: "establish the character creation page").
// Source: Google Doc "Zed Idler — Character Creation Instructions (Draft)", Oct 28. Four steps: survivor (Male/Female),
// appearance, profession ("What were you before?"), review ("Start Surviving"). Loaded after game/camp.js data.
//
// Rules kept from the draft:
// • Gender changes the art only. No gender stat bonus (that idea was cancelled).
// • Appearance options are PLACEHOLDERS (the draft leaves the exact options open) and are cosmetic: no stat effects,
//   so no bonus cue is shown. Add a bonus here only after Sam approves one.
// • Professions are the existing starting archetypes (ZI.LEADER_ARCHETYPES, game/camp.js) with their existing starting
//   profession XP. No new values. Flavour lines are display text only.
// • The survivor is created only after the player confirms.
ZI.SURVIVOR_PROFILE_KEY = 'zi_survivor_profile';
ZI.CHAR_CREATION = {
  version: 1,
  defaultName: 'Yael Strom',
  genders: [
    { id: 'male',   label: 'Male',   art: { src: 'assets/wandering-characters/survivor-injured-strike-male-v1.png',   size: '400% 400%' } },
    { id: 'female', label: 'Female', art: { src: 'assets/wandering-characters/survivor-injured-strike-female-v1.png', size: '400% 200%' } },
  ],
  // PLACEHOLDER appearance options (draft: "exact options remain to be defined"). Cosmetic only.
  appearance: {
    hair:        { label: 'Hair',        options: [{ id: 'hooded', label: 'Under the hood' }, { id: 'short', label: 'Cropped short' }, { id: 'long', label: 'Long, tied back' }] },
    clothing:    { label: 'Clothing',    options: [{ id: 'olive', label: 'Olive drab', filter: 'none' }, { id: 'ash', label: 'Ash grey', filter: 'saturate(0.3) brightness(0.95)' }, { id: 'rust', label: 'Rust brown', filter: 'sepia(0.45) saturate(1.2) hue-rotate(-12deg)' }] },
    scars:       { label: 'Scars',       options: [{ id: 'none', label: 'None' }, { id: 'brow', label: 'Split brow' }, { id: 'cheek', label: 'Cheek gash' }] },
    accessories: { label: 'Accessories', options: [{ id: 'none', label: 'None' }, { id: 'bandana', label: 'Bandana' }, { id: 'goggles', label: 'Old goggles' }] },
  },
  // Display text for the existing archetypes. Mechanics come from ZI.LEADER_ARCHETYPES[].start (starting XP).
  professionText: {
    vanguard: { title: 'Vanguard', blurb: 'Security, soldiering, the hard jobs.', flavor: 'You held the line when the barricades fell.' },
    forager:  { title: 'Forager',  blurb: 'Hunting, gathering, knowing what is safe to take.', flavor: 'You always knew where the food was.' },
    artisan:  { title: 'Artisan',  blurb: 'Building, fixing, making do with scrap.', flavor: 'Give you a toolbox and a bad day, and something gets built.' },
    envoy:    { title: 'Envoy',    blurb: 'Talking people round, keeping groups together.', flavor: 'Words got you through doors that guns could not.' },
  },
};
ZI.charProfessions = function() {
  return (ZI.LEADER_ARCHETYPES || []).map(a => {
    const t = ZI.CHAR_CREATION.professionText[a.id] || { title: a.name, blurb: a.lean, flavor: '' };
    const effects = Object.entries(a.start || {}).map(([prof, xp]) => {
      const p = (ZI.PROFESSIONS || []).find(x => x.id === prof);
      return { prof, name: p ? p.name : prof, xp };
    });
    return { id: a.id, icon: a.icon, title: t.title, blurb: t.blurb, flavor: t.flavor, lean: a.lean, effects };
  });
};
ZI.charDefaultAppearance = function() { const out = {}; Object.entries(ZI.CHAR_CREATION.appearance).forEach(([k, c]) => { out[k] = c.options[0].id; }); return out; };
// A profile is { v, gender, appearance:{hair,clothing,scars,accessories}, profession, name, createdAt }.
ZI.validSurvivorProfile = function(p) {
  const C = ZI.CHAR_CREATION;
  if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
  if (!C.genders.some(g => g.id === p.gender)) return null;
  const app = {}, src = p.appearance && typeof p.appearance === 'object' ? p.appearance : {};
  Object.entries(C.appearance).forEach(([k, c]) => { app[k] = c.options.some(o => o.id === src[k]) ? src[k] : c.options[0].id; });
  const prof = (ZI.LEADER_ARCHETYPES || []).some(a => a.id === p.profession) ? p.profession : null;
  const name = typeof p.name === 'string' && p.name.trim() ? p.name.trim().slice(0, 24) : C.defaultName;
  return { v: C.version, gender: p.gender, appearance: app, profession: prof, name, createdAt: Number(p.createdAt) || Date.now() };
};
ZI.getSurvivorProfile = function() { return ZI.validSurvivorProfile(ZI._rj(ZI.SURVIVOR_PROFILE_KEY, null)); };
// Called by ZI.startNewInSlot after the fresh save is set up, before the file is written. Returns the saved profile.
ZI.applySurvivorProfile = function(raw) {
  const p = ZI.validSurvivorProfile(raw); if (!p) return null;
  ZI._wj(ZI.SURVIVOR_PROFILE_KEY, p);
  if (p.profession && ZI.chooseLeader && !(ZI.leaderChosen && ZI.leaderChosen())) ZI.chooseLeader(p.profession, p.name); // existing starting-XP seed
  return p;
};
