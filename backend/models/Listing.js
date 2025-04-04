const mongoose = require('mongoose');

const ListingSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        enum: ['paper', 'plastic', 'metal', 'electronics', 'glass', 'other']
    },
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Listing', ListingSchema);