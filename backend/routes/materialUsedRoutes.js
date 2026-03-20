const express = require("express");
const {
  createMaterialUsed,
  getAllMaterialUsed,
  updateMaterialUsed,
  deleteMaterialUsed,
} = require("../controllers/materialUsedController");

const router = express.Router();

router.get("/", getAllMaterialUsed);
router.post("/", createMaterialUsed);
router.put("/:id", updateMaterialUsed);
router.delete("/:id", deleteMaterialUsed);

module.exports = router;
