const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    quantity: {
        type: Number,
        required: true
    },
    photos: [{
        type: String  // URLs of uploaded photos
    }],
    pickupLocation: {
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'pending'],
        default: 'available'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Listing', listingSchema);