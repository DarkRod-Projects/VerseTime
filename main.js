import Settings from "./classes/app/Preferences.js";
import DB from "./classes/app/Database.js";
import UI from "./classes/app/UserInterface.js";
import { convertHoursToTimeString } from "./HelperFunctions.js";

window.suppressReload = false;

function update() {
  if (DB.locations.length === 0) return;
  UI.update();
}

// INIT
async function startVerseTime() {
  await DB.createDatabase();
  DB.locations.sort((a, b) => a.NAME.localeCompare(b.NAME));
  UI.populateLocationList();
  UI.setupEventListeners();

  checkHash();
  Settings.load();

  setInterval(update, 250);

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
  console.log(data);
  // END DEBUG ALL DATA
}
startVerseTime();

function checkHash() {
  const hash = window.location.hash;
  if (hash === "") return;

  const hashParts = hash.replace("#", "").replaceAll("_", " ").split("@");
  const locationName = hashParts[0];

  if (hashParts[1] !== undefined) {
    UI.setCustomTime(hashParts[1], true);
  }

  UI.setMapLocation(locationName);
}

window.addEventListener(
  "hashchange",
  () => {
    if (window.suppressReload) return;
    window.location.reload(true);
  },
  false,
);
