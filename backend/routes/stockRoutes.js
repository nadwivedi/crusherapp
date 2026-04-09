const express = require("express");
const {
  createStock,
  getAllStocks,
  getStockById,
  editStock,
  deleteStock,
} = require("../controllers/stockController");
const auth = require("../middleware/auth");
const checkPermission = require("../middleware/role");

const router = express.Router();

router.use(auth);

router.get("/", getAllStocks);
router.get("/:id", getStockById);
router.post("/", checkPermission("add"), createStock);
router.put("/:id", checkPermission("edit"), editStock);
router.delete("/:id", checkPermission("edit"), deleteStock);

module.exports = router;
