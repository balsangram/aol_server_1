import socialMediaSchema from "../models/footerSocialMedia.Model.js";
import { uploadToCloudinary } from "../utils/cloudnary.js"; // Adjust the path
export const displayAllSocialMedia = async (req, res) => {
  try {
    const allSocialmedia = await socialMediaSchema.find();
    res
      .status(200)
      .json({ message: "all display social media ", allSocialmedia });
  } catch (error) {
    res.status(500).json({ error });
  }
};
// import SocialMedia from "../models/socialMediaModel.js"; // Adjust the path as needed

// import { Readable } from "stream"; // Needed for streaming buffer

export const addSocialMedia = async (req, res) => {
  try {
    const { mediaName, mediaLink } = req.body;
    console.log(req.body, "body");

    const mediaImage = req.file;
    console.log(mediaImage, "mediaImage");

    if (!mediaImage) {
      return res.status(400).json({ message: "Image file is required." });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(
      mediaImage.buffer,
      mediaImage.originalname
    );

    // Save to DB
    const newSocialMedia = new socialMediaSchema({
      mediaName,
      mediaLink,
      mediaImage: uploadResult.secure_url,
    });

    await newSocialMedia.save();

    res.status(200).json({
      message: "Social media added successfully",
      data: newSocialMedia,
    });
  } catch (error) {
    console.error("Error uploading social media:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// import SocialMedia from "../models/socialMediaModel.js";
// import { uploadToCloudinary } from "../utils/cloudinary.js";

export const updateSocialMedia = async (req, res) => {
  try {
    const { id } = req.params;
    const { mediaName, mediaLink } = req.body;
    const mediaImageFile = req.file;

    // Find the existing social media entry
    const existing = await socialMediaSchema.findById(id);
    if (!existing) {
      return res.status(404).json({ message: "Social media entry not found" });
    }

    // Update name/link if provided
    if (mediaName) existing.mediaName = mediaName;
    if (mediaLink) existing.mediaLink = mediaLink;

    // If a new image was uploaded, upload it to Cloudinary
    if (mediaImageFile) {
      const uploadResult = await uploadToCloudinary(
        mediaImageFile.buffer,
        mediaImageFile.originalname
      );
      existing.mediaImage = uploadResult.secure_url;
    }

    // Save changes
    await existing.save();

    res.status(200).json({ message: "Social media updated", data: existing });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update social media" });
  }
};
