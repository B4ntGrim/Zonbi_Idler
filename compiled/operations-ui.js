"use strict";

function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
// operations-ui.jsx — Operations page shown on the Schedule tab (Sam, Oct 29: build reference/operations-schedule-proposal.md).
// Three sections: Now and next · Plan (activity catalog with availability) · Base schedule. Buttons open the screen
// that owns an activity; the one change made here is Camp Leader duty assignment (ZI.opsAssign / ZI.opsUnassign). Proposed activities are labeled "Design proposal" and cannot be selected.
// The previous mock timeline (ScheduleScreenV2 in screens-v2b.jsx) is kept in the code, unused, for rollback.
function OperationsScreen(_ref) {
  var mode = _ref.mode,
    setScreen = _ref.setScreen;
  var ZI = window.ZI;
  var _React$useState = React.useState(0),
    _React$useState2 = _slicedToArray(_React$useState, 2),
    tick = _React$useState2[1];
  React.useEffect(function () {
    var t = setInterval(function () {
      return tick(function (n) {
        return n + 1;
      });
    }, 5000);
    return function () {
      return clearInterval(t);
    };
  }, []);
  var _React$useState3 = React.useState(true),
    _React$useState4 = _slicedToArray(_React$useState3, 2),
    showProposals = _React$useState4[0],
    setShowProposals = _React$useState4[1];
  var _React$useState5 = React.useState(null),
    _React$useState6 = _slicedToArray(_React$useState5, 2),
    dutyMsg = _React$useState6[0],
    setDutyMsg = _React$useState6[1];
  var now = ZI.opsNow(mode),
    catalog = ZI.opsCatalog(mode);
  var isCamp = mode === 'camp',
    accent = isCamp ? 'var(--green)' : 'var(--amber)';
  var go = function go(screen) {
    return screen && setScreen && setScreen(screen);
  };
  var badge = function badge(st) {
    var col = st.key === 'available' ? 'var(--green)' : st.key === 'proposal' ? 'var(--text3)' : st.key === 'busy' ? 'var(--blue)' : 'var(--amber)';
    return /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 9,
        color: col,
        border: "1px solid ".concat(col),
        padding: '1px 6px',
        letterSpacing: '0.06em',
        whiteSpace: 'nowrap'
      }
    }, st.label);
  };
  var H = function H(_ref2) {
    var children = _ref2.children,
      sub = _ref2.sub;
    return /*#__PURE__*/React.createElement("div", {
      style: {
        margin: '18px 0 8px'
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-title)',
        fontSize: 16,
        color: accent,
        letterSpacing: '0.08em'
      }
    }, children), sub && /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text3)',
        marginTop: 2
      }
    }, sub));
  };
  var row = function row(r) {
    return /*#__PURE__*/React.createElement("div", {
      key: r.id,
      className: "panel",
      style: {
        padding: '8px 10px',
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        flexWrap: 'wrap'
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-body)',
        fontSize: 14,
        color: 'var(--text)',
        minWidth: 150
      }
    }, r.label), /*#__PURE__*/React.createElement("span", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text2)',
        flex: '1 1 200px',
        minWidth: 0
      }
    }, r.detail), r.screen && /*#__PURE__*/React.createElement("button", {
      className: "btn",
      onClick: function onClick() {
        return go(r.screen);
      }
    }, "Open"));
  };
  var groups = [['field', 'Field operations'], ['base', 'Base and return operations']];
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: '100%',
      overflow: 'auto',
      padding: '16px 18px 60px'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 980,
      margin: '0 auto'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'baseline',
      gap: 10,
      flexWrap: 'wrap'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-title)',
      fontSize: 24,
      color: 'var(--text)'
    }
  }, "Operations"), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text3)'
    }
  }, isCamp ? 'Camp Leader: assignments to camp survivors and facilities' : 'Solo Survivor: your own plan, no camp roster')), /*#__PURE__*/React.createElement(H, {
    sub: "What is running now and what needs you. Updates every few seconds."
  }, "Now and next"), now.attention.length > 0 && /*#__PURE__*/React.createElement("div", {
    className: "panel",
    style: {
      padding: '8px 10px',
      marginBottom: 8,
      borderColor: 'var(--amber)'
    }
  }, now.attention.map(function (t, i) {
    return /*#__PURE__*/React.createElement("div", {
      key: i,
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--amber)'
      }
    }, "\u26A0 ", t);
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, now.field.map(row)), now.camp.length > 0 && /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      marginTop: 6
    }
  }, now.camp.map(row)), /*#__PURE__*/React.createElement(H, {
    sub: "Choose an activity; Open takes you to the screen that runs it. Design proposals are not playable yet."
  }, "Plan"), /*#__PURE__*/React.createElement("label", {
    style: {
      fontFamily: 'var(--font-mono)',
      fontSize: 11,
      color: 'var(--text2)',
      display: 'inline-flex',
      gap: 6,
      alignItems: 'center',
      marginBottom: 6
    }
  }, /*#__PURE__*/React.createElement("input", {
    type: "checkbox",
    checked: showProposals,
    onChange: function onChange(e) {
      return setShowProposals(e.target.checked);
    }
  }), " Show design proposals"), groups.map(function (_ref3) {
    var _ref4 = _slicedToArray(_ref3, 2),
      gid = _ref4[0],
      gname = _ref4[1];
    var items = catalog.filter(function (a) {
      return a.group === gid && (showProposals || !a.proposal);
    });
    if (!items.length) return null;
    return /*#__PURE__*/React.createElement("div", {
      key: gid,
      style: {
        marginBottom: 10
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text2)',
        letterSpacing: '0.14em',
        margin: '8px 0 6px'
      }
    }, gname.toUpperCase()), /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 8
      }
    }, items.map(function (a) {
      var st = ZI.opsActivityStatus(a, mode);
      return /*#__PURE__*/React.createElement("div", {
        key: a.id,
        className: "panel",
        style: {
          padding: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: 5,
          opacity: a.proposal ? 0.65 : 1
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
          color: 'var(--text)',
          flex: 1
        }
      }, a.name), badge(st)), /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text2)'
        }
      }, a.result), a.designOrder && /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--amber)'
        }
      }, "Design order: ", a.designOrder, " of 3 (cooking \u2192 weapon upkeep \u2192 laundry)"), !a.proposal && /*#__PURE__*/React.createElement("div", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          color: 'var(--text3)'
        }
      }, "Who: ", a.who, " \xB7 Needs: ", a.needs, " \xB7 While away: ", a.away), a.screen && !a.proposal && (!isCamp || a.screen !== 'solo-main') && /*#__PURE__*/React.createElement("button", {
        className: "btn",
        style: {
          alignSelf: 'flex-start'
        },
        onClick: function onClick() {
          return go(a.screen);
        }
      }, "Open"));
    })));
  }), /*#__PURE__*/React.createElement(H, {
    sub: isCamp ? 'Camp duties staffed by your survivors. Assign one survivor per duty.' : 'Your upkeep at your base or forward camp.'
  }, "Base schedule"), isCamp ? function () {
    var duties = ZI.opsCampDuties(),
      busy = ZI.opsRouteBusy(),
      roster = ZI.SQUAD_ROSTER || [];
    var staffed = duties.reduce(function (n, d) {
        return n + d.whoIds.length;
      }, 0),
      cap = ZI.opsDutySlots();
    var assignedTo = {};
    duties.forEach(function (d) {
      return d.whoIds.forEach(function (id) {
        assignedTo[id] = d.label;
      });
    });
    var assign = function assign(svId, jobId) {
      var r = svId ? ZI.opsAssign(svId, jobId, mode) : {
        ok: true
      };
      setDutyMsg(r.ok ? null : r.reason);
      tick(function (n) {
        return n + 1;
      });
    };
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--text2)'
      }
    }, "Duty slots in use: ", staffed, " / ", cap, " (more with leader level). A survivor holds one duty at a time; survivors away on a route run cannot take one."), dutyMsg && /*#__PURE__*/React.createElement("div", {
      role: "status",
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        color: 'var(--red2)'
      }
    }, "\u26A0 ", dutyMsg), duties.map(function (d) {
      return /*#__PURE__*/React.createElement("div", {
        key: d.id,
        className: "panel",
        style: {
          padding: '8px 10px',
          display: 'flex',
          gap: 10,
          alignItems: 'center',
          flexWrap: 'wrap'
        }
      }, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-body)',
          fontSize: 14,
          color: 'var(--text)',
          minWidth: 170
        }
      }, d.label), /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--text2)',
          flex: '1 1 160px'
        }
      }, d.profession, " \xB7 ", d.xpPerHour, " XP per game hour"), d.built ? d.whoIds.length ? /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--green)'
        }
      }, d.who.join(', '), d.whoIds.some(function (id) {
        return busy[id];
      }) ? ' (also on a route!)' : ''), /*#__PURE__*/React.createElement("button", {
        className: "btn",
        onClick: function onClick() {
          d.whoIds.forEach(function (id) {
            return ZI.opsUnassign(id, mode);
          });
          setDutyMsg(null);
          tick(function (n) {
            return n + 1;
          });
        }
      }, "Unassign")) : /*#__PURE__*/React.createElement("select", {
        "aria-label": 'Assign a survivor to ' + d.label,
        value: "",
        onChange: function onChange(e) {
          return assign(e.target.value, d.id);
        },
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          background: 'var(--bg)',
          color: 'var(--text)',
          border: '1px solid var(--border)',
          padding: '4px 6px'
        }
      }, /*#__PURE__*/React.createElement("option", {
        value: ""
      }, "Assign\u2026"), roster.map(function (s) {
        return /*#__PURE__*/React.createElement("option", {
          key: s.id,
          value: s.id,
          disabled: !!busy[s.id]
        }, s.name, busy[s.id] ? ' (on a route)' : assignedTo[s.id] ? ' (moves from ' + assignedTo[s.id] + ')' : '');
      })) : /*#__PURE__*/React.createElement("span", {
        style: {
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
          color: 'var(--amber)'
        }
      }, d.status));
    }), /*#__PURE__*/React.createElement("div", {
      style: {
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--text3)'
      }
    }, "Duties earn their profession XP while you are away (24-hour offline cap). Proposed camp chores (cooking, then weapon upkeep, then laundry) are listed under Plan as design proposals."));
  }() : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6
    }
  }, catalog.filter(function (a) {
    return a.group === 'base' && !a.proposal;
  }).map(function (a) {
    return row({
      id: 'b:' + a.id,
      label: a.name,
      detail: ZI.opsActivityStatus(a, mode).label + ' · ' + a.result,
      screen: a.screen
    });
  }))));
}
Object.assign(window, {
  OperationsScreen: OperationsScreen
});