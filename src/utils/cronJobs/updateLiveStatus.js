// // import { CronJob } from "cron";
// // import LiveLink from "../../models/LiveLink.js"; // Include .js if using native ES modules

// // // console.log("🚀 Cron job file loaded...");

// // export const job = new CronJob("0 * * * * *", async () => {
// //   const now = new Date();
// //   // console.log("Local time:", now.toLocaleString());
// //   // console.log("UTC time:", now.toISOString());

// //   // console.log("⏰ Running cron job at:", now.toLocaleString());

// //   try {
// //     const updated = await LiveLink.updateMany(
// //       {
// //         isLive: false,
// //         liveTime: { $lte: now },
// //       },
// //       { isLive: true }
// //     );
// //     // console.log("🚀 ~ job ~ updated:", updated);
// //     // console.log("🚀 ~ job ~ LiveLink.updateMany:", LiveLink.updateMany);

// //     // console.log("🚀 ~ job ~ updated:", updated.modifiedCount);
// //     if (updated.modifiedCount > 0) {
// //       console.log(
// //         `✅ Updated ${updated.modifiedCount} live link(s) to isLive: true`
// //       );
// //     } else {
// //       console.log("🔍 No updates needed at this time.");
// //     }
// //   } catch (err) {
// //     console.error("❌ Error updating live link status:", err);
// //   }
// // });
// // ==================
// // import { CronJob } from "cron";
// // import Notification from "../../models/notification/Notification.model.js"; // Adjust path to your Notification model
// // import admin from "firebase-admin"; // Assuming Firebase Admin is initialized

// // console.log("🚀 Notification cron job file loaded...");

// // export const notificationJob = new CronJob("0 * * * * *", async () => {
// //   const now = new Date();
// //   console.log("⏰ Running notification cron job at:", now.toLocaleString());

// //   try {
// //     // Find unsent notifications where NotificationTime is in the past
// //     const notifications = await Notification.find({
// //       sent: false,
// //       NotificationTime: { $lte: now },
// //     });

// //     console.log(`🔍 Found ${notifications.length} notification(s) to send`);

// //     for (const notification of notifications) {
// //       const { title, body } = notification;

// //       const message = {
// //         topic: "all",
// //         notification: {
// //           title,
// //           body,
// //         },
// //         android: {
// //           priority: "high",
// //         },
// //         apns: {
// //           payload: {
// //             aps: {
// //               sound: "default",
// //               contentAvailable: true,
// //             },
// //           },
// //         },
// //         webpush: {
// //           notification: {
// //             title,
// //             body,
// //             icon: "icon.png",
// //           },
// //           fcmOptions: {
// //             link: "https://yourwebsite.com",
// //           },
// //         },
// //       };

// //       // Send the notification
// //       const response = await admin.messaging().send(message);
// //       console.log("✅ Successfully sent notification:", response);

// //       // Mark notification as sent
// //       notification.sent = true;
// //       await notification.save();
// //     }

// //     if (notifications.length > 0) {
// //       console.log(`✅ Sent ${notifications.length} notification(s)`);
// //     } else {
// //       console.log("🔍 No notifications to send at this time.");
// //     }
// //   } catch (error) {
// //     console.error("❌ Error in notification cron job:", error);
// //   }
// // });
// // =================
// // import { CronJob } from "cron";
// // import Notification from "../../models/notification/Notification.model.js"; // Adjust path to your Notification model
// // import admin from "firebase-admin"; // Assuming Firebase Admin is initialized

// // console.log("🚀 Notification cron job file loaded...");

// // export const notificationJob = new CronJob("0 * * * * *", async () => {
// //   const now = new Date();
// //   console.log("⏰ Running notification cron job at:", now.toLocaleString());

// //   try {
// //     const notifications = await Notification.find({
// //       sent: false,
// //       NotificationTime: { $lte: now },
// //     }).populate("deviceTokens");

// //     console.log(`🔍 Found ${notifications.length} notification(s) to send`);

