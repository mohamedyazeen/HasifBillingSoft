const express = require("express");

const {
  getProducts,
  getProductById,
  getLowStockProducts,
  createProduct,
  updateProduct,
  updateProductStock,
  deleteProduct,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   GET ALL PRODUCTS
   GET /api/products
===================================================== */

router.get(
  "/",
  authMiddleware,
  getProducts
);

/* =====================================================
   GET LOW STOCK PRODUCTS
   GET /api/products/low-stock

   IMPORTANT:
   This route MUST be before /:id
===================================================== */

router.get(
  "/low-stock",
  authMiddleware,
  getLowStockProducts
);

/* =====================================================
   GET SINGLE PRODUCT
   GET /api/products/:id
===================================================== */

router.get(
  "/:id",
  authMiddleware,
  getProductById
);

/* =====================================================
   CREATE PRODUCT
   POST /api/products
===================================================== */

router.post(
  "/",
  authMiddleware,
  createProduct
);

/* =====================================================
   UPDATE PRODUCT
   PUT /api/products/:id
===================================================== */

router.put(
  "/:id",
  authMiddleware,
  updateProduct
);

/* =====================================================
   UPDATE PRODUCT STOCK
   PUT /api/products/:id/stock
===================================================== */

router.put(
  "/:id/stock",
  authMiddleware,
  updateProductStock
);

/* =====================================================
   DELETE PRODUCT
   DELETE /api/products/:id
===================================================== */

router.delete(
  "/:id",
  authMiddleware,
  deleteProduct
);

/* =====================================================
   EXPORT ROUTER
===================================================== */

module.exports = router;