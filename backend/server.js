const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require('path');
require('dotenv').config();

const User = require("./models/User");
const listingRoutes = require("./routes/listingRoutes");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(cors({origin: '*'})); // Allow requests from frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// Authentication middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).send({ error: 'Access denied. No token provided.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret_key");
    req.user = decoded;
    next();
  } catch (ex) {
    res.status(400).send({ error: 'Invalid token.' });
  }
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://choudharynaresh2005:Naresh1480@scrapify.f51pm1i.mongodb.net/scrapify?retryWrites=true&w=majority&appName=Scrapify", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB Connected');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Auth Routes from existing code (kept for backward compatibility)
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Email already exists!" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save user
    const newUser = new User({ firstName, lastName, email, password: hashedPassword, role });
    await newUser.save();

    res.status(201).json({ msg: "User registered successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Invalid email or password" });

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid email or password" });

    // Generate a JWT Token
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET || "secret_key", 
      { expiresIn: "1h" }
    );

    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// Use routes
app.use('/api', authRoutes);
app.use('/api', auth, listingRoutes);

// Serve frontend (from new code)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));