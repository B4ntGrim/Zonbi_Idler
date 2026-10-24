# Zed Idler — Weapons Development Directive

**Status:** Planning only. No implementation authorized. Issued by Sam, Oct 12 (`[DECIDED Oct 12]`). Recorded by Claude Design; Sam's wording kept in §1–§4.
**Related:** `parked/weapons-encyclopedia-wlm-draft.md` (the draft this governs) · `weapon-files-inventory.md` (current weapons in code) · `CLAUDE_DESIGN_RULES.md` §4.2 ("Audit before expanding"), which §3 below makes mandatory for weapons work.

---

## Decisions recorded Oct 12

| ID | Decision | Effect |
|---|---|---|
| **W1** `[DECIDED Oct 12]` | Weapons use **invented brand and model names**. Real-world design traditions and countries of origin may inspire them | Supersedes the draft's S-02 (real manufacturers and model names). Applies to existing data too: `AK-74 Carbine` gets an invented name in the Data phase |
| **W2** `[DECIDED Oct 12]` | **Family mastery is a sub-track that feeds the Combat skill**, not a second currency | Amends the draft's S-05 and §5.2 (family XP as "separate mastery currency"). How the sub-track feeds Combat is designed in Phase 4 |
| **W5** `[DECIDED Oct 12]` | The draft's missing source is replaced by `weapon-files-inventory.md`, created from the code Oct 12 | The draft's "Source of truth" line points there |
| **W6** `[DECIDED Oct 12]` | Ranged combat (firearms, ammunition, noise that draws zombies) is the **last** phase, designed on its own | Matches the draft's Phase F |

---

## 1. Preserve development order

1. **FX4** — await two outstanding decisions.
2. **JD1a** — Elder Jester first-meeting rules.
3. **H2** — complete 80 simulation runs.
4. **JD1b** — Elder Jester scene implementation.
5. **Weapons Encyclopedia** — begin only after the preceding work.

## 2. Weapons development: phase gates

Follow this sequence:

1. **Audit:** read-only review of existing items, saves, combat and skills.
2. **Data:** define the international weapons catalog.
3. **Persistence:** design weapon identity, leveling and save compatibility.
4. **Progression:** implement individual weapon XP and family mastery.
5. **Balance:** validate weapon identities and long-term progression.
6. **Ranged combat:** design firearms, ammunition and noise-driven zombie attraction.

**Require GO/NO-GO approval between phases.**

## 3. Mandatory conflict check

Before drafting or implementing any new system:

- Compare against authoritative design rules.
- Inspect existing skill and combat systems.
- Identify contradictions, including W1 and W2.
- Report conflicts with recommended resolutions.
- Preserve locked decisions unless explicitly superseded.

## 4. Immediate assignment

After H2, prepare the **Weapons Phase 1 Read-Only Audit**. Deliver a concise report covering existing architecture, save compatibility, rule conflicts, dependencies and implementation risks.

Do not modify code or advance to Phase 2 without approval.

---

## 5. Notes for the Phase 1 audit (Claude Design, Oct 12)

Already known, to confirm and extend; nothing here is decided:
- 25 weapons exist, including firearms with no ammo or noise (`weapon-files-inventory.md`).
- All equipped weapons' damage is summed into one number. Per-weapon XP needs a rule for "which weapon fought."
- The draft's own Phase A list (§10) covers items, stacks, wear and destruction, inventory, save versioning, encounter lifecycle, escape classification, RNG streams, two-tab ownership and CB1 tests.
- W2 adds one item: how the Combat skill gains XP today (`ACTION_XP`, `emitAction`, decay and earned floors) so a mastery sub-track can feed it.
