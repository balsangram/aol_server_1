import moment from "moment-timezone";
import admin from "../../../firebase.js";
import DeviceToken from "../../models/notification/deviceToken.model.js";
import Group from "../../models/notification/Group.model.js";
import Notification from "../../models/notification/Notification.model.js";
import { CronJob } from "cron";

export const sendNotificationToAll = async (req, res) => {
  const { title, body, NotificationTime } = req.body;

  if (!title || !body) {
    return res.status(400).json({ message: "Title and body are required" });
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
        },
      },
    },
  };

  try {
    const now = new Date();
    let cronTime = "* * * * * *";
    // If NotificationTime is not given, send immediately
    let nowTime = new Date();
    if (NotificationTime) {
      nowTime = new Date(NotificationTime);

      const minute = nowTime.getMinutes();
      const hour = nowTime.getHours();
      const day = nowTime.getDate();
      const month = nowTime.getMonth() + 1;
      cronTime = `${minute} ${hour} ${day} ${month} *`;
      if (nowTime < now) {
        return res.status(400).json({
          message: "NotificationTime must be in the future.",
        });
      }
    }

    let sentNotification = new Notification({
      title,
      body,
      status: "sent",
      sentAt: nowTime,
    });
    if (now < nowTime) {
      const job = new CronJob(
        cronTime,
        async function () {
          console.log("Executing scheduled task at IST time!");
          await admin.messaging().send(message);
          await sentNotification.save();
          job.stop();
        },
        null,
        true,
        "Asia/Kolkata"
      );
    } else {
      await admin.messaging().send(message);
      await sentNotification.save();
    }
    // console.log("🚀 ~ sendNotificationToAll ~ job:", job);
    let scheduledNotification = null;
    if (nowTime > now) {
      scheduledNotification = new Notification({
        title,
        body,
        NotificationTime: nowTime,
        status: "scheduled",
      });
      await scheduledNotification.save();
    }

    // Return response
    const istFormatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    res.status(200).json({
      message: "Notification scheduled successfully.",
      scheduledTimeIST: istFormatter.format(nowTime),
      currentTimeIST: istFormatter.format(now),
      notification: scheduledNotification
        ? scheduledNotification
        : sentNotification,
    });
  } catch (error) {
    console.error("❌ Error processing notification:", error);

    res.status(500).json({
      message: "Failed to process notification.",
      error: error.message || error,
    });
  }
};

export const sendGroupNotification = async (req, res) => {
  try {
    const { title, body, groupName, NotificationTime } = req.body;
    console.log("📦 Incoming Request:", req.body);

    // 🛡 Input validation
    if (!title || !body || !groupName) {
      return res.status(400).json({
        message: "Title, body, and groupName are required.",
      });
    }

    const message = {
      topic: groupName,
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
          },
        },
      },
    };

    const currentTime = new Date();
    let notificationTime = NotificationTime
      ? new Date(NotificationTime)
      : currentTime;

    if (NotificationTime && isNaN(notificationTime)) {
      return res.status(400).json({
        message:
          "Invalid NotificationTime format. Use ISO 8601 format (e.g., '2025-05-24T17:50:00.000+00:00').",
      });
    }

    // Prevent scheduling in the past
    if (NotificationTime && notificationTime <= currentTime) {
      return res.status(400).json({
        message: "NotificationTime must be in the future.",
      });
    }

    // Convert times to IST for logging
    const istFormatter = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "long",
    });

    const istTime = istFormatter.format(notificationTime);
    const currentTimeIST = istFormatter.format(currentTime);

    console.log("🚀 Notification Time IST:", istTime);
    console.log("🕒 Current Time IST:", currentTimeIST);

    // 🔍 Lookup group and fetch device tokens
    const group = await Group.findOne({ groupName }).populate("deviceTokens");
    if (!group) {
      return res.status(404).json({
        message: `Group '${groupName}' not found.`,
      });
    }

    const tokens = group.deviceTokens
      .filter((dt) => dt.token)
      .map((dt) => dt.token);

    if (tokens.length === 0) {
      return res.status(404).json({
        message: "No valid device tokens found in this group.",
      });
    }

    // 📝 Save notification in DB
    const savedNotification = new Notification({
      title,
      body,
      deviceTokens: group.deviceTokens.map((dt) => dt._id),
      NotificationTime: notificationTime,
      groupName,
      status: NotificationTime ? "scheduled" : "sent", // Immediate send
      sentAt: NotificationTime ? null : currentTime,
    });

    await savedNotification.save();
    console.log("✅ Notification Entry Created:", savedNotification);

    const sendNow = async () => {
      try {
        const response = await admin.messaging().sendMulticast({
          tokens,
          notification: { title, body },
          android: { priority: "high" },
          apns: { payload: { aps: { sound: "default" } } },
        });

        console.log("📤 Notification sent:", response);

        savedNotification.status = "sent";
        savedNotification.sentAt = new Date();
        await savedNotification.save();
      } catch (err) {
        console.error("❌ Failed to send group notification:", err);
        savedNotification.status = "failed";
        await savedNotification.save();
      }
    };

    const delay = notificationTime.getTime() - currentTime.getTime();
    if (delay <= 0) {
      // 🚀 Send immediately
      await sendNow();
    } else {
      // ⏳ Schedule for future
      setTimeout(sendNow, delay);
    }

    // ✅ Response to user
    return res.status(201).json({
      message: NotificationTime
        ? `Notification scheduled for group '${groupName}' at ${NotificationTime} (IST: ${istTime}).`
        : `Notification sent immediately to group '${groupName}'.`,
      data: {
        notification: savedNotification,
        group: groupName,
        deviceTokenCount: tokens.length,
        notificationTimeUTC: notificationTime.toISOString(),
        notificationTimeIST: istTime,
        currentTimeIST,
      },
    });
  } catch (error) {
    console.error("❌ Error scheduling group notification:", error);
    return res.status(500).json({
      message: "Failed to process group notification.",
      error: error.message || error,
    });
  }
};

