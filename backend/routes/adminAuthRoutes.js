const express = require("express");
const {
  loginAdmin,
  getCurrentAdmin,
  logoutAdmin,
} = require("../controllers/adminAuthController");
const adminAuth = require("../middleware/adminAuth");

const router = express.Router();

router.post("/login", loginAdmin);
router.get("/current", adminAuth, getCurrentAdmin);
router.post("/logout", adminAuth, logoutAdmin);

module.exports = router;
