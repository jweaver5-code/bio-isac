namespace api.Models;

public class AiConfiguration
{
    public int Id { get; set; }
    public string UserId { get; set; } = "default"; // For now, single user config
    public double BioRelevanceWeight { get; set; } = 0.4; // Weight for bio-relevance in scoring
    public double CvssWeight { get; set; } = 0.3; // Weight for CVSS score
    public double SoleSourceMultiplier { get; set; } = 1.5; // Multiplier for sole-source threats
    public double HumanImpactWeight { get; set; } = 0.3; // Weight for human impact
    public double BioRelevanceThreshold { get; set; } = 0.6; // Minimum bio-relevance to show
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

