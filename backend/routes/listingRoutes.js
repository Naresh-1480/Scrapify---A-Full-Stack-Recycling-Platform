const express = require('express');
const Listing = require('../models/Listing');
const router = express.Router();

// Create a new listing
router.post('/listings', async (req, res) => {
    try {
        console.log("start");
        const { category, description, quantity, addressLine, city, pincode, photo } = req.body;
        console.log('Received Data:', req.body);  // Debug log
        const newListing = new Listing({
            category,
            description,
            quantity,
            addressLine,
            city,
            pincode,
            photo,
            status: 'in_review', // Set initial status
            user: req.user.id  // Add the user ID to the listing
        });
        await newListing.save();
        res.status(201).json(newListing);
    } catch (err) {
        console.error('Error:', err);  // Debug log
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get all listings for the current user
router.get('/listings', async (req, res) => {
    try {
        const listings = await Listing.find({ user: req.user.id });
        res.json(listings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Get a single listing
router.get('/listings/:id', async (req, res) => {
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
router.delete('/listings/:id', async (req, res) => {
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
router.put('/listings/:id', async (req, res) => {
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

module.exports = router;