document.addEventListener('DOMContentLoaded', function() {
    // Initialize dashboard components
    initializeDashboard();
    setupEventListeners();
    loadInitialData();
});

// Dashboard Initialization
function initializeDashboard() {
    // Show loading spinner
    showLoader();
    
    // Load user data
    loadUserData();
    
    // Initialize active section from URL or default to dashboard
    const currentSection = getCurrentSectionFromURL() || 'dashboard';
    switchSection(currentSection);
    
    // Hide loading spinner
    hideLoader();
}

// Event Listeners Setup
function setupEventListeners() {
    // Sidebar Navigation
    document.querySelectorAll('.nav-links li').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });

    // Notifications Toggle
    document.getElementById('notificationsToggle').addEventListener('click', toggleNotifications);

    // Mark All Read Button
    document.getElementById('markAllRead').addEventListener('click', markAllNotificationsAsRead);

    // Order Tabs
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchOrderTab(tabId);
        });
    });

    // Save/Unsave Listings
    document.querySelectorAll('.save-btn').forEach(btn => {
        btn.addEventListener('click', toggleSavedListing);
    });

    // Search and Filters
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 500));
    }

    document.getElementById('applyFilters')?.addEventListener('click', applyFilters);

    // Add event listeners for filters
    document.getElementById('cityFilter').addEventListener('change', loadScrapListings);
    document.getElementById('categoryFilter').addEventListener('change', loadScrapListings);
}

// Utility Functions
function showLoader() {
    document.querySelector('.loader').classList.remove('hidden');
}

function hideLoader() {
    document.querySelector('.loader').classList.add('hidden');
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Navigation Functions
function switchSection(sectionName) {
    // Remove active class from all sections and nav items
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    document.querySelectorAll('.nav-links li').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to selected section and nav item
    document.getElementById(`${sectionName}Section`).classList.add('active');
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update URL
    history.pushState(null, '', `#${sectionName}`);

    // Load section-specific data
    loadSectionData(sectionName);
}

function getCurrentSectionFromURL() {
    const hash = window.location.hash;
    return hash ? hash.substring(1) : null;
}

// Notifications Functions
function initializeNotifications() {
    updateNotificationCount();
    // Set up WebSocket connection for real-time notifications
    setupNotificationWebSocket();
}

function toggleNotifications() {
    const panel = document.getElementById('notificationsPanel');
    panel.classList.toggle('minimized');
}

function markAllNotificationsAsRead() {
    document.querySelectorAll('.notification-item.unread').forEach(item => {
        item.classList.remove('unread');
    });
    updateNotificationCount();
}

function updateNotificationCount() {
    const unreadCount = document.querySelectorAll('.notification-item.unread').length;
    const badge = document.querySelector('.notifications-toggle .badge');
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
}

// Orders Functions
function switchOrderTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    document.getElementById(`${tabId}Tab`).classList.add('active');
}

// Listings Functions
function toggleSavedListing(event) {
    const btn = event.currentTarget;
    btn.classList.toggle('active');
    const icon = btn.querySelector('i');
    if (btn.classList.contains('active')) {
        icon.classList.remove('far');
        icon.classList.add('fas');
    } else {
        icon.classList.remove('fas');
        icon.classList.add('far');
    }
}

// Search and Filter Functions
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    // Implement search logic
    console.log('Searching for:', searchTerm);
}

function applyFilters() {
    const category = document.getElementById('categoryFilter').value;
    const price = document.getElementById('priceFilter').value;
    const location = document.getElementById('locationFilter').value;

    // Implement filter logic
    console.log('Applying filters:', { category, price, location });
}

// Data Loading Functions
function loadInitialData() {
    loadDashboardStats();
    loadActiveOrders();
    loadSavedListings();
}

function loadSectionData(section) {
    switch (section) {
        case 'dashboard':
            loadDashboardStats();
            loadActiveOrders();
            break;
        case 'browse':
            loadScrapListings();
            break;
        case 'orders':
            loadAllOrders();
            break;
        case 'saved':
            loadSavedListings();
            break;
        case 'messages':
            loadMessages();
            break;
        case 'payments':
            loadPaymentHistory();
            break;
        case 'profile':
            loadProfileData();
            break;
    }
}

