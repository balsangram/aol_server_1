import mongoose from "mongoose";

const popUpSchema = new mongoose.Schema(
  {
    img: {
      type: String,
      require: true,
    },
    liveTime: {
      type: Date, // time when the popup should be updated or expired
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const PopUp = mongoose.model("PopUp", popUpSchema);
export default PopUp;
