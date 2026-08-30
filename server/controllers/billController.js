const mongoose = require("mongoose");

const Bill = require("../models/Bill");
const Product = require("../models/Product");

/* =====================================================
   CREATE BILL
   POST /api/bills
===================================================== */

const createBill = async (req, res) => {
  try {
    const {
      customerName,
      customerPhone,
      items,
      discount = 0,
      paymentMethod = "CASH",
      paidAmount = 0,
      notes = "",
    } = req.body || {};

    /* =================================================
       VALIDATE USER
    ================================================= */

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    /* =================================================
       VALIDATE ITEMS
    ================================================= */

    if (
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Bill must contain at least one product.",
      });
    }

    /* =================================================
       VALIDATE PAYMENT METHOD
    ================================================= */

    const paymentMethods = [
      "CASH",
      "UPI",
      "CARD",
      "CREDIT",
    ];

    const finalPaymentMethod =
      String(paymentMethod || "CASH")
        .trim()
        .toUpperCase();

    if (
      !paymentMethods.includes(
        finalPaymentMethod
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method.",
      });
    }

    /* =================================================
       BILL NUMBER
    ================================================= */

    const lastBill =
      await Bill.findOne()
        .sort({
          createdAt: -1,
        })
        .select("billNumber");

    let nextNumber = 1;

    if (
      lastBill &&
      lastBill.billNumber
    ) {
      const match =
        lastBill.billNumber.match(
          /(\d+)$/
        );

      if (match) {
        nextNumber =
          Number(match[1]) + 1;
      }
    }

    let billNumber =
      `BILL-${String(
        nextNumber
      ).padStart(6, "0")}`;

    /*
      Avoid duplicate bill number
      in case of unexpected conflict.
    */

    let existingBill =
      await Bill.findOne({
        billNumber,
      });

    while (existingBill) {
      nextNumber++;

      billNumber =
        `BILL-${String(
          nextNumber
        ).padStart(6, "0")}`;

      existingBill =
        await Bill.findOne({
          billNumber,
        });
    }

    /* =================================================
       PREPARE ITEMS
    ================================================= */

    const billItems = [];

    let subtotal = 0;
    let gstTotal = 0;

    /*
      Combine duplicate products.

      Example:
      Product A qty 2
      Product A qty 3

      becomes:

      Product A qty 5
    */

    const productQuantities =
      new Map();

    for (const item of items) {
      const productId =
        item?.product;

      const quantity =
        Number(
          item?.quantity
        );

      if (!productId) {
        return res.status(400).json({
          success: false,
          message:
            "Product ID is missing.",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          productId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product ID.",
        });
      }

      if (
        !Number.isInteger(
          quantity
        ) ||
        quantity <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid product quantity.",
        });
      }

      const oldQuantity =
        productQuantities.get(
          String(productId)
        ) || 0;

      productQuantities.set(
        String(productId),
        oldQuantity + quantity
      );
    }

    /* =================================================
       LOAD PRODUCTS
    ================================================= */

    for (
      const [
        productId,
        quantity,
      ] of productQuantities
    ) {
      /* ===============================================
         FIND PRODUCT
      =============================================== */

      const product =
        await Product.findById(
          productId
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found.",
        });
      }

      /* ===============================================
         ACTIVE CHECK
      =============================================== */

      if (
        product.isActive === false
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${product.name} is inactive.`,
        });
      }

      /* ===============================================
         STOCK CHECK
      =============================================== */

      const currentStock =
        Number(
          product.stock || 0
        );

      if (
        currentStock <
        quantity
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${product.name} has only ${currentStock} ${
              product.unit || "unit"
            } available.`,
        });
      }

      /* ===============================================
         PRICE
      =============================================== */

      const sellingPrice =
        Number(
          product.sellingPrice || 0
        );

      if (
        sellingPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${product.name} has an invalid selling price.`,
        });
      }

      /* ===============================================
         ITEM SUBTOTAL
      =============================================== */

      const itemSubtotal =
        sellingPrice *
        quantity;

      /* ===============================================
         GST
      =============================================== */

      const gstEnabled =
        Boolean(
          product.gstEnabled
        );

      const gstRate =
        gstEnabled
          ? Number(
              product.gstRate || 0
            )
          : 0;

      const itemGST =
        itemSubtotal *
        (gstRate / 100);

      /* ===============================================
         ITEM TOTAL
      =============================================== */

      const itemTotal =
        itemSubtotal +
        itemGST;

      /* ===============================================
         BILL TOTALS
      =============================================== */

      subtotal +=
        itemSubtotal;

      gstTotal +=
        itemGST;

      /* ===============================================
         BILL ITEM
      =============================================== */

      billItems.push({
        product:
          product._id,

        productName:
          product.name,

        barcode:
          product.barcode || "",

        quantity,

        unit:
          product.unit ||
          "piece",

        sellingPrice,

        gstEnabled,

        gstRate,

        gstAmount:
          itemGST,

        subtotal:
          itemSubtotal,

        total:
          itemTotal,
      });
    }

    /* =================================================
       ROUND MONEY
    ================================================= */

    subtotal =
      Number(
        subtotal.toFixed(2)
      );

    gstTotal =
      Number(
        gstTotal.toFixed(2)
      );

    /* =================================================
       DISCOUNT
    ================================================= */

    const discountValue =
      Math.max(
        0,
        Number(
          discount || 0
        )
      );

    if (
      !Number.isFinite(
        discountValue
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid discount amount.",
      });
    }

    const totalBeforeDiscount =
      subtotal +
      gstTotal;

    const finalDiscount =
      Math.min(
        discountValue,
        totalBeforeDiscount
      );

    const roundedDiscount =
      Number(
        finalDiscount.toFixed(2)
      );

    /* =================================================
       GRAND TOTAL
    ================================================= */

    const grandTotal =
      Number(
        Math.max(
          0,
          totalBeforeDiscount -
            roundedDiscount
        ).toFixed(2)
      );

    /* =================================================
       PAYMENT
    ================================================= */

    const enteredPaid =
      Math.max(
        0,
        Number(
          paidAmount || 0
        )
      );

    if (
      !Number.isFinite(
        enteredPaid
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid paid amount.",
      });
    }

    const finalPaid =
      Number(
        Math.min(
          enteredPaid,
          grandTotal
        ).toFixed(2)
      );

    const dueAmount =
      Number(
        Math.max(
          0,
          grandTotal -
            finalPaid
        ).toFixed(2)
      );

    /* =================================================
       CREDIT PAYMENT CHECK
    ================================================= */

    if (
      finalPaymentMethod ===
        "CREDIT" &&
      finalPaid >= grandTotal &&
      grandTotal > 0
    ) {
      /*
        This is allowed.
        Credit can also be fully paid.
      */
    }

    /* =================================================
       CREATE BILL
    ================================================= */

    const bill =
      await Bill.create({
        billNumber,

        customerName:
          typeof customerName ===
          "string"
            ? customerName.trim() ||
              "Walk-in Customer"
            : "Walk-in Customer",

        customerPhone:
          typeof customerPhone ===
          "string"
            ? customerPhone.trim()
            : "",

        items:
          billItems,

        subtotal,

        discount:
          roundedDiscount,

        gstTotal,

        grandTotal,

        paymentMethod:
          finalPaymentMethod,

        paidAmount:
          finalPaid,

        dueAmount,

        notes:
          typeof notes ===
          "string"
            ? notes.trim()
            : "",

        createdBy:
          req.user.id,
      });

    /* =================================================
       REDUCE STOCK
    ================================================= */

    for (
      const [
        productId,
        quantity,
      ] of productQuantities
    ) {
      const updatedProduct =
        await Product.findByIdAndUpdate(
          productId,
          {
            $inc: {
              stock:
                -quantity,
            },
          },
          {
            new: true,
          }
        );

      if (!updatedProduct) {
        console.error(
          `Product disappeared while updating stock: ${productId}`
        );
      }
    }

    /* =================================================
       RESPONSE
    ================================================= */

    return res.status(201).json({
      success: true,

      message:
        "Bill created successfully.",

      bill,
    });
  } catch (error) {
    console.error(
      "Create Bill Error:",
      error
    );

    /* =================================================
       DUPLICATE BILL NUMBER
    ================================================= */

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Bill number already exists. Please try again.",
      });
    }

    /* =================================================
       VALIDATION ERROR
    ================================================= */

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Bill validation failed.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }

    /* =================================================
       SERVER ERROR
    ================================================= */

    return res.status(500).json({
      success: false,

      message:
        "Failed to create bill.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =====================================================
   GET ALL BILLS
   GET /api/bills
===================================================== */

const getBills = async (
  req,
  res
) => {
  try {
    const {
      search = "",
      paymentMethod,
      page = 1,
      limit = 20,
    } = req.query;

    /* =================================================
       PAGINATION
    ================================================= */

    const currentPage =
      Math.max(
        1,
        Number(page) || 1
      );

    const pageLimit =
      Math.min(
        100,
        Math.max(
          1,
          Number(limit) || 20
        )
      );

    const skip =
      (currentPage - 1) *
      pageLimit;

    /* =================================================
       FILTER
    ================================================= */

    const filter = {};

    /* =================================================
       SEARCH
    ================================================= */

    if (
      search &&
      search.trim()
    ) {
      const escapedSearch =
        search
          .trim()
          .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );

      const regex =
        new RegExp(
          escapedSearch,
          "i"
        );

      filter.$or = [
        {
          billNumber:
            regex,
        },

        {
          customerName:
            regex,
        },

        {
          customerPhone:
            regex,
        },
      ];
    }

    /* =================================================
       PAYMENT FILTER
    ================================================= */

    const allowedPayments = [
      "CASH",
      "UPI",
      "CARD",
      "CREDIT",
    ];

    if (
      paymentMethod &&
      allowedPayments.includes(
        String(
          paymentMethod
        ).toUpperCase()
      )
    ) {
      filter.paymentMethod =
        String(
          paymentMethod
        ).toUpperCase();
    }

    /* =================================================
       FETCH BILLS
    ================================================= */

    const [
      bills,
      total,
    ] = await Promise.all([
      Bill.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(pageLimit)
        .lean(),

      Bill.countDocuments(
        filter
      ),
    ]);

    /* =================================================
       PAGINATION TOTAL
    ================================================= */

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          total /
            pageLimit
        )
      );

    /* =================================================
       RESPONSE
    ================================================= */

    return res.status(200).json({
      success: true,

      bills,

      pagination: {
        page:
          currentPage,

        limit:
          pageLimit,

        total,

        totalPages,
      },
    });
  } catch (error) {
    console.error(
      "Get Bills Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch bills.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =====================================================
   GET SINGLE BILL
   GET /api/bills/:id
===================================================== */

const getBillById = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    /* =================================================
       VALIDATE ID
    ================================================= */

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid bill ID.",
      });
    }

    /* =================================================
       FIND BILL
    ================================================= */

    const bill =
      await Bill.findById(
        id
      )
        .populate(
          "createdBy",
          "userId role"
        )
        .lean();

    if (!bill) {
      return res.status(404).json({
        success: false,
        message:
          "Bill not found.",
      });
    }

    /* =================================================
       RESPONSE
    ================================================= */

    return res.status(200).json({
      success: true,

      bill,
    });
  } catch (error) {
    console.error(
      "Get Bill Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch bill.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =====================================================
   EXPORT
===================================================== */

module.exports = {
  createBill,
  getBills,
  getBillById,
};