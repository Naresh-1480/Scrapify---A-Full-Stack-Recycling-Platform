// DOM Elements
const navLinks = document.querySelectorAll('.nav-links li');
const dashboardSections = document.querySelectorAll('.dashboard-section');
const notificationsToggle = document.getElementById('notificationsToggle');
const notificationsPanel = document.getElementById('notificationsPanel');
const markAllReadBtn = document.getElementById('markAllRead');
const loader = document.querySelector('.loader');

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Update current date and time
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update every minute
    
    // Initialize charts
    initializeCharts();
    
    // Show loader for initial data fetch simulation
    showLoader();
    setTimeout(hideLoader, 1000); // Hide after 1 second to simulate data loading
    
    // Setup event listeners
    setupEventListeners();
});

// Update date and time in header
function updateDateTime() {
    const now = new Date();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    
    document.getElementById('current-date').textContent = now.toLocaleDateString('en-US', dateOptions);
    document.getElementById('current-time').textContent = now.toLocaleTimeString('en-US', timeOptions);
}

// Initialize all charts
function initializeCharts() {
    // Monthly Scrap Collection Chart
    const monthlyScrapCtx = document.getElementById('monthlyScrapChart').getContext('2d');
    new Chart(monthlyScrapCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Scrap Collected (tons)',
                data: [4.2, 3.8, 5.1, 4.9, 5.3, 2.3],
                backgroundColor: 'rgba(57, 9, 188, 0.5)',
                borderColor: '#3909bc',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Tons'
                    }
                }
            }
        }
    });

    // Category Breakdown Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    new Chart(categoryCtx, {
        type: 'pie',
        data: {
            labels: ['Metal', 'Paper', 'Plastic', 'Electronics', 'Glass'],
            datasets: [{
                data: [45, 20, 15, 12, 8],
                backgroundColor: [
                    '#3909bc',
                    '#27ae60',
                    '#2980b9',
                    '#f1c40f',
                    '#e74c3c'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right'
                }
            }
        }
    });

    // Price Trends Chart
    const priceCtx = document.getElementById('priceChart').getContext('2d');
    new Chart(priceCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [
                {
                    label: 'Metal (₹/kg)',
                    data: [35, 34, 38, 40, 42, 45],
                    borderColor: '#3909bc',
                    backgroundColor: 'rgba(57, 9, 188, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Paper (₹/kg)',
                    data: [12, 13, 12, 14, 15, 14],
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Plastic (₹/kg)',
                    data: [25, 24, 26, 28, 30, 29],
                    borderColor: '#2980b9',
                    backgroundColor: 'rgba(41, 128, 185, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: '₹ per kg'
                    }
                }
            }
        }
    });

    // Environmental Impact Chart
    const impactCtx = document.getElementById('impactChart').getContext('2d');
    new Chart(impactCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'CO₂ Saved (kg)',
                data: [1200, 1100, 1500, 1400, 1600, 700],
                backgroundColor: '#27ae60',
                borderColor: '#27ae60',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'CO₂ (kg)'
                    }
                }
            }
        }
    });
}

// Setup all event listeners
function setupEventListeners() {
    // Navigation link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const sectionName = link.getAttribute('data-section');
            switchSection(sectionName);
        });
    });

    // Notifications toggle
    notificationsToggle.addEventListener('click', toggleNotifications);
    
    // Mark all notifications as read
    markAllReadBtn.addEventListener('click', markAllNotificationsAsRead);
    
    // Mark individual notifications as read
    document.querySelectorAll('.read-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const notification = e.target.closest('.notification-item');
            notification.classList.remove('unread');
            updateNotificationCount();
        });
    });
    
    // Auction bid buttons
    document.querySelectorAll('.bid-btn').forEach(btn => {
        btn.addEventListener('click', placeBid);
    });
    
    // Filter changes
    const filters = document.querySelectorAll('select[id$="Filter"]');
    filters.forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
}

