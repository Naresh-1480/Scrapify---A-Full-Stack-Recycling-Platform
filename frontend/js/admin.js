document.addEventListener('DOMContentLoaded', function() {
    // Menu Item Click - updated to show/hide content sections
    const menuItems = document.querySelectorAll('.menu-item');
    
    // Create content sections for each menu item
    const contentSections = {
        'Dashboard': createDashboardContent(),
        'Manage Sellers': createSellerManagementContent(),
        'Manage Buyers': createBuyerManagementContent(),
        'Scrap Listings': createScrapListingsContent(),
        'Transactions': createTransactionsContent(),
        'Disputes': createDisputesContent(),
        'Reports & Analytics': createReportsContent(),
        'Settings': createSettingsContent()
    };
    
    // Add content sections to main content area
    const mainContent = document.querySelector('.main-content');
    const topBar = document.querySelector('.top-bar');
    const existingContent = document.querySelectorAll('.main-content > *:not(.top-bar)');
    
    // Store existing dashboard content
    const dashboardContent = document.createElement('div');
    dashboardContent.className = 'dashboard-content';
    existingContent.forEach(el => {
        dashboardContent.appendChild(el.cloneNode(true));
    });
    contentSections['Dashboard'] = dashboardContent;
    
    // Clear existing content except top bar
    existingContent.forEach(el => el.remove());
    
    // Add dashboard content initially
    mainContent.appendChild(contentSections['Dashboard']);
    
    // Set up menu click handlers
    menuItems.forEach(item => {
        item.addEventListener('click', function() {
            const sectionName = this.querySelector('span').textContent;
            
            // Don't do anything for logout
            if (sectionName === 'Logout') {
                alert('Logout functionality would go here');
                return;
            }
            
            // Update active menu item
            menuItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Clear main content except top bar
            const currentContent = document.querySelectorAll('.main-content > *:not(.top-bar)');
            currentContent.forEach(el => el.remove());
            
            // Add the selected section content
            if (contentSections[sectionName]) {
                mainContent.appendChild(contentSections[sectionName]);
                
                // Initialize any action buttons in the newly added content
                initializeActionButtons();
            }
        });
    });

    // Initialize action buttons for the initial dashboard
    initializeActionButtons();
    
    // Function to initialize action buttons
    function initializeActionButtons() {
        const approveBtns = document.querySelectorAll('.approve-btn');
        const rejectBtns = document.querySelectorAll('.reject-btn');
        
        approveBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const statusCell = row.querySelector('.status');
                statusCell.textContent = 'Approved';
                statusCell.className = 'status approved';
                
                // Add to activity feed
                const id = row.querySelector('td:first-child').textContent;
                const title = row.querySelector('td:nth-child(2)').textContent;
                addActivity(`<strong>Listing Approved:</strong> ${id} - ${title}`, 'check-circle', 'secondary-color');
            });
        });
        
        rejectBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const row = this.closest('tr');
                const statusCell = row.querySelector('.status');
                statusCell.textContent = 'Rejected';
                statusCell.className = 'status rejected';
                
                // Add to activity feed
                const id = row.querySelector('td:first-child').textContent;
                const title = row.querySelector('td:nth-child(2)').textContent;
                addActivity(`<strong>Listing Rejected:</strong> ${id} - ${title}`, 'times-circle', 'error-color');
            });
        });
    }
    
    // Function to add activity to the feed
    function addActivity(message, icon, colorClass) {
        const activityFeeds = document.querySelectorAll('.activity-feed');
        if (activityFeeds.length === 0) return;
        
        const activityFeed = activityFeeds[0];
        const colorMap = {
            'primary-color': 'rgba(57, 9, 188, 0.2)',
            'secondary-color': 'rgba(39, 174, 96, 0.2)',
            'error-color': 'rgba(231, 76, 60, 0.2)',
            'warning-color': 'rgba(241, 196, 15, 0.2)'
        };
        
        const actualColor = {
            'primary-color': 'var(--primary-color)',
            'secondary-color': 'var(--secondary-color)',
            'error-color': 'var(--error-color)',
            'warning-color': 'var(--warning-color)'
        };
        
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        activityItem.innerHTML = `
            <div class="activity-icon" style="background-color: ${colorMap[colorClass]}; color: ${actualColor[colorClass]}">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="activity-details">
                <p class="activity-message">${message}</p>
                <p class="activity-time">Just now</p>
            </div>
        `;
        
        activityFeed.prepend(activityItem);
        
        // Remove oldest activity if more than 5
        if (activityFeed.children.length > 5) {
            activityFeed.removeChild(activityFeed.lastChild);
        }
        
        // Update notification count
        const badges = document.querySelectorAll('.notifications .badge');
        badges.forEach(badge => {
            badge.textContent = parseInt(badge.textContent) + 1;
        });
    }
});

