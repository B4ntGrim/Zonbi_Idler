"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// character-creation.jsx — the four-step survivor creation shown when a New Game is started (Sam, Oct 29).
// Source: Google Doc "Zed Idler — Character Creation Instructions (Draft)", Oct 28. Data and rules: game/character.js.
// Steps: Choose Your Survivor · Make Your Mark · What Were You Before? · One More Survivor ("Start Surviving").
// Nothing is created until the player confirms; Back keeps every other choice.
function CharacterCreationScreen(_ref) {
  var mode = _ref.mode,
    slot = _ref.slot,
    onCancel = _ref.onCancel,
    onConfirm = _ref.onConfirm;
  var ZI = window.ZI,
    C = ZI.CHAR_CREATION;
  var professions = React.useMemo(function () {
    return ZI.charProfessions();
  }, []);
  var _React$useState = React.useState(0),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    step = _React$useState2[0],
    setStep = _React$useState2[1];
  var _React$useState3 = React.useState(null),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    gender = _React$useState4[0],
    setGender = _React$useState4[1];
  var _React$useState5 = React.useState(function () {
      return ZI.charDefaultAppearance();
    }),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    appearance = _React$useState6[0],
    setAppearance = _React$useState6[1];
  var _React$useState7 = React.useState(null),
    _React$useState8 = _slicedToArray(_React$useState7, 2),
    profession = _React$useState8[0],
    setProfession = _React$useState8[1];
  var accent = mode === 'camp' ? 'var(--green)' : 'var(--amber)';
  var steps = [{
    title: 'Choose Your Survivor',
    tag: 'Who will survive?',
    line: 'Every survivor has a story. Yours starts here.'
  }, {
    title: 'Make Your Mark',
    line: "The wasteland doesn't care how you look. The survivors might."
  }, {
    title: 'What Were You Before?',
    line: "The old world taught you something. Let's hope it was useful."
  }, {
    title: 'One More Survivor',
    line: "The world ended. Your story didn't."
  }];
  var canNext = step === 0 ? !!gender : step === 2 ? !!profession : true;
  var g = C.genders.find(function (x) {
    return x.id === gender;
  });
  var clothing = C.appearance.clothingColor.options.find(function (o) {
    return o.id === appearance.clothingColor;
  });
  var prof = professions.find(function (p) {
    return p.id === profession;
  });
  var optLabel = function optLabel(k) {
    var o = C.appearance[k].options.find(function (x) {
      return x.id === appearance[k];
    });
    return o ? o.label : '—';
  };
  var Portrait = function Portrait(_ref2) {
    var gid = _ref2.gid,
      size = _ref2.size;
    var gg = C.genders.find(function (x) {
      return x.id === gid;
    });
    if (!gg) return /*#__PURE__*/React.createElement("div", {
      style: {
        width: size,
        height: size,
        border: '1px dashed var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--text3)',
        fontFamily: 'var(--font-mono)',
        fontSize: 11
      }
    }, "?");
    return /*#__PURE__*/React.createElement("div", {
      role: "img",
      "aria-label": gg.label + ' survivor',
      style: {
        width: size,
        height: size,
        backgroundImage: "url(\"".concat(gg.art.src, "\")"),
        backgroundSize: gg.art.size,
        backgroundPosition: '0% 0%',
        backgroundRepeat: 'no-repeat',
        imageRendering: 'pixelated',
        filter: gid === gender && clothing ? clothing.filter : 'none'
      }
    });
  };
  var chip = function chip(txt) {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text2)',
        border: '1px solid var(--border)',
        padding: '2px 6px'
      }
    }, txt);
  };
  var card = function card(active, onClick, children, key) {
    return /*#__PURE__*/React.createElement("button", {
      key: key,
      onClick: onClick,
      className: "btn",
      "aria-pressed": active,
      style: {
        textAlign: 'left',
        padding: 12,
        textTransform: 'none',
        letterSpacing: 'normal',
        borderColor: active ? accent : 'var(--border)',
        borderWidth: active ? 2 : 1,
        background: active ? 'rgba(230,196,126,0.10)' : undefined,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        minWidth: 0
      }
    }, children);
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      height: '100%',
      overflow: 'auto',
      padding: '28px 20px 60px',
      display: 'flex',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: '100%',
      maxWidth: 820
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      marginBottom: 14,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: accent,
      letterSpacing: '0.2em'
    }
  }, mode === 'camp' ? 'CAMP LEADER' : 'SOLO SURVIVOR', " \xB7 FILE ", slot, " \xB7 NEW SURVIVOR"), /*#__PURE__*/React.createElement("span", {
    style: {
      marginLeft: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)'
    }
  }, "Step ", step + 1, " of 4")), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 30,
      color: 'var(--text)'
    }
  }, steps[step].title), steps[step].tag && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 18,
      color: accent,
      marginTop: 4
    }
  }, steps[step].tag), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--text2)',
      margin: '6px 0 20px'
    }
  }, steps[step].line), step === 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: 12
    }
  }, C.genders.map(function (x) {
    return card(gender === x.id, function () {
      return setGender(x.id);
    }, /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'center'
      }
    }, /*#__PURE__*/React.createElement(Portrait, {
      gid: x.id,
      size: 180
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-title)',
        fontSize: 18,
        color: 'var(--text)',
        textAlign: 'center'
      }
    }, x.label)), x.id);
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1',
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)'
    }
  }, "Your choice changes the art only. Men and women survive on the same terms.")), step === 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto',
      position: 'sticky',
      top: 12,
      alignSelf: 'flex-start'
    }
  }, /*#__PURE__*/React.createElement(Portrait, {
    gid: gender,
    size: 200
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 320px',
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      minWidth: 0
    }
  }, Object.entries(C.appearance).map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
      k = _ref4[0],
      cat = _ref4[1];
    return /*#__PURE__*/React.createElement("div", {
      key: k
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text2)',
        letterSpacing: '0.12em',
        marginBottom: 6
      }
    }, cat.label.toUpperCase(), !cat.preview && /*#__PURE__*/React.createElement("span", {
      style: {
        letterSpacing: 'normal',
        color: 'var(--text3)',
        fontSize: 10
      }
    }, " \xB7 saved, art coming")), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap'
      }
    }, cat.options.map(function (o) {
      return /*#__PURE__*/React.createElement("button", {
        key: o.id,
        className: appearance[k] === o.id ? 'btn btn-amber' : 'btn',
        "aria-pressed": appearance[k] === o.id,
        onClick: function onClick() {
          return setAppearance(function (a) {
            return Object.assign({}, a, _defineProperty({}, k, o.id));
          });
        },
        style: {
          textTransform: 'none',
          letterSpacing: 'normal',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6
        }
      }, o.swatch && /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true",
        style: {
          width: 12,
          height: 12,
          background: o.swatch,
          border: '1px solid var(--border)',
          display: 'inline-block'
        }
      }), o.label);
    })));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)'
    }
  }, "Looks only: no appearance choice changes your stats. The portrait shows the clothing colour; the other choices are saved with your survivor and appear once their art is drawn."))), step === 2 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: 12
    }
  }, professions.map(function (p) {
    return card(profession === p.id, function () {
      return setProfession(p.id);
    }, /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 20
      }
    }, p.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-title)',
        fontSize: 18,
        color: 'var(--text)'
      }
    }, p.title)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--text2)'
      }
    }, p.blurb), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: 'var(--text3)',
        fontStyle: 'italic'
      }
    }, "\"", p.flavor, "\""), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        flexWrap: 'wrap'
      }
    }, p.effects.map(function (e) {
      return /*#__PURE__*/React.createElement("span", {
        key: e.prof,
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: accent,
          border: "1px solid ".concat(accent),
          padding: '2px 6px'
        }
      }, "+", e.xp, " ", e.name, " XP");
    }))), p.id);
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: '1 / -1',
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)'
    }
  }, "Profession effects are starting Profession XP. They are separate from appearance, which has no effects.")), step === 3 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 18,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '0 0 auto'
    }
  }, /*#__PURE__*/React.createElement(Portrait, {
    gid: gender,
    size: 220
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: '1 1 320px',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)'
    }
  }, "SURVIVOR "), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 18
    }
  }, g ? g.label : '—'), " ", /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: function onClick() {
      return setStep(0);
    }
  }, "Change")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)'
    }
  }, "LOOK "), Object.keys(C.appearance).map(function (k) {
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: k
    }, chip(C.appearance[k].label + ': ' + optLabel(k)));
  }), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: function onClick() {
      return setStep(1);
    }
  }, "Change")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)'
    }
  }, "BEFORE "), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 18
    }
  }, prof ? prof.icon + ' ' + prof.title : '—'), " ", /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: function onClick() {
      return setStep(2);
    }
  }, "Change")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)'
    }
  }, "STARTS WITH "), prof ? prof.effects.map(function (e) {
    return /*#__PURE__*/React.createElement(React.Fragment, {
      key: e.prof
    }, chip('+' + e.xp + ' ' + e.name + ' XP'));
  }) : chip('—')))), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8,
      marginTop: 24,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    onClick: function onClick() {
      return step === 0 ? onCancel() : setStep(step - 1);
    }
  }, step === 0 ? '← Save files' : '← Back'), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), step < 3 ? /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    disabled: !canNext,
    onClick: function onClick() {
      return canNext && setStep(step + 1);
    }
  }, "Continue \u2192") : /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    disabled: !gender || !profession,
    onClick: function onClick() {
      return onConfirm({
        gender: gender,
        appearance: appearance,
        profession: profession,
        createdAt: Date.now()
      });
    }
  }, "Start Surviving"))));
}
Object.assign(window, {
  CharacterCreationScreen: CharacterCreationScreen
});