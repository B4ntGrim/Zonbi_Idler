# Zed Idler: generated zombie encounter afflictions

**Design proposal — all 72 generated designs mapped.** The image tier determines encounter complexity. The enemy's fixed traits, optional traits, and the effects it can apply are listed separately. Proposed minor variants keep early encounters manageable. No game data or runtime behavior has been changed.

## Tier rules

| Tier | Encounter rule | Suitable examples |
| --- | --- | --- |
| F | Tutorial bodies and cosmetic conditions. At most one minor contact/passive hazard. No severe infection, hard control or surprise elemental aura. | Damp, Soiled, Clothed; proposed Frail. |
| E | One clear new threat. Use explicitly reduced variants for mechanics whose full versions belong later. No optional random combat traits in this set. | One alarm, pounce, short dash, small electrical hit, localized armor or mild mold contact. |
| D | One primary mechanic with an obvious counter; a modest supporting passive is acceptable. | Frostbite slow, light sensitivity, barbs, ranged bone attacks and limited burrowing/acid variants. |
| C | Combine a primary threat with its visible support traits. Add a second mechanic only when it has a separate tell. | Immolation, Conductive, Acid Vomit + Oozing, Chrome Dome and Grayscales. |
| B | Two complementary combat problems. Choose at most one compatible optional trait at spawn and display it. | Armor + heavy attacks, chains + control, dash + fire, acid + a warned pressure sac. |
| A | Larger threats with several authored identity traits. At most one optional trait; retain a usable counter. | Giant + armor + fire, toxic bulk, repeated dash, burrow ambush and surgical infection. |
| S | Authored miniboss combinations and clear special attacks. Choose optional variants before combat. Mid-fight changes require an explicit mutation/phase mechanic. | Four-arm blade guard, furnace armor, dimensional phasing, prison control and elite freezing specials. |
| BOSS | Scripted forms and phase-specific afflictions. Show immunity and every form change. Avoid applying the full combined list at once. | Numbness on the chained boss, exposed neural core, fire blade, plasma sphere, regeneration and separate Apex forms. |

## How to use the mapping

- A row's optional traits are alternatives, not an instruction to apply every trait. Normal B/A encounters select at most one. S variants select at encounter setup.
- Any optional trait requires a matching visible overlay or animation before it can roll. If its tell is absent, it is unavailable for that artwork.
- Treat armor as one layer for the same material. Thicker Armor replaces Armored when listed as a replacement.
- Numbness is authored disable immunity, not a blanket boss property or random high-tier roll. It does not grant damage immunity.
- A visor or helmet does not grant Chrome Dome. A complete sealed metal head does.
- A leap or levitating key pose does not by itself grant Trap Sidestep or universal trap immunity.
- Immolation, Frostbite and Conductive indicate elemental attacks. Electrical damage does not automatically stun, and ordinary cold hits do not automatically freeze.
- Poison, Burn, Chill and contamination require their own mechanics and feedback. Colors alone cannot add a new damage/status type.
- The source Sharp trait has both damage-only and Bleed interpretations. Bleed applications here are proposed and remain conditional on selecting that interpretation.
- Grayscales is a petrifying infection. Ghostlike shimmer is not an alternate definition of Grayscales.
- Thorns returns melee damage; Bleed is not automatically added. Barbed armor in the Warden counter column refers to player equipment.
- Repeated control needs a visible recovery interval/protection. Do not translate a Stun-locker label into indefinite loss of control.
- No rates, durations, damage multipliers, resistance percentages, spawn weights or status cure recipes are newly balanced here.
- Expanded prompt IDs 49–108 are artwork/reference IDs. This document does not claim those entries already exist in the 45-record runtime roster.

## Expanded bestiary: IDs 49–108

Fixed traits define the drawn enemy. Optional entries are compatible alternatives, never an unrestricted cumulative roll pool. Empty effect lists mean no inherent named affliction is assigned; the enemy still deals its ordinary attack damage. Noise and damage return are identified as encounter/damage effects rather than persistent survivor statuses.

### Tier F

| ID | Zombie / image | Fixed enemy afflictions and traits | Optional trait | Effects on survivor / encounter |
| --- | --- | --- | --- | --- |
| 49 | [Soggy Slump](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/049-soggy-slump.png>) | Damp; Soiled | None | Minor filth/contact contamination |
| 50 | [Ashen Wanderer](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/050-ashen-wanderer.png>) | Charred appearance (cosmetic) | None | None |
| 51 | [Lumbering Courier](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/051-lumbering-courier.png>) | Clothed | None | None |
| 52 | [Tangled Drifter](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/052-tangled-drifter.png>) | Clothed; Soiled | None | None |
| 53 | [Frail Husk](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/053-frail-husk.png>) | Frail (proposed minor modifier) | None | None |

**49 — Soggy Slump.** Visual cue: Wet rags and falling droplets. Counter: Blunt attacks or range. Use the existing Damp Lurker tutorial treatment. Wetness does not grant an electric attack.

