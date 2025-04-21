const express = require('express');
const Listing = require('../models/Listing');
const router = express.Router();

// Create a new listing
router.post('/listings', async (req, res) => {
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

// Get listings by city (for buyers)
router.get('/listings/city/:city', async (req, res) => {
    try {
        const listings = await Listing.find({
            city: req.params.city.toUpperCase(),
            status: 'approved'
        }).populate('user', 'firstName lastName email');
        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get user's own listings
router.get('/listings/my', async (req, res) => {
    try {
        const listings = await Listing.find({ user: req.user.id });
        res.json(listings);
    } catch (err) {
        res.status(500).json({ message: err.message });
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