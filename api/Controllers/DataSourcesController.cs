using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DataSourcesController : ControllerBase
{
    // GET: api/datasources
    [HttpGet]
    public IActionResult GetDataSources()
    {
        var sources = new[]
        {
            new
            {
                id = 1,
                name = "EU-CERT",
                type = "Government Advisory",
                credibilityScore = 0.95,
                lastUpdated = "2024-01-15T08:00:00",
                updateFrequency = "Daily",
                accessMethod = "API + Email Alerts",
                validationStatus = "Verified",
                whyChosen = "Primary source for European biotech sector threats. High credibility due to government backing and direct relevance to Bio-ISAC community.",
                limitations = "May have delay in reporting non-EU threats",
                coverage = new[] { "European Union", "Biotech Sector", "Critical Infrastructure" },
                dataQuality = "Excellent"
            },
            new
            {
                id = 2,
                name = "CVE Database (NIST NVD)",
                type = "Public Database",
                credibilityScore = 0.90,
                lastUpdated = "2024-01-15T06:00:00",
                updateFrequency = "Real-time",
                accessMethod = "API",
                validationStatus = "Verified",
                whyChosen = "Comprehensive, standardized vulnerability database. Essential for cross-referencing and validation.",
                limitations = "Generic IT focus, requires bio-relevance filtering",
                coverage = new[] { "Global", "All Sectors", "Software Vulnerabilities" },
                dataQuality = "Excellent"
            },
            new
            {
                id = 3,
                name = "CISA Advisories",
                type = "Government Advisory",
                credibilityScore = 0.92,
                lastUpdated = "2024-01-14T16:00:00",
                updateFrequency = "As needed",
                accessMethod = "RSS Feed + Email",
                validationStatus = "Verified",
                whyChosen = "Authoritative source for US-based threats. Critical for Bio-ISAC members with US operations.",
                limitations = "US-focused, may miss international threats",
                coverage = new[] { "United States", "Critical Infrastructure", "Healthcare" },
                dataQuality = "Excellent"
            },
            new
            {
                id = 4,
                name = "MITRE ATT&CK",
                type = "Threat Intelligence Framework",
                credibilityScore = 0.88,
                lastUpdated = "2024-01-10T12:00:00",
                updateFrequency = "Weekly",
                accessMethod = "API",
                validationStatus = "Verified",
                whyChosen = "Provides attack pattern context, helps understand how vulnerabilities are exploited in real attacks.",
                limitations = "Tactical focus, less operational",
                coverage = new[] { "Attack Patterns", "Tactics", "Techniques" },
                dataQuality = "Very Good"
            },
            new
            {
                id = 5,
                name = "Proprietary Email Feed",
                type = "Proprietary",
                credibilityScore = 0.85,
                lastUpdated = "2024-01-15T09:30:00",
                updateFrequency = "As received",
                accessMethod = "Email Parsing",
                validationStatus = "Under Review",
                whyChosen = "Three-letter agency provides proprietary threat list. Contains non-public intelligence.",
                limitations = "Requires manual processing, classification concerns",
                coverage = new[] { "Classified Threats", "Advanced Persistent Threats" },
                dataQuality = "Good (requires validation)"
            }
        };

        return Ok(sources);
    }

    // GET: api/datasources/{id}/validation
    [HttpGet("{id}/validation")]
    public IActionResult GetSourceValidation(int id)
    {
        // Mock validation report
        var validation = new
        {
            sourceId = id,
            lastValidated = "2024-01-15T10:00:00",
            validationMethod = "Cross-reference with CVE database and expert review",
            accuracyScore = 0.94,
            completenessScore = 0.87,
            timelinessScore = 0.91,
            overallRating = "Excellent",
            issues = new string[0],
            recommendations = new[] { "Continue using as primary source", "Monitor for any changes in data quality" }
        };

        return Ok(validation);
    }
}



