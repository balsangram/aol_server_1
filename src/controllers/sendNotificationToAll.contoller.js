import admin from "../../firebase.js";
import deviceToken from "../models/deviceToken.model.js";

export const sendNotificationToAll = async (req, res) => {
  const { title, body } = req.body;
  if (!title || !body) {
    return res.status(400).json({ message: "fill all the requirement" });
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

export const saveAndSubscribeToken = async (req, res) => {
  const { token } = req.body;

  // Validate input
  if (!token || typeof token !== "string") {
    return res.status(400).json({ message: "Valid device token is required." });
  }

  try {
    // Subscribe token to "all" topic first
    const response = await admin.messaging().subscribeToTopic(token, "all");

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
    const existing = await deviceToken.findOne({ token });

    if (!existing) {
      await deviceToken.create({ token });
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
