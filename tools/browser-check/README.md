# Headless browser checks (Claude Design, Oct 13)

Loads `Zombie Idler v2 - TEST SAVE.html` in headless Chromium (Playwright), clicks through the real screens and checks what a player would see. Used for the FX4 speed-shot follow-up and RB1.

- `harness.js` serves the game files from a local copy and the three CDN libraries (React 18.3.1, ReactDOM 18.3.1, Babel standalone 7.29.0) from local npm copies, because the cloud workspace can't reach unpkg. Paths at the top (`WEB`, `NM`) point at that copy.
- `fx4-rb1-checks.js` starts a new game in a fresh test storage, opens Wandering, then: equips an Adrenaline Shot, uses it, checks the shared buff store and the pace label, waits 45 s; then checks the RB1 buttons and Run Back.
- It never touches a real save: the browser profile is new and empty each run. The real-save fingerprint check still has to be done on Sam's machine.
