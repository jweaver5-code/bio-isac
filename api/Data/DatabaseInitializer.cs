using Microsoft.Data.Sqlite;
using api.Models;

namespace api.Data;

public static class DatabaseInitializer
{
    public static void Initialize(string connectionString)
    {
        // Extract the database file path from the connection string
        var builder = new SqliteConnectionStringBuilder(connectionString);
        var dbPath = builder.DataSource;
        
        // Ensure the directory exists
        if (!string.IsNullOrEmpty(dbPath))
        {
            var directory = Path.GetDirectoryName(dbPath);
            if (!string.IsNullOrEmpty(directory) && !Directory.Exists(directory))
            {
                Directory.CreateDirectory(directory);
            }
        }
        
        using var connection = new SqliteConnection(connectionString);
        connection.Open();

        // Create vulnerabilities table
        var createVulnerabilitiesTable = @"
            CREATE TABLE IF NOT EXISTS vulnerabilities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cve_id TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                description TEXT,
                severity TEXT,
                score REAL,
                bio_relevance_score REAL,
                priority_score REAL,
                source TEXT,
                source_credibility TEXT,
                biotech_relevance TEXT,
                biological_impact TEXT,
                human_impact TEXT,
                sole_source_flag INTEGER DEFAULT 0,
                discovered_date TEXT,
                affected_systems TEXT,
                created_at TEXT NOT NULL,
                ai_rating REAL,
                user_rating REAL,
                is_reviewed INTEGER DEFAULT 0,
                reviewed_at TEXT
            )";

        using (var command = new SqliteCommand(createVulnerabilitiesTable, connection))
        {
            command.ExecuteNonQuery();
        }

