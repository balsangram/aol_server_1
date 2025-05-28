import mongoose from "mongoose";

const deviceTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },

    userTypes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserType",
      },
    ],
    CardTypes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Card",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("DeviceToken", deviceTokenSchema);
