import mongoose from "mongoose";

const directionSchema = new mongoose.Schema(
  {
    directionName: {
      type: String,
      required: true,
      trim: true,
    },
    directionImg: {
      type: String,
      required: true,
      trim: true,
    },
    directionDescription: {
      type: String,
      required: true,
      trim: true,
    },
    longitude: {
      type: String,
      required: true,
      trim: true,
    },
    latitude: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Direction = mongoose.model("Direction", directionSchema);

export default Direction;
