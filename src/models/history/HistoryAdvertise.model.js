import mongoose from "mongoose";

const AdvertSchema = new mongoose.Schema({
  link: { type: String, required: true },
  img: { type: String, required: true },
});

const HistoryAdvertiseSchema = new mongoose.Schema(
  {
    archivedAds: [
      {
        img1: AdvertSchema,
        img2: AdvertSchema,
        img3: AdvertSchema,
      },
    ],
    archivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const HistoryAdvertise = mongoose.model(
  "HistoryAdvertise",
  HistoryAdvertiseSchema
);

export default HistoryAdvertise;
