// Use existing API_BASE_URL if defined, otherwise set it (avoid redeclaration error)
// Use var instead of const to allow redeclaration when multiple scripts are loaded
var API_BASE_URL = window.API_BASE_URL || 'http://localhost:5231/api';
window.API_BASE_URL = API_BASE_URL;

// Load comments and activity feed on page load
document.addEventListener('DOMContentLoaded', () => {
    loadComments();
    loadActivityFeed();
    loadFullActivityFeed();
    
    // Set up form handler
    const addCommentForm = document.getElementById('addCommentForm');
    if (addCommentForm) {
        addCommentForm.addEventListener('submit', handleAddComment);
    }

    // Refresh activity feed every 30 seconds
    setInterval(() => {
        loadActivityFeed();
        loadFullActivityFeed();
    }, 30000);
});

// Load all comments
async function loadComments() {
    try {
        console.log('Loading comments from:', `${API_BASE_URL}/comments`);
        const response = await fetch(`${API_BASE_URL}/comments`);
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Failed to load comments:', response.status, errorText);
            throw new Error('Failed to load comments');
        }
        
        const comments = await response.json();
        console.log('Loaded comments:', comments);
        displayComments(comments);
    } catch (error) {
        console.error('Error loading comments:', error);
        const commentsList = document.getElementById('commentsList');
        if (commentsList) {
            commentsList.innerHTML = '<div class="alert alert-warning">Failed to load comments. Please try again later.</div>';
        }
    }
}

