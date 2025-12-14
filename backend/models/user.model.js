// src/models/user.model.js
const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const AddressSchema = new Schema(
  {
    street: { type: String, default: "" },
    city: { type: String, default: "" },
    state: { type: String, default: "" },
    pincode: { type: String, default: "" },
    country: { type: String, default: "India" },
  },
  { _id: false }
);

const ContactSchema = new Schema(
  {
    phone: { type: String, default: "", trim: true },
    alternate_phone: { type: String, default: "", trim: true },
  },
  { _id: false }
);

// Admin
const AdminSchema = new Schema(
  {
    admin_code: { type: String, default: "" },
    permissions: { type: [String], default: [] },
  },
  { _id: false }
);

// Customer
const CustomerSchema = new Schema(
  {
    customer_id: { type: String, default: "" },
    customer_type: {
      type: String,
      default: "individual",
    },
  },
  { _id: false }
);

// Dealer
const DealerSchema = new Schema(
  {
    dealer_code: { type: String, default: "" },
    business_name: { type: String, default: "" },
    gst_number: { type: String, default: "" },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    // Core identity
    user_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // Role
    role_id: {
      type: Number,
      required: true,
    },

    role_name: {
      type: String,
      required: true,
    },

    // Profile
    profile_image_url: {
      type: String,
      default: "",
    },

    // Contact details
    contact: {
      type: ContactSchema,
      default: () => ({}),
    },

    // Address
    address: {
      type: AddressSchema,
      default: () => ({}),
    },

    // Role specific details
    details: {
      admin: {
        type: AdminSchema,
        default: () => ({}),
      },
      customer: {
        type: CustomerSchema,
        default: () => ({}),
      },
      dealer: {
        type: DealerSchema,
        default: () => ({}),
      },
    },

    // Status
    status: {
      type: String,
      default: "active",
    },

    // Audit
    created_by: {
      type: String,
      default: "system",
      trim: true,
    },

    updated_by: {
      type: String,
      trim: true,
    },
  },
  {
    collection: "user",
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  }
);

module.exports = model("User", UserSchema);
