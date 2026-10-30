// game/character.js — Survivor creation shown on New Game (Sam, Oct 29: "establish the character creation page").
// Source: Google Doc "Zed Idler — Character Creation Instructions (Draft)", Oct 28. Four steps: survivor (Male/Female),
// appearance, profession ("What were you before?"), review ("Start Surviving"). Loaded after game/camp.js data.
//
// Rules kept from the draft:
// • Gender changes the art only. No gender stat bonus (that idea was cancelled).
// • Appearance is cosmetic: no stat effects and no bonus (Sam, Oct 29: option A, looks only).
// • Old-world backgrounds use ZI.LEADER_ARCHETYPES starting XP. Flavour lines are display text only.
// • The survivor is created only after the player confirms.
ZI.SURVIVOR_PROFILE_KEY = 'zi_survivor_profile';
ZI.CHAR_CREATION = {
  version: 3,
  defaultName: 'Yael Strom',
  genders: [
    { id: 'male',   label: 'Male',   art: { src: 'assets/wandering-characters/creation-male-v1.png', walk:'assets/wandering-characters/creation-male-walk-v2.png', walkCols:4, walkRows:4, walkAspect:1.2326 } },
    { id: 'female', label: 'Female', art: { src: 'assets/wandering-characters/creation-female-v1.png', walk:'assets/wandering-characters/creation-female-walk-v2.png', walkCols:4, walkRows:4, walkAspect:1.2250 } },
  ],
  // Appearance is cosmetic. The layered character sprite previews each category separately.
  appearance: {
    hair:          { label: 'Hairstyle',       options: [{ id: 'hooded', label: 'Under the hood' }, { id: 'buzz', label: 'Buzz cut' }, { id: 'short', label: 'Cropped short' }, { id: 'undercut', label: 'Undercut' }, { id: 'mohawk', label: 'Mohawk' }, { id: 'shaggy', label: 'Shaggy' }, { id: 'curly', label: 'Curly' }, { id: 'afro', label: 'Afro' }, { id: 'braids', label: 'Braids' }, { id: 'long', label: 'Long, tied back' }, { id: 'loose', label: 'Long and loose' }, { id: 'bald', label: 'Shaved bald' }, { id:'topknot', label:'Topknot' }, { id:'sidecut', label:'Side cut' }, { id:'locs', label:'Locs' }] },
    hairColor:     { label: 'Hair colour',     options: [{ id: 'black', label: 'Black', swatch: '#1c1a19' }, { id: 'darkbrown', label: 'Dark brown', swatch: '#3b2a20' }, { id: 'chestnut', label: 'Chestnut', swatch: '#6b4128' }, { id: 'auburn', label: 'Auburn', swatch: '#8a3b22' }, { id: 'ginger', label: 'Ginger', swatch: '#b8642e' }, { id: 'blonde', label: 'Dirty blonde', swatch: '#b89a5e' }, { id: 'platinum', label: 'Platinum', swatch: '#ddd6c2' }, { id: 'grey', label: 'Grey', swatch: '#8a8a86' }, { id: 'white', label: 'White', swatch: '#eeeeea' }, { id: 'bluedye', label: 'Faded blue dye', swatch: '#4f6f9a' }, {id:'pinkdye',label:'Faded pink dye',swatch:'#a77385'}, {id:'greendye',label:'Faded green dye',swatch:'#6e8c6b'}] },
    clothing:      { label: 'Clothing',        options: [{ id: 'field', label: 'Field jacket' }, { id: 'hoodie', label: 'Hoodie' }, { id: 'leather', label: 'Leather jacket' }, { id: 'coveralls', label: 'Work coveralls' }, { id: 'flannel', label: 'Flannel and jeans' }, { id: 'puffer', label: 'Puffer vest' }, { id: 'trench', label: 'Trench coat' }, { id: 'scrubs', label: 'Hospital scrubs' }, { id: 'tracksuit', label: 'Tracksuit' }, { id: 'hivis', label: 'Hi-vis work gear' }, { id: 'poncho', label: 'Rain poncho' }, { id: 'rags', label: 'Patched-up rags' }, {id:'bomber',label:'Bomber jacket'}, {id:'workshirt',label:'Work shirt'}] },
    skinTone: { label:'Skin tone', options:[{ id:'fair',label:'Fair',swatch:'#efba96' },{ id:'light',label:'Light',swatch:'#d79c74' },{ id:'medium',label:'Medium',swatch:'#ac6f4c' },{ id:'olive',label:'Olive',swatch:'#9a7553' },{ id:'brown',label:'Brown',swatch:'#71452e' },{ id:'deep',label:'Deep',swatch:'#4c3028' }] },
    jacketColor: { label:'Jacket or hoodie colour', options:[{id:'olive',label:'Olive',swatch:'#626448'},{id:'ash',label:'Ash grey',swatch:'#737571'},{id:'rust',label:'Rust',swatch:'#955a3c'},{id:'navy',label:'Navy',swatch:'#354967'},{id:'black',label:'Black',swatch:'#292a2e'},{id:'tan',label:'Tan',swatch:'#b39b71'},{id:'forest',label:'Forest',swatch:'#3b583b'},{id:'burgundy',label:'Burgundy',swatch:'#6d3b4e'},{id:'orange',label:'Orange',swatch:'#bd6b2b'},{id:'denim',label:'Denim',swatch:'#617d96'}] },
    shirtColor: { label:'Shirt colour', options:[{id:'charcoal',label:'Charcoal',swatch:'#303238'},{id:'white',label:'Off-white',swatch:'#ddd7c8'},{id:'red',label:'Red',swatch:'#953b35'},{id:'blue',label:'Blue',swatch:'#416080'},{id:'green',label:'Green',swatch:'#49664d'},{id:'black',label:'Black',swatch:'#18191b'}] },
    pantsColor: { label:'Pants colour', options:[{id:'olive',label:'Olive',swatch:'#68674a'},{id:'black',label:'Black',swatch:'#292a2c'},{id:'denim',label:'Denim',swatch:'#4c657c'},{id:'tan',label:'Tan',swatch:'#a48b65'},{id:'grey',label:'Grey',swatch:'#747574'},{id:'brown',label:'Brown',swatch:'#72533f'}] },
    bootsColor: { label:'Boots colour', options:[{id:'brown',label:'Brown',swatch:'#674533'},{id:'black',label:'Black',swatch:'#28292b'},{id:'tan',label:'Tan',swatch:'#a88359'},{id:'grey',label:'Grey',swatch:'#66686a'}] },
    gloves: { label:'Gloves', options:[{id:'fingerless',label:'Fingerless gloves'},{id:'none',label:'Bare hands'},{id:'full',label:'Full gloves'}] },
    scars:         { label: 'Scars',           options: [{ id: 'none', label: 'None' }, { id: 'brow', label: 'Split brow' }, { id: 'cheek', label: 'Cheek gash' }, { id: 'lip', label: 'Scarred lip' }, { id: 'neck', label: 'Bite scar on the neck' }, { id: 'burn', label: 'Burn scar' }, {id:'bridge',label:'Nose bridge scar'}, {id:'jaw',label:'Jaw scar'}] },
    piercings:     { label: 'Piercings',       options: [{ id: 'none', label: 'None' }, { id: 'earstuds', label: 'Ear studs' }, { id: 'earhoops', label: 'Ear hoops' }, { id: 'industrial', label: 'Industrial bar' }, { id: 'gauges', label: 'Gauged ears' }, { id: 'brow', label: 'Eyebrow ring' }, { id: 'nosestud', label: 'Nose stud' }, { id: 'septum', label: 'Septum ring' }, { id: 'lip', label: 'Lip ring' }, { id: 'tongue', label: 'Tongue bar' }, { id: 'navel', label: 'Navel ring' }, {id:'doubleear',label:'Double ear studs'}] },
    accessories:   { label: 'Accessories',     options: [{ id: 'none', label: 'None' }, { id: 'bandana', label: 'Bandana' }, { id: 'goggles', label: 'Old goggles' }, { id: 'cap', label: 'Baseball cap' }, { id: 'beanie', label: 'Beanie' }, { id: 'gasmask', label: 'Gas mask' }, { id: 'shades', label: 'Aviator shades' }, { id: 'dogtags', label: 'Dog tags' }, { id: 'watch', label: 'Wristwatch' }, { id: 'gloves', label: 'Fingerless gloves' }, { id: 'headlamp', label: 'Headlamp' }, { id: 'scarf', label: 'Scarf' }, {id:'eyepatch',label:'Eye patch'}, {id:'bandolier',label:'Bandolier'}] },
  },
  // Display text for the old-world backgrounds. Mechanics come from ZI.LEADER_ARCHETYPES[].start.
  professionText: {
    vanguard: { title: 'Vanguard', blurb: 'Security, soldiering, the hard jobs.', flavor: 'You held the line when the barricades fell.' },
    forager:  { title: 'Forager',  blurb: 'Hunting, gathering, knowing what is safe to take.', flavor: 'You always knew where the food was.' },
    artisan:  { title: 'Artisan',  blurb: 'Building, fixing, making do with scrap.', flavor: 'Give you a toolbox and a bad day, and something gets built.' },
    envoy:    { title: 'Envoy',    blurb: 'Talking people round, keeping groups together.', flavor: 'Words got you through doors that guns could not.' },
    paramedic: { title:'Paramedic', blurb:'Emergency care under pressure.', flavor:'You knew which seconds mattered.' },
    mechanic: { title:'Mechanic', blurb:'Engines, repairs and improvised fixes.', flavor:'Nothing stayed broken if you had parts.' },
    ranger: { title:'Park Ranger', blurb:'Trails, wildlife and reading terrain.', flavor:'The wilderness was once your workplace.' },
    courier: { title:'Courier', blurb:'Fast routes and careful deliveries.', flavor:'You always found another way through.' },
    firefighter: { title:'Firefighter', blurb:'Rescue work and long, dangerous shifts.', flavor:'You ran toward the smoke.' },
    librarian: { title:'Librarian', blurb:'Research, records and finding answers.', flavor:'You remembered where everything was.' },
    electrician: { title:'Electrician', blurb:'Power systems and field repairs.', flavor:'A dead circuit was a solvable problem.' },
    farmer: { title:'Farmer', blurb:'Growing food and enduring hard seasons.', flavor:'You knew how to make land yield.' },
    chef: { title:'Chef', blurb:'Making safe meals from scarce ingredients.', flavor:'You could feed a room with almost nothing.' },
    teacher: { title:'Teacher', blurb:'Explaining, organising and leading a group.', flavor:'You kept people learning when it was hard.' },
    trader: { title:'Trader', blurb:'Prices, negotiation and useful contacts.', flavor:'You knew the value of a fair deal.' },
    surveyor: { title:'Surveyor', blurb:'Maps, measurements and unfamiliar ground.', flavor:'You could find a path from a few landmarks.' },
    carpenter: { title:'Carpenter', blurb:'Structures, tools and durable repairs.', flavor:'You built things meant to last.' },
    nurse: { title:'Nurse', blurb:'Care, treatment and steady hands.', flavor:'You stayed calm when someone needed help.' },
    dispatcher: { title:'Dispatcher', blurb:'Coordinating crews and keeping routes clear.', flavor:'You could make order from noise.' },
    athlete: { title:'Athlete', blurb:'Conditioning, speed and endurance.', flavor:'Training was already your daily work.' },
    locksmith: { title:'Locksmith', blurb:'Locks, mechanisms and quiet entry.', flavor:'You understood how every door opened.' },
    journalist: { title:'Journalist', blurb:'Investigation, interviews and observation.', flavor:'You asked questions others missed.' },
    salvager: { title:'Salvager', blurb:'Recovering useful parts from discarded gear.', flavor:'You saw possibility in scrap.' },
    coordinator: { title:'Coordinator', blurb:'Schedules, people and negotiation.', flavor:'You kept a whole operation moving.' },
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
// A profile stores gender, appearance choices, old-world background, name, and creation time.
ZI.validSurvivorProfile = function(p) {
  const C = ZI.CHAR_CREATION;
  if (!p || typeof p !== 'object' || Array.isArray(p)) return null;
  if (!C.genders.some(g => g.id === p.gender)) return null;
  const src = Object.assign({}, p.appearance && typeof p.appearance === 'object' && !Array.isArray(p.appearance) ? p.appearance : {}), app = {};
  // Older profiles stored the jacket colour as `clothing` or `clothingColor`.
  // The current model calls that component `jacketColor`; discard the legacy keys after migration.
  const legacyJacketColor = src.clothingColor || (['olive', 'ash', 'rust'].includes(src.clothing) ? src.clothing : null);
  if (!src.jacketColor && legacyJacketColor) src.jacketColor = legacyJacketColor;
  if (legacyJacketColor && src.clothing === legacyJacketColor) delete src.clothing;
  delete src.clothingColor;
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
