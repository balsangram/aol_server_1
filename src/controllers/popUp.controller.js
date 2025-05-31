import PopUp from "../models/PopUp.js";
import { uploadCloudinary, uploadToCloudinary } from "../utils/cloudnary.js"; // Cloudinary helper function

// Add a new popup (store image in Cloudinary)

// import { scheduleImageRevert } from "../utils/cronJobs/popUpScheduler.js";

// export const addPopUp = async (req, res) => {
//   try {
//     const file = req.file;
//     const { liveTime } = req.body;

//     // Validate file
//     if (!file) {
//       return res.status(400).json({ message: "Image file is required" });
//     }
//     if (!file.mimetype.startsWith("image/")) {
//       return res.status(400).json({ message: "Only image files are allowed" });
//     }
//     if (file.size > 5 * 1024 * 1024) {
//       return res.status(400).json({ message: "Image size exceeds 5MB limit" });
//     }

//     // Parse liveTime or default to now
//     let liveTimeDate = liveTime ? new Date(liveTime) : new Date();
//     if (isNaN(liveTimeDate.getTime())) {
//       return res.status(400).json({ message: "Invalid liveTime format" });
//     }

//     // Upload to Cloudinary
//     const result = await uploadToCloudinary(file.buffer, file.originalname);
//     if (!result?.secure_url) {
//       throw new Error("Failed to upload image to Cloudinary");
//     }

//     // Save to DB
//     const newPopUp = new PopUp({
//       img: result.secure_url,
//       liveTime: liveTimeDate,
//     });

//     await newPopUp.save();

//     res.status(201).json({
//       message: "Popup added successfully",
//       popup: newPopUp,
//     });
//   } catch (error) {
//     console.error("❌ Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const addPopUp = async (req, res) => {
  try {
    const file = req.file;
    const { liveTime } = req.body;

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

    // Parse custom format liveTime ("hh-mm-dd-MM-yyyy")
    let liveTimeDate;
    if (liveTime) {
      const parts = liveTime.split("-"); // ["11", "02", "27", "05", "2025"]
      if (parts.length === 5) {
        const [hh, mm, dd, MM, yyyy] = parts.map(Number);
        liveTimeDate = new Date(yyyy, MM - 1, dd, hh, mm);
      } else {
        return res
          .status(400)
          .json({
            message: "Invalid liveTime format. Expected hh-mm-dd-MM-yyyy",
          });
      }
    } else {
      liveTimeDate = new Date(); // default to now
    }

    if (isNaN(liveTimeDate.getTime())) {
      return res.status(400).json({ message: "Invalid date in liveTime" });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(file.buffer, file.originalname);
    if (!result?.secure_url) {
      throw new Error("Failed to upload image to Cloudinary");
    }

    // Save to DB
    const newPopUp = new PopUp({
      img: result.secure_url,
      liveTime: liveTimeDate,
    });

    await newPopUp.save();

    res.status(201).json({
      message: "Popup added successfully",
      popup: newPopUp,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
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
