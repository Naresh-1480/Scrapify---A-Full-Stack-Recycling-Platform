const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { name, phone, address },
            { new: true }
        ).select('-password');
        
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;