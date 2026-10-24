// server/ZedIdler.Server/Storage/IDocumentStore.cs
// Document-store abstraction (answer 3a). Backed by DynamoDB / Firestore /
// Cosmos DB in production; an in-memory impl is provided for local testing.
using System;
using System.Threading.Tasks;

namespace ZedIdler.Server.Storage
{
    /// <summary>
    /// Player save document. The save blob is the gzip-compressed JSON the
    /// Unity client uploaded; the server never decompresses it for normal
    /// sync (opaque pass-through). It IS decompressed for combat / tick
    /// reconciliation where the server must read state.
    /// </summary>
    public sealed class PlayerDocument
    {
        public string PlayerId { get; set; }
        public long Version { get; set; }
        public byte[] CompressedSave { get; set; }
        public long LastSeenUtcTicks { get; set; }

        // Session lock
        public string LockHolderDeviceId { get; set; }
        public long LockLeaseExpiresUtcTicks { get; set; }

        // 24h rolling quota
        public double OfflineSecondsCreditedToday { get; set; }
        public long QuotaWindowResetUtcTicks { get; set; }

        // Anti-replay
        public long LastCombatNonce { get; set; }

        // Daily reward streak (server-authoritative)
        public int DailyStreak { get; set; }
        public long DailyLastClaimUtcTicks { get; set; }
    }

    public interface IDocumentStore
    {
        Task<PlayerDocument> GetAsync(string playerId);
        Task PutAsync(PlayerDocument doc);
        /// <summary>Optimistic-concurrency put: succeeds only if stored Version == expectedVersion.</summary>
        Task<bool> ConditionalPutAsync(PlayerDocument doc, long expectedVersion);
        Task<PlayerDocument> GetOrCreateAsync(string playerId);
    }
}
