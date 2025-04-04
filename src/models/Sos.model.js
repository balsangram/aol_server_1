import mongoose from "mongoose";

const sosSchema = new mongoose.Schema(
  {
    phoneNumber: {
      type: String,
      required: true,
    },
    countryCode: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("SOS", sosSchema);
