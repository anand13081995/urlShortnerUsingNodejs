import express from 'express';
import { nanoid } from 'nanoid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const isUrlValid = (url) => {
  try {
    new URL(url);
    return true;
  } catch (err) {
    return false;
  }
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, 'urlForm.html'));
});

app.post("/shorten", (req, res) => {
  const isValidUrl = isUrlValid(req.body.longUrl);
  if (!isValidUrl) {
    return res.status(400).json({
      success: false,
      message: "Please provide a valid longUrl",
    });
  }
  const shortUrl = nanoid(5);
  let urlsJson = {};
  if (fs.existsSync("urls.json")) {
    const urlsFromFile = fs.readFileSync("urls.json", { encoding: "utf-8" });
    urlsJson = JSON.parse(urlsFromFile);
  }

  urlsJson[shortUrl] = req.body.longUrl; // Adding new URL k-v pair in the JSON

  fs.writeFileSync("urls.json", JSON.stringify(urlsJson));
  res.json({
    success: true,
    data: `http://localhost:10000/${shortUrl}`,
  });
});

app.get("/:shortUrl", (req, res) => {
  const { shortUrl } = req.params;
  if (!fs.existsSync("urls.json")) {
    return res.end("Invalid Short Url");
  }
  const urls = fs.readFileSync("urls.json", { encoding: "utf-8" });
  const urlsJson = JSON.parse(urls);
  const longUrl = urlsJson[shortUrl];
  if (!longUrl) {
    return res.end("Invalid Short Url");
  }
  res.redirect(longUrl);
});

app.listen(10000, () => console.log(`Server is up and running at port 10000`));
