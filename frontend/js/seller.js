// Navigation
const navLinks = document.querySelectorAll('.nav-links li');
const sections = document.querySelectorAll('.dashboard-section');

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        const page = link.getAttribute('data-page');
        
        // Update active states
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Show selected section
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
            if (section.id === page) {
                section.classList.add('active');
            }
        });

        // Load appropriate data based on the section
        if (page === 'sell') {
            setTimeout(() => {
                setupFormHandlers();
            }, 0);
        } else if (page === 'listings') {
            setTimeout(() => {
                fetchListings();
            }, 0);
        } else if (page === 'orders') {
            setTimeout(() => {
                loadPendingOrders();
            }, 0);
        }
    });
});

// Add Toggle for Notifications Panel
const notificationsPanelToggle = document.createElement('button');
notificationsPanelToggle.classList.add('notifications-toggle');
notificationsPanelToggle.innerHTML = '<i class="fas fa-bell-slash"></i>'; // Start with bell-slash icon
document.querySelector('.top-bar').appendChild(notificationsPanelToggle);

// Set up initial state for notification panel - START FIX #1
document.addEventListener('DOMContentLoaded', () => {
    const notificationsPanel = document.querySelector('.notifications-panel');
    if (notificationsPanel) {
        notificationsPanel.classList.add('minimized'); // Add minimized class by default
    }
});
// END FIX #1

notificationsPanelToggle.addEventListener('click', () => {
    const notificationsPanel = document.querySelector('.notifications-panel');
    notificationsPanel.classList.toggle('minimized');
    
    // Update the toggle button icon
    const icon = notificationsPanelToggle.querySelector('i');
    if (notificationsPanel.classList.contains('minimized')) {
        icon.classList.remove('fa-bell');
        icon.classList.add('fa-bell-slash');
    } else {
        icon.classList.remove('fa-bell-slash');
        icon.classList.add('fa-bell');
    }
});

// Notifications
let notifications = [
    { id: 1, message: 'New order request received', read: false },
    { id: 2, message: 'Payment confirmed for Order #123', read: false },
    { id: 3, message: 'Your listing was approved', read: true }
];

function updateNotifications() {
    const notificationsList = document.querySelector('.notifications-list');
    if (!notificationsList) return;
    
    notificationsList.innerHTML = '';
    
    notifications.forEach(notification => {
        const notificationItem = document.createElement('div');
        notificationItem.classList.add('notification-item');
        if (!notification.read) notificationItem.classList.add('unread');
        
        notificationItem.innerHTML = `
            <div class="notification-content">
                <p>${notification.message}</p>
                <button class="read-btn" data-id="${notification.id}">
                    ${notification.read ? 'Read' : 'Mark as read'}
                </button>
            </div>
        `;
        
        notificationsList.appendChild(notificationItem);
    });
    
    // Add event listeners correctly
    document.querySelectorAll('.read-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(e.target.getAttribute('data-id'));
            markNotificationAsRead(id);
        });
    });
}

function markNotificationAsRead(id) {
    // Find and update the specific notification
    notifications = notifications.map(notification => 
        notification.id === id ? { ...notification, read: true } : notification
    );
    
    // Update UI to reflect changes
    updateNotifications();
    
    // Update notification count if needed
    updateNotificationCount();
}

function updateNotificationCount() {
    // Count unread notifications
    const unreadCount = notifications.filter(n => !n.read).length;
    
    // Update UI if a notification counter element exists
    const counter = document.querySelector('.notification-counter');
    if (counter) {
        if (unreadCount > 0) {
            counter.textContent = unreadCount;
            counter.style.display = 'block';
        } else {
            counter.style.display = 'none';
        }
    }
}

// Logout Handler
function setupLogoutHandler() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            console.log("logout button clicked");
            if (confirm('Are you sure you want to logout?')) {
                // Clear authentication token
                localStorage.removeItem('token');
                // Clear any other user-related data
                localStorage.removeItem('userRole');
                // Redirect to login page
                window.location.href = '../pages/login.html';
            }
        });
    }
}

