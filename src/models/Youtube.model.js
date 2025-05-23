import mongoose from "mongoose";

const youtubeSchema = new mongoose.Schema(
  {
    thumbnail: {
      type: String,
      required: true,
    },
    thumbnailName: {
      type: String,
      required: true,
    },
    YouTubeLink: {
      type: String,
      required: true, // Ensures a link is always provided
    },
    platform: {
      type: String,
      enum: ["mobile", "web"], // Corrected enum
      // required: true, // Ensures platform is always provided
    },
  },
  { timestamps: true }
);

const YouTube = mongoose.model("YouTube", youtubeSchema);
export default YouTube;
