import { CronJob } from "cron";
import PopUp from "../../models/PopUp.js"; // Fixed import path

// Function to revert to default image
export const revertToDefaultImage = async (popupId) => {
  try {
    const popup = await PopUp.findById(popupId);
    if (!popup) {
      console.warn(`Popup ${popupId} not found`);
      return;
    }

    popup.currentImage = popup.defaultImage;
    popup.isActive = false;
    await popup.save();

    console.log(`✅ Popup ${popupId} reverted to default image`);
  } catch (error) {
    console.error(`❌ Error reverting popup ${popupId}:`, error);
    throw error;
  }
};

// Schedule image reversion for a single popup
export const scheduleImageRevert = (popupId, liveTime) => {
  const now = new Date();
  const delay = liveTime.getTime() - now.getTime();

  if (delay > 0) {
    setTimeout(async () => {
      try {
        await revertToDefaultImage(popupId);
      } catch (error) {
        console.error(`Failed to revert popup ${popupId}:`, error);
      }
    }, delay);
    console.log(
      `⏰ Scheduled image reversion for popup ${popupId} at ${liveTime}`
    );
  } else {
    console.warn(
      `⚠️ Scheduled time ${liveTime} is in the past for popup ${popupId}`
    );
    revertToDefaultImage(popupId).catch(console.error);
  }
};

// Cron job as a backup
export const popupCronJob = new CronJob(
  "*/5 * * * *", // Every 5 minutes
  async () => {
    try {
      const now = new Date();
      console.log(`⏰ Running popup cron job at ${now}`);

      const popupsToRevert = await PopUp.find({
        liveTime: { $lte: now },
        isActive: true,
      });

      console.log(`🔍 Found ${popupsToRevert.length} popups to revert`);

      for (const popup of popupsToRevert) {
        try {
          await revertToDefaultImage(popup._id);
        } catch (error) {
          console.error(`Error processing popup ${popup._id}:`, error);
        }
      }
    } catch (error) {
      console.error("❌ Error in popup cron job:", error);
    }
  },
  null,
  true,
  "Asia/Kolkata"
);

// Start the cron job immediately
popupCronJob.start();
console.log("🚀 Popup cron job started");

process.on("SIGTERM", () => {
  popupCronJob.stop();
  console.log("🛑 Popup cron job stopped");
});
