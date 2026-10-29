// Headless game environment for the STAT-02 audit (same pattern as the repo's tests).
const fs = require('fs'), path = require('path');
const SITE = path.join(__dirname, 'site');
const ORDER = ['core','world','save','stats','items','crafting','combat','factions','camp','jobs','economy','wandering','fort','active','routes','survival-data','bootstrap'];
const read = p => fs.readFileSync(path.join(SITE, p), 'utf8');
function mkEnv(opt) {
  opt = opt || {};
  const T0 = opt.T0 || 1793200000000;
  const store = Object.assign({ zi_world_seed: '12345', zi_offline_last_seen: String(T0) }, opt.store || {});
  const ls = { getItem: k => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); }, removeItem: k => { delete store[k]; }, key: i => Object.keys(store)[i], get length() { return Object.keys(store).length; } };
  const clock = { now: T0 };
  class D extends Date { constructor(...a) { if (a.length) super(...a); else super(clock.now); } static now() { return clock.now; } }
  const fw = { localStorage: ls, sessionStorage: ls, console: { log() {}, warn() {}, error() {} }, Date: D, Math, JSON, Proxy, Object, Array,
    setInterval: () => 0, clearInterval: () => {}, setTimeout: () => 0, clearTimeout: () => {}, document: { hidden: false, visibilityState: 'visible', addEventListener() {}, querySelectorAll: () => [] }, addEventListener() {}, location: { reload() {} } };
  fw.window = fw;
  let code = read('bestiary-data.js') + '\n' + ORDER.map(m => read('game/' + m + '.js')).join('\n');
  if (!opt.noProg) code += '\n' + read('game/progression.js');
  if (!opt.noLive && !opt.noProg) code += '\n' + read('game/progression-live.js');
  new Function('fw', 'with(fw){' + code + '}')(fw);
  const ZI = fw.ZI; ZI._installedClock = () => clock.now;
  return { ZI, store, clock, fw };
}
module.exports = { mkEnv, read, SITE };
