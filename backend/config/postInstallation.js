const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const { connectDB } = require("./db");
require("dotenv").config(); // ← add this line

async function postInstallitation(modelName, jsonFilePath) {
  try {
    // Step 1: Load model dynamically
    const Model = require(path.join(
      __dirname,
      "..",
      "models",
      `${modelName}.model.js`
    ));

    // Step 2: Load JSON dynamically from config/presave/
    const dataPath = path.join(__dirname, "preSaveDB", jsonFilePath);

    const rawData = fs.readFileSync(dataPath, "utf-8");
    const jsonData = JSON.parse(rawData);

    if (!Array.isArray(jsonData)) {
      throw new Error("JSON file must contain an array of objects");
    }

    // Step 3: Clear existing collection
    await Model.deleteMany({});

    // Step 4: Insert new JSON data
    await Model.insertMany(jsonData);

    console.log(`✔ Successfully seeded ${modelName} collection`);
  } catch (err) {
    console.error(`❌ Failed to seed ${modelName}:`, err.message);
  }
}

// ------------------ RUN SCRIPT --------------------------
(async () => {
  try {
    await connectDB();

    // Seed roles
    await postInstallitation("role", "role.db.json");

    mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeder failed:", error.message);
    process.exit(1);
  }
})();
