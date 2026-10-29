"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// Zombie Idler v2 — New Screens Component File
// Requires: game-data.js, pixel-art.js, tweaks-panel.jsx loaded first

// ─── SURVIVAL STAT LEVELING SCREEN ──────────────────────────────────────────
// Tutorial spec 7.2: these panels use fixed sample values in the first release, so they carry a visible label.
function PreviewTag() {
  return /*#__PURE__*/React.createElement("span", {
    className: "tag",
    title: "Sample values \u2014 not yet linked to your survivor",
    style: {
      color: 'var(--text2)',
      borderColor: 'var(--text3)',
      background: 'transparent',
      letterSpacing: '0.12em',
      textTransform: 'uppercase'
    }
  }, "Preview");
}
function StatLevelingScreen() {
  var _ZI$SURVIVAL_ATTRS$fi, _ZI$SURVIVAL_ATTRS$fi2;
  var ZI = window.ZI;
  var ZI_ART = window.ZI_ART;
  var _React$useState = React.useState(function () {
      return ZI.getCalendar();
    }),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    gameNow = _React$useState2[0],
    setGameNow = _React$useState2[1]; // shared game calendar
  var gameSecond = gameNow.hh * 3600 + gameNow.mm * 60,
    gameDay = gameNow.day;
  var gameMinute = Math.floor(gameSecond / 60);
  var gameHour = Math.floor(gameSecond / 3600);
  var _React$useState3 = React.useState('Rain'),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    weather = _React$useState4[0],
    setWeather = _React$useState4[1];
  var _React$useState5 = React.useState(null),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    selectedAttr = _React$useState6[0],
    setSelectedAttr = _React$useState6[1];
  var _React$useState7 = React.useState(0),
    _React$useState8 = _slicedToArray(_React$useState7, 2),
    forceXp = _React$useState8[1];
  var _React$useState9 = React.useState(null),
    _React$useState0 = _slicedToArray(_React$useState9, 2),
    xpFlash = _React$useState0[0],
    setXpFlash = _React$useState0[1]; // {prof, amount}

  // Live-bind profession bars to the central XP bus (Change 6).
  React.useEffect(function () {
    if (!ZI.onXp) return;
    return ZI.onXp(function (prof, amount) {
      forceXp(function (n) {
        return n + 1;
      });
      var p = (ZI.PROFESSIONS || []).find(function (x) {
        return x.id === prof;
      });
      setXpFlash({
        prof: p ? p.name : prof,
        amount: amount
      });
      clearTimeout(window.__ziXpFlashT);
      window.__ziXpFlashT = setTimeout(function () {
        return setXpFlash(null);
      }, 2400);
    });
  }, []);

  // Tick game clock: shared rate from game/core.js (1 game hour = 1 real minute).
  React.useEffect(function () {
    var t = setInterval(function () {
      return setGameNow(ZI.getCalendar());
    }, 1000);
    return function () {
      return clearInterval(t);
    };
  }, []);
  var isNight = gameHour >= 21 || gameHour < 5;
  var isDusk = gameHour >= 18 && gameHour < 21 || gameHour >= 5 && gameHour < 7;
  var skyColor = isNight ? '#050810' : isDusk ? '#1a1018' : '#0a1828';
  var timeLabel = gameHour.toString().padStart(2, '0') + ':' + (gameMinute % 60).toString().padStart(2, '0') + ':' + (gameSecond % 60).toString().padStart(2, '0');

  // Character stats
  var _React$useState1 = React.useState([{
      key: 'S',
      name: 'Survival',
      xp: 2340,
      maxXp: 3000,
      level: 7,
      maxLevel: 20,
      color: 'var(--green)'
    }, {
      key: 'U',
      name: 'Underhandedness',
      xp: 1180,
      maxXp: 2000,
      level: 5,
      maxLevel: 20,
      color: 'var(--purple)'
    }, {
      key: 'R',
      name: 'Reflex',
      xp: 2850,
      maxXp: 3000,
      level: 8,
      maxLevel: 20,
      color: 'var(--amber)'
    }, {
      key: 'V',
      name: 'Vitality',
      xp: 900,
      maxXp: 2000,
      level: 4,
      maxLevel: 20,
      color: 'var(--red2)'
    }, {
      key: 'I',
      name: 'Insight',
      xp: 2100,
      maxXp: 2500,
      level: 6,
      maxLevel: 20,
      color: 'var(--blue)'
    }, {
      key: 'V2',
      name: 'Valor',
      xp: 400,
      maxXp: 1500,
      level: 3,
      maxLevel: 20,
      color: 'var(--rust2)',
      css: '#e0624c'
    }, {
      key: 'A',
      name: 'Aptitude',
      xp: 1900,
      maxXp: 2500,
      level: 6,
      maxLevel: 20,
      color: 'var(--amber2)'
    }, {
      key: 'L',
      name: 'Lucky',
      xp: 640,
      maxXp: 1500,
      level: 3,
      maxLevel: 20,
      color: 'var(--yellow)',
      css: '#f0d060'
    }]),
    _React$useState10 = _slicedToArray(_React$useState1, 2),
    stats = _React$useState10[0],
    setStats = _React$useState10[1];

  // Professions derived live from the central XP bus (zi_stat_xp).
  var PROF_COLORS = {
    combat: 'var(--red2)',
    firstAid: 'var(--green)',
    scavenging: 'var(--amber)',
    stealth: 'var(--purple)',
    athletics: 'var(--blue)',
    endurance: 'var(--metal)',
    foraging: 'var(--green2)',
    smithing: 'var(--rust2)',
    medical: 'var(--green)',
    mechanical: 'var(--metal)',
    discovery: 'var(--blue)',
    trading: 'var(--amber2)',
    diplomat: 'var(--purple)',
    logistics: 'var(--text2)',
    engineering: 'var(--amber)',
    command: 'var(--yellow)'
  };
  var xpForLvl = function xpForLvl(L) {
    return 50 * L + 12 * L * L;
  };
  var liveXp = ZI.getStatXp ? ZI.getStatXp() : {};
  var professions = (ZI.PROFESSIONS || []).map(function (p) {
    var xp = liveXp[p.id] || 0;
    var level = ZI.statLevel ? ZI.statLevel(p.id) : 1;
    // Scavenging uses its steeper cumulative curve; others the standard curve.
    // Level 1 starts at 0 XP (statLevel only uses the curve from level 2 up).
    var floorXp = level <= 1 ? 0 : p.id === 'scavenging' ? ZI._scavCumThreshold(level) : xpForLvl(level);
    var nextXp = p.id === 'scavenging' ? ZI._scavCumThreshold(level + 1) : xpForLvl(level + 1);
    return {
      id: p.id,
      name: p.name,
      icon: p.icon,
      level: level,
      xp: Math.max(0, xp - floorXp),
      maxXp: Math.max(1, nextXp - floorXp),
      total: xp,
      color: PROF_COLORS[p.id] || 'var(--amber)',
      css: PROF_COLORS[p.id]
    };
  });

  // Zombie index by time of day
  var zombiesByHour = isNight ? {
    primary: 'Nightmares',
    secondary: 'Runners',
    note: 'PZ: zombie aggression peaks 22:00–04:00. Sprint variants most common.',
    color: 'var(--red2)',
    dropRates: ZI.RMAT_DROP_RATES['Runner']
  } : isDusk ? {
    primary: 'Runners',
    secondary: 'Spitters',
    note: 'PZ: dusk transition — safest window closing fast. Move NOW.',
    color: 'var(--amber)',
    dropRates: ZI.RMAT_DROP_RATES['Spitter']
  } : {
    primary: 'Shamblers',
    secondary: 'Runners',
    note: 'PZ: daylight hours — lower aggression, best for scavenging.',
    color: 'var(--green)',
    dropRates: ZI.RMAT_DROP_RATES['Shambler']
  };
  var weatherEffects = ZI.WEATHER_EFFECTS[weather] || ZI.WEATHER_EFFECTS.Rain;
  var weatherOptions = ['Rain', 'Fog', 'HeatWave', 'Blizzard'];
  var attrObj = ZI.SURVIVAL_ATTRS.find(function (a) {
    return a.key === selectedAttr || a.key === selectedAttr + '2';
  });

  // Click-and-drag on empty space pans the whole Stats page (buttons, sliders and text inputs still work normally).
  var statsPanRef = React.useRef(null);
  var startStatsPan = function startStatsPan(e) {
    if (e.button !== 0 || e.target.closest('button, input, select, textarea, a, label, [role="slider"]')) return;
    var el = statsPanRef.current;
    if (!el) return;
    var x0 = e.clientX,
      y0 = e.clientY,
      l0 = el.scrollLeft,
      t0 = el.scrollTop;
    el.style.cursor = 'grabbing';
    var move = function move(ev) {
      el.scrollLeft = l0 - (ev.clientX - x0);
      el.scrollTop = t0 - (ev.clientY - y0);
    };
    var _up = function up() {
      el.style.cursor = 'grab';
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', _up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', _up);
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: statsPanRef,
    onMouseDown: startStatsPan,
    className: "screen-enter",
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      alignContent: 'flex-start',
      gap: 8,
      padding: 8,
      height: '100%',
      overflow: 'auto',
      position: 'relative',
      cursor: 'grab'
    }
  }, xpFlash && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 12,
      right: 14,
      zIndex: 60,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--green)',
      background: '#10231a',
      border: '1px solid #3dcf8e',
      padding: '7px 12px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.5)'
    }
  }, "+", xpFlash.amount, " ", xpFlash.prof, " XP"), window.SurvivorProgressPanel && /*#__PURE__*/React.createElement(window.SurvivorProgressPanel, null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 280px',
      minWidth: 260,
      maxWidth: 340,
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: '1 0 auto',
      minHeight: 420,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "SURVIVAL Attributes"), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(PreviewTag, null), /*#__PURE__*/React.createElement(Tag, {
    color: "var(--amber)"
  }, "Lv14 Ranger"))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, stats.map(function (s) {
    var pct = s.xp / s.maxXp * 100;
    var isSelected = selectedAttr === s.key;
    var color = s.css || s.color;
    return /*#__PURE__*/React.createElement("div", {
      key: s.key,
      onClick: function onClick() {
        return setSelectedAttr(isSelected ? null : s.key);
      },
      style: {
        padding: '8px 10px',
        cursor: 'pointer',
        border: "1px solid ".concat(isSelected ? color : 'var(--border)'),
        background: isSelected ? 'var(--bg4)' : 'var(--bg3)',
        transition: 'all 0.15s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 28,
        height: 28,
        border: "2px solid ".concat(color),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-title)',
        fontSize: 14,
        color: color,
        background: 'var(--bg4)',
        flexShrink: 0
      }
    }, s.key === 'V2' ? 'Va' : s.key), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--text)',
        fontWeight: 500
      }
    }, s.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: color
      }
    }, "Lv ", s.level)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginTop: 3
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(ProgressBar, {
      value: pct,
      color: color,
      height: 5
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        flexShrink: 0
      }
    }, s.xp, "/", s.maxXp)))), isSelected && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text2)',
        lineHeight: 1.5
      }
    }, (attrObj === null || attrObj === void 0 ? void 0 : attrObj.desc) || 'No description'));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '3 1 460px',
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minWidth: 0,
      minHeight: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: '10px 14px',
      flexShrink: 0,
      background: skyColor,
      borderColor: 'var(--border)',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: isNight ? 'radial-gradient(ellipse at 80% 50%, rgba(80,50,150,0.15), transparent)' : isDusk ? 'radial-gradient(ellipse at 70% 50%, rgba(200,100,50,0.2), transparent)' : 'radial-gradient(ellipse at 60% 50%, rgba(70,120,180,0.15), transparent)',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px 16px',
      position: 'relative',
      zIndex: 1,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      flexShrink: 0,
      width: 132
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 28,
      color: isNight ? 'var(--blue)' : isDusk ? 'var(--red2)' : 'var(--amber)',
      lineHeight: 1,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap'
    }
  }, timeLabel), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginTop: 2
    }
  }, "YEAR ", gameNow.year, " \xB7 DAY ", gameDay, " \xB7 ", isNight ? '🌙 NIGHT' : isDusk ? '🌇 DUSK' : '☀️ DAY')), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 200px',
      minWidth: 0,
      maxWidth: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 4
    }
  }, "TIME OF DAY"), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 14,
      background: 'var(--bg4)',
      borderRadius: 1,
      overflow: 'hidden',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '20.8%',
      height: '100%',
      background: 'rgba(10,24,40,0.8)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '20.8%',
      top: 0,
      width: '8.4%',
      height: '100%',
      background: 'rgba(180,90,40,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '29.2%',
      top: 0,
      width: '37.5%',
      height: '100%',
      background: 'rgba(70,120,180,0.3)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '66.7%',
      top: 0,
      width: '8.4%',
      height: '100%',
      background: 'rgba(180,90,40,0.5)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: '75%',
      top: 0,
      width: '25%',
      height: '100%',
      background: 'rgba(10,24,40,0.8)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: 3,
      left: "".concat(gameSecond / 86400 * 100, "%"),
      background: isNight ? 'var(--blue)' : isDusk ? 'var(--red2)' : 'var(--amber)',
      boxShadow: "0 0 6px ".concat(isNight ? 'var(--blue)' : isDusk ? 'var(--red2)' : 'var(--amber)')
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 2
    }
  }, ['00', '06', '12', '18', '24'].map(function (h) {
    return /*#__PURE__*/React.createElement("span", {
      key: h,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)'
      }
    }, h);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 1 auto',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 4,
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, "WEATHER ", /*#__PURE__*/React.createElement(PreviewTag, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      flexWrap: 'wrap'
    }
  }, weatherOptions.map(function (w) {
    return /*#__PURE__*/React.createElement("button", {
      key: w,
      onClick: function onClick() {
        return setWeather(w);
      },
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        padding: '3px 7px',
        border: "1px solid ".concat(weather === w ? 'var(--amber)' : 'var(--border)'),
        background: weather === w ? 'rgba(200,169,110,0.12)' : 'var(--bg4)',
        color: weather === w ? 'var(--amber)' : 'var(--text3)',
        cursor: 'pointer'
      }
    }, w);
  })))), function () {
    var phase = isNight ? 'night' : isDusk ? 'dusk' : 'day';
    var mods = ZI.conditionMods(weather, phase);
    var rows = Object.entries(mods).sort(function (a, b) {
      return b[1].pct - a[1].pct;
    });
    var profName = function profName(id) {
      return ((ZI.PROFESSIONS || []).find(function (p) {
        return p.id === id;
      }) || {
        name: id
      }).name;
    };
    var profIcon = function profIcon(id) {
      return ((ZI.PROFESSIONS || []).find(function (p) {
        return p.id === id;
      }) || {}).icon || '';
    };
    var wOpp = (ZI.WEATHER_STAT_MODS[weather] || {}).opportunity;
    var tOpp = (ZI.TIME_STAT_MODS[phase] || {}).opportunity;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'relative',
        zIndex: 1,
        marginTop: 10,
        paddingTop: 9,
        borderTop: '1px solid var(--border)',
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: '1 1 220px',
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        marginBottom: 5,
        letterSpacing: '0.08em'
      }
    }, "OPEN OPPORTUNITIES"), [wOpp, tOpp].filter(Boolean).map(function (o, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          color: 'var(--text)',
          lineHeight: 1.45,
          marginBottom: 3
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--amber)',
          marginRight: 5
        }
      }, "\u25B8"), o);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: '2 1 320px',
        minWidth: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))',
        gap: 5
      }
    }, rows.map(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2),
        stat = _ref2[0],
        m = _ref2[1];
      var up = m.pct > 0,
        zero = m.pct === 0;
      var c = zero ? 'var(--text3)' : up ? 'var(--green)' : 'var(--red2)';
      return /*#__PURE__*/React.createElement("div", {
        key: stat,
        style: {
          padding: '5px 8px',
          background: 'rgba(0,0,0,0.3)',
          border: "1px solid ".concat(zero ? 'var(--border)' : up ? 'rgba(76,175,125,0.4)' : 'rgba(200,97,42,0.4)')
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          color: 'var(--text)'
        }
      }, profIcon(stat), " ", profName(stat)), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          color: c
        }
      }, up ? '+' : '', m.pct, "%")), m.parts.map(function (p, i) {
        return /*#__PURE__*/React.createElement("div", {
          key: i,
          style: {
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--text2)',
            marginTop: 2,
            lineHeight: 1.35
          }
        }, /*#__PURE__*/React.createElement("span", {
          style: {
            color: p.pct > 0 ? 'var(--green)' : 'var(--red2)'
          }
        }, p.src, " ", p.pct > 0 ? '+' : '', p.pct, "%"), " \xB7 ", p.why);
      }));
    })));
  }()), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: '10px 14px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '10px 16px',
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 200px',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 5,
      display: 'flex',
      gap: 6,
      alignItems: 'center'
    }
  }, "ZOMBIE INDEX \u2014 ", timeLabel, " ", /*#__PURE__*/React.createElement(PreviewTag, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: zombiesByHour.color,
      boxShadow: "0 0 6px ".concat(zombiesByHour.color)
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: zombiesByHour.color
    }
  }, zombiesByHour.primary), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)'
    }
  }, "+ ", zombiesByHour.secondary)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      fontStyle: 'italic',
      lineHeight: 1.5
    }
  }, zombiesByHour.note)), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 160px',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 5
    }
  }, "LOOT TABLE \u2014 ", zombiesByHour.primary.toUpperCase()), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, ZI.RMAT_TIERS.map(function (tier) {
    var rateKey = "tier".concat(tier.tier);
    var rate = (zombiesByHour.dropRates || {})[rateKey] || 0;
    if (rate === 0) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: tier.tier,
      style: {
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: tier.color,
        marginBottom: 2
      }
    }, rate, "%"), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 20,
        height: 32,
        background: 'var(--bg4)',
        display: 'flex',
        alignItems: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        background: tier.color,
        height: "".concat(rate / 15 * 100, "%"),
        opacity: 0.8
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)',
        marginTop: 2
      }
    }, "T", tier.tier));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 200px',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 5
    }
  }, "WEATHER \u2014 ", weather.toUpperCase()), Object.entries(weatherEffects).filter(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 1),
      k = _ref4[0];
    return k !== 'note';
  }).slice(0, 4).map(function (_ref5) {
    var _ref6 = _slicedToArray(_ref5, 2),
      k = _ref6[0],
      v = _ref6[1];
    return /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)'
      }
    }, k.replace(/([A-Z])/g, ' $1').replace(/^./, function (s) {
      return s.toUpperCase();
    }).slice(0, 16)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: typeof v === 'number' && v < 0 ? 'var(--green)' : typeof v === 'number' && v > 0 ? 'var(--red2)' : 'var(--amber)'
      }
    }, typeof v === 'boolean' ? v ? 'Yes' : 'No' : typeof v === 'number' ? "".concat(v > 0 ? '+' : '').concat((v * 100).toFixed(0), "%") : v));
  }), weatherEffects.note && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      fontStyle: 'italic',
      marginTop: 4,
      lineHeight: 1.4
    }
  }, weatherEffects.note.slice(0, 80), "...")))), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: '1 0 auto',
      minHeight: 380,
      display: 'flex',
      flexDirection: 'column'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Profession XP ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginLeft: 6
    }
  }, "\xB7 PZ skill model \xB7 actions = XP")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      padding: 8,
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
      gap: 6,
      alignContent: 'start'
    }
  }, professions.map(function (p) {
    var _ZI$SKILL_XP_SOURCES$;
    var pct = p.xp / p.maxXp * 100;
    var color = p.css || p.color;
    var src = (_ZI$SKILL_XP_SOURCES$ = ZI.SKILL_XP_SOURCES[p.name]) === null || _ZI$SKILL_XP_SOURCES$ === void 0 ? void 0 : _ZI$SKILL_XP_SOURCES$.sources;
    var xpCopy = src && src[0] || p.desc || 'Actions in the field';
    return /*#__PURE__*/React.createElement("div", {
      key: p.id,
      style: {
        padding: '8px 10px',
        background: 'var(--bg3)',
        border: "1px solid ".concat(xpFlash && xpFlash.prof === p.name ? color : 'var(--border)'),
        transition: 'border-color 0.3s'
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
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--text)',
        fontWeight: 500
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        marginRight: 5
      }
    }, p.icon), p.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: color
      }
    }, "Lv ", p.level, "/50")), /*#__PURE__*/React.createElement(ProgressBar, {
      value: pct,
      color: color,
      height: 5
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        marginTop: 3
      }
    }, /*#__PURE__*/React.createElement("span", null, p.xp, "/", p.maxXp, " XP"), /*#__PURE__*/React.createElement("span", null, p.total, " total")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)',
        marginTop: 3,
        fontStyle: 'italic'
      }
    }, "+XP: ", xpCopy), function () {
      var r = ZI.skillRust ? ZI.skillRust(p.id) : {
        state: 'fresh'
      };
      if (r.state === 'fresh') return null;
      var days = ZI.skillIdleDays(p.id);
      return /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 4,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: r.state === 'rusted' ? 'var(--red2)' : 'var(--amber)'
        }
      }, r.state === 'rusted' ? '⚠ Rusted' : '⚠ Rusty', " \xB7 \u2212", Math.round((1 - r.eff) * 100), "% efficiency \xB7 idle ", Math.floor(days), "d", r.state === 'rusted' ? ' · losing XP' : '');
    }(), p.id === 'scavenging' && function () {
      var prot = Math.round(ZI.STAT_FORMULAS.scavDropProtection(p.level) * 100);
      var bp = p.level >= 50 ? 'Total loot protection — you never lose loot.' : p.level >= 25 ? 'Over half your haul survives a bad run.' : 'Bad runs are punishing — level up to keep more.';
      return /*#__PURE__*/React.createElement("div", {
        style: {
          marginTop: 5,
          padding: '4px 6px',
          background: 'var(--bg4)',
          borderLeft: '2px solid #E0A93F'
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          color: '#E0A93F'
        }
      }, "\u29D7 Most-gated"), /*#__PURE__*/React.createElement("span", {
        style: {
          color: 'var(--green)'
        }
      }, prot, "% loot protection")), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 8,
          color: 'var(--text3)',
          marginTop: 2
        }
      }, bp));
    }());
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 230px',
      minWidth: 220,
      maxWidth: 300,
      minHeight: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: '1 0 auto',
      minHeight: 420,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Stat Milestones"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 8
    }
  }, selectedAttr ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--amber)',
      marginBottom: 4
    }
  }, ((_ZI$SURVIVAL_ATTRS$fi = ZI.SURVIVAL_ATTRS.find(function (a) {
    return a.key === selectedAttr || a.key === selectedAttr + '2';
  })) === null || _ZI$SURVIVAL_ATTRS$fi === void 0 ? void 0 : _ZI$SURVIVAL_ATTRS$fi.name) || selectedAttr), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 10,
      lineHeight: 1.6
    }
  }, (_ZI$SURVIVAL_ATTRS$fi2 = ZI.SURVIVAL_ATTRS.find(function (a) {
    return a.key === selectedAttr || a.key === selectedAttr + '2';
  })) === null || _ZI$SURVIVAL_ATTRS$fi2 === void 0 ? void 0 : _ZI$SURVIVAL_ATTRS$fi2.desc), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), [25, 50, 75, 100].map(function (threshold) {
    var _stats$find;
    var current = ((_stats$find = stats.find(function (s) {
      return s.key === selectedAttr;
    })) === null || _stats$find === void 0 ? void 0 : _stats$find.level) || 0;
    var reached = current * 5 >= threshold;
    return /*#__PURE__*/React.createElement("div", {
      key: threshold,
      style: {
        padding: '7px 8px',
        marginBottom: 5,
        border: "1px solid ".concat(reached ? 'var(--amber)' : 'var(--border)'),
        background: reached ? 'rgba(200,169,110,0.08)' : 'var(--bg3)',
        opacity: reached ? 1 : 0.8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: reached ? 'var(--green)' : 'var(--border2)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: reached ? 'var(--amber)' : 'var(--text3)'
      }
    }, "Level ", threshold / 5, " Milestone")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)'
      }
    }, threshold === 25 && 'Minor perk unlock · Scaling bonus', threshold === 50 && 'Intermediate perk · Weapon grade up', threshold === 75 && 'Major perk · Build archetype synergy', threshold === 100 && 'Mastery spike · Class evolution eligible'));
  })) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 13,
      color: 'var(--text3)',
      marginBottom: 6
    }
  }, "Select a Stat"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "Click any SURVIVAL attribute to view its milestone unlock path."))))));
}
Object.assign(window, {
  StatLevelingScreen: StatLevelingScreen
});

