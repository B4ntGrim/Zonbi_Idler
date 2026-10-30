# Files sent to the cloud — 2026-10-30 (daily GitHub sync)

Rule (Sam, Oct 24): every working file that leaves this computer for the cloud is duplicated here first.

| File | Sent to | Why |
|---|---|---|
| e-inventory.tsv | Claude cloud workspace (comparison only) | Git hash of every tracked/untracked, non-ignored file on E: (2,004), compared with branch `backup/2026-10-29-look` (the newest backup) to find what changed |
| files.txt / github-sync.tar.gz | Claude cloud workspace, then GitHub B4ntGrim/zed_idler branch `backup/2026-10-30` | The 135 files new (111) or changed (24) on E: since `backup/2026-10-29-look`: Oct 30 reference docs, SS-tier zombie and crafting-recipe art, character-creation sprites, game code, tests, balance-sim tools |

Not applied to the backup: 32 files that exist on `backup/2026-10-29-look` but are no longer on E: (old pre-change copies under reports/ and handoff/to-cloud/2026-10-24/source-snapshot.tar.gz). The backup is an overlay, so they stay on the branch.

Excluded as before: handoff/to-cloud/*/*.tar and *.tar.gz bundles, and `dist/` (git-ignored).
