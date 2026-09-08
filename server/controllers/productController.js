const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

/* =====================================================
   HELPERS
===================================================== */

const toNumber = (value, defaultValue = 0) => {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : defaultValue;
};

const cleanString = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

/* =====================================================
   CREATE PRODUCT
===================================================== */

const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      barcode,
      purchasePrice,
      sellingPrice,
      wholesalePrice,
      stock,
      unit,
      lowStockLevel,
      gstEnabled,
      gstRate,
      supplier,
    } = req.body;

    /* -------------------------------------------------
       CLEAN DATA
    ------------------------------------------------- */

    const cleanName = cleanString(name);
    const cleanCategory = cleanString(category);
    const cleanBarcode = cleanString(barcode);
    const cleanUnit = cleanString(unit) || "piece";
    const cleanSupplier = cleanString(supplier);

    /* -------------------------------------------------
       REQUIRED FIELDS
    ------------------------------------------------- */

    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: "Product name is required.",
      });
    }

    if (!cleanCategory) {
      return res.status(400).json({
        success: false,
        message: "Category is required.",
      });
    }

    if (
      purchasePrice === undefined ||
      purchasePrice === null ||
      purchasePrice === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Purchase price is required.",
      });
    }

    if (
      sellingPrice === undefined ||
      sellingPrice === null ||
      sellingPrice === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Selling price is required.",
      });
    }

    /* -------------------------------------------------
       NUMBERS
    ------------------------------------------------- */

    const cleanPurchasePrice = Number(purchasePrice);
    const cleanSellingPrice = Number(sellingPrice);
    const cleanWholesalePrice = toNumber(
      wholesalePrice,
      0
    );

    const initialStock = toNumber(stock, 0);

    const cleanLowStockLevel =
      lowStockLevel === undefined ||
      lowStockLevel === null ||
      lowStockLevel === ""
        ? 5
        : Number(lowStockLevel);

    const cleanGstRate =
      gstRate === undefined ||
      gstRate === null ||
      gstRate === ""
        ? 0
        : Number(gstRate);

    /* -------------------------------------------------
       VALIDATE PURCHASE PRICE
    ------------------------------------------------- */

    if (
      !Number.isFinite(cleanPurchasePrice) ||
      cleanPurchasePrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchase price.",
      });
    }

    /* -------------------------------------------------
       VALIDATE SELLING PRICE
    ------------------------------------------------- */

    if (
      !Number.isFinite(cleanSellingPrice) ||
      cleanSellingPrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid selling price.",
      });
    }

    /* -------------------------------------------------
       VALIDATE WHOLESALE PRICE
    ------------------------------------------------- */

    if (
      !Number.isFinite(cleanWholesalePrice) ||
      cleanWholesalePrice < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid wholesale price.",
      });
    }

    /* -------------------------------------------------
       VALIDATE STOCK
    ------------------------------------------------- */

    if (
      !Number.isFinite(initialStock) ||
      initialStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid stock quantity.",
      });
    }

    /* -------------------------------------------------
       VALIDATE LOW STOCK LEVEL
    ------------------------------------------------- */

    if (
      !Number.isFinite(cleanLowStockLevel) ||
      cleanLowStockLevel < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid low stock level.",
      });
    }

    /* -------------------------------------------------
       VALIDATE GST
    ------------------------------------------------- */

    if (
      !Number.isFinite(cleanGstRate) ||
      cleanGstRate < 0 ||
      cleanGstRate > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "GST rate must be between 0 and 100.",
      });
    }

    /* -------------------------------------------------
       CHECK DUPLICATE NAME
    ------------------------------------------------- */

    const existingProduct =
      await Product.findOne({
        name: cleanName,
      });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message:
          "A product with this name already exists.",
      });
    }

    /* -------------------------------------------------
       CHECK DUPLICATE BARCODE
    ------------------------------------------------- */

    if (cleanBarcode) {
      const existingBarcode =
        await Product.findOne({
          barcode: cleanBarcode,
        });

      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message:
            "This barcode already exists.",
        });
      }
    }

    /* -------------------------------------------------
       PRODUCT DATA
    ------------------------------------------------- */

    const productData = {
      name: cleanName,
      category: cleanCategory,

      purchasePrice: cleanPurchasePrice,
      sellingPrice: cleanSellingPrice,
      wholesalePrice: cleanWholesalePrice,

      stock: initialStock,

      unit: cleanUnit,

      lowStockLevel: cleanLowStockLevel,

      gstEnabled: Boolean(gstEnabled),
      gstRate: cleanGstRate,

      supplier: cleanSupplier,

      isActive: true,
    };

    /* -------------------------------------------------
       BARCODE
       Only save if barcode exists
    ------------------------------------------------- */

    if (cleanBarcode) {
      productData.barcode = cleanBarcode;
    }

    /* -------------------------------------------------
       CREATE PRODUCT
    ------------------------------------------------- */

    const product =
      await Product.create(productData);

    /* -------------------------------------------------
       INITIAL STOCK MOVEMENT
    ------------------------------------------------- */

    if (initialStock > 0) {
      try {
        await StockMovement.create({
          product: product._id,

          type: "INITIAL_STOCK",

          quantity: initialStock,

          stockBefore: 0,

          stockAfter: initialStock,

          reason: "Initial stock",

          referenceId:
            product._id.toString(),
        });
      } catch (stockError) {
        /*
          Product already created.
          Do not tell frontend that product creation failed.
        */

        console.error(
          "Initial Stock Movement Error:",
          stockError
        );
      }
    }

    /* -------------------------------------------------
       RESPONSE
    ------------------------------------------------- */

    return res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });

  } catch (error) {
    console.error(
      "Create Product Error:",
      error
    );

    /* -------------------------------------------------
       DUPLICATE KEY
    ------------------------------------------------- */

    if (error.code === 11000) {
      const duplicateField =
        Object.keys(
          error.keyPattern || {}
        )[0];

      if (duplicateField === "barcode") {
        return res.status(400).json({
          success: false,
          message:
            "This barcode already exists.",
        });
      }

      if (duplicateField === "name") {
        return res.status(400).json({
          success: false,
          message:
            "A product with this name already exists.",
        });
      }

      return res.status(400).json({
        success: false,
        message:
          "Duplicate product data.",
      });
    }

    /* -------------------------------------------------
       MONGOOSE VALIDATION
    ------------------------------------------------- */

    if (
      error.name === "ValidationError"
    ) {
      const messages =
        Object.values(error.errors)
          .map(
            (item) => item.message
          )
          .join(", ");

      return res.status(400).json({
        success: false,
        message:
          messages ||
          "Invalid product data.",
      });
    }

    /* -------------------------------------------------
       SERVER ERROR
    ------------------------------------------------- */

    return res.status(500).json({
      success: false,
      message:
        "Server error while creating product.",
      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message,
    });
  }
};

