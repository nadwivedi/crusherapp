const express = require("express");
const {
  createReceipt,
  getAllReceipts,
  deleteReceipt,
} = require("../controllers/receiptController");
const auth = require("../middleware/auth");
const checkPermission = require("../middleware/role");

const router = express.Router();

router.use(auth);

router.get("/", getAllReceipts);
router.post("/", checkPermission("add"), createReceipt);
router.delete("/:id", checkPermission("edit"), deleteReceipt);

module.exports = router;
