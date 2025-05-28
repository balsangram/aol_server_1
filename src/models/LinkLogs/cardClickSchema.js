// models/CardClick.js
import mongoose from "mongoose";

const cardClickSchema = new mongoose.Schema(
  {
    card: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Card",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DeviceToken",
      required: true,
    },
    clickedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("CardClick", cardClickSchema);
