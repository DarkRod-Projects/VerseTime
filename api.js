import express from "express";
import { verseData } from "./main.js";

const app = express();
const port = 3000;

console.log(verseData);

app.get("/", (req, res) => {
  res.json({ message: "VerseTime API is running.", verseData: verseData });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
