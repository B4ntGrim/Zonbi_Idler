// server/ZedIdler.Server/Contracts/ApiContracts.cs
// Shared request/response DTOs for the Zed Idler serverless backend.
// These mirror the Unity client's ICloudServices DTOs exactly so the wire
// format is identical. Target: .NET 8 isolated-process Azure Functions OR
// AWS Lambda (the handler signatures are framework-agnostic).
using System;

namespace ZedIdler.Server.Contracts
{
    // ─── Auth ───────────────────────────────────────────────────────────────
    public sealed class AnonSignInRequest  { public string DeviceId { get; set; } }
    public sealed class AnonSignInResponse { public string PlayerId { get; set; } public string SessionToken { get; set; } }

    public sealed class LinkAccountRequest  { public string PlayerId { get; set; } public string Email { get; set; } public string Token { get; set; } }
    public sealed class LinkAccountResponse { public bool Linked { get; set; } }

    // ─── Session lock (one-session-at-a-time) ───────────────────────────────
    public sealed class SessionRequest  { public string PlayerId { get; set; } public string DeviceId { get; set; } }
    public sealed class SessionResponse { public bool Granted { get; set; } public long LeaseExpiresUtcTicks { get; set; } public string HolderDeviceId { get; set; } }

    // ─── Save sync (gzip full snapshot, version-checked) ────────────────────
    public sealed class SaveUploadRequest  { public string PlayerId { get; set; } public long LocalVersion { get; set; } public byte[] CompressedJson { get; set; } }
    public sealed class SaveUploadResponse { public bool Accepted { get; set; } public long NewVersion { get; set; } public bool Conflict { get; set; } public long RemoteVersion { get; set; } }
    public sealed class SaveDownloadResponse { public long Version { get; set; } public byte[] CompressedJson { get; set; } }

    // ─── Server tick (offline progression, 24h capped) ──────────────────────
    public sealed class OfflineTickRequest  { public string PlayerId { get; set; } public long LastSeenUtcTicks { get; set; } }
    public sealed class OfflineTickResponse
    {
        public long ServerVersion { get; set; }
        public byte[] ReconciledSnapshot { get; set; }
        public double OfflineSecondsCredited { get; set; }
        public bool QuotaCapped { get; set; }
    }

    // ─── Server-authoritative combat ────────────────────────────────────────
    public sealed class CombatRunRequest
    {
        public string PlayerId { get; set; }
        public string[] SquadSurvivorIds { get; set; }
        public string ZoneId { get; set; }
        public int EncounterLimit { get; set; }
        public bool AutoLoot { get; set; }
        public long ClientNonce { get; set; }
    }
    public sealed class CombatRunResponse
    {
        public bool Success { get; set; }
        public int EncountersResolved { get; set; }
        public int Kills { get; set; }
        public string[] LootItemIds { get; set; }
        public int[] LootQuantities { get; set; }
        public string[] SurvivorsLostIds { get; set; }
        public long ServerVersion { get; set; }
        public string RejectReason { get; set; } // anti-cheat / validation
    }

    // ─── Quota (24h rolling) ────────────────────────────────────────────────
    public sealed class QuotaResponse
    {
        public double OfflineSecondsCreditedToday { get; set; }
        public double DailyCapSeconds { get; set; }
        public long RollingWindowResetUtcTicks { get; set; }
    }

    /// <summary>Standard error envelope mirrored to the client's CloudErrorCode.</summary>
    public sealed class ApiError
    {
        public int Code { get; set; }     // matches CloudErrorCode enum
        public string Message { get; set; }
        public static ApiError Of(int code, string msg) => new ApiError { Code = code, Message = msg };
    }
}
