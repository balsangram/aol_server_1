import mongoose from "mongoose";

const HistoryAdvertiseSchema = new mongoose.Schema(
  {
    img1: {
      link: { type: String, required: true },
      img: { type: String, required: true },
    },
    img2: {
      link: { type: String, required: true },
      img: { type: String, required: true },
    },
    img3: {
      link: { type: String, required: true },
      img: { type: String, required: true },
    },
  },
  { timestamps: true }
);

const HistoryAdvertise = mongoose.model(
  "HistoryAdvertise",
  HistoryAdvertiseSchema
);
export default HistoryAdvertise;