// API Integration Functions (to be implemented based on backend API)
function loadDashboardStats() {
    // Set all stats to zero
    const stats = {
        totalOrders: 0,
        activeOrders: 0,
        savedListings: 0,
        totalSpent: 0
    };

    // Update the DOM with zero values
    document.querySelectorAll('.stat-number').forEach(stat => {
        const statType = stat.closest('.stat-card').querySelector('h3').textContent;
        switch(statType) {
            case 'Total Orders':
                stat.textContent = stats.totalOrders;
                break;
            case 'Active Orders':
                stat.textContent = stats.activeOrders;
                break;
            case 'Saved Listings':
                stat.textContent = stats.savedListings;
                break;
            case 'Total Spent':
                stat.textContent = `₹${stats.totalSpent}`;
                break;
        }
    });

    // Remove the stat-change elements
    document.querySelectorAll('.stat-change').forEach(change => {
        change.remove();
    });
}

function loadActiveOrders() {
    const ordersList = document.querySelector('.orders-list');
    if (ordersList) {
        ordersList.innerHTML = '<p class="no-orders">No active orders</p>';
    }
}

async function loadScrapListings() {
    try {
        showLoader();
        const selectedCity = document.getElementById('cityFilter').value;
        const selectedCategory = document.getElementById('categoryFilter').value;
        
        // Only fetch listings if a city is selected
        if (selectedCity) {
            const response = await fetch(`/api/listings/city/${selectedCity}`);
            if (!response.ok) throw new Error('Failed to fetch listings');
            
            const listings = await response.json();
            // Filter by category if selected
            const filteredListings = selectedCategory 
                ? listings.filter(listing => listing.category === selectedCategory)
                : listings;
            
            displayListings(filteredListings);
        } else {
            // Clear listings if no city is selected
            document.getElementById('listingsGrid').innerHTML = '<p class="no-listings">Please select a city to view listings</p>';
        }
    } catch (error) {
        console.error('Error loading listings:', error);
        document.getElementById('listingsGrid').innerHTML = '<p class="error-message">Failed to load listings. Please try again.</p>';
    } finally {
        hideLoader();
    }
}

function displayListings(listings) {
    const listingsGrid = document.getElementById('listingsGrid');
    if (!listings.length) {
        listingsGrid.innerHTML = '<p class="no-listings">No listings found in this city</p>';
        return;
    }

    listingsGrid.innerHTML = listings.map(listing => `
        <div class="listing-card" data-id="${listing._id}">
            <div class="listing-image">
                <img src="${listing.photo}" alt="${listing.category}">
            </div>
            <div class="listing-details">
                <h3>${listing.category.charAt(0).toUpperCase() + listing.category.slice(1)}</h3>
                <p class="description">${listing.description}</p>
                <p class="quantity">Quantity: ${listing.quantity} kg</p>
                <p class="location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${listing.city}
                </p>
                <div class="listing-footer">
                    <button class="save-btn" onclick="toggleSavedListing('${listing._id}')">
                        <i class="fas fa-star"></i>
                    </button>
                    <button class="contact-btn" onclick="contactSeller('${listing._id}')">
                        Contact Seller
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function loadAllOrders() {
    // Fetch and display all orders
}

function loadSavedListings() {
    const savedListingsContainer = document.querySelector('.saved-listings');
    if (savedListingsContainer) {
        savedListingsContainer.innerHTML = '<p class="no-listings">No saved listings</p>';
    }
}

function loadMessages() {
    // Fetch and display messages
}

function loadPaymentHistory() {
    // Fetch and display payment history
}

function loadProfileData() {
    // Fetch and display profile data
}

// WebSocket Setup for Real-time Features
function setupNotificationWebSocket() {
    // Initialize WebSocket connection for real-time notifications
    const ws = new WebSocket('your-websocket-url');

    ws.onmessage = function(event) {
        const notification = JSON.parse(event.data);
        addNotification(notification);
    };

    ws.onerror = function(error) {
        console.error('WebSocket error:', error);
    };
}

function addNotification(notification) {
    // Add new notification to the panel
    const notificationsList = document.querySelector('.notifications-list');
    const notificationItem = createNotificationElement(notification);
    notificationsList.insertBefore(notificationItem, notificationsList.firstChild);
    updateNotificationCount();
}

function createNotificationElement(notification) {
    const div = document.createElement('div');
    div.className = 'notification-item unread';
    div.innerHTML = `
        <div class="notification-content">
            <p>${notification.message}</p>
            <button class="read-btn">Mark Read</button>
        </div>
        <small>${notification.timestamp}</small>
    `;
    div.querySelector('.read-btn').addEventListener('click', function() {
        div.classList.remove('unread');
        updateNotificationCount();
    });
    return div;
}

// Load user data
async function loadUserData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }

        const response = await fetch('http://localhost:5000/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const userData = await response.json();
            document.getElementById('user-name').textContent = userData.firstName;
        } else {
            throw new Error('Failed to fetch user data');
        }
    } catch (error) {
        console.error('Error loading user data:', error);
        document.getElementById('user-name').textContent = 'User';
    }
}