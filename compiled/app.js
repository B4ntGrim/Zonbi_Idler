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
var _React = React,
  useState = _React.useState,
  useEffect = _React.useEffect,
  useRef = _React.useRef,
  useCallback = _React.useCallback;
var ZI = window.ZI;

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function fmt(n) {
  return n >= 1000 ? (n / 1000).toFixed(1) + 'k' : Math.floor(n);
}
function fmtTime(mins) {
  if (mins < 60) return "".concat(mins, "m");
  var h = Math.floor(mins / 60),
    m = mins % 60;
  return m > 0 ? "".concat(h, "h ").concat(m, "m") : "".concat(h, "h");
}
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function getNutritionLevel(val) {
  return ZI.NUTRITION.levels.find(function (l) {
    return val >= l.min && val < l.max;
  }) || ZI.NUTRITION.levels[ZI.NUTRITION.levels.length - 1];
}
function getHydrationLevel(val) {
  return ZI.NUTRITION.hydration.find(function (l) {
    return val >= l.min && val < l.max;
  }) || ZI.NUTRITION.hydration[ZI.NUTRITION.hydration.length - 1];
}
function ProgressBar(_ref) {
  var value = _ref.value,
    _ref$max = _ref.max,
    max = _ref$max === void 0 ? 100 : _ref$max,
    _ref$color = _ref.color,
    color = _ref$color === void 0 ? 'var(--amber)' : _ref$color,
    _ref$height = _ref.height,
    height = _ref$height === void 0 ? 6 : _ref$height,
    _ref$animated = _ref.animated,
    animated = _ref$animated === void 0 ? false : _ref$animated;
  var pct = clamp(value / max * 100, 0, 100);
  return /*#__PURE__*/React.createElement("div", {
    className: "progress-bar",
    style: {
      height: height
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "progress-fill",
    style: {
      width: "".concat(pct, "%"),
      background: color,
      boxShadow: animated ? "0 0 8px ".concat(color) : 'none'
    }
  }));
}
function Tag(_ref2) {
  var children = _ref2.children,
    _ref2$color = _ref2.color,
    color = _ref2$color === void 0 ? 'var(--amber2)' : _ref2$color,
    _ref2$bg = _ref2.bg,
    bg = _ref2$bg === void 0 ? 'transparent' : _ref2$bg;
  return /*#__PURE__*/React.createElement("span", {
    className: "tag",
    style: {
      color: color,
      borderColor: color,
      background: bg
    }
  }, children);
}
function RiskBar(_ref3) {
  var risk = _ref3.risk;
  var colors = ['', 'var(--green)', 'var(--green2)', 'var(--amber)', 'var(--red2)', 'var(--red)'];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 3
    }
  }, [1, 2, 3, 4, 5].map(function (i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        width: 8,
        height: 14,
        borderRadius: 1,
        background: i <= risk ? colors[risk] : 'var(--bg4)',
        opacity: i <= risk ? 1 : 0.4
      }
    });
  }));
}

// ─── TOP BAR ─────────────────────────────────────────────────────────────────
function TopBar(_ref4) {
  var mode = _ref4.mode,
    screen = _ref4.screen,
    setScreen = _ref4.setScreen,
    threatLevel = _ref4.threatLevel,
    worldEvent = _ref4.worldEvent;
  var resources = useTopBarResources(); // Nutrition · Food · Ammo · Fuel · RMAT, read from the game (ZI.getTopBarResources)
  var _useState = useState(new Date()),
    _useState2 = _slicedToArray(_useState, 2),
    time = _useState2[0],
    setTime = _useState2[1];
  var _useState3 = useState(null),
    _useState4 = _slicedToArray(_useState3, 2),
    saveMsg = _useState4[0],
    setSaveMsg = _useState4[1];
  var activeSlot = ZI.getActiveSlot();
  var doSave = function doSave() {
    var r = ZI.saveToActiveSlot();
    setSaveMsg(r.ok ? "\u2713 Saved to Slot ".concat(r.slot) : "\u26A0 ".concat(r.reason));
    setTimeout(function () {
      return setSaveMsg(null);
    }, 2200);
  };
  useEffect(function () {
    var t = setInterval(function () {
      return setTime(new Date());
    }, 1000);
    return function () {
      return clearInterval(t);
    };
  }, []);
  var gameNow = ZI.getCalendar(); // shared calendar; `time` ticking each second re-renders this
  var gameDay = gameNow.day,
    gameYear = gameNow.year;
  var gameClock = String(gameNow.hh).padStart(2, '0') + ':' + String(gameNow.mm).padStart(2, '0');
  var isCamp = mode === 'camp';
  var tabs = isCamp ? [['camp-main', 'Overview'], ['camp-schedule', 'Schedule'], ['traversal', 'Traversal'], ['marketplace', 'Shop'], ['rmat-crafting', 'Crafting'], ['stockpile', 'Stockpile'], ['factions', 'Factions'], ['stat-leveling', 'Stats'], ['hack-slash', 'Wandering'], ['codex', 'Codex']] : [['solo-main', 'Routes'], ['traversal', 'Traversal'], ['solo-schedule', 'Schedule'], ['marketplace', 'Shop'], ['rmat-crafting', 'Crafting'], ['stockpile', 'Stockpile'], ['factions', 'Factions'], ['stat-leveling', 'Stats'], ['hack-slash', 'Wandering'], ['codex', 'Codex']];

  // Phones (< 760 px): a compact bar with a ☰ button that opens a side menu listing every screen.
  // The full bar's tabs, resources and badges don't fit, and an off-screen tab used to slide the whole app sideways.
  var _useState5 = useState(function () {
      return (window.innerWidth || 1024) < 760;
    }),
    _useState6 = _slicedToArray(_useState5, 2),
    narrow = _useState6[0],
    setNarrow = _useState6[1];
  var _useState7 = useState(false),
    _useState8 = _slicedToArray(_useState7, 2),
    drawer = _useState8[0],
    setDrawer = _useState8[1];
  useEffect(function () {
    var f = function f() {
      var n = (window.innerWidth || 1024) < 760;
      setNarrow(n);
      if (!n) setDrawer(false);
    };
    window.addEventListener('resize', f);
    return function () {
      return window.removeEventListener('resize', f);
    };
  }, []);
  useEffect(function () {
    if (!drawer) return;
    var k = function k(e) {
      if (e.key === 'Escape') setDrawer(false);
    };
    window.addEventListener('keydown', k);
    return function () {
      return window.removeEventListener('keydown', k);
    };
  }, [drawer]);
  if (narrow) {
    var cur = tabs.find(function (t) {
      return t[0] === screen;
    });
    var go = function go(s) {
      setScreen(s);
      setDrawer(false);
    };
    return /*#__PURE__*/React.createElement("div", {
      "data-topbar": "compact",
      style: {
        height: 44,
        background: 'var(--bg3)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
        zIndex: 100,
        position: 'relative'
      }
    }, /*#__PURE__*/React.createElement("button", {
      "aria-label": "Open menu",
      "aria-expanded": drawer,
      "data-nav-toggle": "1",
      onClick: function onClick() {
        return setDrawer(true);
      },
      style: {
        width: 44,
        height: '100%',
        flexShrink: 0,
        background: 'none',
        border: 'none',
        borderRight: '1px solid var(--border)',
        color: 'var(--amber)',
        fontSize: 20,
        lineHeight: 1,
        cursor: 'pointer'
      }
    }, "\u2630"), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '0 8px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        height: '100%',
        borderRight: '1px solid var(--border)',
        position: 'relative',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: doSave,
      "aria-label": activeSlot ? "Save to Slot ".concat(activeSlot.slot) : 'Save',
      title: activeSlot ? "Save progress to Slot ".concat(activeSlot.slot) : 'No save file selected',
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        padding: '3px 8px',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
        background: 'rgba(76,175,125,0.12)',
        border: '1px solid var(--green)',
        color: 'var(--green)'
      }
    }, "\uD83D\uDCBE"), /*#__PURE__*/React.createElement(SettingsButton, null), saveMsg && /*#__PURE__*/React.createElement("span", {
      style: {
        position: 'absolute',
        top: 46,
        left: 0,
        zIndex: 200,
        whiteSpace: 'nowrap',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: saveMsg[0] === '✓' ? 'var(--green)' : 'var(--red2)',
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        padding: '5px 9px'
      }
    }, saveMsg)), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setDrawer(true);
      },
      "aria-label": "Current screen, open menu",
      style: {
        flex: 1,
        minWidth: 0,
        height: '100%',
        padding: '0 10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'flex-start',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        maxWidth: '100%',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: 'var(--amber)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, cur ? cur[1] : 'Zombie Idler'), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        whiteSpace: 'nowrap'
      }
    }, "YEAR ", gameYear, " \xB7 DAY ", gameDay, " \xB7 ", gameClock)), worldEvent && /*#__PURE__*/React.createElement(EventChip, {
      worldEvent: worldEvent
    }), drawer && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      "data-nav-backdrop": "1",
      onClick: function onClick() {
        return setDrawer(false);
      },
      style: {
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.55)',
        zIndex: 290
      }
    }), /*#__PURE__*/React.createElement("nav", {
      "data-nav-drawer": "1",
      "aria-label": "Screens",
      style: {
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: 'min(280px, 82vw)',
        zIndex: 300,
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--bg2)',
        borderRight: '1px solid var(--amber)',
        boxShadow: '8px 0 24px rgba(0,0,0,0.6)',
        animation: 'ziDrawerIn 0.18s ease-out'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 6px 0 14px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: function onClick() {
        setDrawer(false);
        ZI.clearResume();
        setScreen('mode-select');
      },
      title: "Main menu",
      style: {
        cursor: 'pointer',
        fontFamily: 'var(--font-title)',
        fontSize: 16,
        color: 'var(--amber)',
        letterSpacing: '0.05em',
        lineHeight: 1
      }
    }, "ZOMBIE", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 10,
        letterSpacing: '0.3em',
        color: 'var(--text2)'
      }
    }, "IDLER")), /*#__PURE__*/React.createElement("button", {
      "aria-label": "Close menu",
      onClick: function onClick() {
        return setDrawer(false);
      },
      style: {
        width: 36,
        height: 36,
        background: 'none',
        border: 'none',
        color: 'var(--text2)',
        fontSize: 18,
        cursor: 'pointer'
      }
    }, "\u2715")), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '8px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        borderBottom: '1px solid var(--border)',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: isCamp ? 'var(--green)' : 'var(--amber)',
        boxShadow: "0 0 6px ".concat(isCamp ? 'var(--green)' : 'var(--amber)')
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        letterSpacing: '0.12em',
        color: 'var(--text2)',
        textTransform: 'uppercase'
      }
    }, isCamp ? 'Camp Leader' : 'Solo Survivor')), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflowY: 'auto',
        padding: '6px 0'
      }
    }, tabs.map(function (_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2),
        s = _ref6[0],
        label = _ref6[1];
      var on = screen === s;
      return /*#__PURE__*/React.createElement("button", {
        key: s,
        "data-nav-item": s,
        onClick: function onClick() {
          return go(s);
        },
        "aria-current": on ? 'page' : undefined,
        style: {
          display: 'block',
          width: '100%',
          textAlign: 'left',
          padding: '12px 16px',
          cursor: 'pointer',
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          background: on ? 'var(--bg3)' : 'none',
          color: on ? 'var(--amber)' : 'var(--text)',
          border: 'none',
          borderLeft: on ? '3px solid var(--amber)' : '3px solid transparent'
        }
      }, label);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        borderTop: '1px solid var(--border)',
        padding: '4px 0',
        flexShrink: 0
      }
    }, Object.entries(resources).map(function (_ref7) {
      var _ref8 = _slicedToArray(_ref7, 2),
        k = _ref8[0],
        v = _ref8[1];
      return /*#__PURE__*/React.createElement("div", {
        key: k,
        style: {
          height: 28,
          display: 'flex'
        }
      }, /*#__PURE__*/React.createElement(ResourceChip, {
        label: k,
        value: v,
        block: true
      }));
    })))));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 44,
      background: 'var(--bg3)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: 0,
      flexShrink: 0,
      zIndex: 100,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 18px',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: '100%',
      cursor: 'pointer'
    },
    onClick: function onClick() {
      ZI.clearResume();
      setScreen('mode-select');
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 16,
      color: 'var(--amber)',
      letterSpacing: '0.05em',
      lineHeight: 1
    }
  }, "ZOMBIE", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 10,
      letterSpacing: '0.3em',
      color: 'var(--text2)'
    }
  }, "IDLER"))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 10px',
      borderRight: '1px solid var(--border)',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: doSave,
    title: activeSlot ? "Save progress to Slot ".concat(activeSlot.slot) : 'No save file selected',
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      padding: '4px 10px',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      background: 'rgba(76,175,125,0.12)',
      border: '1px solid var(--green)',
      color: 'var(--green)'
    }
  }, "\uD83D\uDCBE Save", activeSlot ? " \xB7 Slot ".concat(activeSlot.slot) : ''), /*#__PURE__*/React.createElement(SettingsButton, null), saveMsg && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 46,
      left: 10,
      zIndex: 200,
      whiteSpace: 'nowrap',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: saveMsg[0] === '✓' ? 'var(--green)' : 'var(--red2)',
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      padding: '5px 9px'
    }
  }, saveMsg)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 14px',
      borderRight: '1px solid var(--border)',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 7,
      height: 7,
      borderRadius: '50%',
      background: isCamp ? 'var(--green)' : 'var(--amber)',
      boxShadow: "0 0 6px ".concat(isCamp ? 'var(--green)' : 'var(--amber)')
    }
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      letterSpacing: '0.12em',
      color: 'var(--text2)',
      textTransform: 'uppercase'
    }
  }, isCamp ? 'Camp Leader' : 'Solo Survivor')), /*#__PURE__*/React.createElement(ResourceBar, {
    resources: resources
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 14px',
      borderRight: '1px solid var(--border)',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text2)'
    }
  }, "YEAR ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--amber)',
      fontWeight: 'bold'
    }
  }, gameYear), " \xB7 DAY ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--amber)',
      fontWeight: 'bold'
    }
  }, gameDay)), /*#__PURE__*/React.createElement("span", {
    "aria-label": "Game time ".concat(gameClock),
    title: "Game time \xB7 real time ".concat(time.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    })),
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      fontVariantNumeric: 'tabular-nums',
      color: 'var(--amber)',
      fontWeight: 'bold',
      letterSpacing: '0.08em'
    }
  }, gameClock)), /*#__PURE__*/React.createElement(NavTabs, {
    tabs: tabs,
    screen: screen,
    setScreen: setScreen
  }), worldEvent && /*#__PURE__*/React.createElement(EventChip, {
    worldEvent: worldEvent
  }));
}

// Compact, always-legible event indicator; click for the full event text.
function EventChip(_ref9) {
  var worldEvent = _ref9.worldEvent;
  var _useState9 = useState(false),
    _useState0 = _slicedToArray(_useState9, 2),
    open = _useState0[0],
    setOpen = _useState0[1];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flexShrink: 0,
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setOpen(function (o) {
        return !o;
      });
    },
    title: "ACTIVE EVENT: ".concat(worldEvent.name, " \u2014 ").concat(worldEvent.effect),
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      whiteSpace: 'nowrap',
      cursor: 'pointer',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      padding: '3px 8px',
      background: open ? 'rgba(200,148,255,0.15)' : 'transparent',
      border: '1px solid var(--purple)',
      color: 'var(--purple)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "notif-dot"
  }), "\u26A0 EVENT"), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setOpen(false);
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 190
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      position: 'absolute',
      top: '100%',
      right: 0,
      zIndex: 200,
      width: 260,
      padding: 10,
      background: 'var(--bg2)',
      borderColor: 'var(--purple)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--purple)',
      letterSpacing: '0.12em',
      marginBottom: 4
    }
  }, "ACTIVE EVENT"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 15,
      color: 'var(--text)',
      marginBottom: 4
    }
  }, worldEvent.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--text)',
      lineHeight: 1.45
    }
  }, worldEvent.effect))));
}

// Top-bar tabs: as many as fit are shown; the rest (never the active one) go in "▾ More".
function NavTabs(_ref0) {
  var tabs = _ref0.tabs,
    screen = _ref0.screen,
    setScreen = _ref0.setScreen;
  var boxRef = useRef(null),
    measureRef = useRef(null);
  var _useState1 = useState(tabs.length),
    _useState10 = _slicedToArray(_useState1, 2),
    fit = _useState10[0],
    setFit = _useState10[1];
  var _useState11 = useState(false),
    _useState12 = _slicedToArray(_useState11, 2),
    open = _useState12[0],
    setOpen = _useState12[1];
  useEffect(function () {
    var calc = function calc() {
      var box = boxRef.current,
        m = measureRef.current;
      if (!box || !m) return;
      // Room left = bar width minus every other fixed item (event banner excluded; it can shrink to an icon).
      var bar = box.parentElement;
      var others = _toConsumableArray(bar.children).filter(function (c) {
        return c !== box && !c.hasAttribute('data-shrinkable');
      }).reduce(function (a, c) {
        return a + c.offsetWidth;
      }, 0);
      var avail = bar.clientWidth - others - 44; // keep ~44px for the ⚠ event icon
      var ws = _toConsumableArray(m.children).map(function (c) {
          return c.offsetWidth;
        }),
        MORE = 80;
      var used = 0,
        n = 0;
      for (var k = 0; k < ws.length; k++) {
        if (used + ws[k] + (k < ws.length - 1 ? MORE : 0) > avail) break;
        used += ws[k];
        n++;
      }
      setFit(Math.max(1, n));
    };
    calc();
    var ro = new ResizeObserver(calc);
    if (boxRef.current && boxRef.current.parentElement) ro.observe(boxRef.current.parentElement);
    return function () {
      return ro.disconnect();
    };
  }, [tabs.length]);
  var shown = tabs.slice(0, fit),
    hidden = tabs.slice(fit);
  var activeHidden = hidden.find(function (t) {
    return t[0] === screen;
  });
  if (activeHidden && shown.length) {
    hidden = [shown[shown.length - 1]].concat(_toConsumableArray(hidden.filter(function (t) {
      return t !== activeHidden;
    })));
    shown = [].concat(_toConsumableArray(shown.slice(0, -1)), [activeHidden]);
  }
  var tabStyle = function tabStyle(on) {
    return {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      flexShrink: 0,
      color: on ? 'var(--amber)' : 'var(--text2)',
      padding: '0 13px',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      height: '100%',
      borderBottom: on ? '2px solid var(--amber)' : '2px solid transparent',
      transition: 'all 0.15s',
      position: 'relative',
      top: 1
    };
  };
  return /*#__PURE__*/React.createElement("div", {
    ref: boxRef,
    style: {
      display: 'flex',
      height: '100%',
      borderRight: '1px solid var(--border)',
      flexShrink: 0,
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: measureRef,
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      visibility: 'hidden',
      pointerEvents: 'none',
      display: 'flex',
      height: 0,
      overflow: 'hidden'
    }
  }, tabs.map(function (_ref1) {
    var _ref10 = _slicedToArray(_ref1, 2),
      s = _ref10[0],
      label = _ref10[1];
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      style: tabStyle(false)
    }, label);
  })), shown.map(function (_ref11) {
    var _ref12 = _slicedToArray(_ref11, 2),
      s = _ref12[0],
      label = _ref12[1];
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      onClick: function onClick() {
        return setScreen(s);
      },
      style: tabStyle(screen === s)
    }, label);
  }), hidden.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setOpen(function (o) {
        return !o;
      });
    },
    style: _objectSpread(_objectSpread({}, tabStyle(false)), {}, {
      color: open ? 'var(--amber)' : 'var(--text)'
    })
  }, "\u25BE More"), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setOpen(false);
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 190
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      position: 'absolute',
      top: '100%',
      right: 0,
      zIndex: 200,
      minWidth: 170,
      padding: 4,
      background: 'var(--bg2)',
      borderColor: 'var(--amber)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
      display: 'flex',
      flexDirection: 'column'
    }
  }, hidden.map(function (_ref13) {
    var _ref14 = _slicedToArray(_ref13, 2),
      s = _ref14[0],
      label = _ref14[1];
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      onClick: function onClick() {
        setScreen(s);
        setOpen(false);
      },
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        textAlign: 'left',
        padding: '8px 10px',
        background: 'none',
        border: 'none',
        color: 'var(--text)',
        cursor: 'pointer'
      }
    }, label);
  })))));
}

// Shows as many resource chips as fit; the rest collapse into a "▾ +N" dropdown
// so chips never squash into each other when the bar is narrow.
function ResourceBar(_ref15) {
  var resources = _ref15.resources;
  var entries = Object.entries(resources);
  var boxRef = useRef(null);
  var measureRef = useRef(null);
  var _useState13 = useState(entries.length),
    _useState14 = _slicedToArray(_useState13, 2),
    fit = _useState14[0],
    setFit = _useState14[1];
  var _useState15 = useState(false),
    _useState16 = _slicedToArray(_useState15, 2),
    open = _useState16[0],
    setOpen = _useState16[1];
  useEffect(function () {
    var calc = function calc() {
      var box = boxRef.current,
        m = measureRef.current;
      if (!box || !m) return;
      var avail = box.clientWidth - 8;
      var widths = _toConsumableArray(m.children).map(function (c) {
        return c.offsetWidth;
      });
      var MORE = 64;
      var used = 0,
        n = 0;
      for (var i = 0; i < widths.length; i++) {
        var needMore = i < widths.length - 1 ? MORE : 0;
        if (used + widths[i] + needMore > avail) break;
        used += widths[i];
        n++;
      }
      setFit(n);
    };
    calc();
    var ro = new ResizeObserver(calc);
    if (boxRef.current) ro.observe(boxRef.current);
    return function () {
      return ro.disconnect();
    };
  }, [entries.length]);
  var shown = entries.slice(0, fit),
    hidden = entries.slice(fit);
  return /*#__PURE__*/React.createElement("div", {
    ref: boxRef,
    style: {
      display: 'flex',
      alignItems: 'center',
      flex: '1 1 150px',
      minWidth: 84,
      height: '100%',
      borderRight: '1px solid var(--border)',
      padding: '0 4px',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
    ref: measureRef,
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      visibility: 'hidden',
      pointerEvents: 'none',
      display: 'flex',
      height: 0,
      overflow: 'hidden'
    }
  }, entries.map(function (_ref16) {
    var _ref17 = _slicedToArray(_ref16, 2),
      k = _ref17[0],
      v = _ref17[1];
    return /*#__PURE__*/React.createElement(ResourceChip, {
      key: k,
      label: k,
      value: v
    });
  })), shown.map(function (_ref18) {
    var _ref19 = _slicedToArray(_ref18, 2),
      k = _ref19[0],
      v = _ref19[1];
    return /*#__PURE__*/React.createElement(ResourceChip, {
      key: k,
      label: k,
      value: v
    });
  }), hidden.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '100%',
      display: 'flex',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setOpen(function (o) {
        return !o;
      });
    },
    title: "More resources",
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      padding: '3px 8px',
      margin: '0 6px',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      background: open ? 'var(--bg4)' : 'transparent',
      border: "1px solid ".concat(open ? 'var(--amber)' : 'var(--border)'),
      color: 'var(--text)'
    }
  }, "\u25BE +", hidden.length), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setOpen(false);
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 190
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      position: 'absolute',
      top: '100%',
      left: 0,
      zIndex: 200,
      minWidth: 180,
      background: 'var(--bg2)',
      borderColor: 'var(--amber)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
      padding: '4px 0'
    }
  }, hidden.map(function (_ref20) {
    var _ref21 = _slicedToArray(_ref20, 2),
      k = _ref21[0],
      v = _ref21[1];
    return /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        height: 34,
        display: 'flex'
      }
    }, /*#__PURE__*/React.createElement(ResourceChip, {
      label: k,
      value: v,
      block: true
    }));
  })))));
}

// Top bar resources come from the game code (ZI.getTopBarResources in game/economy.js), re-read every second and
// whenever the stash or loadout changes, so crafting, loot and spending show up without a reload.
function useTopBarResources() {
  var read = function read() {
    return ZI.getTopBarResources ? ZI.getTopBarResources() : {};
  };
  var _useState17 = useState(read),
    _useState18 = _slicedToArray(_useState17, 2),
    res = _useState18[0],
    setRes = _useState18[1];
  useEffect(function () {
    var refresh = function refresh() {
      return setRes(read());
    };
    var t = setInterval(refresh, 1000);
    var off = ZI.onInventoryChange ? ZI.onInventoryChange(refresh) : null;
    return function () {
      clearInterval(t);
      if (off) off();
    };
  }, []);
  return res;
}
function ResourceChip(_ref22) {
  var label = _ref22.label,
    value = _ref22.value,
    block = _ref22.block;
  var _useState19 = useState(false),
    _useState20 = _slicedToArray(_useState19, 2),
    rmatOpen = _useState20[0],
    setRmatOpen = _useState20[1];
  var colors = {
    Food: 'var(--green2)',
    Scrap: 'var(--text2)',
    Ammo: 'var(--amber)',
    Medicine: 'var(--blue)',
    Fuel: 'var(--red2)',
    RMAT: 'var(--purple)'
  };
  // Nutrition is a 0–100 meter: colour it by its FOOD level (Starving … Peak Fueled).
  var color = label === 'Nutrition' ? value.pending ? 'var(--text3)' : getNutritionLevel(value.current).color : value.pending ? 'var(--text3)' : colors[label] || 'var(--text2)';
  var shown = value.pending ? '—' : label === 'Nutrition' ? "".concat(Math.round(value.current), "%") : fmt(value.current);
  if (label === 'RMAT') {
    var holdings = ZI.getRmatHoldings ? ZI.getRmatHoldings() : {};
    var tiers = ZI.RMAT_TIERS || [];
    return /*#__PURE__*/React.createElement("div", {
      onMouseEnter: function onMouseEnter() {
        return setRmatOpen(true);
      },
      onMouseLeave: function onMouseLeave() {
        return setRmatOpen(false);
      },
      style: {
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: '100%',
        width: block ? '100%' : 'auto',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("button", {
      type: "button",
      "aria-label": "RMAT total ".concat(shown, "; show holdings by tier"),
      "aria-expanded": rmatOpen,
      onFocus: function onFocus() {
        return setRmatOpen(true);
      },
      onBlur: function onBlur() {
        return setRmatOpen(false);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '0 10px',
        height: '100%',
        width: block ? '100%' : 'auto',
        whiteSpace: 'nowrap',
        cursor: 'help',
        background: 'transparent',
        border: 0,
        borderRight: block ? 'none' : '1px solid var(--border)',
        color: 'inherit',
        fontFamily: 'inherit'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text3)',
        letterSpacing: '0.08em'
      }
    }, "RMAT"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: color,
        fontWeight: 'bold'
      }
    }, shown)), rmatOpen && /*#__PURE__*/React.createElement("div", {
      role: "region",
      "aria-label": "RMAT holdings by tier",
      style: {
        position: 'absolute',
        top: block ? 0 : '100%',
        left: block ? '100%' : 0,
        zIndex: 250,
        minWidth: 210,
        padding: 8,
        background: 'var(--bg2)',
        border: '1px solid var(--purple)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.65)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        letterSpacing: '0.08em',
        marginBottom: 5
      }
    }, "RMAT HOLDINGS \xB7 TOTAL ", shown), tiers.map(function (tier) {
      var key = 'T' + tier.tier;
      return /*#__PURE__*/React.createElement("div", {
        key: key,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 7,
          padding: '3px 2px',
          borderTop: '1px solid var(--border)'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: tier.color,
          width: 22
        }
      }, key), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-body)',
          fontSize: 11,
          color: 'var(--text)',
          flex: 1
        }
      }, tier.name), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: tier.color,
          fontWeight: 'bold'
        }
      }, fmt(holdings[key] || 0)));
    })));
  }
  return /*#__PURE__*/React.createElement("div", {
    title: value.pending ? "".concat(label, ": not built yet") : undefined,
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 5,
      padding: '0 10px',
      flexShrink: 0,
      whiteSpace: 'nowrap',
      borderRight: block ? 'none' : '1px solid var(--border)',
      height: '100%',
      width: block ? '100%' : 'auto'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)',
      letterSpacing: '0.08em',
      flex: block ? 1 : 'none'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: color,
      fontWeight: 'bold'
    }
  }, shown), value.rate > 0 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--green)',
      opacity: 0.8
    }
  }, "+", value.rate, "/m"));
}

// ─── SETTINGS (gear button in the top bar) ────────────────────────────────────
function SettingsButton() {
  var _useState21 = useState(false),
    _useState22 = _slicedToArray(_useState21, 2),
    open = _useState22[0],
    setOpen = _useState22[1];
  var _useState23 = useState(function () {
      return ZI.getSettings();
    }),
    _useState24 = _slicedToArray(_useState23, 2),
    st = _useState24[0],
    setSt = _useState24[1];
  var set = function set(k, v) {
    ZI.setSetting(k, v);
    setSt(ZI.getSettings());
  };
  var OPTS = [{
    k: 'damageNumbers',
    label: 'Damage numbers',
    desc: 'Show red damage numbers over the survivor and zombies in Wandering.'
  }];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setOpen(function (o) {
        return !o;
      });
    },
    title: "Settings",
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      padding: '3px 8px',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      background: open ? 'var(--bg4)' : 'transparent',
      border: "1px solid ".concat(open ? 'var(--amber)' : 'var(--border)'),
      color: 'var(--text)'
    }
  }, "\u2699"), open && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setOpen(false);
    },
    style: {
      position: 'fixed',
      inset: 0,
      zIndex: 190
    }
  }), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      position: 'absolute',
      top: 36,
      left: 0,
      zIndex: 200,
      width: 280,
      padding: 12,
      background: 'var(--bg2)',
      borderColor: 'var(--amber)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--amber)',
      letterSpacing: '0.12em',
      marginBottom: 8
    }
  }, "SETTINGS"), OPTS.map(function (o) {
    return /*#__PURE__*/React.createElement("label", {
      key: o.k,
      style: {
        display: 'flex',
        gap: 10,
        alignItems: 'flex-start',
        cursor: 'pointer',
        padding: '6px 0'
      }
    }, /*#__PURE__*/React.createElement("input", {
      type: "checkbox",
      checked: !!st[o.k],
      onChange: function onChange(e) {
        return set(o.k, e.target.checked);
      },
      style: {
        marginTop: 3,
        accentColor: '#ff3b3b'
      }
    }), /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        color: 'var(--text)'
      }
    }, o.label), /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'block',
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text2)',
        lineHeight: 1.4
      }
    }, o.desc)));
  }))));
}

