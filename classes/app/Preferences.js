import CelestialBody from "../CelestialBody.js";
import DB from "./Database.js";

// Détection d'environnement
const isBrowser =
  typeof window !== "undefined" && typeof document !== "undefined";

class Preferences {
  constructor() {
    if (Preferences.instance) return Preferences.instance;
    Preferences.instance = this;

    this.use24HourTime = true;
    this.activeLocation = null;
    this.customTime = "now";
    this.useHdTextures = true;
    this.ui = null;
  }

  // Méthode pour injecter l'UI (utilisée uniquement en navigateur)
  setUI(uiInstance) {
    this.ui = uiInstance;
  }

  // Obtenir localStorage de manière sécurisée
  #getLocalStorage() {
    if (!isBrowser) {
      return null;
    }
    return window.localStorage;
  }

  load() {
    if (!isBrowser) {
      // Mode serveur : définir un emplacement par défaut
      this.#setDefaultLocation();
      return;
    }

    const localStorage = this.#getLocalStorage();
    if (!localStorage) return;

    const savedActiveLocation = String(localStorage.getItem("activeLocation"));
    if (window.location.hash === "" && savedActiveLocation !== "null") {
      // Vérifier si UI est disponible
      if (this.ui && typeof this.ui.setMapLocation === "function") {
        const result = this.ui.setMapLocation(savedActiveLocation);
        if (!result) this.#setDefaultLocation();
      } else {
        // Fallback : définir directement l'emplacement
        const location = DB.locations.find(
          (loc) => loc.NAME === savedActiveLocation,
        );
        if (location) {
          this.activeLocation = location;
        } else {
          this.#setDefaultLocation();
        }
      }
    } else if (window.location.hash === "") {
      this.#setDefaultLocation();
    }

    const time24 = localStorage.getItem("time24");
    if (time24) {
      this.use24HourTime = time24 === "false" ? false : true;
    } else {
      this.use24HourTime = true;
    }

    const hdTextures = localStorage.getItem("hdTextures");
    if (hdTextures) {
      this.useHdTextures = hdTextures === "false" ? false : true;
    } else {
      this.useHdTextures = true;
    }

    // Charger les paramètres de l'UI uniquement si UI est disponible
    if (this.ui) {
      this.#loadMapSettings(localStorage);
      this.#loadAtlasSettings(localStorage);
    }
  }

  #loadMapSettings(localStorage) {
    const mapPlanetTransparency = localStorage.getItem("mapPlanetTransparency");
    const mapTextSize = localStorage.getItem("mapTextSize");
    const mapGrid = localStorage.getItem("mapGrid");
    const mapTerminator = localStorage.getItem("mapTerminator");
    const mapOMs = localStorage.getItem("mapOMs");
    const mapTimes = localStorage.getItem("mapTimes");
    const mapStars = localStorage.getItem("mapStars");

    if (mapPlanetTransparency && this.ui) {
      const el = this.ui.el("map-settings-planet-transparency");
      if (el) el.value = parseInt(mapPlanetTransparency);
    }

    if (mapTextSize && this.ui) {
      const el = this.ui.el("map-settings-text-size");
      if (el) {
        el.value = parseFloat(mapTextSize);
        if (isBrowser) {
          document.documentElement.dispatchEvent(
            new Event("updateMapTextSize"),
          );
        }
      }
    }

    if (mapGrid && this.ui) {
      const el = this.ui.el("map-settings-show-grid");
      if (el) el.checked = mapGrid === "false" ? false : true;
    }

    if (mapTerminator && this.ui) {
      const el = this.ui.el("map-settings-show-terminator");
      if (el) el.checked = mapTerminator === "false" ? false : true;
    }

    if (mapOMs && this.ui) {
      const el = this.ui.el("map-settings-show-orbitalmarkers");
      if (el) el.checked = mapOMs === "false" ? false : true;
    }

    if (mapTimes && this.ui) {
      const el = this.ui.el("map-settings-show-times");
      if (el) el.checked = mapTimes === "false" ? false : true;
    }

    if (mapStars && this.ui) {
      const el = this.ui.el("map-settings-show-starfield");
      if (el) el.checked = mapStars === "false" ? false : true;
    }
  }

  #loadAtlasSettings(localStorage) {
    const atlasLolli = localStorage.getItem("atlasLollipops");
    const atlasWorm = localStorage.getItem("atlasWormholes");
    const atlasAffil = localStorage.getItem("atlasAffiliation");
    const atlasGrid = localStorage.getItem("atlasGrid");

    if (atlasLolli && this.ui) {
      const el = this.ui.el("atlas-settings-show-lollipops");
      if (el) el.checked = atlasLolli === "false" ? false : true;
    }

    if (atlasWorm && this.ui) {
      const el = this.ui.el("atlas-settings-show-wormholes");
      if (el) el.checked = atlasWorm === "false" ? false : true;
    }

    if (atlasAffil && this.ui) {
      const el = this.ui.el("atlas-settings-show-affiliation");
      if (el) el.checked = atlasAffil === "false" ? false : true;
    }

    if (atlasGrid && this.ui) {
      const el = this.ui.el("atlas-settings-show-grid");
      if (el) el.checked = atlasGrid === "false" ? false : true;
    }
  }

  #setDefaultLocation() {
    const result = DB.locations.filter((location) => {
      return location.NAME === "Orison";
    });
    if (result && result.length > 0) {
      this.activeLocation = result[0];
      if (isBrowser) {
        this.save("activeLocation", result[0].NAME);
      }
    }
  }

  save(key, value) {
    if (!isBrowser) return;
    window.localStorage.setItem(key, value);
  }

  getCelestialBodyTexturePath(body) {
    if (!(body instanceof CelestialBody)) {
      console.error("Parameter is not of type CelestialBody:", body);
      return null;
    }

    const directory = this.useHdTextures ? "bodies-hd" : "bodies";
    return `textures/${directory}/${body.NAME.toLowerCase()}.webp`;
  }

  getCelestialBodyTexturePaths(body, forceLowResolution = false) {
    if (!(body instanceof CelestialBody)) {
      console.error("Parameter is not of type CelestialBody:", body);
      return null;
    }

    let mainTexture;
    if (forceLowResolution) {
      mainTexture = `textures/bodies/${body.NAME.toLowerCase()}.webp`;
    } else {
      mainTexture = this.getCelestialBodyTexturePath(body);
    }

    const reflectTexture = "textures/bodies-reflection/no-reflection.webp";

    return {
      main: mainTexture,
      reflection: reflectTexture,
    };
  }

  imageExists(image_url) {
    if (!isBrowser) {
      // En mode serveur, toujours retourner true ou faire une vérification différente
      return true;
    }

    let http = new XMLHttpRequest();
    http.open("HEAD", image_url, false);
    try {
      http.send();
    } catch (e) {
      return false;
    }
    return http.status != 404;
  }
}

const Settings = new Preferences();
export default Settings;
