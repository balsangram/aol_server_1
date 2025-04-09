import LiveLink from "../models/LiveLink.js";
import LiveDateTime from "../models/LiveDateTiem.js";

export const displayLiveLink = async (req, res) => {
  try {
    const live = await LiveLink.find();

    if (!live || live.length === 0) {
      return res
        .status(404)
        .json({ message: "No live links found.", data: [] });
    }

    res
      .status(200)
      .json({ message: "Live link fetched successfully.", data: live });
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

export const addLiveDateTime = async (req, res) => {
  try {
    console.log(req.body, "body");

    // Step 1: Delete existing entries
    await LiveDateTime.deleteMany({});

    // Step 2: Validate and add new entry
    const { date, time } = req.body;
    if (!date || !time) {
      return res.status(400).json({ message: "Date and Time are required" });
    }

    const newEntry = new LiveDateTime({ date, time });
    console.log(newEntry, "newEntry");

    const savedEntry = await newEntry.save();

    // Step 3: Respond to client
    res.status(200).json({
      message: "Live date and time added successfully",
      data: savedEntry,
    });
  } catch (error) {
    console.error("Error saving live date and time:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const displayLiveDateTime = async (req, res) => {
  try {
    const live = await LiveDateTime.find();

    if (!live || live.length === 0) {
      return res.status(404).json({
        message: "No live date/time found.",
        data: [],
      });
    }

    res.status(200).json({
      message: "Live date/time fetched successfully.",
      data: live,
    });
  } catch (error) {
    console.error("Error fetching live date/time:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