// Form Submission Handler (for Sell Scrap form)
function setupFormHandlers() {
    console.log('Setting up form handlers...');
    const sellForm = document.getElementById('sellScrapForm');
    const photoInput = document.getElementById('scrapPhoto');
    const photoPreview = document.getElementById('photoPreview');
    
    console.log('Form element:', sellForm);
    
    // Add photo preview functionality
    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    photoPreview.src = e.target.result;
                    photoPreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    if (sellForm) {
        sellForm.addEventListener('submit', async (e) => {
            console.log('Form submitted');
            e.preventDefault();
            const loader = document.querySelector('.loader');
            if (loader) loader.classList.remove('hidden');
            
            try {
                const formData = new FormData(sellForm);
                const photoFile = formData.get('photo');
                const category = formData.get('category');
                const quantity = parseFloat(formData.get('quantity'));
                
                // Calculate price based on category and quantity
                const price = calculatePrice(category, quantity);
                
                if (!price || isNaN(price)) {
                    throw new Error('Invalid price calculation. Please check category and quantity.');
                }
                
                // Convert photo to base64
                const photoBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(photoFile);
                });
                
                const data = {
                    title: `${category} Scrap`,
                    category: category, // This will be 'ewaste' instead of 'electronics'
                    description: formData.get('description'),
                    quantity: quantity,
                    addressLine: formData.get('addressLine'),
                    city: formData.get('city'),
                    pincode: formData.get('pincode'),
                    photo: photoBase64,
                    status: 'in_review',
                    price: price // Ensure price is included
                };
                
                console.log('Form data:', {
                    ...data,
                    photo: data.photo ? 'photo data exists' : 'no photo'
                });
                
                // Get the authentication token from localStorage
                const token = localStorage.getItem('token');
                console.log('Token:', token);
                
                if (!token) {
                    throw new Error('Please login to create a listing');
                }

                // Use the correct endpoint path
                console.log('Sending request to server...');
                const response = await fetch('http://localhost:5000/api/listings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(data)
                });

                console.log('Server response:', response);
                
                const responseData = await response.json();
                
                if (response.ok) {
                    console.log('Listing created successfully:', responseData);
                    alert('Listing created successfully!');
                    sellForm.reset();
                    photoPreview.style.display = 'none';
                    
                    // Wait a brief moment before fetching listings
                    setTimeout(() => {
                        console.log('Refreshing listings after creation...');
                        fetchListings();
                    }, 500);
                } else {
                    throw new Error(responseData.message || responseData.msg || 'Error creating listing. Please try again.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert(error.message || 'Error creating listing. Please try again.');
            } finally {
                if (loader) loader.classList.add('hidden');
            }
        });
    } else {
        console.error('Sell scrap form not found');
    }
}

// Helper function to calculate price based on category and quantity
function calculatePrice(category, quantity) {
    const rates = {
        'paper': 12,
        'plastic': 15,
        'metal': 35,
        'ewaste': 45,
        'glass': 8
    };
    
    const rate = rates[category];
    if (!rate || !quantity || quantity <= 0) {
        return null;
    }
    
    return rate * quantity;
}

// Fetch and display listings
async function fetchListings() {
    console.log("Fetching seller's listings...");
    try {
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        const response = await fetch(`http://localhost:5000/api/listings/my?t=${Date.now()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });
        
        console.log('Response status:', response.status);
        
        if (response.ok) {
            const listings = await response.json();
            console.log('Fetched listings:', listings);
            
            const listingsContainer = document.querySelector('.listings-grid');
            const statusFilter = document.getElementById('listingStatus');
            
            if (listingsContainer) {
                // Clear existing content
                listingsContainer.innerHTML = '';
                
                // Filter out pending listings from the main listings grid
                let availableListings = listings.filter(listing => listing.status !== 'pending');

                if (availableListings.length === 0) {
                    listingsContainer.innerHTML = '<p class="no-listings">No listings found. Create a new listing to get started!</p>';
                    return;
                }

                // Filter listings based on status
                let filteredListings = availableListings;
                if (statusFilter && statusFilter.value !== 'all') {
                    filteredListings = availableListings.filter(listing => {
                        switch(statusFilter.value) {
                            case 'active':
                                return listing.status === 'approved';
                            case 'review':
                                return listing.status === 'in_review';
                            case 'sold':
                                return listing.status === 'sold';
                            default:
                                return true;
                        }
                    });
                }

                // Create listing cards for each listing
                filteredListings.forEach(listing => {
                    const listingElement = document.createElement('div');
                    listingElement.classList.add('listing-card');
                    
                    // Calculate price based on category and quantity
                    const rates = {
                        'paper': 12,
                        'plastic': 15,
                        'metal': 35,
                        'ewaste': 45,
                        'glass': 8
                    };
                    const pricePerKg = rates[listing.category] || 10;
                    const totalPrice = listing.price || (pricePerKg * listing.quantity);
                    
                    // Determine status class and text
                    let statusClass = 'status-review';
                    let statusText = 'In Review';
                    if (listing.status === 'approved') {
                        statusClass = 'status-active';
                        statusText = 'Active';
                    } else if (listing.status === 'sold') {
                        statusClass = 'status-sold';
                        statusText = 'Sold';
                    } else if (listing.status === 'rejected') {
                        statusClass = 'status-rejected';
                        statusText = 'Rejected';
                    }
                    
                    listingElement.innerHTML = `
                        <div class="listing-image">
                            <img src="${listing.photo || 'placeholder.jpg'}" alt="${listing.title || listing.category}" onerror="this.src='assets/images/placeholder.jpg'">
                            <div class="listing-category">${listing.category.toUpperCase()}</div>
                            <div class="listing-status ${statusClass}">${statusText}</div>
                        </div>
                        <div class="listing-details">
                            <h3>${listing.title || `${listing.category.toUpperCase()} Scrap`}</h3>
                            <p class="listing-description">${listing.description}</p>
                            <div class="listing-info">
                                <div class="quantity-price">
                                    <span class="quantity">${listing.quantity} kg</span>
                                    <span class="price">₹${totalPrice}</span>
                                </div>
                                <div class="status-location">
                                    <span class="location">${listing.city}</span>
                                </div>
                            </div>
                        </div>
                        <div class="listing-actions">
                            <button class="edit-listing-btn" data-id="${listing._id}">Edit</button>
                            <button class="delete-listing-btn" data-id="${listing._id}">Delete</button>
                        </div>
                    `;
                    listingsContainer.appendChild(listingElement);
                });
                
                // Add event listeners to the edit and delete buttons
                setupListingActionButtons();
            }
        } else {
            const errorData = await response.json();
            console.error('Error fetching listings:', errorData);
            throw new Error(errorData.message || 'Failed to fetch listings');
        }
    } catch (error) {
        console.error('Error:', error);
        const listingsContainer = document.querySelector('.listings-grid');
        if (listingsContainer) {
            listingsContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>${error.message || 'Failed to load listings. Please try again.'}</p>
                </div>
            `;
        }
    }
}