        // Create AI configuration table
        var createAiConfigTable = @"
            CREATE TABLE IF NOT EXISTS ai_configurations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT NOT NULL DEFAULT 'default',
                bio_relevance_weight REAL DEFAULT 0.4,
                cvss_weight REAL DEFAULT 0.3,
                sole_source_multiplier REAL DEFAULT 1.5,
                human_impact_weight REAL DEFAULT 0.3,
                bio_relevance_threshold REAL DEFAULT 0.6,
                updated_at TEXT NOT NULL,
                UNIQUE(user_id)
            )";

        using (var command = new SqliteCommand(createAiConfigTable, connection))
        {
            command.ExecuteNonQuery();
        }

        // Insert default AI configuration if it doesn't exist
        var insertDefaultConfig = @"
            INSERT OR IGNORE INTO ai_configurations 
            (user_id, bio_relevance_weight, cvss_weight, sole_source_multiplier, human_impact_weight, bio_relevance_threshold, updated_at)
            VALUES ('default', 0.4, 0.3, 1.5, 0.3, 0.6, datetime('now'))
        ";

        using (var command = new SqliteCommand(insertDefaultConfig, connection))
        {
            command.ExecuteNonQuery();
        }

        // Insert sample vulnerabilities if table is empty
        var checkCount = "SELECT COUNT(*) FROM vulnerabilities";
        using (var command = new SqliteCommand(checkCount, connection))
        {
            var count = Convert.ToInt64(command.ExecuteScalar());
            if (count == 0)
            {
                InsertSampleVulnerabilities(connection);
            }
        }
    }

    private static void InsertSampleVulnerabilities(SqliteConnection connection)
    {
        var vulnerabilities = new[]
        {
            new { 
                CveId = "CVE-2024-1234", 
                Title = "Critical SQL Injection in Lab Management Software",
                Description = "A critical SQL injection vulnerability allows remote attackers to execute arbitrary SQL commands.",
                Severity = "Critical",
                Score = 9.8,
                BioRelevanceScore = 0.92,
                PriorityScore = 9.5,
                Source = "EU-CERT",
                SourceCredibility = "High",
                BiotechRelevance = "Very High",
                BiologicalImpact = "Compromise of research data could lead to intellectual property theft, delayed drug development, or contamination protocols being exposed.",
                HumanImpact = "Potential exposure of patient data in clinical trials. Research delays could impact patient treatments.",
                SoleSourceFlag = false,
                DiscoveredDate = "2024-01-15",
                AffectedSystems = "[\"Lab Management Systems\", \"Research Databases\"]",
                AiRating = 9.5
            },
            new { 
                CveId = "CVE-2024-1235", 
                Title = "Remote Code Execution in DNA Analysis Tools",
                Description = "Remote code execution vulnerability in popular DNA sequencing software.",
                Severity = "Critical",
                Score = 9.5,
                BioRelevanceScore = 0.98,
                PriorityScore = 9.7,
                Source = "CVE Database",
                SourceCredibility = "High",
                BiotechRelevance = "Very High",
                BiologicalImpact = "Attacker could manipulate DNA sequencing results, leading to incorrect research conclusions, contaminated samples, or compromised genetic data integrity.",
                HumanImpact = "Critical: Incorrect sequencing could lead to misdiagnosis, wrong treatments, or compromised patient safety in clinical applications.",
                SoleSourceFlag = true,
                DiscoveredDate = "2024-01-14",
                AffectedSystems = "[\"DNA Analysis Tools\", \"Sequencing Software\"]",
                AiRating = 9.7
            },
            new { 
                CveId = "CVE-2024-1236", 
                Title = "Authentication Bypass in Medical Research Platform",
                Description = "Authentication bypass allows unauthorized access to sensitive research data.",
                Severity = "High",
                Score = 8.2,
                BioRelevanceScore = 0.85,
                PriorityScore = 8.4,
                Source = "EU-CERT",
                SourceCredibility = "Very High",
                BiotechRelevance = "High",
                BiologicalImpact = "Unauthorized access to clinical trial data could compromise research integrity, expose patient information, or allow data manipulation.",
                HumanImpact = "Patient privacy violation. Potential for research fraud or data tampering affecting treatment outcomes.",
                SoleSourceFlag = false,
                DiscoveredDate = "2024-01-13",
                AffectedSystems = "[\"Medical Research Platforms\", \"Clinical Trial Systems\"]",
                AiRating = 8.4
            },
            new { 
                CveId = "CVE-2024-1237", 
                Title = "Cross-Site Scripting in Patient Data Portal",
                Description = "XSS vulnerability could allow attackers to steal patient information.",
                Severity = "Medium",
                Score = 6.5,
                BioRelevanceScore = 0.65,
                PriorityScore = 6.8,
                Source = "CVE Database",
                SourceCredibility = "High",
                BiotechRelevance = "Medium",
                BiologicalImpact = "Limited direct biological impact, but patient data exposure could lead to privacy violations.",
                HumanImpact = "Patient privacy concerns. Potential for identity theft or medical record tampering.",
                SoleSourceFlag = false,
                DiscoveredDate = "2024-01-12",
                AffectedSystems = "[\"Patient Portals\", \"Healthcare Systems\"]",
                AiRating = 6.8
            },
            new { 
                CveId = "CVE-2024-1238", 
                Title = "Privilege Escalation in Lab Equipment Control",
                Description = "Privilege escalation vulnerability in laboratory equipment control software.",
                Severity = "High",
                Score = 7.8,
                BioRelevanceScore = 0.88,
                PriorityScore = 8.1,
                Source = "EU-CERT",
                SourceCredibility = "Very High",
                BiotechRelevance = "High",
                BiologicalImpact = "Attacker could gain control of lab equipment, potentially altering experiment parameters, contaminating samples, or disrupting critical research processes.",
                HumanImpact = "Equipment manipulation could lead to incorrect research results, sample contamination, or safety hazards in labs handling hazardous materials.",
                SoleSourceFlag = false,
                DiscoveredDate = "2024-01-11",
                AffectedSystems = "[\"Lab Equipment\", \"Automation Systems\"]",
                AiRating = 8.1
            }
        };

        foreach (var vuln in vulnerabilities)
        {
            var insert = @"
                INSERT INTO vulnerabilities 
                (cve_id, title, description, severity, score, bio_relevance_score, priority_score, 
                 source, source_credibility, biotech_relevance, biological_impact, human_impact, 
                 sole_source_flag, discovered_date, affected_systems, created_at, ai_rating, is_reviewed)
                VALUES 
                (@cveId, @title, @description, @severity, @score, @bioRelevanceScore, @priorityScore,
                 @source, @sourceCredibility, @biotechRelevance, @biologicalImpact, @humanImpact,
                 @soleSourceFlag, @discoveredDate, @affectedSystems, datetime('now'), @aiRating, 0)
            ";

            using var command = new SqliteCommand(insert, connection);
            command.Parameters.AddWithValue("@cveId", vuln.CveId);
            command.Parameters.AddWithValue("@title", vuln.Title);
            command.Parameters.AddWithValue("@description", vuln.Description);
            command.Parameters.AddWithValue("@severity", vuln.Severity);
            command.Parameters.AddWithValue("@score", vuln.Score);
            command.Parameters.AddWithValue("@bioRelevanceScore", vuln.BioRelevanceScore);
            command.Parameters.AddWithValue("@priorityScore", vuln.PriorityScore);
            command.Parameters.AddWithValue("@source", vuln.Source);
            command.Parameters.AddWithValue("@sourceCredibility", vuln.SourceCredibility);
            command.Parameters.AddWithValue("@biotechRelevance", vuln.BiotechRelevance);
            command.Parameters.AddWithValue("@biologicalImpact", vuln.BiologicalImpact);
            command.Parameters.AddWithValue("@humanImpact", vuln.HumanImpact);
            command.Parameters.AddWithValue("@soleSourceFlag", vuln.SoleSourceFlag ? 1 : 0);
            command.Parameters.AddWithValue("@discoveredDate", vuln.DiscoveredDate);
            command.Parameters.AddWithValue("@affectedSystems", vuln.AffectedSystems);
            command.Parameters.AddWithValue("@aiRating", vuln.AiRating);
            command.ExecuteNonQuery();
        }
    }
}