// ─── SPLASH BACKDROP (rotating art behind the Save Files page) ────────────────
function SplashBackdrop() {
  var S = ZI.SPLASH,
    SET = ZI.SPLASH_SET;
  var boxRef = useRef(null);
  var wrapRefs = useRef({});
  var _useState25 = useState([]),
    _useState26 = _slicedToArray(_useState25, 2),
    filled = _useState26[0],
    setFilled = _useState26[1]; // filled image-slot ids
  var _useState27 = useState(ZI.getReducedGore()),
    _useState28 = _slicedToArray(_useState27, 2),
    mild = _useState28[0],
    setMild = _useState28[1];
  var _useState29 = useState(-1),
    _useState30 = _slicedToArray(_useState29, 2),
    cur = _useState30[0],
    setCur = _useState30[1]; // index into SET currently shown
  var _useState31 = useState(null),
    _useState32 = _slicedToArray(_useState31, 2),
    edit = _useState32[0],
    setEdit = _useState32[1]; // { idx, variant:'std'|'mild' } when arranging art
  var bag = useRef([]);
  var last = useRef(-1);
  var slotId = function slotId(e, v) {
    return 'splash-' + e.id.toLowerCase() + (v === 'mild' ? '-mild' : '');
  };
  // Poll which slots hold art (image-slot sets data-filled once an image is present).
  useEffect(function () {
    var read = function read() {
      var b = boxRef.current;
      if (!b) return;
      setFilled(_toConsumableArray(b.querySelectorAll('image-slot[data-filled]')).map(function (n) {
        return n.id;
      }));
    };
    read();
    var t = setInterval(read, 1500);
    return function () {
      return clearInterval(t);
    };
  }, []);
  var variantFor = function variantFor(e) {
    return mild && filled.includes(slotId(e, 'mild')) ? 'mild' : 'std';
  };
  var playable = SET.map(function (e, i) {
    return i;
  }).filter(function (i) {
    return filled.includes(slotId(SET[i], 'std')) || mild && filled.includes(slotId(SET[i], 'mild'));
  });
  var playKey = playable.join(',');
  // Shuffle bag: every image once before repeats, never back-to-back across refills.
  var nextIdx = function nextIdx() {
    var pool = playable;
    if (!pool.length) return -1;
    bag.current = bag.current.filter(function (i) {
      return pool.includes(i);
    });
    if (!bag.current.length) {
      var b = pool.slice();
      for (var i = b.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var _ref23 = [b[j], b[i]];
        b[i] = _ref23[0];
        b[j] = _ref23[1];
      }
      if (b.length > 1 && b[0] === last.current) {
        var _ref24 = [b[b.length - 1], b[0]];
        b[0] = _ref24[0];
        b[b.length - 1] = _ref24[1];
      }
      bag.current = b;
    }
    var n = bag.current.shift();
    last.current = n;
    return n;
  };
  // Rotation timer (random 25–30 s), paused while the tab is hidden or art is being arranged.
  useEffect(function () {
    if (edit) return;
    if (!playable.length) {
      setCur(-1);
      return;
    }
    if (cur < 0 || !playable.includes(cur)) {
      setCur(nextIdx());
      return;
    }
    if (playable.length < 2) return;
    var remain = (S.MIN_S + Math.random() * (S.MAX_S - S.MIN_S)) * 1000,
      t0 = Date.now(),
      t = null;
    var arm = function arm() {
      t0 = Date.now();
      t = setTimeout(function () {
        return setCur(nextIdx());
      }, remain);
    };
    var vis = function vis() {
      if (document.hidden) {
        clearTimeout(t);
        remain -= Date.now() - t0;
      } else arm();
    };
    arm();
    document.addEventListener('visibilitychange', vis);
    return function () {
      clearTimeout(t);
      document.removeEventListener('visibilitychange', vis);
    };
  }, [cur, playKey, edit]);
  // Ken Burns: slow zoom + drift across the display interval (+ fade) on activation.
  useEffect(function () {
    if (cur < 0) return;
    var el = wrapRefs.current[cur + variantFor(SET[cur])];
    if (!el) return;
    var r = function r() {
      return ((Math.random() * 2 - 1) * S.PAN * 100).toFixed(2);
    };
    var dur = S.MAX_S + S.FADE_S;
    el.style.transition = 'none';
    el.style.transform = "translate(".concat(r(), "%, ").concat(r(), "%) scale(1)");
    void el.offsetWidth;
    el.style.transition = "transform ".concat(dur, "s linear");
    el.style.transform = "translate(".concat(r(), "%, ").concat(r(), "%) scale(").concat(S.SCALE_END, ")");
  }, [cur, mild]);
  var toggleMild = function toggleMild() {
    var v = !mild;
    setMild(v);
    ZI.setReducedGore(v);
  };
  var count = SET.filter(function (e) {
    return filled.includes(slotId(e, 'std'));
  }).length;
  var E = edit ? SET[edit.idx] : null;
  return /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    ref: boxRef,
    style: {
      position: 'absolute',
      inset: 0,
      overflow: 'hidden',
      zIndex: edit ? 60 : 0,
      background: 'radial-gradient(ellipse at 30% 20%, #1c1a15 0%, #0b0a08 70%)'
    }
  }, SET.map(function (e, i) {
    return ['std', 'mild'].map(function (v) {
      var shown = edit ? edit.idx === i && edit.variant === v : cur === i && variantFor(e) === v;
      return /*#__PURE__*/React.createElement("div", {
        key: e.id + v,
        ref: function ref(n) {
          if (n) wrapRefs.current[i + v] = n;
        },
        style: {
          position: 'absolute',
          inset: edit ? 0 : '-5%',
          opacity: shown ? 1 : 0,
          transition: "opacity ".concat(S.FADE_S, "s ease-in-out"),
          pointerEvents: edit && shown ? 'auto' : 'none',
          visibility: edit && !shown ? 'hidden' : 'visible'
        }
      }, /*#__PURE__*/React.createElement("image-slot", {
        id: slotId(e, v),
        shape: "rect",
        fit: "cover",
        placeholder: "".concat(e.id, " \xB7 ").concat(e.title).concat(v === 'mild' ? ' (mild)' : '', " \u2014 drop artwork here"),
        style: {
          width: '100%',
          height: '100%',
          display: 'block'
        }
      }));
    });
  }), !edit && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      background: "rgba(0,0,0,".concat(S.DIM, ")")
    }
  }), !edit && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 35%, rgba(0,0,0,0.75) 100%)'
    }
  })), edit ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      zIndex: 61,
      padding: '10px 14px',
      background: 'rgba(8,8,6,0.88)',
      borderBottom: '1px solid var(--amber)',
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: function onClick() {
      return setEdit({
        idx: (edit.idx + SET.length - 1) % SET.length,
        variant: edit.variant
      });
    }
  }, "\u25C0"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 240px',
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--amber)',
      letterSpacing: '0.1em'
    }
  }, E.id, " \xB7 ", E.kind.toUpperCase(), " \xB7 ", edit.idx + 1, "/", SET.length), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 18,
      color: 'var(--text)'
    }
  }, E.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--text2)'
    }
  }, E.brief)), E.gore && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, ['std', 'mild'].map(function (v) {
    return /*#__PURE__*/React.createElement("button", {
      key: v,
      className: edit.variant === v ? 'btn btn-amber' : 'btn',
      onClick: function onClick() {
        return setEdit({
          idx: edit.idx,
          variant: v
        });
      }
    }, v === 'std' ? 'Standard' : 'Mild');
  })), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: function onClick() {
      return setEdit({
        idx: (edit.idx + 1) % SET.length,
        variant: edit.variant
      });
    }
  }, "\u25B6"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    onClick: function onClick() {
      return setEdit(null);
    }
  }, "Done")) : /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 14,
      bottom: 14,
      zIndex: 5,
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: toggleMild,
    title: "Use the mild version of gore scenes when one has been added"
  }, mild ? '☑' : '☐', " Reduced gore"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: function onClick() {
      return setEdit({
        idx: cur >= 0 ? cur : 0,
        variant: 'std'
      });
    }
  }, "\uD83D\uDDBC Splash art ", count, "/", SET.length)));
}

// ─── SAVE FILES SCREEN (shown after choosing a game mode) ─────────────────────
function SaveFilesScreen(_ref25) {
  var mode = _ref25.mode,
    onBack = _ref25.onBack;
  var _useState33 = useState(0),
    _useState34 = _slicedToArray(_useState33, 2),
    force = _useState34[1];
  var _useState35 = useState(null),
    _useState36 = _slicedToArray(_useState35, 2),
    confirm = _useState36[0],
    setConfirm = _useState36[1]; // { slot, action }
  var _useState37 = useState(null),
    _useState38 = _slicedToArray(_useState37, 2),
    notice = _useState38[0],
    setNotice = _useState38[1]; // { ok, text } — export/import result
  var _useState39 = useState(null),
    _useState40 = _slicedToArray(_useState39, 2),
    creating = _useState40[0],
    setCreating = _useState40[1]; // Oct 29: slot number while the Character Creation steps are open
  var fileInput = React.useRef(null);
  var importTarget = React.useRef(null);
  var isCamp = mode === 'camp';
  var accent = isCamp ? 'var(--green)' : 'var(--amber)';
  var slots = ZI.listSlots(mode);
  var fmt = function fmt(ts) {
    return ts ? new Date(ts).toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : '';
  };
  var act = function act(slot, action) {
    // Oct 29: New Game opens Character Creation; the save is created only after "Start Surviving".
    if (action === 'new' || action === 'overwrite') {
      setConfirm(null);
      if (window.CharacterCreationScreen && ZI.CHAR_CREATION) setCreating(slot);else ZI.startNewInSlot(mode, slot);
    } else if (action === 'load') {
      if (!ZI.loadSlot(mode, slot)) setNotice({
        ok: false,
        text: "File ".concat(slot, " is damaged and has no good backup copy, so it cannot be loaded. Your other files are safe. You can Import an exported copy into it, or Delete it.")
      });
    } else if (action === 'delete') {
      ZI.deleteSlot(mode, slot);
      setConfirm(null);
      force(function (n) {
        return n + 1;
      });
    } else if (action === 'export') {
      var r = ZI.exportSlot(mode, slot);
      if (!r.ok) {
        setNotice({
          ok: false,
          text: r.reason
        });
        return;
      }
      var url = URL.createObjectURL(new Blob([r.text], {
        type: 'application/json'
      }));
      var a = document.createElement('a');
      a.href = url;
      a.download = r.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () {
        return URL.revokeObjectURL(url);
      }, 1000);
      setNotice({
        ok: true,
        text: "File ".concat(slot, " exported as ").concat(r.fileName, ". Open the game on the other site and use Import there.")
      });
    } else if (action === 'import') {
      setConfirm(null);
      importTarget.current = slot;
      if (fileInput.current) {
        fileInput.current.value = '';
        fileInput.current.click();
      }
    }
  };
  var onImportFile = function onImportFile(e) {
    var f = e.target.files && e.target.files[0],
      slot = importTarget.current;
    if (!f || !slot) return;
    var rd = new FileReader();
    rd.onerror = function () {
      return setNotice({
        ok: false,
        text: 'The file could not be read.'
      });
    };
    rd.onload = function () {
      var r = ZI.importSlot(String(rd.result || ''), mode, slot);
      if (!r.ok) {
        setNotice({
          ok: false,
          text: r.reason
        });
        return;
      }
      if (r.intoActive) {
        ZI._boot(mode, slot);
        return;
      } // the live file was replaced: reload into it
      setNotice({
        ok: true,
        text: "Imported into File ".concat(slot, ". Press Continue to play it.")
      });
      force(function (n) {
        return n + 1;
      });
    };
    rd.readAsText(f);
  };
  if (creating) return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '100%',
      overflow: 'hidden',
      background: 'var(--bg)'
    }
  }, /*#__PURE__*/React.createElement(CharacterCreationScreen, {
    mode: mode,
    slot: creating,
    onCancel: function onCancel() {
      return setCreating(null);
    },
    onConfirm: function onConfirm(profile) {
      return ZI.startNewInSlot(mode, creating, profile);
    }
  }));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '100%',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(SplashBackdrop, null), /*#__PURE__*/React.createElement("div", {
    className: "screen-enter",
    style: {
      position: 'relative',
      zIndex: 1,
      height: '100%',
      overflow: 'auto',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      padding: '40px 20px 70px',
      pointerEvents: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 760,
      pointerEvents: 'auto'
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: onBack,
    className: "btn",
    style: {
      marginBottom: 18
    }
  }, "\u2190 Change game mode"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: accent,
      letterSpacing: '0.2em',
      marginBottom: 6
    }
  }, isCamp ? 'CAMP LEADER' : 'SOLO SURVIVOR'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 30,
      color: 'var(--text)',
      marginBottom: 6
    }
  }, "Save Files"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--text2)',
      marginBottom: 22
    }
  }, "Start a new file or continue where you left off. Use \uD83D\uDCBE Save in the top bar to keep your progress."), /*#__PURE__*/React.createElement("input", {
    ref: fileInput,
    type: "file",
    accept: ".json,application/json",
    style: {
      display: 'none'
    },
    onChange: onImportFile
  }), notice && /*#__PURE__*/React.createElement("div", {
    role: "status",
    style: {
      marginBottom: 12,
      padding: '8px 12px',
      border: "1px solid ".concat(notice.ok ? accent : 'var(--red2)'),
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: notice.ok ? 'var(--text)' : 'var(--red2)',
      display: 'flex',
      gap: 10,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flex: 1
    }
  }, notice.text), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: function onClick() {
      return setNotice(null);
    }
  }, "OK")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 12
    }
  }, slots.map(function (sl) {
    return /*#__PURE__*/React.createElement("div", {
      key: sl.slot,
      className: "panel",
      style: {
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
        borderColor: sl.empty ? 'var(--border)' : accent
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 54,
        height: 54,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: "2px solid ".concat(sl.empty ? 'var(--border)' : accent),
        fontFamily: 'var(--font-title)',
        fontSize: 22,
        color: sl.empty ? 'var(--text3)' : accent
      }
    }, sl.slot), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: '1 1 220px',
        minWidth: 0
      }
    }, sl.empty ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 16,
        color: 'var(--text2)'
      }
    }, "Empty slot"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text3)',
        marginTop: 3
      }
    }, "No saved progress")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 16,
        color: 'var(--text)'
      }
    }, sl.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text2)',
        marginTop: 3,
        display: 'flex',
        gap: 14,
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", null, "Saved ", fmt(sl.savedAt)), sl.summary && /*#__PURE__*/React.createElement("span", null, "Leader Lv ", sl.summary.level), sl.summary && /*#__PURE__*/React.createElement("span", null, sl.summary.distance.toLocaleString(), " m travelled")))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        flexWrap: 'wrap'
      }
    }, confirm && confirm.slot === sl.slot ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--red2)',
        alignSelf: 'center'
      }
    }, confirm.action === 'delete' ? 'Delete this file?' : confirm.action === 'import' ? 'Replace this file with an imported save?' : 'Overwrite with a new game?'), /*#__PURE__*/React.createElement("button", {
      className: "btn",
      style: {
        borderColor: 'var(--red2)',
        color: 'var(--red2)'
      },
      onClick: function onClick() {
        return act(sl.slot, confirm.action);
      }
    }, "Yes"), /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: function onClick() {
        return setConfirm(null);
      }
    }, "Cancel")) : sl.empty ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-amber",
      onClick: function onClick() {
        return act(sl.slot, 'new');
      }
    }, "+ New Game"), /*#__PURE__*/React.createElement("button", {
      className: "btn",
      title: "Load a save file exported from another browser or site",
      onClick: function onClick() {
        return act(sl.slot, 'import');
      }
    }, "Import")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
      className: "btn btn-amber",
      onClick: function onClick() {
        return act(sl.slot, 'load');
      }
    }, "\u25B6 Continue"), /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: function onClick() {
        return setConfirm({
          slot: sl.slot,
          action: 'overwrite'
        });
      }
    }, "New Game"), /*#__PURE__*/React.createElement("button", {
      className: "btn",
      title: "Download this file to move it to another browser or site",
      onClick: function onClick() {
        return act(sl.slot, 'export');
      }
    }, "Export"), /*#__PURE__*/React.createElement("button", {
      className: "btn",
      title: "Replace this file with a save file exported elsewhere",
      onClick: function onClick() {
        return setConfirm({
          slot: sl.slot,
          action: 'import'
        });
      }
    }, "Import"), /*#__PURE__*/React.createElement("button", {
      className: "btn",
      style: {
        color: 'var(--red2)'
      },
      onClick: function onClick() {
        return setConfirm({
          slot: sl.slot,
          action: 'delete'
        });
      }
    }, "Delete"))));
  })))));
}

// ─── MODE SELECT SCREEN ───────────────────────────────────────────────────────
function ModeSelectScreen(_ref26) {
  var onSelect = _ref26.onSelect;
  var _useState41 = useState(null),
    _useState42 = _slicedToArray(_useState41, 2),
    hovered = _useState42[0],
    setHovered = _useState42[1];
  return /*#__PURE__*/React.createElement("div", {
    className: "screen-enter",
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'safe center',
      background: 'var(--bg)',
      position: 'relative',
      overflowX: 'hidden',
      overflowY: 'auto',
      padding: '16px 0'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0.06,
      backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
      backgroundSize: '48px 48px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      marginBottom: 56,
      position: 'relative',
      zIndex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 60,
      lineHeight: 1,
      color: 'var(--amber)',
      letterSpacing: '0.04em',
      textShadow: '0 0 60px rgba(200,169,110,0.3)'
    }
  }, "ZOMBIE IDLER"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      letterSpacing: '0.35em',
      color: 'var(--text2)',
      marginTop: 10,
      textTransform: 'uppercase'
    }
  }, "Two survival fantasies. One apocalypse."), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 180,
      height: 1,
      background: 'linear-gradient(90deg, transparent, var(--amber), transparent)',
      margin: '16px auto 0'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 32,
      position: 'relative',
      zIndex: 1
    }
  }, [{
    id: 'camp',
    title: 'CAMP LEADER',
    subtitle: 'The Overseer',
    desc: 'Command a fragile settlement. Automate production, assign survivors, and defend against escalating hordes.',
    pillars: ['Base Construction', 'Survivor Workforce', 'Horde Defense', 'Idle Production', 'Long-term Optimization'],
    color: 'var(--green)',
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "64",
      height: "64",
      viewBox: "0 0 64 64",
      fill: "none"
    }, /*#__PURE__*/React.createElement("rect", {
      x: "8",
      y: "32",
      width: "14",
      height: "20",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "26",
      y: "24",
      width: "12",
      height: "28",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5"
    }), /*#__PURE__*/React.createElement("rect", {
      x: "42",
      y: "36",
      width: "14",
      height: "16",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "4",
      y1: "52",
      x2: "60",
      y2: "52",
      stroke: "currentColor",
      strokeWidth: "1.5"
    }), /*#__PURE__*/React.createElement("polyline", {
      points: "4,36 15,24 28,16 36,16 48,24 60,36",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1",
      strokeDasharray: "3 2",
      opacity: "0.4"
    }))
  }, {
    id: 'solo',
    title: 'SOLO SURVIVOR',
    subtitle: 'The Wanderer',
    desc: 'Traverse lethal biomes alone. Scavenge rare RMAT, repair vehicles, and extract through high-risk expeditions.',
    pillars: ['Biome Traversal', 'RMAT Extraction', 'Gear & Vehicles', 'Hideout Upgrades', 'Risk Runs'],
    color: 'var(--amber)',
    icon: /*#__PURE__*/React.createElement("svg", {
      width: "64",
      height: "64",
      viewBox: "0 0 64 64",
      fill: "none"
    }, /*#__PURE__*/React.createElement("circle", {
      cx: "32",
      cy: "14",
      r: "6",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1.5"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "32",
      y1: "20",
      x2: "32",
      y2: "42",
      stroke: "currentColor",
      strokeWidth: "2"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "20",
      y1: "30",
      x2: "44",
      y2: "30",
      stroke: "currentColor",
      strokeWidth: "1.5"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "32",
      y1: "42",
      x2: "22",
      y2: "54",
      stroke: "currentColor",
      strokeWidth: "1.5"
    }), /*#__PURE__*/React.createElement("line", {
      x1: "32",
      y1: "42",
      x2: "42",
      y2: "54",
      stroke: "currentColor",
      strokeWidth: "1.5"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M12 48 Q22 36 32 44 Q42 52 52 38",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "1",
      strokeDasharray: "3 2",
      opacity: "0.5"
    }))
  }].map(function (mode) {
    return /*#__PURE__*/React.createElement("div", {
      key: mode.id,
      className: "scanline-hover",
      onMouseEnter: function onMouseEnter() {
        return setHovered(mode.id);
      },
      onMouseLeave: function onMouseLeave() {
        return setHovered(null);
      },
      onClick: function onClick() {
        return onSelect(mode.id);
      },
      style: {
        width: 340,
        cursor: 'pointer',
        position: 'relative',
        border: "1px solid ".concat(hovered === mode.id ? mode.color : 'var(--border)'),
        background: hovered === mode.id ? 'var(--bg3)' : 'var(--bg2)',
        transition: 'all 0.2s',
        padding: 32,
        boxShadow: hovered === mode.id ? "0 0 40px rgba(".concat(mode.id === 'camp' ? '76,175,125' : '200,169,110', ",0.1)") : 'none'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "scanline-inner"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        color: mode.color,
        marginBottom: 20,
        display: 'flex',
        justifyContent: 'center'
      }
    }, mode.icon), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-title)',
        fontSize: 28,
        color: mode.color,
        letterSpacing: '0.06em',
        textAlign: 'center'
      }
    }, mode.title), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: 'var(--text3)',
        letterSpacing: '0.2em',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 16
      }
    }, mode.subtitle), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 1,
        background: "linear-gradient(90deg, transparent, ".concat(mode.color, ", transparent)"),
        marginBottom: 16,
        opacity: 0.4
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--text2)',
        lineHeight: 1.6,
        textAlign: 'center',
        marginBottom: 20
      }
    }, mode.desc), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, mode.pillars.map(function (p) {
      return /*#__PURE__*/React.createElement("div", {
        key: p,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("div", {
        style: {
          width: 4,
          height: 4,
          background: mode.color,
          flexShrink: 0
        }
      }), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-body)',
          fontSize: 12,
          color: 'var(--text2)',
          letterSpacing: '0.06em'
        }
      }, p));
    })), hovered === mode.id && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 24,
        display: 'flex',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        color: mode.color,
        border: "1px solid ".concat(mode.color),
        padding: '8px 24px'
      }
    }, "Begin Survival \u2192")));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 40,
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)',
      letterSpacing: '0.1em',
      position: 'relative',
      zIndex: 1,
      textAlign: 'center'
    }
  }, "Day 47 \xB7 Threat Level 2 \xB7 RMAT Storm Active \xB7 Global Marketplace Online"));
}

