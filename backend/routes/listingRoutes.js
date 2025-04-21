const express = require('express');
const Listing = require('../models/Listing');
const router = express.Router();

// Create a new listing
router.post('/', async (req, res) => {
    try {
        const listing = new Listing({
            ...req.body,
            user: req.user.id,
            status: 'in_review'
        });
        await listing.save();
        res.status(201).json(listing);
    } catch (err) {
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
        
        const { city } = req.query;
        let query = {};
        
        if (city) {
            query.city = city.toUpperCase();
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
        const listings = await Listing.find({ user: req.user.id });
        res.json(listings);
    } catch (err) {
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

module.exports = router;