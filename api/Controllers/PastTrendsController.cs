using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;
using System.Text.Json;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PastTrendsController : ControllerBase
{
    private readonly string _connectionString;

    public PastTrendsController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=./api/database.db";
    }

    // GET: api/pasttrends
    [HttpGet]
    public IActionResult GetPastTrends([FromQuery] bool? reviewedOnly = null)
    {
        try
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            var query = @"
                SELECT id, cve_id, title, description, severity, score, bio_relevance_score, 
                       priority_score, source, source_credibility, biotech_relevance, 
                       biological_impact, human_impact, sole_source_flag, discovered_date, 
                       affected_systems, created_at, ai_rating, user_rating, is_reviewed, reviewed_at
                FROM vulnerabilities
                WHERE 1=1";

            if (reviewedOnly.HasValue && reviewedOnly.Value)
            {
                query += " AND is_reviewed = 1";
            }

            query += " ORDER BY created_at DESC";

            using var command = new SqliteCommand(query, connection);
            using var reader = command.ExecuteReader();

            var vulnerabilities = new List<object>();

            while (reader.Read())
            {
                var affectedSystemsJson = reader.GetString(15);
                var affectedSystems = JsonSerializer.Deserialize<string[]>(affectedSystemsJson) ?? Array.Empty<string>();

                vulnerabilities.Add(new
                {
                    id = reader.GetInt32(0),
                    cveId = reader.GetString(1),
                    title = reader.GetString(2),
                    description = reader.IsDBNull(3) ? "" : reader.GetString(3),
                    severity = reader.IsDBNull(4) ? "" : reader.GetString(4),
                    score = reader.IsDBNull(5) ? 0.0 : reader.GetDouble(5),
                    bioRelevanceScore = reader.IsDBNull(6) ? 0.0 : reader.GetDouble(6),
                    priorityScore = reader.IsDBNull(7) ? 0.0 : reader.GetDouble(7),
                    source = reader.IsDBNull(8) ? "" : reader.GetString(8),
                    sourceCredibility = reader.IsDBNull(9) ? "" : reader.GetString(9),
                    biotechRelevance = reader.IsDBNull(10) ? "" : reader.GetString(10),
                    biologicalImpact = reader.IsDBNull(11) ? "" : reader.GetString(11),
                    humanImpact = reader.IsDBNull(12) ? "" : reader.GetString(12),
                    soleSourceFlag = reader.IsDBNull(13) ? false : reader.GetInt32(13) == 1,
                    discoveredDate = reader.IsDBNull(14) ? "" : reader.GetString(14),
                    affectedSystems = affectedSystems,
                    createdAt = reader.IsDBNull(16) ? "" : reader.GetString(16),
                    aiRating = reader.IsDBNull(17) ? 0.0 : reader.GetDouble(17),
                    userRating = reader.IsDBNull(18) ? (double?)null : reader.GetDouble(18),
                    isReviewed = reader.IsDBNull(19) ? false : reader.GetInt32(19) == 1,
                    reviewedAt = reader.IsDBNull(20) ? (string?)null : reader.GetString(20)
                });
            }

            return Ok(vulnerabilities);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // PUT: api/pasttrends/{id}/rating
    [HttpPut("{id}/rating")]
    public IActionResult UpdateRating(int id, [FromBody] UpdateRatingRequest request)
    {
        try
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            var updateQuery = @"
                UPDATE vulnerabilities 
                SET user_rating = @userRating,
                    is_reviewed = 1,
                    reviewed_at = datetime('now')
                WHERE id = @id";

            using var command = new SqliteCommand(updateQuery, connection);
            command.Parameters.AddWithValue("@id", id);
            command.Parameters.AddWithValue("@userRating", request.Rating);

            var rowsAffected = command.ExecuteNonQuery();

            if (rowsAffected == 0)
            {
                return NotFound(new { error = "Vulnerability not found" });
            }

            return Ok(new { message = "Rating updated successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // PUT: api/pasttrends/{id}/review
    [HttpPut("{id}/review")]
    public IActionResult MarkAsReviewed(int id, [FromBody] MarkReviewedRequest? request = null)
    {
        try
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            // If user rating is provided, update it; otherwise just mark as reviewed
            var updateQuery = request?.KeepCurrentRating == true
                ? @"
                    UPDATE vulnerabilities 
                    SET is_reviewed = 1,
                        reviewed_at = datetime('now')
                    WHERE id = @id"
                : @"
                    UPDATE vulnerabilities 
                    SET is_reviewed = 1,
                        reviewed_at = datetime('now'),
                        user_rating = COALESCE(user_rating, ai_rating)
                    WHERE id = @id";

            using var command = new SqliteCommand(updateQuery, connection);
            command.Parameters.AddWithValue("@id", id);

            var rowsAffected = command.ExecuteNonQuery();

            if (rowsAffected == 0)
            {
                return NotFound(new { error = "Vulnerability not found" });
            }

            return Ok(new { message = "Marked as reviewed successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // GET: api/pasttrends/stats
    [HttpGet("stats")]
    public IActionResult GetStats()
    {
        try
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            var statsQuery = @"
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN is_reviewed = 1 THEN 1 ELSE 0 END) as reviewed,
                    SUM(CASE WHEN user_rating IS NOT NULL THEN 1 ELSE 0 END) as rating_changed,
                    AVG(CASE WHEN user_rating IS NOT NULL THEN ABS(user_rating - ai_rating) ELSE 0 END) as avg_rating_diff
                FROM vulnerabilities";

            using var command = new SqliteCommand(statsQuery, connection);
            using var reader = command.ExecuteReader();

            if (reader.Read())
            {
                var stats = new
                {
                    total = reader.GetInt64(0),
                    reviewed = reader.GetInt64(1),
                    ratingChanged = reader.GetInt64(2),
                    avgRatingDifference = reader.IsDBNull(3) ? 0.0 : reader.GetDouble(3),
                    reviewPercentage = reader.GetInt64(0) > 0 
                        ? (double)reader.GetInt64(1) / reader.GetInt64(0) * 100 
                        : 0.0
                };

                return Ok(stats);
            }

            return Ok(new
            {
                total = 0,
                reviewed = 0,
                ratingChanged = 0,
                avgRatingDifference = 0.0,
                reviewPercentage = 0.0
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public class UpdateRatingRequest
{
    public double Rating { get; set; }
}

public class MarkReviewedRequest
{
    public bool KeepCurrentRating { get; set; } = false;
}

