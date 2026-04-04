const mongoose = require("mongoose");
const Boulder = require("../models/Boulder");
const Counter = require("../models/Counter");
const Party = require("../models/Party");
const Vehicle = require("../models/Vehicle");

const getCurrentTime = () => {
  const now = new Date();
  const hours = `${now.getHours()}`.padStart(2, "0");
  const minutes = `${now.getMinutes()}`.padStart(2, "0");
  return `${hours}:${minutes}`;
};

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

const normalizeVehicleNo = (value) => `${value || ""}`.trim().toUpperCase();

const resolveVehicleParty = async (payload) => {
  if (payload.partyId && mongoose.Types.ObjectId.isValid(payload.partyId)) {
    const existingParty = await Party.findById(payload.partyId);
    if (existingParty) return existingParty._id;
  }

  const partyName = typeof payload.partyName === "string"
    ? payload.partyName.trim()
    : "";

  if (!partyName) {
    return null;
  }

  const existingParty = await Party.findOne({
    name: { $regex: `^${partyName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
  });

  if (existingParty) {
    return existingParty._id;
  }

  const createdParty = await Party.create({
    name: partyName,
    type: "customer",
  });

  return createdParty._id;
};

const resolvePartySnapshot = async ({ partyId, partyName, fallbackPartyId = null }) => {
  const primaryPartyId = partyId && mongoose.Types.ObjectId.isValid(partyId) ? partyId : null;
  const fallbackId = fallbackPartyId && mongoose.Types.ObjectId.isValid(fallbackPartyId) ? fallbackPartyId : null;

  if (primaryPartyId) {
    const party = await Party.findById(primaryPartyId).select("name");
    if (party?.name) {
      return { partyId: party._id, partyName: party.name };
    }
  }

  const trimmedPartyName = typeof partyName === "string" ? partyName.trim() : "";
  if (trimmedPartyName) {
    return { partyId: primaryPartyId || null, partyName: trimmedPartyName };
  }

  if (fallbackId) {
    const fallbackParty = await Party.findById(fallbackId).select("name");
    if (fallbackParty?.name) {
      return { partyId: fallbackParty._id, partyName: fallbackParty.name };
    }
  }

  return { partyId: null, partyName: "" };
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

  if (normalizedPayload.boulderTime !== undefined) {
    normalizedPayload.boulderTime = `${normalizedPayload.boulderTime}`.trim().slice(0, 5);
  }

  if (normalizedPayload.entryTime !== undefined) {
    normalizedPayload.entryTime = `${normalizedPayload.entryTime || ""}`.trim().slice(0, 5);
  }

  if (normalizedPayload.exitTime !== undefined) {
    normalizedPayload.exitTime = `${normalizedPayload.exitTime || ""}`.trim().slice(0, 5);
  }

  if (!normalizedPayload.boulderTime) {
    normalizedPayload.boulderTime = getCurrentTime();
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
    const normalizedVehicleNo = normalizeVehicleNo(normalizedPayload.vehicleNo);
    vehicle = await Vehicle.findOne({
      vehicleNo: normalizedVehicleNo,
    });

    if (!vehicle) {
      const resolvedPartyId = await resolveVehicleParty(normalizedPayload);
      const tareWeight = Number(normalizedPayload.tareWeight);

      vehicle = await Vehicle.create({
        partyId: resolvedPartyId,
        vehicleNo: normalizedVehicleNo,
        unladenWeight: Number.isFinite(tareWeight) && tareWeight >= 0 ? tareWeight : 0,
        vehicleType: "boulder",
      });
    }
  }

  if (vehicle) {
    normalizedPayload.vehicleId = vehicle._id;
    normalizedPayload.vehicleNo = vehicle.vehicleNo;
    const partySnapshot = await resolvePartySnapshot({
      partyId: normalizedPayload.partyId,
      partyName: normalizedPayload.partyName,
      fallbackPartyId: vehicle.partyId,
    });
    normalizedPayload.partyId = partySnapshot.partyId;
    normalizedPayload.partyName = partySnapshot.partyName;

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
  } else {
    const partySnapshot = await resolvePartySnapshot({
      partyId: normalizedPayload.partyId,
      partyName: normalizedPayload.partyName,
    });
    normalizedPayload.partyId = partySnapshot.partyId;
    normalizedPayload.partyName = partySnapshot.partyName;
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
