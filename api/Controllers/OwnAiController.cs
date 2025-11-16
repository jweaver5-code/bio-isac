using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OwnAiController : ControllerBase
{
    private readonly string _connectionString;

    public OwnAiController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=./api/database.db";
    }

    // GET: api/ownai
    [HttpGet]
    public IActionResult GetConfiguration([FromQuery] string userId = "default")
    {
        try
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            var query = @"
                SELECT id, user_id, bio_relevance_weight, cvss_weight, sole_source_multiplier, 
                       human_impact_weight, bio_relevance_threshold, updated_at
                FROM ai_configurations
                WHERE user_id = @userId";

            using var command = new SqliteCommand(query, connection);
            command.Parameters.AddWithValue("@userId", userId);

            using var reader = command.ExecuteReader();

            if (reader.Read())
            {
                var config = new
                {
                    id = reader.GetInt32(0),
                    userId = reader.GetString(1),
                    bioRelevanceWeight = reader.GetDouble(2),
                    cvssWeight = reader.GetDouble(3),
                    soleSourceMultiplier = reader.GetDouble(4),
                    humanImpactWeight = reader.GetDouble(5),
                    bioRelevanceThreshold = reader.GetDouble(6),
                    updatedAt = reader.GetString(7)
                };

                return Ok(config);
            }

            // Return default configuration if not found
            return Ok(new
            {
                id = 0,
                userId = userId,
                bioRelevanceWeight = 0.4,
                cvssWeight = 0.3,
                soleSourceMultiplier = 1.5,
                humanImpactWeight = 0.3,
                bioRelevanceThreshold = 0.6,
                updatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ss")
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // PUT: api/ownai
    [HttpPut]
    public IActionResult UpdateConfiguration([FromBody] UpdateAiConfigRequest request, [FromQuery] string userId = "default")
    {
        try
        {
            // Validate weights sum to approximately 1.0 (allow some tolerance)
            var totalWeight = request.BioRelevanceWeight + request.CvssWeight + request.HumanImpactWeight;
            if (Math.Abs(totalWeight - 1.0) > 0.01)
            {
                return BadRequest(new { error = "Weights must sum to 1.0" });
            }

            // Validate ranges
            if (request.BioRelevanceWeight < 0 || request.BioRelevanceWeight > 1 ||
                request.CvssWeight < 0 || request.CvssWeight > 1 ||
                request.HumanImpactWeight < 0 || request.HumanImpactWeight > 1 ||
                request.SoleSourceMultiplier < 1.0 || request.SoleSourceMultiplier > 3.0 ||
                request.BioRelevanceThreshold < 0 || request.BioRelevanceThreshold > 1)
            {
                return BadRequest(new { error = "Invalid parameter values" });
            }

            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            // Check if configuration exists
            var checkQuery = "SELECT COUNT(*) FROM ai_configurations WHERE user_id = @userId";
            using var checkCommand = new SqliteCommand(checkQuery, connection);
            checkCommand.Parameters.AddWithValue("@userId", userId);
            var exists = Convert.ToInt64(checkCommand.ExecuteScalar()) > 0;

            string updateQuery;
            if (exists)
            {
                updateQuery = @"
                    UPDATE ai_configurations 
                    SET bio_relevance_weight = @bioRelevanceWeight,
                        cvss_weight = @cvssWeight,
                        sole_source_multiplier = @soleSourceMultiplier,
                        human_impact_weight = @humanImpactWeight,
                        bio_relevance_threshold = @bioRelevanceThreshold,
                        updated_at = datetime('now')
                    WHERE user_id = @userId";
            }
            else
            {
                updateQuery = @"
                    INSERT INTO ai_configurations 
                    (user_id, bio_relevance_weight, cvss_weight, sole_source_multiplier, 
                     human_impact_weight, bio_relevance_threshold, updated_at)
                    VALUES 
                    (@userId, @bioRelevanceWeight, @cvssWeight, @soleSourceMultiplier, 
                     @humanImpactWeight, @bioRelevanceThreshold, datetime('now'))";
            }

            using var command = new SqliteCommand(updateQuery, connection);
            command.Parameters.AddWithValue("@userId", userId);
            command.Parameters.AddWithValue("@bioRelevanceWeight", request.BioRelevanceWeight);
            command.Parameters.AddWithValue("@cvssWeight", request.CvssWeight);
            command.Parameters.AddWithValue("@soleSourceMultiplier", request.SoleSourceMultiplier);
            command.Parameters.AddWithValue("@humanImpactWeight", request.HumanImpactWeight);
            command.Parameters.AddWithValue("@bioRelevanceThreshold", request.BioRelevanceThreshold);

            command.ExecuteNonQuery();

            return Ok(new { message = "AI configuration updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // POST: api/ownai/reset
    [HttpPost("reset")]
    public IActionResult ResetToDefaults([FromQuery] string userId = "default")
    {
        try
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            var updateQuery = @"
                UPDATE ai_configurations 
                SET bio_relevance_weight = 0.4,
                    cvss_weight = 0.3,
                    sole_source_multiplier = 1.5,
                    human_impact_weight = 0.3,
                    bio_relevance_threshold = 0.6,
                    updated_at = datetime('now')
                WHERE user_id = @userId";

            using var command = new SqliteCommand(updateQuery, connection);
            command.Parameters.AddWithValue("@userId", userId);

            var rowsAffected = command.ExecuteNonQuery();

            if (rowsAffected == 0)
            {
                // Insert default if doesn't exist
                var insertQuery = @"
                    INSERT INTO ai_configurations 
                    (user_id, bio_relevance_weight, cvss_weight, sole_source_multiplier, 
                     human_impact_weight, bio_relevance_threshold, updated_at)
                    VALUES 
                    (@userId, 0.4, 0.3, 1.5, 0.3, 0.6, datetime('now'))";

                using var insertCommand = new SqliteCommand(insertQuery, connection);
                insertCommand.Parameters.AddWithValue("@userId", userId);
                insertCommand.ExecuteNonQuery();
            }

            return Ok(new { message = "Configuration reset to defaults" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public class UpdateAiConfigRequest
{
    public double BioRelevanceWeight { get; set; }
    public double CvssWeight { get; set; }
    public double SoleSourceMultiplier { get; set; }
    public double HumanImpactWeight { get; set; }
    public double BioRelevanceThreshold { get; set; }
}