// ─── CAMP MAIN SCREEN ─────────────────────────────────────────────────────────
function CampMainScreen(_ref27) {
  var resources = _ref27.resources,
    setResources = _ref27.setResources,
    threatLevel = _ref27.threatLevel;
  var _useState43 = useState([{
      id: 1,
      name: 'Mira Chen',
      role: 'Engineer',
      "class": 'mechanic',
      lvl: 8,
      morale: 78,
      nutrition: 72,
      hydration: 65,
      assigned: 'workshop',
      status: 'working'
    }, {
      id: 2,
      name: 'Buck Talon',
      role: 'Guard',
      "class": 'enforcer',
      lvl: 11,
      morale: 60,
      nutrition: 45,
      hydration: 80,
      assigned: 'watchtower',
      status: 'working'
    }, {
      id: 3,
      name: 'Petra Voss',
      role: 'Medic',
      "class": 'medic',
      lvl: 7,
      morale: 88,
      nutrition: 84,
      hydration: 78,
      assigned: 'medtent',
      status: 'working'
    }, {
      id: 4,
      name: 'Cole Marsh',
      role: 'Farmer',
      "class": 'scavenger',
      lvl: 5,
      morale: 50,
      nutrition: 30,
      hydration: 40,
      assigned: 'farm',
      status: 'hungry'
    }, {
      id: 5,
      name: 'Yael Strom',
      role: 'Scavenger',
      "class": 'ranger',
      lvl: 14,
      morale: 70,
      nutrition: 68,
      hydration: 62,
      assigned: 'workshop',
      status: 'working'
    }, {
      id: 6,
      name: 'Felix Ortega',
      role: 'Engineer',
      "class": 'mechanic',
      lvl: 9,
      morale: 75,
      nutrition: 77,
      hydration: 70,
      assigned: 'forge',
      status: 'working'
    }]),
    _useState44 = _slicedToArray(_useState43, 2),
    survivors = _useState44[0],
    setSurvivors = _useState44[1];
  var _useState45 = useState([{
      id: 'farm',
      name: 'Farm',
      tier: 2,
      output: 'Food',
      rate: '+12/hr',
      status: 'active',
      workers: 1
    }, {
      id: 'workshop',
      name: 'Workshop',
      tier: 2,
      output: 'Refined Scrap',
      rate: '+8/hr',
      status: 'active',
      workers: 2
    }, {
      id: 'forge',
      name: 'Forge',
      tier: 1,
      output: 'Metal Bars',
      rate: '+4/hr',
      status: 'active',
      workers: 1
    }, {
      id: 'medtent',
      name: 'Med Tent',
      tier: 2,
      output: 'Medicine',
      rate: '+3/hr',
      status: 'active',
      workers: 1
    }, {
      id: 'watchtower',
      name: 'Watchtower',
      tier: 2,
      output: 'Threat Detect',
      rate: 'Active',
      status: 'active',
      workers: 1
    }, {
      id: 'barracks',
      name: 'Barracks',
      tier: 1,
      output: 'Morale +5%',
      rate: 'Passive',
      status: 'active',
      workers: 0
    }, {
      id: 'recycler',
      name: 'Recycler',
      tier: 1,
      output: 'Scrap Recovery',
      rate: '+2/hr',
      status: 'damaged',
      workers: 0
    }, {
      id: 'kitchen',
      name: 'Kitchen',
      tier: 2,
      output: 'Meals',
      rate: '+6/hr',
      status: 'active',
      workers: 0
    }]),
    _useState46 = _slicedToArray(_useState45, 1),
    buildings = _useState46[0];
  var _useState47 = useState(340),
    _useState48 = _slicedToArray(_useState47, 2),
    hordeTimer = _useState48[0],
    setHordeTimer = _useState48[1]; // seconds until next horde
  useEffect(function () {
    var t = setInterval(function () {
      return setHordeTimer(function (prev) {
        return prev > 0 ? prev - 1 : 720;
      });
    }, 1000);
    return function () {
      return clearInterval(t);
    };
  }, []);
  var _useState49 = useState(null),
    _useState50 = _slicedToArray(_useState49, 2),
    selectedSurvivor = _useState50[0],
    setSelectedSurvivor = _useState50[1];
  var hordePct = 1 - hordeTimer / 720;
  var hordeColor = hordePct > 0.8 ? 'var(--red2)' : hordePct > 0.5 ? 'var(--amber)' : 'var(--green)';
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
      width: 300,
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
    className: "panel-title",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Survivors (", survivors.length, "/12)"), /*#__PURE__*/React.createElement(Tag, {
    color: "var(--green2)"
  }, survivors.filter(function (s) {
    return s.status === 'working';
  }).length, " Active")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, survivors.map(function (s) {
    var nutri = getNutritionLevel(s.nutrition);
    var classObj = ZI.CLASSES.find(function (c) {
      return c.id === s["class"];
    });
    return /*#__PURE__*/React.createElement("div", {
      key: s.id,
      onClick: function onClick() {
        return setSelectedSurvivor((selectedSurvivor === null || selectedSurvivor === void 0 ? void 0 : selectedSurvivor.id) === s.id ? null : s);
      },
      style: {
        padding: '8px 10px',
        background: (selectedSurvivor === null || selectedSurvivor === void 0 ? void 0 : selectedSurvivor.id) === s.id ? 'var(--bg4)' : 'var(--bg3)',
        border: "1px solid ".concat((selectedSurvivor === null || selectedSurvivor === void 0 ? void 0 : selectedSurvivor.id) === s.id ? 'var(--amber)' : 'var(--border)'),
        cursor: 'pointer',
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
        borderRadius: '50%',
        border: "2px solid ".concat((classObj === null || classObj === void 0 ? void 0 : classObj.color) || 'var(--border2)'),
        background: 'var(--bg4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
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
        fontSize: 13,
        color: 'var(--text)',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, s.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      color: "var(--text3)"
    }, s.role), /*#__PURE__*/React.createElement(Tag, {
      color: (classObj === null || classObj === void 0 ? void 0 : classObj.color) || 'var(--text2)'
    }, (classObj === null || classObj === void 0 ? void 0 : classObj.name) || s["class"]))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text2)',
        textAlign: 'right',
        flexShrink: 0
      }
    }, "Lv", s.lvl)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 4
      }
    }, /*#__PURE__*/React.createElement(MiniStat, {
      label: "Morale",
      value: s.morale,
      color: "var(--amber)"
    }), /*#__PURE__*/React.createElement(MiniStat, {
      label: "Nutrition",
      value: s.nutrition,
      color: nutri.color
    }), /*#__PURE__*/React.createElement(MiniStat, {
      label: "Hydration",
      value: s.hydration,
      color: "var(--blue)"
    })), s.status === 'hungry' && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 5,
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--red2)'
      }
    }, "\u26A0 ", nutri.label, " \xB7 Stamina ", (nutri.staminaMod * 100).toFixed(0), "%"));
  })))), /*#__PURE__*/React.createElement("div", {
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
      padding: '10px 14px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 14,
      color: 'var(--red2)',
      letterSpacing: '0.1em',
      flexShrink: 0
    }
  }, "HORDE CLOCK"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: hordePct * 100,
    color: hordeColor,
    animated: hordePct > 0.7,
    height: 8
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      color: hordeColor,
      width: 56,
      textAlign: 'right',
      flexShrink: 0
    }
  }, Math.floor(hordeTimer / 60), ":", String(hordeTimer % 60).padStart(2, '0'))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement(StatChip, {
    label: "Defense Rating",
    value: "84/100",
    color: "var(--green)"
  }), /*#__PURE__*/React.createElement(StatChip, {
    label: "Horde Size",
    value: "~".concat(35 + threatLevel * 18),
    color: "var(--red2)"
  }), /*#__PURE__*/React.createElement(StatChip, {
    label: "Ammo Reserve",
    value: "1,240",
    color: "var(--amber)"
  }), /*#__PURE__*/React.createElement(StatChip, {
    label: "Turrets Online",
    value: "2/3",
    color: "var(--blue)"
  }), /*#__PURE__*/React.createElement(StatChip, {
    label: "Threat Level",
    value: "".concat(threatLevel, "/5"),
    color: threatLevel > 3 ? 'var(--red2)' : 'var(--amber)'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginLeft: 'auto',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      marginBottom: 3
    }
  }, "DAY 47 COMPOSITION ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontStyle: 'italic'
    }
  }, "\xB7 PZ migration model")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, [{
    label: 'Shambler',
    pct: 40,
    color: 'var(--text2)'
  }, {
    label: 'Runner',
    pct: 30,
    color: 'var(--amber)'
  }, {
    label: 'Spitter',
    pct: 18,
    color: 'var(--green)'
  }, {
    label: 'Brute',
    pct: 10,
    color: 'var(--red2)'
  }, {
    label: 'Mutant',
    pct: 2,
    color: 'var(--purple)'
  }].map(function (z) {
    return /*#__PURE__*/React.createElement("div", {
      key: z.label,
      className: "tooltip-wrap",
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: z.color
      }
    }, z.pct, "%"), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 28,
        height: 20,
        background: 'var(--bg4)',
        borderRadius: 1,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: '100%',
        background: z.color,
        height: "".concat(z.pct * 2, "%"),
        transition: 'height 0.5s'
      }
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 7,
        color: 'var(--text3)'
      }
    }, z.label.slice(0, 4)), /*#__PURE__*/React.createElement("div", {
      className: "tooltip-box"
    }, z.label, /*#__PURE__*/React.createElement("br", null), "PZ: ", z.label === 'Shambler' ? 'Slow, predictable — use noise traps' : z.label === 'Runner' ? 'Sprint on sight — use obstacles' : z.label === 'Spitter' ? 'Ranged acid — force repositioning' : z.label === 'Brute' ? 'Wall breaker — target first' : z.label === 'Mutant' ? 'Apex variant — full camp alert' : ''));
  }))))), /*#__PURE__*/React.createElement(CampInfrastructurePanel, null)), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 260,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flexShrink: 0
    }
  }, selectedSurvivor ? /*#__PURE__*/React.createElement(SurvivorDetail, {
    survivor: selectedSurvivor,
    onClose: function onClose() {
      return setSelectedSurvivor(null);
    }
  }) : /*#__PURE__*/React.createElement(ResourceSummaryPanel, {
    resources: resources
  }), /*#__PURE__*/React.createElement(LeaderSiegePanel, {
    threatLevel: threatLevel
  }), /*#__PURE__*/React.createElement(CampEventsPanel, {
    threatLevel: threatLevel
  })));
}
function MiniStat(_ref28) {
  var label = _ref28.label,
    value = _ref28.value,
    color = _ref28.color;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 2
    }
  }, label), /*#__PURE__*/React.createElement(ProgressBar, {
    value: value,
    color: color,
    height: 4
  }));
}
function StatChip(_ref29) {
  var label = _ref29.label,
    value = _ref29.value,
    color = _ref29.color;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      letterSpacing: '0.08em'
    }
  }, label), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 14,
      color: color,
      fontWeight: 'bold',
      marginTop: 1
    }
  }, value));
}
function CampInfrastructurePanel() {
  var ZI = window.ZI;
  var M = window.ZI_MATERIALS;
  var _React$useState = React.useState(null),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    sel = _React$useState2[0],
    setSel = _React$useState2[1];
  var _React$useState3 = React.useState(0),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    force = _React$useState4[1];
  var rerender = function rerender() {
    return force(function (n) {
      return n + 1;
    });
  };
  var leaderLvl = ZI.getCampLeaderLevel();
  var structures = ZI.CAMP_STRUCTURES || [];
  var tc = function tc(t) {
    return ZI.tierColor(t);
  };
  var stateColor = {
    built: 'var(--green)',
    ready: 'var(--amber)',
    locked: 'var(--text3)'
  };
  var selStruct = sel && ZI.getStructure(sel);
  var doBuild = function doBuild(id) {
    var r = ZI.buildStructure(id);
    rerender();
    if (!r.ok) window.__campMsg = r.reason;
  };
  var CostBundle = function CostBundle(_ref30) {
    var cost = _ref30.cost;
    if (!cost) return /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--green)'
      }
    }, "Max level reached.");
    var hold = ZI.getRmatHoldings();
    var comp = ZI.getComponents();
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 4
      }
    }, Object.entries(cost.materials || {}).map(function (_ref31) {
      var _M$k, _M$k2;
      var _ref32 = _slicedToArray(_ref31, 2),
        k = _ref32[0],
        q = _ref32[1];
      var have = M[k] && M[k].current || 0;
      return /*#__PURE__*/React.createElement("span", {
        key: k,
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          padding: '1px 5px',
          border: "1px solid ".concat(have >= q ? 'var(--border)' : '#f06a5a'),
          color: have >= q ? 'var(--text2)' : '#f06a5a'
        }
      }, (_M$k = M[k]) === null || _M$k === void 0 ? void 0 : _M$k.icon, " ", q, " ", ((_M$k2 = M[k]) === null || _M$k2 === void 0 ? void 0 : _M$k2.name) || k);
    }), Object.entries(cost.rmat || {}).map(function (_ref33) {
      var _ref34 = _slicedToArray(_ref33, 2),
        k = _ref34[0],
        q = _ref34[1];
      var have = hold[k] || 0;
      return /*#__PURE__*/React.createElement("span", {
        key: k,
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          padding: '1px 5px',
          border: "1px solid ".concat(have >= q ? tc(k) : '#f06a5a'),
          color: have >= q ? tc(k) : '#f06a5a'
        }
      }, "RMAT ", k, " \xD7", q);
    }), Object.entries(cost.components || {}).map(function (_ref35) {
      var _ref36 = _slicedToArray(_ref35, 2),
        k = _ref36[0],
        q = _ref36[1];
      var have = comp[k] || 0;
      return /*#__PURE__*/React.createElement("span", {
        key: k,
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          padding: '1px 5px',
          border: "1px solid ".concat(have >= q ? 'var(--purple)' : '#f06a5a'),
          color: have >= q ? 'var(--purple)' : '#f06a5a'
        }
      }, k.replace('_', ' '), " \xD7", q);
    }), cost.time && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        padding: '1px 5px',
        color: 'var(--amber)'
      }
    }, "\u23F1 ", cost.time >= 3600 ? "".concat(Math.round(cost.time / 3600), "h") : "".concat(Math.round(cost.time / 60), "m")));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative'
    }
  }, /*#__PURE__*/React.createElement("div", {
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
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Camp Overview"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)'
    }
  }, "CL Lv ", leaderLvl, " \xB7 Def ", ZI.campDefenseRating())), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 10,
      background: 'repeating-linear-gradient(0deg,transparent,transparent 23px,rgba(255,255,255,0.03) 23px,rgba(255,255,255,0.03) 24px),repeating-linear-gradient(90deg,transparent,transparent 23px,rgba(255,255,255,0.03) 23px,rgba(255,255,255,0.03) 24px)',
      border: '1px dashed var(--border)',
      margin: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
      gap: 7,
      alignContent: 'start'
    }
  }, structures.map(function (st) {
    var state = ZI.structureState(st.id);
    var lvl = ZI.structureLevel(st.id);
    var buildJob = ZI.getJobs().jobs.find(function (j) {
      return j.type === 'build' && j.refId === st.id;
    });
    var col = stateColor[state];
    var isSel = sel === st.id;
    return /*#__PURE__*/React.createElement("div", {
      key: st.id,
      onClick: function onClick() {
        return setSel(isSel ? null : st.id);
      },
      title: st.desc,
      style: {
        minHeight: 56,
        background: state === 'locked' ? 'var(--bg2)' : 'var(--bg3)',
        border: "1px solid ".concat(isSel ? 'var(--amber)' : col),
        borderTop: "3px solid ".concat(col),
        padding: '6px 8px',
        cursor: 'pointer',
        opacity: state === 'locked' ? 0.8 : 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: state === 'locked' ? 'var(--text3)' : 'var(--text)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, st.name), buildJob ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--amber)'
      }
    }, "\u23F3 ", buildJob.status === 'queued' ? 'queued' : "".concat(ZI.jobRemaining(buildJob) >= 60 ? Math.round(ZI.jobRemaining(buildJob) / 60) + 'm' : ZI.jobRemaining(buildJob) + 's')) : state === 'locked' ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)'
      }
    }, "\uD83D\uDD12 Lv ", st.requires.campLeaderLevel) : state === 'ready' ? /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--amber)'
      }
    }, "Build") : /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 2
      }
    }, Array.from({
      length: st.maxLevel
    }).map(function (_, i) {
      return /*#__PURE__*/React.createElement("span", {
        key: i,
        style: {
          width: 5,
          height: 5,
          borderRadius: '50%',
          background: i < lvl ? col : 'var(--bg4)',
          border: "1px solid ".concat(col)
        }
      });
    })), st.job && state !== 'locked' && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 7,
        color: 'var(--purple)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, "\u2691 ", st.job));
  })))), selStruct && function () {
    var state = ZI.structureState(sel);
    var lvl = ZI.structureLevel(sel);
    var cost = ZI.structureNextCost(sel);
    var afford = ZI.canAffordStructure(sel);
    return /*#__PURE__*/React.createElement("div", {
      onClick: function onClick() {
        return setSel(null);
      },
      style: {
        position: 'absolute',
        inset: 0,
        zIndex: 30,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      onClick: function onClick(e) {
        return e.stopPropagation();
      },
      style: {
        width: 'min(280px,96%)',
        maxHeight: '92%',
        overflow: 'auto',
        background: 'var(--bg2)',
        border: '1px solid var(--amber)',
        boxShadow: '0 8px 28px rgba(0,0,0,0.6)',
        padding: 12
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-title)',
        fontSize: 15,
        color: 'var(--amber)'
      }
    }, selStruct.name), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return setSel(null);
      },
      style: {
        marginLeft: 'auto',
        cursor: 'pointer',
        background: 'none',
        border: '1px solid var(--border)',
        color: 'var(--text3)',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        padding: '1px 7px'
      }
    }, "\u2715")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text2)',
        lineHeight: 1.5,
        marginBottom: 8
      }
    }, selStruct.desc), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        marginBottom: 8
      }
    }, /*#__PURE__*/React.createElement(InfoRow, {
      label: "Level",
      value: "".concat(lvl, " / ").concat(selStruct.maxLevel),
      color: "var(--text)"
    }), selStruct.job && /*#__PURE__*/React.createElement(InfoRow, {
      label: "Enables Job",
      value: selStruct.job,
      color: "var(--purple)"
    }), /*#__PURE__*/React.createElement(InfoRow, {
      label: "Unlock",
      value: "Camp Leader Lv ".concat(selStruct.requires.campLeaderLevel),
      color: ZI.getCampLeaderLevel() >= selStruct.requires.campLeaderLevel ? 'var(--green)' : 'var(--red2)'
    }), (selStruct.requires.structures || []).length > 0 && /*#__PURE__*/React.createElement(InfoRow, {
      label: "Requires",
      value: selStruct.requires.structures.map(function (p) {
        var _ZI$getStructure;
        return (_ZI$getStructure = ZI.getStructure(p)) === null || _ZI$getStructure === void 0 ? void 0 : _ZI$getStructure.name;
      }).join(', '),
      color: "var(--text2)"
    })), /*#__PURE__*/React.createElement("div", {
      className: "divider"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        margin: '8px 0 5px'
      }
    }, lvl > 0 ? "UPGRADE TO LV ".concat(lvl + 1) : 'BUILD COST'), /*#__PURE__*/React.createElement(CostBundle, {
      cost: cost
    }), cost && Object.keys(selStruct.effectPerLevel).length > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--green)',
        marginTop: 8
      }
    }, "+", Object.entries(selStruct.effectPerLevel).map(function (_ref37) {
      var _ref38 = _slicedToArray(_ref37, 2),
        k = _ref38[0],
        v = _ref38[1];
      return "".concat(v, " ").concat(k);
    }).join(', '), " per level"), cost && /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return doBuild(sel);
      },
      disabled: state === 'locked' || !afford,
      style: {
        width: '100%',
        marginTop: 10,
        padding: '8px',
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        cursor: state !== 'locked' && afford ? 'pointer' : 'not-allowed',
        background: state !== 'locked' && afford ? '#1a3020' : 'var(--bg4)',
        color: state !== 'locked' && afford ? '#3dcf8e' : 'var(--text3)',
        border: "1px solid ".concat(state !== 'locked' && afford ? '#3dcf8e' : 'var(--border)')
      }
    }, state === 'locked' ? "\uD83D\uDD12 Camp Leader Lv ".concat(selStruct.requires.campLeaderLevel) : !afford ? '✗ Insufficient resources' : lvl > 0 ? '⬆ Upgrade' : '🔨 Build')));
  }());
}
function BuildingCard(_ref39) {
  var building = _ref39.building;
  var statusColor = building.status === 'active' ? 'var(--green)' : building.status === 'damaged' ? 'var(--red2)' : 'var(--text3)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--bg3)',
      border: '1px solid var(--border)',
      padding: '8px 10px',
      cursor: 'pointer',
      transition: 'border-color 0.15s'
    },
    onMouseEnter: function onMouseEnter(e) {
      return e.currentTarget.style.borderColor = 'var(--amber)';
    },
    onMouseLeave: function onMouseLeave(e) {
      return e.currentTarget.style.borderColor = 'var(--border)';
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--text)',
      fontWeight: 500
    }
  }, building.name), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: statusColor,
      textTransform: 'uppercase'
    }
  }, building.status)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text2)',
      marginBottom: 5
    }
  }, building.output), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    color: "var(--amber2)"
  }, "T", building.tier), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--green)'
    }
  }, building.rate)), building.workers > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 5,
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, building.workers, " worker", building.workers !== 1 ? 's' : '', " assigned"));
}

// ─── MOODLES PANEL (PZ-inspired status effects) ────────────────────────────
function MoodlesPanel(_ref40) {
  var survivor = _ref40.survivor;
  // Derive moodles from survivor stats — mirrors PZ's automatic moodle system
  var moodles = [];
  var nutri = getNutritionLevel(survivor.nutrition);
  var hydration = getHydrationLevel(survivor.hydration);

  // Hunger moodle (PZ: Peckish → Hungry → Very Hungry → Famished → Starving)
  if (survivor.nutrition < 35) {
    var lvl = survivor.nutrition < 15 ? 4 : survivor.nutrition < 25 ? 3 : 2;
    moodles.push({
      key: 'hungry',
      icon: '🍖',
      label: ZI.MOODLES.Hungry.levels[lvl],
      color: ZI.MOODLES.Hungry.color,
      severity: lvl,
      penalty: "Stamina ".concat((ZI.MOODLES.Hungry.staminaPenalties[lvl] * 100).toFixed(0), "% \xB7 XP ").concat((ZI.MOODLES.Hungry.xpPenalties[lvl] * 100).toFixed(0), "%"),
      pzNote: 'PZ: Famished survivors have visibly shaking hands and reduced combat speed'
    });
  }
  if (survivor.hydration < 45) {
    var _lvl = survivor.hydration < 20 ? 3 : survivor.hydration < 32 ? 2 : 1;
    moodles.push({
      key: 'thirsty',
      icon: '💧',
      label: ZI.MOODLES.Thirsty.levels[_lvl],
      color: ZI.MOODLES.Thirsty.color,
      severity: _lvl,
      penalty: "Stamina ".concat((ZI.MOODLES.Thirsty.staminaPenalties[_lvl] * 100).toFixed(0), "% \xB7 Speed ").concat((ZI.MOODLES.Thirsty.speedPenalties[_lvl] * 100).toFixed(0), "%"),
      pzNote: 'PZ: Dehydration causes blurred vision effects and rapid stamina drain'
    });
  }
  if (survivor.morale < 50) {
    var _lvl2 = survivor.morale < 25 ? 2 : 1;
    moodles.push({
      key: 'panicked',
      icon: '😰',
      label: ZI.MOODLES.Panicked.levels[_lvl2],
      color: ZI.MOODLES.Panicked.color,
      severity: _lvl2,
      penalty: "Accuracy ".concat((ZI.MOODLES.Panicked.accuracyPenalties[_lvl2] * 100).toFixed(0), "% \xB7 Noise +").concat((ZI.MOODLES.Panicked.noisePenalties[_lvl2] * 100).toFixed(0), "%"),
      pzNote: 'PZ: Panicked survivors breathe loudly — increasing detection radius'
    });
  }
  if (survivor.status === 'hungry') {
    moodles.push({
      key: 'tired',
      icon: '😴',
      label: 'Tired',
      color: ZI.MOODLES.Tired.color,
      severity: 1,
      penalty: 'Attack Speed -10% · Awareness -15%',
      pzNote: 'PZ: Tired survivors miss more often and react slower to threats'
    });
  }
  if (survivor.id === 4) {
    // Cole Marsh — show infection for demo
    moodles.push({
      key: 'sick',
      icon: '🤢',
      label: 'Queasy',
      color: ZI.MOODLES.Sick.color,
      severity: 0,
      penalty: 'HP drain 0/hr · Stamina -5%',
      pzNote: 'PZ: Queasy can be early infection — check for bites immediately'
    });
  }
  if (moodles.length === 0) return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 8px',
      background: 'var(--bg4)',
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--green)'
    }
  }, "\u2713 No active moodles"));
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, moodles.map(function (m) {
    return /*#__PURE__*/React.createElement("div", {
      key: m.key,
      style: {
        padding: '5px 8px',
        background: 'var(--bg4)',
        borderLeft: "3px solid ".concat(m.color),
        border: "1px solid ".concat(m.color, "33")
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 11
      }
    }, m.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: m.color,
        fontWeight: 500
      }
    }, m.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 1,
        marginLeft: 'auto'
      }
    }, [0, 1, 2, 3].map(function (i) {
      return /*#__PURE__*/React.createElement("div", {
        key: i,
        style: {
          width: 5,
          height: 5,
          borderRadius: 1,
          background: i <= m.severity ? m.color : 'var(--border2)'
        }
      });
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)'
      }
    }, m.penalty), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)',
        marginTop: 2,
        fontStyle: 'italic',
        opacity: 0.7
      }
    }, m.pzNote));
  }));
}

// ─── INFECTION TRACKER (PZ's Knox Infection logic) ─────────────────────────
function InfectionTracker(_ref41) {
  var survivor = _ref41.survivor;
  // Simulate infection state
  var infectionStates = {
    1: null,
    2: null,
    3: null,
    4: {
      stage: 0,
      hoursElapsed: 2,
      source: 'Laceration (25% chance)',
      treatable: true
    },
    5: null,
    6: null
  };
  var infection = infectionStates[survivor.id];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 5,
      letterSpacing: '0.1em'
    }
  }, "INFECTION STATUS", /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 6,
      color: 'var(--text3)',
      fontSize: 8
    }
  }, "(PZ Knox Model)")), infection ? /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '7px 8px',
      background: 'rgba(139,58,42,0.15)',
      border: '1px solid var(--red)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "notif-dot"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      color: 'var(--red2)',
      fontWeight: 500
    }
  }, ZI.INFECTION.symptoms[infection.stage])), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 3
    }
  }, "Source: ", infection.source, " \xB7 ", infection.hoursElapsed, "h elapsed"), infection.treatable && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--green)'
    }
  }, "\u2713 Medical RMAT cure available (", '<', "6h window)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 2,
      marginTop: 5,
      flexWrap: 'wrap'
    }
  }, ZI.INFECTION.symptoms.map(function (s, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        padding: '1px 5px',
        background: i === infection.stage ? 'rgba(139,58,42,0.3)' : 'transparent',
        color: i === infection.stage ? 'var(--red2)' : i < infection.stage ? 'var(--text3)' : 'var(--text3)',
        border: "1px solid ".concat(i === infection.stage ? 'var(--red)' : 'var(--border)')
      }
    }, s);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 5,
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      fontStyle: 'italic'
    }
  }, "PZ: Bite = 100% fatal. Laceration = 25%. Treat immediately with Medical RMAT.")) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '5px 8px',
      background: 'var(--bg4)',
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--green)'
    }
  }, "\u2713 No active infection \xB7 Last checked: post-horde"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      marginTop: 2
    }
  }, "Bite: 100% \xB7 Laceration: 25% \xB7 Scratch: 7% infection chance")));
}

// ─── FATIGUE TRACKER (PZ-style sleep deprivation cascade) ──────────────────
function FatigueTracker(_ref42) {
  var _ref42$hoursAwake = _ref42.hoursAwake,
    hoursAwake = _ref42$hoursAwake === void 0 ? 14 : _ref42$hoursAwake;
  var phase = ZI.FATIGUE_MODEL.phases.find(function (p) {
    return hoursAwake >= p.hoursAwake[0] && hoursAwake < p.hoursAwake[1];
  }) || ZI.FATIGUE_MODEL.phases[ZI.FATIGUE_MODEL.phases.length - 1];
  var pct = clamp(hoursAwake / 24 * 100, 0, 100);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "FATIGUE"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: phase.color
    }
  }, phase.level, " \xB7 ", hoursAwake, "h awake")), /*#__PURE__*/React.createElement(ProgressBar, {
    value: pct,
    color: phase.color,
    height: 5,
    animated: hoursAwake > 20
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      marginTop: 3
    }
  }, "Combat ", phase.combatMod >= 0 ? '+' : '', (phase.combatMod * 100).toFixed(0), "% \xB7 XP ", phase.xpMod >= 0 ? '+' : '', (phase.xpMod * 100).toFixed(0), "%", /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 6,
      fontStyle: 'italic',
      opacity: 0.7
    }
  }, "\xB7 PZ: ignored fatigue \u2192 forced blackout")));
}
function SurvivorDetail(_ref43) {
  var survivor = _ref43.survivor,
    onClose = _ref43.onClose;
  var classObj = ZI.CLASSES.find(function (c) {
    return c.id === survivor["class"];
  });
  var nutri = getNutritionLevel(survivor.nutrition);
  var hydration = getHydrationLevel(survivor.hydration);
  var totalStaminaMod = nutri.staminaMod + hydration.staminaMod;
  var hoursAwake = survivor.id === 2 ? 18 : survivor.id === 4 ? 16 : 10;
  return /*#__PURE__*/React.createElement("div", {
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
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Survivor Profile"), /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    style: {
      background: 'none',
      border: 'none',
      color: 'var(--text3)',
      cursor: 'pointer',
      fontSize: 14,
      lineHeight: 1
    }
  }, "\u2715")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 44,
      height: 44,
      borderRadius: '50%',
      border: "2px solid ".concat((classObj === null || classObj === void 0 ? void 0 : classObj.color) || 'var(--amber)'),
      background: 'var(--bg4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-title)',
      fontSize: 20,
      color: (classObj === null || classObj === void 0 ? void 0 : classObj.color) || 'var(--amber)',
      flexShrink: 0
    }
  }, survivor.name[0]), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      color: 'var(--text)',
      fontWeight: 600
    }
  }, survivor.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--text2)',
      letterSpacing: '0.08em'
    }
  }, survivor.role, " \xB7 Lv", survivor.lvl, " ", classObj === null || classObj === void 0 ? void 0 : classObj.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: (classObj === null || classObj === void 0 ? void 0 : classObj.color) || 'var(--amber)',
      marginTop: 2
    }
  }, classObj === null || classObj === void 0 ? void 0 : classObj.aura))), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 5,
      letterSpacing: '0.1em'
    }
  }, "MOODLES ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text3)',
      fontSize: 7,
      fontStyle: 'italic'
    }
  }, "(PZ-style cascading status)")), /*#__PURE__*/React.createElement(MoodlesPanel, {
    survivor: survivor
  })), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 5,
      letterSpacing: '0.1em'
    }
  }, "NUTRITION & HYDRATION"), /*#__PURE__*/React.createElement(NutritionBar, {
    label: "Nutrition",
    value: survivor.nutrition,
    level: nutri
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5
    }
  }), /*#__PURE__*/React.createElement(NutritionBar, {
    label: "Hydration",
    value: survivor.hydration,
    level: hydration
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 7,
      padding: '5px 8px',
      background: 'var(--bg4)',
      borderLeft: "3px solid ".concat(totalStaminaMod >= 0 ? 'var(--green)' : 'var(--red2)'),
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: totalStaminaMod >= 0 ? 'var(--green)' : 'var(--red2)'
    }
  }, "Net stamina ", totalStaminaMod >= 0 ? '+' : '', (totalStaminaMod * 100).toFixed(0), "% \xB7 Heal regen ", nutri.regenMod >= 0 ? '+' : '', (nutri.regenMod * 100).toFixed(0), "%")), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(FatigueTracker, {
    hoursAwake: hoursAwake
  })), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), /*#__PURE__*/React.createElement(InfectionTracker, {
    survivor: survivor
  }), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 6
    }
  }, "ASSIGNMENT"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5,
      flexWrap: 'wrap'
    }
  }, ZI.BUILDINGS.slice(0, 6).map(function (b) {
    return /*#__PURE__*/React.createElement("button", {
      key: b.id,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        padding: '3px 7px',
        border: "1px solid ".concat(survivor.assigned === b.id ? 'var(--amber)' : 'var(--border)'),
        background: survivor.assigned === b.id ? 'rgba(200,169,110,0.1)' : 'var(--bg3)',
        color: survivor.assigned === b.id ? 'var(--amber)' : 'var(--text2)',
        cursor: 'pointer'
      }
    }, b.name);
  })))));
}
function NutritionBar(_ref44) {
  var label = _ref44.label,
    value = _ref44.value,
    level = _ref44.level;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: level.color
    }
  }, level.label)), /*#__PURE__*/React.createElement(ProgressBar, {
    value: value,
    color: level.color,
    height: 5
  }));
}
function ResourceSummaryPanel(_ref45) {
  var resources = _ref45.resources;
  return /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Resource Overview"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, Object.entries(resources).map(function (_ref46) {
    var _ref47 = _slicedToArray(_ref46, 2),
      key = _ref47[0],
      val = _ref47[1];
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text2)',
        width: 64,
        flexShrink: 0
      }
    }, key), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(ProgressBar, {
      value: val.current / val.max * 100,
      color: key === 'Food' ? 'var(--green2)' : key === 'RMAT' ? 'var(--purple)' : key === 'Ammo' ? 'var(--amber)' : key === 'Medicine' ? 'var(--blue)' : key === 'Fuel' ? 'var(--red2)' : 'var(--text2)',
      height: 5
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text)',
        width: 50,
        textAlign: 'right',
        flexShrink: 0
      }
    }, fmt(val.current)), val.rate > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--green)',
        width: 40,
        flexShrink: 0
      }
    }, "+", val.rate, "/m"));
  })));
}

