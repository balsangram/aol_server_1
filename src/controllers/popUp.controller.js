import PopUp from "../models/PopUp.js";
import { uploadCloudinary, uploadToCloudinary } from "../utils/cloudnary.js"; // Cloudinary helper function

// Add a new popup (store image in Cloudinary)

import { scheduleImageRevert } from "../utils/cronJobs/popUpScheduler.js";

export const addPopUp = async (req, res) => {
  try {
    const file = req.file;
    const { liveTime, defaultImage } = req.body;

    // Validate file
    if (!file) {
      return res.status(400).json({ message: "Image file is required" });
    }
    if (!file.mimetype.startsWith("image/")) {
      return res.status(400).json({ message: "Only image files are allowed" });
    }
    if (file.size > 5 * 1024 * 1024) {
      return res.status(400).json({ message: "Image size exceeds 5MB limit" });
    }

    // Validate inputs
    if (!liveTime) {
      return res.status(400).json({ message: "Live time is required" });
    }
    if (!defaultImage && !process.env.DEFAULT_POPUP_IMAGE) {
      return res.status(400).json({ message: "Default image is required" });
    }

    const liveTimeDate = new Date(liveTime);
    if (isNaN(liveTimeDate.getTime())) {
      return res.status(400).json({ message: "Invalid liveTime format" });
    }
    if (liveTimeDate <= new Date()) {
      return res
        .status(400)
        .json({ message: "liveTime must be in the future" });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.buffer, file.originalname);
    if (!result?.secure_url) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    // Create and save popup
    const newPopUp = new PopUp({
      currentImage: result.secure_url,
      defaultImage: defaultImage || process.env.DEFAULT_POPUP_IMAGE,
      liveTime: liveTimeDate,
    });

    try {
      await newPopUp.save();
    } catch (error) {
      await cloudinary.uploader.destroy(result.public_id); // Clean up on failure
      throw error;
    }

    // Schedule image reversion (using Agenda or similar)
    await scheduleImageRevert(newPopUp._id, liveTimeDate);

    // Format timestamps in IST
    const istFormatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });

    res.status(201).json({
      message: "Popup added successfully",
      popUp: {
        ...newPopUp.toJSON(),
        liveTimeIST: istFormatter.format(liveTimeDate),
        createdAtIST: istFormatter.format(newPopUp.createdAt),
        updatedAtIST: istFormatter.format(newPopUp.updatedAt),
      },
    });
  } catch (error) {
    console.error("❌ Error adding popup:", error);
    res.status(500).json({
      message: "Failed to add popup",
      error: error.message,
    });
  }
};
// export const addPopUp = async (req, res) => {
//   try {
//     const file = req.file;
//     const { liveTime } = req.body;

//     if (!file) {
//       return res.status(400).json({ message: "Image file is required" });
//     }

//     if (!liveTime) {
//       return res.status(400).json({ message: "Live time is required" });
//     }

//     const result = await uploadToCloudinary(file.buffer, file.originalname);

//     const newPopUp = new PopUp({
//       img: result.secure_url,
//       liveTime: new Date(liveTime),
//     });

//     await newPopUp.save();

//     res.status(201).json({ message: "Popup added successfully", newPopUp });

//     // Optional: Schedule update or deletion
//     scheduleImageUpdate(newPopUp._id, new Date(liveTime));
//   } catch (error) {
//     console.error("Error adding popup:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// export const addPopUp = async (req, res) => {
//   try {
//     const file = req.file;
//     console.log("file : ", file);

//     if (!file) {
//       return res.status(400).json({ message: "Image file is required" });
//     }

//     // Upload to Cloudinary using buffer
//     const result = await uploadToCloudinary(file.buffer, file.originalname);
//     console.log("Uploaded to Cloudinary:", result);

//     // Remove any existing popups
//     // await PopUp.deleteMany({});

//     // Save new popup
//     const newPopUp = new PopUp({ img: result.secure_url });
//     await newPopUp.save();

//     res.status(201).json({ message: "Popup added successfully", newPopUp });
//   } catch (error) {
//     console.error("Error adding popup:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

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
