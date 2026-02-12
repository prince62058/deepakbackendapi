const mongoose = require("mongoose");
require("dotenv").config();

async function checkDuration() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    const MovieWebSeries = mongoose.model(
      "MovieWebSeries",
      new mongoose.Schema({}, { strict: false }),
    );

    // Search for "Fallout" or "Prince" or anything with Season 1 Episode 3
    const series = await MovieWebSeries.find({
      $or: [{ mainType: "WEB_SERIES" }, { mainType: "TV_SHOW" }],
    });

    series.forEach((item) => {
      console.log(`\nSeries: ${item.name} (_id: ${item._id})`);
      if (item.subSeries && item.subSeries.length > 0) {
        item.subSeries.forEach((season, sIdx) => {
          console.log(`  Season ${season.session || sIdx + 1}`);
          if (season.Series && season.Series.length > 0) {
            season.Series.forEach((ep, eIdx) => {
              if (sIdx === 0 && eIdx === 2) {
                // Season 1, Episode 3 (0-indexed)
                console.log(
                  `    MATCH -> Episode ${eIdx + 1}: ${ep.name || ep.title}`,
                );
                console.log(
                  `    Duration from JSON: ${ep.totalDuration || "N/A"}`,
                );
                console.log(
                  `    Parent Total Duration: ${item.totalDuration || "N/A"}`,
                );
              }
            });
          }
        });
      }
    });

    // Also check for standalone episode documents
    const episodes = await MovieWebSeries.find({ mainType: "EPISODE" });
    episodes.forEach((ep) => {
      // If we can find a way to identify season 1 ep 3
      if (ep.name?.toLowerCase().includes("episode 3") || ep.index === 3) {
        console.log(`\nStandalone Episode: ${ep.name} (_id: ${ep._id})`);
        console.log(`  Duration: ${ep.totalDuration}`);
      }
    });
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

checkDuration();