// The active-combat model lives in ZI.simulateCombat / resolveAttack; this is a
// light real-time surface (Attack/Dodge/Item/Auto) over the same math.
function ActiveCombatView(_ref48) {
  var enemy = _ref48.enemy,
    onResolve = _ref48.onResolve,
    survivorBlock = _ref48.survivorBlock;
  var ZI = window.ZI;
  var F = ZI.STAT_FORMULAS;
  var _React$useState5 = React.useState(function () {
      return Object.assign({}, survivorBlock || F.survivorStatBlock());
    }),
    _React$useState6 = _slicedToArray(_React$useState5, 1),
    s = _React$useState6[0];
  var _React$useState7 = React.useState(function () {
      return Object.assign({}, ZI.STAT_FORMULAS.enemyStatBlock(enemy));
    }),
    _React$useState8 = _slicedToArray(_React$useState7, 1),
    e = _React$useState8[0];
  var _React$useState9 = React.useState(s.hp),
    _React$useState0 = _slicedToArray(_React$useState9, 2),
    sHp = _React$useState0[0],
    setSHp = _React$useState0[1];
  var _React$useState1 = React.useState(e.hp),
    _React$useState10 = _slicedToArray(_React$useState1, 2),
    eHp = _React$useState10[0],
    setEHp = _React$useState10[1];
  var _React$useState11 = React.useState([]),
    _React$useState12 = _slicedToArray(_React$useState11, 2),
    log = _React$useState12[0],
    setLog = _React$useState12[1];
  var _React$useState13 = React.useState(true),
    _React$useState14 = _slicedToArray(_React$useState13, 2),
    dodgeReady = _React$useState14[0],
    setDodgeReady = _React$useState14[1];
  var _React$useState15 = React.useState(false),
    _React$useState16 = _slicedToArray(_React$useState15, 2),
    hitWindow = _React$useState16[0],
    setHitWindow = _React$useState16[1];
  var _React$useState17 = React.useState([]),
    _React$useState18 = _slicedToArray(_React$useState17, 2),
    floaters = _React$useState18[0],
    setFloaters = _React$useState18[1];
  var doneRef = React.useRef(false);
  var dodgeArmedRef = React.useRef(0);
  var pushLog = function pushLog(by, r) {
    return setLog(function (l) {
      return [].concat(_toConsumableArray(l.slice(-5)), [_objectSpread({
        by: by
      }, r)]);
    });
  };
  var floater = function floater(val, crit, side) {
    var id = Math.random();
    setFloaters(function (f) {
      return [].concat(_toConsumableArray(f), [{
        id: id,
        val: val,
        crit: crit,
        side: side
      }]);
    });
    setTimeout(function () {
      return setFloaters(function (f) {
        return f.filter(function (x) {
          return x.id !== id;
        });
      });
    }, 700);
  };

  // Rhythm window for timed hits.
  React.useEffect(function () {
    var t = setInterval(function () {
      setHitWindow(true);
      setTimeout(function () {
        return setHitWindow(false);
      }, 550);
    }, 1600);
    return function () {
      return clearInterval(t);
    };
  }, []);
  var finish = function finish(outcome) {
    if (doneRef.current) return;
    doneRef.current = true;
    onResolve({
      outcome: outcome,
      hpLeft: Math.max(0, sHp)
    });
  };

  // Enemy attacks on its initiative cadence.
  React.useEffect(function () {
    if (doneRef.current) return;
    var ms = Math.max(700, 2600 - (e.initiative || 8) * 60);
    var t = setInterval(function () {
      if (doneRef.current) return;
      // Timed dodge → guaranteed evade if armed within window.
      if (Date.now() - dodgeArmedRef.current < 600) {
        pushLog('enemy', {
          result: 'dodged'
        });
        return;
      }
      var r = F.resolveAttack(e, _objectSpread(_objectSpread({}, s), {}, {
        hp: sHp,
        evasion: s.evasion
      }));
      if (r.result === 'miss') {
        pushLog('enemy', r);
        return;
      }
      floater(r.dealt, r.result === 'crit', 'survivor');
      setSHp(function (h) {
        var nh = Math.max(0, h - r.dealt);
        if (nh <= 0) finish('downed');
        return nh;
      });
      pushLog('enemy', r);
    }, ms);
    return function () {
      return clearInterval(t);
    };
  }, [sHp, eHp]);
  var attack = function attack() {
    if (doneRef.current) return;
    var atk = _objectSpread(_objectSpread({}, s), {}, {
      hp: sHp
    });
    if (hitWindow) {
      atk.accuracy += 15;
      atk.crit += 20;
    } // timed-hit bonus (capped by design)
    var r = F.resolveAttack(atk, _objectSpread(_objectSpread({}, e), {}, {
      hp: eHp
    }));
    if (r.result === 'miss') {
      pushLog('survivor', r);
      return;
    }
    floater(r.dealt, r.result === 'crit', 'enemy');
    setEHp(function (h) {
      var nh = Math.max(0, h - r.dealt);
      if (nh <= 0) finish('win');
      return nh;
    });
    pushLog('survivor', r);
  };
  var dodge = function dodge() {
    if (!dodgeReady || doneRef.current) return;
    dodgeArmedRef.current = Date.now();
    setDodgeReady(false);
    setTimeout(function () {
      return setDodgeReady(true);
    }, 2500);
  };
  var auto = function auto() {
    if (doneRef.current) return;
    var res = ZI.simulateCombat(_objectSpread(_objectSpread({}, s), {}, {
      hp: sHp
    }), _objectSpread(_objectSpread({}, e), {}, {
      hp: eHp
    }), 'idle');
    finish(res.outcome);
  };
  var flee = function flee() {
    if (doneRef.current) return;
    var chance = F.escapeChance(ZI.statLevel('stealth'), ZI.statLevel('athletics'), s.initiative * 4, enemy);
    if (Math.random() * 100 < chance) finish('flee');else pushLog('enemy', {
      result: 'flee failed'
    });
  };
  var Bar = function Bar(_ref49) {
    var hp = _ref49.hp,
      max = _ref49.max,
      color = _ref49.color,
      label = _ref49.label;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", {
      style: {
        color: color
      }
    }, Math.max(0, hp), "/", max)), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 10,
        background: 'var(--bg4)',
        borderRadius: 3
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: "".concat(Math.max(0, hp / max * 100), "%"),
        background: color,
        borderRadius: 3,
        transition: 'width 0.2s'
      }
    })));
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 90,
      background: 'rgba(6,5,4,0.96)',
      display: 'flex',
      flexDirection: 'column',
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 14,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Bar, {
    hp: sHp,
    max: s.hpMax,
    color: "var(--green)",
    label: s.name
  }), /*#__PURE__*/React.createElement(Bar, {
    hp: eHp,
    max: e.hpMax,
    color: "var(--red2)",
    label: e.name
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      border: '1px dashed var(--border)',
      background: 'radial-gradient(circle at center, rgba(139,58,42,0.08), transparent)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 48
    }
  }, "\uD83E\uDDCD"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 52
    }
  }, "\uD83E\uDDDF"), floaters.map(function (f) {
    return /*#__PURE__*/React.createElement("div", {
      key: f.id,
      style: {
        position: 'absolute',
        left: f.side === 'enemy' ? '70%' : '25%',
        top: '30%',
        fontFamily: 'var(--font-mono)',
        fontSize: f.crit ? 24 : 16,
        fontWeight: 'bold',
        color: f.side === 'enemy' ? 'var(--amber2)' : 'var(--red2)',
        animation: 'fadeIn 0.2s',
        pointerEvents: 'none'
      }
    }, f.val, f.crit ? '!' : '');
  }), hitWindow && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      bottom: 8,
      left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--green)'
    }
  }, "\u25C9 STRIKE WINDOW")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: attack,
    style: {
      flex: 2,
      padding: '12px',
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      cursor: 'pointer',
      background: hitWindow ? 'rgba(80,200,120,0.2)' : '#2a1a1a',
      border: "1px solid ".concat(hitWindow ? 'var(--green)' : 'var(--red2)'),
      color: hitWindow ? 'var(--green)' : 'var(--red2)'
    }
  }, "\u2694 Attack", hitWindow ? ' ✦' : ''), /*#__PURE__*/React.createElement("button", {
    onClick: dodge,
    disabled: !dodgeReady,
    style: {
      flex: 1,
      padding: '12px',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      cursor: dodgeReady ? 'pointer' : 'not-allowed',
      background: 'var(--bg4)',
      border: "1px solid ".concat(dodgeReady ? 'var(--blue)' : 'var(--border)'),
      color: dodgeReady ? 'var(--blue)' : 'var(--text3)'
    }
  }, "\uD83D\uDCA8 Dodge"), /*#__PURE__*/React.createElement("button", {
    onClick: flee,
    style: {
      flex: 1,
      padding: '12px',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      cursor: 'pointer',
      background: 'var(--bg4)',
      border: '1px solid var(--amber)',
      color: 'var(--amber)'
    }
  }, "\uD83C\uDFC3 Flee"), /*#__PURE__*/React.createElement("button", {
    onClick: auto,
    style: {
      flex: 1,
      padding: '12px',
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      cursor: 'pointer',
      background: 'var(--bg4)',
      border: '1px solid var(--text3)',
      color: 'var(--text2)'
    }
  }, "\u23E9 Auto")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      marginTop: 6,
      textAlign: 'center'
    }
  }, "Tap Attack in the strike window for +accuracy/+crit \xB7 Dodge just before a hit to guarantee evade \xB7 Auto hands the fight to the engine"));
}
function LeaderSiegePanel(_ref50) {
  var threatLevel = _ref50.threatLevel;
  var ZI = window.ZI;
  var _React$useState19 = React.useState(0),
    _React$useState20 = _slicedToArray(_React$useState19, 2),
    force = _React$useState20[1];
  React.useEffect(function () {
    var t = setInterval(function () {
      return force(function (n) {
        return n + 1;
      });
    }, 1000);
    return function () {
      return clearInterval(t);
    };
  }, []);
  var leader = ZI.getLeader();
  var status = ZI.leaderStatus();
  var statusMeta = {
    camp: {
      label: 'In Camp',
      color: 'var(--green)'
    },
    deployed: {
      label: 'Deployed',
      color: 'var(--amber)'
    },
    recovering: {
      label: 'Recovering',
      color: 'var(--red2)'
    }
  }[status];
  var fc = ZI.siegeForecast(threatLevel);
  var countdown = ZI.siegeCountdown(threatLevel);
  var fmtT = function fmtT(s) {
    return s >= 3600 ? "".concat(Math.round(s / 3600), "h") : s >= 60 ? "".concat(Math.round(s / 60), "m") : "".concat(s, "s");
  };
  var _React$useState21 = React.useState(null),
    _React$useState22 = _slicedToArray(_React$useState21, 2),
    recap = _React$useState22[0],
    setRecap = _React$useState22[1];
  var defend = function defend() {
    var r = ZI.resolveSiege(threatLevel, ZI.isLeaderDeployed());
    setRecap(r);
    force(function (n) {
      return n + 1;
    });
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Camp Leader"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10
    }
  }, !ZI.leaderChosen() ? /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 6
    }
  }, "Choose your permanent avatar:"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 4
    }
  }, ZI.LEADER_ARCHETYPES.map(function (a) {
    return /*#__PURE__*/React.createElement("button", {
      key: a.id,
      onClick: function onClick() {
        ZI.chooseLeader(a.id);
        force(function (n) {
          return n + 1;
        });
      },
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        padding: '5px 6px',
        cursor: 'pointer',
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        color: 'var(--text2)',
        textAlign: 'left'
      }
    }, a.icon, " ", a.name, /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text3)',
        fontSize: 8
      }
    }, a.lean));
  }))) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: "2px solid ".concat(statusMeta.color),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-title)',
      fontSize: 15,
      color: statusMeta.color
    }
  }, leader.name[0]), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--text)'
    }
  }, leader.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)'
    }
  }, "Lv ", ZI.leaderLevel(), " \xB7 Cmd squad ", ZI.commandSquadCap())), /*#__PURE__*/React.createElement("span", {
    className: "tag",
    style: {
      color: statusMeta.color,
      borderColor: statusMeta.color,
      background: statusMeta.color + '22'
    }
  }, statusMeta.label)), status === 'recovering' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      alignItems: 'center',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--red2)',
      flex: 1
    }
  }, "Injured \u2014 recovers in ", fmtT(ZI.leaderRecoveryRemaining())), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      ZI.treatLeader();
      force(function (n) {
        return n + 1;
      });
    },
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      cursor: 'pointer',
      background: 'rgba(80,200,120,0.12)',
      border: '1px solid var(--green)',
      color: 'var(--green)',
      padding: '2px 6px'
    }
  }, "Treat (Infirmary)")) : /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      ZI.deployLeader(!ZI.isLeaderDeployed());
      force(function (n) {
        return n + 1;
      });
    },
    title: "Deploying enables Pack Leader but risks injury",
    style: {
      width: '100%',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      padding: '5px',
      cursor: 'pointer',
      marginBottom: 8,
      background: ZI.isLeaderDeployed() ? 'rgba(200,169,110,0.15)' : 'var(--bg4)',
      border: "1px solid ".concat(ZI.isLeaderDeployed() ? 'var(--amber)' : 'var(--border)'),
      color: ZI.isLeaderDeployed() ? 'var(--amber)' : 'var(--text2)'
    }
  }, ZI.isLeaderDeployed() ? '● Deployed — recall to camp' : '○ Deploy to field (risks injury)'), /*#__PURE__*/React.createElement("div", {
    className: "divider",
    style: {
      margin: '6px 0'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: countdown <= 300 ? 'var(--red2)' : 'var(--text3)'
    }
  }, countdown <= 300 ? '⚠ SIEGE IMMINENT' : 'Next siege'), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--amber)'
    }
  }, fmtT(countdown))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      marginBottom: 4
    }
  }, "Forecast: ", fc.waves, " waves \xB7 tier ", fc.hordeTier, " \xB7 ", fc.defenders, " defenders"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Wall HP"), /*#__PURE__*/React.createElement("span", null, fc.wallHp, "/", fc.wallMax)), /*#__PURE__*/React.createElement(ProgressBar, {
    value: fc.wallHp / fc.wallMax * 100,
    color: "var(--metal)",
    height: 4
  })), /*#__PURE__*/React.createElement("button", {
    onClick: defend,
    style: {
      width: '100%',
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      padding: '6px',
      cursor: 'pointer',
      background: '#2a1a1a',
      border: '1px solid var(--red2)',
      color: 'var(--red2)'
    }
  }, "Resolve Siege (auto)"), recap && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      padding: '6px 8px',
      background: 'var(--bg4)',
      borderLeft: "2px solid ".concat(recap.outcome.startsWith('held') ? 'var(--green)' : 'var(--red2)')
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: recap.outcome.startsWith('held') ? 'var(--green)' : 'var(--red2)',
      textTransform: 'uppercase'
    }
  }, recap.outcome.replace('_', ' ')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      marginTop: 2
    }
  }, recap.rewards.loot ? "+".concat(recap.rewards.loot, " loot \xB7 threat reset") : "Lost ".concat(recap.rewards.stolen ? recap.rewards.stolen.amount + ' ' + recap.rewards.stolen.mat : 'resources').concat(recap.rewards.leaderInjured ? ' · leader injured' : ''))))));
}
function CampEventsPanel(_ref51) {
  var threatLevel = _ref51.threatLevel;
  var events = [{
    time: '2m ago',
    text: 'Workshop II complete. Refined scrap output +40%.',
    color: 'var(--green)'
  }, {
    time: '14m ago',
    text: 'Horde probe repelled. 3 shamblers neutralized.',
    color: 'var(--amber)'
  }, {
    time: '1h ago',
    text: 'Cole Marsh underfed. Stamina penalty active.',
    color: 'var(--red2)'
  }, {
    time: '2h ago',
    text: 'Recycler damaged by acid spitter. Repairs needed.',
    color: 'var(--red2)'
  }, {
    time: '3h ago',
    text: 'Hearthguard delivered 80 food rations via courier.',
    color: 'var(--green)'
  }];
  return /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Camp Log"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, events.map(function (e, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'flex-start'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        flexShrink: 0,
        marginTop: 1
      }
    }, e.time), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: e.color,
        lineHeight: 1.4
      }
    }, e.text));
  })));
}

// ─── SOLO MAIN SCREEN ─────────────────────────────────────────────────────────

function useSoloRoutePreparation(route, threatLevel) {
  var enabled = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var _useState51 = useState(0),
    _useState52 = _slicedToArray(_useState51, 2),
    refresh = _useState52[1];
  useEffect(function () {
    if (!enabled) return;
    var queued = null;
    var update = function update() {
      if (queued !== null) return;
      queued = setTimeout(function () {
        queued = null;
        refresh(function (n) {
          return n + 1;
        });
      }, 0);
    };
    var inventory = ZI.onInventoryChange ? ZI.onInventoryChange(update) : null;
    var xp = ZI.onXp ? ZI.onXp(update) : null;
    var timer = setInterval(update, 1000);
    return function () {
      clearInterval(timer);
      if (queued !== null) clearTimeout(queued);
      if (inventory) inventory();
      if (xp) xp();
    };
  }, [enabled]);
  return enabled && route ? ZI.getRoutePreparation(route, threatLevel) : null;
}
function SoloRoutePreparationPanel(_ref52) {
  var preparation = _ref52.preparation,
    setScreen = _ref52.setScreen,
    onManageGear = _ref52.onManageGear,
    onReturnToRoute = _ref52.onReturnToRoute,
    routeName = _ref52.routeName,
    _ref52$compact = _ref52.compact,
    compact = _ref52$compact === void 0 ? false : _ref52$compact;
  if (!preparation) return /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 12
    }
  }, "Choose a route to prepare.");
  var p = preparation;
  if (compact) return /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 10,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      flexWrap: 'wrap',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title",
    style: {
      flex: 1,
      margin: 0
    }
  }, "Preparing ", routeName || 'route'), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    onClick: onReturnToRoute
  }, "Return to selected route")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))',
      gap: '5px 16px'
    }
  }, /*#__PURE__*/React.createElement(InfoRow, {
    label: "Weapon",
    value: p.weaponNames.join(', ') || 'Unarmed'
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Protection",
    value: p.armor + ' armor'
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Carried",
    value: p.loadKg + ' / ' + p.hardLimitKg + ' kg max'
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Room for loot",
    value: p.freeKg + ' kg',
    color: p.canDeploy ? 'var(--green)' : 'var(--red2)'
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Travel estimate",
    value: fmtTime(p.durationHours * 60)
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Fight win chance",
    value: p.combatWinChance + '%'
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Avoid a fight",
    value: p.avoidChance + '%'
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: p.canDeploy ? 'var(--text3)' : 'var(--red2)',
      marginTop: 6
    }
  }, p.canDeploy ? 'Changes apply to your next departure. Running routes keep their departure loadout.' : p.blockedReason));
  return /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 12,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Expedition preparation", routeName ? " · " + routeName : ""), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      color: 'var(--text)',
      marginBottom: 4
    }
  }, "The Wanderer \xB7 Lv ", p.characterLevel), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text2)',
      marginBottom: 10
    }
  }, "On foot \xB7 ", p.noiseLabel, " equipment"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 6,
      marginBottom: 10
    }
  }, Object.entries(p.skills).map(function (_ref53) {
    var _ref54 = _slicedToArray(_ref53, 2),
      name = _ref54[0],
      level = _ref54[1];
    return /*#__PURE__*/React.createElement("div", {
      key: name,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text2)',
        textTransform: 'capitalize'
      }
    }, name, " ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: 'var(--amber)'
      }
    }, level));
  })), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Weapon",
    value: p.weaponNames.join(', ') || 'Unarmed'
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Protection",
    value: p.armor + ' armor'
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Carried",
    value: p.loadKg + ' / ' + p.hardLimitKg + ' kg max'
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Room for loot",
    value: p.freeKg + ' kg',
    color: p.canDeploy ? 'var(--green)' : 'var(--red2)'
  }), /*#__PURE__*/React.createElement("div", {
    className: "divider",
    style: {
      margin: '9px 0'
    }
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Travel estimate",
    value: fmtTime(p.durationHours * 60)
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Fight win chance",
    value: p.combatWinChance + '%'
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Avoid a fight",
    value: p.avoidChance + '%'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: p.canDeploy ? 'var(--text3)' : 'var(--red2)',
      marginTop: 8,
      lineHeight: 1.5
    }
  }, p.canDeploy ? 'Heavier equipment slows travel and leaves less room for salvage.' : p.blockedReason), onReturnToRoute ? /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    style: {
      width: '100%',
      marginTop: 9
    },
    onClick: onReturnToRoute
  }, "Return to selected route") : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      width: '100%',
      marginTop: 9
    },
    onClick: onManageGear || function () {
      return setScreen('stockpile');
    }
  }, "Manage gear & carried items"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      width: '100%',
      marginTop: 5
    },
    onClick: function onClick() {
      return setScreen('stat-leveling');
    }
  }, "View skills")));
}
function RouteLoadoutPreparation(_ref55) {
  var route = _ref55.route,
    threatLevel = _ref55.threatLevel,
    onReturnToRoute = _ref55.onReturnToRoute;
  var preparation = useSoloRoutePreparation(route, threatLevel);
  return /*#__PURE__*/React.createElement(SoloRoutePreparationPanel, {
    preparation: preparation,
    routeName: route && route.name,
    onReturnToRoute: onReturnToRoute,
    compact: true
  });
}
function SoloMainScreen(_ref56) {
  var setScreen = _ref56.setScreen,
    setActiveRoute = _ref56.setActiveRoute,
    threatLevel = _ref56.threatLevel,
    mode = _ref56.mode,
    _ref56$initialPlan = _ref56.initialPlan,
    initialPlan = _ref56$initialPlan === void 0 ? null : _ref56$initialPlan,
    onManageGear = _ref56.onManageGear;
  var isCamp = mode === 'camp'; // Squad Assignment is a Camp Leader-mode feature only
  var _useState53 = useState(function () {
      return initialPlan ? initialPlan.biome : 'suburbia';
    }),
    _useState54 = _slicedToArray(_useState53, 2),
    selectedBiome = _useState54[0],
    setSelectedBiome = _useState54[1];
  var _useState55 = useState(function () {
      return initialPlan ? ZI.ROUTES.find(function (r) {
        return r.id === initialPlan.routeId;
      }) || null : null;
    }),
    _useState56 = _slicedToArray(_useState55, 2),
    selectedRoute = _useState56[0],
    setSelectedRoute = _useState56[1];
  var _useState57 = useState(function () {
      return initialPlan ? initialPlan.runMode : 'active';
    }),
    _useState58 = _slicedToArray(_useState57, 2),
    runMode = _useState58[0],
    setRunMode = _useState58[1];
  var _useState59 = useState(function () {
      return initialPlan ? _objectSpread({}, initialPlan.autoRepeat) : {};
    }),
    _useState60 = _slicedToArray(_useState59, 2),
    autoRepeat = _useState60[0],
    setAutoRepeat = _useState60[1]; // routeId → bool
  var _useState61 = useState([]),
    _useState62 = _slicedToArray(_useState61, 2),
    squad = _useState62[0],
    setSquad = _useState62[1]; // assigned survivor ids
  var toggleRepeat = function toggleRepeat(id) {
    return setAutoRepeat(function (m) {
      var on = !m[id];
      ZI.setRouteRunRepeat(id, on);
      return _objectSpread(_objectSpread({}, m), {}, _defineProperty({}, id, on));
    });
  };
  var filteredRoutes = ZI.ROUTES.filter(function (r) {
    return r.biome === selectedBiome;
  });
  var biome = ZI.BIOMES.find(function (b) {
    return b.id === selectedBiome;
  });
  var preparation = useSoloRoutePreparation(selectedRoute || filteredRoutes[0], threatLevel, !isCamp);
  var _useState63 = useState(null),
    _useState64 = _slicedToArray(_useState63, 2),
    launchError = _useState64[0],
    setLaunchError = _useState64[1];
  var character = {
    name: 'The Wanderer',
    "class": 'ranger',
    level: 14,
    stamina: 78,
    gear: 'Hunting Rifle (WM) + Hazard Suit T2',
    vehicle: 'Reinforced Truck',
    vehicleCondition: 65,
    nutrition: 74,
    hydration: 82,
    attributes: {
      S: 32,
      U: 28,
      R: 61,
      V: 44,
      I: 55,
      V2: 38,
      A: 49,
      L: 35
    }
  };
  var nutri = getNutritionLevel(character.nutrition);
  var hydration = getHydrationLevel(character.hydration);
  var totalStaminaMod = nutri.staminaMod + hydration.staminaMod;
  var effectiveStamina = Math.round(character.stamina * (1 + totalStaminaMod));
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
      width: 280,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flexShrink: 0
    }
  }, !isCamp ? /*#__PURE__*/React.createElement(SoloRoutePreparationPanel, {
    preparation: preparation,
    setScreen: setScreen,
    onManageGear: onManageGear ? function () {
      var _ref57;
      return onManageGear({
        biome: selectedBiome,
        routeId: ((_ref57 = selectedRoute || filteredRoutes[0]) === null || _ref57 === void 0 ? void 0 : _ref57.id) || null,
        runMode: runMode,
        autoRepeat: _objectSpread({}, autoRepeat)
      });
    } : null
  }) : /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 12,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 42,
      height: 42,
      borderRadius: '50%',
      border: '2px solid var(--amber)',
      background: 'var(--bg4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'var(--font-title)',
      fontSize: 20,
      color: 'var(--amber)',
      flexShrink: 0
    }
  }, "W"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 15,
      color: 'var(--text)',
      fontWeight: 600
    }
  }, "The Wanderer"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--text2)',
      letterSpacing: '0.1em'
    }
  }, "Lv14 Ranger \xB7 Lone Operative"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "NUTRITION"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: nutri.color
    }
  }, nutri.label)), /*#__PURE__*/React.createElement(ProgressBar, {
    value: character.nutrition,
    color: nutri.color,
    height: 5
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 5,
      marginBottom: 2
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "HYDRATION"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: hydration.color
    }
  }, hydration.label)), /*#__PURE__*/React.createElement(ProgressBar, {
    value: character.hydration,
    color: hydration.color,
    height: 5
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '5px 8px',
      background: 'var(--bg4)',
      borderLeft: "3px solid ".concat(totalStaminaMod >= 0 ? 'var(--green)' : 'var(--red2)'),
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: totalStaminaMod >= 0 ? 'var(--green)' : 'var(--red2)',
      marginBottom: 8
    }
  }, "Stamina: ", character.stamina, " \u2192 ", /*#__PURE__*/React.createElement("b", null, effectiveStamina), " (", totalStaminaMod >= 0 ? '+' : '', (totalStaminaMod * 100).toFixed(0), "%)"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '4px 8px'
    }
  }, Object.entries(character.attributes).map(function (_ref58) {
    var _ref59 = _slicedToArray(_ref58, 2),
      k = _ref59[0],
      v = _ref59[1];
    var attr = ZI.SURVIVAL_ATTRS.find(function (a) {
      return a.key === k || a.key === k + '2';
    });
    var label = k === 'V2' ? 'Valor' : k === 'V' ? 'Vitality' : (attr === null || attr === void 0 ? void 0 : attr.name) || k;
    return /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: 'flex',
        gap: 4,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--amber)',
        width: 10,
        flexShrink: 0,
        fontWeight: 'bold'
      }
    }, k === 'V2' ? 'V' : k), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement(ProgressBar, {
      value: v,
      color: "var(--amber)",
      height: 4
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text2)',
        width: 22,
        textAlign: 'right'
      }
    }, v));
  })), /*#__PURE__*/React.createElement("div", {
    className: "divider",
    style: {
      margin: '10px 0 8px'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text2)',
      lineHeight: 1.6
    }
  }, ZI.hasWorkingVehicle() ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", null, "\uD83D\uDE9B ", ZI.getVehicle().name), /*#__PURE__*/React.createElement(ProgressBar, {
    value: character.vehicleCondition,
    color: "var(--amber)",
    height: 4
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2,
      color: 'var(--text3)'
    }
  }, "Condition: ", character.vehicleCondition, "%")) : /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text3)'
    }
  }, "\uD83D\uDEB6 No vehicle \u2014 find one while Wandering"))), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Select Biome"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      overflow: 'auto'
    }
  }, ZI.BIOMES.map(function (b) {
    return /*#__PURE__*/React.createElement("div", {
      key: b.id,
      onClick: function onClick() {
        setSelectedBiome(b.id);
        setSelectedRoute(null);
      },
      style: {
        padding: '8px 10px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        border: "1px solid ".concat(selectedBiome === b.id ? b.color : 'var(--border)'),
        background: selectedBiome === b.id ? 'var(--bg4)' : 'var(--bg3)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: selectedBiome === b.id ? b.color : 'var(--text)'
      }
    }, b.name), /*#__PURE__*/React.createElement(RiskBar, {
      risk: b.danger
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)'
      }
    }, "RMAT: ", b.rmat, " \xB7 Tier ", b.tier));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minWidth: 0,
      overflow: 'hidden'
    }
  }, launchError && /*#__PURE__*/React.createElement("div", {
    role: "alert",
    style: {
      color: 'var(--red2)',
      padding: 8
    }
  }, launchError), biome && /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 12,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 10,
      height: 10,
      borderRadius: '50%',
      background: biome.color,
      boxShadow: "0 0 8px ".concat(biome.color)
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 20,
      color: biome.color
    }
  }, biome.name), /*#__PURE__*/React.createElement(Tag, {
    color: biome.color
  }, "Tier ", biome.tier)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 24,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 3
    }
  }, "ZOMBIE ECOLOGY"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text2)'
    }
  }, biome.zombies.slice(0, 2).join(' · '))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 3
    }
  }, "HAZARDS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--red2)'
    }
  }, biome.hazards.slice(0, 2).join(' · '))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 3
    }
  }, "RMAT ACCESS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--purple)'
    }
  }, biome.rmat)))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexShrink: 0
    }
  }, [['active', 'Active Run', 'Monitor & direct your route in real-time'], ['passive', 'Idle Run', 'Automated — reduced loot, runs while away']].map(function (_ref60) {
    var _ref61 = _slicedToArray(_ref60, 3),
      id = _ref61[0],
      label = _ref61[1],
      desc = _ref61[2];
    return /*#__PURE__*/React.createElement("div", {
      key: id,
      onClick: function onClick() {
        return setRunMode(id);
      },
      style: {
        flex: 1,
        padding: '8px 12px',
        cursor: 'pointer',
        border: "1px solid ".concat(runMode === id ? 'var(--amber)' : 'var(--border)'),
        background: runMode === id ? 'var(--bg4)' : 'var(--bg3)',
        transition: 'all 0.15s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: runMode === id ? 'var(--amber)' : 'var(--text)'
      }
    }, label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        marginTop: 2
      }
    }, desc));
  })), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Available Routes \u2014 ", biome === null || biome === void 0 ? void 0 : biome.name), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, filteredRoutes.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)',
      padding: 16,
      textAlign: 'center'
    }
  }, "No routes available. Upgrade gear to unlock deeper zones.") : filteredRoutes.map(function (route) {
    return /*#__PURE__*/React.createElement(RouteCard, {
      key: route.id,
      route: route,
      selected: (selectedRoute === null || selectedRoute === void 0 ? void 0 : selectedRoute.id) === route.id,
      threatLevel: threatLevel,
      autoRepeat: !!autoRepeat[route.id],
      onToggleRepeat: runMode === 'passive' ? toggleRepeat : null,
      onClick: function onClick() {
        return setSelectedRoute((selectedRoute === null || selectedRoute === void 0 ? void 0 : selectedRoute.id) === route.id ? null : route);
      }
    });
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 260,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flexShrink: 0
    }
  }, selectedRoute ? /*#__PURE__*/React.createElement(RouteDetailPanel, {
    route: selectedRoute,
    runMode: runMode,
    effectiveStamina: effectiveStamina,
    squad: isCamp ? squad : [],
    setSquad: setSquad,
    threatLevel: threatLevel,
    isCamp: isCamp,
    onLaunch: function onLaunch() {
      // Start a live route run — it fills the node chain and resolves into Last Run when it finishes.
      var result = ZI.startRouteRun(selectedRoute, isCamp ? squad : [], runMode, threatLevel, !!autoRepeat[selectedRoute.id]);
      if (result && !result.ok) {
        setLaunchError(result.reason);
        return;
      }
      setLaunchError(null);
      setActiveRoute(selectedRoute);
      setScreen(isCamp && ZI.hasWorkingVehicle() ? 'solo-loading' : 'traversal');
    }
  }) : isCamp ? /*#__PURE__*/React.createElement(SquadAssignPanel, {
    route: filteredRoutes[0],
    squad: squad,
    setSquad: setSquad,
    threatLevel: threatLevel,
    onPick: function onPick() {
      return setSelectedRoute(filteredRoutes[0]);
    }
  }) : /*#__PURE__*/React.createElement(SoloOperativePanel, {
    preparation: preparation,
    route: filteredRoutes[0],
    threatLevel: threatLevel,
    onPick: function onPick() {
      return setSelectedRoute(filteredRoutes[0]);
    }
  }), /*#__PURE__*/React.createElement(LastRunPanel, {
    onSendAgain: function onSendAgain() {
      var last = ZI.getLastRun();
      var route = last && ZI.ROUTES.find(function (r) {
        return r.id === last.routeId;
      }) || selectedRoute;
      var ids = last ? last.squadIds : squad;
      var check = ZI.canSendAgain(route, ids);
      if (!check.ok) return check.reason;
      var result = ZI.startRouteRun(route, ids, runMode, threatLevel, !!autoRepeat[route.id]);
      if (result && !result.ok) return result.reason;
      setActiveRoute(route);
      setScreen(isCamp && ZI.hasWorkingVehicle() ? 'solo-loading' : 'traversal');
      return null;
    }
  })));
}

