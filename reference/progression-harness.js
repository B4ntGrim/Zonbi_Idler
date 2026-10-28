#!/usr/bin/env node
'use strict';

// Isolated design harness for the proposed long-campaign stat curves.
// This does not import or change live game code. It compares cap timing and
// curve shape using the stats shown in the supplied reference screenshot.

const STATS = [
  { key: 'maxHp', label: 'Max HP', start: 40, cap: 60, digits: 0 },
  { key: 'hpRegen', label: 'HP Regen', start: 10, cap: 20, digits: 0 },
  { key: 'shield', label: 'Shield', start: 50, cap: 80, digits: 0 },
  { key: 'armor', label: 'Armor %', start: 0, cap: 40, digits: 0 },
  { key: 'evasion', label: 'Evasion %', start: 1, cap: 25, digits: 0 },
  { key: 'damage', label: 'Damage x', start: 1, cap: 1.3, digits: 2 },
  { key: 'critChance', label: 'Crit Chance %', start: 1, cap: 35, digits: 0 },
  { key: 'critDamage', label: 'Crit Damage x', start: 2, cap: 3, digits: 1 },
  { key: 'attackSpeed', label: 'Attack Speed %', start: 100, cap: 150, digits: 0 },
  { key: 'moveSpeed', label: 'Movement Speed x', start: 1.07, cap: 1.25, digits: 2 },
];

const CAP_LEVELS = [30, 60, 80, 100];
const CURVES = [
  { key: 'steady', label: 'Steady', power: 1 },
  { key: 'early', label: 'Early-weighted', power: 0.75 },
  { key: 'late', label: 'Late-weighted', power: 1.35 },
];
const SAMPLE_LEVELS = [1, 10, 20, 30, 50, 70, 80, 90, 100];
const UPGRADE_RUNS = 200;
const OFFER_COUNT = 3;
const PICKS_TO_CAP = 24;
const BONUS_PICK_LEVELS = new Set([10, 20, 35, 50, 70, 85, 100]);
// Illustrative XP calibration inputs; these are design assumptions, not observed play data.
const DAILY_ACTIVITY_COUNTS = { regular: 30, elite: 3, objective: 1 };
const DAILY_XP_BANDS = [
  { band: 'Levels 1–10', total: 2450, regular: 1470, elite: 613, objective: 367 },
  { band: 'Levels 10–25', total: 10236, regular: 6142, elite: 2559, objective: 1535 },
  { band: 'Levels 25–50', total: 22388, regular: 13433, elite: 5597, objective: 3358 },
  { band: 'Levels 50–75', total: 32257, regular: 19354, elite: 8064, objective: 4839 },
  { band: 'Levels 75–100', total: 38595, regular: 23157, elite: 9649, objective: 5789 },
];
const PACE_TOLERANCE = 0.10;
const SOURCE_MIX_TOLERANCE_PP = 5;
const MILESTONE_DAYS = [
  { level: 10, day: 6 },
  { level: 25, day: 20 },
  { level: 50, day: 60 },
  { level: 75, day: 130 },
  { level: 100, day: 240 },
];
const UPGRADE_STRATEGIES = [
  { key: 'balanced', label: 'Balanced', preferred: STATS.map(s => s.key) },
  { key: 'damage', label: 'Damage specialist', preferred: ['damage'] },
  { key: 'survival', label: 'Survival focused', preferred: ['maxHp', 'hpRegen', 'shield', 'armor', 'evasion'] },
];

function progressAt(level, capLevel, power) {
  const raw = Math.max(0, Math.min(1, (level - 1) / (capLevel - 1)));
  return Math.pow(raw, power);
}

function statAt(stat, level, capLevel, power) {
  const p = progressAt(level, capLevel, power);
  return stat.start + (stat.cap - stat.start) * p;
}

function format(value, digits) {
  return value.toFixed(digits);
}

