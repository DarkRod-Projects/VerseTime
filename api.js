import express from "express";
import {
  getLocationByName,
  convertHoursToTimeString,
} from "./HelperFunctions.js";
import { startVerseTime } from "./main.js";
import fs from "fs";
import path from "path";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Use /:city to get location data. Example: /samson or /area18",
  });
});

app.get("/:city", async (req, res) => {
  let city = req.params.city;
  const csvFile = fs.readFileSync(path.join("./data/locations.csv"), "utf-8");
  for (const line of csvFile.split("\n")) {
    const columns = line.split(",");
    if (columns[0].toLowerCase().includes(city.toLowerCase())) {
      city = columns[0];
    }
  }

  const location = getLocationByName(city);
  await startVerseTime();

  if (!location) {
    return res.status(200).json({
      message: `Location ${city} not found`,
    });
  }

  const data = {
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
  };

  const nextStarrise = new Date(data["nextStarRise"]);
  const nextStarset = new Date(data["nextStarSet"]);

  function formatTimeFrench(time) {
    if (!time) {
      return null;
    }
    // Format HH:MM:SS
    const matchHMS = time.match(/^(\d{2}):(\d{2}):(\d{2})$/);
    if (matchHMS) {
      const hours = parseInt(matchHMS[1], 10);
      return hours + "h" + matchHMS[2] + "m" + matchHMS[3] + "s";
    }
    // Format HH:MM
    const matchHM = time.match(/^(\d{2}):(\d{2})$/);
    if (matchHM) {
      const hours = parseInt(matchHM[1], 10);
      return hours + "h" + matchHM[2];
    }
    return time;
  }

  const data_fr = {
    local_time: formatTimeFrench(data.localTime),
    next_starrise: formatTimeFrench(data.nextStarRise),
    next_starset: formatTimeFrench(data.nextStarSet),
  };

  let message;
  if (nextStarrise < nextStarset) {
    message = `Sur ${data.name}, l'heure locale est ${data_fr.local_time} (en jeu). Le prochain lever de soleil est dans ${data_fr.next_starrise} (IRL). Le prochain coucher de soleil est dans ${data_fr.next_starset} (IRL). (Source: https://dydrmr.github.io/VerseTime/#${city})`;
  } else {
    message = `Sur ${data.name}, l'heure locale est ${data_fr.local_time} (en jeu). Le prochain coucher de soleil est dans ${data_fr.next_starset} (IRL). Le prochain lever de soleil est dans ${data_fr.next_starrise} (IRL). (Source: https://dydrmr.github.io/VerseTime/#${city})`;
  }

  res.status(200).json({
    message: message,
    data: data,
    data_fr: data_fr,
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
