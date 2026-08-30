const Product = require("../models/Product");
const StockMovement = require("../models/StockMovement");

/* =========================
   CREATE PRODUCT
========================= */

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

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required.",
      });
    }

    if (
      purchasePrice === undefined ||
      sellingPrice === undefined
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Purchase price and selling price are required.",
      });
    }

    const existingProduct = await Product.findOne({
      name: name.trim(),
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message: "A product with this name already exists.",
      });
    }

    if (barcode) {
      const existingBarcode = await Product.findOne({
        barcode: barcode.trim(),
      });

      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message: "This barcode already exists.",
        });
      }
    }

    const initialStock = Number(stock || 0);

    const product = await Product.create({
      name: name.trim(),
      category: category?.trim() || "",
      barcode: barcode?.trim() || "",
      purchasePrice: Number(purchasePrice),
      sellingPrice: Number(sellingPrice),
      wholesalePrice: Number(wholesalePrice || 0),
      stock: initialStock,
      unit: unit || "piece",
      lowStockLevel: Number(lowStockLevel || 0),
      gstEnabled: Boolean(gstEnabled),
      gstRate: Number(gstRate || 0),
      supplier: supplier?.trim() || "",
      isActive: true,
    });

    /* Save initial stock movement */

    if (initialStock > 0) {
      await StockMovement.create({
        product: product._id,
        type: "INITIAL_STOCK",
        quantity: initialStock,
        stockBefore: 0,
        stockAfter: initialStock,
        reason: "Initial stock",
        referenceId: product._id.toString(),
      });
    }

    res.status(201).json({
      success: true,
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error(
      "Create Product Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error while creating product.",
    });
  }
};

/* =========================
   GET ALL PRODUCTS
========================= */

const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(
      "Get Products Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error while fetching products.",
    });
  }
};

/* =========================
   GET SINGLE PRODUCT
========================= */

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "Get Product Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error while fetching product.",
    });
  }
};

/* =========================
   GET LOW STOCK PRODUCTS
========================= */

const getLowStockProducts = async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $expr: {
        $lte: [
          "$stock",
          "$lowStockLevel",
        ],
      },
    }).sort({
      stock: 1,
    });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error(
      "Low Stock Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while fetching low stock products.",
    });
  }
};

/* =========================
   UPDATE PRODUCT
========================= */

const updateProduct = async (req, res) => {
  try {
    const product =
      await Product.findById(
        req.params.id
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
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

    if (
      name !== undefined &&
      name.trim() !== product.name
    ) {
      const duplicate =
        await Product.findOne({
          name: name.trim(),
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

      product.name = name.trim();
    }

    if (category !== undefined) {
      product.category =
        category.trim();
    }

    if (barcode !== undefined) {
      const cleanBarcode =
        barcode.trim();

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

      product.barcode = cleanBarcode;
    }

    if (purchasePrice !== undefined) {
      product.purchasePrice =
        Number(purchasePrice);
    }

    if (sellingPrice !== undefined) {
      product.sellingPrice =
        Number(sellingPrice);
    }

    if (wholesalePrice !== undefined) {
      product.wholesalePrice =
        Number(wholesalePrice);
    }

    if (unit !== undefined) {
      product.unit = unit;
    }

    if (lowStockLevel !== undefined) {
      product.lowStockLevel =
        Number(lowStockLevel);
    }

    if (gstEnabled !== undefined) {
      product.gstEnabled =
        Boolean(gstEnabled);
    }

    if (gstRate !== undefined) {
      product.gstRate =
        Number(gstRate);
    }

    if (supplier !== undefined) {
      product.supplier =
        supplier.trim();
    }

    if (isActive !== undefined) {
      product.isActive =
        Boolean(isActive);
    }

    await product.save();

    res.json({
      success: true,
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error(
      "Update Product Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error while updating product.",
    });
  }
};

/* =========================
   UPDATE STOCK
========================= */

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
        message: "Product not found.",
      });
    }

    const quantity =
      Number(req.body.quantity);

    const reason =
      req.body.reason?.trim() ||
      "Stock added manually";

    if (
      !Number.isInteger(quantity) ||
      quantity <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be a positive whole number.",
      });
    }

    const stockBefore =
      product.stock;

    const stockAfter =
      stockBefore + quantity;

    product.stock = stockAfter;

    await product.save();

    await StockMovement.create({
      product: product._id,
      type: "STOCK_ADJUSTMENT",
      quantity,
      stockBefore,
      stockAfter,
      reason,
      referenceId: product._id.toString(),
    });

    res.json({
      success: true,
      message: "Stock updated successfully.",
      product,
    });
  } catch (error) {
    console.error(
      "Update Stock Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while updating stock.",
    });
  }
};

/* =========================
   DELETE PRODUCT
========================= */

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
        message: "Product not found.",
      });
    }

    /*
      We don't permanently delete the product.
      We deactivate it instead.
    */

    product.isActive = false;

    await product.save();

    res.json({
      success: true,
      message: "Product removed successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Product Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while removing product.",
    });
  }
};

/* =========================
   EXPORT
========================= */

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getLowStockProducts,
  updateProduct,
  updateProductStock,
  deleteProduct,
};