// Content creation functions for each section
function createSellerManagementContent() {
    const container = document.createElement('div');
    container.className = 'section-content';
    
    container.innerHTML = `
        <h2 class="section-title">Manage Sellers</h2>
        <div class="table-card">
            <div class="table-header">
                <h3 class="table-title">Registered Sellers</h3>
                <div>
                    <button class="view-all"><i class="fas fa-plus"></i> Add New Seller</button>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Company</th>
                        <th>Contact Person</th>
                        <th>Email</th>
                        <th>Registration Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#SE001</td>
                        <td>MetalWorks Inc</td>
                        <td>John Anderson</td>
                        <td>j.anderson@metalworks.com</td>
                        <td>05 Jan 2025</td>
                        <td><span class="status approved">Active</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn reject-btn"><i class="fas fa-ban"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#SE002</td>
                        <td>TechRecycle</td>
                        <td>Sarah Johnson</td>
                        <td>sarah@techrecycle.com</td>
                        <td>12 Jan 2025</td>
                        <td><span class="status approved">Active</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn reject-btn"><i class="fas fa-ban"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#SE003</td>
                        <td>PowerSupply Co</td>
                        <td>Mike Thompson</td>
                        <td>mike.t@powersupply.com</td>
                        <td>18 Jan 2025</td>
                        <td><span class="status approved">Active</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn reject-btn"><i class="fas fa-ban"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#SE004</td>
                        <td>GreenRecycle</td>
                        <td>Lisa Chen</td>
                        <td>lisa@greenrecycle.com</td>
                        <td>25 Jan 2025</td>
                        <td><span class="status pending">Pending</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn reject-btn"><i class="fas fa-ban"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#SE005</td>
                        <td>Industrial Metals Ltd</td>
                        <td>Robert Wilson</td>
                        <td>rwilson@indmetals.com</td>
                        <td>30 Jan 2025</td>
                        <td><span class="status pending">Pending</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn reject-btn"><i class="fas fa-ban"></i></button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    return container;
}

function createBuyerManagementContent() {
    const container = document.createElement('div');
    container.className = 'section-content';
    
    container.innerHTML = `
        <h2 class="section-title">Manage Buyers</h2>
        <div class="table-card">
            <div class="table-header">
                <h3 class="table-title">Registered Buyers</h3>
                <div>
                    <button class="view-all"><i class="fas fa-plus"></i> Add New Buyer</button>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Company</th>
                        <th>Contact Person</th>
                        <th>Email</th>
                        <th>Registration Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#BU001</td>
                        <td>Manufacturing Plus</td>
                        <td>David Williams</td>
                        <td>david@manplus.com</td>
                        <td>02 Jan 2025</td>
                        <td><span class="status approved">Active</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn reject-btn"><i class="fas fa-ban"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#BU002</td>
                        <td>Construction Co</td>
                        <td>Jennifer Brown</td>
                        <td>jbrown@constructco.com</td>
                        <td>08 Jan 2025</td>
                        <td><span class="status approved">Active</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn reject-btn"><i class="fas fa-ban"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#BU003</td>
                        <td>Recycling Innovations</td>
                        <td>Alex Martinez</td>
                        <td>alex@recyclinnovations.com</td>
                        <td>15 Jan 2025</td>
                        <td><span class="status approved">Active</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn reject-btn"><i class="fas fa-ban"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#BU004</td>
                        <td>EcoMaterials</td>
                        <td>Karen Taylor</td>
                        <td>karen@ecomaterials.com</td>
                        <td>22 Jan 2025</td>
                        <td><span class="status pending">Pending</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn reject-btn"><i class="fas fa-ban"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#BU005</td>
                        <td>Global Reuse Ltd</td>
                        <td>Thomas Garcia</td>
                        <td>tgarcia@globalreuse.com</td>
                        <td>28 Jan 2025</td>
                        <td><span class="status pending">Pending</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn reject-btn"><i class="fas fa-ban"></i></button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    return container;
}

