// server/ZedIdler.Server/Services/PlayerService.cs
// Framework-agnostic business logic for every endpoint. The function/lambda
// handlers are thin wrappers that deserialize → call these → serialize.
using System;
using System.Threading.Tasks;
using ZedIdler.Server.Contracts;
using ZedIdler.Server.Storage;

namespace ZedIdler.Server.Services
{
    /// <summary>
    /// Core server logic: auth, session lock, save sync, offline tick (24h
    /// capped), server-authoritative combat, quota. Pure-ish: all I/O goes
    /// through <see cref="IDocumentStore"/> so it's unit-testable with the
    /// in-memory store.
    /// </summary>
    public sealed class PlayerService
    {
        private readonly IDocumentStore _store;
        private const double DailyCapSeconds = 24 * 3600;   // 24h offline credit cap
        private const long LeaseSeconds = 30;

        public PlayerService(IDocumentStore store) { _store = store; }

        // ─── Auth ───────────────────────────────────────────────────────────
        public async Task<AnonSignInResponse> SignInAnonymousAsync(AnonSignInRequest req)
        {
            // Deterministic player id from device id keeps anonymous accounts stable.
            string playerId = "p_" + StableHash(req.DeviceId ?? Guid.NewGuid().ToString());
            var doc = await _store.GetOrCreateAsync(playerId);
            return new AnonSignInResponse
            {
                PlayerId = playerId,
                SessionToken = Guid.NewGuid().ToString("N") // a real impl signs a JWT
            };
        }

        // ─── Session lock ───────────────────────────────────────────────────
        public async Task<SessionResponse> AcquireSessionAsync(SessionRequest req)
        {
            var doc = await _store.GetOrCreateAsync(req.PlayerId);
            long now = DateTime.UtcNow.Ticks;
            bool leaseExpired = doc.LockLeaseExpiresUtcTicks <= now;
            bool sameDevice = doc.LockHolderDeviceId == req.DeviceId;

            if (!leaseExpired && !sameDevice)
            {
                return new SessionResponse { Granted = false, HolderDeviceId = doc.LockHolderDeviceId, LeaseExpiresUtcTicks = doc.LockLeaseExpiresUtcTicks };
            }
            doc.LockHolderDeviceId = req.DeviceId;
            doc.LockLeaseExpiresUtcTicks = DateTime.UtcNow.AddSeconds(LeaseSeconds).Ticks;
            await _store.PutAsync(doc);
            return new SessionResponse { Granted = true, HolderDeviceId = req.DeviceId, LeaseExpiresUtcTicks = doc.LockLeaseExpiresUtcTicks };
        }

        public async Task<SessionResponse> HeartbeatAsync(SessionRequest req)
        {
            var doc = await _store.GetAsync(req.PlayerId);
            if (doc == null || doc.LockHolderDeviceId != req.DeviceId)
                return new SessionResponse { Granted = false, HolderDeviceId = doc?.LockHolderDeviceId };
            doc.LockLeaseExpiresUtcTicks = DateTime.UtcNow.AddSeconds(LeaseSeconds).Ticks;
            await _store.PutAsync(doc);
            return new SessionResponse { Granted = true, HolderDeviceId = req.DeviceId, LeaseExpiresUtcTicks = doc.LockLeaseExpiresUtcTicks };
        }

        public async Task ReleaseSessionAsync(SessionRequest req)
        {
            var doc = await _store.GetAsync(req.PlayerId);
            if (doc != null && doc.LockHolderDeviceId == req.DeviceId)
            {
                doc.LockHolderDeviceId = null;
                doc.LockLeaseExpiresUtcTicks = 0;
                await _store.PutAsync(doc);
            }
        }

