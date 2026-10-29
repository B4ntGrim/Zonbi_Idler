# Oct 22 decisions — WPN-02, PF13, ROUTE-01, ALC-01, PERK-01 (recorded Oct 29)

**Status:** Decisions record. `[DECIDED Oct 22]` items are Sam's; `[PROPOSED]` numbers wait for the simulation audit; `[CONCEPT]` and `[PARKED]` are not scheduled.
**Source:** Google Doc "Zonbi Idler — Oct 22 instruction blocks for Code" (Creative Director, relayed by Sam). Block 3 (read-only questions) was answered in `reports/oct22-readonly/READONLY_REPORT.md`; Blocks 1, 2 and 4 were never filed. They are filed here on Oct 29 because most of the sections they edit (WPN-02 slot list, PF13 §2–§5 trait/noise/scent/pity text, ALC-01, PERK-01, the ROUTE-01 horse rules) do not exist in `reference/`; this file is the single home until those briefs are written. No game code changed.

## Block 1 — WPN-02 revision
1. **Slots** `[DECIDED Oct 22]`: Rig stays Rig (the chest rig; keeps its pockets); remove any "Rig renamed Ring" wording, including PERK-01. **Ring** is a new slot, role `[OPEN]`. **Off-hand** is a new slot for shields and light blades; two-handed weapons block it. Neither slot is built until the Block 3 answers are reviewed (`reports/oct22-readonly/`). Note: the Oct 26 paperdoll (Addendum 11) added **Legs**; Ring and Off-hand are not in that list yet `[OPEN]`.
2. **Shop** `[DECIDED Oct 22]`: the Market tab is called **Shop** in every document. (Done in code Oct 27: the Shop replaced the Market tab.)
3. **Prototypes** `[DECIDED Oct 22]`: prototypes never drop (remove "very rare" / "cannot drop" from the weapons draft §2). The sonic emitter, gravity hammer and field projector are sold in the Shop for RMAT; the listing stays hidden until the Concordance has been introduced. *Why:* the tech is theirs; an early listing spoils the story.
4. **Faction weapons** `[DECIDED Oct 22]`: rank unlocks the listing, RMAT pays for it. Keep the Known, Trusted and Honored gates. All six factions, equal power. *Why:* standing gates the weapon, never randomness; the price gives RMAT a use.
5. **Katana tiers** `[DECIDED Oct 22]`: decorative, training (hardwood), forged, master-forged. The **practice sword** is a separate item: a 2×4 shaped into a sword.
6. **Silverglass** `[DECIDED Oct 22]`: a shatter leaves the shield broken; a workshop repairs it. Never destroyed.
7. **Wind-runner** `[DECIDED Oct 22]`: the harness uses the Belt slot. "Fire while moving" = no attack-speed penalty in Travel encounters. The shotgun waits on AMMO-12.
8. **Silent Hunter** `[DECIDED Oct 22]`: Travel noise −1 (floor 1). During Travel, pity builds at half speed (+2.5% per miss, starting value). *Why:* a foot-build set; the e-bike is already at noise 1.
9. **Batteries** `[CONCEPT]`: charged by the camp Generator (Block 4).
10. **RMAT source** `[DECIDED Oct 22]`: RMAT is earned in-game only, never sold for real money. *Why:* premium game (lead brief §5); selling RMAT would make every RMAT purchase pay-to-win. Also recorded in `zed-idler-design-lead-brief.md` §5.2 (see the Oct 29 note there).

## Block 2 — PF13 additions (Traversal pushback; PF13 is in `playtest-findings-oct15.md`)
- **§2 Traits** `[DECIDED Oct 22]`: Night Walker is active at night. Day Sleeper is renamed **Sun Stalker**, active by day. *Why:* "Day Sleeper" reads as "sleeps by day". Both depend on day/night (Block 3 Q4; CLOCK-01 now provides the clock).
- **§3 Noise** `[DECIDED Oct 22]`: a cell's noise is the highest current action, not a sum. Travel floor 1; only Hide reaches 0. Noise 4 comes from the scent bonus (Sniffer and Tracker only), a Howler raising its cell by 1, or firearms (once AMMO-12 is unparked). A running camp Generator sets camp noise to 2 `[PROPOSED]`.
- **§3a Scent** `[DECIDED Oct 22; numbers are starting values]`: a yes/no flag per cell, clears after 6 game hours. Set by the horse, Loot, cooking at camp, and an injured survivor (HP threshold `[PROPOSED]`). Cleared by the timer, or by Hide **when the Hide action ends**. Effects (Sniffer and Tracker only): noise +1 in a scented cell (max 4); a scented cell at noise 0 rolls as noise 1 (the one exception to "noise 0 never rolls"). A Tracker next to a scented cell can move into it. Echo ignores scent. *Why:* noise means "here now", scent means "was here".
- **§4 Trait encounter chance:** unchanged at 0, 10, 20, 35, 45% (noise 0–4); noise 4 is now reachable.
- **§5 Pity** `[DECIDED Oct 22]`: the 75% cap applies to the total chance; the bonus adds at most +30% at noise 4. A cleared cell resets the counter. The "hop through a cleared cell" exploit is a named check for the simulation audit. Silent Hunter halves pity gain during Travel.

## Block 4 — ROUTE-01, ALC-01, PERK-01
- **ROUTE-01** `[DECIDED Oct 22]`: a horse dies only from malnourishment; its cargo drops in the cell. A new horse comes from a Wandering encounter or from looting a cell (optional `[PROPOSED]`: a horse for sale at the Hearthguard Fort as one guaranteed source). The unicorn never dies and **never eats**; kibble is spent only to teleport. Teleport cost `[PROPOSED]`: K = 2 + ceil(d × 0.5) as data-table values `kibble_base_cost` and `kibble_per_cell` (distance metric per Block 3 Q7); optional half cost when the target is camp `[PROPOSED]`.
- **ALC-01** `[DECIDED Oct 22]`: booze daily cap 10. Dependence pity chance capped at **50%** (data-table value). *Why:* heavy drinking stays risky; the daily cap already limits exposure. Drunken Brawler is renamed **Saloon Drunk** and is `[PARKED]`. Platform watch `[PARKED]` until mobile prep: App Store / Google Play rating questions on alcohol and underage players.
- **PERK-01** `[DECIDED Oct 22]`: picks are banked with a badge showing the count; the player sets a build preset; unspent picks are made automatically after 3 game days `[PROPOSED]`. Remove the Rig-to-Ring line. Note: STAT-02 (Oct 28) now banks stat picks (`pending` in `zi_prog_v1`); whether PERK-01 is the same system or a later perk layer is `[OPEN]`.
- **Camp fixtures** `[CONCEPT]`: filed as `parked/camp-01-fixtures-draft.md`.
- **Pity principle** `[PROPOSED]`: see `parked/camp-01-fixtures-draft.md` (companion notes). Goes into the spec only once locked.
- **Cheap animation rules** `[PROPOSED]` (open items in `DESIGN_HANDOFF.md` until a UI batch uses them): a soft ripple on a grid cell when noise rises; a small trait icon over a zombie once its trait is known; the vehicle sprite moving along the route line; a brief screen sway when the survivor is drunk.

## Open (from the Oct 22 handoff)
The Ring role; perk tier thresholds; a guaranteed horse source (optional); every `[PROPOSED]` number (simulation audit).
