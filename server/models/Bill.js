const mongoose = require("mongoose");

/* =====================================================
   BILL ITEM SCHEMA
===================================================== */

const billItemSchema = new mongoose.Schema(
  {
    /* =================================================
       PRODUCT
    ================================================= */

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    barcode: {
      type: String,
      default: "",
      trim: true,
    },

    /* =================================================
       QUANTITY
    ================================================= */

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    unit: {
      type: String,
      default: "piece",
      trim: true,
    },

    /* =================================================
       PRICE
    ================================================= */

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    /* =================================================
       GST
    ================================================= */

    gstEnabled: {
      type: Boolean,
      default: false,
    },

    gstRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    gstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =================================================
       ITEM PRICE CALCULATION
    ================================================= */

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

/* =====================================================
   BILL SCHEMA
===================================================== */

const billSchema = new mongoose.Schema(
  {
    /* =================================================
       BILL NUMBER
    ================================================= */

    billNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    /* =================================================
       CUSTOMER
    ================================================= */

    customerName: {
      type: String,
      trim: true,
      default: "Walk-in Customer",
    },

    customerPhone: {
      type: String,
      trim: true,
      default: "",
    },

    /* =================================================
       BILL ITEMS
    ================================================= */

    items: {
      type: [billItemSchema],

      required: true,

      validate: {
        validator: (items) => {
          return (
            Array.isArray(items) &&
            items.length > 0
          );
        },

        message:
          "At least one product is required.",
      },
    },

    /* =================================================
       BILL CALCULATION
    ================================================= */

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    gstTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },

    /* =================================================
       PAYMENT
    ================================================= */

    paymentMethod: {
      type: String,

      enum: [
        "CASH",
        "UPI",
        "CARD",
        "CREDIT",
      ],

      default: "CASH",
    },

    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    dueAmount: {
      type: Number,
      default: 0,
      min: 0,
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
   EXPORT
===================================================== */

module.exports = mongoose.model(
  "Bill",
  billSchema
);