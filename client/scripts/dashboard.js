// BioShield AI Dashboard JavaScript

// Use existing API_BASE_URL if defined, otherwise set it (avoid redeclaration error)
var API_BASE_URL = window.API_BASE_URL || 'http://localhost:5231/api';
window.API_BASE_URL = API_BASE_URL;

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    // Refresh every 30 seconds
    setInterval(loadDashboard, 30000);
});

// Load all dashboard data
async function loadDashboard() {
    try {
        const [vulnerabilities, stats] = await Promise.all([
            fetchVulnerabilities(),
            fetchStats()
        ]);
        
        displayThreats(vulnerabilities);
        displayStats(stats);
        displayTrendChart(stats.trendData);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        // Fallback to mock data if API fails
        displayMockData();
    }
}

// Fetch vulnerabilities from API
async function fetchVulnerabilities() {
    const response = await fetch(`${API_BASE_URL}/vulnerabilities`);
    if (!response.ok) {
        throw new Error('Failed to fetch vulnerabilities');
    }
    return await response.json();
}

// Fetch stats from API
async function fetchStats() {
    const response = await fetch(`${API_BASE_URL}/vulnerabilities/stats`);
    if (!response.ok) {
        throw new Error('Failed to fetch stats');
    }
    return await response.json();
}

// Display threats list
function displayThreats(vulnerabilities) {
    const threatsList = document.getElementById('threatsList');
    threatsList.innerHTML = '';

    vulnerabilities.forEach(vuln => {
        const threatItem = createThreatItem(vuln);
        threatsList.appendChild(threatItem);
    });
}

// Create a threat list item
function createThreatItem(vuln) {
    const item = document.createElement('div');
    item.className = `list-group-item threat-item ${vuln.severity.toLowerCase()}`;
    
    const scoreClass = getScoreClass(vuln.score);
    const relevanceClass = getRelevanceClass(vuln.biotechRelevance);
    
    item.innerHTML = `
        <div class="d-flex w-100 justify-content-between align-items-start mb-2">
            <div class="flex-grow-1">
                <h6 class="mb-1">
                    <span class="badge ${scoreClass} score-badge me-2">${vuln.score.toFixed(1)}</span>
                    ${vuln.cveId}
                </h6>
                <h5 class="mb-2">${vuln.title}</h5>
                <p class="mb-2 text-muted">${vuln.description}</p>
                <div class="mb-2">
                    ${vuln.affectedSystems.map(system => 
                        `<span class="affected-tag">${system}</span>`
                    ).join('')}
                </div>
                <small class="text-muted">
                    <i class="bi bi-calendar"></i> ${formatDate(vuln.discoveredDate)} | 
                    <span class="badge bg-secondary source-badge">${vuln.source}</span> | 
                    <span class="${relevanceClass}">
                        <i class="bi bi-heart-pulse"></i> ${vuln.biotechRelevance} Relevance
                    </span>
                </small>
            </div>
        </div>
    `;
    
    return item;
}

// Display statistics
function displayStats(stats) {
    document.getElementById('criticalCount').textContent = stats.criticalCount;
    document.getElementById('highCount').textContent = stats.highCount;
    document.getElementById('newToday').textContent = stats.newToday;
    document.getElementById('resolvedCount').textContent = stats.resolvedThisWeek;
    document.getElementById('totalVulnerabilities').textContent = stats.totalVulnerabilities.toLocaleString();
    document.getElementById('avgScore').textContent = stats.avgScore.toFixed(1);
    
    // Calculate relevance percentage (mock calculation)
    const relevancePercent = Math.min(100, (stats.criticalCount + stats.highCount) / stats.totalVulnerabilities * 100 * 2);
    document.getElementById('relevanceBar').style.width = `${relevancePercent}%`;
    document.getElementById('relevanceText').textContent = `${Math.round(relevancePercent)}%`;
    
    // Show alert if new critical threats
    if (stats.newToday > 0) {
        showAlert(`${stats.newToday} new threat${stats.newToday > 1 ? 's' : ''} detected today`);
    }
}