function createScrapListingsContent() {
    const container = document.createElement('div');
    container.className = 'section-content';
    
    container.innerHTML = `
        <h2 class="section-title">Scrap Listings</h2>
        <div class="filters" style="margin-bottom: 20px;">
            <button class="filter-btn active" data-filter="pending">Pending (18)</button>
            <button class="filter-btn" data-filter="active">Active (42)</button>
            <button class="filter-btn" data-filter="flagged">Flagged (3)</button>
        </div>
        <div class="table-card">
            <div class="table-header">
                <h3 class="table-title">Pending Scrap Listings</h3>
                <div>
                    <input type="text" placeholder="Search listings..." style="padding: 8px; border-radius: 4px; border: 1px solid #ddd; margin-right: 10px;">
                    <select style="padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
                        <option>All Categories</option>
                        <option>Metal</option>
                        <option>Electronics</option>
                        <option>Plastic</option>
                        <option>Paper</option>
                        <option>Other</option>
                    </select>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Seller</th>
                        <th>Category</th>
                        <th>Price</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#SL1028</td>
                        <td>Metal Scraps (Aluminum)</td>
                        <td>MetalWorks Inc</td>
                        <td>Metal</td>
                        <td>$250/ton</td>
                        <td>28 Mar 2025</td>
                        <td><span class="status pending">Pending</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn reject-btn"><i class="fas fa-times"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#SL1027</td>
                        <td>Electronic Waste Lot</td>
                        <td>TechRecycle</td>
                        <td>Electronics</td>
                        <td>$320/lot</td>
                        <td>27 Mar 2025</td>
                        <td><span class="status pending">Pending</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn reject-btn"><i class="fas fa-times"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#SL1026</td>
                        <td>Used Copper Wiring</td>
                        <td>PowerSupply Co</td>
                        <td>Metal</td>
                        <td>$425/ton</td>
                        <td>26 Mar 2025</td>
                        <td><span class="status pending">Pending</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn reject-btn"><i class="fas fa-times"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#SL1025</td>
                        <td>Plastic Scrap Bundle</td>
                        <td>GreenRecycle</td>
                        <td>Plastic</td>
                        <td>$180/ton</td>
                        <td>25 Mar 2025</td>
                        <td><span class="status pending">Pending</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn reject-btn"><i class="fas fa-times"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#SL1024</td>
                        <td>Computer Parts Bulk</td>
                        <td>TechRecycle</td>
                        <td>Electronics</td>
                        <td>$450/lot</td>
                        <td>24 Mar 2025</td>
                        <td><span class="status pending">Pending</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                <button class="action-btn reject-btn"><i class="fas fa-times"></i></button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div style="display: flex; justify-content: center; margin-top: 20px;">
                <div class="pagination">
                    <button>&laquo;</button>
                    <button class="active">1</button>
                    <button>2</button>
                    <button>3</button>
                    <button>&raquo;</button>
                </div>
            </div>
        </div>
    `;
    
    // Add filter button functionality
    setTimeout(() => {
        const filterBtns = container.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                const filter = this.dataset.filter;
                
                // Update table title based on filter
                const tableTitle = container.querySelector('.table-title');
                if (tableTitle) {
                    if (filter === 'pending') {
                        tableTitle.textContent = 'Pending Scrap Listings';
                    } else if (filter === 'active') {
                        tableTitle.textContent = 'Active Scrap Listings';
                    } else if (filter === 'flagged') {
                        tableTitle.textContent = 'Flagged Scrap Listings';
                    }
                }
            });
        });
    }, 100);
    
    return container;
}

