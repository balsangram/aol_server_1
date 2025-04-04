import mongoose from "mongoose";

const popUpSchema = new mongoose.Schema(
  {
    img: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  }
);

const PopUp = mongoose.model("PopUp", popUpSchema);
export default PopUp;
