using Microsoft.AspNetCore.Mvc;

namespace api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VulnerabilitiesController : ControllerBase
{
    // GET: api/vulnerabilities
    [HttpGet]
    public IActionResult GetVulnerabilities()
    {
        // Mock data for initial mockup
        var vulnerabilities = new[]
        {
            new
            {
                id = 1,
                cveId = "CVE-2024-1234",
                title = "Critical SQL Injection in Lab Management Software",
                severity = "Critical",
                score = 9.8,
                bioRelevanceScore = 0.92,
                priorityScore = 9.5,
                description = "A critical SQL injection vulnerability allows remote attackers to execute arbitrary SQL commands.",
                affectedSystems = new[] { "Lab Management Systems", "Research Databases" },
                discoveredDate = "2024-01-15",
                source = "EU-CERT",
                sourceCredibility = "High",
                biotechRelevance = "Very High",
                biologicalImpact = "Compromise of research data could lead to intellectual property theft, delayed drug development, or contamination protocols being exposed.",
                humanImpact = "Potential exposure of patient data in clinical trials. Research delays could impact patient treatments.",
                soleSourceFlag = false,
                remediationGuidance = new
                {
                    steps = new[]
                    {
                        "Review and sanitize all SQL queries in lab management software",
                        "Implement parameterized queries",
                        "Test in non-production environment first",
                        "Schedule maintenance window for deployment",
                        "Verify data integrity after patch"
                    },
                    estimatedDowntime = "2-4 hours",
                    rollbackProcedure = "Maintain database backup before patching",
                    requiresApproval = true,
                    safetyConstraints = new[] { "Do not patch during active experiments", "Coordinate with lab managers" }
                }
            },
            new
            {
                id = 2,
                cveId = "CVE-2024-1235",
                title = "Remote Code Execution in DNA Analysis Tools",
                severity = "Critical",
                score = 9.5,
                bioRelevanceScore = 0.98,
                priorityScore = 9.7,
                description = "Remote code execution vulnerability in popular DNA sequencing software.",
                affectedSystems = new[] { "DNA Analysis Tools", "Sequencing Software" },
                discoveredDate = "2024-01-14",
                source = "CVE Database",
                sourceCredibility = "High",
                biotechRelevance = "Very High",
                biologicalImpact = "Attacker could manipulate DNA sequencing results, leading to incorrect research conclusions, contaminated samples, or compromised genetic data integrity.",
                humanImpact = "Critical: Incorrect sequencing could lead to misdiagnosis, wrong treatments, or compromised patient safety in clinical applications.",
                soleSourceFlag = true,
                remediationGuidance = new
                {
                    steps = new[]
                    {
                        "Apply vendor patch immediately",
                        "Isolate affected systems from network if possible",
                        "Verify sequencing accuracy after patch",
                        "Review recent sequencing results for anomalies"
                    },
                    estimatedDowntime = "4-6 hours",
                    rollbackProcedure = "Maintain system image backup",
                    requiresApproval = true,
                    safetyConstraints = new[] { "CRITICAL: Do not patch during active sequencing runs", "Notify all researchers", "Verify sample integrity" }
                }
            },
            new
            {
                id = 3,
                cveId = "CVE-2024-1236",
                title = "Authentication Bypass in Medical Research Platform",
                severity = "High",
                score = 8.2,
                bioRelevanceScore = 0.85,
                priorityScore = 8.4,
                description = "Authentication bypass allows unauthorized access to sensitive research data.",
                affectedSystems = new[] { "Medical Research Platforms", "Clinical Trial Systems" },
                discoveredDate = "2024-01-13",
                source = "EU-CERT",
                sourceCredibility = "Very High",
                biotechRelevance = "High",
                biologicalImpact = "Unauthorized access to clinical trial data could compromise research integrity, expose patient information, or allow data manipulation.",
                humanImpact = "Patient privacy violation. Potential for research fraud or data tampering affecting treatment outcomes.",
                soleSourceFlag = false,
                remediationGuidance = new
                {
                    steps = new[]
                    {
                        "Implement multi-factor authentication",
                        "Review and audit all access logs",
                        "Rotate all credentials",
                        "Enable additional access controls"
                    },
                    estimatedDowntime = "1-2 hours",
                    rollbackProcedure = "Maintain authentication configuration backup",
                    requiresApproval = true,
                    safetyConstraints = new[] { "Ensure legitimate users maintain access", "Coordinate with clinical trial managers" }
                }
            },
            new
            {
                id = 4,
                cveId = "CVE-2024-1237",
                title = "Cross-Site Scripting in Patient Data Portal",
                severity = "Medium",
                score = 6.5,
                bioRelevanceScore = 0.65,
                priorityScore = 6.8,
                description = "XSS vulnerability could allow attackers to steal patient information.",
                affectedSystems = new[] { "Patient Portals", "Healthcare Systems" },
                discoveredDate = "2024-01-12",
                source = "CVE Database",
                sourceCredibility = "High",
                biotechRelevance = "Medium",
                biologicalImpact = "Limited direct biological impact, but patient data exposure could lead to privacy violations.",
                humanImpact = "Patient privacy concerns. Potential for identity theft or medical record tampering.",
                soleSourceFlag = false,
                remediationGuidance = new
                {
                    steps = new[]
                    {
                        "Implement Content Security Policy (CSP)",
                        "Sanitize all user inputs",
                        "Update affected components",
                        "Test thoroughly before deployment"
                    },
                    estimatedDowntime = "30 minutes - 1 hour",
                    rollbackProcedure = "Standard web application rollback",
                    requiresApproval = false,
                    safetyConstraints = new string[0]
                }
            },
            new
            {
                id = 5,
                cveId = "CVE-2024-1238",
                title = "Privilege Escalation in Lab Equipment Control",
                severity = "High",
                score = 7.8,
                bioRelevanceScore = 0.88,
                priorityScore = 8.1,
                description = "Privilege escalation vulnerability in laboratory equipment control software.",
                affectedSystems = new[] { "Lab Equipment", "Automation Systems" },
                discoveredDate = "2024-01-11",
                source = "EU-CERT",
                sourceCredibility = "Very High",
                biotechRelevance = "High",
                biologicalImpact = "Attacker could gain control of lab equipment, potentially altering experiment parameters, contaminating samples, or disrupting critical research processes.",
                humanImpact = "Equipment manipulation could lead to incorrect research results, sample contamination, or safety hazards in labs handling hazardous materials.",
                soleSourceFlag = false,
                remediationGuidance = new
                {
                    steps = new[]
                    {
                        "Apply vendor security patch",
                        "Review equipment access logs for suspicious activity",
                        "Implement network segmentation for lab equipment",
                        "Update access control policies"
                    },
                    estimatedDowntime = "2-3 hours",
                    rollbackProcedure = "Equipment firmware backup available",
                    requiresApproval = true,
                    safetyConstraints = new[] { "Do not patch during active experiments", "Coordinate with lab safety officers", "Verify equipment calibration after patch" }
                }
            }
        };

        return Ok(vulnerabilities);
    }

    // GET: api/vulnerabilities/stats
    [HttpGet("stats")]
    public IActionResult GetStats()
    {
        var stats = new
        {
            totalVulnerabilities = 1247,
            criticalCount = 23,
            highCount = 156,
            mediumCount = 892,
            lowCount = 176,
            newToday = 12,
            resolvedThisWeek = 45,
            avgScore = 6.8,
            trendData = new[]
            {
                new { date = "2024-01-08", count = 15 },
                new { date = "2024-01-09", count = 18 },
                new { date = "2024-01-10", count = 12 },
                new { date = "2024-01-11", count = 22 },
                new { date = "2024-01-12", count = 19 },
                new { date = "2024-01-13", count = 16 },
                new { date = "2024-01-14", count = 14 },
                new { date = "2024-01-15", count = 12 }
            }
        };

        return Ok(stats);
    }
}

