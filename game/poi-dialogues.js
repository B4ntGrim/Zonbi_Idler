// Specialized Traversal square dialogue and action catalog.
// Interactions that do not yet have game systems return descriptive dialogue only.
ZI.POI_DIALOGUES = [
  { id:'police-station', name:'Police Station', icon:'🚔', arrival:'The front doors hang open. Scrapes across the tile suggest someone got here first.', options:[
    { label:'Check the front desk', icon:'⌕', text:'A duty roster is half-buried under broken glass. The armory is deeper inside; movement echoes from that direction.' },
    { label:'Search for a firearm', icon:'🔫', kind:'enter', text:'Enter Wandering to search the station. A firearm is not guaranteed; the search resolves through the existing idle visit and return report.' },
    { label:'Scout the perimeter', icon:'👁', kind:'scout' }
  ]},
  { id:'pharmacy', name:'Pharmacy', icon:'⚕️', arrival:'Medicine shelves, a counter, and whoever may still be working here shape what you can safely do.', options:[
    { label:'Scavenge supplies', icon:'◈', kind:'loot', text:'Search the shelves. At a neutral pharmacy, taking supplies costs reputation with every faction; exact loot chances and penalties remain for balance review.' },
    { label:'Ask about help or a task', icon:'💬', text:'A pharmacist may offer a request once trust is established. A Diplomat check may open an early offer; trading and conversation remain available either way.' },
    { label:'Enter the pharmacy', icon:'➜', kind:'enter' }
  ]},
  { id:'grocery-store', name:'Grocery Store', icon:'🥫', arrival:'The aisles are picked over, but food, useful scraps, and rumors may remain.', options:[
    { label:'Search the aisles', icon:'◈', kind:'loot' },
    { label:'Ask about traders and routes', icon:'💬', text:'A survivor may trade for RMAT or share a rough lead about food caches, traders, or routes. Exact stock and prices are undecided.' },
    { label:'Enter the store', icon:'➜', kind:'enter' }
  ]},
  { id:'gas-station', name:'Gas Station', icon:'⛽', arrival:'The pumps are silent. The forecourt is exposed, and anything useful may draw attention.', options:[
    { label:'Search the shop', icon:'◈', kind:'loot' },
    { label:'Check the pumps and tanks', icon:'⛽', text:'You inspect the fuel equipment from cover. Whether fuel can be recovered here depends on systems still to be defined.' },
    { label:'Scout the forecourt', icon:'👁', kind:'scout' }
  ]},
  { id:'laundromat', name:'Laundromat', icon:'🧺', arrival:'Rows of washers and abandoned baskets offer a place to clean clothing—or find supplies for doing it elsewhere.', options:[
    { label:'Look for laundry supplies', icon:'◈', kind:'loot' },
    { label:'Check the machines', icon:'🧺', text:'The machines may support washing clothing in a future upkeep system. For now, you can inspect the site and gather ordinary supplies.' },
    { label:'Enter the laundromat', icon:'➜', kind:'enter' }
  ]},
  { id:'hardware-store', name:'Hardware Store', icon:'🔧', arrival:'Aisles of tools and repair materials disappear into a dim back room.', options:[
    { label:'Search for tools and parts', icon:'◈', kind:'loot' },
    { label:'Inspect the workbench', icon:'🔧', text:'The workbench is intact, though its repair services are not yet active.' },
    { label:'Enter the store', icon:'➜', kind:'enter' }
  ]},
  { id:'library', name:'Library', icon:'📚', arrival:'Maps, local records, and handwritten notes are scattered between the shelves.', options:[
    { label:'Search the records', icon:'⌕', text:'You find partial references to nearby streets and landmarks. Any route clue would need investigation before it becomes a known location.' },
    { label:'Look for local history', icon:'📖', text:'Old notices hint at who used this neighborhood and what changed before the outbreak.' },
    { label:'Scout the building', icon:'👁', kind:'scout' }
  ]},
  { id:'community-shelter', name:'Community Shelter', icon:'🏠', arrival:'People gather here when circumstances allow. The encounter and what they share are uncertain.', options:[
    { label:'Approach the people', icon:'💬', text:'A shelter encounter may offer a rough lead, faction news, or a unique request. A fitting Diplomat or Command response can make a clue more specific.' },
    { label:'Ask about a route or supply request', icon:'🗺', text:'Requests vary by person. Escort, delivery, and rescue leads are individual stories, not guaranteed rewards.' },
    { label:'Scout the shelter', icon:'👁', kind:'scout' }
  ]},
  { id:'water-treatment-plant', name:'Water Treatment Plant', icon:'💧', arrival:'The city plant is built for a larger population than the few people who may still protect it.', options:[
    { label:'Inspect the treatment works', icon:'💧', text:'You look over the plant from the entrance. Its services and carried-water options remain parked for later design.' },
    { label:'Search the grounds', icon:'◈', kind:'loot' },
    { label:'Scout the perimeter', icon:'👁', kind:'scout' }
  ]},
  { id:'fire-station', name:'Fire Station', icon:'🚒', arrival:'The bay doors are partly raised. Rescue gear may be inside, but the building is hard to approach unseen.', options:[
    { label:'Search the equipment bay', icon:'◈', kind:'loot' },
    { label:'Check the dispatch board', icon:'⌕', text:'A faded call board marks old incidents and blocked streets. Any useful lead is only a clue, not a revealed map location.' },
    { label:'Scout the entrance', icon:'👁', kind:'scout' }
  ]},
  { id:'transit-depot', name:'Transit Depot', icon:'🚌', arrival:'Idle buses and route maps crowd the depot. The place may reveal how to move through the city.', options:[
    { label:'Search the depot', icon:'◈', kind:'loot' },
    { label:'Read the route board', icon:'🗺', text:'You piece together a rough direction from the damaged transit map. It does not mark an exact destination.' },
    { label:'Scout the platforms', icon:'👁', kind:'scout' }
  ]},
  { id:'school', name:'School', icon:'🏫', arrival:'Classrooms stand open, with supplies and personal traces left behind.', options:[
    { label:'Search the classrooms', icon:'◈', kind:'loot' },
    { label:'Check the noticeboard', icon:'⌕', text:'Old notices and evacuation notes may offer context about nearby people and places.' },
    { label:'Scout the grounds', icon:'👁', kind:'scout' }
  ]},
  { id:'office-building', name:'Office Building', icon:'🏢', arrival:'The lobby is quiet. A directory and several floors of offices remain to be searched.', options:[
    { label:'Search the offices', icon:'◈', kind:'loot' },
    { label:'Check the directory', icon:'⌕', text:'The directory identifies businesses once housed here; it may help interpret a future clue.' },
    { label:'Scout the lobby', icon:'👁', kind:'scout' }
  ]},
  { id:'scrapyard', name:'Scrapyard', icon:'♻️', arrival:'Metal heaps create cover and blind spots. Useful parts may be buried among the wreckage.', options:[
    { label:'Search for salvage', icon:'◈', kind:'loot' },
    { label:'Inspect the dismantled vehicles', icon:'🔩', text:'You spot parts that could be useful for repair or processing, though that specialized salvage system is not active here yet.' },
    { label:'Scout the yard', icon:'👁', kind:'scout' }
  ]}
];
// Sprite atlas order: 4 columns by 4 rows. The first 14 entries match this catalog;
// row 4 also contains a fortified outpost and a field water station.
ZI.POI_DIALOGUES.forEach((site, index) => { site.sprite = { col:index % 4, row:Math.floor(index / 4) }; });
ZI.POI_SPRITE_ATLAS = 'art/traversal-poi-sprites-v2.png';
ZI.poiSiteForCell = function(cell) {
  if (!cell) return null;
  const id = cell.poiType || '';
  const byId = ZI.POI_DIALOGUES.find(p => p.id === id);
  if (byId) return byId;
  const base = String(cell.name || '').replace(/\s+[A-H]\d+$/, '').toLowerCase();
  return ZI.POI_DIALOGUES.find(p => p.name.toLowerCase() === base) || null;
};

