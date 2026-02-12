// cronJob.js
const cron = require("node-cron");
const MovieRent = require("../models/movieRentModel");
const PurchaseSubscription = require("../models/purchaseSubscriptionModel");

const User = require("../models/userModels");
const sendPushNotification = require("../middleware/pushNotificationMiddleware");

async function doTask() {
  const now = new Date();

  // 1. Deactivate expired movie rents
  const movieResult = await MovieRent.updateMany(
    { isActivePlan: true, planExpireTime: { $lte: now } },
    { $set: { isActivePlan: false } },
  );

  // 2. Handle Subscription Expiration (Actual Expiry)
  const expiredSubscriptions = await PurchaseSubscription.find({
    isActivePlan: true,
    planExpireTime: { $lte: now },
  });

  for (const sub of expiredSubscriptions) {
    sub.isActivePlan = false;
    await sub.save();

    // Notify User
    const user = await User.findById(sub.userId);
    if (user && user.fcmToken) {
      await sendPushNotification({
        tokens: [user.fcmToken],
        notification: {
          title: "Plan Expired",
          body: `Your ${sub.planName} has expired. You are now on the Free Plan.`,
        },
        data: {
          type: "PLAN_EXPIRED",
        },
      });
      console.log(`📉 Plan expired for user: ${user.name}`);
    }
  }

  // 3. Handle Subscription Warning (3 Days Before)
  const threeDaysFromNow = new Date();
  threeDaysFromNow.setDate(now.getDate() + 3);

  const expiringSoonSubscriptions = await PurchaseSubscription.find({
    isActivePlan: true,
    planExpireTime: { $gt: now, $lte: threeDaysFromNow },
    isWarningSent: { $ne: true }, // Handle false or undefined
  });

  for (const sub of expiringSoonSubscriptions) {
    sub.isWarningSent = true;
    await sub.save();

    // Notify User
    const user = await User.findById(sub.userId);
    if (user && user.fcmToken) {
      await sendPushNotification({
        tokens: [user.fcmToken],
        notification: {
          title: "Plan Expiring Soon",
          body: `Your ${sub.planName} will expire in 3 days. Renew now to keep enjoying premium content!`,
        },
        data: {
          type: "PLAN_WARNING",
          planId: sub._id.toString(),
        },
      });
      console.log(`⚠️ Plan warning sent to user: ${user.name}`);
    }
  }

  console.log(
    `${new Date().toISOString()} - Task Run: MovieRent(${movieResult.modifiedCount}), SubExpired(${expiredSubscriptions.length}), SubWarning(${expiringSoonSubscriptions.length})`,
  );
}

// Prevent overlapping runs
let isRunning = false;

const job = cron.schedule(
  "* * * * *", // every minute
  async () => {
    if (isRunning) {
      console.log(
        new Date().toISOString(),
        "- Previous job still running — skipping this run",
      );
      return;
    }

    try {
      isRunning = true;
      console.log(new Date().toISOString(), "- Job started");
      await doTask();
      console.log(new Date().toISOString(), "- Job finished");
    } catch (err) {
      console.error(new Date().toISOString(), "- Job error:", err);
    } finally {
      isRunning = false;
    }
  },
  {
    scheduled: true,
    timezone: "Asia/Kolkata", // optional
  },
);

job.start();

process.on("SIGINT", () => {
  console.log("\nGracefully stopping cron...");
  job.stop();
  process.exit(0);
});

module.exports = { job };
