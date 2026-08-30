const bcrypt = require("bcryptjs");
const User = require("../models/User");

const createAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({
      userId: "hasif@store",
    });

    if (existingAdmin) {
      console.log("Admin user already exists.");
      return;
    }

    const passwordHash = await bcrypt.hash("12345678", 12);

    await User.create({
      userId: "hasif@store",
      passwordHash,
      role: "admin",
      active: true,
      mustChangePassword: true,
    });

    console.log("Admin user created successfully.");
    console.log("User ID: hasif@store");
    console.log("Initial password: 12345678");
  } catch (error) {
    console.error("Create Admin Error:", error.message);
  }
};

module.exports = createAdmin;