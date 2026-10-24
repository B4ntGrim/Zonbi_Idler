// server/ZedIdler.Server/Contracts/TelemetryContracts.cs
namespace ZedIdler.Server.Contracts
{
    /// <summary>Single telemetry event posted by the Unity HttpAnalyticsSink.</summary>
    public sealed class TelemetryEvent
    {
        public string Category { get; set; }
        public string Name { get; set; }
        public string DeviceId { get; set; }
        public string SessionId { get; set; }
        public long UtcTicks { get; set; }
        public string PropsJson { get; set; }
    }

    public sealed class TelemetryAck { public bool Received { get; set; } }
}
