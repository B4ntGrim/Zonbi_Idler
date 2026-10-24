# Zed Idler — 300 Axe Designs

Status: BRAINSTORM / CONTENT INDEX. Prepared 2026-10-24. Counts: 300 designs, 30 historical anchor families, 250 held axes and 50 consumable throwing-axe designs.

These are 300 distinct fictional model proposals inspired by documented historical families, not 300 attested archaeological typologies. Each model has an invented maker, personal name, different shape configuration and candidate playstyle. Rarity upgrades, recolors and owned copies do not count as additional designs. Exact damage, mass, recovery percentages and tier availability remain unset.

## Existing taxonomy mapping

The working code uses `cat: weapon, slot: melee` for held axes and already has `cat: consumable, slot: throwable` for thrown consumables. The current encyclopedia proposes `category → family → manufacturer → model → variant`; these designs belong to `axes/choppers`, with invented makers under decision W1. The six sections below are browsing groups, not new runtime categories or separate mastery currencies. Throwing-axe family contribution must be reconciled with W2: mastery feeds Combat.

The named designs are not automatically Unique-rarity items. A weapon's personal name, construction tier, rarity, condition and set membership are distinct. `draft.*` model IDs and AXE tracking IDs are content proposals, not approved save keys. The existing `combat_axe` remains an existing item and is not silently replaced by any row.

Source context is shared in each group and linked from every JSON record through its source_id. [Full historical source register](axe-historical-sources.md). Each style and stat direction below is fictional; historical use appears separately above its table. Suggested affixes require functioning shared mechanics before they can enter a roll pool. Shield means an absorption pool, not a blocking shield item. Luck does not automatically modify recovery.

| Section | Browse group | Count | Runtime mapping |
|---|---|---:|---|
| C1 | Stone and early hand axes | 50 | weapon / melee |
| C2 | Copper and early metal axes | 50 | weapon / melee |
| C3 | Socketed and working axes | 50 | weapon / melee |
| C4 | Iron hand axes, bearded axes and broad axes | 50 | weapon / melee |
| C5 | Double-bit, broad-blade and prestige-inspired axes | 50 | weapon / melee |
| C6 | Throwing axes — recoverable consumables | 50 | consumable / throwable |

## C1 — Stone and early hand axes

### H01 — Flint tranchet axe

**Site:** Star Carr. **Modern location:** United Kingdom (England). **Culture:** Early Mesolithic communities. **Era:** c. 9000 BCE.

