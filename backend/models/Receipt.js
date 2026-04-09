const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    party: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      default: null,
    },
    refType: {
      type: String,
      enum: ["sale", "none"],
      default: "none",
      trim: true,
      lowercase: true,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sales",
      default: null,
    },
    originSaleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sales",
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    receiptNumber: {
      type: Number,
      min: 1,
      required: true,
    },
    method: {
      type: String,
      trim: true,
      default: "Cash Account",
    },
    receiptDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    receiptSource: {
      type: String,
      enum: ["manual", "sale-payment", "sale-excess-payment"],
      default: "manual",
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

receiptSchema.index({ userId: 1, receiptNumber: 1 }, { unique: true });
receiptSchema.index({ userId: 1, receiptDate: -1, createdAt: -1 });

module.exports = mongoose.models.Receipt || mongoose.model("Receipt", receiptSchema);
