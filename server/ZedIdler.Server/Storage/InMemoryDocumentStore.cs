// server/ZedIdler.Server/Storage/InMemoryDocumentStore.cs
// Local-testing document store. Swap for DynamoDbDocumentStore /
// FirestoreDocumentStore / CosmosDocumentStore in production — same interface.
using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace ZedIdler.Server.Storage
{
    public sealed class InMemoryDocumentStore : IDocumentStore
    {
        private readonly ConcurrentDictionary<string, PlayerDocument> _docs = new();

        public Task<PlayerDocument> GetAsync(string playerId)
        {
            _docs.TryGetValue(playerId, out var doc);
            return Task.FromResult(doc);
        }

        public Task PutAsync(PlayerDocument doc)
        {
            _docs[doc.PlayerId] = Clone(doc);
            return Task.CompletedTask;
        }

        public Task<bool> ConditionalPutAsync(PlayerDocument doc, long expectedVersion)
        {
            bool ok = _docs.AddOrUpdate(doc.PlayerId,
                _ => Clone(doc),
                (_, existing) => existing.Version == expectedVersion - 1 || existing.Version <= doc.Version ? Clone(doc) : existing
            ).Version == doc.Version;
            return Task.FromResult(ok);
        }

        public Task<PlayerDocument> GetOrCreateAsync(string playerId)
        {
            var doc = _docs.GetOrAdd(playerId, id => new PlayerDocument
            {
                PlayerId = id,
                Version = 0,
                QuotaWindowResetUtcTicks = DateTime.UtcNow.AddHours(24).Ticks,
                LastSeenUtcTicks = DateTime.UtcNow.Ticks
            });
            return Task.FromResult(Clone(doc));
        }

        private static PlayerDocument Clone(PlayerDocument d) => new PlayerDocument
        {
            PlayerId = d.PlayerId,
            Version = d.Version,
            CompressedSave = d.CompressedSave,
            LastSeenUtcTicks = d.LastSeenUtcTicks,
            LockHolderDeviceId = d.LockHolderDeviceId,
            LockLeaseExpiresUtcTicks = d.LockLeaseExpiresUtcTicks,
            OfflineSecondsCreditedToday = d.OfflineSecondsCreditedToday,
            QuotaWindowResetUtcTicks = d.QuotaWindowResetUtcTicks,
            LastCombatNonce = d.LastCombatNonce,
            DailyStreak = d.DailyStreak,
            DailyLastClaimUtcTicks = d.DailyLastClaimUtcTicks
        };
    }
}
