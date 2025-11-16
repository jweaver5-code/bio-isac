// Alerts Page JavaScript

const API_BASE_URL = 'http://localhost:5231/api';

document.addEventListener('DOMContentLoaded', () => {
    loadAlerts();
    setupAlertSettings();
});

function loadAlerts() {
    // Mock alerts data - in production, this would come from API
    const mockAlerts = [
        {
            id: 1,
            type: 'New Critical Threat',
            title: 'CVE-2024-1235: Remote Code Execution in DNA Analysis Tools',
            message: 'A critical vulnerability has been discovered in DNA sequencing software with very high bio-relevance.',
            priority: 'Critical',
            bioRelevance: 0.98,
            cveId: 'CVE-2024-1235',
            timestamp: new Date().toISOString(),
            status: 'unread',
            acknowledged: false
        },
        {
            id: 2,
            type: 'High Priority Threat',
            title: 'CVE-2024-1234: SQL Injection in Lab Management Software',
            message: 'High bio-relevance threat affecting lab management systems.',
            priority: 'High',
            bioRelevance: 0.92,
            cveId: 'CVE-2024-1234',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            status: 'read',
            acknowledged: false
        },
        {
            id: 3,
            type: 'Data Source Update',
            title: 'EU-CERT Updated with 12 New Threats',
            message: 'EU-CERT database has been updated with new vulnerability information.',
            priority: 'Medium',
            bioRelevance: 0.75,
            cveId: null,
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            status: 'read',
            acknowledged: true
        }
    ];
    
    displayAlerts(mockAlerts);
    updateAlertStats(mockAlerts);
}

function displayAlerts(alerts) {
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = '';
    
    if (alerts.length === 0) {
        alertsList.innerHTML = '<div class="text-center py-5 text-muted">No alerts to display</div>';
        return;
    }
    
    alerts.forEach(alert => {
        const alertElement = createAlertElement(alert);
        alertsList.appendChild(alertElement);
    });
}

function createAlertElement(alert) {
    const div = document.createElement('div');
    div.className = `alert ${getAlertClass(alert.priority)} ${alert.status === 'unread' ? 'alert-unread' : ''} mb-3`;
    div.setAttribute('data-alert-id', alert.id);
    
    const priorityBadge = getPriorityBadge(alert.priority);
    const statusIcon = alert.status === 'unread' ? '<i class="bi bi-circle-fill text-primary"></i>' : '';
    
    div.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div class="flex-grow-1">
                <div class="d-flex align-items-center mb-2">
                    ${statusIcon}
                    <h6 class="mb-0 ms-2">${alert.title}</h6>
                    ${priorityBadge}
                    ${alert.cveId ? `<span class="badge bg-secondary ms-2">${alert.cveId}</span>` : ''}
                </div>
                <p class="mb-2">${alert.message}</p>
                <div class="small text-muted">
                    <i class="bi bi-clock"></i> ${formatTimestamp(alert.timestamp)}
                    ${alert.bioRelevance ? `<span class="ms-3"><i class="bi bi-heart-pulse"></i> Bio-Relevance: ${(alert.bioRelevance * 100).toFixed(0)}%</span>` : ''}
                </div>
            </div>
            <div class="ms-3">
                <button class="btn btn-sm btn-outline-primary" onclick="viewAlertDetails(${alert.id})">
                    <i class="bi bi-eye"></i>
                </button>
                ${!alert.acknowledged ? `
                    <button class="btn btn-sm btn-outline-success ms-1" onclick="acknowledgeAlert(${alert.id})">
                        <i class="bi bi-check"></i>
                    </button>
                ` : ''}
                <button class="btn btn-sm btn-outline-danger ms-1" onclick="dismissAlert(${alert.id})">
                    <i class="bi bi-x"></i>
                </button>
            </div>
        </div>
    `;
    
    return div;
}

function getAlertClass(priority) {
    if (priority === 'Critical') return 'alert-danger';
    if (priority === 'High') return 'alert-warning';
    return 'alert-info';
}

function getPriorityBadge(priority) {
    const classes = {
        'Critical': 'bg-danger',
        'High': 'bg-warning',
        'Medium': 'bg-info',
        'Low': 'bg-success'
    };
    return `<span class="badge ${classes[priority] || 'bg-secondary'} ms-2">${priority}</span>`;
}

function updateAlertStats(alerts) {
    const unread = alerts.filter(a => a.status === 'unread').length;
    const critical = alerts.filter(a => a.priority === 'Critical').length;
    const today = alerts.filter(a => isToday(new Date(a.timestamp))).length;
    const acknowledged = alerts.filter(a => a.acknowledged).length;
    
    document.getElementById('unreadCount').textContent = unread;
    document.getElementById('criticalAlertsCount').textContent = critical;
    document.getElementById('todayAlertsCount').textContent = today;
    document.getElementById('acknowledgedCount').textContent = acknowledged;
}

function isToday(date) {
    const today = new Date();
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
}

function viewAlertDetails(alertId) {
    // Navigate to vulnerability details if CVE ID exists
    alert('Viewing alert details - would navigate to vulnerability page');
}

function acknowledgeAlert(alertId) {
    const alertElement = document.querySelector(`[data-alert-id="${alertId}"]`);
    if (alertElement) {
        alertElement.classList.remove('alert-unread');
        alertElement.querySelector('.btn-outline-success').remove();
        loadAlerts(); // Refresh to update stats
    }
}

function dismissAlert(alertId) {
    const alertElement = document.querySelector(`[data-alert-id="${alertId}"]`);
    if (alertElement) {
        alertElement.remove();
        loadAlerts(); // Refresh to update stats
    }
}

function markAllAsRead() {
    if (confirm('Mark all alerts as read?')) {
        // In production, this would call API
        loadAlerts();
    }
}

function clearAllAlerts() {
    if (confirm('Are you sure you want to clear all alerts? This cannot be undone.')) {
        document.getElementById('alertsList').innerHTML = '<div class="text-center py-5 text-muted">No alerts to display</div>';
        updateAlertStats([]);
    }
}

function setupAlertSettings() {
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

function saveAlertSettings() {
    const settings = {
        bioRelevanceThreshold: parseFloat(document.getElementById('bioRelevanceThreshold').value),
        minSeverity: document.getElementById('minSeverity').value,
        emailAlerts: document.getElementById('enableEmailAlerts').checked,
        quietHours: document.getElementById('enableQuietHours').checked,
        quietHoursStart: document.getElementById('quietHoursStart').value,
        quietHoursEnd: document.getElementById('quietHoursEnd').value,
        digestMode: document.getElementById('enableDigestMode').checked
    };
    
    // In production, save to API
    localStorage.setItem('alertSettings', JSON.stringify(settings));
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('alertSettingsModal'));
    modal.hide();
    
    alert('Alert settings saved successfully!');
}



