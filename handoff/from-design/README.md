> **Retired Oct 22:** no more exports from Claude Design. Director instructions arrive in chat; Code applies them directly. Code's step and completion reports now go in `reports/<batch-id>/` (example: `reports/trav-01a/`). Existing files here stay where they are.

# handoff/from-design

Files arriving **from Claude Design**: specifications, briefs, batch contracts, handoffs, index updates.

How it works:
1. Sam downloads the files from Claude Design into this folder, unchanged.
2. Code compares each file against the local project copy and reports the differences before applying anything.
3. Sam approves; Code places each file in its proper folder (`reference/`, `reference/archive/`, `reference/parked/` or the project root).
4. Code never overwrites newer implementation facts (`CODE_STATE.md`, test results) or a newer local version without reporting it first.

After placement, the copy here is moved to `handoff/applied/<date>/` (once deletion is allowed) so this folder only holds files still waiting.
