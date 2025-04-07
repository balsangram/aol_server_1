import mongoose from "mongoose";

const actionSchema = new mongoose.Schema(
  {
    usertype: {
      type: String,
    },
    language: {
      type: String,
    },
    img: {
      type: String,
    },
    action: {
      type: Map,
      of: String,
      required: true,
    },
    // action: {
    //   en: { type: String, required: true }, // English
    //   hi: { type: String },
    //   kn: { type: String },
    //   ta: { type: String },
    //   te: { type: String },
    //   gu: { type: String },
    //   mr: { type: String },
    //   ml: { type: String },
    //   pa: { type: String },
    //   bn: { type: String },
    //   ru: { type: String },
    //   es: { type: String },
    //   zh: { type: String },
    //   mn: { type: String },
    //   pl: { type: String },
    //   bg: { type: String },
    //   fr: { type: String },
    //   de: { type: String },
    //   nl: { type: String },
    //   it: { type: String },
    //   pt: { type: String },
    //   ja: { type: String },
    //   vi: { type: String },
    // },
    link: { type: String, required: true },
  },
  { timestamps: true }
);

// ✅ This line prevents the OverwriteModelError
// const Action = mongoose.model("Action", actionSchema);
const Action = mongoose.models.Action || mongoose.model("Action", actionSchema);

export default Action;