// //     for (const notification of notifications) {
// //       const { title, body, deviceTokens, groupName } = notification;

// //       // Extract tokens
// //       const tokens = deviceTokens?.map((dt) => dt.token).filter(Boolean);

// //       if (!tokens || tokens.length === 0) {
// //         console.warn(`⚠️ No valid device tokens for notification: ${title}`);
// //         continue;
// //       }

// //       const messageTemplate = {
// //         notification: { title, body },
// //         android: { priority: "high" },
// //         apns: {
// //           payload: {
// //             aps: {
// //               sound: "default",
// //               contentAvailable: true,
// //             },
// //           },
// //         },
// //         webpush: {
// //           notification: { title, body, icon: "icon.png" },
// //           fcmOptions: { link: "https://yourwebsite.com" },
// //         },
// //       };

// //       let successCount = 0;
// //       let failureCount = 0;

// //       for (const token of tokens) {
// //         try {
// //           const response = await admin.messaging().send({
// //             ...messageTemplate,
// //             token,
// //           });
// //           console.log("✅ Sent to token:", token);
// //           successCount++;
// //         } catch (err) {
// //           console.error("❌ Error sending to token:", token, err.message);
// //           failureCount++;
// //         }
// //       }

// //       notification.sent = true;
// //       await notification.save();

// //       console.log(
// //         `📦 Notification for '${
// //           groupName || "custom"
// //         }': ${successCount} succeeded, ${failureCount} failed.`
// //       );
// //     }

// //     if (notifications.length === 0) {
// //       console.log("🔍 No notifications to send at this time.");
// //     }
// //   } catch (error) {
// //     console.error("❌ Error in notification cron job:", error);
// //   }
// // });
// import { CronJob } from "cron";
// import Notification from "../../models/notification/Notification.model.js";
// import admin from "firebase-admin";
// import mongoose from "mongoose";

// // Initialize Firebase with environment variables
// if (!admin.apps.length) {
//   try {
//     admin.initializeApp({
//       credential: admin.credential.cert(
//         JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}")
//       ),
//     });
//   } catch (error) {
//     console.error("Firebase initialization failed:", error);
//     process.exit(1);
//   }
// }

// console.log("🚀 Notification cron job file loaded...");

// // Changed to every minute for production; adjust as needed
// export const notificationJob = new CronJob("* * * * *", async () => {
//   const now = new Date();
//   const nowUTC = new Date(now.toUTCString());
//   const istFormatter = new Intl.DateTimeFormat("en-IN", {
//     timeZone: "Asia/Kolkata",
//     year: "numeric",
//     month: "2-digit",
//     day: "2-digit",
//     hour: "2-digit",
//     minute: "2-digit",
//     second: "2-digit",
//   });

//   console.log(
//     "⏰ Running notification cron job at (IST):",
//     istFormatter.format(now),
//     "UTC:",
//     nowUTC.toISOString()
//   );

//   try {
//     const notifications = await Notification.find({
//       sent: false,
//       NotificationTime: { $lte: nowUTC },
//     }).populate({
//       path: "deviceTokens",
//       select: "token",
//     });

//     console.log(`🔍 Found ${notifications.length} notification(s) to send`);

//     for (const notification of notifications) {
//       const { title, body, deviceTokens, groupName } = notification;

//       console.log(
//         `📅 Processing notification '${title}' scheduled for (IST):`,
//         istFormatter.format(notification.NotificationTime),
//         "UTC:",
//         notification.NotificationTime.toISOString()
//       );

//       const tokens = deviceTokens?.map((dt) => dt.token).filter(Boolean) || [];

//       if (!tokens.length) {
//         console.warn(`⚠️ No valid device tokens for notification: ${title}`);
//         notification.sent = true;
//         await notification.save();
//         console.log(`📦 Marked notification '${title}' as sent (no tokens).`);
//         continue;
//       }

