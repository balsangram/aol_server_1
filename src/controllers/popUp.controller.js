import PopUp from "../models/PopUp.js";
import { uploadCloudinary } from "../utils/cloudnary.js"; // Cloudinary helper function

// Add a new popup (store image in Cloudinary)
export const addPopUp = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Upload image to Cloudinary
    const imageUpload = await uploadCloudinary(req.file.path);

    // Remove previous popup if exists
    await PopUp.deleteMany({});

    // Add new popup with Cloudinary URL
    const newPopUp = new PopUp({ img: imageUpload.url });
    await newPopUp.save();

    res.status(201).json({ message: "Popup added successfully", newPopUp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Display the latest popup
export const displayPopUp = async (req, res) => {
  try {
    const latestPopUp = await PopUp.findOne().sort({ createdAt: -1 });

    if (!latestPopUp) {
      return res.status(404).json({ message: "No popups found" });
    }

    res.status(200).json(latestPopUp);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
