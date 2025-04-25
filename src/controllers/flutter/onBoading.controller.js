import OnBoarding from "../../models/flutter/OnBording.model.js";
import { uploadToCloudinary } from "../../utils/cloudnary.js"; // adjust to your utility path

export const displayOnBoarding = async (req, res) => {
  try {
    const latestOnBoardings = await OnBoarding.find()
      .sort({ createdAt: -1 }) // descending order
      .limit(3); // only the latest 4

    res.status(200).json({
      success: true,
      message: "Latest onboarding screens fetched successfully.",
      data: latestOnBoardings,
    });
  } catch (error) {
    console.error("Error fetching onboarding screens:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch onboarding screens.",
    });
  }
};

export const addOnBoarding = async (req, res) => {
  try {
    // const { title, body } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Image are all required.",
      });
    }

    const uploadedImage = await uploadToCloudinary(
      file.buffer,
      file.originalname
    );

    const newOnBoarding = await OnBoarding.create({
      img: uploadedImage.secure_url,
      //   title,
      //   body,
    });

    res.status(201).json({
      success: true,
      message: "Onboarding screen added successfully.",
      data: newOnBoarding,
    });
  } catch (error) {
    console.error("Error adding onboarding screen:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to add onboarding screen.",
    });
  }
};