// Display trend chart
function displayTrendChart(trendData) {
    const canvas = document.getElementById('trendChart');
    const ctx = canvas.getContext('2d');
    
    // Simple line chart drawing
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 200;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Find max value for scaling
    const maxValue = Math.max(...trendData.map(d => d.count));
    
    // Draw axes
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
    // Draw line
    ctx.strokeStyle = '#0d6efd';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    trendData.forEach((point, index) => {
        const x = padding + (index / (trendData.length - 1)) * chartWidth;
        const y = height - padding - (point.count / maxValue) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Draw points
    ctx.fillStyle = '#0d6efd';
    trendData.forEach((point, index) => {
        const x = padding + (index / (trendData.length - 1)) * chartWidth;
        const y = height - padding - (point.count / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
    // Draw labels
    ctx.fillStyle = '#6c757d';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    trendData.forEach((point, index) => {
        const x = padding + (index / (trendData.length - 1)) * chartWidth;
        const date = new Date(point.date);
        const label = `${date.getMonth() + 1}/${date.getDate()}`;
        ctx.fillText(label, x, height - padding + 15);
    });
}

// Helper functions
function getScoreClass(score) {
    if (score >= 9.0) return 'score-critical';
    if (score >= 7.0) return 'score-high';
    if (score >= 4.0) return 'score-medium';
    return 'score-low';
}

function getRelevanceClass(relevance) {
    if (relevance === 'Very High' || relevance === 'High') return 'relevance-high';
    if (relevance === 'Medium') return 'relevance-medium';
    return 'relevance-low';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function showAlert(message) {
    const alertBanner = document.getElementById('alertBanner');
    const alertMessage = document.getElementById('alertMessage');
    alertMessage.textContent = message;
    alertBanner.style.display = 'block';
    alertBanner.classList.add('alert-pulse');
    
    // Auto-hide after 10 seconds
    setTimeout(() => {
        alertBanner.style.display = 'none';
    }, 10000);
}

// Mock data fallback
function displayMockData() {
    const mockVulnerabilities = [
        {
            id: 1,
            cveId: "CVE-2024-1234",
            title: "Critical SQL Injection in Lab Management Software",
            severity: "Critical",
            score: 9.8,
            description: "A critical SQL injection vulnerability allows remote attackers to execute arbitrary SQL commands.",
            affectedSystems: ["Lab Management Systems", "Research Databases"],
            discoveredDate: "2024-01-15",
            source: "EU-CERT",
            biotechRelevance: "High"
        },
        {
            id: 2,
            cveId: "CVE-2024-1235",
            title: "Remote Code Execution in DNA Analysis Tools",
            severity: "Critical",
            score: 9.5,
            description: "Remote code execution vulnerability in popular DNA sequencing software.",
            affectedSystems: ["DNA Analysis Tools", "Sequencing Software"],
            discoveredDate: "2024-01-14",
            source: "CVE Database",
            biotechRelevance: "Very High"
        }
    ];
    
    const mockStats = {
        totalVulnerabilities: 1247,
        criticalCount: 23,
        highCount: 156,
        newToday: 12,
        resolvedThisWeek: 45,
        avgScore: 6.8,
        trendData: [
            { date: "2024-01-08", count: 15 },
            { date: "2024-01-09", count: 18 },
            { date: "2024-01-10", count: 12 },
            { date: "2024-01-11", count: 22 },
            { date: "2024-01-12", count: 19 },
            { date: "2024-01-13", count: 16 },
            { date: "2024-01-14", count: 14 },
            { date: "2024-01-15", count: 12 }
        ]
    };
    
    displayThreats(mockVulnerabilities);
    displayStats(mockStats);
    displayTrendChart(mockStats.trendData);
}