// A lightweight hidden trail: Traversal choices are remembered per site square and
// influence which faction is most likely to notice the player in Wandering. This
// tracks attention and reaction context; it does not silently alter reputation.
const POI_DECISIONS_KEY = 'zi_poi_decisions';
const readPoiDecisions = () => ZI._rj ? ZI._rj(POI_DECISIONS_KEY, {}) : {};
ZI.POI_FACTION_INTERESTS = {
  'police-station':['ironmarch','dustwalkers'], pharmacy:['concordance','hearthguard','blackhaven'],
  'grocery-store':['hearthguard','lodge','blackhaven'], 'gas-station':['blackhaven','ironmarch','dustwalkers'],
  laundromat:['hearthguard','lodge'], 'hardware-store':['hearthguard','dustwalkers'],
  library:['dustwalkers','lodge','concordance'], 'community-shelter':['hearthguard','lodge'],
  'water-treatment-plant':['concordance','hearthguard'], 'fire-station':['ironmarch','hearthguard'],
  'transit-depot':['dustwalkers','lodge','ironmarch'], school:['hearthguard','lodge'],
  'office-building':['concordance','blackhaven','lodge'], scrapyard:['dustwalkers','blackhaven'],
};
ZI.recordPoiDecision = function(cell, action, label) {
  const site = ZI.poiSiteForCell(cell);
  if (!site || !cell) return null;
  const key = `${site.id}:${cell.gx},${cell.gy}`;
  const state = readPoiDecisions(), entry = state[key] || { counts:{}, attention:{} };
  const kind = action === 'loot' ? 'scavenge' : action === 'scout' ? 'scout' : action === 'enter' ? 'enter' : ['travel','camp','hide'].includes(action) ? action : 'talk';
  entry.counts[kind] = (entry.counts[kind] || 0) + 1;
  entry.last = { kind, label:label || kind, at:ZI.clockNow ? ZI.clockNow() : Date.now(), site:site.id, name:site.name, gx:cell.gx, gy:cell.gy };
  const actionInterest = kind === 'scavenge' ? ['dustwalkers','blackhaven','concordance']
    : kind === 'scout' ? ['ironmarch','dustwalkers']
    : kind === 'talk' ? ['lodge','hearthguard','blackhaven']
    : kind === 'camp' ? ['hearthguard','lodge']
    : kind === 'hide' ? ['ironmarch','dustwalkers']
    : ['ironmarch','dustwalkers'];
  const interested = [...new Set([...(ZI.POI_FACTION_INTERESTS[site.id] || []), ...actionInterest])];
  entry.attention = entry.attention || {};
  interested.forEach(fid => { entry.attention[fid] = Math.min(8, (entry.attention[fid] || 0) + 1); });
  state[key] = entry;
  if (ZI._wj) ZI._wj(POI_DECISIONS_KEY, state);
  return entry.last;
};
ZI.poiDecisionForCell = function(cell) {
  const site = ZI.poiSiteForCell(cell);
  if (!site || !cell) return null;
  const found = readPoiDecisions()[`${site.id}:${cell.gx},${cell.gy}`];
  const last = found && found.last;
  return last && (ZI.clockNow ? ZI.clockNow() : Date.now()) - last.at < 7 * 86400000 ? last : null;
};
ZI.choosePoiAwareFaction = function(rng, cell, atMs) {
  const last = ZI.poiDecisionForCell(cell);
  const site = ZI.poiSiteForCell(cell);
  const state = readPoiDecisions(), entry = last && site && state[`${site.id}:${cell.gx},${cell.gy}`];
  const factions = ZI.HEX_ORDER || [];
  if (!factions.length) return null;
  const weights = factions.map((fid, i) => 2 + ((entry && entry.attention || {})[fid] || 0)
    + (ZI.worldDailyShift ? ZI.worldDailyShift(cell, 20 + i, 1, atMs) : 0));
  let roll = (rng || Math.random)() * weights.reduce((a,b) => a+b, 0);
  for (let i=0; i<factions.length; i++) { roll -= weights[i]; if (roll < 0) return factions[i]; }
  return factions[factions.length - 1];
};
ZI.poiWanderingCue = function(cell) {
  const last = ZI.poiDecisionForCell(cell), site = ZI.poiSiteForCell(cell);
  if (!last || !site) return null;
  return { site, last, text:last.label || last.kind };
};
ZI.poiFactionReaction = function(cell, faction) {
  const cue = ZI.poiWanderingCue(cell);
  if (!cue || !faction) return null;
  const standing = ZI.repTier && ZI.repTier(ZI.getRep(faction));
  const name = ZI.factionDisplayName ? ZI.factionDisplayName(faction) : 'A faction patrol';
  const tone = standing && ['Hostile','Hunted'].includes(standing.name) ? 'wary' : standing && ['Trusted','Allied'].includes(standing.name) ? 'warm' : 'guarded';
  const line = tone === 'wary' ? `${name} confronts you about what you did at ${cue.site.name}.`
    : tone === 'warm' ? `${name} recognizes your recent activity at ${cue.site.name} and approaches openly.`
    : `${name} has heard you ${cue.text.toLowerCase()} at ${cue.site.name}; they watch your response.`;
  return { tone, text:line, cue };
};