**50 — Ashen Wanderer.** Visual cue: Ash-grey skin, burnt cloth and faint shoulder smoke. Counter: Ordinary melee or range. No active Immolation or burning aura at F. Smoke is a visual condition.

**51 — Lumbering Courier.** Visual cue: Torn mailbag, loose straps and worn clothing. Counter: Ordinary melee. The bag identifies the courier. Stuffed Pockets and bonus loot are not automatically granted.

**52 — Tangled Drifter.** Visual cue: Loose rope and wire around the body. Counter: Ordinary melee. Bindings are cosmetic at F. They do not grant Shackle, stun-locking or trap immunity.

**53 — Frail Husk.** Visual cue: Extremely thin frame and exposed ribs. Counter: Ordinary melee. Frail means a brittle enemy body. It does not cause a Weakness status on the survivor.

### Tier E

| ID | Zombie / image | Fixed enemy afflictions and traits | Optional trait | Effects on survivor / encounter |
| --- | --- | --- | --- | --- |
| 54 | [Siren Stumper](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/054-siren-stumper.png>) | Signal Imp (minor proposed variant) | None | Area noise escalation |
| 55 | [Cinder Runner](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/055-cinder-runner.png>) | Dash (minor proposed variant) | None | None |
| 56 | [Muck Lurker](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/056-muck-lurker.png>) | Creeper (minor proposed variant); Damp | None | None |
| 57 | [Hollow Leaper](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/057-hollow-leaper.png>) | Dextrous (minor proposed variant) | None | None |
| 58 | [Rusted Guard](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/058-rusted-guard.png>) | Light Plating (proposed minor modifier) | None | None |
| 59 | [Spore Carrier](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/059-spore-carrier.png>) | Moldy | None | Minor contact contamination |
| 60 | [Static Shuffler](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/060-static-shuffler.png>) | Conductive (minor proposed variant) | None | Small telegraphed electrical hit |

**54 — Siren Stumper.** Visual cue: Broken red-glowing megaphone. Counter: Interrupt or defeat before the call completes. E introduces one bounded alarm. Full horde calls and group-buff combinations belong to stronger variants. Noise is an encounter effect, not a survivor affliction.

**55 — Cinder Runner.** Visual cue: Low running stride and ember trail. Counter: Distance, interception and well-timed traps. One short dash. Embers remain cosmetic at E; no continuous fire trail, Immolation aura or guaranteed first strike.

**56 — Muck Lurker.** Visual cue: Low crawl, swamp sludge and dripping limbs. Counter: Awareness and range. Introduce the low ambush approach. Do not add poison, contamination and stealth bonuses simultaneously.

**57 — Hollow Leaper.** Visual cue: Lean airborne pounce and lightweight cloth. Counter: Interrupt the landing or use a net. One readable pounce. Airborne art alone does not grant blanket floor-trap immunity.

**58 — Rusted Guard.** Visual cue: Orange-rusted chest plate with exposed limbs. Counter: Target uncovered areas or use blunt attacks. Localized defense only. Full Armored blade/firearm resistance is a later mechanic.

**59 — Spore Carrier.** Visual cue: Bulging fungal growths on the shoulders and back. Counter: Range and avoiding contact. Use the low-intensity Moldy treatment. Full Fungei-layden spore clouds, hallucination and swarm combinations are withheld.

**60 — Static Shuffler.** Visual cue: A few electric-blue fingertip sparks. Counter: Spacing and insulation. No repeated reactive burst, chain lightning or stun-lock. The minor version is a proposed E introduction.

### Tier D

| ID | Zombie / image | Fixed enemy afflictions and traits | Optional trait | Effects on survivor / encounter |
| --- | --- | --- | --- | --- |
| 61 | [Goo Vomiter](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/061-goo-vomiter.png>) | Acid Vomit (minor proposed variant) | None | Mild acid/corrosion damage over time |
| 62 | [Shatter-Bone Bruiser](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/062-shatter-bone-bruiser.png>) | Heavy; Tough Skin (minor proposed variant) | None | None |
| 63 | [Grave Digger](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/063-grave-digger.png>) | Soiled; Burrower (minor proposed variant) | None | None |
| 64 | [Wire-Bound Crawler](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/064-wire-bound-crawler.png>) | Thorns (minor proposed variant) | None | Limited melee damage return |
| 65 | [Frost Smite](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/065-frost-smite.png>) | Frostbite | Damp | Chill / movement and attack slow |
| 66 | [Flash-Blind Stalker](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/066-flash-blind-stalker.png>) | Light Sensitive | None | None |
| 67 | [Decay Launcher](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/067-decay-launcher.png>) | Ranged; Sharp | None | Bleed buildup if the Sharp status interpretation is adopted |

**61 — Goo Vomiter.** Visual cue: Translucent green stomach and drooling mouth. Counter: Strafe the projectile and use appropriate protection. Single small spit with one damage-over-time effect. Full spray, persistent pools and Hazardous combinations are reserved for C or higher.

