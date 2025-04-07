import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    headline: { type: String, required: true },
    name: {
      en: { type: String, required: true }, // English
      hi: { type: String }, // Hindi
      kn: { type: String }, // Kannada
      ta: { type: String }, // Tamil
      te: { type: String }, // Telugu
      gu: { type: String }, // Gujarati
      mr: { type: String }, // Marathi
      ml: { type: String }, // Malayalam
      pa: { type: String }, // Punjabi
      bn: { type: String }, // Bengali
      ru: { type: String }, // Russian
      es: { type: String }, // Spanish
      zh: { type: String }, // Mandarin Chinese
      mn: { type: String }, // Mongolian
      pl: { type: String }, // Polish
      bg: { type: String }, // Bulgarian
      fr: { type: String }, // French
      de: { type: String }, // German
      nl: { type: String }, // Dutch
      it: { type: String }, // Italian
      pt: { type: String }, // Portuguese
      ja: { type: String }, // Japanese
      vi: { type: String }, // Vietnamese
    },
    link: { type: String },
    img: { type: String },
  },
  { timestamps: true }
);

const Card = mongoose.model("Card", cardSchema);
export default Card;

// import mongoose from "mongoose";

// const cardSchema = new mongoose.Schema(
//   {
//     headline: { type: String, required: true },
//     name: { type: String, required: true },
//     link: { type: String },
//     img: { type: String },
//   },
//   { timestamps: true }
// );

// const Card = mongoose.model("Card", cardSchema);
// export default Card;
