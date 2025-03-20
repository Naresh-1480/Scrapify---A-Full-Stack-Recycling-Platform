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
        sections.forEach(section => {
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
const ctx = document.getElementById('earningsChart').getContext('2d');
const earningsChart = new Chart(ctx, {
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

const activityList = document.querySelector('.activity-list');

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

// Notifications
let notifications = [
    { id: 1, message: 'New order request received', read: false },
    { id: 2, message: 'Payment confirmed for Order #123', read: false },
    { id: 3, message: 'Your listing was approved', read: true }
];

function updateNotifications() {
    const notificationsList = document.querySelector('.notifications-list');
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

document.querySelector('.mark-all-read').addEventListener('click', () => {
    notifications = notifications.map(n => ({ ...n, read: true }));
    updateNotifications();
});

// Mobile Navigation Toggle
const mobileMenuBtn = document.createElement('button');
mobileMenuBtn.classList.add('mobile-menu-btn');
mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
document.querySelector('.top-bar').prepend(mobileMenuBtn);

mobileMenuBtn.addEventListener('click', () => {
    document.querySelector('.sidebar').classList.toggle('active');
});

// Logout Handler
document.querySelector('.logout-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        // Add logout logic here
        window.location.href = 'index.html';
    }
});

// Form Submission Handler (for Sell Scrap form)
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

// Create missing sections for dashboard tabs
function createMissingSections() {
    const mainContent = document.querySelector('.main-content');
    const existingSections = Array.from(document.querySelectorAll('.dashboard-section')).map(s => s.id);
    const requiredSections = ['sell', 'listings', 'orders', 'messages', 'analytics', 'profile', 'help'];
    
    requiredSections.forEach(section => {
        if (!existingSections.includes(section)) {
            const newSection = document.createElement('section');
            newSection.id = section;
            newSection.classList.add('dashboard-section');
            
            newSection.innerHTML = `
                <h1>${section.charAt(0).toUpperCase() + section.slice(1)}</h1>
                <div class="section-content">
                    <p>This is the ${section} section. Content is coming soon.</p>
                </div>
            `;
            
            mainContent.appendChild(newSection);
        }
    });
}

// Initialize Dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Create top bar if missing
    if (!document.querySelector('.top-bar')) {
        const topBar = document.createElement('div');
        topBar.classList.add('top-bar');
        
        topBar.innerHTML = `
            <div class="date-time">
                <div id="current-date"></div>
                <div id="current-time"></div>
            </div>
        `;
        
        document.querySelector('.dashboard-container').prepend(topBar);
    }
    
    // Create missing sections for navigation
    createMissingSections();
    
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update time every minute
    updateNotifications();
    
    // Show loader
    const loader = document.querySelector('.loader');
    loader.classList.remove('hidden');
    
    // Simulate loading data
    setTimeout(() => {
        loader.classList.add('hidden');
    }, 1000);
});

// Window Resize Handler
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        document.querySelector('.sidebar').classList.remove('active');
    }
});

// Error Handler
window.addEventListener('error', (e) => {
    console.error('An error occurred:', e.error);
    // You could add error reporting service here
});