export const sendSingleNotification = async (req, res) => {
  const { title, body, selectedIds, NotificationTime } = req.body;
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
    const userTokenDocs = await DeviceToken.find({ _id: { $in: selectedIds } });

    if (!userTokenDocs || userTokenDocs.length === 0) {
      return res.status(404).json({
        message: "No valid device tokens found for the provided IDs.",
      });
    }

    const tokens = userTokenDocs
      .filter((doc) => doc.token)
      .map((doc) => doc.token);

    if (tokens.length === 0) {
      return res.status(404).json({
        message: "No valid device tokens found for the provided IDs.",
      });
    }

    const notification = new Notification({
      title,
      body,
      NotificationTime,
      deviceTokens: userTokenDocs.map((doc) => doc._id),
    });
    await notification.save();
    console.log("✅ Notification saved:", notification);

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

    const nowIST = new Date().toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
    });

    // Convert NotificationTime to IST if valid
    let notificationTimeIST = "Invalid date";
    if (NotificationTime && !isNaN(Date.parse(NotificationTime))) {
      notificationTimeIST = new Date(NotificationTime).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
      });
    }

    return res.status(200).json({
      message: `Notifications sent: ${successCount} succeeded, ${failureCount} failed.`,
      sentAtIST: nowIST,
      scheduledNotificationTimeIST: notificationTimeIST,
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
//   const { title, body, selectedIds, NotificationTime } = req.body;
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
//     const userTokenDocs = await DeviceToken.find({ _id: { $in: selectedIds } });

//     if (!userTokenDocs || userTokenDocs.length === 0) {
//       return res.status(404).json({
//         message: "No valid device tokens found for the provided IDs.",
//       });
//     }

//     const tokens = userTokenDocs
//       .filter((doc) => doc.token)
//       .map((doc) => doc.token);

//     if (tokens.length === 0) {
//       return res.status(404).json({
//         message: "No valid device tokens found for the provided IDs.",
//       });
//     }

//     const notification = new Notification({
//       title,
//       body,
//       NotificationTime,
//       deviceTokens: userTokenDocs.map((doc) => doc._id),
//     });
//     await notification.save();
//     console.log("✅ Notification saved:", notification);

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

//     console.log("📢 Notifications sent:", { successCount, failureCount });

//     const nowIST = new Date().toLocaleString("en-IN", {
//       timeZone: "Asia/Kolkata",
//     });

//     return res.status(200).json({
//       message: `Notifications sent: ${successCount} succeeded, ${failureCount} failed.`,
//       sentAt: nowIST,
//       scheduledNotificationTime: NotificationTime,
//       firebaseResponse: {
//         successCount,
//         failureCount,
//         errors,
//       },
//       notificationSaved: notification,
//     });
//   } catch (error) {
//     console.error("❌ Error sending notifications:", error);
//     return res.status(500).json({
//       message: "Failed to send notifications.",
//       error: error.message,
//     });
//   }
// };

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
      .sort({ createdAt: -1 })
      .lean();

    const formatted = notifications.map((n) => {
      const istTime = moment(n.createdAt).tz("Asia/Kolkata");

      return {
        ...n,
        dateTime: istTime.format("DD-MM-YYYY HH:mm:ss"), // Updated format
      };
    });

    res.status(200).json(formatted);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// export const displayAllNotification = async (req, res) => {
//   try {
//     const notifications = await Notification.find()
//       .sort({ createdAt: -1 }) // Newest first
//       .lean();

//     // console.log("🚀 ~ displayAllNotification ~ notifications:", notifications);

//     const formatted = notifications.map((n) => {
//       const dateObj = new Date(n.createdAt);
//       const date = dateObj.toLocaleDateString();
//       const hours = dateObj.getHours().toString().padStart(2, "0");
//       const minutes = dateObj.getMinutes().toString().padStart(2, "0");
//       const time = `${hours}:${minutes}`;

//       return {
//         ...n,
//         date,
//         time,
//       };
//     });

//     console.log("🚀 ~ formatted ~ formatted:", formatted);
//     res.status(200).json(formatted);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Something went wrong" });
//   }
// };

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
// export const logoutAndUnsubscribeToken = async (req, res) => {
//   const { token } = req.body;
//   console.log("🚀 ~ logoutAndUnsubscribeToken ~ token:", req.body);

//   if (!token || typeof token !== "string") {
//     return res.status(400).json({ message: "Valid device token is required." });
//   }

//   try {
//     const response = await admin.messaging().unsubscribeFromTopic(token, "all");

//     if (!response || response.failureCount > 0) {
//       const errorInfo =
//         response.errors?.[0]?.error ||
//         "Unknown error while unsubscribing from topic.";

//       console.log("FCM Unsubscribe Error:", errorInfo);

//       return res.status(400).json({
//         message: "Failed to unsubscribe token from topic 'all'.",
//         error: errorInfo,
//       });
//     }

//     console.log("Token unsubscribed from 'all' topic ❌📡:", response);

//     // ✅ Fix: use the correctly imported model
//     const deletionResult = await DeviceToken.deleteOne({ token });

//     if (deletionResult.deletedCount === 0) {
//       return res.status(404).json({ message: "Token not found in database." });
//     }

//     console.log("Token deleted from DB 🗑️");

//     res.status(200).json({
//       message: "Token unsubscribed and deleted successfully.",
//       firebaseResponse: response,
//     });
//   } catch (error) {
//     console.log("Error in logoutAndUnsubscribeToken:", error);

//     res.status(500).json({
//       message: "Internal server error occurred during logout.",
//       error: error.message || "Unexpected error",
//     });
//   }
// };

export const logoutAndUnsubscribeToken = async (req, res) => {
  console.log("came in logout.,..");

  const { token } = req.body;
  console.log("🚀 ~ logoutAndUnsubscribeToken ~ token:", token);

  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Valid device token is required." });
  }

  try {
    // Find the document by token and update the token field to empty string (or null)
    const updatedUser = await DeviceToken.findOneAndUpdate(
      { token },
      { $set: { token: "" } }, // or use null if you prefer: { token: null }
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Token not found in database." });
    }

    console.log("Token cleared from user document:", updatedUser);

    res.status(200).json({ message: "Token cleared successfully." });
  } catch (error) {
    console.error("Error clearing token:", error);
    res.status(500).json({
      message: "Internal server error while clearing token.",
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
    const device = await DeviceToken.findOne({ _id: deviceId.trim() });
    if (!device) {
      return res.status(404).json({ message: "Device not registered." });
    }

    const deviceCreatedAt = device.createdAt;

    const notifications = await Notification.find({
      createdAt: { $gte: deviceCreatedAt },
    }).sort({ createdAt: -1 });

    const filteredNotifications = notifications.filter(
      (notification) =>
        notification.deviceTokens.length === 0 ||
        notification.deviceTokens.includes(deviceId)
    );

    const formattedNotifications = filteredNotifications.map((notification) => {
      const createdAtIST = moment(notification.createdAt).tz("Asia/Kolkata");
      const updatedAtIST = moment(notification.updatedAt).tz("Asia/Kolkata");

      return {
        _id: notification._id,
        title: notification.title,
        body: notification.body,
        deviceTokens: notification.deviceTokens,
        createdAt: createdAtIST.format("DD-MM-YYYY HH:mm:ss"),
        updatedAt: updatedAtIST.format("DD-MM-YYYY HH:mm:ss"),
      };
    });

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
