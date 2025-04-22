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
    // Fetch total listings count
    fetch('http://localhost:5000/api/listings', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to fetch listings');
        }
        return response.json();
    })
    .then(listings => {
        console.log('Fetched listings:', listings); // Debug log
        
        // Update the DOM with total listings
        document.querySelector('.stat-card:nth-child(1) h3').textContent = 'Total Listings';
        document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = listings.length;
        
        // Set other stats to 0
        document.querySelector('.stat-card:nth-child(2) .stat-number').textContent = '0';
        document.querySelector('.stat-card:nth-child(3) .stat-number').textContent = '0';
        document.querySelector('.stat-card:nth-child(4) .stat-number').textContent = '₹0';

        // Fixed scrap rates
        const scrapRates = [
            { category: 'Metal', price: 35, icon: 'cog' },
            { category: 'E-waste', price: 45, icon: 'laptop' },
            { category: 'Plastic', price: 15, icon: 'wine-bottle' },
            { category: 'Paper', price: 12, icon: 'newspaper' },
            { category: 'Glass', price: 8, icon: 'wine-glass' },
            { category: 'Wood', price: 10, icon: 'tree' }
        ];

        // Create category prices section with current rates
        const categoryPricesSection = document.createElement('div');
        categoryPricesSection.className = 'category-prices-section';
        categoryPricesSection.innerHTML = `
            <h3 class="section-title">Current Scrap Rates (₹/kg)</h3>
            <div class="category-prices-grid">
                ${scrapRates.map(item => `
                    <div class="category-price-card">
                        <div class="category-icon">
                            <i class="fas fa-${item.icon}"></i>
                        </div>
                        <div class="category-info">
                            <h4>${item.category} Scrap</h4>
                            <div class="price-info">
                                <span class="avg-price">₹${item.price}/kg</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        // Remove ongoing orders section if it exists
        const ongoingOrdersSection = document.querySelector('.ongoing-orders-section');
        if (ongoingOrdersSection) {
            ongoingOrdersSection.remove();
        }

        // Remove existing category prices section if it exists
        const existingCategoryPricesSection = document.querySelector('.category-prices-section');
        if (existingCategoryPricesSection) {
            existingCategoryPricesSection.remove();
        }

        // Add category prices section after stats grid
        const statsGrid = document.querySelector('.stats-grid');
        statsGrid.parentNode.insertBefore(categoryPricesSection, statsGrid.nextSibling);
    })
    .catch(error => {
        console.error('Error loading dashboard stats:', error);
        // Show error message to user
        document.querySelector('.stat-card:nth-child(1) .stat-number').textContent = 'Error';
    });
}

function getCategoryIcon(category) {
    const icons = {
        metal: 'bolt',
        plastic: 'recycle',
        ewaste: 'laptop',
        paper: 'file-alt',
        glass: 'wine-glass'
    };
    return icons[category] || 'box';
}