// ─── TRAVERSAL SIMULATION / ZOMBIE STRIKE MINIGAME ───────────────────────────
function TraversalScreen(_ref7) {
  var route = _ref7.route;
  var ZI = window.ZI;
  var ZI_ART = window.ZI_ART;
  var TILE = 24; // tile size px
  var COLS = 30,
    ROWS = 18;
  var canvasRef = React.useRef(null);
  var stateRef = React.useRef(null);
  var _React$useState11 = React.useState('traversal'),
    _React$useState12 = _slicedToArray(_React$useState11, 2),
    gameState = _React$useState12[0],
    setGameState = _React$useState12[1]; // traversal | combat | complete
  var _React$useState13 = React.useState(0),
    _React$useState14 = _slicedToArray(_React$useState13, 2),
    progress = _React$useState14[0],
    setProgress = _React$useState14[1]; // 0-100 route progress
  var _React$useState15 = React.useState({
      kills: 0,
      xp: 0,
      critHits: 0
    }),
    _React$useState16 = _slicedToArray(_React$useState15, 2),
    score = _React$useState16[0],
    setScore = _React$useState16[1];
  var _React$useState17 = React.useState([]),
    _React$useState18 = _slicedToArray(_React$useState17, 2),
    activeZombies = _React$useState18[0],
    setActiveZombies = _React$useState18[1];
  var _React$useState19 = React.useState({
      x: 4,
      y: 9,
      hp: 100,
      stamina: 78,
      facing: 'right'
    }),
    _React$useState20 = _slicedToArray(_React$useState19, 2),
    player = _React$useState20[0],
    setPlayer = _React$useState20[1];
  var _React$useState21 = React.useState([]),
    _React$useState22 = _slicedToArray(_React$useState21, 2),
    floats = _React$useState22[0],
    setFloats = _React$useState22[1]; // floating damage numbers
  var _React$useState23 = React.useState({}),
    _React$useState24 = _slicedToArray(_React$useState23, 2),
    keys = _React$useState24[0],
    setKeys = _React$useState24[1];
  var _React$useState25 = React.useState(null),
    _React$useState26 = _slicedToArray(_React$useState25, 2),
    lastClick = _React$useState26[0],
    setLastClick = _React$useState26[1];
  var biome = route ? ZI.BIOMES.find(function (b) {
    return b.id === route.biome;
  }) : ZI.BIOMES[1];

  // Tile map generation (8-bit aesthetic)
  var tileMap = React.useMemo(function () {
    var map = [];
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var rand = Math.sin(c * 47.3 + r * 91.7) * 0.5 + 0.5;
        var type = 'concrete';
        if (r === 0 || r === ROWS - 1) type = 'rubble';else if (rand < 0.08) type = 'rubble';else if (rand < 0.15) type = 'blood';else if (rand > 0.92) type = 'rubble';
        map.push({
          type: type,
          passable: type !== 'rubble' || rand > 0.05
        });
      }
    }
    return map;
  }, []);

  // Spawn zombies periodically
  React.useEffect(function () {
    if (gameState !== 'traversal' && gameState !== 'combat') return;
    var t = setInterval(function () {
      if (activeZombies.length < 5) {
        var side = Math.random() > 0.5;
        setActiveZombies(function (prev) {
          return [].concat(_toConsumableArray(prev), [{
            id: Date.now(),
            x: side ? COLS - 2 : 2,
            y: Math.floor(Math.random() * (ROWS - 4)) + 2,
            type: Math.random() > 0.7 ? 'runner' : 'shambler',
            hp: Math.random() > 0.7 ? 40 : 20,
            maxHp: Math.random() > 0.7 ? 40 : 20,
            state: 'moving'
          }]);
        });
      }
    }, 2000);
    return function () {
      return clearInterval(t);
    };
  }, [gameState, activeZombies.length]);

  // Advance progress
  React.useEffect(function () {
    var t = setInterval(function () {
      setProgress(function (p) {
        if (p >= 100) {
          setGameState('complete');
          return 100;
        }
        return p + 0.4;
      });
    }, 200);
    return function () {
      return clearInterval(t);
    };
  }, []);

  // Move player via WASD
  React.useEffect(function () {
    var onKey = function onKey(e) {
      return setKeys(function (prev) {
        return _objectSpread(_objectSpread({}, prev), {}, _defineProperty({}, e.key, e.type === 'keydown'));
      });
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    return function () {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
    };
  }, []);
  React.useEffect(function () {
    var t = setInterval(function () {
      setPlayer(function (p) {
        var x = p.x,
          y = p.y,
          facing = p.facing;
        var speed = 1;
        if (keys['w'] || keys['W']) {
          y = Math.max(1, y - speed);
        }
        if (keys['s'] || keys['S']) {
          y = Math.min(ROWS - 2, y + speed);
        }
        if (keys['a'] || keys['A']) {
          x = Math.max(1, x - speed);
          facing = 'left';
        }
        if (keys['d'] || keys['D']) {
          x = Math.min(COLS - 2, x + speed);
          facing = 'right';
        }
        return _objectSpread(_objectSpread({}, p), {}, {
          x: x,
          y: y,
          facing: facing
        });
      });
    }, 80);
    return function () {
      return clearInterval(t);
    };
  }, [keys]);

  // Move zombies toward player
  React.useEffect(function () {
    var t = setInterval(function () {
      setActiveZombies(function (prev) {
        return prev.map(function (z) {
          var speed = z.type === 'runner' ? 0.5 : 0.2;
          var dx = player.x - z.x,
            dy = player.y - z.y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 0.5) return z; // attacking range
          var nx = z.x + dx / dist * speed;
          var ny = z.y + dy / dist * speed;
          return _objectSpread(_objectSpread({}, z), {}, {
            x: nx,
            y: ny
          });
        });
      });
    }, 100);
    return function () {
      return clearInterval(t);
    };
  }, [player]);

  // Handle click attack
  var handleCanvasClick = React.useCallback(function (e) {
    var _canvasRef$current;
    var rect = (_canvasRef$current = canvasRef.current) === null || _canvasRef$current === void 0 ? void 0 : _canvasRef$current.getBoundingClientRect();
    if (!rect) return;
    var mx = (e.clientX - rect.left) / TILE;
    var my = (e.clientY - rect.top) / TILE;

    // Left click = melee, right click = ranged
    var isRanged = e.button === 2;
    var range = isRanged ? 8 : 1.5;
    var now = Date.now();
    var isCrit = lastClick && now - lastClick < 250; // rapid double-click = crit
    setLastClick(now);
    var dmg = isCrit ? isRanged ? 35 : 25 : isRanged ? 18 : 12;
    var xpGain = isCrit ? 30 : 10;
    var hitAny = false;
    setActiveZombies(function (prev) {
      return prev.map(function (z) {
        var dist = Math.sqrt(Math.pow(mx - z.x, 2) + Math.pow(my - z.y, 2));
        if (dist < range) {
          hitAny = true;
          var newHp = z.hp - dmg;
          // Float
          setFloats(function (f) {
            return [].concat(_toConsumableArray(f), [{
              id: Date.now() + Math.random(),
              x: z.x * TILE,
              y: z.y * TILE,
              text: isCrit ? "CRIT! ".concat(dmg) : "-".concat(dmg),
              color: isCrit ? '#f0d060' : '#f08a52'
            }]);
          });
          if (newHp <= 0) {
            setScore(function (s) {
              return {
                kills: s.kills + 1,
                xp: s.xp + xpGain + (isCrit ? 20 : 0),
                critHits: s.critHits + (isCrit ? 1 : 0)
              };
            });
            return null;
          }
          return _objectSpread(_objectSpread({}, z), {}, {
            hp: newHp
          });
        }
        return z;
      }).filter(Boolean);
    });
    if (isCrit && hitAny) {
      setScore(function (s) {
        return _objectSpread(_objectSpread({}, s), {}, {
          xp: s.xp + 5
        });
      });
    }
  }, [lastClick]);

  // Clean up old floats
  React.useEffect(function () {
    var t = setInterval(function () {
      setFloats(function (f) {
        return f.filter(function (fl) {
          return Date.now() - fl.id < 1500;
        });
      });
    }, 100);
    return function () {
      return clearInterval(t);
    };
  }, []);
  var biomeColors = {
    mountain: {
      ground: '#1a2c18',
      wall: '#2e3820',
      accent: '#4a6840'
    },
    suburbia: {
      ground: '#1e1e1e',
      wall: '#2a2420',
      accent: '#3a3228'
    },
    metro: {
      ground: '#181c20',
      wall: '#24282e',
      accent: '#303840'
    },
    perimeter: {
      ground: '#120c1a',
      wall: '#1e1428',
      accent: '#2a1a3a'
    }
  };
  var bc = biomeColors[biome === null || biome === void 0 ? void 0 : biome.id] || biomeColors.suburbia;
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
      display: 'flex',
      gap: 12,
      padding: '6px 12px',
      background: 'var(--bg3)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 14,
      color: 'var(--amber)'
    }
  }, (route === null || route === void 0 ? void 0 : route.name) || 'Traversal Run'), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      marginBottom: 2
    }
  }, "ROUTE PROGRESS"), /*#__PURE__*/React.createElement(ProgressBar, {
    value: progress,
    color: "var(--green)",
    height: 6,
    animated: true
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--amber)'
    }
  }, Math.round(progress), "%"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      marginBottom: 2
    }
  }, "HP"), /*#__PURE__*/React.createElement(ProgressBar, {
    value: player.hp,
    color: "var(--red2)",
    height: 6
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 100
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      marginBottom: 2
    }
  }, "STAMINA"), /*#__PURE__*/React.createElement(ProgressBar, {
    value: player.stamina,
    color: "var(--green)",
    height: 6
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--green)'
    }
  }, score.kills, " kills \xB7 ", score.xp, " XP \xB7 ", score.critHits, " CRITS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      borderLeft: '1px solid var(--border)',
      paddingLeft: 10
    }
  }, "WASD move \xB7 LClick melee \xB7 RClick ranged \xB7 Double-click = CRIT")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: canvasRef,
    onClick: handleCanvasClick,
    onContextMenu: function onContextMenu(e) {
      e.preventDefault();
      handleCanvasClick(e);
    },
    style: {
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
      cursor: 'crosshair',
      userSelect: 'none',
      background: bc.ground
    }
  }, tileMap.map(function (tile, i) {
    var col = i % COLS,
      row = Math.floor(i / COLS);
    if (tile.type === 'rubble') return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: 'absolute',
        left: col * TILE,
        top: row * TILE,
        width: TILE,
        height: TILE,
        background: bc.wall,
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.3)'
      }
    });
    if (tile.type === 'blood') return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: 'absolute',
        left: col * TILE,
        top: row * TILE,
        width: TILE,
        height: TILE,
        background: '#2a1414'
      }
    });
    return null;
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
      backgroundSize: "".concat(TILE, "px ").concat(TILE, "px")
    }
  }), activeZombies.map(function (z) {
    var hpPct = z.hp / z.maxHp;
    var zColor = z.type === 'runner' ? '#f08a52' : '#62d69a';
    return /*#__PURE__*/React.createElement("div", {
      key: z.id,
      style: {
        position: 'absolute',
        left: z.x * TILE - TILE / 2,
        top: z.y * TILE - TILE / 2,
        width: TILE,
        height: TILE,
        transition: 'left 0.1s, top 0.1s',
        zIndex: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: TILE,
        height: TILE,
        background: zColor,
        border: "2px solid ".concat(hpPct > 0.5 ? zColor : '#6b1a1a'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: '#fff',
        imageRendering: 'pixelated',
        opacity: 0.9
      }
    }, z.type === 'runner' ? 'R' : 'Z'), /*#__PURE__*/React.createElement("div", {
      style: {
        position: 'absolute',
        top: -5,
        left: 0,
        width: TILE,
        height: 3,
        background: '#0f0e0c'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "".concat(hpPct * 100, "%"),
        height: '100%',
        background: zColor
      }
    })));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: player.x * TILE - TILE / 2,
      top: player.y * TILE - TILE / 2,
      width: TILE * 1.2,
      height: TILE * 1.2,
      zIndex: 20,
      transition: 'left 0.08s, top 0.08s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: TILE * 1.2,
      height: TILE * 1.2,
      background: 'var(--amber)',
      border: '2px solid var(--amber2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: '#0f0e0c',
      fontWeight: 'bold',
      imageRendering: 'pixelated'
    }
  }, "@"), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: -2,
      left: 4,
      right: 4,
      height: 3,
      background: 'rgba(0,0,0,0.4)',
      borderRadius: '50%'
    }
  })), floats.map(function (f) {
    return /*#__PURE__*/React.createElement("div", {
      key: f.id,
      className: "tick-float",
      style: {
        position: 'absolute',
        left: f.x,
        top: f.y,
        fontFamily: 'var(--font-mono)',
        fontSize: f.text.startsWith('CRIT') ? 13 : 10,
        color: f.color,
        fontWeight: 'bold',
        pointerEvents: 'none',
        zIndex: 30,
        textShadow: '0 0 4px rgba(0,0,0,0.8)'
      }
    }, f.text);
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: TILE,
      top: '50%',
      transform: 'translateY(-50%)',
      fontFamily: 'var(--font-mono)',
      fontSize: 20,
      color: 'var(--green)',
      opacity: 0.7,
      animation: 'threat-pulse 2s ease-in-out infinite'
    }
  }, "\u2192"), gameState === 'complete' && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'rgba(15,14,12,0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 36,
      color: 'var(--green)',
      marginBottom: 8
    }
  }, "EXTRACTED"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 14,
      color: 'var(--amber)',
      marginBottom: 20
    }
  }, score.kills, " kills \xB7 ", score.xp, " XP \xB7 ", score.critHits, " critical hits"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-green",
    onClick: function onClick() {
      setProgress(0);
      setScore({
        kills: 0,
        xp: 0,
        critHits: 0
      });
      setActiveZombies([]);
      setGameState('traversal');
    }
  }, "Run Again"))))));
}
Object.assign(window, {
  TraversalScreen: TraversalScreen
});

