const mongoose = require("mongoose");
const Bank = require("../models/Bank");
const { scopedFilter, scopedIdFilter } = require("../utils/ownership");

const CASH_ACCOUNT_NAME = "Cash Account";

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeBankName = (value) => String(value || "").trim();

const ensureCashAccount = async (userId) => {
  const existingCashAccount = await Bank.findOne({
    userId,
    name: { $regex: `^${CASH_ACCOUNT_NAME}$`, $options: "i" },
  });

  if (existingCashAccount) return existingCashAccount;

  return Bank.create({
    userId,
    name: CASH_ACCOUNT_NAME,
    totalBalance: 0,
    notes: "",
  });
};

const createBank = async (req, res) => {
  try {
    const name = normalizeBankName(req.body.name);
    if (!name) {
      return res.status(400).json({ message: "Bank name is required" });
    }

    const bank = await Bank.create({
      userId: req.userId,
      name,
      totalBalance: Math.max(0, toNumber(req.body.totalBalance)),
      notes: String(req.body.notes || "").trim(),
    });

    return res.status(201).json({ data: bank });
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create bank",
      error: error.message,
    });
  }
};

const getAllBanks = async (req, res) => {
  try {
    await ensureCashAccount(req.userId);

    const normalizedSearch = String(req.query.search || "").trim();
    const filter = scopedFilter(req, normalizedSearch
      ? {
          name: { $regex: normalizedSearch, $options: "i" },
        }
      : {});

    const banks = await Bank.find(filter).sort({ name: 1, createdAt: -1 });
    return res.json({ data: banks });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch banks",
      error: error.message,
    });
  }
};

const updateBank = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid bank id" });
  }

  try {
    const name = normalizeBankName(req.body.name);
    if (!name) {
      return res.status(400).json({ message: "Bank name is required" });
    }

    const bank = await Bank.findOneAndUpdate(
      scopedIdFilter(req, id),
      {
        name,
        totalBalance: Math.max(0, toNumber(req.body.totalBalance)),
        notes: String(req.body.notes || "").trim(),
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!bank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    return res.json({ data: bank });
  } catch (error) {
    return res.status(400).json({
      message: "Failed to update bank",
      error: error.message,
    });
  }
};

const deleteBank = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid bank id" });
  }

  try {
    const bank = await Bank.findOne(scopedIdFilter(req, id));

    if (!bank) {
      return res.status(404).json({ message: "Bank not found" });
    }

    if (normalizeBankName(bank.name).toLowerCase() === CASH_ACCOUNT_NAME.toLowerCase()) {
      return res.status(400).json({ message: "Cash Account cannot be deleted" });
    }

    await Bank.deleteOne(scopedIdFilter(req, id));
    return res.json({ message: "Bank deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete bank",
      error: error.message,
    });
  }
};

module.exports = {
  createBank,
  getAllBanks,
  updateBank,
  deleteBank,
};