// Solo Survivor mode default panel — no squad; the lone operative runs every route.
function SoloOperativePanel(_ref62) {
  var route = _ref62.route,
    preparation = _ref62.preparation,
    threatLevel = _ref62.threatLevel,
    onPick = _ref62.onPick;
  var p = preparation || route && ZI.getRoutePreparation(route, threatLevel);
  var prob = p ? p.combatWinChance : 0;
  var band = ZI.riskBand(prob);
  return /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Lone Operative"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10
    }
  }, p ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--text)',
      marginBottom: 8
    }
  }, "The Wanderer \xB7 Lv ", p.characterLevel), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text2)',
      marginBottom: 8
    }
  }, route.name, " \xB7 On foot"), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Fight win chance",
    value: prob + '% · ' + band.label,
    color: band.color
  }), /*#__PURE__*/React.createElement(ProgressBar, {
    value: prob,
    color: band.color,
    height: 5
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Avoid a fight",
    value: p.avoidChance + '%'
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Room for loot",
    value: p.freeKg + ' kg'
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    style: {
      width: '100%',
      marginTop: 10
    },
    onClick: onPick
  }, "View Route Details \u2192")) : /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10
    }
  }, "No routes in this biome.")));
}

// Change 3/5 — default detail panel: squad assignment for the top route (Camp Leader mode only).
function SquadAssignPanel(_ref63) {
  var route = _ref63.route,
    squad = _ref63.squad,
    setSquad = _ref63.setSquad,
    onPick = _ref63.onPick,
    threatLevel = _ref63.threatLevel;
  var roster = ZI.SQUAD_ROSTER || [];
  var max = route ? route.squadMax : 4;
  var toggle = function toggle(id) {
    return setSquad(function (s) {
      return s.includes(id) ? s.filter(function (x) {
        return x !== id;
      }) : s.length >= max ? s : [].concat(_toConsumableArray(s), [id]);
    });
  };
  var successProb = route ? ZI.estimateSuccessProbability(route, squad, threatLevel) : 0;
  var band = ZI.riskBand(successProb);
  return /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Squad Assignment"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      overflow: 'auto',
      flex: 1
    }
  }, route ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 8
    }
  }, "For ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--amber)'
    }
  }, route.name), " \xB7 slots ", route.squadMin, "\u2013", route.squadMax), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, roster.map(function (s) {
    var on = squad.includes(s.id);
    return /*#__PURE__*/React.createElement("div", {
      key: s.id,
      onClick: function onClick() {
        return toggle(s.id);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '6px 8px',
        cursor: 'pointer',
        background: 'var(--bg3)',
        border: "1px solid ".concat(on ? 'var(--amber)' : 'var(--border)')
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 26,
        height: 26,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: "2px solid ".concat(on ? 'var(--amber)' : 'var(--border)'),
        color: on ? 'var(--amber)' : 'var(--text3)',
        fontFamily: 'var(--font-title)',
        fontSize: 13
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
    }, "Lv", s.level, " ", s.cls, " \xB7 HP ", s.hp, " \xB7 STA ", s.stamina)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: on ? 'var(--amber)' : 'var(--text3)'
      }
    }, on ? '☑' : '☐'));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      padding: '7px 9px',
      background: 'var(--bg4)',
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text3)'
    }
  }, "SUCCESS PROBABILITY"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: band.color
    }
  }, successProb, "% \xB7 ", band.label)), /*#__PURE__*/React.createElement(ProgressBar, {
    value: successProb,
    color: band.color,
    height: 5
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      marginTop: 4
    }
  }, "Set chance for ".concat((ZI.BIOMES.find(function (b) {
    return b.id === route.biome;
  }) || {}).name || 'this biome', " (Tier ").concat((ZI.BIOMES.find(function (b) {
    return b.id === route.biome;
  }) || {}).tier || '—', ")"))), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    style: {
      width: '100%',
      marginTop: 8
    },
    onClick: onPick
  }, "View Route Details \u2192")) : /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: 20,
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)'
    }
  }, "No routes in this biome.")));
}

// Change 6 — promoted Last Run summary with quick actions.
function LastRunPanel(_ref64) {
  var onSendAgain = _ref64.onSendAgain;
  var _useState65 = useState(function () {
      return ZI.getLastRun && ZI.getLastRun() || null;
    }),
    _useState66 = _slicedToArray(_useState65, 2),
    last = _useState66[0],
    setLast = _useState66[1];
  var _useState67 = useState(null),
    _useState68 = _slicedToArray(_useState67, 2),
    msg = _useState68[0],
    setMsg = _useState68[1];
  var pending = ZI.getUnclaimedRouteRewards(last);
  // Keep Claim totals current while idle repeats complete on this screen.
  useEffect(function () {
    var refresh = function refresh() {
      return setLast(ZI.getLastRun && ZI.getLastRun() || null);
    };
    refresh();
    var timer = setInterval(refresh, 1000);
    return function () {
      return clearInterval(timer);
    };
  }, []);
  var claim = function claim() {
    var r = ZI.claimLastRun();
    setMsg(r.ok ? "\u2713 Claimed ".concat(r.amount, " salvage \u2192 Recycler") : "\u26A0 ".concat(r.reason));
    setLast(ZI.getLastRun && ZI.getLastRun() || null);
  };
  var sendAgain = function sendAgain() {
    var reason = onSendAgain && onSendAgain();
    if (reason) setMsg("\u26A0 ".concat(reason));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flexShrink: 0,
      borderColor: last ? 'var(--green)' : 'var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title",
    style: {
      color: last ? 'var(--green)' : undefined
    }
  }, "\u25C8 Last Run"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10
    }
  }, last ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      marginBottom: 4
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--text)'
    }
  }, last.name), last.claimed && /*#__PURE__*/React.createElement("span", {
    className: "tag",
    style: {
      color: 'var(--text3)',
      borderColor: 'var(--border)'
    }
  }, "claimed"), /*#__PURE__*/React.createElement("span", {
    className: "tag",
    style: {
      color: last.mode === 'passive' ? 'var(--text2)' : 'var(--amber)',
      borderColor: 'var(--border)'
    }
  }, last.mode === 'passive' ? 'Idle' : 'Active')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 12,
      flexWrap: 'wrap',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text2)',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", null, "\u23F1 ", last.time), /*#__PURE__*/React.createElement("span", null, "\u25C6 ", last.loot, " loot"), last.vehicleWear ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#b48cf0'
    }
  }, "\u26FD \u2212", last.vehicleWear, "%") : null, last.losses ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--red2)'
    }
  }, "\u2620 ", last.losses) : /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--green)'
    }
  }, "No losses")), last.outcomes && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text2)',
      marginBottom: 7
    }
  }, "Fights avoided ", last.outcomes.avoided, " \xB7 won ", last.outcomes.won, " \xB7 lost ", last.outcomes.lost, last.outcomes.capacityLimited && /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--amber)'
    }
  }, "Pack space: ", last.outcomes.lootLeftBehind, " loot left behind")), !last.claimed && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--green)',
      marginBottom: 7
    }
  }, "Unclaimed: ", pending.loot, " loot from ", pending.runs, " ", pending.runs === 1 ? 'run' : 'runs'), last.log && /*#__PURE__*/React.createElement("div", {
    style: {
      maxHeight: 72,
      overflow: 'auto',
      marginBottom: 7,
      borderLeft: '2px solid var(--border)',
      paddingLeft: 7
    }
  }, last.log.map(function (l, i) {
    var meta = ZI.NODE_META[l.type] || ZI.NODE_META.combat;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)',
        lineHeight: 1.5
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: meta.color
      }
    }, meta.icon), " ", l.text);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    style: {
      flex: 1,
      opacity: last.claimed ? 0.5 : 1,
      cursor: last.claimed ? 'not-allowed' : 'pointer'
    },
    disabled: last.claimed,
    onClick: claim
  }, pending.runs > 1 ? 'Claim All' : 'Claim'), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      flex: 1
    },
    onClick: sendAgain
  }, "Send Again")), msg && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: msg[0] === '✓' ? 'var(--green)' : 'var(--red2)',
      marginTop: 6
    }
  }, msg)) : /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)'
    }
  }, "No runs completed yet. Launch a route to see your haul here.")));
}

// Loot intel inside a node's hover box. More detail unlocks with visits.
function PoiIntel(_ref65) {
  var route = _ref65.route,
    idx = _ref65.idx,
    type = _ref65.type;
  var visits = ZI.poiVisits(route.id, idx);
  var _ZI$poiTier = ZI.poiTier(visits),
    tier = _ZI$poiTier.tier,
    next = _ZI$poiTier.next,
    index = _ZI$poiTier.index;
  var loot = ZI.POI_LOOT[type] || ZI.POI_LOOT.combat;
  var shift = Math.max(0, (route.rmatTier || 0) - 1); // deeper routes shift finds up a tier
  var tierTag = function tierTag(t) {
    var k = 'T' + Math.min(5, t + shift);
    return /*#__PURE__*/React.createElement("span", {
      style: {
        color: ZI.tierColor(k)
      }
    }, ZI.TIER_META[k].label);
  };
  var line = {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: 'var(--text2)',
    lineHeight: 1.45,
    whiteSpace: 'normal'
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      paddingTop: 5,
      borderTop: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      marginBottom: 3
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: tier.color
    }
  }, "\u25C9 ", tier.label), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text3)'
    }
  }, visits, " visit", visits === 1 ? '' : 's')), type === 'start' ? /*#__PURE__*/React.createElement("div", {
    style: line
  }, "Your departure point. Nothing to loot here.") : index === 0 ? /*#__PURE__*/React.createElement("div", {
    style: line
  }, "No intel yet. Finish a run through here to scout it.") : /*#__PURE__*/React.createElement(React.Fragment, null, index >= 1 && index < 2 && /*#__PURE__*/React.createElement("div", {
    style: line
  }, "Loot types hidden until Familiar."), index >= 2 && /*#__PURE__*/React.createElement("div", {
    style: line
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--text3)'
    }
  }, "Loot: "), loot.categories.join(' · ')), index >= 3 && loot.items.map(function (it, k) {
    return /*#__PURE__*/React.createElement("div", {
      key: k,
      style: line
    }, "\u25B8 ", it.n, " ", tierTag(it.t));
  }), index >= 4 && loot.rare && /*#__PURE__*/React.createElement("div", {
    style: _objectSpread(_objectSpread({}, line), {}, {
      color: 'var(--amber)'
    })
  }, "\u2605 Rare: ", loot.rare.n, " ", tierTag(loot.rare.t), " \xB7 ~", loot.rare.chance, "% per visit")), next && type !== 'start' && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginTop: 3
    }
  }, next.min - visits, " more to ", next.label, index === 1 ? ' (loot types)' : index === 2 ? ' (item list)' : index === 3 ? ' (rare finds)' : ''));
}

// Hover box rendered at body level (fixed) so scroll containers can't clip it.
// Opens above the node, flips below when there's no room, clamped to the viewport.
function NodeTip(_ref66) {
  var anchor = _ref66.anchor,
    color = _ref66.color,
    children = _ref66.children;
  var ref = React.useRef(null);
  var _useState69 = useState({
      left: -9999,
      top: -9999
    }),
    _useState70 = _slicedToArray(_useState69, 2),
    pos = _useState70[0],
    setPos = _useState70[1];
  React.useLayoutEffect(function () {
    var el = ref.current;
    if (!el) return;
    var bw = el.offsetWidth,
      bh = el.offsetHeight,
      pad = 8;
    var top = anchor.top - bh - 6;
    if (top < pad) top = Math.min(anchor.bottom + 6, window.innerHeight - bh - pad);
    var left = anchor.left + anchor.width / 2 - bw / 2;
    left = Math.max(pad, Math.min(left, window.innerWidth - bw - pad));
    setPos({
      left: left,
      top: Math.max(pad, top)
    });
  }, [anchor]);
  return /*#__PURE__*/React.createElement("div", {
    ref: ref,
    style: {
      position: 'fixed',
      left: pos.left,
      top: pos.top,
      zIndex: 1000,
      pointerEvents: 'none',
      background: 'var(--bg2)',
      border: "1px solid ".concat(color),
      padding: '6px 9px',
      minWidth: 170,
      maxWidth: 240,
      boxShadow: '0 4px 14px rgba(0,0,0,0.6)'
    }
  }, children);
}
function RouteNodeChain(_ref67) {
  var nodes = _ref67.nodes,
    compact = _ref67.compact,
    progress = _ref67.progress,
    route = _ref67.route;
  var _useState71 = useState(null),
    _useState72 = _slicedToArray(_useState71, 2),
    hover = _useState72[0],
    setHover = _useState72[1];
  var _useState73 = useState(null),
    _useState74 = _slicedToArray(_useState73, 2),
    anchor = _useState74[0],
    setAnchor = _useState74[1];
  var sz = compact ? 18 : 22;
  var n = nodes.length;
  var live = typeof progress === 'number';
  var p = live ? Math.max(0, Math.min(1, progress)) : 0;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: sz / 2,
      right: sz / 2,
      top: sz / 2 - 2,
      height: 4,
      borderRadius: 2,
      background: 'var(--bg4)',
      border: '1px solid var(--border)',
      boxSizing: 'border-box'
    }
  }), live && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: sz / 2,
      top: sz / 2 - 2,
      height: 4,
      width: "calc((100% - ".concat(sz, "px) * ").concat(p, ")"),
      background: 'linear-gradient(90deg, var(--amber), var(--green))',
      borderRadius: 2,
      transition: 'width 1s linear'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: sz / 2 - 4,
      left: "calc(".concat(sz / 2, "px + (100% - ").concat(sz, "px) * ").concat(p, " - 4px)"),
      width: 8,
      height: 8,
      borderRadius: '50%',
      background: 'var(--text)',
      boxShadow: '0 0 6px var(--amber)',
      transition: 'left 1s linear',
      zIndex: 2
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      zIndex: 1
    }
  }, nodes.map(function (node, i) {
    var type = ZI.routeNodeType(node);
    var meta = ZI.NODE_META[type] || ZI.NODE_META.combat;
    var at = n > 1 ? i / (n - 1) : 0;
    var passed = live && p >= at;
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        flexShrink: 0
      },
      onMouseEnter: function onMouseEnter(e) {
        setAnchor(e.currentTarget.getBoundingClientRect());
        setHover(i);
      },
      onMouseLeave: function onMouseLeave() {
        return setHover(function (h) {
          return h === i ? null : h;
        });
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: sz,
        height: sz,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'help',
        background: passed ? meta.color : 'var(--bg)',
        border: "2px solid ".concat(meta.color),
        color: passed ? 'var(--bg)' : meta.color,
        fontSize: compact ? 9 : 11,
        lineHeight: 1,
        transition: 'background 0.3s, color 0.3s'
      }
    }, meta.icon), hover === i && anchor && ReactDOM.createPortal(/*#__PURE__*/React.createElement(NodeTip, {
      anchor: anchor,
      color: meta.color
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: meta.color,
        letterSpacing: '0.06em'
      }
    }, meta.icon, " ", meta.label.toUpperCase()), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: 'var(--text)',
        marginTop: 1
      }
    }, node), live && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: passed ? 'var(--green)' : 'var(--text2)',
        marginTop: 1
      }
    }, passed ? '✓ Passed' : 'Ahead'), route && /*#__PURE__*/React.createElement(PoiIntel, {
      route: route,
      idx: i,
      type: type
    })), document.body));
  })));
}

// Re-renders every second while a route run is live.
function useRouteRun(routeId) {
  var _useState75 = useState(0),
    _useState76 = _slicedToArray(_useState75, 2),
    tick = _useState76[1];
  var prog = ZI.routeRunProgress(routeId);
  useEffect(function () {
    var t = setInterval(function () {
      return tick(function (x) {
        return x + 1;
      });
    }, 1000);
    return function () {
      return clearInterval(t);
    };
  }, [routeId]);
  return prog;
}
var fmtRunLeft = function fmtRunLeft(ms) {
  var s = Math.ceil(ms / 1000);
  return s >= 60 ? "".concat(Math.floor(s / 60), "m ").concat(s % 60, "s") : "".concat(s, "s");
};
function RouteCard(_ref68) {
  var route = _ref68.route,
    selected = _ref68.selected,
    onClick = _ref68.onClick,
    threatLevel = _ref68.threatLevel,
    autoRepeat = _ref68.autoRepeat,
    onToggleRepeat = _ref68.onToggleRepeat;
  var liveRun = useRouteRun(route.id);
  var preparation = ZI.routeUsesSoloPreparation() ? liveRun && liveRun.preparation || ZI.getRoutePreparation(route, threatLevel) : null;
  var biome = ZI.BIOMES.find(function (b) {
    return b.id === route.biome;
  });
  var rmat = ZI.RMAT_TIERS[route.rmatTier];
  // Change 4 — threat state shifts border toward danger as global threat rises.
  var threat = threatLevel || 0;
  var danger = Math.min(5, route.risk + (threat >= 7 ? 1 : 0));
  var dangerColor = ['#3dcf8e', '#a3c34a', '#d9b94a', '#d98a4a', '#cf5d3d', '#f06a5a'][danger] || 'var(--border)';
  var mutationActive = threat >= 6 && route.risk >= 4;
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    style: {
      padding: '10px 12px',
      cursor: 'pointer',
      transition: 'all 0.15s',
      border: "1px solid ".concat(selected ? 'var(--amber)' : dangerColor + '66'),
      borderLeft: "3px solid ".concat(dangerColor),
      background: selected ? 'var(--bg4)' : 'var(--bg3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: selected ? 'var(--amber)' : 'var(--text)',
      fontWeight: 500
    }
  }, route.name, autoRepeat && /*#__PURE__*/React.createElement("span", {
    title: "Auto-Repeat active",
    style: {
      fontSize: 11,
      color: 'var(--purple)'
    }
  }, "\uD83D\uDD01")), /*#__PURE__*/React.createElement(RiskBar, {
    risk: route.risk
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    color: "var(--text2)"
  }, "\u23F1 ", fmtTime((preparation ? preparation.durationHours : route.duration) * 60)), /*#__PURE__*/React.createElement(Tag, {
    color: (rmat === null || rmat === void 0 ? void 0 : rmat.color) || 'var(--text2)'
  }, ZI.rmatLabel(route.rmatTier)), /*#__PURE__*/React.createElement(Tag, {
    color: "var(--text2)"
  }, "Lv ", route.recLevel, "+")), mutationActive && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: '#f06a5a',
      background: 'rgba(207,61,61,0.1)',
      border: '1px solid #f06a5a55',
      padding: '3px 6px',
      marginBottom: 6
    }
  }, "\u26A0 Mutation Zone Active \u2014 bonus loot, elevated risk"), function () {
    var prog = liveRun;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        margin: '2px 0 7px'
      }
    }, /*#__PURE__*/React.createElement(RouteNodeChain, {
      nodes: route.nodes,
      compact: true,
      progress: prog ? prog.pct : undefined,
      route: route
    }), prog && /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        marginTop: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--amber)'
      }
    }, "\u25CF Running", prog.autoRepeat ? ' · 🔁' : '', " \xB7 ", Math.floor(prog.pct * 100), "%"), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text2)'
      }
    }, fmtRunLeft(prog.remainingMs), " left")));
  }(), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      flexWrap: 'wrap',
      marginBottom: 5
    }
  }, route.lootRange.map(function (l, i) {
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text2)',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        padding: '1px 5px'
      }
    }, l);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flexWrap: 'wrap',
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)'
    }
  }, preparation ? /*#__PURE__*/React.createElement("span", null, "Room for loot ", preparation.freeKg, " kg \xB7 fight win ", preparation.combatWinChance, "% \xB7 avoid ", preparation.avoidChance, "%") : /*#__PURE__*/React.createElement("span", null, "\u26A1 Stamina ~", route.staminaCost), !preparation && route.hasVehicle && ZI.hasWorkingVehicle() && /*#__PURE__*/React.createElement("span", {
    style: {
      color: '#b48cf0'
    }
  }, "\u26FD Vehicle wear ~", route.vehicleWear, "%"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      display: 'flex',
      gap: 8
    }
  }, onToggleRepeat && /*#__PURE__*/React.createElement("button", {
    onClick: function onClick(e) {
      e.stopPropagation();
      onToggleRepeat(route.id);
    },
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      padding: '1px 6px',
      cursor: 'pointer',
      background: autoRepeat ? 'rgba(144,96,208,0.15)' : 'var(--bg4)',
      border: "1px solid ".concat(autoRepeat ? 'var(--purple)' : 'var(--border)'),
      color: autoRepeat ? 'var(--purple)' : 'var(--text3)'
    }
  }, "\uD83D\uDD01 ", autoRepeat ? 'Auto ON' : 'Auto-Repeat'))));
}

// ─── NOISE METER (PZ noise mechanics) ────────────────────────────────────────
function NoiseMeter(_ref69) {
  var route = _ref69.route,
    runMode = _ref69.runMode;
  var vehicleNoise = ZI.VEHICLE_SYSTEMS.noiseBiome[route.biome] || ZI.VEHICLE_SYSTEMS.noiseBiome.suburbia;
  // Base noise: vehicle engine + run mode modifier
  var baseDb = runMode === 'passive' ? vehicleNoise.engineNoise : Math.round(vehicleNoise.engineNoise * 0.6);
  var hearingRange = runMode === 'passive' ? vehicleNoise.hearingRange : Math.round(vehicleNoise.hearingRange * 0.5);
  var noisePct = clamp(baseDb / 160 * 100, 0, 100);
  var noiseColor = noisePct > 75 ? 'var(--red2)' : noisePct > 45 ? 'var(--amber)' : 'var(--green)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 5,
      letterSpacing: '0.1em'
    }
  }, "NOISE PROFILE ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontStyle: 'italic',
      color: 'var(--text3)',
      fontSize: 7
    }
  }, "\xB7 PZ hearing model")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
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
  }, runMode === 'passive' ? 'Vehicle (engine on)' : 'Foot movement'), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: noiseColor
    }
  }, baseDb, " dB")), /*#__PURE__*/React.createElement(ProgressBar, {
    value: noisePct,
    color: noiseColor,
    height: 5,
    animated: noisePct > 75
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "Hearing range: ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: noiseColor
    }
  }, hearingRange, "m"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 8,
      fontSize: 8,
      fontStyle: 'italic'
    }
  }, vehicleNoise.note)), runMode === 'passive' && baseDb > 100 && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 7px',
      background: 'rgba(139,58,42,0.12)',
      border: '1px solid var(--red)',
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--red2)'
    }
  }, "\u26A0 PZ rule: sustained engine noise draws migration waves. Consider foot approach at POIs."), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 2
    }
  }, [{
    label: 'Gunshot',
    db: 140,
    icon: '🔫'
  }, {
    label: 'Running',
    db: 50,
    icon: '🏃'
  }, {
    label: 'Crouch',
    db: 15,
    icon: '🦶'
  }].map(function (n) {
    return /*#__PURE__*/React.createElement("div", {
      key: n.label,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 9
      }
    }, n.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)',
        width: 50
      }
    }, n.label), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 3,
        background: 'var(--bg4)',
        borderRadius: 1,
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: "".concat(n.db / 160 * 100, "%"),
        height: '100%',
        background: n.db > 100 ? 'var(--red2)' : n.db > 60 ? 'var(--amber)' : 'var(--green)'
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)',
        width: 28,
        textAlign: 'right'
      }
    }, n.db, "dB"));
  }))));
}

// ─── WEATHER PANEL (PZ weather impact) ───────────────────────────────────────
function WeatherPanel(_ref70) {
  var biomeId = _ref70.biomeId;
  var weatherByBiome = {
    mountain: {
      condition: 'Fog',
      data: ZI.WEATHER_EFFECTS.Fog,
      icon: '🌫️'
    },
    suburbia: {
      condition: 'Rain',
      data: ZI.WEATHER_EFFECTS.Rain,
      icon: '🌧️'
    },
    metro: {
      condition: 'Acid Rain',
      data: ZI.WEATHER_EFFECTS.AcidRain,
      icon: '☠️'
    },
    perimeter: {
      condition: 'Radiation Storm',
      data: ZI.WEATHER_EFFECTS.RadiationStorm,
      icon: '☢️'
    }
  };
  var w = weatherByBiome[biomeId] || weatherByBiome.suburbia;
  var effects = Object.entries(w.data).filter(function (_ref71) {
    var _ref72 = _slicedToArray(_ref71, 1),
      k = _ref72[0];
    return k !== 'note';
  }).slice(0, 4);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 5,
      letterSpacing: '0.1em'
    }
  }, "WEATHER CONDITIONS"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '7px 9px',
      background: 'var(--bg4)',
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
      fontSize: 14
    }
  }, w.icon), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--amber)'
    }
  }, w.condition)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3
    }
  }, effects.map(function (_ref73) {
    var _ref74 = _slicedToArray(_ref73, 2),
      key = _ref74[0],
      val = _ref74[1];
    var isGood = typeof val === 'number' && val < 0;
    var isBad = typeof val === 'number' && val > 0 && key !== 'rmatYield';
    var label = key.replace(/([A-Z])/g, ' $1').replace(/^./, function (s) {
      return s.toUpperCase();
    });
    var display = typeof val === 'boolean' ? val ? 'Active' : 'None' : typeof val === 'number' ? "".concat(val > 0 ? '+' : '').concat((val * 100).toFixed(0), "%") : val;
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      style: {
        display: 'flex',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)'
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: isGood ? 'var(--green)' : isBad ? 'var(--red2)' : 'var(--amber)'
      }
    }, display));
  })), w.data.note && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 5,
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      fontStyle: 'italic',
      lineHeight: 1.4
    }
  }, w.data.note)));
}

