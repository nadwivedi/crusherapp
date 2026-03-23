const mongoose = require("mongoose");
const Sales = require("../models/Sales");
const Counter = require("../models/Counter");
const Receipt = require("../models/Receipt");

const SALE_TYPES = {
  SALE: "sale",
  CREDIT: "credit sale",
  CASH: "cash sale",
};

const AUTO_RECEIPT_SOURCES = ["sale-payment", "sale-excess-payment"];

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getNextReceiptNumber = async () => {
  const lastEntry = await Receipt.findOne().sort({ receiptNumber: -1 }).select("receiptNumber");
  return Math.max(1, Number(lastEntry?.receiptNumber || 0) + 1);
};

const getSalePaymentBreakdown = (totalAmountValue, paidAmountValue) => {
  const totalAmount = Math.max(0, toNumber(totalAmountValue));
  const paidAmount = Math.max(0, toNumber(paidAmountValue));
  const appliedAmount = Math.min(totalAmount, paidAmount);
  const pendingAmount = Math.max(0, totalAmount - paidAmount);
  const excessAmount = Math.max(0, paidAmount - totalAmount);

  let type = SALE_TYPES.CREDIT;
  if (paidAmount <= 0) {
    type = SALE_TYPES.CREDIT;
  } else if (paidAmount === totalAmount) {
    type = SALE_TYPES.CASH;
  } else {
    type = SALE_TYPES.SALE;
  }

  return {
    totalAmount,
    paidAmount,
    appliedAmount,
    pendingAmount,
    excessAmount,
    type,
  };
};

const syncSaleAutoReceipts = async (saleDoc) => {
  const breakdown = getSalePaymentBreakdown(saleDoc.totalAmount, saleDoc.paidAmount);

  await Receipt.deleteMany({
    originSaleId: saleDoc._id,
    receiptSource: { $in: AUTO_RECEIPT_SOURCES },
  });

  if (breakdown.appliedAmount > 0 && breakdown.appliedAmount < breakdown.totalAmount) {
    await Receipt.create({
      party: saleDoc.partyId || null,
      refType: "sale",
      refId: saleDoc._id,
      originSaleId: saleDoc._id,
      amount: breakdown.appliedAmount,
      receiptNumber: await getNextReceiptNumber(),
      method: "Cash Account",
      receiptDate: saleDoc.saleDate || new Date(),
      notes: `Auto receipt for ${saleDoc.invoiceNumber || "sale payment"}`,
      receiptSource: "sale-payment",
    });
  }

  if (breakdown.excessAmount > 0) {
    await Receipt.create({
      party: saleDoc.partyId || null,
      refType: "none",
      refId: null,
      originSaleId: saleDoc._id,
      amount: breakdown.excessAmount,
      receiptNumber: await getNextReceiptNumber(),
      method: "Cash Account",
      receiptDate: saleDoc.saleDate || new Date(),
      notes: `Auto excess receipt for ${saleDoc.invoiceNumber || "sale payment"}`,
      receiptSource: "sale-excess-payment",
    });
  }

  return breakdown;
};

const getInvoiceYear = (saleDateValue) => {
  const saleDate = saleDateValue ? new Date(saleDateValue) : new Date();
  if (Number.isNaN(saleDate.getTime())) {
    return new Date().getFullYear();
  }
  return saleDate.getFullYear();
};

const createInvoiceNumber = async (saleDateValue) => {
  const invoiceYear = getInvoiceYear(saleDateValue);
  const counterKey = `sales:${invoiceYear}`;
  const counter = await Counter.findOneAndUpdate(
    { key: counterKey },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return `INV-${invoiceYear}-${String(counter.seq).padStart(4, "0")}`;
};

const createSales = async (req, res) => {
  try {
    const breakdown = getSalePaymentBreakdown(req.body.totalAmount, req.body.paidAmount);
    const payload = {
      ...req.body,
      saleDate: req.body.saleDate || new Date(),
      invoiceNumber: await createInvoiceNumber(req.body.saleDate),
      paidAmount: breakdown.paidAmount,
      type: breakdown.type,
    };

    const sales = await Sales.create(payload);
    await syncSaleAutoReceipts(sales);
    return res.status(201).json(sales);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to create sales",
      error: error.message,
    });
  }
};

const getAllSales = async (_req, res) => {
  try {
    const sales = await Sales.find().sort({ createdAt: -1 });
    return res.json(sales);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch sales",
      error: error.message,
    });
  }
};

const getSalesById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid sales id" });
  }

  try {
    const sales = await Sales.findById(id);

    if (!sales) {
      return res.status(404).json({ message: "Sales not found" });
    }

    return res.json(sales);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch sales",
      error: error.message,
    });
  }
};

const editSales = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid sales id" });
  }

  try {
    const sales = await Sales.findById(id);

    if (!sales) {
      return res.status(404).json({ message: "Sales not found" });
    }

    const updatePayload = { ...req.body };
    delete updatePayload.invoiceNumber;

    const nextTotalAmount = Object.prototype.hasOwnProperty.call(updatePayload, "totalAmount")
      ? updatePayload.totalAmount
      : sales.totalAmount;
    const nextPaidAmount = Object.prototype.hasOwnProperty.call(updatePayload, "paidAmount")
      ? updatePayload.paidAmount
      : sales.paidAmount;
    const breakdown = getSalePaymentBreakdown(nextTotalAmount, nextPaidAmount);

    Object.assign(sales, updatePayload, {
      paidAmount: breakdown.paidAmount,
      type: breakdown.type,
    });

    await sales.save();
    await syncSaleAutoReceipts(sales);

    return res.json(sales);
  } catch (error) {
    return res.status(400).json({
      message: "Failed to update sales",
      error: error.message,
    });
  }
};

const deleteSales = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid sales id" });
  }

  try {
    const sales = await Sales.findByIdAndDelete(id);

    if (!sales) {
      return res.status(404).json({ message: "Sales not found" });
    }

    await Receipt.deleteMany({
      originSaleId: sales._id,
      receiptSource: { $in: AUTO_RECEIPT_SOURCES },
    });

    return res.json({ message: "Sales deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to delete sales",
      error: error.message,
    });
  }
};

module.exports = {
  createSales,
  getAllSales,
  getSalesById,
  editSales,
  deleteSales,
};