function createTransactionsContent() {
    const container = document.createElement('div');
    container.className = 'section-content';
    
    container.innerHTML = `
        <h2 class="section-title">Transactions & Payments</h2>
        <div class="dashboard-cards">
            <div class="card">
                <div class="card-header">
                    <h3>Total Revenue</h3>
                    <div class="card-icon revenue-icon">
                        <i class="fas fa-dollar-sign"></i>
                    </div>
                </div>
                <div class="card-value">$24,586</div>
                <div class="card-label">For March 2025</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3>Transactions</h3>
                    <div class="card-icon users-icon">
                        <i class="fas fa-exchange-alt"></i>
                    </div>
                </div>
                <div class="card-value">152</div>
                <div class="card-label">This Month</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3>Pending Payouts</h3>
                    <div class="card-icon listings-icon">
                        <i class="fas fa-hand-holding-usd"></i>
                    </div>
                </div>
                <div class="card-value">$8,350</div>
                <div class="card-label">To Seller Accounts</div>
            </div>
        </div>
        <div class="table-card">
            <div class="table-header">
                <h3 class="table-title">Recent Transactions</h3>
                <div>
                    <input type="text" placeholder="Search transactions..." style="padding: 8px; border-radius: 4px; border: 1px solid #ddd; margin-right: 10px;">
                    <select style="padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
                        <option>All Time</option>
                        <option>Today</option>
                        <option>This Week</option>
                        <option>This Month</option>
                        <option>Last Month</option>
                    </select>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date</th>
                        <th>Buyer</th>
                        <th>Seller</th>
                        <th>Item</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#TRX10358</td>
                        <td>30 Mar 2025</td>
                        <td>Manufacturing Plus</td>
                        <td>MetalWorks Inc</td>
                        <td>Aluminum Scrap</td>
                        <td>$1,875</td>
                        <td><span class="status approved">Completed</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-print"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#TRX10357</td>
                        <td>29 Mar 2025</td>
                        <td>Construction Co</td>
                        <td>PowerSupply Co</td>
                        <td>Copper Wiring</td>
                        <td>$2,125</td>
                        <td><span class="status approved">Completed</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-print"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#TRX10356</td>
                        <td>28 Mar 2025</td>
                        <td>EcoMaterials</td>
                        <td>GreenRecycle</td>
                        <td>Plastic Bundles</td>
                        <td>$720</td>
                        <td><span class="status pending">Processing</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#TRX10355</td>
                        <td>28 Mar 2025</td>
                        <td>Recycling Innovations</td>
                        <td>TechRecycle</td>
                        <td>Electronic Components</td>
                        <td>$1,680</td>
                        <td><span class="status pending">Processing</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#TRX10354</td>
                        <td>27 Mar 2025</td>
                        <td>Global Reuse Ltd</td>
                        <td>MetalWorks Inc</td>
                        <td>Steel Scrap</td>
                        <td>$1,250</td>
                        <td><span class="status approved">Completed</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-print"></i></button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <div style="display: flex; justify-content: center; margin-top: 20px;">
                <div class="pagination">
                    <button>&laquo;</button>
                    <button class="active">1</button>
                    <button>2</button>
                    <button>3</button>
                    <button>&raquo;</button>
                </div>
            </div>
        </div>
    `;
    
    return container;
}

