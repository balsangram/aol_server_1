// import admin from "../../firebase.js";
// import deviceToken from "../models/deviceToken.model.js";
// import Notification from "../models/Notification.model.js";

// export const sendNotificationToAll = async (req, res) => {
//   const { title, body } = req.body;
//   if (!title || !body) {
//     return res.status(400).json({ message: "fill all the requirement" });
//   }

//   const message = {
//     topic: "all",
//     notification: {
//       title,
//       body,
//     },
//     android: {
//       priority: "high",
//     },
//     apns: {
//       payload: {
//         aps: {
//           sound: "default",
//         },
//       },
//     },
//   };

//   try {
//     const saveNotification = new Notification({ title, body });
//     console.log(saveNotification, "saveNotification");
//     await saveNotification.save();
//     const response = await admin.messaging().send(message);
//     console.log("✅ Successfully sent message:", response);

//     res.status(200).json({
//       message: "Notification sent successfully to topic 'all'.",
//       firebaseResponse: response,
//     });
//   } catch (error) {
//     console.error("❌ Error sending message:", error);

//     res.status(500).json({
//       message: "Failed to send notification.",
//       error: error.message || error,
//     });
//   }
// };

// export const saveAndSubscribeToken = async (req, res) => {
//   const { token } = req.body;
//   console.log(token, "🚀 ~ saveAndSubscribeToken ~ response:", req.body);

//   // Validate input
//   if (!token || typeof token !== "string") {
//     return res.status(400).json({ message: "Valid device token is required." });
//   }

//   try {
//     // Subscribe token to "all" topic first
//     const response = await admin.messaging().subscribeToTopic(token, "all");

//     if (!response || response.failureCount > 0) {
//       const errorInfo =
//         response.errors?.[0]?.error ||
//         "Unknown error while subscribing to topic.";
//       console.log("FCM Subscription Error:");

//       return res.status(400).json({
//         message: "Failed to subscribe token to topic 'all'.",
//         error: errorInfo,
//       });
//     }

//     console.log("Token subscribed to 'all' topic 📡:", response);

//     // Save token to DB if it doesn't already exist
//     const existing = await deviceToken.findOne({ token });

//     if (!existing) {
//       await deviceToken.create({ token });
//       console.log("Token saved to DB ✅");
//     } else {
//       console.log("Token already exists in DB 🔁");
//     }

//     // Success Response
//     res.status(200).json({
//       message: "Token saved and subscribed to topic 'all' successfully.",
//       firebaseResponse: response,
//     });
//   } catch (error) {
//     // Specific error handling
//     console.log("Error in saveAndSubscribeToken:", error);

//     // Handle Firebase errors
//     if (error.code && error.message) {
//       return res.status(500).json({
//         message: "Firebase error occurred while subscribing token.",
//         error: {
//           code: error.code,
//           message: error.message,
//         },
//       });
//     }

//     // Handle DB or unknown server errors
//     res.status(500).json({
//       message: "Internal server error occurred while processing token.",
//       error: error.message || "Unexpected error",
//     });
//   }
// };

import admin from "../../../firebase.js";
import DeviceToken from "../../models/notification/deviceToken.model.js";
import Notification from "../../models/notification/Notification.model.js";

export const sendNotificationToAll = async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ message: "Fill all the requirements" });
  }

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
          contentAvailable: true, // Make sure the notification wakes up the app (for background handling)
        },
      },
    },
    webpush: {
      notification: {
        title,
        body,
        icon: "icon.png", // Customize the icon for web push notifications
      },
      fcmOptions: {
        link: "https://yourwebsite.com", // Optional: link to open when the user clicks the notification
      },
    },
  };

  try {
    // Save the notification details to your DB
    const saveNotification = new Notification({ title, body });
    console.log(saveNotification, "saveNotification");
    await saveNotification.save();

    // Send the notification to all devices subscribed to the 'all' topic
    const response = await admin.messaging().send(message);
    console.log("✅ Successfully sent message:", response);

    res.status(200).json({
      message: "Notification sent successfully to topic 'all'.",
      firebaseResponse: response,
    });
  } catch (error) {
    console.error("❌ Error sending message:", error);

    res.status(500).json({
      message: "Failed to send notification.",
      error: error.message || error,
    });
  }
};

