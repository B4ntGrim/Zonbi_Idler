# Addendum — Oct 27 (morning voice session, Sam)

**Source:** claude.ai voice chat "Getting started", Oct 27 ~02:00–10:40 (Sam with the Creative Director). Written up and applied Oct 27, 11:0x, on Sam's request ("run the addendum scheduled for today now").
Docs only; no game code. Propagate per CREATIVE_DIRECTION_RULES §5. Where an item contradicts an earlier decision, it is recorded as Sam's decision with an `[OPEN]` conflict note.

## Block 1 — Fishing activity (FISH-01) `[DECIDED Oct 27, Sam]`
- FA1 Fishing lives in Traversal: travel to a water square; its actions menu offers **Fish**. Keep it simple: no standing policy.
- FA2 The screen says "You are now fishing". The player can cancel at any time.
- FA3 Tick-based: a clock ticks at a set frequency; every tick is a fresh roll against the fish tiers. **Supersedes** the per-cell rule "N pulls per visit, then rests one game day" (POI brief).
- FA4 The square's water type decides which fish tiers can be caught.
- FA5 Gear upgrade path rod → net → traps. Rod = base roll; net = more catches per tick; traps keep rolling after the player leaves the square.

## Block 2 — Fish tiers
- FT1 `[DECIDED]` More than four fish tiers, topped by **Legendary**.
- FT2 `[DECIDED, starting value]` Legendary chance **0.1% per roll** (1 in 1,000); tune in playtest. Supersedes the 3% `[PROPOSED]` share in FOOD-01.
- FT3 `[PROPOSED]` Tier list: Junk · Common · Uncommon · Rare · Prized · Mutated · Legendary.

## Block 3 — Fish preparation `[DECIDED Oct 27, Sam]`
- FP1 The player prepares caught fish (not auto-processed).
- FP2 Descaling knife: **pocket item** (not the Melee slot); full-nutrition and bulk preparation.
- FP3 Without the knife the fish gives less nutrition; the loss **shrinks as cooking skill rises** (chosen over a fixed penalty). The knife is always best.
- FP4 The knife wears down with use (stress speeds wear, existing rule).
- Conflict `[OPEN]`: the spec has no Cooking skill (16 skills). Sam picks: Foraging, or a new Cooking skill.

## Block 4 — Fishing gear `[DECIDED Oct 27, Sam]`
- G1 Gear: rod, net, traps, descaling knife, **waders** (boots; deeper water, better tiers), **tackle box** (pocket; holds bait and lures; improves the rod), **lures and bait** (consumables; better odds; rare bait from sirens), **fisher's hat** (comfort; lowers stress; small loot-quality bonus).
- G2 Every recipe uses some combination of metal, wood and plastic. Mixes approved: rod (wood, metal hook, plastic reel) · net (plastic, wood frame) · traps (wood, metal wire, plastic float) · knife (metal, wood handle) · waders (plastic, metal clasps) · tackle box (plastic, metal latch) · lures (metal, plastic) · fisher's hat (wood fibre or straw, plastic brim).
- G3 Named sub-parts are their own craftable **components** (raw → component → finished); e.g. metal clasps and waders are two items.

## Block 5 — Sunken Blade / Lady of the Lake `[DECIDED Oct 27, Sam]`
- SB1 The maiden's quest unlocks after **10 fishing spots** discovered (spans several maps on purpose).
- SB2 She appears at the tenth spot discovered.
- SB3 She mistakes the survivor for a young squire and asks them to seek the sword of the lake.
- SB4 Gift her **five legendary fish** → she gives the quest for the Sunken Blade. Supersedes the "50 water visits" trigger (PARKED.md) and the earlier same-session "five legendaries caught" counter.
- SB5 Scene: the light fades; the pond shows a rock with a sword in it; description and dialogue box at the bottom; the text suggests pulling the blade.
- SB6 "Leave it" option: the blade waits at that same pond and appears in that square's Traversal actions menu. (Closes the PARKED open question about a real choice.)
- SB7 **Broken Crown** (Helmet slot). Wearing it guarantees the blade comes out unbroken and shiny, at a quality tier. Without it, the rusted claymore (restore before use, as before).
- SB8 With the crown, quality rolls from the weapon quality categories (Common, Uncommon, Rare, Unique, Relic). Max Discovery guarantees at least Rare; odds then Rare > Unique > Relic.
- SB9 Other gear is optional (regular gear, not a set) and pushes the odds toward Relic through loot-quality bonuses.
- SB10 Loot quality % has two stacking sources: Discovery skill level, and clothing with its own loot-quality % stat. Clothing never raises Discovery past its max.
- SB11 Broken Crown sources: pass the maiden's **Command** check; fail and fight her (winning does not guarantee the crown); or seek it at a random lake POI, which the sirens guard or hint at.

## Block 6 — Naga Sirens and Black Haven `[DECIDED Oct 27, Sam]`
- NS1 Other "ladies of the lake" are Naga Sirens, tied to the **Black Haven Collective**, which depends on them for information.
- NS2 A hidden background script runs predetermined events between Black Haven and siren locations, **round-robin**. Faction and siren pawns each have their own system, joined by these events. Players never see the system, only its effects.
- NS3 Black Haven gives water quests (find supplies around lakes); players fishing there can meet sirens.
- NS4 Encounters depend on Black Haven standing. When the dialogue box appears while fishing: **Diplomat** check by level.
- NS5 Pass: a trade (information or rare bait for part of the catch) plus a hint about the Lady. Fail: they spoil the fishing for a while and disappear.

## Block 7 — Diplomat XP `[DECIDED Oct 27, Sam]`
- DX1 Diplomat (already one of the 16 skills) gains XP from trading, negotiating and successfully talking past NPC encounters. Many sources are fine.
- DX2 XP on successes only; failed checks give none.
- Open: level cap; whether a trade gives both Trading and Diplomat XP.

## Block 8 — Cooking stations and materials (FOOD-02)
- CS1 `[CONCEPT Oct 27]` Stations smoker, cook basin and kettle pot are not built; each needs its own art and is clickable in the crafting/cooking menu. Spoilage is tackled through them.
- CS2 `[DECIDED Oct 27]` Metal and wood each get their own balance; wood is more abundant than metal.
- CS3 `[PROPOSED Oct 27, Sam]` **Plastics** as a material. `[OPEN]` a seventh base material, or replacing one of the six.

## Block 9 — Animation (ANIM-01) `[CONCEPT Oct 27, Sam]`
- AN1 Main character is a retro pixel-style sprite; size not decided. The game moves to Unity later.
- AN2 Loot pickup animation: bend at the waist (not a squat), lean in, grab the item off the ground.
- Held for review alongside the team's uploads before any build.

## Handoff
See `DESIGN_HANDOFF.md` (Oct 27).