// Function to show edit modal
function showEditModal(listing) {
    // Create modal HTML
    const modalHTML = `
        <div class="modal" id="editListingModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Listing</h2>
                    <button class="close-modal">&times;</button>
                </div>
                <form id="editListingForm">
                    <input type="hidden" name="id" value="${listing._id}">
                    <div class="form-group">
                        <label for="editCategory">Category</label>
                        <select id="editCategory" name="category" required>
                            <option value="paper" ${listing.category === 'paper' ? 'selected' : ''}>Paper Waste</option>
                            <option value="plastic" ${listing.category === 'plastic' ? 'selected' : ''}>Plastic</option>
                            <option value="metal" ${listing.category === 'metal' ? 'selected' : ''}>Metal Scrap</option>
                            <option value="ewaste" ${listing.category === 'ewaste' ? 'selected' : ''}>E-Waste</option>
                            <option value="glass" ${listing.category === 'glass' ? 'selected' : ''}>Glass</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editDescription">Description</label>
                        <textarea id="editDescription" name="description" required>${listing.description}</textarea>
                    </div>
                    <div class="form-group">
                        <label for="editQuantity">Quantity (kg)</label>
                        <input type="number" id="editQuantity" name="quantity" value="${listing.quantity}" min="1" required>
                    </div>
                    <div class="form-group">
                        <label for="editAddressLine">Address Line</label>
                        <input type="text" id="editAddressLine" name="addressLine" value="${listing.addressLine}" required>
                    </div>
                    <div class="form-group">
                        <label for="editPincode">Pincode *</label>
                        <input type="text" id="editPincode" name="pincode" value="${listing.pincode}" required>
                    </div>
                    <div class="form-group">
                        <label for="editCity">City *</label>
                        <select id="editCity" name="city" required>
                            <option value="">Select City</option>
                            <option value="MUMBAI" ${listing.city === 'MUMBAI' ? 'selected' : ''}>MUMBAI</option>
                            <option value="PUNE" ${listing.city === 'PUNE' ? 'selected' : ''}>PUNE</option>
                            <option value="NAVI MUMBAI" ${listing.city === 'NAVI MUMBAI' ? 'selected' : ''}>NAVI MUMBAI</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editStatus">Status</label>
                        <select id="editStatus" name="status" required>
                            <option value="in_review" ${listing.status === 'in_review' ? 'selected' : ''}>In Review</option>
                            <option value="active" ${listing.status === 'active' ? 'selected' : ''}>Active</option>
                            <option value="sold" ${listing.status === 'sold' ? 'selected' : ''}>Sold</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editPhoto">Photo</label>
                        <div class="photo-upload-container">
                            <input type="file" id="editPhoto" name="photo" accept="image/*">
                            <div class="photo-preview">
                                <img id="editPhotoPreview" src="${listing.photo}" alt="Current photo">
                            </div>
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="primary-btn">Save Changes</button>
                        <button type="button" class="secondary-btn close-modal">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    // Setup modal functionality
    const modal = document.getElementById('editListingModal');
    const closeButtons = modal.querySelectorAll('.close-modal');
    const editForm = document.getElementById('editListingForm');
    const photoInput = document.getElementById('editPhoto');
    const photoPreview = document.getElementById('editPhotoPreview');

    // Close modal when clicking close buttons
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modal.remove();
        });
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });

    // Handle photo preview
    if (photoInput) {
        photoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    photoPreview.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }

    // Handle form submission
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loader = document.querySelector('.loader');
        if (loader) loader.classList.remove('hidden');

        try {
            const formData = new FormData(editForm);
            const photoFile = formData.get('photo');
            let photoBase64 = listing.photo; // Keep existing photo if no new one is uploaded

            // If a new photo is uploaded, convert it to base64
            if (photoFile.size > 0) {
                photoBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(photoFile);
                });
            }

            const data = {
                category: formData.get('category'),
                description: formData.get('description'),
                quantity: parseFloat(formData.get('quantity')),
                addressLine: formData.get('addressLine'),
                city: formData.get('city'),
                pincode: formData.get('pincode'),
                photo: photoBase64,
                status: formData.get('status')
            };

            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please login to edit a listing');
            }

            const response = await fetch(`http://localhost:5000/api/listings/${listing._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                alert('Listing updated successfully!');
                modal.remove();
                fetchListings(); // Refresh the listings
            } else {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Error updating listing');
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'Error updating listing. Please try again.');
        } finally {
            if (loader) loader.classList.add('hidden');
        }
    });
}

