// src/controllers/role.controller.js
const RestController = require("../helpers/rest.controller");
const Role = require("../models/role.model");

// Pre-save hook for role
const preSave = async (data, operation, req) => {
  const processed = { ...data };

  // For create operation, generate auto-increment ID
  if (operation === "create") {
    const lastRole = await Role.findOne().sort({ id: -1 });
    processed.id = lastRole ? lastRole.id + 1 : 1;
  }

  // Always ensure name is trimmed
  if (processed.name) {
    processed.name = processed.name.trim();
  }

  // Ensure description is trimmed or null
  if (processed.description) {
    processed.description = processed.description.trim();
  } else {
    processed.description = null;
  }

  // Add user info from request
  if (req?.user) {
    if (operation === "create") {
      processed.created_by = req.user.id;
    }
    processed.updated_by = req.user.id;
  }

  return processed;
};

// Post-save hook for role
const postSave = async (doc, operation, req) => {
  // Convert to plain object for manipulation
  const role = doc.toObject();

  // Add virtual fields or computed properties
  role.formatted_name = role.name.toUpperCase();
  role.has_description = !!role.description;

  // Add permissions summary if needed
  role.permissions_summary = `Role: ${role.name} (ID: ${role.id})`;

  return role;
};

// Initialize REST controller for Role model
const roleController = new RestController(Role, {
  preSave,
  postSave,
  softDelete: true, // Enable soft delete for roles
});

// Export the controller methods
module.exports = roleController;
