using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SupportController : ControllerBase
{
    // GET: api/support/tickets
    [HttpGet("tickets")]
    public IActionResult GetTickets()
    {
        // Mock data for 311-style support system
        var tickets = new[]
        {
            new
            {
                id = 1,
                ticketNumber = "BIO-2024-001",
                issueType = "Vulnerability Question",
                description = "Need clarification on biological impact of CVE-2024-1235",
                status = "Open",
                priority = "High",
                submittedBy = "Dr. Sarah Chen",
                submittedDate = "2024-01-15T10:30:00",
                assignedTo = "Security Team",
                responseTime = "2 hours",
                lastUpdated = "2024-01-15T12:30:00",
                resolution = (string?)null
            },
            new
            {
                id = 2,
                ticketNumber = "BIO-2024-002",
                issueType = "Remediation Guidance",
                description = "Requesting step-by-step remediation for lab equipment vulnerability",
                status = "In Progress",
                priority = "Critical",
                submittedBy = "Lab Manager John Smith",
                submittedDate = "2024-01-15T09:15:00",
                assignedTo = "Remediation Team",
                responseTime = "1 hour",
                lastUpdated = "2024-01-15T10:15:00",
                resolution = (string?)null
            },
            new
            {
                id = 3,
                ticketNumber = "BIO-2024-003",
                issueType = "Data Source Question",
                description = "Why was EU-CERT chosen as primary source for this threat?",
                status = "Resolved",
                priority = "Medium",
                submittedBy = "Security Analyst Mike Johnson",
                submittedDate = "2024-01-14T14:20:00",
                assignedTo = "Data Team",
                responseTime = "4 hours",
                lastUpdated = "2024-01-14T18:20:00",
                resolution = (string?)"EU-CERT selected due to high credibility score (0.95) and direct relevance to European biotech sector. Cross-validated with CVE database."
            }
        };

        return Ok(tickets);
    }

    // POST: api/support/tickets
    [HttpPost("tickets")]
    public IActionResult CreateTicket([FromBody] SupportTicketRequest request)
    {
        // In production, this would create a ticket in the database
        var newTicket = new
        {
            id = 999,
            ticketNumber = $"BIO-2024-{DateTime.Now:MMdd}-{new Random().Next(100, 999)}",
            issueType = request.IssueType,
            description = request.Description,
            status = "Open",
            priority = DeterminePriority(request.IssueType, request.Description),
            submittedBy = request.SubmittedBy,
            submittedDate = DateTime.Now.ToString("yyyy-MM-ddTHH:mm:ss"),
            assignedTo = "Unassigned",
            responseTime = "Pending"
        };

        return CreatedAtAction(nameof(GetTickets), new { id = newTicket.id }, newTicket);
    }

    private string DeterminePriority(string issueType, string description)
    {
        var lowerDesc = description.ToLower();
        if (lowerDesc.Contains("critical") || lowerDesc.Contains("urgent") || issueType.Contains("Critical"))
            return "Critical";
        if (lowerDesc.Contains("high") || issueType.Contains("High"))
            return "High";
        return "Medium";
    }
}

public class SupportTicketRequest
{
    public string IssueType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string SubmittedBy { get; set; } = string.Empty;
}


