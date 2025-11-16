using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChatbotController : ControllerBase
{
    // POST: api/chatbot/query
    [HttpPost("query")]
    public IActionResult QueryChatbot([FromBody] ChatbotRequest request)
    {
        // Input sanitization and validation
        if (string.IsNullOrWhiteSpace(request?.Query))
        {
            return BadRequest(new { error = "Query cannot be empty" });
        }

        // Basic prompt injection protection - detect suspicious patterns
        var sanitizedQuery = SanitizeInput(request.Query);
        
        // Rate limiting would be implemented here in production
        // For now, we'll simulate with a simple check
        
        // Mock AI response with safety constraints
        var response = GenerateSafeResponse(sanitizedQuery, request.VulnerabilityId);
        
        return Ok(response);
    }

    private string SanitizeInput(string input)
    {
        // Remove potential prompt injection attempts
        var dangerousPatterns = new[]
        {
            "ignore previous instructions",
            "forget all previous",
            "you are now",
            "system:",
            "assistant:",
            "user:",
            "<|",
            "[[",
            "{{"
        };

        var sanitized = input;
        foreach (var pattern in dangerousPatterns)
        {
            if (sanitized.Contains(pattern, StringComparison.OrdinalIgnoreCase))
            {
                // Log potential injection attempt (would log to security system in production)
                sanitized = sanitized.Replace(pattern, "", StringComparison.OrdinalIgnoreCase);
            }
        }

        return sanitized.Trim();
    }

    private object GenerateSafeResponse(string query, int? vulnerabilityId)
    {
        var lowerQuery = query.ToLower();
        
        // Ground responses in verified data - don't hallucinate
        if (lowerQuery.Contains("cve-2024-1235") || (vulnerabilityId == 2))
        {
            return new
            {
                response = "CVE-2024-1235 is a Critical Remote Code Execution vulnerability in DNA Analysis Tools. " +
                          "**Biological Impact**: Attacker could manipulate DNA sequencing results, leading to incorrect research conclusions or contaminated samples. " +
                          "**Human Impact**: Critical - incorrect sequencing could lead to misdiagnosis or wrong treatments. " +
                          "**Remediation**: Apply vendor patch immediately, but DO NOT patch during active sequencing runs. Coordinate with researchers first. " +
                          "**Source**: CVE Database (High Credibility)",
                confidence = 0.95,
                sources = new[] { "CVE Database", "EU-CERT Advisory" },
                requiresHumanReview = false,
                safetyWarnings = new[] { "Do not automate patching", "Coordinate with lab staff" }
            };
        }

        if (lowerQuery.Contains("remediation") || lowerQuery.Contains("how to fix"))
        {
            return new
            {
                response = "I can provide remediation guidance, but all patches require human approval. " +
                          "I will never suggest automated patching of critical systems. " +
                          "Please specify which vulnerability (CVE ID) you need help with, and I'll provide step-by-step guidance with safety constraints.",
                confidence = 0.90,
                sources = new[] { "BioShield AI Remediation Framework" },
                requiresHumanReview = false,
                safetyWarnings = new[] { "All remediation requires human approval" }
            };
        }

        if (lowerQuery.Contains("patch") && (lowerQuery.Contains("automate") || lowerQuery.Contains("auto")))
        {
            return new
            {
                response = "I cannot and will not recommend automated patching for biotech systems. " +
                          "All patches must be reviewed and approved by security and lab personnel. " +
                          "This is a safety constraint to prevent disruption of active experiments or clinical trials.",
                confidence = 1.0,
                sources = new[] { "BioShield AI Safety Policy" },
                requiresHumanReview = true,
                safetyWarnings = new[] { "Automated patching is prohibited" }
            };
        }

        // Default response - grounded in knowledge base
        return new
        {
            response = "I can help you understand vulnerabilities, their biological impact, and remediation guidance. " +
                      "However, I'm designed to be cautious and will always require human approval for high-risk actions. " +
                      "What specific vulnerability or threat would you like to know more about?",
            confidence = 0.85,
            sources = new[] { "BioShield AI Knowledge Base" },
            requiresHumanReview = false,
            safetyWarnings = new string[0]
        };
    }
}

public class ChatbotRequest
{
    public string Query { get; set; } = string.Empty;
    public int? VulnerabilityId { get; set; }
}



