const mongoose = require("mongoose");
require("dotenv").config();

async function getEpisodeData() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const MovieWebSeries = mongoose.model(
      "MovieWebSeries",
      new mongoose.Schema({}, { strict: false }),
    );

    const fallout = await MovieWebSeries.findOne({ name: "Fallout" });

    console.log(`\n--- SERIES: ${fallout.name} ---`);
    console.log(`Parent Duration: ${fallout.totalDuration}`);

    if (fallout.subSeries) {
      fallout.subSeries.forEach((season, sIdx) => {
        console.log(`\nSeason ${season.session || sIdx + 1}:`);
        if (season.Series) {
          season.Series.forEach((ep, eIdx) => {
            console.log(`  Ep ${eIdx + 1}: ${ep.name || ep.title}`);
            console.log(`    Duration: ${ep.totalDuration || "N/A"}`);
            console.log(`    URL: ${ep.file || ep.url}`);
          });
        }
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

getEpisodeData();
