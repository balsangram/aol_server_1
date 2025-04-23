import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const historyLiveLinkSchema = new Schema({
  link: { type: String, required: true },
  stoppedAt: { type: Date, default: Date.now },
  // Add any other fields from the original LiveLink model
});

export default models.LiveLinkHistory ||
  model("LiveLinkHistory", historyLiveLinkSchema);
