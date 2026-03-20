const mongoose = require("mongoose");
const MaterialUsed = require("../models/MaterialUsed");
const Stock = require("../models/Stock");
const Vehicle = require("../models/Vehicle");

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const adjustStock = async (stockId, quantityChange) => {
  const stock = await Stock.findById(stockId);
  if (!stock) {
    throw new Error("Material type not found");
  }

  const nextStock = toNumber(stock.currentStock) + quantityChange;
  if (nextStock < 0) {
    throw new Error(`Insufficient stock for ${stock.name}`);
  }

  stock.currentStock = nextStock;
  await stock.save();
  return stock;
};

const populateMaterialUsed = (id) => (
  MaterialUsed.findById(id)
    .populate("vehicle", "vehicleNo")
    .populate("materialType", "name unit")
);

const createMaterialUsed = async (req, res) => {
  try {
    const usedQty = toNumber(req.body.usedQty);
    if (usedQty <= 0) {
      return res.status(400).json({ message: "Used quantity must be greater than 0" });
    }

    if (!req.body.materialType || !mongoose.Types.ObjectId.isValid(req.body.materialType)) {
      return res.status(400).json({ message: "Valid material type is required" });
    }

    const stock = await Stock.findById(req.body.materialType);
    if (!stock) {
      return res.status(404).json({ message: "Material type not found" });
    }

    let vehicle = null;
    if (req.body.vehicle) {
      if (!mongoose.Types.ObjectId.isValid(req.body.vehicle)) {
        return res.status(400).json({ message: "Invalid vehicle id" });
      }

      vehicle = await Vehicle.findById(req.body.vehicle);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
    }

    await adjustStock(stock._id, -usedQty);

    const materialUsed = await MaterialUsed.create({
      vehicle: vehicle?._id || null,
      vehicleNo: vehicle?.vehicleNo || "",
      materialType: stock._id,
      materialTypeName: stock.name,
      unit: stock.unit || "",
      usedQty,
      usedDate: req.body.usedDate ? new Date(req.body.usedDate) : new Date(),
      notes: String(req.body.notes || "").trim(),
    });

    const savedEntry = await populateMaterialUsed(materialUsed._id);
    return res.status(201).json({ data: savedEntry });
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create material used entry",
      error: error.message,
    });
  }
};

const getAllMaterialUsed = async (req, res) => {
  try {
    const normalizedSearch = String(req.query.search || "").trim();
    const filter = {};

    if (normalizedSearch) {
      filter.$or = [
        { vehicleNo: { $regex: normalizedSearch, $options: "i" } },
        { materialTypeName: { $regex: normalizedSearch, $options: "i" } },
        { notes: { $regex: normalizedSearch, $options: "i" } },
      ];
    }

    const entries = await MaterialUsed.find(filter)
      .populate("vehicle", "vehicleNo")
      .populate("materialType", "name unit")
      .sort({ usedDate: -1, createdAt: -1 });

    return res.json({ data: entries });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch material used entries",
      error: error.message,
    });
  }
};

const updateMaterialUsed = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid material used id" });
  }

  try {
    const entry = await MaterialUsed.findById(id);
    if (!entry) {
      return res.status(404).json({ message: "Material used entry not found" });
    }

    const usedQty = toNumber(req.body.usedQty);
    if (usedQty <= 0) {
      return res.status(400).json({ message: "Used quantity must be greater than 0" });
    }

    if (!req.body.materialType || !mongoose.Types.ObjectId.isValid(req.body.materialType)) {
      return res.status(400).json({ message: "Valid material type is required" });
    }

    const stock = await Stock.findById(req.body.materialType);
    if (!stock) {
      return res.status(404).json({ message: "Material type not found" });
    }

    let vehicle = null;
    if (req.body.vehicle) {
      if (!mongoose.Types.ObjectId.isValid(req.body.vehicle)) {
        return res.status(400).json({ message: "Invalid vehicle id" });
      }

      vehicle = await Vehicle.findById(req.body.vehicle);
      if (!vehicle) {
        return res.status(404).json({ message: "Vehicle not found" });
      }
    }

    await adjustStock(entry.materialType, entry.usedQty);
    try {
      await adjustStock(stock._id, -usedQty);
    } catch (error) {
      await adjustStock(entry.materialType, -entry.usedQty);
      throw error;
    }

    entry.vehicle = vehicle?._id || null;
    entry.vehicleNo = vehicle?.vehicleNo || "";
    entry.materialType = stock._id;
    entry.materialTypeName = stock.name;
    entry.unit = stock.unit || "";
    entry.usedQty = usedQty;
    entry.usedDate = req.body.usedDate ? new Date(req.body.usedDate) : entry.usedDate;
    entry.notes = String(req.body.notes || "").trim();

    await entry.save();

    const savedEntry = await populateMaterialUsed(entry._id);
    return res.json({ data: savedEntry });
  } catch (error) {
    return res.status(400).json({
      message: "Failed to update material used entry",
      error: error.message,
    });
  }
};

const deleteMaterialUsed = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid material used id" });
  }

  try {
    const entry = await MaterialUsed.findById(id);
    if (!entry) {
      return res.status(404).json({ message: "Material used entry not found" });
    }

    await adjustStock(entry.materialType, entry.usedQty);
    await MaterialUsed.findByIdAndDelete(id);

    return res.json({ message: "Material used entry deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete material used entry",
      error: error.message,
    });
  }
};

module.exports = {
  createMaterialUsed,
  getAllMaterialUsed,
  updateMaterialUsed,
  deleteMaterialUsed,
};
