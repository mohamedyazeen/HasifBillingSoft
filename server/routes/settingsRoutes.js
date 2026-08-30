const express = require("express");

const {
  getSettings,
  updateSettings,
} = require("../controllers/settingsController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   ALL SETTINGS ROUTES REQUIRE LOGIN
===================================================== */

router.use(protect);

/* =====================================================
   GET SETTINGS

   GET /api/settings
===================================================== */

router.get(
  "/",
  getSettings
);

/* =====================================================
   UPDATE SETTINGS

   PUT /api/settings

   ADMIN ONLY
===================================================== */

router.put(
  "/",
  adminOnly,
  updateSettings
);

module.exports = router;