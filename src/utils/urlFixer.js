const fixUrl = (url) => {
  if (!url || typeof url !== "string") return url;

  // Default to these values if env vars are not set, but prefer env vars
  const oldDomain =
    process.env.OLD_BUCKET_DOMAIN || "in-maa-1.linodeobjects.com/leadkart";
  const newDomain =
    process.env.NEW_BUCKET_DOMAIN ||
    "satyakabir-bucket.sgp1.digitaloceanspaces.com";

  let fixedUrl = url;

  // Replace old Linode domain with new DigitalOcean domain
  if (url.includes(oldDomain)) {
    fixedUrl = url.replace(oldDomain, newDomain);
  }

  // Fix malformed DigitalOcean URLs like:
  // "sgp1.digitaloceanspaces.com/satyakabir-bucket/..."
  // or "https://sgp1.digitaloceanspaces.com/satyakabir-bucket/..."
  // Should be: "https://satyakabir-bucket.sgp1.digitaloceanspaces.com/..."
  const bucketPath =
    process.env.NEW_BUCKET_PATH ||
    "sgp1.digitaloceanspaces.com/satyakabir-bucket";

  if (fixedUrl.includes(bucketPath)) {
    // Create regex from the path
    const regex = new RegExp(
      `https?:\\/\\/${bucketPath.replace(/\//g, "\\/")}\\/`,
      "g",
    );
    const startRegex = new RegExp(
      `^${bucketPath.replace(/\//g, "\\/")}\\/`,
      "g",
    );

    fixedUrl = fixedUrl.replace(regex, `https://${newDomain}/`);
    fixedUrl = fixedUrl.replace(startRegex, `https://${newDomain}/`);
  }

  // Ensure URL starts with https://
  if (!fixedUrl.startsWith("http")) {
    // If it's a relative path (doesn't contain the bucket domain), prepend it
    const domainPart = newDomain.split("/")[0]; // Extract domain part if newDomain has path
    if (!fixedUrl.includes(domainPart)) {
      fixedUrl = `https://${newDomain}/${fixedUrl.startsWith("/") ? fixedUrl.slice(1) : fixedUrl}`;
    } else {
      fixedUrl = `https://${fixedUrl}`;
    }
  }

  // Encode the URL to handle spaces and special characters
  // decodeURI first to prevent double encoding if it's already encoded
  try {
    return encodeURI(decodeURI(fixedUrl));
  } catch (e) {
    return encodeURI(fixedUrl);
  }
};

const fixData = (data) => {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => fixData(item));
  }

  if (typeof data === "object") {
    // Handle Mongoose documents
    const doc = data._doc ? data._doc : data;

    // Create a new object to avoid mutating the original if it's frozen
    const newDoc = { ...doc };

    // Fix all media URL fields
    if (newDoc.poster) newDoc.poster = fixUrl(newDoc.poster);
    if (newDoc.file) newDoc.file = fixUrl(newDoc.file);
    if (newDoc.video) newDoc.video = fixUrl(newDoc.video);
    if (newDoc.teaserUrl) newDoc.teaserUrl = fixUrl(newDoc.teaserUrl);
    if (newDoc.thumbnail) newDoc.thumbnail = fixUrl(newDoc.thumbnail);

    // Fix episodes array (for web series)
    if (newDoc.episode && Array.isArray(newDoc.episode)) {
      newDoc.episode = newDoc.episode.map((ep) => fixData(ep));
    }
    if (newDoc.episodes && Array.isArray(newDoc.episodes)) {
      newDoc.episodes = newDoc.episodes.map((ep) => fixData(ep));
    }

    // Fix nested movieOrSeriesId
    if (newDoc.movieOrSeriesId) {
      newDoc.movieOrSeriesId = fixData(newDoc.movieOrSeriesId);
    }

    return newDoc;
  }

  return data;
};

const parseDurationToMinutes = (duration) => {
  if (duration === undefined || duration === null) return 0;
  if (typeof duration === "number") return duration;
  if (typeof duration !== "string") return 0;

  // If it's just a number in a string ("120")
  if (!isNaN(duration)) return parseFloat(duration);

  let totalMinutes = 0;

  // Match hours (e.g., "1h", "2 hours")
  const hourMatch = duration.match(/(\d+)\s*h/i);
  if (hourMatch) {
    totalMinutes += parseInt(hourMatch[1]) * 60;
  }

  // Match minutes (e.g., "30m", "45 mins")
  const minuteMatch = duration.match(/(\d+)\s*m/i);
  if (minuteMatch) {
    totalMinutes += parseInt(minuteMatch[1]);
  }

  // Match seconds (e.g., "15s", "10 seconds") - add to minutes if >= 30s
  const secondMatch = duration.match(/(\d+)\s*s/i);
  if (secondMatch) {
    const seconds = parseInt(secondMatch[1]);
    if (seconds >= 30) {
      totalMinutes += 1;
    }
  }

  return totalMinutes;
};

module.exports = { fixUrl, fixData, parseDurationToMinutes };
