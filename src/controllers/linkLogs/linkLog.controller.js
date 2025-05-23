import LinkLog from "../../models/LinkLogs/LinkLogCard.model.js";
import DeviceToken from "../../models/notification/deviceToken.model.js";
import Card from "../../models/Card.model.js";

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
      { $unwind: "$clicks" }, // unwind clicks array
      {
        $group: {
          _id: {
            userId: "$userId",
            userName: "$userName",
            userEmail: "$userEmail",
            userPhone: "$userPhone",
            cardId: "$clicks.cardId",
            cardName: "$clicks.cardName",
          },
          clickCount: { $sum: "$clicks.clickCount" },
          clickTimes: { $push: "$clicks.clickTimes" },
        },
      },
      {
        $sort: {
          "_id.userName": 1,
          "_id.cardName": 1,
        },
      },
    ]);

    // Flatten clickTimes array because each clickTimes is an array itself
    const results = logs.map((log) => {
      const flattenedTimes = log.clickTimes.flat();
      return {
        userId: log._id.userId,
        userName: log._id.userName,
        userEmail: log._id.userEmail,
        userPhone: log._id.userPhone,
        cardId: log._id.cardId,
        cardName: log._id.cardName,
        clickCount: log.clickCount,
        clickTimes: flattenedTimes.map((ts) =>
          new Date(ts).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
        ),
      };
    });

    return res.status(200).json({ data: results });
  } catch (error) {
    console.error("Error displaying link logs:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};
