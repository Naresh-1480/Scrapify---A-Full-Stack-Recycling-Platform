const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['paper', 'plastic', 'metal', 'electronics', 'glass', 'other']
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    addressLine: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true,
        enum: ['MUMBAI', 'PUNE', 'NAVI MUMBAI']
    },
    pincode: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['in_review', 'approved', 'rejected', 'sold'],
        default: 'in_review'
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Listing', ListingSchema);