import schedule from "node-schedule";
import moment from "moment-timezone";

export async function scheduleNotificationWithCron(
  scheduleString,
  message,
  tokens
) {
  try {
    // Parse mm-hh-dd-MM-yyyy
    const [minute, hour, day, month, year] = scheduleString
      .split("-")
      .map(Number);

    // Create a moment object in IST timezone
    const dateIST = moment.tz(
      `${year}-${month}-${day} ${hour}:${minute}`,
      "YYYY-MM-DD HH:mm",
      "Asia/Kolkata"
    );

    if (dateIST.isBefore(moment())) {
      console.log("Scheduled time is in the past.");
      return;
    }
    console.log("initial timing ; ", scheduleString);

    const date = dateIST.toDate(); // convert to JS Date

    // Schedule a job
    const job = schedule.scheduleJob(date, async function () {
      // const fullMessage = {
      //   notification: {
      //     title: message.title,
      //     body: message.body,
      //   },
      //   android: { priority: "high" },
      //   apns: {
      //     payload: {
      //       aps: { sound: "default", "content-available": 1 },
      //     },
      //   },
      //   webpush: {
      //     notification: {
      //       title: message.title,
      //       body: message.body,
      //       icon: "icon.png",
      //     },
      //     fcm_options: {
      //       link: "https://yourwebsite.com",
      //     },
      //   },
      // };

      const results = [];
      const errors = [];

      for (const token of tokens) {
        try {
          const response = await admin.messaging().send({ ...message, token });
          results.push({ token, success: true, response });
          console.log(
            `✅ Notification sent to ${tokens} at ${dateIST.format()}:`,
            response
          );
        } catch (err) {
          errors.push({ token, error: err.message });
        }
      }
      // const response = await admin.messaging().send(fullMessage);
    });
  } catch (err) {
    console.error(`❌ Failed to send notification:`, err.message);
  }
}
