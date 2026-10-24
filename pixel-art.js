
// Zombie Idler — Pixel Art Generator
// All art rendered as SVG with 8x8 or 16x16 pixel grid aesthetic
// Each function returns an SVG string

window.ZI_ART = window.ZI_ART || {};

// ─── PALETTE ──────────────────────────────────────────────────────────────────
const P = {
  // Warm decay palette
  black:   '#0f0e0c', darkbg:  '#1a1814', midbg:   '#2e2820',
  amber:   '#c8a96e', amber2:  '#e8c98e', rust:    '#8b3a2a',
  red:     '#c8612a', green:   '#4caf7d', green2:  '#7ab87a',
  blue:    '#4a8ec2', purple:  '#a855f7', gray:    '#5a5040',
  gray2:   '#8a7d68', white:   '#d4c9b0', yellow:  '#f0d060',
  blood:   '#6b1a1a', bone:    '#d4c9a0', bark:    '#4a3828',
  metal:   '#607080', rust2:   '#8b5030',
};

// Helper: render pixel grid as SVG
function pixelGrid(pixels, palette, cellSize=4, width, height) {
  const cols = width || Math.sqrt(pixels.length);
  const rows = height || Math.ceil(pixels.length / cols);
  const svgW = cols * cellSize;
  const svgH = rows * cellSize;
  let rects = '';
  pixels.forEach((c, i) => {
    if (!c || c === ' ') return;
    const x = (i % cols) * cellSize;
    const y = Math.floor(i / cols) * cellSize;
    const color = palette[c] || c;
    rects += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${color}"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgW} ${svgH}" width="${svgW}" height="${svgH}" shape-rendering="crispEdges">${rects}</svg>`;
}

// ─── BUILDINGS ────────────────────────────────────────────────────────────────
ZI_ART.buildings = {
  farm: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24" width="64" height="48" shape-rendering="crispEdges">
    <!-- Ground -->
    <rect x="0" y="18" width="32" height="6" fill="${P.bark}"/>
    <!-- Crops rows -->
    <rect x="2" y="14" width="2" height="4" fill="${P.green}"/>
    <rect x="6" y="12" width="2" height="6" fill="${P.green2}"/>
    <rect x="10" y="13" width="2" height="5" fill="${P.green}"/>
    <rect x="14" y="11" width="2" height="7" fill="${P.green2}"/>
    <rect x="18" y="14" width="2" height="4" fill="${P.green}"/>
    <rect x="22" y="12" width="2" height="6" fill="${P.green2}"/>
    <rect x="26" y="13" width="2" height="5" fill="${P.green}"/>
    <!-- Fence posts -->
    <rect x="0" y="14" width="1" height="6" fill="${P.amber}"/>
    <rect x="31" y="14" width="1" height="6" fill="${P.amber}"/>
    <rect x="0" y="16" width="32" height="1" fill="${P.amber}"/>
    <!-- Small barn -->
    <rect x="12" y="6" width="8" height="8" fill="${P.rust2}"/>
    <polygon points="12,6 16,2 20,6" fill="${P.rust}"/>
    <rect x="14" y="10" width="4" height="4" fill="${P.black}"/>
    <!-- Soil dots -->
    <rect x="4" y="17" width="1" height="1" fill="${P.amber2}"/>
    <rect x="8" y="17" width="1" height="1" fill="${P.amber2}"/>
    <rect x="20" y="17" width="1" height="1" fill="${P.amber2}"/>
  </svg>`,

  workshop: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24" width="64" height="48" shape-rendering="crispEdges">
    <!-- Building -->
    <rect x="2" y="8" width="28" height="16" fill="${P.metal}"/>
    <!-- Roof -->
    <rect x="2" y="6" width="28" height="3" fill="${P.gray}"/>
    <polygon points="2,8 16,2 30,8" fill="${P.gray2}"/>
    <!-- Windows -->
    <rect x="5" y="12" width="5" height="4" fill="${P.blue}" opacity="0.7"/>
    <rect x="22" y="12" width="5" height="4" fill="${P.blue}" opacity="0.7"/>
    <!-- Door -->
    <rect x="13" y="16" width="6" height="8" fill="${P.darkbg}"/>
    <!-- Gear icon on wall -->
    <rect x="14" y="10" width="4" height="4" fill="${P.amber}" opacity="0.6"/>
    <rect x="15" y="9" width="2" height="6" fill="${P.amber}" opacity="0.6"/>
    <rect x="13" y="11" width="6" height="2" fill="${P.amber}" opacity="0.6"/>
    <!-- Smoke stack -->
    <rect x="24" y="2" width="3" height="6" fill="${P.gray}"/>
    <rect x="23" y="1" width="5" height="2" fill="${P.gray2}"/>
    <rect x="24" y="0" width="3" height="2" fill="${P.white}" opacity="0.3"/>
  </svg>`,

  watchtower: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32" width="48" height="64" shape-rendering="crispEdges">
    <!-- Tower legs -->
    <rect x="2" y="16" width="3" height="16" fill="${P.bark}"/>
    <rect x="19" y="16" width="3" height="16" fill="${P.bark}"/>
    <rect x="8" y="20" width="3" height="12" fill="${P.bark}"/>
    <rect x="13" y="20" width="3" height="12" fill="${P.bark}"/>
    <!-- Cross braces -->
    <rect x="2" y="24" width="20" height="2" fill="${P.bark}"/>
    <!-- Platform -->
    <rect x="0" y="12" width="24" height="4" fill="${P.amber}"/>
    <!-- Cabin -->
    <rect x="2" y="4" width="20" height="10" fill="${P.rust2}"/>
    <!-- Roof -->
    <polygon points="0,4 12,0 24,4" fill="${P.rust}"/>
    <!-- Window slot -->
    <rect x="5" y="6" width="4" height="3" fill="${P.black}"/>
    <rect x="15" y="6" width="4" height="3" fill="${P.black}"/>
    <!-- Spotlight -->
    <rect x="10" y="2" width="4" height="3" fill="${P.yellow}" opacity="0.8"/>
  </svg>`,

  medtent: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24" width="64" height="48" shape-rendering="crispEdges">
    <!-- Tent body -->
    <polygon points="2,22 16,4 30,22" fill="${P.white}" opacity="0.85"/>
    <polygon points="2,22 16,4 30,22" fill="none" stroke="${P.gray2}" stroke-width="1"/>
    <!-- Red cross -->
    <rect x="13" y="10" width="6" height="2" fill="${P.red}"/>
    <rect x="15" y="8" width="2" height="6" fill="${P.red}"/>
    <!-- Tent door -->
    <polygon points="11,22 16,14 21,22" fill="${P.darkbg}"/>
    <!-- Ground stakes -->
    <rect x="1" y="21" width="2" height="3" fill="${P.amber}"/>
    <rect x="29" y="21" width="2" height="3" fill="${P.amber}"/>
    <!-- IV bag icon -->
    <rect x="3" y="14" width="3" height="5" fill="${P.blue}" opacity="0.6"/>
    <rect x="4" y="12" width="1" height="2" fill="${P.gray2}"/>
  </svg>`,

  forge: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 28" width="64" height="56" shape-rendering="crispEdges">
    <!-- Base structure -->
    <rect x="4" y="12" width="24" height="16" fill="${P.gray}"/>
    <!-- Forge mouth -->
    <rect x="10" y="16" width="12" height="10" fill="${P.black}"/>
    <!-- Fire glow -->
    <rect x="12" y="20" width="8" height="6" fill="${P.red}" opacity="0.8"/>
    <rect x="14" y="18" width="4" height="8" fill="${P.yellow}" opacity="0.7"/>
    <rect x="15" y="17" width="2" height="9" fill="${P.white}" opacity="0.5"/>
    <!-- Chimney -->
    <rect x="13" y="4" width="6" height="10" fill="${P.gray}"/>
    <rect x="12" y="2" width="8" height="3" fill="${P.gray2}"/>
    <!-- Smoke -->
    <rect x="14" y="0" width="4" height="2" fill="${P.white}" opacity="0.3"/>
    <!-- Anvil silhouette -->
    <rect x="20" y="18" width="8" height="3" fill="${P.metal}"/>
    <rect x="22" y="21" width="4" height="4" fill="${P.metal}"/>
  </svg>`,

  barracks: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 22" width="64" height="44" shape-rendering="crispEdges">
    <!-- Long barrack building -->
    <rect x="0" y="8" width="32" height="14" fill="${P.rust2}"/>
    <!-- Roof -->
    <rect x="0" y="6" width="32" height="3" fill="${P.rust}"/>
    <polygon points="0,8 16,3 32,8" fill="${P.rust}" opacity="0.7"/>
    <!-- Windows x3 -->
    <rect x="3" y="11" width="4" height="4" fill="${P.blue}" opacity="0.6"/>
    <rect x="14" y="11" width="4" height="4" fill="${P.blue}" opacity="0.6"/>
    <rect x="25" y="11" width="4" height="4" fill="${P.blue}" opacity="0.6"/>
    <!-- Door -->
    <rect x="14" y="16" width="4" height="6" fill="${P.darkbg}"/>
    <!-- Bunk bed silhouette in window -->
    <rect x="4" y="12" width="2" height="2" fill="${P.amber}" opacity="0.5"/>
    <rect x="4" y="14" width="2" height="1" fill="${P.amber}" opacity="0.5"/>
  </svg>`,

  turret: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" shape-rendering="crispEdges">
    <!-- Base -->
    <rect x="6" y="16" width="12" height="8" fill="${P.metal}"/>
    <rect x="4" y="18" width="16" height="2" fill="${P.gray}"/>
    <!-- Turret body -->
    <rect x="8" y="8" width="8" height="10" fill="${P.gray}"/>
    <!-- Barrel -->
    <rect x="14" y="10" width="8" height="3" fill="${P.metal}"/>
    <rect x="20" y="9" width="2" height="5" fill="${P.gray}"/>
    <!-- Targeting eye -->
    <rect x="10" y="10" width="4" height="4" fill="${P.black}"/>
    <rect x="11" y="11" width="2" height="2" fill="${P.red}" opacity="0.9"/>
    <!-- Ammo belt -->
    <rect x="6" y="14" width="2" height="6" fill="${P.amber}"/>
    <rect x="6" y="15" width="2" height="1" fill="${P.yellow}"/>
    <rect x="6" y="17" width="2" height="1" fill="${P.yellow}"/>
    <rect x="6" y="19" width="2" height="1" fill="${P.yellow}"/>
  </svg>`,

  kitchen: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 24" width="64" height="48" shape-rendering="crispEdges">
    <rect x="2" y="8" width="28" height="16" fill="${P.rust2}" opacity="0.7"/>
    <polygon points="2,8 16,3 30,8" fill="${P.rust}"/>
    <!-- Cooking pot on stove -->
    <rect x="8" y="12" width="10" height="8" fill="${P.metal}"/>
    <rect x="7" y="10" width="12" height="3" fill="${P.gray}"/>
    <rect x="9" y="8" width="8" height="2" fill="${P.darkbg}"/>
    <!-- Steam -->
    <rect x="11" y="6" width="1" height="2" fill="${P.white}" opacity="0.4"/>
    <rect x="14" y="5" width="1" height="3" fill="${P.white}" opacity="0.4"/>
    <!-- Flame -->
    <rect x="10" y="18" width="2" height="2" fill="${P.red}" opacity="0.8"/>
    <rect x="14" y="18" width="2" height="2" fill="${P.yellow}" opacity="0.8"/>
    <!-- Food shelf -->
    <rect x="20" y="10" width="8" height="10" fill="${P.bark}"/>
    <rect x="21" y="12" width="2" height="2" fill="${P.amber}"/>
    <rect x="24" y="11" width="3" height="3" fill="${P.green}"/>
  </svg>`,

  generator: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 22" width="56" height="44" shape-rendering="crispEdges">
    <!-- Generator body -->
    <rect x="2" y="6" width="24" height="16" fill="${P.metal}"/>
    <!-- Control panel -->
    <rect x="4" y="8" width="10" height="8" fill="${P.darkbg}"/>
    <!-- Gauges -->
    <rect x="5" y="9" width="3" height="3" fill="${P.green}" opacity="0.8"/>
    <rect x="9" y="9" width="3" height="3" fill="${P.red}" opacity="0.8"/>
    <rect x="5" y="13" width="8" height="2" fill="${P.amber}" opacity="0.6"/>
    <!-- Exhaust pipe -->
    <rect x="22" y="2" width="4" height="8" fill="${P.gray}"/>
    <rect x="21" y="0" width="6" height="3" fill="${P.gray2}"/>
    <!-- Fuel cap -->
    <rect x="16" y="8" width="6" height="4" fill="${P.amber}"/>
    <rect x="17" y="6" width="4" height="3" fill="${P.rust2}"/>
    <!-- Power bolt -->
    <polygon points="12,8 10,14 13,14 11,20 15,12 12,12" fill="${P.yellow}"/>
  </svg>`,
};

// ─── ZOMBIE SPRITES ──────────────────────────────────────────────────────────
ZI_ART.zombies = {
  shambler: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 24" width="32" height="48" shape-rendering="crispEdges">
    <!-- Head -->
    <rect x="4" y="0" width="8" height="7" fill="${P.green2}"/>
    <!-- Eyes -->
    <rect x="5" y="2" width="2" height="2" fill="${P.white}"/>
    <rect x="9" y="2" width="2" height="2" fill="${P.white}"/>
    <rect x="6" y="2" width="1" height="2" fill="${P.black}"/>
    <rect x="10" y="2" width="1" height="2" fill="${P.black}"/>
    <!-- Mouth -->
    <rect x="5" y="5" width="6" height="1" fill="${P.blood}"/>
    <rect x="6" y="5" width="1" height="2" fill="${P.bone}"/>
    <rect x="9" y="5" width="1" height="2" fill="${P.bone}"/>
    <!-- Body -->
    <rect x="4" y="7" width="8" height="10" fill="${P.rust2}" opacity="0.8"/>
    <!-- Torn shirt details -->
    <rect x="4" y="9" width="3" height="1" fill="${P.blood}" opacity="0.6"/>
    <!-- Arms (outstretched - shambler pose) -->
    <rect x="0" y="8" width="4" height="3" fill="${P.green2}"/>
    <rect x="12" y="8" width="4" height="3" fill="${P.green2}"/>
    <!-- Legs -->
    <rect x="4" y="17" width="3" height="7" fill="${P.rust2}" opacity="0.7"/>
    <rect x="9" y="17" width="3" height="7" fill="${P.rust2}" opacity="0.7"/>
    <!-- Feet -->
    <rect x="3" y="22" width="4" height="2" fill="${P.bark}"/>
    <rect x="9" y="22" width="4" height="2" fill="${P.bark}"/>
  </svg>`,

  runner: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 22" width="28" height="44" shape-rendering="crispEdges">
    <!-- Head (tilted forward - running pose) -->
    <rect x="5" y="0" width="7" height="6" fill="${P.green2}"/>
    <rect x="6" y="1" width="2" height="2" fill="${P.white}"/>
    <rect x="9" y="1" width="2" height="2" fill="${P.white}"/>
    <rect x="7" y="1" width="1" height="2" fill="${P.red}"/>
    <rect x="10" y="1" width="1" height="2" fill="${P.red}"/>
    <rect x="6" y="4" width="5" height="1" fill="${P.blood}"/>
    <!-- Body (leaning) -->
    <rect x="4" y="6" width="7" height="8" fill="${P.gray2}" opacity="0.8"/>
    <!-- Arms (back and forward - running) -->
    <rect x="0" y="9" width="4" height="2" fill="${P.green2}"/>
    <rect x="11" y="6" width="3" height="2" fill="${P.green2}"/>
    <!-- Legs (running stride) -->
    <rect x="4" y="14" width="3" height="5" fill="${P.gray}" opacity="0.8"/>
    <rect x="8" y="14" width="3" height="3" fill="${P.gray}" opacity="0.8"/>
    <rect x="5" y="19" width="3" height="3" fill="${P.bark}"/>
    <rect x="10" y="16" width="3" height="3" fill="${P.bark}"/>
  </svg>`,

  brute: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 26" width="40" height="52" shape-rendering="crispEdges">
    <!-- Massive head -->
    <rect x="4" y="0" width="12" height="9" fill="${P.green}"/>
    <!-- Eyes - angry -->
    <rect x="5" y="2" width="3" height="2" fill="${P.red}"/>
    <rect x="12" y="2" width="3" height="2" fill="${P.red}"/>
    <rect x="6" y="2" width="1" height="2" fill="${P.black}"/>
    <rect x="13" y="2" width="1" height="2" fill="${P.black}"/>
    <!-- Brow ridge -->
    <rect x="4" y="1" width="12" height="2" fill="${P.bark}"/>
    <!-- Mouth -->
    <rect x="5" y="6" width="10" height="2" fill="${P.blood}"/>
    <rect x="6" y="6" width="2" height="3" fill="${P.bone}"/>
    <rect x="12" y="6" width="2" height="3" fill="${P.bone}"/>
    <!-- Huge body -->
    <rect x="2" y="9" width="16" height="12" fill="${P.rust2}"/>
    <!-- Muscle tears on clothes -->
    <rect x="2" y="11" width="4" height="2" fill="${P.green}" opacity="0.4"/>
    <rect x="14" y="11" width="4" height="2" fill="${P.green}" opacity="0.4"/>
    <!-- Giant arms -->
    <rect x="0" y="9" width="3" height="8" fill="${P.green}"/>
    <rect x="17" y="9" width="3" height="8" fill="${P.green}"/>
    <rect x="0" y="16" width="4" height="3" fill="${P.green}"/>
    <rect x="16" y="16" width="4" height="3" fill="${P.green}"/>
    <!-- Legs -->
    <rect x="3" y="21" width="5" height="5" fill="${P.rust2}" opacity="0.7"/>
    <rect x="12" y="21" width="5" height="5" fill="${P.rust2}" opacity="0.7"/>
    <rect x="2" y="24" width="6" height="2" fill="${P.bark}"/>
    <rect x="12" y="24" width="6" height="2" fill="${P.bark}"/>
  </svg>`,

  spitter: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 22" width="28" height="44" shape-rendering="crispEdges">
    <!-- Head with enlarged mouth -->
    <rect x="3" y="0" width="8" height="7" fill="${P.green}"/>
    <rect x="4" y="1" width="2" height="2" fill="${P.yellow}"/>
    <rect x="8" y="1" width="2" height="2" fill="${P.yellow}"/>
    <rect x="5" y="1" width="1" height="2" fill="${P.black}"/>
    <rect x="9" y="1" width="1" height="2" fill="${P.black}"/>
    <!-- Enlarged toxic mouth -->
    <rect x="3" y="5" width="8" height="3" fill="${P.green2}"/>
    <rect x="4" y="5" width="6" height="2" fill="${P.black}"/>
    <!-- Acid drip -->
    <rect x="5" y="8" width="1" height="3" fill="${P.green}" opacity="0.8"/>
    <rect x="8" y="9" width="1" height="2" fill="${P.green}" opacity="0.8"/>
    <!-- Body with sacs -->
    <rect x="3" y="10" width="8" height="8" fill="${P.green}" opacity="0.8"/>
    <rect x="1" y="12" width="4" height="4" fill="${P.green2}" opacity="0.7"/>
    <rect x="9" y="12" width="4" height="4" fill="${P.green2}" opacity="0.7"/>
    <!-- Arms -->
    <rect x="0" y="11" width="3" height="2" fill="${P.green}"/>
    <rect x="11" y="11" width="3" height="2" fill="${P.green}"/>
    <!-- Legs -->
    <rect x="4" y="18" width="2" height="4" fill="${P.bark}"/>
    <rect x="8" y="18" width="2" height="4" fill="${P.bark}"/>
  </svg>`,
};

// ─── FACTION ICONS ────────────────────────────────────────────────────────────
ZI_ART.factions = {
  concordance: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" shape-rendering="crispEdges">
    <!-- Hexagon frame (science/research) -->
    <polygon points="12,1 21,6 21,18 12,23 3,18 3,6" fill="none" stroke="${P.purple}" stroke-width="2"/>
    <!-- Atom symbol -->
    <rect x="10" y="10" width="4" height="4" fill="${P.purple}" opacity="0.5"/>
    <rect x="11" y="7" width="2" height="10" fill="${P.purple}"/>
    <rect x="7" y="11" width="10" height="2" fill="${P.purple}"/>
    <!-- RMAT glow dots -->
    <rect x="6" y="6" width="2" height="2" fill="${P.purple}" opacity="0.8"/>
    <rect x="16" y="6" width="2" height="2" fill="${P.purple}" opacity="0.8"/>
    <rect x="6" y="16" width="2" height="2" fill="${P.purple}" opacity="0.8"/>
    <rect x="16" y="16" width="2" height="2" fill="${P.purple}" opacity="0.8"/>
  </svg>`,

  ironmarch: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" shape-rendering="crispEdges">
    <!-- Shield shape -->
    <polygon points="12,1 22,5 22,14 12,23 2,14 2,5" fill="${P.rust2}" opacity="0.5"/>
    <polygon points="12,1 22,5 22,14 12,23 2,14 2,5" fill="none" stroke="${P.rust}" stroke-width="2"/>
    <!-- Cross -->
    <rect x="10" y="5" width="4" height="14" fill="${P.rust}"/>
    <rect x="5" y="10" width="14" height="4" fill="${P.rust}"/>
    <!-- Corner bolts -->
    <rect x="4" y="4" width="2" height="2" fill="${P.metal}"/>
    <rect x="18" y="4" width="2" height="2" fill="${P.metal}"/>
  </svg>`,

  dustwalkers: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" shape-rendering="crispEdges">
    <!-- Compass rose -->
    <polygon points="12,2 14,10 22,12 14,14 12,22 10,14 2,12 10,10" fill="${P.amber}" opacity="0.7"/>
    <!-- Center dot -->
    <rect x="10" y="10" width="4" height="4" fill="${P.amber}"/>
    <!-- Boot print -->
    <rect x="5" y="18" width="3" height="4" fill="${P.bark}"/>
    <rect x="5" y="18" width="4" height="2" fill="${P.bark}"/>
    <!-- Satchel icon -->
    <rect x="15" y="16" width="5" height="5" fill="${P.amber}" opacity="0.5"/>
    <rect x="16" y="14" width="3" height="3" fill="${P.amber}" opacity="0.5"/>
  </svg>`,

  hearthguard: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" shape-rendering="crispEdges">
    <!-- Leaf/sprout -->
    <rect x="11" y="4" width="2" height="16" fill="${P.green}"/>
    <!-- Leaves -->
    <polygon points="12,8 6,6 10,12" fill="${P.green2}"/>
    <polygon points="12,8 18,6 14,12" fill="${P.green2}"/>
    <polygon points="12,14 5,11 9,17" fill="${P.green}"/>
    <polygon points="12,14 19,11 15,17" fill="${P.green}"/>
    <!-- Roots -->
    <rect x="9" y="19" width="2" height="3" fill="${P.bark}"/>
    <rect x="13" y="19" width="2" height="3" fill="${P.bark}"/>
    <rect x="7" y="21" width="10" height="2" fill="${P.bark}"/>
  </svg>`,

  blackhaven: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" shape-rendering="crispEdges">
    <!-- Skull -->
    <rect x="6" y="4" width="12" height="10" fill="${P.bone}"/>
    <rect x="4" y="8" width="16" height="6" fill="${P.bone}"/>
    <!-- Eye sockets -->
    <rect x="7" y="7" width="4" height="4" fill="${P.black}"/>
    <rect x="13" y="7" width="4" height="4" fill="${P.black}"/>
    <!-- Nose -->
    <rect x="11" y="11" width="2" height="2" fill="${P.black}"/>
    <!-- Jaw teeth -->
    <rect x="7" y="14" width="2" height="3" fill="${P.bone}"/>
    <rect x="10" y="14" width="2" height="4" fill="${P.bone}"/>
    <rect x="13" y="14" width="2" height="4" fill="${P.bone}"/>
    <rect x="16" y="14" width="2" height="3" fill="${P.bone}"/>
    <!-- Coin symbol -->
    <rect x="10" y="19" width="4" height="4" fill="${P.amber}"/>
    <rect x="11" y="20" width="2" height="2" fill="${P.yellow}"/>
  </svg>`,

  lodge: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="48" height="48" shape-rendering="crispEdges">
    <!-- Cabin/lodge shape -->
    <rect x="3" y="12" width="18" height="12" fill="${P.bark}"/>
    <polygon points="1,12 12,3 23,12" fill="${P.rust2}"/>
    <!-- Chimney with fire -->
    <rect x="15" y="5" width="4" height="8" fill="${P.gray}"/>
    <rect x="16" y="3" width="2" height="3" fill="${P.red}" opacity="0.9"/>
    <rect x="16" y="2" width="2" height="2" fill="${P.yellow}" opacity="0.8"/>
    <!-- Door -->
    <rect x="9" y="18" width="6" height="6" fill="${P.darkbg}"/>
    <!-- Warm window -->
    <rect x="4" y="15" width="4" height="4" fill="${P.yellow}" opacity="0.7"/>
    <!-- Candle in window -->
    <rect x="6" y="14" width="1" height="2" fill="${P.white}" opacity="0.6"/>
  </svg>`,
};

// ─── CONTRACT CARDS ART ──────────────────────────────────────────────────────
ZI_ART.contracts = {
  courier: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="40" height="40" shape-rendering="crispEdges">
    <!-- Backpack -->
    <rect x="4" y="4" width="12" height="14" fill="${P.rust2}"/>
    <rect x="6" y="2" width="8" height="4" fill="${P.rust}"/>
    <rect x="8" y="8" width="4" height="6" fill="${P.amber}" opacity="0.7"/>
    <rect x="4" y="10" width="12" height="2" fill="${P.amber}" opacity="0.5"/>
    <!-- Straps -->
    <rect x="5" y="4" width="2" height="14" fill="${P.bark}"/>
    <rect x="13" y="4" width="2" height="14" fill="${P.bark}"/>
    <!-- Exclamation mark -->
    <rect x="9" y="5" width="2" height="5" fill="${P.yellow}"/>
    <rect x="9" y="11" width="2" height="2" fill="${P.yellow}"/>
  </svg>`,

  combat: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="40" height="40" shape-rendering="crispEdges">
    <!-- Crossed swords -->
    <rect x="3" y="3" width="2" height="14" fill="${P.metal}" transform="rotate(45 9 9)"/>
    <rect x="3" y="3" width="2" height="14" fill="${P.metal}" transform="rotate(-45 11 9)"/>
    <!-- Sword handles -->
    <rect x="8" y="14" width="4" height="2" fill="${P.amber}"/>
    <rect x="8" y="4" width="4" height="2" fill="${P.amber}"/>
    <!-- Skull center -->
    <rect x="8" y="8" width="4" height="4" fill="${P.bone}" opacity="0.8"/>
    <rect x="9" y="9" width="1" height="1" fill="${P.black}"/>
    <rect x="11" y="9" width="1" height="1" fill="${P.black}"/>
  </svg>`,

  scavenge: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="40" height="40" shape-rendering="crispEdges">
    <!-- Magnifying glass -->
    <rect x="6" y="2" width="8" height="8" fill="none" stroke="${P.amber}" stroke-width="2"/>
    <rect x="7" y="3" width="6" height="6" fill="${P.blue}" opacity="0.3"/>
    <rect x="12" y="10" width="2" height="7" fill="${P.amber}" transform="rotate(45 13 11)"/>
    <!-- Item inside glass -->
    <rect x="9" y="5" width="2" height="2" fill="${P.purple}"/>
  </svg>`,

  intel: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="40" height="40" shape-rendering="crispEdges">
    <!-- Clipboard -->
    <rect x="3" y="4" width="14" height="15" fill="${P.white}" opacity="0.8"/>
    <rect x="7" y="2" width="6" height="4" fill="${P.gray2}"/>
    <!-- Lines of text -->
    <rect x="5" y="8" width="10" height="1" fill="${P.gray}"/>
    <rect x="5" y="11" width="8" height="1" fill="${P.gray}"/>
    <rect x="5" y="14" width="10" height="1" fill="${P.gray}"/>
    <!-- Eye icon -->
    <rect x="6" y="8" width="8" height="4" fill="${P.blue}" opacity="0.3"/>
    <rect x="9" y="9" width="2" height="2" fill="${P.blue}"/>
    <rect x="10" y="9" width="1" height="1" fill="${P.black}"/>
  </svg>`,

  build: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" width="40" height="40" shape-rendering="crispEdges">
    <!-- Hammer -->
    <rect x="9" y="4" width="4" height="6" fill="${P.metal}"/>
    <rect x="7" y="3" width="8" height="4" fill="${P.gray}"/>
    <rect x="10" y="9" width="2" height="9" fill="${P.bark}"/>
    <!-- Bricks -->
    <rect x="2" y="14" width="6" height="3" fill="${P.rust2}"/>
    <rect x="10" y="14" width="6" height="3" fill="${P.rust2}"/>
    <rect x="5" y="17" width="6" height="3" fill="${P.rust}"/>
  </svg>`,
};

// ─── TASK SPRITES (simple, non-over-the-top 8-bit) ───────────────────────────
ZI_ART.tasks = {
  craft: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="24" height="24" shape-rendering="crispEdges">
    <rect x="4" y="0" width="4" height="4" fill="${P.amber}"/>
    <rect x="0" y="4" width="12" height="4" fill="${P.metal}"/>
    <rect x="4" y="8" width="4" height="4" fill="${P.green}"/>
    <rect x="5" y="1" width="2" height="2" fill="${P.yellow}"/>
    <rect x="1" y="5" width="2" height="2" fill="${P.gray2}"/>
    <rect x="9" y="5" width="2" height="2" fill="${P.gray2}"/>
  </svg>`,

  train: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="24" height="24" shape-rendering="crispEdges">
    <!-- Dumbbell -->
    <rect x="0" y="4" width="3" height="4" fill="${P.metal}"/>
    <rect x="9" y="4" width="3" height="4" fill="${P.metal}"/>
    <rect x="3" y="5" width="6" height="2" fill="${P.gray}"/>
  </svg>`,

  repair: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="24" height="24" shape-rendering="crispEdges">
    <!-- Wrench -->
    <rect x="8" y="0" width="3" height="3" fill="${P.metal}"/>
    <rect x="9" y="0" width="3" height="3" fill="${P.gray}"/>
    <rect x="1" y="1" width="9" height="2" fill="${P.metal}" transform="rotate(45 6 6)"/>
    <rect x="0" y="9" width="3" height="3" fill="${P.metal}"/>
    <rect x="0" y="9" width="3" height="3" fill="${P.gray}"/>
  </svg>`,

  trade: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="24" height="24" shape-rendering="crispEdges">
    <!-- Coin -->
    <rect x="2" y="2" width="8" height="8" fill="${P.amber}"/>
    <rect x="3" y="3" width="6" height="6" fill="${P.yellow}" opacity="0.7"/>
    <rect x="5" y="4" width="2" height="4" fill="${P.amber}"/>
    <rect x="4" y="5" width="4" height="2" fill="${P.amber}"/>
  </svg>`,

  rest: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="24" height="24" shape-rendering="crispEdges">
    <!-- Zzz -->
    <rect x="2" y="2" width="6" height="1" fill="${P.blue}"/>
    <rect x="6" y="3" width="2" height="2" fill="${P.blue}"/>
    <rect x="2" y="5" width="6" height="1" fill="${P.blue}"/>
    <rect x="4" y="6" width="5" height="1" fill="${P.blue}" opacity="0.6"/>
    <rect x="7" y="7" width="2" height="2" fill="${P.blue}" opacity="0.6"/>
    <rect x="4" y="9" width="5" height="1" fill="${P.blue}" opacity="0.6"/>
  </svg>`,

  horde: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" width="24" height="24" shape-rendering="crispEdges">
    <!-- Shield -->
    <polygon points="6,1 11,3 11,8 6,11 1,8 1,3" fill="${P.rust2}"/>
    <polygon points="6,1 11,3 11,8 6,11 1,8 1,3" fill="none" stroke="${P.rust}" stroke-width="1"/>
    <rect x="5" y="3" width="2" height="5" fill="${P.amber}"/>
    <rect x="3" y="5" width="6" height="2" fill="${P.amber}"/>
  </svg>`,
};

// ─── BLUEPRINT CRAFTING ART ──────────────────────────────────────────────────
ZI_ART.blueprints = {
  // Returns background + schematic line art in blueprint style
  background: (w=240, h=160) => {
    let grid = '';
    for (let x = 0; x <= w; x += 16)
      grid += `<line x1="${x}" y1="0" x2="${x}" y2="${h}" stroke="#3a6090" stroke-width="${x%80===0?0.8:0.3}" opacity="${x%80===0?0.6:0.3}"/>`;
    for (let y = 0; y <= h; y += 16)
      grid += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="#3a6090" stroke-width="${y%80===0?0.8:0.3}" opacity="${y%80===0?0.6:0.3}"/>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
      <rect width="${w}" height="${h}" fill="#0a1628"/>
      ${grid}
    </svg>`;
  },

  hazardSuit: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 100" width="160" height="200">
    <rect width="80" height="100" fill="#0a1628"/>
    <!-- Blueprint grid -->
    <line x1="0" y1="20" x2="80" y2="20" stroke="#1a3a6a" stroke-width="0.5"/>
    <line x1="0" y1="40" x2="80" y2="40" stroke="#1a3a6a" stroke-width="0.5"/>
    <line x1="0" y1="60" x2="80" y2="60" stroke="#1a3a6a" stroke-width="0.5"/>
    <line x1="0" y1="80" x2="80" y2="80" stroke="#1a3a6a" stroke-width="0.5"/>
    <line x1="20" y1="0" x2="20" y2="100" stroke="#1a3a6a" stroke-width="0.5"/>
    <line x1="40" y1="0" x2="40" y2="100" stroke="#1a3a6a" stroke-width="0.5"/>
    <line x1="60" y1="0" x2="60" y2="100" stroke="#1a3a6a" stroke-width="0.5"/>
    <!-- Suit schematic -->
    <!-- Helmet -->
    <rect x="24" y="4" width="32" height="26" fill="none" stroke="#4a9ef5" stroke-width="1.5"/>
    <rect x="28" y="10" width="24" height="14" fill="none" stroke="#4a9ef5" stroke-width="1"/>
    <rect x="30" y="12" width="20" height="10" fill="#0d2040" stroke="#4a9ef5" stroke-width="0.5"/>
    <!-- Hazard symbol on visor -->
    <text x="40" y="20" fill="#4a9ef5" font-size="8" text-anchor="middle" font-family="monospace">☢</text>
    <!-- Body -->
    <rect x="18" y="30" width="44" height="44" fill="none" stroke="#4a9ef5" stroke-width="1.5"/>
    <!-- Chest seal lines -->
    <line x1="40" y1="30" x2="40" y2="74" stroke="#4a9ef5" stroke-width="0.5" stroke-dasharray="3,2"/>
    <line x1="18" y1="50" x2="62" y2="50" stroke="#4a9ef5" stroke-width="0.5" stroke-dasharray="3,2"/>
    <!-- Arms -->
    <rect x="6" y="30" width="14" height="36" fill="none" stroke="#4a9ef5" stroke-width="1"/>
    <rect x="60" y="30" width="14" height="36" fill="none" stroke="#4a9ef5" stroke-width="1"/>
    <!-- Legs -->
    <rect x="20" y="74" width="18" height="22" fill="none" stroke="#4a9ef5" stroke-width="1"/>
    <rect x="42" y="74" width="18" height="22" fill="none" stroke="#4a9ef5" stroke-width="1"/>
    <!-- Measurement arrows -->
    <text x="2" y="52" fill="#4a9ef5" font-size="5" font-family="monospace">44u</text>
    <text x="25" y="98" fill="#4a9ef5" font-size="5" font-family="monospace">T2-HAZ</text>
    <!-- Corner marks -->
    <line x1="0" y1="0" x2="8" y2="0" stroke="#4a9ef5" stroke-width="1"/>
    <line x1="0" y1="0" x2="0" y2="8" stroke="#4a9ef5" stroke-width="1"/>
    <line x1="72" y1="0" x2="80" y2="0" stroke="#4a9ef5" stroke-width="1"/>
    <line x1="80" y1="0" x2="80" y2="8" stroke="#4a9ef5" stroke-width="1"/>
  </svg>`,

  rifle: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 60" width="240" height="120">
    <rect width="120" height="60" fill="#0a1628"/>
    <line x1="0" y1="20" x2="120" y2="20" stroke="#1a3a6a" stroke-width="0.5"/>
    <line x1="0" y1="40" x2="120" y2="40" stroke="#1a3a6a" stroke-width="0.5"/>
    <line x1="30" y1="0" x2="30" y2="60" stroke="#1a3a6a" stroke-width="0.5"/>
    <line x1="60" y1="0" x2="60" y2="60" stroke="#1a3a6a" stroke-width="0.5"/>
    <line x1="90" y1="0" x2="90" y2="60" stroke="#1a3a6a" stroke-width="0.5"/>
    <!-- Rifle profile -->
    <rect x="10" y="26" width="90" height="8" fill="none" stroke="#4a9ef5" stroke-width="1.5"/>
    <!-- Barrel -->
    <rect x="100" y="28" width="16" height="4" fill="none" stroke="#4a9ef5" stroke-width="1"/>
    <!-- Stock -->
    <polygon points="10,26 10,34 4,36 4,24" fill="none" stroke="#4a9ef5" stroke-width="1"/>
    <!-- Scope -->
    <rect x="50" y="20" width="24" height="8" fill="none" stroke="#4a9ef5" stroke-width="1"/>
    <line x1="62" y1="20" x2="62" y2="26" stroke="#4a9ef5" stroke-width="0.5"/>
    <!-- Mag -->
    <rect x="44" y="34" width="12" height="14" fill="none" stroke="#4a9ef5" stroke-width="1"/>
    <!-- Labels -->
    <text x="60" y="55" fill="#4a9ef5" font-size="6" text-anchor="middle" font-family="monospace">HUNTING RIFLE T3 WM</text>
    <text x="4" y="10" fill="#4a9ef5" font-size="5" font-family="monospace">REFLEX: A / INSIGHT: B</text>
  </svg>`,
};

// ─── ENVIRONMENT TILES (for hack-and-slash) ──────────────────────────────────
ZI_ART.env = {
  grass: (x, y) => ({ fill: '#1a2c18', border: '#243820' }),
  gravel: (x, y) => ({ fill: '#2a2420', border: '#342e28' }),
  rubble: (x, y) => ({ fill: '#2e2820', border: '#3a3228' }),
  blood: (x, y) => ({ fill: '#2a1414', border: '#3a1a1a' }),
  concrete: (x, y) => ({ fill: '#242830', border: '#2e3038' }),
};

// ─── RENDER HELPERS ───────────────────────────────────────────────────────────
ZI_ART.svgToDataUrl = (svg) => `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;

ZI_ART.SvgIcon = ({ svg, size=32, style={} }) => {
  const url = ZI_ART.svgToDataUrl(svg);
  return React.createElement('img', { src: url, width: size, height: size, style: { imageRendering: 'pixelated', ...style } });
};
