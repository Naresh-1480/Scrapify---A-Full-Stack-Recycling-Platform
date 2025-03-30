require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const connectDB = require('./config/db');

// Initialize express
const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Serve static files from frontend directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/scrap', require('./routes/scrapRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));

// Serve frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
});

// Error handling middleware
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});