/* =====================================================
   GET ALL PRODUCTS
===================================================== */

const getProducts = async (req, res) => {
  try {
    const products =
      await Product.find({
        isActive: true,
      }).sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      count: products.length,
      products,
    });

  } catch (error) {
    console.error(
      "Get Products Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching products.",
    });
  }
};

/* =====================================================
   GET SINGLE PRODUCT
===================================================== */

const getProductById = async (req, res) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    return res.json({
      success: true,
      product,
    });

  } catch (error) {
    console.error(
      "Get Product Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching product.",
    });
  }
};

/* =====================================================
   GET LOW STOCK PRODUCTS
===================================================== */

const getLowStockProducts = async (
  req,
  res
) => {
  try {
    /*
      Get active products first.

      Then compare stock with lowStockLevel
      in JavaScript.

      This avoids MongoDB $expr compatibility
      problems and is reliable for the POS system.
    */

    const products =
      await Product.find({
        isActive: true,
      }).sort({
        stock: 1,
      });

    const lowStockProducts =
      products.filter((product) => {
        const currentStock =
          Number(product.stock) || 0;

        const minimumStock =
          Number(
            product.lowStockLevel
          ) || 0;

        return (
          currentStock <= minimumStock
        );
      });

    return res.status(200).json({
      success: true,
      count:
        lowStockProducts.length,
      products:
        lowStockProducts,
    });

  } catch (error) {
    console.error(
      "Low Stock Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while fetching low stock products.",
      error:
        process.env.NODE_ENV ===
        "production"
          ? undefined
          : error.message,
    });
  }
};

/* =====================================================
   UPDATE PRODUCT
===================================================== */

const updateProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    const {
      name,
      category,
      barcode,
      purchasePrice,
      sellingPrice,
      wholesalePrice,
      unit,
      lowStockLevel,
      gstEnabled,
      gstRate,
      supplier,
      isActive,
    } = req.body;

    /* -------------------------------------------------
       NAME
    ------------------------------------------------- */

    if (name !== undefined) {
      const cleanName =
        cleanString(name);

      if (!cleanName) {
        return res.status(400).json({
          success: false,
          message:
            "Product name is required.",
        });
      }

      if (
        cleanName !== product.name
      ) {
        const duplicate =
          await Product.findOne({
            name: cleanName,
            _id: {
              $ne: product._id,
            },
          });

        if (duplicate) {
          return res.status(400).json({
            success: false,
            message:
              "Another product with this name already exists.",
          });
        }
      }

      product.name = cleanName;
    }

    /* -------------------------------------------------
       CATEGORY
    ------------------------------------------------- */

    if (category !== undefined) {
      const cleanCategory =
        cleanString(category);

      if (!cleanCategory) {
        return res.status(400).json({
          success: false,
          message:
            "Category is required.",
        });
      }

      product.category =
        cleanCategory;
    }

    /* -------------------------------------------------
       BARCODE
    ------------------------------------------------- */

    if (barcode !== undefined) {
      const cleanBarcode =
        cleanString(barcode);

      if (
        cleanBarcode &&
        cleanBarcode !== product.barcode
      ) {
        const duplicateBarcode =
          await Product.findOne({
            barcode: cleanBarcode,
            _id: {
              $ne: product._id,
            },
          });

        if (duplicateBarcode) {
          return res.status(400).json({
            success: false,
            message:
              "Another product already uses this barcode.",
          });
        }
      }

      if (cleanBarcode) {
        product.barcode =
          cleanBarcode;
      } else {
        product.barcode = undefined;
      }
    }

    /* -------------------------------------------------
       PURCHASE PRICE
    ------------------------------------------------- */

    if (
      purchasePrice !== undefined
    ) {
      const value =
        Number(purchasePrice);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid purchase price.",
        });
      }

      product.purchasePrice =
        value;
    }

    /* -------------------------------------------------
       SELLING PRICE
    ------------------------------------------------- */

    if (
      sellingPrice !== undefined
    ) {
      const value =
        Number(sellingPrice);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid selling price.",
        });
      }

      product.sellingPrice =
        value;
    }

    /* -------------------------------------------------
       WHOLESALE PRICE
    ------------------------------------------------- */

    if (
      wholesalePrice !== undefined
    ) {
      const value =
        Number(wholesalePrice);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid wholesale price.",
        });
      }

      product.wholesalePrice =
        value;
    }

    /* -------------------------------------------------
       UNIT
    ------------------------------------------------- */

    if (unit !== undefined) {
      const cleanUnit =
        cleanString(unit);

      product.unit =
        cleanUnit || "piece";
    }

    /* -------------------------------------------------
       LOW STOCK LEVEL
    ------------------------------------------------- */

    if (
      lowStockLevel !== undefined
    ) {
      const value =
        Number(lowStockLevel);

      if (
        !Number.isFinite(value) ||
        value < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid low stock level.",
        });
      }

      product.lowStockLevel =
        value;
    }

    /* -------------------------------------------------
       GST ENABLED
    ------------------------------------------------- */

    if (
      gstEnabled !== undefined
    ) {
      product.gstEnabled =
        Boolean(gstEnabled);
    }

    /* -------------------------------------------------
       GST RATE
    ------------------------------------------------- */

    if (
      gstRate !== undefined
    ) {
      const value =
        Number(gstRate);

      if (
        !Number.isFinite(value) ||
        value < 0 ||
        value > 100
      ) {
        return res.status(400).json({
          success: false,
          message:
            "GST rate must be between 0 and 100.",
        });
      }

      product.gstRate = value;
    }

    /* -------------------------------------------------
       SUPPLIER
    ------------------------------------------------- */

    if (
      supplier !== undefined
    ) {
      product.supplier =
        cleanString(supplier);
    }

    /* -------------------------------------------------
       ACTIVE STATUS
    ------------------------------------------------- */

    if (
      isActive !== undefined
    ) {
      product.isActive =
        Boolean(isActive);
    }

    /* -------------------------------------------------
       SAVE
    ------------------------------------------------- */

    await product.save();

    return res.json({
      success: true,
      message:
        "Product updated successfully.",
      product,
    });

  } catch (error) {
    console.error(
      "Update Product Error:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "A product with the same barcode or name already exists.",
      });
    }

    if (
      error.name ===
      "ValidationError"
    ) {
      const messages =
        Object.values(error.errors)
          .map(
            (item) => item.message
          )
          .join(", ");

      return res.status(400).json({
        success: false,
        message:
          messages ||
          "Invalid product data.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating product.",
    });
  }
};

/* =====================================================
   UPDATE PRODUCT STOCK
===================================================== */

const updateProductStock = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    const quantity =
      Number(req.body.quantity);

    const reason =
      cleanString(
        req.body.reason
      ) ||
      "Stock added manually";

    if (
      !Number.isFinite(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be greater than 0.",
      });
    }

    const stockBefore =
      Number(product.stock) || 0;

    const stockAfter =
      stockBefore + quantity;

    product.stock =
      stockAfter;

    await product.save();

    try {
      await StockMovement.create({
        product: product._id,

        type:
          "STOCK_ADJUSTMENT",

        quantity,

        stockBefore,

        stockAfter,

        reason,

        referenceId:
          product._id.toString(),
      });
    } catch (stockError) {
      console.error(
        "Stock Movement Error:",
        stockError
      );
    }

    return res.json({
      success: true,
      message:
        "Stock updated successfully.",
      product,
    });

  } catch (error) {
    console.error(
      "Update Stock Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while updating stock.",
    });
  }
};

/* =====================================================
   DELETE PRODUCT
===================================================== */

const deleteProduct = async (
  req,
  res
) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message:
          "Product not found.",
      });
    }

    /*
      Soft delete.
      Product remains in database.
    */

    product.isActive = false;

    await product.save();

    return res.json({
      success: true,
      message:
        "Product removed successfully.",
    });

  } catch (error) {
    console.error(
      "Delete Product Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Server error while removing product.",
    });
  }
};

/* =====================================================
   EXPORT
===================================================== */

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getLowStockProducts,
  updateProduct,
  updateProductStock,
  deleteProduct,
};