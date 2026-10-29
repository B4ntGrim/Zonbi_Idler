"use strict";

function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
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
// Zombie Idler v2 — Enhanced Screens Part 2
// Marketplace v2, Schedule v2, Camp Overview v2

// ─── MARKETPLACE V2 ──────────────────────────────────────────────────────────
function MarketplaceScreenV2() {
  var _ZI_ART$contracts, _ZI_ART$contracts$com, _boostItems$find, _ZI_ART$blueprints, _ZI_ART$blueprints$ri, _auctionItems$find, _pendingSeller$item;
  var ZI = window.ZI;
  var ZI_ART = window.ZI_ART;
  var _React$useState = React.useState(null),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    selectedItem = _React$useState2[0],
    setSelectedItem = _React$useState2[1];
  var _React$useState3 = React.useState(''),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    bidAmount = _React$useState4[0],
    setBidAmount = _React$useState4[1];
  var _React$useState5 = React.useState(null),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    boostItem = _React$useState6[0],
    setBoostItem = _React$useState6[1];
  var _React$useState7 = React.useState('browse'),
    _React$useState8 = _slicedToArray(_React$useState7, 2),
    tab = _React$useState8[0],
    setTab = _React$useState8[1];
  var _React$useState9 = React.useState('All'),
    _React$useState0 = _slicedToArray(_React$useState9, 2),
    filter = _React$useState0[0],
    setFilter = _React$useState0[1];
  var _React$useState1 = React.useState(null),
    _React$useState10 = _slicedToArray(_React$useState1, 2),
    pendingSeller = _React$useState10[0],
    setPendingSeller = _React$useState10[1]; // seller review modal

  var auctionItems = [{
    id: 'a1',
    name: 'Sunder Pulse Axe',
    type: 'Legendary',
    tier: 4,
    current: 3200,
    bids: 12,
    timeLeft: '2h 14m',
    seller: 'IronDefender_77',
    color: 'var(--amber)',
    stats: {
      damage: 88,
      scaling: 'Valor: A',
      durability: 95,
      weight: '4.2kg',
      perk: 'Killing blow +25% attack speed'
    },
    img: ZI_ART === null || ZI_ART === void 0 || (_ZI_ART$contracts = ZI_ART.contracts) === null || _ZI_ART$contracts === void 0 || (_ZI_ART$contracts$com = _ZI_ART$contracts.combat) === null || _ZI_ART$contracts$com === void 0 ? void 0 : _ZI_ART$contracts$com.call(_ZI_ART$contracts)
  }, {
    id: 'a2',
    name: 'RMAT-4 Anomalous ×3',
    type: 'RMAT',
    tier: 4,
    current: 5400,
    bids: 8,
    timeLeft: '45m',
    seller: 'Concordance_Trader',
    color: 'var(--purple)',
    stats: {
      quantity: 3,
      purity: '94%',
      stability: 'Moderate',
      biome: 'Perimeter'
    },
    img: null
  }, {
    id: 'a3',
    name: 'Blueprint: Anomaly Forge',
    type: 'Blueprint',
    tier: 5,
    current: 8900,
    bids: 21,
    timeLeft: '6h 30m',
    seller: 'ShadowBroker_K',
    color: 'var(--purple)',
    stats: {
      unlocks: 'Anomaly Forge T5',
      requires: 'RMAT-4 ×10 + Concordance Allied'
    },
    img: null
  }, {
    id: 'a4',
    name: 'Temporal Plate (Exotic)',
    type: 'Exotic',
    tier: 5,
    current: 14200,
    bids: 5,
    timeLeft: '1h 02m',
    seller: 'Dustwalker_Pro',
    color: 'var(--purple)',
    stats: {
      armor: 120,
      traits: 'Encounter freq -30%',
      hazardResist: '100%',
      weight: '7.8kg'
    },
    img: null
  }];
  var browseItems = ZI.MARKET_ITEMS;
  var filtered = filter === 'All' ? browseItems : browseItems.filter(function (i) {
    return i.type === filter;
  });
  var types = ['All', 'RMAT', 'Weapon', 'Armor', 'Blueprint', 'Legendary', 'Consumable'];
  var activeItem = selectedItem ? auctionItems.find(function (i) {
    return i.id === selectedItem;
  }) || browseItems.find(function (i) {
    return i.id === selectedItem;
  }) : null;

  // Boost items player has
  var boostItems = [{
    id: 'b1',
    name: 'RMAT-2 Mech Shard',
    bidBoost: 200,
    color: 'var(--blue)'
  }, {
    id: 'b2',
    name: 'Rare Ammo Cache',
    bidBoost: 350,
    color: 'var(--amber)'
  }, {
    id: 'b3',
    name: 'Faction Token',
    bidBoost: 500,
    color: 'var(--purple)'
  }];
  var totalBid = parseInt(bidAmount || '0') + (boostItem ? ((_boostItems$find = boostItems.find(function (b) {
    return b.id === boostItem;
  })) === null || _boostItems$find === void 0 ? void 0 : _boostItems$find.bidBoost) || 0 : 0);
  return /*#__PURE__*/React.createElement("div", {
    className: "screen-enter",
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 0,
      height: '100%',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      padding: '7px 10px',
      background: 'var(--bg3)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 18,
      color: 'var(--amber)'
    }
  }, "Global Marketplace"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      padding: '3px 8px',
      background: 'var(--bg2)',
      border: '1px solid var(--border)'
    }
  }, "\uD83D\uDFE2 Live \xB7 52 players online"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--purple)',
      padding: '3px 8px',
      background: 'rgba(168,85,247,0.1)',
      border: '1px solid rgba(168,85,247,0.3)'
    }
  }, "\u26A0 RMAT Storm active \xB7 RMAT +40%"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 12,
      color: 'var(--amber)',
      padding: '3px 10px',
      background: 'var(--bg2)',
      border: '1px solid var(--border)'
    }
  }, "4,820 \u20B5")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      gap: 0,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "tab-nav"
  }, [['browse', 'Browse'], ['auction', 'Auction'], ['sell', 'Sell'], ['history', 'History']].map(function (_ref) {
    var _ref2 = _slicedToArray(_ref, 2),
      id = _ref2[0],
      label = _ref2[1];
    return /*#__PURE__*/React.createElement("button", {
      key: id,
      className: "tab-btn".concat(tab === id ? ' active' : ''),
      onClick: function onClick() {
        return setTab(id);
      }
    }, label);
  })), tab === 'browse' && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '5px 8px',
      background: 'var(--bg3)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      gap: 4,
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
        fontSize: 8,
        padding: '2px 6px',
        border: "1px solid ".concat(filter === t ? 'var(--amber)' : 'var(--border)'),
        background: filter === t ? 'rgba(200,169,110,0.12)' : 'var(--bg4)',
        color: filter === t ? 'var(--amber)' : 'var(--text3)',
        cursor: 'pointer'
      }
    }, t);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr auto auto auto auto',
      padding: '4px 10px',
      background: 'var(--bg3)',
      borderBottom: '1px solid var(--border)',
      gap: 8
    }
  }, ['Item', 'Type', 'Tier', 'Price', 'Action'].map(function (h) {
    return /*#__PURE__*/React.createElement("span", {
      key: h,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)'
      }
    }, h);
  })), filtered.map(function (item) {
    var _ZI$RMAT_TIERS$item$t;
    return /*#__PURE__*/React.createElement("div", {
      key: item.id,
      onClick: function onClick() {
        return setSelectedItem(item.id === selectedItem ? null : item.id);
      },
      style: {
        display: 'grid',
        gridTemplateColumns: '1fr auto auto auto auto',
        padding: '7px 10px',
        borderBottom: '1px solid var(--border)',
        gap: 8,
        alignItems: 'center',
        cursor: 'pointer',
        background: selectedItem === item.id ? 'var(--bg4)' : 'transparent',
        transition: 'background 0.1s'
      },
      onMouseEnter: function onMouseEnter(e) {
        return e.currentTarget.style.background = 'var(--bg4)';
      },
      onMouseLeave: function onMouseLeave(e) {
        return e.currentTarget.style.background = selectedItem === item.id ? 'var(--bg4)' : 'transparent';
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 12,
        color: 'var(--text)'
      }
    }, item.name), /*#__PURE__*/React.createElement(Tag, {
      color: "var(--text3)"
    }, item.type), /*#__PURE__*/React.createElement(Tag, {
      color: ((_ZI$RMAT_TIERS$item$t = ZI.RMAT_TIERS[item.tier]) === null || _ZI$RMAT_TIERS$item$t === void 0 ? void 0 : _ZI$RMAT_TIERS$item$t.color) || 'var(--text2)'
    }, "T".concat(item.tier)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--amber)'
      }
    }, item.basePrice, "\u20B5"), /*#__PURE__*/React.createElement("button", {
      className: "btn btn-sm btn-amber",
      onClick: function onClick(e) {
        e.stopPropagation();
        setSelectedItem(item.id);
      }
    }, "Buy"));
  }))), tab === 'auction' && /*#__PURE__*/React.createElement("div", {
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
      onClick: function onClick() {
        return setSelectedItem(item.id === selectedItem ? null : item.id);
      },
      style: {
        padding: '10px 12px',
        cursor: 'pointer',
        border: "1px solid ".concat(selectedItem === item.id ? item.color : 'var(--border)'),
        background: selectedItem === item.id ? 'var(--bg4)' : 'var(--bg3)',
        transition: 'all 0.15s'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        color: item.color,
        fontWeight: 500
      }
    }, item.name), /*#__PURE__*/React.createElement(Tag, {
      color: item.color
    }, "T".concat(item.tier))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 14,
        color: 'var(--amber)',
        fontWeight: 'bold'
      }
    }, item.current.toLocaleString(), "\u20B5")), /*#__PURE__*/React.createElement("div", {
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
    }, item.bids, " bids \xB7 ", item.seller), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--amber)'
      }
    }, "\u23F1 ", item.timeLeft)));
  })), (tab === 'sell' || tab === 'history') && /*#__PURE__*/React.createElement("div", {
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
  }, tab === 'sell' ? 'Drag items from inventory to list.' : 'No trade history yet.'))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid var(--border)',
      overflow: 'hidden'
    }
  }, activeItem ? /*#__PURE__*/React.createElement(ItemDetailPanel, {
    item: activeItem,
    onBack: function onBack() {
      return setSelectedItem(null);
    },
    isAuction: !!auctionItems.find(function (a) {
      return a.id === (activeItem === null || activeItem === void 0 ? void 0 : activeItem.id);
    })
  }) : /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
      borderBottom: '1px solid var(--border)',
      background: 'radial-gradient(ellipse at center, rgba(200,169,110,0.05), transparent)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 13,
      color: 'var(--text3)',
      marginBottom: 12,
      letterSpacing: '0.2em'
    }
  }, "FEATURED AUCTION"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    },
    dangerouslySetInnerHTML: {
      __html: (ZI_ART === null || ZI_ART === void 0 || (_ZI_ART$blueprints = ZI_ART.blueprints) === null || _ZI_ART$blueprints === void 0 || (_ZI_ART$blueprints$ri = _ZI_ART$blueprints.rifle) === null || _ZI_ART$blueprints$ri === void 0 ? void 0 : _ZI_ART$blueprints$ri.call(_ZI_ART$blueprints)) || ''
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--amber)',
      textAlign: 'center'
    }
  }, "Hunting Rifle WM"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginTop: 4
    }
  }, "T3 Weapon \xB7 Reflex: A \xB7 Insight: B"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--amber)',
      marginTop: 8
    }
  }, "380\u20B5 \xB7 12 in stock")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: 10,
      overflow: 'auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 6
    }
  }, "ACTIVE MARKET EVENTS"), ZI.WORLD_EVENTS.map(function (e) {
    return /*#__PURE__*/React.createElement("div", {
      key: e.id,
      style: {
        padding: '6px 8px',
        marginBottom: 4,
        background: e.active ? "".concat(e.color, "18") : 'var(--bg3)',
        border: "1px solid ".concat(e.active ? e.color : 'var(--border)')
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        marginBottom: 2
      }
    }, e.active && /*#__PURE__*/React.createElement("div", {
      className: "notif-dot"
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 11,
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
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "panel-title"
  }, "Enhanced Bidding"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 10
    }
  }, tab === 'auction' && activeItem && auctionItems.find(function (a) {
    return a.id === activeItem.id;
  }) ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--amber)',
      marginBottom: 4
    }
  }, activeItem.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)'
    }
  }, "Current highest"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 14,
      color: 'var(--amber)',
      fontWeight: 'bold'
    }
  }, (_auctionItems$find = auctionItems.find(function (a) {
    return a.id === activeItem.id;
  })) === null || _auctionItems$find === void 0 ? void 0 : _auctionItems$find.current.toLocaleString(), "\u20B5"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 5
    }
  }, "YOUR BID"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    value: bidAmount,
    onChange: function onChange(e) {
      return setBidAmount(e.target.value);
    },
    placeholder: "Enter amount...",
    style: {
      width: '100%',
      padding: '7px 10px',
      background: 'var(--bg4)',
      border: '1px solid var(--border)',
      color: 'var(--amber)',
      fontFamily: 'var(--font-mono)',
      fontSize: 13,
      outline: 'none'
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 10
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 5
    }
  }, "BID BOOST ITEMS ", /*#__PURE__*/React.createElement("span", {
    style: {
      fontStyle: 'italic',
      fontSize: 8
    }
  }, "\xB7 use rare items to strengthen bid")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, boostItems.map(function (b) {
    return /*#__PURE__*/React.createElement("div", {
      key: b.id,
      onClick: function onClick() {
        return setBoostItem(boostItem === b.id ? null : b.id);
      },
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '6px 8px',
        cursor: 'pointer',
        border: "1px solid ".concat(boostItem === b.id ? b.color : 'var(--border)'),
        background: boostItem === b.id ? "".concat(b.color.replace('var(--', '').replace(')', '')) : 'var(--bg3)',
        transition: 'all 0.15s'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 11,
        color: 'var(--text)'
      }
    }, b.name), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: b.color
      }
    }, "+", b.bidBoost, "\u20B5"));
  }))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 10px',
      background: 'var(--bg4)',
      border: '1px solid var(--border)',
      marginBottom: 10,
      display: 'flex',
      justifyContent: 'space-between'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text3)'
    }
  }, "Total bid"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 14,
      color: 'var(--amber)',
      fontWeight: 'bold'
    }
  }, totalBid.toLocaleString(), "\u20B5")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    style: {
      width: '100%',
      marginBottom: 6
    },
    onClick: function onClick() {
      window.ZI.emitAction && window.ZI.emitAction('transaction', 1 + (totalBid || 0) / 500);
      setPendingSeller({
        item: activeItem,
        bid: totalBid
      });
    }
  }, "Submit Bid \u2192"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      lineHeight: 1.5,
      textAlign: 'center'
    }
  }, "Seller must accept before transaction completes.")) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 4
    }
  }, "QUICK BUY"), activeItem && !auctionItems.find(function (a) {
    return a.id === activeItem.id;
  }) && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 10px',
      background: 'var(--bg4)',
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontSize: 14,
      color: 'var(--amber)'
    }
  }, activeItem.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text2)',
      marginTop: 2
    }
  }, activeItem.basePrice, "\u20B5 per unit")), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    style: {
      width: '100%'
    },
    onClick: function onClick() {
      window.ZI.emitAction && window.ZI.emitAction('transaction', 1.5);
    }
  }, "Buy Now"), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      width: '100%'
    }
  }, "Add to Watchlist")), !activeItem && /*#__PURE__*/React.createElement("div", {
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
  }, "No Item Selected"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "Select a listing or auction item to bid."))), pendingSeller && /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'fixed',
      inset: 0,
      background: 'rgba(15,14,12,0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 380,
      background: 'var(--bg2)',
      border: '1px solid var(--amber)',
      padding: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 18,
      color: 'var(--amber)',
      marginBottom: 4
    }
  }, "Seller Review Required"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text2)',
      marginBottom: 12,
      lineHeight: 1.6
    }
  }, "Your bid of ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--amber)'
    }
  }, pendingSeller.bid.toLocaleString(), "\u20B5"), " on ", /*#__PURE__*/React.createElement("b", null, (_pendingSeller$item = pendingSeller.item) === null || _pendingSeller$item === void 0 ? void 0 : _pendingSeller$item.name), " has been submitted to the seller. They must accept before the transaction completes."), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 10px',
      background: 'var(--bg4)',
      borderLeft: '3px solid var(--amber)',
      marginBottom: 12,
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "Marketplace rule: all transactions require seller confirmation. Rare items may attract counter-offers or decline."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    style: {
      flex: 1
    },
    onClick: function onClick() {
      return setPendingSeller(null);
    }
  }, "Await Response"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-red",
    style: {
      flex: 1
    },
    onClick: function onClick() {
      return setPendingSeller(null);
    }
  }, "Withdraw Bid"))))))));
}

