import LiveLink from "../models/LiveLink.js";
import LiveDateTime from "../models/LiveDateTiem.js";
import LiveLinkHistory from "../models/history/historyLiveLink.model.js";
import LiveNewUpdate from "../models/LiveNewUpdate.model.js";
import HistoryLiveLink from "../models/history/historyLiveLink.model.js";
// import { messaging } from "firebase-admin";
import { CronJob } from "cron";
// export const displayLiveLink = async (req, res) => {
//   try {
//     const live = await LiveLink.find();

//     if (!live || live.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No live links found.", data: [] });
//     }

//     res
//       .status(200)
//       .json({ message: "Live link fetched successfully.", data: live });
//   } catch (error) {
//     console.error("Error fetching live links:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

export const displayLiveLink = async (req, res) => {
  try {
    const liveLinks = await LiveLink.find({ isLive: true });
    res.status(200).json({ data: liveLinks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// export const addLiveLink = async (req, res) => {
//   try {
//     console.log(req.body, "body");

//     // Step 1: Delete existing entries
//     const existingLinks = await LiveLink.find();
//     if (existingLinks.length > 0) {
//       await LiveLink.deleteMany({});
//     }

//     // Step 2: Validate and add new link
//     const { link } = req.body;
//     if (!link) {
//       return res.status(400).json({ message: "Link is required" });
//     }

//     const newLink = new LiveLink({ link });
//     console.log(newLink, "newLink");

//     const savedLink = await newLink.save();

//     // Step 3: Respond to client
//     res.status(200).json({
//       message: "Link added successfully",
//       data: savedLink,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const addLiveLink = async (req, res) => {
  try {
    console.log(req.body, "body");

    // ✅ Step 1: Fetch all existing live links before deletion
    const existingLinks = await LiveLink.find({});

    // ✅ Step 2: Save to history collection if any
    if (existingLinks.length > 0) {
      await HistoryLiveLink.insertMany(
        existingLinks.map((link) => ({
          link: link.link,
          liveTime: link.liveTime,
          isLive: link.isLive,
          createdAt: link.createdAt || new Date(), // assuming timestamps
        }))
      );
    }

    // ✅ Step 3: Delete all existing live links
    await LiveLink.deleteMany({});

    // Step 4: Extract link and liveTime
    const { link, liveTime } = req.body;

    if (!link || !liveTime) {
      return res
        .status(400)
        .json({ message: "Link and liveTime are required" });
    }

    const liveDate = new Date(liveTime);
    if (isNaN(liveDate.getTime())) {
      return res.status(400).json({ message: "Invalid liveTime format" });
    }

    if (liveDate <= new Date()) {
      return res
        .status(400)
        .json({ message: "liveTime must be in the future" });
    }

    // Step 5: Save new LiveLink with isLive = false
    const newLink = new LiveLink({
      link,
      liveTime: liveDate,
      isLive: false,
    });
    const savedLink = await newLink.save();

    // Step 6: Schedule cron job to update isLive
    const job = new CronJob(liveDate, async () => {
      try {
        const updated = await LiveLink.findByIdAndUpdate(
          savedLink._id,
          { isLive: true },
          { new: true }
        );
        console.log("Live link is now live:", updated);
      } catch (err) {
        console.error("Error updating live link status:", err);
      }
    });
    job.start();

    // Step 7: Convert time to IST
    const liveTimeIST = liveDate.toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const currentTimeIST = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });

    // Step 8: Respond
    res.status(200).json({
      message: "Link added and scheduled successfully",
      data: savedLink,
      liveTimeIST,
      currentTimeIST,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// export const addLiveLink = async (req, res) => {
//   try {
//     console.log(req.body, "body");

//     // Step 1: Delete all existing live links (only one allowed at a time)
//     await LiveLink.deleteMany({});

//     // Step 2: Extract link and liveTime
//     const { link, liveTime } = req.body;

//     if (!link || !liveTime) {
//       return res
//         .status(400)
//         .json({ message: "Link and liveTime are required" });
//     }

//     const liveDate = new Date(liveTime);
//     console.log("🚀 ~ addLiveLink ~ liveDate:", liveDate);
//     if (isNaN(liveDate.getTime())) {
//       return res.status(400).json({ message: "Invalid liveTime format" });
//     }

//     if (liveDate <= new Date()) {
//       return res
//         .status(400)
//         .json({ message: "liveTime must be in the future" });
//     }

//     // Step 3: Save new LiveLink with isLive = false
//     const newLink = new LiveLink({
//       link,
//       liveTime: liveDate,
//       isLive: false,
//     });
//     const savedLink = await newLink.save();

//     // Step 4: Schedule a cron job to update isLive when liveTime reached
//     const job = new CronJob(liveDate, async () => {
//       try {
//         const updated = await LiveLink.findByIdAndUpdate(
//           savedLink._id,
//           { isLive: true },
//           { new: true }
//         );
//         console.log("Live link is now live:", updated);
//       } catch (err) {
//         console.error("Error updating live link status:", err);
//       }
//     });

//     job.start();

//     // Step 5: Convert liveTime to IST for display
//     const liveTimeIST = liveDate.toLocaleString("en-US", {
//       timeZone: "Asia/Kolkata",
//     });

//     const currentTimeIST = new Date().toLocaleString("en-US", {
//       timeZone: "Asia/Kolkata",
//     });

//     // Step 6: Respond
//     res.status(200).json({
//       message: "Link added and scheduled successfully",
//       data: savedLink,
//       liveTimeIST,
//       currentTimeIST,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const stopLiveLink = async (req, res) => {
  try {
    const existingLinks = await LiveLink.find();

    if (!existingLinks.length) {
      return res.status(404).json({ message: "No live link found to stop." });
    }

    // Step 1: Prepare history entries
    const historyEntries = existingLinks.map((link) => ({
      ...link.toObject(),
      stoppedAt: new Date(), // optional: track when it was stopped
    }));

    // Step 2: Save to LiveLinkHistory
    await LiveLinkHistory.insertMany(historyEntries);

    // Step 3: Delete from LiveLink collection
    await LiveLink.deleteMany();

    res
      .status(200)
      .json({ message: "Live links stopped and saved to history." });
  } catch (error) {
    console.error("Error stopping live link:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const addLiveNewUpdate = async (req, res) => {
  try {
    console.log(req.body, "body");

    // Step 1: Delete existing entries
    await LiveNewUpdate.deleteMany({});

    // Step 2: Validate and add new entry
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Content is required" });
    }

    const newEntry = new LiveNewUpdate({ content });
    console.log(newEntry, "newEntry");

    const savedEntry = await newEntry.save();

    // Step 3: Respond to client
    res.status(200).json({
      message: "Live new update added successfully",
      data: savedEntry,
    });
  } catch (error) {
    console.error("Error saving live new update:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const displayLiveNewUpdates = async (req, res) => {
  try {
    const updates = await LiveNewUpdate.find().sort({ createdAt: -1 });

    if (!updates || updates.length === 0) {
      return res.status(200).json({
        message: "No live updates found.",
        data: [],
        // data: [{ content: "" }],
      });
    }

    res.status(200).json({
      message: "Live updates fetched successfully.",
      data: updates,
    });
  } catch (error) {
    console.error("Error fetching live updates:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const clearnewLive = async (req, res) => {
  try {
    const count = await LiveNewUpdate.countDocuments();
    console.log(count, "count");

    if (count === 0) {
      return res.status(404).json({ message: "No live link updates found." });
    }

    await LiveNewUpdate.deleteMany();

    res
      .status(200)
      .json({ message: "All live link updates deleted successfully." });
  } catch (error) {
    console.error("Error deleting live link updates:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

// export const addLiveDateTime = async (req, res) => {
//   try {
//     console.log(req.body, "body");

//     // Step 1: Delete existing entries
//     await LiveDateTime.deleteMany({});

//     // Step 2: Validate and add new entry
//     const { date, time } = req.body;
//     if (!date || !time) {
//       return res.status(400).json({ message: "Date and Time are required" });
//     }

//     const newEntry = new LiveDateTime({ date, time });
//     console.log(newEntry, "newEntry");

//     const savedEntry = await newEntry.save();

//     // Step 3: Respond to client
//     res.status(200).json({
//       message: "Live date and time added successfully",
//       data: savedEntry,
//     });
//   } catch (error) {
//     console.error("Error saving live date and time:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

// export const displayLiveDateTime = async (req, res) => {
//   try {
//     const live = await LiveDateTime.find();

//     if (!live || live.length === 0) {
//       return res.status(404).json({
//         message: "No live date/time found.",
//         data: [],
//       });
//     }

//     res.status(200).json({
//       message: "Live date/time fetched successfully.",
//       data: live,
//     });
//   } catch (error) {
//     console.error("Error fetching live date/time:", error);
//     res.status(500).json({ message: "Internal server error." });
//   }
// };

// display all live history

export const displayHistoryOfLive = async (req, res) => {
  try {
    const historyEntries = await LiveLinkHistory.find().sort({ stoppedAt: -1 });

    const formattedEntries = historyEntries.map((entry) => {
      const stoppedAt = new Date(entry.stoppedAt || entry.createdAt); // fallback for older data
      return {
        ...entry.toObject(),
        date: stoppedAt.toLocaleDateString(), // e.g., "4/23/2025"
        time: stoppedAt.toLocaleTimeString(), // e.g., "10:30:15 AM"
      };
    });

    res.status(200).json({
      message: "Previous lives are:",
      data: formattedEntries,
    });
  } catch (error) {
    console.error("Error fetching live history:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
