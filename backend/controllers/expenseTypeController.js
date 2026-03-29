const mongoose = require("mongoose");
const ExpenseType = require("../models/ExpenseType");
const Expense = require("../models/Expense");

const isDuplicateExpenseTypeNameError = (error) => (
  error?.code === 11000 && (
    Object.prototype.hasOwnProperty.call(error?.keyPattern || {}, "userId") ||
    Object.prototype.hasOwnProperty.call(error?.keyValue || {}, "name")
  )
);

const createExpenseType = async (req, res) => {
  try {
    const { name, description, type, unit, currentStock } = req.body;
    const userId = req.userId;

    if (!String(name || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Expense type name is required",
      });
    }

    const expenseType = await ExpenseType.create({
      userId,
      name: String(name || "").trim(),
      description: String(description || "").trim(),
      type: String(type || "services").trim().toLowerCase(),
      unit: String(unit || "").trim(),
      currentStock: Number(currentStock || 0),
    });

    return res.status(201).json({
      success: true,
      message: "Expense type created successfully",
      data: expenseType,
    });
  } catch (error) {
    if (isDuplicateExpenseTypeNameError(error)) {
      return res.status(400).json({
        success: false,
        message: "Expense type name already exists for this user",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Error creating expense type",
    });
  }
};

const getAllExpenseTypes = async (req, res) => {
  try {
    const { search } = req.query;
    const userId = req.userId;
    const filter = { userId };

    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
      ];
    }

    const expenseTypes = await ExpenseType.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: expenseTypes.length,
      data: expenseTypes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error fetching expense types",
    });
  }
};

const updateExpenseType = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const { name, description, type, unit, currentStock } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid expense type id is required",
      });
    }

    if (!String(name || "").trim()) {
      return res.status(400).json({
        success: false,
        message: "Expense type name is required",
      });
    }

    const expenseType = await ExpenseType.findOneAndUpdate(
      { _id: id, userId },
      {
        name: String(name || "").trim(),
        description: String(description || "").trim(),
        type: String(type || "services").trim().toLowerCase(),
        unit: String(unit || "").trim(),
        currentStock: Number(currentStock || 0),
      },
      { new: true, runValidators: true }
    );

    if (!expenseType) {
      return res.status(404).json({
        success: false,
        message: "Expense type not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense type updated successfully",
      data: expenseType,
    });
  } catch (error) {
    if (isDuplicateExpenseTypeNameError(error)) {
      return res.status(400).json({
        success: false,
        message: "Expense type name already exists for this user",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Error updating expense type",
    });
  }
};

const deleteExpenseType = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid expense type id is required",
      });
    }

    const expenseType = await ExpenseType.findOne({ _id: id, userId });
    if (!expenseType) {
      return res.status(404).json({
        success: false,
        message: "Expense type not found",
      });
    }

    const linkedExpenses = await Expense.countDocuments({ userId, expenseGroup: id });
    if (linkedExpenses > 0) {
      return res.status(400).json({
        success: false,
        message: "This expense type is used in expenses. Cannot delete.",
      });
    }

    await ExpenseType.deleteOne({ _id: id, userId });

    return res.status(200).json({
      success: true,
      message: "Expense type deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Error deleting expense type",
    });
  }
};

module.exports = {
  createExpenseType,
  getAllExpenseTypes,
  updateExpenseType,
  deleteExpenseType,
};
