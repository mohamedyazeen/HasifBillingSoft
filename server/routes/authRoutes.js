const express = require("express");

const {
  login,
  changePassword,
  getMe,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

router.post(
  "/login",
  login
);

// =====================================================
// CHANGE PASSWORD
// POST /api/auth/change-password
// =====================================================

router.post(
  "/change-password",
  authMiddleware,
  changePassword
);

// =====================================================
// CURRENT USER
// GET /api/auth/me
// =====================================================

router.get(
  "/me",
  authMiddleware,
  getMe
);

module.exports = router;