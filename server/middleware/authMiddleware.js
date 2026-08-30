const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* =====================================================
   AUTH MIDDLEWARE
===================================================== */

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    /* -------------------------------------------------
       CHECK AUTHORIZATION HEADER
    ------------------------------------------------- */

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    /* -------------------------------------------------
       GET TOKEN
    ------------------------------------------------- */

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing.",
      });
    }

    /* -------------------------------------------------
       VERIFY TOKEN
    ------------------------------------------------- */

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    /* -------------------------------------------------
       FIND USER FROM DATABASE

       This is important because Purchase.createdBy
       requires MongoDB User _id.
    ------------------------------------------------- */

    let user = null;

    /* If token already contains MongoDB id */
    if (decoded.id) {
      user = await User.findById(decoded.id);
    }

    /* If token contains only userId */
    if (!user && decoded.userId) {
      user = await User.findOne({
        userId: decoded.userId.toLowerCase(),
      });
    }

    /* -------------------------------------------------
       USER NOT FOUND
    ------------------------------------------------- */

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User account not found.",
      });
    }

    /* -------------------------------------------------
       CHECK ACTIVE
    ------------------------------------------------- */

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive.",
      });
    }

    /* -------------------------------------------------
       SET req.user

       IMPORTANT:
       id = MongoDB ObjectId

       userId = login ID
       role = admin/staff/manager
    ------------------------------------------------- */

    req.user = {
      id: user._id.toString(),
      _id: user._id.toString(),
      userId: user.userId,
      role: user.role,
      active: user.active,
      mustChangePassword: user.mustChangePassword,
    };

    next();

  } catch (error) {
    console.error(
      "Authentication Error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};


/* =====================================================
   ADMIN ONLY
===================================================== */

const adminOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required.",
      });
    }

    next();

  } catch (error) {
    console.error(
      "Admin Authorization Error:",
      error.message
    );

    return res.status(403).json({
      success: false,
      message: "Access denied.",
    });
  }
};


/* =====================================================
   EXPORT
===================================================== */

module.exports = authMiddleware;
module.exports.protect = authMiddleware;
module.exports.adminOnly = adminOnly;