// send single notification

export const sendSingleNotification = async (req, res) => {
  const { title, body, selectedId } = req.body;

  if (!title || !body || !selectedId) {
    return res
      .status(400)
      .json({ message: "Title, body, and user ID are required." });
  }

  try {
    // Get device token
    const userTokenDoc = await DeviceToken.findById(selectedId);
    if (!userTokenDoc || !userTokenDoc.token) {
      return res.status(404).json({ message: "Device token not found." });
    }

    const payload = {
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

    // Send notification to the device
    const response = await admin
      .messaging()
      .sendToDevice(userTokenDoc.token, payload);
    console.log("✅ Notification sent:", response);

    res.status(200).json({
      message: "Notification sent successfully.",
      firebaseResponse: response,
    });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    res.status(500).json({
      message: "Failed to send notification.",
      error: error.message,
    });
  }
};

// send group notification

export const saveAndSubscribeToken = async (req, res) => {
  const { token, username, email, phone } = req.body;
  console.log("🚀 ~ saveAndSubscribeToken ~ userName:", username);
  console.log("🚀 ~ saveAndSubscribeToken ~ phone:", phone);
  console.log("🚀 ~ saveAndSubscribeToken ~ email:", email);
  console.log(token, "🚀 ~ saveAndSubscribeToken ~ response:", req.body);

  // Validate input
  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Valid device token is required." });
  }

  try {
    // Subscribe token to the 'all' topic first
    const response = await admin.messaging().subscribeToTopic(token, "all");

    console.log("🚀 ", username);
    if (!response || response.failureCount > 0) {
      const errorInfo =
        response.errors?.[0]?.error ||
        "Unknown error while subscribing to topic.";
      console.log("FCM Subscription Error:");

      return res.status(400).json({
        message: "Failed to subscribe token to topic 'all'.",
        error: errorInfo,
      });
    }

    console.log("Token subscribed to 'all' topic 📡:", response);

    // Save token to DB if it doesn't already exist
    const existing = await DeviceToken.findOne({ token });
    console.log("🚀888 ", username);
    if (!existing) {
      console.log(username, "userName");
      await DeviceToken.create({ token, username, phone, email });
      console.log("Token saved to DB ✅");
    } else {
      console.log("Token already exists in DB 🔁");
    }

    // Success Response
    res.status(200).json({
      message: "Token saved and subscribed to topic 'all' successfully.",
      firebaseResponse: response,
    });
  } catch (error) {
    // Specific error handling
    console.log("Error in saveAndSubscribeToken:", error);

    // Handle Firebase errors
    if (error.code && error.message) {
      return res.status(500).json({
        message: "Firebase error occurred while subscribing token.",
        error: {
          code: error.code,
          message: error.message,
        },
      });
    }

    // Handle DB or unknown server errors
    res.status(500).json({
      message: "Internal server error occurred while processing token.",
      error: error.message || "Unexpected error",
    });
  }
};

// export const saveAndSubscribeToken = async (req, res) => {
//   const { token, userName, email, phone } = req.body;
//   console.log(token, "🚀 ~ saveAndSubscribeToken ~ body:", req.body);

//   // Validate input
//   if (!token || typeof token !== "string") {
//     return res.status(400).json({ message: "Valid device token is required." });
//   }
//   if (!userName || !email || !phone) {
//     return res
//       .status(400)
//       .json({ message: "userName, email, and phone are required." });
//   }

//   try {
//     // Subscribe token to 'all' topic
//     const response = await admin.messaging().subscribeToTopic(token, "all");

