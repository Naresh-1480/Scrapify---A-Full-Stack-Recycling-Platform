const express = require('express');
const Listing = require('../models/Listing');
const router = express.Router();

// Create a new listing
router.post('/', async (req, res) => {
    try {
        console.log('Creating new listing...');
        console.log('User ID:', req.user.id);
        console.log('Request body:', {
            ...req.body,
            photo: req.body.photo ? 'photo data exists' : 'no photo'
        });

        const listing = new Listing({
            title: req.body.title || `${req.body.category} Scrap`,
            description: req.body.description,
            category: req.body.category,
            quantity: req.body.quantity,
            price: req.body.price,
            city: req.body.city.toUpperCase(),
            photo: req.body.photo,
            user: req.user.id,
            status: 'in_review'
        });

        console.log('New listing object:', {
            ...listing.toObject(),
            photo: listing.photo ? 'photo data exists' : 'no photo'
        });
        
        const savedListing = await listing.save();
        console.log('Listing saved successfully with ID:', savedListing._id);
        
        // Verify the listing was saved by fetching it back
        const verifyListing = await Listing.findById(savedListing._id);
        console.log('Verified listing exists:', !!verifyListing);
        
        res.status(201).json(savedListing);
    } catch (err) {
        console.error('Error creating listing:', err);
        res.status(400).json({ message: err.message });
    }
});

// Debug route to check all listings
router.get('/debug/all', async (req, res) => {
    try {
        console.log('Checking all listings in database...');
        const allListings = await Listing.find({});
        console.log(`Total listings in database: ${allListings.length}`);
        if (allListings.length > 0) {
            console.log('Status distribution:');
            const statusCount = {};
            allListings.forEach(listing => {
                statusCount[listing.status] = (statusCount[listing.status] || 0) + 1;
            });
            console.log(statusCount);
        }
        res.json({ 
            total: allListings.length,
            listings: allListings
        });
    } catch (err) {
        console.error('Error checking listings:', err);
        res.status(500).json({ message: 'Error checking listings' });
    }
});

// Get all listings with optional city filter
router.get('/', async (req, res) => {
    try {
        console.log('GET /api/listings - Request received');
        console.log('User from token:', req.user);
        
        const { city, status } = req.query;
        let query = {};
        
        if (city) {
            query.city = city.toUpperCase();
        }

        // If status is 'all', don't filter by status
        // If status is not specified, show all listings except those in 'pending' or 'sold' status
        // If specific status is provided, filter by that status
        if (status === 'all') {
            // Don't add status to query to get all listings
        } else if (!status) {
            query.status = { $nin: ['pending', 'sold'] };
        } else {
            query.status = status;
        }
        
        console.log('Database query:', JSON.stringify(query));

        const listings = await Listing.find(query)
            .populate('user', 'firstName lastName email rating')
            .sort({ createdAt: -1 });

        console.log(`Found ${listings.length} listings`);
        
        if (listings.length === 0) {
            console.log('No listings found with query:', query);
        } else {
            console.log('First listing:', JSON.stringify(listings[0]));
        }

        res.json(listings);
    } catch (err) {
        console.error('Error fetching listings:', err);
        res.status(500).json({ message: 'Error fetching listings' });
    }
});

// Get user's own listings
router.get('/my', async (req, res) => {
    try {
        console.log('Fetching user listings...');
        console.log('User ID:', req.user.id);

        // Set cache control headers to prevent caching
        res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.set('Expires', '-1');
        res.set('Pragma', 'no-cache');

        // Use lean() for better performance and toObject() to ensure we get plain objects
        const listings = await Listing.find({ user: req.user.id })
            .lean()
            .populate('user', 'firstName lastName email rating')
            .sort({ createdAt: -1 });
        
        console.log(`Found ${listings.length} listings for user`);
        console.log('Listing IDs:', listings.map(l => l._id));

        res.json(listings);
    } catch (err) {
        console.error('Error fetching user listings:', err);
        res.status(500).json({ message: err.message });
    }
});

// Get a single listing
router.get('/:id', async (req, res) => {
    try {
        const listing = await Listing.findOne({ 
            _id: req.params.id,
            user: req.user.id  // Only allow access to user's own listings
        });
        
        if (!listing) {
            return res.status(404).json({ msg: 'Listing not found' });
        }
        
        res.json(listing);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Listing not found' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

// Delete a listing
router.delete('/:id', async (req, res) => {
    try {
        const listing = await Listing.findOne({ 
            _id: req.params.id,
            user: req.user.id  // Only allow deletion of user's own listings
        });
        
        if (!listing) {
            return res.status(404).json({ msg: 'Listing not found' });
        }
        
        await Listing.deleteOne({ _id: req.params.id });
        res.json({ msg: 'Listing removed' });
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Listing not found' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update a listing
router.put('/:id', async (req, res) => {
    try {
        const { category, description, quantity, addressLine, city, pincode, photo, status } = req.body;
        const listing = await Listing.findOne({ 
            _id: req.params.id,
            user: req.user.id  // Only allow updates to user's own listings
        });
        
        if (!listing) {
            return res.status(404).json({ msg: 'Listing not found' });
        }
        
        // Update listing fields
        listing.category = category;
        listing.description = description;
        listing.quantity = quantity;
        listing.addressLine = addressLine;
        listing.city = city;
        listing.pincode = pincode;
        listing.photo = photo;
        if (status) listing.status = status; // Only update status if provided
        
        await listing.save();
        res.json(listing);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Listing not found' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

// Debug route to create a test listing
router.post('/debug/create-test', async (req, res) => {
    try {
        const testListing = new Listing({
            title: "Test Metal Scrap",
            description: "Test listing for debugging",
            category: "metal",
            quantity: 100,
            price: 500,
            city: "DELHI",
            status: "approved",
            user: req.user.id
        });
        
        await testListing.save();
        console.log('Created test listing:', testListing);
        res.json(testListing);
    } catch (err) {
        console.error('Error creating test listing:', err);
        res.status(500).json({ message: 'Error creating test listing' });
    }
});

// Schedule pickup for a listing
router.post('/schedule-pickup', async (req, res) => {
    try {
        const { listingId, collectorName, phoneNumber, pickupDate, pickupTime } = req.body;
        
        // Find the listing
        const listing = await Listing.findById(listingId);
        if (!listing) {
            return res.status(404).json({ message: 'Listing not found' });
        }

        // Update listing status to pending
        listing.status = 'pending';
        listing.pickupDetails = {
            collectorName,
            phoneNumber,
            pickupDate,
            pickupTime,
            scheduledBy: req.user.id
        };

        await listing.save();
        
        res.json({ message: 'Pickup scheduled successfully', listing });
    } catch (err) {
        console.error('Error scheduling pickup:', err);
        res.status(500).json({ message: 'Error scheduling pickup' });
    }
});

module.exports = router;