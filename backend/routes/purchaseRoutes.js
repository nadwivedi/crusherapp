const express = require("express");
const {
  createPurchase,
  getAllPurchases,
  updatePurchase,
  deletePurchase,
} = require("../controllers/purchaseController");
const auth = require("../middleware/auth");
const checkPermission = require("../middleware/role");

const router = express.Router();

router.use(auth);

router.get("/", getAllPurchases);
router.post("/", checkPermission("add"), createPurchase);
router.put("/:id", checkPermission("edit"), updatePurchase);
router.delete("/:id", checkPermission("edit"), deletePurchase);

module.exports = router;
