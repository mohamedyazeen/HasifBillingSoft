const Settings = require("../models/Settings");

/* =====================================================
   GET SETTINGS
   GET /api/settings
===================================================== */

const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();

    /* ---------------------------------------------
       CREATE DEFAULT SETTINGS IF NOT EXISTS
    --------------------------------------------- */

    if (!settings) {
      settings = await Settings.create({
        storeName: "HASIF STORE",
        phone: "",
        address: "",
        email: "",
        gstNumber: "",
        invoicePrefix: "INV-",
        invoiceFooter:
          "Thank you for shopping with us.",
        lowStockThreshold: 5,
        outOfStockWarning: true,
      });
    }

    return res.status(200).json({
      success: true,
      settings,
    });

  } catch (error) {
    console.error(
      "Get Settings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to load settings.",
    });
  }
};


/* =====================================================
   UPDATE SETTINGS
   PUT /api/settings
===================================================== */

const updateSettings = async (req, res) => {
  try {
    const {
      phone,
      address,
      email,
      gstNumber,
      invoicePrefix,
      invoiceFooter,
      lowStockThreshold,
      outOfStockWarning,
    } = req.body;

    let settings =
      await Settings.findOne();

    /* ---------------------------------------------
       CREATE IF NOT EXISTS
    --------------------------------------------- */

    if (!settings) {
      settings = new Settings({
        storeName: "HASIF STORE",
      });
    }

    /* ---------------------------------------------
       STORE NAME PERMANENT
    --------------------------------------------- */

    settings.storeName =
      "HASIF STORE";

    /* ---------------------------------------------
       STORE INFORMATION
    --------------------------------------------- */

    if (phone !== undefined) {
      settings.phone =
        String(phone).trim();
    }

    if (address !== undefined) {
      settings.address =
        String(address).trim();
    }

    if (email !== undefined) {
      settings.email =
        String(email)
          .trim()
          .toLowerCase();
    }

    if (gstNumber !== undefined) {
      settings.gstNumber =
        String(gstNumber)
          .trim()
          .toUpperCase();
    }

    /* ---------------------------------------------
       INVOICE SETTINGS
    --------------------------------------------- */

    if (invoicePrefix !== undefined) {
      settings.invoicePrefix =
        String(invoicePrefix).trim();
    }

    if (invoiceFooter !== undefined) {
      settings.invoiceFooter =
        String(invoiceFooter).trim();
    }

    /* ---------------------------------------------
       INVENTORY SETTINGS
    --------------------------------------------- */

    if (
      lowStockThreshold !== undefined
    ) {
      const threshold =
        Number(lowStockThreshold);

      if (
        Number.isNaN(threshold) ||
        threshold < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Low stock threshold must be a valid number.",
        });
      }

      settings.lowStockThreshold =
        threshold;
    }

    if (
      outOfStockWarning !== undefined
    ) {
      settings.outOfStockWarning =
        Boolean(outOfStockWarning);
    }

    await settings.save();

    return res.status(200).json({
      success: true,
      message:
        "Settings updated successfully.",
      settings,
    });

  } catch (error) {
    console.error(
      "Update Settings Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update settings.",
    });
  }
};


/* =====================================================
   EXPORT
===================================================== */

module.exports = {
  getSettings,
  updateSettings,
};