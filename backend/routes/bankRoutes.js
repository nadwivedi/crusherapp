const express = require("express");
const {
  createBank,
  getAllBanks,
  updateBank,
  deleteBank,
} = require("../controllers/bankController");

const router = express.Router();

router.get("/", getAllBanks);
router.post("/", createBank);
router.put("/:id", updateBank);
router.delete("/:id", deleteBank);

module.exports = router;