// ─── CONTAINERS PANEL (PZ loot container logic) ──────────────────────────────
function ContainersPanel(_ref75) {
  var _containers$, _containers$2;
  var biomeId = _ref75.biomeId;
  var containersByBiome = {
    mountain: ['Glovebox', 'CarTrunk', 'KitchenCabinet'],
    suburbia: ['KitchenCabinet', 'CarTrunk', 'WarehouseShelf', 'GunCabinet'],
    metro: ['WarehouseShelf', 'HospitalShelf', 'PoliceArmory', 'GunCabinet'],
    perimeter: ['LabStorage', 'HospitalShelf', 'PoliceArmory']
  };
  var containers = (containersByBiome[biomeId] || containersByBiome.suburbia).map(function (k) {
    return _objectSpread({
      key: k
    }, ZI.LOOT_CONTAINERS[k]);
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 5,
      letterSpacing: '0.1em'
    }
  }, "LOOT CONTAINERS ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 7,
      fontStyle: 'italic'
    }
  }, "\xB7 PZ container model")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, containers.map(function (c) {
    return /*#__PURE__*/React.createElement("div", {
      key: c.key,
      style: {
        padding: '5px 8px',
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        color: 'var(--text)'
      }
    }, c.key.replace(/([A-Z])/g, ' $1').trim()), c.locked && /*#__PURE__*/React.createElement(Tag, {
      color: "var(--red2)"
    }, "Locked"), c.requiresKeycard && /*#__PURE__*/React.createElement(Tag, {
      color: "var(--purple)"
    }, "Keycard")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)'
      }
    }, c.items.slice(0, 2).join(' · '))), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'right',
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--amber)'
      }
    }, Math.round(c.baseChance * 100), "% find"), c.rmatChance > 0 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--purple)'
      }
    }, Math.round(c.rmatChance * 100), "% RMAT")));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      fontStyle: 'italic',
      lineHeight: 1.5
    }
  }, "PZ: containers exhausted after ", ((_containers$ = containers[0]) === null || _containers$ === void 0 ? void 0 : _containers$.exhaustedAfter) || 1, " loot", (((_containers$2 = containers[0]) === null || _containers$2 === void 0 ? void 0 : _containers$2.exhaustedAfter) || 1) > 1 ? 's' : '', ". Respawn in 7\u201330 days.")));
}
function RouteDetailPanel(_ref76) {
  var route = _ref76.route,
    runMode = _ref76.runMode,
    effectiveStamina = _ref76.effectiveStamina,
    squad = _ref76.squad,
    setSquad = _ref76.setSquad,
    threatLevel = _ref76.threatLevel,
    onLaunch = _ref76.onLaunch,
    isCamp = _ref76.isCamp;
  var biome = ZI.BIOMES.find(function (b) {
    return b.id === route.biome;
  });
  var rmat = ZI.RMAT_TIERS[route.rmatTier];
  var staminaCost = route.duration * 8;
  var _useState77 = useState('overview'),
    _useState78 = _slicedToArray(_useState77, 2),
    tab = _useState78[0],
    setTab = _useState78[1];
  var liveRunD = useRouteRun(route.id);
  var preparation = !isCamp ? liveRunD && liveRunD.preparation || ZI.getRoutePreparation(route, threatLevel) : null;
  var canRun = isCamp ? effectiveStamina >= staminaCost : preparation.canDeploy;
  var deployReason = isCamp ? 'Stamina too low. Eat and rest before departing.' : preparation.blockedReason;
  var liveProb = preparation ? preparation.combatWinChance : ZI.estimateSuccessProbability(route, squad, threatLevel);
  var liveBand = ZI.riskBand(liveProb);
  return /*#__PURE__*/React.createElement("div", {
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
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Route Details"), /*#__PURE__*/React.createElement(RiskBar, {
    risk: route.risk
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg3)'
    }
  }, [['overview', 'Info'], ['noise', 'Noise'], ['loot', 'Loot']].map(function (_ref77) {
    var _ref78 = _slicedToArray(_ref77, 2),
      id = _ref78[0],
      label = _ref78[1];
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      onClick: function onClick() {
        return setTab(id);
      },
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        letterSpacing: '0.1em',
        color: tab === id ? 'var(--amber)' : 'var(--text3)',
        padding: '5px 10px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        borderBottom: tab === id ? '2px solid var(--amber)' : '2px solid transparent',
        transition: 'all 0.15s',
        position: 'relative',
        top: 1
      }
    }, label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 19,
      color: 'var(--amber)',
      marginBottom: 2
    }
  }, route.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text2)',
      marginBottom: 10
    }
  }, biome === null || biome === void 0 ? void 0 : biome.name, " \xB7 Tier ", biome === null || biome === void 0 ? void 0 : biome.tier), tab === 'overview' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement(InfoRow, {
    size: 12,
    label: "Duration",
    value: fmtTime((preparation ? preparation.durationHours : route.duration) * 60),
    color: "var(--text)"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    size: 12,
    label: "RMAT Access",
    value: ZI.rmatLabel(route.rmatTier),
    color: rmat === null || rmat === void 0 ? void 0 : rmat.color
  }), /*#__PURE__*/React.createElement(InfoRow, {
    size: 12,
    label: "Rec. Level",
    value: "Lv ".concat(route.recLevel, "+"),
    color: "var(--text)"
  }), preparation ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(InfoRow, {
    size: 12,
    label: "Room for loot",
    value: preparation.freeKg + ' kg',
    color: canRun ? 'var(--green)' : 'var(--red2)'
  }), /*#__PURE__*/React.createElement(InfoRow, {
    size: 12,
    label: "Avoid a fight",
    value: preparation.avoidChance + '%'
  })) : /*#__PURE__*/React.createElement(InfoRow, {
    size: 12,
    label: "Stamina Cost",
    value: "~".concat(staminaCost),
    color: canRun ? 'var(--green)' : 'var(--red2)'
  }), isCamp && route.hasVehicle && ZI.hasWorkingVehicle() && /*#__PURE__*/React.createElement(InfoRow, {
    size: 12,
    label: "Vehicle Wear",
    value: "~".concat(route.vehicleWear, "%"),
    color: "var(--purple)"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    size: 12,
    label: preparation ? 'Fight win chance' : 'Success Prob.',
    value: "".concat(liveProb, "% \xB7 ").concat(liveBand.label),
    color: liveBand.color
  }), /*#__PURE__*/React.createElement(InfoRow, {
    size: 12,
    label: "Run Mode",
    value: runMode === 'active' ? 'Active' : 'Idle',
    color: runMode === 'active' ? 'var(--amber)' : 'var(--text2)'
  }), runMode === 'passive' && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)',
      padding: '4px 6px',
      background: 'var(--bg4)',
      borderLeft: '2px solid var(--text3)'
    }
  }, "Idle penalty: Loot \xD70.7 \xB7 XP \xD7", ZI.ROUTE_XP_MULTIPLIERS.passive)), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)',
      marginBottom: 6
    }
  }, "ROUTE PATH"), /*#__PURE__*/React.createElement(RouteNodeChain, {
    nodes: route.nodes,
    compact: false,
    progress: liveRunD ? liveRunD.pct : undefined,
    route: route
  }), liveRunD && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--amber)',
      marginTop: 6
    }
  }, "\u25CF Running \xB7 ", Math.floor(liveRunD.pct * 100), "% \xB7 ", fmtRunLeft(liveRunD.remainingMs), " left")), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)',
      marginBottom: 4
    }
  }, "EXPECTED LOOT"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      flexWrap: 'wrap'
    }
  }, route.lootRange.map(function (l, i) {
    return /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text2)',
        background: 'var(--bg)',
        border: '1px solid var(--border)',
        padding: '2px 6px'
      }
    }, l);
  }))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)',
      marginBottom: 4
    }
  }, "EXPECTED REWARDS"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--text2)',
      lineHeight: 1.6
    }
  }, route.reward)), /*#__PURE__*/React.createElement(WeatherPanel, {
    biomeId: route.biome
  })), tab === 'noise' && /*#__PURE__*/React.createElement(React.Fragment, null, preparation ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement(InfoRow, {
    label: "Equipment noise",
    value: preparation.noiseLabel
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Avoid a fight",
    value: preparation.avoidChance + '%'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text2)',
      marginTop: 8
    }
  }, "Stealth and quiet equipment help you slip past encounters.")) : /*#__PURE__*/React.createElement(NoiseMeter, {
    route: route,
    runMode: runMode
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)',
      marginBottom: 5
    }
  }, "ZOMBIE BEHAVIOR"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, biome === null || biome === void 0 ? void 0 : biome.zombies.slice(0, 3).map(function (z) {
    var name = z.split(' ')[0];
    var behavior = ZI.ZOMBIE_BEHAVIOR.movement[name];
    return /*#__PURE__*/React.createElement("div", {
      key: z,
      style: {
        padding: '5px 8px',
        background: 'var(--bg3)',
        border: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--red2)'
      }
    }, z), behavior && /*#__PURE__*/React.createElement(Tag, {
      color: behavior.sprint ? 'var(--red2)' : 'var(--amber)'
    }, behavior.sprint ? 'SPRINTS' : 'WALKS')), behavior && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text3)',
        fontStyle: 'italic'
      }
    }, behavior.note));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      padding: '6px 8px',
      background: 'var(--bg4)',
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)',
      lineHeight: 1.6
    }
  }, /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text2)'
    }
  }, "Memory:"), " Zombies forget position after ~", ZI.ZOMBIE_BEHAVIOR.memory.duration_s, "s", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("b", {
    style: {
      color: 'var(--text2)'
    }
  }, "Migration:"), " Above ", ZI.ZOMBIE_BEHAVIOR.hearing.migration_threshold, " in area = wave begins", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      fontStyle: 'italic'
    }
  }, ZI.ZOMBIE_BEHAVIOR.memory.note))))), tab === 'loot' && /*#__PURE__*/React.createElement(ContainersPanel, {
    biomeId: route.biome
  }), !canRun && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 10px',
      background: 'rgba(139,58,42,0.15)',
      border: '1px solid var(--red)',
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--red2)',
      marginTop: 8
    }
  }, "\u26A0 ", deployReason)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      borderTop: '1px solid var(--border)'
    }
  }, isCamp && !ZI.hasWorkingVehicle() && /*#__PURE__*/React.createElement("div", {
    title: "Loot comes back on foot. Find a working car at a Wandering checkpoint to unlock Cargo Unloading.",
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text2)',
      marginBottom: 6,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      cursor: 'help'
    }
  }, "\uD83D\uDE97 No vehicle \u2014 cargo unloading locked"), /*#__PURE__*/React.createElement("button", {
    onClick: canRun ? onLaunch : undefined,
    disabled: !canRun,
    "data-deploy": "1",
    title: canRun ? '' : deployReason,
    className: "btn btn-amber",
    style: {
      width: '100%',
      opacity: canRun ? 1 : 0.4,
      cursor: canRun ? 'pointer' : 'not-allowed'
    }
  }, runMode === 'active' ? '→ Deploy (Active)' : '→ Deploy (Idle)'), !canRun && /*#__PURE__*/React.createElement("div", {
    "data-deploy-reason": "1",
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--red2)',
      marginTop: 4,
      textAlign: 'center'
    }
  }, "Can't deploy: ", deployReason)));
}
function InfoRow(_ref79) {
  var label = _ref79.label,
    value = _ref79.value,
    color = _ref79.color,
    size = _ref79.size;
  var s = size || 10;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: s,
      color: 'var(--text3)'
    }
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: s + 1,
      color: color || 'var(--text)',
      textAlign: 'right'
    }
  }, value));
}
function SoloStatusPanel(_ref80) {
  var effectiveStamina = _ref80.effectiveStamina;
  return /*#__PURE__*/React.createElement("div", {
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
      marginBottom: 6,
      letterSpacing: '0.12em'
    }
  }, "LAST RUN"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--text2)',
      lineHeight: 1.6
    }
  }, "Crestwood Drive \xB7 4h 20m", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--green)'
    }
  }, "Extracted: 3\xD7 RMAT-1, 12\xD7 Scrap, 1\xD7 Blueprint")));
}

// ─── LOOT LOADING SCREEN ─────────────────────────────────────────────────────
// PZ justification: in PZ, transferring items between containers and vehicles
// takes real time proportional to item count. Heavier/bulkier items take longer.
// Zombie Idler makes this a dedicated screen to reinforce resource weight & time cost.
function LootLoadingScreen(_ref81) {
  var _ZI$BIOMES$find;
  var route = _ref81.route,
    onComplete = _ref81.onComplete;
  var _useState79 = useState('arriving'),
    _useState80 = _slicedToArray(_useState79, 2),
    phase = _useState80[0],
    setPhase = _useState80[1];
  var _useState81 = useState({}),
    _useState82 = _slicedToArray(_useState81, 2),
    loadProgress = _useState82[0],
    setLoadProgress = _useState82[1];
  var _useState83 = useState([{
      id: 'l1',
      cat: 'heavy',
      name: 'Reinforced Steel Panels ×4',
      weight: 120,
      container: 'WarehouseShelf',
      timeMs: 9000
    }, {
      id: 'l2',
      cat: 'medium',
      name: 'Canned Rations ×18',
      weight: 36,
      container: 'KitchenCabinet',
      timeMs: 4500
    }, {
      id: 'l3',
      cat: 'medium',
      name: 'Advanced Toolkit',
      weight: 8,
      container: 'CarTrunk',
      timeMs: 3200
    }, {
      id: 'l4',
      cat: 'light',
      name: 'RMAT-1 Mechanical Shard ×2',
      weight: 1,
      container: 'ZombiePocket',
      timeMs: 1800
    }, {
      id: 'l5',
      cat: 'light',
      name: 'RMAT-1 Chemical Vial',
      weight: 1,
      container: 'LabStorage',
      timeMs: 1500
    }, {
      id: 'l6',
      cat: 'data',
      name: 'Blueprint: Workshop III',
      weight: 0,
      container: 'LabStorage',
      timeMs: 800
    }]),
    _useState84 = _slicedToArray(_useState83, 1),
    lootItems = _useState84[0];
  var _useState85 = useState(new Set()),
    _useState86 = _slicedToArray(_useState85, 2),
    completedItems = _useState86[0],
    setCompletedItems = _useState86[1];
  var _useState87 = useState(null),
    _useState88 = _slicedToArray(_useState87, 2),
    activeItem = _useState88[0],
    setActiveItem = _useState88[1];
  var _useState89 = useState(0),
    _useState90 = _slicedToArray(_useState89, 2),
    vehicleOffload = _useState90[0],
    setVehicleOffload = _useState90[1];

  // PZ vehicle condition degradation during route
  var vehicleCondition = {
    before: 65,
    after: 47
  };
  var vehComponents = [{
    name: 'Engine',
    before: 80,
    after: 74,
    component: ZI.VEHICLE_SYSTEMS.components.Engine
  }, {
    name: 'Tires',
    before: 62,
    after: 42,
    component: ZI.VEHICLE_SYSTEMS.components.Tires
  }, {
    name: 'Battery',
    before: 90,
    after: 88,
    component: ZI.VEHICLE_SYSTEMS.components.Battery
  }, {
    name: 'Brake Fluid',
    before: 75,
    after: 73,
    component: ZI.VEHICLE_SYSTEMS.components.BrakeFluid
  }];

  // Character state after run (PZ fatigue model)
  var runHours = (route === null || route === void 0 ? void 0 : route.duration) || 4;
  var fatiguePhase = ZI.FATIGUE_MODEL.phases.find(function (p) {
    return 10 + runHours >= p.hoursAwake[0] && 10 + runHours < p.hoursAwake[1];
  }) || ZI.FATIGUE_MODEL.phases[ZI.FATIGUE_MODEL.phases.length - 1];
  useEffect(function () {
    if (phase !== 'unloading') return;
    var delay = 1000;
    lootItems.forEach(function (item) {
      setTimeout(function () {
        setActiveItem(item.id);
        var start = Date.now();
        var interval = setInterval(function () {
          var elapsed = Date.now() - start;
          var pct = Math.min(elapsed / item.timeMs * 100, 100);
          setLoadProgress(function (p) {
            return _objectSpread(_objectSpread({}, p), {}, _defineProperty({}, item.id, pct));
          });
          setVehicleOffload(function (v) {
            return Math.min(v + 0.3, 100);
          });
          if (pct >= 100) {
            clearInterval(interval);
            setCompletedItems(function (prev) {
              return new Set([].concat(_toConsumableArray(prev), [item.id]));
            });
            setActiveItem(null);
          }
        }, 80);
      }, delay);
      delay += item.timeMs + 600;
    });
    setTimeout(function () {
      return setPhase('complete');
    }, delay + 1000);
  }, [phase]);
  useEffect(function () {
    var t = setTimeout(function () {
      return setPhase('unloading');
    }, 2400);
    return function () {
      return clearTimeout(t);
    };
  }, []);
  var catColors = {
    heavy: 'var(--red2)',
    medium: 'var(--amber)',
    light: 'var(--purple)',
    data: 'var(--blue)'
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "screen-enter",
    style: {
      display: 'flex',
      height: '100%',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      opacity: 0.03,
      backgroundImage: 'linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px)',
      backgroundSize: '48px 48px',
      pointerEvents: 'none'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      zIndex: 1,
      width: '100%',
      display: 'flex',
      gap: 0,
      padding: 0,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 28px',
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)',
      letterSpacing: '0.3em',
      marginBottom: 6
    }
  }, phase === 'arriving' ? '— VEHICLE RETURNING —' : phase === 'unloading' ? '— UNLOADING CARGO —' : '— EXTRACTION COMPLETE —'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 30,
      color: 'var(--amber)',
      lineHeight: 1
    }
  }, (route === null || route === void 0 ? void 0 : route.name) || 'Crestwood Drive'), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text2)',
      marginTop: 5,
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", null, route !== null && route !== void 0 && route.biome ? (_ZI$BIOMES$find = ZI.BIOMES.find(function (b) {
    return b.id === route.biome;
  })) === null || _ZI$BIOMES$find === void 0 ? void 0 : _ZI$BIOMES$find.name : 'Ruined Suburbia'), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", null, (route === null || route === void 0 ? void 0 : route.duration) || 4, "h Run"), /*#__PURE__*/React.createElement("span", null, "\xB7"), /*#__PURE__*/React.createElement("span", {
    style: {
      color: fatiguePhase.color
    }
  }, fatiguePhase.level, " on return"))), /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'var(--bg2)',
      border: '1px solid var(--border)',
      padding: '12px 16px',
      marginBottom: 16,
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 28,
      flexShrink: 0
    }
  }, "\uD83D\uDE9B"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 13,
      color: 'var(--text)'
    }
  }, (ZI.getVehicle() || {}).name || 'Vehicle', " \u2014 Cargo Bay"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--amber)'
    }
  }, Math.round(vehicleOffload), "% Unloaded")), /*#__PURE__*/React.createElement(ProgressBar, {
    value: vehicleOffload,
    color: "var(--amber)",
    animated: phase === 'unloading',
    height: 7
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      flexShrink: 0
    }
  }, phase === 'arriving' && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)'
    }
  }, "ARRIVING..."), phase === 'complete' && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--green)'
    }
  }, "\u2713 UNLOADED"))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5,
      marginBottom: 16
    }
  }, lootItems.map(function (item) {
    var isDone = completedItems.has(item.id);
    var isActive = activeItem === item.id;
    var pct = loadProgress[item.id] || 0;
    var catObj = ZI.LOOT_CATEGORIES[item.cat];
    var color = catColors[item.cat];
    var container = ZI.LOOT_CONTAINERS[item.container];
    return /*#__PURE__*/React.createElement("div", {
      key: item.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '8px 14px',
        background: 'var(--bg2)',
        border: "1px solid ".concat(isDone ? 'var(--border2)' : isActive ? color : 'var(--border)'),
        transition: 'all 0.3s',
        opacity: phase === 'arriving' ? 0.5 : 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        flexShrink: 0,
        background: isDone ? 'var(--green)' : isActive ? color : 'var(--border2)',
        boxShadow: isActive ? "0 0 8px ".concat(color) : 'none',
        transition: 'all 0.3s'
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: isActive || isDone ? 3 : 0
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: isDone ? 'var(--text2)' : isActive ? 'var(--text)' : 'var(--text2)'
      }
    }, item.name), /*#__PURE__*/React.createElement(Tag, {
      color: color
    }, catObj === null || catObj === void 0 ? void 0 : catObj.label), item.weight > 0 && /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)'
      }
    }, item.weight, "kg"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)',
        marginLeft: 'auto'
      }
    }, "from ", item.container.replace(/([A-Z])/g, ' $1').trim())), (isActive || isDone) && /*#__PURE__*/React.createElement(ProgressBar, {
      value: pct,
      color: isDone ? 'var(--green)' : color,
      height: 3,
      animated: isActive
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: isDone ? 'var(--green)' : isActive ? color : 'var(--text3)',
        width: 64,
        textAlign: 'right',
        flexShrink: 0
      }
    }, isDone ? '✓ STORED' : isActive ? "".concat(Math.round(pct), "%") : phase === 'arriving' ? 'PENDING' : 'QUEUED'));
  })), phase === 'unloading' && /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      padding: '8px',
      background: 'var(--bg2)',
      border: '1px solid var(--border)'
    }
  }, "Unloading in progress \u2014 heavy cargo takes longer (PZ container transfer logic). Do not interrupt."), phase === 'complete' && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      justifyContent: 'center',
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber btn-lg",
    onClick: onComplete
  }, "Return to Hideout \u2192"))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 280,
      borderLeft: '1px solid var(--border)',
      background: 'var(--bg2)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'auto',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '14px 14px 10px',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 8,
      letterSpacing: '0.12em'
    }
  }, "VEHICLE CONDITION ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 7,
      fontStyle: 'italic'
    }
  }, "\xB7 PZ degradation model")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 7
    }
  }, vehComponents.map(function (vc) {
    var drop = vc.before - vc.after;
    var condColor = vc.after > 70 ? 'var(--green)' : vc.after > 40 ? 'var(--amber)' : 'var(--red2)';
    return /*#__PURE__*/React.createElement("div", {
      key: vc.name
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text2)'
      }
    }, vc.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: condColor
      }
    }, vc.after, "% ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--red2)',
        fontSize: 8
      }
    }, "\u25BC", drop))), /*#__PURE__*/React.createElement(ProgressBar, {
      value: vc.after,
      color: condColor,
      height: 4
    }), vc.after < 50 && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--red2)',
        marginTop: 2
      }
    }, "\u26A0 ", vc.component.failureEffect, " \u2014 needs ", vc.component.repairSkill));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      padding: '5px 8px',
      background: 'var(--bg4)',
      borderLeft: '3px solid var(--amber)',
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      lineHeight: 1.5
    }
  }, "PZ rule: Tires degrade fastest off-road. Always carry a spare. Brake failure mid-escape = death.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px',
      borderBottom: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 8,
      letterSpacing: '0.12em'
    }
  }, "CHARACTER STATE ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 7,
      fontStyle: 'italic'
    }
  }, "\xB7 post-run")), /*#__PURE__*/React.createElement(FatigueTracker, {
    hoursAwake: 10 + runHours
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(NutritionBar, {
    label: "Nutrition (depleted)",
    value: 62,
    level: getNutritionLevel(62)
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 5
    }
  }), /*#__PURE__*/React.createElement(NutritionBar, {
    label: "Hydration (depleted)",
    value: 48,
    level: getHydrationLevel(48)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      padding: '5px 8px',
      background: 'var(--bg4)',
      borderLeft: '3px solid var(--amber)',
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      lineHeight: 1.5
    }
  }, "PZ: a ", runHours, "h run burns ~", Math.round(runHours * 8), " stamina. Schedule rest + meal immediately or next run suffers cascading penalties.")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '12px 14px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 6,
      letterSpacing: '0.12em'
    }
  }, "POST-RUN CHECKLIST"), [{
    ok: true,
    label: 'No bite detected',
    note: 'PZ: check after every zombie contact'
  }, {
    ok: true,
    label: 'No laceration wounds',
    note: '25% infection chance if untreated'
  }, {
    ok: false,
    label: 'Tires need repair',
    note: 'PZ: blowout risk on next run'
  }, {
    ok: true,
    label: 'Gear durability OK',
    note: 'Acid rain caused minor corrosion'
  }, {
    ok: false,
    label: 'Eat & hydrate before sleep',
    note: 'PZ: sleeping while hungry slows healing'
  }].map(function (item, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        display: 'flex',
        alignItems: 'flex-start',
        gap: 7,
        marginBottom: 5
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 14,
        height: 14,
        borderRadius: 2,
        flexShrink: 0,
        marginTop: 1,
        background: item.ok ? 'rgba(76,175,125,0.15)' : 'rgba(139,58,42,0.15)',
        border: "1px solid ".concat(item.ok ? 'var(--green)' : 'var(--red2)'),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 8,
        color: item.ok ? 'var(--green)' : 'var(--red2)'
      }
    }, item.ok ? '✓' : '!'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        color: item.ok ? 'var(--text2)' : 'var(--text)'
      }
    }, item.label), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)',
        fontStyle: 'italic'
      }
    }, item.note)));
  })))));
}

// ─── SCHEDULE SCREEN ─────────────────────────────────────────────────────────
function ScheduleScreen(_ref82) {
  var mode = _ref82.mode;
  var _useState91 = useState([{
      id: 1,
      type: 'rest',
      label: 'Rest & Recover',
      duration: 3,
      priority: 1,
      status: 'queued',
      startIn: 0
    }, {
      id: 2,
      type: 'craft',
      label: 'Craft: Hazard Suit T2',
      duration: 2,
      priority: 2,
      status: 'queued',
      startIn: 3
    }, {
      id: 3,
      type: 'faction',
      label: 'Iron March Contract',
      duration: 4,
      priority: 3,
      status: 'queued',
      startIn: 5
    }, {
      id: 4,
      type: 'scavenge',
      label: 'Scavenge: Crestwood Drive',
      duration: 4,
      priority: 4,
      status: 'queued',
      startIn: 9
    }, {
      id: 5,
      type: 'train',
      label: 'Train: Reflex',
      duration: 3,
      priority: 5,
      status: 'queued',
      startIn: 13
    }, {
      id: 6,
      type: 'repair',
      label: 'Repair: Reinforced Truck',
      duration: 2,
      priority: 6,
      status: 'queued',
      startIn: 16
    }]),
    _useState92 = _slicedToArray(_useState91, 2),
    tasks = _useState92[0],
    setTasks = _useState92[1];
  var _useState93 = useState(null),
    _useState94 = _slicedToArray(_useState93, 2),
    dragIdx = _useState94[0],
    setDragIdx = _useState94[1];
  var totalHours = tasks.reduce(function (s, t) {
    return s + t.duration;
  }, 0);
  var TIMELINE_HOURS = 24;
  var moveUp = function moveUp(idx) {
    if (idx === 0) return;
    var t = _toConsumableArray(tasks);
    var _ref83 = [t[idx], t[idx - 1]];
    t[idx - 1] = _ref83[0];
    t[idx] = _ref83[1];
    setTasks(t.map(function (task, i) {
      return _objectSpread(_objectSpread({}, task), {}, {
        priority: i + 1
      });
    }));
  };
  var moveDown = function moveDown(idx) {
    if (idx === tasks.length - 1) return;
    var t = _toConsumableArray(tasks);
    var _ref84 = [t[idx + 1], t[idx]];
    t[idx] = _ref84[0];
    t[idx + 1] = _ref84[1];
    setTasks(t.map(function (task, i) {
      return _objectSpread(_objectSpread({}, task), {}, {
        priority: i + 1
      });
    }));
  };
  var removeTask = function removeTask(id) {
    return setTasks(tasks.filter(function (t) {
      return t.id !== id;
    }));
  };
  var taskColors = {
    rest: 'var(--blue)',
    craft: 'var(--amber)',
    faction: 'var(--purple)',
    scavenge: 'var(--green)',
    train: 'var(--red2)',
    repair: 'var(--text2)',
    assign: 'var(--amber2)',
    trade: 'var(--green2)',
    defend: 'var(--red)',
    extract: 'var(--purple)'
  };

  // Timeline bar
  var cursor = 0;
  var timelineBlocks = tasks.map(function (task) {
    var block = _objectSpread(_objectSpread({}, task), {}, {
      start: cursor,
      widthPct: task.duration / TIMELINE_HOURS * 100
    });
    cursor += task.duration;
    return block;
  });
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
      padding: '10px 12px',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 14,
      color: 'var(--amber)',
      letterSpacing: '0.1em'
    }
  }, "24-HOUR SCHEDULE TIMELINE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: totalHours > TIMELINE_HOURS ? 'var(--red2)' : 'var(--green)'
    }
  }, totalHours, "h / ", TIMELINE_HOURS, "h used")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 3
    }
  }, [0, 4, 8, 12, 16, 20, 24].map(function (h) {
    return /*#__PURE__*/React.createElement("span", {
      key: h,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)'
      }
    }, h === 0 ? 'NOW' : "+".concat(h, "h"));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 28,
      background: 'var(--bg4)',
      borderRadius: 2,
      overflow: 'hidden',
      display: 'flex',
      position: 'relative'
    }
  }, timelineBlocks.map(function (block, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: block.id,
      style: {
        width: "".concat(block.widthPct, "%"),
        height: '100%',
        flexShrink: 0,
        background: taskColors[block.type] || 'var(--text2)',
        borderRight: '1px solid var(--bg)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 4,
        overflow: 'hidden',
        opacity: 0.8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'rgba(255,255,255,0.8)',
        whiteSpace: 'nowrap',
        overflow: 'hidden'
      }
    }, block.label.split(':')[0]));
  }), totalHours < TIMELINE_HOURS && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: 'var(--bg4)',
      borderLeft: '1px dashed var(--border2)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 5,
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "Scheduled window: when you return ", totalHours > 0 ? "in ~".concat(totalHours, "h") : 'now', " \xB7 Tasks execute in priority order")), /*#__PURE__*/React.createElement("div", {
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
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Scheduled Tasks \u2014 Priority Order"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "Drag to reorder")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, tasks.map(function (task, idx) {
    var color = taskColors[task.type] || 'var(--text2)';
    var taskType = ZI.TASK_TYPES.find(function (t) {
      return t.id === task.type;
    });
    var startTime = tasks.slice(0, idx).reduce(function (s, t) {
      return s + t.duration;
    }, 0);
    return /*#__PURE__*/React.createElement("div", {
      key: task.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 12px',
        background: 'var(--bg3)',
        border: "1px solid ".concat(dragIdx === idx ? 'var(--amber)' : 'var(--border)'),
        cursor: 'grab'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 22,
        height: 22,
        borderRadius: '50%',
        border: "1px solid ".concat(color),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: color
      }
    }, idx + 1), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 3,
        height: 32,
        background: color,
        borderRadius: 1,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        minWidth: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: color
      }
    }, taskType === null || taskType === void 0 ? void 0 : taskType.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        color: 'var(--text)',
        fontWeight: 500
      }
    }, task.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      color: color
    }, fmtTime(task.duration * 60)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)'
      }
    }, "Starts +", startTime, "h from now"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 3,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return moveUp(idx);
      },
      style: {
        background: 'var(--bg4)',
        border: '1px solid var(--border)',
        color: 'var(--text2)',
        width: 22,
        height: 22,
        cursor: 'pointer',
        fontSize: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, "\u2191"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return moveDown(idx);
      },
      style: {
        background: 'var(--bg4)',
        border: '1px solid var(--border)',
        color: 'var(--text2)',
        width: 22,
        height: 22,
        cursor: 'pointer',
        fontSize: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, "\u2193"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return removeTask(task.id);
      },
      style: {
        background: 'rgba(139,58,42,0.15)',
        border: '1px solid var(--red)',
        color: 'var(--red2)',
        width: 22,
        height: 22,
        cursor: 'pointer',
        fontSize: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, "\u2715")));
  })))), /*#__PURE__*/React.createElement("div", {
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
  }, "Add Task"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, ZI.TASK_TYPES.filter(function (t) {
    return t.category === 'both' || t.category === (mode === 'camp' ? 'camp' : 'solo');
  }).map(function (taskType) {
    var color = taskColors[taskType.id] || 'var(--text2)';
    return /*#__PURE__*/React.createElement("div", {
      key: taskType.id,
      onClick: function onClick() {
        return setTasks(function (prev) {
          return [].concat(_toConsumableArray(prev), [{
            id: Date.now(),
            type: taskType.id,
            label: taskType.name,
            duration: taskType.duration,
            priority: prev.length + 1,
            status: 'queued'
          }]);
        });
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '7px 10px',
        cursor: 'pointer',
        background: 'var(--bg3)',
        border: "1px solid var(--border)",
        transition: 'all 0.15s'
      },
      onMouseEnter: function onMouseEnter(e) {
        return e.currentTarget.style.borderColor = color;
      },
      onMouseLeave: function onMouseLeave(e) {
        return e.currentTarget.style.borderColor = 'var(--border)';
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 14
      }
    }, taskType.icon), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--text)'
      }
    }, taskType.name), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)'
      }
    }, fmtTime(taskType.duration * 60))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: color
      }
    }, "+ Add"));
  }))), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 12,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 8,
      letterSpacing: '0.12em'
    }
  }, "SCHEDULE SUMMARY"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, /*#__PURE__*/React.createElement(InfoRow, {
    label: "Total tasks",
    value: tasks.length,
    color: "var(--text)"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Total time",
    value: fmtTime(totalHours * 60),
    color: totalHours > 24 ? 'var(--red2)' : 'var(--amber)'
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Completion",
    value: "+".concat(totalHours, "h from now"),
    color: "var(--text2)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border)',
      margin: '10px 0'
    }
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    style: {
      width: '100%',
      marginBottom: 8
    }
  }, "Lock Schedule & Close App"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      width: '100%'
    }
  }, "Save Draft"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      lineHeight: 1.5
    }
  }, "Tasks run automatically while offline. Return in ", fmtTime(totalHours * 60), " to collect results."))));
}

