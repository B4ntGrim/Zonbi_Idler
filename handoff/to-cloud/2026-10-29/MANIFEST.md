# Files sent to the cloud — 2026-10-29 (proposals + GitHub sync)

Rule (Sam, Oct 24): every working file that leaves this computer for the cloud is duplicated here first.

| File | Sent to | Why |
|---|---|---|
| e-inventory.tsv | Claude cloud workspace (comparison only) | Git hash of every tracked/untracked file on E: (1,860), compared with branch backup/2026-10-28 to find what changed |
| files-part1.txt / github-sync-part1.tar | Claude cloud workspace, then GitHub B4ntGrim/Zonbi_Idler `main` and `backup/2026-10-29` | The 338 files changed or new since backup/2026-10-28 (art from the Oct 28 sessions, reports, tests, tools, game code, reference docs) |
| files-part2.txt / github-sync-part2.tar | Same | Files written after the first inventory (Oct 29 reports, handoff, index, CODE_STATE) |
| dist/ files (individually) | Claude cloud workspace, then GitHub `gh-pages` | The compiled web build for https://b4ntgrim.github.io/Zonbi_Idler/ |

Excluded as before: the earlier handoff/to-cloud/*/*.tar and *.tar.gz bundles (copies of files already backed up), and `dist/` (git-ignored; published on `gh-pages`).

Earlier transfers from the Oct 28 evening session (not duplicated, already deleted): `reports/hosting-check-2026-10-28/runtime-snapshot.tar` (deleted at Sam's request), `deploy-tmp.tar`, `dist-changed.tar` and dist manifests (temporary copies of the runtime files used to test hosting and build `gh-pages`).