function loadActiveOrders() {
    console.log('1. Starting loadActiveOrders function');
    const ordersList = document.querySelector('.orders-list');
    console.log('2. Orders list element:', ordersList);
    
    if (!ordersList) {
        console.error('Orders list element not found!');
        return;
    }

    ordersList.innerHTML = '<div class="loading-spinner">Loading orders...</div>';
    console.log('3. Added loading spinner');

    fetch('http://localhost:5000/api/listings?status=all', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        console.log('4. API Response status:', response.status);
        if (!response.ok) throw new Error(`Failed to fetch orders: ${response.status}`);
        return response.json();
    })
    .then(listings => {
        console.log('5. All listings received:', listings);
        
        const pendingOrders = listings.filter(listing => listing.status === 'pending');
        console.log('6. Filtered pending orders:', pendingOrders);

        if (pendingOrders.length === 0) {
            console.log('7. No pending orders found');
            ordersList.innerHTML = '<p class="no-orders">No active orders</p>';
            return;
        }

        console.log('8. Rendering orders');
        ordersList.innerHTML = pendingOrders.map(order => {
            console.log('9. Processing order:', order);
            const pickupDate = order.pickupDetails ? new Date(order.pickupDetails.pickupDate).toLocaleDateString() : 'Not set';
            const orderJson = JSON.stringify(order).replace(/"/g, '&quot;');
            console.log('10. Prepared order JSON:', orderJson);
            
            return `
                <div class="order-card">
                    <div class="order-header">
                        <h3>${order.category} Scrap</h3>
                        <span class="order-status pending">Pending Pickup</span>
                    </div>
                    <div class="order-details">
                        <div class="detail-row">
                            <span class="label">Pickup Date:</span>
                            <span class="value">${pickupDate}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Pickup Time:</span>
                            <span class="value">${order.pickupDetails?.pickupTime || '12:52'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Collector:</span>
                            <span class="value">${order.pickupDetails?.collectorName || 'ABC'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Phone:</span>
                            <span class="value">${order.pickupDetails?.phoneNumber || '9167671480'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Category:</span>
                            <span class="value">${order.category.toUpperCase()}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Quantity:</span>
                            <span class="value">${order.quantity || '80'} kg</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Price:</span>
                            <span class="value">₹${order.price || '3600'}</span>
                        </div>
                    </div>
                    <div class="order-actions">
                        <button class="contact-collector" onclick="showPickupDetailsPopup(${orderJson})">
                            <i class="fas fa-phone"></i> Contact Collector
                        </button>
                        <button class="cancel-order">
                            <i class="fas fa-times"></i> Cancel Order
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        console.log('11. Finished rendering orders');

    })
    .catch(error => {
        console.error('Error in loadActiveOrders:', error);
        console.error('Error details:', {
            errorMessage: error.message,
            errorStack: error.stack
        });
        ordersList.innerHTML = `
            <div class="error-message">
                <h3>Error Loading Orders</h3>
                <p>Failed to load your orders. Please try again later.</p>
                <p>Error details: ${error.message}</p>
            </div>
        `;
    });
}

async function loadScrapListings() {
    try {
        console.log('Starting to load scrap listings...');
        showLoader();
        
        const selectedCity = document.getElementById('cityFilter').value;
        console.log('Selected city:', selectedCity);
        
        const token = localStorage.getItem('token');
        console.log('Token exists:', !!token);
        
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        const url = `http://localhost:5000/api/listings${selectedCity ? `?city=${selectedCity}` : ''}`;
        console.log('Fetching from URL:', url);
        
        // Fetch listings from the API
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const listings = await response.json();
        console.log('Received listings:', listings);
        
        if (!Array.isArray(listings)) {
            throw new Error('Invalid response format');
        }
        
        // Filter out listings that are not in 'in_review' status
        const availableListings = listings.filter(listing => listing.status === 'in_review');
        console.log(`Found ${availableListings.length} available listings`);
        
        displayListings(availableListings);
    } catch (error) {
        console.error('Error loading listings:', error);
        const listingsContainer = document.getElementById('listingsContainer');
        if (listingsContainer) {
            listingsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${error.message === 'No authentication token found' ? 'Please log in to view listings' : 'Failed to load listings. Please try again later.'}</p>
                </div>
            `;
        }
    } finally {
        hideLoader();
    }
}

function showPickupPopup(listingId) {
    // Remove any existing popups
    const existingPopup = document.querySelector('.popup');
    if (existingPopup) {
        existingPopup.remove();
    }

    const popup = document.createElement('div');
    popup.className = 'popup';
    popup.innerHTML = `
        <div class="popup-content">
            <span class="close-btn">&times;</span>
            <h2>Schedule Pickup</h2>
            <form id="pickupForm">
                <div class="form-group">
                    <label for="collectorName">Collector Name:</label>
                    <input type="text" id="collectorName" required>
                </div>
                <div class="form-group">
                    <label for="phoneNumber">Phone Number:</label>
                    <input type="tel" id="phoneNumber" required>
                </div>
                <div class="form-group">
                    <label for="pickupDate">Pickup Date:</label>
                    <input type="date" id="pickupDate" required>
                </div>
                <div class="form-group">
                    <label for="pickupTime">Pickup Time:</label>
                    <input type="time" id="pickupTime" required>
                </div>
                <button type="submit" class="btn-primary">Schedule Now</button>
            </form>
        </div>
    `;

    document.body.appendChild(popup);

    // Close popup when clicking the close button
    popup.querySelector('.close-btn').addEventListener('click', () => {
        popup.remove();
    });

    // Close popup when clicking outside
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.remove();
        }
    });

    // Handle form submission
    popup.querySelector('#pickupForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const pickupData = {
            collectorName: document.getElementById('collectorName').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            pickupDate: document.getElementById('pickupDate').value,
            pickupTime: document.getElementById('pickupTime').value,
            listingId: listingId
        };

        try {
            const response = await fetch('http://localhost:5000/api/listings/schedule-pickup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(pickupData)
            });

            if (response.ok) {
                alert('Pickup Scheduled Successfully!');
                popup.remove();
                // Reload the listings to reflect the changes
                loadScrapListings();
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to schedule pickup');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while scheduling pickup');
        }
    });
}

function displayListings(listings) {
    const listingsContainer = document.querySelector('.listings-grid');
    if (!listingsContainer) {
        console.error('Listings container not found');
        return;
    }

    if (!listings || listings.length === 0) {
        listingsContainer.innerHTML = `
            <div class="no-listings">
                <i class="fas fa-search"></i>
                <p>No listings found</p>
            </div>
        `;
        return;
    }

    listingsContainer.innerHTML = '';
    
    listings.forEach(listing => {
        const listingCard = document.createElement('div');
        listingCard.className = 'listing-card';
        listingCard.innerHTML = `
            <div class="listing-image">
                <img src="${listing.photo || 'placeholder.jpg'}" alt="${listing.title}">
            </div>
            <div class="listing-details">
                <h3>${toTitleCase(listing.title)}</h3>
                <p class="category">${toTitleCase(listing.category)}</p>
                <p class="price">₹${listing.price}</p>
                <p class="location">${listing.city}</p>
                <div class="listing-actions">
                    <button class="btn-secondary view-details" data-id="${listing._id}">View Details</button>
                    <button class="btn-primary schedule-pickup" data-id="${listing._id}">Schedule Pickup</button>
                </div>
            </div>
        `;

        // Add event listeners
        listingCard.querySelector('.view-details').addEventListener('click', () => {
            showListingDetails(listing._id);
        });

        listingCard.querySelector('.schedule-pickup').addEventListener('click', () => {
            showPickupPopup(listing._id);
        });

        listingsContainer.appendChild(listingCard);
    });
}

// Helper function to convert string to title case
function toTitleCase(str) {
    if (!str) return '';
    return str.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

// Function to show listing details in a popup
function showListingDetails(listingId) {
    // Show loading state
    const loadingModal = document.createElement('div');
    loadingModal.className = 'popup';
    loadingModal.innerHTML = `
        <div class="popup-content">
            <div class="loading-spinner">Loading...</div>
        </div>
    `;
    document.body.appendChild(loadingModal);

    fetch(`http://localhost:5000/api/listings/${listingId}`, {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(listing => {
        // Remove loading modal
        loadingModal.remove();

        // Add null checks
        if (!listing) {
            throw new Error('No listing data received');
        }

        const modal = document.createElement('div');
        modal.className = 'popup';
        modal.innerHTML = `
            <div class="popup-content">
                <span class="close-btn">&times;</span>
                <div class="listing-detail-content">
                    <div class="listing-detail-image">
                        <img src="${listing.photo || 'assets/images/placeholder.jpg'}" alt="${listing.title || 'Listing'}" onerror="this.src='assets/images/placeholder.jpg'">
                    </div>
                    <div class="listing-detail-info">
                        <h2>${listing.title ? toTitleCase(listing.title) : 'No Title'}</h2>
                        <div class="detail-row">
                            <span class="label">Category</span>
                            <span class="value">${listing.category ? toTitleCase(listing.category) : 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Description</span>
                            <span class="value description">${listing.description || 'No description available'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Quantity</span>
                            <span class="value">${listing.quantity ? `${listing.quantity} kg` : 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Price</span>
                            <span class="value">${listing.price ? `₹${listing.price}` : 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">City</span>
                            <span class="value">${listing.city || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Status</span>
                            <span class="value">${listing.status ? toTitleCase(listing.status) : 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Posted By</span>
                            <span class="value">${listing.user && listing.user.name ? toTitleCase(listing.user.name) : 'Unknown'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Posted On</span>
                            <span class="value">${listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'N/A'}</span>
                        </div>
                        ${listing.status === 'available' ? `
                            <div class="action-buttons">
                                <button class="btn primary-btn" onclick="showPickupPopup('${listing._id}')">Schedule Pickup</button>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);

        // Close popup when clicking the close button
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
        });

        // Close popup when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    })
    .catch(error => {
        // Remove loading modal if it exists
        loadingModal.remove();
        
        console.error('Error fetching listing details:', error);
        // Show error modal
        const errorModal = document.createElement('div');
        errorModal.className = 'popup';
        errorModal.innerHTML = `
            <div class="popup-content">
                <span class="close-btn">&times;</span>
                <div class="error-message">
                    <h3>Error Loading Details</h3>
                    <p>Failed to load listing details. Please try again later.</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(errorModal);

        // Close error modal when clicking the close button
        errorModal.querySelector('.close-btn').addEventListener('click', () => {
            errorModal.remove();
        });

        // Close error modal when clicking outside
        errorModal.addEventListener('click', (e) => {
            if (e.target === errorModal) {
                errorModal.remove();
            }
        });
    });
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
    const modal = document.getElementById('orderDetailsModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

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

// Add event listener for city filter
document.getElementById('cityFilter').addEventListener('change', loadScrapListings);

// Add event listener for search input
document.querySelector('.search-input').addEventListener('input', debounce(async (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const selectedCity = document.getElementById('cityFilter').value;
    
    try {
        showLoader();
        const response = await fetch(`http://localhost:5000/api/listings${selectedCity ? `?city=${selectedCity}` : ''}`);
        if (!response.ok) throw new Error('Failed to fetch listings');
        
        const listings = await response.json();
        const filteredListings = listings.filter(listing => 
            listing.title.toLowerCase().includes(searchTerm) ||
            listing.category.toLowerCase().includes(searchTerm) ||
            listing.description.toLowerCase().includes(searchTerm)
        );
        displayListings(filteredListings);
    } catch (error) {
        console.error('Error searching listings:', error);
        document.querySelector('.listings-grid').innerHTML = '<p class="error-message">Failed to search listings. Please try again.</p>';
    } finally {
        hideLoader();
    }
}, 500));

// Add this function after the existing functions
function showPickupDetailsPopup(orderData) {
    console.log('1. showPickupDetailsPopup called with:', orderData);
    
    // If orderData is a string and looks like an ID, fetch the order details first
    if (typeof orderData === 'string' && orderData.match(/^[0-9a-fA-F]{24}$/)) {
        console.log('2. OrderData is an ID, fetching order details');
        fetch(`http://localhost:5000/api/listings/${orderData}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error(`Failed to fetch order: ${response.status}`);
            return response.json();
        })
        .then(order => {
            showPickupDetailsPopup(order); // Recursively call with the full order data
        })
        .catch(error => {
            console.error('Error fetching order details:', error);
            alert('Failed to load order details. Please try again.');
        });
        return;
    }
    
    try {
        console.log('3. Processing order data');
        const order = typeof orderData === 'string' ? JSON.parse(orderData) : orderData;
        console.log('4. Parsed/processed order data:', order);
        
        // Remove any existing popup
        const existingPopup = document.querySelector('.pickup-details-popup');
        if (existingPopup) {
            console.log('5. Removing existing popup');
            existingPopup.remove();
        }

        console.log('6. Creating new popup');
        // Create popup HTML
        const popup = document.createElement('div');
        popup.className = 'pickup-details-popup';
        
        const phoneNumber = order.pickupDetails?.phoneNumber || '9167671480';
        console.log('7. Phone number to be used:', phoneNumber);
        
        popup.innerHTML = `
            <div class="pickup-details-content">
                <div class="pickup-details-header">
                    <h3>Pickup Details</h3>
                    <button class="close-popup">&times;</button>
                </div>
                <div class="pickup-details-body">
                    <div class="pickup-detail-item">
                        <span class="label">Collector Name</span>
                        <span class="value">${order.pickupDetails?.collectorName || 'ABC'}</span>
                    </div>
                    <div class="pickup-detail-item">
                        <span class="label">Phone Number</span>
                        <span class="value">${phoneNumber}</span>
                    </div>
                    <div class="pickup-detail-item">
                        <span class="label">Pickup Date</span>
                        <span class="value">${order.pickupDetails ? new Date(order.pickupDetails.pickupDate).toLocaleDateString() : 'Not set'}</span>
                    </div>
                    <div class="pickup-detail-item">
                        <span class="label">Pickup Time</span>
                        <span class="value">${order.pickupDetails?.pickupTime || '12:52'}</span>
                    </div>
                </div>
            </div>
        `;

        console.log('8. Adding popup to body');
        // Add popup to body
        document.body.appendChild(popup);

        console.log('9. Adding animation class');
        // Show popup with animation
        requestAnimationFrame(() => {
            popup.classList.add('active');
        });

        console.log('10. Setting up close button listener');
        // Close popup when clicking close button
        popup.querySelector('.close-popup').addEventListener('click', () => {
            console.log('Close button clicked');
            popup.classList.remove('active');
            setTimeout(() => popup.remove(), 300);
        });

        console.log('11. Setting up outside click listener');
        // Close popup when clicking outside
        popup.addEventListener('click', (e) => {
            if (e.target === popup) {
                console.log('Outside popup clicked');
                popup.classList.remove('active');
                setTimeout(() => popup.remove(), 300);
            }
        });

    } catch (error) {
        console.error('Error in showPickupDetailsPopup:', error);
        console.error('Error details:', {
            orderData: orderData,
            orderType: typeof orderData,
            errorMessage: error.message,
            errorStack: error.stack
        });
    }
}