// Item detail panel (spans > half screen via modal overlay)
function ItemDetailPanel(_ref3) {
  var _ZI_ART$blueprints2, _ZI_ART$blueprints2$h, _item$current;
  var item = _ref3.item,
    onBack = _ref3.onBack,
    isAuction = _ref3.isAuction;
  var ZI = window.ZI;
  var ZI_ART = window.ZI_ART;
  var rmatTier = ZI.RMAT_TIERS[item.tier] || ZI.RMAT_TIERS[1];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 10px',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("button", {
    className: "btn btn-sm",
    onClick: onBack
  }, "\u2190 Back"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 14,
      color: 'var(--amber)'
    }
  }, "Item Details")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 12,
      padding: 16,
      background: 'var(--bg3)',
      border: "1px solid ".concat(rmatTier.color, "44"),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 120
    }
  }, item.img ? /*#__PURE__*/React.createElement("div", {
    dangerouslySetInnerHTML: {
      __html: item.img
    }
  }) : /*#__PURE__*/React.createElement("div", {
    dangerouslySetInnerHTML: {
      __html: (ZI_ART === null || ZI_ART === void 0 || (_ZI_ART$blueprints2 = ZI_ART.blueprints) === null || _ZI_ART$blueprints2 === void 0 || (_ZI_ART$blueprints2$h = _ZI_ART$blueprints2.hazardSuit) === null || _ZI_ART$blueprints2$h === void 0 ? void 0 : _ZI_ART$blueprints2$h.call(_ZI_ART$blueprints2)) || ''
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 20,
      color: rmatTier.color,
      marginBottom: 4
    }
  }, item.name), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 6,
      marginBottom: 12
    }
  }, /*#__PURE__*/React.createElement(Tag, {
    color: rmatTier.color
  }, "T", item.tier), /*#__PURE__*/React.createElement(Tag, {
    color: "var(--text3)"
  }, item.type), isAuction && /*#__PURE__*/React.createElement(Tag, {
    color: "var(--green)"
  }, "Auction")), item.stats && /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      marginBottom: 6
    }
  }, "ITEM STATS"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      marginBottom: 12
    }
  }, Object.entries(item.stats).map(function (_ref4) {
    var _ref5 = _slicedToArray(_ref4, 2),
      k = _ref5[0],
      v = _ref5[1];
    return /*#__PURE__*/React.createElement("div", {
      key: k,
      style: {
        display: 'flex',
        justifyContent: 'space-between'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text3)'
      }
    }, k.replace(/([A-Z])/g, ' $1').replace(/^./, function (s) {
      return s.toUpperCase();
    })), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text)'
      }
    }, v));
  }))), isAuction && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 10px',
      background: 'var(--bg4)',
      border: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement(InfoRow, {
    label: "Current bid",
    value: "".concat((_item$current = item.current) === null || _item$current === void 0 ? void 0 : _item$current.toLocaleString(), "\u20B5"),
    color: "var(--amber)"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Total bids",
    value: item.bids,
    color: "var(--text2)"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Time remaining",
    value: item.timeLeft,
    color: "var(--amber)"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Seller",
    value: item.seller,
    color: "var(--text2)"
  }))));
}
Object.assign(window, {
  MarketplaceScreenV2: MarketplaceScreenV2,
  ItemDetailPanel: ItemDetailPanel
});

