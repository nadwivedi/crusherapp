const mongoose = require("mongoose");

const expenseItemSchema = new mongoose.Schema(
  {
    expenseGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseGroup",
      required: true,
    },
    expenseGroupName: {
      type: String,
      trim: true,
      default: "",
    },
    quantity: {
      type: Number,
      required: true,
      min: 0.01,
    },
    unit: {
      type: String,
      trim: true,
      default: "",
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0.01,
    },
  },
  { _id: false }
);

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expenseGroup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseGroup",
      required: true,
    },
    expenseNumber: {
      type: String,
      trim: true,
      default: "",
    },
    party: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    quantity: {
      type: Number,
      default: null,
      min: 0,
    },
    unit: {
      type: String,
      trim: true,
      default: "",
    },
    unitPrice: {
      type: Number,
      default: null,
      min: 0,
    },
    items: {
      type: [expenseItemSchema],
      default: [],
    },
    method: {
      type: String,
      enum: ["cash", "bank", "upi", "card", "credit", "other"],
      default: "cash",
      trim: true,
      lowercase: true,
    },
    expenseDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
