const express = require("express");

const {
  createBill,
  getBills,
  getBillById,
} = require("../controllers/billController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// CREATE BILL
// POST /api/bills
// =====================================================

router.post(
  "/",
  authMiddleware,
  createBill
);

// =====================================================
// GET ALL BILLS
// GET /api/bills
// =====================================================

router.get(
  "/",
  authMiddleware,
  getBills
);

// =====================================================
// GET SINGLE BILL
// GET /api/bills/:id
// =====================================================

router.get(
  "/:id",
  authMiddleware,
  getBillById
);

module.exports = router;