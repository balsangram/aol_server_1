import mongoose from "mongoose";

const liveLinkSchema = new mongoose.Schema({
  link: { type: String, require: true },
});

const LiveLink = mongoose.model("LiveLink", liveLinkSchema);
export default LiveLink;