// ─── MARKET SHOP (gated vendor sub-view) ─────────────────────────────────────
function ShopScreen() {
  var ZI = window.ZI;
  var _React$useState11 = React.useState(0),
    _React$useState12 = _slicedToArray(_React$useState11, 2),
    force = _React$useState12[1];
  var rerender = function rerender() {
    return force(function (n) {
      return n + 1;
    });
  };
  var tierColor = function tierColor(t) {
    return ZI.tierColor(t);
  };
  var catGroups = [{
    key: 'blueprint',
    label: 'Blueprints',
    cats: ['blueprint']
  }, {
    key: 'capacity',
    label: 'Capacity',
    cats: ['capacity']
  }, {
    key: 'station',
    label: 'Cooking stations',
    cats: ['station']
  }, {
    key: 'gear',
    label: 'Gear & Consumables',
    cats: ['gear', 'consumable']
  }, {
    key: 'cosmetic',
    label: 'Cosmetics & QoL',
    cats: ['cosmetic', 'qol']
  }];
  var _React$useState13 = React.useState({}),
    _React$useState14 = _slicedToArray(_React$useState13, 2),
    collapsed = _React$useState14[0],
    setCollapsed = _React$useState14[1];
  var items = ZI.SHOP_ITEMS || [];

  // Sort within a group: unlocked-affordable → unlocked → locked(nearest) → owned.
  var stateRank = {
    unlocked: 0,
    locked: 1,
    owned: 2
  };
  var sortItems = function sortItems(arr) {
    return arr.slice().sort(function (a, b) {
      var sa = ZI.shopState(a),
        sb = ZI.shopState(b);
      if (stateRank[sa] !== stateRank[sb]) return stateRank[sa] - stateRank[sb];
      if (sa === 'locked') return ZI.shopGateFraction(b) - ZI.shopGateFraction(a); // nearest first
      return 0;
    });
  };

  // Nearest unlock across all locked items.
  var locked = items.filter(function (e) {
    return ZI.shopState(e) === 'locked';
  });
  var nearest = locked.slice().sort(function (a, b) {
    return ZI.shopGateFraction(b) - ZI.shopGateFraction(a);
  })[0];
  var nearestMsg = function () {
    if (!nearest) return locked.length === 0 ? 'All stock unlocked.' : '';
    var p = ZI.shopProgress(nearest);
    if (p.distance) return "".concat(nearest.name, " \u2014 ").concat((p.distance.req - p.distance.cur).toLocaleString(), " m to go");
    if (p.lap) return "".concat(nearest.name, " \u2014 ").concat(p.lap.req - p.lap.cur, " lap(s) to go");
    if (p.rmat) return "".concat(nearest.name, " \u2014 needs ").concat(p.rmat.tier).concat(p.rmat.isTierReach ? ' tier' : " \xD7".concat(p.rmat.req));
    return nearest.name;
  }();

  // Oct 27: purchases are live. One path (ZI.shopPurchase) checks the gate and the RMAT wallet, then grants.
  var _React$useState15 = React.useState(null),
    _React$useState16 = _slicedToArray(_React$useState15, 2),
    notice = _React$useState16[0],
    setNotice = _React$useState16[1];
  var buy = function buy(entry) {
    var r = ZI.shopPurchase(entry);
    setNotice({
      id: entry.id,
      ok: r.ok,
      text: r.ok ? r.text : r.reason
    });
    rerender();
  };
  var wallet = ZI.getRmatHoldings();
  var ProgressLine = function ProgressLine(_ref6) {
    var _c$cur$toLocaleString, _c$cur$toLocaleString2, _c$cur, _c$req$toLocaleString, _c$req$toLocaleString2, _c$req;
    var c = _ref6.c,
      label = _ref6.label,
      color = _ref6.color;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 3
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)',
        marginBottom: 1
      }
    }, /*#__PURE__*/React.createElement("span", null, label), /*#__PURE__*/React.createElement("span", null, (_c$cur$toLocaleString = (_c$cur$toLocaleString2 = (_c$cur = c.cur).toLocaleString) === null || _c$cur$toLocaleString2 === void 0 ? void 0 : _c$cur$toLocaleString2.call(_c$cur)) !== null && _c$cur$toLocaleString !== void 0 ? _c$cur$toLocaleString : c.cur, " / ", (_c$req$toLocaleString = (_c$req$toLocaleString2 = (_c$req = c.req).toLocaleString) === null || _c$req$toLocaleString2 === void 0 ? void 0 : _c$req$toLocaleString2.call(_c$req)) !== null && _c$req$toLocaleString !== void 0 ? _c$req$toLocaleString : c.req)), /*#__PURE__*/React.createElement("div", {
      style: {
        height: 4,
        background: 'var(--bg4)',
        borderRadius: 2
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        height: '100%',
        width: "".concat(Math.min(100, c.cur / c.req * 100), "%"),
        background: color,
        borderRadius: 2
      }
    })));
  };
  var Card = function Card(_ref7) {
    var _entry$grant, _entry$grant2, _entry$grant3;
    var entry = _ref7.entry;
    var st = ZI.shopState(entry);
    var col = tierColor(entry.tier);
    var meta = ZI.TIER_META[entry.tier] || ZI.TIER_META.T0;
    var prog = ZI.shopProgress(entry);
    var lvl = ZI.shopLevel(entry.id);
    var maxLvl = ((_entry$grant = entry.grant) === null || _entry$grant === void 0 ? void 0 : _entry$grant.maxLevel) || 1;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        padding: '9px 11px',
        background: 'var(--bg3)',
        border: '1px solid var(--border)',
        borderLeft: "3px solid ".concat(col),
        opacity: st === 'locked' ? 0.85 : 1
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
        fontSize: 15
      }
    }, entry.icon), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: col,
        flex: 1
      }
    }, entry.name), /*#__PURE__*/React.createElement("span", {
      className: "tag",
      style: {
        color: col,
        borderColor: col,
        background: col + '22'
      }
    }, meta.label)), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text2)',
        marginBottom: 7,
        lineHeight: 1.5
      }
    }, entry.desc), st === 'locked' && /*#__PURE__*/React.createElement("div", {
      style: {
        marginBottom: 6
      }
    }, prog.distance && /*#__PURE__*/React.createElement(ProgressLine, {
      c: prog.distance,
      label: "Wandering distance",
      color: col
    }), prog.lap && /*#__PURE__*/React.createElement(ProgressLine, {
      c: prog.lap,
      label: "Lap milestone",
      color: col
    }), prog.rmat && /*#__PURE__*/React.createElement(ProgressLine, {
      c: {
        cur: prog.rmat.cur,
        req: prog.rmat.req
      },
      label: prog.rmat.isTierReach ? "Reach RMAT ".concat(prog.rmat.tier) : "RMAT ".concat(prog.rmat.tier),
      color: col
    })), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8
      }
    }, st === 'owned' ? /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--green)'
      }
    }, "\u2713 ", entry.repeatable && (_entry$grant2 = entry.grant) !== null && _entry$grant2 !== void 0 && _entry$grant2.maxLevel ? "Lvl ".concat(lvl, "/").concat(maxLvl) : 'Owned') : st === 'unlocked' ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
      "data-shop-price": entry.id,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: ZI.shopCanAfford(entry) ? 'var(--text2)' : 'var(--red2)'
      }
    }, ZI.shopPriceText(entry), " ", entry.repeatable && (_entry$grant3 = entry.grant) !== null && _entry$grant3 !== void 0 && _entry$grant3.maxLevel ? "\xB7 Lvl ".concat(lvl, "/").concat(maxLvl) : ''), /*#__PURE__*/React.createElement("button", {
      "data-shop-buy": entry.id,
      onClick: function onClick() {
        return buy(entry);
      },
      disabled: !ZI.shopCanAfford(entry),
      title: ZI.shopCanAfford(entry) ? 'Buy with RMAT' : 'Not enough RMAT',
      style: {
        marginLeft: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        padding: '3px 12px',
        background: ZI.shopCanAfford(entry) ? 'var(--amber)' : 'var(--bg4)',
        border: '1px solid ' + (ZI.shopCanAfford(entry) ? 'var(--amber)' : 'var(--border)'),
        color: ZI.shopCanAfford(entry) ? '#000' : 'var(--text3)',
        cursor: ZI.shopCanAfford(entry) ? 'pointer' : 'not-allowed'
      }
    }, "Buy")) : /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: 'var(--text3)'
      }
    }, "\uD83D\uDD12 Locked \u2014 meet the gate to unlock", ZI.shopPrice(entry) ? " \xB7 price ".concat(ZI.shopPriceText(entry)) : '')), notice && notice.id === entry.id && /*#__PURE__*/React.createElement("div", {
      "data-shop-notice": notice.ok ? 'ok' : 'fail',
      style: {
        marginTop: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: notice.ok ? 'var(--green)' : 'var(--red2)'
      }
    }, notice.ok ? '✓ ' : '✕ ', notice.text));
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "screen-enter",
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '7px 12px',
      background: 'var(--bg3)',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--amber)'
    }
  }, "\u25C8 Next unlock:"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 10,
      color: 'var(--text2)'
    }
  }, nearestMsg || '—'), /*#__PURE__*/React.createElement("span", {
    "data-shop-wallet": true,
    style: {
      marginLeft: 'auto',
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)',
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap',
      justifyContent: 'flex-end'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Wandering ", ZI.getLifetimeDistance().toLocaleString(), " m \xB7 Lap ", ZI.getLifetimeLap()), /*#__PURE__*/React.createElement("span", null, "RMAT: ", ['T0', 'T1', 'T2', 'T3', 'T4', 'T5'].map(function (k) {
    return /*#__PURE__*/React.createElement("span", {
      key: k,
      style: {
        color: tierColor(k),
        marginLeft: 5
      }
    }, k, " ", wallet[k] || 0);
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 10,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }
  }, catGroups.map(function (group) {
    var groupItems = sortItems(items.filter(function (e) {
      return group.cats.includes(e.cat);
    }));
    if (!groupItems.length) return null;
    var isCol = collapsed[group.key];
    return /*#__PURE__*/React.createElement("div", {
      key: group.key,
      className: "panel",
      style: {
        padding: 0,
        flexShrink: 0
      }
    }, /*#__PURE__*/React.createElement("div", {
      className: "panel-title",
      onClick: function onClick() {
        return setCollapsed(function (c) {
          return _objectSpread(_objectSpread({}, c), {}, _defineProperty({}, group.key, !c[group.key]));
        });
      },
      style: {
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center'
      }
    }, /*#__PURE__*/React.createElement("span", null, isCol ? '▸' : '▾', " ", group.label), /*#__PURE__*/React.createElement("span", {
      style: {
        marginLeft: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)'
      }
    }, groupItems.length)), !isCol && /*#__PURE__*/React.createElement("div", {
      style: {
        padding: 8,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px,1fr))',
        gap: 6
      }
    }, groupItems.map(function (e) {
      return /*#__PURE__*/React.createElement(Card, {
        key: e.id,
        entry: e
      });
    })));
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      textAlign: 'center',
      padding: 4
    }
  }, "Prices are in RMAT. They are starting values for the economy check (the circuit toggle's 10 T2 is decided).")));
}

