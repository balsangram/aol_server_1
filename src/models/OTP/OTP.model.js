import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  //   userid: {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "DeviceToken", // Assuming your user model is named 'DeviceToken'
  //     required: true,
  //   },
  userid: {
    type: String,
  },
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

// TTL index to auto-remove expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const OtpModel = mongoose.model("Otp", otpSchema);

export default OtpModel;
