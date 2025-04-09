import mongoose from "mongoose";

const liveDateTimeSchema = new mongoose.Schema({
  date: { type: String, required: true },
  time: { type: String, required: true },
});

const LiveDateTime = mongoose.model("LiveDateTime", liveDateTimeSchema);
export default LiveDateTime;
