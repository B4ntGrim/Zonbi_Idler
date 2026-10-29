"use strict";

function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
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
// Proposed card previews embedded inside Crafting, with source-linked reference data.
(function () {
  var W = window.ZI_CRAFTING_FRAMES;
  var rarityNames = {
    common: 'Common',
    uncommon: 'Uncommon',
    rare: 'Rare',
    epic: 'Epic',
    legendary: 'Legendary',
    exotic: 'Exotic',
    unique: 'Unique',
    relic: 'Relic Legendary'
  };
  var rosters = [['all', 'All rosters'], ['launch', 'Launch axes'], ['live', 'In game'], ['axes', '100 axe designs'], ['uniques', 'Uniques'], ['sets', 'Sets'], ['ranged', 'Ranged concepts'], ['workshop', 'Workshop'], ['relics', 'Relics'], ['legacy', 'Legacy prototype']];
  var slotName = function slotName(s) {
    return {
      primary: 'Primary',
      secondary: 'Sidearm',
      melee: 'Melee',
      throwable: 'Throwable',
      offhand: 'Off-hand (proposed)'
    }[s] || W.MISSING;
  };
  var themeFor = function themeFor(r) {
    return r.art === 'flame' ? 'hazard' : ['pistol', 'revolver', 'flare', 'smg'].includes(r.art) ? 'bronze' : ['crossbow', 'bow', 'axe', 'shield'].includes(r.art) && r.rarity !== 'unique' ? 'leather' : 'copper';
  };
  var isMissing = function isMissing(v) {
    return v == null || v === '' || v === W.MISSING;
  };

  // Integer-grid silhouettes stay crisp at every card size; no text is baked into art.
  // Team sprite art keeps a hint of real-world size but stays readable (Sam, Oct 27): the picture fills 75% of the
  // box for the smallest items (knives, pistols) up to 100% for 110 cm and longer (rifles, flamethrower rig).
  var spriteFill = function spriteFill(cm) {
    return Math.round(75 + 25 * Math.max(0, Math.min(1, (cm - 15) / 95)));
  };
  function WeaponArt(_ref) {
    var r = _ref.record,
      _ref$compact = _ref.compact,
      compact = _ref$compact === void 0 ? false : _ref$compact;
    if (r.sprite) return /*#__PURE__*/React.createElement("span", {
      className: 'wc-art wc-art-sprite' + (compact ? ' wc-art-small' : ''),
      "aria-hidden": "true"
    }, /*#__PURE__*/React.createElement("img", {
      src: r.sprite.src,
      alt: "",
      draggable: false,
      style: compact ? undefined : r.sprite.w / r.sprite.h < 1.2 ? {
        height: spriteFill(r.sprite.cm) + '%',
        width: 'auto'
      } : {
        width: spriteFill(r.sprite.cm) + '%'
      }
    }));
    var electric = /shock|arc|void|night-current/.test(r.id);
    var metal = r.section === 'C1' ? '#a3aaa0' : r.section === 'C2' || r.id === 'unique-raquelle' ? '#b78654' : '#a3b0ad';
    var light = electric ? '#77e4e5' : '#e6c895';
    var twoBlade = /double|twin|paired wings/i.test((r.description || '') + ' ' + (r.subfamily || ''));
    var axeHead = r.id === 'unique-danielle' || r.id === 'AXE-152' ? 'M47 13L65 11 72 16 68 30 57 32 54 26 47 25z' : r.id === 'unique-raquelle' || r.id === 'AXE-153' ? 'M47 15L64 8 76 12 82 23 77 40 63 35 56 28 47 27z' : r.id === 'AXE-251' || r.id === 'AXE-258' ? 'M47 14L61 9 69 12 66 20 76 25 72 35 60 29 47 25z' : r.section === 'C1' ? 'M42 13L61 10 72 21 64 34 44 29z' : 'M47 13L68 10 78 16 75 35 58 30 47 27z';
    var t = r.art;
    return /*#__PURE__*/React.createElement("svg", {
      className: 'wc-art' + (compact ? ' wc-art-small' : ''),
      viewBox: "0 0 96 80",
      shapeRendering: "crispEdges",
      "aria-hidden": "true",
      focusable: "false"
    }, /*#__PURE__*/React.createElement("ellipse", {
      cx: "48",
      cy: "70",
      rx: "33",
      ry: "3",
      fill: "#050808",
      opacity: ".6"
    }), /*#__PURE__*/React.createElement("g", {
      stroke: "#080b0c",
      strokeWidth: "2",
      strokeLinejoin: "miter"
    }, t === 'axe' && /*#__PURE__*/React.createElement("g", {
      transform: "rotate(28 48 40)"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M44 13h7v57h-7z",
      fill: "#66513c"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M45 48h5v17h-5z",
      fill: "#302e29"
    }), /*#__PURE__*/React.createElement("path", {
      d: axeHead,
      fill: metal
    }), /*#__PURE__*/React.createElement("path", {
      d: "M61 15h3v8h-3z",
      fill: "#d1d5bb",
      stroke: "none"
    }), twoBlade && /*#__PURE__*/React.createElement("path", {
      d: "M46 13L28 10 18 16 21 35 38 30 47 27z",
      fill: metal
    }), /*#__PURE__*/React.createElement("path", {
      d: "M44 17h8v7h-8z",
      fill: "#544a38"
    }), r.rarity === 'unique' && /*#__PURE__*/React.createElement("path", {
      d: "M58 19h9v4h-9z",
      fill: "#e4bb63",
      stroke: "none"
    })), t === 'set' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M29 17l19 23-19 23L10 40z",
      fill: "#8b9c77"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M67 17l19 23-19 23L48 40z",
      fill: "#b79d66"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M29 28l10 12-10 12-10-12zM67 28l10 12-10 12-10-12z",
      fill: "#1b261b"
    })), (t === 'rifle' || t === 'support' || t === 'shotgun' || t === 'smg') && /*#__PURE__*/React.createElement("g", {
      transform: "rotate(-18 48 40)"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M8 31h19v15H17l-9 9z",
      fill: "#68513c"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M27 29h35v16H27z",
      fill: "#5a6867"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M60 33h25v7H60zM83 31h7v11h-7z",
      fill: "#8b9894"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M36 43h9l-2 17h-8z",
      fill: "#3b403c"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M48 44h11l4 16H49z",
      fill: "#535a51"
    }), t === 'support' && /*#__PURE__*/React.createElement("path", {
      d: "M48 45h16v17H48z",
      fill: "#716f55"
    }), t === 'rifle' && /*#__PURE__*/React.createElement("path", {
      d: "M38 20h23v7H38zM46 27v3",
      fill: "#465251"
    }), t === 'shotgun' && /*#__PURE__*/React.createElement("path", {
      d: "M61 42h22v5H61z",
      fill: "#6a503c"
    }), t === 'smg' && /*#__PURE__*/React.createElement("path", {
      d: "M72 31h18v12H72z",
      fill: "#3c4645"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M32 33h20v3H32z",
      fill: electric ? light : '#a0a997',
      stroke: "none"
    })), (t === 'pistol' || t === 'revolver' || t === 'flare') && /*#__PURE__*/React.createElement("g", {
      transform: "rotate(-24 48 40)"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M24 26h53v12H42l-4 27H24l6-29h-6z",
      fill: "#87928b"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M28 39h11l-3 22H25z",
      fill: "#65503d"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M43 39h12v12H40",
      fill: "none"
    }), t === 'revolver' && /*#__PURE__*/React.createElement("path", {
      d: "M38 24h17v17H38z",
      fill: "#5e6967"
    }), t === 'flare' && /*#__PURE__*/React.createElement("path", {
      d: "M46 23h32v18H46z",
      fill: "#ae7440"
    }), electric && /*#__PURE__*/React.createElement("path", {
      d: "M55 29h17v4H55z",
      fill: light,
      stroke: "none"
    })), (t === 'bow' || t === 'crossbow') && /*#__PURE__*/React.createElement("g", {
      transform: "rotate(-26 48 40)"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M44 15h7v52h-7z",
      fill: "#70553b"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M20 24l8-10 19-4 21 4 9 10-10 5-20-8-19 8z",
      fill: "#85938c"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M22 25l25 25 28-25",
      fill: "none",
      stroke: "#d0c4a1",
      strokeWidth: "1"
    }), t === 'crossbow' && /*#__PURE__*/React.createElement("path", {
      d: "M39 44h19v9H46l-3 13h-8z",
      fill: "#5b4936"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M48 8v36",
      stroke: "#d0c4a1",
      strokeWidth: "1"
    })), (t === 'knife' || t === 'blade' || t === 'katana') && /*#__PURE__*/React.createElement("g", {
      transform: "rotate(35 48 40)"
    }, /*#__PURE__*/React.createElement("path", {
      d: t === 'knife' ? 'M44 15l10-8v38H44z' : 'M45 8l9-3v42H43z',
      fill: metal
    }), /*#__PURE__*/React.createElement("path", {
      d: "M45 47h7v22h-7z",
      fill: "#51463c"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M37 45h23v5H37z",
      fill: "#b28751"
    }), t === 'katana' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M45 9h3v34h-3z",
      fill: "#8be1de",
      stroke: "none"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M54 55h14v13H54z",
      fill: "#4c5d54"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M58 57h6v8h-6z",
      fill: "#65c9cf",
      stroke: "none"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M52 49h9v6",
      fill: "none",
      stroke: "#b58a4b"
    }))), (t === 'bat' || t === 'crowbar' || t === 'hammer') && /*#__PURE__*/React.createElement("g", {
      transform: "rotate(31 48 40)"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M44 19h9v50h-9z",
      fill: t === 'crowbar' ? '#7d8783' : '#72583b'
    }), t === 'hammer' ? /*#__PURE__*/React.createElement("path", {
      d: "M24 12h48v19H24z",
      fill: "#6a7775"
    }) : t === 'crowbar' ? /*#__PURE__*/React.createElement("path", {
      d: "M44 20V9h16v8h-7v8",
      fill: "#7d8783"
    }) : /*#__PURE__*/React.createElement("path", {
      d: "M41 10h15v35H41z",
      fill: "#8a6a43"
    }), electric && /*#__PURE__*/React.createElement("path", {
      d: "M43 13h6v20h-6z",
      fill: light,
      stroke: "none"
    })), t === 'knuckles' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M18 28h60v25H18zM25 52h14v10H25zM57 52h14v10H57z",
      fill: "#a19c84"
    }), [24, 38, 52, 66].map(function (x) {
      return /*#__PURE__*/React.createElement("path", {
        key: x,
        d: "M".concat(x, " 34h8v12h-8z"),
        fill: "#111714"
      });
    })), t === 'flame' && /*#__PURE__*/React.createElement("g", {
      transform: "rotate(-16 48 40)"
    }, /*#__PURE__*/React.createElement("path", {
      d: "M14 20h14v43H14zM30 20h14v43H30z",
      fill: "#7d8151"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M14 25h30v8H14zM14 52h30v6H14z",
      fill: "#384641"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M46 32h25v12H46zM65 33h21v7H65zM48 43h9v17h-9z",
      fill: "#9a9480"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M20 62h29V43",
      fill: "none",
      stroke: "#4e5e51",
      strokeWidth: "4"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M84 32l6-8 3 12-4 9-6-4z",
      fill: "#e5a352"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M86 35h4v5h-4z",
      fill: "#f0d69a",
      stroke: "none"
    })), t === 'grenade' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M37 14h22v11H37z",
      fill: "#827e61"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M28 27h40l8 11v23L64 69H32L20 59V38z",
      fill: "#637359"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M31 38h34M31 48h34M38 29v31M55 29v31",
      fill: "none",
      stroke: "#374536"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M59 15h14v18",
      fill: "none",
      stroke: "#b0a27b"
    })), t === 'shield' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("path", {
      d: "M23 13l25-6 25 6v35L63 62 48 73 33 62 23 48z",
      fill: "#7f765c"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M29 18l19-5 19 5v28L58 58 48 65 38 58 29 46z",
      fill: "#3d443e"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M44 18h8v40h-8z",
      fill: "#af8853"
    }), /*#__PURE__*/React.createElement("path", {
      d: "M37 33h22v14H37z",
      fill: "#857d60"
    }))));
  }
  function StatRow(_ref2) {
    var label = _ref2.label,
      value = _ref2.value,
      unit = _ref2.unit,
      _ref2$tone = _ref2.tone,
      tone = _ref2$tone === void 0 ? 'normal' : _ref2$tone;
    var missing = isMissing(value);
    return /*#__PURE__*/React.createElement("div", {
      className: 'wc-stat wc-tone-' + (missing ? 'missing' : tone)
    }, /*#__PURE__*/React.createElement("dt", null, label), /*#__PURE__*/React.createElement("dd", null, W.format(value, unit)));
  }
  // Rows with a value show normally; every undefined row folds into one "Not defined" line.
  function Rows(_ref3) {
    var rows = _ref3.rows;
    var shown = rows.filter(function (x) {
        return !isMissing(x[1]);
      }),
      missing = rows.filter(function (x) {
        return isMissing(x[1]);
      }).map(function (x) {
        return x[0];
      });
    return /*#__PURE__*/React.createElement(React.Fragment, null, shown.map(function (_ref4) {
      var _ref5 = _slicedToArray(_ref4, 4),
        label = _ref5[0],
        value = _ref5[1],
        unit = _ref5[2],
        tone = _ref5[3];
      return /*#__PURE__*/React.createElement(StatRow, {
        key: label,
        label: label,
        value: value,
        unit: unit,
        tone: tone
      });
    }), missing.length > 0 && /*#__PURE__*/React.createElement("div", {
      className: "wc-stat wc-tone-missing wc-unset"
    }, /*#__PURE__*/React.createElement("dt", null, "Not defined"), /*#__PURE__*/React.createElement("dd", null, missing.join(' · '))));
  }
  // Base stats depend on the slot: melee weapons have no fire mode, magazine or reload.
  function baseRows(r) {
    if (r.slot === 'melee') return [['DPS', null], ['Attacks / second', null]];
    if (r.slot === 'primary' || r.slot === 'secondary') return [['DPS', null], ['Fire mode', r.fireMode], ['Magazine capacity', r.magazine], ['Reload time', null]];
    if (r.slot === 'throwable') return [['Recovery chance', r.recovery, '%']];
    return [];
  }
  function Card(_ref6) {
    var r = _ref6.record,
      records = _ref6.records;
    var set = records.find(function (s) {
      return s.id === r.setId;
    });
    var pieces = (r.pieces || []).map(function (id) {
      return records.find(function (w) {
        return w.id === id;
      });
    }).filter(Boolean);
    var base = baseRows(r);
    var attrsSet = r.attributes && r.attributes.some(function (a) {
      return !isMissing(a.value);
    });
    return /*#__PURE__*/React.createElement("article", {
      className: 'wc-card wc-theme-' + themeFor(r) + ' wc-rarity-' + (r.rarity || 'undefined'),
      "data-proposed-frame": r.id
    }, /*#__PURE__*/React.createElement("div", {
      className: "wc-proposed-stamp"
    }, "PROPOSED FRAME \xB7 RECIPE NOT APPROVED", r.launch && /*#__PURE__*/React.createElement("span", {
      className: "wc-launch-tag"
    }, "LAUNCH AXE"), r.parked && /*#__PURE__*/React.createElement("span", {
      className: "wc-parked-tag"
    }, "PARKED POOL")), /*#__PURE__*/React.createElement("div", {
      className: "wc-card-trim",
      "aria-hidden": "true"
    }), /*#__PURE__*/React.createElement("header", {
      className: "wc-card-header"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wc-heading-copy"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wc-eyebrow"
    }, r.status), /*#__PURE__*/React.createElement("h2", {
      tabIndex: "-1",
      id: "wc-detail-title"
    }, r.name), r.epithet && /*#__PURE__*/React.createElement("p", {
      className: "wc-epithet"
    }, "\u201C", r.epithet, "\u201D"), /*#__PURE__*/React.createElement("div", {
      className: "wc-classification"
    }, rarityNames[r.rarity] || 'Rarity · Not defined', " \xB7 ", r.family)), /*#__PURE__*/React.createElement("div", {
      className: 'wc-icon-frame' + (pieces.length && !r.sprite ? ' wc-icon-pair' : '')
    }, pieces.length && !r.sprite ? pieces.map(function (p) {
      return /*#__PURE__*/React.createElement(WeaponArt, {
        key: p.id,
        record: p
      });
    }) : /*#__PURE__*/React.createElement(WeaponArt, {
      record: r
    }))), /*#__PURE__*/React.createElement("div", {
      className: "wc-card-content"
    }, r.roster === 'sets' ? /*#__PURE__*/React.createElement("section", {
      className: "wc-set-pieces",
      "aria-label": "Set pieces"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wc-eyebrow"
    }, "Two-piece set \xB7 ", r.setType), pieces.map(function (p) {
      return /*#__PURE__*/React.createElement("a", {
        key: p.id,
        href: W.href(p.id)
      }, /*#__PURE__*/React.createElement(WeaponArt, {
        record: p,
        compact: true
      }), /*#__PURE__*/React.createElement("span", null, p.name, /*#__PURE__*/React.createElement("small", null, p.epithet)), /*#__PURE__*/React.createElement("span", {
        "aria-hidden": "true"
      }, "\u2197"));
    })) : /*#__PURE__*/React.createElement("section", {
      className: "wc-base-block",
      "aria-label": "Base weapon stats"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wc-damage"
    }, /*#__PURE__*/React.createElement("span", null, "BASE DAMAGE"), /*#__PURE__*/React.createElement("strong", {
      className: isMissing(r.baseDamage) ? 'wc-undefined-damage' : ''
    }, W.format(r.baseDamage))), base.length > 0 && /*#__PURE__*/React.createElement("dl", {
      className: "wc-branches"
    }, /*#__PURE__*/React.createElement(Rows, {
      rows: base
    }))), /*#__PURE__*/React.createElement("dl", {
      className: "wc-properties"
    }, /*#__PURE__*/React.createElement(Rows, {
      rows: [['Slot', r.roster === 'sets' ? r.setType : slotName(r.slot)], ['Weight', r.weight, 'kg']].concat(_toConsumableArray(r.slot === 'throwable' || r.roster === 'sets' ? [] : [['Hands', r.hands]]), [['Construction tier', r.constructionTier]], _toConsumableArray(r.roster === 'workshop' ? [['Biome', r.biome], ['Materials', r.materials]] : []), _toConsumableArray(r.durability != null ? [['Prototype durability', r.durability]] : []))
    })), r.bonuses.length > 0 && /*#__PURE__*/React.createElement("section", {
      className: "wc-section"
    }, /*#__PURE__*/React.createElement("h3", null, "Recorded bonuses"), /*#__PURE__*/React.createElement("dl", null, r.bonuses.map(function (b) {
      return /*#__PURE__*/React.createElement(StatRow, _extends({
        key: b.label
      }, b));
    }))), r.affixes && r.affixes.length > 0 && /*#__PURE__*/React.createElement("section", {
      className: "wc-section"
    }, /*#__PURE__*/React.createElement("h3", null, "Proposed bonus themes"), /*#__PURE__*/React.createElement("div", {
      className: "wc-chips"
    }, r.affixes.map(function (a) {
      return /*#__PURE__*/React.createElement("span", {
        key: a,
        className: "wc-chip"
      }, a);
    })), /*#__PURE__*/React.createElement("p", {
      className: "wc-small-note"
    }, "Bonus values are not defined yet.")), r.attributes && (attrsSet ? /*#__PURE__*/React.createElement("section", {
      className: "wc-section wc-attributes"
    }, /*#__PURE__*/React.createElement("h3", null, "S.U.R.V.I.V.A.L. attributes"), /*#__PURE__*/React.createElement("dl", null, /*#__PURE__*/React.createElement(Rows, {
      rows: r.attributes.map(function (a) {
        return [a.label, a.value, a.unit, a.tone];
      })
    }))) : /*#__PURE__*/React.createElement("section", {
      className: "wc-section wc-attributes"
    }, /*#__PURE__*/React.createElement("h3", null, "S.U.R.V.I.V.A.L. attributes"), /*#__PURE__*/React.createElement("p", {
      className: "wc-small-note"
    }, "Not assigned yet."))), /*#__PURE__*/React.createElement("section", {
      className: "wc-description"
    }, /*#__PURE__*/React.createElement("h3", null, r.roster === 'live' ? 'Recorded description' : 'Design identity'), /*#__PURE__*/React.createElement("p", null, r.description || W.MISSING), r.roster === 'live' && /*#__PURE__*/React.createElement("p", {
      className: "wc-small-note"
    }, "Description effects may require supporting mechanics. Recorded damage is not a DPS estimate.")), r.signature && /*#__PURE__*/React.createElement("section", {
      className: 'wc-signature' + (r.rarity === 'relic' ? ' wc-relic-signature' : '')
    }, /*#__PURE__*/React.createElement("h3", null, r.roster === 'sets' ? 'Proposed pair effect' : r.rarity === 'relic' ? 'Inherited signature · proposed' : 'Exclusive mechanic · proposed'), /*#__PURE__*/React.createElement("p", null, r.signature)), set && /*#__PURE__*/React.createElement("a", {
      className: "wc-set-link",
      href: W.href(set.id)
    }, /*#__PURE__*/React.createElement("span", null, "\u25C8 ", set.name, /*#__PURE__*/React.createElement("small", null, set.setType, " \xB7 inspect the pair bonus")), /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "\u2197")), r.baseId && /*#__PURE__*/React.createElement("a", {
      className: "wc-set-link",
      href: W.href(r.baseId)
    }, "Inspect the base Legendary ", /*#__PURE__*/React.createElement("span", {
      "aria-hidden": "true"
    }, "\u2197")), /*#__PURE__*/React.createElement("footer", {
      className: "wc-card-footer"
    }, !isMissing(r.sockets) && /*#__PURE__*/React.createElement("div", {
      className: "wc-socket-line"
    }, /*#__PURE__*/React.createElement("span", {
      className: "wc-socket",
      "aria-hidden": "true"
    }, "\u25C7"), /*#__PURE__*/React.createElement("span", null, "Sockets"), /*#__PURE__*/React.createElement("strong", null, W.format(r.sockets))), /*#__PURE__*/React.createElement("dl", null, /*#__PURE__*/React.createElement(Rows, {
      rows: [].concat(_toConsumableArray(isMissing(r.sockets) ? [['Sockets', null]] : []), [['Requirement', r.requirement]])
    })), /*#__PURE__*/React.createElement("div", {
      className: "wc-record-id"
    }, r.id))));
  }
  window.ProposedRecipeFrames = function ProposedRecipeFrames() {
    var records = React.useMemo(function () {
      return W.getRecords();
    }, []);
    var _React$useState = React.useState(W.readRoute),
      _React$useState2 = _slicedToArray(_React$useState, 2),
      route = _React$useState2[0],
      setRoute = _React$useState2[1];
    var _React$useState3 = React.useState(''),
      _React$useState4 = _slicedToArray(_React$useState3, 2),
      search = _React$useState4[0],
      setSearch = _React$useState4[1];
    var _React$useState5 = React.useState('all'),
      _React$useState6 = _slicedToArray(_React$useState5, 2),
      roster = _React$useState6[0],
      setRoster = _React$useState6[1];
    var _React$useState7 = React.useState('all'),
      _React$useState8 = _slicedToArray(_React$useState7, 2),
      slot = _React$useState8[0],
      setSlot = _React$useState8[1];
    var _React$useState9 = React.useState('all'),
      _React$useState0 = _slicedToArray(_React$useState9, 2),
      rarity = _React$useState0[0],
      setRarity = _React$useState0[1];
    var detailRef = React.useRef(null);
    React.useEffect(function () {
      var update = function update() {
        return setRoute(W.readRoute());
      };
      window.addEventListener('hashchange', update);
      return function () {
        return window.removeEventListener('hashchange', update);
      };
    }, []);
    var selected = records.find(function (r) {
      return r.id === route.id;
    });
    React.useEffect(function () {
      if (detailRef.current) {
        detailRef.current.scrollTop = 0;
        var h = detailRef.current.querySelector('#wc-detail-title');
        if (h) h.focus({
          preventScroll: true
        });
      }
    }, [route.id]);
    var query = search.trim().toLowerCase();
    var inRoster = function inRoster(r, id) {
      return id === 'all' || (id === 'launch' ? !!r.launch : r.roster === id);
    };
    var shown = records.filter(function (r) {
      return inRoster(r, roster) && (slot === 'all' || r.slot === slot) && (rarity === 'all' || (r.rarity || 'undefined') === rarity) && (!query || [r.name, r.epithet, r.maker, r.family, r.id, r.subfamily, r.sectionTitle, r.status].filter(Boolean).join(' ').toLowerCase().includes(query));
    });
    var clear = function clear() {
      setSearch('');
      setRoster('all');
      setSlot('all');
      setRarity('all');
    };
    var linkTo = function linkTo(id) {
      return records.find(function (r) {
        return r.id === id;
      });
    };
    var highlights = ['unique-night-current', 'crossbow', 'flamethrower', 'wf-hedge-reaper'].map(linkTo).filter(Boolean);
    var uniqueIds = ['AXE-151', 'AXE-152', 'AXE-153', 'AXE-201', 'AXE-251', 'AXE-258'];
    function Preview(_ref7) {
      var r = _ref7.record;
      return /*#__PURE__*/React.createElement("a", {
        href: W.href(r.id),
        className: 'wc-preview wc-theme-' + themeFor(r) + ' wc-rarity-' + (r.rarity || 'undefined')
      }, /*#__PURE__*/React.createElement(WeaponArt, {
        record: r
      }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("span", {
        className: "wc-eyebrow"
      }, r.status), /*#__PURE__*/React.createElement("strong", null, r.name), /*#__PURE__*/React.createElement("small", null, r.epithet || r.family)), /*#__PURE__*/React.createElement("span", {
        className: "wc-preview-arrow",
        "aria-hidden": "true"
      }, "\u2197"));
    }
    return /*#__PURE__*/React.createElement("div", {
      className: "wc-screen",
      "data-proposed-crafting-frames": true
    }, /*#__PURE__*/React.createElement("header", {
      className: "wc-page-header"
    }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
      className: "wc-eyebrow"
    }, "CRAFTING / PROPOSAL REVIEW"), /*#__PURE__*/React.createElement("h1", null, /*#__PURE__*/React.createElement("a", {
      href: W.href()
    }, "Proposed frame cards"), selected && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      className: "wc-breadcrumb"
    }, " / "), /*#__PURE__*/React.createElement("span", {
      className: "wc-current-name"
    }, selected.name)))), /*#__PURE__*/React.createElement("span", {
      className: "wc-total"
    }, records.length, " proposed frames ", /*#__PURE__*/React.createElement("span", null, rosters.slice(2).map(function (_ref8) {
      var _ref9 = _slicedToArray(_ref8, 2),
        id = _ref9[0],
        label = _ref9[1];
      return "".concat(records.filter(function (r) {
        return r.roster === id;
      }).length, " ").concat({
        live: 'in game',
        axes: 'regular axes',
        uniques: 'Uniques',
        sets: 'sets',
        ranged: 'ranged concepts',
        workshop: 'workshop',
        relics: 'Relics',
        legacy: 'legacy'
      }[id] || label);
    }).join(' · ')))), /*#__PURE__*/React.createElement("div", {
      className: "wc-layout"
    }, /*#__PURE__*/React.createElement("aside", {
      className: "wc-sidebar",
      "aria-label": "Proposed recipe frame cards"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wc-search"
    }, /*#__PURE__*/React.createElement("label", {
      htmlFor: "wc-search-input"
    }, "Find a proposed frame"), /*#__PURE__*/React.createElement("input", {
      id: "wc-search-input",
      type: "search",
      placeholder: "Name, family, maker or ID\u2026",
      value: search,
      onChange: function onChange(e) {
        return setSearch(e.target.value);
      }
    })), /*#__PURE__*/React.createElement("nav", {
      className: "wc-rosters",
      "aria-label": "Weapon rosters"
    }, rosters.map(function (_ref0) {
      var _ref1 = _slicedToArray(_ref0, 2),
        id = _ref1[0],
        label = _ref1[1];
      return /*#__PURE__*/React.createElement("button", {
        key: id,
        onClick: function onClick() {
          return setRoster(id);
        },
        "aria-pressed": roster === id
      }, label, /*#__PURE__*/React.createElement("span", null, records.filter(function (r) {
        return inRoster(r, id);
      }).length));
    })), /*#__PURE__*/React.createElement("div", {
      className: "wc-filters"
    }, /*#__PURE__*/React.createElement("label", null, "Slot", /*#__PURE__*/React.createElement("select", {
      value: slot,
      onChange: function onChange(e) {
        return setSlot(e.target.value);
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: "all"
    }, "All slots"), ['primary', 'secondary', 'melee', 'throwable', 'offhand'].map(function (s) {
      return /*#__PURE__*/React.createElement("option", {
        key: s,
        value: s
      }, slotName(s));
    }))), /*#__PURE__*/React.createElement("label", null, "Rarity", /*#__PURE__*/React.createElement("select", {
      value: rarity,
      onChange: function onChange(e) {
        return setRarity(e.target.value);
      }
    }, /*#__PURE__*/React.createElement("option", {
      value: "all"
    }, "All rarities"), Object.entries(rarityNames).map(function (_ref10) {
      var _ref11 = _slicedToArray(_ref10, 2),
        id = _ref11[0],
        label = _ref11[1];
      return /*#__PURE__*/React.createElement("option", {
        key: id,
        value: id
      }, label);
    }), /*#__PURE__*/React.createElement("option", {
      value: "undefined"
    }, "Not defined")))), /*#__PURE__*/React.createElement("div", {
      className: "wc-list-heading"
    }, /*#__PURE__*/React.createElement("h2", null, "Frame proposals"), /*#__PURE__*/React.createElement("span", {
      role: "status"
    }, shown.length, " shown")), /*#__PURE__*/React.createElement("div", {
      className: "wc-list"
    }, shown.map(function (r) {
      return /*#__PURE__*/React.createElement("a", {
        key: r.id,
        href: W.href(r.id),
        "aria-current": route.id === r.id ? 'page' : undefined,
        className: 'wc-list-row wc-rarity-' + (r.rarity || 'undefined')
      }, /*#__PURE__*/React.createElement(WeaponArt, {
        record: r,
        compact: true
      }), /*#__PURE__*/React.createElement("span", {
        className: "wc-list-copy"
      }, /*#__PURE__*/React.createElement("strong", null, r.name), /*#__PURE__*/React.createElement("small", null, r.epithet || r.family), /*#__PURE__*/React.createElement("span", null, r.id, " \xB7 ", r.status)), r.launch && /*#__PURE__*/React.createElement("span", {
        className: "wc-launch-dot",
        title: "Launch axe"
      }, "L"), /*#__PURE__*/React.createElement("span", {
        className: "wc-list-chevron",
        "aria-hidden": "true"
      }, "\u203A"));
    }), shown.length === 0 && /*#__PURE__*/React.createElement("div", {
      className: "wc-empty"
    }, /*#__PURE__*/React.createElement("p", null, "No matching frame cards."), /*#__PURE__*/React.createElement("button", {
      onClick: clear
    }, "Clear filters"))), /*#__PURE__*/React.createElement("div", {
      className: "wc-list-footer"
    }, "All frame cards are proposed. Select one to preview.")), /*#__PURE__*/React.createElement("main", {
      className: "wc-detail",
      ref: detailRef,
      "aria-label": "Proposed crafting frame preview"
    }, selected ? /*#__PURE__*/React.createElement("div", {
      className: "wc-detail-grid"
    }, /*#__PURE__*/React.createElement(Card, {
      record: selected,
      records: records
    }), /*#__PURE__*/React.createElement("aside", {
      className: "wc-record-notes"
    }, /*#__PURE__*/React.createElement("a", {
      href: W.href(),
      className: "wc-back"
    }, "\u2190 All proposed frame cards"), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h3", null, "Record"), /*#__PURE__*/React.createElement("dl", null, /*#__PURE__*/React.createElement(StatRow, {
      label: "Status",
      value: selected.status
    }), /*#__PURE__*/React.createElement(StatRow, {
      label: "Record ID",
      value: selected.id
    }), selected.maker && /*#__PURE__*/React.createElement(StatRow, {
      label: "Maker",
      value: selected.maker
    })), selected.sectionTitle && /*#__PURE__*/React.createElement("p", null, selected.sectionTitle), selected.subfamily && /*#__PURE__*/React.createElement("p", null, selected.subfamily)), (selected.role || selected.tradeoff) && /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h3", null, "Proposed role"), /*#__PURE__*/React.createElement("p", null, selected.role), selected.tradeoff && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("h4", null, "Tradeoff"), /*#__PURE__*/React.createElement("p", null, selected.tradeoff))), selected.acquisition && /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h3", null, "Acquisition concept"), /*#__PURE__*/React.createElement("p", null, selected.acquisition)), selected.origin && /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h3", null, "Historical inspiration"), /*#__PURE__*/React.createElement("p", null, selected.origin.archetype), /*#__PURE__*/React.createElement("p", null, selected.origin.culture, /*#__PURE__*/React.createElement("br", null), selected.origin.era), /*#__PURE__*/React.createElement("p", null, selected.origin.site, ", ", selected.origin.country), /*#__PURE__*/React.createElement("p", {
      className: "wc-small-note"
    }, "Historical anchor only. The weapon\u2019s name, design variation and mechanics are fictional concepts."), /^https:\/\//.test(selected.origin.source || '') && /*#__PURE__*/React.createElement("a", {
      href: selected.origin.source,
      target: "_blank",
      rel: "noreferrer"
    }, "Historical source \u2197")), selected.origin2 && /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h3", null, "Imported art"), /*#__PURE__*/React.createElement("p", null, selected.origin2.pack), /*#__PURE__*/React.createElement("p", null, selected.origin2.author, " \xB7 ", selected.origin2.license), /*#__PURE__*/React.createElement("p", {
      className: "wc-small-note"
    }, "Converted to the game palette and pixel grid. Listed in art/weapons/CREDITS.md.")), /*#__PURE__*/React.createElement("section", null, /*#__PURE__*/React.createElement("h3", null, "Source record"), /*#__PURE__*/React.createElement("p", null, selected.sourceLabel), /*#__PURE__*/React.createElement("p", {
      className: "wc-source-id"
    }, selected.sourceId), /*#__PURE__*/React.createElement("a", {
      href: selected.source,
      target: "_blank",
      rel: "noreferrer"
    }, "Open source file \u2197")), /*#__PURE__*/React.createElement("section", {
      className: "wc-data-note"
    }, /*#__PURE__*/React.createElement("h3", null, "Undefined values"), /*#__PURE__*/React.createElement("p", null, "\u201CNot defined\u201D means the source has no approved value. It does not mean zero."), selected.roster !== 'live' && /*#__PURE__*/React.createElement("p", null, "This is a reference concept. It does not grant or equip an item.")))) : route.id || route.invalid ? /*#__PURE__*/React.createElement("div", {
      className: "wc-empty wc-not-found"
    }, /*#__PURE__*/React.createElement("h2", null, "Frame proposal not found"), /*#__PURE__*/React.createElement("p", null, "This link does not match a proposed card in this review."), /*#__PURE__*/React.createElement("a", {
      href: W.href()
    }, "Return to proposed frame cards")) : /*#__PURE__*/React.createElement("div", {
      className: "wc-overview"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wc-overview-heading"
    }, /*#__PURE__*/React.createElement("div", {
      className: "wc-eyebrow"
    }, "PROPOSED RECIPE FRAME CARDS"), /*#__PURE__*/React.createElement("h2", null, "Frame design proposals."), /*#__PURE__*/React.createElement("p", null, "Review the card frames for equipment, axe designs, Uniques, Relics and paired sets. These previews do not approve a recipe or its balance."), /*#__PURE__*/React.createElement("span", {
      className: "wc-reference-label"
    }, "All frames proposed \xB7 Existing source values shown for reference \xB7 Missing metrics remain \u201CNot defined\u201D")), /*#__PURE__*/React.createElement("div", {
      className: "wc-featured-grid"
    }, highlights.map(function (r) {
      return /*#__PURE__*/React.createElement(Preview, {
        key: r.id,
        record: r
      });
    })), /*#__PURE__*/React.createElement("section", {
      className: "wc-overview-section"
    }, /*#__PURE__*/React.createElement("h3", null, "Danielle & Raquelle"), /*#__PURE__*/React.createElement("p", null, "Two distinct axes. One proposed finishing sequence."), /*#__PURE__*/React.createElement("div", {
      className: "wc-pair-banner"
    }, ['unique-danielle', 'unique-raquelle'].map(function (id) {
      return /*#__PURE__*/React.createElement(Preview, {
        key: id,
        record: linkTo(id)
      });
    }), /*#__PURE__*/React.createElement("a", {
      className: "wc-pair-bonus",
      href: W.href('set-duet-of-iron')
    }, /*#__PURE__*/React.createElement("span", null, "\u25C8 TWO-PIECE SET"), /*#__PURE__*/React.createElement("strong", null, "Duet of Iron"), /*#__PURE__*/React.createElement("small", null, "Inspect the pieces and proposed pair effect \u2192")))), /*#__PURE__*/React.createElement("section", {
      className: "wc-overview-section",
      "data-launch-axes": true
    }, /*#__PURE__*/React.createElement("h3", null, "Launch axes \xB7 20"), /*#__PURE__*/React.createElement("p", null, "Ship first: 4 stone, 6 copper, 2 throwing and the 8 Uniques. The other 88 axe concepts stay parked."), /*#__PURE__*/React.createElement("div", {
      className: "wc-unique-grid"
    }, _toConsumableArray(W.LAUNCH_AXES).filter(function (id) {
      return !uniqueIds.includes(id) && !id.startsWith('unique-');
    }).map(function (id) {
      return linkTo(id);
    }).filter(Boolean).map(function (r) {
      return /*#__PURE__*/React.createElement(Preview, {
        key: r.id,
        record: r
      });
    }))), /*#__PURE__*/React.createElement("section", {
      className: "wc-overview-section"
    }, /*#__PURE__*/React.createElement("h3", null, "The six named axe Uniques"), /*#__PURE__*/React.createElement("div", {
      className: "wc-unique-grid"
    }, uniqueIds.map(function (id) {
      return /*#__PURE__*/React.createElement(Preview, {
        key: id,
        record: linkTo(id)
      });
    }))), /*#__PURE__*/React.createElement("section", {
      className: "wc-overview-section"
    }, /*#__PURE__*/React.createElement("h3", null, "Set concepts"), /*#__PURE__*/React.createElement("div", {
      className: "wc-set-overview"
    }, records.filter(function (r) {
      return r.roster === 'sets';
    }).map(function (r) {
      return /*#__PURE__*/React.createElement("a", {
        key: r.id,
        href: W.href(r.id)
      }, /*#__PURE__*/React.createElement("span", null, "\u25C8 ", r.setType), /*#__PURE__*/React.createElement("strong", null, r.name), /*#__PURE__*/React.createElement("small", null, r.pieces.map(function (id) {
        return linkTo(id).name;
      }).join(' + ')));
    })))))));
  };
  window.CraftingWorkspace = function CraftingWorkspace(_ref12) {
    var children = _ref12.children;
    var _React$useState1 = React.useState(function () {
        return W.readRoute().active;
      }),
      _React$useState10 = _slicedToArray(_React$useState1, 2),
      proposed = _React$useState10[0],
      setProposed = _React$useState10[1];
    React.useEffect(function () {
      var sync = function sync() {
        return setProposed(W.readRoute().active);
      };
      window.addEventListener('hashchange', sync);
      return function () {
        return window.removeEventListener('hashchange', sync);
      };
    }, []);
    var open = function open(show) {
      setProposed(show);
      window.location.hash = show ? W.href() : '#crafting';
    };
    return /*#__PURE__*/React.createElement("div", {
      className: "crafting-workspace",
      "data-crafting-workspace": true
    }, /*#__PURE__*/React.createElement("nav", {
      className: "crafting-frame-tabs",
      "aria-label": "Crafting sections"
    }, /*#__PURE__*/React.createElement("span", null, "CRAFTING"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return open(false);
      },
      "aria-pressed": !proposed
    }, "Recipes"), /*#__PURE__*/React.createElement("button", {
      onClick: function onClick() {
        return open(true);
      },
      "aria-pressed": proposed
    }, "Proposed frame cards ", /*#__PURE__*/React.createElement("small", null, "PROPOSED"))), /*#__PURE__*/React.createElement("div", {
      className: "crafting-workspace-content"
    }, proposed ? /*#__PURE__*/React.createElement(window.ProposedRecipeFrames, null) : children));
  };
})();