// Parent: the Shop tab. The Shop replaced the Market tab and the Auction view was removed [DECIDED Oct 27, Sam].
// MarketplaceScreenV2 (the old auction) stays defined but is no longer reachable.
function MarketParent() {
  return /*#__PURE__*/React.createElement("div", {
    "data-shop-tab": true,
    style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      padding: '6px 10px',
      borderBottom: '1px solid var(--border)',
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 13,
      letterSpacing: '0.06em',
      color: 'var(--amber)'
    }
  }, "SHOP"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--text3)'
    }
  }, "Fixed vendor \xB7 prices in RMAT \xB7 stock unlocks with progress")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minHeight: 0,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(ShopScreen, null)));
}
Object.assign(window, {
  ShopScreen: ShopScreen,
  MarketParent: MarketParent
});

// ─── SCHEDULE SCREEN V2 (draggable timeline + 6 tasks only) ──────────────────
function ScheduleScreenV2(_ref8) {
  var mode = _ref8.mode;
  var ZI = window.ZI;
  var ZI_ART = window.ZI_ART;

  // Save Draft / Confirm flow state
  var _React$useState17 = React.useState(false),
    _React$useState18 = _slicedToArray(_React$useState17, 2),
    draftLocked = _React$useState18[0],
    setDraftLocked = _React$useState18[1];
  var _React$useState19 = React.useState(false),
    _React$useState20 = _slicedToArray(_React$useState19, 2),
    confirmed = _React$useState20[0],
    setConfirmed = _React$useState20[1];
  var ALLOWED_TASKS = [{
    id: 'craft',
    name: 'Craft Item(s)',
    icon: 'craft',
    duration: 2,
    category: 'both',
    color: 'var(--amber)'
  }, {
    id: 'train',
    name: 'Train Stats',
    icon: 'train',
    duration: 3,
    category: 'both',
    color: 'var(--red2)'
  }, {
    id: 'repair',
    name: 'Repair Gear',
    icon: 'repair',
    duration: 2,
    category: 'both',
    color: 'var(--text2)'
  }, {
    id: 'trade',
    name: 'Marketplace Trade',
    icon: 'trade',
    duration: 1,
    category: 'both',
    color: 'var(--green)'
  }, {
    id: 'rest',
    name: 'Rest & Recover',
    icon: 'rest',
    duration: 3,
    category: 'both',
    color: 'var(--blue)'
  }, {
    id: 'horde',
    name: 'Prepping for Horde',
    icon: 'horde',
    duration: 2,
    category: 'camp',
    color: 'var(--rust2)',
    css: '#e0624c'
  }];
  var _React$useState21 = React.useState([{
      id: 1,
      taskId: 'rest',
      label: 'Rest & Recover',
      duration: 3,
      priority: 1
    }, {
      id: 2,
      taskId: 'craft',
      label: 'Craft: Hazard Suit',
      duration: 2,
      priority: 2
    }, {
      id: 3,
      taskId: 'trade',
      label: 'Marketplace Trade',
      duration: 1,
      priority: 3
    }, {
      id: 4,
      taskId: 'train',
      label: 'Train Stats: Reflex',
      duration: 3,
      priority: 4
    }, {
      id: 5,
      taskId: 'repair',
      label: 'Repair: Truck',
      duration: 2,
      priority: 5
    }]),
    _React$useState22 = _slicedToArray(_React$useState21, 2),
    tasks = _React$useState22[0],
    setTasks = _React$useState22[1];
  var _React$useState23 = React.useState(null),
    _React$useState24 = _slicedToArray(_React$useState23, 2),
    draggedId = _React$useState24[0],
    setDraggedId = _React$useState24[1];
  var _React$useState25 = React.useState(null),
    _React$useState26 = _slicedToArray(_React$useState25, 2),
    dragOverId = _React$useState26[0],
    setDragOverId = _React$useState26[1];
  var _React$useState27 = React.useState(null),
    _React$useState28 = _slicedToArray(_React$useState27, 2),
    dragSource = _React$useState28[0],
    setDragSource = _React$useState28[1]; // 'timeline' or 'queue'

  var TIMELINE_H = 24;
  var totalHours = tasks.reduce(function (s, t) {
    return s + t.duration;
  }, 0);
  var overBudget = totalHours > TIMELINE_H;

  // Draggable timeline blocks
  var onTimelineDragStart = function onTimelineDragStart(id) {
    setDraggedId(id);
    setDragSource('timeline');
  };
  var onTimelineDragOver = function onTimelineDragOver(id, e) {
    e.preventDefault();
    setDragOverId(id);
  };
  var onTimelineDrop = function onTimelineDrop(targetId) {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    setTasks(function (prev) {
      var arr = _toConsumableArray(prev);
      var fromIdx = arr.findIndex(function (t) {
        return t.id === draggedId;
      });
      var toIdx = arr.findIndex(function (t) {
        return t.id === targetId;
      });
      var _arr$splice = arr.splice(fromIdx, 1),
        _arr$splice2 = _slicedToArray(_arr$splice, 1),
        moved = _arr$splice2[0];
      arr.splice(toIdx, 0, moved);
      return arr.map(function (t, i) {
        return _objectSpread(_objectSpread({}, t), {}, {
          priority: i + 1
        });
      });
    });
    setDraggedId(null);
    setDragOverId(null);
  };
  var addTask = function addTask(taskType) {
    if (draftLocked) return;
    var newTotal = totalHours + taskType.duration;
    if (newTotal > TIMELINE_H) return; // hard cap
    setTasks(function (prev) {
      return [].concat(_toConsumableArray(prev), [{
        id: Date.now(),
        taskId: taskType.id,
        label: taskType.name,
        duration: taskType.duration,
        priority: prev.length + 1
      }]);
    });
  };
  var removeTask = function removeTask(id) {
    if (draftLocked) return;
    setTasks(function (prev) {
      return prev.filter(function (t) {
        return t.id !== id;
      });
    });
  };
  var moveUp = function moveUp(idx) {
    if (draftLocked || idx === 0) return;
    setTasks(function (prev) {
      var a = _toConsumableArray(prev);
      var _ref9 = [a[idx], a[idx - 1]];
      a[idx - 1] = _ref9[0];
      a[idx] = _ref9[1];
      return a.map(function (t, i) {
        return _objectSpread(_objectSpread({}, t), {}, {
          priority: i + 1
        });
      });
    });
  };
  var moveDown = function moveDown(idx) {
    if (draftLocked || idx === tasks.length - 1) return;
    setTasks(function (prev) {
      var a = _toConsumableArray(prev);
      var _ref0 = [a[idx + 1], a[idx]];
      a[idx] = _ref0[0];
      a[idx + 1] = _ref0[1];
      return a.map(function (t, i) {
        return _objectSpread(_objectSpread({}, t), {}, {
          priority: i + 1
        });
      });
    });
  };
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
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 13,
      color: 'var(--amber)',
      letterSpacing: '0.1em'
    }
  }, "24-HOUR SCHEDULE TIMELINE"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: overBudget ? 'var(--red2)' : 'var(--green)'
    }
  }, totalHours, "h / 24h ", overBudget ? '⚠ OVER BUDGET' : 'used')), /*#__PURE__*/React.createElement("div", {
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
        fontSize: 8,
        color: 'var(--text3)'
      }
    }, h === 0 ? 'NOW' : "+".concat(h, "h"));
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 36,
      background: 'var(--bg4)',
      borderRadius: 2,
      overflow: 'hidden',
      display: 'flex',
      position: 'relative'
    }
  }, tasks.map(function (task, i) {
    var _ZI_ART$tasks;
    var taskDef = ALLOWED_TASKS.find(function (t) {
      return t.id === task.taskId;
    });
    var color = (taskDef === null || taskDef === void 0 ? void 0 : taskDef.css) || (taskDef === null || taskDef === void 0 ? void 0 : taskDef.color) || 'var(--text2)';
    var widthPct = task.duration / TIMELINE_H * 100;
    return /*#__PURE__*/React.createElement("div", {
      key: task.id,
      draggable: true,
      onDragStart: function onDragStart() {
        return onTimelineDragStart(task.id);
      },
      onDragOver: function onDragOver(e) {
        return onTimelineDragOver(task.id, e);
      },
      onDrop: function onDrop() {
        return onTimelineDrop(task.id);
      },
      style: {
        width: "".concat(widthPct, "%"),
        height: '100%',
        flexShrink: 0,
        background: color,
        borderRight: '2px solid var(--bg)',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: 4,
        overflow: 'hidden',
        cursor: 'grab',
        opacity: draggedId === task.id ? 0.5 : 1,
        outline: dragOverId === task.id ? '2px dashed var(--amber)' : 'none',
        transition: 'opacity 0.15s'
      }
    }, (ZI_ART === null || ZI_ART === void 0 || (_ZI_ART$tasks = ZI_ART.tasks) === null || _ZI_ART$tasks === void 0 ? void 0 : _ZI_ART$tasks[task.taskId]) && /*#__PURE__*/React.createElement("span", {
      dangerouslySetInnerHTML: {
        __html: ZI_ART.tasks[task.taskId]()
      },
      style: {
        flexShrink: 0,
        marginRight: 3
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'rgba(255,255,255,0.85)',
        whiteSpace: 'nowrap',
        overflow: 'hidden'
      }
    }, task.label.split(':')[0]));
  }), totalHours < TIMELINE_H && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      background: 'var(--bg4)',
      borderLeft: '1px dashed var(--border2)',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 8
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)'
    }
  }, TIMELINE_H - totalHours, "h free"))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 4,
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)'
    }
  }, "Drag blocks to reorder \xB7 Max 24h \xB7 Tasks run offline in priority order")), /*#__PURE__*/React.createElement("div", {
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
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("span", null, "Priority Queue \u2014 drag or use arrows"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)'
    }
  }, tasks.length, " tasks")), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      overflow: 'auto',
      padding: 8,
      display: 'flex',
      flexDirection: 'column',
      gap: 5
    }
  }, tasks.map(function (task, idx) {
    var _ZI_ART$tasks2;
    var taskDef = ALLOWED_TASKS.find(function (t) {
      return t.id === task.taskId;
    });
    var color = (taskDef === null || taskDef === void 0 ? void 0 : taskDef.css) || (taskDef === null || taskDef === void 0 ? void 0 : taskDef.color) || 'var(--text2)';
    var startHour = tasks.slice(0, idx).reduce(function (s, t) {
      return s + t.duration;
    }, 0);
    return /*#__PURE__*/React.createElement("div", {
      key: task.id,
      draggable: true,
      onDragStart: function onDragStart() {
        return onTimelineDragStart(task.id);
      },
      onDragOver: function onDragOver(e) {
        return onTimelineDragOver(task.id, e);
      },
      onDrop: function onDrop() {
        return onTimelineDrop(task.id);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 10px',
        background: 'var(--bg3)',
        border: "1px solid ".concat(dragOverId === task.id ? 'var(--amber)' : draggedId === task.id ? 'var(--border2)' : 'var(--border)'),
        cursor: 'grab',
        transition: 'all 0.15s',
        opacity: draggedId === task.id ? 0.4 : 1
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        width: 20,
        height: 20,
        borderRadius: '50%',
        border: "1px solid ".concat(color),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: color
      }
    }, idx + 1), (ZI_ART === null || ZI_ART === void 0 || (_ZI_ART$tasks2 = ZI_ART.tasks) === null || _ZI_ART$tasks2 === void 0 ? void 0 : _ZI_ART$tasks2[task.taskId]) && /*#__PURE__*/React.createElement("span", {
      dangerouslySetInnerHTML: {
        __html: ZI_ART.tasks[task.taskId]()
      },
      style: {
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        width: 3,
        height: 24,
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
        fontFamily: 'var(--font-body)',
        fontSize: 13,
        color: 'var(--text)',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }, task.label), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 6,
        marginTop: 2
      }
    }, /*#__PURE__*/React.createElement(Tag, {
      color: color
    }, fmtTime(task.duration * 60)), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 8,
        color: 'var(--text3)'
      }
    }, "Starts +", startHour, "h from now"))), /*#__PURE__*/React.createElement("div", {
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
        width: 20,
        height: 20,
        cursor: 'pointer',
        fontSize: 9,
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
        width: 20,
        height: 20,
        cursor: 'pointer',
        fontSize: 9,
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
        width: 20,
        height: 20,
        cursor: 'pointer',
        fontSize: 9,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }
    }, "\u2715")));
  })))), /*#__PURE__*/React.createElement("div", {
    style: {
      width: 260,
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
  }, ALLOWED_TASKS.filter(function (t) {
    return t.category === 'both' || mode === 'camp' && t.category === 'camp' || mode !== 'camp' && t.category === 'solo';
  }).map(function (taskType) {
    var _ZI_ART$tasks3;
    var color = taskType.css || taskType.color;
    var wouldExceed = totalHours + taskType.duration > TIMELINE_H;
    return /*#__PURE__*/React.createElement("div", {
      key: taskType.id,
      onClick: function onClick() {
        return !wouldExceed && addTask(taskType);
      },
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '7px 10px',
        cursor: wouldExceed ? 'not-allowed' : 'pointer',
        background: 'var(--bg3)',
        border: "1px solid var(--border)",
        opacity: wouldExceed ? 0.7 : 1,
        transition: 'all 0.15s'
      },
      onMouseEnter: function onMouseEnter(e) {
        if (!wouldExceed) e.currentTarget.style.borderColor = color;
      },
      onMouseLeave: function onMouseLeave(e) {
        return e.currentTarget.style.borderColor = 'var(--border)';
      }
    }, (ZI_ART === null || ZI_ART === void 0 || (_ZI_ART$tasks3 = ZI_ART.tasks) === null || _ZI_ART$tasks3 === void 0 ? void 0 : _ZI_ART$tasks3[taskType.icon]) && /*#__PURE__*/React.createElement("span", {
      dangerouslySetInnerHTML: {
        __html: ZI_ART.tasks[taskType.icon]()
      },
      style: {
        flexShrink: 0
      }
    }), /*#__PURE__*/React.createElement("div", {
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
        fontSize: 8,
        color: 'var(--text3)'
      }
    }, fmtTime(taskType.duration * 60))), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: color
      }
    }, wouldExceed ? 'No room' : '+ Add'));
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
      marginBottom: 8
    }
  }, "SCHEDULE SUMMARY"), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Tasks",
    value: tasks.length,
    color: "var(--text)"
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Total time",
    value: fmtTime(totalHours * 60),
    color: overBudget ? 'var(--red2)' : 'var(--amber)'
  }), /*#__PURE__*/React.createElement(InfoRow, {
    label: "Done by",
    value: "+".concat(totalHours, "h from now"),
    color: "var(--text2)"
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border)',
      margin: '8px 0'
    }
  }), !draftLocked ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      width: '100%',
      marginBottom: 6
    }
  }, "Menu"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-amber",
    style: {
      width: '100%'
    },
    onClick: function onClick() {
      return setDraftLocked(true);
    },
    disabled: tasks.length === 0 || overBudget
  }, "Save Draft"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      lineHeight: 1.5
    }
  }, "Lock in the ", totalHours, "/24h schedule to confirm.")) : confirmed ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '8px 10px',
      background: 'rgba(76,175,125,0.15)',
      border: '1px solid var(--green)',
      textAlign: 'center',
      marginBottom: 6,
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--green)'
    }
  }, "\u2713 Schedule Activated"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      textAlign: 'center',
      lineHeight: 1.5,
      marginBottom: 8
    }
  }, "Survivors will execute the queue while offline.", /*#__PURE__*/React.createElement("br", null), "Return in ", fmtTime(totalHours * 60), " for results."), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      width: '100%'
    },
    onClick: function onClick() {
      setConfirmed(false);
      setDraftLocked(false);
    }
  }, "Edit Schedule")) : /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '5px 8px',
      background: 'var(--bg4)',
      borderLeft: '3px solid var(--amber)',
      marginBottom: 8,
      fontFamily: 'var(--font-mono)',
      fontSize: 9,
      color: 'var(--amber)'
    }
  }, "\u26A0 Draft locked. Confirm or revert below."), /*#__PURE__*/React.createElement("button", {
    className: "btn",
    style: {
      width: '100%',
      marginBottom: 6
    },
    onClick: function onClick() {
      return setDraftLocked(false);
    }
  }, "Revert to Edit"), /*#__PURE__*/React.createElement("button", {
    className: "btn btn-green",
    style: {
      width: '100%'
    },
    onClick: function onClick() {
      setConfirmed(true);
      if (window.ZI.emitAction) {
        window.ZI.emitAction('task', Math.max(1, tasks.length));
      }
    }
  }, "Confirm Schedule"), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 8,
      fontFamily: 'var(--font-mono)',
      fontSize: 8,
      color: 'var(--text3)',
      lineHeight: 1.5
    }
  }, "Tasks will lock & run while offline.")))));
}
Object.assign(window, {
  ScheduleScreenV2: ScheduleScreenV2
});