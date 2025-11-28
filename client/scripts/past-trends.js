// Past Trends JavaScript

const API_BASE_URL = 'http://localhost:5231/api';
let currentThreats = [];
let currentThreatId = null;
let currentSort = { column: null, direction: 'asc' };
let reviewProgressChart = null;
let ratingChangesChart = null;

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
    loadPastTrends();
    loadStats();
    
    // Add event listeners for filters
    document.getElementById('filterSelect').addEventListener('change', () => {
        displayThreats(currentThreats);
    });
    
    document.getElementById('sortSelect').addEventListener('change', () => {
        displayThreats(currentThreats);
    });
    
    document.getElementById('searchInput').addEventListener('input', () => {
        displayThreats(currentThreats);
    });
    
    // Add event listener for save rating button
    const saveRatingBtn = document.getElementById('saveRatingBtn');
    if (saveRatingBtn) {
        saveRatingBtn.addEventListener('click', saveRating);
    }
    
    // Add sortable column headers
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-sort');
            sortByColumn(column);
        });
    });
});

// Load past trends from API
async function loadPastTrends() {
    try {
        const filter = document.getElementById('filterSelect').value;
        const reviewedOnly = filter === 'reviewed' ? true : (filter === 'unreviewed' ? false : null);
        
        let url = `${API_BASE_URL}/pasttrends`;
        if (reviewedOnly !== null) {
            url += `?reviewedOnly=${reviewedOnly}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch past trends');
        }
        
        currentThreats = await response.json();
        displayThreats(currentThreats);
        updateCharts(currentThreats);
    } catch (error) {
        console.error('Error loading past trends:', error);
        document.getElementById('threatsTableBody').innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-5">
                    <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle"></i> Error loading past trends. Please try again.
                    </div>
                </td>
            </tr>
        `;
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/pasttrends/stats`);
        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }
        
        const stats = await response.json();
        document.getElementById('totalThreats').textContent = stats.total;
        document.getElementById('reviewedCount').textContent = stats.reviewed;
        document.getElementById('ratingChangedCount').textContent = stats.ratingChanged;
        document.getElementById('reviewProgress').textContent = stats.reviewPercentage.toFixed(1) + '%';
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Display threats in table
function displayThreats(threats) {
    const tableBody = document.getElementById('threatsTableBody');
    const noResults = document.getElementById('noResults');
    
    // Apply filter
    let filteredThreats = threats;
    const filter = document.getElementById('filterSelect').value;
    if (filter === 'reviewed') {
        filteredThreats = threats.filter(t => t.isReviewed);
    } else if (filter === 'unreviewed') {
        filteredThreats = threats.filter(t => !t.isReviewed);
    } else if (filter === 'rating-changed') {
        filteredThreats = threats.filter(t => t.userRating !== null);
    }
    
    // Apply search
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    if (searchTerm) {
        filteredThreats = filteredThreats.filter(t => 
            t.cveId.toLowerCase().includes(searchTerm) || 
            t.title.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply sort
    const sort = document.getElementById('sortSelect').value;
    filteredThreats = [...filteredThreats].sort((a, b) => {
        switch (sort) {
            case 'date-desc':
                const dateA_desc = parseDate(a.discoveredDate || a.createdAt);
                const dateB_desc = parseDate(b.discoveredDate || b.createdAt);
                return dateB_desc - dateA_desc;
            case 'date-asc':
                const dateA_asc = parseDate(a.discoveredDate || a.createdAt);
                const dateB_asc = parseDate(b.discoveredDate || b.createdAt);
                return dateA_asc - dateB_asc;
            case 'rating-desc':
                const ratingA = a.userRating !== null ? a.userRating : a.aiRating;
                const ratingB = b.userRating !== null ? b.userRating : b.aiRating;
                return ratingB - ratingA;
            case 'rating-asc':
                const ratingA2 = a.userRating !== null ? a.userRating : a.aiRating;
                const ratingB2 = b.userRating !== null ? b.userRating : b.aiRating;
                return ratingA2 - ratingB2;
            case 'reviewed':
                return (b.isReviewed ? 1 : 0) - (a.isReviewed ? 1 : 0);
            default:
                return 0;
        }
    });
    
    if (filteredThreats.length === 0) {
        tableBody.innerHTML = '';
        noResults.style.display = 'block';
        return;
    }
    
    noResults.style.display = 'none';
    tableBody.innerHTML = filteredThreats.map(threat => createTableRow(threat)).join('');
    
    // Add event listeners to buttons
    filteredThreats.forEach(threat => {
        const editBtn = document.getElementById(`edit-rating-${threat.id}`);
        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                openRatingModal(threat);
            });
        }
        
        const markReviewedBtn = document.getElementById(`mark-reviewed-${threat.id}`);
        if (markReviewedBtn) {
            markReviewedBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                markAsReviewed(threat.id);
            });
        }
    });
}

// Create table row HTML
function createTableRow(threat) {
    const currentRating = threat.userRating !== null ? threat.userRating : threat.aiRating;
    const ratingChanged = threat.userRating !== null;
    const ratingDiff = ratingChanged ? (threat.userRating - threat.aiRating) : 0;
    
    let diffClass = 'rating-diff-neutral';
    let diffIcon = '';
    if (ratingDiff > 0) {
        diffClass = 'rating-diff-positive';
        diffIcon = '<i class="bi bi-arrow-up"></i>';
    } else if (ratingDiff < 0) {
        diffClass = 'rating-diff-negative';
        diffIcon = '<i class="bi bi-arrow-down"></i>';
    }
    
    const statusBadge = threat.isReviewed 
        ? '<span class="reviewed-badge"><i class="bi bi-check-circle"></i> Reviewed</span>' 
        : '<span class="badge bg-secondary">Not Reviewed</span>';
    
    return `
        <tr>
            <td><strong>${threat.cveId}</strong></td>
            <td>${threat.title}</td>
            <td>
                <span class="badge ${getScoreClass(threat.aiRating)}">${threat.aiRating.toFixed(1)}</span>
            </td>
            <td>
                ${ratingChanged 
                    ? `<span class="badge ${getScoreClass(threat.userRating)} rating-changed-indicator">${threat.userRating.toFixed(1)}</span>`
                    : '<span class="text-muted">—</span>'
                }
            </td>
            <td class="${diffClass}">
                ${ratingChanged 
                    ? `${diffIcon} ${Math.abs(ratingDiff).toFixed(1)}`
                    : '<span class="text-muted">—</span>'
                }
            </td>
            <td>${statusBadge}</td>
            <td>${formatDate(threat.discoveredDate)}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-primary btn-sm" id="edit-rating-${threat.id}" title="Edit Rating">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    ${!threat.isReviewed ? `
                        <button class="btn btn-success btn-sm" id="mark-reviewed-${threat.id}" title="Mark as Reviewed">
                            <i class="bi bi-check-circle"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;
}

// Sort by column
function sortByColumn(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    
    // Update sort select to match
    let sortValue = 'date-desc';
    switch (column) {
        case 'date':
            sortValue = currentSort.direction === 'asc' ? 'date-asc' : 'date-desc';
            break;
        case 'aiRating':
        case 'userRating':
            sortValue = currentSort.direction === 'asc' ? 'rating-asc' : 'rating-desc';
            break;
        case 'reviewed':
            sortValue = 'reviewed';
            break;
    }
    document.getElementById('sortSelect').value = sortValue;
    displayThreats(currentThreats);
}

// Update charts
function updateCharts(threats) {
    updateReviewProgressChart(threats);
    updateRatingChangesChart(threats);
}

// Update review progress chart
function updateReviewProgressChart(threats) {
    const ctx = document.getElementById('reviewProgressChart');
    if (!ctx) return;
    
    // Group by date
    const dateGroups = {};
    threats.forEach(threat => {
        const date = threat.discoveredDate || threat.createdAt;
        if (!date) return;
        const dateKey = date.split('T')[0]; // Get YYYY-MM-DD part
        
        if (!dateGroups[dateKey]) {
            dateGroups[dateKey] = { total: 0, reviewed: 0 };
        }
        dateGroups[dateKey].total++;
        if (threat.isReviewed) {
            dateGroups[dateKey].reviewed++;
        }
    });
    
    const sortedDates = Object.keys(dateGroups).sort();
    const labels = sortedDates.map(d => formatDate(d));
    const reviewedData = sortedDates.map(d => dateGroups[d].reviewed);
    const totalData = sortedDates.map(d => dateGroups[d].total);
    
    if (reviewProgressChart) {
        reviewProgressChart.destroy();
    }
    
    reviewProgressChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Reviewed',
                    data: reviewedData,
                    borderColor: 'rgb(40, 167, 69)',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Total',
                    data: totalData,
                    borderColor: 'rgb(13, 110, 253)',
                    backgroundColor: 'rgba(13, 110, 253, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Update rating changes chart
function updateRatingChangesChart(threats) {
    const ctx = document.getElementById('ratingChangesChart');
    if (!ctx) return;
    
    const changed = threats.filter(t => t.userRating !== null).length;
    const unchanged = threats.filter(t => t.userRating === null && t.isReviewed).length;
    const notReviewed = threats.filter(t => !t.isReviewed).length;
    
    if (ratingChangesChart) {
        ratingChangesChart.destroy();
    }
    
    ratingChangesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Rating Changed', 'Rating Unchanged', 'Not Reviewed'],
            datasets: [{
                data: [changed, unchanged, notReviewed],
                backgroundColor: [
                    'rgb(255, 193, 7)',
                    'rgb(40, 167, 69)',
                    'rgb(108, 117, 125)'
                ],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });
}

// Open rating modal
function openRatingModal(threat) {
    currentThreatId = threat.id;
    document.getElementById('modalCveId').value = threat.cveId;
    document.getElementById('modalTitle').value = threat.title;
    document.getElementById('modalAiRating').value = threat.aiRating.toFixed(1);
    document.getElementById('modalUserRating').value = threat.userRating !== null ? threat.userRating.toFixed(1) : threat.aiRating.toFixed(1);
    
    const modal = new bootstrap.Modal(document.getElementById('ratingModal'));
    modal.show();
}

// Save rating
async function saveRating() {
    const ratingInput = document.getElementById('modalUserRating');
    const rating = parseFloat(ratingInput.value);
    
    if (isNaN(rating) || rating < 0 || rating > 10) {
        alert('Please enter a valid rating between 0.0 and 10.0');
        return;
    }
    
    if (!currentThreatId) {
        alert('No threat selected. Please try again.');
        return;
    }
    
    // Get author name (use stored name or prompt)
    let author = localStorage.getItem('userName') || prompt('Please enter your name:');
    if (!author) {
        alert('Name is required to track activity.');
        return;
    }
    localStorage.setItem('userName', author);

    try {
        const response = await fetch(`${API_BASE_URL}/pasttrends/${currentThreatId}/rating`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ rating: rating, author: author })
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || 'Failed to update rating');
        }
        
        const modalElement = document.getElementById('ratingModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
        
        // Reload data
        await loadPastTrends();
        await loadStats();
        
        // Show success message
        showToast('Rating updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating rating:', error);
        alert(`Error updating rating: ${error.message}. Please try again.`);
    }
}

// Mark as reviewed
async function markAsReviewed(threatId) {
    // Get author name (use stored name or prompt)
    let author = localStorage.getItem('userName') || prompt('Please enter your name:');
    if (!author) {
        alert('Name is required to track activity.');
        return;
    }
    localStorage.setItem('userName', author);

    try {
        const response = await fetch(`${API_BASE_URL}/pasttrends/${threatId}/review`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ keepCurrentRating: true, author: author })
        });
        
        if (!response.ok) {
            throw new Error('Failed to mark as reviewed');
        }
        
        // Reload data
        await loadPastTrends();
        await loadStats();
        
        // Show success message
        showToast('Threat marked as reviewed!', 'success');
    } catch (error) {
        console.error('Error marking as reviewed:', error);
        alert('Error marking as reviewed. Please try again.');
    }
}

// Helper functions
function getScoreClass(score) {
    if (score >= 9.0) return 'bg-danger';
    if (score >= 7.0) return 'bg-warning';
    if (score >= 4.0) return 'bg-info';
    return 'bg-secondary';
}

function parseDate(dateString) {
    if (!dateString) return 0;
    // Try parsing the date string
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
        // Try parsing as YYYY-MM-DD format
        const parts = dateString.split('-');
        if (parts.length === 3) {
            return new Date(parts[0], parts[1] - 1, parts[2]).getTime();
        }
        return 0;
    }
    return date.getTime();
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    // Check if date is valid
    if (isNaN(date.getTime())) {
        // Try parsing as YYYY-MM-DD format
        const parts = dateString.split('-');
        if (parts.length === 3) {
            const parsedDate = new Date(parts[0], parts[1] - 1, parts[2]);
            return parsedDate.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        }
        return dateString; // Return original if can't parse
    }
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

function showToast(message, type = 'info') {
    // Simple toast notification
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