// ─── RMAT CRAFTING SCREEN ─────────────────────────────────────────────────────
function CraftJobsStrip() {
  var ZI = window.ZI;
  var _React$useState23 = React.useState(0),
    _React$useState24 = _slicedToArray(_React$useState23, 2),
    force = _React$useState24[1];
  React.useEffect(function () {
    var t = setInterval(function () {
      return force(function (n) {
        return n + 1;
      });
    }, 500);
    return function () {
      return clearInterval(t);
    };
  }, []);
  var jobs = ZI.getJobs().jobs.filter(function (j) {
    return j.type === 'craft' || j.type === 'repair';
  });
  var slots = ZI.craftSlots();
  var active = jobs.filter(function (j) {
    return j.status === 'active';
  }).length;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 8px',
      borderBottom: '1px solid var(--border)',
      background: 'var(--bg2)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: jobs.length ? 5 : 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "Craft jobs ", active, "/", slots, ZI.structureLevel('workshop') < 5 ? ' · upgrade Workshop for more' : '')), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, jobs.slice(0, 4).map(function (j) {
    var nm = j.type === 'repair' ? (ZI.getGearItem(j.refId) || {}).name : ((ZI.CRAFT_RECIPES || []).find(function (r) {
      return r.id === j.refId;
    }) || {}).name;
    var pct = ZI.jobProgress(j) * 100;
    var rem = ZI.jobRemaining(j);
    return /*#__PURE__*/React.createElement("div", {
      key: j.id,
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: j.status === 'active' ? 'var(--amber)' : 'var(--text3)',
        width: 96,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, j.type === 'repair' ? '🔧 ' : '', nm || j.refId), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        height: 5,
        background: 'var(--bg4)',
        borderRadius: 2
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: "".concat(pct, "%"),
        background: j.status === 'active' ? 'var(--amber)' : 'var(--text3)',
        borderRadius: 2
      }
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)',
        width: 42,
        textAlign: 'right'
      }
    }, j.status === 'queued' ? 'queued' : rem >= 60 ? "".concat(Math.round(rem / 60), "m") : "".concat(rem, "s")), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        ZI.cancelJob(j.id);
        force(function (n) {
          return n + 1;
        });
      },
      title: "Cancel",
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        cursor: 'pointer',
        background: 'none',
        border: '1px solid var(--border)',
        color: 'var(--text3)',
        padding: '0 4px'
      }
    }, "\u2715"));
  })));
}
function RmatCraftingScreen() {
  return /*#__PURE__*/React.createElement(window.CraftingWorkspace, null, /*#__PURE__*/React.createElement(RmatCraftingRecipeBrowser, null));
}
function RmatCraftingRecipeBrowser() {
  var M = window.ZI_MATERIALS;
  var _useState95 = useState(function () {
      var s = {};
      Object.keys(M).forEach(function (k) {
        return s[k] = M[k].current;
      });
      return s;
    }),
    _useState96 = _slicedToArray(_useState95, 2),
    stock = _useState96[0],
    setStock = _useState96[1];
  var _useState97 = useState(null),
    _useState98 = _slicedToArray(_useState97, 2),
    tierFilter = _useState98[0],
    setTierFilter = _useState98[1];
  var _useState99 = useState('all'),
    _useState100 = _slicedToArray(_useState99, 2),
    kindFilter = _useState100[0],
    setKindFilter = _useState100[1]; // all | rmat | gear | consumable
  var _useState101 = useState('all'),
    _useState102 = _slicedToArray(_useState101, 2),
    purposeFilter = _useState102[0],
    setPurposeFilter = _useState102[1]; // all | equip | enhance | consume | trade | faction
  var _useState103 = useState(null),
    _useState104 = _slicedToArray(_useState103, 2),
    selId = _useState104[0],
    setSelId = _useState104[1];
  var _useState105 = useState(null),
    _useState106 = _slicedToArray(_useState105, 2),
    toast = _useState106[0],
    setToast = _useState106[1];
  var _useState107 = useState(null),
    _useState108 = _slicedToArray(_useState107, 2),
    t5Confirm = _useState108[0],
    setT5Confirm = _useState108[1];
  var _useState109 = useState(null),
    _useState110 = _slicedToArray(_useState109, 2),
    t5Event = _useState110[0],
    setT5Event = _useState110[1];
  var recipes = ZI.CRAFT_RECIPES || [];
  var recipeSpriteById = {
    scrap_pouch: 'art/crafting/recipes/scrap-pouch-v1.png',
    nail_board: 'art/crafting/recipes/nail-board-v1.png',
    scrap_wire: 'art/crafting/recipes/scrap-wire-v1.png',
    tinder_bundle: 'art/crafting/recipes/tinder-bundle-v1.png',
    crude_splint: 'art/crafting/recipes/crude-splint-v3.png',
    reinforced_pack: 'art/crafting/recipes/reinforced-pack-v1.png',
    barricade_panel: 'art/crafting/recipes/barricade-panel-v1.png',
    cloth_wrap_kit: 'art/crafting/recipes/cloth-wrap-kit-v1.png',
    fuel_drum: 'art/crafting/recipes/fuel-drum-v1.png',
    signal_booster: 'art/crafting/recipes/signal-booster-v1.png',
    trauma_kit: 'art/crafting/recipes/trauma-kit-v1.png',
    wire_mesh_trap: 'art/crafting/recipes/wire-mesh-trap-v1.png',
    arc_igniter: 'art/crafting/recipes/arc-igniter-v1.png',
    fuel_converter: 'art/crafting/recipes/fuel-converter-v1.png',
    hollow_point_press: 'art/crafting/recipes/hollow-point-press-v1.png',
    sterilization_unit: 'art/crafting/recipes/sterilization-unit-v1.png',
    composite_plating: 'art/crafting/recipes/composite-plating-v1.png',
    circuit_splice: 'art/crafting/recipes/circuit-splice-v1.png',
    toxin_filter: 'art/crafting/recipes/toxin-filter-v1.png',
    neural_tap: 'art/crafting/recipes/neural-tap-v1.png',
    siege_frame: 'art/crafting/recipes/siege-frame-v1.png',
    resonance_cell: 'art/crafting/recipes/resonance-cell-v1.png',
    bone_weave_vest: 'art/crafting/recipes/bone-weave-vest-v1.png',
    emp_coil: 'art/crafting/recipes/emp-coil-v1.png',
    hazard_patch_kit: 'art/crafting/recipes/hazard-patch-kit-v1.png',
    crystalline_core: 'art/crafting/recipes/crystalline-core-v1.png',
    plasma_conduit: 'art/crafting/recipes/plasma-conduit-v1.png',
    necrotic_membrane: 'art/crafting/recipes/necrotic-membrane-v1.png',
    siege_engine_frame: 'art/crafting/recipes/siege-engine-frame-v1.png',
    quantum_splice_board: 'art/crafting/recipes/quantum-splice-board-v1.png',
    echo_condenser: 'art/crafting/recipes/echo-condenser-v1.png',
    void_lattice: 'art/crafting/recipes/void-lattice-v1.png',
    fracture_engine: 'art/crafting/recipes/fracture-engine-v1.png',
    revenant_core: 'art/crafting/recipes/revenant-core-v1.png',
    signal_zero: 'art/crafting/recipes/signal-zero-v1.png'
  };
  var recipeIcon = function recipeIcon(recipe, size) {
    return recipeSpriteById[recipe.id] ? /*#__PURE__*/React.createElement("img", {
      src: recipeSpriteById[recipe.id],
      alt: recipe.name,
      style: {
        width: size,
        height: size,
        objectFit: 'contain',
        imageRendering: 'pixelated',
        flexShrink: 0
      }
    }) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: size
      }
    }, recipe.icon);
  };
  var sel = recipes.find(function (r) {
    return r.id === selId;
  }) || null;
  var canCraft = function canCraft(r) {
    return Object.entries(r.cost).every(function (_ref85) {
      var _ref86 = _slicedToArray(_ref85, 2),
        k = _ref86[0],
        q = _ref86[1];
      return (stock[k] || 0) >= q;
    });
  };
  var fmtDur = function fmtDur(sec) {
    if (sec < 3600) return "".concat(Math.round(sec / 60), "m");
    var h = Math.floor(sec / 3600),
      m = Math.round(sec % 3600 / 60);
    return "".concat(h, "h").concat(m ? " ".concat(m, "m") : '');
  };
  // Recipe times are in-game seconds, on the shared game clock: 1 game hour = ZI.REAL_MS_PER_GAME_HOUR (60 real s).
  var craftRealSec = function craftRealSec(r) {
    return (r.time || 6) * window.ZI.REAL_MS_PER_GAME_HOUR / 3600000;
  };
  var fmtReal = function fmtReal(sec) {
    return sec < 60 ? "".concat(Math.max(1, Math.round(sec)), "s") : "".concat(Math.floor(sec / 60), "m").concat(Math.round(sec % 60) ? " ".concat(Math.round(sec % 60), "s") : '');
  };
  var doCraft = function doCraft(r) {
    if (!canCraft(r)) return;
    setStock(function (prev) {
      var next = _objectSpread({}, prev);
      Object.entries(r.cost).forEach(function (_ref87) {
        var _ref88 = _slicedToArray(_ref87, 2),
          k = _ref88[0],
          q = _ref88[1];
        next[k] = Math.max(0, (next[k] || 0) - q);
        if (M[k]) M[k].current = next[k];
      });
      return next;
    });
    // Enqueue as a timed job (Workshop-slotted). Grant fires on completion.
    window.ZI.enqueueJob('craft', r.id, craftRealSec(r), {}, 1);
    if (r.tier === 5) setT5Event(r);else setToast("\u23F3 Crafting: ".concat(r.name, " (").concat(fmtDur(r.time || 60), " game \xB7 ").concat(fmtReal(craftRealSec(r)), " real)"));
  };
  var onCraftClick = function onCraftClick(r) {
    if (!canCraft(r)) return;
    if (r.tier === 5) setT5Confirm(r);else doCraft(r);
  };
  useEffect(function () {
    if (!toast) return;
    var t = setTimeout(function () {
      return setToast(null);
    }, 2200);
    return function () {
      return clearTimeout(t);
    };
  }, [toast]);
  var tierColor = function tierColor(t) {
    return (ZI.RMAT_TIERS[t] || ZI.RMAT_TIERS[1]).color;
  };
  var filtered = recipes.filter(function (r) {
    return (tierFilter === null || r.tier === tierFilter) && (kindFilter === 'all' || (r.kind || 'rmat') === kindFilter) && (purposeFilter === 'all' || function () {
      var gi = r.grantsGear && ZI.getGearItem && ZI.getGearItem(r.grantsGear);
      return gi && gi.purpose && gi.purpose.includes(purposeFilter);
    }());
  });

  // First-visit Crafting tutorial (brand-new saves start with an empty stockpile).
  var _useState111 = useState(function () {
      return !window.ZI.tutDone('zi_craft_tut_done');
    }),
    _useState112 = _slicedToArray(_useState111, 2),
    craftTut = _useState112[0],
    setCraftTut = _useState112[1];
  var _useState113 = useState(0),
    _useState114 = _slicedToArray(_useState113, 2),
    craftTutStep = _useState114[0],
    setCraftTutStep = _useState114[1];
  var endCraftTut = function endCraftTut() {
    window.ZI.setTutDone('zi_craft_tut_done');
    setCraftTut(false);
  };
  var anyMats = Object.keys(M).some(function (k) {
    return (stock[k] || 0) > 0;
  });
  var CRAFT_TUT = [{
    title: 'Nothing to craft — yet',
    body: 'Every recipe costs materials, and a new camp starts with an empty stockpile. That\'s why every recipe shows ✗ Missing and its costs are red.'
  }, {
    title: 'Where materials come from',
    body: 'Send your survivor Wandering or on Routes loot runs. Bring the salvage home, then break it down in Stockpile → Recycler to fill these bars.'
  }, {
    title: 'Your first craft',
    body: 'Scrap Pouch needs 10 Wood + 5 Metal. Once you have that, its badge turns ✓ Craftable — select it and press Craft Now.'
  }];
  var tut = CRAFT_TUT[craftTutStep];
  return /*#__PURE__*/React.createElement("div", {
    className: "screen-enter",
    style: {
      display: 'flex',
      gap: 8,
      padding: 8,
      height: '100%',
      overflow: 'hidden',
      position: 'relative'
    }
  }, craftTut && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 40,
      background: 'rgba(0,0,0,0.72)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      width: '100%',
      maxWidth: 420,
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
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: '#ff3b3b',
      letterSpacing: '0.12em'
    }
  }, "TUTORIAL \xB7 CRAFTING \xB7 ", craftTutStep + 1, "/", CRAFT_TUT.length), /*#__PURE__*/React.createElement("button", {
    onClick: endCraftTut,
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
  }, tut.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--text)',
      lineHeight: 1.5
    }
  }, tut.body), craftTutStep === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: anyMats ? 'var(--green)' : 'var(--red2)'
    }
  }, anyMats ? 'You already have some materials — check which recipes you can afford.' : 'Stockpile: empty'), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginTop: 12
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    disabled: craftTutStep === 0,
    onClick: function onClick() {
      return setCraftTutStep(function (s) {
        return s - 1;
      });
    },
    style: {
      opacity: craftTutStep === 0 ? 0.4 : 1
    }
  }, "Back"), craftTutStep < CRAFT_TUT.length - 1 ? /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    onClick: function onClick() {
      return setCraftTutStep(function (s) {
        return s + 1;
      });
    }
  }, "Next") : /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    onClick: endCraftTut
  }, "Got it")))), !craftTut && /*#__PURE__*/React.createElement(window.TutStepMenu, {
    label: "Crafting",
    side: "right",
    inset: 12,
    zIndex: 30,
    steps: CRAFT_TUT.map(function (t) {
      return t.title;
    }),
    onPick: function onPick(n) {
      setCraftTutStep(n);
      setCraftTut(true);
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 200,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Material Stockpile"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, Object.entries(M).map(function (_ref89) {
    var _stock$key;
    var _ref90 = _slicedToArray(_ref89, 2),
      key = _ref90[0],
      m = _ref90[1];
    var cur = (_stock$key = stock[key]) !== null && _stock$key !== void 0 ? _stock$key : m.current;
    return /*#__PURE__*/React.createElement("div", {
      key: key,
      style: {
        padding: '7px 9px',
        background: 'var(--bg3)',
        border: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 7,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 13
      }
    }, m.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        color: 'var(--text)',
        flex: 1
      }
    }, m.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: m.color
      }
    }, cur, "/", m.max)), /*#__PURE__*/React.createElement(ProgressBar, {
      value: cur / m.max * 100,
      color: m.color,
      height: 4
    }));
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
  }, "RMAT Tiers"), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 8,
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, ZI.RMAT_TIERS.map(function (tier) {
    return /*#__PURE__*/React.createElement("div", {
      key: tier.tier,
      style: {
        padding: '6px 8px',
        background: 'var(--bg3)',
        borderLeft: "3px solid ".concat(tier.color),
        border: "1px solid ".concat(tier.color, "33")
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 3
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: tier.color,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        color: tier.color,
        flex: 1
      }
    }, "T", tier.tier, ": ", tier.name), /*#__PURE__*/React.createElement("span", {
      className: "tag",
      style: {
        color: tier.color,
        borderColor: tier.color,
        background: tier.color + '22',
        fontSize: 8
      }
    }, tier.rarity)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)'
      }
    }, tier.desc));
  })))), /*#__PURE__*/React.createElement("div", {
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
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Crafting Recipes"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, [['all', 'ALL'], ['rmat', 'RMAT'], ['gear', 'GEAR'], ['consumable', 'CONSUM']].map(function (_ref91) {
    var _ref92 = _slicedToArray(_ref91, 2),
      k = _ref92[0],
      label = _ref92[1];
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      onClick: function onClick() {
        return setKindFilter(k);
      },
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        padding: '2px 8px',
        cursor: 'pointer',
        border: "1px solid ".concat(kindFilter === k ? 'var(--amber)' : 'var(--border)'),
        background: kindFilter === k ? 'rgba(200,169,110,0.15)' : 'var(--bg4)',
        color: kindFilter === k ? 'var(--amber)' : 'var(--text3)'
      }
    }, label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4
    }
  }, [['all', 'ALL'], ['equip', '⚔'], ['enhance', '▲'], ['consume', '✚'], ['trade', '⧉'], ['faction', '⚑']].map(function (_ref93) {
    var _ref94 = _slicedToArray(_ref93, 2),
      k = _ref94[0],
      label = _ref94[1];
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      onClick: function onClick() {
        return setPurposeFilter(k);
      },
      title: k === 'all' ? 'All purposes' : ZI.PURPOSE_META[k] && ZI.PURPOSE_META[k].label,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        padding: '2px 7px',
        cursor: 'pointer',
        border: "1px solid ".concat(purposeFilter === k ? k === 'all' ? 'var(--amber)' : ZI.PURPOSE_META[k].color : 'var(--border)'),
        background: purposeFilter === k ? k === 'all' ? 'rgba(200,169,110,0.15)' : ZI.PURPOSE_META[k].color + '22' : 'var(--bg4)',
        color: purposeFilter === k ? k === 'all' ? 'var(--amber)' : ZI.PURPOSE_META[k].color : 'var(--text3)'
      }
    }, label);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 4,
      marginLeft: 'auto'
    }
  }, [null, 0, 1, 2, 3, 4, 5].map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t === null ? 'all' : t,
      onClick: function onClick() {
        return setTierFilter(t);
      },
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        padding: '2px 8px',
        cursor: 'pointer',
        border: "1px solid ".concat(tierFilter === t ? t === null ? 'var(--amber)' : tierColor(t) : 'var(--border)'),
        background: tierFilter === t ? t === null ? 'rgba(200,169,110,0.15)' : tierColor(t) + '22' : 'var(--bg4)',
        color: tierFilter === t ? t === null ? 'var(--amber)' : tierColor(t) : 'var(--text3)'
      }
    }, t === null ? 'ALL' : "T".concat(t));
  }))), /*#__PURE__*/React.createElement(CraftJobsStrip, null), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, filtered.map(function (r) {
    var ok = canCraft(r);
    var tc = tierColor(r.tier);
    return /*#__PURE__*/React.createElement("div", {
      key: r.id,
      onClick: function onClick() {
        return setSelId(selId === r.id ? null : r.id);
      },
      style: {
        padding: '10px 12px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        border: "1px solid ".concat(selId === r.id ? 'var(--amber)' : 'var(--border)'),
        borderLeft: "3px solid ".concat(tc),
        background: selId === r.id ? 'var(--bg4)' : 'var(--bg3)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, recipeIcon(r, 32), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        color: 'var(--text)',
        fontWeight: 500
      }
    }, r.name), /*#__PURE__*/React.createElement("span", {
      className: "tag",
      style: {
        color: tc,
        borderColor: tc,
        background: tc + '22'
      }
    }, "T", r.tier), (r.kind === 'gear' || r.kind === 'consumable') && /*#__PURE__*/React.createElement("span", {
      className: "tag",
      style: {
        color: '#7aa8f0',
        borderColor: '#7aa8f0',
        background: 'rgba(74,128,224,0.12)'
      }
    }, "\u2699 EQUIPS"), function () {
      var gi = r.grantsGear && ZI.getGearItem && ZI.getGearItem(r.grantsGear);
      var purposes = gi && gi.purpose || [];
      return purposes.map(function (p) {
        var pm = ZI.PURPOSE_META[p];
        if (!pm) return null;
        return /*#__PURE__*/React.createElement("span", {
          key: p,
          className: "tag",
          title: pm.label,
          style: {
            color: pm.color,
            borderColor: pm.color,
            background: pm.color + '22'
          }
        }, pm.icon, " ", pm.label);
      });
    }()), ok ? /*#__PURE__*/React.createElement("span", {
      className: "tag",
      style: {
        color: '#3dcf8e',
        borderColor: '#3dcf8e',
        background: 'rgba(61,207,142,0.12)'
      }
    }, "\u2713 Craftable") : /*#__PURE__*/React.createElement("span", {
      className: "tag",
      style: {
        color: '#f06a5a',
        borderColor: '#f06a5a',
        background: 'rgba(207,61,61,0.12)'
      }
    }, "\u2717 Missing")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        flexWrap: 'wrap',
        marginBottom: 6
      }
    }, Object.entries(r.cost).map(function (_ref95) {
      var _M$k3, _M$k4;
      var _ref96 = _slicedToArray(_ref95, 2),
        k = _ref96[0],
        q = _ref96[1];
      var have = (stock[k] || 0) >= q;
      return /*#__PURE__*/React.createElement("span", {
        key: k,
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          padding: '2px 7px',
          border: "1px solid ".concat(have ? 'var(--border)' : '#f06a5a'),
          color: have ? 'var(--text2)' : '#f06a5a',
          background: 'var(--bg)',
          display: 'flex',
          alignItems: 'center',
          gap: 3
        }
      }, (_M$k3 = M[k]) === null || _M$k3 === void 0 ? void 0 : _M$k3.icon, " ", q, " ", ((_M$k4 = M[k]) === null || _M$k4 === void 0 ? void 0 : _M$k4.name) || k);
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 12,
        alignItems: 'center',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: tc
      }
    }, "\u2192 ", r.out.map(function (o) {
      return "".concat(o.q, "\xD7 ").concat(o.n);
    }).join(', ')), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--amber)'
      }
    }, "\u23F1 ", fmtDur(r.time)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        marginLeft: 'auto'
      }
    }, "Unlock: ", r.unlock)));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 300,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flexShrink: 0
    }
  }, sel ? function () {
    var tc = tierColor(sel.tier);
    var ok = canCraft(sel);
    var rates = ZI.CRAFT_DROP_RATES && ZI.CRAFT_DROP_RATES[sel.enemy] || [0, 0, 0, 0, 0, 0];
    return /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-title"
    }, "Recipe Details"), /*#__PURE__*/React.createElement("div", {
      style: {
        flex: 1,
        overflow: 'auto',
        padding: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8
      }
    }, recipeIcon(sel, 56), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-title)',
        fontSize: 16,
        color: tc
      }
    }, sel.name), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 5,
        marginTop: 3
      }
    }, /*#__PURE__*/React.createElement("span", {
      className: "tag",
      style: {
        color: tc,
        borderColor: tc,
        background: tc + '22'
      }
    }, "T", sel.tier, " ", (ZI.RMAT_TIERS[sel.tier] || {}).name), /*#__PURE__*/React.createElement("span", {
      className: "tag",
      style: {
        color: 'var(--text2)',
        borderColor: 'var(--border)'
      }
    }, (ZI.RMAT_TIERS[sel.tier] || {}).rarity)))), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text2)',
        fontStyle: 'italic',
        borderLeft: "2px solid ".concat(tc),
        paddingLeft: 8,
        marginBottom: 10,
        lineHeight: 1.5
      }
    }, sel.lore), sel.grantsGear && window.ZI_CRAFTING_FRAMES.getRecords().some(function (r) {
      return r.id === sel.grantsGear;
    }) && /*#__PURE__*/React.createElement("a", {
      className: "btn btn-sm",
      style: {
        marginBottom: 10
      },
      href: window.ZI_CRAFTING_FRAMES.href(sel.grantsGear)
    }, "Proposed frame preview"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement(InfoRow, {
      label: "Output",
      value: sel.out.map(function (o) {
        return "".concat(o.q, "\xD7 ").concat(o.n);
      }).join(', '),
      color: tc
    }), /*#__PURE__*/React.createElement(InfoRow, {
      label: "Craft Time",
      value: "".concat(fmtDur(sel.time), " game \xB7 ").concat(fmtReal(craftRealSec(sel)), " real"),
      color: "var(--amber)"
    }), /*#__PURE__*/React.createElement(InfoRow, {
      label: "Drop Source",
      value: sel.enemy,
      color: "var(--red2)"
    }), /*#__PURE__*/React.createElement(InfoRow, {
      label: "Unlocked By",
      value: sel.unlock,
      color: "var(--text2)"
    })), /*#__PURE__*/React.createElement("div", {
      className: "divider"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        margin: '8px 0'
      }
    }, "REQUIRED MATERIALS"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        marginBottom: 12
      }
    }, Object.entries(sel.cost).map(function (_ref97) {
      var _M$k5, _M$k6;
      var _ref98 = _slicedToArray(_ref97, 2),
        k = _ref98[0],
        q = _ref98[1];
      var have = stock[k] || 0;
      var col = have >= q ? '#3dcf8e' : have > 0 ? '#e07a30' : '#f06a5a';
      return /*#__PURE__*/React.createElement("div", {
        key: k,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 8
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontSize: 12
        }
      }, (_M$k5 = M[k]) === null || _M$k5 === void 0 ? void 0 : _M$k5.icon), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text2)',
          flex: 1
        }
      }, ((_M$k6 = M[k]) === null || _M$k6 === void 0 ? void 0 : _M$k6.name) || k), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: col
        }
      }, have, "/", q));
    })), /*#__PURE__*/React.createElement("div", {
      className: "divider"
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        margin: '8px 0'
      }
    }, "RMAT DROP RATES \u2014 ", sel.enemy), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 3
      }
    }, ZI.RMAT_TIERS.map(function (tier, i) {
      return /*#__PURE__*/React.createElement("div", {
        key: tier.tier,
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: tier.color,
          width: 64
        }
      }, "T", tier.tier, " ", tier.name.split(' ')[0]), /*#__PURE__*/React.createElement("div", {
        style: {
          flex: 1
        }
      }, /*#__PURE__*/React.createElement(ProgressBar, {
        value: rates[i] || 0,
        max: 60,
        color: tier.color,
        height: 5
      })), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: tier.color,
          width: 30,
          textAlign: 'right'
        }
      }, rates[i] || 0, "%"));
    }))), /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 10,
        borderTop: '1px solid var(--border)'
      }
    }, /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return onCraftClick(sel);
      },
      disabled: !ok,
      style: {
        width: '100%',
        padding: '10px',
        cursor: ok ? 'pointer' : 'not-allowed',
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        letterSpacing: '0.06em',
        background: ok ? '#1a3020' : 'var(--bg4)',
        color: ok ? '#3dcf8e' : 'var(--text3)',
        border: "1px solid ".concat(ok ? '#3dcf8e' : 'var(--border)')
      }
    }, ok ? sel.tier === 5 ? '⚠ Begin Exotic Craft' : '⚙ Craft Now' : '✗ Materials Insufficient')));
  }() : /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 14,
      color: 'var(--text3)',
      marginBottom: 8
    }
  }, "Select a Recipe"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)'
    }
  }, "Choose a recipe to see materials, drop rates, and craft.")))), toast && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      top: 14,
      right: 14,
      zIndex: 50,
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: '#3dcf8e',
      background: '#10231a',
      border: '1px solid #3dcf8e',
      padding: '9px 14px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
      animation: 'fadeIn 0.2s ease'
    }
  }, toast), t5Confirm && /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setT5Confirm(null);
    },
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 60,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: function onClick(e) {
      return e.stopPropagation();
    },
    className: "panel",
    style: {
      width: 380,
      padding: 18,
      borderColor: tierColor(5)
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 28
    }
  }, t5Confirm.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 16,
      color: tierColor(5)
    }
  }, "Begin ", t5Confirm.name, "?")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text2)',
      lineHeight: 1.6,
      marginBottom: 14
    }
  }, "This Exotic craft takes ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--amber)'
    }
  }, fmtDur(t5Confirm.time)), " and cannot be queued. It must be confirmed manually."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      var r = t5Confirm;
      setT5Confirm(null);
      doCraft(r);
    },
    style: {
      flex: 1,
      padding: '9px',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      background: '#1a3020',
      color: '#3dcf8e',
      border: '1px solid #3dcf8e'
    }
  }, "Confirm"), /*#__PURE__*/React.createElement("button", {
    onClick: function onClick() {
      return setT5Confirm(null);
    },
    style: {
      flex: 1,
      padding: '9px',
      cursor: 'pointer',
      fontFamily: 'var(--font-body)',
      fontSize: 12,
      background: 'var(--bg4)',
      color: 'var(--text2)',
      border: '1px solid var(--border)'
    }
  }, "Cancel")))), t5Event && /*#__PURE__*/React.createElement("div", {
    onClick: function onClick() {
      return setT5Event(null);
    },
    style: {
      position: 'absolute',
      inset: 0,
      zIndex: 70,
      cursor: 'pointer',
      background: "radial-gradient(circle at center, ".concat(tierColor(5), "33, rgba(0,0,0,0.92))"),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: 'fadeIn 0.3s ease'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      maxWidth: 460,
      padding: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 72,
      marginBottom: 12
    }
  }, t5Event.icon), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 26,
      color: tierColor(5),
      marginBottom: 6,
      textShadow: "0 0 30px ".concat(tierColor(5))
    }
  }, t5Event.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: tierColor(5),
      letterSpacing: '0.2em',
      marginBottom: 16
    }
  }, "\u25C8 EXOTIC ECHO CRAFTED \u25C8"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--text2)',
      fontStyle: 'italic',
      lineHeight: 1.7,
      marginBottom: 18
    }
  }, t5Event.lore), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: tierColor(5)
    }
  }, t5Event.out.map(function (o) {
    return "".concat(o.q, "\xD7 ").concat(o.n);
  }).join('  ·  ')), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginTop: 20
    }
  }, "click to dismiss"))));
}

