// src/models/OTP/OTP.model.js
import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["email", "phone"],
    required: true,
  },
  identifier: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
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

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpModel = mongoose.model("Otp", otpSchema); // Use 'Otp' for collection name 'otps'

export default OtpModel;
