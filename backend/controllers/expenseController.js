const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const ExpenseGroup = require("../models/ExpenseGroup");
const Party = require("../models/Party");
const Counter = require("../models/Counter");

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const getExpenseYear = (expenseDateValue) => {
  const expenseDate = expenseDateValue ? new Date(expenseDateValue) : new Date();
  if (Number.isNaN(expenseDate.getTime())) {
    return new Date().getFullYear();
  }
  return expenseDate.getFullYear();
};

const createExpenseNumber = async (expenseDateValue) => {
  const expenseYear = getExpenseYear(expenseDateValue);
  const counterKey = `expenses:${expenseYear}`;
  const counter = await Counter.findOneAndUpdate(
    { key: counterKey },
    { $inc: { seq: 1 } },
    {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    }
  );

  return `EXP-${expenseYear}-${String(counter.seq).padStart(2, "0")}`;
};

const createExpense = async (req, res) => {
  try {
    const {
      expenseGroup,
      party,
      amount,
      quantity,
      unit,
      unitPrice,
      method,
      expenseDate,
      notes,
    } = req.body;
    const userId = req.userId;

    const amountNumber = toNumber(amount, NaN);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    if (!expenseGroup || !mongoose.isValidObjectId(expenseGroup)) {
      return res.status(400).json({
        success: false,
        message: "Valid expense group is required",
      });
    }

    const existingExpenseGroup = await ExpenseGroup.findOne({ _id: expenseGroup, userId });
    if (!existingExpenseGroup) {
      return res.status(404).json({
        success: false,
        message: "Expense group not found",
      });
    }

    const isGoodsExpense = String(existingExpenseGroup.type || "").toLowerCase() === "goods";
    const quantityNumber = quantity === undefined ? null : toNumber(quantity, NaN);
    const unitPriceNumber = unitPrice === undefined ? null : toNumber(unitPrice, NaN);

    if (isGoodsExpense) {
      if (!Number.isFinite(quantityNumber) || quantityNumber <= 0) {
        return res.status(400).json({
          success: false,
          message: "Valid quantity is required for goods expense",
        });
      }

      if (!Number.isFinite(unitPriceNumber) || unitPriceNumber < 0) {
        return res.status(400).json({
          success: false,
          message: "Valid unit price is required for goods expense",
        });
      }
    }

    let resolvedParty = null;
    if (party) {
      if (!mongoose.isValidObjectId(party)) {
        return res.status(400).json({
          success: false,
          message: "Invalid party id",
        });
      }

      const existingParty = await Party.findById(party);
      if (!existingParty) {
        return res.status(404).json({
          success: false,
          message: "Party not found",
        });
      }

      resolvedParty = existingParty._id;
    }

    const expense = await Expense.create({
      userId,
      expenseGroup: existingExpenseGroup._id,
      expenseNumber: await createExpenseNumber(expenseDate),
      party: resolvedParty,
      amount: amountNumber,
      quantity: isGoodsExpense ? quantityNumber : null,
      unit: isGoodsExpense ? String(unit || existingExpenseGroup.unit || "").trim() : "",
      unitPrice: isGoodsExpense ? unitPriceNumber : null,
      method: method || "cash",
      expenseDate: expenseDate || new Date(),
      notes: String(notes || "").trim(),
    });

    const savedExpense = await Expense.findById(expense._id)
      .populate("expenseGroup", "name")
      .populate("party", "name type");

    return res.status(201).json({
      success: true,
      message: "Expense created successfully",
      data: savedExpense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error creating expense",
    });
  }
};

const getAllExpenses = async (req, res) => {
  try {
    const { search, fromDate, expenseGroup, party } = req.query;
    const userId = req.userId;
    const filter = { userId };

    if (expenseGroup && mongoose.isValidObjectId(expenseGroup)) {
      filter.expenseGroup = expenseGroup;
    }

    if (party && mongoose.isValidObjectId(party)) {
      filter.party = party;
    }

    if (fromDate) {
      const parsedFromDate = new Date(fromDate);
      if (!Number.isNaN(parsedFromDate.getTime())) {
        filter.expenseDate = { $gte: parsedFromDate };
      }
    }

    let expenses = await Expense.find(filter)
      .populate("expenseGroup", "name")
      .populate("party", "name type")
      .sort({ expenseDate: -1, createdAt: -1 });

    if (search) {
      const normalizedSearch = String(search || "").trim().toLowerCase();
      expenses = expenses.filter((expense) => {
        const values = [
          expense.expenseGroup?.name,
          expense.party?.name,
          expense.method,
          expense.notes,
        ];

        return values.some((value) => String(value || "").toLowerCase().includes(normalizedSearch));
      });
    }

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching expenses",
    });
  }
};

module.exports = {
  createExpense,
  getAllExpenses,
};
