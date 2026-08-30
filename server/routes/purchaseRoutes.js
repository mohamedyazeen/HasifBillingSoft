const express = require("express");

const {
  createPurchase,
  getPurchases,
  getPurchaseById,
} = require("../controllers/purchaseController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   AUTHENTICATION
===================================================== */

router.use(authMiddleware);

/* =====================================================
   GET ALL PURCHASES
   GET /api/purchases
===================================================== */

router.get(
  "/",
  getPurchases
);

/* =====================================================
   GET SINGLE PURCHASE
   GET /api/purchases/:id
===================================================== */

router.get(
  "/:id",
  getPurchaseById
);

/* =====================================================
   CREATE PURCHASE
   POST /api/purchases
===================================================== */

router.post(
  "/",
  createPurchase
);

/* =====================================================
   EXPORT
===================================================== */

module.exports = router;