**62 — Shatter-Bone Bruiser.** Visual cue: Enlarged bone-covered arms. Counter: Blunt attacks and recovery-window punishes. Heavy already has a D-tier precedent. Bone protection is modest. Do not infer automatic Bash stuns or Numbness.

**63 — Grave Digger.** Visual cue: Broken shovel, grave dirt and digging posture. Counter: Watch the disturbed earth and punish resurfacing. Short, visible digging reposition only. Full unseen rear ambushes are withheld at D.

**64 — Wire-Bound Crawler.** Visual cue: Tight coils of barbed wire. Counter: Range or blunt attacks. Wire can punish close contact. It does not automatically grant Shackle or Stun-locker. Damage return is not automatically Bleed.

**65 — Frost Smite.** Visual cue: White frost crystals and cold vapor. Counter: Fire, blunt attacks and cold resistance. Use the existing D-tier Frostbitten Shuffler precedent. No hard freeze at this tier.

**66 — Flash-Blind Stalker.** Visual cue: Cowering posture and an arm shielding the face. Counter: Bright light or UV. Light sensitivity weakens the zombie. The zombie does not inflict Blind simply because its own eyes are light-sensitive.

**67 — Decay Launcher.** Visual cue: Raised jagged bone projectile. Counter: Cover and lateral movement. The existing D-tier Sharp sniper supports the ranged identity. Sharp's damage-only and Bleed definitions conflict in the source sheets; Bleed is an explicit proposal.

### Tier C

| ID | Zombie / image | Fixed enemy afflictions and traits | Optional trait | Effects on survivor / encounter |
| --- | --- | --- | --- | --- |
| 68 | [Riot Pacifier](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/068-riot-pacifier.png>) | Shield Guard (proposed modifier); Tough Skin | None | None |
| 69 | [Thermite Walker](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/069-thermite-walker.png>) | Immolation | None | Burn |
| 70 | [Plague Matron](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/070-plague-matron.png>) | Maggot Ridden (minor proposed variant); Clothed | None | Contact contamination from larvae |
| 71 | [Volt Surger](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/071-volt-surger.png>) | Conductive | Damp | Electrical damage |
| 72 | [Slag Enforcer](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/072-slag-enforcer.png>) | Heavy; Tough Skin | Immolation | Burn only when Immolation is active |
| 73 | [Corrosive Bloat](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/073-corrosive-bloat.png>) | Acid Vomit; Oozing; Hazardous | None | Acid/corrosion damage over time; Contact contamination |
| 74 | [Leaping Strangle-Imp](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/074-leaping-strangle-imp.png>) | Dash; Sharp | None | Bleed buildup if Sharp uses the proposed status behavior |
| 75 | [Phantasm Walker](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/075-phantasm-walker.png>) | Grayscales; Tough Skin | None | Petrifying Grayscales infection |

**68 — Riot Pacifier.** Visual cue: Dented riot shield, helmet and exposed flanks. Counter: Flank, disarm the shield or use blunt attacks. Directional guard rather than full Armored immunity. The C-tier defense remains readable and bypassable.

**69 — Thermite Walker.** Visual cue: White-yellow chemical flame streams. Counter: Water/foam, distance and fire protection. C-tier Immolation already exists in the original bestiary. No silent damage-reflection trait unless spikes and a separate Thorns tell are added.

**70 — Plague Matron.** Visual cue: Tattered robes, infested torso and crawling larvae. Counter: Area attacks and distance. One small larval swarm mechanic. Full Hermit multi-hit attacks and Wretched intimidation are withheld.

**71 — Volt Surger.** Visual cue: Visible torso ring of electricity and conductive fittings. Counter: Insulation and spacing. Use the existing C-tier Shock Conductor precedent. Electrical damage does not automatically add a stun. Damp requires a visible wet overlay when selected.

**72 — Slag Enforcer.** Visual cue: Dark slag plates with orange cracks. Counter: Blunt attacks and exposed seams. Tough Skin gives the C version a defense without the full B-tier Armored package. Activate flames and a hazard icon before adding Immolation.

**73 — Corrosive Bloat.** Visual cue: Bright yellow-green fluid leaking from joints. Counter: Strafe, range and chemical protection. A C-tier Acid Spitter analogue. Acid burn is chemical damage and does not imply a separate fire-element aura.

**74 — Leaping Strangle-Imp.** Visual cue: Outstretched claws and aggressive airborne lunge. Counter: Interception, reach and timing. A clear lunge plus claw threat. No floor-trap immunity from a single airborne frame.

**75 — Phantasm Walker.** Visual cue: Pale cyan-grey body and shimmering outline. Counter: Prevent contact; use the established surgeon cure for Grayscales. ART CUE REQUIRED: add visible grey scale plaques before using the infection mechanic. Shimmer alone does not establish petrification, intangibility or damage immunity.

### Tier B

