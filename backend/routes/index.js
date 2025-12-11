// src/routes/role.routes.js
const express = require("express");
const RestController = require("../helpers/rest.controller");
const Role = require("../models/role.model");

// Create controller instance directly
const roleController = new RestController(Role, {
  preSave: (data) => data, // Add your hooks here
  postSave: (doc) => doc,
  softDelete: true,
});

const router = express.Router();
const methods = roleController.getMethods();

// Standard CRUD routes
router.post("/role", methods.create); // CREATE
router.get("/role", methods.findAll); // GET all
router.get("/role/:id", methods.findOne); // GET one
router.put("/role/:id", methods.update); // UPDATE (PUT)
router.patch("/role/:id", methods.update); // UPDATE (PATCH) ← ADD THIS LINE
router.delete("/role/:id", methods.delete); // DELETE

module.exports = router;
