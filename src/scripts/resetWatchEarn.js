const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../../.env") });

const WatchEarn = require("../models/watchEarnModel");
const User = require("../models/userModels");

const resetWatchEarn = async () => {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connected to DB");

    const targetNumber = "7050234325";
    const user = await User.findOne({ number: targetNumber });

    if (!user) {
      console.log(`❌ User with number ${targetNumber} not found.`);
      process.exit(1);
    }

    const now = new Date();
    const periodKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    console.log(
      `Resetting Watch & Earn stats for user: ${user.name} (${targetNumber}) for period: ${periodKey}`,
    );

    const result = await WatchEarn.updateOne(
      { userId: user._id, periodKey },
      {
        $set: {
          minutesWatched: 0,
          monthlyMinutesWatched: 0,
          monthlyHoursWatched: 0,
          rewardAmount: 0,
          monthlyRewardAmount: 0,
        },
      },
    );

    console.log(
      `✅ Reset complete. Modified ${result.modifiedCount} document(s).`,
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting Watch & Earn:", error);
    process.exit(1);
  }
};

resetWatchEarn();
