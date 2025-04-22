const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['metal', 'plastic', 'ewaste', 'paper', 'glass']
    },
    quantity: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    photo: {
        type: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['available', 'sold', 'pending', 'approved', 'in_review', 'rejected'],
        default: 'in_review'
    },
    pickupDetails: {
        collectorName: String,
        phoneNumber: String,
        pickupDate: Date,
        pickupTime: String,
        scheduledBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Listing', listingSchema);