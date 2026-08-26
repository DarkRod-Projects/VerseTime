import express from "express";
import { verseData, startVerseTime } from "./main.js";
import { getLocationByName } from "./HelperFunctions.js";

const app = express();
const port = 3000;

console.log(verseData);

app.get("/", async (req, res) => {
  const location = getLocationByName(req.query.location_name);
  await startVerseTime();
  res.json({ message: "VerseTime API is running.", verseData: verseData, location: location });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
