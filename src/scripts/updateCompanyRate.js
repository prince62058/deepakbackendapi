const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load env vars
dotenv.config({ path: path.join(__dirname, "../../.env") });

const { Company } = require("../models/companyModel");

const updateCompanyRate = async () => {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("✅ Connected to DB");

    console.log("Updating Company Watch & Earn Rate to 0.5...");

    const result = await Company.updateMany(
      {},
      { $set: { watchEarnRate: 0.5 } },
    );

    console.log(
      `✅ Update complete. Modified ${result.modifiedCount} company document(s).`,
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Error updating Company rate:", error);
    process.exit(1);
  }
};

updateCompanyRate();
