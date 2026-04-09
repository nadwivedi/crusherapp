const express = require("express");
const {
  createBank,
  getAllBanks,
  updateBank,
  deleteBank,
} = require("../controllers/bankController");
const auth = require("../middleware/auth");
const checkPermission = require("../middleware/role");

const router = express.Router();

router.use(auth);

router.get("/", getAllBanks);
router.post("/", checkPermission("add"), createBank);
router.put("/:id", checkPermission("edit"), updateBank);
router.delete("/:id", checkPermission("edit"), deleteBank);

module.exports = router;
