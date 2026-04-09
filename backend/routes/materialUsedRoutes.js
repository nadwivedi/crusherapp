const express = require("express");
const {
  createMaterialUsed,
  getAllMaterialUsed,
  updateMaterialUsed,
  deleteMaterialUsed,
} = require("../controllers/materialUsedController");
const auth = require("../middleware/auth");
const checkPermission = require("../middleware/role");

const router = express.Router();

router.use(auth);

router.get("/", getAllMaterialUsed);
router.post("/", checkPermission("add"), createMaterialUsed);
router.put("/:id", checkPermission("edit"), updateMaterialUsed);
router.delete("/:id", checkPermission("edit"), deleteMaterialUsed);

module.exports = router;
