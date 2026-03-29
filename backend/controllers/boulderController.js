const mongoose = require("mongoose");
const Boulder = require("../models/Boulder");
const Counter = require("../models/Counter");
const Vehicle = require("../models/Vehicle");

const getBoulderYear = (boulderDateValue) => {
  const boulderDate = boulderDateValue ? new Date(boulderDateValue) : new Date();
  if (Number.isNaN(boulderDate.getTime())) {
    return new Date().getFullYear();
  }
  return boulderDate.getFullYear();
};

const createBoulderNumber = async (boulderDateValue) => {
  const boulderYear = getBoulderYear(boulderDateValue);
  const counterKey = `boulders:${boulderYear}`;
  const counter = await Counter.findOneAndUpdate(
    { key: counterKey },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return `BOL-${boulderYear}-${String(counter.seq).padStart(2, "0")}`;
};

const normalizeBoulderPayload = async (payload) => {
  const normalizedPayload = { ...payload };
  const hasVehicleId =
    normalizedPayload.vehicleId !== undefined &&
    normalizedPayload.vehicleId !== null &&
    `${normalizedPayload.vehicleId}`.trim() !== "";
  const hasVehicleNo =
    typeof normalizedPayload.vehicleNo === "string" &&
    normalizedPayload.vehicleNo.trim() !== "";

  if (
    normalizedPayload.tareWeight === undefined &&
    normalizedPayload.vehicleWeight !== undefined
  ) {
    normalizedPayload.tareWeight = normalizedPayload.vehicleWeight;
  }

  if (
    normalizedPayload.grossWeight === undefined &&
    normalizedPayload.netWeight !== undefined &&
    (
      normalizedPayload.boulderWeight !== undefined ||
      normalizedPayload.vehicleWeight !== undefined
    )
  ) {
    normalizedPayload.grossWeight = normalizedPayload.netWeight;
  }

  if (
    normalizedPayload.netWeight === undefined &&
    normalizedPayload.boulderWeight !== undefined
  ) {
    normalizedPayload.netWeight = normalizedPayload.boulderWeight;
  }

  if (
    normalizedPayload.netWeight === undefined &&
    normalizedPayload.grossWeight !== undefined &&
    normalizedPayload.tareWeight !== undefined
  ) {
    normalizedPayload.netWeight =
      Number(normalizedPayload.grossWeight) - Number(normalizedPayload.tareWeight);
  }

  delete normalizedPayload.weight;
  delete normalizedPayload.vehicleWeight;
  delete normalizedPayload.boulderWeight;

  if (normalizedPayload.boulderDate !== undefined) {
    normalizedPayload.boulderDate = new Date(normalizedPayload.boulderDate);
  }

  let vehicle = null;

  if (hasVehicleId) {
    if (!mongoose.Types.ObjectId.isValid(normalizedPayload.vehicleId)) {
      throw new Error("Invalid vehicle id");
    }

    vehicle = await Vehicle.findById(normalizedPayload.vehicleId);

    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
  } else if (hasVehicleNo) {
    vehicle = await Vehicle.findOne({
      vehicleNo: normalizedPayload.vehicleNo.trim().toUpperCase(),
    });

    if (!vehicle) {
      throw new Error("Vehicle not found");
    }
  }

  if (vehicle) {
    normalizedPayload.vehicleId = vehicle._id;
    normalizedPayload.vehicleNo = vehicle.vehicleNo;

    if (normalizedPayload.tareWeight === undefined) {
      normalizedPayload.tareWeight = vehicle.unladenWeight;
    }

    if (
      normalizedPayload.netWeight === undefined &&
      normalizedPayload.grossWeight !== undefined &&
      normalizedPayload.tareWeight !== undefined
    ) {
      normalizedPayload.netWeight =
        Number(normalizedPayload.grossWeight) - Number(normalizedPayload.tareWeight);
    }
  }

  return normalizedPayload;
};

const createBoulder = async (req, res) => {
  try {
    const payload = await normalizeBoulderPayload(req.body);
    payload.boulderNumber = await createBoulderNumber(payload.boulderDate);
    const boulder = await Boulder.create(payload);
    return res.status(201).json(boulder);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create boulder",
      error: error.message,
    });
  }
};

const getAllBoulders = async (_req, res) => {
  try {
    const boulders = await Boulder.find()
      .populate("vehicleId")
      .sort({ boulderDate: -1, createdAt: -1 });
    return res.json(boulders);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch boulders",
      error: error.message,
    });
  }
};

const getBoulderById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid boulder id" });
  }

  try {
    const boulder = await Boulder.findById(id).populate("vehicleId");

    if (!boulder) {
      return res.status(404).json({ message: "Boulder not found" });
    }

    return res.json(boulder);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch boulder",
      error: error.message,
    });
  }
};

const editBoulder = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid boulder id" });
  }

  try {
    const payload = await normalizeBoulderPayload(req.body);
    const existingBoulder = await Boulder.findById(id).select("boulderNumber");
    if (existingBoulder?.boulderNumber) {
      payload.boulderNumber = existingBoulder.boulderNumber;
    }
    const boulder = await Boulder.findByIdAndUpdate(id, payload, {
      new: true,
      runValidators: true,
    }).populate("vehicleId");

    if (!boulder) {
      return res.status(404).json({ message: "Boulder not found" });
    }

    return res.json(boulder);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to update boulder",
      error: error.message,
    });
  }
};

const deleteBoulder = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid boulder id" });
  }

  try {
    const boulder = await Boulder.findByIdAndDelete(id);

    if (!boulder) {
      return res.status(404).json({ message: "Boulder not found" });
    }

    return res.json({ message: "Boulder deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete boulder",
      error: error.message,
    });
  }
};

module.exports = {
  createBoulder,
  getAllBoulders,
  getBoulderById,
  editBoulder,
  deleteBoulder,
};
