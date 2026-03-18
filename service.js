const express    = require("express");
const mongoose   = require("mongoose");
const csvParser  = require("csv-parser");
const cors       = require("cors");
const fs         = require("fs");
const path       = require("path");

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname)));

// Connexion MongoDB
mongoose.connect("mongodb://mongo-sensor:27017/sensorsdb", {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
})
.then(() => console.log("✅ MongoDB connecté"))
.catch(err => console.error("❌ MongoDB erreur:", err));

// Schéma
const Sensor = mongoose.model("Sensor", new mongoose.Schema({
  sensorId:  String,
  freeway:   String,
  direction: String,
  postmile:  Number,
  latitude:  Number,
  longitude: Number,
  length:    Number,
  lanes:     Number
}));

// Lire le CSV et stocker dans Mongo
app.get("/import", async (req, res) => {
  try {
    const sensors = [];

    fs.createReadStream(path.join(__dirname, "sensor_metadata.csv"))
      .pipe(csvParser())
      .on("data", (row) => {
        sensors.push({
          sensorId:  row["Sensor ID"],
          freeway:   row["Freeway"],
          direction: row["Direction"],
          postmile:  parseFloat(row["Postmile"]),
          latitude:  parseFloat(row["Latitude"]),
          longitude: parseFloat(row["Longitude"]),
          length:    parseFloat(row["Length (km)"]),
          lanes:     parseInt(row["Lanes"])
        });
      })
      .on("end", async () => {
        await Sensor.deleteMany({});
        await Sensor.insertMany(sensors);
        res.json({ message: `✅ ${sensors.length} capteurs importés dans MongoDB` });
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Retourner tous les capteurs
app.get("/sensors", async (req, res) => {
  try {
    const sensors = await Sensor.find();
    res.json(sensors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("Sensor app running on port 3000"));