import mongoose from "mongoose";

const clickDetailSchema = new mongoose.Schema({
  cardId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Card",
    // required: true,
  },
  cardName: {
    type: String,
    required: true,
  },
  clickTimes: [
    {
      type: Date,
      default: Date.now,
    },
  ],
  clickCount: {
    type: Number,
    default: 1,
  },
});

const linkLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeviceToken",
      required: true,
      unique: true, // 1 document per user
    },
    userName: { type: String, required: true },
    userPhone: { type: String, required: true },
    userEmail: { type: String, required: true },
    clicks: [clickDetailSchema],
  },
  {
    timestamps: true,
  }
);

const LinkLog = mongoose.model("LinkLog", linkLogSchema);
export default LinkLog;
