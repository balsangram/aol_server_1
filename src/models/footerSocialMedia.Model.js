import mongoose from "mongoose";

const footerSocialMediaSchema = new mongoose.Schema(
  {
    mediaName: {
      type: String,
      required: true,
    },
    mediaLink: {
      type: String,
      required: true,
    },
    mediaImage: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("footerSocialMedia", footerSocialMediaSchema);
