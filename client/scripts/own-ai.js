// Own AI Configuration JavaScript

const API_BASE_URL = 'http://localhost:5231/api';

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
    loadConfiguration();
    
    // Add form submit handler
    document.getElementById('aiConfigForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveConfiguration();
    });
    
    // Initial weight sum check
    checkWeightSum();
});

// Load current AI configuration
async function loadConfiguration() {
    try {
        const response = await fetch(`${API_BASE_URL}/ownai`);
        if (!response.ok) {
            throw new Error('Failed to load configuration');
        }
        
        const config = await response.json();
        
        // Update form fields
        document.getElementById('bioRelevanceWeight').value = config.bioRelevanceWeight;
        document.getElementById('cvssWeight').value = config.cvssWeight;
        document.getElementById('humanImpactWeight').value = config.humanImpactWeight;
        document.getElementById('soleSourceMultiplier').value = config.soleSourceMultiplier;
        document.getElementById('bioRelevanceThreshold').value = config.bioRelevanceThreshold;
        
        // Update display values
        updateSliderValue('bioRelevanceWeight', 'bioRelevanceValue');
        updateSliderValue('cvssWeight', 'cvssWeightValue');
        updateSliderValue('humanImpactWeight', 'humanImpactWeightValue');
        updateSliderValue('soleSourceMultiplier', 'soleSourceMultiplierValue');
        updateSliderValue('bioRelevanceThreshold', 'bioRelevanceThresholdValue');
        
        // Update current config display
        updateCurrentConfigDisplay(config);
        
        // Check weight sum
        checkWeightSum();
    } catch (error) {
        console.error('Error loading configuration:', error);
        showToast('Error loading configuration. Using defaults.', 'warning');
    }
}

// Update slider value display
function updateSliderValue(sliderId, displayId) {
    const slider = document.getElementById(sliderId);
    const display = document.getElementById(displayId);
    if (slider && display) {
        display.textContent = parseFloat(slider.value).toFixed(2);
    }
}

// Check if weights sum to 1.0
function checkWeightSum() {
    const bioRelevance = parseFloat(document.getElementById('bioRelevanceWeight').value);
    const cvss = parseFloat(document.getElementById('cvssWeight').value);
    const humanImpact = parseFloat(document.getElementById('humanImpactWeight').value);
    
    const sum = bioRelevance + cvss + humanImpact;
    const sumDisplay = document.getElementById('weightSum');
    const sumContainer = document.getElementById('weightSumDisplay');
    
    if (sumDisplay) {
        sumDisplay.textContent = sum.toFixed(2);
    }
    
    if (sumContainer) {
        // Allow small tolerance (0.01)
        if (Math.abs(sum - 1.0) <= 0.01) {
            sumContainer.className = 'weight-sum valid';
            document.getElementById('saveBtn').disabled = false;
        } else {
            sumContainer.className = 'weight-sum invalid';
            document.getElementById('saveBtn').disabled = true;
        }
    }
}

// Save configuration
async function saveConfiguration() {
    const config = {
        bioRelevanceWeight: parseFloat(document.getElementById('bioRelevanceWeight').value),
        cvssWeight: parseFloat(document.getElementById('cvssWeight').value),
        humanImpactWeight: parseFloat(document.getElementById('humanImpactWeight').value),
        soleSourceMultiplier: parseFloat(document.getElementById('soleSourceMultiplier').value),
        bioRelevanceThreshold: parseFloat(document.getElementById('bioRelevanceThreshold').value)
    };
    
    // Validate weights sum
    const sum = config.bioRelevanceWeight + config.cvssWeight + config.humanImpactWeight;
    if (Math.abs(sum - 1.0) > 0.01) {
        showToast('Weights must sum to 1.0. Please adjust the values.', 'danger');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/ownai`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(config)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save configuration');
        }
        
        showToast('Configuration saved successfully!', 'success');
        
        // Reload to get updated timestamp
        await loadConfiguration();
    } catch (error) {
        console.error('Error saving configuration:', error);
        showToast(error.message || 'Error saving configuration. Please try again.', 'danger');
    }
}

// Reset to defaults
async function resetToDefaults() {
    if (!confirm('Are you sure you want to reset all settings to default values?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/ownai/reset`, {
            method: 'POST'
        });
        
        if (!response.ok) {
            throw new Error('Failed to reset configuration');
        }
        
        showToast('Configuration reset to defaults!', 'success');
        
        // Reload configuration
        await loadConfiguration();
    } catch (error) {
        console.error('Error resetting configuration:', error);
        showToast('Error resetting configuration. Please try again.', 'danger');
    }
}

// Update current config display
function updateCurrentConfigDisplay(config) {
    const currentConfigDiv = document.getElementById('currentConfig');
    if (!currentConfigDiv) return;
    
    const updatedDate = config.updatedAt 
        ? new Date(config.updatedAt).toLocaleString() 
        : 'Never';
    
    currentConfigDiv.innerHTML = `
        <div class="mb-2">
            <strong>Bio-Relevance Weight:</strong> 
            <span class="badge bg-primary">${config.bioRelevanceWeight.toFixed(2)}</span>
        </div>
        <div class="mb-2">
            <strong>CVSS Weight:</strong> 
            <span class="badge bg-primary">${config.cvssWeight.toFixed(2)}</span>
        </div>
        <div class="mb-2">
            <strong>Human Impact Weight:</strong> 
            <span class="badge bg-primary">${config.humanImpactWeight.toFixed(2)}</span>
        </div>
        <div class="mb-2">
            <strong>Sole Source Multiplier:</strong> 
            <span class="badge bg-warning text-dark">${config.soleSourceMultiplier.toFixed(1)}x</span>
        </div>
        <div class="mb-2">
            <strong>Bio-Relevance Threshold:</strong> 
            <span class="badge bg-info">${config.bioRelevanceThreshold.toFixed(2)}</span>
        </div>
        <hr>
        <div class="text-muted small">
            <i class="bi bi-clock"></i> Last Updated: ${updatedDate}
        </div>
    `;
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    toast.style.zIndex = '9999';
    toast.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

