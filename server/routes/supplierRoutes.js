const express = require("express");

const {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} = require("../controllers/supplierController");

const {
  protect,
  adminOnly,
} = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   ALL SUPPLIER ROUTES REQUIRE LOGIN
===================================================== */

router.use(protect);


/* =====================================================
   GET ALL SUPPLIERS
   GET /api/suppliers
===================================================== */

router.get(
  "/",
  getSuppliers
);


/* =====================================================
   GET SINGLE SUPPLIER
   GET /api/suppliers/:id
===================================================== */

router.get(
  "/:id",
  getSupplierById
);


/* =====================================================
   CREATE SUPPLIER
   POST /api/suppliers

   ADMIN ONLY
===================================================== */

router.post(
  "/",
  adminOnly,
  createSupplier
);


/* =====================================================
   UPDATE SUPPLIER
   PUT /api/suppliers/:id

   ADMIN ONLY
===================================================== */

router.put(
  "/:id",
  adminOnly,
  updateSupplier
);


/* =====================================================
   DELETE SUPPLIER
   DELETE /api/suppliers/:id

   ADMIN ONLY
===================================================== */

router.delete(
  "/:id",
  adminOnly,
  deleteSupplier
);


module.exports = router;