//     if (!response || response.failureCount > 0) {
//       const errorInfo =
//         response.errors?.[0]?.error ||
//         "Unknown error while subscribing to topic.";
//       // console.log("FCM Subscription Error:", errorInfo);

//       return res.status(400).json({
//         message: "Failed to subscribe token to topic 'all'.",
//         error: errorInfo,
//       });
//     }

//     console.log("Token subscribed to 'all' topic 📡:", response);

//     // Save to DB if not already present
//     const existing = await DeviceToken.findOne({ token });

//     if (!existing) {
//       await DeviceToken.create({ token, userName, email, phone });
//       console.log("Token saved to DB ✅");
//     } else {
//       console.log("Token already exists in DB 🔁");
//     }

//     res.status(200).json({
//       message: "Token saved and subscribed to topic 'all' successfully.",
//       firebaseResponse: response,
//     });
//   } catch (error) {
//     console.error("Error in saveAndSubscribeToken:", error);

//     if (error.code && error.message) {
//       return res.status(500).json({
//         message: "Firebase error occurred while subscribing token.",
//         error: {
//           code: error.code,
//           message: error.message,
//         },
//       });
//     }

//     res.status(500).json({
//       message: "Internal server error occurred while processing token.",
//       error: error.message || "Unexpected error",
//     });
//   }
// };

export const displayAllNotification = async (req, res) => {
  try {
    const notifications = await Notification.find()
      .sort({ createdAt: -1 }) // Newest first
      .lean();

    // console.log("🚀 ~ displayAllNotification ~ notifications:", notifications);

    const formatted = notifications.map((n) => {
      const dateObj = new Date(n.createdAt);
      const date = dateObj.toLocaleDateString();
      const hours = dateObj.getHours().toString().padStart(2, "0");
      const minutes = dateObj.getMinutes().toString().padStart(2, "0");
      const time = `${hours}:${minutes}`;

      return {
        ...n,
        date,
        time,
      };
    });

    console.log("🚀 ~ formatted ~ formatted:", formatted);
    res.status(200).json(formatted);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// Better naming if you are counting device tokens
export const countDeviceTokens = async (req, res) => {
  try {
    const count = await DeviceToken.countDocuments(); // Count all device tokens
    res.status(200).json({ count });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// logout
export const logoutAndUnsubscribeToken = async (req, res) => {
  const { token } = req.body;
  console.log("🚀 ~ logoutAndUnsubscribeToken ~ token:", req.body);

  // Validate input
  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Valid device token is required." });
  }

  try {
    // Unsubscribe the token from 'all' topic
    const response = await admin.messaging().unsubscribeFromTopic(token, "all");

    if (!response || response.failureCount > 0) {
      const errorInfo =
        response.errors?.[0]?.error ||
        "Unknown error while unsubscribing from topic.";

      console.log("FCM Unsubscribe Error:", errorInfo);

      return res.status(400).json({
        message: "Failed to unsubscribe token from topic 'all'.",
        error: errorInfo,
      });
    }

    console.log("Token unsubscribed from 'all' topic ❌📡:", response);

    // Delete token from MongoDB
    const deletionResult = await deviceToken.deleteOne({ token });

    if (deletionResult.deletedCount === 0) {
      return res.status(404).json({ message: "Token not found in database." });
    }

    console.log("Token deleted from DB 🗑️");

    res.status(200).json({
      message: "Token unsubscribed and deleted successfully.",
      firebaseResponse: response,
    });
  } catch (error) {
    console.log("Error in logoutAndUnsubscribeToken:", error);

    res.status(500).json({
      message: "Internal server error occurred during logout.",
      error: error.message || "Unexpected error",
    });
  }
};

// display all user

export const displayUser = async (req, res) => {
  try {
    const devices = await DeviceToken.find();
    res.status(200).json({
      message: "Device tokens fetched successfully",
      data: devices,
    });
  } catch (error) {
    console.error("Error fetching device tokens:", error);
    res.status(500).json({ message: "Failed to fetch device tokens" });
  }
};