// Add a function to handle the listing action buttons
function setupListingActionButtons() {
    // Edit button functionality 
    document.querySelectorAll('.edit-listing-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const listingId = e.target.getAttribute('data-id');
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Please login to edit a listing');
                }

                const response = await fetch(`http://localhost:5000/api/listings/${listingId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.msg || 'Failed to fetch listing details');
                }

                const listing = await response.json();
                showEditModal(listing);
            } catch (error) {
                console.error('Error:', error);
                alert(error.message || 'Error fetching listing details');
            }
        });
    });
    
    // Delete button functionality
    document.querySelectorAll('.delete-listing-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const listingId = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this listing?')) {
                try {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        throw new Error('Please login to delete a listing');
                    }

                    const response = await fetch(`http://localhost:5000/api/listings/${listingId}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    
                    if (response.ok) {
                        alert('Listing deleted successfully!');
                        fetchListings(); // Refresh the listings
                    } else {
                        const errorData = await response.json();
                        throw new Error(errorData.msg || 'Error deleting listing');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert(error.message || 'Error deleting listing. Please try again.');
                }
            }
        });
    });
}

function setupOrdersTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    if (tabBtns.length === 0) return;
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');
            
            // Update active tab button
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show selected tab content
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });
}

// Initialize the accordion for FAQ section
function setupAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    if (accordionHeaders.length === 0) return;
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const accordionItem = header.parentElement;
            accordionItem.classList.toggle('active');
            
            // Update the icon
            const icon = header.querySelector('i');
            if (accordionItem.classList.contains('active')) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        });
    });
}

