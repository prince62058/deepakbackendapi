const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../../.env") });

const WatchEarn = require("../models/watchEarnModel");
const User = require("../models/userModels");

const checkDuplicates = async () => {
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
      `Checking for duplicates for user: ${user.name} (${user._id}) and period: ${periodKey}`,
    );

    const docs = await WatchEarn.find({ userId: user._id, periodKey });

    console.log(`Found ${docs.length} document(s).`);

    docs.forEach((doc, index) => {
      console.log(`\nDoc #${index + 1}:`);
      console.log(`  _id: ${doc._id}`);
      console.log(`  minWatched: ${doc.minutesWatched}`);
      console.log(`  monthlyMin: ${doc.monthlyMinutesWatched}`);
      console.log(`  monthlyReward: ${doc.monthlyRewardAmount}`);
      console.log(`  createdAt: ${doc.createdAt}`);
      console.log(`  updatedAt: ${doc.updatedAt}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking duplicates:", error);
    process.exit(1);
  }
};

checkDuplicates();