| ID | Zombie / image | Fixed enemy afflictions and traits | Optional trait | Effects on survivor / encounter |
| --- | --- | --- | --- | --- |
| 76 | [Exoskeleton Remnant](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/076-exoskeleton-remnant.png>) | Armored; Heavy | Heavy Hitter | None |
| 77 | [Blight Screamer](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/077-blight-screamer.png>) | Signal Imp; Battle Cry | Wretched | Area noise escalation; Intimidation damage debuff only if Wretched is selected |
| 78 | [Needle-Limb Freak](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/078-needle-limb-freak.png>) | Sharp; Tough Skin | Nimble | Bleed buildup if Sharp uses the proposed status behavior |
| 79 | [Gloom Assassin](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/079-gloom-assassin.png>) | Sneak; Creeper | Accelerated Dash; Battle Hunger | None |
| 80 | [Chain-Whip Warden](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/080-chain-whip-warden.png>) | Shackle; Stun-locker; Heavy | None | Entangle; Brief stagger/stun; Stress or scare on qualifying hits |
| 81 | [Caustic Mortar](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/081-caustic-mortar.png>) | Acid Vomit; Oozing; Ranged | Pressurized | Acid/corrosion damage over time; Contact contamination |
| 82 | [Cryo Executioner](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/082-cryo-executioner.png>) | Frostbite; Heavy; Weapon Wielder | Sharp | Chill / slow; Bleed buildup only if Sharp is selected |
| 83 | [Napalm Stalker](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/083-napalm-stalker.png>) | Immolation; Dash | Blood Frenzy | Burn |

**76 — Exoskeleton Remnant.** Visual cue: Military exoskeleton, pistons and metal limbs. Counter: Blunt or armor-piercing attacks; target joints. The mechanical frame supports physical defense. It does not automatically imply Conductive shocks.

**77 — Blight Screamer.** Visual cue: Distended shrieking jaw and sound-wave pixels. Counter: Interrupt the shriek and prioritize the caller. Noise plus group support is the B-tier combination. Wretched needs a distinct debuff cue. Do not add an unrelated infection because the name includes Blight.

**78 — Needle-Limb Freak.** Visual cue: Long needle-like bone forearms. Counter: Range, traps and avoiding the stabbing line. Bone blades support the Sharp family. Extra limbs, regenerative flesh and elemental damage are not inferred.

**79 — Gloom Assassin.** Visual cue: Low crouch and shadow-absorbing rags. Counter: Awareness, area reveal and interception. Choose at most one optional trait. Stealth affects detection and never grants permanent invulnerability.

**80 — Chain-Whip Warden.** Visual cue: Spiked chain whip, wrist restraints and heavy stance. Counter: Reach, spacing and the established barbed-armor counter. The original B-tier Warden is the precedent. Apply control recovery protection so repeated hits cannot create an endless stun chain.

**81 — Caustic Mortar.** Visual cue: Swollen dorsal reservoir and an arcing fluid attack. Counter: Move after the launch tell and avoid the landing area. Pressurized is optional only with an additional visible pressure pulse and rupture warning. A large sac alone does not make the enemy explode.

**82 — Cryo Executioner.** Visual cue: Large ice-encrusted cleaver and frost-covered body. Counter: Disarm, cold protection and attack recovery windows. A cleaver adds the held-weapon counter. Any Sharp roll needs a separate readable blade/bleed cue. No routine hard freeze.

**83 — Napalm Stalker.** Visual cue: Forward sprint with a blazing trailing fire path. Counter: Spacing, fire protection and intercepting the dash. If Blood Frenzy is selected, show a clear rage transition. Do not add Heavy to the fast runner package.

### Tier A

| ID | Zombie / image | Fixed enemy afflictions and traits | Optional trait | Effects on survivor / encounter |
| --- | --- | --- | --- | --- |
| 84 | [Centipede Host](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/084-centipede-host.png>) | Hexapod (proposed locomotion variant); Tough Skin; Unpredictable | Sharp | Bleed buildup only if Sharp is selected |
| 85 | [Apex Hunter](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/085-apex-hunter.png>) | Accelerated Dash; Sprint; Battle Hunger | Sharp; Blood Frenzy | Bleed buildup only if Sharp is selected |
| 86 | [Slag Titan](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/086-slag-titan.png>) | Giant; Heavy; Armored; Immolation | None | Burn |
| 87 | [Toxic Behemoth](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/087-toxic-behemoth.png>) | Giant; Toxic Gas; Hazardous | Oozing | Poison / gas damage over time; Stress; Contact contamination only if Oozing is selected |
| 88 | [Bio-Electric Monstrosity](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/088-bio-electric-monstrosity.png>) | Conductive; Heavy Hitter | Strong | Electrical damage |
| 89 | [Subterranean Stalker](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/089-subterranean-stalker.png>) | Burrower; Sneak; Sharp | Tough Skin | Bleed buildup if Sharp uses the proposed status behavior |
| 90 | [Surgical Abomination](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/090-surgical-abomination.png>) | Grayscales; Weapon Wielder; Sharp | None | Petrifying Grayscales infection; Bleed buildup if Sharp uses the proposed status behavior |
| 91 | [Dread Dreadnought](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/091-dread-dreadnought.png>) | Armored; Heavy; Heavy Hitter | Thicker Armor (replaces Armored) | None |

