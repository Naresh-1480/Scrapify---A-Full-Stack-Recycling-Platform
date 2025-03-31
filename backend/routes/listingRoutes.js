const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');

// Create a new listing
router.post('/listings', async (req, res) => {
  try {
    const listing = new Listing(req.body);
    await listing.save();
    res.status(201).send(listing);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Get all listings
router.get('/listings', async (req, res) => {
  try {
    const listings = await Listing.find().populate('createdBy', 'username');
    res.status(200).send(listings);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;