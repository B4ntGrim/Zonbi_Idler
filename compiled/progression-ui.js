"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// progression-ui.jsx — STAT-02 Survivor panel (Stats screen): level, upgrade picks, condition words, Eat, away summary.
// UI rule: show names and rounded values only. Never show ranks, the curve dial, pity weights or modifier formulas.
function SurvivorProgressPanel() {
  var ZI = window.ZI,
    P = ZI && ZI.PROG,
    L = P && P.LIVE;
  var _React$useState = React.useState(0),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    bump = _React$useState2[1];
  var _React$useState3 = React.useState(null),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    note = _React$useState4[0],
    setNote = _React$useState4[1];
  React.useEffect(function () {
    if (!L) return;
    var off = L.onChange(function () {
      return bump(function (n) {
        return n + 1;
      });
    });
    var off2 = ZI.onInventoryChange ? ZI.onInventoryChange(function () {
      return bump(function (n) {
        return n + 1;
      });
    }) : null;
    var t = setInterval(function () {
      return bump(function (n) {
        return n + 1;
      });
    }, 5000);
    return function () {
      off();
      if (typeof off2 === 'function') off2();
      clearInterval(t);
    };
  }, []);
  if (!L) return null;
  var level = ZI.getCharacterLevel(),
    xp = ZI.getCharacterXp();
  var from = P.xpForLevel(level),
    to = level >= 100 ? from : P.xpForLevel(level + 1);
  var pct = level >= 100 ? 100 : Math.max(0, Math.min(100, (xp - from) / Math.max(1, to - from) * 100));
  var st = L.getState(),
    offer = st.pending > 0 ? L.currentOffer() : null;
  var labels = L.labels(),
    status = L.getStatus(),
    idx = L.statusIndex();
  var food = L.foodList().length,
    autoEat = L.autoEatOwned();
  var tone = function tone(track) {
    var tier = P.STATUS[track].tiers[idx[track]];
    return tier.pol > 0 ? 'var(--green)' : tier.pol === 0 ? 'var(--text2)' : idx[track] >= P.STATUS[track].tiers.length - 1 ? 'var(--red2)' : 'var(--amber)';
  };
  var mono = {
    fontFamily: 'var(--font-mono)',
    fontSize: 11
  };
  var btn = _objectSpread(_objectSpread({}, mono), {}, {
    padding: '6px 10px',
    background: 'var(--bg4)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
    cursor: 'pointer'
  });
  var pick = function pick(key) {
    var r = L.choose(key);
    setNote(r.ok ? r.card : r.reason);
    bump(function (n) {
      return n + 1;
    });
  };
  var eat = function eat() {
    var r = L.eat();
    setNote(r.ok ? "Ate ".concat(r.name, ".") : r.reason);
    bump(function (n) {
      return n + 1;
    });
  };
  var nap = function nap() {
    var r = L.nap();
    setNote(r.ok ? 'Took a nap.' : r.reason);
    bump(function (n) {
      return n + 1;
    });
  };
  var dismissAway = function dismissAway() {
    var s = L.getStatus();
    s.lastAway = null;
    L.saveStatus(s);
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      flex: '1 1 100%',
      display: 'flex',
      flexDirection: 'column'
    },
    "data-testid": "survivor-progress"
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title",
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Survivor"), /*#__PURE__*/React.createElement("span", {
    style: _objectSpread(_objectSpread({}, mono), {}, {
      color: 'var(--amber)'
    })
  }, "Level ", level)), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, status.lastAway && /*#__PURE__*/React.createElement("div", {
    style: _objectSpread(_objectSpread({}, mono), {}, {
      color: 'var(--text)',
      background: 'var(--bg3)',
      border: '1px solid var(--border)',
      padding: '7px 10px',
      display: 'flex',
      justifyContent: 'space-between',
      gap: 8
    })
  }, /*#__PURE__*/React.createElement("span", null, "While you were away: ", status.lastAway.text, "."), /*#__PURE__*/React.createElement("button", {
    style: _objectSpread(_objectSpread({}, btn), {}, {
      padding: '2px 8px'
    }),
    onClick: dismissAway,
    "aria-label": "Dismiss away summary"
  }, "OK")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      height: 6,
      background: 'var(--bg4)',
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct + '%',
      height: '100%',
      background: 'var(--amber)'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: _objectSpread(_objectSpread({}, mono), {}, {
      color: 'var(--text3)',
      marginTop: 4
    })
  }, level >= 100 ? 'Max level' : "".concat(Math.max(0, to - xp).toLocaleString(), " XP to level ").concat(level + 1))), offer && /*#__PURE__*/React.createElement("div", {
    style: {
      border: '1px solid var(--amber)',
      padding: 8,
      background: 'var(--bg3)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: _objectSpread(_objectSpread({}, mono), {}, {
      color: 'var(--amber)',
      marginBottom: 6
    })
  }, "Choose an upgrade", st.pending > 1 ? " \xB7 ".concat(st.pending, " waiting") : ''), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, offer.map(function (k) {
    return /*#__PURE__*/React.createElement("button", {
      key: k,
      style: _objectSpread(_objectSpread({}, btn), {}, {
        flex: '1 1 140px',
        textAlign: 'left'
      }),
      onClick: function onClick() {
        return pick(k);
      }
    }, L.cardText(k, L.rank(k)));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 6
    }
  }, P.STATUS_KEYS.map(function (t) {
    return /*#__PURE__*/React.createElement("div", {
      key: t,
      style: _objectSpread(_objectSpread({}, mono), {}, {
        padding: '4px 8px',
        border: '1px solid var(--border)',
        background: 'var(--bg3)'
      }),
      title: P.STATUS[t].label
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text3)'
      }
    }, P.STATUS[t].label, ": "), /*#__PURE__*/React.createElement("span", {
      style: {
        color: tone(t)
      }
    }, labels[t]));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    style: btn,
    onClick: eat,
    disabled: !food
  }, "Eat (", food, " in camp)"), /*#__PURE__*/React.createElement("button", {
    style: btn,
    onClick: nap,
    disabled: !L.canNap(),
    title: L.canNap() ? 'Rest for a short while' : 'Nap at your base or camp'
  }, "Nap"), /*#__PURE__*/React.createElement("span", {
    style: _objectSpread(_objectSpread({}, mono), {}, {
      color: 'var(--text3)'
    })
  }, autoEat ? 'Auto-Eat is on.' : 'Auto-Eat: buy it in the Shop.'), note && /*#__PURE__*/React.createElement("span", {
    style: _objectSpread(_objectSpread({}, mono), {}, {
      color: 'var(--text2)'
    })
  }, note)), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
      gap: 4
    }
  }, P.visibleStats().map(function (s) {
    return /*#__PURE__*/React.createElement("div", {
      key: s.key,
      style: _objectSpread(_objectSpread({}, mono), {}, {
        display: 'flex',
        justifyContent: 'space-between',
        padding: '3px 6px',
        background: 'var(--bg3)',
        border: '1px solid var(--border)'
      })
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text2)'
      }
    }, s.name), /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--text)'
      }
    }, L.display(s.key)));
  }))));
}
Object.assign(window, {
  SurvivorProgressPanel: SurvivorProgressPanel
});