**84 — Centipede Host.** Visual cue: Segmented lower limbs beneath the humanoid torso. Counter: Reach, flank attacks and limb targeting. The image uses multiple walking legs. The source Hexapod describes a six-arm guard wall. Keep that distinction explicit rather than silently granting the full guard mechanic.

**85 — Apex Hunter.** Visual cue: Long claws, repeated dash afterimages and forward acceleration. Counter: First-strike interception, reach and predictable choke points. Choose at most one optional trait. Battle Hunger improves the enemy's accuracy rather than afflicting the player.

**86 — Slag Titan.** Visual cue: Huge molten-slag body with glowing fissures. Counter: Blunt or armor-piercing attacks, fire protection and recovery windows. Four identity tags create two clear problems: physical bulk and close-range heat. No random Numbness.

**87 — Toxic Behemoth.** Visual cue: Bulky body within dense green gas. Counter: Distance, breathing protection and appropriate fire ignition. The gas identity is primary. Do not also add a piercing explosion without a pressure tell.

**88 — Bio-Electric Monstrosity.** Visual cue: Yellow-white arcs over exposed muscles. Counter: Insulation and range. Strong adds regeneration only when a healing pulse/reforming-tissue cue is displayed. No automatic stun or shock immunity.

**89 — Subterranean Stalker.** Visual cue: Half-submerged body, disturbed earth and razor mandibles. Counter: Awareness, prediction and the resurfacing window. Full A-tier burrow-and-ambush behavior is appropriate. Underground avoidance is temporary and tied to the burrow state.

**90 — Surgical Abomination.** Visual cue: Grafted scalpels, steel implements and grey flesh. Counter: Avoid contact; disarm tools; use the established Grayscales cure. ART CUE REQUIRED: visible scale plaques must identify the infection independently of the surgical tools. Tools do not automatically imply regeneration.

**91 — Dread Dreadnought.** Visual cue: Overlapping composite plating and integrated weapon scraps. Counter: Armor-piercing or blunt attacks; target gaps. Thicker Armor replaces the ordinary armor trait. Avoid double-counting the same plating. No automatic headshot immunity without a sealed head.

### Tier S

| ID | Zombie / image | Fixed enemy afflictions and traits | Optional trait | Effects on survivor / encounter |
| --- | --- | --- | --- | --- |
| 92 | [Marrow Collector](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/092-marrow-collector.png>) | Quadruped; Sharp; Unpredictable | Thorns | Bleed buildup if Sharp uses the proposed status behavior; Melee damage return only if Thorns is selected |
| 93 | [Inferno Engine](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/093-inferno-engine.png>) | Immolation; Armored; Heavy | Thorns | Burn; Melee damage return only if Thorns is selected |
| 94 | [Void Phantom](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/094-void-phantom.png>) | Sneak; Phase Shift (proposed scripted mechanic); Unpredictable | None | None |
| 95 | [Grave Overlord](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/095-grave-overlord.png>) | Wretched; Battle Cry; Pack Leader | None | Intimidation / reduced outgoing damage |
| 96 | [Epitaph Warden](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/096-epitaph-warden.png>) | Thicker Armor; Heavy; Shackle; Stun-locker | None | Entangle; Brief stagger/stun; Stress or scare on qualifying hits |
| 97 | [Toxin Sovereign](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/097-toxin-sovereign.png>) | Toxic Gas; Hazardous; Oozing | Pressurized | Poison / gas damage over time; Stress; Contact contamination |
| 98 | [Storm Caller](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/098-storm-caller.png>) | Conductive; Ranged; Airborne (proposed scripted state) | None | Electrical damage |
| 99 | [Glacial Leviathan](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/099-glacial-leviathan.png>) | Frostbite; Giant; Thicker Armor; Heavy | None | Chill / slow; Brief Freeze only on a proposed telegraphed special |

**92 — Marrow Collector.** Visual cue: Low four-limb stance with long bone blades. Counter: Flank, use reach and strike during committed sweeps. Select the optional trait at encounter setup. Bone blades do not turn this four-limb design into an eight-limb wall.

**93 — Inferno Engine.** Visual cue: Black spiked iron, furnace glow and heat effects. Counter: Fire protection, armor counters and range. Spikes visibly support Thorns. Keep fire damage and reflected melee damage distinct in the encounter display.

**94 — Void Phantom.** Visual cue: Violet distortion and faint duplicate afterimages. Counter: Reveal, track the real silhouette and attack during the solid phase. Phasing has a visible start and end. No permanent invulnerability, petrification or hidden curse is assigned.

**95 — Grave Overlord.** Visual cue: Necrotic crown, burial robes and a summoning hand. Counter: Interrupt support actions and use area damage on the escort. An authored command-and-escort encounter. A crown does not justify unrelated elemental damage.

