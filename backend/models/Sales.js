const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema(
  {
    partyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Party",
      required: true,
    },
    vehicleNo: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    invoiceNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
    saleTime: {
      type: String,
      trim: true,
      default: "",
    },
    stoneSize: {
      type: String,
      required: true,
      enum: ["60mm", "40mm", "20mm", "10mm", "6mm", "4mm", "dust", "wmm", "gsb"],
      lowercase: true,
      trim: true,
    },

    grossWeight: {
      type: Number,
      default: 0,
      min: 0,
    },

    tareWeight: {
      type: Number,
      default: 0,
      min: 0,
    },

    netWeight: {
      type: Number,
      default: 0,
      min: 0,
    },
    rate: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    type: {
      type: String,
      enum: ["sale", "cash sale", "credit sale"],
      default: "credit sale",
      trim: true,
    },
    slipImg: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Sales || mongoose.model("Sales", salesSchema);
