const express = require("express");
const {
  createBoulder,
  getAllBoulders,
  getBoulderById,
  editBoulder,
  deleteBoulder,
} = require("../controllers/boulderController");
const auth = require("../middleware/auth");
const checkPermission = require("../middleware/role");

const router = express.Router();

router.use(auth);

router.get("/", getAllBoulders);
router.get("/:id", getBoulderById);
router.post("/", checkPermission("add"), createBoulder);
router.put("/:id", checkPermission("edit"), editBoulder);
router.delete("/:id", checkPermission("edit"), deleteBoulder);

module.exports = router;
