# Zed Idler — Bootstrap Composition & Service Boot Order

This document defines the single **Bootstrap scene** GameObject layout and the
**registration order** every service must follow. The order matters because some
services resolve others on `Start()` via the `ServiceLocator`.

## Bootstrap GameObject — component order (top → bottom)

Place ALL of these on one persistent GameObject named **"Bootstrap"** in the
first scene of the build. Each calls `DontDestroyOnLoad` itself.

```
Bootstrap (GameObject)
│
├── 1.  LocalizationService          ← FIRST: labels resolve as soon as UI loads
├── 2.  ServiceLocator               (static — nothing to add; cleared in tests)
├── 3.  GameManager                  ← owns GameState + SaveData; reads GameConfig
├── 4.  CatalogService               ← items / zombies / perks / recipes / events
├── 5.  FactionCatalogExtension
├── 6.  ContractCatalogExtension
├── 7.  WeaponCatalogExtension
├── 8.  TimeService
├── 9.  TraversalContext
├── 10. PlayerProfile                ← credits + camp level + rescue ledger
├── 11. UnlockService
├── 12. InventoryService
├── 13. BackpackService
├── 14. EquipmentService
├── 15. RecyclerService
├── 16. MarketplaceService
├── 17. FactionService
├── 18. ContractsService
├── 19. AudioService
├── 20. UIAnimationService
├── 21. UIObjectPoolService
├── 22. ArtGenerationService
├── 23. TutorialService
├── 24. MockCloudServices            ← swap for HttpCloudServices in production
├── 25. CloudCoordinator             ← sequences cloud boot (after all above)
└── 26. SaveCoordinator              ← LAST: restores snapshots into every service
```

## Why this order

- **LocalizationService first** — `LocalizedText` components on any scene resolve
  their keys on `OnEnable`; the service must be registered before the first UI
  scene loads.
- **GameManager early** — it fires `OnLoadCompleted` / `OnOfflineProgressApplied`
  that `SaveCoordinator` (last) listens to.
- **Catalog services before consumers** — `MarketplaceService`, `ContractsService`,
  `RecyclerService`, `EquipmentService`, `FactionService` all resolve catalog
  providers on `Start()`.
- **CloudCoordinator after all gameplay services** — it pulls the reconciled
  server snapshot and hands it to `SaveCoordinator.RestoreAll`.
- **SaveCoordinator last** — it lazily hooks `IGameManager` and dispatches every
  snapshot once all target services have registered.

## ScriptableObject seeding (run once in the editor)

Menu order under **ZedIdler →**:

1. `Seed All Catalogs`        (character types, perks, zombies, items, market events)
2. `Seed Recycler Recipes`
3. `Seed Factions`
4. `Seed Contracts`
5. `Seed Weapons`
6. `Seed Art Palettes`
7. `Seed Content Expansion`   (12 zombies, 10 weapons, 20 contracts)

Then assign each asset array to the matching catalog component's inspector slot,
OR drop everything under `Assets/Resources/Catalogs/` for the Resources fallback.

## Combat resolver wiring (now active)

`SquadCombatSystem` instantiates `ZombieAbilityResolver` + `WeaponTraitResolver`
in its constructor and invokes them at every phase:

| Phase | Resolver call | Effect |
|---|---|---|
| Zombie turn start | `OnZombieTurnStart` | SelfHeal, ArmorOnHit |
| Zombie damage | `ModifyZombieDamage` | EnrageBelow50Hp |
| Survivor strikes zombie | `OnZombieStruck` | ReflectDamage, TeleportEvasion, SummonOnHit, DrainWeaponDur |
| Survivor weapon trait | `ApplyOutgoing` | ignore_armor, execute_low_hp, aoe_pulse, bleed_stack |
| Zombie dies | `OnZombieDeath` | AoEOnDeath, RMatCorrupted bonus shards |

## Production cloud swap

Replace `MockCloudServices` (component 24) with `HttpCloudServices` (to be built).
It implements the same five interfaces against the C# serverless backend:

| Interface | Endpoint |
|---|---|
| `IAuthService` | `POST /auth/anon`, `POST /auth/link` |
| `ISessionLockService` | `POST /session/{acquire,heartbeat,release}` |
| `ICloudSyncService` | `POST /save/upload`, `GET /save/download` |
| `IServerTickService` | `POST /tick/offline`, `POST /combat/run` |
| `IQuotaService` | `GET /quota` |

No other component changes — the ServiceLocator indirection means swapping the
implementation is a one-line prefab edit.
```
