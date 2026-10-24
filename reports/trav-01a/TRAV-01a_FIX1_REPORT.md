# TRAV-01a fix 1 — controller focus in the zone panel (PF11) — Code report, Oct 22

Decided by Sam, Oct 22 (option A). Instructions relayed by Sam from the Director.

## Result

All acceptance checks pass except **check 7**. Check 7 can't pass as written, because a locked rule says a controller never opens the bottom sheet. Sam needs to make one choice (see "Decision needed").

**TRAV-01a: NOT CLOSED.** It closes after Sam's choice on check 7 and his smoke re-test.

## Acceptance checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 1 | Keyboard only: own cell, Enter → focus on first enabled action; move to Scout; Enter → scouts drop by 1 | **PASS** | Browser F1: focus on Loot (Travel greyed "already here"), Scout 5 → 4; F4: focus stays on Scout |
| 2 | Up/Down cycle every button and wrap; focused one has the blue outline | **PASS** | F2: Down visits all 7 and returns to the start; Up wraps the other way; only the focused button has `2px #7fe0ff` |
| 3 | Focus on a greyed action + Enter → nothing; reason stays | **PASS** | F3: Travel on own cell, Enter: position unchanged, "You're already here." still shown, panel open |
| 4 | Focus in the panel: arrows don't move the map highlight | **PASS** | F6: highlight on the same cell after Left, Right, Down, Up |
| 5 | Escape closes; highlight back on the same cell | **PASS** | F5 |
| 6 | Far zone by keyboard → focus on Close | **PASS** | F9: all five actions greyed, focus on Close; Enter on Close closes and keeps the highlight there |
| 7 | Same flow in the bottom sheet (phone-size window) | **NOT MET AS WRITTEN** | In a phone-size window, a keyboard confirm opens the **side panel**, not the sheet (T13 rule, see below). The same flow passes there: F8, 390×520 window: focus on Close scrolled into view (panel scrolled 92 px), Scout runs, focus kept |
| 8 | Mouse click/hover and touch unchanged | **PASS** | All 33 existing TRAV-01a browser checks pass (hover preview, click panel, touch sheet, tap outside, swipe down, phone-size click sheet). F7: a mouse click on the map clears panel focus and arrows move the map again |
| 9 | All suites pass (baseline 662/662); browser check passes twice | **PASS** | Node suites **672/672** (662 + 10 new). Browser `trav01a-checks.js` **49/49 on run 1 and run 2** |

Also checked: during the tutorial step "Hover each option", moving controller focus over the five actions completes the step, the same as mouse hover (F-tut, run with the tutorial left on: PASS).

## Decision needed (check 7)

`openSoloPanel` decides the layout: `setSheetMode(p === 'touch' || p === 'pen' || (p !== 'controller' && narrow))`. TRAV-01a T13 locked "a controller confirm opens the panel beside the map." So in a narrow window, the controller path never reaches the bottom sheet. The focus code is the same in both layouts (one `renderZonePanel`), but no player can reach "focus inside the sheet" today.

- **Option 1: keep T13.** Accept the phone-size side-panel run (F8) as check 7. No code change.
- **Option 2: a controller in a narrow window (< 760 px) also opens the sheet.** This removes `p !== 'controller' &&` from one line and changes one existing browser check, which then re-runs. This changes T13, so it needs Sam.

Code's note for the Director: at 390 px wide the side panel covers most of the map (see `fix1/trav01a-fix1-phone.png`). Option 2 would match the touch layout. The choice is Sam's.

## Files changed

| File | Change |
|---|---|
| `screens-v3.jsx` | Solo Traversal only. `panelFocus` state. The action list moved into `zoneActs(c)`, shared by the panel and the controller. New `panelItems`, `focusOf`, `runPanelItem` and `movePanelFocus`, plus two small effects (pin focus by id; scroll it into view). The controller handlers route Up/Down/confirm/back to the panel while it has focus. A map pointer press clears focus. Focus outline and `data-panel-focus` on the Fort, the five actions, Start wandering and Close. The Camp Leader modal is untouched |
| `Zombie Idler v2.html`, `Zombie Idler v2 - TEST SAVE.html` | `screens-v3.jsx` cache-bust `?v=1792640900000` → `?v=1792681200000`, so a browser loads the new file |
| `tests/trav-01a.test.js` | +10 source checks (F1–F9, F-out). The check-11 action-list locator now points at `zoneActs()`, because the list moved and the check itself is unchanged. 57 → 67 checks |
| `tools/browser-check/trav01a-fix1-checks.js` | New. 16 keyboard-only browser checks on a fresh test save |
| `tools/browser-check/trav01a-checks.js` | Runs the fix-1 checks at its end (one command, 49 checks) |
| `CODE_STATE.md` | New section "TRAV-01a fix 1 implementation facts (Oct 22)" |
| `archive/pre-trav01a-fix1-oct22/` | Pre-change copies of `screens-v3.jsx`, both HTML pages, `trav-01a.test.js`, `trav01a-checks.js`, `CODE_STATE.md` |
| `reports/trav-01a/fix1/` | Browser results for run 1 and run 2, desktop and phone screenshots, this report |

Not changed: what any action does, game rules, save keys or the save version, other screens' controller support.

## One choice Code made (please confirm)

Moving controller focus onto Travel, Loot, Scout, Hide or Make Camp counts as "hovering" it for the tutorial step "Hover each option". Without this, a controller player can't finish that tutorial step. This is the same call the mouse hover and the existing `onFocus` handler already make.

## How the browser checks were run

The shell on Sam's computer can't run Chromium, so the build was staged into the cloud workspace. There it ran headless with `tools/browser-check/harness.js` on the TEST SAVE page, in fresh test storage, and never touched a real save.

## For Sam's smoke test

Reload the TEST SAVE page (the new cache-bust version loads the fix). On Traversal: arrows to a zone, Enter. Up/Down to move, Enter to use, Escape to close.
