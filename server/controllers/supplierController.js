const Supplier = require("../models/Supplier");

/* =====================================================
   GET ALL SUPPLIERS
   GET /api/suppliers
===================================================== */

const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({
      active: true,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: suppliers.length,
      suppliers,
    });
  } catch (error) {
    console.error(
      "Get Suppliers Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch suppliers.",
    });
  }
};


/* =====================================================
   GET SINGLE SUPPLIER
   GET /api/suppliers/:id
===================================================== */

const getSupplierById = async (req, res) => {
  try {
    const supplier =
      await Supplier.findById(
        req.params.id
      ).lean();

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    return res.status(200).json({
      success: true,
      supplier,
    });
  } catch (error) {
    console.error(
      "Get Supplier Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch supplier.",
    });
  }
};


/* =====================================================
   CREATE SUPPLIER
   POST /api/suppliers
===================================================== */

const createSupplier = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      gstNumber,
    } = req.body;

    /* ---------------------------------------------
       VALIDATION
    --------------------------------------------- */

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Supplier name is required.",
      });
    }

    /* ---------------------------------------------
       CHECK DUPLICATE NAME
    --------------------------------------------- */

    const existingSupplier =
      await Supplier.findOne({
        name: name.trim(),
        active: true,
      });

    if (existingSupplier) {
      return res.status(409).json({
        success: false,
        message:
          "A supplier with this name already exists.",
      });
    }

    /* ---------------------------------------------
       CREATE
    --------------------------------------------- */

    const supplier =
      await Supplier.create({
        name: name.trim(),
        phone: phone?.trim() || "",
        email: email?.trim() || "",
        address: address?.trim() || "",
        gstNumber:
          gstNumber?.trim().toUpperCase() || "",
        active: true,
        createdBy: req.user._id,
      });

    return res.status(201).json({
      success: true,
      message: "Supplier created successfully.",
      supplier,
    });
  } catch (error) {
    console.error(
      "Create Supplier Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create supplier.",
    });
  }
};


/* =====================================================
   UPDATE SUPPLIER
   PUT /api/suppliers/:id
===================================================== */

const updateSupplier = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      address,
      gstNumber,
      active,
    } = req.body;

    const supplier =
      await Supplier.findById(
        req.params.id
      );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    /* ---------------------------------------------
       UPDATE FIELDS
    --------------------------------------------- */

    if (name !== undefined) {
      if (!name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Supplier name cannot be empty.",
        });
      }

      supplier.name = name.trim();
    }

    if (phone !== undefined) {
      supplier.phone = phone.trim();
    }

    if (email !== undefined) {
      supplier.email =
        email.trim().toLowerCase();
    }

    if (address !== undefined) {
      supplier.address = address.trim();
    }

    if (gstNumber !== undefined) {
      supplier.gstNumber =
        gstNumber.trim().toUpperCase();
    }

    if (active !== undefined) {
      supplier.active = Boolean(active);
    }

    await supplier.save();

    return res.status(200).json({
      success: true,
      message: "Supplier updated successfully.",
      supplier,
    });
  } catch (error) {
    console.error(
      "Update Supplier Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update supplier.",
    });
  }
};


/* =====================================================
   DELETE SUPPLIER
   DELETE /api/suppliers/:id
===================================================== */

const deleteSupplier = async (req, res) => {
  try {
    const supplier =
      await Supplier.findById(
        req.params.id
      );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    /* ---------------------------------------------
       SOFT DELETE
       Keep old purchase history safe.
    --------------------------------------------- */

    supplier.active = false;

    await supplier.save();

    return res.status(200).json({
      success: true,
      message: "Supplier deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Supplier Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete supplier.",
    });
  }
};


/* =====================================================
   EXPORT
===================================================== */

module.exports = {
  getSuppliers,
  getSupplierById,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};