function createDisputesContent() {
    const container = document.createElement('div');
    container.className = 'section-content';
    
    container.innerHTML = `
        <h2 class="section-title">Dispute Management</h2>
        <div class="dashboard-cards">
            <div class="card">
                <div class="card-header">
                    <h3>Open Disputes</h3>
                    <div class="card-icon disputes-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                </div>
                <div class="card-value">7</div>
                <div class="card-label">Requiring Attention</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3>Average Resolution Time</h3>
                    <div class="card-icon time-icon">
                        <i class="fas fa-clock"></i>
                    </div>
                </div>
                <div class="card-value">2.3 days</div>
                <div class="card-label">This Month</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3>Resolved Cases</h3>
                    <div class="card-icon resolved-icon">
                        <i class="fas fa-check-circle"></i>
                    </div>
                </div>
                <div class="card-value">24</div>
                <div class="card-label">Last 30 Days</div>
            </div>
        </div>
        <div class="table-card">
            <div class="table-header">
                <h3 class="table-title">Active Disputes</h3>
                <div>
                    <select style="padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
                        <option>All Disputes</option>
                        <option>High Priority</option>
                        <option>Medium Priority</option>
                        <option>Low Priority</option>
                    </select>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Date Filed</th>
                        <th>Buyer</th>
                        <th>Seller</th>
                        <th>Transaction</th>
                        <th>Issue Type</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>#DSP102</td>
                        <td>29 Mar 2025</td>
                        <td>Manufacturing Plus</td>
                        <td>MetalWorks Inc</td>
                        <td>#TRX10358</td>
                        <td>Quality Issue</td>
                        <td><span class="priority high">High</span></td>
                        <td><span class="status pending">Open</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-comments"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#DSP101</td>
                        <td>28 Mar 2025</td>
                        <td>EcoMaterials</td>
                        <td>GreenRecycle</td>
                        <td>#TRX10356</td>
                        <td>Quantity Discrepancy</td>
                        <td><span class="priority medium">Medium</span></td>
                        <td><span class="status pending">Open</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-comments"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#DSP100</td>
                        <td>27 Mar 2025</td>
                        <td>Construction Co</td>
                        <td>PowerSupply Co</td>
                        <td>#TRX10345</td>
                        <td>Delivery Delay</td>
                        <td><span class="priority low">Low</span></td>
                        <td><span class="status pending">Open</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-comments"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#DSP099</td>
                        <td>25 Mar 2025</td>
                        <td>Recycling Innovations</td>
                        <td>TechRecycle</td>
                        <td>#TRX10332</td>
                        <td>Payment Issue</td>
                        <td><span class="priority high">High</span></td>
                        <td><span class="status in-progress">In Progress</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-comments"></i></button>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>#DSP098</td>
                        <td>24 Mar 2025</td>
                        <td>Global Reuse Ltd</td>
                        <td>MetalWorks Inc</td>
                        <td>#TRX10325</td>
                        <td>Quality Issue</td>
                        <td><span class="priority medium">Medium</span></td>
                        <td><span class="status in-progress">In Progress</span></td>
                        <td>
                            <div class="action-buttons">
                                <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                <button class="action-btn approve-btn"><i class="fas fa-comments"></i></button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    return container;
}

function createReportsContent() {
    const container = document.createElement('div');
    container.className = 'section-content';
    
    container.innerHTML = `
        <h2 class="section-title">Reports & Analytics</h2>
        <div class="dashboard-cards">
            <div class="card">
                <div class="card-header">
                    <h3>Total Revenue YTD</h3>
                    <div class="card-icon revenue-icon">
                        <i class="fas fa-chart-line"></i>
                    </div>
                </div>
                <div class="card-value">$76,240</div>
                <div class="card-label">12% increase from last year</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3>Total Transactions YTD</h3>
                    <div class="card-icon transactions-icon">
                        <i class="fas fa-exchange-alt"></i>
                    </div>
                </div>
                <div class="card-value">485</div>
                <div class="card-label">8% increase from last year</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3>New Users YTD</h3>
                    <div class="card-icon users-icon">
                        <i class="fas fa-user-plus"></i>
                    </div>
                </div>
                <div class="card-value">125</div>
                <div class="card-label">24% increase from last year</div>
            </div>
        </div>
        
        <div class="row" style="display: flex; gap: 20px; margin-top: 20px;">
            <div class="chart-card" style="flex: 1; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 20px;">
                <h3>Monthly Revenue</h3>
                <div style="height: 250px; display: flex; align-items: center; justify-content: center;">
                    <div style="color: #777; font-style: italic;">Chart will display here</div>
                </div>
            </div>
            <div class="chart-card" style="flex: 1; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 20px;">
                <h3>User Growth</h3>
                <div style="height: 250px; display: flex; align-items: center; justify-content: center;">
                    <div style="color: #777; font-style: italic;">Chart will display here</div>
                </div>
            </div>
        </div>
        
        <div class="row" style="display: flex; gap: 20px; margin-top: 20px;">
            <div class="chart-card" style="flex: 1; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 20px;">
                <h3>Top Categories</h3>
                <div style="height: 250px; display: flex; align-items: center; justify-content: center;">
                    <div style="color: #777; font-style: italic;">Chart will display here</div>
                </div>
            </div>
            <div class="chart-card" style="flex: 1; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 20px;">
                <h3>Geographic Distribution</h3>
                <div style="height: 250px; display: flex; align-items: center; justify-content: center;">
                    <div style="color: #777; font-style: italic;">Chart will display here</div>
                </div>
            </div>
        </div>
        
        <div class="table-card" style="margin-top: 20px;">
            <div class="table-header">
                <h3 class="table-title">Top Performing Items</h3>
                <div>
                    <select style="padding: 8px; border-radius: 4px; border: 1px solid #ddd;">
                        <option>This Month</option>
                        <option>This Quarter</option>
                        <option>This Year</option>
                        <option>All Time</option>
                    </select>
                </div>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Item Name</th>
                        <th>Category</th>
                        <th>Total Sales</th>
                        <th>Revenue</th>
                        <th>Avg. Price</th>
                        <th>Growth</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Copper Wiring</td>
                        <td>Metal</td>
                        <td>42 sales</td>
                        <td>$18,450</td>
                        <td>$439.29</td>
                        <td><span class="growth positive">+12%</span></td>
                    </tr>
                    <tr>
                        <td>Computer Parts</td>
                        <td>Electronics</td>
                        <td>36 sales</td>
                        <td>$15,840</td>
                        <td>$440.00</td>
                        <td><span class="growth positive">+8%</span></td>
                    </tr>
                    <tr>
                        <td>Aluminum Scrap</td>
                        <td>Metal</td>
                        <td>29 sales</td>
                        <td>$12,180</td>
                        <td>$420.00</td>
                        <td><span class="growth positive">+5%</span></td>
                    </tr>
                    <tr>
                        <td>Steel Scrap</td>
                        <td>Metal</td>
                        <td>25 sales</td>
                        <td>$10,500</td>
                        <td>$420.00</td>
                        <td><span class="growth negative">-2%</span></td>
                    </tr>
                    <tr>
                        <td>Plastic Bundles</td>
                        <td>Plastic</td>
                        <td>18 sales</td>
                        <td>$7,560</td>
                        <td>$420.00</td>
                        <td><span class="growth positive">+15%</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    return container;
}

