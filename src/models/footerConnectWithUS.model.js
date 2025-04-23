import mongoose from "mongoose";

const footerContactWithUsSchema = new mongoose.Schema(
  {
    contactName: {
      type: String,
      required: true,
    },
    contactLink: {
      type: String,
      required: true,
    },
    contactImage: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("FooterContactWithUs", footerContactWithUsSchema);
