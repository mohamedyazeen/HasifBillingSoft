require("dotenv").config();

/* =====================================================
   DNS FIX FOR MONGODB ATLAS
===================================================== */

const dns = require("dns");

dns.setServers(["8.8.8.8", "1.1.1.1"]);

/* =====================================================
   IMPORTS
===================================================== */

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");

/* =====================================================
   ROUTES
===================================================== */

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const purchaseRoutes = require("./routes/purchaseRoutes");
const billRoutes = require("./routes/billRoutes");
const customerRoutes = require("./routes/customerRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const settingsRoutes = require("./routes/settingsRoutes");

/* =====================================================
   MODEL
===================================================== */

const User = require("./models/User");

/* =====================================================
   APP
===================================================== */

const app = express();

const PORT = process.env.PORT || 5000;

/* =====================================================
   MIDDLEWARE
===================================================== */

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/* =====================================================
   HEALTH CHECK
===================================================== */

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HASIF STORE API is running.",
    status: "online",
  });
});

/* =====================================================
   API ROUTES
===================================================== */

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/purchases", purchaseRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/settings", settingsRoutes);

/* =====================================================
   404 HANDLER
===================================================== */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
    path: req.originalUrl,
  });
});

/* =====================================================
   ERROR HANDLER
===================================================== */

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error.",
  });
});

/* =====================================================
   CREATE / REPAIR ADMIN USER
===================================================== */

const createAdminUser = async () => {
  try {
    const adminUserId = (
      process.env.ADMIN_USER_ID || "hasif@store"
    )
      .trim()
      .toLowerCase();

    const adminPassword =
      process.env.ADMIN_PASSWORD || "12345678";

    /* ===============================================
       FIND ADMIN
    =============================================== */

    const existingAdmin = await User.findOne({
      userId: adminUserId,
    });

    /* ===============================================
       ADMIN ALREADY EXISTS
    =============================================== */

    if (existingAdmin) {
      if (
        !existingAdmin.passwordHash ||
        typeof existingAdmin.passwordHash !== "string"
      ) {
        console.log("Admin password hash missing.");
        console.log("Repairing admin password...");

        const passwordHash = await bcrypt.hash(
          adminPassword,
          12
        );

        existingAdmin.passwordHash = passwordHash;
        existingAdmin.role = "admin";
        existingAdmin.active = true;
        existingAdmin.mustChangePassword = true;

        await existingAdmin.save();

        console.log(
          "Admin password repaired successfully."
        );
      } else {
        console.log("Admin user already exists.");
      }

      return;
    }

    /* ===============================================
       CREATE NEW ADMIN
    =============================================== */

    console.log("Creating admin user...");

    const passwordHash = await bcrypt.hash(
      adminPassword,
      12
    );

    const admin = new User({
      userId: adminUserId,
      passwordHash,
      role: "admin",
      active: true,
      mustChangePassword: true,
    });

    await admin.save();

    console.log(
      "Admin user created successfully."
    );
  } catch (error) {
    console.error(
      "Create Admin Error:",
      error.message
    );

    throw error;
  }
};

/* =====================================================
   CREATE / REPAIR STAFF USER
===================================================== */

