const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require('../middleware/auth');

const router = express.Router();

// Signup Route
router.post("/signup", async (req, res) => {
    const { firstName, lastName, email, password, confirmPassword, role } = req.body;
  
    if (password !== confirmPassword) {
      return res.status(400).json({ msg: "Passwords do not match" });
    }
  
    try {
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ msg: "User already exists" });
  
      // Map frontend roles to backend roles
      let backendRole;
      if (role === 'individual') {
        backendRole = 'seller';
      } else if (role === 'collector') {
        backendRole = 'buyer';
      } else {
        backendRole = role; // For any other roles like 'business'
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
      user = new User({ firstName, lastName, email, password: hashedPassword, role: backendRole });
  
      await user.save();
      res.status(201).json({ msg: "User registered successfully" });
    } catch (err) {
      res.status(500).json({ msg: "Server error" });
    }
  });
  

// Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Special case for admin login
  if (email === 'admin@gmail.com' && password === 'admin') {
    const token = jwt.sign({ id: 'admin', role: 'admin' }, "your_jwt_secret", { expiresIn: "1h" });
    return res.json({ 
      token, 
      role: 'admin',
      redirectTo: '/admin.html',
      user: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@gmail.com'
      }
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, "your_jwt_secret", { expiresIn: "1h" });

    res.json({ 
      token, 
      role: user.role,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ msg: "Server error" });
  }
});

// Get user profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        
        // Add any additional user data you want to send
        const userData = {
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
            address: user.address,
            role: user.role,
            photo: user.photo,
            kycStatus: user.kycStatus,
            totalListings: user.totalListings || 0,
            totalSales: user.totalSales || 0,
            rating: user.rating || 0
        };
        
        res.json(userData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { firstName, lastName, phone, address, currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Update basic info
        if (firstName) user.firstName = firstName;
        if (lastName) user.lastName = lastName;
        
        // Update phone and address
        user.phone = phone || user.phone;
        user.address = address || user.address;

        // Update password if provided
        if (currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.status(400).json({ msg: 'Current password is incorrect' });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }

        await user.save();
        const updatedUser = await User.findById(req.user.id).select('-password');
        res.json(updatedUser);
    } catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ msg: 'Server error while updating profile' });
    }
});

// Update profile picture
router.put('/profile/photo', auth, async (req, res) => {
    try {
        if (!req.files || !req.files.photo) {
            return res.status(400).json({ msg: 'No photo uploaded' });
        }

        const photo = req.files.photo;
        const photoUrl = `/uploads/${photo.name}`; // You'll need to implement file storage logic

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.photo = photoUrl;
        await user.save();

        res.json({ photoUrl });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
