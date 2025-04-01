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

        // Set up form handler if we're on the sell page
        if (page === 'sell') {
            setTimeout(() => {
                setupFormHandlers();
            }, 0);
        }
        
        // Fetch listings if we're on the listings page
        if (page === 'listings') {
            setTimeout(() => {
                fetchListings();
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
            if (confirm('Are you sure you want to logout?')) {
                // Add logout logic here
                window.location.href = 'index.html';
            }
        });
    }
}

// Form Submission Handler (for Sell Scrap form)
function setupFormHandlers() {
    console.log('Setting up form handlers...');
    const sellForm = document.getElementById('sellScrapForm');
    console.log('Form element:', sellForm);
    
    if (sellForm) {
        sellForm.addEventListener('submit', async (e) => {
            console.log('Form submitted');
            e.preventDefault();
            const loader = document.querySelector('.loader');
            if (loader) loader.classList.remove('hidden');
            
            try {
                const formData = new FormData(sellForm);
                const data = {
                    category: formData.get('category'),
                    title: formData.get('title'),
                    description: formData.get('description'),
                    quantity: parseFloat(formData.get('quantity')),
                    location: formData.get('location'),
                    price: calculatePrice(formData.get('category'), parseFloat(formData.get('quantity')))
                };
                
                console.log('Form data:', data);
                
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
                    alert('Listing created successfully!');
                    sellForm.reset();
                    // Fetch updated listings
                    fetchListings();
                } else {
                    throw new Error(responseData.msg || 'Error creating listing. Please try again.');
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
        'electronics': 45,
        'glass': 8,
        'other': 10
    };
    
    return rates[category] * quantity;
}

// Fetch and display listings
async function fetchListings() {
    console.log("Fetching listings...");
    try {
        // Get the authentication token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
            console.error('No authentication token found');
            return;
        }

        const response = await fetch('http://localhost:5000/api/listings', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const listings = await response.json();
            const listingsContainer = document.querySelector('.listings-grid');
            
            if (listingsContainer) {
                // Clear existing content
                listingsContainer.innerHTML = '';
                
                if (listings.length === 0) {
                    listingsContainer.innerHTML = '<p class="no-listings">No listings found. Create a new listing to get started!</p>';
                    return;
                }

                // Create listing cards for each listing
                listings.forEach(listing => {
                    const listingElement = document.createElement('div');
                    listingElement.classList.add('listing-card');
                    listingElement.innerHTML = `
                        <h3>${listing.title}</h3>
                        <p>${listing.description}</p>
                        <div class="listing-details">
                            <span class="listing-category">Category: ${listing.category}</span>
                            <span class="listing-quantity">Quantity: ${listing.quantity} kg</span>
                        </div>
                        <p class="listing-location">Location: ${listing.location}</p>
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
        }
    } catch (error) {
        console.error('Error fetching listings:', error);
    }
}

// Add a function to handle the listing action buttons
function setupListingActionButtons() {
    // Edit button functionality 
    document.querySelectorAll('.edit-listing-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const listingId = e.target.getAttribute('data-id');
            // Implement edit functionality here
            console.log('Edit listing with ID:', listingId);
            alert('Edit functionality will be implemented soon.');
        });
    });
    
    // Delete button functionality
    document.querySelectorAll('.delete-listing-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const listingId = e.target.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this listing?')) {
                try {
                    const response = await fetch(`http://localhost:5000/api/listings/${listingId}`, {
                        method: 'DELETE'
                    });
                    
                    if (response.ok) {
                        alert('Listing deleted successfully!');
                        fetchListings(); // Refresh the listings
                    } else {
                        alert('Error deleting listing. Please try again.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error deleting listing. Please try again.');
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
    
    if (!chatInput || !sendBtn || !chatMessages) return;
    
    // Fix for the Enter key press event
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && chatInput.value.trim() !== '') {
            e.preventDefault(); // Prevent form submission
            sendMessage();
        }
    });
    
    // Fix for the send button click event
    sendBtn.addEventListener('click', () => {
        if (chatInput.value.trim() !== '') {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;
        
        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const timeString = now.toLocaleTimeString('en-IN', timeOptions);
        
        // Create and append the new message element
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'sent');
        messageElement.innerHTML = `
            <p>${message}</p>
            <span class="message-time">${timeString}</span>
        `;
        
        chatMessages.appendChild(messageElement);
        
        // Auto-scroll to the bottom of the chat
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Clear the input field
        chatInput.value = '';
        
        // Focus the input field for the next message
        chatInput.focus();
        
        // Simulate a response (for demo purposes)
        setTimeout(() => {
            const responseElement = document.createElement('div');
            responseElement.classList.add('message', 'received');
            responseElement.innerHTML = `
                <p>Thanks for your message. I'll get back to you soon.</p>
                <span class="message-time">${timeString}</span>
            `;
            chatMessages.appendChild(responseElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1500);
    }
    
    // Add functionality to conversation list items
    const conversations = document.querySelectorAll('.conversation');
    conversations.forEach(conversation => {
        conversation.addEventListener('click', () => {
            // Update active conversation
            conversations.forEach(c => c.classList.remove('active'));
            conversation.classList.add('active');
            
            // Update chat header with selected conversation user info
            const userName = conversation.querySelector('h4').textContent;
            const chatHeader = document.querySelector('.chat-header .chat-user h3');
            if (chatHeader) {
                chatHeader.textContent = userName;
            }
            
            // Clear unread count
            const unreadCount = conversation.querySelector('.unread-count');
            if (unreadCount) {
                unreadCount.remove();
            }
        });
    });
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Populate activity list
    populateActivityList();
    
    // Update notifications
    updateNotifications();
    
    // Initialize charts
    initializeEarningsChart();
    initializeAnalyticsCharts();
    
    // Set up mobile navigation
    setupMobileNavigation();
    
    // Set up logout handler
    setupLogoutHandler();
    
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
});

// Set up resize event listener for responsive adjustments
window.addEventListener('resize', () => {
    handleMobileLayout();
});