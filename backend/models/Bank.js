const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    totalBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

bankSchema.index({ name: 1 }, { unique: true });

module.exports = mongoose.models.Bank || mongoose.model("Bank", bankSchema);
