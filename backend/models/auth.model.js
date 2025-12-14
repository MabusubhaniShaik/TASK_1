const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const AuthUserTokenSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    user_name: {
      type: String,
      required: true,
      trim: true,
    },

    access_token: {
      type: String,
      required: true,
      index: true,
    },

    refresh_token: {
      type: String,
      required: true,
      index: true,
    },

    expire_time: {
      type: Date,
      required: true,
    },

    refresh_time: {
      type: Date,
      required: true,
    },

    token_status: {
      type: String,
      enum: ["active", "revoked", "expired"],
      default: "active",
      trim: true,
    },

    created_by: {
      type: String,
      default: "system",
      trim: true,
    },

    updated_by: {
      type: String,
      default: "system",
      trim: true,
    },

    created_date: {
      type: Date,
      default: Date.now,
    },

    updated_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "auth_user_token",
    versionKey: false,
  }
);

module.exports = model("AuthUserToken", AuthUserTokenSchema);
