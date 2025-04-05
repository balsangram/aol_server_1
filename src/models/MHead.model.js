import mongoose from "mongoose";

const HeadlineSchema = new mongoose.Schema(
  {
    headline: {
      en: { type: String, required: true },
      hi: { type: String },
      ar: { type: String },
      fr: { type: String },
      es: { type: String },
      zh: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// 👇 Use existing model if already compiled

const MHead = mongoose.model("MHead", HeadlineSchema);

export default MHead;
