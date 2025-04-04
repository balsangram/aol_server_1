import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    headline: { type: String, required: true },
    name: { type: String, required: true },
    link: { type: String },
    img: { type: String },
  },
  { timestamps: true }
);

const Card = mongoose.model("Card", cardSchema);
export default Card;
