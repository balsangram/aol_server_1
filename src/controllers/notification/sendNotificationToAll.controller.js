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

import moment from "moment";
import admin from "../../../firebase.js";
import DeviceToken from "../../models/notification/deviceToken.model.js";
import Group from "../../models/notification/Group.model.js";
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

// export const sendGroupNotification = async (req, res) => {
//   try {
//     const { title, body, groupName } = req.body;
//     console.log("Request Body:", req.body);

//     // Validate input
//     if (!title || !body || !groupName) {
//       return res.status(400).json({
//         message: "Title, body, and groupName are required.",
//       });
//     }

//     // Get group and populate deviceTokens
//     const group = await Group.findOne({ groupName }).populate("deviceTokens");
//     if (!group) {
//       return res.status(404).json({
//         message: `Group '${groupName}' not found.`,
//       });
//     }

//     const tokens = group.deviceTokens
//       .filter((dt) => dt.token)
//       .map((dt) => dt.token);

//     if (tokens.length === 0) {
//       return res.status(404).json({
//         message: "No valid device tokens found in this group.",
//       });
//     }

//     // Create message object
//     const messageTemplate = {
//       notification: { title, body },
//       android: { priority: "high" },
//       apns: {
//         payload: {
//           aps: {
//             sound: "default",
//             "content-available": 1,
//           },
//         },
//       },
//       webpush: {
//         notification: { title, body, icon: "icon.png" },
//         fcmOptions: { link: "https://yourwebsite.com" },
//       },
//     };

//     // Send notifications one by one (or optimize using sendMulticast)
//     const results = [];
//     const errors = [];

//     for (const token of tokens) {
//       try {
//         const saveNotification = new Notification({ title, body });
//         console.log(saveNotification, "saveNotification");
//         await saveNotification.save();
//         const response = await admin.messaging().send({
//           ...messageTemplate,
//           token,
//         });
//         results.push({ token, success: true, response });
//       } catch (err) {
//         errors.push({ token, error: err.message });
//       }
//     }

//     const successCount = results.length;
//     const failureCount = errors.length;

//     console.log(`✅ Group Notification Result:`, {
//       successCount,
//       failureCount,
//     });

//     return res.status(200).json({
//       message: `Notifications sent to group '${groupName}': ${successCount} succeeded, ${failureCount} failed.`,
//       firebaseResponse: { successCount, failureCount, errors },
//     });
//   } catch (error) {
//     console.error("❌ Error:", error);
//     return res.status(500).json({
//       message: "Failed to send group notification.",
//       error: error.message || error,
//     });
//   }
// };

// send single notification

export const sendGroupNotification = async (req, res) => {
  try {
    const { title, body, groupName } = req.body;
    console.log("📦 Incoming Request:", req.body);

    // 🛡 Validate input
    if (!title || !body || !groupName) {
      return res.status(400).json({
        message: "Title, body, and groupName are required.",
      });
    }

    // 🔍 Find group and populate device tokens
    const group = await Group.findOne({ groupName }).populate("deviceTokens");

    if (!group) {
      return res.status(404).json({
        message: `Group '${groupName}' not found.`,
      });
    }

    // 🎯 Extract valid tokens
    const tokens = group.deviceTokens
      .filter((dt) => dt.token)
      .map((dt) => dt.token);

    if (tokens.length === 0) {
      return res.status(404).json({
        message: "No valid device tokens found in this group.",
      });
    }

    // 📝 Save notification to DB only once
    const savedNotification = new Notification({ title, body });
    await savedNotification.save();

    // 📤 Notification message template
    const messageTemplate = {
      notification: { title, body },
      android: { priority: "high" },
      apns: {
        payload: {
          aps: {
            sound: "default",
            "content-available": 1,
          },
        },
      },
      webpush: {
        notification: { title, body, icon: "icon.png" },
        fcmOptions: { link: "https://yourwebsite.com" }, // Replace with actual link
      },
    };

    // 🔁 Send notifications
    const results = [];
    const errors = [];

    for (const token of tokens) {
      try {
        const response = await admin.messaging().send({
          ...messageTemplate,
          token,
        });

        results.push({ token, success: true, response });
      } catch (err) {
        errors.push({ token, error: err.message });
      }
    }

    // 📊 Summary
    const successCount = results.length;
    const failureCount = errors.length;

    console.log("✅ Notification Summary:", {
      group: groupName,
      successCount,
      failureCount,
    });

    return res.status(200).json({
      message: `Notifications sent to group '${groupName}': ${successCount} succeeded, ${failureCount} failed.`,
      data: {
        successCount,
        failureCount,
        errors,
      },
    });
  } catch (error) {
    console.error("❌ Error sending notification:", error);
    return res.status(500).json({
      message: "Failed to send group notification.",
      error: error.message || error,
    });
  }
};

