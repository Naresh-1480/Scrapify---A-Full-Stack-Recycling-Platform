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
                
                // Convert photo to base64
                const photoBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onload = (e) => resolve(e.target.result);
                    reader.readAsDataURL(photoFile);
                });
                
                const data = {
                    category: formData.get('category'),
                    title: formData.get('title'),
                    description: formData.get('description'),
                    quantity: parseFloat(formData.get('quantity')),
                    location: formData.get('location'),
                    photo: photoBase64,
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
                    photoPreview.style.display = 'none';
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
                        <div class="listing-image">
                            <img src="${listing.photo}" alt="${listing.title}">
                        </div>
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
                            <option value="electronics" ${listing.category === 'electronics' ? 'selected' : ''}>Electronic Waste</option>
                            <option value="glass" ${listing.category === 'glass' ? 'selected' : ''}>Glass</option>
                            <option value="other" ${listing.category === 'other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="editTitle">Title</label>
                        <input type="text" id="editTitle" name="title" value="${listing.title}" required>
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
                        <label for="editLocation">Location</label>
                        <input type="text" id="editLocation" name="location" value="${listing.location}" required>
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
                title: formData.get('title'),
                description: formData.get('description'),
                quantity: parseFloat(formData.get('quantity')),
                location: formData.get('location'),
                photo: photoBase64
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
        displayProfileData(userData);
    } catch (error) {
        console.error('Error loading profile:', error);
        alert(error.message);
    }
}

function displayProfileData(userData) {
    // Display basic profile details
    document.getElementById('fullName').value = `${userData.firstName} ${userData.lastName}`;
    document.getElementById('email').value = userData.email;
    document.getElementById('phone').value = userData.phone || '';
    document.getElementById('address').value = userData.address || '';
    document.getElementById('role').value = userData.role.charAt(0).toUpperCase() + userData.role.slice(1);
    
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
    document.getElementById('totalListings').textContent = userData.totalListings || '0';
    document.getElementById('totalSales').textContent = userData.totalSales || '₹0';
    document.getElementById('rating').textContent = userData.rating || '0';
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

            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;

            // Validate password change if attempted
            if (newPassword || currentPassword || confirmPassword) {
                if (!currentPassword || !newPassword || !confirmPassword) {
                    throw new Error('Please fill all password fields');
                }
                if (newPassword !== confirmPassword) {
                    throw new Error('New passwords do not match');
                }
            }

            const response = await fetch('http://localhost:5000/api/auth/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    phone,
                    address,
                    currentPassword,
                    newPassword
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.msg || 'Failed to update profile');
            }

            alert('Profile updated successfully!');
            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
            // Reload profile data
            loadProfileData();
        } catch (error) {
            console.error('Error:', error);
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

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Set up logout handler first
    setupLogoutHandler();
    
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

    // Load profile data
    loadProfileData();
    
    // Set up profile form
    setupProfileForm();
    
    // Set up profile picture change
    setupProfilePictureChange();
});

// Set up resize event listener for responsive adjustments
window.addEventListener('resize', () => {
    handleMobileLayout();
});