// src/models/role.model.js
const mongoose = require("mongoose");

const { Schema, model } = mongoose;

const roleSchema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Role name is required"],
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 200,
      default: null,
    },
    created_by: {
      type: String,
      required: true,
      trim: true,
    },
    updated_by: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    collection: "roles",
    timestamps: {
      createdAt: "created_date",
      updatedAt: "updated_date",
    },
    versionKey: false, // Removes __v field completely
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Role = model("Role", roleSchema);

module.exports = Role;