// ─── HACK-AND-SLASH MINIGAME ─────────────────────────────────────────────────
// Reuses TraversalScreen architecture but with distinct environments per activity
function HackSlashScreen(_ref8) {
  var _ref8$activity = _ref8.activity,
    activity = _ref8$activity === void 0 ? 'scavenge' : _ref8$activity;
  // activity: 'contracts' | 'scavenge' | 'train'
  var envColors = {
    contracts: {
      bg: '#0a1020',
      ground: '#141c28',
      wall: '#1e2c40',
      accent: 'var(--blue)',
      label: 'Faction Territory'
    },
    scavenge: {
      bg: '#0e0c0a',
      ground: '#1a1814',
      wall: '#2a2010',
      accent: 'var(--amber)',
      label: 'Ruined Suburbia'
    },
    train: {
      bg: '#0a100c',
      ground: '#141c14',
      wall: '#202c20',
      accent: 'var(--green)',
      label: 'Training Grounds'
    }
  };
  var env = envColors[activity] || envColors.scavenge;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: env.bg
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 12px',
      background: 'var(--bg3)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: env.accent,
      boxShadow: "0 0 6px ".concat(env.accent)
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 14,
      color: env.accent
    }
  }, activity.toUpperCase(), " \u2014 ", env.label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)',
      marginLeft: 8
    }
  }, "WASD \xB7 LClick attack \xB7 RClick power/ranged \xB7 1-4 switch items"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 8
    }
  }, ['1:Axe', '2:Rifle', '3:Medkit', '4:Grenade'].map(function (item, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        padding: '2px 8px',
        border: '1px solid var(--border2)',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        background: i === 0 ? 'rgba(200,169,110,0.12)' : 'transparent'
      }
    }, item);
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(TraversalScreen, {
    route: activity === 'contracts' ? ZI.ROUTES[4] : activity === 'scavenge' ? ZI.ROUTES[1] : ZI.ROUTES[0]
  })));
}
Object.assign(window, {
  HackSlashScreen: HackSlashScreen
});