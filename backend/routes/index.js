const express = require("express");
const fs = require("fs");
const path = require("path");

const router = express.Router();
const controllersPath = path.join(__dirname, "../controllers");

fs.readdirSync(controllersPath).forEach((file) => {
  if (!file.endsWith(".controller.js")) return;

  const resourceName = file.replace(".controller.js", "");
  const controller = require(path.join(controllersPath, file));

  // Ensure the controller exports the expected handler functions
  if (typeof controller !== "object" || controller === null) {
    console.warn(
      `Warning: Controller ${file} does not export an object. Skipping.`
    );
    return;
  }

  const basePath = `/${resourceName}`;

  // Register standard CRUD routes only if the corresponding handler exists
  if (typeof controller.create === "function") {
    router.post(basePath, controller.create);
  }
  if (typeof controller.findAll === "function") {
    router.get(basePath, controller.findAll);
  }
  if (typeof controller.findOne === "function") {
    router.get(`${basePath}/:id`, controller.findOne);
  }
  if (typeof controller.update === "function") {
    // You can choose to support both PUT and PATCH, or only one
    router.put(`${basePath}/:id`, controller.update);
    router.patch(`${basePath}/:id`, controller.update);
  }
  if (typeof controller.delete === "function") {
    router.delete(`${basePath}/:id`, controller.delete);
  }

  console.log(`Routes registered for ${basePath}`);
});

module.exports = router;
