// src/models/role.model.js
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Main Role Schema
const RoleSchema = new Schema(
  {
    // Primary identifier
    id: {
      type: Number,
      required: true,
      unique: true,
    },

    // Role code for quick reference (e.g., "ADMIN", "MANAGER")
    role_code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    // Display name
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Description
    description: {
      type: String,
      required: true,
      trim: true,
    },

    // Status flag
    is_active: {
      type: Boolean,
      default: true,
    },

    // Audit fields
    created_by: {
      type: String,
      required: true,
      trim: true,
    },

    updated_by: {
      type: String,
      trim: true,
    },
  },
  {
    collection: "role",
    timestamps: {
      createdAt: "created_date",
      updatedAt: "updated_date",
    },
    versionKey: false,
  }
);

// Index for frequently queried fields
RoleSchema.index({ role_code: 1, is_active: 1 });
RoleSchema.index({ id: 1, is_active: 1 });

module.exports = model("Role", RoleSchema);
