// import { CronJob } from "cron";
// import Notification from "../../models/notification/Notification.model.js";
// import DeviceToken from "../../models/notification/deviceToken.model.js";

// // Placeholder function to send push notifications (e.g., via Firebase)
// const sendPushNotification = async (deviceToken, title, body) => {
//   try {
//     // Implement your push notification logic here (e.g., Firebase Cloud Messaging)
//     console.log(`Sending notification to ${deviceToken}: ${title} - ${body}`);
//     // Example: await admin.messaging().send({ token: deviceToken, notification: { title, body } });
//     return true;
//   } catch (error) {
//     console.error(`Error sending notification to ${deviceToken}:`, error);
//     return false;
//   }
// };

// // CronJob to check and send notifications
// export const jobNotification = new CronJob(
//   "0 * * * * *", // Runs every minute for better precision
//   async function () {
//     try {
//       const currentTime = new Date();
//       console.log(`Checking notifications at ${currentTime.toISOString()}`);

//       // Find notifications that are due and not sent
//       const notifications = await Notification.find({
//         NotificationTime: { $lte: currentTime },
//         sent: false,
//       }).populate("deviceTokens");

//       for (const notification of notifications) {
//         const { title, body, deviceTokens } = notification;

//         // Send notification to each device token
//         for (const device of deviceTokens) {
//           const success = await sendPushNotification(device.token, title, body);
//           if (!success) {
//             console.error(`Failed to send notification to ${device.token}`);
//           }
//         }

//         // Mark notification as sent
//         notification.sent = true;
//         await notification.save();
//         console.log(`Notification ${notification._id} sent successfully`);
//       }
//     } catch (error) {
//       console.error("Error in notification cron job:", error);
//     }
//   },
//   null, // onComplete
//   true, // start
//   "Asia/Kolkata" // Use IST timezone
// );
