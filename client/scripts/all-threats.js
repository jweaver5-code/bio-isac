// All Threats Page JavaScript

const API_BASE_URL = 'http://localhost:5231/api';
let allThreats = [];
let filteredThreats = [];

document.addEventListener('DOMContentLoaded', () => {
    loadAllThreats();
    
    // Filter event listeners
    document.getElementById('searchInput')?.addEventListener('input', applyFilters);
    document.getElementById('severityFilter')?.addEventListener('change', applyFilters);
    document.getElementById('relevanceFilter')?.addEventListener('change', applyFilters);
    document.getElementById('sourceFilter')?.addEventListener('change', applyFilters);
    document.getElementById('soleSourceFilter')?.addEventListener('change', applyFilters);
});

async function loadAllThreats() {
    const loadingIndicator = document.getElementById('loadingIndicator');
    const tableBody = document.getElementById('threatsTableBody');
    
    try {
        loadingIndicator.style.display = 'block';
        const response = await fetch(`${API_BASE_URL}/vulnerabilities`);
        
        if (!response.ok) throw new Error('Failed to fetch threats');
        
        allThreats = await response.json();
        filteredThreats = allThreats;
        
        document.getElementById('totalCount').textContent = allThreats.length;
        displayThreats(filteredThreats);
    } catch (error) {
        console.error('Error loading threats:', error);
        tableBody.innerHTML = '<tr><td colspan="9" class="text-center text-danger">Error loading threats. Please try again.</td></tr>';
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const severity = document.getElementById('severityFilter').value;
    const relevance = document.getElementById('relevanceFilter').value;
    const source = document.getElementById('sourceFilter').value;
    const soleSource = document.getElementById('soleSourceFilter').value;
    
    filteredThreats = allThreats.filter(threat => {
        // Search filter
        const matchesSearch = !searchTerm || 
            threat.cveId.toLowerCase().includes(searchTerm) ||
            threat.title.toLowerCase().includes(searchTerm) ||
            threat.description.toLowerCase().includes(searchTerm);
        
        // Severity filter
        const matchesSeverity = !severity || threat.severity === severity;
        
        // Relevance filter
        const matchesRelevance = !relevance || threat.biotechRelevance === relevance;
        
        // Source filter
        const matchesSource = !source || threat.source === source;
        
        // Sole source filter
        const matchesSoleSource = soleSource === '' || 
            (soleSource === 'true' && threat.soleSourceFlag === true) ||
            (soleSource === 'false' && threat.soleSourceFlag === false);
        
        return matchesSearch && matchesSeverity && matchesRelevance && matchesSource && matchesSoleSource;
    });
    
    document.getElementById('resultsCount').textContent = filteredThreats.length;
    displayThreats(filteredThreats);
}

function displayThreats(threats) {
    const tableBody = document.getElementById('threatsTableBody');
    const noResults = document.getElementById('noResults');
    
    if (threats.length === 0) {
        tableBody.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    
    tableBody.innerHTML = threats.map(threat => {
        const priorityScore = threat.priorityScore || threat.score;
        const scoreClass = getScoreClass(priorityScore);
        const relevanceClass = getRelevanceClass(threat.biotechRelevance);
        const soleSourceBadge = threat.soleSourceFlag 
            ? '<span class="badge bg-danger ms-1"><i class="bi bi-exclamation-octagon"></i> Sole Source</span>' 
            : '';
        
        return `
            <tr class="threat-row" data-threat-id="${threat.id}">
                <td>
                    <span class="badge ${scoreClass}">${priorityScore.toFixed(1)}</span>
                </td>
                <td><strong>${threat.cveId}</strong>${soleSourceBadge}</td>
                <td>${threat.title}</td>
                <td><span class="badge ${getSeverityBadgeClass(threat.severity)}">${threat.severity}</span></td>
                <td>
                    <span class="${relevanceClass}">
                        <i class="bi bi-heart-pulse"></i> ${threat.biotechRelevance}
                    </span>
                </td>
                <td>${threat.score.toFixed(1)}</td>
                <td>
                    <span class="badge bg-secondary">${threat.source}</span>
                </td>
                <td>${formatDate(threat.discoveredDate)}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="viewThreatDetails(${threat.id})">
                        <i class="bi bi-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function viewThreatDetails(threatId) {
    window.location.href = `vulnerability-details.html?id=${threatId}`;
}

function clearFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('severityFilter').value = '';
    document.getElementById('relevanceFilter').value = '';
    document.getElementById('sourceFilter').value = '';
    document.getElementById('soleSourceFilter').value = '';
    applyFilters();
}

function refreshThreats() {
    loadAllThreats();
}

function exportThreats() {
    const csv = convertToCSV(filteredThreats);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bioshield-threats-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
}

function convertToCSV(threats) {
    const headers = ['CVE ID', 'Title', 'Severity', 'Score', 'Bio-Relevance', 'Biological Impact', 'Human Impact', 'Source', 'Discovered Date', 'Sole Source'];
    const rows = threats.map(threat => [
        threat.cveId,
        threat.title,
        threat.severity,
        threat.score,
        threat.biotechRelevance,
        threat.biologicalImpact || '',
        threat.humanImpact || '',
        threat.source,
        threat.discoveredDate,
        threat.soleSourceFlag ? 'Yes' : 'No'
    ]);
    
    return [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
}

function getScoreClass(score) {
    if (score >= 9.0) return 'bg-danger';
    if (score >= 7.0) return 'bg-warning';
    if (score >= 4.0) return 'bg-info';
    return 'bg-success';
}

function getSeverityBadgeClass(severity) {
    if (severity === 'Critical') return 'bg-danger';
    if (severity === 'High') return 'bg-warning';
    if (severity === 'Medium') return 'bg-info';
    return 'bg-success';
}

function getRelevanceClass(relevance) {
    if (relevance === 'Very High' || relevance === 'High') return 'text-danger fw-bold';
    if (relevance === 'Medium') return 'text-warning fw-bold';
    return 'text-success fw-bold';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}



