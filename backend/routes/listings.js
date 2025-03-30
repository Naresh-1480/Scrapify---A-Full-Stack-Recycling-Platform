const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Listing = require('../models/Listing');

// Create new listing
router.post('/listings', auth, async (req, res) => {
    try {
        const { category, title, description, quantity, photos, pickupLocation } = req.body;
        
        const listing = new Listing({
            seller: req.user.userId,
            category,
            title,
            description,
            quantity,
            photos,
            pickupLocation
        });

        await listing.save();
        res.status(201).json(listing);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get seller's listings
router.get('/listings/seller', auth, async (req, res) => {
    try {
        const listings = await Listing.find({ seller: req.user.userId });
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all listings (for buyers)
router.get('/listings', auth, async (req, res) => {
    try {
        const listings = await Listing.find({ status: 'available' })
            .populate('seller', 'name');
        res.json(listings);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;