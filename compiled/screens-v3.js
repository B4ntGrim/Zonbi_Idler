"use strict";

function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t["return"] || t["return"](); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// Zed Idler v3 — Last Stand: Dead Zone Inspired Screens
// Satellite map traversal, side-scroller wandering, recycler, material economy

window.ZI_ART = window.ZI_ART || {};

// ─── HIGH-DETAIL SURVIVOR SPRITE (36×48, painted + auto-outlined) ───────────
// Painted in layers on a pixel grid, then every empty pixel touching the body
// becomes a dark outline — the classic hand-pixelled look. Output is
// run-length rows so the SVG stays light. Built once and cached.
// Map the equipped weapon to a sprite pose + projectile.
window.ZI_ART.weaponKindFor = function (loadout) {
  var Z = window.ZI;
  if (!Z || !Z.getGearItem) return 'fists';
  var id = loadout && (loadout.primary || loadout.secondary || loadout.melee);
  var it = id && Z.getGearItem(id);
  if (!it) return 'fists';
  var n = (it.name + ' ' + it.id).toLowerCase();
  if (/crossbow/.test(n)) return 'crossbow';
  if (/\bbow\b|compound/.test(n)) return 'bow';
  if (/flame/.test(n)) return 'flame';
  if (/shotgun|sawn/.test(n)) return 'shotgun';
  if (/smg|suppress/.test(n)) return 'smg';
  if (/pistol|revolver|357|9mm/.test(n)) return 'pistol';
  if (/rifle|carbine|ak-|pulse/.test(n)) return 'rifle';
  if (/machete|knife|blade/.test(n)) return 'blade';
  if (/axe|hatchet/.test(n)) return 'axe';
  if (/knuckle/.test(n)) return 'fists';
  if (/bat|pipe|baton|sledge|board|crowbar|club|hammer/.test(n)) return 'blunt';
  return it.slot === 'melee' ? 'blunt' : 'rifle';
};
window.ZI_ART.WEAPON_FX = {
  rifle: {
    muzzle: [32, 18],
    shot: 'tracer'
  },
  smg: {
    muzzle: [31, 18],
    shot: 'tracer'
  },
  shotgun: {
    muzzle: [31, 18],
    shot: 'spread'
  },
  pistol: {
    muzzle: [31, 14],
    shot: 'tracer'
  },
  crossbow: {
    shot: 'bolt'
  },
  bow: {
    shot: 'arrow'
  },
  flame: {
    muzzle: [30, 18],
    shot: 'flame'
  },
  blade: {
    shot: 'slash'
  },
  axe: {
    shot: 'slash'
  },
  blunt: {
    shot: 'slash'
  },
  fists: {
    shot: 'slash'
  }
};
window.ZI_ART.survivorRuns = function () {
  var kind = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'rifle';
  window.ZI_ART._survivorCache = window.ZI_ART._survivorCache || {};
  if (window.ZI_ART._survivorCache[kind]) return window.ZI_ART._survivorCache[kind];
  var W = 36,
    H = 48,
    g = Array.from({
      length: H
    }, function () {
      return Array(W).fill(null);
    });
  var P = {
    k: '#120d0a',
    h: '#3a2418',
    H: '#6a4428',
    s: '#c89468',
    S: '#94603e',
    l: '#e6b88a',
    e: '#140c0a',
    b: '#7a2c22',
    B: '#4a1814',
    j: '#4c5c3a',
    J: '#2f3b25',
    G: '#6e8052',
    u: '#7a6a48',
    U: '#54482e',
    p: '#5e4628',
    q: '#3c2c18',
    t: '#2a1e14',
    T: '#b09a58',
    n: '#3c3628',
    N: '#26221a',
    K: '#565040',
    o: '#2c1c10',
    O: '#150c08',
    L: '#7a6a48',
    r: '#2a2a2a',
    R: '#55554f',
    w: '#6e4626',
    X: '#4a2c18',
    c: '#2c2420',
    m: '#5aa0b8',
    d: '#5c261a'
  };
  var px = function px(x, y, c) {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = c;
  };
  var rect = function rect(x, y, w, h, c) {
    for (var yy = y; yy < y + h; yy++) for (var xx = x; xx < x + w; xx++) px(xx, yy, c);
  };
  // Bedroll + backpack (behind)
  rect(5, 11, 7, 3, 'u');
  rect(5, 12, 7, 1, 'U');
  px(5, 11, 'U');
  px(11, 13, 'U');
  rect(5, 14, 6, 12, 'q');
  rect(6, 15, 4, 10, 'p');
  rect(6, 18, 4, 1, 't');
  px(7, 21, 'T');
  rect(6, 23, 4, 1, 'q');
  px(9, 15, 'u');
  // Legs (back leg darker), knee pad, folds
  rect(12, 28, 4, 14, 'N');
  rect(17, 28, 4, 14, 'n');
  rect(17, 33, 4, 2, 'K');
  px(18, 32, 'N');
  px(19, 37, 'N');
  px(20, 30, 'N');
  px(13, 35, 'n');
  px(14, 31, 'n');
  // Boots with laces + soles
  rect(11, 42, 6, 4, 'o');
  rect(16, 42, 7, 4, 'o');
  rect(11, 45, 6, 1, 'O');
  rect(16, 45, 7, 1, 'O');
  px(22, 44, 'O');
  [[13, 43], [14, 43], [18, 43], [19, 43], [18, 44]].forEach(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      x = _ref2[0],
      y = _ref2[1];
    return px(x, y, 'L');
  });
  // Torso jacket with shading, collar, zipper, chest strap
  rect(10, 12, 11, 15, 'j');
  rect(10, 12, 2, 15, 'J');
  rect(12, 12, 7, 1, 'J');
  rect(14, 13, 3, 1, 'G');
  rect(13, 14, 2, 5, 'G');
  for (var y = 15; y < 26; y++) px(16, y, 'J');
  for (var i = 0; i < 10; i++) px(11 + i, 13 + i, 't');
  px(12, 22, 'd');
  px(13, 22, 'd');
  px(13, 23, 'd');
  px(18, 15, 'd');
  px(11, 17, 'd');
  // Belt, buckle, pouch
  rect(10, 26, 12, 2, 't');
  rect(15, 26, 2, 2, 'T');
  rect(19, 25, 3, 3, 'q');
  px(20, 25, 'p');
  // Head: neck, face, hair (back of head left, face right), eye, ear, nose
  rect(14, 10, 3, 2, 'S');
  rect(12, 2, 8, 8, 's');
  rect(12, 1, 8, 3, 'h');
  rect(11, 2, 3, 7, 'h');
  rect(14, 1, 4, 1, 'H');
  px(12, 2, 'H');
  px(13, 3, 'H');
  px(17, 4, 'h');
  px(18, 4, 'h');
  px(18, 5, 'e');
  px(19, 5, 'l');
  px(16, 4, 'l');
  px(13, 6, 'S');
  px(13, 5, 'S');
  px(20, 6, 's');
  px(15, 5, 'S');
  // Bandana over nose/mouth with knot trailing back
  rect(14, 7, 7, 3, 'b');
  rect(14, 9, 6, 1, 'B');
  px(15, 7, 'B');
  px(11, 8, 'b');
  px(10, 9, 'b');
  px(11, 9, 'B');
  px(9, 10, 'B');
  // ── Arms + weapon, drawn to match what's equipped ──
  var longGunArms = function longGunArms() {
    rect(21, 15, 5, 2, 'J');
    rect(18, 13, 3, 5, 'j');
    px(19, 13, 'G');
    rect(20, 17, 3, 3, 'j');
    px(20, 19, 'J');
  };
  var meleeArms = function meleeArms() {
    rect(10, 16, 2, 7, 'J');
    rect(18, 13, 3, 4, 'j');
    px(19, 13, 'G');
    rect(20, 12, 3, 3, 'j');
    rect(22, 12, 2, 3, 'c');
  };
  var MET = '#c8ccd0',
    BOLT = '#c8c0a0';
  var k = kind;
  if (k === 'rifle') {
    longGunArms();
    rect(12, 18, 5, 3, 'w');
    rect(12, 20, 5, 1, 'X');
    px(13, 18, 'X');
    rect(17, 18, 6, 2, 'r');
    rect(17, 18, 6, 1, 'R');
    rect(20, 20, 2, 3, 'r');
    px(21, 22, 'R');
    rect(18, 16, 5, 2, 'r');
    px(18, 16, 'R');
    px(22, 16, 'm');
    px(22, 17, 'm');
    rect(23, 18, 8, 1, 'r');
    rect(23, 19, 4, 1, 'R');
    px(31, 18, 'R');
    rect(19, 19, 2, 2, 'c');
    rect(25, 17, 2, 2, 'c');
    px(26, 19, 'c');
  } else if (k === 'smg') {
    longGunArms();
    rect(13, 18, 4, 2, 'r');
    px(13, 20, 'r');
    rect(17, 18, 6, 2, 'r');
    rect(17, 18, 6, 1, 'R');
    rect(19, 20, 2, 4, 'r');
    px(20, 23, 'R');
    rect(23, 18, 4, 1, 'r');
    rect(27, 18, 3, 1, 'R');
    rect(27, 19, 3, 1, 'r');
    rect(18, 19, 2, 2, 'c');
    rect(23, 19, 2, 2, 'c');
  } else if (k === 'shotgun') {
    longGunArms();
    rect(12, 18, 5, 3, 'w');
    rect(12, 20, 5, 1, 'X');
    rect(17, 18, 4, 2, 'r');
    rect(17, 18, 4, 1, 'R');
    rect(21, 18, 9, 1, 'r');
    rect(21, 19, 9, 1, 'R');
    rect(23, 20, 4, 1, 'w');
    px(30, 18, 'r');
    px(30, 19, 'r');
    rect(19, 19, 2, 2, 'c');
    rect(24, 20, 2, 2, 'c');
  } else if (k === 'pistol') {
    rect(18, 13, 3, 4, 'j');
    px(19, 13, 'G');
    rect(20, 15, 5, 2, 'j');
    rect(19, 17, 5, 2, 'J');
    rect(25, 15, 2, 2, 'c');
    rect(24, 17, 2, 1, 'c');
    rect(26, 14, 4, 1, 'r');
    rect(26, 15, 1, 2, 'r');
    px(27, 15, 'R');
    px(29, 14, 'R');
  } else if (k === 'crossbow') {
    longGunArms();
    rect(13, 19, 11, 2, 'w');
    rect(13, 20, 11, 1, 'X');
    rect(24, 13, 1, 13, 'X');
    px(25, 12, 'X');
    px(25, 26, 'X');
    px(23, 13, 'w');
    px(23, 25, 'w');
    [[23, 14], [22, 15], [22, 16], [21, 17], [21, 18], [21, 21], [22, 22], [22, 23], [23, 24]].forEach(function (_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2),
        x = _ref4[0],
        y = _ref4[1];
      return px(x, y, 'L');
    });
    rect(19, 18, 9, 1, BOLT);
    px(28, 18, 'R');
    px(29, 18, 'R');
    px(19, 17, 'b');
    px(19, 19, 'b');
    rect(18, 20, 2, 2, 'c');
    rect(22, 20, 2, 2, 'c');
  } else if (k === 'bow') {
    rect(21, 15, 6, 2, 'J');
    rect(18, 13, 3, 5, 'j');
    px(19, 13, 'G');
    rect(17, 17, 3, 3, 'j');
    [[26, 9], [27, 10], [27, 11], [28, 12], [28, 13], [28, 14], [28, 15], [28, 16], [28, 17], [28, 18], [28, 19], [28, 20], [28, 21], [28, 22], [28, 23], [27, 24], [27, 25], [26, 26]].forEach(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
        x = _ref6[0],
        y = _ref6[1];
      return px(x, y, 'w');
    });
    px(26, 9, 'X');
    px(26, 26, 'X');
    [[25, 10], [24, 11], [23, 12], [22, 13], [21, 14], [20, 15], [19, 16], [19, 17], [19, 19], [20, 20], [21, 21], [22, 22], [23, 23], [24, 24], [25, 25]].forEach(function (_ref7) {
      var _ref8 = _slicedToArray(_ref7, 2),
        x = _ref8[0],
        y = _ref8[1];
      return px(x, y, 'L');
    });
    rect(19, 18, 10, 1, BOLT);
    px(29, 18, 'R');
    px(30, 18, 'R');
    px(19, 17, 'b');
    px(19, 19, 'b');
    rect(27, 17, 2, 3, 'c');
    rect(18, 18, 2, 2, 'c');
  } else if (k === 'flame') {
    rect(5, 14, 5, 11, '#7a2418');
    rect(6, 14, 1, 11, '#a8402a');
    rect(5, 13, 5, 1, '#4a1810');
    rect(6, 25, 3, 1, '#4a1810');
    longGunArms();
    rect(17, 18, 11, 2, 'r');
    rect(17, 18, 11, 1, 'R');
    rect(20, 20, 2, 2, 'r');
    px(28, 18, 'r');
    px(28, 19, 'r');
    px(29, 18, '#e07a30');
    [[10, 20], [11, 21], [12, 22], [13, 22], [14, 22], [15, 21], [16, 21]].forEach(function (_ref9) {
      var _ref0 = _slicedToArray(_ref9, 2),
        x = _ref0[0],
        y = _ref0[1];
      return px(x, y, 'N');
    });
    rect(19, 19, 2, 2, 'c');
    rect(24, 17, 2, 2, 'c');
  } else if (k === 'blade') {
    meleeArms();
    rect(22, 14, 2, 2, 'X');
    for (var _i = 0; _i < 8; _i++) {
      px(24 + _i, 12 - _i, MET);
      px(24 + _i, 13 - _i, 'R');
    }
    px(31, 4, MET);
  } else if (k === 'axe') {
    meleeArms();
    for (var _i2 = 0; _i2 < 9; _i2++) px(23 + _i2 * 0.6, 14 - _i2, 'w');
    rect(27, 4, 4, 4, 'R');
    rect(30, 4, 1, 4, MET);
    px(26, 5, 'r');
    px(26, 6, 'r');
  } else if (k === 'blunt') {
    meleeArms();
    for (var _i3 = 0; _i3 < 8; _i3++) {
      px(23 + _i3 * 0.6, 13 - _i3, 'w');
      px(24 + _i3 * 0.6, 13 - _i3, 'X');
    }
    rect(26, 3, 4, 4, 'w');
    rect(26, 3, 4, 1, 'X');
    px(26, 4, MET);
    px(29, 5, MET);
    px(28, 3, MET);
  } else {
    // Fists / knuckles
    rect(18, 13, 3, 4, 'j');
    px(19, 13, 'G');
    rect(20, 16, 4, 2, 'j');
    rect(24, 15, 3, 3, 'c');
    rect(26, 15, 1, 3, 'R');
    rect(14, 17, 2, 5, 'J');
    rect(15, 21, 2, 2, 'c');
  }
  // Auto outline: empty pixels bordering the figure become the dark outline colour
  var out = g.map(function (r) {
    return r.slice();
  });
  var _loop = function _loop(_y) {
    var _loop2 = function _loop2(_x) {
      if (g[_y][_x]) return 1; // continue
      var n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (_ref1) {
        var _ref10 = _slicedToArray(_ref1, 2),
          dx = _ref10[0],
          dy = _ref10[1];
        return g[_y + dy] && g[_y + dy][_x + dx];
      });
      if (n) out[_y][_x] = 'k';
    };
    for (var _x = 0; _x < W; _x++) {
      if (_loop2(_x)) continue;
    }
  };
  for (var _y = 0; _y < H; _y++) {
    _loop(_y);
  }
  var runs = [];
  for (var _y2 = 0; _y2 < H; _y2++) {
    var x = 0;
    while (x < W) {
      var c = out[_y2][x];
      if (!c) {
        x++;
        continue;
      }
      var w = 1;
      while (x + w < W && out[_y2][x + w] === c) w++;
      runs.push({
        x: x,
        y: _y2,
        w: w,
        c: P[c]
      });
      x += w;
    }
  }
  return window.ZI_ART._survivorCache[kind] = runs;
};

// ─── HIGH-DETAIL ZOMBIE SPRITES (36×48, painted + auto-outlined) ────────────
// One painter, many archetypes: each bestiary base maps to a look (skin tone,
// build, clothing) plus signature features (exposed ribs, bloated throat,
// glowing veins, frost, armour, maggots, chains…). Faces left, toward the survivor.
window.ZI_ART.zombieLook = function (type) {
  var t = String(type || 'shambler').toLowerCase();
  var has = function has() {
    for (var _len = arguments.length, ks = new Array(_len), _key = 0; _key < _len; _key++) {
      ks[_key] = arguments[_key];
    }
    return ks.some(function (k) {
      return t.includes(k);
    });
  };
  var base = {
    skin: ['#6e8260', '#4a5a40', '#8ea07a'],
    shirt: ['#3a4232', '#262c20'],
    pants: ['#2a2620', '#1a1814'],
    eye: '#e8e0b0',
    feats: [],
    wide: false,
    scale: 1
  };
  if (has('runner', 'nimble', 'sharp', 'packleader', 'jingle', 'creeper')) Object.assign(base, {
    skin: ['#7a8870', '#525e48', '#98a68a'],
    shirt: ['#5a2a24', '#3a1a16'],
    eye: '#ff4a3a',
    feats: ['lean', 'hood']
  });
  if (has('spit', 'acid', 'toxic', 'tainted', 'vomit')) Object.assign(base, {
    skin: ['#8a9a48', '#5e6c2c', '#aebc64'],
    shirt: ['#4a4430', '#2e2a1c'],
    eye: '#d8f060',
    feats: ['bloat', 'drool']
  });
  if (has('brute', 'heavy', 'giant', 'titan', 'mutant', 'battle', 'hybrid', 'hexapod', 'octopod', 'rebis')) Object.assign(base, {
    skin: ['#7a6a5a', '#52463a', '#9a8a74'],
    shirt: ['#3a2e24', '#241c16'],
    eye: '#ff7030',
    feats: ['ribs', 'muscle'],
    wide: true,
    scale: has('titan', 'giant') ? 1.35 : 1.15
  });
  if (has('burrow', 'trapper', 'path')) Object.assign(base, {
    skin: ['#6a5a44', '#46382a', '#8a785c'],
    shirt: ['#4a3c2a', '#2e2418'],
    eye: '#f0d070',
    feats: ['dirt', 'claws']
  });
  if (has('radiation', 'conductive', 'signal', 'immolation', 'pressurized', 'lightsensitive')) Object.assign(base, {
    skin: ['#5a6a6a', '#3a4646', '#7a8a8a'],
    shirt: ['#2a3034', '#1a1e22'],
    eye: has('immolation') ? '#ff9a30' : '#60f0ff',
    glow: has('immolation') ? '#ff8a20' : '#40e0f0',
    feats: ['veins']
  });
  if (has('frost')) Object.assign(base, {
    skin: ['#9ab0bc', '#6a808c', '#c4d6e0'],
    shirt: ['#3a4450', '#262e36'],
    eye: '#bff4ff',
    feats: ['ice']
  });
  if (has('armored', 'chrome', 'weapon', 'keyring', 'chained', 'stun')) {
    base.feats = base.feats.concat(has('chained') ? ['chain'] : ['helmet']);
    if (has('armored', 'weapon')) base.feats.push('plates');
  }
  if (has('maggot', 'wretched', 'hermit', 'grayscale', 'randomfan')) base.feats = base.feats.concat(['maggots', 'holes']);
  if (has('crawler')) Object.assign(base, {
    scale: 0.6,
    feats: base.feats.concat(['holes'])
  }); // Oct 29: Crawler (Halved) reads low to the ground; no sprite exported yet
  return base;
};
window.ZI_ART.zombieSvg = function (type) {
  var frame = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var L = window.ZI_ART.zombieLook(type);
  var W = 36,
    H = 48,
    g = Array.from({
      length: H
    }, function () {
      return Array(W).fill(null);
    });
  var px = function px(x, y, c) {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = c;
  };
  var rect = function rect(x, y, w, h, c) {
    for (var yy = y; yy < y + h; yy++) for (var xx = x; xx < x + w; xx++) px(xx, yy, c);
  };
  var seed = 0;
  var _iterator = _createForOfIteratorHelper(String(type)),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var ch = _step.value;
      seed = seed * 31 + ch.charCodeAt(0) >>> 0;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var rnd = function rnd() {
    seed = seed * 1103515245 + 12345 >>> 0;
    return (seed >>> 8) / 16777216;
  };
  var _L$skin = _slicedToArray(L.skin, 3),
    sk = _L$skin[0],
    skD = _L$skin[1],
    skL = _L$skin[2],
    _L$shirt = _slicedToArray(L.shirt, 2),
    sh = _L$shirt[0],
    shD = _L$shirt[1],
    _L$pants = _slicedToArray(L.pants, 2),
    pa = _L$pants[0],
    paD = _L$pants[1];
  var sway = frame % 2 === 0 ? 0 : 1,
    step = frame % 2 === 0 ? 0 : 1;
  var wd = L.wide ? 2 : 0,
    lean = L.feats.includes('lean') ? -1 : 0;
  var BLOOD = '#5a0c0a',
    BLOOD2 = '#8a1410',
    BONE = '#d8ceb0',
    GUM = '#2a0606';
  // Legs (back leg darker), shuffling step, torn cuffs
  rect(16 + step, 31, 4 + wd / 2, 11, paD);
  rect(20 - step + wd, 31, 4 + wd / 2, 11, pa);
  px(21 - step + wd, 35, paD);
  px(17 + step, 38, pa);
  px(22 - step + wd, 40, BLOOD);
  // Bare, rotting feet
  rect(14 + step, 42, 6, 3, skD);
  rect(19 - step + wd, 42, 6, 3, sk);
  px(14 + step, 44, BONE);
  px(19 - step + wd, 44, skL);
  px(24 - step + wd, 43, BLOOD);
  // Torso (hunched), shirt shading, tears showing skin, blood
  var tx = 13 - wd + lean,
    tw = 11 + wd * 2;
  rect(tx, 15, tw, 16, sh);
  rect(tx + tw - 3, 15, 3, 16, shD);
  rect(tx, 15, tw, 1, shD);
  for (var i = 0; i < 4; i++) {
    var x = tx + 1 + Math.floor(rnd() * (tw - 3)),
      y = 17 + Math.floor(rnd() * 11);
    rect(x, y, 2, 1 + Math.floor(rnd() * 2), sk);
  }
  for (var _i4 = 0; _i4 < 5; _i4++) px(tx + Math.floor(rnd() * tw), 18 + Math.floor(rnd() * 12), rnd() > 0.5 ? BLOOD : BLOOD2);
  if (L.feats.includes('ribs') || L.feats.includes('holes')) {
    rect(tx + 2, 19, 5, 6, GUM);
    for (var _y3 = 19; _y3 < 25; _y3 += 2) rect(tx + 2, _y3, 5, 1, BONE);
  }
  if (L.feats.includes('muscle')) {
    rect(tx + tw - 5, 16, 3, 3, skL);
    rect(tx - 1, 16, 3, 4, sk);
  }
  if (L.feats.includes('plates')) {
    rect(tx + 1, 16, tw - 2, 5, '#5a5c60');
    rect(tx + 1, 16, tw - 2, 1, '#8a8c90');
    px(tx + 3, 18, '#2a2c30');
    px(tx + tw - 4, 18, '#2a2c30');
  }
  if (L.feats.includes('chain')) for (var _i5 = 0; _i5 < tw + 2; _i5 += 2) {
    px(tx - 1 + _i5, 22 + (_i5 % 4 === 0 ? 0 : 1), '#8a8c8a');
    px(tx + _i5, 22 + (_i5 % 4 === 0 ? 1 : 0), '#5a5c5a');
  }
  if (L.feats.includes('hood')) {
    rect(tx + 2, 13, tw - 1, 3, shD);
  }
  // Head: skull shape, patchy hair, exposed bone, open jaw with teeth
  var hx = 11 + lean,
    hy = 4;
  rect(hx + 1, hy, 8, 10, sk);
  rect(hx + 6, hy, 3, 10, skD);
  rect(hx + 1, hy + 9, 5, 1, skD);
  rect(hx + 2, hy - 1, 6, 1, '#2a2418');
  px(hx + 3, hy, '#2a2418');
  px(hx + 7, hy, '#2a2418');
  px(hx + 5, hy - 1, sk);
  rect(hx + 5, hy, 2, 2, BONE);
  px(hx + 6, hy + 1, '#a8a088');
  px(hx + 2, hy + 3, skL);
  px(hx + 3, hy + 2, skL);
  // Sunken, glowing eyes
  rect(hx + 1, hy + 3, 2, 2, GUM);
  rect(hx + 4, hy + 3, 2, 2, GUM);
  px(hx + 1, hy + 3, L.eye);
  px(hx + 4, hy + 3, L.eye);
  px(hx, hy + 5, skD);
  // Jaw hanging open, teeth, blood drip
  rect(hx, hy + 7, 5, 3, GUM);
  [hx, hx + 2, hx + 4].forEach(function (x) {
    return px(x, hy + 7, BONE);
  });
  px(hx + 1, hy + 9, BONE);
  px(hx + 3, hy + 9, BONE);
  px(hx + 1, hy + 10, BLOOD2);
  px(hx + 1, hy + 11, BLOOD);
  px(hx + 3, hy + 11, BLOOD);
  if (L.feats.includes('drool')) {
    px(hx + 2, hy + 10, '#b8e040');
    px(hx + 2, hy + 11, '#b8e040');
    px(hx + 2, hy + 12, '#88b020');
    px(hx + 2, hy + 13, '#88b020');
  }
  if (L.feats.includes('bloat')) {
    rect(hx + 3, hy + 10, 6, 4, '#9ab040');
    rect(hx + 4, hy + 10, 3, 1, '#c8e060');
    px(hx + 7, hy + 12, '#6a7a20');
  }
  if (L.feats.includes('helmet')) {
    rect(hx, hy - 2, 10, 4, '#5a5c60');
    rect(hx, hy - 2, 10, 1, '#9a9ca0');
    rect(hx - 1, hy + 1, 3, 1, '#3a3c40');
  }
  // Arms reaching toward the survivor (near arm lit, far arm shadowed), clawed hands
  var ay = 16 + sway;
  rect(4, ay + 3, 9, 2, skD);
  rect(2, ay + 3, 2, 1, skD);
  px(1, ay + 4, BONE);
  rect(8 - wd, ay, 6 + wd, 3, sk);
  rect(3, ay, 5, 3, sk);
  rect(3, ay, 5, 1, skL);
  px(10, ay + 1, BLOOD);
  rect(1, ay, 2, 1, sk);
  px(0, ay, L.feats.includes('claws') ? BONE : skL);
  px(1, ay + 2, sk);
  px(0, ay + 2, L.feats.includes('claws') ? BONE : skL);
  if (L.feats.includes('claws')) {
    px(0, ay - 1, BONE);
    px(0, ay + 3, BONE);
  }
  rect(9, ay + 1, 3, 1, sh); // torn sleeve cuff
  // Glowing veins / frost / dirt / maggots
  if (L.feats.includes('veins')) {
    var v = L.glow;
    [[hx + 2, hy + 6], [hx + 3, hy + 5], [5, ay + 1], [6, ay + 2], [7, ay + 1], [tx + 3, 20], [tx + 4, 21], [tx + 4, 22], [tx + 5, 23], [tx + 6, 26], [tx + 7, 27]].forEach(function (_ref11) {
      var _ref12 = _slicedToArray(_ref11, 2),
        x = _ref12[0],
        y = _ref12[1];
      return px(x, y, v);
    });
  }
  if (L.feats.includes('ice')) [[hx + 2, hy], [hx + 8, hy + 2], [3, ay], [tx + 1, 16], [tx + tw - 2, 20], [17, 40], [22, 37]].forEach(function (_ref13) {
    var _ref14 = _slicedToArray(_ref13, 2),
      x = _ref14[0],
      y = _ref14[1];
    px(x, y, '#e8f8ff');
    px(x, y - 1, '#bfe4f4');
  });
  // Keep dirt staining on solid body pixels; don't scatter isolated flecks into transparent space behind the sprite.
  if (L.feats.includes('dirt')) for (var _i6 = 0; _i6 < 18; _i6++) {
    var _x2 = 2 + Math.floor(rnd() * 30),
      _y4 = 12 + Math.floor(rnd() * 33);
    if (g[_y4] && g[_y4][_x2]) px(_x2, _y4, rnd() > 0.5 ? '#4a3a24' : '#6a5436');
  }
  if (L.feats.includes('maggots')) [[tx + 3, 20], [tx + 5, 22], [tx + 4, 24], [hx + 6, hy + 4], [6, ay + 1]].forEach(function (_ref15) {
    var _ref16 = _slicedToArray(_ref15, 2),
      x = _ref16[0],
      y = _ref16[1];
    return px(x, y, '#ece4c4');
  });
  // Auto outline
  var out = g.map(function (r) {
    return r.slice();
  });
  var _loop3 = function _loop3(_y5) {
    var _loop4 = function _loop4(_x4) {
      if (g[_y5][_x4]) return 1; // continue
      if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(function (_ref17) {
        var _ref18 = _slicedToArray(_ref17, 2),
          dx = _ref18[0],
          dy = _ref18[1];
        return g[_y5 + dy] && g[_y5 + dy][_x4 + dx];
      })) out[_y5][_x4] = '#120d0a';
    };
    for (var _x4 = 0; _x4 < W; _x4++) {
      if (_loop4(_x4)) continue;
    }
  };
  for (var _y5 = 0; _y5 < H; _y5++) {
    _loop3(_y5);
  }
  var rects = '';
  for (var _y6 = 0; _y6 < H; _y6++) {
    var _x3 = 0;
    while (_x3 < W) {
      var c = out[_y6][_x3];
      if (!c) {
        _x3++;
        continue;
      }
      var _w = 1;
      while (_x3 + _w < W && out[_y6][_x3 + _w] === c) _w++;
      rects += '<rect x="' + _x3 + '" y="' + _y6 + '" width="' + _w + '" height="1" fill="' + c + '"/>';
      _x3 += _w;
    }
  }
  var w = Math.round(72 * L.scale),
    h = Math.round(96 * L.scale);
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 48" width="' + w + '" height="' + h + '" shape-rendering="crispEdges">' + rects + '</svg>';
};

// ─── UNDEAD SIDE-SCROLLER SPRITES (16-bit, distinct per tier) ───────────────
ZI_ART.undead = {
  shambler: function shambler() {
    var frame = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    // 16-bit shambler: shuffling, head tilted, arms dangling
    var armOffset = frame % 2 === 0 ? 0 : 1;
    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 18 28\" width=\"54\" height=\"84\" shape-rendering=\"crispEdges\">\n      <!-- Head, tilted left -->\n      <rect x=\"6\" y=\"0\" width=\"8\" height=\"2\" fill=\"#4a6840\"/>\n      <rect x=\"5\" y=\"2\" width=\"9\" height=\"6\" fill=\"#5a7850\"/>\n      <!-- Hair tufts -->\n      <rect x=\"6\" y=\"0\" width=\"1\" height=\"1\" fill=\"#1a2410\"/>\n      <rect x=\"12\" y=\"0\" width=\"1\" height=\"1\" fill=\"#1a2410\"/>\n      <!-- Eyes - glowing white -->\n      <rect x=\"6\" y=\"4\" width=\"2\" height=\"2\" fill=\"#d0c8a8\"/>\n      <rect x=\"11\" y=\"4\" width=\"2\" height=\"2\" fill=\"#d0c8a8\"/>\n      <rect x=\"7\" y=\"5\" width=\"1\" height=\"1\" fill=\"#1a1010\"/>\n      <rect x=\"12\" y=\"5\" width=\"1\" height=\"1\" fill=\"#1a1010\"/>\n      <!-- Open mouth dripping -->\n      <rect x=\"7\" y=\"7\" width=\"5\" height=\"2\" fill=\"#3a0808\"/>\n      <rect x=\"8\" y=\"6\" width=\"1\" height=\"1\" fill=\"#a08070\"/>\n      <rect x=\"10\" y=\"6\" width=\"1\" height=\"1\" fill=\"#a08070\"/>\n      <rect x=\"9\" y=\"9\" width=\"1\" height=\"2\" fill=\"#4a0a0a\"/>\n      <!-- Torso - tattered shirt -->\n      <rect x=\"4\" y=\"9\" width=\"11\" height=\"9\" fill=\"#2a3424\"/>\n      <rect x=\"4\" y=\"11\" width=\"3\" height=\"1\" fill=\"#3a0808\"/>\n      <rect x=\"11\" y=\"13\" width=\"4\" height=\"1\" fill=\"#5a3424\"/>\n      <rect x=\"5\" y=\"14\" width=\"2\" height=\"3\" fill=\"#5a7850\"/>\n      <!-- Arms outstretched, swaying -->\n      <rect x=\"0\" y=\"".concat(10 + armOffset, "\" width=\"4\" height=\"3\" fill=\"#5a7850\"/>\n      <rect x=\"0\" y=\"").concat(13 + armOffset, "\" width=\"3\" height=\"2\" fill=\"#5a7850\"/>\n      <rect x=\"15\" y=\"").concat(10 - armOffset, "\" width=\"3\" height=\"3\" fill=\"#5a7850\"/>\n      <rect x=\"16\" y=\"").concat(13 - armOffset, "\" width=\"2\" height=\"2\" fill=\"#5a7850\"/>\n      <!-- Hands - clawed -->\n      <rect x=\"0\" y=\"").concat(15 + armOffset, "\" width=\"2\" height=\"1\" fill=\"#4a6840\"/>\n      <rect x=\"16\" y=\"").concat(15 - armOffset, "\" width=\"2\" height=\"1\" fill=\"#4a6840\"/>\n      <!-- Pants - torn -->\n      <rect x=\"5\" y=\"18\" width=\"3\" height=\"6\" fill=\"#1e1a16\"/>\n      <rect x=\"10\" y=\"18\" width=\"3\" height=\"6\" fill=\"#1e1a16\"/>\n      <rect x=\"6\" y=\"20\" width=\"1\" height=\"2\" fill=\"#3a0808\"/>\n      <!-- Feet -->\n      <rect x=\"4\" y=\"24\" width=\"4\" height=\"2\" fill=\"#2a1a10\"/>\n      <rect x=\"10\" y=\"24\" width=\"4\" height=\"2\" fill=\"#2a1a10\"/>\n      <rect x=\"4\" y=\"26\" width=\"3\" height=\"2\" fill=\"#1a1008\"/>\n      <rect x=\"11\" y=\"26\" width=\"3\" height=\"2\" fill=\"#1a1008\"/>\n    </svg>");
  },
  runner: function runner() {
    var frame = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var stride = frame % 2;
    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 18 26\" width=\"54\" height=\"78\" shape-rendering=\"crispEdges\">\n      <!-- Head - leaning forward, mouth wide -->\n      <rect x=\"7\" y=\"0\" width=\"7\" height=\"2\" fill=\"#3a5040\"/>\n      <rect x=\"6\" y=\"2\" width=\"9\" height=\"5\" fill=\"#4a6050\"/>\n      <!-- Red eyes (predator) -->\n      <rect x=\"7\" y=\"4\" width=\"2\" height=\"2\" fill=\"#c83030\"/>\n      <rect x=\"12\" y=\"4\" width=\"2\" height=\"2\" fill=\"#c83030\"/>\n      <rect x=\"8\" y=\"5\" width=\"1\" height=\"1\" fill=\"#1a0808\"/>\n      <rect x=\"13\" y=\"5\" width=\"1\" height=\"1\" fill=\"#1a0808\"/>\n      <!-- Snarl mouth -->\n      <rect x=\"7\" y=\"6\" width=\"6\" height=\"2\" fill=\"#3a0808\"/>\n      <rect x=\"8\" y=\"6\" width=\"1\" height=\"2\" fill=\"#d0c8a8\"/>\n      <rect x=\"10\" y=\"6\" width=\"1\" height=\"2\" fill=\"#d0c8a8\"/>\n      <rect x=\"12\" y=\"6\" width=\"1\" height=\"2\" fill=\"#d0c8a8\"/>\n      <!-- Lean torso -->\n      <rect x=\"5\" y=\"8\" width=\"9\" height=\"7\" fill=\"#1e2a20\"/>\n      <rect x=\"5\" y=\"9\" width=\"9\" height=\"1\" fill=\"#3a0808\"/>\n      <rect x=\"7\" y=\"11\" width=\"2\" height=\"3\" fill=\"#5a3030\"/>\n      <!-- Arms in running motion -->\n      <rect x=\"2\" y=\"".concat(8 + stride, "\" width=\"3\" height=\"2\" fill=\"#4a6050\"/>\n      <rect x=\"0\" y=\"").concat(10 + stride, "\" width=\"3\" height=\"2\" fill=\"#4a6050\"/>\n      <rect x=\"14\" y=\"").concat(10 - stride, "\" width=\"3\" height=\"2\" fill=\"#4a6050\"/>\n      <rect x=\"15\" y=\"").concat(12 - stride, "\" width=\"3\" height=\"2\" fill=\"#4a6050\"/>\n      <!-- Legs in sprint stride -->\n      <rect x=\"5\" y=\"15\" width=\"3\" height=\"").concat(4 + stride * 2, "\" fill=\"#1a1814\"/>\n      <rect x=\"11\" y=\"15\" width=\"3\" height=\"").concat(4 - stride, "\" fill=\"#1a1814\"/>\n      <rect x=\"").concat(5 + stride * 2, "\" y=\"").concat(19 + stride * 2, "\" width=\"4\" height=\"3\" fill=\"#2a1a10\"/>\n      <rect x=\"").concat(11 - stride, "\" y=\"").concat(19 - stride, "\" width=\"4\" height=\"3\" fill=\"#2a1a10\"/>\n    </svg>");
  },
  spitter: function spitter() {
    var frame = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var sac = frame % 2;
    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 18 28\" width=\"54\" height=\"84\" shape-rendering=\"crispEdges\">\n      <!-- Large bulbous head -->\n      <rect x=\"5\" y=\"0\" width=\"9\" height=\"3\" fill=\"#5a7030\"/>\n      <rect x=\"4\" y=\"3\" width=\"11\" height=\"6\" fill=\"#6a8040\"/>\n      <!-- Yellow eyes -->\n      <rect x=\"5\" y=\"4\" width=\"2\" height=\"2\" fill=\"#f0d050\"/>\n      <rect x=\"12\" y=\"4\" width=\"2\" height=\"2\" fill=\"#f0d050\"/>\n      <rect x=\"6\" y=\"5\" width=\"1\" height=\"1\" fill=\"#1a1010\"/>\n      <rect x=\"13\" y=\"5\" width=\"1\" height=\"1\" fill=\"#1a1010\"/>\n      <!-- Huge toxic mouth, dripping acid -->\n      <rect x=\"4\" y=\"7\" width=\"11\" height=\"3\" fill=\"#5a7030\"/>\n      <rect x=\"5\" y=\"8\" width=\"9\" height=\"2\" fill=\"#0a0a0a\"/>\n      <!-- Acid trail -->\n      <rect x=\"6\" y=\"10\" width=\"1\" height=\"".concat(2 + sac, "\" fill=\"#a0d040\"/>\n      <rect x=\"9\" y=\"10\" width=\"1\" height=\"").concat(3 + sac, "\" fill=\"#a0d040\" opacity=\"0.9\"/>\n      <rect x=\"12\" y=\"10\" width=\"1\" height=\"").concat(2 - sac, "\" fill=\"#a0d040\"/>\n      <!-- Body with toxic sacs -->\n      <rect x=\"3\" y=\"11\" width=\"12\" height=\"9\" fill=\"#4a6020\"/>\n      <!-- Bulging sacs (animated) -->\n      <rect x=\"1\" y=\"").concat(12 + sac, "\" width=\"4\" height=\"4\" fill=\"#a0d040\" opacity=\"0.85\"/>\n      <rect x=\"13\" y=\"").concat(12 + sac, "\" width=\"4\" height=\"4\" fill=\"#a0d040\" opacity=\"0.85\"/>\n      <rect x=\"2\" y=\"").concat(13 + sac, "\" width=\"2\" height=\"2\" fill=\"#d0f060\"/>\n      <rect x=\"14\" y=\"").concat(13 + sac, "\" width=\"2\" height=\"2\" fill=\"#d0f060\"/>\n      <!-- Thin arms -->\n      <rect x=\"0\" y=\"14\" width=\"3\" height=\"2\" fill=\"#6a8040\"/>\n      <rect x=\"15\" y=\"14\" width=\"3\" height=\"2\" fill=\"#6a8040\"/>\n      <!-- Stunted legs -->\n      <rect x=\"5\" y=\"20\" width=\"3\" height=\"6\" fill=\"#2a1814\"/>\n      <rect x=\"10\" y=\"20\" width=\"3\" height=\"6\" fill=\"#2a1814\"/>\n      <rect x=\"4\" y=\"26\" width=\"5\" height=\"2\" fill=\"#1a1008\"/>\n      <rect x=\"10\" y=\"26\" width=\"5\" height=\"2\" fill=\"#1a1008\"/>\n    </svg>");
  },
  brute: function brute() {
    var frame = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 22 30\" width=\"66\" height=\"90\" shape-rendering=\"crispEdges\">\n      <!-- Massive head, bone protrusions -->\n      <rect x=\"6\" y=\"0\" width=\"10\" height=\"2\" fill=\"#2a3420\"/>\n      <rect x=\"5\" y=\"2\" width=\"12\" height=\"8\" fill=\"#3a4830\"/>\n      <!-- Bony brow ridge -->\n      <rect x=\"4\" y=\"3\" width=\"14\" height=\"2\" fill=\"#d0c0a0\"/>\n      <!-- Glowing red eyes deep set -->\n      <rect x=\"6\" y=\"5\" width=\"3\" height=\"2\" fill=\"#0a0a0a\"/>\n      <rect x=\"13\" y=\"5\" width=\"3\" height=\"2\" fill=\"#0a0a0a\"/>\n      <rect x=\"7\" y=\"6\" width=\"1\" height=\"1\" fill=\"#f04040\"/>\n      <rect x=\"14\" y=\"6\" width=\"1\" height=\"1\" fill=\"#f04040\"/>\n      <!-- Jutting jaw with tusks -->\n      <rect x=\"5\" y=\"8\" width=\"12\" height=\"3\" fill=\"#3a0808\"/>\n      <rect x=\"6\" y=\"9\" width=\"2\" height=\"3\" fill=\"#d0c0a0\"/>\n      <rect x=\"14\" y=\"9\" width=\"2\" height=\"3\" fill=\"#d0c0a0\"/>\n      <rect x=\"9\" y=\"10\" width=\"1\" height=\"2\" fill=\"#d0c0a0\"/>\n      <rect x=\"12\" y=\"10\" width=\"1\" height=\"2\" fill=\"#d0c0a0\"/>\n      <!-- Massive torso -->\n      <rect x=\"2\" y=\"11\" width=\"18\" height=\"11\" fill=\"#1e2418\"/>\n      <!-- Muscle definition -->\n      <rect x=\"3\" y=\"12\" width=\"6\" height=\"1\" fill=\"#3a4830\"/>\n      <rect x=\"13\" y=\"12\" width=\"6\" height=\"1\" fill=\"#3a4830\"/>\n      <rect x=\"2\" y=\"15\" width=\"18\" height=\"1\" fill=\"#3a4830\"/>\n      <rect x=\"4\" y=\"14\" width=\"3\" height=\"2\" fill=\"#3a0808\"/>\n      <rect x=\"13\" y=\"17\" width=\"4\" height=\"2\" fill=\"#3a0808\"/>\n      <!-- Huge arms -->\n      <rect x=\"0\" y=\"11\" width=\"3\" height=\"10\" fill=\"#3a4830\"/>\n      <rect x=\"19\" y=\"11\" width=\"3\" height=\"10\" fill=\"#3a4830\"/>\n      <rect x=\"0\" y=\"20\" width=\"4\" height=\"3\" fill=\"#3a4830\"/>\n      <rect x=\"18\" y=\"20\" width=\"4\" height=\"3\" fill=\"#3a4830\"/>\n      <!-- Massive fists -->\n      <rect x=\"0\" y=\"22\" width=\"5\" height=\"3\" fill=\"#2a3420\"/>\n      <rect x=\"17\" y=\"22\" width=\"5\" height=\"3\" fill=\"#2a3420\"/>\n      <!-- Thick legs -->\n      <rect x=\"4\" y=\"22\" width=\"6\" height=\"6\" fill=\"#1e1814\"/>\n      <rect x=\"12\" y=\"22\" width=\"6\" height=\"6\" fill=\"#1e1814\"/>\n      <rect x=\"3\" y=\"28\" width=\"7\" height=\"2\" fill=\"#0a0a08\"/>\n      <rect x=\"12\" y=\"28\" width=\"7\" height=\"2\" fill=\"#0a0a08\"/>\n    </svg>";
  },
  burrower: function burrower() {
    var frame = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 22\" width=\"72\" height=\"66\" shape-rendering=\"crispEdges\">\n      <!-- Pale, eyeless head -->\n      <rect x=\"8\" y=\"0\" width=\"8\" height=\"2\" fill=\"#3a3024\"/>\n      <rect x=\"7\" y=\"2\" width=\"10\" height=\"5\" fill=\"#4a4030\"/>\n      <!-- Skin folds -->\n      <rect x=\"8\" y=\"3\" width=\"8\" height=\"1\" fill=\"#5a4838\"/>\n      <rect x=\"9\" y=\"5\" width=\"6\" height=\"1\" fill=\"#3a3024\"/>\n      <!-- Sensor pits (no eyes, just slits) -->\n      <rect x=\"9\" y=\"4\" width=\"2\" height=\"1\" fill=\"#1a1408\"/>\n      <rect x=\"13\" y=\"4\" width=\"2\" height=\"1\" fill=\"#1a1408\"/>\n      <!-- Wide split mouth -->\n      <rect x=\"6\" y=\"6\" width=\"12\" height=\"2\" fill=\"#3a0808\"/>\n      <rect x=\"7\" y=\"6\" width=\"1\" height=\"2\" fill=\"#d0c0a0\"/>\n      <rect x=\"9\" y=\"6\" width=\"1\" height=\"2\" fill=\"#d0c0a0\"/>\n      <rect x=\"11\" y=\"6\" width=\"1\" height=\"2\" fill=\"#d0c0a0\"/>\n      <rect x=\"13\" y=\"6\" width=\"1\" height=\"2\" fill=\"#d0c0a0\"/>\n      <rect x=\"15\" y=\"6\" width=\"1\" height=\"2\" fill=\"#d0c0a0\"/>\n      <rect x=\"17\" y=\"6\" width=\"1\" height=\"2\" fill=\"#d0c0a0\"/>\n      <!-- Long elongated body, low to ground -->\n      <rect x=\"2\" y=\"8\" width=\"22\" height=\"8\" fill=\"#4a4030\"/>\n      <rect x=\"3\" y=\"9\" width=\"20\" height=\"1\" fill=\"#5a4838\"/>\n      <rect x=\"2\" y=\"11\" width=\"22\" height=\"1\" fill=\"#3a3024\"/>\n      <rect x=\"3\" y=\"14\" width=\"20\" height=\"1\" fill=\"#3a3024\"/>\n      <!-- Multiple claw-arms -->\n      <rect x=\"0\" y=\"".concat(10 + frame % 2, "\" width=\"3\" height=\"2\" fill=\"#3a3024\"/>\n      <rect x=\"0\" y=\"").concat(13 - frame % 2, "\" width=\"3\" height=\"2\" fill=\"#3a3024\"/>\n      <rect x=\"21\" y=\"").concat(10 + frame % 2, "\" width=\"3\" height=\"2\" fill=\"#3a3024\"/>\n      <rect x=\"21\" y=\"").concat(13 - frame % 2, "\" width=\"3\" height=\"2\" fill=\"#3a3024\"/>\n      <!-- Claws -->\n      <rect x=\"0\" y=\"9\" width=\"1\" height=\"1\" fill=\"#1a1408\"/>\n      <rect x=\"0\" y=\"15\" width=\"1\" height=\"1\" fill=\"#1a1408\"/>\n      <rect x=\"23\" y=\"9\" width=\"1\" height=\"1\" fill=\"#1a1408\"/>\n      <rect x=\"23\" y=\"15\" width=\"1\" height=\"1\" fill=\"#1a1408\"/>\n      <!-- Stubby legs -->\n      <rect x=\"6\" y=\"16\" width=\"3\" height=\"4\" fill=\"#2a1e14\"/>\n      <rect x=\"15\" y=\"16\" width=\"3\" height=\"4\" fill=\"#2a1e14\"/>\n      <rect x=\"5\" y=\"20\" width=\"5\" height=\"2\" fill=\"#1a1408\"/>\n      <rect x=\"14\" y=\"20\" width=\"5\" height=\"2\" fill=\"#1a1408\"/>\n      <!-- Dirt particles around -->\n      <rect x=\"1\" y=\"20\" width=\"1\" height=\"1\" fill=\"#3a2818\"/>\n      <rect x=\"22\" y=\"20\" width=\"1\" height=\"1\" fill=\"#3a2818\"/>\n      <rect x=\"12\" y=\"21\" width=\"1\" height=\"1\" fill=\"#3a2818\"/>\n    </svg>");
  },
  radiationWalker: function radiationWalker() {
    var frame = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var glow = frame % 2;
    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 20 30\" width=\"60\" height=\"90\" shape-rendering=\"crispEdges\">\n      <!-- Radiated head, glowing -->\n      <rect x=\"6\" y=\"0\" width=\"8\" height=\"2\" fill=\"#3a3a1a\"/>\n      <rect x=\"5\" y=\"2\" width=\"10\" height=\"6\" fill=\"#5a5a20\"/>\n      <!-- Radiation veins -->\n      <rect x=\"6\" y=\"3\" width=\"1\" height=\"2\" fill=\"#d0f040\" opacity=\"".concat(0.6 + glow * 0.2, "\"/>\n      <rect x=\"13\" y=\"3\" width=\"1\" height=\"2\" fill=\"#d0f040\" opacity=\"").concat(0.6 + glow * 0.2, "\"/>\n      <rect x=\"9\" y=\"5\" width=\"2\" height=\"2\" fill=\"#d0f040\" opacity=\"").concat(0.6 + glow * 0.2, "\"/>\n      <!-- Eyes - pure radioactive yellow -->\n      <rect x=\"6\" y=\"4\" width=\"2\" height=\"2\" fill=\"#f0f040\"/>\n      <rect x=\"12\" y=\"4\" width=\"2\" height=\"2\" fill=\"#f0f040\"/>\n      <rect x=\"7\" y=\"5\" width=\"1\" height=\"1\" fill=\"#1a1010\"/>\n      <rect x=\"13\" y=\"5\" width=\"1\" height=\"1\" fill=\"#1a1010\"/>\n      <!-- Mouth dripping radiation -->\n      <rect x=\"7\" y=\"6\" width=\"6\" height=\"2\" fill=\"#3a3a00\"/>\n      <rect x=\"9\" y=\"8\" width=\"1\" height=\"2\" fill=\"#d0f040\" opacity=\"").concat(0.6 + glow * 0.3, "\"/>\n      <!-- Body with growths -->\n      <rect x=\"4\" y=\"8\" width=\"12\" height=\"11\" fill=\"#3a4020\"/>\n      <rect x=\"3\" y=\"10\" width=\"2\" height=\"4\" fill=\"#5a5a20\"/>\n      <rect x=\"15\" y=\"11\" width=\"2\" height=\"3\" fill=\"#5a5a20\"/>\n      <!-- Radiation patches -->\n      <rect x=\"6\" y=\"11\" width=\"3\" height=\"3\" fill=\"#d0f040\" opacity=\"").concat(0.5 + glow * 0.3, "\"/>\n      <rect x=\"10\" y=\"13\" width=\"4\" height=\"2\" fill=\"#d0f040\" opacity=\"").concat(0.5 + glow * 0.3, "\"/>\n      <!-- Arms -->\n      <rect x=\"0\" y=\"10\" width=\"4\" height=\"3\" fill=\"#5a5a20\"/>\n      <rect x=\"0\" y=\"13\" width=\"3\" height=\"2\" fill=\"#5a5a20\"/>\n      <rect x=\"16\" y=\"10\" width=\"4\" height=\"3\" fill=\"#5a5a20\"/>\n      <rect x=\"17\" y=\"13\" width=\"3\" height=\"2\" fill=\"#5a5a20\"/>\n      <!-- Legs -->\n      <rect x=\"5\" y=\"19\" width=\"4\" height=\"7\" fill=\"#2a2818\"/>\n      <rect x=\"11\" y=\"19\" width=\"4\" height=\"7\" fill=\"#2a2818\"/>\n      <rect x=\"4\" y=\"26\" width=\"5\" height=\"3\" fill=\"#1a1808\"/>\n      <rect x=\"11\" y=\"26\" width=\"5\" height=\"3\" fill=\"#1a1808\"/>\n      <!-- Glowing aura particles -->\n      <rect x=\"1\" y=\"18\" width=\"1\" height=\"1\" fill=\"#d0f040\" opacity=\"").concat(glow * 0.8, "\"/>\n      <rect x=\"18\" y=\"22\" width=\"1\" height=\"1\" fill=\"#d0f040\" opacity=\"").concat(glow * 0.8, "\"/>\n      <rect x=\"9\" y=\"0\" width=\"1\" height=\"1\" fill=\"#d0f040\" opacity=\"").concat(glow * 0.6, "\"/>\n    </svg>");
  },
  titan: function titan() {
    var frame = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    return "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 28 36\" width=\"84\" height=\"108\" shape-rendering=\"crispEdges\">\n      <!-- Enormous head with horns -->\n      <rect x=\"9\" y=\"2\" width=\"10\" height=\"2\" fill=\"#1a1008\"/>\n      <rect x=\"8\" y=\"4\" width=\"12\" height=\"8\" fill=\"#2a1814\"/>\n      <!-- Horn protrusions -->\n      <rect x=\"6\" y=\"0\" width=\"3\" height=\"4\" fill=\"#d0c0a0\"/>\n      <rect x=\"19\" y=\"0\" width=\"3\" height=\"4\" fill=\"#d0c0a0\"/>\n      <rect x=\"6\" y=\"4\" width=\"2\" height=\"2\" fill=\"#d0c0a0\"/>\n      <rect x=\"20\" y=\"4\" width=\"2\" height=\"2\" fill=\"#d0c0a0\"/>\n      <!-- Pure black eye sockets with red pinprick -->\n      <rect x=\"9\" y=\"6\" width=\"3\" height=\"3\" fill=\"#000\"/>\n      <rect x=\"16\" y=\"6\" width=\"3\" height=\"3\" fill=\"#000\"/>\n      <rect x=\"10\" y=\"7\" width=\"1\" height=\"1\" fill=\"#f00000\"/>\n      <rect x=\"17\" y=\"7\" width=\"1\" height=\"1\" fill=\"#f00000\"/>\n      <!-- Massive maw -->\n      <rect x=\"7\" y=\"10\" width=\"14\" height=\"3\" fill=\"#1a0000\"/>\n      <rect x=\"8\" y=\"10\" width=\"2\" height=\"3\" fill=\"#d0c0a0\"/>\n      <rect x=\"11\" y=\"10\" width=\"2\" height=\"3\" fill=\"#d0c0a0\"/>\n      <rect x=\"14\" y=\"10\" width=\"2\" height=\"3\" fill=\"#d0c0a0\"/>\n      <rect x=\"17\" y=\"10\" width=\"2\" height=\"3\" fill=\"#d0c0a0\"/>\n      <!-- Massive torso -->\n      <rect x=\"3\" y=\"12\" width=\"22\" height=\"14\" fill=\"#1e1810\"/>\n      <!-- Chest plates -->\n      <rect x=\"5\" y=\"14\" width=\"18\" height=\"2\" fill=\"#3a2418\"/>\n      <rect x=\"5\" y=\"18\" width=\"18\" height=\"2\" fill=\"#3a2418\"/>\n      <rect x=\"6\" y=\"22\" width=\"16\" height=\"2\" fill=\"#3a2418\"/>\n      <!-- Glowing chest core -->\n      <rect x=\"12\" y=\"16\" width=\"4\" height=\"4\" fill=\"#f04000\" opacity=\"".concat(0.7 + frame % 2 * 0.3, "\"/>\n      <rect x=\"13\" y=\"17\" width=\"2\" height=\"2\" fill=\"#f0a000\" opacity=\"0.9\"/>\n      <!-- Giant arms -->\n      <rect x=\"0\" y=\"14\" width=\"4\" height=\"14\" fill=\"#2a1814\"/>\n      <rect x=\"24\" y=\"14\" width=\"4\" height=\"14\" fill=\"#2a1814\"/>\n      <rect x=\"0\" y=\"26\" width=\"5\" height=\"4\" fill=\"#2a1814\"/>\n      <rect x=\"23\" y=\"26\" width=\"5\" height=\"4\" fill=\"#2a1814\"/>\n      <!-- Boulder fists -->\n      <rect x=\"0\" y=\"30\" width=\"6\" height=\"4\" fill=\"#3a2418\"/>\n      <rect x=\"22\" y=\"30\" width=\"6\" height=\"4\" fill=\"#3a2418\"/>\n      <!-- Bone spikes on fists -->\n      <rect x=\"0\" y=\"28\" width=\"1\" height=\"2\" fill=\"#d0c0a0\"/>\n      <rect x=\"5\" y=\"28\" width=\"1\" height=\"2\" fill=\"#d0c0a0\"/>\n      <rect x=\"22\" y=\"28\" width=\"1\" height=\"2\" fill=\"#d0c0a0\"/>\n      <rect x=\"27\" y=\"28\" width=\"1\" height=\"2\" fill=\"#d0c0a0\"/>\n      <!-- Massive legs -->\n      <rect x=\"5\" y=\"26\" width=\"8\" height=\"8\" fill=\"#1a1408\"/>\n      <rect x=\"15\" y=\"26\" width=\"8\" height=\"8\" fill=\"#1a1408\"/>\n      <rect x=\"4\" y=\"34\" width=\"9\" height=\"2\" fill=\"#000\"/>\n      <rect x=\"15\" y=\"34\" width=\"9\" height=\"2\" fill=\"#000\"/>\n    </svg>");
  }
};

// ─── DEAD ZONE STYLE PALETTE (additional) ────────────────────────────────────
ZI_ART.deadZoneCSS = "\n  .dz-panel {\n    background: linear-gradient(180deg, #2a261c 0%, #1e1c14 100%);\n    border: 1px solid #4a4030;\n    box-shadow: inset 0 1px 0 rgba(255,255,255,0.05), 0 1px 0 #0a0a08;\n  }\n  .dz-corner-bolt {\n    position: absolute; width: 6px; height: 6px;\n    background: radial-gradient(circle, #6a5040 0%, #2a1e14 60%);\n    border-radius: 50%;\n  }\n  .dz-trim-top    { position: absolute; top:0; left:0; right:0; height:2px; background: linear-gradient(90deg, transparent, #6a5848, transparent); }\n  .dz-trim-bottom { position: absolute; bottom:0; left:0; right:0; height:2px; background: linear-gradient(90deg, transparent, #4a3828, transparent); }\n";

// ─── MATERIAL ECONOMY ─── ZI_MATERIALS (the six base materials) is defined in game/economy.js.

// ─── FORT GATE SCENE (Hearthguard palisade; brief §10.4) ─────────────────────
window.FortGateScene = function FortGateScene(_ref19) {
  var onClose = _ref19.onClose;
  var ZI = window.ZI;
  var q = ZI.getFallowQuest();
  var hostile = ZI._rj('zi_fort_hostile', false);
  var pol = ZI.getPolicy().id;
  // Quest eligibility is checked once, when the gate dialogue opens (brief 12.6 #1).
  var _React$useState = React.useState(function () {
      return ZI.fortQuestEligibility();
    }),
    _React$useState2 = _slicedToArray(_React$useState, 1),
    elig = _React$useState2[0];
  var _React$useState3 = React.useState(hostile ? 'hostile' : q.state === 'ready' ? 'turnin' : q.state === 'active' || q.state === 'done' ? 'return' : 'approach'),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    step = _React$useState4[0],
    setStep = _React$useState4[1];
  var _React$useState5 = React.useState(null),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    res = _React$useState6[0],
    setRes = _React$useState6[1];
  var _React$useState7 = React.useState(false),
    _React$useState8 = _slicedToArray(_React$useState7, 2),
    confirmAtk = _React$useState8[0],
    setConfirmAtk = _React$useState8[1];
  var act = function act(fn) {
    var r = fn();
    setRes(r);
    if (r.next) setStep(r.next);
  };
  var box = function box(lines) {
    return /*#__PURE__*/React.createElement("pre", {
      style: {
        margin: 0,
        whiteSpace: 'pre-wrap',
        fontFamily: 'var(--font-mono)',
        fontSize: 13,
        lineHeight: 1.55,
        color: 'var(--text)',
        background: '#0b0a08',
        border: '1px solid #6a5436',
        padding: '10px 12px'
      }
    }, lines);
  };
  var Btn = function Btn(_ref20) {
    var onClick = _ref20.onClick,
      children = _ref20.children,
      danger = _ref20.danger,
      disabled = _ref20.disabled,
      sub = _ref20.sub;
    return /*#__PURE__*/React.createElement("button", {
      disabled: disabled,
      onClick: onClick,
      style: {
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '8px 11px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        background: 'var(--bg3)',
        border: "1px solid ".concat(danger ? '#ff3b3b' : '#6a5436'),
        color: danger ? '#ff6a5a' : 'var(--text)',
        fontFamily: 'var(--font-mono)',
        fontSize: 13
      }
    }, /*#__PURE__*/React.createElement("span", null, "> ", children), sub && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontSize: 11,
        color: 'var(--text2)',
        marginTop: 2
      }
    }, sub));
  };
  var f = ZI.getFortPos() || {};
  var hasKit = ZI.hasMedKit();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 95,
      background: 'rgba(0,0,0,0.82)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      width: '100%',
      maxWidth: 500,
      maxHeight: 'calc(100% - 32px)',
      overflowY: 'auto',
      padding: 16,
      background: 'var(--bg2)',
      borderColor: '#8a6a3a',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: '#f0d060',
      letterSpacing: '0.12em'
    }
  }, "[TRAVERSAL ", f.coord, "] \xB7 THE HEARTHGUARD'S FORT"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      marginLeft: 'auto',
      background: 'none',
      border: '1px solid var(--border)',
      color: 'var(--text2)',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      padding: '2px 8px'
    }
  }, "\u2715")), step === 'approach' && /*#__PURE__*/React.createElement(React.Fragment, null, box('> Structure sighted: PALISADE\n  A ring of sharpened wooden pikes. Perimeter fencing, patched and tied.\n  Smoke behind it. A watchtower. One gate.'), /*#__PURE__*/React.createElement(Btn, {
    onClick: function onClick() {
      return setStep('gate');
    }
  }, "APPROACH"), /*#__PURE__*/React.createElement(Btn, {
    onClick: onClose
  }, "LEAVE")), step === 'gate' && /*#__PURE__*/React.createElement(React.Fragment, null, box('GUARD: "Far enough. Nobody comes past the pikes without a reason.\n        What do you have that we want?"\n\n' + (!elig.ok ? 'GUARD: "Not here. Move on."' : 'GUARD: "' + ZI.fortTone() + '"')), elig.ok && /*#__PURE__*/React.createElement(Btn, {
    onClick: function onClick() {
      return act(ZI.fortOffer);
    },
    disabled: !hasKit,
    sub: hasKit ? 'Costs the heal charges it carries. Medicine is what they need.' : '"Medicine. Bring medicine." — craft a Field Medkit, or talk your way in.'
  }, "OFFER: Field Medkit"), elig.ok && /*#__PURE__*/React.createElement(Btn, {
    onClick: function onClick() {
      return act(function () {
        return ZI.fortCheck('diplomat');
      });
    },
    sub: "Read the guard, ask for terms \xB7 ".concat(ZI.fortCheckChance('diplomat'), "% \xB7 harder terms: keep your kit, 60 kills, less standing")
  }, "TALK: Diplomat check"), elig.ok && /*#__PURE__*/React.createElement(Btn, {
    onClick: function onClick() {
      return act(function () {
        return ZI.fortCheck('command');
      });
    },
    sub: "Hold your ground \xB7 ".concat(ZI.fortCheckChance('command'), "% \xB7 harder terms: keep your kit, 60 kills, less standing")
  }, "TALK: Command check"), /*#__PURE__*/React.createElement(Btn, {
    onClick: onClose
  }, "LEAVE"), !confirmAtk ? /*#__PURE__*/React.createElement(Btn, {
    danger: true,
    onClick: function onClick() {
      return setConfirmAtk(true);
    },
    sub: "Risk: HIGH \xB7 ".concat(ZI.fortAttackChance(), "% \xB7 unlocks Heinous if it works")
  }, "ATTACK THE GUARD") : /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid #ff3b3b',
      padding: 10,
      background: 'rgba(255,59,59,0.08)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--text)',
      marginBottom: 8
    }
  }, "This cannot be undone. The Hearthguard will be hostile. Failure leaves a lasting injury."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: function onClick() {
      return setConfirmAtk(false);
    }
  }, "Back off"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      borderColor: '#ff3b3b',
      color: '#ff6a5a'
    },
    onClick: function onClick() {
      setConfirmAtk(false);
      act(ZI.fortAttack);
    }
  }, "Go for the guard")))), step === 'offer' && /*#__PURE__*/React.createElement(React.Fragment, null, box('MYTHICAL JESTER: "There\'s a field south of here, crawling with the dead.\n                 Clear it and the gate opens."\n\n  QUEST: FALLOW GROUND' + (ZI.getFallowQuest().harder ? '  (harder terms)' : '') + '\n  Clear ' + (f.fallow ? f.fallow.coord : 'the field') + ' — ' + ZI.fallowGoal() + ' kills while stationed there.\n  Reward: access to the factions, +' + ZI.fallowTerms().rep + ' Hearthguard standing on turn-in.' + (ZI.getFallowQuest().terms === 'check' ? '\n  You keep your med kit. The guard keeps an eye on you.' : '')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text2)'
    }
  }, "Travel to \uD83C\uDF3E ", f.fallow && f.fallow.coord, ", then let your survivor Wander there. Cleared ground is calmer ground."), /*#__PURE__*/React.createElement(Btn, {
    onClick: onClose
  }, "ACCEPT QUEST")), step === 'return' && /*#__PURE__*/React.createElement(React.Fragment, null, box(q.state === 'done' ? q.terms === 'check' ? 'GUARD: "Mythical Jester vouches for you. I\'m still watching."' : 'GUARD: "Welcome back. Mythical Jester says you\'re one of us now."' : q.terms === 'check' ? 'GUARD: "' + ZI.fallowProgress() + ' of ' + ZI.fallowGoal() + '. You talked your way in; now earn it."\n  The guard doesn\'t take their eyes off you.' : 'GUARD: "Field\'s not clear yet. ' + ZI.fallowProgress() + ' of ' + ZI.fallowGoal() + '. Keep at it."'), /*#__PURE__*/React.createElement(Btn, {
    onClick: onClose
  }, "LEAVE")), step === 'turnin' && /*#__PURE__*/React.createElement(React.Fragment, null, box((ZI.getFallowQuest().terms === 'check' ? 'GUARD: "Huh. You actually did it."' : 'GUARD: "Word came from the south field. It\'s quiet out there."') + '\n        "Mythical Jester wants to see you."\n\n  The gate swings open. From the inside, the pikes lean outward over\n  a ditch; the perimeter fence is lashed wire and old doors.'), ZI.inFortCell() ? /*#__PURE__*/React.createElement(Btn, {
    onClick: function onClick() {
      return act(ZI.fortTurnIn);
    }
  }, "TURN IN: FALLOW GROUND") : /*#__PURE__*/React.createElement(Btn, {
    disabled: true,
    sub: "Travel into the Fort's cell (".concat(f.coord, ") to report.")
  }, "TURN IN: FALLOW GROUND")), step === 'crate' && /*#__PURE__*/React.createElement(React.Fragment, null, box('MYTHICAL JESTER: "You cleared the south field. That is more than most would do\n                 for a stranger' + (ZI.getFallowQuest().terms === 'check' ? ' who talked their way to our gate."' : ' with a satchel of medicine."') + '\n\n  At the field\'s edge you found a SEALED CRATE, stamped with a\n  laboratory mark nobody here recognises.\n\nMYTHICAL JESTER: "That mark is not ours. Somebody built this. Find out who."\n  Mythical Jester unrolls a hand-drawn map. "Five other groups live between here\n  and the ridge. We trade with some. We fear one."'), /*#__PURE__*/React.createElement(Btn, {
    onClick: onClose,
    sub: "A survey team was seen near ".concat((ZI.getSurveyPoint() || {}).coord || 'the ridge', ". Your Factions page is open.")
  }, "CONTINUE")), step === 'hostile' && /*#__PURE__*/React.createElement(React.Fragment, null, box('A horn sounds from the watchtower. Bows rise along the pikes.\n  The Hearthguard remember what you did.'), /*#__PURE__*/React.createElement(Btn, {
    onClick: onClose
  }, "LEAVE")), res && /*#__PURE__*/React.createElement("div", {
    style: {
      whiteSpace: 'pre-wrap',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      lineHeight: 1.5,
      padding: '8px 10px',
      border: "1px solid ".concat(res.tone === 'good' ? 'var(--green)' : 'var(--amber)'),
      color: res.tone === 'good' ? 'var(--green)' : 'var(--amber)'
    }
  }, res.text), step === 'done' && /*#__PURE__*/React.createElement(Btn, {
    onClick: onClose
  }, "CONTINUE")));
};

// ─── ACTIVE CONTROLS (Batch 2B, spec 13): buttons + discovery prompt + stress. Rules live in game/active.js. ───
window.ActiveControls = function ActiveControls(_ref21) {
  var onLog = _ref21.onLog,
    setScreen = _ref21.setScreen;
  var Z = window.ZI,
    A = Z.ACTIVE_TABLE;
  var _React$useState9 = React.useState(0),
    _React$useState0 = _slicedToArray(_React$useState9, 2),
    tick = _React$useState0[1];
  React.useEffect(function () {
    var t = setInterval(function () {
      return tick(function (n) {
        return n + 1;
      });
    }, 500);
    var off = Z.onInventoryChange ? Z.onInventoryChange(function () {
      return tick(function (n) {
        return n + 1;
      });
    }) : null;
    return function () {
      clearInterval(t);
      off && off();
    };
  }, []);
  var run = Z.getWanderRun(),
    ch = Z.chargeTotals(),
    stress = Z.getStress(),
    stage = Z.stressStage(stress),
    p = run.prompt;
  var act = function act(fn, ok) {
    var r = Z.wanderAct(fn);
    if (!r) return;
    if (r.ok === false) onLog(r.fumbled ? '✋ ' + r.reason : '⚠ ' + r.reason, 'enemy');else ok && onLog(ok(r), 'player');
    tick(function (n) {
      return n + 1;
    });
  };
  var mono = {
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    padding: '6px 11px',
    cursor: 'pointer',
    whiteSpace: 'nowrap'
  };
  var btn = function btn(label, onClick, opts) {
    opts = opts || {};
    var dis = !!opts.disabled,
      c = opts.color || 'var(--amber)';
    return /*#__PURE__*/React.createElement("button", {
      onClick: dis ? undefined : onClick,
      disabled: dis,
      title: opts.title,
      style: _objectSpread(_objectSpread({}, mono), {}, {
        cursor: dis ? 'not-allowed' : 'pointer',
        background: dis ? 'var(--bg4)' : 'transparent',
        color: dis ? 'var(--text3)' : c,
        border: "1px solid ".concat(dis ? 'var(--border)' : c)
      })
    }, label);
  };
  var stColor = stage.id === 'calm' ? 'var(--green)' : stage.id === 'strained' ? 'var(--amber)' : 'var(--red2)';
  var hold = run.retreatHold,
    busy = run.resting || run.withdrawing || !!hold;
  var label = p ? A.riskLabels[Z.promptLabelTier(p)] : null;
  var live = p && p.createdLive && !hold;
  // RB2: the retreat rules are not edited on this screen (parked for the shop); the scene shows them while resting.
  return /*#__PURE__*/React.createElement(React.Fragment, null, btn("\u26D1 Heal ".concat(ch.heal), function () {
    return act(function (s) {
      return Z.wanderHeal(s);
    }, function (r) {
      return "\u26D1 +".concat(r.healed, " HP (").concat(r.source === 'base' ? 'base charge' : 'med kit', ").");
    });
  }, {
    disabled: ch.heal <= 0,
    color: 'var(--green)',
    title: "Base ".concat(ch.baseHeal, " + kits ").concat(ch.kitHeal, ". Base charges refill after resting at base or camp.")
  }), btn("\uD83D\uDC41 Scout ".concat(ch.scout), function () {
    return act(function (s) {
      return Z.wanderScout(s);
    }, function (r) {
      return r.prompt.reduced ? '👁 Scouted: you found a safer way in (risk −1 tier).' : r.prompt.oddsShown ? '👁 Scouted: exact odds revealed.' : '👁 Scouted: true risk confirmed.';
    });
  }, {
    disabled: ch.scout <= 0 || !live || p.scouted,
    title: live ? 'Scout this discovery' : 'Scout works on a discovery prompt'
  }), btn("\u23EB Push On ".concat(run.pressure || 0, "/").concat(A.push.maxPressure), function () {
    return act(function (s) {
      return Z.wanderPushOn(s);
    }, function (r) {
      return "\u23EB Pushing on \u2014 pressure ".concat(r.pressure, "/").concat(A.push.maxPressure, ": more and tougher encounters.");
    });
  }, {
    disabled: busy || (run.pressure || 0) >= A.push.maxPressure,
    color: 'var(--red2)'
  }), btn('🔀 Change Route', function () {
    act(function (s) {
      return Z.wanderChangeRoute(s);
    }, function () {
      return "\uD83D\uDD00 Changing route (+".concat(A.changeRoute.stress, " stress, ").concat(A.changeRoute.moveStepSec, "s of travel).");
    });
    setScreen && setScreen('traversal');
  }, {
    disabled: busy,
    title: 'Pick a new zone on the Traversal map'
  }), /*#__PURE__*/React.createElement("span", {
    title: "Stress ".concat(Math.round(stress), "/100 \u2014 ").concat(stage.name),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: stColor,
      minWidth: 150
    }
  }, "Stress ", Math.round(stress), " \xB7 ", stage.name, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1,
      minWidth: 50,
      height: 6,
      background: 'var(--bg4)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'block',
      height: '100%',
      width: Math.min(100, stress) + '%',
      background: stColor
    }
  }))), hold && /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    "data-retreat-hold": "1",
    style: {
      flexBasis: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
      padding: '8px 10px',
      border: '1px solid var(--red2)',
      background: 'rgba(255,80,60,0.08)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: 'var(--red2)'
    }
  }, "\u26A0 ", hold.text), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text2)'
    }
  }, Math.max(0, Math.ceil(hold.expiresInMs / 1000)), "s \xB7 then return \xB7 patrol on hold"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 6,
      marginLeft: 'auto'
    }
  }, btn('Return now', function () {
    return act(function (s) {
      return Z.retreatHoldResolve(s, 'return', null, []);
    }, function (r) {
      return '↩ ' + r.text;
    });
  }, {
    color: 'var(--amber)'
  }), btn('Push on', function () {
    return act(function (s) {
      return Z.retreatHoldResolve(s, 'pushon', null, []);
    }, function (r) {
      return '⏵ ' + r.text;
    });
  }, {
    color: 'var(--text)'
  }))), live && /*#__PURE__*/React.createElement("div", {
    role: "dialog",
    style: {
      flexBasis: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
      padding: '8px 10px',
      border: '1px solid #f0d060',
      background: 'rgba(240,208,96,0.08)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: '#f0d060'
    }
  }, "\uD83C\uDFDA ", p.name, " sighted \xB7 Risk: ", label, p.oddsShown ? " \xB7 ".concat(A.riskOdds[p.riskTier], "% \xB7 reward tier ").concat(p.riskTier + 1) : ''), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text2)'
    }
  }, Math.max(0, Math.ceil(p.expiresInMs / 1000)), "s \xB7 then policy decides"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 6,
      marginLeft: 'auto'
    }
  }, btn('Venture closer', function () {
    return act(function (s) {
      return Z.resolvePrompt(s, 'venture', null, Math.random);
    }, function (r) {
      return r.text;
    });
  }, {
    color: '#f0d060'
  }), btn('Move on', function () {
    return act(function (s) {
      return Z.resolvePrompt(s, 'moveon', null, Math.random);
    }, function (r) {
      return r.text;
    });
  }, {
    color: 'var(--text)'
  }))));
};

// ─── SATELLITE MAP TRAVERSAL ─────────────────────────────────────────────────
window.SatelliteTraversalScreen = function SatelliteTraversalScreen(_ref22) {
  var _ZI$BIOMES$find, _ZI$RMAT_TIERS$sq$rma, _ZI$RMAT_TIERS$sq$rma2;
  var setScreen = _ref22.setScreen,
    setActiveRoute = _ref22.setActiveRoute;
  var ZI = window.ZI;
  var _React$useState1 = React.useState('scavenge'),
    _React$useState10 = _slicedToArray(_React$useState1, 2),
    activeType = _React$useState10[0],
    setActiveType = _React$useState10[1];
  var _React$useState11 = React.useState(null),
    _React$useState12 = _slicedToArray(_React$useState11, 2),
    hoveredSquare = _React$useState12[0],
    setHoveredSquare = _React$useState12[1];
  var _React$useState13 = React.useState(null),
    _React$useState14 = _slicedToArray(_React$useState13, 2),
    selectedSquare = _React$useState14[0],
    setSelectedSquare = _React$useState14[1];
  var _React$useState15 = React.useState([1]),
    _React$useState16 = _slicedToArray(_React$useState15, 2),
    selectedSurvivors = _React$useState16[0],
    setSelectedSurvivors = _React$useState16[1];

  // Map types - each has its own grid of destination squares
  var mapTypes = [{
    id: 'scavenge',
    label: 'Scavenge',
    color: '#e6c47e',
    icon: '🗺️'
  }, {
    id: 'contract',
    label: 'Contracts',
    color: '#c894ff',
    icon: '🤝'
  }, {
    id: 'training',
    label: 'Training',
    color: '#a2dca2',
    icon: '💪'
  }, {
    id: 'patrol',
    label: 'Patrol',
    color: '#74b6ee',
    icon: '🛡️'
  }, {
    id: 'raid',
    label: 'Raid',
    color: '#f08a52',
    icon: '⚔️'
  }];

  // Seeded world: sectors of 8×6 cells; cells are generated from the world seed.
  var COLS = ZI.SECTOR_COLS,
    ROWS = ZI.SECTOR_ROWS;
  var readJ = function readJ(k, d) {
    try {
      var v = JSON.parse(localStorage.getItem(k) || 'null');
      return v == null ? d : v;
    } catch (e) {
      return d;
    }
  };
  var writeJ = function writeJ(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {}
  };
  var worldSeed = ZI.worldSeed();
  // ── Outbreak start: persisted random starting cell + "You are Here" ──
  var _React$useState17 = React.useState(function () {
      var p = readJ('zi_trav_pos', null);
      // Damaged position (Oct 29): anything that is not a map cell is treated as missing, so a new start is picked.
      if (p && (_typeof(p) !== 'object' || Array.isArray(p) || !(Number.isFinite(p.gx) || Number.isFinite(p.row)))) p = null;
      if (p && p.gx == null && p.row != null) {
        p = ZI.zoneFromCell(ZI.worldCell(p.col, p.row, 'scavenge'));
        writeJ('zi_trav_pos', p);
      } // migrate old saves
      if (!p) {
        var open = [];
        for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) {
          var q = ZI.worldCell(c, r, 'scavenge');
          if (q.state !== 'locked') open.push(q);
        }
        var pick = open[Math.floor(Math.random() * open.length)] || ZI.worldCell(0, 0, 'scavenge');
        p = ZI.zoneFromCell(pick);
        writeJ('zi_trav_pos', p);
        writeJ('zi_trav_start', p);
      }
      return p;
    }),
    _React$useState18 = _slicedToArray(_React$useState17, 2),
    pos = _React$useState18[0],
    setPos = _React$useState18[1];
  var _React$useState19 = React.useState(function () {
      return {
        sx: pos.sx || 0,
        sy: pos.sy || 0
      };
    }),
    _React$useState20 = _slicedToArray(_React$useState19, 2),
    view = _React$useState20[0],
    setView = _React$useState20[1];
  // Smoke-test fix (Oct 20): follow moves the game makes itself (forced retreat home, return after a Base rest).
  React.useEffect(function () {
    return ZI.onTravPosChange ? ZI.onTravPosChange(function () {
      var p = readJ('zi_trav_pos', null);
      if (p && p.gx != null) {
        setPos(p);
        setView({
          sx: p.sx || 0,
          sy: p.sy || 0
        });
      }
    }) : undefined;
  }, []);
  var _React$useState21 = React.useState(function () {
      return ZI.getExploredSectors();
    }),
    _React$useState22 = _slicedToArray(_React$useState21, 2),
    explored = _React$useState22[0],
    setExplored = _React$useState22[1];
  var squares = React.useMemo(function () {
    var list = [];
    for (var r = 0; r < ROWS; r++) for (var c = 0; c < COLS; c++) list.push(ZI.worldCell(view.sx * COLS + c, view.sy * ROWS + r, activeType));
    return list;
  }, [activeType, view.sx, view.sy, worldSeed, questTick]); // questTick: kills/quest terms change cleared state

  var biomeColors = {
    mountain: {
      fill: '#1a2818',
      stroke: '#3a5028'
    },
    suburbia: {
      fill: '#2a2218',
      stroke: '#4a3828'
    },
    metro: {
      fill: '#1c1a20',
      stroke: '#3a3848'
    },
    perimeter: {
      fill: '#1e1024',
      stroke: '#3a1854'
    }
  };
  var stateColors = {
    available: '#a2dca2',
    cleared: '#a39478',
    contested: '#f08a52',
    locked: '#3a3228'
  };
  var survivors = [{
    id: 1,
    name: 'Mira Chen',
    "class": 'mechanic',
    level: 8,
    status: 'idle'
  }, {
    id: 2,
    name: 'Buck Talon',
    "class": 'enforcer',
    level: 11,
    status: 'idle'
  }, {
    id: 3,
    name: 'Petra Voss',
    "class": 'medic',
    level: 7,
    status: 'busy'
  }, {
    id: 4,
    name: 'Yael Strom',
    "class": 'ranger',
    level: 14,
    status: 'idle'
  }];
  var sq = selectedSquare || hoveredSquare;
  var _React$useState23 = React.useState(function () {
      return readJ('zi_trav_camp', null);
    }),
    _React$useState24 = _slicedToArray(_React$useState23, 2),
    camp = _React$useState24[0],
    setCamp = _React$useState24[1];
  var _React$useState25 = React.useState(function () {
      return readJ('zi_trav_looted', {});
    }),
    _React$useState26 = _slicedToArray(_React$useState25, 2),
    looted = _React$useState26[0],
    setLooted = _React$useState26[1];
  var _React$useState27 = React.useState(function () {
      return readJ('zi_trav_scouted', {});
    }),
    _React$useState28 = _slicedToArray(_React$useState27, 2),
    scouted = _React$useState28[0],
    setScouted = _React$useState28[1];
  var _React$useState29 = React.useState(null),
    _React$useState30 = _slicedToArray(_React$useState29, 2),
    actionCell = _React$useState30[0],
    setActionCell = _React$useState30[1];
  var _React$useState31 = React.useState(null),
    _React$useState32 = _slicedToArray(_React$useState31, 2),
    actionResult = _React$useState32[0],
    setActionResult = _React$useState32[1];
  var _React$useState33 = React.useState(false),
    _React$useState34 = _slicedToArray(_React$useState33, 2),
    fortOpen = _React$useState34[0],
    setFortOpen = _React$useState34[1];
  var _React$useState35 = React.useState(0),
    _React$useState36 = _slicedToArray(_React$useState35, 2),
    questTick = _React$useState36[0],
    setQuestTick = _React$useState36[1];
  React.useEffect(function () {
    ZI.getFortPos();
    setQuestTick(function (t) {
      return t + 1;
    });
    var t = setInterval(function () {
      return setQuestTick(function (x) {
        return x + 1;
      });
    }, 3000);
    return function () {
      return clearInterval(t);
    };
  }, []);
  var fortPos = ZI.getFortPos();
  var fallowQ = ZI.getFallowQuest();
  // TRAV-01a (Sam, Oct 21: T5, S7): Camp Leader controls show only in Camp Leader mode. Solo reads the active save's mode.
  var isCampMode = (ZI.getActiveSlot && ZI.getActiveSlot() || {}).mode === 'camp';
  var _React$useState37 = React.useState(0),
    _React$useState38 = _slicedToArray(_React$useState37, 2),
    travTick = _React$useState38[0],
    setTravTick = _React$useState38[1]; // re-render after a scout, XP or Hide changes stored state
  React.useEffect(function () {
    var t = setInterval(function () {
      return setTravTick(function (x) {
        return x + 1;
      });
    }, 60000);
    return function () {
      return clearInterval(t);
    };
  }, []);
  var _React$useState39 = React.useState({}),
    _React$useState40 = _slicedToArray(_React$useState39, 2),
    hideSeen = _React$useState40[0],
    setHideSeen = _React$useState40[1]; // cell key → last Hide result this session (panel "Threats" line)
  var _React$useState41 = React.useState(false),
    _React$useState42 = _slicedToArray(_React$useState41, 2),
    sheetMode = _React$useState42[0],
    setSheetMode = _React$useState42[1]; // T13: touch opens the zone panel as a bottom sheet
  // TRAV-01a fix 2 (Oct 25): below 760 px the three desktop columns left the map 4 px wide, so no cell could be tapped and the
  // bottom sheet never opened. Solo stacks instead: map first at full width, afflictions and resources below, no side column
  // (the bottom sheet replaces it). Camp Leader keeps its layout. Same 760 px breakpoint as Wandering.
  var _React$useState43 = React.useState(function () {
      return (window.innerWidth || 1024) < 760;
    }),
    _React$useState44 = _slicedToArray(_React$useState43, 2),
    travNarrow = _React$useState44[0],
    setTravNarrow = _React$useState44[1];
  React.useEffect(function () {
    var f = function f() {
      return setTravNarrow((window.innerWidth || 1024) < 760);
    };
    window.addEventListener('resize', f);
    return function () {
      return window.removeEventListener('resize', f);
    };
  }, []);
  var lastPointer = React.useRef('mouse'); // 'mouse' | 'touch' | 'pen' | 'controller'
  var _React$useState45 = React.useState(null),
    _React$useState46 = _slicedToArray(_React$useState45, 2),
    hl = _React$useState46[0],
    setHl = _React$useState46[1]; // controller/keyboard highlight { gx, gy }
  var _React$useState47 = React.useState(null),
    _React$useState48 = _slicedToArray(_React$useState47, 2),
    panelFocus = _React$useState48[0],
    setPanelFocus = _React$useState48[1]; // TRAV-01a fix 1 (PF11): controller focus inside the zone panel, by item id ('__first__' = first enabled)
  var sheetTouchY = React.useRef(null);
  var _React$useState49 = React.useState(function () {
      return ZI.tutDone('zi_trav_tutorial_done') ? -1 : 0;
    }),
    _React$useState50 = _slicedToArray(_React$useState49, 2),
    tutStep = _React$useState50[0],
    setTutStep = _React$useState50[1];
  var shortWait = function shortWait(ms) {
    var total = Math.max(1, Math.ceil(ms / 60000)),
      h = Math.floor(total / 60),
      m = total % 60;
    return h ? "".concat(h, "h ").concat(m, "m") : "".concat(m, "m");
  };
  var hideUses = ZI.getHideUses ? ZI.getHideUses() : {
    left: 2,
    max: 2,
    nextAt: null
  };
  var campCooldown = ZI.getCampCooldown ? ZI.getCampCooldown() : {
    available: true,
    remainingMs: 0
  };
  // Grid helpers take the VIEWED sector's local (r,c) and compare in global coords.
  var gOf = function gOf(r, c) {
    return {
      gx: view.sx * COLS + c,
      gy: view.sy * ROWS + r
    };
  };
  var keyG = function keyG(gx, gy) {
    return gy + '-' + gx;
  }; // sector 0 keys match older saves
  var cellKey = function cellKey(r, c) {
    var g = gOf(r, c);
    return keyG(g.gx, g.gy);
  };
  var isAdjacent = function isAdjacent(r, c) {
    var g = gOf(r, c);
    return Math.max(Math.abs(g.gx - pos.gx), Math.abs(g.gy - pos.gy)) === 1;
  };
  var isHere = function isHere(r, c) {
    var g = gOf(r, c);
    return g.gx === pos.gx && g.gy === pos.gy;
  };
  var isHereCell = function isHereCell(cell) {
    return cell.gx === pos.gx && cell.gy === pos.gy;
  };
  var isAdjCell = function isAdjCell(cell) {
    return Math.max(Math.abs(cell.gx - pos.gx), Math.abs(cell.gy - pos.gy)) === 1;
  };
  var sectorTag = function sectorTag(sx, sy) {
    return ZI.sectorLabel(sx, sy);
  };
  var posLabel = String.fromCharCode(65 + pos.col) + (pos.row + 1) + (pos.sx || pos.sy ? ' · ' + sectorTag(pos.sx, pos.sy) : '');
  var inPlayerSector = view.sx === pos.sx && view.sy === pos.sy;
  // Cardinal sector navigation — a new sector only generates when the survivor stands
  // within 1 cell of it (on that edge of their own sector). Explored sectors reopen freely.
  var DIRS = {
    n: {
      dx: 0,
      dy: -1,
      label: 'North',
      arrow: '▲'
    },
    s: {
      dx: 0,
      dy: 1,
      label: 'South',
      arrow: '▼'
    },
    w: {
      dx: -1,
      dy: 0,
      label: 'West',
      arrow: '◀'
    },
    e: {
      dx: 1,
      dy: 0,
      label: 'East',
      arrow: '▶'
    }
  };
  var canView = function canView(d) {
    var t = {
      sx: view.sx + DIRS[d].dx,
      sy: view.sy + DIRS[d].dy
    };
    if (t.sx === pos.sx && t.sy === pos.sy) return {
      ok: true
    };
    if (explored.includes(t.sx + ',' + t.sy)) return {
      ok: true
    };
    if (!inPlayerSector) return {
      ok: false,
      why: 'Return to your own sector first.'
    };
    var nearEdge = d === 'n' ? pos.row === 0 : d === 's' ? pos.row === ROWS - 1 : d === 'w' ? pos.col === 0 : pos.col === COLS - 1;
    return nearEdge ? {
      ok: true
    } : {
      ok: false,
      why: "Move to the ".concat(DIRS[d].label.toLowerCase(), " edge of this sector to scout beyond it.")
    };
  };
  var goView = function goView(d) {
    var chk = canView(d);
    if (!chk.ok) return;
    var t = {
      sx: view.sx + DIRS[d].dx,
      sy: view.sy + DIRS[d].dy
    };
    ZI.markSectorExplored(t.sx, t.sy);
    setExplored(ZI.getExploredSectors());
    setView(t);
    setSelectedSquare(null);
    setHoveredSquare(null);
  };
  var TUTORIAL = [{
    title: 'Day One of the Outbreak',
    body: 'The grid is the land around you, seen from above. Each cell is a zone: homes, stores, depots. Some are locked until you push further out. The arrows around the map show the next sector over, once you stand on that edge.'
  }, {
    title: 'You are Here',
    body: "Your survivor starts at ".concat(posLabel, ", marked with the pulsing \u25C9 YOU ARE HERE pin. Every outbreak drops you somewhere new. Smoke rises from a palisade nearby: the \uD83C\uDFF0 Fort.")
  }, {
    title: 'Move one zone at a time',
    body: 'The zones touching yours glow with a dashed outline. Click one of them to decide what to do there.'
  }, {
    title: 'Choose how to survive',
    body: 'Travel moves you in. Loot grabs supplies once per zone. Scout reveals the danger first. Make Camp moves you in and sets a safe rest point. Hide shows which threats roam the zone.'
  }];
  var closeTutorial = function closeTutorial() {
    setTutStep(-1);
    setTutPoint(false);
    ZI.setTutDone('zi_trav_tutorial_done');
  };
  // Tutorial beat 2: exploring the action menu progressively darkens the screen,
  // then the spotlight moves up to the Wandering tab in the top bar.
  var _React$useState51 = React.useState([]),
    _React$useState52 = _slicedToArray(_React$useState51, 2),
    tutHover = _React$useState52[0],
    setTutHover = _React$useState52[1];
  var _React$useState53 = React.useState(false),
    _React$useState54 = _slicedToArray(_React$useState53, 2),
    tutPoint = _React$useState54[0],
    setTutPoint = _React$useState54[1];
  var inTutMenu = tutStep === 3 && !!actionCell;
  var noteTutHover = function noteTutHover(id) {
    if (!inTutMenu || tutHover.includes(id)) return;
    var next = [].concat(_toConsumableArray(tutHover), [id]);
    setTutHover(next);
    if (next.length >= 5) setTimeout(function () {
      setActionCell(null);
      setTutPoint(true);
    }, 700);
  };
  var _React$useState55 = React.useState(null),
    _React$useState56 = _slicedToArray(_React$useState55, 2),
    wanderRect = _React$useState56[0],
    setWanderRect = _React$useState56[1];
  var _React$useState57 = React.useState('wandering'),
    _React$useState58 = _slicedToArray(_React$useState57, 2),
    tutTarget = _React$useState58[0],
    setTutTarget = _React$useState58[1]; // which top-bar tab the spotlight points at
  var TUT_TARGETS = {
    wandering: {
      label: 'Wandering',
      screen: 'hack-slash',
      title: 'Now go Wandering',
      body: 'Your survivor patrols the zone you\'re standing in, fighting and looting on their own while you\'re away.'
    },
    routes: {
      label: 'Routes',
      screen: 'solo-main',
      title: 'Loot runs happen on Routes',
      body: 'Pick a route through a biome to scavenge supplies. Longer, riskier routes bring back better loot.'
    }
  };
  var tgt = TUT_TARGETS[tutTarget];
  // Only a real, visible top-bar tab — skip the hidden measuring copies used for overflow.
  var findWanderBtn = function findWanderBtn() {
    return _toConsumableArray(document.querySelectorAll('button')).find(function (b) {
      if ((b.textContent || '').trim().toLowerCase() !== tgt.label.toLowerCase()) return false;
      if (b.closest('[aria-hidden="true"]')) return false;
      var r = b.getBoundingClientRect();
      return r.width > 0 && r.height > 0 && getComputedStyle(b).visibility !== 'hidden';
    });
  };
  React.useEffect(function () {
    if (!tutPoint) return;
    var measure = function measure() {
      var b = findWanderBtn();
      if (b) {
        var r = b.getBoundingClientRect();
        setWanderRect({
          x: r.left,
          y: r.top,
          w: r.width,
          h: r.height
        });
      }
    };
    measure();
    var t = setInterval(measure, 400);
    window.addEventListener('resize', measure);
    return function () {
      clearInterval(t);
      window.removeEventListener('resize', measure);
    };
  }, [tutPoint, tutTarget]);
  var finishTutorialToWander = function finishTutorialToWander() {
    var screenId = tgt.screen;
    closeTutorial();
    // Navigate directly — works even if the tab is tucked inside the "▾ More" dropdown.
    if (setScreen) setScreen(screenId);else {
      var b = findWanderBtn();
      if (b) b.click();
    }
  };
  var MAT_KEYS = ['metal', 'wood', 'cloth', 'electronics', 'fuel', 'medical'];
  var grantRandomMats = function grantRandomMats(tier) {
    var M = window.ZI_MATERIALS || {};
    var got = [];
    var n = 2 + Math.floor(Math.random() * 2);
    for (var i = 0; i < n; i++) {
      var k = MAT_KEYS[Math.floor(Math.random() * MAT_KEYS.length)];
      var amt = 2 + Math.floor(Math.random() * (4 + tier * 2));
      if (M[k]) {
        M[k].current = Math.min(M[k].max, M[k].current + amt);
        got.push("+".concat(amt, " ").concat(M[k].name));
      }
    }
    return got;
  };
  var doAction = function doAction(id, cell) {
    var key = keyG(cell.gx, cell.gy);
    var coord = cell.coord + (cell.sx || cell.sy ? ' · ' + sectorTag(cell.sx, cell.sy) : '');
    var ck = cell.gx + ',' + cell.gy; // TRAV-01a: per-cell daily XP key
    var res;
    if (cell.state === 'locked') {
      setActionResult({
        tone: 'warn',
        text: 'Locked zone.'
      });
      return;
    }
    if (!isHereCell(cell) && !isAdjCell(cell)) {
      setActionResult({
        tone: 'warn',
        text: 'Too far — move next to it.'
      });
      return;
    }
    if (id === 'camp' && !campCooldown.available) {
      setActionResult({
        tone: 'warn',
        text: "Make Camp is ready in ".concat(shortWait(campCooldown.remainingMs), ".")
      });
      return;
    }
    if (id === 'hide' && hideUses.left <= 0) {
      setActionResult({
        tone: 'warn',
        text: "Hide is ready in ".concat(shortWait(Math.max(0, hideUses.nextAt - ZI.clockNow())), ".")
      });
      return;
    }
    if (id.indexOf('infiltrate-') === 0) {
      var result = ZI.resolveInfiltration(cell, id);
      res = {
        tone: result.tone || (result.ok ? 'good' : 'warn'),
        text: result.message
      };
    } else if (id === 'travel') {
      var p = ZI.zoneFromCell(cell);
      setPos(p);
      writeJ('zi_trav_pos', p);
      ZI.clearTravReturn && ZI.clearTravReturn(); // BAL-A D1: the player's own move replaces any saved return
      var xpT = ZI.travEmitOnce('travel', ck, 'move', 2); // TRAV-01a T14: Athletics XP once per cell per real day
      res = {
        tone: 'good',
        text: "You move into ".concat(cell.name, ".").concat(xpT ? ' +Athletics XP.' : '')
      };
    } else if (id === 'loot') {
      if (tutStep >= 0 && tutStep < TUTORIAL.length) setTimeout(function () {
        setActionCell(null);
        setTutTarget('wandering');
        setTutPoint(true);
      }, 1600); // TRAV-01a S6: was 'routes'
      if (looted[key]) {
        res = {
          tone: 'warn',
          text: "".concat(coord, " has already been picked clean.")
        };
      } else {
        var chance = ZI.lootSafeChance(cell);
        var roll = Math.floor(Math.random() * 100) + 1;
        var got = grantRandomMats(cell.rmatTier || 0);
        var foodGot = ZI.PROG && ZI.PROG.LIVE && ZI.PROG.LIVE.rollLocationFood ? ZI.PROG.LIVE.rollLocationFood(cell) : 0; // STAT-02: real food from locations
        if (foodGot) got.push("".concat(foodGot, " Canned Food"));
        var nl = _objectSpread(_objectSpread({}, looted), {}, _defineProperty({}, key, true));
        setLooted(nl);
        writeJ('zi_trav_looted', nl);
        if (roll <= chance) {
          ZI.emitAction && ZI.emitAction('loot', 1 + cell.difficulty * 0.3); // Scavenging XP only on a clean search
          res = {
            tone: 'good',
            text: "Clean search (".concat(chance, "% safe, rolled ").concat(roll, "). You scavenge ").concat(cell.name, ": ").concat(got.join(', '), ". +Scavenging XP.")
          };
        } else {
          var run = ZI.getWanderRun ? ZI.getWanderRun() : {
            hp: 100
          };
          var dmg = ZI.lootFailDamage(cell);
          var hp = Math.max(1, (run.hp == null ? 100 : run.hp) - dmg);
          ZI.syncWanderState && ZI.syncWanderState({
            hp: hp
          });
          ZI.queueWanderLog && ZI.queueWanderLog("\uD83E\uDE78 Hurt while looting ".concat(cell.name, ": \u2212").concat(dmg, " HP (HP ").concat(hp, "/").concat(ZI.maxHp ? ZI.maxHp() : 100, ").")); // BAL-A: current max HP
          ZI.emitAction && ZI.emitAction('endure', dmg / 8);
          res = {
            tone: 'warn',
            text: "Something was waiting (".concat(chance, "% safe, rolled ").concat(roll, "). You took ").concat(dmg, " damage \u2014 HP ").concat(hp, "/").concat(ZI.maxHp ? ZI.maxHp() : 100, " \u2014 but got away with ").concat(got.join(', '), ".").concat(hp <= 25 ? ' You\'re badly hurt: make camp to recover.' : '')
          };
        }
      }
    } else if (id === 'scout') {
      // TRAV-01a T1/T10/S1: a separate Traversal pool (5 per real day); Wandering's scout charges are untouched.
      var sp = ZI.spendTravScout();
      if (!sp.ok) {
        setActionResult({
          tone: 'warn',
          text: sp.reason
        });
        setTravTick(function (t) {
          return t + 1;
        });
        return;
      }
      var ns = _objectSpread(_objectSpread({}, scouted), {}, _defineProperty({}, key, true));
      setScouted(ns);
      writeJ('zi_trav_scouted', ns);
      var xpS = ZI.travEmitOnce('scout', ck, 'scout', 1); // P1: Stealth XP once per cell per real day
      var danger = ZI.THREAT_LABELS[Math.min(5, cell.threatLevel)];
      res = {
        tone: 'info',
        text: "Scouted ".concat(coord, ": threat ").concat(danger, ", ").concat(cell.biome, " terrain, supplies up to RMAT T").concat(cell.rmatTier, ". ").concat(looted[key] ? 'Already looted.' : 'Unlooted.').concat(xpS ? ' +Stealth XP.' : ' No XP: already earned here today.', " Traversal scouts ").concat(sp.left, "/").concat(sp.max, " today.")
      };
    } else if (id === 'camp' && !ZI.canCampAt(cell)) {
      res = {
        tone: 'warn',
        text: "You can't make camp on ".concat(coord, " while Fallow Ground is in progress.")
      };
    } else if (id === 'camp') {
      var used = ZI.spendCampUse();
      if (!used.ok) {
        setActionResult({
          tone: 'warn',
          text: "Make Camp is ready in ".concat(shortWait(used.remainingMs), ".")
        });
        setTravTick(function (t) {
          return t + 1;
        });
        return;
      }
      var _p = ZI.zoneFromCell(cell);
      setPos(_p);
      writeJ('zi_trav_pos', _p);
      setCamp(_p);
      writeJ('zi_trav_camp', _p);
      ZI.clearTravReturn && ZI.clearTravReturn(); // BAL-A D1
      var xpC = ZI.travEmitOnce('camp', 'any', 'camp', 1); // TRAV-01a T15: Command XP once per real day
      var day = ZI.passTimeToNextMorning ? ZI.passTimeToNextMorning(6) : null;
      // TRAV-01a T15: Make camp no longer sets HP to full or resets healsUsed (it was a free, unlimited full heal).
      // BAL-A O5: Make camp no longer treats the injury (only certain items cure it)
      res = {
        tone: 'good',
        text: "You make camp at ".concat(coord, ".").concat(day ? " Day ".concat(day, " begins.") : '', " This is your new safe rest point: a Forced Retreat brings you here.").concat(xpC ? ' +Command XP.' : '')
      };
    } else if (id === 'hide') {
      var _used = ZI.spendHideUse();
      if (!_used.ok) {
        setActionResult({
          tone: 'warn',
          text: "Hide is ready in ".concat(shortWait(Math.max(0, _used.nextAt - ZI.clockNow())), ".")
        });
        setTravTick(function (t) {
          return t + 1;
        });
        return;
      }
      // TRAV-01a T2/S2: Hide reports only what Wandering really uses (threat level and drawable tier range).
      ZI.passTime && ZI.passTime(ZI.TRAVERSAL_TABLE.hideGameHours);
      var th = ZI.hideThreats(cell);
      setHideSeen(function (m) {
        return _objectSpread(_objectSpread({}, m), {}, _defineProperty({}, key, th));
      });
      var xpH = ZI.travEmitOnce('hide', ck, 'sneak', 1); // P3: XP once per cell per real day
      res = {
        tone: 'info',
        text: "You stay hidden in ".concat(coord, " for 12 game hours. Threat level ").concat(th.threatLevel, "/5 (").concat(th.dangerLabel, "). Threats here: tiers ").concat(th.range, ", the range Wandering can meet right now.").concat(xpH ? ' +Stealth XP.' : ' No XP: already earned here today.')
      };
    }
    setActionResult(res);
    setTravTick(function (t) {
      return t + 1;
    });
  };
  var ACTIONS = [{
    id: 'travel',
    icon: '➜',
    label: 'Travel',
    desc: 'Move into this zone.'
  }, {
    id: 'loot',
    icon: '◈',
    label: 'Loot',
    desc: 'Grab supplies once per zone. A failed roll means you get hurt.'
  }, {
    id: 'scout',
    icon: '👁',
    label: 'Scout',
    desc: 'Check the threat and supplies. Uses 1 Traversal scout.'
  }, {
    id: 'camp',
    icon: '⛺',
    label: 'Make Camp',
    desc: 'Move in and set your rest point.'
  }, {
    id: 'hide',
    icon: '◌',
    label: 'Hide',
    desc: 'Stay hidden for 12 game hours. Two uses refill one at a time after 24 real hours.'
  }];

  // ── TRAV-01a Solo layout: afflictions, preview bar, zone details panel (T4, T13, S5) ──
  var FAM_LABEL = {
    unexplored: 'Unexplored',
    explored: 'Explored',
    cleared: 'Cleared'
  };
  var previewLine = function previewLine(c) {
    return "".concat(c.name, " \xB7 ").concat(FAM_LABEL[ZI.cellFamiliarity(c.gx, c.gy)] || '—', " \xB7 Danger ").concat(ZI.THREAT_LABELS[Math.min(5, c.threatLevel || 0)], " (").concat(c.threatLevel || 0, "/5)");
  };
  var hlCell = hl ? ZI.worldCell(hl.gx, hl.gy, 'scavenge') : null;
  var soloPreview = hoveredSquare || hlCell;
  var openSoloPanel = function openSoloPanel(cell, via) {
    var p = via || lastPointer.current;
    setSheetMode(p === 'touch' || p === 'pen' || p !== 'controller' && (window.innerWidth || 1024) < 760);
    setActionCell(cell);
    setActionResult(null);
    setPanelFocus(p === 'controller' ? '__first__' : null);
    if (isAdjCell(cell) && tutStep >= 0 && tutStep <= 2) setTutStep(3);
  };
  var closeSoloPanel = function closeSoloPanel() {
    setActionCell(null);
    setActionResult(null);
    setPanelFocus(null);
  };
  // Controller / keyboard: arrows (or D-pad) move the highlight, Enter/Space (or A) confirms, Escape (or B) closes.
  var ctlRef = React.useRef({});
  ctlRef.current = {
    hl: hl,
    view: view,
    pos: pos,
    actionCell: actionCell,
    fortOpen: fortOpen,
    isCampMode: isCampMode,
    panelFocus: panelFocus,
    panelMove: function panelMove(d) {
      return movePanelFocus(d);
    },
    panelRun: function panelRun(id) {
      return runPanelItem(id);
    },
    focusId: function focusId() {
      return _focusId;
    }
  };
  React.useEffect(function () {
    var move = function move(dx, dy) {
      var c = ctlRef.current;
      if (c.isCampMode || c.fortOpen) return;
      if (c.actionCell && c.panelFocus) {
        if (dy) c.panelMove(dy);
        return;
      } // TRAV-01a fix 1: focus is in the panel; the map highlight stays put
      var base = c.hl || {
        gx: c.pos.gx,
        gy: c.pos.gy
      };
      var minX = c.view.sx * COLS,
        minY = c.view.sy * ROWS;
      var inView = base.gx >= minX && base.gx < minX + COLS && base.gy >= minY && base.gy < minY + ROWS;
      var b = inView ? base : {
        gx: minX,
        gy: minY
      };
      setHl({
        gx: Math.max(minX, Math.min(minX + COLS - 1, b.gx + dx)),
        gy: Math.max(minY, Math.min(minY + ROWS - 1, b.gy + dy))
      });
    };
    var confirm = function confirm() {
      var c = ctlRef.current;
      if (c.isCampMode || c.fortOpen || !c.hl) return;
      lastPointer.current = 'controller';
      openSoloPanel(ZI.worldCell(c.hl.gx, c.hl.gy, 'scavenge'), 'controller');
    };
    var back = function back() {
      var c = ctlRef.current;
      if (c.isCampMode || !c.actionCell) return;
      var had = !!c.panelFocus,
        cell = c.actionCell;
      closeSoloPanel();
      if (had) setHl({
        gx: cell.gx,
        gy: cell.gy
      });
    };
    var act = function act() {
      var c = ctlRef.current;
      if (c.isCampMode || c.fortOpen) return;
      if (c.actionCell && c.panelFocus) {
        c.panelRun(c.focusId());
        return;
      }
      if (c.hl && !c.actionCell) confirm();
    };
    var onKey = function onKey(e) {
      var t = e.target && e.target.tagName;
      if (t === 'INPUT' || t === 'TEXTAREA' || t === 'SELECT') return;
      var k = e.key;
      if (k === 'ArrowUp') move(0, -1);else if (k === 'ArrowDown') move(0, 1);else if (k === 'ArrowLeft') move(-1, 0);else if (k === 'ArrowRight') move(1, 0);else if (k === 'Enter' || k === ' ') {
        var c = ctlRef.current;
        if (!(c.actionCell && c.panelFocus) && !(c.hl && !c.actionCell)) return;
        act();
      } else if (k === 'Escape') back();else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    var prev = {};
    var pad = setInterval(function () {
      var g = navigator.getGamepads ? _toConsumableArray(navigator.getGamepads()).find(Boolean) : null;
      if (!g) return;
      var pressed = function pressed(i) {
          return !!(g.buttons[i] && g.buttons[i].pressed);
        },
        edge = function edge(i) {
          var p = pressed(i),
            was = prev[i];
          prev[i] = p;
          return p && !was;
        };
      if (edge(12)) move(0, -1);
      if (edge(13)) move(0, 1);
      if (edge(14)) move(-1, 0);
      if (edge(15)) move(1, 0);
      if (edge(0)) act();
      if (edge(1)) back();
    }, 120);
    return function () {
      window.removeEventListener('keydown', onKey);
      clearInterval(pad);
    };
  }, []);
  var renderAfflictions = function renderAfflictions() {
    var br = ZI.isBroken && ZI.isBroken(),
      inj = ZI.getInjury && ZI.getInjury(),
      T = ZI.BROKEN_TABLE,
      ts = ZI.getTravScouts();
    var row = {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 8,
      padding: '7px 9px',
      background: 'var(--bg3)',
      border: '1px solid var(--border)'
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "panel",
      "data-trav": "afflictions",
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-title"
    }, "Afflictions"), function () {
      // PF17 (Sam, Oct 27): HP on Traversal, same source as the Wandering bar (persisted run, current max HP). Display only.
      var run = ZI.getWanderRun ? ZI.getWanderRun() : null,
        mx = ZI.maxHp ? ZI.maxHp() : 100;
      var hp = Math.max(0, Math.min(mx, run && run.hp != null ? run.hp : mx)),
        col = hp > 40 ? 'var(--green)' : 'var(--red2)';
      return /*#__PURE__*/React.createElement("div", {
        "data-trav": "hp",
        style: {
          padding: '6px 9px',
          borderBottom: '1px solid var(--border)'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--text2)',
          marginBottom: 3
        }
      }, /*#__PURE__*/React.createElement("span", null, "Health"), /*#__PURE__*/React.createElement("span", {
        style: {
          color: col
        }
      }, "HP ", Math.round(hp), "/", mx)), /*#__PURE__*/React.createElement(ProgressBar, {
        value: hp / mx * 100,
        color: col,
        height: 7
      }));
    }(), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflow: 'auto',
        padding: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }
    }, br && T && /*#__PURE__*/React.createElement("div", {
      "data-affliction": "broken",
      style: row
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16,
        color: 'var(--red2)'
      }
    }, "\uD83D\uDC94"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--red2)'
      }
    }, "Broken"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text2)'
      }
    }, "Max HP \u2212", Math.abs(T.maxHpPct), "%, ", T.attackLossPct, "% of attacks falter, +", T.dmgTakenPct, "% damage taken, ", Math.abs(T.speedPct), "% slower. Recovers through completed rests."))), inj && /*#__PURE__*/React.createElement("div", {
      "data-affliction": "injured",
      style: row
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16,
        color: 'var(--amber)'
      }
    }, "\uD83E\uDE79"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--amber)'
      }
    }, "Injured"), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text2)'
      }
    }, "Combat and athletics \u2212", Math.round(inj.pct * 100), "%. ", /*#__PURE__*/React.createElement("b", {
      "data-injury-time": "1"
    }, "About ", Math.max(1, Math.ceil(inj.remainingMs / 60000)), " min play time left"), " (counts down only while the game is open). A Field Bandage treats it."))), !br && !inj && /*#__PURE__*/React.createElement("div", {
      "data-affliction": "none",
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text3)',
        padding: '6px 4px'
      }
    }, "No afflictions. Injuries and other conditions show here.")), /*#__PURE__*/React.createElement("div", {
      "data-trav": "scouts",
      style: {
        padding: '6px 9px',
        borderTop: '1px solid var(--border)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: ts.left > 0 ? 'var(--text2)' : 'var(--red2)'
      }
    }, "\uD83D\uDC41 Traversal scouts ", ts.left, "/", ts.max, " today"));
  };
  var renderSoloBar = function renderSoloBar() {
    return /*#__PURE__*/React.createElement("div", {
      className: "panel",
      "data-trav": "preview-bar",
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '6px 10px',
        flexShrink: 0,
        flexWrap: 'wrap',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text2)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      "data-trav": "preview",
      style: {
        flex: 1,
        minWidth: 180,
        color: soloPreview ? 'var(--text)' : 'var(--text3)'
      }
    }, soloPreview ? previewLine(soloPreview) : 'Point at a zone for a quick look. Click, tap or confirm to open its details.'), /*#__PURE__*/React.createElement("button", {
      "data-trav": "route-mode",
      className: "btn",
      disabled: true,
      title: "Route builder coming soon",
      style: {
        padding: '3px 10px',
        fontSize: 11,
        opacity: 0.5,
        cursor: 'not-allowed'
      }
    }, "Route mode: off"), /*#__PURE__*/React.createElement("span", {
      "data-trav": "route-mode-reason",
      style: {
        fontSize: 10,
        color: 'var(--text3)'
      }
    }, "Route builder coming soon"));
  };

  // TRAV-01a fix 1: one list of panel actions (order and greyed reasons) shared by the panel and the controller.
  var zoneActs = function zoneActs(c) {
    var key = keyG(c.gx, c.gy),
      ck = c.gx + ',' + c.gy,
      here = isHereCell(c),
      adj = isAdjCell(c),
      locked = c.state === 'locked';
    var chance = ZI.lootSafeChance(c),
      ts = ZI.getTravScouts();
    var far = locked ? 'Locked zone.' : !here && !adj ? 'Too far — move next to it.' : null;
    var xpNote = function xpNote(kind, label) {
      return ZI.travXpAvailable(kind, kind === 'camp' ? 'any' : ck) ? "".concat(label, " XP once per ").concat(kind === 'camp' ? 'day' : 'zone a day') : 'XP already earned today';
    };
    return [{
      id: 'travel',
      icon: '➜',
      label: 'Travel',
      reason: here ? "You're already here." : far,
      cost: "Moves you in \xB7 ".concat(xpNote('travel', 'Athletics'))
    }, {
      id: 'loot',
      icon: '◈',
      label: 'Loot',
      reason: far || (looted[key] ? 'Already looted.' : null),
      cost: "Once per zone \xB7 ".concat(chance, "% safe \xB7 a failed roll hurts")
    }, {
      id: 'scout',
      icon: '👁',
      label: 'Scout',
      reason: far || (ts.left <= 0 ? 'No Traversal scouts left today. Refills at midnight.' : null),
      cost: "1 Traversal scout (".concat(ts.left, "/").concat(ts.max, " today) \xB7 ").concat(xpNote('scout', 'Stealth'))
    }, {
      id: 'hide',
      icon: '◌',
      label: 'Hide',
      reason: far || (hideUses.left <= 0 ? "Ready in ".concat(shortWait(Math.max(0, hideUses.nextAt - ZI.clockNow())), ".") : null),
      cost: "".concat(ZI.TRAVERSAL_TABLE.hideGameHours, " game hours \xB7 ").concat(hideUses.left, "/").concat(hideUses.max, " uses left \xB7 each returns after 24h \xB7 ").concat(xpNote('hide', 'Stealth'))
    }, {
      id: 'camp',
      icon: '⛺',
      label: 'Make Camp',
      reason: far || (!ZI.canCampAt(c) ? "You can't make camp here while Fallow Ground is in progress." : !campCooldown.available ? "Ready in ".concat(shortWait(campCooldown.remainingMs), ".") : null),
      cost: "Until 06:00 next game day \xB7 24h refill after use \xB7 sets your rest point \xB7 ".concat(xpNote('camp', 'Command'))
    }].concat((ZI.infiltrationOptions ? ZI.infiltrationOptions(c) : []).map(function (a) {
      return _objectSpread(_objectSpread({}, a), {}, {
        reason: far || a.reason
      });
    }));
  };
  var panelItems = function panelItems(c) {
    if (!c) return [];
    var here = isHereCell(c),
      adj = isAdjCell(c);
    return [].concat(_toConsumableArray(ZI.isFortCell(c) && (here || adj) ? [{
      id: 'fort',
      enabled: true
    }] : []), _toConsumableArray(zoneActs(c).map(function (a) {
      return {
        id: a.id,
        enabled: !a.reason
      };
    })), _toConsumableArray(here && setScreen ? [{
      id: 'wander',
      enabled: true
    }] : []), [{
      id: 'close',
      enabled: true
    }]);
  };
  var focusOf = function focusOf(c, want) {
    var it = panelItems(c);
    if (!want || !it.length) return null;
    return it.some(function (x) {
      return x.id === want;
    }) ? want : (it.find(function (x) {
      return x.enabled;
    }) || it[it.length - 1]).id;
  };
  var _focusId = actionCell ? focusOf(actionCell, panelFocus) : null;
  var runPanelItem = function runPanelItem(id) {
    var c = actionCell;
    if (!c) return;
    var it = panelItems(c).find(function (x) {
      return x.id === id;
    });
    if (!it || !it.enabled) return; // greyed: nothing
    if (id === 'fort') {
      closeSoloPanel();
      setFortOpen(true);
    } else if (id === 'wander') setScreen('hack-slash');else if (id === 'close') {
      closeSoloPanel();
      setHl({
        gx: c.gx,
        gy: c.gy
      });
    } else {
      noteTutHover(id);
      doAction(id, c);
    }
  };
  var movePanelFocus = function movePanelFocus(d) {
    var it = panelItems(actionCell);
    if (!it.length) return;
    var k = Math.max(0, it.findIndex(function (x) {
      return x.id === _focusId;
    }));
    var next = it[(k + d + it.length) % it.length].id;
    setPanelFocus(next);
    if (next !== 'fort' && next !== 'wander' && next !== 'close') noteTutHover(next);
  };
  React.useEffect(function () {
    if (panelFocus && _focusId && _focusId !== panelFocus) setPanelFocus(_focusId);
  }, [panelFocus, _focusId]); // pin by id
  React.useEffect(function () {
    if (!_focusId) return;
    var el = document.querySelector('[data-panel-focus="1"]');
    if (el && el.scrollIntoView) el.scrollIntoView({
      block: 'nearest'
    });
  }, [_focusId, actionCell, sheetMode, travTick]);
  var renderZonePanel = function renderZonePanel() {
    var c = actionCell;
    if (!c) return /*#__PURE__*/React.createElement("div", {
      "data-trav": "panel-empty",
      style: {
        textAlign: 'center',
        padding: 24
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-title)',
        fontSize: 14,
        color: 'var(--text3)',
        marginBottom: 6
      }
    }, "Select a zone"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text3)'
      }
    }, "Click, tap or confirm a zone to see its details and actions."));
    var key = keyG(c.gx, c.gy),
      ck = c.gx + ',' + c.gy,
      here = isHereCell(c),
      adj = isAdjCell(c),
      locked = c.state === 'locked';
    var coord = c.coord + (c.sx || c.sy ? ' · ' + sectorTag(c.sx, c.sy) : '');
    var toneColor = {
      good: 'var(--green)',
      warn: 'var(--amber)',
      info: '#7fe0ff'
    };
    var fam = ZI.cellFamiliarity(c.gx, c.gy),
      chance = ZI.lootSafeChance(c),
      tier = c.rmatTier || 0,
      ts = ZI.getTravScouts();
    var start = readJ('zi_trav_start', null),
      seen = hideSeen[key];
    var intel = ZI.getInfiltrationIntel && ZI.getInfiltrationIntel();
    var feats = [ZI.isFortCell(c) && '🏰 Fort', ZI.isFallowCell(c) && '🌾 Fallow Ground', camp && camp.gx === c.gx && camp.gy === c.gy && '⛺ Your camp', start && start.gx === c.gx && start.gy === c.gy && '◎ Starting zone'].filter(Boolean);
    var far = locked ? 'Locked zone.' : !here && !adj ? 'Too far — move next to it.' : null;
    var acts = zoneActs(c);
    var line = function line(label, value, color, attr) {
      return /*#__PURE__*/React.createElement("div", {
        "data-line": attr,
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          gap: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          padding: '2px 0'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text3)'
        }
      }, label), /*#__PURE__*/React.createElement("span", {
        style: {
          color: color || 'var(--text)',
          textAlign: 'right'
        }
      }, value));
    };
    return /*#__PURE__*/React.createElement("div", {
      "data-trav": "zone-panel",
      "data-tick": travTick
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text2)',
        letterSpacing: '0.1em'
      }
    }, "ZONE ", coord, " \xB7 ", here ? 'YOU ARE HERE' : adj ? 'NEXT TO YOU' : locked ? 'LOCKED' : 'FAR AWAY'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-title)',
        fontSize: 18,
        color: 'var(--amber)',
        margin: '2px 0 8px'
      }
    }, c.name), inTutMenu && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
        padding: '6px 9px',
        border: '1px solid #ff3b3b',
        background: 'rgba(255,59,59,0.1)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: '#ff3b3b',
        letterSpacing: '0.08em'
      }
    }, "TUTORIAL"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--text)'
      }
    }, "Hover each option to learn it."), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        gap: 3
      }
    }, Array.from({
      length: 5
    }).map(function (_, i) {
      return /*#__PURE__*/React.createElement("span", {
        key: i,
        style: {
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: i < tutHover.length ? '#ff3b3b' : 'var(--bg4)',
          border: '1px solid #ff3b3b'
        }
      });
    }))), line('Familiarity', FAM_LABEL[fam] || '—', fam === 'cleared' ? 'var(--green)' : 'var(--text)', 'familiarity'), line('Loot', looted[key] ? 'Looted' : "".concat(chance, "% safe \xB7 2\u20133 supplies, 2\u2013").concat(5 + 2 * tier, " each"), looted[key] ? 'var(--text3)' : 'var(--text)', 'loot'), line('Danger', "".concat(ZI.THREAT_LABELS[Math.min(5, c.threatLevel || 0)], " (").concat(c.threatLevel || 0, "/5)"), (c.threatLevel || 0) > 3 ? 'var(--red2)' : 'var(--amber)', 'danger'), line('Threats', seen ? "Tiers ".concat(seen.range, " (from your last Hide)") : 'Unknown — Hide here to learn', seen ? 'var(--text)' : 'var(--text3)', 'threats'), intel && intel.gx === c.gx && intel.gy === c.gy && line('Intel', "Survey team reported near ".concat(intel.coord), '#7fe0ff', 'faction-intel'), line('Features', feats.length ? feats.join(' · ') : 'None', 'var(--text)', 'features'), /*#__PURE__*/React.createElement("div", {
      className: "divider"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }
    }, ZI.isFortCell(c) && (here || adj) && /*#__PURE__*/React.createElement("button", {
      "data-action": "fort",
      "data-panel-focus": _focusId === 'fort' ? '1' : undefined,
      onClick: function onClick() {
        closeSoloPanel();
        setFortOpen(true);
      },
      style: {
        boxShadow: _focusId === 'fort' ? '0 0 0 2px #7fe0ff inset, 0 0 10px rgba(127,224,255,0.5)' : undefined,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        textAlign: 'left',
        padding: '7px 10px',
        cursor: 'pointer',
        background: 'rgba(240,208,96,0.1)',
        border: '1px solid #f0d060',
        color: 'var(--text)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 24,
        fontSize: 18,
        textAlign: 'center'
      }
    }, "\uD83C\uDFF0"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: 'var(--font-body)',
        fontSize: 14
      }
    }, fallowQ.state === 'ready' ? 'Return to the Fort — turn in Fallow Ground' : 'Approach the palisade')), acts.map(function (a) {
      return /*#__PURE__*/React.createElement("button", {
        key: a.id,
        "data-action": a.id,
        "data-panel-focus": _focusId === a.id ? '1' : undefined,
        disabled: !!a.reason,
        onMouseEnter: function onMouseEnter() {
          return noteTutHover(a.id);
        },
        onFocus: function onFocus() {
          return noteTutHover(a.id);
        },
        onClick: function onClick() {
          noteTutHover(a.id);
          if (!a.reason) doAction(a.id, c);
        },
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textAlign: 'left',
          padding: '6px 10px',
          cursor: a.reason ? 'not-allowed' : 'pointer',
          opacity: a.reason ? 0.55 : 1,
          background: 'var(--bg3)',
          border: "1px solid ".concat(inTutMenu && tutHover.includes(a.id) ? '#ff3b3b' : 'var(--border)'),
          color: 'var(--text)',
          boxShadow: _focusId === a.id ? '0 0 0 2px #7fe0ff inset, 0 0 10px rgba(127,224,255,0.5)' : undefined
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 24,
          fontSize: 16,
          textAlign: 'center',
          color: '#f0d060'
        }
      }, a.icon), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          fontFamily: 'var(--font-body)',
          fontSize: 14
        }
      }, a.label), /*#__PURE__*/React.createElement("span", {
        "data-action-note": a.reason ? 'reason' : 'cost',
        style: {
          display: 'block',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: a.reason ? 'var(--red2)' : 'var(--text2)'
        }
      }, a.reason || a.cost)));
    })), actionResult && /*#__PURE__*/React.createElement("div", {
      "data-trav": "result",
      style: {
        marginTop: 8,
        padding: '8px 10px',
        background: 'var(--bg4)',
        borderLeft: "3px solid ".concat(toneColor[actionResult.tone]),
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--text)',
        lineHeight: 1.45
      }
    }, actionResult.text), here && setScreen && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-amber",
      "data-trav": "wander",
      "data-panel-focus": _focusId === 'wander' ? '1' : undefined,
      style: {
        width: '100%',
        marginTop: 8,
        boxShadow: _focusId === 'wander' ? '0 0 0 2px #7fe0ff inset, 0 0 10px rgba(127,224,255,0.5)' : undefined
      },
      onClick: function onClick() {
        return setScreen('hack-slash');
      }
    }, "\u25B6 Start wandering around this ", c.name.replace(/ [A-H]\d+$/, '')), /*#__PURE__*/React.createElement("button", {
      className: "btn",
      "data-trav": "close",
      "data-panel-focus": _focusId === 'close' ? '1' : undefined,
      style: {
        width: '100%',
        marginTop: 8,
        boxShadow: _focusId === 'close' ? '0 0 0 2px #7fe0ff inset, 0 0 10px rgba(127,224,255,0.5)' : undefined
      },
      onClick: closeSoloPanel
    }, "Close"));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "screen-enter",
    "data-trav-layout": !isCampMode && travNarrow ? 'stacked' : 'columns',
    style: {
      display: 'flex',
      flexDirection: !isCampMode && travNarrow ? 'column' : 'row',
      gap: 8,
      padding: 8,
      height: '100%',
      overflowX: 'hidden',
      overflowY: !isCampMode && travNarrow ? 'auto' : 'hidden',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: !isCampMode && travNarrow ? '100%' : 240,
      order: !isCampMode && travNarrow ? 2 : undefined,
      minHeight: !isCampMode && travNarrow ? 260 : undefined,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flexShrink: 0
    }
  }, isCampMode ? /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Available Survivors"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 6,
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, survivors.map(function (s) {
    var classObj = ZI.CLASSES.find(function (c) {
      return c.id === s["class"];
    });
    var isSelected = selectedSurvivors.includes(s.id);
    var isBusy = s.status === 'busy';
    return /*#__PURE__*/React.createElement("div", {
      key: s.id,
      onClick: function onClick() {
        return !isBusy && setSelectedSurvivors(function (prev) {
          return prev.includes(s.id) ? prev.filter(function (id) {
            return id !== s.id;
          }) : [].concat(_toConsumableArray(prev), [s.id]);
        });
      },
      style: {
        padding: '7px 9px',
        cursor: isBusy ? 'not-allowed' : 'pointer',
        background: isSelected ? 'var(--bg4)' : 'var(--bg3)',
        border: "1px solid ".concat(isSelected ? classObj === null || classObj === void 0 ? void 0 : classObj.color : 'var(--border)'),
        opacity: isBusy ? 0.75 : 1,
        transition: 'all 0.15s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: '50%',
        border: "2px solid ".concat((classObj === null || classObj === void 0 ? void 0 : classObj.color) || 'var(--border2)'),
        background: 'var(--bg4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: (classObj === null || classObj === void 0 ? void 0 : classObj.color) || 'var(--text2)',
        flexShrink: 0
      }
    }, s.name[0]), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: 'var(--text)'
      }
    }, s.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)'
      }
    }, "Lv", s.level, " ", classObj === null || classObj === void 0 ? void 0 : classObj.name, " \xB7 ", isBusy ? 'On Mission' : 'Idle')), isSelected && /*#__PURE__*/React.createElement("div", {
      style: {
        color: classObj === null || classObj === void 0 ? void 0 : classObj.color,
        fontSize: 10
      }
    }, "\u2713")));
  }))) : renderAfflictions(), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      marginBottom: 5,
      letterSpacing: '0.1em'
    }
  }, "RESOURCES"), Object.entries(window.ZI_MATERIALS).slice(0, 6).map(function (_ref23) {
    var _ref24 = _slicedToArray(_ref23, 2),
      key = _ref24[0],
      m = _ref24[1];
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11
      }
    }, m.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text2)',
        width: 60,
        flexShrink: 0
      }
    }, m.name), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(ProgressBar, {
      value: m.current / m.max * 100,
      color: m.color,
      height: 3
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: m.color,
        width: 32,
        textAlign: 'right'
      }
    }, m.current));
  }))), /*#__PURE__*/React.createElement("div", {
    "data-trav": "map-column",
    style: {
      flex: !isCampMode && travNarrow ? '0 0 auto' : 1,
      order: !isCampMode && travNarrow ? 1 : undefined,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minWidth: 0,
      overflow: 'hidden'
    }
  }, isCampMode ? /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      display: 'flex',
      alignItems: 'center',
      flexShrink: 0
    }
  }, mapTypes.map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t.id,
      onClick: function onClick() {
        setActiveType(t.id);
        setSelectedSquare(null);
      },
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '8px 14px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: activeType === t.id ? t.color : 'var(--text3)',
        borderBottom: activeType === t.id ? "2px solid ".concat(t.color) : '2px solid transparent',
        borderRight: '1px solid var(--border)',
        transition: 'all 0.15s',
        display: 'flex',
        alignItems: 'center',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement("span", null, t.icon), /*#__PURE__*/React.createElement("span", null, t.label));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 12px',
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "Threat Level ", (hoveredSquare === null || hoveredSquare === void 0 ? void 0 : hoveredSquare.threatLevel) || (sq === null || sq === void 0 ? void 0 : sq.threatLevel) || 0, "/5 \xB7 ", squares.filter(function (s) {
    return s.state === 'available';
  }).length, " available zones")) : renderSoloBar(), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      padding: '12px 34px 30px',
      position: 'relative',
      overflow: 'auto',
      background: "\n            radial-gradient(ellipse at 30% 20%, rgba(200,169,110,0.04), transparent),\n            radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.04), transparent),\n            #0a0908\n          "
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text2)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#ff3b3b',
      fontWeight: 'bold'
    }
  }, "\u25C9 YOU ARE HERE \xB7 ", posLabel, pos.name ? " \xB7 ".concat(pos.name.replace(/ [A-H]\d+$/, '')) : ''), setScreen && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    style: {
      padding: '3px 10px',
      fontSize: 11
    },
    onClick: function onClick() {
      return setScreen('hack-slash');
    }
  }, "\u25B6 Wander here"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#f0d060'
    }
  }, "\u2505 adjacent zones: click to act"), fortPos && fallowQ.state === 'none' && !ZI.factionsUnlocked() && /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#f0d060'
    }
  }, "\uD83C\uDFF0 Fort at ", fortPos.coord, ": smoke behind a palisade"), fallowQ.state === 'active' && /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#a2dca2'
    }
  }, "\uD83C\uDF3E Fallow Ground: ", ZI.fallowProgress(), "/", ZI.fallowGoal(), " kills at ", fallowQ.cell.coord, " (wander there)"), fallowQ.state === 'ready' && /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#7fd88f',
      fontWeight: 'bold'
    }
  }, "\uD83C\uDF3E Field cleared: travel into the Fort at ", fortPos && fortPos.coord, " to turn in"), fallowQ.state === 'done' && ZI.getSurveyPoint() && /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#7fe0ff'
    }
  }, "\uD83D\uDCE1 Survey Point at ", ZI.getSurveyPoint().coord, ": who made the crate?"), camp && /*#__PURE__*/React.createElement("span", null, "\u26FA Camp ", String.fromCharCode(65 + camp.col) + (camp.row + 1), camp.sx || camp.sy ? ' · ' + sectorTag(camp.sx, camp.sy) : ''), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      color: 'var(--text2)'
    }
  }, "Sector ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--amber)'
    }
  }, sectorTag(view.sx, view.sy)), " ", ZI.isDevView() && /*#__PURE__*/React.createElement(React.Fragment, null, " \xB7 Seed #", worldSeed, " / ", ZI.MAX_SEED.toLocaleString())), !inPlayerSector && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      padding: '3px 10px',
      fontSize: 11
    },
    onClick: function onClick() {
      return setView({
        sx: pos.sx,
        sy: pos.sy
      });
    }
  }, "\u25C9 Back to my sector")), Object.entries(DIRS).map(function (_ref25) {
    var _ref26 = _slicedToArray(_ref25, 2),
      d = _ref26[0],
      D = _ref26[1];
    var chk = canView(d);
    var t = {
      sx: view.sx + D.dx,
      sy: view.sy + D.dy
    };
    var known = explored.includes(t.sx + ',' + t.sy);
    var place = d === 'n' ? {
      top: 40,
      left: '50%',
      transform: 'translateX(-50%)'
    } : d === 's' ? {
      bottom: 4,
      left: '50%',
      transform: 'translateX(-50%)'
    } : d === 'w' ? {
      left: 4,
      top: '50%',
      transform: 'translateY(-50%)'
    } : {
      right: 4,
      top: '50%',
      transform: 'translateY(-50%)'
    };
    return /*#__PURE__*/React.createElement("button", {
      key: d,
      onClick: function onClick() {
        return goView(d);
      },
      disabled: !chk.ok,
      title: chk.ok ? "View ".concat(D.label, ": sector ").concat(sectorTag(t.sx, t.sy)).concat(known ? '' : ' (unexplored)') : chk.why,
      style: _objectSpread(_objectSpread({
        position: 'absolute',
        zIndex: 5
      }, place), {}, {
        width: d === 'n' || d === 's' ? 64 : 24,
        height: d === 'n' || d === 's' ? 22 : 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        cursor: chk.ok ? 'pointer' : 'not-allowed',
        background: chk.ok ? 'rgba(240,208,96,0.14)' : 'var(--bg3)',
        border: "1px solid ".concat(chk.ok ? '#f0d060' : 'var(--border)'),
        color: chk.ok ? '#f0d060' : 'var(--text3)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        opacity: chk.ok ? 1 : 0.6
      })
    }, D.arrow, (d === 'n' || d === 's') && /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9
      }
    }, D.label.slice(0, 1), known || !chk.ok ? '' : '·new'));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: "32px repeat(".concat(COLS, ", 1fr)"),
      gap: 2,
      marginBottom: 2
    }
  }, /*#__PURE__*/React.createElement("div", null), Array.from({
    length: COLS
  }).map(function (_, c) {
    return /*#__PURE__*/React.createElement("div", {
      key: c,
      style: {
        textAlign: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)'
      }
    }, String.fromCharCode(65 + c));
  })), Array.from({
    length: ROWS
  }).map(function (_, r) {
    return /*#__PURE__*/React.createElement("div", {
      key: r,
      style: {
        display: 'grid',
        gridTemplateColumns: "32px repeat(".concat(COLS, ", 1fr)"),
        gap: 2,
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)'
      }
    }, r + 1), Array.from({
      length: COLS
    }).map(function (_, c) {
      var square = squares.find(function (s) {
        return s.row === r && s.col === c;
      });
      if (!square) return /*#__PURE__*/React.createElement("div", {
        key: c
      });
      var bc = biomeColors[square.biome];
      var sColor = stateColors[square.state];
      var isHovered = (hoveredSquare === null || hoveredSquare === void 0 ? void 0 : hoveredSquare.id) === square.id;
      var isSelected = (selectedSquare === null || selectedSquare === void 0 ? void 0 : selectedSquare.id) === square.id;
      var isLocked = square.state === 'locked';
      var cleared = square.state === 'cleared';
      return /*#__PURE__*/React.createElement("div", {
        key: c,
        "data-cell": square.gx + ',' + square.gy,
        onPointerDown: function onPointerDown(e) {
          lastPointer.current = e.pointerType || 'mouse';
          setPanelFocus(null);
        },
        onMouseEnter: function onMouseEnter() {
          return setHoveredSquare(square);
        },
        onMouseLeave: function onMouseLeave() {
          return setHoveredSquare(null);
        },
        onClick: function onClick() {
          if (!isCampMode) {
            openSoloPanel(square);
            return;
          } // TRAV-01a T13: select, don't hover (every platform)
          if (isLocked) return;
          if (isHere(r, c) && ZI.isFortCell(gOf(r, c))) {
            setFortOpen(true);
            return;
          } // inside the Fort's cell
          if (isHere(r, c)) {
            setActionCell(square);
            setActionResult(null);
            return;
          } // your own zone: Loot / Scout / Make Camp / Hide
          if (isAdjacent(r, c)) {
            setActionCell(square);
            setActionResult(null);
            if (tutStep >= 0 && tutStep <= 2) setTutStep(3);
            return;
          }
          setSelectedSquare(isSelected ? null : square);
        },
        style: {
          aspectRatio: '1',
          position: 'relative',
          background: bc.fill,
          border: isHere(r, c) ? '2px solid #ff3b3b' : isAdjacent(r, c) && !isLocked ? '2px dashed #f0d060' : "2px solid ".concat(isSelected ? '#f0d060' : isHovered ? '#e6c47e' : 'rgba(0,0,0,0.55)'),
          cursor: isLocked ? 'not-allowed' : 'pointer',
          transition: 'all 0.15s',
          overflow: 'hidden',
          opacity: isLocked ? 0.7 : cleared ? 0.8 : 1,
          boxShadow: hl && hl.gx === square.gx && hl.gy === square.gy ? '0 0 0 2px #7fe0ff inset, 0 0 10px rgba(127,224,255,0.5)' : isSelected ? '0 0 12px rgba(240,208,96,0.4)' : isHovered ? '0 0 6px rgba(200,169,110,0.3)' : 'none'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          inset: 0,
          backgroundImage: "url(\"".concat(window.ZI_SAT ? window.ZI_SAT.tileUri(square.biome, square.tileSeed) : '', "\")"),
          backgroundSize: 'cover',
          imageRendering: 'pixelated',
          filter: isHovered || isSelected ? 'saturate(1.15) brightness(1.1)' : 'saturate(0.9)'
        }
      }), function () {
        var rd = square.roads,
          segs = [];
        var end = {
          n: [50, 0],
          s: [50, 100],
          w: [0, 50],
          e: [100, 50]
        };
        Object.entries(rd).forEach(function (_ref27) {
          var _ref28 = _slicedToArray(_ref27, 2),
            d = _ref28[0],
            kind = _ref28[1];
          if (kind) segs.push({
            d: d,
            kind: kind,
            p: end[d]
          });
        });
        if (!segs.length) return null;
        return /*#__PURE__*/React.createElement("svg", {
          viewBox: "0 0 100 100",
          preserveAspectRatio: "none",
          style: {
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: isLocked ? 0.35 : 0.95
          }
        }, segs.map(function (g) {
          return /*#__PURE__*/React.createElement("line", {
            key: g.d + 'b',
            x1: "50",
            y1: "50",
            x2: g.p[0],
            y2: g.p[1],
            stroke: "#1b1a18",
            strokeWidth: g.kind === 'artery' ? 22 : 13,
            strokeLinecap: "square"
          });
        }), segs.map(function (g) {
          return /*#__PURE__*/React.createElement("line", {
            key: g.d + 'a',
            x1: "50",
            y1: "50",
            x2: g.p[0],
            y2: g.p[1],
            stroke: "#3a3833",
            strokeWidth: g.kind === 'artery' ? 17 : 9,
            strokeLinecap: "square"
          });
        }), segs.filter(function (g) {
          return g.kind === 'artery';
        }).map(function (g) {
          return /*#__PURE__*/React.createElement("line", {
            key: g.d + 'l',
            x1: "50",
            y1: "50",
            x2: g.p[0],
            y2: g.p[1],
            stroke: "#d9c26a",
            strokeWidth: "1.6",
            strokeDasharray: "6 6"
          });
        }), /*#__PURE__*/React.createElement("rect", {
          x: 50 - (segs.some(function (g) {
            return g.kind === 'artery';
          }) ? 8.5 : 4.5),
          y: 50 - (segs.some(function (g) {
            return g.kind === 'artery';
          }) ? 8.5 : 4.5),
          width: segs.some(function (g) {
            return g.kind === 'artery';
          }) ? 17 : 9,
          height: segs.some(function (g) {
            return g.kind === 'artery';
          }) ? 17 : 9,
          fill: "#3a3833"
        }));
      }(), /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0px, rgba(0,0,0,0.12) 1px, transparent 1px, transparent 3px)'
        }
      }), isLocked && /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          inset: 0,
          background: 'rgba(8,7,6,0.72)',
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 7px)'
        }
      }), cleared && /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          inset: 0,
          background: 'rgba(98,214,154,0.12)'
        }
      }), square.state === 'contested' && /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          inset: 0,
          background: 'rgba(240,90,60,0.14)',
          boxShadow: 'inset 0 0 10px rgba(240,90,60,0.45)'
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          top: 0,
          right: 0,
          width: 0,
          height: 0,
          borderLeft: '10px solid transparent',
          borderTop: "10px solid ".concat(sColor)
        }
      }), /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          top: 3,
          left: 3,
          display: 'flex',
          gap: 1
        }
      }, Array.from({
        length: square.difficulty
      }).map(function (_, i) {
        return /*#__PURE__*/React.createElement("div", {
          key: i,
          style: {
            width: 3,
            height: 3,
            background: '#f0d060',
            boxShadow: '0 0 2px rgba(240,208,96,0.6)'
          }
        });
      })), function () {
        var gg = gOf(r, c);
        var cellG = {
          gx: gg.gx,
          gy: gg.gy
        };
        if (ZI.isFortCell(cellG)) return /*#__PURE__*/React.createElement("div", {
          title: "The Hearthguard's Fort \u2014 a palisade of wooden pikes",
          style: {
            position: 'absolute',
            top: 2,
            right: 2,
            zIndex: 4,
            fontSize: 18,
            lineHeight: 1,
            filter: 'drop-shadow(0 0 3px #000)',
            pointerEvents: 'none'
          }
        }, "\uD83C\uDFF0");
        if (ZI.isSurveyCell(cellG)) return /*#__PURE__*/React.createElement("div", {
          title: "Survey Point \u2014 a survey team was seen here",
          style: {
            position: 'absolute',
            top: 2,
            right: 2,
            zIndex: 4,
            fontSize: 16,
            lineHeight: 1,
            filter: 'drop-shadow(0 0 3px #000)',
            pointerEvents: 'none'
          }
        }, "\uD83D\uDCE1");
        if (ZI.isFallowCell(cellG) && fallowQ.state !== 'none' && fallowQ.state !== 'done') return /*#__PURE__*/React.createElement("div", {
          title: "Fallow Ground \u2014 clear this field for the Hearthguard",
          style: {
            position: 'absolute',
            top: 2,
            right: 2,
            zIndex: 4,
            fontSize: 16,
            lineHeight: 1,
            filter: 'drop-shadow(0 0 3px #000)',
            pointerEvents: 'none'
          }
        }, "\uD83C\uDF3E");
        return null;
      }(), isHere(r, c) && /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,59,59,0.18)',
          boxShadow: 'inset 0 0 0 2px #ff3b3b',
          pointerEvents: 'none'
        }
      }, /*#__PURE__*/React.createElement("div", {
        className: "trav-here-pin",
        style: {
          fontSize: 24,
          color: '#ff3b3b',
          textShadow: '0 0 8px #ff3b3b, 0 1px 2px #000',
          lineHeight: 1
        }
      }, "\u25C9"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          fontWeight: 'bold',
          color: '#fff',
          background: '#ff3b3b',
          padding: '1px 4px',
          marginTop: 2,
          whiteSpace: 'nowrap',
          maxWidth: '100%',
          letterSpacing: '0.05em'
        }
      }, "HERE")), camp && camp.gx === square.gx && camp.gy === square.gy && !isHere(r, c) && /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          top: 2,
          right: 12,
          zIndex: 2,
          fontSize: 11
        },
        title: "Your camp"
      }, "\u26FA"), looted[cellKey(r, c)] && /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          top: 12,
          left: 3,
          zIndex: 2,
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          color: '#e6c47e',
          textShadow: '0 1px 2px #000'
        },
        title: "Looted"
      }, "\u2713"), isLocked ? /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 16,
          color: 'var(--text2)',
          textShadow: '0 1px 3px #000'
        }
      }, "\uD83D\uDD12") : /*#__PURE__*/React.createElement("div", {
        style: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '1px 2px',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--text)',
          lineHeight: 1.2,
          textAlign: 'center',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
          textOverflow: 'ellipsis',
          background: 'linear-gradient(0deg, rgba(0,0,0,0.75), rgba(0,0,0,0))',
          textShadow: '0 1px 2px #000'
        }
      }, square.name.split(' ').slice(-1)[0]));
    }));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      display: 'flex',
      gap: 14,
      padding: '6px 8px',
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "LEGEND:"), Object.entries(stateColors).map(function (_ref29) {
    var _ref30 = _slicedToArray(_ref29, 2),
      k = _ref30[0],
      c = _ref30[1];
    return /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 8,
        height: 8,
        background: c
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text2)',
        textTransform: 'capitalize'
      }
    }, k));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 1
    }
  }, Array.from({
    length: 5
  }).map(function (_, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        width: 4,
        height: 4,
        background: '#f0d060'
      }
    });
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text2)'
    }
  }, "= 5 Stars (max difficulty)")))), isCampMode ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: 280,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Zone Details"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 10
    }
  }, sq ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 16,
      color: 'var(--amber)',
      marginBottom: 4
    }
  }, sq.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text2)',
      marginBottom: 10
    }
  }, (_ZI$BIOMES$find = ZI.BIOMES.find(function (b) {
    return b.id === sq.biome;
  })) === null || _ZI$BIOMES$find === void 0 ? void 0 : _ZI$BIOMES$find.name, " \xB7 ", activeType.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      marginBottom: 10
    }
  }, Array.from({
    length: 5
  }).map(function (_, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        width: 14,
        height: 14,
        background: i < sq.difficulty ? '#f0d060' : 'var(--bg4)',
        border: '1px solid var(--border)',
        clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)'
      }
    });
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text2)',
      marginLeft: 6
    }
  }, "Difficulty ", sq.difficulty, "/5")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(InfoRow, {
    label: "State",
    value: sq.state,
    color: stateColors[sq.state]
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Threat",
    value: "".concat(sq.threatLevel, "/5"),
    color: sq.threatLevel > 3 ? 'var(--red2)' : 'var(--amber)'
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Duration",
    value: fmtTime(sq.duration * 60),
    color: "var(--text)"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "RMAT Tier",
    value: ((_ZI$RMAT_TIERS$sq$rma = ZI.RMAT_TIERS[sq.rmatTier]) === null || _ZI$RMAT_TIERS$sq$rma === void 0 ? void 0 : _ZI$RMAT_TIERS$sq$rma.name) || '—',
    color: ((_ZI$RMAT_TIERS$sq$rma2 = ZI.RMAT_TIERS[sq.rmatTier]) === null || _ZI$RMAT_TIERS$sq$rma2 === void 0 ? void 0 : _ZI$RMAT_TIERS$sq$rma2.color) || 'var(--text3)'
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Assigned",
    value: "".concat(selectedSurvivors.length, " survivor").concat(selectedSurvivors.length !== 1 ? 's' : ''),
    color: "var(--amber)"
  })), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 4
    }
  }, "EXPECTED YIELD"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--text2)',
      lineHeight: 1.5,
      marginBottom: 10
    }
  }, activeType === 'scavenge' && '8–12 mixed materials · 1–2 weapons · Scrap & cloth bonus', activeType === 'contract' && 'Faction rep · Bonus credits · Unique blueprints possible', activeType === 'training' && 'SURVIVAL XP · Profession XP · Class fragment', activeType === 'patrol' && 'Threat clock reset · Survivor combat XP · Hostile cleanup', activeType === 'raid' && 'High-tier gear · Bulk materials · Risk of casualties')) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 14,
      color: 'var(--text3)',
      marginBottom: 6
    }
  }, "Hover a Zone"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)'
    }
  }, "Click any unlocked square to dispatch survivors."))), selectedSquare && selectedSquare.state !== 'locked' && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      borderTop: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    style: {
      width: '100%',
      marginBottom: 6
    },
    onClick: function onClick() {
      window.ZI.emitAction && window.ZI.emitAction('build', 1 + (selectedSquare.threatLevel || 1) * 0.3);
      setActiveRoute && setActiveRoute({
        id: selectedSquare.id,
        name: selectedSquare.name,
        biome: selectedSquare.biome,
        duration: selectedSquare.duration,
        risk: selectedSquare.threatLevel,
        rmatTier: selectedSquare.rmatTier,
        nodes: ['Departure', 'Travel', 'Zone', 'Loot', 'Extraction'],
        reward: '8–12 materials · faction rep'
      });
      setScreen && setScreen('solo-loading');
    },
    disabled: selectedSurvivors.length === 0
  }, "Dispatch (", selectedSurvivors.length, ") \u2192"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      textAlign: 'center'
    }
  }, "Survivors return in ", fmtTime(selectedSquare.duration * 60), " with results.")))) : /*#__PURE__*/React.createElement("div", {
    "data-trav": "side-panel",
    style: {
      width: 300,
      display: travNarrow ? 'none' : 'flex',
      flexDirection: 'column',
      gap: 8,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Zone Details"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 10
    }
  }, sheetMode ? null : renderZonePanel(), sheetMode && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)',
      textAlign: 'center',
      padding: 20
    }
  }, "Zone details open as a sheet at the bottom of the screen.")))), !isCampMode && sheetMode && actionCell && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    "data-trav": "sheet-backdrop",
    onClick: closeSoloPanel,
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 9000,
      background: 'rgba(0,0,0,0.5)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    "data-trav": "sheet",
    onClick: function onClick(e) {
      return e.stopPropagation();
    },
    onTouchStart: function onTouchStart(e) {
      sheetTouchY.current = e.touches[0].clientY;
    },
    onTouchEnd: function onTouchEnd(e) {
      var y0 = sheetTouchY.current;
      sheetTouchY.current = null;
      if (y0 != null && e.changedTouches[0].clientY - y0 > 60) closeSoloPanel();
    },
    style: {
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      maxHeight: '75vh',
      overflowY: 'auto',
      background: 'var(--bg2)',
      borderTop: '2px solid #f0d060',
      borderRadius: '12px 12px 0 0',
      padding: '8px 14px 16px',
      boxShadow: '0 -8px 28px rgba(0,0,0,0.7)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    "data-trav": "sheet-handle",
    style: {
      width: 44,
      height: 5,
      borderRadius: 3,
      background: 'var(--border2)',
      margin: '0 auto 8px'
    }
  }), renderZonePanel())), document.body), isCampMode && actionCell && function () {
    var coord = actionCell.coord + (actionCell.sx || actionCell.sy ? ' · ' + sectorTag(actionCell.sx, actionCell.sy) : '');
    var key = keyG(actionCell.gx, actionCell.gy);
    var toneColor = {
      good: 'var(--green)',
      warn: 'var(--amber)',
      info: '#7fe0ff'
    };
    return /*#__PURE__*/React.createElement("div", {
      onClick: function onClick() {
        return setActionCell(null);
      },
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        background: "rgba(0,0,0,".concat(inTutMenu ? (0.55 + 0.37 * tutHover.length / 5).toFixed(2) : 0.6, ")"),
        transition: 'background 0.5s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: function onClick(e) {
        return e.stopPropagation();
      },
      className: "panel",
      style: {
        width: '100%',
        maxWidth: 380,
        maxHeight: 'calc(100% - 32px)',
        overflowY: 'auto',
        padding: 14,
        borderColor: '#f0d060',
        background: 'var(--bg2)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text2)',
        letterSpacing: '0.1em'
      }
    }, "ZONE ", coord, " \xB7 ", isHereCell(actionCell) ? 'YOU ARE HERE' : 'NEXT TO YOU'), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-title)',
        fontSize: 20,
        color: 'var(--text)',
        margin: '2px 0 10px'
      }
    }, actionCell.name), inTutMenu && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
        padding: '6px 9px',
        border: '1px solid #ff3b3b',
        background: 'rgba(255,59,59,0.1)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: '#ff3b3b',
        letterSpacing: '0.08em'
      }
    }, "TUTORIAL"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--text)'
      }
    }, "Hover each option to learn it."), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        gap: 3
      }
    }, Array.from({
      length: 5
    }).map(function (_, i) {
      return /*#__PURE__*/React.createElement("span", {
        key: i,
        style: {
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: i < tutHover.length ? '#ff3b3b' : 'var(--bg4)',
          border: '1px solid #ff3b3b'
        }
      });
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, ZI.isFortCell(actionCell) && /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setActionCell(null);
        setFortOpen(true);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        textAlign: 'left',
        padding: '8px 10px',
        cursor: 'pointer',
        background: 'rgba(240,208,96,0.1)',
        border: '1px solid #f0d060',
        color: 'var(--text)'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 24,
        fontSize: 18,
        textAlign: 'center'
      }
    }, "\uD83C\uDFF0"), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-body)',
        fontSize: 14
      }
    }, fallowQ.state === 'ready' ? 'Return to the Fort — turn in Fallow Ground' : 'Approach the palisade'), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text2)'
      }
    }, "A ring of sharpened wooden pikes. One gate, one guard."))), ACTIONS.filter(function (a) {
      return !(a.id === 'travel' && isHereCell(actionCell));
    }).map(function (a) {
      var done = a.id === 'loot' && looted[key];
      return /*#__PURE__*/React.createElement("button", {
        key: a.id,
        disabled: done,
        onMouseEnter: function onMouseEnter() {
          return noteTutHover(a.id);
        },
        onFocus: function onFocus() {
          return noteTutHover(a.id);
        },
        onClick: function onClick() {
          noteTutHover(a.id);
          doAction(a.id, actionCell);
        },
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          textAlign: 'left',
          padding: '6px 10px',
          cursor: done ? 'not-allowed' : 'pointer',
          opacity: done ? 0.55 : 1,
          background: 'var(--bg3)',
          border: "1px solid ".concat(inTutMenu && tutHover.includes(a.id) ? '#ff3b3b' : 'var(--border)'),
          color: 'var(--text)'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          width: 24,
          fontSize: 16,
          textAlign: 'center',
          color: '#f0d060'
        }
      }, a.icon), /*#__PURE__*/React.createElement("span", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          fontFamily: 'var(--font-body)',
          fontSize: 14
        }
      }, a.label, done ? ' (looted)' : '', a.id === 'loot' && !done ? /*#__PURE__*/React.createElement("span", {
        style: {
          marginLeft: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: ZI.lootSafeChance(actionCell) >= 60 ? 'var(--green)' : ZI.lootSafeChance(actionCell) >= 35 ? 'var(--amber)' : 'var(--red2)'
        }
      }, ZI.lootSafeChance(actionCell), "% safe") : null), /*#__PURE__*/React.createElement("span", {
        style: {
          display: 'block',
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text2)'
        }
      }, a.desc)));
    })), actionResult && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        padding: '8px 10px',
        background: 'var(--bg4)',
        borderLeft: "3px solid ".concat(toneColor[actionResult.tone]),
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--text)',
        lineHeight: 1.45
      }
    }, actionResult.text), actionResult && isHereCell(actionCell) && setScreen && /*#__PURE__*/React.createElement("button", {
      className: "btn btn-amber",
      style: {
        width: '100%',
        marginTop: 8
      },
      onClick: function onClick() {
        return setScreen('hack-slash');
      }
    }, "\u25B6 Start wandering around this ", actionCell.name.replace(/ [A-H]\d+$/, '')), /*#__PURE__*/React.createElement("button", {
      className: "btn",
      style: {
        width: '100%',
        marginTop: 8
      },
      onClick: function onClick() {
        return setActionCell(null);
      }
    }, actionResult ? 'Done' : 'Cancel')));
  }(), fortOpen && /*#__PURE__*/React.createElement(FortGateScene, {
    onClose: function onClose() {
      setFortOpen(false);
      setQuestTick(function (t) {
        return t + 1;
      });
    }
  }), tutStep >= 0 && tutStep < TUTORIAL.length && !actionCell && !tutPoint && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '50%',
      bottom: 18,
      transform: 'translateX(-50%)',
      zIndex: 70,
      width: 'min(460px, 94%)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 16,
      borderColor: '#ff3b3b',
      background: 'var(--bg2)',
      boxShadow: '0 8px 28px rgba(0,0,0,0.7)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: '#ff3b3b',
      letterSpacing: '0.12em'
    }
  }, "TUTORIAL \xB7 ", tutStep + 1, "/", TUTORIAL.length), /*#__PURE__*/React.createElement("button", {
    onClick: closeTutorial,
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--text2)',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      fontSize: 11
    }
  }, "Skip")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 18,
      color: 'var(--text)',
      marginBottom: 6
    }
  }, TUTORIAL[tutStep].title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--text)',
      lineHeight: 1.5,
      textWrap: 'pretty'
    }
  }, TUTORIAL[tutStep].body), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 12,
      justifyContent: 'flex-end'
    }
  }, tutStep > 0 && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: function onClick() {
      return setTutStep(function (t) {
        return t - 1;
      });
    }
  }, "Back"), tutStep === 2 ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: '#f0d060',
      alignSelf: 'center'
    }
  }, "Click a glowing zone to continue \u2192") : tutStep < TUTORIAL.length - 1 ? /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    onClick: function onClick() {
      return setTutStep(function (t) {
        return t + 1;
      });
    }
  }, "Next") : /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    onClick: function onClick() {
      return setTutPoint(true);
    }
  }, "Next")))), tutPoint && ReactDOM.createPortal(/*#__PURE__*/React.createElement("div", {
    onClick: function onClick(e) {
      var r = wanderRect;
      if (r && e.clientX >= r.x - 6 && e.clientX <= r.x + r.w + 6 && e.clientY >= r.y - 6 && e.clientY <= r.y + r.h + 6) finishTutorialToWander();
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      cursor: 'default'
    }
  }, wanderRect ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "tut-spot",
    style: {
      position: 'fixed',
      left: wanderRect.x - 6,
      top: wanderRect.y - 6,
      width: wanderRect.w + 12,
      height: wanderRect.h + 12,
      boxShadow: '0 0 0 9999px rgba(0,0,0,0.82)',
      border: '2px solid #ff3b3b',
      borderRadius: 4,
      pointerEvents: 'none',
      cursor: 'pointer'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      left: Math.max(12, Math.min(window.innerWidth - 332, wanderRect.x + wanderRect.w / 2 - 160)),
      top: wanderRect.y + wanderRect.h + 18,
      width: 320,
      pointerEvents: 'auto'
    },
    onClick: function onClick(e) {
      return e.stopPropagation();
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "tut-arrow",
    style: {
      position: 'absolute',
      top: -14,
      left: Math.max(14, Math.min(292, wanderRect.x + wanderRect.w / 2 - Math.max(12, Math.min(window.innerWidth - 332, wanderRect.x + wanderRect.w / 2 - 160)) - 10)),
      fontSize: 20,
      color: '#ff3b3b',
      lineHeight: 1
    }
  }, "\u25B2"), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 14,
      borderColor: '#ff3b3b',
      background: 'var(--bg2)',
      boxShadow: '0 8px 28px rgba(0,0,0,0.8)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: '#ff3b3b',
      letterSpacing: '0.12em',
      marginBottom: 4
    }
  }, "TUTORIAL \xB7 LAST STEP"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 18,
      color: 'var(--text)',
      marginBottom: 6
    }
  }, tgt.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--text)',
      lineHeight: 1.5
    }
  }, "Click the ", /*#__PURE__*/React.createElement("b", {
    style: {
      color: '#ff3b3b'
    }
  }, tgt.label), " tab above. ", tgt.body), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: closeTutorial
  }, "Skip"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    onClick: finishTutorialToWander
  }, "Take me there"))))) : /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.82)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    onClick: function onClick(e) {
      return e.stopPropagation();
    },
    style: {
      padding: 16,
      borderColor: '#ff3b3b',
      background: 'var(--bg2)',
      maxWidth: 340
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 18,
      color: 'var(--text)',
      marginBottom: 8
    }
  }, tgt.title), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    onClick: finishTutorialToWander
  }, "Take me there")))), document.body), tutStep < 0 && /*#__PURE__*/React.createElement(window.TutStepMenu, {
    label: "Traversal",
    side: "right",
    inset: 14,
    zIndex: 20,
    steps: TUTORIAL.map(function (t) {
      return t.title;
    }),
    onPick: function onPick(n) {
      setTutHover([]);
      setActionCell(null);
      setTutPoint(false);
      setTutStep(n);
    }
  }));
};

// ─── WANDERING SCREEN (Side-Scroller, Auto Turn-Based) ───────────────────────
// ─── TUTORIAL REPLAY MENU: the "?" button opens the step list; pick any one step (spec principle 4, test plan 6) ─
window.TutStepMenu = function TutStepMenu(_ref31) {
  var label = _ref31.label,
    steps = _ref31.steps,
    onPick = _ref31.onPick,
    side = _ref31.side,
    inset = _ref31.inset,
    zIndex = _ref31.zIndex;
  var _React$useState59 = React.useState(false),
    _React$useState60 = _slicedToArray(_React$useState59, 2),
    open = _React$useState60[0],
    setOpen = _React$useState60[1];
  var pos = _defineProperty(_defineProperty({
    position: 'absolute',
    bottom: inset
  }, side === 'left' ? 'left' : 'right', inset), "zIndex", zIndex);
  return /*#__PURE__*/React.createElement("div", {
    "data-tut-menu": label,
    style: pos
  }, open && /*#__PURE__*/React.createElement("div", {
    className: "panel",
    role: "menu",
    style: _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({
      position: 'absolute',
      bottom: 40
    }, side === 'left' ? 'left' : 'right', 0), "width", 260), "padding", 10), "borderColor", '#ff3b3b'), "background", 'var(--bg2)'), "boxShadow", '0 8px 28px rgba(0,0,0,0.7)'), "display", 'flex'), "flexDirection", 'column'), "gap", 4)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: '#ff3b3b',
      letterSpacing: '0.12em'
    }
  }, "REPLAY A STEP \xB7 ", label.toUpperCase()), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setOpen(false);
    },
    title: "Close",
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--text2)',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      fontSize: 12
    }
  }, "\u2715")), steps.map(function (t, n) {
    return /*#__PURE__*/React.createElement("button", {
      key: n,
      role: "menuitem",
      onClick: function onClick() {
        setOpen(false);
        onPick(n);
      },
      style: {
        display: 'flex',
        gap: 8,
        textAlign: 'left',
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        cursor: 'pointer',
        padding: '6px 8px',
        fontFamily: 'var(--font-body)',
        fontSize: 13
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        color: '#ff3b3b'
      }
    }, n + 1), /*#__PURE__*/React.createElement("span", null, t));
  })), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setOpen(function (o) {
        return !o;
      });
    },
    title: "Replay a ".concat(label, " tutorial step"),
    "aria-expanded": open,
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      cursor: 'pointer',
      background: 'var(--bg3)',
      border: '1px solid #ff3b3b',
      color: '#ff3b3b',
      fontFamily: 'var(--font-mono)',
      fontSize: 14
    }
  }, "?"));
};
// ─── WANDERING TUTORIAL (spotlights each HUD area and explains the decision) ─
window.WanderTutorial = function WanderTutorial(_ref33) {
  var rootRef = _ref33.rootRef,
    onDone = _ref33.onDone,
    startAt = _ref33.startAt;
  var STEPS = window.WANDER_TUT_STEPS;
  var _React$useState61 = React.useState(function () {
      return Math.max(0, Math.min(STEPS.length - 1, startAt || 0));
    }),
    _React$useState62 = _slicedToArray(_React$useState61, 2),
    i = _React$useState62[0],
    setI = _React$useState62[1];
  return window.WanderTutorialView({
    rootRef: rootRef,
    onDone: onDone,
    STEPS: STEPS,
    i: i,
    setI: setI
  });
};
window.WANDER_TUT_STEPS = [{
  tut: 'scene',
  title: 'This is the idle half of the game',
  body: 'Your survivor patrols the zone they stand on the Traversal map — walking, fighting and looting on their own, even while you\'re on other tabs or away. Your job here isn\'t to watch the fight; it\'s to decide how risky the patrol should be.'
}, {
  tut: 'hp',
  title: 'Health is the clock on every run',
  body: 'Each zombie chips away at HP. Hit 0 and the survivor is downed: sent home, carrying only part of their haul. Watching this bar tells you when to heal, slow down, or head back.'
}, {
  tut: 'haul',
  title: 'Your pack is at risk until you bank it',
  body: 'Loot rides in the survivor\'s pack (🎒) while they\'re out. Nothing is safe until you Return to Base — if they go down first, most of it is lost. Levelling Scavenging lets them keep more. The core choice: push deeper for more, or go home and keep what you have.'
}, {
  tut: 'distance',
  title: 'Distance, laps and checkpoints',
  body: 'The further you travel, the tougher the zombies — each full bar is a lap (💀 ×1.1, ×1.2…). Checkpoints every 250 m are kept even if you\'re downed, and you can jump back to any of them on the slider below.'
}, {
  tut: 'actions',
  title: 'Policy, pace and risk',
  body: 'Your standing policy (the first button) decides what your survivor meets while you\'re away and whether they fight or slip past zombies. Ethical is slow and safe; Criminal pays more and makes enemies. Heal spends a first-aid charge; Walk, Jog and Run trade safety for speed. More actions holds Idle Run, Run Back, your Gear and equipped consumables.'
}, {
  tut: 'log',
  title: 'The combat log',
  body: 'Every hit, kill, loot drop and checkpoint is recorded here, along with a recap of anything that happened while you were away. Check it to see what\'s been hurting you and what you picked up.'
}, {
  tut: 'cmds',
  title: 'Tools and what trains you',
  body: 'Heal, scout and push are your hands-on tools; the patrol keeps fighting on its own either way. What your survivor does trains them: healing builds First Aid, scouting and pushing build Stealth, looting builds Scavenging, and each policy encounter trains the skills it tests. Skills you stop using never lose progress. When you come back, the log shows what happened while you were gone.'
}];
window.WanderTutorialView = function WanderTutorialView(_ref34) {
  var rootRef = _ref34.rootRef,
    onDone = _ref34.onDone,
    STEPS = _ref34.STEPS,
    i = _ref34.i,
    setI = _ref34.setI;
  var _React$useState63 = React.useState(null),
    _React$useState64 = _slicedToArray(_React$useState63, 2),
    rect = _React$useState64[0],
    setRect = _React$useState64[1];
  var step = STEPS[i];
  React.useEffect(function () {
    var measure = function measure() {
      var root = rootRef.current;
      if (!root) return;
      var el = root.querySelector('[data-tut="' + step.tut + '"]');
      var rr = root.getBoundingClientRect();
      if (!el) {
        setRect(null);
        return;
      }
      var r = el.getBoundingClientRect();
      setRect({
        x: r.left - rr.left,
        y: r.top - rr.top,
        w: r.width,
        h: r.height,
        rw: rr.width,
        rh: rr.height
      });
    };
    measure();
    var t = setInterval(measure, 400);
    return function () {
      return clearInterval(t);
    };
  }, [i]);
  var CARD_W = 340,
    pad = 6;
  var cardW = CARD_W;
  var cardStyle = {
    left: '50%',
    top: '50%',
    transform: 'translate(-50%,-50%)'
  };
  if (rect) {
    var CARD_H = 230,
      gap = 12;
    var cx = Math.max(12, Math.min(rect.rw - CARD_W - 12, rect.x + rect.w / 2 - CARD_W / 2));
    var cy = Math.max(12, Math.min(rect.rh - CARD_H - 12, rect.y + rect.h / 2 - CARD_H / 2));
    var room = {
      below: rect.rh - (rect.y + rect.h) - gap,
      above: rect.y - gap,
      right: rect.rw - (rect.x + rect.w) - gap,
      left: rect.x - gap
    };
    var fits = {
      below: room.below >= CARD_H,
      above: room.above >= CARD_H,
      right: room.right >= CARD_W,
      left: room.left >= CARD_W
    };
    // Order: whichever fully-fitting side has the most spare room; card never sits on the target.
    var order = Object.keys(fits).filter(function (k) {
      return fits[k];
    }).sort(function (a, b) {
      return room[b] - (b === 'left' || b === 'right' ? CARD_W : CARD_H) - (room[a] - (a === 'left' || a === 'right' ? CARD_W : CARD_H));
    });
    var side = order[0];
    // Nothing fits at full width: use the roomiest left/right side with a narrower card (min 240px).
    if (!side) {
      var lr = room.right >= room.left ? 'right' : 'left';
      if (room[lr] >= 240) {
        side = lr;
        cardW = Math.min(CARD_W, room[lr] - 12);
      }
    }
    if (side === 'below') cardStyle = {
      left: cx,
      top: rect.y + rect.h + gap
    };else if (side === 'above') cardStyle = {
      left: cx,
      top: rect.y - gap,
      transform: 'translateY(-100%)'
    };else if (side === 'right') cardStyle = {
      left: rect.x + rect.w + gap,
      top: cy
    };else if (side === 'left') cardStyle = {
      left: rect.x - gap - cardW,
      top: cy
    };else cardStyle = {
      left: 12,
      top: Math.max(12, rect.y + 12)
    }; // target fills the screen: top of it, clear of the sprites
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 95
    }
  }, rect ? /*#__PURE__*/React.createElement("div", {
    className: "tut-spot",
    style: {
      position: 'absolute',
      left: rect.x - pad,
      top: rect.y - pad,
      width: rect.w + pad * 2,
      height: rect.h + pad * 2,
      boxShadow: '0 0 0 9999px rgba(0,0,0,0.78)',
      border: '2px solid #ff3b3b',
      borderRadius: 4,
      pointerEvents: 'none',
      transition: 'all 0.3s'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(0,0,0,0.78)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: _objectSpread({
      position: 'absolute',
      width: cardW,
      maxWidth: 'calc(100% - 24px)',
      padding: 14,
      borderColor: '#ff3b3b',
      background: 'var(--bg2)',
      boxShadow: '0 8px 28px rgba(0,0,0,0.8)'
    }, cardStyle)
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: '#ff3b3b',
      letterSpacing: '0.12em'
    }
  }, "TUTORIAL \xB7 WANDERING \xB7 ", i + 1, "/", STEPS.length), /*#__PURE__*/React.createElement("button", {
    onClick: onDone,
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--text2)',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      fontSize: 11
    }
  }, "Skip \u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 18,
      color: 'var(--text)',
      marginBottom: 6
    }
  }, step.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--text)',
      lineHeight: 1.5
    }
  }, step.body), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    disabled: i === 0,
    onClick: function onClick() {
      return setI(i - 1);
    },
    style: {
      opacity: i === 0 ? 0.4 : 1
    }
  }, "Back"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, STEPS.map(function (_, k) {
    return /*#__PURE__*/React.createElement("span", {
      key: k,
      style: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: k <= i ? '#ff3b3b' : 'var(--bg4)',
        border: '1px solid #ff3b3b'
      }
    });
  })), i < STEPS.length - 1 ? /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    onClick: function onClick() {
      return setI(i + 1);
    }
  }, "Next") : /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    onClick: onDone
  }, "Start patrolling"))));
};
window.WanderingScreen = function WanderingScreen(_ref35) {
  var _ref36, _encounter$currentHp2, _encounter$currentHp3;
  var route = _ref35.route,
    setScreen = _ref35.setScreen;
  var ZI = window.ZI;
  // The idle patrol happens wherever the survivor stands on the Traversal map.
  var zone = ZI.getTravZone && ZI.getTravZone() || null;
  var zoneBiome = zone && ZI.BIOMES.find(function (b) {
    return b.id === zone.biome;
  });
  var sceneBackground = {
    mountain: 'assets/wandering-backgrounds/mountain-country.png',
    suburbia: 'assets/wandering-backgrounds/ruined-suburb.png',
    metro: 'assets/wandering-backgrounds/ruined-metropolis.png',
    perimeter: 'assets/wandering-backgrounds/fortified-perimeter.png'
  }[zone && zone.biome] || 'assets/wandering-backgrounds/ruined-city.png';
  var sceneGround = {
    mountain: ['#394239', '#202720', '#151b17'],
    suburbia: ['#403c32', '#292721', '#191814'],
    metro: ['#414247', '#2a2b2e', '#191a1c'],
    perimeter: ['#41463d', '#2a3028', '#1a201a']
  }[zone && zone.biome] || ['#40382f', '#29231e', '#191511'];
  // The source panoramas put their near ground at different heights; place the survivor's boots on that ground line.
  var sceneGroundBottomPct = {
    mountain: 14,
    suburbia: 14,
    metro: 16,
    perimeter: 15
  }[zone && zone.biome] || 14;
  var zoneCoord = zone ? String.fromCharCode(65 + zone.col) + (zone.row + 1) : null;

  // Encounter state
  var _React$useState65 = React.useState(null),
    _React$useState66 = _slicedToArray(_React$useState65, 2),
    encounter = _React$useState66[0],
    setEncounter = _React$useState66[1];
  var _React$useState67 = React.useState([]),
    _React$useState68 = _slicedToArray(_React$useState67, 2),
    encounters = _React$useState68[0],
    setEncounters = _React$useState68[1];
  var _React$useState69 = React.useState([{
      type: 'info',
      text: zone ? "\uD83D\uDCCD Wandering around ".concat(zone.name, " (").concat(zoneBiome ? zoneBiome.name : zone.biome, ")...") : 'Departing on Wandering patrol...'
    }].concat(_toConsumableArray(function () {
      // opening the screen mid-retreat: say so in the log
      var rn = window.ZI.getWanderRun ? window.ZI.getWanderRun() : {},
        Z = window.ZI;
      if (rn.withdrawing) return [{
        type: 'enemy',
        text: "\u21A9 ".concat(rn.withdrawCauses && Z.retreatWithdrawText ? Z.retreatWithdrawText(rn.withdrawCauses) : 'Retreating', " \u2014 ").concat(Math.round(rn.withdrawLeftM || 0), " m back to the checkpoint.")
      }];
      if (rn.resting) return [{
        type: 'enemy',
        text: rn.restAt === 'checkpoint' ? "\uD83D\uDECF Withdrew and resting at the checkpoint (HP ".concat(Math.round(rn.hp || 0), "%) until HP \u2265 80%.") : "\u2620 Forced Retreat \u2014 resting at Base injured (HP ".concat(Math.round(rn.hp || 0), "%) until HP \u2265 80%.")
      }];
      return [];
    }()))),
    _React$useState70 = _slicedToArray(_React$useState69, 2),
    combatLog = _React$useState70[0],
    setCombatLog = _React$useState70[1];
  // Story messages queued by other screens (e.g. the Survey Point) land here.
  React.useEffect(function () {
    var pull = function pull() {
      var q = window.ZI.drainWanderLog ? window.ZI.drainWanderLog() : [];
      if (q.length) setCombatLog(function (p) {
        return [].concat(_toConsumableArray(p), _toConsumableArray(q.map(function (text) {
          return {
            type: 'init',
            text: text
          };
        })));
      });
    };
    pull();
    var t = setInterval(pull, 1500);
    return function () {
      return clearInterval(t);
    };
  }, []);
  var _React$useState71 = React.useState((_ref36 = window.ZI.getWanderRun && window.ZI.getWanderRun().hp) !== null && _ref36 !== void 0 ? _ref36 : 100),
    _React$useState72 = _slicedToArray(_React$useState71, 2),
    playerHp = _React$useState72[0],
    setPlayerHp = _React$useState72[1];
  // Batch 3B: the shared simulation owns Downed (Forced Retreat → Base rest). The old overlay is bypassed: it opened when a saved
  // run had HP ≤ 0 at mount and its button resumed at 100 HP without rest.
  var _React$useState73 = React.useState(false),
    _React$useState74 = _slicedToArray(_React$useState73, 2),
    downed = _React$useState74[0],
    setDowned = _React$useState74[1];
  var _React$useState75 = React.useState(window.ZI.getWanderRun && window.ZI.getWanderRun().healsUsed || 0),
    _React$useState76 = _slicedToArray(_React$useState75, 2),
    healsUsed = _React$useState76[0],
    setHealsUsed = _React$useState76[1];
  // FX4 (Q5): heal strength is the shared rule ZI.SurvivorRules.healPct(); the screen no longer computes or writes it.
  var FREE_KILLS = 10;
  var _React$useState77 = React.useState(0),
    _React$useState78 = _slicedToArray(_React$useState77, 2),
    killCmdsUsed = _React$useState78[0],
    setKillCmdsUsed = _React$useState78[1];
  // Movement: Walk uses the shared 1.4 m/s baseline; Jog/Run scale with Athletics conditioning.
  // 1–10 conditioning, from the survivor's real Athletics level (rust applied).
  var ATHLETICS = window.ZI.SurvivorRules.conditioning(); // FX4: the shared rule's conditioning value (display only)
  // FX4 (D-FX4a): pace is a saved player setting; the screen opens on it and saves each change. Speed is computed by rule.
  var _React$useState79 = React.useState(function () {
      return window.ZI.getWanderRun && window.ZI.getWanderRun().moveMode || 'walk';
    }),
    _React$useState80 = _slicedToArray(_React$useState79, 2),
    moveMode = _React$useState80[0],
    setMoveMode = _React$useState80[1];
  React.useEffect(function () {
    window.ZI.syncWanderState && window.ZI.syncWanderState({
      moveMode: moveMode
    });
  }, [moveMode]);
  // ── Gear loadout: equipped items modify live stats (spec §13) ──
  var _React$useState81 = React.useState(function () {
      return window.ZI.getLoadout();
    }),
    _React$useState82 = _slicedToArray(_React$useState81, 2),
    loadout = _React$useState82[0],
    setLoadout = _React$useState82[1];
  var _React$useState83 = React.useState(function () {
      return window.ZI.getStash();
    }),
    _React$useState84 = _slicedToArray(_React$useState83, 2),
    stash = _React$useState84[0],
    setStash = _React$useState84[1];
  var _React$useState85 = React.useState(false),
    _React$useState86 = _slicedToArray(_React$useState85, 2),
    showGear = _React$useState86[0],
    setShowGear = _React$useState86[1];
  var _React$useState87 = React.useState('ALL'),
    _React$useState88 = _slicedToArray(_React$useState87, 2),
    gearFilter = _React$useState88[0],
    setGearFilter = _React$useState88[1];
  // Re-read the one stash/loadout store whenever it changes (crafts finishing, equips on another screen).
  React.useEffect(function () {
    return window.ZI.onInventoryChange(function () {
      setStash(window.ZI.getStash());
      setLoadout(window.ZI.getLoadout());
    });
  }, []);
  // Active consumable buffs (timed). Each is {until, val}.
  var _React$useState89 = React.useState({
      speed: null,
      dmg: null,
      armor: null,
      loot: null
    }),
    _React$useState90 = _slicedToArray(_React$useState89, 2),
    buffs = _React$useState90[0],
    setBuffs = _React$useState90[1];
  var _React$useState91 = React.useState(0),
    _React$useState92 = _slicedToArray(_React$useState91, 2),
    reviveCharge = _React$useState92[0],
    setReviveCharge = _React$useState92[1]; // HP restored when downed
  var now0 = Date.now();
  var buffActive = function buffActive(b) {
    return b && now0 < b.until;
  };
  var buffDmgPct = buffActive(buffs.dmg) ? buffs.dmg.val : 0;
  var buffArmorAdd = buffActive(buffs.armor) ? buffs.armor.val : 0;
  var buffLootPct = buffActive(buffs.loot) ? buffs.loot.val : 0;
  var gearStats = window.ZI.resolveLoadoutStats(loadout);
  var weaponKind = window.ZI_ART.weaponKindFor(loadout);
  var weaponFx = window.ZI_ART.WEAPON_FX[weaponKind] || {};
  var closeCombatLoadout = !!loadout.melee || !loadout.primary && !loadout.secondary;
  var closeCombatRef = React.useRef(closeCombatLoadout);
  closeCombatRef.current = closeCombatLoadout;
  var meleeEquipped = !!loadout.melee;
  var activeWeaponItem = ['primary', 'secondary', 'melee'].map(function (slot) {
    return loadout[slot] && window.ZI.getGearItem(loadout[slot]);
  }).find(Boolean);
  var electricWeapon = /shock|arc/i.test(activeWeaponItem && "".concat(activeWeaponItem.id, " ").concat(activeWeaponItem.name) || '');
  var electricWeaponRef = React.useRef(electricWeapon);
  electricWeaponRef.current = electricWeapon;
  var hasWorkingVehicle = !!(window.ZI.hasWorkingVehicle && window.ZI.hasWorkingVehicle());
  // FX4 (Q5): speed = pace × gear × speed buffs, from the shared rule (display only; the simulation computes its own each step).
  var moveSpeed = window.ZI.SurvivorRules.moveSpeed({
    moveMode: moveMode
  });
  var _React$useState93 = React.useState(window.ZI.getWanderRun && window.ZI.getWanderRun().lastCheckpoint || 0),
    _React$useState94 = _slicedToArray(_React$useState93, 2),
    lastCheckpoint = _React$useState94[0],
    setLastCheckpoint = _React$useState94[1];
  var CHECKPOINT_EVERY = 250; // meters
  var _React$useState95 = React.useState(window.ZI.getCheckpoints && window.ZI.getCheckpoints() || []),
    _React$useState96 = _slicedToArray(_React$useState95, 2),
    checkpoints = _React$useState96[0],
    setCheckpoints = _React$useState96[1];
  var _React$useState97 = React.useState(route && route.idle === true),
    _React$useState98 = _slicedToArray(_React$useState97, 2),
    idleMode = _React$useState98[0],
    setIdleMode = _React$useState98[1];
  var _React$useState99 = React.useState(false),
    _React$useState100 = _slicedToArray(_React$useState99, 2),
    hudMenu = _React$useState100[0],
    setHudMenu = _React$useState100[1];
  // ── Standing policy (persists outside the run; see Wandering spec §2) ──
  var _React$useState101 = React.useState(function () {
      return window.ZI.getPolicy();
    }),
    _React$useState102 = _slicedToArray(_React$useState101, 2),
    policy = _React$useState102[0],
    setPolicyState = _React$useState102[1];
  var _React$useState103 = React.useState(false),
    _React$useState104 = _slicedToArray(_React$useState103, 2),
    polMenu = _React$useState104[0],
    setPolMenu = _React$useState104[1];
  var _React$useState105 = React.useState(null),
    _React$useState106 = _slicedToArray(_React$useState105, 2),
    polMsg = _React$useState106[0],
    setPolMsg = _React$useState106[1];
  var choosePolicy = function choosePolicy(id) {
    var r = window.ZI.setPolicy(id);
    if (r.ok) {
      setPolicyState(window.ZI.getPolicy());
      setPolMenu(false);
      setPolMsg(null);
      setCombatLog(function (prev) {
        return [].concat(_toConsumableArray(prev), [{
          type: 'init',
          text: "".concat(window.ZI.POLICIES[id].icon, " Standing policy set to ").concat(window.ZI.POLICIES[id].name, ". Encounters will follow it.")
        }]);
      });
    } else setPolMsg(r.reason);
  };
  var _React$useState107 = React.useState(function () {
      return !window.ZI.tutDone('zi_wander_tut_done');
    }),
    _React$useState108 = _slicedToArray(_React$useState107, 2),
    wTut = _React$useState108[0],
    setWTut = _React$useState108[1];
  var _React$useState109 = React.useState(0),
    _React$useState110 = _slicedToArray(_React$useState109, 2),
    wTutStart = _React$useState110[0],
    setWTutStart = _React$useState110[1];
  var wanderRootRef = React.useRef(null);
  var _React$useState111 = React.useState(window.ZI.getWanderRun && window.ZI.getWanderRun().scroll || 0),
    _React$useState112 = _slicedToArray(_React$useState111, 2),
    scroll = _React$useState112[0],
    setScroll = _React$useState112[1];
  // Narrow screens (phones): the scene sits above the combat log at full width instead of beside it. Display only.
  var _React$useState113 = React.useState(function () {
      return (window.innerWidth || 1024) < 760;
    }),
    _React$useState114 = _slicedToArray(_React$useState113, 2),
    narrow = _React$useState114[0],
    setNarrow = _React$useState114[1];
  React.useEffect(function () {
    var f = function f() {
      return setNarrow((window.innerWidth || 1024) < 760);
    };
    window.addEventListener('resize', f);
    return function () {
      return window.removeEventListener('resize', f);
    };
  }, []);
  // Oct 29: name and gender come from Character Creation (zi_survivor_profile); older saves keep the defaults.
  var _React$useState115 = React.useState(function () {
      var p = window.ZI.getSurvivorProfile ? window.ZI.getSurvivorProfile() : null;
      return {
        name: p && p.name || 'Yael Strom',
        gender: p ? p.gender : undefined,
        "class": 'ranger',
        hp: 100,
        atk: 18,
        def: 8,
        init: 14
      };
    }),
    _React$useState116 = _slicedToArray(_React$useState115, 1),
    activeSurvivor = _React$useState116[0];
  var _React$useState117 = React.useState(function () {
      var r = window.ZI.getWanderRun && window.ZI.getWanderRun() || {};
      return {
        kills: r.kills || 0,
        xp: r.xp || 0,
        mats: r.mats || 0
      };
    }),
    _React$useState118 = _slicedToArray(_React$useState117, 2),
    score = _React$useState118[0],
    setScore = _React$useState118[1];
  // Carried loot for this run — each entry { name, value }. Drives the
  // "drop all but most valuable on down" rule.
  // Persisted in zi_wander_run so the pack survives tab switches and the
  // background patrol can add to it while the tab is closed.
  var _React$useState119 = React.useState(function () {
      return window.ZI.getWanderRun && window.ZI.getWanderRun().carried || [];
    }),
    _React$useState120 = _slicedToArray(_React$useState119, 2),
    carried = _React$useState120[0],
    setCarried = _React$useState120[1];
  React.useEffect(function () {
    window.ZI.syncWanderState && window.ZI.syncWanderState({
      carried: carried
    });
  }, [carried]);
  var _React$useState121 = React.useState(window.ZI.cmdsRemaining && window.ZI.cmdsRemaining() || 60),
    _React$useState122 = _slicedToArray(_React$useState121, 2),
    cmdsLeft = _React$useState122[0],
    setCmdsLeft = _React$useState122[1];
  var _React$useState123 = React.useState(0),
    _React$useState124 = _slicedToArray(_React$useState123, 2),
    animFrame = _React$useState124[0],
    setAnimFrame = _React$useState124[1];
  var _React$useState125 = React.useState(0),
    _React$useState126 = _slicedToArray(_React$useState125, 2),
    survivorFrame = _React$useState126[0],
    setSurvivorFrame = _React$useState126[1];
  var _React$useState127 = React.useState(0),
    _React$useState128 = _slicedToArray(_React$useState127, 2),
    restFrame = _React$useState128[0],
    setRestFrame = _React$useState128[1];
  var _React$useState129 = React.useState(340),
    _React$useState130 = _slicedToArray(_React$useState129, 2),
    sceneHeight = _React$useState130[0],
    setSceneHeight = _React$useState130[1];
  var _React$useState131 = React.useState(1000),
    _React$useState132 = _slicedToArray(_React$useState131, 2),
    sceneWidth = _React$useState132[0],
    setSceneWidth = _React$useState132[1];
  var sceneRef = React.useRef(null);
  React.useEffect(function () {
    var node = sceneRef.current;
    if (!node) return;
    var sync = function sync() {
      var r = node.getBoundingClientRect();
      setSceneHeight(r.height || 340);
      setSceneWidth(r.width || 1000);
    };
    sync();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', sync);
      return function () {
        return window.removeEventListener('resize', sync);
      };
    }
    var observer = new ResizeObserver(sync);
    observer.observe(node);
    return function () {
      return observer.disconnect();
    };
  }, []);
  var actorSize = Math.max(112, Math.min(176, Math.round(sceneHeight * 0.46)));
  // ANIM-FIX (Oct 27): v4 sheets are clean 4x4 grids (rows 1-2 an 8-frame walk cycle, rows 3-4 the strike), every
  // frame on one baseline. aspect = cell width / height; body = average walking figure height / cell height.
  var SURVIVOR_SHEETS = {
    fist: {
      file: 'survivor-walk-punch-v4',
      aspect: 0.9455,
      body: 0.922
    },
    melee: {
      file: 'survivor-melee-swing-v4',
      aspect: 1.1298,
      body: 0.9209
    }
  };
  var survivorSheet = SURVIVOR_SHEETS[meleeEquipped ? 'melee' : 'fist'];
  // Match ordinary zombie height to the visible survivor figure. Close-combat sheets fill actorSize;
  // the ranged SVG is rendered at a fixed 84×112 regardless of its larger positioning wrapper.
  var survivorSpriteHeight = closeCombatLoadout ? actorSize : 112;
  var survivorBodyPx = survivorSpriteHeight * survivorSheet.body;
  // Zombie size by tier, relative to the survivor: F-D are human sized, then C 52 / B 56 / A 62 / S 70 / BOSS 84 on the
  // 48 px tier scale (zombie-sprites.js). If the boss would not fit under the HP bar, every tier shrinks together.
  var TIER_BODY = {
    F: 48,
    E: 48,
    D: 48,
    C: 52,
    B: 56,
    A: 62,
    S: 70,
    BOSS: 84
  };
  // The close-combat punch frames have a shorter visible alpha bound than the walk frames (about 237px vs 277px
  // in each 300px cell). Scale enemies to the crouched survivor during a strike so both poses stay visually aligned.
  var PUNCH_BODY_SCALE = 0.8584;
  var tierFit = Math.min(1, (sceneHeight * 0.88 - 46) / (survivorBodyPx * 84 / 48));
  var zombieHeightForTier = function zombieHeightForTier(tier) {
    return Math.round(survivorBodyPx * (TIER_BODY[tier] || 48) / 48 * tierFit * (closeCombatLoadout && survivorStriking ? PUNCH_BODY_SCALE : 1));
  };
  // Walk timing: one step of the v4 cycle covers 0.316 of the body height. The scenery scrolls at exactly that speed
  // so the planted foot stays put on the ground (no sliding / walking in place). Display only.
  var STEP_SECONDS = {
    walk: 0.7,
    jog: 0.48,
    run: 0.36
  };
  var stepSeconds = STEP_SECONDS[moveMode] || 0.7;
  var groundSpeed = 0.316 * survivorBodyPx / stepSeconds; // px per second
  var _React$useState133 = React.useState(3),
    _React$useState134 = _slicedToArray(_React$useState133, 2),
    bgAspect = _React$useState134[0],
    setBgAspect = _React$useState134[1];
  var _React$useState135 = React.useState({}),
    _React$useState136 = _slicedToArray(_React$useState135, 2),
    zombieAnim = _React$useState136[0],
    setZombieAnim = _React$useState136[1];
  var _React$useState137 = React.useState(false),
    _React$useState138 = _slicedToArray(_React$useState137, 2),
    survivorStriking = _React$useState138[0],
    setSurvivorStriking = _React$useState138[1];
  var _React$useState139 = React.useState(0),
    _React$useState140 = _slicedToArray(_React$useState139, 2),
    survivorStrikeId = _React$useState140[0],
    setSurvivorStrikeId = _React$useState140[1];
  var survivorStrikeTimer = React.useRef(null);
  var _React$useState141 = React.useState([]),
    _React$useState142 = _slicedToArray(_React$useState141, 2),
    pixelBursts = _React$useState142[0],
    setPixelBursts = _React$useState142[1]; // display-only combat sparks; never affects the simulation
  // Floating damage numbers ({id, who:'zombie'|'player', n})
  var _React$useState143 = React.useState([]),
    _React$useState144 = _slicedToArray(_React$useState143, 2),
    dmgPops = _React$useState144[0],
    setDmgPops = _React$useState144[1];
  // Display only: fight damage not yet replayed. The engine applies a whole fight at once; the HP readout steps down with each strike.
  var _React$useState145 = React.useState(0),
    _React$useState146 = _slicedToArray(_React$useState145, 2),
    hpLag = _React$useState146[0],
    setHpLag = _React$useState146[1];
  var hpMax = window.ZI.maxHp ? window.ZI.maxHp() : 100; // BAL-A: current max HP (lower while Broken)
  var hpShown = Math.min(hpMax, playerHp + hpLag);
  var popDmg = function popDmg(who, n) {
    if (!window.ZI.getSettings().damageNumbers || !(n > 0)) return;
    var id = Date.now() + Math.random();
    setDmgPops(function (p) {
      return [].concat(_toConsumableArray(p.slice(-6)), [{
        id: id,
        who: who,
        n: n,
        dx: Math.round(Math.random() * 24 - 12)
      }]);
    });
    setTimeout(function () {
      return setDmgPops(function (p) {
        return p.filter(function (x) {
          return x.id !== id;
        });
      });
    }, 950);
  };
  var logRef = React.useRef(null);
  var scrollRef = React.useRef(window.ZI.getWanderRun && window.ZI.getWanderRun().scroll || 0);
  var _React$useState147 = React.useState(''),
    _React$useState148 = _slicedToArray(_React$useState147, 2),
    cmdInput = _React$useState148[0],
    setCmdInput = _React$useState148[1];

  // Build the encounter pool from the full 45-zombie bestiary. Falls back to a
  // small built-in set if bestiary-data.js hasn't loaded.
  var TIER_RANK = {
    F: 0,
    E: 1,
    D: 2,
    C: 3,
    B: 4,
    A: 5,
    S: 6,
    BOSS: 7
  };
  var mapBestiary = function mapBestiary(z) {
    return {
      type: (z.base || z.name || 'shambler').toLowerCase().replace(/\s+/g, ''),
      name: z.name,
      hp: z.hp,
      atk: z.dmg,
      def: z.armor,
      init: Math.round((z.spd || 0.6) * 12),
      xp: z.xp,
      spd: z.spd,
      armor: z.armor,
      currentHp: z.hp,
      bestiaryId: z.id,
      tier: z.tier,
      weakness: z.weakness || [],
      loot: z.loot,
      drops: z.loot
    };
  };
  var bestiaryPool = (window.ZI.fieldBestiary ? window.ZI.fieldBestiary() : window.ZI.BESTIARY || []).map(mapBestiary); // Oct 29: includes the Crawler in new saves
  var undeadTypes = bestiaryPool.length ? bestiaryPool : [{
    type: 'shambler',
    name: 'Shambler',
    hp: 25,
    atk: 8,
    def: 0,
    init: 5,
    xp: 10,
    tier: 'F',
    weakness: ['Blunt'],
    drops: 'Cloth, scrap',
    currentHp: 25
  }, {
    type: 'runner',
    name: 'Runner',
    hp: 18,
    atk: 14,
    def: 0,
    init: 18,
    xp: 18,
    tier: 'E',
    weakness: ['Obstacles'],
    drops: 'Cloth',
    currentHp: 18
  }];
  // Depth-gated pool: only zombies whose tier rank is unlocked by current lap.
  var poolForDepth = function poolForDepth(lap) {
    // F at lap0, +1 tier ~every 1.5 laps; tougher Traversal zones start higher.
    var zoneBoost = zone ? Math.max(0, (zone.difficulty || 1) - 1) : 0;
    var maxRank = Math.min(7, Math.floor(lap / 1.5) + zoneBoost);
    var elig = undeadTypes.filter(function (u) {
      var _TIER_RANK$u$tier;
      return ((_TIER_RANK$u$tier = TIER_RANK[u.tier]) !== null && _TIER_RANK$u$tier !== void 0 ? _TIER_RANK$u$tier : 0) <= maxRank;
    });
    return elig.length ? elig : undeadTypes.filter(function (u) {
      var _TIER_RANK$u$tier2;
      return ((_TIER_RANK$u$tier2 = TIER_RANK[u.tier]) !== null && _TIER_RANK$u$tier2 !== void 0 ? _TIER_RANK$u$tier2 : 0) === 0;
    });
  };
  var zombieMetricsFor = function zombieMetricsFor(enemy) {
    var sprite = window.ZI_ART.zombieSprite && window.ZI_ART.zombieSprite(enemy.bestiaryId, enemy.id);
    var lookScale = !sprite && window.ZI_ART.zombieLook ? window.ZI_ART.zombieLook(enemy.type).scale || 1 : 1;
    var targetHeight = zombieHeightForTier(enemy.tier);
    var sourceHeight = sprite ? sprite.h * 2 : 96 * lookScale;
    var maxW = sceneWidth * 0.5,
      w = sprite ? sprite.w * 2 * targetHeight / sourceHeight : 0;
    if (w > maxW) targetHeight = Math.round(targetHeight * maxW / w);
    return {
      sprite: sprite,
      targetHeight: targetHeight,
      scale: targetHeight / sourceHeight,
      lookScale: lookScale
    };
  };

  // Animation tick
  React.useEffect(function () {
    var t = setInterval(function () {
      return setAnimFrame(function (f) {
        return (f + 1) % 12;
      });
    }, 250); // 12 = both the 6-beat weapon cycle and the 4-pose zombie walk
    return function () {
      return clearInterval(t);
    };
  }, []);
  // The survivor walks (cycle runs, scenery scrolls) only while travelling: not in a fight, resting, pinned or down.
  var wanderRunNow = window.ZI.getWanderRun && window.ZI.getWanderRun() || {};
  var survivorWalking = !encounter && !downed && !wanderRunNow.resting && !wanderRunNow.paused;
  var retreatCauses = [wanderRunNow.withdrawCauses && wanderRunNow.withdrawCauses.primary].concat(_toConsumableArray(wanderRunNow.withdrawCauses && wanderRunNow.withdrawCauses.also || []));
  var hpRetreatCause = retreatCauses.some(function (c) {
    return c && c.rule === 'hp';
  });
  var retreatRules = window.ZI.getRetreatRules ? window.ZI.getRetreatRules() : {
    hpFloorPct: 30
  };
  var lowHpAtRetreatFloor = wanderRunNow.hp != null && window.ZI.retreatHpBelow ? window.ZI.retreatHpBelow(wanderRunNow.hp, window.ZI.maxHp ? window.ZI.maxHp() : 100, retreatRules.hpFloorPct) : false;
  var injuredCombatPose = encounter && !downed && closeCombatLoadout && !meleeEquipped && !!window.ZI.retreatHpBelow && window.ZI.retreatHpBelow(playerHp, hpMax, retreatRules.hpFloorPct);
  var injuredReturnPose = !downed && (wanderRunNow.withdrawing || wanderRunNow.retreatHold && (hpRetreatCause || lowHpAtRetreatFloor));
  var checkpointRestPose = !downed && wanderRunNow.resting && wanderRunNow.restAt === 'checkpoint';
  var recoveryFrame = checkpointRestPose ? restFrame : Math.floor(survivorFrame / 2) % 4;
  var recoveryBackgroundPosition = "".concat(recoveryFrame * 100 / 3, "% ").concat(checkpointRestPose ? 100 : 0, "%");
  React.useEffect(function () {
    if (!checkpointRestPose) {
      setRestFrame(0);
      return;
    }
    var t = setInterval(function () {
      return setRestFrame(function (f) {
        return (f + 1) % 8;
      });
    }, 250);
    return function () {
      return clearInterval(t);
    };
  }, [checkpointRestPose]);
  var walkingRef = React.useRef(true);
  walkingRef.current = survivorWalking;
  // Standing frame when not walking: guard stance in a fight (fist row 4 col 2, melee row 3 col 1), else mid-stride.
  var survivorCell = survivorWalking ? survivorFrame : encounter ? meleeEquipped ? 8 : 13 : 2;
  React.useEffect(function () {
    var frameDelay = Math.round(stepSeconds * 1000 / 4); // 4 frames per step, 8 per stride
    var t = setInterval(function () {
      if (walkingRef.current) setSurvivorFrame(function (f) {
        return (f + 1) % 8;
      });
    }, frameDelay);
    return function () {
      return clearInterval(t);
    };
  }, [stepSeconds]);

  // Restore checkpoint cursor from saved progress so resuming a tab doesn't
  // re-fire every checkpoint we already passed.
  React.useEffect(function () {
    if (scrollRef.lastCp == null) scrollRef.lastCp = Math.floor(scrollRef.current / CHECKPOINT_EVERY);
  }, []);

  // Mark the run active + claim authority while mounted; hand back to the
  // background engine on unmount. On mount, fold in anything the engine
  // resolved while we were away.
  // Policy encounters on the live screen: same shared step the offline engine runs.

  React.useEffect(function () {
    window.ZI.wanderMounted = true;
    var run = window.ZI.getWanderRun();
    window.ZI.syncWanderState({
      active: true
    }); // FX4: speed and heal strength are no longer written by the screen
    var a = run.awaySummary;
    if (a && (a.kills > 0 || a.dist > 5 || a.dmgTaken > 0)) {
      var mins = Math.floor((a.secs || 0) / 60),
        secs = Math.round((a.secs || 0) % 60);
      setCombatLog(function (prev) {
        return [].concat(_toConsumableArray(prev), [{
          type: 'init',
          text: "\uD83D\uDCE1 Patrol ran in the background ".concat(mins > 0 ? "".concat(mins, "m ") : '').concat(secs, "s \u2014 traveled ").concat(Math.round(a.dist), "m, ").concat(a.kills, " kills, +").concat(a.xp, " XP, +").concat(a.mats, " mats").concat(a.dmgTaken ? ", took ".concat(Math.round(a.dmgTaken), " damage (HP now ").concat(Math.round(run.hp || 0), ")") : '').concat(a.loot ? " \xB7 ".concat(a.loot, " item").concat(a.loot > 1 ? 's' : '', " added to your pack (bank it by returning to camp)") : '', ".")
        }], _toConsumableArray(window.ZI.returnReport ? window.ZI.returnReport(a).map(function (t) {
          return {
            type: 'init',
            text: '📋 ' + t
          };
        }) : []), _toConsumableArray(a.vehicle ? [{
          type: 'init',
          text: "\uD83D\uDE97 While away, you found a working ".concat(a.vehicle, "! Cargo unloading is now unlocked for route runs.")
        }] : []), _toConsumableArray(a.events ? [{
          type: 'init',
          text: "\u2696 ".concat(a.events, " policy encounter").concat(a.events > 1 ? 's' : '', " resolved while away").concat(a.retreats ? " \xB7 fell back to rest ".concat(a.retreats, "\xD7") : '', ":")
        }].concat(_toConsumableArray((a.eventLog || []).map(function (t) {
          return {
            type: 'info',
            text: '  ' + t
          };
        }))) : []));
      });
    }
    if (run.paused) {
      setCombatLog(function (prev) {
        return [].concat(_toConsumableArray(prev), [{
          type: 'enemy',
          text: "\u26A0 Survivor pinned down at ".concat(Math.round(run.scroll), "m \u2014 out of heals. Heal or Return to Base to resume.")
        }]);
      });
    }
    window.ZI.syncWanderState({
      awaySummary: null,
      paused: false
    });
    // R1: this screen counts as "watching" only while it is laid out and the page is foreground-visible. When watching
    // stops mid-prompt (tab hidden, page closing, leaving the screen) the prompt is cancelled and the withdrawal starts.
    var Z = window.ZI;
    Z._wanderWatchEl = wanderRootRef.current;
    var cancelHold = function cancelHold(keepAway) {
      var s = Z.getWanderRun();
      if (!s.retreatHold || !Z.retreatHoldResolve) return null;
      var away = keepAway ? s.awaySummary || Z.WanderSim.emptySummary() : null;
      var r = Z.retreatHoldResolve(s, 'cancel', away, []);
      if (keepAway) s.awaySummary = away;
      Z.saveWanderRun(s);
      return r;
    };
    var onVis = function onVis() {
      if (document.visibilityState !== 'visible') {
        var r = cancelHold(false);
        if (r && r.text) setCombatLog(function (prev) {
          return [].concat(_toConsumableArray(prev.slice(-60)), [{
            type: 'enemy',
            text: "\u21A9 ".concat(r.text, ".")
          }]);
        });
      }
    };
    var onHide = function onHide() {
      return cancelHold(true);
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('pagehide', onHide);
    return function () {
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pagehide', onHide);
      cancelHold(true);
      if (Z._wanderWatchEl === wanderRootRef.current) Z._wanderWatchEl = null;
      window.ZI.wanderMounted = false; // the background engine continues from the last live beat
    };
  }, []);

  // Keep the background engine fed with the live values it needs to continue.
  React.useEffect(function () {
    window.ZI.syncWanderState({
      hp: playerHp,
      kills: score.kills,
      xp: score.xp,
      mats: score.mats,
      healsUsed: healsUsed
    });
  }, [playerHp, score, healsUsed]);

  // Live beat (spec 9, 10): the shared simulation (WanderSim via WanderEngine.liveStep) advances movement,
  // encounters, policy events and rest. The screen holds no game rules; it only animates the results.
  React.useEffect(function () {
    var _show = function show(r) {
      if (r.kind === 'zombie') {
        var u = undeadTypes.find(function (x) {
          return x.bestiaryId === r.bestiaryId;
        }) || undeadTypes.find(function (x) {
          return x.name === r.enemy;
        }) || undeadTypes[0];
        var maxHp = r.enemyHp || u.hp,
          killed = r.outcome === 'win' || r.outcome === 'healed' || r.outcome === 'revived';
        var vis = _objectSpread(_objectSpread({}, u), {}, {
          hp: maxHp,
          currentHp: maxHp,
          id: Date.now() + Math.random()
        });
        if (r.outcome === 'win') {
          var burst = {
            id: Date.now() + Math.random(),
            kind: electricWeaponRef.current ? 'electric' : 'impact'
          };
          setPixelBursts(function (p) {
            return [].concat(_toConsumableArray(p.slice(-2)), [burst]);
          });
          setTimeout(function () {
            return setPixelBursts(function (p) {
              return p.filter(function (x) {
                return x.id !== burst.id;
              });
            });
          }, 520);
        }
        setEncounter(vis);
        setTimeout(function () {
          return setEncounter(function (e) {
            return e && e.id === vis.id ? null : e;
          });
        }, 3000); // display only: half the 6 s encounter gap
        // Replay the fight strike by strike: each survivor hit pops its own damage and lowers the zombie's HP bar.
        var hits = r.hits || [],
          gap = hits.length ? Math.min(350, 2200 / hits.length) : 0;
        var ehp = maxHp;
        var eTot = hits.reduce(function (s, h) {
          return s + (h.by !== 's' && h.d > 0 ? h.d : 0);
        }, 0);
        if (eTot > 0) setHpLag(function (l) {
          return l + eTot;
        });
        hits.forEach(function (h, i) {
          return setTimeout(function () {
            if (h.by === 's') {
              if (h.d > 0) {
                ehp = Math.max(0, ehp - h.d);
                var now = ehp;
                popDmg('zombie', h.d);
                setEncounter(function (e) {
                  return e && e.id === vis.id ? _objectSpread(_objectSpread({}, e), {}, {
                    currentHp: now
                  }) : e;
                });
                setZombieAnim(_defineProperty({}, vis.id, 'hit'));
                if (closeCombatRef.current) {
                  setSurvivorStriking(true);
                  setSurvivorStrikeId(function (n) {
                    return n + 1;
                  });
                  clearTimeout(survivorStrikeTimer.current);
                  survivorStrikeTimer.current = setTimeout(function () {
                    return setSurvivorStriking(false);
                  }, 1080);
                }
                setTimeout(function () {
                  return setZombieAnim({});
                }, 150);
              }
            } else if (h.d > 0) {
              popDmg('player', h.d);
              setHpLag(function (l) {
                return Math.max(0, l - h.d);
              });
              setZombieAnim(_defineProperty({}, vis.id, 'attack'));
              setTimeout(function () {
                return setZombieAnim(function (a) {
                  return a[vis.id] === 'attack' ? {} : a;
                });
              }, 380);
            }
            if (i === hits.length - 1 && killed) setEncounter(function (e) {
              return e && e.id === vis.id ? _objectSpread(_objectSpread({}, e), {}, {
                currentHp: 0
              }) : e;
            });
          }, 250 + i * gap);
        });
        var lines = [{
          type: 'spawn',
          text: "\u26A0 ".concat(r.enemy, " approaches!")
        }];
        if (r.outcome === 'escaped') lines.push({
          type: 'init',
          text: "\uD83D\uDCA8 Slipped past ".concat(r.enemy, ".")
        });
        if (r.evadeCountered) lines.push({
          type: 'enemy',
          text: "\uD83D\uDC41 ".concat(r.enemy, " isn't fooled by the getaway.")
        });
        if (r.dmgDealt) lines.push({
          type: 'player',
          text: "\u2192 You hit ".concat(r.enemy, " for ").concat(r.dmgDealt)
        });
        if (r.dmgTaken) {
          if (!hits.length) popDmg('player', r.dmgTaken);
          lines.push({
            type: 'enemy',
            text: "\u2190 ".concat(r.enemy, " hits you for ").concat(r.dmgTaken)
          });
        }
        if (r.outcome === 'healed') lines.push({
          type: 'player',
          text: "\u26D1 You patch yourself up mid-fight (".concat(r.healSource === 'base' ? 'base charge' : 'med kit', ").")
        });
        if (r.outcome === 'revived') lines.push({
          type: 'player',
          text: '💀 Revenant Infusion triggers — back on your feet.'
        });
        if (r.outcome === 'win' || r.outcome === 'healed') lines.push({
          type: 'kill',
          text: "\uD83D\uDC80 ".concat(r.enemy, " defeated! +").concat(r.xp, " XP \xB7 looted ").concat(r.loot ? r.loot.name : 'nothing')
        });
        if (r.toppedUp) lines.push({
          type: 'player',
          text: '⛑ Heal used to top up.'
        });
        if (r.worn && r.worn.length) lines.push({
          type: 'enemy',
          text: "\u26A0 Worn out: ".concat(r.worn.join(', '), " \u2014 repair in Stockpile \u2192 Storage before it helps again.")
        });
        if (r.outcome === 'forcedRetreat' && r.fr) lines.push({
          type: 'enemy',
          text: "\u2620 ".concat(window.ZI.forcedRetreatText(r.fr))
        });
        return lines;
      }
      if (r.kind === 'policy') {
        if (r.dmg) popDmg('player', r.dmg);
        return [{
          type: r.tone,
          text: r.text
        }];
      }
      if (r.kind === 'checkpoint') return [{
        type: 'player',
        text: "\u26FA Checkpoint reached at ".concat(r.mark, "m \u2014 safe rest stop secured.")
      }];
      if (r.kind === 'vehicle') return [{
        type: 'init',
        text: "\uD83D\uDE97 Found a working ".concat(r.name, "! Cargo unloading is now unlocked for route runs.")
      }];
      if (r.kind === 'km') return [{
        type: 'init',
        text: "\uD83D\uDDFA New Traversal zone unlocked: ".concat(r.name, " (").concat(r.meters, "m reached)")
      }];
      if (r.kind === 'resumed') return [{
        type: 'player',
        text: "\uD83D\uDECF Rested to ".concat(Math.round(r.hp), " HP").concat(r.stress != null ? ", stress ".concat(Math.round(r.stress)) : '', " \u2014 base charges refilled, back on patrol.")
      }];
      if (r.kind === 'prompt') return r.prompt.createdLive ? [{
        type: 'init',
        text: "\uD83C\uDFDA ".concat(r.prompt.name, " sighted \u2014 venture closer or move on.")
      }] : [];
      if (r.kind === 'discovery') {
        if (r.hpLoss) popDmg('player', r.hpLoss);
        return [{
          type: r.outcome === 'failed' ? 'enemy' : 'init',
          text: '🏚 ' + r.text
        }].concat(_toConsumableArray(r.ambush ? [{
          type: 'enemy',
          text: '⚠ Ambushed at the site!'
        }].concat(_toConsumableArray(_show(r.ambush))) : []));
      }
      if (r.kind === 'tooHeavy') return [{
        type: 'enemy',
        text: "\uD83C\uDF92 Too heavy \u2014 left ".concat(r.names.join(', '), " behind.")
      }];
      if (r.kind === 'withdrawn') return [{
        type: 'player',
        text: "\u21A9 Reached the checkpoint".concat(r.banked ? " \u2014 ".concat(r.banked, " item").concat(r.banked > 1 ? 's' : '', " banked") : '', ". Resting until HP \u2265 80%.")
      }];
      if (r.kind === 'ruleWithdraw') return [{
        type: 'enemy',
        text: "\u21A9 ".concat(r.text, ".")
      }];
      if (r.kind === 'retreatHold') return [{
        type: 'enemy',
        text: "\u26A0 ".concat(r.text)
      }];
      if (r.kind === 'retreatEvade') return [{
        type: r.ok ? 'player' : 'enemy',
        text: "".concat(r.ok ? '💨' : '↩', " ").concat(r.text, ".")
      }];
      if (r.kind === 'breaking') return [{
        type: 'enemy',
        text: "\uD83D\uDCA5 ".concat(window.ZI.forcedRetreatText(r))
      }];
      // BAL-A A8: walk back, Broken, return home and injury lines
      if (r.kind === 'broken') return [{
        type: 'enemy',
        text: "\uD83D\uDC94 ".concat(r.text)
      }];
      if (r.kind === 'brokenReleased') return [{
        type: 'player',
        text: "\uD83D\uDCAA ".concat(r.text)
      }];
      if (r.kind === 'walkGroup') return [{
        type: r.reaction === 'hostile' ? 'enemy' : r.reaction === 'friendly' ? 'player' : 'init',
        text: "\uD83D\uDC65 ".concat(r.text)
      }];
      if (r.kind === 'pursuer') {
        if (r.dmg) popDmg('player', r.dmg);
        return [{
          type: r.outcome === 'escaped' ? 'player' : 'enemy',
          text: "\uD83E\uDDDF ".concat(r.text)
        }];
      }
      if (r.kind === 'returned') return [{
        type: 'player',
        text: "\uD83E\uDDED ".concat(r.text)
      }];
      if (r.kind === 'injuryTreated') return [{
        type: 'player',
        text: "\uD83E\uDE79 ".concat(r.text)
      }];
      return [];
    };
    var t = setInterval(function () {
      if (downed) return;
      var results = window.ZI.WanderEngine.liveStep();
      var run = window.ZI.getWanderRun();
      scrollRef.current = run.scroll || 0;
      setScroll(run.scroll || 0);
      setPlayerHp(run.hp);
      setHealsUsed(run.healsUsed || 0);
      setScore({
        kills: run.kills || 0,
        xp: run.xp || 0,
        mats: run.mats || 0
      });
      setCarried(run.carried || []);
      if (run.checkpoints) {
        setCheckpoints(run.checkpoints);
        setLastCheckpoint(run.lastCheckpoint || 0);
      }
      if (!results.length) return;
      // Retreat-related events are always logged; other events are trimmed to the latest 6 per beat.
      var KEEP = new Set(['ruleWithdraw', 'withdrawn', 'breaking', 'retreatEvade', 'retreatHold', 'resumed', 'broken', 'brokenReleased', 'walkGroup', 'pursuer', 'returned', 'injuryTreated']);
      var keep = function keep(r) {
        return KEEP.has(r.kind) || r.kind === 'zombie' && r.outcome === 'forcedRetreat';
      };
      var recent = results.slice(-6),
        older = results.slice(0, -6),
        olderKeep = older.filter(keep);
      var lines = [].concat(_toConsumableArray(olderKeep), _toConsumableArray(recent)).flatMap(_show);
      var dropped = older.length - olderKeep.length;
      if (dropped > 0) lines.unshift({
        type: 'info',
        text: "\u2026 ".concat(dropped, " earlier event").concat(dropped > 1 ? 's' : '', " resolved")
      });
      setCombatLog(function (prev) {
        return [].concat(_toConsumableArray(prev.slice(-60)), _toConsumableArray(lines));
      });
    }, 1000);
    return function () {
      return clearInterval(t);
    };
  }, [downed]);

  // Auto-scroll log
  React.useEffect(function () {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [combatLog]);

  // ─── ENVIRONMENTAL ARTIFACTS (procedural, scroll-aware) ─────────────────
  // Generate stable layers of background, midground, foreground objects
  var artifacts = React.useMemo(function () {
    var seed = function seed(n) {
      return Math.sin(n * 12.9898) * 43758.5453 - Math.floor(Math.sin(n * 12.9898) * 43758.5453);
    };
    var items = [];
    // Background buildings (slow scroll)
    for (var i = 0; i < 20; i++) {
      var r = seed(i + 100);
      var r2 = seed(i + 200);
      items.push({
        layer: 'bg',
        kind: 'building',
        id: "bg-b-".concat(i),
        x: i * 280 + r * 60,
        y: 0,
        w: 80 + r2 * 90,
        h: 110 + r * 80,
        color: ['#1a1408', '#221a10', '#1e1610'][Math.floor(r * 3)],
        windows: Math.floor(r2 * 5) + 2
      });
    }
    // Midground: cars, debris piles
    for (var _i7 = 0; _i7 < 14; _i7++) {
      var _r = seed(_i7 + 300);
      var _r2 = seed(_i7 + 400);
      var types = ['car', 'debris', 'stoneChunk', 'barrel', 'tireStack'];
      items.push({
        layer: 'mid',
        kind: types[Math.floor(_r * types.length)],
        id: "mid-".concat(_i7),
        x: _i7 * 340 + _r * 100,
        variant: Math.floor(_r2 * 3)
      });
    }
    // Foreground: grass tufts, small stones, blood, bones
    for (var _i8 = 0; _i8 < 40; _i8++) {
      var _r3 = seed(_i8 + 500);
      var _r4 = seed(_i8 + 600);
      var _types = ['grass', 'stone', 'bloodPool', 'bone', 'rubble', 'sign'];
      items.push({
        layer: 'fg',
        kind: _types[Math.floor(_r3 * _types.length)],
        id: "fg-".concat(_i8),
        x: _i8 * 110 + _r3 * 50,
        variant: Math.floor(_r4 * 4)
      });
    }
    return items;
  }, []);

  // Command handler
  var runCommand = function runCommand(raw) {
    var cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    var parts = cmd.split(/\s+/);
    var verb = parts[0];
    var arg = parts[1];
    setCombatLog(function (prev) {
      return [].concat(_toConsumableArray(prev), [{
        type: 'cmd',
        text: "> ".concat(raw)
      }]);
    });
    var log = function log(text) {
      var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'info';
      return setCombatLog(function (prev) {
        return [].concat(_toConsumableArray(prev), [{
          type: type,
          text: text
        }]);
      });
    };

    // Batch 2B (spec 13.7): typed gameplay commands and the 60/day limit are retired; Heal, Scout, Push On and
    // Retreat are buttons. Only the UI helpers status, clear and help remain.
    if (verb === 'help' || verb === '?') {
      log('Use the buttons above for Heal, Scout, Push On, Retreat and Change Route. Typed commands: status, clear, help.', 'info');
    } else if (!['status', 'stat', 'clear'].includes(verb)) {
      log("\"".concat(verb, "\" is now a button above \u2014 typed commands are status, clear and help."), 'info');
    } else if (verb === 'status' || verb === 'stat') {
      log("HP: ".concat(Math.round(playerHp * 10) / 10, "/").concat(hpMax, " \xB7 Kills: ").concat(score.kills, " \xB7 XP: ").concat(score.xp, " \xB7 Mats: ").concat(score.mats), 'info');
      log("Distance: ".concat(Math.round(scrollRef.current), "m \xB7 Active enemy: ").concat((encounter === null || encounter === void 0 ? void 0 : encounter.name) || 'none'), 'info');
    } else if (verb === 'clear') {
      setCombatLog([{
        type: 'info',
        text: 'Log cleared'
      }]);
    } else {
      log("Unknown command: \"".concat(verb, "\" \u2014 type 'help' for list"), 'enemy');
    }
  };

  // Use an equipped consumable (one-shot — consumes the item from the loadout).
  var useConsumable = function useConsumable(slotId) {
    var id = loadout[slotId];
    if (!id) return;
    var it = window.ZI.getGearItem(id);
    if (!it) return;
    var e = it.effect || {};
    var msgs = [];
    if (e.heal) {
      var mx = window.ZI.maxHp ? window.ZI.maxHp() : 100;
      window.ZI.wanderAct(function (s) {
        s.hp = Math.min(mx, s.hp + e.heal);
      });
      setPlayerHp(function (p) {
        return Math.min(mx, p + e.heal);
      });
      if (downed && e.heal > 0) setDowned(false);
      msgs.push("+".concat(e.heal, " HP"));
    }
    var until = Date.now() + (e.durSec || 0) * 1000;
    if (e.speedPct) {
      window.ZI.addBuff({
        speedPct: e.speedPct,
        durationSec: e.durSec || 30
      });
      setBuffs(function (b) {
        return _objectSpread(_objectSpread({}, b), {}, {
          speed: {
            until: until,
            val: e.speedPct
          }
        });
      });
      msgs.push("+".concat(e.speedPct, "% speed"));
    } // FX4 (D-FX4b): shared buff store
    // B13: combat buffs go to the canonical buff store so the shared simulation (live and offline) applies them.
    if (e.dmgPct) {
      window.ZI.addBuff({
        dmgPct: e.dmgPct,
        durationSec: e.durSec || 30
      });
      setBuffs(function (b) {
        return _objectSpread(_objectSpread({}, b), {}, {
          dmg: {
            until: until,
            val: e.dmgPct
          }
        });
      });
      msgs.push("+".concat(e.dmgPct, "% dmg"));
    }
    if (e.armorAdd) {
      window.ZI.addBuff({
        armorAdd: e.armorAdd,
        durationSec: e.durSec || 30
      });
      setBuffs(function (b) {
        return _objectSpread(_objectSpread({}, b), {}, {
          armor: {
            until: until,
            val: e.armorAdd
          }
        });
      });
      msgs.push("+".concat(e.armorAdd, " armor"));
    }
    if (e.lootPct) {
      setBuffs(function (b) {
        return _objectSpread(_objectSpread({}, b), {}, {
          loot: {
            until: until,
            val: e.lootPct
          }
        });
      });
      msgs.push("+".concat(e.lootPct, "% loot"));
    }
    // §4/§5 — evade burst + flat XP-bonus buffs go to the global buff store
    // (read by escapeChance and the XP bus).
    if (e.evade) {
      window.ZI.addBuff({
        evade: e.evade,
        durationSec: e.durSec || 30
      });
      msgs.push("+".concat(e.evade, " escape"));
    }
    if (e.xpBonus) {
      window.ZI.addBuff({
        xpBonus: e.xpBonus,
        durationSec: e.durSec || 60
      });
      msgs.push("+".concat(e.xpBonus.amount, " ").concat(e.xpBonus.track, " XP/action"));
    }
    if (e.revive) {
      setReviveCharge(e.revive);
      msgs.push("revive primed (".concat(e.revive, " HP)"));
    }
    if (e.killEnemy && encounter) {
      setScore(function (s) {
        return {
          kills: s.kills + 1,
          xp: s.xp + encounter.xp,
          mats: s.mats + 3
        };
      });
      setCarried(function (c) {
        return [].concat(_toConsumableArray(c), [{
          name: "".concat(encounter.name, " salvage"),
          value: encounter.xp,
          rarity: 'Common'
        }]);
      });
      msgs.push("".concat(encounter.name, " cleared"));
      setEncounter(null);
    } else if (e.stun && encounter) {
      msgs.push("".concat(encounter.name, " stunned \u2014 slipped past"));
      setEncounter(null);
    }
    if (e.durSec && (e.speedPct || e.dmgPct || e.armorAdd || e.lootPct)) msgs.push("".concat(e.durSec, "s"));
    setCombatLog(function (prev) {
      return [].concat(_toConsumableArray(prev), [{
        type: 'player',
        text: "".concat(it.icon, " ").concat(it.name, " \u2014 ").concat(msgs.join(' · ') || 'used', ".")
      }]);
    });
    // Consume the item (remove from loadout). Revive items stay until they trigger.
    if (!e.revive) {
      var lo = window.ZI.getLoadout();
      lo[slotId] = null;
      window.ZI.saveLoadout(lo);
      setLoadout(_objectSpread({}, lo));
    }
  };

  // Equipped consumable slots for the HUD quick-use bar.
  var consumableSlots = window.ZI.GEAR_SLOTS.filter(function (s) {
    return s.accepts === 'consumable' && loadout[s.id];
  });

  // Durability drain: wear the active weapon + body armor per combat encounter.
  var wearEquipped = function wearEquipped() {
    var Z = window.ZI,
      lo = Z.getLoadout();
    var worn = [];
    var drainSlot = function drainSlot(slotId) {
      var it = lo[slotId] && Z.getGearItem(lo[slotId]);
      if (!it || !Z.itemHasDurability(it)) return;
      var before = Z.itemDurability(it);
      Z.applyWear(it, Z.itemDrainPerUse(it) * (Z.fortWearMult ? Z.fortWearMult() : 1));
      var after = Z.itemDurability(it);
      if (after && after.current <= 0 && before && before.current > 0) worn.push(it.name);
    };
    var weaponSlot = ['primary', 'secondary', 'melee'].find(function (sl) {
      return lo[sl];
    });
    if (weaponSlot) drainSlot(weaponSlot);
    drainSlot('vest');
    if (worn.length) setCombatLog(function (prev) {
      return [].concat(_toConsumableArray(prev), [{
        type: 'enemy',
        text: "\u26A0 Worn out: ".concat(worn.join(', '), " \u2014 repair in Stockpile \u2192 Storage before it helps again.")
      }]);
    });
    setLoadout(_objectSpread({}, lo)); // force re-resolve (durability lives in localStorage)
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: wanderRootRef,
    className: "screen-enter",
    "data-wander-layout": narrow ? 'stacked' : 'side',
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflowX: 'hidden',
      overflowY: narrow ? 'auto' : 'hidden',
      background: '#0a0808',
      position: 'relative'
    }
  }, wTut && /*#__PURE__*/React.createElement(WanderTutorial, {
    key: wTutStart,
    startAt: wTutStart,
    rootRef: wanderRootRef,
    onDone: function onDone() {
      window.ZI.setTutDone('zi_wander_tut_done');
      setWTut(false);
    }
  }), !wTut && /*#__PURE__*/React.createElement(window.TutStepMenu, {
    label: "Wandering",
    side: "right",
    inset: 12,
    zIndex: 30,
    steps: window.WANDER_TUT_STEPS.map(function (t) {
      return t.title;
    }),
    onPick: function onPick(n) {
      setWTutStart(n);
      setWTut(true);
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "wander-hud",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: '8px 12px',
      background: 'var(--bg3)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px 16px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      lineHeight: 1.2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 16,
      color: 'var(--amber)'
    }
  }, "WANDERING \u2014 ", zone ? zone.name.replace(/ [A-H]\d+$/, '') : 'Patrol Zone'), zone && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: '#7fe0ff'
    }
  }, "\u25C9 ", zoneCoord, zoneBiome ? " \xB7 ".concat(zoneBiome.name) : '')), setScreen && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setScreen('traversal');
    },
    title: "See where you are on the satellite map",
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      padding: '5px 10px',
      cursor: 'pointer',
      background: 'var(--bg4)',
      border: '1px solid #7fe0ff',
      color: '#7fe0ff'
    }
  }, "\uD83D\uDEF0 Map")), /*#__PURE__*/React.createElement("div", {
    "data-tut": "hp",
    style: {
      flex: '1 1 160px',
      minWidth: 140,
      maxWidth: 260
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text2)',
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("span", null, activeSurvivor.name, function () {
    // BAL-A D6: status icons (Broken first), effects in the tooltip
    var Z = window.ZI,
      br = Z.isBroken && Z.isBroken(),
      inj = Z.getInjury && Z.getInjury();
    if (!br && !inj) return null;
    var T = Z.BROKEN_TABLE;
    return /*#__PURE__*/React.createElement("span", {
      "data-status-icons": "1",
      style: {
        marginLeft: 6,
        display: 'inline-flex',
        gap: 4
      }
    }, br && /*#__PURE__*/React.createElement("span", {
      "data-status": "broken",
      title: "Broken \u2014 max HP \u2212".concat(Math.abs(T.maxHpPct), "%, ").concat(T.attackLossPct, "% of attacks falter, +").concat(T.dmgTakenPct, "% damage taken, ").concat(Math.abs(T.speedPct), "% slower. Each completed rest has a 1-in-6 chance to recover; after the third failed roll it recovers anyway and worn gear loses some durability."),
      style: {
        color: 'var(--red2)',
        cursor: 'help'
      }
    }, "\uD83D\uDC94"), inj && /*#__PURE__*/React.createElement("span", {
      "data-status": "injured",
      title: "Injured \u2014 combat and athletics \u2212".concat(Math.round(inj.pct * 100), "%. About ").concat(Math.max(1, Math.ceil(inj.remainingMs / 60000)), " min left (paused while the game isn't visible). A Field Bandage treats it."),
      style: {
        color: 'var(--amber)',
        cursor: 'help'
      }
    }, "\uD83E\uDE79"));
  }()), /*#__PURE__*/React.createElement("span", {
    style: {
      color: hpShown > 40 ? 'var(--green)' : 'var(--red2)'
    }
  }, "HP ", Math.round(hpShown), "/", hpMax)), /*#__PURE__*/React.createElement(ProgressBar, {
    value: hpShown / hpMax * 100,
    color: hpShown > 40 ? 'var(--green)' : 'var(--red2)',
    height: 7,
    animated: hpShown < 30
  })), /*#__PURE__*/React.createElement("div", {
    "data-tut": "haul",
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: 'var(--green)'
    }
  }, score.kills, " Kills \xB7 ", score.xp, " XP \xB7 ", score.mats, " Mats \xB7 \uD83C\uDF92 ", carried.length, " carried"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text2)',
      marginLeft: 'auto'
    }
  }, idleMode ? 'IDLE · auto-heal at 30% HP' : 'AUTO-COMBAT · initiative turns')), /*#__PURE__*/React.createElement("div", {
    "data-tut": "distance",
    style: {
      flex: '1 1 100%',
      minWidth: 0
    }
  }, function () {
    var lap = Math.floor(scroll / 100);
    var lapColors = ['var(--amber)', 'var(--green2)', 'var(--blue)', 'var(--purple)', 'var(--red2)', '#e0e0e0', '#f0d040'];
    var fillColor = lapColors[lap % lapColors.length];
    var prevColor = lap > 0 ? lapColors[(lap - 1) % lapColors.length] : null;
    // Logarithmic difficulty multiplier: x1.0 at lap 0, scaling up per lap.
    var mult = (1 + Math.log2(lap + 1) * 0.35).toFixed(1);
    return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text2)',
        letterSpacing: '0.06em'
      }
    }, "DISTANCE TRAVELED"), lap > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: fillColor
      }
    }, Array.from({
      length: Math.min(lap, 8)
    }).map(function (_, i) {
      return /*#__PURE__*/React.createElement("span", {
        key: i,
        style: {
          fontSize: 13
        }
      }, "\uD83D\uDC80");
    }), lap > 8 && /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text3)'
      }
    }, "+", lap - 8), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--red2)',
        fontWeight: 'bold',
        marginLeft: 2
      }
    }, "x", mult))), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 7,
        background: prevColor || 'var(--bg4)',
        borderRadius: 1,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "".concat(scroll % 100, "%"),
        height: '100%',
        background: fillColor,
        transition: 'width 0.1s linear'
      }
    })));
  }(), function () {
    var maxReached = Math.max(scroll, lastCheckpoint, CHECKPOINT_EVERY);
    var pct = function pct(m) {
      return Math.max(0, Math.min(100, m / maxReached * 100));
    };
    // RB1c: the distance bar is display only; checkpoints are markers, not travel buttons.
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text2)',
        marginBottom: 3
      }
    }, /*#__PURE__*/React.createElement("span", null, "0m"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--amber)'
      }
    }, Math.round(scroll), "m"), /*#__PURE__*/React.createElement("span", null, Math.round(maxReached), "m")), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        height: 12,
        background: 'var(--bg4)',
        borderRadius: 6,
        border: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        left: 0,
        top: 0,
        height: '100%',
        width: "".concat(pct(scroll), "%"),
        background: 'var(--accent, var(--amber))',
        borderRadius: 6,
        transition: 'width 0.12s linear'
      }
    }), checkpoints.map(function (m) {
      return /*#__PURE__*/React.createElement("div", {
        key: m,
        title: "Checkpoint at ".concat(m, "m"),
        style: {
          position: 'absolute',
          top: '50%',
          left: "".concat(pct(m), "%"),
          transform: 'translate(-50%,-50%)',
          width: 11,
          height: 11,
          borderRadius: '50%',
          background: 'var(--bg2)',
          boxSizing: 'border-box',
          border: "2px solid ".concat(scroll >= m ? 'var(--green)' : 'var(--text3)'),
          padding: 0,
          zIndex: 2
        }
      });
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: '50%',
        left: "".concat(pct(scroll), "%"),
        transform: 'translate(-50%,-50%)',
        width: 5,
        height: 18,
        background: 'var(--text)',
        borderRadius: 2,
        pointerEvents: 'none',
        zIndex: 3
      }
    })));
  }()), /*#__PURE__*/React.createElement("div", {
    "data-tut": "actions",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, function () {
    var P = window.ZI.POLICIES[policy.id];
    return /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        setPolMenu(function (o) {
          return !o;
        });
        setPolMsg(null);
      },
      title: "Standing policy \u2014 decides which encounters your survivor meets and how they resolve",
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        padding: '6px 11px',
        cursor: 'pointer',
        background: polMenu ? 'var(--bg4)' : 'transparent',
        border: "1px solid ".concat(P.color),
        color: P.color
      }
    }, P.icon, " ", P.name, " \u25BE");
  }(), polMenu && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setPolMenu(false);
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: 0,
      zIndex: 50,
      width: 300,
      padding: 8,
      background: 'var(--bg2)',
      borderColor: 'var(--amber)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--amber)',
      letterSpacing: '0.1em',
      marginBottom: 6
    }
  }, "STANDING POLICY"), Object.values(window.ZI.POLICIES).map(function (P) {
    var locked = P.id === 'heinous' && !window.ZI.heinousUnlocked();
    var on = P.id === policy.id;
    return /*#__PURE__*/React.createElement("button", {
      key: P.id,
      disabled: locked,
      onClick: function onClick() {
        return choosePolicy(P.id);
      },
      style: {
        display: 'block',
        width: '100%',
        textAlign: 'left',
        padding: '7px 9px',
        marginBottom: 4,
        cursor: locked ? 'not-allowed' : 'pointer',
        background: on ? 'var(--bg4)' : 'var(--bg3)',
        border: "1px solid ".concat(on ? P.color : 'var(--border)'),
        opacity: locked ? 0.55 : 1
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        color: P.color
      }
    }, P.icon, " ", P.name, on ? ' · active' : '', locked ? ' 🔒' : ''), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text2)',
        lineHeight: 1.4
      }
    }, locked ? 'Locked — it begins with blood at the Hearthguard\'s gate.' : P.desc));
  }), window.ZI.policyCooldownLeftMs() > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text2)',
      marginTop: 4
    }
  }, "Next change in ", Math.ceil(window.ZI.policyCooldownLeftMs() / 60000), " min (4 h cooldown)."), polMsg && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--red2)',
      marginTop: 4
    }
  }, polMsg)))), /*#__PURE__*/React.createElement(ActiveControls, {
    setScreen: setScreen,
    onLog: function onLog(text, type) {
      return setCombatLog(function (prev) {
        return [].concat(_toConsumableArray(prev.slice(-60)), [{
          type: type,
          text: text
        }]);
      });
    }
  }), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setMoveMode(function (m) {
        return m === 'walk' ? 'jog' : m === 'jog' ? 'run' : 'walk';
      });
    },
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      padding: '6px 11px',
      cursor: 'pointer',
      background: moveMode === 'run' ? 'rgba(200,97,42,0.2)' : moveMode === 'jog' ? 'rgba(76,175,125,0.15)' : 'var(--bg4)',
      color: moveMode === 'run' ? 'var(--red2)' : moveMode === 'jog' ? 'var(--green)' : 'var(--text3)',
      border: "1px solid ".concat(moveMode === 'run' ? 'var(--red2)' : moveMode === 'jog' ? 'var(--green)' : 'var(--border)')
    },
    title: "Athletics ".concat(ATHLETICS, "/10 \xB7 ").concat(moveSpeed.toFixed(1), " m/s")
  }, moveMode === 'walk' ? "\uD83D\uDEB6 Walk ".concat(moveSpeed.toFixed(1), "m/s") : moveMode === 'jog' ? "\uD83C\uDFC3 Jog ".concat(moveSpeed.toFixed(1), "m/s") : "\u26A1 Run ".concat(moveSpeed.toFixed(1), "m/s")), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setHudMenu(function (o) {
        return !o;
      });
    },
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      padding: '6px 11px',
      cursor: 'pointer',
      background: hudMenu ? 'var(--bg4)' : 'transparent',
      border: "1px solid ".concat(hudMenu ? 'var(--amber)' : 'var(--border)'),
      color: 'var(--text)'
    }
  }, "\u25BE More actions", consumableSlots.length ? " \xB7 ".concat(consumableSlots.length, " item").concat(consumableSlots.length > 1 ? 's' : '') : ''), hudMenu && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setHudMenu(false);
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "panel wander-menu",
    onClick: function onClick() {
      return setHudMenu(false);
    },
    style: {
      position: 'absolute',
      top: 'calc(100% + 4px)',
      left: 0,
      zIndex: 50,
      minWidth: 240,
      padding: 6,
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      background: 'var(--bg2)',
      borderColor: 'var(--amber)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setIdleMode(function (m) {
        return !m;
      });
    },
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      padding: '6px 11px',
      cursor: 'pointer',
      background: idleMode ? 'rgba(168,85,247,0.18)' : 'var(--bg4)',
      color: idleMode ? 'var(--purple)' : 'var(--text3)',
      border: "1px solid ".concat(idleMode ? 'var(--purple)' : 'var(--border)')
    }
  }, idleMode ? '◉ IDLE RUN' : '○ Idle Run'), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      // RB1a: the player's manual withdrawal, through the shared retreat rule (walk back to the last checkpoint,
      // one getaway roll, then rest). A second press while walking tries the getaway. RB1d: the pace is kept.
      var r = window.ZI.wanderAct(function (s) {
        return window.ZI.wanderRetreatPress(s);
      });
      if (!r) return;
      setCombatLog(function (prev) {
        return [].concat(_toConsumableArray(prev.slice(-60)), [r.ok === false ? {
          type: 'enemy',
          text: "\u26A0 ".concat(r.reason)
        } : {
          type: 'player',
          text: "\u23EA ".concat(r.text).concat(/[.)]$/.test(r.text) ? '' : '.')
        }]);
      });
    },
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      padding: '6px 11px',
      cursor: 'pointer',
      background: 'var(--bg4)',
      color: 'var(--amber)',
      border: '1px solid var(--amber)'
    },
    title: "Withdraw to the last checkpoint now (takes time; one getaway roll; then rest). Press again while withdrawing to try the getaway."
  }, function () {
    var wr = window.ZI.getWanderRun();
    return wr.withdrawing ? "\u23EA Run Back \xB7 ".concat(Math.round(wr.withdrawLeftM || 0), "m") : '⏪ Run Back';
  }()), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setShowGear(function (g) {
        return !g;
      });
    },
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      padding: '6px 11px',
      cursor: 'pointer',
      background: showGear ? 'rgba(74,128,224,0.18)' : 'var(--bg4)',
      color: showGear ? 'var(--blue)' : 'var(--text2)',
      border: "1px solid ".concat(showGear ? 'var(--blue)' : 'var(--border)')
    },
    title: "Equip crafted gear to modify survivor stats"
  }, "\uD83C\uDF92 Gear ", gearStats.filled > 0 ? "(".concat(gearStats.filled, ")") : ''), consumableSlots.map(function (s) {
    var it = window.ZI.getGearItem(loadout[s.id]);
    return /*#__PURE__*/React.createElement("button", {
      key: s.id,
      onClick: function onClick() {
        return useConsumable(s.id);
      },
      title: "Use ".concat(it.name, " \u2014 ").concat(it.desc),
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        padding: '6px 11px',
        cursor: 'pointer',
        background: 'rgba(80,200,120,0.12)',
        color: 'var(--green)',
        border: '1px solid var(--green)'
      }
    }, it.icon, " Use");
  })))))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: narrow ? '0 0 auto' : 1,
      display: 'flex',
      flexDirection: narrow ? 'column' : 'row',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: sceneRef,
    "data-tut": "scene",
    style: {
      flex: narrow ? '0 0 340px' : 1,
      height: narrow ? 340 : undefined,
      position: 'relative',
      overflow: 'hidden',
      background: "linear-gradient(180deg, #0a0808 0%, #1a1410 60%, #2a1e14 100%)"
    }
  }, /*#__PURE__*/React.createElement("style", null, "\n            @keyframes ziFistFrames { 0% { background-position:0% 66.667%; transform:translateX(0); } 12% { background-position:33.333% 66.667%; } 24% { background-position:66.667% 66.667%; } 36% { background-position:100% 66.667%; transform:translateX(2px); } 48% { background-position:0% 100%; transform:translateX(4px); } 60% { background-position:33.333% 100%; transform:translateX(3px); } 72% { background-position:66.667% 100%; transform:translateX(1px); } 86% { background-position:100% 100%; transform:translateX(0); } 100% { background-position:0% 66.667%; transform:translateX(0); } }\n            @keyframes ziInjuredMaleFistFrames { 0% { background-position:0% 0%; transform:translateX(0); } 13% { background-position:33.333% 0%; } 26% { background-position:66.667% 0%; } 39% { background-position:100% 0%; transform:translateX(2px); } 52% { background-position:0% 33.333%; transform:translateX(4px); } 65% { background-position:33.333% 33.333%; transform:translateX(3px); } 78% { background-position:66.667% 33.333%; transform:translateX(1px); } 91% { background-position:100% 33.333%; transform:translateX(0); } 100% { background-position:0% 0%; transform:translateX(0); } }\n            @keyframes ziInjuredFemaleFistFrames { 0% { background-position:0% 0%; transform:translateX(0); } 13% { background-position:33.333% 0%; } 26% { background-position:66.667% 0%; } 39% { background-position:100% 0%; transform:translateX(2px); } 52% { background-position:0% 100%; transform:translateX(4px); } 65% { background-position:33.333% 100%; transform:translateX(3px); } 78% { background-position:66.667% 100%; transform:translateX(1px); } 91% { background-position:100% 100%; transform:translateX(0); } 100% { background-position:0% 0%; transform:translateX(0); } }\n            @keyframes ziMeleeFrames { 0% { background-position:0% 66.667%; transform:translateX(0); } 12% { background-position:33.333% 66.667%; } 24% { background-position:66.667% 66.667%; transform:translateX(-1px); } 36% { background-position:100% 66.667%; transform:translateX(-2px); } 48% { background-position:0% 100%; transform:translateX(3px); } 60% { background-position:33.333% 100%; transform:translateX(5px); } 74% { background-position:66.667% 100%; transform:translateX(3px); } 88% { background-position:100% 100%; transform:translateX(1px); } 100% { background-position:0% 66.667%; transform:translateX(0); } }\n            @keyframes ziArcFlash { 0% { opacity:0; transform:scale(.7); } 20% { opacity:1; transform:scale(1); } 100% { opacity:0; transform:scale(1.12); } }\n            @keyframes ziWheelPulse { 0%,100% { opacity:.58; } 50% { opacity:1; } }\n            @keyframes ziWanderingSceneScroll { from { transform:translateX(0); } to { transform:translateX(-50%); } }\n            .zi-wandering-scene-track { position:absolute; inset:0 auto 0 0; display:flex; width:max-content; height:100%; animation:ziWanderingSceneScroll 54s linear infinite; will-change:transform; pointer-events:none; }\n            .zi-wandering-scene-track img { display:block; flex:none; width:auto; height:100%; max-width:none; image-rendering:pixelated; }\n            @keyframes ziTrailTextureScroll { from { background-position:0 0, 0 0; } to { background-position:-96px 0, 0 0; } }\n            .zi-travel-ground { position:absolute; z-index:3; left:0; right:0; bottom:0; height:12%; border-top:2px solid var(--zi-trail-edge); background-color:var(--zi-trail-mid); background-image:repeating-linear-gradient(90deg, transparent 0 13px, rgba(5,7,7,.25) 13px 16px, transparent 16px 39px, rgba(172,164,132,.12) 39px 43px, transparent 43px 71px),linear-gradient(180deg,var(--zi-trail-mid),var(--zi-trail-dark)); background-size:96px 100%,100% 100%; animation:ziTrailTextureScroll 3.4s linear infinite; image-rendering:pixelated; pointer-events:none; }\n            .zi-character-shadow { position:absolute; left:14%; bottom:0; width:72%; height:3px; background:#090b0b; box-shadow:0 0 4px rgba(0,0,0,.8); pointer-events:none; }\n            @keyframes ziThreatIdle { 0%,100% { filter:brightness(1); } 25% { filter:brightness(1.04); } 50% { filter:brightness(.98); } 75% { filter:brightness(1.02); } }\n            @keyframes ziThreatFlinch { 0% { translate:0 0; } 25% { translate:7px -1px; filter:brightness(1.7) sepia(.25); } 60% { translate:-2px 1px; } 100% { translate:0 0; } }\n            @keyframes ziThreatAttack { 0%,100% { transform:translateX(0); } 30% { transform:translateX(-20px); } 48% { transform:translateX(-24px); } 70% { transform:translateX(-10px); } }\n            @keyframes ziThreatAsh { 0% { opacity:1; filter:brightness(1); } 35% { opacity:.82; filter:brightness(1.8) sepia(.8); } 100% { opacity:0; filter:brightness(2) grayscale(1); translate:0 -9px; } }\n            @keyframes ziAshDrift { 0% { opacity:0; transform:translate(0,0) scale(.6); } 25% { opacity:.75; } 100% { opacity:0; transform:translate(var(--ash-x),-18px) scale(1.2); } }\n            .zi-threat-idle { animation:ziThreatIdle 1.6s steps(4,end) infinite; transform-origin:50% 100%; }\n            .zi-threat-hit { animation:ziThreatFlinch .18s steps(3,end) both; }\n            .zi-threat-attack { animation:ziThreatAttack .36s steps(5,end) both; transform-origin:50% 100%; }\n            .zi-threat-death { animation:ziThreatAsh .62s steps(5,end) both; }\n            .zi-ash-particle { position:absolute; width:3px; height:3px; background:#c4bda7; box-shadow:0 0 3px #968d7b; pointer-events:none; animation:ziAshDrift .58s steps(4,end) both; }\n            .zi-ash-particle:nth-child(1) { left:18%; bottom:24%; --ash-x:-6px; }\n            .zi-ash-particle:nth-child(2) { left:38%; bottom:31%; --ash-x:4px; animation-delay:.04s; }\n            .zi-ash-particle:nth-child(3) { left:57%; bottom:20%; --ash-x:-2px; animation-delay:.08s; }\n            .zi-ash-particle:nth-child(4) { left:74%; bottom:28%; --ash-x:7px; animation-delay:.02s; }\n            .zi-survivor-pixel { image-rendering:pixelated; shape-rendering:crispEdges; transform-origin:50% 100%; will-change:transform; }\n            .zi-survivor-pixel.pace-walk { transform:none; }\n            .zi-survivor-pixel.pace-jog { transform:rotate(-1.5deg); }\n            .zi-survivor-pixel.pace-run { transform:rotate(-3deg); }\n            .zi-survivor-pixel.recovery-pose { transform:none !important; }\n            .zi-survivor-art { position:absolute; inset:0; background-repeat:no-repeat; image-rendering:auto; transform-origin:50% 100%; }\n            .zi-recovery-art { image-rendering:pixelated; }\n            .zi-survivor-art.fist-strike { background-size:400% 400% !important; animation:ziFistFrames .76s steps(1,end) both; }\n            .zi-survivor-art.injured-fist-strike.male { background-size:400% 400% !important; animation:ziInjuredMaleFistFrames 1.04s steps(1,end) both; }\n            .zi-survivor-art.injured-fist-strike.female { background-size:400% 200% !important; animation:ziInjuredFemaleFistFrames 1.04s steps(1,end) both; }\n            .zi-survivor-art.melee-strike { background-size:400% 400% !important; animation:ziMeleeFrames .88s steps(1,end) both; }\n            .zi-pixel-burst { position:absolute; right:22%; bottom:39%; width:34px; height:34px; z-index:24; pointer-events:none; animation:ziArcFlash .5s steps(4,end) both; }\n            .zi-pixel-burst i { position:absolute; display:block; width:2px; height:2px; background:#b8ff9c; box-shadow:0 0 3px currentColor; }\n            .zi-pixel-burst i:nth-child(1) { left:14px; top:3px; } .zi-pixel-burst i:nth-child(2) { left:24px; top:11px; }\n            .zi-pixel-burst i:nth-child(3) { left:21px; top:24px; } .zi-pixel-burst i:nth-child(4) { left:7px; top:22px; }\n            .zi-pixel-burst i:nth-child(5) { left:3px; top:10px; } .zi-pixel-burst.electric i { color:#47dfff; background:#b7f8ff; }\n            .zi-wheel-pixel { filter:drop-shadow(0 0 2px #18f4e4); animation:ziWheelPulse .9s steps(2,end) infinite; }\n            @media (prefers-reduced-motion: reduce) { .zi-wandering-scene-track, .zi-travel-ground, .zi-survivor-pixel, .zi-survivor-art, .zi-pixel-burst, .zi-wheel-pixel, .zi-threat-idle, .zi-threat-hit, .zi-threat-attack, .zi-threat-death, .zi-ash-particle { animation:none !important; } }\n          "), /*#__PURE__*/React.createElement("div", {
    className: "zi-wandering-scene-track",
    "aria-hidden": "true",
    style: {
      zIndex: 0,
      animationDuration: "".concat((sceneHeight * bgAspect / groundSpeed).toFixed(2), "s"),
      animationPlayState: survivorWalking ? 'running' : 'paused'
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: sceneBackground,
    alt: "",
    draggable: false,
    onLoad: function onLoad(e) {
      var im = e.currentTarget;
      if (im.naturalHeight) setBgAspect(im.naturalWidth / im.naturalHeight);
    }
  }), /*#__PURE__*/React.createElement("img", {
    src: sceneBackground,
    alt: "",
    draggable: false
  })), !sceneBackground && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      backgroundImage: "\n              radial-gradient(circle at ".concat(scroll * 0.3 % 100, "% 20%, #d4c9b0 1px, transparent 2px),\n              radial-gradient(circle at ").concat((scroll * 0.5 + 30) % 100, "% 30%, #d4c9b0 1px, transparent 2px),\n              radial-gradient(circle at ").concat((scroll * 0.2 + 60) % 100, "% 40%, #d4c9b0 1px, transparent 2px)"),
      backgroundSize: '200px 200px',
      opacity: 0.3,
      pointerEvents: 'none'
    }
  }), !sceneBackground && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: '40%',
      left: 0,
      right: 0,
      height: '30%',
      background: "linear-gradient(180deg, transparent 0%, #1e1410 100%)",
      opacity: 0.5
    }
  }), !sceneBackground && artifacts.filter(function (a) {
    return a.layer === 'bg';
  }).map(function (b) {
    var left = (b.x - scroll * 0.4) % 5600;
    var adjLeft = left < -200 ? left + 5600 : left;
    return /*#__PURE__*/React.createElement("div", {
      key: b.id,
      style: {
        position: 'absolute',
        left: adjLeft,
        bottom: '40%',
        width: b.w,
        height: b.h,
        background: b.color,
        opacity: 0.85
      }
    }, Array.from({
      length: b.windows
    }).map(function (_, wi) {
      var lit = (wi + b.x) % 5 === 0;
      return /*#__PURE__*/React.createElement("div", {
        key: wi,
        style: {
          position: 'absolute',
          left: 8 + wi % 3 * 22,
          top: 14 + Math.floor(wi / 3) * 20,
          width: 8,
          height: 10,
          background: lit ? '#c8a040' : '#08060a',
          opacity: lit ? 0.7 : 1
        }
      });
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: -3,
        left: 0,
        right: 0,
        height: 3,
        background: '#000'
      }
    }));
  }), !sceneBackground && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '40%',
      background: "linear-gradient(180deg, #2a1e14 0%, #1a1208 100%)"
    }
  }), !sceneBackground && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '40%',
      backgroundImage: "repeating-linear-gradient(90deg, #2a1e14 0px, #2a1e14 30px, #3a2818 30px, #3a2818 32px)",
      transform: "translateX(".concat(-(scroll * 3) % 64, "px)"),
      opacity: 0.6
    }
  }), !sceneBackground && /*#__PURE__*/React.createElement("div", {
    className: "zi-travel-ground",
    "aria-hidden": "true",
    style: {
      animationDuration: "".concat((96 / groundSpeed).toFixed(2), "s"),
      animationPlayState: survivorWalking ? 'running' : 'paused',
      '--zi-trail-edge': sceneGround[0],
      '--zi-trail-mid': sceneGround[1],
      '--zi-trail-dark': sceneGround[2]
    }
  }), !sceneBackground && artifacts.filter(function (a) {
    return a.layer === 'mid';
  }).map(function (item) {
    var left = (item.x - scroll * 1.8) % 4800;
    var adjLeft = left < -200 ? left + 4800 : left;
    if (item.kind === 'car') {
      var colors = ['#3a2820', '#2a1e14', '#5a3424'];
      return /*#__PURE__*/React.createElement("div", {
        key: item.id,
        style: {
          position: 'absolute',
          left: adjLeft,
          bottom: '32%',
          width: 80,
          height: 36
        }
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 40 18",
        width: "80",
        height: "36",
        shapeRendering: "crispEdges",
        style: {
          imageRendering: 'pixelated'
        }
      }, /*#__PURE__*/React.createElement("rect", {
        x: "2",
        y: "6",
        width: "36",
        height: "8",
        fill: colors[(item.variant || 0) % 3]
      }), /*#__PURE__*/React.createElement("rect", {
        x: "6",
        y: "2",
        width: "28",
        height: "5",
        fill: colors[(item.variant || 0) % 3],
        opacity: "0.8"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "8",
        y: "3",
        width: "10",
        height: "4",
        fill: "#0a0a0a"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "22",
        y: "3",
        width: "10",
        height: "4",
        fill: "#0a0a0a"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "15",
        y: "3",
        width: "2",
        height: "2",
        fill: "#3a2820"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "4",
        y: "14",
        width: "8",
        height: "3",
        fill: "#0a0808"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "28",
        y: "14",
        width: "8",
        height: "3",
        fill: "#0a0808"
      }), hasWorkingVehicle && /*#__PURE__*/React.createElement("g", {
        className: "zi-wheel-pixel"
      }, /*#__PURE__*/React.createElement("rect", {
        x: "7",
        y: "14",
        width: "2",
        height: "2",
        fill: "#b5fff8"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "31",
        y: "14",
        width: "2",
        height: "2",
        fill: "#b5fff8"
      })), /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "6",
        width: "4",
        height: "2",
        fill: "#1a1008"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "10",
        y: "6",
        width: "3",
        height: "1",
        fill: "#1a1008"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "20",
        y: "8",
        width: "3",
        height: "2",
        fill: "#5a2810"
      })));
    }
    if (item.kind === 'debris') {
      return /*#__PURE__*/React.createElement("div", {
        key: item.id,
        style: {
          position: 'absolute',
          left: adjLeft,
          bottom: '32%',
          width: 48,
          height: 20
        }
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 24 10",
        width: "48",
        height: "20",
        shapeRendering: "crispEdges"
      }, /*#__PURE__*/React.createElement("rect", {
        x: "0",
        y: "5",
        width: "6",
        height: "5",
        fill: "#3a2818"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "6",
        y: "3",
        width: "5",
        height: "7",
        fill: "#4a3024"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "11",
        y: "6",
        width: "4",
        height: "4",
        fill: "#3a2818"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "15",
        y: "4",
        width: "5",
        height: "6",
        fill: "#4a3024"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "20",
        y: "6",
        width: "4",
        height: "4",
        fill: "#3a2818"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "6",
        width: "1",
        height: "1",
        fill: "#1a1008"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "8",
        y: "5",
        width: "1",
        height: "1",
        fill: "#1a1008"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "17",
        y: "6",
        width: "1",
        height: "1",
        fill: "#1a1008"
      })));
    }
    if (item.kind === 'stoneChunk') {
      return /*#__PURE__*/React.createElement("div", {
        key: item.id,
        style: {
          position: 'absolute',
          left: adjLeft,
          bottom: '32%',
          width: 32,
          height: 24
        }
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 16 12",
        width: "32",
        height: "24",
        shapeRendering: "crispEdges"
      }, /*#__PURE__*/React.createElement("polygon", {
        points: "2,12 0,8 4,4 8,2 12,3 14,8 12,12",
        fill: "#3a3830"
      }), /*#__PURE__*/React.createElement("polygon", {
        points: "3,11 1,8 4,5 8,3 11,4 13,8 11,11",
        fill: "#4a4838"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "5",
        y: "6",
        width: "2",
        height: "2",
        fill: "#5a5848"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "9",
        y: "7",
        width: "2",
        height: "2",
        fill: "#5a5848"
      })));
    }
    if (item.kind === 'barrel') {
      var c = ['#5a3424', '#3a4824', '#4a3a20'][(item.variant || 0) % 3];
      return /*#__PURE__*/React.createElement("div", {
        key: item.id,
        style: {
          position: 'absolute',
          left: adjLeft,
          bottom: '32%',
          width: 20,
          height: 28
        }
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 10 14",
        width: "20",
        height: "28",
        shapeRendering: "crispEdges"
      }, /*#__PURE__*/React.createElement("rect", {
        x: "1",
        y: "2",
        width: "8",
        height: "11",
        fill: c
      }), /*#__PURE__*/React.createElement("rect", {
        x: "1",
        y: "2",
        width: "8",
        height: "1",
        fill: "#0a0a0a"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "1",
        y: "6",
        width: "8",
        height: "1",
        fill: "#0a0a0a"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "1",
        y: "11",
        width: "8",
        height: "1",
        fill: "#0a0a0a"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "0",
        y: "3",
        width: "1",
        height: "9",
        fill: "#1a1008"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "9",
        y: "3",
        width: "1",
        height: "9",
        fill: "#1a1008"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "8",
        width: "2",
        height: "1",
        fill: "#1a1008"
      })));
    }
    if (item.kind === 'tireStack') {
      return /*#__PURE__*/React.createElement("div", {
        key: item.id,
        style: {
          position: 'absolute',
          left: adjLeft,
          bottom: '32%',
          width: 28,
          height: 24
        }
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 14 12",
        width: "28",
        height: "24",
        shapeRendering: "crispEdges"
      }, /*#__PURE__*/React.createElement("rect", {
        x: "1",
        y: "8",
        width: "12",
        height: "3",
        fill: "#0a0808"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "2",
        y: "5",
        width: "10",
        height: "3",
        fill: "#1a1408"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "2",
        width: "8",
        height: "3",
        fill: "#0a0808"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "4",
        y: "3",
        width: "6",
        height: "1",
        fill: "#3a2818"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "6",
        width: "8",
        height: "1",
        fill: "#3a2818"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "2",
        y: "9",
        width: "10",
        height: "1",
        fill: "#3a2818"
      })));
    }
    return null;
  }), !sceneBackground && artifacts.filter(function (a) {
    return a.layer === 'fg';
  }).map(function (item) {
    var left = (item.x - scroll * 3) % 4400;
    var adjLeft = left < -100 ? left + 4400 : left;
    if (item.kind === 'grass') {
      var heights = [4, 6, 8];
      var colors = ['#3a4830', '#4a5840', '#2a3820'];
      return /*#__PURE__*/React.createElement("div", {
        key: item.id,
        style: {
          position: 'absolute',
          left: adjLeft,
          bottom: '4%',
          width: 16,
          height: 12
        }
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 8 6",
        width: "16",
        height: "12",
        shapeRendering: "crispEdges"
      }, /*#__PURE__*/React.createElement("rect", {
        x: "1",
        y: 6 - heights[(item.variant || 0) % 3] / 1.5,
        width: "1",
        height: heights[(item.variant || 0) % 3] / 1.5,
        fill: colors[(item.variant || 0) % 3]
      }), /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: 6 - heights[(item.variant || 0) % 3],
        width: "1",
        height: heights[(item.variant || 0) % 3],
        fill: colors[(item.variant || 0) % 3]
      }), /*#__PURE__*/React.createElement("rect", {
        x: "5",
        y: 6 - heights[(item.variant || 0) % 3] / 1.3,
        width: "1",
        height: heights[(item.variant || 0) % 3] / 1.3,
        fill: colors[(item.variant || 0) % 3]
      })));
    }
    if (item.kind === 'stone') {
      return /*#__PURE__*/React.createElement("div", {
        key: item.id,
        style: {
          position: 'absolute',
          left: adjLeft,
          bottom: '5%',
          width: 12,
          height: 8
        }
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 6 4",
        width: "12",
        height: "8",
        shapeRendering: "crispEdges"
      }, /*#__PURE__*/React.createElement("polygon", {
        points: "0,4 1,1 3,0 5,1 6,4",
        fill: "#3a3830"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "2",
        y: "2",
        width: "1",
        height: "1",
        fill: "#4a4838"
      })));
    }
    if (item.kind === 'bloodPool') {
      return /*#__PURE__*/React.createElement("div", {
        key: item.id,
        style: {
          position: 'absolute',
          left: adjLeft,
          bottom: '3%',
          width: 28,
          height: 6
        }
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 14 3",
        width: "28",
        height: "6",
        shapeRendering: "crispEdges"
      }, /*#__PURE__*/React.createElement("ellipse", {
        cx: "7",
        cy: "2",
        rx: "6",
        ry: "1.5",
        fill: "#3a0808",
        opacity: "0.8"
      }), /*#__PURE__*/React.createElement("ellipse", {
        cx: "5",
        cy: "2",
        rx: "2",
        ry: "0.5",
        fill: "#5a0a0a"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "11",
        y: "2",
        width: "2",
        height: "1",
        fill: "#3a0808"
      })));
    }
    if (item.kind === 'bone') {
      return /*#__PURE__*/React.createElement("div", {
        key: item.id,
        style: {
          position: 'absolute',
          left: adjLeft,
          bottom: '5%',
          width: 20,
          height: 6
        }
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 10 3",
        width: "20",
        height: "6",
        shapeRendering: "crispEdges"
      }, /*#__PURE__*/React.createElement("rect", {
        x: "0",
        y: "0",
        width: "2",
        height: "3",
        fill: "#d0c0a0"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "2",
        y: "1",
        width: "6",
        height: "1",
        fill: "#d0c0a0"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "8",
        y: "0",
        width: "2",
        height: "3",
        fill: "#d0c0a0"
      })));
    }
    if (item.kind === 'rubble') {
      return /*#__PURE__*/React.createElement("div", {
        key: item.id,
        style: {
          position: 'absolute',
          left: adjLeft,
          bottom: '4%',
          width: 20,
          height: 10
        }
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 10 5",
        width: "20",
        height: "10",
        shapeRendering: "crispEdges"
      }, /*#__PURE__*/React.createElement("rect", {
        x: "0",
        y: "3",
        width: "3",
        height: "2",
        fill: "#3a2818"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "2",
        width: "2",
        height: "3",
        fill: "#4a3024"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "5",
        y: "3",
        width: "2",
        height: "2",
        fill: "#3a2818"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "7",
        y: "1",
        width: "3",
        height: "4",
        fill: "#4a3024"
      })));
    }
    if (item.kind === 'sign') {
      return /*#__PURE__*/React.createElement("div", {
        key: item.id,
        style: {
          position: 'absolute',
          left: adjLeft,
          bottom: '8%',
          width: 14,
          height: 20
        }
      }, /*#__PURE__*/React.createElement("svg", {
        viewBox: "0 0 7 10",
        width: "14",
        height: "20",
        shapeRendering: "crispEdges"
      }, /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "3",
        width: "1",
        height: "7",
        fill: "#2a1810"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "0",
        y: "0",
        width: "7",
        height: "4",
        fill: "#5a3024"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "0",
        y: "0",
        width: "7",
        height: "1",
        fill: "#7a4030"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "1",
        y: "2",
        width: "1",
        height: "1",
        fill: "#0a0a0a"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "3",
        y: "2",
        width: "1",
        height: "1",
        fill: "#0a0a0a"
      }), /*#__PURE__*/React.createElement("rect", {
        x: "5",
        y: "2",
        width: "1",
        height: "1",
        fill: "#0a0a0a"
      })));
    }
    return null;
  }), /*#__PURE__*/React.createElement("div", {
    className: "zi-survivor-pixel pace-".concat(moveMode).concat(injuredReturnPose || checkpointRestPose ? ' recovery-pose' : ''),
    "data-survivor-walking": survivorWalking ? '1' : '0',
    "data-survivor-pose": checkpointRestPose ? 'campfire-rest' : injuredReturnPose ? 'injured-return' : undefined,
    style: {
      position: 'absolute',
      left: '14%',
      bottom: closeCombatLoadout && !injuredReturnPose && !checkpointRestPose ? "calc(".concat(sceneGroundBottomPct, "% - ").concat(Math.round(actorSize * 0.031), "px)") : "".concat(sceneGroundBottomPct, "%"),
      width: injuredReturnPose ? Math.round(actorSize * 0.875) : checkpointRestPose ? Math.round(actorSize * 0.875) : injuredCombatPose ? Math.round(actorSize * (activeSurvivor.gender === 'female' ? 1 : 1.31)) : closeCombatLoadout ? Math.round(actorSize * (survivorWalking && !meleeEquipped ? 1 : survivorSheet.aspect)) : actorSize,
      height: actorSize,
      zIndex: 10
    }
  }, dmgPops.filter(function (p) {
    return p.who === 'player';
  }).map(function (p) {
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      className: "zi-dmg",
      style: {
        top: -14,
        marginLeft: p.dx
      }
    }, "-", p.n);
  }), (injuredReturnPose || checkpointRestPose) && !injuredCombatPose && /*#__PURE__*/React.createElement("div", {
    className: "zi-survivor-art zi-recovery-art",
    role: "img",
    "aria-label": checkpointRestPose ? 'Survivor resting by a campfire and poking the embers with a stick' : 'Injured survivor limping back to the checkpoint',
    style: {
      backgroundImage: "url(\"assets/wandering-characters/".concat(checkpointRestPose ? 'survivor-campfire-rest-v4' : 'survivor-injured-campfire-v1', ".png\")"),
      backgroundSize: '400% 200%',
      backgroundPosition: checkpointRestPose ? "".concat(recoveryFrame % 4 * 100 / 3, "% ").concat(Math.floor(recoveryFrame / 4) * 100, "%") : "".concat(recoveryBackgroundPosition),
      filter: 'drop-shadow(1px 0 #080a0d) drop-shadow(-1px 0 #080a0d) drop-shadow(0 1px #080a0d)'
    }
  }), injuredCombatPose && /*#__PURE__*/React.createElement("div", {
    key: "injured-".concat(survivorStrikeId),
    className: "zi-survivor-art".concat(survivorStriking ? " injured-fist-strike ".concat(activeSurvivor.gender === 'female' ? 'female' : 'male') : ''),
    role: "img",
    "aria-label": survivorStriking ? 'Injured survivor striking with the right fist while guarding with the left arm' : 'Injured survivor guarding during combat',
    style: {
      backgroundImage: "url(\"assets/wandering-characters/survivor-injured-strike-".concat(activeSurvivor.gender === 'female' ? 'female' : 'male', "-v1.png\")"),
      backgroundSize: activeSurvivor.gender === 'female' ? '400% 200%' : '400% 400%',
      backgroundPosition: '0% 0%',
      filter: 'drop-shadow(1px 0 #080a0d) drop-shadow(-1px 0 #080a0d) drop-shadow(0 1px #080a0d)'
    }
  }), !injuredReturnPose && !checkpointRestPose && !injuredCombatPose && closeCombatLoadout && /*#__PURE__*/React.createElement("div", {
    key: survivorStrikeId,
    className: "zi-survivor-art".concat(survivorStriking ? meleeEquipped ? ' melee-strike' : ' fist-strike' : ''),
    role: "img",
    "aria-label": meleeEquipped ? 'Survivor holding a melee weapon' : 'Unarmed survivor',
    style: {
      backgroundImage: "url(\"assets/wandering-characters/".concat(survivorWalking && !meleeEquipped ? 'survivor-walk-v5' : survivorSheet.file, ".png\")"),
      backgroundSize: survivorWalking && !meleeEquipped ? '400% 200%' : '400% 400%',
      backgroundPosition: survivorStriking ? undefined : survivorWalking && !meleeEquipped ? "".concat(survivorCell % 4 * 33.3333, "% ").concat(Math.floor(survivorCell / 4) * 100, "%") : "".concat(survivorCell % 4 * 33.3333, "% ").concat(Math.floor(survivorCell / 4) * 33.3333, "%"),
      filter: 'drop-shadow(1px 0 #080a0d) drop-shadow(-1px 0 #080a0d) drop-shadow(0 1px #080a0d)'
    }
  }), !injuredReturnPose && !checkpointRestPose && !closeCombatLoadout && /*#__PURE__*/React.createElement("svg", {
    viewBox: "0 0 36 48",
    width: "84",
    height: "112",
    shapeRendering: "crispEdges",
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'visible',
      imageRendering: 'pixelated',
      filter: 'drop-shadow(1px 0 #080a0d) drop-shadow(-1px 0 #080a0d) drop-shadow(0 1px #080a0d)'
    }
  }, window.ZI_ART.survivorRuns(weaponKind).map(function (r, i) {
    return /*#__PURE__*/React.createElement("rect", {
      key: i,
      x: r.x,
      y: r.y,
      width: r.w,
      height: "1",
      fill: r.c
    });
  }), encounter && (animFrame % 6 === 0 || animFrame % 6 === 2) && weaponFx.muzzle && /*#__PURE__*/React.createElement("g", null, /*#__PURE__*/React.createElement("rect", {
    x: weaponFx.muzzle[0],
    y: weaponFx.muzzle[1] - 1,
    width: "3",
    height: "3",
    fill: "#f0d060"
  }), /*#__PURE__*/React.createElement("rect", {
    x: weaponFx.muzzle[0] + 1,
    y: weaponFx.muzzle[1],
    width: "3",
    height: "1",
    fill: "#fff4b0"
  })))), encounter && (animFrame % 6 === 0 || animFrame % 6 === 2) && weaponFx.shot !== 'slash' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 'calc(14% + 70px)',
      right: 'calc(20% + 40px)',
      bottom: weaponKind === 'pistol' ? 'calc(12% + 64px)' : 'calc(12% + 56px)',
      height: 8,
      pointerEvents: 'none',
      zIndex: 11
    }
  }, weaponFx.shot === 'flame' ? /*#__PURE__*/React.createElement("div", {
    key: animFrame,
    className: "zi-flame",
    style: {
      position: 'absolute',
      left: 0,
      top: -4,
      height: 16,
      width: '100%',
      background: 'linear-gradient(90deg, #fff4b0, #f0a030 30%, #e0501a 70%, rgba(200,40,10,0))',
      borderRadius: '0 50% 50% 0',
      imageRendering: 'pixelated',
      filter: 'drop-shadow(0 0 2px #f46b24)'
    }
  }) : /*#__PURE__*/React.createElement("div", {
    key: animFrame,
    className: "zi-proj",
    style: {
      position: 'absolute',
      top: weaponFx.shot === 'spread' ? -3 : 0
    }
  }, weaponFx.shot === 'tracer' && /*#__PURE__*/React.createElement("div", {
    style: {
      width: 22,
      height: 2,
      background: 'linear-gradient(90deg, rgba(240,208,96,0), #fff4b0)'
    }
  }), weaponFx.shot === 'spread' && [0, 3, 6].map(function (o) {
    return /*#__PURE__*/React.createElement("div", {
      key: o,
      style: {
        width: 14,
        height: 2,
        marginTop: o ? 1 : 0,
        background: 'linear-gradient(90deg, rgba(240,208,96,0), #fff4b0)'
      }
    });
  }), (weaponFx.shot === 'bolt' || weaponFx.shot === 'arrow') && /*#__PURE__*/React.createElement("svg", {
    width: "30",
    height: "6",
    viewBox: "0 0 15 3",
    shapeRendering: "crispEdges"
  }, /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "1",
    width: "12",
    height: "1",
    fill: weaponFx.shot === 'bolt' ? '#c8c0a0' : '#8a6a3a'
  }), /*#__PURE__*/React.createElement("rect", {
    x: "12",
    y: "0",
    width: "2",
    height: "3",
    fill: "#55554f"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "14",
    y: "1",
    width: "1",
    height: "1",
    fill: "#55554f"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "0",
    width: "2",
    height: "1",
    fill: "#7a2c22"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "0",
    y: "2",
    width: "2",
    height: "1",
    fill: "#7a2c22"
  }))), electricWeapon && /*#__PURE__*/React.createElement("svg", {
    className: "zi-electric-arc",
    width: "36",
    height: "20",
    viewBox: "0 0 18 10",
    shapeRendering: "crispEdges",
    style: {
      position: 'absolute',
      left: 8,
      top: -7,
      overflow: 'visible',
      filter: 'drop-shadow(0 0 3px #30cfff)',
      animation: 'ziArcFlash .35s steps(3,end) infinite'
    }
  }, /*#__PURE__*/React.createElement("path", {
    d: "M1 6h4l2-4 2 6 2-4h5",
    fill: "none",
    stroke: "#8ef4ff",
    strokeWidth: "1"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M4 9h3l2-3 2 2h4",
    fill: "none",
    stroke: "#38caff",
    strokeWidth: "1",
    opacity: ".9"
  }))), pixelBursts.map(function (b) {
    return /*#__PURE__*/React.createElement("div", {
      key: b.id,
      className: "zi-pixel-burst ".concat(b.kind),
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null), /*#__PURE__*/React.createElement("i", null));
  }), encounter && function (_encounter$currentHp) {
    // Display only: bestiary entries with processed sprite art (zombie-sprites.js) show it with a
    // walking bob and sway; every other entry keeps the painted SVG.
    var _zombieMetricsFor = zombieMetricsFor(encounter),
      spr = _zombieMetricsFor.sprite,
      targetHeight = _zombieMetricsFor.targetHeight,
      zombieScale = _zombieMetricsFor.scale;
    var dead = ((_encounter$currentHp = encounter.currentHp) !== null && _encounter$currentHp !== void 0 ? _encounter$currentHp : encounter.hp) <= 0;
    var anim = zombieAnim[encounter.id];
    var threatClass = dead ? 'zi-threat-death' : anim === 'hit' ? 'zi-threat-hit' : anim === 'attack' ? 'zi-threat-attack' : 'zi-threat-idle';
    var wrap = {
      position: 'absolute',
      right: '20%',
      bottom: '12%',
      zIndex: 10,
      scale: String(zombieScale),
      transformOrigin: '50% 100%' // a string: React would turn a bare number into '1.6px', which browsers ignore
    };
    if (!spr) return /*#__PURE__*/React.createElement("div", {
      className: threatClass,
      style: wrap
    }, /*#__PURE__*/React.createElement("span", {
      className: "zi-character-shadow",
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("div", {
      dangerouslySetInnerHTML: {
        __html: window.ZI_ART.zombieSvg(encounter.type, animFrame % 6)
      }
    }), dead && /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, [0, 1, 2, 3].map(function (n) {
      return /*#__PURE__*/React.createElement("i", {
        key: n,
        className: "zi-ash-particle"
      });
    })));
    // Sprite art is uniformly scaled to the height assigned to its bestiary tier.
    return /*#__PURE__*/React.createElement("div", {
      className: threatClass,
      style: _objectSpread(_objectSpread({}, wrap), {}, {
        width: spr.w * 2
      }),
      "data-zombie-sprite": spr.file
    }, /*#__PURE__*/React.createElement("span", {
      className: "zi-character-shadow",
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("img", {
      src: spr.src,
      alt: "",
      width: spr.w * 2,
      height: spr.h * 2,
      draggable: false,
      style: {
        display: 'block',
        width: '100%',
        height: 'auto',
        imageRendering: 'pixelated',
        transformOrigin: '50% 100%',
        transform: window.ZI_ART.ZOMBIE_WALK_POSES[animFrame % 4]
      }
    }), dead && /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, [0, 1, 2, 3].map(function (n) {
      return /*#__PURE__*/React.createElement("i", {
        key: n,
        className: "zi-ash-particle"
      });
    })));
  }(), encounter && dmgPops.some(function (p) {
    return p.who === 'zombie';
  }) && function () {
    var m = zombieMetricsFor(encounter),
      zs = m.sprite;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        right: '20%',
        bottom: "calc(12% + ".concat(Math.round(m.targetHeight * 0.78), "px)"),
        width: zs ? zs.w * 2 * m.scale : 72 * m.scale,
        maxWidth: '80%',
        height: 1,
        zIndex: 20,
        pointerEvents: 'none'
      }
    }, dmgPops.filter(function (p) {
      return p.who === 'zombie';
    }).map(function (p) {
      return /*#__PURE__*/React.createElement("div", {
        key: p.id,
        className: "zi-dmg",
        style: {
          top: 0,
          marginLeft: p.dx
        }
      }, "-", p.n);
    }));
  }(), encounter && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: '22%',
      bottom: function () {
        var m = zombieMetricsFor(encounter);
        return "calc(12% + ".concat(m.targetHeight + 10, "px)");
      }(),
      // positioned above the tier-scaled sprite
      width: 80,
      zIndex: 12,
      background: 'rgba(0,0,0,0.7)',
      padding: 3
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--red2)',
      marginBottom: 2
    }
  }, encounter.name), /*#__PURE__*/React.createElement(ProgressBar, {
    value: ((_encounter$currentHp2 = encounter.currentHp) !== null && _encounter$currentHp2 !== void 0 ? _encounter$currentHp2 : encounter.hp) / encounter.hp * 100,
    color: "var(--red2)",
    height: 4
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text2)',
      marginTop: 2
    }
  }, Math.max(0, (_encounter$currentHp3 = encounter.currentHp) !== null && _encounter$currentHp3 !== void 0 ? _encounter$currentHp3 : encounter.hp), "/", encounter.hp, " HP \xB7 INIT ", encounter.init)), !encounter && !downed && function () {
    var rn = window.ZI.getWanderRun(),
      Z = window.ZI;
    var title = 'Wandering...',
      sub = null,
      ruleLine = null;
    if (rn.resting) {
      var mins = Z.WanderSim._restNeedMs ? Math.ceil(Z.WanderSim._restNeedMs(rn).need / 60000) : null;
      title = rn.restAt === 'checkpoint' ? 'Resting at the checkpoint' : 'Resting at Base';
      sub = "HP ".concat(Math.round(rn.hp || 0), "% \xB7 stress ").concat(Math.round(Z.getStress()), " \xB7 back on patrol").concat(mins != null && isFinite(mins) ? " in ~".concat(mins, " min") : '', " (HP \u2265 80%)");
      // RB2: the automatic retreat runs in the background; while resting, the scene shows the limits it uses.
      var rr = Z.getRetreatRules ? Z.getRetreatRules() : null;
      if (rr) {
        var parts = [!rr.hpOff && "HP ".concat(rr.hpFloorPct, "%"), !rr.loadIgnore && "load ".concat(rr.loadLimitPct, "%")].filter(Boolean); // BAL-A A5: no stress rule
        ruleLine = parts.length ? "Retreats at ".concat(parts.join(' · ')) : 'Automatic retreat is off';
      }
    } else if (rn.withdrawing) {
      title = 'Withdrawing...';
      sub = "".concat(Math.round(rn.withdrawLeftM || 0), " m to the checkpoint \xB7 the road is quiet; only slow crawlers follow");
    } // BAL-A A1
    else if (rn.retreatHold) title = 'On hold';
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: injuredReturnPose || checkpointRestPose ? '16%' : '50%',
        left: '50%',
        transform: 'translate(-50%,-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        textAlign: 'center',
        maxWidth: '80%'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-title)',
        fontSize: 14,
        color: 'var(--text3)',
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        animation: 'threat-pulse 2s ease-in-out infinite'
      }
    }, title), sub && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text2)'
      }
    }, sub), ruleLine && /*#__PURE__*/React.createElement("div", {
      "data-retreat-line": "1",
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text3)'
      }
    }, ruleLine));
  }(), downed && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 14,
      background: 'rgba(10,6,6,0.78)',
      zIndex: 30
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 26,
      color: 'var(--red2)',
      letterSpacing: '0.2em'
    }
  }, "\u2620 SURVIVOR DOWN"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)',
      textAlign: 'center',
      lineHeight: 1.6
    }
  }, "Recovered loot secured to the Recycler. Checkpoints & distance held.", /*#__PURE__*/React.createElement("br", null), carried.length > 0 ? "Carried out: ".concat(carried.length, " item").concat(carried.length !== 1 ? 's' : '', " (best: ").concat(carried[0].name, " \u25C6").concat(carried[0].value, ")") : 'Carried out: nothing'), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      // Bank XP; resume from the furthest checkpoint — DO NOT wipe
      // checkpoints or distance (monotonic progress held on downed).
      if (window.ZI.applyWanderingXp) window.ZI.applyWanderingXp(score.xp);
      var resume = lastCheckpoint || 0;
      setPlayerHp(100);
      setDowned(false);
      setScroll(resume);
      scrollRef.current = resume;
      scrollRef.lastCp = Math.floor(resume / CHECKPOINT_EVERY);
      window.ZI.syncWanderState({
        active: true,
        status: 'active',
        scroll: resume,
        hp: 100,
        lastTickAt: Date.now(),
        retreatSnoozes: {},
        retreatHold: null,
        withdrawCauses: null
      });
      setEncounter(null);
      setHealsUsed(0); // heals recover on Return to Base
      setKillCmdsUsed(0);
      // Loot was already banked to the Recycler at the moment of downing — no re-bank.
      setCombatLog([{
        type: 'info',
        text: "\u26D1 ".concat(activeSurvivor.name, " recovered. +").concat(score.xp, " XP banked. Resumed at checkpoint ").concat(resume, "m \u2014 journey progress held.")
      }]);
      setCarried([]);
      setScore({
        kills: 0,
        xp: 0,
        mats: 0
      });
    },
    style: {
      marginTop: 6,
      padding: '9px 22px',
      cursor: 'pointer',
      background: 'var(--bg3)',
      border: '1px solid var(--amber)',
      color: 'var(--amber)',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      letterSpacing: '0.12em',
      textTransform: 'uppercase'
    }
  }, "Return to Base"))), /*#__PURE__*/React.createElement("div", {
    "data-tut": "log",
    style: {
      width: narrow ? '100%' : 280,
      borderLeft: narrow ? 'none' : '1px solid var(--border)',
      borderTop: narrow ? '1px solid var(--border)' : 'none',
      background: 'var(--bg2)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title",
    style: {
      borderBottom: '1px solid var(--border)'
    }
  }, "Combat Log"), /*#__PURE__*/React.createElement("div", {
    ref: logRef,
    style: {
      flex: 1,
      maxHeight: narrow ? 240 : undefined,
      minHeight: narrow ? 120 : undefined,
      overflowY: 'auto',
      overflowX: 'hidden',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, combatLog.slice(-50).map(function (entry, i) {
    var colors = {
      info: 'var(--text2)',
      spawn: 'var(--red2)',
      init: 'var(--amber)',
      player: 'var(--green)',
      enemy: 'var(--red2)',
      kill: '#f0d060',
      cmd: 'var(--purple)'
    };
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: colors[entry.type] || 'var(--text2)',
        lineHeight: 1.4,
        whiteSpace: 'normal',
        overflowWrap: 'anywhere',
        minWidth: 0
      }
    }, entry.text);
  })), /*#__PURE__*/React.createElement("div", {
    "data-tut": "cmds",
    style: {
      borderTop: '1px solid var(--border)',
      padding: '6px 8px',
      background: 'var(--bg3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--purple)',
      fontWeight: 'bold'
    }
  }, '>'), /*#__PURE__*/React.createElement("input", {
    type: "text",
    value: cmdInput,
    onChange: function onChange(e) {
      return setCmdInput(e.target.value);
    },
    onKeyDown: function onKeyDown(e) {
      if (e.key === 'Enter') {
        runCommand(cmdInput);
        setCmdInput('');
      }
    },
    placeholder: "status \xB7 clear \xB7 help",
    style: {
      flex: 1,
      background: 'var(--bg4)',
      border: '1px solid var(--border2)',
      padding: '4px 7px',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text)',
      outline: 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text2)',
      marginTop: 6,
      lineHeight: 1.6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--purple)'
    }
  }, "cmds:"), " status \xB7 clear \xB7 help \u2014 actions are buttons above")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      borderTop: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      marginBottom: 5,
      letterSpacing: '0.1em'
    }
  }, "CURRENT SURVIVOR"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--amber)',
      marginBottom: 4
    }
  }, activeSurvivor.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement(InfoRow, {
    label: "ATK",
    value: activeSurvivor.atk,
    color: "var(--red2)"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "DEF",
    value: activeSurvivor.def,
    color: "var(--blue)"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "INIT",
    value: activeSurvivor.init,
    color: "var(--amber)"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "HP",
    value: "".concat(Math.round(hpShown * 10) / 10, "/").concat(hpMax),
    color: "var(--green)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      padding: '4px 40px 4px 6px',
      background: 'var(--bg4)',
      borderLeft: '2px solid var(--amber)',
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      lineHeight: 1.5
    }
  }, "Player attacks first unless undead has higher INIT. Combat resolves automatically.")))), showGear && function () {
    var filterCat = {
      ALL: null,
      WEAPONS: 'weapon',
      ARMOR: 'armor',
      GEAR: 'gear',
      ITEMS: 'consumable'
    }[gearFilter];
    var visibleStash = stash.map(function (id) {
      return window.ZI.getGearItem(id);
    }).filter(Boolean).filter(function (it) {
      return !filterCat || it.cat === filterCat;
    });
    var rc = function rc(r) {
      return window.ZI.RARITY_COLORS[r] || 'var(--text3)';
    };
    var equip = function equip(id) {
      var it = window.ZI.getGearItem(id);
      var r = window.ZI.equipGear(id, it.slot);
      if (r) {
        setLoadout(_objectSpread({}, r.loadout));
        setStash(_toConsumableArray(r.stash));
      }
    };
    var unequip = function unequip(slotId) {
      var r = window.ZI.unequipGear(slotId);
      setLoadout(_objectSpread({}, r.loadout));
      setStash(_toConsumableArray(r.stash));
    };
    var groups = [['weapon', 'WEAPONS'], ['armor', 'ARMOR'], ['gear', 'GEAR'], ['consumable', 'CONSUMABLES']];
    var StatBar = function StatBar(_ref37) {
      var label = _ref37.label,
        value = _ref37.value,
        color = _ref37.color;
      return /*#__PURE__*/React.createElement("div", {
        style: {
          marginBottom: 7
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          marginBottom: 2
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--text3)'
        }
      }, label), /*#__PURE__*/React.createElement("span", {
        style: {
          color: color
        }
      }, value)), /*#__PURE__*/React.createElement(ProgressBar, {
        value: value,
        color: color,
        height: 5
      }));
    };
    return /*#__PURE__*/React.createElement("div", {
      onClick: function onClick() {
        return setShowGear(false);
      },
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 80,
        background: 'rgba(0,0,0,0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 14
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: function onClick(e) {
        return e.stopPropagation();
      },
      className: "panel",
      style: {
        width: 'min(960px,96%)',
        height: 'min(780px,94%)',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg2)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-title",
      style: {
        display: 'flex',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", null, "Gear Loadout \u2014 equip to modify run stats"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setShowGear(false);
      },
      style: {
        marginLeft: 'auto',
        cursor: 'pointer',
        background: 'none',
        border: '1px solid var(--border)',
        color: 'var(--text2)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        padding: '2px 9px'
      }
    }, "\u2715 Close")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minHeight: 0,
        display: 'flex',
        gap: 8,
        padding: 8,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 172,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        padding: 10,
        flex: 1,
        overflow: 'auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        marginBottom: 8,
        letterSpacing: '0.1em'
      }
    }, "SURVIVOR \u2014 ", activeSurvivor.name), /*#__PURE__*/React.createElement(StatBar, {
      label: "Health",
      value: gearStats.displayHP,
      color: "var(--green)"
    }), /*#__PURE__*/React.createElement(StatBar, {
      label: "Armor",
      value: gearStats.armorRating,
      color: "var(--blue)"
    }), /*#__PURE__*/React.createElement(StatBar, {
      label: "Carry",
      value: gearStats.carryCapacity,
      color: "var(--amber)"
    }), /*#__PURE__*/React.createElement(StatBar, {
      label: "Speed",
      value: gearStats.speed,
      color: "#c894ff"
    }), /*#__PURE__*/React.createElement("div", {
      className: "divider",
      style: {
        margin: '8px 0'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5
      }
    }, /*#__PURE__*/React.createElement(InfoRow, {
      label: "Weapon Dmg",
      value: "+".concat(Math.round(gearStats.weaponDamage * 0.25)),
      color: "var(--red2)"
    }), /*#__PURE__*/React.createElement(InfoRow, {
      label: "Loot Find",
      value: "+".concat(gearStats.lootFind),
      color: "var(--green)"
    }), /*#__PURE__*/React.createElement(InfoRow, {
      label: "Slots Filled",
      value: "".concat(gearStats.filled, "/14"),
      color: "var(--text2)"
    })), !gearStats.hasWeapon && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 8,
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--red2)',
        lineHeight: 1.5
      }
    }, "\u26A0 No weapon equipped \u2014 combat damage relies on base stats only."))), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 280,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        padding: 10,
        flex: 1,
        overflow: 'auto'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        marginBottom: 8,
        letterSpacing: '0.1em'
      }
    }, "EQUIPMENT"), groups.map(function (_ref38) {
      var _ref39 = _slicedToArray(_ref38, 2),
        cat = _ref39[0],
        label = _ref39[1];
      return /*#__PURE__*/React.createElement("div", {
        key: cat,
        style: {
          marginBottom: 9
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          color: 'var(--text3)',
          marginBottom: 4
        }
      }, label), /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 4
        }
      }, window.ZI.GEAR_SLOTS.filter(function (s) {
        return s.accepts === cat;
      }).map(function (s) {
        var it = loadout[s.id] && window.ZI.getGearItem(loadout[s.id]);
        var dur = it && window.ZI.itemDurability ? window.ZI.itemDurability(it) : null; // PF17c (Sam, Oct 27): durability in the Wandering gear pop-up too
        var durPct = dur ? Math.max(0, Math.min(100, dur.current / dur.max * 100)) : 100;
        var durColor = durPct <= 20 ? '#f06a5a' : durPct <= 50 ? '#E0A93F' : '#3dcf8e';
        return /*#__PURE__*/React.createElement("div", {
          key: s.id,
          onClick: function onClick() {
            return it && unequip(s.id);
          },
          title: it ? 'Click to unequip' : '',
          style: {
            padding: '6px 8px',
            minHeight: 42,
            cursor: it ? 'pointer' : 'default',
            background: 'var(--bg3)',
            border: "1px solid ".concat(it ? rc(it.rarity) : 'var(--border)'),
            borderTop: it ? "2px solid ".concat(rc(it.rarity)) : '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }
        }, it ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
          style: {
            fontSize: 15
          }
        }, it.icon), /*#__PURE__*/React.createElement("div", {
          style: {
            minWidth: 0,
            flex: 1
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--text)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }
        }, it.name), /*#__PURE__*/React.createElement("div", {
          style: {
            fontFamily: 'var(--font-mono)',
            fontSize: 8,
            color: 'var(--text3)'
          }
        }, s.label), dur && /*#__PURE__*/React.createElement("div", {
          "data-slot-durability": "popup",
          style: {
            marginTop: 3
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: durColor,
            whiteSpace: 'nowrap'
          }
        }, "Durability ", Math.round(dur.current), "/", dur.max), /*#__PURE__*/React.createElement("div", {
          style: {
            width: '100%',
            height: 6,
            marginTop: 2,
            background: 'var(--bg4)',
            borderRadius: 2
          }
        }, /*#__PURE__*/React.createElement("div", {
          style: {
            height: '100%',
            width: "".concat(durPct, "%"),
            background: durColor,
            borderRadius: 2
          }
        }))))) : /*#__PURE__*/React.createElement("span", {
          style: {
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--text3)'
          }
        }, s.label));
      })));
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 4,
        padding: '8px 8px 0'
      }
    }, ['ALL', 'WEAPONS', 'ARMOR', 'GEAR', 'ITEMS'].map(function (t) {
      return /*#__PURE__*/React.createElement("button", {
        key: t,
        onClick: function onClick() {
          return setGearFilter(t);
        },
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          padding: '3px 9px',
          cursor: 'pointer',
          background: gearFilter === t ? '#2a2318' : 'transparent',
          border: "1px solid ".concat(gearFilter === t ? '#d4a84a' : 'var(--border)'),
          color: gearFilter === t ? '#f0b429' : 'var(--text3)'
        }
      }, t);
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)',
        alignSelf: 'center'
      }
    }, visibleStash.length, " in stash \xB7 click to equip")), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflow: 'auto',
        padding: 8,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))',
        gap: 4,
        alignContent: 'start'
      }
    }, visibleStash.map(function (it) {
      return /*#__PURE__*/React.createElement("div", {
        key: it.id,
        onClick: function onClick() {
          return equip(it.id);
        },
        title: ZI.describeGearItem(it),
        style: {
          padding: '6px 8px',
          cursor: 'pointer',
          background: 'var(--bg3)',
          border: '1px solid var(--border)',
          borderTop: "2px solid ".concat(rc(it.rarity)),
          display: 'flex',
          alignItems: 'center',
          gap: 7
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 15
        }
      }, it.icon), /*#__PURE__*/React.createElement("div", {
        style: {
          minWidth: 0,
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--text)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, it.name), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          color: rc(it.rarity)
        }
      }, it.rarity, " \xB7 ", it.cat), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 7,
          color: 'var(--text2)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, ZI.itemStatLines(it).slice(0, 2).join(' · ') || it.desc || it.cat)));
    }), visibleStash.length === 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        gridColumn: '1/-1',
        textAlign: 'center',
        padding: 24,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text3)'
      }
    }, "Nothing in this category. Craft gear or change the filter."))))), /*#__PURE__*/React.createElement("div", {
      style: {
        flexShrink: 0,
        maxHeight: 240,
        overflow: 'auto',
        padding: '0 8px 8px'
      }
    }, /*#__PURE__*/React.createElement(CarryPanel, null))));
  }());
};

// ─── ZOMBIE CODEX SCREEN ─────────────────────────────────────────────────────
window.ZombieCodexScreen = function ZombieCodexScreen() {
  var ZI = window.ZI;
  var _React$useState149 = React.useState(null),
    _React$useState150 = _slicedToArray(_React$useState149, 2),
    expanded = _React$useState150[0],
    setExpanded = _React$useState150[1];
  var _React$useState151 = React.useState('ALL'),
    _React$useState152 = _slicedToArray(_React$useState151, 2),
    tierFilter = _React$useState152[0],
    setTierFilter = _React$useState152[1];
  var _React$useState153 = React.useState(function () {
      try {
        return localStorage.getItem('zi_codex_cat') || 'all';
      } catch (e) {
        return 'all';
      }
    }),
    _React$useState154 = _slicedToArray(_React$useState153, 2),
    catFilter = _React$useState154[0],
    setCatFilter = _React$useState154[1];
  var pickCat = function pickCat(c) {
    setCatFilter(c);
    setExpanded(null);
    try {
      localStorage.setItem('zi_codex_cat', c);
    } catch (e) {}
  };
  var _React$useState155 = React.useState(''),
    _React$useState156 = _slicedToArray(_React$useState155, 2),
    search = _React$useState156[0],
    setSearch = _React$useState156[1];
  // Art in the open card walks with the same bob/sway as Wandering fights (4 poses, 250 ms each).
  var _React$useState157 = React.useState(0),
    _React$useState158 = _slicedToArray(_React$useState157, 2),
    codexFrame = _React$useState158[0],
    setCodexFrame = _React$useState158[1];
  React.useEffect(function () {
    if (expanded == null) return;
    var t = setInterval(function () {
      return setCodexFrame(function (f) {
        return (f + 1) % 4;
      });
    }, 250);
    return function () {
      return clearInterval(t);
    };
  }, [expanded]);
  var expandedRoster = ZI.BESTIARY_EXPANDED || []; // ids 49-108: art + description only, never spawned (bestiary-expanded.js)
  var devMode = catFilter === 'dev' && !!(ZI.isDevView && ZI.isDevView());
  var A = window.ZI_ART || {};
  // The zombie's art, exactly as Wandering shows it: processed sprite where one is mapped, else the painted SVG.
  var artBox = function artBox(z, dev) {
    var pose = (A.ZOMBIE_WALK_POSES || [])[codexFrame % 4] || 'none';
    var box = {
      minWidth: 160,
      maxWidth: '100%',
      minHeight: 150,
      flexShrink: 0,
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      gap: 10,
      padding: '12px 10px 14px',
      background: 'linear-gradient(180deg, #0a0808 0%, #1a1410 70%, #2a1e14 100%)',
      border: '1px solid var(--border)',
      overflow: 'hidden',
      boxSizing: 'border-box'
    };
    var keys = dev ? [z.art] : (A.ZOMBIE_SPRITE_MAP || {})[z.id] || [];
    var list = keys.map(function (k) {
      return (A.ZOMBIE_SPRITES || {})[k];
    }).filter(Boolean);
    if (list.length) return /*#__PURE__*/React.createElement("div", {
      "data-codex-art": list.map(function (s) {
        return s.file;
      }).join(','),
      style: box
    }, list.map(function (s) {
      return /*#__PURE__*/React.createElement("img", {
        key: s.file,
        src: s.src,
        alt: "",
        width: s.w * 2,
        height: s.h * 2,
        draggable: false,
        style: {
          display: 'block',
          minWidth: 0,
          maxWidth: 100 / list.length + '%',
          height: 'auto',
          imageRendering: 'pixelated',
          transformOrigin: '50% 100%',
          transform: pose
        }
      });
    }));
    var type = (z.base || z.name || 'shambler').toLowerCase().replace(/\s+/g, '');
    return /*#__PURE__*/React.createElement("div", {
      "data-codex-art": "svg",
      style: box
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        transformOrigin: '50% 100%',
        transform: pose,
        lineHeight: 0
      },
      dangerouslySetInnerHTML: {
        __html: A.zombieSvg ? A.zombieSvg(type, codexFrame) : ''
      }
    }));
  };
  var roster = ZI.fieldBestiary ? ZI.fieldBestiary() : ZI.BESTIARY || []; // Oct 29: the roster this save can meet
  var tiers = ZI.BESTIARY_TIERS || {};
  var discovered = ZI.getDiscovered && ZI.getDiscovered() || new Set();
  var isKnown = function isKnown(z) {
    return discovered.has(z.id) || discovered.has(z.base) || discovered.has((z.name || '').toLowerCase());
  };
  var discoveredCount = roster.filter(isKnown).length;
  var tierOrder = ['F', 'E', 'D', 'C', 'B', 'A', 'S', 'BOSS'];
  var tierLabel = function tierLabel(t) {
    return t === 'BOSS' ? 'SS' : t;
  }; // display name only; data key stays 'BOSS'
  // Category tabs — derived from each zombie's base type, traits and ability.
  var CATS = [{
    id: 'all',
    label: 'All',
    icon: '◈'
  }, {
    id: 'walker',
    label: 'Walkers',
    icon: '🧟'
  }, {
    id: 'runner',
    label: 'Runners',
    icon: '💨'
  }, {
    id: 'brute',
    label: 'Brutes',
    icon: '🛡'
  }, {
    id: 'hazard',
    label: 'Hazards',
    icon: '☣'
  }, {
    id: 'special',
    label: 'Specialists',
    icon: '✦'
  }, {
    id: 'elite',
    label: 'Elites',
    icon: '💀'
  }].concat(_toConsumableArray(ZI.isDevView && ZI.isDevView() ? [{
    id: 'dev',
    label: 'In development',
    icon: '🧪'
  }] : []));
  var catOf = function catOf(z) {
    var txt = [z.base, z.name, z.ability].concat(z.traits || []).join(' ');
    if (z.tier === 'S' || z.tier === 'BOSS') return 'elite';
    if (/toxic|acid|immolat|taint|hazard|ooz|gas|pressur|maggot|frost|conduct|fung|vomit/i.test(txt)) return 'hazard';
    if (/heavy|giant|armou?red|mutant|beefy|tough|strong|octopod|hexapod|hybrid|chrome|chained/i.test(txt)) return 'brute';
    if (/runner|nimble|dash|sprint|creeper|quadruped/i.test(txt)) return 'runner';
    if (/shambler/i.test(z.base || '')) return 'walker';
    return 'special';
  };
  var catCount = function catCount(id) {
    if (id === 'dev') return {
      total: expandedRoster.length,
      known: expandedRoster.length
    };
    var list = id === 'all' ? roster : roster.filter(function (z) {
      return catOf(z) === id;
    });
    return {
      total: list.length,
      known: list.filter(isKnown).length
    };
  };
  var filtered = (devMode ? expandedRoster : roster).filter(function (z) {
    return (devMode || catFilter === 'all' || catOf(z) === catFilter) && (tierFilter === 'ALL' || z.tier === tierFilter);
  });
  if (search.trim()) {
    var q = search.toLowerCase();
    filtered = filtered.filter(function (z) {
      return z.name.toLowerCase().includes(q) || (z.base || z.desc || '').toLowerCase().includes(q);
    });
  }
  var StatBar = function StatBar(_ref40) {
    var label = _ref40.label,
      value = _ref40.value,
      max = _ref40.max,
      color = _ref40.color,
      suffix = _ref40.suffix;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        width: 110,
        flexShrink: 0
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 6,
        background: 'var(--bg4)',
        borderRadius: 1,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "".concat(Math.min(100, value / max * 100), "%"),
        height: '100%',
        background: color
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text)',
        width: 46,
        textAlign: 'right',
        flexShrink: 0
      }
    }, value, suffix || ''));
  };

  // Danger index 1–5 derived from tier rank.
  var tierDanger = {
    F: 1,
    E: 2,
    D: 2,
    C: 3,
    B: 4,
    A: 4,
    S: 5,
    BOSS: 5
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "screen-enter",
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden',
      background: 'var(--bg)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 16px',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 18,
      color: 'var(--amber)',
      letterSpacing: '0.08em'
    }
  }, "BESTIARY CODEX"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)',
      marginTop: 2
    }
  }, discoveredCount, "/", roster.length, " threats catalogued \xB7 encounter zombies to unlock full field data", expandedRoster.length ? " \xB7 ".concat(expandedRoster.length, " more in development") : '')), /*#__PURE__*/React.createElement("input", {
    value: search,
    onChange: function onChange(e) {
      return setSearch(e.target.value);
    },
    placeholder: "search...",
    style: {
      background: 'var(--bg4)',
      border: '1px solid var(--border2)',
      padding: '5px 9px',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text)',
      outline: 'none',
      width: 160
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 2,
      marginTop: 10,
      flexWrap: 'wrap',
      borderBottom: '1px solid var(--border)'
    }
  }, CATS.map(function (c) {
    var on = catFilter === c.id;
    var n = catCount(c.id);
    return /*#__PURE__*/React.createElement("button", {
      key: c.id,
      onClick: function onClick() {
        return pickCat(c.id);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        cursor: 'pointer',
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        letterSpacing: '0.04em',
        background: on ? 'var(--bg3)' : 'transparent',
        color: on ? 'var(--amber)' : 'var(--text2)',
        border: '1px solid',
        borderColor: on ? 'var(--border) var(--border) var(--bg3)' : 'transparent',
        borderBottom: on ? '1px solid var(--bg3)' : '1px solid transparent',
        marginBottom: -1,
        borderTop: on ? '2px solid var(--amber)' : '2px solid transparent'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12
      }
    }, c.icon), /*#__PURE__*/React.createElement("span", null, c.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)'
      }
    }, n.known, "/", n.total));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginTop: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text2)',
      marginRight: 4,
      letterSpacing: '0.08em'
    }
  }, "TIER"), tierOrder.map(function (t) {
    var tc = tiers[t] ? tiers[t].color : 'var(--text3)';
    var on = tierFilter === t;
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      onClick: function onClick() {
        return setTierFilter(on ? 'ALL' : t);
      },
      title: on ? 'Click again to show all tiers' : '',
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        padding: '5px 12px',
        minWidth: 38,
        cursor: 'pointer',
        background: on ? tc : 'transparent',
        color: on ? '#0f0e0c' : tc,
        border: "1px solid ".concat(on ? tc : tc + '66'),
        fontWeight: on ? 'bold' : 'normal'
      }
    }, t === 'BOSS' ? 'SS Tier' : t);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 12,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, filtered.map(function (z) {
    var known = isKnown(z);
    var open = known && expanded === z.id;
    var tc = tiers[z.tier] && tiers[z.tier].color || 'var(--text3)';
    var danger = tierDanger[z.tier] || 1;
    if (devMode) {
      var openD = expanded === z.id;
      return /*#__PURE__*/React.createElement("div", {
        key: 'dev' + z.id,
        "data-codex-dev": z.id,
        onClick: function onClick() {
          return setExpanded(openD ? null : z.id);
        },
        style: {
          background: 'var(--bg2)',
          border: "1px solid ".concat(openD ? tc : 'var(--border)'),
          borderLeft: "3px solid ".concat(tc),
          cursor: 'pointer',
          overflow: 'hidden',
          flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '9px 14px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 30,
          textAlign: 'center',
          fontFamily: 'var(--font-title)',
          fontSize: 18,
          color: tc,
          flexShrink: 0
        }
      }, tierLabel(z.tier)), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          minWidth: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          flexWrap: 'wrap'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-title)',
          fontSize: 15,
          color: tc
        }
      }, z.name), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--text3)'
        }
      }, "#", z.id), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          color: 'var(--amber)',
          border: '1px solid var(--amber)',
          padding: '0 5px',
          letterSpacing: '0.08em'
        }
      }, "IN DEVELOPMENT")), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text2)',
          marginTop: 3,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, z.desc)), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          color: 'var(--text3)',
          width: 14,
          textAlign: 'center',
          flexShrink: 0
        }
      }, openD ? '−' : '+')), openD && /*#__PURE__*/React.createElement("div", {
        style: {
          padding: '10px 14px 14px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: 14,
          flexWrap: 'wrap',
          alignItems: 'flex-start'
        }
      }, artBox(z, true), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: '1 1 220px',
          minWidth: 0,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text2)',
          lineHeight: 1.7
        }
      }, /*#__PURE__*/React.createElement("div", null, z.desc), /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 8,
          color: 'var(--text3)'
        }
      }, "Art preview only. This zombie has no combat stats yet and doesn't appear in Wandering fights."))));
    }
    if (!known) {
      return /*#__PURE__*/React.createElement("div", {
        key: z.id,
        style: {
          background: 'var(--bg2)',
          border: "1px dashed ".concat(tc, "55"),
          overflow: 'hidden',
          opacity: 0.85,
          flexShrink: 0
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '9px 14px'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 30,
          textAlign: 'center',
          fontFamily: 'var(--font-title)',
          fontSize: 22,
          color: tc
        }
      }, "?"), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-title)',
          fontSize: 14,
          color: 'var(--text3)',
          letterSpacing: '0.2em'
        }
      }, "UNIDENTIFIED"), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--text3)',
          marginTop: 2
        }
      }, "Tier ", tierLabel(z.tier), " \xB7 no field data on record")), /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 13
        }
      }, "\uD83D\uDD12")));
    }
    return /*#__PURE__*/React.createElement("div", {
      key: z.id,
      onClick: function onClick() {
        return setExpanded(open ? null : z.id);
      },
      style: {
        background: 'var(--bg2)',
        borderLeft: "3px solid ".concat(tc),
        border: "1px solid ".concat(open ? tc : 'var(--border)'),
        borderLeftColor: tc,
        cursor: 'pointer',
        transition: 'border-color 0.15s',
        overflow: 'hidden',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '9px 14px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 30,
        textAlign: 'center',
        fontFamily: 'var(--font-title)',
        fontSize: 18,
        color: tc
      }
    }, tierLabel(z.tier)), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-title)',
        fontSize: 15,
        color: tc
      }
    }, z.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)'
      }
    }, z.base)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text2)',
        marginTop: 3
      }
    }, "HP ", z.hp, " \xB7 DMG ", z.dmg, " \xB7 SPD ", z.spd, " \xB7 ARM ", z.armor, " \xB7 ", z.xp, " XP")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 2,
        flexShrink: 0
      }
    }, [1, 2, 3, 4, 5].map(function (i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          width: 6,
          height: 14,
          borderRadius: 1,
          background: i <= danger ? tc : 'var(--bg4)'
        }
      });
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        color: 'var(--text3)',
        width: 14,
        textAlign: 'center',
        flexShrink: 0
      }
    }, open ? '−' : '+')), open && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '4px 14px 14px',
        borderTop: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 14,
        flexWrap: 'wrap',
        alignItems: 'flex-start',
        marginTop: 10
      }
    }, artBox(z, false), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: '1 1 300px',
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        margin: '0 0 10px'
      }
    }, (z.traits || []).map(function (t) {
      return /*#__PURE__*/React.createElement("span", {
        key: t,
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: tc,
          border: "1px solid ".concat(tc, "55"),
          padding: '2px 7px',
          borderRadius: 2
        }
      }, t);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0 24px'
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        marginBottom: 6,
        letterSpacing: '0.1em'
      }
    }, "COMBAT STATS"), /*#__PURE__*/React.createElement(StatBar, {
      label: "Health",
      value: z.hp,
      max: 350,
      color: tc
    }), /*#__PURE__*/React.createElement(StatBar, {
      label: "Damage",
      value: z.dmg,
      max: 37,
      color: "var(--red2)"
    }), /*#__PURE__*/React.createElement(StatBar, {
      label: "Speed",
      value: z.spd,
      max: 2,
      color: "var(--amber)",
      suffix: "\xD7"
    }), /*#__PURE__*/React.createElement(StatBar, {
      label: "Armor",
      value: z.armor,
      max: 8,
      color: "var(--blue)"
    }), /*#__PURE__*/React.createElement(StatBar, {
      label: "XP Reward",
      value: z.xp,
      max: 350,
      color: "var(--green)"
    })), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        marginBottom: 6,
        letterSpacing: '0.1em'
      }
    }, "FIELD DATA"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text2)',
        lineHeight: 1.7
      }
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text3)'
      }
    }, "Special:"), " ", z.ability), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text3)'
      }
    }, "Weakness:"), " ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--green)'
      }
    }, (z.weakness || []).join(' · '))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text3)'
      }
    }, "Loot:"), " ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--amber)'
      }
    }, z.loot)), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text3)'
      }
    }, "Biome:"), " ", z.biome)))), /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 10,
        padding: '7px 10px',
        background: 'var(--bg3)',
        borderLeft: "2px solid ".concat(tc),
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        fontStyle: 'italic',
        lineHeight: 1.5
      }
    }, "\uD83D\uDCCB ", z.notes)))));
  }), filtered.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: 40,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)'
    }
  }, "No threats match this filter.")));
};

// ─── RECYCLER SCREEN ─────────────────────────────────────────────────────────
window.RecyclerScreen = function RecyclerScreen() {
  var ZI = window.ZI;
  var ZI_MATERIALS = window.ZI_MATERIALS;
  var _React$useState159 = React.useState(function () {
      var starter = [{
        id: 1,
        name: 'Broken Pipe Rifle',
        tier: 1,
        rarity: 'Common',
        weight: 3,
        outputs: {
          metal: 6,
          wood: 2,
          electronics: 1
        }
      }, {
        id: 2,
        name: 'Tattered Hoodie',
        tier: 1,
        rarity: 'Common',
        weight: 1,
        outputs: {
          cloth: 5
        }
      }, {
        id: 3,
        name: 'Rusted Wrench',
        tier: 1,
        rarity: 'Common',
        weight: 1,
        outputs: {
          metal: 3
        }
      }, {
        id: 4,
        name: 'Old Radio',
        tier: 2,
        rarity: 'Uncommon',
        weight: 2,
        outputs: {
          electronics: 4,
          metal: 2,
          cloth: 1
        }
      }, {
        id: 5,
        name: 'Dead Battery',
        tier: 2,
        rarity: 'Uncommon',
        weight: 1,
        outputs: {
          electronics: 2,
          fuel: 1
        }
      }, {
        id: 6,
        name: 'Bandage Roll',
        tier: 1,
        rarity: 'Common',
        weight: 0.5,
        outputs: {
          cloth: 2,
          medical: 1
        }
      }, {
        id: 7,
        name: 'Scrap Hatchet',
        tier: 1,
        rarity: 'Common',
        weight: 2,
        outputs: {
          metal: 4,
          wood: 3
        }
      }, {
        id: 8,
        name: 'Broken Monitor',
        tier: 3,
        rarity: 'Rare',
        weight: 4,
        outputs: {
          electronics: 8,
          metal: 3,
          cloth: 1
        }
      }, {
        id: 9,
        name: 'Empty Gas Can',
        tier: 1,
        rarity: 'Common',
        weight: 1,
        outputs: {
          metal: 2,
          fuel: 1
        }
      }];
      // Prepend items gathered from Wandering runs so fresh loot recycles first.
      var wander = ZI.getWanderLoot && ZI.getWanderLoot() || [];
      return [].concat(_toConsumableArray(wander), starter);
    }),
    _React$useState160 = _slicedToArray(_React$useState159, 2),
    inventory = _React$useState160[0],
    setInventory = _React$useState160[1];

  // Queue lives in the persisted, always-on Job Engine (zi_jobs) — not local
  // state — so it survives tab switches, reloads, and settles offline.
  var _React$useState161 = React.useState(0),
    _React$useState162 = _slicedToArray(_React$useState161, 2),
    forceRerender = _React$useState162[1];
  React.useEffect(function () {
    var t = setInterval(function () {
      return forceRerender(function (n) {
        return n + 1;
      });
    }, 250);
    return function () {
      return clearInterval(t);
    };
  }, []);
  var queue = ZI.jobsByType('recycle');
  var gameMode = ZI.currentGameMode();
  var isCampMode = gameMode === 'camp';
  var _React$useState163 = React.useState(function () {
      return ZI.defaultRecyclerOperator();
    }),
    _React$useState164 = _slicedToArray(_React$useState163, 2),
    selectedOperator = _React$useState164[0],
    setSelectedOperator = _React$useState164[1];

  // Operators come from game/economy.js; camp survivors are only offered in Camp Leader mode.
  var operators = ZI.availableRecyclerOperators();
  var op = operators.find(function (o) {
    return o.id === selectedOperator;
  }) || operators[0];

  // Consolidated View (filter + sort), persisted across reloads.
  var _React$useState165 = React.useState(function () {
      return ZI.getRecyclerView();
    }),
    _React$useState166 = _slicedToArray(_React$useState165, 2),
    view = _React$useState166[0],
    setView = _React$useState166[1];
  var _React$useState167 = React.useState(false),
    _React$useState168 = _slicedToArray(_React$useState167, 2),
    viewOpen = _React$useState168[0],
    setViewOpen = _React$useState168[1];
  var setViewField = function setViewField(patch) {
    return setView(function (v) {
      var nv = _objectSpread(_objectSpread({}, v), patch);
      ZI.saveRecyclerView(nv);
      return nv;
    });
  };
  var visible = ZI.applyRecyclerView(inventory, view);
  var tally = ZI.tierTally(inventory);
  var activeFilterLabel = (ZI.RECYCLER_FILTERS.find(function (f) {
    return f.id === view.filter;
  }) || {}).label || 'All tiers';
  var sortLabel = {
    tier: 'Tier ▼',
    weight: 'Weight ▲',
    newest: 'Newest'
  }[view.sort] || 'Tier ▼';
  var addToQueue = function addToQueue(item) {
    // Recycling takes real time — weight drives duration, operator speed divides it.
    // Recycler structure level adds an opSpeed bonus (Camp Infrastructure).
    // The operator's output bonus is baked in at queue time (ZI.queueRecycle), so grant-on-completion
    // doesn't need to know which operator queued the job.
    var r = ZI.queueRecycle(item, op.id);
    if (r.ok) setInventory(function (inv) {
      return inv.filter(function (i) {
        return i.id !== item.id;
      });
    });
    // Note: the item is NOT removed from zi_wander_loot here — it's removed by
    // ZI.grantRecycleOutput on completion, so a cancelled job doesn't lose it.
  };
  var removeFromQueue = function removeFromQueue(jobId) {
    // Cancelling returns the item to the visible inventory (not lost).
    var job = queue.find(function (j) {
      return j.id === jobId;
    });
    ZI.cancelJob(jobId);
    if (job && job.meta && job.meta.item) setInventory(function (inv) {
      return [job.meta.item].concat(_toConsumableArray(inv));
    });
  };

  // Bulk: recycle whatever the current View filter shows (one bulk action).
  var recycleShown = function recycleShown() {
    visible.forEach(function (item) {
      return addToQueue(item);
    });
  };
  // Recycle All: every eligible item, through the same queue (ZI.recycleAll → ZI.queueRecycle → job engine).
  var recycleAll = function recycleAll() {
    var r = ZI.recycleAll(inventory, op.id);
    if (r.queued.length) setInventory(function (inv) {
      return inv.filter(function (i) {
        return !r.queued.includes(i.id);
      });
    });
  };
  var recyclableCount = inventory.filter(function (it) {
    return ZI.isRecyclable(it);
  }).length;
  // Processing itself runs in ZI.JobEngine (always-on, persisted) — no local
  // interval needed here; forceRerender above just keeps the bars live.

  return /*#__PURE__*/React.createElement("div", {
    className: "screen-enter",
    style: {
      display: 'flex',
      gap: 8,
      padding: 8,
      height: '100%',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minWidth: 0,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Recycler"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      marginLeft: 'auto'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setViewOpen(function (o) {
        return !o;
      });
    },
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      padding: '3px 10px',
      cursor: 'pointer',
      background: 'var(--bg4)',
      border: "1px solid ".concat(viewOpen ? 'var(--amber)' : 'var(--border)'),
      color: viewOpen ? 'var(--amber)' : 'var(--text2)',
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, "\u25BE VIEW ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text3)'
    }
  }, "\xB7 ", activeFilterLabel, " \xB7 ", sortLabel)), viewOpen && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setViewOpen(false);
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 40
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: '110%',
      right: 0,
      zIndex: 50,
      minWidth: 170,
      background: 'var(--bg2)',
      border: '1px solid var(--amber)',
      boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
      padding: 6,
      fontFamily: 'var(--font-mono)',
      fontSize: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text3)',
      fontSize: 8,
      padding: '2px 6px'
    }
  }, "\u2500\u2500 FILTER \u2500\u2500"), ZI.RECYCLER_FILTERS.map(function (f) {
    var unlocked = ZI.isFilterUnlocked(f);
    var on = view.filter === f.id;
    return /*#__PURE__*/React.createElement("div", {
      key: f.id,
      onClick: function onClick() {
        if (unlocked) {
          setViewField({
            filter: f.id
          });
          setViewOpen(false);
        }
      },
      title: unlocked ? '' : "Unlock via Scavenging",
      style: {
        padding: '4px 8px',
        cursor: unlocked ? 'pointer' : 'not-allowed',
        color: on ? 'var(--amber)' : unlocked ? 'var(--text2)' : 'var(--text3)',
        background: on ? 'var(--bg4)' : 'transparent',
        opacity: unlocked ? 1 : 0.75,
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10
      }
    }, on ? '•' : ''), f.label, !unlocked && /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto'
      }
    }, "\uD83D\uDD12"));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text3)',
      fontSize: 8,
      padding: '2px 6px',
      marginTop: 4
    }
  }, "\u2500\u2500 SORT \u2500\u2500"), [['tier', 'Tier (high→low)'], ['weight', 'Weight (light→heavy)'], ['newest', 'Newest banked']].map(function (_ref41) {
    var _ref42 = _slicedToArray(_ref41, 2),
      id = _ref42[0],
      label = _ref42[1];
    var on = view.sort === id;
    return /*#__PURE__*/React.createElement("div", {
      key: id,
      onClick: function onClick() {
        setViewField({
          sort: id
        });
        setViewOpen(false);
      },
      style: {
        padding: '4px 8px',
        cursor: 'pointer',
        color: on ? 'var(--amber)' : 'var(--text2)',
        background: on ? 'var(--bg4)' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        width: 10
      }
    }, on ? '•' : ''), label);
  })))), /*#__PURE__*/React.createElement("button", {
    onClick: recycleShown,
    disabled: visible.length === 0,
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      padding: '3px 10px',
      cursor: visible.length ? 'pointer' : 'not-allowed',
      background: visible.length ? 'rgba(200,169,110,0.12)' : 'var(--bg4)',
      border: "1px solid ".concat(visible.length ? 'var(--amber)' : 'var(--border)'),
      color: visible.length ? 'var(--amber)' : 'var(--text3)'
    }
  }, "Recycle shown \u25B8 ", visible.length), /*#__PURE__*/React.createElement("button", {
    onClick: recycleAll,
    disabled: recyclableCount === 0,
    title: "Queue every recyclable item (story items are never recycled)",
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      padding: '3px 10px',
      cursor: recyclableCount ? 'pointer' : 'not-allowed',
      background: recyclableCount ? 'rgba(200,169,110,0.12)' : 'var(--bg4)',
      border: "1px solid ".concat(recyclableCount ? 'var(--amber)' : 'var(--border)'),
      color: recyclableCount ? 'var(--amber)' : 'var(--text3)'
    }
  }, "Recycle All \u25B8 ", recyclableCount)), tally.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '4px 10px',
      borderBottom: '1px solid var(--border)',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "\u25C8"), tally.map(function (t) {
    return /*#__PURE__*/React.createElement("span", {
      key: t.key,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: t.color
      }
    }, t.count, " ", t.label);
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)'
    }
  }, visible.length, "/", inventory.length, " shown")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 6,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))',
      gap: 5,
      alignContent: 'start'
    }
  }, visible.map(function (item) {
    var tColor = ZI.tierColor(item);
    var tMeta = ZI.tierMeta(item);
    return /*#__PURE__*/React.createElement("div", {
      key: item.id,
      onClick: function onClick() {
        return addToQueue(item);
      },
      style: {
        padding: '8px 10px',
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderLeft: "3px solid ".concat(tColor),
        cursor: 'pointer',
        transition: 'all 0.15s'
      },
      onMouseEnter: function onMouseEnter(e) {
        return e.currentTarget.style.borderColor = '#e6c47e';
      },
      onMouseLeave: function onMouseLeave(e) {
        return e.currentTarget.style.borderColor = 'var(--border)';
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: tColor,
        fontSize: 11,
        flexShrink: 0
      },
      title: "Tier ".concat(tMeta.label)
    }, "\u25C6"), item.fromWandering && /*#__PURE__*/React.createElement("span", {
      title: "Recovered from a Wandering run",
      style: {
        color: 'var(--green)',
        flexShrink: 0
      }
    }, "\u25C8"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: tColor,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, item.name)), /*#__PURE__*/React.createElement(Tag, {
      color: tColor
    }, tMeta.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap',
        marginBottom: 3
      }
    }, Object.entries(item.outputs).map(function (_ref43) {
      var _ref44 = _slicedToArray(_ref43, 2),
        mat = _ref44[0],
        amt = _ref44[1];
      var m = ZI_MATERIALS[mat];
      return /*#__PURE__*/React.createElement("span", {
        key: mat,
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: (m === null || m === void 0 ? void 0 : m.color) || 'var(--text2)'
        }
      }, m === null || m === void 0 ? void 0 : m.icon, " ", amt, " ", m === null || m === void 0 ? void 0 : m.name);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: '#aab4bc'
      },
      title: "Drives recycle time, not value"
    }, "Weight: ", item.weight, "kg"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--amber)'
      }
    }, "+ Add")));
  }), inventory.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1/-1',
      textAlign: 'center',
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)'
    }
  }, "No salvage banked \u2014 send a survivor Wandering to fill the Recycler.")), inventory.length > 0 && visible.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1/-1',
      textAlign: 'center',
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)'
    }
  }, "Nothing matches this filter. Change the View menu to see more.")))), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flexShrink: 0,
      maxHeight: '40%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title",
    style: {
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Recycler Queue \u2014 ", op === null || op === void 0 ? void 0 : op.name, " operating"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)'
    }
  }, queue.length, " pending \xB7 \xD7", op === null || op === void 0 ? void 0 : op.bonusMult.toFixed(2), " bonus")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 6,
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, queue.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 14,
      textAlign: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)'
    }
  }, "Queue empty. Click items above to recycle.") : queue.map(function (job, idx) {
    var item = job.meta && job.meta.item;
    var pct = ZI.jobProgress(job) * 100;
    var isActive = job.status === 'active';
    return /*#__PURE__*/React.createElement("div", {
      key: job.id,
      style: {
        padding: '6px 10px',
        background: 'var(--bg3)',
        border: "1px solid ".concat(isActive ? 'var(--amber)' : 'var(--border)'),
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: 'var(--text)'
      }
    }, (item === null || item === void 0 ? void 0 : item.name) || job.refId), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: isActive ? 'var(--amber)' : 'var(--text3)'
      }
    }, isActive ? "".concat(Math.round(pct), "% \xB7 ").concat(ZI.jobRemaining(job), "s") : 'Queued')), isActive && /*#__PURE__*/React.createElement(ProgressBar, {
      value: pct,
      color: "var(--amber)",
      height: 3,
      animated: true
    })), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return removeFromQueue(job.id);
      },
      style: {
        background: 'rgba(139,58,42,0.15)',
        border: '1px solid var(--red)',
        color: 'var(--red2)',
        width: 20,
        height: 20,
        cursor: 'pointer',
        fontSize: 10
      }
    }, "\u2715"));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 280,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flexShrink: 0
    }
  }, !isCampMode && /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 10,
      flexShrink: 0,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text2)'
    }
  }, "RECYCLER OPERATOR \xB7 ", op.name, " (you). Assigning camp survivors needs Camp Leader mode."), isCampMode && /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 10,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 6
    }
  }, "RECYCLER OPERATOR"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, operators.map(function (o) {
    var classObj = ZI.CLASSES.find(function (c) {
      return c.id === o["class"];
    });
    var isSel = selectedOperator === o.id;
    return /*#__PURE__*/React.createElement("div", {
      key: o.id,
      onClick: function onClick() {
        return setSelectedOperator(o.id);
      },
      style: {
        padding: '6px 8px',
        cursor: 'pointer',
        background: isSel ? 'var(--bg4)' : 'var(--bg3)',
        border: "1px solid ".concat(isSel ? classObj === null || classObj === void 0 ? void 0 : classObj.color : 'var(--border)'),
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        transition: 'all 0.15s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: '50%',
        border: "2px solid ".concat(classObj === null || classObj === void 0 ? void 0 : classObj.color),
        background: 'var(--bg4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: classObj === null || classObj === void 0 ? void 0 : classObj.color
      }
    }, o.name[0]), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        color: 'var(--text)'
      }
    }, o.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)'
      }
    }, o.type, " \xB7 \xD7", o.speed.toFixed(1), " speed \xB7 \xD7", o.bonusMult.toFixed(2), " yield")));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Material Storage"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, Object.entries(ZI_MATERIALS).map(function (_ref45) {
    var _ref46 = _slicedToArray(_ref45, 2),
      key = _ref46[0],
      m = _ref46[1];
    var pct = m.current / m.max * 100;
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      style: {
        padding: '6px 8px',
        background: 'var(--bg3)',
        border: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14
      }
    }, m.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: 'var(--text)',
        flex: 1
      }
    }, m.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: m.color
      }
    }, m.current, "/", m.max)), /*#__PURE__*/React.createElement(ProgressBar, {
      value: pct,
      color: m.color,
      height: 4
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)',
        marginTop: 3
      }
    }, "Sources: ", m.sources.slice(0, 2).join(', ')));
  })))));
};

// ─── CARRY PANEL (Batch 1B): take / put back, pockets and kg ─────────────────
// Reads the one stash/carried/loadout store and re-renders on ZI.onInventoryChange.
window.CarryPanel = function CarryPanel() {
  var Z = window.ZI;
  var _React$useState169 = React.useState(0),
    _React$useState170 = _slicedToArray(_React$useState169, 2),
    tick = _React$useState170[1];
  React.useEffect(function () {
    return Z.onInventoryChange(function () {
      return tick(function (n) {
        return n + 1;
      });
    });
  }, []);
  var msg = Z.lastCarryMessage;
  React.useEffect(function () {
    if (!msg) return;
    var t = setTimeout(function () {
      return tick(function (n) {
        return n + 1;
      });
    }, 6100);
    return function () {
      return clearTimeout(t);
    };
  }, [msg && msg.at]);
  var t = Z.carryTotals(),
    here = Z.atBaseOrCamp(),
    carried = Z.getCarried();
  var counts = {};
  Z.getStash().forEach(function (id) {
    counts[id] = (counts[id] || 0) + 1;
  });
  var owned = Object.keys(counts).map(function (id) {
    return Z.getGearItem(id);
  }).filter(Boolean);
  var story = owned.filter(function (g) {
      return g.isStory;
    }),
    takeable = owned.filter(function (g) {
      return !g.isStory;
    });
  var showMsg = msg && Date.now() - msg.at < 6000;
  var over = t.overCapacity,
    pct = t.capacityKg > 0 ? Math.min(100, t.loadKg / t.capacityKg * 100) : 100;
  var mono = {
    fontFamily: 'var(--font-mono)'
  };
  var btn = function btn(label, onClick, title) {
    return /*#__PURE__*/React.createElement("button", {
      onClick: onClick,
      title: title,
      style: _objectSpread(_objectSpread({}, mono), {}, {
        fontSize: 11,
        padding: '2px 8px',
        cursor: 'pointer',
        background: 'var(--bg4)',
        border: "1px solid ".concat(here ? 'var(--amber)' : 'var(--border)'),
        color: here ? 'var(--amber)' : 'var(--text2)',
        whiteSpace: 'nowrap'
      })
    }, label);
  };
  var row = function row(g, right, sub) {
    return /*#__PURE__*/React.createElement("div", {
      key: g.id + (sub || ''),
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '4px 6px',
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderLeft: "2px solid ".concat(Z.tierColor(g.rarity))
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14
      }
    }, g.icon), /*#__PURE__*/React.createElement("span", {
      style: _objectSpread(_objectSpread({}, mono), {}, {
        fontSize: 11,
        color: 'var(--text)',
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      })
    }, g.name, sub ? ' ' + sub : ''), /*#__PURE__*/React.createElement("span", {
      style: _objectSpread(_objectSpread({}, mono), {}, {
        fontSize: 10,
        color: 'var(--text2)'
      })
    }, Z.itemWeight(g), " kg \xB7 ", Z.itemPocketSize(g), " p"), right);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 0,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title",
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Carrying"), /*#__PURE__*/React.createElement("span", {
    style: _objectSpread(_objectSpread({}, mono), {}, {
      fontSize: 11,
      color: t.pocketsUsed >= t.pocketsMax && t.pocketsMax > 0 ? 'var(--amber)' : 'var(--text)'
    })
  }, "Pockets ", t.pocketsUsed, "/", t.pocketsMax), /*#__PURE__*/React.createElement("span", {
    style: _objectSpread(_objectSpread({}, mono), {}, {
      fontSize: 11,
      color: over ? 'var(--red2)' : 'var(--text)'
    })
  }, "Load ", t.loadKg, "/", t.capacityKg, " kg", over ? ' · over capacity (limit ' + t.hardLimitKg + ' kg)' : ''), /*#__PURE__*/React.createElement("span", {
    style: _objectSpread(_objectSpread({}, mono), {}, {
      fontSize: 11,
      marginLeft: 'auto',
      color: here ? 'var(--green)' : 'var(--text2)'
    })
  }, here ? '● At base/camp: you can repack' : '○ In the field: repack at base or camp')), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 10px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      background: 'var(--bg4)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      width: pct + '%',
      background: over ? 'var(--red2)' : 'var(--amber)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: _objectSpread(_objectSpread({}, mono), {}, {
      fontSize: 10,
      color: 'var(--text2)',
      marginTop: 3
    })
  }, "Gear ", t.gearKg, " kg \xB7 carried ", t.carriedKg, " kg \xB7 story ", t.storyKg, " kg \xB7 haul ", t.haulKg, " kg")), showMsg && /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: _objectSpread(_objectSpread({
      margin: '6px 10px 0',
      padding: '5px 8px',
      border: '1px solid var(--red2)',
      background: 'rgba(220,80,60,0.1)'
    }, mono), {}, {
      fontSize: 12,
      color: 'var(--text)'
    })
  }, "\u26A0 ", msg.text), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      padding: 10,
      flexWrap: 'wrap',
      alignItems: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 240px',
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: _objectSpread(_objectSpread({}, mono), {}, {
      fontSize: 10,
      color: 'var(--text2)',
      letterSpacing: '0.08em'
    })
  }, "ON YOU (", carried.length + story.length, ")"), carried.map(function (e, i) {
    var g = Z.getGearItem(e.id);
    return g && row(g, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 4
      }
    }, btn('Put back', function () {
      return Z.putBackToStash(e.id, 1);
    }, 'Return one to the stash'), e.qty > 1 && btn('All', function () {
      return Z.putBackToStash(e.id, e.qty);
    }, 'Return the whole stack')), e.qty > 1 ? '×' + e.qty : String(i));
  }), story.map(function (g) {
    return row(g, /*#__PURE__*/React.createElement("span", {
      style: _objectSpread(_objectSpread({}, mono), {}, {
        fontSize: 10,
        color: 'var(--amber)'
      })
    }, "On you (story)"), '·s');
  }), !carried.length && !story.length && /*#__PURE__*/React.createElement("div", {
    style: _objectSpread(_objectSpread({}, mono), {}, {
      fontSize: 11,
      color: 'var(--text2)'
    })
  }, "Nothing carried yet.")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 240px',
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: _objectSpread(_objectSpread({}, mono), {}, {
      fontSize: 10,
      color: 'var(--text2)',
      letterSpacing: '0.08em'
    })
  }, "IN STASH"), takeable.map(function (g) {
    return row(g, btn('Carry', function () {
      return Z.takeToCarried(g.id, 1);
    }, 'Take one from the stash'), counts[g.id] > 1 ? '×' + counts[g.id] : '');
  }), !takeable.length && /*#__PURE__*/React.createElement("div", {
    style: _objectSpread(_objectSpread({}, mono), {}, {
      fontSize: 11,
      color: 'var(--text2)'
    })
  }, "Stash is empty."))));
};

// ─── STOCKPILE SCREEN (parent tab; Recycler lives in its sub-menu) ───────────
window.StockpileScreen = function StockpileScreen() {
  var _ref47 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
    _ref47$initialTab = _ref47.initialTab,
    initialTab = _ref47$initialTab === void 0 ? 'recycler' : _ref47$initialTab,
    _ref47$preparationPan = _ref47.preparationPanel,
    preparationPanel = _ref47$preparationPan === void 0 ? null : _ref47$preparationPan,
    onNavigate = _ref47.onNavigate;
  var ZI_MATERIALS = window.ZI_MATERIALS;
  var Z = window.ZI;
  var _React$useState171 = React.useState(initialTab === 'loadout' || initialTab === 'storage' ? initialTab : 'recycler'),
    _React$useState172 = _slicedToArray(_React$useState171, 2),
    sub = _React$useState172[0],
    setSub = _React$useState172[1];
  React.useEffect(function () {
    setSub(initialTab === 'loadout' || initialTab === 'storage' ? initialTab : 'recycler');
  }, [initialTab]);
  var _React$useState173 = React.useState(function () {
      return Z.getLoadout();
    }),
    _React$useState174 = _slicedToArray(_React$useState173, 2),
    loadout = _React$useState174[0],
    setLoadout = _React$useState174[1];
  var _React$useState175 = React.useState(function () {
      return Z.getStash();
    }),
    _React$useState176 = _slicedToArray(_React$useState175, 2),
    stash = _React$useState176[0],
    setStash = _React$useState176[1];
  // Re-read the one stash/loadout store whenever it changes (crafts finishing, equips on another screen).
  React.useEffect(function () {
    var queued = null;
    var refresh = function refresh() {
      if (queued !== null) return;
      queued = setTimeout(function () {
        queued = null;
        setStash(Z.getStash());
        setLoadout(Z.getLoadout());
      }, 0);
    };
    var unsubscribe = Z.onInventoryChange(refresh),
      timer = setInterval(refresh, 1000);
    return function () {
      unsubscribe();
      clearInterval(timer);
      if (queued !== null) clearTimeout(queued);
    };
  }, []);
  var _React$useState177 = React.useState('ALL'),
    _React$useState178 = _slicedToArray(_React$useState177, 2),
    gearFilter = _React$useState178[0],
    setGearFilter = _React$useState178[1];
  var pending = Z.getWanderLoot && Z.getWanderLoot().length || 0;
  var stashCount = stash.length;
  var subTabs = [['recycler', 'Recycler'], ['storage', 'Storage'], ['loadout', 'Gear & Loadout']];
  var rc = function rc(r) {
    return Z.tierColor(r);
  }; // canonical tier color (shared with Recycler names)
  var gearStats = Z.resolveLoadoutStats(loadout);
  var equip = function equip(id) {
    var it = Z.getGearItem(id);
    var r = Z.equipGear(id, it.slot);
    if (r) {
      setLoadout(_objectSpread({}, r.loadout));
      setStash(_toConsumableArray(r.stash));
    }
  };
  var unequip = function unequip(slotId) {
    var r = Z.unequipGear(slotId);
    setLoadout(_objectSpread({}, r.loadout));
    setStash(_toConsumableArray(r.stash));
  };
  var FOOD_SPRITE_INDEX = {
    canned_food: 0,
    ration: 1,
    apple: 2,
    orange: 3,
    grapes: 4,
    raisins: 5,
    cola: 6,
    cola_can: 6,
    burger: 7,
    fries: 8,
    potato: 9,
    bread: 10,
    steak_potatoes: 11,
    fish_common: 12,
    fish_uncommon: 13,
    fish_legendary: 14,
    powdered_milk: 15,
    hard_cheese: 16,
    canned_butter: 17,
    meat: 18,
    vegetables: 19
  };
  var itemVisual = function itemVisual(it) {
    var size = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 18;
    var spriteIndex = it ? FOOD_SPRITE_INDEX[it.id] : undefined;
    if (spriteIndex !== undefined) return /*#__PURE__*/React.createElement("span", {
      role: "img",
      "aria-label": it.name,
      title: it.name,
      style: {
        display: 'inline-block',
        flex: "0 0 ".concat(size, "px"),
        width: size,
        height: size,
        backgroundImage: 'url("art/weapons/items/stockpile-food-icons-v2.png")',
        backgroundSize: '500% 400%',
        backgroundPosition: "".concat(spriteIndex % 5 * 25, "% ").concat(Math.floor(spriteIndex / 5) * 100 / 3, "%"),
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated'
      }
    });
    return /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true",
      style: {
        fontSize: size * 0.82,
        lineHeight: 1,
        flexShrink: 0
      }
    }, it && it.icon || '📦');
  };
  var repair = function repair(id) {
    var it = Z.getGearItem(id);
    if (!it) return;
    var d = Z.itemDurability(it);
    if (!d || d.current >= d.max) return;
    if (!Z.canAffordRepair(it)) return;
    var cost = Z.repairCost(it);
    var M = window.ZI_MATERIALS || {};
    Object.entries(cost.materials).forEach(function (_ref48) {
      var _ref49 = _slicedToArray(_ref48, 2),
        k = _ref49[0],
        q = _ref49[1];
      if (M[k]) M[k].current = Math.max(0, M[k].current - q);
    });
    Object.entries(cost.rmat || {}).forEach(function (_ref50) {
      var _ref51 = _slicedToArray(_ref50, 2),
        k = _ref51[0],
        q = _ref51[1];
      return Z.addRmat(k, -q);
    });
    Z.enqueueJob('repair', id, Math.max(30, Math.round((d.max - d.current) * 2)), {});
    setLoadout(_objectSpread({}, Z.getLoadout()));
  };
  var filterCat = {
    ALL: null,
    WEAPONS: 'weapon',
    ARMOR: 'armor',
    GEAR: 'gear',
    ITEMS: 'consumable'
  }[gearFilter];
  // Group stash item ids → counts, then filter.
  var stashCounts = stash.reduce(function (m, id) {
    m[id] = (m[id] || 0) + 1;
    return m;
  }, {});
  var visibleStash = Object.keys(stashCounts).map(function (id) {
    return Z.getGearItem(id);
  }).filter(Boolean).filter(function (it) {
    return !filterCat || it.cat === filterCat;
  });
  var gearGroups = [['weapon', 'WEAPONS'], ['armor', 'ARMOR'], ['gear', 'GEAR'], ['consumable', 'CONSUMABLES']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    role: "tablist",
    "aria-label": "Stockpile",
    onKeyDown: function onKeyDown(e) {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      var index = subTabs.findIndex(function (_ref52) {
        var _ref53 = _slicedToArray(_ref52, 1),
          id = _ref53[0];
        return id === sub;
      });
      var next = e.key === 'Home' ? 0 : e.key === 'End' ? subTabs.length - 1 : (index + (e.key === 'ArrowRight' ? 1 : -1) + subTabs.length) % subTabs.length;
      setSub(subTabs[next][0]);
      var tab = e.currentTarget.querySelector('#stockpile-tab-' + subTabs[next][0]);
      if (tab) tab.focus();
    },
    style: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 6,
      padding: '6px 8px',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 12,
      color: 'var(--amber)',
      letterSpacing: '0.1em',
      marginRight: 4
    }
  }, "STOCKPILE"), subTabs.map(function (_ref54) {
    var _ref55 = _slicedToArray(_ref54, 2),
      id = _ref55[0],
      label = _ref55[1];
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      role: "tab",
      tabIndex: sub === id ? 0 : -1,
      "aria-selected": sub === id,
      "aria-controls": 'stockpile-' + id,
      id: 'stockpile-tab-' + id,
      onClick: function onClick() {
        return setSub(id);
      },
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: '4px 14px',
        cursor: 'pointer',
        background: sub === id ? 'var(--bg4)' : 'transparent',
        color: sub === id ? 'var(--amber)' : 'var(--text2)',
        border: "1px solid ".concat(sub === id ? 'var(--amber)' : 'var(--border)')
      }
    }, label, id === 'recycler' && pending > 0 ? " (".concat(pending, ")") : '', id === 'storage' && stashCount > 0 ? " (".concat(stashCount, ")") : '');
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, pending > 0 ? "".concat(pending, " field item").concat(pending !== 1 ? 's' : '', " from Wandering awaiting breakdown") : 'No field salvage pending')), /*#__PURE__*/React.createElement("div", {
    role: "tabpanel",
    id: 'stockpile-' + sub,
    "aria-labelledby": 'stockpile-tab-' + sub,
    style: {
      flex: 1,
      minHeight: 0,
      overflow: 'hidden'
    }
  }, sub === 'recycler' ? /*#__PURE__*/React.createElement(RecyclerScreen, null) : sub === 'storage' ? /*#__PURE__*/React.createElement("div", {
    className: "screen-enter",
    style: {
      padding: 10,
      height: '100%',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Material Stockpile"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))',
      gap: 8
    }
  }, Object.entries(ZI_MATERIALS).map(function (_ref56) {
    var _ref57 = _slicedToArray(_ref56, 2),
      key = _ref57[0],
      m = _ref57[1];
    var pct = m.current / m.max * 100;
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      style: {
        padding: '8px 10px',
        background: 'var(--bg3)',
        border: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 16
      }
    }, m.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--text)',
        flex: 1
      }
    }, m.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: m.color
      }
    }, m.current, "/", m.max)), /*#__PURE__*/React.createElement(ProgressBar, {
      value: pct,
      color: m.color,
      height: 5
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)',
        marginTop: 4
      }
    }, "Sources: ", m.sources.slice(0, 2).join(', ')));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 0,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Stored Equipment & Supplies"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: '1 1 220px',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text2)'
    }
  }, "Base reserves \xB7 matching items grouped by quantity. Choose what to wear and carry in Gear & Loadout."), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: function onClick() {
      return setSub('loadout');
    }
  }, "Gear & Loadout"), onNavigate && /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: function onClick() {
      return onNavigate('rmat-crafting');
    }
  }, "Open Crafting")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 10px 10px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))',
      gap: 6
    }
  }, Object.keys(stashCounts).map(function (id) {
    return Z.getGearItem(id);
  }).filter(Boolean).map(function (it) {
    var dur = Z.itemDurability(it);
    var isFood = FOOD_SPRITE_INDEX[it.id] !== undefined;
    return /*#__PURE__*/React.createElement("div", {
      key: it.id,
      style: {
        padding: 8,
        background: isFood ? 'rgba(61,207,142,0.08)' : 'var(--bg3)',
        border: '1px solid var(--border)',
        borderTop: "2px solid ".concat(isFood ? 'var(--green)' : rc(it.rarity))
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }
    }, itemVisual(it, isFood ? 42 : 18), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        fontFamily: 'var(--font-body)',
        fontSize: 13
      }
    }, it.name), /*#__PURE__*/React.createElement("b", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--amber)'
      }
    }, "\xD7", stashCounts[it.id])), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text2)',
        marginTop: 4
      }
    }, it.rarity, dur ? " \xB7 Condition ".concat(Math.round(dur.current), "/").concat(dur.max) : ''));
  }), !stashCount && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text2)'
    }
  }, "No stored equipment or supplies. Completed crafts appear here.")))) : /*#__PURE__*/React.createElement("div", {
    className: "screen-enter",
    style: {
      padding: 10,
      height: '100%',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, preparationPanel, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 0,
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title",
    style: {
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Gear & Loadout"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "Equipped gear is used in Routes and Wandering")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      padding: 10,
      alignItems: 'flex-start',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 300px',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 8,
      letterSpacing: '0.1em'
    }
  }, "EQUIPMENT \u2014 click to unequip"), gearGroups.map(function (_ref58) {
    var _ref59 = _slicedToArray(_ref58, 2),
      cat = _ref59[0],
      label = _ref59[1];
    return /*#__PURE__*/React.createElement("div", {
      key: cat,
      style: {
        marginBottom: 9
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)',
        marginBottom: 4
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 4
      }
    }, Z.GEAR_SLOTS.filter(function (s) {
      return s.accepts === cat;
    }).map(function (s) {
      var it = loadout[s.id] && Z.getGearItem(loadout[s.id]);
      var dur = it ? Z.itemDurability(it) : null;
      var worn = it ? Z.itemWorn(it) : false;
      var durPct = dur ? dur.current / dur.max * 100 : 100;
      var durColor = durPct <= 20 ? '#f06a5a' : durPct <= 50 ? '#E0A93F' : '#3dcf8e';
      var damaged = dur && dur.current < dur.max;
      var afford = it && damaged ? Z.canAffordRepair(it) : false;
      return /*#__PURE__*/React.createElement("div", {
        key: s.id,
        title: it ? "".concat(it.name).concat(dur ? " \xB7 ".concat(Math.round(dur.current), "/").concat(dur.max, " durability") : '') : s.label,
        style: {
          padding: '6px 8px',
          minHeight: 42,
          cursor: 'default',
          background: 'var(--bg3)',
          border: "1px solid ".concat(it ? worn ? '#f06a5a' : rc(it.rarity) : 'var(--border)'),
          borderTop: it ? "2px solid ".concat(worn ? '#f06a5a' : rc(it.rarity)) : '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }
      }, it ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }
      }, itemVisual(it, 28), /*#__PURE__*/React.createElement("div", {
        style: {
          minWidth: 0,
          flex: 1
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: worn ? '#f06a5a' : 'var(--text)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }
      }, it.name, worn ? ' (worn)' : ''), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          color: 'var(--text3)'
        }
      }, s.label)), /*#__PURE__*/React.createElement("button", {
        onClick: function onClick(e) {
          e.stopPropagation();
          unequip(s.id);
        },
        title: "Unequip",
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          padding: '1px 5px',
          cursor: 'pointer',
          background: 'var(--bg4)',
          border: '1px solid var(--border)',
          color: 'var(--text3)'
        }
      }, "\u2715")), dur && /*#__PURE__*/React.createElement("div", {
        "data-slot-durability": "1",
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 5
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1,
          height: 6,
          background: 'var(--bg4)',
          borderRadius: 2
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          height: '100%',
          width: "".concat(durPct, "%"),
          background: durColor,
          borderRadius: 2
        }
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: durColor,
          whiteSpace: 'nowrap'
        }
      }, "Durability ", Math.round(dur.current), "/", dur.max), damaged && /*#__PURE__*/React.createElement("button", {
        onClick: function onClick(e) {
          e.stopPropagation();
          repair(it.id);
        },
        disabled: !afford,
        title: afford ? 'Repair (partial re-craft)' : 'Not enough materials to repair',
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 7,
          padding: '1px 5px',
          cursor: afford ? 'pointer' : 'not-allowed',
          background: afford ? 'rgba(61,207,142,0.12)' : 'var(--bg4)',
          border: "1px solid ".concat(afford ? '#3dcf8e' : 'var(--border)'),
          color: afford ? '#3dcf8e' : 'var(--text3)'
        }
      }, "\uD83D\uDD27"))) : /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--text3)'
        }
      }, s.label));
    })));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap',
      marginTop: 6,
      padding: '7px 9px',
      background: 'var(--bg4)',
      border: '1px solid var(--border)'
    }
  }, [['HP', gearStats.displayHP, 'var(--green)'], ['Armor', gearStats.armorRating, 'var(--blue)'], ['Carry', gearStats.carryCapacity, 'var(--amber)'], ['Speed', gearStats.speed, '#c894ff'], ['Loot', "+".concat(gearStats.lootFind), 'var(--green)'], ['Wpn', "+".concat(Math.round(gearStats.weaponDamage * 0.25)), 'var(--red2)']].map(function (_ref60) {
    var _ref61 = _slicedToArray(_ref60, 3),
      k = _ref61[0],
      v = _ref61[1],
      c = _ref61[2];
    return /*#__PURE__*/React.createElement("span", {
      key: k,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text3)'
      }
    }, k, " "), /*#__PURE__*/React.createElement("span", {
      style: {
        color: c
      }
    }, v));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 320px',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      marginBottom: 8
    }
  }, ['ALL', 'WEAPONS', 'ARMOR', 'GEAR', 'ITEMS'].map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      onClick: function onClick() {
        return setGearFilter(t);
      },
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        padding: '3px 9px',
        cursor: 'pointer',
        background: gearFilter === t ? '#2a2318' : 'transparent',
        border: "1px solid ".concat(gearFilter === t ? '#d4a84a' : 'var(--border)'),
        color: gearFilter === t ? '#f0b429' : 'var(--text3)'
      }
    }, t);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))',
      gap: 4,
      alignContent: 'start'
    }
  }, visibleStash.map(function (it) {
    return /*#__PURE__*/React.createElement("div", {
      key: it.id,
      onClick: function onClick() {
        return equip(it.id);
      },
      title: "".concat(ZI.describeGearItem(it), "\nClick to equip"),
      style: {
        padding: '6px 8px',
        cursor: 'pointer',
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderTop: "2px solid ".concat(rc(it.rarity)),
        display: 'flex',
        alignItems: 'center',
        gap: 7
      }
    }, itemVisual(it, it.id === 'canned_food' || it.id === 'ration' ? 36 : 18), /*#__PURE__*/React.createElement("div", {
      style: {
        minWidth: 0,
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, it.name, stashCounts[it.id] > 1 ? " \xD7".concat(stashCounts[it.id]) : ''), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: rc(it.rarity)
      }
    }, it.rarity, " \xB7 ", it.cat), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 7,
        color: 'var(--text2)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, ZI.itemStatLines(it).slice(0, 2).join(' · ') || it.desc || it.cat)));
  }), visibleStash.length === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1/-1',
      textAlign: 'center',
      padding: 24,
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)'
    }
  }, stashCount === 0 ? 'No crafted gear yet. Craft equipment & consumables in the Crafting tab — they appear here to equip.' : 'Nothing in this category.'))))), /*#__PURE__*/React.createElement("div", {
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement(CarryPanel, null)))));
};