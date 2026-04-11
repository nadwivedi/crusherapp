const express = require("express");
const {
  createPayment,
  getAllPayments,
  deletePayment,
} = require("../controllers/paymentController");
const auth = require("../middleware/auth");
const checkPermission = require("../middleware/role");

const router = express.Router();

router.use(auth);

router.get("/", getAllPayments);
router.post("/", checkPermission("add"), createPayment);
router.delete("/:id", checkPermission("edit"), deletePayment);

module.exports = router;