// ─── FACTIONS SCREEN ─────────────────────────────────────────────────────────
function FactionsScreen() {
  // Locked until the first Fort is resolved (quest turned in, or the guard killed).
  var unlocked = ZI.factionsUnlocked ? ZI.factionsUnlocked() : 'friendly';
  if (!unlocked) {
    var f = ZI.getFortPos && ZI.getFortPos(),
      q = ZI.getFallowQuest ? ZI.getFallowQuest() : {
        state: 'none'
      };
    return /*#__PURE__*/React.createElement("div", {
      className: "screen-enter",
      style: {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel",
      style: {
        maxWidth: 460,
        padding: 20,
        textAlign: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontSize: 34,
        marginBottom: 6
      }
    }, "\uD83D\uDD12"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-title)',
        fontSize: 20,
        color: 'var(--text)',
        marginBottom: 8
      }
    }, "No one knows your name yet"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 15,
        color: 'var(--text2)',
        lineHeight: 1.55
      }
    }, q.state === 'none' && /*#__PURE__*/React.createElement(React.Fragment, null, "Smoke rises from a palisade at ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: '#f0d060'
      }
    }, "\uD83C\uDFF0 ", f ? f.coord : 'the Fort'), " on the Traversal map. The people behind those pikes are the way in."), q.state === 'active' && /*#__PURE__*/React.createElement(React.Fragment, null, "The Hearthguard want ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: '#a2dca2'
      }
    }, "Fallow Ground"), " cleared: ", ZI.fallowProgress(), "/", ZI.fallowGoal(), " kills at ", q.cell.coord, "."), q.state === 'ready' && /*#__PURE__*/React.createElement(React.Fragment, null, "The field is clear. Return to the Fort at ", /*#__PURE__*/React.createElement("b", {
      style: {
        color: '#f0d060'
      }
    }, f && f.coord), " to turn in Fallow Ground."))));
  }
  // Live standings from the single reputation store (negative tiers included).
  var LIVE = ZI.liveFactions();
  var _useState115 = useState('ironmarch'),
    _useState116 = _slicedToArray(_useState115, 2),
    selectedFaction = _useState116[0],
    setSelectedFaction = _useState116[1];
  var faction = LIVE.find(function (f) {
    return f.id === selectedFaction;
  });
  var repRankIdx = ZI.REP_RANKS.indexOf(faction.rank);
  var repToNext = repRankIdx < ZI.REP_RANKS.length - 1 ? ZI.REP_THRESHOLDS[repRankIdx + 1] - faction.rep : 0;
  var repPct = repRankIdx < ZI.REP_RANKS.length - 1 ? (faction.rep - ZI.REP_THRESHOLDS[repRankIdx]) / (ZI.REP_THRESHOLDS[repRankIdx + 1] - ZI.REP_THRESHOLDS[repRankIdx]) * 100 : 100;
  var contracts = ZI.CONTRACTS.filter(function (c) {
    return c.faction === selectedFaction;
  });
  var _useState117 = useState(0),
    _useState118 = _slicedToArray(_useState117, 2),
    forceRerender = _useState118[1];
  var availableContracts = contracts.filter(function (c) {
    return ZI.contractState(c.id) === 'OFFERED';
  });
  var activeContractEntries = contracts.filter(function (c) {
    return ZI.contractState(c.id) === 'ACTIVE';
  });
  var completedContracts = contracts.filter(function (c) {
    return ZI.contractState(c.id) === 'COMPLETE';
  });
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
      width: 240,
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
  }, "Factions"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, LIVE.map(function (f) {
    var rIdx = ZI.REP_RANKS.indexOf(f.rank);
    var fRepPct = rIdx < ZI.REP_RANKS.length - 1 ? (f.rep - ZI.REP_THRESHOLDS[rIdx]) / (ZI.REP_THRESHOLDS[rIdx + 1] - ZI.REP_THRESHOLDS[rIdx]) * 100 : 100;
    return /*#__PURE__*/React.createElement("div", {
      key: f.id,
      onClick: function onClick() {
        return setSelectedFaction(f.id);
      },
      style: {
        padding: '8px 10px',
        cursor: 'pointer',
        transition: 'all 0.15s',
        border: "1px solid ".concat(selectedFaction === f.id ? f.color : 'var(--border)'),
        background: selectedFaction === f.id ? 'var(--bg4)' : 'var(--bg3)'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 7,
        height: 7,
        borderRadius: '50%',
        background: f.color,
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: selectedFaction === f.id ? f.color : 'var(--text)',
        fontWeight: 500,
        flex: 1
      }
    }, f.name)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        flex: 1
      }
    }, f.standing, f.id === 'lodge' ? ' · +60% prices' : ''), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: f.color
      }
    }, f.rep, " REP")), /*#__PURE__*/React.createElement(ProgressBar, {
      value: fRepPct,
      color: f.color,
      height: 3
    }));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      minWidth: 0,
      overflow: 'hidden'
    }
  }, faction && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: 14,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 48,
      height: 48,
      border: "2px solid ".concat(faction.color),
      background: 'var(--bg4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      fontFamily: 'var(--font-title)',
      fontSize: 22,
      color: faction.color
    }
  }, faction.name[0]), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 22,
      color: faction.color
    }
  }, faction.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 11,
      color: 'var(--text2)',
      letterSpacing: '0.1em',
      marginBottom: 8
    }
  }, faction.theme, " \xB7 ", faction.territory), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    color: faction.standingColor
  }, faction.standing), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text2)'
    }
  }, faction.rep, " / ", ZI.REP_THRESHOLDS[repRankIdx + 1] || 'MAX', " REP"), repRankIdx < ZI.REP_RANKS.length - 1 && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "(", repToNext, " to ", ZI.REP_RANKS[repRankIdx + 1], ")"))), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 4
    }
  }, "REP PROGRESS"), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 120
    }
  }, /*#__PURE__*/React.createElement(ProgressBar, {
    value: repPct,
    color: faction.color,
    height: 6
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 10,
      display: 'flex',
      gap: 6
    }
  }, faction.synergy.map(function (s) {
    var attr = ZI.SURVIVAL_ATTRS.find(function (a) {
      return a.key === s || a.key === s + '2';
    });
    return /*#__PURE__*/React.createElement(Tag, {
      key: s,
      color: faction.color
    }, (attr === null || attr === void 0 ? void 0 : attr.name) || s, " synergy");
  }))), /*#__PURE__*/React.createElement("div", {
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
      marginBottom: 6,
      letterSpacing: '0.12em'
    }
  }, "AVAILABLE SERVICES"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 5,
      flexWrap: 'wrap'
    }
  }, faction.services.map(function (s) {
    return /*#__PURE__*/React.createElement("button", {
      key: s,
      className: "btn btn-sm",
      style: {
        borderColor: "".concat(faction.color, "44"),
        color: 'var(--text2)'
      }
    }, s);
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
  }, "Contracts"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      letterSpacing: '0.1em',
      marginBottom: 5
    }
  }, "AVAILABLE CONTRACTS"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, availableContracts.length === 0 ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)',
      padding: 16,
      textAlign: 'center'
    }
  }, "No contracts available. Increase reputation to unlock contracts.") : availableContracts.map(function (contract) {
    return /*#__PURE__*/React.createElement(ContractCard, {
      key: contract.id,
      contract: contract,
      factionColor: faction.color,
      onChanged: function onChanged() {
        return forceRerender(function (n) {
          return n + 1;
        });
      }
    });
  }))), activeContractEntries.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--amber)',
      letterSpacing: '0.1em',
      marginBottom: 5
    }
  }, "ACTIVE CONTRACTS"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, activeContractEntries.map(function (contract) {
    return /*#__PURE__*/React.createElement(ContractCard, {
      key: contract.id,
      contract: contract,
      factionColor: faction.color,
      onChanged: function onChanged() {
        return forceRerender(function (n) {
          return n + 1;
        });
      }
    });
  }))), completedContracts.length > 0 && /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--green)',
      letterSpacing: '0.1em',
      marginBottom: 5
    }
  }, "COMPLETED"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, completedContracts.map(function (contract) {
    return /*#__PURE__*/React.createElement(ContractCard, {
      key: contract.id,
      contract: contract,
      factionColor: faction.color,
      onChanged: function onChanged() {
        return forceRerender(function (n) {
          return n + 1;
        });
      }
    });
  }))))))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 240,
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
  }, "Reputation Path"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, ZI.REP_RANKS.map(function (rank, idx) {
    var _faction$services;
    var isCurrent = faction && rank === faction.rank;
    var isPast = faction && ZI.REP_RANKS.indexOf(faction.rank) > idx;
    var isFuture = faction && ZI.REP_RANKS.indexOf(faction.rank) < idx;
    return /*#__PURE__*/React.createElement("div", {
      key: rank,
      style: {
        padding: '7px 10px',
        background: isCurrent ? 'var(--bg4)' : 'var(--bg3)',
        border: "1px solid ".concat(isCurrent ? (faction === null || faction === void 0 ? void 0 : faction.color) || 'var(--amber)' : isPast ? 'var(--border2)' : 'var(--border)'),
        opacity: isFuture ? 0.8 : 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 8,
        height: 8,
        borderRadius: '50%',
        flexShrink: 0,
        background: isPast ? 'var(--green)' : isCurrent ? (faction === null || faction === void 0 ? void 0 : faction.color) || 'var(--amber)' : 'var(--border2)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: isCurrent ? (faction === null || faction === void 0 ? void 0 : faction.color) || 'var(--amber)' : isPast ? 'var(--text2)' : 'var(--text3)'
      }
    }, rank), isCurrent && /*#__PURE__*/React.createElement(Tag, {
      color: (faction === null || faction === void 0 ? void 0 : faction.color) || 'var(--amber)'
    }, "Current")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        marginTop: 3
      }
    }, ZI.REP_THRESHOLDS[idx], " REP required"), isCurrent && /*#__PURE__*/React.createElement("div", {
      style: {
        marginTop: 4,
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text2)'
      }
    }, "Unlocks: ", (faction === null || faction === void 0 || (_faction$services = faction.services) === null || _faction$services === void 0 ? void 0 : _faction$services[Math.min(idx, faction.services.length - 1)]) || 'Services'));
  })))));
}
function ContractCard(_ref99) {
  var contract = _ref99.contract,
    factionColor = _ref99.factionColor,
    onChanged = _ref99.onChanged;
  var ZI = window.ZI;
  var _React$useState25 = React.useState(null),
    _React$useState26 = _slicedToArray(_React$useState25, 2),
    msg = _React$useState26[0],
    setMsg = _React$useState26[1];
  var state = ZI.contractState(contract.id);
  var tierColor = ZI.tierColor ? ZI.tierColor(contract.tier) : factionColor;
  var blockReason = state === 'OFFERED' ? ZI.contractBlockReason(contract) : null;
  var rewardStr = [contract.reward.rep ? "".concat(contract.reward.rep, " Rep") : null, contract.reward.materials ? Object.entries(contract.reward.materials).map(function (_ref100) {
    var _ref101 = _slicedToArray(_ref100, 2),
      k = _ref101[0],
      q = _ref101[1];
    return "".concat(q, " ").concat(k);
  }).join(', ') : null, contract.reward.rmat ? Object.entries(contract.reward.rmat).map(function (_ref102) {
    var _ref103 = _slicedToArray(_ref102, 2),
      k = _ref103[0],
      q = _ref103[1];
    return "RMAT ".concat(k, " \xD7").concat(q);
  }).join(', ') : null, contract.reward.gear ? (ZI.getGearItem(contract.reward.gear) || {}).name : null].filter(Boolean).join(' + ');
  var objectiveStr = Object.entries(contract.objective || {}).map(function (_ref104) {
    var _ref105 = _slicedToArray(_ref104, 2),
      k = _ref105[0],
      v = _ref105[1];
    return "".concat(k, ": ").concat(v);
  }).join(', ');
  var accept = function accept() {
    var r = ZI.acceptContract(contract.id);
    if (!r.ok) {
      setMsg("\u26A0 Cannot accept: ".concat(r.reason));
      return;
    }
    setMsg('✓ Contract accepted');
    onChanged && onChanged();
  };
  var complete = function complete() {
    var ok = ZI.completeContract(contract.id);
    setMsg(ok ? '✓ Contract turned in — reward granted' : '⚠ Cannot complete yet');
    onChanged && onChanged();
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 12px',
      background: 'var(--bg3)',
      border: "1px solid ".concat(state === 'ACTIVE' ? 'var(--amber)' : 'var(--border)'),
      transition: 'border-color 0.15s'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 5
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--text)',
      fontWeight: 500
    }
  }, contract.title), /*#__PURE__*/React.createElement(Tag, {
    color: tierColor
  }, contract.tier)), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text2)',
      marginBottom: 6
    }
  }, contract.type, " \xB7 ", objectiveStr), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    color: "var(--text2)"
  }, contract.type), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--green)'
    }
  }, rewardStr)), blockReason && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--red2)'
    }
  }, "\uD83D\uDD12 ", blockReason), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: 6,
      alignItems: 'center'
    }
  }, msg && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: msg[0] === '✓' ? 'var(--green)' : 'var(--red2)',
      marginRight: 'auto'
    }
  }, msg), state === 'OFFERED' && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm btn-green",
    disabled: !!blockReason,
    style: {
      opacity: blockReason ? 0.5 : 1,
      cursor: blockReason ? 'not-allowed' : 'pointer'
    },
    onClick: accept
  }, "Accept Contract"), state === 'ACTIVE' && /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm btn-amber",
    onClick: complete
  }, "Turn In"), state === 'COMPLETE' && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--green)'
    }
  }, "\u2713 Completed")));
}

// ─── MARKETPLACE SCREEN ───────────────────────────────────────────────────────
function MarketplaceScreen() {
  var _useState119 = useState('buy'),
    _useState120 = _slicedToArray(_useState119, 2),
    tab = _useState120[0],
    setTab = _useState120[1];
  var _useState121 = useState('All'),
    _useState122 = _slicedToArray(_useState121, 2),
    filter = _useState122[0],
    setFilter = _useState122[1];
  var _useState123 = useState([{
      id: 'a1',
      name: 'Sunder Pulse Axe',
      type: 'Legendary',
      tier: 4,
      current: 3200,
      bids: 12,
      timeLeft: '2h 14m',
      seller: 'IronDefender_77',
      color: 'var(--amber)'
    }, {
      id: 'a2',
      name: 'RMAT-4 Anomalous ×3',
      type: 'RMAT',
      tier: 4,
      current: 5400,
      bids: 8,
      timeLeft: '45m',
      seller: 'Concordance_Trader',
      color: 'var(--purple)'
    }, {
      id: 'a3',
      name: 'Blueprint: Anomaly Forge',
      type: 'Blueprint',
      tier: 5,
      current: 8900,
      bids: 21,
      timeLeft: '6h 30m',
      seller: 'ShadowBroker_K',
      color: 'var(--purple)'
    }, {
      id: 'a4',
      name: 'Temporal Plate (T5 Exotic)',
      type: 'Exotic',
      tier: 5,
      current: 14200,
      bids: 5,
      timeLeft: '1h 02m',
      seller: 'Dustwalker_Pro',
      color: 'var(--purple)'
    }]),
    _useState124 = _slicedToArray(_useState123, 1),
    auctionItems = _useState124[0];
  var types = ['All', 'RMAT', 'Weapon', 'Armor', 'Blueprint', 'Legendary', 'Consumable'];
  var filtered = filter === 'All' ? ZI.MARKET_ITEMS : ZI.MARKET_ITEMS.filter(function (i) {
    return i.type === filter;
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "screen-enter",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      padding: 8,
      height: '100%',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      alignItems: 'center',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 20,
      color: 'var(--amber)',
      letterSpacing: '0.08em'
    }
  }, "Global Marketplace"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)',
      padding: '4px 10px',
      background: 'var(--bg3)',
      border: '1px solid var(--border)'
    }
  }, "\uD83D\uDFE2 Live \xB7 ", 47 + Math.floor(Math.random() * 10), " players online"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--purple)',
      padding: '4px 10px',
      background: 'rgba(168,85,247,0.1)',
      border: '1px solid var(--purple)44'
    }
  }, "\u26A0 RMAT Storm: RMAT prices \u2191 40%")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      flex: 1,
      minHeight: 0,
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
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "tab-nav"
  }, [['buy', 'Buy'], ['sell', 'Sell'], ['auction', 'Live Auction'], ['history', 'My History']].map(function (_ref106) {
    var _ref107 = _slicedToArray(_ref106, 2),
      id = _ref107[0],
      label = _ref107[1];
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      className: "tab-btn ".concat(tab === id ? 'active' : ''),
      onClick: function onClick() {
        return setTab(id);
      }
    }, label);
  }))), tab === 'auction' ? /*#__PURE__*/React.createElement("div", {
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
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("span", null, "Live Auction House"), /*#__PURE__*/React.createElement("div", {
    className: "notif-dot"
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "Updates in real time")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, auctionItems.map(function (item) {
    return /*#__PURE__*/React.createElement("div", {
      key: item.id,
      style: {
        padding: '12px 14px',
        background: 'var(--bg3)',
        border: "1px solid ".concat(item.color, "44"),
        transition: 'border-color 0.15s',
        cursor: 'pointer'
      },
      onMouseEnter: function onMouseEnter(e) {
        return e.currentTarget.style.borderColor = item.color;
      },
      onMouseLeave: function onMouseLeave(e) {
        return e.currentTarget.style.borderColor = "".concat(item.color, "44");
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 16,
        color: item.color,
        fontWeight: 600
      }
    }, item.name), /*#__PURE__*/React.createElement(Tag, {
      color: item.color
    }, "T", item.tier), /*#__PURE__*/React.createElement(Tag, {
      color: "var(--text3)"
    }, item.type)), /*#__PURE__*/React.createElement("div", {
      style: {
        textAlign: 'right'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 18,
        color: 'var(--amber)',
        fontWeight: 'bold'
      }
    }, item.current.toLocaleString(), " \u20B5"), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)'
      }
    }, item.bids, " bids"))), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text3)'
      }
    }, "Seller: ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text2)'
      }
    }, item.seller)), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: parseInt(item.timeLeft) < 1 ? 'var(--red2)' : 'var(--amber)'
      }
    }, "\u23F1 ", item.timeLeft, " remaining"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm btn-amber"
    }, "Place Bid"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm"
    }, "Buy Now"))));
  }))) : tab === 'buy' ? /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 10px',
      background: 'var(--bg3)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      gap: 5,
      flexWrap: 'wrap'
    }
  }, types.map(function (t) {
    return /*#__PURE__*/React.createElement("button", {
      key: t,
      onClick: function onClick() {
        return setFilter(t);
      },
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        padding: '2px 7px',
        border: "1px solid ".concat(filter === t ? 'var(--amber)' : 'var(--border)'),
        background: filter === t ? 'rgba(200,169,110,0.12)' : 'var(--bg4)',
        color: filter === t ? 'var(--amber)' : 'var(--text3)',
        cursor: 'pointer'
      }
    }, t);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr auto auto auto auto auto',
      padding: '5px 12px',
      background: 'var(--bg3)',
      borderBottom: '1px solid var(--border)',
      gap: 12
    }
  }, ['Item', 'Type', 'Tier', 'Price', 'Supply', 'Demand'].map(function (h) {
    return /*#__PURE__*/React.createElement("span", {
      key: h,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)',
        letterSpacing: '0.08em'
      }
    }, h);
  })), filtered.map(function (item) {
    var _ZI$RMAT_TIERS$item$t;
    var supplyColor = item.supply > 60 ? 'var(--green2)' : item.supply > 30 ? 'var(--amber)' : 'var(--red2)';
    var demandColor = item.demand > 80 ? 'var(--red2)' : item.demand > 50 ? 'var(--amber)' : 'var(--green2)';
    return /*#__PURE__*/React.createElement("div", {
      key: item.id,
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto auto auto',
        padding: '8px 12px',
        borderBottom: '1px solid var(--border)',
        gap: 12,
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'background 0.1s'
      },
      onMouseEnter: function onMouseEnter(e) {
        return e.currentTarget.style.background = 'var(--bg4)';
      },
      onMouseLeave: function onMouseLeave(e) {
        return e.currentTarget.style.background = 'transparent';
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--text)'
      }
    }, item.name), /*#__PURE__*/React.createElement(Tag, {
      color: "var(--text3)"
    }, item.type), /*#__PURE__*/React.createElement(Tag, {
      color: ((_ZI$RMAT_TIERS$item$t = ZI.RMAT_TIERS[item.tier]) === null || _ZI$RMAT_TIERS$item$t === void 0 ? void 0 : _ZI$RMAT_TIERS$item$t.color) || 'var(--text2)'
    }, "T", item.tier), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 12,
        color: 'var(--amber)',
        textAlign: 'right'
      }
    }, item.basePrice, " \u20B5"), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: supplyColor,
        textAlign: 'right'
      }
    }, item.supply, "%"), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: demandColor
      }
    }, item.demand, "%"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm btn-amber",
      onClick: function onClick(e) {
        return e.stopPropagation();
      }
    }, "Buy")));
  }))) : /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)'
    }
  }, tab === 'sell' ? 'Drag items from inventory to list them.' : 'No trade history yet.'))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 240,
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
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
      marginBottom: 8,
      letterSpacing: '0.12em'
    }
  }, "MARKET EVENTS"), ZI.WORLD_EVENTS.map(function (e) {
    return /*#__PURE__*/React.createElement("div", {
      key: e.id,
      style: {
        padding: '6px 8px',
        marginBottom: 5,
        background: e.active ? "".concat(e.color, "18") : 'var(--bg3)',
        border: "1px solid ".concat(e.active ? e.color : 'var(--border)')
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        alignItems: 'center',
        marginBottom: 2
      }
    }, e.active && /*#__PURE__*/React.createElement("div", {
      className: "notif-dot"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: e.active ? e.color : 'var(--text2)'
      }
    }, e.name), /*#__PURE__*/React.createElement(Tag, {
      color: e.active ? e.color : 'var(--text3)'
    }, e.duration, "h")), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)',
        lineHeight: 1.5
      }
    }, e.effect));
  })), /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: 1,
      padding: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 8,
      letterSpacing: '0.12em'
    }
  }, "YOUR WALLET"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 32,
      color: 'var(--amber)',
      marginBottom: 4
    }
  }, "4,820 \u20B5"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)'
    }
  }, "Available credits"), /*#__PURE__*/React.createElement("div", {
    className: "divider"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Pending sales",
    value: "2 items",
    color: "var(--text2)"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Active bids",
    value: "1 bid",
    color: "var(--amber)"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Today's trades",
    value: "3 completed",
    color: "var(--green)"
  })))));
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
function App() {
  var _window = window,
    TweaksPanel = _window.TweaksPanel,
    useTweaks = _window.useTweaks;
  var TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "accentColor": "#ad8d52",
    "darkMode": true,
    "threatLevel": 5,
    "showAnimations": true,
    "resourceRates": true
  } /*EDITMODE-END*/;
  var _useTweaks = useTweaks(TWEAK_DEFAULTS),
    _useTweaks2 = _slicedToArray(_useTweaks, 2),
    tweaks = _useTweaks2[0],
    setTweak = _useTweaks2[1];

  // After loading/starting a save the page reloads so every system re-reads storage;
  // the boot flag drops the player straight back into their mode.
  var bootMode = ZI.consumeBootMode();
  // A brand-new game opens on the Traversal satellite map (where the tutorial starts).
  var freshStart = bootMode && localStorage.getItem('zi_fresh_start') === '1';
  var _useState125 = useState(bootMode ? freshStart ? 'traversal' : bootMode === 'camp' ? 'camp-main' : 'traversal' : 'mode-select'),
    _useState126 = _slicedToArray(_useState125, 2),
    screen = _useState126[0],
    setScreen = _useState126[1]; // TRAV-01a S6: a Solo reload opens on Traversal (was Routes)
  useEffect(function () {
    if (freshStart && screen !== 'traversal') localStorage.removeItem('zi_fresh_start');
  }, [screen]);
  var _useState127 = useState(bootMode || null),
    _useState128 = _slicedToArray(_useState127, 2),
    mode = _useState128[0],
    setMode = _useState128[1];
  var _useState129 = useState(null),
    _useState130 = _slicedToArray(_useState129, 2),
    activeRoute = _useState130[0],
    setActiveRoute = _useState130[1];
  // Planning context is temporary UI state. Inventory and route-run saves stay canonical.
  var _useState131 = useState(null),
    _useState132 = _slicedToArray(_useState131, 2),
    routePlan = _useState132[0],
    setRoutePlan = _useState132[1];
  var _useState133 = useState(false),
    _useState134 = _slicedToArray(_useState133, 2),
    preparingRoute = _useState134[0],
    setPreparingRoute = _useState134[1];
  var navigate = function navigate(next) {
    setPreparingRoute(false);
    if (window.ZI_CRAFTING_FRAMES.readRoute().active) window.location.hash = next === 'rmat-crafting' ? '#crafting' : '';
    setScreen(next);
  };
  useEffect(function () {
    var openCraftingFrame = function openCraftingFrame() {
      if (window.ZI_CRAFTING_FRAMES.readRoute().active) {
        setPreparingRoute(false);
        setScreen('rmat-crafting');
      }
    };
    openCraftingFrame();
    window.addEventListener('hashchange', openCraftingFrame);
    return function () {
      return window.removeEventListener('hashchange', openCraftingFrame);
    };
  }, []);
  var openRouteGear = function openRouteGear(plan) {
    setRoutePlan(plan);
    setPreparingRoute(true);
    setScreen('stockpile');
  };
  var _useState135 = useState({
      Food: {
        current: 320,
        max: 500,
        rate: 12
      },
      Scrap: {
        current: 1840,
        max: 3000,
        rate: 8
      },
      Ammo: {
        current: 1240,
        max: 2000,
        rate: 0
      },
      Medicine: {
        current: 84,
        max: 200,
        rate: 3
      },
      Fuel: {
        current: 210,
        max: 400,
        rate: 0
      },
      RMAT: {
        current: 19,
        max: 100,
        rate: 0
      }
    }),
    _useState136 = _slicedToArray(_useState135, 2),
    resources = _useState136[0],
    setResources = _useState136[1];

  // Idle tick
  useEffect(function () {
    if (!mode || !tweaks.resourceRates) return;
    var t = setInterval(function () {
      setResources(function (prev) {
        var next = _objectSpread({}, prev);
        Object.keys(next).forEach(function (k) {
          if (next[k].rate > 0) {
            next[k] = _objectSpread(_objectSpread({}, next[k]), {}, {
              current: Math.min(next[k].current + next[k].rate / 60, next[k].max)
            });
          }
        });
        return next;
      });
    }, 1000);
    return function () {
      return clearInterval(t);
    };
  }, [mode, tweaks.resourceRates]);
  var worldEvent = ZI.WORLD_EVENTS.find(function (e) {
    return e.active;
  });
  var handleModeSelect = function handleModeSelect(m) {
    setMode(m);
    setScreen('save-files');
  };
  var renderScreen = function renderScreen() {
    switch (screen) {
      case 'mode-select':
        return /*#__PURE__*/React.createElement(ModeSelectScreen, {
          onSelect: handleModeSelect
        });
      case 'save-files':
        return /*#__PURE__*/React.createElement(SaveFilesScreen, {
          mode: mode,
          onBack: function onBack() {
            ZI.clearResume();
            setScreen('mode-select');
          }
        });
      case 'camp-main':
        return /*#__PURE__*/React.createElement(CampMainScreen, {
          resources: resources,
          setResources: setResources,
          threatLevel: tweaks.threatLevel
        });
      case 'solo-main':
        return /*#__PURE__*/React.createElement(SoloMainScreen, {
          setScreen: navigate,
          setActiveRoute: setActiveRoute,
          threatLevel: tweaks.threatLevel,
          mode: mode,
          initialPlan: mode === 'camp' ? null : routePlan,
          onManageGear: openRouteGear
        });
      case 'solo-loading':
        return ZI.hasWorkingVehicle() ? /*#__PURE__*/React.createElement(LootLoadingScreen, {
          route: activeRoute,
          onComplete: function onComplete() {
            return setScreen('traversal');
          }
        }) : /*#__PURE__*/React.createElement(SatelliteTraversalScreen, {
          setScreen: setScreen,
          setActiveRoute: setActiveRoute
        });
      // Oct 29: the Schedule tab shows the Operations page (reference/operations-schedule-proposal.md); the old mock
      // timeline (ScheduleScreenV2) stays in screens-v2b.jsx for rollback.
      case 'camp-schedule':
        return window.OperationsScreen ? /*#__PURE__*/React.createElement(OperationsScreen, {
          mode: "camp",
          setScreen: navigate
        }) : /*#__PURE__*/React.createElement(ScheduleScreenV2, {
          mode: "camp"
        });
      case 'solo-schedule':
        return window.OperationsScreen ? /*#__PURE__*/React.createElement(OperationsScreen, {
          mode: "solo",
          setScreen: navigate
        }) : /*#__PURE__*/React.createElement(ScheduleScreenV2, {
          mode: "solo"
        });
      case 'rmat-crafting':
        return /*#__PURE__*/React.createElement(RmatCraftingScreen, null);
      case 'stockpile':
        return /*#__PURE__*/React.createElement(StockpileScreen, {
          initialTab: preparingRoute ? 'loadout' : 'recycler',
          onNavigate: navigate,
          preparationPanel: preparingRoute && routePlan ? /*#__PURE__*/React.createElement(RouteLoadoutPreparation, {
            route: ZI.ROUTES.find(function (r) {
              return r.id === routePlan.routeId;
            }),
            threatLevel: tweaks.threatLevel,
            onReturnToRoute: function onReturnToRoute() {
              return navigate('solo-main');
            }
          }) : null
        });
      case 'factions':
        return /*#__PURE__*/React.createElement(FactionsScreen, null);
      case 'marketplace':
        return /*#__PURE__*/React.createElement(MarketParent, null);
      case 'stat-leveling':
        return /*#__PURE__*/React.createElement(StatLevelingScreen, null);
      case 'traversal':
        return /*#__PURE__*/React.createElement(SatelliteTraversalScreen, {
          setScreen: setScreen,
          setActiveRoute: setActiveRoute
        });
      case 'hack-slash':
        return /*#__PURE__*/React.createElement(WanderingScreen, {
          route: activeRoute || ZI.ROUTES[1],
          setScreen: setScreen
        });
      case 'codex':
        return /*#__PURE__*/React.createElement(ZombieCodexScreen, null);
      default:
        return /*#__PURE__*/React.createElement(ModeSelectScreen, {
          onSelect: handleModeSelect
        });
    }
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, screen !== 'mode-select' && screen !== 'save-files' && /*#__PURE__*/React.createElement(TopBar, {
    mode: mode,
    screen: screen,
    setScreen: navigate,
    threatLevel: tweaks.threatLevel,
    worldEvent: worldEvent
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'hidden',
      position: 'relative'
    }
  }, renderScreen()), TweaksPanel && /*#__PURE__*/React.createElement(TweaksPanel, null, /*#__PURE__*/React.createElement(TweakColor, {
    label: "Accent Color",
    value: tweaks.accentColor,
    onChange: function onChange(v) {
      return setTweak('accentColor', v);
    }
  }), /*#__PURE__*/React.createElement(TweakSlider, {
    label: "Threat Level",
    min: 1,
    max: 5,
    step: 1,
    value: tweaks.threatLevel,
    onChange: function onChange(v) {
      return setTweak('threatLevel', v);
    }
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Live Resource Ticks",
    value: tweaks.resourceRates,
    onChange: function onChange(v) {
      return setTweak('resourceRates', v);
    }
  }), /*#__PURE__*/React.createElement(TweakToggle, {
    label: "Animations",
    value: tweaks.showAnimations,
    onChange: function onChange(v) {
      return setTweak('showAnimations', v);
    }
  })));
}
var root = ReactDOM.createRoot(document.getElementById('root'));
root.render(/*#__PURE__*/React.createElement(App, null));