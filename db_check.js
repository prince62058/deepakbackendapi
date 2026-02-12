const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "api deepent", ".env") });

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    const User = mongoose.model(
      "User",
      new mongoose.Schema({
        number: String,
        fcmToken: String,
        name: String,
      }),
      "users",
    );

    const users = await User.find({}, "number fcmToken name")
      .sort({ _id: -1 })
      .limit(5);

    console.log("Latest 5 users:");
    users.forEach((u) => {
      console.log(
        `- Name: ${u.name || "N/A"}, Number: ${u.number}, Token: ${u.fcmToken ? u.fcmToken.substring(0, 10) + "..." : "NONE"}`,
      );
    });

    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

checkUsers();
