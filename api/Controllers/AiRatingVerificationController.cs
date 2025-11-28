using Microsoft.AspNetCore.Mvc;
using api.Services;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AiRatingVerificationController : ControllerBase
{
    private readonly AiRatingService _ratingService;
    private readonly string _connectionString;

    public AiRatingVerificationController(AiRatingService ratingService, IConfiguration configuration)
    {
        _ratingService = ratingService;
        _connectionString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=database.db";
    }

    // POST: api/airatingverification/verify/{id}
    [HttpPost("verify/{id}")]
    public IActionResult VerifyRating(int id, [FromQuery] string userId = "default")
    {
        try
        {
            var result = _ratingService.VerifyRating(id, userId);

            if (!string.IsNullOrEmpty(result.Error))
            {
                return BadRequest(new { error = result.Error });
            }

            // If discrepancy found, create an activity comment
            if (!result.IsValid && result.VulnerabilityId.HasValue)
            {
                CreateVerificationComment(result);
            }

            return Ok(result);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // POST: api/airatingverification/verify-all
    [HttpPost("verify-all")]
    public IActionResult VerifyAllRatings([FromQuery] string userId = "default")
    {
        try
        {
            var results = _ratingService.VerifyAllRatings(userId);
            
            var discrepancies = results.Where(r => !r.IsValid).ToList();
            
            // Create comments for all discrepancies
            foreach (var discrepancy in discrepancies)
            {
                if (discrepancy.VulnerabilityId.HasValue)
                {
                    CreateVerificationComment(discrepancy);
                }
            }

            return Ok(new
            {
                total = results.Count,
                valid = results.Count(r => r.IsValid),
                discrepancies = discrepancies.Count,
                results = results
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // Helper method to create verification comment
    private void CreateVerificationComment(RatingVerificationResult result)
    {
        try
        {
            using var connection = new Microsoft.Data.Sqlite.SqliteConnection(_connectionString);
            connection.Open();

            var comment = $"AI Rating Verification: {result.Message}";
            var insertQuery = @"
                INSERT INTO comments (content, author, vulnerability_id, comment_type, action, created_at)
                VALUES (@content, @author, @vulnerabilityId, @commentType, @action, datetime('now'))";

            using var command = new Microsoft.Data.Sqlite.SqliteCommand(insertQuery, connection);
            command.Parameters.AddWithValue("@content", comment);
            command.Parameters.AddWithValue("@author", "AI Verification System");
            command.Parameters.AddWithValue("@vulnerabilityId", result.VulnerabilityId);
            command.Parameters.AddWithValue("@commentType", "action");
            command.Parameters.AddWithValue("@action", "verified");
            command.ExecuteNonQuery();
        }
        catch
        {
            // Silently fail if comment creation fails
        }
    }
}

