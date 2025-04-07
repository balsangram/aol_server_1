import LiveLink from "../models/LiveLink.js";

export const displayLiveLink = async (req, res) => {
  try {
    const live = await LiveLink.find();

    if (!live || live.length === 0) {
      return res.status(404).json({ message: "No live links found." });
    }

    res
      .status(200)
      .json({ message: "Live links fetched successfully.", data: live });
  } catch (error) {
    console.error("Error fetching live links:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const addLiveLink = async (req, res) => {
  try {
    console.log(req.body, "body");

    // Step 1: Delete existing entries
    const existingLinks = await LiveLink.find();
    if (existingLinks.length > 0) {
      await LiveLink.deleteMany({});
    }

    // Step 2: Validate and add new link
    const { link } = req.body;
    if (!link) {
      return res.status(400).json({ message: "Link is required" });
    }

    const newLink = new LiveLink({ link });
    console.log(newLink, "newLink");

    const savedLink = await newLink.save();

    // Step 3: Respond to client
    res.status(200).json({
      message: "Link added successfully",
      data: savedLink,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const stopLiveLink = async (req, res) => {
  try {
    const existingLinks = await LiveLink.find();

    if (existingLinks.length > 0) {
      await LiveLink.deleteMany({});
      return res
        .status(200)
        .json({ message: "Live link stopped successfully." });
    } else {
      return res.status(404).json({ message: "No live link found to stop." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error." });
  }
};
