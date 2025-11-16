# BioShield AI - Tier 1 Threat Intelligence Platform

BioShield AI is a cybersecurity tool that uses artificial intelligence to help the Bio-ISAC community quickly understand which security threats matter most for biotechnology and life sciences organizations.

## 🎯 Project Overview

**The Problem**: Security professionals are drowning in IT/OT/ICS alerts. They need to identify which vulnerabilities actually matter for biotech systems and understand the biological/human consequences.

**The Solution**: BioShield AI transforms signal from noise by:
- Understanding bio-specific context (why a lab vulnerability ≠ web server vulnerability)
- Prioritizing threats based on biological and human impact
- Providing actionable remediation guidance with safety constraints
- Preventing alert fatigue through smart filtering

## 🏗️ Project Structure

```
bio-isac/
├── api/                    # .NET 8.0 Web API backend
│   ├── Controllers/        # API controllers
│   │   ├── VulnerabilitiesController.cs
│   │   ├── ChatbotController.cs
│   │   ├── SupportController.cs
│   │   └── DataSourcesController.cs
│   ├── Program.cs         # Application entry point
│   └── appsettings.json   # Configuration
├── client/                 # Frontend (vanilla HTML/CSS/JS)
│   ├── index.html         # Main dashboard page
│   ├── scripts/           # JavaScript files
│   │   ├── dashboard.js
│   │   └── enhanced-dashboard.js
│   └── styles/           # CSS files
│       └── main.css
├── SOLUTION_ARCHITECTURE.md  # Comprehensive architecture document
├── RISK_ASSESSMENT.md        # Risk assessment and mitigations
├── PRESENTATION_GUIDE.md     # Presentation talking points
└── project-overview.txt      # Original project requirements
```

## ✨ Key Features

### 1. Bio-Specific Threat Intelligence
- **Biological Impact Analysis**: Understands how vulnerabilities affect lab equipment, research data, and patient safety
- **Human Impact Assessment**: Analyzes potential for misdiagnosis, wrong treatments, or compromised patient safety
- **Sole Source Detection**: Identifies critical dependencies on single manufacturers

### 2. AI-Powered Prioritization
- **Bio-Relevance Scoring**: Filters out generic IT threats, focuses on bio-relevant ones
- **Multi-Factor Scoring**: Combines CVSS, bio-relevance, asset criticality, and sole-source multipliers
- **Alert Fatigue Prevention**: Only alerts on threats with bio-relevance > 0.6

### 3. Secure AI Assistant
- **Prompt Injection Protection**: Input sanitization and validation
- **Hallucination Prevention**: RAG with verified sources, confidence scoring
- **Safety Constraints**: Never suggests automated patching or system shutdowns

### 4. Actionable Remediation
- **Step-by-Step Guidance**: Clear remediation steps with safety constraints
- **Human Approval Required**: All high-risk actions require human approval
- **Safety Warnings**: Explicit warnings (e.g., "Do not patch during active sequencing")

### 5. Multi-Source Data Aggregation
- **EU-CERT, CVE, CISA, MITRE**: Multiple verified sources
- **Source Credibility Scoring**: Transparent source quality metrics
- **Cross-Validation**: Verifies data against multiple sources

### 6. 311-Style Support System
- **Community Knowledge Sharing**: Ticket system for questions and support
- **Expert Escalation**: Route complex issues to specialists
- **Response Time Tracking**: Monitor support performance

## 🚀 Getting Started

### Prerequisites

- .NET 8.0 SDK
- A modern web browser

### Running the Application

1. Navigate to the `api` folder:
   ```bash
   cd api
   ```

2. Restore dependencies and run the API:
   ```bash
   dotnet restore
   dotnet run
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:5231
   ```

The API will serve the static files from the `client` folder automatically.

## 📡 API Endpoints

### Vulnerabilities
- `GET /api/vulnerabilities` - Get all vulnerabilities with bio-impact analysis
- `GET /api/vulnerabilities/stats` - Get vulnerability statistics and trends

### Chatbot
- `POST /api/chatbot/query` - Query the AI assistant (with prompt injection protection)

### Support
- `GET /api/support/tickets` - Get support tickets
- `POST /api/support/tickets` - Create a new support ticket

### Data Sources
- `GET /api/datasources` - Get all data sources with credibility scores
- `GET /api/datasources/{id}/validation` - Get source validation report

## 🛡️ Security Features

### Risk Mitigations

1. **Disclosure Risk**: Strong access controls, encryption, audit logging
2. **Alert Fatigue**: Bio-relevance filtering, smart grouping, user preferences
3. **Actionability Risk**: Human approval gates, safety constraints, no automation for critical systems
4. **Hallucination Risk**: RAG with verified sources, confidence scoring, source citations
5. **Prompt Injection Risk**: Input sanitization, role-based context, output validation

See `RISK_ASSESSMENT.md` for comprehensive risk analysis.

## 📊 Technology Stack

- **Backend**: ASP.NET Core Web API (.NET 8.0)
- **Frontend**: Vanilla HTML, CSS, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5.3.3 (via CDN)
- **Database**: SQLite (to be configured for production)

## 🎯 Project Phases

### Phase 1: POC (Current Semester) ✅
- Core dashboard with mock data
- Basic AI analysis structure
- Chatbot prototype with security hardening
- Risk assessment documentation
- Integration proof-of-concept

### Phase 2: MVP (Next Semester)
- Real data source integration
- Advanced AI prioritization
- Full security hardening
- User authentication
- Complete remediation guidance

### Phase 3: Production
- Full multi-source integration
- Advanced AI models
- Community features
- Full integration capabilities

## 📚 Documentation

- **SOLUTION_ARCHITECTURE.md**: Comprehensive architecture and design
- **RISK_ASSESSMENT.md**: Detailed risk analysis and mitigations
- **PRESENTATION_GUIDE.md**: Presentation talking points and Q&A

## 🎓 Key Differentiators

1. **Bio-Specific Context**: Understands biotechnology environments, not just generic IT
2. **Signal vs. Noise**: Filters out irrelevant threats, focuses on what matters
3. **Safety First**: Never automates dangerous actions, always requires human approval
4. **Actionable Intelligence**: Provides remediation guidance, not just alerts
5. **Community-Focused**: 311-style support, information sharing, collaboration

## 🤝 Contributing

This is a project for the Bio-ISAC community. For questions or contributions, please use the support ticket system within the application.

## 📝 License

This project is developed for the Bio-ISAC community.

## 🙏 Acknowledgments

- Bio-ISAC community for requirements and feedback
- EU-CERT, CVE, CISA, and other data sources
- Security research community

---

**Remember**: This is more than a tool—it's a force multiplier for the Bio-ISAC community, enabling faster, more informed security decisions that protect not just data, but lives.
