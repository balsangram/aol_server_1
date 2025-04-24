import YouTube from "../models/Youtube.model.js";
import { uploadCloudinary, uploadToCloudinary } from "../utils/cloudnary.js";
export const showMobileYoutubeLinks = async (req, res) => {
  try {
    const allLinks = await YouTube.find({ platform: "mobile" })
      .sort({ createdAt: -1 }) // Or use { _id: -1 } if no createdAt field
      .limit(5);

    res.status(200).json({ links: allLinks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addYoutubeLinks = async (req, res) => {
  try {
    const file = req.file;
    const { YouTubeLink, platform, thumbnailName } = req.body;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Upload image to Cloudinary
    const result = await uploadToCloudinary(file.buffer, file.originalname);

    // Create new YouTube document
    const newLink = new YouTube({
      YouTubeLink,
      platform,
      thumbnail: result.secure_url,
      thumbnailName,
    });

    await newLink.save();

    res.status(200).json({ link: newLink });
  } catch (error) {
    console.error("Error adding YouTube link:", error);
    res.status(500).json({ message: error.message });
  }
};

export const showWebYoutubeLinks = async (req, res) => {
  try {
    const allLinks = await YouTube.find({ platform: "web" })
      .sort({ createdAt: -1 }) // Sort by latest first
      .limit(5); // Limit to 5 results

    console.log(allLinks);
    res.status(200).json({ links: allLinks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateYoutubeLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { YouTubeLink, platform, thumbnail, thumbnailName } = req.body;

    console.log(id, "update ID");

    const existingLink = await YouTube.findById(id);

    if (!existingLink) {
      return res.status(404).json({ message: "Link not available" });
    }

    const updatedYoutubeLink = await YouTube.findByIdAndUpdate(
      id,
      { YouTubeLink, platform, thumbnail, thumbnailName },
      { new: true } // Return the updated document
    );

    console.log(updatedYoutubeLink, "Updated link data");

    res.status(200).json({
      message: "YouTube link updated successfully",
      updatedYoutubeLink,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteYoutubeLink = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, " YouTubeLink id");
    const islink = await YouTube.findById({ _id: id });
    console.log(islink, "link");

    if (!islink) {
      return res.status(404).json({ message: "link is not avelable" });
    }

    const deleteYoutubeLink = await YouTube.findByIdAndDelete(id);
    if (deleteYoutubeLink) {
      res.status(200).json({ message: "Youtube link Deleted sucessafully" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