export const sendSingleNotification = async (req, res) => {
  const { title, body, selectedIds } = req.body;
  console.log("Request body:", req.body);

  if (
    !title ||
    !body ||
    !Array.isArray(selectedIds) ||
    selectedIds.length === 0
  ) {
    return res.status(400).json({
      message: "Title, body, and a non-empty array of user IDs are required.",
    });
  }

  try {
    // Get device tokens for all selected IDs
    const userTokenDocs = await DeviceToken.find({ _id: { $in: selectedIds } });

    if (!userTokenDocs || userTokenDocs.length === 0) {
      return res.status(404).json({
        message: "No valid device tokens found for the provided IDs.",
      });
    }

    // Filter out documents without tokens and collect valid tokens
    const tokens = userTokenDocs
      .filter((doc) => doc.token)
      .map((doc) => doc.token);

    if (tokens.length === 0) {
      return res.status(404).json({
        message: "No valid device tokens found for the provided IDs.",
      });
    }

    // Save notification to DB with deviceTokens reference
    const notification = new Notification({
      title,
      body,
      deviceTokens: userTokenDocs.map((doc) => doc._id),
    });
    await notification.save();
    console.log("✅ Notification saved:", notification);

    // Prepare FCM message
    const message = {
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
            "content-available": 1,
          },
        },
      },
      webpush: {
        notification: {
          title,
          body,
          icon: "icon.png",
        },
        fcm_options: {
          link: "https://yourwebsite.com",
        },
      },
    };

    // Send notifications individually
    const results = [];
    const errors = [];
    for (const token of tokens) {
      try {
        const response = await admin.messaging().send({ ...message, token });
        results.push({ token, success: true, response });
      } catch (err) {
        errors.push({ token, error: err.message });
      }
    }

    const successCount = results.length;
    const failureCount = errors.length;

    console.log("📢 Notifications sent:", { successCount, failureCount });

    return res.status(200).json({
      message: `Notifications sent: ${successCount} succeeded, ${failureCount} failed.`,
      firebaseResponse: {
        successCount,
        failureCount,
        errors,
      },
      notificationSaved: notification,
    });
  } catch (error) {
    console.error("❌ Error sending notifications:", error);
    return res.status(500).json({
      message: "Failed to send notifications.",
      error: error.message,
    });
  }
};

// export const sendSingleNotification = async (req, res) => {
//   const { title, body, selectedIds } = req.body;
//   console.log("Request body:", req.body);

//   if (
//     !title ||
//     !body ||
//     !Array.isArray(selectedIds) ||
//     selectedIds.length === 0
//   ) {
//     return res.status(400).json({
//       message: "Title, body, and a non-empty array of user IDs are required.",
//     });
//   }

//   try {
//     // Get device tokens for all selected IDs
//     const userTokenDocs = await DeviceToken.find({ _id: { $in: selectedIds } });

//     if (!userTokenDocs || userTokenDocs.length === 0) {
//       return res.status(404).json({
//         message: "No valid device tokens found for the provided IDs.",
//       });
//     }

//     // Filter out documents without tokens and collect valid tokens
//     const tokens = userTokenDocs
//       .filter((doc) => doc.token)
//       .map((doc) => doc.token);

//     if (tokens.length === 0) {
//       return res.status(404).json({
//         message: "No valid device tokens found for the provided IDs.",
//       });
//     }

//     const message = {
//       notification: {
//         title,
//         body,
//       },
//       android: {
//         priority: "high",
//       },
//       apns: {
//         payload: {
//           aps: {
//             sound: "default",
//             "content-available": 1,
//           },
//         },
//       },
//       webpush: {
//         notification: {
//           title,
//           body,
//           icon: "icon.png",
//         },
//         fcm_options: {
//           link: "https://yourwebsite.com",
//         },
//       },
//     };

