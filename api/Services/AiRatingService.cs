using Microsoft.Data.Sqlite;

namespace api.Services;

public class AiRatingService
{
    private readonly string _connectionString;

    public AiRatingService(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=database.db";
    }

    // Calculate AI rating based on the configured weights
    public double CalculateRating(
        double cvssScore,
        double bioRelevanceScore,
        double humanImpactScore,
        bool soleSourceFlag,
        double bioRelevanceWeight = 0.4,
        double cvssWeight = 0.3,
        double humanImpactWeight = 0.3,
        double soleSourceMultiplier = 1.5)
    {
        // Normalize human impact score (0-1 scale, assume it's based on severity)
        // If human impact is high, add to the score
        var humanImpactNormalized = humanImpactScore / 10.0; // Assuming 0-10 scale
        
        // Base calculation: weighted combination
        var baseRating = (cvssScore * cvssWeight) + 
                        (bioRelevanceScore * 10 * bioRelevanceWeight) + 
                        (humanImpactNormalized * 10 * humanImpactWeight);
        
        // Apply sole source multiplier if applicable
        if (soleSourceFlag)
        {
            baseRating *= soleSourceMultiplier;
        }
        
        // Cap at 10.0
        return Math.Min(10.0, baseRating);
    }

    // Verify an existing AI rating by recalculating it
    public RatingVerificationResult VerifyRating(int vulnerabilityId, string userId = "default")
    {
        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        // Get vulnerability data
        var vulnQuery = @"
            SELECT id, cve_id, title, score, bio_relevance_score, 
                   sole_source_flag, ai_rating, priority_score
            FROM vulnerabilities
            WHERE id = @id";

        double? cvssScore = null;
        double? bioRelevanceScore = null;
        bool soleSourceFlag = false;
        double? currentAiRating = null;
        string? cveId = null;
        string? title = null;

        using (var command = new SqliteCommand(vulnQuery, connection))
        {
            command.Parameters.AddWithValue("@id", vulnerabilityId);
            using var reader = command.ExecuteReader();
            if (reader.Read())
            {
                cvssScore = reader.IsDBNull(3) ? null : reader.GetDouble(3);
                bioRelevanceScore = reader.IsDBNull(4) ? null : reader.GetDouble(4);
                soleSourceFlag = reader.IsDBNull(5) ? false : reader.GetInt32(5) == 1;
                currentAiRating = reader.IsDBNull(6) ? null : reader.GetDouble(6);
                cveId = reader.GetString(1);
                title = reader.GetString(2);
            }
            else
            {
                return new RatingVerificationResult
                {
                    IsValid = false,
                    Error = "Vulnerability not found"
                };
            }
        }

        if (!cvssScore.HasValue || !bioRelevanceScore.HasValue || !currentAiRating.HasValue)
        {
            return new RatingVerificationResult
            {
                IsValid = false,
                Error = "Missing required data for rating calculation"
            };
        }

        // Get AI configuration
        var configQuery = @"
            SELECT bio_relevance_weight, cvss_weight, sole_source_multiplier, 
                   human_impact_weight, bio_relevance_threshold
            FROM ai_configurations
            WHERE user_id = @userId";

        double bioRelevanceWeight = 0.4;
        double cvssWeight = 0.3;
        double soleSourceMultiplier = 1.5;
        double humanImpactWeight = 0.3;

        using (var command = new SqliteCommand(configQuery, connection))
        {
            command.Parameters.AddWithValue("@userId", userId);
            using var reader = command.ExecuteReader();
            if (reader.Read())
            {
                bioRelevanceWeight = reader.GetDouble(0);
                cvssWeight = reader.GetDouble(1);
                soleSourceMultiplier = reader.GetDouble(2);
                humanImpactWeight = reader.GetDouble(3);
            }
        }

        // Recalculate the rating
        var recalculatedRating = CalculateRating(
            cvssScore.Value,
            bioRelevanceScore.Value,
            cvssScore.Value, // Using CVSS as proxy for human impact
            soleSourceFlag,
            bioRelevanceWeight,
            cvssWeight,
            humanImpactWeight,
            soleSourceMultiplier
        );

        // Compare with existing rating
        var difference = Math.Abs(recalculatedRating - currentAiRating.Value);
        var threshold = 0.5; // Allow 0.5 difference before flagging
        var isValid = difference <= threshold;

        return new RatingVerificationResult
        {
            IsValid = isValid,
            CurrentRating = currentAiRating.Value,
            RecalculatedRating = recalculatedRating,
            Difference = difference,
            VulnerabilityId = vulnerabilityId,
            CveId = cveId,
            Title = title,
            Message = isValid 
                ? $"Rating verified: {currentAiRating.Value:F1} (recalculated: {recalculatedRating:F1})"
                : $"Rating discrepancy detected: Current {currentAiRating.Value:F1} vs Recalculated {recalculatedRating:F1} (diff: {difference:F2})"
        };
    }

    // Verify all vulnerabilities
    public List<RatingVerificationResult> VerifyAllRatings(string userId = "default")
    {
        var results = new List<RatingVerificationResult>();

        using var connection = new SqliteConnection(_connectionString);
        connection.Open();

        var query = "SELECT id FROM vulnerabilities";
        using var command = new SqliteCommand(query, connection);
        using var reader = command.ExecuteReader();

        while (reader.Read())
        {
            var vulnId = reader.GetInt32(0);
            var result = VerifyRating(vulnId, userId);
            results.Add(result);
        }

        return results;
    }
}

public class RatingVerificationResult
{
    public bool IsValid { get; set; }
    public double? CurrentRating { get; set; }
    public double? RecalculatedRating { get; set; }
    public double? Difference { get; set; }
    public int? VulnerabilityId { get; set; }
    public string? CveId { get; set; }
    public string? Title { get; set; }
    public string? Message { get; set; }
    public string? Error { get; set; }
}

