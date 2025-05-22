// import { CronJob } from "cron";
// import LiveLink from "../../models/LiveLink.js"; // Include .js if using native ES modules

// // console.log("🚀 Cron job file loaded...");

// export const job = new CronJob("0 * * * * *", async () => {
//   const now = new Date();
//   // console.log("Local time:", now.toLocaleString());
//   // console.log("UTC time:", now.toISOString());

//   // console.log("⏰ Running cron job at:", now.toLocaleString());

//   try {
//     const updated = await LiveLink.updateMany(
//       {
//         isLive: false,
//         liveTime: { $lte: now },
//       },
//       { isLive: true }
//     );
//     // console.log("🚀 ~ job ~ updated:", updated);
//     // console.log("🚀 ~ job ~ LiveLink.updateMany:", LiveLink.updateMany);

//     // console.log("🚀 ~ job ~ updated:", updated.modifiedCount);
//     if (updated.modifiedCount > 0) {
//       console.log(
//         `✅ Updated ${updated.modifiedCount} live link(s) to isLive: true`
//       );
//     } else {
//       console.log("🔍 No updates needed at this time.");
//     }
//   } catch (err) {
//     console.error("❌ Error updating live link status:", err);
//   }
// });
// ==================
import { CronJob } from "cron";
import Notification from "../../models/notification/Notification.model.js"; // Adjust path to your Notification model
import admin from "firebase-admin"; // Assuming Firebase Admin is initialized

console.log("🚀 Notification cron job file loaded...");

export const notificationJob = new CronJob("0 * * * * *", async () => {
  const now = new Date();
  console.log("⏰ Running notification cron job at:", now.toLocaleString());

  try {
    // Find unsent notifications where NotificationTime is in the past
    const notifications = await Notification.find({
      sent: false,
      NotificationTime: { $lte: now },
    });

    console.log(`🔍 Found ${notifications.length} notification(s) to send`);

    for (const notification of notifications) {
      const { title, body } = notification;

      const message = {
        topic: "all",
        notification: {
          title,
          body,
        },
        android: {
          priority: "high",
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              contentAvailable: true,
            },
          },
        },
        webpush: {
          notification: {
            title,
            body,
            icon: "icon.png",
          },
          fcmOptions: {
            link: "https://yourwebsite.com",
          },
        },
      };

      // Send the notification
      const response = await admin.messaging().send(message);
      console.log("✅ Successfully sent notification:", response);

      // Mark notification as sent
      notification.sent = true;
      await notification.save();
    }

    if (notifications.length > 0) {
      console.log(`✅ Sent ${notifications.length} notification(s)`);
    } else {
      console.log("🔍 No notifications to send at this time.");
    }
  } catch (error) {
    console.error("❌ Error in notification cron job:", error);
  }
});
