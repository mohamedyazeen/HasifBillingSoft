const mongoose = require("mongoose");

/* =====================================================
   CUSTOMER SCHEMA
===================================================== */

const customerSchema = new mongoose.Schema(
  {
    /* =================================================
       CUSTOMER NAME
    ================================================= */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    /* =================================================
       PHONE
    ================================================= */

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    /* =================================================
       EMAIL
    ================================================= */

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    /* =================================================
       ADDRESS
    ================================================= */

    address: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    /* =================================================
       CUSTOMER TYPE
    ================================================= */

    customerType: {
      type: String,

      enum: [
        "REGULAR",
        "WHOLESALE",
        "CREDIT",
      ],

      default: "REGULAR",
    },

    /* =================================================
       OPENING DUE
    ================================================= */

    openingDue: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =================================================
       TOTAL SALES
    ================================================= */

    totalBills: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalPurchase: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDue: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =================================================
       ACTIVE STATUS
    ================================================= */

    isActive: {
      type: Boolean,
      default: true,
    },

    /* =================================================
       NOTES
    ================================================= */

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    /* =================================================
       CREATED BY
    ================================================= */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/* =====================================================
   INDEXES
===================================================== */

customerSchema.index({
  name: 1,
});

customerSchema.index({
  phone: 1,
});

customerSchema.index({
  isActive: 1,
});

/* =====================================================
   EXPORT
===================================================== */

module.exports =
  mongoose.model(
    "Customer",
    customerSchema
  );