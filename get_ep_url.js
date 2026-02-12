const mongoose = require("mongoose");
require("dotenv").config();

async function getEpisodeUrl() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    const MovieWebSeries = mongoose.model(
      "MovieWebSeries",
      new mongoose.Schema({}, { strict: false }),
    );

    const fallout = await MovieWebSeries.findOne({ name: "Fallout" });
    if (
      fallout &&
      fallout.subSeries &&
      fallout.subSeries[0] &&
      fallout.subSeries[0].Series[2]
    ) {
      const ep = fallout.subSeries[0].Series[2];
      console.log(`\n--- Episode Details ---`);
      console.log(`Name: ${ep.name || ep.title}`);
      console.log(`URL: ${ep.file || ep.url}`);
      console.log(`DB Duration: ${ep.totalDuration || "NOT SET"}`);
      console.log(`Parent Duration: ${fallout.totalDuration}`);
    } else {
      console.log("Episode not found");
    }
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.connection.close();
  }
}

getEpisodeUrl();
