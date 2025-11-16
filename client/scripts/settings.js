// Settings Page JavaScript

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    setupEventListeners();
});

function setupEventListeners() {
    const thresholdSlider = document.getElementById('bioRelevanceThreshold');
    const thresholdValue = document.getElementById('thresholdValue');
    const quietHoursToggle = document.getElementById('enableQuietHours');
    const quietHoursSettings = document.getElementById('quietHoursSettings');
    
    thresholdSlider?.addEventListener('input', (e) => {
        thresholdValue.textContent = parseFloat(e.target.value).toFixed(1);
    });
    
    quietHoursToggle?.addEventListener('change', (e) => {
        quietHoursSettings.style.display = e.target.checked ? 'block' : 'none';
    });
}

function loadSettings() {
    const saved = localStorage.getItem('bioshieldSettings');
    if (saved) {
        const settings = JSON.parse(saved);
        
        // Apply saved settings
        if (settings.bioRelevanceThreshold !== undefined) {
            document.getElementById('bioRelevanceThreshold').value = settings.bioRelevanceThreshold;
            document.getElementById('thresholdValue').textContent = settings.bioRelevanceThreshold.toFixed(1);
        }
        if (settings.minSeverity) {
            document.getElementById('minSeverity').value = settings.minSeverity;
        }
        if (settings.enableEmailAlerts !== undefined) {
            document.getElementById('enableEmailAlerts').checked = settings.enableEmailAlerts;
        }
        if (settings.enableQuietHours !== undefined) {
            document.getElementById('enableQuietHours').checked = settings.enableQuietHours;
            document.getElementById('quietHoursSettings').style.display = settings.enableQuietHours ? 'block' : 'none';
        }
        if (settings.quietHoursStart) {
            document.getElementById('quietHoursStart').value = settings.quietHoursStart;
        }
        if (settings.quietHoursEnd) {
            document.getElementById('quietHoursEnd').value = settings.quietHoursEnd;
        }
        if (settings.enableDigestMode !== undefined) {
            document.getElementById('enableDigestMode').checked = settings.enableDigestMode;
        }
        if (settings.itemsPerPage) {
            document.getElementById('itemsPerPage').value = settings.itemsPerPage;
        }
        if (settings.defaultTimeRange) {
            document.getElementById('defaultTimeRange').value = settings.defaultTimeRange;
        }
        if (settings.showBioImpact !== undefined) {
            document.getElementById('showBioImpact').checked = settings.showBioImpact;
        }
        if (settings.showHumanImpact !== undefined) {
            document.getElementById('showHumanImpact').checked = settings.showHumanImpact;
        }
        if (settings.compactView !== undefined) {
            document.getElementById('compactView').checked = settings.compactView;
        }
        if (settings.notifyCritical !== undefined) {
            document.getElementById('notifyCritical').checked = settings.notifyCritical;
        }
        if (settings.notifyHigh !== undefined) {
            document.getElementById('notifyHigh').checked = settings.notifyHigh;
        }
        if (settings.notifySoleSource !== undefined) {
            document.getElementById('notifySoleSource').checked = settings.notifySoleSource;
        }
        if (settings.notifyNewSources !== undefined) {
            document.getElementById('notifyNewSources').checked = settings.notifyNewSources;
        }
    }
}

function saveSettings() {
    const settings = {
        bioRelevanceThreshold: parseFloat(document.getElementById('bioRelevanceThreshold').value),
        minSeverity: document.getElementById('minSeverity').value,
        enableEmailAlerts: document.getElementById('enableEmailAlerts').checked,
        enableQuietHours: document.getElementById('enableQuietHours').checked,
        quietHoursStart: document.getElementById('quietHoursStart').value,
        quietHoursEnd: document.getElementById('quietHoursEnd').value,
        enableDigestMode: document.getElementById('enableDigestMode').checked,
        itemsPerPage: parseInt(document.getElementById('itemsPerPage').value),
        defaultTimeRange: parseInt(document.getElementById('defaultTimeRange').value),
        showBioImpact: document.getElementById('showBioImpact').checked,
        showHumanImpact: document.getElementById('showHumanImpact').checked,
        compactView: document.getElementById('compactView').checked,
        notifyCritical: document.getElementById('notifyCritical').checked,
        notifyHigh: document.getElementById('notifyHigh').checked,
        notifySoleSource: document.getElementById('notifySoleSource').checked,
        notifyNewSources: document.getElementById('notifyNewSources').checked
    };
    
    // Save to localStorage (in production, would save to API)
    localStorage.setItem('bioshieldSettings', JSON.stringify(settings));
    
    // Show success message
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        <i class="bi bi-check-circle"></i> Settings saved successfully!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

function changePassword() {
    alert('Password change functionality would be implemented here. This would typically open a modal or redirect to a password change page.');
}