//       const messageTemplate = {
//         notification: { title, body },
//         android: { priority: "high" },
//         apns: {
//           payload: { aps: { sound: "default", contentAvailable: true } },
//         },
//         webpush: {
//           notification: {
//             title,
//             body,
//             icon: process.env.NOTIFICATION_ICON || "icon.png",
//           },
//           fcmOptions: {
//             link: process.env.WEBSITE_URL || "https://yourwebsite.com",
//           },
//         },
//         tokens,
//       };

//       let successCount = 0;
//       let failureCount = 0;

//       try {
//         const response = await admin.messaging().sendMulticast(messageTemplate);
//         successCount = response.successCount;
//         failureCount = response.failureCount;

//         // Collect invalid tokens for bulk deletion
//         const invalidTokens = response.responses
//           .map((res, index) =>
//             res.error?.code === "messaging/registration-token-not-registered"
//               ? tokens[index]
//               : null
//           )
//           .filter(Boolean);

//         if (invalidTokens.length) {
//           console.warn(`🗑️ Removing ${invalidTokens.length} invalid token(s)`);
//           await mongoose
//             .model("DeviceToken")
//             .deleteMany({ token: { $in: invalidTokens } });
//         }

//         console.log(
//           `📦 Notification for '${
//             groupName || "custom"
//           }': ${successCount} succeeded, ${failureCount} failed`
//         );
//       } catch (err) {
//         console.error(`❌ Error sending notification '${title}':`, err.message);
//         failureCount = tokens.length;
//       }

//       notification.sent = true;
//       notification.successCount = successCount;
//       notification.failureCount = failureCount;
//       await notification.save();
//     }

//     if (!notifications.length) {
//       console.log("🔍 No notifications to send at this time.");
//     }
//   } catch (error) {
//     console.error("❌ Error in notification cron job:", error.message);
//   }
// });

// export const sendNotificationToAll = async (req, res) => {
//   const { title, body, NotificationTime } = req.body;

//   if (!title || !body || !NotificationTime) {
//     return res
//       .status(400)
//       .json({ message: "Title, body, and NotificationTime are required" });
//   }

//   try {
//     const notificationDate = new Date(NotificationTime);
//     if (isNaN(notificationDate)) {
//       return res
//         .status(400)
//         .json({ message: "Invalid NotificationTime format" });
//     }

//     const istFormatter = new Intl.DateTimeFormat("en-IN", {
//       timeZone: "Asia/Kolkata",
//       year: "numeric",
//       month: "2-digit",
//       day: "2-digit",
//       hour: "2-digit",
//       minute: "2-digit",
//       second: "2-digit",
//     });

//     const scheduledIST = istFormatter.format(notificationDate);
//     const currentIST = istFormatter.format(new Date());

//     const DeviceToken = mongoose.model("DeviceToken");
//     const deviceTokens = await DeviceToken.find().select("_id");

//     const saveNotification = new Notification({
//       title,
//       body,
//       NotificationTime: notificationDate,
//       sent: false,
//       deviceTokens: deviceTokens.map((dt) => dt._id),
//       createdAt: new Date(),
//     });

//     await saveNotification.save();

//     console.log(
//       `✅ Notification '${title}' scheduled for (IST): ${scheduledIST}, UTC: ${notificationDate.toISOString()}`
//     );

//     res.status(200).json({
//       message: "Notification scheduled successfully",
//       scheduledTimeIST: scheduledIST,
//       currentTimeIST: currentIST,
//       notification: saveNotification,
//     });
//   } catch (error) {
//     console.error("❌ Error scheduling notification:", error.message);
//     res.status(500).json({
//       message: "Failed to schedule notification",
//       error: error.message,
//     });
//   }
// };

// // Graceful shutdown
// process.on("SIGTERM", () => {
//   console.log("🛑 Stopping notification cron job...");
//   notificationJob.stop();
//   admin
//     .app()
//     .delete()
//     .catch((err) => console.error("Error deleting Firebase app:", err));
//   process.exit(0);
// });
