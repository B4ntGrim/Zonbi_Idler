// Display-only proposed crafting frames. No recipes, item grants or balance changes.
(function (root) {
  'use strict';
  const MISSING = 'Not defined';
  const design = root.ZI_WEAPON_DESIGNS || { models:[], origins:[], legacy:[] };
  const uniqueThemes = {
    'AXE-151': 'A deliberate execution axe: heavy strikes reward commitment and punish exposed elites.',
    'AXE-152': 'A fast duelist: successive eligible hits prepare an authored bleed or finishing effect.',
    'AXE-153': 'A sweeping axe: trades movement and recovery time for a wider authored cutting footprint.',
    'AXE-201': 'A fictional double axe with a large sweep. This is one weapon, not a pair.',
    'AXE-251': 'A quick-release throwing consumable. Spent axes and recovery settle after the encounter.',
    'AXE-258': 'A precision throwing design with explicit recovery, separate from Luck.',
  };
  // Concepts discussed with Sam. Names, roles and modes are proposals; no balance values.
  const concepts = [
    { id:'concept-watchfire', name:'Watchfire Marksman Rifle', slot:'primary', family:'Marksman rifles', art:'rifle', role:'Deliberate precision fire between bows and heavy weapons.' },
    { id:'concept-palisade-flare', name:'Palisade Flare Pistol', slot:'secondary', family:'Utility sidearms', art:'flare', role:'A utility sidearm built around a signal flare. Combat behavior is not defined.' },
    { id:'concept-select-fire', name:'Select-fire Carbine', slot:'primary', family:'Carbines', art:'rifle', role:'Switch between deliberate semi-automatic fire and automatic fire.', fireMode:'Semi-automatic / automatic (proposed)' },
    { id:'concept-precision-rifle', name:'Semi-automatic Precision Rifle', slot:'primary', family:'Marksman rifles', art:'rifle', role:'Deliberate single shots with a precision role.', fireMode:'Semi-automatic (proposed)' },
    { id:'concept-support-rifle', name:'Drum-fed Support Rifle', slot:'primary', family:'Support rifles', art:'support', role:'Sustained automatic fire with a mobility tradeoff.', fireMode:'Automatic (proposed)' },
    { id:'concept-machine-pistol', name:'Machine Pistol', slot:'secondary', family:'Machine pistols', art:'pistol', role:'Close-range burst fire from a compact sidearm.', fireMode:'Burst (proposed)' },
    { id:'concept-semi-pistol', name:'Semi-automatic Pistol', slot:'secondary', family:'Pistols', art:'pistol', role:'A semi-automatic sidearm with a niche still to be defined.', fireMode:'Semi-automatic (proposed)' },
  ];
  const newUniques = [
    { id:'unique-danielle', name:'Danielle', epithet:'The Opening Cut', slot:'melee', family:'Axes / choppers', art:'axe', hands:'1H (proposed)', setId:'set-duet-of-iron',
      description:'A narrow silvered beard, a hooked heel and a black cloth grip. The lighter half of a paired scavenger-forged axe set.',
      affixes:['Attack speed','Crit Chance'], signature:'Proposed: a precise strike exposes an opening for its paired weapon. Trigger, duration and damage are not defined.' },
    { id:'unique-raquelle', name:'Raquelle', epithet:'The Closing Argument', slot:'melee', family:'Axes / choppers', art:'axe', hands:'1H (proposed)', setId:'set-duet-of-iron',
      description:'A broad bronze crescent with a reinforced poll and crimson binding. The deliberate finishing half of the pair.',
      affixes:['Damage','Status Chance'], signature:'Proposed: a committed strike consumes a prepared opening for a sweeping finisher. Damage, stagger and recovery are not defined.' },
    { id:'unique-night-current', name:'Night Current', epithet:'Borrowed Lightning', slot:'melee', family:'Blades', art:'katana', hands:'Not defined',
      description:'A scavenged katana wired to an exposed e-bike battery. Copper contacts glow through its repaired charcoal wrapping.',
      affixes:['Special Damage','Status Chance'], signature:'Proposed: committed slashes prime a battery discharge through a wounded target. Charge rules, discharge strength and cooldown are not defined.' },
    { id:'unique-hushline', name:'Hushline', epithet:'Borrowed Breath', slot:'primary', family:'Submachine guns', art:'smg', setId:'set-night-courier',
      description:'A short suppressed scavenger SMG with a worn bronze receiver, cloth-wrapped stock and a cyan sight pin.',
      affixes:['Crit Chance','Movement speed'], signature:'Proposed: deliberate fire rewards a clean approach against an unaware target. Detection, damage and reset rules are not defined.' },
    { id:'unique-lamplighter', name:'Lamplighter', epithet:'The Final Signal', slot:'secondary', family:'Utility sidearms', art:'flare', setId:'set-night-courier',
      description:'A battered flare sidearm with an iron cage around its amber signal chamber and a leather keeper loop.',
      affixes:['Duration','Status Chance'], signature:'Proposed: a signal flare reveals an approaching threat and creates a target for a paired weapon. Radius, timing and combat effect are not defined.' },
    { id:'unique-duskplate', name:'Duskplate', epithet:'The Quiet Wall', slot:'offhand', family:'Shields', art:'shield', setId:'set-checkpoint-covenant',
      description:'A compact scavenged shield with a weathered iron rim and a copper-stapled dark leather face.',
      affixes:['Defense','Max HP'], signature:'Proposed: a committed guard prepares the next deliberate counterstrike. Block chance, absorption and timing are not defined.' },
  ];
  const sets = [
    { id:'set-duet-of-iron', name:'Duet of Iron', setType:'Dual-axe pair', pieces:['unique-danielle','unique-raquelle'],
      description:'Danielle creates the opening. Raquelle delivers the closing sweep.',
      signature:'Proposed pair effect: alternating eligible strikes lets Danielle prepare an opening that Raquelle consumes for a finishing sweep. Repeating the same axe does not complete the sequence. Damage, timing, stacking and reset rules are not defined.',
      requirement:'Both distinct axes equipped; off-hand and dual-wield support remain a proposed system.' },
    { id:'set-checkpoint-covenant', name:'Checkpoint Covenant', setType:'Axe and shield', pieces:['AXE-151','unique-duskplate'],
      description:'Matilda’s deliberate execution stroke paired with Duskplate’s committed guard.',
      signature:'Proposed pair effect: a successful committed block prepares Matilda’s next eligible counterstrike. The pair preserves each piece’s individual identity. Trigger window, damage, protection and cooldown are not defined.',
      requirement:'Matilda and Duskplate equipped together; shield blocking remains a proposed system.' },
    { id:'set-night-courier', name:'Night Courier', setType:'Primary and sidearm', pieces:['unique-hushline','unique-lamplighter'],
      description:'A suppressed primary and a signal sidearm for moving through a hostile region.',
      signature:'Proposed pair effect: a threat revealed by Lamplighter becomes eligible for Hushline’s prepared follow-up. Exposure, mark duration, damage and reset rules are not defined.',
      requirement:'Both distinct weapons equipped; active-weapon and signal-mark behavior remain proposed systems.' },
  ];
  const families = {
    rifle:['Carbines','rifle'], shotgun:['Shotguns','shotgun'], pipe_shotgun:['Shotguns','shotgun'],
    suppressed:['Submachine guns','smg'], pistol:['Pistols','pistol'], revolver:['Revolvers','revolver'],
    pipe_pistol:['Pistols','pistol'], shock_pistol:['Energy sidearms','pistol'],
    compound_bow:['Bows','bow'], crossbow:['Crossbows','crossbow'], arc_carbine:['Energy carbines','rifle'],
    flamethrower:['Flamethrowers','flame'], void_pulse_rifle:['Energy rifles','rifle'],
    combat_axe:['Axes / choppers','axe'], jet_sledge:['Heavy melee','hammer'], bat:['Clubs / bats','bat'],
    pocket_knife:['Knives','knife'], combat_knife:['Knives','knife'], crowbar:['Improvised melee','crowbar'],
    iron_knuckles:['Fist weapons','knuckles'], spike_board:['Improvised melee','bat'], steel_baton:['Batons','bat'],
    shock_baton:['Batons','bat'], machete:['Blades','blade'], machete_blade:['Blades','blade'],
  };
  const finite = value => typeof value === 'number' && Number.isFinite(value);
  const field = (label, value, unit, tone) => ({ label, value:finite(value) || typeof value === 'string' ? value : null, unit:unit || '', tone:tone || 'normal' });
  function liveRecord(item) {
    const fam = families[item.id] || ['Throwables / utility','grenade'];
    const bonuses = [];
    const add = (label, value, unit, tone) => { if (finite(value) && value !== 0) bonuses.push(field(label, value, unit, tone)); };
    add('Movement modifier', item.speedDelta, 'points', 'cyan');
    add('Loot find', item.lootBonus, 'points', 'green');
    add('Heavy swing: skip next attack', item.heavySwingPct, '%', 'red');
    add('Stagger chance', item.staggerPct, '%', 'cyan');
    add('Escape chance bonus', item.escapeBonus, 'points', 'green');
    const fx = item.effect || {};
    add('Healing', fx.heal, 'HP', 'green'); add('Armor bonus', fx.armorAdd, 'points', 'cyan');
    add('Loot value bonus', fx.lootPct, '%', 'green'); add('Effect duration', fx.durSec, 's', 'cyan');
    if (fx.killEnemy) bonuses.push(field('Consumable effect', 'Defeats the current target', '', 'violet'));
    if (fx.stun) bonuses.push(field('Consumable effect', 'Stun', '', 'cyan'));
    return {
      id:item.id, name:item.name, roster:'live', status:'In-game record', slot:item.slot,
      family:fam[0], art:fam[1], rarity:item.rarity || null, baseDamage:item.cat === 'weapon' && finite(item.dmg) ? item.dmg : null,
      weight:finite(item.carryW) ? item.carryW : null, bonuses, description:item.desc || '',
      source:'game/items.js', sourceId:item.id, sourceLabel:'Current equipment catalog',
      attributes:item.unique === true ? (root.ZI.SURVIVAL_ATTRS || []).map(a => field(a.name, (item.attributeBonuses || {})[a.key], 'points', 'gold')) : null,
    };
  }
  function axeRecord(item) {
    const origin = design.origins.find(o => o.id === item.source_id);
    return {
      id:item.draft_id, name:item.name, epithet:item.epithet, maker:item.invented_maker,
      roster:uniqueThemes[item.draft_id] ? 'uniques' : 'axes', status:uniqueThemes[item.draft_id] ? 'Unique concept' : 'Axe concept',
      slot:item.runtime_slot, family:'Axes / choppers', art:'axe', section:item.catalogue_section,
      sectionTitle:item.catalogue_section_title, subfamily:item.content_subfamily,
      rarity:uniqueThemes[item.draft_id] ? 'unique' : item.rarity,
      baseDamage:item.base_damage, weight:item.weight_kg, constructionTier:item.construction_tier,
      recovery:item.recovery_chance, hands:item.hands, description:item.style, role:item.role,
      tradeoff:item.tradeoff, affixes:item.suggested_affixes || [], bonuses:[],
      signature:uniqueThemes[item.draft_id] || null, acquisition:item.acquisition,
      setId:item.draft_id === 'AXE-151' ? 'set-checkpoint-covenant' : null,
      attributes:uniqueThemes[item.draft_id] ? (root.ZI.SURVIVAL_ATTRS || []).map(a => field(a.name, null, 'points', 'gold')) : null,
      source:design.axeSource, sourceId:item.model_id, sourceLabel:'Axe design roster · 24 October 2026', origin,
    };
  }
  function legacyRecord(item) {
    const art = /hatchet/.test(item.id) ? 'axe' : /sledge/.test(item.id) ? 'hammer' : /knife/.test(item.id) ? 'knife' : /machete/.test(item.id) ? 'blade' : /shotgun/.test(item.id) ? 'shotgun' : /smg/.test(item.id) ? 'smg' : /revolver/.test(item.id) ? 'revolver' : item.slot === 'secondary' ? 'pistol' : 'rifle';
    return {
      id:'legacy-' + item.id, name:item.name, roster:'legacy', status:'Legacy prototype', slot:item.slot,
      family:item.kind === 'Melee' ? 'Legacy melee' : 'Legacy ranged', art, rarity:null,
      baseDamage:`${item.damageMin}–${item.damageMax}`, magazine:item.kind === 'Ranged' ? item.magazine : null,
      ammo:item.ammo, sockets:item.sockets, durability:item.durability, bonuses:[field('Damage multiplier', item.damageMultiplier, '×')],
      description:'Archived Unity prototype record. These values belong to the older prototype, not the current game.',
      source:design.legacySource, sourceId:item.id, sourceLabel:'Archived Unity seed roster',
    };
  }
  function getRecords() {
    const live = (root.ZI.GEAR_ITEMS || []).filter(i => i.cat === 'weapon' || i.slot === 'throwable').map(liveRecord);
    const ideas = concepts.map(c => ({ ...c, roster:'ranged', status:'Ranged concept', sourceLabel:'Weapon workshop discussion',
      sourceId:c.id, source:'reference/crafting-frame-proposals.md', description:c.role, bonuses:[], rarity:null }));
    const relics = live.filter(r => r.rarity === 'legendary' && r.slot !== 'throwable').map(base => ({
      id:'relic-' + base.id, name:'Relic ' + base.name, roster:'relics', status:'Relic concept', rarity:'relic',
      slot:base.slot, family:base.family, art:base.art, baseId:base.id, bonuses:[],
      description:'An enhanced Legendary concept that retains the base weapon’s signature. Enhanced ranges and minimum rolls are not defined.',
      signature:base.description, source:'reference/crafting-frame-proposals.md', sourceId:'relic-' + base.id,
      sourceLabel:'Relic upgrade direction · weapon workshop',
    }));
    const authored = newUniques.map(c => ({ ...c, roster:'uniques', status:c.art === 'shield' ? 'Unique shield concept' : 'Unique concept', rarity:'unique', bonuses:[],
      attributes:(root.ZI.SURVIVAL_ATTRS || []).map(a => field(a.name, null, 'points', 'gold')),
      source:'reference/crafting-frame-proposals.md', sourceId:c.id, sourceLabel:'Authored weapon workshop concepts' }));
    const pairs = sets.map(s => ({ ...s, roster:'sets', status:'Set concept', art:'set', family:s.setType, bonuses:[],
      source:'reference/crafting-frame-proposals.md', sourceId:s.id, sourceLabel:'Authored two-piece set concepts' }));
    return [...live, ...design.models.map(axeRecord), ...authored, ...ideas, ...relics, ...pairs, ...design.legacy.map(legacyRecord)];
  }
  function readRoute() {
    const hash = root.location.hash;
    const prefix = '#crafting/proposed';
    if (hash === prefix || hash === prefix + '/') return { active:true, id:null };
    if (!hash.startsWith(prefix + '/')) return { active:false, id:null };
    try { return { active:true, id:decodeURIComponent(hash.slice(prefix.length + 1)) }; }
    catch (_) { return { active:true, id:null, invalid:true }; }
  }
  root.ZI_CRAFTING_FRAMES = {
    MISSING, getRecords, readRoute,
    href:id => '#crafting/proposed' + (id ? '/' + encodeURIComponent(id) : ''),
    format(value, unit) {
      if (value == null || value === '' || (typeof value === 'number' && !finite(value))) return MISSING;
      return String(value) + (unit ? (unit === '%' || unit === '×' ? unit : ' ' + unit) : '');
    },
  };
})(window);
