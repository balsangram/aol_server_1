import mongoose from "mongoose";

const onBoardingSchema = new mongoose.Schema(
  {
    img: { type: String, required: true },
    title: { type: String },
    body: { type: String },
  },
  { timestamps: true }
);

const OnBoarding = mongoose.model("OnBoarding", onBoardingSchema);
export default OnBoarding;
