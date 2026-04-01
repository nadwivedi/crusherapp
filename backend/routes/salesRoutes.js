const express = require("express");
const {
  createSales,
  getAllSales,
  getSalesById,
  editSales,
  deleteSales,
} = require("../controllers/salesController");

const auth = require("../middleware/auth");
const checkPermission = require("../middleware/role");

const router = express.Router();

// Apply authentication middleware to all sales routes
router.use(auth);

router.get("/", getAllSales);
router.get("/:id", getSalesById);
router.post("/", checkPermission('add'), createSales);
router.put("/:id", checkPermission('edit'), editSales);
router.delete("/:id", checkPermission('edit'), deleteSales);

module.exports = router;
