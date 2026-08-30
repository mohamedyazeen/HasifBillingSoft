const mongoose = require("mongoose");

/* =====================================================
   USER SCHEMA
===================================================== */

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: [
        "admin",
        "staff",
        "manager",
      ],
      default: "staff",
    },

    active: {
      type: Boolean,
      default: true,
    },

    mustChangePassword: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================================================
   EXPORT MODEL
===================================================== */

const User =
  mongoose.model(
    "User",
    userSchema
  );

module.exports = User;