import Settings from "./classes/app/Preferences.js";
import DB from "./classes/app/Database.js";
import { convertHoursToTimeString } from "./HelperFunctions.js";

const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";
const isServer = !isBrowser;

let UI = null;
if (isBrowser) {
  const { default: UIModule } = await import("./classes/app/UserInterface.js");
  UI = UIModule;
}

export let verseData = null;

export async function startVerseTime() {
  await DB.createDatabase();

  if (isBrowser && UI) {
    DB.locations.sort((a, b) => a.NAME.localeCompare(b.NAME));
    UI.populateLocationList();
    UI.setupEventListeners();
  }

  if (isBrowser) {
    checkHash();
  }

  Settings.load();

  if (isBrowser && UI) {
    setInterval(update, 250);
  }

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
  console.log("Verse Data:", data);
  return data;
}

export function update() {
  if (DB.locations.length === 0) return;
  if (UI) UI.update();
}

function checkHash() {
  if (!isBrowser) return;
  const hash = window.location.hash;
  if (hash === "") return;

  const hashParts = hash.replace("#", "").replaceAll("_", " ").split("@");
  const locationName = hashParts[0];

  if (hashParts[1] !== undefined && UI) {
    UI.setCustomTime(hashParts[1], true);
  }

  if (UI) UI.setMapLocation(locationName);
}

if (isBrowser) {
  window.addEventListener(
    "hashchange",
    () => {
      if (window.suppressReload) return;
      window.location.reload(true);
    },
    false,
  );
}

await startVerseTime();

export default { verseData, startVerseTime};
