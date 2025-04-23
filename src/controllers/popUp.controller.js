import PopUp from "../models/PopUp.js";
import { uploadCloudinary, uploadToCloudinary } from "../utils/cloudnary.js"; // Cloudinary helper function

// Add a new popup (store image in Cloudinary)
// export const addPopUp = async (req, res) => {
//   try {
//     const file = req.file;
//     console.log(file, "file");

//     if (!file) {
//       return res.status(400).json({ message: "Image file is required" });
//     }
//     // Upload to Cloudinary using buffer
//     const result = await uploadCloudinary(file.buffer, file.originalname);
//     console.log("Uploaded to Cloudinary:", result.secure_url);

//     // Remove any existing popups
//     await PopUp.deleteMany({});

//     // Save new popup
//     const newPopUp = new PopUp({ img: result.secure_url });
//     await newPopUp.save();

//     res.status(201).json({ message: "Popup added successfully", newPopUp });
//   } catch (error) {
//     console.error("Error adding popup:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

export const addPopUp = async (req, res) => {
  try {
    const file = req.file;
    console.log("file : ", file);

    if (!file) {
      return res.status(400).json({ message: "Image file is required" });
    }

    // Upload to Cloudinary using buffer
    const result = await uploadToCloudinary(file.buffer, file.originalname);
    console.log("Uploaded to Cloudinary:", result);

    // Remove any existing popups
    // await PopUp.deleteMany({});

    // Save new popup
    const newPopUp = new PopUp({ img: result.secure_url });
    await newPopUp.save();

    res.status(201).json({ message: "Popup added successfully", newPopUp });
  } catch (error) {
    console.error("Error adding popup:", error);
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

export const displayAllPopUp = async (req, res) => {
  try {
    const allPopUp = await PopUp.find().sort({ createdAt: -1 });

    // Format each popup with separate date and time fields
    const formattedPopUps = allPopUp.map((popup) => {
      const createdAt = new Date(popup.createdAt);
      const formattedDate = createdAt.toLocaleDateString(); // e.g., "4/23/2025"
      const formattedTime = createdAt.toLocaleTimeString(); // e.g., "10:30:15 AM"

      return {
        ...popup.toObject(),
        date: formattedDate,
        time: formattedTime,
      };
    });

    res.status(200).json(formattedPopUps);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