function createSettingsContent() {
    const container = document.createElement('div');
    container.className = 'section-content';
    
    container.innerHTML = `
        <h2 class="section-title">Admin Settings</h2>
        
        <div class="tabs" style="margin-bottom: 20px;">
            <button class="tab-btn active" data-tab="general">General Settings</button>
            <button class="tab-btn" data-tab="admin">Admin Accounts</button>
            <button class="tab-btn" data-tab="fees">Platform Fees</button>
            <button class="tab-btn" data-tab="notifications">Notifications</button>
        </div>
        
        <div class="tab-content active" id="general-tab">
            <div class="settings-card">
                <h3>General Platform Settings</h3>
                <form>
                    <div class="form-group">
                        <label>Platform Name</label>
                        <input type="text" value="ScrapMarket" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Support Email</label>
                        <input type="email" value="support@scrapmarket.com" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Contact Phone</label>
                        <input type="text" value="+1 (555) 123-4567" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Listing Approval</label>
                        <select class="form-control">
                            <option selected>Manual Approval Required</option>
                            <option>Auto-Approve Verified Sellers</option>
                            <option>Auto-Approve All</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Maintenance Mode</label>
                        <div class="toggle-switch">
                            <input type="checkbox" id="maintenance-mode">
                            <label for="maintenance-mode"></label>
                        </div>
                    </div>
                    <button type="button" class="btn save-btn">Save Changes</button>
                </form>
            </div>
        </div>
        
        <div class="tab-content" id="admin-tab" style="display: none;">
            <div class="settings-card">
                <h3>Admin Accounts</h3>
                <div class="table-action-bar" style="margin-bottom: 20px;">
                    <button class="btn add-btn"><i class="fas fa-plus"></i> Add Admin</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Last Login</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Admin User</td>
                            <td>admin@scrapmarket.com</td>
                            <td>Super Admin</td>
                            <td>Today, 10:35 AM</td>
                            <td><span class="status approved">Active</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                                    <button class="action-btn view-btn"><i class="fas fa-key"></i></button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Marketting User</td>
                            <td>marketing@scrapmarket.com</td>
                            <td>Marketing Admin</td>
                            <td>Yesterday, 2:15 PM</td>
                            <td><span class="status approved">Active</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                                    <button class="action-btn reject-btn"><i class="fas fa-ban"></i></button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>Support User</td>
                            <td>support@scrapmarket.com</td>
                            <td>Support Admin</td>
                            <td>Mar 28, 9:45 AM</td>
                            <td><span class="status approved">Active</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="action-btn edit-btn"><i class="fas fa-edit"></i></button>
                                    <button class="action-btn reject-btn"><i class="fas fa-ban"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="tab-content" id="fees-tab" style="display: none;">
            <div class="settings-card">
                <h3>Platform Fees Configuration</h3>
                <form>
                    <div class="form-group">
                        <label>Transaction Fee (%)</label>
                        <input type="number" value="2.5" min="0" max="100" step="0.1" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Listing Fee ($)</label>
                        <input type="number" value="0" min="0" step="0.01" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Featured Listing Fee ($)</label>
                        <input type="number" value="5.99" min="0" step="0.01" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Withdrawal Fee ($)</label>
                        <input type="number" value="1.00" min="0" step="0.01" class="form-control">
                    </div>
                    <button type="button" class="btn save-btn">Save Changes</button>
                </form>
            </div>
        </div>
        
        <div class="tab-content" id="notifications-tab" style="display: none;">
            <div class="settings-card">
                <h3>Notification Settings</h3>
                <form>
                    <div class="form-group">
                        <label>Email Notifications</label>
                        <div class="toggle-switch">
                            <input type="checkbox" id="email-notifications" checked>
                            <label for="email-notifications"></label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>New Listing Notifications</label>
                        <div class="toggle-switch">
                            <input type="checkbox" id="listing-notifications" checked>
                            <label for="listing-notifications"></label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Dispute Notifications</label>
                        <div class="toggle-switch">
                            <input type="checkbox" id="dispute-notifications" checked>
                            <label for="dispute-notifications"></label>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Transaction Notifications</label>
                        <div class="toggle-switch">
                            <input type="checkbox" id="transaction-notifications" checked>
                            <label for="transaction-notifications"></label>
                        </div>
                    </div>
                    <button type="button" class="btn save-btn">Save Changes</button>
                </form>
            </div>
        </div>
    `;
    
    // Add tab switching functionality
    setTimeout(() => {
        const tabBtns = container.querySelectorAll('.tab-btn');
        const tabContents = container.querySelectorAll('.tab-content');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tabName = this.dataset.tab;
                
                // Update active button
                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Show selected tab content
                tabContents.forEach(content => {
                    content.style.display = 'none';
                    if (content.id === `${tabName}-tab`) {
                        content.style.display = 'block';
                    }
                });
            });
        });
    }, 100);
    
    return container;
}

