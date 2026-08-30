const express = require("express");

const {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} = require("../controllers/customerController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/* =====================================================
   CREATE CUSTOMER
   POST /api/customers
===================================================== */

router.post(
  "/",
  authMiddleware,
  createCustomer
);

/* =====================================================
   GET ALL CUSTOMERS
   GET /api/customers
===================================================== */

router.get(
  "/",
  authMiddleware,
  getCustomers
);

/* =====================================================
   GET SINGLE CUSTOMER
   GET /api/customers/:id
===================================================== */

router.get(
  "/:id",
  authMiddleware,
  getCustomerById
);

/* =====================================================
   UPDATE CUSTOMER
   PUT /api/customers/:id
===================================================== */

router.put(
  "/:id",
  authMiddleware,
  updateCustomer
);

/* =====================================================
   DELETE CUSTOMER
   DELETE /api/customers/:id
===================================================== */

router.delete(
  "/:id",
  authMiddleware,
  deleteCustomer
);

module.exports = router;