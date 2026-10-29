// game/character.js — Survivor creation shown on New Game (Sam, Oct 29: "establish the character creation page").
// Source: Google Doc "Zed Idler — Character Creation Instructions (Draft)", Oct 28. Four steps: survivor (Male/Female),
// appearance, profession ("What were you before?"), review ("Start Surviving"). Loaded after game/camp.js data.
//
// Rules kept from the draft:
// • Gender changes the art only. No gender stat bonus (that idea was cancelled).
// • Appearance is cosmetic: no stat effects and no bonus (Sam, Oct 29: option A, looks only).
// • Professions are the existing starting archetypes (ZI.LEADER_ARCHETYPES, game/camp.js) with their existing starting
//   profession XP. No new values. Flavour lines are display text only.
// • The survivor is created only after the player confirms.
ZI.SURVIVOR_PROFILE_KEY = 'zi_survivor_profile';
ZI.CHAR_CREATION = {
  version: 2,
  defaultName: 'Yael Strom',
  genders: [
    { id: 'male',   label: 'Male',   art: { src: 'assets/wandering-characters/survivor-injured-strike-male-v1.png',   size: '400% 400%' } },
    { id: 'female', label: 'Female', art: { src: 'assets/wandering-characters/survivor-injured-strike-female-v1.png', size: '400% 200%' } },
  ],
  // Appearance (Sam, Oct 29 by voice): many hairstyles, hair colours, outfits, clothing colours, piercings and more
  // accessories. LOOKS ONLY: no stat bonus (Sam chose option A). `preview: true` groups change the portrait today; the
  // others are saved with the survivor and will be drawn once layered hair / outfit / piercing art exists.
  appearance: {
    hair:          { label: 'Hairstyle',       options: [{ id: 'hooded', label: 'Under the hood' }, { id: 'buzz', label: 'Buzz cut' }, { id: 'short', label: 'Cropped short' }, { id: 'undercut', label: 'Undercut' }, { id: 'mohawk', label: 'Mohawk' }, { id: 'shaggy', label: 'Shaggy' }, { id: 'curly', label: 'Curly' }, { id: 'afro', label: 'Afro' }, { id: 'braids', label: 'Braids' }, { id: 'long', label: 'Long, tied back' }, { id: 'loose', label: 'Long and loose' }, { id: 'bald', label: 'Shaved bald' }] },
    hairColor:     { label: 'Hair colour',     options: [{ id: 'black', label: 'Black', swatch: '#1c1a19' }, { id: 'darkbrown', label: 'Dark brown', swatch: '#3b2a20' }, { id: 'chestnut', label: 'Chestnut', swatch: '#6b4128' }, { id: 'auburn', label: 'Auburn', swatch: '#8a3b22' }, { id: 'ginger', label: 'Ginger', swatch: '#b8642e' }, { id: 'blonde', label: 'Dirty blonde', swatch: '#b89a5e' }, { id: 'platinum', label: 'Platinum', swatch: '#ddd6c2' }, { id: 'grey', label: 'Grey', swatch: '#8a8a86' }, { id: 'white', label: 'White', swatch: '#eeeeea' }, { id: 'bluedye', label: 'Faded blue dye', swatch: '#4f6f9a' }] },
    clothing:      { label: 'Clothing',        options: [{ id: 'field', label: 'Field jacket' }, { id: 'hoodie', label: 'Hoodie' }, { id: 'leather', label: 'Leather jacket' }, { id: 'coveralls', label: 'Work coveralls' }, { id: 'flannel', label: 'Flannel and jeans' }, { id: 'puffer', label: 'Puffer vest' }, { id: 'trench', label: 'Trench coat' }, { id: 'scrubs', label: 'Hospital scrubs' }, { id: 'tracksuit', label: 'Tracksuit' }, { id: 'hivis', label: 'Hi-vis work gear' }, { id: 'poncho', label: 'Rain poncho' }, { id: 'rags', label: 'Patched-up rags' }] },
    clothingColor: { label: 'Clothing colour', preview: true, options: [{ id: 'olive', label: 'Olive drab', filter: 'none', swatch: '#5b5f3a' }, { id: 'ash', label: 'Ash grey', filter: 'saturate(0.3) brightness(0.95)', swatch: '#7c7c78' }, { id: 'rust', label: 'Rust brown', filter: 'sepia(0.45) saturate(1.2) hue-rotate(-12deg)', swatch: '#8a4a2a' }, { id: 'navy', label: 'Navy', filter: 'hue-rotate(160deg) saturate(0.8) brightness(0.8)', swatch: '#25304d' }, { id: 'black', label: 'Black', filter: 'grayscale(1) brightness(0.6)', swatch: '#1e1e1e' }, { id: 'tan', label: 'Desert tan', filter: 'sepia(0.6) brightness(1.1)', swatch: '#b59a6a' }, { id: 'forest', label: 'Forest green', filter: 'hue-rotate(25deg) saturate(1.3) brightness(0.85)', swatch: '#2f4a2a' }, { id: 'burgundy', label: 'Burgundy', filter: 'hue-rotate(-80deg) saturate(1.2) brightness(0.8)', swatch: '#5e1f2a' }, { id: 'orange', label: 'Hunter orange', filter: 'sepia(0.8) saturate(2.5) hue-rotate(-15deg)', swatch: '#d0641e' }, { id: 'denim', label: 'Faded denim', filter: 'hue-rotate(150deg) saturate(0.6)', swatch: '#5a7290' }] },
    scars:         { label: 'Scars',           options: [{ id: 'none', label: 'None' }, { id: 'brow', label: 'Split brow' }, { id: 'cheek', label: 'Cheek gash' }, { id: 'lip', label: 'Scarred lip' }, { id: 'neck', label: 'Bite scar on the neck' }, { id: 'burn', label: 'Burn scar' }] },
    piercings:     { label: 'Piercings',       options: [{ id: 'none', label: 'None' }, { id: 'earstuds', label: 'Ear studs' }, { id: 'earhoops', label: 'Ear hoops' }, { id: 'industrial', label: 'Industrial bar' }, { id: 'gauges', label: 'Gauged ears' }, { id: 'brow', label: 'Eyebrow ring' }, { id: 'nosestud', label: 'Nose stud' }, { id: 'septum', label: 'Septum ring' }, { id: 'lip', label: 'Lip ring' }, { id: 'tongue', label: 'Tongue bar' }, { id: 'navel', label: 'Navel ring' }] },
    accessories:   { label: 'Accessories',     options: [{ id: 'none', label: 'None' }, { id: 'bandana', label: 'Bandana' }, { id: 'goggles', label: 'Old goggles' }, { id: 'cap', label: 'Baseball cap' }, { id: 'beanie', label: 'Beanie' }, { id: 'gasmask', label: 'Gas mask' }, { id: 'shades', label: 'Aviator shades' }, { id: 'dogtags', label: 'Dog tags' }, { id: 'watch', label: 'Wristwatch' }, { id: 'gloves', label: 'Fingerless gloves' }, { id: 'headlamp', label: 'Headlamp' }, { id: 'scarf', label: 'Scarf' }] },
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
// A profile is { v, gender, appearance:{hair,hairColor,clothing,clothingColor,scars,piercings,accessories}, profession, name, createdAt }.
ZI.validSurvivorProfile = function(p) {
  const C = ZI.CHAR_CREATION;
  if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
  if (!C.genders.some(g => g.id === p.gender)) return null;
  const src = Object.assign({}, p.appearance && typeof p.appearance === 'object' && !Array.isArray(p.appearance) ? p.appearance : {}), app = {};
  // Version 1 profiles stored the colour (olive / ash / rust) under `clothing`; carry it over to clothingColor.
  if (!src.clothingColor && ['olive', 'ash', 'rust'].indexOf(src.clothing) >= 0) { src.clothingColor = src.clothing; delete src.clothing; }
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