**96 — Epitaph Warden.** Visual cue: Black-iron prison plates, chains and red optics. Counter: Armor counters, reach and control-recovery protection. A stronger Warden package. Red optics are a tell, not evidence of fire damage or disable immunity.

**97 — Toxin Sovereign.** Visual cue: Ruined hazmat layers, green reactor core and pressurized fumes. Counter: Breathing protection, distance and reactor recovery windows. Pressurized requires a dedicated rupture warning. Do not assume every reactor attack causes an explosion.

**98 — Storm Caller.** Visual cue: Slight levitation and a blue plasma vortex. Counter: Insulation and gaps in the electrical pattern. Airborne protection applies only to floor contact during that state. Nets, ranged attacks and every other trap are not automatically negated.

**99 — Glacial Leviathan.** Visual cue: Thick blue plates and giant ice-spike fists. Counter: Cold protection, armor counters and recovery windows. Freeze is an elite special proposal, not the default effect of every cold hit. Provide a recovery interval.

### Tier BOSS

| ID | Zombie / image | Fixed enemy afflictions and traits | Optional trait | Effects on survivor / encounter |
| --- | --- | --- | --- | --- |
| 100 | [The Iron Titan](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/100-the-iron-titan.png>) | Chained; Heavy; Thicker Armor; Numbness; Bash | None | Stagger/stun on the telegraphed Bash |
| 101 | [The Hivemind Core](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/101-the-hivemind-core.png>) | Octopod; Rebis; Oozing; Grapple (proposed Shackle variant) | None | Entangle from a telegraphed grab; Contact contamination |
| 102 | [The Ash Emperor](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/102-the-ash-emperor.png>) | Immolation; Weapon Wielder | None | Burn |
| 103 | [The Void Harbinger](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/103-the-void-harbinger.png>) | Rebis; Hybrid-Limbed; Unpredictable; Phase Shift (proposed scripted mechanic) | None | None |
| 104 | [The Undying Goliath](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/104-the-undying-goliath.png>) | Giant; Strong; Immolation | None | Burn |
| 105 | [The Storm Sovereign](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/105-the-storm-sovereign.png>) | Conductive; Ranged | None | Electrical damage |
| 106 | [The Plague Archon](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/106-the-plague-archon.png>) | Toxic Gas; Fungei-layden; Hazardous | None | Poison / gas damage over time; Contact contamination; Stress |
| 107 | [The Sub-Zero Colossus](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/107-the-sub-zero-colossus.png>) | Giant; Frostbite; Thicker Armor; Heavy | None | Chill / slow; Brief Freeze only on a proposed telegraphed special |
| 108 | [The Apex Prime](<E:/Zed_Idler/uploads/Zombie Art/Bestiary 49-108/108-the-apex-prime.png>) | Hybrid-Limbed; Armored; Accelerated Dash; Rebis | Sharp (pursuit phase); Heavy Hitter (bastion phase); Blood Frenzy (unstable phase) | Bleed buildup only during the Sharp pursuit form |

**100 — The Iron Titan.** Visual cue: Industrial hydraulics, broken golden chains and enormous fists. Counter: Armor counters, sustained damage and avoiding the heavy swing. Numbness is an authored boss trait inherited from the Chained Behemoth concept. Display disable immunity explicitly. It does not mean damage immunity.

**101 — The Hivemind Core.** Visual cue: Eight neural tentacles around a pulsing organic core. Counter: Sever/disable a committed tentacle and attack the exposed core. Red core light does not mean fire or electricity. Mutation changes are signalled between authored phases.

**102 — The Ash Emperor.** Visual cue: Liquid-fire blade, burning mantle and cracked magma underfoot. Counter: Fire protection, blade recovery windows and spacing. Use fire-themed phases. Magma is a local hazard. No separate Bleed, poison or permanent curse is inferred.

**103 — The Void Harbinger.** Visual cue: Shifting geometric body and visible dimensional distortion. Counter: Track the current form and exploit the solid phase. State changes alter attack patterns. Spatial damage, permanent curses and new status systems remain unassigned.

**104 — The Undying Goliath.** Visual cue: Regenerating torn flesh under green flames. Counter: Interrupt the healing window and use fire protection. Green fire is still fire. Poison, radiation and Corruption are not granted by its color.

**105 — The Storm Sovereign.** Visual cue: A massive crackling plasma sphere. Counter: Insulation and sphere charge/release windows. The sphere is an authored boss attack. Stun and Numbness are not automatically bundled with electrical damage.

**106 — The Plague Archon.** Visual cue: Rolling plague mist and visible spore swarms. Counter: Breathing protection, clearing space and targeting exposed windows. Share the poison damage budget between mist and spores. Do not silently multiply damage by counting the same cloud twice. Hallucination is not selected.

**107 — The Sub-Zero Colossus.** Visual cue: Crystallized air, blizzard aura and massive ice plates. Counter: Cold protection and the gaps after blizzard attacks. Phase-based freezing with a recovery interval. Ice armor does not imply Numbness or universal disable immunity.