function createDashboardContent() {
    const container = document.createElement('div');
    container.className = 'dashboard-content';
    
    container.innerHTML = `
        <div class="dashboard-header">
            <h2>Admin Dashboard</h2>
            <p>Welcome back, Admin! Here's what's happening with your marketplace today.</p>
        </div>
        
        <div class="dashboard-cards">
            <div class="card">
                <div class="card-header">
                    <h3>Total Users</h3>
                    <div class="card-icon users-icon">
                        <i class="fas fa-users"></i>
                    </div>
                </div>
                <div class="card-value">246</div>
                <div class="card-label">Sellers & Buyers</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3>Pending Listings</h3>
                    <div class="card-icon listings-icon">
                        <i class="fas fa-clipboard-list"></i>
                    </div>
                </div>
                <div class="card-value">18</div>
                <div class="card-label">For Review</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3>Total Transactions</h3>
                    <div class="card-icon transactions-icon">
                        <i class="fas fa-exchange-alt"></i>
                    </div>
                </div>
                <div class="card-value">152</div>
                <div class="card-label">This Month</div>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3>Active Disputes</h3>
                    <div class="card-icon disputes-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                </div>
                <div class="card-value">7</div>
                <div class="card-label">Requiring Attention</div>
            </div>
        </div>
        
        <div class="dashboard-row">
            <div class="table-card pending-listings">
                <div class="table-header">
                    <h3 class="table-title">Recent Listings Pending Approval</h3>
                    <button class="view-all">View All</button>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Seller</th>
                            <th>Category</th>
                            <th>Price</th>
                            <th>Date</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>#SL1028</td>
                            <td>Metal Scraps (Aluminum)</td>
                            <td>MetalWorks Inc</td>
                            <td>Metal</td>
                            <td>$250/ton</td>
                            <td>28 Mar 2025</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                    <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                    <button class="action-btn reject-btn"><i class="fas fa-times"></i></button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>#SL1027</td>
                            <td>Electronic Waste Lot</td>
                            <td>TechRecycle</td>
                            <td>Electronics</td>
                            <td>$320/lot</td>
                            <td>27 Mar 2025</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                    <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                    <button class="action-btn reject-btn"><i class="fas fa-times"></i></button>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td>#SL1026</td>
                            <td>Used Copper Wiring</td>
                            <td>PowerSupply Co</td>
                            <td>Metal</td>
                            <td>$425/ton</td>
                            <td>26 Mar 2025</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="action-btn view-btn"><i class="fas fa-eye"></i></button>
                                    <button class="action-btn approve-btn"><i class="fas fa-check"></i></button>
                                    <button class="action-btn reject-btn"><i class="fas fa-times"></i></button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class="activity-card">
                <div class="activity-header">
                    <h3>Recent Activity</h3>
                </div>
                <div class="activity-feed">
                    <div class="activity-item">
                        <div class="activity-icon" style="background-color: rgba(57, 9, 188, 0.2); color: var(--primary-color)">
                            <i class="fas fa-user-plus"></i>
                        </div>
                        <div class="activity-details">
                            <p class="activity-message"><strong>New Seller:</strong> EcoMaterials registered</p>
                            <p class="activity-time">Today, 9:45 AM</p>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-icon" style="background-color: rgba(39, 174, 96, 0.2); color: var(--secondary-color)">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="activity-details">
                            <p class="activity-message"><strong>Listing Approved:</strong> #SL1025 - Plastic Scrap Bundle</p>
                            <p class="activity-time">Today, 8:30 AM</p>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-icon" style="background-color: rgba(39, 174, 96, 0.2); color: var(--secondary-color)">
                            <i class="fas fa-dollar-sign"></i>
                        </div>
                        <div class="activity-details">
                            <p class="activity-message"><strong>Transaction Complete:</strong> #TRX10358 for $1,875</p>
                            <p class="activity-time">Yesterday, 4:20 PM</p>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-icon" style="background-color: rgba(231, 76, 60, 0.2); color: var(--error-color)">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="activity-details">
                            <p class="activity-message"><strong>New Dispute:</strong> #DSP102 filed by Manufacturing Plus</p>
                            <p class="activity-time">Yesterday, 2:15 PM</p>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="activity-icon" style="background-color: rgba(241, 196, 15, 0.2); color: var(--warning-color)">
                            <i class="fas fa-clipboard-list"></i>
                        </div>
                        <div class="activity-details">
                            <p class="activity-message"><strong>New Listing:</strong> #SL1028 submitted for approval</p>
                            <p class="activity-time">Yesterday, 11:30 AM</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="dashboard-row">
            <div class="chart-card">
                <h3>Transaction Volume</h3>
                <div style="height: 250px; display: flex; align-items: center; justify-content: center;">
                    <div style="color: #777; font-style: italic;">Transaction chart will display here</div>
                </div>
            </div>
            <div class="chart-card">
                <h3>Top Categories</h3>
                <div style="height: 250px; display: flex; align-items: center; justify-content: center;">
                    <div style="color: #777; font-style: italic;">Categories chart will display here</div>
                </div