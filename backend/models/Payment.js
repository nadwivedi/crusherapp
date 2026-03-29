const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    party: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      default: null,
    },
    refType: {
      type: String,
      enum: ["purchase", "none"],
      default: "none",
      trim: true,
      lowercase: true,
    },
    refId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      default: null,
    },
    originPurchaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      default: null,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    paymentNumber: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    method: {
      type: String,
      trim: true,
      default: "Cash Account",
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    paymentSource: {
      type: String,
      enum: ["manual", "purchase-payment", "purchase-excess-payment"],
      default: "manual",
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
