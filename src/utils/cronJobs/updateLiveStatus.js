import { CronJob } from "cron";
import LiveLink from "../../models/LiveLink.js"; // Include .js if using native ES modules

// console.log("🚀 Cron job file loaded...");

export const job = new CronJob("0 * * * * *", async () => {
  const now = new Date();
  // console.log("Local time:", now.toLocaleString());
  // console.log("UTC time:", now.toISOString());

  // console.log("⏰ Running cron job at:", now.toLocaleString());

  try {
    const updated = await LiveLink.updateMany(
      {
        isLive: false,
        liveTime: { $lte: now },
      },
      { isLive: true }
    );
    // console.log("🚀 ~ job ~ updated:", updated);
    // console.log("🚀 ~ job ~ LiveLink.updateMany:", LiveLink.updateMany);

    // console.log("🚀 ~ job ~ updated:", updated.modifiedCount);
    if (updated.modifiedCount > 0) {
      console.log(
        `✅ Updated ${updated.modifiedCount} live link(s) to isLive: true`
      );
    } else {
      console.log("🔍 No updates needed at this time.");
    }
  } catch (err) {
    console.error("❌ Error updating live link status:", err);
  }
});
