const express = require('express');
const Listing = require('../models/Listing');
const router = express.Router();

// Create a new listing
router.post('/listings', async (req, res) => {
    try {
        const { category, title, description, quantity, location } = req.body;
        console.log('Received Data:', req.body);  // Debug log
        const newListing = new Listing({
            category,
            title,
            description,
            quantity,
            location
        });
        await newListing.save();
        res.status(201).json(newListing);
    } catch (err) {
        console.error('Error:', err);  // Debug log
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get all listings
router.get('/listings', async (req, res) => {
    try {
        const listings = await Listing.find();
        res.json(listings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Add this to listingRoutes.js

// Delete a listing
router.delete('/listings/:id', async (req, res) => {
    try {
        const listing = await Listing.findById(req.params.id);
        
        if (!listing) {
            return res.status(404).json({ msg: 'Listing not found' });
        }
        
        await listing.remove();
        res.json({ msg: 'Listing removed' });
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Listing not found' });
        }
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;