using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.Sqlite;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CommentsController : ControllerBase
{
    private readonly string _connectionString;

    public CommentsController(IConfiguration configuration)
    {
        _connectionString = configuration.GetConnectionString("DefaultConnection") ?? "Data Source=database.db";
    }

    // GET: api/comments
    [HttpGet]
    public IActionResult GetComments([FromQuery] int? vulnerabilityId = null, [FromQuery] string? commentType = null)
    {
        try
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            var query = @"
                SELECT id, content, author, vulnerability_id, comment_type, action, created_at
                FROM comments
                WHERE 1=1";

            if (vulnerabilityId.HasValue)
            {
                query += " AND vulnerability_id = @vulnerabilityId";
            }

            if (!string.IsNullOrEmpty(commentType))
            {
                query += " AND comment_type = @commentType";
            }

            query += " ORDER BY created_at DESC";

            using var command = new SqliteCommand(query, connection);
            
            if (vulnerabilityId.HasValue)
            {
                command.Parameters.AddWithValue("@vulnerabilityId", vulnerabilityId.Value);
            }

            if (!string.IsNullOrEmpty(commentType))
            {
                command.Parameters.AddWithValue("@commentType", commentType);
            }

            var comments = new List<object>();

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                comments.Add(new
                {
                    id = reader.GetInt32(0),
                    content = reader.GetString(1),
                    author = reader.GetString(2),
                    vulnerabilityId = reader.IsDBNull(3) ? (int?)null : reader.GetInt32(3),
                    commentType = reader.GetString(4),
                    action = reader.GetString(5),
                    createdAt = reader.GetString(6)
                });
            }

            return Ok(comments);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // GET: api/comments/activity
    [HttpGet("activity")]
    public IActionResult GetActivityFeed([FromQuery] int limit = 50)
    {
        try
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            var query = @"
                SELECT c.id, c.content, c.author, c.vulnerability_id, c.comment_type, c.action, c.created_at,
                       v.cve_id, v.title
                FROM comments c
                LEFT JOIN vulnerabilities v ON c.vulnerability_id = v.id
                ORDER BY c.created_at DESC
                LIMIT @limit";

            using var command = new SqliteCommand(query, connection);
            command.Parameters.AddWithValue("@limit", limit);

            var activities = new List<object>();

            using var reader = command.ExecuteReader();
            while (reader.Read())
            {
                activities.Add(new
                {
                    id = reader.GetInt32(0),
                    content = reader.GetString(1),
                    author = reader.GetString(2),
                    vulnerabilityId = reader.IsDBNull(3) ? (int?)null : reader.GetInt32(3),
                    commentType = reader.GetString(4),
                    action = reader.GetString(5),
                    createdAt = reader.GetString(6),
                    cveId = reader.IsDBNull(7) ? null : reader.GetString(7),
                    vulnerabilityTitle = reader.IsDBNull(8) ? null : reader.GetString(8)
                });
            }

            return Ok(activities);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // POST: api/comments
    [HttpPost]
    public IActionResult CreateComment([FromBody] CreateCommentRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(new { error = "Content is required" });
            }

            if (string.IsNullOrWhiteSpace(request.Author))
            {
                return BadRequest(new { error = "Author is required" });
            }

            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            // Validate vulnerability_id if provided
            int? vulnerabilityId = null;
            if (request.VulnerabilityId.HasValue && request.VulnerabilityId.Value > 0)
            {
                // Check if vulnerability exists
                var checkQuery = "SELECT COUNT(*) FROM vulnerabilities WHERE id = @id";
                using (var checkCommand = new SqliteCommand(checkQuery, connection))
                {
                    checkCommand.Parameters.AddWithValue("@id", request.VulnerabilityId.Value);
                    var count = Convert.ToInt64(checkCommand.ExecuteScalar());
                    if (count == 0)
                    {
                        return BadRequest(new { error = $"Vulnerability with ID {request.VulnerabilityId.Value} does not exist" });
                    }
                }
                vulnerabilityId = request.VulnerabilityId.Value;
            }

            var insertQuery = @"
                INSERT INTO comments (content, author, vulnerability_id, comment_type, action, created_at)
                VALUES (@content, @author, @vulnerabilityId, @commentType, @action, datetime('now'))";

            using var command = new SqliteCommand(insertQuery, connection);
            command.Parameters.AddWithValue("@content", request.Content);
            command.Parameters.AddWithValue("@author", request.Author);
            command.Parameters.AddWithValue("@vulnerabilityId", vulnerabilityId.HasValue ? (object)vulnerabilityId.Value : DBNull.Value);
            command.Parameters.AddWithValue("@commentType", request.CommentType ?? "general");
            command.Parameters.AddWithValue("@action", request.Action ?? "");

            command.ExecuteNonQuery();

            // Get the inserted comment ID
            var lastIdQuery = "SELECT last_insert_rowid()";
            int lastId;
            using (var lastIdCommand = new SqliteCommand(lastIdQuery, connection))
            {
                lastId = Convert.ToInt32(lastIdCommand.ExecuteScalar());
            }

            var selectQuery = @"
                SELECT id, content, author, vulnerability_id, comment_type, action, created_at
                FROM comments
                WHERE id = @id";

            using var selectCommand = new SqliteCommand(selectQuery, connection);
            selectCommand.Parameters.AddWithValue("@id", lastId);

            using var reader = selectCommand.ExecuteReader();
            if (reader.Read())
            {
                var comment = new
                {
                    id = reader.GetInt32(0),
                    content = reader.GetString(1),
                    author = reader.GetString(2),
                    vulnerabilityId = reader.IsDBNull(3) ? (int?)null : reader.GetInt32(3),
                    commentType = reader.GetString(4),
                    action = reader.GetString(5),
                    createdAt = reader.GetString(6)
                };

                return CreatedAtAction(nameof(GetComments), new { id = comment.id }, comment);
            }

            return StatusCode(500, new { error = "Failed to retrieve created comment" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }

    // DELETE: api/comments/{id}
    [HttpDelete("{id}")]
    public IActionResult DeleteComment(int id)
    {
        try
        {
            using var connection = new SqliteConnection(_connectionString);
            connection.Open();

            var deleteQuery = "DELETE FROM comments WHERE id = @id";

            using var command = new SqliteCommand(deleteQuery, connection);
            command.Parameters.AddWithValue("@id", id);

            var rowsAffected = command.ExecuteNonQuery();

            if (rowsAffected == 0)
            {
                return NotFound(new { error = "Comment not found" });
            }

            return Ok(new { message = "Comment deleted successfully" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message });
        }
    }
}

public class CreateCommentRequest
{
    public string Content { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public int? VulnerabilityId { get; set; }
    public string? CommentType { get; set; }
    public string? Action { get; set; }
}