**108 — The Apex Prime.** Visual cue: Sleek armored mutation, changing limbs and distinct form transitions. Counter: Respond to the active form: intercept pursuit, pierce bastion armor, punish mutation transitions. Use authored forms rather than all traits at once. Pursuit: Dash + Sharp. Bastion: Armored + Heavy Hitter. Unstable: Hybrid-Limbed + Rebis, with a signalled Blood Frenzy transition.

## Original 12 designs: matching existing enemy types

Runtime IDs below come from the current `bestiary-data.js`; the older workbook differs for several names. Artwork filenames remain separate from enemy IDs.

| Artwork | Tier | Existing roster match | Fixed enemy afflictions and traits | Optional | Effects on survivor / encounter |
| --- | --- | --- | --- | --- | --- |
| [Audio Distractor](<C:/Users/Samuel/.codex/.chatgpt-projects/g-p-6ac13e53ed8c819181cd711c64d27081/output/zombie-art/01-audio-distractor.png>) | E | Jingle Skirts (runtime ID 5) | Jingle Skirt; Noise Maker | None | Area noise escalation |
| [Battle Cry Leader](<C:/Users/Samuel/.codex/.chatgpt-projects/g-p-6ac13e53ed8c819181cd711c64d27081/output/zombie-art/02-battle-cry-leader.png>) | E | Pack Caller (runtime ID 6) | Pack Leader; Battle Cry | None | None |
| [Anti-Trap Runner](<C:/Users/Samuel/.codex/.chatgpt-projects/g-p-6ac13e53ed8c819181cd711c64d27081/output/zombie-art/03-anti-trap-runner.png>) | D | Sidestepper (runtime ID 12) | Dash; Nimble; Trap Sidestep | None | None |
| [Frozen Heavy](<C:/Users/Samuel/.codex/.chatgpt-projects/g-p-6ac13e53ed8c819181cd711c64d27081/output/zombie-art/04-frozen-heavy.png>) | D | Frostbitten Shuffler (runtime ID 9) | Frostbite; Heavy; Damp | None | Chill / slow |
| [Domehead Scrap Heavy](<C:/Users/Samuel/.codex/.chatgpt-projects/g-p-6ac13e53ed8c819181cd711c64d27081/output/zombie-art/05-domehead-scrap-heavy.png>) | C | Chrome Dome Bruiser (runtime ID 14) | Chrome Dome; Beefy; Tough Skin | None | None |
| [Acid Sprayer](<C:/Users/Samuel/.codex/.chatgpt-projects/g-p-6ac13e53ed8c819181cd711c64d27081/output/zombie-art/06-acid-sprayer.png>) | C | Acid Spitter (runtime ID 16) | Acid Vomit; Oozing; Hazardous | None | Acid/corrosion damage over time; Contact contamination |
| [Barbed Shackler](<C:/Users/Samuel/.codex/.chatgpt-projects/g-p-6ac13e53ed8c819181cd711c64d27081/output/zombie-art/07-barbed-shackler.png>) | B | Stun-Locker Warden (runtime ID 25) | Shackle; Stun-locker; Heavy | Thorns | Entangle; Brief stagger/stun; Stress or scare on qualifying hits |
| [Obsidian Bladewall](<C:/Users/Samuel/.codex/.chatgpt-projects/g-p-6ac13e53ed8c819181cd711c64d27081/output/zombie-art/08-obsidian-bladewall.png>) | B | Quadruped Grappler (runtime ID 29) | Quadruped; Sharp | None | Bleed buildup if Sharp uses the proposed status behavior |
| [Burrower](<C:/Users/Samuel/.codex/.chatgpt-projects/g-p-6ac13e53ed8c819181cd711c64d27081/output/zombie-art/09-burrower.png>) | A | Burrower Ambusher (runtime ID 35) | Burrower; Sneak | Sharp | Bleed buildup only if Sharp is selected |
| [Volatile Biomass](<C:/Users/Samuel/.codex/.chatgpt-projects/g-p-6ac13e53ed8c819181cd711c64d27081/output/zombie-art/10-volatile-biomass.png>) | A | Pressurized Bloat (runtime ID 36) | Pressurized; Hazardous; Heavy | None | Explosion/shrapnel damage; Stress |
| [Unstable Mutation](<C:/Users/Samuel/.codex/.chatgpt-projects/g-p-6ac13e53ed8c819181cd711c64d27081/output/zombie-art/11-unstable-mutation.png>) | S | Rebis Specimen (runtime ID 44) | Rebis; Hybrid-Limbed | None | Burn in the fire form; Chill in the cold form |
| [Unbound Boss](<C:/Users/Samuel/.codex/.chatgpt-projects/g-p-6ac13e53ed8c819181cd711c64d27081/output/zombie-art/12-unbound-boss.png>) | BOSS | Chained Behemoth (runtime ID 45) | Chained; Heavy; Numbness | None | None |

**Audio Distractor.** Visual cue: Polished copper/steel pans and linked metal armor. Minor audio threat that becomes dangerous if ignored. Armor shine does not grant Conductive.

