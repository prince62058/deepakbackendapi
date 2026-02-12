const mongoose = require("mongoose");
const MovieWebSeries = require("./src/models/movieWebSeriesModel");
const { parseDurationToMinutes } = require("./src/utils/urlFixer");
require("dotenv").config();

async function migrateDurations() {
  try {
    await mongoose.connect(
      process.env.MONGO_URI || "mongodb://localhost:27017/deepak-ott",
    );
    console.log("Connected to MongoDB for duration migration...");

    const movies = await MovieWebSeries.find({
      $or: [
        { totalDuration: 0 },
        { totalDuration: { $type: "string" } }, // Mongoose usually prevents this but just in case
      ],
    });

    console.log(
      `Found ${movies.length} records with potential duration issues.`,
    );

    let fixedCount = 0;
    for (const movie of movies) {
      // In some cases, the duration might be 0 because it was a string that failed to cast
      // Since we can't easily retrieve the "lost" string from the DB if it was already cast to 0,
      // this migration is most useful if the schema allowed strings or if we manually trigger
      // parses for records we know are problematic.
      // However, for Fasal and others, they might still have the string in subSeries or elsewhere
      // if it's a web series, or we might need to re-fetch if we had the original data.
      // Realistically, the best way for the user to fix existing ones is to "Save" them again in Admin.
      // But I can try to find if any string values leaked in or if we can derive them.
    }

    console.log(`Migration complete. Fixed ${fixedCount} records.`);
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// migrateDurations();