// Display comments in the UI
function displayComments(comments) {
    const commentsList = document.getElementById('commentsList');
    if (!commentsList) {
        console.error('Comments list element not found!');
        return;
    }

    console.log('Displaying comments:', comments);

    if (!comments || comments.length === 0) {
        commentsList.innerHTML = '<div class="text-muted text-center py-3">No comments yet. Be the first to comment!</div>';
        return;
    }

    commentsList.innerHTML = comments.map(comment => {
        const date = new Date(comment.createdAt);
        const formattedDate = date.toLocaleString();
        const typeBadge = getTypeBadge(comment.commentType);
        const actionBadge = comment.action ? `<span class="badge bg-info ms-2">${comment.action}</span>` : '';
        const vulnerabilityLink = comment.vulnerabilityId 
            ? `<a href="vulnerability-details.html?id=${comment.vulnerabilityId}" class="text-decoration-none">#${comment.vulnerabilityId}</a>`
            : '';

        return `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <strong>${escapeHtml(comment.author)}</strong>
                            ${typeBadge}
                            ${actionBadge}
                            ${vulnerabilityLink ? `<span class="text-muted ms-2">on vulnerability ${vulnerabilityLink}</span>` : ''}
                        </div>
                        <small class="text-muted">${formattedDate}</small>
                    </div>
                    <p class="mb-0">${escapeHtml(comment.content)}</p>
                    <button class="btn btn-sm btn-outline-danger mt-2" onclick="deleteComment(${comment.id})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// Load activity feed (sidebar)
async function loadActivityFeed() {
    try {
        const response = await fetch(`${API_BASE_URL}/comments/activity?limit=5`);
        if (!response.ok) throw new Error('Failed to load activity feed');
        
        const activities = await response.json();
        displayActivityFeed(activities);
    } catch (error) {
        console.error('Error loading activity feed:', error);
    }
}

// Display activity feed in sidebar
function displayActivityFeed(activities) {
    const activityFeed = document.getElementById('activityFeed');
    if (!activityFeed) return;

    if (activities.length === 0) {
        activityFeed.innerHTML = '<div class="text-muted small">No recent activity</div>';
        return;
    }

    activityFeed.innerHTML = activities.map(activity => {
        const date = new Date(activity.createdAt);
        const timeAgo = getTimeAgo(date);
        const icon = getActivityIcon(activity.action, activity.commentType);
        const vulnerabilityInfo = activity.cveId 
            ? `<span class="text-muted"> on <strong>${escapeHtml(activity.cveId)}</strong></span>`
            : '';

        return `
            <div class="mb-3 pb-3 border-bottom">
                <div class="d-flex align-items-start">
                    <i class="${icon} me-2 mt-1"></i>
                    <div class="flex-grow-1">
                        <div class="small">
                            <strong>${escapeHtml(activity.author)}</strong>
                            ${activity.action ? `<span class="text-primary">${escapeHtml(activity.action)}</span>` : ''}
                            ${vulnerabilityInfo}
                        </div>
                        <div class="text-muted small mt-1">${escapeHtml(activity.content)}</div>
                        <div class="text-muted small mt-1">${timeAgo}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Load full activity feed (tab)
async function loadFullActivityFeed() {
    try {
        const response = await fetch(`${API_BASE_URL}/comments/activity?limit=50`);
        if (!response.ok) throw new Error('Failed to load activity feed');
        
        const activities = await response.json();
        displayFullActivityFeed(activities);
    } catch (error) {
        console.error('Error loading full activity feed:', error);
        const fullActivityFeed = document.getElementById('fullActivityFeed');
        if (fullActivityFeed) {
            fullActivityFeed.innerHTML = '<div class="alert alert-warning">Failed to load activity feed. Please try again later.</div>';
        }
    }
}

// Display full activity feed
function displayFullActivityFeed(activities) {
    const fullActivityFeed = document.getElementById('fullActivityFeed');
    if (!fullActivityFeed) return;

    if (activities.length === 0) {
        fullActivityFeed.innerHTML = '<div class="text-muted text-center py-3">No activity yet.</div>';
        return;
    }

    fullActivityFeed.innerHTML = activities.map(activity => {
        const date = new Date(activity.createdAt);
        const formattedDate = date.toLocaleString();
        const icon = getActivityIcon(activity.action, activity.commentType);
        const typeBadge = getTypeBadge(activity.commentType);
        const actionBadge = activity.action ? `<span class="badge bg-info ms-2">${activity.action}</span>` : '';
        const vulnerabilityInfo = activity.cveId 
            ? `<div class="small text-muted mt-1">
                <i class="bi bi-shield-exclamation"></i> 
                <a href="vulnerability-details.html?id=${activity.vulnerabilityId}" class="text-decoration-none">
                    ${escapeHtml(activity.cveId)}: ${escapeHtml(activity.vulnerabilityTitle || '')}
                </a>
               </div>`
            : '';

        return `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="d-flex align-items-start">
                        <i class="${icon} me-3 mt-1 fs-5"></i>
                        <div class="flex-grow-1">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <strong>${escapeHtml(activity.author)}</strong>
                                    ${typeBadge}
                                    ${actionBadge}
                                </div>
                                <small class="text-muted">${formattedDate}</small>
                            </div>
                            ${vulnerabilityInfo}
                            <p class="mb-0 mt-2">${escapeHtml(activity.content)}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Handle add comment form submission
async function handleAddComment(e) {
    e.preventDefault();

    const author = document.getElementById('commentAuthor').value;
    const content = document.getElementById('commentContent').value;
    const commentType = document.getElementById('commentType').value;
    const action = document.getElementById('commentAction').value;
    const vulnerabilityIdInput = document.getElementById('commentVulnerabilityId').value;

    // Only include vulnerabilityId if it's a valid positive number
    const vulnerabilityId = vulnerabilityIdInput && vulnerabilityIdInput.trim() !== '' 
        ? parseInt(vulnerabilityIdInput) 
        : null;

    const commentData = {
        author: author,
        content: content,
        commentType: commentType,
        action: action || null,
        vulnerabilityId: vulnerabilityId && vulnerabilityId > 0 ? vulnerabilityId : null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(commentData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to add comment');
        }

        // Get the created comment from response
        const newComment = await response.json();
        console.log('Comment created:', newComment);

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addCommentModal'));
        if (modal) {
            modal.hide();
        }
        document.getElementById('addCommentForm').reset();

        // Small delay to ensure database write is complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // Reload comments and activity feeds (wait for them to complete)
        await Promise.all([
            loadComments(),
            loadActivityFeed(),
            loadFullActivityFeed()
        ]);

        // Show success message
        showNotification('Comment added successfully!', 'success');
    } catch (error) {
        console.error('Error adding comment:', error);
        showNotification('Failed to add comment: ' + error.message, 'danger');
    }
}

// Delete comment (make it globally accessible)
window.deleteComment = async function(commentId) {
    if (!confirm('Are you sure you want to delete this comment?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('Failed to delete comment');
        }

        // Reload comments and activity feeds (wait for them to complete)
        await Promise.all([
            loadComments(),
            loadActivityFeed(),
            loadFullActivityFeed()
        ]);

        showNotification('Comment deleted successfully!', 'success');
    } catch (error) {
        console.error('Error deleting comment:', error);
        showNotification('Failed to delete comment', 'danger');
    }
}

// Helper functions
function getTypeBadge(type) {
    const badges = {
        'general': '<span class="badge bg-secondary">General</span>',
        'vulnerability': '<span class="badge bg-danger">Vulnerability</span>',
        'action': '<span class="badge bg-warning">Action</span>',
        'update': '<span class="badge bg-info">Update</span>'
    };
    return badges[type] || '<span class="badge bg-secondary">' + type + '</span>';
}

function getActivityIcon(action, type) {
    if (action) {
        const actionIcons = {
            'reviewed': 'bi bi-check-circle-fill text-success',
            'updated': 'bi bi-arrow-repeat text-primary',
            'resolved': 'bi bi-check-circle-fill text-success',
            'commented': 'bi bi-chat-dots-fill text-info'
        };
        return actionIcons[action.toLowerCase()] || 'bi bi-circle-fill text-secondary';
    }
    
    const typeIcons = {
        'general': 'bi bi-chat-dots-fill text-secondary',
        'vulnerability': 'bi bi-shield-exclamation text-danger',
        'action': 'bi bi-lightning-fill text-warning',
        'update': 'bi bi-arrow-repeat text-info'
    };
    return typeIcons[type] || 'bi bi-circle-fill text-secondary';
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 604800) return Math.floor(seconds / 86400) + ' days ago';
    
    return date.toLocaleDateString();
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // Create a simple notification
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

// Verify all AI ratings
async function verifyAllAiRatings() {
    if (!confirm('This will verify all AI ratings by recalculating them. Discrepancies will be logged as activity comments. Continue?')) {
        return;
    }

    try {
        showNotification('Verifying AI ratings...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/airatingverification/verify-all`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            let errorMessage = 'Failed to verify ratings';
            try {
                const error = await response.json();
                errorMessage = error.error || errorMessage;
            } catch (e) {
                if (response.status === 404) {
                    errorMessage = 'Verification endpoint not found. Please restart the API server.';
                } else {
                    errorMessage = `Server error (${response.status}). Please check if the API server is running.`;
                }
            }
            throw new Error(errorMessage);
        }

        const result = await response.json();
        
        // Reload activity feeds to show verification comments
        await Promise.all([
            loadComments(),
            loadActivityFeed(),
            loadFullActivityFeed()
        ]);

        // Show results
        const message = result.discrepancies > 0
            ? `Verification complete! Found ${result.discrepancies} discrepancy/discrepancies out of ${result.total} ratings. Check the Activity Feed for details.`
            : `Verification complete! All ${result.total} ratings are valid.`;
        
        showNotification(message, result.discrepancies > 0 ? 'warning' : 'success');
    } catch (error) {
        console.error('Error verifying ratings:', error);
        showNotification('Failed to verify ratings: ' + error.message, 'danger');
    }
}

// Make function globally accessible
window.verifyAllAiRatings = verifyAllAiRatings;

