# Historical review: weapon frame cards — 27 October 2026

This report documents an earlier review of a standalone Weapons-page presentation. Sam later clarified that the Weapons page was not approved; it was removed. Current cards are proposed-only previews under **Crafting → Proposed frame cards**. The screenshots and validation below are historical evidence for the earlier presentation and do not verify the current Crafting integration. Missing stats remain **Not defined**.

## Delivered records

| Roster | Records |
|---|---:|
| Current weapons and Throw-slot supplies | 30 |
| Regular axe designs | 100 |
| Unique concepts | 12 |
| Two-piece set concepts | 3 |
| Prior primary/sidearm concepts | 7 |
| Relic weapon candidates | 2 |
| Archived Unity weapon prototypes | 10 |
| Total | 164 |

The 12 Uniques comprise eight axes (the existing six plus Danielle/Raquelle) and Night Current, Hushline, Lamplighter and Duskplate. All 299 source axe records remain in the handoff source. The exporter selects 100 regular records across six sections and adds the six named source Uniques without duplicates.

## Use

Current access: open **Crafting → Proposed frame cards**. The old Weapons navigation, Stockpile links, and `#weapons/...` routes have been removed. Recipe detail panels may link to matching previews at `#crafting/proposed/<record-id>`.

## Historical validation

`validation.json` records the successful isolated Chromium browser review:

- Every one of the 164 IDs rendered its own detail page.
- Search, roster filtering, empty results, and clear-filter recovery were exercised.
- Pair links, component links, browser Back, reload, unknown IDs and both HTML entry pages were exercised. The full-page sweep also rendered both Relic records and their base-weapon links.
- Current damage values were preserved; null/undefined display as Not defined; actual zero stays zero.
- Unique placeholders did not acquire invented damage or attribute values. All three sets reference two distinct existing catalog records.
- Opening a stored weapon's detail card preserved the test stash and loadout.
- Catalog record generation did not change equipment definitions or storage.
- No browser page errors. Desktop page width remained within the viewport.
- The former JSX entry files compiled; this does not validate the renamed and integrated Crafting view.
- The CB1 regression result is unrelated to the current frame-card placement.

The browser used a fresh profile and the test-save shim. Pinned React/ReactDOM/Babel copies were supplied locally to the review browser because its network could not resolve the CDN; production dependency URLs were retained.

Screenshots: `overview.png`, `matilda.png`, `danielle-raquelle-set.png`, `flamethrower.png`. Concepts are reference content; the new set mechanics, off-hand support, attribute assignments and numeric balancing are not implemented gameplay.
