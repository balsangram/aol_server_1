import mongoose from "mongoose";

const homeCardSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    link: { type: String },
    img: { type: String },
  },
  { timestamps: true }
);

const HomeCard = mongoose.model("HomeCard", homeCardSchema);
export default HomeCard;
