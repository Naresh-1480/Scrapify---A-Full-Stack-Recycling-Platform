const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { auth } = require('../middleware/authMiddleware');

// Admin routes for user management
router.get('/admin/users', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const { role, search } = req.query;
        const query = {};

        if (role && role !== 'all') {
            query.role = role;
        }

        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update user status (admin only)
router.put('/admin/users/:id/status', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const { isActive } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router; 