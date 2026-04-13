const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const ADMIN_COOKIE_NAME = process.env.ADMIN_AUTH_COOKIE_NAME || "admin_auth_token";

const adminAuth = async (req, res, next) => {
  try {
    const token = req.cookies?.[ADMIN_COOKIE_NAME] || req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Admin authentication required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    if (decoded.role !== "admin" || !decoded.adminId) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin token",
      });
    }

    const admin = await Admin.findById(decoded.adminId).select("email lastLoginAt createdAt updatedAt");
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Admin account not found",
      });
    }

    req.admin = admin;
    req.adminId = admin._id;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Admin token has expired",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid admin token",
    });
  }
};

module.exports = adminAuth;
