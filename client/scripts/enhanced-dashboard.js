// Enhanced BioShield AI Dashboard with Advanced Features

const API_BASE_URL = 'http://localhost:5231/api';

// Initialize enhanced dashboard
document.addEventListener('DOMContentLoaded', () => {
    loadEnhancedDashboard();
    initializeChatbot();
    initializeSupportSystem();
    setInterval(loadEnhancedDashboard, 30000);
});

// Load all dashboard data with enhanced features
async function loadEnhancedDashboard() {
    try {
        const [vulnerabilities, stats, dataSources] = await Promise.all([
            fetchVulnerabilities(),
            fetchStats(),
            fetchDataSources()
        ]);
        
        displayEnhancedThreats(vulnerabilities);
        displayStats(stats);
        displayTrendChart(stats.trendData);
        displayDataSources(dataSources);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        displayMockData();
    }
}

// Fetch functions
async function fetchVulnerabilities() {
    const response = await fetch(`${API_BASE_URL}/vulnerabilities`);
    if (!response.ok) throw new Error('Failed to fetch vulnerabilities');
    return await response.json();
}

async function fetchStats() {
    const response = await fetch(`${API_BASE_URL}/vulnerabilities/stats`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return await response.json();
}

async function fetchDataSources() {
    const response = await fetch(`${API_BASE_URL}/datasources`);
    if (!response.ok) throw new Error('Failed to fetch data sources');
    return await response.json();
}

// Display enhanced threats with bio-impact
function displayEnhancedThreats(vulnerabilities) {
    const threatsList = document.getElementById('threatsList');
    if (!threatsList) return;
    
    threatsList.innerHTML = '';

    vulnerabilities.forEach(vuln => {
        const threatItem = createEnhancedThreatItem(vuln);
        threatsList.appendChild(threatItem);
    });
}

// Create enhanced threat item with bio-impact visualization
function createEnhancedThreatItem(vuln) {
    const item = document.createElement('div');
    item.className = `list-group-item threat-item ${vuln.severity.toLowerCase()}`;
    
    const scoreClass = getScoreClass(vuln.score);
    const relevanceClass = getRelevanceClass(vuln.biotechRelevance);
    const priorityScore = vuln.priorityScore || vuln.score;
    const bioRelevance = vuln.bioRelevanceScore || 0;
    
    // Sole source indicator
    const soleSourceBadge = vuln.soleSourceFlag 
        ? '<span class="badge bg-danger ms-2"><i class="bi bi-exclamation-octagon"></i> Sole Source</span>' 
        : '';
    
    item.innerHTML = `
        <div class="d-flex w-100 justify-content-between align-items-start mb-2">
            <div class="flex-grow-1">
                <div class="d-flex align-items-center mb-2">
                    <span class="badge ${scoreClass} score-badge me-2">${priorityScore.toFixed(1)}</span>
                    <strong>${vuln.cveId}</strong>
                    ${soleSourceBadge}
                    <span class="badge bg-secondary source-badge ms-2" title="Source: ${vuln.sourceCredibility || 'Unknown'}">${vuln.source}</span>
                </div>
                <h5 class="mb-2">${vuln.title}</h5>
                <p class="mb-2 text-muted">${vuln.description}</p>
                
                <!-- Bio-Impact Section -->
                <div class="alert alert-warning mb-2" style="background-color: #fff3cd; border-left: 4px solid #ffc107;">
                    <strong><i class="bi bi-flower1"></i> Biological Impact:</strong>
                    <p class="mb-1 small">${vuln.biologicalImpact || 'Analysis pending'}</p>
                </div>
                
                <div class="alert alert-danger mb-2" style="background-color: #f8d7da; border-left: 4px solid #dc3545;">
                    <strong><i class="bi bi-person-exclamation"></i> Human Impact:</strong>
                    <p class="mb-1 small">${vuln.humanImpact || 'Analysis pending'}</p>
                </div>
                
                <!-- Bio-Relevance Score -->
                <div class="mb-2">
                    <small class="text-muted">Bio-Relevance Score: </small>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar bg-success" role="progressbar" 
                             style="width: ${bioRelevance * 100}%" 
                             aria-valuenow="${bioRelevance * 100}" 
                             aria-valuemin="0" 
                             aria-valuemax="100">
                            ${(bioRelevance * 100).toFixed(0)}%
                        </div>
                    </div>
                </div>
                
                <!-- Affected Systems -->
                <div class="mb-2">
                    ${vuln.affectedSystems.map(system => 
                        `<span class="affected-tag"><i class="bi bi-cpu"></i> ${system}</span>`
                    ).join('')}
                </div>
                
                <!-- Remediation Guidance Button -->
                ${vuln.remediationGuidance ? `
                    <button class="btn btn-sm btn-primary mt-2" onclick="showRemediation(${vuln.id})">
                        <i class="bi bi-shield-check"></i> View Remediation Guidance
                    </button>
                    <button class="btn btn-sm btn-outline-primary mt-2 ms-2" onclick="askChatbot(${vuln.id}, '${vuln.cveId}')">
                        <i class="bi bi-chat-dots"></i> Ask AI Assistant
                    </button>
                ` : ''}
                
                <div class="mt-2">
                    <small class="text-muted">
                        <i class="bi bi-calendar"></i> ${formatDate(vuln.discoveredDate)} | 
                        <span class="${relevanceClass}">
                            <i class="bi bi-heart-pulse"></i> ${vuln.biotechRelevance} Relevance
                        </span>
                    </small>
                </div>
            </div>
        </div>
    `;
    
    return item;
}

// Display data sources
function displayDataSources(sources) {
    const sourcesContainer = document.getElementById('dataSourcesList');
    if (!sourcesContainer) return;
    
    sourcesContainer.innerHTML = '';
    
    sources.forEach(source => {
        const sourceCard = document.createElement('div');
        sourceCard.className = 'card mb-2';
        sourceCard.innerHTML = `
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <h6 class="card-title">${source.name}</h6>
                        <p class="card-text small text-muted">${source.type}</p>
                        <div class="mb-2">
                            <small>Credibility: </small>
                            <div class="progress" style="height: 15px; width: 200px;">
                                <div class="progress-bar bg-success" 
                                     style="width: ${source.credibilityScore * 100}%">
                                    ${(source.credibilityScore * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>
                        <p class="card-text small"><strong>Why chosen:</strong> ${source.whyChosen}</p>
                        <p class="card-text small text-muted">
                            Last updated: ${formatDate(source.lastUpdated)} | 
                            Frequency: ${source.updateFrequency}
                        </p>
                    </div>
                    <span class="badge ${getValidationBadgeClass(source.validationStatus)}">
                        ${source.validationStatus}
                    </span>
                </div>
            </div>
        `;
        sourcesContainer.appendChild(sourceCard);
    });
}

// Initialize chatbot
function initializeChatbot() {
    const chatbotForm = document.getElementById('chatbotForm');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotMessages = document.getElementById('chatbotMessages');
    
    if (!chatbotForm || !chatbotInput || !chatbotMessages) return;
    
    chatbotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const query = chatbotInput.value.trim();
        if (!query) return;
        
        // Add user message
        addChatbotMessage(query, 'user');
        chatbotInput.value = '';
        
        // Get AI response
        try {
            const response = await fetch(`${API_BASE_URL}/chatbot/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            
            const data = await response.json();
            addChatbotMessage(data.response, 'assistant', data);
        } catch (error) {
            addChatbotMessage('Sorry, I encountered an error. Please try again.', 'assistant');
        }
    });
}

// Add chatbot message
function addChatbotMessage(message, role, metadata = null) {
    const chatbotMessages = document.getElementById('chatbotMessages');
    if (!chatbotMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `mb-2 p-2 rounded ${role === 'user' ? 'bg-primary text-white ms-auto' : 'bg-light'}`;
    messageDiv.style.maxWidth = '80%';
    messageDiv.style.marginLeft = role === 'user' ? 'auto' : '0';
    
    let content = `<div>${message}</div>`;
    
    if (metadata) {
        if (metadata.sources && metadata.sources.length > 0) {
            content += `<div class="mt-2 small"><strong>Sources:</strong> ${metadata.sources.join(', ')}</div>`;
        }
        if (metadata.safetyWarnings && metadata.safetyWarnings.length > 0) {
            content += `<div class="mt-2 small text-danger"><strong>⚠ Safety:</strong> ${metadata.safetyWarnings.join('; ')}</div>`;
        }
        if (metadata.requiresHumanReview) {
            content += `<div class="mt-2 small text-warning"><strong>⚠ Requires Human Review</strong></div>`;
        }
    }
    
    messageDiv.innerHTML = content;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Ask chatbot about specific vulnerability
function askChatbot(vulnId, cveId) {
    const chatbotModal = new bootstrap.Modal(document.getElementById('chatbotModal'));
    chatbotModal.show();
    
    const chatbotInput = document.getElementById('chatbotInput');
    if (chatbotInput) {
        chatbotInput.value = `Tell me about ${cveId} and its biological impact`;
        chatbotInput.dispatchEvent(new Event('input'));
    }
}

// Show remediation guidance
function showRemediation(vulnId) {
    // This would fetch and display remediation guidance
    // For now, show in chatbot or modal
    alert('Remediation guidance would be displayed here. This feature will show step-by-step remediation with safety constraints.');
}

// Initialize support system
async function initializeSupportSystem() {
    try {
        const tickets = await fetch(`${API_BASE_URL}/support/tickets`).then(r => r.json());
        displaySupportTickets(tickets);
    } catch (error) {
        console.error('Error loading support tickets:', error);
    }
}

// Global function for inline script access
window.displaySupportTickets = function(tickets) {
    const ticketsContainer = document.getElementById('supportTicketsList');
    if (!ticketsContainer) return;
    
    ticketsContainer.innerHTML = '';
    
    tickets.forEach(ticket => {
        const ticketItem = document.createElement('div');
        ticketItem.className = `list-group-item ${getTicketStatusClass(ticket.status)}`;
        ticketItem.innerHTML = `
            <div class="d-flex justify-content-between align-items-start">
                <div class="flex-grow-1">
                    <h6 class="mb-1">
                        <span class="badge ${getPriorityBadgeClass(ticket.priority)} me-2">${ticket.priority}</span>
                        ${ticket.ticketNumber}
                    </h6>
                    <p class="mb-1"><strong>${ticket.issueType}</strong></p>
                    <p class="mb-1 small">${ticket.description}</p>
                    <small class="text-muted">
                        Submitted by ${ticket.submittedBy} on ${formatDate(ticket.submittedDate)} | 
                        Response time: ${ticket.responseTime}
                    </small>
                </div>
                <span class="badge ${getStatusBadgeClass(ticket.status)}">${ticket.status}</span>
            </div>
        `;
        ticketsContainer.appendChild(ticketItem);
    });
};

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

function getValidationBadgeClass(status) {
    if (status === 'Verified') return 'bg-success';
    if (status === 'Under Review') return 'bg-warning';
    return 'bg-secondary';
}

function getTicketStatusClass(status) {
    if (status === 'Resolved') return 'list-group-item-success';
    if (status === 'In Progress') return 'list-group-item-info';
    return '';
}

function getStatusBadgeClass(status) {
    if (status === 'Resolved') return 'bg-success';
    if (status === 'In Progress') return 'bg-info';
    return 'bg-secondary';
}

function getPriorityBadgeClass(priority) {
    if (priority === 'Critical') return 'bg-danger';
    if (priority === 'High') return 'bg-warning';
    return 'bg-secondary';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Display stats (reuse from dashboard.js)
function displayStats(stats) {
    const elements = {
        criticalCount: document.getElementById('criticalCount'),
        highCount: document.getElementById('highCount'),
        newToday: document.getElementById('newToday'),
        resolvedCount: document.getElementById('resolvedCount'),
        totalVulnerabilities: document.getElementById('totalVulnerabilities'),
        avgScore: document.getElementById('avgScore')
    };
    
    if (elements.criticalCount) elements.criticalCount.textContent = stats.criticalCount;
    if (elements.highCount) elements.highCount.textContent = stats.highCount;
    if (elements.newToday) elements.newToday.textContent = stats.newToday;
    if (elements.resolvedCount) elements.resolvedCount.textContent = stats.resolvedThisWeek;
    if (elements.totalVulnerabilities) elements.totalVulnerabilities.textContent = stats.totalVulnerabilities.toLocaleString();
    if (elements.avgScore) elements.avgScore.textContent = stats.avgScore.toFixed(1);
}

// Display trend chart (reuse from dashboard.js)
function displayTrendChart(trendData) {
    const canvas = document.getElementById('trendChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 200;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    ctx.clearRect(0, 0, width, height);
    
    const maxValue = Math.max(...trendData.map(d => d.count));
    
    ctx.strokeStyle = '#dee2e6';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
    
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
    
    ctx.fillStyle = '#0d6efd';
    trendData.forEach((point, index) => {
        const x = padding + (index / (trendData.length - 1)) * chartWidth;
        const y = height - padding - (point.count / maxValue) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    
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

// Mock data fallback
function displayMockData() {
    console.log('Using mock data');
}

