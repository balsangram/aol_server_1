// models/DeviceToken.js
import mongoose from "mongoose";

const deviceTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("DeviceToken", deviceTokenSchema);
