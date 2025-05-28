import LinkLog from "../../models/LinkLogs/LinkLogCard.model.js";
import DeviceToken from "../../models/notification/deviceToken.model.js";
import Card from "../../models/Card.model.js";
import CardClick from "../../models/LinkLogs/cardClickSchema.js";

// export const addLinkLog = async (req, res) => {
//   try {
//     const { userId, cardId } = req.body;

//     const user = await DeviceToken.findById(userId);
//     const card = await Card.findById(cardId);

//     if (!user || !card) {
//       return res.status(404).json({ message: "User or Card not found." });
//     }

//     const existingLog = await LinkLog.findOne({ userId });

//     const istTime = new Date().toLocaleString("en-US", {
//       timeZone: "Asia/Kolkata",
//     });
//     const currentISTDate = new Date(istTime);

//     if (!existingLog) {
//       // Create new log document for user
//       const newLog = new LinkLog({
//         userId: user._id,
//         userName: user.username,
//         userPhone: user.phone,
//         userEmail: user.email,
//         clicks: [
//           {
//             cardId: card._id,
//             cardName: card.name,
//             clickTimes: [currentISTDate],
//             clickCount: 1,
//           },
//         ],
//       });
//       await newLog.save();
//       return res
//         .status(201)
//         .json({ message: "New user log created", log: newLog });
//     }

//     // User already has a log
//     const cardLog = existingLog.clicks.find(
//       (click) => click.cardId.toString() === card._id.toString()
//     );

//     if (cardLog) {
//       // Already clicked this card — update it
//       cardLog.clickTimes.push(currentISTDate);
//       cardLog.clickCount += 1;
//     } else {
//       // New card for this user
//       existingLog.clicks.push({
//         cardId: card._id,
//         cardName: card.name,
//         clickTimes: [currentISTDate],
//         clickCount: 1,
//       });
//     }

//     await existingLog.save();
//     return res
//       .status(200)
//       .json({ message: "Click recorded", log: existingLog });
//   } catch (error) {
//     console.error("Error logging click:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

