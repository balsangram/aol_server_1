// import admin from "firebase-admin";
// import { serviceAccount } from "./art-of-living-1b75a-firebase-adminsdk-fbsvc-a08df784cc.js";

// // const serviceAccount = require("./art-of-living-1b75a-firebase-adminsdk-fbsvc-a08df784cc");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// export default admin;

// Server-side (Node.js) code to send FCM notifications to both macOS and Windows devices
import admin from "firebase-admin";

// Initialize Firebase Admin SDK with default credentials
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});

// Send a notification
const sendNotification = async () => {
  const message = {
    notification: {
      title: "New Notification",
      body: "This is a test notification.",
    },
    tokens: [
      "macOS_device_token", // Replace with actual device tokens
      "windows_device_token",
    ],
  };

  try {
    const response = await admin.messaging().sendMulticast(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.error("Error sending message:", error);
  }
};

// Call the sendNotification function
sendNotification();
