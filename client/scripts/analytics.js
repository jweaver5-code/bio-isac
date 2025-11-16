// Analytics Page JavaScript

const API_BASE_URL = 'http://localhost:5231/api';

document.addEventListener('DOMContentLoaded', () => {
    loadAnalytics();
});

async function loadAnalytics() {
    try {
        const [vulnerabilities, stats] = await Promise.all([
            fetch(`${API_BASE_URL}/vulnerabilities`).then(r => r.json()),
            fetch(`${API_BASE_URL}/vulnerabilities/stats`).then(r => r.json())
        ]);
        
        updateMetrics(vulnerabilities, stats);
        drawCharts(vulnerabilities, stats);
        displayTopThreats(vulnerabilities);
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function updateMetrics(vulnerabilities, stats) {
    document.getElementById('totalThreats').textContent = stats.totalVulnerabilities;
    
    const avgBioRelevance = vulnerabilities.reduce((sum, v) => sum + (v.bioRelevanceScore || 0), 0) / vulnerabilities.length;
    document.getElementById('avgBioRelevance').textContent = avgBioRelevance.toFixed(2);
    
    document.getElementById('resolvedCount').textContent = stats.resolvedThisWeek;
    document.getElementById('avgResolutionTime').textContent = '3.5'; // Mock data
}

function drawCharts(vulnerabilities, stats) {
    drawSeverityChart(vulnerabilities);
    drawSourceChart(vulnerabilities);
    drawTrendChart(stats.trendData);
    drawBioRelevanceChart(vulnerabilities);
}

function drawSeverityChart(vulnerabilities) {
    const canvas = document.getElementById('severityChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 250;
    
    const severityCounts = {
        Critical: vulnerabilities.filter(v => v.severity === 'Critical').length,
        High: vulnerabilities.filter(v => v.severity === 'High').length,
        Medium: vulnerabilities.filter(v => v.severity === 'Medium').length,
        Low: vulnerabilities.filter(v => v.severity === 'Low').length
    };
    
    const maxCount = Math.max(...Object.values(severityCounts));
    const barWidth = width / 4 - 20;
    const barSpacing = 20;
    const colors = ['#dc3545', '#ffc107', '#0dcaf0', '#198754'];
    
    ctx.clearRect(0, 0, width, height);
    
    let x = barSpacing;
    let colorIndex = 0;
    
    for (const [severity, count] of Object.entries(severityCounts)) {
        const barHeight = (count / maxCount) * (height - 80);
        const y = height - 60 - barHeight;
        
        // Draw bar
        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw label
        ctx.fillStyle = '#333';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(severity, x + barWidth / 2, height - 40);
        
        // Draw count
        ctx.fillText(count.toString(), x + barWidth / 2, y - 5);
        
        x += barWidth + barSpacing;
        colorIndex++;
    }
}

function drawSourceChart(vulnerabilities) {
    const canvas = document.getElementById('sourceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 250;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    const sourceCounts = {};
    vulnerabilities.forEach(v => {
        sourceCounts[v.source] = (sourceCounts[v.source] || 0) + 1;
    });
    
    const total = Object.values(sourceCounts).reduce((a, b) => a + b, 0);
    const colors = ['#dc3545', '#0d6efd', '#ffc107', '#198754', '#6f42c1'];
    
    ctx.clearRect(0, 0, width, height);
    
    let startAngle = 0;
    let colorIndex = 0;
    
    for (const [source, count] of Object.entries(sourceCounts)) {
        const sliceAngle = (count / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, startAngle, startAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[colorIndex % colors.length];
        ctx.fill();
        
        // Draw label
        const labelAngle = startAngle + sliceAngle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
        const labelY = centerY + Math.sin(labelAngle) * (radius + 20);
        
        ctx.fillStyle = '#333';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${source}: ${count}`, labelX, labelY);
        
        startAngle += sliceAngle;
        colorIndex++;
    }
}

function drawTrendChart(trendData) {
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

function drawBioRelevanceChart(vulnerabilities) {
    const canvas = document.getElementById('bioRelevanceChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = 200;
    
    const bins = {
        '0.0-0.2': 0,
        '0.2-0.4': 0,
        '0.4-0.6': 0,
        '0.6-0.8': 0,
        '0.8-1.0': 0
    };
    
    vulnerabilities.forEach(v => {
        const score = v.bioRelevanceScore || 0;
        if (score < 0.2) bins['0.0-0.2']++;
        else if (score < 0.4) bins['0.2-0.4']++;
        else if (score < 0.6) bins['0.4-0.6']++;
        else if (score < 0.8) bins['0.6-0.8']++;
        else bins['0.8-1.0']++;
    });
    
    const maxCount = Math.max(...Object.values(bins));
    const barWidth = width / 5 - 10;
    const barSpacing = 10;
    
    ctx.clearRect(0, 0, width, height);
    
    let x = barSpacing;
    let colorIndex = 0;
    const colors = ['#198754', '#0dcaf0', '#ffc107', '#fd7e14', '#dc3545'];
    
    for (const [range, count] of Object.entries(bins)) {
        const barHeight = (count / maxCount) * (height - 80);
        const y = height - 60 - barHeight;
        
        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(x, y, barWidth, barHeight);
        
        ctx.fillStyle = '#333';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(range, x + barWidth / 2, height - 40);
        ctx.fillText(count.toString(), x + barWidth / 2, y - 5);
        
        x += barWidth + barSpacing;
        colorIndex++;
    }
}

function displayTopThreats(vulnerabilities) {
    const sorted = [...vulnerabilities]
        .sort((a, b) => (b.priorityScore || b.score) - (a.priorityScore || a.score))
        .slice(0, 10);
    
    const tableBody = document.getElementById('topThreatsTable');
    tableBody.innerHTML = sorted.map((threat, index) => {
        const priorityScore = threat.priorityScore || threat.score;
        const scoreClass = getScoreClass(priorityScore);
        
        return `
            <tr>
                <td><strong>#${index + 1}</strong></td>
                <td><strong>${threat.cveId}</strong></td>
                <td>${threat.title}</td>
                <td><span class="badge ${scoreClass}">${priorityScore.toFixed(1)}</span></td>
                <td>${((threat.bioRelevanceScore || 0) * 100).toFixed(0)}%</td>
                <td><span class="badge ${getSeverityBadgeClass(threat.severity)}">${threat.severity}</span></td>
            </tr>
        `;
    }).join('');
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

function exportAnalytics() {
    alert('Exporting analytics report... (Feature to be implemented)');
}



