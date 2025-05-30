const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['email', 'phone'],
    required: true,
  },
  identifier: {
    type: String,
    required: true,
  },
  otp: {
    type: String, // store as string to handle leading zeros
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
});

// Optional: TTL index to automatically delete expired OTPs from MongoDB
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpModel = mongoose.model('Otp', otpSchema);

module.exports = OtpModel;