export const addLinkLog = async (req, res) => {
  try {
    const { userId, cardId, cardName } = req.body;
    console.log("🚀 ~ addLinkLog ~ req.body:", req.body);

    // Find user
    const user = await DeviceToken.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Find card if cardId is provided
    let card = null;
    if (cardId) {
      card = await Card.findById(cardId);
      if (!card) {
        return res.status(404).json({ message: "Card not found." });
      }
    }

    // Current IST time
    const istTime = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Kolkata",
    });
    const currentISTDate = new Date(istTime);

    // Find existing log for user
    let existingLog = await LinkLog.findOne({ userId });

    // Prepare clickData
    const clickData = {
      cardId: card ? card._id : null,
      cardName: card ? card.name : cardName || "No Card",
      clickTimes: [currentISTDate],
      clickCount: 1,
    };

    if (!existingLog) {
      // Create new log document for user
      const newLog = new LinkLog({
        userId: user._id,
        userName: user.username,
        userPhone: user.phone,
        userEmail: user.email,
        clicks: [clickData],
      });
      await newLog.save();
      return res
        .status(201)
        .json({ message: "New user log created", log: newLog });
    }

    // User already has log, check if this card or cardName already exists
    const cardLog = existingLog.clicks.find((click) => {
      if (card && click.cardId) {
        // Both have cardId, match by ObjectId
        return click.cardId.toString() === card._id.toString();
      } else if (!card && !click.cardId) {
        // Both have no cardId, match by cardName (case-insensitive)
        return (
          click.cardName.toLowerCase() === (cardName || "No Card").toLowerCase()
        );
      }
      return false;
    });

    if (cardLog) {
      // Update existing click record
      cardLog.clickTimes.push(currentISTDate);
      cardLog.clickCount += 1;
    } else {
      // Add new click record
      existingLog.clicks.push(clickData);
    }

    await existingLog.save();

    return res
      .status(200)
      .json({ message: "Click recorded", log: existingLog });
  } catch (error) {
    console.error("Error logging click:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const displayLinkLog = async (req, res) => {
  try {
    const logs = await LinkLog.aggregate([
      { $unwind: "$clicks" },
      { $unwind: "$clicks.clickTimes" },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$clicks.clickTimes",
                timezone: "Asia/Kolkata", // 👈 Indian Time
              },
            },
            userEmail: "$userEmail",
            cardName: "$clicks.cardName",
          },
          clickTimes: { $push: "$clicks.clickTimes" },
          dailyClickCount: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.date": -1,
          "_id.userEmail": 1,
          "_id.cardName": 1,
        },
      },
    ]);

    const results = logs.map((log) => ({
      date: log._id.date,
      userEmail: log._id.userEmail,
      cardName: log._id.cardName,
      dailyClickCount: log.dailyClickCount,
      clickTimes: log.clickTimes,
    }));

    return res.status(200).json({ data: results });
  } catch (error) {
    console.error("Error displaying link logs:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
// export const addHomeLinkLog = async (req, res) => {
//   try {
//     const { userId, cardId, cardName } = req.body;
//     console.log("🚀 ~ addLinkLog ~ req.body:", req.body);

//     // Find user
//     const user = await DeviceToken.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     // Find card if cardId is provided
//     let card = null;
//     if (cardId) {
//       card = await Card.findById(cardId);
//       if (!card) {
//         return res.status(404).json({ message: "Card not found." });
//       }
//     }

//     // Current IST time
//     const istTime = new Date().toLocaleString("en-US", {
//       timeZone: "Asia/Kolkata",
//     });
//     const currentISTDate = new Date(istTime);

//     // Find existing log for user
//     let existingLog = await LinkLog.findOne({ userId });

//     // Prepare clickData
//     const clickData = {
//       cardId: card ? card._id : null,
//       cardName: card ? card.name : cardName || "No Card",
//       clickTimes: [currentISTDate],
//       clickCount: 1,
//     };

//     if (!existingLog) {
//       // Create new log document for user
//       const newLog = new LinkLog({
//         userId: user._id,
//         userName: user.username,
//         userPhone: user.phone,
//         userEmail: user.email,
//         clicks: [clickData],
//       });
//       await newLog.save();
//       return res
//         .status(201)
//         .json({ message: "New user log created", log: newLog });
//     }

//     // User already has log, check if this card or cardName already exists
//     const cardLog = existingLog.clicks.find((click) => {
//       if (card && click.cardId) {
//         // Both have cardId, match by ObjectId
//         return click.cardId.toString() === card._id.toString();
//       } else if (!card && !click.cardId) {
//         // Both have no cardId, match by cardName (case-insensitive)
//         return (
//           click.cardName.toLowerCase() === (cardName || "No Card").toLowerCase()
//         );
//       }
//       return false;
//     });

//     if (cardLog) {
//       // Update existing click record
//       cardLog.clickTimes.push(currentISTDate);
//       cardLog.clickCount += 1;
//     } else {
//       // Add new click record
//       existingLog.clicks.push(clickData);
//     }

//     await existingLog.save();

//     return res
//       .status(200)
//       .json({ message: "Click recorded", log: existingLog });
//   } catch (error) {
//     console.error("Error logging click:", error);
//     return res
//       .status(500)
//       .json({ message: "Server error", error: error.message });
//   }
// };

export const addHomeLinkLog = async (req, res) => {
  const { cardId, userId } = req.body;
  console.log("🚀 ~ addHomeLinkLog ~ req.body:", req.body);

  try {
    await CardClick.create({
      card: cardId,
      user: userId,
    });

    res.status(200).json({ message: "Click logged" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to log click" });
  }
};

export const displayHomeLinkLog = async (req, res) => {
  try {
    const stats = await CardClick.aggregate([
      // Group by card, user, and date (to remove multiple clicks per user/day)
      {
        $group: {
          _id: {
            card: "$card",
            user: "$user",
            year: { $year: "$clickedAt" },
            month: { $month: "$clickedAt" },
            day: { $dayOfMonth: "$clickedAt" },
          },
          clickedAt: { $first: "$clickedAt" }
        }
      },
      // Group by card and date again to gather users per day
      {
        $group: {
          _id: {
            card: "$_id.card",
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day"
          },
          users: { $addToSet: "$_id.user" },
          date: { $first: "$clickedAt" }
        }
      },
      // Lookup card details
      {
        $lookup: {
          from: "cards",
          localField: "_id.card",
          foreignField: "_id",
          as: "cardDetails"
        }
      },
      { $unwind: "$cardDetails" },

      // Lookup user details (emails)
      {
        $lookup: {
          from: "devicetokens",
          localField: "users",
          foreignField: "_id",
          as: "userDetails"
        }
      },

      {
        $project: {
          _id: 0,
          cardId: "$cardDetails._id",
          cardName: "$cardDetails.name",
          headline: "$cardDetails.headline",
          date: {
            $dateFromParts: {
              year: "$_id.year",
              month: "$_id.month",
              day: "$_id.day"
            }
          },
          count: { $size: "$users" },
          userEmails: "$userDetails.email"
        }
      },
      {
        $sort: { date: -1 }
      }
    ]);

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch card daily click stats" });
  }
};
