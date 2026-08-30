const mongoose = require("mongoose");

const Customer = require("../models/Customer");

/* =====================================================
   CREATE CUSTOMER
   POST /api/customers
===================================================== */

const createCustomer = async (req, res) => {
  try {
    /* =================================================
       AUTH CHECK
    ================================================= */

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const {
      name,
      phone = "",
      email = "",
      address = "",
      city = "",
      customerType = "REGULAR",
      openingDue = 0,
      notes = "",
    } = req.body || {};

    /* =================================================
       NAME VALIDATION
    ================================================= */

    const customerName =
      typeof name === "string"
        ? name.trim()
        : "";

    if (!customerName) {
      return res.status(400).json({
        success: false,
        message: "Customer name is required.",
      });
    }

    /* =================================================
       CUSTOMER TYPE
    ================================================= */

    const allowedTypes = [
      "REGULAR",
      "WHOLESALE",
      "CREDIT",
    ];

    const finalCustomerType =
      String(customerType || "REGULAR")
        .trim()
        .toUpperCase();

    if (
      !allowedTypes.includes(
        finalCustomerType
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer type.",
      });
    }

    /* =================================================
       PHONE
    ================================================= */

    const finalPhone =
      typeof phone === "string"
        ? phone.trim()
        : "";

    /* =================================================
       EMAIL
    ================================================= */

    const finalEmail =
      typeof email === "string"
        ? email.trim().toLowerCase()
        : "";

    /* =================================================
       OPENING DUE
    ================================================= */

    const finalOpeningDue =
      Number(openingDue || 0);

    if (
      !Number.isFinite(
        finalOpeningDue
      ) ||
      finalOpeningDue < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid opening due amount.",
      });
    }

    const roundedOpeningDue =
      Number(
        finalOpeningDue.toFixed(2)
      );

    /* =================================================
       CHECK DUPLICATE PHONE
    ================================================= */

    if (finalPhone) {
      const existingCustomer =
        await Customer.findOne({
          phone: finalPhone,
          isActive: true,
        });

      if (existingCustomer) {
        return res.status(409).json({
          success: false,
          message:
            "A customer with this phone number already exists.",
        });
      }
    }

    /* =================================================
       CREATE CUSTOMER
    ================================================= */

    const customer =
      await Customer.create({
        name: customerName,

        phone: finalPhone,

        email: finalEmail,

        address:
          typeof address === "string"
            ? address.trim()
            : "",

        city:
          typeof city === "string"
            ? city.trim()
            : "",

        customerType:
          finalCustomerType,

        openingDue:
          roundedOpeningDue,

        totalBills: 0,

        totalPurchase:
          0,

        totalPaid:
          0,

        totalDue:
          roundedOpeningDue,

        isActive: true,

        notes:
          typeof notes === "string"
            ? notes.trim()
            : "",

        createdBy:
          req.user.id,
      });

    /* =================================================
       RESPONSE
    ================================================= */

    return res.status(201).json({
      success: true,

      message:
        "Customer created successfully.",

      customer,
    });
  } catch (error) {
    console.error(
      "Create Customer Error:",
      error
    );

    /* =================================================
       DUPLICATE KEY
    ================================================= */

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Customer already exists.",
      });
    }

    /* =================================================
       VALIDATION ERROR
    ================================================= */

    if (
      error.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer validation failed.",
        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }

    /* =================================================
       SERVER ERROR
    ================================================= */

    return res.status(500).json({
      success: false,

      message:
        "Failed to create customer.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =====================================================
   GET ALL CUSTOMERS
   GET /api/customers
===================================================== */

const getCustomers = async (
  req,
  res
) => {
  try {
    const {
      search = "",
      customerType = "",
      page = 1,
      limit = 20,
    } = req.query;

    /* =================================================
       PAGINATION
    ================================================= */

    const currentPage =
      Math.max(
        1,
        Number(page) || 1
      );

    const pageLimit =
      Math.min(
        100,
        Math.max(
          1,
          Number(limit) || 20
        )
      );

    const skip =
      (currentPage - 1) *
      pageLimit;

    /* =================================================
       FILTER
    ================================================= */

    const filter = {
      isActive: true,
    };

    /* =================================================
       SEARCH
    ================================================= */

    if (
      search &&
      search.trim()
    ) {
      const escapedSearch =
        search
          .trim()
          .replace(
            /[.*+?^${}()|[\]\\]/g,
            "\\$&"
          );

      const regex =
        new RegExp(
          escapedSearch,
          "i"
        );

      filter.$or = [
        {
          name: regex,
        },
        {
          phone: regex,
        },
        {
          email: regex,
        },
        {
          city: regex,
        },
      ];
    }

    /* =================================================
       TYPE FILTER
    ================================================= */

    const allowedTypes = [
      "REGULAR",
      "WHOLESALE",
      "CREDIT",
    ];

    const finalType =
      String(
        customerType || ""
      )
        .trim()
        .toUpperCase();

    if (
      finalType &&
      allowedTypes.includes(
        finalType
      )
    ) {
      filter.customerType =
        finalType;
    }

    /* =================================================
       FETCH
    ================================================= */

    const [
      customers,
      total,
    ] = await Promise.all([
      Customer.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(pageLimit)
        .lean(),

      Customer.countDocuments(
        filter
      ),
    ]);

    /* =================================================
       TOTAL PAGES
    ================================================= */

    const totalPages =
      Math.max(
        1,
        Math.ceil(
          total /
            pageLimit
        )
      );

    /* =================================================
       RESPONSE
    ================================================= */

    return res.status(200).json({
      success: true,

      customers,

      pagination: {
        page:
          currentPage,

        limit:
          pageLimit,

        total,

        totalPages,
      },
    });
  } catch (error) {
    console.error(
      "Get Customers Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch customers.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =====================================================
   GET SINGLE CUSTOMER
   GET /api/customers/:id
===================================================== */

const getCustomerById = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    /* =================================================
       VALIDATE ID
    ================================================= */

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid customer ID.",
      });
    }

    /* =================================================
       FIND CUSTOMER
    ================================================= */

    const customer =
      await Customer.findOne({
        _id: id,
        isActive: true,
      }).lean();

    if (!customer) {
      return res.status(404).json({
        success: false,
        message:
          "Customer not found.",
      });
    }

    /* =================================================
       RESPONSE
    ================================================= */

    return res.status(200).json({
      success: true,

      customer,
    });
  } catch (error) {
    console.error(
      "Get Customer Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to fetch customer.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =====================================================
   UPDATE CUSTOMER
   PUT /api/customers/:id
===================================================== */

const updateCustomer = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    /* =================================================
       VALIDATE ID
    ================================================= */

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid customer ID.",
      });
    }

    /* =================================================
       FIND CUSTOMER
    ================================================= */

    const customer =
      await Customer.findOne({
        _id: id,
        isActive: true,
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message:
          "Customer not found.",
      });
    }

    const {
      name,
      phone,
      email,
      address,
      city,
      customerType,
      notes,
    } = req.body || {};

    /* =================================================
       NAME
    ================================================= */

    if (
      name !== undefined
    ) {
      const newName =
        typeof name === "string"
          ? name.trim()
          : "";

      if (!newName) {
        return res.status(400).json({
          success: false,
          message:
            "Customer name cannot be empty.",
        });
      }

      customer.name =
        newName;
    }

    /* =================================================
       PHONE
    ================================================= */

    if (
      phone !== undefined
    ) {
      const newPhone =
        typeof phone === "string"
          ? phone.trim()
          : "";

      if (newPhone) {
        const duplicate =
          await Customer.findOne({
            phone: newPhone,
            isActive: true,
            _id: {
              $ne: id,
            },
          });

        if (duplicate) {
          return res.status(409).json({
            success: false,
            message:
              "Another customer already uses this phone number.",
          });
        }
      }

      customer.phone =
        newPhone;
    }

    /* =================================================
       EMAIL
    ================================================= */

    if (
      email !== undefined
    ) {
      customer.email =
        typeof email ===
        "string"
          ? email
              .trim()
              .toLowerCase()
          : "";
    }

    /* =================================================
       ADDRESS
    ================================================= */

    if (
      address !== undefined
    ) {
      customer.address =
        typeof address ===
        "string"
          ? address.trim()
          : "";
    }

    /* =================================================
       CITY
    ================================================= */

    if (
      city !== undefined
    ) {
      customer.city =
        typeof city ===
        "string"
          ? city.trim()
          : "";
    }

    /* =================================================
       CUSTOMER TYPE
    ================================================= */

    if (
      customerType !==
      undefined
    ) {
      const allowedTypes = [
        "REGULAR",
        "WHOLESALE",
        "CREDIT",
      ];

      const newType =
        String(
          customerType
        )
          .trim()
          .toUpperCase();

      if (
        !allowedTypes.includes(
          newType
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid customer type.",
        });
      }

      customer.customerType =
        newType;
    }

    /* =================================================
       NOTES
    ================================================= */

    if (
      notes !== undefined
    ) {
      customer.notes =
        typeof notes ===
        "string"
          ? notes.trim()
          : "";
    }

    /* =================================================
       SAVE
    ================================================= */

    await customer.save();

    /* =================================================
       RESPONSE
    ================================================= */

    return res.status(200).json({
      success: true,

      message:
        "Customer updated successfully.",

      customer,
    });
  } catch (error) {
    console.error(
      "Update Customer Error:",
      error
    );

    if (
      error.code === 11000
    ) {
      return res.status(409).json({
        success: false,
        message:
          "Customer already exists.",
      });
    }

    return res.status(500).json({
      success: false,

      message:
        "Failed to update customer.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =====================================================
   DELETE CUSTOMER
   DELETE /api/customers/:id

   Soft delete
===================================================== */

const deleteCustomer = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    /* =================================================
       VALIDATE ID
    ================================================= */

    if (
      !mongoose.Types.ObjectId.isValid(
        id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid customer ID.",
      });
    }

    /* =================================================
       FIND CUSTOMER
    ================================================= */

    const customer =
      await Customer.findOne({
        _id: id,
        isActive: true,
      });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message:
          "Customer not found.",
      });
    }

    /* =================================================
       SOFT DELETE
    ================================================= */

    customer.isActive =
      false;

    await customer.save();

    /* =================================================
       RESPONSE
    ================================================= */

    return res.status(200).json({
      success: true,

      message:
        "Customer deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete Customer Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to delete customer.",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =====================================================
   EXPORT
===================================================== */

module.exports = {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};