//     // Send notifications individually
//     const results = [];
//     const errors = [];
//     for (const token of tokens) {
//       try {
//         const response = await admin.messaging().send({ ...message, token });
//         results.push({ token, success: true, response });
//       } catch (err) {
//         errors.push({ token, error: err.message });
//       }
//     }

//     const successCount = results.length;
//     const failureCount = errors.length;

//     console.log("✅ Notifications sent:", { successCount, failureCount });

//     res.status(200).json({
//       message: `Notifications sent: ${successCount} succeeded, ${failureCount} failed.`,
//       firebaseResponse: {
//         successCount,
//         failureCount,
//         errors,
//       },
//     });
//   } catch (error) {
//     console.error("❌ Error sending notifications:", error);
//     res.status(500).json({
//       message: "Failed to send notifications.",
//       error: error.message,
//     });
//   }
// };
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

    const UserDetails = await DeviceToken.findOne({ token });
    console.log(
      "🚀 ~ saveAndSubscribeToken ~ existing:",
      UserDetails,
      !UserDetails
    );
    // Success Response
    res.status(200).json({
      message: "Token saved and subscribed to topic 'all' successfully.",
      firebaseResponse: response,
      UserDetails,
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

  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Valid device token is required." });
  }

  try {
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

    // ✅ Fix: use the correctly imported model
    const deletionResult = await DeviceToken.deleteOne({ token });

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

// export const displayUser = async (req, res) => {
//   try {
//     const devices = await DeviceToken.find();
//     res.status(200).json({
//       message: "Device tokens fetched successfully",
//       data: devices,
//     });
//   } catch (error) {
//     console.error("Error fetching device tokens:", error);
//     res.status(500).json({ message: "Failed to fetch device tokens" });
//   }
// };

export const displayUser = async (req, res) => {
  try {
    const devices = await DeviceToken.find();

    // Convert all timestamps to IST
    const updatedDevices = devices.map((device) => {
      return {
        ...device._doc, // get plain object
        createdAtIST: device.createdAt?.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        updatedAtIST: device.updatedAt?.toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
      };
    });

    res.status(200).json({
      message: "Device tokens fetched successfully",
      data: updatedDevices,
    });
  } catch (error) {
    console.error("Error fetching device tokens:", error);
    res.status(500).json({ message: "Failed to fetch device tokens" });
  }
};

// single notification

// export const getUserNotifications = async (req, res) => {
//   const { deviceId } = req.params;

//   try {
//     const notifications = await Notification.find({
//       deviceTokens: deviceId,
//     }).sort({ createdAt: -1 }); // Sort by most recent

//     if (!notifications.length) {
//       return res.status(404).json({ message: "No notifications found." });
//     }

//     return res.status(200).json({
//       message: "Notifications fetched successfully.",
//       data: notifications,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching user notifications:", error);
//     return res.status(500).json({
//       message: "Failed to fetch notifications.",
//       error: error.message,
//     });
//   }
// };

// export const getUserNotifications = async (req, res) => {
//   const { deviceId } = req.params;
//   console.log("📱 Received deviceId:", deviceId);

//   try {
//     // Step 1: Get device from DB
//     const device = await DeviceToken.findOne({ _id: deviceId.trim() }); // Trim extra spaces just in case

//     console.log("🚀 ~ getUserNotifications ~ device:", !device);
//     if (!device) {
//       return res.status(404).json({ message: "Device not registered." });
//     }

//     const deviceCreatedAt = device.createdAt;
//     console.log("📅 Device registered at:", deviceCreatedAt);

//     // Step 2: Get notifications created AFTER device registration
//     const notifications = await Notification.find({
//       createdAt: { $gte: deviceCreatedAt },
//     }).sort({ createdAt: -1 });

//     // Step 3: Filter global or targeted notifications
//     const filteredNotifications = notifications.filter(
//       (notification) =>
//         notification.deviceTokens.length === 0 || // Global
//         notification.deviceTokens.includes(deviceId) // Targeted to this device
//     );

//     // Step 4: Format notification output
//     const formattedNotifications = filteredNotifications.map(
//       (notification) => ({
//         _id: notification._id,
//         title: notification.title,
//         body: notification.body,
//         deviceTokens: notification.deviceTokens,
//         createdAt: moment(notification.createdAt).format("YYYY-MM-DD HH:mm:ss"),
//         updatedAt: moment(notification.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
//       })
//     );

//     return res.status(200).json({
//       message: formattedNotifications.length
//         ? "Notifications fetched successfully."
//         : "No new notifications found.",
//       data: formattedNotifications,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching notifications:", error);
//     return res.status(500).json({
//       message: "Server error while fetching notifications.",
//       error: error.message,
//     });
//   }
// };

export const getUserNotifications = async (req, res) => {
  const { deviceId } = req.params;
  console.log("📱 Received deviceId:", deviceId);

  try {
    // Step 1: Get device from DB
    const device = await DeviceToken.findOne({ _id: deviceId.trim() }); // Trim extra spaces just in case

    console.log("🚀 ~ getUserNotifications ~ device:", device);
    console.log("🚀 ~ getUserNotifications ~ device:", !device);
    if (!device) {
      return res.status(404).json({ message: "Device not registered." });
    }

    const deviceCreatedAt = device.createdAt;
    console.log("📅 Device registered at:", deviceCreatedAt);

    // Step 2: Get notifications created AFTER device registration
    const notifications = await Notification.find({
      createdAt: { $gte: deviceCreatedAt },
    }).sort({ createdAt: -1 });

    // Step 3: Filter global or targeted notifications
    const filteredNotifications = notifications.filter(
      (notification) =>
        notification.deviceTokens.length === 0 || // Global
        notification.deviceTokens.includes(deviceId) // Targeted to this device
    );

    // Step 4: Format notification output
    const formattedNotifications = filteredNotifications.map(
      (notification) => ({
        _id: notification._id,
        title: notification.title,
        body: notification.body,
        deviceTokens: notification.deviceTokens,
        createdAt: moment(notification.createdAt).format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment(notification.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
      })
    );

    return res.status(200).json({
      message: formattedNotifications.length
        ? "Notifications fetched successfully."
        : "No new notifications found.",
      data: formattedNotifications,
    });
  } catch (error) {
    console.error("❌ Error fetching notifications:", error);
    return res.status(500).json({
      message: "Server error while fetching notifications.",
      error: error.message,
    });
  }
};

// export const getUserNotifications = async (req, res) => {
//   const { deviceId } = req.params;

//   try {
//     const notifications = await Notification.find().sort({ createdAt: -1 });
//     const filteredNotifications = notifications.filter(
//       (notification) =>
//         notification.deviceTokens.length === 0 ||
//         notification.deviceTokens.includes(deviceId)
//     );

//     const formattedNotifications = filteredNotifications.map(
//       (notification) => ({
//         _id: notification._id,
//         title: notification.title,
//         body: notification.body,
//         deviceTokens: notification.deviceTokens,
//         createdAt: moment(notification.createdAt).format("YYYY-MM-DD HH:mm:ss"),
//         updatedAt: moment(notification.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
//       })
//     );

//     return res.status(200).json({
//       message: formattedNotifications.length
//         ? "Notifications fetched successfully."
//         : "No notifications found.",
//       data: formattedNotifications,
//     });
//   } catch (error) {
//     console.error("❌ Error fetching user notifications:", error);
//     return res.status(500).json({
//       message: "Failed to fetch notifications.",
//       error: error.message,
//     });
//   }
// };

// search user
export const searchUser = async (req, res) => {
  try {
    const { username, email, phone } = req.query;

    if (!username && !email && !phone) {
      return res.status(400).json({
        message:
          "Please provide at least one search parameter (username, email, or phone).",
      });
    }

    const searchCriteria = [];

    if (username) {
      searchCriteria.push({ username: { $regex: username, $options: "i" } });
    }

    if (email) {
      searchCriteria.push({ email: { $regex: email, $options: "i" } });
    }

    if (phone) {
      searchCriteria.push({ phone: { $regex: phone, $options: "i" } });
    }

    const users = await DeviceToken.find({ $or: searchCriteria });

    res.status(200).json(users);
  } catch (error) {
    console.error("Error in searchUser:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
