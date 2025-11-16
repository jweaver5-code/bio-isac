// Data Sources Page JavaScript

const API_BASE_URL = 'http://localhost:5231/api';

document.addEventListener('DOMContentLoaded', () => {
    loadDataSources();
});

async function loadDataSources() {
    try {
        const response = await fetch(`${API_BASE_URL}/datasources`);
        if (!response.ok) throw new Error('Failed to fetch data sources');
        
        const sources = await response.json();
        displayDataSources(sources);
    } catch (error) {
        console.error('Error loading data sources:', error);
    }
}

function displayDataSources(sources) {
    const container = document.getElementById('dataSourcesContainer');
    container.innerHTML = '';
    
    sources.forEach(source => {
        const card = createSourceCard(source);
        container.appendChild(card);
    });
}

function createSourceCard(source) {
    const col = document.createElement('div');
    col.className = 'col-md-6 mb-4';
    
    const credibilityPercent = (source.credibilityScore * 100).toFixed(0);
    const credibilityClass = source.credibilityScore >= 0.9 ? 'bg-success' : 
                            source.credibilityScore >= 0.7 ? 'bg-info' : 'bg-warning';
    
    col.innerHTML = `
        <div class="card h-100">
            <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
                <h5 class="mb-0"><i class="bi bi-database"></i> ${source.name}</h5>
                <span class="badge ${getValidationBadgeClass(source.validationStatus)}">${source.validationStatus}</span>
            </div>
            <div class="card-body">
                <div class="mb-3">
                    <small class="text-muted">Type</small>
                    <p class="mb-0"><strong>${source.type}</strong></p>
                </div>
                
                <div class="mb-3">
                    <small class="text-muted">Credibility Score</small>
                    <div class="progress" style="height: 25px;">
                        <div class="progress-bar ${credibilityClass}" 
                             role="progressbar" 
                             style="width: ${credibilityPercent}%">
                            ${credibilityPercent}%
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <small class="text-muted">Update Frequency</small>
                    <p class="mb-0"><i class="bi bi-clock"></i> ${source.updateFrequency}</p>
                </div>
                
                <div class="mb-3">
                    <small class="text-muted">Last Updated</small>
                    <p class="mb-0">${formatDate(source.lastUpdated)}</p>
                </div>
                
                <div class="mb-3">
                    <small class="text-muted">Access Method</small>
                    <p class="mb-0"><i class="bi bi-link-45deg"></i> ${source.accessMethod}</p>
                </div>
                
                <div class="mb-3">
                    <small class="text-muted">Coverage</small>
                    <div>
                        ${source.coverage.map(c => `<span class="badge bg-secondary me-1">${c}</span>`).join('')}
                    </div>
                </div>
                
                <div class="mb-3">
                    <small class="text-muted"><strong>Why Chosen:</strong></small>
                    <p class="small">${source.whyChosen}</p>
                </div>
                
                ${source.limitations ? `
                    <div class="mb-3">
                        <small class="text-muted"><strong>Limitations:</strong></small>
                        <p class="small text-warning">${source.limitations}</p>
                    </div>
                ` : ''}
                
                <div class="mb-3">
                    <small class="text-muted">Data Quality</small>
                    <p class="mb-0">
                        <span class="badge ${getDataQualityBadge(source.dataQuality)}">${source.dataQuality}</span>
                    </p>
                </div>
                
                <button class="btn btn-sm btn-outline-primary" onclick="viewSourceDetails(${source.id})">
                    <i class="bi bi-info-circle"></i> View Details
                </button>
                <button class="btn btn-sm btn-outline-secondary ms-2" onclick="validateSource(${source.id})">
                    <i class="bi bi-check-circle"></i> Validate
                </button>
            </div>
        </div>
    `;
    
    return col;
}

function getValidationBadgeClass(status) {
    if (status === 'Verified') return 'bg-success';
    if (status === 'Under Review') return 'bg-warning';
    return 'bg-secondary';
}

function getDataQualityBadge(quality) {
    if (quality === 'Excellent') return 'bg-success';
    if (quality === 'Very Good') return 'bg-info';
    if (quality === 'Good') return 'bg-warning';
    return 'bg-secondary';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function viewSourceDetails(sourceId) {
    alert(`Viewing details for source ID ${sourceId}. This would show validation report and detailed metrics.`);
}

async function validateSource(sourceId) {
    try {
        const response = await fetch(`${API_BASE_URL}/datasources/${sourceId}/validation`);
        if (!response.ok) throw new Error('Failed to validate source');
        
        const validation = await response.json();
        showValidationReport(validation);
    } catch (error) {
        console.error('Error validating source:', error);
        alert('Error validating source. Please try again.');
    }
}

function showValidationReport(validation) {
    const report = `
        Validation Report:
        
        Last Validated: ${formatDate(validation.lastValidated)}
        Overall Rating: ${validation.overallRating}
        
        Scores:
        - Accuracy: ${(validation.accuracyScore * 100).toFixed(0)}%
        - Completeness: ${(validation.completenessScore * 100).toFixed(0)}%
        - Timeliness: ${(validation.timelinessScore * 100).toFixed(0)}%
        
        ${validation.recommendations.length > 0 ? `
        Recommendations:
        ${validation.recommendations.map(r => `- ${r}`).join('\n')}
        ` : ''}
    `;
    
    alert(report);
}