**Battle Cry Leader.** Visual cue: Horned skull mask, crimson sash and chest-thumping roar. Keep the early escort/buff mechanic readable. Wretched's player damage debuff belongs to a later leader package.

**Anti-Trap Runner.** Visual cue: Reflective visor, airborne feet and attached speed streaks. The supplied design explicitly grants floor-trap avoidance. It does not grant immunity to every form of control.

**Frozen Heavy.** Visual cue: Thick blue ice over arctic clothing and cold foot fog. Existing D-tier elemental introduction. No routine hard Freeze.

**Domehead Scrap Heavy.** Visual cue: Completely sealed metal head and heavy scrap plating. Headshot immunity is specific to the head. Body attacks still work.

**Acid Sprayer.** Visual cue: Glowing green stomach, extended jaw and cone spray. Chemical burn does not imply a separate fire-element aura.

**Barbed Shackler.** Visual cue: Iron collar, trailing shackles and barbed plates. Barbed armor is a player counter in the source. A separate enemy Thorns trait is only a proposed art-supported option.

**Obsidian Bladewall.** Visual cue: Four arms with four serrated obsidian blades. A four-arm wall belongs to the quadruped family. The earlier prompt's eight-limb wording is incompatible with this image.

**Burrower.** Visual cue: Soil-toned scale plates, digging claws and a dirt eruption. Use existing named A-tier identity. The workbook and runtime use different IDs for some original names; this ID is from bestiary-data.js.

**Volatile Biomass.** Visual cue: Taut yellow translucent sacs and a pressure pulse. Explosion trigger belongs to Pressurized. Color alone does not grant poison.

**Unstable Mutation.** Visual cue: Swirling reforming biomass transitions between red-orange and blue-grey. Alternate the elemental package with clear transitions. Do not stack every possible elemental affliction.

**Unbound Boss.** Visual cue: Broken oversized gold and silver chains around an unarmored brute. Disable immunity is explicit. Keep this version unarmored; gold chains are restraints and loot cues.

## Reconciliation notes

- **Generic trait bands versus named enemies:** `TypesTraits` has no F/E bands and places several traits later than the named roster does. Examples include D-tier Frostbite, C-tier Conductive/Acid Vomit/Chrome Dome and B-tier Stun-locker. Preserve those existing named precedents. Earlier new designs use a clearly identified minor variant or a cosmetic cue, rather than silently receiving the later full package.
- **New designs with minor or new early mechanics:** 53–58, 60–64, 68 and 70 contain proposed minor/new treatments. At 55, the dash is the active threat and the ember effect stays cosmetic. At 59, use Moldy rather than full Fungei-layden. These treatments must be authored before they are playable.
- **Art/definition mismatch:** 75 Phantasm Walker and 90 Surgical Abomination need visible scale plaques to communicate Grayscales. Keep the original infection definition. True phasing belongs to a separate proposed mechanic, used only by the authored dimensional bosses.
- **Limb count mismatch:** the original Obsidian Bladewall has four arms/blades, so use Quadruped, not an Octopod wall. 84 Centipede Host uses lower locomotion limbs, while the source Hexapod means six guarding arms. Its locomotion variant is explicitly proposed.
- **Conflicting source semantics:** Sharp's damage/bleed behavior, Battle Hunger's accuracy/damage behavior, Hermit's swarm/defense behavior and Shackle's entangle/resistance wording differ between source sheets. This mapping selects the named bestiary/visual identity and avoids adopting conflicting numerical values. Battle Hunger remains the existing accuracy-ramp behavior; Shackle remains entangling control.
- **Existing runtime scope:** the inspected roster has 45 entries. The 60 new artwork IDs are not proof of runtime integration. Original-name crosswalks use the current runtime IDs, not shifted spreadsheet IDs.

## Sources

- [bestiary-data.js](<E:/Zed_Idler/bestiary-data.js>): Current named roster, tier intent, mechanics and original runtime IDs.
- [zombie_types.xlsx — Tier Legend A1:C9](<E:/Zed_Idler/uploads/zombie_types.xlsx>): Tier purpose reference.
- [Enemy_Mechanics.xlsx — TypesTraits A1:I74](<E:/Zed_Idler/uploads/Enemy_Mechanics.xlsx>): Trait names, candidate tier bands and qualitative mechanics.
- [Enemy_Mechanics.xlsx — AffixesMods A1:D70](<E:/Zed_Idler/uploads/Enemy_Mechanics.xlsx>): Affliction descriptions and cautions; numerical values not adopted.
- [prompts.md](<C:/Users/Samuel/.codex/.chatgpt-projects/g-p-6ac13e53ed8c819181cd711c64d27081/output/bestiary-49-108/prompts.md>): Expanded art briefs.
- [prompts.md](<C:/Users/Samuel/.codex/.chatgpt-projects/g-p-6ac13e53ed8c819181cd711c64d27081/output/zombie-art/prompts.md>): Original art briefs.

