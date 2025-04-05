import Head from "../models/Head.model.js";
import MHead from "../models/MHead.model.js";
// import axios from "axios";
import translateText from "../utils/translation.js";
export const displayHeadlines = async (req, res) => {
  try {
    const allHead = await Head.find();
    // console.log(allHead, "all headlines");
    if (allHead.length === 0) {
      return res.status(404).json({ message: "no headline available" });
    }
    res.status(200).json({ headlines: allHead });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

export const addHeadlines = async (req, res) => {
  try {
    console.log(req.body, "headline body details");
    const { headline } = req.body;
    console.log(headline, " : which headline i add that show");
    const isHeading = await Head.findOne({ headline });
    console.log(isHeading, "avelable or not");
    if (isHeading) {
      return res.status(400).json({ message: "this headline already here" });
    }
    const newHead = new Head({ headline });
    await newHead.save();
    res.status(200).json({ message: "headline added sucessafully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server error" });
  }
};

// Helper function to translate text

// export const translateText = async (text, targetLang) => {
//   try {
//     const response = await axios.post(
//       "https://libretranslate.com/translate", // alternative instance (more reliable)
//       {
//         q: text,
//         source: "en",
//         target: targetLang,
//         format: "text",
//       },
//       {
//         headers: { "Content-Type": "application/json" },
//         timeout: 5000, // ⏱️ 5 seconds timeout
//       }
//     );
//     console.log(response, "response");

//     return response.data.translatedText;
//   } catch (error) {
//     console.error(`Translation error for ${targetLang}:`, error);
//     return text; // fallback to original text
//   }
// };

// Controller function
export const multiAddHeadlines = async (req, res) => {
  try {
    const { headline } = req.body;

    if (!headline || typeof headline !== "string") {
      return res
        .status(400)
        .json({ message: "Valid English headline is required" });
    }

    // Check if headline already exists
    const exists = await MHead.findOne({ "headline.en": headline });
    if (exists) {
      return res.status(400).json({ message: "This headline already exists" });
    }

    // Translate into other languages
    const translations = {
      hi: await translateText(headline, "hi"),
      ar: await translateText(headline, "ar"),
      fr: await translateText(headline, "fr"),
      es: await translateText(headline, "es"),
      zh: await translateText(headline, "zh"),
    };

    const newHead = new MHead({
      headline: {
        en: headline,
        ...translations,
      },
    });

    await newHead.save();

    res.status(200).json({
      message: "Headline translated and saved successfully",
      data: newHead,
    });
  } catch (error) {
    console.error("multiAddHeadlines error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateHeading = async (req, res) => {
  try {
    const { id } = req.params;
    const { headline } = req.body;
    if (!headline) {
      return res.status(400).json({ message: "first fill the form" });
    }
    const updateHeading = await Head.findByIdAndUpdate(
      id,
      { headline },
      { new: true }
    );
    res
      .status(200)
      .json({ message: "Headline updated sucessafully", updateHeading });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};

export const deleteHeading = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    const headlineDeleted = await Head.findByIdAndDelete(id);
    if (!headlineDeleted) {
      return res.status(400).json({ message: "headline is not deleted" });
    }
    res.status(200).json({ message: "headline is deleted sucessafully" });
  } catch (error) {
    res.status(500).json({ message: "internal server error" });
  }
};
