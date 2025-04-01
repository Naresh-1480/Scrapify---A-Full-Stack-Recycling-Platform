const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller'], required: true },
  phone: { type: String },
  address: { type: String },
  photo: { type: String, default: '/api/placeholder/150/150' },
  kycStatus: { type: String, enum: ['Not Submitted', 'Pending', 'Verified', 'Rejected'], default: 'Not Submitted' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
