// server/ZedIdler.Server/Storage/ITelemetryStore.cs
using System.Threading.Tasks;
using ZedIdler.Server.Contracts;

namespace ZedIdler.Server.Storage
{
    /// <summary>
    /// Telemetry write target. Production: append to a queue/stream (Kinesis,
    /// EventHub, Pub/Sub) or a time-series / data-lake table. In-memory impl
    /// provided for local testing.
    /// </summary>
    public interface ITelemetryStore
    {
        Task AppendAsync(TelemetryEvent evt);
        int Count { get; } // diagnostics only
    }

    public sealed class InMemoryTelemetryStore : ITelemetryStore
    {
        private readonly System.Collections.Concurrent.ConcurrentQueue<TelemetryEvent> _q = new();
        public int Count => _q.Count;
        public Task AppendAsync(TelemetryEvent evt) { _q.Enqueue(evt); return Task.CompletedTask; }
    }
}