const createStaffUser = async () => {
  try {
    const staffUserId = (
      process.env.STAFF_USER_ID || "hasifstore"
    )
      .trim()
      .toLowerCase();

    const staffPassword =
      process.env.STAFF_PASSWORD || "hasif@123";

    /* ===============================================
       FIND STAFF
    =============================================== */

    const existingStaff = await User.findOne({
      userId: staffUserId,
    });

    /* ===============================================
       STAFF ALREADY EXISTS
    =============================================== */

    if (existingStaff) {
      let changed = false;

      /* ---------------------------------------------
         REPAIR PASSWORD HASH
      --------------------------------------------- */

      if (
        !existingStaff.passwordHash ||
        typeof existingStaff.passwordHash !== "string"
      ) {
        console.log("Staff password hash missing.");
        console.log("Repairing staff password...");

        const passwordHash = await bcrypt.hash(
          staffPassword,
          12
        );

        existingStaff.passwordHash = passwordHash;
        changed = true;
      }

      /* ---------------------------------------------
         REPAIR STAFF ROLE
      --------------------------------------------- */

      if (existingStaff.role !== "staff") {
        existingStaff.role = "staff";
        changed = true;
      }

      /* ---------------------------------------------
         ACTIVATE STAFF
      --------------------------------------------- */

      if (existingStaff.active !== true) {
        existingStaff.active = true;
        changed = true;
      }

      /* ---------------------------------------------
         STAFF DOES NOT NEED PASSWORD CHANGE
      --------------------------------------------- */

      if (existingStaff.mustChangePassword !== false) {
        existingStaff.mustChangePassword = false;
        changed = true;
      }

      if (changed) {
        await existingStaff.save();

        console.log(
          "Staff user already exists / repaired."
        );
      } else {
        console.log(
          "Staff user already exists."
        );
      }

      return;
    }

    /* ===============================================
       CREATE NEW STAFF
    =============================================== */

    console.log("Creating staff user...");

    const passwordHash = await bcrypt.hash(
      staffPassword,
      12
    );

    const staff = new User({
      userId: staffUserId,
      passwordHash,
      role: "staff",
      active: true,
      mustChangePassword: false,
    });

    await staff.save();

    console.log(
      "Staff user created successfully."
    );
  } catch (error) {
    console.error(
      "Create Staff Error:",
      error.message
    );

    throw error;
  }
};

/* =====================================================
   DATABASE CONNECTION
===================================================== */

const connectDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGO_URI is missing in environment variables."
      );
    }

    console.log("Connecting to MongoDB...");

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(
      "✓ Database connected successfully"
    );

    /* ---------------------------------------------
       CREATE / REPAIR ADMIN
    --------------------------------------------- */

    await createAdminUser();

    /* ---------------------------------------------
       CREATE / REPAIR STAFF
    --------------------------------------------- */

    await createStaffUser();

    return true;
  } catch (error) {
    console.error(
      "✗ Database connection failed"
    );

    console.error(error.message);

    return false;
  }
};

/* =====================================================
   START SERVER
===================================================== */

const startServer = async () => {
  console.log("");

  console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  );

  console.log(
    "       HASIF STORE SERVER"
  );

  console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  );

  /* ===============================================
     DATABASE FIRST
  =============================================== */

  const databaseConnected =
    await connectDatabase();

  /* ===============================================
     STOP IF DATABASE FAILED
  =============================================== */

  if (!databaseConnected) {
    console.error("");

    console.error(
      "Server was not started because MongoDB connection failed."
    );

    process.exit(1);
  }

  /* ===============================================
     START EXPRESS
  =============================================== */

  const server = app.listen(
    PORT,
    "0.0.0.0",
    () => {
      console.log(
        "✓ Server : Running"
      );

      console.log(
        `✓ Port   : ${PORT}`
      );

      console.log(
        `✓ API    : http://0.0.0.0:${PORT}`
      );

      console.log(
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      );

      console.log("");

      console.log(
        "✓ Database connected successfully"
      );

      console.log(
        "✓ Authentication : Ready"
      );

      console.log(
        "✓ Products API   : Ready"
      );

      console.log(
        "✓ Purchases API  : Ready"
      );

      console.log(
        "✓ Bills API      : Ready"
      );

      console.log(
        "✓ Customers API  : Ready"
      );

      console.log(
        "✓ Suppliers API  : Ready"
      );

      console.log(
        "✓ Settings API   : Ready"
      );

      console.log(
        "✓ Staff Login    : Ready"
      );

      console.log(
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
      );

      console.log("");
    }
  );

  /* ===============================================
     SERVER ERROR
  =============================================== */

  server.on("error", (error) => {
    console.error(
      "Server Error:",
      error.message
    );

    process.exit(1);
  });

  /* ===============================================
     GRACEFUL SHUTDOWN
  =============================================== */

  const shutdown = async (signal) => {
    try {
      console.log(
        `\n${signal} received. Shutting down...`
      );

      server.close(async () => {
        console.log(
          "HTTP server closed."
        );

        await mongoose.connection.close();

        console.log(
          "MongoDB connection closed."
        );

        process.exit(0);
      });
    } catch (error) {
      console.error(
        "Shutdown Error:",
        error.message
      );

      process.exit(1);
    }
  };

  process.on(
    "SIGINT",
    () => shutdown("SIGINT")
  );

  process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
  );
};

/* =====================================================
   START APPLICATION
===================================================== */

startServer();