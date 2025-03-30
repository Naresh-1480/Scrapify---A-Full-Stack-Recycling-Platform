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
    });
});

// Add Toggle for Notifications Panel
const notificationsPanelToggle = document.createElement('button');
notificationsPanelToggle.classList.add('notifications-toggle');
notificationsPanelToggle.innerHTML = '<i class="fas fa-bell"></i>';
document.querySelector('.top-bar').appendChild(notificationsPanelToggle);

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

// Earnings Chart
function initializeEarningsChart() {
    const ctx = document.getElementById('earningsChart');
    if (ctx) {
        const earningsChart = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Monthly Earnings (₹)',
                    data: [3000, 4500, 3800, 5200, 4800, 6000],
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
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
                            display: true,
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

// Date and Time Update Function
function updateDateTime() {
    const dateElement = document.getElementById('current-date');
    const timeElement = document.getElementById('current-time');
    
    if (dateElement && timeElement) {
        const now = new Date();
        const dateOptions = { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' };
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        
        dateElement.textContent = now.toLocaleDateString('en-IN', dateOptions);
        timeElement.textContent = now.toLocaleTimeString('en-IN', timeOptions);
    }
}

// Activity List Population
const activities = [
    { type: 'sale', message: 'New order received for Electronic Waste', time: '5 minutes ago' },
    { type: 'message', message: 'New message from buyer regarding Metal Scrap', time: '1 hour ago' },
    { type: 'listing', message: 'Your listing "Used Batteries" was approved', time: '2 hours ago' },
    { type: 'payment', message: 'Payment received for Paper Waste order', time: '1 day ago' }
];

function populateActivityList() {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    // Clear existing items
    activityList.innerHTML = '';
    
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.classList.add('activity-item');
        
        let icon;
        switch(activity.type) {
            case 'sale': icon = 'fa-shopping-cart'; break;
            case 'message': icon = 'fa-comment'; break;
            case 'listing': icon = 'fa-list'; break;
            case 'payment': icon = 'fa-money-bill'; break;
        }

        activityItem.innerHTML = `
            <i class="fas ${icon}"></i>
            <div class="activity-content">
                <p>${activity.message}</p>
                <small>${activity.time}</small>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

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
    
    // Add event listeners for read buttons
    document.querySelectorAll('.read-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = parseInt(btn.dataset.id);
            markNotificationAsRead(id);
        });
    });
}

function markNotificationAsRead(id) {
    notifications = notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
    );
    updateNotifications();
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
    const sellForm = document.getElementById('sellScrapForm');
    if (sellForm) {
        sellForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const loader = document.querySelector('.loader');
            loader.classList.remove('hidden');
            
            try {
                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));
                alert('Listing created successfully!');
                sellForm.reset();
            } catch (error) {
                alert('Error creating listing. Please try again.');
            } finally {
                loader.classList.add('hidden');
            }
        });
    }
}

// Create missing sections for dashboard tabs
function createDashboardSections() {
    const mainContent = document.querySelector('.main-content');
    if (!mainContent) return;
    
    const existingSections = Array.from(document.querySelectorAll('.dashboard-section')).map(s => s.id);
    const requiredSections = ['overview', 'sell', 'listings', 'orders', 'messages', 'analytics', 'profile', 'help'];
    
    requiredSections.forEach(section => {
        if (!existingSections.includes(section)) {
            const newSection = document.createElement('section');
            newSection.id = section;
            newSection.classList.add('dashboard-section');
            
            let sectionContent = '';
            
            // Create specialized content for each section
            switch(section) {
                case 'sell':
                    sectionContent = `
                        <h1>Sell Scrap</h1>
                        <div class="section-content">
                            <form id="sellScrapForm" class="form-container">
                                <div class="form-group">
                                    <label for="scrapCategory">Scrap Category</label>
                                    <select id="scrapCategory" required>
                                        <option value="">Select Category</option>
                                        <option value="paper">Paper Waste</option>
                                        <option value="plastic">Plastic</option>
                                        <option value="metal">Metal Scrap</option>
                                        <option value="electronics">Electronic Waste</option>
                                        <option value="glass">Glass</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="scrapTitle">Title</label>
                                    <input type="text" id="scrapTitle" placeholder="Enter a descriptive title" required>
                                </div>
                                <div class="form-group">
                                    <label for="scrapDescription">Description</label>
                                    <textarea id="scrapDescription" placeholder="Describe your scrap in detail" rows="4" required></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="scrapQuantity">Quantity (kg)</label>
                                    <input type="number" id="scrapQuantity" placeholder="Enter quantity" min="1" required>
                                </div>
                                <div class="form-group">
                                    <label for="scrapPrice">Price (₹ per kg)</label>
                                    <input type="number" id="scrapPrice" placeholder="Enter price" min="1" required>
                                </div>
                                <div class="form-group">
                                    <label for="scrapPhotos">Upload Photos</label>
                                    <input type="file" id="scrapPhotos" multiple accept="image/*">
                                </div>
                                <div class="form-group">
                                    <label for="pickupLocation">Pickup Location</label>
                                    <input type="text" id="pickupLocation" placeholder="Enter your address" required>
                                </div>
                                <div class="form-actions">
                                    <button type="reset" class="secondary-btn">Cancel</button>
                                    <button type="submit" class="primary-btn">Create Listing</button>
                                </div>
                            </form>
                        </div>
                    `;
                    break;
                case 'listings':
                    sectionContent = `
                        <h1>Manage Listings</h1>
                        <div class="section-content">
                            <div class="listings-controls">
                                <button class="primary-btn">Add New Listing</button>
                                <div class="listings-filter">
                                    <label for="listingStatus">Filter by:</label>
                                    <select id="listingStatus">
                                        <option value="all">All Listings</option>
                                        <option value="active">Active</option>
                                        <option value="sold">Sold</option>
                                        <option value="review">In Review</option>
                                    </select>
                                </div>
                            </div>
                            <div class="listings-grid">
                                <div class="listing-card">
                                    <div class="listing-image">
                                        <div class="listing-status active">Active</div>
                                        <img src="/api/placeholder/300/200" alt="Paper Waste">
                                    </div>
                                    <div class="listing-details">
                                        <h3>Paper Waste - 50kg</h3>
                                        <p class="listing-price">₹12/kg</p>
                                        <p class="listing-date">Listed on: Mar 15, 2025</p>
                                        <div class="listing-actions">
                                            <button class="edit-btn">Edit</button>
                                            <button class="delete-btn">Delete</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="listing-card">
                                    <div class="listing-image">
                                        <div class="listing-status sold">Sold</div>
                                        <img src="/api/placeholder/300/200" alt="Metal Scrap">
                                    </div>
                                    <div class="listing-details">
                                        <h3>Metal Scrap - 30kg</h3>
                                        <p class="listing-price">₹35/kg</p>
                                        <p class="listing-date">Listed on: Mar 10, 2025</p>
                                        <div class="listing-actions">
                                            <button class="view-btn">View Details</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="listing-card">
                                    <div class="listing-image">
                                        <div class="listing-status review">In Review</div>
                                        <img src="/api/placeholder/300/200" alt="Electronic Waste">
                                    </div>
                                    <div class="listing-details">
                                        <h3>Electronic Waste - 15kg</h3>
                                        <p class="listing-price">₹45/kg</p>
                                        <p class="listing-date">Listed on: Mar 20, 2025</p>
                                        <div class="listing-actions">
                                            <button class="edit-btn">Edit</button>
                                            <button class="delete-btn">Delete</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                case 'orders':
                    sectionContent = `
                        <h1>Orders & Transactions</h1>
                        <div class="section-content">
                            <div class="tabs-container">
                                <div class="tabs">
                                    <button class="tab-btn active" data-tab="pending">Pending (3)</button>
                                    <button class="tab-btn" data-tab="approved">Approved (2)</button>
                                    <button class="tab-btn" data-tab="rejected">Rejected (1)</button>
                                    <button class="tab-btn" data-tab="completed">Completed (8)</button>
                                </div>
                                <div class="tab-content active" id="pending">
                                    <div class="orders-list">
                                        <div class="order-card">
                                            <div class="order-header">
                                                <div class="order-id">Order #12345</div>
                                                <div class="order-date">March 25, 2025</div>
                                            </div>
                                            <div class="order-details">
                                                <div class="order-info">
                                                    <p><strong>Buyer:</strong> Prakash Singh</p>
                                                    <p><strong>Item:</strong> Paper Waste (50kg)</p>
                                                    <p><strong>Total:</strong> ₹600</p>
                                                </div>
                                                <div class="order-actions">
                                                    <button class="primary-btn">Accept</button>
                                                    <button class="secondary-btn">Reject</button>
                                                </div>
                                            </div>
                                        </div>
                                        <!-- More order cards would go here -->
                                    </div>
                                </div>
                                <div class="tab-content" id="approved">
                                    <p>Content for approved orders</p>
                                </div>
                                <div class="tab-content" id="rejected">
                                    <p>Content for rejected orders</p>
                                </div>
                                <div class="tab-content" id="completed">
                                    <p>Content for completed orders</p>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                case 'messages':
                    sectionContent = `
                        <h1>Messages</h1>
                        <div class="section-content">
                            <div class="messages-container">
                                <div class="messages-sidebar">
                                    <div class="messages-search">
                                        <input type="text" placeholder="Search messages...">
                                    </div>
                                    <div class="conversation-list">
                                        <div class="conversation active">
                                            <img src="/api/placeholder/40/40" alt="User" class="user-avatar">
                                            <div class="conversation-preview">
                                                <h4>Prakash Singh</h4>
                                                <p>Is the electronic waste still available?</p>
                                            </div>
                                            <div class="conversation-meta">
                                                <span class="time">10:30 AM</span>
                                                <span class="unread-count">2</span>
                                            </div>
                                        </div>
                                        <div class="conversation">
                                            <img src="/api/placeholder/40/40" alt="User" class="user-avatar">
                                            <div class="conversation-preview">
                                                <h4>Amir Khan</h4>
                                                <p>I'll pick up the paper waste tomorrow</p>
                                            </div>
                                            <div class="conversation-meta">
                                                <span class="time">Yesterday</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="messages-content">
                                    <div class="chat-header">
                                        <div class="chat-user">
                                            <img src="/api/placeholder/40/40" alt="User" class="user-avatar">
                                            <div>
                                                <h3>Prakash Singh</h3>
                                                <span>Online</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="chat-messages">
                                        <div class="message received">
                                            <p>Hello, I'm interested in your electronic waste listing.</p>
                                            <span class="message-time">10:15 AM</span>
                                        </div>
                                        <div class="message sent">
                                            <p>Hi there! Yes, it's still available.</p>
                                            <span class="message-time">10:18 AM</span>
                                        </div>
                                        <div class="message received">
                                            <p>Is the electronic waste still available?</p>
                                            <span class="message-time">10:30 AM</span>
                                        </div>
                                    </div>
                                    <div class="chat-input">
                                        <input type="text" placeholder="Type a message...">
                                        <button class="send-btn"><i class="fas fa-paper-plane"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                case 'analytics':
                    sectionContent = `
                        <h1>Analytics & Reports</h1>
                        <div class="section-content">
                            <div class="analytics-cards">
                                <div class="analytics-card">
                                    <h3>Total Sales</h3>
                                    <p class="analytics-value">₹15,750</p>
                                    <div class="analytics-chart small-chart">
                                        <!-- Small chart placeholder -->
                                        <div style="height: 50px; background: linear-gradient(90deg, #f1f1f1 0%, #2ecc71 70%);"></div>
                                    </div>
                                </div>
                                <div class="analytics-card">
                                    <h3>Orders Completed</h3>
                                    <p class="analytics-value">14</p>
                                    <p class="analytics-trend positive">+3 from last month</p>
                                </div>
                                <div class="analytics-card">
                                    <h3>Top Selling Category</h3>
                                    <p class="analytics-value">Metal Scrap</p>
                                    <p class="analytics-trend">35% of total sales</p>
                                </div>
                            </div>
                            <div class="analytics-charts">
                                <div class="chart-container large">
                                    <h3>Monthly Revenue</h3>
                                    <canvas id="revenueChart" height="250"></canvas>
                                </div>
                                <div class="chart-container large">
                                    <h3>Sales by Category</h3>
                                    <canvas id="categoryChart" height="250"></canvas>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                case 'profile':
                    sectionContent = `
                        <h1>Profile & Settings</h1>
                        <div class="section-content">
                            <div class="profile-container">
                                <div class="profile-sidebar">
                                    <div class="profile-photo">
                                        <img src="/api/placeholder/150/150" alt="Profile Photo">
                                        <button class="change-photo-btn"><i class="fas fa-camera"></i></button>
                                    </div>
                                    <div class="profile-stats">
                                        <div class="stat">
                                            <span class="stat-value">24</span>
                                            <span class="stat-label">Listings</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-value">14</span>
                                            <span class="stat-label">Sold</span>
                                        </div>
                                        <div class="stat">
                                            <span class="stat-value">4.8</span>
                                            <span class="stat-label">Rating</span>
                                        </div>
                                    </div>
                                </div>
                                <div class="profile-content">
                                    <form class="profile-form">
                                        <div class="form-section">
                                            <h3>Personal Information</h3>
                                            <div class="form-group">
                                                <label for="fullName">Full Name</label>
                                                <input type="text" id="fullName" value="Naresh Kumar">
                                            </div>
                                            <div class="form-group">
                                                <label for="phone">Phone Number</label>
                                                <input type="tel" id="phone" value="+91 98765 43210">
                                            </div>
                                            <div class="form-group">
                                                <label for="email">Email</label>
                                                <input type="email" id="email" value="naresh@example.com">
                                            </div>
                                        </div>
                                        <div class="form-section">
                                            <h3>Address</h3>
                                            <div class="form-group">
                                                <label for="address">Street Address</label>
                                                <input type="text" id="address" value="123 Main Street">
                                            </div>
                                            <div class="form-group">
                                                <label for="city">City</label>
                                                <input type="text" id="city" value="Mumbai">
                                            </div>
                                            <div class="form-group">
                                                <label for="state">State</label>
                                                <input type="text" id="state" value="Maharashtra">
                                            </div>
                                            <div class="form-group">
                                                <label for="pincode">Pincode</label>
                                                <input type="text" id="pincode" value="400001">
                                            </div>
                                        </div>
                                        <div class="form-section">
                                            <h3>Payment Information</h3>
                                            <div class="form-group">
                                                <label for="accountName">Account Holder Name</label>
                                                <input type="text" id="accountName" value="Naresh Kumar">
                                            </div>
                                            <div class="form-group">
                                                <label for="accountNumber">Account Number</label>
                                                <input type="text" id="accountNumber" value="XXXX XXXX 1234">
                                            </div>
                                            <div class="form-group">
                                                <label for="bankName">Bank Name</label>
                                                <input type="text" id="bankName" value="State Bank of India">
                                            </div>
                                            <div class="form-group">
                                                <label for="ifsc">IFSC Code</label>
                                                <input type="text" id="ifsc" value="SBIN0001234">
                                            </div>
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="primary-btn">Save Changes</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                case 'help':
                    sectionContent = `
                        <h1>Help & Support</h1>
                        <div class="section-content">
                            <div class="help-container">
                                <div class="faq-section">
                                    <h2>Frequently Asked Questions</h2>
                                    <div class="accordion">
                                        <div class="accordion-item">
                                            <div class="accordion-header">
                                                How do I create a new listing?
                                                <i class="fas fa-chevron-down"></i>
                                            </div>
                                            <div class="accordion-content">
                                                <p>To create a new listing, go to the "Sell Scrap" section from the sidebar menu. Fill in all the required details about your scrap item including category, quantity, price, and photos. Once submitted, your listing will be reviewed by our team before it goes live.</p>
                                            </div>
                                        </div>
                                        <div class="accordion-item">
                                            <div class="accordion-header">
                                                How do I get paid for my sales?
                                                <i class="fas fa-chevron-down"></i>
                                            </div>
                                            <div class="accordion-content">
                                                <p>Payment is processed within 3-5 business days after the scrap has been successfully picked up and verified by the buyer. The amount will be transferred to the bank account you've provided in your profile settings.</p>
                                            </div>
                                        </div>
                                        <div class="accordion-item">
                                            <div class="accordion-header">
                                                What if the buyer doesn't show up?
                                                <i class="fas fa-chevron-down"></i>
                                            </div>
                                            <div class="accordion-content">
                                                <p>If a buyer doesn't show up at the agreed time, you can mark the order as "Buyer No-Show" in the order details. After 24 hours, the order will be automatically canceled and your scrap will be relisted for sale.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="contact-support">
                                    <h2>Contact Support</h2>
                                    <form class="support-form">
                                        <div class="form-group">
                                            <label for="issueType">Issue Type</label>
                                            <select id="issueType" required>
                                                <option value="">Select Issue Type</option>
                                                <option value="account">Account Related</option>
                                                <option value="payment">Payment Related</option>
                                                <option value="listing">Listing Related</option>
                                                <option value="order">Order Related</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                        <div class="form-group">
                                            <label for="issueDescription">Describe Your Issue</label>
                                            <textarea id="issueDescription" rows="5" placeholder="Please provide details about your issue..." required></textarea>
                                        </div>
                                        <div class="form-actions">
                                            <button type="submit" class="primary-btn">Submit Ticket</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                default:
                    sectionContent = `
                        <h1>${section.charAt(0).toUpperCase() + section.slice(1)}</h1>
                        <div class="section-content">
                            <p>This is the ${section} section. Content is coming soon.</p>
                        </div>
                    `;
            }
            
            newSection.innerHTML = sectionContent;
            mainContent.appendChild(newSection);
        }
    });
    
    // Set up tab navigation in the Orders section
    setupOrdersTabs();
    
    // Initialize any charts that are needed
    if (document.getElementById('revenueChart')) {
        // Initialize revenue chart
    }
    
    if (document.getElementById('categoryChart')) {
        // Initialize category chart
    }
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

// Initialize additional charts for the Analytics section
function initializeAnalyticsCharts() {
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
    
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;
        
        const now = new Date();
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const timeString = now.toLocaleTimeString('en-IN', timeOptions);
        
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', 'sent');
        messageElement.innerHTML = `
            <p>${message}</p>
            <span class="message-time">${timeString}</span>
        `;
        
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        chatInput.value = '';
    }
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
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create missing dashboard sections
    createDashboardSections();
    
    // Update date and time immediately and then every minute
    updateDateTime();
    setInterval(updateDateTime, 60000);
    
    // Populate activity list
    populateActivityList();
    
    // Update notifications
    updateNotifications();
    
    // Initialize earnings chart
    initializeEarningsChart();
    
    // Initialize analytics charts
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
});

// Set up resize event listener for responsive adjustments
window.addEventListener('resize', () => {
    handleMobileLayout();
});