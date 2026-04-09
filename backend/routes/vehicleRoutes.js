const express = require("express");
const {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  editVehicle,
  deleteVehicle,
} = require("../controllers/vehicleController");
const auth = require("../middleware/auth");
const checkPermission = require("../middleware/role");

const router = express.Router();

router.use(auth);

router.get("/", getAllVehicles);
router.get("/:id", getVehicleById);
router.post("/", checkPermission("add"), createVehicle);
router.put("/:id", checkPermission("edit"), editVehicle);
router.delete("/:id", checkPermission("edit"), deleteVehicle);

module.exports = router;
