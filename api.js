import express from "express";
import {
  getLocationByName,
  convertHoursToTimeString,
} from "./HelperFunctions.js";
import { startVerseTime } from "./main.js";

// const locationsData = await fetch("./data/locations.csv").then(res => res.json());
// console.log("Locations data loaded:", locationsData);

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.status(200).json({
    message: "VerseTime API is running. Use /:slug to get location data.",
  });
});

app.get("/:slug", async (req, res) => {
  let slug = req.params.slug;
  const locationName = slug.replace(/-/g, " ");
  const location = getLocationByName(locationName);
  await startVerseTime();

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
    message = `Sur ${locationName}, l'heure locale est ${data_fr.local_time} (en jeu). Le prochain lever de soleil est dans ${data_fr.next_starrise} (IRL). Le prochain coucher de soleil est dans ${data_fr.next_starset} (IRL). (Source: https://dydrmr.github.io/VerseTime/#${slug})`;
  } else {
    message = `Sur ${locationName}, l'heure locale est ${data_fr.local_time} (en jeu). Le prochain coucher de soleil est dans ${data_fr.next_starset} (IRL). Le prochain lever de soleil est dans ${data_fr.next_starrise} (IRL). (Source: https://dydrmr.github.io/VerseTime/#${slug})`;
  }

  if (!location) {
    return res.status(200).json({
      message: `Location ${locationName} not found`,
    });
  } else {
    res.status(200).json({
      message: message,
      data: data,
      data_fr: data_fr,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
