const Purchase = require("../models/Purchase");
const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

/* =========================
   GENERATE PURCHASE NUMBER
========================= */

const generatePurchaseNumber = async () => {
  const prefix = "PUR";

  const lastPurchase = await Purchase.findOne()
    .sort({ createdAt: -1 })
    .select("purchaseNumber");

  if (!lastPurchase) {
    return `${prefix}-000001`;
  }

  const lastNumber = Number(
    lastPurchase.purchaseNumber.replace(
      `${prefix}-`,
      ""
    )
  );

  return `${prefix}-${String(
    lastNumber + 1
  ).padStart(6, "0")}`;
};

/* =========================
   CREATE PURCHASE
========================= */

const createPurchase = async (req, res) => {
  try {
    const {
      supplier,
      items,
      discount,
      paidAmount,
      paymentMethod,
      notes,
    } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one product is required.",
      });
    }

    let subtotal = 0;

    const purchaseItems = [];

    /* =========================
       VALIDATE ITEMS
    ========================= */

    for (const item of items) {
      const product =
        await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found.",
        });
      }

      const quantity =
        Number(item.quantity);

      const unitPrice =
        Number(item.unitPrice);

      if (
        !Number.isInteger(quantity) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid quantity for ${product.name}.`,
        });
      }

      if (
        Number.isNaN(unitPrice) ||
        unitPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid purchase price for ${product.name}.`,
        });
      }

      const total =
        quantity * unitPrice;

      subtotal += total;

      purchaseItems.push({
        product: product._id,
        productName: product.name,
        quantity,
        unitPrice,
        total,
      });
    }

    /* =========================
       DISCOUNT
    ========================= */

    const discountAmount =
      Math.max(
        0,
        Number(discount || 0)
      );

    if (discountAmount > subtotal) {
      return res.status(400).json({
        success: false,
        message:
          "Discount cannot be greater than subtotal.",
      });
    }

    const totalAmount =
      subtotal - discountAmount;

    /* =========================
       PAYMENT
    ========================= */

    const paid =
      Math.max(
        0,
        Number(paidAmount || 0)
      );

    if (paid > totalAmount) {
      return res.status(400).json({
        success: false,
        message:
          "Paid amount cannot exceed total amount.",
      });
    }

    const dueAmount =
      totalAmount - paid;

    /* =========================
       PURCHASE NUMBER
    ========================= */

    const purchaseNumber =
      await generatePurchaseNumber();

    /* =========================
       CREATE PURCHASE
    ========================= */

    const purchase =
      await Purchase.create({
        purchaseNumber,

        supplier:
          supplier?.trim() || "",

        items: purchaseItems,

        subtotal,

        discount:
          discountAmount,

        totalAmount,

        paidAmount:
          paid,

        dueAmount,

        paymentMethod:
          paymentMethod || "CASH",

        notes:
          notes?.trim() || "",

        createdBy:
          req.user._id,
      });

    /* =========================
       UPDATE PRODUCT STOCK
    ========================= */

    for (
      const item of purchaseItems
    ) {
      const product =
        await Product.findById(
          item.product
        );

      if (!product) {
        continue;
      }

      const stockBefore =
        Number(product.stock);

      const stockAfter =
        stockBefore +
        item.quantity;

      product.stock =
        stockAfter;

      await product.save();

      /* =========================
         STOCK MOVEMENT
      ========================= */

      await StockMovement.create({
        product:
          product._id,

        type:
          "PURCHASE",

        quantity:
          item.quantity,

        stockBefore,

        stockAfter,

        reason:
          `Purchase ${purchase.purchaseNumber}`,

        referenceId:
          purchase.purchaseNumber,
      });
    }

    /* =========================
       RETURN PURCHASE
    ========================= */

    const populatedPurchase =
      await Purchase.findById(
        purchase._id
      ).populate(
        "items.product",
        "name category unit"
      );

    res.status(201).json({
      success: true,

      message:
        "Purchase created successfully.",

      purchase:
        populatedPurchase,
    });
  } catch (error) {
    console.error(
      "Create Purchase Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Server error while creating purchase.",
    });
  }
};

/* =========================
   GET ALL PURCHASES
========================= */

const getPurchases = async (
  req,
  res
) => {
  try {
    const purchases =
      await Purchase.find()
        .populate(
          "items.product",
          "name category unit"
        )
        .populate(
          "createdBy",
          "userId role"
        )
        .sort({
          createdAt: -1,
        });

    res.json({
      success: true,

      count:
        purchases.length,

      purchases,
    });
  } catch (error) {
    console.error(
      "Get Purchases Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Server error while fetching purchases.",
    });
  }
};

/* =========================
   GET PURCHASE BY ID
========================= */

const getPurchaseById = async (
  req,
  res
) => {
  try {
    const purchase =
      await Purchase.findById(
        req.params.id
      )
        .populate(
          "items.product",
          "name category unit"
        )
        .populate(
          "createdBy",
          "userId role"
        );

    if (!purchase) {
      return res.status(404).json({
        success: false,

        message:
          "Purchase not found.",
      });
    }

    res.json({
      success: true,

      purchase,
    });
  } catch (error) {
    console.error(
      "Get Purchase Error:",
      error
    );

    res.status(500).json({
      success: false,

      message:
        "Server error while fetching purchase.",
    });
  }
};

/* =========================
   EXPORT
========================= */

module.exports = {
  createPurchase,
  getPurchases,
  getPurchaseById,
};