const mongoose = require("mongoose");

const settingsSchema = new mongoose.Schema(
  {
    storeName: {
      type: String,
      default: "HASIF STORE",
      immutable: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    address: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    gstNumber: {
      type: String,
      default: "",
      trim: true,
      uppercase: true,
    },

    invoicePrefix: {
      type: String,
      default: "INV-",
      trim: true,
    },

    invoiceFooter: {
      type: String,
      default: "Thank you for shopping with us.",
      trim: true,
    },

    lowStockThreshold: {
      type: Number,
      default: 5,
      min: 0,
    },

    outOfStockWarning: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "Settings",
  settingsSchema
);