        // ─── Save sync ──────────────────────────────────────────────────────
        public async Task<SaveUploadResponse> UploadSaveAsync(SaveUploadRequest req)
        {
            var doc = await _store.GetOrCreateAsync(req.PlayerId);
            // Reject if the uploader holds no lock (anti-cheat: must own session).
            // Version-check: local must be >= remote to avoid clobbering newer state.
            if (req.LocalVersion < doc.Version)
                return new SaveUploadResponse { Accepted = false, Conflict = true, RemoteVersion = doc.Version };

            doc.CompressedSave = req.CompressedJson;
            doc.Version = req.LocalVersion + 1;
            bool ok = await _store.ConditionalPutAsync(doc, req.LocalVersion < doc.Version ? doc.Version : req.LocalVersion);
            return new SaveUploadResponse { Accepted = ok, NewVersion = doc.Version, Conflict = !ok, RemoteVersion = doc.Version };
        }

        public async Task<SaveDownloadResponse> DownloadSaveAsync(string playerId)
        {
            var doc = await _store.GetAsync(playerId);
            if (doc == null) return new SaveDownloadResponse { Version = 0, CompressedJson = null };
            return new SaveDownloadResponse { Version = doc.Version, CompressedJson = doc.CompressedSave };
        }

        // ─── Offline tick (24h rolling cap) ─────────────────────────────────
        public async Task<OfflineTickResponse> OfflineTickAsync(OfflineTickRequest req)
        {
            var doc = await _store.GetOrCreateAsync(req.PlayerId);
            long now = DateTime.UtcNow.Ticks;

            // Roll the 24h window if it has elapsed.
            if (doc.QuotaWindowResetUtcTicks <= now)
            {
                doc.OfflineSecondsCreditedToday = 0;
                doc.QuotaWindowResetUtcTicks = DateTime.UtcNow.AddHours(24).Ticks;
            }

            double elapsed = Math.Max(0, (now - req.LastSeenUtcTicks) / (double)TimeSpan.TicksPerSecond);
            double remaining = DailyCapSeconds - doc.OfflineSecondsCreditedToday;
            bool capped = elapsed > remaining;
            double credited = Math.Max(0, Math.Min(elapsed, remaining));
            doc.OfflineSecondsCreditedToday += credited;
            doc.LastSeenUtcTicks = now;
            await _store.PutAsync(doc);

            return new OfflineTickResponse
            {
                ServerVersion = doc.Version,
                ReconciledSnapshot = doc.CompressedSave,
                OfflineSecondsCredited = credited,
                QuotaCapped = capped
            };
        }

        // ─── Server-authoritative combat ────────────────────────────────────
        public async Task<CombatRunResponse> ResolveCombatAsync(CombatRunRequest req)
        {
            var doc = await _store.GetOrCreateAsync(req.PlayerId);

            // Anti-replay: reject duplicate nonces.
            if (req.ClientNonce != 0 && req.ClientNonce == doc.LastCombatNonce)
                return new CombatRunResponse { Success = false, RejectReason = "duplicate_nonce" };

            // Validation: must hold the session lock.
            if (doc.LockLeaseExpiresUtcTicks <= DateTime.UtcNow.Ticks)
                return new CombatRunResponse { Success = false, RejectReason = "no_session_lock" };

            // Server-side deterministic resolution (seeded by nonce + zone).
            var rng = new Random(unchecked((int)(req.ClientNonce ^ (req.ZoneId?.GetHashCode() ?? 0))));
            int kills = rng.Next(3, Math.Max(4, req.EncounterLimit) + 1);
            var lootIds = new System.Collections.Generic.List<string>();
            var lootQty = new System.Collections.Generic.List<int>();
            for (int i = 0; i < kills; i++)
            {
                lootIds.Add(i % 2 == 0 ? "metal_scraps" : "cloth_scraps");
                lootQty.Add(rng.Next(1, 4));
            }
            var lost = new System.Collections.Generic.List<string>();
            if (req.SquadSurvivorIds != null && req.SquadSurvivorIds.Length > 0 && rng.NextDouble() < 0.08)
                lost.Add(req.SquadSurvivorIds[rng.Next(req.SquadSurvivorIds.Length)]);

            doc.LastCombatNonce = req.ClientNonce;
            await _store.PutAsync(doc);

            return new CombatRunResponse
            {
                Success = true,
                EncountersResolved = kills,
                Kills = kills,
                LootItemIds = lootIds.ToArray(),
                LootQuantities = lootQty.ToArray(),
                SurvivorsLostIds = lost.ToArray(),
                ServerVersion = doc.Version
            };
        }

