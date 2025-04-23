import mongoose from "mongoose";

const liveNewUpdateSchema = new mongoose.Schema(
  {
    content: { type: String, required: true }, // better field name than "string"
  },
  { timestamps: true } // optional: adds createdAt and updatedAt
);

const LiveNewUpdate = mongoose.model("LiveNewUpdate", liveNewUpdateSchema);

export default LiveNewUpdate;