**Historical use/context:** Flint axes used in woodworking; recovered from the lakeside settlement. Excavated settlement; project account. [Historical source](https://www.starcarr.com/history.html).

**Invented maker:** Reedwake. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-001 | **Mara** | leaf-plan head; narrow wedge; short straight haft | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-002 | **Vera** | leaf-plan head; wide oval edge; close-grip haft | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-003 | **Nora** | leaf-plan head; long tapering bit; forward-canted grip | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-004 | **Iris** | leaf-plan head; squared heel; broad palm stop | 2H | Armor; Max HP | lower attack output |
| AXE-005 | **Ada** | leaf-plan head; rounded fan edge; swept haft | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-006 | **Elsie** | leaf-plan head; deep lenticular body; extended handle | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-007 | **Edith** | leaf-plan head; slim pointed toe; curved handle | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-008 | **Hazel** | leaf-plan head; broad trapezoid; braced socket housing | 1H | Luck; Experience | lower combat-stat budget |
| AXE-009 | **Opal** | leaf-plan head; compact rounded bit; twin-lash housing | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-010 | **Mabel** | leaf-plan head; long asymmetrical edge; counterweighted haft | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H02 — Langdale stone axe

**Site:** Great Langdale, Stake Beck axe-production site. **Modern location:** United Kingdom (England). **Culture:** Neolithic communities of northern Britain. **Era:** c. 4000–2350 BCE.

**Historical use/context:** Axe manufacture is directly evidenced by flakes and rough-outs; finished axes circulated beyond the quarry. Excavated production site; specific end-user activities are not established by this record. [Historical source](https://heritagerecords.nationaltrust.org.uk/HBSMR/MonRecord.aspx?skin=printerfriendly&uid=MNA119709).

**Invented maker:** Highfell. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-011 | **Agnes** | long convex-sided head; narrow wedge; short straight haft | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-012 | **Hilda** | long convex-sided head; wide oval edge; close-grip haft | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-013 | **Greta** | long convex-sided head; long tapering bit; forward-canted grip | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-014 | **Ingrid** | long convex-sided head; squared heel; broad palm stop | 2H | Armor; Max HP | lower attack output |
| AXE-015 | **Freya** | long convex-sided head; rounded fan edge; swept haft | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-016 | **Astrid** | long convex-sided head; deep lenticular body; extended handle | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-017 | **Sigrid** | long convex-sided head; slim pointed toe; curved handle | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-018 | **Thora** | long convex-sided head; broad trapezoid; braced socket housing | 1H | Luck; Experience | lower combat-stat budget |
| AXE-019 | **Helga** | long convex-sided head; compact rounded bit; twin-lash housing | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-020 | **Olga** | long convex-sided head; long asymmetrical edge; counterweighted haft | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H03 — Mined-flint axe

**Site:** Grime's Graves. **Modern location:** United Kingdom (England). **Culture:** Late Neolithic / Bronze Age communities. **Era:** Late Neolithic–Bronze Age; mining c. 2600–1500 BCE.

**Historical use/context:** Flint extraction and tool production; axe rough-outs form part of the evidence, although axes were not the site's only or main product. Excavated mining site; date range describes the broader mining tradition. [Historical source](https://www.english-heritage.org.uk/visit/places/grimes-graves-prehistoric-flint-mine/history/collection/).

**Invented maker:** Blackchalk. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-021 | **Bridget** | faceted waisted head; narrow wedge; short straight haft | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-022 | **Maeve** | faceted waisted head; wide oval edge; close-grip haft | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-023 | **Nessa** | faceted waisted head; long tapering bit; forward-canted grip | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-024 | **Orla** | faceted waisted head; squared heel; broad palm stop | 2H | Armor; Max HP | lower attack output |
| AXE-025 | **Una** | faceted waisted head; rounded fan edge; swept haft | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-026 | **Deirdre** | faceted waisted head; deep lenticular body; extended handle | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-027 | **Enid** | faceted waisted head; slim pointed toe; curved handle | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-028 | **Gwen** | faceted waisted head; broad trapezoid; braced socket housing | 1H | Luck; Experience | lower combat-stat budget |
| AXE-029 | **Bronwen** | faceted waisted head; compact rounded bit; twin-lash housing | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-030 | **Rhiannon** | faceted waisted head; long asymmetrical edge; counterweighted haft | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H04 — Polished jadeite-form axe

**Site:** Sweet Track. **Modern location:** United Kingdom (England). **Culture:** Early Neolithic communities of Somerset. **Era:** Early Neolithic; track built c. 3807 BCE.

**Historical use/context:** Stone and flint axes were deposited beside the trackway; an unhafted Alpine jadeite axe supports a votive interpretation. Excavated wetland context; the prestige jadeite example is not evidence of combat use. [Historical source](https://historicengland.org.uk/whats-new/research/back-issues/the-sweet-track-and-climate-change/).

**Invented maker:** Marshlight. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-031 | **Pearl** | thin triangular silhouette; narrow wedge; short straight haft | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-032 | **Ruby** | thin triangular silhouette; wide oval edge; close-grip haft | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-033 | **Coral** | thin triangular silhouette; long tapering bit; forward-canted grip | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-034 | **Jade** | thin triangular silhouette; squared heel; broad palm stop | 2H | Armor; Max HP | lower attack output |
| AXE-035 | **Amber** | thin triangular silhouette; rounded fan edge; swept haft | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-036 | **Beryl** | thin triangular silhouette; deep lenticular body; extended handle | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-037 | **Garnet** | thin triangular silhouette; slim pointed toe; curved handle | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-038 | **Onyx** | thin triangular silhouette; broad trapezoid; braced socket housing | 1H | Luck; Experience | lower combat-stat budget |
| AXE-039 | **Jet** | thin triangular silhouette; compact rounded bit; twin-lash housing | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-040 | **Topaz** | thin triangular silhouette; long asymmetrical edge; counterweighted haft | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H05 — Diabase hand axe

**Site:** Knossos, south of the palace. **Modern location:** Greece (Crete). **Culture:** Neolithic Cretan communities. **Era:** 4500–3600 BCE.

**Historical use/context:** A small polished stone axe comes from residential fill; tools supported farming and processing activities, with individual use uncertain. Museum object Λ1484; excavation context and object date recorded. [Historical source](https://ca.heraklionmuseum.gr/ca/pawtucket/index.php/Detail/objects/803).

**Invented maker:** Hearthstone. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-041 | **Cora** | compact oval head; narrow wedge; short straight haft | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-042 | **Clio** | compact oval head; wide oval edge; close-grip haft | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-043 | **Daphne** | compact oval head; long tapering bit; forward-canted grip | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-044 | **Elena** | compact oval head; squared heel; broad palm stop | 2H | Armor; Max HP | lower attack output |
| AXE-045 | **Ione** | compact oval head; rounded fan edge; swept haft | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-046 | **Lydia** | compact oval head; deep lenticular body; extended handle | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-047 | **Phoebe** | compact oval head; slim pointed toe; curved handle | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-048 | **Selene** | compact oval head; broad trapezoid; braced socket housing | 1H | Luck; Experience | lower combat-stat budget |
| AXE-049 | **Thalia** | compact oval head; compact rounded bit; twin-lash housing | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-050 | **Xenia** | compact oval head; long asymmetrical edge; counterweighted haft | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

## C2 — Copper and early metal axes

### H06 — Alpine copper axe

**Site:** Tisenjoch discovery site (Ötzi). **Modern location:** Italy (South Tyrol; near the Austrian border). **Culture:** Alpine Copper Age communities. **Era:** c. 3300 BCE.

**Historical use/context:** A copper axe accompanied the Iceman as personal equipment; its exact combination of practical and social functions remains debated. Archaeological glacier discovery, not a conventional settlement excavation; no modern nationality assigned to the individual. [Historical source](https://www.iceman.it/en/press/press-releases/35-years-of-otzi-the-iceman---september-19-1991_38029).

**Invented maker:** Passkeeper. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-051 | **Alma** | straight-sided rectangular bit; compact convex bit; curved haft | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-052 | **Anja** | straight-sided rectangular bit; high flared toe; straight grip | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-053 | **Anika** | straight-sided rectangular bit; broad fan edge; short reinforced neck | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-054 | **Elke** | straight-sided rectangular bit; squared heel; extended back-weight | 2H | Armor; Max HP | lower attack output |
| AXE-055 | **Erika** | straight-sided rectangular bit; slim wedge blade; three-band grip | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-056 | **Frieda** | straight-sided rectangular bit; deep crescent edge; long handle | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-057 | **Leni** | straight-sided rectangular bit; flared shoulders; close-control grip | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-058 | **Liesel** | straight-sided rectangular bit; narrow hooked heel; protected haft joint | 1H | Luck; Experience | lower combat-stat budget |
| AXE-059 | **Petra** | straight-sided rectangular bit; long biting toe; swept-back grip | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-060 | **Wilma** | straight-sided rectangular bit; wide rounded belly; heavy haft collar | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H07 — Ur shaft-hole axe

**Site:** Ur, Royal Cemetery. **Modern location:** Iraq. **Culture:** Sumerian, Early Dynastic III. **Era:** c. 2600–2500 BCE.

**Historical use/context:** Copper axes occur in royal-grave contexts and related infantry imagery; the exact owner of the cited axe is unknown. British Museum-authored object record; Royal Cemetery provenance. [Historical source](https://artsandculture.google.com/asset/copper-axe/PwHSy3iIWkEEsg?hl=en).

**Invented maker:** Lowriver. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-061 | **Amara** | deep socket with triangular bit; compact convex bit; curved haft | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-062 | **Adira** | deep socket with triangular bit; high flared toe; straight grip | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-063 | **Aziza** | deep socket with triangular bit; broad fan edge; short reinforced neck | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-064 | **Dalia** | deep socket with triangular bit; squared heel; extended back-weight | 2H | Armor; Max HP | lower attack output |
| AXE-065 | **Leila** | deep socket with triangular bit; slim wedge blade; three-band grip | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-066 | **Nadia** | deep socket with triangular bit; deep crescent edge; long handle | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-067 | **Rima** | deep socket with triangular bit; flared shoulders; close-control grip | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-068 | **Salma** | deep socket with triangular bit; narrow hooked heel; protected haft joint | 1H | Luck; Experience | lower combat-stat budget |
| AXE-069 | **Samira** | deep socket with triangular bit; long biting toe; swept-back grip | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-070 | **Zahra** | deep socket with triangular bit; wide rounded belly; heavy haft collar | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H08 — Egyptian lashed battle axe

**Site:** Thebes, Asasif, burial of Khay. **Modern location:** Egypt. **Culture:** Dynasty 17–early Dynasty 18 Egyptians. **Era:** c. 1580–1458 BCE.

**Historical use/context:** A battle axe was placed in Khay's coffin; its blade, curved wooden haft and restored lashing inform the historical silhouette. Met object 16.10.403a–c; MMA excavations, 1915–16. [Historical source](https://www.metmuseum.org/art/collection/search/546958).

**Invented maker:** Sunforge. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-071 | **Amina** | tall fan blade and lashing tabs; compact convex bit; curved haft | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-072 | **Basma** | tall fan blade and lashing tabs; high flared toe; straight grip | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-073 | **Dina** | tall fan blade and lashing tabs; broad fan edge; short reinforced neck | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-074 | **Farida** | tall fan blade and lashing tabs; squared heel; extended back-weight | 2H | Armor; Max HP | lower attack output |
| AXE-075 | **Hana** | tall fan blade and lashing tabs; slim wedge blade; three-band grip | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-076 | **Iman** | tall fan blade and lashing tabs; deep crescent edge; long handle | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-077 | **Karima** | tall fan blade and lashing tabs; flared shoulders; close-control grip | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-078 | **Malika** | tall fan blade and lashing tabs; narrow hooked heel; protected haft joint | 1H | Luck; Experience | lower combat-stat budget |
| AXE-079 | **Nabila** | tall fan blade and lashing tabs; long biting toe; swept-back grip | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-080 | **Safiya** | tall fan blade and lashing tabs; wide rounded belly; heavy haft collar | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H09 — Small copper parshu

**Site:** Gola Dhoro (Bagasra). **Modern location:** India (Gujarat). **Culture:** Harappan / Indus civilization. **Era:** Harappan Bronze Age; exact axe date not stated in the cited report.

**Historical use/context:** Excavators report a small copper parshu; its size suggests a possible ritual role rather than proving battlefield use. Excavators' account; ritual interpretation is tentative. [Historical source](https://www.harappa.com/goladhoro/copperworking.html).

**Invented maker:** Saltwind. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-081 | **Anaya** | small hooked crescent head; compact convex bit; curved haft | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-082 | **Avani** | small hooked crescent head; high flared toe; straight grip | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-083 | **Diya** | small hooked crescent head; broad fan edge; short reinforced neck | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-084 | **Isha** | small hooked crescent head; squared heel; extended back-weight | 2H | Armor; Max HP | lower attack output |
| AXE-085 | **Kavya** | small hooked crescent head; slim wedge blade; three-band grip | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-086 | **Meera** | small hooked crescent head; deep crescent edge; long handle | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-087 | **Nila** | small hooked crescent head; flared shoulders; close-control grip | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-088 | **Priya** | small hooked crescent head; narrow hooked heel; protected haft joint | 1H | Luck; Experience | lower combat-stat budget |
| AXE-089 | **Tara** | small hooked crescent head; long biting toe; swept-back grip | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-090 | **Veda** | small hooked crescent head; wide rounded belly; heavy haft collar | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H10 — Harappan flat copper axe

**Site:** Lothal. **Modern location:** India (Gujarat). **Culture:** Harappan / Indus civilization. **Era:** Harappan Bronze Age; object-level date not specified.

**Historical use/context:** A copper axe is catalogued as a tool; the record gives Lothal provenance without identifying its precise task. Government antiquities record ASM-KML-GJ-175695; blade reconstruction remains a game interpretation. [Historical source](https://nmma.nic.in/nmma/antiqDetail.do?refId=175695&state=GJ).

**Invented maker:** Harborline. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-091 | **Asha** | broad flat trapezoidal blade; compact convex bit; curved haft | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-092 | **Indira** | broad flat trapezoidal blade; high flared toe; straight grip | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-093 | **Jaya** | broad flat trapezoidal blade; broad fan edge; short reinforced neck | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-094 | **Kiran** | broad flat trapezoidal blade; squared heel; extended back-weight | 2H | Armor; Max HP | lower attack output |
| AXE-095 | **Lata** | broad flat trapezoidal blade; slim wedge blade; three-band grip | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-096 | **Mira** | broad flat trapezoidal blade; deep crescent edge; long handle | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-097 | **Neha** | broad flat trapezoidal blade; flared shoulders; close-control grip | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-098 | **Rani** | broad flat trapezoidal blade; narrow hooked heel; protected haft joint | 1H | Luck; Experience | lower combat-stat budget |
| AXE-099 | **Reva** | broad flat trapezoidal blade; long biting toe; swept-back grip | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-100 | **Sana** | broad flat trapezoidal blade; wide rounded belly; heavy haft collar | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

## C3 — Socketed and working axes

### H11 — Fenland bronze work axe

**Site:** Must Farm. **Modern location:** United Kingdom (England). **Culture:** Late Bronze Age Fenland communities. **Era:** Late Bronze Age; cited overview does not date each axe separately.

**Historical use/context:** Axes form part of household tool kits associated with building and woodworking. Cambridge Archaeological Unit project overview of the excavated settlement. [Historical source](https://www.arch.cam.ac.uk/research/projects/current-projects/must-farm-project/objects-must-farm-site).

**Invented maker:** Fenworks. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-101 | **Bess** | long-neck socket and diamond cheeks; deep socket body; narrow working edge | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-102 | **Blanche** | long-neck socket and diamond cheeks; oval socket profile; flared edge | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-103 | **Constance** | long-neck socket and diamond cheeks; reinforced mouth; compact wedge blade | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-104 | **Dorothy** | long-neck socket and diamond cheeks; long neck; wide fan edge | 2H | Armor; Max HP | lower attack output |
| AXE-105 | **Eleanor** | long-neck socket and diamond cheeks; shallow socket shoulder; extended toe | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-106 | **Florence** | long-neck socket and diamond cheeks; broad socket collar; steep heel | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-107 | **Grace** | long-neck socket and diamond cheeks; slim cheeks; elongated cutting face | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-108 | **Harriet** | long-neck socket and diamond cheeks; offset edge; long hewing grip | 1H | Luck; Experience | lower combat-stat budget |
| AXE-109 | **Isabel** | long-neck socket and diamond cheeks; thick poll; short chopping handle | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-110 | **Joan** | long-neck socket and diamond cheeks; long cutting belly; swept haft | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H12 — Havering bronze work axe

**Site:** Havering Hoard, Wennington. **Modern location:** United Kingdom (England). **Culture:** Late Bronze Age communities; objects include wider exchange connections. **Era:** 900–800 BCE.

**Historical use/context:** Axes and fragments dominate a deliberately buried metal assemblage; woodworking and metal recycling inform interpretation. Excavated hoards; deposition does not establish the owner or use of every object. [Historical source](https://www.londonmuseum.org.uk/collections/london-stories/havering-hoard/).

**Invented maker:** Ashfoundry. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-111 | **Alice** | ribbed socket and low flaring mouth; deep socket body; narrow working edge | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-112 | **Beatrice** | ribbed socket and low flaring mouth; oval socket profile; flared edge | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-113 | **Cecily** | ribbed socket and low flaring mouth; reinforced mouth; compact wedge blade | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-114 | **Dorothea** | ribbed socket and low flaring mouth; long neck; wide fan edge | 2H | Armor; Max HP | lower attack output |
| AXE-115 | **Emmeline** | ribbed socket and low flaring mouth; shallow socket shoulder; extended toe | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-116 | **Frances** | ribbed socket and low flaring mouth; broad socket collar; steep heel | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-117 | **Georgina** | ribbed socket and low flaring mouth; slim cheeks; elongated cutting face | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-118 | **Honora** | ribbed socket and low flaring mouth; offset edge; long hewing grip | 1H | Luck; Experience | lower combat-stat budget |
| AXE-119 | **Imogen** | ribbed socket and low flaring mouth; thick poll; short chopping handle | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-120 | **Jessamine** | ribbed socket and low flaring mouth; long cutting belly; swept haft | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H13 — Borders socketed axe

**Site:** Blyth Bridge hoard. **Modern location:** United Kingdom (Scotland). **Culture:** Late Bronze Age communities of the Scottish Borders. **Era:** Late Bronze Age, approximately 3000 years old.

**Historical use/context:** A socketed axe, metal and mould evidence connect the hoard to bronze production; exact deposition purpose is unresolved. Reported detector discovery followed by archaeological investigation. [Historical source](https://www.nms.ac.uk/discover-catalogue/the-blyth-hoard).

**Invented maker:** Borderbell. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-121 | **Agatha** | stepped socket and tapered flanks; deep socket body; narrow working edge | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-122 | **Bernice** | stepped socket and tapered flanks; oval socket profile; flared edge | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-123 | **Clementine** | stepped socket and tapered flanks; reinforced mouth; compact wedge blade | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-124 | **Dulcie** | stepped socket and tapered flanks; long neck; wide fan edge | 2H | Armor; Max HP | lower attack output |
| AXE-125 | **Esther** | stepped socket and tapered flanks; shallow socket shoulder; extended toe | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-126 | **Felicity** | stepped socket and tapered flanks; broad socket collar; steep heel | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-127 | **Gertrude** | stepped socket and tapered flanks; slim cheeks; elongated cutting face | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-128 | **Henrietta** | stepped socket and tapered flanks; offset edge; long hewing grip | 1H | Luck; Experience | lower combat-stat budget |
| AXE-129 | **Isadora** | stepped socket and tapered flanks; thick poll; short chopping handle | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-130 | **Josephine** | stepped socket and tapered flanks; long cutting belly; swept haft | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H14 — Dong Son socketed axe

**Site:** Dong Son. **Modern location:** Vietnam (Thanh Hoa). **Culture:** Dong Son cultural context; wider regional exchange. **Era:** 3rd century BCE–1st century CE (Cambridge object record).

**Historical use/context:** A socketed copper-alloy axe is recorded from Dong Son; broader museum evidence places such axes among agricultural tools. Cambridge object Z 14957 B records the site; precise find context is limited. [Historical source](https://collections.maa.cam.ac.uk/objects/595403/?page=17613).

**Invented maker:** Riverreed. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-131 | **An** | oval socket and sweeping fan edge; deep socket body; narrow working edge | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-132 | **Chi** | oval socket and sweeping fan edge; oval socket profile; flared edge | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-133 | **Hoa** | oval socket and sweeping fan edge; reinforced mouth; compact wedge blade | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-134 | **Lan** | oval socket and sweeping fan edge; long neck; wide fan edge | 2H | Armor; Max HP | lower attack output |
| AXE-135 | **Lien** | oval socket and sweeping fan edge; shallow socket shoulder; extended toe | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-136 | **Linh** | oval socket and sweeping fan edge; broad socket collar; steep heel | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-137 | **Mai** | oval socket and sweeping fan edge; slim cheeks; elongated cutting face | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-138 | **Ngoc** | oval socket and sweeping fan edge; offset edge; long hewing grip | 1H | Luck; Experience | lower combat-stat budget |
| AXE-139 | **Quynh** | oval socket and sweeping fan edge; thick poll; short chopping handle | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-140 | **Thuy** | oval socket and sweeping fan edge; long cutting belly; swept haft | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H15 — Northeast Thai socketed axe

**Site:** Ban Non Wat. **Modern location:** Thailand. **Culture:** Bronze Age communities of northeast Thailand. **Era:** BA2 phase, c. 1000–900 BCE in the cited author's chronology.

**Historical use/context:** Copper-base axes were deposited in graves, including infant burials; these contexts support status display rather than proving the buried person's tool use. Excavator's published discussion; chronological models differ in this region. [Historical source](https://so06.tci-thaijo.org/index.php/pub_jss/article/download/241802/164451/834437).

**Invented maker:** Redclay. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-141 | **Anong** | broad socket with low transverse shoulder; deep socket body; narrow working edge | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-142 | **Araya** | broad socket with low transverse shoulder; oval socket profile; flared edge | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-143 | **Bua** | broad socket with low transverse shoulder; reinforced mouth; compact wedge blade | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-144 | **Chaba** | broad socket with low transverse shoulder; long neck; wide fan edge | 2H | Armor; Max HP | lower attack output |
| AXE-145 | **Chantara** | broad socket with low transverse shoulder; shallow socket shoulder; extended toe | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-146 | **Dara** | broad socket with low transverse shoulder; broad socket collar; steep heel | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-147 | **Kanya** | broad socket with low transverse shoulder; slim cheeks; elongated cutting face | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-148 | **Lawan** | broad socket with low transverse shoulder; offset edge; long hewing grip | 1H | Luck; Experience | lower combat-stat budget |
| AXE-149 | **Malai** | broad socket with low transverse shoulder; thick poll; short chopping handle | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-150 | **Niran** | broad socket with low transverse shoulder; long cutting belly; swept haft | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

## C4 — Iron hand axes, bearded axes and broad axes

### H16 — Mammen inlaid axe

**Site:** Bjerringhøj, Mammen. **Modern location:** Denmark. **Culture:** Viking Age Danish elite context. **Era:** 970–971 CE (grave timber dating).

**Historical use/context:** A silver-inlaid iron axe accompanied a richly furnished burial; the decoration signals elite identity, with symbolism interpreted in more than one way. National Museum of Denmark object account; exact personal use is not known. [Historical source](https://natmus.dk/museer-og-slotte/nationalmuseet/undervisning-paa-nationalmuseet/undervisningsmaterialer/grundskolen/danmarks-oldtid/undervisningsrollespil/vikingetiden/genstande/roars-oekse/).

**Invented maker:** Widow's Bell. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-151 | **Matilda** | short-beard head with recessed inlay channels; compact bit; high control grip | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-152 | **Delila** | short-beard head with recessed inlay channels; extended beard; close-hand clearance | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-153 | **Judith** | short-beard head with recessed inlay channels; long toe; slim straight haft | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-154 | **Magda** | short-beard head with recessed inlay channels; broad crescent; long two-hand grip | 2H | Armor; Max HP | lower attack output |
| AXE-155 | **Ruth** | short-beard head with recessed inlay channels; squared poll; reinforced neck | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-156 | **Salome** | short-beard head with recessed inlay channels; swept heel; counterbalanced handle | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-157 | **Tabitha** | short-beard head with recessed inlay channels; narrow wedge; hooked pommel | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-158 | **Vesper** | short-beard head with recessed inlay channels; deep cutting belly; protected haft collar | 1H | Luck; Experience | lower combat-stat budget |
| AXE-159 | **Willa** | short-beard head with recessed inlay channels; thin wide edge; flared grip end | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-160 | **Zelda** | short-beard head with recessed inlay channels; heavy rounded poll; extended power haft | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H17 — Birka narrow-blade axe

**Site:** Birka, grave Bj 750. **Modern location:** Sweden. **Culture:** Viking Age Birka burial context; axe identified by museum as Slavic in origin. **Era:** Viking Age; object-level date not specified in the cited record.

**Historical use/context:** A narrow-bladed iron axe was deposited with weapons in a pit associated with a chamber grave. Swedish History Museum object 1138773_HST; find country and design origin are distinguished. [Historical source](https://vikingar.historiska.se/object_details.php?e=&l=en&object=54DB2EC2-85B9-491A-84AD-C02ADEE0DDE6).

**Invented maker:** Northglass. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-161 | **Asta** | narrow blade with lateral haft wings; compact bit; high control grip | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-162 | **Bodil** | narrow blade with lateral haft wings; extended beard; close-hand clearance | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-163 | **Dagmar** | narrow blade with lateral haft wings; long toe; slim straight haft | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-164 | **Ebba** | narrow blade with lateral haft wings; broad crescent; long two-hand grip | 2H | Armor; Max HP | lower attack output |
| AXE-165 | **Frida** | narrow blade with lateral haft wings; squared poll; reinforced neck | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-166 | **Gudrun** | narrow blade with lateral haft wings; swept heel; counterbalanced handle | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-167 | **Hedda** | narrow blade with lateral haft wings; narrow wedge; hooked pommel | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-168 | **Idun** | narrow blade with lateral haft wings; deep cutting belly; protected haft collar | 1H | Luck; Experience | lower combat-stat budget |
| AXE-169 | **Kari** | narrow blade with lateral haft wings; thin wide edge; flared grip end | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-170 | **Liv** | narrow blade with lateral haft wings; heavy rounded poll; extended power haft | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H18 — Langeid broad axe

**Site:** Langeid, grave 8. **Modern location:** Norway. **Culture:** Late Viking Age communities of Setesdal. **Era:** Late Viking Age, around the turn of the 11th century CE.

**Historical use/context:** A broad battle axe with preserved haft fittings lay beside the coffin; the museum identifies this broad-axe tradition as a dedicated fighting weapon. University of Oslo museum object C58882/4, excavated 2011. [Historical source](https://www.khm.uio.no/english/collections/objects/the-langeid-broadaxe.html).

**Invented maker:** Gravewake. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-171 | **Alfhild** | very wide thin crescent head; compact bit; high control grip | 2H | Damage; Crit Damage | slower attack cadence |
| AXE-172 | **Brynhild** | very wide thin crescent head; extended beard; close-hand clearance | 2H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-173 | **Eira** | very wide thin crescent head; long toe; slim straight haft | 2H | Area; Physical Damage | higher weight / slower movement |
| AXE-174 | **Gerd** | very wide thin crescent head; broad crescent; long two-hand grip | 2H | Armor; Max HP | lower attack output |
| AXE-175 | **Hildur** | very wide thin crescent head; squared poll; reinforced neck | 2H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-176 | **Inga** | very wide thin crescent head; swept heel; counterbalanced handle | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-177 | **Ragna** | very wide thin crescent head; narrow wedge; hooked pommel | 2H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-178 | **Ranveig** | very wide thin crescent head; deep cutting belly; protected haft collar | 2H | Luck; Experience | lower combat-stat budget |
| AXE-179 | **Solveig** | very wide thin crescent head; thin wide edge; flared grip end | 2H | Shield; Regen/s | requires absorption-shield support |
| AXE-180 | **Torunn** | very wide thin crescent head; heavy rounded poll; extended power haft | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H19 — Hedeby iron axe

**Site:** Haithabu / Hedeby. **Modern location:** Germany (Schleswig-Holstein). **Culture:** Viking Age trading-settlement context. **Era:** 10th–11th century CE.

**Historical use/context:** An iron axe is catalogued from Haithabu; the cited exhibition list does not establish whether that individual object served craft work or combat. Official museum exhibition inventory; functional interpretation remains open. [Historical source](https://www.smb.museum/fileadmin/website/Presse/Pressematerial/2018/09/05_MVF_180920_BewegteZeiten_Werkliste.pdf).

**Invented maker:** Tideforge. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-181 | **Alva** | long squared neck and low beard; compact bit; high control grip | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-182 | **Elin** | long squared neck and low beard; extended beard; close-hand clearance | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-183 | **Estrid** | long squared neck and low beard; long toe; slim straight haft | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-184 | **Hanne** | long squared neck and low beard; broad crescent; long two-hand grip | 2H | Armor; Max HP | lower attack output |
| AXE-185 | **Jorunn** | long squared neck and low beard; squared poll; reinforced neck | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-186 | **Kirsten** | long squared neck and low beard; swept heel; counterbalanced handle | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-187 | **Linnea** | long squared neck and low beard; narrow wedge; hooked pommel | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-188 | **Marit** | long squared neck and low beard; deep cutting belly; protected haft collar | 1H | Luck; Experience | lower combat-stat budget |
| AXE-189 | **Siv** | long squared neck and low beard; thin wide edge; flared grip end | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-190 | **Tove** | long squared neck and low beard; heavy rounded poll; extended power haft | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H20 — Jamestown felling / broad axe

**Site:** James Fort, Jamestown. **Modern location:** United States (Virginia). **Culture:** English colonial settlement; maker origin unknown. **Era:** 17th century CE.

**Historical use/context:** Excavated felling axes cut timber and broad axes hewed construction wood; the provider explicitly records wear from use. Jamestown Rediscovery excavation collection; no claim of Indigenous manufacture. [Historical source](https://historicjamestowne.org/collections/artifacts/axes/).

**Invented maker:** Palisade. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-191 | **Abigail** | broad squared hewing head; compact bit; high control grip | 1H | Damage; Crit Damage | slower attack cadence |
| AXE-192 | **Bethany** | broad squared hewing head; extended beard; close-hand clearance | 1H | Atk. speed; Crit Chance | lower damage per hit |
| AXE-193 | **Charity** | broad squared hewing head; long toe; slim straight haft | 1H | Area; Physical Damage | higher weight / slower movement |
| AXE-194 | **Deborah** | broad squared hewing head; broad crescent; long two-hand grip | 2H | Armor; Max HP | lower attack output |
| AXE-195 | **Elizabeth** | broad squared hewing head; squared poll; reinforced neck | 1H | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-196 | **Faith** | broad squared hewing head; swept heel; counterbalanced handle | 2H | Lifesteal; Healing | lower direct burst damage |
| AXE-197 | **Hope** | broad squared hewing head; narrow wedge; hooked pommel | 1H | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-198 | **Temperance** | broad squared hewing head; deep cutting belly; protected haft collar | 1H | Luck; Experience | lower combat-stat budget |
| AXE-199 | **Verity** | broad squared hewing head; thin wide edge; flared grip end | 1H | Shield; Regen/s | requires absorption-shield support |
| AXE-200 | **Winifred** | broad squared hewing head; heavy rounded poll; extended power haft | 2H | Special Damage; Duration | requires an explicit nonphysical attack or effect |

## C5 — Double-bit, broad-blade and prestige-inspired axes

### H21 — Vasiliki double-axe form

**Site:** Vasiliki, northwest hillside house. **Modern location:** Greece (Crete). **Culture:** Early Minoan communities. **Era:** 2400–2200 BCE.

**Historical use/context:** A bronze mould demonstrates double-axe manufacture or wax-model production; it does not demonstrate a particular axe's battlefield use. Heraklion museum mould Χ1466; manufacturing evidence rather than a surviving combat axe. [Historical source](https://ca.heraklionmuseum.gr/ca/pawtucket/index.php/Detail/objects/415).

**Invented maker:** Twinwake. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-201 | **Ariadne** | twin compact triangular wings; wide paired wings; straight long haft | 2H (adapted) | Damage; Crit Damage | slower attack cadence |
| AXE-202 | **Asteria** | twin compact triangular wings; narrow paired wings; curved haft | 2H (adapted) | Atk. speed; Crit Chance | lower damage per hit |
| AXE-203 | **Callista** | twin compact triangular wings; broad single fan; long reinforced neck | 2H (adapted) | Area; Physical Damage | higher weight / slower movement |
| AXE-204 | **Chloe** | twin compact triangular wings; deep single crescent; counterweighted grip | 2H (adapted) | Armor; Max HP | lower attack output |
| AXE-205 | **Electra** | twin compact triangular wings; compact opposing edges; close-control haft | 1H (adapted) | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-206 | **Evadne** | twin compact triangular wings; long trapezoid bit; heavy collar | 2H (adapted) | Lifesteal; Healing | lower direct burst damage |
| AXE-207 | **Galatea** | twin compact triangular wings; swept leading toe; shielded haft joint | 2H (adapted) | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-208 | **Helena** | twin compact triangular wings; asymmetric broad edge; long hewing grip | 2H (adapted) | Luck; Experience | lower combat-stat budget |
| AXE-209 | **Ianthe** | twin compact triangular wings; rounded twin faces; two-hand palm stops | 2H (adapted) | Shield; Regen/s | requires absorption-shield support |
| AXE-210 | **Melina** | twin compact triangular wings; high single crown; extended power haft | 2H (adapted) | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H22 — Arkalochori double axe

**Site:** Arkalochori Cave. **Modern location:** Greece (Crete). **Culture:** Minoan communities. **Era:** 1700–1450 BCE.

**Historical use/context:** Thin double axes in bronze, silver and gold belong to a probably votive assemblage; their symbolic role must be distinguished from game combat adaptations. Museum account of excavations in a cave sanctuary context. [Historical source](https://www.heraklionmuseum.gr/en/exhibit/bronze-swords-daggers-and-axes/).

**Invented maker:** Hollowcrown. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-211 | **Aella** | twin extended crescent wings; wide paired wings; straight long haft | 2H (adapted) | Damage; Crit Damage | slower attack cadence |
| AXE-212 | **Anthea** | twin extended crescent wings; narrow paired wings; curved haft | 2H (adapted) | Atk. speed; Crit Chance | lower damage per hit |
| AXE-213 | **Calypso** | twin extended crescent wings; broad single fan; long reinforced neck | 2H (adapted) | Area; Physical Damage | higher weight / slower movement |
| AXE-214 | **Cyra** | twin extended crescent wings; deep single crescent; counterweighted grip | 2H (adapted) | Armor; Max HP | lower attack output |
| AXE-215 | **Despoina** | twin extended crescent wings; compact opposing edges; close-control haft | 1H (adapted) | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-216 | **Eudora** | twin extended crescent wings; long trapezoid bit; heavy collar | 2H (adapted) | Lifesteal; Healing | lower direct burst damage |
| AXE-217 | **Kalliope** | twin extended crescent wings; swept leading toe; shielded haft joint | 2H (adapted) | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-218 | **Myra** | twin extended crescent wings; asymmetric broad edge; long hewing grip | 2H (adapted) | Luck; Experience | lower combat-stat budget |
| AXE-219 | **Nyssa** | twin extended crescent wings; rounded twin faces; two-hand palm stops | 2H (adapted) | Shield; Regen/s | requires absorption-shield support |
| AXE-220 | **Theodora** | twin extended crescent wings; high single crown; extended power haft | 2H (adapted) | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H23 — Shang yue-form axe

**Site:** Anyang / Yinxu; Fu Hao tomb comparisons. **Modern location:** China (Henan). **Culture:** Late Shang communities. **Era:** Late Shang, approximately 1300–1050 BCE.

**Historical use/context:** Yue axe forms had ceremonial and authority roles; the cited jade record discusses excavated Fu Hao tomb parallels, not ordinary infantry equipment. Smithsonian museum comparandum; its own provenance is probable Anyang, not a claimed excavation from Fu Hao's tomb. [Historical source](https://publications.asia.si.edu/jades/object.php?q=31763).

**Invented maker:** Giltedge. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-221 | **Anlan** | tall notched fan blade; wide single blade; straight long haft | 1H (adapted) | Damage; Crit Damage | slower attack cadence |
| AXE-222 | **Baihe** | tall notched fan blade; narrow tall blade; curved haft | 1H (adapted) | Atk. speed; Crit Chance | lower damage per hit |
| AXE-223 | **Chunhua** | tall notched fan blade; broad single fan; long reinforced neck | 1H (adapted) | Area; Physical Damage | higher weight / slower movement |
| AXE-224 | **Daiyu** | tall notched fan blade; deep single crescent; counterweighted grip | 2H (adapted) | Armor; Max HP | lower attack output |
| AXE-225 | **Fang** | tall notched fan blade; compact single edge; close-control haft | 1H (adapted) | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-226 | **Hong** | tall notched fan blade; long trapezoid bit; heavy collar | 2H (adapted) | Lifesteal; Healing | lower direct burst damage |
| AXE-227 | **Jing** | tall notched fan blade; swept leading toe; shielded haft joint | 1H (adapted) | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-228 | **Lian** | tall notched fan blade; asymmetric broad edge; long hewing grip | 1H (adapted) | Luck; Experience | lower combat-stat budget |
| AXE-229 | **Mei** | tall notched fan blade; rounded single face; two-hand palm stops | 1H (adapted) | Shield; Regen/s | requires absorption-shield support |
| AXE-230 | **Qiao** | tall notched fan blade; high single crown; extended power haft | 2H (adapted) | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H24 — Inka trapezoid / crescent axe

**Site:** Machu Picchu. **Modern location:** Peru. **Culture:** Inka / Late Horizon communities. **Era:** Late Horizon, broadly 15th–early 16th century CE.

**Historical use/context:** The excavation collection includes multiple axe forms; the author distinguishes excavated pieces from nearby acquisitions and later purchases. Exact uses of the selected forms remain uncertain. Research author's chapter using excavation assemblages; designs draw only on the stated excavated forms. [Historical source](https://bruceowen.com/research/Owen2012-TheMeaningsOfMetals-TheIncaAndRegionalContextsOfQuotidianMetalsFromMachuPicchu.pdf).

**Invented maker:** Hightrail. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-231 | **Amaya** | flared trapezoid and crescent transition; wide single blade; straight long haft | 2H (adapted) | Damage; Crit Damage | slower attack cadence |
| AXE-232 | **Anahi** | flared trapezoid and crescent transition; narrow tall blade; curved haft | 2H (adapted) | Atk. speed; Crit Chance | lower damage per hit |
| AXE-233 | **Elvira** | flared trapezoid and crescent transition; broad single fan; long reinforced neck | 2H (adapted) | Area; Physical Damage | higher weight / slower movement |
| AXE-234 | **Ines** | flared trapezoid and crescent transition; deep single crescent; counterweighted grip | 2H (adapted) | Armor; Max HP | lower attack output |
| AXE-235 | **Lucia** | flared trapezoid and crescent transition; compact single edge; close-control haft | 1H (adapted) | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-236 | **Marisol** | flared trapezoid and crescent transition; long trapezoid bit; heavy collar | 2H (adapted) | Lifesteal; Healing | lower direct burst damage |
| AXE-237 | **Nayra** | flared trapezoid and crescent transition; swept leading toe; shielded haft joint | 2H (adapted) | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-238 | **Paloma** | flared trapezoid and crescent transition; asymmetric broad edge; long hewing grip | 2H (adapted) | Luck; Experience | lower combat-stat budget |
| AXE-239 | **Rocio** | flared trapezoid and crescent transition; rounded single face; two-hand palm stops | 2H (adapted) | Shield; Regen/s | requires absorption-shield support |
| AXE-240 | **Solana** | flared trapezoid and crescent transition; high single crown; extended power haft | 2H (adapted) | Special Damage; Duration | requires an explicit nonphysical attack or effect |

### H25 — San Sosti dedication axe

**Site:** San Sosti vicinity. **Modern location:** Italy (Calabria). **Culture:** Western Greek / Sybarite tradition. **Era:** c. 520 BCE.

**Historical use/context:** An inscribed ceremonial bronze axe was dedicated as a religious offering; game combat versions are fictional reforgings. British Museum object 1884,0614.31; near-site findspot rather than a securely specified modern excavation context. [Historical source](https://www.britishmuseum.org/collection/object/G_1884-0614-31).

**Invented maker:** Oathmetal. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-241 | **Alessia** | stepped neck and rectangular body; wide single blade; straight long haft | 1H (adapted) | Damage; Crit Damage | slower attack cadence |
| AXE-242 | **Bianca** | stepped neck and rectangular body; narrow tall blade; curved haft | 1H (adapted) | Atk. speed; Crit Chance | lower damage per hit |
| AXE-243 | **Carlotta** | stepped neck and rectangular body; broad single fan; long reinforced neck | 1H (adapted) | Area; Physical Damage | higher weight / slower movement |
| AXE-244 | **Donatella** | stepped neck and rectangular body; deep single crescent; counterweighted grip | 2H (adapted) | Armor; Max HP | lower attack output |
| AXE-245 | **Fiorella** | stepped neck and rectangular body; compact single edge; close-control haft | 1H (adapted) | Status Chance; Status Damage | requires an explicitly defined status effect |
| AXE-246 | **Giada** | stepped neck and rectangular body; long trapezoid bit; heavy collar | 2H (adapted) | Lifesteal; Healing | lower direct burst damage |
| AXE-247 | **Luciana** | stepped neck and rectangular body; swept leading toe; shielded haft joint | 1H (adapted) | Damage to Elites; Vulnerable Damage | conditional bonuses need eligible targets |
| AXE-248 | **Ottavia** | stepped neck and rectangular body; asymmetric broad edge; long hewing grip | 1H (adapted) | Luck; Experience | lower combat-stat budget |
| AXE-249 | **Renata** | stepped neck and rectangular body; rounded single face; two-hand palm stops | 1H (adapted) | Shield; Regen/s | requires absorption-shield support |
| AXE-250 | **Violetta** | stepped neck and rectangular body; high single crown; extended power haft | 2H (adapted) | Special Damage; Duration | requires an explicit nonphysical attack or effect |

## C6 — Throwing axes — recoverable consumables

### H26 — Howletts francisca

**Site:** Howletts cemetery, Littlebourne. **Modern location:** United Kingdom (England). **Culture:** Early Anglo-Saxon / Merovingian connections. **Era:** Late 5th century CE.

**Historical use/context:** An iron francisca head with metal decoration comes from a cemetery; its weapon family is associated with throwing and close combat, but that individual's use is unobserved. British Museum object 1938,1006.1; excavated/findspot cemetery attribution. [Historical source](https://www.britishmuseum.org/collection/object/H_1938-1006-1).

**Invented maker:** Lastmile. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-251 | **Adelaide** | S-back head and projected toe; swept spine; compact straight grip | Consumable throw | Projectiles/s; Projectile Speed | lower per-axe damage |
| AXE-252 | **Bertha** | S-back head and projected toe; high toe; tapered release grip | Consumable throw | Damage; Crit Damage | slower release |
| AXE-253 | **Clotilde** | S-back head and projected toe; bell-flared edge; short round haft | Consumable throw | Area; Physical Damage | requires a defined multi-target footprint |
| AXE-254 | **Edwina** | S-back head and projected toe; squared poll; forward-weighted grip | Consumable throw | Recovery Chance; Luck | Luck does not increase recovery unless explicitly allowed |
| AXE-255 | **Ethel** | S-back head and projected toe; deep heel; flared hand stop | Consumable throw | Status Chance; Status Damage | requires an authored status profile |
| AXE-256 | **Gisela** | S-back head and projected toe; raked neck; slim release handle | Consumable throw | Projectile Speed; Duration | duration means flight/effect life, not free damage |
| AXE-257 | **Millicent** | S-back head and projected toe; long toe; reinforced short haft | Consumable throw | Damage to Elites; Vulnerable Damage | conditional target bonuses |
| AXE-258 | **Odette** | S-back head and projected toe; rounded belly; neutral-balance grip | Consumable throw | Crit Chance; Recovery Chance | lower peak damage |
| AXE-259 | **Rosamund** | S-back head and projected toe; wide crescent; long throwing grip | Consumable throw | Recovery Chance; Experience | lower direct damage |
| AXE-260 | **Thelma** | S-back head and projected toe; narrow flared bit; back-weighted haft | Consumable throw | Damage; Area | slower release / heavier stack |

### H27 — Londinières bell axe

**Site:** Londinières, cemetery at the foot of Mont Blanc. **Modern location:** France (Normandy). **Culture:** Merovingian communities. **Era:** 6th century CE.

**Historical use/context:** The museum classifies an iron axe with surviving haft material as a francisca / throwing axe; it was associated with other grave goods. British Museum object 1856,0701.1416; Mont Blanc is the local cemetery location, not the Alpine mountain. [Historical source](https://www.britishmuseum.org/collection/object/H_1856-0701-1416).

**Invented maker:** Bellthorn. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-261 | **Adeline** | bell head and rounded lower heel; swept spine; compact straight grip | Consumable throw | Projectiles/s; Projectile Speed | lower per-axe damage |
| AXE-262 | **Bertille** | bell head and rounded lower heel; high toe; tapered release grip | Consumable throw | Damage; Crit Damage | slower release |
| AXE-263 | **Colette** | bell head and rounded lower heel; bell-flared edge; short round haft | Consumable throw | Area; Physical Damage | requires a defined multi-target footprint |
| AXE-264 | **Denise** | bell head and rounded lower heel; squared poll; forward-weighted grip | Consumable throw | Recovery Chance; Luck | Luck does not increase recovery unless explicitly allowed |
| AXE-265 | **Estelle** | bell head and rounded lower heel; deep heel; flared hand stop | Consumable throw | Status Chance; Status Damage | requires an authored status profile |
| AXE-266 | **Fleur** | bell head and rounded lower heel; raked neck; slim release handle | Consumable throw | Projectile Speed; Duration | duration means flight/effect life, not free damage |
| AXE-267 | **Genevieve** | bell head and rounded lower heel; long toe; reinforced short haft | Consumable throw | Damage to Elites; Vulnerable Damage | conditional target bonuses |
| AXE-268 | **Heloise** | bell head and rounded lower heel; rounded belly; neutral-balance grip | Consumable throw | Crit Chance; Recovery Chance | lower peak damage |
| AXE-269 | **Jeanne** | bell head and rounded lower heel; wide crescent; long throwing grip | Consumable throw | Recovery Chance; Experience | lower direct damage |
| AXE-270 | **Lucille** | bell head and rounded lower heel; narrow flared bit; back-weighted haft | Consumable throw | Damage; Area | slower release / heavier stack |

### H28 — Waben francisca

**Site:** Waben. **Modern location:** France (Pas-de-Calais). **Culture:** Merovingian communities. **Era:** 6th century CE.

**Historical use/context:** A francisca / throwing-axe record supplies the historical family and findspot; the consulted index does not provide a detailed grave context. British Museum object 1863,1222.3; limited findspot metadata, direct page access restricted during this research. [Historical source](https://www.britishmuseum.org/collection/object/H_1863-1222-3).

**Invented maker:** Greyrook. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-271 | **Adele** | compact arched back and short bit; swept spine; compact straight grip | Consumable throw | Projectiles/s; Projectile Speed | lower per-axe damage |
| AXE-272 | **Brigitte** | compact arched back and short bit; high toe; tapered release grip | Consumable throw | Damage; Crit Damage | slower release |
| AXE-273 | **Camille** | compact arched back and short bit; bell-flared edge; short round haft | Consumable throw | Area; Physical Damage | requires a defined multi-target footprint |
| AXE-274 | **Delphine** | compact arched back and short bit; squared poll; forward-weighted grip | Consumable throw | Recovery Chance; Luck | Luck does not increase recovery unless explicitly allowed |
| AXE-275 | **Elodie** | compact arched back and short bit; deep heel; flared hand stop | Consumable throw | Status Chance; Status Damage | requires an authored status profile |
| AXE-276 | **Fabienne** | compact arched back and short bit; raked neck; slim release handle | Consumable throw | Projectile Speed; Duration | duration means flight/effect life, not free damage |
| AXE-277 | **Ghislaine** | compact arched back and short bit; long toe; reinforced short haft | Consumable throw | Damage to Elites; Vulnerable Damage | conditional target bonuses |
| AXE-278 | **Jacqueline** | compact arched back and short bit; rounded belly; neutral-balance grip | Consumable throw | Crit Chance; Recovery Chance | lower peak damage |
| AXE-279 | **Madeleine** | compact arched back and short bit; wide crescent; long throwing grip | Consumable throw | Recovery Chance; Experience | lower direct damage |
| AXE-280 | **Noelle** | compact arched back and short bit; narrow flared bit; back-weighted haft | Consumable throw | Damage; Area | slower release / heavier stack |

### H29 — Saint-Dizier throwing axe

**Site:** Saint-Dizier, La Tuilerie, burial 13. **Modern location:** France (Haute-Marne). **Culture:** Merovingian / Frankish elite context. **Era:** 525–550 CE.

**Historical use/context:** Inrap identifies the profiled axe as a rotating throwing weapon and records preserved ash haft material. Excavating institution's publication; use the detailed axe account rather than the simplified double-edge wording in a separate press sheet. [Historical source](https://multimedia.inrap.fr/userdata/flash/Les-tombes-de-Saint-Dizier/datas/pdf/TombesSaintDizier.pdf).

**Invented maker:** Ashfall. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-281 | **Aveline** | raked eye and low hooking heel; swept spine; compact straight grip | Consumable throw | Projectiles/s; Projectile Speed | lower per-axe damage |
| AXE-282 | **Clarisse** | raked eye and low hooking heel; high toe; tapered release grip | Consumable throw | Damage; Crit Damage | slower release |
| AXE-283 | **Emilie** | raked eye and low hooking heel; bell-flared edge; short round haft | Consumable throw | Area; Physical Damage | requires a defined multi-target footprint |
| AXE-284 | **Flavie** | raked eye and low hooking heel; squared poll; forward-weighted grip | Consumable throw | Recovery Chance; Luck | Luck does not increase recovery unless explicitly allowed |
| AXE-285 | **Gaelle** | raked eye and low hooking heel; deep heel; flared hand stop | Consumable throw | Status Chance; Status Damage | requires an authored status profile |
| AXE-286 | **Isabeau** | raked eye and low hooking heel; raked neck; slim release handle | Consumable throw | Projectile Speed; Duration | duration means flight/effect life, not free damage |
| AXE-287 | **Josette** | raked eye and low hooking heel; long toe; reinforced short haft | Consumable throw | Damage to Elites; Vulnerable Damage | conditional target bonuses |
| AXE-288 | **Laure** | raked eye and low hooking heel; rounded belly; neutral-balance grip | Consumable throw | Crit Chance; Recovery Chance | lower peak damage |
| AXE-289 | **Mathilde** | raked eye and low hooking heel; wide crescent; long throwing grip | Consumable throw | Recovery Chance; Experience | lower direct damage |
| AXE-290 | **Perrine** | raked eye and low hooking heel; narrow flared bit; back-weighted haft | Consumable throw | Damage; Area | slower release / heavier stack |

### H30 — Montcaret proto-francisca

**Site:** Montcaret. **Modern location:** France (Dordogne). **Culture:** Late Roman / early Merovingian-era martial context. **Era:** Mid-5th century CE.

**Historical use/context:** An iron proto-francisca with an S-profile is documented from an early drawing. Its exact use is inferred from typology; throwing capability in this catalogue is a game adaptation. Archaeological publication; reconstructed morphology and function have explicit uncertainty. [Historical source](https://una-editions.fr/objets-merovingiens/).

**Invented maker:** Oldroad. All following shapes, names and stat directions are game adaptations.

| ID | Name | Fictional style configuration | Hands / use | Candidate stat direction | Cost / condition |
|---|---|---|---|---|---|
| AXE-291 | **Anais** | inclined socket and paired neck flanges; swept spine; compact straight grip | Consumable throw | Projectiles/s; Projectile Speed | lower per-axe damage |
| AXE-292 | **Blandine** | inclined socket and paired neck flanges; high toe; tapered release grip | Consumable throw | Damage; Crit Damage | slower release |
| AXE-293 | **Coralie** | inclined socket and paired neck flanges; bell-flared edge; short round haft | Consumable throw | Area; Physical Damage | requires a defined multi-target footprint |
| AXE-294 | **Eugenie** | inclined socket and paired neck flanges; squared poll; forward-weighted grip | Consumable throw | Recovery Chance; Luck | Luck does not increase recovery unless explicitly allowed |
| AXE-295 | **Floriane** | inclined socket and paired neck flanges; deep heel; flared hand stop | Consumable throw | Status Chance; Status Damage | requires an authored status profile |
| AXE-296 | **Germaine** | inclined socket and paired neck flanges; raked neck; slim release handle | Consumable throw | Projectile Speed; Duration | duration means flight/effect life, not free damage |
| AXE-297 | **Louise** | inclined socket and paired neck flanges; long toe; reinforced short haft | Consumable throw | Damage to Elites; Vulnerable Damage | conditional target bonuses |
| AXE-298 | **Margot** | inclined socket and paired neck flanges; rounded belly; neutral-balance grip | Consumable throw | Crit Chance; Recovery Chance | lower peak damage |
| AXE-299 | **Sabine** | inclined socket and paired neck flanges; wide crescent; long throwing grip | Consumable throw | Recovery Chance; Experience | lower direct damage |
| AXE-300 | **Yvette** | inclined socket and paired neck flanges; narrow flared bit; back-weighted haft | Consumable throw | Damage; Area | slower release / heavier stack |

## Content-to-game instructions

- Do not bulk-import this index into `ZI.GEAR_ITEMS`; first map the catalogue to the current item and instance model.
- Keep the historical origin in provenance fields and the invented maker/model in game-facing identity fields.
- Define construction and eligible rarities independently. An older archaeological design is not inherently weaker, rarer or anomalous.
- Use each base silhouette for different construction tiers where believable. Modern alloys or RMAT reinterpretations are explicitly fictional and must respect source restrictions.
- Ordinary held axes fit `melee`; only approved light one-handed models may later fit Off-hand. Two-handed models block Off-hand. Throwing consumables use the existing Throw slot and never contribute passive weapon damage.
- Design the throwing attack profile and recovery settlement before enabling the 50 consumables. Do not reuse grenade instant-kill behavior.
- Keep all 300 as content candidates. Roll out a small complete slice before expanding loot or Shop pools.


