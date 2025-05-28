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

export const displayLinkLog = async (req, res) => {
  try {
    const clicks = await CardClick.aggregate([
      {
        $project: {
          card: 1,
          user: 1,
          clickedAt: 1,
          dateOnly: {
            $dateToString: { format: "%Y-%m-%d", date: "$clickedAt" },
          },
          timeOnly: {
            $dateToString: { format: "%H:%M:%S", date: "$clickedAt" },
          },
        },
      },
      {
        $group: {
          _id: {
            card: "$card",
            user: "$user",
            date: "$dateOnly",
          },
          times: { $push: "$timeOnly" },
          clickCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "cards",
          localField: "_id.card",
          foreignField: "_id",
          as: "cardDetails",
        },
      },
      {
        $lookup: {
          from: "devicetokens",
          localField: "_id.user",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$cardDetails" },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 0,
          userEmail: "$userDetails.email",
          cardName: "$cardDetails.name",
          date: "$_id.date",
          clickCount: 1,
          times: 1,
        },
      },
      { $sort: { date: -1 } },
    ]);

    res.json(clicks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch click data" });
  }
};

export const addLinkLog = async (req, res) => {
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
          clickedAt: { $first: "$clickedAt" },
        },
      },
      // Group by card and date again to gather users per day
      {
        $group: {
          _id: {
            card: "$_id.card",
            year: "$_id.year",
            month: "$_id.month",
            day: "$_id.day",
          },
          users: { $addToSet: "$_id.user" },
          date: { $first: "$clickedAt" },
        },
      },
      // Lookup card details
      {
        $lookup: {
          from: "cards",
          localField: "_id.card",
          foreignField: "_id",
          as: "cardDetails",
        },
      },
      { $unwind: "$cardDetails" },

      // Lookup user details (emails)
      {
        $lookup: {
          from: "devicetokens",
          localField: "users",
          foreignField: "_id",
          as: "userDetails",
        },
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
              day: "$_id.day",
            },
          },
          count: { $size: "$users" },
          userEmails: "$userDetails.email",
        },
      },
      {
        $sort: { date: -1 },
      },
    ]);

    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch card daily click stats" });
  }
};
