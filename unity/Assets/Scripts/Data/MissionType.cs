// Assets/Scripts/Data/MissionType.cs
namespace ZedIdler.Data
{
    /// <summary>
    /// Mission archetype the player chooses AFTER selecting a zone. Each type
    /// changes reward emphasis, threat scaling, and which support systems
    /// (factions, training, etc.) hook into the run.
    /// </summary>
    /// <remarks>
    /// Per spec: the satellite grid is one shared map of multi-purpose zones —
    /// the player picks a zone first, then chooses a mission type, then dispatches.
    /// Reward tables and threat modifiers are owned by the gameplay systems that
    /// react to <see cref="ZedIdler.Systems.TraversalSceneController.SelectedMissionType"/>.
    /// </remarks>
    public enum MissionType
    {
        Scavenge = 0,  // Material gathering. Default. Loot-rate boost from Scavenger class.
        Contract = 1,  // Faction-issued. Higher faction rep on completion.
        Training = 2,  // XP-focused. Lower zombie tier, reward in SURVIVAL XP.
        Patrol   = 3,  // Threat-clock reduction. Cleared zones stay cleared longer.
        Raid     = 4   // High-tier loot, high-tier zombies. Recommended squad size 3+.
    }
}