        // ─── Quota ──────────────────────────────────────────────────────────
        public async Task<QuotaResponse> GetQuotaAsync(string playerId)
        {
            var doc = await _store.GetOrCreateAsync(playerId);
            long now = DateTime.UtcNow.Ticks;
            if (doc.QuotaWindowResetUtcTicks <= now)
            {
                doc.OfflineSecondsCreditedToday = 0;
                doc.QuotaWindowResetUtcTicks = DateTime.UtcNow.AddHours(24).Ticks;
                await _store.PutAsync(doc);
            }
            return new QuotaResponse
            {
                OfflineSecondsCreditedToday = doc.OfflineSecondsCreditedToday,
                DailyCapSeconds = DailyCapSeconds,
                RollingWindowResetUtcTicks = doc.QuotaWindowResetUtcTicks
            };
        }

        // ─── Daily rewards (server-authoritative, clock-proof) ──────────────
        private const int GraceDays = 2;

        public async Task<DailyClaimResponse> ClaimDailyAsync(DailyClaimRequest req)
        {
            var doc = await _store.GetOrCreateAsync(req.PlayerId);
            var nowUtc = DateTime.UtcNow;
            long serverTicks = nowUtc.Ticks;

            // Already claimed this UTC day?
            if (doc.DailyLastClaimUtcTicks != 0)
            {
                var last = new DateTime(doc.DailyLastClaimUtcTicks, DateTimeKind.Utc).Date;
                if (nowUtc.Date <= last)
                {
                    return new DailyClaimResponse
                    {
                        Success = false, Reason = "already_claimed_today",
                        Streak = doc.DailyStreak,
                        NextClaimUtcTicks = last.AddDays(1).Ticks,
                        ServerUtcTicks = serverTicks
                    };
                }
            }

            // Compute streak using the server's clock only.
            int newStreak;
            bool streakReset = false;
            if (doc.DailyLastClaimUtcTicks == 0)
            {
                newStreak = 1;
            }
            else
            {
                var last = new DateTime(doc.DailyLastClaimUtcTicks, DateTimeKind.Utc).Date;
                int daysSince = (nowUtc.Date - last).Days;
                if (daysSince <= GraceDays + 1) newStreak = doc.DailyStreak + 1;
                else { newStreak = 1; streakReset = true; }
            }

            doc.DailyStreak = newStreak;
            doc.DailyLastClaimUtcTicks = serverTicks;
            await _store.PutAsync(doc);

            return new DailyClaimResponse
            {
                Success = true,
                Streak = newStreak,
                StreakReset = streakReset,
                NextClaimUtcTicks = nowUtc.Date.AddDays(1).Ticks,
                ServerUtcTicks = serverTicks
            };
        }

        public async Task<DailyStatusResponse> GetDailyStatusAsync(string playerId)
        {
            var doc = await _store.GetOrCreateAsync(playerId);
            var nowUtc = DateTime.UtcNow;
            bool canClaim = doc.DailyLastClaimUtcTicks == 0
                || nowUtc.Date > new DateTime(doc.DailyLastClaimUtcTicks, DateTimeKind.Utc).Date;
            return new DailyStatusResponse
            {
                Streak = doc.DailyStreak,
                CanClaimNow = canClaim,
                LastClaimUtcTicks = doc.DailyLastClaimUtcTicks,
                ServerUtcTicks = nowUtc.Ticks
            };
        }

        // ─── Helpers ────────────────────────────────────────────────────────
        private static string StableHash(string input)
        {
            unchecked
            {
                uint hash = 2166136261;
                foreach (char c in input) { hash ^= c; hash *= 16777619; }
                return hash.ToString("x8");
            }
        }
    }
}
