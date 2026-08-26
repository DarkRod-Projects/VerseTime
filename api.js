import express from "express";
import {
  getLocationByName,
  convertHoursToTimeString,
} from "./HelperFunctions.js";
import DB from "./classes/app/Database.js";
import Settings from "./classes/app/Preferences.js";
import { startVerseTime } from "./main.js";

const app = express();
const port = 3000;

async function setDefaultLocation(locationName) {
  await startVerseTime();
  const location = getLocationByName(locationName);
  if (location) {
    Settings.activeLocation = location;
    Settings.save("activeLocation", locationName);
    console.log(`Default location set to: ${locationName}`);
    return location;
  } else {
    console.error(`Location "${locationName}" not found`);
    return null;
  }
}

app.get("/", async (req, res) => {
  const locationName = req.query.location_name || "Area18";
  const location = getLocationByName(locationName);
  await startVerseTime();

  if (!location) {
    return res.status(404).json({
      error: `Location "${locationName}" not found`,
    });
  }

  res.json({
    message: "VerseTime API is running.",
    location: {
      name: location.NAME,
      type: location.TYPE,
      parent: location.PARENT?.NAME,
      localTime: convertHoursToTimeString(location.LOCAL_TIME / 60 / 60, false),
      illuminationStatus: location.ILLUMINATION_STATUS,
      nextStarRise: convertHoursToTimeString(
        location.NEXT_STAR_RISE * 24,
        true,
        false,
      ),
      localStarRiseTime: convertHoursToTimeString(
        location.LOCAL_STAR_RISE_TIME * 24,
      ),
      nextStarSet: convertHoursToTimeString(
        location.NEXT_STAR_SET * 24,
        true,
        false,
      ),
      localStarSetTime: convertHoursToTimeString(
        location.LOCAL_STAR_SET_TIME * 24,
      ),
    },
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
