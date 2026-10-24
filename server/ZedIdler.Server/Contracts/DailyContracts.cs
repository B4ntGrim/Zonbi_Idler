// server/ZedIdler.Server/Contracts/DailyContracts.cs
namespace ZedIdler.Server.Contracts
{
    public sealed class DailyClaimRequest  { public string PlayerId { get; set; } }

    public sealed class DailyClaimResponse
    {
        public bool Success { get; set; }
        public string Reason { get; set; }   // already_claimed_today | none
        public int Streak { get; set; }
        public bool StreakReset { get; set; }
        public long NextClaimUtcTicks { get; set; }   // earliest next claim (UTC midnight)
        public long ServerUtcTicks { get; set; }      // server's canonical now
    }

    public sealed class DailyStatusResponse
    {
        public int Streak { get; set; }
        public bool CanClaimNow { get; set; }
        public long LastClaimUtcTicks { get; set; }
        public long ServerUtcTicks { get; set; }
    }
}
