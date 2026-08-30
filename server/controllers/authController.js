const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");

/* =====================================================
   CREATE TOKEN
===================================================== */

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id.toString(),
      userId: user.userId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};

/* =====================================================
   LOGIN
   POST /api/auth/login
===================================================== */

const login = async (req, res) => {
  try {
    const { userId, password } =
      req.body || {};

    const loginUserId =
      typeof userId === "string"
        ? userId.trim().toLowerCase()
        : "";

    const loginPassword =
      typeof password === "string"
        ? password
        : "";

    /* ===============================================
       VALIDATION
    =============================================== */

    if (!loginUserId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required.",
      });
    }

    if (!loginPassword) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    /* ===============================================
       FIND USER
    =============================================== */

    const user =
      await User.findOne({
        userId: loginUserId,
      });

    if (!user) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid User ID or password.",
      });
    }

    /* ===============================================
       ACTIVE CHECK
    =============================================== */

    if (user.active === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive.",
      });
    }

    /* ===============================================
       PASSWORD HASH CHECK
    =============================================== */

    if (
      !user.passwordHash ||
      typeof user.passwordHash !== "string"
    ) {
      console.error(
        "LOGIN ERROR: passwordHash is missing for:",
        user.userId
      );

      return res.status(500).json({
        success: false,
        message:
          "Password setup is incomplete. Please restart the server to repair the admin account.",
      });
    }

    /* ===============================================
       COMPARE PASSWORD
    =============================================== */

    const passwordMatch =
      await bcrypt.compare(
        loginPassword,
        user.passwordHash
      );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message:
          "Invalid User ID or password.",
      });
    }

    /* ===============================================
       CREATE JWT
    =============================================== */

    const token =
      createToken(user);

    /* ===============================================
       SUCCESS
    =============================================== */

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,

      user: {
        id: user._id,
        userId: user.userId,
        role: user.role,
        active: user.active,
        mustChangePassword:
          user.mustChangePassword,
      },
    });
  } catch (error) {
    console.error(
      "Login Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Login failed. Please try again.",
    });
  }
};

/* =====================================================
   CHANGE PASSWORD
   PUT /api/auth/change-password
===================================================== */

const changePassword =
  async (req, res) => {
    try {
      if (
        !req.user ||
        !req.user.id
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required.",
        });
      }

      const {
        currentPassword,
        newPassword,
      } = req.body || {};

      if (
        typeof currentPassword !==
          "string" ||
        !currentPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Current password is required.",
        });
      }

      if (
        typeof newPassword !==
          "string" ||
        !newPassword
      ) {
        return res.status(400).json({
          success: false,
          message:
            "New password is required.",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be at least 6 characters.",
        });
      }

      const user =
        await User.findById(
          req.user.id
        );

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found.",
        });
      }

      if (user.active === false) {
        return res.status(403).json({
          success: false,
          message:
            "Your account is inactive.",
        });
      }

      if (
        !user.passwordHash ||
        typeof user.passwordHash !== "string"
      ) {
        return res.status(500).json({
          success: false,
          message:
            "Password setup is incomplete.",
        });
      }

      /* =============================================
         CURRENT PASSWORD
      ============================================= */

      const currentMatch =
        await bcrypt.compare(
          currentPassword,
          user.passwordHash
        );

      if (!currentMatch) {
        return res.status(401).json({
          success: false,
          message:
            "Current password is incorrect.",
        });
      }

      /* =============================================
         SAME PASSWORD CHECK
      ============================================= */

      const samePassword =
        await bcrypt.compare(
          newPassword,
          user.passwordHash
        );

      if (samePassword) {
        return res.status(400).json({
          success: false,
          message:
            "New password must be different from current password.",
        });
      }

      /* =============================================
         HASH NEW PASSWORD
      ============================================= */

      user.passwordHash =
        await bcrypt.hash(
          newPassword,
          12
        );

      user.mustChangePassword =
        false;

      await user.save();

      return res.status(200).json({
        success: true,
        message:
          "Password changed successfully.",
      });
    } catch (error) {
      console.error(
        "Change Password Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to change password.",
      });
    }
  };

/* =====================================================
   GET CURRENT USER
   GET /api/auth/me
===================================================== */

const getMe = async (
  req,
  res
) => {
  try {
    if (
      !req.user ||
      !req.user.id
    ) {
      return res.status(401).json({
        success: false,
        message:
          "Authentication required.",
      });
    }

    const user =
      await User.findById(
        req.user.id
      ).select(
        "-passwordHash"
      );

    if (!user) {
      return res.status(404).json({
        success: false,
        message:
          "User not found.",
      });
    }

    if (user.active === false) {
      return res.status(403).json({
        success: false,
        message:
          "Your account is inactive.",
      });
    }

    return res.status(200).json({
      success: true,

      user: {
        id: user._id,
        userId: user.userId,
        role: user.role,
        active: user.active,
        mustChangePassword:
          user.mustChangePassword,
        createdAt:
          user.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Get Me Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to get user information.",
    });
  }
};

/* =====================================================
   EXPORT
===================================================== */

module.exports = {
  login,
  changePassword,
  getMe,
};