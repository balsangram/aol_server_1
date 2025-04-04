import YouTube from "../models/Youtube.model.js";
import { uploadCloudinary } from "../utils/cloudnary.js";
export const showMobileYoutubeLinks = async (req, res) => {
  try {
    const allLinks = await YouTube.find({ platform: "mobile" });
    console.log(allLinks);
    res.status(200).json({ links: allLinks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const addYoutubeLinks = async (req, res) => {
  try {
    const { YouTubeLink, platform } = req.body;
    console.log(req.body, "body", req.file);

    const imageUplode = await uploadCloudinary(req.file.path);
    console.log("imageUplode", imageUplode);

    const newLink = new YouTube({
      YouTubeLink,
      platform,
      thumbnail: imageUplode.url,
    });
    console.log(newLink, "newLink");
    await newLink.save();
    res.status(200).json({ link: newLink });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error.message });
  }
};
export const showWebYoutubeLinks = async (req, res) => {
  try {
    const allLinks = await YouTube.find({ platform: "web" });
    console.log(allLinks);
    res.status(200).json({ links: allLinks });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateYoutubeLink = async (req, res) => {
  try {
    const { id } = req.params;
    const { YouTubeLink, platform, thumbnail } = req.body;
    console.log(id, "updated id");
    const islink = await YouTube.findById({ _id: id });
    console.log(islink, "link avelable");

    if (!islink) {
      return res.status(404).json({ message: "link is not avelable" });
    }
    const updatedYoutubeLink = await YouTube.findByIdAndUpdate(
      islink,
      { YouTubeLink, platform, thumbnail },
      { new: true } // Returns the updated document
    );

    console.log(updatedYoutubeLink, "show updated data");

    res.status(200).json({
      message: "Youtube link update sucessafully",
      updatedYoutubeLink,
    });
  } catch (error) {
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
