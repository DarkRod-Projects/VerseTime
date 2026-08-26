import Settings from "./classes/app/Preferences.js";
import DB from "./classes/app/Database.js";
// NE PAS importer UI ici
import { convertHoursToTimeString } from "./HelperFunctions.js";

export let verseData = null;

// INIT
async function startVerseTime() {
  await DB.createDatabase();
  Settings.load();

  // DEBUG ALL DATA
  const data = {
    location_name: Settings.activeLocation.NAME,
    local_time: convertHoursToTimeString(
      Settings.activeLocation.LOCAL_TIME / 60 / 60,
      false,
    ),
    next_starrise: convertHoursToTimeString(
      Settings.activeLocation.NEXT_STAR_RISE * 24,
      true,
      false,
    ),
    local_rise_time: convertHoursToTimeString(
      Settings.activeLocation.LOCAL_STAR_RISE_TIME * 24,
    ),
    next_starset: convertHoursToTimeString(
      Settings.activeLocation.NEXT_STAR_SET * 24,
      true,
      false,
    ),
    local_set_time: convertHoursToTimeString(
      Settings.activeLocation.LOCAL_STAR_SET_TIME * 24,
    ),
    illumination_status: Settings.activeLocation.ILLUMINATION_STATUS,
  };

  verseData = data;
  return data;
}

// Exécuter l'initialisation
await startVerseTime();

export default verseData;
