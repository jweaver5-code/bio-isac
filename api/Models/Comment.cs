namespace api.Models;

public class Comment
{
    public int Id { get; set; }
    public string Content { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public int? VulnerabilityId { get; set; } // Nullable for general comments
    public string CommentType { get; set; } = "general"; // general, vulnerability, action, update
    public string Action { get; set; } = string.Empty; // e.g., "reviewed", "updated", "resolved", "commented"
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