function table(headers, rows) {
  return [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`,
    ...rows.map(row => `| ${row.join(' | ')} |`),
  ].join('\n');
}

function rngFor(seed) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function percentile(sorted, p) {
  return sorted[Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p))];
}

function simulateUpgradeRun(strategy, seed) {
  const random = rngFor(seed);
  const ranks = Object.fromEntries(STATS.map(s => [s.key, 0]));
  const cappedAt = Object.fromEntries(STATS.map(s => [s.key, null]));
  const preferred = new Set(strategy.preferred);
  const records = {};

  for (let level = 2; level <= 100; level++) {
    // Checkpoints grant a second pick with a fresh set of three offers.
    const picksThisLevel = 1 + (BONUS_PICK_LEVELS.has(level) ? 1 : 0);
    for (let pick = 0; pick < picksThisLevel; pick++) {
      const offered = STATS.filter(s => ranks[s.key] < PICKS_TO_CAP).map(s => s.key);
      for (let i = offered.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [offered[i], offered[j]] = [offered[j], offered[i]];
      }
      const choices = offered.slice(0, OFFER_COUNT);
      const preferredChoices = choices.filter(key => preferred.has(key));
      const eligible = preferredChoices.length ? preferredChoices : choices;
      if (!eligible.length) continue;
      eligible.sort((a, b) => ranks[a] - ranks[b] || STATS.findIndex(s => s.key === a) - STATS.findIndex(s => s.key === b));

      const picked = eligible[0];
      ranks[picked] = Math.min(PICKS_TO_CAP, ranks[picked] + 1);
      if (ranks[picked] === PICKS_TO_CAP && cappedAt[picked] === null) cappedAt[picked] = level;
    }

    if ([30, 60, 80, 100].includes(level)) {
      records[level] = {
        values: Object.fromEntries(STATS.map(s => [s.key, s.start + (s.cap - s.start) * ranks[s.key] / PICKS_TO_CAP])),
        ranks: Object.assign({}, ranks),
        capped: Object.values(cappedAt).filter(v => v !== null && v <= level).length,
      };
    }
  }
  return { records, cappedAt };
}

function simulateUpgradeStrategies() {
  const rows = [];
  for (const strategy of UPGRADE_STRATEGIES) {
    const runs = Array.from({ length: UPGRADE_RUNS }, (_, i) => simulateUpgradeRun(strategy, 8701 + i * 31));
    for (const level of [30, 60, 80, 100]) {
      const hp = runs.map(r => r.records[level].values.maxHp).sort((a, b) => a - b);
      const damage = runs.map(r => r.records[level].values.damage).sort((a, b) => a - b);
      const capped = runs.map(r => r.records[level].capped).sort((a, b) => a - b);
      rows.push([
        strategy.label, String(level),
        `${percentile(hp, 0.5).toFixed(1)} (${percentile(hp, 0.1).toFixed(1)}–${percentile(hp, 0.9).toFixed(1)})`,
        `${percentile(damage, 0.5).toFixed(2)}× (${percentile(damage, 0.1).toFixed(2)}–${percentile(damage, 0.9).toFixed(2)}×)`,
        `${percentile(capped, 0.5)} / ${STATS.length}`,
      ]);
    }
  }
  return rows;
}

function main() {
  const output = [
    '# Progression Curve Simulation',
    '',
    'Isolated model; it does not modify or read live game state.',
    'Values use the supplied screenshot as the start and the current draft caps.',
    'Cap timing is modeled at levels 30, 60, 80, and 100; curves are steady, early-weighted, or late-weighted.',
    'The choice model stores integer stat ranks from 0 to 24 and derives each value from its rank; it also assumes three offers per pick and checkpoint bonus picks.',
    'Gear, temporary buffs, and combat outcomes are not modeled.',
    '',
    '## Cap timing overview',
    '',
    table(
      ['Cap level', 'Curve', 'HP at 30', 'HP at 60', 'Damage at 30', 'Damage at 60'],
      CAP_LEVELS.flatMap(capLevel => CURVES.map(curve => [
        String(capLevel), curve.label,
        format(statAt(STATS[0], 30, capLevel, curve.power), STATS[0].digits),
        format(statAt(STATS[0], 60, capLevel, curve.power), STATS[0].digits),
        `${format(statAt(STATS[5], 30, capLevel, curve.power), STATS[5].digits)}×`,
        `${format(statAt(STATS[5], 60, capLevel, curve.power), STATS[5].digits)}×`,
      ])),
    ),
    '',
    '## Stat values at checkpoints',
    '',
  ];

  for (const capLevel of CAP_LEVELS) {
    for (const curve of CURVES) {
      output.push(`### Cap at level ${capLevel} · ${curve.label}`, '');
      output.push(table(
        ['Level', ...STATS.map(s => s.label)],
        SAMPLE_LEVELS.map(level => [
          String(level),
          ...STATS.map(s => format(statAt(s, level, capLevel, curve.power), s.digits)),
        ]),
      ), '');
    }
  }

  output.push('## Draft caps used', '');
  output.push(table(
    ['Stat', 'Start', 'Cap'],
    STATS.map(s => [s.label, format(s.start, s.digits), format(s.cap, s.digits)]),
  ));

  output.push('', `## Gain per stat pick (${PICKS_TO_CAP} ranks to cap)`, '');
  output.push(table(
    ['Stat', 'Start → cap', 'Gain per pick'],
    STATS.map(s => [
      s.label,
      `${format(s.start, s.digits)} → ${format(s.cap, s.digits)}`,
      `+${((s.cap - s.start) / PICKS_TO_CAP).toFixed(4)}`,
    ]),
  ));

  output.push('', '## Upgrade-choice simulation', '');
  output.push(
    `Each level from 2 to 100 offers ${OFFER_COUNT} distinct stats selected uniformly per pick; the simulated player selects one. Stats are stored as integer ranks and derived from rank, not accumulated rounded values. ` +
    `Checkpoint levels ${[...BONUS_PICK_LEVELS].join(', ')} grant a second pick with a fresh offer. Each stat takes ${PICKS_TO_CAP} picks to reach its progression cap, for up to ${99 + BONUS_PICK_LEVELS.size} picks total. ` +
    `The simulation runs ${UPGRADE_RUNS} seeded offer sequences per strategy. ` +
    'Values show median (10th–90th percentile); capped count is the median number of stats at cap.',
    '',
  );
  output.push(table(
    ['Strategy', 'Level', 'Max HP', 'Damage', 'Stats capped'],
    simulateUpgradeStrategies(),
  ));

  output.push('', '## Illustrative XP activity-bundle calibration', '');
  output.push(
    `Assumed daily activity: ${DAILY_ACTIVITY_COUNTS.regular} regular encounters, ${DAILY_ACTIVITY_COUNTS.elite} elite/boss encounters, and ${DAILY_ACTIVITY_COUNTS.objective} objective/discovery reward. ` +
    'These counts are placeholders, not observed play data. Per-event amounts are averages; distribute fractional remainders across events so daily totals match the source budgets.',
    '',
  );
  output.push(table(
    ['Level band', 'Total XP/day', 'Regular XP/event (×30)', 'Elite/boss XP/event (×3)', 'Objective XP/reward (×1)'],
    DAILY_XP_BANDS.map(b => [
      b.band,
      String(b.total),
      (b.regular / DAILY_ACTIVITY_COUNTS.regular).toFixed(2),
      (b.elite / DAILY_ACTIVITY_COUNTS.elite).toFixed(2),
      (b.objective / DAILY_ACTIVITY_COUNTS.objective).toFixed(2),
    ]),
  ));

  output.push('', '## Provisional playtest tolerances', '');
  output.push('Use these as initial acceptance bands, not locked balance rules. Compare milestone timing and XP income over representative runs; use the median rather than failing a single outlier.', '');
  output.push(table(
    ['Level', 'Target day', 'Acceptable day range (±10%)'],
    MILESTONE_DAYS.map(m => [
      String(m.level), String(m.day),
      `${Math.floor(m.day * (1 - PACE_TOLERANCE))}–${Math.ceil(m.day * (1 + PACE_TOLERANCE))}`,
    ]),
  ), '');
  output.push(table(
    ['Level band', 'Target XP/day', 'Acceptable 7-day average (±10%)'],
    DAILY_XP_BANDS.map(b => [
      b.band, String(b.total),
      `${Math.round(b.total * (1 - PACE_TOLERANCE))}–${Math.round(b.total * (1 + PACE_TOLERANCE))}`,
    ]),
  ), '');
  output.push(table(
    ['XP source', 'Target share', 'Acceptable 7-day share (±5 percentage points)'],
    [
      ['Regular play', '60%', `${60 - SOURCE_MIX_TOLERANCE_PP}–${60 + SOURCE_MIX_TOLERANCE_PP}%`],
      ['Elites/bosses', '25%', `${25 - SOURCE_MIX_TOLERANCE_PP}–${25 + SOURCE_MIX_TOLERANCE_PP}%`],
      ['Objectives/discoveries', '15%', `${15 - SOURCE_MIX_TOLERANCE_PP}–${15 + SOURCE_MIX_TOLERANCE_PP}%`],
    ],
  ));
  output.push(
    '',
    'Build outcome checks:',
    '- Damage-focused build: median damage-cap level 70–90, centered near level 80.',
    '- Balanced and survival-focused builds: median runs should not cap a stat before level 100.',
  );

  process.stdout.write(`${output.join('\n')}\n`);
}

main();
