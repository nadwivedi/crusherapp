const express = require("express");
const {
  createPayment,
  getAllPayments,
} = require("../controllers/paymentController");
const auth = require("../middleware/auth");
const checkPermission = require("../middleware/role");

const router = express.Router();

router.use(auth);

router.get("/", getAllPayments);
router.post("/", checkPermission("add"), createPayment);

module.exports = router;