// Persistent narrative threads: recurring locals, survivor-specific recollections,
// and keepsakes. Choices can leave a small, practical Traversal advantage behind.
const STORY_KEY = 'zi_traversal_story';
const readStory = () => { const s = ZI._rj ? ZI._rj(STORY_KEY, {}) : {}; return s && typeof s === 'object' && !Array.isArray(s) ? s : {}; };
const writeStory = s => { if (ZI._wj) ZI._wj(STORY_KEY, s); };
const STORY_NPCS = {
  'community-shelter': { id:'mara', name:'Mara Velez', tell:'She folds the corner of every map twice before handing it over.', keepsake:'a school-bus token' },
  pharmacy: { id:'eli', name:'Eli Park', tell:'He counts each bottle under his breath, then leaves one aside.', keepsake:'a faded clinic badge' },
  'grocery-store': { id:'jo', name:'Jo Bell', tell:'They sort dented cans by sound instead of reading the labels.', keepsake:'a handwritten shopping list' },
  'transit-depot': { id:'ren', name:'Ren Okafor', tell:'They tap a rhythm on the route board before choosing a direction.', keepsake:'a punched transit pass' },
  library: { id:'ada', name:'Ada Ruiz', tell:'She slips a bookmark into any page she thinks you should remember.', keepsake:'a library checkout card' },
};
const BACKGROUND_MEMORIES = {
  vanguard:'You remember the habit of checking exits before taking a seat.', forager:'You remember how your old mentor marked safe water without a sign.',
  artisan:'You remember your first supervisor teaching you to listen for a failing bearing.', envoy:'You remember the pause that helped a tense room settle.',
  journalist:'You remember a source who only spoke after you put your notebook away.', salvager:'You remember which scrap piles were worth the climb.', coordinator:'You remember how a delayed convoy could unravel a whole plan.',
};
ZI.poiStoryForCell = function(cell) {
  const site = ZI.poiSiteForCell(cell), npc = site && STORY_NPCS[site.id];
  if (!site || !npc) return null;
  const state = readStory(), bond = state.npcs && state.npcs[npc.id] || 0;
  const profile = ZI.getSurvivorProfile && ZI.getSurvivorProfile();
  const background = profile && profile.profession;
  const memory = BACKGROUND_MEMORIES[background] || 'A small old-world habit comes back as you read the room.';
  const relicFound = !!(state.relics && state.relics[npc.id]);
  return { npc, bond, memory, relicFound, options:[
    { label: bond > 0 ? 'Share what you remember' : 'Offer a small kindness', icon:'☕', storyChoice:'kindness' },
    { label: relicFound ? 'Recall the keepsake' : `Ask about ${npc.keepsake}`, icon:'◇', storyChoice:'keepsake' },
    { label: 'Mark a safer approach', icon:'🧭', storyChoice:'route' },
  ] };
};
ZI.resolvePoiStoryChoice = function(cell, choice) {
  const story = ZI.poiStoryForCell(cell); if (!story) return null;
  const state = readStory(), npc = story.npc;
  state.npcs = state.npcs || {}; state.relics = state.relics || {}; state.routeAids = state.routeAids || {};
  if (choice === 'kindness') {
    state.npcs[npc.id] = Math.min(3, (state.npcs[npc.id] || 0) + 1);
    const bonus = (ZI.getSurvivorProfile && ZI.getSurvivorProfile())?.profession === 'envoy';
    if (bonus && ZI.emitAction) ZI.emitAction('dialogue', 1);
    writeStory(state);
    return { tone:'good', text:`${npc.name} recognizes the old-world memory in your words. ${npc.tell} They share a useful detail about the next stretch of Traversal.${bonus ? ' Your background helps the conversation land.' : ''}` };
  }
  if (choice === 'keepsake') {
    if (!state.relics[npc.id]) { state.relics[npc.id] = true; state.npcs[npc.id] = Math.min(3, (state.npcs[npc.id] || 0) + 1); }
    writeStory(state);
    return { tone:'info', text:`The ${npc.keepsake} brings back a brief memory: ${story.memory} ${npc.name} trusts you with a note about the route ahead.` };
  }
  if (choice === 'route') {
    state.routeAids[`${cell.gx},${cell.gy}`] = { bonus:15, expires: (ZI.clockNow ? ZI.clockNow() : Date.now()) + 7 * 86400000 };
    writeStory(state);
    return { tone:'good', text:`${npc.name} points out a quieter approach. Your next Loot attempt at this location gains 15 percentage points of safe-loot chance, up to 95%. The bonus is used up after that attempt, whether it succeeds or fails, and expires after seven real days.` };
  }
  return null;
};
ZI.poiRouteAid = function(cell) {
  const aid = cell && readStory().routeAids && readStory().routeAids[`${cell.gx},${cell.gy}`];
  return aid && aid.expires > (ZI.clockNow ? ZI.clockNow() : Date.now()) ? aid : null;
};
ZI.consumePoiRouteAid = function(cell) {
  const state = readStory(), key = cell && `${cell.gx},${cell.gy}`;
  if (!key || !state.routeAids || !state.routeAids[key]) return false;
  delete state.routeAids[key]; writeStory(state); return true;
};
ZI.poiRelicMemory = function(cell) {
  const site = ZI.poiSiteForCell(cell), npc = site && STORY_NPCS[site.id];
  return npc && readStory().relics && readStory().relics[npc.id] ? { npc:npc.name, memory:BACKGROUND_MEMORIES[(ZI.getSurvivorProfile && ZI.getSurvivorProfile() || {}).profession] || 'A familiar voice returns in memory.' } : null;
};