// Switch between dashboard sections
function switchSection(sectionName) {
    // Update navigation active state
    navLinks.forEach(link => {
        if (link.getAttribute('data-section') === sectionName) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Show the selected section, hide others
    dashboardSections.forEach(section => {
        if (section.id === `${sectionName}Section`) {
            section.classList.add('active');
            // Simulate data loading when switching sections
            showLoader();
            setTimeout(hideLoader, 800);
        } else {
            section.classList.remove('active');
        }
    });
}

// Toggle notifications panel
function toggleNotifications() {
    notificationsPanel.classList.toggle('minimized');
}

// Mark all notifications as read
function markAllNotificationsAsRead() {
    document.querySelectorAll('.notification-item').forEach(notification => {
        notification.classList.remove('unread');
    });
    updateNotificationCount();
}

// Update the notification count badges
function updateNotificationCount() {
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    const badges = document.querySelectorAll('.badge');
    
    badges.forEach(badge => {
        badge.textContent = unreadCount;
        if (unreadCount === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'inline-block';
        }
    });
}

// Simulate placing a bid
function placeBid(e) {
    const bidCard = e.target.closest('.auction-card');
    const bidInput = bidCard.querySelector('.bid-input');
    const currentBid = bidCard.querySelector('.bid-amount');
    
    if (bidInput.value && !isNaN(bidInput.value) && parseInt(bidInput.value) > parseInt(currentBid.textContent.replace(/[^0-9]/g, ''))) {
        showLoader();
        
        setTimeout(() => {
            currentBid.textContent = `₹${parseInt(bidInput.value).toLocaleString()}`;
            bidInput.value = '';
            
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.textContent = 'Bid placed successfully!';
            bidCard.appendChild(successMsg);
            
            setTimeout(() => {
                successMsg.remove();
            }, 3000);
            
            hideLoader();
        }, 1000);
    } else {
        // Show error message
        const errorMsg = document.createElement('div');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'Please enter a valid bid amount higher than the current bid.';
        bidCard.appendChild(errorMsg);
        
        setTimeout(() => {
            errorMsg.remove();
        }, 3000);
    }
}

// Apply filters (for auctions, suppliers, etc.)
function applyFilters() {
    // This would normally fetch filtered data from the server
    // For now, we'll just simulate loading
    showLoader();
    setTimeout(hideLoader, 1000);
}

// Show loading spinner
function showLoader() {
    loader.classList.remove('hidden');
}

// Hide loading spinner
function hideLoader() {
    loader.classList.add('hidden');
}

// Simulate real-time data updates
setInterval(() => {
    // Randomly update a stat to simulate real-time data
    const statChanges = document.querySelectorAll('.stat-change');
    const randomIndex = Math.floor(Math.random() * statChanges.length);
    const targetStat = statChanges[randomIndex];
    
    // Briefly highlight the change
    targetStat.classList.add('updating');
    setTimeout(() => {
        targetStat.classList.remove('updating');
    }, 1000);
}, 30000); // Every 30 seconds

// Handle bid countdown timers
function updateAuctionTimers() {
    const timeLeftElements = document.querySelectorAll('.time-left');
    
    timeLeftElements.forEach(element => {
        // Extract time values
        const timeText = element.textContent;
        let hours = parseInt(timeText.split('h')[0]);
        let minutes = parseInt(timeText.split('h ')[1].split('m')[0]);
        
        // Decrease time
        minutes--;
        if (minutes < 0) {
            minutes = 59;
            hours--;
        }
        
        // Update display
        if (hours < 0) {
            element.textContent = 'Ended';
            element.style.color = 'var(--error-color)';
        } else {
            element.textContent = `${hours}h ${minutes}m left`;
            
            // Change color as time gets low
            if (hours === 0 && minutes < 30) {
                element.style.color = 'var(--error-color)';
            }
        }
    });
}

// Update auction timers every minute
setInterval(updateAuctionTimers, 60000);