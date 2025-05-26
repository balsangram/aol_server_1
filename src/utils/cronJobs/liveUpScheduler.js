import { CronJob } from "cron";
import LiveLink from "../../models/LiveLink.js";

export const liveLinkJob = new CronJob("*/10 * * * * *", async () => {
  const now = new Date();
  console.log(`⏰ Running cron job at: ${now.toLocaleString()}`);

  try {
    const updated = await LiveLink.updateMany(
      {
        isLive: false,
        liveTime: { $lte: now },
      },
      { isLive: true }
    );

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
