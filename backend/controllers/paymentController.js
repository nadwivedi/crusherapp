const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Purchase = require("../models/Purchase");
const Counter = require("../models/Counter");

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getPaymentYear = (paymentDateValue) => {
  const paymentDate = paymentDateValue ? new Date(paymentDateValue) : new Date();
  if (Number.isNaN(paymentDate.getTime())) {
    return new Date().getFullYear();
  }
  return paymentDate.getFullYear();
};

const createPaymentNumber = async (paymentDateValue) => {
  const paymentYear = getPaymentYear(paymentDateValue);
  const counterKey = `payments:${paymentYear}`;
  const counter = await Counter.findOneAndUpdate(
    { key: counterKey },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return `PAY-${paymentYear}-${String(counter.seq).padStart(2, "0")}`;
};

const getPurchasePaidTotal = async (purchaseId) => {
  const result = await Payment.aggregate([
    { $match: { refType: "purchase", refId: new mongoose.Types.ObjectId(purchaseId) } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  return toNumber(result[0]?.total);
};

const createPayment = async (req, res) => {
  try {
    const amount = toNumber(req.body.amount, NaN);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ message: "Valid amount is required" });
    }

    const refType = ["purchase", "none"].includes(String(req.body.refType || "none"))
      ? String(req.body.refType || "none")
      : "none";

    let resolvedRefId = null;
    let resolvedParty = req.body.party || null;

    if (refType === "purchase") {
      if (!req.body.refId || !mongoose.Types.ObjectId.isValid(req.body.refId)) {
        return res.status(400).json({ message: "Valid purchase id is required" });
      }

      const purchase = await Purchase.findById(req.body.refId);
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

      const paidAmount = await getPurchasePaidTotal(purchase._id);
      const pendingAmount = Math.max(0, toNumber(purchase.totalAmount) - paidAmount);
      if (amount > pendingAmount) {
        return res.status(400).json({ message: "Amount exceeds purchase pending amount" });
      }

      resolvedRefId = purchase._id;
      resolvedParty = resolvedParty || purchase.party || null;
    }

    const paymentNumber = await createPaymentNumber(req.body.paymentDate);
    const payment = await Payment.create({
      party: resolvedParty,
      refType,
      refId: resolvedRefId,
      originPurchaseId: null,
      amount,
      paymentNumber,
      method: String(req.body.method || "Cash Account").trim() || "Cash Account",
      paymentDate: req.body.paymentDate ? new Date(req.body.paymentDate) : new Date(),
      notes: String(req.body.notes || "").trim(),
      paymentSource: "manual",
    });

    const savedPayment = await Payment.findById(payment._id).populate("party", "name");
    return res.status(201).json({ data: savedPayment });
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create payment",
      error: error.message,
    });
  }
};

const getAllPayments = async (req, res) => {
  try {
    const filter = {};
    const normalizedSearch = String(req.query.search || "").trim();
    const normalizedFromDate = String(req.query.fromDate || "").trim();

    if (normalizedFromDate) {
      const parsedFromDate = new Date(normalizedFromDate);
      if (!Number.isNaN(parsedFromDate.getTime())) {
        filter.paymentDate = { $gte: parsedFromDate };
      }
    }

    let query = Payment.find(filter).populate("party", "name");

    if (normalizedSearch) {
      query = query.find({
        $or: [
          { paymentNumber: { $regex: normalizedSearch, $options: "i" } },
          { notes: { $regex: normalizedSearch, $options: "i" } },
          { method: { $regex: normalizedSearch, $options: "i" } },
        ],
      });
    }

    const payments = await query.sort({ paymentDate: -1, createdAt: -1 });
    return res.json({ data: payments });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch payments",
      error: error.message,
    });
  }
};

module.exports = {
  createPayment,
  getAllPayments,
};