// Initialize earnings chart
function initializeEarningsChart() {
    const earningsChart = document.getElementById('earningsChart');
    if (earningsChart) {
        new Chart(earningsChart.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Earnings (₹)',
                    data: [3800, 5200, 4500, 6300, 5800, 7200],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
}

// Initialize analytics charts
function initializeAnalyticsCharts() {
    // Revenue Chart
    const revenueChart = document.getElementById('revenueChart');
    if (revenueChart) {
        new Chart(revenueChart.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Revenue (₹)',
                    data: [3800, 5200, 4500, 6300, 5800, 7200],
                    backgroundColor: 'rgba(46, 204, 113, 0.7)',
                    borderColor: '#2ecc71',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Category Chart
    const categoryChart = document.getElementById('categoryChart');
    if (categoryChart) {
        new Chart(categoryChart.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Paper', 'Metal', 'Electronics', 'Plastic', 'Glass'],
                datasets: [{
                    data: [20, 35, 25, 15, 5],
                    backgroundColor: [
                        '#3498db',
                        '#2ecc71',
                        '#9b59b6',
                        '#e74c3c',
                        '#f1c40f'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    }
                }
            }
        });
    }
}

// Setup Chat Functionality in Messages section
function setupChatFunctionality() {
    const chatInput = document.querySelector('.chat-input input');
    const sendBtn = document.querySelector('.send-btn');
    const chatMessages = document.querySelector('.chat-messages');
    const conversationsList = document.querySelector('.conversation-list');
    const messagesSearch = document.querySelector('.messages-search input');
    
    if (!chatInput || !sendBtn || !chatMessages || !conversationsList) return;
    
    let currentConversation = null;
    
    // Load conversations
    async function loadConversations() {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please login to view messages');
            }

            const response = await fetch('http://localhost:5000/api/conversations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch conversations');
            }

            const conversations = await response.json();
            displayConversations(conversations);
        } catch (error) {
            console.error('Error loading conversations:', error);
            alert(error.message);
        }
    }

    // Display conversations in the sidebar
    function displayConversations(conversations) {
        conversationsList.innerHTML = '';
        
        conversations.forEach(conv => {
            const conversationElement = document.createElement('div');
            conversationElement.classList.add('conversation');
            conversationElement.dataset.userId = conv._id;
            
            const time = new Date(conv.lastMessageTime).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            conversationElement.innerHTML = `
                <img src="/api/placeholder/40/40" alt="User" class="user-avatar">
                <div class="conversation-preview">
                    <h4>${conv.user.name}</h4>
                    <p>${conv.lastMessage}</p>
                </div>
                <div class="conversation-meta">
                    <span class="time">${time}</span>
                    ${conv.unreadCount > 0 ? `<span class="unread-count">${conv.unreadCount}</span>` : ''}
                </div>
            `;
            
            conversationsList.appendChild(conversationElement);
        });
    }

    // Load messages for a specific conversation
    async function loadMessages(userId) {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please login to view messages');
            }

            const response = await fetch(`http://localhost:5000/api/messages/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch messages');
            }

            const messages = await response.json();
            displayMessages(messages);
            currentConversation = userId;
        } catch (error) {
            console.error('Error loading messages:', error);
            alert(error.message);
        }
    }

    // Display messages in the chat window
    function displayMessages(messages) {
        chatMessages.innerHTML = '';
        
        messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('message');
            messageElement.classList.add(message.sender === currentConversation ? 'received' : 'sent');
            
            const time = new Date(message.createdAt).toLocaleTimeString('en-IN', {
                hour: '2-digit',
                minute: '2-digit'
            });
            
            messageElement.innerHTML = `
                <p>${message.content}</p>
                <span class="message-time">${time}</span>
            `;
            
            chatMessages.appendChild(messageElement);
        });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Send a new message
    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message || !currentConversation) return;
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please login to send messages');
            }

            const response = await fetch('http://localhost:5000/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    receiver: currentConversation,
                    content: message
                })
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            // Clear input and reload messages
            chatInput.value = '';
            loadMessages(currentConversation);
        } catch (error) {
            console.error('Error sending message:', error);
            alert(error.message);
        }
    }
    
    // Event Listeners
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && chatInput.value.trim() !== '') {
            e.preventDefault();
            sendMessage();
        }
    });
    
    sendBtn.addEventListener('click', () => {
        if (chatInput.value.trim() !== '') {
            sendMessage();
        }
    });

    // Conversation click handler
    conversationsList.addEventListener('click', (e) => {
        const conversation = e.target.closest('.conversation');
        if (conversation) {
            const userId = conversation.dataset.userId;
            
            // Update active conversation
            document.querySelectorAll('.conversation').forEach(c => c.classList.remove('active'));
            conversation.classList.add('active');
            
            // Update chat header
            const userName = conversation.querySelector('h4').textContent;
            const chatHeader = document.querySelector('.chat-header .chat-user h3');
            if (chatHeader) {
                chatHeader.textContent = userName;
            }
            
            // Load messages
            loadMessages(userId);
        }
    });

    // Search functionality
    messagesSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const conversations = document.querySelectorAll('.conversation');
        
        conversations.forEach(conv => {
            const userName = conv.querySelector('h4').textContent.toLowerCase();
            const lastMessage = conv.querySelector('p').textContent.toLowerCase();
            
            if (userName.includes(searchTerm) || lastMessage.includes(searchTerm)) {
                conv.style.display = 'flex';
            } else {
                conv.style.display = 'none';
            }
        });
    });

    // Initial load
    loadConversations();
}

// Handle mobile responsiveness
function handleMobileLayout() {
    const screenWidth = window.innerWidth;
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const notificationsPanel = document.querySelector('.notifications-panel');
    
    if (screenWidth < 768) {
        sidebar.classList.add('mobile');
        mainContent.classList.add('mobile');
        if (notificationsPanel) {
            notificationsPanel.classList.add('minimized');
        }
    } else {
        sidebar.classList.remove('mobile');
        mainContent.classList.remove('mobile');
    }
}

// Setup mobile navigation
function setupMobileNavigation() {
    // Add mobile navigation functionality if needed
}

// Setup all form submissions
function setupFormSubmissions() {
    // Profile form
    const profileForm = document.querySelector('.profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showLoader();
            
            // Simulate API call
            setTimeout(() => {
                hideLoader();
                alert('Profile updated successfully!');
            }, 1000);
        });
    }
    
    // Support form
    const supportForm = document.querySelector('.support-form');
    if (supportForm) {
        supportForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showLoader();
            
            // Simulate API call
            setTimeout(() => {
                hideLoader();
                alert('Support ticket submitted successfully!');
                supportForm.reset();
            }, 1000);
        });
    }
}

// Utility functions
function showLoader() {
    const loader = document.querySelector('.loader');
    if (loader) loader.classList.remove('hidden');
}

function hideLoader() {
    const loader = document.querySelector('.loader');
    if (loader) loader.classList.add('hidden');
}

// Mark all notifications as read
function setupMarkAllReadButton() {
    const markAllReadBtn = document.querySelector('.mark-all-read');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            notifications = notifications.map(notification => ({
                ...notification,
                read: true
            }));
            updateNotifications();
            updateNotificationCount();
        });
    }
}

// Profile Management
async function loadProfileData() {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Please login to view profile');
        }

        const response = await fetch('http://localhost:5000/api/auth/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile data');
        }

        const userData = await response.json();
        
        // Set user's first name in navbar
        const userLoginElement = document.getElementById('user-login');
        if (userLoginElement) {
            userLoginElement.textContent = userData.firstName;
        }

        // Display profile data
        displayProfileData(userData);
    } catch (error) {
        console.error('Error loading profile:', error);
        alert(error.message);
    }
}

function displayProfileData(userData) {
    // Display basic profile details
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const addressInput = document.getElementById('address');
    const roleInput = document.getElementById('role');

    if (firstNameInput) firstNameInput.value = userData.firstName || '';
    if (lastNameInput) lastNameInput.value = userData.lastName || '';
    if (emailInput) emailInput.value = userData.email || '';
    if (phoneInput) phoneInput.value = userData.phone || '';
    if (addressInput) addressInput.value = userData.address || '';
    if (roleInput) roleInput.value = userData.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : '';
    
    // Set profile picture if available
    const profilePicture = document.getElementById('profilePicture');
    if (profilePicture && userData.photo) {
        profilePicture.src = userData.photo;
    }
    
    // Set KYC status
    const kycStatus = document.getElementById('kycStatus');
    if (kycStatus) {
        kycStatus.textContent = userData.kycStatus || 'Not Submitted';
        kycStatus.className = `status-badge ${userData.kycStatus?.toLowerCase().replace(' ', '-') || 'not-submitted'}`;
    }

    // Update profile stats
    const totalListings = document.getElementById('totalListings');
    const totalSales = document.getElementById('totalSales');
    const rating = document.getElementById('rating');

    if (totalListings) totalListings.textContent = userData.totalListings || '0';
    if (totalSales) totalSales.textContent = userData.totalSales || '₹0';
    if (rating) rating.textContent = userData.rating || '0';
}

// Handle profile form submission
function setupProfileForm() {
    const profileForm = document.querySelector('.profile-form');
    if (!profileForm) return;

    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const loader = document.querySelector('.loader');
        if (loader) loader.classList.remove('hidden');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Please login to update profile');
            }

            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const phone = document.getElementById('phone').value.trim();
            const address = document.getElementById('address').value.trim();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;

            // Debug log the form data
            console.log('Profile form data:', {
                firstName,
                lastName,
                phone,
                address
            });

            // Validate password change if attempted
            if (newPassword || currentPassword || confirmPassword) {
                if (!currentPassword || !newPassword || !confirmPassword) {
                    throw new Error('Please fill all password fields');
                }
                if (newPassword !== confirmPassword) {
                    throw new Error('New passwords do not match');
                }
            }

            const requestData = {
                firstName,
                lastName,
                phone,
                address,
                currentPassword: currentPassword || undefined,
                newPassword: newPassword || undefined
            };

            // Debug log the request data
            console.log('Sending profile update request:', requestData);

            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Profile update error response:', errorData);
                throw new Error(errorData.msg || 'Failed to update profile');
            }

            const updatedUser = await response.json();
            
            // Debug log the response
            console.log('Profile update successful:', updatedUser);
            
            // Update the displayed data with the new values
            displayProfileData(updatedUser);
            
            // Update the navbar with the new first name
            const userLoginElement = document.getElementById('user-login');
            if (userLoginElement) {
                userLoginElement.textContent = updatedUser.firstName;
            }

            alert('Profile updated successfully!');
            
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            
        } catch (error) {
            console.error('Profile update error:', error);
            alert(error.message);
        } finally {
            if (loader) loader.classList.add('hidden');
        }
    });
}

// Handle profile picture change
function setupProfilePictureChange() {
    const changePhotoBtn = document.querySelector('.change-photo-btn');
    const profilePicture = document.getElementById('profilePicture');
    
    if (!changePhotoBtn || !profilePicture) return;

    changePhotoBtn.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Please login to update profile picture');
                }

                const formData = new FormData();
                formData.append('photo', file);

                const response = await fetch('http://localhost:5000/api/auth/profile/photo', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Failed to update profile picture');
                }

                const data = await response.json();
                profilePicture.src = data.photoUrl;
                alert('Profile picture updated successfully!');
            } catch (error) {
                console.error('Error:', error);
                alert(error.message);
            }
        };

        input.click();
    });
}

// Add event listener for status filter
function setupStatusFilter() {
    const statusFilter = document.getElementById('listingStatus');
    if (statusFilter) {
        statusFilter.addEventListener('change', () => {
            fetchListings();
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up logout handler first
    setupLogoutHandler();
    
    // Load profile data first to ensure user info is displayed
    loadProfileData();
    
    // Populate activity list
    populateActivityList();
    
    // Update notifications
    updateNotifications();
    
    // Initialize charts
    initializeEarningsChart();
    initializeAnalyticsCharts();
    
    // Set up mobile navigation
    setupMobileNavigation();
    
    // Set up form handlers
    setupFormHandlers();
    
    // Set up Mark All Read button
    setupMarkAllReadButton();
    
    // Set up accordion for FAQs
    setupAccordion();
    
    // Set up chat functionality
    setupChatFunctionality();
    
    // Handle mobile layout
    handleMobileLayout();
    window.addEventListener('resize', handleMobileLayout);
    
    // Set up form submissions
    setupFormSubmissions();

    // Fetch and display listings
    fetchListings();
    
    // Set up profile form
    setupProfileForm();
    
    // Set up profile picture change
    setupProfilePictureChange();

    // Set up status filter
    setupStatusFilter();
});

// Set up resize event listener for responsive adjustments
window.addEventListener('resize', () => {
    handleMobileLayout();
});

// Add this new function to load pending orders
async function loadPendingOrders() {
    console.log("Loading pending orders...");
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        const ordersContainer = document.querySelector('.orders-list');
        if (!ordersContainer) {
            console.error('Orders container not found');
            return;
        }

        // Show loading spinner
        ordersContainer.innerHTML = `
            <div class="orders-loading">
                <div class="loading-spinner"></div>
            </div>
        `;

        const response = await fetch(`http://localhost:5000/api/listings/my?t=${Date.now()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        if (response.ok) {
            const listings = await response.json();
            console.log('Fetched all listings for pending orders:', listings);

            // Filter only pending listings
            const pendingOrders = listings.filter(listing => listing.status === 'pending');
            console.log('Filtered pending orders:', pendingOrders);

            if (pendingOrders.length === 0) {
                ordersContainer.innerHTML = `
                    <div class="no-orders">
                        <i class="fas fa-box-open"></i>
                        <p>No pending orders at the moment</p>
                    </div>
                `;
                return;
            }

            // Sort orders by pickup date
            pendingOrders.sort((a, b) => {
                const dateA = a.pickupDetails ? new Date(a.pickupDetails.pickupDate) : new Date(0);
                const dateB = b.pickupDetails ? new Date(b.pickupDetails.pickupDate) : new Date(0);
                return dateA - dateB;
            });

            ordersContainer.innerHTML = pendingOrders.map(order => {
                const pickupDate = order.pickupDetails ? new Date(order.pickupDetails.pickupDate).toLocaleDateString() : 'Not set';
                const pickupTime = order.pickupDetails?.pickupTime || 'Not set';
                
                return `
                    <div class="order-card">
                        <div class="order-header">
                            <h3>${order.title || `${order.category.toUpperCase()} Scrap`}</h3>
                            <span class="status pending">Pending Pickup</span>
                        </div>
                        <div class="order-details">
                            <div class="detail-row">
                                <span class="label">Pickup Date:</span>
                                <span class="value">${pickupDate}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Pickup Time:</span>
                                <span class="value">${pickupTime}</span>
                            </div>
                            ${order.pickupDetails?.collectorName ? `
                                <div class="detail-row">
                                    <span class="label">Collector:</span>
                                    <span class="value">${order.pickupDetails.collectorName}</span>
                                </div>
                            ` : ''}
                            ${order.pickupDetails?.phoneNumber ? `
                                <div class="detail-row">
                                    <span class="label">Phone:</span>
                                    <span class="value">${order.pickupDetails.phoneNumber}</span>
                                </div>
                            ` : ''}
                            <div class="detail-row">
                                <span class="label">Category:</span>
                                <span class="value">${order.category.toUpperCase()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Quantity:</span>
                                <span class="value">${order.quantity} kg</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Price:</span>
                                <span class="value">₹${order.price}</span>
                            </div>
                        </div>
                        <div class="order-actions">
                            <button class="order-btn contact-btn" onclick="contactCollector('${order._id}')">
                                <i class="fas fa-phone-alt"></i> Contact Collector
                            </button>
                            <button class="order-btn reject-btn" onclick="cancelOrder('${order._id}')">
                                <i class="fas fa-times"></i> Cancel Order
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            // Add contact and cancel order functions
            window.contactCollector = function(orderId) {
                // Implement contact collector functionality
                console.log('Contacting collector for order:', orderId);
                alert('Opening chat with collector...');
            };

            window.cancelOrder = function(orderId) {
                if (confirm('Are you sure you want to cancel this order?')) {
                    console.log('Cancelling order:', orderId);
                    // Implement order cancellation logic here
                    alert('Order cancelled successfully!');
                    loadPendingOrders(); // Refresh the orders list
                }
            };

        } else {
            throw new Error('Failed to fetch orders');
        }
    } catch (error) {
        console.error('Error loading pending orders:', error);
        const ordersContainer = document.querySelector('.orders-list');
        if (ordersContainer) {
            ordersContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load pending orders. Please try again.</p>
                </div>
            `;
        }
    }
}

async function loadCompletedOrders() {
    console.log("Loading completed orders...");
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        const ordersContainer = document.querySelector('.orders-list');
        if (!ordersContainer) {
            console.error('Orders container not found');
            return;
        }

        // Show loading spinner
        ordersContainer.innerHTML = `
            <div class="orders-loading">
                <div class="loading-spinner"></div>
            </div>
        `;

        const response = await fetch(`http://localhost:5000/api/listings/my?t=${Date.now()}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        });

        if (response.ok) {
            const listings = await response.json();
            console.log('Fetched all listings for completed orders:', listings);

            // Filter only completed listings
            const completedOrders = listings.filter(listing => listing.status === 'completed');
            console.log('Filtered completed orders:', completedOrders);

            if (completedOrders.length === 0) {
                ordersContainer.innerHTML = `
                    <div class="no-orders">
                        <i class="fas fa-check-circle"></i>
                        <p>No completed orders yet</p>
                    </div>
                `;
                return;
            }

            // Sort orders by completion date (newest first)
            completedOrders.sort((a, b) => {
                const dateA = a.completedAt ? new Date(a.completedAt) : new Date(0);
                const dateB = b.completedAt ? new Date(b.completedAt) : new Date(0);
                return dateB - dateA;
            });

            ordersContainer.innerHTML = completedOrders.map(order => {
                const completedDate = order.completedAt ? new Date(order.completedAt).toLocaleDateString() : 'Unknown';
                const pickupDate = order.pickupDetails ? new Date(order.pickupDetails.pickupDate).toLocaleDateString() : 'Not recorded';
                
                return `
                    <div class="order-card">
                        <div class="order-header">
                            <h3>${order.title || `${order.category.toUpperCase()} Scrap`}</h3>
                            <span class="status completed">Completed</span>
                        </div>
                        <div class="order-details">
                            <div class="detail-row">
                                <span class="label">Completed On:</span>
                                <span class="value">${completedDate}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Pickup Date:</span>
                                <span class="value">${pickupDate}</span>
                            </div>
                            ${order.pickupDetails?.collectorName ? `
                                <div class="detail-row">
                                    <span class="label">Collector:</span>
                                    <span class="value">${order.pickupDetails.collectorName}</span>
                                </div>
                            ` : ''}
                            <div class="detail-row">
                                <span class="label">Category:</span>
                                <span class="value">${order.category.toUpperCase()}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Quantity:</span>
                                <span class="value">${order.quantity} kg</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Price:</span>
                                <span class="value">₹${order.price}</span>
                            </div>
                        </div>
                        <div class="order-actions">
                            <button class="order-btn review-btn" onclick="reviewOrder('${order._id}')">
                                <i class="fas fa-star"></i> Write Review
                            </button>
                        </div>
                    </div>
                `;
            }).join('');

            // Add review function
            window.reviewOrder = function(orderId) {
                console.log('Opening review form for order:', orderId);
                alert('Review feature coming soon!');
            };

        } else {
            throw new Error('Failed to fetch orders');
        }
    } catch (error) {
        console.error('Error loading completed orders:', error);
        const ordersContainer = document.querySelector('.orders-list');
        if (ordersContainer) {
            ordersContainer.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <p>Failed to load completed orders. Please try again.</p>
                </div>
            `;
        }
    }
}